#!/usr/bin/env node
// Бөліктерді біріктіру + дыбыс (mix.wav) → Motion/final/<аты>.mp4 және <аты>_phone.mp4
//   node scripts/reels-assemble.mjs toi reels-toi-v1 toi-v4-p0 toi-v4-p46 toi-v4-p92 toi-v4-p138
import { writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [proj, finalName, ...parts] = process.argv.slice(2);
const OUT = join(HF, "out"), FINAL = resolve(HF, "..", "..", "final");
const mix = resolve(HF, "..", "..", "materials", proj, "audio", "mix.wav");
for (const p of parts) if (!existsSync(join(OUT, p + ".mp4"))) throw new Error("missing part " + p);
const list = join(OUT, `${finalName}-concat.txt`);
writeFileSync(list, parts.map((p) => `file '${join(OUT, p + ".mp4").split(String.fromCharCode(92)).join("/")}'`).join("\n") + "\n");
const video = join(OUT, `${finalName}-video.mp4`);
const ff = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: "inherit" });
ff("-f", "concat", "-safe", "0", "-i", list, "-c", "copy", video);
const main = join(FINAL, `${finalName}.mp4`), phone = join(FINAL, `${finalName}_phone.mp4`);
ff("-i", video, "-i", mix, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-aac_coder", "twoloop", "-b:a", "256k", "-ar", "48000", "-shortest", "-movflags", "+faststart", main);
ff("-i", main, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", phone);
const probe = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height,r_frame_rate,nb_frames", "-of", "compact", main], { encoding: "utf8" });
console.log(probe.trim());
console.log(main, (statSync(main).size / 1048576).toFixed(1), "MB |", phone, (statSync(phone).size / 1048576).toFixed(1), "MB");
