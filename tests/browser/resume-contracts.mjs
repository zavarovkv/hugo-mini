export function resumeContracts(test, expect) {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.route('**/*', route => route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
  });

  test('standalone resume retains contacts, fits mobile and prints without blog controls', async ({ page }) => {
    for (const width of [1440, 390, 360, 320, 240]) for (const colorScheme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme, media: 'screen' });
      await page.goto('/resume-checks/');
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1')).toHaveText('Alex Example');
      await expect(page.locator('link[rel="stylesheet"][href*="/css/resume.min."]')).toHaveCount(1);
      await expect(page.locator('.resume-entry')).toHaveCount(1);
      await expect(page.locator('.resume-list > .resume-list-item')).toHaveCount(3);
      await expect(page.locator('.resume-list-label strong')).toHaveCount(0);
      await expect(page.locator('.resume')).toHaveCSS('padding-bottom', '64px');
      await expect(page.locator('a[href="mailto:alex@example.org"]')).toBeVisible();
      await expect(page.locator('.resume-contacts li').last()).toHaveText('+1 202 555 0100');
      await expect(page.locator('.resume-contacts li').last().locator('a')).toHaveCount(0);
      const contacts = await page.locator('.resume-contacts').boundingBox();
      const header = await page.locator('.resume-header').boundingBox();
      const alignment = width > 600 ? contacts.x + contacts.width - header.x - header.width : contacts.x - header.x;
      expect(Math.abs(alignment)).toBeLessThan(1);
      const cells = await page.locator('.resume-contacts li').evaluateAll(nodes => nodes.map(n => {
        const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, bottom: r.bottom };
      }));
      if (width < 320) {
        expect(cells[1].x).toBeCloseTo(cells[0].x);
        expect(cells[1].y).toBeGreaterThanOrEqual(cells[0].bottom);
      } else if (width <= 600) {
        expect(cells[1].y).toBeCloseTo(cells[0].y);
        expect(cells[1].width).toBeCloseTo(cells[0].width);
      }
      const entry = page.locator('.resume-entry').first();
      await expect(entry.locator('dl dt')).toHaveCount(2);
      await expect(entry.locator('dl dd')).toHaveCount(2);
      const company = await entry.locator('h3').boundingBox();
      const role = await entry.locator('.resume-entry-role').boundingBox();
      const period = await entry.locator('.resume-period').boundingBox();
      expect(role.x).toBeCloseTo(company.x);
      expect(role.y).toBeGreaterThanOrEqual(company.y + company.height);
      if (width < 360) {
        expect(period.x).toBeCloseTo(company.x);
        expect(period.y).toBeGreaterThanOrEqual(role.y + role.height);
      } else {
        const entryHeader = await entry.locator('.resume-entry-header').boundingBox();
        expect(period.x + period.width).toBeCloseTo(entryHeader.x + entryHeader.width);
        expect(period.y).toBeGreaterThanOrEqual(company.y);
        expect(period.y).toBeLessThan(company.y + company.height);
      }
      const rules = await page.locator('.resume > h2').evaluateAll(nodes => nodes.map(n => getComputedStyle(n, '::after').borderBottomWidth));
      expect(rules).toEqual(['1px', '1px', '1px']);
      await expect(page.locator('button, .main-nav, .heading-anchor, .heading-scroll-link, .back-to-top-wrap')).toHaveCount(0);
      await expect(page.locator('h1 .heading-scroll')).toHaveCount(1);
      await expect(page.locator('.resume > h2 .heading-scroll')).toHaveCount(3);
      await expect(page.locator('.resume-entry-heading .heading-scroll')).toHaveCount(1);
      const ink = colorScheme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
      const colors = await page.locator('.resume h1, .resume h2, .resume h3, .resume p, .resume a, .resume li, .resume strong, .resume dt, .resume dd').evaluateAll(nodes => [...new Set(nodes.map(n => getComputedStyle(n).color))]);
      expect(colors).toEqual([ink]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.emulateMedia({ media: 'print' });
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(page.locator('.resume')).toHaveCSS('font-size', '14px');
      await expect(page.locator('.resume')).toHaveCSS('padding-bottom', '0px');
      await expect(page.locator('.resume-list-item').first()).toHaveCSS('break-inside', 'avoid-page');
      await expect(page.locator('.resume-period').first()).toHaveCSS('color', 'rgb(0, 0, 0)');
      await expect(page.locator('.resume-entry-header').first()).toHaveCSS('break-after', 'avoid-page');
      expect(await page.locator('.resume > h2').first().evaluate(n => getComputedStyle(n, '::after').borderBottomWidth)).toBe('1px');
    }
    await page.goto('/browser-checks/');
    await expect(page.locator('link[rel="stylesheet"][href*="/css/resume.min."]')).toHaveCount(0);
  });

  test('resume sections and organizations share alignment and fragment navigation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/resume-checks/');
    await page.evaluate(() => document.fonts.ready);
    // Leave room below the short fixture to exercise alignment rather than end clamping.
    await page.addStyleTag({ content: '.resume { padding-bottom: 100vh; }' });
    const heading = page.locator('.resume > h2').first();
    const id = await heading.getAttribute('id');
    await heading.locator('.heading-scroll').click();
    await expect.poll(() => heading.evaluate(h => Math.abs(h.getBoundingClientRect().top - 24))).toBeLessThanOrEqual(1);
    expect(new URL(page.url()).hash).toBe('#' + id);
    await page.evaluate(() => scrollTo(0, 0));
    const box = await heading.boundingBox();
    await heading.click({ position: { x: box.width - 2, y: box.height / 2 } });
    await expect.poll(() => heading.evaluate(h => Math.abs(h.getBoundingClientRect().top - 24))).toBeLessThanOrEqual(1);
    expect(await heading.evaluate(h => getComputedStyle(h).alignItems)).toBe('center');
    await heading.locator('.heading-scroll').focus();
    await page.keyboard.press('Alt+ArrowDown');
    const next = page.locator('.resume-entry-heading').first();
    await expect(next.locator('.heading-scroll')).toBeFocused();
    expect(new URL(page.url()).hash).toBe('#' + await next.getAttribute('id'));
    await expect.poll(() => next.evaluate(h => Math.abs(h.getBoundingClientRect().top - 24))).toBeLessThanOrEqual(1);
    await page.evaluate(() => scrollTo(0, 0));
    await next.locator('.heading-scroll').click();
    await expect.poll(() => next.evaluate(h => Math.abs(h.getBoundingClientRect().top - 24))).toBeLessThanOrEqual(1);
    await page.keyboard.press('Alt+ArrowDown');
    await expect(page.locator('.resume > h2').nth(1).locator('.heading-scroll')).toBeFocused();
    await page.keyboard.press('Alt+ArrowDown');
    await expect(page.locator('.resume > h2').nth(2).locator('.heading-scroll')).toBeFocused();
  });

  test('resume name clears the fragment without reloading or discarding the query', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/resume-checks/?view=compact');
    await page.evaluate(() => { window.resumeNavigationMarker = true; });
    await page.locator('.resume-entry-heading .heading-scroll').first().click();
    const fragment = new URL(page.url()).hash;
    expect(fragment).not.toBe('');
    await page.locator('h1 .heading-scroll').click();
    expect(new URL(page.url()).hash).toBe('');
    expect(new URL(page.url()).search).toBe('?view=compact');
    expect(await page.evaluate(() => window.resumeNavigationMarker)).toBe(true);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.goBack();
    expect(new URL(page.url()).hash).toBe(fragment);
  });

  test('heading shortcuts reach every section at the page bottom and resume after manual scrolling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/resume-checks/');
    await page.evaluate(() => document.fonts.ready);
    const headings = page.locator('.heading-scrollable');
    await headings.first().locator('.heading-scroll').click();
    for (let index = 1; index < await headings.count(); index++) {
      await page.keyboard.press('Alt+ArrowDown');
      await expect(headings.nth(index).locator('.heading-scroll')).toBeFocused();
    }
    const lastURL = page.url();
    await page.keyboard.press('Alt+ArrowDown');
    expect(page.url()).toBe(lastURL);
    for (let index = await headings.count() - 2; index >= 0; index--) {
      await page.keyboard.press('Alt+ArrowUp');
      await expect(headings.nth(index).locator('.heading-scroll')).toBeFocused();
    }
    expect(new URL(page.url()).hash).toBe('');
    await headings.last().locator('.heading-scroll').click();
    // Deliver the shortcut before the queued scroll event, as WebKit can do.
    await page.evaluate(() => {
      scrollTo(0, 0);
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true, cancelable: true }));
    });
    await expect(headings.nth(1).locator('.heading-scroll')).toBeFocused();
  });

  test('resume content and browser printing remain available without JavaScript', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      await context.route('**/*', route => route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
      const page = await context.newPage();
      await page.goto(`${baseURL}/resume-checks/`);
      await expect(page.locator('.resume-entry')).toHaveCount(1);
      await page.emulateMedia({ media: 'print' });
      await expect(page.locator('h1')).toBeVisible();
    } finally { await context.close(); }
  });
}
