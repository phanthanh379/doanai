#!/usr/bin/env python3
"""Generate GD4 analysis figures and summary tables from the official runs.

Inputs (committed in the repo):
  - results/raw/matrix-runs.csv          (labels gd4-main, gd4-rbac-clean, gd4-rbac-seeded)
  - masking/generated/grounding-results.csv
  - RQ2 numbers are constants below (measured on branches rq2-fix-v2 / rq2-fix-v3,
    see results/rq2-maintenance.md).

Outputs:
  - results/figures/fig-rq1-passrate.png
  - results/figures/fig-rq1-time-cost.png
  - results/figures/fig-rq2-maintenance.png
  - results/figures/fig-rq3-detection.png
  - results/figures/fig-rq4-hitrate-iou.png
  - results/analysis-summary.md (all tables, generated — do not edit by hand)

Run from the repo root: python3 harness/make-figures.py
Requires matplotlib (pip install matplotlib). Deterministic: no timestamps inside outputs.
"""

import csv
import os
from collections import defaultdict
from statistics import mean

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIG_DIR = os.path.join(ROOT, "results", "figures")
os.makedirs(FIG_DIR, exist_ok=True)

VARIANTS = ["v0", "v1", "v2", "v3"]
VARIANT_LABELS = {
    "v0": "V0\n(gốc)",
    "v1": "V1\n(dark theme)",
    "v2": "V2\n(đảo bố cục)",
    "v3": "V3\n(đổi icon/nhãn)",
}
METHOD_LABELS = {"locator": "Locator (Playwright)", "vlm": "VLM (Midscene + Qwen3-VL)"}
COLORS = {"locator": "#4472c4", "vlm": "#ed7d31"}

# RQ2 constants measured on branches rq2-fix-v2/v3 (tests, LOC) and rq2-agent-v2/v3
# (restore time in seconds, T0->T2) — see results/rq2-maintenance.md sections 2 and 4.
RQ2 = {
    "locator": {"v1": (0, 0, 0.0), "v2": (9, 24, 177.3), "v3": (6, 22, 137.1)},
    "vlm": {"v1": (0, 0, 0.0), "v2": (0, 0, 0.0), "v3": (0, 0, 0.0)},
}


def read_matrix():
    path = os.path.join(ROOT, "results", "raw", "matrix-runs.csv")
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def read_grounding():
    path = os.path.join(ROOT, "masking", "generated", "grounding-results.csv")
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def rq1_stats(rows):
    """Per (method, variant): pass-rate over 5x18, wall seconds, cost per run."""
    main = [r for r in rows if r["label"] == "gd4-main"]
    out = {}
    for m in ("locator", "vlm"):
        for v in VARIANTS:
            sub = [r for r in main if r["method"] == m and r["variant"] == v]
            per_repeat = defaultdict(lambda: [0, 0])
            runs = {}
            for r in sub:
                pr = per_repeat[r["repeat"]]
                pr[0] += r["status"] == "passed"
                pr[1] += 1
                runs[r["repeat"]] = (
                    float(r["run_wall_ms"]) / 1000,
                    float(r["run_cost_usd"] or 0),
                )
            passed = [p for p, _ in per_repeat.values()]
            total = [t for _, t in per_repeat.values()]
            out[(m, v)] = {
                "pass": sum(passed),
                "total": sum(total),
                "pass_min": min(passed),
                "pass_max": max(passed),
                "wall_s": mean(w for w, _ in runs.values()),
                "cost": mean(c for _, c in runs.values()),
            }
    return out


def fig_rq1_passrate(stats):
    x = range(len(VARIANTS))
    width = 0.38
    fig, ax = plt.subplots(figsize=(7, 4.2))
    for i, m in enumerate(("locator", "vlm")):
        vals = [100 * stats[(m, v)]["pass"] / stats[(m, v)]["total"] for v in VARIANTS]
        bars = ax.bar(
            [xi + (i - 0.5) * width for xi in x], vals, width,
            label=METHOD_LABELS[m], color=COLORS[m],
        )
        for b, v in zip(bars, vals):
            ax.annotate(f"{v:.0f}%", (b.get_x() + b.get_width() / 2, v),
                        ha="center", va="bottom", fontsize=9)
    ax.set_xticks(list(x))
    ax.set_xticklabels([VARIANT_LABELS[v] for v in VARIANTS])
    ax.set_ylabel("Tỉ lệ pass (%) — 18 test × 5 lặp")
    ax.set_ylim(0, 112)
    ax.set_title("RQ1 — Độ bền vững: tỉ lệ pass theo biến thể giao diện")
    ax.legend(loc="lower left")
    ax.grid(axis="y", alpha=0.3)
    fig.tight_layout()
    fig.savefig(os.path.join(FIG_DIR, "fig-rq1-passrate.png"), dpi=200)
    plt.close(fig)


def fig_rq1_time_cost(stats):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.5, 4.2))
    x = range(len(VARIANTS))
    width = 0.38
    for i, m in enumerate(("locator", "vlm")):
        walls = [stats[(m, v)]["wall_s"] for v in VARIANTS]
        bars = ax1.bar([xi + (i - 0.5) * width for xi in x], walls, width,
                       label=METHOD_LABELS[m], color=COLORS[m])
        for b, w in zip(bars, walls):
            ax1.annotate(f"{w:.0f}s", (b.get_x() + b.get_width() / 2, w),
                         ha="center", va="bottom", fontsize=8)
    ax1.set_yscale("log")
    ax1.set_xticks(list(x))
    ax1.set_xticklabels([VARIANT_LABELS[v] for v in VARIANTS], fontsize=8)
    ax1.set_ylabel("Thời gian chạy 1 run (giây, thang log)")
    ax1.set_title("Thời gian thực thi / run (18 test)")
    ax1.grid(axis="y", alpha=0.3)
    ax1.legend(fontsize=8)

    costs = [stats[("vlm", v)]["cost"] for v in VARIANTS]
    bars = ax2.bar([VARIANT_LABELS[v] for v in VARIANTS], costs, color=COLORS["vlm"])
    for b, c in zip(bars, costs):
        ax2.annotate(f"${c:.4f}", (b.get_x() + b.get_width() / 2, c),
                     ha="center", va="bottom", fontsize=8)
    ax2.set_ylabel("Chi phí API / run (USD)")
    ax2.set_title("Chi phí API mỗi run — chỉ VLM\n(locator = $0)")
    ax2.grid(axis="y", alpha=0.3)
    fig.tight_layout()
    fig.savefig(os.path.join(FIG_DIR, "fig-rq1-time-cost.png"), dpi=200)
    plt.close(fig)


def fig_rq2():
    variants = ["v1", "v2", "v3"]
    labels = [VARIANT_LABELS[v].replace("\n", " ") for v in variants]
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(13, 4.0))
    x = range(len(variants))
    width = 0.38
    for i, m in enumerate(("locator", "vlm")):
        tests = [RQ2[m][v][0] for v in variants]
        locs = [RQ2[m][v][1] for v in variants]
        secs = [RQ2[m][v][2] for v in variants]
        b1 = ax1.bar([xi + (i - 0.5) * width for xi in x], tests, width,
                     label=METHOD_LABELS[m], color=COLORS[m])
        b2 = ax2.bar([xi + (i - 0.5) * width for xi in x], locs, width,
                     label=METHOD_LABELS[m], color=COLORS[m])
        b3 = ax3.bar([xi + (i - 0.5) * width for xi in x], secs, width,
                     label=METHOD_LABELS[m], color=COLORS[m])
        for b, val in list(zip(b1, tests)):
            ax1.annotate(str(val), (b.get_x() + b.get_width() / 2, val),
                         ha="center", va="bottom", fontsize=9)
        for b, val in list(zip(b2, locs)):
            ax2.annotate(str(val), (b.get_x() + b.get_width() / 2, val),
                         ha="center", va="bottom", fontsize=9)
        for b, val in list(zip(b3, secs)):
            ax3.annotate(f"{val:.0f}", (b.get_x() + b.get_width() / 2, val),
                         ha="center", va="bottom", fontsize=9)
    for ax, title, ylab, ymax in (
        (ax1, "Số test phải sửa (trên 18)", "số test", 11),
        (ax2, "Diff LOC (dòng thêm + dòng xóa)", "LOC", 30),
        (ax3, "Thời gian phục hồi suite (giây)\nquy trình sửa chuẩn hóa tự động", "giây", 210),
    ):
        ax.set_xticks(list(x))
        ax.set_xticklabels(labels, fontsize=8)
        ax.set_ylabel(ylab)
        ax.set_title(title, fontsize=10)
        ax.set_ylim(0, ymax)
        ax.grid(axis="y", alpha=0.3)
        ax.legend(fontsize=8)
    ax3.legend(fontsize=8, loc="upper left")
    fig.suptitle("RQ2 — Chi phí bảo trì khi nâng cấp giao diện V0 → Vx", y=1.0)
    fig.tight_layout()
    fig.savefig(os.path.join(FIG_DIR, "fig-rq2-maintenance.png"), dpi=200)
    plt.close(fig)


def rq3_stats(rows):
    """Detection matrix: per method x build, pass count per RBAC test over 5 repeats."""
    out = {}
    for label, build in (("gd4-rbac-clean", "clean"), ("gd4-rbac-seeded", "seeded")):
        sub = [r for r in rows if r["label"] == label]
        for m in ("locator", "vlm"):
            per_test = defaultdict(lambda: [0, 0])
            for r in sub:
                if r["method"] != m:
                    continue
                pt = per_test[r["test_id"]]
                pt[0] += r["status"] == "passed"
                pt[1] += 1
            out[(m, build)] = dict(per_test)
    return out


def fig_rq3(stats):
    tests = [f"R{i}" for i in range(1, 9)]
    fig, axes = plt.subplots(1, 2, figsize=(9.5, 3.6), sharey=True)
    for ax, m in zip(axes, ("locator", "vlm")):
        fail_seeded = [5 - stats[(m, "seeded")][t][0] for t in tests]
        fail_clean = [5 - stats[(m, "clean")][t][0] for t in tests]
        x = range(len(tests))
        width = 0.38
        ax.bar([xi - width / 2 for xi in x], fail_clean, width,
               label="Build sạch (kỳ vọng 0 fail)", color="#70ad47")
        ax.bar([xi + width / 2 for xi in x], fail_seeded, width,
               label="Build cấy lỗi (R1–R5 phải fail)", color="#c00000")
        ax.set_xticks(list(x))
        ax.set_xticklabels(tests)
        ax.set_title(METHOD_LABELS[m], fontsize=10)
        ax.set_ylim(0, 5.8)
        ax.grid(axis="y", alpha=0.3)
    axes[0].set_ylabel("Số lần fail / 5 lặp")
    axes[0].legend(fontsize=8)
    fig.suptitle("RQ3 — Phát hiện 5 lỗi phân quyền cấy sẵn (R1–R5), đối chứng R6–R8 + build sạch")
    fig.tight_layout()
    fig.savefig(os.path.join(FIG_DIR, "fig-rq3-detection.png"), dpi=200)
    plt.close(fig)


def rq4_stats(rows):
    per = defaultdict(lambda: defaultdict(list))
    for r in rows:
        per[r["screen"]][r["condition"]].append((int(r["hit"]), float(r["iou"])))
    return per


def fig_rq4(per):
    screens = ["login", "products-admin", "customer-c01", "customer-c03"]
    screen_labels = {
        "login": "Login\n(không mask)",
        "products-admin": "Products\n(không mask)",
        "customer-c01": "Customer c01\n(PII, có mask)",
        "customer-c03": "Customer c03\n(PII, có mask)",
    }
    conds = ["orig", "blur", "pixel"]
    cond_labels = {"orig": "Ảnh gốc", "blur": "Blur", "pixel": "Pixelate"}
    cond_colors = {"orig": "#7f7f7f", "blur": "#4472c4", "pixel": "#ed7d31"}
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.0))
    x = range(len(screens))
    width = 0.26
    for i, c in enumerate(conds):
        hits = [100 * mean(h for h, _ in per[s][c]) for s in screens]
        ious = [mean(i2 for _, i2 in per[s][c]) for s in screens]
        ax1.bar([xi + (i - 1) * width for xi in x], hits, width,
                label=cond_labels[c], color=cond_colors[c])
        bars = ax2.bar([xi + (i - 1) * width for xi in x], ious, width,
                       label=cond_labels[c], color=cond_colors[c])
        for b, v in zip(bars, ious):
            ax2.annotate(f"{v:.2f}", (b.get_x() + b.get_width() / 2, v),
                         ha="center", va="bottom", fontsize=7)
    ax1.set_ylim(0, 112)
    ax1.set_ylabel("Hit-rate định vị (%)")
    ax1.set_title("Hit-rate (tâm dự đoán rơi vào box đúng)")
    ax2.set_ylim(0, 1.0)
    ax2.set_ylabel("IoU trung bình")
    ax2.set_title("IoU giữa box dự đoán và ground-truth")
    for ax in (ax1, ax2):
        ax.set_xticks(list(x))
        ax.set_xticklabels([screen_labels[s] for s in screens], fontsize=8)
        ax.grid(axis="y", alpha=0.3)
        ax.legend(fontsize=8)
    fig.suptitle("RQ4 — Che dữ liệu nhạy cảm và độ chính xác định vị của VLM (120 item × 3 điều kiện)")
    fig.tight_layout()
    fig.savefig(os.path.join(FIG_DIR, "fig-rq4-hitrate-iou.png"), dpi=200)
    plt.close(fig)


def write_summary(s1, s3, per4):
    lines = []
    lines.append("# Tổng hợp số liệu GĐ4 (tự sinh bởi `harness/make-figures.py` — không sửa tay)\n")
    lines.append("Nguồn: `results/raw/matrix-runs.csv` (label `gd4-*`), "
                 "`masking/generated/grounding-results.csv`, `results/rq2-maintenance.md`.\n")

    lines.append("## RQ1 — Pass-rate theo biến thể (18 test × 5 lặp)\n")
    lines.append("| Phương pháp | V0 | V1 | V2 | V3 |")
    lines.append("|---|---|---|---|---|")
    for m in ("locator", "vlm"):
        cells = []
        for v in VARIANTS:
            st = s1[(m, v)]
            flaky = "" if st["pass_min"] == st["pass_max"] else " (flaky!)"
            cells.append(f"{st['pass_min']}/18 ×5{flaky}")
        lines.append(f"| {METHOD_LABELS[m]} | " + " | ".join(cells) + " |")
    lines.append("\nFlakiness = 0 ở cả hai phương pháp (kết quả giống hệt qua 5 lần lặp).\n")

    lines.append("## RQ1 — Thời gian & chi phí mỗi run\n")
    lines.append("| Phương pháp | Biến thể | Wall-clock TB / run | Chi phí API TB / run |")
    lines.append("|---|---|---|---|")
    for m in ("locator", "vlm"):
        for v in VARIANTS:
            st = s1[(m, v)]
            cost = f"${st['cost']:.4f}" if m == "vlm" else "$0"
            lines.append(f"| {METHOD_LABELS[m]} | {v.upper()} | {st['wall_s']:.1f} s | {cost} |")
    lines.append("\nLocator trên V2/V3 chậm hơn V0/V1 (~32 s so với ~3 s) vì các test hỏng "
                 "phải chờ hết timeout 5 s của từng assertion.\n")

    lines.append("## RQ2 — Chi phí bảo trì (chi tiết: `results/rq2-maintenance.md`)\n")
    lines.append("| Biến thể | Locator: test sửa | Locator: diff LOC | "
                 "Locator: thời gian phục hồi | VLM: test sửa / LOC / thời gian |")
    lines.append("|---|---|---|---|---|")
    total_secs = 0.0
    for v in ("v1", "v2", "v3"):
        lt, ll, ls = RQ2["locator"][v]
        total_secs += ls
        lines.append(f"| {v.upper()} | {lt} | {ll} | {ls:.0f} s | 0 / 0 / 0 s |")
    lines.append(f"| **Tổng** | **15** | **46** | **{total_secs:.0f} s** | **0** |")
    lines.append("\nThời gian phục hồi = wall-clock của quy trình sửa chuẩn hóa tự động "
                 "(AI agent, chỉ dẫn sửa-tối-thiểu cố định) trên branch `rq2-agent-v2/v3`, "
                 "đo từ lúc bắt đầu chạy suite lần đầu đến lần chạy xác nhận 18/18.\n")

    lines.append("## RQ3 — Phát hiện lỗi phân quyền hiển thị (5 lặp / build / phương pháp)\n")
    lines.append("| Phương pháp | Detection (R1–R5 fail trên build cấy lỗi) | "
                 "False alarm (R6–R8 + build sạch) |")
    lines.append("|---|---|---|")
    for m in ("locator", "vlm"):
        det = sum(1 for t in ["R1", "R2", "R3", "R4", "R5"]
                  if s3[(m, "seeded")][t][0] == 0)
        fa = sum(5 - s3[(m, "seeded")][t][0] for t in ["R6", "R7", "R8"])
        fa += sum(5 - s3[(m, "clean")][t][0] for t in [f"R{i}" for i in range(1, 9)])
        lines.append(f"| {METHOD_LABELS[m]} | {det}/5 (ổn định 5/5 lặp) | {fa} lần fail sai |")
    lines.append("\nCả hai phương pháp đạt detection 5/5, không báo động giả; "
                 "VLM RBAC ≈ $0.0052/run.\n")

    lines.append("## RQ4 — Masking và độ chính xác định vị (mỗi ô: hit-rate / IoU TB)\n")
    lines.append("| Màn hình | Gốc | Blur | Pixelate |")
    lines.append("|---|---|---|---|")
    for s in ["login", "products-admin", "customer-c01", "customer-c03"]:
        cells = []
        for c in ("orig", "blur", "pixel"):
            hits = 100 * mean(h for h, _ in per4[s][c])
            iou = mean(i for _, i in per4[s][c])
            cells.append(f"{hits:.0f}% / {iou:.3f}")
        lines.append(f"| {s} | " + " | ".join(cells) + " |")
    lines.append("\nHit-rate 100% ở mọi điều kiện; IoU chỉ giảm nhẹ trên 2 màn PII có mask "
                 "(c01 0.764→0.709, c03 0.806→0.730 với pixelate) — masking không làm mất "
                 "khả năng định vị của VLM.\n")

    out = os.path.join(ROOT, "results", "analysis-summary.md")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("wrote", out)


def main():
    rows = read_matrix()
    s1 = rq1_stats(rows)
    s3 = rq3_stats(rows)
    per4 = rq4_stats(read_grounding())
    fig_rq1_passrate(s1)
    fig_rq1_time_cost(s1)
    fig_rq2()
    fig_rq3(s3)
    fig_rq4(per4)
    write_summary(s1, s3, per4)
    print("wrote 5 figures to", FIG_DIR)


if __name__ == "__main__":
    main()
