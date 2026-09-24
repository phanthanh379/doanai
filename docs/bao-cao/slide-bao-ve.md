# Khung slide bảo vệ (dựng từ báo cáo — bản nháp 09/07/2026)

> Giả định trình bày **15 phút + hỏi đáp** (chuẩn bảo vệ KLTN; chỉnh lại khi khoa
> công bố thời lượng chính thức). 16 slide chính + 6 slide dự phòng (backup) cho
> hỏi đáp. Mỗi slide ghi: nội dung, hình/bảng cần chèn, và ý nói chính (talk
> track) — dựng file PowerPoint/Google Slides theo khung này.
> Quy tắc chung: slide ít chữ, số liệu lớn; mọi con số lấy từ Chương 4.

## Phần chính (16 slide ≈ 15 phút)

### Slide 1 — Bìa (30s)
- Tên đề tài: "Ứng dụng Vision-Language Model trong Kiểm thử Tự động Giao diện
  Người dùng Phần mềm"; SV + MSSV; GVHD; UIT — ĐHQG TP.HCM; ngày bảo vệ.

### Slide 2 — Vấn đề: test GUI giòn (1 phút)
- Trái: đoạn code selector thật (`td:nth-child(8) .icon-btn:nth-child(3)`).
- Phải: cùng giao diện sau khi đảo cột → selector trỏ sai ô.
- Ý nói: kiểm thử GUI script hóa định vị phần tử bằng locator kỹ thuật; giao
  diện đổi trình bày (không đổi chức năng) là test gãy hàng loạt → chi phí bảo
  trì thường trực.

### Slide 3 — Hướng mới: VLM "nhìn" giao diện (1 phút)
- Cặp đối xứng test A3 (trích Chương 3 mục 3.4): locator vs ngôn ngữ tự nhiên.
- Ý nói: VLM đọc screenshot, thao tác theo ngữ nghĩa ("nút thêm sản phẩm") —
  về nguyên tắc miễn nhiễm thay đổi trình bày. Nhưng: hứa hẹn này đáng giá bao
  nhiêu, đổi bằng gì? → cần bằng chứng định lượng.

### Slide 4 — Khoảng trống nghiên cứu (1 phút)
- 3 gap (rút gọn 1 dòng/gap): ① chưa có so sánh đối chứng locator-vs-VLM trên
  cùng test case + biến thể giao diện kiểm soát; ② chưa ai đo chi phí bảo trì
  theo cặp; ③ bảo mật bỏ ngỏ (PII lên API; VLM kiểm thử phân quyền).
- Nguồn: khảo sát 15 công trình 2023–2025 (Chương 2).

### Slide 5 — 4 câu hỏi nghiên cứu (45s)
- RQ1 robustness · RQ2 chi phí bảo trì · RQ3 phân quyền hiển thị · RQ4 masking.
- Mapping gap → RQ bằng mũi tên (gap1→RQ1, gap2→RQ2, gap3→RQ3+RQ4).

### Slide 6 — Thiết kế thực nghiệm tổng thể (1.5 phút)
- [HÌNH 3.1 — sơ đồ pipeline: App V0–V3 → 2 suite song song → harness ma trận
  2×4×5 → CSV → phân tích].
- Điểm nhấn (bullet lớn): đối xứng 1–1 (18 test, cùng viewport, cùng app);
  model ghim `qwen3-vl-235b-a22b-instruct`, temperature 0, cache tắt; mọi số
  liệu ghi tự động.

### Slide 7 — App mẫu + 4 biến thể kiểm soát (1 phút)
- [HÌNH 3.3 — 4 screenshot V0/V1/V2/V3 cạnh nhau, chú thích 1 dòng/biến thể].
- Ý nói: biến thể chỉ đổi trình bày qua 1 file config — V1 đổi theme (vô hại
  với DOM), V2 đổi cấu trúc (đánh vào nth-child), V3 đổi nhãn (đánh vào XPath
  text); phủ 3 nguyên nhân gãy test kinh điển.

### Slide 8 — Kết quả RQ1: độ bền vững (1.5 phút) ★slide quan trọng nhất
- [Hình 4.1 — pass-rate theo biến thể].
- Số lớn: **VLM 18/18 cả 4 biến thể — locator rơi còn 9/18 (V2), 12/18 (V3)**.
- Dòng phụ: flakiness = 0 ở cả hai (5 lặp, temp 0) — VLM tất định được.

### Slide 9 — Giá phải trả: thời gian & tiền (1 phút)
- [Hình 4.2 — wall-clock (log) + cost/run].
- Số lớn: **~8 phút & $0.05/run (VLM) vs ~3 giây & $0 (locator)**.
- Ý nói: khác biệt thật nằm ở thời gian, không phải tiền ($1.5 cho toàn bộ
  thực nghiệm).

### Slide 10 — Kết quả RQ2: chi phí bảo trì (1.5 phút)
- [Hình 4.3 — 3 panel: test sửa / diff LOC / thời gian phục hồi].
- Số lớn: **locator 15 test / 46 LOC / 314s để phục hồi — VLM 0/0/0**.
- Dòng phụ: đo bằng quy trình sửa chuẩn hóa tự động, 2 lần chạy độc lập cho
  diff trùng từng dòng (tái lập được).

### Slide 11 — Kết quả RQ3: kiểm thử phân quyền (1 phút)
- [Hình 4.4 — detection matrix].
- Số lớn: **cả hai phương pháp bắt 5/5 lỗi cấy, 0 báo động giả** (×5 lặp);
  VLM $0.005/run.
- Ý nói: VLM ngang baseline về độ chính xác, cộng thêm kịch bản NL kế thừa độ
  bền vững của RQ1.

### Slide 12 — Kết quả RQ4: masking PII (1 phút)
- [Hình 4.5 — hit-rate + IoU theo điều kiện] + 1 cặp ảnh gốc/mask từ
  `masking/screens/`.
- Số lớn: **hit-rate 100% cả 3 điều kiện**; IoU chỉ giảm nhẹ tại đúng vùng che.
- Ý nói: che PII trước khi gửi API mà không mất khả năng định vị.

### Slide 13 — Trade-off trung tâm & hàm ý thực tiễn (1 phút)
- Bảng 2 cột "locator vs VLM": bảo trì khi UI đổi ↔ chi phí mỗi lần chạy.
- Hàm ý: hai phương pháp bổ trợ — locator cho CI dày trên UI ổn định; VLM cho
  lớp regression theo ý định, giai đoạn UI biến động (CI hai tầng).

### Slide 14 — Đóng góp (45s)
- 5 contribution, mỗi cái 1 dòng + nơi ở trong repo (app+variants; pipeline đo
  3 trục; bộ số liệu RQ1–2; masking+trade-off; RBAC bằng VLM).
- Footer: repo GitHub public + tái lập bằng 1 lệnh.

### Slide 15 — Hạn chế & hướng phát triển (45s)
- Trái (hạn chế, 3 dòng): 1 app mẫu/1 model/biến thể một chiều; viewport-bound;
  baseline chủ ý giòn + thời gian bảo trì đo trên quy trình agent.
- Phải (hướng phát triển, 3 dòng): desktop/mobile + trang dài (cuộn); thêm
  model + baseline best-practice; masking tự động + CI hai tầng.

### Slide 16 — Kết luận + cảm ơn (30s)
- 1 câu kết: "VLM loại bỏ tính giòn trước thay đổi trình bày (100% pass, 0 bảo
  trì) — trả giá bằng thời gian chạy, không phải tiền hay độ ổn định."
- Cảm ơn hội đồng; sẵn sàng demo.

## Slide dự phòng (backup — chỉ mở khi được hỏi)

### B1 — Phát hiện: VLM perception là viewport-bound
- Câu chuyện đếm 9/12 dòng; locator đọc DOM vs VLM đọc screenshot; cách xử lý
  viewport 1280×1100; hệ quả cho tính khái quát. (Trả lời câu hỏi "VLM có nhìn
  thấy cả trang không?", "sao chọn viewport đó?")

### B2 — Phát hiện: quy ước tọa độ Qwen 0–1000
- Attempt 1 của RQ4 340/360 "lỗi" → chẩn đoán harness chấm sai, không phải
  model sai; bài học "lỗi model vs lỗi harness". (Câu hỏi về độ tin cậy phép đo.)

### B3 — Vì sao Qwen3-VL, không phải GPT-4o/Claude?
- Bảng loại trừ từ `pilot-model-cost.md` mục 1 (docs Midscene: GPT kém UI
  grounding, Claude không hỗ trợ); giá ghim; fallback open-weight self-host.

### B4 — Giao thức RQ2 chi tiết
- Chỉ dẫn chuẩn hóa (Phụ lục E), mốc T0/T1/T2, vì sao agent thay vì người bấm
  giờ (chống thiên lệch + tái lập; hạn chế khai báo ở Threats). (Câu hỏi "AI sửa
  thì còn ý nghĩa gì?" — trả lời: 2 chỉ số chính bất biến theo người sửa, đã
  kiểm chứng 2 lần độc lập trùng diff.)

### B5 — Baseline có "cố tình yếu" không?
- Lựa chọn thiết kế worst-case + lý do (nhóm D không có nhãn ngữ nghĩa →
  nth-child là lựa chọn duy nhất); getByRole giảm rủi ro V3 nhưng không cứu
  nhóm D; hướng phát triển: baseline best-practice làm mốc thứ hai.

### B6 — Chi phí chi tiết & ngân sách
- Bảng token/cost từng hạng mục (RQ1 ~93 call/$0.050/run; RBAC $0.0052; RQ4
  $0.112/360 call; tổng ≈ $1.5/$50); cách harness đọc token thật từ log.

## Ghi chú dựng slide

- Thời lượng cộng dồn phần chính ≈ 14.5 phút — vừa khung 15 phút; nếu khoa cho
  20 phút, giãn slide 8/10 và thêm demo trực tiếp 2 phút (chạy 1 test VLM trên
  V2 cho hội đồng xem).
- Demo dự phòng khi không có mạng/API: video quay sẵn 1 run VLM trên V2 +
  report HTML của Midscene (có screenshot từng bước) — chuẩn bị trước ngày bảo vệ.
- Mọi hình lấy từ `results/figures/` (đã 200 dpi); screenshot app từ
  `results/screenshots-app-v1/` và `masking/screens/`.
- Định vị baseline đã chốt 09/07 ("worst-case", slide dự phòng B5 khớp mục
  4.7-(3)); chỉ cập nhật slide 15 nếu sau buổi gặp GVHD yêu cầu thêm baseline
  best-practice.
