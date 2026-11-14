/* «Достар және Поход» — Сахналар А бөлімі (Акт 0, Акт 1, Акт 2: L01–L26) */
(function (G) {
  "use strict";
  const D = G.DOSTAR, B = G.DOSTAR_BG, P = G.DOSTAR_PROPS;
  const S = D.S, E = D.E, TY = D.TY;

  G.DOSTAR_POSES = {
    panHelmet: { armL: { sh: 70, el: 80, hand: "fist" }, armR: { sh: 60, el: 90, hand: "fist", prop: P.pan }, headTilt: -4 },
    holdSkewer: { armR: { sh: 45, el: 70, hand: "fist", prop: P.skewer }, armL: { sh: 15, el: 20, hand: "rest" } },
    holdPhone: { armR: { sh: 40, el: 95, hand: "fist", prop: P.phone("#10b981") }, armL: { sh: 10, el: 10, hand: "rest" } },
    cryingMud: { armL: { sh: 60, el: 120, hand: "fist" }, armR: { sh: 60, el: 120, hand: "fist" }, headTilt: 12, lean: 10, squash: 0.92 }
  };

  const SHOTS_A = [
    // 01. Түн, шатырдың іші — үрейлі сыбдыр (L01–L05)
    {
      id: "sh01_tent_night",
      t0: 0,
      bg: "tentNight",
      c0: { x: 0, y: -450 },
      cam: [
        [0, { x: 0, y: -450, z: 1.0, r: 0 }],
        [S("L03"), { x: 120, y: -450, z: 1.06, r: 1 }],
        [S("L05"), { x: -120, y: -450, z: 1.1, r: -1 }]
      ],
      actors: [
        // Артур
        {
          seed: 1,
          base: { x: -330, y: 0, s: 0.70, look: "artur", outfit: "casual" },
          lines: ["L01", "L05"],
          keys: [
            [0, "scared+crouch"],
            [S("L05"), "determined+panHelmet", 0.25]
          ]
        },
        // Бекзат
        {
          seed: 2,
          base: { x: -110, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L02"],
          keys: [
            [0, "sleepy+shrug"],
            [S("L02"), "angry+idle", 0.2]
          ]
        },
        // Данияр
        {
          seed: 3,
          base: { x: 110, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L03"],
          keys: [
            [0, "scared+holdPhone"],
            [S("L03"), "shock+point", 0.18]
          ]
        },
        // Диас
        {
          seed: 4,
          base: { x: 330, y: 0, s: 0.70, look: "arturSwept", outfit: "casual" },
          lines: ["L04"],
          keys: [
            [0, "scared+shrug"],
            [S("L04"), "shock+idle", 0.2]
          ]
        }
      ],
      shake: (t) => (t >= S("L03") && t <= S("L03") + 1.2 ? 6 : 0),
      type: (t) => {
        let s = "";
        if (t >= S("L01") && t < S("L01") + 2.5) s += TY.pop(t, S("L01"), "ТҮНГІ САҒАТ 03:00", 960, 220, { size: 54, color: "#93c5fd" });
        return s;
      }
    },

    // 02. Түн, сырт — Артур мен кірпі (L06)
    {
      id: "sh02_tent_outside",
      t0: S("L06") - 0.2,
      bg: "tentOutsideNight",
      flashIn: 0.2,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L06") - 0.2, { x: 0, y: -450, z: 1.02, r: 0 }],
        [S("L06") + 1.2, { x: -60, y: -460, z: 1.12, r: -1 }]
      ],
      actors: [
        {
          seed: 1,
          base: { x: -180, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L06"],
          keys: [
            [S("L06") - 0.2, "shock+holdSkewer"],
            [S("L06") + 1.5, "laugh+idle", 0.3]
          ]
        }
      ],
      type: (t) => {
        let s = "";
        if (t >= S("L06") && t < S("L06") + 2.2) s += TY.pop(t, S("L06"), "КӘДІМГІ КІРПІ!", 1200, 480, { size: 76, color: "#facc15" });
        return s;
      }
    },

    // 02b. Басты титр — «ДОСТАР ЖӘНЕ ПОХОД»
    {
      id: "sh02b_title",
      t0: E("L06") + 0.1,
      bg: "host",
      flashIn: 0.35,
      c0: { x: 0, y: -450 },
      cam: [
        [E("L06") + 0.1, { x: 0, y: -450, z: 1, r: 0 }],
        [S("L07") - 0.2, { x: 0, y: -450, z: 1.05, r: 0 }]
      ],
      type: (t) => {
        let s = "";
        s += TY.swing(t, E("L06") + 0.15, "ДОСТАР ЖӘНЕ ПОХОД", 960, 480, { size: 105, color: "#fef08a" });
        s += TY.pop(t, E("L06") + 0.75, "ҚАЛАЙ АМАН ҚАЛДЫҚ?", 960, 620, { size: 48, color: "#ffffff" });
        return s;
      }
    },

    // 03. Жүргізуші Артур — Сәлемдесу және тезис (L07)
    {
      id: "sh03_host_intro",
      t0: S("L07") - 0.2,
      bg: "host",
      c0: { x: 0, y: -560 },
      cam: [
        [S("L07") - 0.2, { x: 0, y: -560, z: 1.0, r: 0 }],
        [E("L07"), { x: 0, y: -580, z: 1.06, r: 0 }]
      ],
      actors: [
        {
          seed: 1,
          base: { x: 0, y: 320, s: 1.15, look: "artur", outfit: "casual" },
          lines: ["L07"],
          keys: [
            [S("L07") - 0.2, "happy+wave"],
            [S("L07") + 2.0, "calm+idle", 0.3],
            [S("L07") + 5.0, "smug+point", 0.25]
          ]
        }
      ]
    },

    // 04. Санмен әзіл — 4 жігіт, 1 шатыр, 8 кг ет, 0 сіріңке (L08)
    {
      id: "sh04_stats",
      t0: S("L08") - 0.1,
      bg: "host",
      c0: { x: 0, y: -560 },
      cam: [
        [S("L08") - 0.1, { x: -140, y: -560, z: 1.05, r: 0 }],
        [E("L08"), { x: -160, y: -570, z: 1.08, r: 0 }]
      ],
      actors: [
        {
          seed: 1,
          base: { x: -360, y: 320, s: 1.15, look: "artur", outfit: "casual" },
          lines: ["L08"],
          keys: [
            [S("L08") - 0.1, "laugh+shrug"],
            [S("L08") + 3.0, "shock+point", 0.2]
          ]
        }
      ],
      type: (t) => {
        let s = "";
        s += TY.pop(t, S("L08") + 0.2, "4 ЖІГІТ", 1100, 240, { size: 70, color: "#38bdf8" });
        s += TY.pop(t, S("L08") + 1.4, "1 ШАТЫР", 1100, 350, { size: 70, color: "#34d399" });
        s += TY.pop(t, S("L08") + 2.6, "8 КГ ЕТ", 1100, 460, { size: 70, color: "#f87171" });
        s += TY.pop(t, S("L08") + 4.0, "0 СІРІҢКЕ", 1100, 580, { size: 85, color: "#fbbf24" });
        s += TY.pop(t, S("L08") + 5.5, "3 000 000 МАСА!", 1100, 710, { size: 80, color: "#ef4444" });
        return s;
      }
    },

    // 05. Фильмдерде (Күту) vs Шындығында (Хаос) (L09–L10)
    {
      id: "sh05_expectations",
      t0: S("L09") - 0.1,
      bg: "bonfire",
      c0: { x: 0, y: -450 },
      cam: [
        [S("L09") - 0.1, { x: 0, y: -450, z: 1.0, r: 0 }],
        [E("L09"), { x: 0, y: -460, z: 1.06, r: 0 }]
      ],
      fx: (t) => ({ lb: 0.85, tint: "#fef08a", tintA: 0.15 }),
      actors: [
        {
          seed: 1,
          base: { x: 0, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L09"],
          keys: [[S("L09"), "happy+idle"]]
        }
      ],
      type: (t) => TY.stamp(t, S("L09") + 0.3, "КИНОЛАРДА...", 960, 240, { size: 68, color: "#fbbf24" })
    },
    {
      id: "sh06_reality",
      t0: S("L10") - 0.1,
      bg: "mudRoad",
      flashIn: 0.2,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L10") - 0.1, { x: 0, y: -450, z: 1.02, r: -1 }],
        [E("L10"), { x: 0, y: -460, z: 1.08, r: 1 }]
      ],
      shake: (t) => 5,
      actors: [
        {
          seed: 1,
          base: { x: -220, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L10", "L11"],
          keys: [
            [S("L10") - 0.1, "shock+shrug"],
            [S("L11"), "calm+point", 0.3]
          ]
        },
        {
          seed: 3,
          base: { x: 200, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          keys: [[S("L10") - 0.1, "cryingMud"]]
        }
      ],
      type: (t) => TY.stamp(t, S("L10") + 0.2, "АЛ ШЫНДЫҒЫНДА!", 960, 240, { size: 76, color: "#ef4444", rot: 6 })
    },

    // 07. 1-Заң: Дайындық чаты (L12–L15)
    {
      id: "sh07_law1_chat",
      t0: S("L12") - 0.1,
      bg: "chat",
      c0: { x: 0, y: -450 },
      cam: [
        [S("L12") - 0.1, { x: 0, y: -450, z: 1.0, r: 0 }],
        [S("L13"), { x: -140, y: -450, z: 1.05, r: 0 }],
        [S("L14"), { x: 140, y: -450, z: 1.05, r: 0 }],
        [S("L15"), { x: 0, y: -450, z: 1.06, r: 0 }]
      ],
      actors: [
        {
          seed: 2,
          base: { x: -330, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L13"],
          keys: [[S("L12"), "smug+idle"], [S("L13"), "laugh+point", 0.2]]
        },
        {
          seed: 3,
          base: { x: 330, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L14"],
          keys: [[S("L12"), "happy+holdPhone"], [S("L14"), "happy+cheer", 0.2]]
        },
        {
          seed: 1,
          base: { x: 0, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L12", "L15"],
          keys: [[S("L12"), "calm+point"], [S("L15"), "shock+shrug", 0.3]]
        }
      ],
      type: (t) => TY.stamp(t, S("L12") + 0.2, "1-ЗАҢ: ДАЙЫНДЫҚ ЧАТЫ", 960, 180, { size: 60, color: "#059669" })
    },

    // 08. 2-Заң: Құпия қысқа жол (L16–L19)
    {
      id: "sh08_law2_mud",
      t0: S("L16") - 0.1,
      bg: "mudRoad",
      flashIn: 0.2,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L16") - 0.1, { x: 0, y: -450, z: 1.0, r: 0 }],
        [S("L17"), { x: 160, y: -450, z: 1.06, r: 0 }],
        [S("L19"), { x: -160, y: -450, z: 1.06, r: 0 }]
      ],
      actors: [
        // Диас навигатор
        {
          seed: 4,
          base: { x: 300, y: 0, s: 0.70, look: "arturSwept", outfit: "casual" },
          lines: ["L17"],
          keys: [[S("L16"), "smug+point"], [S("L18"), "shy+shrug", 0.3]]
        },
        // Данияр жылап отыр
        {
          seed: 3,
          base: { x: -300, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L19"],
          keys: [[S("L16"), "calm+idle"], [S("L18"), "cryingMud", 0.2]]
        },
        // Артур баяндаушы
        {
          seed: 1,
          base: { x: 0, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L16", "L18"],
          keys: [[S("L16"), "calm+idle"], [S("L18"), "shock+shrug", 0.2]]
        }
      ],
      type: (t) => TY.stamp(t, S("L16") + 0.2, "2-ЗАҢ: ҚҰПИЯ ҚЫСҚА ЖОЛ", 960, 180, { size: 58, color: "#d97706" })
    },

    // 09. 3-Заң: Шатыр тігу — Инструкция әлсіздер үшін (L20–L22)
    {
      id: "sh09_law3_tent",
      t0: S("L20") - 0.1,
      bg: "tentBuild",
      flashIn: 0.2,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L20") - 0.1, { x: 0, y: -450, z: 1.0, r: 0 }],
        [S("L21"), { x: 140, y: -450, z: 1.06, r: 0 }],
        [S("L22"), { x: 0, y: -450, z: 1.04, r: 0 }]
      ],
      actors: [
        // Бекзат мақтанады
        {
          seed: 2,
          base: { x: 240, y: 0, s: 0.72, look: "boy", outfit: "casual" },
          lines: ["L21"],
          keys: [[S("L20"), "smug+idle"], [S("L21"), "laugh+point", 0.2], [S("L22"), "shock+shrug", 0.3]]
        },
        // Артур
        {
          seed: 1,
          base: { x: -240, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L20", "L22"],
          keys: [[S("L20"), "calm+point"], [S("L22"), "laugh+shrug", 0.25]]
        }
      ],
      type: (t) => TY.stamp(t, S("L20") + 0.2, "3-ЗАҢ: ШАТЫР ТІГУ", 960, 180, { size: 60, color: "#dc2626" })
    },

    // 10. 4-Заң: Байланыс іздеу — Тал басындағы Данияр (L23–L26)
    {
      id: "sh10_law4_signal",
      t0: S("L23") - 0.1,
      bg: "tree4G",
      flashIn: 0.2,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L23") - 0.1, { x: 0, y: -450, z: 1.0, r: 0 }],
        [S("L24"), { x: -140, y: -500, z: 1.08, r: 0 }],
        [S("L26"), { x: 0, y: -450, z: 1.02, r: 0 }]
      ],
      actors: [
        // Данияр талдың басында
        {
          seed: 3,
          base: { x: -220, y: -320, s: 0.58, look: "boy", outfit: "casual" },
          lines: ["L24"],
          keys: [[S("L23"), "scared+holdPhone"], [S("L24"), "laugh+cheer", 0.2]]
        },
        // Артур жерде
        {
          seed: 1,
          base: { x: 240, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L23", "L25", "L26"],
          keys: [[S("L23"), "calm+point"], [S("L25"), "laugh+shrug", 0.25], [S("L26"), "calm+idle", 0.2]]
        }
      ],
      type: (t) => TY.stamp(t, S("L23") + 0.2, "4-ЗАҢ: БАЙЛАНЫС ІЗДЕУ", 960, 180, { size: 58, color: "#2563eb" })
    }
  ];

  G.DOSTAR_SHOTS_A = SHOTS_A;
})(typeof window !== "undefined" ? window : globalThis);
