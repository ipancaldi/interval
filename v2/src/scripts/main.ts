/**
 * main.ts
 * Entry point loaded by the Base layout. Runs on every page.
 * Keep this file tiny — orchestration only, no logic.
 */

import { initNavTheme } from "./nav-theme";
import { initReveal } from "./reveal";
import { initHeroBackground } from "./hero-background";

document.documentElement.classList.remove("no-js");

function boot(): void {
  initNavTheme();
  initReveal();
  // Lazy-loads Three.js only when a hero canvas is present.
  void initHeroBackground();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
