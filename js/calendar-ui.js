/**
 * calendar-ui.js — renders the 7-day calendar grid and handles
 *                  card interactions (open/locked feedback, modal).
 *
 * Depends on: CONFIG (config.js), Calendar (calendar.js),
 *             MESSAGES (messages.js)
 */

const CalendarUI = (() => {

  // ── Day icons (inline SVG, one per day) ─────────────────────
  // Tiny celestial icons, hand-crafted SVG — no AI images.
  const DAY_ICONS = [
    // Day 1 — crescent moon
    `<svg viewBox="0 0 32 32" aria-hidden="true">
       <defs>
         <mask id="ci-m1"><rect width="32" height="32" fill="white"/><circle cx="21" cy="11" r="13" fill="black"/></mask>
       </defs>
       <circle cx="14" cy="16" r="12" fill="currentColor" mask="url(#ci-m1)"/>
     </svg>`,
    // Day 2 — single star
    `<svg viewBox="0 0 32 32" aria-hidden="true">
       <polygon points="16,3 18.9,11.5 28,11.5 20.5,17 23.4,25.5 16,20 8.6,25.5 11.5,17 4,11.5 13.1,11.5"
                fill="currentColor"/>
     </svg>`,
    // Day 3 — cloud
    `<svg viewBox="0 0 32 32" aria-hidden="true">
       <ellipse cx="16" cy="20" rx="12" ry="7" fill="currentColor" opacity=".9"/>
       <circle  cx="12" cy="17" r="6" fill="currentColor"/>
       <circle  cx="20" cy="15" r="8" fill="currentColor"/>
     </svg>`,
    // Day 4 — small moon + star
    `<svg viewBox="0 0 32 32" aria-hidden="true">
       <defs>
         <mask id="ci-m4"><rect width="32" height="32" fill="white"/><circle cx="18" cy="9" r="8" fill="black"/></mask>
       </defs>
       <circle cx="12" cy="13" r="8" fill="currentColor" mask="url(#ci-m4)"/>
       <circle cx="24" cy="22" r="2.5" fill="currentColor" opacity=".7"/>
       <circle cx="20" cy="26" r="1.5" fill="currentColor" opacity=".5"/>
     </svg>`,
    // Day 5 — sparkle / 4-point star
    `<svg viewBox="0 0 32 32" aria-hidden="true">
       <path d="M16 2 L17.5 14 L28 16 L17.5 18 L16 30 L14.5 18 L4 16 L14.5 14 Z"
             fill="currentColor"/>
     </svg>`,
    // Day 6 — two small stars
    `<svg viewBox="0 0 32 32" aria-hidden="true">
       <polygon points="10,2 11.5,7 17,7 12.5,10.5 14,15.5 10,12.5 6,15.5 7.5,10.5 3,7 8.5,7"
                fill="currentColor"/>
       <polygon points="23,13 24,16 27,16 24.5,18 25.5,21 23,19 20.5,21 21.5,18 19,16 22,16"
                fill="currentColor" opacity=".75"/>
     </svg>`,
    // Day 7 — sun / radiant circle (last day, special)
    `<svg viewBox="0 0 32 32" aria-hidden="true">
       <circle cx="16" cy="16" r="7" fill="currentColor"/>
       <line x1="16" y1="2"  x2="16" y2="6"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
       <line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
       <line x1="2"  y1="16" x2="6"  y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
       <line x1="26" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
       <line x1="6"  y1="6"  x2="9"  y2="9"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
       <line x1="23" y1="23" x2="26" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
       <line x1="23" y1="9"  x2="26" y2="6"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
       <line x1="6"  y1="26" x2="9"  y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
     </svg>`,
  ];

  const LOCK_ICON = `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="8" y="14" width="16" height="13" rx="3" fill="currentColor"/>
      <path d="M11 14 V10 a5 5 0 0 1 10 0 V14"
            fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round"/>
      <circle cx="16" cy="20.5" r="2" fill="var(--clr-midnight)" opacity=".5"/>
    </svg>`;

  // ── Render ───────────────────────────────────────────────────

  function renderCalendar() {
    const section = document.getElementById("calendar");
    if (!section) return;

    const days = Calendar.buildDays();

    section.innerHTML = `
      <!-- Decorative background strip -->
      <div class="cal-bg" aria-hidden="true">
        <div class="cal-deco-star cal-deco-star-1"></div>
        <div class="cal-deco-star cal-deco-star-2"></div>
        <div class="cal-deco-star cal-deco-star-3"></div>
        <div class="cal-deco-moon-sm" aria-hidden="true">
          <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id="cal-cres">
                <rect width="60" height="60" fill="white"/>
                <circle cx="38" cy="22" r="24" fill="black"/>
              </mask>
            </defs>
            <circle cx="27" cy="30" r="22" fill="#CDB4DB" mask="url(#cal-cres)" opacity="0.25"/>
          </svg>
        </div>
      </div>

      <!-- Section header -->
      <div class="cal-header">
        <h2 class="cal-title anim-fade-in">Seven Little Days</h2>
        <p class="cal-subtitle anim-fade-in" style="animation-delay:.25s">
          One day at a time, one little wish at a time.
        </p>
      </div>

      <!-- Cards grid -->
      <div class="cal-grid" role="list">
        ${days.map((day, i) => buildCard(day, i)).join("")}
      </div>

      <!-- Back to welcome -->
      <div class="cal-nav">
        <a href="#welcome" class="btn-back" aria-label="Back to welcome page">
          ← Back to Welcome
        </a>
      </div>
    `;

    attachCardListeners();
  }

  function buildCard(day, index) {
    const isLocked   = day.status === "locked";
    const isToday    = day.status === "today";
    const isUnlocked = day.status === "unlocked";

    const statusLabel = isLocked
      ? "Locked"
      : isToday
        ? "Today ✦"
        : "Open";

    const icon = isLocked ? LOCK_ICON : DAY_ICONS[index] || DAY_ICONS[0];

    const cardClasses = [
      "cal-card",
      isLocked    ? "cal-card--locked"   : "",
      isToday     ? "cal-card--today"    : "",
      isUnlocked  ? "cal-card--unlocked" : "",
    ].filter(Boolean).join(" ");

    // Stagger entrance animation delay
    const delay = (index * 0.1).toFixed(1);

    return `
      <article
        class="${cardClasses}"
        role="listitem"
        style="animation-delay:${delay}s"
        data-day="${day.dayNum}"
        data-status="${day.status}"
        tabindex="0"
        ${!isLocked ? `aria-label="Day ${day.dayNum}, ${day.dateStr}, ${statusLabel}. Press Enter to open."` : `aria-label="Day ${day.dayNum}, ${day.dateStr}. Locked. Press Enter for info." aria-disabled="true"`}
      >
        <div class="cal-card__icon">${icon}</div>
        <div class="cal-card__body">
          <span class="cal-card__day-num">Day ${day.dayNum}</span>
          <span class="cal-card__date">${day.dateStr}</span>
        </div>
        <div class="cal-card__status">
          <span class="cal-card__status-dot"></span>
          ${statusLabel}
        </div>
      </article>`;
  }

  // ── Event listeners ──────────────────────────────────────────

  function attachCardListeners() {
    const cards = document.querySelectorAll(".cal-card");

    cards.forEach(card => {
      const status = card.dataset.status;
      const dayNum = parseInt(card.dataset.day, 10);

      if (status !== "locked") {
        // Click — pass the card itself as the trigger so focus returns to it
        card.addEventListener("click", () => openModal(dayNum, card));
        // Keyboard: Enter / Space
        card.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal(dayNum, card);
          }
        });
      } else {
        // Locked feedback on click
        card.addEventListener("click", () => showLockedFeedback(card));
        card.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            showLockedFeedback(card);
          }
        });
      }
    });
  }

  // ── Locked feedback ──────────────────────────────────────────

  function showLockedFeedback(card) {
    // Prevent stacking multiple toasts
    if (card.dataset.shaking) return;
    card.dataset.shaking = "1";

    // Gentle shake
    card.classList.add("cal-card--shake");

    // Toast message
    showToast("Not yet, little star. Your day will come soon. ✨");

    card.addEventListener("animationend", () => {
      card.classList.remove("cal-card--shake");
      delete card.dataset.shaking;
    }, { once: true });
  }

  // ── Modal ────────────────────────────────────────────────────

  // Tracks the card that triggered the modal so focus returns to it on close.
  let _triggerEl = null;

  /**
   * Returns all focusable elements inside a container, in DOM order.
   */
  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.disabled && el.offsetParent !== null);
  }

  function openModal(dayNum, triggerEl) {
    // Store trigger before potentially destroying a previous modal
    _triggerEl = triggerEl || document.activeElement || null;

    // Remove any existing modal first (without touching _triggerEl)
    const existing = document.querySelector(".modal-overlay");
    if (existing) {
      existing.remove();
      document.removeEventListener("keydown", handleModalKey);
    }

    const msg   = MESSAGES.find(m => m.day === dayNum);
    const title = msg && msg.title ? msg.title : `Day ${dayNum}`;
    const body  = msg && msg.body
      ? msg.body
      : "A little message is waiting here...";

    const dayData = Calendar.buildDays()[dayNum - 1];

    // Format body into semantic paragraphs, preserving single line breaks as <br>
    const formattedBody = body
      .split(/\n\n+/)
      .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.setAttribute("role",             "dialog");
    overlay.setAttribute("aria-modal",       "true");
    overlay.setAttribute("aria-labelledby",  "modal-title");
    overlay.setAttribute("aria-describedby", "modal-body-text");
    overlay.innerHTML = `
      <div class="modal">
        <button class="modal-close" aria-label="Close message">✕</button>
        <div class="modal-deco" aria-hidden="true">
          ${DAY_ICONS[dayNum - 1] || DAY_ICONS[0]}
        </div>
        <span class="modal-badge">Day ${dayNum}</span>
        <h3 id="modal-title" class="modal-title">${title}</h3>
        <p class="modal-date">${dayData.dateStr}</p>
        <div class="modal-divider" aria-hidden="true"></div>
        <div id="modal-body-text" class="modal-body">
          ${formattedBody}
        </div>
        <div class="modal-footer">
          <button class="btn-modal-close" aria-label="Close message">Close ✨</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    // Move focus to the top close button immediately
    const closeBtn = overlay.querySelector(".modal-close");
    closeBtn.focus();

    // Close triggers (both header and footer close buttons)
    overlay.querySelectorAll(".modal-close, .btn-modal-close").forEach(btn => {
      btn.addEventListener("click", closeModal);
    });
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeModal();
    });

    // Single keydown handler for Escape + focus trap
    document.addEventListener("keydown", handleModalKey);

    // Animate in after one frame so the CSS transition fires
    requestAnimationFrame(() => overlay.classList.add("modal-overlay--open"));
  }

  function closeModal() {
    const overlay = document.querySelector(".modal-overlay");
    if (!overlay) return;

    overlay.classList.remove("modal-overlay--open");
    document.removeEventListener("keydown", handleModalKey);

    // Return focus to the card that opened the modal
    const returnTarget = _triggerEl;
    _triggerEl = null;

    overlay.addEventListener("transitionend", () => {
      overlay.remove();
      // Restore focus after the element is gone so screen readers announce correctly
      if (returnTarget && typeof returnTarget.focus === "function") {
        returnTarget.focus();
      }
    }, { once: true });
  }

  /**
   * Handles Escape key (close) and Tab / Shift+Tab (focus trap) inside the modal.
   */
  function handleModalKey(e) {
    const overlay = document.querySelector(".modal-overlay");
    if (!overlay) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === "Tab") {
      const focusable = getFocusable(overlay);
      if (focusable.length === 0) { e.preventDefault(); return; }

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  // ── Toast ────────────────────────────────────────────────────

  function showToast(message) {
    // Remove any old toast
    document.querySelector(".toast")?.remove();

    const toast = document.createElement("div");
    toast.className  = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger show
    requestAnimationFrame(() => toast.classList.add("toast--show"));

    setTimeout(() => {
      toast.classList.remove("toast--show");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, 3200);
  }

  // ── Public ───────────────────────────────────────────────────

  function init() {
    renderCalendar();
  }

  return { init };

})();

