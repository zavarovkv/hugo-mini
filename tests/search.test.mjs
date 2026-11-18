import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, symlink, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync, spawn} from 'node:child_process';
import {once} from 'node:events';
import {setTimeout as delay} from 'node:timers/promises';
import {indexSite, publishedFiles} from '../scripts/hugo-search.mjs';

const theme=fileURLToPath(new URL('..',import.meta.url));
test('published page paths handle quoted titles, languages and subdirectories',()=>{
  const csv='title,kind,permalink\r\n"A, \"\"quoted\"\"\nheading",page,https://example.org/blog/one/\r\nHome,home,https://example.org/blog/\r\nTwo,page,https://example.org/blog/en/two.html\r\n';
  assert.deepEqual(publishedFiles(csv,'https://example.org/blog/'),['one/index.html','en/two.html']);
  assert.deepEqual(publishedFiles(csv,'https://example.org/blog'),['one/index.html','en/two.html']);
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
    draft:'draft=true', future:'publishDate=2099-01-01', expired:'expiryDate=2000-01-01',
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

test('development honors a baseURL override, config changes, edits and removals', {timeout: 60_000}, async t => {
  const root = await mkdtemp(join(tmpdir(), 'mini-search-watch-'));
  let server;
  t.after(async () => {
    if (server && server.exitCode === null && server.signalCode === null) {
      const stopped = once(server, 'exit');
      server.kill('SIGTERM');
      await stopped;
    }
    await rm(root, {recursive: true, force: true});
  });
  await mkdir(join(root, 'themes'));
  await symlink(theme, join(root, 'themes/hugo-mini'));
  await mkdir(join(root, 'content'));
  const config = enabled => `theme="hugo-mini"\nbaseURL="https://example.org/"\ndisableKinds=["taxonomy","term"]\n[params]\nsearch=${enabled}\n`;
  await writeFile(join(root, 'hugo.toml'), config(false));
  for (const name of ['one', 'two']) await writeFile(join(root, 'content', name + '.md'), `+++\ntitle="${name}"\n+++\nInitial quartz content.\n`);
  server = spawn(process.execPath, [join(theme, 'scripts/hugo-search.mjs'), 'dev', '--source', root,
    '--baseURL', 'http://localhost/nested/', '--port', '0'], {cwd: theme, stdio: ['ignore', 'pipe', 'pipe']});
  let log = '';
  server.stdout.on('data', chunk => { log += chunk; });
  server.stderr.on('data', chunk => { log += chunk; });
  async function waitFor(predicate) {
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline && server.exitCode === null) {
      if (await predicate()) return;
      await delay(50);
    }
    assert.fail(log);
  }
  async function entry() {
    try { return JSON.parse(await readFile(join(root, 'public/pagefind/pagefind-entry.json'), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT' || error instanceof SyntaxError) return null; throw error; }
  }
  await waitFor(() => log.includes('Web Server is available'));
  // The server must notice search being enabled without a process restart.
  await writeFile(join(root, 'hugo.toml'), config(true));
  await waitFor(async () => (await entry())?.languages.en?.page_count === 2);
  let indexed = await entry();
  assert.equal(indexed.languages.en.page_count, 2);
  const original = indexed.languages.en.hash;
  await writeFile(join(root, 'content/one.md'), '+++\ntitle="Changed"\n+++\nUpdated quartz content.\n');
  await waitFor(async () => { const value = await entry(); return value && value.languages.en.hash !== original; });
  indexed = await entry();
  assert.notEqual(indexed.languages.en.hash, original);
  await rm(join(root, 'content/two.md'));
  await waitFor(async () => (await entry())?.languages.en?.page_count === 1);
  indexed = await entry();
  assert.equal(indexed.languages.en.page_count, 1, 'stale Hugo output must not keep deleted pages searchable');
  const remaining = join(root, 'content/one.md');
  await writeFile(remaining, '+++\ntitle="Private"\nsearch=false\n+++\nNot searchable.\n');
  await waitFor(async () => (await entry()) === null);
  await writeFile(remaining, '+++\ntitle="Visible again"\n+++\nSearchable.\n');
  await waitFor(async () => (await entry())?.languages.en?.page_count === 1);
  await writeFile(join(root, 'hugo.toml'), config(false));
  await waitFor(async () => (await entry()) === null);
});
