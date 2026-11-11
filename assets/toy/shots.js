/* «Қазақтың тойы: 200 адам және даяшы Артур» — толық сахналар (Reels 1080×1920).
 * Қозғалтқыш: assets/common/reels-engine.js (REELS / SONGY).
 */
(function (G) {
  "use strict";
  const Q = G.REELS || G.SONGY, B = G.SONGY_BG, TB = G.TOY_BG, RIG = G.ArturRig;
  const { S, E, LN, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { hotMeatPlatter, sarkytBag, shashuCoins, banquetTable } = TB;

  const SHOTS = [
    // ---------- 0. Суық ашылу (0.00 → 15.90) ----------
    {
      t0: 0,
      bg: "host",
      cam: [
        [0, { x: 0, y: -450, z: 1.05, r: 0 }],
        [4, { x: 0, y: -450, z: 1.25, r: 0 }, eio],
        [12, { x: 0, y: -450, z: 1.35, r: 0 }],
      ],
      actors: [
        {
          lines: ["L01", "L02"],
          base: { x: 0, y: 0, s: 1.25, look: "artur", outfit: "casual" },
          track: [
            [0, "POSES.idle+EXPR.shock"],
            [4, "POSES.point+EXPR.thinking"],
            [9.5, "POSES.thumbs+EXPR.smug"],
          ],
        },
      ],
      type: (t) => TY.swing(t, 1.2, "ҚАЗАҚТЫҢ ТОЙЫ 🎉", 540, 360, { size: 85, color: "#facc15" }),
    },

    // ---------- 1. Күләш тәте (15.90 → 23.26) ----------
    {
      t0: S("L03") - 0.2,
      bg: "kitchen",
      cam: [
        [S("L03"), { x: 80, y: -380, z: 1.05, r: 0 }],
        [S("L03") + 3.5, { x: 0, y: -380, z: 1.2, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L03"],
          base: { x: 120, y: 0, s: 1.15, look: "mom", outfit: "momHome" },
          track: [[S("L03"), "POSES.wave+EXPR.happy"]],
        },
        {
          base: { x: -140, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [[S("L03"), "POSES.idle+EXPR.calm"]],
        },
      ],
      type: (t) => TY.pop(t, S("L03") + 1.5, "КҮЛӘШ ТӘТЕ (АСХАНА ГЕНЕРАЛЫ)", 540, 480, { size: 54, color: "#ef4444" }),
    },

    // ---------- 2. Тезис: Кино vs Майдан даласы (23.26 → 34.84) ----------
    {
      t0: S("L04") - 0.2,
      bg: "host",
      cam: [
        [S("L04"), { x: 0, y: -450, z: 1.1, r: 0 }],
        [S("L05"), { x: 0, y: -450, z: 1.35, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L04", "L05"],
          base: { x: 0, y: 0, s: 1.2, look: "artur", outfit: "casual" },
          track: [
            [S("L04"), "POSES.cheer+EXPR.happy"],
            [S("L05"), "POSES.shock+EXPR.shock"],
          ],
        },
      ],
      type: (t) => (t < S("L05") ? TY.pop(t, S("L04") + 0.5, "ОЙЛАҒАНЫМ: СЫПАЙЫ ҚОНАҚ 🕺", 540, 420, { size: 58, color: "#38bdf8" }) : TY.pop(t, S("L05"), "ШЫНДЫҚТА: 200 АДАМДЫҚ МАЙДАН! ⚔️", 540, 420, { size: 54, color: "#ef4444" })),
    },

    // ---------- 3. Каталог 1: Уақыт феномені (34.84 → 58.76) ----------
    {
      t0: S("L06") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L06"), { x: 0, y: -380, z: 1.05, r: 0 }],
        [S("L07"), { x: 0, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L06", "L07", "L08"],
          base: { x: 0, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [
            [S("L06"), "POSES.point+EXPR.thinking"],
            [S("L07"), "POSES.facepalm+EXPR.deadpan"],
            [S("L08"), "POSES.shock+EXPR.shock"],
          ],
        },
      ],
      type: (t) => (t < S("L08") ? TY.stamp(t, S("L07") + 0.5, "18:00 ➔ ЕШКІМ ЖОҚ! ⏳", 540, 420, { color: "#f59e0b" }) : TY.stamp(t, S("L08"), "21:30 ➔ 200 АДАМ ЛАП ҚОЙДЫ! 🏃‍♂️", 540, 420, { color: "#ef4444" })),
    },

    // ---------- 4. Каталог 2: Сарқыт құпиясы (58.76 → 67.10) ----------
    {
      t0: S("L09") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L09"), { x: -60, y: -380, z: 1.1, r: 0 }],
        [S("L09") + 4, { x: 40, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L09"],
          base: { x: -80, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [[S("L09"), "POSES.shock+EXPR.shock"]],
        },
      ],
      world: (t) => sarkytBag(160, 0, 1.4),
      type: (t) => TY.stamp(t, S("L09") + 0.3, "2. САРҚЫТ: АЛЫП ҚАРА ПАКЕТТЕР!", 540, 360, { color: "#f59e0b" }),
    },

    // ---------- 5. Каталог 3: "Қашан үйленесің?" (67.10 → 78.58) ----------
    {
      t0: S("L10") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L10"), { x: 0, y: -450, z: 1.15, r: 0 }],
        [S("L10") + 5, { x: 0, y: -450, z: 1.35, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L10"],
          base: { x: 0, y: 0, s: 1.2, look: "artur", outfit: "casual" },
          track: [[S("L10"), "POSES.facepalm+EXPR.deadpan"]],
        },
      ],
      type: (t) => TY.stamp(t, S("L10") + 0.5, "«БАЛАМ, ҚАШАН ҮЙЛЕНЕСІҢ?» 💍", 540, 420, { color: "#dc2626" }),
    },

    // ---------- 6. ЕТ ШЫҚТЫ! (78.58 → 91.60) ----------
    {
      t0: S("L11") - 0.2,
      bg: "kitchen",
      cam: [
        [S("L11"), { x: -60, y: -380, z: 1.05, r: 0 }],
        [S("L12"), { x: 60, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L11"],
          base: { x: -140, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [[S("L11"), "POSES.shock+EXPR.shock"]],
        },
        {
          lines: ["L12"],
          base: { x: 120, y: 0, s: 1.2, look: "mom", outfit: "momHome" },
          track: [[S("L12"), "POSES.point+EXPR.angry"]],
        },
      ],
      type: (t) => TY.pop(t, S("L11") + 3.5, "🚨 ЕТ ШЫҚТЫ! 🚨", 540, 460, { size: 76, color: "#ef4444" }),
    },

    // ---------- 7. 90 градус ыстық астау (91.60 → 102.16) ----------
    {
      t0: S("L13") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L13"), { x: 0, y: -450, z: 1.1, r: 0 }],
        [S("L14"), { x: 0, y: -450, z: 1.35, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L13", "L14"],
          base: { x: 0, y: 0, s: 1.2, look: "artur", outfit: "casual" },
          track: [
            [S("L13"), "POSES.carryBag+EXPR.strain"],
            [S("L14"), "POSES.strain+EXPR.strain"],
          ],
        },
      ],
      world: (t) => hotMeatPlatter(0, -180, 1.25),
      type: (t) => TY.pop(t, S("L14") + 1, "90° ЫСТЫҚ БАС ТАБАҚ! ♨️", 540, 460, { size: 62, color: "#facc15" }),
    },

    // ---------- 8. Бас табақтың дауы (102.16 → 125.38) ----------
    {
      t0: S("L15") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L15"), { x: -80, y: -380, z: 1.1, r: 0 }],
        [S("L16"), { x: 80, y: -380, z: 1.2, r: 0 }, eio],
        [S("L18"), { x: 0, y: -380, z: 1.35, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L15", "L16", "L17", "L18"],
          base: { x: 0, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [[S("L18"), "POSES.strain+EXPR.shock"]],
        },
      ],
      world: (t) => hotMeatPlatter(0, -160, 1.15),
      type: (t) => TY.pop(t, S("L18"), "ҚАЙДА АПАРАМЫН?! 🤯", 540, 480, { size: 68, color: "#ef4444" }),
    },

    // ---------- 9. Асаба: ШАШУУУ! (125.38 → 135.86) ----------
    {
      t0: S("L19") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L19"), { x: 0, y: -380, z: 1.15, r: 0 }],
        [S("L20"), { x: 0, y: -380, z: 1.35, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L19", "L20"],
          base: { x: 0, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [[S("L19"), "POSES.shock+EXPR.shock"]],
        },
      ],
      world: (t) => shashuCoins(0, 0, 1.35),
      type: (t) => TY.pop(t, S("L19") + 1, "АҒАЙЫН, ШАШУУУ! 🍬🪙", 540, 460, { size: 76, color: "#facc15" }),
    },

    // ---------- 10. Балалар шабуылы + Ұшу (135.86 → 148.78) ----------
    {
      t0: S("L21") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L21"), { x: 0, y: -400, z: 1.1, r: 0 }],
        [S("L23"), { x: 0, y: -450, z: 1.4, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L21", "L22", "L23"],
          base: { x: 0, y: 0, s: 1.2, look: "artur", outfit: "casual" },
          track: [
            [S("L21"), "POSES.strain+EXPR.shock"],
            [S("L23"), "POSES.shock+EXPR.shock"],
          ],
        },
      ],
      world: (t) => hotMeatPlatter(0, -220, 1.2),
      shake: (t) => (t >= S("L22") ? 9 : 0),
      type: (t) => (t >= S("L23") ? TY.pop(t, S("L23"), "ҰШЫП БАРАМЫН! 🦅", 540, 460, { size: 76, color: "#ef4444" }) : ""),
    },

    // ---------- 11. Кульминация: "ЕТТІ ТӨКПЕ!" (148.78 → 162.08) ----------
    {
      t0: S("L24") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L24"), { x: 0, y: -450, z: 1.25, r: 0 }],
        [S("L25"), { x: 0, y: -450, z: 1.5, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L24", "L25"],
          base: { x: 0, y: 0, s: 1.3, look: "artur", outfit: "casual" },
          track: [[S("L25"), "POSES.strain+EXPR.strain"]],
        },
      ],
      world: (t) => hotMeatPlatter(0, -200, 1.35),
      fx: (t) => ({ dof: 4, vig: 0.4 }),
      type: (t) => TY.pop(t, S("L25") + 1, "«ЕТТІ ТӨКПЕ!» 🥩", 540, 480, { size: 76, color: "#facc15" }),
    },

    // ---------- 12. Акробатикалық қону (162.08 → 171.88) ----------
    {
      t0: S("L26") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L26"), { x: 0, y: -380, z: 1.15, r: 0 }],
        [S("L27"), { x: 0, y: -380, z: 1.35, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L26", "L27"],
          base: { x: 0, y: 0, s: 1.2, look: "artur", outfit: "casual" },
          track: [
            [S("L26"), "POSES.thumbs+EXPR.smug"],
            [S("L27"), "POSES.cheer+EXPR.happy"],
          ],
        },
      ],
      world: (t) => hotMeatPlatter(0, -100, 1.3),
      type: (t) => TY.pop(t, S("L27") + 0.3, "БІР ТАМШЫ ДА ШАШЫЛМАДЫ! ✨", 540, 460, { size: 54, color: "#22c55e" }),
    },

    // ---------- 13. Бас құданың батасы (171.88 → 187.58) ----------
    {
      t0: S("L28") - 0.2,
      bg: "banquetHall",
      cam: [
        [S("L28"), { x: 80, y: -380, z: 1.15, r: 0 }],
        [S("L29"), { x: -60, y: -380, z: 1.3, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L28"],
          base: { x: 120, y: 0, s: 1.15, look: "dad", outfit: "ata" },
          track: [[S("L28"), "POSES.wave+EXPR.happy"]],
        },
        {
          lines: ["L29"],
          base: { x: -140, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [[S("L29"), "POSES.thumbs+EXPR.happy"]],
        },
      ],
      type: (t) => TY.pop(t, S("L28") + 2, "«ЦИРКТІҢ БАТЫРЫ!» 🎪", 540, 460, { size: 66, color: "#facc15" }),
    },

    // ---------- 14. Түйін + Кеңестер + Соңы (187.58 → 212.00) ----------
    {
      t0: S("L30") - 0.2,
      bg: "host",
      cam: [
        [S("L30"), { x: 0, y: -450, z: 1.15, r: 0 }],
        [S("L32"), { x: 0, y: -450, z: 1.3, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L30", "L31", "L32"],
          base: { x: 0, y: 0, s: 1.25, look: "artur", outfit: "casual" },
          track: [
            [S("L30"), "POSES.point+EXPR.happy"],
            [S("L31"), "POSES.thumbs+EXPR.happy"],
            [S("L32"), "POSES.wave+EXPR.happy"],
          ],
        },
      ],
      type: (t) => (t < S("L31") + 3 ? TY.stamp(t, S("L30") + 1, "1. ҚАЛЫҢ ҚОЛҒАП КИ! 🧤", 540, 460, { color: "#ef4444" }) : t < S("L32") ? TY.stamp(t, S("L31") + 3.5, "2. ДАЯШЫҒА ЖОЛ БЕР! 🤝", 540, 460, { color: "#22c55e" }) : TY.pop(t, S("L32") + 1, "КОММЕНТКЕ ЖАЗ! 👇", 540, 460, { size: 70, color: "#38bdf8" })),
    },
  ];

  G.REELS_SHOTS = SHOTS;
  G.SONGY_SHOTS = SHOTS;
})(typeof window !== "undefined" ? window : globalThis);
