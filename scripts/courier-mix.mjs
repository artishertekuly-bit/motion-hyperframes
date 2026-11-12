#!/usr/bin/env node
// «Курьер Артур және 9-қабаттағы қарбыз» (Reels 1): толық дыбыс миксі → materials/courier/audio/mix.wav
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import vm from "node:vm";

const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAT = resolve(HF, "..", "..", "materials");
const AUD = resolve(MAT, "courier/audio");
const SR = 48000;

const win = {};
win.window = win;
const ctx = vm.createContext(win);
for (const f of [
  "assets/characters/artur/artur-rig.js",
  "assets/songy/bg.js",
  "assets/courier/bg.js",
  "assets/courier/timing.js",
  "assets/common/reels-engine.js",
  "assets/courier/shots.js",
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

// 2. Музыкалық композиция
mus("intro", 0.2, S("L03") + 0.1, -10, { fi: 0.8, fo: 0.8 });
mus("thesis", S("L04") - 0.2, S("L06") - 0.2, -11, { fi: 0.6, fo: 0.6 });
mus("catalog", S("L06") - 0.2, S("L12") - 0.2, -12, { fi: 0.8, fo: 0.8 });
mus("tension", S("L12") - 0.2, S("L14") + 0.2, -11, { fi: 0.6, fo: 0.04 }); // қатып қалуға дейін
mus("chase", S("L15") - 0.2, S("L17") - 0.2, -11, { fi: 0.6, fo: 0.8 });
mus("tension", S("L17") - 0.2, S("L21") + 3.0, -11, { fi: 0.8, fo: 0.8 }); // вестерн дуэлі
mus("chase", S("L21") + 3.0, S("L22") + 2.0, -9, { fi: 0.2, fo: 0.1 });    // зымырап қашу
mus("slowmo", S("L26") - 0.2, S("L29") - 0.2, -7, { fi: 0.5, fo: 0.8 });   // 9-қабатқа өрмелеу
mus("warm", S("L29") - 0.2, S("L31") + 5.0, -11, { fi: 1.2, fo: 1.0 });   // әженің сүйіншісі
mus("outro", S("L31") + 5.0, TOTAL, -10, { fi: 0.6, fo: 2.0 });

// 3. SFX эффектілері
fx("zip", 1.8, -8);
fx("dundun", S("L01") + 3.0, -4);
fx("gpsDing", S("L07") + 0.8, -8);
fx("doorBuzzer", S("L09") + 4.0, -6);
fx("thud", S("L11") + 3.5, -4);
fx("dundun", S("L14") + 0.3, -3);
fx("thud", S("L15") + 1.2, -4);
fx("boneCrack", S("L15") + 7.8, -4);
fx("dogGrowl", S("L18") + 1.2, -6);
fx("dogBark", S("L21") + 4.5, -5);
fx("doorSlam", S("L22") + 2.0, -4);
fx("stamp", S("L23") + 1.0, -4);
fx("stairsRunning", S("L26") + 1.2, -8, { dur: 6.0 });
fx("dingDong", S("L28") + 3.0, -5);
fx("coinClink", S("L30") + 1.2, -4);

// 4. Музыканы дауыс астында авто-басу (Ducking)
const envW = Math.round(0.04 * SR);
const vEnv = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const v = Math.max(Math.abs(bus.voice[i * 2]), Math.abs(bus.voice[i * 2 + 1]));
  vEnv[i] = v;
}
const smoothEnv = new Float32Array(N);
let acc = 0;
const wLen = Math.round(0.12 * SR);
for (let i = 0; i < N; i++) {
  acc += vEnv[i];
  if (i >= wLen) acc -= vEnv[i - wLen];
  smoothEnv[i] = acc / wLen;
}

const duckDB = -8.5; // сөйлегенде музыка 8.5 дБ төмендейді
const duckGain = db(duckDB);
for (let i = 0; i < N; i++) {
  const isSpeech = smoothEnv[i] > 0.015;
  const factor = isSpeech ? duckGain : 1.0;
  bus.music[i * 2] *= factor;
  bus.music[i * 2 + 1] *= factor;
}

// 5. Миксті жинақтау
const finalMix = new Float32Array(N * 2);
for (let i = 0; i < N * 2; i++) {
  finalMix[i] = bus.voice[i] + bus.music[i] + bus.sfx[i];
}

// Уақытша шикі WAV жазу
function writeWav(file, data) {
  const n = data.length / 2;
  const b = Buffer.alloc(44 + n * 4 * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + n * 4 * 2, 4);
  b.write("WAVE", 8);
  b.write("fmt ", 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(3, 20); // IEEE float
  b.writeUInt16LE(2, 22); // stereo
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

// 6. -14.0 LUFS стандарттау
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
