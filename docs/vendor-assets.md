# Self-hosted upstream assets

[Documentation](README.md) · [Contributing](../CONTRIBUTING.md)

**Audience: theme maintainers.** Ordinary Hugo builds use committed assets without
npm or network downloads. Optional consumer-owned Mermaid and counter helpers have
separate requirements.

| Asset | Location / source of truth |
| --- | --- |
| Beauty.css | `assets/css/beauty.css`, `vendor/beauty-css.json` and adjacent license |
| Inter | `static/fonts/` and its SIL Open Font License; share-card inputs in `assets/fonts/` |
| Likely | Readable upstream sources in `assets/likely/` |
| KaTeX | `static/katex/`, manifest `vendor/katex.json` |
| Mermaid | Consumer-owned script/package; theme test version in `package.json` |

## Beauty.css foundation

From the **theme root**, use a reviewed full upstream commit SHA:

```sh
node scripts/vendor-beauty.mjs <40-character-commit-sha>
node --test tests/vendor-assets.test.mjs
```

The helper verifies the [upstream](https://github.com/zavarovkv/beauty-css) manifest
hash and MIT license before writing. Do not patch generated CSS. Build the example
site and check a consuming blog before committing. `baseof.html` places the foundation
before theme CSS in one local fingerprinted stylesheet.

### Ownership and compatibility

| Beauty.css owns | Mini owns |
| --- | --- |
| Native text, headings, lists, quotes, links, code, tables, forms, notes, captions and editorial helpers | Font loading, palette, page geometry, UI and KaTeX/Chroma/Likely integration |

Mini configures `--beauty-*` values instead of adding parallel native-text rules.
Frequently used library helpers:

| Helper | Use |
| --- | --- |
| `beauty-reading` | Responsive reading measure/type; compact UI tables retain their own scale |
| `beauty-link-label`, `beauty-link-icon` | Shared compound-link underline and icon geometry |
| `beauty-nowrap` | Keep short editorial values together; reading dates use semantic `time` |
| `beauty-stat-value`, `beauty-stat-label` | Responsive tabular-number summaries; optional `--beauty-stat-size` |
| `ol.beauty-steps` | Connected numbered steps: each `li` contains a `beauty-step-marker` and content `div` |

Consumers own surrounding grids and spacing. These helpers add no interaction,
progress state or client-side text rewriting.

The cached `beauty-compat.html` adapter maps Goldmark footnotes and legacy
`.underline`, `.caption`, `.button` and block `<q>` to library selectors. It matches
complete selector tokens in trusted pinned CSS; it is not a general CSS parser.
Tests cover token boundaries and the generated bundle.

For new content, use `beauty-emphasis`, `beauty-caption`, `beauty-button` and semantic
[quotations](typography.md#quotations-and-attributions) rather than legacy aliases.

### Joint local development

Build an explicitly unreleased `-dev` Beauty version, then run:

```sh
node scripts/vendor-beauty.mjs --local ../beauty-css
```

The same manifest/license checks apply. The snapshot records
`source: "local-development"` without an upstream revision. **Before releasing Mini**,
publish the reviewed library changes and replace this snapshot with a full upstream
commit through the normal helper.

## Inter and sharing controls

Inter ships four browser faces: normal 300/500/600 and italic 300. TTF files in
`assets/fonts/` are share-image build inputs, not browser downloads. Retain the licenses.

Hugo minifies/fingerprints Likely only on posts with sharing enabled. Its CSS/JS
remain local and counters stay disabled. Edit readable assets, never generated output.

When updating Likely, retain the accessibility patch unless upstream includes it:
copy `role` and `aria-label` only when `hasAttribute` is true. Otherwise enhancement
emits the literal string `"null"`. Mini provides localized names for icon-only links.

## KaTeX

The committed **0.18.2** bundle includes matching JavaScript, CSS, auto-render,
all font formats and the MIT license. Content-hashed URLs invalidate old assets.
`vendor/katex.json` records npm tarball integrity and every copied file's SHA-256.

These files sit outside a consuming site's lockfile and `npm audit`; review
[upstream security advisories](https://github.com/KaTeX/KaTeX/security/advisories)
when updating. The current bundle fixes
[GHSA-238p-pmpm-9mq7](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7).
The regression test rejects inherited trust from prototype pollution while allowing
an explicit trusted choice.

### Reproduce the pinned bundle

From the theme root:

```bash
npm install --prefix /tmp/mini-katex --ignore-scripts --save-exact katex@0.18.2 --registry https://registry.npmjs.org
node scripts/vendor-katex.mjs /tmp/mini-katex/node_modules/katex
node --test tests/vendor-assets.test.mjs
```

The script checks the version and asset hashes before copying.

### Upgrade KaTeX

1. Review the upstream release and advisories.
2. Verify the npm package's integrity and update the manifest from that package.
3. Replace the complete asset set, including fonts and license.
4. Build the example math page and compare representative inline/block formulas.

The 2026-10-28 verification compared 444 before/after formulas across Chromium,
Firefox and WebKit, preserving pixels, dimensions and MathML. Mermaid 11 math labels
also remained compatible. This historical check does not replace validation of a new upgrade.

## Mermaid

Mermaid is a separate consumer-owned dependency and can bundle its own KaTeX.
Upgrading it does not update Mini's standalone KaTeX bundle.

The theme's browser tests pin Mermaid **12.2.0**; the optional CDN fallback remains
on Mermaid 11. See [delivery configuration](media.md#choose-how-to-load-mermaid)
for classic/ESM paths and Node/browser requirements.

When upgrading a self-hosted package:

1. Keep the ESM entry and chunks from the same version.
2. Retain explicit Dagre/classic, `flowchart.wrappingWidth = 200` and `flowchart.minNodeWidth = 0`; classic styling alone does not preserve geometry.
3. Compare real diagrams, including animated edges, modern shapes and mathematical labels.
4. Run [browser checks](../CONTRIBUTING.md#browser-checks) for themes, print and delayed/failed downloads.
