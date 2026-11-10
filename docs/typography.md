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

The 404 page uses this same text, title and header scale in every language; its optional ASCII illustration retains a separate monospace size.

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

## Heading alignment and narrow titles

On screen, LTR reading layouts optically shift H1 by `-0.025em` and H2 by `-0.02em`
through Beauty's `--beauty-h1-transform` / `--beauty-h2-transform` tokens. At the default
44/32 px title sizes this is 1.1/0.8 px to the left. The adjustment aligns visible glyph
edges without changing the reading column, line width, font size or line height.
RTL layouts and print retain the unshifted defaults. Set the transform tokens to `none`
on `body.reading-layout` to disable the adjustment for a different font.

At screen widths up to 360 px, page titles opt into dictionary hyphenation through
`--beauty-h1-hyphens: auto`. Where a dictionary is available, unusually long words get
a hyphen instead of an arbitrary, unmarked split. Wider screens keep manual hyphenation
and balanced title lines. Section headings, paragraphs, menus and article-list links
retain their existing wrapping. Beauty requests a `10 4 4` word/fragment limit through
`--beauty-h1-hyphen-limit`; exact break positions and support for limits depend on the
browser and its dictionaries. The document's `lang` selects the language.
No soft hyphens or browser scripts rewrite titles, source content, metadata or copied text.
Set the hyphenation token to `manual` on the reading body to opt out. These visual settings
are independent of the build-time `typography = false` punctuation option.

## Opening quotes, numerals and fractions

Enable `hangingQuotes = true` and `proseNumerals = true` in `[params]` or page
parameters; both are off by default.

- `hangingQuotes` hangs an initial «, “ or ‘ outside H1–H3 headings and blockquote
  paragraphs. The quote stays in copied text; article listings and metadata stay
  unchanged. No JavaScript is required; print restores the quote inside the line.
  Heading anchors leave room for the quote; in narrow viewports they follow the text.
  `typography = false` and `data-typography="off"` disable processing.
- `proseNumerals` selects old-style proportional figures in direct article paragraphs
  and their quotations. Headings, lists, tables, captions and footnote numbers keep
  their usual figures. Set `proseNumerals = false` on analytical pages;
  use `<span class="beauty-lining-nums">7/10</span>` for an individual lining value.
- `{{< fraction "1/3" >}}` styles only an explicit fraction. Dates, scores and URLs
  containing a slash are never converted automatically. Zero denominators are rejected.

Prose figures use the chosen font's OpenType features, falling back to ordinary
glyphs when unavailable. Fractions compose smaller digits from the same font without
changing paragraph leading or copied text. Beauty owns CSS; the theme selects markup.

## Footnotes

Reference superscripts use a zero line height and a relative upward offset instead of
`vertical-align: super`. They retain their italic appearance and native links without
enlarging the surrounding line box. This is scoped to footnotes; formulas and ordinary
superscripts/subscripts keep their existing treatment.

Use Hugo's native Markdown footnotes, with no shortcode or extra JavaScript:

```md
A useful claim[^source] can reference the same note again[^source].

[^source]: A short note naming the source.
```

Reference numbers appear as small, italic, text-colored superscripts without visible link decoration, in the article. Each endnote has a hanging number attached to the list item, so it stays visible when the note starts with a quotation, list or code block. Notes align with the reading column without a list indent, use smaller muted text, and retain return links for each reference. Keyboard focus remains visible; numbering follows the order of first citation.

Beauty.css owns these styles through `beauty-footnotes`, `beauty-footnote-ref`, and `beauty-footnote-backref`. The theme's `beauty-compat.html` adapter maps Goldmark's generated classes without duplicating CSS or rewriting article HTML. Size and rhythm use Beauty's `--beauty-footnote-*` tokens. Ordinary list numbers inherit text weight, with a 0.875rem gap (14 px) between items and min(2.5rem, 8%) indentation (40 px in a wide column, 8% in a narrow one); footnotes retain their separate compact rhythm.

## Captions, link arrows and stable columns

Image explanations use upright, start-aligned `beauty-caption` text. Short author/source
credits opt into `beauty-caption-credit` (the `caption` shortcode's `kind="credit"`),
which uses muted italic text at the inline end. Both use the same size and close image gap;
`--beauty-caption-*` controls the shared rhythm. See [caption examples](content.md#shortcodes).

Opt-in [wide images](content.md#wide-images) keep the paragraph's inline-start edge and use
free space toward the inline end, up to 960 px and never beyond the source width. The theme
keeps the recent-posts rail in place and constrains only figures that would intersect it.
Mobile and print use the ordinary column; captions keep the text measure. Figure and caption
typography stays in Beauty, while Mini owns width, placement and collision handling.

Diagrams can select the same layout with [`mermaid wide=true`](content.md#wide-diagrams);
their captions use the same Beauty styling and text measure as image captions.

With [`wideCode = true`](content.md#wide-code-blocks), long code blocks share these
width and rail constraints. Short examples keep the text measure; remaining overflow
scrolls within the block without shrinking or wrapping code on screen. Print retains
its existing wrapped code layout.

Project and archive links use decorative inline SVG arrows from `link-arrow.html`, with
matching 1.4-unit strokes on a 16-unit canvas. Beauty's `beauty-link-icon` sizes SVGs to
`1em` and aligns them by `-0.125em`; `currentColor` follows the link, including hover.
Only the label is underlined and exposed as the accessible name. The arrows add no
network requests or focus stops. Ordinary article links and the year-range arrow retain
their existing treatment.

Above 768 px, screen layouts reserve a stable root scrollbar gutter. Classic scrollbar
appearance no longer shifts the reading column between short and long pages; overlay
scrollbars need no reserved space. Mobile menus and print retain their existing geometry.

## Code and print

Enable `[markup.highlight] noClasses = false` in your site configuration to use the theme’s light and dark syntax palettes. Text and line numbers meet 4.5:1 contrast on normal and highlighted lines. Explicit inline palettes remain a site or per-block choice; the theme does not recolor them. See [configuration](configuration.md#syntax-highlighting).

Printing uses 11 pt article text, 22 pt page titles and 16 pt section headings at every viewport width. Code uses a monochrome palette on paper. Screen typography is unchanged.

Markdown tables retain native table markup inside a labeled, focusable `beauty-scroll` region. Overflow stays local to the table. The theme's print layout uses fixed columns and allows long cell contents to wrap; it does not shrink the article's type. Author-supplied table IDs, classes, alignment and semantic dates remain on the table and cells.

Mermaid prioritizes nearby diagrams and prepares the remaining diagrams after load during idle time. Rendering is serialized and committed atomically; a neutral SVG copy is cached in memory for print. `beforeprint` switches copies synchronously, and `afterprint` restores the active screen theme. If printing starts before preparation finishes, or a module fails to load, the original diagram source remains readable. Native print dialogs cannot await asynchronous downloads. No print button or global `window.print` override is introduced.
