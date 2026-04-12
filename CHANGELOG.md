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
- **Telegram reactions block** — surfaces view counts and emoji reactions from the post's linked Telegram channel post into the post meta row next to the date. This is the full feature shipped as one unit:
  - `scripts/fetch-telegram-reactions.mjs` — zero-dependency Node 18+ script that reads Hugo config (`hugo config --format json`), finds `params.telegramChannel` and the default language's content directory, scrapes the public Telegram embed (`https://t.me/<channel>/<id>?embed=1`) for every post with `telegram_post = NNN` in front matter, parses reaction/view counts from the HTML, and writes `data/telegram_reactions.json` at the site root. Handles paid star reactions (`⭐`) and standard emoji reactions; skips premium custom emoji that have no text fallback. Universal — reads config automatically, supports `--channel` / `--content-dir` / `--output` CLI overrides and `TELEGRAM_CHANNEL` env var. Sites using the theme invoke it from their own `package.json`: `"fetch-telegram-reactions": "node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs"`.
  - `layouts/partials/telegram-views.html` — renders an inline `<span class="tg-views">` with a filled eye glyph (Birman-style, two-path + pupil, `fill="currentColor"`) and the view count. Designed to sit next to the post date.
  - `layouts/partials/telegram-reactions.html` — renders an inline `<div class="tg-reactions">` with one `<span class="tg-reaction">` per emoji + count. Right-aligned via the parent flex container.
  - `single.html` wraps the post meta row as a flexbox: `[views + date]` on the left, `[reactions]` on the right, stacking vertically on mobile (`max-width: 768px`).
  - Both partials read from `site.Data.telegram_reactions[<id>]` and render nothing if the data file or entry is missing — safe to build locally without ever running the fetch script.
- **Nav menu icon support** — set `params.icon = "telegram"` on a menu item to show an inline SVG paper plane. Desktop: icon before label with elastic hover animation (`cubic-bezier(0.34, 1.56, 0.64, 1)` + drop-shadow trail). Mobile: icon after label, larger size (20px). Extend the `$paths` dict in `nav.html` to add more icons.
- `archetypes/blog.md` for content scaffolding (`hugo new blog/my-post.md`)
- Hugo Modules support (`go.mod`)
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- exampleSite: mermaid and shortcodes demo posts

### Changed
- Homepage OG image subtitle now uses `params.description` instead of hardcoded author-specific text
- Content links use Inter Medium 500 instead of Semi-Bold 600 — softer weight contrast against the 300 body text
- **Theme CSS/JS now bundled, minified, and fingerprinted via Hugo Pipes** instead of inlined per page. Source moved from `partials/style.html`/`fonts.html`/`custom_head.html` (CSS) and `partials/custom_body.html` (JS) to `assets/css/main.css` and `assets/js/main.js`. `baseof.html` runs them through `resources.ExecuteAsTemplate | resources.Minify | resources.Fingerprint "sha256"`, emitting one `<link>` and one `<script defer>` with content-hashed URLs (`/css/main.min.<sha>.css`, `/js/main.<lang>.min.<sha>.js`). Cuts ~33 KB off every HTML page (≈ 68% smaller home, 35% smaller posts), and the assets are cached by the browser across page navigations. JS bundle is per-language because i18n strings are baked in at build time. **BREAKING for theme users:** `custom_head.html` and `custom_body.html` partials no longer "replace all theme CSS/JS" — they now append after the bundled theme assets, so anything in them wins the cascade rather than completely overriding.
- Refactor pass for code quality — no behavioural changes:
  - `posts-column.html`: pinned and unpinned posts now share a single `<li>` template via `$pinned | append $unpinned`, eliminating duplication
  - `_markup/render-heading.html`: collapsed if/else into a single `<h{N}>` template with conditional `<a>` insertion
  - `footer.html`: brand social icons rendered from a data-driven `$brands` slice instead of eight near-identical `{{ with }}` blocks
  - `custom_body.html`: copy-button and heading-anchor JS now track per-element timers (no race on rapid double-click) and `.catch()` clipboard rejections; early-exit added when `navigator.clipboard` is unavailable
- Hardcoded grey colors (`#9da2a6`, `#556677`) replaced with CSS custom properties `--color-muted` and `--color-secondary`
- `prefers-reduced-motion` durations changed from `0.01ms` to `0s` for cleaner reduced-motion behavior
- `heading-anchor:focus` no longer removes `outline` — browser default focus indicator preserved for keyboard a11y
- `structured_data.html` JSON conditionals rewritten from `{{ if }}` to `{{ with }}` for robustness — eliminates whitespace-sensitive comma placement

### Removed
- Telegram CTA block (`tg-cta`) — removed from `single.html` and all associated CSS (~70 lines)
- Dead CSS: `.blog-tags`, `.tag-filter`/`.tags-list` (~50 lines of unused styles)
- Dead i18n keys: `tg_cta_title`, `tg_cta_description`, `subscribe`
- Deprecated `word-wrap: break-word` (redundant with `overflow-wrap: break-word`)

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
