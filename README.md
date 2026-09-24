# VLM for GUI Testing Automation — Đồ án tốt nghiệp

So sánh thực nghiệm định lượng giữa kiểm thử GUI **locator-based** (Playwright) và **VLM-based** (Midscene.js) trên cùng một ứng dụng web với các biến thể giao diện có kiểm soát. Đo 3 trục: độ bền vững (robustness), chi phí bảo trì (maintenance cost), chi phí vận hành (thời gian/token). Mở rộng: masking dữ liệu nhạy cảm trên screenshot (RQ4) và kiểm thử phân quyền hiển thị UI (RQ3).

## Cấu trúc

| Thư mục | Nội dung |
|---------|----------|
| `app/` | Ứng dụng web thực nghiệm (React + Vite) + biến thể giao diện V0–V3 |
| `tests-locator/` | Bộ test baseline Playwright (locator-based) |
| `tests-vlm/` | Bộ test Midscene.js (ngôn ngữ tự nhiên) + pilot |
| `masking/` | Tiền xử lý ảnh che PII + grounding benchmark (RQ4) |
| `harness/` | Runner ma trận thực nghiệm, thu thập CSV |
| `results/` | Số liệu, biểu đồ |

## Chạy nhanh

```bash
# App thực nghiệm (đăng nhập demo: admin/admin123, staff/staff123)
cd app && npm install && npm run dev   # http://localhost:5173
# Biến thể giao diện: thêm ?variant=v1|v2|v3 vào URL (mặc định v0)

# Bộ test baseline (tự khởi động app qua webServer của Playwright)
cd tests-locator && npm install && npx playwright test
# Chạy trên biến thể khác: APP_VARIANT=v2 npx playwright test

# Pilot VLM (cần .env — xem tests-vlm/.env.example)
cd tests-vlm && npm install && npm run pilot
# Suite VLM đầy đủ (18 test NL + 8 RBAC):
cd tests-vlm && npx playwright test tests

# Ma trận thực nghiệm → results/raw/matrix-runs.csv
cd harness && node run-matrix.mjs --methods locator,vlm --variants v0,v1,v2,v3 --repeats 5

# RQ4: chụp màn hình + tạo bản che PII + benchmark grounding
cd masking && npm install && npm run capture && npm run mask && npm run benchmark
```

## RQ3 — seeded bugs

Branch `rq3-seeded-bugs` chứa 5 lỗi phân quyền cố ý (staff thấy nút Delete, cột Cost, mục Settings, form Settings, trường Cost trong form). Đo tỉ lệ phát hiện: checkout branch và chạy `npx playwright test tests/rbac` ở từng suite — trên build sạch 8/8 pass; trên build lỗi, mỗi test fail = một lỗi được phát hiện (kỳ vọng R1–R5 fail).

## Ứng dụng thực nghiệm & bộ test baseline

- **App "Mini Shop Manager"**: form nhập liệu có validation, danh sách + tìm kiếm/lọc, CRUD sản phẩm, thành phần tùy biến không nhãn ngữ nghĩa (icon-button SVG không aria-label, star rating, biểu đồ canvas), login 2 vai trò (Admin/Staff — RQ3), trang hồ sơ khách chứa PII giả (RQ4). Dữ liệu mock + localStorage, không có backend.
- **4 biến thể giao diện có kiểm soát** (chỉ đổi trình bày, không đổi logic): V0 gốc · V1 dark theme + đổi màu nhấn · V2 topbar + đảo thứ tự cột/nút · V3 đổi bộ icon + đổi nhãn nút/placeholder.
- **18 test case baseline** chia 4 nhóm (A form ×5, B tìm kiếm/lọc ×4, C CRUD ×4, D thành phần tùy biến ×5) + 4 smoke test biến thể. Selector cố ý dùng CSS/XPath cấu trúc (nth-child, text khớp chính xác) — xem `KeHoach_DoAn.md` §2.

Kế hoạch chi tiết: `KeHoach_DoAn.md`. Yêu cầu: Node.js >= 20 (đã kiểm chứng trên Node 24 LTS; Playwright 1.61 không chạy với Node < 18.19).

**Setup máy mới + trạng thái hiện tại + việc tiếp theo: xem `docs/setup-new-machine.md`.**
