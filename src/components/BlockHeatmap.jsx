import React, { useState } from 'react';
import { Layers, X, MapPin, Megaphone, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const THEME_MAP = {
  cyan:    { icon: 'material-icons text-cyan-600',    label: 'text-sm font-black text-cyan-600',    bar: 'bg-cyan-500 h-full rounded-full' },
  emerald: { icon: 'material-icons text-emerald-600', label: 'text-sm font-black text-emerald-600', bar: 'bg-emerald-500 h-full rounded-full' },
  fuchsia: { icon: 'material-icons text-fuchsia-600', label: 'text-sm font-black text-fuchsia-600', bar: 'bg-fuchsia-500 h-full rounded-full' },
  teal:    { icon: 'material-icons text-teal-600',    label: 'text-sm font-black text-teal-600',    bar: 'bg-teal-500 h-full rounded-full' },
  indigo:  { icon: 'material-icons text-indigo-600',  label: 'text-sm font-black text-indigo-600',  bar: 'bg-indigo-500 h-full rounded-full' },
};

export default function BlockHeatmap({ data, userRole = 'kabag', onSaveInstruction }) {
  const [selectedBlock,    setSelectedBlock]    = useState(null);
  const [tempInstruction,  setTempInstruction]  = useState('');

  const getUniqueBlocksByKebun = () => {
    const blocksMap = {};
    data.forEach(item => {
      if (!item.kebun) return;
      const extractBlocks = (field) => {
        if (!field || field === '-') return [];
        return field.split(/[-/,\s|]+/).map(b => b.trim()).filter(b => b.length > 0 && b !== '-');
      };
      const blockNames = Array.from(new Set([...extractBlocks(item.blokHi), ...extractBlocks(item.blokSd)]));
      if (blockNames.length === 0) blockNames.push('-');
      blockNames.forEach(name => {
        if (!blocksMap[item.kebun]) blocksMap[item.kebun] = {};
        if (!blocksMap[item.kebun][name]) {
          blocksMap[item.kebun][name] = { name, capaianSum: 0, count: 0, jobs: [] };
        }
        blocksMap[item.kebun][name].capaianSum += parseFloat(item.capaian) || 0;
        blocksMap[item.kebun][name].count      += 1;
        blocksMap[item.kebun][name].jobs.push(item);
      });
    });
    return Object.keys(blocksMap).map(kebunName => {
      const blocksArray = Object.keys(blocksMap[kebunName]).map(blockName => {
        const b = blocksMap[kebunName][blockName];
        return { name: blockName, capaian: Math.round(b.capaianSum / b.count), jobs: b.jobs };
      }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      return { kebun: kebunName, blocks: blocksArray };
    }).sort((a, b) => a.kebun.localeCompare(b.kebun));
  };

  const kebunData = getUniqueBlocksByKebun();

  const getHeatmapColor = (capaian) => {
    if (capaian < 50) return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300';
    if (capaian < 90) return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300';
    return            'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300';
  };

  const getBlockNotes = (block) => {
    if (!block?.jobs) return '';
    const j = block.jobs.find(j => j.kabagNotes && j.kabagNotes.trim() !== '');
    return j ? j.kabagNotes : '';
  };

  const handleSaveNotes = async () => {
    if (!selectedBlock) return;
    try {
      await onSaveInstruction(selectedBlock, tempInstruction);
      const updatedJobs = selectedBlock.jobs.map(j => ({ ...j, kabagNotes: tempInstruction }));
      setSelectedBlock({ ...selectedBlock, jobs: updatedJobs });
    } catch { /* handled by parent */ }
  };

  if (data.length === 0) return null;

  return (
    <div className="bento-card animate-fade-up">
      <div className="card-pad">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-blue">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-800 text-slate-900 leading-tight">Peta Pencapaian Blok</h2>
              <p className="text-[12px] text-slate-500 font-medium">Visualisasi capaian berdasarkan lahan</p>
            </div>
          </div>
          
          {/* Legend Pill */}
          <div className="flex gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> &lt;50%
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 50–89%
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> ≥90%
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {kebunData.map((k, kIdx) => {
            const critical = k.blocks.filter(b => b.capaian < 50).length;
            const onTrack  = k.blocks.filter(b => b.capaian >= 50 && b.capaian < 90).length;
            const done     = k.blocks.filter(b => b.capaian >= 90).length;

            return (
              <div key={kIdx} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" /> {k.kebun}
                    <span className="text-slate-400 font-medium ml-1">({k.blocks.length} blok)</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    {critical > 0 && <span className="pill pill-danger"><AlertTriangle size={10} /> {critical}</span>}
                    {onTrack > 0 && <span className="pill pill-warning"><Clock size={10} /> {onTrack}</span>}
                    {done > 0 && <span className="pill pill-primary"><CheckCircle size={10} /> {done}</span>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {k.blocks.map((block, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => {
                        setSelectedBlock({ ...block, kebun: k.kebun });
                        setTempInstruction(getBlockNotes(block));
                      }}
                      className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] border-2 transition-all cursor-pointer hover:shadow-sm shrink-0 ${getHeatmapColor(block.capaian)}`}
                    >
                      <span className="text-[10px] font-bold tracking-tight truncate w-full px-1">{block.name}</span>
                      <span className="text-[13px] font-900 mt-0.5 leading-none">{block.capaian}%</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Block Detail Modal */}
      {selectedBlock && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all"
          onClick={e => e.target === e.currentTarget && setSelectedBlock(null)}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-dropdown overflow-hidden flex flex-col max-h-[90vh] animate-fade-up">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-[15px] font-800 text-slate-900 flex items-center gap-2">
                  <Layers size={16} className="text-primary" />
                  Blok {selectedBlock.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold ml-6">{selectedBlock.kebun}</p>
              </div>
              <button onClick={() => setSelectedBlock(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {/* Kabag Notes */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-[14px] p-4">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-700 mb-2">
                  <Megaphone size={14} /> Instruksi Kepala Bagian
                </div>
                {userRole === 'kabag' ? (
                  <div className="space-y-3">
                    <textarea
                      value={tempInstruction}
                      onChange={e => setTempInstruction(e.target.value)}
                      placeholder="Ketik instruksi khusus..."
                      className="w-full text-[13px] p-3 bg-white border border-indigo-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 resize-none h-24"
                    />
                    <div className="flex justify-end">
                      <button onClick={handleSaveNotes} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[12px] font-bold transition-all shadow-sm">
                        Simpan Catatan
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-slate-700 italic leading-relaxed">
                    {getBlockNotes(selectedBlock) || 'Belum ada instruksi khusus untuk blok ini.'}
                  </p>
                )}
              </div>

              {/* Jobs */}
              <div>
                <h4 className="metric-label mb-3">Pekerjaan di Blok ({selectedBlock.jobs.length})</h4>
                <div className="space-y-3">
                  {selectedBlock.jobs.map((job, jIdx) => {
                    let theme = 'indigo', icon = 'assignment';
                    const lw = (job.uraian || '').toLowerCase();
                    if (lw.includes('semprot')) { theme = 'cyan'; icon = 'water_drop'; }
                    else if (lw.includes('tanam')) { theme = 'emerald'; icon = 'nature'; }
                    else if (lw.includes('pupuk')) { theme = 'fuchsia'; icon = 'compost'; }
                    else if (lw.includes('panen')) { theme = 'teal'; icon = 'shopping_basket'; }

                    const tc = THEME_MAP[theme] || THEME_MAP['indigo'];
                    const jobCapaian = parseFloat(job.capaian) || 0;

                    return (
                      <div key={jIdx} className="p-4 rounded-[14px] border border-slate-100 bg-white shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className={tc.icon} style={{fontSize:'16px'}}>{icon}</span>
                            <h5 className="text-[13px] font-bold text-slate-800">{job.uraian}</h5>
                          </div>
                          <span className={tc.label}>{jobCapaian.toFixed(0)}%</span>
                        </div>
                        <div className="progress-track">
                          <div className={tc.bar} style={{ width: `${Math.min(100, jobCapaian)}%` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500 pt-1">
                          <p>Rencana: <span className="text-slate-800">{parseFloat(job.rencana).toFixed(1)} Hektar</span></p>
                          <p>Terealisasi: <span className="text-slate-800">{parseFloat(job.realisasiSd).toFixed(1)} Hektar</span></p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
