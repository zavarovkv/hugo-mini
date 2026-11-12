/*
 * hugo-mini theme behaviour: mobile menu, theme toggle, Telegram widget,
 * code-copy buttons, heading anchors, article shortcuts, wide blocks, side notes, back-to-top.
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

  // Static hosts may serve the default-language 404 for any missing URL.
  // Select its translated view before initializing controls and UI strings.
  (function () {
    var variants = document.querySelectorAll('template[data-not-found-language]');
    if (!variants.length) return;
    var current = document.querySelector('[data-not-found-prefix]');
    if (!current) return;
    var pathname = window.location.pathname;
    function matches(prefix) {
      return prefix && (pathname.indexOf(prefix) === 0 || pathname === prefix.replace(/\/$/, ''));
    }
    var currentPrefix = current.getAttribute('data-not-found-prefix');
    var length = matches(currentPrefix) ? currentPrefix.length : 0;
    var selected = null;
    variants.forEach(function (variant) {
      var prefix = variant.getAttribute('data-not-found-prefix');
      var url = new URL(variant.getAttribute('data-not-found-url'), window.location.href);
      if (url.origin === window.location.origin && matches(prefix) && prefix.length > length) {
        selected = variant;
        length = prefix.length;
      }
    });
    if (selected) {
      ['header', 'main', 'footer'].forEach(function (selector) {
        var original = document.querySelector(selector);
        var translated = selected.content.querySelector(selector);
        if (original && translated) original.replaceWith(translated.cloneNode(true));
      });
      document.documentElement.lang = selected.getAttribute('data-not-found-language');
      document.title = selected.getAttribute('data-not-found-title');
      document.body.setAttribute('data-i18n', selected.content.querySelector('[data-not-found-ui]').getAttribute('data-not-found-ui'));
      document.querySelectorAll('link[rel="canonical"], meta[property="og:url"]').forEach(function (node) {
        node.setAttribute(node.tagName === 'LINK' ? 'href' : 'content', selected.getAttribute('data-not-found-url'));
      });
      document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(function (node) {
        node.setAttribute('content', document.title);
      });
      document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach(function (node) {
        node.setAttribute('content', selected.getAttribute('data-not-found-description'));
      });
      var locale = document.querySelector('meta[property="og:locale"]');
      if (locale) {
        var previousLocale = locale.getAttribute('content');
        var nextLocale = selected.getAttribute('data-not-found-locale');
        document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(function (node) {
          if (node.getAttribute('content') === nextLocale) node.setAttribute('content', previousLocale);
        });
        locale.setAttribute('content', nextLocale);
      }
    }
    variants.forEach(function (variant) { variant.remove(); });
  })();

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

  // Markdown receives this policy at build time; cover authored HTML and
  // shortcode links here as well, strictly inside opted-in article bodies.
  ready(function initArticleLinkTargets() {
    var article = document.querySelector('article[data-article-links-new-tab]');
    if (!article) return;
    function apply(link) {
      if (!link || !(link instanceof HTMLAnchorElement) || link.hasAttribute('download')) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var url;
      try { url = new URL(href, location.href); } catch (e) { return; }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.hash && url.origin === location.origin && url.pathname === location.pathname && url.search === location.search) {
        link.removeAttribute('target');
        return;
      }
      link.target = '_blank';
      link.relList.add('noopener', 'noreferrer');
    }
    article.querySelectorAll('a[href]').forEach(apply);
    article.addEventListener('click', function (event) { apply(event.target.closest('a[href]')); });
  });

  // ── Article navigation: Option/Alt + arrows, no wrap at either end ────
  ready(function initArticleNavigation() {
    var article = document.querySelector('article[data-article-navigation]');
    if (!article) return;
    var navigating = false;
    window.addEventListener('pageshow', function () { navigating = false; });
    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || !e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.isComposing) return;
      var direction = e.key === 'ArrowLeft' ? 'previous' : e.key === 'ArrowRight' ? 'next' : '';
      if (!direction) return;
      var target = e.target;
      if (target && (target.isContentEditable || (target.closest && target.closest('input, textarea, select, [role="textbox"], [role="combobox"], [role="slider"], [role="spinbutton"]')))) return;
      if (document.body.classList.contains('menu-open') || document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]:not([hidden])')) return;
      // Consume the shortcut even at a boundary, where Alt+Left/Right must
      // not fall through to the browser's unrelated history navigation.
      e.preventDefault();
      if (e.repeat || navigating) return;
      var href = article.getAttribute('data-article-' + direction);
      if (!href) return;
      navigating = true;
      window.location.assign(href);
    });
  });

  // ── Project marks: a short spin that coasts naturally to a stop ────────
  ready(function initProjectMarks() {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    document.querySelectorAll('.project-mark-button').forEach(function (button) {
      var mark = button.querySelector('.project-mark');
      if (!mark || typeof mark.animate !== 'function') return;
      var animation = null;

      button.addEventListener('click', function () {
        if (reducedMotion.matches || (animation && animation.playState === 'running')) return;
        animation = mark.animate(
          [{ transform: 'rotate(0deg)' }, { transform: 'rotate(1440deg)' }],
          { duration: 2700, easing: 'cubic-bezier(0.15, 0.7, 0.2, 1)' }
        );
        animation.onfinish = function () { animation = null; };
      });
      function syncMotionPreference() {
        if (reducedMotion.matches && animation) {
          animation.cancel();
          animation = null;
        }
        button.disabled = reducedMotion.matches;
      }
      if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', syncMotionPreference);
      else if (reducedMotion.addListener) reducedMotion.addListener(syncMotionPreference);
      // Without JS or the Web Animations API the mark stays decorative.
      syncMotionPreference();
    });
  });

  // ── Mobile menu ────────────────────────────────────────────────────────
  ready(function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;
    var mobileMql = window.matchMedia(MOBILE_QUERY);
    var lockedScrollY = 0;

    function closeMenu() {
      var wasOpen = nav.classList.contains('active');
      nav.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
      document.body.style.top = '';
      if (wasOpen) window.scrollTo(0, lockedScrollY);
    }

    function openMenu() {
      // Fixing the body without preserving its offset jumps long articles to
      // the top. Restore the exact position on every close path.
      lockedScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      document.body.style.top = -lockedScrollY + 'px';
      nav.classList.add('menu-animated');
      nav.classList.add('active');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      document.documentElement.classList.add('menu-open');
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
      if (e.key !== 'Escape' || !nav.classList.contains('active')) return;
      closeMenu();
      toggle.focus();
    });

    // A disclosure must not cover content after keyboard focus leaves it.
    document.addEventListener('focusin', function (e) {
      if (nav.classList.contains('active') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    function onBreakpointChange() {
      nav.classList.remove('menu-animated');
      if (!mobileMql.matches) closeMenu();
    }
    if (mobileMql.addEventListener) mobileMql.addEventListener('change', onBreakpointChange);
    else if (mobileMql.addListener) mobileMql.addListener(onBreakpointChange);
    // Enhance an ordinary visible nav only after its controls are wired.
    nav.classList.add('menu-ready');
    toggle.classList.add('menu-ready');
  });

  // ── Theme toggle + widgets that follow it ──────────────────────────────
  (function () {
    var STORAGE_KEY = 'theme';
    var LABELS = {
      light: t('toDark', 'Switch to dark theme'),
      dark: t('toLight', 'Switch to light theme'),
    };
    var root = document.documentElement;
    var preferences = window.hugoMiniPreferences;
    var mql = window.matchMedia('(prefers-color-scheme: dark)');

    function currentTheme() {
      return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function storedChoice() {
      if (preferences) return preferences.get(STORAGE_KEY);
      try {
        var choice = localStorage.getItem(STORAGE_KEY);
        return choice === 'light' || choice === 'dark' ? choice : null;
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

    var tgWidget = null;
    function syncTelegramTheme() {
      if (!tgWidget) return;
      var dark = currentTheme() === 'dark';
      tgWidget.setAttribute('data-dark', dark ? '1' : '0');
      // Telegram queues options until the iframe is ready. Keep the same
      // iframe so switching themes cannot reload comments or lose a draft.
      if (window.Telegram && typeof window.Telegram.setWidgetOptions === 'function') {
        window.Telegram.setWidgetOptions({ dark: dark }, tgWidget);
      }
    }

    function loadTelegramWidget() {
      var container = document.getElementById('tg-comments');
      if (!container || tgWidget) return;
      var discussion = container.getAttribute('data-tg-discussion');
      if (!discussion) return;
      tgWidget = document.createElement('script');
      tgWidget.async = true;
      tgWidget.src = 'https://telegram.org/js/telegram-widget.js?22';
      tgWidget.setAttribute('data-telegram-discussion', discussion);
      tgWidget.setAttribute('data-comments-limit', container.getAttribute('data-tg-limit') || '20');
      tgWidget.onload = syncTelegramTheme;
      syncTelegramTheme();
      container.appendChild(tgWidget);
    }

    function observeTelegramWidget() {
      var container = document.getElementById('tg-comments');
      if (!container || typeof IntersectionObserver === 'undefined') {
        loadTelegramWidget();
        return;
      }
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            loadTelegramWidget();
            observer.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(container);
    }

    function applyTheme(theme) {
      if (root.getAttribute('data-theme') !== theme) root.setAttribute('data-theme', theme);
      var btn = document.querySelector('.theme-toggle');
      if (btn) {
        btn.title = LABELS[currentTheme()];
        btn.setAttribute('aria-label', LABELS[currentTheme()]);
      }
      syncLikelyTheme();
      syncTelegramTheme();
    }

    function syncPreferences() {
      applyTheme(storedChoice() || (mql.matches ? 'dark' : 'light'));
      if (preferences) preferences.applyLanguage();
    }

    // Follow the system until the user makes an explicit choice.
    function onSystemChange() {
      if (storedChoice() === null) applyTheme(mql.matches ? 'dark' : 'light');
    }
    if (mql.addEventListener) mql.addEventListener('change', onSystemChange);
    else if (mql.addListener) mql.addListener(onSystemChange); // Safari < 14

    // Cookies do not emit cross-origin storage events. Refresh when returning
    // from another tab/subdomain, including a page restored from the back cache.
    window.addEventListener('pageshow', syncPreferences);
    window.addEventListener('focus', syncPreferences);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') syncPreferences();
    });
    window.addEventListener('storage', function (event) {
      if (event.key === null || event.key === 'theme' || event.key === 'language') syncPreferences();
    });

    ready(function initThemeToggle() {
      applyTheme(storedChoice() || (mql.matches ? 'dark' : 'light'));
      observeTelegramWidget();
      if (preferences && root.getAttribute('data-remember-language') === 'true') {
        document.querySelectorAll('.lang-toggle[data-lang], .lang-option[data-lang]').forEach(function (link) {
          function saveLanguage(event) {
            if (event.type === 'click' || event.button === 1) preferences.set('language', link.getAttribute('data-lang'));
          }
          link.addEventListener('click', saveLanguage);
          link.addEventListener('auxclick', saveLanguage);
        });
      }
      var btn = document.querySelector('.theme-toggle');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        if (preferences) preferences.set(STORAGE_KEY, next);
        else {
          try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* Storage may be blocked. */ }
        }
        applyTheme(next);
      });
    });
  })();

  // ── KaTeX: shared behavior, enabled only on pages that load its assets ────
  ready(function () {
    if (document.body.getAttribute('data-math') !== 'true' || typeof renderMathInElement !== 'function') return;
    renderMathInElement(document.querySelector('main'), {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
    });
  });

  // ── Copy button on code blocks ─────────────────────────────────────────
  (function () {
    if (!navigator.clipboard) return;
    var svgCopy =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var svgCheck =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    var FEEDBACK_MS = 1500;

    document.querySelectorAll('.highlight').forEach(function (block) {
      // Chroma's table mode puts line numbers in a separate <code> first.
      var code = block.querySelector('code[data-lang]') || block.querySelector('code');
      if (!code) return;
      // In inline mode, the first child of each line is its number. Read the
      // last child instead; the source stays in the page only once.
      var lines = code.querySelectorAll(':scope > span[style*="display:flex"], :scope > span.line');
      var source = lines.length
        ? Array.from(lines, function (line) { return line.lastElementChild ? line.lastElementChild.textContent : line.textContent; }).join('')
        : code.textContent;
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

  // ── Optional heading alignment: native text links and section shortcuts ──
  ready(function initHeadingScroll() {
    if (document.body.getAttribute('data-heading-scroll') !== 'true') return;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var headings = [];
    var destination = null;
    var settledScrollY = null;
    var interactive = 'a, button, input, select, textarea, summary, [contenteditable]';

    function offset(heading) {
      return parseFloat(getComputedStyle(heading).getPropertyValue('--heading-scroll-offset')) || 24;
    }
    function align(heading) {
      var target = new URL(window.location.href);
      target.hash = heading.hasAttribute('data-heading-reset') ? '' : encodeURIComponent(heading.id);
      if (window.location.hash !== target.hash) window.history.pushState(null, '', target.href);
      destination = heading;
      settledScrollY = null;
      var limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      var top = Math.max(0, Math.min(window.scrollY + heading.getBoundingClientRect().top - offset(heading), limit));
      window.scrollTo({top: top, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
      if (Math.abs(window.scrollY - top) <= 2) settledScrollY = window.scrollY;
    }

    document.querySelectorAll('main h1, main h2, main .resume-entry-heading').forEach(function (heading, index) {
      if (heading.closest('.footnotes, .not-beauty') || heading.classList.contains('no-anchor')) return;
      var anchor = heading.querySelector(':scope > .heading-anchor');
      if (anchor) anchor.remove();
      if (!heading.id) {
        var base = heading.tagName === 'H1' ? 'page-title' : 'section-' + (index + 1);
        var id = base;
        var suffix = 2;
        while (document.getElementById(id)) id = base + '-' + suffix++;
        heading.id = id;
      }
      // Keep authored links and controls intact; never nest anchors.
      var link = null;
      var links = [];
      Array.from(heading.childNodes).forEach(function (node) {
        if (node.nodeType === 1 && (node.matches(interactive) || node.querySelector(interactive))) { link = null; return; }
        if (!link && node.nodeType === 3 && !node.textContent.trim()) return;
        if (!link) {
          link = document.createElement('a');
          link.href = heading.hasAttribute('data-heading-reset') ? window.location.pathname + window.location.search : '#' + encodeURIComponent(heading.id);
          link.className = 'heading-scroll';
          link.title = t('scrollHeading', 'Scroll heading to top');
          heading.insertBefore(link, node);
          links.push(link);
          link.addEventListener('blur', function () { this.classList.remove('heading-shortcut-focus'); });
        }
        link.appendChild(node);
      });
      if (!links.length) return;
      heading.classList.add('heading-scrollable');
      headings.push(heading);
      heading.addEventListener('keydown', function (event) {
        if (event.key === ' ' && links.indexOf(event.target) !== -1 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
          event.preventDefault();
          event.target.click();
        }
      });
      heading.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        var control = event.target.closest(interactive);
        if (control && links.indexOf(control) === -1) return;
        var selection = window.getSelection();
        if (selection && !selection.isCollapsed) { event.preventDefault(); return; }
        event.preventDefault();
        align(heading);
      });
    });

    function cancelDestination() { destination = null; settledScrollY = null; }
    ['wheel', 'touchstart', 'pointerdown'].forEach(function (type) {
      window.addEventListener(type, cancelDestination, {passive: true});
    });
    window.addEventListener('scroll', function () {
      if (!destination) return;
      // Keep the last reached heading for sequential shortcuts at the page ends,
      // where several headings share the same clamped scroll position.
      if (settledScrollY !== null) {
        if (Math.abs(window.scrollY - settledScrollY) > 2) cancelDestination();
        return;
      }
      var top = window.scrollY + destination.getBoundingClientRect().top - offset(destination);
      var limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (Math.abs(window.scrollY - Math.max(0, Math.min(top, limit))) <= 2) settledScrollY = window.scrollY;
    }, {passive: true});
    window.addEventListener('popstate', cancelDestination);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Tab') {
        cancelDestination();
        document.querySelectorAll('.heading-shortcut-focus').forEach(function (link) { link.classList.remove('heading-shortcut-focus'); });
      }
      if (event.defaultPrevented || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;
      var direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
      if (!direction) return;
      var target = event.target;
      if (target && (target.isContentEditable || (target.closest && target.closest('input, textarea, select, [role="textbox"], [role="combobox"], [role="slider"], [role="spinbutton"]')))) return;
      if (document.body.classList.contains('menu-open') || document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]:not([hidden])')) return;
      event.preventDefault();
      if (event.repeat) return;
      // A key can arrive before the browser delivers a pending scroll event.
      if (settledScrollY !== null && Math.abs(window.scrollY - settledScrollY) > 2) cancelDestination();
      var visible = headings.filter(function (heading) { return heading.getClientRects().length > 0; });
      var next;
      if (destination && visible.indexOf(destination) !== -1) {
        next = visible[visible.indexOf(destination) + direction];
      } else {
        if (direction < 0) visible.reverse();
        next = visible.find(function (heading) {
          return direction * (heading.getBoundingClientRect().top - offset(heading)) > 2;
        });
      }
      if (!next) return;
      var link = next.querySelector('.heading-scroll');
      link.classList.add('heading-shortcut-focus');
      link.focus({preventScroll: true});
      align(next);
    });
  });

  // ── Heading anchors: click copies the section URL ───────────────────────
  (function () {
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
        // Anchor navigation and mobile reveal also work without Clipboard API.
        if (!navigator.clipboard) return;
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

  // ── Decorative ASCII scan on the 404 page ───────────────────────────────
  ready(function () {
    var art = document.querySelector('[data-ascii-animation]');
    if (!art) return;
    var source = art.textContent;
    var lines = source.split('\n');
    var glyphs = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var timer = null;
    var head = 0;

    function frame() {
      art.textContent = lines.map(function (line, row) {
        var distance = (head - row + lines.length + 8) % (lines.length + 8);
        var chance = distance < 5 ? (5 - distance) * 0.08 : 0;
        return Array.from(line, function (character) {
          return /\S/.test(character) && Math.random() < chance
            ? glyphs[Math.floor(Math.random() * glyphs.length)]
            : character;
        }).join('');
      }).join('\n');
      head = (head + 1) % (lines.length + 8);
    }

    function sync() {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      art.textContent = source;
      if (!document.hidden && !reducedMotion.matches) timer = window.setInterval(frame, 110);
    }
    document.addEventListener('visibilitychange', sync);
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', sync);
    else if (reducedMotion.addListener) reducedMotion.addListener(sync);
    sync();
  });

  // Mermaid: prioritize nearby diagrams, then prepare the rest during idle
  // time, including a neutral print copy. beforeprint cannot await a download.
  ready(function () {
    var configText = document.body.getAttribute('data-mermaid');
    if (!configText) return;
    var config = JSON.parse(configText);
    var entries = Array.from(document.querySelectorAll('.mermaid'), function (node) {
      // Keep readable source when JavaScript is disabled or the bundle fails.
      // Only hide it once this loader can restore it on a rendering failure.
      node.style.visibility = 'hidden';
      return { node: node, source: node.textContent, visible: false, cache: {}, displayed: null, failed: false };
    });
    if (!entries.length) return;
    var library;
    var running = false;
    var observer;
    var background = false;
    var printing = false;

    function screenTheme() {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'neutral';
    }

    function display(entry) {
      var theme = printing ? 'neutral' : screenTheme();
      if (entry.cache[theme]) {
        if (entry.displayed !== theme) entry.node.innerHTML = entry.cache[theme];
        entry.displayed = theme;
        entry.node.style.visibility = 'visible';
      } else if (printing || entry.failed) {
        entry.node.textContent = entry.source;
        entry.displayed = null;
        entry.node.style.visibility = 'visible';
      }
    }

    function load() {
      if (!library) {
        if (config.module) {
          library = import(config.src).then(function (module) { return module.default; });
        } else {
          library = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = config.src;
            if (config.integrity) {
              script.integrity = config.integrity;
              script.crossOrigin = 'anonymous';
              script.referrerPolicy = 'no-referrer';
            }
            script.onload = function () {
              if (window.mermaid) resolve(window.mermaid);
              else reject(new Error('Mermaid did not initialize'));
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
      }
      return library;
    }

    async function render() {
      if (running || printing) return;
      running = true;
      try {
        var mermaid = await load();
        mermaid.initialize({ startOnLoad: false });
        if (document.fonts) await document.fonts.ready;
        while (true) {
          if (printing) break;
          var theme = screenTheme();
          var entry = entries.find(function (item) {
            return item.visible && !item.failed && !item.cache[theme];
          });
          if (!entry && background) {
            theme = 'neutral';
            entry = entries.find(function (item) { return !item.failed && !item.cache[theme]; });
            if (!entry) {
              theme = screenTheme();
              entry = entries.find(function (item) { return !item.failed && !item.cache[theme]; });
            }
          }
          if (!entry) break;
          // Render offscreen and publish atomically. A theme change or print
          // dialog must never capture a half-built SVG or erase the last copy.
          var stage = document.createElement('div');
          stage.className = 'mermaid-render-stage';
          stage.setAttribute('aria-hidden', 'true');
          stage.inert = true;
          stage.style.width = entry.node.getBoundingClientRect().width + 'px';
          var node = document.createElement('pre');
          node.className = 'mermaid';
          node.textContent = entry.source;
          stage.appendChild(node);
          document.body.appendChild(stage);
          // Keep the established layout and label wrapping across Mermaid 11/12.
          // Mermaid 12 defaults to ELK, neo styling and narrower, fixed-width nodes.
          mermaid.initialize({
            startOnLoad: false, theme: theme, layout: 'dagre', look: 'classic',
            flowchart: { wrappingWidth: 200, minNodeWidth: 0 }
          });
          try {
            await mermaid.run({ nodes: [node] });
            entry.cache[theme] = node.innerHTML;
          } catch (error) {
            entry.failed = true;
          } finally {
            stage.remove();
          }
          display(entry);
        }
      } catch (error) {
        // A missing entry/chunk must leave readable source, not a blank block.
        entries.forEach(function (entry) {
          entry.failed = true;
          display(entry);
        });
        if (observer) observer.disconnect();
      } finally {
        running = false;
      }
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (changes) {
        changes.forEach(function (change) {
          if (!change.isIntersecting) return;
          entries.find(function (entry) { return entry.node === change.target; }).visible = true;
          observer.unobserve(change.target);
          render();
        });
      }, { rootMargin: '200px' });
      entries.forEach(function (entry) { observer.observe(entry.node); });
    } else {
      entries.forEach(function (entry) { entry.visible = true; });
      render();
    }
    new MutationObserver(function () {
      entries.forEach(display);
      if (background || entries.some(function (entry) { return entry.visible && !entry.failed; })) render();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    function prepareRemaining() {
      background = true;
      render();
    }
    function scheduleRemaining() {
      if ('requestIdleCallback' in window) window.requestIdleCallback(prepareRemaining, { timeout: 1000 });
      else window.setTimeout(prepareRemaining, 0);
    }
    if (document.readyState === 'complete') scheduleRemaining();
    else window.addEventListener('load', scheduleRemaining, { once: true });

    function printMode(active) {
      printing = active;
      entries.forEach(display);
      if (active) prepareRemaining();
      else render();
    }
    window.addEventListener('beforeprint', function () { printMode(true); });
    window.addEventListener('afterprint', function () { printMode(false); });
    var printMedia = window.matchMedia('print');
    if (printMedia.addEventListener) printMedia.addEventListener('change', function (event) { printMode(event.matches); });
    if (printMedia.matches) printMode(true);
  });

  // ── Wide blocks: use free inline-end space within the viewport ───
  (function () {
    var article = document.querySelector('article.beauty-reading');
    if (!article) return;
    var selector = ':scope > .article-image-wide, :scope > .article-diagram-wide';
    if (article.classList.contains('article-wide-code')) selector += ', :scope > .code-block';
    var blocks = article.querySelectorAll(selector);
    if (!blocks.length) return;
    var mobile = window.matchMedia(MOBILE_QUERY);
    var print = window.matchMedia('print');
    var queued = false;

    function measure() {
      queued = false;
      if (print.matches) return;
      blocks.forEach(function (block) {
        block.classList.remove('is-wide-code');
        block.style.removeProperty('--article-available');
      });
      if (mobile.matches) return;
      var rtl = getComputedStyle(article).direction === 'rtl';
      var viewport = document.documentElement.clientWidth;
      // CSS handles width limits, source size and print.
      blocks.forEach(function (block) {
        if (block.classList.contains('code-block')) {
          var overflowing = Array.prototype.some.call(block.querySelectorAll('pre, .highlight > div'), function (scroller) {
            return scroller.scrollWidth > scroller.clientWidth + 1;
          });
          block.classList.toggle('is-wide-code', overflowing);
        }
        var rect = block.getBoundingClientRect();
        block.style.setProperty('--article-available', Math.max(0, rtl ? rect.right : viewport - rect.left) + 'px');
      });
    }

    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    }

    onResize(schedule);
    article.addEventListener('load', schedule, true);
    print.addEventListener('change', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    if (window.ResizeObserver) {
      var observer = new ResizeObserver(schedule);
      observer.observe(article);
    }
    measure();
  })();

  // ── Side notes: reuse the original endnotes, only when a desktop gutter fits ──
  (function () {
    var article = document.querySelector('article[data-side-notes]');
    var section = article && article.querySelector(':scope > .footnotes');
    var list = section && section.querySelector(':scope > ol');
    if (!list || !list.children.length) return;
    var entries = Array.prototype.map.call(list.children, function (note) {
      var reference = Array.prototype.find.call(article.querySelectorAll('.footnote-ref'), function (ref) {
        try { return decodeURIComponent(ref.hash.slice(1)) === note.id; }
        catch (e) { return ref.hash.slice(1) === note.id; }
      });
      return { note: note, reference: reference };
    });
    if (entries.some(function (entry) { return !entry.reference; })) return;
    var heading = section.previousElementSibling;
    if (heading && /^H[2-6]$/.test(heading.tagName)) heading.classList.add('side-notes-heading');
    var print = window.matchMedia('print');
    var mobile = window.matchMedia(MOBILE_QUERY);
    var queued = false;

    function measure() {
      queued = false;
      article.classList.remove('has-side-notes');
      article.style.removeProperty('--sidenotes-overflow');
      if (print.matches || mobile.matches) return;
      var style = getComputedStyle(article);
      var gap = parseFloat(style.getPropertyValue('--article-sidenote-gap'));
      var space = parseFloat(style.getPropertyValue('--article-sidenote-space'));
      var rect = article.getBoundingClientRect();
      var rtl = style.direction === 'rtl';
      var available = (rtl ? rect.left : document.documentElement.clientWidth - rect.right) - gap - space;
      if (available < parseFloat(style.getPropertyValue('--article-sidenote-min-width'))) return;
      var width = Math.min(available, parseFloat(style.getPropertyValue('--article-sidenote-max-width')));
      article.style.setProperty('--sidenote-width', width + 'px');
      article.classList.add('has-side-notes');
      var left = rtl ? rect.left - gap - width : rect.right + gap;
      var right = left + width;
      var obstacles = Array.prototype.map.call(article.querySelectorAll(':scope > .article-image-wide, :scope > .article-diagram-wide, :scope > .code-block'), function (block) {
        return block.getBoundingClientRect();
      }).filter(function (block) { return block.left < right && block.right > left; });
      var end = 0;
      entries.forEach(function (entry) {
        var top = Math.max(end, entry.reference.getBoundingClientRect().top - rect.top);
        var height = entry.note.getBoundingClientRect().height;
        obstacles.forEach(function (block) {
          if (top < block.bottom - rect.top && top + height > block.top - rect.top) {
            top = block.bottom - rect.top + space;
          }
        });
        entry.note.style.setProperty('--sidenote-top', top + 'px');
        end = top + height + space;
      });
      // Long final notes must not cover the footer.
      var remaining = end - space - (list.getBoundingClientRect().top - rect.top);
      article.style.setProperty('--sidenotes-overflow', Math.max(0, remaining) + 'px');
    }

    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    }
    onResize(schedule);
    article.addEventListener('load', schedule, true);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    print.addEventListener('change', schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(article);
    measure();
    // Native fragment scrolling may precede both positioning and the font swap.
    // Settle an initial note link once; never pull a reader back after interaction.
    var initialHash = location.hash;
    var targetId = initialHash.slice(1);
    try { targetId = decodeURIComponent(targetId); } catch (e) { /* Keep literal IDs. */ }
    var target = document.getElementById(targetId);
    if (target && entries.some(function (entry) { return entry.note === target; })) {
      target.scrollIntoView();
      var cancelled = false;
      var inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
      function cancelAlignment() { cancelled = true; }
      inputs.forEach(function (type) { window.addEventListener(type, cancelAlignment, { passive: true }); });
      var loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(function (resolve) {
        window.addEventListener('load', resolve, { once: true });
      });
      Promise.all([loaded, document.fonts ? document.fonts.ready : Promise.resolve()]).then(function () {
        requestAnimationFrame(function () {
          inputs.forEach(function (type) { window.removeEventListener(type, cancelAlignment); });
          if (cancelled || location.hash !== initialHash) return;
          measure();
          target.scrollIntoView();
        });
      });
    }
  })();

  // ── Back to top: click area in the left gutter ──────────────────────────
  (function () {
    if (document.body.getAttribute('data-back-to-top') === 'false') return;

    var SCROLL_THRESHOLD = 400;
    var MIN_GUTTER = 130;
    var label = t('goUp', 'Go up');

    var wrap = document.createElement('a');
    wrap.className = 'back-to-top-wrap';
    // href keeps it keyboard-focusable; the handler preventDefaults the jump.
    wrap.setAttribute('href', '#');
    wrap.setAttribute('aria-label', label);

    var inner = document.createElement('div');
    inner.className = 'back-to-top';
    inner.innerHTML =
      '<svg class="back-to-top-icon" viewBox="0 0 16 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 22V2M3 7l5-5 5 5"/></svg>';
    inner.appendChild(document.createTextNode(label));

    wrap.appendChild(inner);
    document.body.appendChild(wrap);

    var gutterOk = false;

    function onScroll() {
      var shown = gutterOk && window.pageYOffset > SCROLL_THRESHOLD;
      wrap.setAttribute('tabindex', shown ? '0' : '-1');
      wrap.setAttribute('aria-hidden', String(!shown));
      if (shown) {
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
