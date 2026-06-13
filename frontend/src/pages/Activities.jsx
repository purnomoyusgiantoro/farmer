import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../db/mockDb';
import { 
  Calendar, Sprout, Plus, Search, ChevronRight, Info, Filter,
  TrendingUp, Sparkles, BookOpen, Clock
} from 'lucide-react';

export default function Activities() {
  const { user, isPetani } = useAuth();
  const location = useLocation();
  
  // States
  const [activities, setActivities] = useState([]);
  const [lands, setLands] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filters
  const [selectedLandFilter, setSelectedLandFilter] = useState('Semua');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields
  const [actLandId, setActLandId] = useState('');
  const [actDate, setActDate] = useState('');
  const [actType, setActType] = useState('penanaman');
  const [actDesc, setActDesc] = useState('');

  const loadData = async () => {
    setActivities(await mockDb.getAll('activities') || []);
    setLands(await mockDb.getAll('lands') || []);
    setUsers(await mockDb.getAll('users') || []);
  };

  useEffect(() => {
    loadData();
    
    // Auto-open add activity modal if URL query param add=true
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true' && isPetani) {
      const ownLands = mockDb.getAll('lands').filter(l => l.owner_id === user.id);
      if (ownLands.length > 0) {
        setActLandId(ownLands[0].id);
        setActDate(new Date().toISOString().split('T')[0]);
        setIsFormOpen(true);
      }
    }
  }, [location.search]);

  // Handle Add Activity
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actLandId || !actDate || !actDesc) {
      alert('Harap lengkapi semua kolom log aktivitas.');
      return;
    }

    await mockDb.insert('activities', {
      petani_id: user.id,
      land_id: actLandId,
      date: actDate,
      type: actType,
      description: actDesc
    }, user.id);

    setIsFormOpen(false);
    setActDesc('');
    loadData();
  };

  // Filter activities
  const visibleActivities = activities.filter(act => {
    // Petani: see own only
    if (isPetani && act.petani_id !== user.id) return false;
    
    // Land filter
    if (selectedLandFilter !== 'Semua' && act.land_id !== selectedLandFilter) return false;

    // Type filter
    if (selectedTypeFilter !== 'Semua' && act.type !== selectedTypeFilter) return false;

    // Search query
    const land = lands.find(l => l.id === act.land_id);
    const farmer = users.find(u => u.id === act.petani_id);
    const searchString = `${act.description} ${land?.name || ''} ${farmer?.name || ''}`.toLowerCase();
    
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getActivityBadge = (type) => {
    const badges = {
      penanaman: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800',
      pemupukan: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-800',
      pemanenan: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800',
      irigasi: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800',
      lainnya: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    };
    return badges[type] || 'bg-slate-100 text-slate-800';
  };

  const getFarmingTips = () => {
    const tips = [
      'Gunakan sistem pengairan bergilir pada saat memasuki fase generatif padi IR64.',
      'Lakukan pemupukan kedua (UREA + KCl) pada umur 21-28 hari setelah tanam.',
      'Gunakan pupuk organik cair buatan sendiri untuk mengurangi ketergantungan urea subsidi.'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  return (
    <div className="space-y-8">
      
      {/* Tip panel for farmers */}
      {isPetani && (
        <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-5 flex gap-4 items-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-primary shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase text-brand-primary tracking-wider">Tips Penyuluhan BPP Hari Ini</h4>
            <p className="text-base font-medium text-ink-main mt-1 leading-relaxed">{getFarmingTips()}</p>
          </div>
        </div>
      )}

      {/* Filter and control panel */}
      <div className="bg-surface-card p-6 rounded-2xl shadow-sm border border-border-subtle space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-ink-muted" />
            <input
              type="text"
              placeholder="Cari kata kunci aktivitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-border-subtle bg-surface-bg text-ink-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {isPetani && (
            <button
              onClick={() => {
                const ownLands = lands.filter(l => l.owner_id === user.id);
                if (ownLands.length === 0) {
                  alert('Mohon daftarkan lahan terlebih dahulu di menu "Lahan Tani".');
                  return;
                }
                setActLandId(ownLands[0].id);
                setActDate(new Date().toISOString().split('T')[0]);
                setIsFormOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-colors self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              Catat Log Baru
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Filter Lahan:</span>
            <select
              value={selectedLandFilter}
              onChange={(e) => setSelectedLandFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300"
            >
              <option value="Semua">Semua Bidang</option>
              {lands.filter(l => !isPetani || l.owner_id === user.id).map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter Jenis:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-855 text-slate-700 dark:text-slate-300"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="penanaman">Penanaman</option>
              <option value="pemupukan">Pemupukan</option>
              <option value="pemanenan">Pemanenan</option>
              <option value="irigasi">Irigasi</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

      </div>

      {/* Activity Timeline list */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle p-6 md:p-8 shadow-sm">
        <h4 className="text-lg font-bold text-ink-main mb-8 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-brand-primary" />
          Catatan Harian Produktivitas Tani
        </h4>

        {visibleActivities.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-ink-muted mx-auto mb-4" />
            <p className="text-ink-muted text-base">Tidak ada log aktivitas terdaftar untuk kategori/lahan ini.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleActivities.sort((a,b) => new Date(b.date) - new Date(a.date)).map((act, index) => {
              const land = lands.find(l => l.id === act.land_id);
              const farmer = users.find(u => u.id === act.petani_id);
              const isLast = index === visibleActivities.length - 1;
              
              return (
                <div key={act.id} className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 ${!isLast ? 'border-b border-border-subtle' : ''}`}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-ink-main uppercase tracking-wide">
                        {act.type}
                      </span>
                      <span className="text-ink-muted">&bull;</span>
                      <span className="text-sm font-bold text-ink-main">
                        {land?.name || 'Lahan Pertanian'}
                      </span>
                      
                      {!isPetani && (
                        <span className="text-sm text-ink-muted font-medium">
                          &bull; Oleh: {farmer?.name} ({farmer?.region})
                        </span>
                      )}
                    </div>

                    <p className="text-base text-ink-main leading-relaxed max-w-3xl">{act.description}</p>
                  </div>

                  <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between pt-2 sm:pt-0">
                    <span className="text-sm font-bold text-ink-main">
                      {new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-sm text-ink-muted sm:mt-1">
                      Jam: {new Date(act.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Catat Log Aktivitas Harian
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Lahan Yang Dikerjakan
                </label>
                <select
                  value={actLandId}
                  onChange={(e) => setActLandId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {lands.filter(l => l.owner_id === user.id).map(land => (
                    <option key={land.id} value={land.id}>{land.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Jenis Kegiatan
                  </label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="penanaman">Penanaman</option>
                    <option value="pemupukan">Pemupukan</option>
                    <option value="pemanenan">Pemanenan</option>
                    <option value="irigasi">Irigasi</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Deskripsi Singkat Pekerjaan
                </label>
                <textarea
                  rows="3"
                  placeholder="Misalnya: Menyemprot pupuk NPK cair di seluruh petak barat, kondisi cuaca cerah berawan..."
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
