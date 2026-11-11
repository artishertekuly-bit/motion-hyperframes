/* «Тойдағы микрофон» (Reels 9:16, ~3:02) — кадрлар.
 * Ілмек → тақырып → үйде ескерту → той заңдары (3) → ет → сөз кезегі → 3 сәтсіз әрекет → slow-mo естелік → қол шапалақ → кеңес. */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RB = G.REELS_BG, K = G.REELS_KIT, A = G.AUYL_BG, RIG = G.ArturRig;
  const { S, E, TY, lerp, clamp, sm, eio, eout, spring, win, noise, hash } = Q;
  const { BG, P, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { Wt, POSES: PO, ACT, puff, speed, shout, notes, sweat, tears, confetti, stars, thought, rewind, law, hook, card, phoneBig } = K;
  const { g, TB, E: EL } = RB;
  const X = RIG.EXPR;
  const SH = [], MK = {};
  const add = (o) => SH.push(o);
  const ex = (...a) => Object.assign({}, ...a.map((k) => (typeof k === "string" ? X[k] || PO[k] || RIG.POSES[k] : k)));

  // ---------- көмекшілер ----------
  const spot = (x, k, y0) => (k <= 0 ? "" : `<path d="M${f(x - 140)},${f((y0 || -2600))} L${f(x + 140)},${f(y0 || -2600)} L${f(x + 420)},40 L${f(x - 420)},40Z" fill="#fff6c8" opacity="${f(0.17 * k)}"/><ellipse cx="${f(x)}" cy="30" rx="420" ry="70" fill="#fff6c8" opacity="${f(0.3 * k)}"/>`);
  const backs = (seed, y, s, n, gap, x0) => { let o = ""; for (let i = 0; i < n; i++) o += RB.guest((x0 || 0) + (i - (n - 1) / 2) * gap, y, s, seed + i * 11, 0); return o; };
  const veil = (x, y, s) => `<path d="M${f(x - 90 * s)},${f(y - 940 * s)} Q${f(x - 250 * s)},${f(y - 700 * s)} ${f(x - 210 * s)},${f(y - 300 * s)} L${f(x + 210 * s)},${f(y - 300 * s)} Q${f(x + 250 * s)},${f(y - 700 * s)} ${f(x + 90 * s)},${f(y - 940 * s)}Z" fill="#ffffff" opacity="0.7" stroke="${INK}" stroke-width="5"/>`;
  const tiara = (x, y, s) => P(`M${f(x - 60 * s)},${f(y - 945 * s)} L${f(x - 40 * s)},${f(y - 995 * s)} L${f(x - 14 * s)},${f(y - 961 * s)} L${f(x)},${f(y - 1011 * s)} L${f(x + 14 * s)},${f(y - 961 * s)} L${f(x + 40 * s)},${f(y - 995 * s)} L${f(x + 60 * s)},${f(y - 945 * s)}Z`, "#f2c14e", 4);
  const bride = (o) => { const a = ACT.bride(o); a.before = (t, st) => veil(st.x != null ? st.x : a.x || 0, st.y != null ? st.y : a.y || 0, a.s); a.after = (t, st) => tiara(st.x != null ? st.x : a.x || 0, st.y != null ? st.y : a.y || 0, a.s); return a; };
  const clockFace = (x, y, s, hh, mm) => g(x, y, s, C(0, 0, 150, "#ffffff", 9) + BG.clockHands(0, 0, (hh / 12) * 6.283, (mm / 60) * 6.283));
  const plane = (x, y, s) => g(x, y, s, P("M-90,0 L60,-14 Q100,-14 100,0 Q100,14 60,14Z", "#ffffff", 5) + P("M-10,-10 L-50,-70 L-20,-70 L30,-10Z M-10,10 L-50,70 L-20,70 L30,10Z M-80,-4 L-100,-36 L-84,-36 L-60,-6Z", "#5ab4e5", 4));
  const bones = (x, y, s) => g(x, y, s, EL(0, 0, 300, 80, "#f4f1ea", 7) + EL(0, -6, 250, 60, "#e8e2d4", 0) + P("M-140,-30 L60,-50 M-120,-50 L-150,-20 M50,-70 L80,-40", "none", 18).replace(`stroke="${INK}"`, `stroke="#fff8e8"`) + Ln("M-140,-30 L60,-50", 22, INK) + Ln("M-140,-30 L60,-50", 14, "#fff8e8") + C(-150, -30, 16, "#fff8e8", 5) + C(70, -52, 16, "#fff8e8", 5) + Ln("M90,10 L200,-20", 16, INK) + Ln("M90,10 L200,-20", 9, "#fff8e8"));
  const tumble = (x, y, r, rot) => g(x, y, 1, Ln(`M${-r},0 Q0,${-r} ${r},0 Q0,${r} ${-r * 0.6},${-r * 0.4} Q${r * 0.4},${-r} ${r * 0.7},${r * 0.5} Q${-r * 0.3},${r * 0.9} ${-r * 0.8},${-r * 0.2} M${-r * 0.3},${-r * 0.9} Q${r},${-r * 0.2} ${r * 0.1},${r}`, 7, "#a07a4a"), rot);
  const micIcon = (x, y, s) => g(x, y, s, RR(-50, -120, 100, 170, "#55565f", 8, 50) + Ln("M-30,-80 L30,-80 M-30,-40 L30,-40 M-30,0 L30,0", 5, "#3b3f4a") + Ln("M-80,20 Q-80,110 0,110 Q80,110 80,20 M0,110 L0,170 M-50,170 L50,170", 10));
  // үстел (жақын план) 190 жоғары: отырған кейіпкердің белінен төмен жабылады
  const TT = () => g(0, -190, 1, RB.tableTop());
  const crowdHall = (t, faceAt, o) => {
    // сахнадан қарағандағы зал: қатарлар (алыстан жақынға), faceAt(ri, i) → 0..1
    o = o || {};
    let s = "";
    const rows = [[-60, 0.5, 6, 560], [260, 0.66, 5, 680], [640, 0.86, 4, 820]];
    rows.forEach(([ry, sc, n, gap], ri) => {
      for (let i = 0; i < n; i++) {
        const tx = (i - (n - 1) / 2) * gap + (ri % 2) * gap * 0.22;
        for (const side of [-1, 1]) {
          const k = faceAt(ri, i * 2 + (side > 0 ? 1 : 0));
          const bob = o.bob ? Math.abs(Math.sin(t * 6 + i + ri)) * 20 * o.bob : 0;
          s += RB.guest(tx + side * 140 * sc, ry - 60 * sc - bob, sc, 300 + ri * 31 + i * 7 + (side > 0 ? 3 : 0), k > 0.5 ? 1 : 0, { wide: o.wide, mouth: o.mouth, cry: o.cry && (i + ri) % 3 === 0 });
        }
        s += RB.roundTable(tx, ry + 120 * sc, sc, { seed: ri * 5 + i, bowls: 4 });
      }
    });
    return s;
  };

  // ================= 0. ІЛМЕК =================
  const FB = E("L02") + 0.75, TITLE = FB + 0.85, RW = S("L03") + 1.15;
  MK.FB = FB; MK.TITLE = TITLE; MK.RW = RW;
  add({
    t0: 0, bg: "toiStage", c0: { x: 0, y: -620 }, fadeIn: 0.4, mbScale: 0.3,
    cam: [[0, { x: 0, y: -640, z: 2.9 }], [Wt("L01", 5), { x: 0, y: -560, z: 2.05 }], [Wt("L01", 6) + 0.25, { x: 30, y: -470, z: 2.35, r: -1 }], [Wt("L01", 9), { x: 0, y: -720, z: 2.2, r: 0 }], [S("L02") - 0.2, { x: 0, y: -620, z: 2.8 }], [FB, { x: 0, y: -620, z: 3.1 }], [TITLE, { x: 0, y: -620, z: 3.4 }]],
    shake: (t) => (t > FB ? 22 * (1 - win(t, FB, FB + 0.8)) : 0),
    worldBack: (t) => spot(0, 1),
    actors: [ACT.arturSuit({ x: 0, y: 30, keys: [[0, ex("nervous", "mic", { turn: -0.1, shakeEyes: true })], [S("L02") - 0.1, ex("nervous", "mic", { shakeEyes: false })], [FB, ex("strain", "mic", { squash: 0.9 }), 0.08], [FB + 0.3, ex("strain", "mic", { squash: 1.0 }), 0.3]], talk: ["L02"] })],
    world: (t) => sweat(-60, -760, t, 0.5, 2) + (t > Wt("L01", 9) - 0.2 && t < E("L02") + 0.3 ? thought(40, -1010, 380, 220, TB(40, -990, "СӘЛЕМ", 70, "#141418"), 20, -800).replace(/<g /, "<g ") : ""),
    nearWorld: (t) => backs(41, 820, 1.25, 5, 380),
    type: (t) => TY.pop(t, Wt("L01", 0), "400 АДАМ", 540, 300, { size: 110, color: "#f6d55c", t1: Wt("L01", 6) - 0.1 }) + TY.pop(t, Wt("L01", 6), "1 МИКРОФОН", 540, 300, { size: 92, color: "#ffffff", t1: Wt("L01", 8) - 0.1 }) + TY.pop(t, FB, "ЫЫЫЫЫ!!!", 540, 360, { size: 120, color: "#ff8a5b", rot: -8, wob: 4 }),
    fx: (t) => ({ vig: 0.35, dof: 3.5, nearBlur: 4 }),
  });
  // тақырып
  add({
    t0: TITLE, bg: (() => BG.toiHall({ tables: true, empty: true })), bgKey: "toiHallE", c0: { x: 0, y: -800 }, flashIn: 0.25,
    cam: [[TITLE, { x: 0, y: -900, z: 0.6 }], [RW, { x: 0, y: -820, z: 0.7 }], [RW + 0.7, { x: 0, y: -1000, z: 1.1 }]],
    actors: [ACT.arturSuit({ x: 0, y: -170, s: 0.5, keys: [[0, ex("strain", "mic")]] })],
    worldBack: () => spot(0, 1, -2600),
    world: (t) => crowdHall(t, () => 0, {}),
    over: (t) => g(540, 1000, 1, micIcon(0, 0, 1.4 * spring(win(t, TITLE + 0.4, TITLE + 1.3)))) + rewind(t, RW, RW + 0.7) + confetti(t, TITLE + 0.1, 50, 0, -200, 1080, 2200),
    type: (t) => (t < RW ? TY.swing(t, TITLE + 0.05, "ТОЙДАҒЫ", 540, 520, { size: 150, color: "#f6d55c" }) + TY.swing(t, TITLE + 0.4, "МИКРОФОН", 540, 700, { size: 150, color: "#ffffff" }) : ""),
    fx: (t) => ({ vig: 0.2 }),
  });
  // жұп (бір жыл бұрын)
  const CPL = RW + 0.6;
  MK.CPL = CPL;
  add({
    t0: CPL, bg: "toiStage", c0: { x: 0, y: -700 }, mbScale: 0.35,
    cam: [[CPL, { x: 0, y: -1150, z: 1.25 }], [S("L04") - 0.3, { x: 0, y: -640, z: 1.55 }]],
    actors: [ACT.groom({ x: -170, y: 20, keys: [[CPL, ex("happy", { turn: 0.25 })], [CPL + 0.4, ex("happy", "wave", { turn: 0.25 }), 0.3]] }), bride({ x: 170, y: 20, keys: [[CPL, ex("warm", { turn: -0.25 })], [CPL + 0.6, ex("happy", { turn: -0.3 }), 0.3]] })],
    world: (t) => confetti(t, CPL, 30, -500, -1400, 1000, 1800),
    type: (t) => TY.stamp(t, CPL + 0.25, "1 ЖЫЛ БҰРЫН", 540, 300, { size: 64, color: "#5a7fc4" }),
    fx: () => ({ vig: 0.2, dof: 2 }),
  });

  // ================= 1. ҮЙДЕ: анамның ескертуі =================
  const FRZ = S("L07") + 0.05;
  MK.HOME = S("L04") - 0.3; MK.FRZ = FRZ;
  const suitHanger = (x, y) => g(x, y, 1, Ln("M0,-60 L0,-20 M-120,40 L0,-20 L120,40", 8) + P("M-130,40 L130,40 L120,360 L-120,360Z", "#2f3a58", 6) + P("M-40,40 L0,140 L40,40Z", "#ffffff", 4) + P("M-8,60 L8,60 L14,200 L0,220 L-14,200Z", "#c23b4e", 3));
  add({
    t0: S("L04") - 0.3, bg: "kitchen", c0: { x: 0, y: -620 }, flashIn: 0.2, freeze: FRZ,
    cam: [[S("L04") - 0.3, { x: 0, y: -640, z: 1.35 }], [S("L05") - 0.1, { x: 230, y: -640, z: 1.9 }], [S("L06") - 0.1, { x: -230, y: -560, z: 2.0 }], [FRZ, { x: -200, y: -560, z: 2.2 }], [FRZ + 0.15, { x: -200, y: -580, z: 2.5 }]],
    shake: (t) => (t > FRZ && t < FRZ + 0.3 ? 14 : 0),
    actors: [
      ACT.artur({ x: -240, y: 40, keys: [[0, ex("calm", "phoneUp", "stand", { turn: 0.35, ...PO.lookD })], [S("L05") + 0.6, ex("deadpan", "phoneUp", "stand", { turn: 0.45, ...PO.lookR }), 0.3], [S("L06"), ex("laugh", "stand", { turn: 0.4, armR: { sh: 120, el: 30, hand: "open" }, armL: { sh: 64, el: 108, hand: "fist", propFront: B.PROPS.phone() } }), 0.2]], talk: ["L06"] }),
      ACT.mom({ x: 300, y: 0, mod: (t, p) => { if (t > S("L05") && t < E("L05")) p.armR = { sh: 70 + Math.sin(t * 9) * 8, el: -60, hand: "point" }; return p; },
        keys: [[0, ex("calm", { turn: -0.35, armL: { sh: 40, el: -90, hand: "fist" } })], [S("L05"), ex("angry", { turn: -0.4, fx: { vein: 0 } }), 0.2], [S("L06") + 0.3, ex("sad", { turn: -0.4 }), 0.3]], talk: ["L05"] }),
    ],
    world: (t) => BG.kitchenTable(-150, 0, 0.9),
    type: (t) => TY.stamp(t, S("L04") + 0.2, "1 КҮН БҰРЫН", 540, 300, { size: 60, color: "#5a7fc4", t1: S("L05") - 0.3 }) + TY.pop(t, Wt("L06", 6), "17 ЖАС", 300, 380, { size: 100, color: "#f6d55c", rot: -10, t1: FRZ - 0.05 }) + TY.stamp(t, Wt("L07", 4), "ЕҢ ҮЛКЕН ҚАТЕЛІК", 540, 420, { size: 74, rot: -7 }),
    fx: (t) => K.freezeFx(t, FRZ, { vig: 0.2, dof: 1.5 }),
  });

  // ================= 2. ТОЙ ЗАҢДАРЫ =================
  const LAWS = S("L08") - 0.35;
  MK.LAWS = LAWS;
  add({
    t0: LAWS, bg: "host", bgArgs: [["#d9534f", "#7a1f2b"]], bgKey: "hostRed", c0: { x: 0, y: -600 }, flashIn: 0.2,
    cam: [[LAWS, { x: 0, y: -600, z: 0.9, r: -3 }], [S("L09") - 0.2, { x: 0, y: -600, z: 1.08, r: 1 }]],
    world: (t) => { const k = spring(win(t, LAWS, LAWS + 0.8)); return g(0, -600, k, RB.ornBorder(-430, -560, 860, 1120, "#f2c14e", "#9e2a2b")); },
    type: (t) => TY.swing(t, LAWS + 0.3, "ҚАЗАҚ", 540, 760, { size: 120, color: "#f6d55c" }) + TY.swing(t, LAWS + 0.55, "ТОЙЫНЫҢ", 540, 920, { size: 120, color: "#ffffff" }) + TY.swing(t, LAWS + 0.8, "ЗАҢДАРЫ", 540, 1080, { size: 120, color: "#f6d55c" }),
    fx: () => ({ vig: 0.3 }), noCaps: true,
  });
  // 1-заң: шақыру
  const L1a = S("L09") - 0.2, CROSS = Wt("L09", 8);
  MK.CROSS = CROSS;
  add({
    t0: L1a, bg: "toiTable", c0: { x: 0, y: -620 }, flashIn: 0.15,
    cam: [[L1a, { x: 0, y: -560, z: 1.05, r: 2 }], [S("L10") - 0.2, { x: 0, y: -600, z: 1.25, r: -1 }]],
    shake: (t) => (t > CROSS && t < CROSS + 0.3 ? 10 : 0),
    world: (t) => RB.invite(0, -560, 1.1, { cross: eout(win(t, CROSS, CROSS + 0.25)) }) + (t > CROSS + 0.2 ? g(150, -380, 1, TB(0, 0, "21:00", 130, "#e85d75", ` transform="rotate(-12)"`)) : ""),
    type: (t) => law(t, L1a + 0.1, 1, "18:00 = 21:00", null, 260),
    fx: () => ({ vig: 0.25, dof: 4 }),
  });
  // бос зал: мен + мысық
  const L1b = S("L10") - 0.2, FILL = E("L10") + 0.1;
  MK.EMPTY = L1b; MK.FILL = FILL;
  add({
    t0: L1b, bg: (() => BG.toiHall({ tables: true, empty: true })), bgKey: "toiHallE", c0: { x: 0, y: -500 },
    cam: [[L1b, { x: 0, y: -700, z: 0.72 }], [Wt("L10", 5), { x: 60, y: -420, z: 1.3 }], [FILL, { x: 80, y: -430, z: 1.45 }], [S("L11") - 0.3, { x: 0, y: -600, z: 0.8 }]],
    actors: [ACT.arturSuit({ x: 0, y: 470, s: 0.66, keys: [[0, ex("calm", "stand", { turn: 0.15 })], [Wt("L10", 6), ex("deadpan", "stand", { turn: 0.4, ...PO.lookR }), 0.3]] })],
    world: (t) => {
      let s = RB.cat(230, 240, 0.8, { turn: t > Wt("L10", 9) ? 1 : 0 }) + RB.roundTable(60, 380, 0.85, { seed: 4 });
      // даяшылар (өтіп бара жатқан силуэттер)
      for (let i = 0; i < 2; i++) { const x = -1200 + ((t - L1b) * 420 + i * 1300) % 2600; s += B.crowdPerson(x, -40, 0.62, "#3b3f4a", 90 + i, {}) + RR(x - 90, -330, 180, 18, "#d7dbe2", 4, 8); }
      if (t > FILL) s += crowdHall(t, () => 0, {});
      return s;
    },
    over: (t) => { const k = win(t, FILL - 0.2, FILL + 0.6); const hh = 6 + 3 * k; return g(860, 330, 0.75, C(0, 0, 150, "#ffffff", 9) + BG.clockHands(0, 0, (hh / 12) * 6.283, k * 3 * 6.283)) + TY.pop(t, L1b + 0.3, k > 0.5 ? "21:00" : "18:00", 860, 520, { size: 64, color: "#ffffff", stroke: 10 }); },
    shake: (t) => (t > FILL && t < FILL + 0.4 ? 8 : 0),
    fx: () => ({ vig: 0.25 }),
  });
  // 2-заң: асаба бәрін біледі
  const L2 = S("L11") - 0.3, JAN = S("L12");
  MK.L2 = L2;
  const folderProp = `<g transform="translate(0,90) rotate(-90) scale(0.7)">${RB.folder(0, 0, 1, "ДОСЬЕ").replace(/^<g transform="[^"]*">/, "<g>")}</g>`;
  add({
    t0: L2, bg: "toiStage", c0: { x: 0, y: -640 }, flashIn: 0.15,
    cam: [[L2, { x: -220, y: -620, z: 2.1 }], [JAN, { x: -200, y: -600, z: 2.0 }], [Wt("L12", 4), { x: 0, y: -600, z: 1.45 }], [E("L12"), { x: 60, y: -600, z: 1.5 }]],
    actors: [
      ACT.asaba({ x: -230, y: 30, keys: [[0, ex("smug", "mic", { turn: -0.3, armL: { sh: 50, el: -70, hand: "fist", propFront: folderProp } })], [JAN, ex("happy", "mic", { turn: -0.25, armL: { sh: 60, el: -60, hand: "fist", propFront: folderProp } }), 0.2], [Wt("L12", 4), ex("laugh", "mic", { turn: 0.2, armL: { sh: 70, el: -50, hand: "fist", propFront: folderProp } }), 0.2]], talk: ["L12"] }),
      ACT.aunt1({ x: 900, y: 30, keys: [[0, { hide: true }], [JAN + 0.2, { hide: false, x: 760, turn: -0.6, walk: 2.2, ...X.happy }], [JAN + 0.25, { x: 260 }, 1.8, (k) => k], [JAN + 2.1, ex("shy", { turn: -0.3, walk: 0, x: 260 }), 0.3], [Wt("L12", 11), ex("shy", "facepalm", { turn: -0.2 }), 0.25]] }),
    ],
    worldBack: (t) => spot(-230, 1) + spot(260, win(t, JAN + 1.5, JAN + 2.2)),
    type: (t) => law(t, L2 + 0.1, 2, "АСАБА БӘРІН БІЛЕДІ", JAN + 0.6, 260) + TY.pop(t, Wt("L12", 4), "3 БАЛА", 300, 330, { size: 84, color: "#f6d55c", rot: -8 }) + TY.pop(t, Wt("L12", 7), "БУХГАЛТЕР", 700, 450, { size: 70, color: "#ffffff", rot: 6 }) + TY.pop(t, Wt("L12", 11), "ТҮРКИЯ", 420, 580, { size: 84, color: "#5ab4e5", rot: -4 }),
    over: (t) => (t > Wt("L12", 11) ? g(lerp(-150, 1250, win(t, Wt("L12", 11), Wt("L12", 11) + 2.2)), 700, 1.2, RB.E(0, 0, 0.1, 0.1, "none", 0) + `<g>${P("M-90,0 L60,-14 Q100,-14 100,0 Q100,14 60,14Z", "#ffffff", 5)}${P("M-10,-10 L-50,-70 L-20,-70 L30,-10Z M-10,10 L-50,70 L-20,70 L30,10Z", "#5ab4e5", 4)}</g>`) : ""),
    fx: () => ({ vig: 0.25, dof: 2.5 }),
  });
  // 3-заң: ет түн ортасында
  const L3 = S("L13") - 0.3, WAIT = S("L14");
  MK.L3 = L3;
  add({
    t0: L3, bg: "toiTable", c0: { x: 0, y: -560 }, flashIn: 0.15,
    cam: [[L3, { x: 0, y: -420, z: 0.95 }], [WAIT, { x: 0, y: -520, z: 1.15 }], [S("L15") - 0.2, { x: 0, y: -600, z: 1.5 }]],
    actors: [ACT.arturSuit({ x: 0, y: -40, keys: [[0, ex("calm", "stand", { turn: 0.1 })], [WAIT, ex("tired", "stand", { turn: 0.1, headTilt: -8 }), 0.6], [WAIT + 1.6, ex("sleepy", "stand", { headTilt: -16, headY: 20 }), 0.8]] })],
    world: (t) => RB.cat(560, -170, 0.8, { turn: 0 }) + TT(),
    over: (t) => { if (t < WAIT) return ""; const k = win(t, WAIT, E("L14")); return g(860, 330, 0.7, C(0, 0, 150, "#ffffff", 9) + BG.clockHands(0, 0, ((9 + 3 * k) / 12) * 6.283, k * 3 * 6.283)); },
    type: (t) => law(t, L3 + 0.1, 3, "ЕТ — ТҮН ОРТАСЫНДА", WAIT - 0.2, 260) + TY.pop(t, Wt("L13", 4), "9 САЛАТ", 300, 620, { size: 80, color: "#7cc47a", rot: -6, t1: WAIT - 0.1 }) + TY.pop(t, Wt("L14", 3), "3 САҒАТ", 540, 300, { size: 110, color: "#f6d55c" }),
    fx: () => ({ vig: 0.3, dof: 2.5 }),
  });

  // ================= 3. ЕТ КЕЛДІ → СӨЗ КЕЗЕГІ =================
  const MEAT = Wt("L15", 3), REACH = Wt("L15", 6);
  MK.MEAT = MEAT; MK.MIDN = S("L15") - 0.2;
  const platterAt = (t, y0) => A.platter(0, lerp(-1500, y0, eout(win(t, MEAT - 0.3, MEAT + 0.6))), 1.0);
  add({
    t0: S("L15") - 0.2, bg: "toiTable", c0: { x: 0, y: -560 },
    cam: [[S("L15") - 0.2, { x: 0, y: -620, z: 1.6 }], [MEAT, { x: 0, y: -400, z: 1.15 }], [REACH, { x: 60, y: -300, z: 1.3 }], [S("L16"), { x: 140, y: -260, z: 1.7 }]],
    actors: [ACT.arturSuit({ x: -60, y: -40, keys: [[0, ex("sleepy", "stand", { headTilt: -16, headY: 20 })], [MEAT + 0.1, ex("shock", "stand", { headTilt: 0, headY: 0, squash: 1.06 }), 0.12], [MEAT + 0.5, ex("happy", "stand", { eye: { scale: 1.2 } }), 0.3], [REACH, ex("happy", "stand", "reach", { turn: 0.3, lean: 6 }), 1.4]] })],
    world: (t) => TT() + platterAt(t, -130) + (t > MEAT ? RB.sparkle(-260, -120, 36) + RB.sparkle(250, -60, 28) + `<ellipse cx="0" cy="40" rx="420" ry="160" fill="#fff3c4" opacity="${f(0.3 * win(t, MEAT, MEAT + 0.4))}"/>` : ""),
    over: (t) => (t < MEAT ? g(860, 330, 0.7, C(0, 0, 150, "#ffffff", 9) + BG.clockHands(0, 0, 0, 0)) : ""),
    type: (t) => TY.pop(t, S("L15") + 0.1, "00:00", 540, 300, { size: 110, color: "#ffffff", t1: MEAT - 0.1 }) + TY.pop(t, MEAT, "ЕТ!", 540, 330, { size: 150, color: "#f6d55c", wob: 5 }),
    fx: () => ({ vig: 0.3, dof: 3 }),
  });
  // асаба: «...Артурға!»
  const CALL = Wt("L16", 9);
  MK.ASABA = S("L16"); MK.CALL = CALL;
  add({
    t0: S("L16"), bg: "toiStage", c0: { x: 0, y: -640 },
    cam: [[S("L16"), { x: -40, y: -640, z: 2.6, r: 2 }], [CALL - 0.2, { x: -30, y: -620, z: 2.1, r: -2 }], [CALL + 0.4, { x: 200, y: -600, z: 1.6, r: 0 }]],
    shake: (t) => (t > CALL && t < CALL + 0.5 ? 12 : 0),
    actors: [ACT.asaba({ x: -40, y: 30, keys: [[0, ex("laugh", "mic", { turn: -0.15 })], [CALL, ex("laugh", "mic", { turn: 0.3, armL: { sh: 90, el: 0, hand: "point" } }), 0.15]], talk: ["L16"] })],
    worldBack: (t) => spot(-40, 1) + (t > CALL ? `<path d="M-40,-2400 L40,-2400 L${f(lerp(200, 1600, win(t, CALL, CALL + 0.5)))},40 L${f(lerp(-100, 1100, win(t, CALL, CALL + 0.5)))},40Z" fill="#fff6c8" opacity="0.2"/>` : ""),
    type: (t) => TY.pop(t, Wt("L16", 7), "БОЛАШАҚ ДӘРІГЕР", 540, 330, { size: 74, color: "#ffffff", t1: CALL - 0.1 }) + TY.pop(t, CALL, "АРТУРҒА!", 540, 330, { size: 130, color: "#f6d55c", rot: -6, wob: 3 }),
    fx: () => ({ vig: 0.3, dof: 3 }),
  });
  // мен: қолым ауада қатып қалды
  const ME = E("L16") + 0.15;
  MK.ME = ME;
  add({
    t0: ME, bg: "toiTable", c0: { x: 0, y: -560 },
    cam: [[ME, { x: -40, y: -620, z: 1.75 }], [S("L17") + 1.2, { x: -40, y: -640, z: 1.9 }], [S("L18") - 0.2, { x: -40, y: -640, z: 2.0 }]],
    actors: [ACT.arturSuit({ x: -60, y: -40, keys: [[0, ex("shock", "stand", "reach", { turn: 0.3, lean: 6, shakeEyes: true })], [S("L17") + 0.5, ex("scared", "stand", "reach", { turn: 0.1 }), 0.3]] })],
    worldBack: () => spot(-60, 1),
    world: (t) => TT() + A.platter(0, -130, 1) + sweat(-100, -780, t, ME, 3) + (t > Wt("L17", 3) ? thought(-20, -960, 360, 210, g(-20, -960, 0.8, P("M-40,-60 Q0,-120 40,-60 Q60,-10 0,10 Q-60,-10 -40,-60Z", "#e85d75", 5) + g(30, 70, 0.16, RIG.draw(Object.assign({ look: "artur", outfit: "suit" }, X.sleepy, PO.closed, { lean: 80 }), { seed: 3, id: "faint" }))), -60, -800) : ""),
    type: (t) => TY.pop(t, S("L17"), "ДӘРІГЕР? ЖОҚ!", 540, 190, { size: 90, color: "#ff8a5b", rot: -5 }),
    fx: () => ({ vig: 0.35, dof: 3 }),
  });
  // 400 бас бұрылды
  const H0 = S("L18") - 0.2, R1 = Wt("L18", 0), R2 = Wt("L18", 2), R3 = Wt("L18", 4) - 0.1, CAT = Wt("L18", 5);
  MK.TURN = H0; MK.R1 = R1; MK.R2 = R2; MK.R3 = R3; MK.CAT = CAT;
  add({
    t0: H0, bg: (() => BG.toiHall({ tables: true, empty: true, back: true })), bgKey: "toiHallB", c0: { x: 0, y: -300 },
    cam: [[H0, { x: 0, y: -220, z: 0.82 }], [R3, { x: 0, y: -260, z: 0.95 }], [CAT, { x: 0, y: -280, z: 1.0 }]],
    shake: (t) => { let s = 0; for (const r of [R1, R2, R3]) if (t > r && t < r + 0.25) s += 6; return s; },
    world: (t) => crowdHall(t, (ri, i) => { const r0 = [R3, R2, R1][ri] + (hash(ri * 13 + i) - 0.5) * 0.25; return t > r0 ? 1 : 0; }, { wide: true }),
    type: (t) => TY.pop(t, R1, "400 БАС", 540, 300, { size: 120, color: "#f6d55c" }),
    fx: () => ({ vig: 0.3 }),
  });
  add({
    t0: CAT, bg: "toiTable", c0: { x: 0, y: -560 },
    cam: [[CAT, { x: 380, y: -330, z: 2.6 }], [S("L19") - 1.3, { x: 380, y: -330, z: 2.9 }]],
    world: (t) => RB.cat(430, -190, 1, { turn: t > CAT + 0.35 ? 1 : 0, wide: true }) + TT(),
    type: (t) => TY.pop(t, CAT + 0.4, "ТІПТІ МЫСЫҚ", 540, 320, { size: 84, color: "#f2a541" }),
    fx: () => ({ vig: 0.35, dof: 4 }),
  });

  // ================= 4. ҮШ ӘРЕКЕТ =================
  // 1) «Құрметті...» ×3
  const ST = S("L19") - 1.3, Q1 = Wt("L19", 0), Q2 = Wt("L19", 1), Q3 = Wt("L19", 2);
  MK.STAGE = ST; MK.Q1 = Q1; MK.Q2 = Q2; MK.Q3 = Q3;
  add({
    t0: ST, bg: "toiStage", c0: { x: 0, y: -640 },
    cam: [[ST, { x: 100, y: -560, z: 1.3 }], [Q1, { x: 0, y: -600, z: 1.6 }], [Q2, { x: 0, y: -620, z: 2.2 }], [Q3, { x: 0, y: -640, z: 3.0, r: 2 }], [S("L20") - 0.2, { x: 0, y: -640, z: 3.3 }]],
    shake: (t) => { let s = 0; [[Q1, 6], [Q2, 10], [Q3, 16]].forEach(([q, a]) => { if (t > q + 0.15 && t < q + 0.6) s += a; }); return s; },
    actors: [
      ACT.asaba({ x: 400, y: 30, keys: [[ST, ex("happy", { x: 400, turn: -0.5, armR: { sh: 80, el: -10, hand: "fist", prop: K.MIC } })], [ST + 0.7, ex("happy", { turn: 0.6, walk: 2.4, armR: { sh: 11, el: -7, hand: "rest", prop: "" } }), 0.2], [ST + 0.75, { x: 1300 }, 1.4, (k) => k]] }),
      ACT.arturSuit({ x: 0, y: 30, keys: [[ST, ex("nervous", { turn: 0.5, armR: { sh: 60, el: -20, hand: "open" } })], [ST + 0.7, ex("nervous", "mic", { turn: 0 }), 0.3], [Q1 + 0.2, ex("nervous", "mic", { squash: 0.96 }), 0.1], [Q2 + 0.2, ex("scared", "mic", { squash: 0.94 }), 0.1], [Q3 + 0.2, ex("strain", "mic", { squash: 0.9 }), 0.1]], talk: ["L19"] }),
    ],
    worldBack: () => spot(0, 1),
    world: (t) => sweat(-60, -770, t, Q2, 3) + shout(0, -560, 200, t, Q1 + 0.15, Q1 + 0.6) + shout(0, -560, 260, t, Q2 + 0.15, Q2 + 0.6) + shout(0, -560, 330, t, Q3 + 0.15, Q3 + 0.7, 4),
    type: (t) => TY.pop(t, Q1 + 0.15, "ЫЫЫ!", 260, 420, { size: 70, color: "#ff8a5b", rot: -10, t1: Q1 + 0.7 }) + TY.pop(t, Q2 + 0.15, "ЫЫЫЫ!", 800, 470, { size: 90, color: "#ff8a5b", rot: 8, t1: Q2 + 0.7 }) + TY.pop(t, Q3 + 0.15, "ЫЫЫЫЫ!!", 540, 330, { size: 120, color: "#ff5b4b", rot: -6, t1: Q3 + 0.8 }),
    fx: () => ({ vig: 0.35, dof: 3 }),
  });
  // басымдағы бос бөлме
  const DIVE = Wt("L20", 5);
  MK.DIVE = DIVE;
  add({
    t0: S("L20") - 0.2, bg: "toiStage", c0: { x: 0, y: -640 },
    cam: [[S("L20") - 0.2, { x: 0, y: -660, z: 3.0 }], [DIVE - 0.6, { x: 0, y: -700, z: 3.6 }], [DIVE, { x: 0, y: -720, z: 14 }, (k) => k * k * k]],
    actors: [ACT.arturSuit({ x: 0, y: 30, keys: [[0, ex("deadpan", "mic", { eye: { pupil: 0.5 } })]] })],
    worldBack: () => spot(0, 1),
    fx: (t) => ({ vig: 0.3, dof: 3, flash: win(t, DIVE - 0.15, DIVE) }),
  });
  add({
    t0: DIVE, bg: "headRoom", c0: { x: 0, y: -700 }, flashIn: 0.3,
    cam: [[DIVE, { x: 0, y: -800, z: 1.1 }], [S("L21") - 0.2, { x: 0, y: -760, z: 1.25 }]],
    world: (t) => { const k = win(t, DIVE, DIVE + 3.2); const fl = Math.sin(t * 40) > 0.3 || t < DIVE + 1.4; return tumble(lerp(-900, 900, k), -180 - Math.abs(Math.sin(k * 9)) * 140, 170, k * 900) + (fl ? `<circle cx="0" cy="-1180" r="${f(120)}" fill="#fff3b0" opacity="0.6"/>` : ""); },
    type: (t) => TY.pop(t, DIVE + 0.4, "...", 540, 700, { size: 160, color: "#9aa1ab" }) + TY.pop(t, DIVE + 0.9, "БОС", 540, 1050, { size: 140, color: "#3b3f4a", stroke: 0 }),
    fx: () => ({ vig: 0.2 }),
  });
  // 2) телефоннан тост
  const PH = S("L21") - 0.2, TYPE0 = Wt("L21", 3), RES = Wt("L21", 8);
  MK.PH = PH; MK.TYPE0 = TYPE0;
  const query = "тойға тост";
  add({
    t0: PH, bg: "toiStage", c0: { x: 0, y: -640 }, capTop: 1450,
    cam: [[PH, { x: 0, y: -600, z: 2.0 }], [S("L22"), { x: 0, y: -600, z: 2.1 }]],
    actors: [ACT.arturSuit({ x: 0, y: 30, keys: [[0, ex("nervous", "phoneUp", "mic", { ...PO.lookD })]] })],
    worldBack: () => spot(0, 1),
    over: (t) => {
      const k = spring(win(t, PH, PH + 0.7));
      const n = Math.floor(clamp((t - TYPE0) / 0.09, 0, query.length));
      let inner = RF(-410, -780, 820, 1560, "#ffffff") + RR(-360, -660, 720, 100, "#f1f3f6", 4, 50) + `<text x="-320" y="-592" font-size="56" font-family="Montserrat" font-weight="700" fill="${INK}">${query.slice(0, n)}${Math.floor(t * 3) % 2 ? "|" : ""}</text>`;
      if (t > RES) [["ЗЕЙНЕТКЕ ШЫҒАРЫП САЛУ", "ТОСТЫ — ҮЗДІК №1", "#e85d75"], ["ТУҒАН КҮНГЕ ТОСТ", "ӘЖЕГЕ, АТАҒА...", "#5a7fc4"], ["ҮЙЛЕНУ ТОЙЫНА", "ҚЫСҚА ТІЛЕКТЕР", "#5a7fc4"]].forEach(([a, b, c], i) => { inner += RR(-380, -500 + i * 250, 760, 220, i ? "#ffffff" : "#fff3f5", 4, 20) + `<text x="-350" y="${-420 + i * 250}" font-size="44" font-family="Montserrat" font-weight="800" fill="${c}">${a}</text><text x="-350" y="${-350 + i * 250}" font-size="40" font-family="Montserrat" font-weight="600" fill="#667">${b}</text>`; });
      if (t > RES + 0.6) inner += g(-200, -380, 1, P("M0,0 L0,70 L20,52 L34,84 L46,78 L32,48 L58,48Z", "#ffffff", 5));
      return `<rect width="1080" height="1920" fill="#0b0d16" opacity="${f(0.45 * k)}"/>` + g(540, 830, 0.7 * k, phoneBig(0, 0, 1, inner, { bg: "#ffffff" }));
    },
    fx: () => ({ vig: 0.3, dof: 5 }),
  });
  const READ = S("L22") - 0.1;
  MK.READ = READ;
  add({
    t0: READ, bg: "toiStage", c0: { x: 0, y: -640 },
    cam: [[READ, { x: 0, y: -600, z: 1.9 }], [Wt("L22", 5), { x: 0, y: -600, z: 1.7 }], [S("L23") - 0.2, { x: 0, y: -600, z: 1.6 }]],
    actors: [ACT.arturSuit({ x: 0, y: 30, keys: [[0, ex("calmSmile", "phoneUp", "mic", { ...PO.lookD })], [Wt("L22", 5), ex("happy", "phoneUp", "mic", { ...PO.lookD }), 0.3]], talk: ["L22"] })],
    worldBack: () => spot(0, 1),
    nearWorld: (t) => g(0, 0, 1, RB.guest(-330, 900, 1.3, 77, t > Wt("L22", 6) ? 1 : 0, { wide: true, mouth: "o", eyeX: 30 }) + RB.guest(330, 900, 1.3, 81, t > Wt("L22", 6) + 0.3 ? 1 : 0, { wide: true, mouth: "o", eyeX: -30 })),
    type: (t) => TY.pop(t, Wt("L22", 6), "?!", 540, 380, { size: 130, color: "#ff8a5b" }),
    fx: () => ({ vig: 0.3, dof: 2.5, nearBlur: 1.5 }),
  });
  add({
    t0: S("L23") - 0.2, bg: "toiStage", c0: { x: 0, y: -640 }, capTop: 1450,
    cam: [[S("L23") - 0.2, { x: 0, y: -620, z: 2.4 }], [S("L24") - 0.2, { x: 0, y: -640, z: 2.7 }]],
    actors: [ACT.arturSuit({ x: 0, y: 30, keys: [[0, ex("shock", "phoneUp", "mic", { ...PO.lookD })]] })],
    worldBack: () => spot(0, 1),
    world: (t) => sweat(-60, -770, t, S("L23"), 3),
    over: (t) => { const k = spring(win(t, S("L23") - 0.2, S("L23") + 0.5)); return `<rect width="1080" height="1920" fill="#0b0d16" opacity="${f(0.45 * k)}"/>` + g(540, 830, 0.7 * k, phoneBig(0, 0, 1, RF(-410, -780, 820, 1560, "#ffffff") + RR(-360, -500, 720, 260, "#fff3f5", 6, 20) + `<text x="0" y="-395" font-size="72" font-family="Montserrat" font-weight="900" fill="#e85d75" text-anchor="middle">ЗЕЙНЕТКЕ</text><text x="0" y="-300" font-size="60" font-family="Montserrat" font-weight="900" fill="#e85d75" text-anchor="middle">ШЫҒАРЫП САЛУ</text>` + `<rect x="-370" y="-510" width="740" height="280" fill="none" stroke="#e85d75" stroke-width="12" rx="24"/>`, { bg: "#ffffff" }), 4); },
    type: (t) => TY.stamp(t, Wt("L23", 2), "ЗЕЙНЕТКЕ?!", 540, 300, { size: 90, rot: -6 }),
    fx: () => ({ vig: 0.3, dof: 5 }),
  });
  // 3) апалар: «Әнмен айт!»
  const AUN = S("L24") - 0.2;
  MK.AUN = AUN;
  add({
    t0: AUN, bg: "toiTable", c0: { x: 0, y: -560 },
    cam: [[AUN, { x: 0, y: -520, z: 1.05 }], [S("L25"), { x: 0, y: -560, z: 1.35, r: -2 }], [S("L26") - 0.2, { x: 0, y: -560, z: 1.5, r: 1 }]],
    shake: (t) => (t > S("L25") && t < E("L25") ? 5 : 0),
    actors: [
      ACT.aunt1({ x: -300, y: -40, keys: [[0, ex("calm", "stand", { turn: 0.3 })], [S("L25") - 0.1, ex("laugh", { turn: 0.1, armR: { sh: 150, el: 10, hand: "open", prop: PO.armsDown ? K.PROP.tissue : "" } }), 0.15]], talk: ["L25"] }),
      ACT.aunt2({ x: 0, y: -40, keys: [[0, ex("happy", "stand", { turn: 0 })], [S("L25") - 0.05, ex("laugh", "cheer"), 0.15]], talk: ["L25"] }),
      ACT.aunt3({ x: 300, y: -40, keys: [[0, ex("calm", "stand", { turn: -0.3 })], [S("L25"), ex("laugh", { turn: -0.1, armL: { sh: 150, el: 10, hand: "open" } }), 0.15]], talk: ["L25"] }),
    ],
    mod: null,
    world: (t) => TT() + notes(-400, -900, t, S("L25"), E("L25") + 1) + notes(300, -950, t, S("L25") + 0.3, E("L25") + 1),
    type: (t) => TY.pop(t, S("L25"), "ӘНМЕН АЙТ!", 540, 330, { size: 110, color: "#f6d55c", wob: 4, rot: -4 }),
    fx: () => ({ vig: 0.25, dof: 2.5 }),
  });
  // синтезатор → мұз
  const SYN = S("L26") - 0.2, ICE = Wt("L26", 4);
  MK.SYN = SYN; MK.ICE = ICE;
  add({
    t0: SYN, bg: "toiStage", c0: { x: 0, y: -640 },
    cam: [[SYN, { x: 820, y: -560, z: 1.7 }], [Wt("L26", 1), { x: 760, y: -560, z: 1.6 }], [ICE - 0.05, { x: 0, y: -580, z: 1.6 }, eio], [S("L27") - 0.3, { x: 0, y: -600, z: 1.8 }]], mbScale: 0.4,
    shake: (t) => (t > ICE + 0.3 && t < ICE + 0.6 ? 8 : 0),
    actors: [
      Object.assign(B.crowdPerson ? { look: "dad", outfit: "teen", s: 0.75, seed: 71 } : {}, { x: 900, y: 30, mod: (t, p) => { p.armL = { sh: 40, el: -60 + Math.sin(t * 14) * 10, hand: "open" }; p.armR = { sh: 40, el: -60 + Math.cos(t * 13) * 10, hand: "open" }; return p; }, keys: [[0, ex("happy", { turn: -0.2, headTilt: 6 })]] }),
      ACT.arturSuit({ x: 0, y: 30, keys: [[0, ex("nervous", "mic")], [ICE, ex("scared", "mic", { eye: { pupil: 0.4 } }), 0.2]], blink: false }),
    ],
    worldBack: () => spot(0, 1),
    world: (t) => RB.synth(900, 50, 1.0) + notes(700, -820, t, SYN, S("L27")) + RB.ice(0, 40, 520, 860, eout(win(t, ICE, ICE + 0.5))),
    type: (t) => TY.pop(t, ICE + 0.3, "ҚАТЫП ҚАЛДЫМ", 540, 330, { size: 82, color: "#bfe8ff" }),
    fx: () => ({ vig: 0.3, dof: 2.5 }),
  });

  // ================= 5. SLOW-MO: ағама қарадым → естелік → тост =================
  const SLOW = S("L27") - 0.3;
  MK.SLOW = SLOW;
  add({
    t0: SLOW, bg: "toiStage", c0: { x: 300, y: -640 },
    cam: [[SLOW, { x: 0, y: -620, z: 2.2 }], [Wt("L27", 2), { x: 400, y: -620, z: 1.4 }, (k) => sm(k)], [S("L28") - 0.4, { x: 820, y: -600, z: 2.2 }]],
    actors: [
      ACT.arturSuit({ x: 0, y: 30, keys: [[0, ex("calm", "mic", { turn: 0.4 })], [Wt("L27", 3), ex("warm", "mic", { turn: 0.55 }), 1.0]] }),
      ACT.groom({ x: 820, y: 30, keys: [[0, ex("warm", { turn: -0.45 })], [Wt("L27", 2) + 0.6, ex("happy", { turn: -0.45, headTilt: 8, headY: 8 }), 0.6]] }),
      bride({ x: 1080, y: 30, keys: [[0, ex("warm", { turn: -0.4 })]] }),
    ],
    worldBack: (t) => spot(0, 1) + spot(900, 0.7),
    world: (t) => { const k = win(t, SLOW, SLOW + 2.5); return RB.ice(0, 40, 520, 860, 1 - k) + (t > Wt("L27", 5) ? card(820, -960, 360, 240, -5, g(0, 50, 0.1, BG.bazaar().far) + g(0, 100, 0.22, RIG.draw(Object.assign({ look: "kid", outfit: "tee" }, X.sad), { seed: 9, id: "memk" })), { s: spring(win(t, Wt("L27", 5), Wt("L27", 5) + 0.8)) * 0.9 }) : ""); },
    fx: () => ({ vig: 0.45, dof: 5, tint: "#ffd9a8", tintA: 0.12 }),
  });
  // естелік: базар (сепия)
  const MEM = S("L28") - 0.2, LIFT = Wt("L28", 10);
  MK.MEM = MEM; MK.LIFT = LIFT;
  add({
    t0: MEM, bg: "bazaar", c0: { x: 0, y: -600 }, flashIn: 0.4,
    cam: [[MEM, { x: -60, y: -420, z: 1.6 }], [Wt("L28", 5), { x: 120, y: -520, z: 1.45 }], [LIFT, { x: 160, y: -780, z: 1.35 }], [S("L29") - 0.2, { x: 160, y: -820, z: 1.3 }]],
    actors: [
      ACT.kid({ x: 60, y: 40, pos: (t) => (t > LIFT ? { x: lerp(60, 260, eout(win(t, LIFT, LIFT + 0.6))), y: lerp(40, -510, eout(win(t, LIFT, LIFT + 0.6))) } : {}),
        keys: [[0, ex("sad", { turn: 0.2 })], [Wt("L28", 6), ex("shock", { turn: 0.4 }), 0.2], [LIFT, ex("laugh", "sitFloor", "cheer", { turn: 0 }), 0.3]] }),
      ACT.teen({ x: 900, y: 40, keys: [[0, ex("calm", { x: 900, turn: -0.6, walk: 2, ...PO.lookL })], [MEM + 0.1, { x: 260 }, Wt("L28", 6) - MEM - 0.1, (k) => sm(k)], [Wt("L28", 6), ex("warm", { walk: 0, turn: -0.3, armL: { sh: 70, el: -20, hand: "open" }, armR: { sh: 70, el: -20, hand: "open" } }), 0.3], [LIFT + 0.4, ex("happy", { turn: 0, armL: { sh: 160, el: 20, hand: "fist" }, armR: { sh: 160, el: 20, hand: "fist" } }), 0.3]] }),
    ],
    world: (t) => (t < Wt("L28", 6) ? tears(60, -480, t, 2) : ""),
    type: (t) => TY.pop(t, MEM + 0.3, "5 ЖАС", 540, 300, { size: 100, color: "#fff3d6", t1: Wt("L28", 6) }),
    fx: () => ({ sepia: 0.75, grain: 0.35, vig: 0.55 }),
  });
  // тост: «...қолын ешқашан жібермеңіз»
  const TOAST = S("L29") - 0.2, HAND = Wt("L29", 2);
  MK.TOAST = TOAST;
  add({
    t0: TOAST, bg: "toiStage", c0: { x: 300, y: -640 }, flashIn: 0.3,
    cam: [[TOAST, { x: 0, y: -600, z: 2.3 }], [HAND - 0.2, { x: 0, y: -600, z: 2.1 }], [HAND + 0.5, { x: 940, y: -560, z: 1.9 }, eio], [S("L30") - 0.3, { x: 940, y: -560, z: 2.1 }]],
    actors: [
      ACT.arturSuit({ x: 0, y: 30, keys: [[0, ex("warm", "mic", { turn: 0.2 })]], talk: ["L29"] }),
      ACT.groom({ x: 820, y: 30, keys: [[0, ex("warm", { turn: 0.2 })], [HAND + 0.3, ex("happy", { turn: 0.35, armL: { sh: 50, el: -20, hand: "open" } }), 0.4]] }),
      bride({ x: 1060, y: 30, keys: [[0, ex("warm", { turn: -0.2 })], [HAND + 0.4, ex("happy", { turn: -0.35, armR: { sh: 50, el: -20, hand: "open" } }), 0.4]] }),
    ],
    worldBack: () => spot(0, 1) + spot(940, 0.8),
    world: (t) => (t > HAND + 0.6 ? RB.heart(940, -1020, spring(win(t, HAND + 0.6, HAND + 1.4)) * 1.4, "#ff6f91") + tears(1060, -620, t, 1) : ""),
    fx: () => ({ vig: 0.4, dof: 4, tint: "#ffd9a8", tintA: 0.1 }),
  });

  // ================= 6. ТЫНЫШТЫҚ → ҚОЛ ШАПАЛАҚ =================
  const SIL = S("L30") - 0.3, FORK = Wt("L30", 3);
  MK.SIL = SIL; MK.FORK = FORK;
  add({
    t0: SIL, bg: (() => BG.toiHall({ tables: true, empty: true, back: true })), bgKey: "toiHallB", c0: { x: 0, y: -300 }, still: true,
    cam: [[SIL, { x: 0, y: -260, z: 0.86 }], [S("L31"), { x: 0, y: -260, z: 0.9 }]],
    world: (t) => crowdHall(t, () => 1, { wide: false }) + (t > FORK ? `<g transform="translate(300,${f(lerp(300, 520, eout(win(t, FORK, FORK + 0.3))))}) rotate(${f(win(t, FORK, FORK + 0.3) * 160)})">${RR(-8, -60, 16, 120, "#d7dbe2", 4, 4)}</g>` : ""),
    type: (t) => TY.pop(t, Wt("L30", 4), "«БІТТІ...»", 540, 300, { size: 90, color: "#9aa1ab" }),
    fx: () => ({ vig: 0.45, sat: 0.7 }),
  });
  const BOOM = S("L31") - 0.1, CLAP = Wt("L31", 7);
  MK.BOOM = BOOM; MK.CLAP = CLAP;
  add({
    t0: BOOM, bg: "toiStage", c0: { x: 0, y: -640 }, flashIn: 0.2,
    cam: [[BOOM, { x: -200, y: -620, z: 2.2, r: -3 }], [Wt("L31", 1), { x: -100, y: -600, z: 1.5, r: 2 }], [CLAP, { x: 0, y: -620, z: 1.2 }], [S("L32") - 0.3, { x: 0, y: -640, z: 1.15 }]],
    shake: (t) => (t > BOOM && t < BOOM + 0.5 ? 14 : t > CLAP && t < CLAP + 0.6 ? 8 : 0),
    actors: [
      ACT.asaba({ x: -330, y: 30, keys: [[0, ex("laugh", "mic", { turn: 0.3, armL: { sh: 160, el: 10, hand: "open" } })], [CLAP, ex("laugh", "cheer", { turn: 0.2 }), 0.2]], talk: ["L31"] }),
      ACT.arturSuit({ x: 60, y: 30, keys: [[0, ex("shock", "mic", { turn: -0.3 })], [Wt("L31", 3), ex("shy", "mic", { turn: 0 }), 0.3]] }),
    ],
    worldBack: () => spot(0, 1),
    world: (t) => confetti(t, CLAP - 0.2, 70, -700, -1800, 1400, 2400),
    nearWorld: (t) => { let s = ""; for (let i = 0; i < 5; i++) { const up = t > CLAP ? Math.abs(Math.sin(t * 9 + i)) * 40 : 0; s += RB.guest((i - 2) * 380, 900 - up, 1.25, 51 + i * 9, 0); } return s; },
    type: (t) => TY.pop(t, BOOM, "МІНЕ!", 540, 560, { size: 140, color: "#f6d55c", rot: -6 }) + TY.pop(t, CLAP, "ҚОЛ ШАПАЛАҚ!", 540, 560, { size: 96, color: "#ffffff", wob: 4 }),
    fx: () => ({ vig: 0.25, dof: 2.5, nearBlur: 2 }),
  });
  // иыққа көтерді
  const UP = S("L32") - 0.3, LIFT2 = Wt("L32", 4);
  MK.UP = UP; MK.LIFT2 = LIFT2;
  add({
    t0: UP, bg: "toiStage", c0: { x: 0, y: -800 },
    cam: [[UP, { x: 0, y: -560, z: 1.4 }], [LIFT2, { x: 0, y: -700, z: 1.2 }], [S("L33") - 0.3, { x: 0, y: -900, z: 1.25 }]],
    actors: [
      ACT.arturSuit({ x: -80, y: 30, pos: (t) => (t > LIFT2 - 0.2 ? { x: lerp(-80, 160, eout(win(t, LIFT2 - 0.2, LIFT2 + 0.4))), y: lerp(30, -430, eout(win(t, LIFT2 - 0.2, LIFT2 + 0.4))) } : {}),
        keys: [[0, ex("shy", { turn: 0.3 })], [LIFT2 - 0.1, ex("shock", { turn: 0 }), 0.15], [LIFT2 + 0.4, ex("laugh", "sitFloor", "cheer"), 0.3]] }),
      ACT.groom({ x: 160, y: 30, keys: [[0, ex("happy", { turn: -0.4, armL: { sh: 70, el: -30, hand: "open" }, armR: { sh: 70, el: -30, hand: "open" } })], [LIFT2, ex("laugh", { turn: 0, armL: { sh: 165, el: 15, hand: "fist" }, armR: { sh: 165, el: 15, hand: "fist" } }), 0.4]] }),
    ],
    worldBack: () => spot(60, 1),
    world: (t) => confetti(t, UP - 1, 60, -700, -2200, 1400, 2600) + (t > LIFT2 + 0.4 ? stars(160, -1460, 140, t, 4) : ""),
    type: (t) => TY.pop(t, LIFT2 + 0.3, "5 ЖАСТАҒЫДАЙ", 540, 300, { size: 84, color: "#f6d55c" }),
    fx: () => ({ vig: 0.25, dof: 2 }),
  });
  // ет таусылыпты
  const BONE = S("L33") - 0.3;
  MK.BONE = BONE;
  add({
    t0: BONE, bg: "toiTable", c0: { x: 0, y: -560 },
    cam: [[BONE, { x: 0, y: -420, z: 1.3 }], [Wt("L33", 4), { x: 120, y: -300, z: 1.7 }], [S("L34") - 0.3, { x: 200, y: -300, z: 1.85 }]],
    actors: [ACT.arturSuit({ x: -80, y: -40, keys: [[0, ex("happy", "stand", { turn: 0.2 })], [Wt("L33", 4), ex("sad", "stand", { turn: 0.2, ...PO.lookD }), 0.3]] })],
    world: (t) => RB.cat(300, -180, 0.9, { turn: 1, tongue: Math.sin(t * 8) > 0 }) + TT() + bones(0, -130, 1),
    type: (t) => TY.stamp(t, Wt("L33", 4), "ЕТ: 0", 540, 320, { size: 90, rot: -6 }),
    fx: () => ({ vig: 0.3, dof: 3 }),
  });

  // ================= 7. КЕЛЕСІ ТОЙ → ҮШ АПА =================
  const NEXT = S("L34") - 0.3, SNAP = Wt("L34", 3);
  MK.NEXT = NEXT; MK.SNAP = SNAP;
  add({
    t0: NEXT, bg: "toiStage", c0: { x: 0, y: -640 },
    cam: [[NEXT, { x: -200, y: -600, z: 2.0 }], [SNAP - 0.1, { x: -150, y: -600, z: 1.8 }], [SNAP + 0.3, { x: 360, y: -560, z: 2.1 }, eout], [S("L35") - 0.2, { x: 380, y: -560, z: 2.3 }]],
    shake: (t) => (t > SNAP + 0.3 && t < SNAP + 0.6 ? 10 : 0),
    actors: [
      ACT.asaba({ x: -230, y: 30, keys: [[0, ex("laugh", "mic", { turn: 0.3 })], [SNAP, ex("laugh", "mic", { turn: 0.4, armL: { sh: 90, el: 0, hand: "point" } }), 0.2]], talk: ["L34"] }),
      ACT.arturSuit({ x: 380, y: 30, keys: [[0, ex("happy", { turn: -0.2 })], [SNAP + 0.3, ex("shock", { turn: 0, squash: 1.06 }), 0.12]] }),
    ],
    worldBack: (t) => spot(-230, 1) + spot(380, win(t, SNAP, SNAP + 0.3)),
    type: (t) => TY.pop(t, SNAP + 0.2, "КЕЛЕСІ ТОЙ — СЕНІКІ!", 540, 330, { size: 70, color: "#f6d55c", rot: -4 }),
    fx: () => ({ vig: 0.3, dof: 3 }),
  });
  const AP0 = S("L35") - 0.2, A1 = Wt("L35", 3), A2 = A1 + 0.9, A3 = Wt("L35", 7);
  MK.AP0 = AP0; MK.A1 = A1; MK.A2 = A2; MK.A3 = A3;
  const photo = (col) => `<g transform="translate(0,40)">${RR(-60, -10, 120, 170, "#ffffff", 5, 6)}${RF(-50, 0, 100, 120, col)}${C(0, 40, 26, "#ffffff", 4)}${P("M-30,110 Q0,64 30,110Z", "#ffffff", 4)}</g>`;
  const auntAt = (fac, xs, tA, col, seed) => fac({ x: xs[0], y: 30, seed, keys: [[0, { hide: true }], [tA - 0.5, { hide: false, x: xs[0], turn: -0.5, walk: 2.6, ...X.happy, armR: { sh: 110, el: -30, hand: "fist", propFront: photo(col) } }], [tA - 0.45, { x: xs[1] }, 0.5, (k) => k], [tA + 0.05, { walk: 0, ...X.laugh, turn: -0.3 }, 0.15]] });
  add({
    t0: AP0, bg: "toiTable", c0: { x: 0, y: -560 },
    cam: [[AP0, { x: -100, y: -520, z: 1.45 }], [A1, { x: -40, y: -540, z: 1.3 }], [A3 + 0.4, { x: 0, y: -560, z: 1.15 }]],
    shake: (t) => { let s = 0; for (const a of [A1, A2, A3]) if (t > a && t < a + 0.2) s += 6; return s; },
    actors: [
      ACT.arturSuit({ x: -330, y: -40, keys: [[0, ex("scared", "stand", { turn: 0.5 })], [A2, ex("scared", "stand", { turn: 0.5, lean: -8 }), 0.2], [A3, ex("strain", "stand", { turn: 0.5, lean: -14, squash: 0.92 }), 0.2]] }),
      auntAt(ACT.aunt1, [1100, 420], A1, "#f2a5b8", 43),
      auntAt(ACT.aunt2, [1300, 160], A2, "#9fd0e8", 47),
      auntAt(ACT.aunt3, [1500, -60], A3, "#f6d55c", 53),
    ],
    world: (t) => TT() + bones(-200, -130, 0.8) + sweat(-380, -800, t, A1, 3),
    type: (t) => TY.pop(t, A1, "1", 820, 420, { size: 120, color: "#f2a5b8" }) + TY.pop(t, A2, "2", 700, 520, { size: 130, color: "#9fd0e8" }) + TY.pop(t, A3, "3!", 560, 620, { size: 150, color: "#f6d55c" }),
    fx: () => ({ vig: 0.3, dof: 2.5 }),
  });

  // ================= 8. КЕҢЕС + СОҢЫ =================
  const HOST = S("L36") - 0.4, TIP = Wt("L36", 10), TIP2 = Wt("L36", 11), CTA = S("L37");
  MK.HOST = HOST; MK.TIP = TIP; MK.TIP2 = TIP2; MK.CTA = CTA;
  const asabaIn = S("L38") - 0.3;
  MK.ASIN = asabaIn;
  const END = E("L38") + 2.3;
  MK.END = END;
  add({
    t0: HOST, bg: "host", bgArgs: [["#ffe0b8", "#ffb98a"]], bgKey: "hostWarm", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[HOST, { x: 0, y: -600, z: 2.0 }], [TIP, { x: 0, y: -620, z: 2.15 }], [CTA, { x: 0, y: -600, z: 1.9 }], [asabaIn, { x: 100, y: -580, z: 1.5 }], [END, { x: 110, y: -580, z: 1.55 }]],
    shake: (t) => (t > TIP && t < TIP + 0.25 ? 6 : 0),
    actors: [
      ACT.arturSuit({ x: 0, y: 30, keys: [[0, ex("happy", { turn: 0 })], [S("L36") + 0.2, ex("calm", "fingerUp"), 0.3], [TIP, ex("smug", "point"), 0.2], [CTA, ex("happy", "wave"), 0.3], [asabaIn + 0.4, ex("deadpan", "armsDown", { turn: 0.3, ...PO.lookR }), 0.3]], talk: ["L36", "L37"] }),
      ACT.asaba({ x: 900, y: 30, keys: [[0, { hide: true }], [asabaIn, { hide: false, x: 900, ...ex("laugh", "mic", { turn: -0.5 }) }], [asabaIn + 0.05, { x: 340 }, 0.35, eout], [Wt("L38", 4), ex("laugh", "mic", { turn: -0.2, armL: { sh: 90, el: 0, hand: "point" } }), 0.2]], talk: ["L38"] }),
    ],
    type: (t) => TY.pop(t, S("L36") + 0.6, "ЕШКІМ СӨЗ", 540, 290, { size: 84, color: "#ffffff", t1: CTA - 0.2 }) + TY.pop(t, S("L36") + 0.8, "БЕРМЕЙДІ ДЕП ОЙЛАМА", 540, 390, { size: 60, color: "#ffffff", t1: CTA - 0.2 }) + TY.stamp(t, TIP, "БЕРЕДІ.", 330, 530, { size: 70, rot: -6, t1: CTA - 0.2 }) + TY.stamp(t, TIP2, "ӘРҚАШАН!", 740, 600, { size: 70, rot: 5, color: "#5a7fc4", t1: CTA - 0.2 }) +
      TY.pop(t, Wt("L37", 8), "КОММЕНТАРИЙГЕ ЖАЗ!", 540, 330, { size: 66, color: "#f6d55c", t1: asabaIn }) + TY.swing(t, E("L38") + 0.3, "САУ БОЛЫҢДАР!", 540, 400, { size: 96, color: "#f6d55c" }),
    fx: () => ({ vig: 0.2 }),
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.SONGY_TOTAL = END + 0.2;

  // ---------- дыбыс (scripts/reels-mix.mjs оқиды) ----------
  G.SONGY_AUDIO = (a) => {
    const { mus, fx, M } = a;
    // ілмек
    fx("hallMurmur", 0, -22, { fi: 0.5, dur: S("L02") - 0.2, fo: 0.5 });
    fx("heartbeat", 1.5, -14, { dur: S("L02") - 1.5, fo: 0.4 });
    mus("tension3", 0.2, S("L02") - 0.1, -18, { fi: 1.5, fo: 0.3 });
    fx("night", E("L02") + 0.05, -16, { dur: M.FB - E("L02") - 0.05, fo: 0.1 });
    fx("feedback", M.FB - 0.05, -7, { dur: 1.2, fo: 0.4 });
    fx("whoosh", M.TITLE - 0.1, -9);
    fx("dombraHit", M.TITLE, -7);
    mus("theme", M.TITLE, M.FRZ + 0.02, -10, { fi: 0.05, fo: 0.04 });
    fx("scratch", M.RW, -11, { dur: 0.7 });
    fx("applause", M.CPL, -18, { dur: 1.6, fo: 0.8 });
    fx("dundun", M.FRZ, -6);
    // заңдар
    fx("dombraHit", M.LAWS + 0.2, -8);
    mus("montage", M.LAWS + 0.3, M.MIDN + 0.3, -13, { fi: 0.6, fo: 0.8 });
    fx("stamp", M.LAWS + 1.9, -14);
    fx("stamp", M.CROSS, -9);
    fx("timelapse", M.FILL - 0.2, -12);
    fx("hallMurmur", M.FILL + 0.2, -20, { dur: S("L11") - M.FILL - 0.4, fo: 0.4 });
    fx("stamp", M.L2 + 0.1, -10);
    fx("pops", Wt("L12", 4), -14); fx("pops", Wt("L12", 7), -14); fx("whoosh", Wt("L12", 11), -12);
    fx("stamp", M.L3 + 0.1, -10);
    fx("timelapse", S("L14"), -12);
    // ет
    mus("epic", M.MEAT - 0.3, M.ASABA - 0.05, -9, { fi: 0.1, fo: 0.2 });
    fx("drumroll", M.ASABA + 1.5, -10);
    fx("crowdGasp", M.CALL + 0.1, -10);
    fx("gulp", M.ME + 0.6, -10);
    mus("tension2", M.ME, M.SYN, -14, { fi: 0.6, fo: 0.4 });
    fx("whoosh", M.R1, -12); fx("whoosh", M.R2, -10); fx("whoosh", M.R3, -8);
    fx("boing", M.CAT + 0.35, -12);
    fx("feedback", M.Q1 + 0.12, -14, { dur: 0.5, fo: 0.2 });
    fx("feedback", M.Q2 + 0.12, -11, { dur: 0.6, fo: 0.2 });
    fx("feedback", M.Q3 + 0.12, -8, { dur: 0.8, fo: 0.3 });
    fx("whoosh", M.DIVE - 0.4, -8);
    fx("night", M.DIVE, -12, { dur: S("L21") - M.DIVE, fo: 0.3 });
    fx("keys", M.TYPE0, -12, { dur: 1.2 });
    fx("ping", Wt("L21", 8), -12);
    fx("chatter", Wt("L22", 6), -18, { dur: 2.4, fo: 0.6 });
    fx("dundun", Wt("L23", 3), -9);
    fx("hallMurmur", M.AUN, -19, { dur: S("L26") - M.AUN, fo: 0.3 });
    fx("synthIntro", M.SYN + 0.2, -9);
    fx("crack", M.ICE, -10);
    fx("whoosh", M.ICE + 0.1, -12);
    // slow-mo
    mus("epic2", M.SLOW, S("L28") + 0.4, -11, { fi: 0.3, fo: 1.0 });
    fx("heartbeat", M.SLOW, -14, { dur: S("L28") - M.SLOW });
    mus("piano", S("L28") - 0.2, M.SIL + 0.6, -12, { fi: 1.2, fo: 1.2 });
    fx("drop", M.FORK, -8);
    fx("applause", M.CLAP - 0.1, -6);
    mus("theme3", M.BOOM, M.BONE + 0.3, -10, { fi: 0.05, fo: 0.6 });
    fx("whoosh", M.LIFT2 - 0.2, -10);
    fx("boing", Wt("L33", 4), -12);
    fx("drumroll", M.NEXT + 0.3, -14, { dur: 1.6, fo: 0.4 });
    fx("crowdGasp", M.SNAP + 0.3, -12);
    mus("outro", M.NEXT, a.TOTAL, -12, { fi: 0.8, fo: 2.4 });
    fx("pops", M.A1, -10); fx("pops", M.A2, -9); fx("pops", M.A3, -8);
    fx("whoosh", M.HOST - 0.1, -10);
    fx("stamp", M.TIP, -10); fx("stamp", M.TIP2, -10);
    fx("ping", M.CTA + 1.8, -12);
    fx("whoosh", M.ASIN, -10);
    fx("dombraHit", E("L38") + 0.25, -7);
  };
})(typeof window !== "undefined" ? window : globalThis);
