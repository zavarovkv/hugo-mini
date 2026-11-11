export function articleLinkContracts({test, expect}) {
  test('new tabs apply to article destinations, keeping anchors and site navigation native', async ({page}) => {
    await page.goto('/article-link-checks/');
    const article = page.locator('article[data-article-links-new-tab]');
    await expect(article).toHaveCount(1);
    for (const name of ['Internal page','External page','Authored HTML link']) {
      const link = article.getByRole('link',{name,exact:true});
      await expect(link).toHaveAttribute('target','_blank');
      await expect(link).toHaveAttribute('rel',/noopener/);
      await expect(link).toHaveAttribute('rel',/noreferrer/);
    }
    await expect(page.locator('#raw-link')).toHaveAttribute('rel',/nofollow/);
    for (const name of ['Local anchor','Same page anchor','Email','Download']) {
      await expect(article.getByRole('link',{name,exact:true})).not.toHaveAttribute('target','_blank');
    }
    await expect(article.locator('.footnote-ref')).not.toHaveAttribute('target','_blank');
    await expect(article.locator('.footnote-backref')).not.toHaveAttribute('target','_blank');
    await expect(article.locator('.heading-anchor')).not.toHaveAttribute('target','_blank');
    for (const link of await page.locator('header a[href="/blog/"]').all()) {
      await expect(link).not.toHaveAttribute('target','_blank');
    }
    const original = page.url();
    const popupPromise = page.waitForEvent('popup');
    await article.getByRole('link',{name:'Internal page',exact:true}).click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    expect(new URL(popup.url()).pathname).toBe('/blog/');
    expect(page.url()).toBe(original);
    await popup.close();
    await page.goto('/page-link-checks/');
    await expect(page.locator('article')).not.toHaveAttribute('data-article-links-new-tab');
    await expect(page.getByRole('link',{name:'Standalone internal link'})).not.toHaveAttribute('target','_blank');
  });

  test('Markdown article links receive new-tab attributes without JavaScript', async ({browser,baseURL}) => {
    const context = await browser.newContext({javaScriptEnabled:false});
    const page = await context.newPage();
    await page.goto(baseURL + '/article-link-checks/');
    await expect(page.getByRole('link',{name:'Internal page',exact:true})).toHaveAttribute('target','_blank');
    await expect(page.getByRole('link',{name:'Same page anchor',exact:true})).not.toHaveAttribute('target','_blank');
    await context.close();
  });
}
