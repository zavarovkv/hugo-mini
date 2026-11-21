export function wideImageContracts(test, expect) {
  test('wide images and captions share the center of the reading column within source and viewport limits', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/wide-image-checks/');
    await page.evaluate(() => document.fonts.ready);
    const figures = page.locator('.article-image');
    const caption = figures.first().locator('figcaption');
    await expect(caption).toHaveCSS('text-align', 'center');
    await expect(caption).toHaveCSS('font-style', 'italic');
    await expect.poll(() => figures.nth(0).evaluate(e => e.getBoundingClientRect().width)).toBe(960);
    await expect.poll(() => figures.nth(1).evaluate(e => e.getBoundingClientRect().width)).toBe(960);

    for (const width of [320, 768, 800, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(async () => {
        const geometry = await figures.evaluateAll(nodes => {
          const article = nodes[0].closest('article').getBoundingClientRect();
          return nodes.map(node => {
            const rect = node.getBoundingClientRect();
            const img = node.querySelector('img');
            const image = img.getBoundingClientRect();
            const caption = node.querySelector('figcaption')?.getBoundingClientRect();
            const wide = node.classList.contains('article-image-wide');
            const center = rect.left + rect.width / 2;
            const alignmentError = wide ? center - (article.left + article.width / 2) : rect.left - article.left;
            return { left: rect.left, aligned: Math.abs(alignmentError) < 0.5,
              width: rect.width, articleWidth: article.width, wide,
              right: rect.right, viewport: document.documentElement.clientWidth,
              source: Number(img.getAttribute('width')), imageWidth: image.width,
              ratio: image.width / image.height, sourceRatio: Number(img.getAttribute('width')) / Number(img.getAttribute('height')),
              captionWidth: caption?.width, captionCentered: !caption || Math.abs(caption.left + caption.width / 2 - center) < 0.5 };
          });
        });
        return geometry.every(r => r.aligned && r.left >= 0 && r.right <= r.viewport &&
          r.width <= Math.min(960, r.source) && Math.abs(r.imageWidth - r.width) < 0.5 &&
          Math.abs(r.ratio - r.sourceRatio) < 0.01 && (!r.captionWidth || r.captionWidth <= r.articleWidth + 1) &&
          r.captionCentered && ((width > 768 && r.wide) || r.width <= r.articleWidth + 1));
      }).toBe(true);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect.poll(() => figures.nth(0).evaluate(e => e.getBoundingClientRect().width)).toBe(960);
    await expect.poll(() => figures.nth(1).evaluate(e => e.getBoundingClientRect().width)).toBe(960);
    await figures.nth(1).scrollIntoViewIfNeeded();
    expect(await figures.nth(1).locator('img').evaluate(img => {
      const r = img.getBoundingClientRect();
      return document.elementFromPoint(r.right - 8, Math.max(0, r.top) + 8) === img;
    })).toBe(true);
    await page.setViewportSize({ width: 650, height: 900 });
    await page.emulateMedia({ media: 'print' });
    expect(await figures.evaluateAll(nodes => nodes.every(node => {
      const rect = node.getBoundingClientRect();
      return rect.width <= node.closest('article').getBoundingClientRect().width + 1;
    }))).toBe(true);
    expect(errors).toEqual([]);
  });

  test('wide figures work without JavaScript and keep their native semantics', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    try {
      const page = await context.newPage();
      await page.goto('/wide-image-checks/');
      await expect(page.locator('figure')).toHaveCount(4);
      await expect(page.getByRole('img', { name: 'Second wide image' })).toHaveAttribute('width', '1200');
      await expect(page.locator('figure').nth(1)).toHaveAccessibleName('A wide image with a caption.');
      expect(await page.locator('figure').nth(1).evaluate(e => e.getBoundingClientRect().width)).toBe(960);
      await expect(page.locator('#recent-sidebar')).toHaveCount(0);
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally {
      await context.close();
    }
  });
}
