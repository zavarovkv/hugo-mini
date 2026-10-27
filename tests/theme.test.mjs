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
    for (const dir of ["themes", "data", "content/en/blog", "content/ru/blog", "content/en/notes", "static/images"]) await mkdir(join(root, dir), { recursive: true });
    await symlink(themeRoot, join(root, "themes/hugo-mini"), "dir");
    const baseURL = `https://example.org${basePath}`;
    await writeFile(join(root, "hugo.toml"), `baseURL = "${baseURL}"
title = "Fixture User"
theme = "hugo-mini"
enableRobotsTXT = true
defaultContentLanguage = "en"
disableKinds = ["taxonomy", "term"]
[outputs]
home = ["HTML", "RSS", "JSON"]
[permalinks]
blog = "/:slug/"
[params]
mainSections = ["blog"]
telegramChannel = "fixture"
avatar = "images/avatar.svg"
socialSharing = false
notFoundYoda = true
recentSidebarCount = 0
[languages.en]
contentDir = "content/en"
weight = 2
[languages.ru]
contentDir = "content/ru"
weight = 1
`);
    await writeFile(join(root, "data/telegram_reactions.json"), JSON.stringify({ "123": { views: "456", reactions: [{ emoji: "❤", count: 7 }] } }));
    await writeFile(join(root, "static/images/avatar.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>');
    const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aM1sAAAAASUVORK5CYII=", "base64");
    await writeFile(join(root, "static/images/pixel.png"), pixel);
    const code = 'if ready:\n    print("<hello> & goodbye")\n';
    const body = `## Intro\n\n[Translated](${baseURL}shared/?mode=1#intro)\n\n` +
      '{{< callout >}}\n**Highlighted** quotation.\n{{< /callout >}}\n\n' +
      '```python {linenos=inline}\n' + code + '```\n\n' +
      '```python {linenos=table}\n' + code + '```\n\n' +
      `![Local](${baseURL}images/pixel.png?v=2 "A title")\n\n![External](https://elsewhere.example/pixel.png)\n\n![Missing](${basePath}images/missing.png)\n`;
    for (const lang of ["en", "ru"]) {
      await writeFile(join(root, `content/${lang}/blog/shared.md`), `+++\ntitle="Shared"\nslug="shared"\ndate=2026-01-01\ncategories=[]\ntelegram_post=123\n+++\n${body}`);
      await writeFile(join(root, `content/${lang}/blog/uncategorized.md`), '+++\ntitle="Uncategorized"\nslug="uncategorized"\ndate=2000-01-02\n+++\nText\n');
      await writeFile(join(root, `content/${lang}/blog/hidden.md`), '+++\ntitle="Hidden"\nslug="hidden"\ndate=2001-02-01\ndate_precision="month"\nhidden=true\n+++\nText\n');
    }
    await writeFile(join(root, "content/en/notes/hidden.md"), '+++\ntitle="Hidden note"\nhidden=true\n+++\nText\n');
    await mkdir(join(root, "content/en/blog/bundle"));
    await writeFile(join(root, "content/en/blog/bundle/pixel.png"), pixel);
    await writeFile(join(root, "content/en/blog/bundle/index.md"), '+++\ntitle="Bundle"\nslug="bundle"\n+++\n![Bundle image](pixel.png)');
    execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    const output = join(root, "public");
    const robots = await readFile(join(output, "robots.txt"), "utf8");
    assert.match(robots, /^User-agent: \*/);
    assert.ok(robots.includes(`Sitemap: ${baseURL}sitemap.xml`), "robots advertises the root multilingual sitemap, including a base path");
    for (const [langPath, monthLabel, exactLabel] of [["", "February 2001", "2 January 2000"], ["ru/", "февраль 2001", "2 января 2000"]]) {
      const monthlyPost = await readFile(join(output, langPath, "hidden/index.html"), "utf8");
      const date = [...monthlyPost.matchAll(/<time\b[^>]*>([^<]+)<\/time>/g)].find((match) => match[1] === monthLabel)?.[0];
      assert.ok(date, "month precision works in both languages without exposing a placeholder day");
      assert.equal(attribute(date, "datetime"), "2001-02");
      const exactPost = await readFile(join(output, langPath, "uncategorized/index.html"), "utf8");
      const exactDate = [...exactPost.matchAll(/<time\b[^>]*>([^<]+)<\/time>/g)].find((match) => match[1] === exactLabel)?.[0];
      assert.ok(exactDate, "an old article retains its known day, localized month and year");
      assert.equal(attribute(exactDate, "datetime"), "2000-01-02");
    }
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
    assert.match(post, /<blockquote class=(?:"beauty-callout"|beauty-callout)><p><strong>Highlighted<\/strong> quotation\.<\/p><\/blockquote>/,
      "callouts preserve Markdown and render as semantic block quotations");
    const stylesheet = [...post.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).find((tag) => attribute(tag, "rel") === "stylesheet");
    const css = await readFile(join(output, new URL(attribute(stylesheet, "href"), baseURL).pathname.slice(basePath.length)), "utf8");
    for (const selector of [".beauty-emphasis", ".underline", ".beauty-caption", ".caption", ".beauty-button", ".button"]) {
      assert.ok(css.includes(selector), `${selector} remains available in the bundled foundation`);
    }
    const defaultLink = [...post.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).find((tag) => attribute(tag, "hreflang") === "x-default");
    assert.equal(attribute(defaultLink, "href"), `${baseURL}shared/`, "the default language is independent of its display weight");
    assert.match(post, /class=(?:"tg-views"|tg-views)/, "Telegram data renders without deprecated data APIs");
    assert.match(post, /class=(?:"tg-reactions"|tg-reactions)/);
    const notFound = await readFile(join(output, "404.html"), "utf8");
    assert.match(notFound, /name=robots content="noindex, follow"/);
    assert.match(notFound, /class=not-found-art data-ascii-animation(?:="")? aria-hidden=true/);
    assert.ok(notFound.includes("The page you seek, here it is not"));
    const russianNotFound = await readFile(join(output, "ru/404.html"), "utf8");
    assert.ok(russianNotFound.includes("Не ту страницу ищешь ты"));
    const russianView = [...notFound.matchAll(/<template\b([^>]*)>([\s\S]*?)<\/template>/g)].find((match) => attribute(match[0], "data-not-found-language") === "ru");
    assert.ok(russianView, "the fallback 404 includes an inert translated view");
    assert.equal(attribute(russianView[0], "data-not-found-prefix"), `${basePath}ru/`);
    assert.ok(russianView[2].includes("На главную"), "the view renders i18n in its own language context");
    assert.ok(russianView[2].includes(`href=${basePath}ru/`) || russianView[2].includes(`href="${basePath}ru/"`));
    const uiTag = russianView[2].match(/<div\b[^>]*data-not-found-ui[^>]*>/)[0];
    assert.equal(JSON.parse(attribute(uiTag, "data-not-found-ui")).copy, "Копировать");
    assert.ok(!post.includes("likely/likely."), "disabled sharing must not load its assets");
    assert.ok(!listing.includes("likely/likely."), "section pages must not load sharing assets");
    const imageTags = [...post.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    const localImage = imageTags.find((tag) => attribute(tag, "alt") === "Local");
    assert.equal(attribute(localImage, "width"), "1");
    assert.equal(attribute(localImage, "height"), "1");
    assert.equal(attribute(localImage, "src"), `${baseURL}images/pixel.png?v=2`);
    assert.equal(attribute(localImage, "title"), "A title");
    for (const alt of ["External", "Missing"]) assert.equal(attribute(imageTags.find((tag) => attribute(tag, "alt") === alt), "width"), undefined);
    const bundle = await readFile(join(output, "bundle/index.html"), "utf8");
    const bundleImage = [...bundle.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).find((tag) => attribute(tag, "alt") === "Bundle image");
    assert.equal(attribute(bundleImage, "width"), "1");
    assert.equal(attribute(bundleImage, "height"), "1");
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
    await writeFile(join(root, "hugo.toml"), config.replace("socialSharing = false", "socialSharing = true"));
    execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    assert.ok((await readFile(join(output, "ru/shared/index.html"), "utf8")).includes("likely/likely.js"));
    assert.ok(!(await readFile(join(output, "blog/index.html"), "utf8")).includes("likely/likely."));
  });
}

test("noindex and draft previews do not change the indexing of hidden posts", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "hugo-mini-indexing-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ["themes", "content/blog"]) await mkdir(join(root, dir), { recursive: true });
  await symlink(themeRoot, join(root, "themes/hugo-mini"), "dir");
  await writeFile(join(root, "hugo.toml"), 'baseURL="https://example.org/"\ntheme="hugo-mini"\ndisableKinds=["taxonomy","term"]\n');
  for (const [slug, option] of [["unlisted", "hidden=true"], ["private", "noindex=true"], ["preview", "draft=true"]]) {
    await writeFile(join(root, `content/blog/${slug}.md`), `+++\ntitle="${slug}"\n${option}\n+++\nText.`);
  }
  execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--buildDrafts", "--minify", "--panicOnWarning"], { stdio: "pipe" });
  for (const slug of ["private", "preview"]) {
    assert.match(await readFile(join(root, `public/blog/${slug}/index.html`), "utf8"), /name=robots content="noindex, follow"/);
  }
  assert.match(await readFile(join(root, "public/blog/unlisted/index.html"), "utf8"), /name=robots content="index, follow/);
});

test("latest posts respect language, visibility, and dates", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "hugo-mini-reading-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "themes"));
  await symlink(themeRoot, join(root, "themes/hugo-mini"), "dir");
  await writeFile(join(root, "hugo.toml"), `baseURL = "https://example.org/sub/"
title = "Reading fixture"
theme = "hugo-mini"
defaultContentLanguage = "en"
disableKinds = ["taxonomy", "term"]
[params]
mainSections = ["writing"]
[languages.en]
contentDir = "content/en"
weight = 1
[languages.ru]
contentDir = "content/ru"
weight = 2
`);
  const fixtures = [
    ["latest", "2004-01-01", "", "```python\nprint(42)\n```\n"],
    ["next", "2003-01-01", "", "Text."],
    ["third", "2002-01-01", "", "Short essay."],
    ["old", "2001-01-01", "pinned=true", "Brief text."],
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
