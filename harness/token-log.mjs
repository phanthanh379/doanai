// Token/cost collector for VLM runs (reads Midscene debug logs).
//
// Midscene v1.10.3 writes one line per AI call to midscene_run/log/*.log
// (topic ai:profile:stats; older builds used ai:call). Line format:
//   [2026-07-08T14:33:12.123+07:00] model, <id>, mode, <family>, prompt-tokens, 1551,
//   completion-tokens, 36, total-tokens, 1587, cost-ms, 4800, requestId, ..., temperature, 0
//
// Usage: snapshot the log dir before a run, then collect only the bytes
// appended during the run and aggregate token counts.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

// USD per 1M tokens for the pinned model (OpenRouter, checked 2026-07-08).
// Source: docs/pilot-model-cost.md section 6. Update if the pinned model changes.
export const PRICING = {
  'qwen/qwen3-vl-235b-a22b-instruct': { inPerM: 0.2, outPerM: 0.88 },
};

const STATS_RE =
  /model, ([^,]+), mode, [^,]*, prompt-tokens, (\d+), completion-tokens, (\d+), total-tokens, (\d+), cost-ms, (\d+)/g;

function listLogFiles(logDir) {
  try {
    return readdirSync(logDir)
      .filter((f) => f.endsWith('.log'))
      .map((f) => path.join(logDir, f));
  } catch {
    return []; // log dir does not exist yet (first run)
  }
}

// Returns { file -> byte size } for every .log file currently in logDir.
export function snapshotLogDir(logDir) {
  const sizes = {};
  for (const file of listLogFiles(logDir)) sizes[file] = statSync(file).size;
  return sizes;
}

// Parses AI-call stats appended to logDir since `snapshot` and aggregates them.
// Returns { calls, promptTokens, completionTokens, totalTokens, aiMs, costUsd, models }.
export function collectNewStats(logDir, snapshot) {
  const agg = {
    calls: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    aiMs: 0,
    costUsd: 0,
    models: new Set(),
  };
  for (const file of listLogFiles(logDir)) {
    const start = snapshot[file] ?? 0;
    const size = statSync(file).size;
    if (size <= start) continue;
    // Logs are append-only; slice by BYTE offset on the buffer (log content can
    // contain non-ASCII, e.g. Vietnamese text echoed in ai-call.log responses).
    const appended = readFileSync(file).subarray(start).toString('utf8');
    for (const m of appended.matchAll(STATS_RE)) {
      const [, model, inTok, outTok, totTok, ms] = m;
      const price = PRICING[model.trim()];
      agg.calls++;
      agg.promptTokens += Number(inTok);
      agg.completionTokens += Number(outTok);
      agg.totalTokens += Number(totTok);
      agg.aiMs += Number(ms);
      agg.models.add(model.trim());
      if (price) {
        agg.costUsd +=
          (Number(inTok) * price.inPerM + Number(outTok) * price.outPerM) / 1e6;
      }
    }
  }
  return agg;
}
