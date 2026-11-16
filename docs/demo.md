# Demo maintenance

[Documentation](README.md) · [Deployment](deployment.md) · [Fonts](fonts.md)

**Audience: theme maintainers.** To create your own blog, use the
[starter](../starter/README.md) instead. The public demo exercises neutral bilingual
content, without author-specific Telegram links or analytics.

## Configure Vercel

1. Import `zavarovkv/hugo-mini` as a separate Vercel project.
2. Keep **Root Directory at the repository root**.
3. Enable automatic exposure of Vercel system environment variables.
4. Use the repository's Vercel configuration: `scripts/build-vercel-demo.sh` builds and `exampleSite/public/` is published.

| Build concern | Behavior |
| --- | --- |
| Hugo | Download a pinned Extended release and verify its official SHA-256 digest. Update version and checksum together. |
| Checkout path | Create a temporary theme-directory symlink for Vercel's generic checkout path. |
| Production URL | Use `VERCEL_PROJECT_PRODUCTION_URL`. |
| Preview URL | Use `VERCEL_URL`. |
| Local / CI URL | Keep the example's `https://example.com/`; Vercel overrides it with `--baseURL`. |

## Deployment-owned demo fonts

The maintained demo uses licensed body, title and quotation faces. They are **not**
distributed in the repository. Ordinary clones, CI, the Hugo Themes catalog and
starter builds use bundled Inter.

### Configure a profile

Set the optional **Production** environment variable `DEMO_FONT_PROFILE` to JSON:

```json
{
  "fonts": {},
  "files": [
    {
      "source": "private-fonts/body.woff2",
      "url": "https://your-site.example/body.woff2",
      "sha256": "<64 lowercase hex characters>"
    }
  ]
}
```

Replace `fonts` with the complete [`params.fonts` object](fonts.md), and include
one file record for every distinct `faces[].source`, `title.source` and `quote.source`.
The skeleton above is not a complete font profile.

Use assets and domains covered by your license. Store this setting in deployment
configuration, not the shared example. It describes files; it is neither a binary
font bundle nor a credential.

### Build and failure behavior

1. Copy the example site into a temporary directory.
2. Download HTTPS assets with a timeout, rejecting redirects.
3. Verify every SHA-256 digest and add the profile to the temporary site.
4. Let Hugo fingerprint and self-host the original bytes.
5. Remove temporary configuration, sources and downloads; publish only generated output.

Visitors request fonts from the demo itself. Published fonts are public browser
assets; the source URLs must also remain available for future builds.

An unavailable asset or checksum mismatch fails the build, preserving the last
successful deployment. There is no silent font fallback. Update URLs and checksums
together when replacing files.

To restore Inter, remove `DEMO_FONT_PROFILE` and redeploy. The script cleans old
output so unused licensed fonts are not carried forward.
