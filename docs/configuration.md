# Configuration

Hugo Mini requires Hugo Extended 0.146 or newer. The [example configuration](../exampleSite/hugo.toml) is the complete reference.

## Installation

Add the theme as a Git submodule:

```bash
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Then set `theme = "hugo-mini"` in `hugo.toml`. Alternatively, use a Hugo Module:

```toml
[module]
  [[module.imports]]
    path = "github.com/zavarovkv/hugo-mini/v3"
```

The `/v3` suffix is required by Go Modules for every 3.x release. It is not used when installing the theme as a Git submodule.

## Parameters

All parameters are optional unless your site content depends on them.

| Parameter | Purpose | Default |
| --- | --- | --- |
| `favicon` | Browser icon: SVG or 32×32 PNG under `static/` | unset |
| `favicon192`, `appleTouchIcon` | PNG device icons under `static/` | unset |
| `authorName`, `authorURL` | Author metadata and links | site title / home |
| `logo`, `logoDark` | Header logo; optional dark-mode image | unset |
| `avatar`, `avatarHover` | Header avatar and hover frame (when `logo` is unset) | unset |
| `copyrightYear` | Starting year of the footer range | current year |
| `newPostDays` | Age window for the New badge | `30` |
| `recentSidebarCount` | Recent articles beside or below a post; `0` disables | `8` |
| `showSearchButton` | Show a search shortcut in navigation (currently opens the homepage); `false` hides it | `true` |
| `backToTop` | Left-gutter back-to-top control; `false` disables the control and its event handlers | `true` |
| `localizeLinks` | Resolve internal Markdown page links to an available translation in the current language | `true` |
| `preferenceCookieDomain` | Share explicit theme/language preferences with subdomains of this parent host | unset |
| `rememberLanguage` | Remember footer language choices and apply them to homepages and pages marked `languagePreferenceEntry = true` | `false` |
| `typography` | Apply language-aware prose spacing and Russian punctuation rules at build time; page front matter can override | `true` |
| `mainSections` | Sections treated as posts | Hugo default |
| `socialSharing` | Likely sharing buttons on posts | `true` |
| `telegramChannel` | Telegram comments and reaction source | unset |
| `mermaidSrc` | Custom Mermaid script, including a local copy | pinned CDN URL |
| `mermaidModuleSrc` | Optional Mermaid ESM entry; takes precedence over `mermaidSrc` | unset |
| `aiTranslatedLang` | Language marked as AI translated | unset |
| `consoleArt`, `consoleYoda` | Optional home-page console art | unset |
| `notFoundYoda` | Show the built-in ASCII Yoda and a localized message on the 404 page | `false` |

Social links live under `[params.social]`: `telegram`, `linkedin`, `github`, and `email`. Schema.org author data lives under `[params.author]`, for example `jobTitle`.

Set `aiTranslatedLang = "en"` when the original articles are in Russian and their English versions are AI-translated. The sparkle appears next to the English option, not the Russian one; the two-language switcher shows only the other language.

Set `backToTop = false` in a page's front matter to disable the control on that page, or under site `[params]` to disable it throughout the site. A page value overrides the site setting.

Set `typography = false` to disable the theme's additional typography pass,
either for a page or site-wide. This does not change Goldmark's native smart
punctuation. See [typography](typography.md) ([на русском](typography.ru.md))
for rules, exclusions and fragment opt-out.

Analytics is opt-in. Set any combination of `yandexMetrikaId`, `googleAnalyticsId`, `plausibleDomain` / `plausibleSrc`, or `umamiWebsiteId` / `umamiSrc`.

For self-hosted modular Mermaid, copy `mermaid.esm.min.mjs` and its `chunks/mermaid.esm.min/` directory from the same pinned npm package to `static/js/mermaid/`, then set `mermaidModuleSrc = "js/mermaid/mermaid.esm.min.mjs"`. Keep their relative paths intact. The classic `mermaidSrc` option and the pinned CDN fallback remain supported. Both modes render diagrams near the viewport and preserve the source if loading fails.

For local entries found under `static/`, the theme appends a content hash to the URL. An upgrade
therefore bypasses the old browser cache while keeping relative chunk imports intact. This applies
to both `mermaidModuleSrc` and `mermaidSrc`; external URLs and entries not present at build time
are left unchanged.

The loader supports Mermaid 11 and 12 with explicit `layout: 'dagre'`, `look: 'classic'`,
`flowchart.wrappingWidth: 200` and `flowchart.minNodeWidth: 0`. These retain the previous flowchart
geometry and avoid loading ELK solely because of Mermaid 12's changed defaults. Colors still follow
the site's light/dark setting. Individual diagrams can override these defaults through Mermaid's
own configuration. A self-hosted Mermaid 12 package requires Node.js 22.12+ to install and
ES2024-capable browsers (Safari 17.4+); the theme's pinned Mermaid 11 fallback is unchanged.

## Shared theme and language preferences

By default, an explicit light/dark choice is saved in the current origin's local
storage, and language links navigate normally. To share choices between a site
and its subdomains, opt in on **each** site:

```toml
[params]
  preferenceCookieDomain = "example.com"
  rememberLanguage = true
```

Shared `hugo-mini-theme` and `hugo-mini-language` cookies take precedence over
older local storage. An existing explicit choice migrates when no shared choice
exists; automatic system colors are never saved as a fixed theme. Cookies use
the configured parent domain, a one-year lifetime, `SameSite=Lax`, and `Secure`
on HTTPS. Local storage remains the fallback when cookies are unavailable or
the page is on another host, such as a local preview.

With `rememberLanguage`, the footer saves explicit language selections.
Homepages apply the selection using their published, same-origin `hreflang`
links. Set `languagePreferenceEntry = true` in a landing page's front matter or
cascade to give it the same behavior. Direct article URLs retain their
language; simply opening a translated URL does not save a preference. Query
strings and fragments survive an automatic entry-page redirect. Theme and
entry-page language preferences refresh when returning to an open tab or
restoring a page from browser history. Without JavaScript, language links
still work as ordinary links.

## Multilingual sites

Define languages and their menus in `hugo.toml`:

```toml
defaultContentLanguage = "en"
defaultContentLanguageInSubdir = false

[languages.en]
  locale = "en-US"
  label = "English"
  weight = 1
  title = "Jane Doe"

  [languages.en.params]
    authorName = "Jane Doe"
    description = "Notes about products and teams"

  [[languages.en.menu.main]]
    name = "Articles"
    url = "/blog/"
    weight = 1

[languages.ru]
  locale = "ru-RU"
  label = "Русский"
  weight = 2
  title = "Джейн Доу"
```

Use `languageCode` and `languageName` instead of `locale` and `label` when the site itself must stay compatible with Hugo versions before those fields were introduced. The theme supports both forms across its documented Hugo range.

Interface translations are TOML files under `i18n/`. Copy an existing file, translate its values, and keep the keys unchanged. The footer shows a compact switcher for two configured languages, or a keyboard-accessible native menu for three or more. A choice leads to the translated page when available, and to that language's homepage otherwise. Language names follow `label` (or `languageName` on older Hugo versions); the control is not limited to Russian and English.

In JSON Feed, each post's `content_text` contains the complete plain text rather than a truncated excerpt. Descriptions and summaries are plain text, and optional metadata such as an author URL is omitted when not configured.
