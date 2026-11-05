<script lang="ts">
  import { userStore, logout } from "../js/auth.svelte.ts";
  import { onMount } from "svelte";
  const baseURL = import.meta.env.PUBLIC_SERVER_URL;
  let profile = $state("");

async function getProfile() {
    console.log(userStore.token);
    const res = await fetch(`${baseURL}users/protected`, {
      method: "GET",
      headers: {
        // This is how we pass our token to the server for protected routes.
        Authorization: `Bearer ${userStore.token}`
      }
    });
    if (res.ok) {
      return res.json();
    } else {
      // if we get an error back...it means there is something wrong with our token and we should log the user out.
      logout();
      window.location.href = `/login/?redirect=${window.location.pathname}`;
    }
  }
  
  async function init() {
    profile = await getProfile();
  }
  onMount(init);
</script>

{#if userStore.isLoggedIn}
  <p>{profile.message}</p>
{:else}
  <p>You must login to see this page</p>
{/if}