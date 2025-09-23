<script lang="ts">
  import { cn } from '$lib/utils.js'

  export type ButtonVariant = 'default' | 'secondary' | 'ghost'
  export type ButtonSize = 'default' | 'sm' | 'lg'

  export let type: 'button' | 'submit' | 'reset' = 'button'
  export let variant: ButtonVariant = 'default'
  export let size: ButtonSize = 'default'
  export let className = ''
  export let disabled = false

  const { class: classAttr = '', ...restProps } = $$restProps
</script>

<button
  {...restProps}
  {type}
  class={cn(
    'shad-button',
    `shad-button--variant-${variant}`,
    `shad-button--size-${size}`,
    classAttr as string,
    className
  )}
  {disabled}
>
  <slot />
</button>

<style>
  .shad-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.9rem;
    font-weight: 600;
    transition: background 120ms ease, transform 120ms ease, box-shadow 160ms ease;
    border: none;
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    letter-spacing: 0.01em;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
  }

  .shad-button:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 2px;
  }

  .shad-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .shad-button--variant-default {
    color: #0f0f0f;
    background: linear-gradient(145deg, #ffffff, #dcdcdc);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.4);
  }

  .shad-button--variant-default:hover:not(:disabled) {
    background: linear-gradient(145deg, #f5f5f5, #d2d2d2);
    transform: translateY(-1px);
  }

  .shad-button--variant-default:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  }

  .shad-button--variant-secondary {
    color: #f5f5f5;
    background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), rgba(40, 40, 40, 0.65));
    border: 1px solid rgba(255, 255, 255, 0.16);
  }

  .shad-button--variant-secondary:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.24);
  }

  .shad-button--variant-ghost {
    color: #f5f5f5;
    background: transparent;
    border: 1px solid transparent;
  }

  .shad-button--variant-ghost:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.16);
  }

  .shad-button--size-default,
  .shad-button--size-sm,
  .shad-button--size-lg {
    min-height: 3rem;
  }

  .shad-button--size-sm {
    min-height: 2.5rem;
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }

  .shad-button--size-sm {
    border-radius: 0.8rem;
  }

  .shad-button--size-default {
    padding: 0.85rem 1.75rem;
    font-size: 1rem;
  }

  .shad-button--size-lg {
    min-height: 3.4rem;
    padding: 1rem 2rem;
    font-size: 1.05rem;
    border-radius: 1rem;
  }
</style>
