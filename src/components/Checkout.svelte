<script lang="ts">
    import { onMount } from "svelte";
    import { getLocalStorage, setLocalStorage } from "../js/utils.mts";
    import { checkAuth, userStore } from "../js/auth.svelte.ts";
    import { submitOrder } from "../js/productData.mts";
    import type { CartItem } from "../js/cart.ts";

    let cartItems: CartItem[] = $state([]);
    let itemCount = $derived(
        cartItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    );

    const TAX_RATE = 0.06;
    const SHIPPING_FIRST = 10;
    const SHIPPING_EXTRA = 2;

    let subtotal = $derived(
        cartItems.reduce(
            (sum, item) => sum + item.finalPrice * (item.quantity ?? 1),
            0,
        ),
    );
    let tax = $derived(subtotal * TAX_RATE);
    let shipping = $derived(
        itemCount === 0
            ? 0
            : SHIPPING_FIRST + SHIPPING_EXTRA * (itemCount - 1),
    );
    let orderTotal = $derived(subtotal + tax + shipping);

    let shippingInfo = $state({
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        state: "",
        zip: "",
    });

    let paymentInfo = $state({
        cardNumber: "",
        expiration: "",
        securityCode: "",
    });

    let errors: Record<string, string> = $state({});
    let formError = $state("");
    let submitting = $state(false);
    let orderPlaced = $state(false);

    const round2 = (n: number) => Math.round(n * 100) / 100;

    function validate() {
        const e: Record<string, string> = {};

        if (!shippingInfo.firstName.trim()) e.firstName = "Enter your first name.";
        if (!shippingInfo.lastName.trim()) e.lastName = "Enter your last name.";
        if (!shippingInfo.street.trim()) e.street = "Enter your street address.";
        if (!shippingInfo.city.trim()) e.city = "Enter your city.";
        if (!/^[A-Za-z]{2}$/.test(shippingInfo.state.trim()))
            e.state = "Use the 2-letter state code, like ID.";
        if (!/^\d{5}$/.test(shippingInfo.zip.trim()))
            e.zip = "Zip must be 5 digits.";

        const card = paymentInfo.cardNumber.replace(/[\s-]/g, "");
        if (!/^\d{16}$/.test(card))
            e.cardNumber = "Card number must be 16 digits.";

        const exp = paymentInfo.expiration
            .trim()
            .match(/^(0[1-9]|1[0-2])\/?(\d{2})$/);
        if (!exp) {
            e.expiration = "Use MM/YY, like 08/28.";
        } else {
            const month = Number(exp[1]);
            const year = 2000 + Number(exp[2]);
            const now = new Date();
            const expired =
                year < now.getFullYear() ||
                (year === now.getFullYear() && month < now.getMonth() + 1);
            if (expired) e.expiration = "This card is expired.";
        }

        if (!/^\d{3,4}$/.test(paymentInfo.securityCode.trim()))
            e.securityCode = "Security code is 3 or 4 digits.";

        return e;
    }

    async function checkoutHandler(event: Event) {
        event.preventDefault();
        formError = "";

        if (cartItems.length === 0) {
            formError = "Your cart is empty.";
            return;
        }

        errors = validate();
        if (Object.keys(errors).length > 0) {
            formError = "Please fix the highlighted fields.";
            return;
        }

        const userId = userStore.user?._id;
        if (!userId) {
            window.location.href = "/login?redirect=/checkout";
            return;
        }

        const order = {
            userId,
            orderDate: new Date().toISOString(),
            fname: shippingInfo.firstName.trim(),
            lname: shippingInfo.lastName.trim(),
            street: shippingInfo.street.trim(),
            city: shippingInfo.city.trim(),
            state: shippingInfo.state.trim().toUpperCase(),
            zip: shippingInfo.zip.trim(),
            cardNumber: paymentInfo.cardNumber.replace(/[\s-]/g, ""),
            expiration: paymentInfo.expiration.trim(),
            code: paymentInfo.securityCode.trim(),
            items: cartItems.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.finalPrice,
                quantity: item.quantity ?? 1,
            })),
            orderTotal: round2(orderTotal),
            shipping: round2(shipping),
            tax: round2(tax),
        };

        submitting = true;
        try {
            await submitOrder(order, userStore.token);
            setLocalStorage("so-cart", []);
            cartItems = [];
            orderPlaced = true;
        } catch (error: any) {
            if (error instanceof TypeError) {
                formError = "Could not reach the server. Check your connection and try again.";
            } else {
                formError = error.message || "Something went wrong placing your order.";
            }
        } finally {
            submitting = false;
        }
    }

    onMount(() => {
        if (!checkAuth()) {
            window.location.href = "/login?redirect=/checkout";
            return;
        }
        cartItems = getLocalStorage("so-cart") ?? [];
    });
</script>

{#if orderPlaced}
  <p class="success">Thank you! Your order was placed.</p>
  <p><a href="/">Back to home</a></p>
{:else}
<form onsubmit={checkoutHandler} novalidate>
  {#if formError}
    <p class="error" role="alert">{formError}</p>
  {/if}

  <fieldset>
    <legend>Shipping</legend>
    <label>
      First Name
      <input type="text" bind:value={shippingInfo.firstName} />
      {#if errors.firstName}<span class="error">{errors.firstName}</span>{/if}
    </label>
    <label>
      Last Name
      <input type="text" bind:value={shippingInfo.lastName} />
      {#if errors.lastName}<span class="error">{errors.lastName}</span>{/if}
    </label>
    <label>
      Street
      <input type="text" bind:value={shippingInfo.street} />
      {#if errors.street}<span class="error">{errors.street}</span>{/if}
    </label>
    <label>
      City
      <input type="text" bind:value={shippingInfo.city} />
      {#if errors.city}<span class="error">{errors.city}</span>{/if}
    </label>
    <label>
      State
      <input type="text" bind:value={shippingInfo.state} maxlength="2" />
      {#if errors.state}<span class="error">{errors.state}</span>{/if}
    </label>
    <label>
      Zip
      <input type="text" bind:value={shippingInfo.zip} inputmode="numeric" maxlength="5" />
      {#if errors.zip}<span class="error">{errors.zip}</span>{/if}
    </label>
  </fieldset>

  <fieldset>
    <legend>Payment</legend>
    <label>
      Card number
      <input type="text" bind:value={paymentInfo.cardNumber} inputmode="numeric" autocomplete="off" />
      {#if errors.cardNumber}<span class="error">{errors.cardNumber}</span>{/if}
    </label>
    <label>
      Expiration
      <input type="text" bind:value={paymentInfo.expiration} placeholder="MM/YY" autocomplete="off" />
      {#if errors.expiration}<span class="error">{errors.expiration}</span>{/if}
    </label>
    <label>
      Security Code
      <input type="text" bind:value={paymentInfo.securityCode} inputmode="numeric" maxlength="4" autocomplete="off" />
      {#if errors.securityCode}<span class="error">{errors.securityCode}</span>{/if}
    </label>
  </fieldset>

  <fieldset>
    <legend>Order Summary</legend>
    <p class="summary-row">
      <span>Item Subtotal({itemCount})</span>
      <span>${subtotal.toFixed(2)}</span>
    </p>
    <p class="summary-row">
      <span>Shipping Estimate</span>
      <span>${shipping.toFixed(2)}</span>
    </p>
    <p class="summary-row">
      <span>Tax</span>
      <span>${tax.toFixed(2)}</span>
    </p>
    <p class="summary-row">
      <strong>Order Total</strong>
      <strong>${orderTotal.toFixed(2)}</strong>
    </p>
  </fieldset>

  <button type="submit" disabled={submitting}>
    {submitting ? "Placing order..." : "Checkout"}
  </button>
</form>
{/if}

<style>
  .summary-row {
    display: flex;
    justify-content: space-between;
  }
  label {
    display: flex;
    flex-direction: column;
  }
  button {
    display: block;
    margin: 1rem auto;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    color: white;
    background-color: #525b1a;
    border: none;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .error {
    color: red;
  }
  .success {
    color: green;
    font-weight: bold;
  }
</style>