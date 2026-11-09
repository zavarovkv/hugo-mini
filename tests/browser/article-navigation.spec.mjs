import { test, expect } from '@playwright/test';

test('Option/Alt arrows navigate chronologically and stop at both ends', async ({ page }) => {
  await page.goto('/blog/middle/');
  await page.keyboard.press('Alt+ArrowLeft');
  await expect(page).toHaveURL(/\/blog\/first\/$/);
  await page.waitForLoadState();
  await page.evaluate(() => document.addEventListener('keydown', event => { window.shortcutPrevented = event.defaultPrevented; }));
  await page.keyboard.press('Alt+ArrowLeft');
  expect(await page.evaluate(() => window.shortcutPrevented)).toBe(true);
  await expect(page).toHaveURL(/\/blog\/first\/$/);
  await page.waitForLoadState();
  await page.keyboard.press('Alt+ArrowRight');
  await expect(page).toHaveURL(/\/blog\/middle\/$/);
  await page.waitForLoadState();
  await page.keyboard.press('Alt+ArrowRight');
  await expect(page).toHaveURL(/\/blog\/last\/$/);
  await page.waitForLoadState();
  await page.evaluate(() => document.addEventListener('keydown', event => { window.shortcutPrevented = event.defaultPrevented; }));
  await page.keyboard.press('Alt+ArrowRight');
  expect(await page.evaluate(() => window.shortcutPrevented)).toBe(true);
  await expect(page).toHaveURL(/\/blog\/last\/$/);
  await page.waitForLoadState();
  await page.goBack();
  await expect(page).toHaveURL(/\/blog\/middle\/$/);
  await page.waitForLoadState();
  await page.keyboard.press('Alt+ArrowLeft');
  await expect(page).toHaveURL(/\/blog\/first\/$/);
  await page.waitForLoadState();
});

test('article shortcuts preserve text editing and ignore standalone pages', async ({ page }) => {
  await page.goto('/blog/middle/');
  await page.evaluate(() => {
    document.querySelector('article').insertAdjacentHTML('beforeend', '<input aria-label="Input" value="some words"><textarea aria-label="Text">some words</textarea><div contenteditable="true">some <span>words</span></div>');
    document.addEventListener('keydown', event => { window.shortcutPrevented = event.defaultPrevented; });
  });
  for (const selector of ['input', 'textarea', '[contenteditable]']) {
    await page.locator(selector).focus();
    await page.keyboard.press('Alt+ArrowLeft');
    expect(await page.evaluate(() => window.shortcutPrevented)).toBe(false);
    await expect(page).toHaveURL(/\/blog\/middle\/$/);
    await page.waitForLoadState();
  }
  await page.goto('/browser-checks/');
  expect(await page.evaluate(() => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, cancelable: true, bubbles: true });
    document.dispatchEvent(event);
    return event.defaultPrevented;
  })).toBe(false);
});
