#!/usr/bin/env node
// «Соңғы қоңырау»: музыка (ElevenLabs music_v1) және дыбыс эффектілері (sound-generation).
// Файл бар болса — қайта сұрамайды. Кілт Motion/.env ішінен, ешқашан шығарылмайды.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MOTION = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const KEY = readFileSync(resolve(MOTION, ".env"), "utf8").match(/ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)/)?.[1];
const OUT = resolve(MOTION, "materials/songy/audio");
mkdirSync(resolve(OUT, "music"), { recursive: true });
mkdirSync(resolve(OUT, "sfx"), { recursive: true });

const NV = ", instrumental, no vocals";
const MUSIC = {
  morning: [34, "Gentle playful morning cartoon underscore, pizzicato strings and soft clarinet, light glockenspiel, sleepy start then waking up, 95 bpm" + NV],
  theme: [52, "Upbeat cheerful storytime animation theme, ukulele strums, hand claps, whistled melody, bouncy bass, glockenspiel, 110 bpm, warm and funny, clear ending" + NV],
  montage: [62, "Quirky comedic montage music about school memories, pizzicato strings, bassoon, xylophone, light snare, playful and mischievous, 118 bpm" + NV],
  tension: [36, "Comedic suspense underscore, sneaky walking pizzicato bass, muted trumpet, woodblock ticks, cartoon tension slowly building, 90 bpm" + NV],
  ceremony: [46, "Warm festive school graduation ceremony music, gentle brass and strings, sentimental and proud, a little over-solemn, light dombra plucks, 80 bpm" + NV],
  chaos: [24, "Frantic comedic chase music, fast pizzicato and xylophone runs, slapstick cartoon panic, 160 bpm" + NV],
  epic: [18, "Over-the-top epic slow motion parody, wordless choir aahs, dramatic timpani, heroic swelling strings, cinematic climax, no lyrics"],
  piano: [46, "Tender emotional piano with soft strings, heartfelt warm moment between a teacher and a student, slow 70 bpm" + NV],
};
const SFX = {
  birds: [6, "Early morning birds chirping outside a city apartment window, calm"],
  door: [1.2, "Bedroom door flung open hard, bangs against the wall"],
  comb: [1, "Quick plastic comb swipe through thick hair"],
  gel: [1, "Squishy hair gel squelch, squeezing gel into a hand"],
  boing: [1.2, "Cartoon spring boing sound, comedic"],
  spray: [1.6, "Aerosol hairspray long hiss"],
  bell1: [2.2, "Single ring of a brass school hand bell, bright, with natural decay"],
  scratch: [1, "Vinyl record scratch, comedic stop"],
  projector: [4, "Old film projector whirring and clicking"],
  chatter: [6, "Small children chattering in a classroom on the first day of school"],
  water: [2.5, "Watering can pouring water onto flowers"],
  ping: [0.6, "Short smartphone notification ping"],
  keys: [1.5, "Apartment door unlocking with keys and opening"],
  schoolbell: [3, "Electric school bell ringing in a corridor"],
  stampede: [4, "Crowd of kids stampeding down a school corridor, running footsteps and shouting"],
  buzz: [2, "Phone vibrating inside a school backpack"],
  dundun: [2, "Comedic ominous orchestral sting, dun dun duuun"],
  crowd: [10, "Outdoor festive crowd murmur at a school ceremony, parents and children, light wind"],
  feedback: [1.4, "Microphone feedback squeal through outdoor loudspeakers"],
  timelapse: [3, "Fast clock ticking with a rising whoosh, time passing quickly"],
  handbell: [6, "Brass school hand bell being rung continuously and energetically, close to the microphone"],
  whoosh: [0.8, "Fast cartoon whoosh"],
  heartbeat: [4, "Slow deep heartbeat, cinematic slow motion"],
  pops: [2.2, "Several balloons popping one after another"],
  thud: [1, "Body falling onto grass with a soft thud"],
  laugh: [7, "Outdoor crowd bursts into warm laughter and then applause"],
  gulp: [0.8, "Cartoon nervous gulp swallow"],
  drop: [0.6, "Cartoon sweat drop plink"],
  shutter: [0.6, "Smartphone camera recording start beep"],
  cheer: [4, "Small outdoor crowd applause and cheering"],
};

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
const jobs = [...Object.entries(MUSIC).map(([n, v]) => ["music", n, v]), ...Object.entries(SFX).map(([n, v]) => ["sfx", n, v])];
await Promise.all([0, 1, 2].map(async () => { while (jobs.length) await gen(...jobs.shift()); }));
console.log("done");
