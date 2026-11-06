import type { Product } from "./types.mts";
import { getLocalStorage, setLocalStorage } from "./utils.mts";
import { findProductById } from "./productData.mts";

type CartItem = Product & {
  quantity?: number;
};

function addProductToCart(product: Product) {
  const cart: CartItem[] = getLocalStorage("so-cart") ?? [];

  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity ?? 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  setLocalStorage("so-cart", cart);
}

function animateToCart(source: HTMLImageElement) {
  const cartIcon = document.querySelector<HTMLElement>(".cart");

  if (!cartIcon) return;

  // Get the positions of the product image and cart icon
  const sourceRect = source.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  // Create a temporary copy of the product image
  const flyingImage = source.cloneNode(true) as HTMLImageElement;

  // Position it directly over the original image
  flyingImage.style.position = "fixed";
  flyingImage.style.left = `${sourceRect.left}px`;
  flyingImage.style.top = `${sourceRect.top}px`;
  flyingImage.style.width = `${sourceRect.width}px`;
  flyingImage.style.height = `${sourceRect.height}px`;
  flyingImage.style.objectFit = "contain";
  flyingImage.style.margin = "0";
  flyingImage.style.zIndex = "9999";
  flyingImage.style.pointerEvents = "none";

  document.body.appendChild(flyingImage);

  // Calculate how far the image needs to travel
  const moveX = cartRect.left - sourceRect.left;
  const moveY = cartRect.top - sourceRect.top;

  // Animate!
  const animation = flyingImage.animate(
    [
      {
        transform: "scale(1)",
        opacity: 1
      },
      {
        transform: `translate(${moveX}px, ${moveY}px) scale(0.1)`,
        opacity: 0.5
      }
    ],
    {
      duration: 600,
      easing: "ease-in",
      fill: "forwards"
    }
  );

  // Remove the temporary image when finished
  animation.onfinish = () => {
    flyingImage.remove();

    // Trigger your existing cart animation
    cartIcon.classList.remove("cart-pop");
    void cartIcon.offsetWidth;
    cartIcon.classList.add("cart-pop");
  };
}

// add to cart button event handler
async function addToCartHandler(e: Event) {
  const target = e.target as HTMLButtonElement;
  const productImage = document.querySelector<HTMLImageElement>(

    ".product-image"

  );
  if (target.dataset.id) {
    const product = await findProductById(target.dataset.id);
    addProductToCart(product);
    if (productImage) {

      animateToCart(productImage);

    }
  }
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  ?.addEventListener("click", addToCartHandler);
