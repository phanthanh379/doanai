# Chương 1 — Giới thiệu (BẢN NHÁP ĐẦY ĐỦ)

> Nháp hoàn chỉnh 09/07/2026, viết từ Step 1+3+4 của hướng dẫn GVHD và đề cương.
> Số liệu kết quả nhắc ở 1.5 lấy từ Chương 4.

## 1.1. Bối cảnh và động lực

Kiểm thử giao diện người dùng (GUI testing) là một khâu bắt buộc trong quy trình
đảm bảo chất lượng phần mềm: phát hiện sớm lỗi hiển thị, sai lệch luồng thao tác,
và bảo đảm trải nghiệm nhất quán qua các phiên bản phát hành. Cách tiếp cận tự
động hóa phổ biến nhất hiện nay là script hóa thao tác người dùng bằng các
framework như Selenium hay Playwright, trong đó mỗi bước tương tác định vị phần
tử giao diện qua **bộ định vị kỹ thuật (locator)** — CSS selector, XPath, hoặc
thuộc tính accessibility.

Điểm yếu cố hữu của cách tiếp cận này là **tính giòn (brittleness)**: locator
gắn chặt vào cấu trúc DOM và nhãn văn bản của giao diện, nên khi giao diện thay
đổi cách trình bày — đổi bố cục, đảo thứ tự cột, đổi nhãn nút — test gãy hàng
loạt dù chức năng bên dưới không hề thay đổi. Chi phí bảo trì bộ test vì thế trở
thành gánh nặng thường trực của các nhóm phát triển, đặc biệt với những thành
phần giao diện tùy biến không có nhãn ngữ nghĩa, nơi selector cấu trúc
(`nth-child`) gần như là lựa chọn duy nhất.

Sự phát triển của các **mô hình thị giác–ngôn ngữ (Vision-Language Model — VLM)**
như GPT-4o, Claude (vision), Gemini hay Qwen-VL mở ra một hướng tiếp cận khác:
agent kiểm thử "nhìn" ảnh chụp màn hình và thao tác theo ngữ nghĩa thị giác của
giao diện — "bấm nút thêm sản phẩm", "đọc cột SKU" — thay vì bám vào cấu trúc kỹ
thuật. Test case khi đó được viết bằng ngôn ngữ tự nhiên (công cụ đại diện:
Midscene.js), và về nguyên tắc sẽ miễn nhiễm với các thay đổi thuần trình bày.
Nhưng lời hứa đó đi kèm câu hỏi thực tiễn chưa có lời đáp định lượng: độ bền
vững tăng **bao nhiêu**, đổi lại **chi phí gì** (thời gian chạy, chi phí API, độ
ổn định), và liệu có dùng được VLM cho các nhu cầu kiểm thử gắn với bảo mật hay
không. Đồ án này trả lời các câu hỏi đó bằng một nghiên cứu thực nghiệm so sánh
có kiểm soát.

## 1.2. Khoảng trống nghiên cứu

Khảo sát 27 công trình tiêu biểu giai đoạn 2023–2026 về LLM/VLM cho kiểm thử GUI
(Chương 2) cho thấy ba khoảng trống:

1. **Thiếu so sánh đối chứng có kiểm soát.** Tuyệt đại đa số công trình tập
   trung vào Android hoặc web riêng lẻ và đo hiệu quả qua code coverage hay số
   bug phát hiện được. Chưa có công trình nào so sánh trực tiếp, định lượng,
   giữa phương pháp locator-based truyền thống và phương pháp VLM-based **trên
   cùng một bộ test case**, với **biến thể giao diện được kiểm soát chủ động** —
   trong khi độ bền vững trước thay đổi giao diện chính là lý do cốt lõi khiến
   VLM được đề xuất thay cho locator.

2. **Thiếu định lượng chi phí bảo trì.** Một số công trình có đề cập chi phí
   nhưng chỉ đo chi phí vận hành agent (token, thời gian chạy); chưa có nghiên
   cứu nào đo trực tiếp chi phí bảo trì bộ test — số test case, số dòng
   code/config phải sửa khi giao diện thay đổi — theo cặp đối chứng trên cùng
   một ứng dụng.

3. **Bỏ ngỏ khía cạnh bảo mật.** Không công trình nào trong nhóm khảo sát đề cập
   (a) rủi ro lộ dữ liệu nhạy cảm khi gửi screenshot chứa thông tin cá nhân lên
   VLM API của bên thứ ba, hay (b) khả năng tận dụng chính VLM để kiểm thử tính
   đúng đắn của giao diện theo phân quyền người dùng (role-based UI access).

## 1.3. Câu hỏi nghiên cứu

Từ ba khoảng trống trên, đồ án đặt bốn câu hỏi nghiên cứu:

- **RQ1 (độ bền vững):** So với kiểm thử dựa trên locator truyền thống, kiểm thử
  dựa trên VLM cải thiện độ bền vững (tỉ lệ test pass) đến mức nào khi giao diện
  thay đổi (theme, bố cục, biểu tượng)?
- **RQ2 (chi phí bảo trì):** Chi phí bảo trì bộ test suite (số dòng code/config
  cần sửa, thời gian, chi phí gọi API) của hai phương pháp khác nhau như thế nào
  khi giao diện thay đổi?
- **RQ3 (kiểm thử phân quyền):** VLM có thể được tận dụng để phát hiện lỗi hiển
  thị giao diện theo phân quyền người dùng với độ chính xác ra sao, so với
  phương pháp locator-based?
- **RQ4 (che dữ liệu nhạy cảm):** Việc che giấu (masking) dữ liệu nhạy cảm trên
  ảnh chụp màn hình trước khi gửi lên VLM API ảnh hưởng thế nào đến độ chính xác
  định vị phần tử của VLM?

RQ1–RQ2 giải quyết khoảng trống 1–2; RQ3–RQ4 giải quyết khoảng trống 3.

## 1.4. Mục tiêu và phạm vi

**Mục tiêu** của đồ án là một nghiên cứu thực nghiệm so sánh định lượng
(empirical comparative study): xây dựng một ứng dụng web mẫu cùng các biến thể
giao diện có kiểm soát; xây dựng hai bộ test song song (Playwright locator-based
và Midscene.js VLM-based) đối xứng 1–1; chạy cả hai trên giao diện gốc và từng
biến thể, mỗi tổ hợp lặp 5 lần; và đo đồng thời các trục: tỉ lệ pass, độ ổn định
(flakiness), thời gian thực thi, chi phí API, chi phí bảo trì. Hai khảo sát mở
rộng (masking và kiểm thử phân quyền hiển thị) trả lời RQ3–RQ4.

**Phạm vi** được giới hạn tường minh: ứng dụng mẫu tự xây với dữ liệu mock (không
phải ứng dụng thương mại); mô hình VLM dùng qua API, ghim một model cố định,
không huấn luyện hay fine-tune; kiểm thử phân quyền chỉ ở tầng hiển thị
front-end (không kiểm thử backend/API); nền tảng desktop chỉ đặt làm hướng phát
triển. Các giới hạn này và hệ quả của chúng được thảo luận tại mục 4.7.

## 1.5. Đóng góp của đồ án

Đồ án cam kết và hoàn thành năm đóng góp:

1. **C1 — Bộ dữ liệu thực nghiệm tái sử dụng được:** ứng dụng web mẫu "Mini Shop
   Manager" cùng 4 biến thể giao diện kiểm soát tập trung trong một file cấu
   hình, công khai trên GitHub — dùng được làm benchmark cho các nghiên cứu về
   robustness của GUI testing.
2. **C2 — Pipeline đánh giá so sánh:** harness chạy ma trận thực nghiệm và ghi
   số liệu tự động, quy trình bảo trì chuẩn hóa cho RQ2, cùng script phân tích
   sinh toàn bộ hình/bảng từ dữ liệu thô — đóng góp về phương pháp đánh giá, đo
   đồng thời ba trục robustness / chi phí bảo trì / chi phí vận hành.
3. **C3 — Bộ số liệu định lượng** trả lời trực tiếp RQ1–RQ2: trong phạm vi khảo
   sát, đây là bằng chứng thực nghiệm đầu tiên đo trực tiếp đánh đổi robustness
   vs. cost giữa hai phương pháp trên cùng ứng dụng, cùng bộ test case (kết quả
   chính: VLM giữ 100% pass trên mọi biến thể với 0 chi phí bảo trì; locator rơi
   còn 50–67% và cần 15 lượt sửa test / 46 LOC).
4. **C4 — Cơ chế masking + đánh giá trade-off:** tiền xử lý ảnh che PII trước
   khi gửi VLM API và đo định lượng ảnh hưởng lên độ chính xác định vị (kết quả
   chính: hit-rate không giảm, IoU chỉ giảm nhẹ tại vùng che).
5. **C5 — Bộ kịch bản kiểm thử phân quyền hiển thị bằng VLM** cùng tỉ lệ phát
   hiện đối chứng với locator (kết quả chính: cả hai đạt 5/5, không báo động
   giả) — mở rộng ứng dụng của VLM từ kiểm thử chức năng sang kiểm thử liên quan
   bảo mật.

## 1.6. Cấu trúc báo cáo

Phần còn lại của báo cáo tổ chức như sau. **Chương 2** trình bày cơ sở lý thuyết
và khảo sát 27 công trình liên quan, từ đó định vị đóng góp của đồ án.
**Chương 3** mô tả phương pháp: ứng dụng thực nghiệm, biến thể giao diện, hai bộ
test, mô hình VLM và hạ tầng đo lường, cùng thiết kế riêng cho từng RQ.
**Chương 4** trình bày kết quả định lượng của bốn RQ, thảo luận trade-off và các
nguy cơ đe dọa tính hợp lệ. **Chương 5** kết luận, đối chiếu đóng góp cam kết
với sản phẩm thực tế và đề xuất hướng phát triển.
