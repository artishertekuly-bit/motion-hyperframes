/* «Студенттің стипендиясы: 48 сағаттық шейх» (Reels 9:16, ~1:41) — кадрлар.
 * 0. Ілмек (стипендия: 48 сағат) → 1. Түнгі 00:01 дің! → 2. +45 000 ₸!
 * → 3. Дубай режимі (көзілдірік, шейх) → 4. «Бүгін есеп менде!» (пицца, донер)
 * → 5. Такси Комфорт плюс → 6. 1-күн: байлық пен той → 7. 2-күн: қарыздар келді
 * → 8. Асхана 12 000, Нұрлан 10 000... → 9. 3-күн таңертең: Баланс 380 ₸!
 * → 10. «Ақша қайда кетті?!» → 11. Тоңазытқыш: жарты пияз бен су
 * → 12. 1 Роллтон мен 1 пакет шай → 13. 5-ші рет қайнаған сары су
 * → 14. «Түсін елестетіп іш!» → 15. Келесі айға дейін үміт → 16. Түйін + Кеңес.
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

  // Жатақхана бөлмесі фоны
  function dormBg(opts) {
    opts = opts || {};
    let far = `<defs><linearGradient id="dmSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${opts.night ? "#1a1c29" : "#e8ecf2"}"/><stop offset="1" stop-color="${opts.night ? "#2b3044" : "#ffffff"}"/></linearGradient></defs>` +
      `<rect x="-3000" y="-3000" width="6000" height="3000" fill="url(#dmSky)"/>` +
      RR(-450, -1100, 900, 650, opts.night ? "#1f2233" : "#d9e2ec", 6, 8) +
      Ln("M-450,-780 L450,-780 M0,-1100 L0,-450", 6, opts.night ? "#11131c" : "#bcccdc");
    let mid = RF(-3000, -200, 6000, 1400, opts.night ? "#202330" : "#d0d7de") +
      RR(-600, -420, 1200, 320, opts.night ? "#3a2d26" : "#8d6e63", 6, 8) + // жатақхана үстелі
      Ln("M-500,-100 L-500,400 M500,-100 L500,400", 24, opts.night ? "#2c221c" : "#6d4c41");
    return { far, mid, near: "" };
  }

  // Kaspi хабарламасы графикасы
  const kaspiNotice = (x, y, s, txt, col) => g(x, y, s,
    RR(-260, -110, 520, 220, "#ffffff", 6, 28) +
    RF(-260, -110, 520, 65, col || "#f14635", 28) +
    TX(0, -68, "Kaspi.kz", 36, "#ffffff") +
    TB(0, 36, txt, 56, col || "#f14635")
  );

  // Тоңазытқыш іші (бос, тек жарты пияз бен шөлмек)
  const emptyFridge = (x, y, s) => g(x, y, s,
    RR(-350, -600, 700, 1100, "#dff0ea", 8, 20) +
    Ln("M-350,-200 L350,-200 M-350,200 L350,200", 10, "#99c4b2") +
    // Жарты пияз
    C(-120, 140, 48, "#e8a87c", 5) + Ln("M-120,92 L-120,70", 8, "#7cc47a") +
    // Су құйылған шөлмек
    RR(100, 40, 70, 150, "#a8d8ea", 4, 10) + RR(115, 0, 40, 40, "#4f98ca", 4, 4)
  );

  // Шай пакетигі мен кеселер
  const teaCups = (x, y, s) => g(x, y, s,
    // 4 кесе
    RR(-220, 0, 90, 80, "#ffffff", 4, 10) + RR(-70, 0, 90, 80, "#ffffff", 4, 10) +
    RR(80, 0, 90, 80, "#ffffff", 4, 10) + RR(230, 0, 90, 80, "#ffffff", 4, 10) +
    // сары қайнаған су
    RF(-215, 20, 80, 55, "#f7f0c6", 6) + RF(-65, 20, 80, 55, "#f7f0c6", 6) +
    RF(85, 20, 80, 55, "#f7f0c6", 6) + RF(235, 20, 80, 55, "#f7f0c6", 6) +
    // шай пакетигінің жібі
    Ln("M-30,-40 L0,20", 4, "#ffffff") + RR(-45, -70, 30, 30, "#e85d75", 2, 4)
  );

  // ================= 0. ІЛМЕК: 48 сағаттық құбылыс (L01) =================
  MK.S0 = S("L01");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: 0, c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[0, { x: 0, y: -560, z: 1.15 }], [E("L01"), { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[0, ex("calmSmile", "fingerUp", { turn: 0 })]], talk: ["L01"] })
    ],
    type: (t) => TY.pop(t, 0.4, "СТИПЕНДИЯ: 48 САҒАТ", 540, 300, { size: 76, color: "#f2c14e", wob: 5 }) +
                 TY.stamp(t, Wt("L01", 6), "ҚАУІПТІ СЫНАҚ", 540, 420, { size: 84, color: "#ff5252" })
  });

  // ================= 1. ТҮНГІ 00:01 ДІҢ! (L02, L03) =================
  MK.S1 = S("L02");
  add({
    bg: () => dormBg({ night: true }), bgKey: "dormNight",
    t0: S("L02"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L02"), { x: 0, y: -450, z: 1.05 }], [S("L03"), { x: -80, y: -450, z: 1.2 }]],
    actors: [
      ACT.artur({ x: -140, y: 0, s: 0.70, keys: [[S("L02"), ex("happySmile", "phoneUp", { turn: 0.15 })]], talk: ["L02"] }),
      ACT.teen({ x: 160, y: 0, s: 0.70, keys: [[S("L02"), ex("nervous", "phoneUp", { turn: -0.2 })], [S("L03"), ex("happySmile", "cheer", { turn: -0.25 })]], talk: ["L03"] })
    ],
    world: (t) => (t >= S("L03") ? kaspiNotice(0, -680, 1.1, "+45 000 ₸", "#27ae60") : ""),
    type: (t) => (t < S("L03") ? TY.pop(t, S("L02") + 1.2, "ДІҢ! 00:01", 540, 260, { size: 96, color: "#27ae60", wob: 6 }) : "")
  });

  // ================= 2. ДУБАЙ РЕЖИМІ: ШЕЙХТАР (L04, L05) =================
  MK.S2 = S("L04");
  add({
    bg: () => dormBg({ night: false }), bgKey: "dorm",
    t0: S("L04"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L04"), { x: 0, y: -450, z: 1.1 }], [S("L05"), { x: 0, y: -450, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.74, keys: [[S("L04"), ex("smug", "hands1", { turn: 0 })], [S("L05"), ex("happySmile", "cheer", { turn: 0 })]], talk: ["L04", "L05"] })
    ],
    type: (t) => TY.pop(t, S("L04") + 0.3, "ДУБАЙ РЕЖИМІ!", 540, 260, { size: 90, color: "#f2c14e", wob: 5 }) +
                 TY.stamp(t, S("L05") + 0.3, "БҮГІН ЕСЕП МЕНДЕ!", 540, 380, { size: 76, color: "#27ae60" })
  });

  // ================= 3. ТАКСИ КОМФОРТ ПЛЮС (L06, L07) =================
  MK.S3 = S("L06");
  add({
    bg: () => BG.living(), bgKey: "living",
    t0: S("L06"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L06"), { x: -140, y: -450, z: 1.1 }], [S("L07"), { x: 120, y: -450, z: 1.2 }]],
    actors: [
      ACT.teen({ x: -180, y: 0, s: 0.70, keys: [[S("L06"), ex("happySmile", "shrug", { turn: 0.2 })]], talk: ["L06"] }),
      ACT.artur({ x: 140, y: 0, s: 0.72, keys: [[S("L06"), ex("smug", "armsDown", { turn: -0.2 })], [S("L07"), ex("proud", "fingerUp", { turn: -0.25 })]], talk: ["L07"] })
    ],
    type: (t) => TY.pop(t, S("L07") + 0.4, "КОМФОРТ ПЛЮС!", 540, 280, { size: 84, color: "#f2c14e", wob: 4 })
  });

  // ================= 4. 1-КҮН: БАЙЛЫҚ МОНТАЖЫ (L08) =================
  MK.S4 = S("L08");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L08"), c0: { x: 0, y: -560 }, fadeIn: 0.25,
    cam: [[S("L08"), { x: 0, y: -560, z: 1.15 }], [E("L08"), { x: 0, y: -560, z: 1.25 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[S("L08"), ex("happySmile", "cheer", { turn: 0 })]], talk: ["L08"] })
    ],
    type: (t) => TY.pop(t, S("L08") + 0.4, "1-КҮН: ШЕЙХТАР ТОЙЫ", 540, 280, { size: 80, color: "#7cc47a" })
  });

  // ================= 5. 2-КҮН: ҚАРЫЗДАР КЕЛДІ (L09, L10, L11) =================
  MK.S5 = S("L09");
  add({
    bg: () => dormBg({ night: false }), bgKey: "dorm",
    t0: S("L09"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L09"), { x: 0, y: -450, z: 1.05 }], [S("L10"), { x: -140, y: -450, z: 1.15 }], [S("L11"), { x: 140, y: -450, z: 1.2 }]],
    actors: [
      ACT.teen({ x: -180, y: 0, s: 0.70, keys: [[S("L09"), ex("deadpan", "armsDown", { turn: 0.2 })], [S("L10"), ex("determined", "point", { turn: 0.25 })]], talk: ["L10"] }),
      ACT.artur({ x: 140, y: 0, s: 0.70, keys: [[S("L09"), ex("nervous", "shrug", { turn: -0.15 })], [S("L11"), ex("sad", "reach", { turn: -0.2 })]], talk: ["L09", "L11"] })
    ],
    world: (t) => (t >= S("L10") ? kaspiNotice(0, -660, 0.95, "−22 000 ₸", "#e85d75") : ""),
    type: (t) => TY.stamp(t, S("L09") + 0.4, "ҚАРЫЗДАР ТІЗІМІ", 540, 260, { size: 76, color: "#e85d75" })
  });

  // ================= 6. 3-КҮН ТАҢЕРТЕҢ: БАЛАНС 380 ₸ (L12, L13) =================
  MK.S6 = S("L12");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L12"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L12"), { x: 0, y: -450, z: 1.1 }], [S("L12") + 2, { x: 0, y: -450, z: 1.4 }, eio]],
    shake: (t) => (t > S("L13") ? 12 : 0),
    world: (t) => kaspiNotice(0, -450, 1.35, "380 ₸", "#e85d75"),
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.70, keys: [[S("L12"), ex("shock", "phoneUp", { turn: 0 })], [S("L13"), ex("shock", { mouth: "gasp", squash: 1.08 })]], talk: ["L12", "L13"] })
    ],
    type: (t) => TY.stamp(t, S("L12") + 2, "БАЛАНС: 380 ₸", 540, 260, { size: 96, color: "#e85d75", rot: -5 })
  });

  // ================= 7. ТОҢАЗЫТҚЫШ ШЫНДЫҒЫ (L14, L15) =================
  MK.S7 = S("L14");
  add({
    bg: () => BG.kitchen(), bgKey: "kitchen",
    t0: S("L14"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L14"), { x: 0, y: -450, z: 1.05 }], [S("L15"), { x: -100, y: -450, z: 1.15 }]],
    actors: [
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L14"), ex("sad", "shrug", { turn: -0.2 })]], talk: ["L14"] }),
      ACT.teen({ x: -180, y: 0, s: 0.70, keys: [[S("L14"), ex("tired", "armsDown", { turn: 0.2 })], [S("L15"), ex("nervous", "hands1", { turn: 0.25 })]], talk: ["L15"] })
    ],
    world: (t) => emptyFridge(0, -200, 0.8),
    type: (t) => TY.pop(t, S("L14") + 0.5, "ЖАРТЫ ПИЯЗ БЕН СУ", 540, 260, { size: 76, color: "#4da8da" })
  });

  // ================= 8. 5-ШІ РЕТ ҚАЙНАҒАН ШАЙ (L16, L17, L18) =================
  MK.S8 = S("L16");
  add({
    bg: () => dormBg({ night: false }), bgKey: "dorm",
    t0: S("L16"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L16"), { x: 0, y: -450, z: 1.1 }], [S("L17"), { x: -120, y: -450, z: 1.2 }], [S("L18"), { x: 120, y: -450, z: 1.25 }]],
    actors: [
      ACT.artur({ x: 140, y: 0, s: 0.70, keys: [[S("L16"), ex("calmSmile", "reach", { turn: -0.2 })], [S("L18"), ex("smug", "fingerUp", { turn: -0.25 })]], talk: ["L16", "L18"] }),
      ACT.teen({ x: -160, y: 0, s: 0.70, keys: [[S("L16"), ex("deadpan", "armsDown", { turn: 0.2 })], [S("L17"), ex("shock", "shrug", { turn: 0.25 })]], talk: ["L17"] })
    ],
    world: (t) => teaCups(0, 0, 1.0),
    type: (t) => TY.pop(t, S("L18") + 0.2, "ТҮСІН ЕЛЕСТЕТІП ІШ!", 540, 260, { size: 78, color: "#f2c14e", wob: 5 })
  });

  // ================= 9. ҮМІТ ПЕН АУА (L19) =================
  MK.S9 = S("L19");
  add({
    bg: () => dormBg({ night: false }), bgKey: "dorm",
    t0: S("L19"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L19"), { x: 0, y: -450, z: 1.05 }], [E("L19"), { x: 0, y: -450, z: 1.15 }]],
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.72, keys: [[S("L19"), ex("calmSmile", "shrug", { turn: 0 })]], talk: ["L19"] })
    ],
    type: (t) => TY.pop(t, S("L19") + 0.4, "АМАН ҚАЛУ РЕЖИМІ", 540, 280, { size: 80, color: "#7cc47a" })
  });

  // ================= 10. ТҮЙІН ЖӘНЕ КЕҢЕС (L20) =================
  MK.S10 = S("L20");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L20"), c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[S("L20"), { x: 0, y: -560, z: 1.15 }], [E("L20") + 1, { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[S("L20"), ex("calmSmile", "fingerUp", { turn: 0 })]], talk: ["L20"] })
    ],
    type: (t) => TY.stamp(t, S("L20") + 0.4, "СТИПЕНДИЯ КҮНІ ТЕЛЕФОНДЫ ӨШІР!", 540, 320, { size: 60, color: "#f2c14e" })
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.SONGY_TOTAL = 102;

  // ---------- Аудио микс параметрлері ----------
  G.SONGY_AUDIO = function (a) {
    const { mus, fx, S, E, Wt, M } = a;
    mus("morning", 0, S("L02"), -14, { fi: 0.5, fo: 0.8 });
    fx("whoosh", 0.3, -12);

    mus("montage3", S("L02"), S("L08"), -12, { fi: 0.5, fo: 0.5 });
    fx("notifs", S("L02") + 1.2, -6); // 00:01 дің!
    fx("cheer", S("L03"), -12);
    fx("coins", S("L05") + 0.5, -9);

    mus("tension2", S("L08"), S("L12"), -13, { fi: 0.5, fo: 0.5 });
    fx("door", S("L09"), -8);
    fx("bills", S("L10") + 0.5, -9);

    mus("epic", S("L12"), S("L14"), -10, { fi: 0.4, fo: 0.4 });
    fx("dundun", S("L12") + 1.8, -6); // баланс 380 тг
    fx("scream", S("L13") + 0.2, -14);

    mus("western", S("L14"), S("L19"), -13, { fi: 0.5, fo: 0.6 });
    fx("creak", S("L14") + 0.2, -10); // тоңазытқыш есігі
    fx("water", S("L16") + 0.5, -12);

    mus("outro", S("L19"), a.TOTAL, -12, { fi: 0.6, fo: 2.0 });
    fx("ping", S("L20") + 0.3, -10);
  };
})(typeof window !== "undefined" ? window : globalThis);
