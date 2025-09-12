// router/routes/news.js
export default [
  {
    path: '/news',
    name: 'News',
    component: () => import('@/pages/News.vue'),
    meta: {
      title: '新闻动态',
      description: '平南县中学最新新闻动态'
    }
  },
  {
    path: '/news/:slug',
    name: 'NewsDetail',
    component: () => import('@/pages/NewsDetail.vue'),
    props: true,
    meta: {
      title: '新闻详情',
      requiresValidSlug: true
    }
  },
  {
    path: '/news/category/:category',
    name: 'NewsCategory',
    component: () => import('@/pages/NewsCategory.vue'),
    props: true,
    meta: {
      title: '分类新闻'
    }
  }
]