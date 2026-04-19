#!/usr/bin/env node
/*
 * Fetches reaction counts and view counts for each blog post's linked
 * Telegram channel post, and writes them to data/telegram_reactions.json
 * which Hugo consumes at build time (site.Data.telegram_reactions) to
 * render a small reactions block under each single post.
 *
 * This script lives in the theme so that the full "surface reactions
 * from a Telegram channel" feature — the data pipeline AND the Hugo
 * partials that render it — is one self-contained unit. Sites using
 * hugo-mini invoke it from their own package.json:
 *
 *   "scripts": {
 *     "fetch-telegram-reactions":
 *       "node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs"
 *   }
 *
 * Usage:
 *   node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs [options]
 *
 * Options (all optional — sensible defaults from Hugo config):
 *   --channel NAME       Telegram channel username without @.
 *                          Default: params.telegramChannel from hugo config.
 *                          Env fallback: TELEGRAM_CHANNEL.
 *   --content-dir PATH   Directory to scan for posts with telegram_post
 *                          front matter. Default: <contentDir from hugo
 *                          config>/blog for the default language.
 *   --output PATH        Where to write the JSON data file.
 *                          Default: data/telegram_reactions.json
 *                          (relative to cwd = site root when invoked
 *                          via npm script).
 *
 * Requires Hugo Extended on PATH (the default resolution calls
 * `hugo config --format json`). If Hugo is unavailable, pass all three
 * options explicitly.
 *
 * Output shape (one entry per telegram_post):
 *   {
 *     "58": {
 *       "views": "857",
 *       "reactions": [
 *         { "emoji": "⭐", "count": 11 },
 *         { "emoji": "❤", "count": 7 }
 *       ]
 *     }
 *   }
 *
 * No caching, no retries. Always overwrites the output file. Failed
 * fetches are logged but do not abort the run — the Hugo partials
 * handle missing data gracefully.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { parseArgs } from "node:util";

const USER_AGENT = "Mozilla/5.0 (compatible; hugo-mini-telegram-reactions/1.0)";
const DEFAULT_OUTPUT = "data/telegram_reactions.json";
const DEFAULT_POSTS_SUBDIR = "blog";
const FETCH_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      channel: { type: "string" },
      "content-dir": { type: "string" },
      output: { type: "string" },
    },
    strict: true,
  });
  return values;
}

/** Run `hugo config --format json` and return the parsed object, or
 *  null if Hugo is unavailable or fails. Hugo lowercases all config
 *  keys in this dump, so callers should use lowercase property names. */
function readHugoConfig() {
  try {
    const json = execSync("hugo config --format json", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Resolve effective channel / content dir / output, merging CLI args,
 *  env vars, and Hugo config. CLI wins over env wins over Hugo config. */
function resolveConfig(cli, hugoConfig) {
  // Channel
  let channel = cli.channel || process.env.TELEGRAM_CHANNEL;
  if (!channel && hugoConfig) {
    channel = hugoConfig.params && hugoConfig.params.telegramchannel;
  }

  // Content dir
  let contentDir = cli["content-dir"];
  if (!contentDir && hugoConfig && hugoConfig.contentdir) {
    // Hugo's top-level `contentdir` is already resolved to the default
    // language's content directory (e.g. "content/ru").
    contentDir = path.join(hugoConfig.contentdir, DEFAULT_POSTS_SUBDIR);
  }
  if (!contentDir) {
    contentDir = path.join("content", DEFAULT_POSTS_SUBDIR);
  }

  // Output
  const output = cli.output || DEFAULT_OUTPUT;

  return { channel, contentDir, output };
}

async function collectPostIds(contentDir) {
  let files;
  try {
    files = await fs.readdir(contentDir);
  } catch (e) {
    throw new Error(`cannot read ${contentDir}: ${e.message}`);
  }
  const ids = [];
  for (const f of files) {
    if (!f.endsWith(".md") || f.startsWith("_")) continue;
    const text = await fs.readFile(path.join(contentDir, f), "utf8");
    const m = text.match(/^telegram_post\s*=\s*(\d+)/m);
    if (m) ids.push({ file: f, id: parseInt(m[1], 10) });
  }
  return ids;
}

/**
 * Parse the reactions block out of a Telegram public embed HTML page.
 * Structure (as of April 2026):
 *   <div class="... js-message_reactions">
 *     <span class="tgme_reaction tgme_reaction_paid">
 *       <i class="icon icon-telegram-stars"></i>11
 *     </span>
 *     <span class="tgme_reaction">
 *       <i class="emoji" style="..."><b>❤</b></i>7
 *     </span>
 *     <span class="tgme_reaction">
 *       <tg-emoji emoji-id="..."></tg-emoji>5   ← custom premium emoji, skipped
 *     </span>
 *   </div>
 */
function parseReactions(html) {
  const block = html.match(
    /tgme_widget_message_reactions[^>]*>([\s\S]*?)<\/div>\s*<div\s+class="tgme_widget_message_footer/
  );
  if (!block) return [];

  const inner = block[1];
  const reactions = [];
  const spanRe = /<span class="tgme_reaction([^"]*)">([\s\S]*?)<\/span>/g;

  let m;
  while ((m = spanRe.exec(inner)) !== null) {
    const classExtra = m[1];
    const body = m[2];
    const isPaid = classExtra.includes("tgme_reaction_paid");

    let emoji;
    if (isPaid) {
      emoji = "⭐";
    } else {
      const emojiMatch = body.match(/<b>([^<]+)<\/b>/);
      if (emojiMatch) {
        emoji = emojiMatch[1].trim();
      } else {
        // <tg-emoji emoji-id="..."></tg-emoji> — custom premium emoji,
        // no text fallback, skip
        continue;
      }
    }

    // Count is whatever digits sit at the end of the span body after
    // stripping tags.
    const plain = body.replace(/<[^>]+>/g, "").trim();
    const countMatch = plain.match(/(\d+)\s*$/);
    if (!countMatch) continue;
    const count = parseInt(countMatch[1], 10);
    if (!Number.isFinite(count)) continue;

    reactions.push({ emoji, count });
  }
  return reactions;
}

/** View count as a string (preserves Telegram formatting like "1.2K"). */
function parseViews(html) {
  const m = html.match(/tgme_widget_message_views">([^<]+)<\/span>/);
  return m ? m[1].trim() : null;
}

async function fetchOne(channel, id) {
  const url = `https://t.me/${channel}/${id}?embed=1&mode=tme`;

  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: controller.signal,
      });

      // Telegram returns 429 with a Retry-After header on rate limit.
      // 5xx are transient — also worth retrying.
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = parseInt(res.headers.get("retry-after") || "", 10);
        const delay = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : Math.min(1000 * 2 ** (attempt - 1), 8000);
        lastErr = new Error(`HTTP ${res.status}`);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw lastErr;
      }

      if (!res.ok) {
        // Other 4xx (403, 404, …) are permanent — no point retrying.
        throw Object.assign(new Error(`HTTP ${res.status}`), { permanent: true });
      }
      const html = await res.text();
      const views = parseViews(html);
      const reactions = parseReactions(html);
      // If the page clearly is a Telegram widget but parsers came back empty,
      // the embed HTML probably changed shape and the regex needs updating.
      if (views === null && reactions.length === 0 && /tgme_widget_message/.test(html)) {
        console.warn(`  ! ${channel}/${id}: widget found but parse returned empty — Telegram HTML may have changed`);
      }
      return { views, reactions };
    } catch (err) {
      lastErr = err;
      if (err && err.permanent) throw err;
      // Network errors, aborts, etc. — retry with backoff.
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw lastErr;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr ?? new Error(`fetchOne(${channel}/${id}) exited without result`);
}

async function main() {
  const cli = parseCliArgs();
  const hugoConfig = readHugoConfig();
  const { channel, contentDir, output } = resolveConfig(cli, hugoConfig);

  if (!channel) {
    console.error("Missing Telegram channel. Resolve it via one of:");
    console.error("  - params.telegramChannel in your Hugo config");
    console.error("  - TELEGRAM_CHANNEL env var");
    console.error("  - --channel CLI flag");
    process.exit(1);
  }

  console.log(`Channel:     @${channel}`);
  console.log(`Content dir: ${contentDir}`);
  console.log(`Output:      ${output}`);
  console.log("");

  const posts = await collectPostIds(contentDir);
  if (posts.length === 0) {
    console.log(`No posts with telegram_post in ${contentDir} — nothing to fetch.`);
    return;
  }

  console.log(`Fetching reactions for ${posts.length} posts…`);

  const results = {};
  let ok = 0;
  let failed = 0;
  for (const p of posts) {
    try {
      const data = await fetchOne(channel, p.id);
      results[p.id] = data;
      const summary =
        data.reactions.length > 0
          ? data.reactions.map((r) => `${r.emoji}${r.count}`).join(" ")
          : "(no reactions)";
      console.log(
        `  ✓ ${p.file.padEnd(24)} msg ${String(p.id).padEnd(4)} views ${String(
          data.views || "?"
        ).padEnd(6)} ${summary}`
      );
      ok++;
    } catch (e) {
      console.warn(`  ✗ ${p.file} (msg ${p.id}): ${e.message}`);
      failed++;
    }
  }

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify(results, null, 2) + "\n", "utf8");
  console.log(
    `\nWrote ${output} (${ok} ok, ${failed} failed, ${Object.keys(results).length} entries)`
  );
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
