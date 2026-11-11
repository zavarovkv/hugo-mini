import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, symlink, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const theme = fileURLToPath(new URL('..', import.meta.url));
test('editorial quotations preserve paragraphs, lists and punctuation in both languages', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mini-quotes-'));
  t.after(() => rm(root, {recursive:true, force:true}));
  await mkdir(join(root, 'themes'));
  await symlink(theme, join(root, 'themes/hugo-mini'), 'dir');
  await writeFile(join(root, 'hugo.toml'), `baseURL="https://example.org/"
theme="hugo-mini"
defaultContentLanguage="en"
disableKinds=["taxonomy","term"]
[params]
editorialQuotes=true
socialSharing=false
[markup.goldmark.renderer]
unsafe=true
[languages.en]
contentDir="content/en"
[languages.ru]
contentDir="content/ru"
`);
  const cases = {
    plain: '> First sentence.\n>\n> Second sentence.',
    marked: '> «Готовая цитата».',
    english: '> “Already quoted.”',
    question: '> Question?',
    ellipsis: '> Wait...',
    emphasis: '> A **strong ending.**',
    link: '> [A link](https://other.example/?a=1&b=2).',
    list: '> Steps:\n>\n> 1. First\n> 2. Last',
    code: '> ```js\n> const x = "quoted";\n> ```',
    nested: '> Outer\n>\n> > Inner.',
    lead: '<p class="beauty-lead">A thesis.</p>',
    framed: '{{< callout >}}\nA framed thesis.\n{{< /callout >}}',
    off: '> Unchanged.',
  };
  for (const lang of ['ru','en']) {
    await mkdir(join(root, `content/${lang}/blog`), {recursive:true});
    for (const [name, body] of Object.entries(cases)) {
      await writeFile(join(root, `content/${lang}/blog/${name}.md`), `+++\ntitle="Fixture"\n${name === 'off' ? 'editorialQuotes=false\n' : ''}+++\n${body}`);
    }
  }
  execFileSync(process.env.HUGO_BIN || 'hugo', ['--source',root,'--panicOnWarning'], {stdio:'pipe'});
  for (const lang of ['ru','en']) {
    const read = async name => {
      const html = await readFile(join(root, `public/${lang === 'en' ? '' : 'ru/'}blog/${name}/index.html`),'utf8');
      return html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)[1].replaceAll('&raquo;', '»').replaceAll('&ldquo;', '“').replaceAll('&rdquo;', '”');
    };
    const plain = await read('plain');
    assert.match(plain, /class="beauty-quotation quotation-reading"/);
    assert.equal((plain.match(/beauty-hanging-open/g)||[]).length,1);
    assert.equal((plain.match(/<p>/g)||[]).length,2);
    assert.match(plain, lang === 'ru' ? /Second sentence»\.<\/p>/ : /Second sentence.”<\/p>/);
    assert.equal(((await read('marked')).match(/beauty-hanging-open/g)||[]).length,1);
    assert.equal(((await read('english')).match(/beauty-hanging-open/g)||[]).length,1);
    assert.match(await read('question'), lang === 'ru' ? /Question\?»/ : /Question\?”/);
    assert.doesNotMatch(await read('ellipsis'), /\.\.»\./);
    assert.match(await read('emphasis'), /<strong>strong ending/);
    assert.match(await read('emphasis'), lang === 'ru' ? /ending<\/strong>»\./ : /ending\.<\/strong>”/);
    assert.match(await read('link'), /href="https:\/\/other.example\/\?a=1&amp;b=2"/);
    const list = await read('list');
    assert.match(list, /<ol>/);
    assert.equal((list.match(/<li>/g)||[]).length,2);
    assert.equal((list.match(/beauty-hanging-open/g)||[]).length,1);
    assert.doesNotMatch(await read('code'), /beauty-hanging-open/);
    assert.equal(((await read('nested')).match(/beauty-hanging-open/g)||[]).length,1);
    assert.match(await read('lead'), /<p class="beauty-lead">A thesis\.<\/p>/);
    assert.match(await read('framed'), /class="beauty-callout"/);
    assert.doesNotMatch(await read('off'), /beauty-quotation|beauty-hanging-open/);
  }
});
