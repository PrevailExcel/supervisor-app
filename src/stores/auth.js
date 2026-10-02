import { defineStore } from 'pinia'
import api, { TOKEN_KEY } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: null,
    ready: false,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
    initials: (s) =>
      (s.user?.name || '')
        .replace(/^(Dr|Prof|Mr|Mrs|Ms)\.?\s+/i, '')
        .split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?',
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem(TOKEN_KEY, token)
    },

    async login(email, password) {
      const { data } = await api.post('/auth/login', { email, password, client: 'supervisor' }, { skipAuthRedirect: true })
      this.setToken(data.token)
      this.user = data.user
    },

    /** Called once on app start: validates the stored token. */
    async init() {
      if (this.token && !this.user) {
        try {
          const { data } = await api.get('/auth/me', { skipAuthRedirect: true })
          this.user = data
        } catch {
          this.clear()
        }
      }
      this.ready = true
    },

    async logout() {
      try { await api.post('/auth/logout', null, { skipAuthRedirect: true }) } catch { /* token may already be dead */ }
      this.clear()
    },

    clear() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
    },
  },
})
