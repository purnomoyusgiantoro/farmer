import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../db/mockDb';
import { 
  Sprout, Key, Calendar, ShieldCheck, FileText, CheckCircle2, 
  Clock, AlertCircle, PlusCircle, ArrowRight, UserPlus, ListCollapse, Database
} from 'lucide-react';

export default function Dashboard() {
  const { user, isPetani, isPengurus, isBPP, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Load stats from MockDB
  const [lands, setLands] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [news, setNews] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const landsData = await mockDb.getAll('lands');
      const eqData = await mockDb.getAll('equipment');
      const rentData = await mockDb.getAll('rental_requests');
      const actData = await mockDb.getAll('activities');
      const newsData = await mockDb.getAll('news');
      const logData = await mockDb.getAll('system_logs');
      const usrData = await mockDb.getAll('users');

      setLands(landsData || []);
      setEquipment(eqData || []);
      setRentals(rentData || []);
      setActivities(actData || []);
      setNews((newsData || []).slice(0, 3));
      setLogs((logData || []).slice(0, 5));
      setUsers(usrData || []);
    };
    loadData();
  }, []);

  // Filter own data if farmer
  const ownLands = lands.filter(l => l.owner_id === user.id);
  const ownRentals = rentals.filter(r => r.requester_id === user.id);
  const ownActivities = activities.filter(a => a.petani_id === user.id);

  // Statistics Computations
  const totalArea = ownLands.reduce((acc, curr) => acc + curr.area_ha, 0);
  const pendingRentalsCount = rentals.filter(r => r.status === 'pending').length;
  const pendingLandsVerificationCount = lands.filter(l => l.verification_status === 'pending').length;

  const renderPetaniDashboard = () => (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Lahan</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{totalArea.toFixed(1)} <span className="text-sm font-medium">Hektar</span></h3>
            <span className="text-emerald-500 dark:text-emerald-400 text-xs font-medium mt-1 inline-block">{ownLands.length} bidang tanah aktif</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Sewa Alat Tani</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {ownRentals.filter(r => r.status === 'approved').length} <span className="text-sm font-medium">Disetujui</span>
            </h3>
            <span className="text-amber-500 text-xs font-medium mt-1 inline-block">
              {ownRentals.filter(r => r.status === 'pending').length} pengajuan menunggu persetujuan
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Aktivitas Bulanan</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{ownActivities.length} <span className="text-sm font-medium">Kegiatan</span></h3>
            <span className="text-slate-500 dark:text-slate-400 text-xs mt-1 inline-block">Mencakup pemupukan, tanam, & panen</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold">Butuh Alat Tambahan atau Catat Log Hari Ini?</h4>
          <p className="text-emerald-100/90 text-sm mt-1">Gunakan akses cepat untuk mempercepat pendataan sawah dan meminjam mesin tani.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/activities?add=true" className="bg-white text-emerald-700 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Catat Aktivitas
          </Link>
          <Link to="/equipment" className="bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-500 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
            <Key className="w-4 h-4" />
            Sewa Peralatan
          </Link>
        </div>
      </div>

      {/* Lands & Activities list grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lands list */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 dark:text-white">Lahan Saya</h4>
            <Link to="/lands" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {ownLands.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Belum ada lahan pertanian terdaftar.</p>
          ) : (
            <div className="space-y-3">
              {ownLands.map(land => (
                <div key={land.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/30 flex items-center justify-between border border-slate-100 dark:border-slate-700/50">
                  <div>
                    <h5 className="font-semibold text-sm">{land.name}</h5>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{land.area_ha} Ha &bull; {land.location.split(' (')[1]?.replace(')', '') || land.location}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    land.verification_status === 'verified' 
                      ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }`}>
                    {land.verification_status === 'verified' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {land.verification_status === 'verified' ? 'Terverifikasi' : 'Menunggu'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 dark:text-white">Aktivitas Terkini</h4>
            <Link to="/activities" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {ownActivities.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Belum ada catatan aktivitas.</p>
          ) : (
            <div className="space-y-3">
              {ownActivities.slice(0, 3).map(act => {
                const land = lands.find(l => l.id === act.land_id);
                return (
                  <div key={act.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/30 flex items-start justify-between border border-slate-100 dark:border-slate-700/50">
                    <div>
                      <h5 className="font-semibold text-sm capitalize">{act.type} &ndash; {land?.name || 'Lahan'}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{act.description}</p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2">
                      {new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPengurusDashboard = () => (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Antrean Sewa</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {pendingRentalsCount} <span className="text-sm font-medium">Pengajuan</span>
            </h3>
            <span className="text-amber-500 text-xs font-semibold mt-1 inline-block">Butuh persetujuan segera</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Lahan Region</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {lands.reduce((acc, curr) => acc + curr.area_ha, 0).toFixed(1)} <span className="text-sm font-medium">Ha</span>
            </h3>
            <span className="text-slate-500 dark:text-slate-400 text-xs mt-1 inline-block">{lands.length} bidang tanah terdaftar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Katalog Inventaris</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {equipment.length} <span className="text-sm font-medium">Tipe Alat</span>
            </h3>
            <span className="text-emerald-500 text-xs font-medium mt-1 inline-block">
              {equipment.reduce((acc, curr) => acc + curr.quantity_available, 0)} unit siap disewa
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action alerts if there are pending rentals */}
      {pendingRentalsCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm md:text-base">Pengajuan Sewa Alat Menunggu Persetujuan</h4>
            <p className="text-amber-700 dark:text-amber-500/80 text-xs md:text-sm mt-0.5">Ada {pendingRentalsCount} petani yang mengajukan peminjaman alat tani untuk periode masa tanam ini. Mohon verifikasi kelayakan dan ketersediaan unit.</p>
            <Link to="/equipment" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline">
              Buka Manajemen Sewa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick panel for rentals & lands */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending rentals queue */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 dark:text-white">Pengajuan Sewa Terbaru</h4>
            <Link to="/equipment" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              Kelola Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {rentals.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Belum ada pengajuan sewa.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-2.5">Petani</th>
                    <th className="py-2.5">Alat</th>
                    <th className="py-2.5">Tanggal</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {rentals.slice(0, 4).map(rent => {
                    const requester = users.find(u => u.id === rent.requester_id);
                    const item = equipment.find(e => e.id === rent.equipment_id);
                    return (
                      <tr key={rent.id} className="text-slate-700 dark:text-slate-300">
                        <td className="py-3 font-semibold">{requester?.name || 'Petani'}</td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">{item?.name || 'Alat'}</td>
                        <td className="py-3 text-xs">{rent.start_date} s/d {rent.end_date}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                            rent.status === 'approved' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : rent.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>
                            {rent.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Region stats and quick shortcuts */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
          <h4 className="font-bold text-slate-800 dark:text-white">Akses Pengurus</h4>
          <div className="space-y-2">
            <Link to="/equipment" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              <div className="text-left">
                <span className="block font-semibold text-sm">Tambah Inventaris</span>
                <span className="block text-[11px] text-slate-500">Masukkan traktor/mesin baru</span>
              </div>
            </Link>

            <Link to="/org" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
              <ListCollapse className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <span className="block font-semibold text-sm">Ubah Struktur Org</span>
                <span className="block text-[11px] text-slate-500">Edit kepengurusan kelompok tani</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBPPDashboard = () => (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Verifikasi Lahan</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {pendingLandsVerificationCount} <span className="text-sm font-medium">Antrean</span>
            </h3>
            <span className="text-amber-500 text-xs font-semibold mt-1 inline-block">Tinjau keaslian kepemilikan sawah</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Luas Terpantau</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {lands.reduce((acc, curr) => acc + curr.area_ha, 0).toFixed(1)} <span className="text-sm font-medium">Ha</span>
            </h3>
            <span className="text-emerald-500 text-xs font-medium mt-1 inline-block">
              {lands.filter(l => l.verification_status === 'verified').length} bidang tanah terverifikasi
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Berita Disiarkan</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {news.length} <span className="text-sm font-medium">Pengumuman</span>
            </h3>
            <span className="text-slate-500 text-xs mt-1 inline-block">Penyuluhan, info subsidi & kekeringan</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Verify land warning bar */}
      {pendingLandsVerificationCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm md:text-base">Permohonan Verifikasi Sawah Baru</h4>
            <p className="text-amber-700 dark:text-amber-500/80 text-xs md:text-sm mt-0.5">Ada {pendingLandsVerificationCount} bidang tanah baru yang didaftarkan oleh petani dan membutuhkan tinjauan koordinat serta surat kepemilikan oleh BPP.</p>
            <Link to="/lands" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline">
              Buka Daftar Antrean Lahan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-800 dark:text-white">Aktivitas Cepat Balai Penyuluhan</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/lands" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <div className="text-left">
              <span className="block font-semibold text-sm">Verifikasi Lahan Petani</span>
              <span className="block text-xs text-slate-500">Konfirmasi legalitas koordinat GeoJSON sawah</span>
            </div>
          </Link>
          
          <Link to="/news" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
            <FileText className="w-6 h-6 text-blue-500" />
            <div className="text-left">
              <span className="block font-semibold text-sm">Siarkan Berita & Penyuluhan</span>
              <span className="block text-xs text-slate-500">Tulis panduan bertani dan kebijakan terbaru</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Pengguna Terdaftar</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {users.length} <span className="text-sm font-medium">Akun</span>
            </h3>
            <span className="text-emerald-500 text-xs font-medium mt-1 inline-block">
              {users.filter(u => u.status === 'active').length} akun aktif terpantau
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Audit Log</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">
              {logs.length} <span className="text-sm font-medium">Aksi Terbaru</span>
            </h3>
            <span className="text-slate-500 text-xs mt-1 inline-block">Mencatat aktivitas krusial sistem</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider font-sans">Status Database</span>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              Normal
            </h3>
            <span className="text-slate-500 text-xs mt-1 inline-block">Penyimpanan LocalStorage optimal</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Audit log & Users shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 dark:text-white">Audit Log Sistem Terbaru</h4>
            <Link to="/admin" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              Lihat Seluruh Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3.5">
            {logs.map(log => (
              <div key={log.id} className="text-xs flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-2 bg-slate-50/30 dark:bg-slate-800/10 p-2 rounded-lg">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.user_name}</span>{' '}
                  <span className="text-slate-500 dark:text-slate-400">melakukan</span>{' '}
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold">{log.action}</span>{' '}
                  <span className="text-slate-500">pada</span>{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{log.entity} ({log.entity_id})</span>
                </div>
                <span className="text-[10px] text-slate-400 ml-4 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
          <h4 className="font-bold text-slate-800 dark:text-white font-sans">Aksi Administratif</h4>
          <div className="space-y-2">
            <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
              <UserPlus className="w-5 h-5 text-emerald-500" />
              <div className="text-left">
                <span className="block font-semibold text-sm">Kelola Akun</span>
                <span className="block text-[11px] text-slate-500">Ubah peran & blokir pengguna</span>
              </div>
            </Link>
            
            <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
              <Database className="w-5 h-5 text-indigo-500" />
              <div className="text-left">
                <span className="block font-semibold text-sm">Backup / Restore</span>
                <span className="block text-[11px] text-slate-500">Unduh & unggah data portal</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Dynamic Dashboard Body depending on role */}
      {isPetani && renderPetaniDashboard()}
      {isPengurus && renderPengurusDashboard()}
      {isBPP && renderBPPDashboard()}
      {isAdmin && renderAdminDashboard()}

      {/* Latest News Feed Section - Visible to All Roles */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📢</span>
            <h4 className="font-bold text-slate-800 dark:text-white">Berita Tani Terbaru</h4>
          </div>
          <Link to="/news" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            Lihat Semua Berita <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {news.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">Belum ada berita terbit.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {news.map(article => (
              <div key={article.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/20 border border-slate-100 dark:border-slate-700 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1 hover:text-emerald-600 dark:hover:text-emerald-400">
                    <Link to="/news">{article.title}</Link>
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                    {article.content}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/55 dark:border-slate-700/50 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                  <span>Balai Penyuluhan Tani</span>
                  <span>{new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
