/* ArturRig — Артур кейіпкері (ZAKATOON-тәрізді «ақ кейіпкер» стилі), таза SVG.
 *
 * Кейіпкер — уақытқа тәуелді параметрлер жиыны: бір кадр = ArturRig.draw(params, opts) → "<g>…</g>".
 * Жергілікті координаттар: табан ортасы (0,0), жоғары — теріс y, бойы ≈ 960 бірлік (бас ≈ 300).
 *
 * params:
 *   turn      — басты/денені бұру: 0 алды, ±0.5 ¾, ±1 бүйірі (оң жақ = экранның оңына қарайды), ±2 арты
 *   headTurn  — басқа ғана қосымша бұрылыс (дене қозғалмай), headTilt — бас қисаюы (°), headY — бас ығысуы
 *   lean      — дене еңкеюі (°, жамбас айналасында), squash — 1 қалыпты, <1 жаншылған, >1 созылған
 *   eye  {scale, lidTop, lidBot, lidTilt, px, py, pupil, happy}   — lidTop/lidBot 0..1, px/py −1..1
 *   brow {lift, angle, liftL, liftR}                             — angle>0 ашулы (ішкі ұшы төмен)
 *   mouth     — "rest" | "mbp" | "ee" | "aa" | "oh" | "uu" | "ff" | "smile" | "laugh" | "shock" | "growl"
 *               | "frown" | "smirk" | "wavy" | "hmm"
 *   armL/armR {sh, el, hand}  — sh иықтан (0 = төмен салбыраған, + сыртқа/жоғары), el шынтақ бүгілісі,
 *               hand "rest" | "open" | "fist" | "point"; L — экранның сол жағындағы қол (кейіпкердің оң қолы)
 *   legL/legR {a, k}          — a аяқтың бұрышы (+ сыртқа), k тізе бүгілісі
 *   outfit    — "school" (пиджак, галстук) | "grad" (+ түлек лентасы) | "casual" (ақ поло, бежевый шалбар)
 *   fx {sweat, blush, vein}   — 0..1
 * opts: { seed: сызық «қайнауы» үшін (null — тегіс), id: clipPath префиксі }
 */
(function (G) {
  "use strict";

  const INK = "#141418";
  const C = {
    skin: "#ffffff",
    hair: "#262730",
    hairLine: "#4d4f5e",
    brow: "#1a1b21",
    mole: "#3d2b2b",
    mouth: "#4b1d24",
    tongue: "#e2797f",
    teeth: "#ffffff",
    blazer: "#383a45",
    blazerShade: "#2b2c35",
    tie: "#17171c",
    trousers: "#30313b",
    shoes: "#1b1b20",
    sash: "#2b3e9e",
    sashEdge: "#d6ddf2",
    silver: "#cdd2dc",
    gold: "#e6b544",
    chinos: "#dccfb0",
    chinosShade: "#c8ba96",
    sneaker: "#f3f3f5",
    sole: "#d9d9de",
    sweat: "#a8dcf6",
    blush: "#ff6f6f",
    vein: "#e63946",
  };
  const OL = 7; // негізгі контур
  const FL = 4.5; // бет бөлшектерінің контуры
  const D = Math.PI / 180;
  const R = 150; // бас радиусы (көлденең)
  const RYU = 150; // бастың жоғарғы жартысы
  const RYD = 160; // бастың төменгі жартысы (иек сәл ұзынырақ)

  const f = (n) => Math.round(n * 10) / 10;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const wrap = (a) => {
    // градус → (−180, 180]
    a = ((a + 180) % 360 + 360) % 360 - 180;
    return a === -180 ? 180 : a;
  };

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Catmull-Rom → кубтық Безье
  function smooth(pts, closed, k) {
    k = k == null ? 1 / 6 : k;
    const n = pts.length;
    if (n < 2) return "";
    const P = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
      const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
      d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
    }
    return d + (closed ? "Z" : "");
  }
  const poly = (pts) => "M" + pts.map((p) => `${f(p[0])},${f(p[1])}`).join("L") + "Z";

  // ---------- сызық «қайнауы» (hand-drawn boil) ----------
  let RNG = null;
  let AMP = 0;
  const jit = (pts, amp) => {
    if (!RNG) return pts;
    const a = amp == null ? AMP : amp;
    return pts.map((p) => [p[0] + (RNG() - 0.5) * 2 * a, p[1] + (RNG() - 0.5) * 2 * a]);
  };
  const jn = (amp) => (RNG ? (RNG() - 0.5) * 2 * (amp == null ? AMP : amp) : 0);

  let UID = 0;
  let PFX = "ar";
  let LAST_TORSO_CLIP = null;
  const uid = (s) => `${PFX}-${s}-${UID++}`;

  const shape = (d, fill, sw, extra) =>
    `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw == null ? OL : sw}" stroke-linejoin="round" stroke-linecap="round"${extra || ""}/>`;
  const line = (d, sw, color, extra) =>
    `<path d="${d}" fill="none" stroke="${color || INK}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${extra || ""}/>`;
  // контурлы «түтік»: алдымен қара жуан сызық, үстінен түсті жіңішке
  const tube = (pts, w, color, ol) => {
    const d = smooth(pts, false);
    return line(d, w + 2 * (ol == null ? OL : ol), INK) + line(d, w, color);
  };

  // ---------- бастың пішіні ----------
  function headPts(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 2 * Math.PI;
      const s = Math.sin(a), c = Math.cos(a);
      const ry = s > 0 ? RYD : RYU;
      const jaw = s > 0 ? 1 - 0.075 * s * s : 1;
      out.push([R * c * jaw, ry * s]);
    }
    return out;
  }
  // сфералық проекция: бет-нүкте (θ — бастың өз бұрышы, y — биіктік) → экран
  const rAt = (y) => R * Math.sqrt(Math.max(0, 1 - Math.pow(y / (y > 0 ? RYD : RYU), 2)));
  const proj = (thDeg, y, T) => {
    const ph = wrap(thDeg + T);
    return { x: rAt(y) * Math.sin(ph * D), y, c: Math.cos(ph * D), ph };
  };

  // ---------- шаш ----------
  // Шаш сызығы (θ°, y): артында желкеге дейін, бүйірінде құлақтың үстіне дейін, алдында — маңдайды жапқан шашбау.
  function hairlineList(shift) {
    shift = shift || 0; // теріс — шашбау жоғары қайырылған (маңдай ашық)
    const L = [];
    for (let a = -180; a < -104; a += 12) L.push([a, 40 + (Math.round(a / 12) % 2 ? 6 : -3)]);
    L.push([-104, 30], [-97, -2], [-90, -8], [-82, -22], [-75, -46 + shift * 0.5]);
    // шашбау тістері: −68…+68, ұштары сәл солға (кейіпкердің оңына) ауған
    const n = 9, a0 = -68, a1 = 68, step = (a1 - a0) / n;
    const tipY = [-60, -56, -62, -54, -58, -55, -61, -57, -63];
    const notchY = [-90, -100, -96, -104, -98, -102, -95, -99, -92, -86];
    for (let i = 0; i <= n; i++) {
      L.push([a0 + i * step, notchY[i] + shift * 0.55]);
      if (i < n) L.push([a0 + (i + 0.5) * step - 2.5 + (shift ? 6 : 0), tipY[i] + shift]);
    }
    L.push([75, -46 + shift * 0.5], [82, -22], [90, -8], [97, -2], [104, 30]);
    for (let a = 108; a <= 180; a += 12) L.push([a, 40 + (Math.round(a / 12) % 2 ? -3 : 6)]);
    return L;
  }
  // тегіс шаш сызығы: yOf(θ) әр 8° сайын
  function hairlineFn(yOf) {
    const L = [];
    for (let a = -180; a < 180; a += 8) L.push([a, yOf(a)]);
    return L;
  }
  const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
  // ---------- басқа кейіпкерлер (look) ----------
  const HAIR = {
    artur: { line: hairlineList(), color: "#262730", lineColor: "#4d4f5e", tufts: true, strands: true },
    arturSwept: { line: hairlineList(-46), color: "#262730", lineColor: "#4d4f5e", tufts: true, strands: true, my: 0.04 },
    // әкесі: қысқа, маңдайы биік, самайы сәл шегінген
    dad: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 70 ? -100 + 10 * Math.pow(Math.sin(x * 3 * D), 2) - 6 * Math.cos(a * 2.2 * D) : x < 100 ? lerp(-82, -12, sstep(70, 100, x)) : lerp(-12, 34, sstep(100, 150, x)); }), color: "#33343b", strands: [[-30, -140, -34, -112], [10, -146, 6, -114], [40, -136, 36, -110]], mx: -0.02, my: -0.04 },
    director: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 60 ? -122 : x < 100 ? lerp(-122, -6, sstep(60, 100, x)) : lerp(-6, 30, sstep(100, 150, x)); }), color: "#9a9ca6", strands: [[120, -60, 116, 20], [-120, -60, -124, 20]], mx: -0.03, my: -0.07 },
    // апасы: ортадан фарқ, түйін (пучок)
    mom: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 6 ? -112 + x * 2 : x < 80 ? lerp(-100, -36, sstep(6, 80, x)) : x < 108 ? lerp(-36, 30, sstep(80, 108, x)) : 38; }), color: "#2b2226", bun: true, strands: [[-8, -148, -40, -104], [8, -148, 40, -104], [-60, -110, -84, -40], [60, -110, 84, -40]] },
    // Гүлнар апай: иекке дейінгі каре, қиғаш шашбау
    teacher: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 64 ? -64 - 34 * sstep(-64, 64, a) : x < 92 ? lerp(a < 0 ? -64 : -98, 96, sstep(64, 92, x)) : 104; }), color: "#4b3a36", flare: 0.1, strands: [[-30, -146, -56, -70], [20, -150, 36, -102], [130, -40, 128, 80], [-130, -40, -128, 80]], streak: [[30, -150, 52, -96]] },
    // бастауыш мұғалім: құйрық шаш
    teacher1: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 70 ? -92 + 8 * Math.cos(a * 4 * D) : x < 100 ? lerp(-84, 20, sstep(70, 100, x)) : 36; }), color: "#5e3f2f", pony: true, strands: [[-20, -146, -40, -96], [20, -146, 40, -96]] },
    // Аяулым: түзу шашбау, екі өрім + үлкен ақ бантиктер
    girl: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 62 ? -56 + 3 * Math.cos(a * 9 * D) : x < 90 ? lerp(-56, 34, sstep(62, 90, x)) : 40; }), color: "#2a2226", bows: true, pigtails: true, strands: [[-36, -140, -40, -70], [0, -150, 0, -70], [36, -140, 40, -70]] },
    // әже: орамал (желкеде түйілген), астынан ақ шаш көрінеді
    scarf: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 60 ? -78 + 4 * Math.cos(a * 6 * D) : x < 100 ? lerp(-78, 118, sstep(60, 100, x)) : lerp(118, 150, sstep(100, 180, x)); }), color: "#c8425a", lineColor: "#a8344a", flare: 0.16, my: 0.05, dots: "#fff3e6", knot: true, coverEars: true, peek: "#d4d1d8", strands: [[-44, -138, -64, -92], [44, -138, 64, -92], [0, -150, -6, -104]] },
    scarf2: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 60 ? -82 + 4 * Math.cos(a * 6 * D) : x < 100 ? lerp(-82, 112, sstep(60, 100, x)) : lerp(112, 146, sstep(100, 180, x)); }), color: "#3f8f5a", lineColor: "#2f7449", flare: 0.14, my: 0.05, dots: "#f6d55c", knot: true, coverEars: true, peek: "#3b2f2c", strands: [[-44, -138, -64, -92], [44, -138, 64, -92]] },
    // ата: қысқа ақ шаш + тақия
    ata: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 70 ? -112 : x < 100 ? lerp(-112, -10, sstep(70, 100, x)) : lerp(-10, 34, sstep(100, 150, x)); }), color: "#dcdce2", lineColor: "#b4b4bd", strands: [[120, -60, 116, 20], [-120, -60, -124, 20], [150, -40, 146, 30], [-150, -40, -154, 30]], mx: -0.03, my: -0.06, cap: { color: "#24252d", orn: "#ece6d4" } },
    // Бекзат: қысқа (машинкамен алынған) шаш
    buzz: { line: hairlineFn((a) => { const x = Math.abs(a); return x < 66 ? -98 + 3 * Math.cos(a * 8 * D) : x < 100 ? lerp(-98, -6, sstep(66, 100, x)) : lerp(-6, 30, sstep(100, 150, x)); }), color: "#3a2f2a", lineColor: "#5a4a42", mx: -0.035, my: -0.075, strands: [[-30, -140, -34, -112], [10, -146, 6, -114], [40, -136, 36, -110], [130, -50, 126, 10], [-130, -50, -134, 10]] },
  };
  const LOOKS = {
    artur: { hair: "artur", brow: "thick", mole: true },
    arturSwept: { hair: "arturSwept", brow: "thick", mole: true },
    kid: { hair: "artur", brow: "thick", mole: true, kid: [0.56, 0.84], lid: -0.16 },
    mom: { hair: "mom", brow: "thin", lashes: true, body: { w: 0.94, arm: 40, leg: 46 } },
    dad: { hair: "dad", brow: "thick2", mustache: true, body: { w: 1.14, arm: 50, leg: 62 } },
    teacher: { hair: "teacher", brow: "thin", lashes: true, glasses: true, body: { w: 0.98, arm: 42, leg: 44 } },
    teacher1: { hair: "teacher1", brow: "thin", lashes: true, body: { w: 0.9, arm: 40, leg: 42 } },
    girl: { hair: "girl", brow: "thin", lashes: true, lid: -0.2, kid: [0.5, 0.78], body: { w: 0.92, arm: 42, leg: 50 } },
    director: { hair: "director", brow: "thick2", glasses: true, body: { w: 1.1, arm: 48, leg: 60 } },
    aje: { hair: "scarf", brow: "thin", browColor: "#8f8b96", wrinkles: true, lid: 0.08, blushK: 0.4, kid: [0.9, 0.97], body: { w: 1.12, arm: 44, leg: 46 } },
    apa: { hair: "scarf2", brow: "thin", browColor: "#3b2f2c", wrinkles: true, lid: 0.04, blushK: 0.5, body: { w: 1.22, arm: 48, leg: 50 } },
    ata: { hair: "ata", brow: "thick2", browColor: "#b9b7bf", mustache: true, beard: true, wrinkles: true, lid: 0.24, kid: [0.96, 0.98], body: { w: 1.02, arm: 44, leg: 48 } },
    boy: { hair: "buzz", brow: "thick2", kid: [0.6, 0.86], lid: -0.12, body: { w: 0.95, arm: 42, leg: 48 } },
  };
  let LK = LOOKS.artur, HS = HAIR.artur;
  let HAIRLINE = HS.line;
  function hairlineY(th) {
    // θ бойынша интерполяция (шеңбер бойымен)
    const L = HAIRLINE;
    for (let i = 0; i < L.length; i++) {
      const a = L[i], b = L[(i + 1) % L.length];
      let a0 = a[0], a1 = b[0];
      if (a1 < a0) a1 += 360;
      let t = th;
      if (t < a0) t += 360;
      if (t >= a0 && t <= a1) return lerp(a[1], b[1], (t - a0) / Math.max(1e-6, a1 - a0));
    }
    return L[0][1];
  }

  function drawHair(T) {
    // 1) көрінетін шаш сызығы (экранда солдан оңға)
    const vis = [];
    for (const [th, y] of HAIRLINE) {
      const p = proj(th, y, T);
      if (p.c > 0.02) vis.push([p.x, y, p.ph]);
    }
    vis.sort((a, b) => a[2] - b[2]);
    const yL = hairlineY(wrap(-90 - T));
    const yR = hairlineY(wrap(90 - T));
    const edgeL = [-rAt(yL), yL];
    const edgeR = [rAt(yR), yR];
    // 2) сыртқы контур: бастың үлкейтілген пішіні, төбеде көлемді, шеттерінде шашақтар
    const psi = (y, left) => {
      const ry = y > 0 ? RYD : RYU;
      const s = clamp(y / ry, -0.999, 0.999);
      return left ? Math.PI - Math.asin(s) : 2 * Math.PI + Math.asin(s);
    };
    const pL = psi(yL, true), pR = psi(yR, false);
    const outerAt = (p, extra) => {
      const s = Math.sin(p), c = Math.cos(p);
      const top = Math.max(0, -s);
      const mx = 1.055 + 0.02 * top + (extra || 0) + (HS.mx || 0) * top + (HS.flare || 0) * Math.max(0, s);
      const my = 1.03 + (0.1 + (HS.my || 0)) * Math.pow(top, 1.6) + (extra || 0);
      const ry = s > 0 ? RYD : RYU;
      return [R * c * mx, ry * s * my - 3 * top];
    };
    const outer = [];
    const N = 28;
    for (let i = 0; i <= N; i++) outer.push(outerAt(lerp(pL, pR, i / N)));
    // шаш желке/бүйірде бастан сәл ғана үлкен
    outer[0] = [edgeL[0] * 1.05, edgeL[1]];
    outer[N] = [edgeR[0] * 1.05, edgeR[1]];
    const o = jit(outer);
    let d = smooth(o, false, 1 / 6);
    // 3) төменгі шекара оңнан солға: шашбау тістері сәл иілген (талшық сияқты), ұштары өткір
    const bottom = jit([edgeR].concat(vis.slice().reverse().map((v) => [v[0], v[1]]), [edgeL]), AMP * 0.6);
    let prev = [edgeR[0] * 1.05, edgeR[1]];
    d += `L${f(bottom[0][0])},${f(bottom[0][1])}`;
    prev = bottom[0];
    for (let i = 1; i < bottom.length; i++) {
      const q = bottom[i];
      const mx = (prev[0] + q[0]) / 2, my = (prev[1] + q[1]) / 2;
      const dx = q[0] - prev[0], dy = q[1] - prev[1];
      const len = Math.hypot(dx, dy) || 1;
      const bow = Math.min(5, len * 0.12);
      d += `Q${f(mx - (dy / len) * bow)},${f(my + (dx / len) * bow)} ${f(q[0])},${f(q[1])}`;
      prev = q;
    }
    d += "Z";
    // шығып тұрған шаш шоқтары (силуэтте; негізгі шаштың астында сызылады)
    let tufts = "";
    const HC = HS.color || C.hair;
    for (const [deg, len, w, lean] of HS.tufts ? [[200, 14, 9, -6], [218, 10, 8, -5], [266, 12, 10, 7], [282, 9, 8, 6], [330, 11, 8, 6], [344, 13, 9, 7]] : []) {
      const p = deg * D;
      if (p < pL + 0.08 || p > pR - 0.08) continue;
      const a = outerAt(p - w * D * 0.6), b = outerAt(p + w * D * 0.6);
      const tip = outerAt(p + lean * D, len / 150);
      tufts += shape(`M${f(a[0])},${f(a[1])} Q${f((a[0] + tip[0]) / 2)},${f((a[1] + tip[1]) / 2 - 2)} ${f(tip[0])},${f(tip[1])} Q${f((b[0] + tip[0]) / 2)},${f((b[1] + tip[1]) / 2)} ${f(b[0])},${f(b[1])}Z`, HC, OL - 1);
    }
    let s = tufts + shape(d, HC);
    // 4) шаш талшықтары
    const strands = HS.strands === true ? [
      [-52, -134, -58, -98], [-24, -146, -28, -104], [6, -150, 2, -106], [33, -142, 29, -103], [58, -122, 54, -94],
      [150, -60, 146, 40], [180, -70, 176, 44], [-150, -60, -154, 40], [118, -40, 114, 30], [-120, -40, -124, 30],
    ] : HS.strands || [];
    const lineCol = HS.lineColor || mix(HS.color, "#ffffff", 0.22);
    for (const [list, col, w] of [[strands, lineCol, 3.6], [HS.streak || [], "#c9c3c1", 7]]) {
      for (const [t0, y0, t1, y1] of list) {
        const a = proj(t0, y0, T), b = proj(t1, y1, T);
        if (a.c > 0.18 && b.c > 0.18) {
          const m = proj((t0 + t1) / 2 + 3, (y0 + y1) / 2, T);
          const pts = jit([[a.x, a.y], [m.x, m.y], [b.x, b.y]], AMP * 0.5);
          s += line(smooth(pts, false), w, col);
        }
      }
    }
    return s;
  }
  function mix(a, b, k) {
    const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const A = h(a), B = h(b);
    return "#" + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, "0")).join("");
  }
  // бастың артындағы шаш бөліктері (түйін, құйрық, өрімдер)
  function drawHairBack(T) {
    let s = "";
    const HC = HS.color;
    if (HS.bun) {
      const p = proj(180, -120, T);
      const x = p.x * 0.55, y = -RYU - 18;
      s += shape(smooth(jit([[x - 58, y + 30], [x - 52, y - 30], [x, y - 62], [x + 52, y - 30], [x + 58, y + 30], [x, y + 46]]), true), HC);
      s += line(smooth([[x - 30, y - 22], [x, y - 40], [x + 28, y - 18]], false), 3.4, mix(HC, "#ffffff", 0.22));
    }
    if (HS.pony) {
      const p = proj(180, -40, T);
      const side = Math.sin(T * D) >= 0 ? -1 : 1;
      const x = p.x * 0.9 + side * 30 * Math.abs(Math.sin(T * D));
      s += shape(smooth(jit([[x - 30, -80], [x + 30, -86], [x + 44, 40], [x + 26, 150], [x - 6, 190], [x - 20, 120], [x - 36, 20]]), true), HC);
    }
    if (HS.knot) {
      // орамалдың түйіні мен екі ұшы (желкеде)
      const p = proj(180, 120, T);
      const dir = Math.sin(T * D) >= 0 ? -1 : 1;
      const vis = Math.abs(Math.sin(T * D));
      const x = p.x * 0.7 + dir * 30 * vis, y = 118;
      if (vis > 0.3) {
      s += shape(smooth(jit([[x - 10, y], [x + dir * 36, y + 56], [x + dir * 58, y + 112], [x + dir * 26, y + 106], [x - dir * 4, y + 40]]), true), HC);
      s += shape(smooth(jit([[x + 10, y], [x + dir * 12, y + 70], [x + dir * 2, y + 128], [x - dir * 22, y + 116], [x - dir * 18, y + 40]]), true), HC);
      s += shape(smooth(jit([[x - 26, y - 16], [x + 26, y - 16], [x + 24, y + 18], [x - 24, y + 18]]), true), HC, 6);
      }
    }
    if (HS.pigtails) {
      for (const side of [-1, 1]) {
        const p = proj(side * 98, -60, T);
        const x = (p.c < 0 ? p.x * 0.8 : p.x) + side * 34;
        s += shape(smooth(jit([[x - 22, -70], [x + 22, -74], [x + side * 26 + 14, 30], [x + side * 18, 92], [x + side * 4, 100], [x - 14, 30]]), true), HC);
      }
    }
    return s;
  }
  function drawHairFront(T) {
    let s = "";
    if (HS.bows) {
      // бантиктер — бастан үлкен (Аяулымның белгісі), басының екі жағында
      for (const side of [-1, 1]) {
        const p = proj(side * 80, -100, T);
        if (p.c < -0.75) continue;
        const x = p.x + side * 34 * Math.max(0.3, Math.abs(Math.sin(p.ph * D))), y = -118;
        const loop = (dir, up) => smooth(jit([[x, y], [x + dir * 34, y - 70 * up], [x + dir * 104, y - 74 * up], [x + dir * 116, y - 8 * up], [x + dir * 66, y + 22 * up], [x, y + 4 * up]]), true);
        s += shape(loop(side, 1), "#ffffff") + shape(loop(-side, 0.8), "#ffffff") + shape(loop(side * 0.8, -0.75), "#ffffff");
        s += line(`M${f(x + side * 26)},${f(y - 22)} Q${f(x + side * 60)},${f(y - 50)} ${f(x + side * 92)},${f(y - 40)} M${f(x - side * 22)},${f(y - 18)} Q${f(x - side * 50)},${f(y - 40)} ${f(x - side * 74)},${f(y - 32)}`, 3, "#c9cfdb");
        s += shape(smooth(jit([[x - 18, y - 18], [x + 18, y - 18], [x + 20, y + 16], [x - 20, y + 16]]), true), "#ffffff", 6);
      }
    }
    return s;
  }

  // ---------- орамал / тақия / әжім / сақал ----------
  function drawPeek(T) {
    // орамалдың астынан көрінетін шаш (маңдайда)
    const top = [], bot = [];
    for (let a = -48; a <= 48; a += 8) {
      const p = proj(a, 0, T);
      if (p.c < 0.1) continue;
      const y = hairlineY(a);
      const x = rAt(y) * Math.sin(p.ph * D);
      top.push([x, y - 6]);
      bot.push([x, y + 10 - Math.abs(a) * 0.08]);
    }
    if (top.length < 3) return "";
    return shape(smooth(jit(top.concat(bot.reverse()), AMP * 0.5), true, 1 / 8), HS.peek, 4);
  }
  function drawDots(T) {
    let s = "";
    for (let y = -132; y <= 120; y += 36) for (let a = -170; a <= 180; a += 26) {
      const aa = wrap(a + (Math.round(y / 36) % 2 ? 13 : 0));
      if (y > hairlineY(aa) - 12) continue;
      const p = proj(aa, y, T);
      if (p.c < 0.22) continue;
      const k = 1.06 + 0.06 * Math.max(0, -y / 150);
      s += '<circle cx="' + f(p.x * k) + '" cy="' + f(y * (y < 0 ? 1.04 : 1)) + '" r="' + f(6 * Math.pow(p.c, 0.5)) + '" fill="' + HS.dots + '"/>';
    }
    return s;
  }
  function drawCap(T) {
    const cp = HS.cap, yb = -108, xw = rAt(yb) * 1.1;
    let s = shape(smooth(jit([[-xw, yb + 4], [-xw * 0.96, yb - 40], [-xw * 0.62, -172], [0, -184], [xw * 0.62, -172], [xw * 0.96, yb - 40], [xw, yb + 4], [0, yb + 12]]), true, 1 / 7), cp.color);
    // кесте: жиектегі зигзаг + маңдайдағы «қошқар мүйіз»
    let z = "";
    for (let i = 0; i <= 10; i++) { const u = -1 + i / 5; z += (i ? "L" : "M") + f(u * xw * 0.9) + "," + f(yb - 6 + (i % 2 ? -10 : 0) - Math.abs(u) * 3); }
    s += line(z, 3.2, cp.orn);
    const p = proj(0, -140, T);
    if (p.c > 0.2) {
      const x = p.x * 0.9, y = -146;
      const X = (d) => f(x + d);
      s += line("M" + X(0) + "," + (y + 16) + " L" + X(0) + "," + (y - 4) + " M" + X(0) + "," + (y - 4) + " Q" + X(-4) + "," + (y - 22) + " " + X(-18) + "," + (y - 18) + " Q" + X(-28) + "," + (y - 10) + " " + X(-18) + "," + (y - 2) + " M" + X(0) + "," + (y - 4) + " Q" + X(4) + "," + (y - 22) + " " + X(18) + "," + (y - 18) + " Q" + X(28) + "," + (y - 10) + " " + X(18) + "," + (y - 2), 3.4, cp.orn);
    }
    return s;
  }
  function drawWrinkles(T) {
    let s = "";
    for (const side of [-1, 1]) {
      const o = proj(side * 45, -2, T);
      if (o.c > 0.15) s += line("M" + f(o.x) + "," + f(o.y - 10) + " l" + f(side * 14) + ",-6 M" + f(o.x + side * 2) + "," + f(o.y + 4) + " l" + f(side * 15) + ",2", 3.4, INK, ' opacity="0.75"');
      const a = proj(side * 15, 44, T), b = proj(side * 30, 86, T);
      if (a.c > 0.2 && b.c > 0.2) s += line("M" + f(a.x) + "," + f(a.y) + " Q" + f((a.x + b.x) / 2 + side * 10) + "," + f((a.y + b.y) / 2) + " " + f(b.x) + "," + f(b.y), 3.4, INK, ' opacity="0.7"');
      const u = proj(side * 20, 46, T);
      if (u.c > 0.2) s += line("M" + f(u.x - 16) + "," + f(u.y) + " Q" + f(u.x) + "," + f(u.y + 8) + " " + f(u.x + 16) + "," + f(u.y), 3, INK, ' opacity="0.55"');
    }
    return s;
  }
  function drawBeard(T) {
    // қысқа ақ сақал: бастың төменгі контуры бойымен (беттің ортасына қарай), ауыздың астында ойық
    const m = proj(0, 98, T);
    const sx = 0.55 + 0.45 * Math.max(0, m.c);
    const mx = clamp(m.x, -rAt(98) + 30, rAt(98) - 30);
    const outer = [];
    for (let k = 12; k <= 168; k += 6) {
      const ph = k * D, sn = Math.sin(ph);
      const x = R * Math.cos(ph) * (1 - 0.075 * sn * sn), y = RYD * sn;
      if (y < 78 || Math.abs(x - mx) > 104 * sx) continue;
      outer.push([x * 1.03, y * 1.03 + 12 * Math.pow(sn, 8)]);
    }
    if (outer.length < 3) return "";
    outer.sort((p, q) => q[0] - p[0]);
    const L = outer[outer.length - 1], Rr = outer[0];
    const inner = [[lerp(L[0], mx, 0.3), 100], [mx - 24 * sx, 110], [mx, 116], [mx + 24 * sx, 110], [lerp(Rr[0], mx, 0.3), 100]];
    const d = smooth(jit(outer.concat(inner)), true, 1 / 7);
    return shape(d, HS.color, 5) + line("M" + f(mx - 26 * sx) + ",138 q6,12 0,22 M" + f(mx + 22 * sx) + ",136 q6,12 0,22 M" + f(mx - 2) + ",150 q4,10 0,16", 3, HS.lineColor || "#b4b4bd");
  }

  // ---------- құлақ ----------
  function drawEar(side, T, front) {
    if (HS.coverEars) return "";
    const p = proj(side * 90, 6, T);
    if (p.c < -0.3) return "";
    const onFace = p.c > 0.25;
    if (front !== onFace) return "";
    const w = onFace ? 14 + 12 * (1 - p.c) : 26;
    const x = onFace ? p.x * 0.95 : Math.sign(p.x || side) * (R + 5);
    const dir = onFace ? -Math.sign(Math.sin(p.ph * D) || side) : Math.sign(p.x || side);
    const pts = jit([[0, -22], [w * 0.7, -24], [w, -8], [w * 0.85, 12], [w * 0.35, 24], [0, 20]].map((q) => [x + dir * q[0], 6 + q[1]]));
    let s = shape(smooth(pts, true), C.skin, onFace ? FL + 1 : OL);
    s += line(smooth([[x + dir * w * 0.25, -8], [x + dir * w * 0.6, -6], [x + dir * w * 0.45, 10]], false), 3.2);
    return s;
  }

  // ---------- көз ----------
  function drawEye(side, T, e) {
    const p = proj(side * 20, 2, T);
    if (p.c < 0.12) return "";
    const sx = Math.pow(p.c, 0.6);
    const sc = e.scale;
    const rx = 48 * sc * sx, ry = 38 * sc;
    let cx = p.x;
    const lim = R + 4 - rx;
    cx = clamp(cx, -lim, lim);
    const cy = 2 + jn(0.6);
    const top = cy - ry, h = 2 * ry;
    const lt = clamp(e.lidTop + (e.lidTop > 0.9 ? 0 : LK.lid || 0), 0, 1), lb = clamp(e.lidBot, 0, 1);
    const closed = lt + lb >= 0.97;
    const inner = -side; // ішкі ұшы (мұрынға қарай) — экранда
    let s = "";
    if (closed) {
      const yl = top + h * clamp(lt / (lt + lb), 0, 1);
      if (e.happy > 0.5) {
        s += line(`M${f(cx - rx)},${f(yl + 8)} Q${f(cx)},${f(yl - 22)} ${f(cx + rx)},${f(yl + 8)}`, 6.5);
      } else {
        s += line(`M${f(cx - rx)},${f(yl - 2)} Q${f(cx)},${f(yl + 9)} ${f(cx + rx)},${f(yl - 2)}`, 6);
      }
      return s;
    }
    const id = uid("eye");
    const ell = `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"`;
    s += `<clipPath id="${id}">${ell}/></clipPath>`;
    s += `${ell} fill="#fff"/>`;
    s += `<g clip-path="url(#${id})">`;
    // қарашық
    const pr = 7.5 * e.pupil * Math.max(0.75, sc * 0.9);
    const ppx = cx + e.px * (rx - pr - 6) + (sx < 0.9 ? Math.sign(p.x) * (1 - sx) * rx * 0.35 : 0);
    const ppy = cy + e.py * (ry - pr - 6);
    s += `<circle cx="${f(ppx)}" cy="${f(ppy)}" r="${f(Math.max(3, pr * Math.min(1, sx + 0.25)))}" fill="${INK}"/>`;
    // жоғарғы қабақ (еңкіш: lidTilt>0 — ішкі ұшы төмен, ашулы)
    if (lt > 0.02) {
      const yl = top + h * lt;
      const tl = e.lidTilt * 10;
      const yA = yl + (inner < 0 ? tl : -tl); // сол жақ шеті
      const yB = yl + (inner < 0 ? -tl : tl);
      const x0 = cx - rx - 4, x1 = cx + rx + 4;
      s += `<path d="M${f(x0)},${f(top - 30)}L${f(x1)},${f(top - 30)}L${f(x1)},${f(yB)}L${f(x0)},${f(yA)}Z" fill="${C.skin}"/>`;
      s += line(`M${f(x0)},${f(yA)}L${f(x1)},${f(yB)}`, 6);
    }
    if (lb > 0.02) {
      const yl = top + h * (1 - lb);
      const x0 = cx - rx - 4, x1 = cx + rx + 4;
      s += `<path d="M${f(x0)},${f(yl + 4)}Q${f(cx)},${f(yl - 6)} ${f(x1)},${f(yl + 4)}L${f(x1)},${f(top + h + 30)}L${f(x0)},${f(top + h + 30)}Z" fill="${C.skin}"/>`;
      s += line(`M${f(x0)},${f(yl + 4)}Q${f(cx)},${f(yl - 6)} ${f(x1)},${f(yl + 4)}`, 4);
    }
    s += `</g>`;
    s += `${ell} fill="none" stroke="${INK}" stroke-width="${FL}"/>`;
    if (LK.lashes && lt < 0.85) {
      // кірпіктер — сыртқы бұрышта
      const outer = side;
      const yl = top + h * lt;
      const x0 = cx + outer * rx * 0.86, y0 = Math.max(yl, cy - ry * 0.55);
      s += line(`M${f(x0)},${f(y0)} l${f(outer * 16)},${f(-10)} M${f(x0 - outer * 8)},${f(y0 - 6)} l${f(outer * 12)},${f(-14)}`, 4.2);
    }
    return s;
  }
  // көзілдірік, мұрт
  function drawGlasses(T) {
    let s = "";
    const pts = [];
    for (const side of [-1, 1]) {
      const p = proj(side * 20, 2, T);
      if (p.c < 0.12) continue;
      const sx = Math.pow(p.c, 0.6);
      const w = 58 * sx, h = 46;
      const cx = clamp(p.x, -(R + 10 - w), R + 10 - w);
      pts.push([cx, w]);
      s += `<rect x="${f(cx - w)}" y="${f(2 - h)}" width="${f(2 * w)}" height="${f(2 * h)}" rx="${f(20 * sx)}" fill="#dfeaf3" fill-opacity="0.18" stroke="${INK}" stroke-width="5.5"/>`;
      s += line(`M${f(cx - w * 0.5)},${f(-28)} l${f(w * 0.3)},${f(-8)}`, 3.4, "#ffffff");
    }
    if (pts.length === 2) s += line(`M${f(pts[0][0] + pts[0][1])},${f(-6)} Q${f((pts[0][0] + pts[1][0]) / 2)},${f(-16)} ${f(pts[1][0] - pts[1][1])},${f(-6)}`, 5);
    return s;
  }
  function drawMustache(T) {
    const p = proj(0, 50, T);
    if (p.c < -0.1) return "";
    const sx = 0.45 + 0.55 * Math.max(0, p.c);
    const x = clamp(p.x, -rAt(50) + 40, rAt(50) - 40);
    const d = smooth(jit([[-44, 6], [-30, -10], [-6, -12], [0, -6], [6, -12], [30, -10], [44, 6], [22, 2], [0, 6], [-22, 2]]), true);
    return `<g transform="translate(${f(x)},${f(p.y)}) scale(${f(sx)},1)">` + shape(d, HS.color, 4.5) + `</g>`;
  }

  // ---------- қас (Артурдың белгісі: жуан, түзу) ----------
  function drawBrow(side, T, b) {
    const lift = b.lift + (side < 0 ? b.liftL : b.liftR);
    const p = proj(side * 21, -50 - lift, T);
    if (p.c < 0.12) return "";
    const sx = Math.pow(p.c, 0.6);
    const len = 66 * sx;
    const inner = -side; // экрандағы ішкі бағыт (θ=0 жаққа)
    // негізгі көлбеу: сыртқы ұшы 7px жоғары; angle>0 — ішкі ұшы төмен
    const ang = (b.angle + 6) * D;
    const cx = p.x, cy = p.y;
    const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
    // ішкі ұшы
    const xi = cx + inner * dx, yi = cy + dy;
    const xo = cx - inner * dx, yo = cy - dy;
    const bc = LK.browColor || (LK.brow === "thick" ? C.brow : mix(HS.color, "#000000", 0.25));
    if (LK.brow === "thin") {
      // жіңішке доға қас
      const pts = jit([[xi, yi + 2], [cx, cy - 8], [xo, yo + 3]], AMP * 0.5);
      const d = smooth(pts, false);
      return line(d, 15, "#fff") + line(d, 7, bc);
    }
    const ti = LK.brow === "thick2" ? 13 : 17, to = LK.brow === "thick2" ? 8 : 10;
    const pts = jit([[xi, yi - ti / 2], [cx, cy - (ti + to) / 4 - 1.5], [xo, yo - to / 2], [xo - inner * 2, yo + to / 2], [cx, cy + (ti + to) / 4], [xi, yi + ti / 2]], AMP * 0.5);
    const d = smooth(pts, true, 1 / 8);
    // ақ жиек: қас қара шаштың үстіне шыққанда да көрінеді
    return `<path d="${d}" fill="#fff" stroke="#fff" stroke-width="9" stroke-linejoin="round"/><path d="${d}" fill="${bc}" stroke="${bc}" stroke-width="2" stroke-linejoin="round"/>`;
  }

  // ---------- ауыз ----------
  function mouthSVG(kind) {
    const dark = (d, extras) => {
      const id = uid("m");
      return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${C.mouth}"/><g clip-path="url(#${id})">${extras || ""}</g>` + line(d, FL);
    };
    const teethTop = (y) => `<rect x="-40" y="-40" width="80" height="${40 + y}" fill="${C.teeth}"/>`;
    const tongue = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.tongue}"/>`;
    switch (kind) {
      case "mbp": return line("M-17,1 Q0,-3 17,1", 6);
      case "smile": return line("M-25,-7 Q0,17 25,-7", 5.2);
      case "smirk": return line("M-17,5 Q5,7 22,-9", 5.2);
      case "hmm": return line("M-12,3 L13,-1", 5);
      case "frown": return line("M-21,9 Q0,-7 21,9", 5.2);
      case "wavy": return line("M-24,3 q6,-7 12,0 t12,0 t12,0 t12,0", 4.8);
      case "aa": return dark("M-21,-9 Q0,-13 21,-9 Q23,24 0,31 Q-23,24 -21,-9Z", teethTop(-3) + tongue(0, 25, 13, 8));
      case "ee": return dark("M-27,-7 Q0,-10 27,-7 Q23,12 0,14 Q-23,12 -27,-7Z", teethTop(1) + tongue(0, 13, 10, 5));
      case "oh": return dark("M0,-12 Q16,-12 16,6 Q16,24 0,24 Q-16,24 -16,6 Q-16,-12 0,-12Z", tongue(0, 20, 8, 5));
      case "uu": return dark("M0,-6 Q10,-6 10,4 Q10,14 0,14 Q-10,14 -10,4 Q-10,-6 0,-6Z", "");
      case "ff": return dark("M-19,-2 Q0,-5 19,-2 Q15,9 0,10 Q-15,9 -19,-2Z", teethTop(4)) + line("M-14,13 Q0,17 14,13", 3.4);
      case "laugh": return dark("M-31,-9 Q0,-13 31,-9 Q27,30 0,37 Q-27,30 -31,-9Z", teethTop(-1) + tongue(0, 32, 16, 10));
      case "shock": return dark("M-30,0 Q-23,-11 -15,-2 Q-7,6 0,-4 Q7,-12 15,-2 Q23,6 30,-2 Q29,32 0,38 Q-29,32 -30,0Z", tongue(0, 32, 13, 8));
      case "growl": {
        const d = "M-27,-9 L27,-9 Q30,4 25,12 L-25,12 Q-30,4 -27,-9Z";
        return `<path d="${d}" fill="${C.teeth}"/>` + line("M-27,1.5 L27,1.5", 3) + line("M-13,-9 L-13,12 M0,-9 L0,12 M13,-9 L13,12", 2.6) + line(d, FL);
      }
      default: return line("M-15,0 Q0,4 15,-1", 4.6) + line("M-6,10 Q0,12 6,10", 3);
    }
  }
  function drawMouth(T, kind) {
    const p = proj(0, 72, T);
    if (p.c < -0.2) return "";
    const sx = 0.5 + 0.5 * Math.max(0, p.c);
    const lim = rAt(72) - 26 * sx;
    const x = clamp(p.x, -lim, lim);
    return `<g transform="translate(${f(x + jn(0.5))},${f(p.y + jn(0.5))}) scale(${f(sx * 100) / 100},1)">${mouthSVG(kind)}</g>`;
  }

  // ---------- эффектілер ----------
  function drawFx(T, fx) {
    let s = "";
    const facing = Math.sin(T * D) >= 0 ? 1 : -1;
    if (fx.sweat > 0.01) {
      const k = fx.sweat;
      const x = -facing * (R + 18), y = -54;
      s += `<g transform="translate(${f(x)},${f(y)}) scale(${f(k)})">` + shape("M0,-24 Q15,0 10,13 Q0,22 -10,13 Q-15,0 0,-24Z", C.sweat, 4) + line("M-3,4 Q-4,10 0,12", 3, "#fff") + `</g>`;
    }
    if (fx.blush > 0.01) {
      for (const side of [-1, 1]) {
        const p = proj(side * 44, 40, T);
        if (p.c < 0.25) continue;
        let d = "";
        for (let i = -1; i <= 1; i++) d += `M${f(p.x + i * 11 - 5)},${f(p.y + 8)} L${f(p.x + i * 11 + 5)},${f(p.y - 8)}`;
        s += line(d, 3.4, C.blush, ` opacity="${f(fx.blush)}"`);
      }
    }
    if (fx.vein > 0.01) {
      const x = facing * 70, y = -118;
      s += `<g transform="translate(${x},${y}) scale(${f(fx.vein)})">` +
        line("M-14,-4 Q-4,-4 -4,-14 M4,-14 Q4,-4 14,-4 M14,4 Q4,4 4,14 M-4,14 Q-4,4 -14,4", 6, C.vein) + `</g>`;
    }
    return s;
  }

  // ---------- қол ----------
  function handSVG(kind, w) {
    // жергілікті: білезік (0,0), саусақтар +y бағытында, бас бармақ −x жақта
    const caps = []; // [x0,y0,x1,y1,width]
    if (kind === "fist") {
      caps.push([0, 18, 0, 24, 44]);
      caps.push([-17, 12, -22, 26, 15]);
    } else if (kind === "point") {
      caps.push([0, 18, 0, 22, 42]);
      caps.push([-17, 12, -22, 26, 15]);
      caps.push([6, 30, 8, 66, 14]);
    } else if (kind === "open") {
      caps.push([0, 14, 0, 26, 40]);
      const fing = [[-14, 70], [-4, 76], [7, 74], [17, 64]];
      for (const [fx, ln] of fing) caps.push([fx * 0.7, 30, fx * 1.25, ln, 13]);
      caps.push([-17, 14, -38, 28, 14]);
    } else {
      // rest — бос салбыраған қол (саусақтары бірге, «қолғап» пішіні)
      caps.push([0, 12, 1, 26, 36]);
      caps.push([2, 26, 3, 42, 30]);
      caps.push([-15, 12, -21, 28, 12]);
    }
    let s = "";
    for (const c of caps) s += line(`M${c[0]},${c[1]} L${c[2]},${c[3]}`, c[4] + 2 * 4.5, INK);
    for (const c of caps) s += line(`M${c[0]},${c[1]} L${c[2]},${c[3]}`, c[4], C.skin);
    if (kind === "fist") s += line("M-6,30 Q2,34 12,28 M-8,20 Q0,24 12,18", 2.8);
    if (kind === "point") s += line("M-8,24 Q0,28 10,24", 2.8);
    if (kind === "rest") s += line("M-4,40 L-4,48 M7,40 L7,47", 2.6);
    return s;
  }

  function drawArm(side, T, arm, shoulder, outfit, behind) {
    const s0 = side; // экрандағы жақ: −1 сол, +1 оң
    const a = arm.sh * D, b = (arm.sh + arm.el) * D;
    const L1 = 152, L2 = 140;
    const sh = shoulder;
    const el = [sh[0] + s0 * Math.sin(a) * L1, sh[1] + Math.cos(a) * L1];
    const wr = [el[0] + s0 * Math.sin(b) * L2, el[1] + Math.cos(b) * L2];
    const midU = [lerp(sh[0], el[0], 0.5), lerp(sh[1], el[1], 0.5)];
    const midF = [lerp(el[0], wr[0], 0.5), lerp(el[1], wr[1], 0.5)];
    let s = "";
    let sleeve = outfit === "casual" ? C.skin : C.blazer;
    const pts = jit([sh, midU, el, midF, wr], AMP * 0.6);
    const AW = (LK.body && LK.body.arm) || 46;
    if (OF && !OF.base) {
      sleeve = OF.top;
      if (OF.sleeve === "short") {
        s += tube(pts, AW - 6, C.skin);
        const k = 0.5, cuff = [lerp(sh[0], el[0], k), lerp(sh[1], el[1], k)];
        s += tube(jit([sh, [lerp(sh[0], cuff[0], 0.5), lerp(sh[1], cuff[1], 0.5)], cuff]), AW, OF.top);
      } else {
        s += tube(pts, AW, OF.top);
        if (OF.collar === "shirt") {
          const dir = [(wr[0] - el[0]) / L2, (wr[1] - el[1]) / L2];
          const c0 = [wr[0] - dir[0] * 12, wr[1] - dir[1] * 12], nx = -dir[1], ny = dir[0];
          s += line(`M${f(c0[0] - nx * AW * 0.5)},${f(c0[1] - ny * AW * 0.5)} L${f(c0[0] + nx * AW * 0.5)},${f(c0[1] + ny * AW * 0.5)}`, 3.4);
        }
      }
    } else if (outfit === "casual") {
      s += tube(pts, 40, C.skin);
      // қысқа жең: иықтан шынтаққа дейінгі 55%
      const k = 0.55;
      const cuff = [lerp(sh[0], el[0], k), lerp(sh[1], el[1], k)];
      s += tube(jit([sh, [lerp(sh[0], cuff[0], 0.5), lerp(sh[1], cuff[1], 0.5)], cuff]), 46, C.skin);
      const nx = -(el[1] - sh[1]) / L1, ny = (el[0] - sh[0]) / L1;
      s += line(`M${f(cuff[0] - nx * 25)},${f(cuff[1] - ny * 25)} L${f(cuff[0] + nx * 25)},${f(cuff[1] + ny * 25)}`, 3);
    } else {
      s += tube(pts, 46, sleeve);
      // жейденің ақ жеңі (манжет)
      const dir = [(wr[0] - el[0]) / L2, (wr[1] - el[1]) / L2];
      const c0 = [wr[0] - dir[0] * 16, wr[1] - dir[1] * 16];
      s += tube([c0, [wr[0] - dir[0] * 4, wr[1] - dir[1] * 4]], 40, "#fff", 4);
      const nx = -dir[1], ny = dir[0];
      s += line(`M${f(c0[0] - nx * 23)},${f(c0[1] - ny * 23)} L${f(c0[0] + nx * 23)},${f(c0[1] + ny * 23)}`, 4);
    }
    const ang = Math.atan2(-(wr[0] - el[0]), wr[1] - el[1]) / D; // білезік бағыты (төмен = 0)
    // қолдағы зат (prop): білезіктің жергілікті координаттарында, саусақтар +y бағытында, айнасыз
    if (arm.prop) s += `<g transform="translate(${f(wr[0])},${f(wr[1])}) rotate(${f(ang)})">${arm.prop}</g>`;
    s += `<g transform="translate(${f(wr[0])},${f(wr[1])}) rotate(${f(ang)}) scale(${s0},1)">${handSVG(arm.hand || "rest")}</g>`;
    if (arm.propFront) s += `<g transform="translate(${f(wr[0])},${f(wr[1])}) rotate(${f(ang)})">${arm.propFront}</g>`;
    return { svg: s, wrist: wr, elbow: el, shoulder: sh, sleeve, w: AW };
  }

  // ---------- аяқ ----------
  function drawLeg(side, T, leg, hip, outfit) {
    const a = leg.a * D, k = (leg.k || 0) * D;
    const L1 = 190, L2 = 180;
    const kn = [hip[0] + side * Math.sin(a) * L1 + Math.sin(k) * 40 * Math.sign(Math.sin(T * D) || 1), hip[1] + Math.cos(a) * L1 * Math.cos(k * 0.5)];
    const an = [kn[0] + side * Math.sin(a) * L2 - Math.sin(k) * 30 * Math.sign(Math.sin(T * D) || 1), kn[1] + Math.cos(a) * L2];
    const col = OF && !OF.base ? OF.legs : outfit === "casual" ? C.chinos : C.trousers;
    let s = tube(jit([hip, kn, an], AMP * 0.5), (LK.body && LK.body.leg) || 58, col);
    // табан: алдынан — сыртқа қарай сәл бұрылған, бүйірден — алға
    const fwd = Math.sin(T * D);
    const fc = Math.abs(fwd);
    const fx = an[0] + side * 10 * (1 - fc) + fwd * 30;
    const fy = an[1] + 26;
    const rx = 40 + 18 * fc, ry = 22;
    const shoe = OF && !OF.base ? OF.shoes : outfit === "casual" ? C.sneaker : C.shoes;
    const pts = jit([[fx - rx, fy + 6], [fx - rx + 6, fy - ry + 4], [fx, fy - ry - 2], [fx + rx - 6, fy - ry + 6], [fx + rx, fy + 6], [fx, fy + ry * 0.55]]);
    s += shape(smooth(pts, true), shoe);
    if (outfit === "casual") s += line(`M${f(fx - rx + 6)},${f(fy + 6)} L${f(fx + rx - 6)},${f(fy + 6)}`, 3, "#9a9aa3");
    return s;
  }

  // ---------- кеуде + киім ----------
  function torsoPts(T) {
    const k = (0.62 + 0.38 * Math.abs(Math.cos(T * D))) * ((LK.body && LK.body.w) || 1);
    const hw = 90 * k, hb = 86 * k;
    return [
      [-hw + 26, -660], [-hw + 4, -644], [-hw - 2, -604], [-hw + 1, -500], [-hb, -430], [-hb + 4, -392], [-hb + 18, -380],
      [hb - 18, -380], [hb - 4, -392], [hb, -430], [hw - 1, -500], [hw + 2, -604], [hw - 4, -644], [hw - 26, -660], [0, -666],
    ];
  }
  function drawTorso(T, outfit) {
    const pts = jit(torsoPts(T));
    const d = smooth(pts, true, 1 / 7);
    const id = uid("torso");
    const c = Math.cos(T * D), sn = Math.sin(T * D);
    const fx = 100 * sn * 0.82; // алдыңғы орта сызық
    const vis = c > 0.06;
    const sq = Math.max(0.15, c); // алдыңғы бөлшектердің сығылуы
    const X = (x) => fx + x * sq;
    let inner = "";
    if (OF && !OF.base) {
      const kk = (0.62 + 0.38 * Math.abs(c)) * ((LK.body && LK.body.w) || 1);
      inner += `<path d="${d}" fill="${OF.top}"/>`;
      inner += `<path d="M${f(100 * kk - 30)},-650 Q${f(100 * kk - 12)},-520 ${f(94 * kk - 22)},-385 L240,-385 L240,-670Z" fill="${OF.shade}"/>`;
      if (vis) {
        if (OF.collar === "v") {
          inner += `<path d="M${f(X(-34))},-668 L${f(X(34))},-668 L${f(X(0))},-560 Z" fill="${OF.under}"/>`;
          inner += line(`M${f(X(-34))},-668 L${f(X(0))},-560 L${f(X(34))},-668`, 3.6);
          if (OF.buttons) for (const y of [-536, -500, -464]) inner += `<circle cx="${f(X(0))}" cy="${y}" r="4.4" fill="${INK}"/>`;
          if (OF.belt) inner += `<path d="M-200,-470 L200,-470 L200,-448 L-200,-448Z" fill="${OF.belt}"/>` + line(`M-200,-470 L200,-470 M-200,-448 L200,-448`, 3);
        } else if (OF.collar === "shirt") {
          inner += shape(`M${f(X(-2))},-662 L${f(X(-34))},-668 L${f(X(-24))},-628 Z`, OF.top, 3.4);
          inner += shape(`M${f(X(2))},-662 L${f(X(34))},-668 L${f(X(24))},-628 Z`, OF.top, 3.4);
          inner += line(`M${f(X(0))},-660 L${f(X(0))},-400`, 3);
          for (const y of [-610, -560, -510, -460]) inner += `<circle cx="${f(X(7))}" cy="${y}" r="4" fill="${INK}"/>`;
          inner += line(`M${f(X(-50))},-600 L${f(X(-20))},-600 L${f(X(-20))},-570 L${f(X(-50))},-570Z`, 3);
        } else if (OF.collar === "peter") {
          inner += shape(`M${f(X(0))},-662 Q${f(X(-46))},-668 ${f(X(-46))},-640 Q${f(X(-30))},-614 ${f(X(0))},-630Z`, "#ffffff", 3.4);
          inner += shape(`M${f(X(0))},-662 Q${f(X(46))},-668 ${f(X(46))},-640 Q${f(X(30))},-614 ${f(X(0))},-630Z`, "#ffffff", 3.4);
        } else {
          inner += line(`M${f(X(-30))},-664 Q${f(X(0))},-636 ${f(X(30))},-664`, 3.6);
          if (OF.brooch) inner += shape(`M${f(X(-44))},-600 l10,-10 l10,10 l-10,10Z`, C.gold, 3);
        }
        if (OF.apron) {
          // ақ алжапқыш (бірінші сынып формасы)
          inner += shape(`M${f(X(-40))},-626 L${f(X(40))},-626 L${f(X(46))},-430 L${f(X(-46))},-430Z`, "#ffffff", 3.6);
          inner += shape(`M${f(X(-40))},-626 Q${f(X(-60))},-650 ${f(X(-70))},-664 L${f(X(-56))},-668 Q${f(X(-44))},-648 ${f(X(-30))},-626Z`, "#ffffff", 3);
          inner += shape(`M${f(X(40))},-626 Q${f(X(60))},-650 ${f(X(70))},-664 L${f(X(56))},-668 Q${f(X(44))},-648 ${f(X(30))},-626Z`, "#ffffff", 3);
          inner += line(`M${f(X(-40))},-626 q8,-10 16,0 t16,0 t16,0 t16,0 t16,0`, 2.6, "#c9cfdb");
        }
      }
    } else if (outfit === "casual") {
      inner += `<path d="${d}" fill="#fff"/>`;
      if (vis) {
        // поло: түймелі планка + жаға
        inner += line(`M${f(X(0))},${f(-650)} L${f(X(0))},${f(-560)}`, 3.4);
        inner += line(`M${f(X(14))},${f(-650)} L${f(X(14))},${f(-560)} L${f(X(0))},${f(-560)}`, 3);
        inner += `<circle cx="${f(X(7))}" cy="-628" r="3.6" fill="${INK}"/><circle cx="${f(X(7))}" cy="-596" r="3.6" fill="${INK}"/>`;
      }
      // көлеңке (оң жақ шеті)
      inner += `<path d="M${f(100 * 0.9 * (0.62 + 0.38 * Math.abs(c)) - 22)},-640 Q${f(100 * (0.62 + 0.38 * Math.abs(c)) - 6)},-520 ${f(94 * (0.62 + 0.38 * Math.abs(c)) - 16)},-390 L200,-390 L200,-660Z" fill="#eceef3"/>`;
      inner += line(`M-120,-408 Q0,-400 120,-408`, 0.001);
    } else {
      inner += `<path d="${d}" fill="${C.blazer}"/>`;
      const kk = 0.62 + 0.38 * Math.abs(c);
      inner += `<path d="M${f(100 * kk - 30)},-650 Q${f(100 * kk - 12)},-520 ${f(94 * kk - 22)},-385 L220,-385 L220,-670Z" fill="${C.blazerShade}"/>`;
      if (vis) {
        // ақ жейде (V), галстук, лацкандар, түймелер
        const vB = -528;
        inner += `<path d="M${f(X(-40))},-668 L${f(X(40))},-668 L${f(X(0))},${vB} Z" fill="#fff"/>`;
        inner += `<path d="M${f(X(-9))},-650 L${f(X(9))},-650 L${f(X(6))},-636 L${f(X(-6))},-636Z" fill="${C.tie}"/>`;
        inner += `<path d="M${f(X(-6))},-636 L${f(X(6))},-636 L${f(X(10))},-500 L${f(X(0))},-488 L${f(X(-10))},-500Z" fill="${C.tie}" stroke="${C.tie}" stroke-width="1"/>`;
        // жаға
        inner += shape(`M${f(X(-2))},-662 L${f(X(-30))},-664 L${f(X(-20))},-640 Z`, "#fff", 3.2);
        inner += shape(`M${f(X(2))},-662 L${f(X(30))},-664 L${f(X(20))},-640 Z`, "#fff", 3.2);
        // лацкан сызықтары
        inner += line(`M${f(X(-42))},-664 L${f(X(-24))},-604 L${f(X(-34))},-596 L${f(X(0))},${vB} M${f(X(42))},-664 L${f(X(24))},-604 L${f(X(34))},-596 L${f(X(0))},${vB}`, 3.4, "#141418");
        inner += line(`M${f(X(0))},${vB} L${f(X(0))},-430 M${f(X(0))},-430 L${f(X(-14))},-382 M${f(X(0))},-430 L${f(X(14))},-382`, 3.2);
        inner += `<circle cx="${f(X(6))}" cy="-500" r="4.6" fill="${INK}"/><circle cx="${f(X(6))}" cy="-452" r="4.6" fill="${INK}"/>`;
        // қалталар
        inner += line(`M${f(X(-74))},-452 L${f(X(-40))},-450 M${f(X(40))},-450 L${f(X(74))},-452 M${f(X(44))},-580 L${f(X(72))},-582`, 3.2);
      } else {
        inner += line(`M0,-650 L0,-392`, 3.2, "#1d1e25");
      }
      if (outfit === "grad" && vis) {
        // түлек лентасы: кейіпкердің оң иығынан (экранда сол) сол жамбасқа
        const a0 = 100 * Math.sin((-58 + T) * D) * 0.95, a1 = 96 * Math.sin((58 + T) * D) * 0.95;
        const p0 = [a0 - 4, -664], p1 = [a0 + 40, -664], p2 = [a1 + 30, -380], p3 = [a1 - 14, -380];
        const band = `M${f(p0[0])},${p0[1]} L${f(p1[0])},${p1[1]} L${f(p2[0])},${p2[1]} L${f(p3[0])},${p3[1]}Z`;
        inner += `<path d="${band}" fill="${C.sash}"/>`;
        const e0 = (u) => [lerp(p0[0], p3[0], u), lerp(p0[1], p3[1], u)], e1 = (u) => [lerp(p1[0], p2[0], u), lerp(p1[1], p2[1], u)];
        const g = (A, B, k) => [lerp(A[0], B[0], k), lerp(A[1], B[1], k)];
        const l1a = g(e0(0), e1(0), 0.14), l1b = g(e0(1), e1(1), 0.14), l2a = g(e0(0), e1(0), 0.86), l2b = g(e0(1), e1(1), 0.86);
        inner += line(`M${f(l1a[0])},${f(l1a[1])} L${f(l1b[0])},${f(l1b[1])} M${f(l2a[0])},${f(l2a[1])} L${f(l2b[0])},${f(l2b[1])}`, 3.2, C.sashEdge);
        // жазу орнына жылтыр штрихтар
        for (let i = 0; i < 5; i++) {
          const u = 0.2 + i * 0.14;
          const A = g(e0(u), e1(u), 0.32), B = g(e0(u + 0.07), e1(u + 0.07), 0.68);
          inner += line(`M${f(A[0])},${f(A[1])} L${f(B[0])},${f(B[1])}`, 3, C.sashEdge, ' opacity="0.75"');
        }
        inner += line(band, 3.4);
        // күміс погон + шынжырлар (кейіпкердің оң иығы)
        const ex = a0 + 8;
        inner += shape(`M${f(ex - 30)},-668 L${f(ex + 34)},-664 L${f(ex + 30)},-646 L${f(ex - 32)},-650Z`, C.silver, 3);
        inner += line(`M${f(ex - 30)},-648 Q${f(ex - 26)},-610 ${f(ex - 2)},-602 M${f(ex - 30)},-648 Q${f(ex - 30)},-596 ${f(ex - 6)},-584 M${f(ex - 30)},-648 Q${f(ex - 34)},-584 ${f(ex - 12)},-568`, 3, C.silver);
        // қоңырау бантигі (кейіпкердің сол кеудесі)
        const bx = X(56), by = -566;
        inner += shape(`M${f(bx)},${by} L${f(bx - 22)},${by - 12} L${f(bx - 22)},${by + 12}Z`, "#fff", 3) + shape(`M${f(bx)},${by} L${f(bx + 22)},${by - 12} L${f(bx + 22)},${by + 12}Z`, "#fff", 3);
        inner += line(`M${f(bx - 18)},${by - 4} L${f(bx - 6)},${by} M${f(bx + 18)},${by - 4} L${f(bx + 6)},${by}`, 2.6, C.sash);
        inner += shape(`M${f(bx - 7)},${by + 16} Q${f(bx)},${by + 2} ${f(bx + 7)},${by + 16}Z`, C.gold, 2.6);
      }
    }
    LAST_TORSO_CLIP = id;
    let s = `<clipPath id="${id}"><path d="${d}"/></clipPath>`;
    s += `<g clip-path="url(#${id})">${inner}</g>`;
    s += line(d, OL);
    if (outfit === "casual") {
      // поло етегі (жамбаста)
      const k = 0.62 + 0.38 * Math.abs(c);
      s += line(`M${f(-92 * k)},-404 Q0,-398 ${f(92 * k)},-404`, 3);
      if (vis) {
        // жаға қанаттары
        s += shape(`M${f(X(-2))},-664 L${f(X(-40))},-670 L${f(X(-30))},-638 Z`, "#fff", 3.6);
        s += shape(`M${f(X(2))},-664 L${f(X(40))},-670 L${f(X(30))},-638 Z`, "#fff", 3.6);
      }
    }
    return s;
  }

  // ---------- басқа киімдер ----------
  // top/shade — кеуде, sleeve long|short, collar shirt|v|round|peter, skirt {to, color, flare}, legs — аяқ түсі (шалбар/колготки)
  const OUTFITS = {
    tee: { top: "#9aa6b4", shade: "#8592a1", sleeve: "short", collar: "round", legs: "#3a3f4c", shoes: "#e9e9ee" },
    momHome: { top: "#3f8f8a", shade: "#357a75", sleeve: "long", collar: "v", under: "#f1e2cf", belt: "#2f6f6b", skirt: { to: -110, color: "#3f8f8a", shade: "#357a75" }, legs: "#ffffff", shoes: "#d0647a" },
    momFest: { top: "#8e3b6e", shade: "#77305c", sleeve: "long", collar: "round", brooch: true, skirt: { to: -150, color: "#8e3b6e", shade: "#77305c" }, legs: "#ffffff", shoes: "#2a1f24" },
    dad: { top: "#a7c7e4", shade: "#8fb2d2", sleeve: "long", collar: "shirt", buttons: true, belt: "#2a2522", legs: "#3b3f4a", shoes: "#2a2522" },
    teacher: { top: "#7d3040", shade: "#68283a", sleeve: "long", collar: "v", under: "#ffffff", buttons: true, skirt: { to: -175, color: "#3a3d4a", shade: "#31333f" }, legs: "#efe3d6", shoes: "#2a2228" },
    teacher1: { top: "#e3ad4c", shade: "#cf9a3c", sleeve: "long", collar: "round", skirt: { to: -190, color: "#4c6a8c", shade: "#425c7a" }, legs: "#ffffff", shoes: "#5a3a2a" },
    girl: { top: "#273556", shade: "#1f2a45", sleeve: "long", collar: "peter", apron: true, skirt: { to: -230, color: "#273556", shade: "#1f2a45", flare: 1.4 }, legs: "#ffffff", shoes: "#1b1b20" },
    aje: { top: "#2f5d50", shade: "#284f44", sleeve: "long", collar: "v", under: "#e9d6b8", buttons: true, skirt: { to: -44, color: "#6b3f74", shade: "#5b3563", flare: 1.25 }, legs: "#8a7a6c", shoes: "#2a2228" },
    apa: { top: "#7a5ea8", shade: "#6a5092", sleeve: "long", collar: "round", skirt: { to: -70, color: "#7a5ea8", shade: "#6a5092", flare: 1.2 }, legs: "#efe3d6", shoes: "#3a2a2a" },
    ata: { top: "#4b4a52", shade: "#3f3e46", sleeve: "long", collar: "v", under: "#f3efe6", buttons: true, legs: "#3e3d44", shoes: "#2a2522" },
    boy: { top: "#e98a3a", shade: "#d47a2e", sleeve: "short", collar: "round", legs: "#4a6fa5", shoes: "#d9d9de" },
    director: { base: "school", pal: { blazer: "#555a66", blazerShade: "#474b56", tie: "#9b2c2c", trousers: "#4a4e59" } },
  };
  let OF = null;

  // ---------- негізгі сызу ----------
  const DEF = {
    turn: 0, headTurn: 0, headTilt: 0, headY: 0, lean: 0, squash: 1, x: 0, y: 0, scale: 1,
    eye: { scale: 1, lidTop: 0.3, lidBot: 0, lidTilt: 0, px: 0, py: 0.05, pupil: 1, happy: 0 },
    brow: { lift: 0, angle: 0, liftL: 0, liftR: 0 },
    mouth: "rest",
    armL: { sh: 11, el: -7, hand: "rest" },
    armR: { sh: 11, el: -7, hand: "rest" },
    legL: { a: 3, k: 0 },
    legR: { a: 3, k: 0 },
    outfit: "school",
    fx: { sweat: 0, blush: 0, vein: 0 },
  };

  function withDefaults(p) {
    const o = Object.assign({}, DEF, p || {});
    for (const k of ["eye", "brow", "armL", "armR", "legL", "legR", "fx"]) o[k] = Object.assign({}, DEF[k], (p || {})[k] || {});
    return o;
  }

  function draw(params, opts) {
    opts = opts || {};
    const p = withDefaults(params);
    PFX = opts.id || "ar";
    UID = 0;
    RNG = opts.seed == null ? null : mulberry32(opts.seed * 7919 + 13);
    AMP = opts.boil == null ? 1.15 : opts.boil;
    const T = p.turn * 90; // градус
    const TH = T + p.headTurn * 90;
    const sq = p.squash;
    const sxs = 1 + (1 - sq) * 0.7;
    // кейіпкер (look) және киім
    LK = typeof p.look === "object" ? p.look : LOOKS[p.look || "artur"] || LOOKS.artur;
    HS = HAIR[LK.hair] || HAIR.artur;
    HAIRLINE = HS.line;
    OF = OUTFITS[p.outfit] || null;
    let outfit = p.outfit;
    const saved = {};
    if (OF && OF.base) {
      for (const k in OF.pal) { saved[k] = C[k]; C[k] = OF.pal[k]; }
      outfit = OF.base;
    }
    const BW = (LK.body && LK.body.w) || 1;
    const [BK, HK] = LK.kid || [1, 1];

    // иық пен жамбас нүктелері (цилиндрлік проекция)
    const kk = 0.62 + 0.38 * Math.abs(Math.cos(T * D));
    const shoulderAt = (side) => {
      const ph = wrap(side * 90 + T);
      return { c: Math.cos(ph * D), pt: [(66 * BW * Math.sin(ph * D)) + side * 4 * kk, -612] };
    };
    const SL = shoulderAt(-1), SR = shoulderAt(1);
    const hipAt = (side) => {
      const ph = wrap(side * 90 + T);
      return { x: 42 * BW * Math.sin(ph * D), c: Math.cos(ph * D) };
    };
    const HL = hipAt(-1), HR = hipAt(1);

    let back = "", mid = "", front = "";
    // аяқтар: алыстағысы бірінші
    const legs = [
      { side: -1, h: HL, leg: p.legL },
      { side: 1, h: HR, leg: p.legR },
    ].sort((a, b) => a.h.c - b.h.c);
    let legSvg = "";
    for (const L of legs) legSvg += drawLeg(L.side, T, L.leg, [L.h.x, -400], outfit);

    // қолдар: денеден артта (c < −0.15) немесе алдында
    const arms = [
      { side: -1, s: SL, arm: p.armL },
      { side: 1, s: SR, arm: p.armR },
    ];
    let armsBack = "", armsFront = "";
    const patches = [];
    for (const A of arms) {
      const sideScreen = Math.abs(Math.sin(wrap(A.side * 90 + T) * D)) > 0.35 ? Math.sign(Math.sin(wrap(A.side * 90 + T) * D)) : A.side * (Math.cos(T * D) >= 0 ? 1 : -1) * (Math.sin(T * D) >= 0 ? 1 : 1);
      const r = drawArm(sideScreen, T, A.arm, A.s.pt, outfit);
      if (A.s.c < -0.15) armsBack += r.svg;
      else {
        armsFront += r.svg;
        patches.push(r);
      }
    }

    // бас
    let head = "";
    const hp = jit(headPts(44));
    // артқы құлақ (бастың артында)
    head += drawHairBack(TH);
    head += drawEar(-1, TH, false) + drawEar(1, TH, false);
    head += shape(smooth(hp, true), C.skin);
    if (!LK.hideFace) {
      head += drawEar(-1, TH, true) + drawEar(1, TH, true);
      head += drawEye(-1, TH, p.eye) + drawEye(1, TH, p.eye);
      // мең: кейіпкердің оң беті (экранда сол жақ)
      const mole = proj(-36, 36, TH);
      if (LK.mole && mole.c > 0.2) head += `<circle cx="${f(mole.x)}" cy="${f(mole.y)}" r="4.6" fill="${C.mole}"/>`;
      if (LK.wrinkles) head += drawWrinkles(TH);
      head += drawMouth(TH, p.mouth);
      if (LK.beard) head += drawBeard(TH);
      if (LK.mustache) head += drawMustache(TH);
    }
    if (HS.peek) head += drawPeek(TH);
    head += drawHair(TH);
    if (HS.dots) head += drawDots(TH);
    if (HS.cap) head += drawCap(TH);
    if (LK.glasses) head += drawGlasses(TH);
    head += drawBrow(-1, TH, p.brow) + drawBrow(1, TH, p.brow);
    head += drawHairFront(TH);
    head += drawFx(TH, LK.blushK ? Object.assign({}, p.fx, { blush: Math.max(p.fx.blush || 0, LK.blushK) }) : p.fx);

    const torso = drawTorso(T, outfit);
    // юбка / халат етегі
    let skirt = "";
    if (OF && OF.skirt) {
      const sk = OF.skirt, k2 = (0.62 + 0.38 * Math.abs(Math.cos(T * D))) * BW;
      const top = 86 * k2, bot = 86 * k2 * (sk.flare || 1.18) + 8;
      const pts = jit([[-top, -440], [top, -440], [bot, sk.to + 4], [bot * 0.5, sk.to + 12], [0, sk.to + 8], [-bot * 0.5, sk.to + 12], [-bot, sk.to + 4]]);
      const id = uid("sk");
      const d = smooth(pts, true, 1 / 9);
      skirt = `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${sk.color}"/><g clip-path="url(#${id})"><path d="M${f(top * 0.35)},-440 L300,-440 L300,${sk.to + 20} L${f(bot * 0.45)},${sk.to + 20}Z" fill="${sk.shade || sk.color}"/></g>` + line(d, OL);
      if ((sk.flare || 1) > 1.3) skirt += line(`M${f(-bot * 0.45)},${sk.to} L${f(-top * 0.3)},-430 M${f(bot * 0.45)},${sk.to} L${f(top * 0.3)},-430`, 3);
    }
    // иық түйісуі: қолдың дөңгелек ұшының дене ішіндегі контурын жеңнің түсімен жабу
    let patch = "";
    for (const r of patches) {
      patch += `<circle cx="${f(r.shoulder[0])}" cy="${f(r.shoulder[1])}" r="${f(r.w / 2 + OL + 1)}" fill="${r.sleeve}" clip-path="url(#${LAST_TORSO_CLIP})"/>`;
    }
    let body;
    if (BK === 1 && HK === 1) {
      const headG = `<g transform="translate(0,-652) rotate(${f(p.headTilt)}) translate(0,${f(-157 + p.headY)})">${head}</g>`;
      const upper = `<g transform="rotate(${f(p.lean)} 0 -400)">${armsBack}${skirt}${torso}${armsFront}${patch}${headG}</g>`;
      body = `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.scale * sxs * 1000) / 1000},${f(p.scale * sq * 1000) / 1000})">${legSvg}${upper}</g>`;
    } else {
      // бала пропорциясы: дене кіші, бас салыстырмалы түрде үлкен
      const headG = `<g transform="translate(0,${f(-652 * BK)}) rotate(${f(p.headTilt)}) scale(${HK}) translate(0,${f(-157 + p.headY)})">${head}</g>`;
      const upper = `<g transform="rotate(${f(p.lean)} 0 ${f(-400 * BK)})"><g transform="scale(${BK})">${armsBack}${skirt}${torso}${armsFront}${patch}</g>${headG}</g>`;
      body = `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${f(p.scale * sxs * 1000) / 1000},${f(p.scale * sq * 1000) / 1000})"><g transform="scale(${BK})">${legSvg}</g>${upper}</g>`;
    }
    for (const k in saved) C[k] = saved[k];
    RNG = null;
    return body;
  }

  // ---------- эмоциялар мен виземалар ----------
  const EXPR = {
    calm: { eye: { scale: 1, lidTop: 0.3, lidBot: 0, lidTilt: 0, px: 0, py: 0.05, pupil: 1, happy: 0 }, brow: { lift: 0, angle: 0, liftL: 0, liftR: 0 }, mouth: "rest", fx: { sweat: 0, blush: 0, vein: 0 } },
    happy: { eye: { scale: 1, lidTop: 0.08, lidBot: 0.32, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 0 }, brow: { lift: 8, angle: -4, liftL: 0, liftR: 0 }, mouth: "smile", fx: { sweat: 0, blush: 0, vein: 0 } },
    laugh: { eye: { scale: 1, lidTop: 0.6, lidBot: 0.4, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 1 }, brow: { lift: 12, angle: -6, liftL: 0, liftR: 0 }, mouth: "laugh", fx: { sweat: 0, blush: 0.6, vein: 0 } },
    shock: { eye: { scale: 1.28, lidTop: 0, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 0.55, happy: 0 }, brow: { lift: 28, angle: -10, liftL: 0, liftR: 0 }, mouth: "shock", fx: { sweat: 1, blush: 0, vein: 0 } },
    angry: { eye: { scale: 1, lidTop: 0.4, lidBot: 0.08, lidTilt: 1, px: 0, py: 0.1, pupil: 1, happy: 0 }, brow: { lift: -8, angle: 24, liftL: 0, liftR: 0 }, mouth: "growl", fx: { sweat: 0, blush: 0, vein: 1 } },
    sad: { eye: { scale: 1, lidTop: 0.36, lidBot: 0.05, lidTilt: -1, px: 0, py: 0.4, pupil: 1, happy: 0 }, brow: { lift: 6, angle: -20, liftL: 0, liftR: 0 }, mouth: "frown", fx: { sweat: 0, blush: 0, vein: 0 } },
    smug: { eye: { scale: 1, lidTop: 0.52, lidBot: 0.12, lidTilt: 0, px: 0.4, py: 0.1, pupil: 1, happy: 0 }, brow: { lift: 0, angle: 6, liftL: 14, liftR: -2 }, mouth: "smirk", fx: { sweat: 0, blush: 0, vein: 0 } },
    scared: { eye: { scale: 1.16, lidTop: 0, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 0.5, happy: 0 }, brow: { lift: 18, angle: -22, liftL: 0, liftR: 0 }, mouth: "wavy", fx: { sweat: 1, blush: 0, vein: 0 } },
    sleepy: { eye: { scale: 1, lidTop: 0.74, lidBot: 0.1, lidTilt: 0, px: 0, py: 0.2, pupil: 1, happy: 0 }, brow: { lift: -4, angle: -3, liftL: 0, liftR: 0 }, mouth: "rest", fx: { sweat: 0, blush: 0, vein: 0 } },
    thinking: { eye: { scale: 1, lidTop: 0.24, lidBot: 0.05, lidTilt: 0, px: -0.45, py: -0.55, pupil: 1, happy: 0 }, brow: { lift: 2, angle: 0, liftL: -2, liftR: 12 }, mouth: "hmm", fx: { sweat: 0, blush: 0, vein: 0 } },
    shy: { eye: { scale: 1, lidTop: 0.2, lidBot: 0.2, lidTilt: -0.4, px: 0.5, py: 0.35, pupil: 1, happy: 0 }, brow: { lift: 6, angle: -12, liftL: 0, liftR: 0 }, mouth: "smile", fx: { sweat: 0, blush: 1, vein: 0 } },
  };
  // дайын позалар (қол-аяқ); эмоциямен бірге қолдану: Object.assign({}, EXPR.happy, POSES.wave)
  const POSES = {
    idle: {},
    wave: { armR: { sh: 138, el: 34, hand: "open" }, headTilt: -5 },
    hips: { armL: { sh: 50, el: -94, hand: "fist" }, armR: { sh: 50, el: -94, hand: "fist" } },
    shrug: { armL: { sh: 30, el: 84, hand: "open" }, armR: { sh: 30, el: 84, hand: "open" }, headTilt: 7 },
    point: { armR: { sh: 84, el: 2, hand: "point" } },
    cheer: { armL: { sh: 164, el: 8, hand: "fist" }, armR: { sh: 160, el: 12, hand: "fist" }, legL: { a: 13, k: 0 }, legR: { a: 13, k: 0 } },
    think: { armR: { sh: 18, el: -158, hand: "fist" }, armL: { sh: 26, el: -120, hand: "rest" } },
  };
  const VISEMES = ["rest", "mbp", "ee", "aa", "oh", "uu", "ff"];
  // қазақ әріптері → визема (ElevenLabs таңбалық таймингтеріне)
  function letterViseme(ch) {
    ch = (ch || "").toLowerCase();
    if ("аәя".includes(ch)) return "aa";
    if ("оөё".includes(ch)) return "oh";
    if ("уұүю".includes(ch)) return "uu";
    if ("еэіиыйһ".includes(ch)) return "ee";
    if ("мбп".includes(ch)) return "mbp";
    if ("фв".includes(ch)) return "ff";
    if (/[a-zа-яәғқңөұүһі]/i.test(ch)) return "ee";
    return "rest";
  }

  // сандық параметрлерді араластыру (эмоциядан эмоцияға өту)
  function blend(a, b, k) {
    if (typeof a === "number" && typeof b === "number") return lerp(a, b, k);
    if (a && b && typeof a === "object" && typeof b === "object") {
      const o = {};
      for (const key of new Set(Object.keys(a).concat(Object.keys(b)))) {
        o[key] = key in a && key in b ? blend(a[key], b[key], k) : key in b ? b[key] : a[key];
      }
      return o;
    }
    return k < 0.5 ? a : b;
  }

  G.ArturRig = { draw, EXPR, POSES, VISEMES, letterViseme, blend, COLORS: C, INK, DEF, LOOKS, OUTFITS, HAIR };
})(typeof window !== "undefined" ? window : globalThis);
