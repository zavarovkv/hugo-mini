+++
title = "Theme Features"
slug = "theme-features"
date = "2026-03-01T12:00:00+00:00"
description = "Dark mode, categories, new-post badges, social sharing, and other built-in features"
categories = ["getting-started"]
pinned = true
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

## Pinned Posts

Set `pinned = true` in front matter to float a post to the top of its category group on the blog listing. Multiple pinned posts within a category preserve reverse-chronological order between themselves; unpinned posts follow in reverse-chronological order. This very post uses it — it sits at the top of `getting-started` regardless of date.

```toml
+++
title = "Read this first"
pinned = true
+++
```

No visual marker — order is the only signal, keeping the listing clean.

## Popular Posts

Curated "popular posts" block rendered at the bottom of every single post. The list is author-picked, not algorithmic — set it in `config.toml`:

```toml
[params]
  popularPosts = [
    "theme-features",
    "under-the-hood",
    "hello-world",
    "math-demo",
  ]
```

Slugs are relative to the `blog/` section and resolved per current language via Hugo's `site.GetPage`, so RU pages show RU popular, EN pages show EN popular. Missing or renamed slugs are silently skipped, so temporarily broken entries don't break the build.

Visual style borrowed from Ilya Birman's Эгея engine and adapted to the theme: the heading uses the same `.posts-group-title` styling as category group titles on the blog listing, the list reuses `.blog-posts`, CSS `column-count: 2` splits it into two visual columns on desktop (one on mobile), and publication dates hide in the `title` attribute as a hover tooltip — keeping the block compact without losing the metadata.

You're looking at it right now — scroll to the bottom of this post.

## Heading Anchor Links

Markdown `##` and `###` headings get a clickable `#` next to them on hover. Clicking copies the section URL to the clipboard with brief feedback. The marker is sized down to ~body text and uses the same neutral grey as the social/theme/lang toggle icons in their rest state.

Implemented via `_markup/render-heading.html` render hook + minimal JS — no extra dependencies. Note: only fires for markdown-parsed headings, not raw HTML `<h2>...</h2>`.

## Privacy-friendly Analytics

In addition to Yandex.Metrika and Google Analytics, Mini supports two privacy-friendly cookieless options out of the box:

```toml
[params]
  plausibleDomain = "example.com"                       # Plausible
  umamiWebsiteId  = "00000000-0000-0000-0000-000000000000"  # Umami
```

Both load via deferred `<script>` tags so they don't block first paint. For self-hosted instances, override the script src with `plausibleSrc` / `umamiSrc`. All four analytics integrations can run side by side; each is rendered only when its required param is set.

## Console Easter Egg

Set `consoleYoda = true` in `[params]` to print a built-in Yoda ASCII art in the browser console on the home page:

```toml
[params]
  consoleYoda = true
```

For custom art, use `consoleArt` with a TOML triple-string instead — it takes priority over `consoleYoda` when both are set.

## Mobile Navigation

On narrow screens, the navigation collapses into a full-screen overlay menu with a hamburger toggle. No external libraries — pure CSS and minimal JavaScript.
