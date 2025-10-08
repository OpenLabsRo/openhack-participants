<script lang="ts">
  import { authEmail } from '$runes/authRune'
  import { check } from '$runes/accountRune'
  import { navigate } from 'svelte5-router'
  import { errorMessage, setError, clearError } from '$runes/errorRune'
  import AuthLeader from '$components/AuthLeader.svelte'
  import { Input } from "$components/ui/input";
  import Button from '$components/ui/button/button.svelte'
  import {Alert} from '$components/ui/alert'
  import { CircleAlertIcon } from '@lucide/svelte'
  import AlertDescription from '$components/ui/alert/alert-description.svelte'
  import AuthContainer from '$components/AuthContainer.svelte'

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

<style>
  p {
    color: var(--secondary-text);
    text-align: center;
  }

  a {
    color: var(--secondary-text);
    text-decoration: underline;
  }

  .spacer {
    height: 20px;
  }
</style>

<AuthContainer>
  <AuthLeader
    title="OpenHack Registration"
    subtitle="Enter your email below to continue"
  />

  <form on:submit={handleSubmit}>
    <br>
    <Input
      id="email"
      type="email"
      bind:value={$authEmail}
      placeholder="example@openhack.ro"
      autofocus
    />
    <div class="spacer"></div> 
    {#if $errorMessage}
      <Alert variant="destructive" size="default">
        <CircleAlertIcon />
        <AlertDescription>{$errorMessage}</AlertDescription>
        <!-- <AlertDescription>Account not initialized - talk to the administrator</AlertDescription> -->
      </Alert>
      <div class="spacer"></div> 
    {/if}
    <Button
      type="submit"
      class="w-full"
    >
      Continue
    </Button>

    <p>
      By clicking "Continue", you agree to our
      <a href="https://tos.openhack.ro" target="_blank" rel="noopener noreferrer">Terms of Service</a>
      and
      <a href="https://privacy.openhack.ro" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
    </p>

  </form>
  
 
</AuthContainer>
