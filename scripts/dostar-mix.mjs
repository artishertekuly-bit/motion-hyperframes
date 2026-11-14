#!/usr/bin/env node
// «Достар және Поход»: толық дыбыс араластыру (дауыс + музыка + SFX) → materials/dostar/audio/mix.wav
// Дыбыстар: materials/dostar/audio/ (voice.wav, music/, sfx/)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUD = resolve(HF, "..", "..", "materials/dostar/audio");
const SR = 48000;

const TIMING = JSON.parse(readFileSync(resolve(AUD, "timing.json"), "utf8"));
const TOTAL = Math.ceil(TIMING.total * 100) / 100;
const LN = TIMING.lines;
const S = (id) => (LN[id] ? LN[id].start : 0);
const E = (id) => (LN[id] ? LN[id].end : 0);

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
const bus = {
  voice: new Float32Array(N * 2),
  music: new Float32Array(N * 2),
  sfx: new Float32Array(N * 2)
};
const db = (d) => Math.pow(10, d / 20);

function place(busName, c) {
  const file = c.f.includes(":") || c.f.startsWith("/") ? c.f : resolve(AUD, c.f);
  if (!existsSync(file)) {
    console.warn("Audio file missing:", file);
    return;
  }
  const data = load(file, c.af);
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
const fx = (f, at, g, o) => {
  const ext = f.endsWith(".wav") ? "" : ".mp3";
  place("sfx", Object.assign({ f: "sfx/" + f + ext, at, g }, o || {}));
};

console.log("Placing audio tracks for dostar (~" + TOTAL + " s)...");

// 1. Дауыс жолы
place("voice", { f: "voice.wav", at: 0, g: 0 });

// 2. Музыкалық композициялар
mus("morning", 0, S("L07") - 0.5, -11, { fi: 1.5, fo: 1.2 });
mus("theme", S("L07") - 0.3, S("L09") - 0.2, -8, { fi: 0.2, fo: 0.6 });
mus("piano", S("L09") - 0.2, S("L10") - 0.2, -10, { fi: 0.8, fo: 0.05 });
mus("chaos", S("L10") - 0.1, S("L11") + 0.3, -9, { fi: 0.05, fo: 0.4 });
mus("montage", S("L11") + 0.3, S("L26") + 0.2, -11, { fi: 0.8, fo: 1.0 });
mus("tension", S("L26") + 0.3, S("L38") - 0.2, -11, { fi: 0.8, fo: 0.2 });
mus("theme", S("L38") - 0.1, S("L41") + 0.2, -9, { off: 15, fi: 0.3, fo: 0.6 });
mus("tension", S("L41") + 0.3, S("L46") - 0.2, -12, { fi: 0.4, fo: 0.1 });
mus("chaos", S("L46") - 0.1, S("L48") - 0.1, -8, { fi: 0.1, fo: 0.4 });
mus("epic", S("L48") - 0.1, S("L51") - 0.3, -8, { fi: 0.3, fo: 1.0 });
mus("piano", S("L51") - 0.2, S("L57") - 0.2, -10, { fi: 1.0, fo: 0.6 });
mus("theme", S("L57") - 0.2, TOTAL, -8, { off: 25, fi: 0.5, fo: 1.5 });

// 3. SFX эффектілері
// Акт 0: Түн, шатыр
fx("thud", S("L01") + 0.3, -12);
fx("dundun", S("L03") + 0.2, -8);
fx("whoosh", S("L05") + 0.1, -10);
fx("boing", S("L06") + 0.4, -6);
fx("whoosh", E("L06") + 0.15, -8);
fx("cheer", E("L06") + 0.6, -10);

// Акт 1: Сандар және Күту/Шындық
fx("pops", S("L08") + 0.2, -8);
fx("pops", S("L08") + 1.4, -8);
fx("pops", S("L08") + 2.6, -8);
fx("pops", S("L08") + 4.0, -6);
fx("pops", S("L08") + 5.5, -6);
fx("scratch", S("L10") - 0.05, -3);

// Акт 2: Каталог
fx("ping", S("L12") + 0.2, -8);
fx("ping", S("L16") + 0.2, -8);
fx("thud", S("L18") + 1.5, -6);
fx("drop", S("L19") + 0.2, -8);
fx("ping", S("L20") + 0.2, -8);
fx("whoosh", S("L21") + 0.3, -8);
fx("ping", S("L23") + 0.2, -8);
fx("buzz", S("L24") + 0.2, -10);
fx("cheer", S("L24") + 0.8, -10);

// Акт 3 & 4: Шашлық пен От
fx("dundun", S("L29") + 0.1, -3);
fx("gulp", S("L30") + 0.5, -6);
fx("whoosh", S("L38") + 0.2, -8);
fx("cheer", S("L40") + 0.3, -8);
fx("gulp", S("L42") + 0.3, -6);
fx("thunder.wav", S("L45") + 0.1, -5);

// Акт 5: Дауыл және Slow-Mo
fx("whoosh", S("L46") + 0.3, -6);
fx("heartbeat", S("L48") + 0.3, -6);
fx("heartbeat", S("L49") + 0.2, -6);
fx("thud", S("L50") + 0.5, -4);
fx("drop", S("L50") + 1.2, -8);

// Акт 6: Жылы түйін
fx("laugh", S("L53") + 0.2, -8);
fx("laugh", S("L56") + 0.2, -8);

// Акт 7: Соңы
fx("pops", S("L58") + 0.3, -8);
fx("pops", S("L58") + 2.4, -8);
fx("ping", S("L60") + 0.2, -6);
fx("cheer", S("L61") + 0.4, -8);

// 4. Музыканы дауыс астында автоматты приглушение (Auto-Ducking)
console.log("Applying auto-ducking...");
const V = bus.voice, Mu = bus.music;
let env = 0;
const att = Math.exp(-1 / (0.03 * SR)), rel = Math.exp(-1 / (0.45 * SR));
for (let i = 0; i < N; i++) {
  const a = Math.abs(V[i * 2]);
  env = a > env ? att * env + (1 - att) * a : rel * env + (1 - rel) * a;
  const duck = Math.min(1, env / 0.02);
  const g = 1 - 0.65 * duck; // ~ -9.1 dB ducking
  Mu[i * 2] *= g;
  Mu[i * 2 + 1] *= g;
}

// 5. Миксті қосу
console.log("Summing mix buses...");
const out = new Float32Array(N * 2);
for (let i = 0; i < N * 2; i++) {
  out[i] = V[i] * 1.0 + Mu[i] + bus.sfx[i] * 0.95;
}

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

// 6. Мастеринг: EBU R128 (-14.0 LUFS) нормализация
console.log("Mastering mix to standard -14.0 LUFS...");
const lufs = (f, extra) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", f, "-af", "ebur128=framelog=quiet" + (extra || ""), "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 }).stderr;
const lf = lufs(raw);
const I = parseFloat((lf.slice(lf.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/) || [0, "-20"])[1]);

const master = (g) => {
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", raw,
    "-af", `acompressor=threshold=-22dB:ratio=2.2:attack=10:release=250,volume=${g.toFixed(2)}dB,alimiter=limit=0.7:level=false:attack=2:release=50`,
    "-c:a", "pcm_s16le",
    resolve(AUD, "mix.wav")
  ]);
  const m = lufs(resolve(AUD, "mix.wav"));
  return parseFloat((m.slice(m.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/) || [0, "-14"])[1]);
};

let gain = -14 - I + 2;
for (let k = 0; k < 3; k++) {
  const got = master(gain);
  if (Math.abs(got + 14) < 0.15) break;
  gain += -14 - got;
}

const chk = lufs(resolve(AUD, "mix.wav"), ":peak=true");
console.log("Finished mastering dostar mix.wav!");
console.log("Raw I:", I, "Gain:", gain.toFixed(2), "dB | Total:", TOTAL, "s");
console.log(chk.slice(chk.indexOf("Summary:")).replace(/\s+/g, " "));
