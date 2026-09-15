import { defineStore } from 'pinia'
import { STAGES, STATUS } from '@/data/stages'
import { PROJECTS, NOTIFICATIONS, CURRENT_SUPERVISOR } from '@/data/seed'
import { WRITING_DOCUMENTS, WRITING_COMMENTS, WRITING_DOCUMENTS_EXTRA, WRITING_COMMENTS_EXTRA } from '@/data/writingDocs'

const ALL_WRITING_DOCUMENTS = { ...WRITING_DOCUMENTS, ...WRITING_DOCUMENTS_EXTRA }
const ALL_WRITING_COMMENTS = { ...WRITING_COMMENTS, ...WRITING_COMMENTS_EXTRA }

// Deep-clone the seed so the demo can be mutated freely and still reset.
function freshSeed() {
  return JSON.parse(JSON.stringify(PROJECTS))
}
function freshWritingDocs() {
  return JSON.parse(JSON.stringify(ALL_WRITING_DOCUMENTS))
}
function freshWritingComments() {
  return JSON.parse(JSON.stringify(ALL_WRITING_COMMENTS))
}

export const useSupervisionStore = defineStore('supervision', {
  state: () => ({
    supervisor: CURRENT_SUPERVISOR,
    projects: freshSeed(),
    notifications: JSON.parse(JSON.stringify(NOTIFICATIONS)),
    writingDocs: freshWritingDocs(),
    writingComments: freshWritingComments(),
  }),

  getters: {
    project: (state) => (id) => state.projects.find((p) => p.id === id),

    hasWritingDocument: (state) => (projectId) => !!state.writingDocs[projectId]?.length,
    writingDocument: (state) => (projectId) => state.writingDocs[projectId] ?? [],
    commentsFor: (state) => (projectId) => state.writingComments[projectId] ?? [],
    openCommentCount: (state) => (projectId) =>
      (state.writingComments[projectId] ?? []).filter((c) => c.status === 'open').length,

    // Every submission across a project currently awaiting this
    // supervisor's decision.
    awaitingCount: (state) => (projectId) => {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project) return 0
      return project.submissions.filter((s) => s.status === STATUS.AWAITING_REVIEW).length
    },

    overallProgress: (state) => (projectId) => {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project) return 0
      const total = STAGES.length
      const done = Object.values(project.stageStatuses).filter(
        (s) => s === STATUS.APPROVED || s === STATUS.COMPLETED
      ).length
      return Math.round((done / total) * 100)
    },

    unreadNotificationCount: (state) => state.notifications.filter((n) => !n.read).length,

    submission: (state) => (projectId, submissionId) => {
      const project = state.projects.find((p) => p.id === projectId)
      return project?.submissions.find((s) => s.id === submissionId)
    },

    submissionsForStage: (state) => (projectId, stageNumber) => {
      const project = state.projects.find((p) => p.id === projectId)
      return project?.submissions.filter((s) => s.stageNumber === stageNumber) ?? []
    },
  },

  actions: {
    markNotificationRead(id) {
      const n = this.notifications.find((n) => n.id === id)
      if (n) n.read = true
    },

    markAllNotificationsRead() {
      this.notifications.forEach((n) => { n.read = true })
    },

    // ── The three supervisor actions ──────────────────────────────────
    // Per the approval rule: any one supervisor's approve is enough to
    // advance the stage, regardless of how many supervisors are assigned.

    approve(projectId, submissionId, comment) {
      const project = this.project(projectId)
      const submission = project?.submissions.find((s) => s.id === submissionId)
      if (!submission) return

      submission.status = STATUS.APPROVED
      submission.history.push(this._historyItem('approve', comment))

      // Advance the stage-level status. If this was the only/last
      // submission for the stage, the stage itself becomes Approved;
      // Stage 8 becoming Approved means the whole project is Completed.
      const stillOpen = project.submissions.some(
        (s) => s.stageNumber === submission.stageNumber && s.id !== submissionId && s.status !== STATUS.APPROVED
      )
      if (!stillOpen) {
        project.stageStatuses[submission.stageNumber] = STATUS.APPROVED
      }
    },

    askQuestion(projectId, submissionId, question) {
      if (!question?.trim()) throw new Error('A question is required.')
      const project = this.project(projectId)
      const submission = project?.submissions.find((s) => s.id === submissionId)
      if (!submission) return

      submission.history.push(this._historyItem('question', question))
      // The submission itself stays "Awaiting review" — a question isn't
      // a rejection, it's a request for clarification before deciding.
    },

    returnForRevision(projectId, submissionId, reason) {
      if (!reason?.trim()) throw new Error('A reason is required.')
      const project = this.project(projectId)
      const submission = project?.submissions.find((s) => s.id === submissionId)
      if (!submission) return

      submission.status = STATUS.REVISION_REQUIRED
      project.stageStatuses[submission.stageNumber] = STATUS.REVISION_REQUIRED
      submission.history.push(this._historyItem('revision', reason))
    },

    // Researcher-side simulation (for demoing the full loop in one app —
    // in the real product this happens in the main researcher app).
    simulateResearcherResponse(projectId, submissionId, historyItemId, response) {
      const submission = this.submission(projectId, submissionId)
      const item = submission?.history.find((h) => h.id === historyItemId)
      if (!item) return
      item.response = response
      item.responseDate = new Date().toISOString().slice(0, 10)
      item.feedbackStatus = 'responded'
    },

    resolveFeedback(projectId, submissionId, historyItemId) {
      const submission = this.submission(projectId, submissionId)
      const item = submission?.history.find((h) => h.id === historyItemId)
      if (item) item.feedbackStatus = 'resolved'
    },

    reopenFeedback(projectId, submissionId, historyItemId) {
      const submission = this.submission(projectId, submissionId)
      const item = submission?.history.find((h) => h.id === historyItemId)
      if (item) item.feedbackStatus = 'open'
    },

    _historyItem(type, comment) {
      return {
        id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        supervisorId: this.supervisor.id,
        supervisorName: this.supervisor.name,
        comment: comment ?? '',
        date: new Date().toISOString().slice(0, 10),
        response: null,
        responseDate: null,
        feedbackStatus: 'open',
      }
    },

    resetDemo() {
      this.projects = freshSeed()
      this.notifications = JSON.parse(JSON.stringify(NOTIFICATIONS))
      this.writingDocs = freshWritingDocs()
      this.writingComments = freshWritingComments()
    },

    // ── Writing Studio comments ────────────────────────────────────────

    addComment(projectId, { paraId, startOffset, endOffset, anchorText, body }) {
      if (!body?.trim()) throw new Error('A comment needs some text.')
      if (!this.writingComments[projectId]) this.writingComments[projectId] = []
      this.writingComments[projectId].push({
        id: `wc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        paraId,
        startOffset,
        endOffset,
        anchorText,
        author: this.supervisor.name,
        authorType: 'supervisor',
        body: body.trim(),
        date: new Date().toISOString().slice(0, 10),
        status: 'open',
        replies: [],
      })
    },

    addReply(projectId, commentId, body, { asResearcher = false, researcherName = null } = {}) {
      if (!body?.trim()) throw new Error('Reply cannot be empty.')
      const comment = this.writingComments[projectId]?.find((c) => c.id === commentId)
      if (!comment) return
      comment.replies.push({
        id: `${commentId}-r${Date.now()}`,
        author: asResearcher ? (researcherName ?? 'Researcher') : this.supervisor.name,
        authorType: asResearcher ? 'researcher' : 'supervisor',
        body: body.trim(),
        date: new Date().toISOString().slice(0, 10),
      })
    },

    resolveComment(projectId, commentId) {
      const comment = this.writingComments[projectId]?.find((c) => c.id === commentId)
      if (comment) comment.status = 'resolved'
    },

    reopenComment(projectId, commentId) {
      const comment = this.writingComments[projectId]?.find((c) => c.id === commentId)
      if (comment) comment.status = 'open'
    },

    deleteComment(projectId, commentId) {
      const list = this.writingComments[projectId]
      if (!list) return
      this.writingComments[projectId] = list.filter((c) => c.id !== commentId)
    },
  },
})
