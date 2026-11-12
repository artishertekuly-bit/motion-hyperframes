#!/usr/bin/env node
// «Автомектеп: 13-ші емтихан және эстакада» (Reels 2): толық дыбыс миксі → materials/avto/audio/mix.wav
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import vm from "node:vm";

const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAT = resolve(HF, "..", "..", "materials");
const AUD = resolve(MAT, "avto/audio");
const SR = 48000;

const win = {};
win.window = win;
const ctx = vm.createContext(win);
for (const f of [
  "assets/characters/artur/artur-rig.js",
  "assets/songy/bg.js",
  "assets/avto/bg.js",
  "assets/avto/timing.js",
  "assets/common/reels-engine.js",
  "assets/avto/shots.js",
]) {
  vm.runInContext(readFileSync(resolve(HF, f), "utf8"), ctx, { filename: f });
}

const LN = win.SONGY_T.lines;
const S = (id) => LN[id].start, E = (id) => LN[id].end;
const TOTAL = Math.ceil(win.SONGY_T.total * 100) / 100;

function findAudio(relPath) {
  const local = resolve(AUD, relPath);
  if (existsSync(local)) return local;
  for (const proj of ["uni", "auyl", "songy"]) {
    const p = resolve(MAT, proj, "audio", relPath);
    if (existsSync(p)) return p;
  }
  return local;
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

// 1. Дауыс
place("voice", { f: resolve(AUD, "voice.wav"), at: 0, g: 0 });

// 2. Музыка
mus("theme", 0.2, S("L03") + 0.1, -10, { fi: 0.8, fo: 0.8 });
mus("thesis", S("L04") - 0.2, S("L06") - 0.2, -11, { fi: 0.6, fo: 0.6 });
mus("chaos", S("L06") - 0.2, S("L07") + 2.5, -10, { fi: 0.3, fo: 0.8 });
mus("montage", S("L08") - 0.2, S("L13") - 0.2, -12, { fi: 0.8, fo: 0.8 });
mus("tension", S("L13") - 0.2, S("L14") + 0.2, -11, { fi: 0.6, fo: 0.04 });
mus("montage", S("L15") - 0.2, S("L20") - 0.2, -11, { fi: 0.8, fo: 0.8 });
mus("tension", S("L20") - 0.2, S("L24") + 2.0, -11, { fi: 0.8, fo: 0.8 }); // көгершін
mus("epic", S("L25") - 0.2, S("L30") - 0.2, -7, { fi: 0.5, fo: 0.8 });     // эстакада + ручник
mus("warm", S("L30") - 0.2, S("L31") + 4.0, -10, { fi: 1.0, fo: 1.0 });   // жеңіс
mus("outro", S("L31") + 4.0, TOTAL, -10, { fi: 0.6, fo: 2.0 });

// 3. SFX эффектілері
fx("whoosh", 1.2, -8);
fx("dundun", S("L01") + 3.0, -4);
fx("scratch", S("L05") + 1.0, -6);
fx("thud", S("L06") + 0.5, -4);
fx("drop", S("L09") + 1.5, -6);
fx("dundun", S("L14") + 0.2, -3);
fx("ping", S("L18") + 1.2, -6);
fx("slip", S("L27") + 0.8, -5);
fx("doorSlam", S("L29") + 0.8, -4);
fx("cheer", S("L30") + 1.5, -6);
fx("guitarStrum", S("L31") + 0.8, -6);

// 4. Музыканы дауыс астында авто-басу (Ducking)
const vEnv = new Float32Array(N);
for (let i = 0; i < N; i++) {
  vEnv[i] = Math.max(Math.abs(bus.voice[i * 2]), Math.abs(bus.voice[i * 2 + 1]));
}
const smoothEnv = new Float32Array(N);
let acc = 0;
const wLen = Math.round(0.12 * SR);
for (let i = 0; i < N; i++) {
  acc += vEnv[i];
  if (i >= wLen) acc -= vEnv[i - wLen];
  smoothEnv[i] = acc / wLen;
}

const duckGain = db(-8.5);
for (let i = 0; i < N; i++) {
  const isSpeech = smoothEnv[i] > 0.015;
  const factor = isSpeech ? duckGain : 1.0;
  bus.music[i * 2] *= factor;
  bus.music[i * 2 + 1] *= factor;
}

// 5. Микс
const finalMix = new Float32Array(N * 2);
for (let i = 0; i < N * 2; i++) {
  finalMix[i] = bus.voice[i] + bus.music[i] + bus.sfx[i];
}

function writeWav(file, data) {
  const n = data.length / 2;
  const b = Buffer.alloc(44 + n * 4 * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + n * 4 * 2, 4);
  b.write("WAVE", 8);
  b.write("fmt ", 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(3, 20);
  b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 4 * 2, 28);
  b.writeUInt16LE(8, 32);
  b.writeUInt16LE(32, 34);
  b.write("data", 36);
  b.writeUInt32LE(n * 4 * 2, 40);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(b, 44);
  writeFileSync(file, b);
}

const rawMixPath = resolve(AUD, "mix.pre.wav");
const outMixPath = resolve(AUD, "mix.wav");
writeWav(rawMixPath, finalMix);

// 6. -14.0 LUFS
const m = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", rawMixPath, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const I = parseFloat((m.slice(m.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/) || [0, "-14"])[1]);
const gain = (-14.0 - I).toFixed(2);
console.log(`Measured Loudness: ${I} LUFS. Applying ${gain} dB gain.`);

execFileSync("ffmpeg", [
  "-v", "error", "-y",
  "-i", rawMixPath,
  "-af", `volume=${gain}dB,alimiter=limit=-2.0dB:attack=5:release=50`,
  "-ar", "48000",
  outMixPath,
]);

console.log("SUCCESS: Created", outMixPath, `(duration: ${TOTAL}s)`);
