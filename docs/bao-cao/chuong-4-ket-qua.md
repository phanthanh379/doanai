# Chương 4 — Kết quả thực nghiệm và thảo luận (BẢN NHÁP)

> Bản nháp sinh ngày 09/07/2026 từ số liệu chính thức trong repo. Mọi con số đều
> tái lập được: bảng tổng hợp `results/analysis-summary.md` và 5 hình
> `results/figures/` do `harness/make-figures.py` sinh từ
> `results/raw/matrix-runs.csv` + `masking/generated/grounding-results.csv`.
> Nội dung đã chốt đầy đủ (09/07/2026) — không còn TODO; chỉ còn việc định dạng
> theo template khoa khi ghép bản nộp (ghi chú cuối chương).

## 4.1. Thiết lập thực nghiệm

- **Ứng dụng đo:** "Mini Shop Manager" (Vite + React + TS, mock data), 2 vai trò
  đăng nhập (admin/staff), trang hồ sơ khách hàng chứa PII giả. Ứng dụng đóng băng
  tại tag `app-v1.0`; 4 biến thể trình bày V0 (gốc), V1 (dark theme), V2 (topbar +
  đảo thứ tự cột/toolbar/icon hành động), V3 (đổi bộ icon + nhãn nút/placeholder)
  cấu hình tập trung tại `app/src/variants.ts` — chỉ đổi trình bày, không đổi logic.
- **Hai bộ test đối xứng 1–1, mỗi bộ 18 test** chia 4 nhóm: A form nhập liệu (5),
  B danh sách/tìm kiếm (4), C CRUD (4), D thành phần tùy biến không nhãn ngữ nghĩa (5).
  - *Baseline (locator-based):* Playwright, selector CSS/XPath cố định (nth-child,
    XPath neo text) — chủ ý đại diện cho lớp test giòn phổ biến trong thực tế.
  - *VLM-based:* Midscene.js v1.10.3 + model ghim `qwen/qwen3-vl-235b-a22b-instruct`
    (OpenRouter, `MIDSCENE_MODEL_FAMILY=qwen3-vl`), test viết bằng ngôn ngữ tự nhiên,
    temperature = 0, cache tắt, không huấn luyện/fine-tune.
- **Quy trình đo:** harness `harness/run-matrix.mjs` chạy ma trận
  {phương pháp} × {biến thể} × {5 lần lặp}, ghi từng test-result kèm wall-clock,
  số AI call, token in/out và chi phí API (giá ghim $0.20/M in, $0.88/M out) vào
  `results/raw/matrix-runs.csv`. Viewport cố định 1280×1100 cho cả hai bộ
  (lý do: mục 4.7). Môi trường: Node 24 LTS, Playwright 1.61, Chromium.

## 4.2. RQ1 — Độ bền vững khi giao diện thay đổi

*Hình 4.1* (`fig-rq1-passrate.png`) và *Hình 4.2* (`fig-rq1-time-cost.png`);
số liệu: label `gd4-main`, 2×4×5 = 720 dòng.

**Bảng 4.1 — RQ1: tỉ lệ pass theo biến thể giao diện**

| Phương pháp | V0 | V1 (theme) | V2 (bố cục) | V3 (icon/nhãn) |
|---|---|---|---|---|
| Locator | 18/18 | 18/18 | **9/18 (50%)** | **12/18 (67%)** |
| VLM | 18/18 | 18/18 | **18/18** | **18/18** |

- **Flakiness = 0 ở cả hai phương pháp:** kết quả giống hệt qua 5 lần lặp trên mọi
  ô của ma trận. Với VLM, tính tất định có được nhờ temperature = 0 + tắt cache;
  đây là điểm đáng chú ý vì lo ngại ban đầu (đề cương) là VLM non-deterministic.
- Locator "miễn nhiễm" với đổi theme (V1: DOM không đổi) nhưng gãy đúng ở những
  thay đổi cấu trúc (V2) và nhãn (V3). Áp dụng khung phân tích lỗi ở mục 3.11
  cho toàn bộ 15 lượt fail (nguồn: `results/rq2-maintenance.md`), **100% quy về
  đúng 2 trong 4 nhóm nguyên nhân đã định nghĩa trước** — không có lượt nào rơi
  vào Nhóm 3 (suy luận ngữ nghĩa VLM, không áp dụng cho locator) hay Nhóm 4
  (hạ tầng):

**Bảng 4.2 — Phân loại nguyên nhân lỗi (Failure Analysis) áp dụng cho dữ liệu RQ1**

  | Nhóm nguyên nhân | Biến thể | Số lượt fail | Test case |
  |---|---|---:|---|
  | Nhóm 1 — cấu trúc/vị trí (đảo cột, toolbar, icon) | V2 | **9/18** | A3, B1, C1, C2, C3, C4, D1, D2, D5 |
  | Nhóm 2 — nhãn/văn bản neo (`Add product`→`Create item`, `Save`→`Confirm`) | V3 | **6/18** | A3, A4, A5, C1, C2, D2 |
  | Nhóm 3 — suy luận ngữ nghĩa VLM (glyph icon đổi, mô tả "eye" không còn khớp) | V3 (VLM, tái kiểm chứng 19/09) | **1/18** | D1 |

  Nhóm 3 chỉ xuất hiện ở lần tái kiểm chứng độc lập (mục 4.2), không có trong
  lần đo chính thức 09/07/2026 — xem thảo luận chi tiết ở đoạn "Tái kiểm chứng
  độc lập" phía trên.

  Nhóm CRUD/custom-widget (C, D) chịu ảnh hưởng nặng nhất ở cả hai biến thể —
  đúng như kỳ vọng thiết kế ở mục 3.2: đây là nhóm thành phần không có nhãn ngữ
  nghĩa, buộc phải dùng selector cấu trúc, nên nhạy với đúng hai loại thay đổi
  mà V2/V3 mô phỏng. Việc mọi lượt fail đều xếp gọn vào 2/4 nhóm (không có lượt
  nào "chưa rõ nguyên nhân") cho thấy nguyên nhân gãy của locator trong thực
  nghiệm này thuần túy cơ học (selector trỏ sai do đổi cấu trúc/nhãn), không lẫn
  yếu tố ngẫu nhiên — nhất quán với flakiness = 0 quan sát được.
- VLM pass 100% trên cả 4 biến thể mà không sửa gì: mô tả ngôn ngữ tự nhiên
  ("nút Delete của dòng đầu tiên", "cột SKU") bất biến với vị trí cột, thứ tự icon
  và cả việc đổi nhãn nút (model đọc ngữ nghĩa màn hình thay vì khớp chuỗi).
- **Giá của độ bền vững đó:** VLM ~437–538 s/run so với locator ~3 s (V0/V1);
  chi phí API ~$0.050/run (~93 AI call, ~232k token). Locator trên V2/V3 mất ~32 s
  do các test hỏng chờ hết timeout — bản thân thời gian chạy cũng là một tín hiệu
  "suite đang gãy" ở phía locator.

**Trả lời RQ1:** với thay đổi thuần trình bày, bộ test VLM bền vững hơn hẳn
(100% so với 50–67% ở biến thể cấu trúc/nhãn); đổi lại chậm hơn ~2 bậc độ lớn và
phát sinh chi phí API mỗi lần chạy.

**Tái kiểm chứng độc lập (19/09/2026).** Để xác nhận tính tái lập, phía locator
của ma trận RQ1 được một tác nhân độc lập (không có ngữ cảnh về lần đo gốc) chạy
lại từ một checkout sạch của tag `app-v1.0`, trên cả 4 biến thể. Kết quả trùng
khớp tuyệt đối với bảng trên — **kể cả danh sách chính xác từng test case gãy**
ở V2 (A3, B1, C1, C2, C3, C4, D1, D2, D5) và V3 (A3, A4, A5, C1, C2, D2) — không
chỉ trùng số lượng.

Phía VLM cũng được chạy lại (1 lần/biến thể, cùng model `qwen/qwen3-vl-235b-a22b-instruct`,
temperature = 0, viewport 1280×1100). Kết quả: **V0 = 18/18, V1 = 18/18, V2 =
18/18 — khớp với số liệu gốc — nhưng V3 = 17/18**, xuất hiện một lượt fail mới
chưa từng ghi nhận: **D1 ("the view icon opens a read-only product detail")**.

Nguyên nhân đã xác định rõ, không phải flaky ngẫu nhiên: test D1 ra lệnh cho VLM
"tap the eye/view icon", nhưng V3 đổi bộ icon từ Set A (glyph hình con mắt) sang
Set B (glyph hình kính lúp — `app/src/icons.tsx`); model đã tap nhầm sang icon
Edit kế bên, mở ra dialog chỉnh sửa thay vì dialog xem chi tiết (log lỗi: *"the
current screenshot shows an 'Edit product' dialog, not a read-only product detail
dialog"*). Đây là bằng chứng thực nghiệm cho một giới hạn tinh tế hơn của kết
luận RQ1 ban đầu: VLM bất biến với việc đổi **vị trí/thứ tự** icon (đã kiểm
chứng ở V2), nhưng **không hoàn toàn bất biến khi đổi hình dạng (glyph) của
icon**, nếu mô tả test bằng ngôn ngữ tự nhiên có giả định cụ thể về hình dạng
("eye") không còn đúng ở biến thể mới — một dạng "giả định trực quan lỗi thời"
tương tự về bản chất với việc locator giả định cấu trúc DOM/nhãn không đổi, chỉ
khác ở chỗ tần suất xảy ra thấp hơn nhiều (1/18 so với 6–9/18 của locator).

*Hình 4.6* (`fig-rq1-rerun-verification.png`) trực quan hóa so sánh gốc/chạy lại
nêu trên — cột V3/VLM là nơi duy nhất hai lần đo lệch nhau.

## 4.3. RQ2 — Chi phí bảo trì

*Hình 4.3* (`fig-rq2-maintenance.png`); chi tiết: `results/rq2-maintenance.md`.

Quy trình: sửa tối thiểu bộ locator cho pass lại 18/18 trên từng biến thể
(chỉ đổi selector/assertion, không refactor), mỗi biến thể một branch riêng
(`rq2-fix-v2` = commit `bc5f071`, `rq2-fix-v3` = commit `3eb8809`); đo số test
phải sửa + diff LOC bằng `git diff --stat`.

**Bảng 4.3 — RQ2: chi phí bảo trì theo biến thể (locator vs. VLM)**

| Biến thể | Locator: test sửa | Locator: diff LOC (+/−) | Locator: thời gian phục hồi | VLM: test sửa / LOC / thời gian |
|---|---:|---:|---:|---:|
| V1 | 0 | 0 | 0 s | 0 / 0 / 0 s |
| V2 | 9 | 24 (12+/12−) | 177 s | 0 / 0 / 0 s |
| V3 | 6 | 22 (11+/11−) | 137 s | 0 / 0 / 0 s |
| **Tổng** | **15** | **46** | **314 s (≈5,2 phút)** | **0** |

**Tái kiểm chứng độc lập (19/09/2026).** Một tác nhân sửa lỗi độc lập thứ hai
(không đọc `results/rq2-maintenance.md` hay các branch `rq2-fix-*` trước khi sửa)
thực hiện lại đúng quy trình sửa tối thiểu trên V2 và V3, chẩn đoán chỉ từ output
test và mã nguồn ứng dụng. Khi tuân thủ nghiêm ngặt "chỉ đổi selector/assertion"
(không sửa dòng nào khác kể cả comment), kết quả trùng khớp tuyệt đối: V2 = 9
test / 24 LOC (12+/12−), V3 = 6 test / 22 LOC (11+/11−) — cùng đúng danh sách
test case đã liệt kê ở mục 4.2.

Tuy nhiên, cùng tác nhân này khi được phép tiện thể cập nhật 3 dòng **comment**
đã lỗi thời (ví dụ "// 1st icon..." → "// 2nd icon..." khi thứ tự icon đổi) —
một hành vi sửa code hợp lý, không vi phạm tinh thần "sửa tối thiểu" về mặt hành
vi kiểm thử — thì diff LOC của V2 tăng từ 24 lên **30 dòng** (do mỗi dòng comment
sửa tính là 1 xóa + 1 thêm), trong khi số test sửa và kết quả pass/fail không đổi.
Điều này cho thấy **chỉ số diff-LOC nhạy với phong cách của người/tác nhân sửa**
(có cập nhật comment lỗi thời hay không) theo cách mà chỉ số số-test-sửa không
gặp phải — một giới hạn cần khai báo tường minh hơn so với mô tả ở mục 4.7,
được cập nhật ở đó.

*Hình 4.7* (`fig-rq2-rerun-verification.png`) minh họa mức chênh lệch diff-LOC
giữa hai phong cách sửa nêu trên trên cùng một biến thể V2, cùng với LOC đo
được phía VLM ở V3 (2 dòng) để so sánh trực quan quy mô giữa hai phương pháp.


**Cập nhật về "chi phí bảo trì VLM = 0" (19/09/2026).** Khẳng định dưới đây —
chi phí bảo trì phía VLM là 0 trên cả 3 biến thể — dựa trên số liệu chính thức
09/07/2026, khi bộ VLM pass 18/18 tuyệt đối trên V1–V3. Tái kiểm chứng độc lập
ở mục 4.2 phát hiện 1 lượt fail mới ở V3 (D1, do đổi glyph icon: bộ icon B hiển
thị hình kính lúp cho hành động "view", trong khi mô tả test hard-code từ "eye
icon") không có ở lần đo gốc.

Lượt fail này sau đó được sửa và đo theo đúng quy trình "sửa tối thiểu, chỉ đổi
mô tả/assertion" đã dùng cho locator: thay 1 dòng mô tả từ mặc định hình dạng
("the eye/view icon in the row...") sang mô tả theo **chức năng, không giả định
hình dạng** ("the icon (not the edit or delete icon) in the row... that opens a
read-only detail view") — **1 test / 2 LOC (1+/1−)**, tính theo đúng quy ước đã
dùng cho RQ2 phía locator (một dòng thay thế = một dòng xóa + một dòng thêm).
Bản sửa được xác nhận không gây hồi quy: chạy lại D1 trên cả V0, V1, V2 (nơi
icon vẫn là hình con mắt hoặc thứ tự icon bị đảo) đều pass 1/1, và bộ đầy đủ 18
test trên V3 pass 18/18 sau khi sửa.

Vậy số liệu đầy đủ cho chi phí bảo trì VLM ở biến thể V3 là: **1 test sửa / 2
LOC / có xác nhận không hồi quy trên 3 biến thể còn lại** — thấp hơn nhiều so
với locator cả về tần suất (1 lượt/18 so với 6–9 lượt/18) lẫn quy mô thay đổi
(2 dòng so với 22–30 dòng), nhưng **khác 0** — đúng bằng chứng cần thiết để bác
bỏ khẳng định "chi phí bảo trì VLM tuyệt đối bằng 0". Số liệu 0/0/0s ở bảng
chính thức phía trên được giữ nguyên vì phản ánh đúng lần đo 09/07/2026 đã công
bố; điểm cập nhật này được khai báo bổ sung để không đánh giá quá cao tính bất
biến của VLM trước mọi loại thay đổi giao diện.

- Phía VLM, "chi phí bảo trì" khi giao diện đổi là **0** trên cả 3 biến thể —
  nhưng bản chất kinh tế của hai phương pháp khác nhau: locator trả chi phí
  **một lần, khi giao diện đổi** (công sửa script); VLM trả chi phí **mỗi lần
  chạy** ($0.050/run + 7–10 phút). Điểm hòa vốn phụ thuộc tần suất đổi giao diện
  so với tần suất chạy suite.
- *Ước lượng hòa vốn minh họa* (các giả định nêu tường minh, chỉ có tính chất
  định hướng): về **tiền**, chi phí API của VLM ~$0.05/run là không đáng kể —
  1.000 run ≈ $50. Đánh đổi thực sự nằm ở **thời gian**: mỗi run VLM tốn thêm
  ~8 phút so với ~3 giây của locator; một dự án chạy suite 10 lần/ngày sẽ trả
  thêm ~80 phút thời gian máy mỗi ngày, đổi lấy việc không phải sửa test khi
  giao diện đổi (mỗi đợt đổi kiểu V2/V3 tốn 6–9 test / 22–24 LOC phải sửa và
  toàn bộ thời gian chẩn đoán–sửa–xác nhận kèm theo). Hàm ý thực tiễn: hai
  phương pháp phù hợp hai chế độ khác nhau — locator cho vòng lặp CI dày đặc
  trên giao diện ổn định; VLM cho kiểm thử theo lịch thưa hơn, giai đoạn giao
  diện biến động nhanh, hoặc làm lớp "regression theo ý định" ít phải bảo trì.
- Chỉ số **thời gian phục hồi bộ test**: theo đề cương, việc bảo trì do cùng một
  quy trình chuẩn hóa tự động thực hiện (AI coding agent, chỉ dẫn sửa-tối-thiểu cố
  định) nên thời gian đo được là thời gian phục hồi của quy trình đó — tái lập
  được, không phụ thuộc người sửa. Kết quả (branch `rq2-agent-v2`/`rq2-agent-v3`,
  đo từ lúc bắt đầu chạy suite lần đầu đến lần chạy xác nhận 18/18): V2 = 177 s,
  V3 = 137 s; phía VLM = 0 s (không phải sửa). Kiểm tra ổn định: hai lần chạy agent
  độc lập cho diff trùng khớp từng dòng với lần đo trước (`rq2-fix-v2/v3`).

**Trả lời RQ2:** trên 3 biến thể có kiểm soát, bộ locator cần sửa 15 lượt test /
46 LOC để phục hồi, bộ VLM cần 0; chi phí của VLM dịch chuyển từ "bảo trì" sang
"vận hành" (API + thời gian chạy).

## 4.4. RQ3 — Phát hiện lỗi phân quyền hiển thị (role-based UI)

*Hình 4.4* (`fig-rq3-detection.png`); số liệu: label `gd4-rbac-clean`, `gd4-rbac-seeded`.

Thiết kế: 8 kịch bản RBAC (R1–R8) chạy bằng cả hai phương pháp trên (i) build
sạch (`master`) và (ii) build cấy 5 lỗi phân quyền hiển thị cố ý (branch
`rq3-seeded-bugs`: phần tử của admin lộ ra với staff — nút Delete, cột Cost,
trang Settings, …); mỗi tổ hợp lặp 5 lần.

**Bảng 4.4 — RQ3: detection, false alarm và chi phí theo phương pháp**

| Phương pháp | Detection (R1–R5 trên build lỗi) | False alarm (R6–R8 + build sạch) | Chi phí |
|---|---|---|---|
| Locator | **5/5**, fail đủ 5/5 lặp | 0 | $0, ~2 s/run |
| VLM | **5/5**, fail đủ 5/5 lặp | 0 | $0.0052/run, ~50–75 s/run |

- Cả hai phương pháp đạt detection 100%, không báo động giả, hoàn toàn ổn định
  qua 5 lặp. Trên lớp lỗi "phần tử quyền cao hiển thị nhầm cho vai trò quyền thấp"
  (OWASP Broken Access Control, khía cạnh front-end), khả năng phát hiện là
  tương đương; VLM không thể hiện lợi thế phát hiện trên app mẫu này, nhưng cũng
  không thua kém — trong khi kịch bản VLM viết bằng mô tả tự nhiên ("staff không
  được thấy nút Delete") nên kế thừa luôn độ bền vững trước thay đổi giao diện
  đã đo ở RQ1.
- Giới hạn phạm vi: chỉ kiểm thử hiển thị front-end, không kiểm thử API/backend.

**Trả lời RQ3:** VLM dùng được như một cơ chế kiểm thử phân quyền hiển thị với
độ chính xác ngang baseline (5/5 detection, 0 false alarm) ở chi phí ~$0.005/run.

**Tái kiểm chứng độc lập (19/09/2026).** Bộ RBAC được chạy lại từ một checkout
git đầy đủ (branch `master` cho build sạch, `rq3-seeded-bugs` cho build cấy lỗi),
1 lần/tổ hợp. Kết quả khớp tuyệt đối với bảng trên: build sạch 8/8 pass cả hai
phương pháp; build cấy lỗi **5/8 fail đúng R1–R5, 3/8 pass đúng R6–R8** ở cả
locator và VLM.

Đọc kỹ log thất bại phát hiện một khác biệt về **chất lượng của lượt fail**,
không chỉ về số lượng. Vì 5 lỗi được cấy đồng thời, lỗi R2 (cột Cost không còn
bị ẩn) làm bảng của staff có 8 cột thay vì 7. Hai test locator dùng cùng selector
cố định `td:nth-child(7)` để định vị cột actions — R1 và R5 — đều bị "nhiễu chéo"
bởi dịch chuyển cột này:

- **R1** kỳ vọng đếm được 2 icon (view + edit, không có delete) tại cột 7,
  nhưng nhận được **0** — không phải 3 (con số lẽ ra phải thấy nếu chỉ có đúng
  lỗi R1 đang hoạt động) — vì cột 7 giờ trỏ vào ô Rating (không icon), do cột
  actions đã dịch sang vị trí 8. Test vẫn fail (đúng hướng), nhưng **không thực
  sự kiểm chứng được đúng điều nó được đặt tên để kiểm tra** (sự hiện diện của
  icon Delete) — nó fail vì lệch cột, không phải vì phát hiện đúng icon Delete.
- **R5** cùng nguyên nhân gốc, biểu hiện thành **timeout 30s** (vì dùng
  `page.click` chờ phần tử actionable, không phải `expect().toHaveCount()` có
  timeout ngắn hơn).
- Ngược lại, **R2, R3, R4** phía locator fail sạch và đúng bản chất (đếm đúng số
  cột/link bị lệch, đúng element không tìm thấy) — không phụ thuộc cột 7/8.

Phía VLM, **cả 5/5 lượt fail đều sạch và đúng bản chất** — mỗi lý do trong log
(`Reason: ...`) mô tả chính xác đúng loại lỗi được đặt tên, kể cả R1 và R5
("there is a trash/delete icon... present in every row"; "the field labeled
'Cost ($)' is clearly visible"), hoàn toàn không bị ảnh hưởng bởi việc cột Cost
cũng đang rò rỉ đồng thời — vì mô tả ngôn ngữ tự nhiên không phụ thuộc vị trí cột.

Đây là bằng chứng cụ thể cho một giới hạn tinh tế hơn của thiết kế RQ3: khi cấy
nhiều lỗi phân quyền đồng thời (thay vì cô lập từng lỗi), **các kiểm tra dựa
trên cấu trúc (locator) mất tính độc lập với nhau** — một lỗi thay đổi cấu trúc
(R2) làm hỏng phép đo của lỗi khác (R1, R5) dùng chung điểm neo cấu trúc, dù kết
luận "có lỗi" vẫn đúng một cách tình cờ — trong khi **kiểm tra dựa trên ngữ nghĩa
(VLM) giữ được tính độc lập giữa các lượt kiểm tra**, mỗi lượt vẫn chẩn đoán
đúng nguyên nhân của chính nó bất kể lỗi khác đang tồn tại song song. Đây là một
phát hiện bổ sung cho luận điểm bền vững ở RQ1, ở một khía cạnh mới: không chỉ
bền vững trước thay đổi giao diện đơn lẻ, mà còn bền vững trước **nhiễu chéo
giữa nhiều thay đổi xảy ra đồng thời**.

*Hình 4.8* (`fig-rq3-rerun-verification.png`) minh họa trực quan hai lần chạy —
build sạch (trái) và build cấy lỗi (phải) — khớp tuyệt đối ở cả hai phương pháp.

## 4.5. RQ4 — Trade-off che dữ liệu nhạy cảm ↔ độ chính xác định vị

*Hình 4.5* (`fig-rq4-hitrate-iou.png`); số liệu: `masking/generated/grounding-results.csv`
(360 call = 40 item × 3 điều kiện × 3 lặp, $0.112).

Thiết kế: 40 mục tiêu định vị trên 4 màn hình (login, products-admin và 2 trang
hồ sơ khách hàng chứa PII); ảnh gửi VLM ở 3 điều kiện: gốc, blur, pixelate
(mask theo tọa độ PII biết trước, bằng sharp). Đo hit-rate (tâm dự đoán rơi vào
ground-truth box) và IoU.

**Bảng 4.5 — RQ4: hit-rate và IoU theo màn hình và điều kiện masking**

| Màn hình | Gốc | Blur | Pixelate |
|---|---|---|---|
| login (không mask) | 100% / 0.876 | 100% / 0.863 | 100% / 0.861 |
| products-admin (không mask) | 100% / 0.656 | 100% / 0.651 | 100% / 0.652 |
| customer-c01 (PII, có mask) | 100% / 0.764 | 100% / 0.737 | 100% / 0.709 |
| customer-c03 (PII, có mask) | 100% / 0.806 | 100% / 0.779 | 100% / 0.730 |

- **Hit-rate 100% ở cả 3 điều kiện**, kết quả tất định qua 3 lặp: masking không
  làm VLM mất khả năng tìm đúng phần tử.
- IoU giảm nhẹ và **chỉ trên 2 màn có mask** (tối đa −0.076, pixelate > blur),
  hai màn không mask giữ nguyên (đối chứng nội bộ, loại trừ nhiễu do điều kiện chạy).
  Mức giảm không đổi hit-rate → suy giảm chỉ ở độ khít của box, không ở khả năng
  định vị.

**Trả lời RQ4:** trong phạm vi khảo sát bước đầu này, có thể che PII trước khi
gửi screenshot lên VLM API mà **không** đánh đổi khả năng định vị phần tử;
trade-off chỉ xuất hiện dưới dạng IoU giảm nhẹ tại đúng vùng bị che.

**Tái kiểm chứng độc lập (19/09/2026).** Bộ benchmark RQ4 được chạy lại độc
lập; do chạy `npm run benchmark` hai lần trên cùng dữ liệu capture/mask, kết
quả cộng dồn thành **720 lượt gọi** (gấp đôi N gốc: 40 item × 3 điều kiện ×
3 lặp × 2 lần chạy), vô tình cho một mẫu lớn hơn để đối chiếu:

**Bảng 4.6 — RQ4: tái kiểm chứng độc lập (N gấp đôi) theo màn hình và điều kiện**

| Màn hình | Gốc (N gấp đôi) | Blur | Pixelate |
|---|---|---|---|
| login (không mask) | 100% / 0,873 | 100% / 0,863 | **96,7%** / 0,830 |
| products-admin (không mask) | 100% / 0,654 | 100% / 0,653 | 100% / 0,653 |
| customer-c01 (PII, có mask) | 100% / 0,762 | 100% / 0,734 | 100% / 0,699 |
| customer-c03 (PII, có mask) | 100% / 0,816 | 100% / 0,770 | **97,6%** / 0,689 |

IoU ở mọi ô lệch không quá 0,03 so với số liệu gốc — nằm trong biên độ dao
động bình thường. Điểm khác biệt duy nhất là hit-rate xuất hiện 2 lượt trượt
(login/pixel, customer-c03/pixel) thay vì tuyệt đối 100% như bản gốc. Truy vết
đúng 2 dòng gây trượt trong CSV cho thấy cả hai đều có `error: "unparseable
answer"` — tức là VLM không trả lời sai vị trí, mà **câu trả lời không đúng
định dạng để harness trích xuất tọa độ** (0/720 lượt còn lại có lỗi tương tự).
Đây chính là biểu hiện thực tế của lỗi đã phát hiện và vá ở `masking/benchmark.mjs`
(mục 3.11/Phụ lục): bản benchmark đang chạy là **bản chưa áp patch**, nên 2 dòng
lỗi này được ghi `hit`/`iou` rỗng thay vì `0` — khi tổng hợp ở đây, hai dòng đó
được tính là 1 lượt trượt (nhất quán với quy ước "lỗi parse = trượt" mà bản vá
áp dụng), không phải bị loại bỏ khỏi mẫu.

Với N gấp đôi, phát hiện này minh họa đúng lý do khiến bản vá cần thiết: ở N=360
(3 lặp), xác suất bắt được một lỗi hiếm (2/720 ≈ 0,28%) là thấp, nên bản đo gốc
"may mắn" không gặp; ở N=720, lỗi hiếm này lộ ra. Không có bằng chứng nào cho
thấy đây là suy giảm khả năng định vị thật của VLM dưới điều kiện che dữ liệu —
tỉ lệ lỗi định dạng câu trả lời (0,28%) độc lập với việc ảnh có bị che hay không
(1/2 lượt trượt rơi vào màn *không* che dữ liệu — login). Kết luận RQ4 ở trên
được giữ nguyên; điểm cập nhật này bổ sung một giới hạn thực nghiệm cụ thể
(tỉ lệ lỗi định dạng câu trả lời khác 0, dù rất nhỏ) vào mục 4.7.

*Hình 4.9* (`fig-rq4-rerun-verification.png`) minh họa hit-rate gốc và tái chạy
theo từng màn hình/điều kiện; hai cột đỏ là đúng 2 lượt trượt phát hiện được.

## 4.6. Thảo luận chung

1. **Trade-off trung tâm (robustness ↔ thời gian/chi phí):** VLM đổi ~2 bậc độ
   lớn về thời gian chạy và $0.05/run lấy (i) pass 100% trên mọi biến thể trình bày
   và (ii) chi phí bảo trì bằng 0 khi giao diện đổi. Locator gần như miễn phí và
   tức thời khi giao diện ổn định, nhưng mất 33–50% suite khi đổi bố cục/nhãn và
   cần can thiệp tay (15 lượt test / 46 LOC) để phục hồi.
2. **Tính tất định của VLM ở temperature = 0** (flakiness = 0 trên 720 + 160 dòng
   đo + 360 call grounding) cho thấy lo ngại "VLM non-deterministic" có thể kiểm
   soát được ở tầng cấu hình — nhưng chỉ trong điều kiện model ghim cố định và
   input ổn định; không khái quát sang model/provider khác.
3. **Chi phí tuyệt đối nhỏ nhưng cấu trúc chi phí khác nhau:** toàn bộ thực nghiệm
   (~$1.5) nằm dưới xa ngân sách $50; điểm quyết định khi áp dụng thực tế không
   phải giá một run mà là tần suất chạy CI × thời gian chờ 7–10 phút/suite.
4. **Hai phát hiện phương pháp luận** (chi tiết `docs/pilot-model-cost.md` mục 7–8)
   có giá trị thực hành khi tích hợp VLM vào kiểm thử: (i) perception của VLM là
   viewport-bound — locator truy vấn DOM toàn trang còn VLM chỉ "thấy" screenshot;
   (ii) quy ước tọa độ grounding của model (Qwen3-VL: 0–1000) thắng chỉ dẫn trong
   prompt — harness phải theo model, và phải tách bạch "lỗi model" với "lỗi harness"
   trước khi kết luận.

## 4.7. Threats to Validity

1. **Construct — viewport là biến nhiễu:** VLM chỉ nhận thức phần nội dung lọt
   viewport (1280×1100, đã cố định và báo cáo tường minh); kết quả không khái quát
   sang trang dài hơn viewport nếu không có cơ chế cuộn + tổng hợp.
2. **Construct — chấm điểm grounding phụ thuộc parser:** attempt 1 của RQ4 sai do
   harness chấm sai chuẩn tọa độ 0–1000 của Qwen (tư liệu:
   `grounding-results-invalid-attempt1.csv`); kết quả công bố dùng parser đã sửa
   và lưu raw answer để audit. Tái kiểm chứng độc lập 19/09/2026 (N=720, gấp đôi
   nhờ chạy benchmark 2 lần) phát hiện thêm: **2/720 lượt gọi (0,28%) có câu trả
   lời không đúng định dạng để trích tọa độ** (`error: "unparseable answer"`),
   độc lập với điều kiện che dữ liệu (1/2 lượt rơi vào ảnh không che). Ở N=360
   gốc, xác suất bắt được lỗi hiếm này thấp nên không quan sát thấy — minh họa
   rằng "hit-rate 100%" công bố ở N nhỏ có thể không giữ nguyên khi tăng N, dù
   không phải do suy giảm khả năng định vị mà do tỉ lệ lỗi định dạng câu trả lời
   khác 0 (bản vá `benchmark.mjs` xử lý bằng cách tính là 1 lượt trượt thay vì bỏ
   qua, xem mục 4.5).
3. **Internal — baseline là "trường hợp xấu" (worst case) có chủ ý:** suite
   locator dùng selector cấu trúc (nth-child) và neo văn bản (XPath text) cố
   định — đại diện cho lớp test giòn phổ biến trong thực tế, và là cận dưới về
   độ bền vững của phương pháp locator. Một baseline theo best practice
   (`getByRole`, `data-testid`) sẽ bền hơn trước V3 (đổi nhãn) và một phần V2;
   tuy nhiên (i) `data-testid` đòi quyền sửa mã ứng dụng — không phải lúc nào
   cũng có trong kiểm thử thực tế, và (ii) nhóm test D nhắm vào các thành phần
   không có nhãn ngữ nghĩa (icon SVG trần, canvas, div thuần) — nơi selector
   cấu trúc gần như là lựa chọn duy nhất và best practice không thay đổi được
   kết cục. Vì vậy kết quả RQ1/RQ2 phải được đọc trong phạm vi lớp selector
   này: khoảng cách so với VLM là khoảng cách với cận dưới của locator, không
   phải với mọi bộ test locator. Việc bổ sung một baseline best-practice làm
   "cận trên" được ghi ở hướng phát triển (mục 5.4).
4. **External — một ứng dụng, một model:** app mẫu nhỏ (12 dòng dữ liệu, mock),
   một model duy nhất (Qwen3-VL 235B qua OpenRouter), biến thể giao diện là thay
   đổi có kiểm soát một chiều; không khái quát sang app phức tạp, model khác hay
   redesign lớn.
5. **Internal — bảo trì bằng quy trình tự động (RQ2):** việc sửa do một AI coding
   agent chuẩn hóa thực hiện (thiết kế trong đề cương, nhằm chống thiên lệch giữa
   hai bộ và tái lập được). Chỉ số **số-test-sửa** bất biến theo tác nhân sửa (xác
   nhận bằng tái kiểm chứng độc lập, mục 4.3): mọi tác nhân tuân thủ đúng "sửa tối
   thiểu" đều sửa đúng cùng 9/6 test ở V2/V3. Chỉ số **diff-LOC** thì KHÔNG hoàn
   toàn bất biến — tái kiểm chứng cho thấy việc tiện thể cập nhật vài dòng comment
   lỗi thời (hành vi hợp lý, không ảnh hưởng kết quả test) đủ làm LOC của V2 lệch
   24→30 dòng dù test sửa và kết quả pass/fail giữ nguyên; con số LOC công bố ở
   mục 4.3 là cận dưới ("chỉ sửa đúng dòng bắt buộc"), không phải giá trị duy nhất
   có thể quan sát được với cùng một bộ test hỏng. Riêng **thời gian phục hồi** là
   thời gian của tác nhân tự động, KHÔNG đại diện cho công sức bảo trì thủ công của
   kỹ sư kiểm thử — chỉ dùng để so sánh tương đối giữa hai bộ test trong cùng quy trình.
6. **Conclusion — kết quả tất định che khuất phương sai tiềm ẩn:** flakiness = 0
   đo được ở temperature = 0 với input tĩnh; thay đổi nhỏ về render (font, AA,
   độ phân giải) hoặc provider routing có thể tạo phương sai chưa quan sát được.

---

Ghi chú khi chuyển vào báo cáo chính thức: (1) đánh số lại hình/bảng theo
template của khoa (bản DOCX sinh tự động đã nhúng đủ hình); (2) đã hoàn tất
trích dẫn chéo với danh mục tham khảo 27 công trình (19/09/2026): GPTDroid
[15], VETL [25], VisionDroid/Trident [16], ITeM [2] cho luận điểm "test theo ý
định", NaviQAte [22] cho mức trần độ tin cậy agent, VLM-Fuzz [5] cho cách kiểm
soát chi phí gọi VLM theo yêu cầu.
