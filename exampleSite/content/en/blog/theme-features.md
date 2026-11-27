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
- Code block highlighting when `markup.highlight.noClasses = false`
- Mermaid diagram colors
- Avatar image (shows hover variant in dark mode)

## Search

Set `params.search = true` and install the [Pagefind build setup](https://github.com/zavarovkv/hugo-mini/blob/main/docs/search.md). The demo and starter already include it: run `npm ci`, then `npm run dev` or `npm run build`. Plain Hugo commands do not build the index.

Open the magnifier or press `Cmd/Ctrl+K`. Results stay in the current language and update after a short typing pause; all matches scroll with the field. Queries stay in the browser.

Unavailable search shows the same empty state as no matches. Editing the query, pressing Enter or reopening search tries again without a separate error screen.

## Categories

Posts can be grouped by categories using front matter:

```toml
categories = ["getting-started"]
```

The blog listing groups articles under category headings: two columns on desktop and one on mobile. Groups and article order are rendered by Hugo, without client-side filtering.

## "New" Badge

Posts newer than a configurable threshold (default 30 days) automatically show a green "New" badge on the blog listing page. Configure the threshold in `config.toml`:

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

External Markdown links in post content automatically open in a new tab with `rel="noopener noreferrer"`. This is handled by the render hook in `layouts/_markup/render-link.html` — no JavaScript needed.

## Telegram Integration

Mini has two Telegram features that share the same `telegramChannel` + `telegram_post` configuration: a Discussion comments widget, and build-time reaction/view counts next to the post date. See the dedicated [Telegram Integration]({{< relref "/blog/telegram-integration" >}}) post for the full walkthrough.

## Multilingual

Mini supports two languages out of the box: English and Russian. The footer lists other configured languages and links to the translated page, or that language's homepage when a translation is missing. Configure languages in `config.toml`:

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

Set `hidden = true` to omit a post from listings, feeds, `llms.txt` and local search. Its URL and sitemap entry remain public, and external search engines may still index it. Use `noindex = true` to request exclusion from those engines; use `draft = true` for unpublished content.

```toml
+++
title = "Unlisted Post"
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

Pinning changes order without adding a badge.

## Heading Anchor Links

On a wide screen, scroll past this article’s title to see the outline on the left. Select a section to jump to it. The demo enables `articleOutline` for posts with at least two H2 headings. The outline appears from `64rem` (usually 1024 px).

Click the title or an H2 to align it near the top, or use Option/Alt + ↑/↓ to move between headings (`headingScroll`). H3 headings keep their copy-link icon. Option/Alt + ← opens the older article and Option/Alt + → opens the newer one in the same language.

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

## Mobile Navigation

On narrow screens, the navigation collapses into a full-screen overlay menu with an animated four-dot toggle. The overlay initializes hidden, closes on Escape, link selection or focus leaving it, and returns to desktop navigation at the breakpoint. Without JavaScript, ordinary navigation links stay visible.
