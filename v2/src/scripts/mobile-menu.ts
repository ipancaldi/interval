/**
 * mobile-menu.ts
 *
 * Wires the hamburger toggle in Nav.astro to the full-screen overlay
 * menu. Handles toggle click, Esc key, and closing when a link is
 * tapped. Pure DOM — no framework.
 */

export function initMobileMenu(): void {
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const menu = document.querySelector<HTMLElement>("[data-mobile-menu]");
  if (!nav || !toggle || !menu) return;

  const setOpen = (open: boolean): void => {
    nav.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-menu-open");
    setOpen(!isOpen);
  });

  // Close on Esc.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-menu-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close when a link inside the overlay is followed.
  menu.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement) setOpen(false);
  });
}
