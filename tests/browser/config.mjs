export function browserConfig({ site = false, publishedSite = false } = {}) {
  const port = process.env.PLAYWRIGHT_PORT || 4174;
  const baseURL = `http://127.0.0.1:${port}`;
  const server = 'scripts/serve-browser-tests.mjs';
  return {
    testDir: './tests/browser',
    timeout: 30_000,
    expect: { timeout: 10_000 },
    workers: 2,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    reporter: 'list',
    use: { baseURL, trace: 'retain-on-failure' },
    projects: [
      { name: 'chromium', use: { browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL } },
      { name: 'webkit', use: { browserName: 'webkit' } },
    ],
    webServer: {
      command: site || publishedSite
        ? `node themes/hugo-mini/${server} ${publishedSite ? '--published-site' : '--site'}`
        : `node ${server}`,
      url: publishedSite ? baseURL : `${baseURL}/browser-checks/`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  };
}
