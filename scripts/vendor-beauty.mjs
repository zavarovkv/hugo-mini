import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const local = process.argv[2] === "--local" ? process.argv[3] : null;
const revision = local ? null : process.argv[2];
if ((!local && !/^[a-f0-9]{40}$/.test(revision || "")) || process.argv.length !== (local ? 4 : 3)) {
  throw new Error("Usage: node scripts/vendor-beauty.mjs <full upstream commit SHA> | --local <development checkout>");
}
const source = `https://raw.githubusercontent.com/zavarovkv/beauty-css/${revision}/`;
async function download(path) {
  if (local) return readFile(resolve(local, path), "utf8");
  const response = await fetch(new URL(path, source), { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.text();
}
const [manifestText, css, license] = await Promise.all([
  download("dist/manifest.json"), download("dist/beauty.min.css"), download("LICENSE"),
]);
const manifest = JSON.parse(manifestText);
if (local && !/-dev\./.test(manifest.version)) {
  throw new Error("Local previews require an explicitly unreleased -dev version");
}
const expected = manifest.files?.["beauty.min.css"];
const sha256 = createHash("sha256").update(css).digest("hex");
if (manifest.name !== "beauty-css" || !expected || sha256 !== expected.sha256) {
  throw new Error("Beauty.css manifest or checksum mismatch; no files were written");
}
if (!license.startsWith("MIT License") || !css.startsWith(`/*! Beauty.css v${manifest.version} | MIT`)) {
  throw new Error("Unexpected license or stylesheet version; no files were written");
}
const root = new URL("../", import.meta.url);
await mkdir(new URL("vendor/", root), { recursive: true });
await writeFile(new URL("assets/css/beauty.css", root), css);
await writeFile(new URL("vendor/beauty-css.LICENSE", root), license);
await writeFile(new URL("vendor/beauty-css.json", root), JSON.stringify({
  repository: "https://github.com/zavarovkv/beauty-css",
  ...(local ? { source: "local-development" } : {}),
  revision, version: manifest.version, file: "assets/css/beauty.css", sha256,
}, null, 2) + "\n");
console.log(`Vendored Beauty.css ${manifest.version} ${local ? "for local preview; pin an upstream commit before release" : `at ${revision}`}`);
