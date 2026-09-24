# Chương 2 — Cơ sở lý thuyết và khảo sát liên quan (BẢN NHÁP ĐẦY ĐỦ)

> Nháp cập nhật 19/09/2026: mở rộng khảo sát từ 15 lên 27 công trình (bổ sung
> 12 bài 2024–2026, đã loại 1 bài trùng — VETL). Nguồn 12 bài mới tổng hợp từ
> `VLM_GUI_Testing_ResearchGap_v2.xlsx` (đọc trực tiếp bài gốc, có DOI/link xác
> minh cho từng bài). Số [n] đã đánh số lại toàn bộ theo thứ tự alphabet tên
> tác giả đầu — khớp `tai-lieu-tham-khao.md` phiên bản mới, KHÔNG còn khớp số
> cũ trong các bản nháp trước 19/09/2026.

Chương này trình bày nền tảng lý thuyết của hai cách tiếp cận kiểm thử GUI được
so sánh trong đồ án (2.1), khảo sát có hệ thống 27 công trình tiêu biểu giai
đoạn 2023–2026 theo bốn nhóm (2.2), phân tích sâu các công trình đại diện
(2.3), và định vị đóng góp của đồ án trong bức tranh đó, đối chiếu trực tiếp
với bảng khoảng trống chiến lược của một khảo sát 55 công trình độc lập (2.4).

## 2.1. Cơ sở lý thuyết

### 2.1.1. Kiểm thử GUI tự động và cách tiếp cận locator-based

Kiểm thử GUI tự động mô phỏng thao tác người dùng trên giao diện (điền form,
bấm nút, đọc kết quả) và so khớp trạng thái quan sát được với kỳ vọng (test
oracle). Trong hệ sinh thái web, mô hình chủ đạo là **script hóa với locator**:
mỗi bước tương tác định vị phần tử qua CSS selector, XPath hoặc thuộc tính
accessibility, rồi gọi hành động trên phần tử đó. Playwright — framework được
dùng làm baseline của đồ án — bổ sung các cơ chế hiện đại như auto-wait (tự chờ
phần tử sẵn sàng), quản lý trình duyệt và tự khởi động ứng dụng được kiểm thử,
giúp loại phần lớn flakiness do timing.

Điểm yếu cấu trúc của mô hình này nằm ở chính locator. Có thể phân ba nguyên
nhân gãy test kinh điển: (i) **đổi hình thức** (màu sắc, theme) — thường vô hại
vì DOM không đổi; (ii) **đổi cấu trúc** (đảo thứ tự cột, chuyển bố cục) — làm
sai mọi selector định vị theo vị trí như `nth-child`; (iii) **đổi nhãn** (đổi
chữ trên nút, placeholder) — làm sai mọi selector neo văn bản như XPath
`text()`. Thực hành tốt (dùng `getByRole`, `data-testid`) giảm được một phần
rủi ro, nhưng không áp dụng được cho các thành phần tùy biến không có nhãn ngữ
nghĩa — icon-button vẽ SVG, widget canvas, hàng danh sách là `div` thuần — nơi
selector cấu trúc gần như là lựa chọn duy nhất. Ba nguyên nhân này chính là ba
loại biến thể giao diện V1/V2/V3 được thiết kế ở Chương 3.

### 2.1.2. Mô hình thị giác–ngôn ngữ và bài toán GUI grounding

**VLM** là mô hình đa phương thức ghép một bộ mã hóa thị giác (vision encoder)
với một mô hình ngôn ngữ lớn, cho phép nhận đầu vào ảnh + văn bản và sinh văn
bản. Với kiểm thử GUI, hai năng lực quan trọng nhất là: **hiểu màn hình** (đọc
screenshot, nhận biết bảng/nút/form và trạng thái của chúng) và **GUI
grounding** — định vị tọa độ của phần tử trên ảnh từ một mô tả ngôn ngữ ("nút
xóa ở hàng đầu tiên"). Grounding là mắt xích quyết định: mọi hành động (click,
điền) đều cần tọa độ đúng.

Một dòng model được huấn luyện chuyên cho GUI đã hình thành: CogAgent, Ferret-UI,
SeeClick, UI-TARS, và họ Qwen-VL. Đồ án dùng **Qwen3-VL** (bản open-weight
235B-A22B); một đặc điểm kỹ thuật đáng lưu ý là họ Qwen-VL trả tọa độ grounding
theo quy ước **chuẩn hóa 0–1000** bất kể chỉ dẫn trong prompt — chi tiết và hệ
quả đo lường được phân tích ở mục 4.7. Trên các model này, một lớp **GUI agent**
đã phát triển (AppAgent, Mobile-Agent, WebVoyager): vòng lặp quan sát màn hình →
suy luận → hành động, nhằm hoàn thành nhiệm vụ mô tả bằng ngôn ngữ tự nhiên.

### 2.1.3. Kiểm thử GUI bằng ngôn ngữ tự nhiên với Midscene.js

Midscene.js là framework mã nguồn mở cho phép viết kịch bản kiểm thử web bằng
ngôn ngữ tự nhiên trên nền Playwright, qua họ API `aiTap`, `aiInput`,
`aiAssert`, `aiNumber`, `aiQuery`... Mỗi lời gọi chụp screenshot hiện thời, gửi
kèm mô tả tới VLM; framework tách hai vai trò **planning** (hiểu ý định, quyết
định hành động) và **grounding** (định vị tọa độ trên ảnh), rồi thực thi hành
động qua Playwright. Cấu hình `MIDSCENE_MODEL_FAMILY` cho phép framework áp
dụng đúng quy ước riêng của từng họ model (định dạng prompt, quy ước tọa độ).
Đồ án chọn Midscene.js vì: hỗ trợ web chính thức, tách lớp model rõ ràng (ghim
được model qua biến môi trường), và có cơ chế tường minh để tắt cache — điều
kiện cần để đo flakiness trung thực.

### 2.1.4. Khía cạnh bảo mật liên quan

Hai mục trong OWASP Top 10 làm nền cho phần mở rộng của đồ án. **Broken Access
Control** — lớp lỗi phổ biến nhất — có một biểu hiện front-end: phần tử giao
diện của vai trò quyền cao (nút xóa, trang quản trị, cột dữ liệu nhạy cảm) hiển
thị nhầm cho vai trò quyền thấp; RQ3 kiểm thử đúng lớp biểu hiện này. **Sensitive
Data Exposure** đặt ra vấn đề đặc thù cho kiểm thử bằng VLM: screenshot gửi lên
API bên thứ ba có thể chứa PII (họ tên, số thẻ, liên hệ) — dữ liệu rời khỏi hạ
tầng nội bộ ngay trong quá trình kiểm thử; RQ4 khảo sát giải pháp che ảnh trước
khi gửi và cái giá phải trả về độ chính xác định vị.

## 2.2. Khảo sát công trình liên quan (2023–2026)

Khảo sát mở rộng lên **27 công trình** (15 công trình đợt đầu + 12 công trình bổ
sung 2024–2026, sau khi loại một bài trùng — VETL xuất hiện ở cả hai đợt tìm
kiếm độc lập), tổ chức theo bốn nhóm: khảo sát nền (4 bài), nhánh LLM text-based
(9 bài), nhánh VLM vision-based cho kiểm thử chức năng (7 bài), và nhánh VLM cho
các bài toán GUI chuyên biệt/liên ngành (7 bài) — nhóm cuối là phần mở rộng đáng
kể nhất so với đợt khảo sát đầu, cho thấy phạm vi ứng dụng của VLM trong GUI đã
vượt xa kiểm thử chức năng thông thường.

### 2.2.1. Nhánh khảo sát nền (survey)

Bốn bài tổng quan hệ thống, độc lập về thời gian và nhóm tác giả, hội tụ về
cùng một số khoảng trống — bằng chứng hội tụ đáng tin cậy hơn một khảo sát đơn
lẻ. **Wang et al. [24]** (IEEE TSE 2024) phân loại 102 công trình dùng LLM cho
kiểm thử phần mềm nói chung theo hai trục (nhiệm vụ kiểm thử × cách dùng LLM),
xác nhận phần lớn dùng prompt engineering thay vì fine-tuning. **Yu et al. [26]**
(ACM CSUR) khảo sát 271 bài giai đoạn tiền-LLM về vision-based GUI testing,
hoàn thành trước làn sóng VLM đa phương thức nên không phủ các công cụ như
Midscene. **Chaikovskyi và Malakhov [4]** mở rộng hướng này tới 2025, đề xuất
taxonomy ba chiều (kỹ thuật × tác vụ × miền ứng dụng) và tổng hợp thực nghiệm số
liệu đã công bố — nổi bật: ViT vượt CNN ở layout phức tạp, RL agent DQN đạt
85,2% chọn đúng sự kiện so với 51,6% của khám phá ngẫu nhiên, và pipeline
multimodal ScenGen đạt 97,76% độ chính xác định vị. Bài này cùng nhóm tác giả
còn có một bài ngắn hơn, tính học thuật thấp hơn **[3]** (kỷ yếu hội nghị đa
ngành, 3 trang) — chỉ dùng làm tài liệu bối cảnh, không phải nguồn phương pháp.

Quan trọng nhất cho việc định vị đồ án là **Mai et al. [19]** (PeerJ Computer
Science 2026) — khảo sát process-centric 55 công trình lõi (01/2023–07/2025),
tổ chức theo **vòng đời kiểm thử** (Sinh kịch bản & Lập kế hoạch → Thực thi →
Báo cáo) thay vì theo thành phần kiến trúc đơn lẻ. Bảng khoảng trống chiến lược
(Table 11) của bài này nêu bốn hướng mà lĩnh vực còn bỏ ngỏ, ba trong số đó ánh
xạ gần như trực tiếp vào bốn RQ của đồ án — trình bày chi tiết ở mục 2.4.

### 2.2.2. Nhánh LLM text-based (đầu vào là DOM/metadata)

Giữ nguyên như đợt khảo sát đầu — chín công trình dùng LLM trên **văn bản**
trích từ view hierarchy/accessibility tree/DOM, cùng chất liệu với locator
truyền thống nên kế thừa cả điểm mạnh lẫn điểm yếu của chất liệu đó:

- **Liu et al. [15]** (GPTDroid, ICSE 2024) — phân tích sâu tại 2.3.
- **Liu et al. [17]** (QTypist, ICSE 2023) giải nút thắt text input, nâng
  passing rate lên 87%; chỉ giải quyết khâu input, không đụng oracle.
- **Wang et al. [23]** (LLMDroid, FSE 2025) tối ưu chi phí: GPT-4o $4,77/giờ,
  phương án rẻ đạt 78% hiệu năng với $0,18/giờ — hình mẫu cho cách đồ án đo chi
  phí vận hành.
- **Liu et al. [14]** (Temac, 2025) đa agent LLM khi coverage bão hòa, tăng
  12,5–60,3% coverage; chi phí nhiều vòng gọi chưa được báo cáo.
- **Shahbandeh et al. [22]** (NaviQAte, 2024) điều hướng web theo mô tả chức
  năng trừu tượng: success rate 44,2%/38,5% — bằng chứng agent tự trị trên web
  thực còn xa mức tin cậy.
- **Cao et al. [2]** (ITeM, ISSTA 2025) migrate test bằng cách trích ý định
  (intention) — luận điểm lý thuyết sát nhất với giả thuyết đồ án.
- **Ran et al. [21]** (Guardian, ISSTA 2024) tách phần việc xác định sang
  chương trình symbolic ở runtime — gợi ý khung phân tích lỗi (planning sai vs
  grounding sai) đồ án dùng ở mục 3.11.
- **Alian et al. [1]** (AutoE2E, ICSE 2025) và **Ju et al. [12]** (nghiên cứu
  MLLM-oracle) giữ nguyên vai trò như đợt khảo sát đầu.

### 2.2.3. Nhánh VLM vision-based cho kiểm thử chức năng

Bảy công trình model "nhìn" pixel, độc lập với DOM — đúng phương pháp đồ án
đánh giá:

- **Wang et al. [25]** (VETL, ICSME 2024) — công trình web+VLM gần đồ án nhất,
  phân tích sâu tại 2.3 với dữ liệu đầy đủ hơn từ đợt khảo sát bổ sung.
- **Liu et al. [16]** (VisionDroid/Trident) — phân tích sâu tại 2.3.
- **Hu et al. [10]** (AUITestAgent) tách interaction/verification, giống cặp
  API `ai`/`aiAssert` của Midscene.
- **Zhao et al. [27]** (GTArena) benchmark dùng app cấy lỗi nhân tạo — tiền lệ
  trực tiếp cho cách đồ án xây build `rq3-seeded-bugs`.
- **Demissie et al. [5]** (VLM-Fuzz, ESE 2026) kết hợp DFS heuristic với VLM
  gọi **theo yêu cầu** (chỉ khi màn hình phức tạp về thị giác) thay vì gọi cho
  mọi bước — đạt độ bao phủ 68,5%/53,2%/46,5% (class/method/line), vượt SOTA
  2,1–9,0 điểm %, và phát hiện 52 lỗi thật trên 80 app Google Play. Điểm đáng
  chú ý nhất cho đồ án: tác giả chủ động **rút ngắn thời gian thí nghiệm để
  hạn chế model drift** — cùng lo ngại đồ án gặp phải khi tái kiểm chứng ở
  Chương 4 (model qua API thương mại có thể thay đổi hành vi giữa hai lần đo).
- **Feng et al. [7]** (ViBR, FSE 2026) dùng VLM đối chiếu tính nhất quán trạng
  thái giao diện giữa các thiết bị để tái hiện lỗi từ video, không cần đồ thị
  chuyển trạng thái dựng sẵn — tái hiện thành công 72,0% so với 41,4% của
  baseline chỉ dùng văn bản; nhóm tác giả định lượng tỉ lệ ảo giác **dưới 2%**
  qua phân tích thủ công — con số hiếm hoi trong khảo sát định lượng được đúng
  loại lỗi Nhóm 3 mà đồ án định nghĩa ở mục 3.11.
- **Wang et al. [25]** (đã liệt kê) và mục Threats to Validity của **[5], [7]**
  đều dùng chiến lược "chạy lặp lại N lần lấy trung bình" để kiểm soát tính
  ngẫu nhiên của VLM — cùng giao thức đồ án áp dụng cho RQ1/RQ2.

### 2.2.4. Nhánh mở rộng: VLM cho các bài toán GUI chuyên biệt (2024–2026)

Đây là nhóm hoàn toàn mới so với đợt khảo sát đầu, cho thấy VLM trong GUI đã mở
rộng ra ngoài kiểm thử chức năng web/mobile thông thường — củng cố luận điểm
"lĩnh vực trưởng thành về năng lực nhưng thiếu bằng chứng so sánh có kiểm soát"
ở mục 2.4:

- **Ernhofer et al. [6]** fine-tune Molmo-7B bằng LoRA cho UI ô tô
  (ELAM-7B), công bố benchmark AutomotiveUI-Bench-4K (998 ảnh/15 hãng xe); cải
  thiện 6,1–16,3% so với baseline nhưng vẫn kém chuyên gia con người
  (80,8% so với 94,5%) — cùng khoảng cách "gần nhưng chưa bằng con người" đồ
  án quan sát được ở RQ3 (VLM 5/5 ngang locator, không vượt trội).
- **Jiang et al. [11]** (ILuvUI) sinh 353K mẫu hội thoại UI **hoàn toàn không
  cần chú thích người** bằng cách kết hợp UI element detector với GPT-3.5;
  vượt LLaVA gốc ở mọi tác vụ hiểu UI và vượt cả GPT-4V ở tác vụ UI
  Verification (72,0% so với 59,0%) — minh chứng thêm cho tiềm năng suy luận
  ngữ nghĩa UI của kiến trúc VLM nói chung.
- **Grewal et al. [8]** (XBIDetective) — nghiên cứu **đầu tiên** dùng VLM phát
  hiện cross-browser inconsistency, hợp tác trực tiếp với Mozilla, đánh giá
  trên 1.695 website thực tế; ghi nhận minh bạch một hạn chế đồng dạng với đồ
  án: *"mô hình VLM thay đổi liên tục nên kết quả có thể khác với các phiên
  bản VLM mới hơn"* — đúng hiện tượng đồ án gặp phải khi tái kiểm chứng D1/V3 ở
  Chương 4.
- **Qi et al. [20]** đánh giá GPT-4o cho VR exploration testing qua 5 RQ con;
  phát hiện quan trọng nhất: **confidence score của VLM không tương quan với
  tính đúng/sai của quyết định** — mô hình có thể rất tự tin ngay cả khi sai,
  và GPT-4o thất bại hoàn toàn ở tác vụ gán nhãn trực quan (vẽ bounding box)
  do hạn chế xử lý dữ liệu pixel-level.
- **Haque và Csallner [9]** (IconDesc) sinh alt-text accessibility cho icon từ
  dữ liệu màn hình **không đầy đủ**, vượt trội cả trên ảnh full-screen lẫn
  partial-screen so với Pix2Struct/PaliGemma; nêu rõ nguyên nhân lỗi cụ thể
  (icon dễ nhầm hình dạng, DOM resource-id gây nhiễu) — cùng cách tiếp cận
  phân loại nguyên nhân lỗi mà đồ án dùng ở mục 3.11.
- **Macklon và Bezemer [18]** dùng GPT-4o phát hiện visual bug trong ứng dụng
  HTML5 `<canvas>` — miền hoàn toàn không có DOM để locator truy vấn; chiến
  lược prompting tốt nhất đạt 100% accuracy trên một ứng dụng cụ thể nhưng chỉ
  39% trên toàn bộ 100 ảnh, biến động rất lớn giữa các ứng dụng — minh họa rõ
  ràng phương sai theo ngữ cảnh mà một phép đo trung bình đơn lẻ có thể che
  khuất, đúng cảnh báo đồ án nêu ở Threats to Validity mục 4.7.
- **Kweon et al. [13]** (GhostUI, CHI 2026) chỉ ra một giới hạn nền tảng của
  mọi VLM agent GUI: chỉ "nhìn thấy" những gì hiển thị trên ảnh chụp màn hình
  nên **không thể suy luận các tương tác ẩn** (vuốt, nhấn giữ không có gợi ý
  thị giác) — đóng góp bộ dữ liệu 1.970 tương tác ẩn từ 81 app Android. Giới
  hạn này không ảnh hưởng trực tiếp đến phạm vi đồ án (ứng dụng mẫu dùng thao
  tác click/tap tiêu chuẩn, luôn có gợi ý thị giác), nhưng đáng ghi nhận như
  một ranh giới năng lực của phương pháp VLM nói chung khi mở rộng phạm vi ứng
  dụng trong tương lai (mục "Hướng phát triển").

### 2.2.5. Bảng tổng hợp

Bảng 2.1 đối chiếu 27 công trình trên sáu tiêu chí; bốn cột cuối tương ứng các
khoảng trống đồ án lấp — gần như trống toàn bộ ở 27 hàng khảo sát, kể cả sau
khi mở rộng đáng kể phạm vi tìm kiếm:

**Bảng 2.1 — Đối chiếu 27 công trình liên quan trên sáu tiêu chí**

| # | Công trình | Miền | Tín hiệu vào | Nhiệm vụ chính | So sánh cặp locator↔VLM | Đo chi phí bảo trì | Xét bảo mật/RBAC |
|---|---|---|---|---|:-:|:-:|:-:|
| [19] | Mai et al., PeerJ CS'26 | tổng quát | — | khảo sát 55 công trình theo vòng đời | — | — | — (nêu là gap) |
| [24] | Wang et al., TSE'24 | tổng quát | — | khảo sát 102 công trình | — | — | — |
| [4] | Chaikovskyi & Malakhov, AAIT'25 | tổng quát | — | khảo sát + taxonomy 3 chiều | — | — | — |
| [26] | Yu et al., CSUR | mobile | vision | khảo sát tiền-LLM (271 bài) | — | — | — |
| [15] | GPTDroid, ICSE'24 | mobile | text | khám phá + phát hiện bug | — | — | — |
| [25] | VETL, ICSME'24 | web | vision | sinh input + chọn phần tử | — | — | — |
| [16] | VisionDroid/Trident | mobile | vision | oracle non-crash bug | — | — | — |
| [17] | QTypist, ICSE'23 | mobile | text | sinh text input | — | — | — |
| [23] | LLMDroid, FSE'25 | mobile | text | dẫn hướng coverage | — | △ | — |
| [10] | AUITestAgent | mobile | text+vision | kiểm thử theo yêu cầu NL | — | — | — |
| [27] | GTArena | mobile | vision | benchmark + app cấy lỗi | — | — | — |
| [14] | Temac | web | text | đa agent tăng coverage | — | — | — |
| [22] | NaviQAte | web | text+vision | điều hướng theo chức năng | — | — | — |
| [1] | AutoE2E, ICSE'25 | web | text | sinh test E2E theo feature | — | — | — |
| [12] | Nghiên cứu MLLM-oracle | mobile | vision | oracle non-crash bug | — | — | — |
| [2] | ITeM, ISSTA'25 | mobile | text | migrate test theo ý định | — | △ | — |
| [21] | Guardian, ISSTA'24 | mobile | text | kiểm soát runtime cho agent | — | — | — |
| [5] | VLM-Fuzz, ESE'26 | mobile | vision (theo yêu cầu) | fuzzing + coverage | — | — | — |
| [7] | ViBR, FSE'26 | mobile | vision | tái hiện lỗi từ video | — | — | — |
| [6] | ELAM/AutomotiveUI, arXiv'25 | ô tô | vision | grounding + evaluate | — | — | — |
| [11] | ILuvUI, IUI'25 | mobile | vision | hiểu UI + verification | — | — | — |
| [8] | XBIDetective, arXiv'25 | web | vision | cross-browser bug | — | — | — |
| [20] | VR exploration, ASE'26 | VR | vision | entity detection | — | — | — |
| [9] | IconDesc, arXiv'24 | mobile | vision (partial) | alt-text accessibility | — | — | — |
| [18] | Canvas bug, arXiv'25 | web (canvas) | vision | visual bug detection | — | — | — |
| [13] | GhostUI, CHI'26 | mobile | vision | phát hiện tương tác ẩn | — | — | — |
| — | **Đồ án này** | **web** | **cả hai (đối chứng)** | **so sánh định lượng 2 phương pháp + RBAC + masking** | **✓** | **✓** | **✓** |

Chú giải: ✓ = có, trực tiếp; △ = chạm một phần (LLMDroid chỉ đo chi phí vận
hành $/giờ, không đo chi phí bảo trì; ITeM migrate test giữa các app — gần khái
niệm bảo trì nhưng không đo theo cặp phương pháp trên cùng ứng dụng); — = không
đề cập.

## 2.3. Phân tích sâu các công trình đại diện

**Mai et al. [19] (PeerJ Computer Science 2026).** Khảo sát process-centric 55
công trình lõi, tổ chức theo vòng đời kiểm thử (Sinh kịch bản & Lập kế hoạch →
Thực thi → Báo cáo) thay vì theo kiến trúc đơn lẻ — khung tổ chức này được đồ
án mượn một phần để định vị vị trí của mình trong vòng đời (đồ án đo ở pha
**Thực thi**, không đụng đến Sinh kịch bản/Lập kế hoạch, vì cả hai bộ test đều
do người thiết kế để đảm bảo tính đối xứng của so sánh). Phát hiện đáng chú ý
nhất: pha **Execution (A3)** được nghiên cứu nhiều nhất trong 55 công trình,
trong khi pha **Maintenance (A5)** là khoảng trống lớn nhất — khớp chính xác
với vị trí đồ án nhắm tới (RQ2 đo trực tiếp chi phí bảo trì, pha ít được khảo
sát nhất). Bảng khoảng trống chiến lược (Table 11) của bài này được phân tích
chi tiết ở mục 2.4.

**Wang et al. [15] (GPTDroid, ICSE 2024).** Đặt kiểm thử GUI mobile thành bài
toán hỏi–đáp: trích thông tin trang GUI từ view hierarchy thành văn bản, LLM
sinh hành động, thực thi rồi phản hồi ngược. Kết quả nổi bật (32% hơn baseline
tốt nhất về activity coverage, 31% nhiều bug hơn, 35 bug mới được xác nhận trên
Google Play) chứng minh giá trị của việc LLM "hiểu ngữ nghĩa chức năng". Nhưng
toàn bộ pipeline là text-based: không nhìn pixel, phụ thuộc chất lượng
accessibility tree — cùng họ hạn chế với locator truyền thống. GPTDroid đại
diện cho "cận trên" của nhánh text-based, làm điểm đối chiếu khái niệm với
nhánh vision-based.

**Wang et al. [25] (VETL, ICSME 2024).** Công trình web GUI testing đầu tiên
dẫn hướng bởi LVLM: sinh text input từ hiểu cảnh trên screenshot; chọn phần tử
bằng visual question-answering thay vì trích thuộc tính DOM. Ba lý do tác giả
nêu tường minh lý giải vì sao kỹ thuật LLM-cho-mobile không áp dụng trực tiếp
được cho web — GUI web giàu nội dung hơn (khó trích ngữ cảnh), thuộc tính DOM
ít mang ngữ nghĩa hơn (khảo sát 20 website top cho thấy chỉ 2/11 site hỗ trợ
đăng nhập bằng số điện thoại có thuộc tính DOM ghi rõ "phone"), và input sinh
ra chưa được tận dụng để dẫn dắt khám phá tiếp theo. Kết quả: hơn 25% unique
web action so với WebExplor, tìm được bug thật được maintainer xác nhận (lỗi
401 khi đăng ký tài khoản Foursquare). VETL là công trình gần đồ án nhất
(VLM + web) và cung cấp luận cứ trực tiếp rằng lựa chọn phần tử bằng thị giác
tránh được sự phụ thuộc vào thuộc tính DOM mong manh. Điều VETL không trả lời —
và đồ án trả lời — là: so với một baseline locator trên cùng bộ kịch bản, độ
bền vững hơn bao nhiêu, chi phí gọi model và độ ổn định giữa các lần chạy ra
sao (paper không báo cáo hai số liệu sau).

**Liu et al. [16] (VisionDroid/Trident, preprint 2024).** Nhắm lớp non-crash
functional bug — hành vi sai chỉ nhận ra được bằng mắt: pipeline vision-driven
trên GPT-4V. Kết quả trên benchmark 590 bug: recall tăng 14–112%, precision
tăng 108–147% so với baseline tốt nhất; 43 bug mới trên Google Play. Đây là
minh chứng mạnh nhất cho năng lực "nhìn để phát hiện sai lệch UI" — nền tảng
cho thiết kế oracle thị giác của RQ3. Hạn chế của nó (precision v1 chỉ
50–76%) giải thích vì sao đồ án đưa cả kịch bản đối chứng R6–R8 và build sạch
vào thiết kế RQ3.

**Demissie et al. [5] (VLM-Fuzz, Empirical Software Engineering 2026).** Đáng
chú ý không phải vì kết quả (dù ấn tượng: 68,5% class coverage, vượt SOTA 9,0
điểm %, phát hiện 52 lỗi thật) mà vì **cách kiểm soát chi phí**: thay vì gọi
VLM cho mọi bước tương tác, VLM-Fuzz chỉ gọi *theo yêu cầu* khi heuristic phát
hiện màn hình phức tạp về thị giác — kiến trúc lai giữa quy tắc rẻ và suy luận
đắt. Đồ án không dùng kiến trúc lai (mỗi bộ test thuần một phương pháp để giữ
tính đối xứng của so sánh), nhưng số liệu chi phí của VLM-Fuzz (ablation cho
thấy VLM hữu ích nhất ở màn hình phức tạp, chi phí cao nếu dùng cho mọi bước)
củng cố trực tiếp kết luận RQ1/RQ2 của đồ án: chi phí VLM có ý nghĩa thực tiễn
đủ lớn để việc "gọi khi nào" trở thành quyết định thiết kế quan trọng, không
chỉ là chi tiết cài đặt.

## 2.4. Định vị đóng góp của đồ án

Bức tranh khảo sát mở rộng (27 công trình, bốn khảo sát nền độc lập) xác nhận
lại và làm rõ hơn ba khoảng trống đã nêu ở đợt khảo sát đầu: chưa công trình
nào đặt locator-based và VLM-based cạnh nhau trên cùng một bộ test, cùng một
ứng dụng, với thay đổi giao diện được kiểm soát chủ động, đo đồng thời
robustness — chi phí bảo trì — chi phí vận hành.

Đáng chú ý hơn, bảng khoảng trống chiến lược của **Mai et al. [19]** (Table 11)
— tổng hợp từ 55 công trình, độc lập hoàn toàn với thiết kế đồ án — nêu bốn
hướng nghiên cứu mở, ba trong số đó ánh xạ trực tiếp vào phạm vi bốn RQ:

**Bảng 2.2 — Khoảng trống chiến lược ([19], Table 11) đối chiếu với 4 RQ của đồ án**

| Khoảng trống chiến lược ([19], Table 11) | Mô tả gốc (rút gọn) | Liên hệ với đồ án |
|---|---|---|
| **CI/CD Speed-Intelligence Paradox** | VLM cần 10–15s/bước, tính ngẫu nhiên phá vỡ niềm tin CI; "khi giao diện thay đổi, làm sao di trú test case hiệu quả?" | **RQ1 + RQ2** đo trực tiếp cả hai vế: độ bền vững khi giao diện đổi (thay vì di trú, đo luôn bộ VLM có cần sửa không) và thời gian/chi phí mỗi lần chạy |
| **Testing for Business Process** | Agent hiện tại xem GUI như "nhà thám hiểm đơn lẻ", đánh giá thấp phân quyền theo vai trò (role-based access) vốn là bản chất quy trình nghiệp vụ | **RQ3** dùng VLM kiểm thử phân quyền hiển thị (RBAC) — phạm vi hẹp hơn "quy trình nghiệp vụ nhiều bước" mà [19] hình dung, nhưng là bằng chứng thực nghiệm đầu tiên ở đúng hướng này |
| **Privacy & Compliance** | Gửi dữ liệu ứng dụng lên VLM cloud bên thứ ba có thể vi phạm GDPR/HIPAA; cần "lớp trừu tượng bảo vệ quyền riêng tư" làm sạch đầu vào trước khi rời vùng an toàn | **RQ4** hiện thực hóa chính xác "lớp trừu tượng" này ở mức tiền xử lý ảnh (che PII bằng blur/pixelate trước khi gửi API) và đo đánh đổi độ chính xác |
| Deep Verification & Hidden Logic | Agent không tự tính toán độc lập, dễ bỏ sót lỗi backend/silent failure | Ngoài phạm vi đồ án (đồ án kiểm thử front-end, không đối chiếu logic backend) |

Sự trùng khớp này củng cố đáng kể tính thời sự và giá trị của đề tài: đồ án
không tự nhận định các khoảng trống một cách chủ quan, mà ba trên bốn RQ đều
rơi đúng vào các hướng mà một khảo sát hệ thống 55 công trình, công bố độc lập
(chấp nhận 23/1/2026, cùng khoảng thời gian đồ án triển khai), xác định là còn
bỏ ngỏ.

Đồ án không đề xuất công cụ hay model mới; đóng góp của nó là **bằng chứng thực
nghiệm có kiểm soát**, lấp đúng bốn khoảng trống: (1) so sánh cặp locator↔VLM
có kiểm soát trên 4 biến thể giao diện, trực tiếp trả lời "CI/CD
Speed-Intelligence Paradox"; (2) định lượng chi phí bảo trì theo giao thức
chuẩn hóa, tái lập được, kể cả độ nhạy của chỉ số theo phong cách sửa (mục 4.3);
(3) khảo sát đầu tiên dùng VLM cho kiểm thử phân quyền hiển thị theo hướng
"Testing for Business Process" (RQ3); (4) khảo sát đầu tiên đo đánh đổi
masking-PII↔độ chính xác định vị theo đúng hướng "Privacy & Compliance"
(RQ4). Phương pháp đạt các mục tiêu đó được trình bày ở chương tiếp theo.
