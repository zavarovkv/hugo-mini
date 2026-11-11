# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

**A minimal Hugo theme for personal blogs.** Less setup, more writing.

Thoughtful typography powered by [Beauty.css](https://github.com/zavarovkv/beauty-css), a calm reading experience on every screen, and light and dark modes. Multilingual support, SEO, and feeds are built in. Just Hugo to build your blog — no Node.js or required external services.

**[Live demo](https://hugo-mini-demo.vercel.app/)** · **[Quick start](#quick-start)** · **[Hugo Themes](https://themes.gohugo.io/themes/hugo-mini/)** · **[Documentation](#documentation)**

[![Hugo Mini — desktop and mobile preview with the asterisk logo, navigation controls, and light and dark themes](https://raw.githubusercontent.com/zavarovkv/hugo-mini/main/images/readme-preview-v5.gif)](https://hugo-mini-demo.vercel.app/)

## Why Mini?

- **Focus on writing.** A stable 720 px desktop column, comfortable 19 px mobile reading, optional wide images, diagrams and long code blocks, and careful headings, captions and footnotes, with optional side notes on desktop and new-tab links scoped to article bodies. Optional drop caps, hanging quotes, prose numerals and explicit fractions refine the details. Automatic punctuation keeps Markdown intact; articles have a dedicated print layout. [Typography and examples](docs/typography.md).
- **Stay lightweight.** Responsive layout with an easy-to-tap mobile menu; fonts, CSS, JavaScript and icons are served from your site. Optional site-owned fonts can pair a separate H1 family with the body face and configure the weights used by text and components. Updated local icons get new URLs automatically.
- **Publish out of the box.** Light and dark modes, smooth menu highlighting and subtle project/archive link arrows, a favicon, multiple languages, SEO, RSS, and JSON Feed.
- **Add only what you need.** Customize colors, menus, and your logo; opt into math, diagrams, Telegram comments, sharing, and analytics.

## Quick start

**Deploy to Vercel in one click:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

[Starter files](starter/) · [Setup guide](starter/README.md)

**Run locally** with Hugo Extended 0.146 or newer:

```bash
hugo new site myblog
cd myblog
git init
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Replace the generated `hugo.toml` with:

```toml
baseURL = "https://example.com/"
title = "My Blog"
theme = "hugo-mini"

[[menu.main]]
  name = "Blog"
  url = "/blog/"
  weight = 1
```

Create your first post and start the server:

```bash
hugo new content blog/_index.md
hugo new content blog/hello-world.md
hugo server -D
```

Open `http://localhost:1313/`. See the [example site](exampleSite/) or [Hugo Modules setup](docs/configuration.md#installation).

## Documentation

Start with the [complete feature index](docs/advanced-features.md): reading and print, navigation, content components, integrations and extension points.

- [Setup & languages](docs/configuration.md) · [Deployment](docs/deployment.md) · [Writing posts](docs/content.md)
- [Typography](docs/typography.md) · [Site-owned fonts](docs/fonts.md) · [Customization](docs/customization.md)
- [Article shortcuts](docs/content.md#article-keyboard-navigation) · [Telegram](docs/telegram.md)
- [Bundled assets](docs/vendor-assets.md) · [Changelog](CHANGELOG.md)

[Report an issue](https://github.com/zavarovkv/hugo-mini/issues) · [Contribute](CONTRIBUTING.md) · [Star on GitHub](https://github.com/zavarovkv/hugo-mini)

## License

[MIT](LICENSE)
