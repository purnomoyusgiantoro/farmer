import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../db/mockDb';
import { 
  Sprout, Plus, CheckCircle, Clock, XCircle, Search, Edit3, 
  Trash2, ShieldCheck, History, X, Compass, HelpCircle
} from 'lucide-react';

export default function Lands() {
  const { user, isPetani, isPengurus, isBPP } = useAuth();
  
  // States
  const [lands, setLands] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals / Forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedLandForAudit, setSelectedLandForAudit] = useState(null);
  
  // Form fields
  const [editingLandId, setEditingLandId] = useState(null);
  const [landName, setLandName] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [latitude, setLatitude] = useState('-6.2088');
  const [longitude, setLongitude] = useState('106.8456');

  // Load Data
  const loadData = async () => {
    setLands(await mockDb.getAll('lands') || []);
    setUsers(await mockDb.getAll('users') || []);
    setAuditLogs(await mockDb.getAll('land_edits') || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter based on role and search
  const visibleLands = lands.filter(land => {
    // Petani: see own only
    if (isPetani && land.owner_id !== user.id) return false;
    
    // Search filter
    const owner = users.find(u => u.id === land.owner_id);
    const ownerName = owner ? owner.name.toLowerCase() : '';
    return (
      land.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ownerName.includes(searchTerm.toLowerCase()) ||
      land.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!landName || !areaHa) {
      alert('Nama lahan dan Luas lahan wajib diisi.');
      return;
    }

    const payload = {
      name: landName,
      area_ha: parseFloat(areaHa),
      location: `Latitude: ${latitude}, Longitude: ${longitude}`,
      status: 'active'
    };

    if (editingLandId) {
      // Edit: reset verification status to pending because data changed
      await mockDb.update('lands', editingLandId, {
        ...payload,
        verification_status: 'pending'
      }, user.id);
    } else {
      // New Land
      await mockDb.insert('lands', {
        ...payload,
        owner_id: user.id,
        verification_status: 'pending'
      }, user.id);
    }

    // Reset and reload
    setEditingLandId(null);
    setLandName('');
    setAreaHa('');
    setIsFormOpen(false);
    loadData();
  };

  // Open Edit Form
  const handleEditClick = (land) => {
    setEditingLandId(land.id);
    setLandName(land.name);
    setAreaHa(land.area_ha.toString());
    
    // Parse location
    const coords = land.location.match(/-?\d+\.\d+/g);
    if (coords && coords.length >= 2) {
      setLatitude(coords[0]);
      setLongitude(coords[1]);
    }
    
    setIsFormOpen(true);
  };

  // Open Audit Log
  const handleAuditClick = (land) => {
    setSelectedLandForAudit(land);
    setIsAuditOpen(true);
  };

  // Handle BPP Verification Approve/Reject
  const handleVerify = async (landId, verifyStatus) => {
    await mockDb.update('lands', landId, {
      verification_status: verifyStatus
    }, user.id);
    loadData();
  };

  // Handle Delete
  const handleDelete = async (landId) => {
    if (confirm('Apakah Anda yakin ingin menghapus lahan pertanian ini?')) {
      await mockDb.delete('lands', landId, user.id);
      loadData();
    }
  };

  // Custom visual grid coord click handler
  const handleGridClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Translate click position to realistic Indonesian coords (around Cianjur/West Java)
    const baseLat = -6.7;
    const baseLong = 107.0;
    const offsetLat = (y / rect.height - 0.5) * 0.2;
    const offsetLong = (x / rect.width - 0.5) * 0.2;
    
    setLatitude((baseLat + offsetLat).toFixed(4));
    setLongitude((baseLong + offsetLong).toFixed(4));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama lahan, pemilik, atau koordinat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        {isPetani && (
          <button
            onClick={() => {
              setEditingLandId(null);
              setLandName('');
              setAreaHa('');
              setLatitude('-6.7323');
              setLongitude('107.0432');
              setIsFormOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Daftarkan Lahan Baru
          </button>
        )}
      </div>

      {/* Lands Grid List */}
      {visibleLands.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm text-center border border-slate-100 dark:border-slate-700">
          <Sprout className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-white">Tidak Ada Lahan Ditemukan</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Belum ada bidang tanah pertanian yang terdaftar di sistem yang cocok dengan kriteria Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleLands.map(land => {
            const owner = users.find(u => u.id === land.owner_id);
            const verified = land.verification_status === 'verified';
            const rejected = land.verification_status === 'rejected';
            
            return (
              <div key={land.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                
                {/* Decorative border based on status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  verified ? 'bg-emerald-500' : rejected ? 'bg-rose-500' : 'bg-amber-500'
                }`} />

                <div>
                  {/* Status Badges */}
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold border ${
                      verified 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' 
                        : rejected
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                        : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                    }`}>
                      {verified ? <CheckCircle className="w-3 h-3" /> : rejected ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {land.verification_status}
                    </span>
                    
                    <span className="text-[11px] font-bold text-slate-400 font-mono">#{land.id.split('_')[1] || land.id}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-800 dark:text-white pl-2 line-clamp-1">{land.name}</h3>
                  
                  {/* Land Info Details */}
                  <div className="space-y-1.5 mt-3 pl-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pemilik Lahan:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{owner?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Luas Tanah:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{land.area_ha} Hektar</span>
                    </div>
                    <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/30 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={land.location}>{land.location}</span>
                    </div>
                  </div>
                </div>

                {/* Operations & Control Buttons based on role */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-end gap-2 pl-2">
                  
                  {/* Audit History (All can view, especially Pengurus) */}
                  <button
                    onClick={() => handleAuditClick(land)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                    title="Riwayat Perubahan"
                  >
                    <History className="w-4 h-4" />
                  </button>

                  {/* Petani Operations */}
                  {isPetani && (
                    <>
                      <button
                        onClick={() => handleEditClick(land)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                        title="Edit Data Lahan"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(land.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Hapus Lahan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* BPP Operations (Verify Land) */}
                  {isBPP && !verified && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleVerify(land.id, 'verified')}
                        className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-[11px] font-bold px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Setujui
                      </button>
                      
                      {!rejected && (
                        <button
                          onClick={() => handleVerify(land.id, 'rejected')}
                          className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-[11px] font-bold px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors"
                        >
                          Tolak
                        </button>
                      )}
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Audit Log Modal */}
      {isAuditOpen && selectedLandForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setIsAuditOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              Audit Perubahan: {selectedLandForAudit.name}
            </h3>
            
            <p className="text-xs text-slate-500 mb-4">Mencatat riwayat modifikasi data bidang tanah oleh pemilik atau pengurus.</p>
            
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {auditLogs.filter(log => log.land_id === selectedLandForAudit.id).length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">Belum ada riwayat perubahan data untuk lahan ini.</p>
              ) : (
                auditLogs
                  .filter(log => log.land_id === selectedLandForAudit.id)
                  .map(log => {
                    const editor = users.find(u => u.id === log.editor_id);
                    return (
                      <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
                        <div className="flex justify-between text-slate-400 font-semibold mb-1">
                          <span>Editor: {editor?.name || 'System'} ({editor?.role})</span>
                          <span>{new Date(log.edited_at).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="font-mono text-[11px] bg-slate-100 dark:bg-slate-950 p-2 rounded text-slate-600 dark:text-slate-300">
                          {JSON.stringify(log.changes, null, 2)}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Land Modal (Petani only) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl relative border border-slate-100 dark:border-slate-700 my-8">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              {editingLandId ? 'Edit Data Sawah' : 'Daftarkan Lahan Sawah Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Nama Lahan
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sawah Subur Barat II"
                      value={landName}
                      onChange={(e) => setLandName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Luas Lahan (Hektar)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1.8"
                      value={areaHa}
                      onChange={(e) => setAreaHa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Latitude</label>
                      <input
                        type="text"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Longitude</label>
                      <input
                        type="text"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Coordinate Map Picker */}
                <div className="flex flex-col">
                  <span className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Pilih Koordinat Lahan (Klik Peta Di Bawah)
                  </span>
                  
                  <div 
                    onClick={handleGridClick}
                    className="w-full h-44 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 relative overflow-hidden cursor-crosshair flex flex-col justify-center items-center select-none"
                  >
                    {/* Visual Grid representing crop sectors */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#059669_1px,transparent_1px),linear-gradient(to_bottom,#059669_1px,transparent_1px)] bg-[size:20px_20px]" />
                    
                    {/* Render visual pins */}
                    <div className="absolute w-5 h-5 text-emerald-600 dark:text-emerald-400 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-bold animate-pulse text-lg" style={{ left: '50%', top: '50%' }}>
                      📍
                    </div>
                    
                    <div className="z-10 text-[10px] text-emerald-800 dark:text-emerald-400 bg-white/85 dark:bg-slate-800/85 px-2.5 py-1 rounded-lg border border-emerald-200/50 shadow-sm text-center">
                      <span className="font-bold block">Sektor Cianjur & Cipanas</span>
                      <span>Klik area mana saja untuk mengubah latitude/longitude</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Lahan baru akan berstatus 'Pending' sebelum diverifikasi BPP.
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md"
                >
                  Simpan Lahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
