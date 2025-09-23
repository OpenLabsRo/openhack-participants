<script lang="ts">
  import { cn } from '$lib/utils.js'
  export let className = ''

  const { class: classAttr = '', ...restProps } = $$restProps
</script>

<div {...restProps} class={cn('shad-card-header', classAttr as string, className)}>
  <slot />
</div>

<style>
  .shad-card-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
</style>
