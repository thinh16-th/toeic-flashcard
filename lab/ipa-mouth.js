// IPA mouth rig (G02 khẩu hình IPA) — 2 hình tham số hoá: môi chính diện + mặt cắt miệng nhìn nghiêng.
// Mỗi âm là một bộ số (PHON[sym]); chuyển âm = nội suy số → hình chạy mượt, file nhẹ, không cần video.
// usage: const m = IPAMouth.mount(frontHost, sideHost); m.set(IPAMouth.PHON["θ"]); m.to(params, ms)
(function (g) {
  const NS = "http://www.w3.org/2000/svg";
  const C = { ink: "#3A2B4A", skin: "#FFDCC2", lip: "#FF8A8A", lipD: "#E06A6A", teeth: "#FFFFFF", tongue: "#FF9EAA", mouth: "#5B2A3A", sun: "#FFC93C" };
  // fw, fh: nửa bề ngang / độ mở miệng · rnd: chu tròn môi · teeth: độ lộ răng trên · tout: thò lưỡi · bite: môi dưới chạm răng trên
  // jaw: mở hàm · lip: chu môi (nhìn nghiêng) · tx,ty: đầu lưỡi · bx,by: lưng lưỡi cao nhất · curl: cong đầu lưỡi (âm r)
  const P = (fw, fh, rnd, teeth, jaw, lip, tx, ty, bx, by, ext) => Object.assign({ fw, fh, rnd, teeth, tout: 0, bite: 0, jaw, lip, tx, ty, bx, by, curl: 0 }, ext || {});
  const PHON = {
    rest: P(26, 4, 0, 0, .05, 0, 168, 120, 130, 104),
    "θ": P(30, 16, 0, 1, .3, 0, 192, 109, 130, 106, { tout: 1 }), "ð": P(30, 16, 0, 1, .3, 0, 192, 109, 130, 106, { tout: 1 }),
    "ʃ": P(18, 14, .8, .6, .15, .8, 160, 100, 130, 96), "ʒ": P(18, 14, .8, .6, .15, .8, 160, 100, 130, 96),
    "æ": P(34, 30, 0, .7, 1, 0, 172, 130, 132, 118), "i": P(38, 8, 0, 1, .1, 0, 170, 112, 150, 92),
    "u": P(13, 13, 1, 0, .25, 1, 158, 120, 110, 90), "r": P(20, 14, .6, .3, .3, .55, 150, 96, 120, 104, { curl: 1 }),
    "f": P(30, 6, 0, 1, .15, 0, 168, 116, 130, 108, { bite: 1 }), "v": P(30, 6, 0, 1, .15, 0, 168, 116, 130, 108, { bite: 1 }),
    "ɪ": P(32, 12, 0, .8, .2, 0, 170, 114, 148, 96), "ɛ": P(32, 20, 0, .7, .55, 0, 170, 124, 140, 106),
    "ŋ": P(28, 10, 0, .6, .2, 0, 165, 120, 100, 84), "k": P(28, 10, 0, .6, .2, 0, 165, 122, 96, 84), "ɡ": P(28, 10, 0, .6, .2, 0, 165, 122, 96, 84),
    "d": P(28, 8, 0, .8, .15, 0, 180, 96, 140, 104), "t": P(28, 8, 0, .8, .15, 0, 180, 96, 140, 104),
  };
  const KEYS = Object.keys(PHON.rest);
  const mix = (a, b, k) => { const o = {}; for (const n of KEYS) o[n] = a[n] + (b[n] - a[n]) * k; return o; };
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  let uid = 0;

  function frontD(p) {
    const cx = 80, cy = 66, rnd = p.rnd, ow = p.fw * (1 - .35 * rnd), oh = Math.max(4, p.fh);
    const LW = ow + 14 + 6 * (1 - rnd), LH = oh / 2 + 9 + 5 * rnd, k = .55 + .35 * rnd;
    return {
      outer: `M${cx - LW},${cy} C${cx - LW + 6},${cy - LH} ${cx - 10},${cy - LH - 4} ${cx},${cy - LH + 3} C${cx + 10},${cy - LH - 4} ${cx + LW - 6},${cy - LH} ${cx + LW},${cy} C${cx + LW - 8},${cy + LH + 6} ${cx - LW + 8},${cy + LH + 6} ${cx - LW},${cy} Z`,
      inner: `M${cx - ow},${cy} C${cx - ow},${cy - oh / 2 * k * 1.6} ${cx + ow},${cy - oh / 2 * k * 1.6} ${cx + ow},${cy} C${cx + ow},${cy + oh / 2 * k * 1.7} ${cx - ow},${cy + oh / 2 * k * 1.7} ${cx - ow},${cy} Z`,
      teeth: [cx - ow, cy - oh, 2 * ow, oh * .55 * p.teeth + 3],
      tongueIn: [cx, cy + oh * .55, ow * .7, oh * .35, oh > 16 ? Math.min(1, (oh - 16) / 6) * (1 - p.tout) : 0],
      tout: `M${cx - ow * .62},${cy + 1} C${cx - ow * .6},${cy + oh * .9} ${cx + ow * .6},${cy + oh * .9} ${cx + ow * .62},${cy + 1} Z`,
      bite: [cx - ow + 4, cy - 5, Math.max(0, 2 * ow - 8)],
      fold: `M${cx - LW + 6},${cy - 4} q-6,4 0,8 M${cx + LW - 6},${cy - 4} q6,4 0,8`,
    };
  }
  function sideD(p) {
    const dy = 26 * p.jaw, lip = p.lip, tx = p.tx, ty = p.ty, bx = p.bx, by = p.by, cu = p.curl;
    const tipIn = `C${bx + 20},${by - 2} ${tx - 14 + 8 * cu},${ty - 6 + 22 * cu} ${tx - 2 * cu},${ty + 6 * cu} C${tx - 10 * cu},${ty - 6 * cu} ${tx + 6 * cu},${ty - 10 * cu} ${tx},${ty} `;
    return {
      face: `M40,30 C120,10 190,30 206,64 L222,80 L206,88 C${210 + 6 * lip},94 ${214 + 8 * lip},100 ${204 + 8 * lip},106 L${204 + 8 * lip},${112 + dy} C${214 + 8 * lip},${116 + dy} ${208 + 6 * lip},${128 + dy} 198,${132 + dy} C200,${150 + dy} 186,${166 + dy} 150,${170 + dy} L60,190 L40,190 Z`,
      oral: `M70,98 C90,82 160,82 182,96 L186,${106 + dy} C150,${150 + dy} 100,${160 + dy} 70,170 Z`,
      tongue: `M70,170 C66,140 ${bx - 40},${by + 6} ${bx},${by} ` + tipIn + `C${tx + 2},${ty + 8} ${tx - 20},${ty + 18} ${tx - 40},${140 + dy * .8} C120,${160 + dy * .6} 90,${170 + dy * .4} 70,170 Z`,
      loTeeth: `M172,${116 + dy} L182,${116 + dy} L184,${106 + dy * .9} L176,${104 + dy * .9} Z`,
      upLip: `M190,94 C${204 + 10 * lip},90 ${214 + 10 * lip},98 ${207 + 10 * lip},108 L190,106 Z`,
      loLip: `M190,${112 + dy} L${205 + 9 * lip},${112 + dy} C${214 + 9 * lip},${118 + dy} ${208 + 8 * lip},${128 + dy} 192,${126 + dy} Z`,
      dot: [tx, ty],
    };
  }

  function mount(frontHost, sideHost) {
    const id = "ipam" + (++uid);
    // ----- chính diện
    const f = el("svg", { viewBox: "0 0 160 142", "aria-hidden": "true", class: "ipa-front" }, frontHost);
    el("ellipse", { cx: 80, cy: 74, rx: 74, ry: 62, fill: C.skin, stroke: C.ink, "stroke-width": 5 }, f);
    el("path", { d: "M54,24 Q80,18 106,24", fill: "none", stroke: C.ink, "stroke-width": 4, "stroke-linecap": "round", opacity: .35 }, f);
    const F = {};
    F.outer = el("path", { fill: C.lip, stroke: C.ink, "stroke-width": 4, "stroke-linejoin": "round" }, f);
    const cp = el("clipPath", { id: id + "m" }, el("defs", {}, f)); F.clip = el("path", {}, cp);
    F.hole = el("path", { fill: C.mouth }, f);
    const gin = el("g", { "clip-path": `url(#${id}m)` }, f);
    F.teeth = el("rect", { fill: C.teeth }, gin);
    F.tin = el("ellipse", { fill: C.tongue }, gin);
    F.bite = el("rect", { height: 6, rx: 2, fill: C.teeth, stroke: C.ink, "stroke-width": 2 }, f);
    F.line = el("path", { fill: "none", stroke: C.ink, "stroke-width": 3, "stroke-linejoin": "round" }, f);
    F.tout = el("path", { fill: C.tongue, stroke: C.ink, "stroke-width": 3, "stroke-linejoin": "round" }, f);
    F.fold = el("path", { fill: "none", stroke: C.ink, "stroke-width": 2.5, "stroke-linecap": "round" }, f);
    // ----- mặt cắt
    const s = el("svg", { viewBox: "20 6 220 196", "aria-hidden": "true", class: "ipa-side" }, sideHost);
    const S = {};
    S.face = el("path", { fill: C.skin, stroke: C.ink, "stroke-width": 5, "stroke-linejoin": "round" }, s);
    S.oral = el("path", { fill: C.mouth, opacity: .9 }, s);
    el("path", { d: "M70,96 C80,74 120,70 160,78 C172,80 178,86 182,94", fill: "none", stroke: C.ink, "stroke-width": 5, "stroke-linecap": "round" }, s);
    S.tongue = el("path", { fill: C.tongue, stroke: C.ink, "stroke-width": 4, "stroke-linejoin": "round" }, s);
    el("path", { d: "M176,92 L186,92 L184,106 L178,106 Z", fill: C.teeth, stroke: C.ink, "stroke-width": 2.5, "stroke-linejoin": "round" }, s);
    S.loTeeth = el("path", { fill: C.teeth, stroke: C.ink, "stroke-width": 2.5, "stroke-linejoin": "round" }, s);
    S.upLip = el("path", { fill: C.lip, stroke: C.ink, "stroke-width": 3, "stroke-linejoin": "round" }, s);
    S.loLip = el("path", { fill: C.lip, stroke: C.ink, "stroke-width": 3, "stroke-linejoin": "round" }, s);
    S.bite = el("path", { d: "M190,106 C198,104 204,108 200,116", fill: "none", stroke: C.lipD, "stroke-width": 7, "stroke-linecap": "round" }, s);
    S.dot = el("circle", { r: 6, fill: C.sun, stroke: C.ink, "stroke-width": 2.5 }, s);

    let cur = Object.assign({}, PHON.rest), raf = 0;
    function draw(p) {
      const a = frontD(p);
      F.outer.setAttribute("d", a.outer); F.clip.setAttribute("d", a.inner); F.hole.setAttribute("d", a.inner); F.line.setAttribute("d", a.inner);
      const [x, y, w, h] = a.teeth; F.teeth.setAttribute("x", x); F.teeth.setAttribute("y", y); F.teeth.setAttribute("width", w); F.teeth.setAttribute("height", h); F.teeth.setAttribute("opacity", Math.min(1, p.teeth * 2));
      const [ex, ey, erx, ery, eo] = a.tongueIn; F.tin.setAttribute("cx", ex); F.tin.setAttribute("cy", ey); F.tin.setAttribute("rx", erx); F.tin.setAttribute("ry", ery); F.tin.setAttribute("opacity", eo);
      F.tout.setAttribute("d", a.tout); F.tout.setAttribute("opacity", p.tout);
      const [bx, by, bw] = a.bite; F.bite.setAttribute("x", bx); F.bite.setAttribute("y", by); F.bite.setAttribute("width", bw); F.bite.setAttribute("opacity", p.bite);
      F.fold.setAttribute("d", a.fold); F.fold.setAttribute("opacity", Math.max(0, (p.rnd - .4) * 1.2) * .5);
      const b = sideD(p);
      S.face.setAttribute("d", b.face); S.oral.setAttribute("d", b.oral); S.tongue.setAttribute("d", b.tongue); S.loTeeth.setAttribute("d", b.loTeeth);
      S.upLip.setAttribute("d", b.upLip); S.loLip.setAttribute("d", b.loLip); S.bite.setAttribute("opacity", p.bite);
      S.dot.setAttribute("cx", b.dot[0]); S.dot.setAttribute("cy", b.dot[1]);
    }
    const ease = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
    function to(target, ms) {
      cancelAnimationFrame(raf);
      const from = Object.assign({}, cur), t0 = performance.now(), d = Math.max(1, ms || 0);
      return new Promise((res) => {
        const step = (now) => {
          const k = Math.min(1, (now - t0) / d); cur = mix(from, target, ease(k)); draw(cur);
          if (k < 1) raf = requestAnimationFrame(step); else res();
        };
        if (!ms) { cur = Object.assign({}, target); draw(cur); res(); } else raf = requestAnimationFrame(step);
      });
    }
    draw(cur);
    return { set: (p) => to(p, 0), to, front: f, side: s };
  }
  // tách IPA thành âm (nguyên âm đôi, tʃ dʒ, ɝ ɚ là một âm); bỏ dấu nhấn ˈ ˌ và dấu chấm
  const MULTI = ["aɪ", "aʊ", "ɔɪ", "eɪ", "oʊ", "tʃ", "dʒ"];
  function split(ipa) {
    const s = ipa.replace(/[\/ˈˌ.\s]/g, ""); const out = [];
    for (let i = 0; i < s.length;) { const m = MULTI.find((x) => s.startsWith(x, i)); if (m) { out.push(m); i += m.length; } else { out.push(s[i]); i++; } }
    return out;
  }
  g.IPAMouth = { mount, PHON, split, mix };
})(window);
