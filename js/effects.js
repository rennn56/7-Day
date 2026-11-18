/**
 * effects.js — ambient visual effects.
 * Generates stars and handles shooting-star lifecycle.
 * All visuals: CSS + JS — zero external images.
 */

const Effects = (() => {

  // ── Stars ────────────────────────────────────────────────────
  function createStars() {
    const layer = document.getElementById("stars-layer");
    if (!layer) return;

    // Fewer stars on small screens for performance
    const count = window.innerWidth < 640 ? 55 : 95;
    const frag  = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");

      const size  = Math.random() * 2.4 + 0.7;        // 0.7 – 3.1 px
      const top   = Math.random() * 88;                // keep in top 88%
      const left  = Math.random() * 100;
      const delay = (Math.random() * 6).toFixed(2);    // 0 – 6 s
      const dur   = (2.5 + Math.random() * 3).toFixed(2); // 2.5 – 5.5 s
      const alpha = (0.45 + Math.random() * 0.55).toFixed(2);

      Object.assign(star.style, {
        position     : "absolute",
        width        : `${size}px`,
        height       : `${size}px`,
        borderRadius : "50%",
        background   : `rgba(255, 255, 255, ${alpha})`,
        top          : `${top}%`,
        left         : `${left}%`,
        animation    : `twinkle ${dur}s ${delay}s ease-in-out infinite`,
        // Larger stars get a subtle glow
        boxShadow    : size > 2 ? `0 0 ${(size * 2.5).toFixed(1)}px rgba(255,255,255,0.35)` : "none",
      });

      frag.appendChild(star);
    }

    layer.appendChild(frag);
  }

  // ── Shooting stars — randomised repositioning ────────────────
  function animateShootingStars() {
    const stars = document.querySelectorAll(".shooting-star");
    if (!stars.length) return;

    stars.forEach(star => {
      star.addEventListener("animationiteration", () => {
        // Randomise start position on each cycle
        const topPct  = 5  + Math.random() * 30;
        const leftPct = 5  + Math.random() * 55;
        star.style.top  = `${topPct}%`;
        star.style.left = `${leftPct}%`;
      });
    });
  }

  // ── Public ───────────────────────────────────────────────────
  function init() {
    createStars();
    animateShootingStars();
  }

  return { init };

})();
