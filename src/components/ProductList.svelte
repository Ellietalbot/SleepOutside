<script lang="ts">
  import { onMount } from "svelte";
  import { getProducts } from "../js/productData.mts";
  import type { Product } from "../js/types.mts";
  import { getParam } from "../js/utils.mjs";
  import ProductSummary from "./ProductSummary.svelte";

  let category = $state("");
  let products: Product[] = $state([]);
  let error = $state("");

  async function init() {
    category = getParam("category") || "";

    try {
      products = await getProducts(category);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : "Unable to load products. Please try again.";
      console.error("Unable to load products:", cause);
    }
  }

  onMount(init);
</script>

<h2>Top Products: {category}</h2>

{#if error}
  <p role="alert">{error}</p>
{/if}

<ul class="product-list">
  {#each products as product (product.id)}
    <ProductSummary {product} />
  {/each}
</ul>