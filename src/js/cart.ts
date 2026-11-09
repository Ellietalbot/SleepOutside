import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import type { Product } from "./types.mjs";


type CartItem = Product & {
  quantity?: number;
};

function renderCartContents() {
const cartItems: CartItem[] = getLocalStorage("so-cart") ?? [];
  const listEl = document.querySelector(".product-list");
  if (!listEl) return;

  if (cartItems.length === 0) {
    listEl.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  const htmlItems = cartItems.map(cartItemTemplate);
  listEl.innerHTML = htmlItems.join("");
  renderCartTotal(cartItems);
  let itemsTotal = calculateTotalCartItems(cartItems);
  if (itemsTotal > 0) {
    const cartTotal = document.querySelector(".cart-total");
    let html = `${itemsTotal} items in your cart`;
    cartTotal.innerHTML = html;
  }
}

function renderCartTotal(cartItems: CartItem[]) {
  const footerEl = document.querySelector(".cart-footer");
  const totalEl = document.querySelector(".cart-total");
  if (!footerEl || !totalEl) return;

  const total = cartItems.reduce(
    (sum, item) => sum + item.finalPrice * (item.quantity ?? 1),
    0
  );
  footerEl.classList.remove("hide");
  totalEl.innerHTML = `Total: $${total.toFixed(2)}`;
}

function calculateTotalCartItems(cartItems: CartItem[])
{
  let cartTotal = 0;
  for (let i = 0; i < cartItems.length; i++)
  {
    let currentTotal = cartItems[i].quantity ?? 1;
    if (currentTotal)
    {
      cartTotal += currentTotal;
    }
  }
  return cartTotal;
}

function updateQuantity(id: string, change: number) {
  const cartItems: CartItem[] = getLocalStorage("so-cart") ?? [];
  const item = cartItems.find((cartItem) => cartItem.id === id);
  if (!item) return;

  item.quantity = Math.max(1, (item.quantity ?? 1) + change);
  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

document.querySelector(".product-list")?.addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>(".qty-btn");
  if (!button?.dataset.id) return;

  const change = button.dataset.action === "increase" ? 1 : -1;
  updateQuantity(button.dataset.id, change);
});

function cartItemTemplate(item: CartItem) {
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
<p class="cart-card__quantity">
    <button class="qty-btn" data-id="${item.id}" data-action="decrease"
      style="all: unset; cursor: pointer;"
      aria-label="Decrease quantity" ${(item.quantity ?? 1) <= 1 ? "disabled" : ""}>−</button>
    ${item.quantity ?? 1}
    <button class="qty-btn" data-id="${item.id}" data-action="increase"
      style="all: unset; cursor: pointer;"
      aria-label="Increase quantity">+</button>
  </p>
<p class="cart-card__price">$${(item.finalPrice * (item.quantity ?? 1)).toFixed(2)}</p></li>`;

  return newItem;
}

renderCartContents();
