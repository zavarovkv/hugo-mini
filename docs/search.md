# Search

[Documentation](README.md) · [Deployment](deployment.md)

Mini uses [Pagefind](https://pagefind.app/) to search published pages in the reader's language. The index lives beside the site. Queries run in the browser and need no account or search service.

## Enable on an existing site

**The starter and demo have search enabled.** After installing the theme, run `npm ci` and `npm run dev` in the project root.

For an existing site, use Hugo Mini v4, Hugo Extended 0.146+ and Node.js 22.12+. If you use v3, follow the [upgrade guide](configuration.md#upgrade-from-v3-to-v4) first.

1. Install the indexer and commit the npm manifest and lockfile.

   ```bash
   npm install --save-dev --save-exact pagefind@1.6.0
   ```

2. Enable search in `hugo.toml`.

   ```toml
   [params]
   search = true
   ```

3. For a theme installed at `themes/hugo-mini`, add these scripts to the site's `package.json`. For a Hugo Module, use the build commands below.

   ```json
   {
     "scripts": {
       "dev": "node themes/hugo-mini/scripts/hugo-search.mjs dev",
       "build": "node themes/hugo-mini/scripts/hugo-search.mjs build"
     }
   }
   ```

## Build and preview

| Task | Command | What to expect |
| --- | --- | --- |
| Preview edits | `npm run dev` | Each successful Hugo rebuild refreshes the index from currently published pages, including edits and deletions. Wait for **Search index updated**, then reload an already-open page. |
| Preview drafts | `npm run dev -- --buildDrafts` | Draft pages render for review and stay out of search. |
| Publish | `npm ci`, then `npm run build` | A clean Hugo build followed by indexing. Deploy the entire output directory, including `pagefind/`. |

The helper forwards Hugo options such as `--baseURL https://example.org/blog/`. Development needs full disk rendering. Plain `hugo server` does not run Pagefind.

With Hugo Modules or a custom pipeline, install the pinned npm dependency and run these commands for a search-enabled site with published content. Adjust `public` if you use a different destination.

```bash
hugo --minify --cleanDestinationDir
npx --no-install pagefind --site public --root-selector 'main[data-pagefind-body]' --exclude-selectors '.heading-anchor, .footnote-backref, .copy-btn'
```

## What is searchable

The index includes titles and main text from published articles and standalone pages. Titles carry extra weight. Matches can link directly to a section.

| To exclude | Use |
| --- | --- |
| A page from local search only | `search = false` in page front matter |
| A page from listings as well | [`hidden = true`](content.md#front-matter) |
| A page from local search and the sitemap, with a noindex directive for crawlers | `noindex = true` |
| A block of authored HTML | `data-pagefind-ignore` on its wrapper |

Homepages, archives, taxonomy lists, 404 pages, drafts, future and expired pages, menus, footers and Mermaid source stay out of the index. A published page remains accessible by URL. JSON Feed is independent of search.

## Interaction and customization

- Open search from the header, the mobile menu, `Cmd/Ctrl+K` or `/` outside an editor. Use the arrow keys to select a result, Enter to open it and Escape to close.
- All matches appear in one list. Typing pauses briefly before searching, and previous results remain visible until the new list is ready.
- `showSearchButton = false` hides the triggers and keeps the shortcuts. Override `search_*` labels in your site's `i18n/`.
- CSS tokens include `--search-width`, `--search-placeholder`, `--search-highlight`, `--search-hover` and `--search-progress-color`.

## If a published page never appears

An unavailable index and a query with no matches show the same empty state. Editing the query, pressing Enter after a failure, or reopening search retries the request.

1. Check the page is published, uses the current language and meets the inclusion rules above.
2. Open `pagefind/pagefind-entry.json` under the site's base URL. It should return JSON. Locally, start `npm run dev` and wait for indexing. On a host, check that the build succeeded and uploaded `pagefind/` with the HTML.
3. For a restrictive Content Security Policy, allow same-origin modules and fetches, WebAssembly compilation (`'wasm-unsafe-eval'`) and workers (`worker-src 'self' blob:`). Search loads on demand and requires JavaScript and WebAssembly.

The helper clears a previous development index when search is disabled or the last eligible page disappears. A production build with search enabled requires at least one eligible page and fails if indexing fails. [Pagefind hosting guide](https://pagefind.app/docs/hosting/)
