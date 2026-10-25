import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp, mkdir, symlink, writeFile, readFile, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";

const theme = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stamp = (days) => new Date(Date.now() + days * 86400000).toISOString().replace(/\.\d{3}Z$/, "Z");
const recent = stamp(-1);
const future = stamp(1);
const old = stamp(-90);

async function fixture(t, basePath = "/") {
  const root = await mkdtemp(join(tmpdir(), "mini-reading-"));
  t.after(() => rm(root, {recursive: true, force: true}));
  for (const dir of ["themes", "data", "content/en/notes", "content/ru/notes"]) await mkdir(join(root, dir), {recursive: true});
  await symlink(theme, join(root, "themes/hugo-mini"), "dir");
  const baseURL = `https://example.org${basePath}`;
  await writeFile(join(root, "hugo.toml"), `baseURL="${baseURL}"
title="Fixture"
theme="hugo-mini"
defaultContentLanguage="en"
disableKinds=["taxonomy","term"]
[params]
mainSections=["notes"]
socialSharing=false
recentSidebarCount=0
newPostDays=30
[outputs]
home=["HTML","RSS","JSON"]
[permalinks]
notes="/:slug/"
[languages.en]
contentDir="content/en"
weight=1
[languages.ru]
contentDir="content/ru"
weight=2
`);
  for (const lang of ["en", "ru"]) {
    await writeFile(join(root, `content/${lang}/notes/library.md`), '+++\ntitle="Reading shelf"\nslug="library"\ndate=2001-01-01\nreading_list="fixture"\n+++\n{{< reading-list >}}\n');
    await writeFile(join(root, `content/${lang}/notes/review.md`), '+++\ntitle="Review title"\nurl="books/legacy_review/"\ndate=2001-01-01\nhidden=true\n+++\nAn original review.\n');
    await writeFile(join(root, `content/${lang}/notes/article.md`), '+++\ntitle="Ordinary article"\nslug="article"\ndate=2001-01-01\n+++\nAn old article.\n');
  }
  const dataset = (added = recent) => `[[items]]
id="old"
title="Original book title"
author="Original author"
year=1969
read="2021-07"
rating=8.5
review="/notes/review"
[items.translations.en]
title="English book title"
author="English author"
id="do-not-change-the-canonical-id"
review="/notes/missing-review"
added="2100-01-01"
[[items]]
id="recent"
title="Recent book"
author="Another author"
read="2026-01"
added="${added}"
[[items]]
id="future"
title="Future book"
author="Future author"
read="2026-02"
rating=0
added="${future}"
`;
  const dataFile = join(root, "data/fixture.toml");
  await writeFile(dataFile, dataset());
  return {
    root, baseURL, dataset, dataFile,
    build() {
      execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], {stdio: "pipe"});
    },
    read(path) { return readFile(join(root, "public", path), "utf8"); },
  };
}

const badges = (html) => (html.match(/class=(?:"badge-new"|'badge-new'|badge-new)(?:[\s>])/g) || []).length;

for (const basePath of ["/", "/sub/"]) {
  test(`reading lists preserve links, indexing and data-driven dates at ${basePath}`, async (t) => {
    const site = await fixture(t, basePath);
    site.build();
    for (const lang of ["en", "ru"]) {
      const prefix = lang === "en" ? "" : "ru/";
      const shelf = await site.read(`${prefix}library/index.html`);
      assert.equal(badges(shelf), 1, "only a recently added book gets New; old and future books do not");
      assert.ok(shelf.includes(`${basePath}${prefix}books/legacy_review/`));
      assert.ok(shelf.includes(lang === "en" ? "English book title" : "Original book title"), "the link uses the localized book title");
      assert.ok(shelf.includes(lang === "en" ? "English author" : "Original author"));
      assert.ok(shelf.includes('id="book-old"') || shelf.includes("id=book-old"), "translations cannot replace shared metadata");
      assert.ok(shelf.includes(lang === "en" ? "8.5" : "8,5"));
      assert.ok(shelf.includes(lang === "en" ? "0.0" : "0,0"), "zero is a real rating, not a missing value");

      const listing = await site.read(`${prefix}notes/index.html`);
      assert.equal(badges(listing), 1, "adding a book refreshes the shelf badge without changing its publication date");
      assert.ok(!listing.includes(`${prefix}books/legacy_review/`), "reviews stay inside the shelf navigation");
      const review = await site.read(`${prefix}books/legacy_review/index.html`);
      assert.ok(!review.includes("07.2021"), "reviews use ordinary Markdown without book metadata headers");
      assert.ok(!review.includes(`${basePath}${prefix}library/#book-old`), "book details contain no shelf backlink");
      assert.ok(review.includes("index, follow"), "hidden controls listings, not search indexing");
      assert.ok(!review.includes("noindex"));

      const feed = JSON.parse(await site.read(`${prefix}index.json`));
      const entry = feed.items.find(({url}) => url === `${site.baseURL}${prefix}library/`);
      assert.equal(new Date(entry.date_modified).valueOf(), new Date(recent).valueOf());
      assert.equal(entry.date_published.slice(0, 10), "2001-01-01");
      assert.ok(!feed.items.some(({url}) => url.endsWith("books/legacy_review/")));
      const schema = [...shelf.matchAll(/<script\b[^>]*type=(?:"application\/ld\+json"|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
      assert.equal(new Date(schema.find((entry) => entry["@type"] === "BlogPosting").dateModified).valueOf(), new Date(recent).valueOf());
      const sitemap = await site.read(`${lang}/sitemap.xml`);
      assert.ok(sitemap.includes(`${site.baseURL}${prefix}books/legacy_review/`), "reviews remain discoverable through the sitemap");
    }
    await writeFile(site.dataFile, site.dataset(old));
    site.build();
    assert.equal(badges(await site.read("library/index.html")), 0, "book badges expire");
    assert.equal(badges(await site.read("notes/index.html")), 0, "the shelf badge expires too");
    for (const lang of ["en", "ru"]) {
      const file = join(site.root, `content/${lang}/notes/library.md`);
      await writeFile(file, (await readFile(file, "utf8")).replace("date=2001-01-01", `date="${recent}"`));
    }
    site.build();
    assert.equal(badges(await site.read("notes/index.html")), 0, "republishing a shelf does not make its old books new");
  });
}

test("invalid reading-list data fails with an actionable error", async (t) => {
  const site = await fixture(t);
  for (const [data, message] of [
    [site.dataset().replace('id="recent"', 'id="old"'), /duplicate id/],
    [site.dataset().replace('read="2021-07"', 'read="2021-13"'), /read must be YYYY-MM/],
    [site.dataset().replace('rating=8.5', 'rating=11'), /rating must be between 0 and 10/],
    [site.dataset().replace('/notes/review', '/notes/missing-review'), /review page.*not found/],
  ]) {
    await writeFile(site.dataFile, data);
    assert.throws(() => site.build(), (error) => message.test([error.stdout, error.stderr, error.message].join("\n")));
  }
});

test("newPostDays = 0 disables both shelf and book badges", async (t) => {
  const site = await fixture(t);
  const config = join(site.root, "hugo.toml");
  await writeFile(config, (await readFile(config, "utf8")).replace("newPostDays=30", "newPostDays=0"));
  site.build();
  assert.equal(badges(await site.read("library/index.html")), 0);
  assert.equal(badges(await site.read("notes/index.html")), 0);
});
