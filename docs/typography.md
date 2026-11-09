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

- Applies to English **homepage and single-page bodies**, visible page titles and article links. Markdown sources, metadata and feeds are unchanged.
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

Blog pages use 18 px text with 28 px leading in a column up to 720 px wide; at 768 px and below, text is 19/29 px. Page titles are 44 px on desktop and 32 px on mobile. Navigation retains its compact scale. Beauty.css controls headings, line height and wrapping; tables and code scroll independently. See [customization](customization.md).

On mobile, article section headings use 24 px, and the recent-posts block below an
article follows the same 19/29 px reading scale. Attributions use 15 px and post metadata
uses 14 px. Proportional notes, image captions and footnotes grow with the article text.
The reading shelf's date column scales with its font to keep the heading within the table.
On narrow screens, the table can scroll horizontally inside its keyboard-accessible
container, keeping a 20em minimum width without widening the page.
Desktop typography, the 720 px column and print sizes retain their own settings.

Visible page titles and article links use the same language-aware spacing rules as prose.
Titles are escaped before formatting; metadata, feeds and URLs remain unchanged, and
`typography = false` also disables title formatting. Whole ISO-date cells in Markdown
tables receive a native `<time>` element after date validation, so dates stay on one line.

Language labels use 12 px and new-item badges use 11 px, independent of their surrounding
text size. The compact green badges read “New” in English and “Нов.” in Russian, with
white bold text on the text baseline and no letter spacing. `--color-badge-new` controls
their background; the default keeps white text legible in both color schemes.
Lead paragraphs inherit the body font weight; table headers use the configured
heading weight. For interviews, use Markdown section headings for questions and a semantic
`<p class="beauty-lead">` for a larger paragraph. Native block spacing replaces empty `<br>` elements.

Wavy emphasis uses `--beauty-emphasis-offset: 0.2em` to keep the decoration close to
the text; Beauty.css owns the underline rendering.

## Footnotes

Use Hugo's native Markdown footnotes, with no shortcode or extra JavaScript:

```md
A useful claim[^source] can reference the same note again[^source].

[^source]: A short note naming the source.
```

Reference numbers appear as small, italic, text-colored superscripts without visible link decoration, in the article. Each endnote has a hanging number attached to the list item, so it stays visible when the note starts with a quotation, list or code block. Notes align with the reading column without a list indent, use smaller muted text, and retain return links for each reference. Keyboard focus remains visible; numbering follows the order of first citation.

Beauty.css owns these styles through `beauty-footnotes`, `beauty-footnote-ref`, and `beauty-footnote-backref`. The theme's `beauty-compat.html` adapter maps Goldmark's generated classes without duplicating CSS or rewriting article HTML. Size and rhythm use Beauty's `--beauty-footnote-*` tokens. Ordinary list numbers inherit text weight, with a 0.875rem gap (14 px) between items and min(2.5rem, 8%) indentation (40 px in a wide column, 8% in a narrow one); footnotes retain their separate compact rhythm.

## Code and print

Enable `[markup.highlight] noClasses = false` in your site configuration to use the theme’s light and dark syntax palettes. Text and line numbers meet 4.5:1 contrast on normal and highlighted lines. Explicit inline palettes remain a site or per-block choice; the theme does not recolor them. See [configuration](configuration.md#syntax-highlighting).

Printing uses 11 pt article text, 22 pt page titles and 16 pt section headings at every viewport width. Code uses a monochrome palette on paper. Screen typography is unchanged.

Markdown tables retain native table markup inside a labeled, focusable `beauty-scroll` region. Overflow stays local to the table. The theme's print layout uses fixed columns and allows long cell contents to wrap; it does not shrink the article's type. Author-supplied table IDs, classes, alignment and semantic dates remain on the table and cells.

Mermaid prioritizes nearby diagrams and prepares the remaining diagrams after load during idle time. Rendering is serialized and committed atomically; a neutral SVG copy is cached in memory for print. `beforeprint` switches copies synchronously, and `afterprint` restores the active screen theme. If printing starts before preparation finishes, or a module fails to load, the original diagram source remains readable. Native print dialogs cannot await asynchronous downloads. No print button or global `window.print` override is introduced.
