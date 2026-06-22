import React from 'react';
import { Edit2, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/* ─── Sparkline SVG (mini area chart) ── */
function Sparkline({ color = '#059669', trend = 'up' }) {
  const upPath    = "M0,26 L12,20 L24,23 L36,14 L48,18 L60,10 L72,7 L80,4";
  const downPath  = "M0,6 L12,10 L24,8 L36,16 L48,13 L60,20 L72,22 L80,26";
  const flatPath  = "M0,14 L12,16 L24,13 L36,15 L48,14 L60,15 L72,13 L80,14";
  const path = trend === 'up' ? upPath : trend === 'down' ? downPath : flatPath;
  const fillEnd = trend === 'up' ? 28 : trend === 'down' ? 28 : 28;

  return (
    <svg viewBox="0 0 80 30" className="w-20 h-7" aria-hidden="true">
      <defs>
        <linearGradient id={`fill-${trend}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L80,${fillEnd} L0,${fillEnd} Z`}
        fill={`url(#fill-${trend})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── KPI Card ── */
function KPICard({ label, value, sub, trend = 'up', color = 'primary', icon, badge }) {
  const colorMap = {
    primary:  { icon: 'icon-box-primary',  spark: '#059669', ring: 'ring-emerald-100', val: 'text-slate-900' },
    blue:     { icon: 'icon-box-blue',     spark: '#3B82F6', ring: 'ring-blue-100',    val: 'text-slate-900' },
    amber:    { icon: 'icon-box-amber',    spark: '#F59E0B', ring: 'ring-amber-100',   val: 'text-slate-900' },
    rose:     { icon: 'icon-box-rose',     spark: '#EF4444', ring: 'ring-rose-100',    val: 'text-slate-900' },
  };
  const c = colorMap[color] || colorMap.primary;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="bento-card bento-card-interactive animate-fade-up">
      <div className="card-pad flex flex-col gap-4">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className={`icon-box ${c.icon}`} aria-hidden="true">
            <span className="material-icons" style={{ fontSize: '18px' }}>{icon}</span>
          </div>
          {badge && <span className="pill pill-muted">{badge}</span>}
        </div>

        {/* Value */}
        <div>
          <p className="metric-label mb-1.5">{label}</p>
          <p className="metric-value">{value}</p>
        </div>

        {/* Bottom: trend + sparkline */}
        <div className="flex items-end justify-between border-t border-slate-50 pt-3">
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${trendColor}`}>
            <TrendIcon size={13} aria-hidden="true" />
            <span>{sub}</span>
          </div>
          <Sparkline color={c.spark} trend={trend} />
        </div>
      </div>
    </div>
  );
}

/* ─── Job Card (Operasional list) ── */
function JobCard({ job, onEdit, onDelete, userRole }) {
  const capaian = parseFloat(job.capaian) || 0;

  let accent = 'bg-emerald-500', iconName = 'assignment', badgeClass = 'pill-primary';
  const lw = (job.uraian || '').toLowerCase();
  if      (lw.includes('semprot')) { accent = 'bg-cyan-500';    iconName = 'water_drop'; badgeClass = 'pill-info'; }
  else if (lw.includes('tanam'))   { accent = 'bg-emerald-500'; iconName = 'nature';      badgeClass = 'pill-primary'; }
  else if (lw.includes('pupuk'))   { accent = 'bg-fuchsia-500'; iconName = 'compost';     badgeClass = 'pill-muted'; }
  else if (lw.includes('panen'))   { accent = 'bg-teal-500';    iconName = 'shopping_basket'; badgeClass = 'pill-primary'; }
  else if (capaian < 50)           { accent = 'bg-red-500';     iconName = 'warning';     badgeClass = 'pill-danger'; }
  else if (capaian < 85)           { accent = 'bg-amber-500';   iconName = 'work';        badgeClass = 'pill-warning'; }
  else                             { accent = 'bg-emerald-500'; iconName = 'task_alt';    badgeClass = 'pill-primary'; }

  const capPct = Math.min(100, capaian);
  const barColor = capaian >= 90 ? 'bg-emerald-500' : capaian >= 60 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="bento-card group relative overflow-hidden animate-fade-up">

      <div className="card-pad pt-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-[13px] font-700 font-bold text-slate-900 leading-snug line-clamp-2">{job.uraian}</h4>
            <p className="text-[11px] text-slate-400 font-medium mt-1">{job.tanggal} · {job.kebun}</p>
          </div>
          <span className={`pill ${badgeClass} shrink-0`}>{capaian.toFixed(0)}%</span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Progress</span>
            <span className="text-[11px] font-bold text-slate-700">{job.realisasiSd} / {job.rencana} Hektar</span>
          </div>
          <div className="progress-track">
            <div
              className={`${barColor} h-full rounded-full animate-progress-in`}
              style={{ width: `${capPct}%`, animation: 'progress-fill 0.9s ease-out forwards' }}
              role="progressbar" aria-valuenow={capPct} aria-valuemin={0} aria-valuemax={100}
            />
          </div>
        </div>

        {/* Stats grid */}
        <dl className="grid grid-cols-3 gap-3 text-center border-t border-slate-50 pt-3">
          {[
            { label: 'Blok Hari Ini',     val: job.blokHi  || '-' },
            { label: 'Blok Akumulatif',   val: job.blokSd  || '-' },
            { label: 'Real. Hari Ini',    val: `${parseFloat(job.realisasiHi).toFixed(1)} Hektar` },
          ].map((s, i) => (
            <div key={i} className="space-y-0.5">
              <dt className="text-[9px] font-700 font-bold uppercase tracking-wider text-slate-400">{s.label}</dt>
              <dd className="text-[12px] font-bold text-slate-700">{s.val}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Edit / Delete — hover reveal */}
      {userRole === 'staf' && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onEdit(job)}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 flex items-center justify-center shadow-sm transition-all cursor-pointer"
            aria-label={`Edit ${job.uraian}`}>
            <Edit2 size={12} />
          </button>
          <button onClick={() => onDelete(job)}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center shadow-sm transition-all cursor-pointer"
            aria-label={`Hapus ${job.uraian}`}>
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ── */
export default function DashboardContent({
  data, onEdit, onDelete, onResetAll,
  userRole = 'staf', showOnlySummary = false, showOnlyList = false
}) {
  let totalRencana = 0, totalRealisasi = 0;
  data.forEach(item => {
    totalRencana   += parseFloat(item.rencana)    || 0;
    totalRealisasi += parseFloat(item.realisasiSd) || 0;
  });

  const capaianPct = totalRencana > 0 ? ((totalRealisasi / totalRencana) * 100) : 0;
  const sisaTarget  = Math.max(0, totalRencana - totalRealisasi);

  /* ─── KPI Cards (Overview) ── */
  if (!showOnlyList) {
    return (
      <section aria-label="KPI Ringkasan">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            label="Total Rencana"
            value={`${totalRencana.toFixed(1)} Hektar`}
            sub="Target keseluruhan musim"
            trend="flat"
            color="blue"
            icon="description"
          />
          <KPICard
            label="Realisasi Akumulatif"
            value={`${totalRealisasi.toFixed(1)} Hektar`}
            sub={`${capaianPct.toFixed(1)}% dari target`}
            trend={capaianPct >= 70 ? 'up' : 'down'}
            color="primary"
            icon="check_circle"
          />
          <KPICard
            label="Sisa Target"
            value={`${sisaTarget.toFixed(1)} Hektar`}
            sub={sisaTarget === 0 ? 'Semua tercapai!' : 'Perlu diselesaikan'}
            trend={sisaTarget === 0 ? 'up' : 'down'}
            color={sisaTarget === 0 ? 'primary' : 'amber'}
            icon="schedule"
            badge={sisaTarget > 0 ? '⚠ Alert' : undefined}
          />
          <KPICard
            label="Capaian Keseluruhan"
            value={`${capaianPct.toFixed(1)}%`}
            sub={`${data.length} jenis pekerjaan`}
            trend={capaianPct >= 75 ? 'up' : 'down'}
            color={capaianPct >= 75 ? 'primary' : 'rose'}
            icon="leaderboard"
          />
        </div>

        {/* Overall Progress Bar */}
        <div className="bento-card mt-5 animate-fade-up">
          <div className="card-pad">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[13px] font-bold text-slate-800">Progress Keseluruhan Musim Ini</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {totalRealisasi.toFixed(2)} Hektar dari {totalRencana.toFixed(2)} Hektar rencana total
                </p>
              </div>
              <span className={`text-3xl font-black tracking-tight ${capaianPct >= 75 ? 'text-primary' : capaianPct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                {capaianPct.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-pill overflow-hidden">
              <div
                className="h-full rounded-pill bg-gradient-to-r from-primary to-emerald-400"
                style={{ width: `${Math.min(100, capaianPct)}%`, animation: 'progress-fill 1.2s cubic-bezier(0.4,0,0.2,1) forwards' }}
                role="progressbar" aria-valuenow={capaianPct.toFixed(1)} aria-valuemin={0} aria-valuemax={100}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2">
              <span>0%</span>
              <span>Target Musim 100%</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Job Cards (Operasional) ── */
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Rincian Pekerjaan Lapangan</h2>
          <p className="text-sm text-slate-400 mt-0.5">{data.length} pekerjaan tercatat</p>
        </div>
        {userRole === 'staf' && (
          <button onClick={onResetAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-red-50 border border-red-100 text-red-600 text-[12px] font-semibold hover:bg-red-100 transition-colors cursor-pointer"
            aria-label="Reset semua data">
            <span className="material-icons text-sm" aria-hidden="true">delete_sweep</span>
            Reset Semua
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="bento-card">
          <div className="card-pad text-center py-12">
            <p className="text-sm text-slate-400 font-medium">Tidak ada data pekerjaan untuk ditampilkan.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.map((job, idx) => (
            <JobCard key={idx} job={job} onEdit={onEdit} onDelete={onDelete} userRole={userRole} />
          ))}
        </div>
      )}
    </section>
  );
}
