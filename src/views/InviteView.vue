<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12 bg-paper">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <p class="font-serif text-[26px] font-semibold text-ink">Supervision</p>
        <p class="text-[12px] text-ink-faint mt-1">Thesis-Speedwrite</p>
      </div>

      <div v-if="loading" class="text-center text-[13px] text-ink-faint py-10">Checking your invitation…</div>

      <div v-else-if="invalid" class="border border-rule rounded-md bg-paper-raised p-7 text-center">
        <p class="font-serif text-[18px] font-semibold text-ink mb-2">This invitation isn't valid</p>
        <p class="text-[13px] text-ink-soft leading-relaxed">{{ invalid }}</p>
        <router-link :to="{ name: 'login' }" class="inline-block mt-5 text-[12.5px] text-accent hover:underline">Go to sign in</router-link>
      </div>

      <div v-else class="border border-rule rounded-md bg-paper-raised p-7">
        <p class="text-[11px] font-semibold text-ink-faint uppercase tracking-wide mb-2">You're invited</p>
        <h1 class="font-serif text-[20px] font-semibold text-ink leading-snug">
          {{ info.researcher }} would like you to supervise their research
        </h1>
        <p class="text-[13.5px] text-ink-soft italic mt-2 leading-relaxed">{{ info.project_title }}</p>
        <p v-if="info.discipline" class="text-[12px] text-ink-faint mt-1">{{ info.discipline }}</p>

        <div class="border-t border-rule mt-5 pt-5">
          <!-- Signed in as the invited person -->
          <template v-if="auth.isAuthenticated && sameAccount">
            <p class="text-[13px] text-ink-soft mb-4">You're signed in as <strong>{{ auth.user.email }}</strong>.</p>
            <button :disabled="busy" class="w-full bg-accent text-paper text-[13.5px] font-medium py-2.5 rounded-md hover:opacity-90 disabled:opacity-60" @click="claim">
              {{ busy ? 'Accepting…' : 'Accept invitation' }}
            </button>
          </template>

          <!-- Signed in as someone else -->
          <template v-else-if="auth.isAuthenticated">
            <p class="text-[13px] text-ink-soft leading-relaxed mb-4">
              This invitation was sent to <strong>{{ info.email }}</strong>, but you're signed in as
              <strong>{{ auth.user?.email }}</strong>.
            </p>
            <button class="w-full border border-rule text-ink-soft text-[13px] font-medium py-2.5 rounded-md hover:bg-paper-sunken" @click="switchAccount">
              Sign out and continue as {{ info.email }}
            </button>
          </template>

          <!-- Existing account → sign in -->
          <form v-else-if="info.account_exists" class="space-y-3.5" @submit.prevent="signInAndClaim">
            <p class="text-[13px] text-ink-soft">Sign in to accept. You already have an account with this email.</p>
            <input :value="info.email" disabled class="w-full text-[14px] border border-rule rounded-md px-3 py-2 bg-paper-sunken text-ink-soft" />
            <input v-model="password" type="password" required placeholder="Password" autocomplete="current-password"
              class="w-full text-[14px] border border-rule rounded-md px-3 py-2 bg-paper outline-none focus:border-accent" />
            <p v-if="error" class="text-[12.5px] text-attention">{{ error }}</p>
            <button :disabled="busy" class="w-full bg-accent text-paper text-[13.5px] font-medium py-2.5 rounded-md hover:opacity-90 disabled:opacity-60">
              {{ busy ? 'Signing in…' : 'Sign in & accept' }}
            </button>
          </form>

          <!-- New → create account -->
          <form v-else class="space-y-3.5" @submit.prevent="createAccount">
            <p class="text-[13px] text-ink-soft">Create your supervisor account to accept.</p>
            <input :value="info.email" disabled class="w-full text-[14px] border border-rule rounded-md px-3 py-2 bg-paper-sunken text-ink-soft" />
            <input v-model.trim="name" required placeholder="Your full name (e.g. Dr. Amara Chukwu)" autocomplete="name"
              class="w-full text-[14px] border border-rule rounded-md px-3 py-2 bg-paper outline-none focus:border-accent" />
            <input v-model="password" type="password" required minlength="8" placeholder="Password (8+ characters)" autocomplete="new-password"
              class="w-full text-[14px] border border-rule rounded-md px-3 py-2 bg-paper outline-none focus:border-accent" />
            <input v-model="confirm" type="password" required placeholder="Confirm password" autocomplete="new-password"
              class="w-full text-[14px] border border-rule rounded-md px-3 py-2 bg-paper outline-none focus:border-accent" />
            <p v-if="error" class="text-[12.5px] text-attention">{{ error }}</p>
            <button :disabled="busy" class="w-full bg-accent text-paper text-[13.5px] font-medium py-2.5 rounded-md hover:opacity-90 disabled:opacity-60">
              {{ busy ? 'Creating account…' : 'Create account & accept' }}
            </button>
          </form>

          <p v-if="error && (auth.isAuthenticated)" class="text-[12.5px] text-attention mt-3">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api, { errorMessage } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ token: { type: String, required: true } })
const auth = useAuthStore()
const router = useRouter()

const loading = ref(true)
const invalid = ref('')
const info = ref(null)
const busy = ref(false)
const error = ref('')
const name = ref('')
const password = ref('')
const confirm = ref('')

const sameAccount = computed(() => auth.user?.email?.toLowerCase() === info.value?.email)

onMounted(async () => {
  try {
    const { data } = await api.get(`/supervision/invites/${props.token}`, { skipAuthRedirect: true })
    info.value = data
  } catch (e) {
    invalid.value = e.response?.status === 404
      ? (e.response.data?.message || 'This link is no longer valid. Ask the researcher to send a new invitation.')
      : errorMessage(e)
  } finally {
    loading.value = false
  }
})

async function claim() {
  busy.value = true
  error.value = ''
  try {
    const { data } = await api.post(`/supervision/invites/${props.token}/claim`, null, { skipAuthRedirect: true })
    router.replace({ name: 'project', params: { id: data.project_id } })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function signInAndClaim() {
  busy.value = true
  error.value = ''
  try {
    await auth.login(info.value.email, password.value)
  } catch (e) {
    error.value = errorMessage(e, 'Sign-in failed.')
    busy.value = false
    return
  }
  busy.value = false
  await claim()
}

async function createAccount() {
  if (password.value !== confirm.value) { error.value = 'The passwords don’t match.'; return }
  busy.value = true
  error.value = ''
  try {
    const { data } = await api.post(`/supervision/invites/${props.token}/accept`, {
      name: name.value, password: password.value, password_confirmation: confirm.value,
    }, { skipAuthRedirect: true })
    auth.setToken(data.token)
    await auth.init()
    // init() is a no-op when user is already set; make sure we have it.
    if (!auth.user) { const me = await api.get('/auth/me'); auth.user = me.data }
    router.replace({ name: 'project', params: { id: data.project_id } })
  } catch (e) {
    if (e.response?.data?.code === 'account_exists') {
      info.value.account_exists = true
      error.value = 'You already have an account — sign in to accept.'
    } else {
      error.value = errorMessage(e)
    }
  } finally {
    busy.value = false
  }
}

async function switchAccount() {
  await auth.logout()
  password.value = ''
}
</script>
