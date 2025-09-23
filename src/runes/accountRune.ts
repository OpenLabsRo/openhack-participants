import { writable } from 'svelte/store'
import { setAuthToken } from '../lib/apiClient.js'
import type { Account } from '../types/account.js'
import {
  openhackApi,
  type ApiError,
  isApiError,
  type AccountTokenResponse,
} from '../lib/api/openhackApi.js'

/**
 * accountRune store
 * - holds the currently authenticated account or null when logged out
 * - updated by `register`, `login`, and `whoami`
 */
export const accountRune = writable<Account | null>(null)

/**
 * check(email)
 * - Purpose: Query the backend to determine if an email is registered.
 * - Input: email string
 * - Output: resolved response data, expected shape { registered: boolean }
 * - Side effects: none (does not update accountRune or auth token)
 * - Error modes: throws if the network call fails
 */
export { isApiError }
export type { ApiError }

export async function check(email: string) {
  return openhackApi.Accounts.check(email)
}

/**
 * register(email, password)
 * - Purpose: Create a new account and sign-in the user.
 * - Input: email, password
 * - Output: the created account object
 * - Side effects: stores auth token (via setAuthToken) and updates `accountRune`
 * - Error modes: throws if register fails (backend validation, network error)
 */
export async function register(email: string, password: string) {
  const { token, account }: AccountTokenResponse = await openhackApi.Accounts.register({
    email,
    password,
  })
  setAuthToken(token)
  accountRune.set(account)
  return account
}

/**
 * login(email, password)
 * - Purpose: Authenticate an existing user.
 * - Input: email, password
 * - Output: the authenticated account object
 * - Side effects: stores auth token and updates `accountRune`
 * - Error modes: throws on auth failure or network error
 */
export async function login(email: string, password: string) {
  const { token, account }: AccountTokenResponse = await openhackApi.Accounts.login({
    email,
    password,
  })
  setAuthToken(token)
  accountRune.set(account)
  return account
}

/**
 * whoami()
 * - Purpose: Fetch the currently authenticated account from the backend.
 * - Input: none
 * - Output: account object
 * - Side effects: updates `accountRune` with the returned account
 * - Error modes: throws if the token is invalid or network fails
 */
export async function whoami() {
  const account = await openhackApi.Accounts.whoami()
  accountRune.set(account)
  return account
}

/**
 * logout()
 * - Purpose: Clear local auth state and remove token header.
 * - Side effects: removes stored token via setAuthToken(null) and clears `accountRune`
 */
export function logout() {
  setAuthToken(null)
  accountRune.set(null)
}
