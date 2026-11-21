+++
title = "Shortcodes & HTML Elements"
slug = "shortcodes-demo"
date = "2026-01-15T12:00:00+00:00"
description = "Built-in shortcodes and styled HTML elements in the Mini theme"
categories = ["getting-started"]
wideCode = true
reading_list = "books"
+++

Mini includes shortcodes and CSS classes for content that goes beyond standard Markdown.

## Article selections

Use `featured-posts` to introduce readers to selected articles in your chosen order.
Set their content paths in `hugo.toml`; the same list resolves to each language's titles and URLs:

```toml
[params]
featuredPosts = ["/blog/theme-features", "/blog/under-the-hood", "/blog/hello-world"]
```

Place this shortcode in your homepage `_index.md`:

```text
{{</* featured-posts archive="/blog/" archiveLabel="All articles" */>}}
```

{{< featured-posts archive="/blog/" archiveLabel="All articles" >}}

To show recent articles by date instead, use `latest-posts count="3"`.
Both shortcodes support the same optional archive link.

## Columns

`columns` stacks blocks on mobile and places them side by side above `48rem`.
Use `ratio="3:2"` for 60/40, `ratio="2:3"` for 40/60, or omit it for equal columns:

{{< columns ratio="3:2" >}}
{{< column >}}
{{< latest-posts count="2" >}}
{{< /column >}}
{{< column >}}
### Projects {.posts-group-title .no-anchor}
{{< project name="Hugo Mini" url="https://themes.gohugo.io/themes/hugo-mini/" icon="images/hugo-mini-logo-light.svg" iconDark="images/hugo-mini-logo-dark.svg" >}}
The theme used by this demo. {{< github-stars repo="zavarovkv/hugo-mini" >}}
{{< /project >}}
{{< /column >}}
{{< /columns >}}

<details><summary>Preview an unknown counter</summary>
<p>An unknown value reserves space until the counter is ready.</p>
<p aria-hidden="true">Views <span class="loading-skeleton" aria-busy="true"><span>000</span></span></p>
</details>

## Reading list

The `reading-list` shortcode renders a localized shelf from one data file.

{{< reading-list >}}

## Wide images

Choose `wide=true` to center an illustration across both margins, up to its source width or 960 px.
Its caption is centered beneath it in italic.
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

Markdown {{< wavy-arrow label="renders as" >}} HTML

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
