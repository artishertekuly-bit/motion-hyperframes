/* «Базардағы картон: Джинсы алу хикаясы» (Reels 9:16, ~1:43) — кадрлар.
 * 0. Ілмек (қысқы базар) → 1. Күту (жылы бутик) ↔ 2. Шындық (анам ауаға ақша төлемейді)
 * → 3. Базар -20° аяз → 4. Сатушы апай («Түркиядан жаңа келді») → 5. Дордой пакеті
 * → 6. Картон қағаз (мұз үстінде жалаңаяқ) → 7. Көрпе бүркеу → 8. Шалбар темірдей суық
 * → 9. Шалбар кеудеге дейін → 10. «Өсесің әлі!» → 11. Баға: 25 000 ₸ → 12. Анам: 10 000 ₸!
 * → 13. Сатушы: «Жоқ!» → 14. «Жүр кеттік!» → 15. Анамның 3 қадамы (Slow-mo: 1... 2... 2.5...)
 * → 16. «Әй тоқта, алсаң ал!» → 17. Үйде қайырылған шалбар (+15 000 ₸ үнем) → 18. Түйін + Кеңес.
 */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RB = G.REELS_BG, K = G.REELS_KIT, RIG = G.ArturRig;
  const { S, E, TY, lerp, clamp, sm, eio, eout, spring, win, noise, hash } = Q;
  const { BG, P, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { Wt, POSES: PO, ACT, puff, speed, shout, notes, sweat, tears, confetti, stars, thought, rewind, card, phoneBig } = K;
  const { g, TB, E: EL } = RB;
  const X = RIG.EXPR;
  const SH = [], MK = {};
  const add = (o) => SH.push(o);
  const ex = (...a) => Object.assign({}, ...a.map((k) => (typeof k === "string" ? X[k] || PO[k] || RIG.POSES[k] : k)));

  // Қысқы базар фоны (қар, шатырлар, базар адамдары)
  function winterBazaarBg() {
    let far = `<defs><linearGradient id="wbzSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8cde3"/><stop offset="1" stop-color="#dce8f5"/></linearGradient></defs>` +
      `<rect x="-3000" y="-3000" width="6000" height="3000" fill="url(#wbzSky)"/>`;
    // Алыстағы қар басқан шатырлар
    for (let i = 0; i < 8; i++) {
      const bx = -2100 + i * 600;
      far += g(bx, -200, 1,
        RR(-250, -750, 500, 550, ["#4a6fa5", "#c85a53", "#3d8b7a", "#d9822b"][i % 4], 6, 4) +
        P("M-290,-750 L290,-750 L250,-860 L-250,-860Z", "#eef4fa", 6) + // төбедегі қар
        P("M-260,-750 Q0,-710 260,-750 L240,-770 L-240,-770Z", "#ffffff", 4) // мұз сүңгілері
      );
    }
    // Қар басқан жер
    let mid = RF(-3000, -200, 6000, 1400, "#e3ecf5") +
      Ln("M-3000,-200 L3000,-200", 12, "#cbd7e3");
    for (let i = 0; i < 20; i++) {
      const sx = -2800 + i * 290, sy = -170 + (i % 5) * 60;
      mid += C(sx, sy, 8 + (i % 4) * 4, "#ffffff", 0);
    }
    return { far, mid, near: "" };
  }

  // Жылы сауда орталығы (бутик / кофе) фоны
  function boutiqueBg() {
    let far = `<defs><linearGradient id="btqG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2236"/><stop offset="1" stop-color="#56426d"/></linearGradient></defs>` +
      `<rect x="-3000" y="-3000" width="6000" height="3000" fill="url(#btqG)"/>`;
    for (let i = 0; i < 5; i++) {
      far += C(-1200 + i * 600, -800, 140, "#ffe8aa", 0); // сары шамдар
    }
    let mid = RF(-3000, -200, 6000, 1400, "#3d3248") +
      RR(-500, -700, 1000, 500, "#ffffff", 6, 12) +
      TB(0, -420, "MEGA BOUTIQUE", 72, "#d4af37");
    return { far, mid, near: "" };
  }

  // Картон қағаз (қар үстінде)
  const cardboard = (x, y, s) => g(x, y, s,
    P("M-220,-40 L220,-30 L200,45 L-240,35Z", "#c29b68", 6) +
    Ln("M-200,-10 L180,-2", 3, "#a57d4a") +
    Ln("M-210,12 L170,20", 3, "#a57d4a") +
    P("M-220,-40 L-180,-60 L-140,-40Z", "#e3ecf5", 3) // бұрышындағы қар
  );

  // Көрпе (сатушы ұстап тұратын жамылғы)
  const blanket = (x, y, s, open) => g(x, y, s,
    P(open ? "M-340,-600 Q0,-540 340,-600 L320,0 Q0,-40 -320,0Z" : "M-180,-600 Q0,-560 180,-600 L160,0 Q0,-20 -160,0Z", "#b83b5e", 7) +
    P(open ? "M-320,-580 Q0,-520 320,-580 L300,-520 Q0,-460 -300,-520Z" : "M-160,-580 Q0,-540 160,-580 L140,-520 Q0,-480 -140,-520Z", "#f08a5d", 4)
  );

  // ================= 0. ІЛМЕК: Қысқы базар сынағы (L01) =================
  MK.S0 = S("L01");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: 0, c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[0, { x: 0, y: -560, z: 1.15 }], [E("L01"), { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[0, ex("shrug", "calmSmile", { turn: 0 })], [Wt("L01", 4), ex("shock", { mouth: "gasp", squash: 1.05 })]], talk: ["L01"] })
    ],
    type: (t) => TY.pop(t, 0.4, "ҚЫСҚЫ БАЗАР", 540, 320, { size: 90, color: "#4da8da", wob: 4 }) +
                 TY.stamp(t, Wt("L01", 5), "КАРТОН СЫНАҒЫ", 540, 440, { size: 76, rot: -5 })
  });

  // ================= 1. КҮТУ: Мега мен жылы бутик (L02) =================
  MK.S1 = S("L02");
  add({
    bg: () => boutiqueBg(), bgKey: "boutique",
    t0: S("L02"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L02"), { x: 0, y: -450, z: 1.0 }], [E("L02"), { x: 0, y: -450, z: 1.15 }]],
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.72, keys: [[S("L02"), ex("happySmile", "cheer", { turn: 0 })]], talk: ["L02"] })
    ],
    type: (t) => TY.pop(t, S("L02") + 0.3, "КҮТУ: САУДА ОРТАЛЫҒЫ", 540, 260, { size: 68, color: "#ffe8aa" })
  });

  // ================= 2. ШЫНДЫҚ: Анам мен ауаға ақша (L03) =================
  MK.S2 = S("L03");
  add({
    bg: () => winterBazaarBg(), bgKey: "wbazaar",
    t0: S("L03"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L03"), { x: 0, y: -450, z: 1.05 }], [E("L03"), { x: -80, y: -450, z: 1.15 }]],
    actors: [
      ACT.mom({ x: -160, y: 0, s: 0.72, keys: [[S("L03"), ex("angry", "point", { turn: 0.25 })]], talk: ["L03"] }),
      ACT.artur({ x: 180, y: 0, s: 0.68, keys: [[S("L03"), ex("nervous", "armsDown", { turn: -0.2 })]] })
    ],
    type: (t) => TY.stamp(t, S("L03") + 1.2, "АУАҒА АҚША: 0 ₸!", 540, 280, { size: 84, color: "#e85d75", rot: 4 })
  });

  // ================= 3. БАЗАР: Минус жиырма градус (L04) =================
  MK.S3 = S("L04");
  add({
    bg: () => winterBazaarBg(), bgKey: "wbazaar",
    t0: S("L04"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L04"), { x: 0, y: -450, z: 1.1 }], [E("L04"), { x: 0, y: -450, z: 1.25 }]],
    shake: (t) => 8,
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.72, keys: [[S("L04"), ex("scared", "chest", { turn: 0, squash: 0.95 })]], talk: ["L04"] })
    ],
    world: (t) => sweat(0, -680, t, 1.2, 3),
    type: (t) => TY.pop(t, S("L04") + 0.3, "−20°C АЯЗ", 540, 280, { size: 104, color: "#00adb5", wob: 6 })
  });

  // ================= 4. САТУШЫ АПАЙ: Түркиядан жаңа келді (L05, L06, L07) =================
  MK.S4 = S("L05");
  add({
    bg: () => winterBazaarBg(), bgKey: "wbazaar",
    t0: S("L05"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L05"), { x: -60, y: -450, z: 1.0 }], [S("L06"), { x: 140, y: -450, z: 1.15 }], [S("L07"), { x: -120, y: -450, z: 1.1 }]],
    actors: [
      ACT.aje({ x: -220, y: 0, s: 0.72, keys: [[S("L05"), ex("happySmile", "cheer", { turn: 0.25 })], [S("L07"), ex("smug", "point", { turn: 0.3 })]], talk: ["L05", "L07"] }),
      ACT.artur({ x: 180, y: 0, s: 0.68, keys: [[S("L05"), ex("nervous", "armsDown", { turn: -0.2 })], [S("L06"), ex("deadpan", "point", { turn: -0.15 })]], talk: ["L06"] })
    ],
    world: (t) => cardboard(-60, 20, 0.9),
    type: (t) => TY.pop(t, S("L05") + 0.5, "ТҮРКИЯ (ДОРДОЙ)", 540, 260, { size: 76, color: "#f2c14e" })
  });

  // ================= 5. КАРТОН СЫНАҒЫ: Жалаңаяқ тұру (L08) =================
  MK.S5 = S("L08");
  add({
    bg: () => winterBazaarBg(), bgKey: "wbazaar",
    t0: S("L08"), c0: { x: 0, y: -450 }, fadeIn: 0.3,
    cam: [[S("L08"), { x: 0, y: -420, z: 1.1 }], [S("L08") + 2, { x: 0, y: -380, z: 1.35 }, eio]],
    shake: (t) => (t > S("L08") + 1 ? 16 : 0),
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.72, keys: [[S("L08"), ex("scared", "shrug", { turn: 0 })], [S("L08") + 2, ex("shock", { mouth: "gasp", squash: 0.9, eye: { scale: 1.4 } })]], talk: ["L08"] })
    ],
    world: (t) => cardboard(0, 30, 1.2) + sweat(0, -680, t, 1.5, 4),
    fx: (t) => ({ sat: 0.6, dim: 0.1 }),
    type: (t) => TY.stamp(t, S("L08") + 0.4, "КАРТОН ҚАҒАЗ", 540, 290, { size: 84, color: "#c29b68" })
  });

  // ================= 6. КӨРПЕ ЖАБУ (L09, L10) =================
  MK.S6 = S("L09");
  add({
    bg: () => winterBazaarBg(), bgKey: "wbazaar",
    t0: S("L09"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L09"), { x: -80, y: -450, z: 1.05 }], [S("L10"), { x: 80, y: -450, z: 1.15 }]],
    actors: [
      ACT.aje({ x: -240, y: 0, s: 0.72, keys: [[S("L09"), ex("happySmile", "reachBoth", { turn: 0.25 })]], talk: ["L09"] }),
      ACT.artur({ x: 120, y: 0, s: 0.70, keys: [[S("L09"), ex("nervous", "armsDown", { turn: -0.1 })], [S("L10"), ex("scared", "shrug", { turn: 0 })]], talk: ["L10"] })
    ],
    world: (t) => blanket(-60, -200, 1.1, true) + cardboard(120, 20, 1.0),
    type: (t) => TY.pop(t, S("L10") + 0.5, "ТЕМІР ШАЛБАР", 540, 270, { size: 80, color: "#4da8da", wob: 5 })
  });

  // ================= 7. ӨЛШЕМ: Белдік кеудеде (L11, L12) =================
  MK.S7 = S("L11");
  add({
    bg: () => winterBazaarBg(), bgKey: "wbazaar",
    t0: S("L11"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L11"), { x: 100, y: -450, z: 1.1 }], [S("L12"), { x: -100, y: -450, z: 1.05 }]],
    actors: [
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L11"), ex("shock", "point", { turn: -0.2 })]], talk: ["L11"] }),
      ACT.mom({ x: -180, y: 0, s: 0.72, keys: [[S("L12"), ex("smug", "hands1", { turn: 0.2 })]], talk: ["L12"] })
    ],
    world: (t) => cardboard(160, 20, 1.0),
    type: (t) => TY.stamp(t, S("L12") + 0.3, "ӨСЕСІҢ ӘЛІ!", 540, 260, { size: 90, color: "#7cc47a", rot: -4 })
  });

  // ================= 8. САУДАЛАСУ СОҒЫСЫ (L13, L14, L15, L16) =================
  MK.S8 = S("L13");
  add({
    bg: () => winterBazaarBg(), bgKey: "wbazaar",
    t0: S("L13"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [
      [S("L13"), { x: -160, y: -450, z: 1.15 }],
      [S("L14"), { x: 160, y: -450, z: 1.25 }],
      [S("L15"), { x: -160, y: -450, z: 1.15 }],
      [S("L16"), { x: 160, y: -450, z: 1.2 }]
    ],
    actors: [
      ACT.aje({ x: -220, y: 0, s: 0.72, keys: [[S("L13"), ex("shock", "shrug", { turn: 0.25 })], [S("L15"), ex("angry", "stop", { turn: 0.3 })]], talk: ["L13", "L15"] }),
      ACT.mom({ x: 200, y: 0, s: 0.72, keys: [[S("L14"), ex("determined", "point", { turn: -0.25 })], [S("L16"), ex("angry", "hands1", { turn: -0.3 })]], talk: ["L14", "L16"] })
    ],
    type: (t) => {
      let o = "";
      if (t >= S("L13") && t < S("L14")) o += TY.pop(t, S("L13") + 0.2, "25 000 ₸", 340, 280, { size: 90, color: "#e85d75" });
      if (t >= S("L14")) o += TY.stamp(t, S("L14") + 0.2, "10 000 ₸!", 740, 280, { size: 96, color: "#7cc47a", rot: -6 });
      return o;
    }
  });

  // ================= 9. АНАМНЫҢ 3 ҚАДАМЫ: Slow-Mo (L17) =================
  MK.S9 = S("L17");
  const STEP1 = Wt("L17", 8), STEP2 = Wt("L17", 9), STEP25 = Wt("L17", 11);
  add({
    bg: () => winterBazaarBg(), bgKey: "wbazaar",
    t0: S("L17"), c0: { x: 0, y: -450 }, fadeIn: 0.3,
    cam: [
      [S("L17"), { x: 0, y: -450, z: 1.05 }],
      [STEP1, { x: 60, y: -450, z: 1.15 }],
      [STEP2, { x: 140, y: -450, z: 1.25 }],
      [STEP25, { x: 200, y: -440, z: 1.35 }, eio]
    ],
    actors: [
      ACT.mom({
        x: 100, y: 0, s: 0.72,
        keys: [
          [S("L17"), ex("determined", { turn: 0.4 })],
          [STEP1, ex("determined", { turn: 0.5, walk: 1.2 })],
          [STEP2, ex("determined", { turn: 0.5, walk: 0.8 })],
          [STEP25, ex("smug", { turn: 0.5, walk: 0 })]
        ]
      }),
      ACT.artur({
        x: -80, y: 0, s: 0.68,
        keys: [
          [S("L17"), ex("scared", { turn: 0.3 })],
          [STEP1, ex("scared", { turn: 0.4, walk: 1.2 })],
          [STEP25, ex("shock", { turn: 0.4, walk: 0 })]
        ],
        talk: ["L17"]
      })
    ],
    fx: (t) => ({ dof: t > STEP1 ? 4 : 0, sat: t > STEP1 ? 0.8 : 1 }),
    type: (t) => {
      let o = TY.pop(t, S("L17") + 0.3, "АНАМНЫҢ 3 ҚАДАМЫ", 540, 240, { size: 76, color: "#f2c14e" });
      if (t >= STEP1) o += TY.pop(t, STEP1, "1...", 320, 360, { size: 90, color: "#ffffff" });
      if (t >= STEP2) o += TY.pop(t, STEP2, "2...", 540, 360, { size: 98, color: "#ffffff" });
      if (t >= STEP25) o += TY.pop(t, STEP25, "2.5...", 760, 360, { size: 110, color: "#ff5b4b", wob: 6 });
      return o;
    }
  });

  // ================= 10. САТУШЫНЫҢ БЕРІЛУІ (L18) =================
  MK.S10 = S("L18");
  add({
    bg: () => winterBazaarBg(), bgKey: "wbazaar",
    t0: S("L18"), c0: { x: 0, y: -450 }, fadeIn: 0.15,
    cam: [[S("L18"), { x: -160, y: -450, z: 1.25 }], [E("L18"), { x: -160, y: -450, z: 1.35 }]],
    shake: (t) => (t < S("L18") + 0.8 ? 14 : 0),
    actors: [
      ACT.aje({ x: -160, y: 0, s: 0.74, keys: [[S("L18"), ex("shock", "reachBoth", { turn: 0.1, mouth: "shout", squash: 1.1 })]], talk: ["L18"] })
    ],
    type: (t) => TY.pop(t, S("L18") + 0.1, "ТОҚТА, АЛСАҢ АЛ!", 540, 290, { size: 100, color: "#7cc47a", wob: 6 })
  });

  // ================= 11. ҮЙДЕГІ ЖЕҢІС: 3 рет қайырылған шалбар (L19) =================
  MK.S11 = S("L19");
  add({
    bg: () => BG.living(), bgKey: "living",
    t0: S("L19"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L19"), { x: 0, y: -450, z: 1.05 }], [E("L19"), { x: 0, y: -450, z: 1.15 }]],
    actors: [
      ACT.artur({ x: -140, y: 0, s: 0.70, keys: [[S("L19"), ex("deadpan", "shrug", { turn: 0.1 })]], talk: ["L19"] }),
      ACT.mom({ x: 180, y: 0, s: 0.72, keys: [[S("L19"), ex("happySmile", "cheer", { turn: -0.2 })]] })
    ],
    type: (t) => TY.stamp(t, S("L19") + 0.4, "3 РЕТ ҚАЙЫРЫЛҒАН", 340, 260, { size: 68, color: "#4da8da" }) +
                 TY.pop(t, S("L19") + 2.5, "+15 000 ₸ ҮНЕМ!", 720, 260, { size: 84, color: "#7cc47a" })
  });

  // ================= 12. ТҮЙІН ЖӘНЕ КЕҢЕС (L20) =================
  MK.S12 = S("L20");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L20"), c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[S("L20"), { x: 0, y: -560, z: 1.15 }], [E("L20") + 1, { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[S("L20"), ex("calmSmile", "fingerUp", { turn: 0 })]], talk: ["L20"] })
    ],
    type: (t) => TY.stamp(t, S("L20") + 0.4, "БАЗАРДЫҢ БАСТЫ ЗАҢЫ: 3 ҚАДАМ", 540, 320, { size: 70, color: "#f2c14e" })
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.SONGY_TOTAL = 104;

  // ---------- Аудио микс параметрлері ----------
  G.SONGY_AUDIO = function (a) {
    const { mus, fx, S, E, Wt, M } = a;
    mus("morning", 0, S("L03"), -14, { fi: 0.5, fo: 0.8 });
    fx("whoosh", 0.3, -12);
    fx("pops", Wt("L01", 3), -12);

    mus("montage2", S("L03"), S("L08"), -13, { fi: 0.6, fo: 0.6 });
    fx("door", S("L03") + 0.1, -10);
    fx("cityAmb", S("L04"), -20, { dur: 6 });

    mus("tension", S("L08"), S("L13"), -12, { fi: 0.5, fo: 0.5 });
    fx("thud", S("L08") + 0.2, -8); // картон тастау
    fx("crunch", S("L08") + 1.2, -8); // қар сықыры
    fx("strain", S("L10") + 0.5, -9);

    mus("western", S("L13"), S("L17"), -12, { fi: 0.4, fo: 0.5 });
    fx("stamp", S("L14") + 0.2, -8);

    mus("epic2", S("L17"), S("L18") + 0.2, -10, { fi: 0.3, fo: 0.4 });
    fx("heartbeat", S("L17") + 0.5, -11, { dur: S("L18") - S("L17") });
    fx("stepsUp", Wt("L17", 8), -8);
    fx("stepsUp", Wt("L17", 9), -8);

    fx("dundun", S("L18"), -6);
    fx("cheer", S("L18") + 0.5, -14);

    mus("warm", S("L19"), S("L20") + 0.5, -13, { fi: 0.6, fo: 0.8 });
    fx("coins", S("L19") + 2.5, -9);

    mus("outro", S("L20"), a.TOTAL, -12, { fi: 0.6, fo: 2.0 });
    fx("ping", S("L20") + 0.3, -10);
  };
})(typeof window !== "undefined" ? window : globalThis);
