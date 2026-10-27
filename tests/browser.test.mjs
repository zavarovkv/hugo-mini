import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const init = readFileSync(new URL('../assets/js/theme-init.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');

function element(attributes = {}) {
  const classes = new Set();
  return Object.assign(new EventTarget(), {
    classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c) },
    getAttribute: (name) => attributes[name] ?? null,
    setAttribute: (name, value) => { attributes[name] = value; },
    querySelectorAll: () => [],
    focus() { this.focused = true; },
  });
}

function page({ saved, blocked = false, dark = false, mobile = true, math = false, ascii, reduced = false } = {}) {
  const root = element();
  const body = element({ 'data-back-to-top': 'false', 'data-math': String(math) });
  const toggle = element();
  const nav = element();
  const content = element();
  const system = Object.assign(new EventTarget(), { matches: dark });
  const viewport = Object.assign(new EventTarget(), { matches: mobile });
  const motion = Object.assign(new EventTarget(), { matches: reduced });
  const art = ascii === undefined ? null : Object.assign(element(), { textContent: ascii });
  const intervals = new Map();
  let intervalID = 0;
  const document = Object.assign(new EventTarget(), {
    documentElement: root, body, readyState: 'complete',
    querySelector: (selector) => ({ '.mobile-menu-toggle': toggle, '.main-nav': nav, main: content, '[data-ascii-animation]': art })[selector] || null,
    querySelectorAll: () => [], getElementById: () => null,
  });
  const window = Object.assign(new EventTarget(), {
    document, navigator: {}, setTimeout, clearTimeout, scrollTo() {},
    setInterval: (callback) => { intervals.set(++intervalID, callback); return intervalID; },
    clearInterval: (id) => intervals.delete(id),
    localStorage: { getItem() { if (blocked) throw new Error('Storage blocked'); return saved; } },
    matchMedia: (query) => query.includes('prefers-color-scheme') ? system : query.includes('reduced-motion') ? motion : viewport,
  });
  window.window = window;
  runInNewContext(init, window);
  return { window, document, root, body, toggle, nav, content, system, viewport, art, motion, intervals, start: () => runInNewContext(main, window) };
}

test('first paint resolves a saved or system scheme even with blocked storage', () => {
  for (const [options, expected] of [
    [{ saved: 'light', dark: true }, 'light'], [{ saved: 'dark' }, 'dark'],
    [{ saved: 'invalid', dark: true }, 'dark'], [{ blocked: true, dark: true }, 'dark'], [{ blocked: true }, 'light'],
  ]) assert.equal(page(options).root.getAttribute('data-theme'), expected);
});

test('an invalid saved value does not prevent following the system scheme', () => {
  const p = page({ saved: 'invalid' });
  p.start();
  p.system.matches = true;
  p.system.dispatchEvent(new Event('change'));
  assert.equal(p.root.getAttribute('data-theme'), 'dark');
});

test('the mobile menu resets on a desktop breakpoint and stays closed on return', () => {
  const p = page();
  p.start();
  p.toggle.dispatchEvent(new Event('click'));
  assert.equal(p.toggle.getAttribute('aria-expanded'), 'true');
  assert.ok(p.body.classList.contains('menu-open'));
  p.viewport.matches = false;
  p.viewport.dispatchEvent(new Event('change'));
  assert.equal(p.toggle.getAttribute('aria-expanded'), 'false');
  for (const node of [p.root, p.body]) assert.ok(!node.classList.contains('menu-open'));
  assert.ok(!p.nav.classList.contains('active'));
  p.viewport.matches = true;
  p.viewport.dispatchEvent(new Event('change'));
  assert.equal(p.toggle.getAttribute('aria-expanded'), 'false');
  p.toggle.dispatchEvent(new Event('click'));
  const escape = new Event('keydown');
  Object.defineProperty(escape, 'key', { value: 'Escape' });
  p.document.dispatchEvent(escape);
  assert.ok(p.toggle.focused);
});

test('math renders inside main only on opted-in pages, with a safe missing-library fallback', () => {
  for (const math of [false, true]) {
    const p = page({ math });
    const calls = [];
    p.window.renderMathInElement = (node, options) => calls.push({ node, options });
    p.start();
    assert.equal(calls.length, Number(math));
    if (math) {
      assert.equal(calls[0].node, p.content);
      assert.deepEqual(Array.from(calls[0].options.delimiters, ({ left }) => left), ['$$', '$', '\\[', '\\(']);
    }
  }
  assert.doesNotThrow(() => page({ math: true }).start());
});

test('the ASCII scan preserves the silhouette and stops for reduced motion or hidden tabs', () => {
  const source = '   _._\n  /   \\';
  const p = page({ ascii: source });
  p.window.Math = Object.assign(Object.create(Math), { random: () => 0 });
  p.start();
  assert.equal(p.intervals.size, 1);
  p.intervals.values().next().value();
  assert.notEqual(p.art.textContent, source);
  assert.equal(p.art.textContent.replace(/\S/g, 'x'), source.replace(/\S/g, 'x'));
  p.motion.matches = true;
  p.motion.dispatchEvent(new Event('change'));
  assert.equal(p.intervals.size, 0);
  assert.equal(p.art.textContent, source);
  p.motion.matches = false;
  p.motion.dispatchEvent(new Event('change'));
  assert.equal(p.intervals.size, 1);
  p.document.hidden = true;
  p.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(p.intervals.size, 0);
  assert.equal(p.art.textContent, source);
  const reduced = page({ ascii: source, reduced: true });
  reduced.start();
  assert.equal(reduced.intervals.size, 0);
  assert.equal(reduced.art.textContent, source);
});

function missingPage({ pathname, currentPrefix, lang = 'ru', dark = false, alternatives }) {
  const p = page({ dark });
  p.root.lang = lang;
  p.window.URL = URL;
  p.window.location = Object.freeze({ pathname, href: `https://example.org${pathname}?q=1#part`, origin: 'https://example.org' });
  p.window.fetch = () => { throw new Error('404 localization must not fetch another page'); };
  const regions = Object.fromEntries(['header', 'main', 'footer'].map((name) => [name, element()]));
  const button = element();
  for (const name of Object.keys(regions)) regions[name].replaceWith = (node) => { regions[name] = node; };
  const variants = alternatives.map(({ prefix, lang, origin = 'https://example.org' }) => {
    const ui = element({ 'data-not-found-ui': JSON.stringify({ toDark: `dark-${lang}`, toLight: `light-${lang}` }) });
    const translated = Object.fromEntries(Object.keys(regions).map((name) => [name, {
      cloneNode: () => Object.assign(element(), { lang, home: prefix }),
    }]));
    return Object.assign(element({
      'data-not-found-prefix': prefix,
      'data-not-found-language': lang,
      'data-not-found-url': `${origin}${prefix}404.html`,
      'data-not-found-title': `404 | ${lang}`,
      'data-not-found-description': `Missing page (${lang})`,
    }), {
      content: { querySelector: (selector) => translated[selector] || (selector === '[data-not-found-ui]' ? ui : null) },
      remove() { this.removed = true; },
    });
  });
  const find = p.document.querySelector;
  p.document.querySelector = (selector) => selector === '[data-not-found-prefix]'
    ? element({ 'data-not-found-prefix': currentPrefix })
    : selector === '.theme-toggle' ? button : regions[selector] || find(selector);
  p.document.querySelectorAll = (selector) => selector === 'template[data-not-found-language]' ? variants : [];
  return { ...p, regions, variants, button };
}

test('a root 404 selects translated content and controls without changing the missing URL', () => {
  for (const base of ['/', '/sub/']) for (const dark of [false, true]) {
    const prefix = `${base}en/`;
    for (const pathname of [`${prefix}missing/page/`, prefix.slice(0, -1)]) {
      const p = missingPage({ pathname, currentPrefix: base, dark, alternatives: [{ prefix, lang: 'en' }] });
      const href = p.window.location.href;
      p.start();
      assert.equal(p.root.lang, 'en');
      assert.equal(p.document.title, '404 | en');
      for (const region of Object.values(p.regions)) {
        assert.equal(region.lang, 'en');
        assert.equal(region.home, prefix);
      }
      assert.equal(p.button.getAttribute('aria-label'), `${dark ? 'light' : 'dark'}-en`, 'controls initialize after selecting the translated strings');
      assert.equal(p.root.getAttribute('data-theme'), dark ? 'dark' : 'light');
      assert.equal(p.window.location.href, href);
      assert.ok(p.variants.every((variant) => variant.removed));
    }
  }
});

test('404 language matching respects path boundaries, specificity, and language domains', () => {
  for (const options of [
    { pathname: '/english/missing/', currentPrefix: '/', lang: 'ru', alternatives: [{ prefix: '/en/', lang: 'en' }] },
    { pathname: '/en/404.html', currentPrefix: '/en/', lang: 'en', alternatives: [{ prefix: '/', lang: 'ru' }] },
    { pathname: '/en/missing/', currentPrefix: '/', lang: 'ru', alternatives: [{ prefix: '/en/', lang: 'en', origin: 'https://other.example' }] },
  ]) {
    const p = missingPage(options);
    p.start();
    assert.equal(p.root.lang, options.lang);
    assert.ok(Object.values(p.regions).every((node) => !node.lang));
  }
  const p = missingPage({ pathname: '/sub/en/us/missing/', currentPrefix: '/sub/', alternatives: [
    { prefix: '/sub/en/', lang: 'en' }, { prefix: '/sub/en/us/', lang: 'en-us' },
  ] });
  p.start();
  assert.equal(p.root.lang, 'en-us');
});
