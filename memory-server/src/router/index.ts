import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/constitution',
    },
    {
      path: '/constitution',
      name: 'constitution',
      component: () => import('@/pages/constitution/ConstitutionPage.vue'),
    },
    {
      path: '/auto-memory',
      name: 'auto-memory',
      component: () => import('@/pages/auto-memory/AutoMemoryPage.vue'),
    },
    {
      path: '/project-knowledge',
      name: 'project-knowledge',
      component: () => import('@/pages/project-knowledge/ProjectKnowledgePage.vue'),
    },
  ],
})
