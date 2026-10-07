#!/usr/bin/env node
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const repositoryPattern = /^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/;
const validCount = (value) => Number.isSafeInteger(value) && value >= 0;

// Run from the consuming site's root. Only public repository counts are saved;
// optional credentials stay in the build process and never reach the browser.
export async function fetchGitHubStars({
  root = process.cwd(), repos = [], fetchImpl = fetch,
  token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN, warn = console.warn,
} = {}) {
  if (!repos.length || repos.some((repo) => !repositoryPattern.test(repo))) {
    throw new Error("Pass one or more GitHub repositories as owner/repo.");
  }
  const output = join(root, "data/github_stars.json");
  let previous;
  try { previous = await readFile(output, "utf8"); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const counts = previous === undefined ? {} : JSON.parse(previous);
  if (!counts || Array.isArray(counts) || typeof counts !== "object" ||
      Object.values(counts).some((count) => !validCount(count))) {
    throw new Error("data/github_stars.json must map repositories to non-negative integer counts.");
  }
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "hugo-mini" };
  if (token) headers.Authorization = `Bearer ${token}`;
  let changed = false;
  for (const repo of new Set(repos)) {
    try {
      const response = await fetchImpl(`https://api.github.com/repos/${repo}`, {
        headers, signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const { stargazers_count: stars } = await response.json();
      if (!validCount(stars)) throw new Error("Invalid stargazers_count");
      if (counts[repo] !== stars) {
        counts[repo] = stars;
        changed = true;
      }
    } catch (error) {
      const fallback = Object.hasOwn(counts, repo) ? "keeping the previous count" : "omitting the counter";
      warn(`GitHub stars (${repo}): ${error.message}; ${fallback}.`);
    }
  }
  if (changed) {
    await mkdir(dirname(output), { recursive: true });
    const temporary = `${output}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(counts, null, 2) + "\n");
    await rename(temporary, output);
  }
  return counts;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const repos = process.argv.slice(2);
  let token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  // Reuse an existing local GitHub CLI session, if available. Capture the token
  // directly in memory; never print it, save it, or pass it on a command line.
  if (!token && !process.env.CI) {
    try {
      token = execFileSync("gh", ["auth", "token"], {
        encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 3000,
      }).trim();
    } catch { /* GitHub CLI is optional; public requests still work without it. */ }
  }
  const counts = await fetchGitHubStars({ repos, token });
  for (const repo of new Set(repos)) {
    if (Object.hasOwn(counts, repo)) console.log(`${repo}: ${counts[repo]} stars`);
  }
}
