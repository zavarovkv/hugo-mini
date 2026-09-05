# AGENTS.md

This file provides guidance to Codex when working in the `hugo-mini` theme repository.

## Project Overview

`hugo-mini` is a fast, minimal, multilingual Hugo blog theme. It is developed as a standalone repository and is also consumed as a git submodule by `zavarov.com`. The theme owns reusable layouts, styles, scripts, fonts, KaTeX, Likely, shortcodes, i18n strings, the example site, and the optional Telegram reactions fetcher. Keep site-specific content and configuration out of this repository.

## Development Commands

Run commands from the theme repository root unless noted otherwise.

```bash
hugo server -s exampleSite --themesDir ../..                 # Local demo with live reload
hugo -s exampleSite --themesDir ../.. --minify               # Production-style build
node --check scripts/fetch-telegram-reactions.mjs            # Syntax-check the Node helper
```

Hugo Extended 0.146.0 is the supported minimum. CI builds the example site with both 0.146.0 and the latest Hugo release. The Telegram reactions script is normally invoked from a consuming site's root so it can resolve that site's Hugo config, content directory, and output path.

## Architecture

- `layouts/baseof.html` defines the shared page shell and template blocks.
- `layouts/home.html`, `list.html`, `single.html`, and `404.html` provide page layouts.
- `layouts/_partials/` contains reusable UI, SEO, structured-data, Open Graph, Telegram, and customization-hook partials.
- `layouts/_markup/` contains Goldmark render hooks for headings, images, and links.
- `layouts/_shortcodes/` contains `caption`, `mermaid`, `plug`, and `latest-posts`.
- `assets/css/main.css` is the single stylesheet; design tokens live at its top.
- `assets/js/main.js` is the single browser bundle for behavior that CSS cannot provide.
- `static/` contains self-hosted fonts, KaTeX, Likely, and shared images.
- `i18n/` contains built-in English and Russian interface strings.
- `exampleSite/` is the bilingual integration fixture and public demo content.
- `scripts/fetch-telegram-reactions.mjs` fetches Telegram view/reaction data for consuming sites.

Layouts use Hugo's current template system introduced in 0.146.0: page templates live directly under `layouts/`, while partials, shortcodes, and render hooks use the `_partials`, `_shortcodes`, and `_markup` directories.

## Design and Implementation Principles

- Stay minimal and writer-first; avoid feature creep and unnecessary runtime work.
- Prefer CSS over JavaScript. Add browser JavaScript only when CSS cannot implement the behavior.
- Preserve zero required configuration. Optional integrations must degrade gracefully when their params or data are absent.
- Keep critical assets self-hosted and avoid new third-party requests in the core page path.
- Put styles in `assets/css/main.css`, not inline `<style>` blocks or extra stylesheets. Add reusable colors and dimensions to the token block.
- Put browser behavior in `assets/js/main.js`, not inline scripts in templates.
- Keep templates site-agnostic. Expose reusable behavior through Hugo params, partial hooks, front matter, or i18n rather than hard-coding values for `zavarov.com`.
- Maintain accessibility, responsive behavior, dark mode, reduced-motion support, and semantic HTML when changing UI.
- Preserve compatibility with the declared Hugo minimum unless a version bump is intentional and documented in `hugo.toml`, README, CI, and changelog.

## Configuration and Compatibility

Public configuration is documented in `README.md` and defaults live in `hugo.toml`. Treat documented params, front-matter fields, shortcodes, partial hooks, generated output formats, and i18n keys as the theme's public API. Changes should remain backward-compatible where practical; document intentional breaking changes.

The empty `custom_head.html` and `custom_body.html` partials are supported extension hooks for consuming sites. Do not put site-specific markup into them.

The example site must continue to produce HTML, RSS, JSON Feed, `llms.txt`, sitemap, and both language variants declared in its config. Features such as analytics, Telegram, Mermaid, KaTeX, social sharing, and dynamic OG images must remain optional.

## Validation

For layout, CSS, JavaScript, asset, i18n, or example-content changes:

1. Run `hugo -s exampleSite --themesDir ../.. --minify`.
2. Confirm the build produces non-empty `exampleSite/public/index.html`, `index.json`, `llms.txt`, `sitemap.xml`, `ru/index.json`, and `ru/llms.txt`.
3. For visual or interaction changes, inspect the affected pages at desktop and mobile widths and test both color schemes when relevant.
4. For JavaScript helper changes, run `node --check` and exercise the smallest safe representative path. Do not overwrite a consuming site's reaction dataset during an unrelated test.

## Documentation and Releases

- Update `README.md` when public setup, configuration, behavior, or supported versions change.
- Update `CHANGELOG.md` for user-visible changes.
- Follow `CONTRIBUTING.md` for contribution conventions.
- `.github/RELEASE_TAG` triggers tag and GitHub release creation on `main`; change it only when a release is explicitly requested.
- Do not commit generated `exampleSite/public/`, Hugo resource caches, `.DS_Store`, or other ignored build artifacts.
