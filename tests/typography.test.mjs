import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const theme = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const verbatim = [
  '<pre id="code"><code>10 % 16px "literal" --</code></pre>',
  '<script id="script">const s = "<script>"; if (1 < 2) log("10 % > 16px");</script>',
  '<style id="style">.x::after { content: "<style>10 %"; width: 16px; }</style>',
  '<textarea id="textarea">10 % <b>16px</b></textarea>',
  '<svg id="svg"><svg><text>10 % 16px</text></svg><text>2 ГБ</text></svg>',
  '<div data-typography="off"><div>10 % <span>16px</span></div><div>2 ГБ</div></div>',
  '<div DATA-TYPOGRAPHY="OFF"><script>const close = "</div>";</script><p>16px, 10 %</p></div>',
  '<!-- <pre>10 % 16px</pre> -->',
  String.raw`<p id="math">\(x < y + \text{16px}\) \[10 \% + \text{2 ГБ}\] $$10 \% + \text{16px}$$ $10 \% + \text{16px}$</p>`,
];
const body = [
  '"A quote" -- three dots...',
  '<p id="numbers">1 000 000 ₽, 16px, 2 ГБ, 10 %, 2026, ISO 9001, B2B, 1 - 2.</p>',
  '<p id="dash">Текст — продолжение. Text — continuation.</p>',
  'A native --- em dash.',
  '<p id="technical">10MBps, model16px, B2B, v1.2.3, 2026 100.</p>',
  '<p id="adjacent">10 kg 20 kg;1 000;2 000; model16px 16px; x10 % 10 %</p>',
  '<p id="links"><a href="/files/20%20report?size=16px" title="10 % > 16px">https://example.org/20%20report?size=16px</a> /files/20%20report 100 %</p>',
  '<div title=\'data-typography="off" > 10 %\'><p id="attribute-example">16px</p></div>',
  ...verbatim,
  '<p id="after">16px &amp; 2 ГБ &lt; 10 %</p>',
].join("\n\n");

test("build-time typography respects language, protected content and explicit opt-outs", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "mini-typography-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ["themes", "content/en/blog", "content/ru/blog", "content/de/blog"]) await mkdir(join(root, directory), { recursive: true });
  await symlink(theme, join(root, "themes/hugo-mini"), "dir");
  const config = `baseURL="https://example.org/"
theme="hugo-mini"
defaultContentLanguage="en"
disableKinds=["taxonomy","term"]
[params]
socialSharing=false
recentSidebarCount=0
[markup.goldmark.renderer]
unsafe=true
[languages.en]
contentDir="content/en"
weight=1
[languages.ru]
contentDir="content/ru"
weight=2
[languages.de]
contentDir="content/de"
weight=3
`;
  const configFile = join(root, "hugo.toml");
  await writeFile(configFile, config);
  for (const lang of ["en", "ru", "de"]) {
    await writeFile(join(root, `content/${lang}/_index.md`), `+++\ntitle="Home"\nmath=true\n+++\n${body}`);
    for (const [slug, option] of [["normal", ""], ["disabled", "typography=false"], ["enabled", "typography=true"]]) {
      await writeFile(join(root, `content/${lang}/blog/${slug}.md`), `+++\ntitle="Fixture"\nmath=true\n${option}\n+++\n${body}`);
    }
  }
  const build = () => execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--panicOnWarning"], { stdio: "pipe" });
  const read = async (path) => (await readFile(join(root, "public", path), "utf8")).match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
  const paragraph = (html, id) => html.match(new RegExp(`<p id="${id}">([\\s\\S]*?)<\\/p>`))?.[1];
  build();
  for (const lang of ["en", "ru", "de"]) {
    const prefix = lang === "en" ? "" : `${lang}/`;
    const original = await read(`${prefix}blog/disabled/index.html`);
    assert.equal(paragraph(original, "numbers"), "1 000 000 ₽, 16px, 2 ГБ, 10 %, 2026, ISO 9001, B2B, 1 - 2.");
    for (const path of [`${prefix}index.html`, `${prefix}blog/normal/index.html`]) {
      const html = await read(path);
      assert.ok(html, path);
      for (const fragment of verbatim) assert.ok(html.includes(fragment), `${lang}: protected fragment changed: ${fragment}`);
      assert.ok(html.includes('<a href="/files/20%20report?size=16px" title="10 % > 16px">https://example.org/20%20report?size=16px</a>'));
      assert.ok(html.includes("/files/20%20report"), "visible relative URLs remain intact");
      assert.equal(paragraph(html, "technical"), paragraph(original, "technical"), "technical tokens, years and arithmetic stay intact");
      if (lang === "de") {
        assert.equal(html.trim(), original.trim(), "languages without a spacing policy remain unchanged");
        continue;
      }
      const percent = lang === "ru" ? "10\u00a0%" : "10%";
      assert.equal(paragraph(html, "numbers"), `1\u202f000\u202f000\u00a0₽, 16\u00a0px, 2\u00a0ГБ, ${percent}, 2026, ISO 9001, B2B, 1 - 2.`);
      assert.equal(paragraph(html, "attribute-example"), "16\u00a0px", "a quoted attribute example cannot disable processing");
      assert.equal(paragraph(html, "adjacent"), `10\u00a0kg 20\u00a0kg;1\u202f000;2\u202f000; model16px 16\u00a0px; x10 % ${percent}`);
      assert.equal(paragraph(html, "after"), `16\u00a0px &amp; 2\u00a0ГБ &lt; ${percent}`);
      const dashSpace = lang === "ru" ? "\u00a0" : " ";
      assert.equal(paragraph(html, "dash"), `Текст${dashSpace}— продолжение. Text${dashSpace}— continuation.`);
      assert.ok(html.includes(`A native${dashSpace}&mdash; em dash.`));
      assert.match(html, /&ldquo;A quote&rdquo; &ndash; three dots&hellip;/, "native Goldmark typography is retained");
    }
  }
  await writeFile(configFile, config.replace("[params]", "[params]\ntypography=false"));
  build();
  assert.equal(paragraph(await read("blog/normal/index.html"), "numbers"), "1 000 000 ₽, 16px, 2 ГБ, 10 %, 2026, ISO 9001, B2B, 1 - 2.");
  assert.ok(paragraph(await read("blog/enabled/index.html"), "numbers").includes("16\u00a0px"), "a page can opt in when the site disables the pass");
});
