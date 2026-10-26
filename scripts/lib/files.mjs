import { mkdir, writeFile, rename, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";

// A failed or interrupted refresh must not truncate the last good snapshot.
export async function writeJSON(file, value) {
  const text = JSON.stringify(value, null, 2) + "\n";
  const temporary = `${file}.${randomUUID()}.tmp`;
  await mkdir(dirname(file), { recursive: true });
  try {
    await writeFile(temporary, text, { encoding: "utf8", flag: "wx" });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}
