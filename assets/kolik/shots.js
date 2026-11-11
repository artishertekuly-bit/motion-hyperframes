/* «Әкемнің Ақбозы» (Reels 9:16, ~2:50) — кадрлар.
 * Ілмек (айқай) → тақырып → автомектеп/тегін → Ақбоз → әкемнің 3 ережесі → базар алаңы (3 рет өшу, кенгуру, әже)
 * → өр + қарбыз көлігі → slow-mo «Тежегішті бас!» → 1 см → қарбыз көшкіні → 150 мың → анам → куәлік → кеңес. */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RB = G.REELS_BG, K = G.REELS_KIT, RIG = G.ArturRig;
  const { S, E, TY, lerp, clamp, sm, eio, eout, spring, win, noise, hash } = Q;
  const { BG, P, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { Wt, POSES: PO, ACT, puff, speed, shout, notes, sweat, tears, confetti, stars, thought, rewind, law, hook, card, phoneBig } = K;
  const { g, TB, E: EL } = RB;
  const X = RIG.EXPR;
  const SH = [], MK = {};
  const add = (o) => SH.push(o);
  const ex = (...a) => Object.assign({}, ...a.map((k) => (typeof k === "string" ? X[k] || PO[k] || RIG.POSES[k] : k)));

  // ---------- көлік ішіндегі кадр ----------
  const carBg = (loc, opts) => ({ bg: () => BG.carInt(loc, opts), bgKey: "car-" + loc + (opts && opts.night ? "N" : "") });
  // шырша бет-әлпетті жаппасын: тербелу [-20°, 6°] аралығында (толық айналым — тек 3-өшуде)
  const inCar = (t, ang, o) => RB.freshener(Math.abs(ang) > 90 ? ang : clamp(ang * 0.45 - 6, -20, 6)) + RB.carFront(o || {});
  const fresh = (t, t0, amp) => (t < t0 ? 0 : Math.sin((t - t0) * 7) * amp * Math.exp(-(t - t0) * 0.9));
  // жүргізуші (экранның оң жағы) мен жолаушы (сол жағы)
  const PAS = -175, DRV = 175;

  // ---------- өр (көше) геометриясы ----------
  const SL = BG.SLOPE, ANG = -Math.atan(SL) * 180 / Math.PI, CS = Math.cos(ANG * Math.PI / 180), SN = Math.sin(ANG * Math.PI / 180);
  const roadY = (x) => -SL * x;
  const CAR_S = 0.5, TRK_S = 0.55, TRK_X = -640, BUS_X = -1650, LIGHT_X = 820;
  const CAR_X0 = 260, CAR_X1 = -6;
  const carOn = (x, o) => RB.car6(x, roadY(x) - 2, CAR_S, Object.assign({ rot: ANG }, o || {}));
  const truckW = (o) => RB.truck(TRK_X, roadY(TRK_X), TRK_S, Object.assign({ rot: ANG }, o || {}));
  const busW = () => RB.bus(BUS_X, roadY(BUS_X), 0.45, { rot: ANG });
  const lightW = (st) => RB.trafficLight(LIGHT_X, roadY(LIGHT_X) - 70, 0.85, st);
  const MEL = RB.truckMelons();
  const melW = (i) => { const [lx, ly, r] = MEL[i]; return [TRK_X + TRK_S * (lx * CS - ly * SN), roadY(TRK_X) + TRK_S * (lx * SN + ly * CS), r * TRK_S]; };
  // кабинадағы адамдардың бастары (бүйірден): шағын бас
  const miniHead = (x, y, r, hair, expr) => C(x, y, r, "#ffffff", 5) + P(`M${f(x - r)},${f(y - r * 0.1)} Q${f(x - r)},${f(y - r * 1.1)} ${f(x)},${f(y - r * 1.05)} Q${f(x + r)},${f(y - r * 1.1)} ${f(x + r)},${f(y - r * 0.2)} Q${f(x + r * 0.3)},${f(y - r * 0.6)} ${f(x - r)},${f(y - r * 0.1)}Z`, hair || "#2a2522", 4) + `<circle cx="${f(x + r * 0.45)}" cy="${f(y)}" r="${f(r * 0.12)}" fill="${INK}"/>` + (expr === "shout" ? EL(x + r * 0.5, y + r * 0.45, r * 0.22, r * 0.3, INK, 0) : Ln(`M${f(x + r * 0.25)},${f(y + r * 0.45)} L${f(x + r * 0.7)},${f(y + r * 0.42)}`, 4));
  const inside = (expr) => miniHead(70, -505, 62, "#3a3530", expr) + miniHead(170, -500, 64, "#2a2522");
  // аяқ киім (жоғарыдан)
  const sneaker = (x, y, rot) => g(x, y, 1, Ln("M0,-900 L0,-120", 110, INK) + Ln("M0,-900 L0,-120", 96, "#3a3f4c") + P("M-60,-150 Q-70,60 0,90 Q70,60 60,-150Z", "#e9e9ee", 7) + Ln("M-30,-60 L30,-60 M-30,-20 L30,-20 M-30,20 L30,20", 5, "#9aa1ab"), rot);
  const bagP = `<g transform="translate(0,70)">${RR(-60, 0, 120, 150, "#7cc47a", 6, 18)}${C(-20, -6, 20, "#f2a541", 4)}${RR(10, -50, 22, 60, "#f6d55c", 4, 6)}</g>`;
  const licence = (x, y, s) => g(x, y, s, RR(-300, -190, 600, 380, "#eaf3ff", 8, 30) + RF(-300, -190, 600, 90, "#3f6fb5", 30) + TX(0, -128, "ЖҮРГІЗУШІ КУӘЛІГІ", 40, "#ffffff") + RR(-260, -70, 190, 230, "#ffffff", 5, 10) + `<g transform="translate(-165,175) scale(0.24)">${RIG.draw(Object.assign({ look: "artur", outfit: "tee" }, X.happy), { seed: 5, id: "lic" })}</g>` + `<text x="-40" y="-20" font-size="40" font-family="Montserrat" font-weight="900" fill="${INK}">АРТУР</text><text x="-40" y="40" font-size="32" font-family="Montserrat" font-weight="700" fill="#3f6fb5">Санат: B</text><text x="-40" y="100" font-size="28" font-family="Montserrat" font-weight="600" fill="#667">№ 000018</text>`);
  const note = (x, y, txt, rot) => g(x, y, 1, RR(-110, -80, 220, 160, "#fff59d", 5, 4) + TB(0, 22, txt, 54, "#e85d75"), rot);
  const check = (x, y, s) => g(x, y, s, C(0, 0, 60, "#7cc47a", 6) + Ln("M-28,2 L-6,26 L32,-22", 12, "#ffffff"));

  // ================= 0. ІЛМЕК: әкемнің жалғыз айқайы =================
  const SHOUT = S("L02"), FRZ0 = E("L02") + 0.15, TITLE = FRZ0 + 1.15;
  MK.SHOUT = SHOUT; MK.FRZ0 = FRZ0; MK.TITLE = TITLE;
  add(Object.assign(carBg("hill"), {
    t0: 0, c0: { x: 0, y: -560 }, fadeIn: 0.4, freeze: FRZ0,
    cam: [[0, { x: PAS, y: -600, z: 2.6 }], [Wt("L01", 4), { x: PAS + 40, y: -600, z: 2.4 }], [Wt("L01", 6), { x: DRV, y: -600, z: 2.4 }, eio], [SHOUT - 0.15, { x: 0, y: -580, z: 1.75 }], [SHOUT + 0.2, { x: 0, y: -570, z: 1.95 }], [FRZ0, { x: 0, y: -570, z: 2.05 }]],
    shake: (t) => (t > SHOUT && t < FRZ0 ? 20 : 0),
    actors: [
      ACT.dad({ x: PAS, y: 0, keys: [[0, ex("calmSmile", { turn: 0.25 })], [SHOUT - 0.05, ex("angry", { turn: 0.45, mouth: "shock", squash: 1.12, eye: { scale: 1.3, pupil: 0.5 } }), 0.08]], talk: ["L02"] }),
      ACT.artur({ x: DRV, y: 0, keys: [[0, ex("nervous", "steer", { turn: -0.1 })], [SHOUT + 0.05, ex("scared", "steer", { headTilt: -14, squash: 0.94, turn: -0.2 }), 0.1]] }),
    ],
    world: (t) => inCar(t, t > SHOUT ? -40 - 18 * Math.sin(t * 30) : fresh(t, 0, 10)) + sweat(DRV - 50, -760, t, 0.8, 2) + shout(PAS + 80, -560, 240, t, SHOUT, FRZ0, 4),
    type: (t) => TY.pop(t, Wt("L01", 2), "АЙҚАЙ: 0", 540, 290, { size: 84, color: "#7cc47a", t1: SHOUT - 0.1 }) + TY.pop(t, SHOUT, "ТЕЖЕГІШ!!!", 540, 330, { size: 130, color: "#ff5b4b", rot: -6, wob: 5 }) + TY.stamp(t, FRZ0 + 0.1, "АЙҚАЙ: 1", 540, 520, { size: 80, rot: 6 }),
    fx: (t) => K.freezeFx(t, FRZ0, { vig: 0.3 }),
  }));
  // тақырып: аулада Ақбоз
  add({
    t0: TITLE, bg: "courtyard", c0: { x: 0, y: -700 }, flashIn: 0.25,
    cam: [[TITLE, { x: 0, y: -900, z: 0.62 }], [S("L03") - 0.2, { x: 0, y: -820, z: 0.7 }]],
    world: (t) => { const b = Math.max(0, Math.sin((t - TITLE - 0.5) * 14)) * 30 * Math.exp(-(t - TITLE - 0.5) * 3) * (t > TITLE + 0.5 ? 1 : 0); return RB.car6(0, 200, 0.75, { bounce: b }) + RB.sparkle(-300, -150, 40) + RB.sparkle(320, -80, 30); },
    type: (t) => TY.swing(t, TITLE + 0.05, "ӘКЕМНІҢ", 540, 500, { size: 150, color: "#ffffff" }) + TY.swing(t, TITLE + 0.35, "АҚБОЗЫ", 540, 690, { size: 170, color: "#f6d55c" }),
    fx: () => ({ vig: 0.2 }),
  });

  // ================= 1. АВТОМЕКТЕП → «ӨЗІМ ҮЙРЕТЕМІН» =================
  const HOME = S("L03") - 0.2, CROSS = Wt("L04", 6), FREE = Wt("L04", 8);
  MK.HOME = HOME; MK.CROSS = CROSS; MK.FREE = FREE;
  const flyerP = `<g transform="translate(0,120) scale(0.3)">${RB.flyer(0, 0, 1, 0).replace(/^<g transform="[^"]*">/, "<g>")}</g>`;
  add({
    t0: HOME, bg: "kitchen", c0: { x: 0, y: -620 }, flashIn: 0.2,
    cam: [[HOME, { x: -200, y: -600, z: 1.9 }], [S("L04") - 0.2, { x: -120, y: -600, z: 1.6 }], [Wt("L04", 6), { x: 120, y: -600, z: 1.75 }], [S("L05") - 0.3, { x: 200, y: -600, z: 2.0 }]],
    actors: [
      ACT.artur({ x: -230, y: 0, keys: [[0, ex("happy", { turn: 0.3, armR: { sh: 70, el: -40, hand: "fist", propFront: flyerP } })], [S("L04") + 0.3, ex("shock", { turn: 0.4, armR: { sh: 20, el: -10, hand: "open", propFront: "" } }), 0.15], [FREE, ex("deadpan", { turn: 0.4 }), 0.3]] }),
      ACT.dad({ x: 260, y: 0, keys: [[0, ex("calm", { turn: -0.4 })], [S("L04") + 0.2, ex("shock", { turn: -0.4, armR: { sh: 70, el: -40, hand: "fist", propFront: flyerP } }), 0.15], [Wt("L04", 6), ex("smug", { turn: -0.3, armR: { sh: 30, el: -10, hand: "rest" } }), 0.2], [FREE, ex("proud", { turn: -0.2, armL: { sh: 150, el: 10, hand: "fist" } }), 0.2]], talk: ["L04"] }),
    ],
    type: (t) => TY.pop(t, Wt("L03", 1), "18 ЖАС", 540, 300, { size: 100, color: "#f6d55c", t1: S("L04") - 0.1 }) + TY.pop(t, Wt("L04", 1), "150 000 ₸", 540, 320, { size: 110, color: "#ff5b4b", t1: FREE - 0.1 }) + (t > CROSS && t < FREE ? `<svg style="position:absolute;left:0;top:0" width="1080" height="1920"><path d="M220,330 L${f(220 + 640 * eout(win(t, CROSS, CROSS + 0.25)))},310" stroke="#141418" stroke-width="22" stroke-linecap="round"/></svg>` : "") + TY.stamp(t, FREE, "0 ₸ — ТЕГІН!", 540, 330, { size: 86, color: "#3f9f5a", rot: -5 }),
    fx: () => ({ vig: 0.2, dof: 2 }),
  });
  // Ақбоз: 1991, ақ «алтылық», рейтинг
  const AKB = S("L05") - 0.3, NAME = Wt("L05", 8), RANK = S("L06"), KISS = Wt("L06", 6);
  MK.AKB = AKB; MK.NAME = NAME; MK.KISS = KISS;
  add({
    t0: AKB, bg: "courtyard", c0: { x: 0, y: -500 }, flashIn: 0.2,
    cam: [[AKB, { x: 0, y: -420, z: 1.05 }], [NAME, { x: 120, y: -380, z: 1.2 }], [RANK, { x: 60, y: -440, z: 1.0 }], [KISS, { x: 300, y: -420, z: 1.35 }], [S("L07") - 0.3, { x: 320, y: -420, z: 1.45 }]],
    actors: [ACT.dad({ x: 380, y: 260, mod: (t, p) => { if (t < RANK) p.armR = { sh: 60 + Math.sin(t * 8) * 20, el: -50, hand: "fist", prop: K.PROP.cloth }; return p; },
      keys: [[0, ex("happy", { turn: -0.5 })], [KISS - 0.3, ex("closed", { turn: -0.7, lean: -12, mouth: "oh" }), 0.3], [KISS + 0.9, ex("happy", { turn: -0.4, lean: 0 }), 0.3]] })],
    worldBack: (t) => RB.car6(0, 260, 0.6, {}) + (t > AKB + 0.3 ? RB.sparkle(-250, -20, 34) + RB.sparkle(200, 60, 26) : ""),
    world: (t) => (t > KISS ? RB.heart(400, -420 - (t - KISS) * 80, spring(win(t, KISS, KISS + 0.5)), "#ff6f91") : ""),
    type: (t) => TY.pop(t, Wt("L05", 2), "1991", 300, 300, { size: 100, color: "#ffffff", t1: RANK - 0.2 }) + TY.pop(t, Wt("L05", 5), "АҚ «АЛТЫЛЫҚ»", 680, 420, { size: 70, color: "#f6d55c", rot: 5, t1: RANK - 0.2 }) + TY.stamp(t, NAME, "АҚБОЗ", 540, 560, { size: 100, color: "#3f6fb5", rot: -4, t1: RANK - 0.2 }),
    over: (t) => {
      if (t < RANK) return "";
      const k = spring(win(t, RANK, RANK + 0.6));
      let s = RR(-330, -260, 660, 520, "#ffffff", 8, 24) + TX(0, -180, "ӘКЕМНІҢ ТОП-3", 46, "#e85d75");
      [["1. АНАМ", Wt("L06", 2)], ["2. АҚБОЗ", Wt("L06", 3)], ["3. БІЗ", Wt("L06", 4)]].forEach(([w, tt], i) => { if (t > tt) s += `<text x="-250" y="${-70 + i * 110}" font-size="64" font-family="Montserrat" font-weight="900" fill="${i === 1 ? "#3f6fb5" : INK}" transform="scale(${f(1)})">${w}</text>`; });
      return g(540, 460, 0.95 * k, s, -3);
    },
    fx: () => ({ vig: 0.2, dof: 1.5 }),
  });

  // ================= 2. ӘКЕМНІҢ 3 ЕРЕЖЕСІ =================
  const RUL = S("L07") - 0.3, R1 = S("L08"), R2 = S("L09"), DOOR = Wt("L09", 3), MIRR = DOOR + 0.55, R3 = S("L10");
  MK.RUL = RUL; MK.R1 = R1; MK.R2 = R2; MK.DOOR = DOOR; MK.MIRR = MIRR; MK.R3 = R3;
  add(Object.assign(carBg("courtyard"), {
    t0: RUL, c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[RUL, { x: 0, y: -560, z: 1.45 }], [R1, { x: PAS + 60, y: -600, z: 2.1 }], [R2, { x: PAS + 40, y: -600, z: 2.0 }], [DOOR, { x: 60, y: -540, z: 1.6 }], [R3, { x: PAS + 50, y: -600, z: 2.2 }], [S("L11") - 0.3, { x: PAS + 50, y: -610, z: 2.35 }]],
    shake: (t) => (t > DOOR && t < DOOR + 0.2 ? 10 : t > MIRR && t < MIRR + 0.15 ? 5 : 0),
    actors: [
      ACT.dad({ x: PAS, y: 0, keys: [[0, ex("calm", { turn: 0.3 })], [R1, ex("calm", "fingerUp", { turn: 0.25 }), 0.2], [R2, ex("smug", "fingerUp", { turn: 0.25 }), 0.2], [MIRR + 0.1, ex("twitch", { turn: 0.25 }), 0.1], [R3, ex("calmSmile", { turn: 0.2, armR: { sh: 40, el: -110, hand: "open" } }), 0.3]], talk: ["L08", "L09", "L10"] }),
      ACT.artur({ x: DRV, y: 0, keys: [[0, ex("happy", "steer", { turn: -0.2 })], [DOOR, ex("shock", "steer", { squash: 0.95 }), 0.1], [MIRR + 0.1, ex("scared", "steer", { ...PO.lookR }), 0.2], [R3, ex("deadpan", "steer", { turn: -0.25, ...PO.lookL }), 0.3]] }),
    ],
    world: (t) => { let s = inCar(t, fresh(t, DOOR, 14), { mirrorR: t < MIRR }); if (t > MIRR) { const k = win(t, MIRR, MIRR + 0.6); s += g(515, -340 + 600 * k * k, 1, P("M-45,-20 L45,-40 L45,40 L-35,40Z", RB.CAR.body, 6), 120 * k); } return s; },
    over: (t) => (t > R1 && t < R2 - 0.1 ? g(540, 600, 0.9 * spring(win(t, R1, R1 + 0.5)), RB.radio(0, 0, 1, t)) : ""),
    type: (t) => TY.stamp(t, R1 + 0.2, "1. МАГНИТОЛА — ТИІСПЕ!", 540, 330, { size: 54, rot: -4, t1: R2 - 0.15 }) + TY.stamp(t, R2 + 0.2, "2. ЕСІК — АҚЫРЫН!", 540, 300, { size: 60, rot: 3, color: "#3f6fb5", t1: R3 - 0.15 }) + TY.pop(t, MIRR + 0.1, "ТЫҚ.", 900, 760, { size: 70, color: "#ffffff", t1: R3 - 0.2 }) + TY.stamp(t, R3 + 0.2, "3. АЙҚАЙ: 0", 540, 300, { size: 70, rot: -3, color: "#3f9f5a" }) + TY.pop(t, Wt("L10", 5), "ТЫНЫШ АДАМ", 540, 430, { size: 64, color: "#ffffff" }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  }));

  // ================= 3. БАЗАР АЛАҢЫ =================
  const LOT = S("L11") - 0.3;
  MK.LOT = LOT;
  add({
    t0: LOT, bg: "lot", c0: { x: 0, y: -400 }, flashIn: 0.2,
    cam: [[LOT, { x: 0, y: -700, z: 0.75 }], [S("L12") - 0.2, { x: 0, y: -420, z: 0.95 }]],
    world: (t) => { const k = win(t, LOT, LOT + 3.4); const x = lerp(-1300, 0, eout(k)); let s = RB.car6(x, 420, 0.6, { wheel: -x * 0.3, inside: inside() }); for (let i = 0; i < 5; i++) { const fl = t > LOT + 1.2 + i * 0.1; s += fl ? RB.pigeon(300 + i * 120 + (t - LOT - 1.2) * 500, 300 - (t - LOT - 1.2) * 600 - i * 30, 0.8, t, i) : RB.pigeon(300 + i * 120, 330 + (i % 2) * 40, 0.8, t, i); } return s; },
    type: (t) => TY.pop(t, LOT + 0.3, "ЖЕКСЕНБІ, 07:00", 540, 300, { size: 74, color: "#ffffff" }),
    fx: () => ({ vig: 0.2 }),
  });
  // педальдар
  const PED = S("L12") - 0.2;
  MK.PED = PED;
  add({
    t0: PED, bg: () => ({ far: RB.pedals([0, 0, 0]), mid: "", near: "" }), bgKey: "pedals", c0: { x: 0, y: -100 }, flashIn: 0.15, capTop: 1480,
    cam: [[PED, { x: 0, y: -100, z: 1.0 }], [S("L13") - 0.2, { x: 0, y: -60, z: 1.15 }]],
    world: (t) => { const k = t - PED; return sneaker(-200 + Math.sin(k * 3.1) * 230, -380 + Math.abs(Math.sin(k * 2.3)) * 60, Math.sin(k * 2) * 10) + sneaker(200 + Math.sin(k * 2.6 + 1) * 200, -400 + Math.abs(Math.sin(k * 2.9 + 1)) * 60, Math.sin(k * 2.4) * 10); },
    type: (t) => TY.pop(t, Wt("L12", 3), "3 ПЕДАЛЬ", 540, 300, { size: 96, color: "#f6d55c" }) + TY.pop(t, Wt("L12", 7), "2 АЯҚ", 540, 430, { size: 96, color: "#ff8a5b" }),
    fx: () => ({ vig: 0.3 }),
  });
  // 1-өшу
  const ST1 = E("L13") + 0.55;
  MK.CAR1 = S("L13") - 0.2; MK.ST1 = ST1;
  const jerk = (t, t0) => (t > t0 && t < t0 + 0.6 ? Math.sin((t - t0) * 30) * 22 * (1 - (t - t0) / 0.6) : 0);
  add(Object.assign(carBg("lot"), {
    t0: S("L13") - 0.2, c0: { x: 0, y: -560 },
    cam: [[S("L13") - 0.2, { x: 0, y: -560, z: 1.55 }], [ST1, { x: 0, y: -560, z: 1.7 }], [S("L14"), { x: PAS + 40, y: -600, z: 2.3 }], [S("L15") - 0.2, { x: PAS + 40, y: -600, z: 2.4 }]],
    shake: (t) => (t > ST1 && t < ST1 + 0.5 ? 16 : 0),
    actors: [
      ACT.dad({ x: PAS, y: 0, pos: (t) => ({ y: jerk(t, ST1) }), mod: (t, p) => { if (t > S("L13") && t < E("L13")) p.armR = { sh: 60, el: -50 + Math.sin(t * 4) * 20, hand: "open" }; return p; }, keys: [[0, ex("calmSmile", { turn: 0.3 })], [ST1, ex("shock", { turn: 0.3 }), 0.08], [S("L14") - 0.2, ex("calmSmile", { turn: 0.3 }), 0.4]], talk: ["L13", "L14"] }),
      ACT.artur({ x: DRV, y: 0, pos: (t) => ({ y: jerk(t, ST1 + 0.03) }), keys: [[0, ex("strain", "steer")], [ST1, ex("shock", "steer"), 0.08], [S("L14"), ex("nervous", "steer", { ...PO.lookL }), 0.3]] }),
    ],
    world: (t) => inCar(t, fresh(t, ST1, 30)),
    type: (t) => TY.pop(t, ST1, "ПЫХ!", 540, 330, { size: 120, color: "#9aa1ab", rot: -6, t1: S("L14") }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  }));
  // кенгуру (сырттан)
  const KNG = S("L15") - 0.2, HOPS = [E("L15") + 0.1, E("L15") + 0.62, E("L15") + 1.14];
  MK.KNG = KNG; MK.HOP1 = HOPS[0];
  const hopY = (t) => { let y = 0, r = 0; HOPS.forEach((h, i) => { const k = (t - h) / 0.45; if (k > 0 && k < 1) { y += Math.sin(k * Math.PI) * (150 + i * 40); r += Math.sin(k * Math.PI * 2) * (6 + i * 2); } }); return [y, r]; };
  add({
    t0: KNG, bg: "lot", c0: { x: 0, y: -400 },
    cam: [[KNG, { x: -200, y: -300, z: 1.0 }], [HOPS[0], { x: 60, y: -320, z: 1.05 }], [S("L16") - 0.1, { x: 260, y: -300, z: 1.0 }]],
    shake: (t) => HOPS.reduce((a, h) => a + (t > h + 0.4 && t < h + 0.6 ? 10 : 0), 0),
    world: (t) => { const [y, r] = hopY(t); const x = -300 + Math.max(0, Math.min(3, Math.floor((t - HOPS[0]) / 0.52) + (t > HOPS[0] ? 1 : 0))) * 160; return RB.car6(x, 420 - y, 0.6, { rot: -r, inside: inside(), bounce: 0 }) + puff(x - 300, 400, t, HOPS[0] + 0.3, 0.6, 6, "#c9cdd4") + puff(x - 300, 400, t, HOPS[2] + 0.3, 0.6, 6, "#c9cdd4"); },
    type: (t) => TY.pop(t, Wt("L15", 3), "КЕНГУРУ!", 540, 300, { size: 110, color: "#f2a541" }) + HOPS.map((h, i) => TY.pop(t, h + 0.15, String(i + 1), 300 + i * 240, 470, { size: 90, color: "#ffffff", t1: S("L16") })).join(""),
    fx: () => ({ vig: 0.2 }),
  });
  // «Ештеңе... етпейді» (бас төбеге соғылды)
  add(Object.assign(carBg("lot"), {
    t0: S("L16") - 0.1, c0: { x: 0, y: -560 },
    cam: [[S("L16") - 0.1, { x: PAS + 30, y: -640, z: 2.3 }], [S("L17") - 0.2, { x: PAS + 30, y: -630, z: 2.6 }]],
    actors: [ACT.dad({ x: PAS, y: 0, keys: [[0, ex("twitch", { turn: 0.15, headTilt: 6 })], [S("L16") + 0.8, ex("twitch", { turn: 0.15, headTilt: -4, shakeEyes: true }), 0.3]], talk: ["L16"] }),
      ACT.artur({ x: DRV, y: 0, keys: [[0, ex("scared", "steer", { ...PO.lookL })]] })],
    world: (t) => inCar(t, Math.sin(t * 9) * 35) + g(PAS + 30, -790, 1, RB.sparkle(0, 0, 40, "#f6d55c") + RB.sparkle(70, 30, 26, "#f6d55c")),
    type: (t) => TY.pop(t, S("L16") + 0.3, "ЕШТЕҢЕ... ЕТПЕЙДІ", 540, 300, { size: 64, color: "#ffffff" }),
    fx: () => ({ vig: 0.3, dof: 2 }),
  }));
  // 10 айналым, 5 км/сағ, әже озып кетті
  const LAP = S("L17") - 0.2, GR = S("L18") - 0.3, PASS = Wt("L18", 5);
  MK.LAP = LAP; MK.GR = GR; MK.PASS = PASS;
  add({
    t0: LAP, bg: "lot", c0: { x: 0, y: -400 }, flashIn: 0.15,
    cam: [[LAP, { x: 0, y: -380, z: 0.85 }], [GR, { x: -100, y: -360, z: 1.0 }], [PASS, { x: 120, y: -360, z: 1.05 }], [S("L19") - 0.2, { x: 220, y: -360, z: 1.0 }]],
    actors: [ACT.aje({ x: -1100, y: 420, s: 0.66, keys: [[0, { hide: true }], [GR, { hide: false, x: -1100, turn: 0.6, walk: 2.2, ...X.calm, armsLocked: true, armL: { sh: 14, el: -6, hand: "fist", prop: bagP }, armR: { sh: 14, el: -6, hand: "fist", prop: bagP } }], [GR + 0.05, { x: 900 }, S("L19") - GR, (k) => k], [PASS, ex("smug", { turn: 0.2 }), 0.3]] })],
    worldBack: (t) => { const x = -350 + (t - LAP) * 45; return RB.car6(x, 420, 0.6, { wheel: x * 0.4, inside: inside() }); },
    over: (t) => (t > Wt("L17", 7) - 0.2 && t < GR ? g(540, 640, 0.75 * spring(win(t, Wt("L17", 7) - 0.2, Wt("L17", 7) + 0.4)), RB.speedo(0, 0, 1, 5 + Math.sin(t * 3) * 1.5)) : ""),
    type: (t) => TY.pop(t, Wt("L17", 4), "× 10", 540, 230, { size: 110, color: "#f6d55c", t1: GR }) + TY.pop(t, Wt("L17", 8), "5 КМ/САҒ", 540, 360, { size: 84, color: "#ffffff", t1: GR }) + TY.stamp(t, PASS + 0.2, "ӘЖЕ: 1 — АҚБОЗ: 0", 540, 330, { size: 60, rot: -4 }),
    fx: () => ({ vig: 0.2 }),
  });
  // «Енді нағыз көшеге шығамыз» → ЕҢ ҮЛКЕН ҚАТЕЛІК
  const FRZ = Wt("L19", 4) + 0.45;
  MK.STREET = S("L19") - 0.2; MK.FRZ = FRZ;
  add(Object.assign(carBg("lot"), {
    t0: S("L19") - 0.2, c0: { x: 0, y: -560 }, freeze: FRZ,
    cam: [[S("L19") - 0.2, { x: 0, y: -560, z: 1.5 }], [FRZ, { x: PAS + 40, y: -600, z: 2.0 }], [FRZ + 0.15, { x: PAS + 40, y: -600, z: 2.3 }]],
    shake: (t) => (t > FRZ && t < FRZ + 0.3 ? 12 : 0),
    actors: [ACT.dad({ x: PAS, y: 0, keys: [[0, ex("calmSmile", { turn: 0.3 })], [Wt("L19", 1), ex("proud", "point", { turn: 0.3 }), 0.25]], talk: ["L19"] }),
      ACT.artur({ x: DRV, y: 0, keys: [[0, ex("tired", "steer")], [Wt("L19", 2), ex("shock", "steer", { ...PO.lookL }), 0.2]] })],
    world: (t) => inCar(t, fresh(t, S("L19"), 8)),
    type: (t) => TY.stamp(t, FRZ + 0.05, "ЕҢ ҮЛКЕН ҚАТЕЛІК", 540, 330, { size: 74, rot: -7 }),
    fx: (t) => K.freezeFx(t, FRZ, { vig: 0.25, dof: 2 }),
  }));

  // ================= 4. ӨР: бағдаршам, қарбыз көлігі =================
  const HILL = S("L20") - 0.3;
  MK.HILL = HILL;
  add({
    t0: HILL, bg: "hill", c0: { x: 0, y: -500 }, flashIn: 0.2,
    cam: [[HILL, { x: 760, y: -1000, z: 0.95 }], [Wt("L20", 4), { x: 360, y: -420, z: 0.85 }], [Wt("L20", 6), { x: -300, y: -120, z: 0.85 }], [S("L21") - 0.2, { x: -380, y: -80, z: 0.9 }]],
    world: (t) => busW() + truckW() + carOn(CAR_X0, { inside: inside() }) + lightW("r"),
    type: (t) => TY.pop(t, Wt("L20", 1), "ӨР", 300, 300, { size: 120, color: "#ffffff", rot: -15, t1: Wt("L20", 6) }) + TY.pop(t, Wt("L20", 7), "ҚАРБЫЗ!", 540, 330, { size: 110, color: "#3f9f5a", rot: -6 }),
    fx: () => ({ vig: 0.2 }),
  });
  // жасыл → 3-өшу
  const GRN = Wt("L21", 1), ST3 = Wt("L21", 4);
  MK.GRN = GRN; MK.ST3 = ST3;
  add({
    t0: S("L21") - 0.2, bg: "hill", c0: { x: 0, y: -500 },
    cam: [[S("L21") - 0.2, { x: LIGHT_X, y: -1250, z: 1.9 }], [GRN + 0.5, { x: LIGHT_X, y: -1240, z: 2.1 }]],
    world: (t) => lightW(t > GRN ? "g" : "r") + carOn(CAR_X0, { inside: inside() }),
    type: (t) => TY.pop(t, GRN, "ЖАСЫЛ!", 540, 330, { size: 110, color: "#4be07a" }),
    fx: () => ({ vig: 0.2, dof: 2 }),
  });
  add(Object.assign(carBg("hill"), {
    t0: GRN + 0.8, c0: { x: 0, y: -560 },
    cam: [[GRN + 0.8, { x: DRV - 30, y: -600, z: 2.2 }], [ST3, { x: 0, y: -560, z: 1.7 }], [S("L22") - 0.3, { x: 0, y: -560, z: 1.8 }]],
    shake: (t) => (t > ST3 && t < ST3 + 0.4 ? 12 : 0),
    actors: [ACT.dad({ x: PAS, y: 0, keys: [[0, ex("calmSmile", { turn: 0.3 })], [ST3 + 0.1, ex("deadpan", { turn: 0.3, ...PO.lookR }), 0.2]] }),
      ACT.artur({ x: DRV, y: 0, keys: [[0, ex("determined", "steer")], [ST3, ex("shock", "steer", { squash: 0.94 }), 0.08], [ST3 + 0.4, ex("scared", "steer", { shakeEyes: true }), 0.3]] })],
    world: (t) => inCar(t, t > ST3 ? ((t - ST3) * 720) % 360 * (t < ST3 + 1 ? 1 : 0) + (t > ST3 + 1 ? fresh(t, ST3 + 1, 20) : 0) : 0) + sweat(DRV - 40, -760, t, ST3, 3),
    type: (t) => TY.pop(t, ST3, "ПЫХ!", 540, 330, { size: 120, color: "#9aa1ab", rot: 6 }),
    fx: () => ({ vig: 0.3, dof: 2 }),
  }));
  // жүк көлігінің жүргізушісі: «Әй! Жүрсеңші!»
  const DRVR = S("L22") - 0.3, TX0 = 0;
  MK.DRVR = DRVR;
  add({
    t0: DRVR, bg: "hill", c0: { x: 0, y: -500 },
    cam: [[DRVR, { x: -20, y: -600, z: 1.6, r: ANG * 0.4 }], [E("L22"), { x: -40, y: -600, z: 1.9, r: ANG * 0.4 }], [S("L23") - 0.2, { x: -60, y: -590, z: 1.75, r: ANG * 0.4 }]],
    shake: (t) => (t > S("L22") && t < E("L22") + 0.3 ? 8 : 0),
    worldBack: () => `<g transform="rotate(${f(ANG)})">${RB.truck(TX0, 0, 1, {})}</g>`,
    actors: [ACT.driver({ x: 110, y: 20, keys: [[0, ex("angry", { turn: 0.4, armR: { sh: 150, el: 20, hand: "fist" } })]], talk: ["L22"], rot: ANG })],
    world: () => `<g transform="rotate(${f(ANG)})">${P("M-60,-460 L280,-460 L330,-420 L340,-200 L-60,-200Z", "#e8eef5", 7)}${R0()}</g>`,
    type: (t) => TY.pop(t, S("L22"), "БИИИП!", 300, 330, { size: 100, color: "#f6d55c", rot: -10 }) + TY.pop(t, Wt("L22", 1), "ЖҮРСЕҢШІ!", 640, 470, { size: 90, color: "#ff5b4b", rot: 6 }),
    fx: () => ({ vig: 0.25, dof: 2.5 }),
  });
  function R0() { return RR(300, -300, 60, 50, "#fff7b0", 4, 8); }
  // артқа жылжу
  const ROLL = S("L23") - 0.2, ROLL1 = S("L24") + 2.2;
  MK.ROLL = ROLL;
  const carX = (t) => lerp(CAR_X0, CAR_X0 - 130, sm(win(t, Wt("L23", 2), S("L24") - 0.2)));
  add({
    t0: ROLL, bg: "hill", c0: { x: 0, y: -400 },
    cam: [[ROLL, { x: -60, y: -260, z: 1.1 }], [S("L24") - 0.2, { x: -120, y: -230, z: 1.35 }]],
    world: (t) => { const x = carX(t); const gap = Math.max(0, (x - 440) - (TRK_X + 191)); return busW() + truckW() + carOn(x, { wheel: (x - CAR_X0) * 0.5, inside: inside() }) + `<path d="M${f(TRK_X + 200)},${f(roadY(TRK_X + 200) - 260)} L${f(x - 440)},${f(roadY(x - 440) - 260)}" stroke="#ff5b4b" stroke-width="8" stroke-dasharray="20 14"/>` + TX(f((x - 440 + TRK_X + 200) / 2), f(roadY((x - 440 + TRK_X + 200) / 2) - 300), (gap / 218).toFixed(1) + " м", 64, "#ff5b4b", ` stroke="${INK}" stroke-width="8" paint-order="stroke"`); },
    fx: () => ({ vig: 0.25 }),
  });
  // SLOW-MO: «Тежегішті бас!»
  const SLO = S("L24") - 0.2, SH2 = S("L25");
  MK.SLO = SLO; MK.SH2 = SH2;
  add(Object.assign(carBg("hill"), {
    t0: SLO, c0: { x: 0, y: -560 },
    cam: [[SLO, { x: 0, y: -560, z: 1.6 }], [SH2 - 0.2, { x: PAS + 60, y: -600, z: 2.4 }, (k) => sm(k)], [E("L25") + 0.3, { x: 0, y: -580, z: 2.0 }]],
    shake: (t) => (t > SH2 && t < E("L25") ? 8 : 0),
    actors: [
      ACT.dad({ x: PAS, y: 0, mod: (t, p) => { if (t > SLO && t < SH2) p.headTurn = lerp(0, 0.5, sm(win(t, SLO + 0.5, SH2))); return p; }, keys: [[0, ex("shock", { turn: 0.1, eye: { scale: 1.3, pupil: 0.45 } })], [SH2 - 0.05, ex("angry", { turn: 0.45, mouth: "shock", squash: 1.1, eye: { scale: 1.35, pupil: 0.45 } }), 0.4]], talk: ["L25"] }),
      ACT.artur({ x: DRV, y: 0, keys: [[0, ex("scared", "steer")], [SH2 + 0.1, ex("scared", "steer", { headTilt: -16, squash: 0.92, turn: -0.2 }), 0.5]] }),
    ],
    world: (t) => inCar(t, t > SH2 ? -62 + Math.sin(t * 9) * 6 : Math.sin(t * 2) * 10) + shout(PAS + 80, -560, 260, t, SH2, E("L25") + 0.2, 4),
    type: (t) => TY.pop(t, SLO + 0.4, "SLOW-MO", 540, 260, { size: 54, color: "#ffffff", t1: SH2 - 0.2 }) + TY.pop(t, SH2 + 0.1, "ТЕ-ЖЕ-ГІШ!!!", 540, 330, { size: 112, color: "#ff5b4b", wob: 3, from: 0.6 }),
    fx: () => ({ vig: 0.45, dof: 5, tint: "#9fc6ff", tintA: 0.12 }),
  }));
  // тежегіш → 1 см
  const STOMP = S("L26") + 0.05, CM = Wt("L26", 7);
  MK.STOMP = STOMP; MK.CM = CM;
  add({
    t0: S("L26") - 0.3, bg: () => ({ far: RB.pedals([0, 0, 0]), mid: "", near: "" }), bgKey: "pedals", c0: { x: 0, y: -100 }, capTop: 1480,
    cam: [[S("L26") - 0.3, { x: 0, y: -100, z: 1.2 }], [STOMP, { x: 0, y: -60, z: 1.35 }]],
    shake: (t) => (t > STOMP && t < STOMP + 0.4 ? 18 : 0),
    world: (t) => sneaker(-300, -420, -4) + sneaker(lerp(220, 0, eout(win(t, S("L26") - 0.3, STOMP))), lerp(-420, -150, eout(win(t, STOMP - 0.15, STOMP))), 0),
    type: (t) => TY.pop(t, STOMP, "ТЕЖЕГІШ!", 540, 330, { size: 110, color: "#ff5b4b" }),
    fx: () => ({ vig: 0.35 }),
  });
  add({
    t0: Wt("L26", 4), bg: "hill", c0: { x: 0, y: -300 },
    cam: [[Wt("L26", 4), { x: -460, y: -120, z: 1.5, r: ANG * 0.6 }], [CM, { x: -450, y: -130, z: 2.1, r: ANG * 0.6 }], [S("L27") - 0.3, { x: -450, y: -130, z: 2.25, r: ANG * 0.6 }]],
    world: (t) => truckW() + carOn(CAR_X1, { inside: inside() }) + (t > CM ? g(-448, -150, 1, RR(-110, -50, 220, 60, "#f6d55c", 5, 6) + Ln("M-90,-50 L-90,-28 M-60,-50 L-60,-36 M-30,-50 L-30,-28 M0,-50 L0,-36 M30,-50 L30,-28 M60,-50 L60,-36 M90,-50 L90,-28", 4)) : ""),
    type: (t) => TY.pop(t, CM, "1 СМ", 540, 330, { size: 140, color: "#f6d55c", wob: 3 }),
    fx: () => ({ vig: 0.3, dof: 3 }),
  });

  // ================= 5. ҚАРБЫЗ КӨШКІНІ =================
  const PHEW = S("L27") - 0.3, F1 = Wt("L27", 8), F2 = Wt("L28", 1), AV = Wt("L28", 4);
  MK.PHEW = PHEW; MK.F1 = F1; MK.F2 = F2; MK.AV = AV;
  add(Object.assign(carBg("hill"), {
    t0: PHEW, c0: { x: 0, y: -560 },
    cam: [[PHEW, { x: 0, y: -560, z: 1.6 }], [Wt("L27", 3), { x: 0, y: -560, z: 1.7 }]],
    actors: [ACT.dad({ x: PAS, y: 0, keys: [[0, ex("closed", { turn: 0.2, mouth: "oh" })]] }), ACT.artur({ x: DRV, y: 0, keys: [[0, ex("closed", "steer", { mouth: "oh" })]] })],
    world: (t) => inCar(t, 0) + puff(PAS, -480, t, Wt("L27", 1), 0.9, 5) + puff(DRV, -480, t, Wt("L27", 1) + 0.1, 0.9, 5),
    type: (t) => TY.pop(t, Wt("L27", 1), "ФУУХ...", 540, 330, { size: 100, color: "#ffffff" }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  }));
  // қарбыздар: launch уақыты
  const launch = (i) => (i === 24 ? F1 : i === 23 ? F2 : AV + (22 - i) * 0.07);
  const melonAt = (i, t) => {
    const tl = launch(i);
    const [x0, y0, r] = melW(i);
    if (t < tl) return null;
    const dt = t - tl, fall = 0.42;
    if (dt < fall) { const k = dt / fall; const x = x0 - 160 * k; return [x, lerp(y0, roadY(x) - r, k * k) - Math.sin(k * Math.PI) * 60, r, -k * 120]; }
    const xL = x0 - 160, v = 520 + hash(i * 7) * 380, d = (dt - fall) * v;
    const x = xL - d * CS;
    if (i % 4 === 1 || i === 24) return [x0 - 160, roadY(x0 - 160), r, 0, true]; // жарылды
    return [x, roadY(x) - r - Math.abs(Math.sin(dt * 9 + i)) * 26 * Math.exp(-dt), r, -120 - (d / r) * 57.3];
  };
  const drawMelons = (t) => { let s = ""; for (let i = 0; i < MEL.length; i++) { const m = melonAt(i, t); if (!m) continue; s += m[4] ? RB.wmelon(m[0], m[1] - m[2] * 0.5, m[2] * 1.5, 0, { smash: true }) : RB.wmelon(m[0], m[1] - m[2] * 0.5, m[2] * 1.5, m[3]); } return s; };
  const skipAt = (t) => { const a = []; for (let i = 0; i < MEL.length; i++) if (t >= launch(i)) a.push(i); return a; };
  add({
    t0: Wt("L27", 3), bg: "hill", c0: { x: 0, y: -300 },
    cam: [[Wt("L27", 3), { x: TRK_X - 40, y: -260, z: 1.7, r: ANG * 0.5 }], [F1 + 0.3, { x: TRK_X - 160, y: -170, z: 1.45, r: ANG * 0.5 }], [F2 + 0.4, { x: TRK_X - 260, y: -160, z: 1.2, r: ANG * 0.3 }], [AV, { x: TRK_X - 300, y: -200, z: 1.0 }], [AV + 3.2, { x: TRK_X - 1300, y: 60, z: 0.78 }, (k) => sm(k)], [S("L29") - 0.3, { x: TRK_X - 1450, y: 120, z: 0.75 }]],
    shake: (t) => (t > AV && t < AV + 3.5 ? 6 : 0),
    world: (t) => { const wob = t > Wt("L27", 4) && t < F1 ? Math.sin(t * 30) * 4 : 0; return busW() + truckW({ skip: skipAt(t) }).replace("<g transform", `<g data-w="${f(wob)}" transform`) + carOn(CAR_X1, { inside: inside(t > F1 ? "shout" : null) }) + drawMelons(t) + (t > AV + 0.6 ? B.crowdPerson(BUS_X - 500, roadY(BUS_X - 500) + 20 - Math.abs(Math.sin(t * 7)) * 90, 0.6, "#5a7fc4", 77, {}) : ""); },
    type: (t) => TY.pop(t, F1 + 0.42, "ТАРС!", 300, 330, { size: 100, color: "#ff5b6e", rot: -8, t1: AV - 0.2 }) + TY.pop(t, F2 + 0.42, "ТАРС!", 760, 420, { size: 100, color: "#ff5b6e", rot: 8, t1: AV }) + TY.pop(t, AV + 0.2, "СОСЫН — БӘРІ!", 540, 330, { size: 100, color: "#f6d55c", wob: 4 }),
    fx: () => ({ vig: 0.2 }),
  });
  // 150 мың
  const PAY = S("L29") - 0.3, MATH1 = Wt("L29", 7);
  MK.PAY = PAY; MK.MATH1 = MATH1;
  add({
    t0: PAY, bg: "hill", c0: { x: -300, y: -400 }, flashIn: 0.15,
    cam: [[PAY, { x: -330, y: -380, z: 1.25, r: ANG * 0.3 }], [S("L30") - 0.3, { x: -330, y: -380, z: 1.4, r: ANG * 0.3 }]],
    worldBack: () => { let s = truckW({ pile: 0.25 }); for (let i = 0; i < 6; i++) { const x = -900 + i * 210; s += RB.wmelon(x, roadY(x), 40, 0, { smash: true }); } return s; },
    actors: [
      ACT.dad({ x: -480, y: roadY(-480), keys: [[0, ex("deadpan", { turn: 0.45, armR: { sh: 70, el: -30, hand: "fist", prop: K.PROP.bill } })]] }),
      ACT.driver({ x: -160, y: roadY(-160), keys: [[0, ex("angry", "hips", { turn: -0.45 })], [MATH1, ex("smug", { turn: -0.45, armL: { sh: 70, el: -30, hand: "open" } }), 0.3]] }),
    ],
    world: (t) => { let s = ""; for (let i = 0; i < 8; i++) { const t0 = Wt("L29", 4) + i * 0.32; const k = win(t, t0, t0 + 0.4); if (k <= 0) continue; s += RB.money(lerp(-380, -220, k), -430 - Math.sin(k * Math.PI) * 120, 0.5, k * 200 + i * 20); } return s; },
    type: (t) => TY.pop(t, PAY + 0.6, "ҮНЕМДЕЛДІ: +150 000 ₸", 540, 280, { size: 56, color: "#7cc47a" }) + TY.pop(t, MATH1, "ҚАРБЫЗҒА: −150 000 ₸", 540, 380, { size: 56, color: "#ff5b4b" }) + TY.stamp(t, E("L29") + 0.3, "= 0 ₸", 540, 520, { size: 100, rot: -6 }),
    fx: () => ({ vig: 0.3, dof: 2 }),
  });
  // үйге: әкем рульде, үнсіз
  const NIGHT = S("L30") - 0.3, STROKE = Wt("L30", 9);
  MK.NIGHT = NIGHT;
  add(Object.assign(carBg("road", { night: true }), {
    t0: NIGHT, c0: { x: 0, y: -560 }, fadeIn: 0.5,
    cam: [[NIGHT, { x: 0, y: -560, z: 1.5 }], [STROKE, { x: DRV - 20, y: -560, z: 1.9 }], [S("L31") - 0.3, { x: DRV - 20, y: -560, z: 2.0 }]],
    actors: [
      ACT.artur({ x: PAS, y: 0, keys: [[0, ex("sad", { turn: 0.2, ...PO.lookD })]] }),
      ACT.dad({ x: DRV, y: 0, mod: (t, p) => { if (t > STROKE) p.armR = { sh: 50, el: -60 + Math.sin(t * 3) * 14, hand: "open" }; return p; }, keys: [[0, ex("deadpan", "steer", { turn: -0.1 })], [STROKE, ex("sad", "steer", { turn: -0.1, ...PO.lookD }), 0.4]] }),
    ],
    world: (t) => { const k = ((t - NIGHT) * 0.5) % 1; return `<rect x="-600" y="-1000" width="1200" height="800" fill="#ffd977" opacity="${f(0.18 * Math.max(0, Math.sin(k * Math.PI)))}"/>` + inCar(t, Math.sin(t * 1.3) * 6, { night: true, lights: true }) + (t > STROKE ? RB.heart(DRV - 20, -420, 0.5 * spring(win(t, STROKE, STROKE + 0.5)), "#ff6f91") : ""); },
    fx: () => ({ vig: 0.5, tint: "#3a4a8a", tintA: 0.25, bright: 0.9 }),
  }));

  // ================= 6. АНАМНЫҢ САБАҒЫ → КУӘЛІК → МАҚТАНЫШ =================
  const MOM = S("L31") - 0.3;
  MK.MOM = MOM;
  const ok = [Wt("L32", 0), Wt("L32", 2), Wt("L32", 3), Wt("L32", 5)];
  MK.OK = ok[0];
  add(Object.assign(carBg("road"), {
    t0: MOM, c0: { x: 0, y: -560 }, flashIn: 0.3,
    cam: [[MOM, { x: 0, y: -560, z: 1.45 }], [S("L32"), { x: PAS + 40, y: -580, z: 1.8 }], [ok[2], { x: 0, y: -560, z: 1.5 }], [S("L33") - 0.3, { x: 0, y: -560, z: 1.45 }]],
    actors: [
      ACT.mom({ x: PAS, y: 0, mod: (t, p) => { p.armL = { sh: 30, el: -70 + Math.sin(t * 10) * 6, hand: "fist", prop: K.PROP.needles }; return p; }, keys: [[0, ex("calmSmile", { turn: 0.2, ...PO.lookD })], [S("L32"), ex("warm", { turn: 0.3 }), 0.3]], talk: ["L32"] }),
      ACT.artur({ x: DRV, y: 0, keys: [[0, ex("determined", "steer")], [ok[1], ex("happy", "steer"), 0.3]] }),
    ],
    world: (t) => inCar(t, fresh(t, ok[2], 8), { wheelRot: t > ok[2] && t < ok[3] ? -25 : 0 }),
    over: (t) => ok.map((o, i) => (t > o ? check(200 + i * 230, 420, spring(win(t, o, o + 0.4)) * 1.2) : "")).join(""),
    fx: () => ({ vig: 0.2, dof: 2 }),
  }));
  const LIC = S("L33") - 0.3, LICP = Wt("L33", 4);
  MK.LIC = LIC; MK.LICP = LICP;
  add({
    t0: LIC, bg: "courtyard", c0: { x: 0, y: -600 }, flashIn: 0.2,
    cam: [[LIC, { x: 0, y: -560, z: 1.5 }], [S("L34") - 0.2, { x: 0, y: -600, z: 1.6 }]],
    actors: [ACT.artur({ x: -180, y: 0, keys: [[0, ex("happy", { turn: 0.3 })], [LICP, ex("proud", "cheer", { turn: 0.2 }), 0.25]] })],
    worldBack: () => RB.car6(250, 0, 0.55, {}),
    world: (t) => (t > LICP ? g(80, -980, 0.75 * spring(win(t, LICP, LICP + 0.7)), licence(0, 0, 1)) + stars(80, -980, 360, t, 5) : ""),
    type: (t) => TY.stamp(t, Wt("L33", 5), "1-РЕТТЕН!", 540, 330, { size: 92, rot: -5, color: "#3f9f5a" }),
    fx: () => ({ vig: 0.2, dof: 2 }),
  });
  const BRAG = S("L34") - 0.2, FLIP = Wt("L35", 4);
  MK.BRAG = BRAG; MK.FLIP = FLIP;
  add({
    t0: BRAG, bg: "kitchen", c0: { x: 0, y: -620 }, flashIn: 0.15,
    cam: [[BRAG, { x: 0, y: -620, z: 1.3 }], [S("L35"), { x: 0, y: -640, z: 1.45 }], [FLIP, { x: 180, y: -760, z: 1.6 }], [S("L36") - 0.4, { x: 120, y: -700, z: 1.5 }]],
    actors: [
      ACT.mom({ x: -270, y: 0, keys: [[0, ex("deadpan", { turn: 0.4, ...PO.lookR })], [Wt("L35", 3), ex("smug", { turn: 0.4, ...PO.lookR }), 0.3]] }),
      ACT.artur({ x: -20, y: 0, keys: [[0, ex("deadpan", { turn: 0.2, ...PO.lookL })], [Wt("L35", 3), ex("deadpan", { turn: 0.3, ...PO.lookR }), 0.3]] }),
      ACT.dad({ x: 280, y: 0, keys: [[0, ex("proud", "phoneEar", { turn: -0.2 })], [FLIP - 0.2, ex("calmSmile", { turn: -0.6, armL: { sh: 120, el: -20, hand: "open" } }), 0.2], [FLIP + 0.6, ex("proud", "phoneEar", { turn: -0.2 }), 0.3]], talk: ["L35"] }),
    ],
    world: (t) => note(230, -1090, t > FLIP ? "АЙҚАЙ: 0" : "АЙҚАЙ: 1", t > FLIP && t < FLIP + 0.3 ? 30 * Math.sin((t - FLIP) * 20) : -4),
    type: (t) => TY.pop(t, Wt("L35", 1), "«ӨЗІМ ҮЙРЕТТІМ!»", 540, 300, { size: 72, color: "#f6d55c", rot: -3 }),
    fx: () => ({ vig: 0.2, dof: 2 }),
  });

  // ================= 7. КЕҢЕС + СОҢЫ =================
  const HOST = S("L36") - 0.4, TIP1 = Wt("L36", 6), TIP2 = Wt("L36", 7), CTA = Wt("L37", 4), ROLLIN = E("L37") + 0.3, BUMP = ROLLIN + 0.9;
  const END = E("L37") + 3.0;
  MK.HOST = HOST; MK.TIP1 = TIP1; MK.TIP2 = TIP2; MK.CTA = CTA; MK.BUMP = BUMP; MK.END = END;
  add({
    t0: HOST, bg: "host", bgArgs: [["#cfe9ff", "#9cc9f0"]], bgKey: "hostBlue", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[HOST, { x: 0, y: -600, z: 2.0 }], [CTA, { x: 0, y: -600, z: 1.9 }], [ROLLIN, { x: 0, y: -500, z: 1.4 }], [END, { x: 0, y: -500, z: 1.45 }]],
    shake: (t) => (t > BUMP && t < BUMP + 0.3 ? 10 : 0),
    actors: [ACT.artur({ x: 0, y: 30, pos: (t) => ({ y: 30 - (t > BUMP ? Math.sin(Math.min(1, (t - BUMP) / 0.5) * Math.PI) * 160 : 0) }), keys: [[0, ex("happy")], [S("L36") + 0.3, ex("calm", "fingerUp"), 0.3], [TIP2, ex("smug", "stop"), 0.3], [CTA, ex("happy", "wave"), 0.3], [BUMP, ex("shock", "cheer", { squash: 1.08 }), 0.1], [BUMP + 0.6, ex("laugh", { turn: -0.3, ...PO.lookD }), 0.3]], talk: ["L36", "L37"] })],
    world: (t) => (t > ROLLIN ? RB.wmelon(lerp(-700, -150, eout(win(t, ROLLIN, BUMP))), -60, 70, (t - ROLLIN) * 360) : ""),
    type: (t) => TY.pop(t, TIP1, "КЕЛІС!", 540, 290, { size: 100, color: "#3f9f5a", t1: CTA - 0.2 }) + TY.pop(t, TIP2 + 0.2, "ҚАРБЫЗ ТИЕЛГЕН КӨЛІКТІҢ", 540, 420, { size: 54, color: "#ffffff", t1: CTA - 0.2 }) + TY.pop(t, TIP2 + 0.4, "АЛДЫНДА ТҰРМА!", 540, 500, { size: 70, color: "#ff5b4b", t1: CTA - 0.2 }) + TY.pop(t, CTA, "КОММЕНТАРИЙГЕ ЖАЗ!", 540, 330, { size: 66, color: "#f6d55c", t1: ROLLIN + 0.3 }) + TY.swing(t, BUMP + 0.4, "САУ БОЛЫҢДАР!", 540, 400, { size: 96, color: "#f6d55c" }),
    fx: () => ({ vig: 0.2 }),
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.SONGY_TOTAL = END + 0.2;

  // ---------- дыбыс ----------
  G.SONGY_AUDIO = (a) => {
    const { mus, fx, M } = a;
    mus("tension3", 0.1, M.SHOUT - 0.05, -17, { fi: 1.2, fo: 0.05 });
    fx("engineStart", 0, -22, { off: 1.2, dur: M.SHOUT, fo: 0.3 });
    fx("heartbeat", 2.5, -15, { dur: M.SHOUT - 2.5, fo: 0.2 });
    fx("carHorns", M.SHOUT - 0.6, -18, { dur: 0.8, fo: 0.3 });
    fx("dundun", M.FRZ0, -6);
    fx("whoosh", M.TITLE - 0.1, -9);
    fx("dombraHit", M.TITLE, -7);
    mus("theme2", M.TITLE, M.RUL + 0.4, -10, { fi: 0.05, fo: 0.8 });
    fx("thump", M.TITLE + 0.5, -10);
    fx("scratch", M.CROSS, -12, { dur: 0.6 });
    fx("coins", M.FREE, -11);
    fx("spray", M.AKB + 0.3, -18);
    fx("stamp", M.NAME, -10);
    fx("pops", Wt("L06", 2), -14); fx("pops", Wt("L06", 3), -13); fx("pops", Wt("L06", 4), -12);
    fx("gulp", M.KISS, -14);
    mus("montage3", M.RUL, M.STREET + 1.6, -13, { fi: 0.6, fo: 0.3 });
    fx("stamp", M.R1 + 0.2, -11); fx("stamp", M.R2 + 0.2, -11); fx("stamp", M.R3 + 0.2, -11);
    fx("doorSlam", M.DOOR - 0.05, -9);
    fx("drop", M.MIRR + 0.45, -8);
    fx("birds", M.LOT, -16, { dur: 4, fo: 1 });
    fx("flap", M.LOT + 1.2, -12);
    fx("engineStart", M.LOT + 0.2, -14);
    fx("stall", M.ST1 - 0.1, -8);
    fx("hop", M.HOP1 - 0.1, -7);
    fx("boing", M.HOP1 + 0.4, -15);
    fx("thud", S("L16") - 0.2, -10);
    fx("pops", M.PASS + 0.2, -12);
    fx("dundun", M.FRZ, -6);
    mus("tension2", M.HILL, M.SLO + 0.2, -13, { fi: 0.8, fo: 0.4 });
    fx("cityAmb", M.HILL, -20, { dur: M.SLO - M.HILL, fo: 0.5 });
    fx("ping", M.GRN, -10);
    fx("stall", M.ST3 - 0.1, -8);
    fx("horn", S("L22") - 0.25, -9);
    fx("carHorns", E("L22") + 0.1, -12);
    fx("creak", M.ROLL + 1.0, -12);
    mus("epic3", M.SLO, M.STOMP + 0.3, -10, { fi: 0.4, fo: 0.2 });
    fx("heartbeat", M.SLO, -12, { dur: M.STOMP - M.SLO });
    fx("brakeSqueal", M.STOMP - 0.05, -7);
    fx("thump", M.STOMP, -6);
    fx("drop", M.CM, -12);
    fx("melonCrack", M.F1 + 0.38, -7);
    fx("melonCrack", M.F2 + 0.38, -7);
    mus("chase3", M.AV - 0.1, M.PAY + 0.4, -12, { fi: 0.05, fo: 0.5 });
    fx("melonRoll", M.AV + 0.2, -6);
    fx("melonCrack", M.AV + 0.7, -9); fx("melonCrack", M.AV + 1.3, -10);
    fx("scream", M.AV + 1.2, -16);
    mus("western", M.PAY, M.MOM + 0.4, -14, { fi: 0.6, fo: 1.0 });
    fx("bills", Wt("L29", 4), -9);
    fx("stamp", E("L29") + 0.3, -10);
    fx("night", M.NIGHT, -22, { dur: M.MOM - M.NIGHT, fo: 0.4 });
    mus("warm", M.MOM, M.HOST + 0.4, -12, { fi: 0.8, fo: 0.8 });
    fx("ping", M.OK, -14);
    fx("shutter", M.LICP, -10);
    fx("cheer", M.LICP + 0.2, -16);
    fx("whoosh", M.FLIP - 0.1, -13);
    fx("whoosh", M.HOST - 0.1, -10);
    mus("outro3", M.HOST, a.TOTAL, -12, { fi: 0.6, fo: 2.0 });
    fx("pops", M.TIP1, -11); fx("pops", M.TIP2 + 0.3, -11);
    fx("boing", M.BUMP, -8);
    fx("dombraHit", M.BUMP + 0.45, -7);
  };
})(typeof window !== "undefined" ? window : globalThis);
