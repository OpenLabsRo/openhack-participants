<script lang="ts">
  import { cn } from '$lib/utils.js'
  export let className = ''

  const { class: classAttr = '', ...restProps } = $$restProps
</script>

<div {...restProps} class={cn('shad-card-footer flex flex-col gap-3 text-sm text-white/60', classAttr as string, className)}>
  <slot />
</div>

<style>
  .shad-card-footer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-size: 0.95rem;
    color: rgba(229, 229, 229, 0.6);
  }
</style>
