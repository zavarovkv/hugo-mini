import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, symlink, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {indexSite, publishedFiles} from '../scripts/hugo-search.mjs';

const theme=fileURLToPath(new URL('..',import.meta.url));
test('published page paths handle quoted titles, languages and subdirectories',()=>{
  const csv='title,kind,permalink\r\n"A, \"\"quoted\"\"\nheading",page,https://example.org/blog/one/\r\nHome,home,https://example.org/blog/\r\nTwo,page,https://example.org/blog/en/two.html\r\n';
  assert.deepEqual(publishedFiles(csv,'https://example.org/blog/'),['one/index.html','en/two.html']);
  assert.throws(()=>publishedFiles('title,other\nA,B\n','/'),/Unexpected Hugo/);
});
test('real indexes exclude nonpublic pages, remove deleted pages and refresh edited content', async t=>{
  const root=await mkdtemp(join(tmpdir(),'mini-search-build-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  await mkdir(join(root,'themes'));await symlink(theme,join(root,'themes/hugo-mini'));
  await mkdir(join(root,'content'));
  await writeFile(join(root,'hugo.toml'),'theme="hugo-mini"\nbaseURL="https://example.org/sub/"\ndisableKinds=["taxonomy","term"]\n[params]\nsearch=true\nsocialSharing=false\n');
  const content={
    visible:'', removed:'', hidden:'hidden=true', noindex:'noindex=true', optout:'search=false',
    draft:'draft=true', future:'publishDate=2099-01-01', expired:'expiryDate=2000-01-01', resume:'layout="resume"',
  };
  for(const [name,flags] of Object.entries(content)) await writeFile(join(root,'content',name+'.md'),`+++\ntitle="${name}"\n${flags}\n+++\n${name} quartzoriginal\n`);
  const build=()=>execFileSync(process.env.HUGO_BIN || 'hugo',['--source',root,'--minify','--cleanDestinationDir','--buildDrafts','--buildFuture','--buildExpired'],{stdio:'pipe'});
  const output=join(root,'public');
  build(); await indexSite(output);
  let entry=JSON.parse(await readFile(join(output,'pagefind/pagefind-entry.json'),'utf8'));
  assert.equal(entry.languages.en.page_count,2);
  const original=entry.languages.en.hash;
  await rm(join(root,'content/removed.md'));
  await writeFile(join(root,'content/visible.md'),'+++\ntitle="Changed title"\n+++\nquartzupdated\n');
  build(); await indexSite(output);
  entry=JSON.parse(await readFile(join(output,'pagefind/pagefind-entry.json'),'utf8'));
  assert.equal(entry.languages.en.page_count,1,'deleted HTML cannot remain in the search index');
  assert.notEqual(entry.languages.en.hash,original,'edited content creates a new index');
  await writeFile(join(root,'hugo.toml'),'theme="hugo-mini"\nbaseURL="https://example.org/"\ndisableKinds=["taxonomy","term"]\n');
  build();
  assert.doesNotMatch(await readFile(join(output,'visible/index.html'),'utf8'),/id=site-search|class="search-toggle/);
  await assert.rejects(indexSite(output),/No searchable pages/,'never fall back to indexing every body when search is disabled');
});
