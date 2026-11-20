import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import PetugasJadwalView from '../views/PetugasJadwalView.vue';
import PenumpangTiketView from '../views/PenumpangTiketView.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/petugas/jadwal',
    name: 'petugas-jadwal',
    component: PetugasJadwalView,
    meta: { requiresAuth: true, role: 'petugas' },
  },
  {
    path: '/penumpang/tiket',
    name: 'penumpang-tiket',
    component: PenumpangTiketView,
    meta: { requiresAuth: true, role: 'penumpang' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Route Guard: Proteksi halaman berdasarkan status login & role
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('kereta_token');
  const user = JSON.parse(localStorage.getItem('kereta_user') || 'null');

  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  if (to.meta.role && user?.role !== to.meta.role) {
    return next(user?.role === 'petugas' ? '/petugas/jadwal' : '/penumpang/tiket');
  }

  next();
});

export default router;