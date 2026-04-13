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

Mini has two Telegram features that share the same `telegramChannel` + `telegram_post` configuration: a Discussion comments widget, and live reaction/view counts surfaced next to the post date. See the dedicated [Telegram Integration](/telegram-integration/) post for the full walkthrough.

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

## Recent Posts Sidebar

Every single post shows a block of the most recent articles — automatically updated, no curation needed. On desktop with enough right-gutter space it appears as an absolute sidebar next to the article (scrolls with the page, Telegram blog style). On mobile it appears as a static block at the bottom of the post.

Configure the number of posts in `config.toml`:

```toml
[params]
  recentSidebarCount = 8   # default: 8
```

The list excludes the current post and any posts with `hidden = true`. Scroll to the bottom of this post to see the mobile version, or widen your browser window to see the sidebar.

## Heading Anchor Links

Markdown `##` and `###` headings get a clickable link-chain icon (Telegram blog style). On desktop, the icon sits in the left margin and appears on heading hover. On mobile, the icon is hidden by default — tap a heading to reveal it, then tap the icon to copy the section URL and scroll smoothly to the heading.

Implemented via `_markup/render-heading.html` render hook + minimal JS — no extra dependencies. Note: only fires for markdown-parsed headings, not raw HTML `<h2>...</h2>`. Headings also have a small `scroll-margin-top` so navigating to an anchor leaves a gap at the top of the viewport instead of pushing the heading flush against the edge.

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

## Nav Menu Icons

Any menu item can display an inline SVG icon via `params.icon`. Built-in icon: `telegram` (paper plane). On desktop the icon appears before the label with an elastic hover animation; on mobile it appears after the label, slightly larger.

```toml
[[languages.en.menu.main]]
  identifier = "telegram"
  name       = "Subscribe"
  url        = "https://t.me/your_channel"
  weight     = 3
  [languages.en.menu.main.params]
    icon = "telegram"
```

## Back to Top

On wide screens, hovering the left margin reveals a "Go up" label. Clicking anywhere in the left gutter scrolls back to the top — Telegram blog style. The button appears only after scrolling past 400px and only when the viewport is wide enough to have a meaningful gutter (> 130px). No configuration needed — works automatically on all pages.

## Mobile Navigation

On narrow screens, the navigation collapses into a full-screen overlay menu with a hamburger toggle. No external libraries — pure CSS and minimal JavaScript.
