# PLAN — Flashcard TOEIC Vocab (ETS)

Ngày: 2026-09-27 (rev 2) · Skill: /ui-kit-html (TẠO MỚI) · Trạng thái: bước 1–4 xong (build_vocab.py, gas/Code.gs, index.html đã nhúng data); Pages đã live (2026-09-28), workflow Git đã dựng; Apps Script để sau, khi có URL thì dán API_URL vào index.html

## 1. Quyết định đã chốt

| # | Câu hỏi | Chốt |
|---|---|---|
| 1 | Đồng bộ thiết bị | **Đăng nhập bằng username (không mật khẩu)**. Tiến độ lưu trên server = **Google Apps Script + Google Sheet** của Thinh. HTML host trên **GitHub Pages** → mở được trên iPhone Safari / Android / PC, không cần đăng nhập gì khác. Username có sẵn → tải tiến độ; username mới → tự tạo. |
| 2 | Thuật toán ôn | **Leitner 5 hộp**: hộp 1→5 ôn sau 0 / 1 / 3 / 7 / 14 ngày (hộp 5 = 30 ngày). Thuộc → lên 1 hộp; quên → về hộp 1. |
| 3 | Dữ liệu | **Toàn bộ 3.330 từ** nhúng trong HTML; deck mặc định = **HF-316**. |
| 4 | Câu ví dụ | **Có** — 1 câu trích từ passage Part 6/7 chứa key word; Part 5 (không có passage) để trống. |

Phương án cũ (file HTML + export/import JSON) bỏ; giữ nút Export/Import làm backup thủ công.

## 2. Design Read (ui-kit-html bước 0)

- Người dùng: Thinh là chính, học 10–20 phút/ngày, **chủ yếu iPhone**, đôi khi PC; người khác có link cũng tự tạo username dùng được.
- Dữ liệu: 316 thẻ (deck mặc định) · 3.330 tối đa · 1 phiên ôn thường 20–50 thẻ.
- Trạng thái quan trọng: (a) hết thẻ đến hạn hôm nay, (b) username mới (chưa có tiến độ), (c) mất mạng / server lỗi khi lưu, (d) trình duyệt không có giọng TTS tiếng Anh, (e) xung đột tiến độ giữa 2 thiết bị.
- Theme: light + dark (học tối). Theme theo hệ thống, có nút đổi.
- Khung: **L3 tra cứu** cho màn Browse; màn Study là card toàn màn hình (custom, ghi `<!-- custom: flashcard -->`); màn Login là L2 form tối giản (1 ô + 1 nút).
- Phạm vi khóa: 5 màn · 1 bảng Tabulator · 0 chart (3 stat tile) · 1 dialog (reset) · 1 toast · 1 badge trạng thái sync.

## 3. Kiến trúc: 3 lớp

```
02_Tu_Vung_ETS/flashcard/
├── PLAN.md
├── build_vocab.py      ← lớp 1: docx/xlsx → vocab.json → nhúng vào index.html
├── vocab.json          ← trung gian, để kiểm tra
├── index.html          ← lớp 2: app (một file; tên index.html để GitHub Pages phục vụ ở root)
├── gas/Code.gs         ← lớp 3: backend Apps Script (dán vào Google Sheet)
└── DEPLOY.md           ← 2 checklist: deploy Apps Script · đẩy lên GitHub Pages
```

Đổi tài liệu nguồn → chạy lại `build_vocab.py` → commit `index.html` → GitHub Pages tự cập nhật.

### 3.1 build_vocab.py (chạy trên máy: python-docx, openpyxl đã có)

Đầu ra `vocab.json`, mỗi entry:

```json
{ "id": "ensure", "word": "ensure", "ipa": "/ɪnˈʃʊə/",
  "def": "≈ guarantee, make certain, ...",
  "tests": [1,3,4,6,7,8,9,10], "count": 8, "hf": true,
  "theme": "Business / Office",
  "example": "Please ensure that all forms are submitted by Friday." }
```

Quy tắc:
- Nguồn từ: bảng A–Z trong SUMMARY_ALL (3.330 dòng). Key = `word` lower-case, strip, giữ nguyên ngoặc `(v.)`/`(n.)`.
- `theme`: tra bảng "PHẦN 2 — THEO CHỦ ĐỀ" cùng file; không có → "General".
- `hf` + `count`: từ High_Freq_316.xlsx; không khớp key → hf=false, count=len(tests).
- `example`: quét 10 file TEST — mỗi bảng 2 cột (passage | keywords), tách keyword cột phải (mẫu `word = ... /ipa/`), tìm câu đầu tiên trong passage chứa word (không phân biệt hoa thường, cho phép -s/-ed/-ing). Cắt ≤ 220 ký tự. Không có → "".
- In báo cáo: tổng entry, số có ví dụ, HF khớp/không khớp, danh sách từ xlsx không thấy trong docx.
- Bước cuối: thay khối `<script id="vocab-data" type="application/json">…</script>` trong `index.html`, ghi đè thẳng (không .bak).

### 3.2 gas/Code.gs — backend

- Sheet `progress`: cột `username | updated | json`. Một dòng / username, `json` = toàn bộ tiến độ (≤ 50 KB/người, Sheet cho phép 50.000 ký tự/ô → nếu vượt thì chia nhiều ô, xử lý trong GAS, app không biết).
- `GET ?u=<username>` → `{ok, exists, data}`; không tồn tại → `exists:false` (app tạo mới, chưa ghi gì cho tới lần chấm đầu tiên).
- `POST` body JSON `{u, data}` → ghi đè dòng, trả `{ok, updated}`. Content-type `text/plain` để tránh CORS preflight (GAS không trả preflight).
- Username chuẩn hoá: trim, lower-case, chỉ `[a-z0-9_.-]`, 2–32 ký tự; app kiểm tra trước, GAS kiểm tra lại.
- Deploy: Web app · Execute as **Me** · Access **Anyone**. URL deploy dán vào hằng `API_URL` trong index.html.
- Chống ghi đè lùi: GAS so `data.updated` mới gửi với bản đang lưu; cũ hơn → trả `{ok:false, code:"stale", data:<bản server>}` để app merge rồi gửi lại.

### 3.3 index.html — app

Stack theo skill: basecoat 1.0.2 · Tailwind Play CDN v4 · Tabulator 6.5.2 · auto-animate (list). Không Chart.js. Copy nguyên `<head>` từ `assets/boilerplate.html`.

Mobile-first iPhone: `100dvh`, `viewport-fit=cover` + safe-area inset, nút chấm ≥ 48 px ở đáy (vùng ngón cái), font ≥ 16 px (Safari không zoom khi focus), `apple-mobile-web-app-capable` + `apple-mobile-web-app-status-bar-style` + `apple-touch-icon` (SVG data URI) + `theme-color` để **Add to Home Screen** chạy như app toàn màn hình.

**Màn hình**

0. **Login** — 1 ô username + nút "Vào học". Nhớ username lần trước trong localStorage → lần sau vào thẳng, có nút "Đổi người dùng". Username mới → thông báo "Tạo mới cho *tên*" (không hỏi xác nhận, nhưng có Undo 5 s để tránh gõ nhầm tên).
1. **Home** — chọn deck + 3 stat tile (đến hạn hôm nay · đã thuộc (hộp ≥4) · streak ngày) + badge sync (Đã lưu / Đang lưu… / Offline, chưa lưu N thay đổi). Deck: HF-316 (mặc định) · Test 1–10 · Chủ đề (9) · A–Z · Thẻ khó. Empty state khi 0 thẻ đến hạn: "Hôm nay xong rồi — học thêm thẻ mới?" + nút học 20 thẻ mới.
2. **Study** — card lật: mặt trước `word` + IPA + nút loa (Web Speech API, en-GB/en-US); mặt sau: def + example (in nghiêng, tô đậm từ) + chip `Test 1,3,7` + chip theme + hộp. Tap/Space lật · "Quên"/"Thuộc" (phím 1/2, swipe trái/phải) · Undo 1 bước · thanh tiến độ phiên · tự phát âm khi lật (bật/tắt).
3. **Browse** — Tabulator: Word / IPA / Def rút gọn / Tests / Theme / Hộp / Ôn tới. Search, lọc Test / Theme / Hộp / HF. Click dòng → xem thẻ + đặt tay vào hộp bất kỳ. Ảo hoá dòng.
4. **Settings** — Giọng đọc · Thẻ mới/ngày (mặc định 20) · Đổi người dùng · Export/Import JSON (backup) · Reset (dialog xác nhận, xoá cả trên server).

**Tiến độ** (cùng một JSON ở localStorage key `ets-fc:<username>` và trên Sheet)

```json
{ "schema": 1, "username": "thinh", "updated": "2026-09-27T21:00:00+07:00",
  "settings": { "newPerDay": 20, "voice": "en-GB", "autoSpeak": true },
  "streak": { "last": "2026-09-27", "days": 3 },
  "cards": { "ensure": { "box": 3, "due": "2026-10-01", "seen": 5, "lapses": 1, "updated": "2026-09-27T20:58:11+07:00" } } }
```

**Đồng bộ (offline-first)**
- Đăng nhập: đọc cache local → hiện ngay; song song GET server → **merge theo từng từ** (mỗi từ lấy bản `updated` mới hơn) → render lại nếu khác → nếu local có gì mới hơn thì POST.
- Mỗi lần chấm: ghi local ngay; POST debounce 3 s (gộp nhiều lần chấm thành 1 request); thất bại → giữ cờ dirty, thử lại khi `online` / khi mở lại tab / mỗi 60 s.
- Nhận `stale` từ server → merge với bản server rồi POST lại (tối đa 2 vòng).
- Học xen kẽ 2 máy vẫn gộp được; chỉ mất khi cùng một từ chấm ở cả 2 máy trong cùng khoảng offline (lấy bản mới hơn).

## 4. Lộ trình build

| Bước | Việc | Kết quả kiểm tra |
|---|---|---|
| 1 | `build_vocab.py` + `vocab.json` | Báo cáo: 3.330 entry, ≥90 % HF-316 khớp, tỉ lệ có example |
| 2 | `gas/Code.gs` + `DEPLOY.md`; Thinh deploy, gửi lại URL | `curl GET ?u=test` trả `exists:false`; POST rồi GET trả đúng |
| 3 | `index.html`: head boilerplate + Login + Home + Study, nhúng data, Leitner, localStorage, sync | Học deck HF-316 trên PC, F5 không mất; đổi máy thấy đúng hộp |
| 4 | Browse (Tabulator) + Settings + TTS + export/import backup | Lọc/search 3.330 dòng mượt trên iPhone |
| 5 | GitHub Pages: đã lên tại https://thinh16-th.github.io/toeic-flashcard/ ; folder flashcard = clone repo, cập nhật bằng commit (Claude) + push (Thinh) | Mở URL trên iPhone Safari, Add to Home Screen |
| 6 | Vòng kiểm tra một lần: `check_ui.py`, screenshot light/dark × desktop/mobile, triage P0–P3, đếm lại phạm vi mục 2 | Không ERROR; 5 màn đủ; 5 trạng thái (a)–(e) hiện đúng |

Mỗi bước bàn giao file lẻ (không zip), ghi đè cùng tên. Bước 2 và 5 cần Thinh thao tác (deploy GAS, tạo repo) — có checklist trong `DEPLOY.md`.

## 5. Rủi ro đã biết & cách xử lý

- **Không mật khẩu** → ai biết URL + username thì xem/sửa được tiến độ của username đó. Chấp nhận (dữ liệu học từ). Nếu sau này cần, thêm PIN 4 số lưu hash trong Sheet — không đổi kiến trúc.
- **GAS chậm 1–3 s, đôi khi lỗi 5xx thoáng qua** → app không chờ server để lật thẻ; chỉ badge sync đổi trạng thái; retry nền.
- **Giới hạn GAS**: ~20.000 request/ngày cho tài khoản thường, dư sức; mỗi phiên học ~10–30 POST nhờ debounce.
- **CDN cần mạng** (Tailwind/basecoat/Tabulator) — đã chấp nhận vì học cần mạng. Nếu sau này muốn offline hẳn: vendor lib vào repo + service worker (không thuộc v1).
- **Tailwind Play CDN** compile trong trình duyệt, mở lần đầu trên iPhone ~1 s → chấp nhận cho app cá nhân.
- **Từ trùng dạng** (`request (v.)` vs `request (n.)`) → id giữ nguyên chuỗi gốc, không gộp.
- **Bản quyền passage ETS** → chỉ nhúng 1 câu ví dụ/từ, không nhúng nguyên passage.

## 6. Ngoài phạm vi phiên bản 1

Mật khẩu/PIN · offline hoàn toàn (service worker) · chế độ trắc nghiệm 4 đáp án · thống kê biểu đồ theo ngày · bảng xếp hạng nhiều người dùng. Ghi lại để không "tiện tay" làm thêm.
