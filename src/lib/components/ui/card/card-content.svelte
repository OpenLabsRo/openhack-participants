<script lang="ts">
  import { cn } from '$lib/utils.js'
  export let className = ''

  const { class: classAttr = '', ...restProps } = $$restProps
</script>

<div {...restProps} class={cn('shad-card-content flex flex-col gap-4', classAttr as string, className)}>
  <slot />
</div>

<style>
  .shad-card-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
