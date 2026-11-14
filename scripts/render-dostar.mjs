#!/usr/bin/env node
// «Достар және Поход» — YouTube 16:9 Full HD (1920x1080) видеосын бұлтта 3 бөлікпен параллель рендерлеу және жинақтау
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

const VIDEO = {
  id: "dostar",
  title: "Достар және Поход: Қалай аман қалдық?",
  composition: "dostar.html",
  duration: 377,
  audio: resolve(ROOT, "../../materials/dostar/audio/mix.wav"),
  chunks: [
    { name: "dostar-p0", range: "0-126" },
    { name: "dostar-p1", range: "126-252" },
    { name: "dostar-p2", range: "252-377" },
  ],
};

async function main() {
  console.log("==================================================");
  console.log("🚀 «Достар және Поход» YouTube Рендер Басталды (3 бөлік)");
  console.log("==================================================");

  // Git commit & push
  console.log("\n--- 1. Git өзгерістерін push жасау ---");
  runCmd("git", ["add", "-A"]);
  const status = runCmd("git", ["status", "--porcelain"]).stdout.trim();
  if (status) {
    console.log("Commit жасалуда...");
    runCmd("git", ["commit", "-m", "fix(dostar): fix character framing and camera heights across all shots"]);
  }
  console.log("Push origin main...");
  runCmd("git", ["push", "origin", "main"]);
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  console.log(`Филиал: ${branch}, Git синхрондалды.`);

  const allTasks = VIDEO.chunks.map((c) => ({
    videoId: VIDEO.id,
    chunkName: c.name,
    range: c.range,
    composition: VIDEO.composition,
    outputMp4: join(OUT_DIR, `${c.name}.mp4`),
    rid: null,
    runId: null,
    status: "pending",
    downloaded: false,
  }));

  console.log("\n--- 2. GitHub Actions тапсырмаларын жіберу ---");
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);

  for (const t of allTasks) {
    if (existsSync(t.outputMp4) && statSync(t.outputMp4).size > 5 * 1024 * 1024) {
      console.log(`⏩ [${t.chunkName}] Файл бар: ${t.outputMp4}`);
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

    console.log(`→ [${t.chunkName}] Workflow жіберу (range ${t.range}, rid ${t.rid})...`);
    gh("workflow", "run", WORKFLOW, "--ref", branch, ...Object.entries(fields).flatMap(([k, v]) => ["-f", `${k}=${v}`]));
    await sleep(2500);
  }

  console.log("\n--- 3. GitHub runId-лерді анықтау ---");
  for (let attempt = 0; attempt < 30; attempt++) {
    const pendingWithoutRun = allTasks.filter((t) => t.rid && !t.runId);
    if (pendingWithoutRun.length === 0) break;

    await sleep(4000);
    const listRaw = gh("run", "list", "--workflow", WORKFLOW, "--limit", "30", "--json", "databaseId,displayTitle,url");
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

  console.log("\n--- 4. Бұлттағы рендер процесін бақылау ---");
  const startTime = Date.now();
  let allDone = false;

  while (!allDone) {
    await sleep(15000);
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    let completedCount = 0;
    for (const t of allTasks) {
      if (t.status === "completed") {
        completedCount++;
        continue;
      }

      const viewRaw = gh("run", "view", String(t.runId), "--json", "status,conclusion");
      const view = JSON.parse(viewRaw);

      if (view.status === "completed") {
        if (view.conclusion === "success") {
          t.status = "completed";
          completedCount++;
          console.log(`🎉 [${t.chunkName}] Сәтті аяқталды! (${elapsed}с өтті)`);
        } else {
          t.status = "failed";
          throw new Error(`[${t.chunkName}] Рендер қатемен аяқталды: ${view.conclusion}`);
        }
      } else {
        t.status = view.status;
      }
    }

    console.log(`⏳ Прогресс: ${completedCount}/${allTasks.length} бөлік дайын (уақыт: ${elapsed}с)`);
    if (completedCount === allTasks.length) {
      allDone = true;
    }
  }

  console.log("\n--- 5. Артефакттарды жүктеп алу ---");
  for (const t of allTasks) {
    if (t.downloaded) continue;

    console.log(`→ [${t.chunkName}] Артефактты жүктеу (#${t.runId})...`);
    const tmpDir = join(OUT_DIR, `tmp-${t.chunkName}`);
    mkdirSync(tmpDir, { recursive: true });

    gh("run", "download", String(t.runId), "--dir", tmpDir);

    const findMp4 = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          const found = findMp4(full);
          if (found) return found;
        } else if (entry.isFile() && extname(entry.name) === ".mp4") {
          return full;
        }
      }
      return null;
    };

    const downloadedMp4 = findMp4(tmpDir);
    if (!downloadedMp4) {
      throw new Error(`[${t.chunkName}] Жүктелген артефактта .mp4 табылмады!`);
    }

    renameSync(downloadedMp4, t.outputMp4);
    rmSync(tmpDir, { recursive: true, force: true });

    const sizeMb = (statSync(t.outputMp4).size / 1024 / 1024).toFixed(1);
    console.log(`✓ [${t.chunkName}] Сақталды: ${t.outputMp4} (${sizeMb} MB)`);
    t.downloaded = true;
  }

  console.log("\n--- 6. Бөліктерді біріктіру және дыбыс миксі ---");
  const concatList = join(OUT_DIR, "dostar_concat.txt");
  const concatLines = allTasks.map((t) => `file '${t.outputMp4.replace(/\\/g, "/")}'`).join("\n");
  writeFileSync(concatList, concatLines, "utf8");

  const combinedVideo = join(OUT_DIR, "dostar-combined.mp4").replace(/\\/g, "/");
  console.log(`→ Concat p0 + p1 + p2 → dostar-combined.mp4...`);
  runCmd("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", combinedVideo]);

  const finalMp4 = join(FINAL_DIR, "dostar-v1.mp4").replace(/\\/g, "/");
  const audioPath = VIDEO.audio.replace(/\\/g, "/");
  console.log(`→ Master Audio (${audioPath}) қосу → dostar-v1.mp4...`);
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

  const finalPhoneMp4 = join(FINAL_DIR, "dostar-v1_phone.mp4").replace(/\\/g, "/");
  console.log(`→ Жеңіл телефон көшірмесін жасау → dostar-v1_phone.mp4...`);
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

  console.log("\n==================================================");
  console.log(`🏆 [ДОСТАР] ТОЛЫҚ ДАЙЫН!`);
  console.log(`Формат: ${w}x${h} @ ${fpsStr}fps`);
  console.log(`Ұзақтығы: ${parseFloat(dur).toFixed(1)} секунд (${(parseFloat(dur) / 60).toFixed(1)} мин)`);
  console.log(`Мастер файл: ${finalMp4} (${sizeMb} MB)`);
  console.log(`Телефон нұсқасы: ${finalPhoneMp4} (${sizePhoneMb} MB)`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("\n❌ Қате:", err.message);
  process.exit(1);
});
