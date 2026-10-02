import { defineStore } from 'pinia'
import api from '@/services/api'

export const useSupervisionStore = defineStore('supervision', {
  state: () => ({
    projects: [],
    projectsLoaded: false,
    notifications: [],
    unread: 0,
  }),

  getters: {
    totalAwaiting: (s) => s.projects.reduce((n, p) => n + (p.awaiting || 0), 0),
  },

  actions: {
    // ── Projects ─────────────────────────────────────────
    async fetchProjects() {
      const { data } = await api.get('/supervision/projects')
      this.projects = data
      this.projectsLoaded = true
    },

    async fetchProject(id) {
      const { data } = await api.get(`/supervision/projects/${id}`)
      return data
    },

    async fetchSubmission(projectId, submissionId) {
      const { data } = await api.get(`/supervision/projects/${projectId}/submissions/${submissionId}`)
      return data
    },

    // ── Decisions: approve | question | revision ─────────
    async decide(projectId, submissionId, action, comment = '') {
      const { data } = await api.post(
        `/supervision/projects/${projectId}/submissions/${submissionId}/decision`,
        { action, comment },
      )
      return data
    },

    async resolveFeedback(projectId, feedbackId, resolved) {
      const { data } = await api.post(
        `/supervision/projects/${projectId}/feedback/${feedbackId}/resolve`,
        { resolved },
      )
      return data
    },

    // ── Writing Studio ───────────────────────────────────
    async fetchWriting(projectId) {
      const { data } = await api.get(`/supervision/projects/${projectId}/writing`)
      return data
    },

    async addComment(projectId, payload) {
      const { data } = await api.post(`/projects/${projectId}/writing-comments`, payload)
      return data
    },

    async addReply(projectId, commentId, body) {
      const { data } = await api.post(`/projects/${projectId}/writing-comments/${commentId}/replies`, { body })
      return data
    },

    async setCommentResolved(projectId, commentId, resolved) {
      const { data } = await api.post(`/projects/${projectId}/writing-comments/${commentId}/resolve`, { resolved })
      return data
    },

    async deleteComment(projectId, commentId) {
      await api.delete(`/projects/${projectId}/writing-comments/${commentId}`)
    },

    // ── Notifications ────────────────────────────────────
    async fetchNotifications() {
      try {
        const { data } = await api.get('/supervision/notifications', { params: { audience: 'supervisor' } })
        this.notifications = data.items
        this.unread = data.unread
      } catch { /* the bell is non-critical */ }
    },

    async markRead(id) {
      const n = this.notifications.find((x) => x.id === id)
      if (n && !n.read) { n.read = true; this.unread = Math.max(0, this.unread - 1) }
      try { await api.post(`/supervision/notifications/${id}/read`) } catch { /* ignore */ }
    },

    async markAllRead() {
      this.notifications.forEach((n) => { n.read = true })
      this.unread = 0
      try { await api.post('/supervision/notifications/read-all', { audience: 'supervisor' }) } catch { /* ignore */ }
    },

    reset() {
      this.projects = []
      this.projectsLoaded = false
      this.notifications = []
      this.unread = 0
    },
  },
})
