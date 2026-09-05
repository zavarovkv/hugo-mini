import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const base = new URL("../", import.meta.url);
test("committed KaTeX assets match their pinned manifest and render formulas", async () => {
  const manifest = JSON.parse(await readFile(new URL("vendor/katex.json", base), "utf8"));
  for (const [source, checksum] of Object.entries(manifest.files)) {
    const path = source.replace(/^dist\/(?:contrib\/)?/, "");
    const bytes = await readFile(new URL(`static/katex/${path}`, base));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), checksum, path);
  }
  const katex = require("../static/katex/katex.min.js");
  assert.equal(katex.version, manifest.version);
  for (const formula of ["e^{i\\pi}+1=0", "\\frac{a}{b}", "\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}"]) {
    assert.match(katex.renderToString(formula, { throwOnError: true }), /class="katex"/);
  }
  const css = await readFile(new URL("static/katex/katex.min.css", base), "utf8");
  for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
    await access(new URL(`static/katex/${match[1].replace(/["']/g, "")}`, base));
  }
});
