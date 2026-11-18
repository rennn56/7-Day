/**
 * calendar.js — day-unlock logic based on CONFIG.startDate.
 * Determines which of the 7 days is active/unlocked/locked.
 */

const Calendar = (() => {

  // ── Helpers ──────────────────────────────────────────────────

  /**
   * Returns the current date as YYYY-MM-DD string in Asia/Jakarta.
   * Uses Intl.DateTimeFormat so we never rely on the local browser TZ.
   */
  function todayInJakarta() {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone : CONFIG.timezone,
      year     : "numeric",
      month    : "2-digit",
      day      : "2-digit",
    }).format(new Date()); // "YYYY-MM-DD" (sv-SE locale gives ISO-like output)
  }

  /**
   * Parse a "YYYY-MM-DD" string to a plain date integer (days since epoch)
   * without any timezone shift.
   */
  function dateToIndex(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    // UTC midnight to avoid DST/offset surprises when comparing dates
    return Date.UTC(y, m - 1, d) / 86_400_000;
  }

  // ── Public API ───────────────────────────────────────────────

  /**
   * Returns the current day index (1–7) relative to startDate
   * in Asia/Jakarta timezone, or null if outside the 7-day window.
   * Kept for backwards compatibility.
   */
  function getCurrentDay() {
    const todayIdx = dateToIndex(todayInJakarta());
    const startIdx = dateToIndex(CONFIG.startDate);
    const diff     = todayIdx - startIdx + 1;      // 1-based

    if (diff < 1 || diff > CONFIG.totalDays) return null;
    return diff;
  }

  /**
   * Returns "unlocked", "locked", or "today" for a given 1-based dayIndex.
   * "today"    — the card for today (special highlight).
   * "unlocked" — past days that can be reopened.
   * "locked"   — future days.
   */
  function getDayStatus(dayIndex) {
    const todayIdx = dateToIndex(todayInJakarta());
    const startIdx = dateToIndex(CONFIG.startDate);
    const cardIdx  = startIdx + dayIndex - 1;      // absolute date index

    if (cardIdx > todayIdx)  return "locked";
    if (cardIdx === todayIdx) return "today";
    return "unlocked";
  }

  /**
   * Returns an array of day descriptors for all CONFIG.totalDays days.
   * Each object: { dayNum, dateStr, label, status }
   */
  function buildDays() {
    const [y, m, d] = CONFIG.startDate.split("-").map(Number);
    const days = [];

    for (let i = 0; i < CONFIG.totalDays; i++) {
      const date = new Date(Date.UTC(y, m - 1, d + i));
      const dateStr = date.toLocaleDateString("en-US", {
        timeZone : "UTC",
        month    : "long",
        day      : "numeric",
        year     : "numeric",
      });
      days.push({
        dayNum  : i + 1,
        dateStr,
        label   : `Day ${i + 1}`,
        status  : getDayStatus(i + 1),   // "today" | "unlocked" | "locked"
      });
    }

    return days;
  }

  return { getCurrentDay, getDayStatus, buildDays };

})();
