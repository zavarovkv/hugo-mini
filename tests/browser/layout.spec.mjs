import { test, expect } from '@playwright/test';
import { layoutContracts } from './contracts.mjs';
layoutContracts(test, expect);

test('archive navigation, headings and reading type follow the browser font preference', async ({ page, browserName }) => {
  // Chromium also lets us change the browser preference used by rem media queries.
  const client = browserName === 'chromium' ? await page.context().newCDPSession(page) : null;
  for (const fontSize of client ? [16, 20] : [16]) {
    if (client) await client.send('Page.setFontSizes', { fontSizes: { standard: fontSize } });
    const breakpoint = 48 * fontSize;
    await page.setViewportSize({ width: breakpoint, height: 900 });
    await page.goto('/blog/');
    const categories = page.locator('.posts-group-title');
    expect(await categories.count()).toBeGreaterThan(0);
    expect(await categories.evaluateAll(nodes => nodes.every(node => node.tagName === 'H2'))).toBe(true);
    await expect(categories.getByRole('link')).toHaveCount(0);
    await expect(categories.first()).toHaveCSS('letter-spacing', 'normal');
    const menu = page.locator('.mobile-menu-toggle');
    const navigation = page.locator('#main-navigation');
    await expect(menu).toBeVisible();
    await expect(navigation).toHaveJSProperty('inert', true);
    await expect(page.locator('.posts-columns')).toHaveCSS('display', 'flow-root');
    await expect(page.locator('main h1')).toHaveCSS('font-size', `${2 * fontSize}px`);
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.setViewportSize({ width: breakpoint + 1, height: 900 });
    await expect(menu).toBeHidden();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation).toHaveJSProperty('inert', false);
    await expect(page.locator('.posts-columns')).toHaveCSS('display', 'flex');
    await expect(page.locator('main h1')).toHaveCSS('font-size', `${2.75 * fontSize}px`);
  }
});
