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
| `project` | Linked project name with an external-link arrow, followed by a Markdown description |
| `columns` / `column` | Responsive columns; `column` groups Markdown and shortcodes into one column |

Enable KaTeX with `math = true` and Mermaid with `mermaid = true` only on pages that use them. Native Markdown `##` and `###` headings receive copyable anchor links automatically.

Heading classes are preserved: `## Projects {.posts-group-title}` uses the same compact typography as category headings on the blog listing while retaining its heading level and anchor link.

Add `.no-anchor` to omit the copy link on an individual heading, for example `## Projects {.posts-group-title .no-anchor}`. The heading keeps its ID for direct links.

## Latest articles

Place `{{< latest-posts count="3" >}}` in your homepage `_index.md` wherever the list belongs. It follows `params.mainSections`, sorts by date, and excludes hidden posts. Hugo also excludes drafts and future posts in normal production builds. Pinned posts retain their date order here; pinning applies only to category listings. With no posts, nothing is rendered.

Set `archive` to the article-listing URL to add a link below the list. `archiveLabel` sets its text (defaults to the localized "Articles" label). The link uses the same light weight as article titles, with a neutral, unlined right arrow matching the project-link style. Internal page URLs resolve to the current language when available.

```text
{{< latest-posts count="3" archive="/blog/" archiveLabel="All articles" >}}
```

## Columns

Use `columns` to display two equal columns above 768px and a single column on smaller screens. Each direct child block forms a column: `latest-posts` already renders one block, while `column` groups Markdown and nested shortcodes into one block. Spacing after and between stacked blocks uses the same `--section-gap` token as article-listing groups; both layouts share `--columns-gap` horizontally. The larger space before the columns and the footer uses `--section-gap-large`. Content order stays the same for keyboard navigation and screen readers.

```text
{{< columns >}}
{{< latest-posts count="3" >}}
{{< column >}}
## Projects {.posts-group-title .no-anchor}

A short introduction to your projects.
{{< /column >}}
{{< /columns >}}
```

## Projects

Use the `project` shortcode below a section heading. The name links to an external project page; the description accepts Markdown and keeps links at the same weight as the body text.

```text
{{< project name="My project" url="https://example.com/" >}}
A short description. Source code on [GitHub](https://github.com/example/project).
{{< /project >}}
```
