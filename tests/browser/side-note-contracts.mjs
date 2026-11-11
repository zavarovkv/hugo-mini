export function sideNoteContracts({test, expect}) {
  for (const colorScheme of ['light', 'dark']) test(`side notes preserve links, avoid collisions and return below on narrow screens (${colorScheme})`, async ({page}) => {
    await page.emulateMedia({colorScheme});
    await page.setViewportSize({width:1440, height:900});
    await page.goto('/side-note-checks/');
    await page.evaluate(() => document.fonts.ready);
    const article = page.locator('article[data-side-notes]');
    const notes = page.locator('.footnotes > ol > li');
    await expect(article).toHaveClass(/has-side-notes/);
    await expect(notes).toHaveCount(3);
    const copy = await notes.allTextContents();
    await expect(page.locator('.side-notes-heading')).toBeHidden();
    await expect(page.locator('#recent-sidebar')).toHaveCount(0);
    const geometry = await article.evaluate(article => {
      const box = article.getBoundingClientRect();
      const image = article.querySelector('.article-image-wide').getBoundingClientRect();
      return {left:box.left, right:box.right, bottom:box.bottom, image:image.toJSON(),
        notes:[...article.querySelectorAll('.footnotes > ol > li')].map(n => n.getBoundingClientRect().toJSON()),
        overflow:document.documentElement.scrollWidth > innerWidth};
    });
    expect(geometry.overflow).toBe(false);
    for (const [i, note] of geometry.notes.entries()) {
      expect(note.left).toBeGreaterThan(geometry.right);
      expect(note.width).toBeGreaterThanOrEqual(220);
      expect(note.width).toBeLessThanOrEqual(260);
      if (i) expect(note.top).toBeGreaterThanOrEqual(geometry.notes[i-1].bottom + 23);
      const image = geometry.image;
      expect(note.left < image.right && note.right > image.left && note.top < image.bottom && note.bottom > image.top).toBe(false);
      expect(note.bottom).toBeLessThanOrEqual(geometry.bottom + 1);
    }
    const firstRef = page.locator('.footnote-ref').first();
    const target = await firstRef.getAttribute('href');
    const returnTarget = '#' + await firstRef.evaluate(ref => ref.closest('[id]').id);
    await firstRef.click();
    expect(new URL(page.url()).hash).toBe(target);
    await expect(notes.first().locator('.footnote-backref').first()).toBeHidden();
    for (const width of [1100,390,320]) {
      await page.setViewportSize({width,height:900});
      await expect(article).not.toHaveClass(/has-side-notes/);
      await expect(page.locator('.side-notes-heading')).toBeVisible();
      expect(await notes.allTextContents()).toEqual(copy);
      for (const note of await notes.all()) await expect(note).toHaveCSS('position','relative');
      await notes.first().locator('.footnote-backref').first().click();
      expect(new URL(page.url()).hash).toBe(returnTarget);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.setViewportSize({width:1440,height:900});
    await expect(article).toHaveClass(/has-side-notes/);
    await page.emulateMedia({media:'print'});
    await expect(page.locator('.side-notes-heading')).toBeVisible();
    for (const note of await notes.all()) await expect(note).toHaveCSS('position','relative');
    await page.emulateMedia({media:'screen'});
    await expect(article).toHaveClass(/has-side-notes/);
  });

  test('a direct note link settles after fonts load', async ({page}) => {
    await page.setViewportSize({width:1440,height:900});
    await page.route(/\.(?:woff2?|otf)(?:\?.*)?$/, async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    await page.goto('/side-note-checks/#fn%3A3', {waitUntil:'domcontentloaded'});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('load');
    await expect(page.locator('article')).toHaveClass(/has-side-notes/);
    await expect(page.locator('[id="fn:3"]')).toBeInViewport();
    await expect.poll(() => page.locator('[id="fn:3"]').evaluate(note => {
      const top = note.getBoundingClientRect().top;
      return top >= -1 && top < innerHeight;
    })).toBe(true);
  });

  test('side notes remain ordinary endnotes without JavaScript', async ({browser,baseURL}) => {
    const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});
    const page = await context.newPage();
    await page.goto(baseURL + '/side-note-checks/');
    await expect(page.locator('article')).not.toHaveClass(/has-side-notes/);
    await expect(page.locator('.footnotes > ol > li')).toHaveCount(3);
    await expect(page.locator('h2')).toHaveText('Notes');
    await context.close();
  });
}
