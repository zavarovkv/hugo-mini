import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const en = readFileSync(join(root, "README.md"), "utf8");
const ru = readFileSync(join(root, "README.ru.md"), "utf8");

test("both READMEs expose the language switcher, matching examples and localized typography links", () => {
  for (const readme of [en, ru]) {
    assert.match(readme, /href="README\.md"/);
    assert.match(readme, /href="README\.ru\.md"/);
  }

  const examples = (markdown) => [...markdown.matchAll(/```[^\n]*\n[\s\S]*?```/g)].map(([block]) => block);
  assert.deepEqual(examples(ru), examples(en));

  const destinations = (markdown) => [...markdown.matchAll(/\]\(([^)]*)\)/g)]
    .map(([, destination]) => destination)
    .filter((destination) => !destination.startsWith("#"))
    .sort();
  const enLinks = destinations(en);
  const ruLinks = destinations(ru);
  assert.equal(enLinks.filter((link) => link === "docs/typography.md").length, 2, "English links use only the English typography guide");
  assert.equal(ruLinks.filter((link) => link === "docs/typography.ru.md").length, 2, "Russian links use only the Russian typography guide");
  assert.ok(!enLinks.includes("docs/typography.ru.md"), "no cross-language typography links in English");
  assert.ok(!ruLinks.includes("docs/typography.md"), "no cross-language typography links in Russian");
  assert.deepEqual(ruLinks.map((link) => link === "docs/typography.ru.md" ? "docs/typography.md" : link).sort(), enLinks, "other links remain synchronized");
});

test("Russian README consistently uses е instead of ё", () => {
  assert.doesNotMatch(ru, /[Ёё]/);
});

test("README images use absolute URLs for the Hugo Themes gallery", () => {
  for (const readme of [en, ru]) {
    const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(([, url]) => url);
    assert.ok(images.length > 0, "README should include a preview image");
    for (const url of images) assert.match(url, /^https:\/\//);
  }
});
