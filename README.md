# Adat & Iklim · Bentang Alam Advisory (BAV)

Situs statis BAV dengan **Atlas Adat & Iklim** dan **menu aksesibilitas** buatan sendiri. Murni HTML, CSS, dan JavaScript: tanpa `npm install`, tanpa build step, siap untuk GitHub Pages.

## Isi

```
.
├── index.html                    # beranda
├── atlas.html                    # atlas interaktif (peta + daftar + detail)
├── 404.html
├── .nojekyll
├── assets/
│   ├── css/style.css             # identitas BAV (palet Okabe-Ito, Atkinson Hyperlegible Next)
│   ├── css/atlas.css             # gaya halaman atlas
│   ├── css/a11y.css              # menu aksesibilitas + efeknya ke halaman
│   ├── js/data.js                # KONTEN BERANDA (teks, kategori, kartu unggulan)
│   ├── js/atlas-data.js          # DATA ATLAS, dibuat otomatis dari Excel
│   ├── js/peta-indonesia.js      # garis pantai (Natural Earth) untuk peta mini & cadangan
│   ├── js/common.js              # fungsi bersama
│   ├── js/main.js                # logika beranda
│   ├── js/atlas.js               # logika atlas
│   ├── js/a11y.js                # menu aksesibilitas
│   ├── fonts/                    # Atkinson Hyperlegible Next + OpenDyslexic (di-host sendiri)
│   ├── img/logo-bav.svg          # logo horizontal biru-oranye (latar terang)
│   ├── img/logo-bav-putih.svg    # logo horizontal putih-kuning (latar biru)
│   └── vendor/leaflet/           # Leaflet 1.9.4 + MarkerCluster (di-host sendiri)
├── tools/excel_ke_atlas.py       # konversi Excel -> atlas-data.js
└── .github/workflows/deploy.yml  # deploy otomatis tiap push ke main
```

## Coba di laptop

Font dan beberapa fitur tidak jalan bila `index.html` dibuka langsung (`file://`). Jalankan server kecil:

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

## Deploy ke GitHub Pages

1. Buat repo baru, upload seluruh isi folder ini (termasuk `.github` dan `.nojekyll`).
2. *Settings* > *Pages* > *Source*: pilih **GitHub Actions**. (Alternatif: *Deploy from a branch*, `main`, `/ (root)`.)
3. Tunggu 1 sampai 2 menit, cek tab *Actions*. Situs tayang di `https://USERNAME.github.io/NAMA-REPO/`.

## Memperbarui data atlas

1. Edit `Climate_Heritage_Map.xlsm` seperti biasa (sheet **Adat & Iklim**).
2. Dari folder utama situs:
   ```bash
   pip install openpyxl
   python tools/excel_ke_atlas.py path/ke/Climate_Heritage_Map.xlsm
   ```
3. Commit dan push `assets/js/atlas-data.js`. Atlas dan angka di beranda ikut berubah.

Aturan yang dibaca skrip:

- Hanya baris dengan ID berpola `A.001/ID-AC/...` yang masuk. Sheet `0.arc` diabaikan.
- Kode provinsi diambil dari ID (`ID-AC` = Aceh, dst.), lalu dikelompokkan per wilayah kepulauan.
- Kolom **Kategori** dipisah koma menjadi fungsi iklim. Kategori pertama menentukan warna penanda.
- **Warna sel kolom "Sumber utama"** dibaca sebagai catatan mutu: kuning muda (`FFF2CC`) = sumber berupa artikel, kuning (`FFFF00`) = tautan tidak bisa ditelusuri. Keduanya tampil sebagai peringatan di panel detail.
- **Jurnal pendukung** dipecah per nomor; tautan pertama di tiap butir menjadi tombol "Buka sumber".

Kartu unggulan di beranda diatur lewat `UNGGULAN` di `assets/js/data.js`.

## Menu aksesibilitas

Tombol bulat di kanan bawah atau **Ctrl+U**. Semuanya berjalan di browser pengunjung, tanpa layanan pihak ketiga, dan pengaturan disimpan di `localStorage`.

| Fitur | Yang dilakukan |
|---|---|
| Profil | Prasetel: gangguan penglihatan, disleksia, sensitif kejang, ADHD, disabilitas motorik, lansia |
| Widget besar (XL) | Memperbesar panel menu itu sendiri |
| Baca Halaman | Web Speech API berbahasa Indonesia: klik teks untuk dibacakan, atau baca seluruh halaman |
| Kontras + | Gelap, terang, atau warna terbalik |
| Kontras Cerdas | Teks sekunder dinaikkan ke ≥ 7:1 tanpa mengubah latar |
| Sorot Tautan | Semua tautan dan tombol diberi garis tebal kuning-hitam |
| Teks Lebih Besar | 4 tingkat (115% sampai 175%); menu otomatis beralih ke mode ringkas |
| Spasi Teks, Tinggi Garis | 3 tingkat masing-masing (memenuhi WCAG 1.4.12) |
| Animasi Dijeda | Mematikan semua animasi dan transisi |
| Sembunyikan Gambar | Mengganti ilustrasi dengan blok polos |
| Ramah Disleksia | Huruf OpenDyslexic |
| Kursor | Besar hitam, besar putih, atau pemandu baca |
| Keterangan Alat | Menampilkan label tombol/ikon saat disorot atau difokus |
| Struktur Halaman | Daftar judul, landmark, dan tautan untuk lompat cepat |
| Perataan Teks, Kejenuhan | 4 dan 3 pilihan |

Fondasi aksesibilitas di luar menu: skip link, menu dropdown dengan `aria-expanded`, fokus keyboard kuning-hitam yang jelas, kartu yang seluruhnya bisa diklik, peta yang punya daftar setara untuk pembaca layar, penanda peta berkode huruf (identitas tidak bergantung warna saja), dan palet Okabe-Ito yang aman bagi buta warna. Audit axe-core (WCAG 2.2 AA): 0 pelanggaran di beranda dan atlas.

## Lisensi pihak ketiga

- Atkinson Hyperlegible Next, OpenDyslexic: SIL Open Font License 1.1 (berkas lisensi di `assets/fonts/`).
- Leaflet: BSD-2-Clause. Leaflet.markercluster: MIT.
- Garis pantai: Natural Earth (domain publik).
- Ubin peta: bawaan memakai OpenStreetMap standar (tanpa key). Server OSM dijalankan relawan, jadi cocok untuk situs dengan lalu lintas wajar; penggunaan berat dilarang tanpa izin.
- Ingin tampilan CARTO Voyager? Sejak Agustus 2026 CARTO mewajibkan API key (gratis, tanpa antrean). Minta di https://carto.com/basemaps/apikey dengan domain situs Anda, lalu isi `PETA.cartoKey` di `assets/js/data.js`.
