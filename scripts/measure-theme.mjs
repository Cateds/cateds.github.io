import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
try {
  for (let run = 0; run < 3; run++) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      hasTouch: true,
    });
    await page.goto(process.argv[2] ?? "http://localhost:4322/", { waitUntil: "networkidle" });
    await page.waitForSelector("main");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2000);
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setCPUThrottlingRate", { rate: 6 });
    const frames = await page.evaluate(async () => {
      const times = [];
      await new Promise(requestAnimationFrame);
      document.querySelector(".theme-toggle").click();
      const start = performance.now();
      while (performance.now() - start < 900) times.push(await new Promise(requestAnimationFrame));
      return times.slice(1).map((t, i) => t - times[i]);
    });
    const sorted = frames.toSorted((a, b) => a - b);
    console.log(
      JSON.stringify({
        run,
        frames: frames.length,
        p95: sorted[Math.floor(sorted.length * 0.95)],
        over40: frames.filter((dt) => dt > 40).length,
        max: Math.max(...frames),
      }),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
