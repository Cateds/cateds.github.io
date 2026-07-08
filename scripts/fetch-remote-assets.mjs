import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const publicDir = join(root, "public");

const assets = [
  { from: "https://github.com/Cateds.png", to: "avatar.png" },
];

await Promise.all(
  assets.map(async (asset) => {
    const dest = join(publicDir, asset.to);
    try {
      const res = await fetch(asset.from, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, buf);
      console.log(`[fetch-remote-assets] fetched ${asset.from} -> ${asset.to}`);
    } catch (err) {
      console.warn(
        `[fetch-remote-assets] failed to fetch ${asset.from}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }),
);
