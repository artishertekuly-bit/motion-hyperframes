/* «Қазақтың тойы: 200 адам және даяшы Артур» — фондар, дастархан мен той проптары (SVG).
 * Reels вертикал (1080×1920) форматына бейімделген.
 */
(function (G) {
  "use strict";
  const B = G.SONGY_BG, RIG = G.ArturRig;
  const { BG, P, F, Ln, RF, C, T, INK, rng, f } = B;
  const R = B.R;

  const grad = (id, stops, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 || 0}" y2="${y2 == null ? 1 : y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;

  // Бас табақ (ыстық ағаш астау: ет, қазы, карта, сорпа буы)
  function hotMeatPlatter(x, y, s, opts) {
    opts = opts || {};
    const steam = opts.steam !== false;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <!-- бу (steam) -->
      ${steam ? `<path d="M-60,-120 Q-80,-180 -50,-240 Q-30,-300 -60,-360" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="8" stroke-linecap="round"/>
        <path d="M0,-140 Q20,-200 0,-260 Q-20,-320 10,-380" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="12" stroke-linecap="round"/>
        <path d="M60,-120 Q40,-180 70,-240 Q90,-300 60,-360" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="8" stroke-linecap="round"/>` : ""}
      <!-- ағаш астау -->
      <ellipse cx="0" cy="-30" rx="180" ry="70" fill="#78350f" stroke="#141418" stroke-width="7"/>
      <ellipse cx="0" cy="-40" rx="160" ry="55" fill="#92400e" stroke="#141418" stroke-width="4"/>
      <!-- ою-өрнек тұтқалары -->
      ${P("M-180,-30 C-220,-30 -220,-60 -180,-60", "none", 8, "#78350f")}
      ${P("M180,-30 C220,-30 220,-60 180,-60", "none", 8, "#78350f")}
      <!-- қамыр (шелпек) -->
      <ellipse cx="0" cy="-48" rx="140" ry="45" fill="#fef08a" stroke="#d97706" stroke-width="3"/>
      <!-- үйілген ет және қазы -->
      <ellipse cx="-40" cy="-65" rx="50" ry="30" fill="#881337" stroke="#141418" stroke-width="5"/>
      <ellipse cx="40" cy="-65" rx="55" ry="32" fill="#9f1239" stroke="#141418" stroke-width="5"/>
      <!-- дөңгелек қазы кесінділері -->
      <circle cx="-20" cy="-75" r="22" fill="#4c0519" stroke="#141418" stroke-width="4"/>
      <circle cx="-20" cy="-75" r="14" fill="#fef08a" stroke="#141418" stroke-width="3"/>
      <circle cx="25" cy="-78" r="24" fill="#4c0519" stroke="#141418" stroke-width="4"/>
      <circle cx="25" cy="-78" r="16" fill="#fef08a" stroke="#141418" stroke-width="3"/>
      <!-- пияз бен тұздық -->
      ${Ln("M-60,-55 Q0,-80 60,-55", 6, "#ffffff")}
      ${Ln("M-40,-70 Q0,-95 40,-70", 6, "#ffffff")}
    </g>`;
  }

  // Сарқыт толы қара пакет (апалардың құпия қаруы)
  function sarkytBag(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <!-- тырсыйып толған қара пакет -->
      ${P("M-70,0 Q-100,-80 -60,-140 Q-30,-170 0,-160 Q30,-170 60,-140 Q100,-80 70,0Z", "#1e293b", 6)}
      <!-- тұтқалары -->
      ${P("M-30,-160 C-30,-210 -10,-210 -10,-160", "none", 8, "#0f172a")}
      ${P("M10,-160 C10,-210 30,-210 30,-160", "none", 8, "#0f172a")}
      <!-- сыртынан білініп тұрған қазы мен алма дөңестері -->
      <ellipse cx="-30" cy="-80" rx="30" ry="20" fill="#334155"/>
      <ellipse cx="25" cy="-60" rx="35" ry="25" fill="#334155"/>
    </g>`;
  }

  // Шашу: 1000 теңге және тиындар
  function shashuCoins(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <!-- 1000 теңге купюрасы -->
      <g transform="rotate(-15)">
        ${R(-80, -45, 160, 90, "#f59e0b", 5)}
        ${R(-70, -35, 140, 70, "#fbbf24", 0)}
        <text x="0" y="10" text-anchor="middle" fill="#78350f" font-family="Montserrat,sans-serif" font-weight="900" font-size="28">1000 ₸</text>
      </g>
      <!-- шашылған тиындар -->
      <circle cx="-60" cy="50" r="16" fill="#e2e8f0" stroke="#141418" stroke-width="4"/>
      <circle cx="0" cy="65" r="18" fill="#fde047" stroke="#141418" stroke-width="4"/>
      <circle cx="70" cy="45" r="16" fill="#e2e8f0" stroke="#141418" stroke-width="4"/>
      <!-- кәмпиттер -->
      <polygon points="-110,35 -90,45 -90,25" fill="#ef4444"/>
      <circle cx="-80" cy="35" r="14" fill="#3b82f6" stroke="#141418" stroke-width="3"/>
      <polygon points="-50,35 -70,45 -70,25" fill="#ef4444"/>
    </g>`;
  }

  // Той үстелі (бауырсақ, жеміс вазасы, сусындар)
  function banquetTable(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <!-- ақ дастархан -->
      ${R(-400, -120, 800, 120, "#ffffff", 6)}
      ${Ln("M-400,-120 L400,-120", 8, "#141418")}
      ${Ln("M-400,-80 L400,-80", 4, "#e2e8f0")}
      <!-- бауырсақ табағы -->
      <ellipse cx="-200" cy="-140" rx="80" ry="30" fill="#f59e0b" stroke="#141418" stroke-width="4"/>
      ${[-240, -200, -160, -220, -180].map((bx, i) => `<ellipse cx="${bx}" cy="${-155 - (i % 2) * 12}" rx="18" ry="12" fill="#d97706" stroke="#141418" stroke-width="3"/>`).join("")}
      <!-- жеміс вазасы (3 қабатты) -->
      ${R(-10, -260, 20, 140, "#d97706", 4)}
      <ellipse cx="0" cy="-240" rx="90" ry="25" fill="#facc15" stroke="#141418" stroke-width="4"/>
      <ellipse cx="0" cy="-180" rx="120" ry="30" fill="#facc15" stroke="#141418" stroke-width="4"/>
      <!-- алмалар мен жүзімдер -->
      <circle cx="-40" cy="-255" r="16" fill="#ef4444"/>
      <circle cx="0" cy="-255" r="16" fill="#22c55e"/>
      <circle cx="40" cy="-255" r="16" fill="#ef4444"/>
      <!-- кола мен су бөтелкелері -->
      ${R(180, -220, 35, 100, "#7f1d1d", 4)}
      ${R(230, -210, 32, 90, "#0284c7", 4)}
    </g>`;
  }

  // ---------- Фондар жинағы (BG) ----------
  const TOY_BG = {
    // 1. Жүргізуші студиясы
    host() {
      return {
        far: `<defs>${grad("hostToy", [[0, "#7c2d12"], [0.5, "#ea580c"], [1, "#0f172a"]])}</defs>
          <rect width="1080" height="1920" fill="url(#hostToy)"/>
          <circle cx="540" cy="800" r="480" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="40"/>
          <circle cx="540" cy="800" r="320" fill="none" stroke="rgba(251,191,36,0.15)" stroke-width="20"/>`,
        mid: "",
        near: "",
      };
    },

    // 2. Тойхана үлкен залы (200 адамдық мейрамхана)
    banquetHall() {
      return {
        far: `<rect width="1080" height="1920" fill="#450a0a"/>
          <!-- алтын перделер мен хрусталь люстра -->
          ${P("M0,0 Q270,300 540,100 Q810,300 1080,0Z", "#7f1d1d", 6)}
          <circle cx="540" cy="280" r="120" fill="none" stroke="#fef08a" stroke-width="8"/>
          ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${460 + i * 32}" cy="340" r="10" fill="#fef08a"/>`).join("")}
          <!-- төріндегі жазу -->
          <text x="540" y="520" text-anchor="middle" fill="#fef08a" font-family="Montserrat,sans-serif" font-weight="900" font-size="44">✦ ТОЙЫҢЫЗ ТОЙҒА ҰЛАССЫН! ✦</text>`,
        mid: `<rect y="1320" width="1080" height="600" fill="#1c1917"/>
          ${Ln("M0,1320 L1080,1320", 8, "#141418")}
          ${banquetTable(540, 1320, 1.35)}`,
        near: "",
      };
    },

    // 3. Мейрамхана асханасы (Ет қайнап жатқан орын)
    kitchen() {
      return {
        far: `<rect width="1080" height="1920" fill="#e2e8f0"/>
          <!-- кафель қабырғасы -->
          ${[200, 350, 500, 650, 800].map((y) => Ln(`M0,${y} L1080,${y}`, 4, "#cbd5e1")).join("")}
          <!-- бу мен сөрелер -->
          ${R(100, 400, 880, 40, "#94a3b8", 4)}
          ${R(140, 300, 160, 100, "#64748b", 4)}
          ${R(360, 300, 180, 100, "#64748b", 4)}`,
        mid: `<rect y="1340" width="1080" height="580" fill="#64748b"/>
          ${Ln("M0,1340 L1080,1340", 8, "#141418")}
          <!-- алып ет қазаны -->
          <ellipse cx="260" cy="1280" rx="160" ry="70" fill="#334155" stroke="#141418" stroke-width="7"/>
          ${P("M140,1180 Q260,1120 380,1180", "none", 14, "#ffffff")}`,
        near: "",
      };
    },
  };

  G.TOY_BG = {
    BG: TOY_BG,
    hotMeatPlatter,
    sarkytBag,
    shashuCoins,
    banquetTable,
  };
})(typeof window !== "undefined" ? window : globalThis);
