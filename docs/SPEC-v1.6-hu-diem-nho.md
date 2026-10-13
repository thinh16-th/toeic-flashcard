# Spec v1.6 — Hũ từ vựng theo điểm nhớ, chọn hũ trước khi học, phi thuyền theo tốc độ

Ngày: 2026-10-11 · Trạng thái: user duyệt hướng trong chat ("Cứ tạo cơ chế cộng trừ điểm…")

## 1. Mục tiêu
- Mỗi từ có **điểm nhớ 0-100**. Ôn đúng chu kỳ nhắc của đường cong lãng quên thì điểm tăng nhiều nhất.
- **Hũ = dải điểm.** Hũ của một từ luôn suy ra từ điểm, nên bị trừ điểm thì từ tự rơi về đúng hũ.
- Mỗi từ có **lịch sử điểm**: ngày, chế độ, mức đúng hạn, điểm cộng/trừ, hũ trước → sau.
- **Chọn hũ trước khi học**, áp dụng mọi chế độ. Xáo các từ đã chọn, mỗi từ chỉ ra một lần trong phiên.
- **Phi thuyền:** chỉ còn rơi thẳng, có 4 mức tốc độ, tối ưu cho cảm ứng.
- **Đồ hoạ hũ** lấy từ Visualize `G01-hu-tu-vung`. Trong SVG không có chữ; chữ dùng font của app.

## 2. Hũ
| Hũ | Điểm | Ôn lại sau khi chấm |
|---|---|---|
| Mới | (chưa có thẻ) | - |
| Hũ 1 | 0-4 | 1 ngày (sau khi quên: ngay hôm nay) |
| Hũ 2 | 5-14 | 1 ngày |
| Hũ 3 | 15-29 | 3 ngày |
| Hũ 4 | 30-49 | 7 ngày |
| Hũ 5 | 50-99 | 14 ngày (điểm < 75), 30 ngày (điểm ≥ 75) |
| Hũ vàng | 100 | khoá: không bị trừ, không rơi hũ, không vào lịch ôn |

`card.box` vẫn là số hũ (1-5, 6 = vàng) và luôn bằng `jarOf(score)`.

## 3. Điểm
Mức thời điểm ôn được tính theo hạn `due` và chu kỳ `iv` đã hẹn:
- **mới**: lần chấm đầu tiên của từ, coi như đúng hạn.
- **sớm**: hôm nay < due.
- **đúng hạn**: số ngày trễ ≤ max(1, floor(iv/2)).
- **trễ**: trễ hơn mức trên.

Cộng khi trả lời đúng (theo hũ trước khi chấm):

| Hũ trước khi chấm | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Điểm cộng | 5 | 10 | 15 | 20 | 25 |

- Đúng hạn hoặc mới: cộng đủ. Trễ: một nửa. Sớm: +2.
- Quên: -15, due = hôm nay, lapses+1.
- Hệ số theo chế độ:
  - card, reverse, cloze, dictation: 1
  - quiz: 0,7
  - ship: 0,5
- Hệ số áp cho cả cộng lẫn trừ. Làm tròn; điểm cộng tối thiểu 1.
- **Mỗi từ chỉ được tính điểm 1 lần mỗi ngày.** Các lượt sau trong ngày được ghi là "luyện", 0 điểm, không đổi hạn. Lượt ôn vẫn được đếm vào lịch sử 30 ngày.
  - Ngoại lệ (v1.18.1): từ vừa **quên** hôm nay (hạn = hôm nay) mà sau đó nhớ đúng → ghi "nhớ lại" (`r`), 0 điểm, nhưng dời hạn sang ngày mai (`iv` = 1) để từ rời danh sách đến hạn. Quên tiếp thì vẫn là "luyện", hạn giữ hôm nay.
- Từ ở Hũ vàng: lượt ôn không đổi gì (ghi "luyện").
- Nút "Đã biết" (thẻ mới): điểm 75 (Hũ 5), ôn sau 30 ngày.
- Đặt hũ thủ công trong trang Từ vựng: điểm = mức thấp nhất của hũ đó (Hũ vàng = 100), ghi "đặt tay".
- **Quy đổi dữ liệu cũ** (thẻ chưa có `score`):
  - Điểm theo hộp cũ: hộp 1 → 0, hộp 2 → 5, hộp 3 → 15, hộp 4 → 30, hộp 5 → 50.
  - Giữ nguyên `due`. `iv` lấy theo khoảng của hộp cũ.
  - Ghi một dòng lịch sử "quy đổi".

Theo cách tính này, ôn đúng hạn liên tục thì đi 5 → 15 → 30 → 50 → 75 → 100, khoảng 56 ngày.

## 4. Dữ liệu (đồng bộ server không đổi)
Mỗi phần tử `cards[id]` có các trường:
- `box`, `score`, `due`, `iv`, `last`, `seen`, `lapses`, `ok`, `log`, `updated`
- `ok`: số lần ôn đúng hạn.
- `log`: tối đa 30 dòng, mỗi dòng dạng `"YYYY-MM-DD|delta|kind|mode|from|to"`.
  - `kind` là một trong: n (mới), o (đúng hạn), e (sớm), l (trễ), f (quên), p (luyện), r (nhớ lại), k (đã biết), m (đặt tay), c (quy đổi).

Mỗi phần tử `history[date]` có thêm hai trường:
- `d`: số lượt ôn từ đã đến hạn (đúng hạn hoặc trễ)
- `o`: số lượt ôn đúng hạn

Gộp dữ liệu (merge) vẫn theo từng thẻ, bản có `updated` mới hơn thắng.

## 5. Giao diện
- **Hộp thoại chọn hũ** (`dlg-pick`): mở từ "Học ngay" và từ nút "Chơi" của 3 game.
  - Có 8 ô chọn kèm hình hũ và số từ: Đến hạn, Mới (theo hạn mức mới còn lại), Hũ 1-5, Hũ vàng.
  - Chọn số từ cho phiên: 10 / 20 / 30 / tất cả.
  - Mặc định tick "Đến hạn + Mới".
- Bỏ việc đưa từ bị quên quay lại cuối phiên.
- Thanh trên màn học có **hình hũ của từ hiện tại**. Sau mỗi lần chấm, hũ chơi hiệu ứng:
  - catch khi cộng điểm
  - fall khi rơi hũ
  - gold khi lên Hũ vàng
  - kèm số điểm bay lên hoặc rơi xuống.
- **Trang chính:** thẻ "Hũ từ vựng" (thay "Phân bố hộp") gồm:
  - 7 hũ với số từ và dải điểm dưới mỗi hũ
  - các chỉ số: điểm nhớ trung bình, tỉ lệ đúng hạn 30 ngày, số từ đã xong.
  - Ô KPI "Đã thuộc" đổi thành "Đã xong (Hũ vàng)".
- **Trang Từ vựng:**
  - cột Hũ (kèm điểm) và cột Điểm
  - bộ lọc theo hũ có Hũ vàng
  - hộp thoại của từ có thêm điểm hiện tại và bảng lịch sử điểm
  - ô "Đặt vào hũ" thay cho ô chọn hộp cũ.
- Mọi chữ mới dùng các cỡ chữ đang có (text-2xl, text-lg, mặc định, text-sm, text-xs) và font kế thừa. Không thêm font.

## 6. Phi thuyền
- Bỏ `shipMode`, thay bằng `shipSpeed`: Chậm 9 s, Vừa 7 s (mặc định), Nhanh 5 s, Siêu tốc 3,5 s.
- Mỗi câu đúng liên tiếp làm thời gian rơi giảm 4%, tối đa 30%.
- Đúng/sai đều chấm qua `rate()`, hệ số 0,5.
- **Cảm ứng:**
  - Chạm vào làn nào thì phi thuyền tới làn đó.
  - Kéo thì phi thuyền đi theo ngón tay, thả ra thì tự vào làn gần nhất.
  - Các ô làn và nút đều có `touch-action: manipulation`.

## 7. Kiểm tra
- Test node cho phần lõi điểm: `jarOf`, `classify`, `applyReview` với các trường hợp mới, đúng hạn, sớm, trễ, quên, giới hạn 1 lần/ngày, Hũ vàng, quy đổi.
- Playwright: máy tính và điện thoại, sáng và tối. Chạy cả 6 chế độ qua hộp chọn hũ, mở hộp thoại lịch sử điểm, và chạy lint.
