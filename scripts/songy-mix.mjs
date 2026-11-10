#!/usr/bin/env node
// «Соңғы қоңырау»: толық дыбыс араластыру (дауыс + музыка + эффектілер) → materials/songy/audio/mix.wav
// Уақыттар композицияның өз скрипттерінен алынады (SONGY_MARKS, сөз таймингтері) — сурет пен дыбыс бір көзден.
// Музыка сөйлеген кезде автоматты басылады (дауыс конверті бойынша).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import vm from "node:vm";

const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUD = resolve(HF, "..", "..", "materials/songy/audio");
const SR = 48000;

// композиция скрипттерін жүктеу (window шимі)
const win = {};
win.window = win;
const ctx = vm.createContext(win);
for (const f of ["assets/characters/artur/artur-rig.js", "assets/songy/timing.js", "assets/songy/bg.js", "assets/songy/engine.js", "assets/songy/shots-a.js", "assets/songy/shots-b.js"]) {
  vm.runInContext(readFileSync(resolve(HF, f), "utf8"), ctx, { filename: f });
}
const M = win.SONGY_MARKS, Wt = win.SONGY_H.Wt, S = win.SONGY.S, E = win.SONGY.E;
const TOTAL = Math.ceil(win.SONGY_TOTAL * 100) / 100;

const cache = {};
function load(file, af) {
  const key = file + "|" + (af || "");
  if (cache[key]) return cache[key];
  const args = ["-v", "error", "-i", file];
  if (af) args.push("-af", af);
  args.push("-f", "f32le", "-ac", "2", "-ar", String(SR), "-");
  const buf = execFileSync("ffmpeg", args, { maxBuffer: 1 << 30 });
  return (cache[key] = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4));
}
const N = Math.ceil(TOTAL * SR);
const bus = { voice: new Float32Array(N * 2), music: new Float32Array(N * 2), sfx: new Float32Array(N * 2) };
const db = (d) => Math.pow(10, d / 20);
// clip: {f, at, g (dB), off, dur, fi, fo, af}
function place(busName, c) {
  const data = load(c.f.includes(":") || c.f.startsWith("/") ? c.f : resolve(AUD, c.f), c.af);
  const g = db(c.g || 0);
  const off = Math.round((c.off || 0) * SR);
  const len = Math.min(data.length / 2 - off, c.dur != null ? Math.round(c.dur * SR) : Infinity);
  const at = Math.round(c.at * SR);
  const fi = Math.round((c.fi || 0.005) * SR), fo = Math.round((c.fo || 0.02) * SR);
  const B = bus[busName];
  for (let i = 0; i < len; i++) {
    const o = at + i;
    if (o < 0 || o >= N) continue;
    let k = g;
    if (i < fi) k *= i / fi;
    if (i > len - fo) k *= Math.max(0, (len - i) / fo);
    B[o * 2] += data[(off + i) * 2] * k;
    B[o * 2 + 1] += data[(off + i) * 2 + 1] * k;
  }
}
const mus = (f, at, end, g, o) => place("music", Object.assign({ f: "music/" + f + ".mp3", at, dur: end - at, g, fi: 0.6, fo: 1.0 }, o || {}));
const fx = (f, at, g, o) => place("sfx", Object.assign({ f: "sfx/" + f + ".mp3", at, g }, o || {}));

// ---------- дауыс ----------
place("voice", { f: "voice.wav", at: 0, g: 0 });

// ---------- музыка ----------
mus("morning", 0, M.TITLE + 0.2, -9, { fi: 1.5, fo: 1.2 });
mus("theme", M.TITLE, M.MV + 0.3, -8, { fi: 0.02, fo: 0.6 });
mus("piano", M.MV, M.CH + 0.05, -10, { fi: 0.8, fo: 0.05 });
mus("chaos", M.CH + 0.15, M.CH1 + 0.2, -9, { fi: 0.05, fo: 0.4 });
mus("theme", M.CH1, M.RW1 - 0.2, -13, { off: 30, fi: 0.3, fo: 1.0 });
mus("montage", M.FB, M.PH + 0.8, -11, { fi: 0.8, fo: 1.2 });
mus("tension", M.PH, M.FR + 0.05, -12, { fi: 1.0, fo: 0.1 });
mus("theme", M.AY - 0.2, M.YA + 0.6, -15, { off: 18, fi: 1.5, fo: 1.2 });
mus("ceremony", M.YA, M.RUNST - 0.2, -10, { fi: 1.2, fo: 0.8 });
mus("chaos", M.RUNST - 0.5, M.SLOW + 0.1, -10, { fi: 0.3, fo: 0.3 });
mus("epic", M.SLOW, M.LAND + 0.35, -7, { fi: 0.4, fo: 0.25 });
mus("piano", M.KN - 1.0, M.OUT - 0.2, -11, { off: 7, fi: 2.0, fo: 1.2 });
mus("theme", M.OUT - 0.3, TOTAL, -11, { off: 10, fi: 1.0, fo: 2.4 });

// ---------- эффектілер ----------
fx("birds", 0.2, -14, { fi: 1.5, fo: 1.5 });
fx("birds", 5.6, -18, { fo: 2 });
fx("door", M.DOOR_T - 0.03, -4);
fx("whoosh", 12.35, -8);
fx("comb", 12.62, -6);
fx("boing", M.B1 - 0.03, -5);
fx("gel", 16.45, -6);
fx("boing", M.B2 - 0.03, -3);
fx("shutter", 19.5, -10);
fx("spray", 23.0, -6);
fx("boing", M.B3 - 0.03, -1, { af: "asetrate=40000,aresample=48000" });
fx("whoosh", M.TITLE - 0.25, -6);
fx("bell1", M.TITLE + 0.05, -3);
for (const n of [0, 5, 9]) fx("drop", Wt("L08", n) - 0.02, -9);
fx("drop", Wt("L09", 1), -10);
fx("projector", M.MV, -18, { fo: 0.3, dur: M.CH - M.MV });
fx("scratch", M.CH - 0.05, -7);
for (let i = 0; i < 4; i++) fx("whoosh", M.CH + 0.88 + i * 0.55, -9);
fx("handbell", M.CH + 0.9, -15, { dur: 0.5, fo: 0.15 });
fx("pops", M.CH + 2.0, -11, { dur: 0.5 });
place("sfx", { f: "sfx/timelapse.mp3", at: E("L11") + 0.1, g: -9, af: "areverse", dur: M.RW1 - E("L11") });
fx("projector", M.FB, -17);
fx("projector", M.FB + 3.9, -19, { fo: 1 });
fx("chatter", M.FB + 0.3, -20, { fo: 1.5 });
fx("water", M.WT + 1.15, -7);
fx("boing", M.WT + 2.15, -9, { af: "asetrate=60000,aresample=48000" });
for (let i = 0; i < 3; i++) fx("ping", M.DI + 0.5 + i * 0.45, -12);
fx("drop", Wt("L16", 13) - 0.1, -6);
fx("ping", M.ST - 0.05, -7);
fx("keys", M.ST + 0.2, -18);
fx("schoolbell", M.RUN - 0.45, -9);
fx("stampede", M.RUN, -8);
fx("stampede", M.RUN + 3.6, -12, { fo: 0.6 });
fx("drop", Wt("L21", 2), -10);
fx("drop", Wt("L21", 5), -10);
fx("schoolbell", Wt("L21", 9) - 0.15, -10, { dur: 1.6, fo: 0.4 });
fx("gulp", Wt("L21", 9) + 0.5, -6);
fx("drop", Wt("L22", 5) - 0.12, -10);
fx("whoosh", Wt("L22", 9) - 0.12, -8);
fx("buzz", M.GA1 + 0.4, -22);
fx("buzz", M.GA1 + 2.4, -22);
fx("buzz", M.BUZZ, -14);
for (let i = 0; i < 7; i++) fx("drop", M.YR + i * 0.42, -15);
fx("thud", Wt("L26", 4) - 0.02, -8);
fx("drop", S("L27") + 0.1, -13);
fx("dundun", M.FR - 0.02, -3);
fx("thud", S("L31") + 0.28, -10);
fx("birds", M.AY, -20, { fo: 2 });
fx("gulp", E("L35") + 0.05, -5);
for (let i = 0; Math.round(i) < 4; i++) fx("crowd", M.YA + i * 9.5, -17, { fi: 0.8, fo: 0.8 });
fx("feedback", M.DIR, -15);
for (const n of [0, 2, 4, 6]) fx("drop", Wt("L38", n), -15);
fx("timelapse", M.TL + 0.3, -10);
fx("cheer", E("L43") + 0.1, -7);
fx("crowd", M.GO, -18, { fo: 1 });
fx("whoosh", M.LIFT + 0.45, -10);
// қоңырау: иықта — құлақтың түбінде
for (let t = M.LIFT + 1.3; t < M.SLOW; t += 5.9) fx("handbell", t, t < M.RUNST ? -6 : -10, { dur: Math.min(6, M.SLOW - t), fo: 0.15 });
{ // құлақтағы шыңылдау (синтез)
  const t0 = M.LIFT + 1.45, len = 2.2;
  for (let i = 0; i < len * SR; i++) { const o = Math.round(t0 * SR) + i, tt = i / SR; const env = Math.min(1, tt / 0.05) * Math.max(0, 1 - tt / len); const v = Math.sin(2 * Math.PI * 3900 * tt) * 0.06 * env; bus.sfx[o * 2] += v; bus.sfx[o * 2 + 1] += v; }
}
for (let t = M.RUNST; t < M.SLOW - 1; t += 4) fx("crowd", t, -16, { dur: 4, fi: 0.3, fo: 0.3 });
fx("whoosh", M.ARCHT - 0.05, -5);
fx("heartbeat", M.SLOW + 0.4, -7);
fx("heartbeat", M.SLOW + 4.4, -8);
place("sfx", { f: "sfx/handbell.mp3", at: M.SLOW, g: -15, af: "asetrate=26000,aresample=48000", dur: M.LAND - M.SLOW, fo: 0.3 });
fx("whoosh", M.FALL, -6, { af: "asetrate=30000,aresample=48000" });
fx("pops", M.LAND - 0.08, -1);
fx("thud", M.LAND - 0.02, -2);
fx("bell1", M.TAGY + 0.22, -6);
fx("birds", M.LAND + 0.6, -30, { fi: 0.8, fo: 1.0, dur: M.TAGY - M.LAND });
fx("birds", M.FR + 3.5, -26, { fi: 0.5, fo: 1.0, dur: M.AY - M.FR - 3.2 });
fx("laugh", M.TAGY + 0.65, -5);
fx("cheer", M.TAGY + 1.6, -11);
fx("crowd", M.SIT, -22, { fi: 1.5, fo: 1.5 });
fx("crowd", M.SIT + 9.5, -24, { fi: 1, fo: 1.5 });
fx("thud", Wt("L53", 5) + 0.12, -12);
fx("ping", M.THUMB, -12);
fx("whoosh", M.OUT - 0.1, -10);
fx("drop", Wt("L58", 3), -10);
fx("drop", Wt("L58", 7), -10);
fx("drop", Wt("L59", 5) - 0.1, -11);
fx("whoosh", Wt("L59", 8), -10);
fx("bell1", M.RINGB + 0.03, -2);
fx("bell1", M.END + 0.25, -8);

// ---------- музыканы басу (дауыс конверті) ----------
const V = bus.voice, Mu = bus.music;
let env = 0;
const att = Math.exp(-1 / (0.03 * SR)), rel = Math.exp(-1 / (0.45 * SR));
// алдын ала: дауыстың жылжымалы деңгейі
for (let i = 0; i < N; i++) {
  const a = Math.abs(V[i * 2]);
  env = a > env ? att * env + (1 - att) * a : rel * env + (1 - rel) * a;
  const duck = Math.min(1, env / 0.02); // 0 — тыныш, 1 — сөйлеп тұр
  const g = 1 - 0.62 * duck; // ≈ −8.4 дБ
  Mu[i * 2] *= g;
  Mu[i * 2 + 1] *= g;
}
// ---------- қосу ----------
const out = new Float32Array(N * 2);
for (let i = 0; i < N * 2; i++) out[i] = V[i] * 1.0 + Mu[i] + bus.sfx[i] * 0.95;
function writeWav(file, data) {
  const b = Buffer.alloc(44 + data.length * 4);
  b.write("RIFF", 0); b.writeUInt32LE(36 + data.length * 4, 4); b.write("WAVE", 8); b.write("fmt ", 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 8, 28);
  b.writeUInt16LE(8, 32); b.writeUInt16LE(32, 34); b.write("data", 36); b.writeUInt32LE(data.length * 4, 40);
  Buffer.from(data.buffer).copy(b, 44);
  writeFileSync(file, b);
}
const raw = resolve(AUD, "mix-raw.wav");
writeWav(raw, out);
// ---------- громкость: −14 LUFS, шың ≤ −1.5 дБ ----------
const lufs = (f, extra) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", f, "-af", "ebur128=framelog=quiet" + (extra || ""), "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 }).stderr;
const lf = lufs(raw);
const I = parseFloat(lf.slice(lf.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/)[1]);
const master = (g) => { execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", `acompressor=threshold=-22dB:ratio=2.2:attack=10:release=250,volume=${g.toFixed(2)}dB,alimiter=limit=0.7:level=false:attack=2:release=50`, "-c:a", "pcm_s16le", resolve(AUD, "mix.wav")]); const m = lufs(resolve(AUD, "mix.wav")); return parseFloat(m.slice(m.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/)[1]); };
let gain = -14 - I + 2;
for (let k = 0; k < 3; k++) { const got = master(gain); if (Math.abs(got + 14) < 0.15) break; gain += -14 - got; }
const chk = lufs(resolve(AUD, "mix.wav"), ":peak=true");
console.log("raw I", I, "gain", gain.toFixed(2), "| total", TOTAL, "s");
console.log(chk.slice(chk.indexOf("Summary:")).replace(/\s+/g, " "));
