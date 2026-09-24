// Experiment matrix runner (RQ1/RQ2/RQ3 data collection).
// Runs {method} × {variant} × {repeat} and appends one CSV row per test result.
//
// Usage examples:
//   node run-matrix.mjs --methods locator --variants v0,v1,v2,v3 --repeats 5
//   node run-matrix.mjs --methods locator,vlm --variants v0 --repeats 3 --suite rbac
//   node run-matrix.mjs --methods vlm --variants v2 --repeats 1 --label after-fix
//
// Output: ../results/raw/matrix-runs.csv (append; safe to resume a run)
// NOTE: for VLM runs make sure tests-vlm/.env is configured and MIDSCENE_CACHE
// is NOT enabled. For VLM runs the harness also aggregates real token usage +
// cost per run from the Midscene debug logs (see token-log.mjs); locator runs
// leave those columns empty.

import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectNewStats, snapshotLogDir } from './token-log.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};

const METHODS = flag('methods', 'locator').split(',');
const VARIANTS = flag('variants', 'v0').split(',');
const REPEATS = Number(flag('repeats', '1'));
const SUITE = flag('suite', 'main'); // main | rbac
const LABEL = flag('label', '');

const SUITE_FILES = {
  main: [
    'tests/group-a-forms.spec.ts',
    'tests/group-b-list-search.spec.ts',
    'tests/group-c-crud.spec.ts',
    'tests/group-d-custom-widgets.spec.ts',
  ],
  rbac: ['tests/rbac'],
};
const METHOD_DIR = { locator: 'tests-locator', vlm: 'tests-vlm' };

const OUT_DIR = path.join(ROOT, 'results', 'raw');
mkdirSync(OUT_DIR, { recursive: true });
const CSV = path.join(OUT_DIR, 'matrix-runs.csv');
const HEADER =
  'timestamp,label,method,suite,variant,repeat,test_id,status,duration_ms,run_wall_ms,run_ai_calls,run_prompt_tokens,run_completion_tokens,run_ai_ms,run_cost_usd\n';
if (!existsSync(CSV)) {
  writeFileSync(CSV, HEADER);
} else {
  // Migrate a CSV written before the token/cost columns: pad old rows.
  const lines = readFileSync(CSV, 'utf8').split(/\r?\n/);
  const oldCols = lines[0].split(',').length;
  const newCols = HEADER.trim().split(',').length;
  if (oldCols < newCols) {
    const pad = ','.repeat(newCols - oldCols);
    const body = lines
      .slice(1)
      .filter((l) => l !== '')
      .map((l) => l + pad + '\n')
      .join('');
    writeFileSync(CSV, HEADER + body);
    console.log(`[matrix] migrated CSV header: ${oldCols} -> ${newCols} columns`);
  }
}

const MIDSCENE_LOG_DIR = path.join(ROOT, 'tests-vlm', 'midscene_run', 'log');

// test_id = leading code in the title, e.g. "A1", "R8"
const testId = (title) => (title.match(/^([A-Z]\d+):/) ?? [null, title])[1];

function collectSpecs(suite, acc) {
  for (const child of suite.suites ?? []) collectSpecs(child, acc);
  for (const spec of suite.specs ?? []) acc.push(spec);
  return acc;
}

let totalRows = 0;
for (const method of METHODS) {
  const cwd = path.join(ROOT, METHOD_DIR[method]);
  for (const variant of VARIANTS) {
    for (let repeat = 1; repeat <= REPEATS; repeat++) {
      const jsonOut = path.join(OUT_DIR, `.tmp-${method}-${variant}-${repeat}.json`);
      rmSync(jsonOut, { force: true });

      const logSnapshot = method === 'vlm' ? snapshotLogDir(MIDSCENE_LOG_DIR) : null;
      const t0 = Date.now();
      const res = spawnSync('npx', ['playwright', 'test', ...SUITE_FILES[SUITE]], {
        cwd,
        shell: true,
        encoding: 'utf8',
        env: {
          ...process.env,
          APP_VARIANT: variant === 'v0' ? '' : variant,
          HARNESS_JSON: jsonOut,
        },
      });
      const wall = Date.now() - t0;

      // Per-run token/cost aggregate (VLM only): parse AI-call stats appended
      // to the Midscene logs during this run. Empty columns for locator.
      let tokenCols = ',,,,';
      let tokenNote = '';
      if (logSnapshot) {
        const s = collectNewStats(MIDSCENE_LOG_DIR, logSnapshot);
        tokenCols = `${s.calls},${s.promptTokens},${s.completionTokens},${s.aiMs},${s.costUsd.toFixed(6)}`;
        tokenNote = ` | ${s.calls} AI calls, ${s.promptTokens}+${s.completionTokens} tok, $${s.costUsd.toFixed(4)}`;
        if (s.calls === 0)
          console.warn('[matrix] WARNING: no AI-call stats found in midscene_run/log — token columns are 0');
      }

      if (!existsSync(jsonOut)) {
        console.error(`[matrix] ${method}/${variant}/#${repeat}: NO JSON OUTPUT — runner crashed?`);
        console.error(res.stdout?.slice(-1500), res.stderr?.slice(-500));
        continue;
      }
      const report = JSON.parse(readFileSync(jsonOut, 'utf8'));
      const specs = report.suites.flatMap((s) => collectSpecs(s, []));
      const ts = new Date().toISOString();
      let passed = 0;
      for (const spec of specs) {
        const result = spec.tests?.[0]?.results?.[0];
        const status = result?.status ?? 'missing';
        if (status === 'passed') passed++;
        appendFileSync(
          CSV,
          `${ts},${LABEL},${method},${SUITE},${variant},${repeat},${testId(spec.title)},${status},${result?.duration ?? ''},${wall},${tokenCols}\n`,
        );
        totalRows++;
      }
      rmSync(jsonOut, { force: true });
      console.log(
        `[matrix] ${method}/${variant}/#${repeat}: ${passed}/${specs.length} passed (${(wall / 1000).toFixed(1)}s)${tokenNote}`,
      );
    }
  }
}
console.log(`[matrix] done — ${totalRows} rows appended to ${path.relative(ROOT, CSV)}`);
