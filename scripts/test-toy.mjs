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
  "assets/toy/bg.js",
  "assets/toy/timing.js",
  "assets/common/reels-engine.js",
  "assets/toy/shots.js",
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

for (const t of [0, 5, 20, 40, 60, 90, 115, 140, 165, 185, 210]) {
  engine.renderAt(t, mockRoot);
  console.log(`t=${t} OK`);
}
console.log("ALL TOY FRAMES PASS CLEANLY!");
