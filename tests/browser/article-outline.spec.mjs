import { test, expect } from '@playwright/test';

test('the outline requires two visible H2 sections', async ({ page }) => {
  await page.setViewportSize({width: 1440, height: 850});
  const outline = page.locator('.article-outline');
  await page.goto('/article-link-checks/');
  await expect(page.locator('article h2')).toHaveCount(1);
  await expect(outline).toHaveCount(0);

  await page.goto('/article-outline-checks/');
  const opening = page.locator('#opening');
  await opening.evaluate(h => h.scrollIntoView());
  await expect(outline).toBeVisible();
  const second = page.locator('article h2').nth(1);
  await second.evaluate(h => { h.hidden = true; });
  await expect(outline).toBeHidden();
  await second.evaluate(h => { h.hidden = false; });
  await expect(outline).toBeVisible();
});

test('outline links follow visible H2s and retain native fragment navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 850 });
  await page.goto('/article-outline-checks/');
  const outline = page.locator('.article-outline');
  await expect(outline).toBeHidden();
  await page.locator('h2#opening').evaluate(h => h.scrollIntoView());
  await expect(outline).toBeVisible();
  const links = outline.getByRole('link');
  await expect(links).toHaveCount(3);
  const progress = () => outline.evaluate(n => Number(n.style.getPropertyValue('--outline-progress')));
  const start = await progress();
  await page.evaluate(() => window.scrollBy(0, 180));
  await expect.poll(progress).toBeGreaterThan(start);
  expect(await progress()).toBeLessThan(1);
  const last = links.last();
  await last.hover();
  await expect(last.locator('span')).toBeVisible();
  await expect(last).toHaveCSS('visibility', 'visible', {pseudo: 'after'});
  await page.mouse.move(0, 0);
  await last.focus();
  await expect(last.locator('span')).toBeVisible();
  await expect(last).toHaveCSS('visibility', 'visible', {pseudo: 'after'});
  await page.keyboard.press('Enter');
  await expect(links.last()).toHaveAttribute('aria-current', 'location');
  const fragment = new URL(page.url()).hash;
  expect(decodeURIComponent(fragment)).toBe('#вторая-часть%20');
  await page.locator('h2#opening').evaluate(h => h.scrollIntoView());
  await expect(links.nth(1)).toHaveAttribute('aria-current', 'location');
  expect(new URL(page.url()).hash).toBe(fragment);
  await page.setViewportSize({width: 390, height: 844});
  await expect(outline).toBeHidden();
  await page.setViewportSize({width: 1440, height: 850});
  await expect(links).toHaveCount(3);
  await links.first().click();
  await expect(page).toHaveURL(/#page-title$/);
  await expect(outline).toBeHidden();
  await page.locator('h2#opening').evaluate(h => h.scrollIntoView());
  await expect(outline).toBeVisible();
  await page.emulateMedia({media: 'print'});
  await expect(outline).toBeHidden();
});

test.describe('without JavaScript', () => {
  test.use({javaScriptEnabled: false, viewport: {width: 1440, height: 850}});
  test('the article keeps its headings and no inactive controls', async ({page}) => {
    await page.goto('/article-outline-checks/');
    await expect(page.locator('.article-outline')).toBeHidden();
    await expect(page.getByRole('heading', {level: 2})).toHaveCount(3);
    const heading = page.locator('article h2').nth(1);
    const href = await heading.locator('.heading-anchor').getAttribute('href');
    expect(decodeURIComponent(href.slice(1))).toBe(await heading.getAttribute('id'));
  });
});
