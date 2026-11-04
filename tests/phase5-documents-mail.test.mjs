import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const app = readFileSync(resolve(root, "js/app.js"), "utf8");
const guide = readFileSync(resolve(root, "docs/OUTLOOK_DRAFTS.md"), "utf8");

test("Word preflight joins split runs and blocks templates with unmapped placeholders", () => {
  assert.match(app, /function missingTemplatePlaceholders\(b64\)/);
  assert.match(app, /getElementsByTagName\("w:t"\)\]\[?[^;]*\.join\(""/);
  assert.match(app, /Template placeholders need fields/);
  assert.match(app, /Could not validate the Word template/);
  assert.ok(app.indexOf("const unmatched=selected.flatMap") < app.indexOf("const z=new PizZip();let count=0"));
});

test("EML drafts are the default and reminders carry reply-thread headers", () => {
  assert.match(app, /Download \.eml draft/);
  assert.match(app, /value="z">Download \.eml ZIP/);
  assert.match(app, /X-Unsent: 1/);
  assert.match(app, /Message-ID: \$\{messageId\}/);
  assert.match(app, /In-Reply-To: /);
  assert.match(app, /References: /);
  assert.match(app, /firstMessageId=rootId/);
});

test("CC can be loaded from the user's EML template and remains editable", () => {
  assert.match(app, /mail-eml-template/);
  assert.match(app, /headers\.match\(\/\^Cc:/);
  assert.match(app, /S\.mail=\{cc:\$\("#mx_cc"\)\.value\.trim\(\)/);
});

test("the optional Graph path is documented as drafts-only and not enabled", () => {
  assert.match(guide, /Optional Microsoft Graph integration/);
  assert.match(guide, /POST \/me\/messages/);
  assert.match(guide, /createReply/);
  assert.match(guide, /not implemented or enabled/);
  assert.match(guide, /Do not request Mail\.Send/);
});
