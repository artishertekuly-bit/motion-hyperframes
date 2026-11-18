/* «Қонақ келе жатыр: 15 минуттық Еуроремонт» (Reels 9:16, ~1:34) — кадрлар.
 * 0. Ілмек (қонақ келе жатқанда) → 1. Сенбі күні диван ↔ Анамның дабылы (15 минут!)
 * → 2. Қолға шүберек пен шаңсорғыш → 3. «Тиіспе — қонаққа!» шоколад заңы
 * → 4. Бүкіл хаосты шкафқа тығу (шкаф ісінеді) → 5. Алтын сервиз + 5 минут қалды
 * → 6. «ДІҢ-ДІҢ!» Есік қоңырауы + 180° мінсіз күлкі → 7. «Біз 5 минутқа ғана кірдік!» (Freeze)
 * → 8. Шкафтың жарылуы → 9. Түйін + Кеңес.
 */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RB = G.REELS_BG, K = G.REELS_KIT, RIG = G.ArturRig;
  const { S, E, TY, lerp, clamp, sm, eio, eout, spring, win, noise, hash } = Q;
  const { BG, P, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { Wt, POSES: PO, ACT, puff, speed, shout, notes, sweat, tears, stars, freezeFx } = K;
  const { g, TB } = RB;
  const X = RIG.EXPR;
  const SH = [], MK = {};
  const add = (o) => SH.push(o);
  const ex = (...a) => Object.assign({}, ...a.map((k) => (typeof k === "string" ? X[k] || PO[k] || RIG.POSES[k] : k)));

  // Аспалы дабыл шамы
  const sirenLight = (x, y, t) => {
    const on = Math.sin(t * 14) > 0;
    return g(x, y, 1, C(0, 0, 56, on ? "#ff3b30" : "#8e1c16", 6) + (on ? `<circle cx="0" cy="0" r="140" fill="#ff3b30" opacity="0.22"/>` : ""));
  };

  // Қонаққа сақталған кәмпит қорабы
  const candyBox = (x, y, s) => g(x, y, s,
    RR(-150, -90, 300, 180, "#c0392b", 6, 16) +
    Ln("M-150,0 L150,0 M0,-90 L0,90", 14, "#f6d55c") +
    C(0, 0, 26, "#f6d55c", 4) +
    TB(0, -110, "ҚОНАҚҚА!", 40, "#ff5252")
  );

  // Томпайып ісініп тұрған шкаф (bulge: 0..1, open: boolean)
  const wardrobe = (x, y, s, bulge, open) => {
    const b = (bulge || 0) * 65;
    let d = RR(-240, -820, 480, 820, "#6d4c41", 8, 10);
    if (open) {
      // ашылған есіктер + шашылып жатқан киім/доп
      d += P("M-240,-820 L-380,-780 L-380,40 L-240,0Z", "#8d6e63", 7);
      d += P("M240,-820 L380,-780 L380,40 L240,0Z", "#8d6e63", 7);
      d += C(-40, -140, 70, "#f2a541", 6) + P("M-160,-420 Q0,-560 160,-420 L180,-120 L-180,-120Z", "#5a7fc4", 6);
      d += C(90, -320, 54, "#e85d75", 6) + RR(-140, -680, 240, 120, "#7cc47a", 5, 18);
    } else {
      // ісініп тұрған есіктер
      d += P(`M-230,-800 Q${f(-120 - b)},-410 -230,-20 L0,-20 L0,-800Z`, "#8d6e63", 6);
      d += P(`M230,-800 Q${f(120 + b)},-410 230,-20 L0,-20 L0,-800Z`, "#8d6e63", 6);
      d += C(f(-30 - b * 0.4), -410, 14, "#f6d55c", 4) + C(f(30 + b * 0.4), -410, 14, "#f6d55c", 4);
      if (bulge > 0.2) d += P(`M-20,-500 L${f(-45 - b * 0.3)},-460 M20,-340 L${f(55 + b * 0.3)},-310`, "none", 6);
    }
    return g(x, y, s, d);
  };

  // Хрусталь/алтын сервиз
  const teaSet = (x, y, s) => g(x, y, s,
    RR(-220, 0, 440, 28, "#f2c14e", 6, 12) +
    P("M-120,0 Q-140,-140 -60,-150 L-10,-150 Q50,-140 30,0Z", "#ffffff", 6) +
    C(-45, -158, 16, "#f2c14e", 4) +
    RR(70, -70, 80, 70, "#ffffff", 5, 10) + RR(160, -70, 80, 70, "#ffffff", 5, 10)
  );

  // ================= 0. ІЛМЕК (L01) =================
  MK.S0 = S("L01");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: 0, c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[0, { x: 0, y: -560, z: 1.15 }], [E("L01"), { x: 0, y: -560, z: 1.22 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[0, ex("calmSmile", "shrug", { turn: 0 })], [Wt("L01", 4), ex("shock", "fingerUp", { mouth: "gasp" })]], talk: ["L01"] })
    ],
    type: (t) => TY.pop(t, 0.4, "ҚОНАҚ КЕЛЕ ЖАТЫР!", 540, 300, { size: 80, color: "#f2c14e", wob: 5 }) +
                 TY.stamp(t, Wt("L01", 5), "20x ЖЫЛДАМДЫҚ", 540, 430, { size: 74, color: "#ff5252", rot: -4 })
  });

  // ================= 1. СЕНБІ ДИВАН ↔ АНАМ ДАБЫЛЫ (L02, L03) =================
  MK.S1 = S("L02");
  const ALARM = S("L03");
  add({
    bg: () => BG.living(), bgKey: "living",
    t0: S("L02"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L02"), { x: 80, y: -450, z: 1.05 }], [ALARM - 0.1, { x: 80, y: -450, z: 1.15 }], [ALARM + 0.1, { x: 0, y: -450, z: 1.0 }, eout]],
    shake: (t) => (t >= ALARM && t < ALARM + 1.2 ? 16 : 0),
    actors: [
      ACT.artur({ x: 140, y: 0, s: 0.72, keys: [[S("L02"), ex("warm", "sitChair", { turn: -0.1 })], [ALARM, ex("scared", "stand", { squash: 1.12, turn: -0.2 })]], talk: ["L02"] }),
      ACT.mom({ x: -200, y: 0, s: 0.72, keys: [[0, { hide: true }], [ALARM, ex("angry", "point", { hide: false, turn: 0.3, mouth: "shout" })]], talk: ["L03"] })
    ],
    world: (t) => (t >= ALARM ? sirenLight(0, -900, t) + shout(-100, -680, 200, t, ALARM, E("L03"), 3) : ""),
    fx: (t) => (t >= ALARM ? { tint: "#ff3b30", tintA: 0.12 + 0.08 * Math.sin(t * 14) } : {}),
    type: (t) => (t < ALARM ? TY.pop(t, S("L02") + 0.3, "КҮТУ: СЕНБІ ДЕМАЛЫС", 540, 260, { size: 68, color: "#7cc47a" })
      : TY.stamp(t, ALARM + 0.2, "15 МИНУТ ҚАЛДЫ!", 540, 280, { size: 90, color: "#ff5252", rot: -5 }))
  });

  // ================= 2. ШАҢСОРҒЫШ ПЕН ШҮБЕРЕК (L04) =================
  MK.S2 = S("L04");
  add({
    bg: () => BG.living(), bgKey: "living",
    t0: S("L04"), c0: { x: 0, y: -450 }, fadeIn: 0.15,
    cam: [[S("L04"), { x: -160, y: -450, z: 1.1 }], [E("L04"), { x: 160, y: -450, z: 1.15 }, eio]],
    shake: (t) => 10,
    actors: [
      ACT.artur({
        x: 0, y: 0, s: 0.72,
        pos: (t) => ({ x: Math.sin(t * 10) * 180 }),
        keys: [[S("L04"), ex("strain", "reachBoth", { walk: 2.0, turn: 0.3 })]],
        talk: ["L04"]
      })
    ],
    world: (t) => speed(0, -450, 260, t, S("L04") + 0.5, 8) + sweat(0, -700, t, S("L04"), 3),
    type: (t) => TY.pop(t, S("L04") + 0.2, "ДАБЫЛ РЕЖИМІ!", 540, 270, { size: 88, color: "#f2c14e", wob: 6 })
  });

  // ================= 3. «ТИІСПЕ — ҚОНАҚҚА!» ЗАҢЫ (L05, L06, L07) =================
  MK.S3 = S("L05");
  add({
    bg: () => BG.kitchen(), bgKey: "kitchen",
    t0: S("L05"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L05"), { x: 0, y: -450, z: 1.05 }], [S("L06"), { x: 100, y: -450, z: 1.15 }], [S("L07"), { x: -120, y: -450, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 150, y: 0, s: 0.70, keys: [[S("L05"), ex("nervous", "reach", { turn: -0.2 })], [S("L06"), ex("sad", "armsDown", { turn: -0.15 })], [S("L07"), ex("scared", "shrug", { turn: -0.25 })]], talk: ["L05", "L06"] }),
      ACT.mom({ x: -180, y: 0, s: 0.72, keys: [[S("L05"), ex("determined", "hips", { turn: 0.25 })], [S("L07"), ex("angry", "stop", { turn: 0.3 })]], talk: ["L07"] })
    ],
    world: (t) => candyBox(0, -240, 0.9),
    type: (t) => TY.stamp(t, S("L05") + 0.8, "ТИІСПЕ — ҚОНАҚҚА!", 540, 260, { size: 82, color: "#ff5252", rot: 4 })
  });

  // ================= 4. ШКАФҚА ХАОСТЫ ТЫҒУ (L08, L09, L10) =================
  MK.S4 = S("L08");
  add({
    bg: () => BG.living(), bgKey: "living",
    t0: S("L08"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L08"), { x: 0, y: -450, z: 1.0 }], [S("L10"), { x: -40, y: -460, z: 1.2 }, eio]],
    shake: (t) => (t > S("L09") ? 8 * Math.sin(t * 24) : 0),
    actors: [
      ACT.artur({ x: 180, y: 0, s: 0.70, keys: [[S("L08"), ex("strain", "reachBoth", { turn: -0.4 })], [S("L10"), ex("nervous", "stop", { turn: -0.45, lean: -12 })]], talk: ["L08", "L09", "L10"] })
    ],
    world: (t) => wardrobe(-140, 0, 0.95, clamp(win(t, S("L08"), E("L10")), 0.1, 1.15), false) + sweat(180, -680, t, S("L08"), 4),
    type: (t) => TY.pop(t, S("L09") + 0.3, "СИҚЫРЛЫ ШКАФ: +100 ЗАТ", 540, 260, { size: 70, color: "#f2c14e", wob: 4 })
  });

  // ================= 5. ХРУСТАЛЬ СЕРВИЗ + 5 МИНУТ (L11, L12) =================
  MK.S5 = S("L11");
  add({
    bg: () => BG.living(), bgKey: "living",
    t0: S("L11"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L11"), { x: -100, y: -450, z: 1.1 }], [S("L12"), { x: 60, y: -450, z: 1.2 }]],
    actors: [
      ACT.mom({ x: -160, y: 0, s: 0.72, keys: [[S("L11"), ex("determined", "reach", { turn: 0.25 })]], talk: ["L11"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L11"), ex("tired", "armsDown", { turn: -0.2 })], [S("L12"), ex("strain", "shrug", { turn: -0.15 })]], talk: ["L12"] })
    ],
    world: (t) => teaSet(0, -180, 0.85) + sweat(160, -680, t, S("L12"), 3),
    type: (t) => TY.pop(t, S("L11") + 0.3, "АЛТЫН СЕРВИЗ ШЫҚТЫ!", 540, 260, { size: 76, color: "#f6d55c" }) +
                 TY.stamp(t, S("L12") + 0.3, "05:00 ҚАЛДЫ", 540, 380, { size: 76, color: "#ff5252" })
  });

  // ================= 6. ДІҢ-ДІҢ! ЖӘНЕ 180° КҮЛКІ (L13, L14, L15) =================
  MK.S6 = S("L13");
  const SMILE = S("L14") + 1.2;
  add({
    bg: () => BG.living({ doorOpen: true }), bgKey: "livingOpen",
    t0: S("L13"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L13"), { x: 0, y: -450, z: 1.15 }], [SMILE, { x: 0, y: -450, z: 1.05 }]],
    actors: [
      ACT.mom({ x: -180, y: 0, s: 0.72, keys: [[S("L13"), ex("scared", "armsDown", { turn: 0.1 })], [SMILE, ex("happySmile", "cheer", { turn: 0.2 })]], talk: ["L15"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L13"), ex("shock", "shrug", { turn: -0.1 })], [SMILE, ex("happySmile", "wave", { turn: -0.2 })]], talk: ["L13", "L14"] })
    ],
    world: (t) => wardrobe(300, 0, 0.75, 1.0, false),
    type: (t) => (t < SMILE ? TY.pop(t, S("L13") + 0.1, "ДІҢ-ДІҢ!", 540, 270, { size: 110, color: "#ff5252", wob: 6 })
      : TY.pop(t, SMILE, "ТӨРЛЕТІҢІЗДЕР! :)", 540, 270, { size: 84, color: "#7cc47a" }))
  });

  // ================= 7. ҚОНАҚ: «БІЗ 5 МИНУТҚА ҒАНА!» (L16, L17) =================
  MK.S7 = S("L16");
  const FRZ_Q = E("L16") + 0.2;
  add({
    bg: () => BG.living({ doorOpen: true }), bgKey: "livingOpen",
    t0: S("L16"), c0: { x: 0, y: -450 }, fadeIn: 0.2, freeze: FRZ_Q,
    cam: [[S("L16"), { x: -80, y: -450, z: 1.1 }], [S("L17"), { x: 100, y: -450, z: 1.25 }]],
    actors: [
      ACT.aunt1({ x: -240, y: 0, s: 0.72, keys: [[S("L16"), ex("happySmile", "stop", { turn: 0.3 })]], talk: ["L16"] }),
      ACT.artur({ x: 140, y: 0, s: 0.70, keys: [[S("L16"), ex("happySmile", "wave", { turn: -0.2 })], [S("L17"), ex("shock", "armsDown", { turn: -0.2, eye: { scale: 1.35 } })]], talk: ["L17"] })
    ],
    fx: (t) => (t >= S("L17") ? freezeFx(t, S("L17"), { vig: 0.25 }) : {}),
    type: (t) => TY.stamp(t, S("L17") + 0.2, "5 МИНУТ ҮШІН БЕ?!", 540, 280, { size: 88, color: "#ff5252", rot: -5 })
  });

  // ================= 8. ШКАФТЫҢ АТЫЛЫП АШЫЛУЫ (L18) =================
  MK.S8 = S("L18");
  add({
    bg: () => BG.living(), bgKey: "living",
    t0: S("L18"), c0: { x: 0, y: -450 }, fadeIn: 0.15,
    cam: [[S("L18"), { x: 0, y: -450, z: 1.05 }], [E("L18"), { x: 0, y: -450, z: 1.2 }]],
    shake: (t) => (t < S("L18") + 1.0 ? 18 : 0),
    actors: [
      ACT.artur({ x: 240, y: 0, s: 0.70, keys: [[S("L18"), ex("deadpan", "shrug", { turn: -0.2 })]], talk: ["L18"] })
    ],
    world: (t) => wardrobe(-120, 0, 1.0, 0, true) + puff(-120, -320, t, S("L18") + 0.4, 1.2, 12, "#f6d55c"),
    type: (t) => TY.pop(t, S("L18") + 0.3, "БАБАХ! ШКАФ АШЫЛДЫ", 540, 260, { size: 80, color: "#ff5252", wob: 6 })
  });

  // ================= 9. ТҮЙІН + КЕҢЕС (L19) =================
  MK.S9 = S("L19");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L19"), c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[S("L19"), { x: 0, y: -560, z: 1.15 }], [E("L19") + 1, { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[S("L19"), ex("calmSmile", "fingerUp", { turn: 0 })]], talk: ["L19"] })
    ],
    type: (t) => TY.stamp(t, S("L19") + 0.4, "ШКАФТЫ БЕКІТІП ҚОЙ!", 540, 320, { size: 74, color: "#f2c14e" })
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.SONGY_TOTAL = 94;

  G.SONGY_AUDIO = function (a) {
    const { mus, fx, S, E, Wt } = a;
    mus("morning", 0, S("L03"), -14, { fi: 0.5, fo: 0.5 });
    fx("whoosh", 0.3, -12);

    mus("chase", S("L03"), S("L05"), -12, { fi: 0.3, fo: 0.4 });
    fx("scream", S("L03"), -14);
    fx("stamp", S("L03") + 0.2, -8);

    mus("montage3", S("L05"), S("L13"), -13, { fi: 0.5, fo: 0.4 });
    fx("scratch", S("L07"), -8);
    fx("strain", S("L08") + 0.5, -9);
    fx("creak", S("L10") + 0.3, -9);

    fx("bell1", S("L13") + 0.2, -6); // есік қоңырауы
    mus("warm", S("L14"), S("L17"), -13, { fi: 0.4, fo: 0.4 });
    fx("ping", S("L14") + 1.2, -9);

    fx("dundun", S("L17"), -6); // 5 минут үшін бе?!
    fx("thud", S("L18") + 0.4, -5); // шкаф атылуы
    fx("boing", S("L18") + 0.55, -8);

    mus("outro", S("L19"), a.TOTAL, -12, { fi: 0.6, fo: 2.0 });
    fx("pops", S("L19") + 0.3, -10);
  };
})(typeof window !== "undefined" ? window : globalThis);
