import axios, { AxiosInstance } from 'axios'

// resolveApiBase() -> chooses base URL according to API_DEPLOYMENT env var.
function readImportMetaEnv(): Record<string, unknown> | undefined {
  try {
    const getter = Function(
      'return (typeof import.meta !== "undefined" && import.meta.env) || undefined;'
    ) as () => Record<string, unknown> | undefined
    return getter()
  } catch (_err) {
    return undefined
  }
}

export function resolveApiBase(): string {
  // Prefer Node env, then Vite import.meta.env, then default to 'dev'
  const envFromProcess =
    typeof (globalThis as any).process !== 'undefined'
      ? (globalThis as any).process.env?.API_DEPLOYMENT
      : undefined
  const envFromMeta = readImportMetaEnv()?.API_DEPLOYMENT as string | undefined
  const deployment = envFromProcess || envFromMeta || 'dev'

  // switch (String(deployment)) {
  //   case 'test':
  //     return 'http://localhost:9000'
  //   case 'dev':
  //     return 'http://localhost:9001'
  //   case 'prod':
  //   case 'production':
  //     return 'http://localhost:9002'
  //   default:
  //     return 'http://localhost:9001'
  // }
  return 'http://localhost:9000'
}

// createApi(baseURL?) -> returns a configured Axios instance.
export function createApi(baseURL?: string): AxiosInstance {
  return axios.create({
    baseURL: baseURL ?? resolveApiBase(),
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  })
}

export default createApi
