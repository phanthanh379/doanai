# Hướng dẫn chuẩn bị & vận hành buổi bảo vệ (demo — thuyết trình — phản biện)

> File này nằm trong repo (tài liệu làm việc, KHÔNG copy vào gói nộp). Gói nộp
> `doanai-bao-ve/` chỉ chứa sản phẩm: `01-bao-cao/` (docx) · `02-slide/` (pptx)
> · `03-so-lieu-hinh/` (hình + CSV) · `04-demo-offline/` (report HTML) ·
> `05-ma-nguon/` (zip mã nguồn). Dựng lại gói: `bash harness/make-defense-package.sh`.
> Ngày bảo vệ: mang cả gói nộp lẫn laptop có repo này.

## PHẦN A — Cài đặt để demo trực tiếp (làm TRƯỚC ngày bảo vệ)

Máy demo lý tưởng là chính máy đang làm đồ án (mọi thứ đã cài). Nếu dùng máy
khác, cài từ đầu ~15 phút:

1. **Cài Node.js ≥ 20** (LTS): https://nodejs.org (macOS: `brew install node`;
   Windows: `winget install OpenJS.NodeJS.LTS`).
2. **Lấy mã nguồn** — một trong hai cách:
   - Có mạng: `git clone https://github.com/phanthanh379/doanai.git && cd doanai`
   - Không mạng: giải nén `05-ma-nguon/doanai-src.zip` trong gói rồi `cd` vào.
3. **Cài dependencies** — repo KHÔNG có package.json ở gốc, phải cài từng
   package con:
   ```bash
   (cd app && npm install)
   (cd tests-locator && npm install && npx playwright install chromium)
   (cd tests-vlm && npm install)
   ```
4. **Kiểm tra không cần API key** — baseline phải xanh 30/30 (~40 giây):
   ```bash
   cd tests-locator && npx playwright test
   ```
5. **(Chỉ nếu muốn demo VLM sống)** tạo `tests-vlm/.env` từ `.env.example`
   (chỉ cần điền `MIDSCENE_MODEL_API_KEY` — key OpenRouter, tài khoản cần
   credit; các dòng khác giữ nguyên). Chạy thử 1 lần trước ở nhà:
   ```bash
   cd tests-vlm && npx playwright test tests/group-a-forms.spec.ts -g "A2"
   ```
   (~40–90 giây, tốn <$0.01; kỳ vọng `1 passed`.) **Không demo VLM sống nếu
   chưa chạy thử trước.** Lỗi thường gặp: 401 = key sai; 402 = hết credit.
6. **Chuẩn bị fallback:** quay video màn hình một lần chạy bước 5 (phòng khi
   phòng bảo vệ không có mạng) — lưu `04-demo-offline/demo-vlm-live.mp4`.
7. **Xuất PDF từ pptx** (sau khi điền tên lên slide bìa) để phòng máy chiếu
   lỗi font — lưu cạnh file pptx trong `02-slide/`.

## PHẦN B — Checklist mang theo ngày bảo vệ

- [ ] Laptop đã cài sẵn theo Phần A (có repo gốc), pin đầy + sạc; tắt notification.
- [ ] Gói `doanai-bao-ve/` (bản mới nhất) trong máy + USB dự phòng.
- [ ] Bản in `bao-cao-doan.docx` (nếu khoa yêu cầu) + bản in file hướng dẫn này.
- [ ] Điện thoại phát 4G dự phòng nếu định demo VLM sống.

## PHẦN C — Mở mọi thứ (làm trước giờ G ~20 phút)

1. **Chạy app demo** (từ repo): `cd app && npm run dev` → mở 4 tab trình duyệt:
   - http://localhost:5173 (V0 — đăng nhập `admin`/`admin123`)
   - http://localhost:5173/products?variant=v1 · `?variant=v2` · `?variant=v3`
2. **Mở slide:** `doanai-bao-ve/02-slide/slide-bao-ve.pptx` — 6 slide backup
   nằm sau trang "Slide dự phòng (Q&A)".
3. **Mở 2 report offline:** `doanai-bao-ve/04-demo-offline/vlm-suite-report.html`
   và `vlm-test-A3-report.html` — từng bước AI kèm screenshot, không cần mạng.
4. **Mở sẵn 2 file số liệu** (từ repo, cho phản biện):
   `results/analysis-summary.md` và `results/rq2-maintenance.md`.
5. Terminal đứng sẵn ở thư mục repo (để chạy demo Phần D).
6. Mở kịch bản nói: `docs/bao-cao/slide-bao-ve.md` (talk track + thời lượng
   từng slide) trên điện thoại/máy phụ nếu cần nhắc bài.

## PHẦN D — Kịch bản demo ~4 phút (chèn sau slide 12 hoặc khi hội đồng yêu cầu)

**D1. App + biến thể (45s).** Tab V0: đăng nhập admin, chỉ bảng/nút Delete/cột
Cost. Chuyển tab V2: "cùng chức năng, chỉ đảo bố cục — cột Actions nhảy từ vị
trí 8 lên 1". Tab V3: "nút Add product thành Create item".

**D2. Locator gãy trên V2 — chạy sống (60s).** Terminal:
```bash
cd tests-locator && APP_VARIANT=v2 npx playwright test tests/group-a-forms.spec.ts tests/group-b-list-search.spec.ts tests/group-c-crud.spec.ts tests/group-d-custom-widgets.spec.ts --reporter=line
```
→ hiện `9 failed / 9 passed` sau ~45s. Chỉ vào log: "selector trỏ sai ô — đúng
50% suite gãy như số liệu RQ1".

**D3. VLM pass trên V2 — bằng report offline (60s).** Mở
`vlm-suite-report.html`, mở test A3: chỉ từng bước "the primary button in the
toolbar that adds a new product" + screenshot VLM đã nhìn → "không selector nào,
mô tả ý định — nên V2/V3 không làm nó gãy". (Nếu có mạng + hội đồng muốn xem
sống: `cd tests-vlm && APP_VARIANT=v2 npx playwright test tests/group-a-forms.spec.ts -g "A3"` ~60–90s.)

**D4. Chốt (15s).** Quay lại slide 13 (trade-off): "locator 3 giây nhưng gãy khi
UI đổi; VLM 8 phút + $0.05 nhưng sống sót 100% — hai chế độ chi phí."

## PHẦN E — Bản đồ phản biện (câu hỏi → mở gì; file md mở từ REPO)

| Hội đồng hỏi về | Mở | Ghi chú |
|---|---|---|
| "VLM có nhìn cả trang không?" / viewport | Slide backup **B1**; repo `docs/pilot-model-cost.md` mục 7 | phát hiện viewport-bound |
| Độ tin cậy phép đo RQ4 / tọa độ | Slide **B2**; `docs/pilot-model-cost.md` mục 8 | attempt sai được giữ làm tư liệu |
| Vì sao Qwen3-VL, không phải GPT-4o/Claude | Slide **B3**; `docs/pilot-model-cost.md` mục 1 | docs Midscene + bảng giá |
| "AI sửa test thì RQ2 còn ý nghĩa gì?" | Slide **B4**; repo `results/rq2-maintenance.md` mục 4 | 2 lần đo độc lập trùng diff từng dòng |
| "Baseline cố tình yếu?" | Slide **B5** | worst-case có chủ ý; nhóm D không có nhãn ngữ nghĩa |
| Chi phí tiền/token | Slide **B6**; repo `results/analysis-summary.md` | tổng ≈ $1.5/$50 |
| Số liệu thô "cho tôi xem" | gói `03-so-lieu-hinh/matrix-runs.csv` | mỗi test-result 1 dòng, cột label |
| Chi tiết 1 bài trong 15 bài khảo sát | repo `docs/notes-papers.md` | Problem/Method/Result/Limitation từng bài |
| Lỗi phân quyền cấy thế nào | Phụ lục C của báo cáo (docx) hoặc repo `docs/bao-cao/phu-luc.md` | 5 bug ↔ R1–R5; branch `rq3-seeded-bugs` |
| Tái lập thế nào | Phụ lục A của báo cáo (docx) | 1 lệnh sinh lại toàn bộ hình/bảng |

## PHẦN F — Sự cố & cách thoát

- **Mất mạng:** demo D2 (locator) vẫn chạy được (không cần mạng); D3 dùng report
  offline; bỏ demo VLM sống.
- **App không chạy:** dùng screenshot trong gói `03-so-lieu-hinh/screenshots-app-v1/`
  thay cho D1.
- **Máy chiếu lỗi font slide:** dùng bản PDF đã xuất sẵn (Phần A bước 7).
- **Hết giờ:** bỏ D2/D3, chỉ D1 + slide 13; mọi số liệu đã nằm trên slide 8–12.
