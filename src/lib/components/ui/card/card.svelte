<script lang="ts">
  import { cn } from '$lib/utils.js'

  export let className = ''

  const { class: classAttr = '', ...restProps } = $$restProps
  $: classes = cn(
    'shad-card rounded-2xl border border-white/8 bg-white/[0.05] backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.55)]',
    classAttr as string,
    className
  )
</script>

<div {...restProps} class={classes}>
  <slot />
</div>

<style>
  .shad-card {
    background: rgba(15, 15, 20, 0.78);
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 2.75rem 2.5rem;
    color: #f5f5f5;
  }

  @media (max-width: 520px) {
    .shad-card {
      padding: 2.25rem 1.9rem;
    }
  }
</style>
