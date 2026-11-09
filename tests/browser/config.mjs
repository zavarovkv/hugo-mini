export function browserConfig({ site = false } = {}) {
  const port = process.env.PLAYWRIGHT_PORT || 4174;
  return {
    testDir: './tests/browser',
    timeout: 30_000,
    expect: { timeout: 10_000 },
    workers: 2,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    reporter: 'list',
    use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure' },
    projects: [
      { name: 'chromium', use: { browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL } },
      { name: 'webkit', use: { browserName: 'webkit' } },
    ],
    webServer: {
      command: site ? 'node themes/hugo-mini/scripts/serve-browser-tests.mjs --site' : 'node scripts/serve-browser-tests.mjs',
      url: `http://127.0.0.1:${port}/browser-checks/`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  };
}
