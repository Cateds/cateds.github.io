// Legacy sky regression suite. The particle layer is not mounted by default; re-enable
// <Sky /> in PageLayout.astro before running this script.
// Run against an existing dev server: bun scripts/test-sky-browser.mjs [URL]
import { chromium, firefox } from "playwright";
import assert from "node:assert/strict";

const url = process.argv[2] ?? "http://localhost:4322/";
for (const [name, engine, args] of [
  ["chromium-canvas", chromium, []],
  ["chromium-webgpu", chromium, ["--enable-unsafe-webgpu", "--use-angle=metal"]],
  ["firefox", firefox, []],
]) {
  const browser = await engine.launch({ headless: true, args });
  try {
    for (const touch of [false, true]) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        hasTouch: touch,
      });
      await page.addInitScript((forceCanvas) => {
        localStorage.setItem("theme", "dark");
        if (forceCanvas) Object.defineProperty(navigator, "gpu", { value: undefined });
        if (navigator.gpu) {
          const requestAdapter = navigator.gpu.requestAdapter.bind(navigator.gpu);
          navigator.gpu.requestAdapter = async (...adapterOptions) => {
            const adapter = await requestAdapter(...adapterOptions);
            if (!adapter) return adapter;
            const requestDevice = adapter.requestDevice.bind(adapter);
            adapter.requestDevice = async (...deviceArgs) => {
              const device = await requestDevice(...deviceArgs);
              window.__skyDevice = device;
              const createBuffer = device.createBuffer.bind(device);
              device.createBuffer = (descriptor) => {
                const buffer = createBuffer(descriptor);
                if (descriptor.usage & GPUBufferUsage.STORAGE) window.__skyStateBuffer = buffer;
                return buffer;
              };
              return device;
            };
            return adapter;
          };
        }
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...contextOptions) {
          const context = getContext.call(this, kind, ...contextOptions);
          if (context && (kind === "2d" || kind === "webgpu")) this.dataset.renderer = kind;
          return context;
        };
      }, name.endsWith("canvas"));
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForSelector(".sky.ready");
      await page.waitForTimeout(2000);
      if (name.endsWith("webgpu")) {
        const visible = async () =>
          page.evaluate(async () => {
            const device = window.__skyDevice;
            const state = window.__skyStateBuffer;
            const copy = device.createBuffer({
              size: state.size,
              usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            });
            const encoder = device.createCommandEncoder();
            encoder.copyBufferToBuffer(state, 0, copy, 0, state.size);
            device.queue.submit([encoder.finish()]);
            await copy.mapAsync(GPUMapMode.READ);
            const values = new Float32Array(copy.getMappedRange());
            let count = 0;
            for (let i = 4; i < values.length; i += 8) if (values[i] > 0.06) count++;
            copy.unmap();
            copy.destroy();
            return count;
          });
        const before = await visible();
        await page.setViewportSize({ width: 420, height: 880 });
        await page.waitForTimeout(40);
        const after = await visible();
        console.log(name, "GPU live particles across growth:", before, "→", after);
        assert.ok(before > 20 && after > before * 0.7, "GPU growth reset particle visibility");
        await page.setViewportSize({ width: 390, height: 844 });
      }
      await page.evaluate(() => {
        window.__skySamples = [];
        window.__skySampling = true;
        const sample = () => {
          const canvas = document.querySelector(".sky canvas");
          const rect = canvas.getBoundingClientRect();
          // WebGPU's presented swapchain image is not a persistent CPU-readable
          // canvas bitmap; drawImage after presentation can return transparent.
          const context = canvas.dataset.renderer === "2d" ? canvas.getContext("2d") : null;
          let pixels = null;
          if (context) {
            const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
            pixels = 0;
            for (let i = 3; i < data.length; i += 4) if (data[i] > 15) pixels++;
          }
          window.__skySamples.push({
            w: rect.width,
            h: rect.height,
            bw: canvas.width,
            bh: canvas.height,
            pixels,
          });
          if (window.__skySampling) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      for (const height of [838, 760, 700, 844]) {
        await page.setViewportSize({ width: 390, height });
        await page.waitForTimeout(45);
      }
      for (const viewport of [
        { width: 844, height: 390 },
        { width: 390, height: 844 },
        { width: 1280, height: 800 },
      ]) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100);
      }
      await page.waitForTimeout(250);
      const samples = await page.evaluate(() => {
        window.__skySampling = false;
        return window.__skySamples;
      });
      const distorted = samples.filter((s) => Math.abs(s.bw / s.w - s.bh / s.h) > 0.004);
      const renderer = await page.locator(".sky canvas").getAttribute("data-renderer");
      console.log(
        name,
        touch ? "touch" : "mouse",
        renderer,
        "resize samples:",
        samples.length,
        "stretched frames:",
        distorted.length,
      );
      assert.equal(distorted.length, 0, JSON.stringify(distorted.slice(0, 4)));
      assert.ok(
        samples.every((s) => s.pixels === null || s.pixels > 50),
        "Particle field flashed blank",
      );
      if (name.endsWith("webgpu"))
        assert.equal(renderer, "webgpu", "GPU coverage must not silently fall back");
      // Record actual computed colours: the foreground and surfaces must pass through
      // intermediate colours, not merely advertise a CSS transition.
      const colours = await page.evaluate(async () => {
        const root = document.documentElement;
        const frames = [];
        const sample = () =>
          frames.push({
            ink: getComputedStyle(root).color,
            bg: getComputedStyle(document.body).backgroundColor,
          });
        sample();
        document.querySelector(".theme-toggle").click();
        for (let i = 0; i < 45; i++) {
          await new Promise(requestAnimationFrame);
          sample();
        }
        return frames;
      });
      assert.ok(
        new Set(colours.map((c) => c.ink)).size > 3,
        "Text theme snapped instead of fading",
      );
      assert.ok(
        new Set(colours.map((c) => c.bg)).size > 3,
        "Surface theme snapped instead of fading",
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.locator(".theme-toggle").click();
      assert.equal(await page.locator("html").getAttribute("data-theme-switching"), null);
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
