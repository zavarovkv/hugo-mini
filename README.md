# Hugo Mini

[![Hugo](https://img.shields.io/badge/Hugo-%E2%89%A50.146-ff4088?logo=hugo&logoColor=white)](https://gohugo.io/)
[![GitHub Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![GitHub License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/zavarovkv/hugo-mini?style=flat)](https://github.com/zavarovkv/hugo-mini/stargazers)
[![Test example site](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)

A fast, minimal, multilingual Hugo blog theme with dark mode, Telegram integration, and dynamic OG images.

**[Live Demo](https://zavarov.com/)** · [Changelog](https://github.com/zavarovkv/hugo-mini/blob/main/CHANGELOG.md) · [Contributing](https://github.com/zavarovkv/hugo-mini/blob/main/CONTRIBUTING.md)

![screenshot](https://raw.githubusercontent.com/zavarovkv/hugo-mini/main/images/screenshot.png)

## Why Mini?

- **Writer-first.** Focus on typography and reading rhythm — no cards, no carousels, no hero sections. Everything serves the text.
- **Zero runtime dependencies.** No JavaScript framework, no CDN in the core path. One minified CSS file, one minified JS file — both fingerprinted and served from your domain. (Mermaid is the sole opt-in third-party dep, loaded only when a page sets `mermaid = true`, pinned and SRI-guarded — and fully avoidable via `params.mermaidSrc`.)
- **Fast out of the box.** Self-hosted Inter font with preloaded weights, lazy-loaded Telegram widget, static OG images built at compile time. Lighthouse 100 is the baseline, not a goal.
- **Batteries included, opt-in.** Dark mode, i18n, math, diagrams, analytics, Telegram comments, RSS/JSON/llms.txt feeds — all shipped, all disable-able.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Minimal](#minimal)
  - [All params](#all-params)
  - [Multilingual](#multilingual)
- [Content](#content)
  - [Creating posts](#creating-posts)
  - [Front matter](#front-matter)
  - [Categories](#categories)
- [Shortcodes](#shortcodes)
- [Customization](#customization)
  - [Colors](#colors)
  - [Nav menu icons](#nav-menu-icons)
  - [Extending templates](#extending-templates)
  - [Telegram reactions](#telegram-reactions)
  - [Asset bundling](#asset-bundling)
- [Deployment](#deployment)
- [License](#license)

## Features

### Content authoring
- ✍️ **Markdown-first** — standard Goldmark with `unsafe: true` for inline HTML; three shortcodes (`caption`, `mermaid`, `plug`)
- 🧮 **KaTeX math** — per-page opt-in with `math = true`
- 📊 **Mermaid diagrams** — per-page opt-in with `mermaid = true`
- 🏷️ **Categories** — group posts on the blog listing with `categories = ["slug"]`; display names come from i18n
- 📌 **Pinned posts** — `pinned = true` floats a post to the top of its category group
- 🔒 **Hidden posts** — `hidden = true` removes from listings but keeps the URL accessible (useful for drafts shared for review)
- 📋 **Code copy button** — appears on hover, with check animation
- 🔗 **Heading anchor links** — clickable `#` next to `h2`/`h3` headings copies the section URL; mobile tap-to-reveal behavior included

### Reading experience
- 🌓 **Dark / light mode** — follows system preference, toggleable in footer, persisted in `localStorage`
- 🗞️ **Recent posts sidebar** — last N posts (default 8, `params.recentSidebarCount`) shown on every single post: right-gutter sidebar on desktop, bottom block on mobile
- ⬆️ **Back to top** — Telegram-blog-style click area in the left gutter on wide screens; appears after scrolling past 400px
- 📱 **Responsive** — mobile overlay menu, touch-friendly footer controls, iOS-safe code block sizing
- ♿ **Accessibility** — visible focus ring, `prefers-reduced-motion` support, semantic landmarks

### Performance & SEO
- 🏎️ **Self-hosted assets** — Inter font (WOFF2), CSS, and JS all served from your domain; no external CDN
- 📦 **Asset bundling** — CSS and JS are minified and fingerprinted via Hugo Pipes (`/css/main.min.<sha>.css`), safe for long-cache headers
- 🖼️ **Dynamic OG images** — unique 1200×630 images generated per page at build time
- 🔍 **SEO** — JSON-LD structured data, `hreflang`, Open Graph, Twitter Cards
- 📡 **Feeds** — JSON Feed, RSS, `llms.txt` for AI crawlers

### Integrations
- 🌍 **Multilingual** — built-in i18n (ru, en) with per-language menus and footer switcher; easy to extend
- 💬 **Telegram comments** — Discussion widget, lazy-loaded, re-synced when the theme toggles
- ❤️ **Telegram reactions** — view counts and emoji reactions surfaced in the post meta row; bundled fetch script reads from the public Telegram embed
- 📤 **Social sharing** — Likely buttons (Telegram, Twitter, Facebook, VK, LinkedIn) without automatic third-party counter requests; disable with `socialSharing = false`
- 📈 **Analytics** — Yandex.Metrika, Google Analytics, Plausible, Umami (cookieless options); any combination, all optional
- 🎨 **Nav menu icons** — inline SVG icons on menu items via `params.icon` (built-in `telegram`)

## Requirements

Hugo Extended ≥ 0.146.0

## Installation

### Option A — Git submodule

```bash
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Set `theme = "hugo-mini"` in your `hugo.toml`.

### Option B — Hugo Modules

```toml
# hugo.toml
[module]
  [[module.imports]]
    path = "github.com/zavarovkv/hugo-mini"
```

```bash
hugo mod get github.com/zavarovkv/hugo-mini
```

## Quick Start

```bash
# Create new site
hugo new site myblog
cd myblog

# Add theme
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini

# Copy example config
cp themes/hugo-mini/exampleSite/hugo.toml .

# Create first post
hugo new blog/hello-world.md

# Start dev server
hugo server
```

## Configuration

### Minimal

```toml
baseURL = "https://example.com/"
title   = "My Blog"
theme   = "hugo-mini"

enableRobotsTXT = true
disableKinds    = ["taxonomy"]
ignoreErrors    = ["error-disable-taxonomy"]

[permalinks]
  blog = "/:slug/"

[params]
  favicon    = "images/favicon.png"
  authorName = "Jane Doe"
  authorURL  = "https://example.com/"

  [params.social]
    telegram = "https://t.me/janedoe"
    github   = "https://github.com/janedoe"
    email    = "jane@example.com"

[markup]
  [markup.goldmark.renderer]
    unsafe = true  # required for shortcodes and HTML in content

[menu]
  [[menu.main]]
    name   = "Articles"
    url    = "/blog/"
    weight = 1
```

### All params

```toml
[params]
  # Required
  favicon        = "images/favicon.png"       # 32x32, relative to /static/
  favicon192     = "images/favicon-192.png"   # optional, 192x192 (Android)
  appleTouchIcon = "images/apple-touch-icon.png" # optional, 180x180 (iOS)
  authorName = "Your Name"
  authorURL  = "https://example.com/"

  # Appearance
  avatar      = "images/avatar.webp"        # header avatar (optional)
  avatarHover = "images/avatar-hover.webp"  # avatar on hover (optional)

  # Footer
  copyrightYear = 2024   # start year shown as "© 2024–CURRENT_YEAR"

  # Content
  newPostDays          = 30   # days a post shows the "New" badge (default: 30)
  recentSidebarCount   = 8    # posts shown in the recent sidebar / mobile bottom block (default: 8)

  # Telegram (all optional)
  telegramChannel = "your_channel"   # enables Discussion comments widget + reactions

  # Features
  socialSharing = true   # set false to disable Likely sharing buttons
  consoleYoda   = true   # enables a built-in Yoda ASCII art in the home-page console
  consoleArt    = "..."  # optional custom ASCII art (TOML triple-string); takes priority over consoleYoda

  # Mermaid source (optional). Default is a pinned jsDelivr URL guarded by an
  # SRI hash. Point this at a local copy for a build with no third-party
  # requests at all — e.g. drop mermaid.min.js into static/js/ and set:
  mermaidSrc    = "js/mermaid.min.js"

  # Which section(s) hold your posts. Optional: Hugo sets it to the top-level
  # section with the most pages, so a site whose posts live in /posts or
  # /writing works without configuring anything. Set it explicitly on a site
  # with several large sections.
  mainSections = ["blog"]

  # Analytics (all optional — omit to disable, multiple can run side by side)
  yandexMetrikaId    = 123456789      # Yandex.Metrika ID
  googleAnalyticsId  = "G-XXXXXXXXXX" # Google Analytics 4 measurement ID
  plausibleDomain    = "example.com"  # Plausible: site domain (cookieless, GDPR-friendly)
  plausibleSrc       = "https://plausible.io/js/script.js"  # optional, override for self-hosted
  umamiWebsiteId     = "00000000-0000-0000-0000-000000000000"  # Umami website ID (cookieless)
  umamiSrc           = "https://cloud.umami.is/script.js"   # optional, override for self-hosted

  # AI translation sparkle icon
  aiTranslatedLang = "en"   # show sparkle on this lang in switcher (omit to hide)

  # Schema.org Person
  [params.author]
    jobTitle = "Product Manager"

  # Social icons in footer (all optional — only set ones are rendered)
  [params.social]
    telegram  = "https://t.me/your_handle"
    linkedin  = "https://linkedin.com/in/you"
    github    = "https://github.com/you"
    x         = "https://x.com/you"
    youtube   = "https://youtube.com/@you"
    facebook  = "https://facebook.com/you"
    instagram = "https://instagram.com/you"
    email     = "you@example.com"
```

### Multilingual

```toml
defaultContentLanguage              = "ru"
defaultContentLanguageInSubdirectory = false

[languages]
  [languages.ru]
    weight       = 1
    languageCode = "ru"
    languageName = "RU"
    contentDir   = "content/ru"
    [languages.ru.params]
      description = "Мой блог"
      authorName  = "Имя Фамилия"
  [languages.en]
    weight       = 2
    languageCode = "en"
    languageName = "EN"
    contentDir   = "content/en"
    [languages.en.params]
      description = "My blog"
      authorName  = "First Last"
```

## Content

### Creating posts

```bash
hugo new blog/my-post.md
```

### Front matter

```toml
+++
title       = "My Post"
slug        = "my-post"
date        = "2026-01-01T12:00:00+03:00"
description = "Post description for SEO and listing"
categories  = ["strategy"]

# Optional
telegram_post = 42     # Telegram post number — enables Discussion comments
math          = true   # enable KaTeX math rendering
mermaid       = true   # enable Mermaid diagrams
draft         = true   # exclude from production build
hidden        = true   # build page but hide from listing
pinned        = true   # float to top of its category on the blog listing
+++
```

### Categories

Categories are slug identifiers mapped to display names via i18n. Add your own in `i18n/en.toml`:

```toml
[cat_strategy]
other = "Strategy"
```

Built-in: `marketing`, `strategy`, `metrics`, `leadership`, `self-development`, `productivity`, `collections`, `getting-started`.

## Shortcodes

| Shortcode | Description | Usage |
|---|---|---|
| `caption` | Image caption | `{{</* caption */>}}Text{{</* /caption */>}}` |
| `mermaid` | Diagram block | `{{</* mermaid */>}} ... {{</* /mermaid */>}}` |
| `plug` | Section divider `* * *` | `{{</* plug */>}}` |

## Customization

### Colors

Every colour, the content width and the type stack are declared as CSS custom properties in one block at the top of `assets/css/main.css`. Redeclare any of them in your site's `layouts/_partials/custom_head.html` (the style-override hook — see [Extending templates](#extending-templates)) — no need to fork the stylesheet.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--width` | `720px` | — | content column width |
| `--font-main` / `--font-secondary` | Inter stack | — | type stack |
| `--font-scale` | `1em` | — | global type scale |
| `--background-color` | `#fff` | `#1a1a1a` | page background |
| `--heading-color` | `#222` | `#e8e8e8` | headings |
| `--text-color` | `#444` | `#c7ccd1` | body text |
| `--link-color` | `#0060a0` | `var(--color-primary)` | links |
| `--color-primary` | `#0060a0` | `#6ab0e6` | links, title, focus ring |
| `--color-accent` | `#d04000` | `#ff7a40` | hover states, active elements, badges |
| `--color-muted` | `#9da2a6` | — | secondary text, icons at rest |
| `--color-secondary` | `#556677` | — | mid-weight labels |
| `--blockquote-color` | `#222` | `#e8e8e8` | blockquote text |
| `--color-blockquote-border` | `#999` | `#555` | blockquote left rule |
| `--color-divider` | `#e5e5e5` | `#2a2a2a` | list and mobile-nav dividers |
| `--color-control-border` | `#ccc` | `#333` | theme/language toggle borders |
| `--color-control-border-hover` | `#999` | `#666` | same, on hover |
| `--color-primary-border` / `--color-accent-border` | `rgba(...)` | `rgba(...)` | translucent variants for focus/badges |

```html
<style>
  :root {
    --color-primary: #7c3aed;
    --color-accent:  #db2777;
    --color-divider: #ececec;
  }
  [data-theme="dark"] {
    --color-primary: #a78bfa;
    --color-accent:  #f472b6;
    --color-divider: #262626;
  }
</style>
```

### Nav menu icons

Add an inline SVG icon to any menu item via `params.icon`. The theme resolves it as `assets/icons/<name>.svg`, so alongside the bundled `telegram` you can add your own by dropping an SVG into your site's `assets/icons/` — no theme changes needed. On desktop the icon sits before the label with an elastic hover animation; on mobile it moves after it (CSS `order`).

```toml
[[languages.en.menu.main]]
  identifier = "telegram"
  name       = "Subscribe"
  url        = "https://t.me/your_channel"
  weight     = 3
  [languages.en.menu.main.params]
    icon = "telegram"
```

### Extending templates

There are three levels of extension, from least to most invasive.

**1. Site-wide hooks.** Add a file with one of these names to your site's `layouts/_partials/` and it is included at that point — nothing else is replaced:

| Hook | Rendered at | Use for |
|---|---|---|
| `custom_head.html` | end of `<head>`, after theme CSS | style overrides, meta tags, SEO/verification snippets, third-party `<head>` widgets |
| `custom_body.html` | end of `<body>`, after theme JS | extra scripts, chat widgets, any late-loaded markup |

Both are empty in the theme and exist purely to be replaced.

**2. Template blocks.** `layouts/baseof.html` wraps each region in a named block, so a template can replace one region without copying the whole file. Define any of them in `home.html`, `list.html`, `single.html`, or a template of your own:

| Block | Default | Use for |
|---|---|---|
| `title` | `Page Title \| Site Title` | custom `<title>` per template |
| `head` | empty | `<head>` additions for one template only |
| `header` | `partial "header.html"` | replace the site header |
| `main` | empty (required) | page content |
| `footer` | `partial "footer.html"` | replace the site footer |
| `scripts` | empty | `<script>` additions for one template only |

```go-html-template
{{ define "head" }}
  <link rel="preload" href="/hero.avif" as="image">
{{ end }}
{{ define "main" }}
  ...
{{ end }}
```

Use a hook when the addition applies to the whole site, and a block when it applies to one template.

**3. Full partial override.** To replace a theme partial outright, put a file with the same name in your site's `layouts/_partials/` (e.g. `layouts/_partials/header.html`) — standard Hugo lookup order applies. Note that `console-art.html` is theme-owned rather than a hook, so overriding `custom_body.html` no longer disables it.

### Telegram reactions

> **Optional, and the only part of the theme that needs Node.** Everything else — layouts, CSS, JS, fonts, math, diagrams, feeds — is pure Hugo and needs no toolchain beyond Hugo Extended. Skip this section entirely and the theme works fully; the meta row simply renders without counters.

The theme can surface view counts and emoji reactions from your Telegram channel into each post's meta row (next to the date). Enable it in three steps:

1. **Set `params.telegramChannel`** in your `hugo.toml` if you haven't already:
   ```toml
   [params]
     telegramChannel = "your_channel"   # without @
   ```

2. **Tag each post** that has a corresponding Telegram channel post with `telegram_post = NNN` in front matter (`NNN` = the message ID in the channel):
   ```toml
   +++
   title = "My Post"
   telegram_post = 42
   +++
   ```

3. **Wire the fetch script** into your site's `package.json` and run it before every Hugo build:
   ```json
   "scripts": {
     "fetch-telegram-reactions": "node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs"
   }
   ```

   Add the generated data file to `.gitignore`:
   ```
   /data/telegram_reactions.json
   ```

   And call it in CI before `hugo --minify`:
   ```yaml
   - name: Fetch Telegram reactions
     continue-on-error: true
     run: npm run fetch-telegram-reactions
   - name: Build
     run: hugo --minify
   ```

The script auto-resolves the channel and content directory via `hugo config --format json`, so no CLI flags are needed in the common case. It scrapes each post's public Telegram embed (`https://t.me/<channel>/<id>?embed=1`), parses reaction + view counts, and writes `data/telegram_reactions.json` which the theme partials `telegram-views.html` and `telegram-reactions.html` consume at build time. Missing data is handled gracefully — local dev builds without running the script still work.

Overrides for the common case:

```bash
node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs \
  --channel my_channel \
  --content-dir content/en/posts \
  --output data/tg.json
```

Also respects the `TELEGRAM_CHANNEL` env var. Requires Hugo Extended on PATH (for the config dump) and Node 18+ (for native `fetch` / `parseArgs`).

### Asset bundling

Theme CSS and JS live as source files in `themes/hugo-mini/assets/`:

- `assets/css/main.css` — bundled theme stylesheet (typography, palette, components, dark mode, fonts)
- `assets/js/main.js` — bundled theme JS (theme toggle, code-copy button, heading anchor copy, mobile menu, recent-posts sidebar positioning, back-to-top)

`baseof.html` runs them through Hugo Pipes:

```go-template
{{ $css := resources.Get "css/main.css"
   | resources.ExecuteAsTemplate "css/main.css" .
   | resources.Minify
   | resources.Fingerprint "sha256" }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">
```

The result is a minified, content-hashed file at `/css/main.min.<sha>.css` — safe to send long-cache headers, since the URL changes whenever the content changes. JavaScript uses the same pattern. Localized strings are passed through `body[data-i18n]`, so one compiled JS bundle serves every language.

## Deployment

### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
      - uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: latest
          extended: true
      - run: hugo --minify
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

### Netlify / Vercel

Set build command to `hugo --minify`, publish directory to `public`. Set environment variable `HUGO_VERSION` to `latest` and ensure **Hugo Extended** is used.

## License

[MIT](LICENSE)
