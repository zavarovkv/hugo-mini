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

`pinned` moves a post to the top of its category group. `hidden` removes it from listings, recent posts, RSS, JSON Feed, and `llms.txt`, but the URL remains public and crawlable. Use `draft` for unpublished work. `telegram_post` is the positive numeric ID of a Telegram message, not its URL.

## Categories

Categories are grouped on the section page. Add display names through i18n so slugs remain stable:

```toml
# i18n/en.toml
[cat_product]
other = "Product"
```

## Shortcodes

| Shortcode | Use |
| --- | --- |
| `caption` | Caption text below an image |
| `mermaid` | Diagram source rendered by Mermaid |
| `plug` | Centered three-asterisk divider |
| `latest-posts` | Newest visible posts in the current language; `count="3"` by default |

Enable KaTeX with `math = true` and Mermaid with `mermaid = true` only on pages that use them. Native Markdown `##` and `###` headings receive copyable anchor links automatically.

Heading classes are preserved: `## Projects {.posts-group-title}` uses the same compact typography as category headings on the blog listing while retaining its heading level and anchor link.

Add `.no-anchor` to omit the copy link on an individual heading, for example `## Projects {.posts-group-title .no-anchor}`. The heading keeps its ID for direct links.

## Latest articles

Place `{{< latest-posts count="3" >}}` in your homepage `_index.md` wherever the list belongs. It follows `params.mainSections`, sorts by date, and excludes hidden posts. Hugo also excludes drafts and future posts in normal production builds. Pinned posts retain their date order here; pinning applies only to category listings. With no posts, nothing is rendered.

## Code highlighting

Set `markup.highlight.noClasses = false` to use Mini's light/dark syntax palette in its bundled stylesheet (including in any language-specific markup blocks). The `--syntax-*` CSS tokens control the palette. The example site enables this setting.

Setting `noClasses = true` preserves Hugo's inline colors and the configured `style`; those colors do not adapt to the theme toggle. Copy buttons are always visible on touch devices and appear on hover or keyboard focus elsewhere.
