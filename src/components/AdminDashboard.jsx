import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, ShieldCheck, Users, Briefcase, Search, X, Shield } from 'lucide-react';
import { getUsers, saveUser, updateUser, deleteUser } from '../lib/api';

export default function AdminDashboard({ user, showToast }) {
  const [usersList,    setUsersList]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editingUser,  setEditingUser]  = useState(null);
  const [username,     setUsername]     = useState('');
  const [name,         setName]         = useState('');
  const [role,         setRole]         = useState('staf');
  const [password,     setPassword]     = useState('');
  const [formError,    setFormError]    = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsersList(data);
    } catch (err) {
      showToast(err.message || 'Gagal mengambil data pengguna.', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setUsername(''); setName(''); setRole('staf'); setPassword('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setUsername(u.username); setName(u.name); setRole(u.role); setPassword('');
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    const payload = { username: username.trim(), name: name.trim(), role };
    if (password) payload.password = password;
    else if (!editingUser) { setFormError('Password wajib diisi untuk pengguna baru.'); return; }

    try {
      if (editingUser) { await updateUser(editingUser.id, payload); showToast('Data pengguna diperbarui!', 'success'); }
      else             { await saveUser(payload);                    showToast('Pengguna baru ditambahkan!', 'success'); }
      setShowModal(false);
      fetchUsers();
    } catch (err) { showToast(err.message || 'Gagal menyimpan.', 'error'); }
  };

  const handleDelete = async (u) => {
    if (u.id === user.id) { showToast('Anda tidak bisa menghapus akun sendiri!', 'error'); return; }
    if (!window.confirm(`Hapus pengguna "${u.name}" (@${u.username})?`)) return;
    try {
      await deleteUser(u.id);
      showToast('Pengguna dihapus.', 'success');
      fetchUsers();
    } catch (err) { showToast(err.message || 'Gagal menghapus.', 'error'); }
  };

  const totalCount = usersList.length;
  const adminCount = usersList.filter(u => u.role === 'admin').length;
  const kabagCount = usersList.filter(u => u.role === 'kabag').length;
  const stafCount  = usersList.filter(u => u.role === 'staf').length;

  const filteredUsers = usersList.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ROLE_INFO = {
    admin: { label: 'Super Admin',    cls: 'pill-info' },
    kabag: { label: 'Kepala Bagian',  cls: 'pill-warning' },
    staf:  { label: 'Staf Lapangan', cls: 'pill-primary' },
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-900 text-slate-900 flex items-center gap-2">
            <Shield size={20} className="text-primary" /> Manajemen Akses
          </h2>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">
            Kelola peran dan izin akses setiap pengguna sistem.
          </p>
        </div>
      </div>

      {/* Metrics (Bento) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Pengguna',  value: totalCount, icon: Users,      c: 'icon-box-blue' },
          { label: 'Staf Lapangan',   value: stafCount,  icon: Briefcase,  c: 'icon-box-primary' },
          { label: 'Kepala Bagian',   value: kabagCount, icon: ShieldCheck, c: 'icon-box-amber' },
          { label: 'Super Admin',     value: adminCount, icon: Shield,      c: 'icon-box-purple' },
        ].map((m, i) => (
          <div key={i} className="bento-card card-pad animate-fade-up flex items-center gap-4" style={{animationDelay: `${i*50}ms`}}>
            <div className={`icon-box ${m.c}`}><m.icon size={20} /></div>
            <div>
              <p className="metric-label">{m.label}</p>
              <h3 className="metric-value text-2xl">{m.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bento-card flex flex-col animate-fade-up" style={{animationDelay: '200ms'}}>
        
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau username..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] py-2 pl-9 pr-4 text-[13px] font-medium outline-none transition-colors"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-[12px] text-[13px] transition-all shadow-md shadow-primary/25 cursor-pointer shrink-0"
          >
            <UserPlus size={16} /> Tambah Pengguna
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <span className="material-icons spin-smooth text-[24px]">autorenew</span>
              <p className="text-[12px] font-bold uppercase tracking-wider">Memuat data...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <span className="material-icons text-[32px]">group_off</span>
              <p className="text-[12px] font-bold uppercase tracking-wider">Tidak ada pengguna</p>
            </div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-800 uppercase text-slate-400 tracking-wider">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Dibuat Pada</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[13px]">
                {filteredUsers.map((u) => {
                  const ri = ROLE_INFO[u.role] || ROLE_INFO['staf'];
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[10px] bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[11px]">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-800 text-slate-900 leading-tight">{u.name}</p>
                            <p className="font-600 text-[11px] text-slate-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`pill ${ri.cls}`}>{ri.label}</span>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-500 text-[12px]">
                        {new Date(u.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'})}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditModal(u)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-[10px] transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(u)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-dropdown overflow-hidden flex flex-col animate-fade-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-800 text-[15px] text-slate-900 flex items-center gap-2">
                <UserPlus size={16} className="text-primary" />
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-[12px] text-[12px] font-bold">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap *</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Budi Santoso"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none focus:border-primary focus:ring-2 transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Username *</label>
                <input required type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="budi_123"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none focus:border-primary focus:ring-2 transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role Akses *</label>
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none focus:border-primary focus:ring-2 transition-all">
                  <option value="staf">Staf Lapangan</option>
                  <option value="kabag">Kepala Bagian (Monitoring)</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password {editingUser ? '(Opsional)' : '*'}</label>
                <input required={!editingUser} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none focus:border-primary focus:ring-2 transition-all" />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-[12px] font-bold transition-all shadow-md">
                  {editingUser ? 'Perbarui' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
