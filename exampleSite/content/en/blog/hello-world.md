+++
title = "Typography & Markdown"
slug = "hello-world"
date = "2026-04-01T12:00:00+00:00"
description = "A complete guide to Markdown rendering and typography in the Mini theme"
categories = ["getting-started"]
+++

Mini styles native Markdown through Beauty.css. Bundled [Inter](https://rsms.me/inter/) is the default; the public demo uses a custom font profile. Fonts are served from the site itself.

## Headings

Heading levels use a progressive scale and tighter line height; their faces and weights follow the active font profile.

### Third-Level Heading

#### Fourth-Level Heading

##### Fifth-Level Heading

## Text Formatting

**Bold**, *italic* and **_combined emphasis_** follow the active font profile. Bundled Inter uses 300 for body text, 500 for prominent links and 600 for bold text.

Inline `code` is monospace, with a subtle fill in dark mode: `config.toml`, `hugo server`.

## Links

Internal links like [Articles](/blog/) behave normally. External links like [Hugo documentation](https://gohugo.io/documentation/) automatically open in a new tab with `rel="noopener noreferrer"` — thanks to the built-in render hook. No configuration needed.

## Lists

Unordered lists:

- Self-hosted Inter: normal 300, 500 and 600, plus italic 300
- Dark mode with system preference detection
- Multilingual support with language switcher
- Mobile-first responsive layout

Ordered-list markers share the surrounding text weight:

1. Create your content in `content/` directory
2. Configure the theme in `config.toml`
3. Run `npm run dev` for the search-enabled demo or starter
4. Build with `npm run build` and publish `public/`

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

Dieter Rams on design:

> Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects, and the products are not burdened with non-essentials.

## Code Blocks

Set `markup.highlight.noClasses = false` for colors that follow both themes. The demo enables this in its Hugo configuration.

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

Three dashes create a horizontal rule, with 32 px before it and 16 px after:

---

Content continues below.

## Images

Images are lazy-loaded with `loading="lazy"` and `decoding="async"` via the render hook. Just use standard Markdown syntax:

```markdown
![Alt text](/path/to/image.png)
```
