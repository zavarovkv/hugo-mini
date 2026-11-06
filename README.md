# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

A minimal Hugo theme for personal blogs, built around reading.

Clean typography powered by [Beauty.css](https://github.com/zavarovkv/beauty-css), light and dark modes, multilingual support, SEO, and self-hosted assets. Just Hugo — no Node.js build step.

**[Live demo](https://hugo-mini-demo.vercel.app/)** · **[Quick start](#quick-start)** · **[Hugo Themes](https://themes.gohugo.io/themes/hugo-mini/)** · **[Documentation](#documentation)**

[![Hugo Mini — desktop and mobile preview cycling between light and dark themes](images/readme-preview-v4.gif)](https://hugo-mini-demo.vercel.app/)

## Features

- **Made for reading.** Clean typography, a 720 px text column, and a responsive layout.
- **Fast by default.** CSS, JavaScript, and fonts are bundled and served from your site.
- **Ready to publish.** Multilingual navigation, SEO metadata, RSS, JSON Feed, and sharing.
- **Extras when needed.** Math, diagrams, Telegram comments, and analytics are optional.
- **Easy to customize.** Change colors, menus, and templates without modifying the theme.

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

**Search:** The menu icon currently links to the homepage. Set `showSearchButton = false` under `[params]` to hide it.

## Documentation

- **Getting started:** [Configuration & languages](docs/configuration.md), [Deployment](docs/deployment.md), [Vercel starter](starter/).
- **Writing:** [Content](docs/content.md), [Typography](docs/typography.md), [Advanced features](docs/advanced-features.md).
- **Customizing:** [Theme](docs/customization.md), [Telegram](docs/telegram.md), [Bundled assets](docs/vendor-assets.md).
- **Project:** [Changelog](CHANGELOG.md), [Contributing](CONTRIBUTING.md).

[Report an issue](https://github.com/zavarovkv/hugo-mini/issues) · [Star on GitHub](https://github.com/zavarovkv/hugo-mini)

## License

[MIT](LICENSE)
