import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (name) => readFileSync(join(root, name), "utf8");

test("MIS search uses a precomputed index and responds after 120 ms", () => {
  const app = read("js/app.js");
  assert.match(app, /function rebuildSearchIndex\(\)/);
  assert.match(app, /searchIndex\.get\(c\.id\)/);
  assert.match(app, /\}\,120\)/);
});

test("MIS keeps keyed case rows and caps large result windows at 300", () => {
  const app = read("js/app.js");
  assert.match(app, /function nodeKey\(/);
  assert.match(app, /function morphChildren\(/);
  assert.match(app, /function updateView\(/);
  assert.match(app, /L\.length>300\?L\.slice\(F\.start/);
  assert.match(app, /\(F\.start\)\+300/);
  assert.match(app, /id="window-next"/);
});

test("sync retry, user-scoped cache, and live updates have polling fallbacks", () => {
  const app = read("js/app.js");
  assert.match(app, /indexedDB\.open\("mis-cache-v1"/);
  assert.match(app, /cacheRead\(DB\.uid\)/);
  assert.match(app, /function retrySync\(\)/);
  assert.match(app, /failedSnapshot=dbState\(\)/);
  assert.match(app, /new WebSocket\(url\)/);
  assert.match(app, /setInterval\(\(\)=>\{if\(XH&&XH\.db&&!document\.hidden\)xPull\(\)\},30000\)/);
  assert.match(read("supabase/SECURITY_CHECKLIST.md"), /Enable live updates/);
});

