<template>
  <div v-if="project">
    <router-link :to="{ name: 'dashboard' }" class="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint hover:text-ink transition-colors mb-6">
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      My Researchers
    </router-link>

    <div class="mb-8">
      <h1 class="font-serif text-[24px] font-semibold text-ink leading-tight">{{ project.researcher.name }}</h1>
      <p class="text-[14px] text-ink-soft mt-1">{{ project.title }}</p>
      <div class="flex flex-wrap items-center gap-3 mt-2 text-[11.5px] text-ink-faint">
        <span v-if="project.discipline">{{ project.discipline }}</span>
        <span v-if="project.discipline" class="w-1 h-1 rounded-full bg-rule" />
        <span>Supervised by {{ supervisorNames }}</span>
      </div>
    </div>

    <!-- Writing Studio — the flagship review surface -->
    <router-link
      v-if="project.has_writing"
      :to="{ name: 'writing-studio', params: { id: project.id } }"
      class="group flex items-center gap-5 mb-8 p-5 rounded-md border border-accent/25 bg-accent-bg hover:border-accent/50 transition-colors"
    >
      <div class="w-10 h-10 rounded-full bg-accent text-paper flex items-center justify-center flex-shrink-0">
        <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-serif text-[16px] font-semibold text-ink">Writing Studio</p>
        <p class="text-[12.5px] text-ink-soft mt-0.5">
          Read the full manuscript, comment on specific passages, and follow the conversation &mdash;
          {{ project.open_comments }} open comment{{ project.open_comments === 1 ? '' : 's' }}.
        </p>
      </div>
      <svg class="w-5 h-5 text-accent flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
    </router-link>

    <div class="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start">
      <div class="border border-rule rounded-md overflow-hidden bg-paper-raised">
        <button
          v-for="stage in project.stages"
          :key="stage.number"
          class="w-full flex items-center gap-3 px-4 py-3.5 border-b border-rule last:border-0 text-left transition-colors"
          :class="[
            selected === stage.number ? 'bg-accent-bg' : 'hover:bg-paper-sunken',
            stage.number === project.writing_step ? 'border-l-2 border-l-accent' : '',
          ]"
          @click="selected = stage.number"
        >
          <span class="font-serif text-[13px] text-ink-faint w-4 flex-shrink-0">{{ stage.number }}</span>
          <span class="flex-1 min-w-0 text-[13px] truncate" :class="selected === stage.number ? 'text-ink font-medium' : 'text-ink-soft'">
            {{ stage.title }}
          </span>
          <span class="w-[7px] h-[7px] rounded-full flex-shrink-0" :class="dotClass(stage.status)" />
        </button>
      </div>

      <div v-if="stage" class="min-w-0">
        <div class="flex items-center justify-between mb-4 gap-4">
          <h2 class="font-serif text-[19px] font-semibold text-ink">{{ stage.title }}</h2>
          <StatusTag :status="stage.status" />
        </div>

        <div v-if="stage.number === project.writing_step && project.has_writing" class="border border-dashed border-accent/30 rounded-md p-5 text-center bg-accent-bg/40 mb-4">
          <p class="text-[13px] text-ink-soft mb-2">Read the whole manuscript and comment inline in the Writing Studio.</p>
          <router-link :to="{ name: 'writing-studio', params: { id: project.id } }" class="text-[12.5px] font-medium text-accent hover:underline">
            Open Writing Studio &rarr;
          </router-link>
        </div>

        <div v-if="stage.submissions.length" class="space-y-3">
          <div v-for="sub in stage.submissions" :key="sub.id" class="border border-rule rounded-md p-4 bg-paper-raised">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="text-[13px] font-medium text-ink">{{ sub.section_label || stage.title }}</p>
                <p class="text-[11.5px] text-ink-faint mt-0.5">
                  Submitted {{ formatDate(sub.submitted_at) }}<template v-if="sub.revision > 1"> &middot; revision {{ sub.revision }}</template>
                </p>
              </div>
              <StatusTag :status="sub.status" />
            </div>

            <p v-if="sub.researcher_note" class="text-[12.5px] text-ink-soft mt-3 leading-relaxed border-l-2 border-rule pl-3">
              &ldquo;{{ sub.researcher_note }}&rdquo;
            </p>

            <div class="mt-3">
              <router-link
                :to="{ name: 'stage-review', params: { id: project.id, stageNumber: sub.step_number, submissionId: sub.id } }"
                class="text-[12.5px] font-medium hover:underline"
                :class="sub.status === 'awaiting_review' ? 'text-accent' : 'text-ink-soft hover:text-ink'"
              >{{ sub.status === 'awaiting_review' ? 'Review submission' : 'View' }}</router-link>
            </div>
          </div>
        </div>

        <div v-else class="border border-dashed border-rule rounded-md p-8 text-center">
          <p class="text-[13px] text-ink-faint">
            {{ stage.status === 'not_started' ? 'The researcher hasn’t started this stage yet.' : 'Nothing has been sent for review on this stage yet.' }}
          </p>
        </div>

        <div v-if="stage.checkpoints.length" class="mt-6 pt-5 border-t border-rule">
          <p class="text-[11px] font-semibold text-ink-faint uppercase tracking-wide mb-2">What this stage is reviewed against</p>
          <ul class="space-y-1">
            <li v-for="(cp, i) in stage.checkpoints" :key="i" class="text-[12.5px] text-ink-soft flex items-start gap-2">
              <span class="text-ink-faint mt-1">&mdash;</span><span>{{ cp }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="error" class="text-center py-24 text-[13px]">
    <p class="text-ink-soft">{{ error }}</p>
    <router-link :to="{ name: 'dashboard' }" class="text-accent hover:underline text-[12.5px] mt-3 inline-block">Back to your researchers</router-link>
  </div>
  <div v-else class="text-center py-24 text-ink-faint text-[13px]">Loading…</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSupervisionStore } from '@/stores/supervision'
import { errorMessage } from '@/services/api'
import { formatDate } from '@/utils'
import StatusTag from '@/components/StatusTag.vue'

const props = defineProps({ id: { type: String, required: true } })
const store = useSupervisionStore()

const project = ref(null)
const error = ref('')
const selected = ref(null)
let timer = null

const stage = computed(() => project.value?.stages.find((s) => s.number === selected.value))
const supervisorNames = computed(() =>
  project.value?.supervisors.map((s) => (s.me ? 'you' : s.name)).join(', '))

async function load() {
  try {
    project.value = await store.fetchProject(props.id)
    if (selected.value === null) {
      // Open on the first stage that needs the supervisor, else the current one.
      const awaiting = project.value.stages.find((s) => s.status === 'awaiting_review')
      selected.value = awaiting?.number ?? project.value.current_stage ?? project.value.stages[0]?.number
    }
  } catch (e) {
    if (!project.value) error.value = e.response?.status === 403
      ? 'You’re not supervising this project.' : errorMessage(e)
  }
}

onMounted(() => {
  load()
  timer = setInterval(() => { if (!document.hidden) load() }, 60000)
})
onBeforeUnmount(() => clearInterval(timer))

function dotClass(status) {
  return {
    not_started: 'bg-ink-faint/40', in_progress: 'bg-accent', awaiting_review: 'bg-awaiting',
    revision_required: 'bg-attention', approved: 'bg-approved', completed: 'bg-approved',
  }[status] ?? 'bg-ink-faint/40'
}
</script>
