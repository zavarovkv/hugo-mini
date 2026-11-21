export function wideDiagramContracts(test, expect) {
  test('ordinary and wide figures share caption styling and vertical spacing', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/wide-diagram-checks/');
    const figures = page.locator('.article-diagram');
    const diagrams = figures.locator('.mermaid');
    await expect(diagrams.locator('svg')).toHaveCount(2);
    await expect.poll(() => figures.first().evaluate(e => e.getBoundingClientRect().width)).toBe(960);
    await expect.poll(() => figures.nth(1).evaluate(e => e.getBoundingClientRect().width)).toBe(720);
    const captionStyles = await page.locator('figcaption').evaluateAll(nodes => nodes.map(e => {
      const s = getComputedStyle(e);
      return [s.fontSize, s.fontWeight, s.fontStyle, s.lineHeight, s.color, s.textAlign, s.marginTop];
    }));
    expect(captionStyles[0]).toEqual(captionStyles[2]);
    expect(captionStyles[1]).toEqual(captionStyles[2]);
    for (const width of [390, 800, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const outerGap = Math.min(56, Math.max(32, width * 0.04)) + 'px';
      for (const figure of await page.locator('article > figure').all()) {
        await expect(figure).toHaveCSS('margin-block-start', outerGap);
        await expect(figure).toHaveCSS('margin-block-end', outerGap);
      }
      await expect.poll(() => figures.evaluateAll(nodes => nodes.every(e => {
        const r = e.getBoundingClientRect(), a = e.closest('article').getBoundingClientRect();
        const svg = e.querySelector('svg').getBoundingClientRect(), c = e.querySelector('figcaption').getBoundingClientRect();
        const center = a.left + a.width / 2;
        const centered = [r, svg, c].every(box => Math.abs(box.left + box.width / 2 - center) < 1);
        const captionGap = c.top - svg.bottom;
        return centered && Math.abs(captionGap - 16) < 1 && r.width <= 960 && r.left >= 0 && r.right <= document.documentElement.clientWidth && svg.width <= r.width + 1 && c.width <= a.width + 1;
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
