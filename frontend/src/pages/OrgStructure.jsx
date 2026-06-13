import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../db/mockDb';
import { 
  TreePine, Plus, Edit, Trash2, X, Users, ShieldAlert, CheckCircle, HelpCircle
} from 'lucide-react';

export default function OrgStructure() {
  const { user, isPengurus, isAdmin, isBPP } = useAuth();
  
  // States
  const [orgNodes, setOrgNodes] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Modals / Forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState(null);
  
  // Form Fields
  const [nodeName, setNodeName] = useState('');
  const [parentId, setParentId] = useState('');
  const [leaderId, setLeaderId] = useState('');

  const loadData = async () => {
    setOrgNodes(await mockDb.getAll('org_structures') || []);
    setUsers(await mockDb.getAll('users') || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const canEdit = isPengurus || isAdmin;

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nodeName || !leaderId) {
      alert('Nama struktur dan Pemimpin wajib diisi.');
      return;
    }

    const payload = {
      name: nodeName,
      parent_id: parentId === 'null' || parentId === '' ? null : parentId,
      leader_id: leaderId
    };

    if (editingNodeId) {
      await mockDb.update('org_structures', editingNodeId, payload, user.id);
    } else {
      await mockDb.insert('org_structures', payload, user.id);
    }

    setIsFormOpen(false);
    setNodeName('');
    setParentId('');
    setLeaderId('');
    setEditingNodeId(null);
    loadData();
  };

  const handleEditClick = (node) => {
    setEditingNodeId(node.id);
    setNodeName(node.name);
    setParentId(node.parent_id || 'null');
    setLeaderId(node.leader_id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    // Check if node has children
    const hasChildren = orgNodes.some(n => n.parent_id === id);
    if (hasChildren) {
      alert('Gagal menghapus. Hapus atau pindahkan divisi bawahan terlebih dahulu.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus divisi organisasi ini?')) {
      await mockDb.delete('org_structures', id, user.id);
      loadData();
    }
  };

  // Build tree hierarchy helper
  const renderTree = (nodeId = null, depth = 0) => {
    const children = orgNodes.filter(node => node.parent_id === nodeId);
    if (children.length === 0) return null;

    return (
      <div className={`space-y-6 ${depth > 0 ? 'pl-6 md:pl-12 border-l-2 border-brand-primary/20 ml-4 md:ml-8 mt-4' : ''}`}>
        {children.map(node => {
          const leader = users.find(u => u.id === node.leader_id);
          return (
            <div key={node.id} className="relative">
              {/* Connector line for child nodes */}
              {depth > 0 && (
                <div className="absolute -left-[26px] md:-left-[50px] top-6 w-[24px] md:w-[48px] border-t-2 border-brand-primary/20" />
              )}

              {/* Node Card */}
              <div className="inline-flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-sm min-w-[300px] max-w-lg hover:border-brand-primary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                    <TreePine className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-base text-ink-main leading-tight">{node.name}</h5>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Users className="w-4 h-4 text-ink-muted" />
                      <span className="text-sm font-semibold text-ink-main">
                        {leader ? leader.name : 'Belum Ditentukan'}
                      </span>
                      {leader && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-surface-bg text-ink-muted whitespace-nowrap">
                          {leader.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit options for Pengurus/Admin */}
                {canEdit && (
                  <div className="flex items-center gap-1.5 self-end sm:self-auto border-t sm:border-0 border-border-subtle pt-3 sm:pt-0">
                    <button
                      onClick={() => handleEditClick(node)}
                      className="p-2 rounded-lg text-ink-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                      title="Edit Divisi"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(node.id)}
                      className="p-2 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Divisi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Recurse children */}
              {renderTree(node.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Description & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-surface-card p-6 rounded-2xl shadow-sm border border-border-subtle">
        <div>
          <h4 className="font-bold text-ink-main text-lg">Struktur Kepengurusan</h4>
          <p className="text-ink-muted text-sm mt-1">
            Daftar hierarki kelompok tani dari pusat hingga tingkat sub-kelompok daerah.
          </p>
        </div>
        
        {canEdit && (
          <button
            onClick={() => {
              setEditingNodeId(null);
              setNodeName('');
              setParentId('null');
              setLeaderId(users.length > 0 ? users[0].id : '');
              setIsFormOpen(true);
            }}
            className="bg-brand-primary hover:bg-brand-hover text-white font-bold text-base px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-5 h-5" />
            Tambah Struktur Divisi
          </button>
        )}
      </div>

      {/* Visual Tree Component */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle p-6 md:p-10 shadow-sm overflow-x-auto">
        {orgNodes.length === 0 ? (
          <p className="text-ink-muted text-base text-center py-12">Belum ada struktur organisasi dibuat.</p>
        ) : (
          <div className="min-w-[600px] py-4">
            {renderTree(null, 0)}
          </div>
        )}
      </div>

      {/* Node Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              {editingNodeId ? 'Edit Struktur Divisi' : 'Tambah Struktur Divisi Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Struktur/Kelompok
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sub-Kelompok Cianjur Selatan"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Parent Divisi (Atasan)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="null">&mdash; None (Root Node) &mdash;</option>
                  {orgNodes
                    .filter(n => n.id !== editingNodeId) // Avoid cycles
                    .map(node => (
                      <option key={node.id} value={node.id}>{node.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Pemimpin Divisi
                </label>
                <select
                  value={leaderId}
                  onChange={(e) => setLeaderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" disabled>Pilih Anggota/Pimpinan</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
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
                  Simpan Divisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
