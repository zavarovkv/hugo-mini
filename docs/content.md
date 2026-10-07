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

Markdown images from page bundles or `static/` receive `width` and `height` automatically for supported local raster formats (JPEG, PNG, GIF, and WebP). They stay responsive; the attributes reserve their aspect ratio before downloading. External images are never fetched during the build. Raw HTML `<img>` tags bypass Markdown hooks, so include their intrinsic `width` and `height` explicitly.

| Shortcode | Use |
| --- | --- |
| `caption` | Caption text below an image |
| `mermaid` | Diagram source rendered by Mermaid |
| `plug` | Centered three-asterisk divider |
| `latest-posts` | Newest visible posts in the current language; `count="3"` by default |
| `project` | Linked project name with an external-link arrow, followed by a Markdown description |
| `github-stars` | Inline GitHub link with an optional, build-time star count |
| `columns` / `column` | Responsive columns; `column` groups Markdown and shortcodes into one column |
| `wavy-arrow` | Thin inline SVG arrow that follows the surrounding text color and size |

Enable KaTeX with `math = true` and Mermaid with `mermaid = true` only on pages that use them. Native Markdown `##` and `###` headings receive copyable anchor links automatically.

Heading classes are preserved: `## Projects {.posts-group-title}` uses the same compact typography as category headings on the blog listing while retaining its heading level and anchor link.

Add `.no-anchor` to omit the copy link on an individual heading, for example `## Projects {.posts-group-title .no-anchor}`. The heading keeps its ID for direct links.

## Wavy arrow

Place `{{< wavy-arrow >}}` between dates or other inline text:

```text
From 2021 {{< wavy-arrow >}} 2025, I taught product management.
```

The arrow has a gently rising stroke, one tilted oval loop, and a softly curved arrowhead. It uses `currentColor`, has no animation, and scales with the text (36px wide at a 16px font size), with its tip aligned to the middle of adjacent numerals. Its screen-reader label defaults to the localized `wavy_arrow_to` string ("to" in English, "по" in Russian); set `label="until"` to override it. The `--wavy-arrow-width` and `--wavy-arrow-height` CSS tokens default to `2.25em` and `1.125em`.

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

## GitHub stars

Use `github-stars` wherever an inline repository link fits, including inside a project description:

```text
Source code on {{< github-stars repo="example/project" >}}.
```

The link shows a thin outlined star and an exact count, with a localized accessible label. Optional `label` replaces the default "GitHub" text. Without data it remains a normal repository link; zero is displayed as a valid count.

From the consuming site's root, fetch counts before starting Hugo or building:

```bash
node themes/hugo-mini/scripts/fetch-github-stars.mjs example/project
hugo --minify
```

The helper accepts multiple `owner/repo` arguments and writes `data/github_stars.json`. Public repositories need no token; optional `GITHUB_TOKEN` or `GH_TOKEN` is used only by the helper. Outside CI it also reuses an existing GitHub CLI login, if available, to avoid the lower anonymous rate limit. Credentials are never printed or saved. Each request has a ten-second timeout. API failures preserve previous counts, or omit an unavailable counter, while invalid local data and write errors fail normally. Unchanged counts do not rewrite the file. Commit this data file if you want a fallback available in fresh checkouts.

Run the helper before every production build to update automatically on deploy. A scheduled rebuild can refresh counts between content updates. Hugo itself uses the local data only, so builds and browsers remain independent of GitHub availability.
