export function editorialContracts({test, expect}) {
test('opt-in drop caps use the title face without changing copy, adjacent prose or print', async ({page}) => {
  await page.goto('/dropcap-checks/');
  const standard = await page.evaluate(() => CSS.supports('initial-letter:3'));
  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({colorScheme});
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({width, height:900});
      await page.goto('/dropcap-checks/');
      await page.evaluate(() => document.fonts.ready);
      const article = page.locator('article.beauty-dropcap');
      await expect(article).toHaveCount(1);
      const first = article.locator(':scope > p').first();
      const original = await first.textContent();
      const result = await first.evaluate(p => {
        const cap = getComputedStyle(p, '::first-letter');
        const body = getComputedStyle(p);
        const title = getComputedStyle(document.querySelector('h1'));
        const range = document.createRange();
        range.selectNodeContents(p);
        getSelection().removeAllRanges(); getSelection().addRange(range);
        return {
          lines:cap.getPropertyValue('initial-letter') || cap.getPropertyValue('-webkit-initial-letter'),
          titleFace:cap.fontFamily === title.fontFamily && cap.fontWeight === title.fontWeight,
          bodyColor:cap.color === body.color,
          copy:getSelection().toString(),
          overflow:document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(result).toEqual({lines:standard ? '2.25 3' : '2.25 2', titleFace:true, bodyColor:true, copy:original, overflow:false});
      const wrapping = await first.evaluate(p => {
        const text = p.firstChild;
        const range = document.createRange();
        const lines = [];
        // Skip the initial itself; inspect actual text positions, not CSS values.
        for (let i = 1; i < text.length; i++) {
          if (/\s/.test(text.textContent[i])) continue;
          range.setStart(text, i); range.setEnd(text, i + 1);
          const rect = range.getBoundingClientRect();
          if (!lines.some(line => Math.abs(line.top - rect.top) < 1)) {
            lines.push({left:rect.left, top:rect.top});
          }
          if (lines.length === 3) break;
        }
        return {left:p.getBoundingClientRect().left, lines};
      });
      expect(wrapping.lines).toHaveLength(3);
      expect(wrapping.lines[0].left).toBeGreaterThan(wrapping.left + 10);
      expect(wrapping.lines[1].left).toBeGreaterThan(wrapping.left + 10);
      expect(wrapping.lines[2].left).toBeCloseTo(wrapping.left, 0);
      // A fractional rise must never push the prose down by a full line.
      // Standard top alignment leaves prose in place; WebKit reserves the rise.
      const plainTop = await first.evaluate(p => {
        p.style.setProperty('--beauty-dropcap-rise', '0');
        const range = document.createRange();
        range.setStart(p.firstChild, 1); range.setEnd(p.firstChild, 2);
        const top = range.getBoundingClientRect().top;
        p.style.removeProperty('--beauty-dropcap-rise');
        return top;
      });
      const leading = await first.evaluate(p => parseFloat(getComputedStyle(p).lineHeight));
      expect(wrapping.lines[0].top - plainTop).toBeGreaterThanOrEqual(-1);
      expect(wrapping.lines[0].top - plainTop).toBeLessThanOrEqual(leading * 0.25 + 1);
      const next = article.locator(':scope > p').nth(1);
      const ordinaryWeight = await next.evaluate(p => getComputedStyle(p).fontWeight);
      expect(await next.evaluate(p => getComputedStyle(p, '::first-letter').fontWeight)).toBe(ordinaryWeight);
      const firstBox = await first.boundingBox();
      const nextBox = await next.boundingBox();
      expect(nextBox.y).toBeGreaterThanOrEqual(firstBox.y + firstBox.height);
      await page.emulateMedia({media:'print'});
      expect(await first.evaluate(p => {
        const s = getComputedStyle(p, '::first-letter');
        return s.getPropertyValue('initial-letter') || s.getPropertyValue('-webkit-initial-letter');
      })).toBe('normal');
      await page.emulateMedia({media:'screen'});
    }
  }
  await page.goto('/editorial-checks/');
  await expect(page.locator('article.beauty-dropcap')).toHaveCount(0);
  await page.goto('/dropcap-word-checks/');
  await page.evaluate(() => document.fonts.ready);
  const opening = page.locator('article > p').first();
  const text = await opening.textContent();
  expect(text).toMatch(/^I\u00a0write/);
  expect(await opening.evaluate(p => {
    const range = document.createRange(); range.selectNodeContents(p);
    getSelection().removeAllRanges(); getSelection().addRange(range);
    return getSelection().toString();
  })).toBe(text);
});

for (const colorScheme of ['light','dark']) test(`editorial helpers preserve copy, margins and number roles (${colorScheme})`, async ({page}) => {
  await page.emulateMedia({colorScheme});
  for (const width of [320,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/editorial-checks/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.beauty-hanging-open')).toHaveCount(4);
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
    const prose = page.locator('#quoted-prose');
    expect(await prose.evaluate(p => {
      const quote = p.querySelector('.beauty-hanging-open');
      const glyph = document.createRange(); glyph.selectNodeContents(quote);
      const letter = document.createRange(); letter.setStart(quote.nextSibling, 0); letter.setEnd(quote.nextSibling, 1);
      const edge = p.getBoundingClientRect().left;
      return glyph.getBoundingClientRect().left >= 0 && glyph.getBoundingClientRect().left < edge &&
        Math.abs(letter.getBoundingClientRect().left - edge) < 1;
    })).toBe(true);
    expect(await prose.evaluate(p => {
      const range = document.createRange(); range.selectNodeContents(p);
      getSelection().removeAllRanges(); getSelection().addRange(range);
      return getSelection().toString();
    })).toBe(await prose.textContent());
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
    const scrollControl = await heading.locator('.heading-scroll').count() > 0;
    const anchor = heading.locator(scrollControl ? '.heading-scroll' : '.heading-anchor');
    if (width <= 768 && !scrollControl) {
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
      const svg = h.querySelector('.heading-anchor svg');
      const icon = svg ? svg.getBoundingClientRect() : null;
      const link = h.querySelector('.heading-scroll, .heading-anchor').getBoundingClientRect();
      return {
        clear: !icon || icon.right <= quote.left || icon.left >= quote.right,
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
