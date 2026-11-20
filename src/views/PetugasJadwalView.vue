<template>
  <div>
    <!-- Form Tambah Jadwal Kereta -->
    <div class="card">
      <h3>Terbitkan Jadwal Keberangkatan Kereta (Petugas)</h3>

      <div v-if="successMsg" class="alert-success">{{ successMsg }}</div>
      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <form @submit.prevent="tambahJadwal" class="grid-form">
        <div>
          <label>Kelas Kereta:</label>
          <select v-model="form.kelas_kereta_id" required>
            <option value="" disabled>-- Pilih Kelas --</option>
            <option v-for="k in kelasList" :key="k.id" :value="k.id">
              {{ k.nama_kelas }} (Rp {{ k.harga_dasar.toLocaleString('id-ID') }})
            </option>
          </select>
        </div>
        <div>
          <label>Kode Kereta:</label>
          <input v-model="form.kode_kereta" placeholder="Misal: KA-301" required />
        </div>
        <div>
          <label>Nama Kereta:</label>
          <input v-model="form.nama_kereta" placeholder="Misal: Malabar" required />
        </div>
        <div>
          <label>Stasiun Asal:</label>
          <input v-model="form.stasiun_asal" placeholder="Malang (ML)" required />
        </div>
        <div>
          <label>Stasiun Tujuan:</label>
          <input v-model="form.stasiun_tujuan" placeholder="Bandung (BD)" required />
        </div>
        <div>
          <label>Tanggal Berangkat:</label>
          <input v-model="form.tanggal_berangkat" type="date" required />
        </div>
        <div>
          <label>Jam Berangkat:</label>
          <input v-model="form.jam_berangkat" type="time" required />
        </div>
        <div>
          <label>Kuota Kursi:</label>
          <input v-model.number="form.kuota_kursi" type="number" min="1" required />
        </div>
        <div class="full-col">
          <button type="submit" class="btn-save">Simpan & Terbitkan Jadwal</button>
        </div>
      </form>
    </div>

    <!-- Tabel Jadwal Aktif -->
    <div class="card">
      <h3>Daftar Jadwal Kereta & Sisa Kuota Kursi</h3>
      <table>
        <thead>
          <tr>
            <th>Kode & Kereta</th>
            <th>Kelas</th>
            <th>Rute</th>
            <th>Keberangkatan</th>
            <th>Tarif</th>
            <th>Sisa Kuota</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in jadwalList" :key="j.id">
            <td><strong>{{ j.kode_kereta }}</strong> — {{ j.nama_kereta }}</td>
            <td>{{ j.kelas_kereta?.nama_kelas }}</td>
            <td>{{ j.stasiun_asal }} → {{ j.stasiun_tujuan }}</td>
            <td>{{ j.tanggal_berangkat }} ({{ j.jam_berangkat }})</td>
            <td>Rp {{ j.kelas_kereta?.harga_dasar.toLocaleString('id-ID') }}</td>
            <td><strong>{{ j.kuota_kursi }} kursi</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tabel Monitoring Seluruh Pemesanan -->
    <div class="card">
      <h3>Monitoring Pemesanan Seluruh Penumpang</h3>
      <table>
        <thead>
          <tr>
            <th>Kode Booking</th>
            <th>Penumpang</th>
            <th>Kereta & Kursi</th>
            <th>Total Bayar</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in pemesananList" :key="p.id">
            <td><code>{{ p.kode_booking }}</code></td>
            <td>{{ p.user?.name }}</td>
            <td>{{ p.jadwal?.nama_kereta }} (Kursi <strong>{{ p.nomor_kursi }}</strong>)</td>
            <td>Rp {{ p.total_bayar.toLocaleString('id-ID') }}</td>
            <td>
              <span :class="p.status_pembayaran === 'lunas' ? 'badge-lunas' : 'badge-belum'">
                {{ p.status_pembayaran.toUpperCase() }}
              </span>
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

const kelasList = ref([]);
const jadwalList = ref([]);
const pemesananList = ref([]);
const successMsg = ref('');
const errorMsg = ref('');

const form = ref({
  kelas_kereta_id: '',
  kode_kereta: '',
  nama_kereta: '',
  stasiun_asal: '',
  stasiun_tujuan: '',
  tanggal_berangkat: '',
  jam_berangkat: '',
  kuota_kursi: 40,
});

const fetchData = async () => {
  const [resJadwal, resPemesanan] = await Promise.all([
    api.get('/jadwals'),
    api.get('/pemesanans'),
  ]);
  jadwalList.value = resJadwal.data.jadwals;
  kelasList.value = resJadwal.data.kelas_kereta;
  pemesananList.value = resPemesanan.data.data;
};

const tambahJadwal = async () => {
  successMsg.value = '';
  errorMsg.value = '';
  try {
    const res = await api.post('/jadwals', form.value);
    successMsg.value = `${res.data.message} (${res.data.data.kode_kereta} - ${res.data.data.nama_kereta})`;
    await fetchData();
  } catch (err) {
    const errors = err.response?.data?.errors;
    errorMsg.value = errors ? Object.values(errors).flat().join(' ') : (err.response?.data?.message || 'Gagal menyimpan jadwal.');
  }
};

onMounted(fetchData);
</script>

<style scoped>
.grid-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.full-col { grid-column: span 2; }
label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; }
input, select { width: 100%; padding: 9px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
.btn-save { background: #0f766e; color: white; border: none; padding: 11px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-save:hover { background: #115e59; }
</style>