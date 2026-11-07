# Typography

English | [Русский](typography.ru.md)

Mini uses Goldmark for Markdown punctuation, build-time rules for prose, and Beauty.css for layout. No browser text-rewriting JavaScript.

## Rules

| Input | Russian output | English output |
| --- | --- | --- |
| `"Фильм 'Звездные войны'"` | `«Фильм „Звездные войны“»` | Goldmark's smart quotes |
| `«Фильм «Звездные войны»»` | `«Фильм „Звездные войны“»` | unchanged |
| `«Звездные войны» - классика` | `«Звездные войны» — классика` | unchanged |
| `в Москве и на улице` | `в Москве и на улице` | unchanged |
| `1 000 000` | `1 000 000` | `1 000 000` |
| `3000₽` | `3000 ₽` | `3000 ₽` |
| `16px` | `16 px` | `16 px` |
| `10 %` | `10 %` | `10%` |

- **Quotes:** outer `«...»`, inner `„...“` in Russian; nesting works across inline markup. Apostrophes are preserved.
- **Dashes:** Goldmark converts `--` → `–`, `---` → `—`; Mini converts spaced `word - word` to an em dash in Russian. `1 - 2` and `по-настоящему` stay intact.
- **Short words (RU):** `в, к, с, у, о, и, а, на, по, из, от, до, за, во, со, ко, об` join the next word of at least three letters. No long unbreakable chains.
- **Spaces:** U+202F within grouped numbers; U+00A0 before units, Russian percentages and em dashes, and after short Russian words.

## Scope and exclusions

- Applies to Russian and English **homepage and single-page bodies**. Markdown sources, page titles, metadata, listings and feeds are unchanged.
- Preserves code, formulas, Mermaid, HTML tags and attributes, comments, URLs and paths. No rewriting across HTML tags or guessing ambiguous ranges.
- Other languages are not processed by Mini's extra pass.

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
<span data-typography="off">«Фильм «Звездные войны»» - 16px</span>
```

Raw HTML needs `markup.goldmark.renderer.unsafe = true`. These controls affect Mini's **extra pass**, not native Goldmark substitutions. To change those, configure [Goldmark Typographer](https://gohugo.io/configuration/markup/#typographer).

## Reading layout

16 px text, up to 720 px wide. Beauty.css controls headings, line height and wrapping; tables and code scroll independently. See [customization](customization.md).
