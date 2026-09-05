# Configuration

Hugo Mini requires Hugo Extended 0.146 or newer. The [example configuration](https://github.com/zavarovkv/hugo-mini/blob/main/exampleSite/hugo.toml) is the complete reference.

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
| `favicon`, `favicon192`, `appleTouchIcon` | Browser and device icons under `static/` | unset |
| `authorName`, `authorURL` | Author metadata and links | site title / home |
| `avatar`, `avatarHover` | Header avatar and hover frame | unset |
| `copyrightYear` | Starting year of the footer range | current year |
| `newPostDays` | Age window for the New badge | `30` |
| `recentSidebarCount` | Recent articles beside or below a post; `0` disables | `8` |
| `localizeLinks` | Resolve internal Markdown page links to an available translation in the current language | `true` |
| `mainSections` | Sections treated as posts | Hugo default |
| `socialSharing` | Likely sharing buttons on posts | `true` |
| `telegramChannel` | Telegram comments and reaction source | unset |
| `mermaidSrc` | Custom Mermaid script, including a local copy | pinned CDN URL |
| `aiTranslatedLang` | Language marked as AI translated | unset |
| `consoleArt`, `consoleYoda` | Optional home-page console art | unset |

Social links live under `[params.social]`: `telegram`, `linkedin`, `github`, and `email`. Schema.org author data lives under `[params.author]`, for example `jobTitle`.

Analytics is opt-in. Set any combination of `yandexMetrikaId`, `googleAnalyticsId`, `plausibleDomain` / `plausibleSrc`, or `umamiWebsiteId` / `umamiSrc`.

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

Interface translations are TOML files under `i18n/`. Copy an existing file, translate its values, and keep the keys unchanged. Content translations should share Hugo's translation key or filename so the footer switcher can link matching pages.
