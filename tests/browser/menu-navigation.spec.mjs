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

test('desktop menu switches sections without moving neighboring links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await observeTransitions(page);
  await page.goto('/blog/');
  await expectSelected(page, 'Articles');
  const before = await menuGeometry(page);
  const about = page.locator('#main-navigation').getByRole('link', { name: 'About & contact', exact: true });
  await expect(about).toHaveAccessibleName('About & contact');
  await about.click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expectSelected(page, 'About & contact');
  await expect.poll(() => page.evaluate(() => window.menuTransition)).toMatchObject({ active: true, finished: true });
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
  const rows = await page.locator('#main-navigation > :is(a, .search-toggle-mobile):visible').evaluateAll(items =>
    items.map(item => [getComputedStyle(item).fontSize, item.getBoundingClientRect().height, getComputedStyle(item).borderBottomWidth])
  );
  expect(rows).toEqual(Array(rows.length).fill(['24px', 76, '0px']));
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('long mobile labels remain inside their rows with enlarged text on a short screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 320 });
  await page.goto('/browser-checks/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#main-navigation .nav-label').evaluateAll(labels => {
    for (const [index, label] of labels.entries()) {
      const text = index === 0
        ? 'Articles about product strategy, research and product team leadership'
        : index === labels.length - 1 ? 'SubscribeToProductManagementAndLeadershipUpdates' : label.textContent;
      (label.querySelector('.beauty-link-label') || label).textContent = text;
      if (label.hasAttribute('data-label')) label.setAttribute('data-label', text);
    }
  });
  await page.locator('.mobile-menu-toggle').click();
  for (const scale of [100, 200]) {
    await page.evaluate(scale => { document.documentElement.style.fontSize = scale + '%'; }, scale);
    const rows = await page.locator('#main-navigation > a').evaluateAll(links => links.map(link => {
      const box = link.getBoundingClientRect();
      const style = getComputedStyle(link);
      const range = document.createRange();
      range.selectNodeContents(link.querySelector('.beauty-link-label'));
      return {
        top: box.top, bottom: box.bottom,
        contained: [...range.getClientRects()].every(rect =>
          rect.left >= box.left + parseFloat(style.paddingLeft) - 1 &&
          rect.right <= box.right - parseFloat(style.paddingRight) + 1 &&
          rect.bottom <= box.bottom - parseFloat(style.paddingBottom) + 1),
      };
    }));
    expect(rows.every(row => row.contained), `labels at ${scale}%`).toBe(true);
    expect(rows.every((row, index) => index === 0 || row.top >= rows[index - 1].bottom - 1)).toBe(true);
    expect(await page.locator('#main-navigation').evaluate(nav => nav.scrollWidth <= nav.clientWidth + 1)).toBe(true);
    await page.locator('#main-navigation > a').last().click({ trial: true });
  }
});

test('mobile menu shares the footer links, language and theme controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/search-language/');
  const footer = page.locator('body > footer');
  const nav = page.locator('#main-navigation');
  const toggle = page.locator('.mobile-menu-toggle');
  const rss = footer.getByRole('link', { name: 'RSS', exact: true });
  const rssURL = await rss.getAttribute('href');
  const rssColor = await rss.evaluate(link => getComputedStyle(link).color);
  await toggle.click();
  const menuRSS = nav.getByRole('link', { name: 'RSS', exact: true });
  await expect(menuRSS).toHaveAttribute('href', rssURL);
  await expect(menuRSS).toHaveCSS('color', rssColor);
  const bar = nav.locator('.footer-bar');
  const box = await bar.boundingBox();
  expect(box.y + box.height).toBeCloseTo(844 - 20, 0);

  await page.setViewportSize({ width: 320, height: 320 });
  await nav.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(await nav.evaluate(menu => menu.scrollTop > 0 && menu.scrollWidth === menu.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(footer.locator('.theme-toggle')).toBeVisible();
  await footer.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await toggle.click();
  await nav.locator('.lang-toggle[data-lang="ru"]').click();
  await expect(page).toHaveURL(/\/ru\/search-language\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', /^ru/);
});

test('closing mobile links leave the tab order before fading and return on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/browser-checks/');
  const toggle = page.locator('.mobile-menu-toggle');
  const nav = page.locator('#main-navigation');
  await toggle.focus();
  await page.keyboard.press('Space');
  await nav.evaluate(async element => {
    await Promise.all(element.getAnimations().map(animation => animation.finished));
    // Keep the closing fade observable even on slower CI workers.
    element.style.transitionDuration = '2s';
  });
  await nav.locator('a').first().focus();
  await expect(nav.locator('a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toHaveCSS('visibility', 'visible');
  await nav.locator('a').first().focus();
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await nav.evaluate(element => element.contains(document.activeElement))).toBe(false);

  await nav.evaluate(element => element.style.removeProperty('transition-duration'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(nav).toHaveJSProperty('inert', false);
  await nav.locator('a').first().focus();
  await expect(nav.locator('a').first()).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toBeHidden();
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
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.mobile-menu-toggle')).toBeHidden();
    await expect(page.locator('#main-navigation')).toBeVisible();
    await page.locator('#main-navigation').getByRole('link', { name: 'Articles', exact: true }).click();
    await expectSelected(page, 'Articles');
  } finally {
    await context.close();
  }
});
