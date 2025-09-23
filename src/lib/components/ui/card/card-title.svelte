<script lang="ts">
  import { cn } from '$lib/utils.js'
  export let className = ''

  const { class: classAttr = '', ...restProps } = $$restProps
</script>

<h3
  {...restProps}
  class={cn('shad-card-title text-2xl font-semibold tracking-tight text-white', classAttr as string, className)}
>
  <slot />
</h3>

<style>
  .shad-card-title {
    margin: 0;
    font-size: 1.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
</style>
