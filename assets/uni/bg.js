/* «Бірінші курс» — фондар, жатақхана заттары және жаңа кейіпкер образдары (таза SVG жолдары).
 * songy/bg.js-тің көмекшілерін қолданады (P, R, C, Ln ...). Еден сызығы y = 0. Кең план: камера (0, −380), zoom 1.
 */
(function (G) {
  "use strict";
  const B = G.SONGY_BG, RIG = G.ArturRig;
  const { BG, P, F, Ln, RF, C, T, INK, rng, f, windowFrame, PROPS: SP } = B;
  const R = B.R;
  const grad = (id, stops, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 || 0}" y2="${y2 == null ? 1 : y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mixc = (a, b, k) => {
    const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const A = h(a), Bb = h(b);
    return "#" + A.map((v, i) => Math.round(lerp(v, Bb[i], k)).toString(16).padStart(2, "0")).join("");
  };

  // ---------- жаңа кейіпкер образдары мен киімдерін ArturRig-ке тіркеу ----------
  if (RIG && RIG.LOOKS && RIG.OUTFITS) {
    Object.assign(RIG.LOOKS, {
      serik: { hair: "artur", brow: "thick", lid: 0.28, body: { w: 0.98, arm: 42, leg: 50 } },
      dauren: { hair: "buzz", brow: "thick2", body: { w: 1.24, arm: 54, leg: 56 } },
      roza: { hair: "scarf2", brow: "thick2", glasses: true, wrinkles: true, blushK: 0.35, body: { w: 1.2, arm: 48, leg: 48 } },
      askar: { hair: "dad", brow: "thick2", mustache: true, beard: true, glasses: true, body: { w: 1.08, arm: 46, leg: 52 } },
      maskGirl: { hair: "teacher1", brow: "thin", lashes: true, blushK: 0.4, body: { w: 0.92, arm: 40, leg: 44 } },
    });
    Object.assign(RIG.OUTFITS, {
      hoodie: { top: "#3f6fb5", shade: "#335c99", sleeve: "long", collar: "v", under: "#ffffff", legs: "#353945", shoes: "#f3f3f5" },
      serik: { top: "#7a3b52", shade: "#632f42", sleeve: "long", collar: "round", legs: "#4a4e5c", shoes: "#d9d4c4" },
      dauren: { top: "#e8773a", shade: "#cf652c", sleeve: "short", collar: "round", legs: "#2d313d", shoes: "#f3f3f5" },
      roza: { top: "#2c3e6b", shade: "#223054", sleeve: "long", collar: "v", under: "#a9d3f0", buttons: true, skirt: { to: -80, color: "#22293a", shade: "#191f2c", flare: 1.2 }, legs: "#efe3d6", shoes: "#1f1b20" },
      askar: { top: "#3b7a57", shade: "#2f6346", sleeve: "long", collar: "shirt", buttons: true, belt: "#2a2522", legs: "#333844", shoes: "#2a2522" },
      pajama: { top: "#f28fa8", shade: "#d97891", sleeve: "long", collar: "v", under: "#ffffff", skirt: { to: -100, color: "#f28fa8", shade: "#d97891", flare: 1.18 }, legs: "#ffffff", shoes: "#ffccd8" },
    });
  }

  // ---------- аспан палитралары ----------
  const SKY = {
    day: ["#6ab7eb", "#bfe3fb", "#eaf7ff"],
    evening: ["#4d6cb3", "#f09c6b", "#ffd188"],
    night: ["#0d1330", "#1b2550", "#2c3768"],
  };
  const skyDef = (id, k) => grad(id, [[0, (SKY[k] || SKY.day)[0]], [0.6, (SKY[k] || SKY.day)[1]], [1, (SKY[k] || SKY.day)[2]]]);

  function stars(seed, n, x0, x1, y0, y1) {
    const r = rng(seed);
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), rr = 2 + r() * 3.5;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#fff8dc" opacity="${f(0.45 + r() * 0.55)}"/>`;
    }
    return s;
  }
  const cloud = (x, y, s, col) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${P("M-120,0 Q-130,-70 -50,-70 Q-30,-130 40,-110 Q110,-130 130,-60 Q190,-40 160,0Z", col || "#ffffff", 5)}</g>`;
  const tree = (x, y, s, col) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${R(-22, -360, 44, 360, "#7a5a44", 5)}${P("M0,-880 Q160,-860 180,-680 Q250,-580 160,-450 Q60,-360 0,-400 Q-60,-360 -160,-450 Q-250,-580 -180,-680 Q-160,-860 0,-880Z", col || "#6aa84f", 6)}${Ln("M0,-620 L0,-360 M0,-540 L45,-600 M0,-480 L-45,-540", 4, "#5a3d2b")}</g>`;

  // ---------- заттар мен тағамдар ----------
  // Әженің +20 КГ ала қапшығы (қызыл-көк-ақ торлы)
  function bag(x, y, s, opts) {
    opts = opts || {};
    const sqX = opts.sqX || 1, sqY = opts.sqY || 1;
    const tag = opts.tag !== false ? (opts.tagText || "312") : null;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * sqX)},${f(s * sqY)})">`;
    const id = "bgc" + Math.abs(Math.round(x * 7 + y * 3 + (s || 1) * 100));
    g += `<clipPath id="${id}"><rect x="-220" y="-360" width="440" height="360" rx="34"/></clipPath>`;
    g += `<g clip-path="url(#${id})">${RF(-220, -360, 440, 360, "#f2efe9")}`;
    for (let i = -200; i < 220; i += 64) g += RF(i, -360, 32, 360, i % 128 === 0 ? "#c9424a" : "#3b6eb5", 0, ' opacity="0.82"');
    for (let j = -340; j < 0; j += 64) g += RF(-220, j, 440, 28, j % 128 === 0 ? "#c9424a" : "#3b6eb5", 0, ' opacity="0.65"');
    g += `</g>`;
    g += R(-220, -360, 440, 360, "none", 8, 34);
    g += P("M-110,-360 Q-110,-460 0,-460 Q110,-460 110,-360", "none", 14) + Ln("M-110,-360 Q-110,-460 0,-460 Q110,-460 110,-360", 6, "#2b2c33");
    if (tag) {
      g += `<g transform="translate(0,-180) rotate(-4)">${R(-95, -52, 190, 96, "#fff8d6", 5, 10)}${T(0, 14, tag, 56, "#c92a2a")}</g>`;
    }
    if (opts.open) {
      g += FOOD.baursak(-60, -370, 0.9, 5) + FOOD.kazy(50, -380, 0.85);
    }
    g += `</g>`;
    return g;
  }

  function suitcase(x, y, s, rot) {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)}) rotate(${f(rot || 0)})">`;
    g += Ln("M-40,-380 L-40,-560 L40,-560 L40,-380", 10, "#4a4e5c") + R(-55, -580, 110, 26, "#26272e", 5, 8);
    g += R(-130, -380, 260, 340, "#3a7ca5", 7, 28);
    g += Ln("M-90,-340 L-90,-80 M90,-340 L90,-80", 5, "#2b5f82");
    g += C(-90, -22, 22, "#26272e", 5) + C(90, -22, 22, "#26272e", 5);
    g += `</g>`;
    return g;
  }

  function turnstile(x, y, s, angle) {
    angle = angle || 0;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)})">`;
    g += R(-90, -480, 180, 480, "#8b93a2", 7, 16);
    g += RF(-70, -450, 140, 80, "#26272e", 10) + C(-30, -410, 14, "#e8423a", 3) + C(30, -410, 14, "#5fa36a", 3);
    g += C(0, -300, 36, "#555b69", 6);
    for (let i = 0; i < 3; i++) {
      const a = (angle + i * 55 - 20) * (Math.PI / 180);
      const x2 = Math.cos(a) * 260, y2 = -300 + Math.sin(a) * 140;
      g += Ln(`M0,-300 L${f(x2)},${f(y2)}`, 18, INK) + Ln(`M0,-300 L${f(x2)},${f(y2)}`, 10, "#d6dae2");
    }
    g += `</g>`;
    return g;
  }

  function bunkBed(x, y, s) {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)})">`;
    // тіректер
    g += R(-480, -960, 28, 960, "#4a5264", 6, 4) + R(452, -960, 28, 960, "#4a5264", 6, 4);
    // төменгі және жоғарғы матрас + көрпе
    for (const by of [-220, -720]) {
      g += R(-460, by - 70, 920, 70, "#f4f1ea", 6, 16);
      g += P(`M-320,${by - 72} L450,${by - 72} L450,${by - 6} L-320,${by - 6}Z`, by < -500 ? "#7a3b52" : "#3f6fb5", 6);
      // жастық
      g += R(-440, by - 125, 170, 62, "#ffffff", 5, 22);
      g += R(-468, by, 936, 36, "#5d667a", 6, 4);
    }
    // үстіңгі қоршау және саты
    g += R(-260, -820, 520, 22, "#5d667a", 5, 4);
    g += R(310, -720, 18, 720, "#5d667a", 5) + R(420, -720, 18, 720, "#5d667a", 5);
    for (let ly = -640; ly <= -120; ly += 130) g += R(318, ly, 102, 16, "#5d667a", 4);
    g += `</g>`;
    return g;
  }

  function waterJug(x, y, s, rot) {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)}) rotate(${f(rot || 0)})">`;
    g += P("M-55,0 L-60,-150 Q-60,-195 -24,-210 L-24,-240 L24,-240 L24,-210 Q60,-195 60,-150 L55,0Z", "#8ad2f8", 6, ' fill-opacity="0.88"');
    g += R(-28, -262, 56, 24, "#2d6cdf", 5, 6);
    g += Ln("M-46,-110 L46,-110 M-46,-60 L46,-60", 4, "#5ab4e5");
    g += T(0, -125, "5Л", 34, "#1d4ed8");
    g += `</g>`;
    return g;
  }

  function qurt(x, y, r, rot) {
    r = r || 26;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot || 0)})">${C(0, 0, r, "#f7f5ee", 5)}${C(-r * 0.28, -r * 0.2, r * 0.12, "#d8d3c5", 0)}${C(r * 0.25, r * 0.18, r * 0.1, "#d8d3c5", 0)}</g>`;
  }

  // 1978 жылғы «Шайтан-плита»
  function devilStove(x, y, s, iceK, fireK) {
    iceK = iceK || 0;
    fireK = fireK || 0;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)})">`;
    g += R(-280, -480, 560, 480, "#e6e2d8", 7, 10);
    g += RF(-270, -480, 540, 74, "#c9c4b8") + Ln("M-280,-406 L280,-406", 6);
    for (let i = 0; i < 4; i++) g += C(-180 + i * 120, -442, 20, "#3a3d46", 5) + Ln(`M${-180 + i * 120},-456 L${-180 + i * 120},-428`, 4, "#ffffff");
    // пеш есігі
    g += R(-210, -350, 420, 260, "#4a4e58", 6, 8) + RF(-175, -310, 350, 170, fireK > 0.2 ? "#ff9f43" : "#262830", 6);
    g += R(-160, -334, 320, 16, "#8b92a0", 4, 4);
    g += T(0, -40, "1978", 34, "#7a766d");
    // сол конфорка (мұз)
    g += R(-210, -504, 150, 24, "#2b2c33", 5, 4);
    if (iceK > 0) {
      g += `<g transform="translate(-135,-504) scale(${f(iceK)})">${P("M-80,0 L-60,-90 L-20,-30 L0,-130 L30,-40 L70,-95 L85,0Z", "#9be7ff", 5)}${T(0, -150, "-10°C", 40, "#3abff8")}</g>`;
    }
    // оң конфорка (жанартау оты)
    g += R(60, -504, 150, 24, "#2b2c33", 5, 4);
    if (fireK > 0) {
      const wob = Math.sin(fireK * 28) * 18;
      g += `<g transform="translate(135,-504) scale(${f(Math.min(1.2, fireK))})">${P(`M-95,0 Q-120,-220 ${f(-40 + wob)},-420 Q0,-560 ${f(30 - wob)},-410 Q120,-220 95,0Z`, "#ff5722", 6)}${P(`M-55,0 Q-70,-150 ${f(wob)},-300 Q70,-150 55,0Z`, "#ffd54f", 4)}${T(0, -470, "+9000°C!", 44, "#ffeb3b")}</g>`;
    }
    g += `</g>`;
    return g;
  }

  function pan(x, y, s, count) {
    count = count == null ? 6 : count;
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)})">`;
    g += Ln("M110,-26 L230,-46", 18, INK) + Ln("M110,-26 L230,-46", 10, "#c9424a");
    g += P("M-120,-40 L120,-40 L100,0 L-100,0Z", "#383b44", 6);
    for (let i = 0; i < count; i++) {
      const px = -75 + (i % 3) * 72, py = -44 - Math.floor(i / 3) * 20;
      g += C(px, py, 24, "#f4d799", 4) + Ln(`M${px - 10},${py} Q${px},${py - 10} ${px + 10},${py}`, 3, "#c99b52");
    }
    g += `</g>`;
    return g;
  }

  function forkStrike(x, y, deg, k) {
    if (k <= 0) return "";
    const d = (1 - k) * 380;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(deg)}) translate(0,${f(-d)})">${R(-8, -280, 16, 200, "#b8bec8", 5, 4)}${P("M-24,-80 L24,-80 L20,0 L-20,0Z", "#b8bec8", 5)}${Ln("M-12,-40 L-12,24 M0,-40 L0,24 M12,-40 L12,24", 5, INK)}</g>`;
  }

  // Жалғыз розетка + 7 тройник пирамидасы
  function powerTower(x, y, s, sparkK) {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)})">`;
    g += R(-54, -54, 108, 108, "#f4f1ea", 6, 14) + C(0, 0, 34, "#ffffff", 5) + C(-12, 0, 6, INK, 0) + C(12, 0, 6, INK, 0);
    // тройниктер пирамидасы
    const blocks = [
      [0, -70, "#e85d75", 0], [-55, -135, "#3f6fb5", -14], [55, -135, "#f6d55c", 14],
      [-90, -200, "#5fa36a", -24], [0, -205, "#ffffff", 4], [90, -200, "#e8773a", 22],
    ];
    for (const [bx, by, col, rot] of blocks) {
      g += `<g transform="translate(${bx},${by}) rotate(${rot})">${R(-42, -32, 84, 64, col, 5, 10)}${C(-14, 0, 5, INK, 0)}${C(14, 0, 5, INK, 0)}</g>`;
      g += Ln(`M${bx},${by} Q${bx * 2.2},${by + 160} ${bx * 3.5},260`, 6, "#26272e");
    }
    if (sparkK > 0) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.283 + sparkK * 5;
        const r1 = 50 + (i % 2) * 30, r2 = 140 + (i % 3) * 50;
        g += Ln(`M${f(Math.cos(a) * r1)},${f(-130 + Math.sin(a) * r1)} L${f(Math.cos(a + 0.2) * ((r1 + r2) / 2))},${f(-130 + Math.sin(a + 0.2) * ((r1 + r2) / 2))} L${f(Math.cos(a) * r2)},${f(-130 + Math.sin(a) * r2)}`, 7, "#ffeb3b");
      }
    }
    g += `</g>`;
    return g;
  }

  function wetSign(x, y, s, rot) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)}) rotate(${f(rot || 0)})">${P("M-110,0 L-30,-290 L30,-290 L110,0 L70,0 L50,-70 L-50,-70 L-70,0Z", "#f6d55c", 7)}${P("M0,-240 L55,-110 L-55,-110Z", "#ffffff", 5)}${T(0, -125, "!", 72, "#e8423a")}${T(0, -35, "ТАЙҒАҚ", 28, INK)}</g>`;
  }

  const FOOD = {
    baursak: (x, y, s, seed) => {
      const r = rng(seed || 1);
      let g = "";
      for (let i = 0; i < 7; i++) {
        const a = (r() - 0.5) * 120, b = -r() * 70;
        g += P(`M${f(x + a - 34 * s)},${f(y + b)} Q${f(x + a - 40 * s)},${f(y + b - 50 * s)} ${f(x + a)},${f(y + b - 54 * s)} Q${f(x + a + 40 * s)},${f(y + b - 50 * s)} ${f(x + a + 34 * s)},${f(y + b)} Q${f(x + a)},${f(y + b + 10 * s)} ${f(x + a - 34 * s)},${f(y + b)}Z`, "#e0a24a", 4);
      }
      return g;
    },
    kazy: (x, y, s) => {
      let g = "";
      for (let i = 0; i < 6; i++) {
        g += `<ellipse cx="${f(x - 90 * s + i * 36 * s)}" cy="${f(y - (i % 2) * 12)}" rx="${f(26 * s)}" ry="${f(22 * s)}" fill="#8a3a3a" stroke="${INK}" stroke-width="4"/><ellipse cx="${f(x - 90 * s + i * 36 * s)}" cy="${f(y - (i % 2) * 12)}" rx="${f(12 * s)}" ry="${f(9 * s)}" fill="#f4e3d0"/>`;
      }
      return g;
    },
    kese: (x, y, s, tea) => P(`M${f(x - 46 * s)},${f(y - 50 * s)} Q${f(x - 46 * s)},${f(y)} ${f(x)},${f(y)} Q${f(x + 46 * s)},${f(y)} ${f(x + 46 * s)},${f(y - 50 * s)}Z`, "#ffffff", 4) + Ln(`M${f(x - 40 * s)},${f(y - 30 * s)} Q${f(x)},${f(y - 20 * s)} ${f(x + 40 * s)},${f(y - 30 * s)}`, 6 * s, "#3f7fc4") + (tea ? `<ellipse cx="${f(x)}" cy="${f(y - 50 * s)}" rx="${f(42 * s)}" ry="${f(9 * s)}" fill="#c98a4a"/>` : ""),
    teapot: (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${P("M-80,-10 Q-110,-120 0,-130 Q110,-120 80,-10Z", "#ffffff", 6)}${P("M80,-70 Q140,-90 150,-140", "none", 14)}${Ln("M80,-70 Q140,-90 150,-140", 6, "#ffffff")}${P("M-80,-90 Q-140,-80 -110,-30", "none", 6)}${R(-30, -150, 60, 22, "#3f7fc4", 5, 8)}${Ln("M-70,-60 Q0,-40 70,-60", 8, "#3f7fc4")}</g>`,
  };

  function platter(x, y, s) {
    let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s || 1)})">`;
    g += `<ellipse cx="0" cy="0" rx="320" ry="76" fill="#e9ecef" stroke="${INK}" stroke-width="7"/><ellipse cx="0" cy="-8" rx="260" ry="54" fill="#f4e7c9" stroke="${INK}" stroke-width="4"/>`;
    const r = rng(77);
    for (let i = 0; i < 12; i++) {
      const a = r() * 6.28, d = r() * 160;
      g += P(`M${f(Math.cos(a) * d - 50)},${f(Math.sin(a) * d * 0.25 - 40)} q30,-50 90,-30 q30,30 -10,46 q-50,14 -80,-16Z`, ["#b36a4a", "#c47a55", "#9a5a3e"][i % 3], 4);
    }
    g += FOOD.kazy(-40, -105, 1.15) + FOOD.kazy(55, -145, 0.95);
    for (let i = 0; i < 8; i++) g += Ln(`M${f(-180 + i * 48)},${f(-40 - (i % 3) * 18)} q10,-14 20,0`, 4, "#ffffff");
    g += `</g>`;
    return g;
  }

  // Қолға ұстайтын заттар (PROPS)
  const PROPS = {
    stamp: () => `<g transform="translate(0,30)">${R(-45, 0, 90, 32, "#c92a2a", 5, 6)}${R(-18, -50, 36, 52, "#7a4a2a", 5, 12)}</g>`,
    mop: () => `<g transform="translate(0,20) rotate(-12)">${R(-8, -420, 16, 620, "#a0764f", 5, 4)}${P("M-90,190 L90,190 L120,290 L-120,290Z", "#d6dae2", 5)}${Ln("M-60,200 L-80,280 M-20,200 L-25,280 M20,200 L25,280 M60,200 L80,280", 4, "#9aa1ad")}</g>`,
    whistle: () => `<g transform="translate(0,26)">${C(0, 18, 22, "#d6dae2", 5)}${R(-10, -18, 20, 28, "#d6dae2", 5, 4)}</g>`,
    jugProp: () => `<g transform="translate(0,40) scale(0.55)">${waterJug(0, 0, 1, 180)}</g>`,
    latte: () => `<g transform="translate(0,26)">${P("M-26,-40 L26,-40 L20,44 L-20,44Z", "#ffffff", 5)}${R(-24, -10, 48, 26, "#c98a4a", 4, 3)}${R(-30, -52, 60, 14, "#26272e", 4, 4)}</g>`,
    guitar: () => `<g transform="translate(40,10) rotate(-28)">${P("M-70,-60 Q-110,-60 -110,0 Q-110,60 -50,60 Q-20,60 0,40 Q30,85 95,85 Q160,85 160,0 Q160,-85 95,-85 Q30,-85 0,-40 Q-20,-60 -70,-60Z", "#d98a3a", 6)}${C(35, 0, 32, "#3a2518", 5)}${R(-260, -14, 190, 28, "#5a3824", 5, 4)}</g>`,
    qurtProp: () => `<g transform="translate(0,26)">${qurt(0, 0, 24, 0)}</g>`,
  };

  // ---------- 3-ҚАБАТТЫ ПАРАЛЛАКС ФОНДАР ----------

  // 1) Жатақхана сырты (5 қабатты қызыл кірпіш ғимарат)
  BG.dormExt = (sky) => {
    sky = sky || "day";
    let far = `<defs>${skyDef("deSky" + sky, sky)}</defs>` + RF(-4200, -3200, 8400, 3200, `url(#deSky${sky})`);
    for (const [x, y, s] of [[-2200, -2300, 1.3], [300, -2500, 1.1], [2100, -2200, 1.2]]) far += cloud(x, y, s);
    // алыстағы қала силуэттері
    for (let i = 0; i < 14; i++) {
      const bx = -3600 + i * 540, bh = 700 + (i % 4) * 260;
      far += R(bx, -380 - bh, 420, bh, ["#9aa5be", "#8a95ae", "#aeb8ce"][i % 3], 5);
    }
    // №5 Жатақхана ғимараты
    far += R(-1700, -1950, 3400, 1950, "#c86d55", 8);
    far += RF(-1700, -1950, 3400, 80, "#9e4f3b") + Ln("M-1700,-1870 L1700,-1870", 6);
    for (let fl = 0; fl < 4; fl++) {
      for (let wx = -1520; wx <= 1360; wx += 320) {
        if (fl === 3 && Math.abs(wx) < 380) continue;
        const lit = (fl + wx) % 3 === 0 ? "#ffe599" : "#a9d3f0";
        far += windowFrame(wx, -1760 + fl * 390, 160, 230, lit, { frame: "#f4f1ea" });
      }
    }
    // кіреберіс маңдайшасы
    far += R(-460, -680, 920, 130, "#2c3e6b", 7, 10) + T(0, -595, "№5 ЖАТАҚХАНА", 68, "#f6d55c");
    far += R(-260, -550, 520, 550, "#5a4232", 7) + R(-230, -520, 210, 520, "#7a5a44", 5) + R(20, -520, 210, 520, "#7a5a44", 5);
    far += RF(-4200, 0, 8400, 1200, "#8b929e") + Ln("M-4200,0 L4200,0", 6);
    // ортаңғы қабат: ағаштар мен орындық
    let mid = tree(-2100, 0, 1.25, "#7cb342") + tree(2050, 0, 1.2, "#f2a541");
    mid += R(-1450, -240, 480, 40, "#a0764f", 6, 6) + R(-1400, -200, 30, 200, "#4a4e58", 5) + R(-1040, -200, 30, 200, "#4a4e58", 5);
    // алдыңғы қабат (near): бұталар мен шам бағанасы силуэті
    let near = `<g opacity="0.92">${P("M-2600,450 Q-2500,140 -2200,220 Q-1950,120 -1750,320 L-1750,600 L-2600,600Z", "#2b3d2f", 6)}${P("M1700,450 Q1900,150 2200,210 Q2450,120 2650,350 L2650,600 L1700,600Z", "#2b3d2f", 6)}</g>`;
    return { far, mid, near };
  };

  // 2) Жатақхана фойесі (Вахта + Лифт + Турникет)
  BG.dormLobby = () => {
    let far = RF(-2600, -1700, 5200, 1700, "#e8e2d5") + RF(-2600, -560, 5200, 560, "#6b8e78") + Ln("M-2600,-560 L2600,-560", 6);
    // Вахта терезесі (сол жақта)
    far += R(-1450, -1120, 820, 620, "#5a4232", 8, 8) + RF(-1390, -1060, 700, 480, "#fff3d6");
    far += R(-1350, -1240, 620, 100, "#2c3e6b", 6, 8) + T(-1040, -1172, "ВАХТА · РОЗА АПАЙ", 48, "#ffffff");
    far += R(-1490, -520, 900, 46, "#8d6a52", 6, 6);
    // Ортада хабарландыру тақтасы
    far += R(-360, -1160, 720, 480, "#8d6a52", 7, 6) + RF(-330, -1130, 660, 420, "#2f5a46");
    far += T(0, -1040, "ЕРЕЖЕЛЕР:", 46, "#f6d55c");
    far += R(-280, -990, 240, 160, "#ffffff", 4, 4) + R(20, -980, 250, 150, "#ffd54f", 4, 4);
    far += T(-160, -900, "22:00", 42, "#c92a2a") + T(145, -895, "ТЫНЫШТЫҚ", 34, INK);
    // Оң жақта бұзылған лифт
    far += R(720, -1140, 640, 1140, "#7a8290", 8, 6) + R(760, -1100, 270, 1100, "#9aa2b0", 5) + R(1050, -1100, 270, 1100, "#9aa2b0", 5);
    far += Ln("M730,-920 L1350,-220 M1350,-920 L730,-220", 18, "#d97724");
    far += `<g transform="translate(1040,-620) rotate(-6)">${R(-310, -95, 620, 190, "#fff8d6", 7, 12)}${T(0, -18, "ЛИФТ ІСТЕМЕЙДІ!", 50, "#c92a2a")}${T(0, 48, "(1998 жылдан бері)", 36, "#4a4e58")}</g>`;
    // Еден (шахмат плиткасы)
    far += RF(-2600, 0, 5200, 900, "#c9c2b2") + Ln("M-2600,0 L2600,0", 6);
    for (let x = -2400; x < 2400; x += 240) far += Ln(`M${x},0 L${x - 180},900`, 3, "#b0a999");
    let mid = "";
    let near = `<g opacity="0.88">${R(-2500, -1600, 180, 2200, "#2b2f3a", 6)}${R(2320, -1600, 180, 2200, "#2b2f3a", 6)}</g>`;
    return { far, mid, near };
  };

  // 3) Баспалдақ (1..5 қабат)
  BG.dormStairs = (flNum) => {
    flNum = flNum || "5";
    let far = RF(-2400, -1700, 4800, 1700, "#e8e3d6") + RF(-2400, -640, 4800, 640, "#6fa088") + Ln("M-2400,-640 L2400,-640", 6);
    far += windowFrame(-950, -1280, 420, 520, "#a9d3f0", { frame: "#ffffff" });
    far += R(260, -1180, 620, 320, "#ffffff", 7, 14) + T(570, -985, `${flNum}-ҚАБАТ`, 96, "#2c3e6b");
    far += RF(-2400, 0, 4800, 800, "#9e988a") + Ln("M-2400,0 L2400,0", 6);
    let mid = "";
    for (let i = 0; i < 8; i++) {
      mid += R(-1600 + i * 180, -70 - i * 75, 1900, 75, "#bdb6a6", 5);
    }
    mid += Ln("M-1600,-520 L-160,-1120", 14, "#4a382b");
    let near = `<g opacity="0.9">${Ln("M-2200,260 L2200,-180", 22, "#2f333d")}</g>`;
    return { far, mid, near };
  };

  // 4) Жатақхана бөлмесі (512 немесе 312)
  BG.dormRoom = (mode) => {
    mode = mode || "day";
    const night = mode === "night" || mode === "312";
    const is312 = mode === "312";
    let far = RF(-2400, -1650, 4800, 1650, is312 ? "#ecd9c6" : "#d8e2dc");
    for (let x = -2300; x < 2300; x += 140) far += Ln(`M${x},-1650 L${x},-160`, 3, is312 ? "#dfc8b0" : "#cad6cf");
    far += RF(-2400, -160, 4800, 160, "#b8c4bc") + Ln("M-2400,-160 L2400,-160", 6);
    // терезе
    const winSky = night ? "#1b2550" : "#a9d3f0";
    const winIn = night ? stars(17, 18, 40, 440, -1120, -620) + `<circle cx="340" cy="-980" r="46" fill="#fff3c4"/>` : `<circle cx="340" cy="-980" r="56" fill="#ffe29a"/>`;
    far += windowFrame(20, -1180, 480, 580, winSky, { frame: "#ffffff", inner: winIn });
    // плакат пен бөлме нөмірі
    far += R(740, -1140, 340, 420, "#f6d55c", 6, 8) + T(910, -960, is312 ? "312" : "512", 86, "#c92a2a") + T(910, -860, is312 ? "ДИПЛОМ!" : "1-КУРС", 48, INK);
    // еден + кілем
    far += RF(-2400, 0, 4800, 900, "#a98467") + Ln("M-2400,0 L2400,0", 6);
    far += R(-920, 50, 1840, 420, is312 ? "#9e2f3b" : "#3b5f8a", 6, 12) + R(-870, 80, 1740, 360, "none", 4);
    // ортаңғы қабат: екі қабатты кереует (сол жақ) және оқу үстелі (оң жақ)
    let mid = bunkBed(-1120, 0, 0.96);
    if (!is312) {
      mid += R(680, -410, 740, 42, "#c99b6d", 6, 4) + R(710, -368, 34, 368, "#8d6a52", 5) + R(1350, -368, 34, 368, "#8d6a52", 5);
      mid += R(780, -490, 180, 80, "#3f6fb5", 5, 4) + R(800, -535, 140, 45, "#e85d75", 5, 4);
      // жалғыз розетка (қабырғада)
      mid += R(540, -280, 76, 76, "#ffffff", 5, 10) + C(578, -242, 22, "#f4f1ea", 4) + C(570, -242, 4, INK, 0) + C(586, -242, 4, INK, 0);
    }
    let near = night ? `<circle cx="0" cy="-900" r="1300" fill="#ffd27a" opacity="0.09"/>` : "";
    return { far, mid, near };
  };

  // 5) Ортақ асүй («Шайтан-плита»)
  BG.dormKitchen = () => {
    let far = RF(-2600, -1650, 5200, 1650, "#eef2ef");
    for (let x = -2400; x < 2400; x += 100) far += Ln(`M${x},-1650 L${x},-260`, 2, "#d2dcd6");
    for (let y = -1600; y < -260; y += 100) far += Ln(`M-2600,${y} L2600,${y}`, 2, "#d2dcd6");
    far += R(-460, -1260, 920, 220, "#ffffff", 6, 10) + T(0, -1125, "ОРТАҚ АСҮЙ", 72, "#2c3e6b");
    far += windowFrame(-1500, -1220, 440, 540, "#a9d3f0", { frame: "#ffffff" });
    far += RF(-2600, 0, 5200, 850, "#b8bec8") + Ln("M-2600,0 L2600,0", 6);
    // ортаңғы қабат: үстелдер мен раковина
    let mid = R(-1560, -480, 920, 480, "#c9d1d9", 7, 6) + R(-1580, -510, 960, 40, "#8b95a5", 6, 4);
    mid += R(640, -480, 920, 480, "#c9d1d9", 7, 6) + R(620, -510, 960, 40, "#8b95a5", 6, 4);
    // үйілген ыдыстар
    for (let i = 0; i < 6; i++) mid += `<ellipse cx="${-1100 + (i % 2) * 16}" cy="${-525 - i * 24}" rx="95" ry="20" fill="#ffffff" stroke="${INK}" stroke-width="5"/>`;
    let near = `<g opacity="0.9">${R(-2500, 280, 900, 400, "#3a3f4c", 6, 8)}${R(1600, 280, 900, 400, "#3a3f4c", 6, 8)}</g>`;
    return { far, mid, near };
  };

  // 6) Университет лабиринті (корпустар)
  BG.uniMaze = () => {
    let far = RF(-2800, -1650, 5600, 1650, "#f2ebd9") + RF(-2800, -420, 5600, 420, "#d4c3a3") + Ln("M-2800,-420 L2800,-420", 6);
    const doors = [[-1650, "А КОРПУС", "#3f6fb5"], [-850, "Б КОРПУС?", "#5fa36a"], [0, "304 АУД. →", "#e8773a"], [850, "← В КОРПУС", "#8e3b6e"], [1650, "АСХАНА", "#e85d75"]];
    for (const [dx, label, col] of doors) {
      far += R(dx - 190, -960, 380, 960, "#7a5a44", 7, 6) + R(dx - 155, -910, 310, 420, "#9c7458", 5) + C(dx + 125, -450, 14, "#f6d55c", 4);
      far += R(dx - 210, -1120, 420, 110, col, 6, 10) + T(dx, -1048, label, 44, "#ffffff");
    }
    // ортада адастырғыш бағыттағыш баған
    let mid = R(-18, -1280, 36, 1280, "#4a4e58", 6);
    const signs = [[-1180, "А КОРПУС →", "#3f6fb5", 4], [-1050, "← Б КОРПУС", "#f6d55c", -5], [-920, "304 АУД. ↑", "#e85d75", 6], [-790, "ДЕКАНАТ ???", "#5fa36a", -4]];
    for (const [sy, st, sc, sr] of signs) {
      mid += `<g transform="translate(0,${sy}) rotate(${sr})">${P("M-260,-44 L220,-44 L270,0 L220,44 L-260,44Z", sc, 6)}${T(-10, 15, st, 40, sc === "#f6d55c" ? INK : "#ffffff")}</g>`;
    }
    far += RF(-2800, 0, 5600, 850, "#c7b99e") + Ln("M-2800,0 L2800,0", 6);
    return { far, mid, near: "" };
  };

  // 7) Жатақхана дәлізі (5, 4 немесе 3-қабат, тайғақ еден опциясымен)
  BG.dormCorridor = (fl, opts) => {
    opts = opts || {};
    fl = fl || 3;
    let far = RF(-4800, -1650, 9600, 1650, "#e6dfd3") + RF(-4800, -520, 9600, 520, "#7b9e89") + Ln("M-4800,-520 L4800,-520", 6);
    for (let i = -3; i <= 3; i++) {
      const dx = i * 1100;
      const num = `${fl}1${Math.abs(i + 2)}`;
      const isTarget = opts.targetDoor && i === 1;
      const doorNum = isTarget ? opts.targetDoor : num;
      if (isTarget && opts.glow) {
        far += `<circle cx="${dx}" cy="-480" r="620" fill="#ffd54f" opacity="0.32"/>`;
      }
      far += R(dx - 210, -980, 420, 980, isTarget ? "#8d4a35" : "#6b4a35", 8, 6);
      far += R(dx - 170, -920, 340, 860, isTarget ? "#a85c44" : "#825c44", 5);
      far += C(dx + 130, -460, 16, "#f6d55c", 5);
      far += R(dx - 130, -1100, 260, 90, isTarget ? "#c92a2a" : "#2c3e6b", 6, 10) + T(dx, -1038, String(doorNum), 52, "#ffffff");
    }
    // еден
    far += RF(-4800, 0, 9600, 900, opts.wet ? "#9bc4dc" : "#a89f91") + Ln("M-4800,0 L4800,0", 6);
    if (opts.wet) {
      for (let i = -6; i <= 6; i++) {
        far += Ln(`M${i * 600 - 180},120 L${i * 600 + 220},60 M${i * 600 - 80},240 L${i * 600 + 260},180`, 7, "#ffffff", ' opacity="0.65"');
      }
    }
    let mid = opts.wet ? wetSign(-200, 80, 0.95, -3) : "";
    let near = "";
    return { far, mid, near };
  };

  BG.table = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><ellipse cx="0" cy="-150" rx="760" ry="120" fill="#c99b6d" stroke="${INK}" stroke-width="7"/><ellipse cx="0" cy="-158" rx="700" ry="100" fill="#ffffff" stroke="${INK}" stroke-width="4"/>${Ln("M-700,-158 Q0,-30 700,-158", 4, "#e85d75")}${P("M-760,-150 L-760,-80 Q0,40 760,-80 L760,-150 Q0,-30 -760,-150Z", "#a8794f", 6)}</g>`;
  BG.korpe = (x, y, w, col) => R(x - w / 2, y - 60, w, 60, col || "#3f6fb5", 6, 18) + Ln(`M${f(x - w / 2 + 30)},${y - 30} L${f(x + w / 2 - 30)},${y - 30}`, 4, "#f2c14e");

  G.UNI_BG = { bag, suitcase, turnstile, bunkBed, waterJug, qurt, devilStove, pan, forkStrike, powerTower, wetSign, platter, FOOD, PROPS, cloud, tree, stars, SKY, mixc };
})(typeof window !== "undefined" ? window : globalThis);
