#!/usr/bin/env node
// Reels (тік storytime): толық дыбыс араластыру → materials/<жоба>/audio/mix.wav
//   node scripts/reels-mix.mjs toi
// Скрипттер <жоба>.html ішіндегі <script src="assets/..."> тізбегінен жүктеледі; дыбыс белгілері — shots.js ішіндегі SONGY_AUDIO(a).
// Музыка мен эффектілер ортақ кітапханадан: materials/reels/audio/{music,sfx}. Дауыс: materials/<жоба>/audio/voice.wav.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import vm from "node:vm";

const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROJ = process.argv[2];
const AUD = resolve(HF, "..", "..", "materials", PROJ, "audio");
const LIB = resolve(HF, "..", "..", "materials/reels/audio");
const SR = 48000;

const win = {};
win.window = win;
const ctx = vm.createContext(win);
const html = readFileSync(resolve(HF, PROJ + ".html"), "utf8");
for (const m of html.matchAll(new RegExp('<script src="(assets[^"]+)"', 'g'))) vm.runInContext(readFileSync(resolve(HF, m[1]), "utf8"), ctx, { filename: m[1] });
const M = win.SONGY_MARKS, Wt = win.REELS_KIT.Wt, S = win.SONGY.S, E = win.SONGY.E;
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
  const data = load(c.f.includes(":") || c.f.startsWith("/") ? c.f : (c.lib === false ? resolve(AUD, c.f) : resolve(LIB, c.f)), c.af);
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
place("voice", { f: "voice.wav", at: 0, g: 0, lib: false });
// ---------- музыка + эффектілер (кадрлар файлынан) ----------
win.SONGY_AUDIO({ mus, fx, M, S, E, Wt, TOTAL });

// ---------- музыканы басу (дауыс конверті) ----------
const V = bus.voice, Mu = bus.music, Sx = bus.sfx;
let env = 0;
const att = Math.exp(-1 / (0.03 * SR)), rel = Math.exp(-1 / (0.45 * SR));
// алдын ала: дауыстың жылжымалы деңгейі
for (let i = 0; i < N; i++) {
  const a = Math.abs(V[i * 2]);
  env = a > env ? att * env + (1 - att) * a : rel * env + (1 - rel) * a;
  const duck = Math.min(1, env / 0.02); // 0 — тыныш, 1 — сөйлеп тұр
  const g = 1 - 0.68 * duck; // ≈ −9.9 дБ
  Mu[i * 2] *= g;
  Mu[i * 2 + 1] *= g;
  const gs = 1 - 0.38 * duck; // эффектілер де сөз кезінде сәл басылады (≈ −4 дБ)
  Sx[i * 2] *= gs;
  Sx[i * 2 + 1] *= gs;
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
