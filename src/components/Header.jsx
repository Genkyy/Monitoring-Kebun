import React, { useState, useRef, useEffect } from 'react';
import {
  Sprout, BarChart2, Layers, GitBranch, ShieldCheck, Users,
  LogOut, ChevronDown, Download, Plus, FileUp, PenLine,
  Menu, X, ChevronRight
} from 'lucide-react';

const ROLE_CONFIG = {
  staf:  { label: 'Staf Lapangan', color: 'text-emerald-700 bg-emerald-100', dot: 'bg-emerald-500' },
  kabag: { label: 'Kepala Bagian', color: 'text-blue-700 bg-blue-100',       dot: 'bg-blue-500' },
  admin: { label: 'Super Admin',   color: 'text-purple-700 bg-purple-100',   dot: 'bg-purple-500' },
};

const NAV_TABS = [
  { key: 'overview',    label: 'Ringkasan',    icon: BarChart2,   roles: ['staf', 'kabag', 'admin'], desc: 'KPI & heatmap lapangan' },
  { key: 'operasional', label: 'Operasional',  icon: Layers,      roles: ['staf', 'kabag', 'admin'], desc: 'Daftar rinci pekerjaan' },
  { key: 'kanban',      label: 'Alur Produksi',icon: GitBranch,   roles: ['staf', 'kabag', 'admin'], desc: 'Lacak tahapan proses' },
  { key: 'qc',          label: 'Kontrol Mutu', icon: ShieldCheck, roles: ['staf', 'kabag', 'admin'], desc: 'Hasil pemeriksaan kualitas' },
  { key: 'admin',       label: 'Pengguna',     icon: Users,       roles: ['admin'],                  desc: 'Kelola akun pengguna' },
];

/* ── Dropdown ── */
function Dropdown({ trigger, items, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">{trigger(open)}</div>
      {open && (
        <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-56 bg-white rounded-[14px] shadow-[0px_4px_6px_rgba(15,23,42,0.04),0px_12px_32px_rgba(15,23,42,0.12)] border border-slate-100 z-50 overflow-hidden py-1.5`} role="menu">
          {items.map((item, i) => item === 'divider'
            ? <div key={i} className="h-px bg-slate-100 my-1.5" />
            : (
              <button key={i} onClick={() => { item.action(); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer text-left
                  ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}
                role="menuitem">
                {item.icon && <item.icon size={15} className="shrink-0 text-slate-400" />}
                <div>
                  <p className="font-semibold text-[13px]">{item.label}</p>
                  {item.desc && <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>}
                </div>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sidebar ── */
function Sidebar({ activeTab, setActiveTab, user, onLogout, mobileOpen, onMobileClose }) {
  const roleConf  = ROLE_CONFIG[user?.role] || ROLE_CONFIG['staf'];
  const visibleTabs = NAV_TABS.filter(t => t.roles.includes(user?.role));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-[12px] bg-primary flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
          <Sprout size={18} className="text-white" />
        </div>
        <div className="leading-none min-w-0">
          <p className="text-[14px] font-extrabold tracking-tight text-slate-900 truncate">Kebun Enterprise</p>
          <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">Smart Dashboard</p>
        </div>
        {/* Mobile close */}
        {mobileOpen && (
          <button onClick={onMobileClose} className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 lg:hidden cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Navigasi utama">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu</p>
        {visibleTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); onMobileClose?.(); }}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left transition-all duration-150 cursor-pointer group
                ${isActive
                  ? 'bg-primary text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-semibold truncate ${isActive ? 'text-white' : ''}`}>{tab.label}</p>
                <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>{tab.desc}</p>
              </div>
              {isActive && <ChevronRight size={13} className="text-emerald-200 shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      <div className="px-3 py-4 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-[12px] hover:bg-slate-50 transition-colors group">
          <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-xs font-black shrink-0 ${roleConf.color}`}>
            {(user?.name || 'U').substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-800 truncate">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${roleConf.dot}`} />
              <p className="text-[10px] text-slate-400 font-medium">{roleConf.label}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar dari sistem"
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
            aria-label="Keluar"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-[260px] bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

/* ── Page Topbar (contextual actions) ── */
export function PageTopbar({ activeTab, user, onImportManual, onImportExcel, onExportExcel, onExportImage, onMobileMenuOpen }) {
  const addDataItems = [
    { label: 'Input Manual',       icon: PenLine, action: onImportManual, desc: 'Ketik data langsung di form' },
    { label: 'Import dari Excel',  icon: FileUp,  action: onImportExcel,  desc: 'Upload file .xlsx dari komputer' },
  ];
  const exportItems = [
    { label: 'Ekspor ke Excel',        icon: Download, action: onExportExcel },
    { label: 'Ekspor sebagai Gambar',  icon: Download, action: onExportImage },
  ];

  const TAB_META = {
    overview:    { title: 'Ringkasan Dashboard',    subtitle: 'Lihat KPI utama, heatmap blok, dan progress keseluruhan musim ini.' },
    operasional: { title: 'Data Operasional',       subtitle: 'Daftar rinci semua pekerjaan lapangan — edit atau hapus data di sini.' },
    kanban:      { title: 'Alur Produksi',          subtitle: 'Pantau status tiap batch dari Belum Mulai hingga Selesai.' },
    qc:          { title: 'Kontrol Mutu',           subtitle: 'Input dan pantau hasil pemeriksaan kualitas (QC) per batch.' },
    admin:       { title: 'Manajemen Pengguna',     subtitle: 'Kelola akun dan hak akses pengguna sistem.' },
  };
  const meta = TAB_META[activeTab] || TAB_META.overview;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-[0px_1px_2px_rgba(15,23,42,0.04)]">
      <div className="px-5 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Mobile hamburger + Page title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden p-2 rounded-[10px] hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer shrink-0"
            aria-label="Buka menu navigasi"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-[17px] font-extrabold text-slate-900 tracking-tight truncate">{meta.title}</h1>
            <p className="text-[11px] text-slate-400 font-medium truncate hidden sm:block">{meta.subtitle}</p>
          </div>
        </div>

        {/* Right: contextual actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Export */}
          <Dropdown
            align="right"
            items={exportItems}
            trigger={(open) => (
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold transition-all border cursor-pointer
                ${open ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}>
                <Download size={13} />
                <span className="hidden sm:inline">Ekspor</span>
                <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
              </div>
            )}
          />

          {/* + Tambah Data — staf only */}
          {user?.role === 'staf' && (
            <Dropdown
              align="right"
              items={addDataItems}
              trigger={(open) => (
                <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold transition-all cursor-pointer
                  ${open ? 'bg-emerald-700' : 'bg-primary hover:bg-emerald-700'}
                  text-white shadow-md shadow-emerald-600/25`}>
                  <Plus size={14} />
                  <span>Tambah Data</span>
                  <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                </div>
              )}
            />
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Default export: combined layout wrapper ── */
export default function Layout({ activeTab, setActiveTab, user, onLogout, onImportManual, onImportExcel, onExportExcel, onExportImage, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F1F5F9]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <PageTopbar
          activeTab={activeTab}
          user={user}
          onImportManual={onImportManual}
          onImportExcel={onImportExcel}
          onExportExcel={onExportExcel}
          onExportImage={onExportImage}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-5 lg:px-8 py-8">
          {children}
        </main>
        <footer className="px-5 lg:px-8 py-5 border-t border-slate-200/60 bg-transparent">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] font-semibold text-slate-400">
              © 2026 <span className="text-slate-600">Kebun Enterprise</span>. Hak Cipta Dilindungi.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full text-[11px] font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif & Terhubung
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
