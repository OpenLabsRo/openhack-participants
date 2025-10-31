<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { navigate } from 'svelte5-router'
  import Navbar from '$lib/components/desktop/Navbar.svelte'
  import Button from '$components/ui/button/button.svelte'
  import { Input } from '$components/ui/input'
  import { RotateCw } from '@lucide/svelte'
  import { teamRune, getTeam } from '$runes/teamRune.js'
  import {
    submissionRune,
    updateName,
    updateDesc,
    updateRepo,
    updatePres,
    submissionLoading,
  } from '$runes/submissionRune.js'
  import { flagsRune } from '$runes/flagsRune.js'
  import { setError, clearError } from '$runes/errorRune'
  import { isApiError } from '$lib/api/openhackApi'
  import type { Submission, Team } from '$types/team.js'

  const DEBOUNCE_MS = 1000

  let isInitializing = true
  let nameInput = ''
  let descInput = ''
  let repoInput = ''
  let presInput = ''

  let nameDirty = false
  let descDirty = false
  let repoDirty = false
  let presDirty = false

  let nameTimer: ReturnType<typeof setTimeout> | undefined
  let descTimer: ReturnType<typeof setTimeout> | undefined
  let repoTimer: ReturnType<typeof setTimeout> | undefined
  let presTimer: ReturnType<typeof setTimeout> | undefined

  let pendingNameSync: string | null = null
  let pendingDescSync: string | null = null
  let pendingRepoSync: string | null = null
  let pendingPresSync: string | null = null

  let currentTeamId: string | null = null
  let isReloading = false

  let unsubscribeTeam: (() => void) | undefined
  let unsubscribeSubmission: (() => void) | undefined

  onMount(() => {
    let active = true

    const load = async () => {
      try {
        await getTeam()
        clearError()
      } catch (error) {
        if (
          isApiError(error) &&
          (error.status === 404 || error.status === 403 || error.status === 409)
        ) {
          teamRune.set(null)
          submissionRune.set(null)
          clearError()
        } else {
          setError(error)
        }
      } finally {
        if (active) {
          isInitializing = false
        }
      }
    }

    unsubscribeTeam = teamRune.subscribe((team) => {
      const teamId = team?.id ?? null
      const teamChanged = teamId !== currentTeamId
      currentTeamId = teamId

      if (teamChanged) {
        resetFieldTracking()
        if (!team) {
          nameInput = ''
          descInput = ''
          repoInput = ''
          presInput = ''
        }
      }
    })

    unsubscribeSubmission = submissionRune.subscribe((submission) => {
      const serverName = submission?.name ?? ''
      if (pendingNameSync !== null && serverName === pendingNameSync) {
        nameDirty = false
        pendingNameSync = null
      }
      if (!nameDirty) {
        nameInput = serverName
      }

      const serverDesc = submission?.desc ?? ''
      if (pendingDescSync !== null && serverDesc === pendingDescSync) {
        descDirty = false
        pendingDescSync = null
      }
      if (!descDirty) {
        descInput = serverDesc
      }

      const serverRepo = submission?.repo ?? ''
      if (pendingRepoSync !== null && serverRepo === pendingRepoSync) {
        repoDirty = false
        pendingRepoSync = null
      }
      if (!repoDirty) {
        repoInput = serverRepo
      }

      const serverPres = submission?.pres ?? ''
      if (pendingPresSync !== null && serverPres === pendingPresSync) {
        presDirty = false
        pendingPresSync = null
      }
      if (!presDirty) {
        presInput = serverPres
      }
    })

    void load()

    return () => {
      active = false
    }
  })

  onDestroy(() => {
    if (nameTimer) clearTimeout(nameTimer)
    if (descTimer) clearTimeout(descTimer)
    if (repoTimer) clearTimeout(repoTimer)
    if (presTimer) clearTimeout(presTimer)
    if (unsubscribeTeam) unsubscribeTeam()
    if (unsubscribeSubmission) unsubscribeSubmission()
  })

  $: currentTeam = $teamRune as Team | null
  $: currentSubmission = $submissionRune as Submission | null
  $: hasTeam = Boolean(currentTeam)
  $: isSyncing = $submissionLoading
  $: canEditSubmission = Boolean($flagsRune?.flags?.submissions_write)
  $: canViewSubmission = Boolean($flagsRune?.flags?.submissions_read)
  $: disableInputs = !hasTeam || !canEditSubmission || isSyncing

  function resetFieldTracking() {
    nameDirty = false
    pendingNameSync = null
    descDirty = false
    pendingDescSync = null
    repoDirty = false
    pendingRepoSync = null
    presDirty = false
    pendingPresSync = null
  }

  function handleNameInput() {
    if (disableInputs) return
    nameDirty = true
    scheduleNameUpdate()
  }

  function handleNameBlur() {
    if (disableInputs) return
    if (nameTimer) {
      clearTimeout(nameTimer)
      nameTimer = undefined
    }
    if (nameDirty) {
      void submitName()
    }
  }

  function handleDescInput() {
    if (disableInputs) return
    descDirty = true
    scheduleDescUpdate()
  }

  function handleDescBlur() {
    if (disableInputs) return
    if (descTimer) {
      clearTimeout(descTimer)
      descTimer = undefined
    }
    if (descDirty) {
      void submitDesc()
    }
  }

  function handleRepoInput() {
    if (disableInputs) return
    repoDirty = true
    scheduleRepoUpdate()
  }

  function handleRepoBlur() {
    if (disableInputs) return
    if (repoTimer) {
      clearTimeout(repoTimer)
      repoTimer = undefined
    }
    if (repoDirty) {
      void submitRepo()
    }
  }

  function handlePresInput() {
    if (disableInputs) return
    presDirty = true
    schedulePresUpdate()
  }

  function handlePresBlur() {
    if (disableInputs) return
    if (presTimer) {
      clearTimeout(presTimer)
      presTimer = undefined
    }
    if (presDirty) {
      void submitPres()
    }
  }

  function scheduleNameUpdate() {
    if (nameTimer) clearTimeout(nameTimer)
    nameTimer = setTimeout(() => {
      void submitName()
    }, DEBOUNCE_MS)
  }

  function scheduleDescUpdate() {
    if (descTimer) clearTimeout(descTimer)
    descTimer = setTimeout(() => {
      void submitDesc()
    }, DEBOUNCE_MS)
  }

  function scheduleRepoUpdate() {
    if (repoTimer) clearTimeout(repoTimer)
    repoTimer = setTimeout(() => {
      void submitRepo()
    }, DEBOUNCE_MS)
  }

  function schedulePresUpdate() {
    if (presTimer) clearTimeout(presTimer)
    presTimer = setTimeout(() => {
      void submitPres()
    }, DEBOUNCE_MS)
  }

  async function submitName() {
    if (disableInputs) return
    const latestTeam = get(teamRune)
    nameTimer = undefined
    if (!latestTeam) {
      pendingNameSync = null
      nameDirty = false
      return
    }

    const trimmed = nameInput.trim()
    const currentName = latestTeam.submission?.name ?? ''

    if (trimmed.length === 0) {
      nameInput = currentName
      pendingNameSync = null
      nameDirty = false
      return
    }

    if (trimmed === currentName) {
      pendingNameSync = null
      nameDirty = false
      return
    }

    try {
      pendingNameSync = trimmed
      const updatedTeam = await updateName(trimmed)
      const updatedSubmission = updatedTeam?.submission
      nameInput = updatedSubmission?.name ?? trimmed
      pendingNameSync = null
      nameDirty = false
      clearError()
    } catch (error) {
      setError(error)
      const updatedSubmission = get(submissionRune)
      nameInput = updatedSubmission?.name ?? currentName
      pendingNameSync = null
      nameDirty = false
    }
  }

  async function submitDesc() {
    if (disableInputs) return
    const latestTeam = get(teamRune)
    descTimer = undefined
    if (!latestTeam) {
      pendingDescSync = null
      descDirty = false
      return
    }

    const candidate = descInput
    const currentDesc = latestTeam.submission?.desc ?? ''

    if (candidate === currentDesc) {
      pendingDescSync = null
      descDirty = false
      return
    }

    try {
      pendingDescSync = candidate
      const updatedTeam = await updateDesc(candidate)
      const updatedSubmission = updatedTeam?.submission
      descInput = updatedSubmission?.desc ?? candidate
      pendingDescSync = null
      descDirty = false
      clearError()
    } catch (error) {
      setError(error)
      const updatedSubmission = get(submissionRune)
      descInput = updatedSubmission?.desc ?? currentDesc
      pendingDescSync = null
      descDirty = false
    }
  }

  async function submitRepo() {
    if (disableInputs) return
    const latestTeam = get(teamRune)
    repoTimer = undefined
    if (!latestTeam) {
      pendingRepoSync = null
      repoDirty = false
      return
    }

    const normalized = repoInput.trim()
    const currentRepo = latestTeam.submission?.repo ?? ''

    if (normalized === currentRepo) {
      pendingRepoSync = null
      repoDirty = false
      return
    }

    try {
      pendingRepoSync = normalized
      const updatedTeam = await updateRepo(normalized)
      const updatedSubmission = updatedTeam?.submission
      repoInput = updatedSubmission?.repo ?? normalized
      pendingRepoSync = null
      repoDirty = false
      clearError()
    } catch (error) {
      setError(error)
      const updatedSubmission = get(submissionRune)
      repoInput = updatedSubmission?.repo ?? currentRepo
      pendingRepoSync = null
      repoDirty = false
    }
  }

  async function submitPres() {
    if (disableInputs) return
    const latestTeam = get(teamRune)
    presTimer = undefined
    if (!latestTeam) {
      pendingPresSync = null
      presDirty = false
      return
    }

    const normalized = presInput.trim()
    const currentPres = latestTeam.submission?.pres ?? ''

    if (normalized === currentPres) {
      pendingPresSync = null
      presDirty = false
      return
    }

    try {
      pendingPresSync = normalized
      const updatedTeam = await updatePres(normalized)
      const updatedSubmission = updatedTeam?.submission
      presInput = updatedSubmission?.pres ?? normalized
      pendingPresSync = null
      presDirty = false
      clearError()
    } catch (error) {
      setError(error)
      const updatedSubmission = get(submissionRune)
      presInput = updatedSubmission?.pres ?? currentPres
      pendingPresSync = null
      presDirty = false
    }
  }

  function handleGoToTeam() {
    navigate('/team')
  }

  async function handleReload() {
    if (isReloading || $submissionLoading) return
    isReloading = true
    try {
      await getTeam()
      clearError()
    } catch (error) {
      setError(error)
    } finally {
      isReloading = false
    }
  }
</script>

<main class="min-h-screen bg-black text-white">
  <Navbar />

  <div
    class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-16 pt-10 md:px-8"
  >
    {#if isInitializing}
      <section
        class="rounded-3xl border border-white/5 bg-[#121212] px-10 py-12 shadow-lg shadow-black/30"
      >
        <div class="h-6 w-48 animate-pulse rounded bg-white/10"></div>
        <div class="mt-4 h-4 w-72 animate-pulse rounded bg-white/5"></div>
        <div class="mt-9 space-y-5">
          <div class="h-12 w-full animate-pulse rounded-xl bg-white/5"></div>
          <div class="h-32 w-full animate-pulse rounded-xl bg-white/5"></div>
          <div class="h-12 w-full animate-pulse rounded-xl bg-white/5"></div>
          <div class="h-12 w-full animate-pulse rounded-xl bg-white/5"></div>
        </div>
      </section>
    {:else if !canViewSubmission}
      <section
        class="rounded-3xl border border-white/5 bg-[#121212] px-10 py-12 text-center shadow-lg shadow-black/30"
      >
        <h1 class="text-2xl font-semibold text-white">Submissions locked</h1>
        <p class="mt-4 text-sm text-zinc-400">
          Your account does not currently have access to view submission
          details. Please contact an administrator if you think this is a
          mistake.
        </p>
      </section>
    {:else if !hasTeam}
      <section
        class="rounded-3xl border border-white/5 bg-[#121212] px-10 py-12 text-center shadow-lg shadow-black/30"
      >
        <h1 class="text-2xl font-semibold text-white">Create or join a team</h1>
        <p class="mt-4 text-sm leading-relaxed text-zinc-400">
          Submission details become available once you are part of a team. Head
          to the team page to create a new team or join using an invite link.
        </p>
        <Button
          class="mt-8 h-12 w-full max-w-xs rounded-xl bg-white text-base font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
          on:click={handleGoToTeam}
        >
          Go to Team
        </Button>
      </section>
    {:else}
      <section
        class="rounded-3xl border border-white/5 bg-[#121212] px-10 py-12 shadow-lg shadow-black/30"
      >
        <header
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 class="text-2xl font-semibold text-white">
              Submit your project
            </h1>
            <p class="text-sm text-zinc-400">
              All the info is auto-saved as you type
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200"
              aria-live="polite"
            >
              {#if isSyncing}
                <span class="inline-flex h-3 w-3 items-center justify-center">
                  <span
                    class="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin"
                  ></span>
                </span>
                <span>Syncing…</span>
              {:else}
                <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>Up to date</span>
              {/if}
            </div>
            <button
              class="text-zinc-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              class:animate-spin={isReloading}
              disabled={isSyncing || isReloading}
              onclick={handleReload}
              title="Reload"
            >
              <RotateCw class="h-4 w-4" />
            </button>
          </div>
        </header>

        <div class="mt-9 flex flex-col gap-6">
          <div class="space-y-3">
            <label
              for="project-name"
              class="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
              >Project Name</label
            >
            <Input
              id="project-name"
              bind:value={nameInput}
              oninput={handleNameInput}
              onblur={handleNameBlur}
              placeholder="OpenHack"
              disabled={disableInputs}
              class="h-12 rounded-xl border border-[#2E2E2E] bg-[#101010] text-base text-zinc-100 focus-visible:border-[#444]"
            />
          </div>

          <div class="space-y-3">
            <label
              for="project-desc"
              class="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
              >Short project description</label
            >
            <textarea
              id="project-desc"
              bind:value={descInput}
              oninput={handleDescInput}
              onblur={handleDescBlur}
              placeholder="Type your message here"
              disabled={disableInputs}
              class="min-h-[132px] w-full resize-y rounded-xl border border-[#2E2E2E] bg-[#101010] px-4 py-3 text-base text-zinc-100 outline-none transition focus-visible:border-[#444] disabled:cursor-not-allowed disabled:opacity-60"
            ></textarea>
          </div>

          <div class="space-y-3">
            <label
              for="project-repo"
              class="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
              >Github Link</label
            >
            <Input
              id="project-repo"
              bind:value={repoInput}
              oninput={handleRepoInput}
              onblur={handleRepoBlur}
              placeholder="https://github.com/..."
              disabled={disableInputs}
              class="h-12 rounded-xl border border-[#2E2E2E] bg-[#101010] text-base text-zinc-100 focus-visible:border-[#444]"
            />
          </div>

          <div class="space-y-3">
            <label
              for="project-pres"
              class="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
              >Presentation URL</label
            >
            <Input
              id="project-pres"
              bind:value={presInput}
              oninput={handlePresInput}
              onblur={handlePresBlur}
              placeholder="https://we.tl/..."
              disabled={disableInputs}
              class="h-12 rounded-xl border border-[#2E2E2E] bg-[#101010] text-base text-zinc-100 focus-visible:border-[#444]"
            />
            <p class="text-sm text-zinc-500">
              You will have to upload your presentation/slides on a platform
              like Google Drive or WeTransfer in order to present.
            </p>
          </div>
        </div>
      </section>
    {/if}
  </div>
</main>
