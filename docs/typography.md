# Typography

## Quotations and attributions

Set `editorialQuotes = true` in `[params]` (or page parameters) to render native
Markdown `>` blocks with the shared `beauty-quotation quotation-reading` style in
all languages. It is off by default; pages can opt out with `editorialQuotes = false`.
Existing opening marks hang outside the text edge. Prose without marks receives a
selectable outer pair: `«…»` in Russian and `“…”` otherwise. Terminal punctuation is
retained (a Russian full stop follows the closing mark). Paragraphs, lists, links
and emphasis remain semantic HTML; code, tables and nested quotations do not receive
invented marks. Source Markdown and translation hashes are unchanged. Explicit HTML
figures retain their authored markup.

The same option applies to the `callout` shortcode. With `editorialQuotes = false`,
it retains its original shaded treatment. The bilingual example site enables the
shared style for both Markdown and shortcode quotations; attributed examples use
semantic figures and captions.

Opening marks inside emphasis, strong text, links and nested inline wrappers are
recognized without adding another quote pair. Authored hanging-mark spans are
preserved; attributes and inline code are not rewritten.

For a short author definition or thesis in the body face, use `<p class="beauty-lead">…</p>` instead. It increases the text size without a rule or quotation marks. Shared screen spacing is 32 px before and 48 px after via `--beauty-lead-margin-block`; print retains ordinary paragraph spacing.

Use `<figure class="beauty-quotation">` with a `blockquote` and an optional
`figcaption`. All such quotations share the configured quote face, a 640 px
maximum measure aligned with the reading column, 24 px above, 32 px below and 16 px
between paragraphs. After a `plug` divider, the top margin is 16 px.
When standalone content ends with a quotation, footer top padding increases from
56 to 88 px through `--footer-quotation-gap`; internal quotation spacing stays shared.

Wrap the opening punctuation in `<span class="beauty-hanging-open">«</span>`.
Mini scales it to 1.4 through Beauty without changing line height and adds a
shared 0.08em optical gap through `--beauty-hanging-gap`. The closing
mark stays ordinary; print restores inline punctuation and normal scale.

Standalone testimonials use 20/30 px on desktop and mobile. Add `quotation-reading`
for article quotations to follow the surrounding reading type: 18/28 px desktop,
19/29 px mobile. This modifier changes only size and leading; the remaining
quotation styles are shared. Print retains its existing sizing.

All quotation captions, including native `blockquote footer` and `figcaption`
after a direct blockquote, align to the quotation's inline end through
`--beauty-quote-attribution-align: end`. Image and diagram captions retain their
own alignment. Figure attributions follow the quote by 20 px, use the body face
and muted color, and wrap within the quote width.

For a signature with a real dash, use `beauty-quotation-attribution` on the caption,
put the dash in the first span (`aria-hidden="true"`) and the author/source in a
second span. The dash stays next to the signature, with a 0.125em gap, rather than
hanging in the page gutter. Names and roles may remain on one line. The optional
`beauty-quotation-author` span gives the name the main text color; omit it for a
uniform muted signature. Omit the entire caption when the introduction already
names the source.

Beauty owns the typography; Mini configures its tokens. An optional
[quotation font profile](fonts.md#a-separate-quotation-family) selects one face
for block quotations while captions retain the body family.


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

On screen, reading pages leave 48 px between the header and H1, then 32 px before
the content. At 768 px and below these gaps are 40 px and 28 px. The spacing is
shared across reading pages; short and multiline titles follow the same rhythm.
Print keeps its separate margins.

The 404 page uses this same text, title and header scale in every language; its optional ASCII illustration retains a separate monospace size.

Blog pages use 18 px text with 28 px leading in a column up to 720 px wide; at 768 px and below, text is 19/29 px. Page titles are 44 px on desktop and 32 px on mobile. Navigation retains its compact scale. Beauty.css controls headings, line height and wrapping; tables and code scroll independently. See [customization](customization.md).

On mobile, article section headings use 24 px, attributions use 15 px and post metadata
uses 14 px. Proportional notes and image captions grow with the article text. Footnotes use
15/24 px on desktop and 16/25.6 px on mobile, in the body font and shared muted color.
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

Project names use the configured bold weight (600 for Inter), so custom families select
their actual bold face. Their SVG arrows retain an independent stroke and animation.

Wavy emphasis uses `--beauty-emphasis-offset: 0.2em` to keep the decoration close to
the text; Beauty.css owns the underline rendering.

## Heading alignment and narrow titles

An optional [H1 font profile](fonts.md#a-separate-h1-family) changes the title family
and weight while keeping this guide's sizes, spacing and the body/list typography.
Its letter spacing is normal above 768 px and `-0.01em` on mobile.

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

- `hangingQuotes` hangs an initial «, “ or ‘ outside H1–H3 headings and ordinary
  prose paragraphs, including blockquotes. Paragraphs inside lists, footnotes, tables,
  figures and asides retain their own alignment. The quote stays in copied text;
  article listings and metadata stay unchanged. No JavaScript is required; print restores the quote inside the line.
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

## Article publication credits

Put an existing publication credit after the article's conclusion, before any
footnotes. Use `<p class="beauty-note">This article was published in
<a href="https://example.org/article/">Publication name</a>.</p>`.
Beauty supplies upright regular text at 0.875em in the secondary color; the
publication name retains normal link styling. Avoid italic or bold wrappers and
inline font rules. Keep the URL and placement synchronized across translations;
say "first published" only when that chronology is known. Image credits have
their own caption treatment described below.

## Drop caps

Set `dropCap = true` in an individual article's front matter to give its opening
paragraph a drop cap. It is off by default and is not inherited from site params.
The article must start with an ordinary paragraph: a heading, quotation, list or
figure before it prevents the treatment. Notes, captions, fine print and paragraphs
with `data-typography="off"` are excluded. Choose an opening with enough prose to
wrap around the letter; preview each language separately.
Opening quotation marks grow with the initial, and a decorated first word can carry
its underline onto the enlarged letter; prefer plain type for those openings.
For a one-letter opening word such as English “I” or “A”, the build uses a nonbreaking
space so Chromium preserves the word separator when copying. Source text stays unchanged;
`typography = false` disables this spacing adjustment.

The initial uses the configured H1 family and its actual title weight, in the body
text color. Beauty's `beauty-dropcap` helper handles native `::first-letter` shaping:
two lines of wrapping on both desktop and mobile, with a quarter-line rise above the
opening line. No letter is removed, duplicated or
wrapped in a separate element; copied text and accessible reading order stay intact.
Print and browsers without `initial-letter` support retain ordinary paragraph text.
The WebKit-prefixed property supports Safari. No JavaScript or additional font is loaded.

Beauty exposes `--beauty-dropcap-font`, `--beauty-dropcap-weight`,
`--beauty-dropcap-lines`, `--beauty-dropcap-lines-small`, `--beauty-dropcap-rise` and
`--beauty-dropcap-gap`.
The theme maps the font tokens to `--font-title` and `--font-weight-title` and
sets the desktop line count to two; Beauty's small-screen default is already two.
The theme sets the rise to `0.25`; use `0` for an ordinary dropped initial.
Beauty uses top alignment and a line-relative rise for standard CSS, and native
baseline alignment for prefixed WebKit. This avoids a whole-line prose shift in
Chromium. Preview the gap below the title; do not add consumer-specific offsets.
Shared geometry stays in Beauty. Keep any licensed font files in the consuming site.

The theme sets `--beauty-dropcap-margin-block-end: -0.3em` to keep a short
descender such as Cyrillic Ц from indenting a third line. This adjusts only the
exclusion area, preserving the letter's size and alignment. Check descender
clearance when changing fonts or leading; set the token to `0` if a font needs
more space. Short paragraphs still reserve the initial's full two-line height.

## Article links

Article links can opt into new tabs with `articleLinksNewTab = true` in site or
page params. This applies only to bodies of posts in `mainSections`, including
internal destinations. Markdown gets `target="_blank"` and `rel="noopener noreferrer"`
at build time; the browser also covers authored HTML and shortcode links.
Same-page anchors, footnote navigation, downloads and non-web schemes retain their
native behavior. Header navigation, listings and standalone pages
keep their existing behavior. The option is off by default.

## Footnotes

### Optional desktop side notes

Set `sideNotes = true` on an article (or in site params) to place its native Markdown
footnotes beside their first references when the inline-end gutter fits. The reading
column stays unchanged. Notes use Beauty's existing type, color, counters and links;
the theme only positions the original list items, without clones or duplicate IDs.
Nearby notes stack with a gap, move past intersecting wide blocks and reserve space
before the footer when needed.

Narrow windows, mobile, print and no-JavaScript views retain the endnotes block and its
heading. An immediately preceding H2–H6 notes heading is hidden only in the side layout.
Repeated references still point to one note. Keep native links and return links intact.
Return arrows are hidden in the side layout and visible in the bottom notes block.
Initial note URLs settle after fonts and images load, unless the reader has already interacted.
Layout tokens: `--article-sidenote-gap` (40px), `--article-sidenote-min-width` (220px),
`--article-sidenote-max-width` (260px), `--article-sidenote-space` (24px between notes
and at the viewport edge). This feature is off by default; preview dense notes first.

### Shared typography

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

Beauty.css owns these styles through `beauty-footnotes`, `beauty-footnote-ref`, and `beauty-footnote-backref`. The theme's `beauty-compat.html` adapter maps Goldmark's generated classes without duplicating CSS or rewriting article HTML. Size and rhythm use Beauty's `--beauty-footnote-*` tokens, including independent `--beauty-footnote-line-height`. Ordinary list numbers inherit text weight, with a 0.875rem gap (14 px) between items and min(2.5rem, 8%) indentation (40 px in a wide column, 8% in a narrow one); footnotes retain their separate compact rhythm.

## Captions, link arrows and stable columns

Image explanations use upright, start-aligned `beauty-caption` text. Short author/source
credits opt into `beauty-caption-credit` (the `caption` shortcode's `kind="credit"`),
which uses muted italic text at the inline end. Both use the same size and close image gap;
`--beauty-caption-*` controls the shared rhythm. See [caption examples](content.md#shortcodes).

Opt-in [wide images](content.md#wide-images) keep the paragraph's inline-start edge and use
free space toward the inline end, up to 960 px and never beyond the source or viewport width.
Mobile and print use the ordinary column; captions keep the text measure. Figure and caption
typography stays in Beauty, while Mini owns width and placement.

Diagrams can select the same layout with [`mermaid wide=true`](content.md#wide-diagrams);
their captions use the same Beauty styling and text measure as image captions.

With [`wideCode = true`](content.md#wide-code-blocks), long code blocks share these
width and viewport constraints. Short examples keep the text measure; remaining overflow
scrolls within the block without shrinking or wrapping code on screen. Print retains
its existing wrapped code layout.

Project and archive links use one decorative SVG arrow from `link-arrow.html`, with a
1-unit stroke on a 16-unit canvas; external arrows rotate the same path by -45 degrees.
Beauty's `beauty-link-icon` sizes SVGs to
`1em` and aligns them by `-0.125em`; `currentColor` follows the link, including hover.
Only the label is underlined and exposed as the accessible name. The arrows add no
network requests or focus stops. Ordinary article links and the year-range arrow retain
their existing treatment.

On pointer hover or keyboard focus, arrows move along their direction over 300 ms:
`0.25em` right for the archive, `0.175em` right and up for projects (roughly the same travel distance).
Labels and surrounding layout remain stationary. Reduced motion disables the movement;
touch devices do not retain a hover animation. This component motion belongs to Mini.

Above 768 px, screen layouts reserve a stable root scrollbar gutter. Classic scrollbar
appearance no longer shifts the reading column between short and long pages; overlay
scrollbars need no reserved space. Mobile menus and print retain their existing geometry.

## Code and print

Enable `[markup.highlight] noClasses = false` in your site configuration to use the theme’s light and dark syntax palettes. Text and line numbers meet 4.5:1 contrast on normal and highlighted lines. Explicit inline palettes remain a site or per-block choice; the theme does not recolor them. See [configuration](configuration.md#syntax-highlighting).

Printing uses 11 pt article text, 22 pt page titles and 16 pt section headings at every viewport width. Code uses a monochrome palette on paper. Screen typography is unchanged.

Markdown tables retain native table markup inside a labeled, focusable `beauty-scroll` region. Overflow stays local to the table. The theme's print layout uses fixed columns and allows long cell contents to wrap; it does not shrink the article's type. Author-supplied table IDs, classes, alignment and semantic dates remain on the table and cells.

Mermaid prioritizes nearby diagrams and prepares the remaining diagrams after load during idle time. Rendering is serialized and committed atomically; a neutral SVG copy is cached in memory for print. `beforeprint` switches copies synchronously, and `afterprint` restores the active screen theme. If printing starts before preparation finishes, or a module fails to load, the original diagram source remains readable. Native print dialogs cannot await asynchronous downloads. No print button or global `window.print` override is introduced.

## Heading scroll controls

Enable `headingScroll = true` in site or page parameters to make H1 and H2 align
24 px below the viewport top when clicked. The heading text is a native anchor;
its typography and color stay unchanged, with no additional icon. Tab navigation
has a visible focus outline; Option/Alt + Up/Down moves focus without an outline.
Returning to Tab restores the focus indicator. H2 copy icons are replaced; H3
retains copy-link behavior.

Clicking the heading updates the URL fragment without interrupting smooth scrolling.
The page title uses `#page-title`; existing section IDs remain stable. Repeated clicks
on the same target do not add history entries. Copying a link, opening it in another
tab, reload and back/forward navigation retain native anchor behavior. Tab focuses
the link; Enter/Space activates it. Authored links and controls are not nested or replaced.

Option/Alt + Down selects the next H1/H2; Up selects the previous heading relative
to the 24 px reading position. Between sections, Up returns to the current section's
heading. Navigation stops at both ends, updates the fragment and moves keyboard focus.
Distinct presses advance even while scrolling is in progress; held-key repeats are
ignored. Inputs, editable content, modified combinations and open menus/dialogs are
excluded. Option/Alt + Left/Right continues to navigate between articles.

Selections and modified clicks retain native behavior. Reduced motion disables
smooth scrolling. Without JavaScript the original headings and H2/H3 links remain.
Print keeps all heading text. The document end limits alignment near the footer;
`.no-anchor` headings are not enhanced. There are no new visible shortcut hints.
