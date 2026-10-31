"""
Konversi Climate_Heritage_Map.xlsm -> assets/js/atlas-data.js

Cara pakai (dari folder utama situs):
    pip install openpyxl
    python tools/excel_ke_atlas.py path/ke/Climate_Heritage_Map.xlsm

Yang dibaca: sheet pertama ("Adat & Iklim"). Sheet "0.arc" (entri yang tidak
lolos kriteria) sengaja tidak dipetakan.

Warna sel pada kolom "Sumber utama" dibaca sebagai catatan mutu data:
  FFF2CC (kuning muda) -> sumber berupa artikel
  FFFF00 (kuning)      -> tautan tidak bisa ditelusuri
"""

import json
import re
import sys
from pathlib import Path

import openpyxl

PROVINSI = {
    "AC": ("Aceh", "Sumatra"), "SU": ("Sumatera Utara", "Sumatra"), "SB": ("Sumatera Barat", "Sumatra"),
    "RI": ("Riau", "Sumatra"), "KR": ("Kepulauan Riau", "Sumatra"), "JA": ("Jambi", "Sumatra"),
    "SS": ("Sumatera Selatan", "Sumatra"), "BB": ("Kepulauan Bangka Belitung", "Sumatra"),
    "BE": ("Bengkulu", "Sumatra"), "LA": ("Lampung", "Sumatra"),
    "JK": ("DKI Jakarta", "Jawa"), "BT": ("Banten", "Jawa"), "JB": ("Jawa Barat", "Jawa"),
    "JT": ("Jawa Tengah", "Jawa"), "YO": ("DI Yogyakarta", "Jawa"), "JI": ("Jawa Timur", "Jawa"),
    "BA": ("Bali", "Bali & Nusa Tenggara"), "NB": ("Nusa Tenggara Barat", "Bali & Nusa Tenggara"),
    "NT": ("Nusa Tenggara Timur", "Bali & Nusa Tenggara"),
    "KB": ("Kalimantan Barat", "Kalimantan"), "KT": ("Kalimantan Tengah", "Kalimantan"),
    "KS": ("Kalimantan Selatan", "Kalimantan"), "KI": ("Kalimantan Timur", "Kalimantan"),
    "KU": ("Kalimantan Utara", "Kalimantan"),
    "SA": ("Sulawesi Utara", "Sulawesi"), "GO": ("Gorontalo", "Sulawesi"), "ST": ("Sulawesi Tengah", "Sulawesi"),
    "SR": ("Sulawesi Barat", "Sulawesi"), "SN": ("Sulawesi Selatan", "Sulawesi"), "SG": ("Sulawesi Tenggara", "Sulawesi"),
    "MA": ("Maluku", "Maluku"), "MU": ("Maluku Utara", "Maluku"),
    "PA": ("Papua", "Papua"), "PB": ("Papua Barat", "Papua"), "PD": ("Papua Barat Daya", "Papua"),
    "PT": ("Papua Tengah", "Papua"), "PE": ("Papua Pegunungan", "Papua"), "PS": ("Papua Selatan", "Papua"),
}

URL_RE = re.compile(r"https?://\S+")
FLAG = {"FFFFF2CC": "artikel", "FFFFFF00": "tak-tertelusur"}


def bersih(teks):
    return re.sub(r"\s+", " ", str(teks or "")).strip()


def pecah_sumber(teks):
    """Pisahkan daftar sumber utama menjadi butir. Nama PDF internal dirapikan."""
    if not teks:
        return []
    bagian = re.split(r"\n|(?<=\.pdf)\s+(?=[A-Z]\.\d)", str(teks))
    hasil = []
    for b in bagian:
        b = b.strip()
        if not b:
            continue
        url = URL_RE.search(b)
        if url:
            hasil.append({"teks": url.group(0), "url": url.group(0)})
        elif b.lower().endswith(".pdf"):
            nama = re.sub(r"^([A-Z]\.\d+/?)+[-_ ]*", "", b)[:-4].replace("_", " ").strip()
            hasil.append({"teks": nama, "jenis": "pdf"})
        elif b.lower().endswith(".png"):
            continue  # nama berkas gambar, bukan sumber
        else:
            hasil.append({"teks": bersih(b)})
    return hasil


def pecah_jurnal(teks):
    """Ubah teks 'Jurnal pendukung' menjadi daftar {teks, url}."""
    if not teks:
        return []
    hasil = []
    for blok in re.split(r"\n\s*\n", str(teks)):
        url = URL_RE.search(blok)
        sisa = URL_RE.sub("", blok)
        sisa = re.sub(r"^\s*\d+\.\s*", "", bersih(sisa))
        if sisa or url:
            hasil.append({"teks": sisa or (url.group(0) if url else ""), "url": url.group(0) if url else None})
    return hasil


def main(path_excel, path_keluar):
    wb = openpyxl.load_workbook(path_excel, data_only=True)
    ws = wb.worksheets[0]
    data, dilewati = [], []

    for row in ws.iter_rows(min_row=2):
        idv = row[0].value
        if not idv or not re.match(r"^[A-Z]\.\d+/ID-[A-Z]{2}", str(idv)):
            continue
        nilai = [c.value for c in row]
        try:
            lat, lng = [float(x) for x in str(nilai[3]).split(",")]
        except (TypeError, ValueError):
            dilewati.append((idv, "koordinat tidak valid"))
            continue
        kode = re.search(r"/ID-([A-Z]{2})", idv).group(1)
        prov, pulau = PROVINSI.get(kode, (kode, "Lainnya"))
        sel_sumber = row[6]
        warna = sel_sumber.fill.fgColor.rgb if sel_sumber.fill and sel_sumber.fill.fill_type else None
        kategori = [k.strip() for k in str(nilai[5] or "").split(",") if k.strip()]

        data.append({
            "id": idv.strip(),
            "nama": bersih(nilai[1]),
            "lokasi": bersih(nilai[2]),
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "deskripsi": bersih(nilai[4]),
            "kategori": kategori,
            "sumber": pecah_sumber(nilai[6]),
            "statusSumber": FLAG.get(warna),
            "mediaSumber": bersih(nilai[8]) or None,
            "jurnal": pecah_jurnal(nilai[9]),
            "provinsi": prov,
            "pulau": pulau,
        })

    js = (
        "/* Dibuat otomatis oleh tools/excel_ke_atlas.py. Jangan diedit manual;\n"
        "   ubah Excel-nya lalu jalankan ulang skrip. */\n"
        f"window.ATLAS_DATA = {json.dumps(data, ensure_ascii=False, indent=1)};\n"
    )
    Path(path_keluar).write_text(js, encoding="utf-8")
    print(f"{len(data)} entri ditulis ke {path_keluar}")
    for d in dilewati:
        print("Dilewati:", *d)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Pakai: python tools/excel_ke_atlas.py <file.xlsm> [keluaran.js]")
    keluar = sys.argv[2] if len(sys.argv) > 2 else "assets/js/atlas-data.js"
    main(sys.argv[1], keluar)
