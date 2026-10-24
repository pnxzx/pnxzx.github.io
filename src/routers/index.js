import { createRouter, createWebHistory } from 'vue-router'
import { applyPageMeta } from '@/utils/meta.js'
import { SITE_DESCRIPTION, SITE_NAME } from '@/config/site.js'

// 路由直接挂载业务组件，去掉无意义的转发壳层
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/Home.vue'),
    meta: { title: '平南县中学欢迎您', description: SITE_DESCRIPTION }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../components/SchoolIntro.vue'),
    meta: {
      title: '学校简介 - 平南县中学',
      description: '平南县中学简介：创建于1909年的自治区示范性普通高中，百年办学历史与八棵大榕树的校园传统。'
    }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../components/NewsList.vue'),
    meta: { title: '新闻动态 - 平南县中学', description: '平南县中学新闻动态：开学通知、校园活动与官方公告。' }
  },
  {
    path: '/news/:slug',
    name: 'NewsDetail',
    component: () => import('../components/NewsDetail.vue'),
    props: true
    // 标题/描述由 NewsDetail 按文章内容动态设置
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('../pages/Forum.vue'),
    meta: { title: '交流论坛 - 平南县中学', description: '平南县中学交流论坛：基于 GitHub Discussions 的社区讨论区。' }
  },
  {
    path: '/forum/new',
    name: 'ForumNew',
    component: () => import('../pages/ForumNew.vue'),
    meta: { title: '发起新话题 - 平南县中学交流论坛', description: '在平南县中学交流论坛发起新话题。' }
  },
  {
    path: '/forum/:number(\\d+)',
    name: 'ForumTopic',
    component: () => import('../pages/ForumTopic.vue'),
    props: true
    // 标题/描述由 ForumTopic 按话题内容动态设置
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../components/Contact.vue'),
    meta: { title: '联系我们 - 平南县中学', description: '平南县中学联系方式：地址、电话与邮箱。' }
  },
  // 捕获所有未匹配的路由 → 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: { title: '页面不存在 - 平南县中学', description: '您访问的页面不存在。' }
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
  applyPageMeta({
    title: to.meta.title || `${SITE_NAME}`,
    description: to.meta.description,
    path: to.path
  })
})

export default router
