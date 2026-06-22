// ==============================================================================
// DEMO MODE API (LocalStorage)
// File ini telah dimodifikasi agar bisa berjalan 100% di Frontend (Vercel)
// tanpa membutuhkan server PHP / MySQL. Semua data disimpan di LocalStorage browser.
// ==============================================================================

const DB_LAPORAN = 'demo_laporan_v1';
const DB_USERS = 'demo_users_v1';

// Data bawaan untuk pengguna sistem demo
const DEFAULT_USERS = [
  { id: 1, name: 'Budi (Admin)', username: 'admin', role: 'admin', password: '123', created_at: new Date().toISOString() },
  { id: 2, name: 'Siti (Kabag)', username: 'kabag', role: 'kabag', password: '123', created_at: new Date().toISOString() },
  { id: 3, name: 'Joko (Staf)', username: 'staf', role: 'staf', password: '123', created_at: new Date().toISOString() },
];

// Simulasi delay jaringan agar terasa seperti API sungguhan
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

function getLocal(key, defaultData) {
  try {
    const d = localStorage.getItem(key);
    if (!d) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(d);
  } catch (err) {
    return defaultData;
  }
}

function saveLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Helper: Konversi payload camelCase dari frontend ke format snake_case DB
function toDbFormat(data) {
  return {
    id: data.id || Date.now(),
    uraian: data.uraian || '',
    tanggal: data.tanggal || new Date().toISOString().split('T')[0],
    kebun: data.kebun || '',
    rencana: data.rencana || 0,
    blok_hi: data.blokHi !== undefined ? data.blokHi : data.blok_hi || '-',
    blok_sd: data.blokSd !== undefined ? data.blokSd : data.blok_sd || '-',
    realisasi_hi: data.realisasiHi !== undefined ? data.realisasiHi : data.realisasi_hi || 0,
    realisasi_sd: data.realisasiSd !== undefined ? data.realisasiSd : data.realisasi_sd || 0,
    capaian: data.capaian || 0,
    batch_id: data.batchId !== undefined ? data.batchId : data.batch_id || '',
    gramasi: data.gramasi || 0,
    status_proses: data.statusProses || data.status_proses || 'TO DO',
    penanggung_jawab: data.penanggungJawab || data.penanggung_jawab || '-',
    qc_passed: data.qcPassed !== undefined ? data.qcPassed : data.qc_passed || 0,
    qc_rejected: data.qcRejected !== undefined ? data.qcRejected : data.qc_rejected || 0,
    qc_defect_reason: data.qcDefectReason !== undefined ? data.qcDefectReason : data.qc_defect_reason || '',
    kabag_notes: data.kabagNotes !== undefined ? data.kabagNotes : data.kabag_notes || ''
  };
}


// ─── LAPORAN APIs ───

export async function getLaporan(startDate = '', endDate = '') {
  await delay();
  let data = getLocal(DB_LAPORAN, []);
  
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    data = data.filter(item => {
      const d = new Date(item.tanggal);
      return d >= s && d <= e;
    });
  }
  return data;
}

export async function saveLaporan(data) {
  await delay();
  const db = getLocal(DB_LAPORAN, []);
  const newItem = toDbFormat(data);
  db.push(newItem);
  saveLocal(DB_LAPORAN, db);
  return { success: true, message: 'Data berhasil disimpan', data: newItem };
}

export async function updateLaporan(id, data) {
  await delay();
  const db = getLocal(DB_LAPORAN, []);
  const index = db.findIndex(item => item.id.toString() === id.toString());
  
  if (index === -1) throw new Error('Data tidak ditemukan');
  
  // Update hanya field yang dikirim, pertahankan id yang lama
  const updatedItem = { ...db[index], ...toDbFormat(data), id: db[index].id };
  db[index] = updatedItem;
  saveLocal(DB_LAPORAN, db);
  
  return { success: true, message: 'Data berhasil diperbarui', data: updatedItem };
}

export async function deleteLaporan(id) {
  await delay();
  let db = getLocal(DB_LAPORAN, []);
  db = db.filter(item => item.id.toString() !== id.toString());
  saveLocal(DB_LAPORAN, db);
  return { success: true, message: 'Data berhasil dihapus' };
}

export async function clearAllLaporan() {
  await delay();
  saveLocal(DB_LAPORAN, []);
  return { success: true, message: 'Semua data berhasil dihapus' };
}


// ─── AUTH & USER MANAGEMENT APIs ───

export async function loginUser(username, password) {
  await delay(600);
  const users = getLocal(DB_USERS, DEFAULT_USERS);
  
  // Cari user berdasarkan username
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    throw new Error('Username tidak ditemukan.');
  }
  
  // Dalam mode demo, kita tidak terlalu ketat, asalkan isi password apa saja boleh
  // jika ingin demo yang smooth, atau kita batasi tetap harus pakai password dummy '123' / 'staf123'
  // Disini kita akan buat sedikit fleksibel untuk mode demo.
  
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role
  };
}

export async function getUsers() {
  await delay();
  return getLocal(DB_USERS, DEFAULT_USERS);
}

export async function saveUser(userData) {
  await delay();
  const users = getLocal(DB_USERS, DEFAULT_USERS);
  
  if (users.find(u => u.username === userData.username)) {
    throw new Error('Username sudah digunakan');
  }
  
  const newUser = {
    id: Date.now(),
    name: userData.name,
    username: userData.username,
    role: userData.role,
    password: userData.password || '123',
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  saveLocal(DB_USERS, users);
  return { success: true, message: 'Pengguna berhasil ditambahkan' };
}

export async function updateUser(id, userData) {
  await delay();
  const users = getLocal(DB_USERS, DEFAULT_USERS);
  const index = users.findIndex(u => u.id.toString() === id.toString());
  
  if (index === -1) throw new Error('User tidak ditemukan');
  
  users[index] = { ...users[index], ...userData };
  saveLocal(DB_USERS, users);
  return { success: true, message: 'User diperbarui' };
}

export async function deleteUser(id) {
  await delay();
  let users = getLocal(DB_USERS, DEFAULT_USERS);
  users = users.filter(u => u.id.toString() !== id.toString());
  saveLocal(DB_USERS, users);
  return { success: true, message: 'User dihapus' };
}
