import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const init = readFileSync(new URL('../assets/js/theme-init.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../assets/js/main.js', import.meta.url), 'utf8');

function element(attributes = {}) {
  const classes = new Set();
  const node = Object.assign(new EventTarget(), {
    getAttribute: (name) => attributes[name] ?? null,
    setAttribute: (name, value) => { attributes[name] = String(value); },
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
      toggle(name, force = !classes.has(name)) {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      },
    },
    querySelectorAll: () => [],
  });
  Object.defineProperty(node, 'lang', {
    get: () => attributes.lang ?? '',
    set: (value) => { attributes.lang = String(value); },
  });
  return node;
}

// One browser shares domain cookies, but keeps localStorage separate per origin.
function browser() {
  const cookies = new Map();
  const stores = new Map();
  const writes = [];
  const domainMatches = (host, domain) => host === domain || host.endsWith(`.${domain}`);
  return {
    writes,
    storage(url) {
      const { origin } = new URL(url);
      if (!stores.has(origin)) stores.set(origin, new Map());
      return stores.get(origin);
    },
    readCookies(url) {
      const { hostname, pathname, protocol } = new URL(url);
      return [...cookies.values()]
        .filter((cookie) => (cookie.hostOnly ? hostname === cookie.domain : domainMatches(hostname, cookie.domain))
          && (pathname === cookie.path || pathname.startsWith(cookie.path.endsWith('/') ? cookie.path : `${cookie.path}/`))
          && (!cookie.secure || protocol === 'https:'))
        .map(({ name, value }) => `${name}=${value}`).join('; ');
    },
    writeCookie(url, text) {
      writes.push({ url, text });
      const { hostname, protocol } = new URL(url);
      const [pair, ...parts] = text.split(';').map((part) => part.trim());
      const equals = pair.indexOf('=');
      if (equals < 1) return;
      const attributes = Object.fromEntries(parts.map((part) => {
        const split = part.indexOf('=');
        return split < 0 ? [part.toLowerCase(), true] : [part.slice(0, split).toLowerCase(), part.slice(split + 1)];
      }));
      const domain = String(attributes.domain || hostname).toLowerCase().replace(/^\./, '');
      if (!domainMatches(hostname, domain) || (attributes.secure && protocol !== 'https:')) return;
      const cookie = {
        name: pair.slice(0, equals), value: pair.slice(equals + 1), domain,
        path: attributes.path || '/', hostOnly: !attributes.domain, secure: Boolean(attributes.secure),
      };
      const key = `${domain}|${cookie.path}|${cookie.name}`;
      if (Number(attributes['max-age']) <= 0) cookies.delete(key);
      else cookies.set(key, cookie);
    },
  };
}

function page({
  state = browser(), url = 'https://example.com/', domain = 'example.com',
  lang = 'ru', remember = true, entry = false, dark = false,
  saved = {}, blockedStorage = false, blockedCookies = false, inline = true,
  alternates = { ru: '/', en: '/en/', 'x-default': '/' },
} = {}) {
  const current = new URL(url);
  const values = state.storage(url);
  for (const [key, value] of Object.entries(saved)) values.set(key, value);
  const root = element({
    lang,
    'data-preference-cookie-domain': domain,
    'data-remember-language': String(remember),
    'data-language-preference-entry': String(entry),
    'data-theme': dark ? 'dark' : 'light',
  });
  const body = element({ 'data-back-to-top': 'false' });
  const themeToggle = element();
  const languageToggle = element({ 'data-lang': lang === 'ru' ? 'en' : 'ru' });
  const links = Object.entries(alternates).map(([language, href]) => Object.assign(
    element({ rel: 'alternate', hreflang: language, href }),
    { href: new URL(href, url).href },
  ));
  const system = Object.assign(new EventTarget(), { matches: dark });
  const otherMedia = Object.assign(new EventTarget(), { matches: false });
  const replacements = [];
  const location = {
    href: current.href, origin: current.origin, hostname: current.hostname,
    protocol: current.protocol, pathname: current.pathname, search: current.search, hash: current.hash,
    replace: (target) => replacements.push(new URL(target, current.href).href),
  };
  const document = Object.assign(new EventTarget(), {
    documentElement: root, body, readyState: 'complete', hidden: false, visibilityState: 'visible',
    querySelector: (selector) => ({ '.theme-toggle': themeToggle, '.lang-toggle': languageToggle, '.lang-toggle[data-lang]': languageToggle })[selector] || null,
    querySelectorAll(selector) {
      if (selector === 'link[rel="alternate"][hreflang]') return links;
      if (selector === '.lang-toggle' || selector === '.lang-toggle[data-lang]') return [languageToggle];
      return [];
    },
    getElementById: () => null,
  });
  Object.defineProperty(document, 'cookie', {
    get() {
      if (blockedCookies) throw new Error('Cookies blocked');
      return state.readCookies(url);
    },
    set(value) {
      if (blockedCookies) throw new Error('Cookies blocked');
      state.writeCookie(url, String(value));
    },
  });
  const window = Object.assign(new EventTarget(), {
    document, location, URL, navigator: {}, setTimeout, clearTimeout,
    localStorage: {
      getItem(key) {
        if (blockedStorage === true) throw new Error('Storage blocked');
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        if (blockedStorage) throw new Error('Storage blocked');
        values.set(key, String(value));
      },
      removeItem(key) {
        if (blockedStorage) throw new Error('Storage blocked');
        values.delete(key);
      },
    },
    matchMedia: (query) => query.includes('prefers-color-scheme') ? system : otherMedia,
  });
  window.window = window;
  if (inline) runInNewContext(init, window);
  return {
    state, window, document, root, values, replacements,
    start: () => runInNewContext(main, window),
    theme: () => root.getAttribute('data-theme'),
    toggleTheme() { themeToggle.dispatchEvent(new Event('click')); },
    toggleLanguage() {
      const event = new Event('click', { cancelable: true });
      languageToggle.dispatchEvent(event);
      return event;
    },
    system(dark) {
      system.matches = dark;
      system.dispatchEvent(new Event('change'));
    },
    visible(visible) {
      document.hidden = !visible;
      document.visibilityState = visible ? 'visible' : 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
    },
  };
}

test('a migrated theme is shared across subdomains and wins over stale local preferences before paint', () => {
  const state = browser();
  const blog = page({ state, saved: { theme: 'dark' } });
  assert.equal(blog.theme(), 'dark');
  assert.equal(blog.window.hugoMiniPreferences.get('theme'), 'dark');
  const council = page({ state, url: 'https://council.example.com/', saved: { theme: 'light' } });
  assert.equal(council.theme(), 'dark', 'inline initialization must use the shared cookie');
  assert.equal(council.window.hugoMiniPreferences.get('theme'), 'dark');
  assert.equal(page({ state, url: 'https://unrelated.test/', domain: '' }).theme(), 'light');
});

test('explicit choices synchronize on focus, page restoration, and return to a visible tab', () => {
  const state = browser();
  const blog = page({ state });
  const council = page({ state, url: 'https://council.example.com/' });
  blog.start();
  council.start();
  blog.toggleTheme();
  assert.equal(page({ state, url: 'https://council.example.com/' }).theme(), 'dark', 'the click saves synchronously');
  council.window.dispatchEvent(new Event('focus'));
  assert.equal(council.theme(), 'dark');
  council.toggleTheme();
  blog.window.dispatchEvent(new Event('pageshow'));
  assert.equal(blog.theme(), 'light');
  council.visible(false);
  blog.toggleTheme();
  council.visible(false);
  assert.equal(council.theme(), 'light', 'a hidden page waits until it becomes visible');
  council.visible(true);
  assert.equal(council.theme(), 'dark');
});

test('the system scheme remains live without creating an explicit preference', () => {
  const p = page({ dark: true, saved: { theme: 'invalid' } });
  p.start();
  assert.equal(p.theme(), 'dark');
  p.system(false);
  assert.equal(p.theme(), 'light');
  p.window.dispatchEvent(new Event('focus'));
  assert.equal(p.theme(), 'light');
  assert.equal(p.state.writes.length, 0);
  assert.equal(p.values.get('theme'), 'invalid');
});

test('language clicks save before navigation without changing ordinary link behavior', () => {
  const state = browser();
  // An untranslated article still offers a footer link to the other language's home.
  const blog = page({ state, url: 'https://example.com/posts/example/', alternates: { ru: '/posts/example/' } });
  blog.start();
  assert.equal(blog.toggleLanguage().defaultPrevented, false);
  assert.equal(blog.window.hugoMiniPreferences.get('language'), 'en');
  const council = page({ state, url: 'https://council.example.com/?campaign=blog#pricing', entry: true });
  assert.deepEqual(council.replacements, ['https://council.example.com/en/?campaign=blog#pricing']);
  const translated = page({ state, url: council.replacements[0], entry: true, lang: 'en' });
  assert.deepEqual(translated.replacements, [], 'the selected entry must not redirect again');
  translated.start();
  translated.toggleLanguage();
  const englishBlog = page({ state, url: 'https://example.com/en/', entry: true, lang: 'en' });
  assert.deepEqual(englishBlog.replacements, ['https://example.com/']);
});

test('direct article links keep their language and never overwrite the saved choice', () => {
  const state = browser();
  const entry = page({ state, saved: { language: 'ru' }, entry: true });
  const article = page({
    state, url: 'https://council.example.com/en/article/', lang: 'en',
    alternates: { ru: '/article/', en: '/en/article/' },
  });
  article.start();
  article.window.dispatchEvent(new Event('focus'));
  article.window.dispatchEvent(new Event('pageshow'));
  assert.deepEqual(article.replacements, []);
  assert.equal(entry.window.hugoMiniPreferences.get('language'), 'ru');
  assert.equal(article.window.hugoMiniPreferences.get('language'), 'ru');
});

test('restored entry pages follow a language changed in another subdomain', () => {
  for (const event of ['focus', 'pageshow', 'visibilitychange']) {
    const state = browser();
    const blog = page({ state, entry: true });
    const council = page({ state, url: 'https://council.example.com/' });
    blog.start();
    council.start();
    council.toggleLanguage();
    if (event === 'visibilitychange') blog.visible(true);
    else blog.window.dispatchEvent(new Event(event));
    assert.deepEqual(blog.replacements, ['https://example.com/en/'], event);
  }
});

test('language redirects require a supported language and a different same-origin target', () => {
  for (const { language, alternates } of [
    { language: 'unsupported', alternates: { ru: '/', en: '/en/' } },
    { language: 'en', alternates: { ru: '/' } },
    { language: 'en', alternates: { ru: '/', en: 'https://other.example/en/' } },
    { language: 'en', alternates: { ru: '/', en: '/' } },
    { language: 'x-default', alternates: { ru: '/', en: '/en/', 'x-default': '/fallback/' } },
  ]) {
    const state = browser();
    state.writeCookie('https://example.com/', `hugo-mini-language=${language}; Domain=example.com; Path=/`);
    const p = page({ state, entry: true, alternates });
    assert.deepEqual(p.replacements, [], language);
  }
});

test('a shared language beats stale local language and legacy language migrates only when needed', () => {
  const state = browser();
  const blog = page({ state, saved: { language: 'en' }, entry: true });
  assert.deepEqual(blog.replacements, ['https://example.com/en/']);
  const council = page({ state, url: 'https://council.example.com/', saved: { language: 'ru' }, entry: true });
  assert.deepEqual(council.replacements, ['https://council.example.com/en/']);
});

test('remember-language opt-out ignores saved language and never stores a language click', () => {
  const state = browser();
  state.writeCookie('https://example.com/', 'hugo-mini-language=en; Domain=example.com; Path=/');
  const p = page({ state, remember: false, entry: true, saved: { language: 'en' } });
  const writes = state.writes.length;
  p.start();
  assert.deepEqual(p.replacements, []);
  p.toggleLanguage();
  p.window.hugoMiniPreferences.set('language', 'ru');
  p.window.dispatchEvent(new Event('focus'));
  assert.equal(state.writes.length, writes);
  assert.equal(p.values.get('language'), 'en');
  assert.deepEqual(p.replacements, []);
});

test('without a valid shared domain settings stay local to their own origin', () => {
  for (const { url, domain } of [
    { url: 'https://example.com/', domain: '' },
    { url: 'https://example.com/', domain: 'other.test' },
    { url: 'https://notexample.com/', domain: 'example.com' },
    { url: 'https://example.com/', domain: 'example.com; Path=/' },
  ]) {
    const state = browser();
    const p = page({ state, url, domain });
    p.start();
    p.toggleTheme();
    p.toggleLanguage();
    assert.equal(p.values.get('theme'), 'dark');
    assert.equal(p.values.get('language'), 'en');
    assert.equal(state.writes.length, 0, `${url} with ${domain || 'no domain'}`);
    const sibling = page({ state, url: 'https://council.example.com/', domain: '' });
    assert.equal(sibling.theme(), 'light');
    assert.deepEqual(sibling.replacements, []);
  }
});

test('blocked storage retains explicit choices in the current page and keeps system changes from resetting them', () => {
  for (const blockedStorage of [true, 'writes-only']) {
    const p = page({ blockedStorage, blockedCookies: true, saved: { theme: 'light', language: 'ru' } });
    p.start();
    p.toggleTheme();
    p.toggleLanguage();
    assert.equal(p.theme(), 'dark');
    assert.equal(p.window.hugoMiniPreferences.get('theme'), 'dark', String(blockedStorage));
    assert.equal(p.window.hugoMiniPreferences.get('language'), 'en', String(blockedStorage));
    p.system(true);
    p.system(false);
    p.window.dispatchEvent(new Event('focus'));
    p.window.dispatchEvent(new Event('pageshow'));
    p.visible(true);
    assert.equal(p.theme(), 'dark');
    p.root.setAttribute('data-language-preference-entry', 'true');
    p.window.hugoMiniPreferences.applyLanguage();
    assert.deepEqual(p.replacements, ['https://example.com/en/']);
  }
});

test('the main bundle still supports a theme toggle when inline initialization is unavailable', () => {
  const p = page({ inline: false });
  p.start();
  p.toggleTheme();
  assert.equal(p.theme(), 'dark');
  assert.equal(p.values.get('theme'), 'dark');
  p.system(true);
  p.system(false);
  assert.equal(p.theme(), 'dark');
});
