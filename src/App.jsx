import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Header';
import ManualInputModal from './components/ManualInputModal';
import ExcelImportModal from './components/ExcelImportModal';
import DashboardContent from './components/DashboardContent';
import BlockHeatmap from './components/BlockHeatmap';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import KanbanBoard from './components/KanbanBoard';
import QcManagement from './components/QcManagement';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { getLaporan, saveLaporan, updateLaporan, deleteLaporan, clearAllLaporan } from './lib/api';

/* ─── Animated Toast System ─────────────────────────────── */
function Toast({ toasts, exitingIds, onDismiss }) {
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifikasi"
      className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-[340px] max-w-[calc(100vw-3rem)]"
    >
      {toasts.map(t => {
        const isExiting = exitingIds.has(t.id);
        const styles = {
          success: 'bg-emerald-600 text-white',
          error:   'bg-red-500 text-white',
          info:    'bg-slate-800 text-white',
        };
        const icons = {
          success: 'check_circle',
          error:   'error',
          info:    'info',
        };
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 pl-4 pr-2 py-3 rounded-2xl shadow-dropdown pointer-events-auto
              ${styles[t.type] || styles.info}
              ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
          >
            <span className="material-icons text-[20px] shrink-0" aria-hidden="true">
              {icons[t.type] || 'info'}
            </span>
            <p className="text-[13px] font-semibold flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <span className="material-icons text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Skeleton Loader (Bento Style) ──────────────────────── */
function SkeletonKPI() {
  return (
    <div className="bento-card card-pad space-y-4 animate-skeleton">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-slate-100" />
        <div className="w-16 h-5 rounded-pill bg-slate-100" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded-full w-1/3" />
        <div className="h-8 bg-slate-100 rounded-lg w-1/2" />
      </div>
      <div className="h-2 bg-slate-100 rounded-full w-full mt-4" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bento-card card-pad space-y-5 animate-skeleton">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-100 rounded-full w-3/4" />
          <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        </div>
        <div className="w-12 h-5 rounded-pill bg-slate-100 shrink-0 ml-4" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-2.5 bg-slate-100 rounded-full w-1/4" />
          <div className="h-2.5 bg-slate-100 rounded-full w-1/4" />
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full w-full" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-50">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2 bg-slate-100 rounded-full w-2/3" />
            <div className="h-3 bg-slate-100 rounded-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => <SkeletonKPI key={i} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────── */
function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [toasts, setToasts] = useState([]);
  const [exitingIds, setExitingIds] = useState(new Set());
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user_session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [activeTab, setActiveTab] = useState('overview');
  const timersRef = useRef({});

  // Cleanup timers on unmount
  useEffect(() => {
    return () => Object.values(timersRef.current).forEach(clearTimeout);
  }, []);

  const dismissToast = useCallback((id) => {
    setExitingIds(prev => new Set([...prev, id]));
    const t = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setExitingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      delete timersRef.current[id];
    }, 300);
    timersRef.current[`exit-${id}`] = t;
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-3), { id, message, type }]); // Max 4
    const t = setTimeout(() => dismissToast(id), 5000);
    timersRef.current[id] = t;
  }, [dismissToast]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
    setActiveTab(userData.role === 'admin' ? 'admin' : 'overview');
    showToast(`Selamat datang, ${userData.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    setUser(null);
    setData([]);
    showToast('Anda telah keluar dari sistem.', 'info');
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getLaporan(filterStart, filterEnd);
      const mapped = rows.map(r => ({
        id: r.id,
        uraian: r.uraian,
        tanggal: r.tanggal,
        kebun: r.kebun,
        rencana: r.rencana,
        blokHi: r.blok_hi,
        blokSd: r.blok_sd,
        realisasiHi: r.realisasi_hi,
        realisasiSd: r.realisasi_sd,
        capaian: r.capaian,
        batchId: r.batch_id || 'BATCH-01',
        gramasi: parseFloat(r.gramasi) || 0,
        statusProses: r.status_proses || 'TO DO',
        penanggungJawab: r.penanggung_jawab || '-',
        qcPassed: parseInt(r.qc_passed) || 0,
        qcRejected: parseInt(r.qc_rejected) || 0,
        qcDefectReason: r.qc_defect_reason || '',
        kabagNotes: r.kabag_notes || '',
      }));
      setData(mapped);
    } catch {
      showToast('Gagal terhubung ke server. Pastikan API berjalan.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStart, filterEnd, showToast]);

  useEffect(() => {
    if (user && user.role !== 'admin') fetchData();
  }, [fetchData, user]);

  const handleSaveManual = async (formData) => {
    let capaian = parseFloat(formData.capaian);
    if (isNaN(capaian) || formData.capaian === '') {
      const rencana = parseFloat(formData.rencana) || 0;
      const realSD  = parseFloat(formData.realisasiSd) || 0;
      capaian = rencana > 0 ? (realSD / rencana) * 100 : 0;
    }
    const payload = { ...formData, capaian: parseFloat(capaian.toFixed(2)) };
    try {
      if (editingItem) {
        await updateLaporan(editingItem.id, payload);
        showToast('Data berhasil diperbarui!', 'success');
      } else {
        await saveLaporan(payload);
        showToast('Data berhasil disimpan!', 'success');
      }
      setEditingItem(null);
      setShowManualModal(false);
      fetchData();
    } catch (err) {
      showToast('Gagal menyimpan: ' + err.message, 'error');
    }
  };

  const handleDataImported = async (importedData) => {
    setLoading(true);
    let successCount = 0;
    for (const item of importedData) {
      try {
        let capaian = parseFloat(item.capaian) || 0;
        if (!capaian && item.rencana > 0) capaian = (item.realisasiSd / item.rencana) * 100;
        await saveLaporan({ ...item, capaian });
        successCount++;
      } catch { /* skip */ }
    }
    showToast(`Berhasil import ${successCount} data pekerjaan!`, 'success');
    fetchData();
    setLoading(false);
  };

  const handleEdit = (item) => { setEditingItem(item); setShowManualModal(true); };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus data "${item.uraian}"?`)) return;
    try {
      await deleteLaporan(item.id);
      showToast('Data berhasil dihapus.', 'success');
      fetchData();
    } catch (err) { showToast('Gagal menghapus: ' + err.message, 'error'); }
  };

  const handleResetAll = async () => {
    if (!window.confirm('Hapus SEMUA data dari database? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      setLoading(true);
      // Fallback: hapus satu-satu untuk memastikan kompatibilitas backend
      for (const item of data) {
        await deleteLaporan(item.id);
      }
      showToast('Semua data berhasil dihapus.', 'success');
      setData([]);
    } catch { 
      showToast('Gagal menghapus beberapa atau semua data.', 'error'); 
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      const payload = {
        uraian: item.uraian, tanggal: item.tanggal, kebun: item.kebun,
        rencana: parseFloat(item.rencana) || 0,
        blokHi: item.blokHi || '-', blokSd: item.blokSd || '-',
        realisasiHi: parseFloat(item.realisasiHi) || 0,
        realisasiSd: parseFloat(item.realisasiSd) || 0,
        capaian: parseFloat(item.capaian) || 0,
        batchId: item.batchId || 'BATCH-01',
        gramasi: parseFloat(item.gramasi) || 0,
        statusProses: newStatus,
        penanggungJawab: item.penanggungJawab || '-',
        qcPassed: parseInt(item.qcPassed) || 0,
        qcRejected: parseInt(item.qcRejected) || 0,
        qcDefectReason: item.qcDefectReason || '',
        kabagNotes: item.kabagNotes || null,
      };
      await updateLaporan(item.id, payload);
      showToast(`Batch ${item.batchId} dipindahkan ke "${newStatus}"`, 'success');
      fetchData();
    } catch (err) { showToast('Gagal memindahkan batch: ' + err.message, 'error'); }
  };

  const handleSaveInstruction = async (block, instructionText) => {
    try {
      for (const job of block.jobs) {
        const payload = {
          uraian: job.uraian, tanggal: job.tanggal, kebun: job.kebun,
          rencana: parseFloat(job.rencana) || 0,
          blokHi: job.blokHi || '-', blokSd: job.blokSd || '-',
          realisasiHi: parseFloat(job.realisasiHi) || 0,
          realisasiSd: parseFloat(job.realisasiSd) || 0,
          capaian: parseFloat(job.capaian) || 0,
          batchId: job.batchId || 'BATCH-01',
          gramasi: parseFloat(job.gramasi) || 0,
          statusProses: job.statusProses || 'TO DO',
          penanggungJawab: job.penanggungJawab || '-',
          qcPassed: parseInt(job.qcPassed) || 0,
          qcRejected: parseInt(job.qcRejected) || 0,
          qcDefectReason: job.qcDefectReason || '',
          kabagNotes: instructionText,
        };
        await updateLaporan(job.id, payload);
      }
      showToast(`Catatan Kabag untuk Blok ${block.name} disimpan!`, 'success');
      fetchData();
    } catch { showToast('Gagal menyimpan instruksi Kabag.', 'error'); }
  };

  const handleSaveQc = async (updatedJob) => {
    try {
      const payload = {
        uraian: updatedJob.uraian, tanggal: updatedJob.tanggal, kebun: updatedJob.kebun,
        rencana: parseFloat(updatedJob.rencana) || 0,
        blokHi: updatedJob.blokHi || '-', blokSd: updatedJob.blokSd || '-',
        realisasiHi: parseFloat(updatedJob.realisasiHi) || 0,
        realisasiSd: parseFloat(updatedJob.realisasiSd) || 0,
        capaian: parseFloat(updatedJob.capaian) || 0,
        batchId: updatedJob.batchId || 'BATCH-01',
        gramasi: parseFloat(updatedJob.gramasi) || 0,
        statusProses: updatedJob.statusProses || 'TO DO',
        penanggungJawab: updatedJob.penanggungJawab || '-',
        qcPassed: parseInt(updatedJob.qcPassed) || 0,
        qcRejected: parseInt(updatedJob.qcRejected) || 0,
        qcDefectReason: updatedJob.qcDefectReason || '',
        kabagNotes: updatedJob.kabagNotes || null,
      };
      await updateLaporan(updatedJob.id, payload);
      showToast(`Log QC Batch ${updatedJob.batchId} berhasil disimpan!`, 'success');
      fetchData();
    } catch { showToast('Gagal menyimpan hasil QC.', 'error'); }
  };

  const handleExportExcel = () => {
    if (data.length === 0) { showToast('Tidak ada data untuk diekspor!', 'error'); return; }
    const exportData = data.map(item => ({
      'Uraian Pekerjaan': item.uraian, 'Tanggal': item.tanggal,
      'Kebun': item.kebun, 'Rencana Total (Ha)': item.rencana,
      'Blok HI': item.blokHi, 'Blok S.D HI': item.blokSd,
      'Realisasi HI (Ha)': item.realisasiHi, 'Realisasi S.D HI (Ha)': item.realisasiSd,
      'Capaian (%)': item.capaian, 'Batch ID': item.batchId,
      'Gramasi (Kg)': item.gramasi, 'Status Proses': item.statusProses,
      'Penanggung Jawab': item.penanggungJawab,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Pekerjaan");
    XLSX.writeFile(wb, `Laporan_Operasional_Kebun_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Laporan berhasil diekspor ke Excel!', 'success');
  };

  const handleExportImage = () => {
    const element = document.getElementById('dashboard-main-content') || document.body;
    showToast('Sedang membuat gambar ekspor...', 'info');
    const buttons = element.querySelectorAll('button, input, select');
    buttons.forEach(btn => btn.setAttribute('data-html2canvas-ignore', 'true'));
    html2canvas(element, {
      useCORS: true,
      backgroundColor: '#F1F5F9', // match app bg
      scale: 2,
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Smart_Tobacco_Dashboard_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Dashboard berhasil diekspor sebagai gambar!', 'success');
    }).catch(err => showToast('Gagal mengekspor: ' + err.message, 'error'));
  };

  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center animate-fade-up min-h-[60vh]">
      <div className="bento-card max-w-2xl w-full">
        <div className="card-pad-lg flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-20 h-20 bg-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-300 border border-emerald-100">
            <span className="material-icons text-4xl">monitoring</span>
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl font-800 text-slate-900 tracking-tight">Belum Ada Data Pekerjaan</h3>
            <p className="text-slate-500 text-[13px] leading-relaxed">
              {user?.role === 'staf'
                ? 'Mulai catat pekerjaan lapangan hari ini. Klik "Tambah Data" untuk input manual, atau upload file Excel jika data sudah disiapkan.'
                : 'Belum ada data operasional yang masuk. Hubungi staf lapangan untuk melakukan input data harian.'}
            </p>
          </div>
          {user?.role === 'staf' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs">
              <button onClick={() => { setEditingItem(null); setShowManualModal(true); }}
                className="flex-1 px-5 py-3 bg-primary text-white rounded-xl text-[13px] font-bold hover:bg-primary-dark transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2">
                <span className="material-icons text-[18px]">add</span> Tambah Data Manual
              </button>
              <button onClick={() => setShowExcelModal(true)}
                className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2">
                <span className="material-icons text-[18px]">upload_file</span> Import Excel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toast toasts={toasts} exitingIds={exitingIds} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={handleLogout}
      onImportManual={() => { setEditingItem(null); setShowManualModal(true); }}
      onImportExcel={() => setShowExcelModal(true)}
      onExportExcel={handleExportExcel}
      onExportImage={handleExportImage}
    >
      {/* Date Filter — di atas konten, di bawah topbar */}
      {activeTab !== 'admin' && (
        <div className="flex justify-end mb-5 animate-fade-up">
          <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
            <div className="flex items-center px-3 gap-2 border-r border-slate-100">
              <span className="material-icons text-primary text-[16px]">calendar_today</span>
              <input id="filter-start" type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)}
                className="bg-transparent border-none text-[12px] font-bold text-slate-700 outline-none cursor-pointer focus:ring-0 p-0" aria-label="Dari tanggal" />
            </div>
            <div className="flex items-center px-3 gap-2">
              <span className="text-slate-300 text-[12px] font-bold">s/d</span>
              <input id="filter-end" type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)}
                className="bg-transparent border-none text-[12px] font-bold text-slate-700 outline-none cursor-pointer focus:ring-0 p-0" aria-label="Sampai tanggal" />
            </div>
            <button onClick={() => { setFilterStart(''); setFilterEnd(''); }}
              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Reset filter tanggal">
              <span className="material-icons text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div id="dashboard-main-content" className="flex-1 flex flex-col">
        {activeTab === 'admin' ? (
          <AdminDashboard user={user} showToast={showToast} />
        ) : loading ? (
          <LoadingState />
        ) : data.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="flex flex-col gap-8">
            {activeTab === 'overview' && (
              <>
                <BlockHeatmap data={data} userRole={user?.role} onSaveInstruction={handleSaveInstruction} />
                <DashboardContent data={data} onEdit={handleEdit} onDelete={handleDelete}
                  onResetAll={handleResetAll} userRole={user?.role} showOnlySummary={true} />
              </>
            )}
            {activeTab === 'operasional' && (
              <DashboardContent data={data} onEdit={handleEdit} onDelete={handleDelete}
                onResetAll={handleResetAll} userRole={user?.role} showOnlyList={true} />
            )}
            {activeTab === 'kanban' && (
              <KanbanBoard data={data} onStatusChange={handleStatusChange} userRole={user?.role} />
            )}
            {activeTab === 'qc' && (
              <QcManagement data={data} onSaveQc={handleSaveQc} userRole={user?.role} />
            )}
          </div>
        )}
      </div>

      {/* Modals & Toasts */}
      <ManualInputModal
        isOpen={showManualModal}
        onClose={() => { setShowManualModal(false); setEditingItem(null); }}
        onSave={handleSaveManual}
        editingData={editingItem}
      />
      <ExcelImportModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onDataImported={handleDataImported}
      />
      <Toast toasts={toasts} exitingIds={exitingIds} onDismiss={dismissToast} />
    </Layout>
  );
}

export default App;
