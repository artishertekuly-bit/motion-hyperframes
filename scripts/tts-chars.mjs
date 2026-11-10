#!/usr/bin/env node
// ElevenLabs TTS + әріп-тайминг (ауыз синхроны үшін).
//   node scripts/tts-chars.mjs <voice_id> <out-basename> "<text>"
// Жазады: <out>.mp3 және <out>.chars.json ([{ch, start, end}]). Файл бар болса — қайта сұрамайды (кредит үнемі).
// Кілт Motion/.env ішінен (ELEVENLABS_API_KEY) алынады және ешқашан шығарылмайды.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = readFileSync(resolve(ROOT, "..", "..", ".env"), "utf8").match(/ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)/)?.[1];
if (!KEY) throw new Error("ELEVENLABS_API_KEY not found in Motion/.env");
const [voice, outArg, text] = process.argv.slice(2);
if (!voice || !outArg || !text) {
  console.error('Usage: node scripts/tts-chars.mjs <voice_id> <out-basename> "<text>"');
  process.exit(1);
}
const out = resolve(outArg);
mkdirSync(dirname(out), { recursive: true });
if (existsSync(out + ".mp3")) {
  console.log("skip (exists)");
  process.exit(0);
}
const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
  method: "POST",
  headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ text, model_id: "eleven_v4", language_code: "kk", voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35 } }),
});
if (!r.ok) {
  console.error(`HTTP ${r.status} ${(await r.text()).slice(0, 300)}`);
  process.exit(1);
}
const j = await r.json();
writeFileSync(out + ".mp3", Buffer.from(j.audio_base64, "base64"));
const a = j.alignment;
const chars = a.characters.map((ch, i) => ({ ch, start: +a.character_start_times_seconds[i].toFixed(3), end: +a.character_end_times_seconds[i].toFixed(3) }));
writeFileSync(out + ".chars.json", JSON.stringify(chars));
console.log(`ok ${chars.length} chars, ${chars.at(-1)?.end.toFixed(2)} s: ${chars.map((c) => c.ch).join("")}`);
