import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../db/mockDb';
import { 
  Key, Plus, Calendar, Info, CheckCircle2, XCircle, Clock, 
  ChevronRight, Wrench, ShieldAlert, ListFilter
} from 'lucide-react';

export default function Equipment() {
  const { user, isPetani, isPengurus } = useAuth();
  
  // States
  const [equipment, setEquipment] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [lands, setLands] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Tab control: 'catalog' vs 'rentals'
  const [activeTab, setActiveTab] = useState('catalog');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Modals / Forms
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isAddEquipModalOpen, setIsAddEquipModalOpen] = useState(false);
  
  // Rental Form fields
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [rentalLandId, setRentalLandId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentalNotes, setRentalNotes] = useState('');

  // Equipment Form fields
  const [equipName, setEquipName] = useState('');
  const [equipCategory, setEquipCategory] = useState('Traktor');
  const [equipQuantity, setEquipQuantity] = useState('1');
  const [equipDesc, setEquipDesc] = useState('');

  const loadData = async () => {
    setEquipment(await mockDb.getAll('equipment') || []);
    setRentals(await mockDb.getAll('rental_requests') || []);
    setLands((await mockDb.getAll('lands') || []).filter(l => l.owner_id === user.id));
    setUsers(await mockDb.getAll('users') || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ['Semua', 'Traktor', 'Pemanen', 'Irigasi', 'Lainnya'];

  const filteredEquipment = equipment.filter(item => {
    if (selectedCategory === 'Semua') return true;
    return item.category === selectedCategory;
  });

  // Handle Rental Request Submit
  const handleRentalSubmit = async (e) => {
    e.preventDefault();
    if (!rentalLandId || !startDate || !endDate) {
      alert('Mohon lengkapi semua field sewa.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Tanggal mulai tidak boleh melebihi tanggal selesai.');
      return;
    }

    // Insert rental request
    await mockDb.insert('rental_requests', {
      requester_id: user.id,
      equipment_id: selectedEquip.id,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      notes: rentalNotes
    }, user.id);

    setIsRentalModalOpen(false);
    setSelectedEquip(null);
    setRentalNotes('');
    loadData();
    setActiveTab('rentals'); // Redirect to rentals log tab
  };

  // Handle Add Equipment Submit
  const handleAddEquipSubmit = async (e) => {
    e.preventDefault();
    if (!equipName || !equipQuantity) {
      alert('Nama alat dan jumlah wajib diisi.');
      return;
    }

    const qty = parseInt(equipQuantity);
    await mockDb.insert('equipment', {
      name: equipName,
      category: equipCategory,
      quantity_total: qty,
      quantity_available: qty,
      description: equipDesc
    }, user.id);

    setIsAddEquipModalOpen(false);
    setEquipName('');
    setEquipDesc('');
    setEquipQuantity('1');
    loadData();
  };

  // Handle Rental Approval Action
  const handleRentalAction = async (rentalId, action) => {
    const rental = mockDb.getById('rental_requests', rentalId);
    if (!rental) return;

    if (action === 'approved') {
      const equip = mockDb.getById('equipment', rental.equipment_id);
      if (!equip || equip.quantity_available <= 0) {
        alert('Gagal menyetujui. Stok unit peralatan tersebut saat ini sedang kosong.');
        return;
      }
      
      // Reduce ketersediaan alat
      await mockDb.update('equipment', equip.id, {
        quantity_available: equip.quantity_available - 1
      }, user.id);
    }

    // Update status sewa
    await mockDb.update('rental_requests', rentalId, {
      status: action
    }, user.id);

    loadData();
  };

  // Handle Rental Return Action (Mark completed)
  const handleReturnAction = async (rentalId) => {
    const rental = mockDb.getById('rental_requests', rentalId);
    if (!rental) return;

    const equip = mockDb.getById('equipment', rental.equipment_id);
    if (equip) {
      // Return quantity
      await mockDb.update('equipment', equip.id, {
        quantity_available: Math.min(equip.quantity_total, equip.quantity_available + 1)
      }, user.id);
    }

    await mockDb.update('rental_requests', rentalId, {
      status: 'returned' // Custom status for tracking
    }, user.id);

    loadData();
  };

  return (
    <div className="space-y-8">
      
      {/* Tabs Switcher */}
      <div className="flex border-b border-border-subtle">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-6 py-4 font-bold text-base border-b-2 transition-colors ${
            activeTab === 'catalog' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-ink-muted hover:text-ink-main'
          }`}
        >
          Katalog Peralatan
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-6 py-4 font-bold text-base border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'rentals' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-ink-muted hover:text-ink-main'
          }`}
        >
          Daftar Sewa &amp; Status
          {isPengurus && rentals.filter(r => r.status === 'pending').length > 0 && (
            <span className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* RENDER CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Filters Bar & Add Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-surface-card p-6 rounded-2xl shadow-sm border border-border-subtle">
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              <ListFilter className="w-5 h-5 text-ink-muted shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-surface-bg text-ink-main hover:bg-border-subtle'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {isPengurus && (
              <button
                onClick={() => setIsAddEquipModalOpen(true)}
                className="bg-brand-primary hover:bg-brand-hover text-white font-bold text-base px-5 py-3 rounded-lg shadow-sm flex items-center gap-2 transition-colors self-start sm:self-auto"
              >
                <Plus className="w-5 h-5" />
                Tambah Stok Alat
              </button>
            )}
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map(item => {
              const available = item.quantity_available > 0;
              return (
                <div key={item.id} className="bg-surface-card p-6 rounded-2xl border border-border-subtle flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-1 rounded-md bg-surface-bg text-[11px] uppercase font-bold text-ink-muted">
                        {item.category}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] uppercase font-extrabold border ${
                        available 
                          ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {available ? 'Tersedia' : 'Kosong'}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-ink-main flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-brand-primary" />
                      {item.name}
                    </h3>
                    
                    <p className="text-sm text-ink-muted mt-3 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
                    <div className="text-left">
                      <span className="block text-xs uppercase font-bold text-ink-muted">Status Stok</span>
                      <span className="text-sm font-semibold text-ink-main">
                        Ketersediaan: <span className="font-bold text-brand-primary">{item.quantity_available}</span> / {item.quantity_total} Unit
                      </span>
                    </div>

                    {isPetani && (
                      <button
                        onClick={() => {
                          if (!available) {
                            alert('Alat sedang habis disewa. Silakan pilih alat yang tersedia.');
                            return;
                          }
                          if (lands.length === 0) {
                            alert('Anda harus mendaftarkan lahan pertanian terlebih dahulu di menu "Lahan Saya" sebelum menyewa.');
                            return;
                          }
                          setSelectedEquip(item);
                          setRentalLandId(lands[0].id);
                          setStartDate(new Date().toISOString().split('T')[0]);
                          setEndDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                          setIsRentalModalOpen(true);
                        }}
                        disabled={!available}
                        className={`text-sm font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                          available
                            ? 'bg-brand-primary hover:bg-brand-hover text-white shadow-sm'
                            : 'bg-surface-bg text-ink-muted cursor-not-allowed'
                        }`}
                      >
                        Sewa Alat <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER RENTALS LOG TAB */}
      {activeTab === 'rentals' && (
        <div className="bg-surface-card rounded-2xl border border-border-subtle overflow-hidden shadow-sm">
          
          <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center">
            <h4 className="font-bold text-lg text-ink-main">Aktivitas &amp; Pengajuan Sewa</h4>
            <span className="text-sm text-ink-muted font-semibold">{rentals.length} catatan total</span>
          </div>

          {rentals.length === 0 ? (
            <p className="text-ink-muted text-base text-center py-16">Belum ada pengajuan sewa dalam riwayat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-ink-muted text-xs font-bold uppercase tracking-wider bg-surface-bg">
                    <th className="p-5">Kode Sewa</th>
                    <th className="p-5">Peminjam</th>
                    <th className="p-5">Alat Tani</th>
                    <th className="p-5">Jangka Waktu</th>
                    <th className="p-5">Notes</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-ink-main">
                  {rentals.map(rent => {
                    const requester = users.find(u => u.id === rent.requester_id);
                    const item = equipment.find(e => e.id === rent.equipment_id);
                    
                    // Show actions only to Pengurus or if it belongs to current Petani
                    const showActions = isPengurus && rent.status === 'pending';
                    const isOwnRental = rent.requester_id === user.id;
                    const canReturn = isPengurus && rent.status === 'approved';

                    if (isPetani && !isOwnRental) return null; // Farmers only see own rentals

                    return (
                      <tr key={rent.id} className="hover:bg-surface-bg transition-colors">
                        <td className="p-5 font-mono font-semibold text-sm">#{rent.id.split('_')[1] || rent.id}</td>
                        <td className="p-5">
                          <span className="font-bold block">{requester?.name || 'Petani'}</span>
                          <span className="text-xs font-medium text-ink-muted">{requester?.region}</span>
                        </td>
                        <td className="p-5">
                          <span className="font-bold block text-ink-main">{item?.name || 'Alat'}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-bg text-ink-muted uppercase font-bold mt-1 inline-block">{item?.category}</span>
                        </td>
                        <td className="p-5 text-sm font-medium whitespace-nowrap">
                          {rent.start_date} <span className="text-ink-muted px-1">s/d</span> {rent.end_date}
                        </td>
                        <td className="p-5 text-sm max-w-[200px] truncate" title={rent.notes}>{rent.notes || '-'}</td>
                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase font-extrabold border ${
                            rent.status === 'approved' 
                              ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' 
                              : rent.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : rent.status === 'returned'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {rent.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                            {rent.status === 'rejected' && <XCircle className="w-4 h-4" />}
                            {rent.status === 'pending' && <Clock className="w-4 h-4" />}
                            {rent.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          {showActions && (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleRentalAction(rent.id, 'approved')}
                                className="bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleRentalAction(rent.id, 'rejected')}
                                className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Tolak
                              </button>
                            </div>
                          )}
                          
                          {canReturn && (
                            <button
                              onClick={() => handleReturnAction(rent.id)}
                              className="bg-ink-main hover:bg-ink-muted text-white text-sm font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Selesai / Kembalikan
                            </button>
                          )}

                          {!showActions && !canReturn && (
                            <span className="text-sm font-bold text-ink-muted">&mdash;</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Petani Booking Request Modal */}
      {isRentalModalOpen && selectedEquip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setIsRentalModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-500" />
              Ajukan Sewa Alat Tani
            </h3>
            
            <p className="text-xs text-slate-500 mb-4">
              Peralatan: <strong className="text-slate-800 dark:text-white">{selectedEquip.name}</strong>
            </p>

            <form onSubmit={handleRentalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Lahan Tujuan Peminjaman
                </label>
                <select
                  value={rentalLandId}
                  onChange={(e) => setRentalLandId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {lands.map(land => (
                    <option key={land.id} value={land.id}>{land.name} ({land.area_ha} Ha)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Catatan Kebutuhan
                </label>
                <textarea
                  rows="3"
                  placeholder="Deskripsikan tujuan peminjaman alat (contoh: Membajak sawah sektor tengah karena musim kemarau)..."
                  value={rentalNotes}
                  onChange={(e) => setRentalNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRentalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md"
                >
                  Ajukan Sewa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pengurus Add Equipment Modal */}
      {isAddEquipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setIsAddEquipModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Tambah Inventaris Peralatan Baru
            </h3>

            <form onSubmit={handleAddEquipSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Alat
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traktor Yanmar YM357A"
                  value={equipName}
                  onChange={(e) => setEquipName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={equipCategory}
                    onChange={(e) => setEquipCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Traktor">Traktor</option>
                    <option value="Pemanen">Pemanen</option>
                    <option value="Irigasi">Irigasi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Jumlah Unit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={equipQuantity}
                    onChange={(e) => setEquipQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Deskripsi / Keterangan Alat
                </label>
                <textarea
                  rows="3"
                  placeholder="Kapasitas kerja alat, bahan bakar, atau kualifikasi operator..."
                  value={equipDesc}
                  onChange={(e) => setEquipDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEquipModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md"
                >
                  Tambah Alat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
