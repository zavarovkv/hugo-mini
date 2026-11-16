#!/usr/bin/env node
/** Capture the real demo in a dark browser window and a light iPhone frame.
 * Maintainer tools: npm ci, npx playwright install chromium, ImageMagick 7.
 * Captures and frames stay in a temporary directory; only the transparent GIF is published.
 */
import { chromium } from '@playwright/test';
import { copyFile, mkdir, mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({ options: {
  url: { type: 'string', default: 'https://hugo-mini-demo.vercel.app/' },
  output: { type: 'string', default: 'images/readme-preview-v8.gif' },
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
  mobile: { viewport: { width: 390, height: 748 }, scheme: 'light' },
};
// Both viewports retain the same scale. The space around/between them is transparent.
const canvas = { width: 1504, height: 886 };
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
*{box-sizing:border-box}html,body{margin:0;width:${canvas.width}px;height:${canvas.height}px;overflow:hidden;background:transparent}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.browser{position:absolute;left:8px;top:93px;width:1042px;border:1px solid #505259;border-radius:14px;overflow:hidden;background:#1a1a1a}
.toolbar{position:relative;height:38px;border-bottom:1px solid #36383d;background:#25262a;display:flex;align-items:center;justify-content:center}
.traffic{position:absolute;left:15px;display:flex;gap:7px}.traffic i{width:9px;height:9px;border-radius:50%;background:#ff5f57}.traffic i:nth-child(2){background:#febc2e}.traffic i:nth-child(3){background:#28c840}
.address{display:flex;align-items:center;justify-content:center;gap:7px;width:360px;height:24px;border:1px solid #3e4046;border-radius:6px;background:#2d2f34;color:#bfc1c7;font-size:11px;line-height:1}
.address svg{width:10px;height:10px}
.screen{position:relative;overflow:hidden}
#desktop{width:1040px;height:660px}
.phone{position:absolute;left:1088px;top:12px;width:408px;height:862px;padding:7px;border:2px solid #85898e;border-radius:56px;background:#17181a}
.phone-display{position:relative;width:390px;height:844px;border-radius:47px;overflow:hidden;background:#fff}
.status-bar{position:relative;height:64px;color:#16171a}
.time{position:absolute;left:30px;top:23px;font-size:14px;line-height:16px;font-weight:600;letter-spacing:-.3px}
.island{position:absolute;left:50%;top:11px;width:116px;height:32px;transform:translateX(-50%);border-radius:18px;background:#08090a}
.status-icons{position:absolute;right:26px;top:24px;width:64px;height:13px}
#mobile{width:390px;height:748px}
.home-area{position:relative;height:32px}.home-indicator{position:absolute;left:50%;bottom:9px;width:134px;height:5px;transform:translateX(-50%);border-radius:3px;background:#151619}
.button{position:absolute;width:3px;border-radius:2px;background:#85898e}.volume-up{left:-5px;top:167px;height:48px}.volume-down{left:-5px;top:227px;height:48px}.power{right:-5px;top:207px;height:78px}
.screen img{position:absolute;inset:0;display:block;width:100%;height:100%;opacity:0}
</style>
<div class="browser">
  <div class="toolbar">
    <div class="traffic"><i></i><i></i><i></i></div>
    <div class="address"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2.5" y="5.2" width="7" height="5" rx="1.2"/><path d="M4 5.2V3.4a2 2 0 0 1 4 0v1.8"/></svg>${baseURL.host}</div>
  </div>
  <div class="screen" id="desktop"></div>
</div>
<div class="phone">
  <i class="button volume-up"></i><i class="button volume-down"></i><i class="button power"></i>
  <div class="phone-display">
    <div class="status-bar">
      <span class="time">9:41</span><div class="island"></div>
      <svg class="status-icons" viewBox="0 0 64 13" fill="currentColor">
        <rect y="9" width="3" height="4" rx=".7"/><rect x="4.5" y="6" width="3" height="7" rx=".7"/><rect x="9" y="3" width="3" height="10" rx=".7"/><rect x="13.5" width="3" height="13" rx=".7"/>
        <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M23 4.2a10 10 0 0 1 14 0M25.6 7a6.2 6.2 0 0 1 8.8 0M28.3 9.7a2.4 2.4 0 0 1 3.4 0"/></g><circle cx="30" cy="12" r="1"/>
        <rect x="43" y="2" width="18" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1"/><rect x="45" y="4" width="14" height="6" rx="1"/><rect x="62" y="5" width="2" height="4" rx="1"/>
      </svg>
    </div>
    <div class="screen" id="mobile"></div>
    <div class="home-area"><div class="home-indicator"></div></div>
  </div>
</div>
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
    const stills = scenes.map((_, i) => join(work, `scene-${i}.png`));
    for (let i = 0; i < scenes.length; i++) await capture(i, i, 0, stills[i]);
    if (!values['stills-only']) {
      for (let from = 0; from < scenes.length; from++) {
        const path = join(work, 'frames', `${String(frames.length).padStart(3, '0')}.png`);
        await copyFile(stills[from], path);
        frames.push({ path, delay: scenes[from].hold });
        // GIF timing is in centiseconds; still holds cost one frame.
        const steps = Math.round(scenes[from].transition / 7);
        for (let step = 1; step <= steps; step++) {
          const frame = join(work, 'frames', `${String(frames.length).padStart(3, '0')}.png`);
          const to = (from + 1) % scenes.length;
          // Reuse exact endpoints: compositor layers can slightly change rounded-edge antialiasing.
          if (step === steps) await copyFile(stills[to], frame);
          else await capture(from, to, step / steps, frame);
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
