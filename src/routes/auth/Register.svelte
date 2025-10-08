<script lang="ts">
  import { authEmail } from '$runes/authRune';
  import { register } from '$runes/accountRune';
  import { navigate } from 'svelte5-router';
  import { errorMessage, setErrorMessage, setError, clearError } from '$runes/errorRune';
  import AuthLeader from '$lib/components/AuthLeader.svelte';
  import { Input } from "$components/ui/input";
  import Button from '$lib/components/ui/button/button.svelte'
  import { Alert } from '$lib/components/ui/alert'
  import { CircleAlertIcon } from '@lucide/svelte'
  import AlertDescription from '$lib/components/ui/alert/alert-description.svelte'

  let password = '';
  let confirmPassword = '';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    clearError();

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
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

<style>
  main {
    max-width: 384px;
    margin: 0 auto;
    margin-top: 30vh;
  }

  .spacer {
    height: 10px;
  }
</style>

<main>
  <AuthLeader
    title="Create a password"
    subtitle="Enter a strong password below to finish creating your account"
  />

  <form on:submit={handleSubmit}>
    <br>
    <Input
      id="email"
      type="email"
      bind:value={$authEmail}
      placeholder="example@openhack.ro"
      disabled
    />
    <div class="spacer"></div>
    <Input
      id="password"
      type="password"
      bind:value={password}
      placeholder="Your password"
      autofocus
    />
    <div class="spacer"></div>
    <Input
      id="confirm-password"
      type="password"
      bind:value={confirmPassword}
      placeholder="Confirm password"
    />
    <br>
    <Button
      type="submit"
      class="w-full"
    >
      Login
    </Button>

  </form>

  <br>
  
  {#if $errorMessage}
    <Alert variant="destructive" size="default">
      <CircleAlertIcon />
      <AlertDescription class="justify-self-start text-left">
        {$errorMessage}
      </AlertDescription>
    </Alert>
  {/if}

</main>