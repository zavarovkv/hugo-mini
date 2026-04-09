+++
title = "Under the Hood"
slug = "under-the-hood"
date = "2026-02-15T12:00:00+00:00"
description = "Architecture decisions and technical details that make Mini fast, private, and self-contained"
categories = ["getting-started"]
+++

Mini is built around a few deliberate constraints. This post explains what they are and why they matter.

## Zero External Requests

Every asset is self-hosted: fonts, CSS, JavaScript, icons. Your readers never send requests to Google Fonts, CDNs, or third-party analytics by default. This means:

- **Faster loads** — no DNS lookups, no waterfall of third-party resources
- **Full privacy** — no user data leaks to external services
- **Offline-capable** — the site works without an internet connection once cached
- **GDPR-friendly** — no cookie banners needed for font or analytics services

The only exceptions are opt-in: Mermaid (loaded from CDN per-page) and Telegram widgets (if configured).

## Conditional Loading

Heavy libraries are never loaded globally. Instead, they're gated by front matter flags:

| Library | Front matter | Size |
|---------|-------------|------|
| KaTeX | `math = true` | ~300 KB |
| Mermaid | `mermaid = true` | ~2 MB |
| Likely | always (unless disabled) | ~15 KB |

A typical blog post loads only HTML, CSS, and one font file. No JavaScript at all unless the page needs it.

## Inter Font

Mini uses [Inter](https://rsms.me/inter/) — a typeface designed specifically for screens. Only the weights actually used are included:

- **200** — light UI accents
- **300** — body text (comfortable for long reading)
- **300 italic** — blockquotes
- **400** — regular weight
- **500** — medium emphasis
- **600** — bold text, headings
- **700** — strong headings

Files are in WOFF2 format with Latin and Cyrillic subsets. Two weights (300 and 600) are preloaded in `<head>` to prevent layout shift.

## Render Hooks

Mini uses Hugo's render hooks to enhance Markdown output without shortcodes:

**Images** (`render-image.html`) — adds `loading="lazy"` and `decoding="async"` to every image automatically. No extra syntax needed.

**Links** (`render-link.html`) — detects external URLs and adds `target="_blank"` with `rel="noopener noreferrer"`. Internal links are left untouched.

## CSS Architecture

All styles live in two partials:

- `style.html` — base reset, typography, layout (theme-agnostic)
- `custom_head.html` — colors, components, dark mode, responsive rules

There's no build step, no Sass, no PostCSS. Raw CSS in `<style>` tags, inlined in `<head>` for zero render-blocking. CSS custom properties make theming straightforward:

```css
:root {
  --color-primary: #0060a0;
  --color-accent: #d04000;
}
```

## Dark Mode Implementation

Dark mode uses the `data-theme` attribute on `<html>`:

1. An inline `<script>` in `<head>` reads `localStorage` or `prefers-color-scheme` **before first paint** — no flash of wrong theme (FOUC)
2. CSS selects `[data-theme="dark"]` for all dark overrides
3. The footer toggle saves the choice to `localStorage`
4. System preference changes are respected until the user explicitly clicks the toggle

## SEO

Every page automatically gets:

- Open Graph meta tags (title, description, image, type)
- Structured data (JSON-LD) for articles
- Canonical URLs
- Hreflang tags for multilingual pages
- RSS feed with autodiscovery

## Code Copy Button

Code blocks show a copy button on hover — top-right corner, with a check animation on success. Pure JavaScript, no dependencies. The button inherits the code block's dark background, so it looks native in both themes.

## Performance Budget

A typical Mini page weighs under 50 KB (HTML + CSS + fonts). There are no layout shifts, no cumulative content jumps. Lighthouse scores consistently hit 100/100 on Performance, Accessibility, Best Practices, and SEO.
