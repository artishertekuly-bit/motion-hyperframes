/* «Қызу 37.2°: Ер адамның соңғы демі» (Reels 9:16, ~1:39) — кадрлар.
 * 0. Ілмек (қыздар 39° ↔ жігіттер 37.2°) → 1. Жедел жәрдем шақырыңдар
 * → 2. Термометр 37.2° (драма) → 3. Өсиет жазу → 4. Інісі мен ақ кроссовка
 * → 5. «Кроссовкама тиіспе!» → 6. Бас дәрігер — Анам кірді → 7. «Не болып қалды?»
 * → 8. «37.2...» → 9. Диагноз: «Бәрі телефоннан!» → 10. «Өкпем ауырып тұр»
 * → 11. Қойдың майы терапиясы → 12. Қазақ анасының әмбебап қаруы
 * → 13. Қара бұрыш шай + 10 қабат көрпе → 14. Үй саунасы (бу бұрқырау)
 * → 15. Өмірді терлеп шығару → 16. 36.6°! Төсектен атып тұру → 17. Анам: «Телефонды тастап едің...»
 * → 18. Түйін + Кеңес.
 */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RB = G.REELS_BG, K = G.REELS_KIT, RIG = G.ArturRig;
  const { S, E, TY, lerp, clamp, sm, eio, eout, spring, win, noise, hash } = Q;
  const { BG, P, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { Wt, POSES: PO, ACT, puff, speed, shout, notes, sweat, tears, thought } = K;
  const { g, TB, E: EL } = RB;
  const X = RIG.EXPR;
  const SH = [], MK = {};
  const add = (o) => SH.push(o);
  const ex = (...a) => Object.assign({}, ...a.map((k) => (typeof k === "string" ? X[k] || PO[k] || RIG.POSES[k] : k)));

  // Жатын бөлме / төсек фоны
  function bedroomBg() {
    let far = `<defs><linearGradient id="bdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2333"/><stop offset="1" stop-color="#3b4259"/></linearGradient></defs>` +
      `<rect x="-3000" y="-3000" width="6000" height="3000" fill="url(#bdSky)"/>` +
      RR(-400, -1100, 800, 600, "#2c3245", 6, 8) + // терезе
      Ln("M-400,-800 L400,-800 M0,-1100 L0,-500", 6, "#1f2333");
    let mid = RF(-3000, -200, 6000, 1400, "#282a36") +
      RR(-600, -400, 1200, 300, "#4e3629", 7, 10); // кереует басы
    return { far, mid, near: "" };
  }

  // Термометр графикасы (үлкен план)
  const thermometer = (x, y, s, deg, alert) => g(x, y, s,
    RR(-60, -320, 120, 540, "#ffffff", 6, 40) +
    RR(-30, -280, 60, 420, "#eef2f7", 3, 24) +
    RF(-20, alert ? -260 : 20, 40, alert ? 380 : 100, alert ? "#ff5252" : "#4caf50", 16) +
    C(0, 140, 56, alert ? "#ff5252" : "#4caf50", 6) +
    TB(0, -360, deg + "°C", 76, alert ? "#ff5252" : "#222222")
  );

  // 10 қабат көрпе астындағы таудай төсек
  const blanketsPile = (x, y, s) => g(x, y, s,
    P("M-460,0 Q-300,-420 0,-440 Q300,-420 460,0Z", "#e85d75", 7) +
    P("M-440,-40 Q-280,-380 0,-400 Q280,-380 440,-40Z", "#f08a5d", 6) +
    P("M-420,-80 Q-260,-340 0,-360 Q260,-340 420,-80Z", "#3f72af", 6) +
    P("M-400,-120 Q-240,-300 0,-320 Q240,-300 400,-120Z", "#f6d55c", 6)
  );

  // ================= 0. ІЛМЕК: Қыздар 39° ↔ Жігіттер 37.2° (L01) =================
  MK.S0 = S("L01");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: 0, c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[0, { x: 0, y: -560, z: 1.15 }], [E("L01"), { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[0, ex("calmSmile", "shrug", { turn: 0 })], [Wt("L01", 6), ex("shock", { mouth: "gasp", squash: 1.05 })]], talk: ["L01"] })
    ],
    type: (t) => TY.pop(t, 0.4, "ҚЫЗДАР: 39°C (ШАҢ СОРУ)", 540, 300, { size: 68, color: "#7cc47a" }) +
                 TY.pop(t, Wt("L01", 6), "ЖІГІТТЕР: 37.2°C (ӨСИЕТ)", 540, 420, { size: 76, color: "#ff5252", wob: 5 })
  });

  // ================= 1. ЖЕДЕЛ ЖӘРДЕМ ШАҚЫРЫҢДАР (L02) =================
  MK.S1 = S("L02");
  add({
    bg: () => bedroomBg(), bgKey: "bedroom",
    t0: S("L02"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L02"), { x: 0, y: -450, z: 1.1 }], [E("L02"), { x: 0, y: -450, z: 1.25 }]],
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.70, keys: [[S("L02"), ex("sad", "chest", { turn: 0, mouth: "frown", squash: 0.92 })]], talk: ["L02"] })
    ],
    world: (t) => blanketsPile(0, 0, 0.9) + sweat(0, -680, t, 1.2, 3),
    fx: (t) => ({ dim: 0.2, sat: 0.7 }),
    type: (t) => TY.pop(t, S("L02") + 0.3, "ЖЕДЕЛ ЖӘРДЕМ!", 540, 260, { size: 84, color: "#ff5252", wob: 4 })
  });

  // ================= 2. ТЕРМОМЕТР: 37.2°C (L03) =================
  MK.S2 = S("L03");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L03"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L03"), { x: 0, y: -450, z: 1.1 }], [S("L03") + 1.5, { x: 0, y: -450, z: 1.4 }, eio]],
    shake: (t) => (t > S("L03") + 1.2 ? 14 : 0),
    world: (t) => thermometer(0, -450, 1.3, "37.2", true),
    type: (t) => TY.stamp(t, S("L03") + 1.5, "ҚАУІПТІ ДЕҢГЕЙ!", 540, 280, { size: 84, color: "#ff5252", rot: -4 })
  });

  // ================= 3. ӨСИЕТ ЖАЗУ (L04) =================
  MK.S3 = S("L04");
  add({
    bg: () => bedroomBg(), bgKey: "bedroom",
    t0: S("L04"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L04"), { x: 0, y: -450, z: 1.15 }], [E("L04"), { x: 0, y: -450, z: 1.25 }]],
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.70, keys: [[S("L04"), ex("tired", "reach", { turn: 0 })]], talk: ["L04"] })
    ],
    world: (t) => blanketsPile(0, 0, 0.9),
    type: (t) => TY.stamp(t, S("L04") + 0.4, "ӨСИЕТ ҚАҒАЗЫ", 540, 280, { size: 80, color: "#f2c14e" })
  });

  // ================= 4. ІНІСІ ЖӘНЕ АҚ КРОССОВКА (L05, L06) =================
  MK.S4 = S("L05");
  add({
    bg: () => bedroomBg(), bgKey: "bedroom",
    t0: S("L05"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L05"), { x: -120, y: -450, z: 1.1 }], [S("L06"), { x: 120, y: -450, z: 1.25 }]],
    actors: [
      ACT.kid({ x: -180, y: 0, s: 0.65, keys: [[S("L05"), ex("happySmile", "hands1", { turn: 0.25 })]], talk: ["L05"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L05"), ex("deadpan", "armsDown", { turn: -0.2 })], [S("L06"), ex("angry", "point", { turn: -0.25, mouth: "shout", squash: 1.1 })]], talk: ["L06"] })
    ],
    world: (t) => blanketsPile(160, 0, 0.8),
    type: (t) => TY.pop(t, S("L06") + 0.1, "КРОССОВКАҒА ТИІСПЕ!", 540, 260, { size: 84, color: "#e85d75", wob: 6 })
  });

  // ================= 5. АНАМ — БАС ДӘРІГЕР КІРДІ (L07, L08, L09) =================
  MK.S5 = S("L07");
  add({
    bg: () => bedroomBg(), bgKey: "bedroom",
    t0: S("L07"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L07"), { x: -140, y: -450, z: 1.05 }], [S("L09"), { x: 140, y: -450, z: 1.15 }]],
    actors: [
      ACT.mom({ x: -200, y: 0, s: 0.72, keys: [[S("L07"), ex("determined", "hips", { turn: 0.25 })], [S("L08"), ex("shock", "shrug", { turn: 0.2 })]], talk: ["L08"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L07"), ex("scared", "armsDown", { turn: -0.2 })], [S("L09"), ex("sad", "chest", { turn: -0.25 })]], talk: ["L07", "L09"] })
    ],
    world: (t) => blanketsPile(160, 0, 0.8),
    type: (t) => TY.pop(t, S("L07") + 0.5, "БАС ДӘРІГЕР", 540, 260, { size: 76, color: "#ffe8aa" })
  });

  // ================= 6. ДИАГНОЗ: ТЕЛЕФОННАН! (L10, L11, L12) =================
  MK.S6 = S("L10");
  add({
    bg: () => bedroomBg(), bgKey: "bedroom",
    t0: S("L10"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L10"), { x: -160, y: -450, z: 1.15 }], [S("L11"), { x: 160, y: -450, z: 1.2 }], [S("L12"), { x: -160, y: -450, z: 1.25 }]],
    actors: [
      ACT.mom({ x: -180, y: 0, s: 0.72, keys: [[S("L10"), ex("angry", "point", { turn: 0.25 })], [S("L12"), ex("determined", "hands1", { turn: 0.3 })]], talk: ["L10", "L12"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L10"), ex("nervous", "armsDown", { turn: -0.2 })], [S("L11"), ex("sad", "chest", { turn: -0.25 })]], talk: ["L11"] })
    ],
    world: (t) => blanketsPile(160, 0, 0.8),
    type: (t) => TY.stamp(t, S("L10") + 1.2, "ДИАГНОЗ: ТЕЛЕФОН!", 540, 280, { size: 90, color: "#e85d75", rot: -5 })
  });

  // ================= 7. ҚОЙДЫҢ МАЙЫ ТЕРАПИЯСЫ (L13) =================
  MK.S7 = S("L13");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L13"), c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[S("L13"), { x: 0, y: -560, z: 1.15 }], [E("L13"), { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[S("L13"), ex("calmSmile", "fingerUp", { turn: 0 })]], talk: ["L13"] })
    ],
    type: (t) => TY.pop(t, S("L13") + 0.3, "ҚОЙДЫҢ МАЙЫ", 540, 300, { size: 96, color: "#f2c14e", wob: 5 }) +
                 TY.stamp(t, S("L13") + 1.8, "ӘМБЕБАП ҚАРУ", 540, 420, { size: 76, color: "#7cc47a" })
  });

  // ================= 8. ҚАРА БҰРЫШ ШАЙ МЕН 10 ҚАБАТ КӨРПЕ (L14) =================
  MK.S8 = S("L14");
  add({
    bg: () => bedroomBg(), bgKey: "bedroom",
    t0: S("L14"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L14"), { x: 0, y: -450, z: 1.05 }], [E("L14"), { x: 0, y: -450, z: 1.2 }]],
    actors: [
      ACT.mom({ x: -180, y: 0, s: 0.72, keys: [[S("L14"), ex("determined", "reach", { turn: 0.25 })]], talk: ["L14"] }),
      ACT.artur({ x: 140, y: 0, s: 0.70, keys: [[S("L14"), ex("scared", "shrug", { turn: -0.2 })]] })
    ],
    world: (t) => blanketsPile(140, 0, 0.9),
    type: (t) => TY.pop(t, S("L14") + 0.5, "10 ҚАБАТ КӨРПЕ", 540, 260, { size: 84, color: "#f08a5d" })
  });

  // ================= 9. ҮЙДЕГІ САУНА: БУ БҰРҚЫРАП ТЕРЛЕУ (L15, L16) =================
  MK.S9 = S("L15");
  add({
    bg: () => bedroomBg(), bgKey: "bedroom",
    t0: S("L15"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L15"), { x: 0, y: -450, z: 1.1 }], [E("L16"), { x: 0, y: -450, z: 1.3 }]],
    shake: (t) => 6,
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.72, keys: [[S("L15"), ex("strain", { mouth: "gasp", squash: 0.94 })], [S("L16"), ex("tired", { mouth: "hmm" })]], talk: ["L15", "L16"] })
    ],
    world: (t) => blanketsPile(0, 0, 1.1) + sweat(0, -680, t, 1.8, 5),
    fx: (t) => ({ dim: 0.15, dof: 3 }),
    type: (t) => TY.pop(t, S("L15") + 0.4, "САУНА РЕЖИМІ: 100°C", 540, 260, { size: 76, color: "#ff5252", wob: 6 })
  });

  // ================= 10. 36.6°C! ТЕЛЕФОНҒА ҚАЙТА ОРАЛУ (L17, L18) =================
  MK.S10 = S("L17");
  add({
    bg: () => bedroomBg(), bgKey: "bedroom",
    t0: S("L17"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L17"), { x: 60, y: -450, z: 1.1 }], [S("L18"), { x: -60, y: -450, z: 1.15 }]],
    actors: [
      ACT.artur({ x: 120, y: 0, s: 0.72, keys: [[S("L17"), ex("happySmile", "cheer", { turn: -0.1 })]], talk: ["L17"] }),
      ACT.mom({ x: -180, y: 0, s: 0.72, keys: [[S("L18"), ex("smug", "hands1", { turn: 0.25 })]], talk: ["L18"] })
    ],
    type: (t) => TY.pop(t, S("L17") + 0.3, "36.6°C — ТІРІМІН!", 540, 260, { size: 88, color: "#7cc47a" })
  });

  // ================= 11. ТҮЙІН ЖӘНЕ КЕҢЕС (L19) =================
  MK.S11 = S("L19");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L19"), c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[S("L19"), { x: 0, y: -560, z: 1.15 }], [E("L19") + 1, { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[S("L19"), ex("calmSmile", "fingerUp", { turn: 0 })]], talk: ["L19"] })
    ],
    type: (t) => TY.stamp(t, S("L19") + 0.4, "ҚЫЗУ 37° = ҮЙ ІШІНЕ 36°!", 540, 320, { size: 68, color: "#f2c14e" })
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.SONGY_TOTAL = 100;

  // ---------- Аудио микс параметрлері ----------
  G.SONGY_AUDIO = function (a) {
    const { mus, fx, S, E, Wt, M } = a;
    mus("morning", 0, S("L02"), -14, { fi: 0.5, fo: 0.8 });
    fx("whoosh", 0.3, -12);

    mus("tension", S("L02"), S("L07"), -12, { fi: 0.5, fo: 0.5 });
    fx("heartbeat", S("L02") + 0.5, -10, { dur: 6 });
    fx("dundun", S("L03") + 1.2, -6); // 37.2° удары

    mus("montage", S("L07"), S("L13"), -13, { fi: 0.6, fo: 0.6 });
    fx("doorSlam", S("L07") + 0.1, -8); // анам есік ашты
    fx("pops", S("L10") + 1.2, -10);

    mus("western", S("L13"), S("L15"), -12, { fi: 0.5, fo: 0.5 });
    fx("stamp", S("L13") + 0.3, -8);

    mus("chaos", S("L15"), S("L17"), -11, { fi: 0.4, fo: 0.4 });
    fx("strain", S("L15") + 0.5, -8);
    fx("stoveFire", S("L15") + 1.0, -10);

    mus("warm", S("L17"), S("L19"), -13, { fi: 0.5, fo: 0.8 });
    fx("cheer", S("L17") + 0.3, -12);

    mus("outro", S("L19"), a.TOTAL, -12, { fi: 0.6, fo: 2.0 });
    fx("ping", S("L19") + 0.3, -10);
  };
})(typeof window !== "undefined" ? window : globalThis);
