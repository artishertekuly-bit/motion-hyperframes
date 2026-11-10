/* «Соңғы қоңырау» — фондар мен заттар (таза SVG жолдары).
 * Әлем координаттары: еден сызығы y = 0, кейіпкердің табаны y ≈ 0. Кең план: камера (0, −380), zoom 1.
 * Әр фон: { far, mid, near } — қабаттар (параллакс). Заттар (props) — қолдың жергілікті координаттарында:
 * білезік (0,0), саусақтар +y бағытында.
 */
(function (G) {
  "use strict";
  const INK = "#141418";
  const f = (n) => Math.round(n * 10) / 10;
  const P = (d, fill, sw, extra) => `<path d="${d}" fill="${fill || "none"}" stroke="${INK}" stroke-width="${sw == null ? 6 : sw}" stroke-linejoin="round" stroke-linecap="round"${extra || ""}/>`;
  const F = (d, fill, extra) => `<path d="${d}" fill="${fill}"${extra || ""}/>`;
  const Ln = (d, sw, col, extra) => `<path d="${d}" fill="none" stroke="${col || INK}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${extra || ""}/>`;
  const R = (x, y, w, h, fill, sw, rx) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx || 0}" fill="${fill}" stroke="${INK}" stroke-width="${sw == null ? 6 : sw}" stroke-linejoin="round"/>`;
  const RF = (x, y, w, h, fill, rx, extra) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx || 0}" fill="${fill}"${extra || ""}/>`;
  const C = (x, y, r, fill, sw) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${INK}" stroke-width="${sw == null ? 6 : sw}"/>`;
  const T = (x, y, s, size, fill, extra) => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${fill || INK}" font-family="Montserrat, sans-serif" font-weight="800" text-anchor="middle"${extra || ""}>${s}</text>`;
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const grad = (id, stops, vertical) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical === false ? 1 : 0}" y2="${vertical === false ? 0 : 1}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;

  // ---------- кішкентай бөлшектер ----------
  function windowFrame(x, y, w, h, sky, opts) {
    opts = opts || {};
    let s = R(x - 14, y - 14, w + 28, h + 28, opts.frame || "#f4f1ea", 6, 4);
    s += RF(x, y, w, h, sky);
    if (opts.inner) s += opts.inner;
    s += Ln(`M${x + w / 2},${y} L${x + w / 2},${y + h} M${x},${y + h * 0.38} L${x + w},${y + h * 0.38}`, 10, opts.frame || "#f4f1ea") + Ln(`M${x + w / 2},${y} L${x + w / 2},${y + h} M${x},${y + h * 0.38} L${x + w},${y + h * 0.38}`, 3);
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="5"/>`;
    s += Ln(`M${x + 24},${y + h - 30} L${x + 70},${y + h - 90} M${x + 40},${y + h - 22} L${x + 74},${y + h - 66}`, 5, "#ffffff", ' opacity="0.55"');
    s += R(x - 30, y + h + 10, w + 60, 22, opts.frame || "#f4f1ea", 5, 3);
    return s;
  }
  function crowdPerson(x, y, s, tone, seed, opts) {
    // артқы кейіпкер — сұр силуэт (ZAKATOON тәсілі)
    opts = opts || {};
    const r = rng(seed);
    const h = 1 + (r() - 0.5) * 0.18;
    const body = tone || ["#b7bcc6", "#a9afba", "#c3c7cf", "#9da3ae"][Math.floor(r() * 4)];
    const head = opts.head || "#e9ebef";
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)},${f(s * h)})">`;
    g += P(`M-58,0 L-62,-300 Q-60,-372 0,-376 Q60,-372 62,-300 L58,0Z`, body, 6);
    g += C(0, -470, 108, head, 6);
    if (r() < 0.55) g += P(`M-104,-500 Q-90,-590 0,-584 Q92,-590 104,-500 Q60,-540 0,-532 Q-60,-540 -104,-500Z`, ["#6f737d", "#585c66", "#7d818b"][Math.floor(r() * 3)], 5);
    if (opts.phone && r() < 0.5) g += R(40, -620, 40, 70, "#2b2c33", 5, 8) + Ln(`M30,-380 L60,-560`, 26, body) + Ln(`M30,-380 L60,-560`, 5);
    g += `</g>`;
    return g;
  }

  // ---------- заттар ----------
  const PROPS = {
    phone: (screen) => `<g transform="translate(0,34)">${R(-26, -48, 52, 96, "#26272e", 5, 10)}${screen ? RF(-20, -40, 40, 80, screen, 5) : C(-10, -32, 6, "#5c6070", 3)}</g>`,
    comb: () => `<g transform="translate(0,30) rotate(90)">${R(-44, -9, 88, 18, "#e85d75", 4, 4)}${Ln("M-38,9 L-38,24 M-28,9 L-28,24 M-18,9 L-18,24 M-8,9 L-8,24 M2,9 L2,24 M12,9 L12,24 M22,9 L22,24 M32,9 L32,24", 4)}</g>`,
    gel: () => `<g transform="translate(0,26)">${P("M-22,-10 L22,-10 L18,60 L-18,60Z", "#5ab4e5", 5)}${R(-14, -26, 28, 18, "#ffffff", 4, 3)}${Ln("M-10,16 L10,16 M-10,28 L6,28", 4, "#ffffff")}</g>`,
    spray: () => `<g transform="translate(0,20)">${R(-20, -40, 40, 92, "#d9d4e8", 5, 8)}${R(-10, -58, 20, 18, "#7d6bb3", 4, 3)}${Ln("M-12,0 L12,0", 4, "#7d6bb3")}</g>`,
    bell: (swing) => `<g transform="rotate(${f(swing || 0)})">${R(-9, -8, 18, 44, "#9a6a3e", 4, 6)}<g transform="translate(0,-14)">${P("M-30,-6 Q-30,-58 0,-62 Q30,-58 30,-6 L40,10 L-40,10Z", "#e6b544", 5)}${Ln("M-18,-46 Q-8,-56 4,-56", 4, "#fff3c4")}${C(0, 18, 9, "#b88a2a", 4)}${Ln("M-36,4 L36,4", 3, "#b88a2a")}</g></g>`,
    tissue: () => `<g transform="translate(0,30)">${P("M-20,-14 Q0,-26 20,-14 L16,20 Q0,30 -16,20Z", "#ffffff", 4)}</g>`,
    pastry: () => `<g transform="translate(0,30)">${P("M-40,6 Q-40,-30 0,-32 Q40,-30 40,6 Q0,18 -40,6Z", "#d99a4a", 5)}${Ln("M-22,-12 Q0,-22 22,-12", 4, "#f2c27a")}</g>`,
    can: () => `<g transform="translate(0,28)">${P("M-30,-30 L30,-30 L34,40 L-34,40Z", "#6fb37a", 5)}${P("M30,-10 L92,-46 L98,-36 L36,8", "#6fb37a", 5)}${P("M-30,-26 Q-62,0 -30,26", "none", 6)}</g>`,
  };
  function bouquet(x, y, s, sway) {
    // үлкен гүл шоғы (бірінші сынып)
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)}) rotate(${f(sway || 0)})">`;
    g += P("M-70,0 L70,0 L170,-360 L-170,-360Z", "#f2ede2", 6);
    g += Ln("M-30,0 L-100,-300 M30,0 L100,-300 M0,0 L0,-330", 4, "#d8d0bf");
    const r = rng(7);
    const cols = ["#e85d75", "#f2a541", "#f6d55c", "#ffffff", "#e85d75", "#b56ee8", "#ff8fa3"];
    const fl = [];
    for (let i = 0; i < 26; i++) {
      const a = (r() - 0.5) * 2.4, d = 120 + r() * 330;
      fl.push([Math.sin(a) * d * 0.95, -340 - Math.cos(a) * d * 0.62 - r() * 80, 44 + r() * 26, cols[i % cols.length]]);
    }
    fl.sort((a, b) => a[1] - b[1]);
    for (const [fx, fy] of fl) g += P(`M${f(fx)},${f(fy)} q-30,-34 -14,-70 q30,10 30,60`, "#5fa36a", 5);
    for (const [fx, fy, fr, col] of fl) {
      for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.283; g += C(fx + Math.cos(a) * fr * 0.55, fy + Math.sin(a) * fr * 0.55, fr * 0.5, col, 5); }
      g += C(fx, fy, fr * 0.3, "#f6d55c", 4);
    }
    g += P("M-90,-330 Q0,-300 90,-330 L70,-250 Q0,-230 -70,-250Z", "#e85d75", 6);
    g += `</g>`;
    return g;
  }
  function balloon(x, y, r, col, seed, wob) {
    const a = Math.sin((wob || 0) + seed) * 3;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(a)})">${Ln(`M0,${r * 1.15} q14,40 -6,90`, 3, "#7d808a")}${P(`M0,${-r * 1.1} Q${r},${-r * 1.1} ${r},0 Q${r},${r * 0.9} 0,${r * 1.15} Q${-r},${r * 0.9} ${-r},0 Q${-r},${-r * 1.1} 0,${-r * 1.1}Z`, col, 5)}${P(`M-8,${r * 1.12} L8,${r * 1.12} L0,${r * 1.28}Z`, col, 4)}${Ln(`M${-r * 0.45},${-r * 0.5} Q${-r * 0.3},${-r * 0.8} 0,${-r * 0.82}`, 5, "#ffffff", ' opacity="0.7"')}</g>`;
  }

  // ---------- фондар ----------
  const BG = {};
  BG.bedroom = () => {
    let far = `<defs>${grad("skyM", [[0, "#9db4d8"], [0.55, "#f3c6a5"], [1, "#ffd99a"]])}</defs>`;
    far += RF(-1700, -1500, 3400, 1500, "#c7d0e0");
    for (let x = -1680; x < 1700; x += 90) far += RF(x, -1500, 34, 1500, "#bfc9da");
    far += RF(-1700, -150, 3400, 150, "#b4bfd2") + Ln("M-1700,-150 L1700,-150", 5);
    far += windowFrame(260, -930, 430, 500, "url(#skyM)", { inner: `<circle cx="560" cy="-560" r="56" fill="#ffe2a6"/>` + P("M260,-470 Q380,-540 470,-480 Q560,-520 690,-470 L690,-430 L260,-430Z", "#8fa3c4", 0) });
    far += P("M230,-960 Q300,-700 250,-400 L200,-400 L200,-960Z", "#d96c6c", 5) + P("M720,-960 Q650,-700 700,-400 L750,-400 L750,-960Z", "#d96c6c", 5);
    far += Ln("M180,-962 L770,-962", 8);
    // плакат, сағат
    far += R(-760, -980, 300, 400, "#f6d55c", 6, 6) + `<g transform="translate(-610,-800)">${P("M0,-70 L20,-22 L70,-20 L30,10 L44,60 L0,30 L-44,60 L-30,10 L-70,-20 L-20,-22Z", "#e85d75", 6)}</g>` + T(-610, -640, "АЛҒА!", 54, INK);
    far += C(-180, -840, 80, "#ffffff", 7) + Ln("M-180,-840 L-180,-898 M-180,-840 L-180,-800", 7) + C(-180, -840, 6, INK, 0);
    // еден
    far += RF(-1700, 0, 3400, 600, "#a9876a");
    for (let y = 40; y < 600; y += 70) far += Ln(`M-1700,${y} L1700,${y}`, 3, "#957459");
    far += Ln("M-1700,0 L1700,0", 6);
    // кереует, үстел
    let mid = P("M-80,-300 L-80,0 M1080,-200 L1080,0", "none", 10);
    mid += R(-110, -330, 60, 330, "#8d6a52", 6, 8);
    mid += R(-60, -170, 1150, 120, "#8d6a52", 6, 6);
    mid += R(-60, -260, 1150, 100, "#f1f1f4", 6, 18);
    mid += R(1040, -250, 60, 250, "#8d6a52", 6, 8);
    mid += R(-1100, -380, 420, 30, "#c99b6d", 6, 4) + R(-1080, -350, 26, 350, "#c99b6d", 5) + R(-720, -350, 26, 350, "#c99b6d", 5);
    mid += P("M-1010,-380 L-990,-470 L-930,-470 L-950,-380Z", "#5ab4e5", 5) + R(-860, -440, 120, 60, "#e85d75", 5, 4) + R(-850, -470, 100, 30, "#f6d55c", 5, 4);
    return { far, mid, near: "" };
  };
  BG.blanket = (k) => {
    // көрпе (кейіпкердің үстінен): k — ашылу
    return P(`M${f(-40 + 560 * k)},-250 L1090,-250 L1090,-60 Q${f(600 + 200 * k)},-30 ${f(-40 + 560 * k)},-60Z`, "#5f7fc4", 6) + Ln(`M${f(80 + 560 * k)},-180 L1060,-180`, 4, "#4c6aaa");
  };
  BG.door = (open, x0) => {
    // есік (ашылу 0..1)
    x0 = x0 == null ? -1300 : x0;
    const w = 380 * (1 - 0.82 * open);
    let s = RF(x0 - 20, -880, 420, 880, "#3b3e4a") + R(x0 - 20, -880, 420, 880, "none", 6);
    s += P(`M${x0},-860 L${x0 + w},${-860 + 40 * open} L${x0 + w},${-20 - 40 * open} L${x0},0Z`, "#e7d8bf", 6);
    s += C(x0 + w - 40 * (1 - open), -420, 12, "#d6b04a", 5);
    return s;
  };

  BG.hall = () => {
    let far = RF(-1700, -1500, 3400, 1500, "#ead9bf");
    far += RF(-1700, -520, 3400, 520, "#c9a77f") + Ln("M-1700,-520 L1700,-520", 6);
    for (let x = -1660; x < 1700; x += 120) far += Ln(`M${x},-520 L${x},0`, 3, "#b8956c");
    far += R(-1200, -1150, 260, 200, "#ffffff", 6, 4) + RF(-1180, -1130, 220, 160, "#9fc6a8") + P("M-1180,-1000 L-1100,-1080 L-1040,-1030 L-990,-1070 L-960,-1000Z", "#5f8f6a", 4);
    far += Ln("M800,-1060 L1240,-1060", 10, "#8d6a52") + Ln("M800,-1060 L1240,-1060", 4);
    for (const [x, c] of [[860, "#5f7fc4"], [990, "#d96c6c"], [1120, "#4f5560"]]) far += P(`M${x},-1050 L${x - 70},-880 L${x - 80},-560 L${x + 80},-560 L${x + 70},-880Z`, c, 6);
    far += RF(-1700, 0, 3400, 600, "#8d6a52");
    return { far, mid: "", near: "" };
  };

  BG.host = (hue) => {
    const base = hue || ["#ffd9ae", "#ffc49a"];
    let far = `<defs><radialGradient id="hostG" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="${base[0]}"/><stop offset="1" stop-color="${base[1]}"/></radialGradient></defs>`;
    far += RF(-2400, -2000, 4800, 3400, "url(#hostG)");
    const r = rng(11);
    const ic = [
      (x, y) => `<g transform="translate(${x},${y}) scale(0.7)">${PROPS.bell(0)}</g>`,
      (x, y) => `<g transform="translate(${x},${y}) rotate(-20)">${P("M-14,-60 L14,-60 L14,50 L0,74 L-14,50Z", "#f6d55c", 5)}${P("M-14,-60 L14,-60 L14,-44 L-14,-44Z", "#e85d75", 5)}</g>`,
      (x, y) => `<g transform="translate(${x},${y})">${P("M0,-40 L12,-12 L42,-12 L18,6 L26,36 L0,18 L-26,36 L-18,6 L-42,-12 L-12,-12Z", "#ffffff", 5)}</g>`,
      (x, y) => `<g transform="translate(${x},${y}) rotate(8)">${R(-40, -30, 80, 60, "#7fb2e5", 5, 4)}${Ln("M0,-30 L0,30", 4)}</g>`,
    ];
    for (let i = 0; i < 46; i++) far += `<g opacity="0.33">${ic[i % 4](f(-2200 + r() * 4400), f(-1800 + r() * 3000))}</g>`;
    return { far, mid: "", near: "" };
  };

  BG.movie = () => {
    let far = `<defs>${grad("mvS", [[0, "#ffb36b"], [0.6, "#ffd59a"], [1, "#fff0c9"]])}<radialGradient id="mvSun"><stop offset="0" stop-color="#fffbe6"/><stop offset="0.4" stop-color="#ffe6a3" stop-opacity="0.8"/><stop offset="1" stop-color="#ffe6a3" stop-opacity="0"/></radialGradient></defs>`;
    far += RF(-2400, -2000, 4800, 2000, "url(#mvS)") + `<circle cx="300" cy="-520" r="520" fill="url(#mvSun)"/>`;
    far += F("M-2400,-260 L-1400,-260 L-1400,-760 L-200,-760 L-200,-600 L900,-600 L900,-820 L1500,-820 L1500,-260 L2400,-260 L2400,0 L-2400,0Z", "#c9805a");
    for (let x = -1300; x < -250; x += 150) for (let y = -700; y < -300; y += 140) far += RF(x, y, 80, 90, "#e0a274");
    let mid = RF(-2400, 0, 4800, 800, "#d89a5f");
    return { far, mid, near: "" };
  };

  BG.schoolFront = (banner) => {
    let far = `<defs>${grad("sfSky", [[0, "#8fc3ea"], [1, "#dcefff"]])}</defs>`;
    far += RF(-2600, -2200, 5200, 2200, "url(#sfSky)");
    for (const [x, y, s] of [[-1500, -1500, 1.2], [700, -1700, 1], [1800, -1450, 0.9]]) far += `<g transform="translate(${x},${y}) scale(${s})">${P("M-120,0 Q-130,-70 -50,-70 Q-30,-130 40,-110 Q110,-130 130,-60 Q190,-40 160,0Z", "#ffffff", 5)}</g>`;
    // мектеп ғимараты
    far += R(-1500, -1350, 3000, 1350, "#e9c9a0", 7);
    far += RF(-1500, -1350, 3000, 60, "#d4ad80") + Ln("M-1500,-1290 L1500,-1290", 5);
    for (let fl = 0; fl < 3; fl++) for (let x = -1380; x < 1400; x += 260) {
      if (Math.abs(x + 120 - 0) < 260 && fl === 2) continue;
      far += windowFrame(x, -1220 + fl * 380, 150, 220, "#a9d3f0", { frame: "#ffffff" });
    }
    far += R(-200, -560, 400, 560, "#7a5a44", 7) + R(-170, -530, 160, 530, "#8d6a52", 5) + R(10, -530, 160, 530, "#8d6a52", 5);
    far += R(-330, -720, 660, 120, "#3f6fb5", 6, 8) + T(0, -642, banner || "МЕКТЕП", 64, "#ffffff");
    far += R(-500, -40, 1000, 40, "#c8c3b8", 5) + R(-420, -80, 840, 40, "#d6d1c6", 5);
    far += RF(-2600, 0, 5200, 800, "#9fbf72");
    for (const x of [-2100, -1750, 1750, 2150]) far += `<g transform="translate(${x},0)">${R(-24, -380, 48, 380, "#8d6a52", 5)}${P("M0,-900 Q170,-880 190,-700 Q260,-600 170,-470 Q60,-380 0,-420 Q-60,-380 -170,-470 Q-260,-600 -190,-700 Q-170,-880 0,-900Z", "#79ad5c", 6)}</g>`;
    return { far, mid: "", near: "" };
  };

  BG.classroom = (board, opts) => {
    opts = opts || {};
    const wall = opts.wall || "#d6e3d0";
    let far = RF(-2200, -1600, 4400, 1600, wall);
    far += RF(-2200, -360, 4400, 360, opts.panel || "#b9cdb3") + Ln("M-2200,-360 L2200,-360", 6);
    // тақта
    far += R(-760, -1180, 1520, 640, "#7a5a44", 8, 6) + RF(-730, -1150, 1460, 580, "#2f5a46") + R(-730, -1150, 1460, 580, "none", 5);
    far += Ln("M-560,-620 L-260,-620", 4, "#ffffff", ' opacity="0.15"') + Ln("M120,-700 L520,-660", 6, "#ffffff", ' opacity="0.12"');
    far += R(-700, -548, 320, 26, "#8d6a52", 5, 4) + R(-640, -566, 60, 20, "#ffffff", 3, 3);
    if (board) far += board;
    // терезелер
    for (const x of [1000, 1520]) far += windowFrame(x, -1240, 360, 560, "#bfe0f5", { frame: "#ffffff", inner: P(`M${x},${-760} Q${x + 120},${-840} ${x + 200},${-780} Q${x + 280},${-820} ${x + 360},${-770} L${x + 360},-680 L${x},-680Z`, "#9cc77f", 0) });
    for (const x of [-1600, -1180]) far += R(x, -1180, 280, 360, "#ffffff", 6, 4) + RF(x + 24, -1156, 232, 230, opts.posterCol || "#f2c94c") + T(x + 140, -880, opts.posterText || "Әә Бб", 46, INK);
    far += RF(-2200, 0, 4400, 700, "#b98e6a") + Ln("M-2200,0 L2200,0", 6);
    for (let y = 60; y < 700; y += 90) far += Ln(`M-2200,${y} L2200,${y}`, 3, "#a57c5b");
    // мұғалім үстелі
    let mid = R(-1500, -420, 640, 60, "#a87b57", 6, 4) + R(-1480, -360, 40, 360, "#a87b57", 5) + R(-920, -360, 40, 360, "#a87b57", 5) + R(-1460, -360, 560, 200, "#946a49", 5);
    mid += R(-1440, -500, 160, 80, "#5f7fc4", 5, 4) + R(-1420, -540, 130, 40, "#e85d75", 5, 4) + P("M-1060,-420 L-1080,-500 L-980,-500 L-1000,-420Z", "#c46b4a", 5) + P("M-1030,-500 Q-1090,-600 -1050,-640 Q-1020,-580 -1030,-500 Q-990,-610 -950,-600 Q-990,-560 -1030,-500Z", "#5fa36a", 5);
    let near = "";
    if (opts.desks !== false) for (const x of [-500, 500]) near += `<g transform="translate(${x},260)">${R(-380, -300, 760, 56, "#c99b6d", 6, 4)}${R(-350, -244, 34, 300, "#8b8f99", 5)}${R(316, -244, 34, 300, "#8b8f99", 5)}</g>`;
    return { far, mid, near };
  };

  BG.stairs = () => {
    // подъезд: төменгі жарты жасыл, үсті ақшыл — таныс көрініс
    let far = RF(-2200, -1600, 4400, 1600, "#e8e3d6") + RF(-2200, -620, 4400, 620, "#7fa28c") + Ln("M-2200,-620 L2200,-620", 6);
    far += R(-300, -1000, 520, 1000, "#6b4635", 8, 6);
    for (let y = -940; y < -60; y += 110) for (let x = -250; x < 180; x += 110) far += C(x + 40, y + 40, 6, "#4f3125", 0);
    far += R(-300, -1080, 520, 70, "#8b8f99", 5) + T(-40, -1028, "42", 44, "#ffffff");
    far += R(260, -560, 70, 90, "#d9d4c4", 5, 4) + C(295, -515, 14, "#ffffff", 4);
    far += RF(-2200, 0, 4400, 700, "#a39b8a") + Ln("M-2200,0 L2200,0", 6);
    far += R(-360, -14, 600, 30, "#8d5a4a", 5, 6);
    for (let i = 0; i < 6; i++) far += R(-2000 + i * 110, -60 - i * 70, 600, 60 + i * 70, "#bdb6a6", 5) ;
    far += Ln("M-2000,-460 L-1340,-880", 10, "#5c4a3e");
    return { far, mid: "", near: "" };
  };

  BG.canteen = () => {
    let far = RF(-2400, -1600, 4800, 1600, "#eef1ee");
    for (let x = -2400; x < 2400; x += 80) far += Ln(`M${x},-1600 L${x},-300`, 2, "#d6dcd8");
    for (let y = -1600; y < -300; y += 80) far += Ln(`M-2400,${y} L2400,${y}`, 2, "#d6dcd8");
    far += RF(-2400, -300, 4800, 300, "#c7d7d1");
    far += R(-500, -1300, 1000, 420, "#2f4a3e", 8, 6) + T(0, -1210, "МӘЗІР", 60, "#f6d55c");
    for (const [i, s] of ["Бәліш — 250 ₸", "Самса — 300 ₸", "Тоқаш — 150 ₸", "Шай — 50 ₸"].entries()) far += `<text x="-420" y="${-1130 + i * 64}" font-size="44" fill="#ffffff" font-family="Montserrat, sans-serif" font-weight="700">${s}</text>`;
    far += R(-1500, -1250, 600, 300, "#ffffff", 6, 4) + T(-1200, -1080, "АСХАНА", 72, "#e85d75");
    // үстел-витрина
    let mid = R(-1300, -420, 2600, 420, "#c99b6d", 7, 6) + R(-1300, -470, 2600, 60, "#e6e0d5", 6, 4);
    mid += P("M-1240,-470 L-1180,-760 L1180,-760 L1240,-470", "#e6f2f6", 6, ' fill-opacity="0.55"');
    for (let i = 0; i < 6; i++) {
      const x = -1100 + i * 400;
      mid += R(x - 160, -500, 320, 30, "#b8bcc4", 5, 6);
      for (let j = 0; j < 3; j++) mid += `<g transform="translate(${x - 90 + j * 90},-520) scale(0.9)">${PROPS.pastry().replace('translate(0,30)', 'translate(0,0)')}</g>`;
    }
    for (let x = -1100; x <= 900; x += 400) mid += Ln(`M${x},-800 q20,-40 0,-80 q-20,-40 0,-80`, 6, "#ffffff", ' opacity="0.55"');
    return { far, mid, near: "" };
  };
  BG.pastryAt = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${PROPS.pastry().replace('translate(0,30)', 'translate(0,0)')}</g>`;

  BG.corridor = () => {
    let far = RF(-2600, -1600, 5200, 1600, "#e8e0cf");
    far += P("M-2600,-1400 L-300,-760 L300,-760 L2600,-1400", "none", 6) + P("M-2600,300 L-300,-260 L300,-260 L2600,300", "none", 6);
    far += F("M-300,-760 L300,-760 L300,-260 L-300,-260Z", "#d6ccb8") + P("M-300,-760 L300,-760 L300,-260 L-300,-260Z", "none", 5);
    far += F("M-2600,300 L-300,-260 L300,-260 L2600,300Z", "#c9b48f");
    for (let i = 0; i < 5; i++) {
      const k = i / 5, k2 = (i + 0.6) / 5;
      const lx = (z) => -2600 + 2300 * z, ty = (z) => -1400 + 640 * z, by = (z) => 300 - 560 * z;
      far += P(`M${f(lx(k))},${f(ty(k) + (by(k) - ty(k)) * 0.2)} L${f(lx(k2))},${f(ty(k2) + (by(k2) - ty(k2)) * 0.2)} L${f(lx(k2))},${f(ty(k2) + (by(k2) - ty(k2)) * 0.58)} L${f(lx(k))},${f(ty(k) + (by(k) - ty(k)) * 0.58)}Z`, "#bfe0f5", 5);
      const rx = (z) => 2600 - 2300 * z;
      far += P(`M${f(rx(k))},${f(ty(k) + (by(k) - ty(k)) * 0.15)} L${f(rx(k2))},${f(ty(k2) + (by(k2) - ty(k2)) * 0.15)} L${f(rx(k2))},${f(by(k2))} L${f(rx(k))},${f(by(k))}Z`, "#9c7a5e", 5);
    }
    return { far, mid: "", near: "" };
  };

  BG.yard = () => {
    let far = `<defs>${grad("ySky", [[0, "#6fb6ee"], [0.7, "#bfe3fb"], [1, "#e6f5ff"]])}</defs>`;
    far += RF(-4200, -3000, 8400, 3000, "url(#ySky)");
    for (const [x, y, s] of [[-2600, -2300, 1.4], [-600, -2500, 1.1], [1500, -2350, 1.3], [3300, -2200, 1]]) far += `<g transform="translate(${x},${y}) scale(${s})">${P("M-120,0 Q-130,-70 -50,-70 Q-30,-130 40,-110 Q110,-130 130,-60 Q190,-40 160,0Z", "#ffffff", 5)}</g>`;
    // мектеп
    far += R(-2200, -1700, 4400, 1300, "#e9c9a0", 7);
    far += RF(-2200, -1700, 4400, 60, "#d4ad80");
    for (let fl = 0; fl < 3; fl++) for (let x = -2080; x < 2100; x += 280) {
      if (Math.abs(x + 75) < 300 && fl === 2) continue;
      far += windowFrame(x, -1580 + fl * 380, 150, 220, "#a9d3f0", { frame: "#ffffff" });
    }
    far += R(-200, -900, 400, 500, "#7a5a44", 7);
    far += R(-560, -1080, 1120, 130, "#3f6fb5", 6, 8) + T(0, -992, "СОҢҒЫ ҚОҢЫРАУ — 2026", 66, "#ffffff");
    // жалауша гирлянда
    for (const [x0, x1] of [[-2200, -300], [300, 2200]]) {
      far += Ln(`M${x0},-1700 Q${(x0 + x1) / 2},-1560 ${x1},-1700`, 4);
      for (let i = 1; i < 10; i++) { const k = i / 10, x = x0 + (x1 - x0) * k, y = -1700 + 140 * 4 * k * (1 - k); far += P(`M${f(x - 30)},${f(y)} L${f(x + 30)},${f(y)} L${f(x)},${f(y + 60)}Z`, ["#e85d75", "#f6d55c", "#5ab4e5", "#ffffff"][i % 4], 4); }
    }
    for (const x of [-3200, -2700, 2700, 3200]) far += `<g transform="translate(${x},-380) scale(1.25)">${R(-24, -380, 48, 380, "#8d6a52", 5)}${P("M0,-900 Q170,-880 190,-700 Q260,-600 170,-470 Q60,-380 0,-420 Q-60,-380 -170,-470 Q-260,-600 -190,-700 Q-170,-880 0,-900Z", "#79ad5c", 6)}</g>`;
    far += RF(-4200, -400, 8400, 3000, "#97bf6a") + Ln("M-4200,-400 L4200,-400", 6);
    far += F("M-4200,-400 L4200,-400 L4200,-300 L-4200,-300Z", "#8bb35f");
    // артқы көпшілік (түлектер, ата-аналар)
    const r = rng(5);
    let crowdBack = "";
    for (let row = 0; row < 2; row++) for (let i = 0; i < 26; i++) {
      const x = -3300 + i * 260 + (row ? 130 : 0) + (r() - 0.5) * 60;
      if (Math.abs(x + 1650) < 520 && row === 1) continue;
      crowdBack += crowdPerson(x, -330 + row * 70, 0.42, null, i * 13 + row * 7, { phone: true });
    }
    // сахна (сол жақ): подиум, микрофон, колонкалар
    let mid = crowdBack;
    mid += R(-2300, -470, 1300, 120, "#8d5a4a", 7, 4) + RF(-2300, -470, 1300, 30, "#b5413f");
    mid += R(-2380, -980, 200, 510, "#2d2f36", 6, 10) + C(-2280, -850, 60, "#55586a", 6) + C(-2280, -640, 80, "#55586a", 6);
    mid += R(-1120, -980, 200, 510, "#2d2f36", 6, 10) + C(-1020, -850, 60, "#55586a", 6) + C(-1020, -640, 80, "#55586a", 6);
    mid += R(-1800, -760, 300, 300, "#d6d1c6", 6, 6) + R(-1830, -790, 360, 40, "#b8b2a4", 6, 4) + T(-1650, -580, "★", 90, "#e6b544");
    // шар аркасы (оң жақ)
    return { far, mid, near: "" };
  };
  BG.arch = (popped, wob, x0) => {
    // шар аркасы; popped — жарылған шарлар саны (0..N)
    x0 = x0 == null ? 1500 : x0;
    const cols = ["#ffffff", "#5ab4e5", "#f6d55c", "#3f6fb5"];
    let s = "";
    const N = 30;
    for (let i = 0; i < N; i++) {
      const k = i / (N - 1), a = Math.PI * (1 - k);
      const x = x0 + Math.cos(a) * 560, y = -400 - Math.sin(a) * 900;
      const hit = popped > 0 && Math.abs(k - 0.08) < popped * 0.07;
      if (hit) continue;
      s += balloon(x + (i % 2) * 24, y + (i % 3) * 18, 70, cols[i % 4], i, wob);
    }
    return s;
  };
  BG.crowdFront = (seed, n, x0, gap, y, s) => {
    let g = "";
    for (let i = 0; i < n; i++) g += crowdPerson(x0 + i * gap, y, s, null, seed + i * 17, { phone: true });
    return g;
  };

  G.SONGY_BG = { BG, PROPS, bouquet, balloon, crowdPerson, windowFrame, P, F, Ln, R, RF, C, T, INK, rng, f };
})(typeof window !== "undefined" ? window : globalThis);
