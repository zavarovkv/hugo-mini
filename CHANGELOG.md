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
- Heading anchor links — markdown `##` and `###` headings now get a clickable `#` next to them. Click copies the absolute section URL to clipboard with brief feedback. Sized down to ~body text (`0.65em`) so it reads as a delicate marker, not a competing element; uses the same neutral grey (`#9da2a6`) as the social/theme/lang toggle icons in their rest state, then fades to `var(--heading-color)` on direct hover and copied state. Visible on heading hover (desktop) and faintly visible on touch devices via `@media (hover: none)`. Implemented via `_markup/render-heading.html` render hook + minimal JS (no extra dependencies).
- Pinned posts — `pinned = true` in a post's front matter floats it to the top of its category group on the blog listing. Multiple pinned posts within a category preserve reverse-chronological order between themselves; unpinned posts follow in reverse-chronological order. No visual marker — order is the only signal.
- Inter 500 (Medium) `@font-face` declared in `fonts.html`. Used by content links so they sit between body 300 and bold 600 in weight (previously 600 was the only available link weight). 300/600 stay preloaded; 500 loads on demand.
- `params.consoleYoda = true` — boolean shortcut that prints the bundled Yoda ASCII art (`assets/console-yoda.txt`) in the browser console on the home page, without having to paste 30 lines into your config. The existing `params.consoleArt` (custom art) still works and takes priority when both are set.
- `params.popularPosts` — curated site-wide "popular posts" block rendered at the bottom of single posts, below Telegram comments. Slugs are resolved per current language via `site.GetPage`, so RU posts see RU popular, EN posts see EN popular, with missing slugs silently skipped. Visual style borrowed from Ilya Birman's Эгея engine and adapted to match the theme's articles listing: the heading uses the same `.posts-group-title` styling as category group titles, the list reuses `.blog-posts`, a CSS `column-count: 2` splits items into two visual columns on desktop (one on mobile), and publication dates hide in the `title` attribute as a hover tooltip. No border decoration, no algorithmic matching — the list is whatever you curate in config, shown identically on every post.
- `archetypes/blog.md` for content scaffolding (`hugo new blog/my-post.md`)
- Hugo Modules support (`go.mod`)
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- exampleSite: mermaid and shortcodes demo posts

### Changed
- Homepage OG image subtitle now uses `params.description` instead of hardcoded author-specific text
- Telegram CTA block is now only rendered when `params.telegramChannel` is set
- i18n: `tg_cta_title` / `tg_cta_description` default values are now generic
- Content links use Inter Medium 500 instead of Semi-Bold 600 — softer weight contrast against the 300 body text
- **Theme CSS/JS now bundled, minified, and fingerprinted via Hugo Pipes** instead of inlined per page. Source moved from `partials/style.html`/`fonts.html`/`custom_head.html` (CSS) and `partials/custom_body.html` (JS) to `assets/css/main.css` and `assets/js/main.js`. `baseof.html` runs them through `resources.ExecuteAsTemplate | resources.Minify | resources.Fingerprint "sha256"`, emitting one `<link>` and one `<script defer>` with content-hashed URLs (`/css/main.min.<sha>.css`, `/js/main.<lang>.min.<sha>.js`). Cuts ~33 KB off every HTML page (≈ 68% smaller home, 35% smaller posts), and the assets are cached by the browser across page navigations. JS bundle is per-language because i18n strings are baked in at build time. **BREAKING for theme users:** `custom_head.html` and `custom_body.html` partials no longer "replace all theme CSS/JS" — they now append after the bundled theme assets, so anything in them wins the cascade rather than completely overriding.
- Refactor pass for code quality — no behavioural changes:
  - `posts-column.html`: pinned and unpinned posts now share a single `<li>` template via `$pinned | append $unpinned`, eliminating duplication
  - `_markup/render-heading.html`: collapsed if/else into a single `<h{N}>` template with conditional `<a>` insertion
  - `footer.html`: brand social icons rendered from a data-driven `$brands` slice instead of eight near-identical `{{ with }}` blocks
  - `custom_body.html`: copy-button and heading-anchor JS now track per-element timers (no race on rapid double-click) and `.catch()` clipboard rejections; early-exit added when `navigator.clipboard` is unavailable

### Fixed
- `cat_getting-started` key missing from `i18n/ru.toml`
- `theme-toggle` height inconsistency with `lang-toggle` (added `box-sizing: border-box`)
- `consoleArt` was double-escaped — Hugo applies JS context auto-escape inside `<script>` blocks on top of `jsonify`, so the rendered `console.log` printed the literal JSON string (with `\n` and `\"` as visible characters) instead of the formatted ASCII. Added `safeJS` after `jsonify` to mark the output as already-safe-for-JS.
- Nav menu (and any other element outside `<main>` without an explicit `font-weight`) was rendering at Inter Medium 500 instead of Light 300 after the new 500 `@font-face` was added. Reason: such elements inherit the browser default 400, and CSS font matching for 400 prefers the next-higher available face when no exact match exists — so 500 silently won. Fixed by setting `font-weight: 300` explicitly on `body`, removing the dependency on the browser's font-matching algorithm.

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
