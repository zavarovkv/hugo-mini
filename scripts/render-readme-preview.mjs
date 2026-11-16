#!/usr/bin/env node
/** Capture the real demo as dark desktop + light mobile, without added decoration.
 * Maintainer tools: npm ci, npx playwright install chromium, ImageMagick 7.
 * Captures and frames stay in a temporary directory; only the transparent GIF is published.
 */
import { chromium } from '@playwright/test';
import { mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({ options: {
  url: { type: 'string', default: 'https://hugo-mini-demo.vercel.app/' },
  output: { type: 'string', default: 'images/readme-preview-v7.gif' },
  'work-dir': { type: 'string' },
  'reuse-captures': { type: 'boolean', default: false },
  'stills-only': { type: 'boolean', default: false },
} });
const work = values['work-dir'] ? resolve(values['work-dir']) : await mkdtemp(join(tmpdir(), 'mini-readme-'));
const output = resolve(root, values.output);
const baseURL = new URL(values.url);
if (!baseURL.pathname.endsWith('/')) baseURL.pathname += '/';
if (!['http:', 'https:'].includes(baseURL.protocol)) throw new Error('--url must use HTTP or HTTPS.');
await mkdir(work, { recursive: true });
await mkdir(join(work, 'frames'), { recursive: true });

const devices = {
  desktop: { viewport: { width: 1040, height: 660 }, scheme: 'dark' },
  mobile: { viewport: { width: 390, height: 800 }, scheme: 'light' },
};
// Both viewports retain the same scale. The space around/between them is transparent.
const canvas = { width: 1454, height: 800 };
const scenes = [
  { desktop: 'home-dark', mobile: 'home-light', hold: 300, transition: 50 },
  { desktop: 'reading-dark', mobile: 'reading-light', hold: 300, transition: 45 },
  { desktop: 'reading-dark', mobile: 'menu-light', hold: 180, transition: 65 },
];

function command(binary, args) {
  return new Promise((accept, reject) => {
    const child = spawn(binary, args, {
      cwd: root, stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env, MAGICK_TEMPORARY_PATH: work, XDG_CACHE_HOME: join(work, 'cache') },
    });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? accept() : reject(new Error(`${binary} exited with ${code}`)));
  });
}

const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
const frames = [];
try {
  if (!values['reuse-captures']) {
    const report = [];
    for (const [device, { viewport, scheme }] of Object.entries(devices)) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: scheme, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage();
        for (const [name, path] of [['home', './'], ['reading', 'about/']]) {
          const response = await page.goto(new URL(path, baseURL).href, { waitUntil: 'networkidle' });
          if (!response?.ok()) throw new Error(`Cannot capture ${page.url()}: HTTP ${response?.status()}`);
          await page.evaluate(() => document.fonts.ready);
          const layout = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            font: getComputedStyle(document.querySelector('main p')).fontFamily,
            theme: document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
          }));
          if (layout.overflow) throw new Error(`Horizontal overflow on ${device} ${page.url()}`);
          if (layout.theme !== scheme) throw new Error(`Expected ${scheme} theme on ${device}, got ${layout.theme}.`);
          await page.screenshot({ path: join(work, `${device}-${name}-${scheme}.png`), animations: 'disabled' });
          report.push({ device, viewport, scheme, page: page.url(), ...layout });
          if (device === 'mobile' && name === 'reading') {
            const toggle = page.locator('.mobile-menu-toggle');
            await toggle.click();
            if (await toggle.getAttribute('aria-expanded') !== 'true') throw new Error('Mobile menu did not open.');
            await page.screenshot({ path: join(work, 'mobile-menu-light.png'), animations: 'disabled' });
          }
        }
      } finally { await context.close(); }
    }
    await writeFile(join(work, 'captures.json'), JSON.stringify(report, null, 2));
    console.log('Captured dark desktop and light mobile views.');
  }

  const imageSources = {};
  for (const scene of scenes) {
    for (const device of Object.keys(devices)) {
      const name = `${device}-${scene[device]}`;
      if (!imageSources[name]) imageSources[name] = `data:image/png;base64,${(await readFile(join(work, `${name}.png`))).toString('base64')}`;
    }
  }
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Hugo Mini — README preview</title>
<style>
*{box-sizing:border-box}html,body{margin:0;width:1454px;height:800px;overflow:hidden;background:transparent}
.screen{position:absolute;overflow:hidden}
#desktop{left:0;top:70px;width:1040px;height:660px}
#mobile{left:1064px;top:0;width:390px;height:800px}
.screen img{position:absolute;inset:0;display:block;width:100%;height:100%;opacity:0}
</style>
<div class="screen" id="desktop"></div><div class="screen" id="mobile"></div>
<script>
const scenes=${JSON.stringify(scenes)}, sources=${JSON.stringify(imageSources)};
for(const device of ['desktop','mobile']){
  for(const [key,src] of Object.entries(sources).filter(([key])=>key.startsWith(device+'-'))){
    const image=new Image();image.src=src;image.dataset.key=key;document.getElementById(device).append(image);
  }
}
window.renderState=(from,to,phase)=>{
  if(phase>=1){from=to;phase=0}
  const p=phase<.5?4*phase**3:1-(-2*phase+2)**3/2;
  for(const device of ['desktop','mobile']){
    const a=device+'-'+scenes[from][device], b=device+'-'+scenes[to][device];
    for(const image of document.getElementById(device).children){
      image.style.opacity=image.dataset.key===b?(a===b?1:p):image.dataset.key===a?1:0;
      image.style.zIndex=image.dataset.key===b?2:image.dataset.key===a?1:0;
    }
  }
};window.renderState(0,0,0);
</script></html>`;
  const composition = join(work, 'composition.html');
  await writeFile(composition, html);
  const context = await browser.newContext({ viewport: canvas, deviceScaleFactor: 1 });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(composition).href);
    await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
    const capture = async (from, to, phase, path) => {
      await page.evaluate(({from,to,phase}) => window.renderState(from,to,phase), {from,to,phase});
      await page.screenshot({ path, animations: 'disabled', omitBackground: true });
    };
    for (let i = 0; i < scenes.length; i++) await capture(i, i, 0, join(work, `scene-${i}.png`));
    if (!values['stills-only']) {
      for (let from = 0; from < scenes.length; from++) {
        const path = join(work, 'frames', `${String(frames.length).padStart(3, '0')}.png`);
        await capture(from, from, 0, path);
        frames.push({ path, delay: scenes[from].hold });
        // GIF timing is in centiseconds; still holds cost one frame.
        const steps = Math.round(scenes[from].transition / 7);
        for (let step = 1; step <= steps; step++) {
          const frame = join(work, 'frames', `${String(frames.length).padStart(3, '0')}.png`);
          await capture(from, (from + 1) % scenes.length, step / steps, frame);
          const delay = Math.round(step * scenes[from].transition / steps) - Math.round((step - 1) * scenes[from].transition / steps);
          frames.push({ path: frame, delay });
        }
      }
    }
    if (errors.length) throw new Error(errors.join('\n'));
  } finally { await context.close(); }
} finally { await browser.close(); }

if (!values['stills-only']) {
  await mkdir(dirname(output), { recursive: true });
  console.log(`Encoding ${frames.length} frames; ${frames.reduce((sum,frame)=>sum+frame.delay,0)/100}s loop.`);
  await writeFile(join(work, 'frames.json'), JSON.stringify(frames, null, 2));
  // Share a palette, reserve transparency, and never flatten the canvas onto a color.
  const palette = join(work, 'palette.png');
  await command('magick', [...frames.map(frame => frame.path), '-sample', '50%', '-append', '+dither', '-colors', '255', '-unique-colors', palette]);
  await command('magick', [
    ...frames.flatMap(frame => ['-delay', String(frame.delay), frame.path]),
    '-background', 'none', '-loop', '0', '-resize', '1140x',
    '-channel', 'A', '-threshold', '50%', '+channel',
    '+dither', '-remap', palette, '-layers', 'Optimize', output,
  ]);
  const bytes = (await stat(output)).size;
  console.log(`Preview: ${output} (${(bytes/1024/1024).toFixed(2)} MiB). Working files: ${work}`);
}
console.log(`Review stills: ${join(work, 'scene-0.png')} through scene-${scenes.length - 1}.png`);
