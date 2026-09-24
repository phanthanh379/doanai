# Khung báo cáo đồ án (GĐ5) — file điều phối

> Tạo 09/07/2026. Đây là file điều phối GĐ5: cấu trúc tổng thể, trạng thái từng
> chương, quy ước viết và ánh xạ nguồn liệu. Mỗi chương một file trong thư mục này;
> khi hoàn thiện sẽ ghép vào template .docx của khoa (UIT) theo đúng thứ tự.

## Cấu trúc tổng thể

| Chương | File | Nội dung chính | Trạng thái |
|---|---|---|---|
| Mở đầu (bìa, lời cảm ơn, tóm tắt, mục lục) | (làm trong template .docx) | Tóm tắt ~1 trang: vấn đề → phương pháp → 4 kết quả chính | ⬜ chưa |
| 1. Giới thiệu | `chuong-1-gioi-thieu.md` | Bối cảnh, 3 gap, 4 RQ, mục tiêu/phạm vi, 5 đóng góp | ✅ nháp đầy đủ |
| 2. Cơ sở lý thuyết & khảo sát | `chuong-2-khao-sat.md` | GUI testing, VLM, taxonomy 15 bài + Bảng 2.1, định vị đồ án | ✅ nháp đầy đủ (⚠️ đối chiếu số liệu 4 bài ⭐ khi đọc full-text) |
| 3. Phương pháp & thiết kế thực nghiệm | `chuong-3-phuong-phap.md` | App + biến thể, 2 suite, harness, thiết kế 4 RQ; Hình 3.1–3.3 nhúng trong docx | ✅ nháp đầy đủ |
| 4. Kết quả & thảo luận | `chuong-4-ket-qua.md` | Kết quả 4 RQ, trade-off, threats | ✅ nháp đầy đủ — nội dung chốt, hết TODO |
| 5. Kết luận & hướng phát triển | `chuong-5-ket-luan.md` | Trả lời RQ, 5 contribution, hạn chế, hướng phát triển | ✅ nháp đầy đủ |
| Tài liệu tham khảo | `tai-lieu-tham-khao.md` | [1]–[15] + công cụ/model/OWASP/repo | ✅ nháp (định dạng lại theo khoa) |
| Phụ lục | `phu-luc.md` | A tái lập; B 18 test case; C RBAC + 5 lỗi cấy; D số liệu; E chỉ dẫn agent RQ2 | ✅ nháp đầy đủ |

Trạng thái: ✅ nháp đầy đủ · 🟨 khung chi tiết (có đủ ý + nguồn, cần viết thành văn) · ⬜ chưa bắt đầu.

## Quy ước viết

- **Tiếng Việt**, thuật ngữ kỹ thuật giữ tiếng Anh kèm giải thích lần đầu xuất hiện
  (ví dụ: "độ bền vững (robustness)"). Thống nhất: *locator-based* = "dựa trên bộ định vị",
  *vision-based/VLM-based* = "dựa trên thị giác/VLM" — sau lần đầu dùng thẳng tiếng Anh.
- Mọi con số trong Chương 4 phải trích từ file trong `results/` hoặc
  `masking/generated/` (tái lập bằng `python3 harness/make-figures.py`) — không gõ tay.
- Hình: dùng 5 hình trong `results/figures/`; đánh số Hình 4.1–4.5 theo thứ tự RQ.
- Trích dẫn: đánh số [1]–[15] theo thứ tự trong `docs/notes-papers.md`; công cụ
  (Playwright, Midscene.js, Qwen3-VL) và OWASP trích riêng ở cuối danh mục.
- Mỗi chương mở đầu bằng 1 đoạn dẫn ("chương này trình bày...") và kết bằng 1 đoạn
  chuyển tiếp sang chương sau.

## Ánh xạ nguồn liệu (mở rộng từ `KeHoach_DoAn.md` mục 5)

| Chương | Nguồn chính |
|---|---|
| 1 | `NghienCuu Step1-4...pdf` (Step 1, 3, 4); đề cương .docx (bối cảnh, mục tiêu, phạm vi) |
| 2 | `docs/notes-papers.md` (15 bài, đã có Problem/Method/Result/Limitation + "liên quan đồ án") |
| 3 | `KeHoach_DoAn.md` mục 2–3; `app/src/variants.ts`; `docs/pilot-model-cost.md` (mục 1–6); cấu trúc repo |
| 4 | `results/analysis-summary.md`, `results/rq2-maintenance.md`, `results/figures/`, `docs/pilot-model-cost.md` mục 7–8 |
| 5 | Step 4 (5 contribution); Chương 4 mục 4.6–4.7; đề cương (hướng phát triển desktop) |

## Kế hoạch phụ lục

- **Phụ lục A — Hướng dẫn tái lập thực nghiệm:** rút gọn từ `docs/setup-new-machine.md`
  mục 3 + các lệnh trong `CLAUDE.md` (clone, cài đặt, chạy suite, chạy ma trận, sinh hình).
- **Phụ lục B — Danh sách 18 test case:** bảng ID / nhóm / mô tả / phiên bản locator /
  phiên bản ngôn ngữ tự nhiên (trích từ `tests-locator/tests/` và `tests-vlm/`).
- **Phụ lục C — 8 kịch bản RBAC + 5 lỗi cấy (R1–R5):** từ suite rbac + branch `rq3-seeded-bugs`.
- **Phụ lục D — Bảng số liệu đầy đủ:** `results/analysis-summary.md` (tự sinh).
- **Phụ lục E — Prompt/chỉ dẫn chuẩn hóa của quy trình bảo trì RQ2** (từ
  `results/rq2-maintenance.md` mục 4) — minh bạch hóa quy trình agent.

## Trạng thái viết (cập nhật 09/07 tối): TOÀN BỘ NHÁP XONG

Cả 5 chương + phụ lục + tài liệu tham khảo đã có bản nháp đầy đủ bằng văn xuôi.
Việc còn lại để thành bản nộp:

1. **Sinh viên đọc — duyệt — sửa giọng văn** từng chương (thứ tự đọc đề xuất:
   3 → 4 → 1 → 2 → 5); đặc biệt Chương 2: đối chiếu số liệu in đậm với full-text
   4 bài ⭐ trước khi giữ nguyên.
2. ~~Chỗ đánh dấu nội dung~~ — đã hết: TODO 4.7-(3) chốt phương án "worst-case
   baseline" ngày 09/07 (câu chữ khóa trong Chương 4; mục 3 của
   `docs/gvhd-trao-doi.md` hạ xuống dạng thông báo). Hình 3.1 =
   `fig-design-pipeline.png`; Bảng 2.1 trong Chương 2; mọi hình nhúng tự động
   khi chạy `make-report-docx.py`.
3. Ghép vào template .docx của khoa: đánh số hình/bảng, mục lục, tóm tắt ~1 trang,
   định dạng lại tài liệu tham khảo theo quy định.
4. Dựng file trình chiếu từ `slide-bao-ve.md` (khung 16 slide + 6 backup đã có,
   kèm talk track/thời lượng) + chuẩn bị demo và video demo dự phòng.
5. Chuyển repo public trước khi bảo vệ; xoay API key sau khi xong toàn bộ.

## Việc chờ bên ngoài

- Template báo cáo chính thức của khoa + quy định trích dẫn.
- Buổi gặp GVHD (`docs/gvhd-trao-doi.md`) — toàn bộ là trình bày/thông báo,
  không còn quyết định nào chặn nội dung báo cáo.
