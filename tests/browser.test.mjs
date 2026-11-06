import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const init = readFileSync(new URL('../assets/js/theme-init.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');

function element(attributes = {}) {
  const classes = new Set();
  return Object.assign(new EventTarget(), {
    classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c), toggle: (c) => classes.has(c) ? classes.delete(c) : classes.add(c) },
    getAttribute: (name) => attributes[name] ?? null,
    setAttribute: (name, value) => { attributes[name] = value; },
    style: { top: '' },
    querySelectorAll: () => [],
    contains(node) { return node === this; },
    focus() { this.focused = true; },
  });
}

function page({ saved, blocked = false, dark = false, mobile = true, math = false, ascii, reduced = false, scrollY = 0 } = {}) {
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
  const scrollCalls = [];
  let intervalID = 0;
  const document = Object.assign(new EventTarget(), {
    documentElement: root, body, readyState: 'complete',
    querySelector: (selector) => ({ '.mobile-menu-toggle': toggle, '.main-nav': nav, main: content, '[data-ascii-animation]': art })[selector] || null,
    querySelectorAll: () => [], getElementById: () => null,
  });
  const window = Object.assign(new EventTarget(), {
    document, navigator: {}, setTimeout, clearTimeout, scrollY, pageYOffset: scrollY,
    scrollTo(x, y) { scrollCalls.push([x, y]); this.scrollY = y; this.pageYOffset = y; },
    setInterval: (callback) => { intervals.set(++intervalID, callback); return intervalID; },
    clearInterval: (id) => intervals.delete(id),
    localStorage: { getItem() { if (blocked) throw new Error('Storage blocked'); return saved; } },
    matchMedia: (query) => query.includes('prefers-color-scheme') ? system : query.includes('reduced-motion') ? motion : viewport,
  });
  window.window = window;
  runInNewContext(init, window);
  return { window, document, root, body, toggle, nav, content, system, viewport, art, motion, intervals, scrollCalls, start: () => runInNewContext(main, window) };
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
  assert.ok(!p.nav.classList.contains('menu-ready'));
  p.start();
  assert.ok(p.nav.classList.contains('menu-ready'));
  assert.ok(p.toggle.classList.contains('menu-ready'));
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

test('opening and closing the mobile menu preserves the reading position', () => {
  const p = page({ scrollY: 847 });
  p.start();
  p.toggle.dispatchEvent(new Event('click'));
  assert.equal(p.body.style.top, '-847px');
  assert.deepEqual(p.scrollCalls, [], 'opening must not jump to the top');

  p.toggle.dispatchEvent(new Event('click'));
  assert.equal(p.body.style.top, '');
  assert.deepEqual(p.scrollCalls, [[0, 847]]);

  p.window.scrollY = 1325;
  p.window.pageYOffset = 1325;
  p.toggle.dispatchEvent(new Event('click'));
  p.viewport.matches = false;
  p.viewport.dispatchEvent(new Event('change'));
  assert.equal(p.body.style.top, '');
  assert.deepEqual(p.scrollCalls.at(-1), [0, 1325], 'resizing must also restore scroll');
});

test('leaving the expanded navigation closes it without stealing focus from the page', () => {
  const p = page();
  const link = element();
  p.nav.contains = (node) => node === p.nav || node === link;
  p.start();
  p.toggle.dispatchEvent(new Event('click'));
  function focus(target) {
    const event = new Event('focusin');
    Object.defineProperty(event, 'target', { value: target });
    p.document.dispatchEvent(event);
  }
  focus(link);
  assert.equal(p.toggle.getAttribute('aria-expanded'), 'true');
  focus(p.toggle);
  assert.equal(p.toggle.getAttribute('aria-expanded'), 'true');
  focus(p.content);
  assert.equal(p.toggle.getAttribute('aria-expanded'), 'false');
  assert.ok(!p.body.classList.contains('menu-open'));
  assert.ok(!p.toggle.focused, 'Tab should continue to the newly focused page element');
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

test('copying highlighted code excludes inline and table line numbers', async () => {
  const source = 'if ready:\n    print("<hello> & goodbye")';
  for (const mode of ['plain', 'inline', 'table']) {
    const p = page();
    const copied = [];
    let button;
    p.window.navigator.clipboard = { writeText: async (value) => { copied.push(value); } };
    p.window.setTimeout = () => 1;
    p.document.createElement = () => Object.assign(element(), {
      querySelector: () => element(),
    });
    const lines = [
      { textContent: '1if ready:\n', lastElementChild: { textContent: 'if ready:\n' } },
      { textContent: '2    print("<hello> & goodbye")', lastElementChild: { textContent: '    print("<hello> & goodbye")' } },
    ];
    const code = {
      textContent: mode === 'inline' ? '1if ready:\n2    print("<hello> & goodbye")' : source,
      querySelectorAll: () => mode === 'plain' ? [] : lines,
    };
    const block = {
      querySelector: (selector) => selector === 'code[data-lang]' ? code : (mode === 'table' ? { textContent: '1\n2\n' } : code),
      appendChild: (node) => { button = node; },
    };
    p.document.querySelectorAll = (selector) => selector === '.highlight' ? [block] : [];
    p.start();
    assert.ok(button, `${mode}: copy button is present`);
    button.dispatchEvent(new Event('click'));
    await Promise.resolve();
    assert.deepEqual(copied, [source], `${mode}: only the original text is copied`);
  }
});

test('mobile heading links remain available when the Clipboard API is absent', () => {
  const p = page();
  const heading = element();
  const anchor = Object.assign(element({ 'aria-label': 'Link to section' }), {
    parentElement: heading, contains: () => false,
  });
  p.document.querySelectorAll = (selector) => selector === '.heading-anchor' ? [anchor] : [];
  p.start();
  heading.dispatchEvent(new Event('click'));
  assert.ok(heading.classList.contains('anchor-visible'));
  const click = new Event('click', { cancelable: true });
  anchor.dispatchEvent(click);
  assert.equal(click.defaultPrevented, false, 'native fragment navigation must remain available');
  heading.dispatchEvent(new Event('click'));
  assert.ok(!heading.classList.contains('anchor-visible'));
});

test('back-to-top stays out of keyboard navigation until it is visible', () => {
  const p = page();
  let control;
  p.body.setAttribute('data-back-to-top', 'true');
  p.body.getBoundingClientRect = () => ({ left: 200 });
  p.body.appendChild = (node) => { control = node; };
  p.document.createElement = () => Object.assign(element(), { style: {}, appendChild() {} });
  p.document.createTextNode = (text) => ({ textContent: text });
  p.window.pageYOffset = 0;
  p.window.scroll = () => { p.window.pageYOffset = 0; };
  p.start();
  assert.equal(control.getAttribute('tabindex'), '-1');
  assert.equal(control.getAttribute('aria-hidden'), 'true');
  assert.equal(control.getAttribute('role'), null, 'use native link keyboard semantics');
  p.window.pageYOffset = 800;
  p.window.dispatchEvent(new Event('scroll'));
  assert.equal(control.getAttribute('tabindex'), '0');
  assert.equal(control.getAttribute('aria-hidden'), 'false');
  assert.ok(control.classList.contains('shown'));
  control.dispatchEvent(new Event('click'));
  assert.equal(p.window.pageYOffset, 0);
  assert.equal(control.getAttribute('tabindex'), '-1');
  assert.ok(!control.classList.contains('shown'));
});

test('reading progress follows only the article and coalesces scroll updates', () => {
  const p = page();
  const frames = [];
  const fill = Object.assign(element(), { style: {} });
  const bar = Object.assign(element({ 'aria-valuenow': '0' }), {
    hidden: true,
    querySelector: (selector) => selector === '.reading-progress-fill' ? fill : null,
  });
  const top = 200;
  let height = 2400;
  const article = {
    getBoundingClientRect: () => ({
      top: top - p.window.scrollY,
      bottom: top + height - p.window.scrollY,
      height,
    }),
  };
  const query = p.document.querySelector;
  p.document.querySelector = (selector) => selector === '[data-reading-progress]' ? bar
    : selector === 'main article' ? article : query(selector);
  p.window.innerHeight = 800;
  p.window.requestAnimationFrame = (callback) => { frames.push(callback); return frames.length; };
  p.start();

  assert.equal(bar.hidden, false);
  assert.equal(bar.getAttribute('aria-valuenow'), '0');
  assert.equal(fill.style.transform, 'scaleX(0)');
  assert.equal(bar.classList.contains('is-reading'), false, 'mobile surface should not cover the header');

  p.window.scrollY = 1000;
  p.window.dispatchEvent(new Event('scroll'));
  p.window.dispatchEvent(new Event('scroll'));
  assert.equal(frames.length, 1, 'rapid scroll events share one animation frame');
  frames.shift()();
  assert.equal(fill.style.transform, 'scaleX(0.5)');
  assert.equal(bar.getAttribute('aria-valuenow'), '50');
  assert.equal(bar.classList.contains('is-reading'), true);

  p.window.scrollY = 1800;
  p.window.dispatchEvent(new Event('scroll'));
  frames.shift()();
  assert.equal(fill.style.transform, 'scaleX(1)', 'progress ends with the last article line');
  assert.equal(bar.getAttribute('aria-valuenow'), '100');

  p.window.scrollY = 0;
  p.window.dispatchEvent(new Event('scroll'));
  frames.shift()();
  assert.equal(bar.classList.contains('is-reading'), false, 'returning above the article uncovers the header');

  height = 900;
  p.window.dispatchEvent(new Event('resize'));
  frames.shift()();
  assert.equal(bar.hidden, true, 'hide on viewports taller than the article');
});

test('a failed Mermaid download restores every diagram source', async () => {
  const p = page();
  const sources = ['graph TD; A-->B', 'sequenceDiagram\nA->>B: Hello'];
  const diagrams = sources.map((textContent) => ({ textContent, style: {} }));
  p.body.setAttribute('data-mermaid', JSON.stringify({ src: '/missing-mermaid.js' }));
  p.document.querySelectorAll = (selector) => selector === '.mermaid' ? diagrams : [];
  p.document.createElement = () => ({});
  p.document.head = { appendChild: (script) => script.onerror(new Error('Unavailable')) };
  p.window.MutationObserver = class { observe() {} };
  p.start();
  await new Promise(setImmediate);
  for (const [index, diagram] of diagrams.entries()) {
    assert.equal(diagram.textContent, sources[index]);
    assert.equal(diagram.style.visibility, 'visible');
  }
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
