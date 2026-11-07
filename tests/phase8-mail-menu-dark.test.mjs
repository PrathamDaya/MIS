import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const app = readFileSync(resolve(root, "js/app.js"), "utf8");
const css = readFileSync(resolve(root, "css/style.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const darkBlock = css.match(/^:root\[data-theme=dark\]\{([^}]+)\}/m)?.[1] ?? "";
const darkVars = Object.fromEntries([...darkBlock.matchAll(/--([\w-]+):([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));

function contrast(a, b) {
  const luminance = color => {
    const rgb = color.replace("#", "").match(/[\da-f]{2}/gi).map(part => parseInt(part, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

test("client email lists reach checklist and Outlook drafts as multiple recipients", () => {
  assert.match(app, /window\.MISLogic\.formatEmailHeader\(to\)/);
  assert.match(app, /window\.MISLogic\.formatOutlookRecipients\(to\)/);
  assert.match(app, /To: \$\{toHeader\}/);
  assert.match(app, /m\.To=D\(T\)/);
  assert.match(app, /window\.MISLogic\.isValidEmailList\(c\.em\)/);
  assert.match(app, /Separate multiple client email addresses with semicolons/);
});

test("sign in and sign out live inside the three-dot actions menu", () => {
  const menu = html.match(/<div class="menu">([\s\S]*?)<\/div><\/details>/)?.[1] ?? "";
  const headerBeforeMenu = html.match(/<header>([\s\S]*?)<div class="menu">/)?.[1] ?? "";
  assert.match(menu, /id="auth-action" type="button"[\s\S]*?<span class="menu-label">Sign in<\/span><\/button>/);
  assert.doesNotMatch(headerBeforeMenu, /id="auth-action"/);
  assert.equal((html.match(/id="auth-action"/g) ?? []).length, 1);
});

test("dark mode preserves readable KPI, header and sign-in button text", () => {
  assert.match(css, /:root\[data-theme=dark\] \.st\{background:var\(--card\);border-color:var\(--line\);color:var\(--ink\)\}/);
  assert.match(css, /:root\[data-theme=dark\] header h1 small\{background:var\(--card\);color:var\(--mut\)\}/);
  assert.match(css, /:root\[data-theme=dark\] dialog \.db-login-actions \.btn\.p\{color:var\(--bg\)\}/);
  assert.ok(contrast(darkVars.ink, darkVars.card) >= 4.5);
  assert.ok(contrast(darkVars.bg, darkVars.acc) >= 4.5);
});

test("asset cache versions include the email helpers and dark-mode fixes", () => {
  assert.match(html, /css\/style\.css\?v=20261107-2/);
  assert.match(html, /js\/logic\.js\?v=20261105-1/);
  assert.match(html, /js\/app\.js\?v=20261107-2/);
});
