<script lang="ts">
  import { onMount } from 'svelte'
  import { getToken } from '$runes/accountRune.js'

  export let isOpen = false
  export let imageUrl = ''

  let fullImageUrl = ''

  $: if (isOpen && imageUrl) {
    const token = getToken()
    if (token) {
      const url = new URL(imageUrl, window.location.origin)
      url.searchParams.append('token', token)
      fullImageUrl = url.toString()
    } else {
      fullImageUrl = imageUrl
    }
  }

  function closeModal() {
    isOpen = false
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      closeModal()
    }
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
      class="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-black"
    >
      <button
        on:click={closeModal}
        class="absolute right-4 top-4 z-10 rounded-full bg-zinc-900 p-2 text-zinc-100 transition-all hover:bg-zinc-700"
        aria-label="Close modal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
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

      {#if fullImageUrl}
        <img
          src={fullImageUrl}
          alt="Vmax promotional content"
          class="h-auto w-full"
        />
      {/if}
    </div>
  </div>
{/if}

<style>
  :global(body.modal-open) {
    overflow: hidden;
  }
</style>
