+++
title = "Under the Hood"
slug = "under-the-hood"
date = "2026-02-15T12:00:00+00:00"
description = "Architecture decisions and technical details that make Mini fast, private, and self-contained"
categories = ["getting-started"]
+++

Mini keeps the reading foundation separate from page layout and browser behavior.

## Self-hosted Assets

CSS, JavaScript, Inter fonts, KaTeX and sharing assets are served from the site's own domain. Ordinary Hugo builds need no npm installation. Optional Mermaid diagrams use a pinned CDN fallback unless the site provides a local bundle. Configured analytics, Telegram widgets and sharing actions can contact their own services.

## Conditional Loading

| Feature | When it loads |
| --- | --- |
| Shared theme CSS and JavaScript | Every page; minified and fingerprinted by Hugo |
| KaTeX | Pages with `math = true` |
| Mermaid | Near diagrams on pages with `mermaid = true` |
| Likely | Posts with social sharing enabled |
| Telegram comments | Near the comments section, when channel and message ID are configured |

A local Mermaid ESM bundle can load only the diagram modules in use. Failed downloads leave diagram source readable. Exact transfer size depends on content, enabled features and browser caching.

## Inter Font

The theme includes four WOFF2 faces with Latin and Cyrillic characters:

- **300** — body text
- **300 italic** — italic text
- **500** — medium emphasis and prominent links
- **600** — headings and bold text

Weights 300 and 600 are preloaded. Other faces load when used. The font license is included with the files.

## Render Hooks

**Images** (`render-image.html`) receive lazy loading and asynchronous decoding. Local raster images also receive intrinsic dimensions to reserve space. Raw HTML images need explicit dimensions; remote images are not downloaded during the build.

**Links** (`render-link.html`) open external URLs in a new tab with `rel="noopener noreferrer"`. Internal page links resolve to the current language when a translation exists; `localizeLinks = false` disables that behavior.

**Headings** (`render-heading.html`) retain IDs and optional classes. H2 and H3 headings receive a copyable section link unless marked `.no-anchor`.

## CSS Architecture

- `assets/css/beauty.css` is the generated, pinned Beauty.css foundation for native typography and editorial helpers.
- `assets/css/main.css` configures public tokens and owns fonts, page layout and theme components.

Hugo Pipes combines both into one minified, fingerprinted stylesheet. The shared browser bundle is cached across languages; localized labels come from HTML. No frontend framework or separate bundler is needed by a consuming site.

Use tokens in site-specific CSS rather than copying the shared typography:

```css
:root {
  --color-link: #0060a0;
  --color-accent: #b73700;
}
```

`custom_head.html` and `custom_body.html` are extension hooks, not the theme's stylesheet or script sources. Beauty updates go through the theme's vendoring helper with a reviewed upstream commit and checksum.

## Dark Mode

A small script resolves the saved or system preference before the stylesheet loads. The footer toggle saves an explicit choice in `localStorage`; until then, system changes remain active. CSS also follows the system palette without JavaScript.

## Metadata and Performance

Shared templates generate canonical URLs, social metadata, structured data, language alternates and feeds. Page-specific configuration controls indexing and optional features.

Measure the built site with representative content and an empty browser cache. Image dimensions, conditional loading and cached assets reduce avoidable work, but the theme does not guarantee a fixed page size, offline availability or a Lighthouse score.
