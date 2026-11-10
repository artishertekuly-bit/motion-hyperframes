#!/usr/bin/env node
// «Әжемнің ауылы»: толық дыбыс араластыру (дауыс + музыка + эффектілер) → materials/auyl/audio/mix.wav
// Уақыттар композицияның өз скрипттерінен алынады (SONGY_MARKS, сөз таймингтері) — сурет пен дыбыс бір көзден.
// Музыка сөйлеген кезде автоматты басылады (дауыс конверті бойынша).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import vm from "node:vm";

const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUD = resolve(HF, "..", "..", "materials/auyl/audio");
const SR = 48000;

// композиция скрипттерін жүктеу (window шимі)
const win = {};
win.window = win;
const ctx = vm.createContext(win);
for (const f of ["assets/characters/artur/artur-rig.js", "assets/auyl/timing.js", "assets/songy/bg.js", "assets/auyl/bg.js", "assets/songy/engine.js", "assets/auyl/shots-a.js", "assets/auyl/shots-b.js"]) {
  vm.runInContext(readFileSync(resolve(HF, f), "utf8"), ctx, { filename: f });
}
const M = win.SONGY_MARKS, Wt = win.AUYL_H.Wt, S = win.SONGY.S, E = win.SONGY.E;
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
mus("aul", 0.3, M.LAND + 0.02, -10, { fi: 1.5, fo: 0.04 });          // табақ «гүрс» — музыка кенет тоқтайды
mus("theme", M.TITLE - 0.05, M.ROO - 0.1, -9, { fi: 0.02, fo: 1.2 });
mus("montage", M.ROO - 0.4, M.TASK + 0.4, -12, { fi: 0.8, fo: 1.2 });
mus("tension", M.TASK, M.FRZ + 0.02, -12, { fi: 1.0, fo: 0.04 });   // мақтаныш → кадр қатады
mus("tension", M.GRID - 0.2, M.HERD + 0.5, -14, { off: 14, fi: 0.4, fo: 1.0 });
mus("western", M.HERD, M.CHARGE - 0.1, -10, { fi: 1.2, fo: 0.3 });
mus("chase", M.CHARGE - 0.2, M.JUMP + 0.05, -12, { fi: 0.05, fo: 0.25 });
mus("epic", M.JUMP, M.LANDH + 0.25, -7, { fi: 0.2, fo: 0.25 });
mus("sunset", M.DOWN - 0.8, M.BARN + 0.5, -10, { fi: 2.0, fo: 2.5 });
mus("piano", M.WALK + 0.3, M.BUS + 0.3, -12, { fi: 2.5, fo: 1.0 });
mus("outro", M.BUS, TOTAL, -10, { fi: 0.6, fo: 2.6 });

// ---------- эффектілер ----------
// келу
fx("village", 0, -19, { fi: 1.2, fo: 1.0 });
fx("busGo", M.BUSGO - 0.3, -9, { fo: 1.2 });
fx("creak", M.GATE - 0.05, -12, { dur: 1.0, fo: 0.3 });
fx("whoosh", M.HUG - 0.2, -10);
fx("thump", M.HUG + 0.02, -9);
fx("drop", Wt("L01", 4), -11);
fx("whoosh", M.PULL + 0.3, -6);
// дастарқан
fx("plates", M.DAS + 0.25, -11);
fx("thump", M.P1 - 0.02, -6);
fx("thump", M.P2 - 0.02, -5);
fx("thump", M.P3 - 0.02, -3);
fx("drop", E("L05") + 0.05, -11);
fx("tea", Wt("L06", 3) + 0.25, -10);
fx("timelapse", M.TL0, -10);
fx("button", M.POP - 0.03, -5);
fx("whoosh", M.MEAT + 0.05, -10);
fx("scratch", M.LAND - 0.14, -9);
fx("platter", M.LAND - 0.03, -1);
// тақырып
fx("whoosh", M.TITLE - 0.25, -6);
fx("dombraHit", M.TITLE + 0.02, -3);
fx("rooster", M.ROO_T + 0.08, -12);
for (const n of [6, 8, 10]) fx("drop", Wt("L11", n) - 0.02, -12);
for (const n of [6, 7, 9]) fx("drop", Wt("L12", n) - 0.02, -10);
fx("ping", S("L13") - 0.05, -12);
fx("crack", M.WIFI + 0.45, -6);
// әтеш
fx("rooster", M.CROW1 - 0.05, -10);
fx("boing", M.SNZ + 0.02, -10);
fx("roosterClose", M.CROW2 - 0.05, -7, { dur: S("L16") - M.CROW2 + 0.2, fo: 0.4 });
fx("village", M.SHH - 1.2, -19, { fi: 0.5, fo: 1.0, dur: M.NET - M.SHH + 1.2 });
fx("flap", M.CH0 + 0.1, -8);
fx("flap", M.CH0 + 2.0, -10);
fx("rooster", M.CH0 + 1.2, -15);
// интернет
fx("village", M.NET, -21, { fo: 1.0, dur: M.PH - M.NET });
fx("ping", Wt("L17", 2), -14);
place("sfx", { f: "sfx/modem.mp3", at: M.PH + 0.3, g: -13, dur: M.VM - M.PH - 0.4, fo: 0.2 });
fx("voicemsg", M.VM - 0.05, -8);
// Бекзат
fx("village", M.BEK, -20, { fo: 1.0, dur: M.FOODT - M.BEK });
fx("bucket", M.LIFT2 - 0.1, -8);
fx("whistle", M.GO, -10, { fo: 0.8 });
fx("strain", M.STR + 0.2, -6);
fx("bucket", M.STR + 1.2, -14);
// ас
fx("plates", M.FOODT + 0.2, -13);
for (const m of M.MEALS) fx("drop", m - 0.02, -10);
fx("tea", M.TEA + 0.1, -10);
fx("tea", M.TEA + 2.2, -12);
fx("timelapse", Wt("L24", 8) - 0.3, -13);
// ата
fx("village", M.ATA, -20, { fo: 1.0, dur: M.EVE - M.ATA });
fx("night", M.EVE, -18, { fi: 0.6, fo: 1.0, dur: M.TASK - M.EVE + 0.5 });
// тапсырма
fx("village", M.TASK, -20, { fo: 1.0, dur: M.FRZ - M.TASK });
fx("moo", M.PHOTO + 0.1, -11);
fx("drop", M.CIRC, -12);
fx("scratch", M.FRZ - 0.04, -8);
fx("moo", M.GRID + 0.3, -13);
fx("moo", M.GRID + 1.4, -15, { af: "asetrate=40000,aresample=48000" });
fx("dundun", M.DUN - 0.04, -3);
// табын
fx("herd", M.HERD, -9, { fi: 1.0 });
fx("herd", M.HERD + 9.6, -11);
fx("herd", M.HERD + 19.2, -15, { fo: 1.5 });
fx("whoosh", M.LOW - 0.15, -12);
fx("moo", M.PICK + 0.6, -10);
fx("moo", M.GIVE + 0.8, -12);
for (const n of [4, 6, 7]) fx("thump", Wt("L39", n), -14);
fx("dundun", M.TURN + 0.05, -8);
fx("snort", M.TURN + 0.5, -9);
fx("heartbeat", M.TERR - 0.3, -13);
fx("snort", M.CHARGE - 0.6, -4);
// қуу
fx("charge", M.CHARGE - 0.3, -12);
fx("charge", E("L42") + 0.1, -11);
fx("geese", M.CH + 1.6, -13, { dur: 1.6, fo: 0.4 });
fx("charge", M.ROOJ + 0.4, -10);
fx("flap", M.ROOJ + 0.1, -8);
fx("rooster", M.ROOJ + 1.4, -13);
fx("sheet", M.SHEET - 0.03, -5);
fx("whoosh", M.SHEET + 1.05, -10);
fx("charge", M.HAYT, -10);
place("sfx", { f: "sfx/whoosh.mp3", at: M.JUMP - 0.05, g: -5, af: "asetrate=30000,aresample=48000" });
fx("heartbeat", M.JUMP + 0.15, -6);
fx("hay", M.LANDH - 0.03, -2);
fx("munch", M.TOP + 0.4, -9);
fx("munch", M.TOP + 3.3, -11);
fx("ping", M.BARS - 0.03, -6);
fx("notifs", M.NOTE, -7, { fo: 0.5 });
fx("village", M.DOWN - 0.5, -24, { fi: 2, fo: 2, dur: M.WALK - M.DOWN });
fx("moo", M.VISTA + 3.0, -24);
fx("moo", M.VISTA + 6.5, -26, { af: "asetrate=42000,aresample=48000" });
// түн, қора
fx("night", M.WALK, -14, { fi: 0.8, fo: 1.0, dur: M.BARN - M.WALK + 0.8 });
fx("creak", M.BARN - 0.1, -12);
fx("milk", M.BARN + 0.4, -12);
fx("milk", M.BARN + 3.4, -13);
fx("munch", M.BARN + 1.2, -16);
fx("munch", M.AJ + 1.5, -18);
fx("night", M.BARN, -26, { fi: 1, fo: 1, dur: M.BEN - M.BARN });
fx("night", M.BEN, -15, { fi: 1.0, fo: 1.0 });
fx("night", M.BEN + 11.5, -16, { fi: 0.5, fo: 1.0 });
fx("night", M.BEN + 23, -17, { fi: 0.5, fo: 1.0, dur: M.BUS - M.BEN - 23 });
fx("whoosh", M.FLASH - 0.1, -10);
fx("drop", M.MET + 0.05, -9);
fx("ping", M.REC + 0.38, -7);
// кету
fx("village", M.BUS, -20, { fo: 1.0, dur: M.CITY - M.BUS });
fx("bus", M.BUS + 0.2, -12);
fx("thump", M.SINK - 0.02, -4);
fx("strain", M.SINK + 0.1, -9);
fx("busGo", M.CITY - 1.4, -12, { fo: 0.8, dur: 1.6 });
fx("whoosh", M.CITY - 0.15, -9);
fx("call", M.DIAL, -9);
fx("whoosh", M.SPLIT, -10);
// соңы
fx("whoosh", M.HOSTE - 0.1, -10);
fx("drop", M.TIP1 - 0.2, -9);
fx("drop", M.TIP2 - 0.1, -9);
fx("drop", M.CTA, -11);
fx("dombraHit", M.END + 0.25, -6);

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
