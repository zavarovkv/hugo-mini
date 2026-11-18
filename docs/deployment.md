# Deployment

[Documentation](README.md) · [Configuration](configuration.md) · [Vercel starter](../starter/README.md)

## Build for production

Set `baseURL` in the site configuration to the published URL, including its subdirectory (for example, `https://example.org/blog/`). Build from the site root with Hugo Extended 0.146+. Restore submodules on a fresh checkout with `git submodule update --init --recursive` if you installed Mini that way.

| Site setup | Build command |
| --- | --- |
| Hugo site without search | `hugo --minify` |
| Site with the starter's search scripts | `npm ci` then `npm run build` (Node.js 22.12+) |
| Hugo Modules with search | Run Hugo and the [Pagefind indexer](search.md#build-and-preview) in sequence |
| One-click Vercel starter | Keep its [checked-in Vercel settings](../starter/vercel.json) |

Run optional [GitHub](homepage.md#github-stars) or [Telegram](telegram.md) counter updates before building. Deploy all of `public/`, including `pagefind/` when search is enabled. The host serves static files. Check an article, a search result, a translated link and a missing page at the final URL.

## Sitemap and robots.txt

Set `enableRobotsTXT = true` at the top level of your site configuration to advertise
the default root `sitemap.xml`. If you rename or disable the sitemap, supply a matching
`layouts/robots.txt`. See [front matter](content.md#front-matter) for page-level
sitemap, noindex and canonical settings.

## GitHub Pages

In your Pages workflow, check out the theme, install Hugo Extended and use the build command above. Upload `public/` as the Pages artifact and deploy it. The [production blog workflow](https://github.com/zavarovkv/zavarov.com/blob/main/.github/workflows/gh-pages.yml) also shows optional site-specific translation and font steps.

Pages serves the root `404.html` for every language. Mini displays the translated error page for the requested path and preserves the HTTP 404 status. Without JavaScript, readers see the default language.

## Netlify and Vercel

For an existing site, configure a supported Hugo Extended version, the build command for your setup and `public` as the publish directory. Enable submodule checkout if applicable. A search-enabled site needs its npm development dependencies available during the build.

### One-click blog starter on Vercel

[Deploy the starter](../starter/README.md) to create a new repository under your account. Its build script installs the pinned theme, verifies the Hugo binary and builds the search index. Keep the install command `npm ci` and build command `bash scripts/build-vercel.sh`.

For a custom domain, set `HUGO_BASEURL`. For a Vercel domain, expose system environment variables so production and preview builds use their own hostnames. Otherwise the build falls back to `baseURL` in `hugo.toml`.

### Public theme demo on Vercel

The theme repository deploys its bilingual `exampleSite/` from the repository root. See [demo maintenance](demo.md) for the build settings.

#### Deployment-owned demo fonts

The hosted demo uses a licensed font profile. Local clones, the catalog and the starter use Inter. [Demo font setup](demo.md#deployment-owned-demo-fonts)
