# Typography

English | [Русский](typography.ru.md) · [Documentation](README.md) · [Visual reference](typography-reference.md)

Goldmark handles Markdown punctuation, Mini formats rendered prose at build time,
and Beauty.css controls layout. Sources stay unchanged; no browser script rewrites text.

[Rules](#english-rules) · [Opt out](#control) · [Quotations](#quotations-and-attributions) · [Drop caps](#drop-caps) · [Footnotes](#footnotes) · [Headings](#heading-scroll-controls)

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

- Extra formatting applies to English homepage/single-page bodies, visible titles and article links. Metadata, feeds and Markdown sources stay unchanged.
- Code, math, Mermaid, HTML attributes/comments, URLs and paths are preserved. Mini does not join words across tags or guess ambiguous ranges.
- Russian has [separate rules](typography.ru.md#правила-для-русского-языка). Other languages do not receive Mini's extra prose pass.

## Control

Disable the extra pass in page front matter:

```toml
+++
typography = false
+++
```

Or in site configuration:

```toml
[params]
  typography = false
```

A page can override the site with `typography = true`. Exclude a fragment and its children:

```html
<span data-typography="off">16px and 10 %</span>
```

Raw HTML requires `markup.goldmark.renderer.unsafe = true`. These controls do not
disable [Goldmark Typographer](https://gohugo.io/configuration/markup/#typographer).
Visual options, such as heading hyphenation, have their own CSS controls.

## Quotations and attributions

Set `editorialQuotes = true` in `[params]` or page front matter, then use native Markdown:

```markdown
> A quotation worth keeping.
```

This opts Markdown quotations and `callout` into `beauty-quotation quotation-reading`.
The option is off by default; `editorialQuotes = false` restores ordinary quotations
and the callout's shaded treatment.

| Content | Result |
| --- | --- |
| Prose without outer marks | Add selectable `«…»` in Russian or `“…”` otherwise. |
| Existing marks, including inside emphasis or links | Hang the opening mark without adding a second pair. |
| Final punctuation | Preserve it; a Russian full stop follows the closing mark. |
| Code, tables, nested quotations | Do not invent quotation marks. |
| Explicit HTML figures or authored hanging spans | Preserve their markup. |

Paragraphs, lists, links and emphasis keep semantic HTML. Russian nesting accepts
literal marks and HTML entities; a visible URL does not disrupt surrounding quotes.
Sources, attributes, inline code and translation hashes remain unchanged.

### Add an attribution

Use a semantic figure when you need an author or source:

```html
<figure class="beauty-quotation quotation-reading">
  <blockquote><p><span class="beauty-hanging-open">“</span>A useful quotation.”</p></blockquote>
  <figcaption class="beauty-quotation-attribution">
    <span aria-hidden="true">—</span>
    <span><span class="beauty-quotation-author">Author</span>, source</span>
  </figcaption>
</figure>
```

Omit the caption if the introduction already names the source. Omit
`beauty-quotation-author` for a uniformly muted attribution. Remove
`quotation-reading` for a larger standalone testimonial. Captions keep the body
face even with a [quotation font](fonts.md#a-separate-quotation-family).

For your own definition or thesis, use `<p class="beauty-lead">…</p>`: larger body
text without quotation marks or a rule. See [quotation sizes and spacing](typography-reference.md#quotations).

## Opening quotes, numerals and fractions

Both parameters below default to `false` and accept site or page settings:

| Option | Scope and exclusions |
| --- | --- |
| `hangingQuotes = true` | Hang initial «, “ or ‘ in H1–H3 and ordinary paragraphs, including blockquotes. Excludes paragraphs in lists, notes, tables, figures and asides. |
| `proseNumerals = true` | Select old-style proportional figures in direct article paragraphs and their quotations. Headings, lists, tables, captions and note numbers keep their usual figures. |

Hanging marks stay in copied text and return inside the line in print. Listings
and metadata stay unchanged. `typography = false` and `data-typography="off"`
disable processing; heading anchors accommodate the mark on narrow screens.

Old-style figures depend on the font's OpenType support. Set `proseNumerals = false`
on analytical pages, or use `<span class="beauty-lining-nums">7/10</span>` for one value.

Use `{{< fraction "1/3" >}}` for an explicit fraction. It accepts nonnegative integer
numerator/denominator pairs with a nonzero denominator. Beauty composes smaller digits
without changing line height or copied text; dates, scores, URLs and formulas are
never converted automatically.

## Article publication credits

Place a known publication credit after the conclusion, before footnotes:

```html
<p class="beauty-note">This article was published in
<a href="https://example.org/article/">Publication name</a>.</p>
```

The note is upright, regular, muted and `0.875em`; the publication keeps normal link
styling. Avoid inline font rules or bold/italic wrappers. Keep URL and placement in
sync across translations; say “first published” only when the chronology is known.
Use a [caption credit](media.md#captions) for image sources.

## Drop caps

Set `dropCap = true` in an **individual article's front matter**. It is off by default
and is not inherited from site params.

- Start with an ordinary paragraph. A preceding heading, quotation, list or figure prevents the treatment.
- Choose enough prose to wrap around the letter; preview each language.
- Prefer a plain first word: opening quotes enlarge too, and decorated words can underline the initial.
- Notes, captions, fine print and `data-typography="off"` paragraphs are excluded.

The initial uses the H1 family and weight, wraps across two lines and rises by a
quarter line. Text is neither removed nor duplicated. Print and browsers without
`initial-letter` support use ordinary text; no script or extra font is loaded.

For single-letter opening words such as “I” or “A”, a nonbreaking space preserves
Chromium's copied word separator; `typography = false` disables that adjustment.
See [drop-cap tokens](typography-reference.md#drop-caps) when changing fonts.

## Article links

External Markdown links already open in a new tab by default. The option below
extends this behavior to internal destinations and authored links in post bodies.

Set `articleLinksNewTab = true` in site or page params to open post-body destinations,
including internal links, in new tabs. The default is `false`.

| Included | Left unchanged |
| --- | --- |
| Posts in `mainSections`: Markdown, authored HTML and shortcode links | Same-page anchors, footnotes, downloads, non-web schemes, navigation, listings and standalone pages |

Markdown receives `target="_blank"` and `rel="noopener noreferrer"` during the build;
the browser enhances authored HTML/shortcode links.

## Footnotes

Use native Markdown; no shortcode is needed:

```markdown
A useful claim[^source] can reference the same note again[^source].

[^source]: A short note naming the source.
```

Notes are numbered by first citation and retain return links for every reference.
Numbers remain visible when a note starts with code, a quotation or a list.

### Optional desktop side notes

Set `sideNotes = true` in site or page params. When the inline-end gutter fits,
original note items sit beside their first references without widening the reading
column or duplicating IDs. Dense notes stack, avoid wide blocks and reserve footer space.

Narrow windows, mobile, print and no-JavaScript views keep endnotes. Only the margin
layout hides an immediately preceding H2–H6 notes heading and return arrows.
Repeated references still point to one note. Initial note URLs settle after fonts
and images load, unless the reader has already interacted.

### Shared typography

Small italic superscripts keep native links and visible keyboard focus without
enlarging line boxes. Endnotes use muted body text, hanging numbers and no list
indentation. See [footnote/list tokens](typography-reference.md#footnotes-and-lists)
for sizes, spacing and the Beauty compatibility adapter.

## Heading scroll controls

Set `headingScroll = true` in site or page params (default: `false`).

| Action | Result |
| --- | --- |
| Click H1/H2 | Align 24 px below the viewport top; update the fragment. |
| Tab, then Enter/Space | Focus and activate the native text anchor. |
| Option/Alt + Down / Up | Next / previous H1/H2 relative to the reading position; no wrapping. |
| Click H3 | Keep the normal copy-link behavior. |

H1 uses `#page-title`; section IDs stay stable. H2 text replaces its copy icon.
Repeated clicks do not add history entries; copy/open-in-new-tab/back/forward work
as native links. Between sections, Up returns to the current section's heading.

Shortcuts ignore held-key repeats, editing/composition, extra modifiers and open
menus/dialogs. Distinct presses work during scrolling. Selections and modified
clicks stay native; authored links are not nested or replaced.

Reduced motion disables smooth scrolling. Without JavaScript, original headings
and H2/H3 links remain. `.no-anchor` headings are not enhanced; near the footer,
document length limits alignment. There are no visible shortcut hints.
See [focus styling](customization.md#focus-and-controls) and
[article-to-article shortcuts](content.md#article-keyboard-navigation).

## Reading layout

The default is a 720 px reading column, 18/28 px text on desktop and 19/29 px on
mobile. See the [visual reference](typography-reference.md#reading-layout) for the
complete scale, title rhythm, badges and table dates.

## Heading alignment and narrow titles

See [heading geometry](typography-reference.md#headings) for optical alignment,
narrow-screen hyphenation and font tokens. To select a different typeface, use
[font profiles](fonts.md).

## Captions, link arrows and stable columns

Use the [media guide](media.md) for captions and wide figures. Arrow geometry and
the desktop scrollbar gutter are documented in the
[visual reference](typography-reference.md#links-captions-and-columns).

## Code and print

Enable [class-based highlighting](configuration.md#syntax-highlighting) for the
light/dark/print palettes. See [printing](content.md#printing),
[diagram fallbacks](media.md#diagram-loading-and-printing) and
[table layout](typography-reference.md#code-tables-and-print).
