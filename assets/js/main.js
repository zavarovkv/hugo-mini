/*
 * hugo-mini theme behaviour: mobile menu, theme toggle, Telegram widget,
 * code-copy buttons, heading anchors, recent-posts sidebar, back-to-top.
 *
 * Plain JavaScript on purpose — it is bundled through Hugo Pipes but NOT run
 * through ExecuteAsTemplate, so it stays lintable and formattable and no `{{`
 * in JS syntax can break the build. Localized strings arrive via
 * body[data-i18n] (see layouts/baseof.html).
 */
(function () {
  'use strict';

  // Breakpoint shared with CSS (@media max-width: 768px). Keep in sync.
  var MOBILE_QUERY = '(max-width: 768px)';

  var i18n = {};
  try {
    i18n = JSON.parse(document.body.getAttribute('data-i18n') || '{}');
  } catch (e) {
    /* malformed attribute — fall back to the English defaults below */
  }
  function t(key, fallback) {
    return i18n[key] || fallback;
  }

  /** Debounced window listener; returns the wrapped handler. */
  function onResize(fn, delay) {
    var timer = null;
    function handler() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fn, delay || 150);
    }
    window.addEventListener('resize', handler);
    return handler;
  }

  /** Run now if the DOM is parsed, otherwise on DOMContentLoaded. */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ── Mobile menu ────────────────────────────────────────────────────────
  ready(function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;
    var mobile = window.matchMedia(MOBILE_QUERY);
    var inerted = [];

    function closeMenu(restoreFocus) {
      if (!nav.classList.contains('active')) return;
      nav.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
      inerted.forEach(function (element) { element.inert = false; });
      inerted = [];
      if (restoreFocus !== false) toggle.focus();
    }

    function openMenu() {
      if (!mobile.matches) return;
      window.scrollTo(0, 0);
      nav.classList.add('active');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      document.documentElement.classList.add('menu-open');
      // Leave only the navigation and its close button interactive. Preserve
      // elements that were already inert before the menu opened.
      document.querySelectorAll('main, footer, header .title, .back-to-top-wrap').forEach(function (element) {
        if (!element.inert) {
          element.inert = true;
          inerted.push(element);
        }
      });
      var firstLink = nav.querySelector('a[href]');
      (firstLink || toggle).focus();
    }

    toggle.addEventListener('click', function () {
      if (nav.classList.contains('active')) closeMenu();
      else openMenu();
    });

    // Close on link click, but not when opening in a new tab.
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) closeMenu();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!nav.classList.contains('active')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      } else if (e.key === 'Tab') {
        var controls = [toggle].concat(Array.from(nav.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')))
          .filter(function (element) { return element.getClientRects().length && !element.closest('[inert]'); });
        var index = controls.indexOf(document.activeElement);
        var next = e.shiftKey ? index - 1 : index + 1;
        if (index < 0 || next < 0 || next >= controls.length) {
          e.preventDefault();
          controls[e.shiftKey ? controls.length - 1 : 0].focus();
        }
      }
    });

    function onLayoutChange() {
      if (!mobile.matches) {
        var toggleHadFocus = document.activeElement === toggle;
        closeMenu(false);
        if (toggleHadFocus) {
          var firstLink = nav.querySelector('a[href]');
          if (firstLink) firstLink.focus();
        }
      }
    }
    if (mobile.addEventListener) mobile.addEventListener('change', onLayoutChange);
    else if (mobile.addListener) mobile.addListener(onLayoutChange);
  });

  // ── Theme toggle + widgets that follow it ──────────────────────────────
  (function () {
    var STORAGE_KEY = 'theme';
    var LABELS = {
      light: t('toDark', 'Switch to dark theme'),
      dark: t('toLight', 'Switch to light theme'),
    };
    var root = document.documentElement;
    var mql = window.matchMedia('(prefers-color-scheme: dark)');

    function currentTheme() {
      return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function storedChoice() {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        return null;
      }
    }

    function syncLikelyTheme() {
      var dark = currentTheme() === 'dark';
      document.querySelectorAll('.likely').forEach(function (w) {
        w.classList.toggle('likely-dark-theme', dark);
      });
    }

    // Telegram Discussion widget. It bakes the colour scheme in at load time,
    // so a theme change means rebuilding it.
    var tgWidgetLoaded = false;
    var tgRebuildTimer = null;
    function syncTelegramWidget() {
      var container = document.getElementById('tg-comments');
      if (!container) return;
      var discussion = container.getAttribute('data-tg-discussion');
      if (!discussion) return;
      if (tgRebuildTimer) clearTimeout(tgRebuildTimer);
      tgRebuildTimer = setTimeout(
        function () {
          container.innerHTML = '';
          var s = document.createElement('script');
          s.async = true;
          s.src = 'https://telegram.org/js/telegram-widget.js?22';
          s.setAttribute('data-telegram-discussion', discussion);
          s.setAttribute('data-comments-limit', container.getAttribute('data-tg-limit') || '20');
          if (currentTheme() === 'dark') s.setAttribute('data-dark', '1');
          container.appendChild(s);
          tgWidgetLoaded = true;
          tgRebuildTimer = null;
        },
        tgWidgetLoaded ? 500 : 0
      );
    }

    // Only rebuild if it is already on the page: before that the observer
    // below will load it with whatever theme is current at that moment, and
    // rebuilding here would defeat the lazy-load.
    function refreshTelegramWidget() {
      if (tgWidgetLoaded) syncTelegramWidget();
    }

    function observeTelegramWidget() {
      var container = document.getElementById('tg-comments');
      if (!container || typeof IntersectionObserver === 'undefined') {
        syncTelegramWidget();
        return;
      }
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting && !tgWidgetLoaded) {
            syncTelegramWidget();
            observer.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(container);
    }

    // Follow the system until the user makes an explicit choice.
    function onSystemChange() {
      if (storedChoice() !== null) return;
      root.setAttribute('data-theme', mql.matches ? 'dark' : 'light');
      var btn = document.querySelector('.theme-toggle');
      if (btn) {
        btn.title = LABELS[currentTheme()];
        btn.setAttribute('aria-label', LABELS[currentTheme()]);
      }
      syncLikelyTheme();
      refreshTelegramWidget();
    }
    if (mql.addEventListener) mql.addEventListener('change', onSystemChange);
    else if (mql.addListener) mql.addListener(onSystemChange); // Safari < 14

    ready(function initThemeToggle() {
      syncLikelyTheme();
      observeTelegramWidget();
      var btn = document.querySelector('.theme-toggle');
      if (!btn) return;
      btn.title = LABELS[currentTheme()];
      btn.setAttribute('aria-label', LABELS[currentTheme()]);
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {
          /* private mode — the choice just won't persist */
        }
        root.setAttribute('data-theme', next);
        btn.title = LABELS[next];
        btn.setAttribute('aria-label', LABELS[next]);
        syncLikelyTheme();
        refreshTelegramWidget();
      });
    });
  })();

  // ── Copy button on code blocks ─────────────────────────────────────────
  (function () {
    if (!navigator.clipboard) return;
    var svgCopy =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var svgCheck =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    var FEEDBACK_MS = 1500;

    document.querySelectorAll('.highlight').forEach(function (block) {
      var code = block.querySelector('code');
      if (!code) return;
      var wrapper = block.closest('.code-block[data-code]');
      var source = wrapper ? wrapper.getAttribute('data-code') : code.textContent;
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.innerHTML = svgCopy;
      btn.title = t('copy', 'Copy');
      btn.setAttribute('aria-label', t('copy', 'Copy'));
      btn.setAttribute('aria-live', 'polite');
      btn.querySelector('svg').setAttribute('aria-hidden', 'true');
      var timer = null;
      btn.addEventListener('click', function () {
        navigator.clipboard
          .writeText(source)
          .then(function () {
            btn.innerHTML = svgCheck;
            btn.querySelector('svg').setAttribute('aria-hidden', 'true');
            btn.setAttribute('aria-label', t('copied', 'Copied'));
            btn.classList.add('copied');
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
              btn.innerHTML = svgCopy;
              btn.querySelector('svg').setAttribute('aria-hidden', 'true');
              btn.setAttribute('aria-label', t('copy', 'Copy'));
              btn.classList.remove('copied');
              timer = null;
            }, FEEDBACK_MS);
          })
          .catch(function () {
            /* permission denied or insecure context */
          });
      });
      block.appendChild(btn);
    });
  })();

  // ── Heading anchors: click copies the section URL ───────────────────────
  (function () {
    if (!navigator.clipboard) return;
    var FEEDBACK_MS = 1200;
    // Live query: re-evaluated on each interaction so rotating a tablet
    // switches behaviour instead of keeping whatever was true at load.
    var mobileMql = window.matchMedia(MOBILE_QUERY);

    document.querySelectorAll('.heading-anchor').forEach(function (anchor) {
      var heading = anchor.parentElement;
      var timer = null;
      var originalLabel = anchor.getAttribute('aria-label');
      anchor.setAttribute('aria-live', 'polite');

      // Mobile: tap the heading to reveal the icon, tap the icon to copy.
      if (heading) {
        heading.addEventListener('click', function (e) {
          if (!mobileMql.matches) return;
          if (e.target === anchor || anchor.contains(e.target)) {
            e.stopPropagation();
            return;
          }
          heading.classList.toggle('anchor-visible');
        });
      }

      anchor.addEventListener('click', function () {
        navigator.clipboard
          .writeText(anchor.href)
          .then(function () {
            anchor.classList.add('copied');
            anchor.setAttribute('aria-label', t('copied', 'Copied'));
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
              anchor.classList.remove('copied');
              anchor.setAttribute('aria-label', originalLabel);
              timer = null;
            }, FEEDBACK_MS);
          })
          .catch(function () {
            /* permission denied or insecure context */
          });
      });
    });
  })();

  // ── Recent-posts sidebar: absolute in the right gutter on desktop ───────
  (function () {
    var MIN_GUTTER = 180;
    var GAP = 24;
    var sidebar = document.getElementById('recent-sidebar');
    if (!sidebar) return;

    function measure() {
      var rect = document.body.getBoundingClientRect();
      var gutter = window.innerWidth - rect.right;
      if (gutter < MIN_GUTTER) {
        sidebar.classList.remove('is-sidebar');
        sidebar.style.cssText = '';
        return;
      }
      var h1 = document.querySelector('h1');
      var topPos = h1
        ? Math.round(h1.getBoundingClientRect().top + window.pageYOffset)
        : Math.round(rect.top + window.pageYOffset);
      sidebar.classList.add('is-sidebar');
      sidebar.style.top = topPos + 'px';
      sidebar.style.left = Math.round(rect.left + window.pageXOffset + rect.width + GAP - 16) + 'px';
      sidebar.style.width = Math.round(gutter - GAP - 16) + 'px';
    }

    onResize(measure);
    measure();
    // The first measure runs against fallback-font metrics; once the web font
    // swaps in, h1 moves and the sidebar would sit at a stale offset.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
  })();

  // ── Back to top: click area in the left gutter ──────────────────────────
  (function () {
    var SCROLL_THRESHOLD = 400;
    var MIN_GUTTER = 130;
    var label = t('goUp', 'Go up');

    var wrap = document.createElement('a');
    wrap.className = 'back-to-top-wrap';
    // href keeps it keyboard-focusable; the handler preventDefaults the jump.
    wrap.setAttribute('href', '#');
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', label);

    var inner = document.createElement('div');
    inner.className = 'back-to-top';
    inner.innerHTML =
      '<svg class="back-to-top-icon" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5l4-4 4 4"/></svg>';
    inner.appendChild(document.createTextNode(label));

    wrap.appendChild(inner);
    document.body.appendChild(wrap);

    var gutterOk = false;

    function onScroll() {
      if (gutterOk && window.pageYOffset > SCROLL_THRESHOLD) {
        wrap.classList.add('shown');
      } else {
        wrap.classList.remove('shown');
      }
    }

    function measure() {
      var gutter = document.body.getBoundingClientRect().left;
      gutterOk = gutter > MIN_GUTTER;
      wrap.style.width = gutter + 'px';
      wrap.style.display = gutterOk ? 'block' : 'none';
      onScroll();
    }

    wrap.addEventListener('click', function (e) {
      e.preventDefault();
      window.scroll(0, 0);
      onScroll();
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onResize(measure);
    measure();
  })();
})();
