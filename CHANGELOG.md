# Changelog

All notable changes to the Mini Hugo theme are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- CSS custom properties (`--color-primary`, `--color-accent`, `--color-primary-border`, `--color-accent-border`) for easy color customization
- `copyrightYear` param — footer start year shown as "© YEAR–NOW"
- `telegramCTATitle` and `telegramCTADescription` params to customize Telegram CTA text without editing i18n files
- `socialSharing` param — set to `false` to disable Likely social sharing buttons
- Footer social icons: `params.social.x`, `params.social.youtube`, `params.social.facebook`, `params.social.instagram` — each rendered with brand-colored hover state in light and dark themes
- Plausible Analytics support: `params.plausibleDomain` (+ optional `params.plausibleSrc` for self-hosted) — privacy-friendly, cookieless
- Umami Analytics support: `params.umamiWebsiteId` (+ optional `params.umamiSrc` for self-hosted) — privacy-friendly, cookieless
- Heading anchor links — markdown `##` and `###` headings now get a clickable `#` next to them. Click copies the absolute section URL to clipboard with brief feedback. Visible on heading hover (desktop) and always at low opacity on touch devices. Implemented via `_markup/render-heading.html` render hook + minimal JS (no extra dependencies).
- `archetypes/blog.md` for content scaffolding (`hugo new blog/my-post.md`)
- Hugo Modules support (`go.mod`)
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- exampleSite: mermaid and shortcodes demo posts

### Changed
- Homepage OG image subtitle now uses `params.description` instead of hardcoded author-specific text
- Telegram CTA block is now only rendered when `params.telegramChannel` is set
- i18n: `tg_cta_title` / `tg_cta_description` default values are now generic

### Fixed
- `cat_getting-started` key missing from `i18n/ru.toml`
- `theme-toggle` height inconsistency with `lang-toggle` (added `box-sizing: border-box`)

## [0.1.0] — 2026-04-01

### Added
- Initial public release
- Dark/light mode with system preference detection and localStorage persistence
- Multilingual support (ru, en) with language toggle in footer
- Dynamic OG image generation (1200×630) per page at build time
- Telegram channel CTA and Discussion comments (lazy-loaded, theme-synced)
- KaTeX math formulas (per-page opt-in: `math = true`)
- Mermaid diagrams (per-page opt-in: `mermaid = true`)
- Likely social sharing buttons (Telegram, Twitter, Facebook, VK, LinkedIn)
- SEO: JSON-LD structured data, hreflang, Open Graph, Twitter Cards
- JSON Feed, RSS, llms.txt for AI crawlers
- Responsive layout with mobile overlay menu
- Inter font self-hosted (7 weights, WOFF2)
- Yandex.Metrika analytics (optional, `params.yandexMetrikaId`)
- Console art feature (`params.consoleArt`)
