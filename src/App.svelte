<script lang="ts">
  import { Router, Route } from 'svelte5-router'
  import { onMount } from 'svelte'
  import './app.css'
  import { openhackApi } from '$lib/api/openhackApi'
  import { getToken, whoami, removeToken } from '$runes/accountRune'
  import { navigate } from 'svelte5-router'
  // desktop routes
  import DesktopIndex from '$routes/desktop/auth/index.svelte'
  import DesktopCheck from '$routes/desktop/auth/Check.svelte'
  import DesktopRegister from '$routes/desktop/auth/Register.svelte'
  import DesktopLogin from '$routes/desktop/auth/Login.svelte'
  import DesktopNotFound from '$routes/desktop/auth/NotFound.svelte'

  // mobile routes
  import MobileIndex from '$routes/mobile/auth/index.svelte'
  import MobileCheck from '$routes/mobile/auth/Check.svelte'
  import MobileRegister from '$routes/mobile/auth/Register.svelte'
  import MobileLogin from '$routes/mobile/auth/Login.svelte'
  import MobileNotFound from '$routes/mobile/auth/NotFound.svelte'

  // shared components
  import Loading from '$lib/components/shared/Loading.svelte'

  export let url = ''

  function checkDesktop(): boolean {
    if (typeof window === 'undefined') return true; // assume desktop during SSR

    const mqWidth   = window.matchMedia('(min-width: 768px)').matches;
    const mqHover   = window.matchMedia('(hover: hover)').matches;
    const mqPointer = window.matchMedia('(pointer: fine)').matches;

    return mqWidth && (mqHover || mqPointer);
  }

  let isLoading = true
  let pingFailed = false
  let isDesktop = true

  onMount(async () => {
    isDesktop = checkDesktop()
    const sessionCheck = async () => {
      try {
        // Ping the API to check for connectivity and CORS
        await openhackApi.General.ping()

        const token = getToken()
        const isAuthPage = url.startsWith('/auth/check')

        if (token) {
          navigate('/')
          // If a token exists, try to fetch the user's account data to restore the session
          try {
            await whoami()
          } catch (error) {
            console.error('Failed to restore session:', error)
            // If the token is invalid, remove it and redirect to the login page
            removeToken()
            if (!isAuthPage) {
              navigate('/auth/check')
            }
          }
        } else if (!isAuthPage) {
          // If no token, redirect to auth check
          navigate('/auth/check')
        }
      } catch (error) {
        console.error('API Ping failed:', error)
        pingFailed = true
        navigate('/404')
        return
      }
    }

    const minimumWait = new Promise((resolve) => setTimeout(resolve, 700))


    try {
      await Promise.all([sessionCheck(), minimumWait])
    } finally {
      isLoading = false
    }


  })
</script>

{#if isLoading}
  <Loading />
{:else if pingFailed && isDesktop}
  <DesktopNotFound />
{:else if pingFailed && !isDesktop}
  <MobileNotFound />
{:else if isDesktop}
  <Router {url}>
    <Route path="/">
      <DesktopIndex />
    </Route>
    <Route path="/auth/check">
      <DesktopCheck />
    </Route>
    <Route path="/auth/register">
      <DesktopRegister />
    </Route>
    <Route path="/auth/login">
      <DesktopLogin />
    </Route>
    <Route path="*">
      <DesktopNotFound />
    </Route>
  </Router>
{:else}
  <Router {url}>
    <Route path="/">
      <MobileIndex />
    </Route>
    <Route path="/auth/check">
      <MobileCheck />
    </Route>
    <Route path="/auth/register">
      <MobileRegister />
    </Route>
    <Route path="/auth/login">
      <MobileLogin />
    </Route>
    <Route path="*">
      <MobileNotFound />
    </Route>
  </Router>  
{/if}
