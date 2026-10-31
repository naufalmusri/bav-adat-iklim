/* =========================================================
   BERANDA
   ========================================================= */

const DATA = window.ATLAS_DATA || [];

/* ---------- Angka utama dari data atlas ---------- */
function renderStats() {
  const prov = new Set(DATA.map((d) => d.provinsi)).size;
  const pulau = new Set(DATA.map((d) => d.pulau)).size;
  const jurnal = DATA.reduce((n, d) => n + d.jurnal.length, 0);
  const items = [
    [DATA.length, "praktik adat terkurasi"],
    [prov, "provinsi"],
    [pulau, "wilayah kepulauan"],
    [jurnal, "rujukan jurnal"],
  ];
  document.getElementById("statsGrid").innerHTML = items
    .map(([n, l]) => `<p class="stat"><span class="stat__num">${n}</span><span class="stat__label">${l}</span></p>`)
    .join("");
}

/* ---------- Kartu praktik + filter fungsi ---------- */
let filterAktif = "Semua";

function kartuPraktik(d) {
  return `
    <li class="card reveal">
      <div class="card__img" data-scene="${sceneFor(d)}">
        <div class="badges">${katOf(d).slice(0, 2).map(badgeHTML).join("")}</div>
      </div>
      <div class="card__body">
        <h3><a href="atlas.html#${encodeURIComponent(shortId(d.id))}">${esc(d.nama)}</a></h3>
        <p class="meta">${ICON.pin}${esc(d.provinsi)}</p>
        <p class="clamp">${esc(d.deskripsi)}</p>
        <div class="card__foot">
          <span class="card__more" aria-hidden="true">Lihat di atlas ${ICON.arrow}</span>
          <span class="small muted">${esc(shortId(d.id))}</span>
        </div>
      </div>
    </li>`;
}

function renderPraktik() {
  const cocok = filterAktif === "Semua" ? DATA : DATA.filter((d) => katOf(d).includes(filterAktif));
  let tampil;
  if (filterAktif === "Semua" && UNGGULAN.length) {
    tampil = UNGGULAN.map((id) => DATA.find((d) => shortId(d.id) === id)).filter(Boolean);
  } else {
    tampil = cocok.slice(0, 6);
  }
  const grid = document.getElementById("praktikGrid");
  grid.innerHTML = tampil.map(kartuPraktik).join("");
  document.getElementById("praktikNote").textContent =
    filterAktif === "Semua"
      ? `Pilihan ${tampil.length} dari ${DATA.length} praktik di atlas.`
      : `Menampilkan ${tampil.length} dari ${cocok.length} praktik dengan fungsi ${filterAktif}.`;
  paintScenes(grid);
  observeReveal(grid);
}

function renderFilter() {
  const wrap = document.getElementById("praktikFilter");
  const opsi = ["Semua", ...Object.keys(KATEGORI).filter((k) => k !== "Lainnya")];
  wrap.innerHTML = opsi
    .map((o) => {
      const dot = KATEGORI[o] ? `<span class="dot" style="background:${KATEGORI[o].warna}" aria-hidden="true"></span>` : "";
      return `<button class="chip" data-filter="${o}" aria-pressed="${o === filterAktif}">${dot}${o}</button>`;
    })
    .join("");
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    filterAktif = btn.dataset.filter;
    wrap.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === btn)));
    renderPraktik();
  });
}

/* ---------- Langkah, cerita, wawasan ---------- */
function renderSteps() {
  document.getElementById("stepsGrid").innerHTML = LANGKAH.map(
    (s, i) => `
    <li class="step reveal">
      <span class="step__num" aria-hidden="true">${i + 1}</span>
      <span class="step__icon">${ICON[s.ikon]}</span>
      <h3><span class="visually-hidden">Langkah ${i + 1}: </span>${s.judul}</h3>
      <p>${s.isi}</p>
    </li>`
  ).join("");
}

function renderCerita() {
  const grid = document.getElementById("ceritaGrid");
  grid.innerHTML = CERITA.map(
    (c) => `
    <li class="card reveal">
      <div class="card__img" data-scene="${c.scene}"></div>
      <div class="card__body">
        <h3><a href="#kontak">${esc(c.judul)}</a></h3>
        <p class="clamp">${esc(c.ringkas)}</p>
        <div class="card__foot">
          <span class="meta">${ICON.pin}${esc(c.lokasi)}</span>
          <span class="small muted">${esc(c.tag)}</span>
        </div>
      </div>
    </li>`
  ).join("");
  paintScenes(grid);
}

function renderWawasan() {
  const w = WAWASAN;
  const wrap = document.getElementById("wawasanWrap");
  wrap.innerHTML = `
    <article class="w-main card reveal">
      <div class="w-main__img" data-scene="${w.utama.scene}"><span class="badge">✨ SOROTAN</span></div>
      <div class="card__body">
        <h3><a href="#kontak">${w.utama.judul}</a></h3>
        <p>${w.utama.isi}</p>
        <span class="card__more" aria-hidden="true">${w.utama.aksi} ${ICON.arrow}</span>
      </div>
    </article>
    <div class="w-list">
      ${w.daftar
        .map(
          (d) => `
        <article class="w-item card reveal">
          <div class="w-item__img" data-scene="${d.scene}"></div>
          <div class="w-item__body card__body">
            <h3><a href="#kontak">${d.judul}</a></h3>
            <p class="clamp">${d.isi}</p>
            <span class="w-item__label">${d.label}</span>
          </div>
        </article>`
        )
        .join("")}
    </div>`;
  paintScenes(wrap);
}

/* ---------- Pita atlas: jumlah per fungsi + peta mini ---------- */
function renderAtlasBand() {
  const hitung = {};
  DATA.forEach((d) => katOf(d).forEach((k) => (hitung[k] = (hitung[k] || 0) + 1)));
  document.getElementById("fungsiList").innerHTML = Object.entries(KATEGORI)
    .filter(([k]) => hitung[k])
    .map(
      ([k, v]) => `<li><span class="dot" style="background:${v.warna}" aria-hidden="true"></span>
        <span><strong>${k}</strong><small>${v.ket}</small></span><span class="num">${hitung[k]}</span></li>`
    )
    .join("");

  const P = window.PETA_ID;
  if (!P) return;
  const titik = DATA.map((d) => {
    const x = ((d.lng - P.L0) * P.k).toFixed(1);
    const y = ((P.T - d.lat) * P.k).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="9" fill="${KATEGORI[katOf(d)[0]].warna}" stroke="#fff" stroke-width="3"/>`;
  }).join("");
  document.getElementById("miniMap").innerHTML = `
    <svg class="mm" viewBox="0 0 ${P.w} ${P.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path d="${P.neigh}" fill="#2a7fb0"/>
      <path d="${P.idn}" fill="#e8f3fa"/>
      ${titik}
    </svg>`;
}

/* ---------- Prinsip, mitra, wilayah, footer ---------- */
function renderPrinsip() {
  document.getElementById("prinsipTags").innerHTML = PRINSIP.map((p) => `<li class="tag">${p}</li>`).join("");
  document.getElementById("mitraGrid").innerHTML = MITRA.map((m) => `<li class="mitra__item">${ICON[m.ikon]}<span>${m.nama}</span></li>`).join("");

  const scene = { Sumatra: "hutan", Jawa: "air", "Bali & Nusa Tenggara": "arsitektur", Kalimantan: "hutan", Sulawesi: "laut", Maluku: "laut", Papua: "hutan" };
  document.getElementById("wilayahGrid").innerHTML = WILAYAH.map((w) => {
    const n = DATA.filter((d) => d.pulau === w).length;
    return `<li><a href="atlas.html?pulau=${encodeURIComponent(w)}">
      <span class="wilayah__dot" data-scene="${scene[w]}" aria-hidden="true"></span>${w}
      <small>${n ? n + " praktik" : "segera"}</small></a></li>`;
  }).join("");

  document.getElementById("footerPraktik").innerHTML = (UNGGULAN.length ? UNGGULAN : DATA.map((d) => shortId(d.id)))
    .slice(0, 5)
    .map((id) => DATA.find((d) => shortId(d.id) === id))
    .filter(Boolean)
    .map((d) => `<li><a href="atlas.html#${encodeURIComponent(shortId(d.id))}">${esc(d.nama.split(":")[0])}</a></li>`)
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderFilter();
  renderPraktik();
  renderSteps();
  renderCerita();
  renderWawasan();
  renderAtlasBand();
  renderPrinsip();
  paintScenes();
  observeReveal();
});
