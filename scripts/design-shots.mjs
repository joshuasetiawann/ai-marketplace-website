// Renders the v2 design mockup and captures one PNG per design frame.
// Usage: node scripts/design-shots.mjs [out-dir]   (default out-dir: ./design-shots, gitignored)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const mockup = resolve("docs/design/v2/nexora-v2-mockup.html");
const outDir = resolve(process.argv[2] ?? "design-shots");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("file://" + mockup, { waitUntil: "load" });
await page.waitForTimeout(8000); // bundled React hydrates after load

// Each desktop design frame is a ~1320px-wide container.
const frames = await page.evaluate(() => {
  const out = [];
  const seen = [];
  for (const c of document.querySelectorAll("div")) {
    const r = c.getBoundingClientRect();
    if (r.width > 1250 && r.width < 1340 && r.height > 500) {
      const f = {
        x: Math.round(r.x + scrollX),
        y: Math.round(r.y + scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
      if (!seen.some((s) => Math.abs(s.y - f.y) < 30 && Math.abs(s.h - f.h) < 30)) {
        seen.push(f);
        out.push(f);
      }
    }
  }
  return out;
});

// Outermost frames appear in document order: beranda, jelajahi, detail, cart, auth, seller, admin
// (each followed by an inner duplicate we skip via the odd index).
const names = ["beranda", "jelajahi", "detail", "cart", "auth", "seller", "admin"];
let n = 0;
for (let i = 0; i < frames.length; i += 1) {
  // outer frames are the wider (1320) boxes; inner dupes are 1318 — keep the first of each pair
  if (i % 2 === 1 && frames.length >= names.length * 2) continue;
  const f = frames[i];
  const name = names[n] ?? `frame-${i}`;
  n += 1;
  await page.screenshot({
    path: `${outDir}/${name}.png`,
    clip: { x: f.x, y: f.y, width: f.w, height: Math.min(f.h, 8000) },
    fullPage: true,
  });
  console.log(`saved ${name}.png (${f.w}x${f.h} @y=${f.y})`);
}

// Mobile frames row at the bottom of the canvas.
const mobileY = await page.evaluate(() => {
  const el = [...document.querySelectorAll("body *")].find(
    (e) => e.children.length === 0 && (e.textContent || "").trim() === "Mobile",
  );
  if (!el) return null;
  return Math.round(el.getBoundingClientRect().y + scrollY);
});
if (mobileY) {
  const bodyH = await page.evaluate(() => document.body.scrollHeight);
  await page.screenshot({
    path: `${outDir}/mobile-row.png`,
    clip: { x: 0, y: mobileY, width: 1440, height: Math.min(bodyH - mobileY, 3000) },
    fullPage: true,
  });
  console.log("saved mobile-row.png");
}
await browser.close();
