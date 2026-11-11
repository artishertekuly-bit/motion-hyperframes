/* «Курьер Артур және 9-қабаттағы қарбыз» — фондар, заттар мен проптар (SVG).
 * Reels вертикал (1080×1920) форматына бейімделген.
 */
(function (G) {
  "use strict";
  const B = G.SONGY_BG, RIG = G.ArturRig;
  const { BG, P, F, Ln, RF, C, T, INK, rng, f } = B;
  const R = B.R;

  const grad = (id, stops, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 || 0}" y2="${y2 == null ? 1 : y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;

  // Сары курьер сөмкесі (Wolt / Glovo стиліндегі термо-қап)
  function courierBag(x, y, s, opts) {
    opts = opts || {};
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      ${R(-120, -220, 240, 220, "#ffcc00", 7)}
      ${R(-110, -210, 220, 70, "#e6b800", 5)}
      ${Ln("M-110,-100 L110,-100", 8, "#ffffff", ' stroke-dasharray="14 10"')}
      ${R(-90, -60, 180, 50, "#141418", 4)}
      <text x="0" y="-24" text-anchor="middle" fill="#ffffff" font-family="Montserrat,sans-serif" font-weight="900" font-size="34">EXPRESS</text>
      ${Ln("M-100,-220 L-100,0 M100,-220 L100,0", 8, "#141418")}
    </g>`;
  }

  // Алып қарбыз (жолақты, 12 кг)
  function watermelon(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <ellipse cx="0" cy="-70" rx="90" ry="75" fill="#2d7f36" stroke="#141418" stroke-width="7"/>
      ${P("M-70,-70 Q-50,-130 0,-140 Q-20,-70 -30,0Z", "#1e5925", 0)}
      ${P("M-20,-70 Q10,-140 40,-135 Q10,-60 20,0Z", "#1e5925", 0)}
      ${P("M30,-60 Q60,-120 75,-100 Q60,-40 60,0Z", "#1e5925", 0)}
      ${P("M-10,-145 Q-5,-165 15,-160", "none", 6, "#5a3d28")}
    </g>`;
  }

  // 5 литрлік су баклажкасы
  function waterJug(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      ${R(-50, -140, 100, 140, "#7ec8f2", 6)}
      ${R(-20, -170, 40, 30, "#2c75d8", 5)}
      ${Ln("M-40,-100 L40,-100 M-40,-60 L40,-60", 4, "#5da8d8")}
      ${P("M20,-160 C50,-160 50,-120 20,-120", "none", 5, "#2c75d8")}
    </g>`;
  }

  // Алабай ит (Ақтөс)
  function alabai(x, y, s, opts) {
    opts = opts || {};
    const turn = opts.turn || 0;
    const angry = opts.angry || false;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <!-- денесі -->
      <ellipse cx="-40" cy="-140" rx="140" ry="90" fill="#f4ede1" stroke="#141418" stroke-width="7"/>
      <ellipse cx="-80" cy="-160" rx="60" ry="50" fill="#d2b896" stroke="none"/>
      <!-- аяқтары -->
      ${R(-140, -80, 40, 80, "#f4ede1", 7)}
      ${R(-60, -80, 40, 80, "#f4ede1", 7)}
      ${R(10, -80, 40, 80, "#f4ede1", 7)}
      ${R(70, -80, 40, 80, "#f4ede1", 7)}
      <!-- құйрығы -->
      ${P("M-170,-170 Q-210,-210 -190,-240", "none", 12, "#f4ede1")}
      <!-- басы -->
      <g transform="translate(100,-220)">
        <circle cx="0" cy="0" r="75" fill="#f4ede1" stroke="#141418" stroke-width="7"/>
        <path d="M-40,-70 Q-60,-20 -40,10" fill="#997755" stroke="#141418" stroke-width="6"/>
        <path d="M40,-70 Q60,-20 40,10" fill="#997755" stroke="#141418" stroke-width="6"/>
        <!-- мұрны -->
        <ellipse cx="20" cy="15" rx="35" ry="25" fill="#d2b896" stroke="#141418" stroke-width="5"/>
        <polygon points="12,5 28,5 20,20" fill="#141418"/>
        <!-- көздері -->
        ${angry
          ? `<circle cx="-10" cy="-15" r="9" fill="#ff2222"/><circle cx="35" cy="-15" r="9" fill="#ff2222"/><path d="M-25,-30 L0,-18 M20,-18 L45,-30" stroke="#141418" stroke-width="6"/>`
          : `<circle cx="-10" cy="-15" r="8" fill="#141418"/><circle cx="35" cy="-15" r="8" fill="#141418"/>`}
        <!-- тістері (егер ашулы болса) -->
        ${angry ? `<path d="M5,30 L12,42 L20,30 L28,42 L35,30" fill="#ffffff" stroke="#141418" stroke-width="3"/>` : `<path d="M10,28 Q20,38 30,28" stroke="#141418" stroke-width="4" fill="none"/>`}
      </g>
    </g>`;
  }

  // Домофон тақтасы
  function intercom(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      ${R(-60, -100, 120, 200, "#333842", 6)}
      ${R(-45, -85, 90, 40, "#1b2a38", 4)}
      <text x="0" y="-60" text-anchor="middle" fill="#00ffcc" font-family="monospace" font-weight="900" font-size="24">45 B</text>
      <!-- батырмалар торы 3x4 -->
      ${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<circle cx="${-30 + c * 30}" cy="${-25 + r * 28}" r="8" fill="#7a8291" stroke="#141418" stroke-width="3"/>`).join("")).join("")}
    </g>`;
  }

  // 2GIS навигатор экран картасы
  function navigatorScreen(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      ${R(-180, -320, 360, 640, "#1f2430", 8)}
      ${R(-160, -300, 320, 560, "#a8d5ba", 4)}
      <!-- жолдар -->
      ${Ln("M-160,-100 L160,-100 M0,-300 L0,260 M-100,-300 L120,260", 22, "#ffffff")}
      <!-- маршрут сызығы (жасыл) -->
      ${P("M-40,180 L0,50 L80,50 L80,-160", "none", 12, "#10b981")}
      <!-- маркер мен тұйық дуал -->
      <circle cx="80" cy="-160" r="18" fill="#ef4444" stroke="#ffffff" stroke-width="4"/>
      ${R(40, -180, 80, 16, "#333333", 4)}
      <!-- көрсеткіш (курьер нүктесі) -->
      <circle cx="-40" cy="180" r="14" fill="#3b82f6" stroke="#ffffff" stroke-width="4"/>
      <!-- хабарлама тақтайшасы -->
      ${R(-140, 160, 280, 70, "#ffffff", 5)}
      <text x="0" y="195" text-anchor="middle" fill="#141418" font-family="Montserrat,sans-serif" font-weight="900" font-size="22">300 м түзу жүріңіз</text>
      <text x="0" y="220" text-anchor="middle" fill="#ef4444" font-family="Montserrat,sans-serif" font-weight="800" font-size="16">⚠ ДУАЛҒА ТІРЕЛЕСІЗ</text>
    </g>`;
  }

  // Баспалдақ аралығы (подъезд іші)
  function stairsView(x, y, s, floorNum) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <!-- қабырға (төменгі жағы көк сыр, үсті ақ) -->
      ${R(-300, -500, 600, 500, "#e8ecf2", 0)}
      ${R(-300, -180, 600, 180, "#4a7a96", 0)}
      ${Ln("M-300,-180 L300,-180", 6, "#141418")}
      <!-- баспалдақ сатылары -->
      ${P("M-280,0 L-140,-100 L0,-100 L140,-200 L280,-200 L280,0Z", "#b0b8c4", 6)}
      ${Ln("M-280,0 L-140,0 L-140,-100 L0,-100 L0,-200 L140,-200 L140,-300", 6, "#8c96a4")}
      <!-- темір тұтқа (перила) -->
      ${Ln("M-260,-90 L260,-390", 10, "#141418")}
      ${Ln("M-200,0 L-200,-130 M-40,-100 L-40,-230 M120,-200 L120,-330", 6, "#141418")}
      <!-- қабат белгісі -->
      <circle cx="-180" cy="-320" r="45" fill="#ffffff" stroke="#141418" stroke-width="6"/>
      <text x="-180" y="-305" text-anchor="middle" fill="#141418" font-family="Montserrat,sans-serif" font-weight="900" font-size="44">${floorNum || "9"}</text>
    </g>`;
  }

  // Лифт алды және «ЖӨНДЕУДЕ» тақтайшасы
  function elevatorDoor(x, y, s, broken) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      ${R(-160, -420, 320, 420, "#5a6270", 7)}
      ${R(-140, -400, 135, 400, "#8a94a6", 5)}
      ${R(5, -400, 135, 400, "#8a94a6", 5)}
      <!-- шақыру батырмасы -->
      ${R(180, -220, 40, 70, "#333842", 4)}
      <circle cx="200" cy="-195" r="8" fill="#ef4444"/>
      <circle cx="200" cy="-175" r="8" fill="#555555"/>
      ${broken
        ? `<!-- қызыл сары ескерту қағазы -->
        <g transform="rotate(-6)">
          ${R(-120, -280, 240, 140, "#fde047", 6)}
          ${Ln("M-130,-280 L-90,-300 M90,-300 L130,-280", 12, "#cbd5e1")}
          <text x="0" y="-235" text-anchor="middle" fill="#dc2626" font-family="Montserrat,sans-serif" font-weight="900" font-size="28">ЛИФТ</text>
          <text x="0" y="-200" text-anchor="middle" fill="#141418" font-family="Montserrat,sans-serif" font-weight="900" font-size="24">ЖӨНДЕУДЕ</text>
          <text x="0" y="-170" text-anchor="middle" fill="#dc2626" font-family="Montserrat,sans-serif" font-weight="800" font-size="16">3 КҮН ІСТЕМЕЙДІ!</text>
        </g>`
        : ""}
    </g>`;
  }

  // Пәтер есігі (9-қабат, Күлпаш әже)
  function grandmaDoor(x, y, s, open) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      ${R(-180, -460, 360, 460, "#4a2d18", 8)}
      ${open
        ? `<!-- ашық есік: ішінде жылы жарық, оюлы кілем, самаурын үстелі -->
        ${R(-150, -440, 300, 440, "#ffe8b3", 0)}
        ${R(-120, -380, 240, 220, "#b83a2c", 4)}
        <text x="0" y="-260" text-anchor="middle" fill="#fde047" font-size="40">✦ ✦ ✦</text>
        <!-- есік жақтауы шалқайған -->
        ${P("M150,-440 L240,-410 L240,0 L150,0Z", "#382010", 6)}`
        : `<!-- жабық қоңыр есік -->
        ${R(-150, -440, 300, 440, "#6b4226", 6)}
        <circle cx="110" cy="-210" r="10" fill="#facc15" stroke="#141418" stroke-width="3"/>
        <!-- пәтер нөмірі 45 -->
        ${R(-40, -380, 80, 40, "#facc15", 4)}
        <text x="0" y="-352" text-anchor="middle" fill="#141418" font-family="Montserrat,sans-serif" font-weight="900" font-size="26">45</text>`}
    </g>`;
  }

  // ---------- Фондар жинағы (BG) ----------
  const COURIER_BG = {
    // 0. Офис (курьерлер базасы)
    office() {
      return {
        far: `<rect width="1080" height="1920" fill="#232936"/>
          ${R(100, 200, 880, 600, "#2f384a", 6)}
          <text x="540" y="320" text-anchor="middle" fill="#facc15" font-family="Montserrat,sans-serif" font-weight="900" font-size="54">⚡ FAST DELIVERY HQ</text>
          ${R(180, 400, 720, 340, "#1f2430", 5)}
          ${Ln("M240,570 L840,570 M540,400 L540,740", 4, "#374151")}`,
        mid: `<rect y="1250" width="1080" height="670" fill="#1b202a"/>
          ${Ln("M0,1250 L1080,1250", 8, "#141418")}
          <!-- үстел мен менеджер орны -->
          ${R(200, 1180, 680, 180, "#3e4859", 7)}
          ${R(340, 1080, 180, 100, "#1f2430", 6)}`,
        near: "",
      };
    },

    // 1. Жүргізуші студиясы (вертикал экран үшін сары-көк градиент)
    host() {
      return {
        far: `<defs>${grad("hostG", [[0, "#1e3a8a"], [0.5, "#3b82f6"], [1, "#0f172a"]])}</defs>
          <rect width="1080" height="1920" fill="url(#hostG)"/>
          <circle cx="540" cy="800" r="480" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="40"/>
          <circle cx="540" cy="800" r="320" fill="none" stroke="rgba(255,204,0,0.12)" stroke-width="20"/>`,
        mid: "",
        near: "",
      };
    },

    // 2. Қала көшесі және дуал (2GIS қателігі)
    street() {
      return {
        far: `<rect width="1080" height="1920" fill="#0f172a"/>
          <!-- көпқабатты үйлер сұлбасы -->
          ${R(60, 400, 260, 900, "#1e293b", 6)}
          ${R(380, 300, 320, 1000, "#162032", 6)}
          ${R(760, 460, 260, 840, "#1e293b", 6)}
          <!-- сары терезелер -->
          ${[500, 620, 740, 860].map((y) => `<rect x="120" y="${y}" width="40" height="50" fill="#fbbf24"/>`).join("")}`,
        mid: `<rect y="1300" width="1080" height="620" fill="#334155"/>
          ${Ln("M0,1300 L1080,1300", 8, "#141418")}
          <!-- алып бетон дуал мен қазылған траншея -->
          ${R(100, 850, 880, 450, "#64748b", 8)}
          ${[220, 340, 460, 580, 700, 820].map((x) => Ln(`M${x},850 L${x},1300`, 6, "#475569")).join("")}
          <text x="540" y="1050" text-anchor="middle" fill="#ffffff" font-family="Montserrat,sans-serif" font-weight="900" font-size="46">⛔ ӨТУГЕ БОЛМАЙДЫ</text>
          <!-- траншея -->
          ${P("M180,1300 L240,1460 L840,1460 L900,1300Z", "#1e1b18", 7)}`,
        near: "",
      };
    },

    // 3. Қараңғы аула (Алабаймен бетпе-бет келу)
    nightYard() {
      return {
        far: `<rect width="1080" height="1920" fill="#05070e"/>
          <circle cx="860" cy="280" r="70" fill="#fef08a" opacity="0.85"/>
          <!-- қараңғы ағаштар сұлбасы -->
          ${P("M-100,1300 Q100,600 300,1300Z", "#0b0f19", 0)}
          ${P("M700,1300 Q900,500 1180,1300Z", "#0b0f19", 0)}`,
        mid: `<rect y="1320" width="1080" height="600" fill="#0f172a"/>
          ${Ln("M0,1320 L1080,1320", 8, "#141418")}
          <!-- жалғыз көше шамы (фонарь) -->
          ${Ln("M300,600 L300,1320", 14, "#334155")}
          ${Ln("M270,600 L330,600 L300,560Z", 6, "#facc15")}
          <polygon points="300,590 100,1320 500,1320" fill="rgba(250,204,21,0.14)"/>`,
        near: "",
      };
    },

    // 4. Подъезд және бұзылған лифт (1-қабат)
    entrance() {
      return {
        far: `<rect width="1080" height="1920" fill="#cbd5e1"/>
          ${R(0, 0, 1080, 800, "#94a3b8", 0)}
          ${Ln("M0,800 L1080,800", 6, "#141418")}`,
        mid: `<rect y="1350" width="1080" height="570" fill="#64748b"/>
          ${Ln("M0,1350 L1080,1350", 8, "#141418")}
          <!-- лифт ортада -->
          ${elevatorDoor(540, 1350, 1.35, true)}`,
        near: "",
      };
    },

    // 5. 9-қабат баспалдағы
    stairs() {
      return {
        far: `<rect width="1080" height="1920" fill="#94a3b8"/>`,
        mid: `<rect y="1400" width="1080" height="520" fill="#475569"/>
          ${stairsView(540, 1400, 1.45, "9")}`,
        near: "",
      };
    },

    // 6. 9-қабаттағы әженің пәтерінің алды
    grandmaFlat() {
      return {
        far: `<rect width="1080" height="1920" fill="#f8fafc"/>
          ${R(0, 0, 1080, 850, "#e2e8f0", 0)}
          ${Ln("M0,850 L1080,850", 6, "#141418")}`,
        mid: `<rect y="1360" width="1080" height="560" fill="#94a3b8"/>
          ${Ln("M0,1360 L1080,1360", 8, "#141418")}
          ${grandmaDoor(540, 1360, 1.35, true)}`,
        near: "",
      };
    },
  };

  G.COURIER_BG = {
    BG: COURIER_BG,
    courierBag,
    watermelon,
    waterJug,
    alabai,
    intercom,
    navigatorScreen,
    stairsView,
    elevatorDoor,
    grandmaDoor,
  };
})(typeof window !== "undefined" ? window : globalThis);
