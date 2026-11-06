# Content components and advanced options

This page collects the optional Hugo Mini components. The [main README](../README.md) keeps the first-run setup short.

Add `{{< latest-posts count="3" >}}` to your homepage content to list the three newest articles automatically. Optional `archive` and `archiveLabel` parameters add a link below the list. See [content options](content.md) for details.

The [`project` shortcode](content.md#projects) displays a linked project name and a short description in the same minimal style. Optional `beauty-note` source links sit close to their description, with a larger gap between projects.

Custom pages can use the [`loading-skeleton` state](customization.md#loading-values) while fetching inline values; it preserves content space and follows the active theme.

[Reading lists](content.md#reading-lists) display site-owned book data in a compact two-column table with ordinary blog typography. Titles and authors can be localized while reading dates, ratings and review references remain shared. Recent book additions can update the New badge on both the book and its collection article.

Add [`github-stars`](content.md#github-stars) inside a description for a GitHub link with a subtle star count, fetched before the build and rendered without browser requests.

Use [`columns` and `column`](content.md#columns) to place content blocks side by side on desktop and stack them on mobile.

Use [`wavy-arrow`](content.md#wavy-arrow) for a thin inline SVG arrow between dates or other text.

Set [`params.notFoundYoda = true`](configuration.md#parameters) for an illustrated 404 page with a character-scan animation that respects reduced-motion preferences. The decorative figure fits the page without an internal scroll area.
