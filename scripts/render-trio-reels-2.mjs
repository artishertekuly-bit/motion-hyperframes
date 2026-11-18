#!/usr/bin/env node
// 3 жаңа Reels (qonaq, avtobus, kassa) толық бұлттық рендері және жинағы (оркестратор)
// 6 бөлік GitHub Actions-та параллель рендерленеді, сосын жергілікті түрде concat + mix.wav біріктіріледі.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ghRetry = async (args, maxAttempts = 6) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const r = runCmd(GH, args, { allowFail: true });
    if (r.status === 0) return (r.stdout || "").trim();
    const err = (r.stderr || r.stdout || "").trim();
    if (attempt === maxAttempts) throw new Error(`gh ${args.join(" ")} failed after ${maxAttempts} attempts:\n${err}`);
    console.warn(`[gh retry ${attempt}/${maxAttempts}] ${err.slice(0, 100)}... күту ${attempt * 3}с`);
    await sleep(attempt * 3000);
  }
};

const VIDEOS = [
  {
    id: "qonaq",
    title: "Қонақ келе жатыр: 15 минуттық Еуроремонт",
    composition: "qonaq.html",
    duration: 94,
    audio: resolve(ROOT, "../../materials/qonaq/audio/mix.wav"),
    chunks: [
      { name: "qonaq-p0", range: "0-47" },
      { name: "qonaq-p1", range: "47-94" },
    ],
  },
  {
    id: "avtobus",
    title: "Таңғы автобус: Тетрис және Кондиционер",
    composition: "avtobus.html",
    duration: 90,
    audio: resolve(ROOT, "../../materials/avtobus/audio/mix.wav"),
    chunks: [
      { name: "avtobus-p0", range: "0-45" },
      { name: "avtobus-p1", range: "45-90" },
    ],
  },
  {
    id: "kassa",
    title: "Супермаркеттегі кезек: Мен тез, бір зат қана!",
    composition: "kassa.html",
    duration: 99,
    audio: resolve(ROOT, "../../materials/kassa/audio/mix.wav"),
    chunks: [
      { name: "kassa-p0", range: "0-50" },
      { name: "kassa-p1", range: "50-99" },
    ],
  },
];

async function main() {
  console.log("==================================================");
  console.log("🚀 Reels Render Orchestrator 2: 3 жаңа ролик (6 бөлік)");
  console.log("==================================================");

  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  console.log(`Филиал: ${branch}`);

  console.log("→ Git өзгерістерін тексеру және push жасау...");
  runCmd("git", ["add", "-A"]);
  const st = git("status", "--porcelain");
  if (st) {
    runCmd("git", ["commit", "-m", "feat(reels): add 3 new vertical storytime reels (qonaq, avtobus, kassa)"]);
    runCmd("git", ["push", "origin", branch]);
    console.log("✓ Жаңа өзгерістер сәтті push жасалды!");
  } else {
    console.log("✓ Git жұмыс ағашы таза.");
  }

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

  console.log("\n--- 1. GitHub Actions тапсырмаларын жіберу ---");
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);

  for (const t of allTasks) {
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
    await ghRetry(["workflow", "run", WORKFLOW, "--ref", branch, ...Object.entries(fields).flatMap(([k, v]) => ["-f", `${k}=${v}`])]);
    await sleep(2500);
  }

  console.log("\n--- 2. GitHub runId-лерді анықтау ---");
  for (let attempt = 0; attempt < 35; attempt++) {
    const pendingWithoutRun = allTasks.filter((t) => t.rid && !t.runId);
    if (pendingWithoutRun.length === 0) break;

    await sleep(4000);
    const listRaw = await ghRetry(["run", "list", "--workflow", WORKFLOW, "--limit", "30", "--json", "databaseId,displayTitle,url"]);
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

  console.log("\n--- 3. Облактағы рендер процесін күту ---");
  const startTime = Date.now();
  while (true) {
    const pending = allTasks.filter((t) => !t.downloaded);
    if (pending.length === 0) break;

    for (const t of pending) {
      if (t.downloaded) continue;
      const statusRaw = await ghRetry(["run", "view", String(t.runId), "--json", "status,conclusion"]);
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
        await ghRetry(["run", "download", String(t.runId), "-n", `render-${t.rid}`, "-D", tmp]);

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

    writeFileSync(concatList, `file '${p0}'\nfile '${p1}'\n`, "utf8");

    console.log(`→ Concat p0 + p1 → ${v.id}-combined.mp4...`);
    runCmd("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", combinedVideo]);

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

    const phoneMp4 = join(FINAL_DIR, `${v.id}-v1_phone.mp4`).replace(/\\/g, "/");
    console.log(`→ Жеңіл телефон нұсқасын жасау → ${v.id}-v1_phone.mp4...`);
    runCmd("ffmpeg", [
      "-v", "error", "-y",
      "-i", finalMp4,
      "-c:v", "libx264",
      "-preset", "faster",
      "-crf", "27",
      "-c:a", "copy",
      "-movflags", "+faststart",
      phoneMp4,
    ]);

    const finalSize = (statSync(finalMp4).size / 1024 / 1024).toFixed(2);
    const phoneSize = (statSync(phoneMp4).size / 1024 / 1024).toFixed(2);
    console.log(`✅ [${v.id}] Дайын:`);
    console.log(`   - Түпнұсқа: ${finalMp4} (${finalSize} MB)`);
    console.log(`   - Телефон:  ${phoneMp4} (${phoneSize} MB)`);

    completedVideos.push({
      id: v.id,
      title: v.title,
      finalMp4,
      finalSize,
      phoneMp4,
      phoneSize,
      duration: v.duration,
    });
  }

  console.log("\n==================================================");
  console.log("🏁 3 ЖАҢА REELS ТОЛЫҚ ДАЙЫН БОЛДЫ!");
  console.log("==================================================");
  for (const c of completedVideos) {
    console.log(`• ${c.title}:`);
    console.log(`  Негізгі: ${c.finalMp4} (${c.finalSize} MB)`);
    console.log(`  Телефон: ${c.phoneMp4} (${c.phoneSize} MB)`);
  }
}

main().catch((err) => {
  console.error("\n❌ ҚАТЕ:", err.message);
  process.exit(1);
});
