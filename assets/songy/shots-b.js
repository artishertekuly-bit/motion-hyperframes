/* «Соңғы қоңырау» — кадрлар, 2-бөлім: аула → қоңырау → баяу құлау → түйін → соңы (~178 … 318 с). */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RIG = G.ArturRig, H = G.SONGY_H;
  const { S, E, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { BG, PROPS, balloon, crowdPerson, P, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { Wt, POSES, tears, speed, puff, phoneUI, bigBell, girlAt, teacherAt, hostArtur } = H;
  const SH = G.SONGY_SHOTS;
  const add = (o) => SH.push(o);
  const D = Math.PI / 180;

  // жергілікті нүкте → әлем (rot, s, x, y)
  const toW = (o, lx, ly) => { const c = Math.cos((o.rot || 0) * D), s = Math.sin((o.rot || 0) * D); return [o.x + (lx * c - ly * s) * o.s, o.y + (lx * s + ly * c) * o.s]; };
  const ringing = (t, on) => (on ? Math.sin(t * 2 * Math.PI * 3.1) * 34 : 0);
  const girlBellArm = (t, on) => ({ armR: { sh: 158 + (on ? Math.sin(t * 19.5) * 8 : 0), el: 12, hand: "fist", propFront: PROPS.bell(ringing(t, on)) } });
  const ARCH_X = 2400;
  const arch = (t, popped) => `<g transform="translate(0,400)">${BG.arch(popped || 0, t, ARCH_X)}</g>`;
  const front = (seed) => BG.crowdFront(seed, 9, -2600, 640, 260, 0.62);

  // ========== 4. МЕКТЕП АУЛАСЫ ==========
  const YA = S("L37") - 0.8, DIR = S("L38") - 0.45, TL = S("L39") - 0.15;
  const crowdCast = (k, t) => [
    { look: "mom", outfit: "momFest", x: -40, s: 0.75, seed: 21, keys: [[YA, { turn: 0.25, ...RIG.EXPR.happy }], [TL, { ...POSES.tearful, armR: { sh: 40, el: -140, hand: "fist", prop: PROPS.tissue() } }, 0.4]] },
    { look: "dad", outfit: "dad", x: 230, s: 0.75, seed: 33, keys: [[YA, { turn: -0.2, ...RIG.EXPR.happy, ...POSES.phoneUp }]] },
    teacherAt(-420, [[YA, { turn: 0.3, ...RIG.EXPR.calm }], [TL + 1, { ...RIG.EXPR.sleepy, armR: { sh: 60, el: -120, hand: "open" } }, 0.4]]),
    girlAt(520, [[YA, { turn: 0.25, ...RIG.EXPR.calm, ...POSES.lookUp }], [TL + 2, { ...POSES.suspicious, ...RIG.POSES.hips }, 0.4]]),
    { look: "artur", outfit: "grad", x: 760, s: 0.75, seed: 5, keys: [[YA, { turn: -0.15, ...RIG.EXPR.calm, fx: { sweat: 0.5 } }], [TL + 0.5, { ...POSES.deadpan, fx: { sweat: 1 } }, 0.5], [TL + 2.5, { squash: 0.93, mouth: "wavy", eye: { lidTop: 0.7 }, lean: 6 }, 2.5], [TL + 5, { squash: 0.88, lean: 10, headTilt: 10 }, 1.5]] },
  ];
  add({
    t0: YA, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[YA, { x: 300, y: -2100, z: 0.8 }], [Wt("L37", 2) - 0.1, { x: 300, y: -700, z: 0.62 }, eio], [Wt("L37", 3), { x: 1800, y: -720, z: 0.8 }], [Wt("L37", 4), { x: -1400, y: -700, z: 0.85 }], [Wt("L37", 8) - 0.2, { x: 0, y: -900, z: 0.7 }], [E("L37") + 0.3, { x: 760, y: -600, z: 1.9 }, eio], [DIR, { x: 760, y: -610, z: 2.05 }]],
    worldBack: (t) => arch(t),
    actors: crowdCast(),
    world: (t) => (t > Wt("L37", 4) - 0.2 && t < Wt("L37", 5) ? `<g transform="translate(-1650,-760)">${Ln("M-760,-140 q60,60 0,120 M-830,-170 q100,90 0,180 M820,-140 q-60,60 0,120 M890,-170 q-100,90 0,180", 8)}</g>` : ""),
    nearWorld: () => front(3),
    over: (t) => {
      const k = win(t, Wt("L37", 5) - 0.2, Wt("L37", 5) + 0.3);
      if (k <= 0) return "";
      const pulse = 1 + Math.sin(t * 8) * 0.05;
      return `<g transform="translate(1620,210) scale(${f(eout(k) * pulse)})">${C(0, 0, 110, "#ffd34d", 8)}${[...Array(12)].map((_, i) => { const a = i * 30 * D; return Ln(`M${f(Math.cos(a) * 140)},${f(Math.sin(a) * 140)} L${f(Math.cos(a) * 190)},${f(Math.sin(a) * 190)}`, 10, "#ffb020"); }).join("")}</g>`;
    },
    type: (t) => TY.pop(t, Wt("L37", 6), "+30°", 1620, 400, { size: 110, color: "#ff6b5b", t1: Wt("L37", 8) + 0.6 }),
    fx: (t) => ({ dof: t > E("L37") ? 3 : 0 }),
  });
  // директор: «Құрметті...» ×35
  const qCount = (t) => { const pts = [Wt("L38", 0), Wt("L38", 2), Wt("L38", 4), Wt("L38", 6)]; let n = 0; for (const p of pts) if (t >= p) n++; if (t > TL) n = Math.round(lerp(4, 35, eio(win(t, TL + 0.5, Wt("L39", 7))))); return n; };
  const counter = (t) => { const n = qCount(t); if (n < 1) return ""; const last = n <= 4 ? [Wt("L38", 0), Wt("L38", 2), Wt("L38", 4), Wt("L38", 6)][n - 1] : t; const k = n <= 4 ? spring((t - last) / 0.6) : 1; return `<div style="position:absolute;right:90px;top:70px;transform:scale(${f(0.6 + 0.4 * k)}) rotate(4deg);transform-origin:100% 0;font-family:Montserrat;font-weight:900;font-size:76px;color:#fff;-webkit-text-stroke:12px #141418;paint-order:stroke fill">«ҚҰРМЕТТІ» <span style="color:#f6d55c">×${n}</span></div>`; };
  add({
    t0: DIR, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[DIR, { x: -1650, y: -880, z: 1.5 }], [S("L39") - 0.3, { x: -1640, y: -900, z: 1.75 }]],
    shake: (t) => (t < DIR + 0.5 ? 10 : 0),
    actors: [{ look: "director", outfit: "director", x: -1650, y: -470, s: 0.62, seed: 71, talk: ["L38"], keys: [[DIR, { turn: 0.1, ...RIG.EXPR.calm, eye: { lidTop: 0.45 }, armR: { sh: 40, el: -120, hand: "fist" } }], [DIR + 0.05, { ...RIG.EXPR.shock, mouth: "oh" }, 0.05], [DIR + 0.6, { ...RIG.EXPR.happy, mouth: "rest", armR: { sh: 40, el: -120 } }, 0.3]] }],
    world: () => `<g transform="translate(-1650,-470)">${Ln("M-60,0 L-60,-330", 9)}${RR(-90, -380, 60, 70, "#2d2f36", 6, 26)}</g>`,
    type: (t) => counter(t),
    fx: (t) => ({ dof: 2.5 }),
  });
  // уақыт өтуі: күн жылжиды, Артур балқиды
  add({
    t0: TL, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[TL, { x: 200, y: -480, z: 1.0 }], [E("L39") + 0.4, { x: 420, y: -520, z: 1.25 }]],
    worldBack: (t) => arch(t),
    actors: crowdCast(),
    world: (t) => { let s = ""; const a = lerp(-50, 50, win(t, TL, E("L39"))); for (const x of [-420, -40, 230, 520, 760]) s += `<ellipse cx="${f(x + a * 3)}" cy="6" rx="${f(110 + Math.abs(a) * 1.6)}" ry="20" fill="#000" opacity="0.13"/>`; return s; },
    nearWorld: () => front(3),
    over: (t) => { const k = win(t, TL, E("L39")); const a = lerp(200, -20, k) * D; return `<g transform="translate(${f(960 + Math.cos(a) * 820)},${f(230 - Math.sin(a) * 150)})">${C(0, 0, 70, "#ffd34d", 7)}</g>`; },
    type: (t) => counter(t) + TY.pop(t, Wt("L39", 2), "40 МИН", 300, 170, { size: 90, color: "#ffffff", tilt: -6 }),
    fx: (t) => ({ tint: "#ffcf7a", tintA: 0.18 * win(t, TL, E("L39")), bright: lerp(1, 1.05, win(t, TL, E("L39"))) }),
  });
  // «Қашан?»
  const TUG = S("L40") - 0.9;
  add({
    t0: TUG, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[TUG, { x: 640, y: -470, z: 1.55 }], [S("L42"), { x: 650, y: -480, z: 1.75 }], [S("L43") - 0.3, { x: 660, y: -480, z: 1.85 }]],
    actors: [
      girlAt(520, [[TUG, { turn: 0.3, ...POSES.suspicious, ...POSES.lookUp, armR: { sh: 70, el: -10, hand: "fist" } }], [S("L42"), { ...RIG.EXPR.angry, mouth: "rest", fx: { vein: 1 }, armR: { sh: 100, el: -20 } }, 0.12], [S("L42") + 0.25, { armR: { sh: 60, el: -10 } }, 0.15]], ["L40", "L42"]),
      { look: "artur", outfit: "grad", x: 760, s: 0.75, seed: 5, talk: ["L41"], keys: [[TUG, { turn: -0.2, ...POSES.deadpan, squash: 0.9, lean: 8, headTilt: 8, fx: { sweat: 1 }, eye: { lidTop: 0.7 } }], [S("L42") + 0.05, { lean: -10, squash: 0.95, ...RIG.EXPR.shock, mouth: "oh" }, 0.1], [S("L42") + 0.5, { lean: 0, ...POSES.deadpan }, 0.3]] },
    ],
    fx: () => ({ dof: 3 }),
  });
  // «Ал енді... соңғы қоңырау!» + көтеру
  const GO = S("L43") - 0.35, LIFT = E("L43") + 0.35;
  add({
    t0: GO, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[GO, { x: -1650, y: -880, z: 1.6 }], [E("L43"), { x: -1640, y: -900, z: 1.8 }]],
    actors: [{ look: "director", outfit: "director", x: -1650, y: -470, s: 0.62, seed: 71, talk: ["L43"], keys: [[GO, { turn: 0.1, ...RIG.EXPR.happy, armR: { sh: 40, el: -120, hand: "fist" } }], [S("L43") + 1.0, { armL: { sh: 150, el: 10, hand: "open" } }, 0.25]] }],
    world: () => `<g transform="translate(-1650,-470)">${Ln("M-60,0 L-60,-330", 9)}${RR(-90, -380, 60, 70, "#2d2f36", 6, 26)}</g>`,
    fx: () => ({ dof: 2.5 }),
  });
  const ON_SH = { lx: 175, ly: -640 };
  const artPos = { x: 760, y: 0, s: 0.75, rot: 0 };
  add({
    t0: LIFT, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[LIFT, { x: 700, y: -520, z: 1.3 }], [LIFT + 1.4, { x: 760, y: -720, z: 1.75 }], [LIFT + 2.4, { x: 830, y: -740, z: 2.1 }, eout], [S("L44") + 0.8, { x: 840, y: -740, z: 2.25 }]],
    shake: (t) => (t > LIFT + 1.3 ? 6 + 8 * (1 - win(t, LIFT + 1.3, LIFT + 2)) : 0),
    actors: [
      { look: "artur", outfit: "grad", x: 760, s: 0.75, seed: 5, keys: [[LIFT, { turn: 0.05, ...RIG.EXPR.happy, armL: { sh: 30, el: -60, hand: "fist" }, armR: { sh: 30, el: -60, hand: "fist" } }], [LIFT + 0.4, { squash: 0.9, ...POSES.determined, fx: { sweat: 1 } }, 0.15], [LIFT + 0.8, { squash: 1.05, ...POSES.carry, armL: { sh: 11, el: -7, hand: "rest" } }, 0.18], [LIFT + 1.1, { squash: 1, ...RIG.EXPR.happy }, 0.2], [LIFT + 1.45, { ...RIG.EXPR.shock, mouth: "shock", shakeEyes: true }, 0.08]] },
      { look: "girl", outfit: "girl", s: 0.75, seed: 61,
        pos: (t) => { const k = eout(win(t, LIFT + 0.45, LIFT + 0.85)); const [ax, ay] = toW(artPos, ON_SH.lx, ON_SH.ly); return { x: lerp(560, ax, k), y: lerp(0, ay + 150, k) - Math.sin(k * Math.PI) * 120 }; },
        mod: (t, p) => (t > LIFT + 1.3 ? Object.assign(p, girlBellArm(t, true)) : p),
        keys: [[LIFT, { turn: 0.3, ...RIG.EXPR.happy }], [LIFT + 0.85, { ...POSES.sit, legL: { a: 6, k: 50 }, legR: { a: 10, k: 50 } }, 0.2], [LIFT + 1.3, { ...RIG.EXPR.laugh }, 0.2]] },
    ],
    over: (t) => { const k = win(t, LIFT + 1.4, LIFT + 1.6); if (k <= 0) return ""; let s = ""; for (let i = 0; i < 3; i++) { const r = ((t * 2.2 + i / 3) % 1); s += `<circle cx="960" cy="500" r="${f(120 + r * 700)}" fill="none" stroke="#ffffff" stroke-width="${f(14 * (1 - r))}" opacity="${f(0.6 * (1 - r))}"/>`; } return s + TX(1500, 260, "ДІҢ-ДІҢ!", 110, "#f6d55c", ` stroke="${INK}" stroke-width="14" paint-order="stroke" transform="rotate(${f(Math.sin(t * 20) * 6)} 1500 220)"`); },
    nearWorld: () => front(3),
    fx: (t) => ({ dof: t > LIFT + 1.4 ? 4 : 0, blur: t > LIFT + 1.45 && t < S("L44") ? Math.abs(Math.sin(t * 9)) * 1.4 : 0 }),
  });

  // ========== 5. ҚОҢЫРАУ: ЖҮГІРУ → БАЯУ ҚҰЛАУ ==========
  const RUNST = S("L44") + 1.0, BOW = S("L45") - 0.3, POV = S("L46") - 0.25, LEGS = S("L47") - 0.2, ARCHT = Wt("L47", 5) - 0.15;
  const SLOW = S("L48") - 0.3, FACE = S("L49") - 0.35, FALL = E("L49") + 0.15, LAND = FALL + 2.4, SIL = LAND + 0.7, TAGY = S("L50");
  // Артурдың әлемдегі орны (жүгіру → құлау)
  function arturRun(t) {
    let x;
    if (t < RUNST) x = 760;
    else if (t < SLOW) x = lerp(760, 1880, (t - RUNST) / (SLOW - RUNST));
    else x = 1880 + 260 * eout(win(t, SLOW, LAND));
    const lift = t > SLOW ? Math.sin(Math.PI * win(t, SLOW + 1.2, LAND)) * 150 : 0;
    let rot = 0;
    if (t > SLOW) rot = lerp(0, 28, eio(win(t, SLOW + 0.4, SLOW + 3.5)));
    if (t > FALL - 1) rot = lerp(28, 90, eio(win(t, FALL - 0.6, LAND)));
    const y = t > LAND - 0.05 ? -67 : -lift - (t > SLOW ? 67 * win(t, FALL, LAND) : 0);
    return { x, y, s: 0.75, rot };
  }
  const headAt = (t) => { const [x, y] = toW(arturRun(t), 60, -780); return { x, y }; };
  const runPh = (t) => (t < SLOW ? (t - RUNST) * 2.3 : (SLOW - RUNST) * 2.3 + (t - SLOW) * 0.35);
  const arturRunActor = {
    look: "artur", outfit: "grad", s: 0.75, seed: 5,
    pos: (t) => arturRun(t),
    mod: (t, p) => {
      if (t < LAND - 0.3) {
        const ph = runPh(t) * 2 * Math.PI, amp = t < LEGS ? 26 : t < SLOW ? 16 : 30 * (1 - win(t, SLOW, FALL));
        p.legL = { a: Math.sin(ph) * amp, k: Math.max(0, Math.sin(ph)) * 22 };
        p.legR = { a: Math.sin(ph) * amp, k: Math.max(0, -Math.sin(ph)) * 22 };
        p.y = (p.y || 0) - Math.abs(Math.cos(ph)) * 12;
      }
      return p;
    },
    keys: [[RUNST - 0.3, { turn: 0.5, ...RIG.EXPR.scared, mouth: "wavy", ...POSES.carry, fx: { sweat: 1 } }], [SLOW, { ...POSES.determined, mouth: "shock" }, 0.4], [FALL, { ...POSES.determined, mouth: "growl", turn: 0, armL: { sh: 92, el: 0, hand: "open" } }, 2.0], [LAND, { ...RIG.EXPR.shock, mouth: "oh" }, 0.1], [SIL, { ...POSES.deadpan, eye: { lidTop: 0.5 } }, 0.4]],
  };
  // Аяулым: иықта → (құлау) → көтерілген қолда
  const girlRunActor = {
    look: "girl", outfit: "girl", s: 0.75, seed: 61,
    pos: (t) => {
      const a = arturRun(t);
      const k = eio(win(t, FALL, LAND - 0.2));
      const lx = lerp(175, -392, k), ly = lerp(-640, -612, k);
      const [x, y] = toW(a, lx, ly);
      const bob = t < SLOW ? -Math.abs(Math.cos(runPh(t) * 2 * Math.PI)) * 9 : 0;
      return { x, y: y + 150 + bob - 120 * k };
    },
    mod: (t, p) => Object.assign(p, girlBellArm(t < SLOW || t > SIL + 3.5 ? t : SLOW + (t - SLOW) * 0.3, t < SIL || (t > TAGY + 0.2 && t < TAGY + 1.4))),
    keys: [[RUNST - 0.3, { turn: 0.3, ...RIG.EXPR.laugh, ...POSES.sit, legL: { a: 6, k: 50 }, legR: { a: 10, k: 50 } }], [SLOW, { ...RIG.EXPR.happy }, 0.4], [SIL, { ...RIG.EXPR.calm, eye: { lidTop: 0.2 } }, 0.3], [TAGY - 0.1, { ...RIG.EXPR.laugh }, 0.12]],
    talk: ["L50"],
  };
  add({
    t0: S("L44") + 0.8 > RUNST ? RUNST - 0.2 : RUNST - 0.2, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[RUNST - 0.2, { x: 700, y: -520, z: 1.1 }], [BOW, { x: arturRun(BOW).x + 120, y: -560, z: 1.2 }, (k) => k]],
    shake: () => 7,
    worldBack: (t) => arch(t),
    actors: [
      { look: "mom", outfit: "momFest", x: -40, s: 0.75, seed: 21, keys: [[RUNST, { turn: 0.5, ...RIG.EXPR.shock, mouth: "oh" }]] },
      { look: "dad", outfit: "dad", x: 230, s: 0.75, seed: 33, keys: [[RUNST, { turn: 0.5, ...RIG.EXPR.happy, ...POSES.phoneUp }]] },
      arturRunActor, girlRunActor,
    ],
    nearWorld: () => front(3),
    fx: () => ({ dof: 2 }),
  });
  // бантик көзді жабады
  add({
    t0: BOW, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[BOW, { x: arturRun(BOW).x + 90, y: -730, z: 2.2 }], [POV, { x: arturRun(POV).x + 90, y: -740, z: 2.4 }, (k) => k]],
    shake: () => 9,
    actors: [arturRunActor, girlRunActor],
    world: (t) => {
      const k = eout(win(t, Wt("L45", 3) - 0.2, Wt("L45", 3) + 0.3));
      if (k <= 0) return "";
      const a = arturRun(t);
      const [hx, hy] = toW(a, 30, -830);
      return `<g transform="translate(${f(hx)},${f(hy - 120 * (1 - k))}) scale(${f(0.6 + 0.4 * k)})">${P("M0,0 Q-60,-90 -170,-70 Q-190,0 -170,60 Q-60,80 0,0Z", "#ffffff", 7)}${P("M0,0 Q60,-90 170,-70 Q190,0 170,60 Q60,80 0,0Z", "#ffffff", 7)}${RR(-24, -24, 48, 48, "#ffffff", 7, 8)}</g>`;
    },
    fx: () => ({ dof: 4 }),
  });
  // POV: бантиктің арасынан әкесі көрінеді
  add({
    t0: POV, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[POV, { x: 400, y: -520, z: 1.4, r: -4 }], [LEGS, { x: 300, y: -520, z: 1.5, r: 4 }, (k) => k]],
    shake: () => 14,
    actors: [{ look: "dad", outfit: "dad", x: 330, s: 0.75, seed: 33, talk: ["L46"], keys: [[POV, { turn: 0.1, ...RIG.EXPR.happy, ...POSES.phoneUp, armR: { sh: 150, el: 20, hand: "open" } }], [S("L46") + 0.6, { armR: { sh: 120, el: 40 } }, 0.15], [S("L46") + 0.9, { armR: { sh: 150, el: 20 } }, 0.15], [S("L46") + 1.2, { armR: { sh: 120, el: 40 } }, 0.15]] }],
    nearWorld: () => front(3),
    over: (t) => {
      const w = Math.sin(t * 6) * 18;
      return `<g transform="translate(${f(960 + w)},560) scale(5.2)">${P("M-2,0 Q-60,-120 -230,-100 Q-270,0 -240,90 Q-70,110 -2,0Z", "#ffffff", 3)}${P("M2,0 Q60,-120 230,-100 Q270,0 240,90 Q70,110 2,0Z", "#ffffff", 3)}</g>` + `<path d="M0,0 H1920 V1080 H0Z M560,140 Q960,40 1360,140 Q1500,540 1360,940 Q960,1040 560,940 Q420,540 560,140Z" fill="#ffffff" fill-rule="evenodd" opacity="0.0"/>`;
    },
    fx: () => ({ vig: 0.6, blur: 1.2 }),
  });
  // лента аяққа оралды → алда шарлар
  add({
    t0: LEGS, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[LEGS, { x: arturRun(LEGS).x, y: -200, z: 2.4 }], [ARCHT - 0.05, { x: arturRun(ARCHT).x, y: -220, z: 2.5 }, (k) => k], [ARCHT + 0.35, { x: 2380, y: -760, z: 0.95 }, eout], [SLOW, { x: 2340, y: -720, z: 1.05 }]],
    shake: (t) => (t < ARCHT ? 10 : 4),
    worldBack: (t) => arch(t),
    actors: [arturRunActor, girlRunActor],
    world: (t) => {
      const a = arturRun(t);
      const [kx, ky] = toW(a, 0, -250);
      return `<g transform="translate(${f(kx)},${f(ky)})">${P("M-80,-30 Q0,-60 80,-30 Q100,10 80,40 Q0,70 -80,40 Q-100,10 -80,-30Z", "none", 0)}${Ln("M-70,-20 Q0,30 70,-24 M-74,24 Q0,-20 74,20", 26, "#2b3e9e")}${Ln("M-70,-20 Q0,30 70,-24 M-74,24 Q0,-20 74,20", 5)}</g>`;
    },
    fx: (t) => ({ dof: t > ARCHT ? 0 : 3 }),
  });
  // БАЯУ СӘТ
  const slowCam = [[SLOW, { x: arturRun(SLOW).x + 150, y: -620, z: 1.25, r: -3 }], [FACE - 0.2, { x: headAt(FACE).x, y: headAt(FACE).y + 120, z: 1.55, r: 3 }]];
  const slowFx = (t) => ({ sat: 0.75, vig: 0.65, dof: 4, tint: "#7fb2ff", tintA: 0.12 });
  const slowWorld = (t) => { let s = ""; for (let i = 0; i < 16; i++) { const y = -1400 + hash(i) * 1500, x = 1200 + ((hash(i + 3) * 2000 - (t - SLOW) * 80) % 2000 + 2000) % 2000; s += Ln(`M${f(x)},${f(y)} l280,0`, 4, "#ffffff", ' opacity="0.5"'); } return s; };
  add({
    t0: SLOW, bg: "yard", c0: { x: 0, y: -400 }, cam: slowCam,
    worldBack: (t) => arch(t),
    actors: [arturRunActor, girlRunActor],
    world: slowWorld,
    fx: slowFx,
  });
  add({
    t0: FACE, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[FACE, { ...headAt(FACE), z: 2.9, r: 6 }], [FALL, { ...headAt(FALL), z: 3.2, r: 9 }, (k) => k]],
    actors: [Object.assign({}, arturRunActor, { talk: ["L49"] }), girlRunActor],
    fx: (t) => ({ sat: 0.75, vig: 0.75, dof: 6, tint: "#7fb2ff", tintA: 0.12 }),
  });
  add({
    t0: FALL, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[FALL, { x: 2200, y: -560, z: 1.3, r: -6 }], [LAND, { x: 2340, y: -420, z: 1.15, r: 0 }, eio], [SIL, { x: 2360, y: -440, z: 1.05 }], [TAGY, { x: 2380, y: -470, z: 0.92 }, (k) => k], [S("L51") - 0.6, { x: 2340, y: -480, z: 0.85 }]],
    shake: (t) => (t > LAND && t < LAND + 0.5 ? 26 * (1 - win(t, LAND, LAND + 0.5)) : 0),
    worldBack: (t) => arch(t, t > LAND - 0.1 ? 1 + 2 * win(t, LAND - 0.1, LAND + 0.25) : 0),
    actors: [arturRunActor, girlRunActor],
    world: (t) => {
      let s = t < LAND ? slowWorld(t) : "";
      if (t > LAND - 0.1) for (let i = 0; i < 40; i++) { const k = (t - LAND + 0.1) * 0.35 + hash(i) * 0.2; if (k > 1.2) continue; const x = 1900 + hash(i + 2) * 900 + Math.sin(t * 2 + i) * 40, y = -1100 + k * 1100; s += `<rect x="${f(x)}" y="${f(y)}" width="22" height="12" rx="3" fill="${["#e85d75", "#f6d55c", "#5ab4e5", "#ffffff"][i % 4]}" stroke="${INK}" stroke-width="3" transform="rotate(${f(t * 200 + i * 40)} ${f(x)} ${f(y)})"/>`; }
      s += puff(2000, -60, t, LAND, 0.9, 12, "#e6dcc8");
      return s;
    },
    nearWorld: (t) => (t > SIL - 0.3 ? BG.crowdFront(9, 8, 1300, 260, 360, 0.7) : ""),
    fx: (t) => (t < LAND ? { sat: 0.75, vig: 0.65, dof: 3, tint: "#7fb2ff", tintA: 0.12 } : { dof: t > SIL ? 2 : 0, flash: 0.5 * (1 - win(t, LAND, LAND + 0.3)) }),
    type: (t) => TY.pop(t, TAGY, "ТАҒЫ!", 1250, 260, { size: 130, color: "#f6d55c", rot: -10 }),
  });

  // ========== 6. ТҮЙІН ==========
  const SIT = S("L51") - 0.6, KN = S("L52") - 0.5, HUG = E("L52") + 0.35;
  const sitArtur = (keys, look) => ({ look: look || "arturSwept", outfit: "grad", x: 2150, y: 230, s: 0.75, seed: 5, keys });
  add({
    t0: SIT, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[SIT, { x: 2120, y: -430, z: 1.65 }], [KN, { x: 2220, y: -440, z: 1.75 }]],
    worldBack: (t) => arch(t, 3),
    actors: [
      sitArtur([[SIT, { turn: 0.15, ...POSES.sit, ...RIG.EXPR.sad, ...POSES.armsDown, fx: { sweat: 0.6 } }], [Wt("L51", 6), { ...RIG.EXPR.scared, mouth: "wavy" }, 0.3]]),
      teacherAt(2900, [[SIT, { hide: true }], [Wt("L51", 4), { hide: false, x: 2950, turn: -0.6, walk: 1.4, ...RIG.EXPR.sad }], [Wt("L51", 4) + 0.01, { x: 2470 }, 2.4, eout], [Wt("L51", 4) + 2.45, { walk: 0, ...POSES.stand }, 0.2]]),
    ],
    over: (t) => {
      const k = win(t, Wt("L51", 6) - 0.2, Wt("L51", 6) + 0.2) * (1 - win(t, KN - 0.3, KN));
      if (k <= 0) return "";
      return `<g transform="translate(700,250) scale(${f(eout(k))})">${P("M-260,-120 Q-280,-200 -160,-210 Q-60,-270 60,-220 Q220,-240 240,-120 Q300,-40 220,40 Q160,110 20,80 Q-140,120 -220,40 Q-300,-30 -260,-120Z", "#ffffff", 7)}${TX(-10, -50, "«жалқаусың...»", 54, "#7d3040")}</g>${C(980, 440, 22, "#ffffff", 6)}${C(1030, 500, 14, "#ffffff", 5)}`;
    },
  });
  add({
    t0: KN, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[KN, { x: 2290, y: -420, z: 1.75 }], [HUG, { x: 2300, y: -430, z: 2.0 }], [S("L54") - 0.7, { x: 2300, y: -430, z: 2.15 }, (k) => k]],
    worldBack: (t) => arch(t, 3),
    actors: [
      sitArtur([[KN, { turn: 0.25, ...POSES.sit, ...RIG.EXPR.scared, mouth: "rest", ...POSES.armsDown }], [S("L52") + 1.5, { ...RIG.EXPR.shock, mouth: "rest", fx: { sweat: 0 } }, 0.3], [HUG, { ...POSES.tearful, eye: { lidTop: 0.98, lidBot: 0 }, mouth: "smile" }, 0.4]]),
      teacherAt(2470, [[KN, { turn: -0.45, y: 150, ...POSES.tearful, legL: { a: 30, k: 70 }, legR: { a: 30, k: 70 } }], [HUG, { x: 2330, lean: -14, ...POSES.tearful, eye: { lidTop: 0.98, lidBot: 0 }, armL: { sh: 70, el: -100, hand: "open" }, armR: { sh: 60, el: -110, hand: "open" } }, 0.6]], ["L52"]),
    ],
    world: (t) => (t > S("L52") && t < HUG ? tears(2470 - 32, -560, t, 2) : ""),
    type: (t) => {
      const t0 = Wt("L53", 5) - 0.6, k = win(t, t0, t0 + 0.3);
      if (k <= 0) return "";
      const cr = win(t, Wt("L53", 5) + 0.1, Wt("L53", 5) + 0.9);
      let s = "";
      [..."БІРАҚ"].forEach((ch, i) => { const dy = cr * cr * (500 + i * 90), r = cr * (i % 2 ? 40 : -50); s += `<span style="display:inline-block;transform:translateY(${f(dy)}px) rotate(${f(r)}deg);opacity:${f(1 - cr)}">${ch}</span>`; });
      return `<div style="position:absolute;left:960px;top:220px;transform:translate(-50%,-50%) rotate(-6deg) scale(${f(eout(k))});padding:8px 30px;border:8px solid rgba(224,65,63,${f(1 - cr)});border-radius:14px;font-family:Montserrat;font-weight:900;font-size:96px;color:#e0413f;background:rgba(255,255,255,${f(0.88 * (1 - cr))})">${s}</div>`;
    },
    fx: () => ({ dof: 4, vig: 0.35, tint: "#ffd7a8", tintA: 0.15 }),
  });
  const MOMD = S("L54") - 0.7, THUMB = S("L56") - 0.25;
  add({
    t0: MOMD, bg: "yard", c0: { x: 0, y: -400 },
    cam: [[MOMD, { x: 1950, y: -560, z: 1.35 }], [S("L55") - 0.1, { x: 2050, y: -560, z: 1.45 }], [THUMB, { x: 2100, y: -560, z: 1.5 }]],
    worldBack: (t) => arch(t, 3),
    actors: [
      { look: "mom", outfit: "momFest", x: 1700, s: 0.75, seed: 21, talk: ["L54"], keys: [[MOMD, { turn: 0.4, ...POSES.tearful, armR: { sh: 100, el: 10, hand: "point" }, armL: { sh: 40, el: -140, hand: "fist", prop: PROPS.tissue() } }]] },
      { look: "arturSwept", outfit: "grad", x: 2080, s: 0.75, seed: 5, keys: [[MOMD, { turn: -0.25, ...RIG.EXPR.shy }], [S("L56"), { ...POSES.facepalm, ...POSES.deadpan }, 0.3]] },
      { look: "dad", outfit: "dad", x: 2450, s: 0.75, seed: 33, talk: ["L55"], keys: [[MOMD, { turn: -0.35, ...RIG.EXPR.happy, ...POSES.phoneUp }], [S("L55"), { ...RIG.EXPR.laugh, armL: { sh: 150, el: 10, hand: "fist", propFront: PROPS.phone() } }, 0.2]] },
    ],
    world: (t) => (t > S("L54") ? tears(1700, -575, t, 2) + (t < E("L54") + 0.5 ? `<g transform="translate(2080,-760)">${speed(0, 0, 120, t, S("L54") + 0.2, 7)}</g>` : "") : ""),
    over: (t) => {
      if (t < THUMB) return "";
      const k = spring((t - THUMB) / 0.8);
      const inner = RF(-185, -260, 370, 520, "#f2b6a0") + `<ellipse cx="20" cy="40" rx="190" ry="260" fill="#e8a089"/>` + `<ellipse cx="-20" cy="-40" rx="80" ry="110" fill="#f6c7b6" opacity="0.6"/>` + RF(-185, 260, 370, 110, "#1f2027") + RF(-160, 300, 320, 10, "#555a66", 5) + RF(-160, 300, 18, 10, "#e0413f", 5) + `<text x="0" y="345" font-size="26" fill="#fff" font-family="Montserrat" font-weight="700" text-anchor="middle">00:01 / 40:12</text>` + P("M-30,-40 L40,0 L-30,40Z", "#ffffff", 5);
      return phoneUI(1360, 540, 0.95 * k, inner);
    },
    type: (t) => TY.pop(t, Wt("L56", 3), "40 МИН", 600, 220, { size: 90, color: "#ffffff", tilt: -5 }) + TY.pop(t, Wt("L56", 7), "бас бармақ 👍".replace("👍", ""), 620, 340, { size: 70, color: "#f6d55c", tilt: 3 }),
    fx: (t) => ({ dof: t > THUMB ? 5 : 2 }),
  });

  // ========== 7. САБАҚ + СОҢЫ ==========
  const OUT = S("L57") - 1.0, CTA = S("L59") - 0.5, END = E("L60") + 0.7;
  add({
    t0: OUT, bg: "host", c0: { x: 0, y: -560 }, flashIn: 0.3,
    cam: [[OUT, { x: 0, y: -600, z: 1.2 }], [S("L58") - 0.2, { x: -40, y: -580, z: 1.05 }], [Wt("L58", 7), { x: -100, y: -560, z: 1.0 }], [CTA, { x: -80, y: -570, z: 1.04 }]],
    actors: [hostArtur("grad", [[OUT, { turn: 0.1, ...RIG.EXPR.calm, mouth: "smile" }], [S("L57") + 3.5, { ...RIG.EXPR.happy }, 0.3], [Wt("L58", 3) - 0.1, { turn: 0.3, armR: { sh: 150, el: 10, hand: "point" }, ...POSES.lookR }, 0.25], [Wt("L58", 7) - 0.1, { armR: { sh: 120, el: 40, hand: "open" }, ...POSES.lookC, ...RIG.EXPR.happy }, 0.25]], ["L57", "L58"])].map((a) => Object.assign(a, { x: -470 })),
    type: (t) => TY.pop(t, Wt("L58", 3), "1. ЛЕНТАНЫ ТҮЙРЕУІШПЕН БЕКІТ", 1290, 330, { size: 48, color: "#ffffff", stroke: 10, tilt: -2 }) + TY.pop(t, Wt("L58", 7), "2. «РАХМЕТ» ДЕУДІ КЕЙІНГЕ ҚАЛДЫРМА", 1290, 470, { size: 46, color: "#f6d55c", stroke: 10, tilt: 2 }),
    over: (t) => (t > Wt("L58", 3) ? `<g transform="translate(1290,215) scale(${f(spring((t - Wt("L58", 3)) / 0.8))})">${C(0, -20, 30, "#e85d75", 6)}${Ln("M0,10 L0,70", 7)}</g>` : ""),
  });
  const RINGB = Wt("L59", 12) - 0.1;
  add({
    t0: CTA, bg: "host", c0: { x: 0, y: -560 },
    cam: [[CTA, { x: 0, y: -570, z: 1.04 }], [RINGB, { x: 120, y: -560, z: 1.1 }], [RINGB + 0.4, { x: 200, y: -520, z: 1.35 }, eout], [END, { x: 60, y: -580, z: 1.12 }], [END + 5.5, { x: 0, y: -600, z: 1.2 }]],
    shake: (t) => (t > RINGB && t < RINGB + 0.9 ? 22 * (1 - win(t, RINGB, RINGB + 0.9)) : 0),
    actors: [
      hostArtur("grad", [[CTA, { turn: 0.1, ...RIG.EXPR.happy }], [Wt("L59", 5), { armR: { sh: 84, el: 2, hand: "point" } }, 0.2], [Wt("L59", 8) - 0.2, { ...POSES.armsDown, turn: 0.3, ...POSES.lookR }, 0.2], [RINGB + 0.05, { ...RIG.EXPR.shock, mouth: "oh", shakeEyes: true }, 0.08], [S("L60") - 0.1, { ...RIG.EXPR.happy, ...RIG.POSES.wave, shakeEyes: false }, 0.2]], ["L59", "L60"]),
      { look: "girl", outfit: "girl", s: 1.15, seed: 61,
        mod: (t, p) => Object.assign(p, girlBellArm(t, t > RINGB && t < RINGB + 1.2)),
        keys: [[CTA, { x: 1500, y: 60, turn: -0.3, ...RIG.EXPR.smug }], [Wt("L59", 8), { x: 760 }, 0.6, back], [RINGB, { ...RIG.EXPR.laugh }, 0.1], [END + 0.5, { x: 640, ...RIG.EXPR.happy }, 0.5]] },
    ],
    over: (t) => {
      let s = "";
      const kc = win(t, Wt("L59", 5) - 0.1, Wt("L59", 5) + 0.3) * (1 - win(t, Wt("L59", 8), Wt("L59", 8) + 0.3));
      if (kc > 0) s += `<g transform="translate(360,300) scale(${f(eout(kc))})">${P("M-130,-90 Q-130,-130 -90,-130 L90,-130 Q130,-130 130,-90 L130,40 Q130,80 90,80 L-20,80 L-80,130 L-70,80 L-90,80 Q-130,80 -130,40Z", "#ffffff", 8)}${C(-50, -25, 14, INK, 0)}${C(0, -25, 14, INK, 0)}${C(50, -25, 14, INK, 0)}</g>`;
      if (t > RINGB && t < RINGB + 1.2) for (let i = 0; i < 3; i++) { const r = ((t * 2.4 + i / 3) % 1); s += `<circle cx="1180" cy="420" r="${f(100 + r * 800)}" fill="none" stroke="#ffffff" stroke-width="${f(16 * (1 - r))}" opacity="${f(0.7 * (1 - r))}"/>`; }
      if (t > END) { const k = win(t, END, END + 0.6); s += RF(0, 0, 1920, 1080, "#1b2a52", 0, ` opacity="${f(0.92 * k)}"`); }
      return s;
    },
    type: (t) => {
      let s = TY.pop(t, RINGB + 0.05, "ДІҢ!", 1350, 230, { size: 150, color: "#f6d55c", rot: 20, t1: RINGB + 1.1 });
      if (t > END + 0.2) s += TY.swing(t, END + 0.25, "СОҢҒЫ ҚОҢЫРАУ", 960, 470, { size: 120 }) + TY.pop(t, END + 1.2, "Артурдың оқиғасы", 960, 620, { size: 52, color: "#ffffff", stroke: 9, weight: 700 });
      return s;
    },
    fx: (t) => ({ flash: t > RINGB && t < RINGB + 0.15 ? 0.6 : 0, dim: win(t, END + 4.3, END + 5.4) }),
  });

  G.SONGY_TOTAL = END + 5.5;
  G.SONGY_MARKS = Object.assign(G.SONGY_MARKS || {}, { YA, DIR, TL, TUG, GO, LIFT, RUNST, BOW, POV, LEGS, ARCHT, SLOW, FACE, FALL, LAND, SIL, TAGY, SIT, KN, HUG, MOMD, THUMB, OUT, CTA, RINGB, END });
})(typeof window !== "undefined" ? window : globalThis);
