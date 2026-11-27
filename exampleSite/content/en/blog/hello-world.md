+++
title = "Typography & Markdown"
slug = "hello-world"
date = "2026-04-01T12:00:00+00:00"
description = "A complete guide to Markdown rendering and typography in the Mini theme"
categories = ["getting-started"]
dropCap = true
+++

Mini styles native Markdown through Beauty.css. Bundled [Inter](https://rsms.me/inter/) is the default; the public demo uses a custom font profile. Fonts are served from the site itself.

## Headings

In the public demo, H1 and article H2 headings use Sourdine Medium. Body text and lower-level headings use Story.[^fonts]

[^fonts]: A fresh installation uses the bundled Inter. To use your own title face for article H2s, configure `params.fonts.title` and enable `articleH2UseTitleFont`.

### Third-Level Heading

#### Fourth-Level Heading

##### Fifth-Level Heading

## Text Formatting

**Bold**, *italic* and **_combined emphasis_** follow the active font profile. Bundled Inter uses 300 for body text, 500 for prominent links and 600 for bold text.

Inline `code` is monospace. In prose, the `fraction` shortcode sets a fraction like {{< fraction "1/3" >}} alongside ordinary figures such as 2026.

## Links

Open [Articles]({{< relref "/blog" >}}) in a new tab or jump to [Tables](#tables) in this article. The demo enables `articleLinksNewTab` in post bodies.

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

<p class="beauty-lead">An editorial lead gives a definition or a central idea a paragraph of its own.</p>

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

<p class="beauty-note">Source of this example: <a href="https://github.com/zavarovkv/hugo-mini/blob/main/exampleSite/content/en/blog/hello-world.md">Hugo Mini</a>.</p>
