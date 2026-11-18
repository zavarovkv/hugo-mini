# Customization

[Documentation](README.md) · [Fonts](fonts.md) · [Visual reference](typography-reference.md)

Keep site-specific files in your site's `assets/` and `layouts/`; Hugo resolves them
before theme files. Prefer tokens and extension hooks to copying entire templates.

[Colors](#colors) · [Identity](#logo-and-favicon) · [Menus](#menu-icons) · [Templates](#templates) · [Share cards](#share-cards)

## Colors

1. Create `assets/css/custom.css` in your site:

   ```css
   :root {
     --text-color: #202124;
     --color-primary: #1769aa;
     --color-primary-border: rgba(23, 105, 170, 0.35);
     --background-color: #ffffff;
     --color-divider: #e5e7eb;
     --color-control-border: #d1d5db;
   }

   :root[data-theme="dark"] {
     --text-color: #e5e7eb;
     --color-primary: #7dd3fc;
     --color-primary-border: rgba(125, 211, 252, 0.35);
     --background-color: #111827;
   }
   ```

2. Load it after the theme stylesheet from `layouts/_partials/custom_head.html`:

   ```go-html-template
   {{ with resources.Get "css/custom.css" }}
     {{ $css := . | minify | fingerprint "sha256" }}
     <link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">
   {{ end }}
   ```

3. Preview both color schemes and keyboard focus.

Public tokens live in [`assets/css/main.css`](../assets/css/main.css).
Shared native typography belongs to [Beauty.css](vendor-assets.md#beautycss-foundation).

### Focus and controls

Keyboard focus uses a thin, rounded outline offset by `--beauty-focus-offset` (4 px). Forced-color mode uses a 2 px system outline. Preserve both when changing link colors.

| Control | Color token |
| --- | --- |
| Language and search | `--color-muted` at rest, `--color-accent` on hover or focus |
| Copy confirmation | `--color-success` |
| Buttons (`.button.beauty-button`) | `--color-button-start`, `--color-button-end`, `--color-button-text` |

## Logo and favicon

The bundled asterisk is the default favicon, with Android and iOS icons. It does
not replace a header avatar. To use the same mark in the header:

```toml
[params]
  logo = "images/hugo-mini-logo-light.svg"
  logoDark = "images/hugo-mini-logo-dark.svg"
```

| Option | Behavior |
| --- | --- |
| `logoDark` omitted | Use `logo` in both modes. |
| `logo` configured | Takes precedence over `avatar` / `avatarHover`; remove it to use an avatar. |
| Custom `favicon` | SVG or 32×32 PNG in `static/`; add your own `favicon192` and `appleTouchIcon` if needed. |
| `favicon = false` | Disable bundled icons. |

Local logos, avatar states, project marks and favicons receive content-versioned URLs
so a rebuild refreshes cached images. Existing query parameters and fragments are
preserved. External URLs and missing files retain their configured paths.

## Menu transitions

Desktop menu items reserve space for their bold active labels. Above 768 px, supported browsers fade menu changes over `--nav-transition-duration` (300 ms). Content updates immediately. Mobile uses its own overlay, and reduced-motion settings skip the transition.

## Menu icons

Mini includes `telegram`. For your own icon, add `assets/icons/<name>.svg` and
reference its name in the menu entry:

```toml
[[menu.main]]
  name = "Telegram"
  url = "https://t.me/example"
  [menu.main.params]
    icon = "telegram"
```

## Templates

| Extension point | Use |
| --- | --- |
| `layouts/_partials/custom_head.html` | Add tags to `<head>` after the theme stylesheet. |
| `layouts/_partials/custom_body.html` | Add markup/scripts before `</body>`. |
| `bodyClass` block | Select page layout classes; built-in home/list/single/404 use `reading-layout`. |
| `baseof.html` blocks | Replace `head`, `favicon`, `header`, `main`, `footer`, `search` or `scripts`. |
| Matching site template path | Override the whole template only when it must diverge. |

`reading-layout` selects the [blog reading scale](typography-reference.md#reading-layout).
Independent templates can omit it. The 404 page uses `beauty-reading`, while its
optional ASCII illustration keeps its own monospace scale.

A standalone layout can replace the `search` block to omit the dialog. Use
`search = false` in front matter separately to exclude the page from the index,
and `backToTop = false` to omit the reading control.

### Custom header

The default header splits a multiword site title at its first space and hides the first word at widths up to 768 px. To keep a brand name such as “Mini Blog” visible in full, add `.title-first-name { display: inline; }` to your [site stylesheet](#colors).

Use `<a class="brand-link" href="…"><strong>Project name</strong></a>` for a bold
brand link without an underline. Keyboard focus remains visible.

For the shared mobile menu, render `{{ partial "menu-toggle.html" . }}` next to
`<nav class="main-nav" id="main-navigation">…</nav>`. Your template owns brand
placement and desktop arrangement; Mini supplies the overlay behavior.

| Header element | Default |
| --- | --- |
| Text | `--header-text-size`: 16 px |
| Mobile identity | `--header-title-size-small`: 20 px |
| Mobile links | `--header-nav-size-small`: 20 px |
| Menu toggle | 44×44 px target around a 24 px icon |

The menu handles Escape, link selection, focus leaving navigation and the desktop
breakpoint. It stays hidden during initialization, preserves scroll position and
animates opening/closing. Without JavaScript, links remain visible.

### Custom favicon block

Use `<link rel="icon" href="data:,">` inside the `favicon` block to suppress icons
on an independent page. An empty block falls back to the base template; the explicit
empty icon also avoids an implicit `/favicon.ico` request.

### Footer links on custom pages

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

| Dictionary option | Default |
| --- | --- |
| `rss = true` | Include the current language's feed when requested. |
| `labels` omitted | Platform names |
| `copyright` omitted | Standard year range |

The default footer passes `params.social` and enables RSS. Reusing the partial keeps
icons, language switching and color-scheme control.

The outer `--footer-gap` margin (112 px desktop, 88 px mobile) collapses with preceding
block margins; a final quotation uses `--footer-quotation-gap` (176/128 px). Social icons use
`--footer-icon-size` (17 px), or `--footer-icon-size-small` (22 px) on mobile.
Links are muted at rest and use brand colors on hover/focus; GitHub and X use a
light active color in dark mode.

## Share cards

Mini generates a 1200×630 card per page. To override selected pages, create
`layouts/_partials/custom_og_image.html`; it receives the page and must return
an image resource or `false` for the default:

```go-html-template
{{- $image := false -}}
{{- with .Params.shareImage -}}
  {{- $image = resources.Get . -}}
{{- end -}}
{{- return $image -}}
```

Here, `shareImage = "images/event-card.png"` resolves to `assets/images/event-card.png`.
The hook can also use Hugo image filters. Open Graph, Twitter Cards and JSON-LD
share the result's URL/dimensions; the page title supplies alternative text.

## Loading values

Use `loading-skeleton` only when an inline value is unknown:

1. Wrap visible placeholder content in a child element to reserve its space.
2. Add the class and `aria-busy="true"` during the request.
3. Remove both on success **or failure**.

Keep known values visible during refresh and without JavaScript. The theme-aware
placeholder pulses gently; reduced-motion preferences disable animation.

## Assets

Hugo Pipes bundles and fingerprints CSS/JavaScript. Fonts are self-hosted;
[Mermaid](media.md#choose-how-to-load-mermaid) is the optional CDN exception.

Removed tokens `--link-color`, `--blockquote-color` and `--color-blockquote-border`
had no consumers. Use `--color-primary` for links and `--beauty-quote-text` /
`--beauty-quote-border` for quotations. Header/menu selectors target `body > header`
and `.main-nav`, leaving article headers and navigation in their content styles.
