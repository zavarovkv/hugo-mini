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

Files and the family/face description belong to the **site**. Font loading, preload hints,
role tokens and component styles belong to **Hugo Mini**. Native typography belongs to
**Beauty.css**. Changing the family does not change sizes, line heights, margins or widths.
The theme maps roles to `--font-weight-body`, `--font-weight-medium`, `--font-weight-bold`
and `--font-weight-title`, and bridges these to Beauty's existing typography tokens.

Only configured preloads are emitted on custom-font pages. File bytes are unchanged and
fingerprinted; `font-display: swap` keeps text visible during loading. The theme's Inter
files may still exist in the output, but custom-font pages do not preload or request them.
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
