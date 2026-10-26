import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fetchTelegramReactions, resolveConfig } from '../scripts/fetch-telegram-reactions.mjs';
import { writeJSON } from '../scripts/lib/files.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'mini-telegram-fetch-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const contentDir = join(root, 'content');
  const output = join(root, 'data/reactions.json');
  await mkdir(contentDir);
  const previous = { 1: { views: '10', reactions: [] }, 2: { views: '20', reactions: [] }, 99: { views: 'old', reactions: [] } };
  await writeJSON(output, previous);
  for (const [file, id] of [['a', 1], ['b', 2], ['duplicate', 1]]) {
    await writeFile(join(contentDir, `${file}.md`), `+++\ntelegram_post=${id}\n+++\nText.`);
  }
  return { root, contentDir, output, previous, channel: 'fixture' };
}

test('Telegram discovers the default language content through current and legacy Hugo mounts', () => {
  for (const mount of [
    { source: 'articles/ru', target: 'content', sites: { matrix: { languages: ['ru'] } } },
    { source: 'articles/ru', target: 'content', lang: 'ru' },
  ]) {
    const config = { defaultcontentlanguage: 'ru', contentdir: 'content', module: { mounts: [
      { source: 'articles/en', target: 'content', sites: { matrix: { languages: ['en'] } } }, mount,
    ] } };
    assert.equal(resolveConfig({ channel: 'fixture' }, config).contentDir, 'articles/ru/blog');
    assert.equal(resolveConfig({ channel: 'fixture', 'content-dir': 'custom' }, config).contentDir, 'custom');
  }
  assert.equal(resolveConfig({ channel: 'fixture' }, { contentdir: 'legacy' }).contentDir, 'legacy/blog');
});

test('partial Telegram failures retain old counts and fetch each message only once', async (t) => {
  const f = await fixture(t);
  const calls = [];
  const result = await fetchTelegramReactions({ ...f, fetchImpl: async (url) => {
    calls.push(url);
    return url.includes('/1?')
      ? new Response('<span class="tgme_widget_message_views">123</span>')
      : new Response('', { status: 404 });
  } });
  assert.equal(calls.length, 2);
  assert.deepEqual(result, { 1: { views: '123', reactions: [] }, 2: f.previous[2] });
  assert.deepEqual(JSON.parse(await readFile(f.output, 'utf8')), result);
  assert.deepEqual(await readdir(join(f.root, 'data')), ['reactions.json']);
});

test('a total outage or an unparseable 200 response leaves the snapshot byte-for-byte intact', async (t) => {
  const f = await fixture(t);
  const previous = await readFile(f.output, 'utf8');
  for (const fetchImpl of [
    async () => new Response('Rate limited', { status: 429, headers: { 'retry-after': '1' } }),
    async () => new Response('<p>Not a public Telegram widget</p>'),
  ]) {
    const delays = [];
    await assert.rejects(fetchTelegramReactions({ ...f, fetchImpl, sleep: async (ms) => delays.push(ms) }), /leaving .* untouched/);
    assert.equal(await readFile(f.output, 'utf8'), previous);
    assert.ok(delays.every((ms) => ms === 1000));
    assert.ok(delays.length <= 4, 'at most two retry delays per distinct message');
  }
});

test('atomic JSON writes preserve snapshots on serialization and replacement failures', async (t) => {
  const f = await fixture(t);
  const previous = await readFile(f.output, 'utf8');
  const cyclic = {}; cyclic.self = cyclic;
  await assert.rejects(writeJSON(f.output, cyclic), /circular/i);
  assert.equal(await readFile(f.output, 'utf8'), previous);
  const directory = join(f.root, 'data/directory');
  await mkdir(directory);
  await assert.rejects(writeJSON(directory, { test: true }));
  assert.deepEqual((await readdir(join(f.root, 'data'))).sort(), ['directory', 'reactions.json']);
});
