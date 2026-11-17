# Search

[Documentation](README.md) · [Configuration](configuration.md) · [Deployment](deployment.md)

Mini uses [Pagefind](https://pagefind.app/) for full-text search. Hugo renders the
pages; Pagefind indexes that HTML after each build. The dialog inherits the site's
fonts and colors, highlights matches and links to relevant article sections.
Results stay in the current language. No service, API key or search server is needed.

## Enable on an existing site

Use a theme revision that includes search. From your **site root**, with Node.js
22.12+ and Hugo Extended 0.146+ installed:

```bash
npm install --save-dev --save-exact pagefind@1.6.0
```

Merge into your Hugo configuration:

```toml
[params]
search = true
```

For a submodule at `themes/hugo-mini`, merge these scripts into `package.json`:

```json
{
  "scripts": {
    "dev": "node themes/hugo-mini/scripts/hugo-search.mjs dev",
    "build": "node themes/hugo-mini/scripts/hugo-search.mjs build"
  }
}
```

Run `npm run dev` locally and `npm run build` for publication. Commit the npm
manifest and lockfile. The [starter](../starter/README.md) includes this setup.
Search is opt-in for other sites; `search = false` keeps ordinary Hugo-only builds.

## Build and preview

The helper runs Hugo with full disk rendering, then Pagefind. Production builds
remove stale output and recreate the index; development rebuilds reindex after
Hugo finishes, including additions, edits and removals. Development indexes an
HTML snapshot selected by `hugo list published`, so stale server files cannot
keep removed pages searchable. It rebuilds on every
successful Hugo build, not only when a content hash changes. Hugo flags pass through:

```bash
npm run dev -- --buildDrafts
npm run build -- --baseURL https://example.org/blog/
```

For Hugo Modules or your own build pipeline, run the equivalent two steps after
installing Pagefind in the site:

```bash
hugo --minify --cleanDestinationDir
npx --no-install pagefind --site public
```

Use the actual destination if it differs from `public`. With plain `hugo server`,
rerun Pagefind after content edits; the helper automates this. Do not enable
`--renderToMemory` or `--renderStaticToDisk` with the helper. During development,
the new index is ready when the terminal prints **Search index updated**; reload
the page to use the new index in an already-open browser.

On CI/hosting, run `npm ci` before the build and publish **all** of `public/`,
including `pagefind/`. Use `npm run build` as the hosting build command when the
helper is installed. Missing indexes show a retry message; a failed production
index build fails the command. The demo and Vercel starter already include this step.

## What is searchable

| Content | Included |
| --- | --- |
| Published articles and standalone pages | Yes: title and main text; titles have extra weight |
| Home, archives, taxonomy lists and 404 | No |
| `hidden = true`, `noindex = true`, `search = false` | No |
| Drafts, future/expired pages and `layout = "resume"` | No, including draft previews |
| Menus, footer, sharing controls and Mermaid source | No |

Set `search = false` in a page's front matter to exclude it only from local search.
To omit a block in authored HTML, add `data-pagefind-ignore` to its wrapper.
Exclusion is not access control: a published page remains reachable by its URL.
The site's existing JSON Feed is independent of this index.

## Interaction and customization

- Open with the header magnifier, the mobile menu, `Cmd/Ctrl+K` or `/` outside an editor.
- Use arrows to move through results, Enter to open, Escape to close and Tab for controls.
- Results load eight at a time; **Show more** keeps the current query and position.
- Search fills the screen; its contents follow the blog column. Mobile adapts to the on-screen keyboard.
- `showSearchButton = false` hides header triggers; keyboard shortcuts remain available.
- Override `search_*` strings in your site's `i18n/`. English and Russian are bundled.
- Theme CSS exposes `--search-width`, `--search-highlight` and `--search-hover`.

JavaScript and WebAssembly are required for search. Controls stay hidden when
JavaScript is disabled. The engine and fragments load from the same site only
when search opens; no query is sent to a search service. A restrictive CSP needs
to allow local modules/fetches, WebAssembly compilation (`'wasm-unsafe-eval'`)
and Pagefind workers (`worker-src 'self' blob:`).
For language support and hosting details, see [Pagefind's multilingual guide](https://pagefind.app/docs/multilingual/)
and [hosting troubleshooting](https://pagefind.app/docs/hosting/).
