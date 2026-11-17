# Homepages and collections

[Documentation](README.md) · [Writing content](content.md)

Build a homepage in `content/_index.md` using ordinary Markdown and the blocks below.
On multilingual sites, use each language's homepage file.

[Introduction](#homepage-introduction) · [Recent posts](#latest-articles) · [Featured posts](#featured-articles) · [Columns](#columns) · [Projects](#projects) · [Stars](#github-stars) · [Reading lists](#reading-lists)

## Homepage introduction

Begin with a native Markdown H1 and a short introduction. The heading uses the
title typeface at 36 px on desktop and 32 px on mobile, with 24 px before the
following text. Paragraphs use a compact 12 px interval.

| Spacing token | Default | Used for |
| --- | --- | --- |
| `--content-detail-gap` | 8 px | Related fields within a module |
| `--content-item-gap` | 12 px | Paragraphs, listing items, module heading to content |
| `--content-group-gap` | 24 px | Separate projects, archive link after a list |

Columns begin 64 px after the introduction above 768 px; mobile and print use
the shared 56 px section gap. These tokens do not change article line height,
paragraph rhythm or footer spacing.

## Latest articles

```text
{{< latest-posts count="3" archive="/blog/" archiveLabel="All articles" >}}
```

- `count` defaults to `3`; posts come from the current language's `mainSections`.
- Posts appear newest first. Hidden posts are excluded; normal Hugo builds also exclude drafts and future posts.
- Pinning applies only to category listings. With no eligible posts, the block is omitted.
- `archive` adds a link below the list; its optional `archiveLabel` defaults to the localized “Articles” label. Internal page URLs resolve in the current language when available.

Titles wrap normally within the column. The archive link uses medium weight and
a small arrow; ordinary article links stay light. Arrow motion respects reduced-motion
preferences and never shifts text.

## Featured articles

Use `params.featuredPosts` to choose articles and their order.

1. Add ordered **content paths** to your existing `[params]` table:

   ```toml
   [params]
     featuredPosts = ["/blog/first-steps", "/blog/what-i-learned"]
   ```

2. Insert the list in your homepage:

   ```text
   {{< featured-posts archive="/blog/" archiveLabel="All articles" >}}
   ```

A file at `content/en/blog/first-steps.md` uses `/blog/first-steps`, even if its
published URL is `/en/getting-started/`. Omit the content directory, language
directory and extension. Set `featuredPosts` under `[languages.<lang>.params]`
for a different selection in each language.

The configured order is preserved and duplicates are removed. Missing pages,
unavailable translations, hidden posts and pages outside `mainSections` are skipped.
Hugo's usual draft and future-date rules apply.

If nothing qualifies, the whole block disappears; there is no recent-post fallback.
The list determines the count. Selection does not affect dates, feeds, category
pinning or `latest-posts`.

The heading uses the `featured_posts` i18n key. Layout and archive options match
`latest-posts`.

## Columns

```text
{{< columns >}}
{{< latest-posts count="3" >}}
{{< column >}}
## Projects {.posts-group-title .no-anchor}

A short introduction to your projects.
{{< /column >}}
{{< /columns >}}
```

Above 768 px, blocks form two equal columns; smaller screens stack them in source
order. Each direct child block forms a column. `column` groups Markdown and nested
shortcodes into one block; post-list shortcodes already produce one block.

For unequal columns, use `columns ratio="3:2"` (60/40) or `ratio="2:3"` (40/60).
The default is `1:1`. Ratios divide the space remaining after the gutter; mobile
keeps a single column and the original reading order.

| Control | Purpose |
| --- | --- |
| `--columns-gap` | Horizontal separation |
| `--section-gap` | Space after and between stacked blocks |
| `--section-gap-large` | Larger separation before modules |
| `.posts-group-title` | Compact module heading with `--content-item-gap` before its content |
| `.no-anchor` | Omit a heading's copy link while keeping its ID |

The containing module supplies external spacing. Reading and keyboard order stay
unchanged when columns stack.

## Projects

```text
{{< project name="My project" url="https://example.com/" >}}
A short description. Source code on [GitHub](https://github.com/example/project).
{{< /project >}}

{{< project name="Another project" url="https://example.com/" icon="images/mark-light.svg" iconDark="images/mark-dark.svg" >}}
A project with a small mark that matches the color scheme.
{{< /project >}}
```

`name` links to the project URL with a decorative external-link arrow.
Descriptions accept Markdown and keep ordinary body-link weight. Put a secondary
source link in `<p class="beauty-note">…</p>` for smaller, muted text.

Optional `icon` and `iconDark` select light/dark marks. Local image URLs are
content-versioned; external URLs stay unchanged. With JavaScript, the mark becomes
a separate keyboard-accessible button that spins on activation. Without it, the
mark stays decorative. Reduced-motion preferences are respected.

Project fields use the 8 px detail gap; adjacent projects use the 24 px group gap.
The name's arrow moves on hover or keyboard focus without shifting text; its
motion is independent of the optional logo button.

## GitHub stars

```text
Source code on {{< github-stars repo="example/project" >}}.
```

The link shows an outlined star, an exact count and a localized accessible label.
Optional `label` replaces “GitHub”. Missing data produces a normal repository link;
zero is a valid count.

From your **site root**, fetch counts before building (requires Node.js):

```bash
node themes/hugo-mini/scripts/fetch-github-stars.mjs example/project
hugo --minify
```

| Behavior | Details |
| --- | --- |
| Multiple repositories | Pass several `owner/repo` arguments. |
| Saved data | `data/github_stars.json`; unchanged counts do not rewrite it. |
| Authentication | Optional `GITHUB_TOKEN` or `GH_TOKEN`; outside CI, an existing GitHub CLI login is also supported. |
| Failure handling | Ten-second request timeout; API failures preserve previous counts or omit unavailable ones. Invalid local data and write errors fail the command. |
| Privacy | Credentials are never printed or saved; browsers make no GitHub requests. |

Commit the data file for a fresh-checkout fallback. Run the helper before production
builds, or schedule rebuilds to refresh between posts. Hugo reads local data only.

## Reading lists

1. Create `data/books.toml`:

   ```toml
   [[items]]
   id = "example"
   title = "Book title"
   author = "Author"
   year = 2026
   read = "2026-10"
   added = "2026-10-25"
   rating = 8.5
   ```

2. Set `reading_list = "books"` in the collection article's front matter.
3. Insert `{{< reading-list >}}` in its body.

| Field | Requirement |
| --- | --- |
| `id`, `title`, `author` | Required strings |
| `read` | Required reading month, `YYYY-MM` |
| `year` | Optional publication year |
| `rating` | Optional number from 0 to 10; zero displays, missing values do not |
| `review` | Optional reference to an existing Hugo page, resolved in the current language and under a base path |
| `added` | Optional ISO date or timestamp; controls freshness |

### Translate display strings

Add translations within the same record:

```toml
[items.translations.en]
title = "English edition title"
author = "Author's published name"
```

Only `title` and `author` are localized; other fields stay shared. Missing translations
fall back to the original. Use published titles, or retain the original when a
translated edition is unconfirmed. UI labels and number formatting follow the page language.

### Freshness and reviews

`added` gives both a recent book and its collection the New badge for `newPostDays`
days. The collection's publication date does not activate its badge. Omit `added`
for historical imports; future dates do not activate badges early. Set
`newPostDays = 0` to disable badges.

The latest addition advances the collection's modification date in SEO metadata,
JSON Feed and sitemap. It does not change publication dates or move unrelated posts.

Reviews are ordinary articles. Create `content/blog/review-example.md` before adding
`review = "/blog/review-example"` to a book record, or omit `review` until the article
exists. A missing review target fails the build. Use `hidden = true` to omit the
review from listings and feeds while keeping it indexable and in the sitemap.

### Table layout

Books appear newest reading month first, in two columns: title above author/year/rating
on the left, reading month on the right. Long text wraps within its column.
The table's 20em minimum width scrolls inside a labeled, keyboard-accessible
`beauty-scroll` container on narrow screens.

Column labels share heading weight and a single rule. Title-to-metadata spacing is
one third of a paragraph interval; records use 1.25 intervals. A section gap follows
the table. No extra JavaScript or network requests are needed.
