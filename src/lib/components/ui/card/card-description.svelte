<script lang="ts">
  import { cn } from '$lib/utils.js'
  export let className = ''

  const { class: classAttr = '', ...restProps } = $$restProps
</script>

<p
  {...restProps}
  class={cn('shad-card-description text-base text-white/70', classAttr as string, className)}
>
  <slot />
</p>

<style>
  .shad-card-description {
    margin: 0;
    color: rgba(229, 229, 229, 0.68);
    font-size: 1rem;
    line-height: 1.5;
  }
</style>
