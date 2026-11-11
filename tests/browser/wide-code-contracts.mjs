export function wideCodeContracts(test, expect) {
  for (const colorScheme of ['light', 'dark']) {
    test(`wide code expands long lines and keeps short examples in the column (${colorScheme})`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.emulateMedia({ colorScheme });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/wide-code-checks/');
      await page.evaluate(() => document.fonts.ready);
      const article = page.locator('article');
      const blocks = page.locator('article > .code-block');
      await expect(blocks).toHaveCount(4);
      await expect.poll(() => blocks.nth(0).evaluate(e => e.getBoundingClientRect().width)).toBe(960);
      await expect.poll(() => blocks.nth(1).evaluate(e => e.getBoundingClientRect().width)).toBe(960);
      const source = await blocks.nth(1).locator('code').textContent();
      await article.evaluate(e => e.classList.remove('article-wide-code'));
      expect(await blocks.nth(1).evaluate(e => e.getBoundingClientRect().width)).toBe(720);
      await article.evaluate(e => e.classList.add('article-wide-code'));

      for (const width of [320, 390, 768, 800, 1024, 1280, 1440, 1920, 2560]) {
        await page.setViewportSize({ width, height: 900 });
        await expect.poll(() => blocks.evaluateAll(nodes => nodes.every(node => {
          const r = node.getBoundingClientRect(), a = node.closest('article').getBoundingClientRect();
          return Math.abs(r.left - a.left) < 0.5 && r.width <= 960 && r.right <= document.documentElement.clientWidth;
        }))).toBe(true);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(await blocks.nth(2).evaluate(e => Math.abs(e.getBoundingClientRect().width - e.closest('article').getBoundingClientRect().width) < 1)).toBe(true);
        expect(await page.locator('blockquote .code-block').evaluate(e => e.getBoundingClientRect().width <= e.closest('blockquote').getBoundingClientRect().width)).toBe(true);
      }
      await page.setViewportSize({ width: 390, height: 900 });
      const pre = blocks.nth(1).locator('pre');
      await pre.scrollIntoViewIfNeeded();
      await pre.focus();
      await expect(pre).toBeFocused();
      await page.keyboard.press('ArrowRight', { delay: 120 });
      await expect.poll(() => pre.evaluate(e => e.scrollLeft)).toBeGreaterThan(0);
      expect(await blocks.nth(1).locator('code').textContent()).toBe(source);
      await page.setViewportSize({ width: 1440, height: 900 });
      await blocks.nth(1).locator('.copy-btn').focus();
      expect(await blocks.nth(1).locator('.copy-btn').evaluate(e => {
        const b = e.closest('.code-block').getBoundingClientRect(), r = e.getBoundingClientRect();
        return r.right <= b.right && r.left >= b.left;
      })).toBe(true);
      await page.emulateMedia({ media: 'print' });
      expect(await blocks.evaluateAll(nodes => nodes.every(e => e.getBoundingClientRect().width <= e.closest('article').getBoundingClientRect().width + 1))).toBe(true);
      expect(await blocks.nth(1).locator('pre').evaluate(e => getComputedStyle(e).whiteSpace)).toBe('pre-wrap');
      expect(errors).toEqual([]);
    });
  }

  test('code stays readable without JavaScript', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    try {
      const page = await context.newPage();
      await page.goto('/wide-code-checks/');
      await page.evaluate(() => document.fonts.ready);
      expect(await page.locator('article > .code-block').nth(1).evaluate(e => e.getBoundingClientRect().width)).toBe(720);
      await page.setViewportSize({ width: 390, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally { await context.close(); }
  });
}
