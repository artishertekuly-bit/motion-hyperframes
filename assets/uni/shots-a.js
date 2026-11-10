/* «Бірінші курс» — кадрлар, 1-бөлім: суық ашылу → тақырып → жүргізуші → каталог (4 заң) → тапсырма + freeze-frame (0 … ~188 с).
 * Қозғалтқыш: assets/songy/engine.js (SONGY_* аттарымен).
 */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, U = G.UNI_BG, RIG = G.ArturRig;
  const { S, E, LN, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { BG, P, F, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { bag, suitcase, turnstile, bunkBed, waterJug, qurt, devilStove, pan, forkStrike, powerTower, wetSign, platter, FOOD, PROPS: UP } = U;

  function Wt(id, n) {
    const l = LN[id];
    const toks = l.text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
    const letters = l.chars.filter(([c]) => /[\p{L}\p{N}]/u.test(c));
    let idx = 0;
    for (let i = 0; i < n && i < toks.length; i++) idx += (toks[i].match(/[\p{L}\p{N}]/gu) || []).length;
    return letters[Math.min(idx, letters.length - 1)][1];
  }

  const POSES = {
    phoneUp: { armL: { sh: 64, el: 108, hand: "fist", propFront: B.PROPS.phone() } },
    facepalm: { armR: { sh: 24, el: -150, hand: "open" } },
    chest: { armR: { sh: 40, el: -120, hand: "open" } },
    armsDown: { armL: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" }, armR: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" } },
    hug: { armL: { sh: 78, el: -50, hand: "open" }, armR: { sh: 78, el: -50, hand: "open" } },
    sitFloor: { legL: { a: 38, k: 30 }, legR: { a: 38, k: 30 } },
    stand: { legL: { a: 3, k: 0 }, legR: { a: 3, k: 0 } },
    determined: { eye: { lidTop: 0.38, lidBot: 0.1, lidTilt: 0.6, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -4, angle: 16, liftL: 0, liftR: 0 }, mouth: "smirk" },
    deadpan: { eye: { lidTop: 0.55, lidBot: 0.08, lidTilt: 0, px: 0, py: 0, pupil: 0.9, happy: 0, scale: 1 }, brow: { lift: -2, angle: 0, liftL: 0, liftR: 0 }, mouth: "hmm", fx: { sweat: 0, blush: 0, vein: 0 } },
    tired: { eye: { lidTop: 0.62, lidBot: 0.12, lidTilt: -0.3, px: 0, py: 0.2, pupil: 1, happy: 0, scale: 1 }, brow: { lift: 4, angle: -10, liftL: 0, liftR: 0 }, mouth: "wavy", fx: { sweat: 0.6, blush: 0, vein: 0 } },
    strain: { eye: { lidTop: 0.98, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -6, angle: 20, liftL: 0, liftR: 0 }, mouth: "growl", fx: { sweat: 1, blush: 1, vein: 1 } },
    sleepClosed: { eye: { lidTop: 0.98, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -4, angle: -2, liftL: 0, liftR: 0 }, mouth: "rest" },
    warm: { eye: { scale: 1, lidTop: 0.5, lidBot: 0.36, lidTilt: 0, px: 0, py: 0.1, pupil: 1, happy: 0 }, brow: { lift: 6, angle: -8, liftL: 0, liftR: 0 }, mouth: "smile" },
    lookUp: { eye: { py: -0.7 } },
    lookL: { eye: { px: -0.7 } },
    lookR: { eye: { px: 0.7 } },
  };
  G.SONGY_POSES = POSES;

  const puff = (x, y, t, t0, dur, n, col) => {
    const k = win(t, t0, t0 + (dur || 1));
    if (k <= 0 || k >= 1) return "";
    let s = "";
    for (let i = 0; i < (n || 8); i++) {
      const a = hash(i + t0) * 6.283, d = 40 + hash(i * 3 + t0) * 120;
      s += `<circle cx="${f(x + Math.cos(a) * d * eout(k))}" cy="${f(y + Math.sin(a) * d * eout(k) - 30 * k)}" r="${f(26 + 40 * k)}" fill="${col || "#ffffff"}" opacity="${f(0.7 * (1 - k))}"/>`;
    }
    return s;
  };
  const speed = (x, y, r, t, t0, n) => {
    const k = win(t, t0, t0 + 0.35);
    if (k <= 0 || k >= 1) return "";
    let s = "";
    for (let i = 0; i < (n || 6); i++) {
      const a = -Math.PI * (0.15 + (0.7 * i) / ((n || 6) - 1));
      const r0 = r * (1 + 0.3 * k), r1 = r * (1.25 + 0.6 * k);
      s += Ln(`M${f(x + Math.cos(a) * r0)},${f(y + Math.sin(a) * r0)} L${f(x + Math.cos(a) * r1)},${f(y + Math.sin(a) * r1)}`, 7, INK, ` opacity="${f(1 - k)}"`);
    }
    return s;
  };
  const shout = (x, y, r, t, t0, t1, n) => {
    if (t < t0 || t > t1) return "";
    let s = "";
    for (let i = 0; i < (n || 3); i++) {
      const k = ((t - t0) * 2.2 + i / (n || 3)) % 1;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * (0.4 + k))}" fill="none" stroke="${INK}" stroke-width="${f(8 * (1 - k))}" opacity="${f(1 - k)}"/>`;
    }
    return s;
  };
  const phoneUI = (x, y, sc, inner) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(sc)})">${RR(-210, -400, 420, 800, "#1f2027", 9, 46)}${RF(-185, -370, 370, 740, "#f4f6fb", 26)}${inner || ""}${RR(-60, -392, 120, 20, "#1f2027", 0, 10)}</g>`;
  const card = (x, y, w, h, rot, inner) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})">${RR(-w / 2 - 22, -h / 2 - 22, w + 44, h + 90, "#ffffff", 7, 6)}<svg x="${f(-w / 2)}" y="${f(-h / 2)}" width="${w}" height="${h}" viewBox="${f(-w / 2)} ${f(-h / 2)} ${w} ${h}" overflow="hidden">${inner}</svg>${RR(-w / 2, -h / 2, w, h, "none", 5)}</g>`;

  const SH = [];
  const add = (o) => SH.push(o);
  const MK = {};

  const artur = (o) => Object.assign({ look: "artur", outfit: "hoodie", s: 0.75, seed: 5 }, o);
  const serik = (o) => Object.assign({ look: "serik", outfit: "serik", s: 0.75, seed: 21 }, o);
  const dauren = (o) => Object.assign({ look: "dauren", outfit: "dauren", s: 0.78, seed: 33 }, o);
  const roza = (o) => Object.assign({ look: "roza", outfit: "roza", s: 0.76, seed: 45 }, o);
  const askar = (o) => Object.assign({ look: "askar", outfit: "askar", s: 0.76, seed: 55 }, o);
  const maskGirl = (o) => Object.assign({ look: "maskGirl", outfit: "pajama", s: 0.74, seed: 65 }, o);
  const hostArtur = (keys, talk) => artur({ x: 0, y: 340, s: 1.15, keys, talk });

  // ========== 0. СУЫҚ АШЫЛУ: жатақханаға келу ==========
  const TURN = S("L02") - 0.25, POPB = E("L02") - 0.15, VAH = S("L03") - 0.2, ST1 = Wt("L03", 2), ST2 = Wt("L03", 4), ST3 = Wt("L03", 8), LIFT = S("L04") - 0.3, STAIR = Wt("L04", 4), RM0 = S("L05") - 0.4, LAND = E("L06") + 0.15, TITLE = LAND + 0.9;
  MK.TURN = TURN; MK.POPB = POPB; MK.VAH = VAH; MK.ST1 = ST1; MK.ST2 = ST2; MK.ST3 = ST3; MK.LIFT = LIFT; MK.STAIR = STAIR; MK.RM0 = RM0; MK.LAND = LAND; MK.TITLE = TITLE;

  // Кадр 1: №5 Жатақхана алдында
  add({
    t0: 0, bg: "dormExt", c0: { x: 0, y: -560 }, fadeIn: 0.8,
    cam: [[0, { x: 0, y: -780, z: 0.62 }], [S("L01"), { x: -120, y: -620, z: 0.88 }], [TURN, { x: -180, y: -580, z: 1.08 }]],
    actors: [
      artur({
        x: -240, y: 50, talk: ["L01"],
        keys: [
          [0, { turn: 0.2, ...RIG.EXPR.happy, ...POSES.lookUp }],
          [Wt("L01", 3), { ...RIG.EXPR.laugh, ...RIG.POSES.cheer }, 0.25],
          [Wt("L01", 7), { ...RIG.EXPR.happy, armR: { sh: 110, el: 20, hand: "point" }, armL: { sh: 20, el: -10, hand: "fist" } }, 0.25],
        ],
      }),
    ],
    world: () => suitcase(-520, 55, 0.72, -4) + bag(110, 60, 0.62, { tagText: "312" }),
    type: (t) => TY.pop(t, Wt("L01", 7), "№5 ЖАТАҚХАНА", 960, 190, { size: 96, color: "#f6d55c", rot: -3, t1: TURN - 0.1 }),
    fx: () => ({ vig: 0.22 }),
  });

  // Кадр 2: Турникетке кептелген +20 КГ қапшық
  add({
    t0: TURN, bg: "dormLobby", c0: { x: 0, y: -520 }, flashIn: 0.15,
    cam: [[TURN, { x: -160, y: -480, z: 1.25 }], [POPB - 0.3, { x: -80, y: -440, z: 1.5, r: -2 }], [VAH, { x: 40, y: -460, z: 1.35, r: 0 }]],
    shake: (t) => (t > TURN + 0.8 && t < POPB ? 8 : t >= POPB && t < POPB + 0.35 ? 22 * (1 - win(t, POPB, POPB + 0.35)) : 0),
    actors: [
      artur({
        x: -360, y: 60, talk: ["L02"],
        pos: (t) => ({ x: t < POPB ? lerp(-380, -240, win(t, TURN, POPB)) : lerp(-240, 220, eout(win(t, POPB, POPB + 0.45))) }),
        keys: [
          [TURN, { turn: 0.45, ...POSES.determined, armR: { sh: 75, el: -20, hand: "fist" } }],
          [TURN + 0.7, { ...POSES.strain, lean: 18, squash: 0.9 }, 0.2],
          [POPB, { ...RIG.EXPR.shock, mouth: "oh", lean: -14, squash: 1.08 }, 0.08],
        ],
      }),
    ],
    world: (t) => {
      const sq = t < POPB ? 1 - 0.42 * win(t, TURN + 0.4, POPB) : 1 + 0.2 * Math.sin((t - POPB) * 28) * Math.exp(-(t - POPB) * 6);
      const bx = t < POPB ? -40 : lerp(-40, 420, eout(win(t, POPB, POPB + 0.45)));
      return turnstile(-40, 60, 0.95, t < POPB ? (t - TURN) * 18 : 75) + bag(bx, 50, 0.62, { sqX: sq, sqY: 2 - sq, tagText: "312" }) + puff(-40, -140, t, POPB, 0.5, 10, "#ffffff");
    },
    type: (t) => TY.pop(t, TURN + 0.9, "+20 КГ КЕПТЕЛДІ!", 960, 200, { size: 88, color: "#e85d75", rot: 5, t1: POPB }) + TY.pop(t, POPB, "ПОП!", 960, 220, { size: 120, color: "#f6d55c", rot: -8, t1: VAH - 0.05 }),
    fx: () => ({ vig: 0.25 }),
  });

  // Кадр 3: Вахтер Роза апай және 3 мөр («ТАРС! ТАРС! ТАРС!»)
  add({
    t0: VAH, bg: "dormLobby", c0: { x: -800, y: -560 },
    cam: [[VAH, { x: -780, y: -580, z: 1.25 }], [ST1, { x: -820, y: -600, z: 1.4, r: -2 }], [ST2, { x: -760, y: -580, z: 1.5, r: 2 }], [ST3, { x: -680, y: -560, z: 1.65, r: -3 }]],
    shake: (t) => {
      let s = 0;
      for (const st of [ST1, ST2, ST3]) if (t >= st && t < st + 0.28) s += 18 * (1 - (t - st) / 0.28);
      return s;
    },
    actors: [
      roza({
        x: -1040, y: -40, talk: ["L03"],
        keys: [
          [VAH, { turn: 0.35, ...RIG.EXPR.angry, armR: { sh: 130, el: 20, hand: "fist", prop: UP.stamp() } }],
          [ST1 - 0.1, { armR: { sh: 65, el: -10, hand: "fist", prop: UP.stamp() } }, 0.08],
          [ST1 + 0.15, { armR: { sh: 135, el: 20, hand: "fist", prop: UP.stamp() } }, 0.12],
          [ST2 - 0.1, { armR: { sh: 60, el: -10, hand: "fist", prop: UP.stamp() } }, 0.08],
          [ST2 + 0.15, { armR: { sh: 140, el: 20, hand: "fist", prop: UP.stamp() } }, 0.12],
          [ST3 - 0.1, { armR: { sh: 55, el: -5, hand: "fist", prop: UP.stamp() } }, 0.08],
        ],
      }),
      artur({
        x: -480, y: 60,
        keys: [
          [VAH, { turn: -0.35, ...RIG.EXPR.scared, ...POSES.armsDown }],
          [ST3, { ...RIG.EXPR.shock, mouth: "oh", lean: 12 }, 0.08],
        ],
      }),
    ],
    world: (t) => {
      let s = bag(-680, 60, 0.56, { tagText: "312" });
      if (t >= ST1) s += `<g transform="translate(-880,-510) rotate(-8)">${RR(-90, -36, 180, 72, "#fff8d6", 4, 8)}${TX(0, 12, "ҚҰЖАТ ✓", 34, "#c92a2a")}</g>`;
      if (t >= ST2) s += `<g transform="translate(-680,-120) rotate(10)">${RR(-100, -36, 200, 72, "#fff8d6", 4, 8)}${TX(0, 12, "ФЛЮОРО ✓", 34, "#c92a2a")}</g>`;
      if (t >= ST3) s += `<g transform="translate(-480,-620) rotate(-12)">${RR(-110, -38, 220, 76, "#ffebee", 5, 10)}${TX(0, 14, "РҰҚСАТ ✓", 38, "#c92a2a")}</g>`;
      return s;
    },
    type: (t) => TY.stamp(t, ST1, "ТАРС!", 520, 240, { size: 84, color: "#e85d75", rot: -8, t1: ST2 }) + TY.stamp(t, ST2, "ТАРС!", 960, 220, { size: 94, color: "#f6d55c", rot: 6, t1: ST3 }) + TY.stamp(t, ST3, "ӨТ!", 1360, 240, { size: 110, color: "#5fa36a", rot: -6, t1: LIFT - 0.1 }),
    fx: () => ({ vig: 0.28 }),
  });

  // Кадр 4: Бұзылған лифт → 5-қабат баспалдағы
  add({
    t0: LIFT, bg: "dormLobby", c0: { x: 900, y: -540 },
    cam: [[LIFT, { x: 880, y: -560, z: 1.25 }], [STAIR - 0.2, { x: 960, y: -580, z: 1.45 }]],
    actors: [
      artur({
        x: 560, y: 60, talk: ["L04"],
        keys: [
          [LIFT, { turn: 0.35, ...POSES.tired, ...POSES.lookR }],
          [LIFT + 1.0, { ...RIG.EXPR.sad, ...POSES.facepalm }, 0.25],
        ],
      }),
    ],
    world: () => bag(340, 60, 0.58, { tagText: "312" }) + suitcase(200, 60, 0.68, -6),
    type: (t) => TY.pop(t, Wt("L04", 0), "5-ҚАБАТ · 512-БӨЛМЕ", 960, 190, { size: 86, color: "#f6d55c", t1: STAIR - 0.1 }),
    fx: () => ({ vig: 0.28 }),
  });

  add({
    t0: STAIR, bg: "dormStairs", bgArgs: ["5"], bgKey: "st5", c0: { x: 0, y: -560 }, flashIn: 0.15,
    cam: [[STAIR, { x: -420, y: -420, z: 1.05, r: -4 }], [RM0 - 0.1, { x: 260, y: -740, z: 1.2, r: 2 }]],
    actors: [
      artur({
        x: -700, y: -120, talk: ["L04"],
        pos: (t) => {
          const k = win(t, STAIR, RM0);
          return { x: lerp(-800, 120, k), y: lerp(-80, -460, k) };
        },
        keys: [[STAIR, { turn: 0.55, lean: 24, ...POSES.tired, walk: 1.6, walkAmp: 18 }]],
      }),
    ],
    world: (t) => {
      const k = win(t, STAIR, RM0);
      return bag(lerp(-1020, -100, k), lerp(-60, -440, k), 0.55, { tagText: "312" });
    },
    type: (t) => TY.stamp(t, STAIR + 0.15, "1.. 2.. 3.. 4.. 5-ҚАБАТ!", 960, 200, { size: 82, color: "#e85d75", rot: -4, t1: RM0 - 0.1 }),
    fx: () => ({ vig: 0.32 }),
  });

  // Кадр 5: 512-бөлме — Серіктің сұрағы және Артурдың қапшыққа құлауы («ГҮРС!»)
  add({
    t0: RM0, bg: "dormRoom", c0: { x: -300, y: -540 }, flashIn: 0.2,
    cam: [[RM0, { x: -420, y: -540, z: 0.92 }], [S("L05"), { x: -580, y: -640, z: 1.05 }], [S("L06"), { x: -220, y: -480, z: 1.15 }], [LAND, { x: -160, y: -420, z: 1.3, r: 3 }]],
    shake: (t) => (t >= LAND && t < LAND + 0.55 ? 32 * (1 - win(t, LAND, LAND + 0.55)) : 0),
    actors: [
      serik({
        x: -980, y: -350, talk: ["L05"],
        keys: [
          [RM0, { turn: 0.35, ...POSES.sitFloor, ...RIG.EXPR.sleepy, lean: 10 }],
          [Wt("L05", 5), { ...RIG.EXPR.happy, brow: { lift: 10, angle: 0, liftL: 0, liftR: 0 } }, 0.25],
        ],
      }),
      artur({
        x: 60, y: 60, talk: ["L06"],
        pos: (t) => ({ x: 60, y: t < LAND ? 60 : 210 }),
        keys: [
          [RM0, { turn: -0.35, ...POSES.tired, lean: 16 }],
          [LAND - 0.08, { ...RIG.EXPR.sleepy, lean: 45, squash: 0.78, ...POSES.sitFloor }, 0.1],
        ],
      }),
    ],
    world: (t) => RR(-1420, -760, 840, 82, "#7a3b52", 6, 12) + RR(-1560, -700, 900, 36, "#5d667a", 6, 4) + RR(-1370, -790, 500, 22, "#5d667a", 5, 4) + bag(40, 80, 0.65, { sqY: t >= LAND ? 0.72 : 1, sqX: t >= LAND ? 1.22 : 1, tagText: "312" }) + puff(40, 40, t, LAND, 0.6, 12, "#fff3d6"),
    type: (t) => TY.pop(t, Wt("L05", 5), "ҚАЗЫ БАР МА?", 1220, 230, { size: 88, color: "#f6d55c", rot: 5, t1: S("L06") }) + TY.stamp(t, LAND, "ГҮРС!", 960, 260, { size: 130, color: "#e85d75", rot: -8, t1: TITLE - 0.05 }),
    fx: () => ({ vig: 0.3 }),
  });

  // ========== 1. ТАҚЫРЫП + ЖҮРГІЗУШІ + ФИЛЬМДЕ vs ШЫНДЫҚТА ==========
  const HOST0 = S("L07") - 0.35, NUMS = S("L08"), STIP = S("L09"), MOV = S("L10") - 0.25, REAL = S("L11") - 0.2, CAT0 = S("L12") - 0.35;
  MK.HOST0 = HOST0; MK.NUMS = NUMS; MK.STIP = STIP; MK.MOV = MOV; MK.REAL = REAL; MK.CAT0 = CAT0;

  // Тақырып карточкасы: «БІРІНШІ КУРС»
  add({
    t0: TITLE, bg: "dormExt", c0: { x: 0, y: -620 }, flashIn: 0.25,
    cam: [[TITLE, { x: 0, y: -740, z: 0.72 }], [HOST0, { x: 0, y: -680, z: 0.82 }]],
    world: () => RF(-3000, -2400, 6000, 3600, "#1b2845", 0, ' opacity="0.58"'),
    type: (t) => TY.swing(t, TITLE + 0.1, "БІРІНШІ КУРС", 960, 460, { size: 136, color: "#f6d55c" }) + TY.pop(t, TITLE + 0.7, "Артурдың оқиғасы · 3-бөлім", 960, 610, { size: 54, color: "#ffffff", stroke: 9, weight: 700 }),
    fx: () => ({ vig: 0.35 }),
  });

  // Жүргізуші: сандар мен стипендия
  add({
    t0: HOST0, bg: "host", bgArgs: [["#d4ecff", "#7ab8f5"]], bgKey: "hostUni", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[HOST0, { x: 0, y: -600, z: 1.04 }], [NUMS, { x: -60, y: -600, z: 1.1 }], [STIP, { x: 0, y: -580, z: 1.18 }]],
    actors: [
      hostArtur(
        [
          [HOST0, { turn: 0.15, ...RIG.EXPR.happy, ...RIG.POSES.wave }],
          [Wt("L07", 4), { ...RIG.EXPR.happy, ...POSES.chest }, 0.25],
          [NUMS, { ...RIG.POSES.point, armR: { sh: 135, el: 15, hand: "point" } }, 0.2],
          [STIP, { ...RIG.EXPR.smug, ...RIG.POSES.shrug }, 0.25],
        ],
        ["L07", "L08", "L09"]
      ),
    ],
    over: (t) => {
      if (t < STIP + 0.3 || t > MOV) return "";
      const k = win(t, STIP + 0.3, MOV - 0.1);
      return `<g transform="translate(1380,580)">${C(-60, 0, 38, "#f6d55c", 6)}${TX(-60, 14, "₸", 42, INK)}${C(30, 20, 38, "#f6d55c", 6)}${TX(30, 34, "₸", 42, INK)}${C(-10, -50, 38, "#f6d55c", 6)}${TX(-10, -36, "₸", 42, INK)}<g transform="translate(${f(k * 180)},${f(-80 - k * 240)}) rotate(${f(Math.sin(t * 18) * 20)})">${P("M0,0 Q-30,-25 -18,-40 Q0,-20 0,0 Q0,-20 18,-40 Q30,-25 0,0Z", "#ffffff", 4)}</g></g>`;
    },
    type: (t) =>
      TY.stamp(t, Wt("L08", 2), "4 ЖЫЛ", 420, 250, { size: 92, color: "#3f6fb5", rot: -6, t1: STIP }) +
      TY.stamp(t, Wt("L08", 4), "8 СЕМЕСТР", 1460, 250, { size: 88, color: "#e85d75", rot: 6, t1: STIP }) +
      TY.pop(t, Wt("L08", 8), "312 КҮН", 1420, 430, { size: 90, color: "#f6d55c", rot: -4, t1: STIP }) +
      TY.pop(t, Wt("L09", 2), "28 000 ₸", 1380, 320, { size: 108, color: "#5fa36a", rot: 5, t1: MOV - 0.1 }),
    fx: () => ({ vig: 0.2 }),
  });

  // «ФИЛЬМДЕРДЕ» vs «ШЫНДЫҚТА»
  add({
    t0: MOV, bg: "movie", c0: { x: 0, y: -520 }, flashIn: 0.2,
    cam: [[MOV, { x: -120, y: -540, z: 0.96 }], [REAL - 0.1, { x: 120, y: -540, z: 1.06 }]],
    actors: [
      artur({
        x: 0, y: 60, outfit: "casual", talk: ["L10"],
        keys: [[MOV, { turn: 0.2, ...RIG.EXPR.happy, armR: { sh: 75, el: -65, hand: "fist", prop: UP.latte() } }]],
      }),
    ],
    world: () => RR(-420, -280, 840, 36, "#c99b6d", 6, 6) + P("M-80,-280 L-50,-380 L90,-380 L60,-280Z", "#d6dae2", 6),
    type: (t) => TY.pop(t, MOV + 0.15, "ФИЛЬМДЕРДЕ", 960, 170, { size: 78, color: "#fff3d6", weight: 300, style: "font-style:italic;", t1: REAL - 0.1 }),
    fx: () => ({ lb: 0.85, vig: 0.3, tint: "#ffb35a", tintA: 0.16 }),
  });

  add({
    t0: REAL, bg: "dormRoom", c0: { x: 100, y: -520 }, flashIn: 0.15,
    cam: [[REAL, { x: 80, y: -520, z: 1.08 }], [Wt("L11", 8), { x: 420, y: -420, z: 1.55, r: -3 }]],
    shake: (t) => (t > Wt("L11", 8) ? 10 : 0),
    actors: [
      artur({ x: -120, y: 70, talk: ["L11"], keys: [[REAL, { turn: 0.25, ...RIG.EXPR.shock, ...RIG.POSES.shrug }]] }),
      dauren({ x: -520, y: 70, keys: [[REAL, { turn: 0.35, ...POSES.determined }]] }),
      serik({ x: -980, y: -720, keys: [[REAL, { turn: 0.3, ...POSES.sitFloor, ...POSES.sleepClosed }]] }),
    ],
    world: (t) => powerTower(578, -242, 0.95, t > Wt("L11", 8) ? t - Wt("L11", 8) : 0),
    type: (t) => TY.stamp(t, REAL + 0.1, "ШЫНДЫҚТА: 12 М²", 560, 200, { size: 84, color: "#e85d75", rot: -5, t1: CAT0 - 0.1 }) + TY.pop(t, Wt("L11", 8), "1 РОЗЕТКА!", 1320, 220, { size: 96, color: "#ffeb3b", rot: 6, t1: CAT0 - 0.1 }),
    fx: () => ({ vig: 0.3 }),
  });

  // ========== 2. КАТАЛОГ: ЖАТАҚХАНАНЫҢ 4 ЗАҢЫ ==========
  const LAW1 = CAT0, DAU = S("L15") - 0.2, LAW2 = S("L17") - 0.3, PEL = S("L19") - 0.2, FORKS = S("L20") - 0.15, MOMC = S("L21") - 0.3, LAW3 = S("L23") - 0.3, CANT = Wt("L24", 6), LAW4 = S("L26") - 0.3, TASK = S("L27") - 0.4;
  MK.LAW1 = LAW1; MK.DAU = DAU; MK.LAW2 = LAW2; MK.PEL = PEL; MK.FORKS = FORKS; MK.MOMC = MOMC; MK.LAW3 = LAW3; MK.CANT = CANT; MK.LAW4 = LAW4; MK.TASK = TASK;

  // 1-заң: Көршілер (Серік және Дәурен)
  add({
    t0: LAW1, bg: "dormRoom", c0: { x: -450, y: -580 }, flashIn: 0.15,
    cam: [[LAW1, { x: -480, y: -560, z: 0.95 }], [S("L13"), { x: -640, y: -650, z: 1.08 }], [S("L14"), { x: -720, y: -680, z: 1.15 }]],
    actors: [
      artur({ x: -180, y: 60, talk: ["L12", "L13"], keys: [[LAW1, { turn: -0.3, ...RIG.EXPR.happy, armL: { sh: 120, el: 20, hand: "point" } }]] }),
      serik({
        x: -980, y: -350, talk: ["L14"],
        keys: [
          [LAW1, { turn: 0.3, ...POSES.sitFloor, ...POSES.sleepClosed }],
          [S("L14"), { armR: { sh: 120, el: 10, hand: "point" } }, 0.2],
          [E("L14") - 0.2, { ...POSES.armsDown, ...POSES.sleepClosed }, 0.25],
        ],
      }),
    ],
    world: (t) => RR(-1420, -760, 840, 82, "#7a3b52", 6, 12) + RR(-1560, -700, 900, 36, "#5d667a", 6, 4) + RR(-1370, -790, 500, 22, "#5d667a", 5, 4) + TX(-760, -980 - ((t * 36) % 70), "Zzz...", 52, "#ffffff", ` stroke="${INK}" stroke-width="8" paint-order="stroke"`),
    type: (t) => TY.stamp(t, Wt("L12", 8), "1-ЗАҢ: КӨРШІЛЕР", 1320, 210, { size: 80, color: "#3f6fb5", rot: 4, t1: DAU - 0.1 }) + TY.pop(t, Wt("L13", 5), "20 САҒАТ ҰЙҚЫ", 1320, 360, { size: 78, color: "#f6d55c", t1: DAU - 0.1 }),
    fx: () => ({ vig: 0.25 }),
  });

  // Дәурен («Спортзал — оның өзі!»)
  add({
    t0: DAU, bg: "dormRoom", c0: { x: 180, y: -520 },
    cam: [[DAU, { x: 180, y: -540, z: 1.25 }], [S("L16"), { x: 260, y: -560, z: 1.42 }]],
    actors: [
      artur({ x: -180, y: 60, talk: ["L15"], keys: [[DAU, { turn: 0.35, ...RIG.EXPR.happy }]] }),
      dauren({
        x: 420, y: 60, talk: ["L16"],
        mod: (t, p) => {
          const lift = Math.abs(Math.sin((t - DAU) * 5.5));
          p.armL = { sh: 75 + lift * 65, el: -30 - lift * 70, hand: "fist", prop: UP.jugProp() };
          p.armR = { sh: 75 + lift * 65, el: -30 - lift * 70, hand: "fist", prop: UP.jugProp() };
          return p;
        },
        keys: [[DAU, { turn: -0.25, ...RIG.EXPR.happy }]],
      }),
    ],
    world: (t) => qurt(240, -380 - Math.abs(Math.sin((t - DAU) * 4)) * 120, 28, t * 90),
    type: (t) => TY.pop(t, Wt("L16", 2), "ҚҰРТ = ПРОТЕИН!", 960, 190, { size: 92, color: "#5fa36a", rot: -4, t1: LAW2 - 0.1 }),
    fx: () => ({ vig: 0.25 }),
  });

  // 2-заң: Ортақ асүй («Шайтан-плита» + 5 шанышқы + Анасының қоңырауы)
  add({
    t0: LAW2, bg: "dormKitchen", c0: { x: 0, y: -520 }, flashIn: 0.2,
    cam: [[LAW2, { x: 0, y: -540, z: 1.05 }], [S("L18"), { x: 40, y: -520, z: 1.28 }], [Wt("L18", 8), { x: 110, y: -560, z: 1.38, r: 2 }]],
    shake: (t) => (t > Wt("L18", 8) ? 7 : 0),
    actors: [
      artur({
        x: -440, y: 60, talk: ["L17", "L18"],
        keys: [
          [LAW2, { turn: 0.35, ...RIG.EXPR.happy, armR: { sh: 95, el: 10, hand: "point" } }],
          [Wt("L18", 8), { ...RIG.EXPR.shock, mouth: "oh", lean: -12 }, 0.12],
        ],
      }),
    ],
    world: (t) => devilStove(120, 40, 0.98, win(t, S("L18") + 0.2, S("L18") + 0.7), win(t, Wt("L18", 8) - 0.1, Wt("L18", 8) + 0.4)),
    type: (t) => TY.stamp(t, Wt("L17", 2), "2-ЗАҢ: ОРТАҚ АСҮЙ", 960, 180, { size: 84, color: "#e8773a", rot: -3, t1: S("L18") }) + TY.pop(t, Wt("L17", 9), "ШАЙТАН-ПЛИТА (1978)", 960, 190, { size: 82, color: "#f6d55c", t1: PEL - 0.1 }),
    fx: () => ({ vig: 0.26 }),
  });

  // Пельмень және 5 шанышқы
  add({
    t0: PEL, bg: "dormKitchen", c0: { x: 0, y: -500 },
    cam: [[PEL, { x: 20, y: -480, z: 1.35 }], [FORKS, { x: 80, y: -460, z: 1.55, r: -2 }]],
    shake: (t) => (t >= FORKS && t < FORKS + 0.4 ? 18 * (1 - win(t, FORKS, FORKS + 0.4)) : 0),
    actors: [
      artur({
        x: -360, y: 60, talk: ["L19", "L20"],
        keys: [
          [PEL, { turn: 0.35, ...RIG.EXPR.happy }],
          [Wt("L19", 4), { turn: -0.6, ...RIG.EXPR.calm }, 0.2],
          [FORKS, { turn: 0.4, ...RIG.EXPR.shock, mouth: "shock", shakeEyes: true }, 0.08],
        ],
      }),
    ],
    world: (t) => {
      const fk = win(t, FORKS - 0.05, FORKS + 0.2);
      const gone = t > FORKS + 0.25;
      let s = devilStove(120, 40, 0.98, 0, 0.3) + pan(180, -470, 1.0, gone ? 0 : 6);
      if (t >= FORKS - 0.05 && t < FORKS + 0.9) {
        for (const [ang, dx] of [[-55, -90], [-25, -45], [0, 0], [28, 45], [58, 90]]) {
          s += forkStrike(180 + dx, -510, ang, fk);
        }
      }
      return s + puff(180, -510, t, FORKS, 0.45, 8, "#ffffff");
    },
    type: (t) => TY.pop(t, Wt("L19", 4), "3 СЕКУНД...", 960, 200, { size: 90, color: "#f6d55c", t1: FORKS }) + TY.stamp(t, FORKS + 0.05, "5 ШАНЫШҚЫ!", 960, 200, { size: 108, color: "#e85d75", rot: 6, t1: MOMC - 0.1 }),
    fx: () => ({ vig: 0.28 }),
  });

  // Анасының қоңырауы (Split-screen: сол жақта от шашқан асүй, оң жақта Анасы)
  add({
    t0: MOMC, bg: "dormKitchen", c0: { x: -120, y: -520 },
    cam: [[MOMC, { x: -180, y: -520, z: 1.22 }], [S("L22"), { x: -220, y: -540, z: 1.3 }]],
    actors: [
      artur({
        x: -360, y: 60, talk: ["L22"],
        keys: [
          [MOMC, { turn: 0.2, ...RIG.EXPR.scared, ...POSES.phoneUp, fx: { sweat: 1 } }],
          [S("L22"), { ...RIG.EXPR.happy, fx: { sweat: 1, blush: 0.6 } }, 0.2],
        ],
      }),
    ],
    world: (t) => devilStove(40, 40, 0.95, 0.8, 0.9 + 0.2 * Math.sin(t * 14)),
    over: (t) => {
      const k = eout(win(t, MOMC, MOMC + 0.35));
      const x0 = lerp(1920, 1020, k);
      let s = `<clipPath id="splMom"><path d="M${f(x0)},0 L1920,0 L1920,1080 L${f(x0 - 110)},1080Z"/></clipPath><g clip-path="url(#splMom)">`;
      s += RF(850, 0, 1100, 1080, "#ead9bf") + RF(850, 720, 1100, 360, "#c9a77f");
      s += `<g transform="translate(1480,1220) scale(0.92)">${RIG.draw(Object.assign({}, RIG.EXPR.happy, { look: "mom", outfit: "momHome", turn: -0.25, armR: { sh: 30, el: -150, hand: "fist", propFront: B.PROPS.phone() }, mouth: (() => { const l = LN.L21; if (!l || t < l.start || t > l.end + 0.05) return "smile"; for (const [c, s0, e0] of l.chars) if (t >= s0 && t < e0) return RIG.letterViseme(c); return "rest"; })() }), { id: "spm", seed: Math.floor(t * 12) })}</g>`;
      s += `</g><path d="M${f(x0)},0 L${f(x0 - 110)},1080" stroke="${INK}" stroke-width="10"/>`;
      return s;
    },
    type: (t) => TY.pop(t, Wt("L22", 5), "ФРАНЦУЗ СОРПАСЫ!", 540, 200, { size: 78, color: "#f6d55c", rot: -5, t1: LAW3 - 0.1 }),
    fx: () => ({ vig: 0.25 }),
  });

  // 3-заң: Университет корпустарының лабиринті + Бәліш пасхалкасы
  add({
    t0: LAW3, bg: "uniMaze", c0: { x: 0, y: -540 }, flashIn: 0.2,
    cam: [[LAW3, { x: 0, y: -620, z: 0.82 }], [S("L24"), { x: 240, y: -560, z: 0.96 }]],
    actors: [
      artur({
        x: -600, y: 60, talk: ["L23", "L24"],
        pos: (t) => ({ x: Math.sin((t - LAW3) * 2.8) * 720 }),
        keys: [[LAW3, { turn: 0.4, ...RIG.EXPR.shock, walk: 2.2 }]],
      }),
    ],
    type: (t) => TY.stamp(t, Wt("L23", 1), "3-ЗАҢ: ЛАБИРИНТ", 960, 180, { size: 86, color: "#8e3b6e", rot: -4, t1: CANT - 0.1 }),
    fx: () => ({ vig: 0.25 }),
  });

  add({
    t0: CANT, bg: "canteen", c0: { x: 0, y: -520 }, flashIn: 0.15,
    cam: [[CANT, { x: -200, y: -540, z: 1.05 }], [S("L25"), { x: -280, y: -520, z: 1.48 }]],
    actors: [
      artur({
        x: -480, y: 60, talk: ["L25"],
        keys: [
          [CANT, { turn: 0.35, ...RIG.EXPR.shock }],
          [S("L25"), { ...RIG.EXPR.smug, armR: { sh: 85, el: 10, hand: "point" } }, 0.25],
        ],
      }),
    ],
    world: () => `<circle cx="-100" cy="-520" r="180" fill="#ffd54f" opacity="0.28"/>` + BG.pastryAt(-100, -520, 2.1),
    type: (t) => TY.pop(t, Wt("L25", 3), "ЖҰМБАҚ БӘЛІШ — 500 ₸!", 960, 200, { size: 84, color: "#f6d55c", rot: 4, t1: LAW4 - 0.1 }),
    fx: () => ({ vig: 0.28 }),
  });

  // 4-заң: Кешкі сағат 22:00 — Жалғыз розетка және 1% заряд
  add({
    t0: LAW4, bg: "dormRoom", bgArgs: ["night"], bgKey: "drNight1", c0: { x: 200, y: -480 }, flashIn: 0.2,
    cam: [[LAW4, { x: 180, y: -480, z: 1.15 }], [Wt("L26", 6), { x: 380, y: -380, z: 1.55 }]],
    actors: [
      artur({ x: 80, y: 60, talk: ["L26"], keys: [[LAW4, { turn: 0.35, ...POSES.determined, ...POSES.phoneUp }]] }),
      dauren({ x: 860, y: 60, keys: [[LAW4, { turn: -0.4, ...POSES.determined, ...POSES.phoneUp }]] }),
    ],
    world: () => `<circle cx="578" cy="-242" r="160" fill="#ffd54f" opacity="0.3"/>` + P("M538,-300 L555,-345 L578,-315 L601,-345 L618,-300Z", "#f6d55c", 5),
    type: (t) => TY.stamp(t, Wt("L26", 1), "4-ЗАҢ: 1 РОЗЕТКА", 640, 190, { size: 84, color: "#e85d75", rot: -5, t1: Wt("L26", 7) }) + TY.pop(t, Wt("L26", 8), "1% ЗАРЯД!", 960, 200, { size: 112, color: "#ffeb3b", rot: 6, t1: TASK - 0.1 }),
    fx: () => ({ lb: 0.8, vig: 0.45 }),
  });

  // ========== 3. ТАПСЫРМА + FREEZE-FRAME «ЕҢ ҮЛКЕН ҚАТЕЛІК» ==========
  const PROUD = S("L29") - 0.2, PUT = S("L30") - 0.2, FRZ = S("L31") - 0.05, GONE = S("L32") - 0.2, CLUE = S("L33") - 0.2, DUN = S("L36") - 0.1, CHASE0 = S("L37") - 0.35;
  MK.PROUD = PROUD; MK.PUT = PUT; MK.FRZ = FRZ; MK.GONE = GONE; MK.CLUE = CLUE; MK.DUN = DUN; MK.CHASE0 = CHASE0;

  // Аш бөлме + Артурдың мақтанышы («20 КГ қазы мен бауырсақ!»)
  add({
    t0: TASK, bg: "dormRoom", bgArgs: ["night"], bgKey: "drNight2", c0: { x: -100, y: -500 }, flashIn: 0.2,
    cam: [[TASK, { x: -100, y: -480, z: 1.1 }], [PROUD, { x: -180, y: -540, z: 1.32 }]],
    actors: [
      dauren({ x: 380, y: 180, talk: ["L28"], keys: [[TASK, { turn: -0.25, ...POSES.sitFloor, ...POSES.tired }]] }),
      artur({
        x: -240, y: 60, talk: ["L27", "L29"],
        keys: [
          [TASK, { turn: 0.25, ...RIG.EXPR.sad }],
          [PROUD, { ...RIG.EXPR.happy, ...POSES.chest }, 0.2],
        ],
      }),
    ],
    world: (t) => (t > PROUD ? `<circle cx="-540" cy="-160" r="280" fill="#ffd54f" opacity="0.28"/>` : "") + bag(-540, 60, 0.65, { tagText: "312" }),
    type: (t) => TY.pop(t, Wt("L29", 6), "ҚАЗЫ МЕН БАУЫРСАҚ!", 960, 190, { size: 92, color: "#f6d55c", rot: -4, t1: PUT - 0.1 }),
    fx: () => ({ vig: 0.35 }),
  });

  // Дәлізге 2 секундқа шығарылған қапшық → FREEZE-FRAME «ЕҢ ҮЛКЕН ҚАТЕЛІК»
  add({
    t0: PUT, bg: "dormCorridor", bgArgs: [5, { targetDoor: 512 }], bgKey: "cor5", c0: { x: 900, y: -520 }, flashIn: 0.15,
    cam: [[PUT, { x: 860, y: -520, z: 1.18 }], [FRZ, { x: 920, y: -480, z: 1.42, r: -3 }]],
    actors: [
      artur({
        x: 740, y: 60, talk: ["L30", "L31"],
        keys: [
          [PUT, { turn: 0.35, ...RIG.EXPR.happy, armR: { sh: 75, el: -20, hand: "open" } }],
          [FRZ, { ...RIG.EXPR.smug, ...RIG.POSES.thumbs || POSES.chest }, 0.05],
        ],
      }),
    ],
    world: () => bag(1080, 70, 0.62, { tagText: "312" }),
    type: (t) => (t >= FRZ ? TY.stamp(t, FRZ + 0.08, "ЕҢ ҮЛКЕН ҚАТЕЛІК!", 960, 230, { size: 112, color: "#e8423a", rot: -6, t1: GONE - 0.05 }) : ""),
    fx: (t) => (t >= FRZ ? { sepia: 0.72, dim: 0.22, vig: 0.6, grain: 0.18 } : { vig: 0.28 }),
  });

  // Қапшық жоқ! Тек домалап бара жатқан жалғыз ақ құрт + Серіктің «312-БӨЛМЕ = 4-КУРС!» жаңалығы
  add({
    t0: GONE, bg: "dormCorridor", bgArgs: [5, { targetDoor: 512 }], bgKey: "cor5b", c0: { x: 900, y: -520 }, flashIn: 0.15,
    cam: [[GONE, { x: 960, y: -480, z: 1.25 }], [CLUE, { x: 780, y: -540, z: 1.35 }], [DUN, { x: 740, y: -560, z: 1.6, r: 3 }]],
    shake: (t) => (t >= DUN && t < DUN + 0.6 ? 22 * (1 - win(t, DUN, DUN + 0.6)) : 0),
    actors: [
      artur({
        x: 720, y: 60, talk: ["L32", "L34"],
        keys: [
          [GONE, { turn: 0.4, ...RIG.EXPR.shock, mouth: "shock", shakeEyes: true }],
          [CLUE, { turn: -0.3, ...RIG.EXPR.scared, shakeEyes: false }, 0.2],
          [DUN, { ...RIG.EXPR.shock, mouth: "aa", shakeEyes: true }, 0.08],
        ],
      }),
      serik({
        x: 340, y: 60, talk: ["L33", "L35", "L36"],
        keys: [
          [GONE, { hide: true }],
          [CLUE, { hide: false, turn: 0.35, ...RIG.EXPR.sleepy, ...RIG.POSES.think }],
          [S("L35"), { ...RIG.EXPR.shock, armR: { sh: 130, el: 10, hand: "point" } }, 0.12],
          [DUN, { ...RIG.EXPR.scared, mouth: "aa", ...RIG.POSES.cheer }, 0.1],
        ],
      }),
    ],
    world: (t) => {
      const qx = lerp(980, 1750, win(t, GONE, CLUE + 1.5));
      return qurt(qx, 45 - Math.abs(Math.sin((t - GONE) * 9)) * 28, 30, (t - GONE) * 380);
    },
    type: (t) =>
      TY.pop(t, Wt("L32", 4), "ҚАПШЫҚ ЖОҚ?!", 960, 200, { size: 104, color: "#e85d75", rot: -5, t1: CLUE }) +
      TY.pop(t, Wt("L34", 0), "«312» = АВТОБУС?", 960, 200, { size: 88, color: "#f6d55c", t1: S("L35") }) +
      TY.stamp(t, DUN + 0.05, "312-БӨЛМЕ = 4-КУРС!", 960, 210, { size: 108, color: "#e8423a", rot: 6, t1: CHASE0 - 0.05 }),
    fx: (t) => ({ vig: 0.35 + 0.25 * win(t, DUN, DUN + 0.8), tint: "#b5413f", tintA: 0.22 * win(t, DUN, CHASE0) }),
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.UNI_H = { Wt, POSES, puff, speed, shout, phoneUI, card, artur, serik, dauren, roza, askar, maskGirl, hostArtur };
})(typeof window !== "undefined" ? window : globalThis);
