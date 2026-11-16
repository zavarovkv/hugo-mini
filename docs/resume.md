# Resumes

[Documentation](README.md) · [Writing content](content.md) · [Fonts](fonts.md)

Publish a CV from one Markdown file, then print or save the same page as a PDF.
The resume layout has no blog header, footer, back-to-top gutter or visible controls.

[Create a CV](#create-a-cv) · [Experience](#experience) · [Education](#education-courses-and-mentoring) · [Print](#print-or-save-as-pdf) · [Layout reference](#layout-reference)

## Create a CV

Create `content/cv.md` with this front matter:

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

Write the introduction and `##` section headings as ordinary Markdown.
Each contact needs a `label`; `url` is optional, so plain text, web links,
`mailto:` and `tel:` links all work.

For an introduction that needs an extra paragraph only on mobile, wrap its second
part in `<span class="resume-mobile-paragraph">…</span>`. Keep a space before the
span so desktop, print and copied text remain continuous. Use `beauty-nowrap` for
short phrases that must stay together.

## Experience

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

| `resume-entry` option | Use |
| --- | --- |
| `title` | Required company or organization name |
| `period` | Optional dates, displayed as authored |
| `role`, `location` | Optional context below the name |
| `url` | Optional organization link |
| `site` | Optional visible label for that link |

Start with a plain product description. Optional context uses native Markdown
definition lists: write labels without a colon, because CSS supplies it. Add a
blank line before `: value` when the value needs paragraph markup.

Use `.resume-group-heading` for results and `.resume-product-heading` for a
product subsection. Keep IDs unique and ASCII. Results normally use `####`; nest
`#####` under a level-four product heading. These headings keep the body text
size and do not add navigation stops or section rules.

## Education, courses and mentoring

```text
{{< resume-list >}}
{{< resume-item title="Example University" subtitle="Computer science" period="2010–2015" >}}
{{< resume-item title="Product Leadership" detail="Example Academy" period="2025" >}}
{{< resume-item title="Independent consultations" period="2025 — present" >}}
{{< /resume-list >}}
```

| `resume-item` option | Use |
| --- | --- |
| `title` | Required institution, course or activity |
| `subtitle` | Optional degree/program below the title |
| `detail` | Optional detail after a comma; separate line on mobile or when a subtitle is present |
| `period` | Optional right-aligned date |

Records form a semantic list without visible bullets. They are not headings,
so they add no navigation stops. For an ongoing course, use a year in `period`
and put “in progress” in `detail`; reserve “present” for current work or activities.

## Heading navigation

With `headingScroll = true`:

- Click a section title, its trailing rule or a company name to align that heading.
- Use Option/Alt + Up/Down to move through the name, sections and entries.
- Click the person's name to return to the top and clear the URL fragment without reloading or losing the query string.

Entry anchors are short ASCII IDs that include the shortcode position, keeping
repeated company names distinct and PDF destination names short. Navigation still
reaches final sections when the page cannot scroll farther; manual scrolling
resets it to the viewport. Content, links and printing also work without JavaScript.

## Print or save as PDF

1. Open the CV and use **Cmd+P** / **Ctrl+P**.
2. Select A4 and disable browser-added headers/footers for a clean copy.
3. Print or save as PDF.

The named A4 layout uses 16 mm margins, 10.5 pt body text, a 24 pt name and
14 pt section headings. It always prints light-on-paper. Name/contacts and
entry/date columns remain side by side.

Headings stay with following content, education records stay together, and
bullets plus the last two items of a job are kept together where possible.
Long jobs may span pages. Exact pagination depends on fonts, content and printer
settings; there is no separate PDF source to synchronize.

## Layout reference

The CV inherits your font profile and uses one ink color: black in light mode
and print, white in dark mode. Name and role use bold faces; hierarchy comes
from type size, family and weight. Links retain pointer and keyboard-focus behavior
without hover underlines.

### Type and responsive behavior

| Element | Screen | Narrow screens / print |
| --- | --- | --- |
| Body, definitions, results | 17/26 px | Print: 10.5 pt |
| Name | Display title | Up to 600 px: 32–36 px; print: 24 pt |
| Main role | `1.125em` (19.125 px at the default scale) | Same relative screen size |
| Section headings | 22–24 px with a centered 1 px trailing rule | Print: 14 pt, rule retained |
| Company headings | 20 px, no rule | Date remains in its own column in print |
| Education titles / details | Regular weight; title 17 px, subtitle 16 px | Up to 600 px: detail on a new line at 16/24 px, without comma |
| Dates | Smaller metadata scale, aligned with the first text baseline | 360–600 px: date ranges may break after the dash; below 360 px: text then date |
| Contacts | Right of the name | Up to 600 px: two columns, 24 px gap, 16 px above and 32 px below; below 320 px: one column |

At 360 px and below, side padding is 16 px and the contact-column gap is 4 px.
Screen overrides are in `assets/css/resume.css`, loaded only by this layout.
Beauty supplies native typography; the theme supplies layout and token values.

### Spacing

| Relationship | Screen default | Print |
| --- | --- | --- |
| Paragraph unit (`--beauty-space`) | `0.75em` | 4 pt |
| Related field group (`--resume-group-space`) | Half a paragraph unit | Same relative rhythm |
| Dated records | 1.5 paragraph units | Same relative rhythm |
| Jobs | 3.5 paragraph units | Same relative rhythm |
| Product heading, before / after | 2.5 / 1 paragraph units | Keeps following content |
| Results heading, before / after | 1.5 / 0.5 paragraph units | Keeps following list |
| Bullet item gap | `0.6em` | 3 pt |
| Bullet indentation | `2em` (34 px), capped at 10% | Same relative indentation |
| Section, before / after heading | 56 / 24 px | 24 / 14 pt |
| Page bottom | 64 px | No extra padding |

Text uses normal paragraph flow; only outer date alignment uses a grid. Paragraph
spacing is independent of line height, and trailing block margins are trimmed
so adjacent entries do not accumulate extra gaps.
