# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

**A Hugo theme for personal blogs, essays and notes.** Write in Markdown and publish a static site. Fonts, styles and core JavaScript are served from your own domain.

**[Live demo](https://hugo-mini-demo.vercel.app/)** · **[Quick start](#quick-start)** · **[Hugo Themes](https://themes.gohugo.io/themes/hugo-mini/)** · **[Documentation](#documentation)**

[![Hugo Mini — a dark browser window and light iPhone view on a transparent background](https://raw.githubusercontent.com/zavarovkv/hugo-mini/main/images/readme-preview-v8.gif)](https://hugo-mini-demo.vercel.app/)

Mini includes **Inter**. The live demo uses Story for body text, Sourdine for article headings and Mirta for quotations, under separate licenses. [Demo fonts](docs/demo.md#deployment-owned-demo-fonts)

## Features

- **Reading.** [Beauty.css](https://github.com/zavarovkv/beauty-css) typography, quotations, margin notes, an optional desktop outline for posts with two or more H2s, and print layouts. [Authoring examples](docs/typography.md)
- **Articles and homepages.** Center wide code examples, diagrams and captioned images on the reading column. Articles support syntax highlighting, copying and KaTeX formulas. Build a homepage from featured posts, projects and reading lists.
- **Navigation.** Switch language or color scheme from the footer or mobile menu. Both include your social links. Keyboard shortcuts and English and Russian interface text are built in.
- **Search.** [Pagefind](docs/search.md) searches full text in the reader’s language. The starter enables search and rebuilds the index with the site.
- **Publishing.** Sitemap, RSS and social preview cards. Optional JSON Feed, Telegram comments, sharing controls and analytics.

## Quick start

Requires **[Hugo Extended 0.146+](https://gohugo.io/installation/)** and **Git**. The search-enabled starter also needs **Node.js 22.12+**. Once the theme is installed, a site without search can build with Hugo alone.

Create a blog with a sample homepage, About page and first post:

```bash
hugo new site myblog
cd myblog
git init
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
cp themes/hugo-mini/starter/hugo.toml hugo.toml
cp -R themes/hugo-mini/starter/content/. content/
cp themes/hugo-mini/starter/package*.json .
npm ci
npm run dev
```

Open `http://localhost:1313/`. Set your title and author in `hugo.toml`; replace the sample pages in `content/`.

To create your first post and preview it as a draft, stop the server with `Ctrl+C` and run the following commands.

```bash
hugo new content blog/my-first-post.md
npm run dev -- --buildDrafts
```

To publish, set `baseURL` and the post’s `draft = false`, then run `npm run build`. Deploy the whole `public/` directory, including its search index. [Deployment guide](docs/deployment.md).

**Prefer Vercel?** Deploy the [starter](starter/README.md) into your own repository:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

Existing site or Hugo Modules? See [installation](docs/configuration.md#installation). Follow the [update guide](docs/configuration.md#updating) or [move from v3 to v4](docs/configuration.md#upgrade-from-v3-to-v4).

## Documentation

[Documentation home](docs/README.md) · [Feature index](docs/advanced-features.md)

- [Configuration & languages](docs/configuration.md) · [Example site](exampleSite/)
- [Writing & components](docs/content.md) · [Typography](docs/typography.md)
- [Customization](docs/customization.md) · [Fonts](docs/fonts.md) · [Telegram](docs/telegram.md)
- [Bundled assets](docs/vendor-assets.md) · [Changelog](CHANGELOG.md)

[Report an issue](https://github.com/zavarovkv/hugo-mini/issues) · [Contribute](CONTRIBUTING.md)

## License

[MIT](LICENSE)
