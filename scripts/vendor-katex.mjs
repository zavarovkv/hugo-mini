#!/usr/bin/env node
// Maintainer-only: copy a verified npm package into the self-hosted asset set.
import { readFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "vendor/katex.json"), "utf8"));
if (process.argv.length !== 3) throw new Error("Usage: node scripts/vendor-katex.mjs PATH/TO/node_modules/katex");
const source = resolve(process.argv[2]);
const pkg = JSON.parse(await readFile(resolve(source, "package.json"), "utf8"));
if (pkg.version !== manifest.version) throw new Error(`Expected KaTeX ${manifest.version}, got ${pkg.version}`);

// Validate the whole package selection before replacing any file.
for (const [name, checksum] of Object.entries(manifest.files)) {
  const actual = createHash("sha256").update(await readFile(resolve(source, name))).digest("hex");
  if (actual !== checksum) throw new Error(`KaTeX checksum mismatch: ${name}`);
}
for (const name of Object.keys(manifest.files)) {
  const relative = name.replace(/^dist\/(?:contrib\/)?/, "");
  const target = resolve(root, "static/katex", relative);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(source, name), target);
}
console.log(`Vendored KaTeX ${manifest.version}, including CSS, auto-render, fonts and license.`);
