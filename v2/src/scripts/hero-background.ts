/**
 * hero-background.ts
 *
 * Finds the Hero's <canvas data-hero-bg> on the current page and boots
 * the point-cloud animation against it. Lazy-loads Three.js so pages
 * without a hero don't pay the bundle cost; respects reduced-motion.
 */

export async function initHeroBackground(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-hero-bg]");
  if (!canvas) return;

  // Skip on devices that ask for less motion.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Skip if WebGL isn't available — fall back to the plain dark hero.
  if (!hasWebGL()) return;

  const { initPointCloud } = await import("./point-cloud");
  const cloudColor = canvas.dataset.cloudColor;
  const startIndexAttr = canvas.dataset.startIndex;
  const startIndex = startIndexAttr ? Number.parseInt(startIndexAttr, 10) : undefined;
  initPointCloud(canvas, {
    ...(cloudColor && { cloudColor }),
    ...(Number.isFinite(startIndex) && { startIndex }),
  });
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}
