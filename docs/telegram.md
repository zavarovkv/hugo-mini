# Telegram integration

[Documentation](README.md) · [Configuration](configuration.md)

Link an article to a message in a public Telegram channel to show comments and,
optionally, saved view/reaction counts. Both the channel and message ID are required.

## Connect a post

1. Set the channel slug in your site configuration:

   ```toml
   [params]
     telegramChannel = "your_channel"
   ```

2. Set the message's positive numeric ID in the article's front matter:

   ```toml
   telegram_post = 123
   ```

   This example links to `https://t.me/your_channel/123`; do not put the URL in the field.

## Comments

Single posts load Telegram's Discussion widget lazily when both fields are present.
The widget follows the light/dark theme, including after page restoration; switching
themes updates the existing widget without reloading comments.

## Views and reactions

From your **site root**, run the optional Node.js helper before Hugo:

```bash
node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs
hugo --minify
```

It scans Markdown recursively, including `post/index.md` bundles, and writes
`data/telegram_reactions.json`. Requests read public embeds, retry rate limits and
preserve previous values when an individual request fails.

For an npm alias, merge this into your site's `package.json`:

```json
{
  "scripts": {
    "fetch-telegram-reactions": "node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs"
  }
}
```

## Configuration discovery and overrides

The helper reads channel and content directories from `hugo config --format json`;
ordinary setups need no flags. `TELEGRAM_CHANNEL` can override the channel.
For explicit control:

```bash
node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs \
  --channel your_channel \
  --content-dir content/en/blog \
  --output data/telegram_reactions.json
```

The built-in templates expect `data/telegram_reactions.json`. A different output
filename needs matching template changes. Paid star reactions are kept; premium
emoji without text fallbacks are skipped. View counts retain Telegram's formatting.

## Keep publishing during outages

Treat the fetch step as optional in CI if Telegram availability must not block
publishing. Templates handle missing data.

Commit or restore the data file **before** fetching to preserve previous counts.
A fresh runner without saved data has nothing to fall back to and builds without
counts during an outage. Hugo itself reads saved data; it does not fetch counters.
