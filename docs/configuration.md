# Configuration

[Documentation](README.md) · [Example configuration](../exampleSite/hugo.toml) · [Defaults](../hugo.toml)

Requires **Hugo Extended 0.146.0+**. A Hugo-only site can build without Node.js. The [search-enabled starter](search.md) also needs Node.js 22.12+.
Merge snippets into existing TOML tables rather than declaring a table twice.

[Install](#installation) · [Update](#updating) · [Parameters](#parameters) · [Languages](#multilingual-sites) · [Feeds](#feeds-and-crawlers)

## Installation

For a new blog, follow the [quick start](../README.md#quick-start).
For an existing Hugo site, choose **one** installation method.

### Git submodule

From the root of your Git repository:

```bash
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Set `theme = "hugo-mini"` in `hugo.toml`. On a fresh clone, restore the theme with
`git submodule update --init --recursive`.

### Hugo Module

Install [Go](https://go.dev/doc/install) and Git as well as Hugo. From your site root,
initialize a module if you do not already have `go.mod` (replace the example path):

```bash
hugo mod init github.com/yourname/yourblog
```

Remove `theme = "hugo-mini"` if switching from a submodule, then add:

```toml
[module]
  [[module.imports]]
    path = "github.com/zavarovkv/hugo-mini/v3"
```

Run `hugo mod get github.com/zavarovkv/hugo-mini/v3` and preview with `hugo server`. For search, select a [revision with Pagefind support](search.md#enable-on-an-existing-site) and add its index step. The `/v3` suffix is required
for 3.x Go Modules; Git submodule URLs do not use it.

## Updating

1. Review the [changelog](../CHANGELOG.md) and commit any local theme changes.
2. From your site root, run the command for your installation:

   **Git submodule** — latest commit on the tracked branch:

   ```bash
   git submodule update --remote --merge themes/hugo-mini
   ```

   **Hugo Module** — current major version:

   ```bash
   hugo mod get -u github.com/zavarovkv/hugo-mini/v3
   hugo mod tidy
   ```

3. Preview and build using the site’s usual commands. With the search helper, run `npm run dev` and `npm run build`. For a Hugo-only site, use `hugo server` and `hugo --minify`.
4. Commit the submodule pointer or `go.mod` / `go.sum` in your site repository.

The one-click Vercel starter pins an exact theme commit. Follow its [update instructions](../starter/README.md#updates).

## Parameters

Set these under `[params]`. All are optional unless your content depends on them.
Detailed behavior is linked from each group.

### Identity and appearance

| Parameter | Purpose | Default |
| --- | --- | --- |
| `authorName`, `authorURL` | Author name and profile URL | Title / no explicit profile |
| `logo`, `logoDark` | Header logo and dark variant | Unset |
| `avatar`, `avatarHover` | Avatar and alternate frame when `logo` is absent | Unset |
| `favicon` | SVG or 32×32 PNG in `static/`; `false` disables icons | Bundled asterisk |
| `favicon192`, `appleTouchIcon` | Android 192×192 / iOS 180×180 PNGs | Bundled icons unless `favicon` is set |
| `copyrightYear` | First year in the footer range | Current year |
| `consoleArt`, `consoleYoda` | Custom or built-in homepage console art | Unset |
| `notFoundYoda` | ASCII Yoda on the 404 page | `false` |

Social links use `[params.social]`: `telegram`, `linkedin`, `github`, `email`.
Schema.org author details use `[params.author]`, for example `jobTitle`.
See [logos, menus and colors](customization.md).

### Content and reading

| Parameter | Purpose | Default |
| --- | --- | --- |
| `mainSections` | Sections treated as posts | Hugo default |
| `featuredPosts` | Ordered content paths for [featured articles](homepage.md#featured-articles) | Unset |
| `newPostDays` | New-badge age window in days; `0` disables it | `30` |
| `typography` | Build-time prose formatting | `true` |
| `editorialQuotes` | Editorial figures for Markdown quotations and `callout` | `false` |
| `hangingQuotes` | Hang eligible opening quotation marks | `false` |
| `proseNumerals` | Old-style figures in eligible prose | `false` |
| `sideNotes` | Desktop margin notes with endnote fallbacks | `false` |
| `articleLinksNewTab` | Open post-body destinations in new tabs | `false` |
| `articleH2UseTitleFont` | Use the H1 face for article H2 | `false` |
| `headingScroll` | Click-to-align H1/H2 and Option/Alt + Up/Down | `false` |
| `backToTop` | Left-gutter control on wide screens | `true` |
| `search` | Enable [Pagefind search](search.md); requires an index step after Hugo | `false` |
| `showSearchButton` | Show search triggers when search is enabled | `true` |

Reading options from `typography` through `backToTop` also accept page front-matter
overrides. `dropCap` and `wideCode` are per-page options, described in
[content](content.md#front-matter). See [Typography](typography.md)
([на русском](typography.ru.md)) for scope and exclusions.

### Languages and integrations

| Parameter | Purpose | Default |
| --- | --- | --- |
| `localizeLinks` | Resolve internal Markdown links to available translations | `true` |
| `rememberLanguage` | Remember explicit choices on entry pages | `false` |
| `preferenceCookieDomain` | Share preferences with subdomains | Unset |
| `aiTranslatedLang` | Mark this language as AI-translated | Unset |
| `socialSharing` | Likely buttons on posts | `true` |
| `telegramChannel` | [Telegram](telegram.md) channel slug | Unset |
| `mermaidSrc` | [Mermaid](media.md#choose-how-to-load-mermaid) classic script | Pinned CDN URL |
| `mermaidModuleSrc` | Mermaid ESM entry; overrides `mermaidSrc` | Unset |

Analytics loads only when configured. Choose any combination:

| Provider | Parameters |
| --- | --- |
| Yandex | `yandexMetrikaId` |
| Google | `googleAnalyticsId` |
| Plausible | `plausibleDomain`, optional `plausibleSrc` |
| Umami | `umamiWebsiteId`, optional `umamiSrc` |

## Shared theme and language preferences

By default, explicit light/dark choices stay in the current origin's local storage.
Language links navigate normally. To share preferences across a parent domain and
its subdomains, opt in on **each** site:

```toml
[params]
  preferenceCookieDomain = "example.com"
  rememberLanguage = true
```

With `rememberLanguage`, a choice made in the footer applies to homepages and pages marked `languagePreferenceEntry = true`. Direct article links open in their own language. Automatic redirects follow the published same-origin translation and preserve the query and fragment. Without JavaScript, readers can still follow the footer links.

The optional parent-domain cookies (`hugo-mini-theme` and `hugo-mini-language`) last one year, use `SameSite=Lax` and are secure on HTTPS. A shared choice takes precedence. If none exists, Mini migrates an explicit local choice. If cookies are unavailable, local storage still works. System colors remain automatic until the reader chooses a theme.

## Multilingual sites

Define languages and menus in `hugo.toml`:

```toml
defaultContentLanguage = "en"
defaultContentLanguageInSubdir = false

[languages.en]
  languageCode = "en-US"
  languageName = "English"
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
  languageCode = "ru-RU"
  languageName = "Русский"
  weight = 2
  title = "Джейн Доу"
```

For a version-independent content setup, pair files such as
`content/blog/hello.en.md` and `content/blog/hello.ru.md`. See Hugo's
[multilingual content guide](https://gohugo.io/content-management/multilingual/)
for directory-based alternatives. Set up each language's menu if the labels or destinations differ.

Ordinary internal Markdown links follow the current language when a translation exists. Use the footer switcher for an explicit change of language. In particular, a Markdown link to `/` on a translated homepage can resolve back to that homepage.

The example above works with the theme's minimum Hugo version. On newer Hugo,
`locale` and `label` can replace `languageCode` and `languageName`; Mini supports both.

To add UI translations, copy an `i18n/` TOML file and translate values while keeping
keys. The footer uses a compact switcher for two languages and an accessible menu
for three or more. Missing page translations link to that language's homepage.

`aiTranslatedLang = "en"` places the sparkle beside English. It is a label only;
Mini does not translate content. The two-language switcher shows only the other language.

## Feeds and crawlers

Hugo provides HTML, RSS and a sitemap. To also emit JSON Feed and `llms.txt`, add:

```toml
[mediaTypes."text/plain"]
  suffixes = ["txt"]

[outputFormats.LLMS]
  mediaType = "text/plain"
  baseName = "llms"
  isPlainText = true
  notAlternative = true

[outputs]
  home = ["HTML", "RSS", "JSON", "LLMS"]
```

After `hugo --minify`, check `public/index.json` and `public/llms.txt`, plus their
language-prefixed equivalents. Optional `params.llms.about` supplies a short bio;
menus, social links and visible posts supply the other sections.

JSON Feed includes complete plain-text posts in `content_text`, not truncated
excerpts. Descriptions and summaries are plain text; an unset author URL is omitted.
See [visibility and canonical URLs](content.md#front-matter) and
[robots.txt](deployment.md#sitemap-and-robotstxt) for crawler controls.

## Syntax highlighting

Enable the theme's light, dark and print palettes in your site config:

```toml
[markup.highlight]
  noClasses = false
```

Keep language-specific markup settings consistent. `lineNos`, `lineNumbersInTable`
and highlighted lines remain supported. Setting `noClasses = true` globally or on a fence uses
Hugo's inline palette instead; that configuration owns its contrast and color behavior.

## Site fonts

Use `[params.fonts]` for a site-owned family, `[params.fonts.title]` for titles and
`[params.fonts.quote]` for quotations. See [Fonts](fonts.md) for assets, weights,
preloading and `useDefaultFonts`. The default remains bundled Inter.
