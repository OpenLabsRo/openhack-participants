<script lang="ts">
  import { authEmail } from '$runes/authRune'
  import { check } from '$runes/accountRune'
  import { navigate } from 'svelte5-router'
  import { errorMessage, setError, clearError } from '$runes/errorRune'
  import AuthLeader from '$components/AuthLeader.svelte'
  import { Input } from "$components/ui/input";

  $: $authEmail && clearError();

  async function handleSubmit(event: Event) {
    event.preventDefault()
    clearError() // Clear previous errors
    try {
      const { registered } = await check($authEmail)
      if (registered) {
        navigate('/auth/login')
      } else {
        navigate('/auth/register')
      }
    } catch (error) {
      setError(error)
    }
  }
</script>

<AuthLeader
  title="OpenHack Registration"
  subtitle="Enter your email below to continue"
/>

{#if $errorMessage}
  <div style="color: red; margin-bottom: 1em;">{$errorMessage}</div>
{/if}

<form on:submit={handleSubmit}>
  <label for="email">Email</label>
  <Input
    id="email"
    type="email"
    bind:value={$authEmail}
  />
  <button type="submit">Check</button>
</form>
