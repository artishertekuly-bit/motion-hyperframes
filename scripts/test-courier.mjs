import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HF = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const win = { window: null };
win.window = win;
const ctx = vm.createContext(win);

for (const f of [
  "assets/characters/artur/artur-rig.js",
  "assets/songy/bg.js",
  "assets/courier/bg.js",
  "assets/courier/timing.js",
  "assets/common/reels-engine.js",
  "assets/courier/shots.js",
]) {
  console.log("Loading", f);
  vm.runInContext(readFileSync(resolve(HF, f), "utf8"), ctx, { filename: f });
}

console.log("Total:", win.SONGY_T.total, "Shots:", (win.REELS_SHOTS || win.SONGY_SHOTS).length);
const engine = win.REELS || win.SONGY;
const mockRoot = {
  innerHTML: "",
  querySelector(sel) {
    return {
      style: {},
      setAttribute() {},
      removeAttribute() {},
      innerHTML: "",
    };
  },
};

for (const t of [0, 5, 15, 30, 60, 90, 120, 150, 180, 210, 220]) {
  engine.renderAt(t, mockRoot);
  console.log(`t=${t} OK`);
}
console.log("ALL FRAMES PASS CLEANLY!");
