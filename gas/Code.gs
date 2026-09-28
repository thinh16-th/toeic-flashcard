/**
 * Flashcard TOEIC Vocab — backend Google Apps Script (lớp 3).
 * Lưu tiến độ theo username vào sheet "progress" của Spreadsheet chứa script này.
 *
 * API (Web app, Execute as Me, Access Anyone):
 *   GET  ?u=<username>                 → {ok, exists, data}
 *   GET  ?action=ping                  → {ok, ts}
 *   POST body text/plain JSON:
 *        {u, data}                     → {ok, updated}   | {ok:false, code:"stale", data:<bản server>}
 *        {u, action:"delete"}          → {ok}
 *
 * Cột sheet: username | updated | cards | json_1 | json_2 | ... (JSON tách 40.000 ký tự/ô vì Sheets giới hạn 50.000)
 */
var SHEET_NAME = 'progress';
var CHUNK = 40000;
var USER_RE = /^[a-z0-9_.-]{2,32}$/;

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'ping') return out_({ ok: true, ts: new Date().toISOString() });
  var u = normUser_(p.u);
  if (!u) return out_({ ok: false, code: 'bad_username' });
  var row = findRow_(u);
  if (!row) return out_({ ok: true, exists: false, data: null });
  return out_({ ok: true, exists: true, data: readRow_(row) });
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return out_({ ok: false, code: 'bad_json' }); }
  var u = normUser_(body.u);
  if (!u) return out_({ ok: false, code: 'bad_username' });

  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); }
  catch (err) { return out_({ ok: false, code: 'busy' }); }
  try {
    if (body.action === 'delete') {
      var r = findRow_(u);
      if (r) sheet_().deleteRow(r);
      return out_({ ok: true });
    }
    var data = body.data;
    if (!data || typeof data !== 'object' || !data.updated) return out_({ ok: false, code: 'bad_data' });
    data.username = u;
    var row = findRow_(u);
    if (row) {
      var cur = readRow_(row);
      if (cur && cur.updated && cur.updated > data.updated) {
        return out_({ ok: false, code: 'stale', data: cur });
      }
    }
    writeRow_(row, u, data);
    return out_({ ok: true, updated: data.updated });
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------- helpers
function normUser_(s) {
  if (!s) return null;
  s = String(s).trim().toLowerCase();
  return USER_RE.test(s) ? s : null;
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['username', 'updated', 'cards', 'json_1']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function findRow_(u) {
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return null;
  var names = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < names.length; i++) {
    if (String(names[i][0]).toLowerCase() === u) return i + 2;
  }
  return null;
}

function readRow_(row) {
  var sh = sheet_();
  var lastCol = sh.getLastColumn();
  var vals = sh.getRange(row, 1, 1, lastCol).getValues()[0];
  var json = '';
  for (var c = 3; c < vals.length; c++) json += vals[c] ? String(vals[c]) : '';
  if (!json) return null;
  try { return JSON.parse(json); } catch (err) { return null; }
}

function writeRow_(row, u, data) {
  var sh = sheet_();
  var json = JSON.stringify(data);
  var chunks = [];
  for (var i = 0; i < json.length; i += CHUNK) chunks.push(json.slice(i, i + CHUNK));
  var cards = data.cards ? Object.keys(data.cards).length : 0;
  var line = [u, data.updated, cards].concat(chunks);
  if (!row) {
    row = sh.getLastRow() + 1;
  } else {
    // xoá chunk cũ thừa
    var lastCol = sh.getLastColumn();
    if (lastCol > 3) sh.getRange(row, 4, 1, lastCol - 3).clearContent();
  }
  sh.getRange(row, 1, 1, line.length).setValues([line]);
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Chạy tay trong editor để tự kiểm tra (Run → selfTest)
function selfTest() {
  var u = 'selftest_' + Math.floor(Math.random() * 1000);
  var d = { schema: 1, updated: new Date().toISOString(), cards: { ensure: { box: 2 } } };
  writeRow_(null, u, d);
  var r = findRow_(u);
  var back = readRow_(r);
  Logger.log('write/read OK: ' + (back && back.cards.ensure.box === 2));
  sheet_().deleteRow(r);
}
