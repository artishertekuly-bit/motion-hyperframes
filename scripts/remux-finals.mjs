#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = "C:/Users/Artur/Motion";
const OUT_DIR = join(ROOT, "work/hf/out");
const FINAL_DIR = join(ROOT, "final");

const VIDEOS = [
  {
    id: "courier",
    title: "Курьер Артур және 9-қабаттағы қарбыз",
    audio: join(ROOT, "materials/courier/audio/mix.wav"),
    video: join(OUT_DIR, "courier-combined.mp4"),
  },
  {
    id: "avto",
    title: "Автомектеп: 13-ші емтихан және эстакада",
    audio: join(ROOT, "materials/avto/audio/mix.wav"),
    video: join(OUT_DIR, "avto-combined.mp4"),
  },
  {
    id: "toy",
    title: "Қазақтың тойы: 200 адам және даяшы Артур",
    audio: join(ROOT, "materials/toy/audio/mix.wav"),
    video: join(OUT_DIR, "toy-combined.mp4"),
  },
];

function runCmd(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")}\n${r.stderr || r.stdout}`);
  }
  return r;
}

console.log("🎬 3 видеоның дыбысын жаңартып, қайта жинақтау басталуда...\n");

for (const v of VIDEOS) {
  console.log(`=== [${v.id.toUpperCase()}] ${v.title} ===`);
  const finalMp4 = join(FINAL_DIR, `${v.id}-v1.mp4`).replace(/\\/g, "/");
  const finalPhoneMp4 = join(FINAL_DIR, `${v.id}-v1_phone.mp4`).replace(/\\/g, "/");
  const videoPath = v.video.replace(/\\/g, "/");
  const audioPath = v.audio.replace(/\\/g, "/");

  console.log(`→ Muxing ${v.id}-combined.mp4 + ${audioPath} → ${finalMp4}...`);
  runCmd("ffmpeg", [
    "-v", "error", "-y",
    "-i", videoPath,
    "-i", audioPath,
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    "-movflags", "+faststart",
    finalMp4,
  ]);

  console.log(`→ Creating phone copy → ${finalPhoneMp4}...`);
  runCmd("ffmpeg", [
    "-v", "error", "-y",
    "-i", finalMp4,
    "-c:v", "libx264",
    "-crf", "27",
    "-preset", "fast",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    finalPhoneMp4,
  ]);

  const probe = runCmd("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height,r_frame_rate",
    "-of", "csv=p=0",
    finalMp4,
  ]).stdout.trim();
  const dur = runCmd("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    finalMp4,
  ]).stdout.trim();

  const mb = (statSync(finalMp4).size / 1024 / 1024).toFixed(2);
  const phoneMb = (statSync(finalPhoneMp4).size / 1024 / 1024).toFixed(2);
  console.log(`✅ ${v.id}-v1.mp4 (${mb} MB, phone: ${phoneMb} MB), duration: ${parseFloat(dur).toFixed(1)}s, ${probe}\n`);
}

console.log("🎉 Барлық 3 видео жаңа, бөлек дыбыстарымен толық дайын болды!");
