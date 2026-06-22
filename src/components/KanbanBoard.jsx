import React, { useState } from 'react';
import { Shield, Calendar, User, Scale, ArrowRight, MoreHorizontal, MapPin } from 'lucide-react';

const COLUMNS = [
  { key: 'TO DO',          label: 'Belum Mulai',         color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { key: 'IN PROGRESS',   label: 'Sedang Dikerjakan',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'AGING PROCESS', label: 'Proses Curing',       color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'TAHAP QC',      label: 'Tahap QC',            color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'PRODUK JADI',   label: 'Selesai / Gudang',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

export default function KanbanBoard({ data, onStatusChange, userRole = 'staf' }) {
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [draggingId, setDraggingId]         = useState(null);
  const isStaf = userRole === 'staf';

  const handleDragStart = (e, id) => {
    if (!isStaf) return;
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, colKey) => {
    if (!isStaf) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colKey) setDragOverColumn(colKey);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, status) => {
    if (!isStaf) return;
    e.preventDefault();
    setDragOverColumn(null);
    setDraggingId(null);
    const id = e.dataTransfer.getData('text/plain');
    const item = data.find(d => d.id.toString() === id);
    if (item && item.statusProses !== status) onStatusChange(item, status);
  };

  return (
    <div className="h-[calc(100vh-16rem)] min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[18px] font-900 text-slate-900">Papan Alur Produksi</h2>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">
            {isStaf ? 'Seret dan lepas kartu untuk memperbarui tahapan.' : 'Mode pantau (Read-Only).'}
          </p>
        </div>
        {!isStaf && (
          <span className="pill pill-muted"><Shield size={10} /> Read-Only</span>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 snap-x">
        {COLUMNS.map(col => {
          // Menampilkan item jika statusProses cocok ATAU item baru (belum ada status) masuk ke 'TO DO'
          const colItems = data.filter(d => 
            (d.statusProses === col.key) || 
            (col.key === 'TO DO' && (!d.statusProses || d.statusProses.trim() === ''))
          );
          const isDropTarget = dragOverColumn === col.key;

          return (
            <div
              key={col.key}
              onDragOver={e => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.key)}
              className={`flex-1 min-w-[280px] max-w-[320px] flex flex-col bg-slate-50/50 border border-slate-200 rounded-[24px] overflow-hidden snap-center transition-colors
                ${isDropTarget && isStaf ? 'bg-primary/5 border-primary shadow-[0_0_0_4px_rgba(5,150,105,0.1)]' : ''}`}
            >
              {/* Col Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color.split(' ')[0]}`} />
                  <h3 className="text-[13px] font-800 text-slate-800 uppercase tracking-wide">{col.label}</h3>
                </div>
                <span className="text-[11px] font-bold bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full shadow-sm">
                  {colItems.length}
                </span>
              </div>

              {/* Col Body */}
              <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
                {colItems.length === 0 && !isDropTarget ? (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl m-2">
                    <p className="text-[11px] font-semibold text-slate-400">Kosong</p>
                  </div>
                ) : (
                  colItems.map(item => {
                    const isDragging = draggingId === item.id;
                    return (
                      <div
                        key={item.id}
                        draggable={isStaf}
                        onDragStart={e => handleDragStart(e, item.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white border border-slate-200 p-3.5 rounded-[16px] shadow-sm transition-all
                          ${isStaf ? 'cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-md' : ''}
                          ${isDragging ? 'opacity-40 scale-95' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="pill pill-muted text-[9px] bg-slate-100 border border-slate-200">{item.batchId}</span>
                          <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={14} /></button>
                        </div>
                        <h4 className="text-[13px] font-800 text-slate-900 leading-snug mb-3">{item.uraian}</h4>
                        
                        <div className="space-y-1.5 border-t border-slate-50 pt-2.5">
                          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                            <span className="flex items-center gap-1"><Scale size={11} /> {item.gramasi} Kg</span>
                            <span className="flex items-center gap-1"><User size={11} /> {item.penanggungJawab}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                            <span className="flex items-center gap-1"><MapPin size={11} /> {item.kebun}</span>
                            <span className="flex items-center gap-1"><Calendar size={11} /> {item.tanggal}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {isDropTarget && isStaf && (
                  <div className="h-20 border-2 border-dashed border-primary bg-primary/5 rounded-[16px] animate-skeleton" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
