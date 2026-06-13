import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../db/mockDb';
import { 
  Settings, Users, Database, FileText, Plus, Search, 
  CheckCircle2, XCircle, Download, Upload, ShieldAlert, Key
} from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  
  // States
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  // Modals / Forms
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  // Form fields
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('petani');
  const [newRegion, setNewRegion] = useState('Jawa Barat');
  const [newPassword, setNewPassword] = useState('password123');

  const loadData = async () => {
    setUsers(await mockDb.getAll('users') || []);
    setLogs(await mockDb.getAll('system_logs') || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) {
      alert('Nama, Email, dan Password wajib diisi.');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === newEmail.toLowerCase());
    if (emailExists) {
      alert('Email sudah digunakan oleh pengguna lain.');
      return;
    }

    await mockDb.insert('users', {
      name: newName,
      email: newEmail.toLowerCase(),
      password: newPassword,
      role: newRole,
      region: newRegion,
      status: 'active'
    }, user.id);

    setIsAddUserOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPassword('password123');
    loadData();
  };

  // Toggle user active/blocked status
  const handleToggleUserStatus = async (targetUser) => {
    if (targetUser.id === user.id) {
      alert('Anda tidak bisa menonaktifkan akun Admin Anda sendiri.');
      return;
    }

    const nextStatus = targetUser.status === 'active' ? 'blocked' : 'active';
    await mockDb.update('users', targetUser.id, {
      status: nextStatus
    }, user.id);
    
    loadData();
  };

  // Trigger JSON Backup download
  const handleExportBackup = async () => {
    const backupJson = await mockDb.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `farmers_portal_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    loadData();
  };

  // Handle JSON Restore upload
  const handleImportBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonContent = event.target.result;
      const res = await mockDb.restoreBackup(jsonContent, user.id);
      
      if (res.success) {
        alert(res.message);
        // Refresh page to apply updated state
        window.location.reload();
      } else {
        alert(`Gagal memuat backup: ${res.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Filter Users
  const filteredUsers = users.filter(u => {
    const searchString = `${u.name} ${u.email} ${u.role} ${u.region}`.toLowerCase();
    return searchString.includes(userSearch.toLowerCase());
  });

  // Filter Logs
  const filteredLogs = logs.filter(log => {
    const searchString = `${log.user_name} ${log.user_email} ${log.action} ${log.entity}`.toLowerCase();
    return searchString.includes(logSearch.toLowerCase());
  });

  const getRoleColor = (role) => {
    const colors = {
      petani: 'bg-brand-primary/10 text-brand-primary',
      pengurus: 'bg-amber-50 text-amber-700',
      bpp: 'bg-blue-50 text-blue-700',
      admin: 'bg-rose-50 text-rose-700'
    };
    return colors[role] || 'bg-surface-bg text-ink-muted';
  };

  return (
    <div className="space-y-8">
      
      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-border-subtle">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-4 font-bold text-base border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-ink-muted hover:text-ink-main'
          }`}
        >
          <Users className="w-5 h-5" />
          Akun Pengguna
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-4 font-bold text-base border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'logs' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-ink-muted hover:text-ink-main'
          }`}
        >
          <FileText className="w-5 h-5" />
          Audit Log Sistem
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-6 py-4 font-bold text-base border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'backup' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-ink-muted hover:text-ink-main'
          }`}
        >
          <Database className="w-5 h-5" />
          Backup &amp; Restore
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-surface-card p-6 rounded-2xl shadow-sm border border-border-subtle">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-ink-muted" />
              <input
                type="text"
                placeholder="Cari nama, email, region..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-border-subtle bg-surface-bg text-ink-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="bg-brand-primary hover:bg-brand-hover text-white font-bold text-base px-5 py-3 rounded-lg shadow-sm flex items-center gap-2 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              Daftarkan Pengguna
            </button>
          </div>

          <div className="bg-surface-card rounded-2xl border border-border-subtle overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-ink-muted text-xs font-bold uppercase tracking-wider bg-surface-bg">
                    <th className="p-5">Nama Lengkap</th>
                    <th className="p-5">Alamat Email</th>
                    <th className="p-5">Peran (Role)</th>
                    <th className="p-5">Wilayah Kerja</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-ink-main">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-surface-bg transition-colors">
                      <td className="p-5 font-bold">{u.name}</td>
                      <td className="p-5 text-ink-muted font-medium">{u.email}</td>
                      <td className="p-5">
                        <span className={`inline-block px-3 py-1 rounded-md text-[11px] uppercase font-bold ${getRoleColor(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-5 text-sm font-bold">{u.region}</td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase font-bold border ${
                          u.status === 'active'
                            ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {u.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {u.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`text-sm font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                              : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20'
                          }`}
                        >
                          {u.status === 'active' ? 'Blokir' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="relative max-w-sm bg-surface-card rounded-2xl shadow-sm border border-border-subtle">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-ink-muted" />
            <input
              type="text"
              placeholder="Cari log nama, aksi, entitas..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-transparent bg-transparent text-ink-main focus:outline-none"
            />
          </div>

          <div className="bg-surface-card rounded-2xl border border-border-subtle overflow-hidden shadow-sm p-6">
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3">
              {filteredLogs.length === 0 ? (
                <p className="text-ink-muted text-base text-center py-12">Tidak ada audit log ditemukan.</p>
              ) : (
                filteredLogs.map((log, index) => {
                  const isLast = index === filteredLogs.length - 1;
                  return (
                  <div key={log.id} className={`text-sm p-4 hover:bg-surface-bg transition-colors flex items-start justify-between gap-4 ${!isLast ? 'border-b border-border-subtle' : ''}`}>
                    <div>
                      <span className="font-extrabold text-ink-main">{log.user_name}</span>{' '}
                      <span className="text-ink-muted font-semibold">({log.user_email})</span>{' '}
                      <span className="text-ink-muted">melakukan</span>{' '}
                      <span className="px-2 py-0.5 rounded bg-surface-bg text-ink-main font-mono font-bold uppercase text-[11px]">{log.action}</span>{' '}
                      <span className="text-ink-muted">pada tabel</span>{' '}
                      <span className="font-semibold text-ink-main">{log.entity}</span>{' '}
                      <span className="text-ink-muted">ID:</span>{' '}
                      <span className="font-mono text-xs text-brand-primary">{log.entity_id}</span>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="block text-xs text-ink-muted font-bold font-mono">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </span>
                      <span className="block text-[10px] text-ink-muted font-medium mt-1">IP: {log.ip_address}</span>
                    </div>
                  </div>
                )})
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Backup Panel */}
          <div className="bg-surface-card p-8 rounded-2xl border border-border-subtle shadow-sm space-y-5">
            <div className="w-14 h-14 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
              <Download className="w-7 h-7" />
            </div>
            
            <h4 className="font-bold text-xl text-ink-main">Ekspor Data Portal (Backup)</h4>
            <p className="text-sm text-ink-muted leading-relaxed">
              Unduh seluruh snapshot database portal pertanian (mencakup data akun, sawah, riwayat sewa alat, berita, log, dan org structure) dalam satu file format JSON terkompresi.
            </p>
            
            <button
              onClick={handleExportBackup}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold text-base py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              Unduh File Backup (.json)
            </button>
          </div>

          {/* Restore Panel */}
          <div className="bg-surface-card p-8 rounded-2xl border border-border-subtle shadow-sm space-y-5">
            <div className="w-14 h-14 rounded-xl bg-ink-main text-white flex items-center justify-center font-bold">
              <Upload className="w-7 h-7" />
            </div>
            
            <h4 className="font-bold text-xl text-ink-main">Impor Data Portal (Restore)</h4>
            <p className="text-sm text-ink-muted leading-relaxed">
              Unggah file backup JSON portal Anda untuk mengembalikan seluruh basis data ke kondisi sebelumnya. Tindakan ini akan menimpa data portal saat ini.
            </p>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                id="restore-file-input"
              />
              <label
                htmlFor="restore-file-input"
                className="w-full bg-ink-main hover:bg-ink-muted text-white font-bold text-base py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5" />
                Pilih File &amp; Restore (.json)
              </label>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
              <span className="font-medium">Peringatan: Proses ini menimpa data LocalStorage Anda. Harap pastikan format file valid hasil ekspor cadangan database portal.</span>
            </div>
          </div>
        </div>
      )}

      {/* Register User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Daftarkan Akun Pengguna Baru
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="e.g. Joko Susilo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. joko@portal.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Peran (Role)
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="petani">Petani</option>
                    <option value="pengurus">Pengurus</option>
                    <option value="bpp">BPP</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Wilayah Kerja
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jawa Barat"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-slate-400" /> Password Akses
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md"
                >
                  Daftarkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
