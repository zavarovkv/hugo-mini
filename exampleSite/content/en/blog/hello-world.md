+++
title = "Typography & Markdown"
slug = "hello-world"
date = "2026-04-01T12:00:00+00:00"
description = "A complete guide to Markdown rendering and typography in the Mini theme"
categories = ["getting-started"]
+++

Mini renders all standard Markdown with clean, readable typography powered by the [Inter](https://rsms.me/inter/) font family — self-hosted, no CDN required.

## Headings

Headings use a progressive scale from h1 to h6, with bold weight and tighter line height for visual hierarchy.

### Third-Level Heading

#### Fourth-Level Heading

##### Fifth-Level Heading

## Text Formatting

Regular paragraph text is set in 300 weight for comfortable reading. **Bold text** uses 600 weight and inherits the heading color for emphasis. *Italic text* adds a subtle visual shift. You can also combine **_bold and italic_** when needed.

Inline `code` renders in a monospace font with a subtle background, making it easy to distinguish from prose — useful for referencing things like `config.toml` or `hugo server`.

## Links

Internal links like [Articles](/blog/) behave normally. External links like [Hugo documentation](https://gohugo.io/documentation/) automatically open in a new tab with `rel="noopener noreferrer"` — thanks to the built-in render hook. No configuration needed.

## Lists

Unordered lists:

- Self-hosted Inter font family (200–700 weights)
- Dark mode with system preference detection
- Multilingual support with language switcher
- Mobile-first responsive layout

Ordered lists get bold markers for scannability:

1. Create your content in `content/` directory
2. Configure the theme in `config.toml`
3. Run `hugo server` for local preview
4. Deploy with `hugo --minify`

Nested lists work too:

- Typography
  - Headings with progressive scale
  - Comfortable reading weight
  - Monospace code blocks
- Features
  - KaTeX math formulas
  - Mermaid diagrams
  - Custom shortcodes

## Blockquotes

> Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects, and the products are not burdened with non-essentials.
>
> — Dieter Rams

## Code Blocks

Syntax highlighting works out of the box. Colors automatically adapt to dark mode.

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Mini!")
}
```

```css
:root {
  --color-primary: #0060a0;
  --color-accent: #d04000;
}
```

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Dark mode | Supported | System preference + manual toggle |
| Math | Supported | KaTeX, per-page opt-in |
| Diagrams | Supported | Mermaid, per-page opt-in |
| i18n | Supported | EN + RU out of the box |

## Horizontal Rule

Three dashes create a horizontal rule:

---

Content continues below.

## Images

Images are lazy-loaded with `loading="lazy"` and `decoding="async"` via the render hook. Just use standard Markdown syntax:

```markdown
![Alt text](/path/to/image.png)
```
