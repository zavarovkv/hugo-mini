import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, symlink, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const theme = resolve(dirname(fileURLToPath(import.meta.url)), '..');
test('editorial helpers preserve text, protected content, metadata and opt-outs', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mini-editorial-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  await mkdir(join(root, 'themes')); await symlink(theme, join(root, 'themes/hugo-mini'));
  await mkdir(join(root, 'content/blog'), {recursive:true});
  await writeFile(join(root, 'hugo.toml'), `theme="hugo-mini"\nbaseURL="https://example.org/"\ndisableKinds=["taxonomy","term"]\n[params]\nhangingQuotes=true\nproseNumerals=true\nsocialSharing=false\n[markup.goldmark.renderer]\nunsafe=true\n`);
  const body = `<h2 id="math-first">\\(x\\) «Later quote»</h2>\n\n## «Heading»\n\n> «A quote in 2021».\n\n> **“Emphasized quote”**\n\n<p id="ordinary">«Ordinary paragraph» in 2021. Date: 10/11/2026. Score: 7/10.</p>\n\n<blockquote data-typography="off"><p>«Literal quotation»</p></blockquote>\n\n<blockquote><p data-typography="off">«Another literal quotation»</p></blockquote>\n\n<pre><code>«Raw code»</code></pre>\n\nA fraction: {{< fraction "1/3" >}}.\n`;
  const inset = ['<ol><li><p>«List paragraph»</p></li></ol>', '<table><tr><td><p>«Table paragraph»</p></td></tr></table>', '<figure><figcaption><p>«Caption paragraph»</p></figcaption></figure>', '<aside><p>«Aside paragraph»</p></aside>'];
  const after = '<p id="after-inset">«Prose after nested blocks»</p>';
  for (const [slug,options] of [['enabled',''],['disabled','hangingQuotes=false\nproseNumerals=false'],['verbatim','typography=false']]) {
    await writeFile(join(root, 'content/blog', slug+'.md'), `+++\ntitle='«Opening»'\n${options}\n+++\n${body}\n${inset.join("\n\n")}\n${after}`);
  }
  const build = () => execFileSync(process.env.HUGO_BIN || 'hugo', ['--source',root,'--panicOnWarning'], {stdio:'pipe'});
  build();
  const read = name => readFile(join(root,'public/blog',name,'index.html'),'utf8');
  const enabled = await read('enabled');
  assert.match(enabled, /<h1><span class="beauty-hanging-open">(?:«|&laquo;)<\/span>Opening/);
  assert.match(enabled, /<h2[^>]*><span class="beauty-hanging-open">(?:«|&laquo;)<\/span>Heading/);
  assert.match(enabled, /<p><span class="beauty-hanging-open">(?:«|&laquo;)<\/span>A quote/);
  assert.match(enabled, /<strong><span class="beauty-hanging-open">(?:“|&ldquo;)<\/span>Emphasized quote/);
  assert.match(enabled, /class="beauty-reading beauty-prose-numerals"/);
  assert.doesNotMatch(enabled.match(/<h2 id="math-first">(.*?)<\/h2>/s)[1], /beauty-hanging-open/);
  assert.match(enabled, /<span class="beauty-fraction"><span>1<\/span>\/<span>3<\/span><\/span>/);
  assert.match(enabled, /Date: 10\/11\/2026\. Score: 7\/10/);
  assert.match(enabled, /<p id="ordinary"><span class="beauty-hanging-open">«<\/span>Ordinary paragraph»/);
  for (const fragment of inset) assert.ok(enabled.includes(fragment), 'inset paragraph alignment is preserved');
  assert.match(enabled, /<p id="after-inset"><span class="beauty-hanging-open">«<\/span>Prose after/);
  assert.match(enabled, /<blockquote data-typography="off"><p>«Literal quotation»<\/p><\/blockquote>/);
  assert.match(enabled, /<p data-typography="off">«Another literal quotation»<\/p>/);
  assert.match(enabled, /<pre><code>«Raw code»<\/code><\/pre>/);
  assert.doesNotMatch(enabled.match(/<title>(.*?)<\/title>/s)[1], /span/);
  for (const name of ['disabled','verbatim']) assert.doesNotMatch(await read(name), /<span class="beauty-hanging-open">/);
  assert.doesNotMatch(await read('disabled'), /class="beauty-reading beauty-prose-numerals"/);
  for (const invalid of ['"1/0"','"10/11/2026"','"one/three"','"1/3" "2/3"']) {
    await writeFile(join(root,'content/blog/invalid.md'), `+++\ntitle="Invalid"\n+++\n{{< fraction ${invalid} >}}`);
    assert.throws(build, /fraction: provide one explicit fraction/);
  }
});
