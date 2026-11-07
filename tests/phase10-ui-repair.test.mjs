import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const app = readFileSync(resolve(root, "js/app.js"), "utf8");
const css = readFileSync(resolve(root, "css/style.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");

test("account controls are unique and the quick dock has no duplicate settings actions", () => {
  for (const id of ["th", "rules", "dbs"]) assert.equal((html.match(new RegExp(`id="${id}"`, "g")) || []).length, 1);
  assert.deepEqual([...html.matchAll(/data-dock="([^"]+)"/g)].map((match) => match[1]), ["search", "add"]);
  assert.match(html, /class="header-actions"[\s\S]*id="dbs"[\s\S]*id="rules"[\s\S]*id="th"/);
});

test("navigation toggle opens only the tab bar, separately from the account menu", () => {
  const handler = app.slice(app.indexOf('navToggle?.addEventListener("click"'), app.indexOf('window.addEventListener("resize",syncNavIndicator'));
  assert.match(html, /id="nav-toggle"[^>]*aria-controls="primary-nav"/);
  assert.match(handler, /headerEl\.classList\.toggle\("nav-open"\)/);
  assert.doesNotMatch(handler, /mobileActions\.open/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*header \.more\{display:block[\s\S]*header \.more summary\{display:grid/);
  assert.match(css, /header \.header-actions #add\{grid-column:1\/-1;grid-row:2/);
  assert.match(css, /header \.header-actions \.more\{grid-column:3;grid-row:1/);
  assert.match(css, /header \.more>\.menu\{[^}]*width:min\(320px,calc\(100vw - 32px\)\)/);
});

test("dark totals, consistent type, and long committee action labels remain readable", () => {
  assert.match(css, /body,body \*:not\(svg\):not\(path\)\{font-family:inherit!important\}/);
  assert.match(css, /:root\[data-theme=dark\] \.ttl p\{color:#d1d1d6;opacity:1\}/);
  assert.match(css, /\.gen\{grid-template-columns:repeat\(auto-fit,minmax\(min\(100%,220px\),1fr\)\)\}/);
  assert.match(css, /\.gen>\.btn\{[^}]*white-space:normal;[^}]*overflow-wrap:anywhere/);
  assert.match(app, /id="bmail"[\s\S]*?Mails for these cases/);
});

test("visual updates use the refreshed asset version without changing data code", () => {
  assert.match(html, /css\/style\.css\?v=20261107-4/);
  assert.match(html, /js\/app\.js\?v=20261107-2/);
  assert.match(html, /js\/logic\.js\?v=20261105-1/);
});
