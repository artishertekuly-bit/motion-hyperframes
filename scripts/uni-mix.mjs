#!/usr/bin/env node
// «Бірінші курс»: толық дыбыс араластыру (дауыс + музыка + эффектілер) → materials/uni/audio/mix.wav
// Уақыттар композицияның өз скрипттерінен алынады (SONGY_MARKS, сөз таймингтері) — сурет пен дыбыс бір көзден.
// Музыка сөйлеген кезде автоматты басылады (дауыс конверті бойынша).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import vm from "node:vm";

const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAT = resolve(HF, "..", "..", "materials");
const AUD = resolve(MAT, "uni/audio");
const SR = 48000;

// композиция скрипттерін жүктеу (window шимі)
const win = {};
win.window = win;
const ctx = vm.createContext(win);
for (const f of [
  "assets/characters/artur/artur-rig.js",
  "assets/uni/timing.js",
  "assets/songy/bg.js",
  "assets/uni/bg.js",
  "assets/songy/engine.js",
  "assets/uni/shots-a.js",
  "assets/uni/shots-b.js",
]) {
  vm.runInContext(readFileSync(resolve(HF, f), "utf8"), ctx, { filename: f });
}
const M = win.SONGY_MARKS, Wt = win.UNI_H.Wt, S = win.SONGY.S, E = win.SONGY.E;
const TOTAL = Math.ceil(win.SONGY_TOTAL * 100) / 100;

function findAudio(relPath) {
  for (const proj of ["uni", "auyl", "songy"]) {
    const p = resolve(MAT, proj, "audio", relPath);
    if (existsSync(p)) return p;
  }
  return resolve(AUD, relPath);
}

const cache = {};
function load(file, af) {
  const full = file.includes(":") || file.startsWith("/") ? file : findAudio(file);
  if (!existsSync(full)) return new Float32Array(0);
  const key = full + "|" + (af || "");
  if (cache[key]) return cache[key];
  const args = ["-v", "error", "-i", full];
  if (af) args.push("-af", af);
  args.push("-f", "f32le", "-ac", "2", "-ar", String(SR), "-");
  const buf = execFileSync("ffmpeg", args, { maxBuffer: 1 << 30 });
  return (cache[key] = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4));
}

const N = Math.ceil(TOTAL * SR);
const bus = { voice: new Float32Array(N * 2), music: new Float32Array(N * 2), sfx: new Float32Array(N * 2) };
const db = (d) => Math.pow(10, d / 20);

function place(busName, c) {
  const data = load(c.f, c.af);
  if (!data.length) return;
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
mus("campus", 0.2, M.LAND + 0.02, -10, { fi: 1.2, fo: 0.04 });       // қапшыққа «гүрс» — музыка кенет тоқтайды
mus("theme", M.TITLE - 0.05, M.MOV - 0.05, -9, { fi: 0.02, fo: 0.8 });
mus("piano", M.MOV, M.REAL - 0.02, -11, { fi: 0.5, fo: 0.04 });      // «Фильмдерде» → рекорд скретч
mus("montage", M.CAT0 - 0.2, M.TASK + 0.3, -12, { fi: 0.8, fo: 1.2 });
mus("tension", M.TASK, M.FRZ + 0.02, -12, { fi: 1.0, fo: 0.04 });    // қапшықты дәлізге қою → кадр қатады
mus("tension", M.GONE - 0.1, M.OP0 + 0.2, -11, { off: 8, fi: 0.4, fo: 0.8 });
mus("chase", M.OP0, M.SLIDE + 0.05, -11, { fi: 0.15, fo: 0.2 });
mus("epic", M.SLIDE, M.TOUCH + 0.35, -7, { fi: 0.25, fo: 0.3 });
mus("warm", M.RM312, M.HOSTE + 0.2, -11, { fi: 1.5, fo: 1.5 });
mus("outro", M.HOSTE, TOTAL, -10, { fi: 0.8, fo: 2.5 });

// ---------- эффектілер ----------
// 0. Суық ашылу
fx("cityAmb", 0, -18, { fi: 1.0, fo: 1.0, dur: M.TURN });
fx("drop", Wt("L01", 7), -10);
fx("turnstile", M.TURN + 0.3, -8);
fx("strain", M.TURN + 0.7, -8);
fx("boing", M.POPB - 0.02, -5);
fx("stamp", M.ST1 - 0.02, -5);
fx("stamp", M.ST2 - 0.02, -4);
fx("stamp", M.ST3 - 0.02, -3);
fx("stepsUp", M.STAIR + 0.1, -9, { dur: M.RM0 - M.STAIR - 0.2, fo: 0.4 });
fx("scratch", M.LAND - 0.12, -8);
fx("thump", M.LAND - 0.02, -2);
// 1. Тақырып + Жүргізуші
fx("whoosh", M.TITLE - 0.2, -6);
fx("dombraHit", M.TITLE + 0.04, -3);
for (const n of [2, 4, 8]) fx("drop", Wt("L08", n) - 0.02, -10);
fx("coins", Wt("L09", 2), -8);
fx("scratch", M.REAL - 0.05, -7);
fx("spark", Wt("L11", 8), -6);
// 2. Каталог (4 заң)
fx("drop", Wt("L12", 8), -10);
fx("snore", S("L13") + 0.4, -12);
fx("strain", M.DAU + 0.5, -10);
fx("crunch", Wt("L16", 2), -7);
fx("drop", Wt("L17", 2), -10);
fx("stoveFire", Wt("L18", 8) - 0.05, -6);
fx("forks", M.FORKS - 0.03, -4);
fx("call", M.MOMC - 0.1, -10, { dur: 1.2 });
fx("whoosh", M.MOMC + 0.05, -9);
fx("drop", Wt("L23", 1), -10);
fx("ping", Wt("L25", 3), -9);
fx("drop", Wt("L26", 1), -10);
fx("ping", Wt("L26", 8), -7);
// 3. Тапсырма + Freeze-frame
fx("drop", Wt("L29", 6), -10);
fx("scratch", M.FRZ - 0.04, -6);
fx("doorSlam", M.GONE - 0.05, -7);
fx("dundun", M.DUN - 0.03, -3);
// 4. Өршу
fx("doorSlam", M.ACT1 - 0.03, -5);
fx("scream", M.SCRM - 0.02, -6);
fx("doorSlam", E("L40") + 0.02, -6);
fx("dundun", M.BOSS - 0.04, -5);
fx("whistleGuard", M.BOSS + 0.1, -5);
// 5. Қуу + Slow-Mo
fx("whistleGuard", M.CH + 0.2, -9);
fx("slip", M.SLIDE - 0.05, -4);
place("sfx", { f: "sfx/whoosh.mp3", at: M.SLIDE, g: -5, af: "asetrate=30000,aresample=48000" });
fx("thump", M.TOUCH - 0.02, -4);
// 6. 312-бөлме дастарқаны
fx("plates", M.RM312 + 0.3, -12);
fx("tea", S("L50") + 0.4, -10);
fx("tea", M.ROZTEA + 0.3, -10);
fx("guitarStrum", M.FEAST + 0.4, -11);
fx("call", M.VCALL - 0.1, -10, { dur: 1.2 });
fx("whoosh", M.VCALL + 0.05, -9);
// 7. Түйін
fx("whoosh", M.HOSTE - 0.1, -10);
fx("whoosh", M.PHOTO - 0.05, -10);
fx("drop", M.TIP1 - 0.15, -9);
fx("drop", M.TIP2 - 0.1, -9);
fx("drop", M.CTA, -10);
fx("crunch", M.GIVEQ + 0.1, -8);
fx("dombraHit", M.END + 0.25, -5);

// ---------- музыканы басу (дауыс конверті) ----------
const V = bus.voice, Mu = bus.music, Sx = bus.sfx;
let env = 0;
const att = Math.exp(-1 / (0.03 * SR)), rel = Math.exp(-1 / (0.45 * SR));
for (let i = 0; i < N; i++) {
  const a = Math.abs(V[i * 2]);
  env = a > env ? att * env + (1 - att) * a : rel * env + (1 - rel) * a;
  const duck = Math.min(1, env / 0.02);
  const g = 1 - 0.68 * duck;
  Mu[i * 2] *= g;
  Mu[i * 2 + 1] *= g;
  const gs = 1 - 0.38 * duck;
  Sx[i * 2] *= gs;
  Sx[i * 2 + 1] *= gs;
}

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
const lufs = (f, extra) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", f, "-af", "ebur128=framelog=quiet" + (extra || ""), "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 }).stderr;
const lf = lufs(raw);
const mArr = lf.slice(lf.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/);
const I = mArr ? parseFloat(mArr[1]) : -20;
const master = (g) => {
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-af", `acompressor=threshold=-22dB:ratio=2.2:attack=10:release=250,volume=${g.toFixed(2)}dB,alimiter=limit=0.7:level=false:attack=2:release=50`, "-c:a", "pcm_s16le", resolve(AUD, "mix.wav")]);
  const m = lufs(resolve(AUD, "mix.wav"));
  const ma = m.slice(m.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/);
  return ma ? parseFloat(ma[1]) : -14;
};
let gain = isFinite(I) ? -14 - I + 2 : 0;
for (let k = 0; k < 3; k++) {
  const got = master(gain);
  if (Math.abs(got + 14) < 0.15) break;
  gain += -14 - got;
}
const chk = lufs(resolve(AUD, "mix.wav"), ":peak=true");
console.log("raw I", I, "gain", gain.toFixed(2), "| total", TOTAL, "s");
console.log(chk.slice(chk.indexOf("Summary:")).replace(/\s+/g, " "));
