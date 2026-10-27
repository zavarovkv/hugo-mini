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

GitHub Pages serves the root `404.html` for missing paths in every language.
The theme includes inert translated views in that page and selects the language
from the requested URL before initializing its controls. This keeps the missing
URL and the server's HTTP 404 status, with no redirect or additional request.
Without JavaScript, the host's default-language error page remains available.

## Netlify and Vercel

Set the build command to `hugo --minify`, the publish directory to `public`, and the Hugo version environment variable to a supported Extended release. If the theme is a submodule, enable recursive submodule checkout in the provider settings.
