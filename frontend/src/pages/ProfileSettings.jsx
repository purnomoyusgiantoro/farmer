import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Key, Lock, Mail, Compass, Calendar, Save } from 'lucide-react';

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  
  // States
  const [name, setName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!name.trim()) {
      setError('Nama tidak boleh kosong.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('Password baru minimal 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.');
        return;
      }
    }

    const res = updateProfile(name, newPassword);
    if (res.success) {
      setMessage('Profil Anda berhasil diperbarui!');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(res.message || 'Gagal memperbarui profil.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Profile summary header card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
        {/* Background visual highlight */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl font-bold shadow-md shrink-0">
          {user?.name.charAt(0)}
        </div>
        
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap justify-center sm:justify-start items-center gap-2">
            <Mail className="w-4 h-4 inline" /> {user?.email}
            <span>&bull;</span>
            <span className="capitalize font-bold text-emerald-600 dark:text-emerald-400">{user?.role}</span>
          </p>
        </div>
      </div>

      {/* Forms and Details wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Account Metadata Detail Panel */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 md:col-span-1 h-fit">
          <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
            Detail Informasi
          </h4>
          
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold">Wilayah Kerja:</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-slate-400" />
                {user?.region || '-'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold">Tanggal Terdaftar:</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form Panel */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm md:col-span-2 space-y-5">
          <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-700">
            Pengaturan Akun &amp; Password
          </h4>

          {message && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl text-xs text-emerald-600 dark:text-emerald-400">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserCircle className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700/80 pt-4 space-y-4">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ganti Password Baru (Kosongkan jika tidak diubah)
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Profil
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
