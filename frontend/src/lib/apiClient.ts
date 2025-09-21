import createApi from './apiBase'

// create axios instance using resolved base URL from apiBase
const api = createApi()

// Simple token storage; runes will call setToken when login/register succeeds
export function setAuthToken(token: string | null) {
  const hasLocalStorage =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as any).localStorage !== 'undefined'
  if (token) {
    if (hasLocalStorage)
      (globalThis as any).localStorage.setItem('auth_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    if (hasLocalStorage)
      (globalThis as any).localStorage.removeItem('auth_token')
    delete api.defaults.headers.common['Authorization']
  }
}

// Initialize token from storage (safe in Node)
const hasLocalStorage =
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as any).localStorage !== 'undefined'
const stored = hasLocalStorage
  ? (globalThis as any).localStorage.getItem('auth_token')
  : null
if (stored) setAuthToken(stored)

export default api
