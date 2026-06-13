import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Mail, ChevronRight, User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Harap isi semua kolom.');
      return;
    }

    const res = login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  // Preset accounts for reviewers
  const presets = [
    { name: 'Budi Santoso', role: 'petani', email: 'petani@portal.com', desc: 'Kelola lahan, sewa alat, & catat kegiatan' },
    { name: 'Siti Aminah', role: 'pengurus', email: 'pengurus@portal.com', desc: 'Kelola alat tani, sewa, & organisasi' },
    { name: 'Dr. Hendra', role: 'bpp', email: 'bpp@portal.com', desc: 'Verifikasi lahan & buat berita tani' },
    { name: 'Rian Pratama', role: 'admin', email: 'admin@portal.com', desc: 'Kelola user, audit log, & backup/restore' }
  ];

  const handlePresetClick = (preset) => {
    setEmail(preset.email);
    setPassword('password123');
    
    // Auto login for better UX
    setTimeout(() => {
      const res = login(preset.email, 'password123');
      if (res.success) {
        navigate('/');
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Decorative branding side panel */}
      <div className="md:w-1/2 bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex flex-col justify-between p-8 md:p-12 relative overflow-hidden">
        {/* Abstract farm patterns in SVG background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl">
            🌾
          </div>
          <span className="font-bold text-xl tracking-wider">PORTAL PETANI</span>
        </div>

        <div className="my-auto py-12 relative z-10 max-w-lg">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
            Digitalisasi Ekosistem Pertanian Nasional.
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            Menghubungkan Petani, Pengurus Koperasi, Balai Penyuluhan Pertanian (BPP), dan Admin dalam satu wadah manajemen terintegrasi.
          </p>
        </div>

        <div className="text-xs text-emerald-200/80 relative z-10">
          &copy; 2026 Kementerian Pertanian & Koperasi. All rights reserved.
        </div>
      </div>

      {/* Main Login / Preset forms panel */}
      <div className="md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Selamat Datang</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-sm">
              Silakan login ke akun Anda atau klik preset demo di bawah untuk masuk cepat.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@portal.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
            >
              Masuk Portal
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Account Demo Presets */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
              Uji Coba Demo Akun (Klik untuk Masuk Cepat)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="flex flex-col text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {preset.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {preset.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
