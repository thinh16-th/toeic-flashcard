# DEPLOY — Flashcard TOEIC Vocab

Hai việc cần làm tay, mỗi việc một lần. Sau đó cập nhật từ vựng chỉ là chạy `build_vocab.py` rồi commit `index.html`.

## A. Backend: Google Apps Script (≈5 phút)

1. Vào https://sheets.new → tạo Google Sheet mới, đặt tên `toeic-flashcard-progress`.
2. Menu **Extensions → Apps Script**. Xoá hết nội dung `Code.gs` có sẵn, dán toàn bộ `flashcard/gas/Code.gs` vào. Ctrl+S.
3. (Tuỳ chọn) Chọn hàm `selfTest` ở thanh trên → **Run** → lần đầu Google hỏi cấp quyền: chọn tài khoản → *Advanced* → *Go to … (unsafe)* → *Allow*. Xem **Execution log** có dòng `write/read OK: true`.
4. **Deploy → New deployment** → biểu tượng bánh răng chọn **Web app**:
   - Description: `v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
   → **Deploy** → copy **Web app URL** (dạng `https://script.google.com/macros/s/AKfycb…/exec`).
5. Kiểm tra nhanh trên trình duyệt: mở `<URL>?action=ping` → thấy `{"ok":true,"ts":"…"}`. Mở `<URL>?u=thinh` → `{"ok":true,"exists":false,"data":null}`.
6. Dán URL vào `index.html`, hằng `const API_URL = "…"` ở đầu khối `<script>` cuối file.

Sửa `Code.gs` về sau: dán code mới → **Deploy → Manage deployments → ✎ → Version: New version → Deploy**. URL không đổi. (Nếu tạo *New deployment* thì URL đổi, phải dán lại vào HTML.)

## B. Host: GitHub Pages (đã xong) và quy trình cập nhật qua Git

Repo: https://github.com/thinh16-th/toeic-flashcard · Pages: https://thinh16-th.github.io/toeic-flashcard/ (branch `main`, root).
Folder `02_Tu_Vung_ETS/flashcard/` chính là bản clone của repo (có `.git`), nên mọi thay đổi đi theo một đường:

1. Sửa code / chạy `python build_vocab.py` (khi đổi tài liệu) ngay trong folder này.
2. `git add -A && git commit -m "..."` — Claude làm bước này trên máy anh sau mỗi lần sửa.
3. `git push` — anh làm, bằng GitHub Desktop (File → Add local repository → chọn folder này) hoặc mở terminal trong folder rồi gõ `git push`.
4. Đợi ~1 phút, Pages tự cập nhật. iPhone thấy bản cũ thì đóng app khỏi đa nhiệm rồi mở lại.

Lưu ý: `.git` nằm trong OneDrive; nếu OneDrive báo xung đột file trong `.git/`, tạm dừng sync folder này hoặc chuyển repo ra ngoài OneDrive (clone lại), không sửa tay trong `.git/`.
iPhone: mở URL bằng **Safari** → Share → **Add to Home Screen** → mở như app toàn màn hình.

## C. Kiểm tra đồng bộ end-to-end

1. PC: mở URL, nhập username `thinh`, học 5 thẻ. Badge góc Home chuyển *Đang lưu… → Đã lưu*.
2. Google Sheet: tab `progress` xuất hiện dòng `thinh` với cột `cards` = 5.
3. iPhone: mở URL, nhập `thinh` → Home hiện đúng số thẻ đã học; Browse thấy 5 từ đó ở hộp 2.
4. Tắt Wi-Fi trên iPhone, học tiếp 3 thẻ → badge *Offline, chưa lưu 3* → bật mạng → tự chuyển *Đã lưu*.

## Ghi chú vận hành

- Không mật khẩu: ai có URL + username thì sửa được tiến độ của username đó. Muốn khoá sau này: thêm PIN, không đổi kiến trúc.
- Apps Script giới hạn ~20.000 request/ngày/tài khoản — một người học dùng ~30 request/ngày.
- Reset trong Settings xoá cả dòng trên Sheet (không khôi phục được) — nút Export JSON trước khi reset nếu muốn giữ.
