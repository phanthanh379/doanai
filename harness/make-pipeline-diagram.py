#!/usr/bin/env python3
"""Draw Figure 3.1 — the overall experimental pipeline diagram.

Output: results/figures/fig-design-pipeline.png
Static diagram (no data inputs). Run from the repo root:
python3 harness/make-pipeline-diagram.py
"""

import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "results", "figures", "fig-design-pipeline.png")

BLUE = "#4472c4"
ORANGE = "#ed7d31"
GREEN = "#70ad47"
GREY = "#7f7f7f"
DARKGREY = "#595959"

fig, ax = plt.subplots(figsize=(12.5, 6.2))
ax.set_xlim(0, 125)
ax.set_ylim(0, 62)
ax.axis("off")


def box(x, y, w, h, title, lines, color, title_size=11, line_size=9):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.6",
                                facecolor="white", edgecolor=color, linewidth=2))
    ax.text(x + w / 2, y + h - 3.2, title, ha="center", va="center",
            fontsize=title_size, fontweight="bold", color=color)
    for i, ln in enumerate(lines):
        ax.text(x + w / 2, y + h - 7.5 - i * 3.6, ln, ha="center", va="center",
                fontsize=line_size, color=DARKGREY)


def arrow(x1, y1, x2, y2, label=None, color=GREY, ls="-"):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>",
                                 mutation_scale=16, linewidth=1.8,
                                 color=color, linestyle=ls))
    if label:
        ax.text((x1 + x2) / 2, (y1 + y2) / 2 + 1.6, label, ha="center",
                fontsize=8.5, color=DARKGREY, style="italic")


# Row 1 — main flow
box(1, 36, 22, 20, "Ứng dụng mẫu\n", [
    "\"Mini Shop Manager\"", "freeze tag app-v1.0",
    "4 biến thể V0–V3", "(variants.ts, chỉ đổi trình bày)"], DARKGREY)

box(28, 46, 24, 13, "Bộ test locator", [
    "Playwright — 18 test", "CSS/XPath cố định"], BLUE, title_size=10.5)
box(28, 30, 24, 13, "Bộ test VLM", [
    "Midscene.js + Qwen3-VL", "18 test ngôn ngữ tự nhiên"], ORANGE, title_size=10.5)

box(58, 36, 22, 20, "Harness ma trận", [
    "run-matrix.mjs", "{2 phương pháp} ×", "{V0..V3} × {5 lặp}",
    "temp=0, cache tắt"], DARKGREY)

box(86, 36, 16, 20, "Số liệu thô", [
    "matrix-runs.csv", "pass/fail, thời gian,", "token, chi phí", "(ghi tự động)"], GREEN)

box(107, 36, 17, 20, "Phân tích", [
    "make-figures.py", "5 hình + bảng", "tổng hợp", "(tái lập 1 lệnh)"], GREEN)

# Row 2 — extension blocks
box(28, 4, 26, 16, "RQ3 — RBAC", [
    "8 kịch bản × 2 phương pháp", "build sạch vs build cấy 5 lỗi",
    "(branch rq3-seeded-bugs)"], BLUE, title_size=10.5)
box(60, 4, 30, 16, "RQ4 — Masking", [
    "capture → blur/pixelate PII", "grounding benchmark 360 call",
    "hit-rate + IoU"], ORANGE, title_size=10.5)

# Arrows — main flow
arrow(23.6, 49, 27.4, 51.5)
arrow(23.6, 43, 27.4, 37.5)
arrow(52.6, 52.5, 57.4, 49)
arrow(52.6, 36.5, 57.4, 42)
ax.text(52.5, 57.2, "thực thi", ha="right", fontsize=8.5, color=DARKGREY, style="italic")
arrow(80.6, 46, 85.4, 46, label="ghi")
arrow(102.6, 46, 106.4, 46)

# Extension arrows into the raw-data store (routed above the RQ4 box)
arrow(41, 20.9, 90, 35.2)
arrow(76, 20.9, 93, 35.2)
ax.text(64, 30.5, "qua harness / benchmark riêng", ha="center",
        fontsize=8.5, color=DARKGREY, style="italic")

# RQ annotations on the main flow
ax.text(40, 61, "RQ1: pass-rate + flakiness   ·   RQ2: sửa tối thiểu trên branch riêng (test sửa / diff LOC / thời gian phục hồi)",
        fontsize=9.5, color=DARKGREY, ha="left")

fig.tight_layout()
fig.savefig(OUT, dpi=200, bbox_inches="tight")
print("wrote", OUT)
