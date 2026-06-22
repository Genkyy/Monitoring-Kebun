// URL dasar API PHP yang berjalan di Laragon
const API_BASE = 'http://localhost/monitoring-api/laporan.php';

/**
 * Ambil semua data laporan (dengan optional filter tanggal)
 */
export async function getLaporan(startDate = '', endDate = '') {
  const params = new URLSearchParams();
  if (startDate) params.append('start', startDate);
  if (endDate)   params.append('end', endDate);

  const res = await fetch(`${API_BASE}?${params.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal mengambil data');
  return json.data;
}

/**
 * Simpan data baru ke MySQL
 */
export async function saveLaporan(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal menyimpan data');
  return json;
}

/**
 * Update data yang sudah ada berdasarkan ID
 */
export async function updateLaporan(id, data) {
  const res = await fetch(`${API_BASE}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal memperbarui data');
  return json;
}

/**
 * Hapus data berdasarkan ID
 */
export async function deleteLaporan(id) {
  const res = await fetch(`${API_BASE}?id=${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal menghapus data');
  return json;
}

/**
 * Hapus semua data dari database
 */
export async function clearAllLaporan() {
  const res = await fetch(`${API_BASE}?all=true`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Gagal menghapus semua data');
  return json;
}

// ─── AUTH & USER MANAGEMENT APIs ───

const AUTH_API = 'http://localhost/monitoring-api/auth.php';
const USERS_API = 'http://localhost/monitoring-api/users.php';

/**
 * Melakukan verifikasi login ke PHP auth.php
 */
export async function loginUser(username, password) {
  const res = await fetch(AUTH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login gagal');
  return json.user;
}

/**
 * Mengambil daftar seluruh pengguna
 */
export async function getUsers() {
  const res = await fetch(USERS_API);
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || 'Gagal mengambil daftar pengguna');
  }
  return await res.json();
}

/**
 * Menambahkan pengguna baru
 */
export async function saveUser(userData) {
  const res = await fetch(USERS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menambahkan pengguna');
  return json;
}

/**
 * Memperbarui data pengguna
 */
export async function updateUser(id, userData) {
  const res = await fetch(`${USERS_API}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui data pengguna');
  return json;
}

/**
 * Menghapus pengguna
 */
export async function deleteUser(id) {
  const res = await fetch(`${USERS_API}?id=${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menghapus pengguna');
  return json;
}
