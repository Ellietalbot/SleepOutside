<script lang="ts">
  import { onMount } from "svelte";

  let visible = $state(false);

  function openUserMenu(e: MouseEvent) {
    // Stop the click from reaching the window listener immediately
    e.stopPropagation();
    visible = !visible;
  }

  // Named function required for removal
  function closeMenu() {
    visible = false;
  }

  // Named function required for removal
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeMenu();
    }
  }

  onMount(() => {
    // 1. Add Listeners
    // if the user clicks outside the menu, scrolls the page, or hits the `esc` key close the menu.
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu);
    window.addEventListener("keydown", handleKeydown);

    // 2. Return Cleanup Function
    // Svelte runs this function automatically when the component unmounts
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu);
      window.removeEventListener("keydown", handleKeydown);
    };
  });
</script>

<div class="user">
  <button
    class="user__button"
    aria-label="user management"
    title="User Management"
    onclick={openUserMenu}
  >
    <img src="/images/noun-hiker.svg" alt="user icon" />
  </button>
  
  <nav class="user__menu" class:open={visible}>
    <a href="#">Login</a>
    <a href="#">Profile</a>
    <a href="#">Orders</a>
  </nav>
</div>

<style>
  .user {
    display: flex;
    align-items: flex-end;
  }
  span {
    margin-right: 0.5em;
  }
</style>