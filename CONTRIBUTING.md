# Contributing to Mini

Thank you for your interest in contributing.

## Design Principles

1. **Stay minimal** — Fast and focused. Avoid feature creep.
2. **CSS over JS** — Prefer pure CSS. JavaScript is used only where CSS cannot achieve the result (theme toggle, mobile menu, Telegram widget sync).
3. **Zero required configuration** — New users should get started with minimal setup.
4. **Self-hosted assets** — No external CDN dependencies for critical resources.

## Local Development

```bash
git clone https://github.com/zavarovkv/hugo-mini.git
cd hugo-mini/exampleSite
hugo server --themesDir ../..
```

## Project Structure

```
layouts/partials/style.html       base CSS variables (light theme)
layouts/partials/custom_head.html main CSS (dark mode, components, responsive)
layouts/partials/custom_body.html JavaScript (theme toggle, mobile menu)
layouts/partials/footer.html      footer with social icons and controls
i18n/                             translations (ru, en)
exampleSite/                      demonstration site
archetypes/                       content scaffolding templates
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Test with the exampleSite: `hugo server --themesDir ../..`
4. Open a pull request with a clear description

## Reporting Issues

Please include Hugo version (`hugo version`), a minimal reproduction case, and expected vs. actual behavior.
