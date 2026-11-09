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
layouts/_markup/               render hooks (headings, images, links, tables)
layouts/_shortcodes/           content helpers; see docs/content.md
assets/css/beauty.css          generated, pinned Beauty.css foundation; never edit by hand
assets/css/main.css            theme tokens, font loading, layout and components
assets/js/main.js              theme/menu controls, article shortcuts, code-copy, diagrams, sidebar
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

Browser checks need Node.js 22.12+ and development-only npm packages:

```bash
npm ci
npx playwright install chromium webkit
npm run test:browser
```

Each run builds an isolated Hugo fixture and starts its own local server; an existing server is never reused. Chrome/Chromium and WebKit cover wide tables, complex footnotes, article shortcuts, keyboard scrolling, both color schemes, offscreen diagrams, synchronous print preparation, delayed/failed module downloads and rapid theme changes. The fixture uses self-hosted Mermaid with animated edges and modern shapes. Chromium also generates a PDF. CI runs these checks at both supported Hugo versions. To use installed Chrome locally, set `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome`; `PLAYWRIGHT_PORT` selects another port.

Consuming sites may reuse `tests/browser/contracts.mjs` and `browserConfig({ site: true })` without duplicating assertions. The test server copies their content to a temporary directory and builds through their real config, assets and theme, adding only the test fixture and local Mermaid. `BROWSER_HUGO_CONFIG` accepts comma-separated config paths for optional site-owned fonts. Private fonts and test output must not be committed or uploaded as public CI artifacts.

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
Keep both language switchers working. The typography guide also has English and
Russian versions; update both together. Other guides under `docs/` are in English.
Keep the READMEs brief; link to `docs/` for implementation details. In Russian
README text, use `е` instead of `ё` consistently (and `Е` instead of `Ё`).
Use absolute HTTPS URLs for README images so they render in the Hugo Themes gallery.

## Reporting Issues

Please include Hugo version (`hugo version`), a minimal reproduction case, and expected vs. actual behavior.
