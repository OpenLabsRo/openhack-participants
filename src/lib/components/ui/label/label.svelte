<script lang="ts">
  import { cn } from '$lib/utils.js'

  export let className = ''
  export let forId: string | undefined

  const { class: classAttr = '', ...restProps } = $$restProps
</script>

<label
  {...restProps}
  for={forId}
  class={cn('shad-label text-sm font-medium text-white/80', classAttr as string, className)}
>
  <slot />
</label>

<style>
  .shad-label {
    font-size: 0.975rem;
    letter-spacing: 0.01em;
  }
</style>
