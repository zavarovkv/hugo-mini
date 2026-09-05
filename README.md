# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

A writer-first Hugo theme for fast, multilingual personal blogs.

Clean typography, self-hosted assets, dark mode, SEO, and optional Telegram integration — without a frontend framework.

**[Live demo](https://zavarov.com/)** · **[Quick start](#quick-start)** · **[Documentation](#documentation)**

![Hugo Mini theme preview](https://raw.githubusercontent.com/zavarovkv/hugo-mini/main/images/screenshot.png)

## Why Mini

- **Made for reading.** The interface stays out of the way and gives articles room to breathe.
- **Fast by default.** CSS, JavaScript, and fonts are bundled, fingerprinted, and served from your domain.
- **Useful without a plugin stack.** Dark mode, multilingual navigation, feeds, search metadata, math, diagrams, and sharing are included.
- **Easy to grow.** Design tokens, template hooks, named blocks, and custom menu icons cover common extensions.

## Quick start

Hugo Extended 0.146 or newer is required.

```bash
hugo new site myblog
cd myblog
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Replace `hugo.toml` with a minimal configuration:

```toml
baseURL = "https://example.com/"
title = "My Blog"
theme = "hugo-mini"
enableRobotsTXT = true

[permalinks]
  blog = "/:slug/"

[params]
  authorName = "Jane Doe"
  authorURL = "https://example.com/"

[markup.goldmark.renderer]
  unsafe = true

[[menu.main]]
  name = "Articles"
  url = "/blog/"
  weight = 1
```

Create the blog section and your first article:

```bash
hugo new content blog/_index.md
hugo new content blog/hello-world.md
hugo server -D
```

Open `http://localhost:1313/`. For a ready-to-run reference, see the [example site](https://github.com/zavarovkv/hugo-mini/tree/main/exampleSite).

## What is included

| Area | Built in |
| --- | --- |
| Writing | Markdown, heading links, code copy, captions, KaTeX, Mermaid |
| Reading | Responsive layout, system-aware dark mode, recent posts, pinned posts |
| Discovery | Open Graph images, JSON-LD, `hreflang`, RSS, JSON Feed, `llms.txt` |
| Integrations | Telegram comments and reactions, social sharing, optional analytics |

Features that add weight are opt-in. KaTeX and Mermaid load only on pages that request them; analytics and Telegram are absent until configured.

## Is Mini a good fit?

Choose Mini if you want a text-led personal site or blog, prefer Hugo over a JavaScript application, and want sensible defaults with a small surface for customization.

It is probably not the right starting point for a magazine homepage, a visual portfolio, or a site that needs a component library and application-style interactions.

## Everyday configuration

Most sites only need a few parameters:

```toml
[params]
  favicon = "images/favicon.png"
  avatar = "images/avatar.webp"
  avatarHover = "images/avatar-hover.webp"
  copyrightYear = 2024
  recentSidebarCount = 8
  socialSharing = true

  [params.social]
    telegram = "https://t.me/janedoe"
    github = "https://github.com/janedoe"
    email = "jane@example.com"
```

Posts use TOML front matter:

```toml
+++
title = "My first post"
date = 2026-08-17
description = "A short summary for listings and search results."
categories = ["notes"]
pinned = false
math = false
mermaid = false
+++
```

Set `hidden = true` to keep a page out of listings and feeds while leaving its URL public. Use Hugo's `draft = true` when a page must not be published.

An empty or omitted `categories` list places a post in Miscellaneous. Set `recentSidebarCount = 0` to hide recent posts. A single `avatar` works without `avatarHover` in both color schemes.

## Optional integrations

- **Multilingual sites:** per-language menus, translated interface strings, `hreflang`, a footer language switcher, and internal Markdown links to available translations. Set `localizeLinks = false` to keep their original destinations.
- **Telegram:** lazy-loaded comments plus build-time view and reaction counts.
- **Math and diagrams:** per-page KaTeX and Mermaid switches.
- **Analytics:** Yandex Metrika, Google Analytics, Plausible, and Umami; each is disabled unless configured.
- **Customization:** color tokens, custom SVG menu icons, partial hooks, and named layout blocks.

## Documentation

- [Configuration and multilingual setup](https://github.com/zavarovkv/hugo-mini/blob/main/docs/configuration.md)
- [Writing and organizing content](https://github.com/zavarovkv/hugo-mini/blob/main/docs/content.md)
- [Customizing the theme](https://github.com/zavarovkv/hugo-mini/blob/main/docs/customization.md)
- [Telegram comments and reactions](https://github.com/zavarovkv/hugo-mini/blob/main/docs/telegram.md)
- [Deployment](https://github.com/zavarovkv/hugo-mini/blob/main/docs/deployment.md)
- [Changelog](https://github.com/zavarovkv/hugo-mini/blob/main/CHANGELOG.md) · [Contributing](https://github.com/zavarovkv/hugo-mini/blob/main/CONTRIBUTING.md)

## License

[MIT](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)
