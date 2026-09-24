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
// Output: generated/grounding-results.csv + generated/raw-calls.jsonl (audit).
//
// Coordinate convention: Qwen3-VL grounding answers in 0-1000 normalized
// coordinates regardless of pixel instructions (verified 2026-07-08: asked
// for pixels on a 1280x800 image, it returned boxes that match ground truth
// exactly after x*W/1000, y*H/1000 scaling). So the prompt asks for the
// native 0-1000 convention and the harness converts to pixels; answers with
// any coordinate > 1000 are treated as already-in-pixels as a fallback.

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
const CSV_COLUMNS = [
  'condition', 'screen', 'item', 'repeat', 'pred_x', 'pred_y',
  'hit', 'dist', 'iou', 'in_tokens', 'out_tokens', 'latency_ms', 'error',
];
if (!existsSync(CSV)) {
  writeFileSync(CSV, CSV_COLUMNS.join(',') + '\n');
}

// hit/iou must NEVER be left blank: harness/make-figures.py's rq4_stats()
// does int(row['hit']) / float(row['iou']) on every row, so an empty string
// there crashes the whole analysis script. Point-only answers (no box) score
// iou=0 by definition (no predicted box to compare); failed/unparseable
// calls score hit=0, iou=0 (a miss), not "no data".
function csvRow(fields) {
  if (fields.length !== CSV_COLUMNS.length) {
    throw new Error(`csvRow: expected ${CSV_COLUMNS.length} columns, got ${fields.length}`);
  }
  return fields
    .map((v) => (v === undefined || v === null ? '' : String(v)))
    .join(',');
}

const imgPath = (cond, screenId) =>
  cond === 'orig' ? `screens/orig/${screenId}.png` : `screens/masked-${cond}/${screenId}.png`;

const RAW_LOG = 'generated/raw-calls.jsonl';

// PNG IHDR: width/height are big-endian uint32 at byte offsets 16/20.
function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// Accepts the answer shapes Qwen3-VL actually produces:
//   {"box":[x1,y1,x2,y2]}  |  {"bbox_2d":[...]}  |  {"x":[x1,y1,x2,y2]}
//   {"x":cx,"y":cy}        |  bare [x1,y1,x2,y2]
// Returns { cx, cy, box } in PIXELS of the w×h image, or null.
function parseAnswer(text, w, h) {
  const cleaned = text.replace(/```(?:json)?/g, '').trim();
  let obj = null;
  const jsonMatch = cleaned.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      obj = JSON.parse(jsonMatch[0]);
    } catch {
      obj = null;
    }
  }
  let arr = null;
  let cx = null;
  let cy = null;
  if (obj) {
    const boxLike = [obj.box, obj.bbox_2d, obj.bbox, obj.x].find(
      (v) => Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number'),
    );
    if (boxLike) arr = boxLike;
    else if (typeof obj.x === 'number' && typeof obj.y === 'number') {
      cx = obj.x;
      cy = obj.y;
    }
  }
  if (!arr && cx === null) {
    // Last resort: first bare [a,b,c,d] group anywhere in the text.
    const m = cleaned.match(/\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/);
    if (m) arr = m.slice(1, 5).map(Number);
  }
  if (!arr && cx === null) return null;

  // 0-1000 normalized (Qwen native) unless something exceeds 1000.
  const vals = arr ?? [cx, cy];
  const normalized = vals.every((v) => v <= 1000);
  const sx = normalized ? w / 1000 : 1;
  const sy = normalized ? h / 1000 : 1;
  if (arr) {
    const [x1, y1, x2, y2] = arr;
    const box = { x: x1 * sx, y: y1 * sy, w: (x2 - x1) * sx, h: (y2 - y1) * sy };
    return { cx: box.x + box.w / 2, cy: box.y + box.h / 2, box };
  }
  return { cx: cx * sx, cy: cy * sy, box: null };
}

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

async function locate(imageB64, desc, w, h) {
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
                `Locate this element in the screenshot: "${desc}". ` +
                'Answer with ONLY a JSON object, no prose: {"box": [x1, y1, x2, y2]} ' +
                'where coordinates are normalized to a 0-1000 scale on both axes.',
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
  return {
    parsed: parseAnswer(text, w, h),
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
    const imgBuf = readFileSync(imgPath(cond, screen.id));
    const { w, h } = pngSize(imgBuf);
    const b64 = imgBuf.toString('base64');
    for (const item of screen.items) {
      for (let r = 1; r <= REPEATS; r++) {
        let row;
        try {
          const { parsed, usage, latency, raw } = await locate(b64, item.desc, w, h);
          appendFileSync(
            RAW_LOG,
            JSON.stringify({ cond, screen: screen.id, item: item.id, repeat: r, raw, latency }) + '\n',
          );
          if (!parsed) throw new Error('unparseable answer');
          const px = Math.round(parsed.cx);
          const py = Math.round(parsed.cy);
          const hit = inBox(px, py, item.box) ? 1 : 0;
          const dist = centerDist(px, py, item.box).toFixed(1);
          // No predicted box (point-only answer) → 0 overlap with ground truth,
          // not "unknown". Was '' before, which crashed float(row['iou']).
          const iouVal = parsed.box ? iou(parsed.box, item.box).toFixed(3) : '0.000';
          row = csvRow([
            cond, screen.id, item.id, r, px, py, hit, dist, iouVal,
            usage.prompt_tokens ?? '', usage.completion_tokens ?? '', latency, '',
          ]);
        } catch (e) {
          // API/parse failure = a miss, scored the same as any other miss
          // (hit=0, iou=0) — was left blank before, which also crashed the
          // analysis script's int(row['hit']).
          row = csvRow([
            cond, screen.id, item.id, r, '', '', 0, '', '0.000',
            '', '', '', String(e.message).replaceAll('"', "'"),
          ]);
        }
        appendFileSync(CSV, row + '\n');
        done++;
        if (done % 20 === 0) console.log(`[benchmark] ${done}/${totalCalls} calls`);
      }
    }
  }
}
console.log(`[benchmark] done — results in ${CSV}`);
