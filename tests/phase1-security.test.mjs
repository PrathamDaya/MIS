import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (name) => readFileSync(join(root, name), "utf8");

test("the static page gates case views behind Supabase Auth and has no CDN scripts", () => {
  const html = read("index.html");
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  assert.doesNotMatch(html, /<script[^>]+src="https?:/i);
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
  assert.doesNotMatch(html, /fonts\.googleapis\.com|cdn\.jsdelivr\.net/);
  const app = read("js/app.js");
  assert.match(app, /if\(!DB\.cfg\(\)\).*Sign in required/s);
  assert.match(app, /30\*60\*1000/);
  assert.match(app, /auth\/v1\/logout/);
  assert.doesNotMatch(app, /showOpenFilePicker|createWritable/);
});

test("the security migration allow-lists users and writes audit history in Postgres", () => {
  const migration = read("supabase/migrations/20261103121739_secure_allowed_users_and_audit_log.sql");
  assert.match(migration, /create table if not exists public\.allowed_users/i);
  assert.match(migration, /create table if not exists public\.audit_log/i);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /create policy mis_state_select_allowed_owner/i);
  assert.match(migration, /create policy mis_state_insert_allowed_owner/i);
  assert.match(migration, /create policy mis_state_update_allowed_owner/i);
  assert.match(migration, /create trigger mis_state_audit_changes/i);
  assert.match(migration, /check \(source in \('ui', 'import', 'bulk'\)\)/i);
  assert.match(migration, /v_headers ->> 'x-client-info'/i);
  assert.match(migration, /set search_path = pg_catalog, public, auth/i);
  assert.match(read("js/app.js"), /x-client-info.*source=/);
  assert.match(read("supabase/policies.sql"), /revoke all on public\.mis_state from public, anon, authenticated/i);
});

test("the current tree has no confidential data files or service credentials", () => {
  const files = [];
  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.name === ".git" || item.name === "node_modules" || item.name === "work") continue;
      const path = join(dir, item.name);
      if (item.isDirectory()) walk(path);
      else files.push(path);
    }
  };
  walk(root);
  assert.equal(files.some((path) => /\.(xlsx|xlsm|xls|csv|eml|docx|backup)$/i.test(path)), false);
  const clientCode = ["index.html", "js/app.js", "js/motion-setup.js"].map(read).join("\n");
  assert.doesNotMatch(clientCode, /sb_secret_[A-Za-z0-9_-]{10,}|service_role\s*[:=]|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/i);
  assert.match(read("supabase/SECURITY_CHECKLIST.md"), /Historical workbook purge plan/i);
});
