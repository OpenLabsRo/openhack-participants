import { writable } from 'svelte/store'
import api from '../lib/apiClient'
import type { Flags } from '../types/flags'

/**
 * flagsRune store
 * - holds feature flags and current stage from the backend
 */
export const flagsRune = writable<Flags | null>(null)

let pollIntervalMs = 5000
let pollHandle: number | null = null

/**
 * configurePolling(ms)
 * - Purpose: adjust the poll interval used by startPolling
 */
export function configurePolling(ms: number) {
  pollIntervalMs = ms
}

/**
 * fetchFlags()
 * - Purpose: Retrieve flags from the backend. Requires Authorization header.
 * - Side effects: sets `flagsRune` to the returned payload.
 */
export async function fetchFlags() {
  // Requires Authorization: Bearer token
  const res = await api.get('/accounts/flags')
  flagsRune.set(res.data)
  return res.data
}

/**
 * startPolling()
 * - Purpose: Start a periodic poll that calls `fetchFlags` at `pollIntervalMs`.
 * - Behavior: clears any existing timer first. Errors from fetchFlags are swallowed.
 */
export function startPolling() {
  stopPolling()
  pollHandle = setInterval(
    () => fetchFlags().catch(() => {}),
    pollIntervalMs
  ) as unknown as number
}

/**
 * stopPolling()
 * - Purpose: Stop the polling timer if active.
 */
export function stopPolling() {
  if (pollHandle) {
    clearInterval(pollHandle)
    pollHandle = null
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
  }
}
