// A fresh Hugo build for every browser run. Never reuse a developer's server.
import { mkdtemp, mkdir, writeFile, readFile, cp, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';

const theme = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv.includes('--site') ? process.cwd() : null;
const root = await mkdtemp(join(tmpdir(), 'hugo-browser-'));
const output = join(root, 'public');
const require = createRequire(import.meta.url);
try {
  await mkdir(join(root, 'themes'));
  await symlink(theme, join(root, 'themes/hugo-mini'));
  if (source) {
    await cp(join(source, 'content'), join(root, 'content'), { recursive: true });
    for (const dir of ['assets', 'layouts', 'data', 'i18n', 'static']) await symlink(join(source, dir), join(root, dir));
  }
  const contentDir = join(root, source ? 'content/ru' : 'content');
  await mkdir(contentDir, { recursive: true });
  await cp(join(theme, 'tests/browser/fixtures/contract.md'), join(contentDir, 'browser-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/editorial.md'), join(contentDir, 'editorial-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/dropcap.md'), join(contentDir, 'dropcap-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/side-notes.md'), join(contentDir, 'side-note-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/article-links.md'), join(contentDir, 'article-link-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/page-links.md'), join(contentDir, 'page-link-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/dropcap-word.md'), join(contentDir, 'dropcap-word-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/wide-images.md'), join(contentDir, 'wide-image-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/wide-code.md'), join(contentDir, 'wide-code-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/wide-diagrams.md'), join(contentDir, 'wide-diagram-checks.md'));
  await cp(join(theme, 'tests/browser/fixtures/resume.md'), join(contentDir, 'resume-checks.md'));
  if (!source) {
    await writeFile(join(contentDir, 'about.md'), '+++\ntitle="About & contact"\n+++\nNavigation destination.\n');
    await mkdir(join(contentDir, 'blog'));
    for (const [name, date, extra] of [
      ['first', '2001-01-01', 'pinned=true'], ['middle', '2002-01-01', ''],
      ['hidden', '2002-06-01', 'hidden=true'], ['last', '2003-01-01', ''],
    ]) await writeFile(join(contentDir, 'blog', name + '.md'), `+++\ntitle="${name}"\ndate=${date}\n${extra}\n+++\nArticle text.\n`);
  }
  // Overlay only test content and a self-hosted diagram library. The consuming
  // site's real configuration, fonts, content and asset pipeline stay active.
  const fixtureStatic = join(root, 'fixture-static');
  const mermaid = dirname(require.resolve('mermaid'));
  const target = join(fixtureStatic, 'browser-mermaid');
  await mkdir(target, { recursive: true });
  await writeFile(join(fixtureStatic, 'browser-wide.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#b8cbd4"/><path d="M0 0L1200 800M1200 0L0 800" stroke="#345" stroke-width="4"/></svg>');
  await cp(join(mermaid, 'mermaid.esm.min.mjs'), join(target, 'mermaid.esm.min.mjs'));
  await cp(join(mermaid, 'chunks/mermaid.esm.min'), join(target, 'chunks/mermaid.esm.min'), {
    recursive: true, filter: path => !path.endsWith('.map'),
  });
  const overlay = join(root, 'browser.toml');
  await writeFile(overlay, `${source ? '' : 'theme="hugo-mini"\ntitle="Browser checks"\ndisableKinds=["taxonomy","term"]\n'}
staticDir=[${JSON.stringify(fixtureStatic)}, "static"]
${source ? '' : `[[menu.main]]
name="Articles"
url="/blog/"
weight=1
[[menu.main]]
name="About & contact"
url="/about/"
weight=2
[[menu.main]]
name="Subscribe"
url="https://example.org/"
weight=3
[menu.main.params]
icon="telegram"
`}
[params]
mermaidModuleSrc="browser-mermaid/mermaid.esm.min.mjs"
socialSharing=false
[markup.goldmark.renderer]
unsafe=true
`);
  const config = source ? (process.env.BROWSER_HUGO_CONFIG || 'config.toml').split(',').map(file => resolve(source, file)) : [];
  execFileSync(process.env.HUGO_BIN || 'hugo', ['--source', root, '--config', [...config, overlay].join(','), '--baseURL', `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || 4174}/`, '--minify', '--panicOnWarning', '--cacheDir', join(root, 'cache')], { stdio: 'inherit' });
} catch (error) {
  await rm(root, { recursive: true, force: true });
  throw error;
}

const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', svg: 'image/svg+xml', woff2: 'font/woff2', otf: 'font/otf', png: 'image/png', webp: 'image/webp', json: 'application/json' };
const server = createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const path = resolve(output, '.' + pathname);
    if (!path.startsWith(output + sep)) throw new Error('Outside output');
    response.setHeader('Content-Type', types[path.split('.').at(-1)] || 'application/octet-stream');
    response.end(await readFile(path));
  } catch { response.statusCode = 404; response.end('Not found'); }
});
server.listen(Number(process.env.PLAYWRIGHT_PORT || 4174), '127.0.0.1');
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => {
  server.closeAllConnections();
  server.close();
  await rm(root, { recursive: true, force: true });
  process.exit(0);
});
