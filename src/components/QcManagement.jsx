import React, { useState } from 'react';
import { ShieldCheck, ClipboardCheck, AlertTriangle, Percent, ShieldAlert, Plus, X, Save } from 'lucide-react';

export default function QcManagement({ data, onSaveQc, userRole = 'staf' }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');
  const [qcPassed, setQcPassed] = useState('');
  const [qcRejected, setQcRejected] = useState('');
  const [qcDefectReason, setQcDefectReason] = useState('Wrapper Robek');
  const [customDefectReason, setCustomDefectReason] = useState('');
  const [checker, setChecker] = useState('');

  // 1. Calculate Stats
  let totalPassed = 0;
  let totalRejected = 0;
  const qcLogs = data.filter(item => (item.qcPassed > 0 || item.qcRejected > 0));

  data.forEach(item => {
    totalPassed += parseInt(item.qcPassed) || 0;
    totalRejected += parseInt(item.qcRejected) || 0;
  });

  const totalChecked = totalPassed + totalRejected;
  const rejectionRate = totalChecked > 0 ? ((totalRejected / totalChecked) * 100).toFixed(1) : '0';

  // 2. Count Defect Reasons for Analysis
  const defectsMap = {
    'Wrapper Robek': 0,
    'Molding Tidak Rapi': 0,
    'Gramasi Tidak Sesuai': 0,
    'Lainnya': 0
  };

  qcLogs.forEach(item => {
    if (item.qcRejected > 0 && item.qcDefectReason) {
      const reason = item.qcDefectReason;
      if (defectsMap[reason] !== undefined) {
        defectsMap[reason] += item.qcRejected;
      } else {
        defectsMap['Lainnya'] += item.qcRejected;
      }
    }
  });

  const defectColors = {
    'Wrapper Robek': 'bg-cyan-500',
    'Molding Tidak Rapi': 'bg-amber-500',
    'Gramasi Tidak Sesuai': 'bg-rose-500',
    'Lainnya': 'bg-purple-500'
  };

  const handleOpenModal = () => {
    setSelectedJob('');
    setQcPassed('');
    setQcRejected('');
    setQcDefectReason('Wrapper Robek');
    setCustomDefectReason('');
    setChecker('');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const jobItem = data.find(d => d.id.toString() === selectedJob.toString());
    if (!jobItem) return;

    const finalDefectReason = qcDefectReason === 'Lainnya' ? customDefectReason.trim() : qcDefectReason;
    
    const updatedData = {
      ...jobItem,
      qcPassed: parseInt(qcPassed) || 0,
      qcRejected: parseInt(qcRejected) || 0,
      qcDefectReason: parseInt(qcRejected) > 0 ? finalDefectReason : '',
      penanggungJawab: checker.trim() || jobItem.penanggungJawab
    };

    onSaveQc(updatedData);
    setShowModal(false);
  };

  const availableJobs = data.filter(d => d.batchId && d.batchId.trim() !== '' && d.batchId !== '-');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-900 text-slate-900">Kontrol Mutu & QC</h2>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">
            Analisis defect produk jadi dan evaluasi performa batch produksi.
          </p>
        </div>

        {userRole === 'staf' && (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-[12px] text-[13px] transition-all shadow-md shadow-primary/25 cursor-pointer"
          >
            <Plus size={16} aria-hidden="true" /> Catat Hasil QC
          </button>
        )}
      </div>

      {/* QC Summary Metrics (Bento Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bento-card card-pad animate-fade-up flex items-center gap-4">
          <div className="icon-box icon-box-blue"><ClipboardCheck size={20} /></div>
          <div>
            <p className="metric-label">Total Diperiksa</p>
            <p className="metric-value text-2xl">{totalChecked}</p>
          </div>
        </div>

        <div className="bento-card card-pad animate-fade-up flex items-center gap-4" style={{animationDelay: '50ms'}}>
          <div className="icon-box icon-box-primary"><ShieldCheck size={20} /></div>
          <div>
            <p className="metric-label">Lolos (Passed)</p>
            <p className="metric-value text-2xl">{totalPassed}</p>
          </div>
        </div>

        <div className="bento-card card-pad animate-fade-up flex items-center gap-4" style={{animationDelay: '100ms'}}>
          <div className="icon-box icon-box-rose"><ShieldAlert size={20} /></div>
          <div>
            <p className="metric-label">Produk Reject</p>
            <p className="metric-value text-2xl">{totalRejected}</p>
          </div>
        </div>

        <div className="bento-card card-pad animate-fade-up flex items-center gap-4" style={{animationDelay: '150ms'}}>
          <div className={`icon-box ${totalRejected > totalChecked * 0.1 ? 'icon-box-amber' : 'icon-box-slate'}`}>
            <Percent size={20} />
          </div>
          <div>
            <p className="metric-label">Rasio Reject</p>
            <p className="metric-value text-2xl">{rejectionRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Defect Categorization */}
        <div className="bento-card card-pad animate-fade-up">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-amber-500" size={16} />
            <h3 className="text-[14px] font-800 text-slate-800">Distribusi Kategori Cacat</h3>
          </div>
          
          <div className="space-y-5">
            {Object.keys(defectsMap).map((reason, i) => {
              const qty = defectsMap[reason];
              const pct = totalRejected > 0 ? ((qty / totalRejected) * 100).toFixed(0) : '0';
              return (
                <div key={reason} className="space-y-1.5" style={{animationDelay: `${200 + (i*50)}ms`}}>
                  <div className="flex justify-between items-center text-[12px] font-semibold text-slate-600">
                    <span>{reason}</span>
                    <span className="text-slate-400">{qty} unit ({pct}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className={`${defectColors[reason] || 'bg-slate-500'} h-full rounded-full`} style={{ width: `${pct}%`, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Log Table */}
        <div className="bento-card lg:col-span-2 flex flex-col min-h-[300px] animate-fade-up" style={{animationDelay: '100ms'}}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[14px] font-800 text-slate-800">Daftar Log QC Terbaru</h3>
          </div>

          <div className="flex-1 overflow-x-auto">
            {qcLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                <span className="material-icons text-[32px] text-slate-300">inventory_2</span>
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Belum Ada Log QC</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-800 uppercase text-slate-400 tracking-wider">
                    <th className="px-6 py-3">Batch ID</th>
                    <th className="px-6 py-3">Tanggal QC</th>
                    <th className="px-6 py-3">Uraian / Area</th>
                    <th className="px-6 py-3 text-center">Lolos</th>
                    <th className="px-6 py-3 text-center">Reject</th>
                    <th className="px-6 py-3">Alasan Reject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[12px] font-600 font-semibold text-slate-600">
                  {qcLogs.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-900">{item.batchId}</td>
                      <td className="px-6 py-3 text-slate-400">{item.tanggal}</td>
                      <td className="px-6 py-3">{item.uraian}</td>
                      <td className="px-6 py-3 text-center text-emerald-600 font-bold">{item.qcPassed}</td>
                      <td className="px-6 py-3 text-center text-rose-600 font-bold">{item.qcRejected}</td>
                      <td className="px-6 py-3">
                        {item.qcRejected > 0 ? (
                          <span className="pill pill-danger text-[9px]">{item.qcDefectReason}</span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* QC Input Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-dropdown overflow-hidden flex flex-col max-h-[90vh] animate-fade-up">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-800 text-[15px] text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                Catat Log Kontrol Mutu
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Batch Operasional *</label>
                <select
                  required value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">-- Pilih Batch Tembakau --</option>
                  {availableJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.batchId} — {job.uraian}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lolos (Unit) *</label>
                  <input
                    required type="number" min="0" value={qcPassed} onChange={(e) => setQcPassed(e.target.value)} placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-[14px] font-bold text-emerald-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reject (Unit) *</label>
                  <input
                    required type="number" min="0" value={qcRejected} onChange={(e) => setQcRejected(e.target.value)} placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-[14px] font-bold text-rose-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
                  />
                </div>
              </div>

              {parseInt(qcRejected) > 0 && (
                <div className="space-y-3 p-4 bg-rose-50/50 border border-rose-100 rounded-[14px]">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-rose-600 uppercase tracking-wider">Kategori Defect *</label>
                    <select
                      value={qcDefectReason} onChange={(e) => setQcDefectReason(e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-[10px] px-3 py-2 text-[12px] font-semibold text-rose-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                    >
                      <option value="Wrapper Robek">Wrapper Robek (Daun Robek)</option>
                      <option value="Molding Tidak Rapi">Molding Tidak Rapi (Bentuk Cacat)</option>
                      <option value="Gramasi Tidak Sesuai">Gramasi Tidak Sesuai (Berat Cacat)</option>
                      <option value="Lainnya">Lainnya (Tulis Manual...)</option>
                    </select>
                  </div>
                  {qcDefectReason === 'Lainnya' && (
                    <div className="space-y-1.5">
                      <input
                        required type="text" value={customDefectReason} onChange={(e) => setCustomDefectReason(e.target.value)} placeholder="Detail cacat..."
                        className="w-full bg-white border border-rose-200 rounded-[10px] px-3 py-2 text-[12px] font-medium outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-[12px] font-bold transition-all shadow-md flex items-center gap-2">
                  <Save size={14} /> Simpan Log QC
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
