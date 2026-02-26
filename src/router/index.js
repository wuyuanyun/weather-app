import { createRouter, createWebHistory } from 'vue-router'
// 导入你的天气首页（如果改了文件名，这里也要对应）
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView // 指向你的天气首页
    },
    // 删除下面的About路由（如果有）
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

export default router