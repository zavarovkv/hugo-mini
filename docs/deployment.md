# Deployment

Build the site with Hugo Extended 0.146 or newer:

```bash
hugo --minify
```

The generated site is in `public/`.

With `enableRobotsTXT = true`, the theme advertises the default root
`sitemap.xml` in `robots.txt`. If you change the sitemap filename or disable
sitemaps, supply your own `layouts/robots.txt` to match that configuration.

## GitHub Pages

Use the official Pages actions or another maintained workflow. The essential sequence is:

1. Check out the repository with submodules enabled.
2. Install the required Hugo Extended version.
3. Run any optional data fetchers.
4. Build with `hugo --minify`.
5. Upload and deploy `public/` as the Pages artifact.

Pin third-party actions to immutable commit SHAs and give the workflow only the permissions it needs. The [demo site's workflow](https://github.com/zavarovkv/zavarov.com/blob/main/.github/workflows/gh-pages.yml) is a production example.

The theme's own CI and release workflows use SHA-pinned Node.js 24 actions.
Checkout credentials are not persisted: builds need read access, while release
creation uses the job-scoped token explicitly through `gh`.

GitHub Pages serves the root `404.html` for missing paths in every language.
The theme includes inert translated views in that page and selects the language
from the requested URL before initializing its controls. This keeps the missing
URL and the server's HTTP 404 status, with no redirect or additional request.
Without JavaScript, the host's default-language error page remains available.

## Netlify and Vercel

Set the build command to `hugo --minify`, the publish directory to `public`, and the Hugo version environment variable to a supported Extended release. If the theme is a submodule, enable recursive submodule checkout in the provider settings.

### Public theme demo on Vercel

The theme repository itself includes a Vercel project configuration for the
neutral `exampleSite` demonstration. Import `zavarovkv/hugo-mini` as a separate
Vercel project, keep **Root Directory at the repository root**, and enable
automatic exposure of Vercel system environment variables. Vercel builds with
`scripts/build-vercel-demo.sh` and publishes `exampleSite/public/`.

The script downloads a pinned Hugo Extended release, verifies its SHA-256 digest
against the official release, and creates a temporary theme-directory symlink
so the build works with Vercel's generic checkout path. It chooses the production hostname from
`VERCEL_PROJECT_PRODUCTION_URL` and preview hostnames from `VERCEL_URL`, keeping
absolute URLs correct for each deployment. Updating the Hugo version requires
updating the checksum in the same commit.

The example site's source configuration retains `https://example.com/` for
local builds and CI; the Vercel build passes its actual hostname with
`--baseURL`. The demo shows neutral example content with no author-specific
Telegram links or analytics.

### One-click blog starter on Vercel

For a blog you can customize, use the [Deploy to Vercel button](../starter/README.md).
Vercel clones only the `starter/` subdirectory into a new repository in your
account. This is separate from the public, read-only example site above.

The starter's `scripts/setup-theme.sh` clones an exact Hugo Mini release and
checks its commit SHA. Its Vercel build script downloads Hugo Extended from the
official release, verifies SHA-256, then builds the site. The generated theme
and output directories are ignored by Git. Edit the starter's `hugo.toml`,
homepage, and first post before sharing the site.

For correct absolute canonical URLs, enable Vercel system environment variables.
An explicit `HUGO_BASEURL` takes precedence over the generated hostname. Without
either environment setting, the build keeps `baseURL` from `hugo.toml` (the
starter defaults to site-root relative URLs).
