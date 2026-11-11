/* «Анамның войсы» (Reels 9:16, ~2:57) — кадрлар.
 * Ілмек (143 терезе) → тақырып → войстың 3 заңы → палау → войс «әкеме» → «Ағайын» тобы (143) → өшіру жоқ → көк белгілер
 * → көлік → Сәуле апаның үйі → slow-mo секіріс → Сәуленің де войсы → күлкі → әжемнің войсы → тас палау → кеңес. */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RB = G.REELS_BG, K = G.REELS_KIT, A = G.AUYL_BG, RIG = G.ArturRig;
  const { S, E, TY, lerp, clamp, sm, eio, eout, spring, win, noise, hash } = Q;
  const { BG, P, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { Wt, POSES: PO, ACT, puff, speed, shout, notes, sweat, tears, confetti, stars, thought, rewind, law, hook, card, phoneBig, chatHead, voiceMsg, textMsg, avatar } = K;
  const { g, TB, E: EL } = RB;
  const X = RIG.EXPR;
  const SH = [], MK = {};
  const add = (o) => SH.push(o);
  const ex = (...a) => Object.assign({}, ...a.map((k) => (typeof k === "string" ? X[k] || PO[k] || RIG.POSES[k] : k)));

  // ---------- телефон экраны (экран координаттары) ----------
  const PHY = 820, PHS = 0.72, CAPP = 1440;
  const shade = (k) => `<rect width="1080" height="1920" fill="#0b0d16" opacity="${f(0.45 * k)}"/>`;
  const phoneAt = (t, t0, inner, o) => { const k = spring(win(t, t0, t0 + 0.6)); return shade(Math.min(1, k)) + g(540, PHY, PHS * k, phoneBig(0, 0, 1, inner, o)); };
  const GROUP = (sub) => chatHead("АҒАЙЫН", sub || "143 қатысушы", { flower: true, av: "#ffd1dc" });
  const DADCHAT = () => chatHead("ӘКЕМ", "желіде", { av: "#9fd0e8" });
  const time = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const recBar = (t, sec, o) => { o = o || {}; let d = RR(-390, 600, 640, 120, "#ffffff", 4, 60) + C(-330, 660, 16, Math.floor(t * 2) % 2 ? "#e85d75" : "#ffb3c0", 0) + `<text x="-290" y="676" font-size="44" font-family="Montserrat" font-weight="800" fill="${INK}">${time(sec)}</text>`; for (let i = 0; i < 16; i++) d += RF(-130 + i * 20, 660 - (o.flat ? 3 : 6 + Math.abs(Math.sin(t * 9 + i)) * 26), 10, o.flat ? 6 : 12 + Math.abs(Math.sin(t * 9 + i)) * 52, "#e85d75", 4); d += C(320, 660, 70 * (1 + 0.06 * Math.sin(t * 8)), "#e85d75", 6) + RR(306, 620, 28, 54, "#ffffff", 0, 14) + Ln("M296,668 Q320,700 344,668 M320,700 L320,716", 6, "#ffffff"); return d; };
  const grid = (t, n, y0) => { let d = ""; for (let i = 0; i < Math.min(n, 48); i++) { const k = spring(win(t, (i / 48) * 0.6, (i / 48) * 0.6 + 0.4)); d += `<g transform="translate(${-330 + (i % 6) * 132},${y0 + Math.floor(i / 6) * 132}) scale(${f(k)})">${avatar(0, 0, 54, 100 + i, true)}</g>`; } return d; };
  const flower = (x, y, s) => g(x, y, s, P("M0,-40 Q20,-20 0,0 Q-20,-20 0,-40Z M0,40 Q20,20 0,0 Q-20,20 0,40Z M-40,0 Q-20,20 0,0 Q-20,-20 -40,0Z M40,0 Q20,20 0,0 Q20,-20 40,0Z", "#e85d75", 4) + C(0, 0, 12, "#f6d55c", 3));
  // ұшатын войс көпіршігі (кішкене)
  const vbub = (x, y, s, rot) => g(x, y, s, RR(-70, -34, 140, 68, "#d9fdd3", 5, 30) + P("M-46,-14 L-26,0 L-46,14Z", "#2f7d6a", 0) + Ln("M-12,0 L-12,0 M0,-10 L0,10 M12,-16 L12,16 M24,-8 L24,8 M36,-12 L36,12", 6, "#2f7d6a"), rot);

  // ================= 0. ІЛМЕК =================
  const CITY = Wt("L01", 3) - 0.2, INNO = Wt("L01", 8) - 0.1, TITLE = E("L01") + 0.45;
  MK.CITY = CITY; MK.INNO = INNO; MK.TITLE = TITLE;
  add({
    t0: 0, bg: "kitchen", c0: { x: 0, y: -600 }, fadeIn: 0.3, capTop: CAPP,
    cam: [[0, { x: 0, y: -600, z: 1.2 }], [CITY, { x: 0, y: -600, z: 1.3 }]],
    over: (t) => phoneAt(t, 0, GROUP() + voiceMsg(130, -380, 560, "0:47", { mine: true, ticks: "#9aa1ab", seed: 2 }) + (t > 0.9 ? voiceMsg(130, -200, 560, "0:47", { mine: true, seed: 3, ticks: t > 2 ? "#3fa7e8" : "#9aa1ab" }) : "") + (t > 0.9 ? `<text x="-340" y="-60" font-size="34" font-family="Montserrat" font-weight="700" fill="#2f7d6a">Анам · жаңа ғана</text>` : ""), {}),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });
  add({
    t0: CITY, bg: "cityNight", c0: { x: 0, y: -900 }, flashIn: 0.15,
    cam: [[CITY, { x: 0, y: -700, z: 0.55 }], [INNO, { x: 0, y: -800, z: 0.62 }]],
    world: (t) => { let s = ""; const k = win(t, CITY, INNO - 0.3); const n = Math.floor(143 * k); for (let i = 0; i < 40; i++) { const tk = clamp((k * 40 - i) / 3, 0, 1); if (tk <= 0) continue; const tx = -2200 + hash(i * 3.1) * 4400, ty = -2200 + hash(i * 7.7) * 2300; s += tk < 1 ? vbub(lerp(0, tx, eout(tk)), lerp(300, ty, eout(tk)) - Math.sin(tk * Math.PI) * 400, 2.2, 0) : RF(tx - 50, ty - 60, 100, 120, "#d9fdd3", 0, ' opacity="0.85"'); } return s; },
    type: (t) => { const n = Math.floor(143 * win(t, CITY, INNO - 0.3)); return TY.pop(t, CITY + 0.1, String(Math.max(1, n)), 540, 330, { size: 170, color: "#d9fdd3" }) + TY.pop(t, CITY + 0.3, "АДАМ ЕСТІДІ", 540, 480, { size: 70, color: "#ffffff" }); },
    fx: () => ({ vig: 0.35 }),
  });
  add({
    t0: INNO, bg: "kitchen", c0: { x: 0, y: -620 }, flashIn: 0.15,
    cam: [[INNO, { x: 160, y: -620, z: 2.2 }], [TITLE, { x: 170, y: -620, z: 2.4 }]],
    actors: [ACT.mom({ x: 180, y: 0, keys: [[0, ex("happy", "phoneMouth", { turn: -0.2, headTilt: 6 })]] })],
    world: (t) => RB.heart(330, -860, 0.6 * spring(win(t, INNO + 0.3, INNO + 0.9)), "#ff6f91"),
    type: (t) => TY.pop(t, Wt("L01", 12), "ТЕК ӘКЕМЕ...", 540, 300, { size: 84, color: "#ffffff" }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  });
  // тақырып
  const T1 = S("L02") - 0.2;
  add({
    t0: TITLE, bg: "host", bgArgs: [["#2f7d6a", "#174a3e"]], bgKey: "hostGreen", c0: { x: 0, y: -600 }, flashIn: 0.25, noCaps: false,
    cam: [[TITLE, { x: 0, y: -600, z: 0.95 }], [T1, { x: 0, y: -600, z: 1.05 }]],
    world: (t) => { let s = ""; for (let i = 0; i < 22; i++) { const h = 40 + Math.abs(Math.sin(t * 8 + i * 0.7)) * 200 * spring(win(t, TITLE + 0.3, TITLE + 1)); s += RR(-560 + i * 52, -260 - h / 2, 30, h, "#d9fdd3", 4, 15); } return s; },
    type: (t) => TY.swing(t, TITLE + 0.05, "АНАМНЫҢ", 540, 520, { size: 150, color: "#ffffff" }) + TY.swing(t, TITLE + 0.35, "ВОЙСЫ", 540, 710, { size: 190, color: "#d9fdd3" }),
    fx: () => ({ vig: 0.25 }),
  });

  // ================= 1. КӨКТЕМ: анам мессенджерді үйренді =================
  const SPR = S("L02") - 0.2;
  MK.SPR = SPR;
  add({
    t0: SPR, bg: "kitchen", c0: { x: 0, y: -620 }, flashIn: 0.2,
    cam: [[SPR, { x: -600, y: -1000, z: 1.4 }], [Wt("L02", 4), { x: 0, y: -620, z: 1.55 }], [S("L03") - 0.2, { x: 40, y: -640, z: 1.75 }]],
    actors: [ACT.mom({ x: 60, y: 0, keys: [[0, ex("determined", { turn: 0.1, armL: { sh: 95, el: 0, hand: "fist", propFront: B.PROPS.phone("#bfe3fb") }, ...PO.lookL })], [Wt("L02", 8), ex("happy", { turn: 0.1, armL: { sh: 95, el: 0, hand: "fist", propFront: B.PROPS.phone("#bfe3fb") }, ...PO.lookL }), 0.3]] })],
    world: (t) => BG.kitchenTable(0, 60, 0.9),
    type: (t) => TY.stamp(t, SPR + 0.3, "КӨКТЕМ", 540, 300, { size: 80, color: "#e85d75", t1: Wt("L02", 4) }) + TY.pop(t, Wt("L02", 5), "ЖАҢА «ПАЙДАЛАНУШЫ»", 540, 300, { size: 64, color: "#ffffff" }),
    fx: () => ({ vig: 0.2, dof: 2 }),
  });

  // ================= 2. ВОЙСТЫҢ 3 ЗАҢЫ =================
  const LAWS = S("L03") - 0.2;
  MK.LAWS = LAWS;
  add({
    t0: LAWS, bg: "host", bgArgs: [["#2f7d6a", "#174a3e"]], bgKey: "hostGreen", c0: { x: 0, y: -600 }, flashIn: 0.2,
    cam: [[LAWS, { x: 0, y: -600, z: 0.9, r: -3 }], [S("L04") - 0.2, { x: 0, y: -600, z: 1.05, r: 1 }]],
    world: (t) => g(0, -600, spring(win(t, LAWS, LAWS + 0.8)), RB.ornBorder(-430, -560, 860, 1120, "#f2c14e", "#1f5e4f")),
    type: (t) => TY.swing(t, LAWS + 0.3, "ВОЙСТЫҢ", 540, 800, { size: 130, color: "#d9fdd3" }) + TY.swing(t, LAWS + 0.6, "3 ЗАҢЫ", 540, 980, { size: 150, color: "#f6d55c" }),
    fx: () => ({ vig: 0.3 }), noCaps: true,
  });
  // 1-заң: 10 секунд тыныштық
  const L1 = S("L04") - 0.2, REC = E("L04") + 0.05;
  MK.L1 = L1; MK.REC = REC;
  add({
    t0: L1, bg: "kitchen", c0: { x: 0, y: -600 }, capTop: CAPP,
    cam: [[L1, { x: 0, y: -600, z: 1.3 }], [S("L05") - 0.1, { x: 0, y: -600, z: 1.35 }]],
    over: (t) => { const sec = t < REC ? 0 : Math.min(10, (t - REC) * 4.2); return phoneAt(t, L1, DADCHAT() + voiceMsg(130, -380, 520, "2:58", { seed: 5 }) + recBar(t, sec, { flat: true })) + TY.pop(t, REC + 0.6, "ТЫНЫШТЫҚ...", 540, 1500, { size: 60, color: "#9aa1ab" }); },
    type: (t) => law(t, L1 + 0.1, 1, "10 СЕКУНД ТЫНЫШТЫҚ", null, 150),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });
  // әкем (Ақбозда) тыңдап отыр
  add(Object.assign({ bg: () => BG.carInt("courtyard"), bgKey: "car-courtyard" }, {
    t0: S("L05") - 0.1, c0: { x: 0, y: -560 },
    cam: [[S("L05") - 0.1, { x: 175, y: -600, z: 2.3 }], [S("L06") - 0.2, { x: 175, y: -600, z: 2.5 }]],
    actors: [ACT.dad({ x: 175, y: 0, keys: [[0, ex("deadpan", "phoneEar", { turn: -0.1 })], [Wt("L05", 2), ex("deadpan", "phoneEar", { turn: -0.1, ...PO.lookR }), 0.4]] })],
    world: (t) => RB.freshener(Math.sin(t) * 4) + RB.carFront({}),
    type: (t) => TY.pop(t, S("L05") + 0.2, "«АЛЛО?»", 540, 300, { size: 100, color: "#ffffff" }),
    fx: () => ({ vig: 0.3, dof: 2 }),
  }));
  // 2-заң: 3 минуттан кем емес («нан ала кел»)
  const L2 = S("L06") - 0.2, BREAD = Wt("L06", 7);
  MK.L2 = L2; MK.BREAD = BREAD;
  add({
    t0: L2, bg: "kitchen", c0: { x: 0, y: -600 }, capTop: CAPP,
    cam: [[L2, { x: 0, y: -600, z: 1.3 }], [S("L07") - 0.2, { x: 0, y: -600, z: 1.35 }]],
    over: (t) => { const w = 560 + 900 * eout(win(t, Wt("L06", 2), Wt("L06", 5))); return phoneAt(t, L2, DADCHAT() + voiceMsg(130, -380, 520, "2:58", { seed: 5 }) + voiceMsg(130, -170, 520, "3:12", { seed: 6 })) + g(540 + (w - 560) * 0.5 * PHS, PHY + 100, PHS, voiceMsg(130, 0, w, "3:47", { seed: 7 })) + (t > BREAD ? g(540, 1130, spring(win(t, BREAD, BREAD + 0.5)), RR(-280, -60, 560, 120, "#ffffff", 6, 40) + TX(0, 18, "«нан ала кел»", 52, INK)) : ""); },
    type: (t) => law(t, L2 + 0.1, 2, "3 МИНУТТАН КЕМ ЕМЕС", null, 150),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });
  // 3-заң: «жарайды, болды, қойдым» → тағы 2 минут
  const L3 = S("L07") - 0.2, PLUS = Wt("L07", 7);
  MK.L3 = L3; MK.PLUS = PLUS;
  add({
    t0: L3, bg: "kitchen", c0: { x: 0, y: -620 },
    cam: [[L3, { x: 100, y: -620, z: 2.1 }], [PLUS, { x: 100, y: -620, z: 2.3 }], [S("L08") - 0.3, { x: 100, y: -620, z: 2.4 }]],
    actors: [ACT.mom({ x: 100, y: 0, mod: (t, p) => { p.headTilt = (p.headTilt || 0) + Math.sin(t * 3) * 4; return p; }, keys: [[0, ex("happy", "phoneMouth", { turn: 0.1 })], [Wt("L07", 2), ex("calmSmile", "phoneMouth"), 0.2], [PLUS, ex("laugh", "phoneMouth", { turn: -0.1 }), 0.2]], talk: [] })],
    type: (t) => law(t, L3 + 0.1, 3, "«ҚОЙДЫМ» = +2 МИН", null, 150) + TY.pop(t, Wt("L07", 2), "ЖАРАЙДЫ...", 280, 420, { size: 56, color: "#ffffff", rot: -6 }) + TY.pop(t, Wt("L07", 3), "БОЛДЫ...", 780, 500, { size: 56, color: "#ffffff", rot: 6 }) + TY.pop(t, Wt("L07", 4), "ҚОЙДЫМ...", 300, 580, { size: 56, color: "#ffffff", rot: -4 }) + TY.stamp(t, PLUS, "+2:00", 760, 660, { size: 90, color: "#e85d75", rot: 8 }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  });
  // «программист»
  const PRG = S("L08") - 0.3;
  MK.PRG = PRG;
  add({
    t0: PRG, bg: "host", bgArgs: [["#2b2f45", "#11131c"]], bgKey: "hostDark", c0: { x: 0, y: -600 }, flashIn: 0.2,
    cam: [[PRG, { x: 0, y: -600, z: 1.9 }], [S("L09") - 0.3, { x: 0, y: -600, z: 2.1 }]],
    actors: [ACT.arturHood({ x: 0, y: 30, keys: [[0, ex("smug", "hips")], [Wt("L08", 4), ex("shy", "phoneUp"), 0.3]] })],
    world: (t) => { let s = ""; const tok = ["</>", "{ }", "01", "if", "()"]; for (let i = 0; i < 10; i++) { const k = ((t * 0.25 + i * 0.1) % 1); s += TX(-420 + (i * 97) % 840, -200 - k * 1100, tok[i % 5], 54, "#7cf0a5", ` opacity="${f(Math.sin(k * Math.PI) * 0.8)}"`); } return s; },
    type: (t) => TY.stamp(t, Wt("L08", 3), "ПРОГРАММИСТ", 540, 300, { size: 84, color: "#7cf0a5", bg: "rgba(17,19,28,0.85)" }) + TY.pop(t, Wt("L08", 7), "(1 ҚОСЫМША ОРНАТҚАН)", 540, 430, { size: 48, color: "#ffffff" }),
    fx: () => ({ vig: 0.3 }),
  });

  // ================= 3. ПАЛАУ → ВОЙС «ӘКЕМЕ» =================
  const PLOV = S("L09") - 0.3;
  MK.PLOV = PLOV;
  add({
    t0: PLOV, bg: "living", c0: { x: 0, y: -600 }, flashIn: 0.2,
    cam: [[PLOV, { x: -300, y: -560, z: 1.2 }], [S("L10") - 0.2, { x: 200, y: -560, z: 1.25 }]],
    actors: [
      ACT.saule({ x: -380, y: 80, keys: [[0, ex("laugh", { turn: 0.3, armR: { sh: 120, el: -20, hand: "open" } })]] }),
      ACT.mom({ x: -40, y: 80, keys: [[0, ex("calmSmile", { turn: 0.1 })], [Wt("L09", 5), ex("strain", { turn: 0.1, mouth: "growl" }), 0.2]] }),
      ACT.dad({ x: 260, y: 80, keys: [[0, ex("happy", { turn: -0.2 })]] }),
      ACT.arturHood({ x: 520, y: 80, keys: [[0, ex("happy", { turn: -0.3 })]] }),
    ],
    world: (t) => BG.kitchenTable(60, 200, 1.0) + RB.plov(60, -140, 0.9, { steam: notes(60, -300, t, PLOV, PLOV + 6, "#ffffff") }),
    type: (t) => TY.pop(t, Wt("L09", 5), "ПАЛАУ", 540, 300, { size: 110, color: "#f6d89a" }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  });
  const VD = S("L10") - 0.2, STONE = Wt("L11", 6);
  MK.VD = VD; MK.STONE = STONE;
  add({
    t0: VD, bg: "kitchen", c0: { x: 0, y: -620 }, flashIn: 0.15,
    cam: [[VD, { x: 60, y: -620, z: 1.6 }], [S("L11"), { x: 120, y: -640, z: 2.1 }], [S("L12") - 0.3, { x: 120, y: -660, z: 2.3 }]],
    actors: [ACT.mom({ x: 140, y: 0, mod: (t, p) => { if (t > S("L11") && t < E("L11")) p.armL = { sh: 60 + Math.sin(t * 6) * 25, el: -40, hand: "open" }; return p; }, keys: [[0, ex("happy", "phoneMouth", { turn: -0.1 })], [S("L11"), ex("smug", "phoneMouth"), 0.2], [STONE, ex("laugh", "phoneMouth"), 0.2]], talk: ["L11"] })],
    world: (t) => (t > STONE - 0.3 ? thought(60, -900, 330, 230, g(60, -900, 1, C(-60, 0, 46, "#9aa1ab", 6) + C(20, -20, 38, "#b7bcc6", 6) + C(70, 30, 30, "#9aa1ab", 6) + P("M-40,70 L-20,110 L0,72 L20,110 L40,70Z", "#ffffff", 5)), 120, -760) : ""),
    type: (t) => TY.pop(t, Wt("L11", 1), "→ ӘКЕМЕ", 540, 300, { size: 70, color: "#d9fdd3", t1: STONE - 0.2 }) + TY.pop(t, STONE, "ТАС СИЯҚТЫ!", 540, 170, { size: 96, color: "#9aa1ab", rot: -5 }) + TY.pop(t, Wt("L11", 9), "ТАРС!", 760, 480, { size: 70, color: "#ffffff", rot: 8 }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  });

  // ================= 4. «АҒАЙЫН» ТОБЫ — 143 АДАМ =================
  const GRP = S("L12") - 0.3, HEAD = Wt("L12", 5), SENT = Wt("L12", 8), FRZ = Wt("L12", 9) - 0.1;
  MK.GRP = GRP; MK.HEAD = HEAD; MK.SENT = SENT; MK.FRZ = FRZ;
  add({
    t0: GRP, bg: "kitchen", c0: { x: 0, y: -600 }, capTop: CAPP,
    cam: [[GRP, { x: 0, y: -600, z: 1.3 }], [FRZ, { x: 0, y: -600, z: 1.35 }]],
    over: (t) => { const zk = eout(win(t, HEAD - 0.1, HEAD + 0.5)); const inner = GROUP() + voiceMsg(130, -380, 560, "0:47", { seed: 2, ticks: "#9aa1ab" }) + (t > SENT ? RR(-300, -250, 600, 90, "#fff3b0", 4, 40) + TX(0, -192, "143 адамға жіберілді", 36, INK) : ""); return shade(1) + g(540 + zk * 260, PHY + zk * 700, PHS * (1 + zk * 1.3), phoneBig(0, 0, 1, inner, {})); },
    type: (t) => TY.pop(t, Wt("L12", 3), "ӘКЕМЕ ЕМЕС...", 540, 200, { size: 70, color: "#ffffff", t1: HEAD }),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });
  add({
    t0: FRZ, bg: "kitchen", c0: { x: 0, y: -620 }, freeze: FRZ + 0.15,
    cam: [[FRZ, { x: 140, y: -640, z: 2.4 }], [S("L13") - 0.3, { x: 140, y: -640, z: 2.6 }]],
    shake: (t) => (t > FRZ + 0.15 && t < FRZ + 0.45 ? 12 : 0),
    actors: [ACT.mom({ x: 140, y: 0, keys: [[0, ex("happy", "phoneMouth", { turn: -0.1 })]] })],
    type: (t) => TY.stamp(t, FRZ + 0.2, "ЕҢ ҮЛКЕН ҚАТЕЛІК", 540, 300, { size: 74, rot: -7 }) + TY.pop(t, Wt("L12", 10), "143", 540, 470, { size: 150, color: "#f6d55c" }),
    fx: (t) => K.freezeFx(t, FRZ + 0.15, { vig: 0.3 }),
  });

  // ================= 5. «ӨШІР!» → тек өзімде =================
  const PAN = S("L13") - 0.3, THROW = Wt("L13", 2);
  MK.PAN = PAN; MK.THROW = THROW;
  add({
    t0: PAN, bg: "kitchen", c0: { x: 0, y: -620 }, flashIn: 0.15,
    cam: [[PAN, { x: 150, y: -620, z: 2.0, r: 2 }], [THROW, { x: -60, y: -620, z: 1.4 }], [S("L14") - 0.2, { x: -120, y: -620, z: 1.5 }]],
    shake: (t) => (t > S("L13") && t < E("L13") ? 10 : 0),
    actors: [
      ACT.mom({ x: 220, y: 0, keys: [[0, ex("scared", "phoneMouth", { turn: -0.1 })], [S("L13"), ex("scared", { turn: -0.4, armR: { sh: 150, el: 20, hand: "open" }, armL: { sh: 120, el: 10, hand: "open" } }), 0.15]], talk: ["L13"] }),
      ACT.arturHood({ x: -900, y: 0, keys: [[0, ex("shock", { x: -900, turn: 0.7, walk: 3.4 })], [S("L13") + 0.4, { x: -280 }, 0.6, eout], [S("L13") + 1.0, ex("determined", { walk: 0, turn: 0.4, armL: { sh: 80, el: -40, hand: "open" }, armR: { sh: 80, el: -40, hand: "open" } }), 0.2]] }),
    ],
    world: (t) => speed(-300, -620, 200, t, S("L13") + 0.9) + (t > THROW && t < THROW + 0.6 ? g(lerp(160, -230, win(t, THROW, THROW + 0.5)), -600 - Math.sin(win(t, THROW, THROW + 0.5) * Math.PI) * 220, 1.4, B.PROPS.phone("#bfe3fb"), (t - THROW) * 720) : ""),
    type: (t) => TY.pop(t, Wt("L13", 1), "ӨШІР!!!", 540, 300, { size: 120, color: "#ff5b4b", wob: 5 }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  });
  const DEL = S("L14") - 0.2, NOALL = Wt("L14", 6), OLD = Wt("L14", 12);
  MK.DEL = DEL; MK.NOALL = NOALL; MK.OLD = OLD;
  add({
    t0: DEL, bg: "kitchen", c0: { x: 0, y: -600 }, capTop: CAPP,
    cam: [[DEL, { x: 0, y: -600, z: 1.3 }], [S("L15") - 0.2, { x: 0, y: -600, z: 1.35 }]],
    over: (t) => {
      let inner = GROUP() + voiceMsg(130, -380, 560, "0:47", { seed: 2, ticks: "#9aa1ab" }) + `<rect x="-410" y="-780" width="820" height="1560" fill="#0b0d16" opacity="0.35"/>`;
      inner += RR(-330, -100, 660, 360, "#ffffff", 5, 30) + `<text x="-280" y="-20" font-size="40" font-family="Montserrat" font-weight="800" fill="${INK}">Өшіру?</text><text x="-280" y="80" font-size="40" font-family="Montserrat" font-weight="700" fill="#2f7d6a">Өзім үшін өшіру</text><text x="-280" y="170" font-size="40" font-family="Montserrat" font-weight="700" fill="#2f7d6a">Бас тарту</text>`;
      if (t > NOALL) inner += `<g opacity="${f(win(t, NOALL, NOALL + 0.3))}">${RR(-330, 290, 660, 110, "#fff3f5", 5, 26)}<text x="-280" y="362" font-size="38" font-family="Montserrat" font-weight="800" fill="#c9cdd4">Барлығы үшін өшіру</text>${Ln("M-300,345 L300,345", 10, "#e85d75")}</g>`;
      return phoneAt(t, DEL, inner, { old: true }) + (t > OLD ? TY.stamp(t, OLD, "5 ЖЫЛ ЖАҢАРТЫЛМАҒАН", 540, 1520, { size: 54, rot: -4 }) : "");
    },
    type: (t) => TY.pop(t, NOALL + 0.2, "ЖОҚ!", 540, 190, { size: 120, color: "#ff5b4b", rot: -6 }),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });
  const ONLY = S("L15") - 0.2;
  MK.ONLY = ONLY;
  add({
    t0: ONLY, bg: "kitchen", c0: { x: 0, y: -620 },
    cam: [[ONLY, { x: -40, y: -620, z: 1.55 }], [Wt("L15", 1), { x: -40, y: -620, z: 1.6 }], [Wt("L15", 3), { x: 160, y: -640, z: 2.3 }], [S("L16") - 0.3, { x: 160, y: -640, z: 2.4 }]],
    actors: [
      ACT.arturHood({ x: -200, y: 0, keys: [[0, ex("happy", "phoneUp", { turn: 0.4 })], [Wt("L15", 1), ex("deadpan", "phoneUp", { turn: 0.4 }), 0.3]], talk: ["L15"] }),
      ACT.mom({ x: 170, y: 0, keys: [[0, ex("happy", { turn: -0.4, armL: { sh: 120, el: -60, hand: "open" } })], [Wt("L15", 2), ex("shock", { turn: -0.3, squash: 1.06 }), 0.15]] }),
    ],
    type: (t) => TY.pop(t, Wt("L15", 3), "ТЕК СІЗДЕ", 540, 300, { size: 100, color: "#ff8a5b" }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  });
  // көк белгілер: 12 → 47 → 98
  const TK = S("L16") - 0.3, N1 = Wt("L16", 6), N2 = Wt("L16", 10), N3 = Wt("L16", 12);
  MK.TK = TK; MK.N1 = N1; MK.N2 = N2; MK.N3 = N3;
  add({
    t0: TK, bg: "kitchen", c0: { x: 0, y: -600 }, capTop: CAPP,
    cam: [[TK, { x: 0, y: -600, z: 1.3 }], [S("L17") - 0.2, { x: 0, y: -600, z: 1.35 }]],
    shake: (t) => [N1, N2, N3].reduce((a, n, i) => a + (t > n && t < n + 0.25 ? 4 + i * 4 : 0), 0),
    over: (t) => { const n = t < N1 ? 0 : t < N2 ? 12 : t < N3 ? 47 : 98; let inner = GROUP() + voiceMsg(130, -500, 560, "0:47", { seed: 2, ticks: t > Wt("L16", 2) ? "#3fa7e8" : "#9aa1ab" }) + `<text x="-340" y="-340" font-size="40" font-family="Montserrat" font-weight="800" fill="#2f7d6a">Тыңдады: ${n}</text>` + grid(t - N1, n * 0.48, -230); return phoneAt(t, TK, inner); },
    type: (t) => TY.pop(t, N1, "12", 200, 300, { size: 110, color: "#3fa7e8", t1: S("L17") }) + TY.pop(t, N2, "47", 540, 300, { size: 130, color: "#3fa7e8", t1: S("L17") }) + TY.pop(t, N3, "98!", 880, 300, { size: 150, color: "#ff5b4b", t1: S("L17") }),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });

  // ================= 6. КӨЛІКПЕН — СӘУЛЕ АПАҒА =================
  const KEYS = S("L17") - 0.2;
  MK.KEYS = KEYS;
  add({
    t0: KEYS, bg: "kitchen", c0: { x: 0, y: -620 }, flashIn: 0.12,
    cam: [[KEYS, { x: 120, y: -640, z: 2.0 }], [S("L18") - 0.3, { x: 120, y: -640, z: 2.2 }]],
    actors: [ACT.mom({ x: 140, y: 0, keys: [[0, ex("scared", { turn: -0.1 })], [Wt("L17", 4), ex("determined", { turn: -0.2, armR: { sh: 150, el: 10, hand: "fist", prop: K.PROP.keys } }), 0.2]], talk: ["L17"] })],
    type: (t) => TY.pop(t, Wt("L17", 4), "КӨЛІККЕ!", 540, 300, { size: 110, color: "#f6d55c" }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  });
  const CAR = S("L18") - 0.3;
  MK.CAR = CAR;
  add(Object.assign({ bg: () => BG.carInt("road"), bgKey: "car-road" }, {
    t0: CAR, c0: { x: 0, y: -560 }, flashIn: 0.12,
    cam: [[CAR, { x: 0, y: -560, z: 1.5 }], [Wt("L18", 4), { x: 175, y: -600, z: 2.1 }], [S("L19") - 0.2, { x: 175, y: -600, z: 2.2 }]],
    shake: () => 3,
    actors: [
      ACT.arturHood({ x: 0, y: -60, s: 0.6, keys: [[0, ex("scared", { turn: 0 })]] }),
      ACT.mom({ x: -175, y: 0, keys: [[0, ex("scared", "phoneUp", { turn: 0.2, ...PO.lookD })]] }),
      ACT.dad({ x: 175, y: 0, keys: [[0, ex("deadpan", "steer", { turn: -0.1 })]], talk: ["L18"] }),
    ],
    world: (t) => RB.freshener(Math.sin(t * 5) * 6) + RB.carFront({}),
    type: (t) => TY.pop(t, Wt("L18", 5), "«ТЕК ЖҮРГІЗУШІ»", 540, 300, { size: 74, color: "#ffffff" }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  }));
  const RACE = S("L19") - 0.2;
  MK.RACE = RACE;
  const raceX = (t) => (t - RACE) * 1900 - 900;
  add({
    t0: RACE, bg: "road", c0: { x: 0, y: -500 }, mbScale: 0.5, mbMid: 0.15,
    cam: [[RACE, { x: -900, y: -380, z: 0.9 }], [S("L20") - 0.3, { x: raceX(S("L20") - 0.3) - 100, y: -380, z: 0.95 }, (k) => k]],
    world: (t) => { const x = raceX(t); let s = RB.car6(x, 300, 0.6, { wheel: x * 0.8, inside: "", bounce: Math.abs(Math.sin(t * 20)) * 6 }); for (let i = 0; i < 6; i++) s += Ln(`M${f(x - 650 - i * 90)},${f(-60 + i * 50)} L${f(x - 1100 - i * 120)},${f(-60 + i * 50)}`, 10, "#ffffff", ` opacity="0.7"`); return s + puff(x - 560, 260, t, RACE + 0.2, 1.2, 8, "#c9cdd4"); },
    type: (t) => TY.stamp(t, Wt("L19", 4), "7 МИН", 340, 330, { size: 110, color: "#3f9f5a", rot: -6 }) + TY.pop(t, Wt("L19", 8), "20 МИН", 760, 480, { size: 80, color: "#9aa1ab", rot: 6 }) + (t > Wt("L19", 9) ? `<svg style="position:absolute;left:0;top:0" width="1080" height="1920"><path d="M620,480 L${f(620 + 290 * eout(win(t, Wt("L19", 9), Wt("L19", 9) + 0.3)))},470" stroke="#e85d75" stroke-width="16" stroke-linecap="round"/></svg>` : ""),
    fx: () => ({ vig: 0.2 }),
  });

  // ================= 7. СӘУЛЕ АПАНЫҢ ҮЙІ: slow-mo секіріс =================
  const DOOR = S("L20") - 0.3;
  MK.DOOR = DOOR;
  const sauleSit = (keys, talk) => ACT.saule({ x: 260, y: 40, keys: [[0, ex("calm", "phoneEar", "sitFloor", { turn: -0.2 })]].concat(keys || []), talk });
  add({
    t0: DOOR, bg: () => BG.living({ doorOpen: true }), bgKey: "livingOpen", c0: { x: 0, y: -600 }, flashIn: 0.15,
    cam: [[DOOR, { x: -1500, y: -760, z: 1.0 }], [Wt("L20", 2), { x: -600, y: -640, z: 0.85 }], [S("L21") - 0.2, { x: 0, y: -620, z: 0.8 }]],
    shake: (t) => (t > DOOR && t < DOOR + 0.3 ? 12 : 0),
    actors: [
      ACT.mom({ x: -1950, y: -20, keys: [[0, ex("scared", { turn: 0.5, armL: { sh: 120, el: 10, hand: "open" } })]] }),
      ACT.dad({ x: -2150, y: -20, s: 0.72, keys: [[0, ex("deadpan", { turn: 0.5 })]] }),
      ACT.arturHood({ x: -1750, y: -20, s: 0.7, keys: [[0, ex("shock", { turn: 0.5 })]] }),
      sauleSit([[Wt("L20", 5), ex("happy", "phoneEar", "sitFloor", { turn: -0.2, ...PO.lookR }), 0.3]]),
    ],
    world: (t) => (t > Wt("L20", 4) ? shout(330, -620, 120, t, Wt("L20", 4), S("L21") + 1) : ""),
    type: (t) => TY.pop(t, DOOR + 0.1, "ГҮРС!", 300, 330, { size: 100, color: "#ffffff", rot: -8, t1: DOOR + 1.2 }),
    fx: () => ({ vig: 0.25 }),
  });
  const LEAP = S("L21") - 0.2, LAND = Wt("L21", 6);
  MK.LEAP = LEAP; MK.LAND = LAND;
  const momFly = (t) => { const k = win(t, LEAP + 0.2, LAND); return { x: lerp(-1300, 80, k), y: lerp(-20, 40, k) - Math.sin(k * Math.PI) * 520, rot: t < LAND ? lerp(-20, -78, Math.min(1, k * 3)) : -88 }; };
  add({
    t0: LEAP, bg: () => BG.living({ doorOpen: true }), bgKey: "livingOpen", c0: { x: 0, y: -600 },
    cam: [[LEAP, { x: -700, y: -720, z: 1.0 }], [LAND, { x: 60, y: -560, z: 1.05 }, (k) => sm(k)], [S("L22") - 0.2, { x: 120, y: -480, z: 1.2 }]],
    shake: (t) => (t > LAND && t < LAND + 0.35 ? 14 : 0),
    actors: [
      ACT.mom({ x: -1300, y: -20, pos: (t) => momFly(t), keys: [[0, ex("determined", "fly", { lean: 0 })], [LAND, ex("strain", { lean: 0, armL: { sh: 170, el: 0, hand: "open" }, armR: { sh: 170, el: 0, hand: "open" } }), 0.2]] }),
      sauleSit([[0, ex("calm", "phoneEar", "sitFloor", { turn: -0.2, ...PO.lookL })], [LEAP + 1.4, ex("shock", "phoneEar", "sitFloor", { turn: -0.3 }), 0.4]]),
    ],
    world: (t) => (t > LAND ? puff(-120, 40, t, LAND, 0.8, 8, "#e8d6c0") : ""),
    type: (t) => TY.pop(t, LEAP + 0.3, "SLOW-MO", 540, 200, { size: 54, color: "#ffffff", t1: LAND - 0.2 }) + TY.pop(t, Wt("L21", 7), "КЕШ ҚАЛДЫ", 540, 300, { size: 100, color: "#ff8a5b" }),
    fx: (t) => ({ vig: 0.4, dof: 3, tint: "#ffd9a8", tintA: t < LAND ? 0.15 : 0 }),
  });
  // Сәуленің телефонынан: «Күріші тас сияқты!»
  const PLAY = S("L22") - 0.2;
  MK.PLAY = PLAY;
  add({
    t0: PLAY, bg: "living", c0: { x: 0, y: -600 }, capTop: CAPP,
    cam: [[PLAY, { x: 200, y: -600, z: 1.4 }], [S("L23") - 0.3, { x: 200, y: -600, z: 1.45 }]],
    over: (t) => phoneAt(t, PLAY, GROUP() + voiceMsg(130, -380, 560, "0:47", { seed: 2, k: win(t, S("L22"), E("L22")) * 0.4 + 0.55, ticks: "#3fa7e8" })),
    type: (t) => TY.pop(t, S("L22"), "«ТАС СИЯҚТЫ!»", 540, 200, { size: 90, color: "#9aa1ab" }),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });
  const SIL = S("L23") - 0.3;
  MK.SIL = SIL;
  add({
    t0: SIL, bg: () => BG.living({ doorOpen: true }), bgKey: "livingOpen", c0: { x: 0, y: -600 }, still: true,
    cam: [[SIL, { x: -100, y: -560, z: 0.95 }], [S("L24") - 0.2, { x: -100, y: -560, z: 0.97 }]],
    actors: [
      ACT.mom({ x: 0, y: 30, rot: -88, keys: [[0, ex("closed", { armL: { sh: 170, el: 0, hand: "open" }, armR: { sh: 170, el: 0, hand: "open" } })]] }),
      ACT.dad({ x: -1950, y: -20, s: 0.72, keys: [[0, ex("deadpan", { turn: 0.4 })]] }),
      ACT.arturHood({ x: -1700, y: -20, s: 0.7, keys: [[0, ex("deadpan", { turn: 0.4 })]] }),
      sauleSit([[0, ex("deadpan", "phoneEar", "sitFloor", { turn: -0.2, ...PO.lookL })]]),
    ],
    type: (t) => TY.pop(t, SIL + 0.6, "...", 540, 300, { size: 150, color: "#ffffff" }),
    fx: () => ({ vig: 0.4, sat: 0.75 }),
  });
  // Сәуле: «Мен де... сенің мантыңа қатысты»
  const CONF = S("L24") - 0.2;
  MK.CONF = CONF;
  add({
    t0: CONF, bg: "living", c0: { x: 0, y: -600 },
    cam: [[CONF, { x: 260, y: -600, z: 2.2 }], [Wt("L24", 9), { x: 220, y: -580, z: 2.0 }], [S("L25") - 0.3, { x: 160, y: -540, z: 1.7 }]],
    actors: [
      ACT.mom({ x: -40, y: 30, rot: -88, pos: (t) => (t > Wt("L24", 9) ? { rot: lerp(-88, -40, win(t, Wt("L24", 9), Wt("L24", 9) + 0.5)) } : {}), keys: [[0, ex("closed")], [Wt("L24", 0), ex("shock", { armL: { sh: 90, el: 0, hand: "open" }, armR: { sh: 90, el: 0, hand: "open" } }), 0.3]] }),
      sauleSit([[0, ex("shy", "sitFloor", { turn: -0.3, armR: { sh: 30, el: -120, hand: "open" } })], [Wt("L24", 9), ex("nervous", "sitFloor", { turn: -0.3, ...PO.lookL }), 0.3]], ["L24"]),
    ],
    type: (t) => TY.pop(t, Wt("L24", 10), "МАНТЫ?!", 540, 300, { size: 110, color: "#fbf3e2" }),
    fx: () => ({ vig: 0.3, dof: 2.5 }),
  });
  // Сәуленің таңертеңгі войсы: «...резеңке сияқты!»
  const SV = S("L25") - 0.3, BOING = Wt("L26", 2);
  MK.SV = SV; MK.BOING = BOING;
  add({
    t0: SV, bg: "living", c0: { x: 0, y: -600 }, capTop: CAPP,
    cam: [[SV, { x: 0, y: -600, z: 1.3 }], [S("L27") - 0.3, { x: 0, y: -600, z: 1.35 }]],
    over: (t) => {
      const sc = eout(win(t, SV + 0.4, SV + 1.6)) * 700;
      let inner = `<g transform="translate(0,${f(sc - 700)})">${voiceMsg(-120, -500, 560, "1:12", { mine: false, seed: 9, k: t > S("L26") ? win(t, S("L26"), E("L26")) : 0 })}<text x="-350" y="-610" font-size="32" font-family="Montserrat" font-weight="700" fill="#5a7fc4">Сәуле · 08:14</text>${voiceMsg(130, -150, 560, "0:47", { seed: 2, ticks: "#3fa7e8" })}</g>` + GROUP();
      let s = phoneAt(t, SV, inner);
      if (t > BOING) { const k = t - BOING; s += g(540, 1180 - Math.abs(Math.sin(k * 7)) * 200 * Math.exp(-k * 0.8), 1, RB.manty(0, 0, 1.6, 0.75 + 0.25 * Math.abs(Math.cos(k * 7)))); }
      return s;
    },
    type: (t) => TY.pop(t, Wt("L25", 4), "08:14 · «АҒАЙЫН»", 540, 200, { size: 64, color: "#ffffff", t1: S("L26") }) + TY.pop(t, BOING, "РЕЗЕҢКЕ!", 540, 200, { size: 110, color: "#fbf3e2", wob: 4 }),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });
  // күлкі
  const LOL = S("L27") - 0.3, HUG = Wt("L27", 4);
  MK.LOL = LOL; MK.HUG = HUG;
  add({
    t0: LOL, bg: "living", c0: { x: 0, y: -600 }, flashIn: 0.12,
    cam: [[LOL, { x: 60, y: -600, z: 2.0 }], [HUG, { x: 60, y: -600, z: 1.75 }], [S("L28") - 0.2, { x: 60, y: -600, z: 1.6 }]],
    shake: (t) => (t > HUG ? 3 : 0),
    actors: [
      ACT.mom({ x: -110, y: 40, mod: (t, p) => { if (t > HUG) { p.squash = (p.squash || 1) * (1 + Math.sin(t * 18) * 0.02); } return p; }, keys: [[0, ex("deadpan", { turn: 0.4, ...PO.lookR })], [Wt("L27", 3), ex("smug", { turn: 0.4 }), 0.3], [HUG, ex("laugh", "hug", { turn: 0.3 }), 0.25]] }),
      ACT.saule({ x: 230, y: 40, mod: (t, p) => { if (t > HUG) { p.squash = (p.squash || 1) * (1 + Math.cos(t * 17) * 0.02); } return p; }, keys: [[0, ex("nervous", { turn: -0.4, ...PO.lookL })], [Wt("L27", 3), ex("smug", { turn: -0.4 }), 0.3], [HUG, ex("laugh", "hug", { turn: -0.3 }), 0.25]] }),
    ],
    world: (t) => (t > HUG ? tears(-110, -640, t, 2) + tears(230, -640, t + 0.3, 2) : ""),
    type: (t) => TY.pop(t, HUG + 0.2, "ХА-ХА-ХА!", 540, 300, { size: 100, color: "#f6d55c", wob: 5 }) + TY.pop(t, Wt("L27", 6), "30 МИНУТ", 540, 440, { size: 80, color: "#ffffff" }),
    fx: () => ({ vig: 0.25, dof: 2.5 }),
  });
  // 143 адам үнсіз тыңдап отыр
  const MUTE = S("L28") - 0.2;
  MK.MUTE = MUTE;
  add({
    t0: MUTE, bg: "living", c0: { x: 0, y: -600 }, capTop: CAPP,
    cam: [[MUTE, { x: 0, y: -600, z: 1.3 }], [S("L29") - 0.3, { x: 0, y: -600, z: 1.35 }]],
    over: (t) => phoneAt(t, MUTE, GROUP("143 адам... жазып жатыр") + `<text x="-340" y="-520" font-size="40" font-family="Montserrat" font-weight="800" fill="#2f7d6a">Тыңдады: 143</text>` + grid(t - MUTE, 48, -400) + `<text x="0" y="560" font-size="40" font-family="Montserrat" font-weight="700" fill="#667" text-anchor="middle">...жазып жатыр</text>`),
    type: (t) => TY.pop(t, Wt("L28", 6), "ҮНСІЗ", 540, 200, { size: 110, color: "#ffffff" }),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });

  // ================= 8. ӘЖЕМНІҢ ВОЙСЫ → ТАС ПАЛАУ =================
  const AJE = S("L29") - 0.3, AJV = S("L30");
  MK.AJE = AJE; MK.AJV = AJV;
  add({
    t0: AJE, bg: "room", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[AJE, { x: 0, y: -560, z: 1.3 }], [AJV, { x: 0, y: -600, z: 1.8 }], [S("L31") - 0.3, { x: 0, y: -600, z: 2.0 }]],
    actors: [ACT.aje({ x: 0, y: 30, keys: [[0, ex("thinking", { turn: 0.1, armR: { sh: 46, el: -128, hand: "fist", propFront: B.PROPS.phone() } })], [AJV, ex("calm", { turn: 0, armR: { sh: 30, el: -150, hand: "fist", propFront: B.PROPS.phone() } }), 0.3], [Wt("L30", 5), ex("warm", { armR: { sh: 30, el: -150, hand: "fist", propFront: B.PROPS.phone() } }), 0.4]], talk: ["L30"] })],
    type: (t) => TY.stamp(t, Wt("L29", 5), "ӘЖЕМ: 1-ВОЙС", 540, 300, { size: 70, color: "#3f9f5a", rot: -4 }) + TY.pop(t, AJV + 0.2, "«АЛЛО? АЛЛО?»", 540, 440, { size: 64, color: "#ffffff", t1: Wt("L30", 5) }),
    fx: () => ({ vig: 0.3, dof: 2, tint: "#ffd9a8", tintA: 0.1 }),
  });
  const EAT = S("L31") - 0.3, CRUNCH = Wt("L31", 6);
  MK.EAT = EAT; MK.CRUNCH = CRUNCH;
  add({
    t0: EAT, bg: "room", c0: { x: 0, y: -560 }, flashIn: 0.15,
    cam: [[EAT, { x: 0, y: -520, z: 1.05 }], [CRUNCH - 0.2, { x: 120, y: -560, z: 1.3 }], [CRUNCH + 0.3, { x: 200, y: -600, z: 2.0 }, eout], [S("L32") - 0.2, { x: 200, y: -600, z: 2.1 }]],
    shake: (t) => (t > CRUNCH && t < CRUNCH + 0.3 ? 12 : 0),
    actors: [
      ACT.aje({ x: -420, y: 120, keys: [[0, ex("happy", "sitFloor", { turn: 0.3 })]] }),
      ACT.mom({ x: -150, y: 120, keys: [[0, ex("calmSmile", "sitFloor", { turn: 0.2 })], [CRUNCH + 0.2, ex("twitch", "sitFloor", { turn: 0.2 }), 0.2]] }),
      ACT.arturHood({ x: 200, y: 120, keys: [[0, ex("happy", "sitFloor", { turn: -0.1 })], [CRUNCH, ex("strain", "sitFloor", { squash: 0.94 }), 0.08], [CRUNCH + 0.5, ex("twitch", "sitFloor", { turn: -0.1 }), 0.3]] }),
      ACT.saule({ x: 460, y: 120, keys: [[0, ex("calmSmile", "sitFloor", { turn: -0.3 })], [CRUNCH + 0.3, ex("twitch", "sitFloor", { turn: -0.3 }), 0.2]] }),
    ],
    world: (t) => BG.table(0, 330, 0.95) + RB.plov(0, 110, 0.75) + (t > CRUNCH ? tears(200, -560, t, 1) : ""),
    type: (t) => TY.pop(t, CRUNCH, "ТАРС!", 540, 300, { size: 130, color: "#ffffff", rot: -8 }) + TY.pop(t, Wt("L31", 7) + 0.3, "ТАС СИЯҚТЫ", 540, 450, { size: 80, color: "#9aa1ab" }),
    fx: () => ({ vig: 0.3, dof: 2 }),
  });
  const TXT = S("L32") - 0.2;
  MK.TXT = TXT;
  add({
    t0: TXT, bg: "room", c0: { x: 0, y: -560 }, capTop: CAPP,
    cam: [[TXT, { x: 0, y: -560, z: 1.3 }], [S("L33") - 0.3, { x: 0, y: -560, z: 1.35 }]],
    over: (t) => { let inner = GROUP(); [["Өте дәмді болды!", "#d9fdd3", 140], ["Рахмет, апа!", "#ffffff", -60], ["Керемет палау!", "#ffffff", 60], ["Тағы барамыз :)", "#ffffff", -40]].forEach(([txt, col, dx], i) => { if (t > TXT + 0.4 + i * 0.6) inner += textMsg(dx, -420 + i * 180, 620, txt, { mine: i === 0, size: 40 }); }); return phoneAt(t, TXT, inner); },
    type: (t) => TY.stamp(t, Wt("L32", 4), "ВОЙС: 0", 540, 200, { size: 90, color: "#3f9f5a", rot: -5 }),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });

  // ================= 9. КЕҢЕС + СОҢЫ =================
  const HOST = S("L33") - 0.3, TIP = Wt("L33", 5), CTA = Wt("L34", 7), BUZZ = S("L35") - 0.5;
  const END = E("L35") + 1.6;
  MK.HOST = HOST; MK.TIP = TIP; MK.CTA = CTA; MK.BUZZ = BUZZ; MK.END = END;
  add({
    t0: HOST, bg: "host", bgArgs: [["#d9fdd3", "#9fd9c4"]], bgKey: "hostMint", c0: { x: 0, y: -600 }, flashIn: 0.2,
    cam: [[HOST, { x: 0, y: -600, z: 2.0 }], [TIP, { x: 0, y: -620, z: 2.15 }], [CTA, { x: 0, y: -600, z: 1.9 }], [BUZZ, { x: 0, y: -620, z: 2.2 }], [END, { x: 0, y: -640, z: 2.6 }]],
    shake: (t) => (t > BUZZ && t < BUZZ + 0.6 ? 3 : 0),
    actors: [ACT.arturHood({ x: 0, y: 30, keys: [[0, ex("happy")], [S("L33") + 0.3, ex("calm", "fingerUp"), 0.3], [TIP, ex("smug", "point"), 0.2], [CTA, ex("happy", "wave"), 0.3], [BUZZ, ex("deadpan", "phoneUp", { ...PO.lookD }), 0.2], [S("L35") + 0.8, ex("deadpan", "phoneUp", { ...PO.lookC }), 0.3]], talk: ["L33", "L34"] })],
    over: (t) => (t > BUZZ ? g(540, 170 + 60 * eout(win(t, BUZZ, BUZZ + 0.4)), 1, RR(-420, -80, 840, 150, "#ffffff", 6, 40) + C(-340, -5, 46, "#ffd1dc", 5) + `<text x="-270" y="-14" font-size="40" font-family="Montserrat" font-weight="900" fill="${INK}">Анам</text><text x="-270" y="38" font-size="36" font-family="Montserrat" font-weight="700" fill="#2f7d6a">Дауыстық хабарлама · 4:37</text>`) : ""),
    type: (t) => TY.pop(t, Wt("L33", 2) + 0.2, "ЖІБЕРМЕС БҰРЫН", 540, 330, { size: 70, color: "#ffffff", t1: CTA - 0.2 }) + TY.stamp(t, TIP, "КІМГЕ? ТЕКСЕР!", 540, 460, { size: 76, color: "#3f9f5a", rot: -4, t1: CTA - 0.2 }) + TY.pop(t, CTA, "КОММЕНТАРИЙГЕ ЖАЗ!", 540, 330, { size: 66, color: "#2f7d6a", t1: BUZZ }) + TY.swing(t, E("L35") + 0.3, "САУ БОЛЫҢДАР!", 540, 460, { size: 96, color: "#f6d55c" }),
    fx: () => ({ vig: 0.2 }),
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.SONGY_TOTAL = END + 0.2;

  // ---------- дыбыс ----------
  G.SONGY_AUDIO = (a) => {
    const { mus, fx, M } = a;
    fx("voicemsg", 0.3, -10);
    fx("ping", 0.9, -12);
    mus("tension3", 0.2, M.TITLE, -17, { fi: 0.8, fo: 0.1 });
    fx("notifs", M.CITY, -9, { dur: M.INNO - M.CITY, fo: 0.4 });
    fx("ping", M.CITY + 0.4, -14); fx("ping", M.CITY + 1.1, -13); fx("ping", M.CITY + 1.6, -12);
    fx("whoosh", M.TITLE - 0.1, -9);
    fx("dombraHit", M.TITLE, -7);
    mus("theme", M.TITLE, M.LAWS + 0.5, -10, { fi: 0.05, fo: 0.6 });
    fx("birds", M.SPR, -16, { dur: 4, fo: 1 });
    fx("dombraHit", M.LAWS + 0.2, -8);
    mus("montage", M.LAWS + 0.3, M.PLOV + 0.4, -13, { fi: 0.6, fo: 0.8 });
    fx("stamp", M.L1 + 0.1, -11); fx("stamp", M.L2 + 0.1, -11); fx("stamp", M.L3 + 0.1, -11);
    fx("buzz", M.REC, -18, { dur: 2.0, fo: 0.3 });
    fx("timelapse", M.REC + 0.2, -14);
    fx("whoosh", Wt("L06", 2), -13);
    fx("stamp", M.PLUS, -10);
    fx("keys", M.PRG + 0.3, -15, { dur: 1.5 });
    fx("stamp", Wt("L08", 3), -10);
    mus("aul", M.PLOV, M.GRP + 0.5, -13, { fi: 0.6, fo: 0.6 });
    fx("plates", M.PLOV + 0.3, -16);
    fx("crunch", M.STONE, -9);
    fx("voicemsg", M.SENT - 0.3, -11);
    fx("ping", M.SENT, -10);
    mus("tension2", M.GRP, M.FRZ + 0.02, -15, { fi: 0.3, fo: 0.04 });
    fx("dundun", M.FRZ + 0.15, -6);
    fx("scratch", M.FRZ + 0.1, -12, { dur: 0.6 });
    mus("chaos", M.PAN, M.CAR + 0.3, -13, { fi: 0.05, fo: 0.4 });
    fx("whoosh", M.THROW, -10);
    fx("stepsUp", M.PAN + 0.3, -14);
    fx("pops", M.NOALL, -10);
    fx("stamp", M.OLD, -10);
    fx("ping", M.N1, -11); fx("ping", M.N2, -9); fx("ping", M.N3, -7);
    fx("notifs", M.N2, -14, { dur: 2.0, fo: 0.4 });
    fx("keys", Wt("L17", 4), -12, { dur: 0.6 });
    fx("doorSlam", M.CAR - 0.1, -10);
    fx("engineStart", M.CAR + 0.1, -16);
    mus("chase", M.RACE - 0.1, M.LEAP, -12, { fi: 0.05, fo: 0.3 });
    fx("carRace", M.RACE, -8);
    fx("doorSlam", M.DOOR, -6);
    mus("epic2", M.LEAP, M.PLAY + 0.4, -10, { fi: 0.2, fo: 0.3 });
    fx("heartbeat", M.LEAP, -12, { dur: M.LAND - M.LEAP });
    fx("thud", M.LAND, -5);
    fx("voicemsg", M.PLAY + 0.2, -14);
    fx("tea", M.SIL, -26, { dur: 0.1 });
    mus("tension3", M.CONF, M.LOL + 0.2, -16, { fi: 0.6, fo: 0.3 });
    fx("boing", M.BOING, -8); fx("boing", M.BOING + 0.9, -12);
    fx("womenLaugh", M.HUG, -8);
    mus("theme3", M.HUG, M.AJE + 0.4, -12, { fi: 0.3, fo: 0.8 });
    fx("ping", M.AJE + 0.3, -12);
    mus("piano", M.AJE, M.EAT + 0.5, -12, { fi: 1.0, fo: 0.8 });
    fx("crunch", M.CRUNCH, -6);
    fx("crack", M.CRUNCH + 0.05, -12);
    fx("pops", M.TXT + 0.4, -14); fx("pops", M.TXT + 1.0, -14); fx("pops", M.TXT + 1.6, -14); fx("pops", M.TXT + 2.2, -14);
    fx("stamp", Wt("L32", 4), -10);
    fx("whoosh", M.HOST - 0.1, -10);
    mus("outro", M.HOST, a.TOTAL, -12, { fi: 0.6, fo: 1.8 });
    fx("stamp", M.TIP, -10);
    fx("buzz", M.BUZZ, -10, { dur: 0.6 });
    fx("voicemsg", M.BUZZ + 0.2, -14);
    fx("dombraHit", E("L35") + 0.3, -7);
  };
})(typeof window !== "undefined" ? window : globalThis);
