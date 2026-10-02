import axios from 'axios'

export const TOKEN_KEY = 'sv_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// A 401 means the token is gone/expired — back to sign-in, remembering where we were.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.skipAuthRedirect) {
      localStorage.removeItem(TOKEN_KEY)
      const here = window.location.pathname + window.location.search
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/invite')) {
        window.location.href = `/login?redirect=${encodeURIComponent(here)}`
      }
    }
    return Promise.reject(err)
  },
)

/** Pull a human message out of a Laravel error response. */
export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const d = err?.response?.data
  if (d?.errors) {
    const first = Object.values(d.errors).flat()[0]
    if (first) return first
  }
  return d?.message || (err?.response ? fallback : 'Can’t reach the server. Check your connection.')
}

export default api
