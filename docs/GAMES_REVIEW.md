# Review: game từ vựng cho TOEIC Vocab Flashcard

Ngày: 2026-10-10 · Dữ liệu hiện có: 3.330 từ (loại từ, nghĩa tách theo loại từ, topic, IPA Mỹ), 2.516 từ có câu ví dụ ETS thật (306/316 từ HF), TTS giọng Mỹ, Leitner 5 hộp.

Nguyên tắc chọn: chỉ giữ game buộc **tự nhớ lại (recall)** thay vì chỉ nhận ra (recognition), vì đây là yếu tố có bằng chứng mạnh nhất cho trí nhớ dài hạn; và sát dạng đề TOEIC.

## 1. Điền câu ETS (cloze, tự gõ từ)

- **Chơi**: hiện câu ví dụ thật trong đề ETS, từ cần học bị che bằng ＿＿＿, kèm nhãn loại từ. Gõ từ vào. Không nhớ thì mở gợi ý theo bậc: chữ cái đầu + số chữ → synonym → 4 lựa chọn. Càng ít gợi ý càng nhiều điểm (3 / 2 / 1 / 0,5).
- **Căn cứ**:
  - *Testing effect*: tự truy xuất nhớ lâu hơn đọc lại (Roediger & Karpicke 2006, *Psychological Science*; Karpicke & Roediger 2008, *Science*).
  - *Generation effect*: tự tạo ra đáp án nhớ tốt hơn được cho sẵn (Slamecka & Graf 1978).
  - *Involvement Load Hypothesis*: tác vụ buộc tìm và đánh giá từ trong ngữ cảnh cho kết quả ghi nhớ cao hơn (Laufer & Hulstijn 2001, *Applied Linguistics*).
  - Gợi ý theo bậc giữ "độ khó vừa sức" (*desirable difficulties*, Bjork 1994) thay vì bỏ cuộc.
- **Sát TOEIC**: đúng dạng Part 5/6 (điền từ vào câu), và câu lấy từ chính 10 đề ETS anh đang học.
- **Dữ liệu**: 2.516 từ có câu ví dụ, không cần thêm. Chấp nhận cả dạng gốc lẫn dạng chia trong câu (submit / submitted).

## 2. Nghe & gõ (dictation, giọng Mỹ)

- **Chơi**: app đọc từ (giọng en-US, có nút nghe chậm 0,7×), anh gõ chính tả. Chấm từng chữ cái, tô chỗ sai; sau đó hiện IPA, loại từ, nghĩa và câu ví dụ.
- **Căn cứ**:
  - Vòng âm vị (*phonological loop*) là cơ chế chính để học từ mới ngoại ngữ; gắn âm với chữ giúp nhớ hình thức từ (Baddeley, Gathercole & Papagno 1998, *Psychological Review*).
  - Truy xuất dạng sản sinh (viết ra) nhớ tốt hơn và chuyển sang nhận diện tốt hơn so với chỉ chọn đáp án (Nation 2013; Webb 2009).
  - Phản hồi ngay sau lỗi làm tăng giữ lại (Pashler và cộng sự 2005).
- **Sát TOEIC**: Listening Part 1–4 đòi nhận ra từ qua âm; giúp sửa lỗi "biết nghĩa nhưng nghe không ra".
- **Dữ liệu**: cả 3.330 từ, không cần thêm. Phụ thuộc giọng đọc của thiết bị (iPhone có sẵn en-US); thiết bị không có TTS thì ẩn game này.

## 3. Đổi dạng từ (word form, kiểu Part 5)

- **Chơi**: câu ETS có chỗ trống + 4 dạng của cùng một gốc từ (accept / acceptable / acceptance / accepting). Chọn dạng đúng, sau đó app giải thích vì sao (vị trí cần danh từ / tính từ / trạng từ).
- **Căn cứ**:
  - Người học thường chỉ biết một dạng của từ mà không biết các dạng phái sinh (Schmitt & Zimmerman 2002, *TESOL Quarterly*); dạy theo họ từ mở rộng vốn từ hiệu quả (Bauer & Nation 1993).
  - Buộc phân tích ngữ pháp quanh chỗ trống là tác vụ "đánh giá" trong Involvement Load (Laufer & Hulstijn 2001).
- **Sát TOEIC**: câu hỏi dạng từ là nhóm lớn nhất trong Part 5.
- **Dữ liệu — cần bổ sung**: trong 3.330 từ hiện tại chỉ có 156 họ từ (349 từ) đủ 2 dạng trở lên. Muốn game có đủ câu, cần thêm một lớp dữ liệu `word_families` (như `vocab_enrich.json`) cho các từ có câu ví dụ: sinh các dạng n/v/adj/adv và kiểm tra từng dạng có thật trong từ điển. Làm cho 306 từ HF trước, mở rộng sau.

## Cách gắn vào app (đề xuất)

- Thêm 3 lựa chọn vào ô **Chế độ** ở Trang chính, dùng chung bộ thẻ và hàng đợi Leitner hiện có, không thêm tab mới.
- Mỗi phiên 10 câu, có điểm và màn kết thúc như phiên học hiện tại.

## Quyết định (2026-10-10)

- Làm game 1 (Điền câu ETS) và game 2 (Nghe và gõ). Game 3 (Đổi dạng từ) để sau, cần lớp dữ liệu họ từ.
- Kết quả game cập nhật Leitner như một lượt ôn: đúng khi dùng tối đa 2 bậc gợi ý (chữ cái đầu, nghĩa) = Thuộc; phải xem 4 lựa chọn / IPA, gõ sai hoặc bấm "Không biết" = Quên.
- Thêm theo yêu cầu: **Phi thuyền từ vựng** (v1.4.0). Câu hỏi (nghĩa của loại từ chính + câu ETS che từ) ở trên; 3 thiên thạch mang 3 từ cùng loại từ rơi theo 3 làn; lái phi thuyền vào thiên thạch đúng. 3 kiểu di chuyển: Rơi thẳng, Lượn sóng, Đổi làn (đổi chỗ 2 lần rồi khoá ở 58% quãng rơi). 3 mạng, chuỗi đúng làm rơi nhanh dần.
  - Đây là nhận diện 1 trong 3 (bằng chứng ghi nhớ yếu hơn 2 game gõ), nên: đúng = không đổi hộp, chỉ tính lượt ôn và điểm; sai = Quên (về hộp 1). Vai trò: khởi động, giữ nhịp học hằng ngày.
- Đồ hoạ: khối "Trò chơi" ở Trang chính có minh hoạ SVG cho từng game; mascot Choco (Visualize/P01-choco, pose idle/happy/sad) phản ứng theo kết quả và ngồi trong buồng lái phi thuyền. Ảnh nằm ở `assets/`.

## Low priority (không đề xuất)

- Ghép cặp tốc độ (matching), trắc nghiệm nhanh đúng/sai: chỉ là nhận diện, bằng chứng ghi nhớ yếu; app đã có trắc nghiệm 4 đáp án.
- Xếp chữ (anagram), hangman: tập trung vào chữ cái, không vào nghĩa.
- Ô chữ (crossword): tốn công sinh, khó dùng trên điện thoại.
