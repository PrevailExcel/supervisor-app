<template>
  <div>
    <div class="flex items-end justify-between mb-8">
      <div>
        <h1 class="font-serif text-[26px] font-semibold text-ink">My Researchers</h1>
        <p class="text-[13px] text-ink-faint mt-1">{{ activeCount }} active &middot; {{ totalAwaiting }} awaiting your review</p>
      </div>
      <button class="text-[12px] text-ink-faint hover:text-ink transition-colors" @click="store.resetDemo()">
        Reset demo data
      </button>
    </div>

    <div class="border-t border-rule">
      <router-link
        v-for="p in store.projects"
        :key="p.id"
        :to="{ name: 'project', params: { id: p.id } }"
        class="group flex items-center gap-6 py-5 border-b border-rule hover:bg-paper-raised transition-colors -mx-3 px-3"
      >
        <!-- Identity -->
        <div class="w-56 flex-shrink-0">
          <p class="font-serif text-[16px] font-semibold text-ink leading-tight">{{ p.researcher.name }}</p>
          <p class="text-[11.5px] text-ink-faint mt-0.5">{{ p.discipline }} &middot; {{ p.level }}</p>
        </div>

        <!-- Title & stage -->
        <div class="flex-1 min-w-0">
          <p class="text-[13.5px] text-ink leading-snug truncate pr-4">{{ p.title }}</p>
          <p class="text-[11.5px] text-ink-faint mt-1">
            Stage {{ p.currentStage }} &mdash; {{ stageName(p.currentStage) }}
          </p>
        </div>

        <!-- Progress -->
        <div class="w-32 flex-shrink-0">
          <div class="flex items-center justify-between text-[11px] text-ink-faint mb-1">
            <span>Progress</span>
            <span class="font-medium text-ink">{{ store.overallProgress(p.id) }}%</span>
          </div>
          <div class="h-[3px] bg-rule rounded-full overflow-hidden">
            <div class="h-full bg-accent" :style="{ width: store.overallProgress(p.id) + '%' }" />
          </div>
        </div>

        <!-- Awaiting -->
        <div class="w-28 flex-shrink-0 text-center">
          <template v-if="store.awaitingCount(p.id) > 0">
            <p class="text-[13px] font-semibold text-awaiting">{{ store.awaitingCount(p.id) }}</p>
            <p class="text-[10.5px] text-ink-faint">awaiting</p>
          </template>
          <p v-else class="text-[11.5px] text-ink-faint">&mdash;</p>
        </div>

        <!-- Last activity -->
        <div class="w-28 flex-shrink-0 text-right">
          <p class="text-[11.5px] text-ink-faint">{{ formatDate(p.lastActivity) }}</p>
        </div>

        <svg class="w-4 h-4 text-ink-faint group-hover:text-accent transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSupervisionStore } from '@/stores/supervision'
import { STAGES } from '@/data/stages'

const store = useSupervisionStore()

const activeCount = computed(() => store.projects.length)
const totalAwaiting = computed(() =>
  store.projects.reduce((sum, p) => sum + store.awaitingCount(p.id), 0)
)

function stageName(n) {
  return STAGES.find((s) => s.number === n)?.name ?? ''
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
