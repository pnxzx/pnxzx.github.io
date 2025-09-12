// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'
import mainRoutes from './main'
import newsRoutes from './news'

const routes = [
  ...mainRoutes,
  ...newsRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

setupRouterGuards(router)

export default router