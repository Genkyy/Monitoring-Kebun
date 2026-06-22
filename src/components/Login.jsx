import React, { useState } from 'react';
import { Sprout, ArrowRight, User, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../lib/api';

export default function Login({ onLogin }) {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userData = await loginUser(username, password);
      onLogin(userData);
    } catch (err) {
      setError(err.message || 'Username atau Password salah. Periksa kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center font-sans relative overflow-hidden bg-slate-900"
    >
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-bg-realistic.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Main Glass Modal */}
      <div className="relative z-10 w-[90%] max-w-[420px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-[24px] p-8 sm:p-10 animate-fade-up">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-[12px] shadow-lg shadow-emerald-900/50 mb-4">
            <Sprout size={24} />
          </div>
          <h1 className="text-2xl font-800 text-white tracking-tight text-center">Monitoring Kebun</h1>
          <p className="text-[11px] font-medium text-white/70 mt-1">Industrial Clarity Management</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/30 text-white text-[12px] font-semibold rounded-[12px] backdrop-blur-md">
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-200" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[12px] font-semibold text-white/80">
              <User size={13} /> Username
            </label>
            <input
              required type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-white/20 border border-white/10 focus:border-white/40 focus:bg-white/30 rounded-[10px] py-3 px-4 text-[13px] font-medium text-white placeholder:text-white/50 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-white/80">
                <Lock size={13} /> Password
              </label>
              <a href="#" className="text-[11px] font-semibold text-emerald-400 hover:text-white transition-colors">Forgot?</a>
            </div>
            <div className="relative">
              <input
                required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/20 border border-white/10 focus:border-white/40 focus:bg-white/30 rounded-[10px] py-3 px-4 text-[13px] font-medium text-white placeholder:text-white/50 outline-none transition-all shadow-inner pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full py-3 mt-2 bg-primary hover:bg-emerald-700 disabled:bg-white/20 disabled:text-white/40 text-white rounded-[10px] text-[14px] font-bold shadow-[0_4px_14px_rgba(5,150,105,0.4)] transition-all flex justify-center items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <><span className="material-icons spin-smooth text-[18px]">autorenew</span> Processing...</>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Test Accounts (Visible for ease of testing in portfolio) */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-2">
            <ShieldAlert size={12} className="text-amber-400" />
            Test Account Access (Demo)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillCredentials('staf', 'staf123')} type="button"
              className="py-2.5 px-2 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/10 text-center transition-colors cursor-pointer"
            >
              <p className="text-[9px] sm:text-[10px] font-bold text-white/70">Staf Field</p>
              <p className="text-[10px] sm:text-[11px] font-800 text-white mt-0.5">staf123</p>
            </button>
            <button
              onClick={() => fillCredentials('kabag', 'kabag123')} type="button"
              className="py-2.5 px-2 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/10 text-center transition-colors cursor-pointer"
            >
              <p className="text-[9px] sm:text-[10px] font-bold text-white/70">Kabag Ops</p>
              <p className="text-[10px] sm:text-[11px] font-800 text-white mt-0.5">kabag123</p>
            </button>
            <button
              onClick={() => fillCredentials('admin', 'admin123')} type="button"
              className="py-2.5 px-2 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/10 text-center transition-colors cursor-pointer"
            >
              <p className="text-[9px] sm:text-[10px] font-bold text-white/70">Super Admin</p>
              <p className="text-[10px] sm:text-[11px] font-800 text-white mt-0.5">admin123</p>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] font-medium text-white/60 mt-6">
          Need help? <a href="#" className="text-emerald-400 hover:text-white transition-colors">Contact Administrator</a>
        </p>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 mt-8 flex items-center justify-center gap-3 text-[11px] font-medium text-white/60">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Server Online
        </div>
        <span className="text-white/30">|</span>
        <span>v2.4.0 Production</span>
      </div>
      
    </div>
  );
}
