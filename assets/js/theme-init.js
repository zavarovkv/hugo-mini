// Resolve preferences before CSS and share the same storage rules with main.js.
(function () {
  var root = document.documentElement;
  // CSS needs the enhanced mobile-menu layout before its first paint.
  // If the deferred bundle fails, restore the ordinary no-JS navigation.
  root.classList.add('hugo-mini-js');
  window.addEventListener('load', function () {
    if (!document.querySelector('.main-nav.menu-ready')) root.classList.remove('hugo-mini-js');
  });
  var rememberLanguage = root.getAttribute('data-remember-language') === 'true';
  var domain = (root.getAttribute('data-preference-cookie-domain') || '').toLowerCase().replace(/^\./, '');
  var hostname = window.location ? window.location.hostname.toLowerCase() : '';
  // Only an explicitly configured parent domain may share these preferences.
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(domain) ||
      (hostname !== domain && !hostname.endsWith('.' + domain))) domain = '';
  var memory = {};
  var localFallback = {};

  function valid(name, value) {
    if (name === 'theme') return value === 'light' || value === 'dark';
    return name === 'language' && rememberLanguage && typeof value === 'string' &&
      /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(value);
  }

  function cookie(name) {
    if (!domain) return null;
    try {
      var prefix = 'hugo-mini-' + name + '=';
      var entries = document.cookie.split(';');
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i].trim();
        if (entry.indexOf(prefix) === 0) return entry.slice(prefix.length);
      }
    } catch (e) { /* Cookies may be blocked. */ }
    return null;
  }

  function storeLocal(name, value) {
    try {
      localStorage.setItem(name, value);
      delete localFallback[name];
    } catch (e) {
      // Reads can still return an older value when writes fail (for example,
      // at quota). Keep this page's choice until a shared cookie supersedes it.
      localFallback[name] = value;
    }
  }

  function storeCookie(name, value) {
    if (!domain) return;
    try {
      document.cookie = 'hugo-mini-' + name + '=' + value + '; Path=/; Max-Age=31536000; SameSite=Lax; Domain=' + domain +
        (window.location.protocol === 'https:' ? '; Secure' : '');
    } catch (e) { /* Local storage still works when cookies are unavailable. */ }
  }

  function get(name) {
    var value = cookie(name);
    if (valid(name, value)) {
      // The shared choice wins over stale per-origin storage.
      storeLocal(name, value);
      return value;
    }
    value = localFallback[name];
    if (!valid(name, value)) {
      try { value = localStorage.getItem(name); } catch (e) { value = null; }
    }
    if (!valid(name, value)) value = memory[name];
    if (!valid(name, value)) return null;
    // Migrate an explicit legacy choice, never a computed system theme.
    storeCookie(name, value);
    return value;
  }

  function set(name, value) {
    if (!valid(name, value)) return;
    memory[name] = value;
    storeLocal(name, value);
    storeCookie(name, value);
  }

  function applyLanguage() {
    if (!rememberLanguage || root.getAttribute('data-language-preference-entry') !== 'true') return;
    var language = get('language');
    if (!language || language.toLowerCase() === (root.getAttribute('lang') || '').toLowerCase()) return;
    var alternates = document.querySelectorAll('link[rel="alternate"][hreflang]');
    for (var i = 0; i < alternates.length; i++) {
      if ((alternates[i].getAttribute('hreflang') || '').toLowerCase() !== language.toLowerCase()) continue;
      var target;
      try { target = new URL(alternates[i].getAttribute('href'), window.location.href); } catch (e) { return; }
      // Follow only published, same-origin translations of this entry page.
      if (target.origin === window.location.origin && target.pathname !== window.location.pathname) {
        window.location.replace(target.pathname + window.location.search + window.location.hash);
      }
      return;
    }
  }

  window.hugoMiniPreferences = { get: get, set: set, applyLanguage: applyLanguage };
  var theme = get('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  applyLanguage();
})();
