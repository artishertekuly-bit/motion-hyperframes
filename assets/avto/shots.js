/* «Автомектеп: 13-ші емтихан және эстакада» — толық сахналар (Reels 1080×1920).
 * Қозғалтқыш: assets/common/reels-engine.js (REELS / SONGY).
 */
(function (G) {
  "use strict";
  const Q = G.REELS || G.SONGY, B = G.SONGY_BG, AB = G.AVTO_BG, RIG = G.ArturRig;
  const { S, E, LN, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { drivingCar, trafficCone, pigeonTolegen, handbrake, estakadaRamp, driverLicense } = AB;

  const SHOTS = [
    // ---------- 0. Суық ашылу (0.00 → 14.78) ----------
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
            [0, "POSES.idle+EXPR.smug"],
            [4, "POSES.point+EXPR.happy"],
            [8, "POSES.thumbs+EXPR.smug"],
          ],
        },
      ],
      type: (t) => TY.swing(t, 1.2, "АВТОМЕКТЕП 🚗", 540, 360, { size: 90, color: "#facc15" }),
    },

    // ---------- 1. Серік ағайдың алғашқы сабағы (14.78 → 24.70) ----------
    {
      t0: S("L03") - 0.2,
      bg: "autodrom",
      cam: [
        [S("L03"), { x: 80, y: -380, z: 1.05, r: 0 }],
        [S("L03") + 4, { x: 0, y: -380, z: 1.2, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L03"],
          base: { x: 120, y: 0, s: 1.15, look: "dad", outfit: "casual" },
          track: [[S("L03"), "POSES.point+EXPR.angry"]],
        },
        {
          base: { x: -140, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [[S("L03"), "POSES.idle+EXPR.calm"]],
        },
      ],
      world: (t) => drivingCar(0, 0, 1.1),
      type: (t) => TY.pop(t, S("L03") + 2, "СЕРІК АҒАЙ (25 ЖЫЛ)", 540, 480, { size: 60, color: "#ef4444" }),
    },

    // ---------- 2. Тезис: NFS vs Шындық (24.70 → 36.16) ----------
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
            [S("L04"), "POSES.cheer+EXPR.happy"],
            [S("L05"), "POSES.shock+EXPR.shock"],
          ],
        },
      ],
      type: (t) => (t < S("L05") ? TY.pop(t, S("L04") + 0.5, "ОЙЫНДА: ФОРМУЛА-1 🏎️", 540, 420, { size: 62, color: "#38bdf8" }) : TY.pop(t, S("L05"), "ШЫНДЫҚТА: СЕКІРІП ӨШУ 💀", 540, 420, { size: 62, color: "#ef4444" })),
    },

    // ---------- 3. Көліктің сөнуі + Валидол (36.16 → 49.46) ----------
    {
      t0: S("L06") - 0.2,
      bg: "autodrom",
      cam: [
        [S("L06"), { x: 0, y: -380, z: 1.05, r: 0 }],
        [S("L07"), { x: 80, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L06"],
          base: { x: -120, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [[S("L06"), "POSES.strain+EXPR.shock"]],
        },
        {
          lines: ["L07"],
          base: { x: 140, y: 0, s: 1.15, look: "dad", outfit: "casual" },
          track: [[S("L07"), "POSES.facepalm+EXPR.angry"]],
        },
      ],
      world: (t) => drivingCar(0, 0, 1.2, { smoke: true }),
      shake: (t) => (t >= S("L06") && t < S("L06") + 1.5 ? 8 : 0),
      type: (t) => TY.pop(t, S("L07") + 1.5, "ВАЛИДОЛ 💊", 540, 480, { size: 76, color: "#facc15" }),
    },

    // ---------- 4. Каталог 1: Змейка (49.46 → 60.42) ----------
    {
      t0: S("L08") - 0.2,
      bg: "autodrom",
      cam: [
        [S("L08"), { x: 0, y: -380, z: 1.05, r: 0 }],
        [S("L09"), { x: 0, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L08", "L09"],
          base: { x: 0, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [
            [S("L08"), "POSES.point+EXPR.thinking"],
            [S("L09"), "POSES.shock+EXPR.scared"],
          ],
        },
      ],
      world: (t) => trafficCone(-160, 0, 1.1, true) + trafficCone(160, 0, 1.1, false),
      type: (t) => TY.stamp(t, S("L08") + 0.3, "1. ЗМЕЙКА: КОНУСТАР ЖАУЫ!", 540, 360, { color: "#ef4444" }),
    },

    // ---------- 5. Каталог 2: Парковка (60.42 → 68.60) ----------
    {
      t0: S("L10") - 0.2,
      bg: "autodrom",
      cam: [
        [S("L10"), { x: 0, y: -380, z: 1.1, r: 0 }],
        [S("L10") + 4, { x: 40, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L10"],
          base: { x: -80, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [[S("L10"), "POSES.facepalm+EXPR.deadpan"]],
        },
      ],
      world: (t) => drivingCar(120, 0, 1.0),
      type: (t) => TY.stamp(t, S("L10") + 0.3, "2. ПАРАЛЛЕЛЬ ПАРКОВКА", 540, 360, { color: "#f59e0b" }),
    },

    // ---------- 6. Каталог 3: Эстакада (68.60 → 80.78) ----------
    {
      t0: S("L11") - 0.2,
      bg: "estakada",
      cam: [
        [S("L11"), { x: 0, y: -450, z: 1.05, r: 0 }],
        [S("L12"), { x: 0, y: -450, z: 1.3, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L11", "L12"],
          base: { x: 0, y: 0, s: 1.2, look: "artur", outfit: "casual" },
          track: [
            [S("L11"), "POSES.strain+EXPR.shock"],
            [S("L12"), "POSES.strain+EXPR.strain"],
          ],
        },
      ],
      type: (t) => TY.stamp(t, S("L11") + 0.3, "3. ШАЙТАН ЭСТАКАДА ⛰️", 540, 360, { color: "#dc2626" }),
    },

    // ---------- 7. Сенімділік + ЕҢ ҮЛКЕН ҚАТЕЛІК (80.78 → 92.20) ----------
    {
      t0: S("L13") - 0.2,
      bg: "host",
      cam: [
        [S("L13"), { x: 0, y: -450, z: 1.15, r: 0 }],
        [S("L14"), { x: 0, y: -450, z: 1.45, r: 0 }],
      ],
      still: true,
      actors: [
        {
          lines: ["L13", "L14"],
          base: { x: 0, y: 0, s: 1.25, look: "artur", outfit: "casual" },
          track: [
            [S("L13"), "POSES.thumbs+EXPR.smug"],
            [S("L14"), "POSES.thumbs+EXPR.smug"],
          ],
        },
      ],
      fx: (t) => ({ sat: t >= S("L14") ? 0.15 : 1, vig: t >= S("L14") ? 0.5 : 0 }),
      type: (t) => (t >= S("L14") ? TY.stamp(t, S("L14") + 0.2, "ЕҢ ҮЛКЕН ҚАТЕЛІК!", 540, 560, { size: 76, color: "#ef4444" }) : ""),
    },

    // ---------- 8. ЦОН және инспектор Қанат аға (92.20 → 105.78) ----------
    {
      t0: S("L15") - 0.2,
      bg: "autodrom",
      cam: [
        [S("L15"), { x: -80, y: -380, z: 1.05, r: 0 }],
        [S("L16"), { x: 80, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L15"],
          base: { x: -140, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [[S("L15"), "POSES.idle+EXPR.scared"]],
        },
        {
          lines: ["L16"],
          base: { x: 120, y: 0, s: 1.15, look: "director", outfit: "casual" },
          track: [[S("L16"), "POSES.point+EXPR.deadpan"]],
        },
      ],
      world: (t) => drivingCar(0, 0, 1.15),
      type: (t) => TY.pop(t, S("L16") + 1, "ЦОН: ЕМТИХАН АЛУШЫ 📋", 540, 480, { size: 60, color: "#ef4444" }),
    },

    // ---------- 9. Змейка мен парковкадан өту (105.78 → 119.48) ----------
    {
      t0: S("L17") - 0.2,
      bg: "autodrom",
      cam: [
        [S("L17"), { x: 0, y: -380, z: 1.05, r: 0 }],
        [S("L18"), { x: 0, y: -380, z: 1.25, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L17", "L18", "L19"],
          base: { x: 0, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [
            [S("L17"), "POSES.strain+EXPR.scared"],
            [S("L18"), "POSES.cheer+EXPR.happy"],
          ],
        },
      ],
      world: (t) => drivingCar(0, 0, 1.2) + trafficCone(180, 0, 1.0, false),
      type: (t) => TY.pop(t, S("L18") + 2, "ЗМЕЙКА ӨТТІ! ✓", 540, 460, { size: 70, color: "#22c55e" }),
    },

    // ---------- 10. Көгершін Төлеген! (119.48 → 136.98) ----------
    {
      t0: S("L20") - 0.2,
      bg: "autodrom",
      cam: [
        [S("L20"), { x: -60, y: -380, z: 1.1, r: 0 }],
        [S("L21"), { x: 120, y: -380, z: 1.4, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L20", "L21", "L22"],
          base: { x: -160, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [
            [S("L20"), "POSES.shock+EXPR.shock"],
            [S("L22"), "POSES.facepalm+EXPR.deadpan"],
          ],
        },
      ],
      world: (t) => pigeonTolegen(140, 0, 1.8),
      type: (t) => TY.pop(t, S("L21") + 1, "КӨГЕРШІН ТӨЛЕГЕН 🐦", 540, 460, { size: 62, color: "#facc15" }),
    },

    // ---------- 11. Көгершінмен келіссөз (136.98 → 149.48) ----------
    {
      t0: S("L23") - 0.2,
      bg: "autodrom",
      cam: [
        [S("L23"), { x: 0, y: -400, z: 1.2, r: 0 }],
        [S("L24"), { x: 0, y: -400, z: 1.35, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L23", "L24"],
          base: { x: -100, y: 0, s: 1.15, look: "artur", outfit: "casual" },
          track: [
            [S("L23"), "POSES.point+EXPR.thinking"],
            [S("L24"), "POSES.happy+EXPR.happy"],
          ],
        },
      ],
      world: (t) => pigeonTolegen(180, 0, 1.4),
      type: (t) => TY.pop(t, S("L24") + 1, "ҰШЫП КЕТТІ! 🕊️", 540, 460, { size: 66, color: "#22c55e" }),
    },

    // ---------- 12. Эстакада және артқа сырғу (149.48 → 167.58) ----------
    {
      t0: S("L25") - 0.2,
      bg: "estakada",
      cam: [
        [S("L25"), { x: 0, y: -450, z: 1.1, r: 0 }],
        [S("L27"), { x: 0, y: -450, z: 1.35, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L25", "L26", "L27"],
          base: { x: 0, y: 0, s: 1.2, look: "artur", outfit: "casual" },
          track: [
            [S("L25"), "POSES.strain+EXPR.strain"],
            [S("L27"), "POSES.strain+EXPR.shock"],
          ],
        },
      ],
      world: (t) => drivingCar(0, 0, 1.25),
      shake: (t) => (t >= S("L27") ? 7 : 0),
      type: (t) => (t >= S("L27") ? TY.pop(t, S("L27"), "АРТҚА СЫРҒЫДЫ! ⚠️", 540, 460, { size: 66, color: "#ef4444" }) : ""),
    },

    // ---------- 13. Кульминация: РУЧНИК! (167.58 → 180.36) ----------
    {
      t0: S("L28") - 0.2,
      bg: "estakada",
      cam: [
        [S("L28"), { x: 0, y: -450, z: 1.25, r: 0 }],
        [S("L29"), { x: 0, y: -450, z: 1.5, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L28", "L29"],
          base: { x: 0, y: 0, s: 1.3, look: "artur", outfit: "casual" },
          track: [
            [S("L28"), "POSES.strain+EXPR.shock"],
            [S("L29"), "POSES.strain+EXPR.strain"],
          ],
        },
      ],
      world: (t) => handbrake(0, -100, 1.4, t >= S("L29")),
      fx: (t) => ({ dof: 4, vig: 0.4 }),
      type: (t) => TY.pop(t, S("L29") + 1, "РУЧНИКТІ ТАРТ! 🛑", 540, 480, { size: 76, color: "#facc15" }),
    },

    // ---------- 14. Инспектор: "85 баллмен өттің!" (180.36 → 189.16) ----------
    {
      t0: S("L30") - 0.2,
      bg: "autodrom",
      cam: [
        [S("L30"), { x: 60, y: -380, z: 1.15, r: 0 }],
        [S("L30") + 4, { x: 0, y: -380, z: 1.3, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L30"],
          base: { x: 100, y: 0, s: 1.15, look: "director", outfit: "casual" },
          track: [[S("L30"), "POSES.thumbs+EXPR.happy"]],
        },
        {
          base: { x: -120, y: 0, s: 1.1, look: "artur", outfit: "casual" },
          track: [[S("L30"), "POSES.cheer+EXPR.happy"]],
        },
      ],
      type: (t) => TY.pop(t, S("L30") + 2, "85 БАЛЛ! ӨТТІҢ! 🎉", 540, 460, { size: 72, color: "#22c55e" }),
    },

    // ---------- 15. Түйін + Кеңестер + Соңы (189.16 → 205.70) ----------
    {
      t0: S("L31") - 0.2,
      bg: "host",
      cam: [
        [S("L31"), { x: 0, y: -450, z: 1.15, r: 0 }],
        [S("L32"), { x: 0, y: -450, z: 1.3, r: 0 }, eio],
      ],
      actors: [
        {
          lines: ["L31", "L32"],
          base: { x: 0, y: 0, s: 1.25, look: "artur", outfit: "casual" },
          track: [
            [S("L31"), "POSES.thumbs+EXPR.happy"],
            [S("L32"), "POSES.wave+EXPR.happy"],
          ],
        },
      ],
      world: (t) => driverLicense(0, -180, 1.2),
      type: (t) => (t < S("L32") ? TY.stamp(t, S("L31") + 1, "СЦЕПЛЕНИЕДЕН ҚОРЫҚПА! 🚗", 540, 460, { color: "#22c55e" }) : TY.pop(t, S("L32") + 1, "КОММЕНТКЕ ЖАЗ! 👇", 540, 460, { size: 70, color: "#38bdf8" })),
    },
  ];

  G.REELS_SHOTS = SHOTS;
  G.SONGY_SHOTS = SHOTS;
})(typeof window !== "undefined" ? window : globalThis);
