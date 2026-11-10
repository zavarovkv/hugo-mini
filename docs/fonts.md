# Site-owned fonts

The theme ships open-source Inter. A site can supply a different family without modifying
Beauty.css, overriding theme assets or distributing its font files with the theme.

Put licensed files under the site's `assets/private-fonts/` (gitignore this directory for
proprietary fonts), then opt in with site configuration:

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

WOFF2, WOFF, OTF and TTF are accepted. The loader does not convert or subset files. Prefer
vendor-provided web fonts when available and follow the license for your files and domains.
Family names accept letters, numbers, spaces, underscores and hyphens. Face weights are
integers from 1 to 1000; styles are `normal` or `italic`. Every configured role must have
an exact normal face. With custom fonts, role defaults are 400/400/700/700; without this
configuration the existing Inter 300/500/600/500 roles remain unchanged.

## A separate H1 family

An existing custom-font profile can use a second, upright face for H1 only:

```toml
[params.fonts]
titleWeight = 500

[params.fonts.title]
family = "My Title Font"
source = "private-fonts/title-medium.woff2"
preload = true
```

Keep the base profile's `family`, body roles and `faces`; this fragment may be a separate
Hugo configuration overlay. The title face uses `titleWeight`, must belong to a distinct
family, and receives the same format validation, fingerprinting and byte preservation.
The theme selects it through `--font-title` and Beauty's existing H1 token, including in
print. H2–H6, article-list links, navigation and body text retain the base family. H1 sizes,
spacing and line height stay theme-owned. The separate H1 family uses normal letter
spacing above 768 px; mobile retains the reading layout's `-0.01em` tracking.
`useDefaultFonts` disables both custom families.

## Ownership and delivery

Files and the family/face description belong to the **site**. Font loading, preload hints,
role tokens and component styles belong to **Hugo Mini**. Native typography belongs to
**Beauty.css**. Changing the family does not change sizes, line heights, margins or widths.
The theme maps roles to `--font-weight-body`, `--font-weight-medium`, `--font-weight-bold`
and `--font-weight-title`, and bridges these to Beauty's existing typography tokens.
`--font-title` defaults to `--font-main` when a separate H1 face is not configured.

Only configured preloads are emitted on custom-font pages. File bytes are unchanged and
fingerprinted; `font-display: swap` keeps text visible during loading. The theme's Inter
files may still exist in the output, but custom-font pages do not preload or request them.
Custom families disable synthetic weight/style. When no italic face matches the bold role,
nested bold and italic emphasis uses the real upright bold face. Supplying the matching
bold italic face restores combined emphasis automatically.
A missing face or source fails the build instead of silently selecting a different family.
Fonts must be available to Hugo **before** the build, not injected into HTML afterward.

Set `useDefaultFonts = true` in page front matter or a cascade to keep Inter for an independent
section. Font profiles have distinct CSS cache/output keys, so default and custom pages can
coexist in the same multilingual build. Independent templates which do not use the theme's
shell remain unaffected.

A public repository may store configuration, checksums and loader code. Supply proprietary
font bytes from a private CI source after confirming web-use rights. A deployed web font is
necessarily downloadable by browsers; keeping its source out of Git is not access control
for the published asset. The theme's MIT license does not relicense site-supplied fonts.
