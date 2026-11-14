# Content

Mini follows Hugo's regular content model. Put articles in the section selected by `params.mainSections`; `blog/` is a conventional choice.

## Front matter

```toml
+++
title = "A useful title"
slug = "useful-title"
date = 2026-08-17
description = "A concise summary."
categories = ["product"]
pinned = false
hidden = false
math = false
mermaid = false
wideCode = false
+++
```

`pinned` moves a post to the top of its category group. `hidden` removes it from listings, RSS, JSON Feed, and `llms.txt`, but the URL remains public and crawlable. Use `draft` for unpublished work. `telegram_post` is the positive numeric ID of a Telegram message, not its URL.

Set `noindex = true` to exclude an accessible page from search results. This is
independent of listing visibility. Draft previews and 404 pages also emit
`noindex`. Noindex pages and draft previews are omitted from the sitemap automatically;
hidden posts remain included. Set `[sitemap] disable = true` to omit an otherwise
indexable page from the sitemap without changing its robots metadata.

For content also published on another origin, set an absolute `canonicalURL` in
front matter. The theme uses it consistently in canonical links, Open Graph,
JSON-LD and translated `hreflang` links. Exclude the duplicate from this site's
sitemap with `[sitemap] disable = true`, and publish only canonical URLs in the
destination site's sitemap. Each language needs its own canonical URL.

Independent project landings may also set `seoSiteName` and `seoSiteURL` to their
project identity. They retain the site's author attribution but emit their own
`WebSite` data instead of a breadcrumb trail through the blog. These options do
not change visible navigation, content permalinks or the default site metadata.

If only the publication month is known, set `date` to the first day of that
month and `date_precision = "month"`. The visible article date uses the
localized month name and year (`февраль 2001` / `February 2001`) and its HTML
`datetime` uses `YYYY-MM`; sorting and structured metadata keep the full
`date` value. Without this field, articles show the known day, month and year,
including older articles (`2 января 2000` / `2 January 2000`).

## Typography

Homepages and single-page bodies receive language-aware prose spacing and
Russian punctuation rules during the Hugo build, without changing Markdown
sources. Set `typography = false` in front matter to disable this pass for a page.
Code and formulas are preserved; see [typography](typography.md)
([на русском](typography.ru.md)) for rules and fragment-level control.

## Printing

Use your browser's Print or Save as PDF command to get a clean, light-on-paper
version of an article, even when the site is in dark mode. The print layout keeps
the site name, article title, text, images and publication date; navigation,
sharing controls, comments and related-post widgets are omitted. Long code blocks
wrap instead of being clipped. Article text is 11 pt, page titles 22 pt and section headings 16 pt regardless of the viewport width. Class-based syntax highlighting prints in monochrome. The page layout uses print-only CSS and needs no extra setting or asset.

Mermaid rendering still requires JavaScript. The loader prioritizes nearby diagrams, then prepares offscreen diagrams and neutral print copies during idle time. Printing uses cached copies synchronously; if preparation has not finished or a download failed, the diagram source prints instead. Returning from print restores the screen theme.

## Article ending

Post metadata and sharing form one group, separated from the article by
`--post-footer-gap` (32 px). The internal gap is half that value (16 px);
Telegram discussion uses the full gap again. Missing sharing or comments leave
no empty group. The same layout serves every language and screen width.
Telegram owns the typography inside its iframe. Print keeps only the date,
24 px after the article; standalone pages have no post footer.

## Standalone resume

Set `layout = "resume"` on an ordinary content page to publish a CV without the
blog header or footer. The layout inherits the site's font profile and uses one
ink color for all text, links, metadata and rules: black in light mode and print,
white in dark mode. Hierarchy comes from type size, family and weight; the main
professional role uses the bold body face. It has no separate visible controls.
Its screen and print overrides live in `assets/css/resume.css`, minified and
fingerprinted separately and loaded only by this layout. Beauty still supplies
native typography; the resume stylesheet configures its tokens and document layout.
Section headings (`##`) have a 1 px trailing rule in the heading color, centered
vertically and extending to the end of the reading column, in both screen themes
and print. Job titles (`h3`) stay plain and use 20 px on screen,
below the 22–24 px section headings.
With `headingScroll = true`, section titles, their rules and company names
reuse the blog's click-to-align behavior, URL fragments and Option/Alt + Up/Down
navigation, without extra icons or link decoration. Short ASCII entry anchors
include the shortcode position so repeated company names have distinct targets
and long organization names do not exceed PDF destination-name limits.
Clicking the person's name returns to the top and clears the fragment, preserving
the path and query without reloading. Option/Alt + Up can reach the name too.
Keyboard navigation reaches every heading even when the last sections cannot
scroll to the top; manual scrolling resets navigation to the current viewport.
The back-to-top gutter is always omitted.
Use the native browser print command (`Cmd+P` / `Ctrl+P`) to print or save a PDF.
The content, links and printing also work without JavaScript.

```toml
+++
title = "Alex Example"
slug = "cv"
layout = "resume"
role = "Product Lead"
headingScroll = true
[[contacts]]
label = "alex@example.org"
url = "mailto:alex@example.org"
+++
```

Write the introduction and section headings as ordinary Markdown. Within an
introductory paragraph, `<span class="resume-mobile-paragraph">…</span>` starts a
new visual paragraph with the shared paragraph gap only on screens up to 600 px. Keep a space
before the span so desktop, print and copied text remain continuous.
Use Beauty's `beauty-nowrap` for short phrases that must stay together. Use
`resume-entry` for jobs, with a required `title` and optional
`period`, `role`, `location`, `url` and `site` (the visible URL label):

```markdown
## Experience

{{< resume-entry title="Example Company" period="2020 — present" role="Product Lead" >}}
A service used by many teams.

Objective
: Help teams find and share useful work.

Team
: Product managers and engineers across several teams.

#### Results {#example-results .resume-group-heading}

- Launched an accessible service.
- Built a product team.
{{< /resume-entry >}}
```

The body supports normal Markdown. For education, courses or mentoring records,
use a marker-free semantic list. An optional `subtitle` places the degree or
program directly below the institution:

```markdown
{{< resume-list >}}
{{< resume-item title="Example University" subtitle="Computer science" period="2010–2015" >}}
{{< resume-item title="Product Leadership" detail="Example Academy" period="2025" >}}
{{< resume-item title="Independent consultations" period="2025 — present" >}}
{{< /resume-list >}}
```

Each `resume-item` requires `title`; optional `detail` follows after a comma,
and `period` aligns at the right. On screens up to 600 px, the detail moves below
the title at 16/24 px, without the comma; desktop and print keep it inline.
Titles and details retain regular body weight, with titles at 17 px on screen;
subtitles use 16 px and remain in the text column. Dates use the
smaller metadata scale. Rows stack below 360 px and stay together
in print. Lists preserve native list semantics
without visible bullets. These records are not headings and add no extra
heading-navigation stops. For an ongoing course, keep the year in `period` and
put the status in `detail`, for example `detail="Example Academy — in progress"`
and `period="2026"`. Reserve “present” for current employment or activities.

Start an experience entry with a plain product description. Optional context
such as the objective and team uses a native Markdown definition list: the
label/value rows inherit the same 17/26 px screen reading scale as descriptions
and results. Labels receive a colon from CSS, so author them
without punctuation. Introduce results with a native heading such as
`#### Results {#example-results .resume-group-heading}`, followed by a normal
bullet list. Use level five (`#####`) when nesting results under a level-four
product heading. The shared group-heading style keeps the body text size and
places 1.5 paragraph spaces above and half a space below, visually joining the
heading to its list. These headings add no heading-navigation stops.
Bullet items use a compact 0.6em gap
and use a wider 2em indentation (34 px on screen, capped at 10% on narrow screens).
Print uses the same relative indentation with a 3pt item gap.
Screen paragraphs and list items use Beauty's `pretty` wrapping to reduce
isolated final words where the browser supports it, preserving native markers
and spacing. Dated-record titles use balanced lines; roles and longer
qualification/provider paragraphs keep `pretty` wrapping. Use a blank line
before each definition marker (`:`) when its value should render as a paragraph
and receive the same wrapping behavior.
Emphasize short outcome metrics selectively, leaving surrounding explanation
and long comparisons in regular weight, with sentence case and consistent
terminal punctuation. Multiple products can share one employer without repeating
its header. To distinguish those products, use native level-four headings such as
`#### Team workspace {#team-workspace .resume-product-heading}`. They retain
the bold body scale, with one paragraph gap below and 2.5 above;
they add no rules or heading-navigation stops. Use short, unique ASCII IDs
for reliable browser-PDF destinations. Product headings stay with following
content in print through Beauty's native heading rules.
Brief earlier roles can stay as ordinary prose.

Text within every job or dated record uses normal block flow: company/title,
role, qualification and stacked details retain Beauty's native paragraph
margins. Only the outer text/date columns use a grid, so a wrapped date cannot
stretch the space between text blocks. The shared `--beauty-space` controls
paragraph separation (0.75em on screen, 4pt in print). Related fields inside
each text group inherit half that space through `--resume-group-space`;
dated records use 1.5 times the paragraph space and jobs use 3.5 times it.
This groups company/role, institution/qualification and course/provider pairs
consistently. Line height controls wrapping inside a paragraph independently.
Trim only the final block's outer
margin at the group boundary, rather than resetting each field's margins.
Compact title/detail pairs remain inline on desktop and in print; if a record
also supplies a subtitle, all its fields retain block flow.

Keep dates as authored text to support partial dates and open-ended periods.
Each entry groups its bold organization name with a regular-weight role below.
The smaller period aligns with the name's first baseline at the right edge.
On screens from 360 to 600 px, ranges separated by an en or em dash put the end
date on a second line, with both dates aligned at their start inside the right
column. Desktop and print keep the authored range inline. Below 360 px, entries
stack in reading order: text group, period.
Optional location and website metadata form a paragraph in the text group; omit them when
they add no useful context. Print retains the two-column entry header.
Contacts appear at the upper right. Each requires `label`; omit `url` for plain
text, or provide a regular URL, `mailto:` or `tel:` link. Contact links retain
the surrounding color and weight, with no underline or hover decoration; the
pointer cursor and keyboard focus remain available. At 600 px and below, the
header uses a responsive 28–32 px name and a 17 px role. The left-aligned contact
row has two equal-width columns with a 24 px gap, 16 px above and 32 px below.
At 360 px and below, side padding is 16 px and the column gap is 4 px to give
contact text more room; longer labels can still wrap. Screen prose uses 17/26 px.
Below 320 px, contacts stack into a single column.
Print keeps the name and contacts side by side regardless of the screen width.
Screen pages end with 64 px of extra space; print has no extra bottom padding.

Section headings have 3.5rem above and 1.5rem below on screen; print uses 24pt
above and 14pt below, keeping the rules clearly separated from the preceding block.
Printing uses a named A4 page with 16 mm margins,
10.5 pt text, 24 pt name and 14 pt section headings. It always uses a light paper
palette. Entry headers and group headings stay with their text; result
bullets stay intact and the last two items of each job list stay together,
while long jobs can continue on the next page. Choose
**Save as PDF** and disable browser-added headers/footers for a clean copy.
Pagination depends on the selected fonts, content and print settings. There is
no generated PDF download or second content source to synchronize.

## Article keyboard navigation

On public articles, Option/Alt + Left opens the previous (older) article and
Option/Alt + Right opens the next (newer) article. The sequence uses publication
dates and the current language's `mainSections` collection. Pinning does not
change its order; hidden posts and draft previews are excluded. At either end,
the shortcut stops without wrapping or falling through to browser history.

No visible controls or shortcut hints are added. The handler ignores text
editing, composition, extra modifiers, held-key repeats, open dialogs and the
mobile menu. Standalone pages and listings retain their normal keyboard behavior.

## Categories

Categories are grouped on the section page. Add display names through i18n so slugs remain stable:

```toml
# i18n/en.toml
[cat_product]
other = "Product"
```

## Shortcodes

Markdown images from page bundles or `static/` receive `width` and `height` automatically for supported local raster formats (JPEG, PNG, GIF, and WebP). They stay responsive; the attributes reserve their aspect ratio before downloading. External images are never fetched during the build. Raw HTML `<img>` tags bypass Markdown hooks, so include their intrinsic `width` and `height` explicitly.

| Shortcode | Use |
| --- | --- |
| `caption` | Upright, start-aligned image description; `kind="credit"` selects an italic, end-aligned author/source credit |
| `image` | Semantic figure with intrinsic dimensions, an optional caption and opt-in wide layout |
| `callout` | Block quotation with Markdown content and the shared Beauty.css treatment |
| `mermaid` | Diagram source rendered by Mermaid; optional `wide=true` and `caption` |
| `plug` | Centered three-asterisk divider |
| `latest-posts` | Newest visible posts in the current language; `count="3"` by default |
| `featured-posts` | Hand-picked visible posts in the order set by `params.featuredPosts` |
| `project` | Linked project name with an external-link arrow, followed by a Markdown description |
| `github-stars` | Inline GitHub link with an optional, build-time star count |
| `columns` / `column` | Responsive columns; `column` groups Markdown and shortcodes into one column |
| `wavy-arrow` | Thin inline SVG arrow that follows the surrounding text color and size |
| `reading-list` | Localized book records from a site-owned data file |

Enable KaTeX with `math = true` and Mermaid with `mermaid = true` only on pages that use them. Native Markdown `##` and `###` headings receive copyable anchor links automatically.

### Wide images

```text
{{< image src="/images/certificate.webp" alt="Course certificate" wide=true caption="Certificate received after the course." >}}
```

`src` and `alt` are required (an empty `alt` is valid for decorative images). Local raster
dimensions are read automatically; for SVGs, external or otherwise unreadable sources, provide
positive `width` and `height`. External files are never fetched during the build. `caption`
accepts Markdown; `kind="credit"` selects the same source-credit treatment as `caption`.
An ordinary `image` stays within the text column; `wide` accepts only `true` or `false`.

A wide figure directly inside an article keeps the text's inline-start edge and expands toward
the inline end above 768 px. Its width is capped by `--article-wide-width` (default `60rem`,
960 px), the source width and available viewport space, with `--article-edge-gap` (24 px).
JavaScript measures the available viewport space after resize, font/image loading or other
article layout changes. Without JavaScript, the CSS fallback still expands images.
Mobile, nested figures and print retain the normal column width. Captions remain
at the reading measure; Beauty owns their typography and rhythm.

### Wide diagrams

Use `{{< mermaid wide=true caption="How the parts connect" >}}` around the usual
Mermaid source, with the existing `{{< /mermaid >}}` closing tag. `wide` accepts only
`true` or `false`; `caption` accepts Markdown. Set `mermaid = true` in front matter as
usual. Calls without either option keep their original plain `pre` markup.

The optional figure shares the image layout: the text's inline-start edge, up to
960 px within the available viewport space. SVGs remain vector images and keep their aspect ratio. Mobile and print fit the
column; unavailable JavaScript or diagram downloads leave the source readable.
Captions use the same Beauty class, size, color, alignment and gap as image captions,
and stay within the text measure. Theme switching and cached print copies are unchanged.

### Wide code blocks

Set `wideCode = true` in an article's front matter to let long fenced code blocks
use the same free space as wide images. Short examples retain the text-column width;
long examples use the full wide measure from `--article-wide-width`
(default 960 px), limited by the viewport edge.
Only direct article blocks expand; nested code stays within its container. This is opt-in
per page.

Keep ordinary fenced Markdown and existing highlighting options. Font size, source,
line numbers and the copy button stay unchanged. Longer lines still scroll inside the
code block, including on mobile; screen code never wraps automatically. JavaScript detects
overflow at the reading width after layout/font changes and selects one of these two widths. Without JavaScript, code stays in the text column with native
scrolling.
Print uses the existing column-width, wrapping code treatment. Geometry belongs to
Mini; native code typography remains in Beauty.css.

### Captions and heading links

With `headingScroll = true`, H1/H2 text becomes the anchor, without an extra icon. Clicking
the heading aligns it to the viewport top and updates the URL fragment. The page
title uses `#page-title`; section IDs remain stable and H3 keeps copy links.
Option/Alt + Up/Down moves between H1/H2, without wrapping or intercepting editing
controls and open menus/dialogs. Tab focuses a text anchor; Enter/Space activates it.
See [typography](typography.md#heading-scroll-controls).

Use `{{< caption >}}What the image shows{{< /caption >}}` for an explanation, or
`{{< caption kind="credit" >}}Photo: the author{{< /caption >}}` for a short attribution.
The optional `kind` accepts `description` (default) or `credit`; unknown values fail the
build. Both modes share Beauty's caption size and image gap. The role is explicit,
never guessed from names or punctuation. Legacy `.caption` markup follows the ordinary
description treatment; add `beauty-caption-credit` for an attribution.

Heading classes are preserved: `## Projects {.posts-group-title}` uses the same compact typography as category headings on the blog listing while retaining its heading level and anchor link.

Add `.no-anchor` to omit the copy link on an individual heading, for example `## Projects {.posts-group-title .no-anchor}`. The heading keeps its ID for direct links.

## Wavy arrow

Place `{{< wavy-arrow >}}` between dates or other inline text:

```text
From 2021 {{< wavy-arrow >}} 2025, I taught product management.
```

The arrow has a fine rounded stroke that flows through one small, elongated loop into a straight tail and a compact open arrowhead. It uses `currentColor`, has no animation, and scales with the text (36px wide at a 16px font size), with its tip aligned to the middle of adjacent numerals. Its screen-reader label defaults to the localized `wavy_arrow_to` string ("to" in English, "по" in Russian); set `label="until"` to override it. The `--wavy-arrow-width` and `--wavy-arrow-height` CSS tokens default to `2.25em` and `1.125em`.

## Homepage introduction

A homepage can begin with a single native Markdown H1. It uses the configured
title typeface at 28 px on desktop and 24 px on mobile, with a 24 px gap before
the following text. Homepage paragraphs use a compact 12 px interval. Beauty's
tokens provide the native type treatment, margins and responsive wrapping.
On desktop screens above 768 px, homepage columns begin 64 px after the introduction;
mobile and print retain the shared 56 px section gap. The homepage-scoped token
applies to every language without changing footer spacing.

Compact content modules share three theme tokens: `--content-detail-gap` (8 px)
for related fields, `--content-item-gap` (12 px) for paragraphs, listing items
and module heading-to-content gaps, and `--content-group-gap` (24 px) for separate
projects and the archive link after a list. These are independent of line height
and the larger section gaps. Ordinary article paragraphs keep their reading rhythm.

## Latest articles

Place `{{< latest-posts count="3" >}}` in your homepage `_index.md` wherever the list belongs. It follows `params.mainSections`, sorts by date, and excludes hidden posts. Hugo also excludes drafts and future posts in normal production builds. Pinned posts retain their date order here; pinning applies only to category listings. With no posts, nothing is rendered.

Titles in article listings use ordinary line wrapping through Beauty's shared
token, filling the available column without prose widow prevention.

Set `archive` to the article-listing URL to add a link below the list. `archiveLabel` sets its text (defaults to the localized "Articles" label). The link uses medium weight, matching project names, with the same underline geometry as ordinary content links. Its fine SVG arrow inherits the link color and moves slightly right on pointer hover or keyboard focus, without shifting the text; reduced motion disables the movement. Article-list links remain light. Internal page URLs resolve to the current language when available.

```text
{{< latest-posts count="3" archive="/blog/" archiveLabel="All articles" >}}
```

## Featured articles

Use `featured-posts` to introduce readers to selected articles in an explicit order.
Add their content paths to the existing `[params]` table in your site configuration:

```toml
[params]
  featuredPosts = [
    "/blog/first-steps",
    "/blog/what-i-learned",
    "/blog/useful-tools",
  ]
```

These are Hugo content paths, not published URLs or slugs. For example,
`content/en/blog/first-steps.md` uses `/blog/first-steps`, even if its public URL
is `/en/getting-started/`. Omit the content directory, language directory and
file extension. The same list resolves within each current language; to choose
different articles or order for a language, set `featuredPosts` under
`[languages.<lang>.params]` instead.

Replace `latest-posts` in the homepage `_index.md` with:

```text
{{< featured-posts archive="/blog/" archiveLabel="All articles" >}}
```

The list keeps the configured order and includes each article once. Only visible
posts from `params.mainSections` in the current language are eligible. Missing
pages, unavailable translations, hidden posts and pages outside those sections
are skipped; Hugo also excludes drafts and future posts in normal production
builds. With no available selections, the entire block is omitted, including its
heading and archive link. It does not fall back to recent posts.

The heading is localized through `featured_posts`: **Featured articles** in English
and **Избранные статьи** in Russian. Layout and the optional `archive` /
`archiveLabel` link match `latest-posts`. The configured list controls the number
of articles, so no `count` is needed. Selecting articles does not change their
dates, category pinning, feeds or the behavior of `latest-posts`.

## Columns

Use `columns` to display two equal columns above 768px and a single column on smaller screens. Each direct child block forms a column: `latest-posts` and `featured-posts` each render one block, while `column` groups Markdown and nested shortcodes into one block. Spacing after and between stacked blocks uses the same `--section-gap` token as article-listing groups; both layouts share `--columns-gap` horizontally. The larger space before the columns and the footer uses `--section-gap-large`. Content order stays the same for keyboard navigation and screen readers.

Module headings use `posts-group-title`: their gap to the first list or project
uses `--content-item-gap`. The containing module supplies external
spacing, so heading margins do not add extra space at the start of a column.

```text
{{< columns >}}
{{< latest-posts count="3" >}}
{{< column >}}
## Projects {.posts-group-title .no-anchor}

A short introduction to your projects.
{{< /column >}}
{{< /columns >}}
```

## Projects

Local project icons use content-versioned URLs, shared with header logos and favicons, so changing an image refreshes cached copies after a rebuild. External icon URLs retain their original behavior.

Use the `project` shortcode below a section heading. The name links to an external project page; the description accepts Markdown and keeps links at the same weight as the body text. Optionally set `icon` to a local image path and `iconDark` to its dark-mode variant. The mark becomes a separate, keyboard-accessible button: clicking it spins the logo a few times and gradually slows to a stop without opening the link. The project name remains a normal link. Motion preferences are respected; without JavaScript, the mark remains decorative.

The name's external-link arrow shares the archive arrow's fine stroke and proportions,
rotated diagonally. It moves slightly up and right on pointer hover or keyboard focus
without moving the text; reduced motion keeps it stationary. This CSS effect is independent
of the optional logo button.

For a separate secondary source link, put it in a `<p class="beauty-note">` inside the description. Titles, description paragraphs and notes share the 8 px detail gap; adjacent projects use the 24 px group gap. Descriptions retain native paragraph flow through Beauty's spacing token, including when they contain several paragraphs. Note text size and color come from Beauty.css.

```text
{{< project name="My project" url="https://example.com/" >}}
A short description. Source code on [GitHub](https://github.com/example/project).
{{< /project >}}

{{< project name="My other project" url="https://example.com/" icon="images/mark-light.svg" iconDark="images/mark-dark.svg" >}}
A project with a small, clickable mark that matches the selected color scheme.
{{< /project >}}
```

## GitHub stars

Use `github-stars` wherever an inline repository link fits, including inside a project description:

```text
Source code on {{< github-stars repo="example/project" >}}.
```

The link shows a thin outlined star and an exact count, with a localized accessible label. Optional `label` replaces the default "GitHub" text. Without data it remains a normal repository link; zero is displayed as a valid count.

From the consuming site's root, fetch counts before starting Hugo or building:

```bash
node themes/hugo-mini/scripts/fetch-github-stars.mjs example/project
hugo --minify
```

The helper accepts multiple `owner/repo` arguments and writes `data/github_stars.json`. Public repositories need no token; optional `GITHUB_TOKEN` or `GH_TOKEN` is used only by the helper. Outside CI it also reuses an existing GitHub CLI login, if available, to avoid the lower anonymous rate limit. Credentials are never printed or saved. Each request has a ten-second timeout. API failures preserve previous counts, or omit an unavailable counter, while invalid local data and write errors fail normally. Unchanged counts do not rewrite the file. Commit this data file if you want a fallback available in fresh checkouts.

Run the helper before every production build to update automatically on deploy. A scheduled rebuild can refresh counts between content updates. Hugo itself uses the local data only, so builds and browsers remain independent of GitHub availability.

## Reading lists

Store a collection in a site-owned data file, for example `data/books.toml`:

```toml
[[items]]
id = "example"
title = "Book title"
author = "Author"
year = 2026
read = "2026-10"
added = "2026-10-25"
rating = 8.5
review = "/blog/review-example"
```

On the collection article, set `reading_list = "books"` in front matter and
insert `{{< reading-list >}}`. The shortcode renders a two-column table in the
theme's normal typography, newest reading month first. The first column shows
each title above its author, publication year and rating; reading months align on the right.
Long titles and author lists wrap within their column on narrow screens.
The table retains a 20em minimum width on mobile and scrolls horizontally inside
a labeled, keyboard-accessible `beauty-scroll` container when needed.
Title-to-metadata spacing follows a third of the shared paragraph interval; the gap
between records is larger, at 1.25 intervals. Both column labels share the theme's heading
weight and color, with a single rule beneath the header and a section gap after
the table. The table uses the
shared stylesheet, with no extra scripts or network requests.

`id`, `title`, `author` and `read` (YYYY-MM) are required. Optional
`year` is the publication year, `rating` is a number from 0 to 10, and
`review` is a Hugo content reference. Missing ratings are omitted; zero is
displayed. Interface labels and number formatting follow the current page language.

Optional per-language display strings belong to the same record:

```toml
[items.translations.en]
title = "English edition title"
author = "Author's published name"
```

Only `title` and `author` are localized; IDs, reading dates, publication years,
ratings, addition dates and review references stay shared. Missing translated
strings fall back to the original. Use published titles or retain the original
when no translated edition has been confirmed.

Optional `added` is an ISO date or timestamp. Recent additions give both the
book and its collection article the standard New badge for `newPostDays`
days. A collection's publication date does not activate its badge. Historical
imports can omit `added`; future additions do not activate badges early.
`newPostDays = 0` disables badges. The latest addition also advances the
collection's modification date in SEO metadata, its JSON feed and sitemap
without changing its publication date or moving unrelated posts.

Reviews are ordinary Markdown articles with the theme's existing templates
and typography. Content references resolve in the current language and work
under a base path. A review can use `hidden = true` to stay out of listings
and feeds while remaining indexable and included in the sitemap.

### Explicit fractions

Use `{{< fraction "1/3" >}}` inline for a real fraction. The shortcode accepts one
`numerator/denominator` string of nonnegative integers with a nonzero denominator.
Beauty composes a smaller, raised numerator and a smaller denominator from the same
font, without requiring fraction glyphs or changing the copied numerator/slash/denominator text. Scores, dates, URLs and formulas
are not auto-detected. See [typography](typography.md#opening-quotes-numerals-and-fractions)
for hanging quotes and optional prose figures.

### Enlarged author statements

Use `<p class="beauty-lead">A concise definition or thesis.</p>` for an author's
own statement in the enlarged body face, without quotation marks or a line.
The shared theme spacing is 32 px before and 48 px after on screen; print retains
ordinary paragraph spacing. See [typography](typography.md#quotations-and-attributions).
