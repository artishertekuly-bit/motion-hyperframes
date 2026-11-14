/* «Достар және Поход» — Сахналар Б бөлімі (Акт 3, Акт 4, Акт 5, Акт 6, Акт 7: L27–L61) */
(function (G) {
  "use strict";
  const D = G.DOSTAR, B = G.DOSTAR_BG, P = G.DOSTAR_PROPS;
  const S = D.S, E = D.E, TY = D.TY;

  const SHOTS_B = [
    // 11. Шашлық дайындығы — Шеф-повар Бекзат (L27–L28)
    {
      id: "sh11_shashlyk_intro",
      t0: S("L27") - 0.1,
      bg: "bonfire",
      c0: { x: 0, y: -450 },
      cam: [
        [S("L27") - 0.1, { x: 0, y: -450, z: 1.02, r: 0 }],
        [S("L28"), { x: -140, y: -450, z: 1.08, r: 0 }]
      ],
      actors: [
        // Бекзат мақтанады
        {
          seed: 2,
          base: { x: 220, y: 0, s: 0.72, look: "boy", outfit: "casual" },
          lines: ["L27"],
          keys: [[S("L27"), "smug+holdSkewer"]]
        },
        // Артур сенімді
        {
          seed: 1,
          base: { x: -220, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L28"],
          keys: [[S("L28"), "happy+point"]]
        }
      ]
    },

    // 12. «ЕҢ ҮЛКЕН ҚАТЕЛІК» — Стоп-кадр (L29)
    {
      id: "sh12_freeze_mistake",
      t0: S("L29") - 0.1,
      bg: "bonfire",
      still: true,
      freeze: S("L29") + 0.1,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L29") - 0.1, { x: 0, y: -450, z: 1.15, r: -1 }]
      ],
      fx: (t) => ({ sat: 0.18, vig: 0.65 }),
      actors: [
        {
          seed: 1,
          base: { x: 0, y: 0, s: 0.75, look: "artur", outfit: "casual" },
          lines: ["L29"],
          keys: [[S("L29") - 0.1, "shock+idle"]]
        }
      ],
      type: (t) => TY.stamp(t, S("L29") + 0.3, "ЕҢ ҮЛКЕН ҚАТЕЛІК", 960, 480, { size: 90, color: "#ef4444", rot: -5 })
    },

    // 13. «Сіріңке кімде?» — Үнсіздік (L30–L33)
    {
      id: "sh13_silence_matches",
      t0: S("L30") - 0.1,
      bg: "bonfire",
      flashIn: 0.2,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L30") - 0.1, { x: 140, y: -450, z: 1.05, r: 0 }],
        [S("L32"), { x: -160, y: -450, z: 1.08, r: 0 }],
        [S("L33"), { x: 140, y: -450, z: 1.08, r: 0 }]
      ],
      actors: [
        // Бекзат
        {
          seed: 2,
          base: { x: 280, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L30", "L33"],
          keys: [[S("L30"), "shy+shrug"], [S("L33"), "angry+point", 0.2]]
        },
        // Данияр ашулы
        {
          seed: 3,
          base: { x: -280, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L32"],
          keys: [[S("L32"), "shock+shrug"]]
        },
        // Артур ортада
        {
          seed: 1,
          base: { x: 0, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L31"],
          keys: [[S("L30"), "scared+idle"], [S("L31"), "deadpan+idle", 0.3]]
        }
      ],
      type: (t) => {
        let s = "";
        if (t >= S("L30") + 0.8 && t < S("L30") + 3.0) s += TY.pop(t, S("L30") + 0.8, "СІРІҢКЕ КІМДЕ?!", 960, 220, { size: 76, color: "#f59e0b" });
        return s;
      }
    },

    // 14. От жағу сынағы — Таяқтар мен көзілдірік (L34–L37)
    {
      id: "sh14_fire_attempts",
      t0: S("L34") - 0.1,
      bg: "bonfire",
      c0: { x: 0, y: -450 },
      cam: [
        [S("L34") - 0.1, { x: 120, y: -450, z: 1.0, r: 0 }],
        [S("L35"), { x: -120, y: -450, z: 1.02, r: 0 }],
        [S("L36"), { x: -220, y: -450, z: 1.05, r: 0 }],
        [S("L37"), { x: 0, y: -450, z: 1.0, r: 0 }]
      ],
      actors: [
        // Бекзат таяқты үйкеп отыр
        {
          seed: 2,
          base: { x: 330, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          keys: [[S("L34"), "angry+crouch"]]
        },
        // Артур
        {
          seed: 1,
          base: { x: 110, y: 0, s: 0.70, look: "artur", outfit: "casual" },
          lines: ["L34", "L37"],
          keys: [[S("L34"), "calm+point"], [S("L37"), "scared+shrug", 0.3]]
        },
        // Диас көзілдірік сұрайды
        {
          seed: 4,
          base: { x: -110, y: 0, s: 0.70, look: "arturSwept", outfit: "casual" },
          lines: ["L35"],
          keys: [[S("L35"), "smug+point"]]
        },
        // Данияр көзілдірігін қорғайды
        {
          seed: 3,
          base: { x: -330, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L36"],
          keys: [[S("L36"), "shock+shrug"]]
        }
      ],
      type: (t) => {
        let s = "";
        if (t >= S("L34") + 1.0 && t < S("L34") + 3.5) s += TY.pop(t, S("L34") + 1.0, "40 МИНУТ ӨТТІ...", 960, 240, { size: 60, color: "#f87171" });
        return s;
      }
    },

    // 15. Көліктің прикуривателі — Эврика! (L38–L40)
    {
      id: "sh15_car_lighter",
      t0: S("L38") - 0.1,
      bg: "bonfire",
      flashIn: 0.25,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L38") - 0.1, { x: -140, y: -450, z: 1.05, r: 0 }],
        [S("L39"), { x: 140, y: -450, z: 1.05, r: 0 }],
        [S("L40"), { x: 0, y: -450, z: 1.1, r: 0 }]
      ],
      actors: [
        // Артур ой тапты
        {
          seed: 1,
          base: { x: -200, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L38", "L40"],
          keys: [[S("L38"), "happy+point"], [S("L40"), "laugh+cheer", 0.2]]
        },
        // Бекзат қуанады
        {
          seed: 2,
          base: { x: 200, y: 0, s: 0.72, look: "boy", outfit: "casual" },
          lines: ["L39"],
          keys: [[S("L39"), "laugh+cheer"]]
        }
      ],
      type: (t) => {
        let s = "";
        if (t >= S("L40") + 0.4 && t < S("L40") + 3.0) s += TY.pop(t, S("L40") + 0.4, "ОТ ЖАНДЫ!", 960, 220, { size: 90, color: "#f97316" });
        return s;
      }
    },

    // 16. «Тұз жоқ...» және дауылдың басталуы (L41–L45)
    {
      id: "sh16_no_salt_storm",
      t0: S("L41") - 0.1,
      bg: "bonfire",
      c0: { x: 0, y: -450 },
      cam: [
        [S("L41") - 0.1, { x: 0, y: -450, z: 1.02, r: 0 }],
        [S("L43"), { x: -160, y: -450, z: 1.08, r: 0 }],
        [S("L45"), { x: 0, y: -450, z: 1.05, r: 0 }]
      ],
      actors: [
        // Бекзат сыбырлайды
        {
          seed: 2,
          base: { x: 260, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L42", "L44"],
          keys: [[S("L41"), "shy+shrug"], [S("L44"), "smug+point", 0.2]]
        },
        // Данияр шок
        {
          seed: 3,
          base: { x: -260, y: 0, s: 0.70, look: "boy", outfit: "casual" },
          lines: ["L43"],
          keys: [[S("L43"), "shock+shrug"]]
        },
        // Артур
        {
          seed: 1,
          base: { x: 0, y: 0, s: 0.72, look: "artur", outfit: "casual" },
          lines: ["L41", "L45"],
          keys: [[S("L41"), "deadpan+idle"], [S("L45"), "scared+shrug", 0.25]]
        }
      ],
      type: (t) => {
        let s = "";
        if (t >= S("L43") && t < S("L43") + 2.5) s += TY.pop(t, S("L43"), "ТҰЗСЫЗ ЕТ?!", 960, 220, { size: 78, color: "#ef4444" });
        return s;
      }
    },

    // 17. Нөсер және ұшып бара жатқан шатыр (L46–L47)
    {
      id: "sh17_storm_fly",
      t0: S("L46") - 0.1,
      bg: "storm",
      flashIn: 0.3,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L46") - 0.1, { x: 0, y: -450, z: 1.0, r: -1 }],
        [E("L47"), { x: 60, y: -450, z: 1.06, r: 1 }]
      ],
      shake: (t) => 8,
      actors: [
        // Диас айғайлайды
        {
          seed: 4,
          base: { x: -240, y: 0, s: 0.70, look: "arturSwept", outfit: "casual" },
          lines: ["L46"],
          keys: [[S("L46"), "shock+point"]]
        },
        // Артур қуады
        {
          seed: 1,
          base: { x: 160, y: 0, s: 0.70, look: "artur", outfit: "casual" },
          lines: ["L47"],
          keys: [[S("L47"), "scared+cheer"]]
        }
      ],
      type: (t) => TY.pop(t, S("L46") + 0.2, "ШАТЫР ҰШТЫ!", 960, 220, { size: 85, color: "#facc15" })
    },

    // 18. «УАҚЫТ ТОҚТАДЫ» — Slow-Motion қаһарман сәті (L48–L50)
    {
      id: "sh18_slowmo_hero",
      t0: S("L48") - 0.1,
      bg: "storm",
      c0: { x: 0, y: -450 },
      cam: [
        [S("L48") - 0.1, { x: 0, y: -450, z: 1.05, r: 0 }],
        [S("L49"), { x: 0, y: -460, z: 1.15, r: -0.5 }],
        [E("L50"), { x: 0, y: -450, z: 1.05, r: 0 }]
      ],
      fx: (t) => ({ dof: 5.5, vig: 0.45 }),
      actors: [
        // Артур супер-батыр позасында
        {
          seed: 1,
          base: { x: 0, y: 0, s: 0.75, look: "artur", outfit: "casual" },
          lines: ["L48", "L49", "L50"],
          keys: [
            [S("L48"), "shock+idle"],
            [S("L49"), "determined+cheer", 0.3],
            [S("L50"), "deadpan+crouch", 0.25]
          ]
        }
      ],
      type: (t) => {
        let s = "";
        s += TY.stamp(t, S("L48") + 0.2, "УАҚЫТ ТОҚТАДЫ...", 960, 220, { size: 70, color: "#38bdf8" });
        return s;
      }
    },

    // 19. Түйін — Көлік жүксалғышындағы жылы шәй мен күйген картоп (L51–L56)
    {
      id: "sh19_car_warmth",
      t0: S("L51") - 0.1,
      bg: "carBack",
      fadeIn: 0.4,
      c0: { x: 0, y: -450 },
      cam: [
        [S("L51") - 0.1, { x: 0, y: -450, z: 1.0, r: 0 }],
        [S("L53"), { x: -140, y: -450, z: 1.05, r: 0 }],
        [S("L55"), { x: 140, y: -450, z: 1.05, r: 0 }],
        [S("L56"), { x: 0, y: -450, z: 1.02, r: 0 }]
      ],
      actors: [
        // Данияр күледі
        {
          seed: 3,
          base: { x: -330, y: -60, s: 0.68, look: "boy", outfit: "casual" },
          lines: ["L53"],
          keys: [[S("L51"), "happy+idle"], [S("L53"), "laugh+cheer", 0.2]]
        },
        // Артур
        {
          seed: 1,
          base: { x: -110, y: -60, s: 0.68, look: "artur", outfit: "casual" },
          lines: ["L51", "L52", "L56"],
          keys: [[S("L51"), "calm+idle"], [S("L52"), "happy+idle", 0.25], [S("L56"), "laugh+idle", 0.2]]
        },
        // Бекзат
        {
          seed: 2,
          base: { x: 110, y: -60, s: 0.68, look: "boy", outfit: "casual" },
          lines: ["L54"],
          keys: [[S("L51"), "calm+idle"], [S("L54"), "shrug+idle", 0.2]]
        },
        // Диас
        {
          seed: 4,
          base: { x: 330, y: -60, s: 0.68, look: "arturSwept", outfit: "casual" },
          lines: ["L55"],
          keys: [[S("L51"), "calm+idle"], [S("L55"), "laugh+point", 0.2]]
        }
      ]
    },

    // 20. Сабақ, Екі кеңес және Соңы (L57–L61)
    {
      id: "sh20_host_conclusion",
      t0: S("L57") - 0.1,
      bg: "host",
      c0: { x: 0, y: -560 },
      cam: [
        [S("L57") - 0.1, { x: 0, y: -560, z: 1.05, r: 0 }],
        [S("L60"), { x: 80, y: -560, z: 1.1, r: 0 }],
        [E("L61"), { x: 0, y: -560, z: 1.05, r: 0 }]
      ],
      actors: [
        // Артур
        {
          seed: 1,
          base: { x: -100, y: 320, s: 1.15, look: "artur", outfit: "casual" },
          lines: ["L57", "L58", "L59", "L61"],
          keys: [
            [S("L57"), "calm+point"],
            [S("L58"), "happy+point", 0.2],
            [S("L59"), "smug+wave", 0.25],
            [S("L60"), "shock+shrug", 0.2],
            [S("L61"), "happy+wave", 0.2]
          ]
        },
        // Данияр кадрға кіреді (L60)
        {
          seed: 3,
          base: { x: 380, y: 320, s: 1.1, look: "boy", outfit: "casual" },
          lines: ["L60"],
          keys: [
            [S("L57"), { hide: true }],
            [S("L60"), "laugh+holdPhone", 0.2]
          ]
        }
      ],
      type: (t) => {
        let s = "";
        if (t >= S("L58") && t < S("L58") + 5.0) {
          s += TY.pop(t, S("L58") + 0.3, "1. ИНСТРУКЦИЯНЫ ОҚЫҢЫЗДАР!", 960, 240, { size: 52, color: "#38bdf8" });
          s += TY.pop(t, S("L58") + 2.4, "2. СІРІҢКЕ МЕН ТҰЗДЫ АЛЫҢЫЗДАР!", 960, 330, { size: 52, color: "#fbbf24" });
        }
        if (t >= S("L61") - 0.1) {
          s += TY.swing(t, S("L61"), "САУ БОЛЫҢДАР!", 960, 520, { size: 110, color: "#facc15" });
        }
        return s;
      }
    }
  ];

  G.DOSTAR_SHOTS_B = SHOTS_B;
  // Жалпы сахналар тізімі
  G.DOSTAR_SHOTS = G.DOSTAR_SHOTS_A.concat(SHOTS_B);
})(typeof window !== "undefined" ? window : globalThis);
