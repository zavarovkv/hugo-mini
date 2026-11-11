+++
title = "Shortcodes & HTML Elements"
slug = "shortcodes-demo"
date = "2026-01-15T12:00:00+00:00"
description = "Built-in shortcodes and styled HTML elements in the Mini theme"
categories = ["getting-started"]
+++

Mini includes shortcodes and CSS classes for content that goes beyond standard Markdown.

## Wide images

Choose `wide=true` to let an illustration expand to the right of the text column, up to 960 px.
Wide images keep the text edge and expand right within the source and viewport limits.
On mobile and in print, images fit the ordinary column. Local raster dimensions are automatic;
SVGs and remote images need explicit `width` and `height`.

```text
{{</* image src="/images/wide-chart.svg" alt="Sample line chart" width=1200 height=600 wide=true caption="A wide illustration with a caption at the reading measure." */>}}
```

{{< image src="/images/wide-chart.svg" alt="Sample line chart" width=1200 height=600 wide=true caption="A wide illustration with a caption at the reading measure." >}}

## Caption

The `caption` shortcode adds a smaller, upright, start-aligned image description. Use it after images or code blocks:

```markdown
![Photo](/path/to/image.png)
{{</* caption */>}}Figure 1 — description of the image{{</* /caption */>}}
```

{{< caption >}}Figure 1 — place an image above this caption{{< /caption >}}

For a short author/source attribution, use `kind="credit"` to select muted italic text aligned to the end:

```markdown
{{</* caption kind="credit" */>}}Photo: the author{{</* /caption */>}}
```

{{< caption kind="credit" >}}Photo: the author{{< /caption >}}

## Plug (Section Divider)

The `plug` shortcode inserts a decorative "* * *" divider — useful for separating sections within a long post:

```markdown
{{</* plug */>}}
```

{{< plug >}}

## Pull Quotes

Use the `callout` shortcode for a block quotation. Its content supports Markdown. This demo enables `editorialQuotes = true`, so Markdown quotes and callouts share the same style:

```markdown
{{</* callout */>}}Your pull quote text here.{{</* /callout */>}}
```

{{< callout >}}A good blog theme should be invisible. The reader should see the content, not the design.{{< /callout >}}

## Underline

The `.beauty-emphasis` CSS class creates a native wavy underline — useful for highlighting key phrases:

```html
<span class="beauty-emphasis">highlighted text</span>
```

<span class="beauty-emphasis">This text has a decorative underline</span> — it works well for emphasis that stands out more than italic but less than bold.

## Button

The `.button` CSS class creates a styled call-to-action button with a gradient background:

```html
<a href="/blog/" class="button beauty-button">Read Articles</a>
```

<a href="/blog/" class="button beauty-button">Read Articles</a>

## Combining Elements

These elements work well together. Here's a typical pattern for a landing section:

<span class="beauty-emphasis">For writers</span> — Mini keeps things simple. Write in Markdown, add front matter flags for math or diagrams when needed, and let the theme handle the rest.

{{< plug >}}

<figure class="beauty-quotation">
  <blockquote>
    <p><span class="beauty-hanging-open">“</span>Simplicity is the ultimate sophistication.”</p>
  </blockquote>
  <figcaption class="beauty-quotation-attribution">
    <span aria-hidden="true">—</span>
    <span>Attributed to Leonardo da Vinci</span>
  </figcaption>
</figure>
