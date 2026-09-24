# Chương 3 — Phương pháp và thiết kế thực nghiệm (BẢN NHÁP ĐẦY ĐỦ)

> Nháp hoàn chỉnh 09/07/2026, viết từ: `KeHoach_DoAn.md` mục 2–3, `app/src/variants.ts`,
> `docs/pilot-model-cost.md` mục 1–6, cấu hình hai suite, `harness/run-matrix.mjs`,
> `results/rq2-maintenance.md`. Chỗ cần chèn hình đánh dấu [HÌNH 3.x].

Chương này trình bày thiết kế của nghiên cứu thực nghiệm so sánh (empirical
comparative study) giữa hai phương pháp kiểm thử GUI: dựa trên bộ định vị
(locator-based) và dựa trên mô hình thị giác–ngôn ngữ (VLM-based). Nội dung gồm
tổng quan thiết kế (3.1), ứng dụng thực nghiệm và các biến thể giao diện có kiểm
soát (3.2–3.3), hai bộ test song song (3.4), lựa chọn mô hình VLM (3.5), hạ tầng
đo lường (3.6), và thiết kế riêng cho từng câu hỏi nghiên cứu RQ2–RQ4 (3.7–3.9);
mục 3.10 trình bày các biện pháp bảo đảm tính tái lập.

## 3.1. Tổng quan thiết kế nghiên cứu

Toàn bộ thực nghiệm xoay quanh một nguyên tắc: **mọi khác biệt đo được giữa hai
phương pháp phải xuất phát từ bản chất của phương pháp, không phải từ điều kiện
thí nghiệm**. Cụ thể:

- Hai bộ test **đối xứng 1–1**: cùng 18 kịch bản, cùng ứng dụng, cùng dữ liệu,
  cùng kích thước viewport 1280×1100, cùng môi trường chạy; khác nhau duy nhất ở
  cách diễn đạt kịch bản (selector kỹ thuật so với mô tả ngôn ngữ tự nhiên).
- Thay đổi giao diện được **kiểm soát chủ động** qua một file cấu hình duy nhất,
  không đổi logic ứng dụng.
- Mỗi tổ hợp điều kiện chạy lặp 5 lần để đo độ ổn định (flakiness), do đặc tính
  bất định tiềm ẩn của VLM.
- Mọi số liệu được ghi **tự động** bởi harness vào CSV; hình và bảng trong Chương 4
  sinh lại được bằng một lệnh duy nhất.

*Hình 3.1* (`fig-design-pipeline.png`) — sơ đồ tổng thể: ứng dụng (V0–V3) → hai
bộ test song song → harness ma trận {phương pháp × biến thể × 5 lặp} → CSV →
phân tích; hai khối mở rộng RBAC (RQ3) và masking (RQ4) đổ số liệu vào cùng
kho dữ liệu thô.

## 3.2. Ứng dụng thực nghiệm "Mini Shop Manager"

Ứng dụng web mẫu được xây dựng riêng cho thực nghiệm (Vite + React + TypeScript,
SPA), mô phỏng phần mềm quản lý cửa hàng nhỏ. Dữ liệu hoàn toàn là mock (JSON +
localStorage), không có backend thật. Các chức năng được thiết kế để phủ đúng 4
nhóm test case trong đề cương:

1. **Form nhập liệu:** đăng nhập; form thêm/sửa sản phẩm trong hộp thoại modal, có
   validation (tên bắt buộc, SKU bắt buộc, giá phải dương).
2. **Danh sách và tìm kiếm:** bảng 12 sản phẩm; ô tìm kiếm theo tên; lọc theo
   danh mục; lọc theo mức đánh giá tối thiểu; chip hiển thị bộ lọc đang áp dụng;
   trạng thái rỗng khi không có kết quả.
3. **CRUD:** tạo sản phẩm (bền vững qua reload nhờ localStorage), sửa, xóa kèm
   hộp thoại xác nhận.
4. **Thành phần tùy biến không nhãn ngữ nghĩa** — chủ ý gây khó cho locator
   truyền thống: nút icon SVG không aria-label, widget đánh giá sao, biểu đồ
   canvas (không có DOM bên trong), hàng danh sách là `div` thuần bắt sự kiện click.

Hai đặc điểm phục vụ các RQ mở rộng:

- **Phân quyền hiển thị 2 vai trò** (đăng nhập giả lập `admin` / `staff`): admin
  thấy thêm nút xóa sản phẩm, cột giá vốn (Cost) trong bảng và trong form, và
  trang Settings; staff truy cập thẳng `/settings` phải nhận trang "403 — Access
  denied". Đây là nền cho RQ3.
- **Trang hồ sơ khách hàng chứa PII giả** (tên, số điện thoại, email, số thẻ
  mock) — mục tiêu che giấu của RQ4.

Ứng dụng được **đóng băng tại tag `app-v1.0`** ngay khi hai bộ test xanh trên
giao diện gốc; từ đó về sau logic không được sửa — mọi thay đổi chỉ diễn ra qua
cấu hình biến thể (3.3) hoặc trên nhánh cấy lỗi riêng (3.8). Điều này bảo đảm
kết quả các đợt đo không bị nhiễu bởi thay đổi ứng dụng.

[HÌNH 3.2 — Screenshot giao diện gốc V0, trang Products với vai trò admin
(có sẵn tại `results/screenshots-app-v1/`).]

## 3.3. Bốn biến thể giao diện có kiểm soát

Biến thể được điều khiển bằng query param `?variant=v0..v3`, cấu hình tập trung
tại một file duy nhất (`app/src/variants.ts`) quy định theme, bố cục, bộ icon,
nhãn, thứ tự cột/toolbar/icon hành động. **Chỉ trình bày thay đổi — logic, dữ
liệu và hành vi giữ nguyên tuyệt đối**, đúng yêu cầu "controlled UI variants".

**Bảng 3.1 — Tổng hợp các biến thể giao diện và kịch bản kiểm thử**

| Biến thể | Thay đổi | Nhắm vào loại locator |
|---|---|---|
| V0 | Giao diện gốc | — (mốc so sánh) |
| V1 | Dark theme: đổi toàn bộ màu sắc, giữ nguyên bố cục | Không nhắm — đối chứng "thay đổi vô hại" |
| V2 | Đổi bố cục: sidebar → topbar; đảo thứ tự cột bảng (actions lên đầu, hoán vị sku/category, price/stock); đảo thứ tự nút toolbar và icon hành động (edit–view–delete); chuyển biểu đồ xuống dưới | Selector cấu trúc (`nth-child`) |
| V3 | Đổi bộ icon (glyph khác) và nhãn: "Add product"→"Create item", "Save"→"Confirm", đổi placeholder tìm kiếm, đổi tên ứng dụng | Selector neo văn bản (XPath `text()`) |

Ba loại biến thể này phủ ba nguyên nhân gãy test kinh điển đã phân tích ở mục
2.1.1: đổi hình thức (V1), đổi cấu trúc DOM (V2), đổi nhãn văn bản (V3). Nhờ cấu
hình tập trung, có thể khẳng định chắc chắn phạm vi ảnh hưởng của từng biến thể —
điều không thể có nếu dùng các phiên bản lịch sử của một ứng dụng thực tế.

[HÌNH 3.3 — Bốn screenshot V0–V3 đặt cạnh nhau.]

## 3.4. Hai bộ test song song

Mỗi phương pháp có một bộ 18 test case, ánh xạ 1–1 từng kịch bản, chia đều 4
nhóm: A — form nhập liệu (5), B — danh sách/tìm kiếm (4), C — CRUD (4), D — thành
phần tùy biến và phân quyền hiển thị (5). Danh sách đầy đủ tại Phụ lục B.

**Bộ baseline (Playwright, locator-based).** Selector dùng CSS/XPath **cố định
có chủ ý**: định vị theo vị trí cấu trúc (`td:nth-child(8)`, `.icon-btn:nth-child(3)`)
và theo văn bản (`//button[text()='Add product']`); không dùng `getByRole`/
`data-testid`. Đây là lựa chọn thiết kế được ghi nhận tường minh: bộ baseline đại
diện cho lớp test giòn phổ biến trong thực tế (đặc biệt với thành phần không có
nhãn ngữ nghĩa — nhóm D — nơi selector cấu trúc là lựa chọn duy nhất), và là
"trường hợp xấu" (worst case) của phương pháp locator; hệ quả của lựa chọn này
được thảo luận ở mục 4.7.

**Bộ VLM (Midscene.js v1.10.3 trên Playwright).** Cùng 18 kịch bản viết bằng
ngôn ngữ tự nhiên qua API `aiTap`/`aiInput`/`aiAssert`/`aiNumber`, mô tả **ý định
và hình thức** thay vì cấu trúc. Ví dụ cặp đối xứng của test A3 (thêm sản phẩm):

```ts
// Locator-based
await page.click("xpath=//button[text()='Add product']");
await modal.locator('label:nth-of-type(1) input').fill('Energy Drink 250ml');
...
await expect(page.locator('.product-table tbody tr')).toHaveCount(13);

// VLM-based
await aiTap('the primary button in the toolbar that adds a new product');
await aiInput('the Name field in the product dialog', { value: 'Energy Drink 250ml' });
...
expect(await aiNumber('how many product rows does the table contain?')).toBe(13);
```

**Quy tắc công bằng:** bộ VLM được viết một lần trên V0 và **không được chỉnh
sửa** khi chạy trên V1–V3 (không tuning prompt theo biến thể); tương tự, bộ
locator giữ nguyên khi đo RQ1 — việc sửa nó cho từng biến thể chỉ diễn ra trong
phép đo RQ2 (3.7), trên nhánh riêng.

## 3.5. Lựa chọn và ghim mô hình VLM

Đề cương ban đầu dự kiến "Claude, GPT-4o hoặc tương đương". Khảo sát kỹ thuật ở
giai đoạn pilot (chi tiết: `docs/pilot-model-cost.md`) cho thấy: tài liệu chính
thức của Midscene.js đánh giá các model OpenAI "perform poorly" ở khâu định vị
phần tử UI (chỉ phù hợp vai trò planning), còn Claude không nằm trong danh sách
model được hỗ trợ. Do đó model chính được chốt là **Qwen3-VL**, bản snapshot
open-weight `qwen/qwen3-vl-235b-a22b-instruct` truy cập qua OpenRouter
(`MIDSCENE_MODEL_FAMILY=qwen3-vl`), với các căn cứ: (i) thuộc nhóm khuyến nghị
mặc định của Midscene về visual grounding; (ii) chi phí thấp (giá ghim
$0.20/1M token vào, $0.88/1M token ra — rẻ hơn GPT-4o khoảng một bậc);
(iii) là model mã nguồn mở, nhất quán với phương án dự phòng self-host
(Qwen2.5-VL, UI-TARS) khi cần bảo mật dữ liệu đã ghi trong đề cương.

Các tham số cố định trong suốt thực nghiệm: **model ID ghim một snapshot duy
nhất; temperature = 0; cache của Midscene tắt hoàn toàn** (bật cache sẽ làm sai
lệch phép đo flakiness và chi phí); phiên bản Midscene.js khóa bằng lockfile.
Pilot chạy thật (08/07/2026) xác nhận cấu hình hoạt động: kịch bản đăng nhập +
đọc bảng đạt PASS với 5 lượt gọi AI, ~1.630 token vào/lượt, chi phí ≈ $0,0019 —
từ đó ước tính toàn bộ thực nghiệm ≈ $2,8, nằm sâu trong ngân sách $50 (thực tế
cuối cùng ≈ $1,5).

## 3.6. Hạ tầng đo lường và quy trình chạy

Harness (`harness/run-matrix.mjs`, Node.js) chạy ma trận
{locator, vlm} × {v0, v1, v2, v3} × {5 lần lặp} và ghi **mỗi kết quả test một
dòng** vào `results/raw/matrix-runs.csv`, gồm: nhãn đợt chạy (`label`), phương
pháp, biến thể, lần lặp, ID test, trạng thái, thời lượng test, wall-clock cả
run, và — riêng cho phương pháp VLM — số lượt gọi AI, token vào/ra, thời gian AI
và chi phí quy đổi. Token được đọc từ log của Midscene cho **từng run** (không
ước lượng theo công thức), giá quy đổi ghim theo mục 3.5.

Các chỉ số chính:

- **Tỉ lệ pass:** số test đạt / 18, theo từng (phương pháp, biến thể).
- **Flakiness:** mức dao động kết quả của cùng một test qua 5 lần lặp; bằng 0
  khi cả 5 lần cho kết quả giống hệt.
- **Thời gian thực thi:** wall-clock của cả run 18 test.
- **Chi phí vận hành:** token vào/ra và USD mỗi run (locator = $0).

Môi trường cố định: Node 24 LTS, Playwright 1.61, Chromium, viewport
**1280×1100**. Kích thước viewport được cố định và báo cáo tường minh vì là biến
nhiễu của thực nghiệm: VLM chỉ "nhìn" phần nội dung lọt trong screenshot, trong
khi locator truy vấn DOM toàn trang (phát hiện trong quá trình pilot, phân tích
tại mục 4.7). Suite tự khởi động ứng dụng qua cơ chế webServer của Playwright,
loại trừ sai khác do thao tác khởi động tay.

## 3.7. Thiết kế phép đo RQ2 — chi phí bảo trì

Khi "nâng cấp giao diện" từ V0 lên từng biến thể, chi phí bảo trì của mỗi bộ test
được đo bằng ba chỉ số: **(i)** số test case phải sửa; **(ii)** khối lượng thay
đổi mã — diff LOC theo `git diff`; **(iii)** thời gian phục hồi bộ test về trạng
thái 18/18.

Để tránh thiên lệch giữa hai bộ test và bảo đảm tái lập, việc bảo trì do **cùng
một quy trình sửa chuẩn hóa, tự động** thực hiện: một AI coding agent nhận chỉ
dẫn cố định — *"sửa tối thiểu để bộ test đạt trở lại; chỉ thay đổi
selector/assertion; không tái cấu trúc; không sửa ứng dụng; chẩn đoán chỉ từ
output test và mã nguồn ứng dụng"* — áp dụng đồng nhất cho cả hai bộ, mỗi biến
thể trên một nhánh git riêng. Giao thức thời gian: T0 (bắt đầu, trước lần chạy
suite đầu tiên) → T1 (nhận danh sách test hỏng) → T2 (ngay sau lần chạy xác nhận
18/18); thời gian phục hồi = T0→T2. Các chỉ số (i)–(ii) trích tự động từ lịch sử
git. Toàn văn chỉ dẫn chuẩn hóa tại Phụ lục E.

Tính ổn định của quy trình được kiểm chứng bằng cách chạy **hai lần độc lập**
(hai agent mới, không chia sẻ ngữ cảnh, bị cấm đọc tài liệu kết quả và nhánh sửa
của nhau): nội dung sửa của hai lần trùng khớp từng dòng (Chương 4, mục 4.3).
Hạn chế của cách đo — thời gian của tác nhân tự động không đại diện cho công sức
bảo trì thủ công của kỹ sư — được khai báo tại mục 4.7.

## 3.8. Thiết kế phép đo RQ3 — kiểm thử phân quyền hiển thị

RQ3 đánh giá khả năng dùng VLM phát hiện lỗi phân quyền hiển thị (role-based UI
access — khía cạnh front-end của OWASP Broken Access Control), đối chứng bằng
locator. Thiết kế gồm:

- **8 kịch bản RBAC (R1–R8)** viết bằng cả hai phương pháp: R1–R5 khẳng định
  staff *không* thấy đặc quyền admin (icon xóa, cột/trường Cost, mục Settings,
  truy cập thẳng `/settings` phải bị chặn 403); R6–R8 khẳng định admin *có* thấy
  đủ đặc quyền (đối chứng chống báo động giả).
- **Hai build:** build sạch (nhánh `master`, tag `app-v1.0`) — kỳ vọng 8/8 pass;
  và build cấy lỗi (nhánh `rq3-seeded-bugs`) chứa **5 lỗi phân quyền cố ý**, mỗi
  lỗi bỏ đúng một kiểm tra vai trò tương ứng R1–R5 (danh sách tại Phụ lục C).
- Mỗi tổ hợp {phương pháp × build} lặp 5 lần.

Chỉ số: **tỉ lệ phát hiện** (mỗi lỗi R1–R5 được tính là phát hiện khi test tương
ứng fail trên build cấy lỗi, ổn định qua 5 lặp) và **báo động giả** (số lần fail
sai trên R6–R8 hoặc trên build sạch). Phạm vi giới hạn ở tầng hiển thị front-end,
không kiểm thử API/backend.

## 3.9. Thiết kế phép đo RQ4 — che dữ liệu nhạy cảm

RQ4 đo trade-off giữa che giấu PII trên screenshot và độ chính xác định vị của
VLM, bằng một benchmark grounding riêng (không sửa lõi Midscene):

1. **Capture:** chụp 4 màn hình (login, bảng Products, 2 trang hồ sơ khách hàng
   chứa PII) ở viewport 1280×1100; trích tự động ground-truth bounding box của
   40 phần tử mục tiêu từ DOM.
2. **Mask:** sinh 2 phiên bản che vùng PII theo tọa độ biết trước bằng thư viện
   sharp: **blur** (Gaussian) và **pixelate**; hai màn hình không chứa PII giữ
   nguyên làm đối chứng nội bộ.
3. **Benchmark:** với mỗi ảnh × mỗi mô tả ngôn ngữ tự nhiên của 40 phần tử, gọi
   VLM yêu cầu trả bounding box; 3 điều kiện (gốc/blur/pixel) × 3 lần lặp =
   360 lượt gọi. Prompt yêu cầu tọa độ theo quy ước chuẩn hóa 0–1000 của Qwen-VL,
   harness quy đổi về pixel (bài học về quy ước tọa độ: mục 4.7); toàn bộ câu trả
   lời thô lưu tại `raw-calls.jsonl` phục vụ audit.

Chỉ số: **hit-rate** (tâm của box dự đoán rơi vào ground-truth box) và **IoU**
(intersection-over-union giữa hai box), so sánh giữa ba điều kiện, tách theo màn
hình có mask/không mask.

## 3.10. Tính tái lập

Toàn bộ gói thực nghiệm công khai trên GitHub (`[TAI-KHOAN-GITHUB]/doanai`, chuyển public khi
bảo vệ): mã nguồn ứng dụng + biến thể, hai bộ test, harness, module masking, số
liệu thô và script phân tích. Các biện pháp cụ thể: phiên bản công cụ khóa bằng
lockfile; model ID + bảng giá ghim trong tài liệu; app đóng băng bằng tag; các
nhánh bằng chứng (`rq2-fix-*`, `rq2-agent-*`, `rq3-seeded-bugs`) giữ nguyên trên
remote; toàn bộ hình và bảng của Chương 4 sinh lại bằng một lệnh
`python3 harness/make-figures.py` từ CSV đã commit. Hướng dẫn tái lập từng bước
tại Phụ lục A.

## 3.11. Phương pháp phân tích lỗi (Failure Analysis)

Bên cạnh số liệu định lượng (tỉ lệ pass, flakiness), đề tài áp dụng một quy
trình phân tích định tính cho **từng** test case thất bại ở cả hai phương
pháp, nhằm làm rõ nguyên nhân gốc thay vì chỉ dừng ở việc đếm số lượng fail
theo nhóm chức năng. Với mỗi lượt fail, nguyên nhân được xác định thủ công từ
log thực thi (Playwright HTML report / Midscene AI-call log) và diff sửa lỗi
tương ứng (khi có), rồi xếp vào một trong bốn nhóm:

- **Nhóm 1 — Lỗi định vị do thay đổi cấu trúc/vị trí phần tử:** selector cấu
  trúc (`nth-child`, chỉ số cột cố định) trỏ sai ô do đổi thứ tự cột, toolbar,
  hoặc icon hành động. Đặc trưng của locator-based khi giao diện đổi **bố cục**.
- **Nhóm 2 — Lỗi định vị do thay đổi nhãn/văn bản neo:** selector neo theo
  chuỗi văn bản cố định (XPath `text()='...'`, placeholder) không còn khớp do
  đổi nhãn nút/tiêu đề. Đặc trưng của locator-based khi giao diện đổi **nhãn**.
- **Nhóm 3 — Lỗi suy luận ngữ nghĩa của VLM:** model hiểu sai trạng thái hiển
  thị hoặc ngữ cảnh hình ảnh (ví dụ nhầm placeholder với giá trị đã nhập, đếm
  sai số dòng ngoài viewport). Đặc trưng của phương pháp VLM-based.
- **Nhóm 4 — Lỗi hạ tầng không liên quan đến giao diện:** timeout mạng, xung
  đột tài nguyên dùng chung, sự cố/đổi hành vi từ nhà cung cấp model.

Khung này được thiết kế dùng chung cho cả hai phương pháp — kể cả khi một
phương pháp chưa quan sát được lượt fail nào thuộc một nhóm nhất định trong
đợt đo hiện tại — để không phải định nghĩa lại nếu các đợt đo bổ sung sau này
phát sinh thêm loại lỗi. (Cập nhật 19/09/2026: đợt tái kiểm chứng độc lập ở
mục 4.2 đã ghi nhận lượt fail đầu tiên thuộc Nhóm 3 — VLM tap nhầm icon do đổi
glyph ở biến thể V3 — nên khung phân loại nay có dữ liệu thật ở cả ba nhóm 1,
2, 3; Nhóm 4 vẫn chưa quan sát được trường hợp nào.) Kết quả phân loại áp dụng
cho dữ liệu hiện có được trình bày tại mục 4.2.

---

*Chuyển tiếp:* với thiết kế trên, Chương 4 trình bày kết quả định lượng của bốn
câu hỏi nghiên cứu và thảo luận các đánh đổi quan sát được.
