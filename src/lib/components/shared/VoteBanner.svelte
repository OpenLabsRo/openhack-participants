<script lang="ts">
  export let votingEnabled = false
  export let hasVoted = false
  import { link } from 'svelte5-router'

  $: variantClasses = hasVoted
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
    : 'border-yellow-600/30 bg-yellow-600/5 text-amber-200'
  $: linkClasses = hasVoted
    ? 'text-emerald-100 underline underline-offset-4 hover:text-emerald-50'
    : 'text-amber-100 underline underline-offset-4 hover:text-amber-50'
</script>

{#if votingEnabled}
  <div
    class={`w-full rounded-2xl border px-4 py-3 text-sm md:text-base ${variantClasses}`}
    role="status"
  >
    {#if hasVoted}
      <p class="text-center md:text-left">
        Thank you for voting! Feel free to revisit the finalists on the
        <a class={linkClasses} href="/vote" use:link>vote page</a>.
      </p>
    {:else}
      <div
        class="flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left"
      >
        <p>
          Public voting is live—cast your vote for the grand prize finalists.
        </p>
        <a class={`font-semibold ${linkClasses}`} href="/vote" use:link>
          Vote now →
        </a>
      </div>
    {/if}
  </div>
{/if}
