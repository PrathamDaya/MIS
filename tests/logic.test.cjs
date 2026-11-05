const test = require("node:test");
const assert = require("node:assert/strict");
const logic = require("../js/logic.js");

const weekdays = { holidays: [], saturdayWorking: false };

test("transfer and NCD cases remain in All and NCD membership", () => {
  const transfer = { tr: true, ncd: true, cd: "2026-11-02", lp: "2026-10-30" };
  assert.deepEqual(logic.viewMembership(transfer), ["All", "Insights", "NCD"]);
  assert.equal(logic.isPrPending(transfer), true);
});

test("a Done case with no committee date has no PR pending or deadlines", () => {
  const done = { dn: true, cd: "", lp: "2026-11-03" };
  assert.equal(logic.isPrPending(done), false);
  assert.equal(logic.isPrDone(done), false);
  assert.equal(logic.committeeDateForDisplay(done), "");
  assert.deepEqual(logic.deadlines(done), { ratingLetterToClient: "", pressReleaseToClient: "", websiteUpload: "" });
});

test("logic never fills a missing committee date for Done or unpresented cases", () => {
  for (const row of [{ dn: true, cd: "", lp: "2026-11-04" }, { dn: false, cd: "", lp: "" }]) {
    const before = JSON.stringify(row);
    logic.isPrPending(row);
    logic.committeeDateForDisplay(row);
    logic.deadlines(row);
    logic.viewMembership(row);
    assert.equal(row.cd, "");
    assert.equal(JSON.stringify(row), before);
  }
});

test("committee date display is blank when PR is after or equal to committee", () => {
  assert.equal(logic.committeeDateForDisplay({ cd: "2026-11-03", lp: "2026-11-04" }), "");
  assert.equal(logic.committeeDateForDisplay({ cd: "2026-11-03", lp: "2026-11-03" }), "");
  assert.equal(logic.committeeDateForDisplay({ cd: "2026-11-03", lp: "2026-11-02" }), "2026-11-03");
  assert.equal(logic.isPrPending({ cd: "2026-11-03", lp: "2026-11-04" }), false);
  assert.equal(logic.isPrPending({ cd: "2026-11-03", lp: "2026-11-02" }), true);
  assert.equal(logic.isPrDone({ cd: "2026-11-03", lp: "2026-11-04" }), true);
  assert.equal(logic.isPrDone({ cd: "2026-11-03", lp: "2026-11-03" }), true);
  assert.equal(logic.isPrDone({ cd: "2026-11-03", lp: "2026-11-02" }), false);
  assert.equal(logic.isPrDone({ cd: "2026-11-03", ud: "2026-11-04" }), true);
});

test("working day deadlines skip weekends and configured holidays", () => {
  assert.equal(logic.addWorkingDays("2026-11-06", 1, weekdays), "2026-11-09");
  assert.equal(logic.addWorkingDays("2026-11-06", 7, weekdays), "2026-11-17");
  assert.equal(logic.addWorkingDays("2026-11-06", 1, { holidays: ["2026-11-09"] }), "2026-11-10");
  assert.equal(logic.deadlines({ cd: "2026-11-06" }, { holidays: ["2026-11-09"] }).ratingLetterToClient, "2026-11-10");
  assert.equal(logic.addWorkingDays("2026-12-31", 1, weekdays), "2027-01-01");
  assert.equal(logic.addWorkingDays("2026-01-30", 1, weekdays), "2026-02-02");
});

test("2nd and 4th Saturday rule is optional and defaults to weekends off", () => {
  assert.equal(logic.isWorkingDay("2026-11-14"), false);
  assert.equal(logic.isWorkingDay("2026-11-07", { saturdayWorking: true }), true);
  assert.equal(logic.isWorkingDay("2026-11-14", { saturdayWorking: true, secondFourthSaturdayOff: true }), false);
});

test("deadlines and deadline status cover the expected states", () => {
  assert.deepEqual(logic.deadlines({ cd: "2026-11-05" }, weekdays), {
    ratingLetterToClient: "2026-11-06", pressReleaseToClient: "2026-11-06", websiteUpload: "2026-11-16"
  });
  assert.equal(logic.deadlineStatus({ due: "2026-11-04" }, "2026-11-04"), "Due today");
  assert.equal(logic.deadlineStatus({ due: "2026-11-03" }, "2026-11-04"), "Overdue");
  assert.equal(logic.deadlineStatus({ due: "2026-11-05" }, "2026-11-04"), "Not due");
  assert.equal(logic.deadlineStatus({ due: "2026-11-03", done: true }, "2026-11-04"), "Done");
  assert.ok(logic.viewMembership({ inCommittee: true }).includes("Committee"));
});

test("import dates normalize Excel serials and Indian text dates safely", () => {
  assert.equal(logic.parseImportDate(1), "1900-01-01");
  assert.equal(logic.parseImportDate(60), "");
  assert.equal(logic.parseImportDate(46235), "2026-08-01");
  assert.equal(logic.parseImportDate("04-Nov-26"), "2026-11-04");
  assert.equal(logic.parseImportDate("04/11/2026"), "2026-11-04");
  assert.equal(logic.parseImportDate("2026-11-04"), "2026-11-04");
  assert.equal(logic.parseImportDate("31/02/2026"), "");
});

test("calendar date helpers stay timezone independent", () => {
  assert.equal(logic.toISO(logic.dateFromISO("2026-11-04")), "2026-11-04");
  assert.equal(logic.addCalendarYears("2024-02-29", 1), "2025-02-28");
  assert.equal(logic.todayInTimezone(new Date("2026-11-03T19:00:00Z")), "2026-11-04");
});

test("semicolon-separated client email addresses validate and format for mail drafts", () => {
  const addresses = "first@example.com; second@example.org; FIRST@example.com";
  assert.deepEqual(logic.parseEmailAddresses(addresses), ["first@example.com", "second@example.org"]);
  assert.equal(logic.isValidEmailList(addresses), true);
  assert.equal(logic.isValidEmailList("first@example.com; invalid-address"), false);
  assert.equal(logic.formatEmailHeader(addresses), "first@example.com, second@example.org");
  assert.equal(logic.formatOutlookRecipients(addresses), "first@example.com; second@example.org");
});
