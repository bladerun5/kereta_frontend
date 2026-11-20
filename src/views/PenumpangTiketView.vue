<template>
  <div>
    <!-- Form Pemesanan Tiket -->
    <div class="card">
      <h3>Pesan Tiket Kereta Api</h3>

      <div v-if="successMsg" class="alert-success">{{ successMsg }}</div>
      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <form @submit.prevent="pesanTiket" class="booking-form">
        <div class="field-jadwal">
          <label>Pilih Jadwal Keberangkatan:</label>
          <select v-model="form.jadwal_id" required>
            <option value="" disabled>-- Pilih Kereta & Rute --</option>
            <option v-for="j in jadwalList" :key="j.id" :value="j.id">
              {{ j.kode_kereta }} {{ j.nama_kereta }} ({{ j.kelas_kereta?.nama_kelas }}) |
              {{ j.stasiun_asal }} → {{ j.stasiun_tujuan }} | {{ j.tanggal_berangkat }} |
              Rp {{ j.kelas_kereta?.harga_dasar.toLocaleString('id-ID') }} (Sisa: {{ j.kuota_kursi }})
            </option>
          </select>
        </div>
        <div class="field-kursi">
          <label>Nomor Kursi:</label>
          <input v-model="form.nomor_kursi" placeholder="Misal: A-01" required />
        </div>
        <div class="field-btn">
          <button type="submit" class="btn-book">Pesan Tiket</button>
        </div>
      </form>
    </div>

    <!-- Tabel Tiket Saya (Data Scoping per User) -->
    <div class="card">
      <h3>Daftar Tiket Saya (Riwayat Pemesanan)</h3>
      <table>
        <thead>
          <tr>
            <th>Kode Booking</th>
            <th>Kereta & Rute</th>
            <th>Jadwal</th>
            <th>Kursi</th>
            <th>Total Tagihan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tiketSaya.length === 0">
            <td colspan="7" style="text-align: center; color: #64748b;">Belum ada tiket yang dipesan.</td>
          </tr>
          <tr v-for="t in tiketSaya" :key="t.id">
            <td><code>{{ t.kode_booking }}</code></td>
            <td>
              <strong>{{ t.jadwal?.nama_kereta }}</strong> ({{ t.jadwal?.kelas_kereta?.nama_kelas }})<br />
              <small>{{ t.jadwal?.stasiun_asal }} → {{ t.jadwal?.stasiun_tujuan }}</small>
            </td>
            <td>{{ t.jadwal?.tanggal_berangkat }}<br /><small>{{ t.jadwal?.jam_berangkat }}</small></td>
            <td><strong>{{ t.nomor_kursi }}</strong></td>
            <td>Rp {{ t.total_bayar.toLocaleString('id-ID') }}</td>
            <td>
              <span :class="t.status_pembayaran === 'lunas' ? 'badge-lunas' : 'badge-belum'">
                {{ t.status_pembayaran.toUpperCase() }}
              </span>
            </td>
            <td>
              <button
                v-if="t.status_pembayaran === 'belum_bayar'"
                @click="bayarTiket(t.id)"
                class="btn-pay"
              >
                Bayar Sekarang
              </button>
              <span v-else class="paid-info">✓ E-Ticket Aktif</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const jadwalList = ref([]);
const tiketSaya = ref([]);
const successMsg = ref('');
const errorMsg = ref('');

const form = ref({
  jadwal_id: '',
  nomor_kursi: '',
});

const fetchData = async () => {
  const [resJadwal, resTiket] = await Promise.all([
    api.get('/jadwals'),
    api.get('/pemesanans'),
  ]);
  jadwalList.value = resJadwal.data.jadwals;
  tiketSaya.value = resTiket.data.data;
};

const pesanTiket = async () => {
  successMsg.value = '';
  errorMsg.value = '';
  try {
    const res = await api.post('/pemesanans', form.value);
    successMsg.value = `${res.data.message} Kode Booking: ${res.data.data.kode_booking}`;
    form.value.nomor_kursi = '';
    await fetchData(); // Segarkan sisa kuota kursi & tabel tiket
  } catch (err) {
    const errors = err.response?.data?.errors;
    errorMsg.value = errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Gagal memesan tiket.');
  }
};

// Pelunasan Reaktif CSR tanpa me-reload halaman
const bayarTiket = async (id) => {
  successMsg.value = '';
  errorMsg.value = '';
  try {
    const res = await api.patch(`/pemesanans/${id}/bayar`);
    successMsg.value = res.data.message;

    // Perbarui state lokal secara reaktif
    const index = tiketSaya.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      tiketSaya.value[index] = res.data.data;
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Gagal memproses pembayaran.';
  }
};

onMounted(fetchData);
</script>

<style scoped>
.booking-form { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
.field-jadwal { flex: 3; min-width: 260px; }
.field-kursi { flex: 1; min-width: 120px; }
.field-btn { flex: 1; min-width: 130px; }
label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; }
input, select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
.btn-book { width: 100%; background: #0284c7; color: white; border: none; padding: 11px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-book:hover { background: #0369a1; }
.btn-pay { background: #16a34a; color: white; border: none; padding: 7px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-pay:hover { background: #15803d; }
.paid-info { color: #166534; font-weight: 600; font-size: 0.85rem; }
</style>