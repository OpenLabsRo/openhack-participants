<script lang="ts">
  import { onMount } from 'svelte'
  import { writable, type Writable } from 'svelte/store'
  import { navigate } from 'svelte5-router'
  import { accountRune, logout } from '$runes/accountRune.js'
  import { getProfileGradient } from '$lib/utils/profileColor.js'
  import { flagsRune } from '$runes/flagsRune.js'

  interface NavItem {
    label: string
    href: string
    icon: string
    flagRequired?: string
    disabled?: boolean
  }

    const navItemsConfig: NavItem[] = [
    {
      label: 'Profile',
      href: '/',
      icon: '/icons/home_icon.svg',
      disabled: false,
    },
    {
      label: 'Team',
      href: '/team',
      icon: '/icons/team_icon.svg',
      flagRequired: 'teams_read',
      disabled: true,
    },
    {
      label: 'Submission',
      href: '/submission',
      icon: '/icons/submissions_icon.svg',
      flagRequired: 'submissions_read',
      disabled: true,
    },
  ]

  const currentPath: Writable<string> = writable('/')
  let showLogoutModal = false

  $: navItems = navItemsConfig.map((item) => ({
    ...item,
    disabled:
      item.disabled === false
        ? false
        : item.flagRequired
          ? !($flagsRune?.flags?.[item.flagRequired] ?? false)
          : item.disabled,
  }))

  onMount(() => {
    const updatePath = () => {
      currentPath.set(window.location.pathname)
    }

    updatePath()
    window.addEventListener('popstate', updatePath)

    return () => {
      window.removeEventListener('popstate', updatePath)
    }
  })

  function handleNavClick(event: MouseEvent, item: NavItem) {
    event.preventDefault()
    if (item.disabled) return

    if (window.location.pathname === item.href) {
      return
    }

    navigate(item.href)
    currentPath.set(item.href)
  }

  function handleLogoClick(event: MouseEvent) {
    event.preventDefault()
    navigate('/404')
    currentPath.set('/404')
  }

  function getInitials(name: string | undefined | null) {
    if (!name) return 'MI'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'MI'
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
    return initials || 'MI'
  }

  $: displayName = [$accountRune?.firstName, $accountRune?.lastName]
    .filter((part) => (part ?? '').trim().length > 0)
    .join(' ') || 'Mihai Ionel'
  $: initials = getInitials(displayName)
  $: currentHref = $currentPath
  $: profileGradient = getProfileGradient($accountRune?.id ?? displayName)

  function openLogoutModal() {
    showLogoutModal = true
  }

  function closeLogoutModal() {
    showLogoutModal = false
  }

  function confirmLogout() {
    logout()
    closeLogoutModal()
    navigate('/auth/check')
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showLogoutModal) {
      event.stopPropagation()
      closeLogoutModal()
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<nav class="flex items-center justify-between bg-black px-10 py-8 text-base text-white">
  <a class="flex items-center gap-3 pl-11" href="/404" aria-label="OpenHack not found" onclick={handleLogoClick}>
    <img src="/icons/logo.svg" alt="" class="h-6 w-auto" />
  </a>

  <ul class="flex items-center gap-8">
    {#each navItems as item}
      <li>
        <a
          href={item.href}
          class={`group flex items-center gap-2.5 px-3 py-2 transition ${item.disabled ? 'cursor-not-allowed opacity-70' : ''}`}
          style={`color: ${
            item.disabled ? '#919191' : currentHref === item.href ? '#FE5428' : '#ffffff'
          }`}
          onclick={(event) => handleNavClick(event, item)}
          aria-current={currentHref === item.href ? 'page' : undefined}
          aria-disabled={item.disabled ? 'true' : undefined}
          tabindex={item.disabled ? -1 : undefined}
        >
          <img
            src={item.icon}
            alt=""
            class="h-[21px] w-[21px] transition"
            style={`filter: ${
              item.disabled
                ? 'invert(56%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(93%) contrast(90%)'
                : currentHref === item.href
                  ? 'invert(47%) sepia(98%) saturate(4454%) hue-rotate(352deg) brightness(101%) contrast(99%)'
                  : 'invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
            }`}
          />
          <span class="text-base font-semibold tracking-wide">{item.label}</span>
        </a>
      </li>
    {/each}
  </ul>

  <button
    type="button"
    class="group mr-11 flex items-center gap-3 rounded-full border border-transparent px-3 py-2 text-sm font-medium transition hover:border-white/10 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
  onclick={openLogoutModal}
    aria-haspopup="dialog"
    aria-expanded={showLogoutModal}
  >
    <span class="text-base font-normal text-[#919191]">{displayName}</span>
    <div
      class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold uppercase tracking-wide text-white transition group-hover:opacity-90"
      style={`background:${profileGradient}`}
    >
      {initials}
    </div>
  </button>
</nav>

{#if showLogoutModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <button
      type="button"
      class="absolute inset-0 z-0 h-full w-full bg-black/70"
      aria-label="Close logout dialog"
      onclick={closeLogoutModal}
    ></button>
    <div
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      class="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#141414] p-6 text-white shadow-lg shadow-black/40"
    >
      <h2 id="logout-dialog-title" class="text-lg font-semibold text-white">Sign out?</h2>
      <p id="logout-dialog-description" class="mt-2 text-sm text-zinc-400">
        You will need to log in again to access your OpenHack profile.
      </p>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:text-white"
          onclick={closeLogoutModal}
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-full bg-[#ff3b30] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#ff5249]"
          onclick={confirmLogout}
        >
          Logout
        </button>
      </div>
    </div>
  </div>
{/if}
