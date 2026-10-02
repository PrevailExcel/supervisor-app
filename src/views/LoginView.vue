<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12 bg-paper">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <p class="font-serif text-[26px] font-semibold text-ink">Supervision</p>
        <p class="text-[12px] text-ink-faint mt-1">Thesis-Speedwrite</p>
      </div>

      <form class="border border-rule rounded-md bg-paper-raised p-6 space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-[11px] font-semibold text-ink-faint uppercase tracking-wide mb-1.5">Email</label>
          <input v-model.trim="email" type="email" required autocomplete="username"
            class="w-full text-[14px] border border-rule rounded-md px-3 py-2 bg-paper outline-none focus:border-accent" />
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-ink-faint uppercase tracking-wide mb-1.5">Password</label>
          <input v-model="password" type="password" required autocomplete="current-password"
            class="w-full text-[14px] border border-rule rounded-md px-3 py-2 bg-paper outline-none focus:border-accent" />
        </div>
        <p v-if="error" class="text-[12.5px] text-attention">{{ error }}</p>
        <button :disabled="busy" class="w-full bg-accent text-paper text-[13.5px] font-medium py-2.5 rounded-md hover:opacity-90 disabled:opacity-60">
          {{ busy ? 'Signing in…' : 'Sign in' }}
        </button>
        <a :href="forgotUrl" class="block text-center text-[12px] text-ink-faint hover:text-ink">Forgot your password?</a>
      </form>

      <p class="text-center text-[12px] text-ink-faint mt-6 leading-relaxed">
        Supervisors join by invitation. Ask the researcher to invite you by email,<br />then follow the link in that message.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/services/api'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const forgotUrl = (import.meta.env.VITE_MAIN_APP_URL || '') + '/forgot-password'

async function submit() {
  busy.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const r = route.query.redirect
    router.push(typeof r === 'string' && r.startsWith('/') ? r : { name: 'dashboard' })
  } catch (e) {
    error.value = errorMessage(e, 'Sign-in failed.')
  } finally {
    busy.value = false
  }
}
</script>
