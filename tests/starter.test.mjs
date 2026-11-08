import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('starter canonical URL precedence preserves explicit domains and config fallback', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mini-starter-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'scripts'));
  await mkdir(join(root, 'bin'));
  await copyFile(new URL('../starter/scripts/build-vercel.sh', import.meta.url), join(root, 'scripts/build-vercel.sh'));
  await writeFile(join(root, 'scripts/setup-theme.sh'), 'exit 0\n');
  // This test exercises build argument selection offline. The CI starter build
  // separately runs the real installer and verifies the pinned theme revision.
  const commands = {
    curl: '#!/bin/sh\nexit 0\n',
    sha256sum: '#!/bin/sh\ncat >/dev/null\n',
    tar: `#!/bin/sh
while [ "$1" != "--directory" ]; do shift; done
shift
cp "$HUGO_TEST_BINARY" "$1/hugo"
`,
    hugo: '#!/bin/sh\nprintf "%s\\n" "$@" > "$HUGO_TEST_ARGS"\n',
  };
  for (const [name, source] of Object.entries(commands)) {
    await writeFile(join(root, 'bin', name), source, { mode: 0o755 });
  }
  const cases = [
    [{}, null],
    [{ VERCEL_URL: 'preview.example.org' }, 'https://preview.example.org/'],
    [{ VERCEL_URL: 'preview.example.org', VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'production.example.org' }, 'https://production.example.org/'],
    [{ VERCEL_URL: 'preview.example.org', HUGO_BASEURL: 'https://custom.example.org/blog/' }, 'https://custom.example.org/blog/'],
    [{ HUGO_BASEURL: 'https://custom.example.org/' }, 'https://custom.example.org/'],
  ];
  for (const [settings, expected] of cases) {
    const env = { ...process.env, PATH: `${join(root, 'bin')}:${process.env.PATH}`,
      HUGO_TEST_BINARY: join(root, 'bin/hugo'), HUGO_TEST_ARGS: join(root, 'args') };
    for (const key of ['HUGO_BASEURL', 'VERCEL_URL', 'VERCEL_ENV', 'VERCEL_PROJECT_PRODUCTION_URL']) delete env[key];
    execFileSync('bash', [join(root, 'scripts/build-vercel.sh')], { env: { ...env, ...settings }, stdio: 'pipe' });
    const args = (await readFile(join(root, 'args'), 'utf8')).trim().split('\n');
    assert.equal(args[args.indexOf('--source') + 1], root);
    if (expected) assert.equal(args[args.indexOf('--baseURL') + 1], expected);
    else assert.ok(!args.includes('--baseURL'), 'without a deployment URL Hugo must use the configured baseURL');
  }
});
