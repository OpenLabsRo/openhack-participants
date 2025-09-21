import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_BASE || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Simple token storage; runes will call setToken when login/register succeeds
export function setAuthToken(token: string | null) {
  const hasLocalStorage =
    typeof globalThis !== "undefined" &&
    typeof (globalThis as any).localStorage !== "undefined";
  if (token) {
    if (hasLocalStorage)
      (globalThis as any).localStorage.setItem("auth_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    if (hasLocalStorage)
      (globalThis as any).localStorage.removeItem("auth_token");
    delete api.defaults.headers.common["Authorization"];
  }
}

// Initialize token from storage (safe in Node)
const hasLocalStorage =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as any).localStorage !== "undefined";
const stored = hasLocalStorage
  ? (globalThis as any).localStorage.getItem("auth_token")
  : null;
if (stored) setAuthToken(stored);

export default api;
