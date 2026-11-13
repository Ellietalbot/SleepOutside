<script lang="ts">
  import { onMount } from "svelte";
  import { getProducts, searchProducts } from "../js/productData.mts";
  import type { Product } from "../js/types.mts";
  import { getParam } from "../js/utils.mjs";
  import ProductSummary from "./ProductSummary.svelte";

  let category = $state("");
  let searchTerm = $state("");
  let products: Product[] = $state([]);
  // using sortby to help sort the product list.
  let sortBy = $state("name");
  let error = $state("");
  let loading = $state(true);

  let sortedProducts = $derived.by(() => {
    const copy = [...products];
    if (sortBy === "name") {
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    return copy.sort((a, b) => a.finalPrice - b.finalPrice);
  });

  async function init() {
    searchTerm = getParam("q")?.trim() || "";
    category = getParam("category") || "";

    try {
      products = searchTerm
      ? await searchProducts(searchTerm)
      : await getProducts(category);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : "Unable to load products. Please try again.";
      console.error("Unable to load products:", cause);
    } finally {
      loading = false;
    }
  }

  onMount(init);
</script>

{#if searchTerm}
  <h2>Search results for "{searchTerm}"</h2>
{:else}
  <h2>Top Products: {category}</h2>
{/if}

<label>
  Sort by
  <select bind:value={sortBy}>
    <option value="name">Name</option>
    <option value="price">Price</option>
  </select>
</label>

<ul class="product-list">
  {#each sortedProducts as product}
    <ProductSummary {product} />
  {/each}
</ul>

{#if !loading && !error && products.length === 0}
  <p>No products found.</p>
{/if}
{#if error}
  <p role="alert">{error}</p>
{/if}
