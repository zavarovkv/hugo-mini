# Customization

Keep site-specific overrides in the site's own `assets/` and `layouts/` directories. Hugo resolves them before theme files.

## Colors

Override design tokens in your site's CSS instead of copying the theme stylesheet:

```css
:root {
  --color-text: #202124;
  --color-link: #1769aa;
  --color-background: #ffffff;
  --color-divider: #e5e7eb;
  --color-control-border: #d1d5db;
}

:root[data-theme="dark"] {
  --color-text: #e5e7eb;
  --color-link: #7dd3fc;
  --color-background: #111827;
}
```

The full token list is at the top of [`assets/css/main.css`](https://github.com/zavarovkv/hugo-mini/blob/main/assets/css/main.css).

## Menu icons

Set `params.icon` on a menu entry. The theme includes `telegram`; custom icons are Hugo resources at `assets/icons/<name>.svg` in your site.

```toml
[[menu.main]]
  name = "Telegram"
  url = "https://t.me/example"
  [menu.main.params]
    icon = "telegram"
```

## Templates

Use focused overrides whenever possible:

- `layouts/_partials/custom_head.html` adds site-specific tags to `<head>`.
- `layouts/_partials/custom_body.html` adds scripts or markup before the closing `</body>` tag.
- Named blocks in `baseof.html` let a template replace `head`, `favicon`, `header`, `main`, `footer`, or `scripts`. The `favicon` block defaults to the site's configured icons, so standalone project templates can supply their own without duplicate icon links.
- Copy a theme template into the matching site path only when the whole template needs to diverge.

For a project-name link in a custom header, use `<a class="brand-link" href="…"><strong>Project name</strong></a>`. It retains the heading color and bold text without an underline, including on hover; keyboard focus remains visible through Beauty.css.

To reuse the theme's mobile menu in a custom header, render `{{ partial "menu-toggle.html" . }}` next to `<nav class="main-nav" id="main-navigation">…</nav>`. The shared stylesheet and browser bundle handle the mobile overlay, Escape, link selection, focus leaving the navigation and the desktop breakpoint. The overlay stays hidden during initialization; opening and closing it retain their animation. Without JavaScript the links remain visible. The custom header owns its brand placement and desktop arrangement.

To suppress icons on an independent page, override the `favicon` block with
`<link rel="icon" href="data:,">`. An empty block falls back to the base template;
the explicit empty icon also avoids an implicit browser request for `/favicon.ico`.

### Footer links on custom pages

Reuse `footer-content.html` inside a `footer` block to change the links while keeping the theme's icons, language switcher and color-scheme control:

```go-html-template
{{ define "footer" }}
  {{ partial "footer-content.html" (dict
    "page" .
    "social" (dict "github" "https://github.com/owner/project" "telegram" "https://t.me/project")
    "labels" (dict "github" "Project on GitHub" "telegram" "Project on Telegram")
    "copyright" "© Example Project"
  ) }}
{{ end }}
```

Pass `rss = true` in the dictionary to include the current language's feed. Omitted labels use the platform names; omitted copyright uses the standard year range. The default `footer.html` passes `params.social` and enables RSS, preserving the regular blog footer.

## Share cards

The theme generates a 1200×630 share card for each page. To customize selected pages, add `layouts/_partials/custom_og_image.html` to your site. It receives the page and must return an image resource or `false` to keep the default:

```go-html-template
{{- $image := false -}}
{{- with .Params.shareImage -}}
  {{- $image = resources.Get . -}}
{{- end -}}
{{- return $image -}}
```

In this example, `shareImage = "images/event-card.png"` resolves to `assets/images/event-card.png`. The hook may also compose an image with Hugo's image filters. Open Graph, Twitter Cards, and JSON-LD share its URL and dimensions. Image metadata includes the page title as alternative text.

## Loading values

Use `loading-skeleton` on an inline value whose visible content is wrapped in child elements. It preserves that content's space and covers it with a compact, theme-aware placeholder. Set `aria-busy="true"` during the request; remove both the class and the attribute on success or failure. Keep known values available without JavaScript and during refreshes; use the placeholder only when no value is known. It pulses gently and disables animation for reduced-motion preferences.

## Assets

The theme bundles and fingerprints its CSS and JavaScript with Hugo Pipes. Fonts are self-hosted. Mermaid is the only optional CDN asset; set `params.mermaidSrc = "js/mermaid.min.js"` after placing a local bundle in `static/js/` to avoid that request too.
