import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink, writeFile, readFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
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
aiTranslatedLang = "en"
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
      `[Russian homepage](${basePath}ru/)\n\n` +
      `[Explicit Russian post](${basePath}ru/shared/?mode=2#intro)\n\n` +
      '{{< callout >}}\n**Highlighted** quotation.\n{{< /callout >}}\n\n' +
      'Footnotes stay clickable[^source], even when cited again[^source].\n\n' +
      '[^source]: A source note with a link back to the text.\n\n' +
      '```python {linenos=inline}\n' + code + '```\n\n' +
      '```python {linenos=table}\n' + code + '```\n\n' +
      `![Local](${baseURL}images/pixel.png?v=2 "A title")\n\n![External](https://elsewhere.example/pixel.png)\n\n![Missing](${basePath}images/missing.png)\n`;
    for (const lang of ["en", "ru"]) {
      await writeFile(join(root, `content/${lang}/blog/shared.md`), `+++\ntitle="Shared"\nslug="shared"\ndate=2026-01-01\ncategories=[]\ntelegram_post=123\n+++\n${body}`);
      await writeFile(join(root, `content/${lang}/blog/uncategorized.md`), '+++\ntitle="Uncategorized"\nslug="uncategorized"\ndate=2000-01-02\n+++\nText\n');
      await writeFile(join(root, `content/${lang}/blog/hidden.md`), '+++\ntitle="Hidden"\nslug="hidden"\ndate=2001-02-01\ndate_precision="month"\nhidden=true\n+++\nText\n');
    }
    await writeFile(join(root, "content/en/notes/hidden.md"), '+++\ntitle="Hidden note"\nhidden=true\n+++\nText\n');
    await writeFile(join(root, "content/en/about.md"), '+++\ntitle="About"\ncanonicalURL="https://project.example/"\nseoSiteName="Example Project"\nseoSiteURL="https://project.example/"\n+++\nAbout\n');
    for (const lang of ["en", "ru"]) {
      await writeFile(join(root, `content/${lang}/_index.md`), `+++\n+++\n{{< project name="Fixture" url="https://example.com/" icon="images/hugo-mini-logo-light.svg" iconDark="images/hugo-mini-logo-dark.svg" >}}\nA sample project.\n{{< /project >}}\n\n{{< project name="Plain" url="https://example.net/" >}}\nA project without a mark.\n{{< /project >}}`);
    }
    await mkdir(join(root, "content/en/blog/bundle"));
    await writeFile(join(root, "content/en/blog/bundle/pixel.png"), pixel);
    await writeFile(join(root, "content/en/blog/bundle/index.md"), '+++\ntitle="Bundle"\nslug="bundle"\n+++\n![Bundle image](pixel.png)');
    execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    const output = join(root, "public");
    const robots = await readFile(join(output, "robots.txt"), "utf8");
    assert.match(robots, /^User-agent: \*/);
    assert.ok(robots.includes(`Sitemap: ${baseURL}sitemap.xml`), "robots advertises the root multilingual sitemap, including a base path");
    for (const [langPath, label] of [["", "Search"], ["ru/", "Поиск"]]) {
      const home = await readFile(join(output, langPath, "index.html"), "utf8");
      const markButton = home.match(/<button\b[^>]*\bclass=(?:"project-mark-button"|project-mark-button)[^>]*>[\s\S]*?<\/button>/)?.[0];
      assert.ok(markButton, "project logos use a separate button, not a nested interactive element in the link");
      assert.ok(markButton.includes("disabled"), "without JavaScript the logo stays a decorative, unfocusable mark");
      assert.equal(attribute(markButton, "aria-label"), langPath ? "Покрутить логотип Fixture" : "Spin the Fixture logo");
      for (const variant of ["light", "dark"]) {
        assert.ok(markButton.includes(`project-mark-${variant}`), `the ${variant} logo is available`);
      }
      const projectLink = home.match(/<a\b[^>]*\bclass=(?:"project-link"|project-link)[^>]*>[\s\S]*?<\/a>/)?.[0];
      assert.ok(projectLink && projectLink.includes("Fixture") && !projectLink.includes("project-mark"),
        "project name still links normally, separately from the spinning logo");
      assert.equal([...home.matchAll(/\bclass=(?:"project-mark-button"|project-mark-button)/g)].length, 1,
        "projects without logos do not gain animation controls");
      const iconLinks = [...home.matchAll(/<link\b[^>]*>/g)].map(([tag]) => tag);
      const browserIcon = iconLinks.find(tag => attribute(tag, "rel") === "icon" && attribute(tag, "sizes") === "any");
      const androidIcon = iconLinks.find(tag => attribute(tag, "rel") === "icon" && attribute(tag, "sizes") === "192x192");
      const appleIcon = iconLinks.find(tag => attribute(tag, "rel") === "apple-touch-icon");
      assert.equal(attribute(browserIcon, "href"), `${baseURL}images/hugo-mini-favicon.svg`);
      assert.equal(attribute(browserIcon, "type"), "image/svg+xml");
      assert.equal(attribute(androidIcon, "href"), `${baseURL}images/hugo-mini-favicon-192.png`);
      assert.equal(attribute(appleIcon, "href"), `${baseURL}images/hugo-mini-apple-touch-icon.png`);
      assert.ok(home.includes("title-avatar-container"), "default favicon does not replace the header avatar");
      const links = [...home.matchAll(/(<a\b[^>]*class="search-toggle search-toggle-(mobile|desktop)"[^>]*>)([\s\S]*?)<\/a>/g)];
      assert.equal(links.length, 2, "search is enabled by default on desktop and mobile");
      for (const [, tag] of links) {
        assert.equal(attribute(tag, "href"), `${basePath}${langPath}`, "search links to the current language homepage");
      }
      const mobile = links.find((link) => link[2] === "mobile");
      const desktop = links.find((link) => link[2] === "desktop");
      assert.ok(mobile[3].includes(label) && !mobile[3].includes("<svg"), "mobile search is text-only");
      assert.ok(desktop[3].includes("<svg"), "desktop search keeps the Octicon");
      const languageToggle = home.match(/<a\b[^>]*\bclass=(?:"lang-toggle"|lang-toggle)[^>]*>([\s\S]*?)<\/a>/);
      assert.ok(languageToggle, "the other language is available in the footer");
      assert.equal(attribute(languageToggle[0], "data-lang"), langPath ? "en" : "ru");
      assert.equal(languageToggle[1].includes("lang-sparkle"), Boolean(langPath), "AI sparkle is shown only for the configured English translation");
    }
    for (const icon of ["hugo-mini-favicon.svg", "hugo-mini-favicon-192.png", "hugo-mini-apple-touch-icon.png"]) await access(join(output, "images", icon));
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
    assert.equal([...post.matchAll(/class=(?:"footnote-ref"|footnote-ref)/g)].length, 2,
      "repeated Goldmark footnote references remain separate clickable links");
    assert.match(post, /class=(?:"footnotes"|footnotes) role=(?:"doc-endnotes"|doc-endnotes)/,
      "source notes render in a semantic endnotes list");
    assert.ok(post.includes("A source note with a link back to the text."));
    assert.equal([...post.matchAll(/class=(?:"footnote-backref"|footnote-backref)/g)].length, 2,
      "each citation keeps its own return link");
    const stylesheet = [...post.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).find((tag) => attribute(tag, "rel") === "stylesheet");
    const css = await readFile(join(output, new URL(attribute(stylesheet, "href"), baseURL).pathname.slice(basePath.length)), "utf8");
    for (const selector of [".beauty-emphasis", ".underline", ".beauty-caption", ".caption", ".beauty-button", ".button", ".footnote-ref", ".footnote-backref"]) {
      assert.ok(css.includes(selector), `${selector} remains available in the bundled foundation`);
    }
    assert.match(css, /article sup:has\(>\.footnote-ref\)\{[^}]*vertical-align:super/, "in-text citation numbers stay raised");
    assert.match(css, /article \.footnotes>ol\{[^}]*list-style:none[^}]*padding-inline-start:0/, "the footnote list has neither default markers nor a hanging indent");
    assert.match(css, /article \.footnotes>ol>li::before\{[^}]*content:counter\(list-item\)/, "native ordered-list counters belong to each note, including non-paragraph content");
    assert.match(css, /article \.footnotes>ol>li::before\{[^}]*font-size:\.7em[^}]*position:absolute/, "footnote numbers stay small and outside the aligned note content");
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
    const standalone = await readFile(join(output, "about/index.html"), "utf8");
    assert.match(standalone, /property=(?:"og:type"|og:type) content=(?:"website"|website)/);
    assert.doesNotMatch(standalone, /article:(?:published|modified)_time/, "standalone pages must not acquire article dates");
    const standaloneCanonical = [...standalone.matchAll(/<link\b[^>]*>/g)].map(m => m[0]).find(tag => attribute(tag, "rel") === "canonical");
    assert.equal(attribute(standaloneCanonical, "href"), "https://project.example/");
    const standaloneBlocks = [...standalone.matchAll(/<script\b[^>]*type=(?:"application\/ld\+json"|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.equal(standaloneBlocks.find(block => block["@type"] === "WebPage").url, "https://project.example/");
    assert.equal(standaloneBlocks.find(block => block["@type"] === "WebSite").name, "Example Project");
    assert.match(post, /property=(?:"og:type"|og:type) content=(?:"article"|article)/);
    const bundleImage = [...bundle.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).find((tag) => attribute(tag, "alt") === "Bundle image");
    assert.equal(attribute(bundleImage, "width"), "1");
    assert.equal(attribute(bundleImage, "height"), "1");
    assert.ok(post.includes(`${basePath}ru/shared/?mode=1#intro`), "same-site links must select the existing translation");
    const englishPost = await readFile(join(output, "shared/index.html"), "utf8");
    assert.ok(englishPost.includes(`href=${basePath}ru/`), "an explicit language-prefixed homepage link must not be localized back to English");
    assert.ok(englishPost.includes(`${basePath}ru/shared/?mode=2#intro`), "explicit language-prefixed post links must retain their requested language and fragment");
    assert.ok(!post.includes("id=recent-sidebar") && !post.includes('id="recent-sidebar"'));
    assert.ok(!post.includes("has-hover-avatar"), "one avatar must not enable two-frame styles");
    const renderedBlocks = [...post.matchAll(/<div\b[^>]*\bclass=(?:"code-block"|code-block)[^>]*>/g)].map(([tag]) => tag);
    assert.equal(renderedBlocks.length, 2);
    for (const tag of renderedBlocks) assert.equal(attribute(tag, "data-code"), undefined, "highlighted source must not be duplicated in HTML attributes");
    const ogTag = [...post.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0]).find((tag) => attribute(tag, "property") === "og:image");
    const ogURL = attribute(ogTag, "content");
    const blocks = [...post.matchAll(/<script\b[^>]*type=(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    assert.equal(blocks.find((block) => block["@type"] === "BlogPosting").image.url, ogURL);
    const imagePath = new URL(ogURL).pathname.slice(basePath.length);
    assert.ok(!imagePath.startsWith("sub/"), "base path must not be duplicated");
    await access(join(output, imagePath));

    const config = await readFile(join(root, "hugo.toml"), "utf8");
    await writeFile(join(root, "hugo.toml"), config.replace("[params]", `[params]
localizeLinks = false
logo = "images/hugo-mini-logo-light.svg"
logoDark = "images/hugo-mini-logo-dark.svg"
`));
    execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    const originalLinks = await readFile(join(output, "ru/shared/index.html"), "utf8");
    assert.ok(originalLinks.includes(`${baseURL}shared/?mode=1#intro`), "localizeLinks=false must preserve the destination");
    assert.match(originalLinks, /class=(?:"title-logo-container has-dark-logo"|title-logo-container has-dark-logo)/, "configured logo replaces the avatar");
    assert.ok(!originalLinks.includes('class="title-avatar-container"'), "avatar stays hidden when a logo is configured");
    for (const [variant, file] of [["light", "hugo-mini-logo-light.svg"], ["dark", "hugo-mini-logo-dark.svg"]]) {
      const logo = [...originalLinks.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag).find(tag => attribute(tag, "class")?.includes(`title-logo-${variant}`));
      assert.equal(attribute(logo, "src"), `${basePath}images/${file}`);
      assert.equal(attribute(logo, "width"), "26");
      assert.equal(attribute(logo, "height"), "26");
      await access(join(output, "images", file));
    }
    const svgFavicon = [...originalLinks.matchAll(/<link\b[^>]*>/g)].map(([tag]) => tag).find(tag => attribute(tag, "rel") === "icon");
    assert.equal(attribute(svgFavicon, "type"), "image/svg+xml");
    assert.equal(attribute(svgFavicon, "sizes"), "any");
    assert.equal(attribute(svgFavicon, "href"), `${baseURL}images/hugo-mini-favicon.svg`);
    await access(join(output, "images/hugo-mini-favicon.svg"));

    await writeFile(join(root, "hugo.toml"), config.replace("socialSharing = false", "socialSharing = true\nshowSearchButton = false\nfavicon = \"images/pixel.png\""));
    execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    const sharingPost = await readFile(join(output, "ru/shared/index.html"), "utf8");
    assert.ok(!sharingPost.includes("search-toggle"), "a site can hide the default search shortcut");
    const pngFavicon = [...sharingPost.matchAll(/<link\b[^>]*>/g)].map(([tag]) => tag).find(tag => attribute(tag, "rel") === "icon");
    assert.equal(attribute(pngFavicon, "type"), "image/png", "existing PNG favicons remain supported");
    assert.equal(attribute(pngFavicon, "sizes"), "32x32");
    assert.equal(attribute(pngFavicon, "href"), `${baseURL}images/pixel.png`);
    assert.equal([...sharingPost.matchAll(/<link\b[^>]*>/g)].filter(([tag]) => attribute(tag, "rel") === "icon").length, 1, "custom favicon suppresses bundled Android icon");
    assert.ok(!sharingPost.includes("apple-touch-icon"), "custom favicon suppresses bundled Apple icon");
    const sharingAssets = [...sharingPost.matchAll(/<(?:link|script)\b[^>]*>/g)]
      .map(([tag]) => ({ url: attribute(tag, "src") || attribute(tag, "href"), integrity: attribute(tag, "integrity") }))
      .filter(({ url }) => url?.includes("/likely/"));
    assert.equal(sharingAssets.length, 2, "enabled sharing loads one local stylesheet and script");
    for (const { url, integrity } of sharingAssets) {
      assert.match(url, /\/likely\/likely\.min\.[a-f0-9]+\.(?:css|js)$/);
      const bytes = await readFile(join(output, new URL(url, baseURL).pathname.slice(basePath.length)));
      assert.ok(bytes.length > 0);
      assert.equal(integrity, `sha256-${createHash("sha256").update(bytes).digest("base64")}`);
    }
    assert.ok(!(await readFile(join(output, "blog/index.html"), "utf8")).includes("likely/likely."));

    await writeFile(join(root, "hugo.toml"), config.replace("socialSharing = false", "socialSharing = false\nfavicon = false"));
    execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    const disabled = await readFile(join(output, "index.html"), "utf8");
    const disabledIcons = [...disabled.matchAll(/<link\b[^>]*>/g)].filter(([tag]) => ["icon", "apple-touch-icon"].includes(attribute(tag, "rel")));
    assert.equal(disabledIcons.length, 0, "favicon=false disables all bundled icons");
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
  const sitemap = await readFile(join(root, "public/sitemap.xml"), "utf8");
  assert.ok(sitemap.includes("https://example.org/blog/unlisted/"), "hidden posts remain discoverable by crawlers");
  for (const slug of ["private", "preview"]) {
    assert.ok(!sitemap.includes(`https://example.org/blog/${slug}/`), `${slug} must not be submitted for indexing`);
  }
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

test("local Mermaid upgrades change the entry URL without breaking chunk paths or custom URLs", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "mermaid-cache-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ["themes", "content/blog", "static/js/mermaid"]) await mkdir(join(root, dir), { recursive: true });
  await symlink(themeRoot, join(root, "themes/hugo-mini"), "dir");
  await writeFile(join(root, "content/blog/diagram.md"), '+++\ntitle="Diagram"\nmermaid=true\n+++\n{{< mermaid >}}graph LR; A-->B{{< /mermaid >}}\n');
  const entry = join(root, "static/js/mermaid/entry.mjs");
  async function build(param, src) {
    await writeFile(join(root, "hugo.toml"), `baseURL="https://example.org/sub/"\ntheme="hugo-mini"\ntitle="Fixture"\ndisableKinds=["taxonomy","term"]\n[params]\nsocialSharing=false\n${param}=${JSON.stringify(src)}\n`);
    execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    const html = await readFile(join(root, "public/blog/diagram/index.html"), "utf8");
    return JSON.parse(attribute(html.match(/<body\b[^>]*>/)[0], "data-mermaid"));
  }
  const oldSource = 'import "./chunks/old.mjs";';
  const newSource = 'import "./chunks/new.mjs";';
  await writeFile(entry, oldSource);
  const before = await build("mermaidModuleSrc", "js/mermaid/entry.mjs?mode=local#fragment");
  await writeFile(entry, newSource);
  const after = await build("mermaidModuleSrc", "js/mermaid/entry.mjs?mode=local#fragment");
  assert.equal(after.module, true);
  assert.notEqual(after.src, before.src, "returning visitors must not reuse the old entry after an upgrade");
  for (const [config, source] of [[before, oldSource], [after, newSource]]) {
    const url = new URL(config.src, "https://example.org");
    assert.equal(url.searchParams.get("v"), createHash("sha256").update(source).digest("hex"));
    assert.equal(url.searchParams.get("mode"), "local");
    assert.equal(url.hash, "#fragment");
    assert.equal(new URL("./chunks/current.mjs", url).pathname, "/sub/js/mermaid/chunks/current.mjs");
  }
  const classic = await build("mermaidSrc", "/js/mermaid/entry.mjs");
  assert.equal(classic.module, undefined);
  assert.match(classic.src, /\?v=[a-f0-9]{64}$/);
  for (const src of ["https://cdn.example/entry.mjs?v=12#module", "//cdn.example/entry.mjs"]) {
    assert.equal((await build("mermaidModuleSrc", src)).src, src);
  }
  assert.equal((await build("mermaidModuleSrc", "js/missing.mjs")).src, "/sub/js/missing.mjs");
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
