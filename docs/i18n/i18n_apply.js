// node i18n_apply.js in.html out.html — song ngữ EN/VI:
//  - mọi chuỗi tiếng Việt trong script (AST, theo out_js.json) → L("vi", "en"), chọn lúc chạy theo LANG
//  - chữ tĩnh trong HTML (theo out_static.json) đổi một lần lúc khởi động khi LANG = en
// Chuỗi chưa có bản dịch giữ nguyên (in ra để bổ sung vào out_js.json / out_static.json).
const fs = require("fs"); const acorn = require("acorn");
const [, , inp, outp] = process.argv;
let html = fs.readFileSync(inp, "utf8");
const JS = JSON.parse(fs.readFileSync(__dirname + "/out_js.json", "utf8"));
const ST = JSON.parse(fs.readFileSync(__dirname + "/out_static.json", "utf8"));
const VI = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹĂÂĐÊÔƠƯÀÁẠẢÃẰẮẶẲẴẦẤẬẨẪÈÉẸẺẼỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕỒỐỘỔỖỜỚỢỞỠÙÚỤỦŨỪỨỰỬỮỲÝỴỶỸ]/;
const hits = [], missing = new Set();
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  const start = m.index + "<script>".length; const js = m[1];
  if (!VI.test(js)) continue;
  const ast = acorn.parse(js, { ecmaVersion: 2022, sourceType: "script" });
  (function walk(n, parent, inSel) {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "L") return;  // đã song ngữ
    let sel = inSel;
    if (!inSel && ((n.type === "Literal" && typeof n.value === "string") || n.type === "TemplateLiteral")) {
      const src = js.slice(n.start, n.end);
      if (VI.test(src) && !(parent && parent.type === "Property" && parent.key === n) && !(parent && parent.type === "CallExpression" && parent.callee.type === "Identifier" && parent.callee.name === "L")) {
        if (JS[src]) { hits.push({ start: start + n.start, end: start + n.end, src }); sel = true; } else missing.add(src);
      }
    }
    for (const k in n) { if (k === "type" || k === "start" || k === "end") continue; const v = n[k];
      if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === "string" && walk(c, n, sel)); else if (v && typeof v.type === "string") walk(v, n, sel); }
  })(ast, null, false);
}
hits.sort((a, b) => b.start - a.start);
for (const h of hits) html = html.slice(0, h.start) + `L(${h.src}, ${JS[h.src]})` + html.slice(h.end);
// bảng chữ tĩnh: khoá/giá trị đã bỏ entity, gộp khoảng trắng (khớp với text node trong DOM)
const dec = (t) => t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const map = {}; for (const [k, v] of Object.entries(ST)) map[dec(k)] = dec(v);
const boot = `
    // ===== Ngôn ngữ giao diện (VI mặc định, EN tuỳ chọn ở nút EN/VI). Chuỗi trong code: L("vi", "en"); chữ tĩnh: I18N_STATIC
    const LANG = (() => { try { return localStorage.getItem("lang") === "en" ? "en" : "vi"; } catch (e) { return "vi"; } })();
    const L = (vi, en) => (LANG === "en" ? en : vi);
    const LOCALE = LANG === "en" ? "en-US" : "vi-VN";
    const I18N_STATIC = ${JSON.stringify(map).replace(/</g, "\\u003c")};
    (function () {
      document.documentElement.lang = LANG;
      if (LANG !== "en") return;
      const M = I18N_STATIC, norm = (t) => t.replace(/\\s+/g, " ").trim();
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentNode && n.parentNode.closest && n.parentNode.closest("script,style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      const list = []; while (w.nextNode()) list.push(w.currentNode);
      for (const n of list) { const k = norm(n.nodeValue); if (k && M[k]) n.nodeValue = n.nodeValue.match(/^\\s*/)[0] + M[k] + n.nodeValue.match(/\\s*$/)[0]; }
      for (const el of document.querySelectorAll("[placeholder],[aria-label],[title]")) for (const a of ["placeholder", "aria-label", "title"]) { const v = el.getAttribute(a); if (v && M[norm(v)]) el.setAttribute(a, M[norm(v)]); }
      const md = document.querySelector('meta[name="description"]'); if (md && M[norm(md.content)]) md.content = M[norm(md.content)];
      if (M[document.title]) document.title = M[document.title];
    })();
`;
const marker = "    // ===== Helpers dung chung (boilerplate ui-kit-html) =====";
if (html.split(marker).length !== 2) throw new Error("marker");
const old = html.indexOf("    // ===== Ngôn ngữ giao diện");   // chạy lại: thay khối cũ (bảng chữ tĩnh mới)
if (old >= 0) html = html.slice(0, old) + html.slice(html.indexOf(marker));
html = html.replace(marker, boot.slice(1) + marker);
// kiểm tra cú pháp mọi script sau khi thay
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) acorn.parse(m[1], { ecmaVersion: 2022, sourceType: "script" });
fs.writeFileSync(outp, html);
console.log("wrapped", hits.length, "| static keys", Object.keys(map).length, "| missing", missing.size);
for (const x of missing) console.log("  missing:", x.slice(0, 100));
