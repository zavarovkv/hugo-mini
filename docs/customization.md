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
- Named blocks in `baseof.html` let a template replace `head`, `header`, `main`, `footer`, or `scripts`.
- Copy a theme template into the matching site path only when the whole template needs to diverge.

## Assets

The theme bundles and fingerprints its CSS and JavaScript with Hugo Pipes. Fonts are self-hosted. Mermaid is the only optional CDN asset; set `params.mermaidSrc = "js/mermaid.min.js"` after placing a local bundle in `static/js/` to avoid that request too.
