export function wideDiagramContracts(test, expect) {
  for (const colorScheme of ['light', 'dark']) {
    test(`wide diagrams share image geometry and captions (${colorScheme})`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.emulateMedia({ colorScheme });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/wide-diagram-checks/');
      const figures = page.locator('.article-diagram');
      const diagrams = figures.locator('.mermaid');
      await expect(diagrams.locator('svg')).toHaveCount(2);
      await expect.poll(() => figures.first().evaluate(e => e.getBoundingClientRect().width)).toBe(960);
      await expect.poll(() => figures.nth(1).evaluate(e => e.getBoundingClientRect().width)).toBe(960);
      const captionStyles = await page.locator('figcaption').evaluateAll(nodes => nodes.map(e => {
        const s = getComputedStyle(e);
        return [s.fontSize, s.fontWeight, s.fontStyle, s.lineHeight, s.color, s.textAlign, s.marginTop];
      }));
      expect(captionStyles[0]).toEqual(captionStyles[2]);
      expect(captionStyles[1]).toEqual(captionStyles[2]);
      for (const width of [390, 800, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await expect.poll(() => figures.evaluateAll(nodes => nodes.every(e => {
          const r = e.getBoundingClientRect(), a = e.closest('article').getBoundingClientRect();
          const svg = e.querySelector('svg').getBoundingClientRect(), c = e.querySelector('figcaption').getBoundingClientRect();
          return Math.abs(r.left - a.left) < 1 && r.width <= 960 && r.right <= document.documentElement.clientWidth && svg.width <= r.width + 1 && c.width <= a.width + 1;
        }))).toBe(true);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      const screen = await diagrams.evaluateAll(nodes => nodes.map(e => e.innerHTML));
      await page.emulateMedia({ media: 'print' });
      await expect(diagrams.locator('svg')).toHaveCount(2);
      expect(await figures.evaluateAll(nodes => nodes.every(e => e.getBoundingClientRect().width <= e.closest('article').getBoundingClientRect().width + 1))).toBe(true);
      await page.emulateMedia({ media: 'screen' });
      await expect.poll(() => diagrams.evaluateAll(nodes => nodes.map(e => e.innerHTML))).toEqual(screen);
      expect(errors).toEqual([]);
    });
  }
}
