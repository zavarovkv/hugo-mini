# Images, diagrams and code

[Documentation](README.md) · [Writing content](content.md) · [Typography](typography.md)

Use native Markdown for ordinary images and code. Add shortcodes when you need
a caption, a diagram or a wider figure.

[Images](#wide-images) · [Diagrams](#wide-diagrams) · [Code](#wide-code-blocks) · [Formulas](#formulas) · [Captions](#captions) · [Layout limits](#wide-layout-reference)

## Wide images

```text
{{< image src="/images/certificate.webp" alt="Course certificate" wide=true caption="Certificate received after the course." >}}
```

| Option | Meaning |
| --- | --- |
| `src` | Required image path or URL |
| `alt` | Required text alternative; use an empty string for a decorative image |
| `wide` | Optional `true` or `false`; ordinary figures stay in the text column |
| `caption` | Optional Markdown description |
| `kind` | `description` (default) or `credit`; see [captions](#captions) |
| `width`, `height` | Positive intrinsic dimensions; required when they cannot be read locally |

On desktop, a wide image extends equally into both margins, up to 960 px and
its intrinsic width. Its italic caption sits centered below it and wraps at
50ch. On mobile and in print the image fits the text column.

Mini reads dimensions from local JPEG, PNG, GIF and WebP files in page bundles or
`static/`. Native Markdown images get these dimensions, lazy loading and asynchronous decoding.
They remain responsive;
the attributes reserve space before the image loads.

For SVGs, external images and unreadable sources, supply dimensions yourself.
Builds never fetch external images. Raw HTML `<img>` tags bypass Markdown hooks,
so always include their intrinsic `width` and `height`.

## Wide diagrams

Set `mermaid = true` in the page's front matter, then add a diagram:

```text
{{< mermaid wide=true caption="How the parts connect" >}}
flowchart LR
  Draft --> Review --> Publish
{{< /mermaid >}}
```

`wide=true` centers the diagram on the text column and its italic caption beneath it,
just like a wide image. `caption` accepts Markdown. With neither option,
the shortcode keeps its plain `pre` markup. SVGs retain their aspect ratio;
mobile and print fit the column. Without JavaScript or a successful download,
the source remains readable.

### Choose how to load Mermaid

The default is a pinned Mermaid 11 CDN script, loaded only on pages that enable it.
To self-host, choose one option in your existing `[params]` table:

| Option | Example |
| --- | --- |
| Classic script | `mermaidSrc = "/js/mermaid.min.js"` |
| ESM entry (takes precedence) | `mermaidModuleSrc = "/js/mermaid/mermaid.esm.min.mjs"` |

For ESM, copy both `mermaid.esm.min.mjs` **and its `chunks/mermaid.esm.min/` directory**
from the same pinned npm package into `static/js/mermaid/`. Copying only the entry
file breaks dynamic imports. Local entry URLs receive a content hash while relative
chunk paths remain intact. External or missing local URLs are left unchanged.

Mermaid 12 needs Node.js 22.12+ for its tooling and ES2024-capable browsers, including
Safari 17.4+. Sites supporting older browsers can retain Mermaid 11. Mini uses Dagre with the classic renderer. [Mermaid upgrade notes](vendor-assets.md#mermaid)

### Diagram loading and printing

Nearby diagrams render first. The browser prepares the rest and their print copies when idle. Switching color schemes replaces each diagram once its new colors are ready. Print uses a neutral diagram or the readable source if rendering is still in progress.

## Wide code blocks

Set `wideCode = true` in **page front matter**, then use ordinary fenced Markdown.
On desktop, long blocks extend equally into both margins, up to the same 960 px
limit as wide illustrations. Short examples and nested blocks keep their usual width.

Source, font size, line numbers and copy buttons stay unchanged. Screen code
scrolls instead of wrapping. JavaScript measures overflow after layout/font changes;
without it, code stays in the text column with native scrolling. Print uses the
normal column and wraps long lines.

Use class-based highlighting (`[markup.highlight] noClasses = false`) for the
bundled syntax palette and its light/dark/print styles.

## Formulas

Set `math = true` in each article that uses formulas. Mini serves KaTeX from your site and renders in the browser. Enable Goldmark passthrough in `hugo.toml` to preserve TeX commands, underscores and matrix row breaks during Markdown processing.

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    inline = [['\(', '\)']]
    block = [['$$', '$$'], ['\[', '\]']]
```

Write `\(x_1\)` inline or place a display formula between two lines of `$$`. If your articles use single-dollar inline math, add `['$', '$']` to the `inline` array.

## Captions

```text
{{< caption >}}What the image shows{{< /caption >}}
{{< caption kind="credit" >}}Photo: the author{{< /caption >}}
```

| `kind` | Treatment |
| --- | --- |
| `description` (default) | Upright, start-aligned explanation |
| `credit` | Italic, muted, end-aligned attribution |

Both use Beauty's caption size and image gap. Unknown kinds fail the build;
roles are never guessed from names or punctuation. Legacy `.caption` markup uses
the description treatment; add `beauty-caption-credit` for a source credit.
Image and diagram figures have 32–56 px of space above and below them on screen.
Their italic captions sit centered 16 px below the artwork and wrap at 50ch.
These settings apply at both ordinary and wide sizes.

## Divider

Use `{{< plug >}}` between sections for a centered three-asterisk divider.
For an actual section title, use a native Markdown heading instead.

## Wavy arrow

```text
From 2021 {{< wavy-arrow >}} 2025, I taught product management.
```

The inline SVG uses the surrounding text color, scales with the font and has no
animation. Its loop and open arrowhead align with adjacent numerals. The accessible
label defaults to the localized `wavy_arrow_to` string (“to” / “по”);
`label="until"` overrides it.

| Token | Default |
| --- | --- |
| `--wavy-arrow-width` | `2.25em` (36 px at a 16 px font size) |
| `--wavy-arrow-height` | `1.125em` |

## Wide layout reference

| Constraint | Images | Diagrams | Code |
| --- | --- | --- | --- |
| Desktop width | Up to source width, wide limit and available space | Up to wide limit and available space | Reading width or full available wide measure |
| Alignment | Centered on text column | Centered on text column | Centered on text column |
| Mobile (`48rem` and below), nested blocks, print | Normal column | Normal column | Normal column |
| Without JavaScript | CSS expansion fallback | Readable source | Column-width scrolling |

`--article-wide-width` defaults to `60rem` (960 px); `--article-edge-gap` reserves
24 px at the viewport edge. All three leave room for section markers.
Measurements refresh after resize, font/image loading and article layout changes.
Mini owns this geometry; Beauty.css owns native typography and caption rhythm.
