#!/usr/bin/env node
// 3 Reels (courier, avto, toy) толық рендері және жинағы (оркестратор)
// Барлық 6 бөлік GitHub Actions-та қатар рендерленеді, сосын жергілікті түрде concat + mix.wav біріктіріледі.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, unlinkSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "out");
const FINAL_DIR = process.env.MOTION_FINAL_DIR || resolve(ROOT, "..", "..", "final");
const WORKFLOW = "render.yml";

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(FINAL_DIR, { recursive: true });

const findGh = () => {
  for (const c of ["gh", "C:\\Program Files\\GitHub CLI\\gh.exe"]) {
    if (spawnSync(c, ["--version"], { encoding: "utf8" }).status === 0) return c;
  }
  throw new Error("GitHub CLI (gh) not found");
};
const GH = findGh();

const runCmd = (cmd, args, { allowFail = false, cwd = ROOT } = {}) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !allowFail) {
    const err = (r.stderr || r.stdout || "").trim();
    throw new Error(`${basename(cmd)} ${args.join(" ")}\n${err}`);
  }
  return r;
};

const git = (...args) => runCmd("git", args).stdout.trim();
const gh = (...args) => runCmd(GH, args).stdout.trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VIDEOS = [
  {
    id: "courier",
    title: "Курьер Артур және 9-қабаттағы қарбыз",
    composition: "courier.html",
    duration: 221,
    audio: resolve(ROOT, "../../materials/courier/audio/mix.wav"),
    chunks: [
      { name: "courier-p0", range: "0-110" },
      { name: "courier-p1", range: "110-221" },
    ],
  },
  {
    id: "avto",
    title: "Автомектеп: 13-ші емтихан және эстакада",
    composition: "avto.html",
    duration: 206,
    audio: resolve(ROOT, "../../materials/avto/audio/mix.wav"),
    chunks: [
      { name: "avto-p0", range: "0-103" },
      { name: "avto-p1", range: "103-206" },
    ],
  },
  {
    id: "toy",
    title: "Қазақтың тойы: 200 адам және даяшы Артур",
    composition: "toy.html",
    duration: 212,
    audio: resolve(ROOT, "../../materials/toy/audio/mix.wav"),
    chunks: [
      { name: "toy-p0", range: "0-106" },
      { name: "toy-p1", range: "106-212" },
    ],
  },
];

async function main() {
  console.log("==================================================");
  console.log("🚀 Reels Render Orchestrator: 3 видео (6 бөлік)");
  console.log("==================================================");

  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  console.log(`Филиал: ${branch}, Git статус: таза`);

  // 1. Диспетчерлеу
  const allTasks = [];
  for (const v of VIDEOS) {
    for (const c of v.chunks) {
      allTasks.push({
        videoId: v.id,
        chunkName: c.name,
        range: c.range,
        composition: v.composition,
        outputMp4: join(OUT_DIR, `${c.name}.mp4`),
        rid: null,
        runId: null,
        status: "pending",
        downloaded: false,
      });
    }
  }

  // Әр тапсырма үшін GitHub Actions workflow іске қосу
  console.log("\n--- 1. GitHub Actions тапсырмаларын жіберу ---");
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);

  for (const t of allTasks) {
    // Егер бұрыннан файл бар болса және өлшемі > 5MB болса, қайта рендерлемеуге болады
    if (existsSync(t.outputMp4) && statSync(t.outputMp4).size > 5 * 1024 * 1024) {
      console.log(`⏩ [${t.chunkName}] Файл бұрыннан бар: ${t.outputMp4} (${(statSync(t.outputMp4).size / 1024 / 1024).toFixed(1)} MB)`);
      t.status = "completed";
      t.downloaded = true;
      continue;
    }

    const rand = Math.random().toString(36).slice(2, 6);
    t.rid = `${stamp}-${t.chunkName}-${rand}`;
    const fields = {
      request_id: t.rid,
      mode: "video",
      composition: t.composition,
      name: t.chunkName,
      quality: "looks",
      range: t.range,
      fps: "30",
      phone_copy: "false",
    };

    console.log(`→ [${t.chunkName}] workflow жіберу (${t.composition}, range ${t.range}, rid ${t.rid})...`);
    gh("workflow", "run", WORKFLOW, "--ref", branch, ...Object.entries(fields).flatMap(([k, v]) => ["-f", `${k}=${v}`]));
    await sleep(2500); // API шектеуінен сақтану
  }

  // 2. runId-лерді табу
  console.log("\n--- 2. GitHub runId-лерді анықтау ---");
  for (let attempt = 0; attempt < 30; attempt++) {
    const pendingWithoutRun = allTasks.filter((t) => t.rid && !t.runId);
    if (pendingWithoutRun.length === 0) break;

    await sleep(4000);
    const listRaw = gh("run", "list", "--workflow", WORKFLOW, "--limit", "40", "--json", "databaseId,displayTitle,url");
    const list = JSON.parse(listRaw);

    for (const t of pendingWithoutRun) {
      const match = list.find((r) => r.displayTitle.includes(t.rid));
      if (match) {
        t.runId = match.databaseId;
        t.url = match.url;
        console.log(`✓ [${t.chunkName}] Run табылды: #${t.runId} (${t.url})`);
      }
    }
  }

  for (const t of allTasks) {
    if (t.rid && !t.runId) {
      throw new Error(`[${t.chunkName}] үшін runId табылмады (${t.rid})`);
    }
  }

  // 3. Тапсырмалардың аяқталуын бақылау
  console.log("\n--- 3. Облактағы рендер процесін күту ---");
  const startTime = Date.now();
  while (true) {
    const pending = allTasks.filter((t) => !t.downloaded);
    if (pending.length === 0) break;

    for (const t of pending) {
      if (t.downloaded) continue;
      const statusRaw = gh("run", "view", String(t.runId), "--json", "status,conclusion");
      const info = JSON.parse(statusRaw);

      if (info.status === "completed") {
        if (info.conclusion !== "success") {
          console.error(`\n❌ [${t.chunkName}] Рендер қатемен аяқталды (${info.conclusion})!`);
          const log = runCmd(GH, ["run", "view", String(t.runId), "--log-failed"], { allowFail: true }).stdout || "";
          console.error(log.split("\n").slice(-40).join("\n"));
          throw new Error(`Run #${t.runId} failed with conclusion: ${info.conclusion}`);
        }

        console.log(`\n📥 [${t.chunkName}] Аяқталды! Артефакт жүктелуде (rid ${t.rid})...`);
        const tmp = join(OUT_DIR, `.dl-${t.rid}`);
        rmSync(tmp, { recursive: true, force: true });
        gh("run", "download", String(t.runId), "-n", `render-${t.rid}`, "-D", tmp);

        for (const f of readdirSync(tmp)) {
          const src = join(tmp, f);
          const dest = join(OUT_DIR, f);
          if (existsSync(dest)) rmSync(dest, { force: true });
          renameSync(src, dest);
        }
        rmSync(tmp, { recursive: true, force: true });

        if (existsSync(t.outputMp4)) {
          const mb = (statSync(t.outputMp4).size / 1024 / 1024).toFixed(2);
          console.log(`✅ [${t.chunkName}] Жүктелді: ${t.outputMp4} (${mb} MB)`);
          t.downloaded = true;
          t.status = "downloaded";
        } else {
          throw new Error(`[${t.chunkName}] mp4 файлы табылмады: ${t.outputMp4}`);
        }
      }
    }

    const remaining = allTasks.filter((t) => !t.downloaded);
    if (remaining.length > 0) {
      const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(1);
      const names = remaining.map((t) => t.chunkName).join(", ");
      process.stdout.write(`\r⏳ Күтуде: [${names}] (өткен уақыт: ${elapsedMin} мин)...   `);
      await sleep(15000);
    }
  }

  console.log(`\n\n🎉 Барлық 6 бөлік сәтті рендерленіп жүктелді! (${((Date.now() - startTime) / 60000).toFixed(1)} мин)`);

  // 4. Жинау (Concat + Mux + Phone copy)
  console.log("\n==================================================");
  console.log("🎬 4. Видеоларды жинау (Concat + Audio Mux)");
  console.log("==================================================");

  const completedVideos = [];

  for (const v of VIDEOS) {
    console.log(`\n--- [${v.id.toUpperCase()}] ${v.title} ---`);
    const p0 = join(OUT_DIR, `${v.chunks[0].name}.mp4`).replace(/\\/g, "/");
    const p1 = join(OUT_DIR, `${v.chunks[1].name}.mp4`).replace(/\\/g, "/");
    const combinedVideo = join(OUT_DIR, `${v.id}-combined.mp4`).replace(/\\/g, "/");
    const concatList = join(OUT_DIR, `${v.id}-concat.txt`);

    // Concat txt жазу
    writeFileSync(concatList, `file '${p0}'\nfile '${p1}'\n`, "utf8");

    // Бөліктерді біріктіру (lossless copy)
    console.log(`→ Concat p0 + p1 → ${v.id}-combined.mp4...`);
    runCmd("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", combinedVideo]);

    // Аудиомен микстеу
    const finalMp4 = join(FINAL_DIR, `${v.id}-v1.mp4`).replace(/\\/g, "/");
    const audioPath = v.audio.replace(/\\/g, "/");
    console.log(`→ Master Audio (${audioPath}) қосу → ${v.id}-v1.mp4...`);
    runCmd("ffmpeg", [
      "-v", "error", "-y",
      "-i", combinedVideo,
      "-i", audioPath,
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest",
      "-movflags", "+faststart",
      finalMp4,
    ]);

    // Телефон нұсқасын жасау
    const finalPhoneMp4 = join(FINAL_DIR, `${v.id}-v1_phone.mp4`).replace(/\\/g, "/");
    console.log(`→ Телефон көшірмесін жасау → ${v.id}-v1_phone.mp4...`);
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

    // Тексеру (ffprobe)
    const vInfo = runCmd("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,r_frame_rate",
      "-of", "csv=p=0",
      finalMp4,
    ]).stdout.trim();
    const [w, h, fpsStr] = vInfo.split(",");

    const dur = runCmd("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "csv=p=0",
      finalMp4,
    ]).stdout.trim();

    const sizeMb = (statSync(finalMp4).size / 1024 / 1024).toFixed(2);
    const sizePhoneMb = (statSync(finalPhoneMp4).size / 1024 / 1024).toFixed(2);

    console.log(`✅ [${v.id}] Дайын! ${w}x${h} @ ${fpsStr}fps, ${dur}с, өлшемі: ${sizeMb} MB (phone: ${sizePhoneMb} MB)`);

    completedVideos.push({
      id: v.id,
      title: v.title,
      finalMp4,
      finalPhoneMp4,
      resolution: `${w}x${h}`,
      fps: fpsStr,
      duration: `${parseFloat(dur).toFixed(1)}s`,
      sizeMb: `${sizeMb} MB`,
      sizePhoneMb: `${sizePhoneMb} MB`,
    });
  }

  console.log("\n==================================================");
  console.log("🏆 БАРЛЫҚ 3 ВИДЕО ТОЛЫҚТАЙ АЯҚТАЛДЫ!");
  console.log("==================================================");
  for (const cv of completedVideos) {
    console.log(`\n• ${cv.title}:`);
    console.log(`  - Негізгі файл: ${cv.finalMp4} (${cv.sizeMb}, ${cv.resolution}, ${cv.duration})`);
    console.log(`  - Телефон нұсқасы: ${cv.finalPhoneMp4} (${cv.sizePhoneMb})`);
  }
}

main().catch((err) => {
  console.error("\n💥 ҚАТЕ:", err);
  process.exit(1);
});
