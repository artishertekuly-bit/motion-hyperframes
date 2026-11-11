/* «Курьер Артур және 9-қабаттағы қарбыз» — толық кадрлар мен сахналар (Reels 1080×1920).
 * Қозғалтқыш: assets/common/reels-engine.js (REELS / SONGY).
 */
(function (G) {
  "use strict";
  const Q = G.REELS || G.SONGY, B = G.SONGY_BG, CB = G.COURIER_BG, RIG = G.ArturRig;
  const { S, E, LN, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { courierBag, watermelon, waterJug, alabai, intercom, navigatorScreen, stairsView, elevatorDoor, grandmaDoor } = CB;

  const POSES = {
    phoneUp: { armL: { sh: 64, el: 108, hand: "fist", propFront: B.PROPS.phone() } },
    armsDown: { armL: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" }, armR: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" } },
    thumbs: { armR: { sh: 30, el: -110, hand: "fist" } },
    carryBag: { armL: { sh: 25, el: 45, hand: "fist" }, armR: { sh: 25, el: 45, hand: "fist" } },
    strain: { eye: { lidTop: 0.98, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -6, angle: 20, liftL: 0, liftR: 0 }, mouth: "growl", fx: { sweat: 1, blush: 1, vein: 1 } },
    shock: { eye: { scale: 1.3, lidTop: 0, lidBot: 0, px: 0, py: 0, pupil: 0.7 }, brow: { lift: 14, angle: -8 }, mouth: "gasp", fx: { sweat: 0.8 } },
    deadpan: { eye: { lidTop: 0.55, lidBot: 0.08, lidTilt: 0, px: 0, py: 0, pupil: 0.9 }, brow: { lift: -2, angle: 0 }, mouth: "hmm" },
    tired: { eye: { lidTop: 0.65, lidBot: 0.15, px: 0, py: 0.3, pupil: 1 }, brow: { lift: 4, angle: -10 }, mouth: "wavy", fx: { sweat: 0.7 } },
    happy: { eye: { scale: 1, lidTop: 0.4, lidBot: 0.35, pupil: 1 }, brow: { lift: 4, angle: -4 }, mouth: "smile" },
  };

  const SHOTS = [
    // ---------- 0. Суық ашылу (0.00 → 10.78) ----------
    {
      t0: 0,
      bg: "host",
      cam: [
        [0, { x: 0, y: -450, z: 1.05, r: 0 }],
        [4, { x: 0, y: -450, z: 1.25, r: 0 }, eio],
        [10.5, { x: 0, y: -450, z: 1.35, r: 0 }],
      ],
      actors: [
        {
          lines: ["L01", "L02"],
          base: { x: 0, y: 0, s: 1.25, look: "artur", outfit: "casual" },
          track: [
            [0, "POSES.idle+EXPR.shock"],
            [2.5, "POSES.chest+EXPR.sad"],
            [6.8, "POSES.point+EXPR.thinking"],
          ],
        },
      ],
      type: (t) => TY.swing(t, 1.2, "КУРЬЕР АРТУР", 540, 360, { size: 90, color: "#facc15" }),
    },

    // ---------- 1. Менеджер кеңседе (10.78 → 18.14) ----------
    {
      t0: S("L03") - 0.2,
      bg: "office",
      cam: [
        [S("L03"), { x: 0, y: -380, z: 1.0, r: 0 }],
        [S("L03") + 4, { x: 60, y: -380, z: 1.15, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L03"],
          base: { x: 80, y: 0, s: 1.1, look: "director", outfit: "casual" },
          track: [
            [S("L03"), "POSES.wave+EXPR.smug"],
            [S("L03") + 3.5, "POSES.point+EXPR.happy"],
          ],
        },
      ],
      world: (t) => courierBag(-120, -100, 0.9),
      type: (t) => TY.pop(t, S("L03") + 4.5, "20 000 ₸ / КҮНІНЕ!", 540, 520, { size: 76, color: "#22c55e" }),
    },

    // ---------- 2. Тезис: Күту vs Шындық (18.14 → 29.14) ----------
    {
      t0: S("L04") - 0.2,
      bg: "host",
      cam: [
        [S("L04"), { x: 0, y: -450, z: 1.1, r: 0 }],
        [S("L05"), { x: 0, y: -450, z: 1.3, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L04", "L05"],
          base: { x: 0, y: 0, s: 1.2, look: "artur", outfit: "casual" },
          track: [
            [S("L04"), "POSES.thumbs+EXPR.smug"],
            [S("L04") + 3, "POSES.cheer+EXPR.happy"],
            [S("L05"), "POSES.facepalm+EXPR.deadpan"],
          ],
        },
      ],
      fx: (t) => ({ lb: t >= S("L04") && t < S("L05") ? 0.8 : 0 }),
      type: (t) => (t < S("L05") ? TY.pop(t, S("L04") + 0.5, "КИНОДАҒЫ КУРЬЕР 🛵", 540, 420, { size: 60, color: "#38bdf8" }) : TY.pop(t, S("L05"), "ШЫН ӨМІРДЕ... 💀", 540, 420, { size: 68, color: "#ef4444" })),
    },

    // ---------- 3. Каталог 1-заң: 2GIS (29.14 → 42.26) ----------
    {
      t0: S("L06") - 0.2,
      bg: "street",
      cam: [
        [S("L06"), { x: -80, y: -360, z: 1.0, r: 0 }],
        [S("L07") + 2, { x: 0, y: -360, z: 1.2, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L06", "L07"],
          base: { x: -160, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [
            [S("L06"), "POSES.phoneUp+EXPR.shock"],
            [S("L07"), "POSES.shrug+EXPR.angry"],
          ],
        },
      ],
      world: (t) => navigatorScreen(180, -280, 0.75),
      type: (t) => TY.stamp(t, S("L06") + 0.3, "1-ЗАҢ: 2GIS ҚАТЕЛІГІ", 540, 340, { color: "#ef4444" }),
    },

    // ---------- 4. Каталог 2-заң: Домофон (42.26 → 55.70) ----------
    {
      t0: S("L08") - 0.2,
      bg: "entrance",
      cam: [
        [S("L08"), { x: 0, y: -380, z: 1.1, r: 0 }],
        [S("L09") + 3, { x: 40, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L08", "L09"],
          base: { x: -80, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [
            [S("L08"), "POSES.point+EXPR.thinking"],
            [S("L09"), "POSES.strain+EXPR.angry"],
          ],
        },
      ],
      world: (t) => intercom(160, -320, 1.2),
      type: (t) => TY.stamp(t, S("L08") + 0.3, "2-ЗАҢ: ДОМОФОН КОДЫ", 540, 340, { color: "#f59e0b" }),
    },

    // ---------- 5. Каталог 3-заң: Карма және қарбыз (55.70 → 71.78) ----------
    {
      t0: S("L10") - 0.2,
      bg: "host",
      cam: [
        [S("L10"), { x: 0, y: -450, z: 1.05, r: 0 }],
        [S("L11"), { x: 0, y: -450, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L10", "L11"],
          base: { x: 0, y: 0, s: 1.2, look: "artur", outfit: "casual" },
          track: [
            [S("L10"), "POSES.idle+EXPR.calm"],
            [S("L11"), "POSES.strain+EXPR.shock"],
          ],
        },
      ],
      world: (t) => (t >= S("L11") ? watermelon(-180, -140, 1.1) + waterJug(180, -140, 1.1) : ""),
      type: (t) => TY.stamp(t, S("L10") + 0.3, "3-ЗАҢ: ҚАРБЫЗ БЕН 9-ҚАБАТ", 540, 340, { color: "#dc2626" }),
    },

    // ---------- 6. Шұғыл тапсырыс (71.78 → 82.76) ----------
    {
      t0: S("L12") - 0.2,
      bg: "office",
      cam: [
        [S("L12"), { x: 0, y: -380, z: 1.05, r: 0 }],
        [S("L13"), { x: -60, y: -380, z: 1.2, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L12"],
          base: { x: 120, y: 0, s: 1.1, look: "director", outfit: "casual" },
          track: [[S("L12"), "POSES.point+EXPR.angry"]],
        },
        {
          lines: ["L13"],
          base: { x: -140, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [[S("L13"), "POSES.thumbs+EXPR.smug"]],
        },
      ],
      type: (t) => TY.pop(t, S("L12") + 2.5, "⏳ 30 МИНУТ!", 540, 480, { size: 70, color: "#ef4444" }),
    },

    // ---------- 7. ЕҢ ҮЛКЕН ҚАТЕЛІК (82.76 → 87.02) ----------
    {
      t0: S("L14") - 0.1,
      bg: "office",
      cam: [[S("L14"), { x: -80, y: -420, z: 1.45, r: 0 }]],
      still: true,
      actors: [
        {
          lines: ["L14"],
          base: { x: -80, y: 0, s: 1.35, look: "artur", outfit: "casual" },
          track: [[S("L14"), "POSES.thumbs+EXPR.smug"]],
        },
      ],
      fx: (t) => ({ sat: 0.15, vig: 0.5 }),
      type: (t) => TY.stamp(t, S("L14") + 0.2, "ЕҢ ҮЛКЕН ҚАТЕЛІК!", 540, 560, { size: 76, color: "#ef4444" }),
    },

    // ---------- 8. Сөмкенің ауырлығы (87.02 → 102.40) ----------
    {
      t0: S("L15") - 0.2,
      bg: "street",
      cam: [
        [S("L15"), { x: 0, y: -360, z: 1.05, r: 0 }],
        [S("L16"), { x: 0, y: -360, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L15", "L16"],
          base: { x: 0, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [
            [S("L15"), "POSES.strain+EXPR.shock"],
            [S("L16"), "POSES.carryBag+EXPR.tired"],
          ],
        },
      ],
      world: (t) => courierBag(0, -60, 1.4) + watermelon(-140, 0, 0.9),
      type: (t) => TY.pop(t, S("L15") + 4, "18 КГ ҚАРБЫЗ + СУ! 🍉", 540, 480, { size: 60, color: "#facc15" }),
    },

    // ---------- 9. Қараңғы аула + Алабай (102.40 → 111.78) ----------
    {
      t0: S("L17") - 0.2,
      bg: "nightYard",
      cam: [
        [S("L17"), { x: -100, y: -380, z: 1.05, r: 0 }],
        [S("L18"), { x: 80, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L17", "L18"],
          base: { x: -160, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [
            [S("L17"), "POSES.idle+EXPR.calm"],
            [S("L18"), "POSES.shock+EXPR.shock"],
          ],
        },
      ],
      world: (t) => alabai(180, 0, 1.25, { angry: t >= S("L18") }),
      type: (t) => TY.pop(t, S("L18") + 1.5, "АЛАБАЙ АҚТӨС! 🐶", 540, 440, { size: 66, color: "#ef4444" }),
    },

    // ---------- 10. Вестерн дуэлі (111.78 → 124.42) ----------
    {
      t0: S("L19") - 0.2,
      bg: "nightYard",
      cam: [
        [S("L19"), { x: 0, y: -420, z: 1.2, r: 0 }],
        [S("L20"), { x: 0, y: -420, z: 1.45, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L19", "L20"],
          base: { x: -120, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [[S("L19"), "POSES.strain+EXPR.scared"]],
        },
      ],
      world: (t) => alabai(140, 0, 1.2, { angry: true }),
      fx: (t) => ({ lb: 0.7, vig: 0.4 }),
      type: (t) => TY.pop(t, S("L19") + 2, "ВЕСТЕРН ДУЭЛІ 🤠", 540, 480, { size: 62, color: "#f59e0b" }),
    },

    // ---------- 11. Зымырап қашу (124.42 → 134.34) ----------
    {
      t0: S("L21") - 0.2,
      bg: "street",
      cam: [
        [S("L21"), { x: -100, y: -380, z: 1.05, r: 0 }],
        [S("L21") + 5, { x: 180, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L21"],
          base: { x: 40, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [[S("L21"), "POSES.carryBag+EXPR.shock"]],
        },
      ],
      world: (t) => alabai(-220, 0, 1.1, { angry: true }),
      shake: (t) => (t >= S("L21") + 4 ? 6 : 0),
      type: (t) => TY.pop(t, S("L21") + 5, "ҚАШШШ! 💨", 540, 420, { size: 84, color: "#ef4444" }),
    },

    // ---------- 12. Подъезд және ЛИФТ ЖӨНДЕУДЕ (134.34 → 153.48) ----------
    {
      t0: S("L22") - 0.2,
      bg: "entrance",
      cam: [
        [S("L22"), { x: 0, y: -380, z: 1.05, r: 0 }],
        [S("L23"), { x: 0, y: -450, z: 1.35, r: 0 }, eio],
        [S("L25"), { x: 0, y: -450, z: 1.5, r: 0 }],
      ],
      actors: [
        {
          lines: ["L22", "L23", "L24", "L25"],
          base: { x: -140, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [
            [S("L22"), "POSES.chest+EXPR.shock"],
            [S("L23"), "POSES.facepalm+EXPR.deadpan"],
            [S("L25"), "POSES.phoneUp+EXPR.shock"],
          ],
        },
      ],
      type: (t) => (t >= S("L23") ? TY.stamp(t, S("L23") + 1, "ЛИФТ ЖӨНДЕУДЕ! 🚫", 540, 420, { color: "#dc2626" }) : ""),
    },

    // ---------- 13. Кульминация: 9-қабатқа өрмелеу (153.48 → 178.02) ----------
    {
      t0: S("L26") - 0.2,
      bg: "stairs",
      cam: [
        [S("L26"), { x: 0, y: -420, z: 1.1, r: 0 }],
        [S("L27"), { x: 0, y: -420, z: 1.35, r: 0 }, eio],
        [S("L28"), { x: 0, y: -450, z: 1.45, r: 0 }],
      ],
      actors: [
        {
          lines: ["L26", "L27", "L28"],
          base: { x: 0, y: 0, s: 1.25, look: "artur", outfit: "casual" },
          track: [
            [S("L26"), "POSES.carryBag+EXPR.strain"],
            [S("L27"), "POSES.strain+EXPR.strain"],
            [S("L28"), "POSES.point+EXPR.tired"],
          ],
        },
      ],
      world: (t) => courierBag(0, -60, 1.4),
      fx: (t) => ({ dof: t >= S("L27") ? 4 : 0, vig: 0.35 }),
      type: (t) => (t < S("L27") + 4 ? TY.pop(t, S("L27"), "3-ҚАБАТ... 🥵", 540, 460, { size: 66, color: "#facc15" }) : TY.pop(t, S("L27") + 5, "9-ҚАБАТ! 🏁", 540, 460, { size: 76, color: "#22c55e" })),
    },

    // ---------- 14. Әженің 50 теңгесі (178.02 → 197.72) ----------
    {
      t0: S("L29") - 0.2,
      bg: "grandmaFlat",
      cam: [
        [S("L29"), { x: 0, y: -380, z: 1.1, r: 0 }],
        [S("L30"), { x: -60, y: -380, z: 1.3, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L29"],
          base: { x: 140, y: 0, s: 1.05, look: "aje", outfit: "aje" },
          track: [[S("L29"), "POSES.wave+EXPR.happy"]],
        },
        {
          lines: ["L30"],
          base: { x: -140, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [[S("L30"), "POSES.thumbs+EXPR.happy"]],
        },
      ],
      type: (t) => TY.pop(t, S("L30") + 1, "50 ₸ СҮЙІНШІ + КӘМПИТ 🍬", 540, 440, { size: 58, color: "#facc15" }),
    },

    // ---------- 15. Түйін + Екі кеңес (197.72 → 212.36) ----------
    {
      t0: S("L31") - 0.2,
      bg: "host",
      cam: [
        [S("L31"), { x: 0, y: -450, z: 1.15, r: 0 }],
        [S("L31") + 6, { x: 0, y: -450, z: 1.3, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L31"],
          base: { x: 0, y: 0, s: 1.25, look: "artur", outfit: "casual" },
          track: [
            [S("L31"), "POSES.point+EXPR.happy"],
            [S("L31") + 6, "POSES.thumbs+EXPR.happy"],
          ],
        },
      ],
      type: (t) => (t < S("L31") + 6 ? TY.stamp(t, S("L31") + 0.5, "1. ЛИФТКЕ СЕНБЕ! 🚫", 540, 460, { color: "#ef4444" }) : TY.stamp(t, S("L31") + 6.5, "2. КУРЬЕРГЕ ШАЙ БЕР! ☕", 540, 460, { color: "#22c55e" })),
    },

    // ---------- 16. CTA + Сау болыңдар (212.36 → 220.96) ----------
    {
      t0: S("L32") - 0.2,
      bg: "host",
      cam: [[S("L32"), { x: 0, y: -450, z: 1.25, r: 0 }]],
      actors: [
        {
          lines: ["L32"],
          base: { x: 0, y: 0, s: 1.25, look: "artur", outfit: "casual" },
          track: [[S("L32"), "POSES.wave+EXPR.happy"]],
        },
      ],
      type: (t) => TY.pop(t, S("L32") + 1, "КОММЕНТКЕ ЖАЗ! 👇", 540, 460, { size: 70, color: "#38bdf8" }),
    },
  ];

  G.REELS_SHOTS = SHOTS;
  G.SONGY_SHOTS = SHOTS;
})(typeof window !== "undefined" ? window : globalThis);
