# Changelog

All notable changes to the Mini Hugo theme are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/); this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- Updated the pinned Mermaid fallback from 11.14.0 to 11.16.1 and refreshed its SRI hash.
- Likely share counters are disabled, preventing automatic requests to third-party social APIs when an article loads. Sharing links still work on click.

### Changed
- Corrected the Go module path to `github.com/zavarovkv/hugo-mini/v3`, as required for v3 releases and Hugo theme-catalog builds. Hugo Module users must add the `/v3` suffix; Git submodule installations are unchanged.
- Reworded the theme catalog description around concrete, verifiable capabilities.
- Reworked the README into a concise product overview and quick start; detailed configuration, content, customization, Telegram, and deployment guidance now lives in focused documents under `docs/`.
- Language examples and templates use `label`, `.Language.Locale`, and `hugo.Sites` on current Hugo releases, with version-gated fallbacks that preserve the documented Hugo 0.146 minimum.
- Mobile-menu state is exposed through `aria-expanded`, Escape closes the menu and returns focus to its toggle, and the toggle is connected to the navigation with `aria-controls`.
- Menu, heading-anchor, and Telegram-reaction accessibility labels are localized.
- Theme-toggle and code-copy buttons keep their accessible labels synchronized with their current action.
- Caption, Mermaid visibility, and analytics fallback styles moved from inline attributes into the bundled stylesheet.
- Post-only Likely assets now follow `site.Params.mainSections`, matching `single.html` on sites whose post section is not named `blog`.

## [3.0.0] — 2026-08-14

A code review pass: five bugs that could lose or corrupt data, plus the removal
of the last places where the theme assumed a specific site layout.

### Upgrading from 2.x

1. **Extra favicon sizes are now opt-in.** The 192×192 and apple-touch icons were emitted with hardcoded filenames; if you relied on that, add `favicon192` and `appleTouchIcon` to `[params]`. Sites that never had those files were serving two 404s per page and need nothing.
2. **`og:locale` needs a territory.** Set `languageCode = "en-US"` (not `"en"`) per language, or `params.ogLocale = "en_US"`. Without a territory the tag is omitted rather than guessed — previously every non-English language was labelled `ru_RU`.
3. **Check `mainSections` if you have several large sections.** Post lists now follow Hugo's `site.Params.mainSections` instead of a hardcoded `blog`. Hugo defaults it to the top-level section with the most pages, which is what you want on a single-section blog; set it explicitly (`mainSections = ["blog"]`) if another section is larger.

Nothing else changes: front matter, shortcodes, hooks, blocks and i18n keys are untouched.

### Fixed
- `fetch-telegram-reactions.mjs` no longer drops reaction counts on a partial failure. Results were rebuilt from scratch, so if some posts hit 429 and others succeeded, the file was rewritten with only the successful ones and the rest silently lost their counters. Values from the previous run are now carried over for posts that fail — scoped to posts that still exist, so deleted ones do not accumulate forever.
- Same script: a channel that does not exist (or was renamed) made Telegram answer `200` with a widget-less page, which parsed to `{views: null, reactions: []}` and counted as **success** — quietly overwriting every post with empty values. An empty parse is now a failure, so previous values survive and a wholesale outage still leaves the file untouched.
- `og-image.html` used `params.author` as a display-name fallback, but that key is a table (it holds `jobTitle`), so a site without `authorName` rendered `map[jobtitle:…]` into its OG images. This is the same defect fixed for `meta author` in 1.0.2, in the one place it was missed.
- `og:description` and `twitter:description` fell back to nothing while `meta description` fell back to `.Summary`, so any page without an explicit `description` published an empty OG description. All three now resolve from one value.
- `translate.mjs` validates that the model preserved `slug`, `date`, `categories` and the other pass-through front-matter keys. A translated `slug` would silently change the English page's URL; the prompt asked for it, but nothing verified it. The script also has a top-level `.catch` now, so a failure prints a message instead of an unhandled rejection.
- Heading anchors on mobile: `isMobile` was evaluated once at load, so rotating a tablet left the tap-to-reveal behaviour stuck in the previous orientation. It now reads the media query per interaction.
- The recent-posts sidebar is re-measured after web fonts load. Its position derives from `h1`'s offset, which shifts when Inter replaces the fallback font, leaving the sidebar slightly misaligned.
- Removed Hugo's `_internal/schema.html`: it emits `itemprop` attributes that need an enclosing `itemscope`/`itemtype`, which this theme's markup never provided — inert microdata duplicating what JSON-LD already states.

### Changed — BREAKING
- Post lists (listing page, JSON Feed, `llms.txt`, recent-posts sidebar, JSON-LD, and the post-only parts of `single.html`) resolve the content section via `site.Params.mainSections` instead of a hardcoded `"blog"`. A site whose posts lived in `/posts` or `/writing` previously got an empty listing with no error. The new `main-pages.html` partial is the single source of truth for "what counts as a post", so those five consumers cannot disagree.
- `list.html` lists `.RegularPages` — the pages of the section being rendered — instead of always reaching for one specific section, so `/blog`, `/notes` and `/archive` each list their own content.
- Favicon sizes beyond 32×32 are opt-in params (`favicon192`, `appleTouchIcon`); unset params emit nothing.
- `og:locale` is derived from each language's `languageCode`/`params.ogLocale` and omitted when no territory is available, replacing a hardcoded en/ru pair.

### Changed
- `assets/js/main.js` is plain JavaScript again: localized strings arrive through `body[data-i18n]` instead of `{{ i18n }}` calls inside the file. The bundle is no longer run through `ExecuteAsTemplate`, which means it can be linted and formatted, no `{{` in JS syntax can break the build, and **one** bundle serves every language instead of one per language.
- Menu icons resolve as `assets/icons/<name>.svg` resources, so a site can add its own icon without editing the theme; previously the SVG paths were a dict inside `nav.html`. The markup also carries one icon element positioned with CSS `order`, rather than two copies of the same SVG with one hidden.
- `structured_data.html` builds JSON-LD with `dict` + `jsonify` instead of hand-written JSON with conditional commas — one missing comma away from invalid output that no build step would have caught. Breadcrumbs derive from `.CurrentSection` rather than a section-name comparison.
- `recent-posts.html` filters with `where`/`first` instead of walking every regular page on every post.
- Removed dead CSS (`.post-tags`, `.popular-posts*` — the partial went away in 1.0.0) and 10 redundant dark-theme rules that restated their light-theme values verbatim (7 social hover colours, 3 language-toggle colours). Inline `code` background is a token now. 244 → 222 rules; dark-mode overrides 57 → 46.
- `list.html` lost a loop that copied a slice element-by-element into an identical slice, and a second pass over all posts that `where` answers directly.
- `CONTRIBUTING.md` and README document the new params, the icon mechanism and the full token list.

## [2.0.0] — 2026-08-14

### Upgrading from 1.x

Two things to check, both mechanical:

1. **Hugo Extended ≥ 0.146.0 is now required.** Bump the version in your CI (a pin below the minimum fails on the first shortcode with `template for shortcode "…" not found`, not with a version error).
2. **Move any theme overrides from `layouts/partials/` to `layouts/_partials/`**, and if you override `extra_head.html`, rename it to `custom_head.html` — same insertion point, same behaviour. Overrides left in the old location are silently ignored.

Nothing else changes: config params, front matter, shortcodes and i18n keys are all unchanged, and `git mv` preserves history for the moved files.

### Changed — BREAKING
- **Minimum Hugo is now 0.146.0** (was 0.145.0). The layout was migrated to Hugo's current template system, introduced in 0.146.0: templates moved out of `layouts/_default/` to the root of `layouts/` (`baseof.html`, `home.html`, `list.html`, `single.html`, `sitemap.xml`), `layouts/index.html` → `layouts/home.html`, `layouts/_default/index.json` → `layouts/home.json`, and `partials/` / `shortcodes/` / `_default/_markup/` gained the underscore prefix (`_partials/`, `_shortcodes/`, `_markup/`). **Sites that override theme partials must move their overrides from `layouts/partials/` to `layouts/_partials/`.**
- **`extra_head.html` hook removed.** It duplicated `custom_head.html` with no distinct purpose. Sites using it should rename their override to `custom_head.html` — same insertion point, same behaviour.
- `theme.toml`: legacy `min_version` key dropped; `[module.hugoVersion]` in `hugo.toml` is the single source of truth, as the themes gallery documents.

### Added
- `baseof.html` now exposes named blocks for every region — `head`, `header`, `footer`, `scripts` alongside the existing `title` and `main` — so a template can replace one region without copying the whole file. Defaults render the theme's own partials, so existing templates are unaffected.
- `params.mermaidSrc` overrides where Mermaid is loaded from. Default remains the pinned, SRI-guarded jsDelivr URL; pointing it at a local copy gives a build with no third-party requests at all. A custom src is emitted without `integrity`/`crossorigin`, since the pinned hash only matches the pinned file.
- Design tokens for lines and borders — `--color-divider`, `--color-blockquote-border`, `--color-control-border`, `--color-control-border-hover` — with dark-mode counterparts. All colour tokens are now declared in one documented block at the top of `assets/css/main.css` and listed in the README.
- `exampleSite` declares the `JSON` and `LLMS` output formats, so the JSON Feed and `llms.txt` the theme ships templates for are actually exercised by the demo build (and by CI).

### Changed
- `console-art.html` split out of `custom_body.html`. The home-page console art was living inside an extension hook, so any site that replaced `custom_body.html` silently lost it; the hook is now genuinely empty and the art is a theme-owned partial.
- Seven redundant `[data-theme="dark"]` rules removed — they only restated a border colour that is now a token, so the dark palette resolves it directly. Computed styles are unchanged; the minified stylesheet is 261 bytes smaller.
- `theme.toml` metadata trimmed and split along the lines the gallery asks for (`tags` = style, `features` = capabilities), reusing existing vocabulary instead of inventing near-duplicates — see gohugoio/hugoThemesSiteBuilder#699.
- `exampleSite/config.toml` renamed to `exampleSite/hugo.toml`.
- `CONTRIBUTING.md` project-structure section rewritten; it still described `layouts/_partials/style.html` and CSS living inside `custom_head.html`, neither of which has existed since CSS moved to `assets/`.
- README documents the three extension levels (site-wide hooks, template blocks, full partial override), the full design-token table, and states explicitly that the Telegram counter script is the only part of the theme requiring Node.

## [1.0.2] — 2026-07-04

### Fixed
- `images/screenshot.png` and `images/tn.png` retaken at the exact dimensions required by the Hugo themes gallery (1500×1000 and 900×600); previous images were 2850×980 and 900×309.
- `seo_tags.html`: `<meta name="author">` rendered the `[params.author]` TOML table as a Go map string (`map[jobtitle:…]`); now uses `params.authorName` with a `site.Title` fallback. Same fallback fixed in all five JSON-LD author/publisher fields in `structured_data.html`.
- `baseof.html`: `<meta charset>` moved to the very top of `<head>` — inline scripts (theme-init, analytics, KaTeX) could push it past the 1024-byte limit the HTML spec allows for the encoding declaration.
- Duplicate `<meta name="twitter:card">` removed from `og-image.html` (already emitted unconditionally by `seo_tags.html`).
- `structured_data.html`: non-blog pages are no longer typed `BlogPosting` (now `WebPage`), and the JSON-LD `image` field is only asserted when the OG image generator actually runs (base image + fonts present).
- Telegram comments lazy-load: toggling the theme (or a system theme change) before the widget scrolled into view force-loaded it immediately, defeating the IntersectionObserver; theme changes now only rebuild an already-loaded widget.
- `exampleSite`: `disableKinds` now includes `"term"` — category term pages were still being built, each duplicating the full blog listing (the theme's `list.html` always renders the whole `/blog` section).
- `fetch-telegram-reactions.mjs`: when every fetch fails (Telegram outage/blocking), the script now exits non-zero without overwriting the output file instead of silently writing `{}` and wiping all reactions; stale header comments ("no retries", "requires Hugo Extended") corrected.

### Changed
- `home.llms.txt` is now fully data-driven (site params, `menu.main`, `/blog` section) instead of containing a hardcoded author bio; the bio comes from the new per-language `params.llms.about`. Section labels use new i18n keys (`about_author`, `contacts`, `sections`, `website`, `telegram_channel`).
- 404 page is a real themed page (header/footer, localized text via `not_found` / `back_home` i18n keys) instead of an instant meta-refresh/JS redirect to the homepage.
- Language toggle in the footer is only rendered on multilingual sites (previously a single-language site got a dead RU/EN toggle with an empty `href`); its `aria-label` moved to the `switch_language` i18n key.
- Mermaid CDN `<script>` now carries an SRI `integrity` hash (computed from the npm tarball) + `crossorigin`; diagrams re-render on theme toggle instead of keeping the palette they were first drawn with; if the CDN script fails to load, raw diagram source is shown instead of an invisible block.
- `list.html`, `index.json`, `home.llms.txt` no longer crash the build on sites without a `/blog` section (`site.GetPage` result is nil-checked); `list.html` dev comments translated to English.
- "New" listing badge and OG `article:*` meta: badge text moved to the `new_badge` i18n key; `article:published_time`/`modified_time`/`tag`/`section` now use `property=` instead of the nonstandard `name=`.
- `baseof.html` emits an `hreflang="x-default"` alternate link pointing at the default-language version of translated pages.
- Back-to-top gutter link got `href="#"` so it is keyboard-focusable (click handler already prevents the hash navigation).

### Removed
- Committed Hugo resource cache `exampleSite/resources/_gen/` (generated OG images) untracked — it is already gitignored.

## [1.0.1] — 2026-04-19

### Added
- exampleSite build CI (`.github/workflows/test-example-site.yml`) — builds exampleSite on every push and PR via `hugo -s exampleSite --themesDir ../.. --minify`; surfaces as a status badge in the README.
- README badges: Hugo version, GitHub stars, and CI status alongside existing Release and License.
- Emoji glyphs on every feature bullet in README for faster visual scan in the theme gallery.
- Parse-drift warning in `fetch-telegram-reactions.mjs` — when the fetched HTML contains `tgme_widget_message` but both the view and reaction parsers come back empty, a warning is logged so regressions in Telegram's embed shape surface loudly instead of silently zero-ing out all reactions.

### Changed
- `theme.toml`: tighter description focused on "Lighthouse 100 / zero runtime deps"; `tags` expanded 6 → 17 and `features` expanded 7 → 17 for `themes.gohugo.io` discoverability.
- `fetch-telegram-reactions.mjs`: non-429 4xx responses (e.g., 403, 404) now raise `permanent: true` and skip the retry loop — the previous code wasted three backoff attempts on every permanent error.

### Removed
- `layouts/partials/popular-posts.html` — replaced by the recent-posts sidebar in v1.0.0 and already unreferenced by any template.

## [1.0.0] — 2026-04-16

> **Breaking.** `custom_head.html` and `custom_body.html` partials no longer *replace* the theme's CSS/JS — they now *append* after the bundled theme assets, so anything inside them wins the cascade rather than clobbering the theme. See the CSS/JS bundling entry under Changed below.

### Added
- CSS custom properties (`--color-primary`, `--color-accent`, `--color-primary-border`, `--color-accent-border`) for easy color customization
- `copyrightYear` param — footer start year shown as "© YEAR–NOW"
- `telegramCTATitle` and `telegramCTADescription` params to customize Telegram CTA text without editing i18n files
- `socialSharing` param — set to `false` to disable Likely social sharing buttons
- Footer social icons: `params.social.x`, `params.social.youtube`, `params.social.facebook`, `params.social.instagram` — each rendered with brand-colored hover state in light and dark themes
- Plausible Analytics support: `params.plausibleDomain` (+ optional `params.plausibleSrc` for self-hosted) — privacy-friendly, cookieless
- Umami Analytics support: `params.umamiWebsiteId` (+ optional `params.umamiSrc` for self-hosted) — privacy-friendly, cookieless
- Heading anchor links — markdown `##` and `###` headings get a clickable link-chain SVG icon. Desktop: icon sits in the left margin (Telegram blog style), appears on heading hover, aligned to the first line; right-padding bridges the gap between icon and text so hover doesn't flicker. Mobile: icon appears inline after the heading text, faintly visible (`opacity: 0.4`) on touch devices. Click copies the absolute section URL to clipboard with brief feedback. Implemented via `_markup/render-heading.html` render hook + minimal JS (no extra dependencies).
- Pinned posts — `pinned = true` in a post's front matter floats it to the top of its category group on the blog listing. Multiple pinned posts within a category preserve reverse-chronological order between themselves; unpinned posts follow in reverse-chronological order. No visual marker — order is the only signal.
- Inter 500 (Medium) `@font-face` declared in `fonts.html`. Used by content links so they sit between body 300 and bold 600 in weight (previously 600 was the only available link weight). 300/600 stay preloaded; 500 loads on demand.
- `params.consoleYoda = true` — boolean shortcut that prints the bundled Yoda ASCII art (`assets/console-yoda.txt`) in the browser console on the home page, without having to paste 30 lines into your config. The existing `params.consoleArt` (custom art) still works and takes priority when both are set.
- **Telegram reactions block** — surfaces view counts and emoji reactions from the post's linked Telegram channel post into the post meta row next to the date. This is the full feature shipped as one unit:
  - `scripts/fetch-telegram-reactions.mjs` — zero-dependency Node 18+ script that reads Hugo config (`hugo config --format json`), finds `params.telegramChannel` and the default language's content directory, scrapes the public Telegram embed (`https://t.me/<channel>/<id>?embed=1`) for every post with `telegram_post = NNN` in front matter, parses reaction/view counts from the HTML, and writes `data/telegram_reactions.json` at the site root. Handles paid star reactions (`⭐`) and standard emoji reactions; skips premium custom emoji that have no text fallback. Universal — reads config automatically, supports `--channel` / `--content-dir` / `--output` CLI overrides and `TELEGRAM_CHANNEL` env var. Sites using the theme invoke it from their own `package.json`: `"fetch-telegram-reactions": "node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs"`.
  - `layouts/partials/telegram-views.html` — renders an inline `<span class="tg-views">` with a filled eye glyph (Birman-style, two-path + pupil, `fill="currentColor"`) and the view count. Designed to sit next to the post date.
  - `layouts/partials/telegram-reactions.html` — renders an inline `<div class="tg-reactions">` with one `<span class="tg-reaction">` per emoji + count. Right-aligned via the parent flex container.
  - `single.html` wraps the post meta row as a flexbox: `[views + date]` on the left, `[reactions]` on the right, stacking vertically on mobile (`max-width: 768px`).
  - Both partials read from `site.Data.telegram_reactions[<id>]` and render nothing if the data file or entry is missing — safe to build locally without ever running the fetch script.
- **Nav menu icon support** — set `params.icon = "telegram"` on a menu item to show an inline SVG paper plane. Desktop: icon before label with elastic hover animation (`cubic-bezier(0.34, 1.56, 0.64, 1)` + drop-shadow trail). Mobile: icon after label, larger size (20px). Extend the `$paths` dict in `nav.html` to add more icons.
- **Back to top** — Telegram-blog-style left gutter click area. A fixed overlay spans the left margin on wide screens (gutter > 130px); appears when scrolled > 400px with a 0.2s fade. The visible label ("↑ Go up" / "↑ Наверх") occupies a 120px-wide strip with a subtle hover highlight. Clicking anywhere in the gutter scrolls to top. Hidden on narrow viewports where no gutter exists. Created dynamically by JS — no extra markup needed. i18n key: `go_up`.
- **Recent posts sidebar** — `partial "recent-posts.html"` returns a slice of the N most-recent blog posts (excluding the current page and `hidden = true` posts). In `single.html` it renders as `<aside class="recent-sidebar" id="recent-sidebar">`. On desktop with a right gutter ≥ 180px, JS positions the aside absolutely in the gutter (scrolls with page, `position: absolute`). On narrow viewports the block is a static section at the bottom of the article, styled with `ul.blog-posts` for visual consistency with the blog listing. Count controlled by `params.recentSidebarCount` (default: 8, set in `hugo.toml`).
- `params.recentSidebarCount` — theme default param (in `hugo.toml`) controlling how many posts appear in the recent sidebar block.
- i18n keys `recent_posts` added to `i18n/ru.toml` ("Новые статьи") and `i18n/en.toml` ("More articles").
- `scroll-margin-top: 0.75rem` on `h2` and `h3` — gives breathing room between the top of the viewport and a heading after anchor navigation.
- Mobile heading anchors: icon is now `display: none` by default (takes no space), revealed via `.anchor-visible` on the parent heading when the user taps it. Tap on the icon itself copies the URL and scrolls natively (no `preventDefault`); `e.stopPropagation()` prevents the heading-level toggle from interfering.
- `archetypes/blog.md` for content scaffolding (`hugo new blog/my-post.md`)
- Hugo Modules support (`go.mod`)
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- exampleSite: mermaid and shortcodes demo posts

### Changed
- **Theme CSS/JS now bundled, minified, and fingerprinted via Hugo Pipes** instead of inlined per page. Source moved from `partials/style.html`/`fonts.html`/`custom_head.html` (CSS) and `partials/custom_body.html` (JS) to `assets/css/main.css` and `assets/js/main.js`. `baseof.html` runs them through `resources.ExecuteAsTemplate | resources.Minify | resources.Fingerprint "sha256"`, emitting one `<link>` and one `<script defer>` with content-hashed URLs (`/css/main.min.<sha>.css`, `/js/main.<lang>.min.<sha>.js`). Cuts ~33 KB off every HTML page (≈ 68% smaller home, 35% smaller posts), and the assets are cached by the browser across page navigations. JS bundle is per-language because i18n strings are baked in at build time. **BREAKING for theme users:** `custom_head.html` and `custom_body.html` partials no longer "replace all theme CSS/JS" — they now append after the bundled theme assets, so anything in them wins the cascade rather than completely overriding.
- Homepage OG image subtitle now uses `params.description` instead of hardcoded author-specific text
- Content links use Inter Medium 500 instead of Semi-Bold 600 — softer weight contrast against the 300 body text
- Refactor pass for code quality — no behavioural changes:
  - `posts-column.html`: pinned and unpinned posts now share a single `<li>` template via `$pinned | append $unpinned`, eliminating duplication
  - `_markup/render-heading.html`: collapsed if/else into a single `<h{N}>` template with conditional `<a>` insertion
  - `footer.html`: brand social icons rendered from a data-driven `$brands` slice instead of eight near-identical `{{ with }}` blocks
  - `custom_body.html`: copy-button and heading-anchor JS now track per-element timers (no race on rapid double-click) and `.catch()` clipboard rejections; early-exit added when `navigator.clipboard` is unavailable
- Hardcoded grey colors (`#9da2a6`, `#556677`) replaced with CSS custom properties `--color-muted` and `--color-secondary`
- `prefers-reduced-motion` durations changed from `0.01ms` to `0s` for cleaner reduced-motion behavior
- `heading-anchor:focus` no longer removes `outline` — browser default focus indicator preserved for keyboard a11y
- `structured_data.html` JSON conditionals rewritten from `{{ if }}` to `{{ with }}` for robustness — eliminates whitespace-sensitive comma placement
- `single.html`: popular-posts partial call removed; replaced with recent-posts sidebar block.
- Mobile menu: links no longer close the menu on Ctrl/Cmd/Shift+click (allows opening in new tab).
- Back-to-top resize handler: debounced at 150ms (was immediate).
- `a:link, a:active, a:visited` consolidated into a single selector block; redundant dark-theme link color overrides removed (values are already inherited from CSS custom properties).

### Removed
- Telegram CTA block (`tg-cta`) — removed from `single.html` and all associated CSS (~70 lines)
- `params.popularPosts` — curated popular-posts block superseded by the recent-posts sidebar. The `popular-posts.html` partial file itself was kept in this release for back-compat; fully removed in the next version.
- Dead CSS: `.blog-tags`, `.tag-filter`/`.tags-list` (~50 lines of unused styles)
- Dead i18n keys: `tg_cta_title`, `tg_cta_description`, `subscribe`
- Deprecated `word-wrap: break-word` (redundant with `overflow-wrap: break-word`)

### Fixed
- Copy button invisible in light theme — was using white `rgba(255,255,255)` colors meant for dark backgrounds. Now uses dark colors for light theme with `[data-theme="dark"]` overrides for dark theme
- Mobile code blocks: iOS Safari auto-enlarged text in `<pre>` blocks causing inconsistent font sizes. Added `-webkit-text-size-adjust: 100%` to `body` and `.highlight pre`
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

[Unreleased]: https://github.com/zavarovkv/hugo-mini/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/zavarovkv/hugo-mini/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/zavarovkv/hugo-mini/compare/v1.0.2...v2.0.0
[1.0.2]: https://github.com/zavarovkv/hugo-mini/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/zavarovkv/hugo-mini/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/zavarovkv/hugo-mini/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/zavarovkv/hugo-mini/releases/tag/v0.1.0
