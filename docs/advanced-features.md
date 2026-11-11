# Feature index

The complete map of Hugo Mini's public features. [README](../README.md) covers installation; the linked guides contain parameters, markup and limitations.

## Reading and navigation

| Feature | Behavior and reference |
| --- | --- |
| Reading layout | 720 px column, 18/28 px desktop and 19/29 px mobile text; responsive headings, links and editorial helpers, including per-article drop caps. [Typography](typography.md) ([Russian](typography.ru.md)) |
| Fonts | Self-hosted Inter by default; site-owned font families and role weights through an optional [font profile](fonts.md) |
| Text processing | Build-time quotes, dashes and spacing; page/fragment opt-out; code, URLs, math and source files stay intact. [Rules](typography.md) |
| Color schemes | System colors without JavaScript; before-paint preference resolution and explicit theme choice; optional cross-subdomain preferences. [Configuration](configuration.md#shared-theme-and-language-preferences) |
| Mobile menu | Overlay, Escape and focus handling; ordinary links without JavaScript. Shared [header and footer components](customization.md#templates) |
| Menu selection | Stable label widths and a 300 ms desktop opacity blend between normal/bold states, without moving the menu; native links, reduced-motion and browser fallbacks. [Menu transitions](customization.md#menu-transitions) |
| Article navigation | Option/Alt + Left/Right selects older/newer public posts in the current language, stops at boundaries and respects editing controls. [Contract](content.md#article-keyboard-navigation) |
| Heading links | Copyable H2/H3 anchors; mobile tap-to-reveal; `.no-anchor` opt-out. [Content](content.md) |
| Back to top | Optional left-gutter control on wide screens; page/site opt-out. [Parameters](configuration.md#parameters) |
| Languages | English/Russian UI, configurable languages and localized menus; translation links fall back to that language's home; optional remembered choice and AI label. [Languages](configuration.md#multilingual-sites) |
| Search control | Optional magnifier currently links to the homepage; no full-text search implementation. [Parameters](configuration.md#parameters) |

## Articles and components

| Feature | Behavior and reference |
| --- | --- |
| Wide code | Per-page `wideCode = true`: long examples expand up to 960 px; short ones keep the reading measure. Native scrolling, highlighting, copy and print remain intact. [Code layout](content.md#wide-code-blocks) |
| Images | Semantic `image` figures, automatic local dimensions and optional wide layout up to 960 px, sharing the text edge and preserving the recent-posts rail. [Wide images](content.md#wide-images) |
| Collections | Configurable post sections, translated category labels, pinned posts, New badges and recent sidebar/bottom list; hidden posts retain public URLs and indexing. [Front matter](content.md#front-matter) |
| Images and links | Local image dimensions, lazy loading and decoding; external Markdown links open safely in a new tab; internal links can select the current-language translation. [Content](content.md) |
| Lists and footnotes | Inherited marker weight, responsive indentation and item spacing; linked notes with visible numbers even before code, quotations or nested lists. Styles belong to [Beauty.css](vendor-assets.md#beautycss-foundation) |
| Tables | Keyboard-focusable local scrolling, semantic ISO dates and wrapped print cells; other content keeps the normal reading measure. [Printing](content.md#printing) |
| Code | Copy control and class-based light/dark/print palettes; requires `markup.highlight.noClasses = false`. [Highlighting](configuration.md#syntax-highlighting) |
| Math and diagrams | Opt-in self-hosted KaTeX; Mermaid 11/12 with CDN or local script/ESM, theme-aware colors, optional wide figures with shared image-caption styling, and readable failure fallback. [Configuration](configuration.md), [assets](vendor-assets.md) |
| Print | Fixed point sizes, light paper palette, wrapped code/tables and simplified page shell. Diagrams prepare neutral copies in the background. [Printing](content.md#printing) |
| Editorial shortcodes | `caption`, `callout`, `plug` and `mermaid`; ordinary semantic Markdown inside supported blocks. [Usage](content.md#shortcodes) |
| Homepage components | `latest-posts` with optional archive link; `columns`/`column` stack on mobile. [Latest posts](content.md#latest-articles), [columns](content.md#columns) |
| Projects | `project` with Markdown description, optional light/dark mark and motion-aware click animation; source links use compact notes. [Projects](content.md#projects) |
| Public counters | `github-stars` renders saved data; optional build helper preserves counts on API failure, with no browser counter requests. [GitHub stars](content.md#github-stars) |
| Bookshelf | `reading-list` renders shared site data with localized labels, review links, reading dates and addition-based badges. [Reading lists](content.md#reading-lists) |
| Decorative arrow | `wavy-arrow` supplies a thin inline SVG curve between dates or other text. [Usage](content.md#wavy-arrow) |
| Loading values | Optional `loading-skeleton` for unknown inline values only, reserved space, `aria-busy` and reduced-motion support. [Loading values](customization.md#loading-values) |

## Publishing and extension

| Feature | Behavior and reference |
| --- | --- |
| Metadata and feeds | Canonical/hreflang, generated 1200×630 share cards, Open Graph/Twitter, JSON-LD, RSS, JSON Feed, sitemap, robots and localized llms.txt. Page identity/noindex overrides are independent of hidden listings. [Content](content.md), [share cards](customization.md#share-cards) |
| Telegram | Lazy comments and optional build-time reactions/views; missing data degrades gracefully. [Guide](telegram.md) |
| Sharing and analytics | Optional local Likely controls; Yandex, Google, Plausible and Umami load only when configured. These integrations may contact third parties. [Configuration](configuration.md), [asset ownership](vendor-assets.md) |
| Identity | Logo/dark variant or avatar/hover frame, favicon overrides or opt-out, SVG menu icons and footer links. [Customization](customization.md) |
| 404 and console | Localized not-found page with the shared blog text/header scale, optional independently sized animated ASCII Yoda and home-page console art; motion preference respected. [Parameters](configuration.md#parameters) |
| Template API | Named base blocks; custom head/body/OG hooks; reusable menu and footer; public tokens and site-owned fonts. [Customization](customization.md#templates) |
| Installation and hosting | Hugo Extended 0.146+, submodule or Go Module; no npm needed for ordinary builds; Vercel starter or any static host. [Setup](configuration.md#installation), [deployment](deployment.md) |
| Maintenance | Pinned Beauty, Inter, KaTeX and Likely; Node/browser regression checks for maintainers, separate from user builds. [Assets](vendor-assets.md), [contributing](../CONTRIBUTING.md) |

Current defaults live in [hugo.toml](../hugo.toml); the bilingual [example site](../exampleSite/) provides working content. Changes to public behavior are recorded in [CHANGELOG.md](../CHANGELOG.md).
