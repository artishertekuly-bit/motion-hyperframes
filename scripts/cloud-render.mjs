#!/usr/bin/env node
// Облачный рендер HyperFrames: push → gh workflow run → gh run watch → gh run download.
// Ноутбук ничего не рендерит, только ждёт и скачивает результат.
//
//   node scripts/cloud-render.mjs video  --name test-v1 [--quality draft] [--range 2-6] [--composition index.html] [--fps 30]
//   node scripts/cloud-render.mjs stills --name keys-v1 --at 0.5,2,3.5
//   node scripts/cloud-render.mjs final  --name rolik-v1 [--quality high] [--no-phone]
//
// Черновики, стоп-кадры и листы кадров → out/ проекта, готовые MP4 режима final → Motion/final/.
// Существующие файлы не перезаписываются: к имени добавляется id запуска.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "out");
const FINAL_DIR = process.env.MOTION_FINAL_DIR || resolve(ROOT, "..", "..", "final");
const WORKFLOW = "render.yml";

const die = (msg) => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

// ---------- аргументы ----------
const [mode, ...rest] = process.argv.slice(2);
if (!["video", "stills", "final"].includes(mode)) {
  die("Usage: node scripts/cloud-render.mjs <video|stills|final> --name <name> [--composition index.html] [--quality draft|looks|high] [--range 2-6] [--at 0.5,2] [--fps 30] [--no-phone]");
}
const opts = { composition: "index.html", quality: mode === "final" ? "high" : "looks", range: "", at: "", fps: "", phone: true, name: "" };
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  const key = a.slice(2);
  if (a === "--no-phone") opts.phone = false;
  else if (a.startsWith("--") && ["composition", "quality", "range", "at", "fps", "name"].includes(key)) opts[key] = rest[++i] ?? "";
  else die(`Unknown argument: ${a}`);
}
if (!/^[A-Za-z0-9._-]+$/.test(opts.name)) die("--name is required (letters, digits, . _ -), e.g. --name test-v1");
if (!/^[A-Za-z0-9_./-]+\.html$/.test(opts.composition) || opts.composition.includes("..")) die("--composition must be an .html file inside the project");
if (!/^(draft|looks|standard|high|delivery)$/.test(opts.quality)) die("--quality must be draft, looks or high");
if (mode === "stills" && !/^\d+(\.\d+)?(,\d+(\.\d+)?)*$/.test(opts.at)) die("stills need --at like 0.5,2,3.5 (seconds)");
if (opts.range && !/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(opts.range)) die("--range must look like 2-6 (seconds)");
if (opts.fps && !/^\d+(\/\d+)?$/.test(opts.fps)) die("--fps must be a number like 30");

// ---------- инструменты ----------
const findGh = () => {
  for (const c of ["gh", "C:\\Program Files\\GitHub CLI\\gh.exe"]) {
    if (spawnSync(c, ["--version"], { encoding: "utf8" }).status === 0) return c;
  }
  die("GitHub CLI (gh) not found");
};
const GH = findGh();

const run = (cmd, args, { allowFail = false } = {}) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !allowFail) die(`${basename(cmd)} ${args.join(" ")}\n${(r.stderr || r.stdout || "").trim()}`);
  return r;
};
const git = (...args) => run("git", args).stdout.trim();
const gh = (...args) => run(GH, args).stdout.trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 1. код на GitHub совпадает с локальным ----------
const dirty = git("status", "--porcelain");
if (dirty) die(`Uncommitted changes — commit them first, the server renders what is pushed:\n${dirty}`);
const branch = git("rev-parse", "--abbrev-ref", "HEAD");
const upstream = run("git", ["rev-parse", "--abbrev-ref", "@{u}"], { allowFail: true });
if (upstream.status !== 0) die(`Branch ${branch} has no upstream on GitHub (git push -u origin ${branch})`);
if (Number(git("rev-list", "--count", "@{u}..HEAD")) > 0) {
  console.log(`→ git push (${branch})`);
  run("git", ["push", "--quiet"]);
}
const sha = git("rev-parse", "--short", "HEAD");

// ---------- 2. запуск ----------
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
const rid = `${stamp}-${Math.random().toString(36).slice(2, 6)}`;
const fields = {
  request_id: rid, mode, composition: opts.composition, name: opts.name, quality: opts.quality,
  range: opts.range, at: opts.at, fps: opts.fps, phone_copy: String(opts.phone),
};
const what = mode === "stills" ? `at ${opts.at}` : `${opts.quality}${opts.range ? " range " + opts.range : ""}`;
console.log(`→ gh workflow run ${WORKFLOW}  [${mode} ${opts.composition} ${opts.name} ${what}] @ ${sha}`);
gh("workflow", "run", WORKFLOW, "--ref", branch, ...Object.entries(fields).flatMap(([k, v]) => ["-f", `${k}=${v}`]));

let runInfo;
for (let t = 0; t < 40 && !runInfo; t++) {
  await sleep(3000);
  const list = JSON.parse(gh("run", "list", "--workflow", WORKFLOW, "--limit", "20", "--json", "databaseId,displayTitle,url"));
  runInfo = list.find((r) => r.displayTitle.includes(rid));
}
if (!runInfo) die(`Run ${rid} did not appear on GitHub within 2 minutes`);
console.log(`→ run ${runInfo.databaseId}: ${runInfo.url}`);

// ---------- 3. ожидание ----------
mkdirSync(join(OUT_DIR, "logs"), { recursive: true });
const t0 = Date.now();
const watch = run(GH, ["run", "watch", String(runInfo.databaseId), "--exit-status", "--compact", "--interval", "20"], { allowFail: true });
writeFileSync(join(OUT_DIR, "logs", `${rid}-watch.log`), (watch.stdout || "") + (watch.stderr || ""));
const minutes = ((Date.now() - t0) / 60000).toFixed(1);
if (watch.status !== 0) {
  const log = run(GH, ["run", "view", String(runInfo.databaseId), "--log-failed"], { allowFail: true }).stdout || "";
  writeFileSync(join(OUT_DIR, "logs", `${rid}-failed.log`), log);
  console.error(log.split("\n").slice(-60).join("\n"));
  die(`Render failed after ${minutes} min: ${runInfo.url}`);
}
console.log(`✓ render finished in ${minutes} min`);

// ---------- 4. скачивание ----------
const tmp = join(OUT_DIR, `.dl-${rid}`);
gh("run", "download", String(runInfo.databaseId), "-n", `render-${rid}`, "-D", tmp);

const saved = [];
for (const f of readdirSync(tmp)) {
  const toFinal = mode === "final" && extname(f) === ".mp4";
  const dir = toFinal ? FINAL_DIR : OUT_DIR;
  mkdirSync(dir, { recursive: true });
  let dest = join(dir, f);
  if (existsSync(dest)) dest = join(dir, `${basename(f, extname(f))}-${rid}${extname(f)}`);
  renameSync(join(tmp, f), dest);
  saved.push(dest);
}
rmSync(tmp, { recursive: true, force: true });

console.log("✓ downloaded:");
for (const p of saved) console.log(`   ${p}  (${(statSync(p).size / 1024 / 1024).toFixed(2)} MB)`);
