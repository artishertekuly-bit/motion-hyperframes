#!/usr/bin/env node
// Storytime-видео (жоба аты — аргумент): сценарийдегі барлық репликаны ElevenLabs-тен алу (бар болса — қайта сұрамайды),
// бала дауысы / микрофон эффектісі, уақыт шкаласы → assets/songy/timing.js, дауыс жолы → voice.wav.
//   node scripts/story-voices.mjs auyl       (materials/<жоба>/script.json бойынша)
// Кілт Motion/.env ішінен алынады және ешқашан шығарылмайды.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MOTION = resolve(HF, "..", "..");
const KEY = readFileSync(resolve(MOTION, ".env"), "utf8").match(/ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)/)?.[1];
const PROJ = process.argv[2] || "songy";
const SCRIPT = JSON.parse(readFileSync(resolve(MOTION, "materials", PROJ, "script.json"), "utf8"));
const RAW = resolve(MOTION, "materials", PROJ, "audio/raw");
const PROC = resolve(MOTION, "materials", PROJ, "audio/proc");
mkdirSync(RAW, { recursive: true });
mkdirSync(PROC, { recursive: true });
const SR = 48000;

async function tts(line) {
  if (!line) return;
  const out = resolve(RAW, line.id);
  if (existsSync(out + ".mp3")) return;
  const v = SCRIPT.voices[line.who];
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text: line.text, model_id: "eleven_v4", language_code: "kk", voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35 } }),
    });
    if (!r.ok) { console.error(line.id, "HTTP", r.status, (await r.text()).slice(0, 120)); await new Promise((ok) => setTimeout(ok, 4000)); continue; }
    const j = await r.json();
    writeFileSync(out + ".mp3", Buffer.from(j.audio_base64, "base64"));
    const a = j.alignment;
    writeFileSync(out + ".chars.json", JSON.stringify(a.characters.map((ch, i) => [ch, +a.character_start_times_seconds[i].toFixed(3), +a.character_end_times_seconds[i].toFixed(3)])));
    console.log("tts", line.id, line.who);
    return;
  }
  throw new Error("TTS failed: " + line.id);
}

// 3 параллель сұраныс (Starter тарифінің шегі)
const queue = SCRIPT.lines.filter((l) => !l.reuse); // reuse — басқа репликаның дыбысы (кредит үнемі)
await Promise.all([0, 1, 2].map(async () => { while (queue.length) await tts(queue.shift()); }));
for (const l of SCRIPT.lines) if (l.reuse) for (const ext of [".mp3", ".chars.json"]) if (!existsSync(resolve(RAW, l.id + ext))) copyFileSync(resolve(RAW, l.reuse + ext), resolve(RAW, l.id + ext));

// өңдеу: 48 кГц моно WAV (+ бала дауысы / микрофон)
function proc(line) {
  const v = SCRIPT.voices[line.who];
  const src = resolve(RAW, line.id + ".mp3"), dst = resolve(PROC, line.id + ".wav");
  let af = "aresample=48000";
  if (v.pitch) af += `,rubberband=pitch=${v.pitch}:formant=shifted`;
  if (line.slow) af += `,asetrate=${Math.round(SR * line.slow)},aresample=${SR}`; // slow-mo айғай
  if (v.phone) af += ",highpass=f=320,lowpass=f=3400,acompressor=threshold=-20dB:ratio=3,volume=1.1";
  if (v.pa) af += ",highpass=f=260,lowpass=f=3600,aecho=0.8:0.55:110|230:0.32|0.18,volume=1.25";
  const tmp = dst.replace(/.wav$/, ".pre.wav");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-af", af, "-ac", "1", "-ar", String(SR), tmp]);
  // әр репликаны бір деңгейге: әдепкі −20 LUFS (айғай/сыбыр — сценарийдегі lufs)
  const m = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", tmp, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const I = parseFloat((m.slice(m.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/) || [0, "-20"])[1]);
  const target = line.lufs != null ? line.lufs : -20;
  const g = Math.max(-12, Math.min(18, target - I));
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", tmp, "-af", `volume=${g.toFixed(2)}dB`, "-ac", "1", "-ar", String(SR), dst]);
  return dst;
}
function pcm(file) {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"], { maxBuffer: 1 << 28 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
}

let t = 0;
const timing = {};
const parts = [];
for (const line of SCRIPT.lines) {
  const wav = proc(line);
  const raw = JSON.parse(readFileSync(resolve(RAW, line.id + ".chars.json"), "utf8")).map(([c, a, b]) => [c, a / (line.slow || 1), b / (line.slow || 1)]);
  // тегтерді ([shouting] т.б.) ауыз үшін «rest» деп белгілеу; сөйлеудің басы мен соңы — алғашқы/соңғы әріп
  let inTag = false;
  const chars = raw.map(([ch, s, e]) => {
    if (ch === "[") inTag = true;
    const c = inTag ? " " : ch;
    if (ch === "]") inTag = false;
    return [c, s, e];
  });
  const letters = chars.filter(([c]) => /[\p{L}\p{N}]/u.test(c));
  const s0 = letters[0][1], s1 = letters.at(-1)[2];
  const start = +(t + line.gap - s0).toFixed(3); // файлдың басы (s0 — файл ішіндегі алғашқы дыбыс)
  const data = pcm(wav);
  parts.push({ start, data });
  const text = line.text.replace(/\[[^\]]*\]\s*/g, "").trim();
  timing[line.id] = { who: line.who, start: +(start + s0).toFixed(3), end: +(start + s1).toFixed(3), file0: start, text, chars: chars.map(([c, s, e]) => [c, +(start + s).toFixed(3), +(start + e).toFixed(3)]).filter(([c]) => c !== " " || true) };
  t = start + s1;
}
const total = +(t + 3).toFixed(2);
// дауыс жолы
const N = Math.ceil((total + 2) * SR);
const mix = new Float32Array(N);
for (const p of parts) {
  const o = Math.round(p.start * SR);
  for (let i = 0; i < p.data.length; i++) if (o + i >= 0 && o + i < N) mix[o + i] += p.data[i];
}
function writeWav(file, ch) {
  const n = ch.length, b = Buffer.alloc(44 + n * 4);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 4, 4); b.write("WAVE", 8); b.write("fmt ", 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28);
  b.writeUInt16LE(4, 32); b.writeUInt16LE(32, 34); b.write("data", 36); b.writeUInt32LE(n * 4, 40);
  Buffer.from(ch.buffer).copy(b, 44);
  writeFileSync(file, b);
}
writeWav(resolve(MOTION, "materials", PROJ, "audio/voice.wav"), mix);
mkdirSync(resolve(HF, "assets", PROJ), { recursive: true });
writeFileSync(resolve(HF, "assets", PROJ, "timing.js"), "// generated by scripts/story-voices.mjs\nwindow.SONGY_T = " + JSON.stringify({ total, lines: timing }) + ";\n");
writeFileSync(resolve(MOTION, "materials", PROJ, "audio/timing.json"), JSON.stringify({ total, lines: timing }, null, 0));
console.log("total", total.toFixed(1), "s");
for (const [id, l] of Object.entries(timing)) console.log(id, l.who, l.start.toFixed(2), "→", l.end.toFixed(2), l.text.slice(0, 50));
