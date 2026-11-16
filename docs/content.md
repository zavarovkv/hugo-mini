<a id="content"></a>

# Writing content

[Documentation](README.md) · [Media](media.md) · [Typography](typography.md) · [Homepage](homepage.md) · [CV](resume.md)

Put articles in the section selected by `params.mainSections`; `blog/` is a
conventional choice. Use ordinary Hugo Markdown files and page bundles.

## Front matter

```toml
+++
title = "A useful title"
slug = "useful-title"
date = 2026-08-17
description = "A concise summary."
categories = ["product"]
draft = false
+++
```

Add optional fields as needed:

| Field | Effect |
| --- | --- |
| `pinned = true` | Move the post to the top of its category group. |
| `hidden = true` | Omit from listings, RSS, JSON Feed and `llms.txt`; keep the public URL and sitemap entry. |
| `noindex = true` | Ask search engines not to index the page; also omit it from the sitemap. |
| `math = true` | Load self-hosted KaTeX for formulas. |
| `mermaid = true` | Enable [Mermaid diagrams](media.md#wide-diagrams). |
| `wideCode = true` | Allow [long code blocks](media.md#wide-code-blocks) to expand. |
| `telegram_post = 123` | Link a positive Telegram message ID to [comments and counters](telegram.md). |
| `typography = false` | Disable the theme's build-time prose formatting for this page. |
| `dropCap = true` | Add an [opening initial](typography.md#drop-caps). |
| `sideNotes = true` | Move [footnotes into the desktop margin](typography.md#footnotes) when space permits. |

**Visibility is not access control.** Hidden pages remain public and crawlable.
Use `draft = true` for unpublished work; preview with `hugo server -D`.
Draft previews and 404 pages emit `noindex`. To omit an otherwise indexable page
from the sitemap, set `disable = true` in its `[sitemap]` front-matter table.

### Republished content and project pages

For a copy published on another origin:

1. Set an absolute `canonicalURL` in front matter; each language needs its own URL.
2. Set `[sitemap] disable = true` on the duplicate.
3. Include only canonical URLs in the destination site's sitemap.

The theme uses the canonical URL in canonical links, Open Graph, JSON-LD and
translated `hreflang` links. It does not redirect the page.

Independent project pages can set `seoSiteName` and `seoSiteURL`. These retain
author attribution but emit the project's own `WebSite` data instead of a blog
breadcrumb. Navigation, permalinks and the site's default metadata stay unchanged.

### Partial dates

| Known date | Front matter | Visible date |
| --- | --- | --- |
| Exact day | `date = 2000-01-02` | 2 January 2000 / 2 января 2000 |
| Month only | `date = 2001-02-01`, `date_precision = "month"` | February 2001 / февраль 2001 |

Month-only dates use `YYYY-MM` in the visible date's HTML `datetime` attribute.
Sorting and structured metadata keep the full `date` value.

## Typography

Mini formats rendered prose without changing Markdown sources. Code, formulas,
URLs and metadata are preserved. See [Typography](typography.md)
([на русском](typography.ru.md)) for quotations, footnotes, spacing and opt-outs.

## Categories

Section pages group articles by category. Keep stable category slugs and add
localized display names:

```toml
# i18n/en.toml
[cat_product]
other = "Product"
```

## Shortcodes

Choose a component below for its example and options. Native Markdown headings
receive copyable anchors; `.no-anchor` omits a heading's copy link but keeps its ID.
With `headingScroll = true`, H1/H2 become [click-to-align text anchors](typography.md#heading-scroll-controls).

| Component | Guide |
| --- | --- |
| <a id="wide-images"></a>`image` | [Responsive and wide images](media.md#wide-images) |
| <a id="wide-diagrams"></a>`mermaid` | [Diagrams and their delivery options](media.md#wide-diagrams) |
| <a id="wide-code-blocks"></a>Fenced code | [Wide code blocks](media.md#wide-code-blocks) |
| <a id="captions-and-heading-links"></a>`caption` | [Descriptions and source credits](media.md#captions) |
| `callout` | [Quotations](typography.md#quotations-and-attributions) |
| `plug` | [Three-asterisk divider](media.md#divider) |
| <a id="wavy-arrow"></a>`wavy-arrow` | [Inline date-range arrow](media.md#wavy-arrow) |
| <a id="explicit-fractions"></a>`fraction` | [Explicit fractions](typography.md#opening-quotes-numerals-and-fractions) |
| <a id="enlarged-author-statements"></a>`beauty-lead` HTML class | [Enlarged author statements](typography.md#quotations-and-attributions) |

## Build a homepage or collection

These components also work in ordinary content pages:

| Component | Guide |
| --- | --- |
| <a id="homepage-introduction"></a>Native Markdown | [Homepage introduction](homepage.md#homepage-introduction) |
| <a id="latest-articles"></a>`latest-posts` | [Recent articles and archive link](homepage.md#latest-articles) |
| <a id="featured-articles"></a>`featured-posts` | [Hand-picked articles](homepage.md#featured-articles) |
| <a id="columns"></a>`columns` / `column` | [Responsive columns](homepage.md#columns) |
| <a id="projects"></a>`project` | [Project descriptions and icons](homepage.md#projects) |
| <a id="github-stars"></a>`github-stars` | [Build-time GitHub counters](homepage.md#github-stars) |
| <a id="reading-lists"></a>`reading-list` | [Localized bookshelves](homepage.md#reading-lists) |

## Standalone resume

Use `layout = "resume"` for a CV with its own screen and print layout.
See [Resumes](resume.md) for a complete example, job entries, education and PDF output.

## Article keyboard navigation

| Shortcut | Action |
| --- | --- |
| Option/Alt + Left | Open the previous, older article. |
| Option/Alt + Right | Open the next, newer article. |

Navigation follows publication dates in the current language's `mainSections`.
Hidden posts and draft previews are excluded; pinning has no effect. At either
end the shortcut stops, without wrapping or triggering browser history.

Shortcuts are inactive while editing text, composing input, holding a key,
using extra modifiers, or opening a dialog or mobile menu. Listings and
standalone pages keep their normal behavior. There are no visible shortcut controls.

## Printing

Use your browser's **Print** or **Save as PDF** command. No extra build is needed.

| Kept | Omitted |
| --- | --- |
| Site name, article title, text, images and publication date | Navigation, sharing, comments and related-post widgets |

Print is light-on-paper in either screen theme: body text is 11 pt, page titles
22 pt and section headings 16 pt. Code wraps and prints in monochrome.
[Mermaid diagrams](media.md#diagram-loading-and-printing) use cached neutral copies,
or readable source when rendering is unfinished. CVs have a [separate A4 layout](resume.md#print-or-save-as-pdf).

## Article ending

| Space | Default |
| --- | --- |
| Article to metadata/sharing group | `--post-footer-gap`: 32 px |
| Within that group | 16 px |
| Group to Telegram discussion | 32 px |
| Article to date in print | 24 px |

Missing sharing or comments leave no empty group. Standalone pages have no post
footer. Telegram controls typography inside its own iframe.
