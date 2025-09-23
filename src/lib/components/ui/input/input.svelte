<script lang="ts">
  import { cn } from '$lib/utils.js'

  export let className = ''
  export let value: string | number | undefined
  export let id: string | undefined
  export let name: string | undefined
  export let type = 'text'
  export let placeholder = ''
  export let required = false
  export let autocomplete: string | undefined
  export let inputmode: string | undefined

  const { class: classAttr = '', ...restProps } = $$restProps

  const baseClass =
    'shad-input block w-full rounded-lg border border-white/12 bg-white/[0.08] px-4 py-3 text-base text-white placeholder:text-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.45)] focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur'
</script>

<input
  {...restProps}
  bind:value
  class={cn(baseClass, classAttr as string, className)}
  {id}
  {name}
  {type}
  {placeholder}
  {required}
  {autocomplete}
  {inputmode}
/>

<style>
  .shad-input {
    border-radius: 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.05);
    color: #f5f5f5;
    backdrop-filter: blur(10px);
    transition: border-color 120ms ease, box-shadow 160ms ease;
  }

  .shad-input::placeholder {
    color: rgba(255, 255, 255, 0.48);
  }

  .shad-input:focus {
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.12);
    outline: none;
  }

  .shad-input:-webkit-autofill,
  .shad-input:-webkit-autofill:hover,
  .shad-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.08) inset;
    -webkit-text-fill-color: #f5f5f5;
  }
</style>
