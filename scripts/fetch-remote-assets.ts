// Runs under Bun (see package.json scripts). Built on Bun's own fetch, Bun.write and
// Bun.Image, so there is no image dependency (no sharp) and no node: boilerplate.
const publicDir = new URL("../public/", import.meta.url);

const assets = [{ from: "https://github.com/Cateds.png", to: "avatar.png" }];

// The sidebar renders the avatar at 72px, so 144px covers 2x displays. Upstream ships a
// 460px JPEG (despite the .png name), which is mostly wasted bytes; WebP at this size is
// several times smaller and faster to decode.
const AVATAR_WIDTH = 144;

const webpName = (name: string) => name.replace(/\.(png|jpe?g)$/i, ".webp");

await Promise.all(
  assets.map(async (asset) => {
    try {
      const res = await fetch(asset.from, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      await Bun.write(new URL(asset.to, publicDir), buf);
      console.log(`[fetch-remote-assets] fetched ${asset.from} -> ${asset.to}`);

      const size = await new Bun.Image(buf)
        .resize(AVATAR_WIDTH, AVATAR_WIDTH)
        .webp({ quality: 82 })
        .write(new URL(webpName(asset.to), publicDir));
      console.log(
        `[fetch-remote-assets] optimized ${asset.to} -> ${webpName(asset.to)} (${Math.round(size / 1024)} KB)`,
      );
    } catch (err) {
      console.warn(
        `[fetch-remote-assets] failed to fetch ${asset.from}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }),
);
