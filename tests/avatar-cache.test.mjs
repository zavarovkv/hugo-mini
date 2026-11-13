import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const themeRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function attribute(tag, name) {
  const match = tag?.match(new RegExp("\\b" + name + "=(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))"));
  return (match?.[1] ?? match?.[2] ?? match?.[3])?.replaceAll("&amp;", "&");
}

test("avatars get content-hashed URLs without changing hover behavior", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "hugo-mini-avatar-cache-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ["themes", "content", "static/images"]) {
    await mkdir(join(root, dir), { recursive: true });
  }
  await symlink(themeRoot, join(root, "themes/hugo-mini"), "dir");
  const config = [
    'baseURL = "https://example.org/sub/"',
    'theme = "hugo-mini"',
    'title = "Fixture"',
    'disableKinds = ["taxonomy", "term"]',
    "[params]",
    'avatar = "images/portrait.svg?mode=normal#face"',
    'avatarHover = "images/portrait-hover.svg?mode=fun#face"'
  ].join("\n") + "\n";
  await writeFile(join(root, "hugo.toml"), config);
  await writeFile(join(root, "content/_index.md"), "+++\n+++\nHello");
  const normalFile = join(root, "static/images/portrait.svg");
  const hoverFile = join(root, "static/images/portrait-hover.svg");
  await writeFile(normalFile, '<svg xmlns="http://www.w3.org/2000/svg"><circle r="4"/></svg>');
  await writeFile(hoverFile, '<svg xmlns="http://www.w3.org/2000/svg"><circle r="5"/></svg>');

  function render() {
    execFileSync(process.env.HUGO_BIN || "hugo",
      ["--source", root, "--minify", "--panicOnWarning"], { stdio: "pipe" });
    return readFile(join(root, "public/index.html"), "utf8").then((html) => {
      const tags = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
      const image = (type) => tags.find((tag) =>
        attribute(tag, "class")?.split(" ").includes("title-avatar-" + type));
      return { normal: attribute(image("default"), "src"),
        hover: attribute(image("hover"), "src"), html };
    });
  }

  async function checkURL(src, file, mode) {
    const url = new URL(src, "https://example.org");
    assert.equal(url.pathname, "/sub/images/" + file.split("/").pop());
    assert.equal(url.searchParams.get("mode"), mode);
    assert.equal(url.searchParams.get("v"),
      createHash("sha256").update(await readFile(file)).digest("hex"));
    assert.equal(url.hash, "#face");
  }

  const before = await render();
  assert.equal((await render()).normal, before.normal, "unchanged image has stable URL");
  assert.equal((await render()).hover, before.hover, "unchanged hover has stable URL");
  await checkURL(before.normal, normalFile, "normal");
  await checkURL(before.hover, hoverFile, "fun");

  await writeFile(normalFile, '<svg xmlns="http://www.w3.org/2000/svg"><circle r="6"/></svg>');
  const normalChanged = await render();
  assert.notEqual(normalChanged.normal, before.normal, "normal image update must bypass cache");
  assert.equal(normalChanged.hover, before.hover, "unchanged hover URL is stable");
  await checkURL(normalChanged.normal, normalFile, "normal");

  await writeFile(hoverFile, '<svg xmlns="http://www.w3.org/2000/svg"><circle r="7"/></svg>');
  const hoverChanged = await render();
  assert.notEqual(hoverChanged.hover, before.hover, "hover image update must bypass cache");
  assert.equal(hoverChanged.normal, normalChanged.normal, "unchanged normal URL is stable");
  await checkURL(hoverChanged.hover, hoverFile, "fun");

  await writeFile(join(root, "hugo.toml"), config.replace(
    'images/portrait-hover.svg?mode=fun#face', 'https://cdn.example/hover.svg?mode=fun#face'));
  assert.equal((await render()).hover, "https://cdn.example/hover.svg?mode=fun#face",
    "external avatar URLs must remain unchanged");

  await writeFile(join(root, "hugo.toml"), config.replace(
    'images/portrait-hover.svg?mode=fun#face', 'images/missing.svg?mode=fun#face'));
  assert.equal((await render()).hover, "/sub/images/missing.svg?mode=fun#face",
    "missing assets keep their configured URL");

  await writeFile(join(root, "hugo.toml"), config.replace(
    'avatarHover = "images/portrait-hover.svg?mode=fun#face"\n', ""));
  const single = await render();
  assert.equal(single.hover, undefined, "single-avatar sites show only one image");
  assert.ok(!single.html.includes("has-hover-avatar"), "single-avatar styles stay off");
});
