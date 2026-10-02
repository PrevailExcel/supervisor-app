import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guest: true, bare: true } },
  { path: '/invite/:token', name: 'invite', component: () => import('@/views/InviteView.vue'), props: true, meta: { bare: true } },
  { path: '/', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { auth: true } },
  { path: '/project/:id', name: 'project', component: () => import('@/views/ProjectView.vue'), props: true, meta: { auth: true } },
  {
    path: '/project/:id/stage/:stageNumber/:submissionId',
    name: 'stage-review',
    component: () => import('@/views/StageReviewView.vue'),
    props: true,
    meta: { auth: true },
  },
  { path: '/project/:id/writing', name: 'writing-studio', component: () => import('@/views/WritingStudioView.vue'), props: true, meta: { auth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) })

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) await auth.init()

  if (to.meta.auth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return typeof to.query.redirect === 'string' && to.query.redirect.startsWith('/') ? to.query.redirect : { name: 'dashboard' }
  }
})

export default router
