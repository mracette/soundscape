// Downloads the served assets listed in assets-manifest.json from the CDN into
// the repo's build/ dir, so the desktop package can bundle them. Reproducible:
// the manifest is the source of truth — no dependence on a prior local build/.
import { readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const buildDir = join(resolve(here, "..", "..", ".."), "build");
const manifest = JSON.parse(
  await readFile(join(here, "..", "assets-manifest.json"), "utf8")
);

const CONCURRENCY = 8;
let done = 0;

const present = async (p) => {
  try {
    return (await stat(p)).size > 0;
  } catch {
    return false;
  }
};

const fetchOne = async ({ local, url }) => {
  const dest = join(buildDir, local);
  if (await present(dest)) {
    done++;
    return;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error(`empty ${url}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  done++;
};

const queue = [...manifest];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      await fetchOne(queue.shift());
      if (done % 25 === 0) console.log(`${done}/${manifest.length}`);
    }
  })
);
console.log(`synced ${done}/${manifest.length} assets into build/`);
