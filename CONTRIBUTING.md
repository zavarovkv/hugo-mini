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

Layouts follow Hugo's current template system (0.146+): templates live at the
root of `layouts/`, and `_partials` / `_shortcodes` / `_markup` carry the
underscore prefix.

```
layouts/baseof.html            shell; defines the title/head/header/main/footer/scripts blocks
layouts/home.html              home page
layouts/list.html              section listings (blog index, grouped by category)
layouts/single.html            single post
layouts/home.json              JSON Feed output
layouts/home.llms.txt          llms.txt output for AI crawlers
layouts/_partials/             header, footer, nav, SEO tags, OG image, Telegram bits
layouts/_partials/custom_head.html  empty site-wide <head> hook
layouts/_partials/custom_body.html  empty site-wide <body>-end hook
layouts/_markup/               render hooks (headings, images, links)
layouts/_shortcodes/           caption, mermaid, plug
assets/css/main.css            all styles; design tokens declared at the top
assets/js/main.js              theme toggle, mobile menu, code-copy, sidebar
i18n/                          UI strings (en, ru)
exampleSite/                   demonstration site (bilingual)
archetypes/                    content scaffolding templates
scripts/                       optional Node helper for Telegram counters
```

CSS and JS are bundled through Hugo Pipes from `assets/` — minified and
fingerprinted. Do not add a second stylesheet or inline `<style>` blocks to
templates; put styles in `assets/css/main.css`, and colours in the token block
at the top of that file so they stay overridable.

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Test with the exampleSite: `hugo server --themesDir ../..`
4. Open a pull request with a clear description

## Reporting Issues

Please include Hugo version (`hugo version`), a minimal reproduction case, and expected vs. actual behavior.
