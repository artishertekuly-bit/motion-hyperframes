/* «Әжемнің ауылы» — кадрлар, 2-бөлім: табын → бұқа → қуу → шөп маясы, күн батысы → қора → ата → кету → соңы (~169 с …). */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, A = G.AUYL_BG, RIG = G.ArturRig, H = G.AUYL_H;
  const { S, E, LN, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { BG, P, F, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { cow, cowFace, rooster, goose, haystack, bucket, bag, house, fence, FOOD, PROPS: AP } = A;
  const { Wt, POSES, puff, speed, shout, notes, phoneUI, bars, card, artur, aje, ata, boy, aktandak, hostArtur, benchAta } = H;
  const SH = G.SONGY_SHOTS;
  const add = (o) => SH.push(o);
  const MK = {};
  const apa = (o) => Object.assign({ look: "apa", outfit: "apa", s: 0.75, seed: 61 }, o);
  const run = (spd) => (t, p) => { const ph = t * spd * 6.283; p.legL = { a: Math.sin(ph) * 30, k: Math.max(0, Math.sin(ph)) * 26 }; p.legR = { a: -Math.sin(ph) * 30, k: Math.max(0, -Math.sin(ph)) * 26 }; p.y = (p.y || 0) - Math.abs(Math.cos(ph)) * 16; p.armL = { sh: 40 + Math.sin(ph) * 40, el: -60, hand: "fist" }; p.armR = { sh: 40 - Math.sin(ph) * 40, el: -60, hand: "fist" }; return p; };
  const COLS = ["#a0623a", "#3a3a3a", "#c98a4a", "#f4f1ea", "#7a4a2a", "#8a6a5a", "#b07040"];
  const tumble = (x, y, r, rot) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})">${Array.from({ length: 7 }, (_, i) => `<ellipse cx="0" cy="0" rx="${r}" ry="${f(r * (0.3 + 0.1 * (i % 3)))}" transform="rotate(${i * 26})" fill="none" stroke="#8a6a3a" stroke-width="7"/>`).join("")}${`<circle cx="0" cy="0" r="${r}" fill="none" stroke="${INK}" stroke-width="5"/>`}</g>`;

  // ========== 4. ТАБЫН ==========
  const HERD = S("L35") - 0.8, LOW = Wt("L35", 9) - 0.15, PICK = S("L36") - 0.3, NEI = S("L37") - 0.35, GIVE = Wt("L38", 0) + 0.2;
  MK.HERD = HERD; MK.LOW = LOW; MK.NEI = NEI;
  const herd = (t, front) => {
    let s = "";
    const rows = front ? [[160, 0.72]] : [[-330, 0.42], [-200, 0.52], [-70, 0.6]];
    rows.forEach(([y, sc], ri) => {
      for (let i = 0; i < 9; i++) {
        const id = ri * 9 + i + (front ? 40 : 0);
        const x = -4200 + i * 900 + (hash(id) - 0.5) * 300 + (t - HERD) * 260 * (1 + ri * 0.1);
        s += cow(x, y + (hash(id + 3) - 0.5) * 40, sc, { col: COLS[id % COLS.length], spots: id % 5 === 3 ? "#2d2522" : null, uid: 100 + id, horns: id % 3 === 0, walk: (t - HERD) * 1.3 + hash(id) }, t);
        s += puff(x - 300 * sc, y - 30, t, Math.floor((t + hash(id)) * 1.2) / 1.2, 0.83, 3, "#e6c79a");
      }
    });
    return s;
  };
  add({
    t0: HERD, bg: "pasture", c0: { x: 0, y: -600 }, flashIn: 0.3,
    cam: [[HERD, { x: -900, y: -900, z: 0.42 }], [LOW - 0.1, { x: 300, y: -700, z: 0.62 }]],
    worldBack: (t) => herd(t, false),
    actors: [artur({ x: 1500, y: 90, s: 0.62, keys: [[HERD, { turn: -0.3, ...POSES.determined, armR: { sh: 18, el: -6, hand: "fist", prop: AP.rope(120) } }]] })],
    world: (t) => herd(t, true) + puff(-1200, -200, t, HERD, 6, 18, "#f0d2a0"),
    type: (t) => TY.stamp(t, S("L35") + 0.2, "19:00", 300, 200, { size: 80, color: "#e85d75", rot: -6, t1: Wt("L35", 4) }) + TY.pop(t, Wt("L35", 4), "100 СИЫР", 960, 220, { size: 110, color: "#ffffff", t1: Wt("L35", 6) - 0.05 }) + TY.pop(t, Wt("L35", 6), "100 АҚ ТАҢБА", 960, 220, { size: 110, color: "#f6d55c", t1: LOW }),
    fx: (t) => ({ lb: eout(win(t, HERD, HERD + 1)), vig: 0.4, grain: 0.12 }),
  });
  add({
    t0: LOW, bg: "pasture", c0: { x: 0, y: -600 },
    cam: [[LOW, { x: 1400, y: -420, z: 2.1, r: -4 }], [PICK, { x: 1430, y: -440, z: 2.3, r: -2 }]],
    worldBack: (t) => herd(t, false),
    actors: [artur({ x: 1500, y: 90, s: 0.62, keys: [[LOW, { turn: -0.15, ...POSES.determined, armR: { sh: 18, el: -6, hand: "fist", prop: AP.rope(120) } }], [LOW + 1.4, { eye: { px: 0.7 } }, 0.3]] })],
    world: (t) => tumble(lerp(900, 2100, win(t, LOW, PICK)), -60, 70, (t - LOW) * 300),
    type: (t) => TY.pop(t, LOW + 0.1, "...ЖӘНЕ 1 МЕН", 960, 200, { size: 96, color: "#ffffff", t1: PICK - 0.1 }),
    fx: () => ({ lb: 1, dof: 6, vig: 0.5, grain: 0.15 }),
  });
  // сұлу сиыр → көршінің Бұренкасы
  const leadX = (t) => (t < NEI ? lerp(-500, 300, win(t, PICK, NEI)) : t < GIVE ? 300 : 300);
  add({
    t0: PICK, bg: "pasture", c0: { x: 0, y: -600 },
    cam: [[PICK, { x: -200, y: -560, z: 1.05 }], [NEI, { x: 300, y: -560, z: 1.1 }], [S("L37") + 0.4, { x: 600, y: -560, z: 1.25 }], [S("L38"), { x: 420, y: -580, z: 1.4 }], [S("L39") - 0.8, { x: 900, y: -560, z: 1.2 }]],
    worldBack: (t) => herd(t, false),
    actors: [
      artur({ x: 0, y: 90,
        pos: (t) => ({ x: leadX(t) + 300 }),
        keys: [[PICK, { turn: 0.5, ...RIG.EXPR.happy, walk: 1.4, armL: { sh: 50, el: -30, hand: "fist" } }], [NEI, { walk: 0, ...POSES.stand }, 0.2], [S("L37"), { turn: 0.3, ...RIG.EXPR.shock, mouth: "oh" }, 0.08], [GIVE, { ...RIG.EXPR.sad, mouth: "oh", lean: 22, armL: { sh: 70, el: -10, hand: "open" } }, 0.25], [GIVE + 0.8, { lean: 0, ...POSES.deadpan, ...POSES.armsDown }, 0.3]], talk: ["L38"] }),
      apa({ keys: [[PICK, { hide: true }], [NEI, { hide: false, x: 1700, y: 90, turn: -0.5, ...RIG.EXPR.angry, walk: 1.8 }], [NEI + 0.01, { x: 1000 }, 0.9, eout], [NEI + 0.9, { walk: 0, ...POSES.stand, ...RIG.POSES.point, armR: { sh: 84, el: 2, hand: "point" } }, 0.2], [GIVE + 0.3, { turn: 0.5, ...RIG.EXPR.smug, armR: { sh: 50, el: -30, hand: "fist" }, walk: 1.4 }, 0.2], [GIVE + 0.4, { x: 2600 }, 4, (k) => k]], talk: ["L37"] }),
    ],
    world: (t) => {
      const cx = t < GIVE + 0.4 ? leadX(t) - 250 : lerp(leadX(GIVE) - 250, 2300, win(t, GIVE + 0.4, GIVE + 4.4));
      const walking = (t > PICK && t < NEI) || t > GIVE + 0.4;
      let s = cow(cx, 60, 0.62, { col: "#c98a4a", lashes: true, bell: true, horns: true, uid: 7, walk: walking ? t * 1.4 : null, chew: !walking }, t);
      s += shout(1000, -700, 110, t, S("L37"), E("L37"), 3);
      if (t > S("L37")) s += TX(cx + 200, -560, "БҰРЕНКА", 50, "#ffffff", ` stroke="${INK}" stroke-width="10" paint-order="stroke"`);
      return s;
    },
    type: (t) => TY.pop(t, Wt("L36", 2), "ЕҢ СҰЛУЫ", 520, 220, { size: 96, color: "#ff8fa3", rot: -6, t1: NEI }),
    fx: () => ({ vig: 0.3, dof: 3 }),
  });
  // екінші әрекет: бұқа
  const ACT2 = S("L39") - 0.4, MARK = Wt("L39", 8), HORN = Wt("L39", 12), WH = S("L40") - 0.4, TURN = E("L40") + 0.05, TERR = S("L41") + 1.0, CHARGE = E("L41") + 0.3;
  MK.ACT2 = ACT2; MK.TURN = TURN; MK.CHARGE = CHARGE;
  const bull = (t, head, o) => cow(500, 90, 0.95, Object.assign({ col: "#3a2d2a", bull: true, horns: true, ring: "#d6b04a", uid: 77, head, chew: head < 0.3, angry: head > 0.6, steam: head > 0.6 ? 1 : 0, eye: { lid: head > 0.6 ? 0.3 : 0.45 } }, o || {}), t);
  add({
    t0: ACT2, bg: "pasture", c0: { x: 0, y: -600 },
    cam: [[ACT2, { x: 0, y: -560, z: 1.25 }], [MARK - 0.2, { x: 140, y: -560, z: 1.35 }], [MARK + 0.4, { x: 920, y: -720, z: 1.8 }, eio], [HORN, { x: 960, y: -820, z: 1.9 }], [HORN + 0.5, { x: 860, y: -1000, z: 1.25 }, eout], [WH, { x: 700, y: -820, z: 1.1 }]],
    worldBack: (t) => herd(t, false),
    actors: [artur({ x: -40, y: 90, talk: ["L39"],
      keys: [[ACT2, { turn: 0.4, ...RIG.EXPR.happy, walk: 1.2 }], [ACT2 + 0.01, { x: 60 }, 1.2, eout], [ACT2 + 1.2, { walk: 0, ...POSES.stand }, 0.2], [Wt("L39", 4), { armR: { sh: 120, el: 30, hand: "open" } }, 0.2], [Wt("L39", 6), { armR: { sh: 90, el: 10, hand: "open" } }, 0.15], [Wt("L39", 7), { armR: { sh: 110, el: 20, hand: "open" } }, 0.15], [HORN + 0.5, { ...RIG.EXPR.smug, ...POSES.chest }, 0.3]] })],
    world: (t) => bull(t, 0),
    type: (t) => TY.stamp(t, ACT2 + 0.2, "2-ӘРЕКЕТ", 1450, 200, { size: 80, color: "#3f6fb5", rot: 6, t1: MARK }) + TY.pop(t, HORN + 0.1, "МҮЙІЗІ ДЕ БАР...", 960, 170, { size: 90, color: "#ffffff", t1: WH }),
    fx: () => ({ vig: 0.3 }),
  });
  add({
    t0: WH, bg: "pasture", c0: { x: 0, y: -600 },
    cam: [[WH, { x: -1100, y: -620, z: 1.6 }], [S("L40") + 1.2, { x: -1080, y: -640, z: 1.7 }], [TURN - 0.4, { x: 500, y: -620, z: 1.0 }, eio], [TURN, { x: 760, y: -560, z: 1.35 }], [TURN + 1.6, { x: 920, y: -480, z: 2.2 }, eio], [TERR - 0.1, { x: -10, y: -600, z: 2.2 }], [CHARGE, { x: 20, y: -600, z: 2.6 }]],
    shake: (t) => (t > TURN + 0.2 && t < TURN + 1.2 ? 8 : 0) + (t > CHARGE - 0.4 ? 18 : 0),
    worldBack: (t) => herd(t, false),
    actors: [
      artur({ x: 60, y: 90, keys: [[WH, { turn: 0.4, ...RIG.EXPR.smug, ...POSES.chest }], [TURN, { ...RIG.EXPR.calm }, 0.3], [TERR, { ...RIG.EXPR.scared, mouth: "wavy", ...POSES.armsDown, shakeEyes: true }, 0.1]] }),
      boy({ x: -1100, y: -120, talk: ["L40"], keys: [[WH, { turn: 0.3, ...RIG.EXPR.scared, mouth: "rest", armR: { sh: 40, el: -140, hand: "open" } }]] }),
    ],
    worldBack2: null,
    world: (t) => {
      const head = eio(win(t, TURN, TURN + 1.6));
      let s = bull(t, head, { headY: head * 30, headRot: -head * 8 });
      if (t > CHARGE - 0.4) s += puff(150, 40, t, CHARGE - 0.4, 0.6, 8, "#e6c79a");
      return s;
    },
    nearWorld: () => fence(-2200, -400, 0, "#3f7fc4", null, 260),
    type: (t) => TY.pop(t, Wt("L40", 4), "БҰҚА!", 1450, 220, { size: 140, color: "#e85d75", rot: 8, wob: 3, t1: TURN + 0.4 }),
    fx: (t) => ({ vig: 0.3 + 0.3 * win(t, TURN, TURN + 1.6), tint: "#b5413f", tintA: 0.25 * win(t, TURN + 0.8, TURN + 1.8) }),
  });

  // ========== 5. ҚУУ ==========
  const CH = CHARGE + 0.2, V = 1500, PAST = Wt("L42", 6) - 0.1, ROOJ = S("L43") - 0.2, SHEET = Wt("L43", 2) + 0.4, HAYT = S("L44") - 0.5, JUMP = E("L44") + 0.35, LANDH = JUMP + 2.2, TOP = LANDH + 0.5;
  MK.CH = CH; MK.SHEET = SHEET; MK.JUMP = JUMP; MK.LANDH = LANDH;
  const ax = (t) => -1200 + V * (t - CH);
  const runner = (o) => artur(Object.assign({ y: 120, pos: (t) => ({ x: ax(t) }), mod: (t, p) => run(2.6)(t, p), keys: [[CH, { turn: 0.55, lean: 12, ...RIG.EXPR.scared, mouth: "shock", fx: { sweat: 1 } }]] }, o || {}));
  const bullRun = (t, dx) => cow(ax(t) - (dx || 760) + Math.sin(t * 3) * 60, 120, 0.9, { col: "#3a2d2a", bull: true, horns: true, ring: "#d6b04a", uid: 78, head: 0.15, angry: true, steam: 1, walk: t * 2.4, headRot: 10 }, t) + puff(ax(t) - (dx || 760) - 300, 80, t, Math.floor(t * 4) / 4, 0.5, 5, "#e6c79a");
  add({
    t0: CH, bg: "street", bgArgs: ["evening"], bgKey: "stEve", c0: { x: 0, y: -600 },
    cam: [[CH, { x: ax(CH) + 100, y: -560, z: 0.95, r: -2 }], [ROOJ, { x: ax(ROOJ) + 100, y: -560, z: 1.0, r: 2 }, (k) => k]],
    shake: () => 9, mbScale: 0.55, mbMid: 0.2,
    actors: [runner()],
    world: (t) => {
      let s = bullRun(t);
      for (let i = 0; i < 5; i++) { const gx = -1200 + 1500 * 2.2 + i * 160; const sc = t > CH + 2.0 ? win(t, CH + 2.0, CH + 3) : 0; s += goose(gx + sc * (i % 2 ? 700 : -500), 160 - sc * (300 + i * 60) + sc * sc * 400, 0.75, { flap: sc > 0, flip: i % 2 === 0, seed: i }, t); }
      return s;
    },
    over: (t) => (t > PAST && t < PAST + 1.4 ? `<g transform="translate(1250,250) scale(${f(eout(win(t, PAST, PAST + 0.3)) * (1 - win(t, PAST + 1.1, PAST + 1.4)))})">${C(-120, 140, 20, "#ffffff", 5)}${C(-80, 100, 30, "#ffffff", 5)}${P("M-150,-60 Q-160,-150 -40,-140 Q0,-200 100,-160 Q200,-170 190,-70 Q240,20 140,60 Q60,110 -40,70 Q-170,80 -150,-60Z", "#ffffff", 7)}${TX(20, -70, "АСХАНА", 40, "#e85d75")}<g transform="translate(20,10)">${B.PROPS.pastry().replace("translate(0,30)", "translate(0,0) scale(1.6)")}</g></g>` : ""),
    fx: () => ({ vig: 0.3 }),
  });
  add({
    t0: ROOJ, bg: "street", bgArgs: ["evening"], bgKey: "stEve", c0: { x: 0, y: -600 },
    cam: [[ROOJ, { x: ax(ROOJ) + 300, y: -480, z: 1.35, r: 3 }], [HAYT, { x: ax(HAYT) + 300, y: -500, z: 1.3, r: -2 }, (k) => k]],
    shake: () => 10, mbScale: 0.55, mbMid: 0.2,
    actors: [runner({ keys: [[CH, { turn: 0.55, lean: 12, ...RIG.EXPR.scared, mouth: "shock", fx: { sweat: 1 } }], [SHEET + 0.6, { ...RIG.EXPR.shock, mouth: "aa" }, 0.1]] })],
    world: (t) => {
      let s = rooster(ax(t) + 260, 140, 1.1, { run: t * 3, angry: true, crow: Math.sin(t * 3) > 0.7 ? 1 : 0 }, t);
      s += bullRun(t, 900);
      // кір жайғыш жіп + ақжайма
      const lx = -1200 + V * (SHEET - CH);
      s += Ln(`M${lx - 900},-860 Q${lx},-760 ${lx + 900},-860`, 4);
      if (t < SHEET) s += P(`M${lx - 120},-830 L${lx + 140},-820 L${lx + 150},-470 L${lx - 130},-480Z`, "#ffffff", 5) + `<path d="M${lx - 120},-780 L${lx + 140},-770" stroke="#8fb2d2" stroke-width="8"/>`;
      else if (t < SHEET + 1.1) { const hx = ax(t) + 50, hy = -540; s += `<g transform="translate(${f(hx)},${f(hy)}) rotate(${f(Math.sin(t * 20) * 8)})">${P("M-160,-140 Q0,-200 170,-130 Q200,60 150,190 Q0,160 -150,200 Q-200,40 -160,-140Z", "#ffffff", 6)}${C(-50, 0, 16, INK, 0)}${C(50, 0, 16, INK, 0)}</g>`; }
      else { const k = win(t, SHEET + 1.1, SHEET + 2.4); s += `<g transform="translate(${f(ax(SHEET + 1.1) + 50 - 500 * k)},${f(-540 - 600 * k)}) rotate(${f(k * 200)})" opacity="${f(1 - k)}">${P("M-160,-140 Q0,-200 170,-130 Q200,60 150,190 Q0,160 -150,200 Q-200,40 -160,-140Z", "#ffffff", 6)}</g>`; }
      return s;
    },
    fx: () => ({ vig: 0.3 }),
  });
  // шөп маясы: секіру (баяу)
  const HX = 2600, HSC = 1.4;
  const jumpPos = (t) => {
    if (t < JUMP) return { x: lerp(-200, 1900, win(t, HAYT, JUMP)), y: 120, rot: 0 };
    const k = eio(win(t, JUMP, LANDH));
    return { x: lerp(1900, HX - 40, k), y: lerp(120, -1000, k) - Math.sin(k * Math.PI) * 520, rot: Math.sin(k * Math.PI) * -24 };
  };
  add({
    t0: HAYT, bg: "hayfield", bgArgs: ["evening"], bgKey: "hfEve", c0: { x: 0, y: -600 },
    cam: [[HAYT, { x: 900, y: -700, z: 0.62 }], [JUMP - 0.3, { x: jumpPos(JUMP - 0.3).x + 200, y: -680, z: 0.95 }, (k) => k],
      [JUMP + 0.7, { x: jumpPos(JUMP + 0.7).x + 160, y: jumpPos(JUMP + 0.7).y - 520, z: 1.12, r: -3 }], [JUMP + 1.5, { x: jumpPos(JUMP + 1.5).x + 120, y: jumpPos(JUMP + 1.5).y - 500, z: 1.2, r: 2 }, (k) => k],
      [LANDH, { x: HX, y: -1420, z: 1.25, r: 3 }, (k) => k], [TOP, { x: HX, y: -1380, z: 1.15 }]],
    mbScale: 0.35, mbMid: 0.15,
    shake: (t) => (t < JUMP ? 8 : t > LANDH && t < LANDH + 0.5 ? 26 * (1 - win(t, LANDH, LANDH + 0.5)) : 0),
    worldBack: () => haystack(HX, 0, HSC),
    actors: [artur({ pos: jumpPos,
      mod: (t, p) => { if (t < JUMP) return run(2.6)(t, p); if (t < LANDH) { p.legL = { a: 30, k: 40 }; p.legR = { a: -10, k: 10 }; p.armL = { sh: 150, el: 20, hand: "open" }; p.armR = { sh: 160, el: 10, hand: "open" }; } return p; },
      keys: [[HAYT, { turn: 0.55, lean: 12, ...RIG.EXPR.scared, mouth: "shock", fx: { sweat: 1 } }], [JUMP, { ...POSES.determined, mouth: "growl", lean: 0 }, 0.3], [LANDH, { ...RIG.EXPR.shock, mouth: "oh", ...POSES.sitFloor }, 0.08]] })],
    world: (t) => {
      let s = "";
      const bx = t < JUMP ? jumpPos(t).x - 900 : lerp(1000, HX - 900, eout(win(t, JUMP, LANDH)));
      s += cow(bx, 140, 0.9, { col: "#3a2d2a", bull: true, horns: true, ring: "#d6b04a", uid: 79, head: 0.15, angry: true, steam: 1, walk: t < LANDH ? t * (t < JUMP ? 2.4 : 0.6) : null, headRot: 10 }, t);
      s += puff(HX - 40, -1000, t, LANDH, 0.9, 14, "#f2d38a");
      for (let i = 0; i < 12; i++) { const k = win(t, LANDH, LANDH + 1.4); if (k <= 0 || k >= 1) continue; const a = hash(i) * 3.1 + 3.3; s += Ln(`M${f(HX - 40 + Math.cos(a) * 300 * k)},${f(-1000 + Math.sin(a) * 300 * k + 400 * k * k)} l14,-30`, 6, "#d9a84a", ` opacity="${f(1 - k)}"`); }
      return s;
    },
    type: (t) => TY.pop(t, Wt("L44", 2), "ЖАЛҒЫЗ ҮМІТ", 960, 200, { size: 96, color: "#f6d55c", t1: JUMP }),
    fx: (t) => { const sl = win(t, JUMP, JUMP + 0.3) * (1 - win(t, LANDH - 0.2, LANDH)); return { dof: 2 + 6 * sl, vig: 0.3 + 0.3 * sl, lb: sl, bright: 1 + 0.08 * sl }; },
  });
  // маяның үстінде: бұқа шөп жейді, телефон толық интернет
  const BARS = Wt("L45", 7), NOTE = Wt("L45", 8) + 0.1, DOWN = S("L46") + 0.3, VISTA = S("L47") - 0.35, HOLD = E("L47") + 0.6;
  MK.BARS = BARS; MK.NOTE = NOTE; MK.VISTA = VISTA;
  const sitTop = (keys, talk) => artur({ x: HX - 40, y: -1008 + 300 * 0.75 * 0.0, keys: [[0, { turn: 0.1, ...POSES.sitFloor, ...RIG.EXPR.calm }]].concat(keys || []), talk });
  const munchBull = (t, x) => cow(x || HX - 900, 140, 0.9, { col: "#3a2d2a", bull: true, horns: true, ring: "#d6b04a", uid: 80, head: 0, chew: true, headY: 110, headRot: 34, eye: { lid: 0.55 } }, t);
  add({
    t0: TOP, bg: "hayfield", bgArgs: ["evening"], bgKey: "hfEve", c0: { x: 0, y: -600 },
    cam: [[TOP, { x: HX - 400, y: -900, z: 0.72 }], [BARS - 0.4, { x: HX - 200, y: -1200, z: 1.05 }], [DOWN, { x: HX - 40, y: -1500, z: 1.9 }], [VISTA, { x: HX - 40, y: -1520, z: 2.05 }]],
    worldBack: () => haystack(HX, 0, HSC),
    actors: [sitTop([[TOP, { ...POSES.tired, armL: { sh: 20, el: -40, hand: "open" } }], [S("L45") - 0.3, { ...RIG.EXPR.calm, ...POSES.phoneUp }, 0.3], [BARS, { ...RIG.EXPR.shock, mouth: "oh" }, 0.1], [DOWN, { ...POSES.warm, ...POSES.lookUp, ...POSES.armsDown }, 0.6]])],
    world: (t) => munchBull(t) + rooster(HX + 260, -980, 0.9, { flip: true }, t) + (t > TOP + 0.5 ? TX(HX - 900, -620, "ХРУМ-ХРУМ", 44, "#ffffff", ` stroke="${INK}" stroke-width="8" paint-order="stroke" opacity="${f(0.5 + 0.5 * Math.sin(t * 6))}"`) : ""),
    over: (t) => {
      if (t < S("L45") || t > DOWN + 0.4) return "";
      const kin = eout(win(t, S("L45"), S("L45") + 0.4)), kout = 1 - win(t, DOWN, DOWN + 0.4);
      const full = t > BARS;
      let inner = bars(-160, -330, full ? 4 : 1, 0.9) + (full ? TX(-30, -332, "4G", 30, INK) : "");
      if (t > NOTE) { const n = Math.min(147, Math.floor((t - NOTE) * 90)); for (let i = 0; i < Math.min(7, Math.floor((t - NOTE) * 8)); i++) inner += `${RR(-165, -270 + i * 90, 330, 76, "#ffffff", 4, 16)}${C(-120, -232 + i * 90, 22, ["#3f6fb5", "#e85d75", "#5fa36a"][i % 3], 0)}${RF(-80, -250 + i * 90, 200, 12, "#c9ccd6", 6)}${RF(-80, -228 + i * 90, 140, 12, "#e2e5ec", 6)}`; inner += `${C(140, -340, 34, "#e8423a", 5)}${TX(140, -328, String(n), 30, "#ffffff")}`; }
      return phoneUI(1450, 560, 0.95 * kin * kout, inner);
    },
    type: (t) => TY.pop(t, BARS + 0.05, "ТОЛЫҚ ИНТЕРНЕТ!", 620, 200, { size: 90, color: "#7fd1ff", t1: DOWN }),
    fx: (t) => ({ vig: 0.25, bright: 1 + 0.06 * win(t, DOWN, VISTA) }),
  });
  // күн батысы: ең кең план
  add({
    t0: VISTA, bg: "hayfield", bgArgs: ["sunset", { sunX: HX + 700, sunY: -1500 }], bgKey: "hfSun", c0: { x: HX, y: -1200 },
    cam: [[VISTA, { x: HX - 60, y: -1480, z: 1.9, r: 0 }], [VISTA + 3.5, { x: HX + 200, y: -1500, z: 0.75, r: -2 }, eio], [HOLD + 2.5, { x: HX + 400, y: -1450, z: 0.36, r: 0 }, eio]],
    worldBack: (t) => {
      let s = "";
      for (let i = 0; i < 14; i++) { const x = -2600 + i * 420 + (t - VISTA) * 60, y = -470 + (i % 3) * 30; s += cow(x, y, 0.22, { col: "#4a3040", mark: false, horns: i % 3 === 0, uid: 200 + i, walk: t * 1.2 + i * 0.3 }, t); }
      return s + haystack(HX, 0, HSC);
    },
    actors: [sitTop([[VISTA, { turn: 0.85, ...POSES.warm, ...POSES.lookUp }]])],
    world: (t) => munchBull(t) + rooster(HX + 220, -980, 0.9, { flip: false }, t),
    fx: (t) => ({ vig: 0.35, tint: "#ff9a5a", tintA: 0.15, dof: 2, lb: 0.6 }),
    type: (t) => TY.pop(t, Wt("L47", 9) - 0.1, "ТЕЛЕФОНСЫЗ", 960, 180, { size: 70, color: "#fff3d6", stroke: 0, weight: 300, ls: 16, from: 0.9, style: "font-style:italic;text-shadow:0 0 30px rgba(255,180,90,0.9);", t1: HOLD + 1.5 }),
  });

  // ========== 6. ТҮЙІН ==========
  const WALK = S("L48") - 0.6, BARN = S("L49") - 0.5, AQ = Wt("L50", 0) - 0.3, AJ = S("L51") - 0.3, AR2 = S("L52") - 0.4, TWO = S("L53") - 0.4;
  MK.WALK = WALK; MK.BARN = BARN;
  add({
    t0: WALK, bg: "street", bgArgs: ["night"], bgKey: "stNight", c0: { x: 0, y: -600 }, fadeIn: 0.6,
    cam: [[WALK, { x: -1400, y: -620, z: 0.9 }], [BARN, { x: -400, y: -620, z: 0.95 }, (k) => k]],
    actors: [artur({ x: -1700, y: 90, keys: [[WALK, { turn: 0.55, ...RIG.EXPR.sad, walk: 0.8, walkAmp: 12, headY: 20, armR: { sh: 18, el: -6, hand: "fist", prop: AP.rope(200) } }], [WALK + 0.01, { x: -100 }, BARN - WALK, (k) => k]] })],
    fx: () => ({ vig: 0.5, dim: 0.1 }),
  });
  const milkArm = (t, p) => { p.armL = { sh: 40 + Math.max(0, Math.sin(t * 7)) * 18, el: -70, hand: "fist" }; p.armR = { sh: 40 + Math.max(0, -Math.sin(t * 7)) * 18, el: -70, hand: "fist" }; return p; };
  const barnCow = (t) => aktandak(1150, 60, 0.85, t);
  const barnAje = (keys) => aje({ x: 520, y: 60, talk: ["L49", "L51", "L53"], mod: (t, p) => (t < AJ ? milkArm(t, p) : p), keys: [[0, { turn: 0.45, ...POSES.sitFloor, ...RIG.EXPR.calm, eye: { lidTop: 0.5 } }]].concat(keys || []) });
  const barnArtur = (keys) => artur({ x: -500, y: 60, talk: ["L50", "L52"], keys: [[0, { turn: 0.35, ...RIG.EXPR.sad, armR: { sh: 18, el: -6, hand: "fist", prop: AP.rope(150) } }]].concat(keys || []) });
  const barnWorld = (t) => BG.stool(520, 60) + bucket(740, 60, 0.6, t > BARN + 1) + (t < AJ ? Ln(`M${720 + Math.sin(t * 7) * 6},-130 L740,-60`, 4, "#ffffff", ' opacity="0.8"') : "") + BG.lamp(200, -1150, t);
  const barnKeysAje = [[AJ, { turn: -0.3, ...POSES.warm, eye: { lidTop: 0.42, lidBot: 0.3 }, ...POSES.armsDown }, 0.5], [Wt("L51", 5), { ...RIG.EXPR.calm, eye: { lidTop: 0.35 } }, 0.3], [TWO, { ...RIG.EXPR.happy, eye: { lidTop: 0.5, lidBot: 0.4 } }, 0.4]];
  const barnKeysArtur = [[AQ, { ...RIG.EXPR.calm, ...POSES.armsDown, ...POSES.lookR }, 0.3], [Wt("L51", 5), { ...RIG.EXPR.sad, eye: { py: 0.4 } }, 0.4], [AR2, { ...POSES.warm, eye: { lidTop: 0.45, lidBot: 0.35 } }, 0.5]];
  const barnShot = (t0, cam, extra) => add(Object.assign({
    t0, bg: "barn", c0: { x: 300, y: -560 }, cam,
    worldBack: (t) => barnCow(t),
    actors: [barnArtur(barnKeysArtur), barnAje(barnKeysAje)],
    world: barnWorld,
    fx: () => ({ vig: 0.55, dof: 4, tint: "#ffb35a", tintA: 0.12 }),
  }, extra || {}));
  barnShot(BARN, [[BARN, { x: 200, y: -620, z: 0.85 }], [AQ, { x: 380, y: -560, z: 1.05 }]], { fadeIn: 0.4 });
  barnShot(AQ, [[AQ, { x: -480, y: -620, z: 2.0 }], [AJ, { x: -470, y: -630, z: 2.1 }]]);
  barnShot(AJ, [[AJ, { x: 530, y: -540, z: 2.1 }], [AR2, { x: 520, y: -550, z: 2.25 }]]);
  barnShot(AR2, [[AR2, { x: -480, y: -620, z: 2.2 }], [TWO, { x: -480, y: -630, z: 2.35 }]]);
  barnShot(TWO, [[TWO, { x: 0, y: -600, z: 1.3 }], [E("L53") + 1.6, { x: 20, y: -620, z: 1.45 }]]);
  // орындық, түн, ата
  const BEN = E("L53") + 1.6, ATAIN = S("L54") + 0.2, SIT = Wt("L54", 4) + 0.2, FLASH = Wt("L55", 3), MET = Wt("L55", 10), REC = S("L56") - 0.3;
  MK.BEN = BEN; MK.FLASH = FLASH; MK.MET = MET; MK.REC = REC;
  const youngAta = { hair: "dad", brow: "thick2", mustache: true, body: { w: 1.02, arm: 46, leg: 52 } };
  const youngAje = { hair: "scarf", brow: "thin", lashes: true, body: { w: 0.95, arm: 42, leg: 46 } };
  const photo = (t) => {
    let inner = RF(-330, -260, 660, 520, "#e8c88a") + `<g transform="translate(0,230) scale(0.4)">${haystack(0, 0, 1)}</g>`;
    inner += `<g transform="translate(-60,-55) scale(0.26)">${RIG.draw(Object.assign({}, RIG.EXPR.shock, { look: youngAta, outfit: "ata", turn: 0.3, ...POSES.sitFloor }), { id: "ya" })}</g>`;
    inner += `<g transform="translate(70,-55) scale(0.26)">${RIG.draw(Object.assign({}, RIG.EXPR.happy, { look: youngAje, outfit: "aje", turn: -0.3, ...POSES.sitFloor }), { id: "yj" })}</g>`;
    inner += `<g transform="translate(-200,250) scale(0.3)">${cow(0, 0, 1, { col: "#3a2d2a", bull: true, horns: true, uid: 81, angry: true }, t)}</g>`;
    if (t > MET) { const k = spring((t - MET) / 0.6, 12, 6); inner += `<g transform="translate(5,-200) scale(${f(k)})">${P("M0,30 Q-60,-20 -40,-60 Q-20,-90 0,-60 Q20,-90 40,-60 Q60,-20 0,30Z", "#e8423a", 6)}</g>`; }
    return inner;
  };
  add({
    t0: BEN, bg: "yardV", bgArgs: ["night", { bench: 0 }], bgKey: "yardNight", c0: { x: 0, y: -600 },
    cam: [[BEN, { x: 0, y: -1100, z: 0.7 }], [ATAIN, { x: 0, y: -700, z: 1.0 }, eio], [SIT + 1, { x: 0, y: -640, z: 1.25 }], [S("L55") - 0.2, { x: 40, y: -640, z: 1.35 }], [FLASH, { x: -380, y: -640, z: 1.4 }], [REC, { x: -300, y: -640, z: 1.5 }]],
    actors: [
      Object.assign(benchAta([[BEN, { hide: true }], [ATAIN, { hide: false, x: 1300, turn: -0.5, walk: 0.8, walkAmp: 10, legL: { a: 3, k: 0 }, legR: { a: 3, k: 0 }, ...RIG.EXPR.calm }], [ATAIN + 0.01, { x: 190 }, SIT - ATAIN - 0.2, (k) => k], [SIT - 0.2, { walk: 0, turn: -0.15, ...POSES.sitFloor }, 0.4], [S("L55") - 0.3, { ...RIG.EXPR.calm, eye: { lidTop: 0.3 } }, 0.4], [MET, { ...POSES.warm }, 0.4]]), { talk: ["L55"] }),
      artur({ x: -190, y: -2, keys: [[BEN, { turn: 0.1, ...POSES.sitFloor, ...RIG.EXPR.calm, ...POSES.lookUp }], [SIT, { ...POSES.lookR }, 0.4], [Wt("L55", 3), { ...RIG.EXPR.shock, mouth: "oh", ...POSES.lookR }, 0.15], [REC + 0.2, { ...RIG.EXPR.shock, mouth: "shock", ...POSES.lookR }, 0.1]] }),
    ],
    over: (t) => {
      if (t < FLASH) return "";
      const k = spring((t - FLASH) / 0.7, 12, 6) * (1 - win(t, REC + 1.6, REC + 2.0));
      return `<g transform="translate(1420,470) scale(${f(Math.max(0, k))}) translate(-1420,-470)">${card(1420, 430, 660, 520, -5, photo(t))}${TX(1420, 790, "50 ЖЫЛ БҰРЫН", 46, INK, ' transform="rotate(-5 1420 790)"')}</g>`;
    },
    type: (t) => TY.stamp(t, REC + 0.4, "12 СӨЗ — РЕКОРД!", 960, 200, { size: 80, color: "#e85d75", rot: -6 }),
    fx: (t) => ({ vig: 0.45, sepia: t > FLASH ? 0 : 0 }),
  });

  // ========== 7. КЕТУ + ҚОҢЫРАУ ==========
  const BUS = E("L56") + 0.45, GIFT = S("L57") - 0.2, SINK = Wt("L57", 2), CITY = E("L57") + 1.0, DIAL = Wt("L58", 8) - 0.1, SPLIT = S("L59") - 0.35, HOSTE = S("L60") - 0.6;
  MK.BUS = BUS; MK.SINK = SINK; MK.CITY = CITY; MK.DIAL = DIAL; MK.SPLIT = SPLIT;
  add({
    t0: BUS, bg: "aulRoad", bgArgs: ["dawn"], bgKey: "arDawn", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[BUS, { x: -300, y: -640, z: 0.95 }], [GIFT + 0.3, { x: -420, y: -600, z: 1.2 }], [CITY, { x: -450, y: -620, z: 1.3 }]],
    actors: [
      artur({ x: -560, y: 40, keys: [[BUS, { turn: 0.3, ...RIG.EXPR.calm }], [GIFT + 0.4, { ...RIG.EXPR.happy, armL: { sh: 60, el: -40, hand: "open" }, armR: { sh: 60, el: -40, hand: "open" } }, 0.3], [SINK, { ...RIG.EXPR.shock, mouth: "oh", squash: 0.82, legL: { a: 14, k: 30 }, legR: { a: 14, k: 30 } }, 0.12]] }),
      aje({ x: -180, y: 40, talk: ["L57"], keys: [[BUS, { turn: -0.35, ...RIG.EXPR.happy, armL: { sh: 70, el: -40, hand: "open" }, armR: { sh: 70, el: -40, hand: "open" } }], [SINK + 0.3, { ...POSES.warm, ...RIG.POSES.wave }, 0.3]] }),
      Object.assign(ata({ x: 300, y: 40, keys: [[BUS, { turn: -0.35, ...RIG.EXPR.calm, armR: { sh: 26, el: -30, hand: "fist", prop: AP.cane() } }], [SINK + 0.6, { armL: { sh: 138, el: 34, hand: "open" } }, 0.3]] })),
    ],
    world: (t) => { const k = win(t, GIFT, GIFT + 0.5); const x = lerp(-180, -440, k), y = 40 - 0 * k; return bag(t < SINK ? x : -440, t < SINK ? y - 60 : 40, 0.55); },
    type: (t) => TY.pop(t, SINK + 0.05, "+20 КГ", 520, 220, { size: 110, color: "#f6d55c", rot: -8, t1: CITY - 0.2 }),
  });
  add({
    t0: CITY, bg: "city", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[CITY, { x: 0, y: -620, z: 1.05 }], [DIAL, { x: -120, y: -600, z: 1.3 }], [SPLIT, { x: -400, y: -600, z: 1.35 }], [HOSTE, { x: -420, y: -610, z: 1.4 }]],
    actors: [artur({ x: -100, y: 60, talk: ["L58"], keys: [[CITY, { turn: 0.2, ...RIG.EXPR.calm }], [S("L58") + 0.6, { ...POSES.phoneUp, ...POSES.lookL }, 0.3], [DIAL, { ...RIG.EXPR.happy, armL: { sh: 30, el: -150, hand: "fist", propFront: B.PROPS.phone() } }, 0.3], [SPLIT + 0.4, { ...RIG.EXPR.laugh }, 0.3]] })],
    world: (t) => bag(260, 60, 0.55),
    over: (t) => {
      if (t < SPLIT) return t > DIAL - 0.4 && t < SPLIT ? phoneUI(1480, 560, 0.8 * eout(win(t, DIAL - 0.4, DIAL)), `${C(0, -160, 80, "#e9c9a0", 5)}${TX(0, 0, "ӘЖЕМ", 54, INK)}${TX(0, 70, "қоңырау...", 34, "#6b7280")}${C(0, 260, 50, "#5fa36a", 5)}`) : "";
      const k = eout(win(t, SPLIT, SPLIT + 0.4));
      const x0 = lerp(1920, 1000, k);
      let s = `<clipPath id="spl"><path d="M${f(x0)},0 L1920,0 L1920,1080 L${f(x0 - 120)},1080Z"/></clipPath><g clip-path="url(#spl)">`;
      s += RF(800, 0, 1200, 1080, "#bfe3fb") + RF(800, 760, 1200, 320, "#9fbf72");
      s += `<g transform="translate(1500,760) scale(0.32)">${house(0, 0, 1)}</g>`;
      s += `<g transform="translate(1420,1060) scale(0.62)">${RIG.draw(Object.assign({}, RIG.EXPR.happy, { look: "aje", outfit: "aje", turn: -0.2, armR: { sh: 30, el: -150, hand: "fist", propFront: B.PROPS.phone() }, mouth: (() => { const l = LN.L59; if (!l || t < l.start || t > l.end + 0.05) return "smile"; for (const [c, s0, e0] of l.chars) if (t >= s0 && t < e0) return RIG.letterViseme(c); return "rest"; })() }), { id: "spa", seed: Math.floor(t * 12) })}</g>`;
      s += `</g>` + `<path d="M${f(x0)},0 L${f(x0 - 120)},1080" stroke="${INK}" stroke-width="10"/>`;
      return s;
    },
    fx: () => ({ vig: 0.25 }),
  });

  // ========== соңы: жүргізуші ==========
  const TIP1 = Wt("L60", 3), TIP1B = Wt("L60", 8), TIP2 = Wt("L61", 0), CTA = S("L62") - 0.1, ATAE = S("L63") - 1.1, END = E("L64") + 0.5;
  MK.HOSTE = HOSTE; MK.TIP1 = TIP1; MK.TIP2 = TIP2; MK.CTA = CTA; MK.ATAE = ATAE; MK.END = END;
  add({
    t0: HOSTE, bg: "host", bgArgs: [["#cfe9b0", "#8cc46a"]], bgKey: "hostG2", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[HOSTE, { x: 0, y: -600, z: 1.05 }], [TIP2, { x: -60, y: -600, z: 1.1 }], [CTA, { x: 0, y: -590, z: 1.0 }], [ATAE + 0.3, { x: 160, y: -580, z: 0.95 }], [END, { x: 160, y: -600, z: 1.0 }], [END + 5, { x: 160, y: -620, z: 1.06 }]],
    actors: [
      hostArtur([[HOSTE, { turn: 0.15, ...RIG.EXPR.happy }], [TIP1, { ...RIG.POSES.point, armR: { sh: 150, el: 10, hand: "point" } }, 0.2], [TIP1 + 1.0, { ...RIG.POSES.idle, armR: { sh: 11, el: -7, hand: "rest" } }, 0.3], [TIP2, { ...RIG.EXPR.smug, armR: { sh: 150, el: 10, hand: "point" } }, 0.2], [TIP2 + 1.2, { ...POSES.armsDown }, 0.3], [CTA, { ...RIG.EXPR.happy, ...RIG.POSES.shrug }, 0.3], [ATAE + 0.4, { turn: 0.4, ...POSES.lookR, ...POSES.armsDown }, 0.3], [S("L64"), { turn: 0.15, ...RIG.EXPR.laugh, ...RIG.POSES.wave }, 0.25]], ["L60", "L61", "L62", "L64"]),
      Object.assign(ata({ s: 1.1, talk: ["L63"], keys: [[HOSTE, { hide: true }], [ATAE, { hide: false, x: 1700, y: 330, turn: -0.5, walk: 0.9, walkAmp: 10, ...RIG.EXPR.calm, armR: { sh: 26, el: -30, hand: "fist", prop: AP.cane() } }], [ATAE + 0.01, { x: 820 }, 1.0, eout], [ATAE + 1.0, { walk: 0, ...POSES.stand, turn: -0.2 }, 0.2], [S("L63"), { headY: 14 }, 0.15], [E("L63") + 0.1, { headY: 0 }, 0.2], [S("L64") + 0.6, { armL: { sh: 138, el: 34, hand: "open" } }, 0.3]] })),
    ],
    over: (t) => {
      let s = "";
      const box = (t0, t1, x, y, title, icon, col) => {
        if (t < t0 || t > t1 + 0.3) return "";
        const k = spring((t - t0) / 0.7, 12, 6) * (1 - win(t, t1, t1 + 0.3));
        return `<g transform="translate(${x},${y}) scale(${f(Math.max(0, k))}) rotate(-3)">${RR(-420, -120, 860, 240, "#ffffff", 8, 30)}${C(-320, 0, 76, col, 6)}${icon.replace("translate(-260,", "translate(-320,")}${TX(90, 16, title, 46, INK)}</g>`;
      };
      s += box(TIP1, TIP2 - 0.4, 520, 300, "ӘЖЕҢЕ ҚОҢЫРАУ ШАЛ", `<g transform="translate(-260,0) scale(0.6)">${B.PROPS.phone("#bfe3fb").replace("translate(0,34)", "translate(0,0)")}</g>`, "#5fa36a");
      s += box(TIP2, CTA - 0.3, 520, 300, "МҮЙІЗІНЕ ҚАРА!", `<g transform="translate(-260,30) scale(0.42)">${cowFace(0, 0, 1, "#3a2d2a", { horns: true })}</g>`, "#e8775a");
      if (t > CTA && t < END) { const k = spring((t - CTA) / 0.7, 12, 6); s += `<g transform="translate(470,300) scale(${f(k)})">${P("M-170,-110 Q-170,-150 -130,-150 L130,-150 Q170,-150 170,-110 L170,50 Q170,90 130,90 L-20,90 L-90,150 L-80,90 L-130,90 Q-170,90 -170,50Z", "#ffffff", 8)}${C(-60, -30, 16, INK, 0)}${C(0, -30, 16, INK, 0)}${C(60, -30, 16, INK, 0)}</g>`; }
      if (t > END) { const k = win(t, END, END + 0.6); s += RF(0, 0, 1920, 1080, "#2f4a2a", 0, ` opacity="${f(0.93 * k)}"`); }
      return s;
    },
    type: (t) => {
      let s = TY.stamp(t, TIP1 - 0.2, "1", 210, 300, { size: 90, color: "#3f6fb5", rot: -8, t1: TIP2 - 0.4 }) + TY.stamp(t, TIP2 - 0.1, "2", 210, 300, { size: 90, color: "#e85d75", rot: 8, t1: CTA - 0.3 });
      s += TY.pop(t, Wt("L62", 7), "КОММЕНТАРИЙГЕ ЖАЗ!", 1380, 220, { size: 70, color: "#f6d55c", rot: 4, t1: ATAE + 0.2 });
      if (t > END + 0.2) s += TY.swing(t, END + 0.25, "ӘЖЕМНІҢ АУЫЛЫ", 960, 470, { size: 120 }) + TY.pop(t, END + 1.2, "Артурдың оқиғасы · 2-бөлім", 960, 620, { size: 50, color: "#ffffff", stroke: 9, weight: 700 });
      return s;
    },
    fx: (t) => ({ dim: win(t, END + 3.8, END + 4.7) }),
  });

  G.SONGY_TOTAL = END + 4.8;
  G.SONGY_MARKS = Object.assign(G.SONGY_MARKS || {}, MK, { HERD, LOW, PICK, NEI, GIVE, ACT2, MARK, HORN, WH, TURN, TERR, CHARGE, CH, PAST, ROOJ, SHEET, HAYT, JUMP, LANDH, TOP, BARS, NOTE, DOWN, VISTA, HOLD, WALK, BARN, AQ, AJ, AR2, TWO, BEN, ATAIN, SIT, FLASH, MET, REC, BUS, GIFT, SINK, CITY, DIAL, SPLIT, HOSTE, TIP1, TIP1B, TIP2, CTA, ATAE, END });
})(typeof window !== "undefined" ? window : globalThis);
