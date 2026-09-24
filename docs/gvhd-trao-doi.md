# Nội dung cần trình bày với GVHD (chuẩn bị trước buổi gặp)

> Tạo 09/07/2026. Đề cương .docx **chưa nộp** nên các điều chỉnh dưới đây đã được
> đưa thẳng vào đề cương; khi gặp GVHD trình bày như **thiết kế đã chọn** (kèm lý do),
> không phải xin phép sửa. Đánh dấu ✅ sau khi đã trao đổi xong từng mục.

## 1. Cách đo RQ2 — quy trình bảo trì chuẩn hóa, tự động (quan trọng nhất)

**Trình bày:** "Chi phí bảo trì (RQ2) em đo bằng 3 chỉ số: số test phải sửa, diff LOC,
và thời gian phục hồi bộ test. Để tránh thiên lệch giữa hai bộ test và bảo đảm tái lập,
việc sửa do **cùng một quy trình chuẩn hóa tự động** thực hiện — một AI coding agent
với chỉ dẫn cố định 'sửa tối thiểu để pass lại, chỉ đổi selector/assertion, không
refactor' — áp dụng đồng nhất cho cả hai bộ, mỗi biến thể một nhánh git riêng; chỉ số
trích tự động từ git và log."

**Kết quả đã có (nói luôn để thầy thấy phương pháp chạy được):** locator phải sửa
9 test / 24 LOC (V2), 6 test / 22 LOC (V3), 0 (V1); VLM 0 test / 0 LOC trên cả 3
biến thể. Nhánh bằng chứng: `rq2-fix-v2`, `rq2-fix-v3` trên GitHub.

**Lý do đưa ra nếu thầy hỏi "sao không tự sửa tay và bấm giờ":**
- Mục đích gốc của quy ước "cùng một người sửa" là chống thiên lệch giữa hai bộ test —
  agent cố định thỏa mãn mục đích đó tốt hơn (không mệt, không học lỏm giữa hai lần, tái lập được).
- Bấm giờ n=1 người là phép đo yếu: một mẫu, có hiệu ứng học trước (đã biết danh sách test gãy).
- Hai chỉ số chính (số test sửa, diff LOC) không phụ thuộc người sửa; chỉ số thời gian
  agent được khai báo hạn chế rõ trong Threats to Validity ("không đại diện công sức
  sửa thủ công của kỹ sư").
- Bảo trì test có AI hỗ trợ là thực hành phổ biến 2026 — cách đo phản ánh quy trình thực tế.

**Nếu thầy vẫn muốn số liệu người thật:** phương án dự phòng đã chuẩn bị — sinh viên
tự sửa từ đầu trên branch `rq2-manual-v2/v3` (không xem bản agent), bấm giờ; quy trình
chi tiết đã có sẵn (hỏi Claude Code: "làm phương án (a) RQ2 theo hướng dẫn cũ").

## 2. Báo cáo đổi model: GPT-4o/Claude → Qwen3-VL

**Trình bày:** "Đề cương dự kiến GPT-4o/Claude, nhưng khảo sát pilot cho thấy docs
Midscene.js đánh giá GPT kém về UI grounding và không hỗ trợ Claude; em đã chốt
**`qwen/qwen3-vl-235b-a22b-instruct`** qua OpenRouter (temperature=0, model ghim suốt
thực nghiệm, có fallback open-weight chạy cục bộ đúng như dự phòng rủi ro trong đề
cương). Chi phí thực tế rất thấp: toàn bộ thực nghiệm đến nay ≈ $1.5 trên ngân sách $50."
Chi tiết: `docs/pilot-model-cost.md` mục 1 + 6.

## 3. Định vị baseline locator trong báo cáo (đã chốt 09/07 — chỉ thông báo)

**Trình bày (thông báo, không phải xin ý kiến):** suite locator chủ ý dùng selector
giòn (nth-child, XPath neo text) — báo cáo định vị rõ đây là **"worst-case baseline"
(cận dưới của phương pháp locator)** trong Threats to Validity (mục 4.7-(3)), với hai
lập luận: `data-testid` đòi quyền sửa app, và nhóm test D (icon SVG trần, canvas, div
thuần) không có lựa chọn nào ngoài selector cấu trúc — best practice không đổi được
kết cục. Việc bổ sung baseline best-practice làm "cận trên" đã ghi ở hướng phát triển
(mục 5.4). **Nếu thầy muốn có baseline thứ hai ngay trong đồ án**, phương án làm đã
sẵn (viết 18 test `getByRole`, chạy lại ma trận — tự động hóa được), chỉ cần thầy
yêu cầu và còn quỹ thời gian.

## 4. Mức độ đi sâu phần bảo mật (quyết định mở duy nhất còn lại của đề cương)

Đề cương ghi phần bảo mật (masking + RBAC) ở mức "khảo sát bước đầu, thống nhất với
GVHD". Kết quả đã có: RQ4 hit-rate 100% cả 3 điều kiện masking; RQ3 detection 5/5 cả
hai phương pháp. **Hỏi thầy:** mức hiện tại đã đạt yêu cầu "khảo sát bước đầu" chưa,
hay cần mở rộng thêm (ví dụ: nhiều mức độ mask, thêm loại lỗi phân quyền)?

## 5. Hai phát hiện phương pháp luận (kể để ghi điểm, không cần xin ý kiến)

- **Viewport-bound perception:** VLM chỉ "thấy" screenshot trong viewport (locator truy
  vấn DOM toàn trang) → viewport là biến nhiễu phải cố định và báo cáo tường minh
  (`docs/pilot-model-cost.md` mục 7).
- **Quy ước tọa độ grounding của Qwen (0–1000)** thắng chỉ dẫn trong prompt — phải tách
  "lỗi model" khỏi "lỗi harness" trước khi kết luận (mục 8; attempt sai được lưu làm tư liệu).

## Sau buổi gặp — việc cần làm theo từng kết quả

| Kết quả trao đổi | Việc tiếp theo (Claude làm tự động) |
|---|---|
| Thầy OK mục 1 | Đo thời gian phục hồi của agent trên branch mới (`rq2-agent-v2/v3`), điền vào `results/rq2-maintenance.md` + Chương 4 mục 4.3/4.7 + panel thời gian vào `fig-rq2-maintenance.png` → GĐ4 xong |
| Thầy muốn người thật đo | Làm phương án (a): branch `rq2-manual-v2/v3`, sinh viên sửa + bấm giờ theo hướng dẫn đã có |
| Mục 3: thầy đồng ý cách định vị (mặc định) | Không làm gì — câu chữ đã khóa trong 4.7-(3) |
| Mục 3: thầy muốn thêm baseline bền | Xây suite `tests-locator-robust/` + chạy ma trận (Claude làm tự động) |
| Mục 4: mức hiện tại đủ | Không làm gì thêm, chuyển GĐ5 |
