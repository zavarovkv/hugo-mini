import { test, expect } from '@playwright/test';

const brandColors = {
  telegram: 'rgb(38, 165, 228)',
  linkedin: 'rgb(10, 102, 194)',
  github: 'rgb(51, 51, 51)',
  x: 'rgb(0, 0, 0)',
  youtube: 'rgb(255, 0, 0)',
  facebook: 'rgb(24, 119, 242)',
  instagram: 'rgb(228, 64, 95)',
  email: 'rgb(234, 67, 53)',
  rss: 'rgb(255, 102, 0)',
};

for (const colorScheme of ['light', 'dark']) {
  test(`footer icons retain their hover and keyboard colors (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.goto('/browser-checks/');
    const link = page.locator('footer .social-icons a').first();
    const muted = await page.locator('body > footer').evaluate(element => getComputedStyle(element).color);

    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const [brand, lightColor] of Object.entries(brandColors)) {
        // Exercise every supported palette on the fixture's real footer link,
        // independently of the platforms enabled by the consuming site.
        await link.evaluate((element, brand) => { element.className = `social-icon social-${brand}`; }, brand);
        const activeColor = colorScheme === 'dark' && ['github', 'x'].includes(brand)
          ? 'rgb(240, 246, 252)' : lightColor;
        await page.mouse.move(0, 0);
        await link.evaluate(element => element.blur());
        await expect(link, `${brand} resting`).toHaveCSS('color', muted);
        await link.hover();
        await expect(link, `${brand} hover`).toHaveCSS('color', activeColor);
        await expect(link.locator('svg')).toHaveCSS('color', activeColor);
        await page.mouse.move(0, 0);
        await expect(link, `${brand} after hover`).toHaveCSS('color', muted);

        await page.keyboard.press('Tab');
        await link.focus();
        await expect(link).toBeFocused();
        await expect(link, `${brand} keyboard`).toHaveCSS('color', activeColor);
        await expect(link).toHaveCSS('outline-style', 'dotted');
        await expect(link).toHaveCSS('text-decoration-line', 'none');
      }
    }
  });
}
