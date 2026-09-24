# Chương 5 — Kết luận và hướng phát triển (BẢN NHÁP ĐẦY ĐỦ)

> Nháp hoàn chỉnh 09/07/2026. Số liệu lấy từ Chương 4; đối chiếu contribution
> theo Step 4 của hướng dẫn GVHD.

Đồ án đã thực hiện một nghiên cứu thực nghiệm so sánh định lượng giữa kiểm thử
GUI dựa trên locator truyền thống (Playwright) và kiểm thử dựa trên VLM
(Midscene.js + Qwen3-VL) trên cùng một ứng dụng web mẫu, cùng một bộ 18 kịch
bản, với 4 biến thể giao diện được kiểm soát chủ động và mỗi phép đo lặp 5 lần.
Chương này tổng kết câu trả lời cho bốn câu hỏi nghiên cứu (5.1), đối chiếu các
đóng góp cam kết với sản phẩm thực tế (5.2), thừa nhận các hạn chế (5.3) và đề
xuất hướng phát triển (5.4).

## 5.1. Trả lời các câu hỏi nghiên cứu

**RQ1 — Độ bền vững.** Bộ test VLM pass **18/18 trên cả bốn biến thể giao diện**
mà không sửa một dòng nào; bộ locator giữ 18/18 trên biến thể đổi theme (V1)
nhưng rơi còn **9/18 (50%)** khi đổi bố cục (V2) và **12/18 (67%)** khi đổi
icon/nhãn (V3). Cả hai phương pháp đều hoàn toàn ổn định (flakiness = 0 qua 5
lần lặp; với VLM là ở cấu hình temperature 0, cache tắt, model ghim). Cái giá
của độ bền vững: mỗi lượt chạy VLM tốn ~7–10 phút và ~$0,05 so với ~3 giây và $0
của locator. Kết luận: với thay đổi thuần trình bày, VLM bền vững hơn hẳn; khác
biệt lớn nhất nằm ở chi phí thời gian vận hành, không phải tiền API.

**RQ2 — Chi phí bảo trì.** Để phục hồi 18/18 sau khi giao diện đổi, bộ locator
cần sửa tổng cộng **15 lượt test / 46 LOC**, với thời gian phục hồi theo quy
trình chuẩn hóa là **177 giây (V2)** và **137 giây (V3)**; bộ VLM cần **0 test,
0 LOC, 0 giây** trên cả ba biến thể. Quy trình bảo trì chuẩn hóa (AI agent với
chỉ dẫn sửa-tối-thiểu cố định) được kiểm chứng tái lập: hai lần chạy độc lập
cho nội dung sửa trùng khớp từng dòng. Kết luận: chi phí của VLM dịch chuyển từ
"bảo trì khi giao diện đổi" sang "vận hành mỗi lần chạy" — hai chế độ chi phí
phù hợp hai bối cảnh sử dụng khác nhau (thảo luận hòa vốn tại mục 4.3/4.6).

**RQ3 — Kiểm thử phân quyền hiển thị.** Trên build cấy 5 lỗi phân quyền cố ý,
cả hai phương pháp phát hiện **5/5 lỗi, ổn định qua 5 lần lặp, không một báo
động giả** (8 kịch bản × build sạch và 3 kịch bản đối chứng × build lỗi đều
sạch). Chi phí VLM cho suite RBAC chỉ ~$0,005/lượt chạy. Kết luận: VLM dùng
được cho kiểm thử phân quyền hiển thị với độ chính xác ngang baseline; giá trị
gia tăng của nó nằm ở chỗ kịch bản viết bằng ngôn ngữ tự nhiên nên kế thừa độ
bền vững trước thay đổi giao diện đã chứng minh ở RQ1.

**RQ4 — Che dữ liệu nhạy cảm.** Che PII bằng blur hoặc pixelate trước khi gửi
screenshot lên VLM API **không làm giảm hit-rate định vị** (100% ở cả ba điều
kiện, 360 lượt gọi, tất định qua 3 lần lặp); ảnh hưởng duy nhất là IoU giảm nhẹ
tại đúng các màn hình có vùng che (tối đa −0,076, pixelate nhiều hơn blur),
trong khi hai màn hình đối chứng không mask giữ nguyên. Kết luận: trong phạm vi
khảo sát bước đầu, có thể bảo vệ dữ liệu nhạy cảm khi kiểm thử bằng VLM mà không
đánh đổi khả năng định vị phần tử.

**Thông điệp tổng.** Trade-off trung tâm đo được của đồ án: phương pháp VLM đổi
~2 bậc độ lớn về thời gian chạy (cộng chi phí API nhỏ) lấy độ bền vững tuyệt đối
trước thay đổi trình bày và chi phí bảo trì bằng 0. Hai phương pháp vì vậy
**bổ trợ chứ không thay thế nhau**: locator phù hợp vòng lặp CI dày trên giao
diện ổn định; VLM phù hợp lớp kiểm thử theo ý định, ít bảo trì, chạy thưa hơn,
hoặc giai đoạn giao diện biến động nhanh.

## 5.2. Đối chiếu đóng góp cam kết với sản phẩm thực tế

**Bảng 5.1 — Đối chiếu đóng góp cam kết với sản phẩm thực tế**

| Đóng góp cam kết (Step 4) | Sản phẩm / bằng chứng trong repo |
|---|---|
| C1 — Bộ dữ liệu thực nghiệm tái sử dụng được | App "Mini Shop Manager" + 4 biến thể cấu hình tập trung (`app/src/variants.ts`), đóng băng tại tag `app-v1.0`, công khai GitHub |
| C2 — Pipeline đánh giá 3 trục | `harness/run-matrix.mjs` (ma trận + token/cost tự động), giao thức bảo trì chuẩn hóa (Phụ lục E), `harness/make-figures.py` (một lệnh sinh toàn bộ hình/bảng) |
| C3 — Bộ số liệu robustness vs cost | `results/raw/matrix-runs.csv` (720 + 160 dòng chính thức), `results/rq2-maintenance.md`, `results/analysis-summary.md` |
| C4 — Cơ chế masking + trade-off | `masking/` (capture → mask → benchmark), `grounding-results.csv` + `raw-calls.jsonl` (audit) |
| C5 — Kiểm thử phân quyền bằng VLM | Suite RBAC 8 kịch bản × 2 phương pháp, nhánh `rq3-seeded-bugs` (5 lỗi cấy, Phụ lục C) |

Ngoài năm đóng góp cam kết, quá trình thực nghiệm còn ghi nhận **hai phát hiện
phương pháp luận** hữu ích cho người làm sau: nhận thức của VLM bị giới hạn
viewport (khác bản chất với truy vấn DOM), và quy ước tọa độ grounding của model
thắng chỉ dẫn trong prompt — cả hai đều ảnh hưởng trực tiếp đến cách thiết kế
phép đo và diễn giải kết quả (mục 4.7).

## 5.3. Hạn chế

- **Phạm vi khái quát hóa:** kết quả đo trên một ứng dụng mẫu cỡ nhỏ (dữ liệu
  mock), một model duy nhất (Qwen3-VL 235B qua OpenRouter), và các biến thể
  giao diện một chiều có kiểm soát; chưa thể suy rộng sang ứng dụng thương mại
  phức tạp, model khác, hay các đợt redesign lớn.
- **Nhận thức giới hạn viewport:** mọi kết quả VLM gắn với điều kiện nội dung
  lọt trọn viewport 1280×1100; trang dài hơn cần cơ chế cuộn + tổng hợp chưa
  được khảo sát.
- **Baseline chủ ý giòn:** bộ locator dùng selector cấu trúc/neo văn bản cố
  định — đại diện "trường hợp xấu" của phương pháp locator; một baseline theo
  best practice sẽ bền hơn trước V2/V3 (dù không giải quyết được các thành phần
  không có nhãn ngữ nghĩa).
- **Thời gian bảo trì đo trên quy trình tự động:** con số 177/137 giây là thời
  gian phục hồi của quy trình agent chuẩn hóa, dùng để so sánh tương đối giữa
  hai bộ test; không đại diện cho công sức của kỹ sư sửa thủ công.
- **Tính tất định có điều kiện:** flakiness = 0 đo ở temperature 0 với input
  tĩnh; thay đổi nhỏ về render hoặc provider routing có thể tạo phương sai chưa
  quan sát được.

## 5.4. Hướng phát triển

1. **Mở rộng nền tảng:** kiểm thử ứng dụng desktop (WinAppDriver — hướng phát
   triển đã ghi trong đề cương) và mobile; trang web dài hơn viewport với cơ chế
   cuộn-và-tổng-hợp nhận thức.
2. **Mở rộng thực nghiệm:** thêm model đối chiếu (UI-TARS bản nhẹ, model
   self-host cho kịch bản dữ liệu nhạy cảm); thêm baseline thứ hai theo best
   practice (`getByRole`/`data-testid`) làm mốc "trường hợp tốt"; áp bộ đo lên
   một ứng dụng mã nguồn mở thực tế.
3. **Hướng bảo mật:** tự động phát hiện vùng PII (bằng OCR hoặc chính VLM) thay
   vì tọa độ biết trước; mở rộng lớp lỗi phân quyền được cấy; khảo sát mức che
   mạnh hơn (che toàn màn trừ vùng thao tác).
4. **Hướng vận hành:** tích hợp CI hai tầng theo gợi ý hòa vốn ở mục 4.6 —
   locator chạy mỗi commit, VLM chạy theo lịch/trước release; cache có kiểm soát
   cho môi trường production (khác môi trường đo lường).

## 5.5. Kết luận chung

Bằng một thiết kế thực nghiệm đối xứng và tái lập được, đồ án đã đưa ra bằng
chứng định lượng cho nhận định thường chỉ được phát biểu định tính: kiểm thử GUI
bằng VLM thực sự loại bỏ tính giòn trước thay đổi trình bày — 100% kịch bản
sống sót qua ba loại biến thể giao diện với 0 chi phí bảo trì, trong khi baseline
locator mất tới một nửa suite và cần sửa 46 dòng mã để phục hồi — và cái giá
phải trả nằm chủ yếu ở thời gian thực thi, không phải ở chi phí API hay độ ổn
định. Đồng thời, hai khảo sát mở rộng cho thấy VLM sẵn sàng cho kiểm thử phân
quyền hiển thị và tương thích với yêu cầu che dữ liệu nhạy cảm. Toàn bộ ứng
dụng, bộ test, số liệu và công cụ đo được công khai để cộng đồng kiểm chứng và
phát triển tiếp.
