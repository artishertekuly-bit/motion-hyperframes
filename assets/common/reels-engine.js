/* Reels / Shorts / TikTok сахна қозғалтқышы (вертикал 1080×1920, 60 fps): renderAt(t) — таза функция (seek-safe).
 * Қабаттар: far / mid (фон + кейіпкерлер) / near → экрандық overlay (svg) → эффектілер → кинетикалық текст → субтитр.
 * Камера: {x, y, z, r} әлемде; параллакс: far 0.55, mid 1, near 1.35.
 */
(function (G) {
  "use strict";
  const W = 1080, H = 1920;
  const RIG = G.ArturRig, B = G.SONGY_BG;
  const TM = G.SONGY_T || G.REELS_T || { lines: {} };
  const LN = TM.lines;
  const S = (id) => (LN[id] ? LN[id].start : 0), E = (id) => (LN[id] ? LN[id].end : 0);
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
    for (const part of v.split("+")) o = merge(o, (RIG && RIG.EXPR && RIG.EXPR[part]) || (RIG && RIG.POSES && RIG.POSES[part]) || (G.SONGY_POSES && G.SONGY_POSES[part]) || {});
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
    return k >= 1 ? acc : (RIG && RIG.blend ? RIG.blend(prev, acc, k) : acc);
  }

  // ---------- ауыз синхроны ----------
  function visemeAt(ids, t) {
    const tq = Math.floor(t * 15) / 15 + 1 / 30;
    for (const id of ids) {
      const l = LN[id];
      if (!l || tq < l.start - 0.03 || tq > l.end + 0.06) continue;
      let v = "rest";
      if (l.chars) {
        for (const [c, s, e] of l.chars) if (tq >= s && tq < e) { v = (RIG && RIG.letterViseme) ? RIG.letterViseme(c) : "aa"; break; }
      }
      return v;
    }
    return "rest";
  }

  // ---------- субтитрлер (вертикал экран үшін 28-32 таңба) ----------
  const CAPS = [];
  (function buildCaps() {
    for (const id in LN) {
      const l = LN[id];
      const text = l.text.replace(/^\.\.\./, "…").replace(/\.\.\./g, "…");
      const words = text.split(/\s+/);
      const chunks = [];
      let cur = "";
      for (const w of words) {
        if (cur && (cur.length + w.length + 1 > 30 || /[.!?…:]$/.test(cur) && cur.length > 12)) { chunks.push(cur); cur = w; }
        else cur = cur ? cur + " " + w : w;
      }
      if (cur) chunks.push(cur);
      const letters = (l.chars || []).filter(([c]) => /[\p{L}\p{N}]/u.test(c));
      let li = 0;
      chunks.forEach((c, i) => {
        const n = (c.match(/[\p{L}\p{N}]/gu) || []).length;
        const a = letters.length ? letters[Math.min(li, letters.length - 1)] : [c, l.start, l.end];
        const b = letters.length ? letters[Math.min(li + n - 1, letters.length - 1)] : [c, l.start, l.end];
        li += n;
        CAPS.push({ id, who: l.who, text: c, s: i === 0 ? l.start - 0.08 : a[1] - 0.05, e: i === chunks.length - 1 ? l.end + 0.35 : b[2] + 0.05 });
      });
    }
    CAPS.sort((a, b) => a.s - b.s);
    for (let i = 0; i < CAPS.length - 1; i++) CAPS[i].e = Math.min(CAPS[i].e, CAPS[i + 1].s);
  })();

  // ---------- DOM ----------
  let built = false;
  const el = {};
  const LAYERS = [["far", 0.55, 0.7], ["mid", 1, 1], ["near", 1.35, 1.22]];
  function build(root) {
    root.innerHTML = `
<div id="sq-world" style="position:absolute;inset:0;overflow:hidden">
  ${LAYERS.map(([n]) => `<svg id="sq-${n}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0;overflow:hidden"><defs><filter id="mb-${n}" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur id="mbg-${n}" stdDeviation="0 0"/></filter></defs><g id="sq-${n}-cam"><g id="sq-${n}-bg"></g><g id="sq-${n}-wb"></g><g id="sq-${n}-act"></g><g id="sq-${n}-wf"></g></g></svg>`).join("")}
</div>
<svg id="sq-over" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0"></svg>
<div id="sq-dim" style="position:absolute;inset:0;background:#0b0d16;opacity:0"></div>
<div id="sq-tint" style="position:absolute;inset:0;opacity:0;mix-blend-mode:multiply"></div>
<div id="sq-vig" style="position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(20,10,0,0.75) 100%)"></div>
<div id="sq-grain" style="position:absolute;inset:-64px;opacity:0;mix-blend-mode:overlay"></div>
<div id="sq-flash" style="position:absolute;inset:0;background:#fff;opacity:0"></div>
<div id="sq-lbT" style="position:absolute;left:0;right:0;top:0;height:0;background:#0b0b0d"></div>
<div id="sq-lbB" style="position:absolute;left:0;right:0;bottom:0;height:0;background:#0b0b0d"></div>
<div id="sq-type" style="position:absolute;inset:0;pointer-events:none"></div>
<div id="sq-cap" style="position:absolute;left:60px;right:60px;bottom:240px;text-align:center;pointer-events:none;z-index:20"></div>`;
    for (const n of ["world", "over", "dim", "tint", "vig", "grain", "flash", "lbT", "lbB", "type", "cap"]) el[n] = root.querySelector("#sq-" + n);
    for (const [n] of LAYERS) {
      el[n] = root.querySelector("#sq-" + n);
      el[n + "Cam"] = root.querySelector("#sq-" + n + "-cam");
      el[n + "Bg"] = root.querySelector("#sq-" + n + "-bg");
      el[n + "Wb"] = root.querySelector("#sq-" + n + "-wb");
      el[n + "Act"] = root.querySelector("#sq-" + n + "-act");
      el[n + "Wf"] = root.querySelector("#sq-" + n + "-wf");
      el[n + "Mb"] = root.querySelector("#mbg-" + n);
    }
    if (typeof document !== "undefined") {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 256;
      const cx = cv.getContext("2d");
      const im = cx.createImageData(256, 256);
      let sd = 99;
      const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < im.data.length; i += 4) { const v = 70 + rnd() * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      cx.putImageData(im, 0, 0);
      if (el.grain) el.grain.style.backgroundImage = `url(${cv.toDataURL()})`;
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

  // ---------- актерді салу ----------
  function drawActor(spec, t, idx) {
    if (typeof spec === "function") return spec(t, idx);
    let p = Object.assign({}, spec.base || {});
    if (spec.track) p = merge(p, track(spec.track, t));
    if (spec.lines) {
      const v = visemeAt(spec.lines, t);
      p.mouth = v;
      if (v !== "rest") {
        p.headTilt = (p.headTilt || 0) + Math.sin(t * 14 + idx) * 2;
        p.headY = (p.headY || 0) + Math.sin(t * 18 + idx) * 3;
      }
    }
    const seed = Math.floor(t * 12) + (spec.actorSeed || idx) * 101;
    return RIG.draw(p, { seed, id: "a" + idx });
  }

  // ---------- кадр ----------
  let curBg = null;
  const bgCache = {};
  function shotAt(t) {
    const SH = G.REELS_SHOTS || G.SONGY_SHOTS || [];
    for (let i = SH.length - 1; i >= 0; i--) if (t >= SH[i].t0) return SH[i];
    return SH[0] || { t0: 0, cam: [[0, { x: 0, y: -450, z: 1, r: 0 }]] };
  }

  function renderAt(t, root) {
    if (!built) build(root);
    const sh = shotAt(t);
    const bgKey = sh.bgKey || sh.bg;
    if (curBg !== bgKey && bgKey) {
      if (!bgCache[bgKey]) bgCache[bgKey] = typeof sh.bg === "function" ? sh.bg() : (B && B.BG && B.BG[sh.bg] ? B.BG[sh.bg](...(sh.bgArgs || [])) : { far: "", mid: "", near: "" });
      const L = bgCache[bgKey];
      el.farBg.innerHTML = L.far || "";
      el.midBg.innerHTML = L.mid || "";
      el.nearBg.innerHTML = L.near || "";
      curBg = bgKey;
    }
    const c = camAt(sh.cam, t);
    if (!sh.still) { c.x += noise(t * 0.3, 11) * 7 / c.z; c.y += noise(t * 0.27, 12) * 5 / c.z; c.r += noise(t * 0.2, 13) * 0.25; }
    const shk = sh.shake ? sh.shake(t) : 0;
    if (shk) { c.x += noise(t * 18, 1) * shk; c.y += noise(t * 18, 2) * shk; c.r += noise(t * 12, 3) * shk * 0.02; }
    const c0 = sh.c0 || { x: 0, y: -450 };
    const dt = 1 / 120;
    const ca = camAt(sh.cam, Math.max(sh.t0, t - dt)), cb = camAt(sh.cam, t + dt);
    const vx = ((cb.x - ca.x) / (2 * dt)) * c.z / 60, vy = ((cb.y - ca.y) / (2 * dt)) * c.z / 60;
    const vz = Math.abs(Math.log(cb.z / ca.z)) / (2 * dt) / 60 * 900;
    for (const [n, kd, kz] of LAYERS) {
      const Z = Math.pow(c.z, kz);
      const tx = c0.x + (c.x - c0.x) * kd, ty = c0.y + (c.y - c0.y) * kd;
      el[n + "Cam"].setAttribute("transform", `translate(${W / 2},${H / 2}) rotate(${f(c.r)}) scale(${f(Z * 1000) / 1000}) translate(${f(-tx)},${f(-ty)})`);
      const ms = (sh.mbScale == null ? 1 : sh.mbScale) * (n === "mid" && sh.mbMid != null ? sh.mbMid : 1);
      const bx = Math.min(24, (Math.abs(vx) * kd * 0.5 + vz * 0.3) * ms), by = Math.min(24, (Math.abs(vy) * kd * 0.5 + vz * 0.3) * ms);
      if (bx > 0.6 || by > 0.6) { el[n + "Mb"].setAttribute("stdDeviation", `${f(bx)} ${f(by)}`); el[n + "Cam"].setAttribute("filter", `url(#mb-${n})`); }
      else el[n + "Cam"].removeAttribute("filter");
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
    el.grain.style.transform = `translate(${Math.floor(hash(Math.floor(t * 24)) * 64)}px,${Math.floor(hash(Math.floor(t * 24) + 7) * 64)}px)`;
    el.lbT.style.height = el.lbB.style.height = f(fx.lb * 220) + "px";
    const wf = [];
    if (fx.sepia) wf.push(`sepia(${f(fx.sepia)})`);
    if (fx.sat !== 1) wf.push(`saturate(${f(fx.sat)})`);
    if (fx.bright !== 1) wf.push(`brightness(${f(fx.bright)})`);
    if (fx.blur) wf.push(`blur(${f(fx.blur)}px)`);
    el.world.style.filter = wf.join(" ");
    el.far.style.filter = fx.dof > 0.2 ? `blur(${f(fx.dof)}px)` : "";
    el.near.style.filter = fx.nearBlur > 0.2 ? `blur(${f(fx.nearBlur)}px)` : "";

    // Субтитр (Reels / TikTok оқылымды стилі)
    let cap = "";
    if (!sh.noCaps) for (const c2 of CAPS) if (t >= c2.s && t < c2.e) {
      const k = win(t, c2.s, c2.s + 0.12);
      const col = c2.who === "A" ? "#ffffff" : "#ffe9a6";
      cap = `<span style="display:inline-block;font-family:Montserrat,sans-serif;font-weight:900;font-size:52px;line-height:1.25;color:${col};-webkit-text-stroke:12px #141418;paint-order:stroke fill;letter-spacing:0.4px;opacity:${f(k)};transform:translateY(${f((1 - k) * 10)}px)">${c2.text}</span>`;
      break;
    }
    el.cap.innerHTML = cap;
  }

  // ---------- типография көмекшілері ----------
  const TY = {
    pop(t, t0, text, x, y, o) {
      o = o || {};
      if (t < t0 || (o.t1 != null && t > o.t1 + 0.25)) return "";
      const k = spring((t - t0) / 0.9, o.fr || 13, o.damp || 5.5);
      const out = o.t1 != null ? 1 - win(t, o.t1, o.t1 + 0.22) : 1;
      const sc = (o.from == null ? 0.2 : o.from) + (1 - (o.from == null ? 0.2 : o.from)) * k;
      const rot = (o.rot || 0) * (1 - k) + (o.tilt || 0) + (o.wob ? Math.sin((t - t0) * 3) * o.wob : 0);
      return `<div style="position:absolute;left:${f(x)}px;top:${f(y)}px;transform:translate(-50%,-50%) rotate(${f(rot)}deg) scale(${f(sc * out)});transform-origin:50% 50%;white-space:nowrap;font-family:${o.font || "Montserrat,sans-serif"};font-weight:${o.weight || 900};font-size:${o.size || 110}px;color:${o.color || "#fff"};-webkit-text-stroke:${o.stroke == null ? 14 : o.stroke}px #141418;paint-order:stroke fill;letter-spacing:${o.ls || 1}px;${o.style || ""}">${text}</div>`;
    },
    swing(t, t0, text, x, y, o) {
      o = o || {};
      if (t < t0) return "";
      const out = o.t1 != null ? 1 - win(t, o.t1, o.t1 + 0.3) : 1;
      let s = `<div style="position:absolute;left:${f(x)}px;top:${f(y)}px;transform:translate(-50%,-50%) scale(${f(out)});white-space:nowrap;font-family:Montserrat,sans-serif;font-weight:900;font-size:${o.size || 110}px;color:${o.color || "#f6d55c"};-webkit-text-stroke:${o.stroke || 14}px #141418;paint-order:stroke fill">`;
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
      return `<div style="position:absolute;left:${f(x)}px;top:${f(y)}px;transform:translate(-50%,-50%) rotate(${o.rot == null ? -6 : o.rot}deg) scale(${f(sc)});opacity:${f(Math.min(1, k * 3) * out)};padding:12px 32px;border:8px solid ${o.color || "#e85d75"};border-radius:16px;font-family:Montserrat,sans-serif;font-weight:900;font-size:${o.size || 66}px;color:${o.color || "#e85d75"};background:${o.bg || "rgba(255,255,255,0.92)"};white-space:nowrap">${text}</div>`;
    },
  };

  const REELS = { renderAt, TY, S, E, LN, clamp, lerp, sm, eio, eout, back, spring, win, noise, hash, track, merge, W, H, CAPS };
  G.REELS = REELS;
  G.SONGY = G.SONGY || REELS;
})(typeof window !== "undefined" ? window : globalThis);
