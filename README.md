# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

**A minimal Hugo theme for personal blogs.** Less setup, more writing.

Typography by [Beauty.css](https://github.com/zavarovkv/beauty-css). Build with Hugo; no Node.js or required external services.

**[Live demo](https://hugo-mini-demo.vercel.app/)** · **[Quick start](#quick-start)** · **[Hugo Themes](https://themes.gohugo.io/themes/hugo-mini/)** · **[Documentation](#documentation)**

The theme includes Inter. The demo's licensed Story, Sourdine and Mirta fonts are not bundled. [Font details](docs/deployment.md#deployment-owned-demo-fonts).

[![Hugo Mini — desktop and mobile preview with the asterisk logo, navigation controls, and light and dark themes](https://raw.githubusercontent.com/zavarovkv/hugo-mini/main/images/readme-preview-v5.gif)](https://hugo-mini-demo.vercel.app/)

## Why Mini?

- **Comfortable reading.** Responsive text, quotations, footnotes and print styles. [Typography examples](docs/typography.md).
- **Ready to publish.** Mobile navigation, dark mode, multiple languages, SEO, RSS and JSON Feed.
- **More than posts.** [Featured articles](docs/content.md#featured-articles), projects, reading lists and a [printable CV](docs/content.md#standalone-resume).
- **Optional integrations.** Math, diagrams, Telegram comments, sharing and analytics.
- **Make it yours.** Custom colors, fonts and logos; article H2 can [share the title font](docs/fonts.md#use-the-title-face-for-article-h2). Core assets load from your own site.

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

All features and options: [feature index](docs/advanced-features.md).

- [Setup & languages](docs/configuration.md) · [Deployment](docs/deployment.md)
- [Writing & components](docs/content.md) · [Typography](docs/typography.md)
- [Customization](docs/customization.md) · [Fonts](docs/fonts.md) · [Telegram](docs/telegram.md)
- [Bundled assets](docs/vendor-assets.md) · [Changelog](CHANGELOG.md)

[Report an issue](https://github.com/zavarovkv/hugo-mini/issues) · [Contribute](CONTRIBUTING.md) · [Star on GitHub](https://github.com/zavarovkv/hugo-mini)

## License

[MIT](LICENSE)
