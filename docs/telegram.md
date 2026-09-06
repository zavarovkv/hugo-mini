# Telegram integration

Set the public channel slug to enable Telegram features:

```toml
[params]
  telegramChannel = "your_channel"
```

## Comments

Single posts load Telegram's Discussion widget lazily. The widget is absent when `telegramChannel` is unset and synchronizes its appearance with the site's light or dark theme, including after page restoration. Theme changes update the existing widget without reloading comments.

## Views and reactions

The included fetcher reads public Telegram embeds during the build and stores counts in Hugo data:

```bash
node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs
```

Set a positive numeric `telegram_post` in each linked post's front matter, for example `telegram_post = 123` for `https://t.me/your_channel/123`. Both the channel and message ID are required for comments. The script scans Markdown recursively, including `post/index.md` page bundles, retries rate limits, and preserves previous values when individual requests fail.

A typical `package.json` alias is:

```json
{
  "scripts": {
    "fetch-telegram-reactions": "node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs"
  }
}
```

Run it before `hugo --minify` in deployment. Treat the fetch as optional if publishing should continue during a Telegram outage; the templates handle missing data.

Keeping previous values requires restoring the data file before the fetch. A fresh CI runner without a cache or artifact has no previous counts; during an outage the site then builds without them.
