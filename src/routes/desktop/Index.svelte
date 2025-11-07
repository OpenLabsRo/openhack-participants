<script lang="ts">
  import { onMount } from 'svelte'
  import Navbar from '$lib/components/desktop/Navbar.svelte'
  import VoteBanner from '$lib/components/shared/VoteBanner.svelte'
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '$components/ui/card'
  import { Input } from '$components/ui/input'
  import { Mail as MailIcon, Phone as PhoneIcon } from '@lucide/svelte'
  import { accountRune, promotionalsRune } from '$runes/accountRune.js'
  import { teamRune, getTeam } from '$runes/teamRune.js'
  import { openhackApi, isApiError } from '$lib/api/openhackApi'
  import { flagsRune } from '$runes/flagsRune.js'
  import { getProfileGradient } from '$lib/utils/profileColor.js'
  import {
    getPromotionalConfig,
    getVoucherUrl,
  } from '$lib/data/promotionalsConfig.js'
  import QRCode from '$lib/components/shared/QRCode.svelte'
  import VmaxImageModal from '$lib/components/shared/VmaxImageModal.svelte'
  import PromotionalCodeModal from '$lib/components/shared/PromotionalCodeModal.svelte'

  function getInitials(name: string | undefined | null) {
    if (!name) return 'MI'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'MI'
    const initials = parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
    return initials || 'MI'
  }

  let qrData = 'openhack-participant'
  let vmaxModalOpen = false
  let vmaxImageUrl = ''
  let promotionalCodeModalOpen = false
  let promotionalCodeServiceName = ''
  let promotionalCode = ''

  function handlePromotionalClick(
    e: MouseEvent,
    serviceName: string,
    promoData: unknown
  ) {
    if (serviceName.toLowerCase() === 'vmax' && typeof promoData === 'string') {
      e.preventDefault()
      vmaxImageUrl = getVoucherUrl(serviceName, promoData)
      vmaxModalOpen = true
    } else {
      const config = getPromotionalConfig(serviceName)
      if (config.showModal && typeof promoData === 'string') {
        e.preventDefault()
        promotionalCodeServiceName = config.name
        promotionalCode = promoData
        promotionalCodeModalOpen = true
      }
    }
  }

  onMount(() => {
    let isActive = true

    const loadTeam = async () => {
      if (!$teamRune) {
        try {
          await getTeam()
        } catch (error) {
          if (isActive) {
            if (
              isApiError(error) &&
              (error.status === 404 || error.status === 403)
            ) {
              // teamRune is already null
            } else {
              console.error('Failed to fetch team detail:', error)
            }
          }
        }
      }
    }

    void loadTeam()

    return () => {
      isActive = false
    }
  })

  $: teamName = $teamRune?.name ?? ''

  $: firstName = $accountRune?.firstName?.trim() || 'Mihai'
  $: lastName = $accountRune?.lastName?.trim() || 'Ionel'
  $: displayName =
    [firstName, lastName].filter(Boolean).join(' ') || 'Mihai Ionel'
  $: initials = getInitials(displayName)
  $: email = $accountRune?.email ?? 'mihai.ionel@openlabs.ro'
  $: phoneNumber = $accountRune?.phoneNumber ?? '07356436232'
  $: university = $accountRune?.university ?? 'UPB FILS CTI'
  $: extraField = formatDate($accountRune?.dob)
  $: profileGradient = getProfileGradient($accountRune?.id ?? displayName)
  $: qrData = $accountRune?.id ?? 'openhack-participant'

  function formatDate(value: string | undefined | null): string {
    if (!value) return ''
    // Backend sends dates in dd.mm.yyyy format
    const parts = value.split('.')
    if (parts.length !== 3) return ''
    const day = parts[0]
    const month = parseInt(parts[1], 10)
    const year = parts[2]

    const date = new Date(Number(year), month - 1, Number(day))
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
</script>

<main class="min-h-screen bg-black text-white">
  <Navbar />

  <div
    class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-16 pt-10 md:px-8"
  >
    <VoteBanner />
    <Card class="p-6 md:px-8 md:py-3">
      <div
        class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
      >
        <div
          class="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:gap-6"
        >
          <div
            class="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full text-4xl font-bold text-white md:h-28 md:w-28"
            style={`background:${profileGradient}`}
          >
            {initials}
          </div>
          <div class="space-y-2">
            <div class="space-y-1">
              <h2 class="text-2xl font-bold text-white md:text-3xl">
                {displayName}
              </h2>
              {#if teamName && teamName.trim().length > 0}
                <p class="text-sm text-zinc-400 md:text-base">
                  Team {teamName}
                </p>
              {/if}
            </div>
            <div
              class="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-300 md:text-sm"
            >
              {#if email}
                <div class="flex items-center gap-2">
                  <MailIcon class="h-4 w-4 text-zinc-500" />
                  <span>{email}</span>
                </div>
              {/if}
              {#if phoneNumber}
                <div class="flex items-center gap-2">
                  <PhoneIcon class="h-4 w-4 text-zinc-500" />
                  <span>{phoneNumber}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
        <div
          class="flex items-center justify-center rounded-[10px] bg-transparent p-2"
        >
          <QRCode
            data={qrData}
            size={220}
            margin={16}
            className="bg-transparent"
            showLogo={false}
            logoScale={0.22}
          />
        </div>
      </div>
    </Card>

    {#if $promotionalsRune && Object.keys($promotionalsRune).length > 0}
      <Card>
        <CardHeader class="px-6 py-6 pb-3 md:px-8 md:py-7 md:pb-4">
          <CardTitle>Special Offers</CardTitle>
          <CardDescription
            >Exclusive promotions and offers for participants.</CardDescription
          >
        </CardHeader>
        <CardContent class="px-6 pb-6 pt-0 md:px-8 md:pb-8">
          <div class="flex flex-wrap gap-3">
            {#each Object.entries($promotionalsRune) as [serviceName, promoData] (serviceName)}
              {@const isVmax = serviceName.toLowerCase() === 'vmax'}
              {@const config = getPromotionalConfig(serviceName)}
              {@const shouldShowModal = config.showModal && !isVmax}
              {@const link =
                typeof promoData === 'string'
                  ? isVmax
                    ? getVoucherUrl(serviceName, promoData)
                    : shouldShowModal
                      ? '#'
                      : promoData
                  : ''}
              <a
                href={link}
                target={!isVmax && !shouldShowModal ? '_blank' : undefined}
                rel={!isVmax && !shouldShowModal
                  ? 'noopener noreferrer'
                  : undefined}
                on:click={(e) =>
                  handlePromotionalClick(e, serviceName, promoData)}
                class="basis-[calc(50%-6px)] md:basis-[calc(33.333%-8px)] flex flex-row items-center justify-start gap-2 rounded-lg border border-[#2E2E2E] bg-[#101010] p-3 transition-all hover:border-zinc-400 hover:bg-[#1a1a1a]"
              >
                {#if config.isImage}
                  <img
                    src={config.icon}
                    alt={config.name}
                    class="h-auto w-[25px] flex-shrink-0 object-cover"
                  />
                {:else}
                  <svelte:component
                    this={config.icon}
                    class="h-auto w-[25px] flex-shrink-0 {config.color}"
                  />
                {/if}
                <span
                  class="text-left text-sm font-semibold text-zinc-100 line-clamp-2"
                  >{config.name}</span
                >
              </a>
            {/each}
          </div>
        </CardContent>
      </Card>
    {/if}

    <Card>
      <CardHeader class="px-6 py-6 pb-3 md:px-8 md:py-7 md:pb-4">
        <CardTitle>Personal Information</CardTitle>
        <CardDescription
          >Update your personal details and profile information.</CardDescription
        >
      </CardHeader>
      <CardContent class="px-6 pb-6 pt-0 md:px-8 md:pb-8">
        <div class="grid gap-x-6 gap-y-5 text-sm text-zinc-200 md:grid-cols-2">
          <div class="personal-field space-y-1.5">
            <label
              class="text-[10px] uppercase tracking-[0.14em] text-zinc-500"
              for="first-name">First Name</label
            >
            <Input
              id="first-name"
              value={firstName}
              disabled
              class="h-11 rounded-[10px] border border-[#2E2E2E] bg-[#101010] text-base text-zinc-100"
            />
          </div>
          <div class="personal-field space-y-1.5">
            <label
              class="text-[10px] uppercase tracking-[0.14em] text-zinc-500"
              for="last-name">Last Name</label
            >
            <Input
              id="last-name"
              value={lastName}
              disabled
              class="h-11 rounded-[10px] border border-[#2E2E2E] bg-[#101010] text-base text-zinc-100"
            />
          </div>
          <div class="personal-field space-y-1.5">
            <label
              class="text-[10px] uppercase tracking-[0.14em] text-zinc-500"
              for="email">Email</label
            >
            <Input
              id="email"
              value={email}
              disabled
              class="h-11 rounded-[10px] border border-[#2E2E2E] bg-[#101010] text-base text-zinc-100"
            />
          </div>
          <div class="personal-field space-y-1.5">
            <label
              class="text-[10px] uppercase tracking-[0.14em] text-zinc-500"
              for="phone-number">Phone Number</label
            >
            <Input
              id="phone-number"
              value={phoneNumber}
              disabled
              class="h-11 rounded-[10px] border border-[#2E2E2E] bg-[#101010] text-base text-zinc-100"
            />
          </div>
          <div class="personal-field space-y-1.5">
            <label
              class="text-[10px] uppercase tracking-[0.14em] text-zinc-500"
              for="university">University, Faculty, Field of Study</label
            >
            <Input
              id="university"
              value={university}
              disabled
              class="h-11 rounded-[10px] border border-[#2E2E2E] bg-[#101010] text-base text-zinc-100"
            />
          </div>
          <div class="personal-field space-y-1.5">
            <label
              class="text-[10px] uppercase tracking-[0.14em] text-zinc-500"
              for="extra-field">Date of Birth</label
            >
            <Input
              id="extra-field"
              value={extraField}
              disabled
              class="h-11 rounded-[10px] border border-[#2E2E2E] bg-[#101010] text-base text-zinc-100"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</main>

<VmaxImageModal bind:isOpen={vmaxModalOpen} imageUrl={vmaxImageUrl} />
<PromotionalCodeModal
  bind:isOpen={promotionalCodeModalOpen}
  serviceName={promotionalCodeServiceName}
  {promotionalCode}
/>
