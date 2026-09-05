# Self-hosted math assets

KaTeX is committed under `static/katex/` so consuming sites do not need npm or a CDN to render formulas. The current bundle is **0.16.47**, from the maintained 0.16 release line, and includes matching JavaScript, CSS, auto-render, all font formats, and the upstream MIT license.

`vendor/katex.json` records the npm tarball URL/integrity and SHA-256 of every copied file. These files are outside a consuming site's package-lock and npm audit; review upstream [security advisories](https://github.com/KaTeX/KaTeX/security/advisories) when updating them.

To reproduce the current bundle, install the pinned package into a temporary directory, then run the maintainer script from the theme root:

```bash
npm install --prefix /tmp/mini-katex --ignore-scripts --save-exact katex@0.16.47 --registry https://registry.npmjs.org
node scripts/vendor-katex.mjs /tmp/mini-katex/node_modules/katex
node --test tests/vendor-assets.test.mjs
```

The script checks the version and all asset checksums before copying. For an upgrade, review the release, verify the package through npm's integrity check, update the manifest from that package, and replace the complete asset set. Build the example site's math page and check representative inline/block formulas before committing. Node is needed only for theme maintenance and optional data scripts, not for ordinary Hugo builds.
