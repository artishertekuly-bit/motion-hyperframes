#!/usr/bin/env node
// Storytime-видео (жоба аты — аргумент; materials/<жоба>/audio-spec.json): музыка (ElevenLabs music_v1) және дыбыс эффектілері (sound-generation).
// Файл бар болса — қайта сұрамайды. Кілт Motion/.env ішінен, ешқашан шығарылмайды.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MOTION = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const KEY = readFileSync(resolve(MOTION, ".env"), "utf8").match(/ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)/)?.[1];
const PROJ = process.argv[2] || "songy";
const SPEC = JSON.parse(readFileSync(resolve(MOTION, "materials", PROJ, "audio-spec.json"), "utf8"));
const OUT = resolve(MOTION, "materials", PROJ, "audio");
mkdirSync(resolve(OUT, "music"), { recursive: true });
mkdirSync(resolve(OUT, "sfx"), { recursive: true });

const MUSIC = SPEC.music, SFX = SPEC.sfx;

async function gen(kind, name, [dur, prompt]) {
  const file = resolve(OUT, kind, name + ".mp3");
  if (existsSync(file)) return;
  const url = kind === "music" ? "https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128" : "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128";
  const body = kind === "music" ? { prompt, music_length_ms: Math.round(dur * 1000), model_id: "music_v1" } : { text: prompt, duration_seconds: dur, prompt_influence: 0.5 };
  for (let a = 0; a < 3; a++) {
    const r = await fetch(url, { method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) { console.error(kind, name, r.status, (await r.text()).slice(0, 160)); await new Promise((ok) => setTimeout(ok, 5000)); continue; }
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    console.log("ok", kind, name);
    return;
  }
}
for (const [n, v] of Object.entries(MUSIC)) await gen("music", n, v);
const jobs = Object.entries(SFX).map(([n, v]) => ["sfx", n, v]);
await Promise.all([0, 1, 2].map(async () => { while (jobs.length) await gen(...jobs.shift()); }));
console.log("done");
