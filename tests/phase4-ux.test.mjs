import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const app = readFileSync(resolve(root, "js/app.js"), "utf8");

test("PR completion comes from recorded dates, not a saved done flag", () => {
  assert.match(app, /const prDone=c=>M\.isPrDone\(c\)/);
  assert.match(app, /delete c\.dn;delete c\.dd/);
  assert.doesNotMatch(app, /c\.dn\s*=\s*(?:true|false)/);
  assert.match(app, /function doneDlg\(ids\)/);
  assert.match(app, /Date uploaded/);
});

test("bulk deadlines operate only on checked cases and provide Undo", () => {
  assert.match(app, /function applyDeadlineBulk\(f\)/);
  assert.match(app, /const ids=\[\.\.\.\(F\.ds\|\|\[\]\)\]/);
  assert.match(app, /toastUndo\(\(f==="sd"\?"Client sent date":"Website upload date"\)/);
  assert.match(app, /id="dall-select">Select all pending/);
  assert.match(app, /id==="dsa"[\s\S]*?F\.visibleDeadlines/);
});

test("routes support all requested views and a case detail route", () => {
  for (const route of ["all", "ncd", "insights", "deadlines", "committee"]) {
    assert.match(app, new RegExp(route + ":"));
  }
  assert.ok(app.includes('raw.match(/^case\\/(\\d+)$/)'));
  assert.match(app, /addEventListener\("hashchange",applyRoute\)/);
  assert.ok(app.includes('e.key==="/"') && app.includes('e.key.toLowerCase()==="k"'));
});

test("company list settings and duplicate checks are wired into the form", () => {
  assert.match(app, /function settingsDlg\(\)/);
  assert.match(app, /S\.lists=\{an:parse\("an"\),gh:parse\("gh"\)\}/);
  assert.match(app, /data-new="\$\{k\}"/);
  assert.match(app, /similar company name already exists/i);
  assert.match(app, /settings-holidays/);
});
