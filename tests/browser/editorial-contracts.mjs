export function editorialContracts({test, expect}) {
for (const colorScheme of ['light','dark']) test(`editorial helpers preserve copy, margins and number roles (${colorScheme})`, async ({page}) => {
  await page.emulateMedia({colorScheme});
  for (const width of [320,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/editorial-checks/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.beauty-hanging-open')).toHaveCount(3);
    await expect(page.locator('h1')).toHaveText('«Кавычки и цифры»');
    await expect(page.locator('#oldstyle')).toHaveCSS('font-variant-numeric','oldstyle-nums proportional-nums');
    await expect(page.locator('#lining')).toHaveCSS('font-variant-numeric','lining-nums');
    await expect(page.locator('.beauty-footnote-ref')).toHaveCSS('font-variant-numeric','lining-nums');
    await expect(page.locator('code')).toHaveCSS('font-variant-numeric','lining-nums');
    await expect(page.locator('td').first()).toHaveCSS('font-variant-numeric','lining-nums tabular-nums');
    for (const fraction of await page.locator('.beauty-fraction').all()) {
      await expect(fraction).toHaveText('1/3');
      await expect(fraction).toHaveCSS('font-variant-numeric','lining-nums proportional-nums');
    }
    const quote = page.locator('h1 .beauty-hanging-open');
    expect((await quote.boundingBox()).width).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({media:'print'});
    expect((await quote.boundingBox()).width).toBeGreaterThan(0);
    await page.emulateMedia({media:'screen'});
  }
});

test('heading anchors clear hanging quotes on hover, focus and mobile tap', async ({page}) => {
  for (const width of [320, 768, 769, 800, 832, 833, 1440]) {
    await page.setViewportSize({width, height:900});
    await page.goto('/editorial-checks/');
    await page.evaluate(() => document.fonts.ready);
    const heading = page.locator('h2').first();
    const anchor = heading.locator('.heading-anchor');
    if (width <= 768) {
      await expect(anchor).toBeHidden();
      await heading.click();
      await expect(anchor).toBeVisible();
    } else {
      await heading.hover();
    }
    await expect(anchor).toHaveCSS('opacity', '1');
    const geometry = await heading.evaluate(h => {
      const range = document.createRange();
      range.selectNodeContents(h.querySelector('.beauty-hanging-open'));
      const quote = range.getBoundingClientRect();
      const icon = h.querySelector('.heading-anchor svg').getBoundingClientRect();
      const link = h.querySelector('.heading-anchor').getBoundingClientRect();
      return {
        clear: icon.right <= quote.left || icon.left >= quote.right,
        withinViewport: link.left >= 0 && link.right <= innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(geometry).toEqual({clear:true, withinViewport:true, overflow:false});
    await page.mouse.move(0, 0);
    await anchor.focus();
    await expect(anchor).toBeFocused();
    await expect(anchor).toHaveCSS('opacity', '1');
  }
});
}
