import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../db/mockDb';
import { 
  Newspaper, Plus, FileText, Search, User, Calendar, Trash2, Edit2, X, Eye
} from 'lucide-react';

export default function News() {
  const { user, isBPP, isPengurus } = useAuth();
  
  // States
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');

  const loadData = async () => {
    setNews(await mockDb.getAll('news') || []);
    setUsers(await mockDb.getAll('users') || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const canPublish = isBPP || isPengurus;

  // Handle Publish Article
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) {
      alert('Judul dan Konten berita wajib diisi.');
      return;
    }

    await mockDb.insert('news', {
      author_id: user.id,
      title: newsTitle,
      content: newsContent,
      published_at: new Date().toISOString()
    }, user.id);

    setNewsTitle('');
    setNewsContent('');
    loadData();
    setActiveTab('feed'); // Go back to feed
  };

  // Handle Delete Article
  const handleDelete = async (articleId) => {
    if (confirm('Apakah Anda yakin ingin menghapus artikel berita ini?')) {
      await mockDb.delete('news', articleId, user.id);
      loadData();
    }
  };

  // Filter News
  const filteredNews = news.filter(article => {
    const author = users.find(u => u.id === article.author_id);
    const authorName = author ? author.name.toLowerCase() : '';
    const searchString = `${article.title} ${article.content} ${authorName}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Tab controls */}
      {canPublish && (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'feed' 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            Berita Terbit
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'write' 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            Tulis Artikel Baru
          </button>
        </div>
      )}

      {/* FEED TAB */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berita atau panduan penyuluhan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-transparent bg-transparent text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          {/* News Cards Feed */}
          {filteredNews.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
              <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-white">Belum Ada Berita</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Silakan tulis atau tunggu artikel penyuluhan pertanian diterbitkan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.sort((a,b) => new Date(b.published_at) - new Date(a.published_at)).map(article => {
                const author = users.find(u => u.id === article.author_id);
                // Check if current user is the author
                const isAuthor = article.author_id === user.id;

                return (
                  <div key={article.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative">
                    
                    <div>
                      {/* Meta Header */}
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-semibold mb-3">
                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/40 px-2.5 py-1 rounded-xl text-slate-500 dark:text-slate-400">
                          <User className="w-3.5 h-3.5" />
                          {author ? author.name : 'Penyuluh BPP'} ({author?.role})
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="font-bold text-base md:text-lg text-slate-800 dark:text-white mb-2 leading-tight">
                        {article.title}
                      </h3>

                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                        {article.content}
                      </p>
                    </div>

                    {/* Delete action if current user is author or Admin */}
                    {isAuthor && (
                      <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus Artikel
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WRITE / PUBLISH TAB (BPP & Pengurus only) */}
      {activeTab === 'write' && canPublish && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm max-w-2xl">
          <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Tulis Pengumuman &amp; Penyuluhan Baru
          </h4>

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Judul Artikel
              </label>
              <input
                type="text"
                placeholder="Masukkan judul berita yang menarik..."
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Isi / Konten Berita
              </label>
              <textarea
                rows="8"
                placeholder="Tuliskan berita lengkap, panduan teknis tanam, informasi obat/pupuk tanaman, atau rincian kebijakan terbaru di sini..."
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewsTitle('');
                  setNewsContent('');
                  setActiveTab('feed');
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md"
              >
                Terbitkan Sekarang
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
