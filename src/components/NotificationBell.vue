<template>
  <div ref="root" class="relative">
    <button
      class="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper-sunken transition-colors"
      aria-label="Notifications"
      @click="toggle"
    >
      <svg class="w-[18px] h-[18px] text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
      </svg>
      <span v-if="store.unread" class="absolute top-0 right-0 min-w-[15px] h-[15px] px-1 rounded-full bg-attention text-paper text-[9.5px] font-semibold flex items-center justify-center">
        {{ store.unread > 9 ? '9+' : store.unread }}
      </span>
    </button>

    <div v-if="open" class="absolute right-0 mt-2 w-80 bg-paper-raised border border-rule rounded-md shadow-[0_4px_16px_rgba(28,36,48,0.1)] z-20">
      <div class="flex items-center justify-between px-4 py-3 border-b border-rule">
        <p class="text-[13px] font-semibold text-ink">Notifications</p>
        <button v-if="store.unread" class="text-[11px] text-accent hover:underline" @click="store.markAllRead()">Mark all read</button>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <button
          v-for="n in store.notifications"
          :key="n.id"
          class="w-full text-left px-4 py-3 border-b border-rule last:border-0 hover:bg-paper-sunken transition-colors flex gap-2.5"
          @click="visit(n)"
        >
          <span class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" :class="n.read ? 'bg-transparent' : 'bg-accent'" />
          <div class="min-w-0">
            <p class="text-[12.5px] font-medium leading-snug" :class="n.read ? 'text-ink-faint' : 'text-ink'">{{ n.title }}</p>
            <p class="text-[12px] leading-snug mt-0.5 line-clamp-2" :class="n.read ? 'text-ink-faint' : 'text-ink-soft'">{{ n.body }}</p>
            <p class="text-[11px] text-ink-faint mt-1">{{ timeAgo(n.created_at) }}</p>
          </div>
        </button>
        <p v-if="!store.notifications.length" class="text-[12.5px] text-ink-faint text-center py-8">Nothing yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSupervisionStore } from '@/stores/supervision'
import { timeAgo } from '@/utils'

const store = useSupervisionStore()
const router = useRouter()
const open = ref(false)
const root = ref(null)
let timer = null

function toggle() {
  open.value = !open.value
  if (open.value) store.fetchNotifications()
}

function visit(n) {
  store.markRead(n.id)
  open.value = false
  // The server hands back the full URL (built for email); in-app we only need the path.
  try {
    const path = n.url ? new URL(n.url).pathname : `/project/${n.project_id}`
    router.push(path)
  } catch {
    router.push({ name: 'project', params: { id: n.project_id } })
  }
}

function onDocClick(e) {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false
}

onMounted(() => {
  store.fetchNotifications()
  timer = setInterval(() => { if (!document.hidden) store.fetchNotifications() }, 45000)
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  document.removeEventListener('click', onDocClick)
})
</script>
