import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const app = readFileSync(resolve(root, "js/app.js"), "utf8");
const css = readFileSync(resolve(root, "css/style.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const vars = block => Object.fromEntries([...block.matchAll(/--([\w-]+):([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
const light = vars(css.match(/^:root\{([^}]+)\}/m)?.[1] ?? "");
const dark = vars(css.match(/^:root\[data-theme=dark\]\{([^}]+)\}/m)?.[1] ?? "");
function contrast(a, b) {
  const luminance = color => {
    const hex = color.replace("#", "");
    const normalized = hex.length === 3 ? [...hex].map(part => part + part).join("") : hex;
    const rgb = normalized.match(/[\da-f]{2}/gi).map(part => parseInt(part, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

test("view transitions and CSS fallback use brief 12px transform and opacity motion", () => {
  assert.match(app, /document\.startViewTransition\(update\)/);
  assert.match(app, /function transitionView\(\)[\s\S]*?update\(\);/);
  assert.match(app, /duration:250/);
  assert.doesNotMatch(app, /duration:520/);
  assert.match(css, /::view-transition-new\(mis-app\)\{animation:mis-view-in \.24s/);
  assert.match(css, /@keyframes mis-view-in\{from\{opacity:0;transform:translateY\(12px\)\}\}/);
  assert.match(css, /\.view-enter \.tw tbody tr\.r:nth-child\(-n\+10\)\{animation:mis-enter \.22s/);
  assert.match(css, /\.view-enter \.tw tbody tr\.r:nth-child\(10\)\{animation-delay:225ms\}/);
});

test("Badge Pop returns its count when inactive and honors reduced motion", () => {
  assert.match(app, /badge\.classList\.toggle\("badge-dots",b\.dataset\.v===V\)/);
  assert.match(css, /header nav \.tag\.badge-dots\{[^}]*color:transparent/);
  assert.match(css, /header nav \.tag\.badge-dots::before\{[^}]*animation:badgePop/);
  assert.match(css, /header nav \.tag\.badge-dots::before\{animation-duration:\.24s\}/);
  assert.match(css, /prefers-reduced-motion:reduce\)[\s\S]*?\.badge-dots/);
});

test("phone layouts use deadline cards, 44px controls, and no page-level horizontal scrolling", () => {
  assert.match(app, /data-label="\$\{sent\?"Client delivery due":"Website upload due"\}"/);
  assert.match(app, /class="deadline-company" data-e=/);
  assert.match(css, /@media\(max-width:640px\)[\s\S]*?\.deadline-table tbody tr\.r\{display:grid/);
  assert.match(css, /\.deadline-wrap \.deadline-table td input\[type=date\]\{min-height:44px/);
  assert.match(css, /html,body\{max-width:100%;overflow-x:hidden\}/);
  assert.match(css, /main \.tw:not\(\.deadline-wrap\) \.btn\{min-height:44px\}/);
  assert.match(app, /aria-label="Add \$\{esc\(c\.n\)\} to committee basket"/);
  assert.match(css, /:focus-visible\{outline:2px solid var\(--acc\)/);
});

test("reduced motion disables animations and primary button text stays legible in both themes", () => {
  assert.match(css, /prefers-reduced-motion:reduce\)\{\s*\*,\*::before,\*::after\{animation:none!important;transition:none!important;scroll-behavior:auto!important\}/);
  assert.match(css, /:root\[data-theme=dark\] \.btn\.p\{background:var\(--acc\);border-color:var\(--acc\);color:#0e1116\}/);
  assert.match(css, /:root\[data-theme=dark\] #sel \.btn\.p\{color:#0e1116\}/);
  assert.match(html, /css\/style\.css\?v=20261104-3/);
});

test("key text, status, and accent pairs meet WCAG AA contrast in both themes", () => {
  for (const palette of [light, dark]) {
    assert.ok(contrast(palette.ink, palette.bg) >= 4.5);
    assert.ok(contrast(palette.ink, palette.card) >= 4.5);
    assert.ok(contrast(palette.mut, palette.bg) >= 4.5);
    for (const key of ["bad", "warn", "ok", "acc"]) assert.ok(contrast(palette[key], palette[`${key}s`]) >= 4.5, `${key} contrast`);
  }
  assert.ok(contrast("#ffffff", "#151716") >= 4.5);
  assert.ok(contrast("#0e1116", dark.acc) >= 4.5);
});
