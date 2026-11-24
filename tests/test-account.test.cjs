"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const logic = require("../js/logic.js");
const account = require("./fixtures/test-account.cjs");

const TODAY = account.asOf;
const cases = account.cases;
const completed = cases.filter((row) => row.ud);
const byName = (name) => cases.find((row) => row.n === name);

test("the test account contains at least 20 completed cases on distinct dates", () => {
  assert.equal(account.id, "MIS_TEST_ACCOUNT_FIXTURE");
  assert.ok(completed.length >= 20);
  assert.equal(new Set(completed.map((row) => row.ud)).size, completed.length);
  assert.equal(new Set(completed.map((row) => row.cd)).size, completed.length);
  assert.ok(cases.every((row) => row.n.startsWith("TEST ") && row.em.endsWith("@example.test")));
});

for (const row of completed) {
  test(`completed case ${row.id} stays out of Deadlines after upload on ${row.ud}`, () => {
    assert.equal(logic.isDeadlinePending(row, TODAY), false);
    assert.ok(!logic.viewMembership(row, TODAY).includes("Deadlines"));
  });
}

test("past held timers remain listed until website upload is recorded", () => {
  const timerCases = cases.filter((row) => row.cm && row.cd <= TODAY && !row.ud && !row.tr && !row.w);
  assert.equal(timerCases.length, 5);
  for (const row of timerCases) assert.equal(logic.isDeadlinePending(row, TODAY), true);
  assert.equal(logic.isDeadlinePending(byName("TEST Active Timer 1"), TODAY), true,
    "an active timer remains visible even when its last PR date is after committee");
  assert.equal(logic.isDeadlinePending(byName("TEST Active Timer 2"), TODAY), true,
    "sending the client copy does not clear the website upload deadline");
});

test("future committee dates stay out of Deadlines, including a future timer marker", () => {
  const future = cases.filter((row) => row.cd > TODAY && !row.tr && !row.w);
  assert.equal(future.length, 4);
  for (const row of future) {
    assert.equal(logic.isDeadlinePending(row, TODAY), false);
    assert.ok(!logic.viewMembership(row, TODAY).includes("Deadlines"));
  }
});

test("legacy pending PR cases appear only once their committee date is reached", () => {
  const row = byName("TEST Legacy Pending 1");
  assert.equal(logic.isDeadlinePending(row, row.cd), true);
  assert.equal(logic.isDeadlinePending(row, plusDays(row.cd, -1)), false);
});

test("transferred, withdrawn, uploaded and undated records do not appear in Deadlines", () => {
  assert.equal(logic.isDeadlinePending(byName("TEST Transferred"), TODAY), false);
  assert.equal(logic.isDeadlinePending(byName("TEST Withdrawn"), TODAY), false);
  assert.equal(logic.isDeadlinePending(byName("TEST No Committee Date"), TODAY), false);
  assert.equal(logic.isDeadlinePending({ cd: "2026-11-03", cm: "2026-11-03", ud: "2026-11-04" }, TODAY), false);
});

test("post-committee deadlines calculate from the committee date", () => {
  const row = byName("TEST Active Timer 1");
  const due = logic.deadlines(row, { holidays: [], saturdayWorking: false });
  assert.equal(due.ratingLetterToClient, logic.addWorkingDays(row.cd, 1, { holidays: [], saturdayWorking: false }));
  assert.equal(due.pressReleaseToClient, due.ratingLetterToClient);
  assert.equal(due.websiteUpload, logic.addWorkingDays(row.cd, 7, { holidays: [], saturdayWorking: false }));
});

test("bulk reminders default to seven and fourteen calendar days after the first mail", () => {
  assert.deepEqual(logic.staggerMailDates({ m1: "2026-11-25" }, TODAY), {
    m1: "2026-11-25", r1: "2026-12-02", r2: "2026-12-09"
  });
  assert.deepEqual(logic.staggerMailDates({}, TODAY), {
    r1: "2026-12-01", r2: "2026-12-08"
  });
});

test("bulk reminders repair same-day dates but preserve later manual choices", () => {
  assert.deepEqual(logic.staggerMailDates({
    m1: TODAY, r1: TODAY, r2: TODAY
  }, TODAY), { m1: TODAY, r1: "2026-12-01", r2: "2026-12-08" });
  assert.deepEqual(logic.staggerMailDates({
    m1: "2026-11-25", r1: "2026-12-10", r2: "2026-12-20"
  }, TODAY), { m1: "2026-11-25", r1: "2026-12-10", r2: "2026-12-20" });
});

test("the app uses the shared deadline boundary and blocks future timer starts", () => {
  const app = readFileSync(resolve(__dirname, "../js/app.js"), "utf8");
  assert.match(app, /const pend=c=>M\.isDeadlinePending\(c,iso\(NOW\(\)\)\)/);
  assert.match(app, /if\(d>iso\(NOW\(\)\)\)return toast\("Committee has not been held yet/);
  assert.match(app, /M\.staggerMailDates\(c\.ml\.d\|\|\{\},iso\(TODAY\)\)/);
});

function plusDays(date, days) {
  const result = logic.dateFromISO(date);
  result.setUTCDate(result.getUTCDate() + days);
  return logic.toISO(result);
}
