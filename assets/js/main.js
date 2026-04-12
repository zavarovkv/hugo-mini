
  // Initialize Likely social sharing buttons
  if (typeof likely !== 'undefined') {
    likely.initiate();
  }

  // Mobile menu toggle
  (function() {
    function initMobileMenu() {
      var toggle = document.querySelector('.mobile-menu-toggle');
      var nav = document.querySelector('.main-nav');

      if (!toggle || !nav) {
        return;
      }

      function closeMenu() {
        nav.classList.remove('active');
        toggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.documentElement.classList.remove('menu-open');
      }

      function openMenu() {
        window.scrollTo(0, 0);
        nav.classList.add('active');
        toggle.classList.add('active');
        document.body.classList.add('menu-open');
        document.documentElement.classList.add('menu-open');
      }

      toggle.addEventListener('click', function() {
        if (nav.classList.contains('active')) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      // Close menu when clicking on a link
      var navLinks = nav.querySelectorAll('a');
      navLinks.forEach(function(link) {
        link.addEventListener('click', closeMenu);
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
      initMobileMenu();
    }
  })();

  // Theme toggle (bi-state: light ↔ dark; follows system until first explicit click)
  (function() {
    var STORAGE_KEY = 'theme';
    var LABELS = { light: {{ i18n "theme_dark" | default "Switch to dark theme" | jsonify | safeJS }}, dark: {{ i18n "theme_light" | default "Switch to light theme" | jsonify | safeJS }} };
    var root = document.documentElement;
    var mql = window.matchMedia('(prefers-color-scheme: dark)');

    function currentTheme() {
      return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function storedChoice() {
      try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    // Sync Likely social sharing widget with current theme
    function syncLikelyTheme() {
      var dark = currentTheme() === 'dark';
      var widgets = document.querySelectorAll('.likely');
      for (var i = 0; i < widgets.length; i++) {
        widgets[i].classList.toggle('likely-dark-theme', dark);
      }
    }

    // Rebuild Telegram Discussion widget with correct dark/light theme
    var tgWidgetLoaded = false;
    var tgRebuildTimer = null;
    function syncTelegramWidget() {
      var container = document.getElementById('tg-comments');
      if (!container) return;
      var discussion = container.getAttribute('data-tg-discussion');
      if (!discussion) return;
      if (tgRebuildTimer) clearTimeout(tgRebuildTimer);
      tgRebuildTimer = setTimeout(function() {
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
      }, tgWidgetLoaded ? 500 : 0);
    }

    // Lazy-load: only load Telegram widget when scrolled into view
    function observeTelegramWidget() {
      var container = document.getElementById('tg-comments');
      if (!container || typeof IntersectionObserver === 'undefined') {
        syncTelegramWidget();
        return;
      }
      var observer = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting && !tgWidgetLoaded) {
          syncTelegramWidget();
          observer.disconnect();
        }
      }, { rootMargin: '200px' });
      observer.observe(container);
    }

    // Follow system changes until user has made an explicit choice
    function onSystemChange() {
      if (storedChoice() === null) {
        root.setAttribute('data-theme', mql.matches ? 'dark' : 'light');
        var btn = document.querySelector('.theme-toggle');
        if (btn) btn.title = LABELS[currentTheme()];
        syncLikelyTheme();
        syncTelegramWidget();
      }
    }
    if (mql.addEventListener) {
      mql.addEventListener('change', onSystemChange);
    } else if (mql.addListener) {
      mql.addListener(onSystemChange); // Safari < 14
    }

    function initThemeToggle() {
      syncLikelyTheme();
      observeTelegramWidget();
      var btn = document.querySelector('.theme-toggle');
      if (!btn) return;
      btn.title = LABELS[currentTheme()];
      btn.addEventListener('click', function() {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
        root.setAttribute('data-theme', next);
        btn.title = LABELS[next];
        syncLikelyTheme();
        syncTelegramWidget();
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initThemeToggle);
    } else {
      initThemeToggle();
    }
  })();

  // Copy button for code blocks
  (function() {
    if (!navigator.clipboard) return;
    var svgCopy = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var svgCheck = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    var FEEDBACK_MS = 1500;

    document.querySelectorAll('.highlight').forEach(function(block) {
      var code = block.querySelector('code');
      if (!code) return;
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.innerHTML = svgCopy;
      btn.title = 'Copy';
      var timer = null;
      btn.addEventListener('click', function() {
        navigator.clipboard.writeText(code.textContent).then(function() {
          btn.innerHTML = svgCheck;
          btn.classList.add('copied');
          if (timer) clearTimeout(timer);
          timer = setTimeout(function() {
            btn.innerHTML = svgCopy;
            btn.classList.remove('copied');
            timer = null;
          }, FEEDBACK_MS);
        }).catch(function() { /* permission denied or insecure context */ });
      });
      block.appendChild(btn);
    });
  })();

  // Heading anchor links: copy section URL to clipboard on click.
  // Mobile: tap heading to reveal icon, tap icon to copy.
  (function() {
    if (!navigator.clipboard) return;
    var FEEDBACK_MS = 1200;
    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    document.querySelectorAll('.heading-anchor').forEach(function(anchor) {
      var heading = anchor.parentElement;
      var timer = null;

      // Mobile: tap heading to toggle anchor visibility
      if (isMobile && heading) {
        heading.addEventListener('click', function(e) {
          if (e.target === anchor || anchor.contains(e.target)) return;
          heading.classList.toggle('anchor-visible');
        });
      }

      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var url = window.location.origin + window.location.pathname + anchor.getAttribute('href');
        navigator.clipboard.writeText(url).then(function() {
          anchor.classList.add('copied');
          if (timer) clearTimeout(timer);
          timer = setTimeout(function() {
            anchor.classList.remove('copied');
            timer = null;
          }, FEEDBACK_MS);
        }).catch(function() { /* permission denied or insecure context */ });
      });
    });
  })();

  // Back to top — left gutter click area (Telegram blog style).
  // Creates a fixed overlay covering the left margin; visible only when
  // scrolled > 400px and the gutter is wide enough (> 130px).
  (function() {
    var SCROLL_THRESHOLD = 400;
    var MIN_GUTTER = 130;
    var label = {{ i18n "go_up" | default "Go up" | jsonify | safeJS }};

    var wrap = document.createElement('a');
    wrap.className = 'back-to-top-wrap';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', label);

    var inner = document.createElement('div');
    inner.className = 'back-to-top';
    inner.innerHTML = '<svg class="back-to-top-icon" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5l4-4 4 4"/></svg>' + label;

    wrap.appendChild(inner);
    document.body.appendChild(wrap);

    var gutterOk = false;

    function measure() {
      var body = document.body;
      var rect = body.getBoundingClientRect();
      var gutter = rect.left;
      gutterOk = gutter > MIN_GUTTER;
      wrap.style.width = gutter + 'px';
      wrap.style.display = gutterOk ? 'block' : 'none';
      onScroll();
    }

    function onScroll() {
      if (gutterOk && window.pageYOffset > SCROLL_THRESHOLD) {
        wrap.classList.add('shown');
      } else {
        wrap.classList.remove('shown');
      }
    }

    wrap.addEventListener('click', function(e) {
      e.preventDefault();
      window.scroll(0, 0);
      onScroll();
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    measure();
  })();
