+++
title = "Theme Features"
slug = "theme-features"
date = "2026-03-01T12:00:00+00:00"
description = "Dark mode, categories, new-post badges, social sharing, and other built-in features"
categories = ["getting-started"]
+++

Beyond Markdown and shortcodes, Mini includes several features that work through configuration — no code changes needed.

## Dark Mode

Mini detects your system's color scheme on first visit. A toggle button in the footer lets readers switch manually. The preference is saved in `localStorage`.

Dark mode automatically adjusts:

- Text and background colors
- Link and accent colors
- Code block highlighting
- Mermaid diagram colors
- Avatar image (shows hover variant in dark mode)

## Categories

Posts can be grouped by categories using front matter:

```toml
categories = ["getting-started"]
```

The blog listing page shows category pills at the top. Clicking a category filters posts instantly — no page reload, just JavaScript.

## "New" Badge

Posts newer than a configurable threshold (default 30 days) automatically show a red "New" badge on the blog listing page. Configure the threshold in `config.toml`:

```toml
[params]
  newPostDays = 30
```

## Social Sharing

Mini includes the [Likely](https://github.com/nicothin/likely) social sharing library. Sharing buttons appear at the bottom of each post — Telegram, Twitter, Facebook, VK, LinkedIn. Disable them with:

```toml
[params]
  socialSharing = false
```

## External Link Behavior

All external links in post content automatically open in a new tab with `rel="noopener noreferrer"`. This is handled by the render hook in `layouts/_default/_markup/render-link.html` — no JavaScript needed.

## Telegram Integration

Mini has built-in Telegram support. Add your channel to `config.toml`:

```toml
[params]
  telegramChannel = "your_channel"
  telegramCTATitle = "My Channel"
  telegramCTADescription = "Follow for more content"
```

This enables:

- A CTA block below each post inviting readers to subscribe
- Discussion comments via Telegram's widget (per-post, using `telegram_post` front matter)

## Multilingual

Mini supports two languages out of the box: English and Russian. The language switcher appears in the footer when a page has a translation. Configure languages in `config.toml`:

```toml
[languages]
  [languages.en]
    weight = 1
    contentDir = "content/en"
  [languages.ru]
    weight = 2
    contentDir = "content/ru"
```

## Hidden Posts

Set `hidden = true` in front matter to exclude a post from the blog listing while keeping it accessible by direct URL — useful for drafts shared with reviewers.

```toml
+++
title = "Secret Post"
hidden = true
+++
```

## Mobile Navigation

On narrow screens, the navigation collapses into a full-screen overlay menu with a hamburger toggle. No external libraries — pure CSS and minimal JavaScript.
