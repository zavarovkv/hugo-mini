# Mini

A fast, minimal, multilingual Hugo blog theme with dark mode, Telegram integration, and dynamic OG images.

**[Live Demo](https://zavarov.com/)**

## Features

- Dark / light theme with system preference detection
- Multilingual support (i18n)
- Dynamic Open Graph images (1200x630) generated per page
- Telegram channel CTA and discussion comments
- KaTeX math formulas (per-page opt-in)
- Mermaid diagrams (per-page opt-in)
- Likely social sharing buttons
- SEO: JSON-LD structured data, hreflang, Open Graph, Twitter Cards
- JSON Feed and llms.txt for AI crawlers
- Responsive design, mobile menu
- Inter font (self-hosted, no CDN)

## Quick Start

```bash
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/mini
```

Set in your `config.toml`:

```toml
theme = "mini"
```

## Configuration

### Required

```toml
baseURL = "https://example.com/"
title = "My Blog"

[params]
  favicon = "images/favicon.png"
  authorName = "Your Name"
  authorURL = "https://example.com/"

  [params.social]
    telegram = "https://t.me/your_handle"
    linkedin = "https://linkedin.com/in/you"
    github = "https://github.com/you"
    email = "you@example.com"
```

### Optional

```toml
[params]
  avatar = "images/avatar.webp"          # Header avatar
  avatarHover = "images/avatar-hover.webp" # Hover state avatar
  telegramChannel = "your_channel"       # Enables Telegram CTA on posts
  yandexMetrikaId = 123456789            # Yandex.Metrika (omit to disable)
  newPostDays = 30                       # "New" badge threshold

  [params.author]
    jobTitle = "Product Manager"         # Schema.org Person
```

### Multilingual

```toml
defaultContentLanguage = "ru"
defaultContentLanguageInSubdirectory = false

[languages]
  [languages.ru]
    weight = 1
    languageCode = "ru"
    languageName = "RU"
    title = "My Blog"
    contentDir = "content/ru"
  [languages.en]
    weight = 2
    languageCode = "en"
    languageName = "EN"
    title = "My Blog"
    contentDir = "content/en"
```

### Content

Blog posts use TOML front matter:

```toml
+++
title = "My Post"
slug = "my-post"
date = "2026-01-01T12:00:00+03:00"
description = "Post description"
categories = ["marketing"]
telegram_post = 42        # optional: Telegram discussion
math = true               # optional: enable KaTeX
mermaid = true            # optional: enable Mermaid
+++
```

### Category Display Names

Categories use slug identifiers with i18n display names. Add your categories to `i18n/ru.toml` and `i18n/en.toml`:

```toml
[cat_marketing]
other = "Marketing"
```

## Customization

Override any partial by placing it in your site's `layouts/partials/`:

- `custom_head.html` — additional CSS, verification meta tags
- `custom_body.html` — additional JS, analytics

## Requirements

- Hugo Extended >= 0.145.0

## License

MIT
