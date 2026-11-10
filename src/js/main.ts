import { checkAuth, logout, userStore } from "../js/auth.svelte.ts";
import { displayAlerts } from "../js/alerts.ts";
import { updateCartCount } from "./cart-count.ts";

updateCartCount();
  window.addEventListener("cart-updated", () => updateCartCount());
  window.addEventListener("storage", (event) => {
    if (event.key === "so-cart") updateCartCount();
  });
checkAuth()
displayAlerts();