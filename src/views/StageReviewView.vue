<template>
  <div v-if="sub">
    <router-link :to="{ name: 'project', params: { id } }" class="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint hover:text-ink transition-colors mb-6">
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      {{ sub.researcher.name }}
    </router-link>

    <div class="flex items-start justify-between mb-6 gap-4">
      <div>
        <p class="text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide">
          Stage {{ sub.step_number }}<template v-if="sub.revision > 1"> &middot; revision {{ sub.revision }}</template>
        </p>
        <h1 class="font-serif text-[22px] font-semibold text-ink leading-tight mt-0.5">{{ sub.section_label || sub.stage_title }}</h1>
        <p v-if="sub.section_label" class="text-[12px] text-ink-faint mt-1">{{ sub.stage_title }}</p>
      </div>
      <StatusTag :status="sub.status" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
      <!-- Manuscript pane -->
      <div class="border border-rule rounded-md bg-paper-raised p-8 min-w-0">
        <StageOutput :kind="sub.kind" :content="sub.content || {}" />

        <div v-if="sub.researcher_note" class="mt-6 pt-6 border-t border-rule">
          <p class="text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-2">Researcher&rsquo;s note</p>
          <p class="text-[13.5px] font-serif text-ink-soft italic leading-relaxed whitespace-pre-line">&ldquo;{{ sub.researcher_note }}&rdquo;</p>
        </div>

        <div v-if="sub.checkpoints.length" class="mt-6 pt-5 border-t border-rule">
          <p class="text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-2">Reviewed against</p>
          <ul class="space-y-1 font-sans">
            <li v-for="(cp, i) in sub.checkpoints" :key="i" class="text-[12.5px] text-ink-soft flex gap-2"><span class="text-ink-faint">&mdash;</span>{{ cp }}</li>
          </ul>
        </div>
      </div>

      <!-- Margin: history + actions -->
      <div class="space-y-5">
        <div v-if="sub.feedback.length">
          <p class="text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-3">Feedback</p>
          <div class="space-y-3.5">
            <div v-for="item in [...sub.feedback].reverse()" :key="item.id" class="border-l-2 pl-3" :class="marginBorder(item.type)">
              <div class="flex items-center justify-between gap-2">
                <p class="text-[11.5px] font-medium text-ink">{{ item.author_name }}</p>
                <p class="text-[10.5px] text-ink-faint">{{ formatDate(item.created_at) }}</p>
              </div>
              <p class="text-[11px] text-ink-faint mb-1">{{ typeLabel(item) }}</p>
              <p v-if="item.comment" class="text-[12.5px] text-ink-soft leading-relaxed whitespace-pre-line">{{ item.comment }}</p>

              <template v-if="item.type === 'question' || item.type === 'revision'">
                <div v-if="item.response" class="mt-2 pl-3 border-l border-rule">
                  <p class="text-[10.5px] text-ink-faint mb-0.5">{{ sub.researcher.name }} responded &middot; {{ formatDate(item.responded_at) }}</p>
                  <p class="text-[12.5px] text-ink-soft leading-relaxed whitespace-pre-line">{{ item.response }}</p>
                </div>
                <p v-else-if="item.type === 'question'" class="text-[11px] text-awaiting mt-2">Awaiting researcher&rsquo;s response</p>

                <div v-if="item.response" class="mt-1.5">
                  <button v-if="item.status !== 'resolved'" class="text-[10.5px] text-accent hover:underline" @click="setResolved(item, true)">Mark resolved</button>
                  <button v-else class="text-[10.5px] text-ink-faint hover:underline" @click="setResolved(item, false)">Resolved &middot; reopen</button>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="sub.status === 'awaiting_review'" class="border-t border-rule pt-5" :class="{ 'border-t-0 pt-0': !sub.feedback.length }">
          <p class="text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-3">Your decision</p>

          <div v-if="mode === null" class="space-y-2">
            <button class="w-full text-left px-3.5 py-2.5 rounded-md border border-approved/30 bg-approved-bg text-approved text-[12.5px] font-medium hover:bg-approved/10 transition-colors" @click="mode = 'approve'">Approve</button>
            <button class="w-full text-left px-3.5 py-2.5 rounded-md border border-rule bg-paper text-ink-soft text-[12.5px] font-medium hover:bg-paper-sunken transition-colors" @click="mode = 'question'">Ask a question</button>
            <button class="w-full text-left px-3.5 py-2.5 rounded-md border border-attention/30 bg-attention-bg text-attention text-[12.5px] font-medium hover:bg-attention/10 transition-colors" @click="mode = 'revision'">Return for revision</button>
            <p v-if="project && project.supervisors.length > 1" class="text-[11px] text-ink-faint pt-1 leading-relaxed">
              Any one supervisor's approval moves this stage forward.
            </p>
          </div>

          <div v-else class="space-y-2.5">
            <p class="text-[12px] font-medium" :class="modeLabelClass">{{ modeLabel }}</p>
            <textarea
              v-model="draft" rows="4"
              class="w-full text-[12.5px] border border-rule rounded-md p-2.5 bg-paper focus:border-accent outline-none resize-none leading-relaxed"
              :placeholder="mode === 'approve' ? 'Optional comment…' : mode === 'question' ? 'Your question (required)…' : 'What needs to change (required)…'"
            />
            <p v-if="error" class="text-[11.5px] text-attention">{{ error }}</p>
            <div class="flex gap-2">
              <button :disabled="busy" class="flex-1 text-[12.5px] font-medium py-2 rounded-md transition-colors disabled:opacity-60" :class="confirmClass" @click="confirm">
                {{ busy ? 'Saving…' : 'Confirm' }}
              </button>
              <button class="text-[12.5px] text-ink-faint hover:text-ink px-3" @click="cancel">Cancel</button>
            </div>
          </div>
        </div>

        <div v-else class="border-t border-rule pt-5">
          <p class="text-[12px] text-ink-faint">No action needed &mdash; this submission is {{ (STATUS_LABEL[sub.status] || '').toLowerCase() }}.</p>
        </div>

        <p v-if="error && mode === null" class="text-[11.5px] text-attention">{{ error }}</p>
      </div>
    </div>
  </div>

  <div v-else-if="loadError" class="text-center py-24 text-[13px] text-ink-soft">{{ loadError }}</div>
  <div v-else class="text-center py-24 text-ink-faint text-[13px]">Loading…</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupervisionStore } from '@/stores/supervision'
import { errorMessage } from '@/services/api'
import { STATUS_LABEL, formatDate } from '@/utils'
import StatusTag from '@/components/StatusTag.vue'
import StageOutput from '@/components/StageOutput.vue'

const props = defineProps({
  id: { type: String, required: true },
  stageNumber: { type: [String, Number], required: true },
  submissionId: { type: String, required: true },
})

const store = useSupervisionStore()
const sub = ref(null)
const project = ref(null)
const loadError = ref('')

const mode = ref(null) // null | approve | question | revision
const draft = ref('')
const error = ref('')
const busy = ref(false)

async function load() {
  try {
    sub.value = await store.fetchSubmission(props.id, props.submissionId)
    store.fetchProject(props.id).then((p) => { project.value = p }).catch(() => {})
  } catch (e) {
    loadError.value = e.response?.status === 404 || e.response?.status === 403
      ? 'This submission isn’t available. It may have been withdrawn.' : errorMessage(e)
  }
}
onMounted(load)

const modeLabel = computed(() => ({
  approve: 'Approving this submission', question: 'Ask a question before deciding', revision: 'Return this submission for revision',
}[mode.value]))
const modeLabelClass = computed(() => ({ approve: 'text-approved', question: 'text-ink', revision: 'text-attention' }[mode.value]))
const confirmClass = computed(() => ({
  approve: 'bg-approved text-paper hover:opacity-90', question: 'bg-accent text-paper hover:opacity-90', revision: 'bg-attention text-paper hover:opacity-90',
}[mode.value]))

function cancel() { mode.value = null; draft.value = ''; error.value = '' }

async function confirm() {
  error.value = ''
  const text = draft.value.trim()
  if (mode.value !== 'approve' && !text) {
    error.value = mode.value === 'question' ? 'A question is required.' : 'Say what needs to change.'
    return
  }
  busy.value = true
  try {
    // The decision endpoint returns the bare submission; keep the extras (kind, checkpoints, researcher…).
    sub.value = { ...sub.value, ...(await store.decide(props.id, props.submissionId, mode.value, text)) }
    cancel()
    store.fetchProjects().catch(() => {})
  } catch (e) {
    error.value = errorMessage(e)
    // Someone else may have just decided — show the current state.
    if (e.response?.status === 409) { cancel(); error.value = errorMessage(e); await load() }
  } finally {
    busy.value = false
  }
}

async function setResolved(item, resolved) {
  try {
    const updated = await store.resolveFeedback(props.id, item.id, resolved)
    Object.assign(item, updated)
  } catch (e) {
    error.value = errorMessage(e)
  }
}

function typeLabel(item) {
  if (item.type === 'resubmit') return `Resubmitted (revision ${item.revision})`
  return { approve: 'Approved', question: 'Asked a question', revision: 'Returned for revision' }[item.type] ?? item.type
}
function marginBorder(type) {
  return { approve: 'border-approved', question: 'border-accent', revision: 'border-attention', resubmit: 'border-rule' }[type] ?? 'border-rule'
}
</script>
