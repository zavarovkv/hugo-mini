# Typography reference

English | [Русский](typography-reference.ru.md) · [Documentation](README.md) · [Authoring guide](typography.md)

**For customization and maintenance.** These are default visual contracts, not
settings every author needs. Mini owns page geometry and token values; Beauty.css
owns native text styling. Override tokens instead of copying base selectors.

[Reading layout](#reading-layout) · [Headings](#headings) · [Quotations](#quotations) · [Drop caps](#drop-caps) · [Footnotes](#footnotes-and-lists) · [Print](#code-tables-and-print)

## Reading layout

The compact layout starts at `48rem` and below (768 px with a 16 px browser default).

| Element | Desktop | Mobile |
| --- | --- | --- |
| Reading column | Up to 720 px | Available width |
| Body text / leading | 18/28 px | 19/29 px |
| H1 | 44 px | 32 px |
| Homepage H1 | 36 px | 32 px |
| Homepage H1 to opening paragraph | 24 px | 24 px |
| Between introductory paragraphs | 12 px | 12 px |
| Header to H1 on standalone pages | 48 px | 40 px |
| Standalone H1 to content | 32 px | 28 px |
| Article H1 to rule / rule to text | 32 px each | 20 px each |
| Article H2 | 26 px | 26 px |
| Before / after an article H2 | 56–64 / 32 px | 56 / 32 px |
| Quote attributions (`0.875em`) | 15.75 px | 16.625 px |
| Fine print (`.beauty-fine-print`) | 14 px | 15 px |
| Post metadata | Theme metadata scale | 14 px |
| Footnotes / leading | 14/20 px | 15/22 px |
| Language label | 12 px | 12 px |
| New badge | 11 px | 11 px |
| Content to site footer (`--footer-gap`) | 112 px | 88 px |

Short and multiline titles share the same rhythm. The 404 page uses the same
reading/header scale; its ASCII illustration has an independent monospace size.
Notes and image captions scale proportionally with article text. Navigation stays compact.

- Lead paragraphs use body weight; table headers use heading weight. Interview questions should be Markdown headings, not empty `<br>` spacing.
- Project names use actual configured bold (Inter 600); SVG arrows keep their own stroke.
- New badges use white bold text, no tracking and `--color-badge-new` on the text baseline, labeled “New” / “Нов.”.
- Wavy emphasis uses `--beauty-emphasis-offset: 0.2em`; Beauty renders its decoration.

Visible titles are escaped before language formatting. `typography = false` also
disables that formatting; metadata, feeds and URLs stay unchanged. Whole validated
ISO-date table cells receive `<time>` and stay on one line. Bookshelves retain
[their local scrolling and 20em minimum](homepage.md#table-layout).

Thematic breaks use `--beauty-rule-margin: 2rem 1rem`: 32 px before the rule
and 16 px after it. Menu and search-row dividers retain symmetric spacing.

## Headings

[Font profiles](fonts.md) change families and real weights without changing geometry.
A separate H1 family uses normal tracking on desktop and `-0.01em` on mobile.
`articleH2UseTitleFont` opts article H2 into the same face; H3–H6 and non-article
headings keep their roles. Page overrides and `useDefaultFonts` remain supported.

| Token on `body.reading-layout` | Default | Opt out |
| --- | --- | --- |
| `--beauty-h1-transform` | LTR screen shift of `-0.025em` | `none` |
| `--beauty-h2-transform` | LTR screen shift of `-0.02em` | `none` |
| `--beauty-h1-hyphens` | `auto` up to 360 px; otherwise manual | `manual` |
| `--beauty-h1-hyphen-limit` | `10 4 4` word/fragment limit | Browser-dependent |

Optical shifts align glyph edges without moving the column or changing line width;
RTL and print remain unshifted. Narrow-title hyphenation uses the document's language
and browser dictionary. Wider titles retain balanced lines; other text keeps its wrapping.
No soft hyphens or scripts modify sources or copied text.

These visual controls are independent of build-time punctuation. See
[heading navigation](typography.md#heading-scroll-controls) and
[focus states](customization.md#focus-and-controls) for interaction behavior.

## Quotations

See [authoring examples](typography.md#quotations-and-attributions).
All quotation variants share geometry and the configured quote face:

| Property | Default |
| --- | --- |
| Maximum measure | 640 px, aligned with the reading column |
| Top / bottom gap | 24 / 32 px |
| Top gap after `plug` | 16 px |
| Paragraph gap | 16 px |
| Standalone testimonial | 20/30 px on desktop and mobile |
| `.quotation-reading` | 18/28 px desktop, 19/29 px mobile |
| Attribution gap / face | 20 px / body family |
| Attribution alignment | `--beauty-quote-attribution-align: end`, muted color |
| Opening mark | Scale 1.4, `--beauty-hanging-gap: 0.08em` |
| Attribution dash gap | `0.125em`, beside the signature rather than in the gutter |
| Footer after a final quotation | `--footer-quotation-gap`: 176 px desktop, 128 px mobile |
| Author statement (`beauty-lead`) | `--beauty-lead-margin-block`: 32 px before, 48 px after |

Attributions wrap within the quote width; native `blockquote footer` and captions
after direct blockquotes align to the inline end too. Image captions have separate
roles. Hanging marks do not change line height; print restores inline punctuation
at normal scale. Leads use ordinary paragraph spacing in print.

## Drop caps

The `beauty-dropcap` helper uses native `::first-letter` shaping. The theme maps the
H1 family and weight to it, with no cloned letter or extra font request.

| Token | Theme mapping / default |
| --- | --- |
| `--beauty-dropcap-font` | `--font-title` |
| `--beauty-dropcap-color` | 20% link color mixed into the heading color (light) or body text color (dark) |
| `--beauty-dropcap-weight` | `--font-weight-title` |
| `--beauty-dropcap-lines` | `2` |
| `--beauty-dropcap-lines-small` | Beauty default: `2` |
| `--beauty-dropcap-rise` | `0.25`; use `0` for an ordinary dropped initial |
| `--beauty-dropcap-gap` | Shared Beauty spacing |
| `--beauty-dropcap-margin-block-end` | `-0.3em`; use `0` if a descender needs more room |

The negative end margin keeps short descenders such as Cyrillic Ц from indenting
a third line; it changes the exclusion area, not the letter. Short paragraphs
still reserve two lines. Check descender clearance and title gaps after font changes.

Standard CSS uses top alignment and a line-relative rise; prefixed WebKit uses native
baseline alignment. This avoids a whole-line Chromium shift. Keep geometry fixes in
Beauty, and licensed fonts in the site. Print and unsupported browsers retain plain text.

## Footnotes and lists

| Element | Contract |
| --- | --- |
| Reference | Italic superscript, zero line height, relative upward offset; no `vertical-align: super` |
| Endnote | Muted body face, inline number linked to the first citation, flush continuation lines |
| Ordinary list | Marker inherits text weight; `0.875rem` (14 px) item gap; `min(2.5rem, 8%)` indentation |
| Footnote rhythm | Independent `--beauty-footnote-*` tokens, including `--beauty-footnote-line-height` |

Beauty styles the note, its reference, inline number and return links. Hugo Mini maps Goldmark classes and places the first backlink at the start of the note during the build. Formulas and unrelated superscripts/subscripts are unaffected.

Desktop margin notes additionally use:

| Token | Default |
| --- | --- |
| `--article-sidenote-gap` | 40 px |
| `--article-sidenote-min-width` | 220 px |
| `--article-sidenote-max-width` | 260 px |
| `--article-sidenote-space` | 24 px between notes and at the viewport edge |

See [side-note behavior](typography.md#optional-desktop-side-notes) before changing
these values, especially with dense notes or wide figures.

## Links, captions and columns

Caption roles and wide-layout limits are defined in the [media guide](media.md).
`--beauty-caption-*` tokens control shared caption size and rhythm.

Project/archive arrows share `link-arrow.html`: one path, a 1-unit stroke on a
16-unit canvas, rotated -45° for external links. `beauty-link-icon` uses `1em`
size, `-0.125em` alignment and `currentColor`. Only the label is underlined and
exposed as the accessible name; arrows add no requests or focus stops.

| Motion | Default |
| --- | --- |
| Archive | `0.25em` right over 300 ms |
| Project | `0.175em` right and up over 300 ms |
| Reduced motion | Disabled |
| Touch | No retained hover animation |

Labels and layout do not move. Ordinary article links and the date-range arrow
keep their own treatment. A stable root scrollbar gutter prevents
classic scrollbars from shifting the column. Overlay scrollbars reserve no space; print opts out.

## Code, tables and print

[Class-based highlighting](configuration.md#syntax-highlighting) supplies light/dark
palettes with 4.5:1 text contrast on normal and highlighted lines, including line
numbers. Explicit inline palettes remain the site's responsibility.

Tables keep native markup inside a labeled, focusable `beauty-scroll` region.
Overflow stays local. IDs, classes, alignment and semantic dates are preserved.
Print uses fixed columns and wrapped cell contents without shrinking article text.

Print body/title/section sizes are 11/22/16 pt at every viewport width; code is
monochrome and wraps. Mermaid uses [cached neutral copies or readable source](media.md#diagram-loading-and-printing).
There is no print button or global `window.print` override.
