/* «Супермаркеттегі кезек: "Мен тез, бір зат қана!"» (Reels 9:16, ~1:39) — кадрлар.
 * 0. Ілмек (супермаркет триллері) → 1. «Тек нан мен сүт» ↔ 2. 20 кг арба тауы
 * → 3. Касса кезегі: «Тұз ұмыттым, 2 секундта келем!» → 4. Кезек x3 жылдамдық + карта анамда
 * → 5. Кассир: «Пип-пип! 28 450 ₸!» → 6. Анам алыста алма таңдап тұр + Ашулы кезек
 * → 7. Көрші касса тұзағы (10 жұп көз) → 8. Анам 1 қорап сіріңкемен оралды
 * → 9. Сыртқа босап шығу → 10. Түйін + Кеңес.
 */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, RB = G.REELS_BG, K = G.REELS_KIT, RIG = G.ArturRig;
  const { S, E, TY, lerp, clamp, sm, eio, eout, spring, win, noise, hash } = Q;
  const { BG, P, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { Wt, POSES: PO, ACT, puff, speed, shout, sweat, tears, confetti, freezeFx } = K;
  const { g, TB } = RB;
  const X = RIG.EXPR;
  const SH = [], MK = {};
  const add = (o) => SH.push(o);
  const ex = (...a) => Object.assign({}, ...a.map((k) => (typeof k === "string" ? X[k] || PO[k] || RIG.POSES[k] : k)));

  // Супермаркет іші (сөрелер, тауарлар, касса лентасы)
  function marketBg(opts) {
    opts = opts || {};
    let far = RF(-3000, -3400, 6000, 3400, "#f5f7fa") +
      RF(-3000, -3400, 6000, 380, "#2f7d6a"); // төбедегі жасыл жолақ
    // Сөрелер
    for (const sx of [-1600, -400, 800]) {
      far += RR(sx, -1600, 900, 1400, "#e2e8f0", 6, 8);
      for (let sy = -1400; sy <= -400; sy += 280) {
        far += Ln(`M${sx},${sy} L${sx + 900},${sy}`, 8, "#94a3b8");
        for (let bx = sx + 60; bx < sx + 820; bx += 120) {
          far += RR(bx, sy - 120, 84, 116, ["#e85d75", "#5a7fc4", "#f2a541", "#7cc47a", "#f6d55c"][Math.abs(bx + sy) % 5], 4, 6);
        }
      }
    }
    let mid = RF(-3000, -100, 6000, 1600, "#cbd5e1") + Ln("M-3000,-100 L3000,-100", 6, "#94a3b8");
    if (opts.kassa) {
      // Касса лентасы мен монитор
      mid += RR(-900, -360, 1000, 360, "#334155", 7, 10) +
        RF(-860, -340, 920, 46, "#1e293b", 4) + // қара лента
        RR(-420, -640, 260, 180, "#1e293b", 6, 10) +
        RF(-400, -620, 220, 140, "#38bdf8", 4) +
        TB(-290, -535, "28 450 ₸", 40, "#ffffff");
    }
    return { far, mid, near: "" };
  }

  // Супермаркет арбасы (бос немесе таудай толы)
  const cart = (x, y, s, full) => g(x, y, s,
    Ln("M-180,-340 L-120,-340 L-80,-120 L160,-120 L200,-300 L-112,-300", 12, "#64748b") +
    (full ? (
      C(-20, -360, 74, "#f2a541", 5) + RR(20, -480, 130, 180, "#e85d75", 5, 10) +
      RR(-100, -450, 110, 150, "#5a7fc4", 5, 10) + C(100, -390, 66, "#7cc47a", 5) +
      RR(-40, -560, 120, 120, "#f6d55c", 5, 8)
    ) : "") +
    Ln("M-90,-180 L170,-180 M-100,-240 L185,-240 M-20,-300 L-20,-120 M60,-300 L60,-120 M130,-300 L120,-120", 6, "#94a3b8") +
    C(-60, -80, 34, "#1e293b", 5) + C(130, -80, 34, "#1e293b", 5)
  );

  // Арттағы тесіле қарап тұрған кезек силуэттері
  const queueStare = (x, y) => {
    let d = "";
    for (let i = 0; i < 4; i++) d += B.crowdPerson(x + i * 160, y, 0.78, null, 900 + i * 29, { phone: false });
    return d;
  };

  // Қорап сіріңке
  const matchbox = (x, y, s) => g(x, y, s,
    RR(-90, -50, 180, 100, "#f6d55c", 6, 8) +
    RF(-70, -30, 140, 60, "#c0392b", 4) +
    TB(0, 14, "СІРІҢКЕ", 26, "#ffffff")
  );

  // ================= 0. ІЛМЕК (L01) =================
  MK.S0 = S("L01");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: 0, c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[0, { x: 0, y: -560, z: 1.15 }], [E("L01"), { x: 0, y: -560, z: 1.22 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[0, ex("scared", "shrug", { turn: 0 })], [Wt("L01", 4), ex("shock", "fingerUp")]], talk: ["L01"] })
    ],
    type: (t) => TY.pop(t, 0.3, "КАССА ТРИЛЛЕРІ", 540, 290, { size: 80, color: "#ff5252", wob: 5 }) +
                 TY.stamp(t, Wt("L01", 5), "ЖАЛҒЫЗ ҚАЛУ", 540, 420, { size: 76, color: "#f2c14e", rot: -4 })
  });

  // ================= 1. «ТЕК НАН МЕН СҮТ» ↔ 20 КГ АРБА (L02, L03) =================
  MK.S1 = S("L02");
  const CART_F = S("L03");
  add({
    bg: () => marketBg(), bgKey: "market",
    t0: S("L02"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L02"), { x: 0, y: -450, z: 1.05 }], [CART_F, { x: 0, y: -450, z: 1.1 }]],
    actors: [
      ACT.mom({ x: -180, y: 0, s: 0.72, keys: [[S("L02"), ex("happySmile", "fingerUp", { turn: 0.25 })]], talk: ["L02"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L02"), ex("calmSmile", "armsDown", { turn: -0.2 })], [CART_F, ex("strain", "reach", { turn: -0.25 })]], talk: ["L03"] })
    ],
    world: (t) => (t >= CART_F ? cart(0, 0, 1.0, true) : cart(0, 0, 0.8, false)),
    type: (t) => (t < CART_F ? TY.pop(t, S("L02") + 0.3, "ТЕК НАН МЕН СҮТ", 540, 260, { size: 76, color: "#7cc47a" })
      : TY.stamp(t, CART_F + 0.4, "20 КГ АРБА = 28 450 ₸", 540, 270, { size: 70, color: "#ff5252", rot: -4 }))
  });

  // ================= 2. «2 СЕКУНДТА КЕЛЕМ!» (L04, L05) =================
  MK.S2 = S("L04");
  const RUN_M = S("L05");
  add({
    bg: () => marketBg({ kassa: true }), bgKey: "kassa",
    t0: S("L04"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L04"), { x: 0, y: -450, z: 1.05 }], [RUN_M, { x: -80, y: -450, z: 1.15 }]],
    actors: [
      ACT.mom({ x: -160, y: 0, s: 0.72, keys: [[S("L04"), ex("calmSmile", "armsDown", { turn: 0.2 })], [RUN_M, ex("shock", "point", { turn: -0.5, walk: 1.5 })]], talk: ["L05"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L04"), ex("calmSmile", "armsDown", { turn: -0.2 })], [RUN_M + 1.5, ex("nervous", "shrug", { turn: -0.1 })]], talk: ["L04"] })
    ],
    type: (t) => TY.pop(t, RUN_M + 0.3, "2 СЕКУНДТА КЕЛЕМ!", 540, 260, { size: 80, color: "#f2c14e", wob: 5 })
  });

  // ================= 3. КЕЗЕК x3 ЖЫЛДАМДЫҚ (L06, L07) =================
  MK.S3 = S("L06");
  add({
    bg: () => marketBg({ kassa: true }), bgKey: "kassa",
    t0: S("L06"), c0: { x: 0, y: -450 }, fadeIn: 0.15,
    cam: [[S("L06"), { x: 0, y: -450, z: 1.1 }], [S("L07"), { x: 40, y: -450, z: 1.3 }, eio]],
    shake: (t) => (t > S("L07") ? 10 : 0),
    actors: [
      ACT.artur({ x: 60, y: 0, s: 0.72, keys: [[S("L06"), ex("scared", "shrug", { turn: 0 })], [S("L07"), ex("shock", "chest", { mouth: "gasp", squash: 1.06 })]], talk: ["L06", "L07"] })
    ],
    world: (t) => cart(-160, 0, 0.9, true) + sweat(60, -700, t, S("L06"), 4),
    type: (t) => TY.pop(t, S("L06") + 0.4, "КЕЗЕК 3x ЖЫЛДАМДЫҚ!", 540, 250, { size: 70, color: "#ff5252" }) +
                 TY.stamp(t, S("L07") + 0.5, "КАРТА АНАМДА!", 540, 380, { size: 84, color: "#ff5252", rot: -5 })
  });

  // ================= 4. КАССИР: «ПИП-ПИП! 28 450 ₸!» (L08, L09) =================
  MK.S4 = S("L08");
  add({
    bg: () => marketBg({ kassa: true }), bgKey: "kassa",
    t0: S("L08"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L08"), { x: -120, y: -450, z: 1.15 }], [S("L09"), { x: 140, y: -450, z: 1.25 }]],
    actors: [
      ACT.saule({ x: -200, y: 0, s: 0.72, keys: [[S("L08"), ex("deadpan", "point", { turn: 0.25 })]], talk: ["L08"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L08"), ex("scared", "armsDown", { turn: -0.2 })], [S("L09"), ex("nervous", "shrug", { turn: -0.25 })]], talk: ["L09"] })
    ],
    world: (t) => sweat(160, -680, t, S("L08"), 4),
    type: (t) => TY.pop(t, S("L08") + 0.1, "ПИП... ПИП...", 540, 250, { size: 90, color: "#38bdf8", wob: 4 }) +
                 TY.stamp(t, S("L08") + 1.8, "28 450 ₸", 540, 380, { size: 92, color: "#ff5252" })
  });

  // ================= 5. АЛЫСТА АЛМА + АРТЫНДАҒЫ АШУЛЫ КЕЗЕК (L10, L11) =================
  MK.S5 = S("L10");
  add({
    bg: () => marketBg({ kassa: true }), bgKey: "kassa",
    t0: S("L10"), c0: { x: 0, y: -450 }, fadeIn: 0.2,
    cam: [[S("L10"), { x: -80, y: -450, z: 1.1 }], [S("L11"), { x: 100, y: -450, z: 1.25 }]],
    shake: (t) => (t >= S("L11") ? 10 : 0),
    actors: [
      ACT.mom({ x: -260, y: 0, s: 0.52, keys: [[S("L10"), ex("happySmile", "reach", { turn: -0.1 })]] }),
      ACT.artur({ x: 20, y: 0, s: 0.70, keys: [[S("L10"), ex("shock", "point", { turn: -0.35 })], [S("L11"), ex("scared", { turn: 0.3 })]], talk: ["L10"] }),
      ACT.dad({ x: 260, y: 0, s: 0.72, keys: [[0, { hide: true }], [S("L11"), ex("angry", "point", { hide: false, turn: -0.3, mouth: "shout" })]], talk: ["L11"] })
    ],
    type: (t) => TY.pop(t, S("L11") + 0.2, "ТЕЗДЕТПЕЙСІҢ БЕ?!", 540, 260, { size: 80, color: "#ff5252", wob: 6 })
  });

  // ================= 6. КӨРШІ КАССА + 10 ЖҰП КӨЗ (L12, L13) =================
  MK.S6 = S("L12");
  add({
    bg: () => marketBg({ kassa: true }), bgKey: "kassa",
    t0: S("L12"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L12"), { x: 0, y: -450, z: 1.05 }], [S("L13"), { x: 0, y: -470, z: 1.25 }]],
    actors: [
      ACT.artur({ x: -80, y: 0, s: 0.70, keys: [[S("L12"), ex("tired", "shrug", { turn: 0.1 })], [S("L13"), ex("scared", "chest", { turn: 0 })]], talk: ["L12", "L13"] })
    ],
    world: (t) => queueStare(140, 0) + sweat(-80, -680, t, S("L12"), 5),
    fx: (t) => (t >= S("L13") ? { sat: 0.4, vig: 0.35 } : {}),
    type: (t) => TY.stamp(t, S("L13") + 0.3, "10 ЖҰП КӨЗ", 540, 270, { size: 86, color: "#ff5252" })
  });

  // ================= 7. АНАМ 1 ҚОРАП СІРІҢКЕМЕН КЕЛДІ (L14, L15) =================
  MK.S7 = S("L14");
  add({
    bg: () => marketBg({ kassa: true }), bgKey: "kassa",
    t0: S("L14"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L14"), { x: 0, y: -450, z: 1.05 }], [S("L15"), { x: -80, y: -450, z: 1.2 }]],
    actors: [
      ACT.mom({ x: -160, y: 0, s: 0.72, keys: [[S("L14"), ex("calmSmile", "armsDown", { turn: 0.2 })], [S("L15"), ex("happySmile", "reach", { turn: 0.25 })]], talk: ["L15"] }),
      ACT.artur({ x: 160, y: 0, s: 0.70, keys: [[S("L14"), ex("deadpan", "shrug", { turn: -0.2 })]], talk: ["L14"] })
    ],
    world: (t) => (t >= S("L15") ? matchbox(0, -400, 1.0) : ""),
    type: (t) => TY.pop(t, S("L15") + 0.4, "20 МИНУТ = 1 СІРІҢКЕ", 540, 260, { size: 74, color: "#f2c14e" })
  });

  // ================= 8. СЫРТҚА БОСАП ШЫҒУ (L16) =================
  MK.S8 = S("L16");
  add({
    bg: () => BG.courtyard(), bgKey: "courtyard",
    t0: S("L16"), c0: { x: 0, y: -450 }, fadeIn: 0.25,
    cam: [[S("L16"), { x: 0, y: -450, z: 1.05 }], [E("L16"), { x: 0, y: -450, z: 1.15 }]],
    actors: [
      ACT.artur({ x: 0, y: 0, s: 0.72, keys: [[S("L16"), ex("happySmile", "cheer", { turn: 0 })]], talk: ["L16"] })
    ],
    world: (t) => confetti(t, S("L16") + 0.2, 45, -540, -1000, 1080, 1400),
    type: (t) => TY.pop(t, S("L16") + 0.3, "БОСТАНДЫҚ!", 540, 270, { size: 96, color: "#7cc47a" })
  });

  // ================= 9. ТҮЙІН + КЕҢЕС (L17) =================
  MK.S9 = S("L17");
  add({
    bg: () => BG.host(), bgKey: "host",
    t0: S("L17"), c0: { x: 0, y: -560 }, fadeIn: 0.3,
    cam: [[S("L17"), { x: 0, y: -560, z: 1.15 }], [E("L17") + 1, { x: 0, y: -560, z: 1.2 }]],
    actors: [
      ACT.artur({ x: 0, y: 320, s: 1.15, keys: [[S("L17"), ex("calmSmile", "fingerUp", { turn: 0 })]], talk: ["L17"] })
    ],
    type: (t) => TY.stamp(t, S("L17") + 0.4, "2 СЕКУНД = 20 МИНУТ!", 540, 320, { size: 74, color: "#f2c14e" })
  });

  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = MK;
  G.SONGY_TOTAL = 99;

  G.SONGY_AUDIO = function (a) {
    const { mus, fx, S, E } = a;
    mus("morning", 0, S("L03"), -14, { fi: 0.5, fo: 0.5 });
    fx("whoosh", 0.3, -12);

    mus("montage3", S("L03"), S("L06"), -13, { fi: 0.4, fo: 0.4 });
    fx("pops", S("L03") + 0.3, -10);

    mus("tension", S("L06"), S("L14"), -12, { fi: 0.4, fo: 0.4 });
    fx("whoosh", S("L05") + 1.5, -10);
    fx("button", S("L08") + 0.05, -6); // сканер пип!
    fx("button", S("L08") + 0.6, -6);
    fx("dundun", S("L13") + 0.2, -6);

    mus("warm", S("L14"), S("L17"), -13, { fi: 0.5, fo: 0.6 });
    fx("coins", S("L16") + 0.1, -10);
    fx("cheer", S("L16") + 0.4, -12);

    mus("outro", S("L17"), a.TOTAL, -12, { fi: 0.6, fo: 2.0 });
    fx("ping", S("L17") + 0.3, -10);
  };
})(typeof window !== "undefined" ? window : globalThis);
