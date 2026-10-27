import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const base = new URL("../", import.meta.url);
test("the Beauty.css foundation matches its pinned upstream artifact", async () => {
  const manifest = JSON.parse(await readFile(new URL("vendor/beauty-css.json", base), "utf8"));
  if (manifest.source === "local-development") {
    assert.equal(manifest.revision, null);
    assert.match(manifest.version, /-dev\./);
  } else {
    assert.match(manifest.revision, /^[a-f0-9]{40}$/);
  }
  const css = await readFile(new URL(manifest.file, base));
  assert.equal(createHash("sha256").update(css).digest("hex"), manifest.sha256);
  assert.ok(css.toString().startsWith(`/*! Beauty.css v${manifest.version} | MIT`));
  assert.doesNotMatch(css.toString(), /@import|url\(|\{\{/);
  assert.match(await readFile(new URL("vendor/beauty-css.LICENSE", base), "utf8"), /^MIT License/);
});

test("the theme configures shared typography without redefining native text styles", async () => {
  const css = (await readFile(new URL("assets/css/main.css", base), "utf8"))
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const nativeText = /^(?:(?:main|article)\s+)?(?:body|main|article|h[1-6]|p|a|ul|ol|li|blockquote|code|pre|time|q|strong|b)(?::[\w-]+)?$/;
  for (const [, selectors, declarations] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectors.split(",").every((selector) => nativeText.test(selector.trim()))) continue;
    assert.doesNotMatch(declarations, /(?:^|;)\s*(?:font(?:-[\w-]+)?|line-height|letter-spacing|text-decoration(?:-[\w-]+)?|color|background(?:-color)?)\s*:/,
      `${selectors.trim()}: move generic typography to Beauty and configure its tokens here`);
  }
});

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
