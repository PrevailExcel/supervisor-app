import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
  {
    path: '/project/:id',
    name: 'project',
    component: () => import('@/views/ProjectView.vue'),
    props: true,
  },
  {
    path: '/project/:id/stage/:stageNumber/:submissionId',
    name: 'stage-review',
    component: () => import('@/views/StageReviewView.vue'),
    props: true,
  },
  {
    path: '/project/:id/writing',
    name: 'writing-studio',
    component: () => import('@/views/WritingStudioView.vue'),
    props: true,
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
