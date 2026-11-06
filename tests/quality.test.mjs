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

async function site(t, config, content) {
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
  execFileSync(process.env.HUGO_BIN || 'hugo', ['--source', root, '--minify', '--panicOnWarning'], { stdio: 'pipe' });
  return {
    read: (name) => readFile(join(root, 'public', name), 'utf8'),
  };
}

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
  assert.match(css, /\.recent-sidebar\.is-sidebar\s*\{\s*margin-top:\s*0;/);
});
