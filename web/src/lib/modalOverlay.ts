/** Space for fixed bottom tab bar (see AppShell). */
export const bottomNavClearanceClass =
  "pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]";

export function bindModalOverlay(): () => void {
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.body.classList.add("hl-modal-open");

  return () => {
    document.body.style.overflow = prevOverflow;
    document.body.classList.remove("hl-modal-open");
  };
}
