<template>
  <div class="min-h-screen bg-paper">
    <header class="border-b border-rule bg-paper-raised">
      <div class="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <router-link :to="{ name: 'dashboard' }" class="flex items-baseline gap-2 group">
          <span class="font-serif text-[19px] font-semibold tracking-tight text-ink">Supervision</span>
          <span class="text-[11px] text-ink-faint font-medium">Thesis-Speedwrite</span>
        </router-link>

        <div class="flex items-center gap-5">
          <NotificationBell />
          <div class="flex items-center gap-2.5 pl-5 border-l border-rule">
            <div class="w-8 h-8 rounded-full bg-accent text-paper flex items-center justify-center text-[12px] font-semibold font-serif">
              {{ initials }}
            </div>
            <div class="hidden sm:block leading-tight">
              <p class="text-[13px] font-medium text-ink">{{ store.supervisor.name }}</p>
              <p class="text-[11px] text-ink-faint">Supervisor</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 sm:px-8 py-10">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSupervisionStore } from '@/stores/supervision'
import NotificationBell from '@/components/NotificationBell.vue'

const store = useSupervisionStore()
const initials = computed(() =>
  store.supervisor.name
    .replace('Dr. ', '').replace('Prof. ', '')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
)
</script>
