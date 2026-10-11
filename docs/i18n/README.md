# Song ngữ EN/VI (v1.10.0)

- Code viết tiếng Việt như bình thường. `i18n_apply.js` bọc mọi chuỗi tiếng Việt trong `<script>` thành `L("vi", "en")` theo `out_js.json`, và nạp bảng chữ tĩnh HTML `out_static.json` (đổi một lần lúc khởi động khi chọn EN).
- Chạy lại được nhiều lần (chuỗi đã bọc `L(...)` được bỏ qua). Chuỗi mới chưa có bản dịch được in ra ở dòng `missing:` → thêm vào 2 file JSON rồi chạy lại.
- `extract.js in.html out.json` liệt kê chuỗi cần dịch.

```
npm i acorn@8.12.1
node i18n_apply.js ../../index.html ../../index.html
```
Câu dịch ví dụ (nội dung, không phải giao diện) nằm ở `vocab_example_vi.json`, `build_vocab.py` gộp vào `vocab.json` khi câu tiếng Anh khớp.
