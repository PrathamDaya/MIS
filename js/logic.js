(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.MISLogic = api;
})(typeof globalThis === "undefined" ? this : globalThis, function () {
  const DAY_MS = 86400000;
  const pad = n => String(n).padStart(2, "0");
  const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

  function fromParts(year, month, day) {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return "";
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  function toISO(value) {
    if (value instanceof Date && Number.isFinite(value.getTime())) return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
    const match = String(value ?? "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? fromParts(+match[1], +match[2], +match[3]) : "";
  }

  function dateFromISO(value) {
    const iso = toISO(value);
    if (!iso) return null;
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  function parseImportDate(value) {
    if (value == null || value === "") return "";
    if (typeof value === "number" && Number.isFinite(value)) {
      const serial = Math.floor(value);
      if (serial < 1 || serial > 200000) return "";
      if (serial === 60) return ""; // Excel's fictitious 29-Feb-1900.
      const epoch = serial < 60 ? Date.UTC(1899, 11, 31) : Date.UTC(1899, 11, 30);
      const date = new Date(epoch + serial * DAY_MS);
      return fromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }
    const text = String(value).trim();
    let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|T|\s)/);
    if (match) return fromParts(+match[1], +match[2], +match[3]);
    match = text.match(/^(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{2}|\d{4})$/);
    if (match) {
      const month = MONTHS[match[2].toLowerCase()];
      const rawYear = +match[3];
      const year = match[3].length === 2 ? (rawYear < 50 ? 2000 + rawYear : 1900 + rawYear) : rawYear;
      return fromParts(year, month, +match[1]);
    }
    match = text.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2}|\d{4})$/);
    if (match) {
      const rawYear = +match[3];
      const year = match[3].length === 2 ? (rawYear < 50 ? 2000 + rawYear : 1900 + rawYear) : rawYear;
      return fromParts(year, +match[2], +match[1]);
    }
    return "";
  }

  function todayInTimezone(now = new Date(), timeZone = "Asia/Kolkata") {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function isWorkingDay(dateValue, calendar = {}) {
    const iso = toISO(dateValue);
    const date = dateFromISO(iso);
    if (!date) return false;
    const weekday = date.getUTCDay();
    if (weekday === 0) return false;
    if (weekday === 6) {
      if (!calendar.saturdayWorking) return false;
      const nth = Math.floor((date.getUTCDate() - 1) / 7) + 1;
      if (calendar.secondFourthSaturdayOff && (nth === 2 || nth === 4)) return false;
    }
    const holidays = new Set((calendar.holidays || calendar.hol || []).map(toISO).filter(Boolean));
    return !holidays.has(iso);
  }

  function addWorkingDays(dateValue, count, calendar = {}) {
    let iso = toISO(dateValue);
    if (!iso || !Number.isInteger(Number(count))) return "";
    let remaining = Math.abs(Number(count));
    const direction = Number(count) < 0 ? -1 : 1;
    while (remaining > 0) {
      const date = dateFromISO(iso);
      date.setUTCDate(date.getUTCDate() + direction);
      iso = toISO(date);
      if (isWorkingDay(iso, calendar)) remaining--;
    }
    return iso;
  }

  function workingDaysBetween(startValue, endValue, calendar = {}) {
    let start = toISO(startValue), end = toISO(endValue);
    if (!start || !end || start === end) return 0;
    let sign = 1;
    if (end < start) { [start, end] = [end, start]; sign = -1; }
    let count = 0;
    for (let date = dateFromISO(start); toISO(date) < end; ) {
      date.setUTCDate(date.getUTCDate() + 1);
      if (isWorkingDay(date, calendar)) count++;
    }
    return sign * count;
  }

  function addCalendarYears(dateValue, count) {
    const date = dateFromISO(dateValue);
    if (!date || !Number.isInteger(Number(count))) return "";
    const year = date.getUTCFullYear() + Number(count);
    const month = date.getUTCMonth();
    const day = Math.min(date.getUTCDate(), new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
    return fromParts(year, month + 1, day);
  }

  function isPrPending(caseRow = {}) {
    const committee = toISO(caseRow.cd || caseRow.cdp || caseRow.committeeDate);
    const lastPr = toISO(caseRow.lp || caseRow.lastPrDate);
    return !!committee && (!lastPr || lastPr < committee);
  }

  function committeeDateForDisplay(caseRow = {}) {
    const committee = toISO(caseRow.cd || caseRow.cdp || caseRow.committeeDate);
    const lastPr = toISO(caseRow.lp || caseRow.lastPrDate);
    return committee && (!lastPr || lastPr < committee) ? committee : "";
  }

  function deadlines(caseRow = {}, calendar = {}) {
    const committee = toISO(caseRow.cd || caseRow.cdp || caseRow.committeeDate);
    if (!committee) return { ratingLetterToClient: "", pressReleaseToClient: "", websiteUpload: "" };
    return {
      ratingLetterToClient: addWorkingDays(committee, 1, calendar),
      pressReleaseToClient: addWorkingDays(committee, 1, calendar),
      websiteUpload: addWorkingDays(committee, 7, calendar)
    };
  }

  function deadlineStatus(item, today = todayInTimezone()) {
    const due = typeof item === "string" ? toISO(item) : toISO(item && (item.due || item.dueDate));
    const done = typeof item === "object" && item && (item.completed || item.done || item.completedAt);
    if (done) return "Done";
    if (!due) return "Not due";
    const current = toISO(today);
    if (!current || due > current) return "Not due";
    return due === current ? "Due today" : "Overdue";
  }

  function viewMembership(caseRow = {}) {
    const views = ["All", "Insights"];
    if (caseRow.ncd) views.push("NCD");
    if (!caseRow.tr && !caseRow.w && !caseRow.dn && isPrPending(caseRow)) views.push("Deadlines");
    if (caseRow.inCommittee || caseRow.selectedForCommittee || caseRow.inBasket) views.push("Committee");
    return views;
  }

  function formatDate(value) {
    const date = dateFromISO(value);
    return date ? new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" }).format(date) : "–";
  }

  return Object.freeze({ toISO, dateFromISO, parseImportDate, todayInTimezone, isWorkingDay, addWorkingDays, workingDaysBetween, addCalendarYears, isPrPending, committeeDateForDisplay, deadlines, deadlineStatus, viewMembership, formatDate });
});
