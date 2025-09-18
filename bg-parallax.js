/**
 * Interactive background parallax
 * - Moves background-position with mouse (lerped for smoothness)
 * - Disables on touch devices and for reduced-motion preference
 * - Falls back gracefully if JS is disabled
 */

(function () {
  const isTouch =
    ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bail out if touch or reduced motion
  if (isTouch || prefersReducedMotion) return;

  const root = document.documentElement;
  const bg = document.querySelector('.interactive-bg');
  if (!bg) return;

  let targetX = 50, targetY = 50; // percentage
  let currentX = 50, currentY = 50;
  let rafId = null;

  const lerp = (a, b, t) => a + (b - a) * t;

  function animate() {
    // Smoothly approach target
    currentX = lerp(currentX, targetX, 0.08);
    currentY = lerp(currentY, targetY, 0.08);

    root.style.setProperty('--bg-x', `${currentX}%`);
    root.style.setProperty('--bg-y', `${currentY}%`);

    // Continue while there's still movement
    if (Math.abs(currentX - targetX) > 0.05 || Math.abs(currentY - targetY) > 0.05) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  function onPointerMove(e) {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;

    // Convert mouse position to 0..100% space
    targetX = 50 + ((e.clientX / w) * 100 - 50) * 0.6;
    targetY = 50 + ((e.clientY / h) * 100 - 50) * 0.6;

    // Kick the animation loop if not already running
    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  function onEnter() {
    root.style.setProperty('--bg-scale', '1.12');
  }

  function onLeave() {
    targetX = 50; targetY = 50;
    root.style.setProperty('--bg-scale', '1.10');
    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  // Attach listeners to the whole document for a "page hover" feel
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerenter', onEnter, { passive: true });
  document.addEventListener('pointerleave', onLeave, { passive: true });

  // Keep centered on resize
  window.addEventListener('resize', () => {
    targetX = 50; targetY = 50;
  });
})();
