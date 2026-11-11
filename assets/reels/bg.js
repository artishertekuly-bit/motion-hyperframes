/* Reels (9:16) — үш оқиғаның фондары мен заттары: той залы, «Ақбоз» көлігі, көше, ас үй, Сәуле апаның үйі.
 * Әлем координаттары songy/bg.js-тегідей: еден y = 0, кейіпкер табаны y ≈ 0, s 0.75 ≈ 720 бірлік бой.
 * Тік кадр үшін фондар биік салынады: y −2400 … +1000, x −1600 … +1600.
 */
(function (G) {
  "use strict";
  const B = G.SONGY_BG;
  const { BG, P, F, Ln, R, RF, C, T, INK, rng, f, crowdPerson, windowFrame } = B;
  const grad = (id, stops, horiz) => `<linearGradient id="${id}" x1="0" y1="0" x2="${horiz ? 1 : 0}" y2="${horiz ? 0 : 1}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  const E = (cx, cy, rx, ry, fill, sw) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" stroke="${INK}" stroke-width="${sw == null ? 6 : sw}"/>`;
  const g = (x, y, s, inner, rot) => `<g transform="translate(${f(x)},${f(y)})${rot ? ` rotate(${f(rot)})` : ""}${s != null && s !== 1 ? ` scale(${f(s)})` : ""}">${inner}</g>`;
  const TB = (x, y, s, size, fill, extra) => T(x, y, s, size, fill, ` stroke="${INK}" stroke-width="${Math.max(4, size * 0.12)}" paint-order="stroke"${extra || ""}`);

  // ================= ортақ бөлшектер =================
  // қазақ оюы (қошқар мүйіз) — жиек
  function horn(x, y, s, col) {
    return g(x, y, s, P("M0,0 C-10,-40 -50,-46 -56,-14 C-60,10 -30,18 -22,0 C-16,-12 -30,-18 -34,-8 M0,0 C10,-40 50,-46 56,-14 C60,10 30,18 22,0 C16,-12 30,-18 34,-8 M0,0 L0,40", "none", 7).replace(`stroke="${INK}"`, `stroke="${col || INK}"`));
  }
  function ornRow(x0, x1, y, step, s, col) { let o = ""; for (let x = x0; x <= x1; x += step) o += horn(x, y, s, col); return o; }
  function ornBorder(x, y, w, h, col, bg) {
    let o = R(x, y, w, h, bg || "#b8322f", 8, 18);
    o += `<rect x="${f(x + 26)}" y="${f(y + 26)}" width="${f(w - 52)}" height="${f(h - 52)}" rx="10" fill="none" stroke="${col || "#f2c14e"}" stroke-width="6"/>`;
    o += ornRow(x + 90, x + w - 90, y + 70, 130, 0.8, col || "#f2c14e") + ornRow(x + 90, x + w - 90, y + h - 80, 130, 0.8, col || "#f2c14e");
    return o;
  }
  const sparkle = (x, y, r, col) => P(`M${f(x)},${f(y - r)} Q${f(x + r * 0.18)},${f(y - r * 0.18)} ${f(x + r)},${f(y)} Q${f(x + r * 0.18)},${f(y + r * 0.18)} ${f(x)},${f(y + r)} Q${f(x - r * 0.18)},${f(y + r * 0.18)} ${f(x - r)},${f(y)} Q${f(x - r * 0.18)},${f(y - r * 0.18)} ${f(x)},${f(y - r)}Z`, col || "#fff3b0", 4);
  const heart = (x, y, s, col) => g(x, y, s, P("M0,30 C-70,-20 -50,-80 0,-46 C50,-80 70,-20 0,30Z", col || "#e85d75", 6));

  // ---------- той ----------
  function chandelier(x, y, s, t) {
    const sw = Math.sin((t || 0) * 0.8) * 2;
    let o = Ln(`M0,-600 L0,-90`, 6, "#b8902f") + Ln(`M0,-600 L0,-90`, 2);
    o += E(0, 0, 260, 60, "#e8c25a", 6) + E(0, -40, 180, 40, "#f2d27a", 5) + E(0, -90, 90, 24, "#f6dc8c", 5);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, cx = Math.cos(a) * 230, cy = Math.sin(a) * 48;
      o += Ln(`M${f(cx)},${f(cy)} L${f(cx)},${f(cy + 70)}`, 3, "#b8902f") + P(`M${f(cx)},${f(cy + 70)} l14,26 l-14,26 l-14,-26Z`, "#e6f4ff", 3);
    }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; o += C(Math.cos(a) * 140, -60 + Math.sin(a) * 20, 18, "#fff7d6", 3); }
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(sw)}) scale(${f(s)})"><circle cx="0" cy="10" r="420" fill="#fff3c4" opacity="0.16"/>${o}</g>`;
  }
  function ledScreen(x, y, w, h, l1, l2, t) {
    let o = R(x - w / 2 - 20, y - h / 2 - 20, w + 40, h + 40, "#2a2c35", 8, 16);
    o += `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" fill="url(#ledG)"/>`;
    for (let i = 0; i < 26; i++) { const k = ((t || 0) * 0.07 + i * 0.037) % 1; o += `<circle cx="${f(x - w / 2 + ((i * 197) % w))}" cy="${f(y + h / 2 - k * h)}" r="${f(6 + (i % 4) * 3)}" fill="#ffe7f0" opacity="${f(0.5 * Math.sin(k * Math.PI))}"/>`; }
    o += TB(x - w * 0.26, y + 30, l1, 96, "#ffffff") + heart(x, y + 6, 1.1, "#ff6f91") + TB(x + w * 0.26, y + 30, l2, 96, "#ffffff");
    return `<defs>${grad("ledG", [[0, "#6a2c8f"], [0.55, "#c2408f"], [1, "#f08a5d"]])}</defs>` + o;
  }
  // үстел (дөңгелек, ақ дастарқан) — алдыңғы жағы
  function roundTable(x, y, s, opts) {
    opts = opts || {};
    const r = rng(opts.seed || 3);
    let o = P("M-330,-200 L-330,-60 Q0,10 330,-60 L330,-200Z", "#ffffff", 6) + Ln("M-330,-150 Q0,-80 330,-150", 4, "#e6d8b8");
    o += E(0, -200, 330, 70, "#ffffff", 6) + E(0, -200, 300, 58, "#f7f2e6", 0);
    const cols = ["#e85d75", "#f2a541", "#7cc47a", "#f6d55c", "#c76b4f", "#9fd0e8"];
    for (let i = 0; i < (opts.bowls || 5); i++) {
      const bx = -220 + i * (440 / Math.max(1, (opts.bowls || 5) - 1)) + (r() - 0.5) * 30, by = -205 + (r() - 0.5) * 30;
      o += E(bx, by + 8, 46, 16, "#ffffff", 4) + E(bx, by - 2, 38, 16, cols[(i + (opts.seed || 0)) % cols.length], 3);
    }
    if (opts.bottles !== false) for (const bx of [-60, 70]) o += R(bx - 14, -330, 28, 120, bx < 0 ? "#f2a541" : "#e85d75", 5, 8) + R(bx - 8, -352, 16, 24, "#ffffff", 4, 4);
    return g(x, y, s, o);
  }
  // қонақ (отырған, белден жоғары): face 0 — арқасы, 1 — бізге қарайды
  function guest(x, y, s, seed, face, opts) {
    opts = opts || {};
    const r = rng(seed);
    const woman = r() < 0.55;
    const tops = woman ? ["#8e3b6e", "#2f7d8c", "#c25b3f", "#6b4fa3", "#d9a03f", "#3f6fb5"] : ["#2c3446", "#3b3f4a", "#5a4636", "#41506b"];
    const top = opts.top || tops[Math.floor(r() * tops.length)];
    const fc = Math.max(0, Math.min(1, face || 0));
    let o = P("M-110,0 L-104,-210 Q-96,-262 0,-266 Q96,-262 104,-210 L110,0Z", top, 6);
    const hx = (r() - 0.5) * 10;
    o += C(hx, -350, 96, "#ffffff", 6);
    const hairC = woman ? ["#3a2a22", "#5a3d2b", "#26232a"][Math.floor(r() * 3)] : ["#2a2522", "#3a3530", "#6f737d"][Math.floor(r() * 3)];
    const scarf = woman && r() < 0.35;
    if (fc < 0.5) {
      // арқасы — шаш/орамал
      if (scarf) o += P(`M${hx - 100},-340 Q${hx - 96},-452 ${hx},-452 Q${hx + 96},-452 ${hx + 100},-340 Q${hx + 60},-300 ${hx},-296 Q${hx - 60},-300 ${hx - 100},-340Z`, ["#e85d75", "#f2c14e", "#7cc47a", "#ffffff"][Math.floor(r() * 4)], 5);
      else o += P(`M${hx - 98},-330 Q${hx - 100},-450 ${hx},-452 Q${hx + 100},-450 ${hx + 98},-330 Q${hx + 50},-300 ${hx},-300 Q${hx - 50},-300 ${hx - 98},-330Z`, hairC, 5);
      if (woman && !scarf) o += C(hx, -456, 34, hairC, 5);
    } else {
      // бізге қарады — көз, ауыз, шаш үстінде
      if (scarf) o += P(`M${hx - 104},-330 Q${hx - 110},-462 ${hx},-462 Q${hx + 110},-462 ${hx + 104},-330 L${hx + 84},-340 Q${hx + 70},-430 ${hx},-430 Q${hx - 70},-430 ${hx - 84},-340Z`, ["#e85d75", "#f2c14e", "#7cc47a"][Math.floor(r() * 3)], 5);
      else o += P(`M${hx - 98},-350 Q${hx - 96},-452 ${hx},-454 Q${hx + 96},-452 ${hx + 98},-350 Q${hx + 40},-410 ${hx - 20},-404 Q${hx - 70},-400 ${hx - 98},-350Z`, hairC, 5);
      const ex = opts.eyeX || 0;
      o += `<ellipse cx="${f(hx - 32 + ex)}" cy="-356" rx="11" ry="${opts.wide ? 17 : 14}" fill="${INK}"/><ellipse cx="${f(hx + 32 + ex)}" cy="-356" rx="11" ry="${opts.wide ? 17 : 14}" fill="${INK}"/>`;
      if (opts.cry) o += P(`M${hx - 40},-336 q-8,26 0,40 q8,-14 0,-40Z`, "#a8dcf6", 3) + P(`M${hx + 40},-336 q-8,26 0,40 q8,-14 0,-40Z`, "#a8dcf6", 3);
      o += opts.mouth === "o" ? E(hx, -302, 14, 18, INK, 0) : Ln(`M${hx - 18},-306 Q${hx},${opts.mouth === "smile" ? -290 : -302} ${hx + 18},-306`, 5);
    }
    return g(x, y, s, o);
  }
  function cat(x, y, s, o) {
    o = o || {};
    const ht = o.turn || 0; // 0 — бүйірі, 1 — бізге
    let d = P("M-70,0 Q-90,-120 -40,-190 Q0,-210 40,-190 Q90,-120 70,0Z", o.col || "#f2a541", 6);
    d += Ln("M60,-10 Q150,-30 140,-120", 16, INK) + Ln("M60,-10 Q150,-30 140,-120", 8, o.col || "#f2a541");
    const hx = -10 + ht * 6;
    d += P(`M${hx - 70},-230 L${hx - 74},-330 L${hx - 22},-290 Z`, o.col || "#f2a541", 5) + P(`M${hx + 70},-230 L${hx + 74},-330 L${hx + 22},-290 Z`, o.col || "#f2a541", 5);
    d += E(hx, -240, 82, 70, o.col || "#f2a541", 6);
    d += Ln(`M${hx - 50},-270 l20,10 M${hx + 50},-270 l-20,10`, 5, "#c97c22");
    if (ht > 0.5) {
      d += `<ellipse cx="${hx - 30}" cy="-246" rx="10" ry="${o.wide ? 18 : 13}" fill="${INK}"/><ellipse cx="${hx + 30}" cy="-246" rx="10" ry="${o.wide ? 18 : 13}" fill="${INK}"/>`;
      d += P(`M${hx - 8},-222 l8,8 l8,-8Z`, "#e85d75", 3) + Ln(`M${hx - 60},-218 l-50,-6 M${hx - 60},-208 l-48,8 M${hx + 60},-218 l50,-6 M${hx + 60},-208 l48,8`, 3);
      if (o.tongue) d += P(`M${hx - 12},-206 Q${hx},-176 ${hx + 12},-206Z`, "#ff8fa3", 4);
    } else d += C(hx + 46, -246, 9, INK, 0) + Ln(`M${hx + 70},-224 l46,-6 M${hx + 70},-214 l44,8`, 3);
    return g(x, y, s, d);
  }
  function synth(x, y, s) {
    let o = Ln("M-180,0 L-120,-260 M180,0 L120,-260 M-180,-140 L180,-140", 10, "#3b3f4a");
    o += R(-280, -320, 560, 70, "#2a2c35", 6, 10) + RF(-260, -300, 520, 30, "#ffffff");
    for (let i = 0; i < 26; i++) o += Ln(`M${-260 + i * 20},-300 L${-260 + i * 20},-270`, 2) + (i % 7 !== 2 && i % 7 !== 6 ? RF(-252 + i * 20, -300, 10, 18, INK) : "");
    o += C(-220, -320 - 4, 0.1, INK, 0);
    return g(x, y, s, o);
  }
  function folder(x, y, s, label) {
    let o = R(-120, -160, 240, 320, "#c9a24a", 7, 10) + RF(-120, -150, 240, 20, "#a8862f");
    for (let i = 0; i < 6; i++) o += RF(-112, -150 + i * 52, 6, 30, "#ffffff");
    o += R(-90, -60, 180, 70, "#ffffff", 5, 6) + T(0, -14, label || "ДОСЬЕ", 34, INK);
    return g(x, y, s, o);
  }
  function invite(x, y, s, o) {
    o = o || {};
    let d = ornBorder(-300, -420, 600, 840, "#f2c14e", "#7a1f3d");
    d += TB(0, -230, "ШАҚЫРУ", 64, "#f6d55c") + T(0, -150, "Дәулет пен Аружан", 34, "#fff3d6") + T(0, -100, "той салтанатына", 30, "#fff3d6");
    d += heart(0, -10, 0.7, "#f2c14e");
    d += TB(0, 140, o.time || "18:00", 120, "#ffffff");
    if (o.cross) d += Ln(`M-170,${f(110 - o.cross * 20)} L${f(-170 + 340 * o.cross)},${f(110 + o.cross * 20)}`, 18, "#e85d75");
    d += T(0, 250, "«Алтын сарай» мейрамханасы", 26, "#fff3d6");
    return g(x, y, s, d);
  }
  function ice(x, y, w, h, k) {
    if (k <= 0) return "";
    let o = `<rect x="${f(x - w / 2)}" y="${f(y - h)}" width="${f(w)}" height="${f(h * k)}" transform="translate(0,${f(h * (1 - k))})" rx="30" fill="#bfe8ff" opacity="0.55" stroke="#ffffff" stroke-width="8"/>`;
    o += Ln(`M${f(x - w / 2 + 40)},${f(y - h + 60 + h * (1 - k))} L${f(x - w / 2 + 100)},${f(y - h + 200 + h * (1 - k))} M${f(x + w / 2 - 80)},${f(y - h * 0.5)} L${f(x + w / 2 - 40)},${f(y - h * 0.3)}`, 10, "#ffffff", ` opacity="${f(0.8 * k)}"`);
    for (let i = 0; i < 7; i++) o += sparkle(x - w / 2 + ((i * 173) % w), y - h * 0.15 - ((i * 311) % (h * 0.8)), 16 + (i % 3) * 8, "#ffffff");
    return o;
  }

  // ---------- көлік ----------
  const CAR = { body: "#f4f4ef", shade: "#d9d9cf", glass: "#a9d3f0", chrome: "#d7dbe2" };
  // «алтылық» — бүйірден (оңға қарайды), табаны (0,0) — екі доңғалақтың ортасы
  function car6(x, y, s, o) {
    o = o || {};
    const rot = o.rot || 0, wr = o.wheel || 0, bz = o.bounce || 0;
    const col = o.col || CAR.body;
    const wheel = (wx) => `<g transform="translate(${wx},-130) rotate(${f(wr)})">${C(0, 0, 128, "#2a2b31", 7)}${C(0, 0, 66, CAR.chrome, 5)}${Ln("M-50,0 L50,0 M0,-50 L0,50", 6, "#9aa1ab")}${C(0, 0, 18, "#9aa1ab", 4)}</g>`;
    let d = wheel(-540) + wheel(560);
    let b = P("M-880,-170 L-880,-330 Q-878,-392 -820,-398 L-430,-404 L-300,-618 Q-290,-628 -270,-628 L170,-628 Q190,-628 200,-616 L340,-404 L800,-398 Q872,-392 880,-330 L880,-170 Q880,-140 850,-140 L700,-140 Q690,-290 560,-292 Q430,-290 420,-140 L-410,-140 Q-420,-290 -540,-292 Q-668,-290 -680,-140 L-850,-140 Q-880,-140 -880,-170Z", col, 7);
    b += F("M-878,-250 L878,-250 L880,-170 Q880,-140 850,-140 L700,-140 Q694,-236 640,-268 L480,-268 Q426,-236 420,-140 L-410,-140 Q-416,-236 -470,-268 L-610,-268 Q-670,-236 -680,-140 L-850,-140 Q-880,-140 -878,-170Z", CAR.shade);
    b += P("M-404,-412 L-296,-602 L-60,-602 L-60,-412Z", o.glass || CAR.glass, 5) + P("M-30,-412 L-30,-602 L160,-602 L300,-412Z", o.glass || CAR.glass, 5);
    b += Ln("M-260,-560 L-200,-460 M90,-570 L150,-480", 8, "#ffffff", ' opacity="0.6"');
    b += Ln("M-880,-300 L880,-300", 5, CAR.chrome) + Ln("M-880,-300 L880,-300", 2);
    b += Ln("M-45,-404 L-45,-150 M320,-404 L330,-150 M-420,-404 L-420,-150", 4);
    b += R(-150, -380, 60, 14, CAR.chrome, 3, 5) + R(200, -380, 60, 14, CAR.chrome, 3, 5);
    b += R(840, -250, 70, 46, CAR.chrome, 5, 8) + R(-910, -250, 70, 46, CAR.chrome, 5, 8);
    b += R(850, -360, 40, 50, o.lights ? "#fff7b0" : "#f6f0c0", 4, 10) + R(-890, -370, 34, 70, "#d93a3a", 4, 6);
    if (!o.mirrorOff) b += P("M300,-430 L330,-470 L370,-470 L360,-430Z", col, 5);
    if (o.plate) b += R(-930, -236, 30, 0.1, INK, 0);
    if (o.inside) b += o.inside;
    d += `<g transform="translate(0,${f(-bz)})">${b}</g>`;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s * (o.flip ? -1 : 1))},${f(s)})">${d}</g>`;
  }
  // алдыңғы әйнектен қарағандағы көлік: салон артқы қабырғасы (orta, кейіпкерлердің артында)
  function carCabin(o) {
    o = o || {};
    let m = `<path d="M-440,-900 L440,-900 L440,-300 L-440,-300Z M-250,-800 L250,-800 L270,-600 L-270,-600Z" fill="#cdbfa3" fill-rule="evenodd" stroke="${INK}" stroke-width="6"/>`;
    m += Ln("M-250,-800 L250,-800 L270,-600 L-270,-600Z", 8, "#3b3f4a");
    for (const sx of [-1, 1]) m += R(sx * 150 - 120, -640, 240, 340, o.seat || "#6b4a3a", 6, 40) + R(sx * 150 - 70, -760, 140, 110, o.seat || "#6b4a3a", 6, 30);
    return m;
  }
  // алдыңғы әйнек жақтауы + капот + торпедо (world ішінде, кейіпкерлердің алдында)
  function carFront(o) {
    o = o || {};
    const col = o.col || CAR.body;
    let d = "";
    // әйнек шағылысы
    d += `<path d="M-400,-330 L-330,-820 L330,-820 L400,-330Z" fill="#cfe8f7" opacity="${o.night ? 0.12 : 0.16}"/>`;
    d += Ln("M-220,-800 L-300,-360 M-150,-800 L-200,-560", 16, "#ffffff", ' opacity="0.22"');
    // торпедо
    d += P("M-405,-330 L405,-330 L410,-250 L-410,-250Z", "#34343c", 6) + RF(-380, -330, 760, 16, "#4a4a54");
    // рөл (жүргізуші — экранның оң жағында)
    if (o.wheel !== false) d += `<g transform="translate(160,-350) rotate(${f(o.wheelRot || 0)})"><ellipse cx="0" cy="0" rx="150" ry="62" fill="none" stroke="${INK}" stroke-width="30"/><ellipse cx="0" cy="0" rx="150" ry="62" fill="none" stroke="#2a2b31" stroke-width="18"/>${Ln("M-140,10 L0,20 L140,10", 16, "#2a2b31")}${E(0, 18, 40, 20, "#2a2b31", 5)}</g>`;
    // жақтау: тіректер мен шатыр
    d += `<path d="M-470,-300 L-470,-330 L-398,-338 L-330,-826 L330,-826 L398,-338 L470,-330 L470,-300 L-470,-300Z M-440,-310 L-440,-880 L440,-880 L440,-310Z" fill="${col}" fill-rule="evenodd" stroke="${INK}" stroke-width="7"/>`;
    d += P("M-470,-300 L-440,-310 L-440,-880 L-360,-900 L360,-900 L440,-880 L440,-310 L470,-300 L470,-338 L398,-338 L330,-826 L-330,-826 L-398,-338 L-470,-338Z", col, 7);
    d += Ln("M-330,-826 L330,-826", 5, "#9aa1ab");
    // айна
    d += Ln("M0,-826 L0,-790", 8) + R(-70, -800, 140, 44, "#34343c", 5, 12) + RF(-58, -792, 116, 28, "#a9c6db", 8);
    // капот, алды
    d += P("M-470,-300 L470,-300 L500,-60 L-500,-60Z", col, 7) + Ln("M-300,-290 Q-320,-160 -330,-70 M300,-290 Q320,-160 330,-70", 4, CAR.shade);
    d += P("M-500,-60 L500,-60 L500,90 L-500,90Z", CAR.shade, 7);
    d += R(-300, -40, 600, 100, "#2a2b31", 6, 10);
    for (let i = 0; i < 9; i++) d += Ln(`M${-280 + i * 70},-30 L${-280 + i * 70},50`, 4, "#55565f");
    for (const hx of [-420, -340, 340, 420]) d += C(hx, 10, 36, o.lights ? "#fff7b0" : "#eef3f8", 6) + C(hx, 10, 16, "#ffffff", 3);
    d += R(-520, 90, 1040, 40, CAR.chrome, 6, 12);
    d += R(-110, 52, 220, 60, "#ffffff", 5, 6) + T(0, 96, o.plateText || "777 ABZ 02", 30, INK);
    d += R(-470, 130, 140, 90, "#2a2b31", 6, 14) + R(330, 130, 140, 90, "#2a2b31", 6, 14);
    // бүйір айналар
    if (o.mirrorL !== false) d += P("M-470,-360 L-560,-380 L-560,-300 L-480,-300Z", col, 6);
    if (o.mirrorR !== false) d += P("M470,-360 L560,-380 L560,-300 L480,-300Z", col, 6);
    // тазалағыштар
    d += Ln("M-340,-344 L-60,-372 M60,-344 L330,-372", 8, "#2a2b31");
    return d;
  }
  // иісі бар «шырша» (айнадан салбырап тұр): ang — тербелу бұрышы
  function freshener(ang) {
    return `<g transform="translate(0,-780) rotate(${f(ang || 0)})">${Ln("M0,0 L0,90", 3)}${P("M0,80 L36,150 L18,150 L44,200 L22,200 L48,250 L-48,250 L-22,200 L-44,200 L-18,150 L-36,150Z", "#58b368", 5)}${RF(-6, 250, 12, 18, "#58b368")}</g>`;
  }
  function wmelon(x, y, r, rot, o) {
    o = o || {};
    if (o.smash) {
      // жарылған: қызыл ішкі + тұқым
      let d = P(`M${-r * 1.4},0 Q${-r * 1.2},${-r * 0.7} ${-r * 0.3},${-r * 0.6} Q0,${-r * 0.9} ${r * 0.4},${-r * 0.5} Q${r * 1.3},${-r * 0.6} ${r * 1.5},0Z`, "#ff5b6e", 6);
      for (let i = 0; i < 6; i++) d += `<ellipse cx="${f(-r + i * r * 0.4)}" cy="${f(-r * 0.25 - (i % 2) * r * 0.15)}" rx="5" ry="8" fill="${INK}"/>`;
      d += P(`M${-r * 1.7},4 Q${-r * 1.6},${-r * 0.3} ${-r * 1.3},${-r * 0.2} L${-r * 1.2},6Z`, "#3f8f3f", 5) + P(`M${r * 1.4},6 Q${r * 1.6},${-r * 0.4} ${r * 1.9},4Z`, "#3f8f3f", 5);
      return g(x, y, 1, d);
    }
    let d = C(0, 0, r, "#3f8f3f", 6);
    for (let i = -2; i <= 2; i++) d += Ln(`M${f(i * r * 0.36)},${f(-r * 0.94)} Q${f(i * r * 0.5)},0 ${f(i * r * 0.36)},${f(r * 0.94)}`, Math.max(4, r * 0.12), "#255e2a");
    d += Ln(`M${f(-r * 0.5)},${f(-r * 0.55)} Q${f(-r * 0.3)},${f(-r * 0.75)} 0,${f(-r * 0.8)}`, Math.max(3, r * 0.08), "#9fd39a", ' opacity="0.8"');
    return g(x, y, 1, d, rot);
  }
  // кузовтағы қарбыздар: [x, y, r, rot] (жүк көлігінің жергілікті координаттары, төменнен жоғары)
  function truckMelons() {
    const r = rng(17);
    const m = [];
    for (let row = 0; row < 5; row++) for (let i = 0; i < 7 - row; i++) m.push([-880 + 70 + i * 120 + row * 60 + (r() - 0.5) * 20, -470 - row * 96 + (r() - 0.5) * 10, 64 + r() * 10, r() * 360]);
    return m;
  }
  // жүк көлігі (кабинасы алдында, оңға қарайды) + қарбыз үйіндісі
  function truck(x, y, s, o) {
    o = o || {};
    const wheel = (wx) => `<g transform="translate(${wx},-110) rotate(${f(o.wheel || 0)})">${C(0, 0, 108, "#2a2b31", 7)}${C(0, 0, 48, "#c9cdd4", 5)}</g>`;
    let d = "";
    // қарбыз үйіндісі (кузовта)
    const pile = o.pile == null ? 1 : o.pile;
    const melons = truckMelons();
    const keep = Math.round(melons.length * pile);
    for (let i = 0; i < keep; i++) { const m = melons[i]; if (o.skip && o.skip.includes(i)) continue; d += wmelon(m[0], m[1], m[2], m[3]); }
    d += P("M-900,-420 L-80,-420 L-80,-200 L-900,-200Z", "#5a7fc4", 7) + Ln("M-900,-330 L-80,-330", 4, "#4a6cad");
    for (let i = 0; i < 6; i++) d += Ln(`M${-860 + i * 140},-420 L${-860 + i * 140},-200`, 4, "#4a6cad");
    d += P("M-60,-200 L-60,-640 Q-60,-680 -20,-680 L200,-680 Q260,-680 280,-620 L330,-420 L340,-200Z", "#e8eef5", 7);
    d += P("M-20,-640 L190,-640 Q230,-640 245,-600 L280,-460 L-20,-460Z", CAR.glass, 5) + Ln("M40,-620 L100,-500", 8, "#ffffff", ' opacity="0.6"');
    d += R(300, -300, 60, 50, "#fff7b0", 4, 8) + R(-920, -230, 1290, 30, "#3b3f4a", 5, 6);
    if (o.driver) d += o.driver;
    d += wheel(-700) + wheel(-480) + wheel(180);
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot || 0)}) scale(${f(s)})">${d}</g>`;
  }
  function bus(x, y, s, o) {
    o = o || {};
    let d = R(-760, -720, 1520, 600, o.col || "#f2c14e", 8, 50) + RF(-740, -330, 1480, 50, "#d4512e");
    const r = rng(23);
    for (let i = 0; i < 5; i++) {
      d += R(-700 + i * 280, -660, 230, 230, "#a9d3f0", 6, 14);
      for (let k = 0; k < 2; k++) if (r() < 0.8) d += C(-640 + i * 280 + k * 110, -470, 46, "#ffffff", 5) + P(`M${-686 + i * 280 + k * 110},-480 Q${-680 + i * 280 + k * 110},-530 ${-640 + i * 280 + k * 110},-528 Q${-600 + i * 280 + k * 110},-530 ${-594 + i * 280 + k * 110},-480Z`, ["#2a2522", "#5a3d2b", "#6f737d"][Math.floor(r() * 3)], 4);
    }
    d += C(-480, -120, 100, "#2a2b31", 7) + C(480, -120, 100, "#2a2b31", 7) + C(-480, -120, 40, "#c9cdd4", 5) + C(480, -120, 40, "#c9cdd4", 5);
    return g(x, y, s, d, o.rot);
  }
  function trafficLight(x, y, s, state) {
    let d = Ln("M0,0 L0,-900", 20, "#3b3f4a") + Ln("M0,0 L0,-900", 8, "#55565f");
    d += R(-70, -1280, 140, 400, "#2a2b31", 7, 24);
    const on = (k, c) => (state === k ? `<circle cx="0" cy="${-1210 + ["r", "y", "g"].indexOf(k) * 120}" r="70" fill="${c}" opacity="0.35"/>` + C(0, -1210 + ["r", "y", "g"].indexOf(k) * 120, 44, c, 5) : C(0, -1210 + ["r", "y", "g"].indexOf(k) * 120, 44, "#4a4b52", 5));
    d += on("r", "#ff4b4b") + on("y", "#ffc94b") + on("g", "#4be07a");
    return g(x, y, s, d);
  }
  function pedals(press) {
    // press: [c, g, t] 0..1
    let d = RF(-700, -1400, 1400, 2400, "#2a2b31") + RF(-700, 200, 1400, 800, "#1d1e23");
    d += Ln("M-700,180 L700,180", 6, "#44454d");
    const lab = ["СЦЕПЛЕНИЕ", "ТЕЖЕГІШ", "ГАЗ"];
    [-300, 0, 280].forEach((px, i) => {
      const k = (press && press[i]) || 0;
      d += Ln(`M${px},-600 L${px},${f(-160 + k * 60)}`, 26, "#55565f");
      d += `<g transform="translate(${px},${f(-80 + k * 60)})">${R(i === 2 ? -60 : -95, -80, i === 2 ? 120 : 190, i === 2 ? 220 : 150, "#3b3f4a", 7, 18)}${Ln(`M${i === 2 ? -40 : -70},-40 L${i === 2 ? 40 : 70},-40 M${i === 2 ? -40 : -70},0 L${i === 2 ? 40 : 70},0 M${i === 2 ? -40 : -70},40 L${i === 2 ? 40 : 70},40`, 6, "#55565f")}</g>`;
      d += TB(px, 260, lab[i], 46, "#ffffff");
    });
    return d;
  }
  function radio(x, y, s, t) {
    let d = R(-330, -150, 660, 300, "#3b3f4a", 8, 20) + R(-300, -120, 360, 120, "#1d1e23", 5, 10);
    d += R(-280, -100, 320, 80, "#7d6b55", 4, 6) + C(-200, -60, 26, "#ffffff", 4) + C(-40, -60, 26, "#ffffff", 4) + RF(-200, -86, 160, 52, "#ffffff", 0, ' opacity="0.25"');
    d += C(180, -60, 70, "#55565f", 6) + C(180, -60, 30, "#9aa1ab", 4);
    for (let i = 0; i < 5; i++) d += R(-300 + i * 72, 30, 56, 70, "#9aa1ab", 4, 8);
    d += TB(160, 100, "FM", 34, "#f6d55c");
    return g(x, y, s, d);
  }
  function speedo(x, y, s, val) {
    let d = C(0, 0, 230, "#1d1e23", 8) + C(0, 0, 200, "#2a2b31", 4);
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (0.8 + i * 1.4 / 12); d += Ln(`M${f(Math.cos(a) * 170)},${f(Math.sin(a) * 170)} L${f(Math.cos(a) * 196)},${f(Math.sin(a) * 196)}`, i % 2 ? 4 : 8, "#ffffff"); if (i % 2 === 0) d += T(f(Math.cos(a) * 130), f(Math.sin(a) * 130 + 12), String(i * 15), 30, "#ffffff"); }
    const a = Math.PI * (0.8 + (val / 180) * 1.4);
    d += Ln(`M0,0 L${f(Math.cos(a) * 180)},${f(Math.sin(a) * 180)}`, 12, "#ff5b4b") + C(0, 0, 26, "#ff5b4b", 5) + T(0, 110, "км/сағ", 28, "#9aa1ab");
    return g(x, y, s, d);
  }
  function money(x, y, s, rot) {
    return g(x, y, s, R(-150, -70, 300, 140, "#9fd09a", 6, 8) + `<ellipse cx="0" cy="0" rx="46" ry="46" fill="none" stroke="#5c9a58" stroke-width="6"/>` + T(0, 14, "₸", 54, "#2f6b2c") + T(-100, -30, "10 000", 22, "#2f6b2c") + T(100, 50, "10 000", 22, "#2f6b2c"), rot);
  }
  function flyer(x, y, s, rot) {
    let d = R(-230, -320, 460, 640, "#ffffff", 7, 10) + RF(-230, -320, 460, 150, "#e85d75") + TB(0, -228, "АВТОМЕКТЕП", 50, "#ffffff");
    d += g(0, -40, 0.32, car6(0, 0, 1, { col: "#f6d55c" }).replace(/^<g transform="[^"]*">/, "<g>"));
    d += TB(0, 120, "3 АЙ", 54, INK) + TB(0, 230, "150 000 ₸", 70, "#e85d75");
    return g(x, y, s, d, rot);
  }
  function grandmaBags(x, y, s) {
    let d = "";
    for (const bx of [-120, 120]) d += R(bx - 70, -260, 140, 170, "#7cc47a", 6, 20) + P(`M${bx - 40},-260 Q${bx},-330 ${bx + 40},-260`, "none", 8) + C(bx - 30, -280, 22, "#f2a541", 4) + R(bx + 4, -320, 22, 70, "#f6d55c", 4, 6);
    return g(x, y, s, d);
  }
  function pigeon(x, y, s, t, seed) {
    const peck = Math.max(0, Math.sin((t || 0) * 5 + (seed || 0))) * 20;
    let d = E(0, -60, 70, 46, "#b7bcc6", 5) + P("M60,-70 L110,-60 L60,-40Z", "#9da3ae", 4);
    d += g(-60, -100 + peck * 0.6, 1, C(0, 0, 30, "#9da3ae", 5) + C(-8, -6, 5, INK, 0) + P("M-28,0 L-46,6 L-28,10Z", "#f2a541", 3));
    d += Ln("M-10,-16 L-14,0 M14,-16 L18,0", 5, "#e8735a");
    return g(x, y, s, d);
  }

  // ---------- үй / телефон / тамақ ----------
  function plov(x, y, s, o) {
    o = o || {};
    let d = E(0, 0, 330, 90, "#ffffff", 7) + E(0, -6, 280, 70, "#f2f6fb", 0);
    for (let i = 0; i < 14; i++) d += Ln(`M${f(-240 + i * 36)},${f(-20 - (i % 2) * 6)} L${f(-210 + i * 36)},${f(-14 - (i % 3) * 6)}`, 6, "#c46b2f");
    d += P("M-230,-10 Q-200,-160 0,-180 Q200,-160 230,-10 Q0,20 -230,-10Z", "#f6d89a", 6);
    const r = rng(o.seed || 5);
    for (let i = 0; i < 40; i++) d += `<ellipse cx="${f(-180 + r() * 360)}" cy="${f(-40 - r() * 110)}" rx="9" ry="4" fill="#fff6dc" stroke="#d9b56a" stroke-width="2"/>`;
    for (let i = 0; i < 9; i++) d += Ln(`M${f(-150 + r() * 300)},${f(-40 - r() * 100)} l${f(20 + r() * 20)},${f(-6 + r() * 12)}`, 9, "#e8735a");
    for (let i = 0; i < 5; i++) d += P(`M${f(-120 + i * 60)},${f(-120 - (i % 2) * 30)} q30,-30 60,0 q-30,20 -60,0Z`, "#8a4b2f", 4);
    if (o.steam) d += o.steam;
    return g(x, y, s, d);
  }
  function manty(x, y, s, sq) {
    const k = sq || 1;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * (2 - k))},${f(s * k)})">${P("M-80,0 Q-90,-70 -30,-96 Q0,-120 30,-96 Q90,-70 80,0 Q0,24 -80,0Z", "#fbf3e2", 6)}${Ln("M-40,-80 Q0,-60 40,-80 M-20,-100 Q0,-80 20,-100", 4, "#d9c9a6")}</g>`;
  }
  function wallCarpet(x, y, w, h) {
    let d = R(x, y, w, h, "#9e2a2b", 8, 10) + `<rect x="${f(x + 34)}" y="${f(y + 34)}" width="${f(w - 68)}" height="${f(h - 68)}" fill="#c0392b" stroke="#f2c14e" stroke-width="8"/>`;
    d += `<rect x="${f(x + 90)}" y="${f(y + 90)}" width="${f(w - 180)}" height="${f(h - 180)}" fill="#7a1f2b" stroke="#f2c14e" stroke-width="5"/>`;
    for (let i = 0; i < 3; i++) d += horn(x + w / 2, y + h * (0.28 + i * 0.22), 1.6, "#f2c14e");
    d += ornRow(x + 80, x + w - 80, y + 62, 110, 0.6, "#f6d55c") + ornRow(x + 80, x + w - 80, y + h - 62, 110, 0.6, "#f6d55c");
    for (let i = 0; i < 14; i++) d += Ln(`M${f(x + 20 + i * (w - 40) / 13)},${f(y + h)} l0,40`, 5, "#f2c14e");
    return d;
  }
  function sofa(x, y, s, col) {
    const c = col || "#5a7fc4";
    let d = R(-560, -520, 1120, 330, c, 7, 60) + R(-640, -380, 180, 380, c, 7, 50) + R(460, -380, 180, 380, c, 7, 50);
    d += R(-480, -260, 470, 200, c, 6, 30) + R(10, -260, 470, 200, c, 6, 30) + RF(-560, -60, 1120, 50, "#3b3f4a");
    d += Ln("M-480,-420 Q-245,-380 -10,-420 M10,-420 Q245,-380 480,-420", 4, "#41609c");
    return g(x, y, s, d);
  }
  function tv(x, y, s, t) {
    let d = R(-380, -620, 760, 450, "#2a2b31", 8, 16) + `<rect x="-350" y="-590" width="700" height="390" fill="url(#tvG)"/>` + Ln("M-120,-170 L-160,-80 M120,-170 L160,-80", 12, "#3b3f4a");
    d += P("M-300,-300 Q-200,-420 -60,-340 T220,-360 L300,-220 L-300,-220Z", "#7cc47a", 0) + C(180 + Math.sin((t || 0)) * 30, -480, 40, "#fff3b0", 0);
    return `<defs>${grad("tvG", [[0, "#6fb7e8"], [1, "#bfe3fb"]])}</defs>` + g(x, y, s, d);
  }
  function panelBlock(x, y, w, h, seed, o) {
    o = o || {};
    const r = rng(seed || 1);
    const col = o.col || ["#d9cfc0", "#cfd6dc", "#e3d2b8", "#c9d4c4"][Math.floor(r() * 4)];
    let d = R(x, y - h, w, h, col, 7, 4);
    const fl = Math.floor(h / 150), cols = Math.floor(w / 130);
    for (let i = 0; i < fl; i++) for (let k = 0; k < cols; k++) {
      const wx = x + 40 + k * ((w - 80) / cols) + 10, wy = y - h + 40 + i * 150;
      const lit = o.night ? r() < 0.55 : false;
      d += RF(wx, wy, 70, 90, o.night ? (lit ? "#ffd977" : "#2c3550") : "#9fc6e0", 3) + `<rect x="${f(wx)}" y="${f(wy)}" width="70" height="90" fill="none" stroke="${INK}" stroke-width="4"/>`;
      if (!o.night && (i + k + seed) % 4 === 0) d += R(wx - 14, wy + 70, 98, 46, col, 4, 3);
    }
    return d;
  }
  function kiosk(x, y, s, label, col) {
    let d = R(-260, -560, 520, 560, col || "#7cb8d8", 7, 6) + R(-280, -620, 560, 80, "#e85d75", 7, 10) + TB(0, -566, label, 44, "#ffffff");
    d += R(-220, -500, 440, 400, "#c9cdd4", 6, 4);
    for (let i = 0; i < 9; i++) d += Ln(`M-220,${-470 + i * 42} L220,${-470 + i * 42}`, 4, "#9aa1ab");
    return g(x, y, s, d);
  }
  function tree(x, y, s, col) {
    return g(x, y, s, P("M-26,0 L-18,-300 L18,-300 L26,0Z", "#8a5a3b", 6) + C(0, -420, 170, col || "#6fb36a", 7) + C(-110, -330, 110, col || "#6fb36a", 7) + C(110, -330, 110, col || "#6fb36a", 7) + C(-60, -470, 50, "#8fd08a", 0));
  }
  function streetLamp(x, y, s, on) {
    return g(x, y, s, Ln("M0,0 L0,-900 Q0,-960 80,-960 L140,-960", 18, "#3b3f4a") + P("M100,-980 L190,-980 L180,-930 L110,-930Z", on ? "#fff3b0" : "#c9cdd4", 5) + (on ? `<path d="M110,-930 L180,-930 L320,-200 L-30,-200Z" fill="#fff3b0" opacity="0.18"/>` : ""));
  }
  function cloud(x, y, s) { return g(x, y, s, P("M-160,0 Q-180,-80 -100,-90 Q-80,-160 0,-150 Q60,-200 120,-130 Q200,-130 190,-50 Q230,0 160,10 L-140,10Z", "#ffffff", 6)); }
  function sky(top, bot, id) { return `<defs>${grad(id, [[0, top], [1, bot]])}</defs>` + RF(-3000, -3600, 6000, 4000, `url(#${id})`); }

  // ================= ФОНДАР =================
  // той залы — артқы қабырға, LED-экран, сахна; tables: дөңгелек үстелдер қатары (орта қабатта)
  BG.toiHall = (opts) => {
    opts = opts || {};
    let far = `<defs>${grad("thW", [[0, "#5a2f4a"], [0.5, "#a5546e"], [1, "#e7b98f"]])}</defs>` + RF(-3000, -3400, 6000, 3800, "url(#thW)");
    for (let x = -2600; x <= 2600; x += 360) far += P(`M${x - 170},-2500 Q${x},-2200 ${x + 170},-2500 L${x + 150},-200 Q${x},-260 ${x - 150},-200Z`, "#f4e2c8", 4) + Ln(`M${x - 60},-2400 Q${x - 40},-1200 ${x - 70},-260 M${x + 60},-2400 Q${x + 40},-1200 ${x + 70},-260`, 4, "#e2c9a3");
    if (opts.back) {
      far += R(-420, -1500, 840, 1360, "#7a4a2f", 8, 10) + Ln("M0,-1500 L0,-140", 6) + C(-60, -800, 20, "#e6b544", 4) + C(60, -800, 20, "#e6b544", 4);
      for (const wx of [-1500, 1100]) far += R(wx, -1700, 400, 900, "#2c3550", 7, 8) + Ln(`M${wx + 200},-1700 L${wx + 200},-800 M${wx},-1300 L${wx + 400},-1300`, 6, "#f4e2c8");
      far += RF(-3000, -140, 6000, 60, "#5c2234");
      for (const [cx, cy] of [[-1400, -2050], [0, -2250], [1400, -2050]]) far += chandelier(cx, cy, 1.25, 0);
      let mid0 = `<defs>${grad("thF", [[0, "#d9b48a"], [1, "#a9825f"]])}</defs>` + RF(-3000, -140, 6000, 2400, "url(#thF)");
      for (let i = 0; i < 9; i++) mid0 += Ln(`M${-3000},${-60 + i * 120} L3000,${-60 + i * 120}`, 3, "#c49a6c");
      return { far, mid: mid0, near: "" };
    }
    far += ledScreen(0, -1150, 1300, 560, "ДӘУЛЕТ", "АРУЖАН", 0);
    // сахна
    far += P("M-1500,-320 L1500,-320 L1600,-140 L-1600,-140Z", "#7a2f45", 7) + RF(-1600, -140, 3200, 60, "#5c2234");
    for (const sx of [-1, 1]) far += R(sx * 980 - 120, -820, 240, 520, "#2a2c35", 7, 16) + C(sx * 980, -680, 70, "#44454d", 6) + C(sx * 980, -470, 100, "#44454d", 6) + C(sx * 980, -470, 40, "#2a2c35", 4);
    // гүл аркасы
    const r = rng(5);
    for (let i = 0; i < 46; i++) { const a = Math.PI * (i / 45); const cx = -Math.cos(a) * 820, cy = -380 - Math.sin(a) * 1000; far += C(cx + (r() - 0.5) * 50, cy + (r() - 0.5) * 50, 44 + r() * 24, ["#ffffff", "#ffd1dc", "#f2a5b8", "#fff3d6"][i % 4], 4); }
    for (const [cx, cy] of [[-1400, -2050], [0, -2250], [1400, -2050]]) far += chandelier(cx, cy, 1.25, 0);
    let mid = `<defs>${grad("thF", [[0, "#d9b48a"], [1, "#a9825f"]])}</defs>` + RF(-3000, -140, 6000, 2400, "url(#thF)");
    for (let i = 0; i < 9; i++) mid += Ln(`M${-3000},${-60 + i * 120} L3000,${-60 + i * 120}`, 3, "#c49a6c");
    let near = "";
    if (opts.tables) {
      // қонақтар мен үстелдер — бірнеше қатар (алыстан жақынға)
      const rows = [[-40, 0.5, 6, 640], [260, 0.66, 5, 760], [620, 0.85, 4, 900]];
      rows.forEach(([ry, sc, n, gap], ri) => {
        for (let i = 0; i < n; i++) {
          const tx = (i - (n - 1) / 2) * gap + (ri % 2) * gap * 0.25;
          if (!opts.empty) mid += guest(tx - 150 * sc, ry - 60 * sc, sc, 100 + ri * 17 + i * 5, 0) + guest(tx + 150 * sc, ry - 60 * sc, sc, 200 + ri * 17 + i * 5, 0);
          mid += roundTable(tx, ry + 120 * sc, sc, { seed: ri * 7 + i });
        }
      });
    }
    return { far, mid, near };
  };
  // асаба сахнасы (жақын): экран + гүлдер, синтезатор
  BG.toiStage = () => {
    const L = BG.toiHall();
    return { far: L.far, mid: L.mid + synth(900, -140, 1.2), near: "" };
  };
  // үстел (жақын план): дастарқан, салаттар
  function tableTop() {
    let mid = P("M-1400,-150 L1400,-150 L1600,900 L-1600,900Z", "#ffffff", 8) + Ln("M-1400,-120 L1400,-120", 5, "#e6d8b8");
    const cols = ["#e85d75", "#f2a541", "#7cc47a", "#f6d55c", "#c76b4f", "#9fd0e8", "#ff8fa3", "#b58ad9", "#e8735a"];
    for (let i = 0; i < 9; i++) { const bx = -900 + (i % 5) * 450 + (i >= 5 ? 220 : 0), by = i >= 5 ? 380 : 40; mid += E(bx, by + 30, 170, 60, "#ffffff", 6) + E(bx, by, 140, 56, cols[i], 5) + E(bx - 40, by - 14, 40, 14, "#ffffff", 0, ' opacity="0.4"'); }
    return mid;
  }
  BG.toiTable = () => BG.toiHall();
  // бастың ішіндегі бос бөлме
  BG.headRoom = () => {
    let far = RF(-3000, -3400, 6000, 3500, "#f1f1f4") + Ln("M-3000,0 L3000,0", 6) + RF(-3000, 0, 6000, 1500, "#e2e2e8");
    far += Ln("M0,-2400 L0,-1300", 5) + P("M-60,-1300 Q-80,-1180 0,-1150 Q80,-1180 60,-1300Z", "#ffffff", 6);
    return { far, mid: "", near: "" };
  };
  // базар (естелік — сепия)
  BG.bazaar = () => {
    let far = sky("#fbe3b8", "#f6c98d", "bzS") + RF(-3000, -200, 6000, 1400, "#c9a26f");
    for (let i = 0; i < 7; i++) far += g(-1800 + i * 600, -200, 1, R(-240, -700, 480, 500, ["#e85d75", "#5a7fc4", "#f2a541", "#7cc47a"][i % 4], 7, 6) + P("M-280,-700 L280,-700 L240,-820 L-240,-820Z", "#ffffff", 6) + R(-200, -460, 400, 120, "#8a5a3b", 5, 4));
    let mid = "";
    for (let i = 0; i < 9; i++) mid += crowdPerson(-1600 + i * 400, 40, 0.75, null, 400 + i * 13);
    return { far, mid, near: "" };
  };
  // аула (панель үйлер) + гараж
  BG.courtyard = (opts) => {
    opts = opts || {};
    let far = sky(opts.night ? "#1f2a4d" : "#8fc8f0", opts.night ? "#4a3f6b" : "#d8efff", "cyS");
    if (!opts.night) far += cloud(-900, -2300, 1.4) + cloud(800, -2600, 1.1);
    far += panelBlock(-2400, -150, 1500, 2100, 3, opts) + panelBlock(-700, -150, 1400, 2400, 7, opts) + panelBlock(900, -150, 1500, 2000, 11, opts);
    let mid = RF(-3000, -150, 6000, 2600, "#8b8e96") + RF(-3000, -150, 6000, 30, "#6f727a");
    for (let i = -6; i < 7; i++) mid += Ln(`M${i * 520},380 L${i * 520 + 300},380`, 14, "#c9cdd4");
    mid += tree(-1200, -150, 1.4) + tree(1250, -150, 1.2, "#5fa35a");
    return { far, mid, near: "" };
  };
  // бос базар алаңы (жексенбі таңы)
  BG.lot = () => {
    let far = sky("#f7c6a3", "#fdeacb", "ltS") + `<circle cx="700" cy="-1100" r="260" fill="#fff3c4" opacity="0.8"/>`;
    far += panelBlock(-2600, -240, 1400, 1300, 21) + panelBlock(1400, -240, 1300, 1500, 25);
    for (let i = 0; i < 5; i++) far += kiosk(-1000 + i * 520, -240, 0.9, ["НАН", "ЖЕМІС", "ЕТ", "СҮТ", "КИІМ"][i], ["#7cb8d8", "#9fd09a", "#f2a5b8", "#f6d55c", "#b58ad9"][i]);
    let mid = RF(-3000, -240, 6000, 2700, "#7d8088");
    for (let i = -8; i < 9; i++) mid += Ln(`M${i * 360},-120 L${i * 360 - 200},700`, 10, "#e8e8e8", ' opacity="0.7"');
    return { far, mid, near: "" };
  };
  // өрге шығатын көше: жол y = −SLOPE·x (оңға қарай көтеріледі)
  const SLOPE = 0.27;
  BG.SLOPE = SLOPE;
  BG.hill = (opts) => {
    opts = opts || {};
    let far = sky("#9cd2f2", "#e3f4ff", "hlS") + cloud(-600, -2800, 1.3) + cloud(1100, -2400, 1);
    for (let i = 0; i < 6; i++) { const bx = -2600 + i * 900; far += panelBlock(bx, -SLOPE * (bx + 450) * 0.55 - 200, 760, 1500 + (i % 3) * 300, 31 + i); }
    let mid = `<path d="M-4000,${f(SLOPE * 4000)} L4000,${f(-SLOPE * 4000)} L4000,3000 L-4000,3000Z" fill="#7d8088" stroke="${INK}" stroke-width="7"/>`;
    mid += `<path d="M-4000,${f(SLOPE * 4000 + 260)} L4000,${f(-SLOPE * 4000 + 260)}" stroke="#e8e8e8" stroke-width="14" stroke-dasharray="160 140"/>`;
    mid += `<path d="M-4000,${f(SLOPE * 4000 - 40)} L4000,${f(-SLOPE * 4000 - 40)} L4000,${f(-SLOPE * 4000 - 90)} L-4000,${f(SLOPE * 4000 - 90)}Z" fill="#c9cdd4" stroke="${INK}" stroke-width="5"/>`;
    if (opts.light !== false) mid += "";
    return { far, mid, near: "" };
  };
  // тыныш көше (анамның сабағы) — night: түнгі жол
  BG.road = (opts) => {
    opts = opts || {};
    const n = opts.night;
    let far = sky(n ? "#141a33" : "#a5d8f5", n ? "#3a3360" : "#eef8ff", n ? "rdN" : "rdS");
    if (n) for (let i = 0; i < 40; i++) far += C(-2600 + ((i * 397) % 5200), -3200 + ((i * 211) % 2400), 4 + (i % 3) * 2, "#fff7d6", 0);
    for (let i = 0; i < 6; i++) far += panelBlock(-2800 + i * 950, -200, 820, 1300 + (i % 2) * 400, 41 + i, { night: n });
    let mid = RF(-3000, -200, 6000, 2600, n ? "#3f424b" : "#7d8088") + Ln("M-3000,300 L3000,300", 14, "#e8e8e8", ' stroke-dasharray="200 160"');
    for (let i = 0; i < 6; i++) mid += n ? streetLamp(-2500 + i * 1000, -200, 1, true) : tree(-2500 + i * 1000, -200, 1.1);
    return { far, mid, near: "" };
  };
  // көлік ішінде (алдыңғы әйнектен): loc — сыртқы көрініс
  BG.carInt = (loc, opts) => {
    const L = BG[loc || "road"](opts);
    return { far: L.far + L.mid, mid: carCabin(opts), near: "" };
  };
  // ас үй (үй)
  BG.kitchen = (opts) => {
    opts = opts || {};
    let far = RF(-3000, -3400, 6000, 3400, "#f3e3c3");
    for (let x = -3000; x < 3000; x += 120) far += Ln(`M${x},-3400 L${x},0`, 3, "#ead6ae");
    far += windowFrame(-1050, -1600, 600, 700, opts.night ? "#2c3550" : "#bfe3fb");
    if (!opts.night) far += tree(-760, -900, 0.7, "#ffc0d0") + tree(-560, -950, 0.5, "#ffd1dc");
    far += R(150, -1700, 1100, 520, "#9fd0c0", 7, 10) + Ln("M700,-1700 L700,-1180", 5) + R(150, -1100, 1100, 1100, "#8cc2b2", 7, 10);
    for (const kx of [420, 980]) far += R(kx - 30, -1000, 60, 16, "#d7dbe2", 4, 6);
    far += R(-1700, -1900, 480, 1900, "#e8eef5", 7, 30) + Ln("M-1700,-1150 L-1220,-1150", 5) + R(-1290, -1500, 20, 200, "#9aa1ab", 4, 6) + R(-1290, -1000, 20, 260, "#9aa1ab", 4, 6);
    let mid = RF(-3000, 0, 6000, 1600, "#c9a77f") + Ln("M-3000,0 L3000,0", 6);
    for (let x = -3000; x < 3000; x += 300) mid += Ln(`M${x},0 L${x - 200},1600`, 3, "#b8956c");
    return { far, mid, near: "" };
  };
  // ас үй үстелі (алдыңғы план): шай, нан
  BG.kitchenTable = (x, y, s) => g(x, y, s, P("M-700,-300 L700,-300 L760,-220 L-760,-220Z", "#e8735a", 7) + P("M-760,-220 L760,-220 L760,-170 L-760,-170Z", "#c45a44", 6) + Ln("M-600,-170 L-600,300 M600,-170 L600,300", 26, "#8a5a3b") + E(-380, -320, 70, 22, "#ffffff", 5) + R(-420, -400, 80, 80, "#ffffff", 5, 10) + E(300, -300, 150, 34, "#f2c27a", 6));
  // Сәуле апаның қонақ бөлмесі: қабырға кілемі, диван, теледидар, есік (сол жақта)
  BG.living = (opts) => {
    opts = opts || {};
    let far = RF(-3000, -3400, 6000, 3400, "#e9dcc7");
    for (let x = -3000; x < 3000; x += 160) far += Ln(`M${x},-3400 L${x},0`, 3, "#ddcdb3");
    far += wallCarpet(-700, -1950, 1400, 1100);
    far += R(-2200, -1700, 560, 1700, opts.doorOpen ? "#3b2a22" : "#b07a4f", 7, 6) + C(-1720, -820, 18, "#e6b544", 4);
    if (opts.doorOpen) far += P("M-2200,-1700 L-2600,-1800 L-2600,100 L-2200,0Z", "#b07a4f", 7);
    far += tv(1500, -300, 1.1) + R(1050, -300, 900, 300, "#8a5a3b", 7, 10);
    let mid = RF(-3000, 0, 6000, 1600, "#a8794f") + Ln("M-3000,0 L3000,0", 6) + E(0, 300, 1400, 260, "#c0392b", 7) + E(0, 300, 1200, 200, "#9e2a2b", 0);
    mid += ornRow(-900, 900, 300, 200, 0.8, "#f2c14e");
    return { far, mid: mid + sofa(0, -40, 1), near: "" };
  };
  // түнгі қала (жоғарыдан қарағандай): 143 терезе
  BG.cityNight = () => {
    let far = sky("#0e1430", "#2d2a55", "cnS");
    for (let i = 0; i < 60; i++) far += C(-2800 + ((i * 397) % 5600), -3300 + ((i * 263) % 1600), 3 + (i % 3) * 2, "#fff7d6", 0);
    far += `<circle cx="900" cy="-2600" r="160" fill="#fff3c4"/>` + C(960, -2640, 140, "#2d2a55", 0);
    for (let i = 0; i < 8; i++) far += panelBlock(-3000 + i * 760, 400 - (i % 2) * 200, 680, 1800 + (i % 3) * 500, 61 + i, { night: true });
    return { far, mid: "", near: "" };
  };
  // студия (жүргізуші) — тік кадрға арналған (songy host бар)

  G.REELS_BG = { truckMelons, tableTop, horn, ornRow, ornBorder, sparkle, heart, chandelier, ledScreen, roundTable, guest, cat, synth, folder, invite, ice, CAR, car6, carCabin, carFront, freshener, wmelon, truck, bus, trafficLight, pedals, radio, speedo, money, flyer, grandmaBags, pigeon, plov, manty, wallCarpet, sofa, tv, panelBlock, kiosk, tree, streetLamp, cloud, sky, E, g, TB, SLOPE, grad };
})(typeof window !== "undefined" ? window : globalThis);
