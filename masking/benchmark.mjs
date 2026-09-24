// RQ4 step 3 — grounding benchmark: ask the VLM to locate each described
// element on the original vs masked screenshots, then score accuracy.
//
// Requires MIDSCENE_MODEL_* env vars (same .env as tests-vlm). Usage:
//   node benchmark.mjs [--repeats 3] [--conditions orig,blur,pixel]
//
// Metrics per (condition × item × repeat):
//   hit      — predicted center point falls inside the ground-truth box
//   dist     — euclidean distance (px) from predicted point to gt box center
//   iou      — IoU when the model returns a box (0 when point-only)
// Output: generated/grounding-results.csv (+ raw JSON per call).

import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '../tests-vlm/.env' });
dotenv.config();

const API_KEY = process.env.MIDSCENE_MODEL_API_KEY;
const BASE_URL = (process.env.MIDSCENE_MODEL_BASE_URL ?? 'https://openrouter.ai/api/v1').replace(/\/$/, '');
const MODEL = process.env.MIDSCENE_MODEL_NAME ?? 'qwen/qwen3-vl-plus';
if (!API_KEY) {
  console.error('MIDSCENE_MODEL_API_KEY missing — fill tests-vlm/.env first.');
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const REPEATS = Number(flag('repeats', '3'));
const CONDITIONS = flag('conditions', 'orig,blur,pixel').split(',');

const groundtruth = JSON.parse(readFileSync('generated/groundtruth.json', 'utf8'));
const CSV = 'generated/grounding-results.csv';
if (!existsSync(CSV)) {
  writeFileSync(
    CSV,
    'condition,screen,item,repeat,pred_x,pred_y,hit,dist,iou,in_tokens,out_tokens,latency_ms,error\n',
  );
}

const imgPath = (cond, screenId) =>
  cond === 'orig' ? `screens/orig/${screenId}.png` : `screens/masked-${cond}/${screenId}.png`;

function centerDist(px, py, box) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  return Math.hypot(px - cx, py - cy);
}
const inBox = (px, py, box) =>
  px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h;

function iou(a, b) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.w * a.h + b.w * b.h - inter;
  return union > 0 ? inter / union : 0;
}

async function locate(imageB64, desc) {
  const t0 = Date.now();
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageB64}` } },
            {
              type: 'text',
              text:
                `The screenshot is 1280x800 pixels. Locate this element: "${desc}". ` +
                'Answer with ONLY a JSON object, no prose: ' +
                '{"x": <center x px>, "y": <center y px>, "box": [x1, y1, x2, y2]} ' +
                '(box is optional if you are unsure of the extent).',
            },
          ],
        },
      ],
    }),
  });
  const latency = Date.now() - t0;
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  const parsed = match ? JSON.parse(match[0]) : null;
  return {
    parsed,
    usage: data.usage ?? {},
    latency,
    raw: text,
  };
}

console.log(`[benchmark] model=${MODEL} repeats=${REPEATS} conditions=${CONDITIONS.join(',')}`);
let done = 0;
const totalCalls =
  CONDITIONS.length * REPEATS * groundtruth.reduce((n, s) => n + s.items.length, 0);

for (const cond of CONDITIONS) {
  for (const screen of groundtruth) {
    const b64 = readFileSync(imgPath(cond, screen.id)).toString('base64');
    for (const item of screen.items) {
      for (let r = 1; r <= REPEATS; r++) {
        let row;
        try {
          const { parsed, usage, latency } = await locate(b64, item.desc);
          if (!parsed || typeof parsed.x !== 'number' || typeof parsed.y !== 'number') {
            throw new Error('unparseable answer');
          }
          const hit = inBox(parsed.x, parsed.y, item.box) ? 1 : 0;
          const dist = centerDist(parsed.x, parsed.y, item.box).toFixed(1);
          const predBox = Array.isArray(parsed.box)
            ? {
                x: parsed.box[0],
                y: parsed.box[1],
                w: parsed.box[2] - parsed.box[0],
                h: parsed.box[3] - parsed.box[1],
              }
            : null;
          const iouVal = predBox ? iou(predBox, item.box).toFixed(3) : '';
          row = `${cond},${screen.id},${item.id},${r},${parsed.x},${parsed.y},${hit},${dist},${iouVal},${usage.prompt_tokens ?? ''},${usage.completion_tokens ?? ''},${latency},`;
        } catch (e) {
          row = `${cond},${screen.id},${item.id},${r},,,,,,,,,"${String(e.message).replaceAll('"', "'")}"`;
        }
        appendFileSync(CSV, row + '\n');
        done++;
        if (done % 20 === 0) console.log(`[benchmark] ${done}/${totalCalls} calls`);
      }
    }
  }
}
console.log(`[benchmark] done — results in ${CSV}`);
