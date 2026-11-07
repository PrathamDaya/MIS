import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const app = readFileSync(resolve(root, "js/app.js"), "utf8");
const css = readFileSync(resolve(root, "css/style.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const favicon = readFileSync(resolve(root, "assets/favicon.svg"), "utf8");

test("Apple-inspired interface uses one responsive system font and aligned icon set", () => {
  assert.match(css, /font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif/);
  assert.match(html, /class="brand-mark"/);
  assert.match(favicon, /viewBox="0 0 64 64"/);
  assert.match(app, /const UI_ICONS=/);
  assert.match(css, /\.ui-icon\{[^}]*stroke-linecap:round;stroke-linejoin:round/);
  for (const glyph of ["↗", "📝", "✉", "⚠", "✓", "◷"]) assert.doesNotMatch(app, new RegExp(glyph));
});

test("tab indicator uses scroll-aware spring motion and respects reduced motion", () => {
  assert.match(app, /a\.left-n\.left\+nav\.scrollLeft/);
  assert.match(app, /scale\("\+\(oldW\/w\)\+","\+\(oldH\/h\)\+"\)/);
  assert.match(app, /duration:280,easing:"cubic-bezier\(\.2,1\.25,\.4,1\)"/);
  assert.match(css, /#primary-nav \.nav-indicator\{transform-origin:top left;will-change:transform\}/);
  assert.match(css, /prefers-reduced-motion:reduce\)[\s\S]*?#primary-nav \.nav-indicator/);
});

test("account dropdown retains sign-in, sign-out, database and settings actions", () => {
  assert.match(html, /class="profile-card"/);
  assert.match(html, /id="profile-status"/);
  for (const id of ["auth-action", "dbs", "settings", "rules", "th"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(app, /function updateAuthAction\(\)[\s\S]*?querySelector\("\.menu-label"\)/);
  assert.match(app, /#auth-action"\)\.onclick=\(\)=>DB\.cfg\(\)\?dbSignOut\(false\):dbDlg\(\)/);
  assert.match(html, /aria-label="More actions"/);
});

test("phone and laptop layouts preserve navigation, 44px targets, and safe-area viewport", () => {
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*?\.menu\{[^}]*max-height:min\(72dvh,540px\)/);
  assert.match(css, /@media\(max-width:380px\)/);
  assert.match(css, /@media\(min-width:1101px\)[\s\S]*header\{display:grid/);
  assert.match(css, /\.btn,#primary-nav button,\.menu button,input:not\(\[type=checkbox\]\),select,\.date-filter\{min-height:44px\}/);
  assert.match(html, /id="nav-toggle"[^>]*aria-controls="primary-nav"/);
});

test("interface cache versions refresh only the visual layer and app code", () => {
  assert.match(html, /assets\/favicon\.svg\?v=20261107-2/);
  assert.match(html, /css\/style\.css\?v=20261107-2/);
  assert.match(html, /js\/app\.js\?v=20261107-2/);
  assert.match(html, /js\/logic\.js\?v=20261105-1/);
});
