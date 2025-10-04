<script lang="ts">
  import { Router, Route } from 'svelte5-router'
  import { onMount } from 'svelte'
  import './app.css'
  import { openhackApi } from '$lib/api/openhackApi'
  import { getToken, whoami, removeToken } from '$runes/accountRune'
  import { navigate } from 'svelte5-router'
  import Index from '$routes/index.svelte'
  import Check from '$routes/auth/Check.svelte'
  import Register from '$routes/auth/Register.svelte'
  import Login from '$routes/auth/Login.svelte'
  import NotFound from '$routes/NotFound.svelte'
  import Loading from '$lib/components/Loading.svelte'

  export let url = ''

  let isLoading = true

  onMount(async () => {
    const sessionCheck = async () => {
      try {
        // Ping the API to check for connectivity and CORS
        await openhackApi.General.ping()

        const token = getToken()
        const isAuthPage = url.startsWith('/auth/')

        if (token) {
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
{:else}
  <Router {url}>
    <Route path="/">
      <Index />
    </Route>
    <Route path="/auth/check">
      <Check />
    </Route>
    <Route path="/auth/register">
      <Register />
    </Route>
    <Route path="/auth/login">
      <Login />
    </Route>
    <Route path="*">
      <NotFound />
    </Route>
  </Router>
{/if}
