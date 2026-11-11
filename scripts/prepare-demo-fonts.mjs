// Optional deployment-owned font profile. No licensed font files live in the theme.
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function prepareDemoFonts(profile, directory, fetchFont = fetch) {
  const { fonts, files } = profile;
  const sources = [...(fonts?.faces ?? []), fonts?.title, fonts?.quote]
    .filter(Boolean).map(face => face.source);
  if (!sources.length || !Array.isArray(files) || files.length !== new Set(sources).size) {
    throw new Error('Demo fonts: provide exactly one file for each configured font source');
  }
  const seen = new Set();
  for (const file of files) {
    if (!/^private-fonts\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:otf|ttf|woff2?)$/i.test(file.source) ||
        !sources.includes(file.source) || seen.has(file.source) || !/^[a-f0-9]{64}$/.test(file.sha256)) {
      throw new Error('Demo fonts: invalid source path, digest or duplicate file');
    }
    const url = new URL(file.url);
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new Error('Demo fonts: source URLs must use HTTPS without credentials');
    }
    seen.add(file.source);
  }
  // Validate every download before writing anything; a bad profile stops the build.
  const downloads = await Promise.all(files.map(async file => {
    const response = await fetchFont(file.url, { redirect: 'error', signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Demo fonts: download failed (${response.status}) for ${file.source}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (createHash('sha256').update(bytes).digest('hex') !== file.sha256) {
      throw new Error(`Demo fonts: SHA-256 mismatch for ${file.source}`);
    }
    return { source: file.source, bytes };
  }));
  for (const { source, bytes } of downloads) {
    const target = join(directory, 'assets', source);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  await writeFile(join(directory, 'demo-fonts.json'), JSON.stringify({ params: { fonts } }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (!process.env.DEMO_FONT_PROFILE || !process.argv[2]) throw new Error('Demo fonts: profile and temporary site directory are required');
    await prepareDemoFonts(JSON.parse(process.env.DEMO_FONT_PROFILE), resolve(process.argv[2]));
    console.log('Verified deployment-owned demo fonts');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
