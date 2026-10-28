# Reading and typography

## Reading width

The theme uses 16 px reading text and a maximum reading width of `45rem`
(720 px at the default root size). Content narrows with the viewport; wide
components such as tables and code retain their own overflow behavior.

Shared type, wrapping, heading rhythm, quotations and links come from the pinned
Beauty.css foundation. The theme configures `--beauty-reading-width` in its token
block and owns the page layout and Inter font loading. See
[customization](customization.md) when changing tokens in a consuming site.

## Build-time processing

Two stages run during an ordinary `hugo` build:

1. Goldmark renders Markdown and applies its configured smart punctuation:
   quotation marks, ellipses, `--` as an en dash and `---` as an em dash.
2. The theme processes text nodes in the rendered homepage and single-page body.
   Its additional spacing rules apply to Russian and English, including regional
   language codes such as `en-GB`. Other languages pass through unchanged.

There is no extra dependency, network request or browser text-rewriting script.
Markdown files and translation hashes are never rewritten. Titles, metadata,
heading IDs, listings and feed content do not receive the additional spacing pass.
Custom layouts that render `.Content` directly are also unaffected.

| Input | Russian output | English output |
| --- | --- | --- |
| `1 000 000` | `1 000 000` | `1 000 000` |
| `3000₽` | `3000 ₽` | `3000 ₽` |
| `16px` | `16 px` | `16 px` |
| `2 ГБ` | `2 ГБ` | `2 ГБ` |
| `10 %` | `10 %` | `10%` |
| `Text — continuation` | `Text — continuation` | `Text — continuation` |

Existing digit groups use narrow nonbreaking spaces (U+202F). Measurements,
currencies, Russian percentages and the space before a Russian em dash use
nonbreaking spaces (U+00A0). Only already spaced em dashes are adjusted.

The pass recognizes common metric, time, storage, frequency, power and pixel
units. It does not infer number ranges, change a single hyphen into a dash,
regroup unformatted numbers or bind short prepositions. Years and technical
tokens such as `2026`, `B2B`, `model16px` and `10MBps` stay intact. Rules operate
within each text node; a number and its unit separated by an HTML tag are not
joined.

## Protected content

The spacing pass preserves HTML tags and attributes, comments, visible URLs and
paths, and content inside `pre`, `code`, `kbd`, `samp`, `script`, `style`,
`textarea`, `svg` and `math`. Escaped HTML stays escaped.

TeX inside `\(...\)`, `\[...\]` and `$$...$$` is preserved. On pages with
`math = true`, `$...$` is protected as well, matching the theme's KaTeX
delimiters. Mermaid source remains inside a protected code block.

## Disable or limit processing

Disable the theme's spacing pass for one page:

```toml
+++
title = "Literal text"
typography = false
+++
```

Or disable it site-wide in `hugo.toml`:

```toml
[params]
  typography = false
```

A page with `typography = true` overrides that site setting. To preserve one
raw HTML fragment, including nested elements, use:

```html
<span data-typography="off">A literal label: 16px, 10 %</span>
```

Raw HTML requires Goldmark's `renderer.unsafe = true`. These switches control
only the theme's additional spacing rules. Goldmark's punctuation substitutions
are configured separately under `markup.goldmark.extensions.typographer`;
use its settings for language-specific quote characters or disable that
extension with `disable = true`. Use Markdown code spans or fenced blocks for
text that must bypass both punctuation and spacing.
