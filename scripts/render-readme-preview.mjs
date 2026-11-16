#!/usr/bin/env node
/** Capture the real demo and compose a deterministic, looping README preview.
 * Maintainer tools: npm ci, npx playwright install chromium, ImageMagick 7.
 * Only screenshots enter the GIF; website fonts and generated frames stay outside Git.
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
  output: { type: 'string', default: 'images/readme-preview-v6.gif' },
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
const canvas = { width: 1280, height: 840 };
const scenes = [
  { desktop: 'home-light', mobile: 'home-light', dark: 0, label: 'A place for your words.', hold: 300, transition: 50 },
  { desktop: 'reading-light', mobile: 'reading-light', dark: 0, label: 'Typography, thoughtfully set.', hold: 280, transition: 65 },
  { desktop: 'reading-dark', mobile: 'reading-dark', dark: 1, label: 'Light or dark. Always clear.', hold: 280, transition: 45 },
  { desktop: 'reading-dark', mobile: 'menu-dark', dark: 1, label: 'Made for every screen.', hold: 180, transition: 80 },
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
    for (const [device, viewport] of Object.entries({ desktop: { width: 1040, height: 660 }, mobile: { width: 390, height: 800 } })) {
      for (const scheme of ['light', 'dark']) {
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
              theme: document.documentElement.dataset.theme || matchMedia('(prefers-color-scheme: dark)').matches && 'dark' || 'light',
            }));
            if (layout.overflow) throw new Error(`Horizontal overflow on ${device} ${page.url()}`);
            await page.screenshot({ path: join(work, `${device}-${name}-${scheme}.png`), animations: 'disabled' });
            report.push({ device, viewport, scheme, page: page.url(), ...layout });
            if (device === 'mobile' && name === 'reading' && scheme === 'dark') {
              const toggle = page.locator('.mobile-menu-toggle');
              await toggle.click();
              if (await toggle.getAttribute('aria-expanded') !== 'true') throw new Error('Mobile menu did not open.');
              await page.screenshot({ path: join(work, 'mobile-menu-dark.png'), animations: 'disabled' });
            }
          }
        } finally { await context.close(); }
      }
    }
    await writeFile(join(work, 'captures.json'), JSON.stringify(report, null, 2));
    console.log('Captured desktop/mobile demo pages in both color schemes.');
  }

  const imageSources = {};
  for (const scene of scenes) {
    for (const device of ['desktop', 'mobile']) {
      const name = `${device}-${scene[device]}`;
      if (!imageSources[name]) imageSources[name] = `data:image/png;base64,${(await readFile(join(work, `${name}.png`))).toString('base64')}`;
    }
  }
  const font = pathToFileURL(join(root, 'static/fonts/inter-v20-cyrillic_cyrillic-ext_latin_latin-ext-500.woff2')).href;
  const logo = (await readFile(join(root, 'static/images/hugo-mini-logo-light.svg'), 'utf8')).replace('stroke="#242424"', 'stroke="currentColor"');
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Hugo Mini — README preview</title>
<style>
@font-face{font-family:Inter;src:url('${font}') format('woff2');font-weight:500;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:1280px;height:840px;overflow:hidden}
body{font-family:Inter,sans-serif;font-weight:500;background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased}
.brand{position:absolute;left:56px;top:39px;display:flex;align-items:center;gap:14px;font-size:29px;letter-spacing:-1px;line-height:36px}
.brand svg{width:34px;height:34px}.descriptor{position:absolute;right:58px;top:54px;font-size:11px;letter-spacing:1.65px;color:var(--muted)}
.browser{position:absolute;left:56px;top:108px;width:1000px;border:1px solid var(--line);border-radius:12px;background:var(--surface);overflow:hidden;box-shadow:0 16px 38px var(--shadow),0 2px 5px var(--shadow)}
.chrome{height:28px;border-bottom:1px solid var(--hairline);background:var(--chrome);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:10px;letter-spacing:.1px}
.traffic{position:absolute;left:13px;display:flex;gap:5px}.traffic i{width:5px;height:5px;border-radius:50%;background:var(--dot)}
.desktop-screen{position:relative;width:998px;height:633.35px;overflow:hidden}
.phone{position:absolute;left:950px;top:222px;width:274px;padding:6px;border:1px solid var(--phone-line);border-radius:29px;background:var(--phone);box-shadow:0 20px 46px var(--phone-shadow),0 2px 6px var(--shadow)}
.mobile-screen{position:relative;width:260px;height:533.333px;border-radius:22px;overflow:hidden;background:var(--surface)}
.screen img{position:absolute;inset:0;display:block;width:100%;height:auto;opacity:0}
.bottom{position:absolute;left:58px;right:58px;top:804px;display:flex;justify-content:space-between;align-items:center;height:18px;color:var(--muted)}
.copy{position:relative;width:650px;height:18px;font-size:13px;letter-spacing:.05px}.copy span{position:absolute;left:0;top:0;opacity:0}
.progress{display:flex;gap:7px}.progress span{width:23px;height:2px;background:var(--line)}
</style>
<div class="brand">${logo}<span>Hugo Mini</span></div><div class="descriptor">A MINIMAL HUGO THEME</div>
<div class="browser"><div class="chrome"><div class="traffic"><i></i><i></i><i></i></div>${baseURL.host}</div><div class="screen desktop-screen" id="desktop"></div></div>
<div class="phone"><div class="screen mobile-screen" id="mobile"></div></div>
<div class="bottom"><div class="copy" id="copy"></div><div class="progress" id="progress"></div></div>
<script>
const scenes=${JSON.stringify(scenes)}, sources=${JSON.stringify(imageSources)};
for(const device of ['desktop','mobile'])for(const [key,src] of Object.entries(sources).filter(([key])=>key.startsWith(device+'-'))){const image=new Image();image.src=src;image.dataset.key=key;document.getElementById(device).append(image)}
for(const scene of scenes){const span=document.createElement('span');span.textContent=scene.label;document.getElementById('copy').append(span);document.getElementById('progress').append(document.createElement('span'))}
const colors={paper:['#f2f1ed','#161719'],ink:['#242522','#eeeee8'],muted:['#777970','#a2a39c'],line:['#dadbd5','#3a3c3c'],hairline:['#e9eae5','#303232'],surface:['#ffffff','#1a1a1a'],chrome:['#fafaf8','#242626'],dot:['#c0c2ba','#686b68'],phone:['#fbfbf9','#252727'],'phone-line':['#d2d4cd','#4b4d4b']};
const blend=(a,b,p)=>{const v=x=>x.match(/\\w\\w/g).map(x=>parseInt(x,16));a=v(a.slice(1));b=v(b.slice(1));return 'rgb('+a.map((x,i)=>Math.round(x+(b[i]-x)*p)).join(',')+')'};
window.renderState=(from,to,phase)=>{
 if(phase>=1){from=to;phase=0}
 const p=phase<.5?4*phase**3:1-(-2*phase+2)**3/2, dark=scenes[from].dark*(1-p)+scenes[to].dark*p;
 for(const [key,pair] of Object.entries(colors))document.body.style.setProperty('--'+key,blend(...pair,dark));
 document.body.style.setProperty('--shadow','rgba(20,24,20,'+(.07+dark*.12)+')');document.body.style.setProperty('--phone-shadow','rgba(15,20,16,'+(.14+dark*.18)+')');
 for(const device of ['desktop','mobile'])for(const image of document.getElementById(device).children){const a=device+'-'+scenes[from][device],b=device+'-'+scenes[to][device];image.style.opacity=image.dataset.key===b?(a===b?1:p):image.dataset.key===a?1:0;image.style.zIndex=image.dataset.key===b?2:image.dataset.key===a?1:0}
 for(const [i,span] of [...document.getElementById('copy').children].entries())span.style.opacity=from===to&&i===from?1:i===from?Math.max(0,1-phase*2.5):i===to?Math.max(0,(phase-.6)*2.5):0;
 for(const [i,span] of [...document.getElementById('progress').children].entries())span.style.background=(phase<.5?i===from:i===to)?'var(--ink)':'var(--line)';
};window.renderState(0,0,0);
</script></html>`;
  const composition = join(work, 'composition.html');
  await writeFile(composition, html);
  const context = await browser.newContext({ viewport: canvas, deviceScaleFactor: 1, colorScheme: 'light' });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(composition).href);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
    const capture = async (from,to,phase,path) => {
      await page.evaluate(({from,to,phase})=>window.renderState(from,to,phase),{from,to,phase});
      await page.screenshot({path,animations:'disabled'});
    };
    for(let i=0;i<scenes.length;i++)await capture(i,i,0,join(work,`scene-${i}.png`));
    if (!values['stills-only']) {
      for(let from=0;from<scenes.length;from++){
        const path=join(work,'frames',`${String(frames.length).padStart(3,'0')}.png`);
        await capture(from,from,0,path);frames.push({path,delay:scenes[from].hold});
        // GIF timing is in centiseconds. Dissolves need fewer frames than moving footage.
        const steps=Math.round(scenes[from].transition/7);
        for(let step=1;step<=steps;step++){
          const frame=join(work,'frames',`${String(frames.length).padStart(3,'0')}.png`);
          await capture(from,(from+1)%scenes.length,step/steps,frame);
          const delay=Math.round(step*scenes[from].transition/steps)-Math.round((step-1)*scenes[from].transition/steps);
          frames.push({path:frame,delay});
        }
      }
    }
    if(errors.length)throw new Error(errors.join('\n'));
  } finally { await context.close(); }
} finally { await browser.close(); }

if(!values['stills-only']){
  await mkdir(dirname(output),{recursive:true});
  console.log(`Encoding ${frames.length} frames; ${frames.reduce((sum,frame)=>sum+frame.delay,0)/100}s loop.`);
  await writeFile(join(work,'frames.json'),JSON.stringify(frames,null,2));
  // One palette prevents the stationary type and chrome from changing colors between frames.
  const palette=join(work,'palette.png');
  await command('magick',[...frames.map(frame=>frame.path),'-sample','50%','-append','+dither','-colors','256','-unique-colors',palette]);
  await command('magick',[...frames.flatMap(frame=>['-delay',String(frame.delay),frame.path]),'-loop','0','-resize','1140x','-alpha','off','+dither','-remap',palette,'-layers','Optimize',output]);
  const bytes=(await stat(output)).size;
  console.log(`Preview: ${output} (${(bytes/1024/1024).toFixed(2)} MiB). Working files: ${work}`);
}
console.log(`Review stills: ${join(work,'scene-0.png')} through scene-3.png`);
