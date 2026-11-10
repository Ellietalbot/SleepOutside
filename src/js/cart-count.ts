import type { CartItem } from "./cart";
import { getLocalStorage } from "./utils.mts";

export function updateCartCount() {
  const badge = document.querySelector<HTMLElement>("#cart-count");
  const cartLink = badge?.closest("a");

  if (!badge || !cartLink) return;

  const items: CartItem[] = getLocalStorage("so-cart") ?? [];
  const count = items.reduce((total, item) => total + (item.quantity ?? 1), 0);

  badge.textContent = String(count);
  badge.hidden = count === 0;
  cartLink.setAttribute(
    "aria-label",
    count === 0 ? "Shopping Cart" : `Shopping Cart, ${count} items`,
  );
}

export function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart-updated"));
}