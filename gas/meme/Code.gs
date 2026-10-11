/**
 * TOEIC flashcard — Meme API. Apps Script RIÊNG, không đụng script lưu tiến độ và Google Sheet tiến độ.
 * Chỉ ĐỌC file trong một thư mục Google Drive của chủ tài khoản: clips/NNN.webm, mp4/NNN.mp4, posters/NNN.webp.
 *
 * Script Properties (Project Settings → Script Properties):
 *   FOLDER_ID  id thư mục Drive (phần sau /folders/ trên URL)
 *   KEY        mã khoá tự đặt; app gửi kèm mỗi lần gọi
 *
 * GET ?key=KEY&action=ping                       → {ok:true}
 * GET ?key=KEY&action=list                       → {ok:true, clips:[{id, webm, mp4, poster}]}
 * GET ?key=KEY&action=posters                    → {ok:true, posters:{id: base64 webp}}  (đọc posters.json nếu có)
 * GET ?key=KEY&action=clip&id=001&fmt=mp4|webm   → {ok:true, id, mime, b64}
 *
 * Clip là của bên thứ ba (Catmeme Club), chỉ dùng nội bộ: thư mục Drive để riêng tư, không chia sẻ công khai.
 */
var SUB = { webm: "clips", mp4: "mp4", poster: "posters" };
var EXT = { webm: "webm", mp4: "mp4", poster: "webp" };
var MIME = { webm: "video/webm", mp4: "video/mp4", poster: "image/webp" };

function doGet(e) {
  var p = (e && e.parameter) || {};
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty("KEY"), folderId = props.getProperty("FOLDER_ID");
  if (!key || !folderId) return out_({ ok: false, error: "not_configured" });
  if (p.key !== key) return out_({ ok: false, error: "bad_key" });
  try {
    if (p.action === "ping") return out_({ ok: true });
    var root = DriveApp.getFolderById(folderId);
    if (p.action === "list") return out_({ ok: true, clips: list_(root) });
    if (p.action === "posters") return out_({ ok: true, posters: posters_(root) });
    if (p.action === "clip") {
      var id = String(p.id || ""), fmt = String(p.fmt || "webm");
      if (!/^[0-9A-Za-z_-]{1,40}$/.test(id) || !SUB[fmt] || fmt === "poster") return out_({ ok: false, error: "bad_request" });
      var f = file_(root, fmt, id);
      if (!f) return out_({ ok: false, error: "not_found" });
      return out_({ ok: true, id: id, mime: MIME[fmt], b64: Utilities.base64Encode(f.getBlob().getBytes()) });
    }
    return out_({ ok: false, error: "bad_action" });
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  }
}

function sub_(root, kind) {
  var it = root.getFoldersByName(SUB[kind]);
  return it.hasNext() ? it.next() : null;
}
function file_(root, kind, id) {
  var dir = sub_(root, kind); if (!dir) return null;
  var it = dir.getFilesByName(id + "." + EXT[kind]);
  return it.hasNext() ? it.next() : null;
}
function ids_(root, kind) {
  var dir = sub_(root, kind), set = {};
  if (!dir) return set;
  var it = dir.getFiles(), rx = new RegExp("^(.+)\\." + EXT[kind] + "$", "i");
  while (it.hasNext()) { var m = it.next().getName().match(rx); if (m) set[m[1]] = true; }
  return set;
}
function list_(root) {
  var cache = CacheService.getScriptCache(), hit = cache.get("list");
  if (hit) return JSON.parse(hit);
  var w = ids_(root, "webm"), m = ids_(root, "mp4"), po = ids_(root, "poster"), all = {};
  [w, m].forEach(function (s) { Object.keys(s).forEach(function (k) { all[k] = true; }); });
  var rows = Object.keys(all).sort().map(function (id) { return { id: id, webm: !!w[id], mp4: !!m[id], poster: !!po[id] }; });
  cache.put("list", JSON.stringify(rows), 600);
  return rows;
}
function posters_(root) {
  // nhanh: một file posters.json (gộp sẵn {id: base64}) ở gốc thư mục; đọc từng ảnh mất ~2 phút cho 88 file
  var packed = root.getFilesByName("posters.json");
  if (packed.hasNext()) return JSON.parse(packed.next().getBlob().getDataAsString());
  var dir = sub_(root, "poster"), outp = {};
  if (!dir) return outp;
  var it = dir.getFiles();
  while (it.hasNext()) {
    var f = it.next(), m = f.getName().match(/^(.+)\.webp$/i);
    if (m) outp[m[1]] = Utilities.base64Encode(f.getBlob().getBytes());
  }
  return outp;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Chạy hàm này MỘT LẦN trong trình soạn Apps Script (chọn "authorize" → Run) để cấp quyền đọc Drive
 * và kiểm tra FOLDER_ID. Execution log in ra tên thư mục và số file trong clips/, mp4/, posters/.
 */
function authorize() {
  var id = PropertiesService.getScriptProperties().getProperty("FOLDER_ID");
  var root = DriveApp.getFolderById(id);
  Logger.log("Thư mục: " + root.getName());
  ["webm", "mp4", "poster"].forEach(function (k) {
    var n = Object.keys(ids_(root, k)).length;
    Logger.log(SUB[k] + "/: " + n + " file ." + EXT[k]);
  });
  CacheService.getScriptCache().remove("list");
}
