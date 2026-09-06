import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');

function element(attributes = {}) {
  return Object.assign(new EventTarget(), {
    children: [], style: {}, classList: { add() {}, remove() {} },
    getAttribute(name) { return attributes[name] ?? null; },
    setAttribute(name, value) { attributes[name] = value; },
    appendChild(child) { this.children.push(child); },
    getBoundingClientRect() { return { left: 0 }; },
  });
}

function page({ theme = 'light', lazy = true, comments = true } = {}) {
  const root = element({ 'data-theme': theme });
  const button = element();
  const container = element({ 'data-tg-discussion': 'example/1', 'data-tg-limit': '20' });
  const media = Object.assign(new EventTarget(), { matches: theme === 'dark' });
  const values = new Map();
  const window = new EventTarget();
  let enter;
  Object.assign(window, {
    window, navigator: {}, setTimeout, clearTimeout,
    localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
    matchMedia: () => media,
    document: {
      readyState: 'complete', documentElement: root, body: element(),
      querySelector: (selector) => selector === '.theme-toggle' ? button : null,
      querySelectorAll: () => [],
      getElementById: (id) => comments && id === 'tg-comments' ? container : null,
      createElement: () => element(), createTextNode: () => ({}),
    },
  });
  if (lazy) window.IntersectionObserver = class {
    constructor(callback) { enter = () => callback([{ isIntersecting: true }]); }
    observe() {}
    disconnect() {}
  };
  runInNewContext(source, window);
  const updates = [];
  return {
    container, root, window, updates,
    enter: () => enter(),
    toggle: () => button.dispatchEvent(new Event('click')),
    system(dark) { media.matches = dark; media.dispatchEvent(new Event('change')); },
    loaded() {
      window.Telegram = { setWidgetOptions: ({ dark }, target) => updates.push({ dark, target }) };
      container.children[0].onload();
    },
  };
}

test('Telegram stays lazy and receives the latest theme when its script finishes loading', () => {
  const p = page();
  p.toggle();
  assert.equal(p.container.children.length, 0);
  p.enter();
  const script = p.container.children[0];
  assert.equal(script.getAttribute('data-dark'), '1');
  p.toggle();
  assert.equal(script.getAttribute('data-dark'), '0');
  p.loaded();
  assert.deepEqual(p.updates, [{ dark: false, target: script }]);
  p.toggle(); p.toggle(); p.toggle();
  assert.deepEqual(p.updates.map(({ dark }) => dark), [false, true, false, true]);
  assert.equal(p.container.children.length, 1, 'theme changes must keep the loaded widget');
  assert.ok(p.updates.every(({ target }) => target === script));
});

test('Telegram follows system changes and re-synchronizes on page restoration', () => {
  const p = page({ theme: 'dark', lazy: false });
  p.loaded();
  p.system(false);
  assert.equal(p.root.getAttribute('data-theme'), 'light');
  assert.equal(p.updates.at(-1).dark, false);
  p.window.dispatchEvent(new Event('pageshow'));
  assert.equal(p.updates.length, 3);
  assert.equal(p.updates.at(-1).dark, false);
  p.toggle();
  p.system(false);
  assert.equal(p.updates.at(-1).dark, true, 'a saved choice overrides the system');
  assert.equal(p.container.children.length, 1);
});

test('pages without comments do not load Telegram', () => {
  const p = page({ comments: false });
  p.toggle();
  p.window.dispatchEvent(new Event('pageshow'));
  assert.equal(p.container.children.length, 0);
  assert.equal(p.window.Telegram, undefined);
});
