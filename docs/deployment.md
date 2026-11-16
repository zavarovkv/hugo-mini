# Deployment

[Documentation](README.md) · [Configuration](configuration.md) · [Vercel starter](../starter/README.md)

Mini produces a static site. Publish the generated `public/` directory to your host;
no Node.js runtime or application server is needed.

## Build for production

1. Set `baseURL` to the final public URL, including any subdirectory.
2. Restore the theme (`git submodule update --init --recursive` for a submodule).
3. Run any optional counter fetchers, then build with Hugo Extended 0.146.0+:

   ```bash
   hugo --minify
   ```

4. Deploy `public/`. Check a post, an asset URL, a language link and a missing path.

Drafts and future posts are excluded from ordinary production builds. Optional
[GitHub](homepage.md#github-stars) and [Telegram](telegram.md) helpers require Node.js
only when you choose to run them.

## Sitemap and robots.txt

Set `enableRobotsTXT = true` at the top level of your site configuration to advertise
the default root `sitemap.xml`. If you rename or disable the sitemap, supply a matching
`layouts/robots.txt`. See [front matter](content.md#front-matter) for page-level
sitemap, noindex and canonical settings.

## GitHub Pages

Use the official Pages actions or another maintained workflow:

1. Check out with submodules enabled.
2. Install a supported Hugo Extended version.
3. Run optional data fetchers.
4. Build with `hugo --minify`.
5. Upload and deploy `public/` as the Pages artifact.

Pin third-party actions to immutable commit SHAs and grant only required permissions.
The [production blog workflow](https://github.com/zavarovkv/zavarov.com/blob/main/.github/workflows/gh-pages.yml)
is a working example; its translation and font steps are site-specific.

Pages serves the root `404.html` for every language. Mini selects an embedded
translated view from the requested path before initializing controls, without
redirecting, fetching another page or losing HTTP 404 status. Without JavaScript,
the default-language error page remains available.

## Netlify and Vercel

| Setting | Value |
| --- | --- |
| Build command | `hugo --minify` |
| Publish directory | `public` |
| Hugo version | A supported Extended release, configured for your provider |
| Theme checkout | Recursive submodules, if using a submodule |

Providers differ in how they install Hugo. The [Vercel starter](../starter/README.md)
includes a verified downloader; a generic project must make Hugo available itself.

### One-click blog starter on Vercel

The [Deploy to Vercel button](../starter/README.md) copies only `starter/` into a new
repository in your account. Edit `hugo.toml`, the homepage and first post.
Its setup script pins and verifies the theme commit; the build verifies Hugo's
checksum. Generated theme and output directories are gitignored.

Enable Vercel system environment variables for correct absolute URLs.
`HUGO_BASEURL` overrides the generated hostname; without either, the build uses
`hugo.toml` (site-root relative URLs by default).

### Public theme demo on Vercel

The repository's demonstration is separate from the personal-blog starter.
See [Demo maintenance](demo.md) for project setup, hostnames and build verification.

#### Deployment-owned demo fonts

The public demo uses separately licensed fonts; clones, CI, the catalog and starter
use Inter. See [Demo font delivery](demo.md#deployment-owned-demo-fonts) for the
optional profile, checksums and failure handling.
