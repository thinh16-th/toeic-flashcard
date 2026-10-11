// node extract.js in.html out.json — Vietnamese strings in the main app script (AST) + static HTML text/attributes
const fs = require("fs"); const acorn = require("acorn");
const html = fs.readFileSync(process.argv[2], "utf8");
const VI = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹĂÂĐÊÔƠƯÀÁẠẢÃẰẮẶẲẴẦẤẬẨẪÈÉẸẺẼỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕỒỐỘỔỖỜỚỢỞỠÙÚỤỦŨỪỨỰỬỮỲÝỴỶỸ]/;
const hits = [];
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
      if (VI.test(src) && !(parent && parent.type === "Property" && parent.key === n) && !(parent && parent.type === "CallExpression" && parent.callee.type === "Identifier" && parent.callee.name === "L")) { hits.push({ start: start + n.start, end: start + n.end, kind: n.type === "Literal" ? "str" : "tpl", src, ctx: js.slice(Math.max(0, n.start - 70), n.start).split("\n").pop() }); sel = true; }
    }
    for (const k in n) { if (k === "type" || k === "start" || k === "end") continue; const v = n[k];
      if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === "string" && walk(c, n, sel)); else if (v && typeof v.type === "string") walk(v, n, sel); }
  })(ast, null, false);
}
// static HTML outside <script>/<style>
const body = html.replace(/<script\b[\s\S]*?<\/script>/g, (m) => " ".repeat(m.length)).replace(/<style\b[\s\S]*?<\/style>/g, (m) => " ".repeat(m.length));
const texts = new Set(), attrs = new Set();
for (const m of body.matchAll(/>([^<>]+)</g)) { const t = m[1].replace(/\s+/g, " ").trim(); if (t && VI.test(t)) texts.add(t); }
for (const m of body.matchAll(/\s(placeholder|aria-label|title|content|alt)="([^"]*)"/g)) if (VI.test(m[2])) attrs.add(m[2]);
fs.writeFileSync(process.argv[3], JSON.stringify({ hits, texts: [...texts], attrs: [...attrs] }, null, 1));
console.log("js hits", hits.length, "tpl", hits.filter((h) => h.kind === "tpl").length, "static texts", texts.size, "attrs", attrs.size);
