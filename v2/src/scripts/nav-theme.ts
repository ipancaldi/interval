/**
 * nav-theme.ts
 *
 * Swaps the nav between dark and light variants based on the section
 * sitting under it. Marks <body> with a data attribute so the nav (and
 * any other surface-aware element) can adapt with CSS.
 *
 * Sections declare their surface with `data-surface="dark" | "light"`
 * on their root element. The nav reads whichever section currently
 * overlaps the trigger line (just below the nav).
 */

type Surface = "dark" | "light";

const NAV_SELECTOR = "[data-nav]";
const SURFACE_ATTR = "data-surface";
const TRIGGER_OFFSET = 4; // px past the nav before swapping

export function initNavTheme(): void {
  const nav = document.querySelector<HTMLElement>(NAV_SELECTOR);
  if (!nav) return;

  // Only real content sections count. The nav sets its own data-surface
  // (it's the output), and <body> carries a default data-surface for
  // pre-JS styling — both must be excluded or the body's full-page rect
  // would always win the overlap test and pin the nav to one theme.
  const surfaceSections = Array.from(
    document.querySelectorAll<HTMLElement>(`[${SURFACE_ATTR}]`)
  ).filter((el) => el !== nav && el !== document.body);
  if (surfaceSections.length === 0) return;

  function currentSurface(): Surface {
    const triggerY = nav!.offsetHeight + TRIGGER_OFFSET;

    // Walk top-down, find the section currently overlapping the trigger line.
    for (const section of surfaceSections) {
      const { top, bottom } = section.getBoundingClientRect();
      if (top <= triggerY && bottom > triggerY) {
        return (section.getAttribute(SURFACE_ATTR) as Surface) ?? "light";
      }
    }
    // Fallback: first section's surface (usually the hero).
    return (surfaceSections[0]!.getAttribute(SURFACE_ATTR) as Surface) ?? "light";
  }

  function apply(): void {
    const surface = currentSurface();
    nav!.dataset.surface = surface;
    document.body.dataset.surface = surface;
  }

  apply();
  window.addEventListener("scroll", apply, { passive: true });
  window.addEventListener("resize", apply);
}
