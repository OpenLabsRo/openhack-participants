// Minimal utility replicating shadcn-svelte's `cn` helper.
export function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
