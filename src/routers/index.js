import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载：按页面分包，减小首屏体积
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
    meta: { title: '平南县中学欢迎您' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../pages/About.vue'),
    meta: { title: '学校简介 - 平南县中学' }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../pages/News.vue'),
    meta: { title: '新闻动态 - 平南县中学' }
  },
  {
    path: '/news/:slug',
    name: 'NewsDetail',
    component: () => import('../components/NewsDetail.vue'),
    props: true
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('../pages/Forum.vue'),
    meta: { title: '交流论坛 - 平南县中学' }
  },
  {
    path: '/forum/new',
    name: 'ForumNew',
    component: () => import('../pages/ForumNew.vue'),
    meta: { title: '发起新话题 - 平南县中学交流论坛' }
  },
  {
    path: '/forum/:number(\\d+)',
    name: 'ForumTopic',
    component: () => import('../pages/ForumTopic.vue'),
    props: true,
    meta: { title: '话题 - 平南县中学交流论坛' }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../pages/Contact.vue'),
    meta: { title: '联系我们 - 平南县中学' }
  },
  // 捕获所有未匹配的路由 → 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: { title: '页面不存在 - 平南县中学' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 路由切换后回到页面顶部（保留浏览器前进/后退的位置还原）
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title || '平南县中学'
})

export default router
