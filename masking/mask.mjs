// RQ4 step 2 — produce masked screenshot variants with sharp.
// Two masking styles over the known PII coordinates from groundtruth.json:
//   blur:  gaussian blur (sigma 12) of each region
//   pixel: pixelation (downscale ×0.08 then nearest-neighbour upscale)
// Output: screens/masked-blur/<screen>.png, screens/masked-pixel/<screen>.png
// Screens without PII regions are copied unchanged (control condition).

import { mkdirSync, readFileSync, copyFileSync } from 'node:fs';
import sharp from 'sharp';

const PAD = 4; // small padding so glyph edges do not leak
const groundtruth = JSON.parse(readFileSync('generated/groundtruth.json', 'utf8'));

mkdirSync('screens/masked-blur', { recursive: true });
mkdirSync('screens/masked-pixel', { recursive: true });

function padBox(box, meta) {
  const x = Math.max(0, box.x - PAD);
  const y = Math.max(0, box.y - PAD);
  return {
    left: x,
    top: y,
    width: Math.min(meta.width - x, box.w + 2 * PAD),
    height: Math.min(meta.height - y, box.h + 2 * PAD),
  };
}

async function maskScreen(screen, style) {
  const src = `screens/orig/${screen.id}.png`;
  const dst = `screens/masked-${style}/${screen.id}.png`;
  if (screen.pii.length === 0) {
    copyFileSync(src, dst);
    return;
  }
  const base = sharp(src);
  const meta = await base.metadata();
  const overlays = [];
  for (const p of screen.pii) {
    const region = padBox(p.box, meta);
    let patch = sharp(src).extract(region);
    if (style === 'blur') {
      patch = patch.blur(12);
    } else {
      const w = Math.max(1, Math.round(region.width * 0.08));
      const h = Math.max(1, Math.round(region.height * 0.08));
      const small = await patch.resize(w, h).toBuffer();
      patch = sharp(small).resize(region.width, region.height, { kernel: 'nearest' });
    }
    overlays.push({ input: await patch.toBuffer(), left: region.left, top: region.top });
  }
  await base.composite(overlays).toFile(dst);
}

for (const screen of groundtruth) {
  await maskScreen(screen, 'blur');
  await maskScreen(screen, 'pixel');
  console.log(`[mask] ${screen.id}: ${screen.pii.length} regions → blur + pixel`);
}
console.log('[mask] done');
