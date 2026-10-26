// This tiny script runs inline before CSS, independently of the deferred bundle.
(function () {
  var theme;
  try {
    theme = localStorage.getItem('theme');
  } catch (e) {
    // Storage may be blocked; the system preference still applies.
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
