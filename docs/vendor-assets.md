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

## Inter and sharing controls

`static/fonts/` contains the four Inter faces declared by the theme: normal 300, 500 and 600,
plus italic 300. Their SIL Open Font License is retained in the same directory. The TTF files
under `assets/fonts/` are separate build inputs for generated share images, not browser downloads.

Likely's upstream files live under `assets/likely/`. Hugo minifies and fingerprints them only
for article pages with social sharing enabled. The generated CSS and JavaScript stay local;
no npm install or CDN is required. Keep upstream sources intact rather than editing their
generated minified output. Existing theme button markup and disabled counters are unchanged.

## KaTeX

KaTeX is committed under `static/katex/` so consuming sites do not need npm or a CDN to render formulas. The current bundle is **0.18.2**, with the inherited-option security fix, matching JavaScript, CSS, auto-render, all font formats, and the upstream MIT license. Its CSS and script URLs include their content hashes to invalidate cached copies when an asset changes.

`vendor/katex.json` records the npm tarball URL/integrity and SHA-256 of every copied file. These files are outside a consuming site's package-lock and npm audit; review upstream [security advisories](https://github.com/KaTeX/KaTeX/security/advisories) when updating them.

The 2026-10-28 compatibility check verified the fix for low-severity
[GHSA-238p-pmpm-9mq7](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7).
The regression test checks that prototype pollution cannot enable trusted rendering, while an explicit
trusted choice still works. Across Chromium, Firefox and WebKit, 444 before/after formula comparisons
in the blog and example site preserved pixels, dimensions and MathML; mathematical Mermaid 11 labels
also remain compatible with this stylesheet.

Mermaid is a separate consumer-owned dependency and may bundle another KaTeX copy. The tested
Mermaid 12.2.0 upgrade clears npm's advisory but changes diagram defaults and geometry, even with
classic styling, so consumers must evaluate that major upgrade separately from the standalone fix.

To reproduce the current bundle, install the pinned package into a temporary directory, then run the maintainer script from the theme root:

```bash
npm install --prefix /tmp/mini-katex --ignore-scripts --save-exact katex@0.18.2 --registry https://registry.npmjs.org
node scripts/vendor-katex.mjs /tmp/mini-katex/node_modules/katex
node --test tests/vendor-assets.test.mjs
```

The script checks the version and all asset checksums before copying. For an upgrade, review the release, verify the package through npm's integrity check, update the manifest from that package, and replace the complete asset set. Build the example site's math page and check representative inline/block formulas before committing. Node is needed only for theme maintenance and optional data scripts, not for ordinary Hugo builds.
