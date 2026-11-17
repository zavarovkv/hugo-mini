export function searchContracts({test, expect, site = false}) {
  async function open(page, query) {
    await page.keyboard.press('Control+k');
    await expect(page.locator('#search-query')).toBeFocused();
    if (query) await page.locator('#search-query').fill(query);
  }
  test('search loads lazily, ranks article sections, shows every result and honors exclusions', async ({page}) => {
    const requests = [];
    page.on('request', r => { if(r.url().includes('/pagefind/')) requests.push(r.url()); });
    await page.goto('/browser-checks/');
    expect(requests).toEqual([]);
    const trigger = await page.locator('.search-toggle-desktop').boundingBox();
    await open(page, 'orchidquartz');
    const close = await page.locator('.search-close').boundingBox();
    expect(Math.abs(close.x - trigger.x)).toBeLessThan(1);
    expect((await page.locator('#site-search').boundingBox()).width).toBe(await page.evaluate(() => innerWidth));
    const links = page.locator('.search-result');
    await expect(links).toHaveCount(11);
    await expect(page.locator('.search-content')).toHaveCSS('overflow-y','visible');
    await expect(page.locator('dialog')).toHaveCSS('overflow-y','auto');
    await expect(page.locator('dialog')).toHaveCSS('height',`${await page.evaluate(()=>innerHeight)}px`);
    await expect(page.locator('.search-help')).toHaveCount(0);
    await expect(page.locator('.search-status')).toHaveClass(/search-sr-only/);
    await expect(page.locator('.search-status')).toContainText('11');
    await expect(links.first().locator('mark')).toContainText('orchidquartz');
    await expect(links.first()).toHaveAttribute('href', /\/search-\d+\/#matching-section$/);
    await expect(page.locator('.search-more')).toHaveCount(0);
    await expect(page.locator('#search-query')).toBeFocused();
    await links.last().scrollIntoViewIfNeeded();
    expect((await page.locator('.search-form').boundingBox()).y).toBeLessThan(0);
    await page.locator('#search-query').fill('"exclusionquartz"');
    await expect(page.locator('.search-status')).toHaveText(site ? 'Ничего не нашлось' : 'Nothing found');
    await expect(page.locator('.search-status')).toHaveCSS('text-align','center');
    await expect(links).toHaveCount(0);
    await page.locator('#search-query').fill('');
    await expect(page.locator('#search-query')).toHaveValue('');
    await expect(page.locator('#search-query')).toBeFocused();
    await expect(page.locator('.search-status')).toHaveText('');
  });

  test('search keeps each language separate and understands Russian word endings', async ({page}) => {
    for (const lang of ['en','ru']) {
      const path = (site ? lang === 'ru' : lang === 'en') ? '/' : `/${lang}/`;
      await page.goto(path + 'search-language/');
      await open(page, 'languagequartz');
      await expect(page.locator('.search-result')).toHaveCount(1);
      await expect(page.locator('.search-result-title')).toHaveText(lang === 'en' ? 'English research' : 'Русские исследования');
      await expect(page.locator('.search-close')).toHaveAccessibleName(lang === 'en' ? 'Close' : 'Закрыть');
      if (lang === 'ru') {
        await page.locator('#search-query').fill('исследование');
        await expect(page.locator('.search-result-title').filter({hasText:'Русские исследования'})).toBeVisible();
      }
    }
  });

  test('keyboard navigation traps focus, restores scroll, and leaves text editing alone', async ({page}) => {
    await page.goto('/browser-checks/');
    await page.evaluate(() => { scrollTo(0, 600); });
    const scroll = await page.evaluate(()=>scrollY);
    await open(page, 'orchidquartz');
    const input = page.locator('#search-query');
    await expect(page.locator('.search-result')).toHaveCount(11);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.search-result').first()).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(input).toBeFocused();
    for(let i=0;i<16;i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).not.toBeVisible();
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(scroll);
    await page.evaluate(()=>{
      const field=document.createElement('input'); field.id='outside-editor'; document.body.append(field); field.focus();
    });
    await page.keyboard.type('/');
    await page.keyboard.press('Control+k');
    await expect(page.locator('dialog')).not.toBeVisible();
    await expect(page.locator('#outside-editor')).toHaveValue('/');
    await page.locator('#outside-editor').evaluate(el=>el.remove());
    await page.keyboard.press('/');
    await expect(input).toBeFocused();
    await page.keyboard.press('Escape');
    await page.locator('.search-toggle-desktop').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.search-toggle-desktop')).toBeFocused();
  });

  test('a failed module download offers a working retry', async ({page}) => {
    let unavailable=true;
    await page.route('**/pagefind/pagefind.js*', route=>unavailable ? route.abort() : route.continue());
    await page.goto('/browser-checks/');
    await open(page, 'orchidquartz');
    await expect(page.locator('.search-retry')).toBeVisible();
    unavailable=false;
    await page.locator('.search-retry').click();
    await expect(page.locator('.search-result')).toHaveCount(11);
    await expect(page.locator('.search-retry')).toBeHidden();
  });

  test('a result on the current page closes search before following its section link', async ({page}) => {
    await page.goto('/search-1/');
    await open(page, 'orchidquartz');
    const current = page.locator('.search-result[href$="/search-1/#matching-section"]');
    await current.click();
    await expect(page).toHaveURL(/\/search-1\/#matching-section$/);
    await expect(page.locator('#site-search')).not.toBeVisible();
    await expect(page.locator('body')).not.toHaveClass(/search-open/);
    await expect(page.locator('#matching-section')).toBeInViewport();
  });

  for (const asset of ['pagefind-entry.json*', '*.pf_meta', '*.pf_fragment']) test(`search recovers after a failed ${asset} download`, async ({page}) => {
    let unavailable = true;
    await page.route(`**/pagefind/**/${asset}`, route => unavailable ? route.abort() : route.continue());
    await page.goto('/browser-checks/');
    await open(page, 'orchidquartz');
    await expect(page.locator('.search-retry')).toBeVisible();
    unavailable = false;
    await page.locator('.search-retry').click();
    await expect(page.locator('.search-result')).toHaveCount(11);
    await expect(page.locator('.search-retry')).toBeHidden();
  });

  test('late responses cannot replace a newer query and snippets cannot inject markup', async ({page}) => {
    await page.route('**/pagefind/pagefind.js*', route=>route.fulfill({contentType:'text/javascript',body:`
      export async function options() {}
      export async function search(query) {
        await new Promise(resolve=>setTimeout(resolve,query==='slow'?800:10));
        return {results:[{data:async()=>({url:'/search-1/',meta:{title:query},excerpt:'A <mark>match</mark><img src=x onerror="window.searchInjected=true"><script>window.searchInjected=true</script>'})}]};
      }
    `}));
    await page.goto('/browser-checks/');
    await open(page, 'slow');
    await expect(page.locator('#site-search')).toHaveClass(/search-loading/);
    await expect(page.locator('.search-status')).toHaveClass(/search-sr-only/);
    await page.locator('#search-query').fill('newest');
    await expect(page.locator('.search-result-title')).toHaveText('newest');
    await expect(page.locator('.search-results img, .search-results script')).toHaveCount(0);
    await expect(page.locator('.search-results mark')).toHaveText('match');
    await page.waitForTimeout(850); // Let the deliberately delayed old request finish.
    await expect(page.locator('.search-result-title')).toHaveText('newest');
    expect(await page.evaluate(()=>window.searchInjected)).toBeUndefined();
  });

  test('typing preserves results until one complete replacement is ready', async ({page}) => {
    await page.route('**/pagefind/pagefind.js*', route=>route.fulfill({contentType:'text/javascript',body:`
      window.searchCalls = [];
      export async function options() {}
      export async function search(query) {
        window.searchCalls.push(query);
        return {results:[{data:async()=>{
          if (query !== 'initial') await new Promise(resolve=>{ window.finishSearch = resolve; });
          return {url:'/search-1/',meta:{title:query},excerpt:'Matching article'};
        }}]};
      }
    `}));
    await page.goto('/browser-checks/');
    await open(page, 'initial');
    const input = page.locator('#search-query');
    await expect(page.locator('.search-result-title')).toHaveText('initial');
    await page.evaluate(()=>{ window.previousSearchResult = document.querySelector('.search-result'); });
    await input.fill('n');
    await input.pressSequentially('ewest', {delay:40});
    await expect.poll(()=>page.evaluate(()=>window.searchCalls)).toEqual(['initial','newest']);
    await expect(page.locator('#site-search')).toHaveClass(/search-loading/);
    expect(await page.evaluate(()=>window.previousSearchResult.isConnected)).toBe(true);
    await expect(page.locator('.search-result-title')).toHaveText('initial');
    await expect(page.locator('.search-status')).toHaveClass(/search-sr-only/);
    await expect(page.locator('.search-results')).toHaveAttribute('aria-busy','true');
    // Old results remain usable with a keyboard while the new fragments load.
    await page.keyboard.press('ArrowDown');
    await page.evaluate(()=>window.finishSearch());
    await expect(page.locator('.search-result-title')).toHaveText('newest');
    await expect(page.locator('.search-result')).toBeFocused();
    await expect(page.locator('#site-search')).not.toHaveClass(/search-loading/);
    await expect(page.locator('.search-results')).toHaveAttribute('aria-busy','false');
    await page.evaluate(()=>{ window.previousSearchResult = document.querySelector('.search-result'); });
    await input.fill(' newest  ');
    await page.waitForTimeout(350);
    expect(await page.evaluate(()=>window.previousSearchResult.isConnected)).toBe(true);
    expect(await page.evaluate(()=>window.searchCalls)).toEqual(['initial','newest']);
    await input.fill('');
    await expect(page.locator('.search-result')).toHaveCount(0);
    await expect(page.locator('#site-search')).not.toHaveClass(/search-loading/);
  });

  test('an empty result stays steady until the next query finishes', async ({page}) => {
    await page.route('**/pagefind/pagefind.js*', route=>route.fulfill({contentType:'text/javascript',body:`
      export async function options() {}
      export async function search(query) {
        if (query !== 'empty') await new Promise(resolve=>{ window.finishSearch = resolve; });
        return {results:query === 'match' ? [{data:async()=>({url:'/search-1/',meta:{title:'Match'},excerpt:'Matching article'})}] : []};
      }
    `}));
    await page.goto('/browser-checks/');
    await open(page, 'empty');
    const status = page.locator('.search-status');
    const label = site ? 'Ничего не нашлось' : 'Nothing found';
    await expect(status).toHaveText(label);
    const before = await status.boundingBox();
    for (const query of ['still empty','match']) {
      await page.locator('#search-query').fill(query);
      await expect(page.locator('#site-search')).toHaveClass(/search-loading/);
      await expect(status).toHaveText(label);
      await expect(status).toHaveClass(/search-empty/);
      expect(await status.boundingBox()).toEqual(before);
      await page.evaluate(()=>window.finishSearch());
      await expect(page.locator('.search-results')).toHaveAttribute('aria-busy','false');
    }
    await expect(page.locator('.search-result-title')).toHaveText('Match');
    await expect(status).toHaveClass(/search-sr-only/);
    await expect(page.locator('#site-search')).not.toHaveClass(/search-loading/);
  });

  test('composition waits for committed text and reopening refreshes an unfinished query', async ({page}) => {
    await page.route('**/pagefind/pagefind.js*', route=>route.fulfill({contentType:'text/javascript',body:`
      window.searchCalls = [];
      export async function options() {}
      export async function search(query) {
        window.searchCalls.push(query);
        return {results:[{data:async()=>({url:'/search-1/',meta:{title:query},excerpt:'Matching article'})}]};
      }
    `}));
    await page.goto('/browser-checks/');
    await open(page, 'initial');
    await expect(page.locator('.search-result-title')).toHaveText('initial');
    const input = page.locator('#search-query');
    await input.dispatchEvent('compositionstart');
    await input.evaluate(element=>{
      element.value = '研究';
      element.dispatchEvent(new InputEvent('input', {bubbles:true,isComposing:true}));
    });
    await page.waitForTimeout(350);
    expect(await page.evaluate(()=>window.searchCalls)).toEqual(['initial']);
    await expect(page.locator('.search-result-title')).toHaveText('initial');
    await input.dispatchEvent('compositionend');
    await expect(page.locator('.search-result-title')).toHaveText('研究');
    await input.fill('reopened');
    await page.keyboard.press('Escape');
    await open(page);
    await expect(page.locator('.search-result-title')).toHaveText('reopened');
    await expect(page.locator('#site-search')).not.toHaveClass(/search-loading/);
    await input.fill('immediate');
    await page.keyboard.press('Enter');
    await expect(page.locator('.search-result-title')).toHaveText('immediate');
    await expect(page).toHaveURL(/\/browser-checks\/$/);
  });

  for (const colorScheme of ['light','dark']) test(`loading uses the divider without moving content (${colorScheme})`, async ({page}) => {
    await page.emulateMedia({colorScheme,reducedMotion:'no-preference'});
    await page.route('**/pagefind/pagefind.js*', route=>route.fulfill({contentType:'text/javascript',body:`
      export async function options() {}
      export async function search(query) {
        await new Promise(resolve=>{ window.finishSearch = resolve; });
        return {results:[]};
      }
    `}));
    await page.goto('/browser-checks/');
    await open(page);
    const content = await page.locator('.search-content').boundingBox();
    await page.locator('#search-query').fill('waiting');
    await expect(page.locator('#site-search')).toHaveClass(/search-loading/);
    await expect(page.locator('.search-status')).toHaveClass(/search-sr-only/);
    expect((await page.locator('.search-content').boundingBox()).y).toBe(content.y);
    const indicator = () => page.locator('.search-form').evaluate(element=>{
      const style = getComputedStyle(element,'::after');
      return {height:style.height,animation:style.animationName,playState:style.animationPlayState,opacity:style.opacity};
    });
    await expect.poll(indicator).toMatchObject({height:'1px',animation:'search-progress',playState:'running',opacity:'1'});
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect.poll(indicator).toMatchObject({height:'1px',animation:'none',opacity:'1'});
    await page.evaluate(()=>window.finishSearch());
    await expect(page.locator('.search-status')).toHaveText(site ? 'Ничего не нашлось' : 'Nothing found');
    await expect.poll(indicator).toMatchObject({opacity:'0'});
    await expect(page.locator('.search-results')).toHaveAttribute('aria-busy','false');
  });

  test('a subdirectory deployment loads its bundle and keeps result URLs under the prefix', async ({page,baseURL}) => {
    await page.route('**/nested/**', async route=>{
      const url=new URL(route.request().url());
      url.pathname=url.pathname.replace(/^\/nested\//,'/');
      const response=await route.fetch({url:url.href});
      const body=url.pathname.endsWith('/') ? (await response.text()).replace(/data-pagefind-src=("?)([^\s">]+)/, 'data-pagefind-src=$1/nested/pagefind/pagefind.js') : await response.body();
      await route.fulfill({response,body});
    });
    await page.goto(baseURL + '/nested/browser-checks/');
    await open(page, 'orchidquartz');
    await expect(page.locator('.search-result')).toHaveCount(11);
    await expect(page.locator('.search-result').first()).toHaveAttribute('href', /\/nested\/search-\d+\/#matching-section$/);
  });

  for(const colorScheme of ['light','dark']) test(`mobile search fits a narrow screen and shrinking viewport (${colorScheme})`, async ({page})=>{
    await page.setViewportSize({width:320,height:640});
    await page.emulateMedia({colorScheme});
    await page.goto('/browser-checks/');
    await page.locator('.mobile-menu-toggle').click();
    const menuBox = await page.locator('.mobile-menu-toggle').boundingBox();
    const menuColor = await page.locator('.mobile-menu-toggle').evaluate(el=>getComputedStyle(el).color);
    await page.locator('.search-toggle-mobile').click();
    const closeBox = await page.locator('.search-close').boundingBox();
    for (const key of ['x','y','width','height']) expect(Math.abs(closeBox[key] - menuBox[key])).toBeLessThan(1);
    await expect(page.locator('.search-close')).toHaveCSS('color',menuColor);
    await expect(page.locator('.search-close svg')).toHaveCSS('width','24px');
    await expect(page.locator('.search-close svg')).toHaveAttribute('stroke-width','1.5');
    await expect(page.locator('.mobile-menu-toggle')).toHaveAttribute('aria-expanded','false');
    await expect(page.locator('#search-query')).toBeFocused();
    await page.locator('#search-query').fill('orchidquartz');
    await expect(page.locator('.search-result')).toHaveCount(11);
    for(const height of [640,320,640]) {
      await page.setViewportSize({width:320,height});
      await expect.poll(()=>page.locator('dialog').evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBe(height);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.locator('.search-result').last().click({trial:true});
      await page.locator('.search-close').click({trial:true});
    }
    await page.locator('.search-close').click();
    await expect(page.locator('.mobile-menu-toggle')).toBeFocused();
    await expect(page.locator('body')).not.toHaveClass(/search-open/);
  });

  test('disabled JavaScript shows no dead search controls', async ({browser,baseURL})=>{
    const context=await browser.newContext({javaScriptEnabled:false});
    const page=await context.newPage();
    await page.goto(baseURL+'/browser-checks/');
    await expect(page.locator('.search-toggle:visible')).toHaveCount(0);
    await context.close();
  });

  test('revealing search after a delayed script does not move the page', async ({page}) => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/js/main*.js', async route => { await gate; await route.continue(); });
    await page.goto('/search-1/', {waitUntil:'commit'});
    await page.locator('main').waitFor({state:'visible'});
    await page.evaluate(() => Promise.all([...document.fonts].filter(font => font.status === 'loading').map(font => font.loaded)));
    const before = await page.locator('main').boundingBox();
    await expect(page.locator('.search-toggle-desktop')).toBeHidden();
    release();
    await expect(page.locator('.search-toggle-desktop')).toBeVisible();
    const after = await page.locator('main').boundingBox();
    for (const key of ['x','y','width','height']) expect(Math.abs(after[key] - before[key])).toBeLessThan(0.5);
  });
}
