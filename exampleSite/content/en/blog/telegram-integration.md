+++
title = "Telegram Integration"
slug = "telegram-integration"
date = "2026-04-05T12:00:00+00:00"
description = "Channel CTA, Discussion comments, and live reaction counts — the theme's three Telegram features"
categories = ["getting-started"]
+++

Mini treats Telegram as a first-class engagement surface for blogs whose audience lives partly on the messenger. Three independent features plug into the same `telegramChannel` + `telegram_post` configuration:

1. A subscribe CTA block below every post
2. Discussion comments via Telegram's official widget
3. Live reaction counts and view counts surfaced next to the post date

Each feature renders only when its config is present, so you can enable them one at a time.

## Channel CTA

Set your channel username (without `@`) in `config.toml`:

```toml
[params]
  telegramChannel        = "your_channel"
  telegramCTATitle       = "My Channel"
  telegramCTADescription = "Follow for more content"
```

Mini adds a compact CTA block below every single post with a "Subscribe" button. Hides itself if `telegramChannel` is unset.

## Discussion Comments

Tag each post with the message ID of the corresponding channel post:

```toml
+++
title = "My Post"
telegram_post = 42
+++
```

Mini embeds Telegram's official Discussion Comments widget on the page, lazy-loaded when the section scrolls into view (via `IntersectionObserver`). The widget syncs with the theme toggle — flips to dark/light mode in real time by rebuilding itself when the user clicks the theme button.

## Reactions & View Counts

The theme ships a zero-dependency Node script that scrapes public Telegram embeds for each of your posts and writes reaction + view counts to `data/telegram_reactions.json`. Two partials (`telegram-views.html` and `telegram-reactions.html`) read that data and render an inline row next to the post date:

```
👁 857   Aug 28, 2024                              ⭐ 11   ❤ 7
```

Eye icon + view count on the left, reactions aligned right via flexbox. On mobile, the two groups stack vertically. The eye glyph is a filled monochrome two-path SVG with a circular pupil — borrowed from Ilya Birman's blog — rendered in `currentColor` so it matches the surrounding text.

### How it works

1. For every post with `telegram_post = NNN`, the script fetches `https://t.me/<channel>/<id>?embed=1` — a public URL, no auth required
2. Parses the embedded HTML for `<span class="tgme_reaction">` elements and the `.tgme_widget_message_views` span
3. Writes a single JSON file that Hugo loads via `site.Data.telegram_reactions`
4. The theme partials look up the current post's ID in that map and render the row — or render nothing if the data is missing

Paid star reactions (`⭐`) are preserved. Custom premium emoji with no text fallback are skipped. View counts preserve Telegram's formatting (`1.2K`, `857`).

### Setup

Add to your site's `package.json`:

```json
"scripts": {
  "fetch-telegram-reactions": "node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs"
}
```

Add the generated file to `.gitignore` — it's regenerated on every build, not versioned:

```
/data/telegram_reactions.json
```

Call the script in CI before `hugo --minify`:

```yaml
- name: Fetch Telegram reactions
  continue-on-error: true
  run: npm run fetch-telegram-reactions
- name: Build
  run: hugo --minify
```

`continue-on-error: true` is important — if Telegram is unreachable, the deploy still goes through and the partials render nothing instead of breaking the build.

### Auto-resolution and overrides

The script auto-resolves channel and content directory from Hugo config via `hugo config --format json`. In the common case no flags are needed. To override:

```bash
node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs \
  --channel my_channel \
  --content-dir content/en/posts \
  --output data/tg.json
```

Also respects the `TELEGRAM_CHANNEL` env var.

### Graceful degradation

The partials render nothing when:

- The data file doesn't exist (local dev without running the fetch script)
- The post has no `telegram_post` front matter
- The entry for this post's ID is missing (post deleted, fetch failed, etc.)

This means you can `hugo server` locally without ever running the fetch script — the site just won't show reaction counts. Same for first-time clones.

## Complete Setup

To enable all three features at once, add to `config.toml`:

```toml
[params]
  telegramChannel        = "your_channel"
  telegramCTATitle       = "My Channel"
  telegramCTADescription = "Follow for more content"
```

Then in each post that has a corresponding Telegram message:

```toml
+++
title = "My Post"
telegram_post = 42
+++
```

And wire the fetch script into `package.json` + CI as shown above.

That's it — CTA block, comments widget, and live reaction counts all kick in on every post that has `telegram_post` set. Remove the `telegram_post` field from a post's front matter and the comments widget + reactions row disappear for that post specifically.
