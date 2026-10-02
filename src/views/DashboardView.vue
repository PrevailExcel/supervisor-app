<template>
  <div>
    <div class="mb-8">
      <h1 class="font-serif text-[26px] font-semibold text-ink">My Researchers</h1>
      <p v-if="store.projectsLoaded && store.projects.length" class="text-[13px] text-ink-faint mt-1">
        {{ store.projects.length }} active &middot; {{ store.totalAwaiting }} awaiting your review
      </p>
    </div>

    <div v-if="loading && !store.projectsLoaded" class="text-[13px] text-ink-faint py-12 text-center">Loading…</div>

    <p v-else-if="error" class="text-[13px] text-attention py-12 text-center">{{ error }}</p>

    <div v-else-if="!store.projects.length" class="border border-dashed border-rule rounded-md py-16 px-6 text-center">
      <p class="font-serif text-[18px] text-ink mb-2">No researchers yet</p>
      <p class="text-[13px] text-ink-faint max-w-sm mx-auto leading-relaxed">
        When a researcher invites you by email and you accept, their project appears here.
        Open the link in the invitation email to get started.
      </p>
    </div>

    <div v-else class="border-t border-rule">
      <router-link
        v-for="p in store.projects"
        :key="p.id"
        :to="{ name: 'project', params: { id: p.id } }"
        class="group flex items-center gap-6 py-5 border-b border-rule hover:bg-paper-raised transition-colors -mx-3 px-3"
      >
        <div class="w-56 flex-shrink-0">
          <p class="font-serif text-[16px] font-semibold text-ink leading-tight">{{ p.researcher.name }}</p>
          <p class="text-[11.5px] text-ink-faint mt-0.5">{{ [p.discipline, levelLabel(p.level)].filter(Boolean).join(' · ') || p.researcher.email }}</p>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-[13.5px] text-ink leading-snug truncate pr-4">{{ p.title }}</p>
          <p v-if="p.current_stage" class="text-[11.5px] text-ink-faint mt-1">
            Stage {{ p.current_stage.number }} &mdash; {{ p.current_stage.title }}
          </p>
        </div>

        <div class="w-32 flex-shrink-0 hidden md:block">
          <div class="flex items-center justify-between text-[11px] text-ink-faint mb-1">
            <span>Progress</span>
            <span class="font-medium text-ink">{{ p.progress }}%</span>
          </div>
          <div class="h-[3px] bg-rule rounded-full overflow-hidden">
            <div class="h-full bg-accent" :style="{ width: p.progress + '%' }" />
          </div>
        </div>

        <div class="w-24 flex-shrink-0 text-center">
          <template v-if="p.awaiting > 0">
            <p class="text-[13px] font-semibold text-awaiting">{{ p.awaiting }}</p>
            <p class="text-[10.5px] text-ink-faint">awaiting</p>
          </template>
          <p v-else class="text-[11.5px] text-ink-faint">&mdash;</p>
        </div>

        <div class="w-28 flex-shrink-0 text-right hidden sm:block">
          <p class="text-[11.5px] text-ink-faint">{{ timeAgo(p.last_activity) }}</p>
        </div>

        <svg class="w-4 h-4 text-ink-faint group-hover:text-accent transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useSupervisionStore } from '@/stores/supervision'
import { errorMessage } from '@/services/api'
import { timeAgo } from '@/utils'

const store = useSupervisionStore()
const loading = ref(true)
const error = ref('')
let timer = null

const LEVELS = { undergraduate: 'Undergraduate', masters: 'Master’s', phd: 'PhD' }
const levelLabel = (l) => LEVELS[l] || l

async function load() {
  try {
    await store.fetchProjects()
    error.value = ''
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  timer = setInterval(() => { if (!document.hidden) load() }, 60000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>
