import { test, expect } from '@playwright/test';

async function observeTransitions(page) {
  await page.addInitScript(() => {
    window.menuTransition = { seen: false };
    addEventListener('pagereveal', event => {
      const transition = event.viewTransition;
      window.menuTransition = { seen: true, active: Boolean(transition) };
      if (!transition) return;
      transition.ready.then(() => {
        // WebKit also reports ordinary hover/theme transitions during reveal.
        window.menuTransition.animations = document.getAnimations().filter(animation =>
          animation.effect?.pseudoElement?.startsWith('::view-transition')
        ).map(animation => ({
          pseudo: animation.effect?.pseudoElement,
          duration: animation.effect?.getTiming().duration,
        }));
      }).catch(error => { window.menuTransition.error = String(error); });
      transition.finished.then(() => { window.menuTransition.finished = true; });
    });
  });
}

async function menuGeometry(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.locator('#main-navigation a:visible').evaluateAll(links => links.map(link => {
    const rect = link.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }));
}

async function expectSelected(page, name) {
  const link = page.locator('#main-navigation').getByRole('link', { name, exact: true });
  await expect(link).toHaveAttribute('aria-current', 'page');
  expect(await link.evaluate(element => {
    const style = getComputedStyle(element);
    return Number(style.fontWeight) === Number(style.getPropertyValue('--font-weight-bold'));
  })).toBe(true);
}

for (const colorScheme of ['light', 'dark']) {
  test(`desktop menu blends its selected state without moving neighboring links (${colorScheme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ colorScheme, reducedMotion: 'no-preference' });
    await observeTransitions(page);
    await page.goto('/blog/');
    await expectSelected(page, 'Articles');
    const before = await menuGeometry(page);
    const about = page.locator('#main-navigation').getByRole('link', { name: 'About & contact', exact: true });
    await expect(about).toHaveAccessibleName('About & contact');
    await about.click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expectSelected(page, 'About & contact');
    await expect.poll(() => page.evaluate(() => window.menuTransition.finished)).toBe(true);
    const transition = await page.evaluate(() => window.menuTransition);
    expect(transition.active).toBe(true);
    expect(transition.error).toBeUndefined();
    expect(transition.animations.length).toBeGreaterThan(0);
    expect(transition.animations.every(animation => animation.pseudo?.includes('(main-navigation)') && animation.duration === 300)).toBe(true);
    const after = await menuGeometry(page);
    expect(after.length).toBe(before.length);
    after.forEach((rect, index) => {
      for (const dimension of ['x', 'y', 'width', 'height']) expect(Math.abs(rect[dimension] - before[index][dimension])).toBeLessThan(0.5);
    });
    // Native history traversal retains the original selected section too.
    await page.goBack();
    await expectSelected(page, 'Articles');
  });
}

test('reduced motion keeps section navigation immediate', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await observeTransitions(page);
  await page.goto('/blog/');
  await page.locator('#main-navigation').getByRole('link', { name: 'About & contact', exact: true }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expectSelected(page, 'About & contact');
  await expect.poll(() => page.evaluate(() => window.menuTransition)).toEqual({ seen: true, active: false });
});

test('mobile section changes preserve the closed overlay and selected label', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await observeTransitions(page);
  await page.goto('/browser-checks/');
  await page.locator('.mobile-menu-toggle').click();
  await page.locator('#main-navigation').getByRole('link', { name: 'About & contact', exact: true }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.locator('.mobile-menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#main-navigation')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.menuTransition)).toEqual({ seen: true, active: false });
  await page.locator('.mobile-menu-toggle').click();
  await expectSelected(page, 'About & contact');
  const labelStarts = await page.locator('#main-navigation .nav-label > .beauty-link-label').evaluateAll(labels => labels.map(label => label.getBoundingClientRect().left));
  expect(new Set(labelStarts).size).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('section links and stable widths work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  try {
    const page = await context.newPage();
    await page.goto('/blog/');
    const before = await menuGeometry(page);
    await page.locator('#main-navigation').getByRole('link', { name: 'About & contact', exact: true }).click();
    await expectSelected(page, 'About & contact');
    const after = await menuGeometry(page);
    expect(after).toEqual(before);
  } finally {
    await context.close();
  }
});
