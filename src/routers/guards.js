// router/guards.js
export function setupRouterGuards(router) {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - 平南县中学`
    }

    // 验证新闻slug
    if (to.meta.requiresValidSlug && to.params.slug) {
      try {
        const { useNewsStore } = await import('@/stores/news')
        const newsStore = useNewsStore()
        const news = await newsStore.getNewsBySlug(to.params.slug)
        
        if (!news) {
          next({ name: 'NotFound' })
          return
        }
      } catch (error) {
        console.error('Route validation error:', error)
        next({ name: 'NotFound' })
        return
      }
    }

    next()
  })

  // 全局后置钩子
  router.afterEach((to, from) => {
    // 页面访问统计
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: to.path
      })
    }
  })
}