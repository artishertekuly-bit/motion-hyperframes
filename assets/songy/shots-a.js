/* «Соңғы қоңырау» — кадрлар, 1-бөлім: суық ашылу → тақырып → каталог → тапсырма (0 … ~178 с). */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RIG = G.ArturRig;
  const { S, E, LN, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { BG, PROPS, bouquet, balloon, crowdPerson, P, F, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;

  // сөздің басталу уақыты (n — әріпі бар сөздің реті)
  function Wt(id, n) {
    const l = LN[id];
    const toks = l.text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
    const letters = l.chars.filter(([c]) => /[\p{L}\p{N}]/u.test(c));
    let idx = 0;
    for (let i = 0; i < n && i < toks.length; i++) idx += (toks[i].match(/[\p{L}\p{N}]/gu) || []).length;
    return letters[Math.min(idx, letters.length - 1)][1];
  }
  const POSES = {
    carry: { armR: { sh: 150, el: -40, hand: "fist" } },
    phoneUp: { armL: { sh: 64, el: 108, hand: "fist", propFront: PROPS.phone() } },
    facepalm: { armR: { sh: 24, el: -150, hand: "open" } },
    handMouth: { armR: { sh: 40, el: -140, hand: "open" } },
    armsDown: { armL: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" }, armR: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" } },
    thumbs: { armR: { sh: 70, el: -100, hand: "fist" } },
    hipsL: { armL: { sh: 50, el: -94, hand: "fist" } },
    sit: { legL: { a: 38, k: 30 }, legR: { a: 38, k: 30 } },
    stand: { legL: { a: 3, k: 0 }, legR: { a: 3, k: 0 } },
    // эмоциялар (қосымша)
    determined: { eye: { lidTop: 0.38, lidBot: 0.1, lidTilt: 0.6, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -4, angle: 16, liftL: 0, liftR: 0 }, mouth: "smirk" },
    deadpan: { eye: { lidTop: 0.55, lidBot: 0.08, lidTilt: 0, px: 0, py: 0, pupil: 0.9, happy: 0, scale: 1 }, brow: { lift: -2, angle: 0, liftL: 0, liftR: 0 }, mouth: "hmm", fx: { sweat: 0, blush: 0, vein: 0 } },
    tearful: { eye: { lidTop: 0.3, lidBot: 0.25, lidTilt: -0.6, px: 0, py: 0.1, pupil: 1, happy: 0, scale: 1 }, brow: { lift: 8, angle: -18, liftL: 0, liftR: 0 }, mouth: "smile", fx: { sweat: 0, blush: 0.5, vein: 0 } },
    suspicious: { eye: { lidTop: 0.58, lidBot: 0.2, lidTilt: 0.4, px: 0.3, py: -0.2, pupil: 1, happy: 0, scale: 1 }, brow: { lift: 0, angle: 14, liftL: -6, liftR: 10 }, mouth: "hmm" },
    sleepClosed: { eye: { lidTop: 0.98, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -4, angle: -2, liftL: 0, liftR: 0 }, mouth: "rest" },
    lookUp: { eye: { py: -0.7 } },
    lookL: { eye: { px: -0.7 } },
    lookR: { eye: { px: 0.7 } },
    lookC: { eye: { px: 0, py: 0.05 } },
  };
  G.SONGY_POSES = POSES;
  const tears = (x, y, t, n) => { let s = ""; for (let i = 0; i < (n || 2); i++) { const k = ((t * 1.3 + i * 0.5) % 1); s += `<g transform="translate(${f(x + (i ? 70 : -70))},${f(y + k * 90)})" opacity="${f(1 - k)}">${P("M0,-16 Q11,0 7,10 Q0,16 -7,10 Q-11,0 0,-16Z", "#a8dcf6", 4)}</g>`; } return s; };
  const zzz = (x, y, t) => { let s = ""; for (let i = 0; i < 3; i++) { const k = ((t * 0.45 + i / 3) % 1); s += `<text x="${f(x + k * 90 + Math.sin(k * 6) * 14)}" y="${f(y - k * 220)}" font-size="${f(40 + k * 40)}" font-family="Montserrat" font-weight="900" fill="#ffffff" stroke="${INK}" stroke-width="7" paint-order="stroke" opacity="${f(Math.sin(k * Math.PI))}">Z</text>`; } return s; };
  const speed = (x, y, r, t, t0, n) => { const k = win(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return ""; let s = ""; for (let i = 0; i < (n || 6); i++) { const a = -Math.PI * (0.15 + 0.7 * i / ((n || 6) - 1)); const r0 = r * (1 + 0.3 * k), r1 = r * (1.25 + 0.6 * k); s += Ln(`M${f(x + Math.cos(a) * r0)},${f(y + Math.sin(a) * r0)} L${f(x + Math.cos(a) * r1)},${f(y + Math.sin(a) * r1)}`, 7, INK, ` opacity="${f(1 - k)}"`); } return s; };
  const puff = (x, y, t, t0, dur, n, col) => { const k = win(t, t0, t0 + (dur || 1)); if (k <= 0 || k >= 1) return ""; let s = ""; for (let i = 0; i < (n || 8); i++) { const a = hash(i + t0) * 6.283, d = 40 + hash(i * 3 + t0) * 120; s += `<circle cx="${f(x + Math.cos(a) * d * eout(k))}" cy="${f(y + Math.sin(a) * d * eout(k) - 30 * k)}" r="${f(26 + 40 * k)}" fill="${col || "#ffffff"}" opacity="${f(0.7 * (1 - k))}"/>`; } return s; };
  const mirrorFrame = () => {
    // айна жақтауы (экрандық): кадрдың шеті + шыны жылтыры
    return `<path d="M0,0 H1920 V1080 H0Z M90,70 Q90,40 130,40 H1790 Q1830,40 1830,70 V1010 Q1830,1040 1790,1040 H130 Q90,1040 90,1010Z" fill="#7a5a44" fill-rule="evenodd" stroke="${INK}" stroke-width="7"/>` +
      `<path d="M90,70 Q90,40 130,40 H1790 Q1830,40 1830,70 V1010 Q1830,1040 1790,1040 H130 Q90,1040 90,1010Z" fill="none" stroke="#c99b6d" stroke-width="14"/>` +
      `<path d="M240,40 L90,190 M330,40 L90,280 M1680,1040 L1830,890" stroke="#ffffff" stroke-width="22" opacity="0.18"/>`;
  };
  const phoneUI = (x, y, sc, inner) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(sc)})">${RR(-210, -400, 420, 800, "#1f2027", 9, 46)}${RF(-185, -370, 370, 740, "#f4f6fb", 26)}${inner || ""}${RR(-60, -392, 120, 20, "#1f2027", 0, 10)}</g>`;
  const bigBell = (x, y, sc, sw) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(sc)}) rotate(${f(sw)})"><g transform="rotate(180)">${PROPS.bell(0)}</g></g>`;

  const SH = [];
  const add = (o) => SH.push(o);

  // ========== 0. СУЫҚ АШЫЛУ: үй, 06:00 ==========
  const bedArtur = (extraKeys) => ({
    look: "artur", outfit: "tee", x: 230, y: -300, rot: 90, s: 0.75, seed: 5,
    keys: [[0, { turn: 0.15, ...POSES.sleepClosed }]].concat(extraKeys || []),
  });
  const bedFront = (t) => P("M-70,-352 Q300,-372 700,-338 Q760,-300 740,-150 L-70,-150Z", "#5f7fc4", 6) + Ln("M40,-300 Q300,-320 640,-292", 4, "#4c6aaa") + Ln("M60,-230 Q320,-246 650,-224", 4, "#4c6aaa");
  const pillow = P("M760,-338 Q900,-372 1060,-336 Q1080,-290 1050,-250 Q900,-232 770,-252 Q748,-296 760,-338Z", "#ffffff", 6);
  const DOOR_T = 2.95;
  add({
    t0: 0, bg: "bedroom", cam: [[0, { x: 380, y: -520, z: 1.12 }], [3.05, { x: 330, y: -470, z: 1.3 }]],
    worldBack: () => pillow,
    actors: [bedArtur()],
    world: (t) => bedFront(t) + zzz(880, -420, t),
    fx: (t) => ({ dim: lerp(0.6, 0.28, sm(t / 3)), vig: 0.35 }),
    fadeIn: 0.8,
  });
  add({
    t0: 3.05, bg: "bedroom",
    cam: [[3.05, { x: -620, y: -430, z: 1.02 }], [4.3, { x: -560, y: -430, z: 1.02 }], [6.3, { x: 40, y: -420, z: 0.98 }]],
    shake: (t) => 10 * (1 - win(t, 3.05, 3.5)),
    worldBack: (t) => BG.door(clamp((t - DOOR_T) / 0.12, 0, 1)) + pillow,
    actors: [
      bedArtur([[4.1, { eye: { lidTop: 0.78, lidBot: 0.05 }, brow: { lift: -2 } }, 0.3]]),
      { look: "mom", outfit: "momHome", x: -1100, y: 0, s: 0.75, talk: ["L01"], seed: 21,
        keys: [[3.05, { turn: 0.4, ...RIG.EXPR.angry, mouth: "rest", ...RIG.POSES.hips, fx: { vein: 0 } }], [4.4, { ...RIG.POSES.point, armR: { sh: 84, el: 2, hand: "point" } }, 0.18]] },
    ],
    world: (t) => bedFront(t),
    fx: (t) => ({ dim: 0.22, vig: 0.3 }),
  });
  add({
    t0: 6.3, bg: "bedroom", cam: [[6.3, { x: 820, y: -330, z: 2.5 }], [9.35, { x: 840, y: -330, z: 2.75 }]],
    worldBack: () => pillow,
    actors: [bedArtur([[6.3, { eye: { lidTop: 0.8, lidBot: 0.1 }, brow: { lift: -6, angle: -6 } }], [9.0, { ...POSES.sleepClosed }, 0.3]])].map((a) => Object.assign(a, { talk: ["L02"] })),
    world: (t) => bedFront(t),
    fx: (t) => ({ dim: 0.16, dof: 3 }),
  });
  add({
    t0: 9.35, bg: "bedroom", bgKey: "bedroom", cam: [[9.35, { x: -1100, y: -560, z: 1.9 }], [11.9, { x: -1090, y: -600, z: 2.3 }], [12.5, { x: -400, y: -600, z: 2.3 }, eio]],
    worldBack: (t) => BG.door(1),
    actors: [{ look: "mom", outfit: "momHome", x: -1100, y: 0, s: 0.75, talk: ["L03"], seed: 21,
      keys: [[9.35, { turn: 0.25, ...POSES.determined, armR: { sh: 128, el: 30, hand: "fist", prop: PROPS.comb() }, armL: { sh: 58, el: -60, hand: "fist", prop: PROPS.gel() } }], [11.2, { ...RIG.EXPR.happy, mouth: "smirk", brow: { angle: 10 } }, 0.2]] }],
    fx: (t) => ({ dim: 0.1, dof: 4 }),
  });

  // айна: шаш үш рет серіппедей қайтады
  const B1 = 15.55, B2 = 17.95, B3 = 25.3;
  const hairLook = (t) => (t < 12.85 ? "artur" : t < B1 ? "arturSwept" : t < 17.05 ? "artur" : t < B2 ? "arturSwept" : t < 24.55 ? "artur" : t < B3 ? "arturSwept" : "artur");
  const boingKeys = (b, big) => [[b, { squash: 0.86 - big * 0.05, ...RIG.EXPR.shock, mouth: "oh" }, 0.05], [b + 0.07, { squash: 1.06 + big * 0.03 }, 0.1], [b + 0.2, { squash: 1 }, 0.25], [b + 0.5, { ...POSES.deadpan }, 0.3]];
  add({
    t0: 12.55, bg: "hall", c0: { x: 0, y: -560 },
    cam: [[12.55, { x: 40, y: -560, z: 1.5 }], [18.4, { x: 80, y: -560, z: 1.45 }], [19.6, { x: 160, y: -540, z: 1.32 }], [26.2, { x: 120, y: -560, z: 1.36 }], [28.9, { x: 60, y: -580, z: 1.5 }], [31.75, { x: 60, y: -620, z: 2.6 }, (k) => eio(k)]],
    shake: (t) => 14 * (1 - win(t, B1, B1 + 0.35)) * (t >= B1 ? 1 : 0) + 20 * (t >= B2 ? 1 - win(t, B2, B2 + 0.4) : 0) + 34 * (t >= B3 ? 1 - win(t, B3, B3 + 0.6) : 0),
    actors: [
      { look: "mom", outfit: "momHome", x: -290, y: 0, s: 0.72, seed: 21, talk: ["L04", "L06"],
        keys: [
          [12.55, { turn: 0.45, ...POSES.determined, armR: { sh: 128, el: 26, hand: "fist", prop: PROPS.comb() }, armL: { sh: 11, el: -7, hand: "rest" } }],
          [12.7, { armR: { sh: 150, el: 10 } }, 0.15], [12.95, { armR: { sh: 118, el: 30 } }, 0.2],
          [13.3, { ...RIG.EXPR.happy, armR: { sh: 100, el: 20 } }, 0.2],
          [B1 + 0.05, { ...RIG.EXPR.shock, mouth: "oh" }, 0.08], [B1 + 0.6, { ...POSES.determined }, 0.2],
          [16.25, { armR: { sh: 128, el: 30, hand: "fist", prop: PROPS.gel() } }, 0.15], [16.6, { armR: { sh: 150, el: 6 } }, 0.15], [16.85, { armR: { sh: 132, el: 26 } }, 0.15],
          [17.2, { ...RIG.EXPR.smug }, 0.2], [B2 + 0.05, { ...RIG.EXPR.angry, mouth: "growl", fx: { vein: 1 } }, 0.1],
          [19.6, { ...POSES.lookR, fx: { vein: 0 }, mouth: "frown" }, 0.3],
          [22.9, { ...POSES.determined, armR: { sh: 140, el: 20, hand: "fist", prop: PROPS.spray() } }, 0.2],
          [24.7, { ...RIG.EXPR.smug, armR: { sh: 100, el: 30 } }, 0.25],
          [B3 + 0.04, { ...RIG.EXPR.shock, mouth: "shock" }, 0.06],
          [26.0, { ...RIG.EXPR.sad, ...POSES.armsDown, mouthRest: "frown" }, 0.4],
          [28.9, { ...POSES.lookR }, 0.4],
        ] },
      { look: "artur", outfit: "tee", x: 60, y: 0, s: 0.75, seed: 5,
        mod: (t, p) => Object.assign(p, { look: hairLook(t) }),
        keys: [[12.55, { turn: 0.02, ...POSES.deadpan }]].concat(boingKeys(B1, 0), boingKeys(B2, 1), boingKeys(B3, 2), [[B3 + 0.6, { fx: { sweat: 0.7 } }, 0.3], [28.9, { ...POSES.deadpan, fx: { sweat: 0 }, eye: { lidTop: 0.62 } }, 0.5]]) },
      { look: "dad", outfit: "dad", x: 1150, y: 0, s: 0.74, seed: 33, talk: ["L05"],
        keys: [[12.55, { hide: true }], [18.5, { hide: false, x: 1150, turn: -0.6, ...RIG.EXPR.happy, walk: 1.6, ...POSES.phoneUp }], [18.55, { x: 560 }, 1.3, eout], [19.85, { walk: 0, ...POSES.stand }, 0.15], [B3 + 0.04, { ...RIG.EXPR.shock }, 0.08], [26.1, { ...RIG.EXPR.happy }, 0.4]] },
    ],
    world: (t) => {
      let s = "";
      for (const b of [B1, B2, B3]) s += speed(60, -640, 150, t, b, b === B3 ? 9 : 6);
      s += puff(-20, -720, t, 23.1, 1.4, 10) + puff(60, -700, t, B3, 1.1, 14);
      if (t > 19.55 && t < 19.75) s += `<circle cx="560" cy="-640" r="40" fill="#e85d75" opacity="0.9"/>`;
      return s;
    },
    over: () => mirrorFrame(),
    fx: (t) => ({ vig: 0.2 }),
  });

  // ========== 1. ТАҚЫРЫП + ЖҮРГІЗУШІ ==========
  const TITLE = 31.8;
  add({
    t0: TITLE, bg: "host", bgArgs: [["#34528f", "#1b2a52"]], bgKey: "hostBlue", noCaps: true,
    cam: [[TITLE, { x: 0, y: -380, z: 1 }], [34.0, { x: 0, y: -400, z: 1.08 }]],
    flashIn: 0.25,
    over: (t) => {
      const sw = Math.exp(-(t - TITLE) * 1.4) * Math.sin((t - TITLE) * 7) * 26;
      let s = bigBell(960, 210, 2.6, sw);
      for (let i = 0; i < 14; i++) { const a = hash(i) * 6.28, r = 300 + hash(i + 9) * 600, k = (t * 0.6 + hash(i + 3)) % 1; s += `<g transform="translate(${f(960 + Math.cos(a) * r)},${f(540 + Math.sin(a) * r * 0.5)}) scale(${f(Math.sin(k * Math.PI))})">${P("M0,-18 L5,-5 L18,0 L5,5 L0,18 L-5,5 L-18,0 L-5,-5Z", "#f6d55c", 3)}</g>`; }
      return s;
    },
    type: (t) => TY.swing(t, TITLE + 0.05, "СОҢҒЫ ҚОҢЫРАУ", 960, 560, { size: 150 }) + TY.pop(t, TITLE + 0.9, "(анимация)", 960, 700, { size: 46, color: "#ffffff", stroke: 9, weight: 700 }),
  });
  const hostArtur = (outfit, keys, talk) => ({ look: "artur", outfit, x: 0, y: 330, s: 1.15, seed: 5, talk, keys });
  add({
    t0: 34.0, bg: "host", c0: { x: 0, y: -560 },
    cam: [[34.0, { x: 0, y: -560, z: 1 }], [38.0, { x: -60, y: -590, z: 1.06 }], [44.1, { x: 40, y: -620, z: 1.14 }], [44.6, { x: 20, y: -690, z: 1.75 }, eout], [48.7, { x: 30, y: -700, z: 1.9 }]],
    actors: [hostArtur("casual", [
      [34.0, { turn: 0.15, ...RIG.EXPR.happy, ...RIG.POSES.wave }], [36.0, { ...RIG.POSES.idle, armR: { sh: 11, el: -7, hand: "rest" }, headTilt: 0 }, 0.3],
      [S("L08"), { ...RIG.POSES.cheer, ...RIG.EXPR.happy, legL: { a: 3 }, legR: { a: 3 } }, 0.18],
      [Wt("L08", 3) - 0.1, { ...RIG.POSES.idle, armL: { sh: 11, el: -7, hand: "rest" }, armR: { sh: 84, el: 2, hand: "point" }, turn: -0.2, ...POSES.lookL }, 0.2],
      [S("L09") - 0.1, { turn: 0.05, lean: 4, ...RIG.EXPR.smug, ...POSES.handMouth, armL: { sh: 11, el: -7, hand: "rest" } }, 0.25],
    ], ["L07", "L08", "L09"])],
    type: (t) => TY.pop(t, Wt("L08", 0), "11 ЖЫЛ", 560, 250, { size: 150, color: "#f6d55c", rot: -12, tilt: -4, t1: S("L09") - 0.2 }) +
      TY.pop(t, Wt("L08", 5), "≈ 2000 КҮН", 520, 470, { size: 92, color: "#ffffff", tilt: 3, t1: S("L09") - 0.2 }) +
      TY.pop(t, Wt("L08", 9), "12 000 САБАҚ", 540, 650, { size: 92, color: "#7fd1ff", tilt: -3, t1: S("L09") - 0.2 }),
    world: (t) => (t > Wt("L09", 1) ? `<g transform="translate(-430,-820) scale(${f(1.6 * spring((t - Wt("L09", 1)) / 0.8))})">${PROPS.pastry().replace("translate(0,30)", "translate(0,0)")}${TX(0, -60, "???", 56, "#e85d75", ' stroke="#141418" stroke-width="5" paint-order="stroke"')}</g>` : ""),
  });
  // «фильмдерде»: алтын түс, кинотаспа жолақтары
  const MV = S("L10") - 0.25;
  add({
    t0: MV, bg: "movie", flashIn: 0.3,
    cam: [[MV, { x: -520, y: -540, z: 1.45, r: -1 }], [S("L11") - 0.2, { x: 300, y: -540, z: 1.6, r: 1 }, (k) => k]],
    actors: [{ look: "artur", outfit: "grad", s: 0.75, seed: 5,
      keys: [[MV, { x: -650, turn: 0.75, ...RIG.EXPR.happy, eye: { lidTop: 0.35, lidBot: 0.2 }, walk: 0.42, walkAmp: 13 }], [MV + 0.01, { x: 360 }, 7.2, (k) => k]] }],
    world: (t) => {
      let s = "";
      for (let i = 0; i < 26; i++) { const k = ((t - MV) * 0.09 + hash(i)) % 1; const x = -1300 + hash(i + 5) * 2600 + Math.sin(t * 0.8 + i) * 60, y = -1200 + k * 1500; s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(t * 40 + i * 30)})">${P("M0,-14 Q12,0 0,14 Q-12,0 0,-14Z", "#ffb3c1", 3)}</g>`; }
      return s;
    },
    fx: (t) => ({ lb: eout(win(t, MV, MV + 0.8)), grain: 0.22, vig: 0.55, tint: "#ffd29a", tintA: 0.25 }),
    type: (t) => TY.pop(t, MV + 0.5, "ФИЛЬМДЕРДЕ...", 960, 210, { size: 70, color: "#fff6e0", stroke: 0, weight: 300, ls: 18, from: 0.9, style: "font-style:italic;text-shadow:0 0 30px rgba(255,200,120,0.9);", t1: S("L11") - 0.4 }),
  });
  // «шындығында» — пластинка шырылы, хаос
  const CH = S("L11") - 0.1, CH1 = Wt("L11", 8) - 0.25;
  const chaosIcons = [
    (s) => bigBell(0, 0, 3.4 * s, Math.sin(s * 30) * 20),
    (s) => `<g transform="scale(${f(s * 3.2)})">${P("M0,0 Q-60,-90 -150,-70 Q-170,0 -150,60 Q-60,80 0,0Z", "#ffffff", 7)}${P("M0,0 Q60,-90 150,-70 Q170,0 150,60 Q60,80 0,0Z", "#ffffff", 7)}${RR(-22, -22, 44, 44, "#ffffff", 7, 8)}</g>`,
    (s) => `<g transform="scale(${f(s * 1.7)})">${balloon(-120, 0, 90, "#5ab4e5", 1, 0)}${balloon(80, -40, 90, "#f6d55c", 2, 0)}${P("M180,40 l40,-40 l10,50 l50,-20 l-30,50 l60,10 l-60,20 l30,40 l-50,-20 l-10,50 l-30,-50Z", "#ffffff", 6)}</g>`,
    (s) => `<g transform="scale(${f(s * 2.4)})">${RR(-40, -90, 80, 150, "#2d2f36", 7, 30)}${Ln("M0,60 L0,200", 12)}${RR(-60, 196, 120, 18, "#2d2f36", 6, 6)}</g>`,
  ];
  add({
    t0: CH, bg: "host", bgArgs: [["#ff6b5b", "#b8282c"]], bgKey: "hostRed", c0: { x: 0, y: -560 },
    cam: [[CH, { x: 0, y: -560, z: 1.25, r: -4 }], [CH1, { x: 0, y: -560, z: 1.0, r: 3 }]],
    shake: (t) => 16 + 30 * (1 - win(t, CH, CH + 0.4)),
    flashIn: 0.2,
    over: (t) => {
      const i = Math.floor((t - CH - 0.9) / 0.55);
      if (t < CH + 0.9 || i > 3) return "";
      const k = ((t - CH - 0.9) % 0.55) / 0.55;
      let s = `<g transform="translate(960,560) rotate(${f((i % 2 ? 8 : -8) * (1 - k))})">${chaosIcons[i](0.6 + 0.5 * back(k * 2.5))}</g>`;
      for (let j = 0; j < 18; j++) { const a = j / 18 * 6.283 + i; s += Ln(`M${f(960 + Math.cos(a) * 520)},${f(540 + Math.sin(a) * 520)} L${f(960 + Math.cos(a) * 1300)},${f(540 + Math.sin(a) * 1300)}`, 10, "#ffe2a6", ' opacity="0.5"'); }
      return s;
    },
    type: (t) => TY.pop(t, CH + 0.1, "ШЫНДЫҒЫНДА...", 960, 190, { size: 120, color: "#ffffff", rot: -14, tilt: -3, fr: 20 }),
    fx: (t) => ({ grain: 0.15 }),
  });
  // жүргізуші + кері айналдыру (VHS)
  const RW = CH1, RW1 = 63.45;
  add({
    t0: RW, bg: "host", c0: { x: 0, y: -560 },
    cam: [[RW, { x: 0, y: -580, z: 1.1 }], [S("L12") - 1.1, { x: 0, y: -600, z: 1.2 }], [RW1, { x: 0, y: -600, z: 2.2, r: -8 }]],
    actors: [hostArtur("casual", [[RW, { turn: 0.1, ...RIG.EXPR.happy, ...RIG.POSES.point, armR: { sh: 120, el: 40, hand: "point" } }], [RW + 1.2, { ...RIG.POSES.idle, armR: { sh: 11, el: -7, hand: "rest" } }, 0.3]], ["L11"])],
    over: (t) => {
      const k = win(t, E("L11") + 0.1, RW1);
      if (k <= 0) return "";
      let s = "";
      for (let i = 0; i < 8; i++) { const y = ((hash(i) + t * (1.5 + i * 0.3)) % 1) * 1080; s += RF(0, y, 1920, 6 + hash(i + 2) * 18, "#ffffff", 0, ` opacity="${f(0.35 * k)}"`); }
      s += `<g opacity="${f(Math.min(1, k * 3))}">${TX(1680, 140, "◀◀", 90, "#ffffff", ' stroke="#141418" stroke-width="8" paint-order="stroke"')}</g>`;
      return s;
    },
    fx: (t) => { const k = win(t, E("L11") + 0.1, RW1); return { sepia: 0.7 * k, grain: 0.3 * k, flash: Math.max(0, (t - RW1 + 0.25) / 0.25) * 0.8 }; },
  });

  // ========== 2. КАТАЛОГ: 11 жыл бір минутта ==========
  const FB = RW1;
  const sepiaFx = (extra) => (t) => Object.assign({ sepia: 0.55, vig: 0.55, grain: 0.22, bright: 1.03 }, extra ? extra(t) : {});
  add({
    t0: FB, bg: "schoolFront", bgArgs: ["1 ҚЫРКҮЙЕК — БІЛІМ КҮНІ"], bgKey: "sf1",
    cam: [[FB, { x: 0, y: -520, z: 0.92 }], [S("L13") - 0.4, { x: -40, y: -440, z: 1.12 }], [S("L14"), { x: 120, y: -420, z: 1.35 }], [S("L15") - 0.1, { x: 140, y: -420, z: 1.42 }]],
    flashIn: 0.4,
    worldBack: (t) => { let s = ""; for (let i = 0; i < 9; i++) s += crowdPerson(-1500 + i * 360 + (i > 4 ? 300 : 0), -60, 0.42, null, i * 9 + 2); return s; },
    actors: [
      { look: "mom", outfit: "momFest", x: -470, s: 0.75, seed: 21, keys: [[FB, { turn: 0.35, ...RIG.EXPR.happy, armR: { sh: 34, el: -10, hand: "fist" } }], [S("L14") + 0.1, { ...POSES.lookR }, 0.3]] },
      { look: "kid", outfit: "school", x: -110, s: 0.75, seed: 9, keys: [[FB, { turn: 0.1, ...RIG.EXPR.shy }]] },
      { look: "teacher1", outfit: "teacher1", x: 520, s: 0.74, seed: 41, talk: ["L13"],
        keys: [[FB, { turn: -0.4, ...RIG.EXPR.happy }], [S("L13") + 1.2, { ...POSES.lookL, armR: { sh: 150, el: -40, hand: "open" }, turn: -0.2 }, 0.3], [S("L14") + 0.15, { ...RIG.EXPR.shock, mouth: "oh", armR: { sh: 11, el: -7, hand: "rest" }, eye: { px: -0.6, py: 0.5 } }, 0.15]] },
    ],
    world: (t) => bouquet(-110, -70, 1.12, Math.sin(t * 1.3) * 2 + (t > S("L14") && t < E("L14") ? Math.sin(t * 40) * 3 : 0)),
    fx: sepiaFx(),
    type: (t) => TY.stamp(t, FB + 0.6, "1-СЫНЫП", 330, 170, { t1: S("L13") }),
  });
  const WT = S("L15") - 0.1;
  add({
    t0: WT, bg: "classroom", bgArgs: [TX(0, -760, "1 қыркүйек", 90, "#ffffff", ' opacity="0.9"'), { desks: false }], bgKey: "class1",
    cam: [[WT, { x: 60, y: -460, z: 1.15 }], [E("L15") + 1.4, { x: 40, y: -480, z: 1.3 }]],
    actors: [
      { look: "kid", outfit: "school", x: 0, s: 0.75, seed: 9, keys: [[WT, { y: 40, turn: 0, ...RIG.EXPR.calm, eye: { lidTop: 0.98 } }], [WT + 2.2, { y: -390, ...RIG.EXPR.shock, mouth: "shock", fx: { sweat: 1 } }, 0.18, back]] },
      { look: "teacher1", outfit: "teacher1", x: 520, s: 0.74, seed: 41, keys: [[WT, { turn: -0.45, ...RIG.EXPR.happy, armR: { sh: 70, el: 60, hand: "fist", prop: PROPS.can() } }], [WT + 1.4, { armR: { sh: 100, el: 50 } }, 0.4], [WT + 2.3, { ...RIG.EXPR.shock, mouth: "oh" }, 0.15]] },
    ],
    worldBack: () => P("M-170,-40 L170,-40 L130,0 L-130,0Z", "#8b8f99", 6),
    world: (t) => {
      let s = bouquet(0, -40, 0.8, Math.sin(t * 1.1) * 1.5) + P("M-200,-300 L200,-300 L170,0 L-170,0Z", "#a7b6c9", 7) + Ln("M-190,-250 L190,-250", 4, "#8796ab");
      if (t > WT + 1.2 && t < WT + 3.6) for (let i = 0; i < 16; i++) { const k = ((t - WT) * 1.6 + i / 16) % 1; s += `<circle cx="${f(330 - k * 260 + hash(i) * 40)}" cy="${f(-700 + k * k * 380)}" r="9" fill="#7fd1ff" stroke="${INK}" stroke-width="3"/>`; }
      return s;
    },
    fx: sepiaFx(),
  });
  // 5-сынып: электронды күнделік
  const DI = S("L16") - 0.35, DI1 = S("L17") - 0.55;
  add({
    t0: DI, bg: "host", bgArgs: [["#d6ecff", "#a9cdee"]], bgKey: "hostSky", noCaps: false,
    cam: [[DI, { x: 0, y: -380, z: 1 }], [DI1, { x: 0, y: -380, z: 1.06 }]],
    flashIn: 0.25,
    over: (t) => {
      const rows = [["Қазақ тілі", "5", "#3aa66b"], ["Тарих", "4", "#3a86d6"], ["Математика", "2", "#e0413f"]];
      let inner = RF(-185, -370, 370, 110, "#3f6fb5", 26) + `<text x="0" y="-298" font-size="30" fill="#fff" font-family="Montserrat" font-weight="800" text-anchor="middle">Электронды күнделік</text>`;
      rows.forEach(([n, g, c], i) => { const k = spring((t - DI - 0.5 - i * 0.45) / 0.7); if (k <= 0) return; inner += `<g transform="translate(${f(-400 * (1 - k))},${-200 + i * 120})">${RR(-160, -46, 320, 92, "#ffffff", 4, 16)}<text x="-138" y="12" font-size="32" font-family="Montserrat" font-weight="700" fill="${INK}">${n}</text>${C(110, 0, 34, c, 4)}<text x="110" y="14" font-size="40" font-family="Montserrat" font-weight="900" fill="#fff" text-anchor="middle">${g}</text></g>`; });
      let s = phoneUI(960, 560, 1.05, inner);
      // құлып ашылады
      const lk = win(t, Wt("L16", 13) - 0.1, Wt("L16", 13) + 0.35);
      if (lk > 0) s += `<g transform="translate(1440,540) scale(${f(1.5 * spring(lk * 1.2))})">${P(`M-40,-10 L-40,-60 Q-40,-110 0,-110 Q40,-110 40,${f(-60 - 40 * lk)}`, "none", 14)}${RR(-60, -14, 120, 100, "#f6d55c", 8, 14)}${C(0, 30, 12, INK, 0)}</g>`;
      return s;
    },
    type: (t) => TY.stamp(t, DI + 0.3, "5-СЫНЫП", 420, 200, { color: "#3f6fb5", t1: DI1 - 0.3 }),
  });
  // подъезд: апасы есікте күтіп тұр
  const ST = DI1;
  const kid5 = { hair: "artur", brow: "thick", mole: true, kid: [0.68, 0.9], lid: -0.1 };
  add({
    t0: ST, bg: "stairs",
    cam: [[ST, { x: -520, y: -460, z: 0.95 }], [S("L18") - 0.2, { x: -420, y: -440, z: 1.0 }], [S("L19") - 0.1, { x: -160, y: -520, z: 1.3 }], [E("L19") + 1.2, { x: -120, y: -540, z: 1.4 }]],
    actors: [
      { look: "mom", outfit: "momHome", x: -40, s: 0.75, seed: 21, talk: ["L17", "L19"],
        keys: [[ST, { turn: -0.35, ...RIG.EXPR.angry, mouth: "rest", fx: { vein: 1 }, ...POSES.hipsL, armR: { sh: 60, el: 90, hand: "fist", propFront: PROPS.phone("#e0413f") } }], [S("L19") - 0.2, { ...RIG.EXPR.smug, fx: { vein: 0 }, armR: { sh: 120, el: 40, hand: "fist" } }, 0.25]] },
      { look: kid5, outfit: "school", s: 0.75, seed: 9, talk: ["L18"],
        keys: [[ST, { x: -1500, turn: 0.7, ...RIG.EXPR.happy, walk: 1.7 }], [ST + 0.01, { x: -820 }, 1.6, (k) => k], [ST + 1.62, { walk: 0, ...POSES.stand, ...RIG.EXPR.shock, mouth: "shock" }, 0.12], [S("L18"), { ...RIG.EXPR.scared, turn: 0.4, ...RIG.POSES.shrug }, 0.2], [E("L18") + 0.6, { ...RIG.EXPR.sad, ...POSES.armsDown }, 0.3]] },
    ],
    over: (t) => {
      const k = win(t, ST - 0.05, ST + 0.25), o = 1 - win(t, S("L17") + 1.6, S("L17") + 1.9);
      if (k <= 0 || o <= 0) return "";
      return `<g transform="translate(1440,${f(170 - 120 * (1 - eout(k)))})" opacity="${f(o)}">${RR(-330, -70, 660, 140, "#ffffff", 6, 30)}${C(-260, 0, 38, "#3f6fb5", 4)}<text x="-200" y="-12" font-size="30" font-family="Montserrat" font-weight="800" fill="${INK}">Электронды күнделік</text><text x="-200" y="34" font-size="34" font-family="Montserrat" font-weight="900" fill="#e0413f">Математика — 2</text></g>`;
    },
  });
  // асхана
  const CA = S("L20") - 0.6;
  add({
    t0: CA, bg: "canteen", c0: { x: 0, y: -600 },
    cam: [[CA, { x: -700, y: -640, z: 1.05 }], [S("L21") - 0.1, { x: 300, y: -620, z: 1.12 }]],
    worldBack: () => crowdPerson(-200, -420, 0.62, "#b7bcc6", 4) + `<g transform="translate(-200,-640)">${RR(-70, -40, 140, 50, "#ffffff", 5, 12)}</g>`,
    type: (t) => TY.pop(t, Wt("L20", 4), "ҮЗІЛІС: 10 МИН", 1300, 230, { size: 96, color: "#ffffff", tilt: -3 }),
  });
  // табын: оқушылар асханаға шабады
  const RUN = S("L21") - 0.15, RUN1 = Wt("L21", 7) - 0.2;
  add({
    t0: RUN, bg: "corridor", c0: { x: 0, y: -400 },
    cam: [[RUN, { x: 0, y: -420, z: 1.15 }], [RUN1, { x: 0, y: -380, z: 0.95 }]],
    shake: () => 9,
    world: (t) => {
      let s = "";
      const items = [];
      for (let i = 0; i < 22; i++) { const k = ((t - RUN) * 0.55 + hash(i * 1.7)) % 1; const z = 0.25 + k * 1.2; items.push([z, i]); }
      items.sort((a, b) => a[0] - b[0]);
      for (const [z, i] of items) { const x = (hash(i + 4) - 0.5) * 900 * z + Math.sin(t * 9 + i) * 8, y = -260 + 560 * (z - 0.25) + Math.abs(Math.sin(t * 11 + i)) * -18; s += crowdPerson(x, y, 0.5 * z, null, i * 5 + 1); }
      for (let i = 0; i < 6; i++) { const k = ((t - RUN) * 0.8 + i / 6) % 1; s += `<circle cx="${f((hash(i) - 0.5) * 1600)}" cy="${f(200 - k * 60)}" r="${f(60 + k * 120)}" fill="#d9c7a3" opacity="${f(0.55 * (1 - k))}"/>`; }
      return s;
    },
    type: (t) => TY.pop(t, Wt("L21", 2), "ЖҮГІРУ −2 мин", 560, 200, { size: 76, color: "#ffffff", tilt: -5 }) + TY.pop(t, Wt("L21", 5), "КЕЗЕК −8 мин", 1360, 330, { size: 76, color: "#ffffff", tilt: 4 }),
  });
  const LAST = RUN1;
  add({
    t0: LAST, bg: "canteen", c0: { x: 0, y: -600 },
    cam: [[LAST, { x: 200, y: -380, z: 1.45 }], [E("L21") + 0.3, { x: 210, y: -360, z: 1.75 }], [S("L22") - 0.5, { x: 220, y: -350, z: 1.9 }]],
    shake: (t) => (t > Wt("L21", 9) && t < Wt("L21", 9) + 0.6 ? 14 : 0),
    actors: [{ look: "artur", outfit: "school", x: 200, y: 260, s: 0.75, seed: 5,
      keys: [[LAST, { turn: 0.1, ...RIG.EXPR.happy, armR: { sh: 58, el: -168, hand: "fist", propFront: PROPS.pastry() } }], [Wt("L21", 9), { ...RIG.EXPR.shock, mouth: "oh" }, 0.08], [Wt("L21", 9) + 0.45, { armR: { sh: 60, el: -205 }, mouth: "mbp", eye: { scale: 1.2, lidTop: 0, pupil: 0.5 }, fx: { blush: 1, sweat: 1 } }, 0.12], [Wt("L21", 9) + 0.6, { squash: 0.95 }, 0.06], [Wt("L21", 9) + 0.72, { squash: 1 }, 0.15]] }],
    type: (t) => TY.pop(t, Wt("L21", 9), "ТАМАҚ = 0 мин", 1380, 220, { size: 96, color: "#ff6b5b", rot: 12, fr: 22 }),
  });
  // Гүлнар апай: супер күш
  const GA = S("L22") - 0.4, GA1 = Wt("L22", 12) - 0.15;
  const teacherAt = (x, keys, talk) => ({ look: "teacher", outfit: "teacher", x, s: 0.75, seed: 41, talk, keys });
  add({
    t0: GA, bg: "classroom", bgArgs: [TX(0, -790, "Алгебра", 90, "#ffffff", ' opacity="0.9"')], bgKey: "classAlg",
    cam: [[GA, { x: -900, y: -500, z: 1.2 }], [Wt("L22", 5), { x: -1050, y: -560, z: 1.6 }], [GA1, { x: -1080, y: -600, z: 1.85 }]],
    actors: [teacherAt(-1100, [[GA, { turn: 0.3, ...RIG.EXPR.calm, eye: { lidTop: 0.4 } }], [Wt("L22", 9), { ...RIG.EXPR.smug, headTilt: 4 }, 0.2]])],
    over: (t) => { const k = win(t, Wt("L22", 9) - 0.1, Wt("L22", 9) + 0.3); if (k <= 0) return ""; let s = ""; for (let j = 0; j < 22; j++) { const a = j / 22 * 6.283; s += Ln(`M${f(960 + Math.cos(a) * 420)},${f(500 + Math.sin(a) * 420)} L${f(960 + Math.cos(a) * 1400)},${f(500 + Math.sin(a) * 1400)}`, 16, "#f6d55c", ` opacity="${f(0.55 * k)}"`); } return s; },
    type: (t) => TY.stamp(t, Wt("L22", 5) - 0.1, "ГҮЛНАР АПАЙ · сынып жетекші", 1250, 200, { color: "#7d3040", size: 56, rot: -3 }) + TY.pop(t, Wt("L22", 9), "СУПЕР КҮШ!", 1350, 860, { size: 110, color: "#f6d55c", rot: -18, tilt: -6 }),
  });
  // кесінді: үш қабатты ғимарат, діріл толқыны
  add({
    t0: GA1, bg: "host", bgArgs: [["#e9e4da", "#d8d1c3"]], bgKey: "hostPaper",
    cam: [[GA1, { x: 0, y: -380, z: 1.0 }], [S("L23") - 0.6, { x: 0, y: -380, z: 1.06 }]],
    over: (t) => {
      let s = RR(560, 120, 800, 860, "#e9c9a0", 8, 6);
      for (let i = 0; i < 3; i++) s += Ln(`M560,${120 + (i + 1) * 286} L1360,${120 + (i + 1) * 286}`, 7) + TX(500, 270 + i * 286, String(3 - i), 64, INK);
      s += `<g transform="translate(760,400) scale(0.32)">${RIG.draw(Object.assign({}, RIG.EXPR.smug, { look: "teacher", outfit: "teacher", turn: 0.2 }), { seed: Math.floor(t * 12), id: "tg" })}</g>`;
      const bz = Math.sin(t * 90) * 6;
      s += `<g transform="translate(${f(1130 + bz)},930)">${RR(-80, -110, 160, 120, "#e85d75", 6, 20)}${RR(-40, -150, 80, 50, "none", 6, 20)}</g>${Ln(`M1030,820 l-26,-10 M1030,860 l-30,0 M1230,820 l26,-10 M1230,860 l30,0`, 5)}`;
      for (let i = 0; i < 4; i++) { const k = ((t - GA1) * 0.8 + i / 4) % 1; s += `<ellipse cx="${f(lerp(1130, 790, k))}" cy="${f(lerp(860, 260, k))}" rx="${f(60 + 90 * k)}" ry="${f(30 + 40 * k)}" fill="none" stroke="#3f6fb5" stroke-width="8" opacity="${f(1 - k)}"/>`; }
      return s;
    },
  });
  // «Телефоныңды бер»
  const PH = S("L23") - 0.5, BUZZ = E("L24") + 0.25;
  add({
    t0: PH, bg: "classroom", bgKey: "classAlg", bgArgs: [TX(0, -790, "Алгебра", 90, "#ffffff", ' opacity="0.9"')],
    cam: [[PH, { x: -150, y: -520, z: 1.3 }], [S("L24"), { x: 100, y: -520, z: 1.45 }], [BUZZ, { x: 120, y: -500, z: 1.5 }], [S("L25") - 0.4, { x: 140, y: -520, z: 1.65 }]],
    shake: (t) => (t > BUZZ && t < BUZZ + 0.9 ? 6 : 0),
    actors: [
      teacherAt(-420, [[PH, { turn: 0.35, ...RIG.EXPR.angry, mouth: "rest", fx: { vein: 0 }, armR: { sh: 76, el: -20, hand: "open" } }], [BUZZ + 0.1, { ...RIG.EXPR.smug, eye: { px: 0.6, py: 0.6 } }, 0.2]], ["L23"]),
      { look: "artur", outfit: "school", x: 300, s: 0.75, seed: 5, talk: ["L24"], keys: [[PH, { turn: -0.25, ...RIG.EXPR.scared, mouth: "rest" }], [S("L24"), { ...RIG.POSES.shrug }, 0.2], [BUZZ, { ...RIG.EXPR.shy, mouth: "wavy", fx: { sweat: 1, blush: 1 }, ...POSES.armsDown }, 0.12]] },
    ],
    world: (t) => { const bz = t > BUZZ && t < BUZZ + 1.6 ? Math.sin(t * 95) * 7 : 0; return `<g transform="translate(${f(560 + bz)},-10)">${RR(-90, -150, 180, 150, "#3f6fb5", 6, 24)}${RR(-50, -190, 100, 60, "none", 6, 22)}</g>` + (bz ? Ln("M450,-120 l-30,-12 M450,-70 l-34,0 M670,-120 l30,-12 M670,-70 l34,0", 5) : ""); },
    nearWorld: () => `<g transform="translate(700,330)">${RR(-420, -300, 840, 56, "#c99b6d", 7, 4)}</g>`,
  });
  // 7 жыл бойы: «ақылды, бірақ жалқаусың»
  const YR = S("L25") - 0.4, YR1 = S("L26") - 0.3;
  add({
    t0: YR, bg: "classroom", bgKey: "classAlg", bgArgs: [TX(0, -790, "Алгебра", 90, "#ffffff", ' opacity="0.9"')],
    cam: [[YR, { x: -100, y: -500, z: 1.2 }], [YR1, { x: -100, y: -500, z: 1.25 }]],
    actors: [
      teacherAt(-450, [[YR, { turn: 0.35, ...RIG.EXPR.calm, armR: { sh: 120, el: 40, hand: "point" } }]]),
      { look: kid5, outfit: "school", x: 250, s: 0.75, seed: 9, mod: (t, p) => { const i = Math.floor((t - YR) / 0.42); const k = clamp(i / 6, 0, 1); return Object.assign(p, { look: Object.assign({}, kid5, { kid: [lerp(0.66, 1, k), lerp(0.88, 1, k)], lid: lerp(-0.1, 0, k) }) }); }, keys: [[YR, { turn: -0.3, ...POSES.deadpan }]] },
    ],
    type: (t) => { const i = clamp(Math.floor((t - YR) / 0.42), 0, 6); return TY.pop(t, YR + i * 0.42, `${5 + i}-СЫНЫП`, 1500, 200, { size: 80, color: "#ffffff", from: 0.7, fr: 25 }); },
  });
  add({
    t0: YR1, bg: "classroom", bgKey: "classAlg", bgArgs: [TX(0, -790, "Алгебра", 90, "#ffffff", ' opacity="0.9"')],
    cam: [[YR1, { x: -430, y: -620, z: 2.0 }], [S("L27") - 0.3, { x: -430, y: -620, z: 2.2 }], [S("L27"), { x: 250, y: -600, z: 2.0 }, eout], [E("L27") + 1.0, { x: 260, y: -610, z: 2.15 }]],
    actors: [
      teacherAt(-450, [[YR1, { turn: 0.35, ...RIG.EXPR.calm, eye: { lidTop: 0.45 }, armR: { sh: 120, el: 40, hand: "point" } }], [Wt("L26", 4), { ...RIG.EXPR.sad, mouth: "frown", brow: { angle: 8 } }, 0.2]], ["L26"]),
      { look: "artur", outfit: "school", x: 250, s: 0.75, seed: 5, talk: ["L27"], keys: [[YR1, { turn: -0.3, ...POSES.deadpan }], [S("L27"), { ...RIG.EXPR.smug, turn: 0.05, ...POSES.thumbs }, 0.25]] },
    ],
    world: (t) => { if (t < S("L27")) return ""; let s = ""; for (let i = 0; i < 6; i++) { const k = ((t - S("L27")) * 0.9 + i / 6) % 1; s += `<g transform="translate(${f(250 + Math.cos(i * 1.7) * 220)},${f(-760 + Math.sin(i * 2.3) * 140)}) scale(${f(Math.sin(k * Math.PI) * 1.3)})">${P("M0,-22 L6,-6 L22,0 L6,6 L0,22 L-6,6 L-22,0 L-6,-6Z", "#f6d55c", 4)}</g>`; } return s; },
    type: (t) => TY.stamp(t, Wt("L26", 4), "БІРАҚ", 560, 250, { color: "#e0413f", size: 90, t1: S("L27") - 0.1 }),
  });

  // ========== 3. ТАПСЫРМА + АЯУЛЫМ ==========
  const TS = S("L28") - 0.6, FR = E("L30") + 0.15;
  add({
    t0: TS, bg: "classroom", bgArgs: [TX(0, -790, "Ертең — СОҢҒЫ ҚОҢЫРАУ!", 74, "#ffffff", ' opacity="0.92"')], bgKey: "classEve",
    cam: [[TS, { x: -700, y: -480, z: 1.05 }], [S("L29"), { x: -720, y: -500, z: 1.2 }], [S("L30") - 0.2, { x: -560, y: -540, z: 1.35 }], [FR, { x: -520, y: -560, z: 1.45 }]],
    flashIn: 0.2,
    actors: [
      teacherAt(-1150, [[TS, { turn: 0.4, ...RIG.EXPR.calm }], [S("L29") + 1, { ...RIG.EXPR.happy, mouth: "smile", armR: { sh: 100, el: 20, hand: "point" } }, 0.3]], ["L29"]),
      { look: "artur", outfit: "school", s: 0.75, seed: 5, talk: ["L30"], keys: [[TS, { x: 200, turn: -0.7, walk: 1.6, ...RIG.EXPR.calm }], [TS + 0.01, { x: -560 }, 2.2, eout], [TS + 2.25, { walk: 0, ...POSES.stand, turn: -0.4 }, 0.2], [S("L30"), { ...RIG.EXPR.happy, ...POSES.thumbs, turn: -0.2 }, 0.2]] },
    ],
    over: (t) => {
      const k = win(t, S("L29") + 1.8, S("L29") + 2.3) * (1 - win(t, S("L30"), S("L30") + 0.3));
      if (k <= 0) return "";
      let s = `<g transform="translate(1340,330) scale(${f(eout(k))})">${P("M-300,-200 Q-320,-260 -220,-270 Q-160,-330 -40,-300 Q60,-350 160,-300 Q300,-310 300,-200 Q360,-120 280,-40 Q300,60 160,70 Q40,120 -80,70 Q-240,100 -280,0 Q-360,-90 -300,-200Z", "#ffffff", 7)}`;
      s += `<g transform="translate(-40,40) scale(0.27)">${RIG.draw(Object.assign({}, RIG.EXPR.happy, POSES.carry, { turn: 0.2, outfit: "grad" }), { seed: 1, id: "bb1" })}</g>`;
      s += `<g transform="translate(15,-120) scale(0.27)">${RIG.draw(Object.assign({}, RIG.EXPR.happy, { look: "girl", outfit: "girl", turn: 0.2, armR: { sh: 160, el: 10, hand: "fist", propFront: PROPS.bell(Math.sin(t * 18) * 30) } }), { seed: 1, id: "bb2" })}</g>`;
      s += `</g>${C(1010, 600, 26, "#ffffff", 6)}${C(960, 680, 16, "#ffffff", 5)}`;
      return s;
    },
  });
  add({
    t0: FR, bg: "classroom", bgKey: "classEve", bgArgs: [TX(0, -790, "Ертең — СОҢҒЫ ҚОҢЫРАУ!", 74, "#ffffff", ' opacity="0.92"')], still: true,
    cam: [[FR, { x: -540, y: -620, z: 1.9 }], [E("L31") + 0.8, { x: -555, y: -640, z: 2.4 }, (k) => k]],
    actors: [{ look: "artur", outfit: "school", x: -560, s: 0.75, seed: 5, blink: false, keys: [[FR, { turn: -0.2, ...RIG.EXPR.happy, ...POSES.thumbs, noBlink: true }]] }].map((a) => Object.assign(a, { mod: (t, p) => p })),
    fx: (t) => ({ sat: lerp(1, 0.15, win(t, FR, FR + 0.25)), vig: 0.6, grain: 0.2, flash: 0.6 * (1 - win(t, FR, FR + 0.2)) }),
    type: (t) => TY.stamp(t, S("L31") + 0.3, "ЕҢ ҮЛКЕН ҚАТЕЛІК", 1300, 820, { color: "#e0413f", size: 72, rot: -8 }),
  });
  // Аяулыммен танысу (аула, таңертең)
  const AY = S("L32") - 0.6;
  const girlAt = (x, keys, talk) => ({ look: "girl", outfit: "girl", x, s: 0.75, seed: 61, talk, keys });
  add({
    t0: AY, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[AY, { x: 900, y: -470, z: 1.2 }], [S("L33") - 0.2, { x: 760, y: -420, z: 1.3 }], [S("L35"), { x: 700, y: -440, z: 1.45 }], [S("L36"), { x: 760, y: -440, z: 1.3 }], [E("L36") + 2.6, { x: 900, y: -460, z: 1.2 }]],
    shake: (t) => (t > E("L35") && t < E("L35") + 0.4 ? 8 : 0),
    worldBack: (t) => `<g transform="translate(0,400)">${BG.arch(0, t, 1700)}</g>`,
    actors: [
      girlAt(560, [[AY, { turn: 0.3, ...POSES.suspicious, mouth: "rest" }], [S("L33") - 0.1, { ...POSES.lookUp, headTilt: 6 }, 0.2], [S("L35"), { ...RIG.EXPR.angry, mouth: "rest", fx: { vein: 0 }, ...RIG.POSES.hips }, 0.2], [S("L36") + 0.6, { ...RIG.EXPR.smug, ...RIG.POSES.point, armR: { sh: 84, el: 2, hand: "point" }, turn: 0.5 }, 0.25]], ["L33", "L35"]),
      { look: "artur", outfit: "grad", x: 980, s: 0.75, seed: 5, talk: ["L34"], keys: [[AY, { turn: -0.35, ...RIG.EXPR.happy }], [S("L33"), { ...POSES.lookL, eye: { py: 0.5 } }, 0.3], [S("L34") - 0.1, { ...RIG.EXPR.happy, eye: { py: 0.5, px: -0.5 } }, 0.2], [E("L35") + 0.05, { ...RIG.EXPR.scared, mouth: "wavy", squash: 0.94 }, 0.1], [E("L35") + 0.4, { squash: 1 }, 0.2], [S("L36") + 0.7, { ...POSES.deadpan, turn: 0.4, armR: { sh: 140, el: -100, hand: "open" } }, 0.3]] },
    ],
    over: (t) => {
      const k = win(t, Wt("L32", 5), Wt("L32", 5) + 0.3) * (1 - win(t, S("L33") - 0.3, S("L33")));
      if (k <= 0) return "";
      return `<g opacity="${f(k)}">${Ln("M700,250 Q640,300 690,370", 8, "#ffffff")}${Ln("M700,250 Q640,300 690,370", 3)}${P("M672,350 L696,382 L712,348Z", "#ffffff", 4)}</g>`;
    },
    fx: (t) => { const p = t > E("L35") - 0.6 && t < E("L35") + 1.2 ? 1 : 0; const red = Math.floor(t * 6) % 2; return { tint: red ? "#ff6b6b" : "#6b9bff", tintA: p * 0.3 }; },
    type: (t) => TY.stamp(t, Wt("L32", 1), "АЯУЛЫМ · 7 жас", 560, 160, { color: "#3f6fb5", size: 62, t1: S("L33") - 0.3 }) + TY.pop(t, Wt("L32", 5), "бантиктер > бас", 760, 250, { size: 56, color: "#ffffff", stroke: 10, weight: 800, tilt: -4, t1: S("L33") - 0.3 }),
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = Object.assign(G.SONGY_MARKS || {}, { DOOR_T, B1, B2, B3, TITLE, MV, CH, CH1, RW1, FB, WT, DI, DI1, ST, CA, RUN, RUN1, LAST, GA, GA1, PH, BUZZ, YR, YR1, TS, FR, AY });
  G.SONGY_H = { Wt, POSES, tears, zzz, speed, puff, mirrorFrame, phoneUI, bigBell, girlAt, teacherAt, hostArtur };
})(typeof window !== "undefined" ? window : globalThis);
