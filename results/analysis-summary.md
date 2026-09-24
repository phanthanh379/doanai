# Tổng hợp số liệu GĐ4 (tự sinh bởi `harness/make-figures.py` — không sửa tay)

Nguồn: `results/raw/matrix-runs.csv` (label `gd4-*`), `masking/generated/grounding-results.csv`, `results/rq2-maintenance.md`.

## RQ1 — Pass-rate theo biến thể (18 test × 5 lặp)

| Phương pháp | V0 | V1 | V2 | V3 |
|---|---|---|---|---|
| Locator (Playwright) | 18/18 ×5 | 18/18 ×5 | 9/18 ×5 | 12/18 ×5 |
| VLM (Midscene + Qwen3-VL) | 18/18 ×5 | 18/18 ×5 | 18/18 ×5 | 18/18 ×5 |

Flakiness = 0 ở cả hai phương pháp (kết quả giống hệt qua 5 lần lặp).

## RQ1 — Thời gian & chi phí mỗi run

| Phương pháp | Biến thể | Wall-clock TB / run | Chi phí API TB / run |
|---|---|---|---|
| Locator (Playwright) | V0 | 2.7 s | $0 |
| Locator (Playwright) | V1 | 2.7 s | $0 |
| Locator (Playwright) | V2 | 32.1 s | $0 |
| Locator (Playwright) | V3 | 32.1 s | $0 |
| VLM (Midscene + Qwen3-VL) | V0 | 537.5 s | $0.0502 |
| VLM (Midscene + Qwen3-VL) | V1 | 496.9 s | $0.0502 |
| VLM (Midscene + Qwen3-VL) | V2 | 527.6 s | $0.0501 |
| VLM (Midscene + Qwen3-VL) | V3 | 437.4 s | $0.0501 |

Locator trên V2/V3 chậm hơn V0/V1 (~32 s so với ~3 s) vì các test hỏng phải chờ hết timeout 5 s của từng assertion.

## RQ2 — Chi phí bảo trì (chi tiết: `results/rq2-maintenance.md`)

| Biến thể | Locator: test sửa | Locator: diff LOC | Locator: thời gian phục hồi | VLM: test sửa / LOC / thời gian |
|---|---|---|---|---|
| V1 | 0 | 0 | 0 s | 0 / 0 / 0 s |
| V2 | 9 | 24 | 177 s | 0 / 0 / 0 s |
| V3 | 6 | 22 | 137 s | 0 / 0 / 0 s |
| **Tổng** | **15** | **46** | **314 s** | **0** |

Thời gian phục hồi = wall-clock của quy trình sửa chuẩn hóa tự động (AI agent, chỉ dẫn sửa-tối-thiểu cố định) trên branch `rq2-agent-v2/v3`, đo từ lúc bắt đầu chạy suite lần đầu đến lần chạy xác nhận 18/18.

## RQ3 — Phát hiện lỗi phân quyền hiển thị (5 lặp / build / phương pháp)

| Phương pháp | Detection (R1–R5 fail trên build cấy lỗi) | False alarm (R6–R8 + build sạch) |
|---|---|---|
| Locator (Playwright) | 5/5 (ổn định 5/5 lặp) | 0 lần fail sai |
| VLM (Midscene + Qwen3-VL) | 5/5 (ổn định 5/5 lặp) | 0 lần fail sai |

Cả hai phương pháp đạt detection 5/5, không báo động giả; VLM RBAC ≈ $0.0052/run.

## RQ4 — Masking và độ chính xác định vị (mỗi ô: hit-rate / IoU TB)

| Màn hình | Gốc | Blur | Pixelate |
|---|---|---|---|
| login | 100% / 0.876 | 100% / 0.863 | 100% / 0.861 |
| products-admin | 100% / 0.656 | 100% / 0.651 | 100% / 0.652 |
| customer-c01 | 100% / 0.764 | 100% / 0.737 | 100% / 0.709 |
| customer-c03 | 100% / 0.806 | 100% / 0.779 | 100% / 0.730 |

Hit-rate 100% ở mọi điều kiện; IoU chỉ giảm nhẹ trên 2 màn PII có mask (c01 0.764→0.709, c03 0.806→0.730 với pixelate) — masking không làm mất khả năng định vị của VLM.
