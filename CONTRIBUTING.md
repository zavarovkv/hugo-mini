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
layouts/baseof.html            shell; title/head/favicon/header/main/footer/scripts blocks
layouts/home.html              home page
layouts/list.html              section listings (blog index, grouped by category)
layouts/single.html            single post
layouts/home.json              JSON Feed output
layouts/home.llms.txt          llms.txt output for AI crawlers
layouts/_partials/             header, footer, nav, SEO tags, OG image, Telegram bits
layouts/_partials/custom_head.html  empty site-wide <head> hook
layouts/_partials/custom_body.html  empty site-wide <body>-end hook
layouts/_markup/               render hooks (headings, images, links)
layouts/_shortcodes/           content helpers; see docs/content.md
assets/css/beauty.css          generated, pinned Beauty.css foundation; never edit by hand
assets/css/main.css            theme tokens, font loading, layout and components
assets/js/main.js              theme toggle, mobile menu, code-copy, sidebar
i18n/                          UI strings (en, ru)
exampleSite/                   demonstration site (bilingual)
archetypes/                    content scaffolding templates
scripts/                       counter fetchers and maintainer asset-vendoring tools
tests/                         browser-behavior, template and helper regression tests
```

CSS and JS are bundled through Hugo Pipes from `assets/` — minified and
fingerprinted. Do not add a second stylesheet or inline `<style>` blocks to
templates. Shared typography and editorial helpers belong in Beauty.css; configure its public
variables in the token block of `assets/css/main.css`. Keep theme layout and component styles in
that file, and refresh the generated foundation only through `scripts/vendor-beauty.mjs` as
documented in `docs/vendor-assets.md`.

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. From the theme root, run `node --test tests/*.test.mjs` and
   `hugo -s exampleSite --themesDir ../.. --minify --panicOnWarning`.
   Check the example pages on mobile and desktop, in both color schemes and with keyboard navigation.
4. Open a pull request with a clear description

### README translations

`README.md` (English) and `README.ru.md` (Russian) are maintained together.
**Every README change must update all language versions in the same commit**,
including links, badges, screenshots, commands, examples, and feature descriptions.
Keep both language switchers working. Other documentation under `docs/` is
currently in English.
Keep the READMEs brief; link to `docs/` for implementation details. In Russian
README text, use `е` instead of `ё` consistently (and `Е` instead of `Ё`).
Use absolute HTTPS URLs for README images so they render in the Hugo Themes gallery.

## Reporting Issues

Please include Hugo version (`hugo version`), a minimal reproduction case, and expected vs. actual behavior.
