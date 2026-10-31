/* =========================================================
   DATA KONTEN BERANDA
   Data praktik adat untuk atlas ada di atlas-data.js
   (dibuat otomatis dari Excel, lihat tools/excel_ke_atlas.py).
   ========================================================= */

const SITE = {
  name: "Bentang Alam Advisory",
  short: "BAV",
  tagline: "Kajian dan inisiatif inklusif untuk aksi iklim Indonesia",
  email: "halo@contoh.id",
};

/* Peta dasar atlas.
   Kosong  -> OpenStreetMap standar (gratis, tanpa key).
   Diisi   -> CARTO Voyager (lebih kalem). Minta key gratis di
              https://carto.com/basemaps/apikey dengan domain situs Anda. */
const PETA = {
  cartoKey: "",
};

/* Fungsi iklim: urutan & warna tetap (palet Okabe-Ito, aman buta warna).
   Kode dua huruf ditampilkan di penanda peta agar identitas tidak bergantung warna saja. */
const KATEGORI = {
  Mengatur:   { warna: "#0072b2", kode: "Mg", ket: "Aturan dan kelembagaan adat atas sumber daya" },
  Melindungi: { warna: "#009e73", kode: "Ml", ket: "Perlindungan hutan, air, laut, dan ekosistem" },
  Adaptasi:   { warna: "#e69f00", kode: "Ad", ket: "Penyesuaian terhadap cuaca dan iklim" },
  Mitigasi:   { warna: "#cc79a7", kode: "Mt", ket: "Menjaga penyerap karbon dan menekan emisi" },
  Pengamatan: { warna: "#56b4e9", kode: "Pg", ket: "Membaca musim dan tanda alam" },
  Lainnya:    { warna: "#6b6b6b", kode: "?",  ket: "Belum dikategorikan" },
};

/* Kartu unggulan di beranda (ID dari Excel). Kosongkan untuk menampilkan urutan data. */
const UNGGULAN = ["A.001", "A.018", "A.035", "A.013", "A.087", "A.105"];

const LANGKAH = [
  { judul: "Pilih Praktik Adat", isi: "Tentukan pengetahuan atau praktik adat soal musim, air, hutan, laut, atau pangan yang ingin dicatat.", ikon: "spark" },
  { judul: "Minta Persetujuan Komunitas", isi: "Bicarakan dulu dengan tetua dan lembaga adat. Dokumentasi hanya jalan kalau komunitas setuju secara bebas dan sadar.", ikon: "shield" },
  { judul: "Dokumentasikan & Kirim", isi: "Rekam cerita, foto, lokasi, dan kalender musim, lalu kirim lewat formulir kontributor.", ikon: "send" },
  { judul: "Kurasi & Terbitkan", isi: "Tim meninjau bersama komunitas sebelum terbit, dengan atribusi penuh kepada pemilik pengetahuan.", ikon: "doc" },
];

const CERITA = [
  { judul: "Membaca Bintang untuk Menentukan Masa Tanam", ringkas: "Di Ciptagelar, munculnya bintang Kidang dan Kerti jadi penanda kapan sawah mulai digarap.", lokasi: "Sukabumi, Jawa Barat", tag: "Kalender Musim", scene: "malam" },
  { judul: "Laut sebagai Rumah: Pengetahuan Arus Orang Bajau", ringkas: "Hidup di atas air membuat komunitas Bajau peka membaca arus, angin, dan fase bulan.", lokasi: "Wakatobi, Sulawesi Tenggara", tag: "Pesisir", scene: "laut" },
  { judul: "Uma dan Apotek Hutan Siberut", ringkas: "Rumah panjang uma jadi pusat hidup keluarga Mentawai, sementara sikerei menjaga ilmu tanaman obat.", lokasi: "Siberut, Sumatra Barat", tag: "Hutan", scene: "hutan" },
];

const WAWASAN = {
  utama: { judul: "Kalender Musim Adat Nusantara", isi: "Kami sedang menghimpun kalender musim dari berbagai komunitas adat (kapan menanam, memanen, membuka sasi, sampai menjaga mata air) untuk dibandingkan dengan data iklim terkini.", aksi: "Ikut Menyusun", scene: "air" },
  daftar: [
    { judul: "Mengapa Pengetahuan Adat Penting bagi Adaptasi Iklim", isi: "Pengamatan lintas generasi menyimpan catatan perubahan lingkungan yang sering luput dari data instrumen.", label: "Wawasan", scene: "air" },
    { judul: "Persetujuan Komunitas dalam Dokumentasi", isi: "Prinsip persetujuan bebas, didahulukan, dan diinformasikan memastikan komunitas tetap memegang kendali.", label: "Panduan", scene: "arsitektur" },
    { judul: "Tanda Alam sebagai Peringatan Dini", isi: "Perilaku hewan, bunga yang mekar, dan arah angin jadi penanda pergantian musim di banyak kampung.", label: "Pengetahuan", scene: "hutan" },
  ],
};

const PRINSIP = ["Persetujuan Komunitas", "Atribusi yang Adil", "Akses Terbuka", "Kedaulatan Data Adat", "Inklusif Disabilitas"];

const MITRA = [
  { nama: "Masyarakat Adat", ikon: "users" },
  { nama: "Organisasi Penyandang Disabilitas", ikon: "access" },
  { nama: "Peneliti & Akademisi", ikon: "cap" },
  { nama: "Organisasi Masyarakat Sipil", ikon: "shield" },
  { nama: "Pemerintah Desa & Daerah", ikon: "gov" },
  { nama: "Jurnalis & Pencerita", ikon: "mic" },
];

const WILAYAH = ["Sumatra", "Jawa", "Bali & Nusa Tenggara", "Kalimantan", "Sulawesi", "Maluku", "Papua"];
