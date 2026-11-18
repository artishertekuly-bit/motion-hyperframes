/* «Таңғы автобус: Тетрис және Кондиционер» (Reels 9:16, ~1:30) — кадрлар.
 * 0. Ілмек (таңғы автобус — тетрис) → 1. Аялдама + жүргізуші («Бос орын бар!»)
 * → 2. Сығылысып кіру (аяқ ауада, рюкзак қысылған) → 3. Физика: тормоз/газ домино-биі
 * → 4. +45°C Сауна (терезені 2 см ашу) → 5. Апай: «Жап, жел тиеді!» шайқасы
 * → 6. Түсу операциясы («Келесіде түсесіз бе?» → Есік жабылды!)
 * → 7. Университет терезеден өтіп кетті + жаяу қайту → 8. Түйін + Кеңес.
 */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RB = G.REELS_BG, K = G.REELS_KIT, RIG = G.ArturRig;
  const { S, E, TY, lerp, clamp, sm, eio, eout, spring, win, noise, hash } = Q;
  const { BG, P, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { Wt, POSES: PO, ACT, puff, speed, shout, sweat, tears, freezeFx } = K;
  const { g, TB } = RB;
  const X = RIG.EXPR;
  const SH = [], MK = {};
  const add = (o) => SH.push(o);
  const ex = (...a) => Object.assign({}, ...a.map((k) => (typeof k === "string" ? X[k] || PO[k] || RIG.POSES[k] : k)));

  // Автобус салоны (іші): үлкен терезелер, артқы қала, төбедегі тұтқалар
  function busIntBg(opts) {
    opts = opts || {};
    let far = `<defs><linearGradient id="bsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${opts.hot ? "#f59d62" : "#9ad0f5"}"/><stop offset="1" stop-color="${opts.hot ? "#fce1b8" : "#e8f5ff"}"/></linearGradient></defs>` +
      `<rect x="-3000" y="-3000" width="6000" height="3000" fill="url(#bsSky)"/>`;
    // Терезе сыртындағы алыс ғимараттар мен ағаштар
    far += RB.panelBlock(-1600, -300, 900, 1500, 15) + RB.panelBlock(500, -300, 1000, 1600, 23);
    // Автобустың ішкі қабырғасы мен терезе жақтаулары
    let mid = P("M-3000,-2400 L3000,-2400 L3000,-1250 L-3000,-1250Z", "#dce3eb", 7) +
      P("M-3000,-320 L3000,-320 L3000,1200 L-3000,1200Z", "#5c677d", 7) +
      Ln("M-900,-1250 L-900,-320 M-300,-1250 L-300,-320 M300,-1250 L300,-320 M900,-1250 L900,-320", 24, "#b8c2cf") +
      Ln("M-2600,-1120 L2600,-1120", 14, "#f6d55c"); // сары тұтқа штангасы
    for (let hx = -600; hx <= 600; hx += 300) {
      mid += Ln(`M${hx},-1120 L${hx},-980`, 6, "#2a2b31") + P(`M${hx - 22},-980 L${hx + 22},-980 L${hx + 16},-930 L${hx - 16},-930Z`, "#e85d75", 4);
    }
    return { far, mid, near: "" };
  }

  // Жолаушылар тобы (алдыңғы/ортаңғы сығылыс)
  const packCrowd = (leanDeg, t) => {
    let o = "";
    const xs = [-420, -250, 250, 420];
    for (let i = 0; i < xs.length; i++) {
      o += `<g transform="translate(${xs[i]},40) rotate(${f(leanDeg)})">${B.crowdPerson(0, 0, 0.88, null, 700 + i * 19, { phone: i % 2 === 0 })}</g>`;
    }
    return o;
  };

  // Ашылмалы терезе саңылауы
  const busWindow = (x, y, openPx) => g(x, y, 1,
    RR(-220, -200, 440, 400, "#d6eefc", 7, 14) +
    RF(-210, -190, 420, 40 + openPx, "#ffffff", 6, ' opacity="0.7"') +
    Ln(`M-210,${f(-110 + openPx)} L210,${f(-110 + openPx)}`, 8, "#3b3f4a") +
    (openPx > 10 ? Ln("M-60,-150 Q0,-170 60,-150 M-40,-120 Q20,-140 80,-120", 5, "#4da8da") : "")
  );

  // ================= 0. ІЛМЕК (L01) =================
  MK.S0 = S("L01");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: 0, c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[0, { x: 0, y: -560, z: 1.15 }], [E("L01"), { x: 0, y: -560, z: 1.22 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[0, ex("calmSmile", "shrug", { turn: 0 })], [Wt("L01", 4), ex("deadpan", "fingerUp")]], talk: ["L01"] })
    ],
    type: (t) => TY.pop(t, 0.3, "ТАҢҒЫ 08:00 АВТОБУС", 540, 290, { size: 74, color: "#f2c14e", wob: 5 }) +
                 TY.stamp(t, Wt("L01", 5), "ТЕТРИС ОЙЫНЫ", 540, 420, { size: 84, color: "#00adb5", rot: -4 })
  });

  // ================= 1. АЯЛДАМА ЖӘНЕ «БОС ОРЫН БАР!» (L02, L03) =================
  MK.S1 = S("L02");
  const DRV_L = S("L03");
  add({
    bg: () => BG.road(), bgKey: "road",
    t0: S("L02"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L02"), { x: 0, y: -450, z: 1.0 }], [DRV_L, { x: -120, y: -450, z: 1.15 }]],
    actors: [
      ACT.artur({ x: 200, y: 0, s: 0.70, keys: [[S("L02"), ex("nervous", "armsDown", { turn: -0.3 })]], talk: ["L02"] }),
      ACT.dad({ x: -240, y: 0, s: 0.72, keys: [[0, { hide: true }], [DRV_L, ex("angry", "reach", { hide: false, turn: 0.3, mouth: "shout" })]], talk: ["L03"] })
    ],
    world: (t) => RB.bus(-420, 40, 0.85) + (t >= DRV_L ? shout(-140, -680, 180, t, DRV_L, E("L03"), 3) : ""),
    type: (t) => TY.stamp(t, DRV_L + 0.3, "БОС ОРЫН БАР!", 540, 270, { size: 84, color: "#f2c14e", rot: -4 })
  });

  // ================= 2. СЫҒЫЛЫС: АЯҚ АУАДА (L04, L05) =================
  MK.S2 = S("L04");
  add({
    bg: () => busIntBg(), bgKey: "busInt",
    t0: S("L04"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L04"), { x: 0, y: -450, z: 1.1 }], [S("L05"), { x: 0, y: -470, z: 1.25 }]],
    shake: (t) => 5,
    actors: [
      ACT.artur({
        x: 0, y: -40, s: 0.70,
        keys: [[S("L04"), ex("scared", "shrug", { turn: 0 })], [S("L05"), ex("strain", "hands1", { turn: 0.1, squash: 0.94 })]],
        talk: ["L04", "L05"]
      })
    ],
    world: (t) => packCrowd(Math.sin(t * 2) * 3, t) + sweat(0, -720, t, S("L04"), 3),
    type: (t) => TY.pop(t, S("L04") + 0.3, "РЮКЗАК ҚЫСЫЛДЫ!", 540, 260, { size: 78, color: "#ff5252" })
  });

  // ================= 3. ФИЗИКА: ТОРМОЗ / ГАЗ ДОМИНО БИІ (L06) =================
  MK.S3 = S("L06");
  const SW_M = S("L06") + 3.2;
  add({
    bg: () => busIntBg(), bgKey: "busInt",
    t0: S("L06"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L06"), { x: -80, y: -450, z: 1.1 }], [SW_M, { x: 80, y: -450, z: 1.15 }, eio]],
    shake: (t) => 8,
    actors: [
      ACT.artur({
        x: 0, y: -20, s: 0.70,
        pos: (t) => ({ rot: t < SW_M ? -18 : 18, x: t < SW_M ? -90 : 90 }),
        keys: [[S("L06"), ex("shock", "reachBoth", { turn: -0.2 })], [SW_M, ex("scared", "reachBoth", { turn: 0.2 })]],
        talk: ["L06"]
      })
    ],
    world: (t) => packCrowd(t < SW_M ? -18 : 18, t),
    type: (t) => (t < SW_M ? TY.pop(t, S("L06") + 0.8, "ТОРМОЗ → СОЛҒА!", 540, 260, { size: 78, color: "#f2c14e" })
      : TY.pop(t, SW_M, "ГАЗ → ОҢҒА!", 540, 260, { size: 84, color: "#ff5252", wob: 5 }))
  });

  // ================= 4. +45°C САУНА ЖӘНЕ ТЕРЕЗЕ (L07, L08) =================
  MK.S4 = S("L07");
  add({
    bg: () => busIntBg({ hot: true }), bgKey: "busHot",
    t0: S("L07"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L07"), { x: 0, y: -450, z: 1.1 }], [S("L08"), { x: 40, y: -490, z: 1.25 }]],
    actors: [
      ACT.artur({ x: -40, y: 0, s: 0.72, keys: [[S("L07"), ex("tired", "chest", { turn: 0 })], [S("L08"), ex("determined", "reach", { turn: 0.25 })]], talk: ["L07", "L08"] })
    ],
    world: (t) => busWindow(240, -640, t >= S("L08") ? 36 : 0) + sweat(-40, -680, t, S("L07"), 5),
    fx: (t) => ({ tint: "#ff6b35", tintA: 0.16 }),
    type: (t) => TY.pop(t, S("L07") + 0.3, "+45°C САУНА!", 540, 260, { size: 92, color: "#ff5252", wob: 5 })
  });

  // ================= 5. АПАЙ: «ЖАП ТЕРЕЗЕНІ!» ШАЙҚАСЫ (L09, L10, L11) =================
  MK.S5 = S("L09");
  add({
    bg: () => busIntBg({ hot: true }), bgKey: "busHot",
    t0: S("L09"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L09"), { x: -120, y: -450, z: 1.15 }], [S("L10"), { x: 120, y: -450, z: 1.2 }], [S("L11"), { x: -120, y: -450, z: 1.25 }]],
    shake: (t) => (t < S("L10") || t > S("L11") ? 10 : 0),
    actors: [
      ACT.aje({ x: -190, y: 0, s: 0.72, keys: [[S("L09"), ex("angry", "point", { turn: 0.3, mouth: "shout" })], [S("L11"), ex("angry", "stop", { turn: 0.35 })]], talk: ["L09", "L11"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L09"), ex("scared", "shrug", { turn: -0.2 })], [S("L10"), ex("sad", "hands1", { turn: -0.25 })]], talk: ["L10"] })
    ],
    world: (t) => busWindow(220, -650, t < S("L11") ? 20 : 0),
    type: (t) => TY.stamp(t, S("L09") + 0.3, "ЖЕЛ СОҒЫП ТҰР!", 540, 270, { size: 84, color: "#ff5252", rot: -5 })
  });

  // ================= 6. ТҮСУ ОПЕРАЦИЯСЫ: «ТҮСЕСІЗ БЕ?» (L12..L15) =================
  MK.S6 = S("L12");
  add({
    bg: () => busIntBg(), bgKey: "busInt",
    t0: S("L12"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L12"), { x: 0, y: -450, z: 1.05 }], [S("L14"), { x: -100, y: -450, z: 1.2 }], [S("L15"), { x: 100, y: -450, z: 1.25 }]],
    actors: [
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L12"), ex("nervous", "point", { turn: -0.25 })], [S("L15"), ex("shock", "reachBoth", { turn: -0.3 })]], talk: ["L12", "L13", "L15"] }),
      ACT.teen({ x: -160, y: 0, s: 0.70, keys: [[S("L12"), ex("deadpan", "armsDown", { turn: 0 })], [S("L14"), ex("deadpan", { turn: 0.15 })]], talk: ["L14"] })
    ],
    world: (t) => packCrowd(0, t),
    type: (t) => TY.stamp(t, S("L15") + 1.8, "ЕСІК ЖАБЫЛДЫ! ПШШ!", 540, 270, { size: 76, color: "#ff5252", rot: 4 })
  });

  // ================= 7. УНИВЕРСИТЕТ ӨТІП КЕТТІ + ЖАЯУ ҚАЙТУ (L16, L17) =================
  MK.S7 = S("L16");
  const WALK_B = S("L17");
  add({
    bg: () => BG.road(), bgKey: "road",
    t0: S("L16"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L16"), { x: 0, y: -450, z: 1.1 }], [WALK_B, { x: 0, y: -450, z: 1.0 }]],
    actors: [
      ACT.artur({
        x: 0, y: 0, s: 0.70,
        keys: [[S("L16"), ex("sad", "armsDown", { turn: 0 })], [WALK_B, ex("tired", { walk: 1.2, turn: -0.35 })]],
        talk: ["L16", "L17"]
      })
    ],
    world: (t) => (t < WALK_B ? RB.bus(lerp(-100, 900, win(t, S("L16"), WALK_B)), 40, 0.85) : ""),
    fx: (t) => (t < WALK_B ? { sat: 0.4 } : {}),
    type: (t) => TY.pop(t, S("L16") + 0.3, "ҚОШ БОЛ, УНИВЕР!", 540, 270, { size: 80, color: "#4da8da" })
  });

  // ================= 8. ТҮЙІН + КЕҢЕС (L18) =================
  MK.S8 = S("L18");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L18"), c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[S("L18"), { x: 0, y: -560, z: 1.15 }], [E("L18") + 1, { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[S("L18"), ex("calmSmile", "fingerUp", { turn: 0 })]], talk: ["L18"] })
    ],
    type: (t) => TY.stamp(t, S("L18") + 0.4, "3 АЯЛДАМА БҰРЫН ДАЙЫНДАЛ!", 540, 320, { size: 64, color: "#f2c14e" })
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.SONGY_TOTAL = 90;

  G.SONGY_AUDIO = function (a) {
    const { mus, fx, S, E } = a;
    mus("morning", 0, S("L02"), -14, { fi: 0.5, fo: 0.5 });
    fx("whoosh", 0.3, -12);

    mus("montage2", S("L02"), S("L07"), -13, { fi: 0.4, fo: 0.5 });
    fx("bus", S("L02") + 0.4, -12);
    fx("door", S("L03") - 0.1, -9);
    fx("strain", S("L04") + 0.5, -10);
    fx("brakeSqueal", S("L06") + 1.0, -9);

    mus("tension2", S("L07"), S("L12"), -13, { fi: 0.5, fo: 0.4 });
    fx("whistleGuard", S("L09") + 0.1, -11);

    mus("chase", S("L12"), S("L16"), -12, { fi: 0.4, fo: 0.4 });
    fx("doorSlam", S("L15") + 2.2, -7);
    fx("busGo", S("L16") + 0.1, -10);

    mus("western", S("L16"), S("L18"), -13, { fi: 0.5, fo: 0.6 });
    fx("dundun", S("L16") + 0.3, -8);

    mus("outro", S("L18"), a.TOTAL, -12, { fi: 0.6, fo: 2.0 });
    fx("ping", S("L18") + 0.3, -10);
  };
})(typeof window !== "undefined" ? window : globalThis);
