<template>
  <div class="login-box card">
    <h2>Login Sistem Reservasi Kereta</h2>
    <p class="subtitle">Arsitektur Client-Server Terdistribusi (Laravel Herd + Vue 3)</p>

    <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>Email Akun:</label>
        <input v-model="email" type="email" placeholder="Contoh: petugas@kereta.test" required />
      </div>
      <div class="form-group">
        <label>Kata Sandi:</label>
        <input v-model="password" type="password" placeholder="password123" required />
      </div>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Memverifikasi...' : 'Masuk Aplikasi' }}
      </button>
    </form>

    <div class="demo-hint">
      <strong>Akun Uji Coba Demo UTS:</strong><br />
      • Petugas: <code>petugas@kereta.test</code> / <code>password123</code><br />
      • Penumpang 1: <code>budi@penumpang.test</code> / <code>password123</code><br />
      • Penumpang 2: <code>siti@penumpang.test</code> / <code>password123</code>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

const handleLogin = async () => {
  errorMsg.value = '';
  loading.value = true;
  try {
    const res = await api.post('/login', {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('kereta_token', res.data.token);
    localStorage.setItem('kereta_user', JSON.stringify(res.data.user));

    if (res.data.user.role === 'petugas') {
      router.push('/petugas/jadwal');
    } else {
      router.push('/penumpang/tiket');
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal terhubung ke server API (Cek CORS/Herd).';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-box { max-width: 440px; margin: 50px auto; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 20px; }
.form-group { margin-bottom: 16px; }
label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.9rem; }
input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
.btn-primary { width: 100%; background: #0284c7; color: white; border: none; padding: 11px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-primary:hover { background: #0369a1; }
.demo-hint { margin-top: 20px; background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 0.82rem; color: #475569; border: 1px dashed #cbd5e1; line-height: 1.6; }
</style>