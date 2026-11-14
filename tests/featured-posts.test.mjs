import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const themeRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`));
  return match ? match[1] ?? match[2] ?? match[3] : undefined;
}

function section(html, className) {
  return [...html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)]
    .map(([block]) => block)
    .find(block => attribute(block.match(/^<section\b[^>]*>/)[0], "class")?.split(/\s+/).includes(className));
}

function links(html) {
  return [...html.matchAll(/<a\b[^>]*>/g)].map(([tag]) => attribute(tag, "href"));
}

test("featured articles preserve editorial order, visibility, and the current language", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "hugo-mini-featured-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "themes"));
  await symlink(themeRoot, join(root, "themes/hugo-mini"), "dir");

  const posts = [
    ["latest", "2004-01-01", ""],
    ["next", "2003-01-01", ""],
    ["third", "2002-01-01", ""],
    ["old", "2001-01-01", "pinned = true"],
    ["hidden", "2006-01-01", "hidden = true"],
    ["draft", "2007-01-01", "draft = true"],
    ["future", "2999-01-01", ""],
  ];
  for (const lang of ["en", "ru"]) {
    for (const dir of ["writing", "notes"]) {
      await mkdir(join(root, `content/${lang}/${dir}`), { recursive: true });
    }
    const archiveLabel = lang === "en" ? "Read all essays" : "Все статьи";
    await writeFile(join(root, `content/${lang}/_index.md`), `+++\n+++\n
{{< featured-posts archive="/writing/" archiveLabel="${archiveLabel}" >}}

{{< latest-posts count="3" >}}
`);
    for (const [name, date, options] of posts) {
      await writeFile(join(root, `content/${lang}/writing/${name}.md`),
        `+++\ntitle = "${lang} ${name}"\nslug = "${lang}-${name}"\ndate = ${date}\n${options}\n+++\nArticle.\n`);
    }
    await writeFile(join(root, `content/${lang}/notes/outside.md`),
      `+++\ntitle = "${lang} outside main sections"\ndate = 2008-01-01\n+++\nNote.\n`);
    await writeFile(join(root, `content/${lang}/about.md`),
      `+++\ntitle = "${lang} about"\n+++\nStandalone page.\n`);
  }
  await writeFile(join(root, "content/en/writing/only-en.md"),
    '+++\ntitle = "English-only article"\nslug = "en-only"\ndate = 1999-01-01\n+++\nNo Russian translation.\n');

  const unavailable = [
    "/writing/hidden", "/writing/draft", "/writing/future",
    "/notes/outside", "/about", "/writing/missing", "/writing", "/",
  ];
  const variants = [
    {
      name: "ordered selection",
      refs: ["/writing/third", "/writing/old", "/writing/next", "/writing/old", "/writing/only-en", ...unavailable],
      selected: true,
    },
    { name: "unset selection", refs: undefined },
    { name: "empty selection", refs: [] },
    { name: "no eligible articles", refs: unavailable },
  ];

  for (const [index, variant] of variants.entries()) {
    await t.test(variant.name, async () => {
      await writeFile(join(root, "hugo.toml"), `baseURL = "https://example.org/sub/"
title = "Featured fixture"
theme = "hugo-mini"
defaultContentLanguage = "en"
disableKinds = ["taxonomy", "term"]
[permalinks]
writing = "/essays/:slug/"
[params]
mainSections = ["writing"]
socialSharing = false
${variant.refs === undefined ? "" : `featuredPosts = ${JSON.stringify(variant.refs)}`}
[languages.en]
contentDir = "content/en"
weight = 1
[languages.ru]
contentDir = "content/ru"
weight = 2
`);
      const destination = join(root, `public-${index}`);
      execFileSync(process.env.HUGO_BIN || "hugo", [
        "--source", root, "--destination", destination, "--minify", "--panicOnWarning",
      ], { stdio: "pipe" });

      for (const lang of ["en", "ru"]) {
        const prefix = lang === "en" ? "" : "ru/";
        const home = await readFile(join(destination, prefix, "index.html"), "utf8");
        const latest = section(home, "latest-posts");
        assert.ok(latest, `${lang}: latest articles remain available`);
        assert.deepEqual(links(latest), ["latest", "next", "third"].map(name => `/sub/${prefix}essays/${lang}-${name}/`),
          `${lang}: latest articles remain chronological, independent of pinning and featured selection`);

        const featured = section(home, "featured-posts");
        if (!variant.selected) {
          assert.equal(featured, undefined, `${lang}: an empty selection renders no section or fallback`);
          assert.ok(!home.includes(lang === "en" ? "Featured articles" : "Избранные статьи"),
            `${lang}: an empty selection leaves no heading`);
          continue;
        }

        assert.ok(featured, `${lang}: selected articles render a section`);
        assert.ok(featured.includes(lang === "en" ? "Featured articles" : "Избранные статьи"),
          `${lang}: the heading uses the current language`);
        const expected = ["third", "old", "next"].map(name => `/sub/${prefix}essays/${lang}-${name}/`);
        if (lang === "en") expected.push("/sub/essays/en-only/");
        expected.push(`/sub/${prefix}writing/`);
        assert.deepEqual(links(featured), expected,
          `${lang}: content references resolve to ordered, deduplicated, eligible current-language URLs and the archive`);
        assert.ok(featured.includes(lang === "en" ? "Read all essays" : "Все статьи"),
          `${lang}: the archive retains its custom label`);
        for (const name of ["third", "old", "next"]) {
          assert.ok(featured.includes(`${lang} ${name}`), `${lang}: article titles come from the current language`);
        }
        if (lang === "ru") {
          assert.ok(!featured.includes("English-only article"), "missing translations do not leak default-language content");
        }
      }
    });
  }
});
