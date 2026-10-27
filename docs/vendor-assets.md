# Self-hosted upstream assets

## Beauty.css foundation

The plain CSS foundation is vendored from [Beauty.css](https://github.com/zavarovkv/beauty-css).
`vendor/beauty-css.json` pins the upstream commit, version and SHA-256; the MIT license is retained
beside it. `baseof.html` bundles this layer before the theme's own stylesheet into one fingerprinted
local file. Ordinary Hugo builds need neither Node, npm, a network request nor a recursive submodule.

To update the foundation, pass a reviewed full upstream commit SHA:

```sh
node scripts/vendor-beauty.mjs <40-character-commit-sha>
node --test tests/vendor-assets.test.mjs
```

The helper validates the upstream manifest hash and license before writing files. Never patch the
generated artifact. Beauty owns native text styles, responsive heading sizes, lists, quotations,
links, code, captions and optional editorial helpers. The theme configures these through
`--beauty-*` variables; it owns font loading, its public palette, page layout, interactive components
and KaTeX/Chroma/Likely integration. Do not add parallel native-text rules to `main.css`.

The bundle aliases the public `.underline`, `.caption`, `.button` and block `<q>` treatments to
Beauty's selectors. This preserves existing theme content without duplicating CSS declarations or
adding Hugo-specific selectors to the independent library. Prefer `.beauty-emphasis`,
`.beauty-caption`, `.beauty-button` and the semantic `callout` shortcode for new content:

```text
{{< callout >}}
Markdown, including **emphasis** and links, works inside this block quotation.
{{< /callout >}}
```

Check the example site and a consuming blog before committing an update. For joint local
development, build an explicitly unreleased `-dev` library version and run:

```sh
node scripts/vendor-beauty.mjs --local ../beauty-css
```

This verifies the same manifest and license, and records `source: "local-development"` with no
upstream revision. Before releasing the theme, publish the reviewed library changes and replace
the development snapshot with a full upstream commit using the normal command above.

## KaTeX

KaTeX is committed under `static/katex/` so consuming sites do not need npm or a CDN to render formulas. The current bundle is **0.16.47**, from the maintained 0.16 release line, and includes matching JavaScript, CSS, auto-render, all font formats, and the upstream MIT license.

`vendor/katex.json` records the npm tarball URL/integrity and SHA-256 of every copied file. These files are outside a consuming site's package-lock and npm audit; review upstream [security advisories](https://github.com/KaTeX/KaTeX/security/advisories) when updating them.

To reproduce the current bundle, install the pinned package into a temporary directory, then run the maintainer script from the theme root:

```bash
npm install --prefix /tmp/mini-katex --ignore-scripts --save-exact katex@0.16.47 --registry https://registry.npmjs.org
node scripts/vendor-katex.mjs /tmp/mini-katex/node_modules/katex
node --test tests/vendor-assets.test.mjs
```

The script checks the version and all asset checksums before copying. For an upgrade, review the release, verify the package through npm's integrity check, update the manifest from that package, and replace the complete asset set. Build the example site's math page and check representative inline/block formulas before committing. Node is needed only for theme maintenance and optional data scripts, not for ordinary Hugo builds.
