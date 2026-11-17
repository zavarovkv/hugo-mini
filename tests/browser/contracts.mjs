export function layoutContracts(test, expect) {
  test.beforeEach(async ({ page, baseURL }) => {
    // Tests are deterministic and never send analytics or load remote widgets.
    await page.route('**/*', route => route.request().url().startsWith(baseURL) ? route.continue() : route.abort());
  });

  test('Goldmark notes inherit shared Beauty styling and keep every hanging number', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/browser-checks/');
    const notes = page.locator('.footnotes > ol > li');
    await expect(notes).toHaveCount(4);
    const markers = await notes.evaluateAll(nodes => nodes.map(node => {
      const marker = getComputedStyle(node, '::before');
      return { content: marker.content, position: marker.position, size: marker.fontSize };
    }));
    expect(markers.every(marker => marker.content.includes('list-item') && marker.position === 'absolute')).toBe(true);
    const ref = page.locator('.footnote-ref').first();
    await expect(ref).toHaveCSS('text-decoration-line', 'none');
    await expect(ref.locator('..')).toHaveCSS('vertical-align', 'baseline');
    await ref.focus();
    await expect(ref).toHaveCSS('outline-style', 'solid');
    await ref.click();
    await expect(page).toHaveURL(/#fn:1$/);
    await page.locator('.footnote-backref').first().click();
    await expect(page).toHaveURL(/#fnref:1$/);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.footnotes')).toBeVisible();
  });

  test('desktop reading columns retain their position when classic scrollbars appear', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/browser-checks/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('html')).toHaveCSS('scrollbar-gutter', 'stable');
    const boxes = await page.evaluate(() => {
      const root = document.documentElement;
      const measure = overflow => {
        root.style.overflowY = overflow;
        const { x, width } = document.querySelector('main').getBoundingClientRect();
        return { x, width };
      };
      const visible = measure('scroll');
      const hidden = measure('hidden');
      root.style.removeProperty('overflow-y');
      return { visible, hidden };
    });
    expect(boxes.hidden.x).toBeCloseTo(boxes.visible.x, 1);
    expect(boxes.hidden.width).toBeCloseTo(boxes.visible.width, 1);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('html')).toHaveCSS('scrollbar-gutter', 'auto');
  });

  for (const scheme of ['light', 'dark']) {
    test(`action text and copy feedback remain readable (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: {
          writeText: async text => { window.copiedCode = text; },
        } });
      });
      await page.goto('/browser-checks/');
      const copy = page.locator('.copy-btn').first();
      await copy.focus();
      const contrasts = () => page.evaluate(() => {
        const context = document.createElement('canvas').getContext('2d');
        function rgba(value) {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = value;
          context.fillRect(0, 0, 1, 1);
          return [...context.getImageData(0, 0, 1, 1).data].map((n, i) => i === 3 ? n / 255 : n);
        }
        const over = (fg, bg) => fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
        function luminance(rgb) {
          return rgb.slice(0, 3).reduce((sum, v, i) => {
            v /= 255;
            return sum + (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][i];
          }, 0);
        }
        function ratio(a, b) {
          const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
          return (high + 0.05) / (low + 0.05);
        }
        const action = getComputedStyle(document.querySelector('a.button'));
        const stops = action.backgroundImage.match(/(?:rgba?|color)\([^)]*\)/g).map(rgba);
        const gradient = Array.from({ length: 21 }, (_, i) => stops[0].map((v, n) => v + (stops[1][n] - v) * i / 20));
        const button = document.querySelector('.copy-btn');
        const style = getComputedStyle(button);
        // Plain code can be transparent; composite its ancestors before the
        // control fill so the check measures the page, not an implicit black.
        const surfaces = [];
        for (let node = button.parentElement; node; node = node.parentElement) {
          surfaces.push(rgba(getComputedStyle(node).backgroundColor));
        }
        const backdrop = surfaces.reverse().reduce((background, color) => over(color, background), [255, 255, 255]);
        const block = over(rgba(getComputedStyle(button.parentElement.querySelector('pre')).backgroundColor), backdrop);
        const fill = over(rgba(style.backgroundColor), block);
        return {
          action: Math.min(...gradient.map(color => ratio(rgba(action.color), color))),
          copy: ratio(over(rgba(style.color), fill), fill),
        };
      });
      expect((await contrasts()).action).toBeGreaterThanOrEqual(4.5);
      expect((await contrasts()).copy).toBeGreaterThanOrEqual(3);
      await copy.hover();
      expect((await contrasts()).copy).toBeGreaterThanOrEqual(3);
      await copy.click();
      await expect(copy).toHaveClass(/copied/);
      // The fixture source stays identical with and without line numbers.
      expect(await page.evaluate(() => window.copiedCode)).toBe('source()');
      expect((await contrasts()).copy).toBeGreaterThanOrEqual(3);
    });

    test(`wide tables scroll locally and fit paper (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/browser-checks/');
      await page.evaluate(() => document.fonts.ready);
      const region = page.locator('.markdown-table-scroll');
      await expect(region).toHaveAttribute('role', 'region');
      await expect(region).toHaveAttribute('aria-label', /.+/);
      expect(await region.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await region.focus();
      await expect(region).toBeFocused();
      await page.keyboard.press('ArrowRight', { delay: 120 });
      await expect.poll(() => region.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
      await expect(page.locator('th').first()).toHaveAttribute('scope', 'col');
      await expect(page.locator('td time').first()).toHaveAttribute('datetime', '2026-11-01');

      // At A4 content width every cell must remain inside the table, including
      // long code and dates; the table retains its native CSS display role.
      await page.setViewportSize({ width: 650, height: 900 });
      await page.emulateMedia({ media: 'print' });
      const geometry = await region.evaluate(node => {
        const table = node.querySelector('table');
        const rect = table.getBoundingClientRect();
        return { display: getComputedStyle(table).display, tableWidth: rect.width, containerWidth: node.clientWidth,
          overflow: [...table.querySelectorAll('th, td')].some(cell => cell.scrollWidth > cell.clientWidth + 1),
          alignment: getComputedStyle(table.querySelectorAll('th')[1]).textAlign };
      });
      expect(geometry.display).toBe('table');
      expect(geometry.tableWidth).toBeLessThanOrEqual(geometry.containerWidth + 1);
      expect(geometry.overflow).toBe(false);
      expect(geometry.alignment).toBe('right');
    });

    test(`offscreen diagrams are ready for synchronous print (${scheme})`, async ({ page, browserName }, testInfo) => {
      const failures = [];
      page.on('pageerror', error => failures.push(error.message));
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/browser-checks/');
      const diagrams = page.locator('main .mermaid');
      expect(await diagrams.nth(1).evaluate(node => node.getBoundingClientRect().top > innerHeight)).toBe(true);
      await expect(page.locator('main .mermaid > svg')).toHaveCount(2);
      await expect(page.locator('.mermaid-render-stage')).toHaveCount(0);
      const screen = await diagrams.evaluateAll(nodes => nodes.map(node => node.innerHTML));
      const printed = await page.evaluate(() => {
        dispatchEvent(new Event('beforeprint'));
        return [...document.querySelectorAll('main .mermaid')].map(node => ({ html: node.innerHTML, svg: Boolean(node.querySelector('svg')), visibility: node.style.visibility }));
      });
      expect(printed.every(node => node.svg && node.visibility === 'visible')).toBe(true);
      if (scheme === 'dark') expect(printed.map(node => node.html)).not.toEqual(screen);
      await page.emulateMedia({ media: 'print' });
      for (const diagram of await diagrams.all()) await expect(diagram).toBeVisible();
      if (browserName === 'chromium') {
        const pdf = await page.pdf({ format: 'A4' });
        expect(pdf.length).toBeGreaterThan(5000);
        await testInfo.attach('print.pdf', { body: pdf, contentType: 'application/pdf' });
      }
      await page.emulateMedia({ media: 'screen' });
      await page.evaluate(() => dispatchEvent(new Event('afterprint')));
      await expect.poll(() => diagrams.evaluateAll(nodes => nodes.map(node => node.innerHTML))).toEqual(screen);
      expect(failures).toEqual([]);
    });
  }

  test('printing during a delayed download shows source immediately and recovers afterwards', async ({ page }) => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/browser-mermaid/mermaid.esm.min.mjs*', async route => { await gate; await route.continue(); });
    await page.goto('/browser-checks/', { waitUntil: 'domcontentloaded' });
    await page.emulateMedia({ media: 'print' });
    const sources = await page.evaluate(() => {
      dispatchEvent(new Event('beforeprint'));
      return [...document.querySelectorAll('main .mermaid')].map(node => ({ text: node.textContent, visible: getComputedStyle(node).visibility }));
    });
    expect(sources.every(node => node.visible === 'visible')).toBe(true);
    expect(sources[0].text).toContain('flowchart LR');
    expect(sources[1].text).toContain('sequenceDiagram');
    release();
    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => dispatchEvent(new Event('afterprint')));
    await expect(page.locator('main .mermaid > svg')).toHaveCount(2);
  });

  test('a missing diagram chunk leaves both sources readable in screen and print', async ({ page }) => {
    await page.route('**/browser-mermaid/chunks/**', route => route.abort());
    await page.goto('/browser-checks/');
    const diagrams = page.locator('main .mermaid');
    for (const diagram of await diagrams.all()) await expect(diagram).toBeVisible();
    await expect(diagrams.nth(1)).toContainText('sequenceDiagram');
    await page.emulateMedia({ media: 'print' });
    for (const diagram of await diagrams.all()) await expect(diagram).toBeVisible();
  });

  test('rapid theme changes preserve complete diagrams and their print copies', async ({ page }) => {
    await page.goto('/browser-checks/');
    await expect(page.locator('main .mermaid > svg')).toHaveCount(2);
    for (const theme of ['dark', 'light', 'dark']) {
      await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
    }
    await expect(page.locator('.mermaid-render-stage')).toHaveCount(0);
    await expect(page.locator('main .mermaid > svg')).toHaveCount(2);
    const count = await page.evaluate(() => {
      dispatchEvent(new Event('beforeprint'));
      return document.querySelectorAll('main .mermaid > svg').length;
    });
    expect(count).toBe(2);
  });
}
