# Typography

Russian quotation nesting accepts both literal curly quotes and HTML entities.
Quotation marks around a visible URL close the surrounding quotation without
rewriting the URL or affecting the next quotation.

English | [Русский](typography.ru.md)

Mini uses Goldmark for Markdown punctuation, build-time rules for prose, and Beauty.css for layout. No browser text-rewriting JavaScript.

## English rules

| What changes | Before | After |
| --- | --- | --- |
| Turns straight quotation marks into curly quotes | `"A quote"` | `“A quote”` |
| Turns `--` into an en dash | `A -- B` | `A – B` |
| Turns `---` into an em dash | `A --- B` | `A — B` |
| Turns three dots into an ellipsis | `Wait...` | `Wait…` |
| Keeps existing thousands groups together | `1 000 000` | `1 000 000` |
| Adds a nonbreaking space before currency | `3000€` | `3000 €` |
| Adds a nonbreaking space before units | `16px` | `16 px` |
| Removes spaces before percent and per mille signs | `10 %, 10 ‰` | `10%, 10‰` |

The first four rules are provided by Goldmark. Mini formats existing number groups and spacing at build time. U+00A0 is a nonbreaking space; U+202F is a narrow nonbreaking space. Russian-only transformations are documented in the [Russian guide](typography.ru.md).

## Scope and exclusions

- Applies to English **homepage and single-page bodies**. Markdown sources, page titles, metadata, listings and feeds are unchanged.
- Preserves code, formulas, Mermaid, HTML tags and attributes, comments, URLs and paths. No rewriting across HTML tags or guessing ambiguous ranges.
- Russian uses separate typography rules; languages other than English and Russian are not processed by Mini's extra pass.

## Control

Disable for one page:

```toml
+++
typography = false
+++
```

Or site-wide in `hugo.toml`:

```toml
[params]
  typography = false
```

A page can override the site setting with `typography = true`. Exclude an HTML fragment and its children:

```html
<span data-typography="off">16px and 10 %</span>
```

Raw HTML needs `markup.goldmark.renderer.unsafe = true`. These controls affect Mini's **extra pass**, not native Goldmark substitutions. To change those, configure [Goldmark Typographer](https://gohugo.io/configuration/markup/#typographer).

## Reading layout

16 px text, up to 720 px wide. Beauty.css controls headings, line height and wrapping; tables and code scroll independently. See [customization](customization.md).

## Footnotes

Use Hugo's native Markdown footnotes, with no shortcode or extra JavaScript:

```md
A useful claim[^source] can reference the same note again[^source].

[^source]: A short note naming the source.
```

Reference numbers appear as small, italic, text-colored superscripts without visible link decoration, both in the article and inline at the start of each endnote. Notes align with the reading column without a list indent, use smaller muted text, and retain return links for each reference. Keyboard focus remains visible; numbering follows the order of first citation.
