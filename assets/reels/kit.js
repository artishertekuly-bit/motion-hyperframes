/* Reels — үш роликке ортақ көмекшілер: позалар, кейіпкерлер, эффектілер, мессенджер экраны, «заң» мөрлері.
 * Тәуелділік: artur-rig.js, songy/bg.js, reels/bg.js, reels/engine.js (G.SONGY). */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RB = G.REELS_BG, RIG = G.ArturRig;
  const { LN, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { P, F, Ln, RF, C, T, INK, f } = B;
  const RR = B.R;
  const { E: EL, g, TB } = RB;

  // сөздің басталу уақыты (n-ші сөз, 0-ден)
  function Wt(id, n) {
    const l = LN[id];
    const toks = l.text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
    const letters = l.chars.filter(([c]) => /[\p{L}\p{N}]/u.test(c));
    let idx = 0;
    for (let i = 0; i < n && i < toks.length; i++) idx += (toks[i].match(/[\p{L}\p{N}]/gu) || []).length;
    return letters[Math.min(idx, letters.length - 1)][1];
  }

  // ---------- заттар (қолда; білезік (0,0), саусақтар +y) ----------
  const MIC = `<g>${RR(-13, -16, 26, 92, "#2a2b31", 5, 9)}${C(0, 100, 32, "#6b6e78", 6)}${Ln("M-22,92 L22,92 M-26,104 L26,104 M-20,116 L20,116", 3, "#3b3f4a")}</g>`;
  const PROP = {
    mic: MIC,
    phone: (scr) => B.PROPS.phone(scr),
    keys: `<g transform="translate(0,40)">${C(0, 0, 22, "none", 6)}${RR(-6, 18, 12, 50, "#d7dbe2", 4, 4)}${RR(14, 8, 40, 26, "#e85d75", 4, 6)}</g>`,
    bill: `<g transform="translate(0,46) rotate(90)">${RR(-60, -30, 120, 60, "#9fd09a", 5, 6)}${T(0, 12, "₸", 30, "#2f6b2c")}</g>`,
    cloth: `<g transform="translate(0,40)">${P("M-40,-20 Q0,-40 40,-20 L50,40 Q0,60 -50,40Z", "#f6d55c", 5)}</g>`,
    needles: `<g transform="translate(0,30)">${Ln("M-50,-30 L60,50 M50,-30 L-60,50", 6, "#c9a24a")}${C(0, 30, 34, "#e85d75", 5)}</g>`,
    tissue: B.PROPS.tissue(),
    photo: (col) => `<g transform="translate(0,60)">${RR(-56, -40, 112, 150, "#ffffff", 5, 4)}${RF(-46, -30, 92, 100, col || "#f2a5b8")}${C(0, 0, 22, "#ffffff", 4)}${P("M-26,60 Q0,20 26,60Z", "#ffffff", 4)}</g>`,
    bino: `<g transform="translate(0,40)">${RR(-46, -26, 40, 70, "#2a2b31", 5, 12)}${RR(6, -26, 40, 70, "#2a2b31", 5, 12)}${C(-26, 50, 18, "#9fd0e8", 4)}${C(26, 50, 18, "#9fd0e8", 4)}</g>`,
  };

  // ---------- позалар ----------
  const POSES = {
    mic: { armR: { sh: 20, el: -160, hand: "fist", prop: MIC } },
    micLow: { armR: { sh: 24, el: -60, hand: "fist", prop: MIC } },
    phoneUp: { armL: { sh: 64, el: 108, hand: "fist", propFront: B.PROPS.phone() } },
    phoneEar: { armR: { sh: 36, el: -150, hand: "fist", propFront: B.PROPS.phone() } },
    phoneMouth: { armR: { sh: 46, el: -128, hand: "fist", propFront: B.PROPS.phone("#bfe3fb") } },
    phoneRead: { armL: { sh: 36, el: 96, hand: "fist", propFront: B.PROPS.phone("#bfe3fb") }, armR: { sh: 30, el: 100, hand: "point" } },
    facepalm: { armR: { sh: 24, el: -150, hand: "open" } },
    chest: { armR: { sh: 40, el: -120, hand: "open" } },
    armsDown: { armL: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" }, armR: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" } },
    hug: { armL: { sh: 78, el: -50, hand: "open" }, armR: { sh: 78, el: -50, hand: "open" } },
    reach: { armR: { sh: 76, el: -6, hand: "open" } },
    reachBoth: { armL: { sh: 96, el: 6, hand: "open" }, armR: { sh: 96, el: 6, hand: "open" } },
    hands1: { armR: { sh: 150, el: 10, hand: "point" } },
    stop: { armR: { sh: 92, el: -50, hand: "open" } },
    fingerUp: { armR: { sh: 60, el: -128, hand: "point" } },
    steer: { armL: { sh: 34, el: -52, hand: "fist" }, armR: { sh: 34, el: -52, hand: "fist" } },
    sitFloor: { legL: { a: 38, k: 30 }, legR: { a: 38, k: 30 } },
    sitChair: { legL: { a: 70, k: 80 }, legR: { a: 70, k: 80 } },
    stand: { legL: { a: 3, k: 0 }, legR: { a: 3, k: 0 } },
    fly: { armL: { sh: 170, el: 0, hand: "open" }, armR: { sh: 170, el: 0, hand: "open" }, legL: { a: 30, k: 60 }, legR: { a: -10, k: 20 }, lean: 70 },
    determined: { eye: { lidTop: 0.38, lidBot: 0.1, lidTilt: 0.6, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -4, angle: 16, liftL: 0, liftR: 0 }, mouth: "smirk" },
    deadpan: { eye: { lidTop: 0.55, lidBot: 0.08, lidTilt: 0, px: 0, py: 0, pupil: 0.9, happy: 0, scale: 1 }, brow: { lift: -2, angle: 0, liftL: 0, liftR: 0 }, mouth: "hmm", fx: { sweat: 0, blush: 0, vein: 0 } },
    tired: { eye: { lidTop: 0.62, lidBot: 0.12, lidTilt: -0.3, px: 0, py: 0.2, pupil: 1, happy: 0, scale: 1 }, brow: { lift: 4, angle: -10, liftL: 0, liftR: 0 }, mouth: "wavy", fx: { sweat: 0.6, blush: 0, vein: 0 } },
    strain: { eye: { lidTop: 0.98, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -6, angle: 20, liftL: 0, liftR: 0 }, mouth: "growl", fx: { sweat: 1, blush: 1, vein: 1 } },
    closed: { eye: { lidTop: 0.98, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -4, angle: -2, liftL: 0, liftR: 0 }, mouth: "rest" },
    warm: { eye: { scale: 1, lidTop: 0.5, lidBot: 0.36, lidTilt: 0, px: 0, py: 0.1, pupil: 1, happy: 0 }, brow: { lift: 6, angle: -8, liftL: 0, liftR: 0 }, mouth: "smile" },
    nervous: { eye: { scale: 1.08, lidTop: 0.1, lidBot: 0.05, lidTilt: 0, px: 0, py: 0, pupil: 0.62, happy: 0 }, brow: { lift: 14, angle: -16, liftL: 0, liftR: 0 }, mouth: "wavy", fx: { sweat: 1, blush: 0.3, vein: 0 } },
    calmSmile: { eye: { scale: 1, lidTop: 0.42, lidBot: 0.2, lidTilt: 0, px: 0, py: 0.05, pupil: 1, happy: 0 }, brow: { lift: 2, angle: -2, liftL: 0, liftR: 0 }, mouth: "smile", fx: { sweat: 0, blush: 0, vein: 0 } },
    twitch: { eye: { scale: 1, lidTop: 0.42, lidBot: 0.2, lidTilt: 0, px: 0, py: 0.05, pupil: 1, happy: 0 }, brow: { lift: 2, angle: 6, liftL: 10, liftR: -4 }, mouth: "smile", fx: { sweat: 0.5, blush: 0, vein: 1 } },
    proud: { eye: { scale: 1, lidTop: 0.5, lidBot: 0.2, lidTilt: 0, px: 0, py: -0.1, pupil: 1, happy: 1 }, brow: { lift: 10, angle: -4, liftL: 0, liftR: 0 }, mouth: "laugh", fx: { sweat: 0, blush: 0.4, vein: 0 } },
    lookUp: { eye: { py: -0.7 } },
    lookL: { eye: { px: -0.7 } },
    lookR: { eye: { px: 0.7 } },
    lookD: { eye: { py: 0.7 } },
    lookC: { eye: { px: 0, py: 0.05 } },
  };
  G.SONGY_POSES = POSES;

  // ---------- жаңа образдар ----------
  RIG.HAIR.sauleBob = Object.assign({}, RIG.HAIR.teacher, { color: "#7a3b2a" });
  RIG.HAIR.brideBun = Object.assign({}, RIG.HAIR.mom, { color: "#2a1f1c" });
  Object.assign(RIG.LOOKS, {
    asaba: { hair: "dad", brow: "thick2", mustache: true, body: { w: 1.32, arm: 54, leg: 64 } },
    groom: { hair: "arturSwept", brow: "thick", body: { w: 1.1, arm: 48, leg: 58 } },
    bride: { hair: "brideBun", brow: "thin", lashes: true, body: { w: 0.9, arm: 38, leg: 42 } },
    saule: { hair: "sauleBob", brow: "thin", lashes: true, blushK: 0.4, body: { w: 1.06, arm: 44, leg: 46 } },
    driver: { hair: "buzz", brow: "thick2", mustache: true, body: { w: 1.25, arm: 54, leg: 62 } },
    teen: { hair: "artur", brow: "thick", body: { w: 1.0, arm: 44, leg: 54 } },
  });
  Object.assign(RIG.OUTFITS, {
    suit: { base: "school", pal: { blazer: "#2f3a58", blazerShade: "#27304a", tie: "#c23b4e", trousers: "#2f3a58" } },
    asaba: { base: "school", pal: { blazer: "#b8862f", blazerShade: "#9c6f22", tie: "#7a1f3d", trousers: "#2a2522" } },
    groom: { base: "school", pal: { blazer: "#23283a", blazerShade: "#1c2030", tie: "#e9e9ee", trousers: "#23283a" } },
    bride: { top: "#ffffff", shade: "#e7e3f0", sleeve: "long", collar: "round", brooch: true, skirt: { to: -10, color: "#ffffff", shade: "#e7e3f0", flare: 1.6 }, legs: "#ffffff", shoes: "#ffffff" },
    aunt1: { top: "#2f7d8c", shade: "#28697a", sleeve: "long", collar: "round", brooch: true, skirt: { to: -90, color: "#2f7d8c", shade: "#28697a", flare: 1.25 }, legs: "#efe3d6", shoes: "#2a1f24" },
    aunt2: { top: "#c25b3f", shade: "#a84d34", sleeve: "long", collar: "v", under: "#f3e3c3", skirt: { to: -90, color: "#c25b3f", shade: "#a84d34", flare: 1.25 }, legs: "#efe3d6", shoes: "#2a1f24" },
    saule: { top: "#d9a03f", shade: "#c08a30", sleeve: "long", collar: "round", brooch: true, skirt: { to: -110, color: "#6b4fa3", shade: "#5b4390", flare: 1.2 }, legs: "#efe3d6", shoes: "#3a2a2a" },
    driver: { top: "#3b3f4a", shade: "#31343e", sleeve: "short", collar: "round", legs: "#3a3f4c", shoes: "#2a2522" },
    hoodie: { top: "#e85d75", shade: "#d04e66", sleeve: "long", collar: "round", legs: "#3a3f4c", shoes: "#e9e9ee" },
    teen: { top: "#5a7fc4", shade: "#4c6cad", sleeve: "short", collar: "round", legs: "#3a3f4c", shoes: "#e9e9ee" },
  });
  const mk = (look, outfit, seed, s) => (o) => Object.assign({ look, outfit, s: s || 0.75, seed }, o);
  const ACT = {
    artur: mk("artur", "tee", 5), arturSuit: mk("artur", "suit", 5), arturHood: mk("artur", "hoodie", 5),
    mom: mk("mom", "momHome", 13), momFest: mk("mom", "momFest", 13), dad: mk("dad", "dad", 17),
    asaba: mk("asaba", "asaba", 23), groom: mk("groom", "groom", 29), bride: mk("bride", "bride", 37),
    aunt1: mk("apa", "aunt1", 43), aunt2: mk("mom", "aunt2", 47), aunt3: mk("aje", "apa", 53),
    saule: mk("saule", "saule", 59), aje: mk("aje", "aje", 31), driver: mk("driver", "driver", 61),
    kid: mk("kid", "tee", 7), teen: mk("teen", "teen", 67),
  };

  // ---------- эффектілер ----------
  const puff = (x, y, t, t0, dur, n, col) => { const k = win(t, t0, t0 + (dur || 1)); if (k <= 0 || k >= 1) return ""; let s = ""; for (let i = 0; i < (n || 8); i++) { const a = hash(i + t0) * 6.283, d = 40 + hash(i * 3 + t0) * 120; s += `<circle cx="${f(x + Math.cos(a) * d * eout(k))}" cy="${f(y + Math.sin(a) * d * eout(k) - 30 * k)}" r="${f(26 + 40 * k)}" fill="${col || "#ffffff"}" opacity="${f(0.7 * (1 - k))}"/>`; } return s; };
  const speed = (x, y, r, t, t0, n) => { const k = win(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return ""; let s = ""; for (let i = 0; i < (n || 6); i++) { const a = -Math.PI * (0.15 + 0.7 * i / ((n || 6) - 1)); const r0 = r * (1 + 0.3 * k), r1 = r * (1.25 + 0.6 * k); s += Ln(`M${f(x + Math.cos(a) * r0)},${f(y + Math.sin(a) * r0)} L${f(x + Math.cos(a) * r1)},${f(y + Math.sin(a) * r1)}`, 7, INK, ` opacity="${f(1 - k)}"`); } return s; };
  const shout = (x, y, r, t, t0, t1, n) => { if (t < t0 || t > t1) return ""; let s = ""; for (let i = 0; i < (n || 3); i++) { const k = ((t - t0) * 2.2 + i / (n || 3)) % 1; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * (0.4 + k))}" fill="none" stroke="${INK}" stroke-width="${f(8 * (1 - k))}" opacity="${f(1 - k)}"/>`; } return s; };
  const notes = (x, y, t, t0, t1, col) => { if (t < t0 || t > t1) return ""; let s = ""; for (let i = 0; i < 3; i++) { const k = ((t - t0) * 0.7 + i / 3) % 1; s += `<g transform="translate(${f(x + k * 140 + Math.sin(k * 9) * 20)},${f(y - k * 220)})" opacity="${f(Math.sin(k * Math.PI))}">${Ln("M0,0 L0,-50 L26,-60", 6, col || INK)}${C(-10, 0, 13, col || INK, 0)}</g>`; } return s; };
  const sweat = (x, y, t, t0, n) => { if (t < t0) return ""; let s = ""; for (let i = 0; i < (n || 2); i++) { const k = ((t - t0) * 1.4 + i * 0.5) % 1; s += `<g transform="translate(${f(x + (i % 2 ? 70 : -60))},${f(y + k * 120)})" opacity="${f(1 - k)}">${P("M0,-18 Q12,0 8,12 Q0,18 -8,12 Q-12,0 0,-18Z", "#a8dcf6", 4)}</g>`; } return s; };
  const tears = (x, y, t, n) => { let s = ""; for (let i = 0; i < (n || 2); i++) { const k = ((t * 1.3 + i * 0.5) % 1); s += `<g transform="translate(${f(x + (i ? 60 : -60))},${f(y + k * 90)})" opacity="${f(1 - k)}">${P("M0,-16 Q11,0 7,10 Q0,16 -7,10 Q-11,0 0,-16Z", "#a8dcf6", 4)}</g>`; } return s; };
  const confetti = (t, t0, n, x0, y0, w, h) => { if (t < t0) return ""; let s = ""; const cols = ["#e85d75", "#f6d55c", "#5ab4e5", "#7cc47a", "#ffffff", "#b58ad9"]; for (let i = 0; i < (n || 60); i++) { const k = (t - t0) * (0.25 + hash(i) * 0.25); if (k > 1.2) continue; const x = x0 + hash(i * 3) * w + Math.sin((t - t0) * 3 + i) * 30, y = y0 + (k - 0.1) * h; s += `<rect x="${f(x)}" y="${f(y)}" width="22" height="12" fill="${cols[i % 6]}" transform="rotate(${f((t - t0) * 300 + i * 37)} ${f(x)} ${f(y)})" opacity="${f(clamp(1.2 - k, 0, 1))}"/>`; } return s; };
  const stars = (x, y, r, t, n) => { let s = ""; for (let i = 0; i < (n || 4); i++) { const a = t * 3 + i * 6.283 / (n || 4); s += g(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.35, 0.9, P("M0,-24 L7,-7 L24,0 L7,7 L0,24 L-7,7 L-24,0 L-7,-7Z", "#f6d55c", 4)); } return s; };
  const bubble = (x, y, w, h, inner, tail) => `${P(`M${f(x - w / 2 + 40)},${f(y - h / 2)} L${f(x + w / 2 - 40)},${f(y - h / 2)} Q${f(x + w / 2)},${f(y - h / 2)} ${f(x + w / 2)},${f(y - h / 2 + 40)} L${f(x + w / 2)},${f(y + h / 2 - 40)} Q${f(x + w / 2)},${f(y + h / 2)} ${f(x + w / 2 - 40)},${f(y + h / 2)} L${f(x + (tail || 0) + 40)},${f(y + h / 2)} L${f(x + (tail || 0))},${f(y + h / 2 + 70)} L${f(x + (tail || 0) - 10)},${f(y + h / 2)} L${f(x - w / 2 + 40)},${f(y + h / 2)} Q${f(x - w / 2)},${f(y + h / 2)} ${f(x - w / 2)},${f(y + h / 2 - 40)} L${f(x - w / 2)},${f(y - h / 2 + 40)} Q${f(x - w / 2)},${f(y - h / 2)} ${f(x - w / 2 + 40)},${f(y - h / 2)}Z`, "#ffffff", 7)}${inner || ""}`;
  // ой бұлты (дөңгелектер)
  const thought = (x, y, w, h, inner, fromX, fromY) => { let s = ""; if (fromX != null) for (let i = 0; i < 3; i++) { const k = (i + 1) / 4; s += C(lerp(fromX, x, k), lerp(fromY, y + h / 2, k), 14 + i * 9, "#ffffff", 5); } const r = rng2(w + h); for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; s += C(x + Math.cos(a) * w * 0.44, y + Math.sin(a) * h * 0.4, Math.min(w, h) * (0.2 + r() * 0.06), "#ffffff", 6); } return s + `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w * 0.46)}" ry="${f(h * 0.42)}" fill="#ffffff"/>` + (inner || ""); };
  function rng2(seed) { let a = seed >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
  // экрандық (overlay) көмекшілер
  const rewind = (t, t0, t1) => {
    // ◀◀ кері айналдыру: жолақтар + белгі (экран координаттары 1080×1920)
    if (t < t0 || t > t1) return "";
    const k = win(t, t0, t1);
    let s = `<rect x="0" y="0" width="1080" height="1920" fill="#1b2a4a" opacity="${f(0.25 * Math.sin(k * Math.PI))}"/>`;
    for (let i = 0; i < 9; i++) { const y = ((i * 251 + t * 2400) % 1920); s += `<rect x="0" y="${f(y)}" width="1080" height="${8 + (i % 3) * 6}" fill="#ffffff" opacity="0.35"/>`; }
    s += `<g transform="translate(540,780)" opacity="${f(Math.min(1, k * 6) * (1 - win(t, t1 - 0.12, t1)))}">${P("M-150,-90 L-30,0 L-150,90Z M-10,-90 L110,0 L-10,90Z", "#ffffff", 9)}</g>`;
    return s;
  };
  // «Х-ЗАҢ» мөрі (экран)
  const law = (t, t0, n, text, t1, y) => TY.stamp(t, t0, `${n}-ЗАҢ`, 540, y || 300, { size: 64, rot: -5, color: "#e85d75", t1 }) + TY.pop(t, t0 + 0.25, text, 540, (y || 300) + 120, { size: 52, color: "#ffffff", stroke: 11, t1 });
  // кадр басындағы «ілмек» жазуы (жоғарғы қауіпсіз аймақ)
  const hook = (t, t0, t1, text, o) => TY.pop(t, t0, text, 540, (o && o.y) || 250, Object.assign({ size: 58, color: "#ffffff", stroke: 12, t1 }, o || {}));
  // экрандағы карточка (естелік/фото): world координатасында
  const card = (x, y, w, h, rot, inner, o) => { o = o || {}; return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(o.s || 1)})">${RR(-w / 2 - 22, -h / 2 - 22, w + 44, h + 90, "#ffffff", 7, 6)}<svg x="${f(-w / 2)}" y="${f(-h / 2)}" width="${w}" height="${h}" viewBox="${f(-w / 2)} ${f(-h / 2)} ${w} ${h}" overflow="hidden">${inner}</svg>${RR(-w / 2, -h / 2, w, h, "none", 5)}${o.label ? T(0, h / 2 + 52, o.label, 40, INK) : ""}</g>`; };

  // ---------- мессенджер (үлкен тік телефон, экран координаттары) ----------
  // ph(x, y, s, inner): телефон қаңқасы, ішкі экран 820×1560 (центрі 0,0)
  const phoneBig = (x, y, s, inner, o) => {
    o = o || {};
    let d = RR(-450, -850, 900, 1700, o.old ? "#3b3f4a" : "#1f2027", 10, o.old ? 60 : 90);
    d += `<svg x="-410" y="-780" width="820" height="1560" viewBox="-410 -780 820 1560" overflow="hidden">${RF(-410, -780, 820, 1560, o.bg || "#ece5dd")}${inner || ""}</svg>`;
    d += RR(-410, -780, 820, 1560, "none", 5, 8);
    if (!o.old) d += RR(-90, -830, 180, 34, "#1f2027", 0, 17);
    else d += C(0, 815, 26, "#55565f", 4);
    return g(x, y, s, d, o.rot);
  };
  // чат басы: аты, суреті, қатысушылар
  const chatHead = (name, sub, o) => {
    o = o || {};
    let d = RF(-410, -780, 820, 190, o.col || "#2f7d6a") + Ln("M-370,-690 L-340,-660 L-370,-630", 7, "#ffffff");
    d += C(-260, -680, 54, o.av || "#f6d55c", 5) + (o.flower ? g(-260, -680, 0.55, P("M0,-40 Q20,-20 0,0 Q-20,-20 0,-40Z M0,40 Q20,20 0,0 Q-20,20 0,40Z M-40,0 Q-20,20 0,0 Q-20,-20 -40,0Z M40,0 Q20,20 0,0 Q20,-20 40,0Z", "#e85d75", 4) + C(0, 0, 12, "#f6d55c", 3)) : "");
    d += `<text x="-180" y="-688" font-size="46" font-family="Montserrat" font-weight="800" fill="#ffffff">${name}</text>`;
    if (sub) d += `<text x="-180" y="-636" font-size="30" font-family="Montserrat" font-weight="600" fill="#d6efe8">${sub}</text>`;
    return d;
  };
  // дауыс хабарламасы (войс): x,y — көпіршік центрі; k — ойнау прогресі; mine — оң жақ (жасыл)
  const voiceMsg = (x, y, w, dur, o) => {
    o = o || {};
    const mine = o.mine !== false;
    let d = RR(x - w / 2, y - 64, w, 128, mine ? "#d9fdd3" : "#ffffff", 5, 28);
    d += C(x - w / 2 + 70, y, 40, mine ? "#2f7d6a" : "#5a7fc4", 0) + P(`M${f(x - w / 2 + 58)},${f(y - 20)} L${f(x - w / 2 + 88)},${f(y)} L${f(x - w / 2 + 58)},${f(y + 20)}Z`, "#ffffff", 0);
    const n = Math.max(8, Math.floor((w - 220) / 16));
    for (let i = 0; i < n; i++) {
      const hh = o.flat ? 4 : 10 + Math.abs(Math.sin(i * 1.7 + (o.seed || 0)) * 34) + (i % 3) * 4;
      const played = o.k != null && i / n < o.k;
      d += RF(x - w / 2 + 130 + i * 16, y - hh / 2, 8, hh, played ? "#2f7d6a" : "#9aa1ab", 4);
    }
    d += `<text x="${f(x + w / 2 - 30)}" y="${f(y + 52)}" font-size="26" font-family="Montserrat" font-weight="700" fill="#667" text-anchor="end">${dur}${mine ? "  ✓✓" : ""}</text>`;
    if (o.ticks) d += Ln(`M${f(x + w / 2 - 70)},${f(y + 44)} l10,10 l18,-20 M${f(x + w / 2 - 50)},${f(y + 44)} l10,10 l18,-20`, 5, o.ticks);
    return d;
  };
  const textMsg = (x, y, w, text, o) => { o = o || {}; const mine = o.mine !== false; return RR(x - w / 2, y - 50, w, 100, mine ? "#d9fdd3" : "#ffffff", 5, 26) + `<text x="${f(x - w / 2 + 34)}" y="${f(y + 14)}" font-size="${o.size || 40}" font-family="Montserrat" font-weight="700" fill="${INK}">${text}</text>`; };
  const avatar = (x, y, r, seed, face) => { const rr = rng2(seed); const col = ["#f2a5b8", "#9fd0e8", "#f6d55c", "#9fd09a", "#d7c3f0", "#f2c27a"][Math.floor(rr() * 6)]; let d = C(x, y, r, col, 4) + C(x, y + r * 0.15, r * 0.55, "#ffffff", 3); if (face) d += `<circle cx="${f(x - r * 0.2)}" cy="${f(y + r * 0.08)}" r="${f(r * 0.07)}" fill="${INK}"/><circle cx="${f(x + r * 0.2)}" cy="${f(y + r * 0.08)}" r="${f(r * 0.07)}" fill="${INK}"/>` + Ln(`M${f(x - r * 0.16)},${f(y + r * 0.36)} L${f(x + r * 0.16)},${f(y + r * 0.36)}`, Math.max(2, r * 0.07)); return d; };

  // ---------- кадр қатуы (freeze) ----------
  const freezeFx = (t, tf, base) => (t > tf ? Object.assign({}, base || {}, { sat: 0.15, flash: Math.max(0, 0.6 - (t - tf) * 3) }) : base || {});

  G.REELS_KIT = { Wt, MIC, PROP, POSES, ACT, puff, speed, shout, notes, sweat, tears, confetti, stars, bubble, thought, rewind, law, hook, card, phoneBig, chatHead, voiceMsg, textMsg, avatar, freezeFx, rng2 };
})(typeof window !== "undefined" ? window : globalThis);
