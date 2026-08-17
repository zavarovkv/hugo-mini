# Telegram integration

Set the public channel slug to enable Telegram features:

```toml
[params]
  telegramChannel = "your_channel"
```

## Comments

Single posts load Telegram's Discussion widget lazily. The widget is absent when `telegramChannel` is unset and synchronizes its appearance with the site's light or dark theme.

## Views and reactions

The included fetcher reads public Telegram embeds during the build and stores counts in Hugo data:

```bash
node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs
```

Set `telegram_post` in a post's front matter when its Telegram message cannot be resolved from the post URL. The script retries rate limits and preserves previous values when individual requests fail.

A typical `package.json` alias is:

```json
{
  "scripts": {
    "fetch-telegram-reactions": "node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs"
  }
}
```

Run it before `hugo --minify` in deployment. Treat the fetch as optional if publishing should continue during a Telegram outage; the templates handle missing data.
