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

test("Telegram IDs are discovered in page bundles, only inside front matter", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "telegram-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "bundle"));
  await writeFile(join(root, "flat.md"), '+++\ntelegram_post=123\n+++\n');
  await writeFile(join(root, "bundle/index.md"), '+++\ntelegram_post=456\n+++\n');
  await writeFile(join(root, "example.md"), '+++\ntitle="Example"\n+++\ntelegram_post=789\n');
  assert.deepEqual((await collectPostIds(root)).map(({ id }) => id).sort(), [123, 456]);
});
