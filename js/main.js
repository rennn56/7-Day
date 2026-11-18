/**
 * main.js — application entry point.
 * Wires all modules together after the DOM is ready.
 */

document.addEventListener("DOMContentLoaded", () => {
  Effects.init();
  CalendarUI.init();

  console.log(
    "%c🌙 7 Days Under the Same Sky",
    "color:#CDB4DB;font-family:Georgia,serif;font-size:14px;font-style:italic"
  );
  console.log("Config:", CONFIG);
  console.log("Today (Jakarta):", Calendar.getCurrentDay()
    ? `Day ${Calendar.getCurrentDay()}`
    : "Outside 7-day window"
  );
});
