/* «Автомектеп: 13-ші емтихан және эстакада» — фондар, көліктер мен проптар (SVG).
 * Reels вертикал (1080×1920) форматына бейімделген.
 */
(function (G) {
  "use strict";
  const B = G.SONGY_BG, RIG = G.ArturRig;
  const { BG, P, F, Ln, RF, C, T, INK, rng, f } = B;
  const R = B.R;

  const grad = (id, stops, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 || 0}" y2="${y2 == null ? 1 : y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;

  // Оқу көлігі (сары Lada Granta / Daewoo Nexia стилі)
  function drivingCar(x, y, s, opts) {
    opts = opts || {};
    const smoke = opts.smoke || false;
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <!-- түтін (егер капоттан шықса) -->
      ${smoke ? `<circle cx="-160" cy="-220" r="40" fill="#94a3b8" opacity="0.6"/><circle cx="-200" cy="-280" r="60" fill="#cbd5e1" opacity="0.7"/><circle cx="-140" cy="-340" r="80" fill="#e2e8f0" opacity="0.8"/>` : ""}
      <!-- шатырындағы «У» белгісі (оқу көлігі) -->
      <polygon points="0,-270 -40,-200 40,-200" fill="#ffffff" stroke="#ef4444" stroke-width="7"/>
      <text x="0" y="-214" text-anchor="middle" fill="#ef4444" font-family="Montserrat,sans-serif" font-weight="900" font-size="46">У</text>
      <!-- кабинасы -->
      ${P("M-180,-120 L-100,-200 L120,-200 L200,-120Z", "#fde047", 7)}
      <!-- әйнектер -->
      ${P("M-160,-130 L-95,-190 L10,-190 L10,-130Z", "#bae6fd", 5)}
      ${P("M25,-130 L25,-190 L110,-190 L180,-130Z", "#bae6fd", 5)}
      <!-- шанағы (кузов) -->
      ${R(-240, -120, 480, 100, "#facc15", 7)}
      <!-- бамперлер мен фаралар -->
      ${R(-250, -80, 20, 40, "#334155", 5)}
      ${R(230, -80, 20, 40, "#334155", 5)}
      <circle cx="-230" cy="-80" r="14" fill="#ffffff" stroke="#141418" stroke-width="4"/>
      <circle cx="230" cy="-80" r="14" fill="#ef4444" stroke="#141418" stroke-width="4"/>
      <!-- есік сызықтары мен тұтқа -->
      ${Ln("M20,-130 L20,-20 M-80,-130 L-80,-20", 5, "#ca8a04")}
      ${R(-50, -80, 25, 8, "#141418", 3)}
      <!-- доңғалақтар -->
      <g transform="translate(-140,0)">
        <circle cx="0" cy="-20" r="45" fill="#1e293b" stroke="#141418" stroke-width="7"/>
        <circle cx="0" cy="-20" r="22" fill="#94a3b8" stroke="#141418" stroke-width="4"/>
      </g>
      <g transform="translate(140,0)">
        <circle cx="0" cy="-20" r="45" fill="#1e293b" stroke="#141418" stroke-width="7"/>
        <circle cx="0" cy="-20" r="22" fill="#94a3b8" stroke="#141418" stroke-width="4"/>
      </g>
    </g>`;
  }

  // Қызыл-ақ жол конусы (Змейка)
  function trafficCone(x, y, s, knocked) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)}) ${knocked ? "rotate(75)" : ""}">
      ${R(-50, -12, 100, 14, "#141418", 4)}
      <polygon points="0,-140 -35,0 35,0" fill="#ef4444" stroke="#141418" stroke-width="6"/>
      ${P("M-22,-45 L22,-45 L27,-25 L-27,-25Z", "#ffffff", 4)}
      ${P("M-14,-95 L14,-95 L18,-75 L-18,-75Z", "#ffffff", 4)}
    </g>`;
  }

  // Көгершін Төлеген (еріншек қала құсы)
  function pigeonTolegen(x, y, s, opts) {
    opts = opts || {};
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <!-- денесі -->
      <ellipse cx="-10" cy="-40" rx="35" ry="25" fill="#64748b" stroke="#141418" stroke-width="5"/>
      <!-- қанаты -->
      <path d="M-35,-45 Q-10,-60 15,-40 Q-5,-20 -35,-45Z" fill="#475569" stroke="#141418" stroke-width="4"/>
      <!-- мойны (құлпырған көк-жасыл) -->
      <ellipse cx="15" cy="-55" rx="16" ry="18" fill="#10b981" stroke="#141418" stroke-width="4"/>
      <!-- басы -->
      <circle cx="22" cy="-72" r="14" fill="#64748b" stroke="#141418" stroke-width="4"/>
      <!-- тұмсығы -->
      <polygon points="34,-74 44,-70 34,-66" fill="#f59e0b" stroke="#141418" stroke-width="3"/>
      <!-- көзі (дөңгелек, немқұрайлы қараған) -->
      <circle cx="24" cy="-74" r="5" fill="#f97316"/>
      <circle cx="25" cy="-74" r="2" fill="#141418"/>
      <!-- сирақтары -->
      ${Ln("M-5,-15 L-5,0 M-5,0 L5,0 M-15,-15 L-15,0 M-15,0 L-5,0", 4, "#ea580c")}
    </g>`;
  }

  // Ручник (қол тежегіші)
  function handbrake(x, y, s, pulled) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      ${R(-80, -30, 160, 60, "#1f2430", 5)}
      <!-- тұтқа -->
      <g transform="${pulled ? "rotate(-45, -40, 0)" : "rotate(0, -40, 0)"}">
        ${R(-40, -18, 140, 36, "#334155", 6)}
        ${R(60, -14, 35, 28, "#141418", 4)}
        <circle cx="100" cy="0" r="10" fill="#94a3b8" stroke="#141418" stroke-width="3"/>
      </g>
    </g>`;
  }

  // Эстакада (өрмелеу тауы)
  function estakadaRamp(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      <!-- биік бетон эстакада -->
      ${P("M-400,0 L0,-320 L250,-320 L600,0Z", "#64748b", 8)}
      <!-- сары-қара жолақты шеткі қоршау -->
      ${Ln("M-400,0 L0,-320", 14, "#facc15")}
      ${Ln("M0,-320 L250,-320", 14, "#ef4444")}
      <!-- тоқтау сызығы (СТОП) -->
      ${Ln("M120,-320 L120,-300", 16, "#ffffff")}
      <text x="120" y="-340" text-anchor="middle" fill="#ef4444" font-family="Montserrat,sans-serif" font-weight="900" font-size="36">STOP</text>
    </g>`;
  }

  // Жүргізуші куәлігі (Права)
  function driverLicense(x, y, s) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">
      ${R(-180, -110, 360, 220, "#e0f2fe", 6)}
      ${R(-170, -100, 340, 45, "#0284c7", 0)}
      <text x="0" y="-72" text-anchor="middle" fill="#ffffff" font-family="Montserrat,sans-serif" font-weight="900" font-size="20">ЖҮРГІЗУШІ КУӘЛІГІ / DRIVING LICENCE</text>
      <!-- Артурдың фотосы -->
      ${R(-150, -45, 90, 110, "#ffffff", 4)}
      <circle cx="-105" cy="5" r="28" fill="#141418"/>
      <!-- деректер -->
      <text x="-40" y="-20" fill="#141418" font-family="Montserrat,sans-serif" font-weight="900" font-size="22">АРТУР</text>
      <text x="-40" y="8" fill="#64748b" font-family="Montserrat,sans-serif" font-weight="800" font-size="16"> санаты: B</text>
      <text x="-40" y="36" fill="#16a34a" font-family="Montserrat,sans-serif" font-weight="900" font-size="18">✓ 85 БАЛЛ (13-ШІ РЕТ)</text>
    </g>`;
  }

  // ---------- Фондар жинағы (BG) ----------
  const AVTO_BG = {
    // 1. Жүргізуші студиясы
    host() {
      return {
        far: `<defs>${grad("hostAvto", [[0, "#831843"], [0.5, "#db2777"], [1, "#0f172a"]])}</defs>
          <rect width="1080" height="1920" fill="url(#hostAvto)"/>
          <circle cx="540" cy="800" r="480" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="40"/>
          <circle cx="540" cy="800" r="320" fill="none" stroke="rgba(253,224,71,0.12)" stroke-width="20"/>`,
        mid: "",
        near: "",
      };
    },

    // 2. Автодром алаңы
    autodrom() {
      return {
        far: `<rect width="1080" height="1920" fill="#38bdf8"/>
          <!-- алыс қала сұлбасы -->
          ${R(80, 500, 220, 800, "#94a3b8", 0)}
          ${R(340, 420, 360, 880, "#64748b", 0)}
          ${R(740, 480, 260, 820, "#94a3b8", 0)}`,
        mid: `<rect y="1300" width="1080" height="620" fill="#334155"/>
          ${Ln("M0,1300 L1080,1300", 8, "#141418")}
          <!-- жол таңбалары -->
          ${Ln("M100,1450 L980,1450", 14, "#ffffff", ' stroke-dasharray="60 40"')}
          ${Ln("M100,1650 L980,1650", 14, "#ffffff", ' stroke-dasharray="60 40"')}`,
        near: "",
      };
    },

    // 3. Эстакада төбесі
    estakada() {
      return {
        far: `<rect width="1080" height="1920" fill="#0284c7"/>
          <circle cx="200" cy="300" r="80" fill="#fde047" opacity="0.9"/>`,
        mid: `<rect y="1400" width="1080" height="520" fill="#1e293b"/>
          ${estakadaRamp(540, 1400, 1.35)}`,
        near: "",
      };
    },

    // 4. Көлік ішінен көрініс (руль алды)
    carCockpit() {
      return {
        far: `<rect width="1080" height="1920" fill="#60a5fa"/>
          <!-- алдағы жол -->
          ${P("M200,900 L540,500 L880,900Z", "#475569", 0)}
          ${Ln("M540,500 L540,900", 8, "#ffffff")}`,
        mid: `<!-- капот пен торпедо -->
          ${P("M-40,900 L1120,900 L1120,1920 L-40,1920Z", "#1e2430", 8)}
          <!-- руль -->
          <circle cx="540" cy="1350" r="260" fill="none" stroke="#0f172a" stroke-width="50"/>
          <circle cx="540" cy="1350" r="80" fill="#1e2430" stroke="#0f172a" stroke-width="12"/>
          ${Ln("M280,1350 L460,1350 M620,1350 L800,1350 M540,1430 L540,1610", 35, "#0f172a")}`,
        near: "",
      };
    },
  };

  G.AVTO_BG = {
    BG: AVTO_BG,
    drivingCar,
    trafficCone,
    pigeonTolegen,
    handbrake,
    estakadaRamp,
    driverLicense,
  };
})(typeof window !== "undefined" ? window : globalThis);
