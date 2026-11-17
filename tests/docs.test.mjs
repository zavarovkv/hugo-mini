import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const documents = [
  "README.md", "README.ru.md", "CONTRIBUTING.md", "CHANGELOG.md", "starter/README.md",
  ...readdirSync(join(root, "docs")).filter((name) => name.endsWith(".md")).map((name) => `docs/${name}`),
];

// Ignore examples: their placeholder links and headings are not part of the guide.
function prose(markdown) {
  let fence;
  return markdown.split("\n").filter((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = undefined;
      return false;
    }
    return !fence;
  }).join("\n");
}

function anchors(markdown) {
  const body = prose(markdown);
  const ids = new Set([...body.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)].map((match) => match[1]));
  const used = new Set();
  for (const [, heading] of body.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    // GitHub heading IDs: visible text, lowercase, punctuation removed, spaces as dashes.
    const base = heading.replace(/<[^>]+>/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/&amp;/g, "&").toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, "").replace(/ /g, "-");
    let id = base;
    for (let n = 1; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    ids.add(id);
  }
  return ids;
}

function destinations(markdown) {
  const body = prose(markdown).replace(/(`+)[\s\S]*?\1/g, "");
  return [
    ...[...body.matchAll(/\]\(\s*(<[^>]+>|[^\s)]+)/g)].map((match) => match[1].replace(/^<|>$/g, "")),
    ...[...body.matchAll(/\bhref=["']([^"']+)["']/g)].map((match) => match[1]),
    ...[...body.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/gm)].map((match) => match[1]),
  ];
}

test("documentation local links resolve to files and GitHub heading/HTML anchors", () => {
  const errors = [];
  for (const document of documents) {
    const source = join(root, document);
    for (const destination of destinations(readFileSync(source, "utf8"))) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination)) continue;
      const [pathAndQuery, fragment] = destination.split("#");
      const path = decodeURIComponent(pathAndQuery.split("?")[0]);
      const target = path ? resolve(dirname(source), path) : source;
      if (!existsSync(target)) errors.push(`${document}: missing ${destination}`);
      else if (fragment && statSync(target).isFile() && extname(target) === ".md") {
        if (!anchors(readFileSync(target, "utf8")).has(decodeURIComponent(fragment))) {
          errors.push(`${document}: missing anchor ${destination}`);
        }
      }
    }
  }
  assert.deepEqual(errors, []);
});

test("moved content sections retain their public fragment links", () => {
  const ids = anchors(readFileSync(join(root, "docs/content.md"), "utf8"));
  for (const id of [
    "wide-images", "wide-diagrams", "wide-code-blocks", "captions-and-heading-links",
    "wavy-arrow", "homepage-introduction", "latest-articles", "featured-articles",
    "columns", "projects", "github-stars", "reading-lists", "explicit-fractions",
    "enlarged-author-statements",
  ]) assert.ok(ids.has(id), `Preserve docs/content.md#${id}`);
});
