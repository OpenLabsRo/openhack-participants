<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'

  let email = ''

  function handleSubmit(event: Event) {
    event.preventDefault()
    // Transition logic not implemented; this is a visual-only onboarding page.
  }
</script>

<main class="page">
  <div class="backdrop">
    <div class="glow top" />
    <div class="glow bottom" />
  </div>

  <section class="layout">
    <Card class="card">
      <CardHeader class="heading">
        <div class="emblem" aria-hidden="true">
          <span class="spark" />
        </div>
        <CardTitle>OpenHack Registration</CardTitle>
        <CardDescription>Enter your email below to continue</CardDescription>
      </CardHeader>

      <CardContent>
        <form class="form" on:submit={handleSubmit}>
          <div class="field">
            <Label forId="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              bind:value={email}
              placeholder="example@openlabs.ro"
              required
              autocomplete="email"
              inputmode="email"
            />
          </div>

          <Button type="submit" size="lg">Continue</Button>
        </form>
      </CardContent>

      <CardFooter>
        <p class="disclaimer">
          By clicking continue, you agree to our
          <a href="#" aria-label="Terms of Service">Terms of Service</a>
          and
          <a href="#" aria-label="Privacy Policy">Privacy Policy</a>.
        </p>
      </CardFooter>
    </Card>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #030303;
    color: #f5f5f5;
    display: flex;
  }

  .page {
    position: relative;
    flex: 1;
    min-height: 100vh;
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top, rgba(255, 115, 22, 0.25), transparent 55%),
      radial-gradient(circle at bottom, rgba(62, 16, 255, 0.18), transparent 60%),
      #020202;
    z-index: 0;
  }

  .glow {
    position: absolute;
    width: 520px;
    height: 520px;
    filter: blur(140px);
    opacity: 0.45;
  }

  .glow.top {
    top: -120px;
    right: -80px;
    background: linear-gradient(130deg, rgba(255, 120, 35, 0.65), rgba(255, 175, 64, 0));
  }

  .glow.bottom {
    bottom: -160px;
    left: -120px;
    background: linear-gradient(180deg, rgba(64, 119, 255, 0.6), rgba(101, 92, 255, 0));
  }

  .layout {
    position: relative;
    width: min(420px, calc(100vw - 3rem));
    z-index: 1;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 2.25rem;
    position: relative;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
  }

  .emblem {
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background: linear-gradient(135deg, rgba(255, 117, 33, 0.9), rgba(255, 189, 39, 0.25));
    display: grid;
    place-items: center;
    margin-bottom: -0.5rem;
  }

  .spark {
    width: 1rem;
    height: 1rem;
    display: block;
    position: relative;
  }

  .spark::before,
  .spark::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, #fff 0%, rgba(255, 255, 255, 0) 70%);
    transform: rotate(45deg) scale(1.4, 0.6);
  }

  .spark::after {
    transform: rotate(-45deg) scale(1.4, 0.6);
  }

  .heading {
    gap: 1.5rem;
  }

  .heading :global(.shad-card-title) {
    font-size: clamp(1.625rem, 1.9vw + 1rem, 2rem);
    margin: 0;
  }

  .heading :global(.shad-card-description) {
    margin-top: -0.1rem;
    color: rgba(229, 229, 229, 0.64);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .disclaimer {
    margin: 0;
    font-size: 0.85rem;
    color: rgba(229, 229, 229, 0.6);
    line-height: 1.4;
  }

  .disclaimer a {
    color: rgba(255, 255, 255, 0.88);
    text-decoration: none;
  }

  .disclaimer a:hover,
  .disclaimer a:focus-visible {
    text-decoration: underline;
  }

  @media (max-width: 520px) {
    .card {
      padding: 2.25rem 1.75rem;
    }

    .form {
      gap: 0.75rem;
    }
  }
</style>
