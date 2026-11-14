/* «Достар және Поход» — сахна қозғалтқышы: renderAt(t) (seek-safe).
 * Қабаттар: far / mid (фон + кейіпкерлер) / near → overlay (svg) → эффектілер → типографика → субтитр.
 * Камера: {x, y, z, r} әлемде; параллакс: far 0.55, mid 1, near 1.35.
 */
(function (G) {
  "use strict";
  const W = 1920, H = 1080;
  const RIG = G.ArturRig, B = G.DOSTAR_BG, TM = G.DOSTAR_T;
  const LN = TM.lines;
  const S = (id) => (LN[id] ? LN[id].start : 0);
  const E = (id) => (LN[id] ? LN[id].end : 0);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sm = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
  const eio = (k) => { k = clamp(k, 0, 1); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const eout = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const back = (k) => { k = clamp(k, 0, 1); const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const spring = (k, fr, damp) => { if (k <= 0) return 0; return 1 - Math.exp(-(damp || 6) * k) * Math.cos((fr || 14) * k); };
  const win = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const f = (n) => Math.round(n * 100) / 100;
  function hash(n) { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  const noise = (t, seed) => { const i = Math.floor(t), k = t - i; const a = hash(i + seed * 57), b = hash(i + 1 + seed * 57); return lerp(a, b, k * k * (3 - 2 * k)) * 2 - 1; };

  // ---------- кілттік параметрлер ----------
  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  function merge(a, b) {
    const o = Object.assign({}, a);
    for (const k in b) o[k] = isObj(b[k]) && isObj(a[k]) ? merge(a[k], b[k]) : b[k];
    return o;
  }
  function expand(v) {
    if (typeof v !== "string") return v;
    let o = {};
    for (const part of v.split("+")) o = merge(o, RIG.EXPR[part] || RIG.POSES[part] || G.DOSTAR_POSES[part] || {});
    return o;
  }
  function track(keys, t) {
    let acc = {}, prev = {}, li = -1;
    for (let i = 0; i < keys.length; i++) {
      if (keys[i][0] > t) break;
      prev = acc;
      acc = merge(acc, expand(keys[i][1]));
      li = i;
    }
    if (li < 0) return keys.length ? expand(keys[0][1]) : {};
    const d = keys[li][2] == null ? 0.2 : keys[li][2];
    const e = keys[li][3] || sm;
    const k = d <= 0 ? 1 : e(clamp((t - keys[li][0]) / d, 0, 1));
    return k >= 1 ? acc : RIG.blend(prev, acc, k);
  }

  // ---------- ауыз синхроны ----------
  function visemeAt(ids, t) {
    const tq = Math.floor(t * 15) / 15 + 1 / 30;
    for (const id of ids) {
      const l = LN[id];
      if (!l || tq < l.start - 0.03 || tq > l.end + 0.06) continue;
      let v = "rest";
      for (const [c, s, e] of l.chars) {
        if (tq >= s && tq < e) { v = RIG.letterViseme(c); break; }
      }
      return v;
    }
    return null;
  }

  function blinkAt(t, seed) {
    let tt = hash(seed) * 2;
    let i = 0;
    while (tt < t + 1 && i < 400) {
      const d = t - tt;
      if (d >= 0 && d < 0.14) return 1 - Math.abs(d / 0.07 - 1);
      tt += 2.4 + hash(seed + i * 3.7) * 2.4;
      i++;
    }
    return 0;
  }

  // ---------- кейіпкерді сызу ----------
  function drawActor(a, t, idx) {
    const st = track(a.keys || [], t);
    if (st.hide) return "";
    const p = Object.assign({}, a.base || {}, st);
    if (a.lines) {
      const v = visemeAt(a.lines, t);
      if (v) {
        p.mouth = v;
        p.headY = (p.headY || 0) + (v === "aa" || v === "oh" ? 4 : -2);
      }
    }
    const bl = blinkAt(t, a.seed || idx * 17 + 3);
    if (bl > 0) p.eye = Object.assign({}, p.eye || {}, { lidTop: Math.max(p.eye?.lidTop || 0, bl), lidBot: Math.max(p.eye?.lidBot || 0, bl * 0.7) });
    const x = p.x || 0, y = p.y || 0, s = p.s == null ? 1 : p.s;
    const rot = p.rot || 0;
    const bodySvg = RIG.draw(p, { seed: Math.floor(t * 12) + (a.seed || idx * 101), id: "a" + idx });
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})">${bodySvg}</g>`;
  }

  // ---------- субтитрлер кестесі ----------
  const CAPS = [];
  for (const [id, l] of Object.entries(LN)) {
    const raw = l.text.replace(/\[[^\]]*\]\s*/g, "").trim();
    const words = raw.split(/\s+/);
    if (words.length <= 11) {
      CAPS.push({ id, who: l.who, s: l.start, e: l.end, text: raw });
    } else {
      const mid = Math.ceil(words.length / 2);
      const tMid = l.start + (l.end - l.start) * (mid / words.length);
      CAPS.push({ id: id + "a", who: l.who, s: l.start, e: tMid, text: words.slice(0, mid).join(" ") });
      CAPS.push({ id: id + "b", who: l.who, s: tMid, e: l.end, text: words.slice(mid).join(" ") });
    }
  }

  // ---------- сахнаны жинау (DOM) ----------
  const LAYERS = [["far", 0.55, 0.7], ["mid", 1.0, 1.0], ["near", 1.35, 1.22]];
  let el = {};
  let built = false;

  function build(root) {
    root.innerHTML = `
      <div id="sq-world" style="position:absolute;inset:0;overflow:hidden">
        <svg id="sq-far" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0;pointer-events:none">
          <defs><filter id="mb-far"><feGaussianBlur id="mbg-far" stdDeviation="0 0"/></filter></defs>
          <g id="sq-far-cam"><g id="sq-far-bg"></g><g id="sq-far-wb"></g></g>
        </svg>
        <svg id="sq-mid" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0;pointer-events:none">
          <defs><filter id="mb-mid"><feGaussianBlur id="mbg-mid" stdDeviation="0 0"/></filter></defs>
          <g id="sq-mid-cam"><g id="sq-mid-bg"></g><g id="sq-mid-wb"></g><g id="sq-mid-act"></g><g id="sq-mid-wf"></g></g>
        </svg>
        <svg id="sq-near" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0;pointer-events:none">
          <defs><filter id="mb-near"><feGaussianBlur id="mbg-near" stdDeviation="0 0"/></filter></defs>
          <g id="sq-near-cam"><g id="sq-near-bg"></g><g id="sq-near-wf"></g></g>
        </svg>
      </div>
      <svg id="sq-over" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0;pointer-events:none"></svg>
      <div id="sq-dim" style="position:absolute;inset:0;background:#000;opacity:0;pointer-events:none"></div>
      <div id="sq-flash" style="position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none"></div>
      <div id="sq-tint" style="position:absolute;inset:0;pointer-events:none"></div>
      <div id="sq-vig" style="position:absolute;inset:0;box-shadow:inset 0 0 220px rgba(10,12,18,0.7);opacity:0;pointer-events:none"></div>
      <div id="sq-grain" style="position:absolute;inset:-64px;pointer-events:none;opacity:0;mix-blend-mode:overlay"></div>
      <div id="sq-lb-t" style="position:absolute;left:0;top:0;width:${W}px;height:0;background:#000"></div>
      <div id="sq-lb-b" style="position:absolute;left:0;bottom:0;width:${W}px;height:0;background:#000"></div>
      <div id="sq-type" style="position:absolute;inset:0;pointer-events:none"></div>
      <div id="sq-cap" style="position:absolute;left:0;bottom:54px;width:${W}px;text-align:center;pointer-events:none"></div>
    `;

    el = {
      world: root.querySelector("#sq-world"),
      far: root.querySelector("#sq-far"),
      mid: root.querySelector("#sq-mid"),
      near: root.querySelector("#sq-near"),
      farCam: root.querySelector("#sq-far-cam"),
      midCam: root.querySelector("#sq-mid-cam"),
      nearCam: root.querySelector("#sq-near-cam"),
      over: root.querySelector("#sq-over"),
      dim: root.querySelector("#sq-dim"),
      flash: root.querySelector("#sq-flash"),
      tint: root.querySelector("#sq-tint"),
      vig: root.querySelector("#sq-vig"),
      grain: root.querySelector("#sq-grain"),
      lbT: root.querySelector("#sq-lb-t"),
      lbB: root.querySelector("#sq-lb-b"),
      type: root.querySelector("#sq-type"),
      cap: root.querySelector("#sq-cap"),
    };
    for (const [n] of LAYERS) {
      el[n + "Bg"] = root.querySelector("#sq-" + n + "-bg");
      el[n + "Wb"] = root.querySelector("#sq-" + n + "-wb");
      el[n + "Act"] = root.querySelector("#sq-" + n + "-act");
      el[n + "Wf"] = root.querySelector("#sq-" + n + "-wf");
      el[n + "Mb"] = root.querySelector("#mbg-" + n);
    }
    built = true;
  }

  // ---------- камера ----------
  function camAt(keys, t) {
    let i = 0;
    while (i < keys.length - 1 && keys[i + 1][0] <= t) i++;
    const a = keys[i][1];
    if (i >= keys.length - 1 || t <= keys[0][0]) return Object.assign({ x: 0, y: -450, z: 1, r: 0 }, t <= keys[0][0] ? keys[0][1] : a);
    const b = keys[i + 1][1];
    const e = keys[i + 1][2] || eio;
    const k = e((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]));
    const A = Object.assign({ x: 0, y: -450, z: 1, r: 0 }, a), Bc = Object.assign({}, A, b);
    return { x: lerp(A.x, Bc.x, k), y: lerp(A.y, Bc.y, k), z: Math.exp(lerp(Math.log(A.z), Math.log(Bc.z), k)), r: lerp(A.r, Bc.r, k) };
  }

  // ---------- кадр ----------
  let curBg = null;
  const bgCache = {};

  function shotAt(t) {
    const SH = G.DOSTAR_SHOTS;
    for (let i = SH.length - 1; i >= 0; i--) {
      if (t >= SH[i].t0) return SH[i];
    }
    return SH[0];
  }

  function renderAt(t, root) {
    if (!built) build(root);
    const sh = shotAt(t);
    const bgKey = sh.bgKey || sh.bg;
    if (curBg !== bgKey) {
      if (!bgCache[bgKey]) bgCache[bgKey] = typeof sh.bg === "function" ? sh.bg() : B[sh.bg];
      const L = bgCache[bgKey];
      el.farBg.innerHTML = L?.far ? L.far() : "";
      el.midBg.innerHTML = L?.mid ? L.mid() : "";
      el.nearBg.innerHTML = L?.near ? L.near() : "";
      curBg = bgKey;
    }

    const c = camAt(sh.cam, t);
    if (!sh.still) {
      c.x += (noise(t * 0.3, 11) * 9) / c.z;
      c.y += (noise(t * 0.27, 12) * 6) / c.z;
      c.r += noise(t * 0.2, 13) * 0.35;
    }
    const shk = sh.shake ? sh.shake(t) : 0;
    if (shk) {
      c.x += noise(t * 18, 1) * shk;
      c.y += noise(t * 18, 2) * shk;
      c.r += noise(t * 12, 3) * shk * 0.02;
    }
    const c0 = sh.c0 || { x: 0, y: -450 };

    const dt = 1 / 120;
    const ca = camAt(sh.cam, Math.max(sh.t0, t - dt)), cb = camAt(sh.cam, t + dt);
    const vx = (((cb.x - ca.x) / (2 * dt)) * c.z) / 60, vy = (((cb.y - ca.y) / (2 * dt)) * c.z) / 60;
    const vz = (Math.abs(Math.log(cb.z / ca.z)) / (2 * dt) / 60) * 900;

    for (const [n, kd, kz] of LAYERS) {
      const Z = Math.pow(c.z, kz);
      const tx = c0.x + (c.x - c0.x) * kd, ty = c0.y + (c.y - c0.y) * kd;
      el[n + "Cam"].setAttribute("transform", `translate(${W / 2},${H / 2}) rotate(${f(c.r)}) scale(${f(Z * 1000) / 1000}) translate(${f(-tx)},${f(-ty)})`);
      const ms = (sh.mbScale == null ? 1 : sh.mbScale) * (n === "mid" && sh.mbMid != null ? sh.mbMid : 1);
      const bx = Math.min(24, (Math.abs(vx) * kd * 0.5 + vz * 0.3) * ms), by = Math.min(24, (Math.abs(vy) * kd * 0.5 + vz * 0.3) * ms);
      if (bx > 0.6 || by > 0.6) {
        el[n + "Mb"].setAttribute("stdDeviation", `${f(bx)} ${f(by)}`);
        el[n + "Cam"].setAttribute("filter", `url(#mb-${n})`);
      } else {
        el[n + "Cam"].removeAttribute("filter");
      }
    }

    const ctx = { t, S, E, sh, cam: c };
    el.midWb.innerHTML = sh.worldBack ? sh.worldBack(t, ctx) : "";
    const ta = sh.freeze != null && t > sh.freeze ? sh.freeze : t;
    el.midAct.innerHTML = (sh.actors || []).map((a, i) => drawActor(a, ta, i)).join("");
    el.midWf.innerHTML = sh.world ? sh.world(t, ctx) : "";
    el.farWb.innerHTML = sh.farWorld ? sh.farWorld(t, ctx) : "";
    el.nearWf.innerHTML = sh.nearWorld ? sh.nearWorld(t, ctx) : "";
    el.over.innerHTML = sh.over ? sh.over(t, ctx) : "";
    el.type.innerHTML = sh.type ? sh.type(t, ctx) : "";

    const fx = Object.assign({ dim: 0, flash: 0, tint: null, tintA: 0, sepia: 0, vig: 0, grain: 0, lb: 0, dof: 0, nearBlur: 0, blur: 0, sat: 1, bright: 1 }, sh.fx ? sh.fx(t, ctx) : {});
    if (sh.flashIn) fx.flash = Math.max(fx.flash, 1 - win(t, sh.t0, sh.t0 + sh.flashIn));
    if (sh.fadeIn) fx.dim = Math.max(fx.dim, 1 - win(t, sh.t0, sh.t0 + sh.fadeIn));
    el.dim.style.opacity = f(fx.dim);
    el.flash.style.opacity = f(fx.flash);
    el.tint.style.background = fx.tint || "transparent";
    el.tint.style.opacity = f(fx.tintA);
    el.vig.style.opacity = f(fx.vig);
    el.grain.style.opacity = f(fx.grain);
    el.lbT.style.height = el.lbB.style.height = f(fx.lb * 130) + "px";

    const wf = [];
    if (fx.sepia) wf.push(`sepia(${f(fx.sepia)})`);
    if (fx.sat !== 1) wf.push(`saturate(${f(fx.sat)})`);
    if (fx.bright !== 1) wf.push(`brightness(${f(fx.bright)})`);
    if (fx.blur) wf.push(`blur(${f(fx.blur)}px)`);
    el.world.style.filter = wf.join(" ");
    el.far.style.filter = fx.dof > 0.2 ? `blur(${f(fx.dof)}px)` : "";
    el.near.style.filter = fx.nearBlur > 0.2 ? `blur(${f(fx.nearBlur)}px)` : "";

    let cap = "";
    if (!sh.noCaps) {
      for (const c2 of CAPS) {
        if (t >= c2.s && t < c2.e) {
          const k = win(t, c2.s, c2.s + 0.12);
          const col = c2.who === "A" ? "#ffffff" : "#ffe9a6";
          cap = `<span style="display:inline-block;font-family:Montserrat,sans-serif;font-weight:800;font-size:44px;line-height:1.25;color:${col};-webkit-text-stroke:10px #141418;paint-order:stroke fill;letter-spacing:0.2px;opacity:${f(k)};transform:translateY(${f((1 - k) * 8)}px)">${c2.text}</span>`;
          break;
        }
      }
    }
    el.cap.innerHTML = cap;
  }

  // ---------- кинетикалық типография ----------
  const TY = {
    pop(t, t0, text, x, y, o) {
      o = o || {};
      if (t < t0 || (o.t1 != null && t > o.t1 + 0.25)) return "";
      const k = spring((t - t0) / 0.9, o.fr || 13, o.damp || 5.5);
      const out = o.t1 != null ? 1 - win(t, o.t1, o.t1 + 0.22) : 1;
      const sc = (o.from == null ? 0.2 : o.from) + (1 - (o.from == null ? 0.2 : o.from)) * k;
      const rot = (o.rot || 0) * (1 - k) + (o.tilt || 0) + (o.wob ? Math.sin((t - t0) * 3) * o.wob : 0);
      return `<div style="position:absolute;left:${f(x)}px;top:${f(y)}px;transform:translate(-50%,-50%) rotate(${f(rot)}deg) scale(${f(sc * out)});transform-origin:50% 50%;white-space:nowrap;font-family:${o.font || "Montserrat,sans-serif"};font-weight:${o.weight || 900};font-size:${o.size || 120}px;color:${o.color || "#fff"};-webkit-text-stroke:${o.stroke == null ? 14 : o.stroke}px #141418;paint-order:stroke fill;letter-spacing:${o.ls || 1}px;${o.style || ""}">${text}</div>`;
    },
    swing(t, t0, text, x, y, o) {
      o = o || {};
      if (t < t0) return "";
      const out = o.t1 != null ? 1 - win(t, o.t1, o.t1 + 0.3) : 1;
      let s = `<div style="position:absolute;left:${f(x)}px;top:${f(y)}px;transform:translate(-50%,-50%) scale(${f(out)});white-space:nowrap;font-family:Montserrat,sans-serif;font-weight:900;font-size:${o.size || 150}px;color:${o.color || "#f6d55c"};-webkit-text-stroke:${o.stroke || 16}px #141418;paint-order:stroke fill">`;
      [...text].forEach((ch, i) => {
        const ti = t - t0 - i * (o.step || 0.05);
        if (ti < 0) { s += `<span style="display:inline-block;opacity:0">${ch === " " ? "&nbsp;" : ch}</span>`; return; }
        const drop = (1 - eout(ti / 0.35)) * -260;
        const ang = Math.exp(-ti * 2.2) * Math.sin(ti * 9) * 22 * (i % 2 ? 1 : -1);
        s += `<span style="display:inline-block;transform-origin:50% -40%;transform:translateY(${f(drop)}px) rotate(${f(ang)}deg)">${ch === " " ? "&nbsp;" : ch}</span>`;
      });
      return s + `</div>`;
    },
    stamp(t, t0, text, x, y, o) {
      o = o || {};
      if (t < t0 || (o.t1 != null && t > o.t1 + 0.25)) return "";
      const k = win(t, t0, t0 + 0.18);
      const out = o.t1 != null ? 1 - win(t, o.t1, o.t1 + 0.2) : 1;
      const sc = lerp(2.4, 1, eout(k)) * out;
      return `<div style="position:absolute;left:${f(x)}px;top:${f(y)}px;transform:translate(-50%,-50%) rotate(${o.rot == null ? -6 : o.rot}deg) scale(${f(sc)});opacity:${f(Math.min(1, k * 3) * out)};padding:10px 30px;border:8px solid ${o.color || "#e85d75"};border-radius:14px;font-family:Montserrat,sans-serif;font-weight:900;font-size:${o.size || 70}px;color:${o.color || "#e85d75"};background:${o.bg || "rgba(255,255,255,0.88)"};white-space:nowrap">${text}</div>`;
    },
  };

  G.DOSTAR = { renderAt, TY, S, E, LN, clamp, lerp, sm, eio, eout, back, spring, win, noise, hash, track, merge, W, H, CAPS };
})(typeof window !== "undefined" ? window : globalThis);
