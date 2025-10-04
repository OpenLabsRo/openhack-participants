<script lang="ts">
  import { authEmail } from '$runes/authRune';
  import { login } from '$runes/accountRune';
  import { navigate } from 'svelte5-router';
  import { errorMessage, setError, clearError } from '$runes/errorRune';
  import AuthLeader from '$lib/components/AuthLeader.svelte';

  let password = '';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    clearError();
    try {
      await login($authEmail, password);
      navigate('/'); // Redirect to homepage on successful login
    } catch (error) {
      setError(error);
    }
  }
</script>

<AuthLeader title="Welcome Back" subtitle="Log in to continue." />

{#if $errorMessage}
  <div style="color: red; margin-bottom: 1em;">{$errorMessage}</div>
{/if}

<form on:submit={handleSubmit}>
  <label for="email">Email</label>
  <input id="email" type="email" bind:value={$authEmail} on:input={clearError} />

  <label for="password">Password</label>
  <input id="password" type="password" bind:value={password} on:input={clearError} />

  <button type="submit">Login</button>
</form>
