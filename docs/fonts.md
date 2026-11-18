# Site-owned fonts

[Documentation](README.md) · [Customization](customization.md) · [Typography](typography.md)

Mini bundles open-source Inter. Supply your own family through configuration;
no stylesheet fork or theme asset override is needed.

[Body family](#configure-a-body-family) · [Title family](#a-separate-h1-family) · [Article H2](#use-the-title-face-for-article-h2) · [Quote family](#a-separate-quotation-family) · [Delivery](#ownership-and-delivery)

## Configure a body family

1. Put web-licensed files in your site's `assets/private-fonts/`.
2. Gitignore that directory if the files are proprietary.
3. Add a profile to your site configuration, matching weights to the actual font metadata:

   ```toml
   [params.fonts]
   family = "My Font"
   regularWeight = 400
   mediumWeight = 400
   boldWeight = 700
   titleWeight = 700

   [[params.fonts.faces]]
   source = "private-fonts/regular.woff2"
   weight = 400
   preload = true

   [[params.fonts.faces]]
   source = "private-fonts/italic.woff2"
   weight = 400
   style = "italic"

   [[params.fonts.faces]]
   source = "private-fonts/bold.woff2"
   weight = 700
   preload = true
   ```

4. Run `hugo --minify`. A missing source or unmatched role fails the build.

| Field or constraint | Accepted values |
| --- | --- |
| File formats | WOFF2, WOFF, OTF, TTF; no conversion or subsetting |
| Family name | Letters, numbers, spaces, underscores, hyphens |
| Face weight | Integer from 1 to 1000 |
| Face style | `normal` (default) or `italic` |
| Roles | Exact upright face for each configured role; a separate title profile supplies its own title face |
| Custom role defaults | Regular / medium / bold / title: 400 / 400 / 700 / 700 |
| Bundled Inter roles | 300 / 500 / 600 / 500 |

The loader validates configuration, not internal OpenType tables. Declaring a static
Bold file as weight 600 does not create Semibold. Prefer vendor-provided web fonts
and verify the license for your files and domains.

## A separate H1 family

Add this to an **existing body profile**, keeping its family, body roles and faces:

```toml
[params.fonts]
titleWeight = 500

[params.fonts.title]
family = "My Title Font"
source = "private-fonts/title-medium.woff2"
preload = true
```

Use a configuration overlay or merge into existing tables. The title family must
differ from the body family; its upright face uses `titleWeight`. Validation,
fingerprinting and byte preservation match the body loader.

`--font-title` and Beauty's H1 token select the face, including in print. H1 geometry
stays unchanged; H2–H6, navigation, listings and body text retain their roles.
Title letter spacing is normal above `48rem` and `-0.01em` on mobile.

## Use the title face for article H2

```toml
[params]
articleH2UseTitleFont = true
```

This opt-in uses the H1 family and weight for H2 inside `mainSections` post bodies,
even without a separate title family. It changes no sizes, spacing or colors and
adds no files or preload hints. H3–H6 and homepage/archive/standalone headings stay unchanged.

Set `articleH2UseTitleFont = false` in page front matter to opt out.
`useDefaultFonts = true` also restores default typography regardless of this option.

## A separate quotation family

Add an upright face to an existing body profile:

```toml
[params.fonts.quote]
family = "My Quote Font"
source = "private-fonts/quote-regular.woff2"
weight = 400
preload = false
```

The family must differ from body and title families. Weight defaults to 400.
`--font-quote` and `--font-weight-quote` configure blockquotes, `callout`, legacy
block-style `q` and `beauty-quotation` through Beauty tokens.

Captions and attributions keep the body face. Inline quotation marks do not switch
fonts. Sizes and spacing stay unchanged; no synthetic weight or style is added.
Leave preloading off to request the face only where used. Without this profile,
quotations use the body family.

## Ownership and delivery

| Owner | Responsibility |
| --- | --- |
| Site | Font files, family/face configuration and web-use rights |
| Hugo Mini | Loading, preload hints, role tokens and component layout |
| Beauty.css | Native typography |

Changing family does not change sizes, line heights, margins or widths. Mini maps
roles to `--font-weight-body`, `--font-weight-medium`, `--font-weight-bold` and
`--font-weight-title`. `--font-title` falls back to `--font-main`.

### Loading and emphasis

- Assets must exist **before** Hugo builds. Bytes are preserved and URLs fingerprinted.
- Only configured custom preloads are emitted; `font-display: swap` keeps text visible.
- Inter may remain in the output, but custom-font pages do not preload or request it.
- Synthetic weight/style is disabled. Without a matching bold italic face, combined emphasis uses real upright bold; supplying that face restores combined emphasis.

### Keep Inter on selected pages

Set `useDefaultFonts = true` in page front matter or a cascade. It disables all
custom families, including title and quote faces. Distinct CSS output/cache keys
allow default and custom pages in the same multilingual build. Independent templates
that do not use Mini's shell remain unaffected.

### Proprietary fonts

Keep only configuration, checksums and loader code in a public repository. Deliver
font bytes from a private CI source after confirming web-use rights. Published web
fonts are necessarily downloadable; keeping sources out of Git does not restrict
the deployed asset. Mini's MIT license does not relicense site-supplied fonts.
