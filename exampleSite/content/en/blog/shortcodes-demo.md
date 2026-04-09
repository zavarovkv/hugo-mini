+++
title = "Shortcodes & HTML Elements"
slug = "shortcodes-demo"
date = "2026-01-15T12:00:00+00:00"
description = "Built-in shortcodes and styled HTML elements in the Mini theme"
categories = ["getting-started"]
+++

Mini includes shortcodes and CSS classes for content that goes beyond standard Markdown.

## Caption

The `caption` shortcode adds a styled caption — italic, right-aligned, small text. Use it after images or code blocks:

```markdown
![Photo](/path/to/image.png)
{{</* caption */>}}Figure 1 — description of the image{{</* /caption */>}}
```

{{< caption >}}Figure 1 — place an image above this caption{{< /caption >}}

## Plug (Section Divider)

The `plug` shortcode inserts a decorative "* * *" divider — useful for separating sections within a long post:

```markdown
{{</* plug */>}}
```

{{< plug >}}

## Pull Quotes

Use the HTML `<q>` element for highlighted pull quotes. Requires `unsafe = true` in Hugo's markup config (already enabled in this example site):

```html
<q>Your pull quote text here.</q>
```

<q>A good blog theme should be invisible. The reader should see the content, not the design.</q>

## Underline

The `.underline` CSS class creates a decorative SVG underline — useful for highlighting key phrases:

```html
<span class="underline">highlighted text</span>
```

<span class="underline">This text has a decorative underline</span> — it works well for emphasis that stands out more than italic but less than bold.

## Button

The `.button` CSS class creates a styled call-to-action button with a gradient background:

```html
<a href="/blog/" class="button">Read Articles</a>
```

<a href="/blog/" class="button">Read Articles</a>

## Combining Elements

These elements work well together. Here's a typical pattern for a landing section:

<span class="underline">For writers</span> — Mini keeps things simple. Write in Markdown, add front matter flags for math or diagrams when needed, and let the theme handle the rest.

{{< plug >}}

<q>Simplicity is the ultimate sophistication.</q>

<div style="font-size: 12px;">
Leonardo da Vinci
</div>
