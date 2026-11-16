
const API_BASE_URL = ''

export class ApiError extends Error {
  public readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let refreshPromise: Promise<boolean> | null = null

const refreshSession = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        return response.ok
      } catch {
        return false
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

const shouldRefreshSession = (path: string): boolean => {
  const excludedPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
  ]

  return !excludedPaths.includes(path)
}

const parseError = async (response: Response): Promise<ApiError> => {
  const errorBody: unknown = await response.json().catch(() => null)

  let message = `Request failed with status ${response.status}`

  if (
    errorBody &&
    typeof errorBody === 'object' &&
    'message' in errorBody &&
    typeof errorBody.message === 'string'
  ) {
    message = errorBody.message
  }

  return new ApiError(response.status, message)
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  _legacyToken?: string,
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  }

  let response = await fetch(`${API_BASE_URL}${path}`, requestOptions)

  if (response.status === 401 && shouldRefreshSession(path)) {
    const refreshed = await refreshSession()

    if (refreshed) {
      response = await fetch(`${API_BASE_URL}${path}`, requestOptions)
    }
  }

  if (!response.ok) {
    throw await parseError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
