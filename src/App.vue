<template>
  <router-view v-if="$route.meta.bare" />

  <div v-else class="min-h-screen bg-paper">
    <header class="border-b border-rule bg-paper-raised">
      <div class="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <router-link :to="{ name: 'dashboard' }" class="flex items-baseline gap-2">
          <span class="font-serif text-[19px] font-semibold tracking-tight text-ink">Supervision</span>
          <span class="text-[11px] text-ink-faint font-medium">Thesis-Speedwrite</span>
        </router-link>

        <div v-if="auth.user" class="flex items-center gap-5">
          <NotificationBell />
          <div class="relative pl-5 border-l border-rule">
            <button class="flex items-center gap-2.5" @click="menu = !menu">
              <div class="w-8 h-8 rounded-full bg-accent text-paper flex items-center justify-center text-[12px] font-semibold font-serif">
                {{ auth.initials }}
              </div>
              <div class="hidden sm:block leading-tight text-left">
                <p class="text-[13px] font-medium text-ink">{{ auth.user.name }}</p>
                <p class="text-[11px] text-ink-faint">Supervisor</p>
              </div>
            </button>
            <div v-if="menu" class="absolute right-0 mt-2 w-48 bg-paper-raised border border-rule rounded-md shadow-[0_4px_16px_rgba(28,36,48,0.1)] z-20 py-1" @click="menu = false">
              <p class="px-3.5 py-2 text-[11.5px] text-ink-faint truncate border-b border-rule">{{ auth.user.email }}</p>
              <button class="w-full text-left px-3.5 py-2 text-[12.5px] text-ink-soft hover:bg-paper-sunken" @click="signOut">Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 sm:px-8 py-10">
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSupervisionStore } from '@/stores/supervision'
import NotificationBell from '@/components/NotificationBell.vue'

const auth = useAuthStore()
const store = useSupervisionStore()
const router = useRouter()
const menu = ref(false)

async function signOut() {
  await auth.logout()
  store.reset()
  router.push({ name: 'login' })
}
</script>
