# Contributing to Mini

[Documentation](docs/README.md) · [Issues](https://github.com/zavarovkv/hugo-mini/issues) · [Changelog](CHANGELOG.md)

<a id="reporting-issues"></a>

For a bug report, include `hugo version`, a minimal reproduction, and expected versus
actual behavior. For code or documentation changes, follow the workflow below.

## Design Principles

- Keep the theme minimal, fast and useful without required configuration.
- Prefer CSS; use JavaScript only where browser behavior needs it.
- Self-host critical assets and keep optional integrations optional.
- Put native typography in Beauty.css; keep layout, UI and token configuration in Mini.

## Local Development

Requires Hugo Extended 0.146.0+. From the theme root:

```bash
git clone https://github.com/zavarovkv/hugo-mini.git
cd hugo-mini
hugo server -s exampleSite --themesDir ../..
```

Open `http://localhost:1313/`. Ordinary demo builds do not need npm.

## Submitting Changes

1. Fork the repository and create a focused feature branch.
2. Make the change; update related documentation and `CHANGELOG.md` for public behavior.
3. Run the checks appropriate to the change below.
4. Open a pull request explaining the problem, resulting behavior and validation.

### Unit and build checks

From the theme root, using Node.js 22.12+:

```bash
npm test
hugo -s exampleSite --themesDir ../.. --minify --panicOnWarning
```

Unit checks include documentation links and README language consistency. The example
build must emit nonempty HTML, RSS, JSON Feed, `llms.txt` and sitemap outputs,
including `ru/index.json` and `ru/llms.txt`.

### Browser checks

For layout, JavaScript or Mermaid changes:

```bash
npm ci
npx playwright install chromium webkit
npm run test:browser
```

Each run builds an isolated fixture and starts its own server. Chromium and WebKit
cover tables, complex footnotes, keyboard navigation, color schemes, diagrams and
synchronous print behavior; Chromium also generates a PDF. Diagram fixtures include
animated edges, modern shapes, delayed/failed downloads and rapid theme changes.
CI runs against the minimum and latest supported Hugo versions.

| Optional variable | Use |
| --- | --- |
| `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome` | Use installed Chrome locally. |
| `PLAYWRIGHT_PORT` | Choose another test-server port. |
| `BROWSER_HUGO_CONFIG` | Comma-separated config paths for a consuming site's font profile. |

Consuming sites can reuse `tests/browser/contracts.mjs` and
`browserConfig({ site: true })`. The server copies the real site into a temporary
directory and adds only fixtures/local Mermaid. Do not commit private fonts or
upload them with public test artifacts.

Check affected pages on mobile and desktop, in both color schemes and with a keyboard.
For documentation-only changes, link/language checks and any changed command examples
are sufficient; browser tests are not needed.

### README translations

Update `README.md` and `README.ru.md` **together**, including links, badges, images,
commands and feature descriptions. Keep both language switchers working and use
absolute HTTPS image URLs for the Hugo Themes gallery.

The typography authoring guides and visual references also have EN/RU pairs; update
each pair together. Other guides are in English. Russian documentation uses `е` / `Е`
in place of the dotted variants.

### README preview

The animation pairs dark desktop and light mobile screenshots of the deployed demo
on a transparent canvas, without decorative frames, shadows or labels.
To regenerate it, install the development dependencies, Playwright Chromium and
ImageMagick 7 (`magick` on your path), then run from the theme root:

```bash
node scripts/render-readme-preview.mjs
```

The script prints the temporary directory containing captures, scene previews and
frames. Only the final GIF goes in `images/`; licensed font files are never copied.
Use `--url http://127.0.0.1:1313/` to capture a local demo instead. For composition
changes, reuse a printed directory with `--work-dir <directory> --reuse-captures`;
`--stills-only` renders the three scenes without encoding the animation.

Review the text, mobile menu, loop boundary and transparency on light and dark backgrounds.
When replacing the preview, use a new versioned filename with
`--output images/readme-preview-v8.gif` and update both
READMEs' absolute image URLs and alt text.
The default public demo uses the separately licensed fonts described below the image.

### Documentation conventions

- Keep READMEs brief; route readers through [the documentation home](docs/README.md).
- Give each guide one primary task or reference role. Put prerequisites before steps and options beside their examples.
- Prefer short paragraphs, descriptive links and compact comparison tables. Move detailed visual contracts to the reference rather than repeating them.
- Preserve existing paths and heading anchors when moving sections; leave a link to the new location.
- Keep installation commands, version requirements and EN/RU examples synchronized with code.

## Project Structure

Hugo 0.146+ templates use `_partials`, `_shortcodes` and `_markup` with leading underscores.

| Path | Responsibility |
| --- | --- |
| `layouts/baseof.html` | Shell and named blocks |
| `layouts/home.html`, `list.html`, `single.html`, `404.html` | Main page layouts |
| `layouts/home.json`, `home.llms.txt` | JSON Feed and crawler text |
| `layouts/_partials/` | Header/footer, metadata, OG images, integrations and extension hooks |
| `layouts/_markup/` | Heading, image, link and table render hooks |
| `layouts/_shortcodes/` | [Content components](docs/advanced-features.md#articles-and-components) |
| `assets/css/beauty.css` | Generated foundation; never edit by hand |
| `assets/css/main.css` | Theme tokens, fonts, layout and UI |
| `assets/js/main.js` | Browser behavior |
| `i18n/`, `exampleSite/`, `archetypes/` | UI translations, bilingual demo, content scaffolding |
| `scripts/`, `tests/` | Optional helpers, asset maintenance and regression checks |

Hugo Pipes bundles/minifies/fingerprints CSS and JavaScript. Avoid extra stylesheets
or inline style blocks in shared templates. Configure Beauty's public tokens in
`main.css` and refresh the foundation only through the
[vendoring helper](docs/vendor-assets.md#beautycss-foundation).

CI and release actions are pinned to immutable SHAs and use the Node.js 24 action
runtime. Checkout credentials are not persisted; releases use a job-scoped token
explicitly through `gh`. This is separate from the Node.js requirement for local tools.
