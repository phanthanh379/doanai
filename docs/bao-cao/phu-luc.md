# Phụ lục (BẢN NHÁP ĐẦY ĐỦ)

## Phụ lục A — Hướng dẫn tái lập thực nghiệm

Yêu cầu: Node ≥ 20 (thực nghiệm dùng Node 24 LTS), Python 3 (chỉ cho phần vẽ
biểu đồ), API key OpenRouter (chỉ cho phần chạy VLM).

```bash
# 1. Lấy mã nguồn
git clone https://github.com/[TAI-KHOAN-GITHUB]/doanai.git && cd doanai

# 2. Cài đặt (4 package độc lập, không có root package.json)
(cd app && npm install)
(cd tests-locator && npm install && npx playwright install chromium)
(cd tests-vlm && npm install)
(cd masking && npm install)

# 3. Kiểm tra môi trường KHÔNG cần API key: baseline phải 30/30
cd tests-locator && npx playwright test

# 4. Cấu hình VLM: tạo tests-vlm/.env từ .env.example
#    (MIDSCENE_MODEL_API_KEY=...; model ghim qwen/qwen3-vl-235b-a22b-instruct;
#     temperature=0; KHÔNG bật MIDSCENE_CACHE)

# 5. Ma trận chính thức RQ1 (2 phương pháp × 4 biến thể × 5 lặp)
cd harness && node run-matrix.mjs --methods locator,vlm \
  --variants v0,v1,v2,v3 --repeats 5        # → results/raw/matrix-runs.csv

# 6. RQ3: suite rbac trên build sạch (master) và build lỗi (rq3-seeded-bugs)
node run-matrix.mjs --methods locator,vlm --variants v0 --repeats 5 --suite rbac
git checkout rq3-seeded-bugs   # rồi chạy lại lệnh trên

# 7. RQ4: capture → mask → benchmark (cần app đang chạy + API key)
cd ../masking && npm run capture && npm run mask && npm run benchmark

# 8. Sinh toàn bộ hình + bảng của Chương 4
python3 -m pip install matplotlib && python3 harness/make-figures.py
```

Chạy test trên biến thể đơn lẻ: `APP_VARIANT=v2 npx playwright test` (suite tự
khởi động app qua webServer). Lưu ý đo lường: không bật cache Midscene; giữ
temperature 0; model ID ghim; viewport 1280×1100 đã cố định trong config hai suite.

## Phụ lục B — Danh sách 18 test case (2 phiên bản đối xứng)

| ID | Nhóm | Kịch bản | Neo locator tiêu biểu | Diễn đạt VLM tiêu biểu |
|---|---|---|---|---|
| A1 | Form | Đăng nhập đúng → vào danh sách sản phẩm | `#username`, `.login-card button[type=submit]` | "the username field of the sign-in form" |
| A2 | Form | Đăng nhập sai → hiện thông báo lỗi | `.login-error` | "an error message saying the username or password is invalid" |
| A3 | Form | Thêm sản phẩm hợp lệ → thêm dòng mới | `//button[text()='Add product']`, `label:nth-of-type(n) input` | "the primary button in the toolbar that adds a new product" |
| A4 | Form | Submit form rỗng → 4 lỗi validation | `.modal .field-error` | "validation messages for required fields are visible" |
| A5 | Form | Giá âm → lỗi trường giá, không tạo dòng | `.modal .field-error` | "an error saying the price must be greater than zero" |
| B1 | List | Tìm theo tên → còn đúng 1 dòng | `.toolbar > input.search-input`, `td:nth-child(1)` | "type ... into the search box; the only row is ..." |
| B2 | List | Lọc theo danh mục → 3 dòng + chip lọc | `select.category-filter`, `.filter-chips` | "choose Snack in the category filter" |
| B3 | List | Lọc theo số sao tối thiểu (widget sao) | `.toolbar > span.stars > span:nth-child(4)` | "the 4th star of the rating filter in the toolbar" |
| B4 | List | Tìm không có kết quả → empty state; xóa → 12 dòng | `tr.empty-row td` | "an empty-state message ...; clear the search box" |
| C1 | CRUD | Tạo sản phẩm → còn sau reload (persistence) | như A3 + `td:nth-child(2)` (SKU) | như A3 + "the SKU cell of the last row reads ..." |
| C2 | CRUD | Sửa sản phẩm → dòng cập nhật | `.icon-btn:nth-child(2)` (edit) | "the edit (pencil) icon of the second product row" |
| C3 | CRUD | Xóa + xác nhận → mất dòng | `.icon-btn:nth-child(3)`, `.modal.confirm .btn-danger` | "the delete (trash) icon ...; confirm the deletion" |
| C4 | CRUD | Xóa nhưng Cancel → giữ dòng | `//button[text()='Cancel']` | "dismiss the confirmation dialog" |
| D1 | Custom | Icon xem → mở chi tiết chỉ-đọc | `.icon-btn:nth-child(1)` (eye) | "the view (eye) icon of the first product row" |
| D2 | Custom | Widget sao trong form đặt rating 5 | `.form-rating .stars > span:nth-child(5)` | "the 5th star of the rating input inside the dialog" |
| D3 | Custom | Click cột Snack trên biểu đồ canvas → lọc bảng | click tọa độ cố định trên `canvas` | "the bar of the Snack category on the chart" |
| D4 | Custom | Click hàng khách (div thuần) → hồ sơ PII | `.customer-list > div:nth-child(3)` | "the customer row named Le Minh Chau" |
| D5 | Custom | Staff không thấy icon xóa / cột Cost / Settings | đếm `th`, `.icon-btn`, `.nav-links > a` | "there is no delete icon / Cost column / Settings entry" |

(Neo/diễn đạt trên là ví dụ rút gọn; toàn văn tại `tests-locator/tests/` và
`tests-vlm/tests/` — hai bộ ánh xạ 1–1 theo ID.)

## Phụ lục C — Kịch bản RBAC và 5 lỗi phân quyền cấy sẵn

**8 kịch bản (chạy bằng cả hai phương pháp):**

| ID | Vai trò | Khẳng định |
|---|---|---|
| R1 | staff | Không thấy icon xóa trong hàng sản phẩm (chỉ view + edit) |
| R2 | staff | Không thấy cột Cost trong bảng |
| R3 | staff | Không thấy mục Settings trên thanh điều hướng |
| R4 | staff | Truy cập thẳng `/settings` phải nhận "403 — Access denied" |
| R5 | staff | Form sửa sản phẩm không chứa trường Cost |
| R6 | admin | Thấy đủ 3 icon hành động (đối chứng) |
| R7 | admin | Thấy cột Cost (đối chứng) |
| R8 | admin | Mở được Settings và lưu thành công (đối chứng) |

**5 lỗi cấy trên nhánh `rq3-seeded-bugs`** (mỗi lỗi bỏ đúng một kiểm tra vai
trò; nhánh không bao giờ merge vào master):

| Lỗi | Vị trí | Nội dung | Bị bắt bởi |
|---|---|---|---|
| #1 | `ProductsPage.tsx` | Bỏ lọc vai trò ở cụm icon hành động → staff thấy icon xóa | R1 |
| #2 | `ProductsPage.tsx` | Bỏ kiểm tra vai trò cột bảng → staff thấy cột Cost | R2 |
| #3 | `Layout.tsx` | Bỏ lọc `adminOnly` ở menu → staff thấy mục Settings | R3 |
| #4 | `SettingsPage.tsx` | Bỏ trang chặn 403 → staff mở được Settings | R4 |
| #5 | `modals.tsx` | Bỏ kiểm tra `isAdmin` trong form → staff thấy trường Cost | R5 |

Kỳ vọng thiết kế: trên build lỗi, R1–R5 fail (fail = phát hiện lỗi) và R6–R8
pass; trên build sạch cả 8 pass. Kết quả thực tế (Chương 4): đúng kỳ vọng
100% ở cả hai phương pháp, 5/5 lần lặp.

## Phụ lục D — Bảng số liệu đầy đủ

Toàn bộ bảng dưới đây được sinh tự động tại `results/analysis-summary.md`
(lệnh: `python3 harness/make-figures.py`, không sửa tay); dữ liệu thô từng dòng
test tại `results/raw/matrix-runs.csv` (cột `label` phân biệt đợt chạy:
`gd4-main`, `gd4-rbac-clean`, `gd4-rbac-seeded`) và
`masking/generated/grounding-results.csv`.

### D.1. RQ1 — Pass-rate theo biến thể (18 test × 5 lặp)

| Phương pháp | V0 | V1 | V2 | V3 |
|---|---|---|---|---|
| Locator (Playwright) | 18/18 ×5 | 18/18 ×5 | 9/18 ×5 | 12/18 ×5 |
| VLM (Midscene + Qwen3-VL) | 18/18 ×5 | 18/18 ×5 | 18/18 ×5 | 18/18 ×5 |

Flakiness = 0 ở cả hai phương pháp (kết quả giống hệt qua 5 lần lặp).

### D.2. RQ1 — Thời gian & chi phí mỗi run

| Phương pháp | Biến thể | Wall-clock TB / run | Chi phí API TB / run |
|---|---|---|---|
| Locator (Playwright) | V0 | 2,7 s | $0 |
| Locator (Playwright) | V1 | 2,7 s | $0 |
| Locator (Playwright) | V2 | 32,1 s | $0 |
| Locator (Playwright) | V3 | 32,1 s | $0 |
| VLM (Midscene + Qwen3-VL) | V0 | 537,5 s | $0,0502 |
| VLM (Midscene + Qwen3-VL) | V1 | 496,9 s | $0,0502 |
| VLM (Midscene + Qwen3-VL) | V2 | 527,6 s | $0,0501 |
| VLM (Midscene + Qwen3-VL) | V3 | 437,4 s | $0,0501 |

Locator trên V2/V3 chậm hơn V0/V1 (~32 s so với ~3 s) vì các test hỏng phải chờ
hết timeout 5 s của từng assertion.

### D.3. RQ2 — Chi phí bảo trì (chi tiết từng test case: `results/rq2-maintenance.md`)

| Biến thể | Locator: test sửa | Locator: diff LOC | Locator: thời gian phục hồi | VLM: test sửa / LOC / thời gian |
|---|---|---|---|---|
| V1 | 0 | 0 | 0 s | 0 / 0 / 0 s |
| V2 | 9 | 24 | 177 s | 0 / 0 / 0 s |
| V3 | 6 | 22 | 137 s | 0 / 0 / 0 s |
| **Tổng** | **15** | **46** | **314 s** | **0** |

Thời gian phục hồi = wall-clock của quy trình sửa chuẩn hóa tự động (AI agent,
chỉ dẫn sửa-tối-thiểu cố định) trên branch `rq2-agent-v2/v3`, đo từ lúc bắt đầu
chạy suite lần đầu đến lần chạy xác nhận 18/18.

### D.4. RQ3 — Phát hiện lỗi phân quyền hiển thị (5 lặp / build / phương pháp)

| Phương pháp | Detection (R1–R5 fail trên build cấy lỗi) | False alarm (R6–R8 + build sạch) |
|---|---|---|
| Locator (Playwright) | 5/5 (ổn định 5/5 lặp) | 0 lần fail sai |
| VLM (Midscene + Qwen3-VL) | 5/5 (ổn định 5/5 lặp) | 0 lần fail sai |

Cả hai phương pháp đạt detection 5/5, không báo động giả; VLM RBAC ≈
$0,0052/run.

### D.5. RQ4 — Masking và độ chính xác định vị (mỗi ô: hit-rate / IoU TB)

| Màn hình | Gốc | Blur | Pixelate |
|---|---|---|---|
| login | 100% / 0,876 | 100% / 0,863 | 100% / 0,861 |
| products-admin | 100% / 0,656 | 100% / 0,651 | 100% / 0,652 |
| customer-c01 | 100% / 0,764 | 100% / 0,737 | 100% / 0,709 |
| customer-c03 | 100% / 0,806 | 100% / 0,779 | 100% / 0,730 |

Hit-rate 100% ở mọi điều kiện; IoU chỉ giảm nhẹ trên 2 màn PII có mask (c01
0,764→0,709, c03 0,806→0,730 với pixelate) — masking không làm mất khả năng
định vị của VLM.

### D.6. Số liệu tái kiểm chứng độc lập (19/09/2026)

Năm bảng D.1–D.5 ở trên là số liệu chính thức từ lần đo 09/07/2026. Số liệu tái
kiểm chứng độc lập (chạy lại RQ1–RQ4, phát hiện 1 lỗi VLM mới ở V3/RQ1 và độ
nhạy diff-LOC ở RQ2) được trình bày đầy đủ tại Chương 4 dưới dạng Bảng 4.1–4.6
và Hình 4.6–4.9, không lặp lại ở đây để tránh trùng lặp; xem thêm các đoạn "Tái
kiểm chứng độc lập" tại mục 4.2–4.5.

## Phụ lục E — Chỉ dẫn chuẩn hóa của quy trình bảo trì (RQ2)

Nguyên văn chỉ dẫn cố định giao cho AI coding agent (dịch từ bản tiếng Anh dùng
trong thực nghiệm; toàn văn tiếng Anh trong lịch sử nhánh `rq2-agent-v2/v3`):

> Bạn là tác nhân sửa chữa chuẩn hóa trong một thực nghiệm đo chi phí bảo trì
> bộ test. Giao thức, thực hiện đúng thứ tự: (1) ghi mốc thời gian T0; (2) chạy
> bộ test một lần để lấy danh sách test hỏng; (3) ghi mốc T1; (4) sửa các test
> hỏng theo quy tắc SỬA TỐI THIỂU: chỉ thay đổi selector/assertion trong các
> file test; KHÔNG tái cấu trúc, KHÔNG đổi cấu trúc test hay thêm helper, KHÔNG
> sửa ứng dụng hay cấu hình; ĐƯỢC đọc mã nguồn ứng dụng để chẩn đoán; KHÔNG
> đọc thư mục kết quả/tài liệu và KHÔNG xem các nhánh sửa khác — chỉ chẩn đoán
> từ output test và mã nguồn ứng dụng; (5) chạy lại đến khi toàn bộ 18 test
> pass, ghi mốc T2 ngay sau lần chạy xanh; (6) commit trên nhánh riêng; (7) báo
> cáo T0/T1/T2, số lần chạy suite, danh sách test đã sửa, và `git diff --stat`.

Chỉ số trích xuất: số test sửa + diff LOC từ `git diff master..<nhánh>`; thời
gian phục hồi = T2 − T0. Nhánh bằng chứng trên GitHub: `rq2-fix-v2`, `rq2-fix-v3`
(lần đo 1), `rq2-agent-v2`, `rq2-agent-v3` (lần đo 2, có mốc thời gian); hai lần
cho nội dung sửa trùng khớp từng dòng.
