<template>
  <div class="app-wrapper">
    <nav class="navbar" v-if="user">
      <div class="brand">🚆 KAI-Lite — Reservasi Kereta Api</div>
      <div class="nav-right">
        <span class="user-badge">{{ user.name }} ({{ user.role.toUpperCase() }})</span>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </nav>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from './api/axios';

const router = useRouter();
const route = useRoute();
const user = ref(JSON.parse(localStorage.getItem('kereta_user') || 'null'));

// Perbarui state user setiap kali berpindah rute (misal setelah login)
watch(() => route.path, () => {
  user.value = JSON.parse(localStorage.getItem('kereta_user') || 'null');
});

const handleLogout = async () => {
  try {
    await api.post('/logout');
  } catch (e) {
    // Abaikan jika token sudah expired di server
  } finally {
    localStorage.removeItem('kereta_token');
    localStorage.removeItem('kereta_user');
    user.value = null;
    router.push('/login');
  }
};
</script>

<style>
body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f6f9; color: #1e293b; }
.navbar { background: #0f2942; color: #fff; padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; }
.brand { font-weight: bold; font-size: 1.1rem; }
.nav-right { display: flex; align-items: center; gap: 14px; }
.user-badge { background: rgba(255,255,255,0.15); padding: 5px 12px; border-radius: 6px; font-size: 0.85rem; }
.btn-logout { background: #ef4444; color: white; border: none; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-logout:hover { background: #dc2626; }
.container { max-width: 1050px; margin: 28px auto; padding: 0 20px; }
.card { background: #fff; padding: 24px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 24px; }
.alert-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
.alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
table { width: 100%; border-collapse: collapse; margin-top: 12px; }
th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 0.92rem; }
th { background: #f8fafc; color: #475569; }
.badge-lunas { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 999px; font-weight: bold; font-size: 0.8rem; }
.badge-belum { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 999px; font-weight: bold; font-size: 0.8rem; }
</style>
