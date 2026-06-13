# Design System

## Strategy
Restrained product palette with a single strong, earthy accent. Teks besar dengan kontras tinggi untuk keterbacaan petani di lapangan. Kesan resmi namun tidak kaku.

## Colors
Menggunakan warna OKLCH berbasis nuansa hijau daun.

- **Brand Primary:** `oklch(0.45 0.12 145)` — Deep Forest Green (Hijau Pertanian).
- **Brand Hover:** `oklch(0.38 0.10 145)`
- **Background:** `oklch(0.99 0.005 145)` — Putih dengan sedikit *tint* hijau untuk kohesi.
- **Surface:** `oklch(1 0 0)` — Putih bersih untuk *card* dan struktur tabel.
- **Ink (Text Main):** `oklch(0.18 0.02 145)` — Abu-abu sangat gelap bernuansa hijau. Sangat kontras.
- **Ink Muted:** `oklch(0.45 0.02 145)` — Digunakan untuk label, tapi tetap lulus standar kontras 4.5:1.
- **Border:** `oklch(0.88 0.01 145)` — Garis batas yang jelas untuk memisahkan konten (ala web instansi).

## Typography
- **Font Family:** `Public Sans`, sans-serif. Mengirimkan sinyal "resmi/pemerintah" namun dengan anatomi yang modern dan ramah layar.
- **Headings:** Berat (Bold/Semibold), *tracking* rapat (-0.02em), jelas dan informatif. Tidak menggunakan *eyebrow* kapital kecil berlebihan.
- **Body:** Ukuran dasar 16px (1rem) atau 18px untuk memastikan audiens berusia 30+ tidak kesulitan membaca.

## Layout & Rhythm
- Spasi yang lega (*breathing room*). Menggunakan *grid* yang konsisten.
- Bentuk kartu (*cards*) digunakan hanya untuk *container* utama seperti Tabel atau *Form*, tanpa *nested cards*.
- *Radius* sudut (border-radius): Sedang (0.5rem / 8px). Tidak terlalu bulat, menjaga kesan institusi/resmi.

## Motion & Interaction
- *No bounce, no scale on hover*. Interaksi hanya mengubah warna *background* atau teks (*crossfade* transisi 150ms). Fokus pada efisiensi dan kesan solid.
- Cepat dan langsung.
