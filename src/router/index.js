import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import About from '../pages/About.vue'
import News from '../pages/News.vue'
import Contact from '../pages/Contact.vue'
import NewsDetail from '@/components/NewsDetail.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/news', component: News },
  { path: '/contact', component: Contact },


  // 新闻
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: NewsDetail,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
