#!/usr/bin/env node
// Әр репликаны ElevenLabs Scribe арқылы мәтінге айналдырып, сценариймен салыстыру үшін шығару.
//   node scripts/story-stt.mjs <жоба>   → materials/<жоба>/audio/stt.json
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MOTION = resolve(HF, "..", "..");
const KEY = readFileSync(resolve(MOTION, ".env"), "utf8").match(/ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)/)?.[1];
const PROJ = process.argv[2];
const SCRIPT = JSON.parse(readFileSync(resolve(MOTION, "materials", PROJ, "script.json"), "utf8"));
const OUT = resolve(MOTION, "materials", PROJ, "audio/stt.json");
const res = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const only = process.argv[3] ? process.argv[3].split(",") : null;
const queue = SCRIPT.lines.filter((l) => !l.reuse && (only ? only.includes(l.id) : !res[l.id]));
async function stt(l) {
  const fd = new FormData();
  fd.append("model_id", "scribe_v1");
  fd.append("language_code", "kaz");
  fd.append("file", new Blob([readFileSync(resolve(MOTION, "materials", PROJ, "audio/raw", l.id + ".mp3"))]), l.id + ".mp3");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": KEY }, body: fd });
  const j = await r.json();
  res[l.id] = j.text || JSON.stringify(j).slice(0, 120);
}
await Promise.all([0, 1, 2].map(async () => { while (queue.length) await stt(queue.shift()); }));
writeFileSync(OUT, JSON.stringify(res, null, 1));
for (const l of SCRIPT.lines) if (!l.reuse) console.log(l.id, l.who, "|", l.text.replace(/\[[^\]]*\]\s*/g, ""), "\n    →", res[l.id]);
