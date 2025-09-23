import { writable } from 'svelte/store';
import { openhackApi } from '../lib/api/openhackApi.js';
/**
 * flagsRune store
 * - holds feature flags and current stage from the backend
 */
export const flagsRune = writable(null);
let pollIntervalMs = 5000;
let pollHandle = null;
/**
 * configurePolling(ms)
 * - Purpose: adjust the poll interval used by startPolling
 */
export function configurePolling(ms) {
    pollIntervalMs = ms;
}
/**
 * fetchFlags()
 * - Purpose: Retrieve flags from the backend. Requires Authorization header.
 * - Side effects: sets `flagsRune` to the returned payload.
 */
export async function fetchFlags() {
    const flags = await openhackApi.Flags.fetch();
    flagsRune.set(flags);
    return flags;
}
/**
 * startPolling()
 * - Purpose: Start a periodic poll that calls `fetchFlags` at `pollIntervalMs`.
 * - Behavior: clears any existing timer first. Errors from fetchFlags are swallowed.
 */
export function startPolling() {
    stopPolling();
    pollHandle = setInterval(() => fetchFlags().catch(() => { }), pollIntervalMs);
}
/**
 * stopPolling()
 * - Purpose: Stop the polling timer if active.
 */
export function stopPolling() {
    if (pollHandle) {
        clearInterval(pollHandle);
        pollHandle = null;
    }
}
// Placeholder for websocket subscription; to be implemented when backend
// provides websocket endpoint and event schema. subscribeWs should update
// flagsRune and handle kicked events (redirect/logout) when received.
/**
 * subscribeWs()
 * - Purpose: placeholder API that should return an unsubscribe function.
 * - Current behavior: returns a no-op unsubscribe. Will be implemented when
 *   backend exposes websocket events.
 */
export function subscribeWs() {
    // TODO: implement when backend WS API is available
    return () => {
        /* unsubscribe */
    };
}
