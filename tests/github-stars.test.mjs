import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink, stat, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { fetchGitHubStars } from "../scripts/fetch-github-stars.mjs";

const themeRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "github-stars-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test("GitHub counts use stargazers_count, include zero, and do not save credentials or rewrite unchanged data", async (t) => {
  const root = await fixture(t);
  let calls = 0;
  const fetchImpl = async (url, { headers, signal }) => {
    calls++;
    assert.equal(url, "https://api.github.com/repos/example/project");
    assert.equal(headers.Authorization, "Bearer fixture-token");
    assert.ok(signal instanceof AbortSignal);
    return { ok: true, json: async () => ({ stargazers_count: 0, subscribers_count: 99 }) };
  };
  const options = { root, repos: ["example/project", "example/project"], fetchImpl, token: "fixture-token" };
  assert.deepEqual(await fetchGitHubStars(options), { "example/project": 0 });
  assert.equal(calls, 1);
  const path = join(root, "data/github_stars.json");
  assert.deepEqual(JSON.parse(await readFile(path, "utf8")), { "example/project": 0 });
  const before = (await stat(path)).mtimeMs;
  await fetchGitHubStars(options);
  assert.equal((await stat(path)).mtimeMs, before);
});

test("API outages, rate limits, and invalid counts preserve the last snapshot without creating unknown zeros", async (t) => {
  const root = await fixture(t);
  const path = join(root, "data/github_stars.json");
  await mkdir(dirname(path));
  const previous = '{"example/project": 24}\n';
  await writeFile(path, previous);
  const warnings = [];
  const failures = [
    async () => { throw new TypeError("fetch failed"); },
    async () => ({ ok: false, status: 403 }),
    async () => ({ ok: false, status: 503 }),
    ...[-1, 1.5, "12", undefined].map((value) => async () => ({ ok: true, json: async () => ({ stargazers_count: value }) })),
  ];
  for (const fetchImpl of failures) {
    const counts = await fetchGitHubStars({ root, repos: ["example/project", "example/unknown"], fetchImpl, warn: (message) => warnings.push(message) });
    assert.deepEqual(counts, { "example/project": 24 });
    assert.equal(await readFile(path, "utf8"), previous);
  }
  assert.equal(warnings.length, failures.length * 2);
  const emptyRoot = await fixture(t);
  await fetchGitHubStars({ root: emptyRoot, repos: ["example/unknown"], fetchImpl: failures[0], warn: () => {} });
  await assert.rejects(access(join(emptyRoot, "data/github_stars.json")), { code: "ENOENT" });
  await assert.rejects(fetchGitHubStars({ root, repos: ["../invalid"] }), /owner\/repo/);
  await writeFile(path, '{"example/project": -1}');
  await assert.rejects(fetchGitHubStars({ root, repos: ["example/project"] }), /non-negative integer/);
});

test("the shortcode renders localized counts, zero, and a plain link when data is unavailable", async (t) => {
  const root = await fixture(t);
  for (const dir of ["themes", "data", "content/en", "content/ru"]) await mkdir(join(root, dir), { recursive: true });
  await symlink(themeRoot, join(root, "themes/hugo-mini"), "dir");
  await writeFile(join(root, "hugo.toml"), `baseURL = "https://example.org/"
title = "Fixture"
theme = "hugo-mini"
defaultContentLanguage = "en"
disableKinds = ["taxonomy", "term"]
[languages.en]
contentDir = "content/en"
weight = 1
[languages.ru]
contentDir = "content/ru"
weight = 2
`);
  await writeFile(join(root, "data/github_stars.json"), JSON.stringify({ "example/zero": 0, "example/one": 1, "example/many": 24 }));
  const body = '+++\n+++\n\n' + ["zero", "one", "many", "unknown"].map((repo) => `{{< github-stars repo="example/${repo}" >}}.`).join("\n\n");
  for (const lang of ["en", "ru"]) await writeFile(join(root, `content/${lang}/_index.md`), body);
  execFileSync(process.env.HUGO_BIN || "hugo", ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
  for (const [prefix, labels] of [["", ["0 stars on GitHub", "1 star on GitHub", "24 stars on GitHub"]], ["ru/", ["0 звезд на GitHub", "1 звезда на GitHub", "24 звезды на GitHub"]]]) {
    const html = await readFile(join(root, `public/${prefix}index.html`), "utf8");
    for (const label of labels) assert.ok(html.includes(label), label);
    const unknownLink = html.match(/<a\b[^>]*href=(?:"https:\/\/github.com\/example\/unknown"|https:\/\/github.com\/example\/unknown)[^>]*>[\s\S]*?<\/a>/)?.[0];
    assert.ok(unknownLink?.includes("GitHub"));
    assert.ok(!unknownLink.includes("github-stars"));
    assert.equal((html.match(/<svg viewBox="0 0 16 16"/g) || []).length, 3);
    assert.equal((html.match(/<\/a>\./g) || []).length, 4, "inline shortcodes must not add spaces before punctuation");
  }
});
