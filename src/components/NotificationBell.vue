<template>
  <div class="relative">
    <button
      class="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper-sunken transition-colors"
      @click="open = !open"
    >
      <svg class="w-[18px] h-[18px] text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
      </svg>
      <span
        v-if="store.unreadNotificationCount"
        class="absolute top-0.5 right-0.5 w-[7px] h-[7px] rounded-full bg-attention"
      />
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-80 bg-paper-raised border border-rule rounded-md shadow-[0_4px_16px_rgba(28,36,48,0.1)] z-20"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-rule">
        <p class="text-[13px] font-semibold text-ink">Notifications</p>
        <button
          v-if="store.unreadNotificationCount"
          class="text-[11px] text-accent hover:underline"
          @click="store.markAllNotificationsRead()"
        >Mark all read</button>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <button
          v-for="n in sorted"
          :key="n.id"
          class="w-full text-left px-4 py-3 border-b border-rule last:border-0 hover:bg-paper-sunken transition-colors flex gap-2.5"
          @click="visit(n)"
        >
          <span class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" :class="n.read ? 'bg-transparent' : 'bg-accent'" />
          <div class="min-w-0">
            <p class="text-[12.5px] leading-snug" :class="n.read ? 'text-ink-faint' : 'text-ink'">{{ n.message }}</p>
            <p class="text-[11px] text-ink-faint mt-0.5">{{ formatDate(n.date) }}</p>
          </div>
        </button>
        <p v-if="!sorted.length" class="text-[12.5px] text-ink-faint text-center py-8">Nothing yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSupervisionStore } from '@/stores/supervision'

const store = useSupervisionStore()
const router = useRouter()
const open = ref(false)

const sorted = computed(() =>
  [...store.notifications].sort((a, b) => new Date(b.date) - new Date(a.date))
)

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function visit(n) {
  store.markNotificationRead(n.id)
  open.value = false
  router.push({ name: 'project', params: { id: n.projectId } })
}
</script>
