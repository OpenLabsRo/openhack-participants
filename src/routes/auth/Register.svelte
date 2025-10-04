<script lang="ts">
  import { authEmail } from '$runes/authRune';
  import { register } from '$runes/accountRune';
  import { navigate } from 'svelte5-router';
  import { errorMessage, setError, clearError } from '$runes/errorRune';
  import AuthLeader from '$lib/components/AuthLeader.svelte';

  let password = '';
  let confirmPassword = '';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    clearError();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register($authEmail, password);
      navigate('/'); // Redirect to homepage on successful registration
    } catch (error) {
      setError(error);
    }
  }
</script>

<AuthLeader title="Create Your Account" subtitle="Complete your registration by setting a password." />

{#if $errorMessage}
  <div style="color: red; margin-bottom: 1em;">{$errorMessage}</div>
{/if}

<form on:submit={handleSubmit}>
  <label for="email">Email</label>
  <input id="email" type="email" bind:value={$authEmail} on:input={clearError} />

  <label for="password">Password</label>
  <input id="password" type="password" bind:value={password} on:input={clearError} />

  <label for="confirm-password">Confirm Password</label>
  <input id="confirm-password" type="password" bind:value={confirmPassword} on:input={clearError} />

  <button type="submit">Register</button>
</form>
