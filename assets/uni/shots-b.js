/* «Бірінші курс» — кадрлар, 2-бөлім: өршу (412-бөлме, Роза апай) → қуу → slow-mo тайғақ еден → 312-бөлме дастарқаны → түйін (~188 с … ~326 с). */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, U = G.UNI_BG, RIG = G.ArturRig, H = G.UNI_H;
  const { S, E, LN, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { BG, P, F, Ln, RF, C, T: TX, INK, rng, f } = B;
  const RR = B.R;
  const { bag, qurt, pan, wetSign, platter, FOOD, PROPS: UP } = U;
  const { Wt, POSES, puff, speed, shout, phoneUI, card, artur, serik, dauren, roza, askar, maskGirl, hostArtur } = H;
  const SH = G.SONGY_SHOTS;
  const add = (o) => SH.push(o);
  const MK = {};

  const run = (spd) => (t, p) => {
    const ph = t * spd * 6.283;
    p.legL = { a: Math.sin(ph) * 30, k: Math.max(0, Math.sin(ph)) * 26 };
    p.legR = { a: -Math.sin(ph) * 30, k: Math.max(0, -Math.sin(ph)) * 26 };
    p.y = (p.y || 0) - Math.abs(Math.cos(ph)) * 16;
    p.armL = { sh: 40 + Math.sin(ph) * 40, el: -60, hand: "fist" };
    p.armR = { sh: 40 - Math.sin(ph) * 40, el: -60, hand: "fist" };
    return p;
  };

  // ========== 4. ӨРШУ: БЕС ҚАБАТТЫҚ ОПЕРАЦИЯ ==========
  const OP0 = S("L37") - 0.35, ACT1 = S("L38") - 0.25, SCRM = S("L39") - 0.1, ACT2 = S("L41") - 0.25, BOSS = S("L42") - 0.15;
  MK.OP0 = OP0; MK.ACT1 = ACT1; MK.SCRM = SCRM; MK.ACT2 = ACT2; MK.BOSS = BOSS;

  // Баспалдақпен жүгіру + таймер (03:00)
  add({
    t0: OP0, bg: "dormStairs", bgArgs: ["4"], bgKey: "st4", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[OP0, { x: 180, y: -680, z: 1.0, r: 3 }], [ACT1 - 0.1, { x: -320, y: -420, z: 1.18, r: -3 }]],
    shake: () => 8, mbScale: 0.45,
    actors: [
      artur({
        x: 0, y: 0, talk: ["L37"],
        pos: (t) => {
          const k = win(t, OP0, ACT1);
          return { x: lerp(360, -640, k), y: lerp(-460, -60, k) };
        },
        mod: (t, p) => run(2.5)(t, p),
        keys: [[OP0, { turn: -0.55, lean: -12, ...POSES.determined }]],
      }),
      dauren({
        x: 0, y: 0,
        pos: (t) => {
          const k = win(t, OP0, ACT1);
          return { x: lerp(680, -300, k), y: lerp(-580, -180, k) };
        },
        mod: (t, p) => run(2.4)(t, p),
        keys: [[OP0, { turn: -0.55, ...POSES.determined }]],
      }),
    ],
    over: (t) => {
      const sec = Math.max(0, 180 - Math.floor((t - OP0) * 14));
      const mm = "0" + Math.floor(sec / 60), ss = String(sec % 60).padStart(2, "0");
      return `<g transform="translate(1660,130)">${RR(-180, -64, 360, 128, "#1f2027", 7, 22)}${TX(0, 22, `${mm}:${ss}`, 74, "#ff5252")}</g>`;
    },
    type: (t) => TY.stamp(t, Wt("L37", 0), "ОПЕРАЦИЯ: ҚАЗЫ!", 640, 190, { size: 92, color: "#f6d55c", rot: -5, t1: ACT1 - 0.1 }),
    fx: () => ({ vig: 0.3 }),
  });

  // 1-әрекет: 412-бөлме (бетіне жасыл маска мен қияр қойған қыздар!)
  add({
    t0: ACT1, bg: "dormRoom", c0: { x: 0, y: -520 }, flashIn: 0.15,
    cam: [[ACT1, { x: -120, y: -520, z: 1.15 }], [SCRM, { x: 60, y: -540, z: 1.45, r: -3 }], [S("L40"), { x: -240, y: -520, z: 1.38, r: 2 }]],
    shake: (t) => (t >= SCRM && t < SCRM + 0.5 ? 20 * (1 - win(t, SCRM, SCRM + 0.5)) : 0),
    actors: [
      artur({
        x: -540, y: 60, talk: ["L38", "L40"],
        keys: [
          [ACT1, { turn: 0.4, ...RIG.EXPR.happy }],
          [SCRM, { ...RIG.EXPR.scared, mouth: "aa", lean: -16, ...RIG.POSES.cheer }, 0.08],
          [S("L40"), { ...RIG.EXPR.shock, fx: { sweat: 1, blush: 0.8 }, ...RIG.POSES.wave }, 0.15],
        ],
      }),
      maskGirl({
        x: 240, y: 60, talk: ["L39"],
        keys: [
          [ACT1, { turn: -0.3, ...RIG.EXPR.calm }],
          [SCRM, { ...RIG.EXPR.shock, mouth: "aa", ...RIG.POSES.cheer }, 0.08],
        ],
      }),
      maskGirl({
        x: 620, y: 60, seed: 77,
        keys: [
          [ACT1, { turn: -0.35, ...RIG.EXPR.calm }],
          [SCRM, { ...RIG.EXPR.shock, mouth: "aa", ...RIG.POSES.cheer }, 0.08],
        ],
      }),
    ],
    world: (t) => {
      // жасыл маска мен ұшып кеткен қияр тілімдері
      const k = win(t, SCRM, SCRM + 0.8);
      let s = `<circle cx="240" cy="-648" r="112" fill="#66bb6a" opacity="0.55"/><circle cx="620" cy="-648" r="112" fill="#66bb6a" opacity="0.55"/>`;
      for (const cx of [210, 270, 590, 650]) {
        s += C(cx + (cx % 20 === 10 ? -1 : 1) * k * 220, -660 - k * 260 + k * k * 520, 24, "#81c784", 4);
      }
      s += shout(240, -720, 120, t, SCRM, E("L39"), 3);
      return s;
    },
    type: (t) => TY.stamp(t, ACT1 + 0.1, "1-ӘРЕКЕТ: 412-БӨЛМЕ", 960, 180, { size: 84, color: "#e85d75", rot: -4, t1: SCRM }) + TY.pop(t, SCRM, "ҚЫЗДАР БӨЛМЕСІ!", 960, 200, { size: 102, color: "#ff8fa3", rot: 5, t1: ACT2 - 0.1 }),
    fx: () => ({ vig: 0.28 }),
  });

  // 2-әрекет: Босс — Вахтер Роза апай!
  add({
    t0: ACT2, bg: "dormCorridor", bgArgs: [3, { targetDoor: 312 }], bgKey: "cor3a", c0: { x: 0, y: -520 }, flashIn: 0.15,
    cam: [[ACT2, { x: -200, y: -520, z: 1.1 }], [BOSS, { x: 260, y: -560, z: 1.5, r: 3 }]],
    shake: (t) => (t >= BOSS && t < BOSS + 0.5 ? 20 * (1 - win(t, BOSS, BOSS + 0.5)) : 0),
    actors: [
      artur({
        x: -480, y: 60, talk: ["L41"],
        keys: [
          [ACT2, { turn: 0.4, ...POSES.determined }],
          [BOSS, { ...RIG.EXPR.scared, mouth: "wavy", shakeEyes: true, lean: -12 }, 0.1],
        ],
      }),
      dauren({
        x: -820, y: 60,
        keys: [
          [ACT2, { turn: 0.4, ...POSES.determined }],
          [BOSS, { ...RIG.EXPR.shock, mouth: "oh" }, 0.1],
        ],
      }),
      roza({
        x: 560, y: 60, talk: ["L42"],
        keys: [
          [ACT2, { turn: -0.4, ...RIG.EXPR.angry, armL: { sh: 85, el: -20, hand: "fist", prop: UP.mop() }, armR: { sh: 110, el: 20, hand: "point" } }],
        ],
      }),
    ],
    world: (t) => shout(560, -680, 140, t, BOSS, E("L42"), 4),
    type: (t) => TY.stamp(t, ACT2 + 0.1, "2-ӘРЕКЕТ", 520, 190, { size: 82, color: "#3f6fb5", rot: -5, t1: BOSS }) + TY.pop(t, BOSS + 0.05, "БОСС: РОЗА АПАЙ!", 960, 200, { size: 108, color: "#e8423a", rot: 5, wob: 3, t1: E("L42") + 0.2 }),
    fx: (t) => ({ vig: 0.35, tint: "#b5413f", tintA: 0.18 * win(t, BOSS, E("L42")) }),
  });

  // ========== 5. ҚУУ ЖӘНЕ SLOW-MO ШАРЫҚТАУ ШЕГІ («УАҚЫТ ТОҚТАДЫ») ==========
  const CH = S("L43") - 0.25, WET = S("L44") - 0.15, SLIDE = S("L45") + 0.2, SLOW = S("L46") - 0.2, TOUCH = E("L47") - 0.1, RM312 = S("L48") - 0.35;
  MK.CH = CH; MK.WET = WET; MK.SLIDE = SLIDE; MK.SLOW = SLOW; MK.TOUCH = TOUCH; MK.RM312 = RM312;

  // Дәліздегі қуу + Қазының алтын иіс толқыны + «ТАЙҒАҚ ЕДЕН»
  const runX = (t) => lerp(-1800, 100, win(t, CH, SLIDE));
  add({
    t0: CH, bg: "dormCorridor", bgArgs: [3, { wet: true, targetDoor: 312, glow: true }], bgKey: "cor3wet", c0: { x: 0, y: -520 }, flashIn: 0.15,
    cam: [[CH, { x: -1200, y: -520, z: 0.98, r: -2 }], [WET, { x: -300, y: -500, z: 1.12, r: 2 }], [SLIDE, { x: 200, y: -480, z: 1.25, r: -2 }]],
    shake: () => 9, mbScale: 0.55, mbMid: 0.2,
    actors: [
      artur({
        y: 70, talk: ["L43", "L44", "L45"],
        pos: (t) => ({ x: runX(t) }),
        mod: (t, p) => run(2.7)(t, p),
        keys: [[CH, { turn: 0.55, lean: 14, ...POSES.determined, fx: { sweat: 1 } }], [WET, { ...RIG.EXPR.shock, mouth: "oh" }, 0.1]],
      }),
      dauren({
        y: 70,
        pos: (t) => ({ x: runX(t) - 360 }),
        mod: (t, p) => run(2.6)(t, p),
        keys: [[CH, { turn: 0.55, lean: 10, ...RIG.EXPR.scared }]],
      }),
      roza({
        y: 70,
        pos: (t) => ({ x: runX(t) - 820 }),
        mod: (t, p) => run(2.4)(t, p),
        keys: [[CH, { turn: 0.55, ...RIG.EXPR.angry, armR: { sh: 95, el: -10, hand: "fist", prop: UP.mop() } }]],
      }),
    ],
    world: (t) => {
      // 312-бөлмеден шыққан алтын хош иіс толқыны
      let s = "";
      for (let i = 0; i < 3; i++) {
        const wy = -520 + i * 70;
        const wx = 1100 - ((t * 320 + i * 240) % 1600);
        s += Ln(`M${f(wx)},${wy} q-60,-30 -120,0 t-120,0`, 8, "#ffd54f", ' opacity="0.75"');
      }
      return s;
    },
    type: (t) =>
      TY.pop(t, Wt("L43", 5), "ҚАЗЫ ИІСІ!", 1280, 210, { size: 92, color: "#ffd54f", rot: 4, t1: WET }) +
      TY.stamp(t, Wt("L44", 6), "ТАЙҒАҚ ЕДЕН!", 960, 200, { size: 104, color: "#f6d55c", rot: -5, t1: SLIDE }),
    fx: () => ({ vig: 0.3 }),
  });

  // SLOW-MO ШАРЫҚТАУ ШЕГІ: Тайғақ еденмен сырғанау («Уақыт тоқтады»)
  add({
    t0: SLIDE, bg: "dormCorridor", bgArgs: [3, { wet: true, targetDoor: 312, glow: true }], bgKey: "cor3wet", c0: { x: 600, y: -520 }, flashIn: 0.25,
    cam: [
      [SLIDE, { x: 260, y: -460, z: 1.35, r: -4 }],
      [SLOW + 1.5, { x: 640, y: -440, z: 1.65, r: -2 }, eio],
      [TOUCH, { x: 920, y: -460, z: 1.95, r: 0 }, eout],
    ],
    mbScale: 0.25,
    shake: (t) => (t >= TOUCH && t < TOUCH + 0.4 ? 22 * (1 - win(t, TOUCH, TOUCH + 0.4)) : 0),
    actors: [
      artur({
        y: 120, talk: ["L46", "L47"],
        pos: (t) => ({ x: lerp(180, 880, eout(win(t, SLIDE, TOUCH))), y: 150 }),
        keys: [
          [SLIDE, { turn: 0.6, lean: -28, ...POSES.determined, armR: { sh: 105, el: 4, hand: "open" }, armL: { sh: -40, el: -20, hand: "open" }, legL: { a: 55, k: 10 }, legR: { a: -35, k: 40 } }],
          [SLOW, { ...RIG.EXPR.shock, mouth: "oh", armR: { sh: 98, el: 0, hand: "open" } }, 0.3],
          [TOUCH, { ...RIG.EXPR.happy, mouth: "smile" }, 0.15],
        ],
      }),
    ],
    world: (t) => {
      // ауада қалқыған көпіршіктер мен 312-есіктен шыққан алтын сәуле
      let s = `<path d="M1100,-980 L420,-200 L980,260 L1100,0Z" fill="#ffd54f" opacity="${f(0.28 + 0.12 * Math.sin(t * 4))}"/>`;
      const r = rng(99);
      for (let i = 0; i < 18; i++) {
        const bx = 220 + r() * 780 + (t - SLIDE) * 35, by = -620 + r() * 640 - (t - SLIDE) * 28;
        const br = 10 + r() * 22;
        s += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(br)}" fill="#e1f5fe" stroke="#ffffff" stroke-width="3" opacity="0.78"/>`;
      }
      s += puff(880, 120, t, TOUCH, 0.7, 10, "#fff8dc");
      return s;
    },
    type: (t) =>
      TY.pop(t, Wt("L46", 3), "УАҚЫТ ТОҚТАДЫ...", 960, 175, { size: 74, color: "#fff3d6", stroke: 0, weight: 300, ls: 12, style: "font-style:italic;text-shadow:0 0 28px rgba(255,200,90,0.9);", t1: S("L47") }) +
      TY.stamp(t, TOUCH, "ҮЛГЕРДІМ!", 960, 210, { size: 112, color: "#f6d55c", rot: -5, t1: RM312 - 0.05 }),
    fx: () => ({ lb: 0.95, dof: 5, vig: 0.4, bright: 1.07, tint: "#ffb35a", tintA: 0.14 }),
  });

  // ========== 6. ШЕШІМ: 312-БӨЛМЕНІҢ ОРТАҚ ДАСТАРҚАНЫ + CALLBACKS ==========
  const ASK = S("L49") - 0.2, ROZIN = S("L51") - 0.25, ROZTEA = S("L52") - 0.1, FEAST = S("L53") - 0.25, VCALL = S("L54") - 0.3, HOSTE = S("L55") - 0.45;
  MK.ASK = ASK; MK.ROZIN = ROZIN; MK.ROZTEA = ROZTEA; MK.FEAST = FEAST; MK.VCALL = VCALL; MK.HOSTE = HOSTE;

  // 312-бөлме: 4-курс старостасы Асқар қарсы алады («Қазы жалғыз желінбейді!»)
  add({
    t0: RM312, bg: "dormRoom", bgArgs: ["312"], bgKey: "dr312", c0: { x: 0, y: -500 }, fadeIn: 0.35,
    cam: [[RM312, { x: -120, y: -500, z: 1.08 }], [ASK, { x: 60, y: -520, z: 1.25 }], [S("L50"), { x: 0, y: -500, z: 1.18 }]],
    actors: [
      artur({
        x: -360, y: 60, talk: ["L48"],
        keys: [
          [RM312, { turn: 0.35, ...POSES.tired }],
          [ASK + 0.4, { ...RIG.EXPR.shock, mouth: "oh" }, 0.2],
          [S("L50") + 0.5, { ...POSES.warm }, 0.35],
        ],
      }),
      askar({
        x: 240, y: 60, talk: ["L49", "L50"],
        keys: [
          [RM312, { turn: -0.35, ...RIG.EXPR.happy, ...POSES.hug }],
          [S("L50"), { ...POSES.warm, armL: { sh: 75, el: -35, hand: "open" } }, 0.3],
        ],
      }),
      dauren({ x: -720, y: 60, keys: [[RM312, { turn: 0.35, ...RIG.EXPR.happy }]] }),
    ],
    world: () => BG.table(0, 270, 1.1) + platter(0, 100, 0.92) + bag(620, 80, 0.58, { open: true, tagText: "312" }) + FOOD.teapot(-420, 100, 0.9) + FOOD.kese(-180, 105, 1.1, true) + FOOD.kese(220, 105, 1.1, true),
    type: (t) => TY.pop(t, Wt("L50", 11), "ҚАЗЫ ЖАЛҒЫЗ ЖЕЛІНБЕЙДІ!", 960, 190, { size: 80, color: "#f6d55c", rot: -3, t1: ROZIN - 0.1 }),
    fx: () => ({ vig: 0.32, tint: "#ffb35a", tintA: 0.1 }),
  });

  // Роза апай кіріп келіп, қазы мен шайға жібиді («Тек сағат он бірге дейін!»)
  add({
    t0: ROZIN, bg: "dormRoom", bgArgs: ["312"], bgKey: "dr312", c0: { x: 0, y: -500 },
    cam: [[ROZIN, { x: 220, y: -520, z: 1.22 }], [ROZTEA, { x: 280, y: -520, z: 1.38 }]],
    actors: [
      artur({ x: -380, y: 60, keys: [[ROZIN, { turn: 0.35, ...RIG.EXPR.scared }], [ROZTEA + 0.4, { ...RIG.EXPR.happy }, 0.3]] }),
      askar({ x: 80, y: 60, keys: [[ROZIN, { turn: 0.3, ...POSES.warm }]] }),
      roza({
        x: 640, y: 60, talk: ["L51", "L52"],
        keys: [
          [ROZIN, { turn: -0.4, ...RIG.EXPR.angry, armR: { sh: 95, el: -10, hand: "fist", prop: UP.mop() } }],
          [ROZTEA, { ...POSES.warm, eye: { lidTop: 0.45, lidBot: 0.35 }, armR: { sh: 25, el: -20, hand: "rest", prop: "" }, armL: { sh: 65, el: -40, hand: "open" } }, 0.35],
        ],
      }),
    ],
    world: () => BG.table(0, 270, 1.1) + platter(0, 100, 0.92) + FOOD.baursak(340, 110, 1.0, 7) + FOOD.kese(420, 105, 1.15, true),
    type: (t) => TY.pop(t, Wt("L52", 11), "23:00-ГЕ ДЕЙІН РҰҚСАТ!", 960, 190, { size: 84, color: "#5fa36a", rot: 4, t1: FEAST - 0.1 }),
    fx: () => ({ vig: 0.3, tint: "#ffb35a", tintA: 0.12 }),
  });

  // Үлкен студенттік дастарқан + Әжесінің бейнеқоңырауы («Екі қапшық жіберем!»)
  add({
    t0: FEAST, bg: "dormRoom", bgArgs: ["312"], bgKey: "dr312", c0: { x: 0, y: -500 },
    cam: [[FEAST, { x: 0, y: -520, z: 0.95 }], [VCALL, { x: -180, y: -520, z: 1.08 }]],
    actors: [
      serik({
        x: -740, y: 190,
        keys: [[FEAST, { turn: 0.3, ...POSES.sitFloor, ...RIG.EXPR.happy, armR: { sh: 55, el: -45, hand: "open", propFront: UP.guitar() } }]],
      }),
      artur({
        x: -280, y: 190, talk: ["L53"],
        keys: [
          [FEAST, { turn: 0.2, ...POSES.sitFloor, ...RIG.EXPR.happy }],
          [VCALL, { ...RIG.EXPR.laugh, ...POSES.phoneUp }, 0.25],
        ],
      }),
      askar({ x: 180, y: 190, keys: [[FEAST, { turn: -0.2, ...POSES.sitFloor, ...RIG.EXPR.happy }]] }),
      roza({ x: 580, y: 190, keys: [[FEAST, { turn: -0.3, ...POSES.sitFloor, ...POSES.warm }]] }),
    ],
    world: () => BG.table(0, 270, 1.15) + platter(-40, 100, 0.92) + FOOD.baursak(280, 110, 1.0, 9) + FOOD.teapot(-460, 100, 0.9),
    over: (t) => {
      if (t < VCALL) return "";
      const k = eout(win(t, VCALL, VCALL + 0.4));
      const x0 = lerp(1920, 1040, k);
      let s = `<clipPath id="splAje"><path d="M${f(x0)},0 L1920,0 L1920,1080 L${f(x0 - 110)},1080Z"/></clipPath><g clip-path="url(#splAje)">`;
      s += RF(880, 0, 1060, 1080, "#bfe3fb") + RF(880, 740, 1060, 340, "#9fbf72");
      s += `<g transform="translate(1480,1220) scale(0.9)">${RIG.draw(Object.assign({}, RIG.EXPR.happy, { look: "aje", outfit: "aje", turn: -0.2, armR: { sh: 30, el: -150, hand: "fist", propFront: B.PROPS.phone() }, mouth: (() => { const l = LN.L54; if (!l || t < l.start || t > l.end + 0.05) return "smile"; for (const [c, s0, e0] of l.chars) if (t >= s0 && t < e0) return RIG.letterViseme(c); return "rest"; })() }), { id: "spj", seed: Math.floor(t * 12) })}</g>`;
      s += `</g><path d="M${f(x0)},0 L${f(x0 - 110)},1080" stroke="${INK}" stroke-width="10"/>`;
      return s;
    },
    type: (t) => TY.pop(t, Wt("L54", 11), "ТАҒЫ 2 ҚАПШЫҚ!", 540, 190, { size: 92, color: "#f6d55c", rot: -5, t1: HOSTE - 0.1 }),
    fx: () => ({ vig: 0.28, tint: "#ffb35a", tintA: 0.1 }),
  });

  // ========== 7. ТҮЙІН: ЖҮРГІЗУШІ + 2 КЕҢЕС + СҰРАҚ + ФИНАЛДЫҚ ГЭГ ==========
  const PHOTO = S("L56") - 0.1, TIP1 = Wt("L57", 6), TIP2 = Wt("L58", 0), CTA = S("L59") - 0.1, SERIN = S("L60") - 0.4, GIVEQ = S("L61") + 0.2, END = E("L62") + 0.45;
  MK.PHOTO = PHOTO; MK.TIP1 = TIP1; MK.TIP2 = TIP2; MK.CTA = CTA; MK.SERIN = SERIN; MK.GIVEQ = GIVEQ; MK.END = END;

  const groupPhoto = () => {
    let inner = RF(-330, -260, 660, 520, "#ecd9c6");
    inner += `<g transform="translate(-140,210) scale(0.32)">${RIG.draw(Object.assign({}, RIG.EXPR.happy, { look: "artur", outfit: "hoodie", turn: 0.15 }), { id: "ph1" })}</g>`;
    inner += `<g transform="translate(0,210) scale(0.32)">${RIG.draw(Object.assign({}, RIG.EXPR.happy, { look: "askar", outfit: "askar", turn: 0 }), { id: "ph2" })}</g>`;
    inner += `<g transform="translate(140,210) scale(0.32)">${RIG.draw(Object.assign({}, RIG.EXPR.happy, { look: "dauren", outfit: "dauren", turn: -0.15 }), { id: "ph3" })}</g>`;
    return inner;
  };

  add({
    t0: HOSTE, bg: "host", bgArgs: [["#d4ecff", "#7ab8f5"]], bgKey: "hostUni2", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [
      [HOSTE, { x: 0, y: -600, z: 1.05 }],
      [TIP1, { x: -60, y: -600, z: 1.1 }],
      [CTA, { x: 0, y: -590, z: 1.02 }],
      [SERIN, { x: 150, y: -580, z: 0.96 }],
      [END, { x: 150, y: -600, z: 1.0 }],
      [END + 4.8, { x: 150, y: -620, z: 1.06 }],
    ],
    actors: [
      hostArtur(
        [
          [HOSTE, { turn: 0.15, ...POSES.warm }],
          [TIP1, { ...RIG.EXPR.happy, ...RIG.POSES.point, armR: { sh: 145, el: 10, hand: "point" } }, 0.2],
          [TIP2, { ...RIG.EXPR.smug, armR: { sh: 145, el: 10, hand: "point" } }, 0.2],
          [CTA, { ...RIG.EXPR.happy, ...RIG.POSES.shrug }, 0.25],
          [SERIN + 0.2, { turn: 0.35, ...POSES.lookR, ...POSES.armsDown }, 0.25],
          [GIVEQ, { ...RIG.EXPR.laugh, armR: { sh: 85, el: -20, hand: "open", prop: UP.qurtProp() } }, 0.2],
          [S("L62"), { turn: 0.15, ...RIG.EXPR.happy, ...RIG.POSES.wave }, 0.25],
        ],
        ["L55", "L56", "L57", "L58", "L59", "L61", "L62"]
      ),
      serik({
        s: 1.1, talk: ["L60"],
        keys: [
          [HOSTE, { hide: true }],
          [SERIN, { hide: false, x: 1650, y: 330, turn: -0.45, walk: 1.0, walkAmp: 12, ...RIG.EXPR.sleepy }],
          [SERIN + 0.01, { x: 780 }, 0.9, eout],
          [SERIN + 0.9, { walk: 0, ...POSES.stand, turn: -0.25 }, 0.2],
          [GIVEQ + 0.2, { ...RIG.EXPR.happy, armL: { sh: 75, el: -30, hand: "open", prop: UP.qurtProp() } }, 0.2],
          [S("L62"), { ...RIG.POSES.wave }, 0.25],
        ],
      }),
    ],
    over: (t) => {
      let s = "";
      if (t >= PHOTO && t < TIP1 - 0.1) {
        const k = spring((t - PHOTO) / 0.6, 12, 6) * (1 - win(t, TIP1 - 0.4, TIP1 - 0.1));
        s += `<g transform="translate(1420,460) scale(${f(Math.max(0, k))}) translate(-1420,-460)">${card(1420, 420, 660, 520, -4, groupPhoto())}${TX(1420, 780, "312-БӨЛМЕ · ДОСТАР", 44, INK, ' transform="rotate(-4 1420 780)"')}</g>`;
      }
      const box = (t0, t1, x, y, title, icon, col) => {
        if (t < t0 || t > t1 + 0.3) return "";
        const k = spring((t - t0) / 0.65, 12, 6) * (1 - win(t, t1, t1 + 0.3));
        return `<g transform="translate(${x},${y}) scale(${f(Math.max(0, k))}) rotate(-3)">${RR(-440, -120, 880, 240, "#ffffff", 8, 30)}${C(-330, 0, 76, col, 6)}${icon}${TX(80, 16, title, 44, INK)}</g>`;
      };
      s += box(TIP1, TIP2 - 0.3, 540, 300, "БӨЛМЕ НӨМІРІН ЖАЗ!", `<g transform="translate(-330,45) scale(0.22)">${bag(0, 0, 1, { tagText: "512" })}</g>`, "#3f6fb5");
      s += box(TIP2, CTA - 0.25, 540, 300, "ПЕЛЬМЕНЬДІ КҮЗЕТ!", `<g transform="translate(-330,15) scale(0.42)">${pan(0, 0, 1, 6)}</g>`, "#e8773a");
      if (t > CTA && t < SERIN) {
        const k = spring((t - CTA) / 0.65, 12, 6);
        s += `<g transform="translate(470,300) scale(${f(k)})">${P("M-170,-110 Q-170,-150 -130,-150 L130,-150 Q170,-150 170,-110 L170,50 Q170,90 130,90 L-20,90 L-90,150 L-80,90 L-130,90 Q-170,90 -170,50Z", "#ffffff", 8)}${C(-60, -30, 16, INK, 0)}${C(0, -30, 16, INK, 0)}${C(60, -30, 16, INK, 0)}</g>`;
      }
      if (t > END) {
        const k = win(t, END, END + 0.6);
        s += RF(0, 0, 1920, 1080, "#1b2845", 0, ` opacity="${f(0.94 * k)}"`);
      }
      return s;
    },
    type: (t) => {
      let s = TY.stamp(t, TIP1 - 0.15, "1", 200, 300, { size: 90, color: "#3f6fb5", rot: -8, t1: TIP2 - 0.3 }) + TY.stamp(t, TIP2 - 0.1, "2", 200, 300, { size: 90, color: "#e85d75", rot: 8, t1: CTA - 0.25 });
      s += TY.pop(t, Wt("L59", 8), "КОММЕНТАРИЙГЕ ЖАЗ!", 1380, 220, { size: 70, color: "#f6d55c", rot: 4, t1: SERIN });
      if (t > END + 0.2) {
        s += TY.swing(t, END + 0.25, "БІРІНШІ КУРС", 960, 470, { size: 124, color: "#f6d55c" }) + TY.pop(t, END + 1.1, "Артурдың оқиғасы · 3-бөлім", 960, 620, { size: 50, color: "#ffffff", stroke: 9, weight: 700 });
      }
      return s;
    },
    fx: (t) => ({ dim: win(t, END + 3.8, END + 4.7) }),
  });

  G.SONGY_TOTAL = END + 4.8;
  G.SONGY_MARKS = Object.assign(G.SONGY_MARKS || {}, MK);
})(typeof window !== "undefined" ? window : globalThis);
