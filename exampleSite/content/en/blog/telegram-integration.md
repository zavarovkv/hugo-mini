+++
title = "Telegram Integration"
slug = "telegram-integration"
date = "2026-04-05T12:00:00+00:00"
description = "How to show a Telegram discussion, views and reactions on a blog post"
categories = ["getting-started"]
+++

A post can show the discussion from its Telegram message, with views and reactions beside the publication date. This demo has no channel connected.

## Discussion Comments

Set your public channel in `hugo.toml` and enable discussion for the message in Telegram.

```toml
[params]
telegramChannel = "your_channel"
```

Put the numeric message ID in the article’s front matter. For `https://t.me/your_channel/42`, use `telegram_post = 42`. The reader’s browser loads the Telegram widget as the comments section comes into view.

## Reactions & View Counts

<a id="how-it-works"></a>
<a id="setup"></a>

To display counters, run the helper from your site root before building. This example assumes Mini is installed under `themes/hugo-mini/`.

```bash
node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs
```

The helper saves a snapshot in `data/telegram_reactions.json`. Then run your usual site build. In the starter, `npm run build` also refreshes search.

<a id="graceful-degradation"></a>

Commit the snapshot or restore it from your CI cache to keep previous values during a Telegram outage. With no saved values, the article publishes without counters.

<a id="auto-resolution-and-overrides"></a>
<a id="complete-setup"></a>

[Script options and CI setup](https://github.com/zavarovkv/hugo-mini/blob/main/docs/telegram.md)
