import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/HelloWorld.vue')
  },
  {
    path: '/pitfall',
    name: 'PitfallGuide',
    component: () => import('../views/pitfall/index.vue'),
    meta: { title: '避坑指南管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
