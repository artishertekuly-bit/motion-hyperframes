/* «Әжемнің ауылы» — кадрлар, 1-бөлім: келу → дастарқан → тақырып → жүргізуші → каталог → тапсырма (0 … ~169 с).
 * Қозғалтқыш: assets/songy/engine.js (SONGY_* аттарымен). */
(function (G) {
  "use strict";
  const Q = G.SONGY, B = G.SONGY_BG, A = G.AUYL_BG, RIG = G.ArturRig;
  const { S, E, LN, TY, lerp, clamp, sm, eio, eout, back, spring, win, noise, hash } = Q;
  const { BG, P, F, Ln, RF, C, T: TX, INK, f } = B;
  const RR = B.R;
  const { cow, cowFace, rooster, goose, sheep, haystack, bucket, plate, platter, FOOD, PROPS: AP } = A;

  function Wt(id, n) {
    const l = LN[id];
    const toks = l.text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
    const letters = l.chars.filter(([c]) => /[\p{L}\p{N}]/u.test(c));
    let idx = 0;
    for (let i = 0; i < n && i < toks.length; i++) idx += (toks[i].match(/[\p{L}\p{N}]/gu) || []).length;
    return letters[Math.min(idx, letters.length - 1)][1];
  }
  const POSES = {
    phoneUp: { armL: { sh: 64, el: 108, hand: "fist", propFront: B.PROPS.phone() } },
    phoneSky: { armR: { sh: 172, el: 4, hand: "fist", propFront: B.PROPS.phone("#bfe3fb") } },
    facepalm: { armR: { sh: 24, el: -150, hand: "open" } },
    shh: { armR: { sh: 34, el: -148, hand: "point" } },
    chest: { armR: { sh: 40, el: -120, hand: "open" } },
    armsDown: { armL: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" }, armR: { sh: 11, el: -7, hand: "rest", prop: "", propFront: "" } },
    hug: { armL: { sh: 78, el: -50, hand: "open" }, armR: { sh: 78, el: -50, hand: "open" } },
    hipsL: { armL: { sh: 50, el: -94, hand: "fist" } },
    sitFloor: { legL: { a: 38, k: 30 }, legR: { a: 38, k: 30 } },
    stand: { legL: { a: 3, k: 0 }, legR: { a: 3, k: 0 } },
    oneLeg: { legL: { a: 42, k: 70 }, legR: { a: 2, k: 0 } },
    determined: { eye: { lidTop: 0.38, lidBot: 0.1, lidTilt: 0.6, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -4, angle: 16, liftL: 0, liftR: 0 }, mouth: "smirk" },
    deadpan: { eye: { lidTop: 0.55, lidBot: 0.08, lidTilt: 0, px: 0, py: 0, pupil: 0.9, happy: 0, scale: 1 }, brow: { lift: -2, angle: 0, liftL: 0, liftR: 0 }, mouth: "hmm", fx: { sweat: 0, blush: 0, vein: 0 } },
    tired: { eye: { lidTop: 0.62, lidBot: 0.12, lidTilt: -0.3, px: 0, py: 0.2, pupil: 1, happy: 0, scale: 1 }, brow: { lift: 4, angle: -10, liftL: 0, liftR: 0 }, mouth: "wavy", fx: { sweat: 0.6, blush: 0, vein: 0 } },
    strain: { eye: { lidTop: 0.98, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -6, angle: 20, liftL: 0, liftR: 0 }, mouth: "growl", fx: { sweat: 1, blush: 1, vein: 1 } },
    sleepClosed: { eye: { lidTop: 0.98, lidBot: 0, lidTilt: 0, px: 0, py: 0, pupil: 1, happy: 0, scale: 1 }, brow: { lift: -4, angle: -2, liftL: 0, liftR: 0 }, mouth: "rest" },
    warm: { eye: { scale: 1, lidTop: 0.5, lidBot: 0.36, lidTilt: 0, px: 0, py: 0.1, pupil: 1, happy: 0 }, brow: { lift: 6, angle: -8, liftL: 0, liftR: 0 }, mouth: "smile" },
    lookUp: { eye: { py: -0.7 } },
    lookL: { eye: { px: -0.7 } },
    lookR: { eye: { px: 0.7 } },
    lookC: { eye: { px: 0, py: 0.05 } },
  };
  G.SONGY_POSES = POSES;
  const puff = (x, y, t, t0, dur, n, col) => { const k = win(t, t0, t0 + (dur || 1)); if (k <= 0 || k >= 1) return ""; let s = ""; for (let i = 0; i < (n || 8); i++) { const a = hash(i + t0) * 6.283, d = 40 + hash(i * 3 + t0) * 120; s += `<circle cx="${f(x + Math.cos(a) * d * eout(k))}" cy="${f(y + Math.sin(a) * d * eout(k) - 30 * k)}" r="${f(26 + 40 * k)}" fill="${col || "#ffffff"}" opacity="${f(0.7 * (1 - k))}"/>`; } return s; };
  const speed = (x, y, r, t, t0, n) => { const k = win(t, t0, t0 + 0.35); if (k <= 0 || k >= 1) return ""; let s = ""; for (let i = 0; i < (n || 6); i++) { const a = -Math.PI * (0.15 + 0.7 * i / ((n || 6) - 1)); const r0 = r * (1 + 0.3 * k), r1 = r * (1.25 + 0.6 * k); s += Ln(`M${f(x + Math.cos(a) * r0)},${f(y + Math.sin(a) * r0)} L${f(x + Math.cos(a) * r1)},${f(y + Math.sin(a) * r1)}`, 7, INK, ` opacity="${f(1 - k)}"`); } return s; };
  const shout = (x, y, r, t, t0, t1, n) => { if (t < t0 || t > t1) return ""; let s = ""; for (let i = 0; i < (n || 3); i++) { const k = ((t - t0) * 2.2 + i / (n || 3)) % 1; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * (0.4 + k))}" fill="none" stroke="${INK}" stroke-width="${f(8 * (1 - k))}" opacity="${f(1 - k)}"/>`; } return s; };
  const notes = (x, y, t, t0, t1) => { if (t < t0 || t > t1) return ""; let s = ""; for (let i = 0; i < 3; i++) { const k = ((t - t0) * 0.7 + i / 3) % 1; s += `<g transform="translate(${f(x + k * 140 + Math.sin(k * 9) * 20)},${f(y - k * 220)})" opacity="${f(Math.sin(k * Math.PI))}">${Ln("M0,0 L0,-50 L26,-60", 6)}${C(-10, 0, 13, INK, 0)}</g>`; } return s; };
  const phoneUI = (x, y, sc, inner) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(sc)})">${RR(-210, -400, 420, 800, "#1f2027", 9, 46)}${RF(-185, -370, 370, 740, "#f4f6fb", 26)}${inner || ""}${RR(-60, -392, 120, 20, "#1f2027", 0, 10)}</g>`;
  const bars = (x, y, n, sc) => { let s = ""; for (let i = 0; i < 4; i++) s += RR(x + i * 22 * sc, y - (i + 1) * 16 * sc, 14 * sc, (i + 1) * 16 * sc, i < n ? "#2b2c33" : "#c9ccd6", 3, 2); return s; };
  const wifi = (x, y, sc, col) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(sc)})">${Ln("M-120,-40 Q0,-150 120,-40", 26, INK)}${Ln("M-120,-40 Q0,-150 120,-40", 14, col)}${Ln("M-76,0 Q0,-70 76,0", 26, INK)}${Ln("M-76,0 Q0,-70 76,0", 14, col)}${C(0, 50, 22, col, 7)}</g>`;
  const card = (x, y, w, h, rot, inner) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})">${RR(-w / 2 - 22, -h / 2 - 22, w + 44, h + 90, "#ffffff", 7, 6)}<svg x="${f(-w / 2)}" y="${f(-h / 2)}" width="${w}" height="${h}" viewBox="${f(-w / 2)} ${f(-h / 2)} ${w} ${h}" overflow="hidden">${inner}</svg>${RR(-w / 2, -h / 2, w, h, "none", 5)}</g>`;

  const SH = [];
  const add = (o) => SH.push(o);
  const MK = {};
  const artur = (o) => Object.assign({ look: "artur", outfit: "tee", s: 0.75, seed: 5 }, o);
  const aje = (o) => Object.assign({ look: "aje", outfit: "aje", s: 0.75, seed: 31 }, o);
  const ata = (o) => Object.assign({ look: "ata", outfit: "ata", s: 0.75, seed: 41 }, o);
  const boy = (o) => Object.assign({ look: "boy", outfit: "boy", s: 0.75, seed: 51 }, o);
  // рюкзак (кейіпкердің артында)
  const backpack = (x, y, s) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">${RR(-120, -640, 150, 230, "#d96c3a", 7, 30)}${RR(-110, -520, 120, 80, "#c45a2e", 5, 14)}</g>`;

  // ========== 0. СУЫҚ АШЫЛУ: ауылға келу ==========
  const BUSGO = 0.7, GATE = 1.5, RUN0 = 1.7, HUG = S("L01") - 0.12;
  const busAt = (t) => -1450 - 2600 * Math.pow(win(t, BUSGO, BUSGO + 3.6), 1.7);
  const bus = (x) => `<g transform="translate(${f(x)},40)">${RR(-560, -560, 1120, 470, "#e8c84a", 8, 40)}${RF(-540, -260, 1080, 60, "#d4512e")}${[0, 1, 2, 3].map((i) => RR(-500 + i * 250, -500, 200, 180, "#a9d3f0", 6, 10)).join("")}${C(-330, -90, 80, "#2d2f36", 8)}${C(330, -90, 80, "#2d2f36", 8)}${C(-330, -90, 30, "#8b8f99", 5)}${C(330, -90, 30, "#8b8f99", 5)}${TX(0, -290, "АУЫЛ — ҚАЛА", 46, "#ffffff")}</g>`;
  MK.MEET = HUG;
  add({
    t0: 0, bg: "aulRoad", c0: { x: 0, y: -560 }, fadeIn: 0.9,
    cam: [[0, { x: -300, y: -720, z: 0.6 }], [2.4, { x: -120, y: -660, z: 0.68 }], [HUG, { x: -150, y: -620, z: 0.86 }]],
    worldBack: (t) => bus(busAt(t)) + puff(busAt(t) + 600, -80, t, BUSGO, 2.5, 12, "#e6d6b0") + puff(busAt(t) + 500, -60, t, BUSGO + 1.1, 2.2, 10, "#e6d6b0") + A.gateAt(1180, -380, eout(win(t, GATE, GATE + 0.4))),
    actors: [
      artur({ x: -560, y: 40, before: (t, st) => backpack(st.x != null ? st.x : -560, 40, 0.75), keys: [[0, { turn: 0.25, ...RIG.EXPR.calm, ...POSES.lookR }], [GATE + 0.2, { ...RIG.EXPR.shock, mouth: "oh", turn: 0.45 }, 0.15], [RUN0 + 1.2, { ...RIG.EXPR.scared, armL: { sh: 40, el: 60, hand: "open" }, armR: { sh: 40, el: 60, hand: "open" } }, 0.3]] }),
      aje({ keys: [[0, { hide: true }], [GATE + 0.1, { hide: false, x: 1340, y: -380, s: 0.5, turn: -0.6, ...RIG.EXPR.happy, walk: 2.4, walkAmp: 30, armL: { sh: 140, el: 20, hand: "open" }, armR: { sh: 140, el: 20, hand: "open" } }],
        [RUN0, { x: 900, y: -150, s: 0.62 }, 1.0, (k) => k], [RUN0 + 1.0, { x: -260, y: 40, s: 0.75 }, HUG - RUN0 - 1.0, (k) => k]], talk: ["L01"] }),
    ],
    world: (t) => speed(-560, -650, 140, t, GATE + 0.2, 6),
  });
  // құшақ
  const PULL = Wt("L03", 4);
  add({
    t0: HUG, bg: "aulRoad", c0: { x: -400, y: -560 },
    cam: [[HUG, { x: -400, y: -560, z: 1.35, r: 1 }], [S("L02") - 0.3, { x: -440, y: -580, z: 1.5 }], [S("L03"), { x: -380, y: -570, z: 1.45, r: -1 }], [PULL + 0.4, { x: -300, y: -560, z: 1.5 }], [PULL + 0.9, { x: 500, y: -560, z: 1.6 }, (k) => k * k]],
    shake: (t) => (t < HUG + 0.6 ? 10 * (1 - win(t, HUG, HUG + 0.6)) : 0),
    actors: [
      artur({ x: -560, y: 40, before: (t, st) => backpack(st.x != null ? st.x : -560, 40, 0.75),
        mod: (t, p) => { if (t < S("L02") - 0.2) p.squash = 0.94 + 0.04 * Math.sin((t - HUG) * 14); return p; },
        keys: [[HUG, { turn: 0.35, ...RIG.EXPR.shock, mouth: "oh", armL: { sh: 70, el: 40, hand: "open" }, armR: { sh: 70, el: 40, hand: "open" } }], [S("L02") - 0.2, { ...POSES.deadpan, armL: { sh: 20, el: -10, hand: "rest" }, armR: { sh: 20, el: -10, hand: "rest" } }, 0.3], [S("L03"), { ...RIG.EXPR.calm, ...POSES.lookR }, 0.3], [PULL, { ...RIG.EXPR.shock, mouth: "oh", turn: 0.7, lean: 14, armR: { sh: 92, el: 0, hand: "open" } }, 0.12], [PULL + 0.3, { x: 400, walk: 2.6 }, 0.8, (k) => k * k]], talk: ["L02"] }),
      aje({ x: -270, y: 40,
        mod: (t, p) => { if (t < S("L02") - 0.2) p.lean = -6 + Math.sin((t - HUG) * 14) * 3; return p; },
        keys: [[HUG, { turn: -0.45, ...RIG.EXPR.laugh, ...POSES.hug }], [Wt("L01", 4), { ...RIG.EXPR.sad, mouth: "aa", armL: { sh: 120, el: 40, hand: "open" }, armR: { sh: 130, el: 30, hand: "open" } }, 0.2], [S("L02") + 0.2, { ...POSES.warm, ...POSES.armsDown }, 0.3],
          [S("L03"), { ...POSES.determined, ...RIG.POSES.hips }, 0.25], [PULL - 0.1, { turn: 0.6, ...RIG.EXPR.happy, armL: { sh: 70, el: -10, hand: "fist" }, armR: { sh: 11, el: -7, hand: "rest" }, walk: 2.6 }, 0.15], [PULL, { x: 900 }, 1.2, (k) => k * k]], talk: ["L01", "L03"] }),
    ],
    world: (t) => (t > Wt("L01", 4) && t < S("L02") ? TX(-150, -1000, "АРЫҚ?!", 64, "#e85d75", ` stroke="${INK}" stroke-width="10" paint-order="stroke" transform="rotate(-8 -150 -1000)"`) : ""),
  });

  // дастарқан
  const DAS = PULL + 0.95;
  const P1 = Wt("L04", 0), P2 = Wt("L04", 2), P3 = Wt("L04", 4) + 0.3, TL0 = E("L06") + 0.15, TL1 = S("L07") - 0.2, POP = TL1 - 0.25;
  const pileAt = (t) => (t < P1 ? 0.6 : t < P2 ? 1.6 : t < P3 ? 2.6 : t < TL0 ? 3.6 : Math.max(0, 3.6 - 3.6 * win(t, TL0, TL1)));
  const tableFront = () => BG.table(0, 270, 1.1);
  const sitArtur = (keys, talk) => artur({ x: -170, y: 230, keys: [[0, { turn: 0.15, ...POSES.sitFloor }]].concat(keys), talk });
  const plateW = (t) => plate(-160, 120, 1, pileAt(t));
  const ataKorpe = () => `<g transform="translate(1650,170)">${RR(-260, -120, 520, 150, "#7a2f45", 7, 40)}${Ln("M-220,-50 L220,-50", 5, "#f2c14e")}</g>`;
  const roomAta = ata({ x: 1650, y: 230, keys: [[0, { turn: -0.35, ...POSES.sitFloor, ...RIG.EXPR.sleepy, armL: { sh: 30, el: -40, hand: "rest" }, armR: { sh: 30, el: -40, hand: "rest" } }]], talk: ["L09"] });
  MK.DAS = DAS; MK.P1 = P1; MK.P2 = P2; MK.P3 = P3; MK.TL0 = TL0; MK.POP = POP;
  add({
    t0: DAS, bg: "room", c0: { x: 0, y: -500 }, flashIn: 0.15,
    cam: [[DAS, { x: 400, y: -420, z: 0.8, r: 2 }], [S("L04") - 0.2, { x: 120, y: -360, z: 0.95 }], [P3 + 0.3, { x: -120, y: -260, z: 1.45 }], [S("L05") - 0.2, { x: -160, y: -380, z: 2.0 }], [S("L06") - 0.1, { x: -160, y: -380, z: 2.05 }], [S("L06") + 0.4, { x: 300, y: -380, z: 1.3 }], [TL0, { x: 200, y: -330, z: 1.15 }], [TL1, { x: 120, y: -330, z: 1.1 }]],
    shake: (t) => { let s = 0; for (const p of [P1, P2, P3]) if (t > p && t < p + 0.3) s += 9 * (1 - (t - p) / 0.3); if (t > TL0 && t < TL1) s += 4; return s; },
    worldBack: () => BG.korpe(-170, 60, 520) + BG.korpe(700, 60, 420, "#7a2f45"),
    actors: [
      roomAta,
      sitArtur([[DAS, { ...RIG.EXPR.happy }], [P1, { ...RIG.EXPR.shock, mouth: "oh" }, 0.08], [P1 + 0.4, { ...RIG.EXPR.calm }, 0.3], [P2, { ...RIG.EXPR.shock, mouth: "oh" }, 0.08], [P3, { ...RIG.EXPR.scared }, 0.1], [S("L05") - 0.1, { ...POSES.tired }, 0.3], [S("L06"), { ...POSES.tired, ...POSES.lookR }, 0.3],
        [TL0, { ...POSES.determined, armR: { sh: 70, el: -120, hand: "fist" } }, 0.2]],
        ["L05"]),
      aje({ x: 620, y: 40,
        mod: (t, p) => { if (t > TL0 && t < TL1) { p.armR = { sh: 70 + Math.sin(t * 22) * 30, el: -40, hand: "open" }; } return p; },
        keys: [[DAS, { turn: -0.35, ...RIG.EXPR.happy }], [P1 - 0.15, { armR: { sh: 70, el: -30, hand: "open" } }, 0.12], [P1 + 0.2, { armR: { sh: 40, el: -10, hand: "open" } }, 0.2], [P2 - 0.15, { armR: { sh: 74, el: -30, hand: "open" } }, 0.12], [P2 + 0.2, { armR: { sh: 40, el: -10 } }, 0.2], [P3 - 0.15, { armR: { sh: 76, el: -30, hand: "open" } }, 0.12], [P3 + 0.2, { armR: { sh: 40, el: -10 } }, 0.2],
          [S("L06") - 0.1, { ...RIG.EXPR.angry, mouth: "rest", fx: { vein: 0 }, ...RIG.POSES.hips }, 0.2], [Wt("L06", 3), { ...POSES.warm, armR: { sh: 70, el: -40, hand: "fist", prop: AP.teapot() }, armL: { sh: 11, el: -7, hand: "rest" } }, 0.25], [TL0, { ...RIG.EXPR.laugh, armR: { sh: 40, el: -10, hand: "rest", prop: "" } }, 0.2]],
        talk: ["L04", "L06"] }),
    ],
    world: (t) => {
      let s = plateW(t);
      if (t > Wt("L06", 4)) s += FOOD.kese(10, 100, 1.1, true);
      if (t > Wt("L06", 3) + 0.3 && t < TL0) { const k = (t * 3) % 1; s += Ln(`M250,-330 Q120,-160 10,48`, 8, "#c98a4a", ` opacity="0.85"`) + C(10 + k * 4, 48, 6, "#c98a4a", 0); }
      for (const p of [P1, P2, P3]) s += puff(-160, 20, t, p, 0.5, 6, "#fff3d6");
      return tableFront() + s + FOOD.jam(420, 80, 0.9) + FOOD.teapot(-560, 100, 0.9) + FOOD.salad(260, 90, 1.2) + FOOD.baursak(-440, 120, 1, 13) + ataKorpe();
    },
    over: (t) => {
      if (t < TL0 || t > TL1 + 0.1) return "";
      const k = win(t, TL0, TL1);
      return `<g transform="translate(240,250) scale(${f(eout(win(t, TL0, TL0 + 0.3)))})">${C(0, 0, 150, "#ffffff", 9)}${BG.clockHands(0, 0, k * 6.283 * 3, k * 6.283 * 36)}</g>` + TY.pop(t, TL0 + 0.1, "1 САҒАТ КЕЙІН...", 960, 140, { size: 70, color: "#ffffff", t1: TL1 - 0.2 });
    },
    type: (t) => TY.pop(t, P1, "ТҮП!", 1210, 360, { size: 90, color: "#f6d55c", rot: 12, t1: P1 + 0.6 }) + TY.pop(t, P2, "ТҮП!", 1260, 300, { size: 100, color: "#f6d55c", rot: -10, t1: P2 + 0.6 }) + TY.pop(t, P3, "ТҮП-ТҮП!", 1260, 250, { size: 110, color: "#ff8a5b", rot: 8, t1: P3 + 0.7 }),
    fx: (t) => ({ vig: 0.25, dof: 2.5 }),
  });
  // жеңіс → ет
  const MEAT = S("L08") - 0.6, LAND = E("L08") + 0.1, ATA1 = S("L09") - 0.45, TITLE = E("L09") + 0.55;
  MK.LAND = LAND; MK.TITLE = TITLE;
  add({
    t0: TL1, bg: "room", c0: { x: 0, y: -500 },
    cam: [[TL1, { x: -160, y: -400, z: 1.8 }], [MEAT, { x: -150, y: -410, z: 1.95 }], [MEAT + 0.6, { x: 160, y: -440, z: 1.1 }, eout], [LAND, { x: 100, y: -400, z: 1.15 }], [LAND + 0.25, { x: -150, y: -400, z: 1.8 }, eout], [ATA1, { x: -150, y: -400, z: 1.9 }]],
    shake: (t) => (t > LAND && t < LAND + 0.6 ? 34 * (1 - win(t, LAND, LAND + 0.6)) : 0),
    worldBack: () => BG.korpe(-170, 60, 520) + BG.korpe(700, 60, 420, "#7a2f45"),
    actors: [
      roomAta,
      sitArtur([[TL1, { ...RIG.EXPR.happy, mouth: "smile", lean: -12, squash: 0.9, ...RIG.POSES.cheer, legL: { a: 82, k: 4 }, legR: { a: 78, k: 4 } }], [S("L07") + 0.6, { armL: { sh: 30, el: -60, hand: "open" }, armR: { sh: 30, el: -60, hand: "open" } }, 0.3], [MEAT + 0.3, { ...RIG.EXPR.calm, ...POSES.lookR, lean: -4 }, 0.3], [LAND, { ...RIG.EXPR.shock, mouth: "shock", lean: 6, shakeEyes: true }, 0.06], [LAND + 1.0, { ...RIG.EXPR.scared, shakeEyes: false }, 0.3]], ["L07"]),
      aje({ keys: [[TL1, { hide: true }], [MEAT, { hide: false, x: 1300, y: 40, turn: -0.5, ...RIG.EXPR.laugh, walk: 2.2, armL: { sh: 160, el: 10, hand: "open" }, armR: { sh: 160, el: 10, hand: "open" } }], [MEAT + 0.01, { x: 300 }, LAND - MEAT - 0.4, eout], [LAND - 0.4, { walk: 0, ...POSES.stand, armL: { sh: 90, el: -10, hand: "open" }, armR: { sh: 90, el: -10, hand: "open" } }, 0.3], [LAND + 0.3, { ...RIG.EXPR.happy, ...RIG.POSES.hips }, 0.3]], talk: ["L08"] }),
    ],
    world: (t) => {
      let s = plate(-160, 120, 1, 0) + (t > POP && t < POP + 0.9 ? `<g transform="translate(${f(-120 + (t - POP) * 900)},${f(-300 - (t - POP) * 500 + (t - POP) * (t - POP) * 1400)})">${C(0, 0, 14, "#ffffff", 4)}</g>` : "");
      // табақ: әженің қолында → үстелге
      const k = win(t, LAND - 0.45, LAND);
      if (t > MEAT) {
        const ax = t < LAND - 0.4 ? lerp(1300, 300, eout(win(t, MEAT, LAND - 0.4))) : lerp(300, 120, k);
        const ay = t < LAND - 0.4 ? -880 : lerp(-880, 90, k * k);
        s += platter(ax, ay, t < LAND ? 0.95 : 0.95 * (1 + 0.06 * Math.sin((t - LAND) * 30) * Math.exp(-(t - LAND) * 6)));
      }
      s += puff(120, 60, t, LAND, 0.6, 10, "#fff3d6");
      return tableFront() + s + ataKorpe();
    },
    type: (t) => TY.pop(t, LAND, "ГҮРС!", 1300, 300, { size: 140, color: "#ff8a5b", rot: -12, t1: LAND + 0.8 }) + TY.pop(t, Wt("L07", 1), "ЖЕҢІС!", 520, 220, { size: 110, color: "#f6d55c", rot: -8, t1: MEAT }),
    fx: (t) => ({ vig: 0.25, dof: 2.5 }),
  });
  // ата: «Мм.»
  add({
    t0: ATA1, bg: "room", c0: { x: 0, y: -500 },
    cam: [[ATA1, { x: 1630, y: -330, z: 2.0 }], [TITLE, { x: 1640, y: -340, z: 2.2 }]],
    world: () => ataKorpe(),
    actors: [Object.assign({}, roomAta, { keys: [[0, { turn: -0.15, ...POSES.sitFloor, ...RIG.EXPR.sleepy, armL: { sh: 30, el: -40, hand: "rest" }, armR: { sh: 30, el: -40, hand: "rest" } }], [S("L09"), { headY: 10 }, 0.15], [E("L09"), { headY: 0 }, 0.3]] })],
    fx: () => ({ dof: 5, vig: 0.3 }),
  });

  // ========== 1. ТАҚЫРЫП ==========
  const ROO_T = TITLE + 1.25, HOST = S("L10") - 0.4;
  MK.ROO_T = ROO_T;
  add({
    t0: TITLE, bg: "host", bgArgs: [["#9bd17a", "#4f9a4a"]], bgKey: "hostGreen", noCaps: true,
    cam: [[TITLE, { x: 0, y: -380, z: 1 }], [HOST, { x: 0, y: -400, z: 1.08 }]],
    flashIn: 0.25,
    over: (t) => {
      let s = "";
      // шөп маясы сияқты үйінді + әтеш
      s += `<g transform="translate(960,${f(1180 - 240 * eout(win(t, TITLE, TITLE + 0.5)))}) scale(0.9)">${haystack(0, 0, 1.4)}</g>`;
      const kr = win(t, ROO_T - 0.5, ROO_T);
      const rx = lerp(1700, 1240, eout(kr)), ry = lerp(-100, 300, kr) - Math.sin(kr * Math.PI) * 200;
      if (t > ROO_T - 0.5) s += rooster(rx, ry, 1.1, { crow: t > ROO_T + 0.1 && t < ROO_T + 1.6 ? 1 : 0, flip: true }, t);
      s += shout(1160, 120, 120, t, ROO_T + 0.1, ROO_T + 1.4, 3);
      for (let i = 0; i < 10; i++) { const a = hash(i) * 6.28, r = 300 + hash(i + 9) * 600, k = (t * 0.6 + hash(i + 3)) % 1; s += `<g transform="translate(${f(960 + Math.cos(a) * r)},${f(540 + Math.sin(a) * r * 0.5)}) scale(${f(Math.sin(k * Math.PI))})">${P("M0,-18 L5,-5 L18,0 L5,5 L0,18 L-5,5 L-18,0 L-5,-5Z", "#f6d55c", 3)}</g>`; }
      return s;
    },
    type: (t) => TY.swing(t, TITLE + 0.05, "ӘЖЕМНІҢ АУЫЛЫ", 960, 380, { size: 140, color: "#f6d55c" }) + TY.pop(t, TITLE + 0.9, "(анимация, 2-бөлім)", 960, 520, { size: 44, color: "#ffffff", stroke: 9, weight: 700 }),
  });

  // ========== жүргізуші ==========
  const hostArtur = (keys, talk) => artur({ x: 0, y: 330, s: 1.15, talk, keys });
  const WIFI = Wt("L13", 6);
  MK.WIFI = WIFI; MK.HOST = HOST;
  add({
    t0: HOST, bg: "host", bgArgs: [["#cfe9b0", "#8cc46a"]], bgKey: "hostG2", c0: { x: 0, y: -560 },
    cam: [[HOST, { x: 0, y: -560, z: 1 }], [S("L11"), { x: -40, y: -590, z: 1.06 }], [S("L12"), { x: 60, y: -600, z: 1.1 }], [S("L13") - 0.3, { x: 120, y: -620, z: 1.05 }], [Wt("L13", 5), { x: 60, y: -660, z: 1.4 }], [WIFI + 0.4, { x: 20, y: -700, z: 1.9 }, eout], [S("L14") - 1.0, { x: 30, y: -700, z: 2.0 }]],
    shake: (t) => (t > WIFI && t < WIFI + 0.4 ? 14 * (1 - win(t, WIFI, WIFI + 0.4)) : 0),
    actors: [hostArtur([
      [HOST, { turn: 0.15, ...RIG.EXPR.happy, ...RIG.POSES.wave }], [S("L10") + 1.4, { ...RIG.POSES.idle, armR: { sh: 11, el: -7, hand: "rest" }, headTilt: 0 }, 0.3],
      [Wt("L11", 5), { turn: -0.25, ...POSES.deadpan, ...RIG.POSES.shrug }, 0.25], [S("L12") - 0.1, { turn: 0.2, ...RIG.EXPR.happy, ...RIG.POSES.idle, armL: { sh: 11, el: -7 }, armR: { sh: 84, el: 2, hand: "point" } }, 0.25],
      [S("L13"), { turn: 0.05, ...RIG.EXPR.smug, ...POSES.armsDown }, 0.25], [Wt("L13", 5), { ...RIG.EXPR.laugh, armL: { sh: 30, el: -60, hand: "fist" }, armR: { sh: 30, el: -60, hand: "fist" } }, 0.15], [WIFI, { ...POSES.deadpan, ...POSES.armsDown, eye: { lidTop: 0.62 } }, 0.25],
    ], ["L10", "L11", "L12", "L13"])],
    over: (t) => {
      let s = "";
      // «ата-анам» — сөйлеу көпіршіктері
      const qts = [[Wt("L11", 6), "«Ауылға бар»", 420, 260, -6], [Wt("L11", 8), "«Әжеңе көмектес»", 470, 400, 4], [Wt("L11", 10), "«Телефоннан демал»", 450, 540, -3]];
      for (const [t0, txt, x, y, r] of qts) {
        if (t < t0 || t > S("L12") - 0.2) continue;
        const k = spring((t - t0) / 0.6, 14, 6);
        s += `<g transform="translate(${x},${y}) rotate(${r}) scale(${f(k)})">${RR(-300, -60, 600, 120, "#ffffff", 7, 60)}${P("M-180,56 L-220,110 L-130,58Z", "#ffffff", 6)}${TX(0, 18, txt, 50, INK)}</g>`;
      }
      // интернет
      if (t > S("L13") - 0.1 && t < S("L14") - 0.9) {
        const kin = spring((t - S("L13") + 0.1) / 0.7, 12, 6);
        const fall = t > WIFI ? (t - WIFI) : 0;
        const y = 300 + (fall > 0 ? Math.min(560, 2600 * fall * fall) : 0);
        s += `<g transform="translate(1440,${f(y)}) rotate(${f(fall * 120)}) scale(${f(kin)})">${wifi(0, 0, 1.4, "#3f7fc4")}</g>`;
        if (fall > 0.45) s += `<g transform="translate(1440,880)">${P("M-160,0 L-60,-40 L-20,10 L60,-50 L160,0", "none", 8)}${Ln("M-60,-40 L-90,-90 M60,-50 L80,-100 M-20,10 L-10,-60", 6)}</g>`;
        if (t > Wt("L13", 2)) s += `<g transform="translate(1440,${f(y + 180)})">${TX(0, 0, "ЖОҚ", 90, "#e85d75", ` stroke="${INK}" stroke-width="12" paint-order="stroke"`)}</g>`;
      }
      return s;
    },
    type: (t) => TY.stamp(t, Wt("L10", 3), "1-БӨЛІМ: «СОҢҒЫ ҚОҢЫРАУ»", 1380, 250, { size: 44, color: "#3f6fb5", rot: 5, t1: S("L11") - 0.3 }) +
      TY.pop(t, Wt("L11", 2), "3 АЙ", 1450, 230, { size: 150, color: "#f6d55c", rot: -10, t1: Wt("L11", 5) }) +
      TY.pop(t, Wt("L12", 6), "АУЫЛ", 1420, 230, { size: 120, color: "#9bd17a", rot: -6, t1: E("L12") + 0.3 }) +
      TY.pop(t, Wt("L12", 7), "ӘЖЕ", 1450, 400, { size: 120, color: "#ff8fa3", rot: 5, t1: E("L12") + 0.3 }) +
      TY.pop(t, Wt("L12", 9), "«ТАЗА АУА»", 1420, 570, { size: 104, color: "#7fd1ff", rot: -3, wob: 3, t1: E("L12") + 0.3 }),
  });

  // ========== 2а. ӘТЕШ ==========
  const ROO = S("L14") - 0.6, CROW1 = Wt("L14", 5) + 0.75, SNZ = Wt("L15", 1), CROW2 = Wt("L15", 3) + 0.45;
  MK.CROW1 = CROW1; MK.SNZ = SNZ; MK.CROW2 = CROW2;
  const bedArtur = (keys, talk) => artur({ x: -820, y: -488, rot: 90, keys: [[0, { turn: 0.1, ...POSES.sleepClosed }]].concat(keys || []), talk });
  const blanket = () => P("M-1330,-560 Q-900,-610 -330,-560 Q-260,-500 -300,-420 L-1340,-420Z", "#5f7fc4", 6) + Ln("M-1200,-520 Q-800,-560 -400,-520", 4, "#4c6aaa");
  const pillow = () => P("M-260,-540 Q-120,-580 40,-540 Q60,-490 30,-440 Q-120,-424 -250,-444 Q-280,-490 -260,-540Z", "#ffffff", 6);
  add({
    t0: ROO, bg: "bedroomV", c0: { x: 0, y: -560 }, flashIn: 0.2,
    cam: [[ROO, { x: -200, y: -700, z: 0.95 }], [CROW1 - 0.6, { x: 120, y: -720, z: 1.05 }], [CROW1, { x: 420, y: -780, z: 1.5 }, eout], [S("L15") - 0.15, { x: 400, y: -760, z: 1.6 }]],
    shake: (t) => (t > CROW1 && t < CROW1 + 1.4 ? 7 : 0),
    worldBack: () => pillow(),
    actors: [bedArtur([[CROW1 + 0.15, { eye: { lidTop: 0.7, lidBot: 0.1 }, brow: { lift: -8, angle: 14 }, mouth: "frown" }, 0.2]])],
    world: () => blanket(),
    farWorld: (t) => {
      // терезедегі әтеш (алыс қабатта — тереземен бірге қозғалады)
      const k = win(t, Wt("L14", 4), Wt("L14", 4) + 0.5);
      let s = "";
      if (k > 0) s += `<svg x="400" y="-1250" width="460" height="530" viewBox="400 -1250 460 530" overflow="hidden"><g>${rooster(600, -730 + 300 * (1 - eout(k)), 1.25, { crow: t > CROW1 && t < CROW1 + 1.5 ? 1 : 0 }, t)}</g></svg>`;
      s += shout(690, -1060, 140, t, CROW1, CROW1 + 1.4, 3);
      return s;
    },
    type: (t) => TY.stamp(t, S("L14") - 0.2, "05:00", 300, 180, { size: 80, color: "#e85d75", rot: -6, t1: S("L15") - 0.4 }),
    fx: () => ({ dim: 0.18, vig: 0.35 }),
  });
  add({
    t0: S("L15") - 0.15, bg: "bedroomV", c0: { x: 0, y: -560 },
    cam: [[S("L15") - 0.15, { x: -40, y: -560, z: 2.1 }], [CROW2, { x: -60, y: -560, z: 2.3 }], [CROW2 + 0.15, { x: -40, y: -570, z: 2.7 }, eout], [S("L16") - 0.1, { x: -40, y: -570, z: 2.8 }]],
    shake: (t) => (t > CROW2 && t < CROW2 + 1.3 ? 22 * (1 - 0.6 * win(t, CROW2, CROW2 + 1.3)) : 0),
    worldBack: () => pillow(),
    actors: [bedArtur([[S("L15") - 0.15, { ...POSES.sleepClosed, mouth: "frown" }], [SNZ - 0.2, { armR: { sh: 150, el: -40, hand: "open" } }, 0.25], [SNZ + 0.4, { armR: { sh: 11, el: -7, hand: "rest" } }, 0.3], [CROW2, { ...RIG.EXPR.shock, mouth: "shock", shakeEyes: true }, 0.05]])],
    world: (t) => {
      let s = blanket();
      const sq = t > SNZ && t < SNZ + 0.35 ? 0.75 : 1;
      s += `<g transform="translate(150,-540) scale(1,${f(sq)}) translate(-150,540)">${rooster(150, -540, 0.95, { crow: t > CROW2 && t < CROW2 + 1.6 ? 1 : 0, flip: true, angry: t > SNZ + 0.3 }, t)}</g>`;
      s += shout(-10, -790, 90, t, CROW2, CROW2 + 1.4, 4);
      return s;
    },
    type: (t) => TY.pop(t, SNZ + 0.05, "ӨШІРУ", 1300, 200, { size: 80, color: "#ffffff", rot: 6, t1: SNZ + 0.9 }) + TY.pop(t, CROW2 + 0.05, "КУ-КА-РЕ-КУ!!!", 960, 200, { size: 150, color: "#ff8a5b", rot: -6, wob: 4, t1: S("L16") - 0.2 }),
    fx: () => ({ dim: 0.12, dof: 3 }),
  });
  // «тыныш» → екі күн қуу
  const SHH = Wt("L16", 4), CH0 = Wt("L16", 6) - 0.1;
  MK.CH0 = CH0;
  const chasePos = (t, lag) => { const th = (t - CH0 - lag) * 3.4; return { x: 200 + 900 * Math.sin(th), y: 60 + 160 * Math.cos(th), s: 0.62 + 0.1 * Math.cos(th), flip: Math.cos(th) < 0 }; };
  add({
    t0: S("L16") - 0.1, bg: "yardV", bgArgs: ["day", { well: 1400 }], bgKey: "yardDay", c0: { x: 0, y: -560 },
    cam: [[S("L16") - 0.1, { x: 300, y: -560, z: 1.5 }], [CH0, { x: 260, y: -560, z: 1.45 }], [CH0 + 0.5, { x: 200, y: -620, z: 0.82 }, eout], [S("L17") - 0.4, { x: 220, y: -620, z: 0.86 }]],
    actors: [
      artur({ x: 0, y: 60,
        pos: (t) => (t < CH0 ? null : chasePos(t, 0)),
        mod: (t, p, st) => { if (t > CH0) { const ph = (t - CH0) * 2.6 * 6.283; p.legL = { a: Math.sin(ph) * 28, k: Math.max(0, Math.sin(ph)) * 22 }; p.legR = { a: -Math.sin(ph) * 28, k: Math.max(0, -Math.sin(ph)) * 22 }; p.turn = chasePos(t, 0).flip ? -0.55 : 0.55; } return p; },
        keys: [[S("L16") - 0.1, { turn: 0.35, ...POSES.determined }], [SHH - 0.1, { ...POSES.shh, ...POSES.deadpan, mouth: "uu" }, 0.2], [CH0, { ...RIG.EXPR.scared, mouth: "wavy", armL: { sh: 150, el: 20, hand: "open" }, armR: { sh: 150, el: 20, hand: "open" } }, 0.15]] }),
    ],
    world: (t) => {
      if (t < CH0) return rooster(560, 60, 1.1, { flip: true, angry: t > SHH + 0.3 }, t) + (t > SHH + 0.3 ? TX(560, -380, "!!", 90, "#e85d75", ` stroke="${INK}" stroke-width="10" paint-order="stroke"`) : "");
      const r = chasePos(t, 0.42);
      return `<g>${rooster(r.x, r.y, r.s * 1.5, { run: (t - CH0) * 3, flip: r.flip, angry: true }, t)}</g>` + puff(r.x, r.y - 20, t, Math.floor(t * 3) / 3, 0.33, 4, "#e6d6b0");
    },
    type: (t) => TY.stamp(t, Wt("L16", 8), "2 КҮН", 1500, 200, { size: 90, color: "#e85d75", rot: 8, t1: S("L17") - 0.4 }),
    fx: (t) => { if (t < CH0 + 0.4) return {}; const d = 0.5 - 0.5 * Math.cos((t - CH0 - 0.4) * 2.6); return { dim: 0.55 * d, tint: "#2c3768", tintA: 0.5 * d }; },
  });

  // ========== 2б. ИНТЕРНЕТ: шөп маясы ==========
  const NET = S("L17") - 0.45, PH = E("L17") + 0.25, VM = S("L18") - 0.15, NET2 = S("L19") - 0.2;
  MK.NET = NET; MK.PH = PH; MK.VM = VM;
  const topArtur = (keys, talk) => artur({ x: -20, y: -1010, keys: [[0, { turn: 0.15, ...POSES.oneLeg, ...POSES.phoneSky, ...POSES.determined, ...POSES.lookUp }]].concat(keys || []), talk,
    mod: (t, p) => { p.lean = Math.sin(t * 2.3) * 5; p.armL = { sh: 90 + Math.sin(t * 2.3) * 14, el: 10, hand: "open" }; return p; } });
  add({
    t0: NET, bg: "hayfield", bgArgs: ["day"], bgKey: "hfDay", c0: { x: 0, y: -600 },
    cam: [[NET, { x: 0, y: -300, z: 1.35 }], [Wt("L17", 5), { x: 0, y: -520, z: 0.95 }], [Wt("L17", 8), { x: 0, y: -1300, z: 1.4 }, eio], [PH, { x: 120, y: -1560, z: 2.1 }, eio]],
    worldBack: () => haystack(0, 0, 1.4),
    actors: [topArtur()],
    world: (t) => {
      const ph = { x: -20 + 0.75 * 30, y: -1010 - 0.75 * 960 };
      const blink = Math.sin(t * 9) > 0 ? 1 : 0;
      return `<g transform="translate(${f(ph.x + 120)},${f(ph.y - 40)}) scale(1.6)">${RR(-10, -86, 116, 96, "#ffffff", 5, 14)}${bars(6, 0, blink, 1)}</g>`;
    },
    type: (t) => TY.pop(t, Wt("L17", 2), "ІНТЕРНЕТ: 1 ЖЕР", 960, 160, { size: 70, color: "#ffffff", t1: Wt("L17", 8) }),
  });
  add({
    t0: PH, bg: "hayfield", bgArgs: ["day"], bgKey: "hfDay", c0: { x: 0, y: -600 },
    cam: [[PH, { x: 300, y: -1500, z: 1.3 }], [NET2, { x: 360, y: -1520, z: 1.4 }]],
    worldBack: () => haystack(0, 0, 1.4),
    actors: [topArtur()],
    over: (t) => {
      const k = win(t, PH, VM - 0.2);
      let inner = `${RF(-185, -370, 370, 110, "#3f6fb5")}${TX(0, -300, "Апам", 40, "#ffffff")}`;
      inner += `${RR(-150, -40, 300, 110, "#dcf8c6", 4, 30)}${C(-100, 15, 30, "#3f6fb5", 4)}${P("M-110,0 L-84,15 L-110,30Z", "#ffffff", 0)}`;
      const wav = t > VM ? Array.from({ length: 12 }, (_, i) => RF(-56 + i * 15, 15 - (6 + 22 * Math.abs(Math.sin(t * 12 + i))) / 2, 8, 6 + 22 * Math.abs(Math.sin(t * 12 + i)), "#3f6fb5", 3)).join("") : Array.from({ length: 12 }, (_, i) => RF(-56 + i * 15, 9, 8, 12, "#9aa6b4", 3)).join("");
      inner += wav;
      if (t < VM) inner += `${RR(-150, 120, 300, 30, "#e9ecf2", 3, 15)}${RF(-150, 120, f(300 * k), 30, "#5ab4e5", 15)}${TX(0, 210, Math.floor(k * 100) + "%", 48, INK)}${TX(0, 270, "жүктелуде...", 32, "#6b7280")}`;
      inner += bars(-160, -330, Math.sin(t * 7) > 0.3 ? 1 : 0, 0.9);
      return phoneUI(960, 560, 1.15 * eout(win(t, PH, PH + 0.35)), inner) + (t < VM ? TX(1500, 300, `${String(Math.floor(k * 20)).padStart(2, "0")}:${String(Math.floor((k * 1200) % 60)).padStart(2, "0")}`, 90, "#ffffff", ` stroke="${INK}" stroke-width="12" paint-order="stroke"`) : "");
    },
    fx: (t) => ({ blur: 3, dim: 0.25 }),
  });
  add({
    t0: NET2, bg: "hayfield", bgArgs: ["evening"], bgKey: "hfEve", c0: { x: 0, y: -600 },
    cam: [[NET2, { x: 0, y: -1500, z: 2.2 }], [S("L20") - 0.4, { x: 0, y: -1100, z: 1.0 }]],
    worldBack: () => haystack(0, 0, 1.4),
    actors: [topArtur([[NET2, { ...POSES.tired, fx: { sweat: 0.6, blush: 0.9 } }]], ["L19"])],
    world: (t) => { const x = 60, y = -1890; return Ln(`M${x},${y} L${x + 160},${y - 120} M${x + 30},${y - 20} L${x + 200},${y - 60}`, 3, "#ffffff", ' opacity="0.6"'); },
    type: (t) => TY.pop(t, Wt("L19", 5), "20 МИНУТ", 1450, 230, { size: 110, color: "#f6d55c", rot: -6, t1: S("L20") - 0.5 }),
  });

  // ========== 2в. БЕКЗАТ: шелек ==========
  const BEK = S("L20") - 0.4, LIFT2 = Wt("L22", 3) + 0.2, GO = Wt("L22", 8) - 0.1, STR = Wt("L22", 11);
  MK.LIFT2 = LIFT2; MK.GO = GO; MK.STR = STR;
  add({
    t0: BEK, bg: "yardV", bgArgs: ["day", { well: 1400 }], bgKey: "yardDay", c0: { x: 0, y: -560 },
    cam: [[BEK, { x: 600, y: -640, z: 0.9 }], [S("L21") - 0.2, { x: 440, y: -560, z: 1.35 }], [E("L21"), { x: 420, y: -560, z: 1.45 }], [LIFT2 - 0.3, { x: 520, y: -560, z: 1.1 }], [GO + 1.2, { x: 700, y: -560, z: 1.05 }], [STR, { x: 120, y: -560, z: 1.35 }], [E("L22"), { x: 60, y: -600, z: 1.9 }]],
    actors: [
      artur({ x: 60, y: 40,
        mod: (t, p) => { if (t > STR) { p.squash = 1 + Math.sin(t * 30) * 0.02; p.lean = 30 + Math.sin(t * 25) * 2; } return p; },
        keys: [[BEK, { turn: 0.35, ...RIG.EXPR.calm }], [S("L21") + 0.5, { ...POSES.deadpan }, 0.3], [STR - 0.3, { turn: 0.2, ...POSES.strain, armL: { sh: 30, el: -20, hand: "fist" }, armR: { sh: 30, el: -20, hand: "fist" }, legL: { a: 14, k: 20 }, legR: { a: 14, k: 20 } }, 0.3]] }),
      boy({ x: 700, y: 40, talk: ["L21"],
        keys: [[BEK, { turn: -0.35, ...RIG.EXPR.smug, ...RIG.POSES.hips }], [S("L21"), { ...POSES.determined }, 0.2], [Wt("L21", 3), { armR: { sh: 84, el: 2, hand: "point" } }, 0.2],
          [LIFT2 - 0.2, { ...RIG.EXPR.happy, turn: 0.3, armL: { sh: 18, el: -6, hand: "fist", prop: AP.bucket(true) }, armR: { sh: 18, el: -6, hand: "fist", prop: AP.bucket(true) } }, 0.2], [GO, { turn: 0.6, walk: 1.8, mouth: "uu" }, 0.1], [GO + 0.05, { x: 2400 }, 3.2, (k) => k]] }),
    ],
    world: (t) => {
      let s = "";
      if (t < LIFT2) s += bucket(340, 40, 0.75, true) + bucket(470, 40, 0.75, true);
      const lift = t > STR + 0.4 ? Math.max(0, Math.sin((t - STR) * 3)) * 6 : 0;
      s += bucket(200, 40 - lift, 0.75, true);
      return s;
    },
    nearWorld: (t) => (t > GO ? notes(lerp(700, 2400, win(t, GO, GO + 3.2)) + 60, -560, t, GO, GO + 3.4) : ""),
    type: (t) => TY.stamp(t, Wt("L22", 1), "10 ЖАС", 1500, 220, { size: 90, color: "#3f6fb5", rot: 6, t1: Wt("L22", 8) }) + TY.pop(t, STR + 0.3, "...ӘЛІ КӨТЕРІП ЖАТЫРМЫН", 960, 160, { size: 64, color: "#ffffff", t1: E("L22") + 0.4 }),
  });

  // ========== 2г. ӘЖЕНІҢ АС КЕСТЕСІ ==========
  const FOODT = S("L23") - 0.5;
  const meals = [[Wt("L23", 6), "ТАҢҒЫ АС"], [Wt("L23", 8), "ЕКІНШІ ТАҢҒЫ АС"], [Wt("L23", 11), "ТҮСКІ АС"], [Wt("L23", 13), "ТҮСТЕН КЕЙІНГІ ШАЙ"], [Wt("L23", 17), "КЕШКІ АС"]];
  const mealN = (t) => meals.filter(([m]) => t > m).length;
  const TEA = S("L24") - 0.2, TWO = Wt("L24", 8);
  MK.MEALS = meals.map(([m]) => m); MK.TEA = TEA; MK.TWO = TWO;
  add({
    t0: FOODT, bg: "room", c0: { x: 0, y: -500 }, flashIn: 0.15,
    cam: [[FOODT, { x: -520, y: -340, z: 1.1 }], [TEA, { x: -400, y: -340, z: 1.2 }], [TWO, { x: -100, y: -340, z: 1.25 }], [S("L25") - 0.4, { x: -60, y: -350, z: 1.4 }]],
    worldBack: () => BG.korpe(-170, 60, 520),
    actors: [
      Object.assign(sitArtur([[FOODT, { ...RIG.EXPR.happy }], [meals[2][0], { ...RIG.EXPR.calm }, 0.3], [meals[3][0], { ...POSES.tired }, 0.3], [TEA, { ...POSES.tired, armR: { sh: 60, el: -110, hand: "fist", prop: AP.kese() } }, 0.3]]), { mod: (t, p) => { p.squash = (p.squash || 1) * (1 - 0.035 * Math.min(5, mealN(t) + win(t, TEA, TWO + 1) * 2)); return p; } }),
      aje({ x: 520, y: 40, keys: [[FOODT, { turn: -0.35, ...RIG.EXPR.happy }], [TEA, { ...POSES.warm, armR: { sh: 86, el: -50, hand: "fist", prop: AP.teapot() } }, 0.3]], mod: (t, p) => { if (t > TEA) p.armR = Object.assign({}, p.armR, { sh: 86 + Math.sin(t * 2) * 6 }); return p; } }),
    ],
    world: (t) => {
      let s = plate(-160, 120, 1, Math.min(4, 1 + mealN(t) * 0.8));
      if (t > TEA) s += Ln(`M300,-470 Q180,-360 70,-260`, 8, "#c98a4a", ' opacity="0.85"');
      return tableFront() + s;
    },
    over: (t) => {
      let s = "";
      const out = 1 - win(t, TEA - 0.3, TEA);
      if (out <= 0) return "";
      s += `<g opacity="${f(out)}">${RR(70, 120, 760, 600, "#fffaf0", 8, 24)}${TX(450, 200, "ӘЖЕНІҢ КЕСТЕСІ", 52, "#b5413f")}`;
      meals.forEach(([m, txt], i) => {
        const k = spring((t - m) / 0.5, 14, 6);
        if (t < m) return;
        s += `<g transform="translate(130,${290 + i * 92}) scale(${f(Math.max(0, k))})">${C(20, -14, 26, "#f6d55c", 5)}${TX(20, -2, String(i + 1), 34, INK)}<text x="70" y="0" font-size="44" font-family="Montserrat, sans-serif" font-weight="800" fill="${INK}">${txt}</text></g>`;
      });
      return s + `</g>`;
    },
    type: (t) => TY.pop(t, Wt("L24", 4), "«АЗДАП»", 1450, 220, { size: 110, color: "#ffffff", rot: -6, t1: TWO - 0.1 }) + TY.pop(t, TWO, "= 2 САҒАТ", 1450, 230, { size: 120, color: "#f6d55c", rot: 5, t1: S("L25") - 0.4 }),
    fx: () => ({ vig: 0.2, dof: 2.5 }),
  });

  // ========== 2д. АТА: «Мм.» ==========
  const ATA = S("L25") - 0.4, MM1 = S("L26"), EVE = S("L28") - 0.45, BED = Wt("L29", 3);
  MK.ATA = ATA; MK.EVE = EVE;
  const benchAta = (keys) => ata({ x: 0, y: -2, keys: [[0, { turn: 0.1, ...POSES.sitFloor, ...RIG.EXPR.sleepy, armR: { sh: 26, el: -30, hand: "fist", prop: AP.cane() } }]].concat(keys || []), talk: ["L26", "L28"] });
  add({
    t0: ATA, bg: "yardV", bgArgs: ["day", { bench: 0 }], bgKey: "yardBench", c0: { x: 0, y: -560 },
    cam: [[ATA, { x: 0, y: -620, z: 0.95 }], [MM1 - 0.3, { x: 0, y: -640, z: 1.55 }], [EVE - 0.05, { x: 0, y: -660, z: 1.7 }]],
    actors: [benchAta([[MM1, { headY: 12 }, 0.12], [MM1 + 0.35, { headY: 0 }, 0.25]])],
    type: (t) => TY.stamp(t, Wt("L25", 5), "КҮНІНЕ 2 СӨЗ", 1500, 230, { size: 64, color: "#3f6fb5", rot: 6, t1: MM1 - 0.1 }) + TY.pop(t, S("L27") - 0.1, "«Мм.» = «ҚАЙЫРЛЫ ТАҢ»", 960, 170, { size: 74, color: "#f6d55c", t1: EVE - 0.1 }),
  });
  add({
    t0: EVE, bg: "yardV", bgArgs: ["dusk", { bench: 0 }], bgKey: "yardBenchDusk", c0: { x: 0, y: -560 },
    cam: [[EVE, { x: 0, y: -640, z: 1.6 }], [S("L29") - 0.1, { x: 200, y: -620, z: 0.95 }, eout], [S("L30") - 0.5, { x: 300, y: -620, z: 0.9 }]],
    actors: [
      benchAta([[S("L28"), { headY: 14, eye: { lidTop: 0.85 } }, 0.3]]),
      aje({ keys: [[EVE, { x: 900, y: 40, turn: -0.3, ...RIG.EXPR.calm }], [BED - 0.2, { turn: -0.6, walk: 1.6, ...POSES.deadpan }, 0.2], [BED, { x: -2200 }, 3.0, (k) => k]] }),
      artur({ keys: [[EVE, { x: 1300, y: 40, turn: -0.3, ...POSES.phoneUp, ...RIG.EXPR.calm }], [BED + 0.1, { turn: -0.6, walk: 1.6, ...POSES.deadpan, ...POSES.armsDown }, 0.2], [BED + 0.3, { x: -2000 }, 3.0, (k) => k]] }),
    ],
    type: (t) => TY.pop(t, S("L29") + 0.1, "«Ммм.» = «ЖАТЫҢДАР»", 960, 170, { size: 74, color: "#f6d55c", t1: S("L30") - 0.5 }),
    fx: () => ({ vig: 0.3 }),
  });

  // ========== 3. ТАПСЫРМА ==========
  const TASK = S("L30") - 0.5, PHOTO = Wt("L31", 5), CIRC = Wt("L31", 10), PROUD = S("L32") - 0.25, FRZ = E("L32") + 0.25, GRID = S("L34") - 0.15, DUN = Wt("L34", 3);
  MK.TASK = TASK; MK.FRZ = FRZ; MK.GRID = GRID; MK.DUN = DUN;
  const aktandak = (x, y, s, t) => cow(x, y, s, { col: "#a0623a", horns: true, lashes: true, bell: true, chew: true, uid: 9 }, t);
  add({
    t0: TASK, bg: "yardV", bgArgs: ["evening", { well: -1500 }], bgKey: "yardEve", c0: { x: 0, y: -560 },
    cam: [[TASK, { x: 600, y: -700, z: 0.75 }], [S("L31") - 0.2, { x: 260, y: -560, z: 1.3 }], [PHOTO, { x: 300, y: -560, z: 1.35 }], [E("L31"), { x: 280, y: -580, z: 1.5 }]],
    actors: [
      aje({ x: 560, y: 40, talk: ["L31"], keys: [[TASK, { turn: -0.35, ...RIG.EXPR.calm, armR: { sh: 18, el: -6, hand: "fist", prop: AP.bucket(false) } }], [S("L31"), { ...POSES.warm }, 0.3], [Wt("L31", 7), { armL: { sh: 84, el: 2, hand: "point" } }, 0.2], [Wt("L31", 10), { armL: { sh: 120, el: -60, hand: "point" } }, 0.2]] }),
      artur({ x: 0, y: 40, keys: [[TASK, { turn: 0.35, ...RIG.EXPR.calm, ...POSES.phoneUp }], [S("L31") + 0.6, { ...POSES.armsDown, ...POSES.lookR }, 0.3]] }),
    ],
    over: (t) => {
      if (t < PHOTO) return "";
      const k = spring((t - PHOTO) / 0.7, 12, 6);
      let inner = RF(-300, -220, 600, 440, "#bfe3a0") + aktandak(-60, 210, 0.5, t);
      if (t > CIRC) { const kc = win(t, CIRC, CIRC + 0.5); inner += `<path d="M${f(170 + 100 * Math.cos(-0.3))},${f(-60 + 80 * Math.sin(-0.3))} ${Array.from({ length: 26 }, (_, i) => { const a = -0.3 + i / 25 * 6.4 * kc; return `L${f(150 + 100 * Math.cos(a))},${f(-55 + 80 * Math.sin(a))}`; }).join(" ")}" fill="none" stroke="#e8423a" stroke-width="10" stroke-linecap="round"/>`; }
      return `<g transform="scale(${f(k)})" style="transform-origin:1460px 330px">${card(1460, 330, 600, 440, 4, inner)}${TX(1460, 640, "АҚТАҢДАҚ", 50, INK)}</g>`;
    },
    type: (t) => TY.pop(t, Wt("L30", 4), "ЕҢ ЖАУАПТЫ ТАПСЫРМА", 960, 160, { size: 74, color: "#f6d55c", t1: S("L31") + 0.6 }),
  });
  add({
    t0: PROUD, bg: "yardV", bgArgs: ["evening", { well: -1500 }], bgKey: "yardEve", c0: { x: 0, y: -560 },
    cam: [[PROUD, { x: 0, y: -620, z: 1.7 }], [FRZ, { x: 0, y: -650, z: 2.0 }], [FRZ + 0.15, { x: 0, y: -660, z: 2.3 }, eout], [GRID, { x: 0, y: -660, z: 2.35 }]],
    actors: [artur({ x: 0, y: 40, talk: ["L32"],
      mod: (t, p) => (t > FRZ ? p : p),
      keys: [[PROUD, { turn: 0.2, ...RIG.EXPR.smug, ...POSES.chest }], [Wt("L32", 2), { ...RIG.EXPR.happy, mouth: "smirk", ...RIG.POSES.cheer }, 0.2], [Wt("L32", 5), { ...RIG.EXPR.smug, ...POSES.chest, armL: { sh: 50, el: -94, hand: "fist" } }, 0.25]] })],
    freeze: FRZ,
    type: (t) => TY.stamp(t, Wt("L32", 2), "ҰБТ ✓", 1450, 260, { size: 90, color: "#3f6fb5", rot: -6, t1: FRZ }) + (t > FRZ ? TY.pop(t, FRZ + 0.05, "ОЛ КЕЗДЕ МЕН БІЛМЕДІМ...", 960, 170, { size: 66, color: "#ffffff", from: 0.9 }) : ""),
    fx: (t) => (t > FRZ ? { sepia: 0.6, grain: 0.3, vig: 0.6, flash: Math.max(0, 1 - (t - FRZ) / 0.25) * 0.7 } : {}),
  });
  // ақ таңбалы сиырлардың торы
  const gridCols = ["#a0623a", "#3a3a3a", "#c98a4a", "#f4f1ea", "#7a4a2a", "#8a8f99", "#b5413f"];
  add({
    t0: GRID, bg: "host", bgArgs: [["#ffcf8a", "#e8775a"]], bgKey: "hostSun", noCaps: false,
    cam: [[GRID, { x: 0, y: -380, z: 1.6 }], [DUN, { x: 0, y: -380, z: 1.15 }], [S("L35") - 0.6, { x: 0, y: -380, z: 0.95 }]],
    shake: (t) => (t > DUN && t < DUN + 0.5 ? 12 * (1 - win(t, DUN, DUN + 0.5)) : 0),
    over: (t) => {
      let s = "";
      let n = 0;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
        const t0 = GRID + 0.15 + (r * 8 + c) * 0.075 * (1 + 0.3 * hash(r * 8 + c));
        if (t < t0) continue;
        const k = spring((t - t0) / 0.5, 15, 7);
        const x = 180 + c * 222 + (r % 2) * 40, y = 170 + r * 245;
        s += `<g transform="translate(${x},${y}) scale(${f(k * 0.62)}) rotate(${f((hash(n++) - 0.5) * 16)})">${cowFace(0, 0, 1, gridCols[(r * 8 + c) % gridCols.length], { horns: (r + c) % 3 === 0, px: Math.sin(t * 2 + c) })}</g>`;
      }
      return s;
    },
    type: (t) => TY.stamp(t, DUN, "100% АҚ ТАҢБА", 960, 540, { size: 110, color: "#e85d75", rot: -8 }),
  });

  G.AUYL_H = { Wt, POSES, puff, speed, shout, notes, phoneUI, bars, wifi, card, artur, aje, ata, boy, backpack, aktandak, hostArtur, sitArtur, tableFront, plateW, benchAta, pillow };
  G.SONGY_SHOTS = SH;
  G.SONGY_MARKS = Object.assign(G.SONGY_MARKS || {}, MK, { BUSGO, GATE, HUG, PULL, P1, P2, P3, TL0, TL1, POP, MEAT, LAND, ATA1, TITLE, ROO_T, HOST, WIFI, ROO, CROW1, SNZ, CROW2, SHH, CH0, NET, PH, VM, NET2, BEK, LIFT2, GO, STR, FOODT, TEA, TWO, ATA, MM1, EVE, BED, TASK, PHOTO, CIRC, PROUD, FRZ, GRID, DUN });
})(typeof window !== "undefined" ? window : globalThis);
