/**
 * reveal.ts
 *
 * Adds .is-in to any element with class .reveal once it enters the viewport.
 * Uses IntersectionObserver; falls back to making everything visible if the
 * API is missing.
 */

export function initReveal(): void {
  const els = document.querySelectorAll<HTMLElement>(".reveal");

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
  );

  els.forEach((el) => io.observe(el));
}
