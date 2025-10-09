<script lang="ts">
  import { accountRune, logout } from '$runes/accountRune.js';
</script>

<main>
  <h1>Main Page</h1>
  
  {#if $accountRune}
    <p>Welcome, {$accountRune.name}!</p>
    <p>Your ID is: {$accountRune.id}</p>
    <button on:click={logout}>Logout</button>
  {:else}
    <p>You are not logged in.</p>
    <a href="/auth/check">Login or Register</a>
  {/if}
</main>
