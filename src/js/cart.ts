import { getLocalStorage } from "./utils.mjs";
import type { Product } from "./types.mjs";

function renderCartContents() {
  const cartItems: Product[] = getLocalStorage("so-cart") ?? [];
  const listEl = document.querySelector(".product-list");
  if (!listEl) return;

  if (cartItems.length === 0) {
    listEl.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  const htmlItems = cartItems.map(cartItemTemplate);
  listEl.innerHTML = htmlItems.join("");
  renderCartTotal(cartItems);
}

function renderCartTotal(cartItems: Product[]) {
  const footerEl = document.querySelector(".cart-footer");
  const totalEl = document.querySelector(".cart-total");
  if (!footerEl || !totalEl) return;

  const total = cartItems.reduce((sum, item) => sum + item.finalPrice, 0);
  footerEl.classList.remove("hide");
  totalEl.innerHTML = `Total: $${total.toFixed(2)}`;
}

function cartItemTemplate(item: Product) {
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.images.primaryLarge}"
      alt="${item.name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.name}</h2>
  </a>
  <p class="cart-card__color">${item.colors[0].colorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.finalPrice}</p>
</li>`;

  return newItem;
}

renderCartContents();
