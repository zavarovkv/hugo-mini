import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink, writeFile, readFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { collectPostIds } from "../scripts/fetch-telegram-reactions.mjs";

const themeRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function decode(text) {
  return text.replace(/&#(?:x([a-f0-9]+)|(\d+));|&(quot|apos|lt|gt|amp);/gi, (_, hex, decimal, named) => {
    if (hex || decimal) return String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10));
    return { quot: '"', apos: "'", lt: "<", gt: ">", amp: "&" }[named];
  });
}
function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`));
  return match ? decode(match[1] ?? match[2] ?? match[3]) : undefined;
}

for (const basePath of ["/", "/sub/"]) {
  test(`theme outputs remain consistent at ${basePath}`, async (t) => {
    const root = await mkdtemp(join(tmpdir(), "hugo-mini-test-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    for (const dir of ["themes", "content/en/blog", "content/ru/blog", "content/en/notes", "static/images"]) await mkdir(join(root, dir), { recursive: true });
    await symlink(themeRoot, join(root, "themes/hugo-mini"), "dir");
    const baseURL = `https://example.org${basePath}`;
    await writeFile(join(root, "hugo.toml"), `baseURL = "${baseURL}"
title = "Fixture User"
theme = "hugo-mini"
defaultContentLanguage = "en"
disableKinds = ["taxonomy", "term"]
[outputs]
home = ["HTML", "RSS", "JSON"]
[permalinks]
blog = "/:slug/"
[params]
mainSections = ["blog"]
avatar = "images/avatar.svg"
socialSharing = false
recentSidebarCount = 0
[languages.en]
contentDir = "content/en"
weight = 1
[languages.ru]
contentDir = "content/ru"
weight = 2
`);
    await writeFile(join(root, "static/images/avatar.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>');
    const code = 'if ready:\n    print("<hello> & goodbye")\n';
    const body = `## Intro\n\n[Translated](${baseURL}shared/?mode=1#intro)\n\n` +
      '```python {linenos=inline}\n' + code + '```\n\n' +
      '```python {linenos=table}\n' + code + '```\n';
    for (const lang of ["en", "ru"]) {
      await writeFile(join(root, `content/${lang}/blog/shared.md`), `+++\ntitle="Shared"\nslug="shared"\ndate=2026-01-01\ncategories=[]\n+++\n${body}`);
      await writeFile(join(root, `content/${lang}/blog/uncategorized.md`), '+++\ntitle="Uncategorized"\nslug="uncategorized"\ndate=2026-01-01\n+++\nText\n');
      await writeFile(join(root, `content/${lang}/blog/hidden.md`), '+++\ntitle="Hidden"\nslug="hidden"\ndate=2026-01-01\nhidden=true\n+++\nText\n');
    }
    await writeFile(join(root, "content/en/notes/hidden.md"), '+++\ntitle="Hidden note"\nhidden=true\n+++\nText\n');
    execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    const output = join(root, "public");
    const listing = await readFile(join(output, "blog/index.html"), "utf8");
    assert.ok(listing.includes(`${basePath}shared/`), "empty categories must be listed");
    assert.ok(listing.includes(`${basePath}uncategorized/`));
    assert.ok(!listing.includes(`${basePath}hidden/`));
    const notes = await readFile(join(output, "notes/index.html"), "utf8");
    assert.ok(!notes.includes(`${basePath}shared/`), "empty sections must not borrow blog posts");
    const rss = await readFile(join(output, "index.xml"), "utf8");
    assert.ok(!rss.includes(`${baseURL}hidden/`), "hidden posts must stay out of RSS");
    assert.ok(rss.includes(`${baseURL}shared/`));
    const feed = JSON.parse(await readFile(join(output, "ru/index.json"), "utf8"));
    assert.equal(feed.home_page_url, `${baseURL}ru/`);
    assert.equal(feed.feed_url, `${baseURL}ru/index.json`);
    const post = await readFile(join(output, "ru/shared/index.html"), "utf8");
    assert.ok(post.includes(`${basePath}ru/shared/?mode=1#intro`), "same-site links must select the existing translation");
    assert.ok(!post.includes("id=recent-sidebar") && !post.includes('id="recent-sidebar"'));
    assert.ok(!post.includes("has-hover-avatar"), "one avatar must not enable two-frame styles");
    const copied = [...post.matchAll(/<div\b[^>]*\bdata-code=(?:"[^"]*"|'[^']*')[^>]*>/g)].map((m) => attribute(m[0], "data-code"));
    assert.equal(copied.length, 2);
    for (const source of copied) assert.equal(source.trimEnd(), code.trimEnd());
    const ogTag = [...post.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0]).find((tag) => attribute(tag, "property") === "og:image");
    const ogURL = attribute(ogTag, "content");
    const blocks = [...post.matchAll(/<script\b[^>]*type=(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    assert.equal(blocks.find((block) => block["@type"] === "BlogPosting").image.url, ogURL);
    const imagePath = new URL(ogURL).pathname.slice(basePath.length);
    assert.ok(!imagePath.startsWith("sub/"), "base path must not be duplicated");
    await access(join(output, imagePath));

    const config = await readFile(join(root, "hugo.toml"), "utf8");
    await writeFile(join(root, "hugo.toml"), config.replace("[params]", "[params]\nlocalizeLinks = false"));
    execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    const originalLinks = await readFile(join(output, "ru/shared/index.html"), "utf8");
    assert.ok(originalLinks.includes(`${baseURL}shared/?mode=1#intro`), "localizeLinks=false must preserve the destination");
  });
}

test("latest posts and contents respect language, visibility, dates, and page overrides", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "hugo-mini-reading-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "themes"));
  await symlink(themeRoot, join(root, "themes/hugo-mini"), "dir");
  await writeFile(join(root, "hugo.toml"), `baseURL = "https://example.org/sub/"
title = "Reading fixture"
theme = "hugo-mini"
defaultContentLanguage = "en"
disableKinds = ["taxonomy", "term"]
[markup.highlight]
noClasses = false
[params]
mainSections = ["writing"]
[languages.en]
contentDir = "content/en"
weight = 1
[languages.ru]
contentDir = "content/ru"
weight = 2
`);
  const longBody = "## First section\n\n" + "Useful words. ".repeat(360) +
    "\n\n## Second section\n\nText.\n\n## Third section\n\nText.\n\n```python\nprint(42)\n```\n";
  const fixtures = [
    ["latest", "2004-01-01", "", longBody],
    ["next", "2003-01-01", "toc=false", longBody],
    ["third", "2002-01-01", "", "Short essay."],
    ["old", "2001-01-01", "pinned=true\ntoc=true", "## A section\n\nBrief text."],
    ["headless", "2000-01-01", "toc=true", "No headings."],
    ["hidden", "2006-01-01", "hidden=true", "Hidden."],
    ["draft", "2007-01-01", "draft=true", "Draft."],
    ["future", "2999-01-01", "", "Future."],
  ];
  for (const lang of ["en", "ru"]) {
    await mkdir(join(root, `content/${lang}/writing`), { recursive: true });
    await writeFile(join(root, `content/${lang}/_index.md`), '+++\n+++\n\n{{< latest-posts count="3" >}}');
    for (const [slug, date, options, body] of fixtures) {
      await writeFile(join(root, `content/${lang}/writing/${slug}.md`),
        `+++\ntitle="${lang} ${slug}"\ndate=${date}\n${options}\n+++\n${body}`);
    }
  }
  execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
  for (const lang of ["en", "ru"]) {
    const prefix = lang === "en" ? "" : "ru/";
    const output = join(root, "public", prefix);
    const home = await readFile(join(output, "index.html"), "utf8");
    const list = home.match(/<section class=(?:"latest-posts"|latest-posts)>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(list, "shortcode renders a list");
    const links = [...list.matchAll(/<a\b[^>]*>/g)].map((m) => attribute(m[0], "href"));
    assert.deepEqual(links, ["latest", "next", "third"].map((slug) => `/sub/${prefix}writing/${slug}/`));
    assert.ok(list.includes(lang === "en" ? "Latest articles" : "Последние статьи"));
    for (const slug of ["latest", "next", "third", "old", "headless"]) {
      const post = await readFile(join(output, `writing/${slug}/index.html`), "utf8");
      assert.equal(/<details class=(?:"table-of-contents"|table-of-contents)>/.test(post), ["latest", "old"].includes(slug), slug);
      if (slug === "latest") {
        const toc = post.match(/<details[\s\S]*?<\/details>/)[0];
        for (const anchor of [...toc.matchAll(/<a\b[^>]*>/g)]) {
          const id = attribute(anchor[0], "href").slice(1);
          assert.ok(post.includes(`id=${id}`) || post.includes(`id="${id}"`), "contents link resolves to a heading");
        }
        assert.ok(/<pre\b[^>]*class=(?:"chroma"|chroma)/.test(post), "class-based highlighting uses the theme's colors");
      }
    }
  }
});

test("Telegram IDs are discovered in page bundles, only inside front matter", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "telegram-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "bundle"));
  await writeFile(join(root, "flat.md"), '+++\ntelegram_post=123\n+++\n');
  await writeFile(join(root, "bundle/index.md"), '+++\ntelegram_post=456\n+++\n');
  await writeFile(join(root, "example.md"), '+++\ntitle="Example"\n+++\ntelegram_post=789\n');
  assert.deepEqual((await collectPostIds(root)).map(({ id }) => id).sort(), [123, 456]);
});
