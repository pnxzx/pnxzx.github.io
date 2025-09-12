// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import About from '../pages/About.vue'
import News from '../pages/News.vue'
import Contact from '../pages/Contact.vue'
import NewsDetail from '@/components/NewsDetail.vue'
import NotFound from '../pages/NotFound.vue' // 引入 NotFound 组件

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/news', component: News },
  { path: '/contact', component: Contact },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: NewsDetail,
    props: true
  },
  // 捕获所有未匹配的路由，并重定向到 NotFound 页面
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
