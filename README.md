# Hugo Mini

A fast, minimal, multilingual Hugo blog theme with dark mode, Telegram integration, and dynamic OG images.

**[Live Demo](https://zavarov.com/)**

![screenshot](images/screenshot.png)

## Features

- **Dark / light mode** — follows system preference, toggleable in footer
- **Multilingual** — built-in i18n (ru, en), easy to extend
- **Dynamic OG images** — unique 1200×630 images generated per page at build time
- **Telegram integration** — optional channel CTA on posts + Discussion comments
- **KaTeX math** — per-page opt-in with `math = true`
- **Mermaid diagrams** — per-page opt-in with `mermaid = true`
- **Social sharing** — Likely buttons (Telegram, Twitter, Facebook, VK, LinkedIn)
- **SEO** — JSON-LD structured data, hreflang, Open Graph, Twitter Cards
- **Feeds** — JSON Feed, RSS, llms.txt for AI crawlers
- **Code copy button** — appears on hover, with check animation
- **Responsive** — mobile menu, touch-friendly footer controls
- **Self-hosted** — Inter font, no external CDN dependencies
- **Analytics** — Yandex.Metrika and Google Analytics support

## Requirements

Hugo Extended ≥ 0.145.0

## Installation

### Option A — Git submodule

```bash
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Set `theme = "hugo-mini"` in your `config.toml`.

### Option B — Hugo Modules

```toml
# config.toml
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
cp themes/hugo-mini/exampleSite/config.toml .

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
  favicon    = "images/favicon.png"   # relative to /static/
  authorName = "Your Name"
  authorURL  = "https://example.com/"

  # Appearance
  avatar      = "images/avatar.webp"        # header avatar (optional)
  avatarHover = "images/avatar-hover.webp"  # avatar on hover (optional)

  # Footer
  copyrightYear = 2024   # start year shown as "© 2024–CURRENT_YEAR"

  # Content
  newPostDays = 30   # days a post shows the "New" badge (default: 30)

  # Telegram (all optional)
  telegramChannel        = "your_channel"          # enables CTA block + comments
  telegramCTATitle       = "My Channel"            # CTA heading text
  telegramCTADescription = "Follow for more"       # CTA description text

  # Features
  socialSharing = true   # set false to disable Likely sharing buttons

  # Analytics
  yandexMetrikaId    = 123456789      # Yandex.Metrika ID (omit to disable)
  googleAnalyticsId  = "G-XXXXXXXXXX" # Google Analytics ID (omit to disable)

  # AI translation sparkle icon
  aiTranslatedLang = "en"   # show sparkle on this lang in switcher (omit to hide)

  # Schema.org Person
  [params.author]
    jobTitle = "Product Manager"

  # Social icons in footer
  [params.social]
    telegram = "https://t.me/your_handle"
    linkedin = "https://linkedin.com/in/you"
    github   = "https://github.com/you"
    email    = "you@example.com"
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

The theme uses CSS custom properties. Override them in your site's `layouts/partials/extra_head.html`:

```html
<style>
  :root {
    --color-primary: #0060a0;   /* links, title, focus ring */
    --color-accent:  #d04000;   /* hover states, active elements, badges */
  }
  [data-theme="dark"] {
    --color-primary: #6ab0e6;
    --color-accent:  #ff7a40;
  }
</style>
```

### Extending templates

Place files in your site's `layouts/partials/` to override theme partials:

| File | Purpose |
|---|---|
| `extra_head.html` | Additional `<head>` content — meta tags, custom CSS |
| `header.html` | Site header |
| `custom_head.html` | Replaces all theme CSS |
| `custom_body.html` | Replaces all theme JavaScript |

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
