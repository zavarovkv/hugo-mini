import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, symlink, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const theme = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hugoVersion = execFileSync(process.env.HUGO_BIN || 'hugo', ['version'], { encoding: 'utf8' });
const [, major, minor] = hugoVersion.match(/v(\d+)\.(\d+)\./) || [];
const languageLabelKey = Number(major) > 0 || Number(minor) >= 158 ? 'label' : 'languageName';

async function site(t, config, content, templates = {}, assets = {}, staticFiles = {}) {
  const root = await mkdtemp(join(tmpdir(), 'hugo-mini-quality-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'themes'));
  await symlink(theme, join(root, 'themes/hugo-mini'), 'dir');
  await writeFile(join(root, 'hugo.toml'), config);
  for (const [name, source] of Object.entries(content)) {
    const filename = join(root, 'content', name);
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, source);
  }
  for (const [name, source] of Object.entries(templates)) {
    const filename = join(root, 'layouts', name);
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, source);
  }
  for (const [name, bytes] of Object.entries(assets)) {
    const filename = join(root, 'assets', name);
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, bytes);
  }
  for (const [name, bytes] of Object.entries(staticFiles)) {
    const filename = join(root, 'static', name);
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, bytes);
  }
  execFileSync(process.env.HUGO_BIN || 'hugo', ['--source', root, '--minify', '--panicOnWarning'], { stdio: 'pipe' });
  return {
    read: (name) => readFile(join(root, 'public', name), 'utf8'),
    readBytes: (name) => readFile(join(root, 'public', name)),
  };
}

test('image shortcodes share intrinsic dimensions with Markdown and render semantic captions', async (t) => {
  const pixel = Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA', 'base64');
  const example = await site(t, 'baseURL="https://example.org/sub/"\ntheme="hugo-mini"\ndisableKinds=["taxonomy","term"]', {
    'blog/probe/index.md': `+++\ntitle="Images"\n+++\n
![Native](/sub/images/pixel.webp)

{{< image src="/sub/images/pixel.webp" alt="Static" wide=true caption="A **description**." >}}

{{< image src="pixel.webp" alt="Bundle" wide="false" >}}

{{< image src="https://elsewhere.example/image.svg" alt="External" width=1200 height=800 wide=true kind="credit" caption="Photo: author" >}}
`,
    'blog/probe/pixel.webp': pixel,
  }, {}, {}, { 'images/pixel.webp': pixel });
  const html = await example.read('blog/probe/index.html');
  for (const alt of ['Native', 'Static', 'Bundle']) {
    assert.match(html, new RegExp(`alt=${alt} loading=lazy decoding=async width=1 height=1`));
  }
  assert.match(html, /<figure class="article-image article-image-wide" style=--image-natural-width:1px>/);
  assert.match(html, /src=\/sub\/blog\/probe\/pixel.webp alt=Bundle/);
  assert.match(html, /<figcaption class=beauty-caption>A <strong>description<\/strong>\.<\/figcaption>/);
  assert.match(html, /class="beauty-caption beauty-caption-credit">Photo: author/);
  assert.doesNotMatch(html, /<p>\s*<figure/);
});

test('image shortcodes reject missing dimensions and invalid layout options', async (t) => {
  for (const [params, error] of [
    ['src="https://example.org/photo.svg" alt="Photo"', /image: provide positive width and height/],
    ['src="https://example.org/photo.svg" alt="Photo" width=100 height=80 wide="yes"', /image: wide must be true or false/],
  ]) {
    await assert.rejects(site(t, 'theme="hugo-mini"\ndisableKinds=["taxonomy","term"]', {
      '_index.md': `+++\ntitle="Images"\n+++\n{{< image ${params} >}}`,
    }), error);
  }
});

test('Markdown URL safety, plain metadata and valid JSON Feed survive rendering', async (t) => {
  const longText = `${'This is part of a long article. '.repeat(25)}END_MARKER`;
  const example = await site(t, `baseURL="https://example.org/"
title="Test & Notes"
theme="hugo-mini"
disableKinds=["taxonomy","term"]
[outputs]
home=["HTML","RSS","JSON"]
[params]
authorName="An Author"
authorURL=""
socialSharing=false
`, {
    'blog/probe.md': `+++
title="Plain-text probe"
date=2026-01-01
+++
An ampersand & a smart quote ‘like this’ and **bold text**.

${longText}

[Unsafe](javascript:alert(1))
[Mixed case](JaVaScRiPt:alert(2))
[Data URL](data:text/html,hello)
![Bad image](javascript:alert(3))
[Email](mailto:hello@example.org)
[Safe URL](https://example.org/)
[External](https://elsewhere.example/)
`,
  });

  const html = await example.read('blog/probe/index.html');
  for (const name of ['Unsafe', 'Mixed case', 'Data URL']) {
    assert.match(html, new RegExp(`<a href=#ZgotmplZ>${name}</a>`), `${name}: unsafe scheme must be blocked`);
  }
  assert.match(html, /<img src=#ZgotmplZ alt="Bad image"/);
  assert.match(html, /<a href=mailto:hello@example\.org>Email<\/a>/);
  assert.match(html, /<a href=\/>Safe URL<\/a>/, 'same-site absolute links are localized');
  assert.match(html, /<a href=https:\/\/elsewhere\.example\/ target=_blank rel="noopener noreferrer">External<\/a>/);

  const schema = [...html.matchAll(/<script type=application\/ld\+json>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1])).find((entry) => entry['@type'] === 'BlogPosting');
  assert.ok(schema);
  assert.ok(schema.description.includes('An ampersand & a smart quote'));
  assert.ok(!/<[^>]+>|&amp;|&#\d+;/.test(schema.description), 'structured descriptions must be plain text');

  const feed = JSON.parse(await example.read('index.json'));
  assert.ok(!Object.hasOwn(feed, 'description'), 'unset feed description must be omitted, not null');
  assert.deepEqual(feed.authors, [{ name: 'An Author' }], 'empty author URLs must be omitted');
  const item = feed.items.find((entry) => entry.title === 'Plain-text probe');
  assert.ok(item.content_text.includes('END_MARKER'), 'content_text should contain the full post');
  assert.ok(item.content_text.includes('An ampersand & a smart quote ‘like this’'));
  assert.ok(!item.content_text.includes('&amp;'));
  assert.ok(!/<\/?p>|<strong>/.test(item.content_text));
  assert.ok(item.summary.length <= 300);
});

test('multilingual footer offers all languages and falls back to their homepages', async (t) => {
  const example = await site(t, `baseURL="https://example.org/sub/"
title="Multi-language test"
theme="hugo-mini"
defaultContentLanguage="en"
disableKinds=["taxonomy","term"]
[params]
rememberLanguage=true
socialSharing=false
[languages.en]
contentDir="content/en"
${languageLabelKey}="English"
weight=1
[languages.ru]
contentDir="content/ru"
${languageLabelKey}="Русский"
weight=2
[languages.de]
contentDir="content/de"
${languageLabelKey}="Deutsch"
weight=3
`, {
    'en/blog/shared.md': '+++\ntitle="English shared"\ntranslationKey="shared"\n+++\nContent.',
    'ru/blog/shared.md': '+++\ntitle="Russian shared"\ntranslationKey="shared"\n+++\nКонтент.',
    'en/blog/only-en.md': '+++\ntitle="English-only"\n+++\nContent.',
    'de/_index.md': '+++\ntitle="Deutsch start"\n+++\nStart.',
  });

  const shared = await example.read('blog/shared/index.html');
  assert.match(shared, /<details class=lang-menu>/);
  assert.match(shared, /href=https:\/\/example\.org\/sub\/ru\/blog\/shared\/ hreflang=ru class=lang-option data-lang=ru/);
  assert.match(shared, /href=https:\/\/example\.org\/sub\/de\/ hreflang=de class=lang-option data-lang=de/);
  assert.match(shared, /class=lang-option data-lang=en aria-current=page/);
  assert.match(shared, />Deutsch<\/a>/);

  const untranslated = await example.read('blog/only-en/index.html');
  assert.match(untranslated, /href=https:\/\/example\.org\/sub\/ru\/ hreflang=ru class=lang-option/);
});

test('the compact footer switcher supports a language pair other than RU/EN', async (t) => {
  const example = await site(t, `baseURL="https://example.org/"
title="Bilingual test"
theme="hugo-mini"
defaultContentLanguage="fr"
disableKinds=["taxonomy","term"]
[languages.fr]
contentDir="content/fr"
${languageLabelKey}="Français"
weight=1
[languages.es]
contentDir="content/es"
${languageLabelKey}="Español"
weight=2
`, {
    'fr/blog/shared.md': '+++\ntitle="Article français"\ntranslationKey="shared"\n+++\nBonjour.',
    'es/blog/shared.md': '+++\ntitle="Artículo español"\ntranslationKey="shared"\n+++\nHola.',
  });

  const french = await example.read('blog/shared/index.html');
  assert.match(french, /href=https:\/\/example\.org\/es\/blog\/shared\/ class=lang-toggle data-lang=es/);
  assert.match(french, /<span class=lang-label>ES<\/span>/);
  assert.doesNotMatch(french, /class=lang-menu/);

  const spanish = await example.read('es/blog/shared/index.html');
  assert.match(spanish, /href=https:\/\/example\.org\/blog\/shared\/ class=lang-toggle data-lang=fr/);
});

test('muted text has readable contrast in both palettes', async () => {
  const css = await readFile(join(theme, 'assets/css/main.css'), 'utf8');
  const colors = [...css.matchAll(/--color-muted:\s*#([0-9a-f]{6})/gi)].map((match) => match[1]);
  assert.equal(colors.length, 2, 'light and dark muted colors should be explicit');
  function luminance(hex) {
    return hex.match(/../g).map((value) => parseInt(value, 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  }
  function contrast(a, b) {
    const x = luminance(a);
    const y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  assert.ok(contrast(colors[0], 'ffffff') >= 4.5);
  assert.ok(contrast(colors[1], '1a1a1a') >= 4.5);
});

test('recent-posts sidebar remains visible until JavaScript places it in the rail', async () => {
  const css = await readFile(join(theme, 'assets/css/main.css'), 'utf8');
  assert.match(css, /\.recent-sidebar\s*\{\s*display:\s*block;/);
  assert.match(css, /\.recent-sidebar\.is-sidebar\s*\{[^}]*margin-block-start:\s*0\.25rem;/);
});

test('printing keeps article content and date while removing interface chrome', async (t) => {
  const example = await site(t, `baseURL="https://example.org/"
title="Paper test"
theme="hugo-mini"
disableKinds=["taxonomy","term"]
[params]
mainSections=["blog"]
recentSidebarCount=3
`, {
    'blog/post.md': '+++\ntitle="Printable post"\ndate=2026-01-01\n+++\n## Section\n\nRead the article.\n\n```text\nA long line of code\n```',
    'blog/another.md': '+++\ntitle="Another post"\ndate=2025-01-01\n+++\nHello',
  });
  const html = await example.read('blog/post/index.html');
  assert.match(html, /<article class=beauty-reading lang=en(?:\s[^>]*)?>/);
  assert.match(html, /<time datetime=2026-01-01 class=post-date>/);
  assert.match(html, /class="?recent-sidebar/);
  for (const name of ['Telegram', 'Twitter', 'Facebook', 'VK', 'LinkedIn']) {
    assert.ok(html.includes(`aria-label="Share on ${name}"`), `${name}: icon-only sharing has a localized accessible name`);
  }

  const sheetURL = html.match(/<link rel=stylesheet href=([^\s>]+)/)?.[1];
  assert.ok(sheetURL, 'the print rules use the existing theme stylesheet');
  const css = await example.read(new URL(sheetURL, 'https://example.org/').pathname.slice(1));
  const print = css.slice(css.lastIndexOf('@media print')).replace(/\s+/g, '');
  assert.ok(print.startsWith('@mediaprint{'), 'theme rules have their own print media block');
  assert.match(print, /:root\[data-theme=dark\].*color-scheme:light/, 'dark-mode prints on white paper');
  for (const selector of ['.main-nav', '.search-toggle-desktop', '.title-logo-container', 'body>footer', '.likely', '#tg-comments', '.recent-sidebar', '.heading-anchor', '.copy-btn']) {
    assert.ok(print.includes(selector), `${selector} is omitted from paper`);
  }
  assert.match(print, /article\.beauty-reading\{max-inline-size:none/, 'prose can use the paper width');
  assert.match(print, /overflow:visible!important/, 'code and other scroll regions remain printable');
});

test('RSS needs no social accounts and sitemap priorities follow mainSections', async (t) => {
  const example = await site(t, `baseURL="https://example.org/"
title="Minimal blog"
theme="hugo-mini"
disableKinds=["taxonomy","term"]
[params]
mainSections=["writing"]
`, {
    'writing/post.md': '+++\ntitle="A post"\ndate=2026-01-01\n+++\nText.',
    'notes/page.md': '+++\ntitle="Another page"\ndate=2026-01-01\n+++\nText.',
  });

  const home = await example.read('index.html');
  assert.match(home, /class=social-icons>\s*<a\b[^>]*class="?social-icon social-rss"?/, 'a sole RSS icon must render without social links');
  assert.match(home, /href=https:\/\/example\.org\/index\.xml/);
  assert.doesNotMatch(home, /social-(telegram|github|email)/);

  const sitemap = await example.read('sitemap.xml');
  const post = sitemap.match(/<url>\s*<loc>https:\/\/example\.org\/writing\/post\/<\/loc>([\s\S]*?)<\/url>/)?.[1];
  const note = sitemap.match(/<url>\s*<loc>https:\/\/example\.org\/notes\/page\/<\/loc>([\s\S]*?)<\/url>/)?.[1];
  assert.ok(post, 'the custom-section post is in the sitemap');
  assert.ok(note, 'other regular pages are in the sitemap');
  assert.match(post, /<priority>0\.7<\/priority>/, 'main section posts keep the expected priority');
  assert.match(note, /<priority>0\.5<\/priority>/, 'standalone pages retain their lower priority');
});

test('OG headings fit their card, including Cyrillic and long unbroken titles', async (t) => {
  const titles = new Map([
    ['short', 'A quiet corner of the web'],
    ['russian', 'Как создать удобный и быстрый блог без лишних отвлекающих элементов и сложных настроек'],
    ['wide', 'W'.repeat(130)],
    ['long', 'A very long article title with many different words about simplicity and design. '.repeat(5).trim()],
  ]);
  const content = Object.fromEntries([...titles].map(([slug, title]) => [
    `blog/${slug}.md`, `+++\ntitle=${JSON.stringify(title)}\ndate=2026-01-01\n+++\n{{< check-og-title >}}`,
  ]));
  const example = await site(t, `baseURL="https://example.org/"
title="Open Graph"
theme="hugo-mini"
disableKinds=["taxonomy","term"]
`, content, {
    '_shortcodes/check-og-title.html': '{{- $layout := partial "og-title-layout.html" .Page.Title -}}<pre id="og-size">{{ $layout.size }}</pre><pre id="og-lines">{{ $layout.text }}</pre>',
  });

  for (const [slug, title] of titles) {
    const html = await example.read(`blog/${slug}/index.html`);
    const size = Number(html.match(/<pre id=og-size>(\d+)<\/pre>/)?.[1]);
    const wrapped = html.match(/<pre id=og-lines>([\s\S]*?)<\/pre>/)?.[1];
    assert.ok(wrapped, `${slug}: exposes the computed title layout`);
    const lines = wrapped.split('\n');
    assert.ok(lines.length <= 5, `${slug}: title must stay within the five-line area`);
    assert.ok(lines.every((line) => line.length > 0), `${slug}: no blank lines`);
    if (slug === 'short') {
      assert.equal(size, 52, 'ordinary headings retain the established size');
      assert.equal(wrapped, title);
    } else {
      assert.ok(lines.length >= 2, `${slug}: long headings wrap`);
    }
    if (slug === 'russian') assert.equal(lines.join(' ').replace(/\s+/g, ' '), title, 'Cyrillic words stay intact');
    if (slug === 'long') assert.ok(wrapped.endsWith('…'), 'overflowing headings end in an ellipsis');
    const png = await example.readBytes(`blog/${slug}/og.png`);
    assert.equal(png.subarray(1, 4).toString(), 'PNG', `${slug}: rendered a PNG image`);
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
  }
});

test('class-based syntax palettes preserve explicit inline highlighting', async (t) => {
  const example = await site(t, `baseURL="https://example.org/"
theme="hugo-mini"
disableKinds=["taxonomy","term"]
[markup.highlight]
noClasses=false
`, {
    'blog/code.md': '+++\ntitle="Code"\ndate=2026-01-01\n+++\n```python {linenos=inline hl_lines=[2]}\n# comment\nprint("hello", 42)\n```\n\n```python {linenos=table}\nx = 1\n```\n\n```python {noClasses=true style=friendly}\nx = 2\n```',
  });
  const html = await example.read('blog/code/index.html');
  assert.match(html, /class=chroma/);
  assert.match(html, /class=ln/);
  assert.match(html, /class=lntable/);
  assert.match(html, /class="line hl"/);
  assert.match(html, /class=c1/);
  assert.match(html, /style=[^>]*color:/, 'explicit per-block inline styles remain supported');
});

test('syntax text and line numbers retain contrast on normal and highlighted lines', async () => {
  const css = await readFile(join(theme, 'assets/css/main.css'), 'utf8');
  const blocks = [...css.matchAll(/(?:^|\n)\s*\.chroma\s*\{([^}]+)\}|\[data-theme="dark"\] \.chroma\s*\{([^}]+)\}/g)];
  assert.equal(blocks.length, 3, 'light, dark and print palettes are explicit');
  const luminance = (hex) => {
    if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
    return hex.match(/../g).map(v => parseInt(v, 16) / 255)
      .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  };
  for (const block of blocks) {
    const colors = Object.fromEntries([...(block[1] || block[2]).matchAll(/--code-([a-z]+):\s*#([a-f0-9]+);/g)].map(m => [m[1], m[2]]));
    for (const name of ['text', 'muted', 'keyword', 'name', 'string', 'number']) {
      for (const background of ['background', 'highlight']) {
        const a = luminance(colors[name]), b = luminance(colors[background]);
        assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, `${name} on ${background}: ${JSON.stringify(colors)}`);
      }
    }
  }
});

test('legacy Beauty aliases match complete tokens and preserve longer class names', async (t) => {
  const example = await site(t, 'baseURL="https://example.org/"\ntheme="hugo-mini"\ndisableKinds=["taxonomy","term"]', {}, {
    '_partials/custom_body.html': `{{ $css := ":where(.beauty-caption){color:red}:where(.beauty-caption-extra){color:blue}:where(.beauty-buttonish){color:green}:where(.beauty-button:hover){color:black}" }}<div id="compat-probe" data-css="{{ partial "beauty-compat.html" $css }}"></div>`,
  });
  const html = await example.read('index.html');
  assert.ok(html.includes(':is(.beauty-caption,.caption)'));
  assert.ok(html.includes(':is(.beauty-button,.button):hover'));
  assert.ok(html.includes(':where(.beauty-caption-extra)'));
  assert.ok(html.includes(':where(.beauty-buttonish)'));
  assert.ok(!html.includes('.caption)-extra'));
});


test('the pinned Beauty aliases preserve the caption credit modifier', async (t) => {
  const example = await site(t, 'baseURL="https://example.org/"\ntheme="hugo-mini"\ndisableKinds=["taxonomy","term"]', {}, {
    '_partials/custom_body.html': `{{ with resources.Get "css/beauty.css" }}
      {{ $css := partial "beauty-compat.html" .Content }}
      <div id="compat-credit">{{ in $css ":is(.beauty-caption,.caption).beauty-caption-credit" }}</div>
      <div id="compat-corrupted">{{ in $css ":is(.beauty-caption,.caption)-credit" }}</div>
    {{ end }}`,
  });
  const html = await example.read('index.html');
  assert.match(html, /<div id=compat-credit>true<\/div>/);
  assert.match(html, /<div id=compat-corrupted>false<\/div>/);
});


test('site fonts use fingerprinted assets and keep default-font pages isolated', async (t) => {
  const regular = await readFile(join(theme, 'static/fonts/inter-v20-cyrillic_cyrillic-ext_latin_latin-ext-300.woff2'));
  const bold = await readFile(join(theme, 'static/fonts/inter-v20-cyrillic_cyrillic-ext_latin_latin-ext-600.woff2'));
  const example = await site(t, `baseURL="https://example.org/sub/"
theme="hugo-mini"
disableKinds=["taxonomy","term"]
[params.fonts]
family="Site Font"
[[params.fonts.faces]]
source="private/regular.woff2"
weight=400
preload=true
[[params.fonts.faces]]
source="private/bold.woff2"
weight=700
preload=true
`, {
    'custom.md': '+++\ntitle="Custom"\n+++\nBody text.',
    'default.md': '+++\ntitle="Default"\nuseDefaultFonts=true\n+++\nBody text.',
  }, {}, { 'private/regular.woff2': regular, 'private/bold.woff2': bold });
  const custom = await example.read('custom/index.html');
  const standard = await example.read('default/index.html');
  assert.doesNotMatch(custom, /rel=preload[^>]+inter-v20/);
  assert.match(custom, /href=\/sub\/private\/regular\.[a-f0-9]{64}\.woff2 as=font/);
  assert.match(standard, /rel=preload[^>]+inter-v20/);
  assert.doesNotMatch(standard, /private\//);
  const cssPath = html => html.match(/<link rel=stylesheet href=([^ >]+)/)[1].replace(/^\/sub\//, '');
  assert.notEqual(cssPath(custom), cssPath(standard), 'font profiles cannot share a cached stylesheet target');
  const css = await example.read(cssPath(custom));
  assert.match(css, /font-family:["']?Site Font/i);
  assert.match(css, /--font-weight-body:400/);
  assert.match(css, /--font-weight-bold:700/);
  assert.match(css, /font-synthesis:none/);
  assert.match(css, /main :is\(strong,b\) :is\(em,i\)/, 'missing bold italic uses the real upright bold face');
  assert.doesNotMatch(css, /inter-v20/);
  const defaultCSS = await example.read(cssPath(standard));
  assert.match(defaultCSS, /--font-weight-body:300/);
  assert.doesNotMatch(defaultCSS, /Site Font|private\//);
  const url = custom.match(/href=\/sub\/(private\/regular\.[a-f0-9]{64}\.woff2)/)[1];
  assert.deepEqual(await example.readBytes(url), regular, 'the font is emitted without conversion');
});

test('a separate H1 family uses its own weight and keeps body fonts isolated', async (t) => {
  const regular = await readFile(join(theme, 'static/fonts/inter-v20-cyrillic_cyrillic-ext_latin_latin-ext-300.woff2'));
  const bold = await readFile(join(theme, 'static/fonts/inter-v20-cyrillic_cyrillic-ext_latin_latin-ext-600.woff2'));
  const title = await readFile(join(theme, 'static/fonts/inter-v20-cyrillic_cyrillic-ext_latin_latin-ext-500.woff2'));
  const config = `baseURL="https://example.org/"
theme="hugo-mini"
disableKinds=["taxonomy","term"]
[params.fonts]
family="Body Font"
titleWeight=500
[[params.fonts.faces]]
source="private/regular.woff2"
weight=400
[[params.fonts.faces]]
source="private/bold.woff2"
weight=700
[params.fonts.title]
family="Title Font"
source="private/title.woff2"
preload=true
`;
  const content = {
    'custom.md': '+++\ntitle="Custom"\n+++\n## Section\n\nBody text.',
    'default.md': '+++\ntitle="Default"\nuseDefaultFonts=true\n+++\nBody text.',
  };
  const assets = {'private/regular.woff2':regular, 'private/bold.woff2':bold, 'private/title.woff2':title};
  const example = await site(t, config, content, {}, assets);
  const html = await example.read('custom/index.html');
  const cssPath = html.match(/<link rel=stylesheet href=([^ >]+)/)[1].slice(1);
  const css = await example.read(cssPath);
  assert.match(html, /href=\/private\/title\.[a-f0-9]{64}\.woff2 as=font/);
  assert.match(css, /@font-face\{font-family:["']?Title Font["']?;font-style:normal;font-weight:500;/i);
  assert.match(css, /--font-main:["']?Body Font/);
  assert.match(css, /--font-secondary:["']?Body Font/);
  assert.match(css, /--font-title:["']?Title Font["']?,\s*var\(--font-main\)/);
  assert.match(css, /--font-weight-title:500/);
  assert.match(css, /--beauty-h1-font:[^;]+var\(--font-title\)/);
  assert.match(css, /--beauty-h2-font:[^;]+var\(--font-main\)/);
  assert.doesNotMatch(await example.read('default/index.html'), /private\//);
  const url = html.match(/href=\/(private\/title\.[a-f0-9]{64}\.woff2)/)[1];
  assert.deepEqual(await example.readBytes(url), title);
  await assert.rejects(site(t, config, content, {}, {'private/regular.woff2':regular, 'private/bold.woff2':bold}), /fonts: missing site asset/);
  await assert.rejects(site(t, config.replace('family="Title Font"', 'family="Body Font"'), content, {}, assets), /fonts.title.family must differ/);
  await assert.rejects(site(t, config.replace('family="Title Font"', 'family="Bad; Font"'), content, {}, assets), /fonts.title.family must be a plain/);
  await assert.rejects(site(t, config.replace('titleWeight=500', 'titleWeight=500\nboldWeight=500'), content, {}, assets), /fonts: bold weight 500 has no normal face/);
});

test('visible titles receive typography while metadata and escaped markup stay intact', async (t) => {
  const title = 'Управление продуктом — это управление маркетингом';
  const example = await site(t, `baseURL="https://example.org/"
theme="hugo-mini"
defaultContentLanguage="ru"
disableKinds=["taxonomy","term"]
[outputs]
home=["HTML","JSON"]
[params]
socialSharing=false
`, {
    '_index.md': '+++\ntitle="Главная"\n+++\n{{< latest-posts count="7" >}}',
    'blog/normal.md': `+++\ntitle="${title}"\ndate=2026-01-02\n+++\nТекст.`,
    'blog/raw.md': `+++\ntitle="Текст — без обработки"\ntypography=false\ndate=2026-01-01\n+++\nТекст.`,
    'safe.md': '+++\ntitle=\'Заголовок <img src=x onerror=alert(1)> & текст\'\n+++\nТекст.',
  });
  const titleHTML = 'Управление продуктом\u00a0— это управление маркетингом';
  for (const path of ['index.html', 'blog/index.html', 'blog/normal/index.html', 'blog/raw/index.html']) {
    assert.ok((await example.read(path)).includes(titleHTML), `${path}: visible title is formatted`);
  }
  assert.match(await example.read('blog/raw/index.html'), /<h1>Текст — без обработки<\/h1>/);
  const safe = await example.read('safe/index.html');
  assert.match(safe, /<h1>Заголовок &lt;img src=x onerror=alert\(1\)(?:&gt;|>) (?:&amp;|&) текст<\/h1>/);
  assert.doesNotMatch(safe.match(/<main>[\s\S]*?<\/main>/)[0], /<img src=x/);
  const feed = JSON.parse(await example.read('index.json'));
  assert.equal(feed.items.find(item => item.url.endsWith('/blog/normal/')).title, title);
});

test('Markdown table dates stay semantic without changing alignment, code or invalid dates', async (t) => {
  const example = await site(t, `baseURL="https://example.org/"
theme="hugo-mini"
disableKinds=["taxonomy","term"]
[markup.goldmark.parser.attribute]
block=true
`, {
    'dates.md': '+++\ntitle="Dates"\n+++\n| ID | Date | Note |\n| :--- | ---: | :---: |\n| value | 2024-02-29 | **Bold** |\n| value | 2023-02-29 | `2024-02-29` |\n| value | 2024-13-01 | [2024-02-29](https://example.org/) |\n{#records .data-table}\n',
  });
  const html = await example.read('dates/index.html');
  assert.match(html, /<table[^>]*id=records/);
  assert.match(html, /class=data-table/);
  assert.match(html, /<td style=text-align:right><time datetime=2024-02-29>2024-02-29<\/time><\/td>/);
  assert.match(html, /<td style=text-align:right>2023-02-29<\/td>/);
  assert.match(html, /<td style=text-align:right>2024-13-01<\/td>/);
  assert.match(html, /<code>2024-02-29<\/code>/);
  assert.match(html, /<td style=text-align:center><strong>Bold<\/strong><\/td>/);
});

test('an explicitly configured missing site font fails the build', async (t) => {
  await assert.rejects(site(t, `baseURL="https://example.org/"
theme="hugo-mini"
disableKinds=["taxonomy","term"]
[params.fonts]
family="Site Font"
[[params.fonts.faces]]
source="private/missing.woff2"
weight=400
`, {}), /fonts: missing site asset/);
});
