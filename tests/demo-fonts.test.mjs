import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prepareDemoFonts } from '../scripts/prepare-demo-fonts.mjs';

const bytes = Buffer.from('test font bytes');
const source = 'private-fonts/example/regular.woff2';
const profile = () => ({
  fonts: { family: 'Example', faces: [{ source, weight: 400 }] },
  files: [{ source, url: 'https://fonts.example/regular.woff2', sha256: createHash('sha256').update(bytes).digest('hex') }],
});
const download = async () => new Response(bytes);
async function directory(t) {
  const root = await mkdtemp(join(tmpdir(), 'demo-fonts-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('demo profile verifies and preserves bytes in the temporary consumer site', async t => {
  const root = await directory(t);
  await prepareDemoFonts(profile(), root, download);
  assert.deepEqual(await readFile(join(root, 'assets', source)), bytes);
  assert.deepEqual(JSON.parse(await readFile(join(root, 'demo-fonts.json'), 'utf8')), { params: { fonts: profile().fonts } });
});

test('failed or altered font downloads abort without publishing a profile', async t => {
  const root = await directory(t);
  for (const fetcher of [async () => new Response('altered'), async () => new Response('', { status: 404 })]) {
    await assert.rejects(prepareDemoFonts(profile(), root, fetcher), /Demo fonts:/);
    assert.deepEqual(await readdir(root), []);
  }
});

test('unsafe paths and incomplete or duplicate manifests fail before any download', async t => {
  const root = await directory(t);
  const variants = [];
  for (const badPath of ['../escape.woff2', 'private-fonts/../../escape.woff2', '/tmp/escape.woff2']) {
    const input = profile();
    input.files[0].source = input.fonts.faces[0].source = badPath;
    variants.push(input);
  }
  const duplicate = profile(); duplicate.files.push({ ...duplicate.files[0] }); variants.push(duplicate);
  const missing = profile(); missing.fonts.quote = { source: 'private-fonts/quote.woff2' }; variants.push(missing);
  const insecure = profile(); insecure.files[0].url = 'http://fonts.example/font.woff2'; variants.push(insecure);
  const unexpected = profile(); unexpected.files[0].source = 'private-fonts/other.woff2'; variants.push(unexpected);
  for (const input of variants) {
    await assert.rejects(prepareDemoFonts(input, root, () => { assert.fail('must not download invalid inputs'); }), /Demo fonts:/);
  }
  assert.deepEqual(await readdir(root), []);
});
