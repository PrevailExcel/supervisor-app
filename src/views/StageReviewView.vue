<template>
  <div v-if="project && submission">
    <router-link :to="{ name: 'project', params: { id: project.id } }" class="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint hover:text-ink transition-colors mb-6">
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      {{ project.researcher.name }}
    </router-link>

    <div class="flex items-start justify-between mb-6">
      <div>
        <p class="text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide">Stage {{ submission.stageNumber }}</p>
        <h1 class="font-serif text-[22px] font-semibold text-ink leading-tight mt-0.5">
          {{ submission.sectionLabel || stageDef.name }}
        </h1>
      </div>
      <StatusTag :status="submission.status" />
    </div>

    <div class="grid grid-cols-[1fr_320px] gap-10 items-start">
      <!-- Manuscript pane -->
      <div class="border border-rule rounded-md bg-paper-raised p-8">
        <template v-if="submission.content">
          <StageOutput :stage-number="submission.stageNumber" :content="submission.content" />
        </template>
        <p v-else class="text-[13px] text-ink-faint">Nothing submitted for this stage yet.</p>

        <div v-if="submission.researcherNote" class="mt-6 pt-6 border-t border-rule">
          <p class="text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-2">Researcher&rsquo;s note</p>
          <p class="text-[13.5px] font-serif text-ink-soft italic leading-relaxed">&ldquo;{{ submission.researcherNote }}&rdquo;</p>
        </div>
      </div>

      <!-- Margin: history + actions -->
      <div class="space-y-5">
        <!-- Feedback history -->
        <div v-if="submission.history.length">
          <p class="text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-3">Feedback</p>
          <div class="space-y-3">
            <div v-for="item in [...submission.history].reverse()" :key="item.id" class="border-l-2 pl-3" :class="marginBorder(item.type)">
              <div class="flex items-center justify-between">
                <p class="text-[11.5px] font-medium text-ink">{{ item.supervisorName }}</p>
                <p class="text-[10.5px] text-ink-faint">{{ formatDate(item.date) }}</p>
              </div>
              <p class="text-[11px] text-ink-faint mb-1">{{ typeLabel(item.type) }}</p>
              <p v-if="item.comment" class="text-[12.5px] text-ink-soft leading-relaxed">{{ item.comment }}</p>

              <div v-if="item.response" class="mt-2 pl-3 border-l border-rule">
                <p class="text-[10.5px] text-ink-faint mb-0.5">{{ project.researcher.name }} responded &middot; {{ formatDate(item.responseDate) }}</p>
                <p class="text-[12.5px] text-ink-soft leading-relaxed">{{ item.response }}</p>
              </div>
              <div v-else-if="item.type === 'question'" class="mt-2">
                <p class="text-[11px] text-awaiting">Awaiting researcher&rsquo;s response</p>
              </div>

              <div v-if="item.response" class="mt-1.5">
                <button
                  v-if="item.feedbackStatus !== 'resolved'"
                  class="text-[10.5px] text-accent hover:underline"
                  @click="store.resolveFeedback(project.id, submission.id, item.id)"
                >Mark resolved</button>
                <button
                  v-else
                  class="text-[10.5px] text-ink-faint hover:underline"
                  @click="store.reopenFeedback(project.id, submission.id, item.id)"
                >Resolved &middot; reopen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="submission.status === 'awaiting_review'" class="border-t border-rule pt-5">
          <p class="text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-3">Your decision</p>

          <div v-if="mode === null" class="space-y-2">
            <button class="w-full text-left px-3.5 py-2.5 rounded-md border border-approved/30 bg-approved-bg text-approved text-[12.5px] font-medium hover:bg-approved/10 transition-colors" @click="mode = 'approve'">
              Approve
            </button>
            <button class="w-full text-left px-3.5 py-2.5 rounded-md border border-rule bg-paper text-ink-soft text-[12.5px] font-medium hover:bg-paper-sunken transition-colors" @click="mode = 'question'">
              Ask a question
            </button>
            <button class="w-full text-left px-3.5 py-2.5 rounded-md border border-attention/30 bg-attention-bg text-attention text-[12.5px] font-medium hover:bg-attention/10 transition-colors" @click="mode = 'revision'">
              Return for revision
            </button>
          </div>

          <div v-else class="space-y-2.5">
            <p class="text-[12px] font-medium" :class="modeLabelClass">{{ modeLabel }}</p>
            <textarea
              v-model="draft"
              rows="4"
              class="w-full text-[12.5px] border border-rule rounded-md p-2.5 bg-paper focus:border-accent outline-none resize-none leading-relaxed"
              :placeholder="mode === 'approve' ? 'Optional comment\u2026' : mode === 'question' ? 'Your question (required)\u2026' : 'What needs to change (required)\u2026'"
            />
            <p v-if="error" class="text-[11px] text-attention">{{ error }}</p>
            <div class="flex gap-2">
              <button class="flex-1 text-[12.5px] font-medium py-2 rounded-md transition-colors" :class="confirmClass" @click="confirm">
                Confirm
              </button>
              <button class="text-[12.5px] text-ink-faint hover:text-ink px-3" @click="cancel">Cancel</button>
            </div>
          </div>
        </div>

        <div v-else class="border-t border-rule pt-5">
          <p class="text-[12px] text-ink-faint">No action needed &mdash; this submission is {{ statusLower }}.</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-24 text-ink-faint text-[13px]">Submission not found.</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSupervisionStore } from '@/stores/supervision'
import { STAGES, STATUS_LABEL } from '@/data/stages'
import StatusTag from '@/components/StatusTag.vue'
import StageOutput from '@/components/StageOutput.vue'

const props = defineProps({
  id: { type: String, required: true },
  stageNumber: { type: [String, Number], required: true },
  submissionId: { type: String, required: true },
})

const store = useSupervisionStore()
const project = computed(() => store.project(props.id))
const submission = computed(() => store.submission(props.id, props.submissionId))
const stageDef = computed(() => STAGES.find((s) => s.number === Number(props.stageNumber)))
const statusLower = computed(() => (STATUS_LABEL[submission.value?.status] || '').toLowerCase())

const mode = ref(null) // null | 'approve' | 'question' | 'revision'
const draft = ref('')
const error = ref('')

const modeLabel = computed(() => ({
  approve: 'Approving this submission',
  question: 'Ask a question before deciding',
  revision: 'Return this submission for revision',
}[mode.value]))

const modeLabelClass = computed(() => ({
  approve: 'text-approved', question: 'text-ink', revision: 'text-attention',
}[mode.value]))

const confirmClass = computed(() => ({
  approve: 'bg-approved text-paper hover:opacity-90',
  question: 'bg-accent text-paper hover:opacity-90',
  revision: 'bg-attention text-paper hover:opacity-90',
}[mode.value]))

function cancel() {
  mode.value = null
  draft.value = ''
  error.value = ''
}

function confirm() {
  error.value = ''
  try {
    if (mode.value === 'approve') {
      store.approve(project.value.id, submission.value.id, draft.value.trim())
    } else if (mode.value === 'question') {
      store.askQuestion(project.value.id, submission.value.id, draft.value.trim())
    } else if (mode.value === 'revision') {
      store.returnForRevision(project.value.id, submission.value.id, draft.value.trim())
    }
    cancel()
  } catch (e) {
    error.value = e.message
  }
}

function typeLabel(type) {
  return { approve: 'Approved', question: 'Asked a question', revision: 'Returned for revision' }[type] ?? type
}
function marginBorder(type) {
  return { approve: 'border-approved', question: 'border-accent', revision: 'border-attention' }[type] ?? 'border-rule'
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
