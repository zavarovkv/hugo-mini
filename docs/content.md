# Content

Mini follows Hugo's regular content model. Put articles in the section selected by `params.mainSections`; `blog/` is a conventional choice.

## Front matter

```toml
+++
title = "A useful title"
slug = "useful-title"
date = 2026-08-17
description = "A concise summary."
categories = ["product"]
pinned = false
hidden = false
math = false
mermaid = false
+++
```

`pinned` moves a post to the top of its category group. `hidden` removes it from listings, recent posts, JSON Feed, and `llms.txt`, but the URL remains public and crawlable. Use `draft` for unpublished work. `telegram_post` can associate a post with a specific Telegram message.

## Categories

Categories are grouped on the section page. Add display names through i18n so slugs remain stable:

```toml
# i18n/en.toml
[category_product]
other = "Product"
```

## Shortcodes

| Shortcode | Use |
| --- | --- |
| `caption` | Image with a visible caption |
| `mermaid` | Diagram source rendered by Mermaid |
| `plug` | Compact callout or promotional block |

Enable KaTeX with `math = true` and Mermaid with `mermaid = true` only on pages that use them. Native Markdown `##` and `###` headings receive copyable anchor links automatically.
