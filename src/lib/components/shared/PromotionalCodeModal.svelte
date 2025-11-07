<script lang="ts">
  import { onMount } from 'svelte'
  import { Copy as CopyIcon } from '@lucide/svelte'

  export let isOpen = false
  export let serviceName = ''
  export let promotionalCode = ''

  let copyFeedback = false

  function closeModal() {
    isOpen = false
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(promotionalCode).then(() => {
      copyFeedback = true
      setTimeout(() => {
        copyFeedback = false
      }, 2000)
    })
  }

  onMount(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  })
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
    on:click={handleBackdropClick}
    on:keydown={(e) => e.key === 'Escape' && closeModal()}
    role="dialog"
    aria-modal="true"
    tabindex="0"
  >
    <div
      class="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#141414] p-6 text-white shadow-lg shadow-black/40"
    >
      <button
        on:click={closeModal}
        class="absolute right-4 top-4 rounded-full p-1 text-zinc-400 transition-all hover:text-zinc-100"
        aria-label="Close modal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div class="mb-2 text-lg font-semibold">{serviceName}</div>
      <p class="mb-6 text-sm text-zinc-400">
        This is a promotional code. Please copy it below.
      </p>

      <div class="mb-6 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
        <p class="font-mono text-sm font-semibold text-zinc-100 break-all">
          {promotionalCode}
        </p>
      </div>

      <button
        on:click={copyToClipboard}
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 font-medium text-black transition-all hover:bg-zinc-200 active:scale-95"
      >
        <CopyIcon size={18} />
        <span>{copyFeedback ? 'Copied!' : 'Copy Code'}</span>
      </button>

      <button
        on:click={closeModal}
        class="mt-3 w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:text-white"
      >
        Close
      </button>
    </div>
  </div>
{/if}

<style>
  :global(body.modal-open) {
    overflow: hidden;
  }
</style>
