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
      const resultGroups = await entry.locator('.resume-group-heading').evaluateAll(nodes => nodes.map(node => ({
        level: node.tagName,
        before: node.getBoundingClientRect().top - node.previousElementSibling.getBoundingClientRect().bottom,
        after: node.nextElementSibling.getBoundingClientRect().top - node.getBoundingClientRect().bottom,
        list: node.nextElementSibling.tagName
      })));
      expect(resultGroups).toHaveLength(2);
      for (const group of resultGroups) {
        expect(group.level).toBe('H5');
        expect(group.list).toBe('UL');
        expect(group.after).toBeGreaterThan(0);
        expect(group.before).toBeGreaterThan(group.after);
      }
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

  test('mobile date endpoints align vertically without pushing the role away from its company', async ({ page }) => {
    await page.goto('/resume-checks/');
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator('.resume-entry-header').first();
    await header.locator('h3 .heading-scroll').evaluate(node => { node.textContent = 'MegaMarket'; });
    await header.locator('.resume-entry-role').evaluate(node => { node.textContent = 'Product Manager'; });
    await header.locator('.resume-period-start').evaluate(node => { node.textContent = 'апрель\u00a02017'; });
    await header.locator('.resume-period-end').evaluate(node => { node.textContent = 'март\u00a02018'; });
    for (const width of [360, 390, 430, 600]) {
      await page.setViewportSize({ width, height: 900 });
      const company = await header.locator('h3').boundingBox();
      const role = await header.locator('.resume-entry-role').boundingBox();
      const period = await header.locator('.resume-period').boundingBox();
      const bounds = await header.boundingBox();
      expect(role.y - company.y - company.height).toBeGreaterThanOrEqual(0);
      const paragraphGap = await header.locator('h3').evaluate(node => parseFloat(getComputedStyle(node).marginBottom));
      expect(role.y - company.y - company.height).toBeCloseTo(paragraphGap);
      expect(role.x).toBeCloseTo(company.x);
      expect(role.x + role.width).toBeLessThanOrEqual(period.x);
      expect(period.x + period.width).toBeCloseTo(bounds.x + bounds.width);
      const start = await header.locator('.resume-period-start').boundingBox();
      const end = await header.locator('.resume-period-end').boundingBox();
      expect(end.x).toBeCloseTo(start.x);
      expect(end.y).toBeGreaterThan(start.y);
      const lineHeight = await header.locator('.resume-period').evaluate(node => parseFloat(getComputedStyle(node).lineHeight));
      expect(period.height).toBeCloseTo(lineHeight * 2, 0);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    const start = await header.locator('.resume-period-start').boundingBox();
    const end = await header.locator('.resume-period-end').boundingBox();
    expect(end.y).toBeCloseTo(start.y);
    expect(end.x).toBeGreaterThan(start.x + start.width);
    await expect(header.locator('.resume-period')).toHaveText(/апрель\s2017\s—\sмарт\s2018/);
  });

  test('resume text shares native paragraph spacing independently of date columns', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/resume-checks/');
    await page.evaluate(() => document.fonts.ready);
    const gaps = () => page.locator('.resume-text').evaluateAll(groups => groups.flatMap(group => {
      const blocks = [...group.children];
      return blocks.slice(1).map((node, index) => {
        const previous = blocks[index];
        return {
          actual: node.getBoundingClientRect().top - previous.getBoundingClientRect().bottom,
          expected: parseFloat(getComputedStyle(previous).marginBottom)
        };
      });
    }));
    const initial = await gaps();
    expect(initial.length).toBeGreaterThanOrEqual(4); // Job, metadata, education and course detail.
    for (const gap of initial) {
      expect(gap.actual).toBeGreaterThan(0);
      expect(gap.actual).toBeCloseTo(gap.expected, 1);
    }
    // Related fields stay closer than independent paragraphs in the job body.
    const paragraphSpace = await page.locator('.resume-entry > p').first().evaluate(node => parseFloat(getComputedStyle(node).marginBottom));
    for (const gap of initial) expect(gap.actual).toBeLessThan(paragraphSpace);
    const course = page.locator('.resume-list-item').filter({ has: page.locator('.resume-list-detail') });
    const title = course.locator('.resume-list-label');
    expect(await title.evaluate(node => node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight))).toBeGreaterThan(1);
    const betweenRecords = await course.evaluate(node => node.nextElementSibling.getBoundingClientRect().top - node.getBoundingClientRect().bottom);
    expect(betweenRecords).toBeGreaterThan(initial.at(-1).actual);

    // A single text-spacing setting must reach every record, even when dates wrap.
    await page.locator('body').evaluate(node => node.style.setProperty('--beauty-space', '1em'));
    const expanded = await gaps();
    for (const [index, gap] of expanded.entries()) {
      expect(gap.actual).toBeGreaterThan(initial[index].actual);
      expect(gap.actual).toBeCloseTo(gap.expected, 1);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(course.locator('.resume-list-detail')).toHaveCSS('display', 'inline');
    const educationGap = await page.locator('.resume-list-subtitle').evaluate(node => ({
      actual: node.getBoundingClientRect().top - node.previousElementSibling.getBoundingClientRect().bottom,
      expected: parseFloat(getComputedStyle(node.previousElementSibling).marginBottom)
    }));
    expect(educationGap.actual).toBeCloseTo(educationGap.expected);
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
