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
  '<div data-typography="off" id="p1-opt-out">из-за т. е. сказал бы и на улице</div>',
  '<div DATA-TYPOGRAPHY="OFF"><script>const close = "</div>";</script><p>16px, 10 %</p></div>',
  '<!-- <pre>10 % 16px</pre> -->',
  String.raw`<p id="math">\(x < y + \text{16px}\) \[10 \% + \text{2 ГБ}\] $$10 \% + \text{16px}$$ $10 \% + \text{16px}$</p>`,
];
const body = [
  '"A quote" -- three dots...',
  '<p id="numbers">1 000 000 ₽, 16px, 2 ГБ, 10 %, 2026, ISO 9001, B2B, 1 - 2.</p>',
  '<p id="dash">Текст — продолжение. Text — continuation.</p>',
  '<p id="spaced-hyphen">Слово - продолжение; 1 - 2; по-настоящему.</p>',
  '<p id="nested-quotes">«Фильм «Звездные войны»» - полный восторг!</p>',
  '<p id="nested-single">«Фильм &lsquo;Звездные войны&rsquo;» - полный восторг!</p>',
  '<p id="nested-entities">«Фильм &bdquo;Звездные войны&ldquo;».</p>',
  '<p id="nested-inline">«Фильм <em>«Звездные войны»</em>» - полный восторг!</p>',
  '<p id="curly-quotes">“Цитата” и “Другая”.</p>',
  '<p id="curly-nested">«Название “Книга”» и «Название „Книга“».</p>',
  '<p id="quoted-url">«https://example.org/» и «Другая».</p>',
  '<p id="quoted-url-entities">&ldquo;https://example.org/&rdquo; и &ldquo;Другая&rdquo;.</p>',
  '<p id="apostrophe">«История д’Артаньяна» - отличный пример.</p>',
  '<p id="nested-apostrophe">«Книга &lsquo;O&rsquo;Reilly&rsquo;».</p>',
  '<p id="short-words">В Москве и на улице у дома, а по дороге к станции.</p>',
  '<p id="short-chain">И на улице, а по дороге, в доме и на площади.</p>',
  '<p id="compounds">из-за, из-под, Из-за, ИЗ-ПОД; переиз-за.</p>',
  '<p id="abbreviations">т.е., т. д., т. п., т. к., т. н., т. о.; Т. Е.; нет.е.</p>',
  '<p id="particles">Он же сделал бы: сказал ли, верно ль, остался б. Желание быстрое.</p>',
  '<p id="already-bound">из\u2011за, т.\u00a0е., сказал\u00a0бы, и\u00a0на\u00a0улице.</p>',
  '<p id="quote-url">https://example.org/«Звездные-войны»</p>',
  '<p id="disabled-fragment" data-typography="off">«Фильм «Звездные войны»» - текст в 16px.</p>',
  'A native --- em dash.',
  '<p id="technical">10MBps, model16px, B2B, v1.2.3, 2026 100.</p>',
  '<p id="adjacent">10 kg 20 kg;1 000;2 000; model16px 16px; x10 % 10 %</p>',
  '<p id="links"><a href="/files/20%20report?size=16px" title="10 % > 16px">https://example.org/20%20report?size=16px</a> /files/20%20report 100 %</p>',
  '<p id="p1-links"><a href="/files/из-за" title="т. е. сказал бы">сказал бы, из-за</a> https://example.org/из-под /files/из-за</p>',
  '<p id="quoted-link"><a href="/book?name=из-за" title="«Фильм «Звездные войны»»">«Фильм «Звездные войны»»</a>.</p>',
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
  const paragraph = (html, id) => html.match(new RegExp(`<p id="${id}"(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/p>`))?.[1];
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
      assert.ok(html.includes('<a href="/files/из-за" title="т. е. сказал бы">'), "new rules must not rewrite link attributes");
      assert.ok(html.includes("https://example.org/из-под /files/из-за"), "new rules must not rewrite visible URLs");
      assert.ok(html.includes('<a href="/book?name=из-за" title="«Фильм «Звездные войны»»">'), "nested quotes must not rewrite link attributes");
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
      if (lang === "ru") {
        assert.match(html, /&laquo;A quote&raquo; &ndash; three dots&hellip;/, "Russian quotation marks are normalized");
        assert.equal(paragraph(html, "spaced-hyphen"), "Слово\u00a0— продолжение; 1 - 2; по-настоящему.");
        assert.equal(paragraph(html, "nested-quotes"), "&laquo;Фильм &bdquo;Звездные войны&ldquo;&raquo;\u00a0— полный восторг!");
        assert.equal(paragraph(html, "nested-single"), "&laquo;Фильм &bdquo;Звездные войны&ldquo;&raquo;\u00a0— полный восторг!");
        assert.equal(paragraph(html, "nested-entities"), "&laquo;Фильм &bdquo;Звездные войны&ldquo;&raquo;.");
        assert.equal(paragraph(html, "nested-inline"), "&laquo;Фильм <em>&bdquo;Звездные войны&ldquo;</em>&raquo;\u00a0— полный восторг!");
        assert.equal(paragraph(html, "curly-quotes"), "&laquo;Цитата&raquo; и &laquo;Другая&raquo;.");
        assert.equal(paragraph(html, "curly-nested"), "&laquo;Название &bdquo;Книга&ldquo;&raquo; и &laquo;Название &bdquo;Книга&ldquo;&raquo;.");
        assert.equal(paragraph(html, "quoted-url"), "&laquo;https://example.org/&raquo; и &laquo;Другая&raquo;.");
        assert.equal(paragraph(html, "quoted-url-entities"), "&laquo;https://example.org/&raquo; и &laquo;Другая&raquo;.");
        assert.equal(paragraph(html, "apostrophe"), "&laquo;История д’Артаньяна&raquo;\u00a0— отличный пример.");
        assert.equal(paragraph(html, "nested-apostrophe"), "&laquo;Книга &bdquo;O&rsquo;Reilly&ldquo;&raquo;.");
        assert.equal(paragraph(html, "short-words"), "В\u00a0Москве и\u00a0на\u00a0улице у\u00a0дома, а\u00a0по\u00a0дороге к\u00a0станции.");
        assert.equal(paragraph(html, "short-chain"), "И\u00a0на\u00a0улице, а\u00a0по\u00a0дороге, в\u00a0доме и\u00a0на\u00a0площади.");
        assert.equal(paragraph(html, "compounds"), "из\u2011за, из\u2011под, Из\u2011за, ИЗ\u2011ПОД; переиз-за.");
        assert.equal(paragraph(html, "abbreviations"), "т.\u00a0е., т.\u00a0д., т.\u00a0п., т.\u00a0к., т.\u00a0н., т.\u00a0о.; Т.\u00a0Е.; нет.е.");
        assert.equal(paragraph(html, "particles"), "Он\u00a0же сделал\u00a0бы: сказал\u00a0ли, верно\u00a0ль, остался\u00a0б. Желание быстрое.");
        assert.equal(paragraph(html, "already-bound"), "из\u2011за, т.\u00a0е., сказал\u00a0бы, и\u00a0на\u00a0улице.", "already formatted text stays unchanged");
        assert.ok(html.includes('<a href="/files/из-за" title="т. е. сказал бы">сказал\u00a0бы, из\u2011за</a>'), "only link text is formatted");
        assert.equal(paragraph(html, "quoted-link"), '<a href="/book?name=из-за" title="«Фильм «Звездные войны»»">&laquo;Фильм &bdquo;Звездные войны&ldquo;&raquo;</a>.', "quoted link text is normalized without modifying attributes");
        assert.equal(paragraph(html, "quote-url"), "https://example.org/«Звездные-войны»", "visible URL quotation marks stay intact");
        assert.equal(paragraph(html, "disabled-fragment"), "«Фильм «Звездные войны»» - текст в 16px.");
      } else {
        assert.equal(paragraph(html, "quoted-link"), paragraph(original, "quoted-link"), "English link quotes are not normalized");
        for (const id of ["short-chain", "compounds", "abbreviations", "particles", "already-bound"]) assert.equal(paragraph(html, id), paragraph(original, id), "English prose does not receive Russian rules");
        assert.match(html, /&ldquo;A quote&rdquo; &ndash; three dots&hellip;/, "native Goldmark typography is retained");
        assert.equal(paragraph(html, "nested-quotes"), "«Фильм «Звездные войны»» - полный восторг!", "English punctuation is not rewritten");
      }
    }
  }
  await writeFile(configFile, config.replace("[params]", "[params]\ntypography=false"));
  build();
  assert.equal(paragraph(await read("blog/normal/index.html"), "numbers"), "1 000 000 ₽, 16px, 2 ГБ, 10 %, 2026, ISO 9001, B2B, 1 - 2.");
  assert.equal(paragraph(await read("ru/blog/normal/index.html"), "compounds"), "из-за, из-под, Из-за, ИЗ-ПОД; переиз-за.", "site opt-out also disables the new Russian rules");
  assert.ok(paragraph(await read("ru/blog/enabled/index.html"), "compounds").includes("из\u2011за"), "page opt-in restores the new Russian rules");
  assert.ok(paragraph(await read("blog/enabled/index.html"), "numbers").includes("16\u00a0px"), "a page can opt in when the site disables the pass");
});
