import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import PropertyDetailView from '../views/PropertyDetailView.vue'
import ContactsView from '../views/ContactsView.vue'
import VaultView from '../views/VaultView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard' }
  },
  {
    path: '/properties/:id',
    name: 'property-detail',
    component: PropertyDetailView,
    meta: { title: 'Property Hub' }
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: ContactsView,
    meta: { title: 'Service Directory' }
  },
  {
    path: '/vault',
    name: 'vault',
    component: VaultView,
    meta: { title: 'Key Details Vault' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { title: 'Settings & Data' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — PropPulse` : 'PropPulse'
})

export default router
