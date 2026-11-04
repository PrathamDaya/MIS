import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const app = readFileSync(resolve(root, "js/app.js"), "utf8");
const css = readFileSync(resolve(root, "css/style.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");

test("Find a case focuses the live search without rerendering the current route", () => {
  assert.match(app, /let viewRenderPending=Promise\.resolve\(\)/);
  assert.match(app, /transition\.updateCallbackDone/);
  assert.match(app, /location\.hash==="#\/all"&&!routeCaseId\)\{if\(V==="mis"\)focus\(\)/);
  assert.match(app, /hashchange",\(\)=>Promise\.resolve\(viewRenderPending\)\.then\(focus\)/);
  assert.match(app, /searchText=v=>String\(v\?\?""\)\.toLowerCase\(\)\.normalize\("NFD"\)[\s\S]*?replace\(\/\[\^a-z0-9\]\+\/g," "\)/);
});

test("case-table columns are explicitly shared by heading filters and body cells", () => {
  assert.match(app, /<table class="mis-table"><colgroup>(?:<col>){10}<\/colgroup><thead>/);
  assert.match(css, /\.tw:not\(\.deadline-wrap\)>\.mis-table\{table-layout:fixed\}/);
  for (let column = 1; column <= 10; column++) assert.match(css, new RegExp(`\\.mis-table col:nth-child\\(${column}\\)\\{width:`));
  assert.match(css, /\.mis-table th input\[type=date\]\.col-filter\{width:100%;min-width:0/);
  assert.match(css, /\.tw:not\(\.deadline-wrap\) tr\.r td\[data-e\]\{cursor:pointer;font-weight:600\}/);
});

test("login shows progress immediately and cold loads state in one response after authorization", () => {
  assert.match(app, /if\(S\.co\.length\)\{await dbEnsure\(\);/);
  assert.match(app, /xst\("Connecting…","saving"\);render\(\);await xPull\(true\)/);
  assert.match(app, /catch\(e\)\{DB\.loadError=e\.message;if\(!DB\.ready\)render\(\)/);
  assert.match(app, /let includeDataOnFirstQuery=false/);
  assert.match(app, /includeDataOnFirstQuery\?"version,data":"version"/);
  assert.match(app, /const r=includeDataOnFirstQuery\?m:await dbRow\("version,data"\)/);
});

test("asset versions refresh the fixed table and search handler", () => {
  assert.match(html, /css\/style\.css\?v=20261104-3/);
  assert.match(html, /js\/app\.js\?v=20261104-5/);
});
