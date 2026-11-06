# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

A writer-first Hugo theme for fast, multilingual personal blogs.

Clean typography, self-hosted assets, dark mode, SEO, and optional Telegram integration — without a frontend framework.

The reading foundation comes from [Beauty.css](https://github.com/zavarovkv/beauty-css), pinned and
bundled locally with the theme's own styles. No additional installation is required.

**[Live demo](https://hugo-mini-demo.vercel.app/)** · **[Deploy to Vercel](#quick-start)** · **[Hugo Themes](https://themes.gohugo.io/themes/hugo-mini/)** · **[Quick start](#quick-start)** · **[Documentation](#documentation)**

[![Hugo Mini — desktop and mobile preview cycling between light and dark themes](images/readme-preview-v4.gif)](https://hugo-mini-demo.vercel.app/)

## Why Mini

- **Made for reading.** The interface stays out of the way and gives articles room to breathe.
- **Fast by default.** CSS, JavaScript, and fonts are bundled, fingerprinted, and served from your domain.
- **Useful without a plugin stack.** Dark mode, multilingual navigation, feeds, search metadata, math, diagrams, and sharing are included.
- **Easy to grow.** Design tokens, template hooks, named blocks, and custom menu icons cover common extensions.

## Quick start

**One-click starter on Vercel** — creates a new repository with an editable blog and deploys it automatically:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

[View the starter files](starter/) · [How the one-click setup works](starter/README.md)

**Or set it up locally** with Hugo Extended 0.146 or newer:

```bash
hugo new site myblog
cd myblog
git init
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Replace `hugo.toml` with a minimal configuration:

```toml
baseURL = "https://example.com/"
title = "My Blog"
theme = "hugo-mini"
enableRobotsTXT = true

[permalinks]
  blog = "/:slug/"

[params]
  authorName = "Jane Doe"
  authorURL = "https://example.com/"

[markup.goldmark.renderer]
  unsafe = true

[[menu.main]]
  name = "Articles"
  url = "/blog/"
  weight = 1
```

Create the blog section and your first article:

```bash
hugo new content blog/_index.md
hugo new content blog/hello-world.md
hugo server -D
```

Open `http://localhost:1313/`. For a ready-to-run reference, see the [example site](https://github.com/zavarovkv/hugo-mini/tree/main/exampleSite).

## What is included

| Area | Built in |
| --- | --- |
| Writing | Markdown, build-time typography, optional heading links and CSS classes, code copy, captions, KaTeX, Mermaid |
| Reading | Responsive 720 px reading measure, system-aware dark mode, long-article progress, recent posts, pinned posts |
| Discovery | Open Graph images, JSON-LD, `hreflang`, RSS, JSON Feed, `llms.txt` |
| Integrations | Telegram comments and reactions, social sharing, optional analytics |

Explore [content components and advanced options](docs/advanced-features.md). Features that add weight are opt-in. KaTeX and Mermaid load only on pages that request them; analytics and Telegram are absent until configured.

Without JavaScript, mobile navigation remains visible as ordinary links. The overlay initializes hidden without a loading flash, and closes on Escape, link selection or keyboard focus leaving the navigation. Opening and closing it preserves the article's scroll position.

Mermaid diagrams render as they approach the viewport. Their source stays readable when JavaScript is disabled or loading fails. An optional local ESM bundle loads only the diagram types in use, with a content-hashed entry URL to invalidate stale browser caches after upgrades; see [configuration](docs/configuration.md). Local Markdown images receive intrinsic dimensions to reserve space while loading.

Mermaid 11 and 12 use explicit Dagre/classic settings and the previous flowchart label widths,
so switching a self-hosted bundle to v12 preserves the established layout. Mermaid 12 requires
Node.js 22.12+ and ES2024-capable browsers (Safari 17.4+); the default CDN fallback remains on v11.

## Reading and typography

Articles use 16 px body text and a reading measure of up to 720 px, narrowing to
fit smaller screens. Beauty.css owns the shared typography; the theme sets its
reading-width token and supplies the layout and self-hosted Inter fonts.

Posts with at least 800 words show a discreet 2 px reading-progress line at
the top of the viewport. On narrow screens, a matching opaque surface keeps
the line separate from the scrolling text; it appears once reading starts.
The line follows the article itself (not comments or the footer) and stays
hidden when the article is too short for meaningful scrolling.
The indicator uses the existing script and theme colors, with no animation or
additional dependencies. Disable it per post with `readingProgress = false` in
front matter, or for the whole site under `[params]`. Set
`readingProgressMinWords = 1200` under `[params]` to change the threshold.

Hugo applies typography during the build, without an additional package or
browser script. Goldmark supplies smart quotes, ellipses and dash substitutions.
The theme adds language-aware spacing in Russian and English page bodies:
`1 000 000` keeps its digit groups together, `16px` becomes `16 px`, and percentages
use `10 %` in Russian and `10%` in English. Russian text also keeps a spaced em
dash with the preceding word.

Sources stay unchanged. Code, formulas, URLs and HTML attributes are preserved.
Set `typography = false` in a page's front matter or under site `[params]` to
disable the theme's spacing pass. Goldmark's punctuation settings are separate.
See [typography](docs/typography.md) for examples, exclusions and fragment-level
control.

## Is Mini a good fit?

Choose Mini if you want a text-led personal site or blog, prefer Hugo over a JavaScript application, and want sensible defaults with a small surface for customization.

It is probably not the right starting point for a magazine homepage, a visual portfolio, or a site that needs a component library and application-style interactions.

## Everyday configuration

Most sites only need a few parameters:

```toml
[params]
  favicon = "images/favicon.png"
  avatar = "images/avatar.webp"
  avatarHover = "images/avatar-hover.webp"
  copyrightYear = 2024
  recentSidebarCount = 8
  socialSharing = true

  [params.social]
    telegram = "https://t.me/janedoe"
    github = "https://github.com/janedoe"
    email = "jane@example.com"
```

Posts use TOML front matter:

```toml
+++
title = "My first post"
date = 2026-08-17
description = "A short summary for listings and search results."
categories = ["notes"]
pinned = false
math = false
mermaid = false
+++
```

Set `hidden = true` to keep a page out of listings and feeds while leaving its URL public. Use Hugo's `draft = true` when a page must not be published.

For a publication date known only to the month, use the first day in `date`
and set `date_precision = "month"` to display a localized month name and year.
Other articles retain the full day, month and year regardless of their age.

Set `backToTop = false` in front matter to omit the back-to-top control and its event handlers on a page. The same option under `[params]` applies site-wide.

For a custom share card, add `layouts/_partials/custom_og_image.html` in your site and return a Hugo image resource. Return `false` on other pages to keep the generated default. Open Graph and JSON-LD reuse the returned image; see [customization](docs/customization.md#share-cards).

Custom page layouts can reuse `footer-content.html` to select their own social links while keeping the theme's language and color-scheme controls; see [footer customization](docs/customization.md#footer-links-on-custom-pages).

### Remembering preferences across subdomains

By default, the explicit light/dark choice stays in the current origin's local
storage, and language links navigate normally. To share choices between a site
and its subdomains, opt in on each site:

```toml
[params]
  preferenceCookieDomain = "example.com"
  rememberLanguage = true
```

The shared `hugo-mini-theme` and `hugo-mini-language` cookies take precedence over
older local storage. An existing explicit choice migrates when no shared choice
exists; automatic system colors are never saved as a fixed theme. Cookies use
the configured parent domain, a one-year lifetime, `SameSite=Lax`, and `Secure`
on HTTPS. Local storage remains the fallback when cookies are unavailable or
the page is on a different host, such as a local preview.

With `rememberLanguage`, the footer saves explicit language selections. Homepages
apply the selection using their published, same-origin `hreflang` links. Set
`languagePreferenceEntry = true` in a landing page's front matter or cascade to
give it the same behavior. Direct article URLs retain their language; merely
opening a translated URL does not change the saved preference. Query strings and
fragments survive an automatic entry-page redirect. Theme and entry-page language
refresh when returning to an open tab or restoring a page from browser history.
Without JavaScript, language links still work as ordinary links.

Use `brand-link` for a project-name link that retains heading color without an underline. It configures Beauty.css link tokens and preserves keyboard focus.

Custom headers can reuse the mobile burger through `menu-toggle.html` and a `main-nav` navigation element; see [customization](docs/customization.md).

Standalone project templates can replace the site's icon links through the `favicon` block.

Pages published on another origin can set `canonicalURL`; project landings can also set `seoSiteName` and `seoSiteURL`. Canonical, social and structured metadata stay aligned; see [content configuration](docs/content.md).

An empty or omitted `categories` list places a post in Miscellaneous. Recent articles appear in a right-hand rail when there is room, or below the post on narrow screens and without JavaScript; set `recentSidebarCount = 0` to hide them. A single `avatar` works without `avatarHover` in both color schemes.

## Optional integrations

- **Multilingual sites:** per-language menus, translated interface strings, `hreflang`, a footer switcher for two languages or a menu for three or more, and internal Markdown links to available translations. Set `localizeLinks = false` to keep their original destinations.
- **Telegram:** lazy-loaded comments plus build-time view and reaction counts.
- **Math and diagrams:** per-page KaTeX and Mermaid switches.
- **Analytics:** Yandex Metrika, Google Analytics, Plausible, and Umami; each is disabled unless configured.
- **Customization:** color tokens, custom SVG menu icons, partial hooks, and named layout blocks.

## Documentation

- [Configuration and multilingual setup](https://github.com/zavarovkv/hugo-mini/blob/main/docs/configuration.md)
- [Writing and organizing content](https://github.com/zavarovkv/hugo-mini/blob/main/docs/content.md)
- [Content components and advanced options](https://github.com/zavarovkv/hugo-mini/blob/main/docs/advanced-features.md)
- [Vercel one-click starter](https://github.com/zavarovkv/hugo-mini/tree/main/starter)
- [Reading width and build-time typography](https://github.com/zavarovkv/hugo-mini/blob/main/docs/typography.md)
- [Customizing the theme](https://github.com/zavarovkv/hugo-mini/blob/main/docs/customization.md)
- [Telegram comments and reactions](https://github.com/zavarovkv/hugo-mini/blob/main/docs/telegram.md)
- [Deployment](https://github.com/zavarovkv/hugo-mini/blob/main/docs/deployment.md)
- [Maintaining vendored assets](https://github.com/zavarovkv/hugo-mini/blob/main/docs/vendor-assets.md)
- [Changelog](https://github.com/zavarovkv/hugo-mini/blob/main/CHANGELOG.md) · [Contributing](https://github.com/zavarovkv/hugo-mini/blob/main/CONTRIBUTING.md)

### Exclude a page from the sitemap

The sitemap excludes `noindex = true` pages and draft previews automatically. Hidden posts remain indexable and included. Hugo's standard `[sitemap] disable = true` front matter setting can also omit an otherwise indexable page without changing its robots metadata.

If Mini helps you publish, a [GitHub star](https://github.com/zavarovkv/hugo-mini) makes it easier for other writers to discover the theme.

## License

[MIT](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)
