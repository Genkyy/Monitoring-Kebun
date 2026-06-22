import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ExcelImportModal({ isOpen, onClose, onDataImported }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    const isExcel = selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                    selectedFile.type === 'application/vnd.ms-excel' ||
                    selectedFile.name.endsWith('.xlsx') || 
                    selectedFile.name.endsWith('.xls');

    if (!isExcel) {
      setError('Format file tidak didukung. Harap unggah file .xlsx atau .xls');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Read headers starting from row 3 (index 2)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 2 });
        
        const mappedData = jsonData.map(row => ({
          uraian: row['Uraian Pekerjaan'] || '-',
          tanggal: row['Tanggal'] || new Date().toISOString().split('T')[0],
          kebun: row['Kebun'] || 'Kertowono',
          rencana: parseFloat(row['Rencana (Ha)']) || 0,
          blokHi: row['Blok (HI)'] || '-',
          blokSd: row['Blok (S.D)'] || '-',
          realisasiHi: parseFloat(row['Realisasi (HI)']) || 0,
          realisasiSd: parseFloat(row['Realisasi (S.D)']) || 0,
          capaian: parseFloat(row['Capaian (%)']) || 0,
          batchId: row['Batch ID'] || `BATCH-${Math.floor(Math.random()*1000)}`,
          gramasi: parseFloat(row['Gramasi (Kg)']) || 0,
          statusProses: row['Status'] || 'TO DO',
          penanggungJawab: row['PIC'] || '-',
        }));

        onDataImported(mappedData);
        onClose();
      } catch (err) {
        setError('Gagal membaca file Excel. Pastikan format tabel sesuai dengan template.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-dropdown overflow-hidden flex flex-col animate-fade-up">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-800 text-[16px] text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-primary" />
            Import Laporan Excel
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-[13px] text-slate-500 font-medium mb-4">
            Unggah file laporan harian berformat Excel (.xlsx). Pastikan tabel data dimulai pada baris ketiga (baris 1 & 2 diabaikan).
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-2 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}
              ${file && !error ? 'border-emerald-500 bg-emerald-50' : ''}
              ${error ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            {error ? (
              <>
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3">
                  <AlertTriangle size={24} />
                </div>
                <p className="text-[13px] font-bold text-red-600 mb-1">Upload Gagal</p>
                <p className="text-[11px] font-medium text-red-500 mb-4">{error}</p>
                <button onClick={() => {setFile(null); setError(null);}} className="text-[12px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                  Coba Lagi
                </button>
              </>
            ) : file ? (
              <>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-[13px] font-bold text-emerald-700 mb-1">File Siap Diimport</p>
                <p className="text-[11px] font-medium text-slate-500 mb-4 truncate max-w-[200px]">{file.name}</p>
                <button onClick={() => setFile(null)} className="text-[12px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                  Ganti File
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                  <Upload size={24} />
                </div>
                <p className="text-[13px] font-bold text-slate-700 mb-1">Tarik & Lepas File Excel</p>
                <p className="text-[11px] font-medium text-slate-400 mb-4">atau klik tombol di bawah untuk memilih</p>
                
                <label className="cursor-pointer bg-white border border-slate-200 px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm">
                  Pilih File
                  <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <a href="#" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
            <FileSpreadsheet size={12} /> Unduh Template
          </a>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-[13px] font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
              Batal
            </button>
            <button
              onClick={handleImport}
              disabled={!file || error}
              className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer
                ${!file || error ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary-dark text-white'}
              `}
            >
              Proses Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
