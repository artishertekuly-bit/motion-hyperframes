#!/usr/bin/env node
// Жергілікті бақылаушы тоқтап қалған облачный рендерлерді күтіп, нәтижесін out/ ішіне жүктеу.
//   node scripts/cloud-fetch.mjs <request_id> [<request_id> ...]
// request_id — out/<аты>.log ішіндегі «Run <id> did not appear ...» жолынан.
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(HF, "out");
const GH = existsSync("C:/Program Files/GitHub CLI/gh.exe") ? "C:/Program Files/GitHub CLI/gh.exe" : "gh";
const gh = (...a) => { const r = spawnSync(GH, a, { encoding: "utf8", cwd: HF }); if (r.status !== 0) throw new Error(r.stderr); return r.stdout; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const left = new Set(process.argv.slice(2));
const t0 = Date.now();
while (left.size && Date.now() - t0 < 120 * 60000) {
  let list = [];
  try { list = JSON.parse(gh("run", "list", "--workflow", "render.yml", "--limit", "40", "--json", "databaseId,displayTitle,status,conclusion")); } catch (e) { await sleep(20000); continue; }
  for (const rid of [...left]) {
    const r = list.find((x) => x.displayTitle.includes(rid));
    if (!r || r.status !== "completed") continue;
    left.delete(rid);
    if (r.conclusion !== "success") { console.log(`✗ ${rid}: ${r.conclusion} (run ${r.databaseId})`); continue; }
    const tmp = join(OUT, `.dl-${rid}`);
    try { gh("run", "download", String(r.databaseId), "-n", `render-${rid}`, "-D", tmp); } catch (e) { console.log(`✗ ${rid}: download failed`); continue; }
    for (const f of readdirSync(tmp)) { let dest = join(OUT, f); if (existsSync(dest)) rmSync(dest); renameSync(join(tmp, f), dest); console.log(`✓ ${rid}: ${f}`); }
    rmSync(tmp, { recursive: true, force: true });
  }
  if (left.size) await sleep(30000);
}
if (left.size) console.log("still waiting:", [...left].join(" "));
