import React, { useState, useEffect, useMemo } from 'react';
import { Save, X, Calendar, MapPin, Layers, Scale, User, ClipboardList, PenLine, Info, TrendingUp } from 'lucide-react';

/* ── Tooltip helper ── */
function FieldHint({ text }) {
  return (
    <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug flex items-start gap-1">
      <Info size={11} className="shrink-0 mt-0.5 text-slate-300" />
      {text}
    </p>
  );
}

/* ── Live Capaian Preview Card ── */
function CapaianPreview({ rencana, realisasiSd, uraian, kebun, tanggal }) {
  const rencanaNum   = parseFloat(rencana)    || 0;
  const realisasiNum = parseFloat(realisasiSd) || 0;
  const pct = rencanaNum > 0 ? Math.min(((realisasiNum / rencanaNum) * 100), 999) : 0;

  const color   = pct >= 85 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500';
  const barColor = pct >= 85 ? 'bg-emerald-500'   : pct >= 50 ? 'bg-amber-400'   : 'bg-red-400';
  const label   = pct >= 85 ? 'Baik 🎉'           : pct >= 50 ? 'Cukup ⚠'       : 'Perlu Perhatian ❗';

  if (!uraian && rencanaNum === 0) return null;

  return (
    <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-[14px] space-y-3 animate-fade-up">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={14} className="text-primary" />
        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Preview Capaian Otomatis</p>
      </div>

      {uraian && (
        <div className="flex gap-2 text-[12px] text-slate-500">
          <span className="font-semibold text-slate-700 truncate">{uraian}</span>
          {kebun && <span className="text-slate-300">·</span>}
          {kebun && <span>{kebun}</span>}
          {tanggal && <span className="text-slate-300">·</span>}
          {tanggal && <span>{tanggal}</span>}
        </div>
      )}

      <div className="flex items-end justify-between gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Realisasi S/D</span>
            <span>{realisasiNum.toFixed(2)} / {rencanaNum.toFixed(2)} Ha</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-2xl font-black tabular-nums ${color}`}>{pct.toFixed(1)}%</p>
          <p className={`text-[10px] font-bold ${color}`}>{label}</p>
        </div>
      </div>

      {rencanaNum > 0 && realisasiNum > 0 && (
        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-[8px]">
          <span>✓</span> Siap disimpan — sistem akan menghitung capaian otomatis
        </p>
      )}
    </div>
  );
}

export default function ManualInputModal({ isOpen, onClose, onSave, editingData }) {
  const [formData, setFormData] = useState({
    uraian: '', tanggal: '', kebun: '', rencana: '', blokHi: '-', blokSd: '-',
    realisasiHi: '', realisasiSd: '', batchId: 'BATCH-01', gramasi: '', penanggungJawab: '-'
  });

  useEffect(() => {
    if (isOpen) {
      if (editingData) {
        setFormData({ ...editingData });
      } else {
        setFormData({
          uraian: '', tanggal: new Date().toISOString().split('T')[0],
          kebun: 'Kertowono', rencana: '', blokHi: '-', blokSd: '-',
          realisasiHi: '', realisasiSd: '', batchId: `BATCH-${Math.floor(Math.random()*1000)}`,
          gramasi: '', penanggungJawab: '-'
        });
      }
    }
  }, [isOpen, editingData]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-dropdown overflow-hidden flex flex-col max-h-[90vh] animate-fade-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-800 text-[16px] text-slate-900 flex items-center gap-2">
            <PenLine size={18} className="text-primary" />
            {editingData ? 'Edit Pekerjaan' : 'Tambah Pekerjaan Baru'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form id="manual-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Section 1: Info Dasar */}
          <div>
            <h4 className="flex items-center gap-2 text-[12px] font-800 text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              <ClipboardList size={14} className="text-blue-500" /> Informasi Dasar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Uraian Pekerjaan <span className="text-red-400">*</span>
                </label>
                <input required type="text" name="uraian" value={formData.uraian} onChange={handleChange} placeholder="Contoh: Panen Daun Bawah, Semprot Pestisida Blok A"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition-all focus:ring-2 focus:ring-primary/20" />
                <FieldHint text="Tulis jenis pekerjaan yang dikerjakan di lapangan hari ini." />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={12} /> Kebun / Lokasi <span className="text-red-400">*</span>
                </label>
                <input required list="kebun-list" name="kebun" value={formData.kebun} onChange={handleChange} placeholder="Pilih atau ketik kebun baru..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition-all" />
                <datalist id="kebun-list">
                  <option value="Kertowono" />
                  <option value="Gucialit" />
                  <option value="Sukosari" />
                  <option value="Malangsari" />
                </datalist>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} /> Tanggal Pekerjaan <span className="text-red-400">*</span>
                </label>
                <input required type="date" name="tanggal" value={formData.tanggal} onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Section 2: Target & Realisasi */}
          <div>
            <h4 className="flex items-center gap-2 text-[12px] font-800 text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              <Layers size={14} className="text-emerald-500" /> Target & Lahan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Rencana Total (Ha) <span className="text-red-400">*</span>
                </label>
                <input required type="number" step="0.01" min="0" name="rencana" value={formData.rencana} onChange={handleChange} placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition-all focus:ring-2 focus:ring-primary/20" />
                <FieldHint text="Total luas lahan yang direncanakan untuk musim ini." />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Realisasi Hari Ini (Ha) <span className="text-red-400">*</span>
                </label>
                <input required type="number" step="0.01" min="0" name="realisasiHi" value={formData.realisasiHi} onChange={handleChange} placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-emerald-700 outline-none transition-all focus:ring-2 focus:ring-primary/20" />
                <FieldHint text="Luas yang selesai dikerjakan pada hari ini saja." />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Realisasi Akumulatif (Ha) <span className="text-red-400">*</span>
                </label>
                <input required type="number" step="0.01" min="0" name="realisasiSd" value={formData.realisasiSd} onChange={handleChange} placeholder="0.00"
                  className="w-full bg-emerald-50 border border-emerald-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-bold text-emerald-800 outline-none transition-all focus:ring-2 focus:ring-primary/20" />
                <FieldHint text="Total luas yang telah selesai dari awal hingga hari ini (kumulatif)." />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Blok yang Dikerjakan Hari Ini
                </label>
                <input type="text" name="blokHi" value={formData.blokHi} onChange={handleChange} placeholder="Nama blok hari ini (cth: A1, B2)"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition-all" />
                <FieldHint text="Kode atau nama petak/blok kebun yang dikerjakan pada hari ini." />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Semua Blok Hingga Hari Ini
                </label>
                <input type="text" name="blokSd" value={formData.blokSd} onChange={handleChange} placeholder="Semua blok yang sudah selesai (cth: A1, B2, C3)"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition-all" />
                <FieldHint text="Daftar semua blok yang telah selesai dikerjakan sejak awal." />
              </div>
            </div>

            {/* Live Capaian Preview */}
            <CapaianPreview
              rencana={formData.rencana}
              realisasiSd={formData.realisasiSd}
              uraian={formData.uraian}
              kebun={formData.kebun}
              tanggal={formData.tanggal}
            />
          </div>

          {/* Section 3: Batch & Produksi */}
          <div>
            <h4 className="flex items-center gap-2 text-[12px] font-800 text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              <Scale size={14} className="text-purple-500" /> Detail Produksi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Batch ID</label>
                <input type="text" name="batchId" value={formData.batchId} onChange={handleChange} placeholder="BATCH-XX"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition-all" />
                <FieldHint text="Nomor batch produksi. Terisi otomatis, bisa diubah jika perlu." />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  Gramasi (Kg)
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">Opsional</span>
                </label>
                <input type="number" step="0.1" min="0" name="gramasi" value={formData.gramasi} onChange={handleChange} placeholder="0.0"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition-all" />
                <FieldHint text="Berat hasil produksi dalam kilogram (jika tersedia)." />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} /> Penanggung Jawab
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">Opsional</span>
                </label>
                <input type="text" name="penanggungJawab" value={formData.penanggungJawab} onChange={handleChange} placeholder="Nama PIC lapangan"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-[12px] px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 outline-none transition-all" />
                <FieldHint text="Nama mandor atau staf yang bertanggung jawab atas pekerjaan ini." />
              </div>
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-3">
          <p className="text-[11px] text-slate-400 font-medium">
            <span className="text-red-400">*</span> Field wajib diisi
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-[13px] font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
              Batal
            </button>
            <button type="submit" form="manual-form" className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-[13px] font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer">
              <Save size={16} /> {editingData ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
