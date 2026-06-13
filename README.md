# Portal Petani

Portal Petani adalah aplikasi web komprehensif yang dirancang untuk membantu kelompok tani mengelola data pertanian, riwayat aktivitas penanaman, inventaris dan penyewaan alat tani, struktur kepengurusan, serta berita penyuluhan secara terpusat. Proyek ini memisahkan layanan backend dan antarmuka pengguna (frontend) guna memberikan skalabilitas dan pengalaman penggunaan yang responsif.

## Fitur Utama

- **Manajemen Pengguna Berbasis Peran**: Mendukung otentikasi dan otorisasi dengan berbagai peran spesifik, antara lain Petani, Pengurus, BPP (Balai Penyuluhan Pertanian), dan Administrator.
- **Pencatatan Aktivitas Pertanian**: Memungkinkan petani untuk merekam log harian kegiatan seperti penanaman, pemupukan, pemanenan, dan irigasi, yang tersimpan dalam riwayat produktivitas masing-masing lahan.
- **Katalog dan Penyewaan Alat Tani**: Menyediakan manajemen inventaris peralatan bagi pengurus dan sistem pengajuan sewa secara swalayan bagi petani.
- **Hierarki Organisasi**: Menampilkan struktur organisasi dari kepengurusan pusat hingga sub-kelompok tani daerah.
- **Sistem Audit Log dan Pencadangan**: Mencatat semua riwayat mutasi data di sisi admin untuk transparansi, serta mendukung pencadangan penuh dan pemulihan data (backup & restore) dalam format JSON.

## Teknologi yang Digunakan

**Frontend:**
- React (versi 18)
- Vite (sebagai bundler modern yang cepat)
- Tailwind CSS (versi 4 untuk penataan gaya utilitas tingkat lanjut, OKLCH theme)
- React Router DOM (navigasi sisi klien)

**Backend:**
- Node.js & Express.js
- Prisma ORM (Object-Relational Mapping)
- SQLite (Basis data relasional ringan)
- JSON Web Token (Keamanan dan manajemen sesi)

## Persyaratan Sistem

Pastikan sistem Anda telah terpasang:
- Node.js (versi 18.x atau lebih baru)
- npm atau yarn

## Cara Instalasi dan Menjalankan Proyek

Aplikasi ini dibagi menjadi dua bagian: `backend` dan `frontend`. Anda harus menjalankan keduanya untuk fungsionalitas penuh.

### 1. Menjalankan Backend

1. Buka terminal dan arahkan ke direktori backend:
   ```bash
   cd backend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Lakukan inisialisasi dan sinkronisasi database (menggunakan Prisma dan SQLite):
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Jalankan peladen (server) backend:
   ```bash
   npm start
   ```
   *Secara default, peladen berjalan pada `http://localhost:5000`.*

### 2. Menjalankan Frontend

1. Buka terminal baru dan arahkan ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
   *Anda dapat mengakses portal melalui tautan lokal yang ditampilkan oleh Vite (biasanya `http://localhost:5173`).*

## Struktur Folder

```text
farmers-portal/
├── backend/
│   ├── controllers/      # Logika bisnis untuk setiap rute API
│   ├── middlewares/      # Interseptor dan validasi HTTP (misal: verifikasi token)
│   ├── models/           # Definisi fungsi untuk manipulasi database
│   ├── prisma/           # Konfigurasi ORM dan schema basis data (schema.prisma)
│   ├── routes/           # Deklarasi titik akhir (endpoints) API
│   ├── utils/            # Fungsi utilitas sistem
│   └── index.js          # File utama server Express
├── frontend/
│   ├── public/           # Aset statis terbuka
│   ├── src/
│   │   ├── components/   # Komponen React yang dapat digunakan kembali (Header, Layout)
│   │   ├── context/      # Manajemen state global (AuthContext)
│   │   ├── db/           # Adaptor API atau konfigurasi pengambil data (mockDb.js)
│   │   ├── pages/        # Halaman antarmuka utama (Beranda, Aktivitas, Alat, dll.)
│   │   ├── App.jsx       # Entri routing dan struktur komponen akar
│   │   └── index.css     # File gaya CSS utama dengan tema Tailwind
│   └── index.html        # Entri dokumen HTML
├── DESIGN.md             # Dokumentasi desain UI dan tema
├── PRODUCT.md            # Dokumentasi strategis produk
└── README.md             # Dokumen teknis pengenalan proyek ini
```
