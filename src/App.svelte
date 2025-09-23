<script lang="ts">
  import { Router, Route } from 'svelte5-router'
  import Index from './routes/index.svelte'
  import Onboarding from './routes/onboarding.svelte'

  export let url = ''
</script>

<Router {url}>
  <Route path="/">
    <Index />
  </Route>
  <Route path="/onboarding">
    <Onboarding />
  </Route>
</Router>
