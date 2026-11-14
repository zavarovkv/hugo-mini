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
- `layouts/_partials/typography/` applies build-time prose spacing and Russian punctuation rules to rendered page bodies. Keep sources, metadata, URLs, HTML attributes, code, diagrams and formulas intact; Goldmark owns its native punctuation and Beauty.css owns visual typography. Document changes in both `docs/typography.md` and `docs/typography.ru.md` and exercise `tests/typography.test.mjs`.
- `layouts/_markup/` contains Goldmark render hooks for headings, images, links, and tables.
- `layouts/_shortcodes/` contains `image`, `caption`, `callout`, `mermaid`, `plug`, `latest-posts`, `featured-posts`, `project`, `columns`, `column`, `github-stars`, `reading-list` and `wavy-arrow`.
- `wideCode = true` in page front matter opts long fenced code blocks into the same geometry as wide images; short examples keep the reading width. Use the shared `--article-wide-width` / `--article-edge-gap` tokens, without changing code contents, typography, scrolling or print.
- Optional `hangingQuotes` and `proseNumerals` select Beauty editorial helpers; `fraction` accepts explicit fractions only. Keep source text, metadata, technical spans and print margins intact; document both languages in the typography guides.
- Per-page `dropCap` selects Beauty's first-paragraph initial; title family/weight are mapped through shared tokens. Keep it opt-in, preserve native text, mobile/print fallbacks and short-paragraph containment. Publication credits reuse `beauty-note`, after the conclusion and before footnotes.
- `mermaid wide=true` opts individual diagrams into the same wide-figure geometry; optional `caption` uses the same Beauty typography as image captions. Preserve raw-source fallback and the existing SVG theme/print cache.
- Wide `image` figures preserve the text's inline-start edge and expand toward the inline end up to 960 px. The theme owns geometry and respects source/viewport limits; Beauty supplies native image/caption typography. Keep source/viewport limits, mobile, print and no-JavaScript behavior; see `docs/content.md#wide-images`.
- `assets/css/main.css` owns theme identity/components and public tokens. The pinned, generated
  `assets/css/beauty.css` foundation is bundled before it into one browser stylesheet.
- `assets/js/main.js` is the single browser bundle for behavior that CSS cannot provide.
- Article Option/Alt + Left/Right navigation uses `article-neighbors.html` and the cached current-language `main-pages.html` collection. Left means older, right means newer; hidden posts and drafts are excluded, pinning does not reorder navigation, and boundaries never wrap. Keep the feature invisible and leave editing/overlay keyboard behavior intact.
- `assets/js/theme-init.js` is the small, testable before-paint exception, inlined before CSS to resolve the saved or system color scheme.
- `assets/likely/` contains upstream sharing CSS/JS, minified and fingerprinted by Hugo only for pages with sharing enabled.
- `static/` contains the four used Inter font faces, their license, and KaTeX.
- `i18n/` contains built-in English and Russian interface strings.
- `exampleSite/` is the bilingual integration fixture and public demo content.
- `scripts/fetch-telegram-reactions.mjs` fetches Telegram view/reaction data for consuming sites.

Layouts use Hugo's current template system introduced in 0.146.0: page templates live directly under `layouts/`, while partials, shortcodes, and render hooks use the `_partials`, `_shortcodes`, and `_markup` directories.

## Design and Implementation Principles

- Stay minimal and writer-first; avoid feature creep and unnecessary runtime work.
- Prefer CSS over JavaScript. Add browser JavaScript only when CSS cannot implement the behavior.
- Preserve zero required configuration. Optional integrations must degrade gracefully when their params or data are absent.
- Keep critical assets self-hosted and avoid new third-party requests in the core page path.
- Put theme layout and component styles in `assets/css/main.css`, not inline blocks or extra stylesheets. Shared native typography and editorial helpers belong to Beauty.css; configure its variables instead of copying selectors into the theme. Add reusable colors and dimensions to the token block.
- Never edit the generated Beauty.css artifact. Refresh it with `scripts/vendor-beauty.mjs`
  using a full upstream commit SHA; its manifest and license live in `vendor/`.
- Reading type, wrapping, heading rhythm and compound-link decorations belong to Beauty. Select
  its `beauty-reading`, `beauty-link-label`, `beauty-link-icon` and `beauty-nowrap` helpers in markup;
  keep theme CSS limited to variable configuration, layout and UI components. Numeric highlights
  (`beauty-stat-*`) and connected steps (`beauty-steps`) also belong to the library.
- Joint local development may use `--local <checkout>` with an explicitly unreleased `-dev` library version. Replace that snapshot with a reviewed upstream pin before releasing the theme; see `docs/vendor-assets.md`.
- Put browser behavior in `assets/js/main.js`, not inline scripts in templates.
- Keep templates site-agnostic. Expose reusable behavior through Hugo params, partial hooks, front matter, or i18n rather than hard-coding values for `zavarov.com`.
- Keep version-specific data and site collection access in `site-data.html` and `sites.html`; callers use cached partials instead of duplicating Hugo API fallbacks.
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
5. For layout or Mermaid changes, run `npm ci`, `npx playwright install chromium webkit`, and `npm run test:browser`. This is a maintainer-only toolchain; ordinary Hugo users do not need npm. The isolated browser fixture covers local table overflow, complex footnotes, article shortcuts, print, both color schemes and delayed/failed diagram downloads. Shared assertions can also run against a consuming site's build; see `CONTRIBUTING.md`.

## Documentation and Releases

- Update every README translation when public setup, configuration, behavior, or supported versions change.
- Keep `README.md` (English) and `README.ru.md` (Russian) synchronized in the same commit whenever either README changes. Apply every content, link, badge, screenshot, example, and version update to **all existing README languages**, preserving their meaning and language switchers; never update only one translation.
- Keep both READMEs concise and benefit-first; put detailed parameters and technical explanations under `docs/` instead of long README paragraphs.
- Use absolute HTTPS URLs for images in READMEs: the Hugo Themes gallery also renders `README.md`, and repository-relative image paths break there.
- In the Russian README, always write `е`/`Е` instead of `ё`/`Ё`, including headings and image descriptions. Keep code examples unchanged.
- Keep translated documentation in sync with its English counterpart. Russian documentation uses `е` instead of `ё`.
- Update `CHANGELOG.md` for user-visible changes.
- Follow `CONTRIBUTING.md` for contribution conventions.
- `.github/RELEASE_TAG` triggers tag and GitHub release creation on `main`; change it only when a release is explicitly requested.
- Do not commit generated `exampleSite/public/`, Hugo resource caches, `.DS_Store`, or other ignored build artifacts.

## Site-owned font profiles

`font-profile.html` validates optional `params.fonts` assets and role weights. The theme owns loading and typography; consumers own any licensed files. Keep CSS output keys profile-specific and honor `useDefaultFonts` on independent pages. Never copy proprietary consumer fonts into the theme. See `docs/fonts.md`.

`articleH2UseTitleFont` is an opt-in top-level parameter for H2 inside post bodies in `mainSections`. Reuse the H1 family and weight through Beauty tokens; preserve H2 geometry and other heading roles, page overrides and `useDefaultFonts`.

Built-in blog templates, including 404, select `reading-layout` through the `bodyClass` block. Theme tokens configure 18/28 px desktop reading, 19/29 px mobile reading and a 720 px column; independent templates and print retain their own scale. Visible page titles use `typography/title.html`; metadata and URLs must remain unchanged. The table render hook adds native time semantics only for whole, validated ISO-date cells.
