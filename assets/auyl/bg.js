/* «Әжемнің ауылы» — фондар, жануарлар және заттар (таза SVG жолдары).
 * songy/bg.js-тің көмекшілерін қолданады (P, R, C, Ln ...). Еден сызығы y = 0. Кең план: камера (0, −380), zoom 1.
 * Жануарлар бүйірден, оңға қарап тұрады (flip = солға). t — уақыт (жүру, күйсеу, құйрық).
 */
(function (G) {
  "use strict";
  const B = G.SONGY_BG;
  const { P, F, Ln, RF, C, T, INK, rng, f, windowFrame, PROPS: SP } = B;
  const R = B.R;
  const grad = (id, stops, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 || 0}" y2="${y2 == null ? 1 : y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mixc = (a, b, k) => { const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = h(a), Bb = h(b); return "#" + A.map((v, i) => Math.round(lerp(v, Bb[i], k)).toString(16).padStart(2, "0")).join(""); };

  // ---------- аспан палитралары ----------
  const SKY = {
    day: ["#7cc0f0", "#bfe3fb", "#eaf7ff"],
    dawn: ["#8fa6d6", "#f3c6a5", "#ffe0a8"],
    evening: ["#5d7fc2", "#f2a873", "#ffd38a"],
    sunset: ["#3d4f9a", "#e8775a", "#ffc46b"],
    dusk: ["#1f2a5a", "#5a4a8a", "#c46f6a"],
    night: ["#0d1330", "#1b2550", "#2c3768"],
  };
  const skyDef = (id, k) => grad(id, [[0, SKY[k][0]], [0.6, SKY[k][1]], [1, SKY[k][2]]]);
  function stars(seed, n, x0, x1, y0, y1) {
    const r = rng(seed);
    let s = "";
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), rr = 2 + r() * 4; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#fff8dc" opacity="${f(0.5 + r() * 0.5)}"/>`; }
    return s;
  }
  const cloud = (x, y, s, col) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${P("M-120,0 Q-130,-70 -50,-70 Q-30,-130 40,-110 Q110,-130 130,-60 Q190,-40 160,0Z", col || "#ffffff", 5)}</g>`;
  const hills = (y, col, seed, amp, x0, x1) => {
    const r = rng(seed);
    let d = `M${x0},${y + 400} L${x0},${y}`;
    for (let x = x0; x <= x1; x += 300) d += ` Q${f(x + 150)},${f(y - amp * (0.4 + r()))} ${f(x + 300)},${f(y - amp * 0.15 * r())}`;
    d += ` L${x1 + 300},${y + 400}Z`;
    return P(d, col, 6);
  };
  const poplar = (x, y, s, col) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${R(-14, -260, 28, 260, "#7a5a44", 5)}${P("M0,-900 Q90,-760 80,-520 Q70,-300 0,-240 Q-70,-300 -80,-520 Q-90,-760 0,-900Z", col || "#5e9a4f", 6)}${Ln("M0,-800 L0,-300 M0,-600 L30,-660 M0,-500 L-30,-560", 4, mixc(col || "#5e9a4f", "#000000", 0.25))}</g>`;
  const pole = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${R(-12, -900, 24, 900, "#6d5a4a", 5)}${R(-110, -880, 220, 20, "#6d5a4a", 5)}${C(-90, -894, 9, "#e9e9ee", 4)}${C(90, -894, 9, "#e9e9ee", 4)}</g>`;

  // ---------- үй (ауылдық: ақ қабырға, көк терезе, жасыл шатыр) ----------
  function house(x, y, s, opts) {
    opts = opts || {};
    const wall = opts.wall || "#f2efe6", trim = opts.trim || "#3f7fc4", roof = opts.roof || "#4f8f6a";
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += R(-700, -720, 1400, 720, wall, 7);
    g += RF(-700, -120, 1400, 120, "#d9d2c2") + Ln("M-700,-120 L700,-120", 5);
    g += P("M-800,-700 L0,-1080 L800,-700Z", roof, 7);
    for (let i = 1; i < 8; i++) g += Ln(`M${f(-800 + i * 100)},${f(-700 - 47.5 * i)} L${f(-800 + i * 100)},-700 M${f(800 - i * 100)},${f(-700 - 47.5 * i)} L${f(800 - i * 100)},-700`, 3, mixc(roof, "#000000", 0.2));
    g += R(-90, -860, 180, 120, "#e6e0d0", 5) + Ln("M0,-860 L0,-740 M-90,-800 L90,-800", 4);
    for (const wx of [-460, 300]) {
      const win = opts.night ? "#ffd27a" : "#a9d3f0";
      g += R(wx - 30, -560, 220, 290, trim, 6, 4);
      g += RF(wx, -530, 160, 230, win);
      g += Ln(`M${wx + 80},-530 L${wx + 80},-300 M${wx},-450 L${wx + 160},-450`, 8, "#ffffff");
      g += P(`M${wx - 40},-580 L${wx + 80},-640 L${wx + 200},-580Z`, trim, 5);
      for (let k = 0; k < 3; k++) g += C(wx + 30 + k * 50, -605, 7, "#ffffff", 3);
      g += R(wx - 50, -270, 260, 26, trim, 5, 3);
      if (opts.night) g += `<rect x="${wx}" y="-530" width="160" height="230" fill="#ffe7a8" opacity="0.35"/>`;
    }
    // есік
    g += R(-170, -560, 200, 560, "#8d5a3e", 6, 4) + R(-150, -530, 160, 220, "#a06a4a", 4) + C(0, -270, 10, "#d6b04a", 4);
    g += R(-200, -40, 260, 40, "#bdb6a6", 5);
    g += `</g>`;
    return g;
  }
  // қоршау (штакетник), x0..x1, қақпасы бар/жоқ
  function fence(x0, x1, y, col, gate, h) {
    h = h || 300;
    col = col || "#3f7fc4";
    let s = R(x0, y - h * 0.78, x1 - x0, 22, col, 5) + R(x0, y - h * 0.3, x1 - x0, 22, col, 5);
    for (let x = x0 + 10; x < x1; x += 56) {
      if (gate && x > gate[0] && x < gate[1]) continue;
      s += P(`M${x},${y} L${x},${y - h + 20} L${x + 19},${y - h} L${x + 38},${y - h + 20} L${x + 38},${y}Z`, col, 5);
    }
    return s;
  }
  function gateAt(x, y, open, col) {
    // қақпа (ашылу 0..1), ені 320
    col = col || "#3f7fc4";
    const w = 320 * (1 - 0.8 * open);
    let s = R(x - 30, y - 380, 30, 380, "#5d6a7a", 5) + R(x + 320, y - 380, 30, 380, "#5d6a7a", 5);
    s += P(`M${x},${y - 330} L${f(x + w)},${f(y - 330 - 40 * open)} L${f(x + w)},${f(y - 10 + 30 * open)} L${x},${y - 10}Z`, col, 6);
    s += Ln(`M${x + 10},${y - 250} L${f(x + w - 10)},${f(y - 250 - 30 * open)} M${x + 10},${y - 90} L${f(x + w - 10)},${f(y - 90 + 20 * open)}`, 5, mixc(col, "#000000", 0.25));
    return s;
  }
  function bench(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)})">${R(-300, -230, 600, 40, "#a0764f", 6, 4)}${R(-280, -190, 30, 190, "#7a5a44", 5)}${R(250, -190, 30, 190, "#7a5a44", 5)}${R(-300, -380, 600, 34, "#a0764f", 6, 4)}${R(-280, -380, 26, 160, "#7a5a44", 5)}${R(254, -380, 26, 160, "#7a5a44", 5)}</g>`;
  }
  function haystack(x, y, s, col) {
    // шөп маясы: дөңгелек төбе, сабан сызықтары
    col = col || "#e3b85a";
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += P("M-520,0 Q-560,-260 -430,-480 Q-300,-700 0,-720 Q300,-700 430,-480 Q560,-260 520,0Z", col, 7);
    const r = rng(41);
    for (let i = 0; i < 46; i++) { const a = -0.2 - r() * 2.7, d = 160 + r() * 380; const x1 = Math.cos(a) * d * 0.95, y1 = Math.sin(a) * d * 0.95 * 1.3; if (y1 > -10) continue; g += Ln(`M${f(x1)},${f(y1)} l${f(-10 + r() * 20)},${f(30 + r() * 30)}`, 4, mixc(col, "#7a5a20", 0.45)); }
    g += P("M-500,-120 Q0,-170 500,-120", "none", 4) + Ln("M-500,-120 Q0,-170 500,-120", 5, mixc(col, "#7a5a20", 0.4));
    g += P("M-80,-720 Q0,-790 60,-720", "none", 6);
    g += `</g>`;
    return g;
  }
  function well(x, y, s) {
    // су колонкасы (ауылдық)
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)})">${R(-40, -520, 80, 520, "#4d5a6a", 6, 6)}${R(-60, -560, 120, 50, "#5d6a7a", 5, 8)}${P("M40,-400 L150,-390 L150,-350 L40,-360Z", "#4d5a6a", 5)}${P("M-40,-500 L-200,-620 L-180,-640 L-30,-530Z", "#4d5a6a", 5)}${R(-120, -30, 240, 30, "#8b8f99", 5)}</g>`;
  }
  function bucket(x, y, s, water, tilt) {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)}) rotate(${f(tilt || 0)})">`;
    g += P("M-70,-150 L70,-150 L56,0 L-56,0Z", "#b8bec8", 6);
    g += Ln("M-66,-110 L66,-110 M-60,-50 L60,-50", 4, "#9aa1ad");
    if (water) g += `<ellipse cx="0" cy="-146" rx="64" ry="14" fill="#7fc3ea" stroke="${INK}" stroke-width="4"/>`;
    g += P("M-70,-150 Q0,-290 70,-150", "none", 6);
    g += `</g>`;
    return g;
  }
  // ---------- ішкі бөлме: кілем, терезе, дастарқан ----------
  function carpet(x, y, w, h, c1, c2) {
    c1 = c1 || "#a8323e"; c2 = c2 || "#f2c14e";
    let s = R(x, y, w, h, c1, 7, 6);
    s += R(x + 30, y + 30, w - 60, h - 60, "none", 5) + `<rect x="${x + 30}" y="${y + 30}" width="${w - 60}" height="${h - 60}" fill="none" stroke="${c2}" stroke-width="10"/>`;
    // ою (қошқар мүйіз) — ортада және бұрыштарда
    const orn = (cx, cy, sc) => `<g transform="translate(${f(cx)},${f(cy)}) scale(${f(sc)})">${Ln("M0,40 L0,-10 M0,-10 Q-10,-60 -50,-50 Q-80,-30 -50,-6 M0,-10 Q10,-60 50,-50 Q80,-30 50,-6 M0,40 Q-30,60 -60,40 M0,40 Q30,60 60,40", 9, c2)}</g>`;
    s += orn(x + w / 2, y + h / 2, 1.6) + orn(x + w / 2, y + h / 2 + 160, 0.9) + orn(x + w / 2, y + h / 2 - 160, 0.9);
    for (const [ax, ay] of [[0.2, 0.22], [0.8, 0.22], [0.2, 0.78], [0.8, 0.78]]) s += orn(x + w * ax, y + h * ay, 0.8);
    s += P(`M${x + w / 2 - 200},${y + h / 2} L${x + w / 2},${y + h / 2 - 260} L${x + w / 2 + 200},${y + h / 2} L${x + w / 2},${y + h / 2 + 260}Z`, "none", 5) + `<path d="M${x + w / 2 - 200},${y + h / 2} L${x + w / 2},${y + h / 2 - 260} L${x + w / 2 + 200},${y + h / 2} L${x + w / 2},${y + h / 2 + 260}Z" fill="none" stroke="${c2}" stroke-width="6"/>`;
    for (let i = 0; i < Math.floor(w / 40); i++) s += Ln(`M${x + 20 + i * 40},${y + h} l0,26`, 4, c2);
    return s;
  }
  // тағам
  const FOOD = {
    baursak: (x, y, s, seed) => { const r = rng(seed || 1); let g = ""; for (let i = 0; i < 7; i++) { const a = (r() - 0.5) * 120, b = -r() * 70; g += P(`M${f(x + a - 34 * s)},${f(y + b)} Q${f(x + a - 40 * s)},${f(y + b - 50 * s)} ${f(x + a)},${f(y + b - 54 * s)} Q${f(x + a + 40 * s)},${f(y + b - 50 * s)} ${f(x + a + 34 * s)},${f(y + b)} Q${f(x + a)},${f(y + b + 10 * s)} ${f(x + a - 34 * s)},${f(y + b)}Z`, "#e0a24a", 4); } return g; },
    kazy: (x, y, s) => { let g = ""; for (let i = 0; i < 6; i++) g += `<ellipse cx="${f(x - 90 * s + i * 36 * s)}" cy="${f(y - (i % 2) * 12)}" rx="${f(26 * s)}" ry="${f(22 * s)}" fill="#8a3a3a" stroke="${INK}" stroke-width="4"/><ellipse cx="${f(x - 90 * s + i * 36 * s)}" cy="${f(y - (i % 2) * 12)}" rx="${f(12 * s)}" ry="${f(9 * s)}" fill="#f4e3d0"/>`; return g; },
    salad: (x, y, s) => P(`M${f(x - 90 * s)},${f(y)} Q${f(x)},${f(y - 90 * s)} ${f(x + 90 * s)},${f(y)}Z`, "#6fb35a", 4) + C(x - 30 * s, y - 30 * s, 16 * s, "#e8574a", 3) + C(x + 26 * s, y - 34 * s, 14 * s, "#e8574a", 3) + C(x, y - 50 * s, 12 * s, "#f6d55c", 3),
    jam: (x, y, s) => R(x - 40 * s, y - 90 * s, 80 * s, 90 * s, "#c43a4a", 4, 10) + R(x - 44 * s, y - 104 * s, 88 * s, 20 * s, "#e9e4d6", 4, 4),
    kese: (x, y, s, tea) => P(`M${f(x - 46 * s)},${f(y - 50 * s)} Q${f(x - 46 * s)},${f(y)} ${f(x)},${f(y)} Q${f(x + 46 * s)},${f(y)} ${f(x + 46 * s)},${f(y - 50 * s)}Z`, "#ffffff", 4) + Ln(`M${f(x - 40 * s)},${f(y - 30 * s)} Q${f(x)},${f(y - 20 * s)} ${f(x + 40 * s)},${f(y - 30 * s)}`, 6 * s, "#3f7fc4") + (tea ? `<ellipse cx="${f(x)}" cy="${f(y - 50 * s)}" rx="${f(42 * s)}" ry="${f(9 * s)}" fill="#c98a4a"/>` : ""),
    teapot: (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${P("M-80,-10 Q-110,-120 0,-130 Q110,-120 80,-10Z", "#ffffff", 6)}${P("M80,-70 Q140,-90 150,-140", "none", 14)}${Ln("M80,-70 Q140,-90 150,-140", 6, "#ffffff")}${P("M-80,-90 Q-140,-80 -110,-30", "none", 6)}${R(-30, -150, 60, 22, "#3f7fc4", 5, 8)}${Ln("M-70,-60 Q0,-40 70,-60", 8, "#3f7fc4")}</g>`,
  };
  function plate(x, y, s, pile) {
    // табақ + үйінді (pile 0..3)
    let g = `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(140 * s)}" ry="${f(34 * s)}" fill="#ffffff" stroke="${INK}" stroke-width="5"/><ellipse cx="${f(x)}" cy="${f(y - 4)}" rx="${f(100 * s)}" ry="${f(20 * s)}" fill="none" stroke="#3f7fc4" stroke-width="4"/>`;
    const L = Math.floor(pile + 1e-6);
    if (pile > 0) g += FOOD.baursak(x, y - 10 * s, s * 1.1, 3);
    if (pile > 1) g += FOOD.kazy(x, y - 110 * s, s * 1.1);
    if (pile > 2) g += FOOD.salad(x, y - 150 * s, s * 1.3);
    if (pile > 3) g += FOOD.baursak(x, y - 200 * s, s, 9);
    if (L >= 5) g += FOOD.kazy(x, y - 300 * s, s);
    return g;
  }
  function platter(x, y, s) {
    // үлкен табақ ет (бешбармақ): қамыр, ет, қазы, пияз
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += `<ellipse cx="0" cy="0" rx="330" ry="80" fill="#e9ecef" stroke="${INK}" stroke-width="7"/><ellipse cx="0" cy="-8" rx="270" ry="56" fill="#f4e7c9" stroke="${INK}" stroke-width="4"/>`;
    const r = rng(77);
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = r() * 170; g += P(`M${f(Math.cos(a) * d - 50)},${f(Math.sin(a) * d * 0.25 - 40)} q30,-50 90,-30 q30,30 -10,46 q-50,14 -80,-16Z`, ["#b36a4a", "#c47a55", "#9a5a3e"][i % 3], 4); }
    g += FOOD.kazy(-40, -110, 1.2) + FOOD.kazy(60, -150, 1);
    g += C(0, -200, 40, "#f2f2f2", 5) + Ln("M-20,-190 Q0,-170 20,-190", 4);
    for (let i = 0; i < 10; i++) g += Ln(`M${f(-200 + i * 44)},${f(-40 - (i % 3) * 18)} q10,-14 20,0`, 4, "#ffffff");
    g += `</g>`;
    return g;
  }

  // ---------- жануарлар ----------
  // сиыр/бұқа бүйірден (оңға). o: {col, spots, mark, horns, bull, lashes, bell, walk(фаза), chew, tail, head(бұрылу 0..1 — камераға), angry, steam}
  function cow(x, y, s, o, t) {
    o = o || {};
    t = t || 0;
    const col = o.col || "#a0623a", dark = mixc(col, "#000000", 0.25);
    const bull = !!o.bull;
    const ph = o.walk == null ? null : o.walk;
    const legA = (i) => (ph == null ? 0 : Math.sin(ph * 6.283 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 18);
    const bob = ph == null ? 0 : Math.abs(Math.sin(ph * 6.283 * 2)) * 8;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * (o.flip ? -1 : 1))},${f(s)})">`;
    // алыстағы аяқтар
    const leg = (lx, i, far) => {
      const a = legA(i) * Math.PI / 180;
      const x1 = lx + Math.sin(a) * 250, y1 = -Math.cos(a) * 250 + 250;
      const w = bull ? 66 : 54;
      return Ln(`M${lx},-260 L${f(x1)},${f(-10 + (y1 - 250) * 0.2)}`, w + 12, INK) + Ln(`M${lx},-260 L${f(x1)},${f(-10 + (y1 - 250) * 0.2)}`, w, far ? dark : col) + `<rect x="${f(x1 - w / 2 - 2)}" y="-36" width="${f(w + 4)}" height="36" rx="6" fill="#2d2522" stroke="${INK}" stroke-width="5"/>`;
    };
    g += leg(-230, 1, true) + leg(260, 3, true);
    // құйрық
    const sw = Math.sin(t * 2.2 + (o.seed || 0)) * 14;
    g += Ln(`M-350,-500 Q${f(-420 + sw * 0.5)},-420 ${f(-400 + sw)},-280`, 14, INK) + Ln(`M-350,-500 Q${f(-420 + sw * 0.5)},-420 ${f(-400 + sw)},-280`, 7, col);
    g += P(`M${f(-400 + sw)},-300 q-24,30 -8,70 q22,-14 30,-6 q4,-40 -22,-64Z`, "#2d2522", 5);
    // дене
    const hump = bull ? -90 : 0;
    const body = `M-360,-430 Q-372,-560 -250,-570 Q-20,${-590 + hump * 0.4} 200,${-590 + hump} Q330,${-590 + hump * 0.6} 340,-470 Q350,-330 280,-270 Q40,-230 -220,-262 Q-360,-280 -360,-430Z`;
    g += `<g transform="translate(0,${f(-bob)})">`;
    g += P(body, col, 7);
    if (o.spots) {
      const id = "cw" + (o.uid || 0);
      g += `<clipPath id="${id}"><path d="${body}"/></clipPath><g clip-path="url(#${id})">${P("M-200,-600 Q-90,-560 -120,-470 Q-170,-400 -260,-460 Q-300,-540 -200,-600Z", o.spots, 0)}${P("M60,-600 Q190,-560 140,-430 Q60,-360 0,-450 Q-10,-560 60,-600Z", o.spots, 0)}${P("M-60,-320 Q20,-360 80,-300 Q40,-250 -40,-260Z", o.spots, 0)}</g>`;
      g += P(body, "none", 7);
    }
    if (!bull) g += P("M-160,-262 Q-150,-210 -110,-206 Q-70,-210 -60,-258Z", "#f2a0a8", 5) + Ln("M-140,-214 l0,16 M-110,-208 l0,18 M-80,-214 l0,16", 5);
    g += Ln("M-200,-420 Q-150,-440 -110,-400", 4, dark) + Ln("M150,-480 Q190,-440 170,-380", 4, dark);
    g += `</g>`;
    // жақын аяқтар
    g += leg(-190, 0, false) + leg(300, 2, false);
    // бас
    const turn = clamp(o.head || 0, 0, 1);
    const chew = o.chew ? Math.sin(t * 9) * 5 : 0;
    const hx = lerp(390, 330, turn), hy = -560 + (o.headY || 0) - bob;
    const hs = o.headS || (bull ? 1.3 : 1);
    g += `<g transform="translate(${f(hx)},${f(hy + (bull ? 40 : 0))}) rotate(${f(o.headRot || 0)}) scale(${f(hs)})">`;
    // мойын
    g += P(`M-150,${f(-40)} Q-60,-70 0,-60 L40,90 Q-80,120 -170,80Z`, col, 7);
    if (bull) g += P("M-130,-70 Q-60,-120 20,-80 L0,-40 Q-70,-70 -120,-30Z", col, 6);
    // құлақ
    g += P(`M-30,-60 Q-100,-110 -120,-70 Q-90,-40 -20,-30Z`, col, 6) + P("M-40,-56 Q-90,-84 -104,-70 Q-80,-52 -36,-44Z", "#f2a0a8", 0);
    // мүйіз
    if (o.horns) {
      const hc = o.horns === true ? "#efe6cf" : o.horns;
      const big = bull ? 1.6 : 1;
      const horn = (x0, y0, cx, cy, tx, ty, w, c) => Ln(`M${x0},${y0} Q${f(cx)},${f(cy)} ${f(tx)},${f(ty)}`, w + 12, INK) + Ln(`M${x0},${y0} Q${f(cx)},${f(cy)} ${f(tx)},${f(ty)}`, w, c) + Ln(`M${f(lerp(x0, tx, 0.75))},${f(lerp(y0, ty, 0.8))} L${f(tx)},${f(ty)}`, w * 0.55, c);
      g += horn(10, -86, -40 * big, -110 * big, -50 * big, -150 * big, bull ? 30 : 22, mixc(hc, "#000000", 0.1));
      g += horn(52, -96, 90 + 30 * big, -120 * big, 70 + 40 * big, -160 * big, bull ? 30 : 22, hc);
    }
    // бет
    const face = `M-30,-90 Q60,-110 110,-60 Q160,30 160,110 Q160,170 90,176 Q10,180 -10,120 Q-40,20 -30,-90Z`;
    g += P(face, col, 7);
    // ақ таңба
    if (o.mark !== false) g += P("M96,-84 Q128,-52 132,-10 Q130,26 116,46 Q98,18 90,-16 Q84,-56 96,-84Z", o.mark || "#ffffff", 5);
    // тұмсық
    g += `<g transform="translate(0,${f(chew * 0.4)})">` + P("M10,100 Q80,70 160,96 Q186,150 140,180 Q60,196 20,170 Q-4,140 10,100Z", o.muzzle || "#f0b0b4", 6) + C(100, 128, 9, INK, 0) + C(146, 124, 8, INK, 0) + Ln(`M60,${f(170 + chew)} Q100,${f(180 + chew)} 140,${f(168 + chew)}`, 4) + `</g>`;
    if (o.ring) g += `<path d="M118,140 Q130,196 160,176" fill="none" stroke="${o.ring}" stroke-width="10" stroke-linecap="round"/><path d="M118,140 Q130,196 160,176" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`;
    // көз
    const eo = o.eye || {};
    const ex = lerp(36, 60, turn), ey = 4;
    g += `<ellipse cx="${ex}" cy="${ey}" rx="30" ry="${f(26 * (1 - (eo.lid || 0) * 0.8))}" fill="${o.angry ? "#ffe2e2" : "#ffffff"}" stroke="${INK}" stroke-width="5"/>`;
    g += C(ex + 6 + (eo.px || 0) * 10, ey + 4 + (eo.py || 0) * 8, o.angry ? 6 : 9, o.angry ? "#c62828" : INK, 0);
    if (eo.lid) g += P(`M${ex - 32},${ey - 26} L${ex + 32},${ey - 26} L${ex + 32},${f(ey - 26 + 52 * eo.lid)} L${ex - 32},${f(ey - 26 + 52 * eo.lid)}Z`, col, 0) + Ln(`M${ex - 32},${f(ey - 26 + 52 * eo.lid)} L${ex + 32},${f(ey - 26 + 52 * eo.lid)}`, 5);
    if (o.lashes) g += Ln(`M${ex + 22},${ey - 22} l12,-14 M${ex + 30},${ey - 12} l16,-8 M${ex + 12},${ey - 26} l6,-16`, 4);
    if (o.angry) g += Ln(`M${ex - 30},${ey - 40} L${ex + 34},${ey - 22}`, 12);
    g += `</g>`;
    // қоңырау
    if (o.bell) g += `<g transform="translate(${f(hx - 90)},${f(hy + 110)})">${Ln("M-40,-20 Q0,10 40,-20", 6, "#7a5a44")}${P("M-20,0 L20,0 L28,50 L-28,50Z", "#d6b04a", 5)}</g>`;
    // бу (бұқа)
    if (o.steam) {
      for (let i = 0; i < 2; i++) {
        const k = ((t * 1.6 + i * 0.5) % 1);
        g += `<circle cx="${f(hx + 150 * hs + k * 140)}" cy="${f(hy + (bull ? 40 : 0) + 150 * hs + k * 30)}" r="${f(18 + 40 * k)}" fill="#ffffff" opacity="${f(0.8 * (1 - k) * o.steam)}" stroke="${INK}" stroke-width="${f(3 * (1 - k))}"/>`;
      }
    }
    g += `</g>`;
    return g;
  }
  // сиырдың алдынан көрінісі (бас), «барлығында ақ таңба»
  function cowFace(x, y, s, col, o) {
    o = o || {};
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += P("M-90,-40 Q-200,-90 -220,-20 Q-170,10 -90,0Z", col, 6) + P("M90,-40 Q200,-90 220,-20 Q170,10 90,0Z", col, 6);
    if (o.horns) g += P("M-70,-90 Q-120,-170 -60,-190 Q-80,-140 -40,-100Z", "#efe6cf", 5) + P("M70,-90 Q120,-170 60,-190 Q80,-140 40,-100Z", "#efe6cf", 5);
    g += P("M-110,-90 Q0,-130 110,-90 Q130,60 80,150 Q0,190 -80,150 Q-130,60 -110,-90Z", col, 7);
    g += P("M0,-110 Q34,-60 26,-10 Q14,30 0,40 Q-14,30 -26,-10 Q-34,-60 0,-110Z", "#ffffff", 5);
    g += `<ellipse cx="-56" cy="10" rx="24" ry="22" fill="#fff" stroke="${INK}" stroke-width="5"/><ellipse cx="56" cy="10" rx="24" ry="22" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
    g += C(-52 + (o.px || 0) * 8, 14, 8, INK, 0) + C(60 + (o.px || 0) * 8, 14, 8, INK, 0);
    g += P("M-90,90 Q0,60 90,90 Q110,170 0,190 Q-110,170 -90,90Z", "#f0b0b4", 6) + C(-36, 130, 10, INK, 0) + C(36, 130, 10, INK, 0);
    g += `</g>`;
    return g;
  }
  // әтеш (бүйірден, оңға). o: {crow 0..1, run фаза, flip, angry}
  function rooster(x, y, s, o, t) {
    o = o || {};
    const crow = clamp(o.crow || 0, 0, 1);
    const ph = o.run;
    const legs = ph == null ? [0, 0] : [Math.sin(ph * 6.283) * 30, -Math.sin(ph * 6.283) * 30];
    const hop = ph == null ? 0 : Math.abs(Math.sin(ph * 6.283)) * 14;
    let g = `<g transform="translate(${f(x)},${f(y - hop * s)}) scale(${f(s * (o.flip ? -1 : 1))},${f(s)})">`;
    for (const [i, a] of legs.entries()) {
      const r = a * Math.PI / 180, lx = i ? 14 : -14;
      g += Ln(`M${lx},-90 L${f(lx + Math.sin(r) * 90)},${f(-90 + Math.cos(r) * 90)}`, 8, "#e6a23a") + Ln(`M${f(lx + Math.sin(r) * 90)},${f(-90 + Math.cos(r) * 90)} l24,0 M${f(lx + Math.sin(r) * 90)},${f(-90 + Math.cos(r) * 90)} l-14,2`, 6, "#e6a23a");
    }
    // құйрық
    g += P("M-60,-190 Q-170,-330 -130,-380 Q-90,-300 -40,-240Z", "#1f4a3a", 5) + P("M-70,-180 Q-200,-260 -190,-320 Q-120,-260 -50,-210Z", "#2f6a4a", 5) + P("M-70,-160 Q-190,-170 -210,-230 Q-130,-210 -60,-190Z", "#1f4a3a", 5);
    // дене
    g += P("M-90,-180 Q-100,-90 0,-80 Q90,-90 90,-170 Q80,-240 20,-250 Q-80,-250 -90,-180Z", "#d9692c", 6);
    g += P("M-40,-180 Q0,-120 50,-160", "none", 4) + P("M-60,-190 Q-20,-140 30,-150 Q0,-200 -60,-190Z", "#b8522a", 4);
    // мойын + бас
    const hr = -crow * 30;
    g += `<g transform="translate(40,-230) rotate(${f(hr)})">`;
    g += P("M-30,0 Q-20,-90 30,-110 Q80,-100 70,-40 Q60,10 20,20Z", "#e98a3a", 6);
    g += P("M0,-110 Q6,-150 24,-130 Q34,-160 50,-128 Q66,-150 70,-112 Q60,-96 0,-104Z", "#d8323a", 5);
    const bo = crow * 26;
    g += P(`M68,-80 L110,${f(-70 - bo * 0.3)} L70,-62Z`, "#f2b632", 4) + P(`M68,-62 L104,${f(-50 + bo)} L66,-50Z`, "#f2b632", 4);
    g += P("M60,-44 Q70,-10 52,-6 Q44,-24 50,-44Z", "#d8323a", 4);
    g += C(42, -78, 10, "#ffffff", 4) + C(45, -78, 4.5, INK, 0);
    if (o.angry) g += Ln("M28,-96 L58,-86", 6);
    g += `</g>`;
    g += `</g>`;
    return g;
  }
  function goose(x, y, s, o, t) {
    o = o || {};
    const flap = o.flap ? Math.sin((t || 0) * 22 + (o.seed || 0)) : 0;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * (o.flip ? -1 : 1))},${f(s)})">`;
    g += Ln("M-10,-60 L-20,0 M20,-60 L30,0", 7, "#f08a2a");
    g += P("M-110,-120 Q-120,-50 -10,-50 Q90,-50 90,-110 Q60,-170 -40,-160 Q-100,-160 -110,-120Z", "#ffffff", 6);
    g += P(`M-50,-140 Q-10,${f(-200 - flap * 70)} 50,${f(-150 - flap * 40)} Q20,-120 -50,-140Z`, "#eef0f4", 5);
    g += Ln("M60,-130 Q90,-200 80,-250", 30, INK) + Ln("M60,-130 Q90,-200 80,-250", 22, "#ffffff");
    g += C(84, -262, 26, "#ffffff", 6) + P("M104,-268 L150,-256 L104,-246Z", "#f08a2a", 4) + C(90, -268, 5, INK, 0);
    g += `</g>`;
    return g;
  }
  function sheep(x, y, s, o, t) {
    o = o || {};
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * (o.flip ? -1 : 1))},${f(s)})">`;
    g += Ln("M-60,-80 L-64,0 M-20,-80 L-24,0 M40,-80 L44,0 M80,-80 L84,0", 12, "#2d2522");
    const r = rng(o.seed || 3);
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; g += C(Math.cos(a) * 90, -150 + Math.sin(a) * 50, 48 + r() * 10, "#f4f1ea", 5); }
    g += `<ellipse cx="0" cy="-150" rx="100" ry="60" fill="#f4f1ea"/>`;
    g += P("M90,-200 Q150,-210 160,-150 Q150,-100 100,-110 Q80,-150 90,-200Z", "#2d2522", 5) + C(130, -165, 8, "#ffffff", 0) + C(132, -165, 4, INK, 0);
    if (o.baa) g += P("M148,-128 Q160,-112 170,-126", "none", 4);
    g += `</g>`;
    return g;
  }
  // үлкен сөмке (әженің сыйы)
  function bag(x, y, s) {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    g += FOOD.kazy(-60, -560, 1.2) + `<g transform="translate(60,-600) rotate(10)">${FOOD.jam(0, 0, 1.4)}</g>` + FOOD.baursak(-20, -540, 1, 5);
    g += P("M-200,-520 Q-230,-260 -200,0 L200,0 Q230,-260 200,-520 Q0,-560 -200,-520Z", "#3f6fb5", 7);
    g += Ln("M-200,-420 L200,-420 M-200,-220 L200,-220", 6, "#ffffff") + Ln("M-120,-520 Q-100,-700 0,-700 Q100,-700 120,-520", 12);
    g += `</g>`;
    return g;
  }
  const PROPS = {
    rope: (len) => Ln(`M0,30 q${f(len * 0.3)},${f(len * 0.4)} ${f(len)},${f(len * 0.2)}`, 7, "#b58a4a"),
    cane: () => `<g transform="translate(0,26)">${Ln("M0,0 L0,330", 16, INK)}${Ln("M0,0 L0,330", 9, "#8d5a3e")}${Ln("M0,0 Q0,-40 -40,-36", 16, INK)}${Ln("M0,0 Q0,-40 -40,-36", 9, "#8d5a3e")}</g>`,
    bucket: (water) => `<g transform="translate(0,175) scale(0.9)">${bucket(0, 0, 1, water)}</g>`,
    kese: () => `<g transform="translate(0,40)">${FOOD.kese(0, 20, 1, true)}</g>`,
    teapot: () => `<g transform="translate(-10,150) scale(0.8)">${FOOD.teapot(0, 0, 1)}</g>`,
    phone: SP.phone,
  };

  // ---------- фондар ----------
  const BG = B.BG;
  // ауылдың шеті: жол, үй, қоршау, қақпа (келу / кету)
  BG.aulRoad = (sky) => {
    sky = sky || "day";
    let far = `<defs>${skyDef("arSky" + sky, sky)}</defs>` + RF(-4000, -3000, 8000, 3000, `url(#arSky${sky})`);
    for (const [x, y, s] of [[-2600, -2200, 1.3], [-500, -2400, 1.0], [1700, -2250, 1.2], [3200, -2000, 0.9]]) far += cloud(x, y, s);
    far += hills(-700, "#a7c98a", 3, 260, -4200, 4200) + hills(-520, "#93bb72", 7, 180, -4200, 4200);
    for (const x of [-3000, -2600, 2700, 3100]) far += poplar(x, -500, 0.9);
    far += house(1300, -380, 1.05);
    far += poplar(2350, -380, 1.1, "#4f8f45");
    far += RF(-4000, -380, 8000, 2600, "#9fbf72") + Ln("M-4000,-380 L4000,-380", 6);
    let mid = F("M-4000,-120 L4000,-120 L4000,200 L-4000,200Z", "#c9b48f") + Ln("M-4000,-120 L4000,-120 M-4000,200 L4000,200", 5, "#a8936e");
    mid += fence(220, 2600, -380, "#3f7fc4", [1180, 1520], 320);
    mid += pole(-1500, -380, 1.1);
    return { far, mid, near: "" };
  };
  BG.room = (night) => {
    let far = RF(-2600, -1800, 5200, 1800, "#efe3cf");
    for (let x = -2600; x < 2600; x += 110) far += Ln(`M${x},-1800 L${x},-300`, 3, "#e6d6bd");
    far += RF(-2600, -300, 5200, 300, "#d9c7a8") + Ln("M-2600,-300 L2600,-300", 6);
    far += carpet(-900, -1500, 1800, 1100);
    far += windowFrame(1300, -1350, 460, 560, night ? "#1b2550" : "#bfe3fb", { frame: "#ffffff", inner: night ? "" : P("M1300,-950 Q1420,-1040 1520,-980 Q1620,-1030 1760,-960 L1760,-790 L1300,-790Z", "#9cc77f", 0) });
    // тюль
    far += P("M1280,-1370 Q1350,-1100 1290,-760 L1250,-760 L1250,-1370Z", "#ffffff", 4, ' opacity="0.85"') + P("M1780,-1370 Q1710,-1100 1770,-760 L1810,-760 L1810,-1370Z", "#ffffff", 4, ' opacity="0.85"');
    // сағат
    far += C(-1500, -1200, 110, "#ffffff", 7);
    // теледидар (ескі)
    far += R(-2100, -900, 420, 330, "#6b5a4a", 7, 18) + R(-2060, -860, 300, 250, "#3a3f4c", 5, 22) + R(-2200, -570, 620, 50, "#8d6a52", 6, 4) + R(-2180, -520, 30, 220, "#8d6a52", 5) + R(-1640, -520, 30, 220, "#8d6a52", 5);
    far += RF(-2600, 0, 5200, 900, "#b98e6a") + Ln("M-2600,0 L2600,0", 6);
    // еден кілемі
    far += P("M-2000,30 L2000,30 L2400,600 L-2400,600Z", "#a8323e", 6) + Ln("M-1900,80 L1900,80 L2250,560 L-2250,560Z", 8, "#f2c14e");
    return { far, mid: "", near: "" };
  };
  BG.clockHands = (cx, cy, h, m) => Ln(`M${cx},${cy} L${f(cx + Math.sin(h) * 60)},${f(cy - Math.cos(h) * 60)}`, 10) + Ln(`M${cx},${cy} L${f(cx + Math.sin(m) * 90)},${f(cy - Math.cos(m) * 90)}`, 6) + C(cx, cy, 8, INK, 0);
  // дастарқан (аласа дөңгелек үстел) — алдыңғы план заты
  BG.table = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><ellipse cx="0" cy="-150" rx="760" ry="120" fill="#c99b6d" stroke="${INK}" stroke-width="7"/><ellipse cx="0" cy="-158" rx="700" ry="100" fill="#ffffff" stroke="${INK}" stroke-width="4"/>${Ln("M-700,-158 Q0,-30 700,-158", 4, "#e85d75")}${P("M-760,-150 L-760,-80 Q0,40 760,-80 L760,-150 Q0,-30 -760,-150Z", "#a8794f", 6)}</g>`;
  BG.korpe = (x, y, w, col) => R(x - w / 2, y - 60, w, 60, col || "#3f6fb5", 6, 18) + Ln(`M${f(x - w / 2 + 30)},${y - 30} L${f(x + w / 2 - 30)},${y - 30}`, 4, "#f2c14e");

  BG.bedroomV = (sky) => {
    let far = `<defs>${skyDef("bvSky", sky || "dawn")}</defs>`;
    far += RF(-2400, -1700, 4800, 1700, "#e8dccb");
    far += carpet(-1300, -1450, 1300, 900, "#7a2f45", "#e6b544");
    far += windowFrame(400, -1250, 460, 520, "url(#bvSky)", { frame: "#ffffff", inner: `<circle cx="700" cy="-830" r="50" fill="#ffe2a6"/>` + P("M400,-800 Q520,-880 620,-820 Q720,-860 860,-800 L860,-730 L400,-730Z", "#8fa3c4", 0) });
    far += RF(-2400, 0, 4800, 700, "#b98e6a") + Ln("M-2400,0 L2400,0", 6);
    // темір кереует
    let mid = Ln("M-1400,-560 L-1400,0 M-1400,-560 Q-1300,-640 -1200,-560 M-1300,-600 L-1300,-280", 12, "#5d6a7a") + Ln("M-1400,-560 L-1400,0 M-1400,-560 Q-1300,-640 -1200,-560", 6, "#8b95a5");
    for (let x = -1380; x < -1200; x += 40) mid += Ln(`M${x},-540 L${x},-300`, 5, "#8b95a5");
    mid += R(-1420, -330, 1500, 90, "#8b95a5", 6, 4) + R(-1400, -420, 1460, 100, "#f6f2ea", 6, 20) + R(60, -560, 30, 560, "#8b95a5", 5);
    return { far, mid, near: "" };
  };

  BG.yardV = (sky, opts) => {
    opts = opts || {};
    sky = sky || "day";
    const night = sky === "night" || sky === "dusk";
    let far = `<defs>${skyDef("yvSky" + sky, sky)}</defs>` + RF(-4200, -3200, 8400, 3200, `url(#yvSky${sky})`);
    if (night) far += stars(5, 90, -4000, 4000, -3100, -1200) + `<circle cx="1800" cy="-2300" r="120" fill="#fff6d0" stroke="${INK}" stroke-width="6"/>`;
    else for (const [x, y, s] of [[-2400, -2400, 1.3], [400, -2600, 1.0], [2600, -2300, 1.2]]) far += cloud(x, y, s);
    far += hills(-900, night ? "#2f3d5a" : "#a7c98a", 5, 220, -4400, 4400);
    far += house(-1100, -560, 1.25, { night });
    far += `<g transform="translate(1600,-560)">${R(-500, -620, 1000, 620, night ? "#5a4a3e" : "#a0764f", 7)}${P("M-560,-600 L0,-860 L560,-600Z", night ? "#4a3a30" : "#8d6a52", 7)}${R(-140, -420, 280, 420, night ? "#3a2e26" : "#6b4a35", 6)}${Ln("M-140,-420 L140,0 M140,-420 L-140,0", 5, night ? "#2a2018" : "#5a3d2b")}</g>`;
    far += poplar(380, -560, 1.2, night ? "#2f4a3a" : "#5e9a4f");
    far += RF(-4200, -560, 8400, 3000, night ? "#3a4a3a" : "#9fbf72") + Ln("M-4200,-560 L4200,-560", 6);
    let mid = "";
    if (opts.fence !== false) mid += fence(-4000, 4000, -560, night ? "#2f4f7a" : "#3f7fc4", null, 260);
    if (opts.well != null) mid += well(opts.well, -100, 1.1);
    if (opts.bench != null) mid += bench(opts.bench, -40, 1.1);
    if (night) mid += `<circle cx="-1100" cy="-1000" r="900" fill="#ffd27a" opacity="0.08"/>`;
    return { far, mid, near: "" };
  };

  BG.hayfield = (sky, opts) => {
    opts = opts || {};
    sky = sky || "day";
    const warm = sky === "sunset" || sky === "evening" || sky === "dusk";
    let far = `<defs>${skyDef("hfSky" + sky, sky)}<radialGradient id="hfSun${sky}"><stop offset="0" stop-color="#fff6d0"/><stop offset="0.35" stop-color="#ffd27a" stop-opacity="0.8"/><stop offset="1" stop-color="#ffb05a" stop-opacity="0"/></radialGradient></defs>`;
    far += RF(-6000, -4000, 12000, 4000, `url(#hfSky${sky})`);
    if (warm) far += `<circle cx="${opts.sunX || 900}" cy="${opts.sunY || -900}" r="900" fill="url(#hfSun${sky})"/><circle cx="${opts.sunX || 900}" cy="${opts.sunY || -900}" r="170" fill="#ffe9a8" stroke="${INK}" stroke-width="6"/>`;
    else for (const [x, y, s] of [[-2600, -2500, 1.4], [-200, -2800, 1.1], [2400, -2400, 1.3], [4400, -2600, 1]]) far += cloud(x, y, s);
    far += hills(-640, warm ? "#8a6a8a" : "#a9c98c", 9, 300, -6200, 6200);
    // ауыл (алыста)
    for (let i = 0; i < 9; i++) { const x = -3600 + i * 460, s = 0.22 + (i % 3) * 0.03; far += house(x, -560, s, { night: sky === "dusk", roof: ["#4f8f6a", "#b5413f", "#3f6fb5"][i % 3] }); }
    far += poplar(-4100, -560, 0.5) + poplar(-1500, -560, 0.45) + pole(-2600, -560, 0.4) + pole(-2000, -560, 0.4);
    far += hills(-480, warm ? "#a0785a" : "#9cbf6e", 13, 120, -6200, 6200);
    far += RF(-6000, -420, 12000, 3000, warm ? "#b9905a" : "#a9c46a") + Ln("M-6000,-420 L6000,-420", 6);
    // шөп түктері
    const r = rng(19);
    let mid = "";
    for (let i = 0; i < 70; i++) { const x = -5000 + r() * 10000, y = -380 + r() * 600; mid += Ln(`M${f(x)},${f(y)} l-10,-40 M${f(x + 10)},${f(y)} l4,-50 M${f(x + 20)},${f(y)} l16,-36`, 4, warm ? "#8a6a3a" : "#7a9a4a"); }
    return { far, mid, near: "" };
  };

  BG.pasture = (sky) => {
    sky = sky || "sunset";
    let far = `<defs>${skyDef("paSky", sky)}<radialGradient id="paSun"><stop offset="0" stop-color="#fff6d0"/><stop offset="0.35" stop-color="#ffd27a" stop-opacity="0.8"/><stop offset="1" stop-color="#ffb05a" stop-opacity="0"/></radialGradient></defs>`;
    far += RF(-5000, -3600, 10000, 3600, "url(#paSky)");
    far += `<circle cx="-1200" cy="-760" r="1000" fill="url(#paSun)"/><circle cx="-1200" cy="-760" r="190" fill="#ffe9a8" stroke="${INK}" stroke-width="6"/>`;
    far += hills(-700, "#7a5a7a", 21, 360, -5200, 5200) + hills(-520, "#9a6a5a", 23, 200, -5200, 5200);
    far += RF(-5000, -440, 10000, 3000, "#c4955a") + Ln("M-5000,-440 L5000,-440", 6);
    // ауылдың шеті (оң жақ): қоршау, бағана
    let mid = fence(1600, 5000, -440, "#3f7fc4", null, 240) + pole(2600, -440, 0.9);
    mid += F("M-5000,-260 L5000,-260 L5000,120 L-5000,120Z", "#b5874e") + Ln("M-5000,-260 L5000,-260", 4, "#9a7040");
    return { far, mid, near: "" };
  };

  BG.street = (sky) => {
    sky = sky || "evening";
    const night = sky === "night" || sky === "dusk";
    let far = `<defs>${skyDef("stSky" + sky, sky)}</defs>` + RF(-9000, -3200, 18000, 3200, `url(#stSky${sky})`);
    if (night) far += stars(9, 160, -8000, 8000, -3100, -1100) + `<circle cx="-1400" cy="-2200" r="110" fill="#fff6d0" stroke="${INK}" stroke-width="6"/>`;
    far += hills(-900, night ? "#2f3d5a" : "#8a7a9a", 31, 240, -9200, 9200);
    for (let i = 0; i < 11; i++) {
      const x = -8000 + i * 1500;
      far += house(x, -620, 0.62, { night, roof: ["#4f8f6a", "#b5413f", "#3f6fb5", "#7a5a44"][i % 4], trim: ["#3f7fc4", "#4f9a6a", "#c46b4a"][i % 3] });
      if (i % 2) far += poplar(x + 700, -620, 0.7, night ? "#2f4a3a" : "#5e9a4f");
    }
    far += RF(-9000, -620, 18000, 3000, night ? "#3a3a46" : "#c9b48f") + Ln("M-9000,-620 L9000,-620", 6);
    let mid = fence(-9000, 9000, -620, night ? "#2f4f7a" : "#3f7fc4", null, 240);
    mid += F("M-9000,-400 L9000,-400 L9000,400 L-9000,400Z", night ? "#4a4652" : "#d1bb92") + Ln("M-9000,-400 L9000,-400", 4, night ? "#3a3640" : "#b39c74");
    for (let i = 0; i < 6; i++) mid += pole(-7000 + i * 3000, -620, 0.8);
    return { far, mid, near: "" };
  };

  BG.barn = () => {
    let far = RF(-2800, -1800, 5600, 1800, "#5a4232");
    for (let x = -2800; x < 2800; x += 160) far += Ln(`M${x},-1800 L${x},0`, 5, "#4a3426");
    far += Ln("M-2800,-1300 L2800,-1300", 26, "#3e2c20") + Ln("M-2800,-1300 L2800,-1300", 6);
    far += R(-1700, -1100, 520, 360, "#1b2550", 6) + stars(13, 12, -1680, -1200, -1080, -760);
    far += RF(-2800, 0, 5600, 900, "#7a6450") + Ln("M-2800,0 L2800,0", 6);
    for (let i = 0; i < 30; i++) far += Ln(`M${-2600 + i * 180},${40 + (i % 4) * 60} l40,-14 M${-2560 + i * 180},${60 + (i % 3) * 70} l30,-20`, 4, "#d9b45a");
    // қора бөлігі (қоршау)
    let mid = R(-200, -520, 2200, 40, "#8d6a52", 6) + R(-200, -260, 2200, 40, "#8d6a52", 6);
    for (const x of [-200, 900, 1960]) mid += R(x, -620, 50, 620, "#7a5a44", 6);
    // шам
    let near = "";
    return { far, mid, near };
  };
  BG.lamp = (x, y, t) => {
    const fl = 1 + Math.sin(t * 13) * 0.03 + Math.sin(t * 7.1) * 0.02;
    return `<circle cx="${x}" cy="${y + 120}" r="${f(900 * fl)}" fill="#ffcf7a" opacity="0.13"/><circle cx="${x}" cy="${y + 120}" r="${f(420 * fl)}" fill="#ffd98f" opacity="0.18"/>` + Ln(`M${x},${y - 400} L${x},${y}`, 5) + P(`M${x - 50},${y} L${x + 50},${y} L${x + 70},${y + 120} L${x - 70},${y + 120}Z`, "#3a3f4c", 5) + C(x, y + 110, 34, "#fff1b8", 5);
  };
  BG.stool = (x, y) => R(x - 80, y - 150, 160, 30, "#a0764f", 5, 4) + Ln(`M${x - 60},${y - 120} L${x - 70},${y} M${x + 60},${y - 120} L${x + 70},${y}`, 12, "#7a5a44");

  BG.city = () => {
    let far = `<defs>${skyDef("ctSky", "evening")}</defs>` + RF(-3000, -2400, 6000, 2400, "url(#ctSky)");
    const r = rng(55);
    for (let i = 0; i < 16; i++) {
      const x = -2800 + i * 360, h = 900 + r() * 900, w = 300;
      far += R(x, -400 - h, w, h, ["#8a8fa8", "#9aa0b8", "#7a8098"][i % 3], 6);
      for (let yy = -400 - h + 60; yy < -460; yy += 110) for (let xx = x + 40; xx < x + w - 50; xx += 80) far += RF(xx, yy, 44, 60, r() < 0.5 ? "#ffe39a" : "#5a6078");
    }
    far += RF(-3000, -400, 6000, 2000, "#8b8f99") + Ln("M-3000,-400 L3000,-400", 6);
    return { far, mid: "", near: "" };
  };

  G.AUYL_BG = { cow, cowFace, rooster, goose, sheep, bag, house, fence, gateAt, bench, haystack, well, bucket, carpet, plate, platter, FOOD, PROPS, cloud, hills, poplar, pole, stars, SKY, mixc };
})(typeof window !== "undefined" ? window : globalThis);
