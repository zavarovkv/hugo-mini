#!/usr/bin/env node
// Hugo + a pinned, locally installed Pagefind. No network requests at build time.
import { spawn, execFileSync } from 'node:child_process';
import { readdir, readFile, rm, mkdir, mkdtemp, copyFile } from 'node:fs/promises';
import { resolve, join, dirname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const children = new Set();
function run(command, args, options = {}) {
  return new Promise((accept, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    children.add(child);
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      children.delete(child);
      if (code === 0) accept();
      else reject(new Error(`${command} ${args[0] || ''} failed (${signal || code}).`));
    });
  });
}

export async function indexSite(site, { clean = true, files } = {}) {
  site = resolve(site);
  // Hugo's incremental server can leave removed HTML behind. For development,
  // crawl an HTML-only snapshot of its current published-page list.
  const snapshot = files ? await mkdtemp(join(tmpdir(), 'mini-search-index-')) : null;
  try {
    if (snapshot) for (const file of files) {
      const source = resolve(site, file), target = resolve(snapshot, file);
      if (!source.startsWith(site + sep) || !target.startsWith(snapshot + sep)) throw new Error('Invalid published page path.');
      await mkdir(dirname(target), { recursive: true });
      try { await copyFile(source, target); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    // Never let Pagefind's whole-body fallback index an empty or excluded site.
    let eligible = false;
    async function inspect(dir) {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        if (entry.name === 'pagefind') continue;
        const path = join(dir, entry.name);
        if (entry.isDirectory()) await inspect(path);
        else if (entry.name.endsWith('.html') && /<main\b[^>]*\bdata-pagefind-body(?:\s|>|=)/.test(await readFile(path, 'utf8'))) eligible = true;
        if (eligible) return;
      }
    }
    await inspect(snapshot || site);
    if (!eligible) throw new Error(`No searchable pages in ${site}. Enable params.search and build Hugo first.`);
    if (clean) await rm(join(site, 'pagefind'), { recursive: true, force: true });
    await run(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--no-install', 'pagefind', '--site', snapshot || site, '--output-path', join(site, 'pagefind'),
      '--exclude-selectors', '.heading-anchor, .footnote-backref, .copy-btn', '--quiet']);
    console.log(`Search index updated: ${join(site, 'pagefind')}`);
  } finally { if (snapshot) await rm(snapshot, { recursive: true, force: true }); }
}

// Hugo's list command emits RFC-style CSV, including quoted multiline titles.
export function publishedFiles(csv, baseURL) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (ch === '"') {
      if (quoted && csv[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (ch === ',' || ch === '\n')) {
      row.push(field); field = '';
      if (ch === '\n') { rows.push(row); row = []; }
    } else if (ch !== '\r' || quoted) field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const columns = rows.shift();
  if (!columns?.includes('kind') || !columns.includes('permalink')) throw new Error('Unexpected Hugo published-page list.');
  const prefix = new URL(baseURL || '/', 'https://example.org').pathname;
  return rows.filter(record => record[columns.indexOf('kind')] === 'page').map(record => {
    const pathname = new URL(record[columns.indexOf('permalink')], 'https://example.org').pathname;
    if (!pathname.startsWith(prefix)) throw new Error('Published URL is outside baseURL.');
    const file = decodeURIComponent(pathname.slice(prefix.length));
    return file.endsWith('/') ? file + 'index.html' : file;
  });
}

function option(args, names, fallback) {
  for (let i = 0; i < args.length; i++) {
    for (const name of names) {
      if (args[i] === name) return args[i + 1];
      if (args[i].startsWith(name + '=')) return args[i].slice(name.length + 1);
    }
  }
  return fallback;
}

async function main() {
  const [mode = 'build', ...raw] = process.argv.slice(2);
  const args = raw.filter(arg => arg !== '--');
  if (mode === 'index') return indexSite(option(args, ['--site'], 'public'));
  if (!['build', 'dev'].includes(mode)) throw new Error('Usage: hugo-search.mjs build|dev [Hugo flags], or index --site public');
  const configArgs = [];
  for (const [long, short] of [['--source', '-s'], ['--config'], ['--configDir'], ['--themesDir'], ['--environment', '-e'], ['--destination', '-d'], ['--baseURL', '-b']]) {
    const value = option(args, [long, short].filter(Boolean));
    if (value !== undefined) configArgs.push(long, value);
  }
  const hugo = process.env.HUGO_BIN || 'hugo';
  if (mode === 'dev' && !option(args, ['--environment', '-e'])) configArgs.push('--environment', 'development');
  const config = JSON.parse(execFileSync(hugo, ['config', '--format', 'json', ...configArgs], { encoding: 'utf8' }));
  const source = resolve(option(args, ['--source', '-s'], '.'));
  const output = resolve(source, config.publishdir || 'public');
  const enabled = config.params?.search === true;
  if (mode === 'build') {
    await run(hugo, ['--minify', '--panicOnWarning', '--cleanDestinationDir', ...args]);
    if (enabled) await indexSite(output);
    return;
  }

  let timer, running = false, pending = false, stopping = false;
  async function refresh() {
    if (!enabled || stopping) return;
    if (running) { pending = true; return; }
    running = true;
    do {
      pending = false;
      try {
        const csv = execFileSync(hugo, ['list', 'published', ...configArgs], { encoding: 'utf8' });
        await indexSite(output, { clean: false, files: publishedFiles(csv, config.baseurl) });
      }
      catch (error) { console.error(`Search: ${error.message}`); }
    } while (pending && !stopping);
    running = false;
  }
  // Hugo 0.146+ serves from disk by default. Full rendering keeps unvisited
  // pages current in the index as well as in the browser.
  const server = spawn(hugo, ['server', '--bind', '127.0.0.1', '--disableFastRender', ...args], { stdio: ['inherit', 'pipe', 'pipe'] });
  children.add(server);
  function observe(stream, destination) {
    let buffer = '';
    stream.on('data', chunk => {
      destination.write(chunk);
      buffer += chunk.toString();
      const lines = buffer.split(/[\r\n]+/); buffer = lines.pop();
      if (lines.some(line => /Built in \d+ ms|Total in \d+ ms|Web Server is available/.test(line))) {
        clearTimeout(timer); timer = setTimeout(refresh, 250);
      }
    });
  }
  observe(server.stdout, process.stdout); observe(server.stderr, process.stderr);
  function stop(signal) {
    stopping = true; clearTimeout(timer);
    for (const child of children) child.kill(signal);
  }
  process.once('SIGINT', () => stop('SIGINT'));
  process.once('SIGTERM', () => stop('SIGTERM'));
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.once('exit', (code, signal) => {
      children.delete(server); stop('SIGTERM');
      if (!code || signal) accept(); else reject(new Error(`Hugo server exited with ${code}.`));
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
