/* =========================================================
   ATLAS ADAT & IKLIM
   Peta (Leaflet) + daftar yang setara isinya, untuk pengguna
   pembaca layar dan keyboard. Detail dibuka lewat #ID di URL,
   jadi setiap praktik punya tautan sendiri.
   ========================================================= */

const DATA = window.ATLAS_DATA || [];
const state = { q: "", pulau: "", fungsi: new Set(), selected: null };
let map, cluster, markers = {}, lastFocus = null;

const $ = (id) => document.getElementById(id);

/* ---------- Saringan ---------- */
function cocok(d) {
  if (state.pulau && d.pulau !== state.pulau) return false;
  if (state.fungsi.size && !katOf(d).some((k) => state.fungsi.has(k))) return false;
  if (state.q) {
    const hay = `${d.nama} ${d.lokasi} ${d.provinsi} ${d.deskripsi} ${d.kategori.join(" ")}`.toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }
  return true;
}

function initTools() {
  const pulauSet = [...new Set(DATA.map((d) => d.pulau))];
  const urutan = WILAYAH.filter((w) => pulauSet.includes(w));
  $("pulau").insertAdjacentHTML("beforeend", urutan.map((p) => `<option value="${esc(p)}">${esc(p)} (${DATA.filter((d) => d.pulau === p).length})</option>`).join(""));

  const hitung = {};
  DATA.forEach((d) => katOf(d).forEach((k) => (hitung[k] = (hitung[k] || 0) + 1)));
  $("fungsiChips").innerHTML = Object.entries(KATEGORI)
    .filter(([k]) => hitung[k])
    .map(([k, v]) => `<button class="chip" data-k="${k}" aria-pressed="false"><span class="dot" style="background:${v.warna}" aria-hidden="true"></span>${k} <span class="small">(${hitung[k]})</span></button>`)
    .join("");

  $("legend").innerHTML = "<strong>Fungsi iklim utama</strong>" + Object.entries(KATEGORI)
    .filter(([k]) => hitung[k])
    .map(([k, v]) => `<span><i style="background:${v.warna};color:${k === "Mengatur" || k === "Lainnya" ? "#fff" : "#000"}">${v.kode}</i>${k}</span>`)
    .join("");

  const params = new URLSearchParams(location.search);
  if (params.get("pulau")) { state.pulau = params.get("pulau"); $("pulau").value = state.pulau; }
  if (params.get("fungsi")) params.get("fungsi").split(",").forEach((k) => state.fungsi.add(k));
  if (params.get("tampilan") === "daftar") setMapHidden(true);
  syncChips();

  let t;
  $("q").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); refresh(true); }, 200); });
  $("pulau").addEventListener("change", (e) => { state.pulau = e.target.value; refresh(true); });
  $("fungsiChips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    state.fungsi.has(b.dataset.k) ? state.fungsi.delete(b.dataset.k) : state.fungsi.add(b.dataset.k);
    syncChips();
    refresh(true);
  });
  $("resetFilter").addEventListener("click", () => {
    state.q = ""; state.pulau = ""; state.fungsi.clear();
    $("q").value = ""; $("pulau").value = "";
    syncChips(); refresh(true);
    $("q").focus();
  });
  $("toggleMap").addEventListener("click", () => setMapHidden(!$("atlasBody").classList.contains("map-hidden")));
}

function syncChips() {
  document.querySelectorAll("#fungsiChips .chip").forEach((c) => c.setAttribute("aria-pressed", String(state.fungsi.has(c.dataset.k))));
}

function setMapHidden(hidden) {
  $("atlasBody").classList.toggle("map-hidden", hidden);
  $("toggleMap").setAttribute("aria-pressed", String(hidden));
  $("toggleMap").textContent = hidden ? "Tampilkan peta" : "Sembunyikan peta";
  if (!hidden && map) setTimeout(() => map.invalidateSize(), 50);
}

/* ---------- Daftar ---------- */
function renderList(items) {
  $("count").textContent = items.length === DATA.length
    ? `Menampilkan semua ${DATA.length} praktik`
    : `Menampilkan ${items.length} dari ${DATA.length} praktik`;
  $("alist").innerHTML = items.length
    ? items.map((d) => {
        const k = KATEGORI[katOf(d)[0]];
        return `<li><button class="aitem${state.selected === d ? " is-active" : ""}" data-id="${esc(shortId(d.id))}">
          <span class="pin ${katOf(d)[0] === "Mengatur" || katOf(d)[0] === "Lainnya" ? "on-blue" : ""}" style="--c:${k.warna};width:30px;height:30px" aria-hidden="true"><b>${k.kode}</b></span>
          <span>
            <span class="aitem__name">${esc(d.nama)}</span>
            <span class="aitem__loc">${esc(d.lokasi)}</span>
            <span class="badges">${katOf(d).map(badgeHTML).join("")}</span>
          </span>
        </button></li>`;
      }).join("")
    : `<li class="empty">Tidak ada praktik yang cocok. Coba kata kunci lain atau atur ulang saringan.</li>`;
}

/* ---------- Peta ---------- */
function pinIcon(d) {
  const k0 = katOf(d)[0];
  const k = KATEGORI[k0];
  return L.divIcon({
    className: "pin-wrap",
    html: `<span class="pin ${k0 === "Mengatur" || k0 === "Lainnya" ? "on-blue" : ""}" style="--c:${k.warna}"><b>${k.kode}</b></span>`,
    iconSize: [34, 34],
    iconAnchor: [5, 34],
  });
}

function initMap() {
  map = L.map("map", { zoomControl: true, minZoom: 4, maxZoom: 15, keyboard: true }).setView([-2.5, 118], 5);

  const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">kontributor OpenStreetMap</a>';
  const key = (typeof PETA !== "undefined" && PETA.cartoKey) || "";
  const tiles = (key
    ? L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(key)}`, {
        attribution: `${osmAttr} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
        subdomains: "abcd",
        maxZoom: 19,
      })
    : L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: `${osmAttr} · <a href="https://www.openstreetmap.org/fixthemap">Laporkan kesalahan peta</a>`,
        maxZoom: 19,
        referrerPolicy: "strict-origin-when-cross-origin", // diwajibkan kebijakan ubin OSM
      })
  ).addTo(map);

  // Cadangan bila ubin peta gagal dimuat (offline, diblokir jaringan, dsb.)
  let fallback = false, tileOk = false;
  tiles.on("tileload", () => (tileOk = true));
  setTimeout(() => { if (!tileOk) tiles.fire("tileerror"); }, 5000);
  tiles.on("tileerror", () => {
    if (fallback || tileOk || !window.PETA_ID) return;
    fallback = true;
    const P = window.PETA_ID;
    // setiap pulau jadi poligon tersendiri (bukan lubang dari pulau pertama)
    const rings = (d) => d.split("Z").filter(Boolean).map((r) => [
      r.replace("M", "").split("L").map((pt) => { const [x, y] = pt.split(",").map(Number); return [P.T - y / P.k, x / P.k + P.L0]; }),
    ]);
    L.polygon(rings(P.neigh), { color: "#8fa3b3", weight: 1, fillColor: "#dfe5ea", fillOpacity: 1, interactive: false }).addTo(map);
    L.polygon(rings(P.idn), { color: "#0072b2", weight: 1, fillColor: "#ffffff", fillOpacity: 1, interactive: false }).addTo(map);
    $("map").style.background = "#b9d4e5";
  });

  cluster = L.markerClusterGroup({
    maxClusterRadius: 38,
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    iconCreateFunction: (c) => {
      const n = c.getChildCount();
      const s = n < 5 ? 38 : n < 15 ? 46 : 54;
      return L.divIcon({ html: `<span class="cluster" style="width:${s}px;height:${s}px">${n}</span>`, className: "marker-cluster", iconSize: [s, s] });
    },
  });
  map.addLayer(cluster);

  DATA.forEach((d) => {
    const m = L.marker([d.lat, d.lng], { icon: pinIcon(d), title: `${d.nama}, ${d.provinsi}`, alt: d.nama, keyboard: true, riseOnHover: true });
    m.on("click", () => select(d, { fromMap: true }));
    m.on("keypress", (e) => { if (e.originalEvent.key === "Enter" || e.originalEvent.key === " ") select(d, { fromMap: true }); });
    markers[d.id] = m;
  });
}

function renderMap(items, fit) {
  if (!map) return;
  cluster.clearLayers();
  cluster.addLayers(items.map((d) => markers[d.id]));
  if (fit && items.length) {
    const b = L.latLngBounds(items.map((d) => [d.lat, d.lng]));
    map.fitBounds(b.pad(0.15), { maxZoom: 9, animate: !reduceMotion() });
  }
}

function highlightMarker(d) {
  Object.values(markers).forEach((m) => m._icon && m._icon.classList.remove("is-active"));
  if (!d || !map) return;
  const m = markers[d.id];
  cluster.zoomToShowLayer(m, () => {
    if (m._icon) m._icon.classList.add("is-active");
  });
}

/* ---------- Detail ---------- */
function linkLuar(url, teks) {
  return `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(teks)} <span class="ext-hint">(tautan luar, tab baru)</span></a>`;
}

function renderDetail(d) {
  const flag = d.statusSumber === "artikel"
    ? `<p class="note">${ICON.warn}<span><strong>Sumber berupa artikel.</strong> Sumber utama entri ini artikel populer, bukan kajian ilmiah. Perlakukan sebagai indikasi awal.</span></p>`
    : d.statusSumber === "tak-tertelusur"
    ? `<p class="note">${ICON.warn}<span><strong>Tautan belum tertelusur.</strong> Tautan sumber utama tidak bisa dibuka saat kurasi. Rujukan jurnal di bawah tetap dapat diperiksa.</span></p>`
    : "";

  const sumber = d.sumber.length
    ? `<h3>Sumber utama</h3><ul class="src">${d.sumber.map((s) => `<li>${s.url ? linkLuar(s.url, s.teks) : esc(s.teks)}${s.jenis === "pdf" ? ' <span class="small muted">(dokumen kajian, arsip BAV)</span>' : ""}</li>`).join("")}</ul>`
    : "";
  const jurnal = d.jurnal.length
    ? `<h3>Jurnal pendukung</h3><ol>${d.jurnal.map((j) => `<li>${esc(j.teks)}${j.url ? `<br>${linkLuar(j.url, "Buka sumber")}` : ""}</li>`).join("")}</ol>`
    : "";
  const media = d.mediaSumber ? `<h3>Sumber media</h3><p>${linkLuar(d.mediaSumber, new URL(d.mediaSumber).hostname.replace("www.", ""))}</p>` : "";
  const gmaps = `https://www.google.com/maps?q=${d.lat},${d.lng}`;

  $("atlasDetail").innerHTML = `
    <button class="adetail__back" id="backBtn">${ICON.back} Kembali ke daftar</button>
    <div class="adetail__img" data-scene="${sceneFor(d)}" aria-hidden="true"></div>
    <p class="adetail__id">${esc(d.id)}</p>
    <h2 id="detailTitle">${esc(d.nama)}</h2>
    <p class="meta">${ICON.pin}${esc(d.lokasi)}</p>
    <div class="badges" aria-label="Fungsi iklim">${katOf(d).map(badgeHTML).join("")}</div>
    ${flag}
    <h3>Deskripsi</h3>
    <p class="desc">${esc(d.deskripsi) || "<em>Deskripsi belum tersedia.</em>"}</p>
    ${jurnal}
    ${sumber}
    ${media}
    <h3>Lokasi</h3>
    <p>${esc(d.provinsi)} · ${d.pulau}<br><span class="small muted">Koordinat ${d.lat}, ${d.lng}</span></p>
    <div class="adetail__actions">
      <a class="btn btn--outline btn--sm" href="${gmaps}" target="_blank" rel="noopener">Buka di Google Maps <span class="visually-hidden">(tab baru)</span></a>
      <button class="btn btn--primary btn--sm" id="copyLink">Salin tautan praktik ini</button>
    </div>`;
  paintScenes($("atlasDetail"));
  $("backBtn").addEventListener("click", () => closeDetail(true));
  $("copyLink").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); toast("Tautan disalin."); }
    catch { toast("Gagal menyalin. Salin dari bilah alamat."); }
  });
}

function select(d, { fromMap = false, push = true } = {}) {
  lastFocus = fromMap ? null : document.activeElement;
  state.selected = d;
  renderDetail(d);
  $("atlasList").hidden = true;
  $("atlasDetail").hidden = false;
  $("atlasDetail").parentElement.scrollTop = 0;
  if (push) history.pushState(null, "", `#${shortId(d.id)}`);
  document.title = `${d.nama} | Atlas Adat & Iklim`;
  highlightMarker(d);
  $("detailTitle").setAttribute("tabindex", "-1");
  $("detailTitle").focus({ preventScroll: true });
  if (window.innerWidth <= 900) $("atlasDetail").scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
}

function closeDetail(push) {
  const prev = state.selected;
  state.selected = null;
  $("atlasDetail").hidden = true;
  $("atlasList").hidden = false;
  document.title = "Atlas Adat & Iklim | Bentang Alam Advisory";
  if (push) history.pushState(null, "", location.pathname + location.search);
  highlightMarker(null);
  const btn = prev && document.querySelector(`.aitem[data-id="${CSS.escape(shortId(prev.id))}"]`);
  (btn || $("atlasList")).focus();
}

function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const d = id && DATA.find((x) => shortId(x.id) === id || x.id === id);
  if (d) select(d, { push: false });
  else if (state.selected) closeDetail(false);
}

/* ---------- Gabungan ---------- */
function refresh(fit) {
  const items = DATA.filter(cocok);
  renderList(items);
  renderMap(items, fit);
}

document.addEventListener("DOMContentLoaded", () => {
  const prov = new Set(DATA.map((d) => d.provinsi)).size;
  $("atlasIntro").textContent = `${DATA.length} praktik adat dari ${prov} provinsi yang hubungannya dengan iklim sudah ditelusuri ke sumber. Klik penanda di peta atau pilih dari daftar untuk membaca deskripsi dan rujukannya.`;

  initTools();
  if (window.L) initMap();
  else $("map").innerHTML = '<p class="empty">Peta gagal dimuat. Daftar praktik tetap bisa dipakai.</p>';
  refresh(true);

  $("alist").addEventListener("click", (e) => {
    const b = e.target.closest(".aitem");
    if (b) select(DATA.find((d) => shortId(d.id) === b.dataset.id));
  });
  window.addEventListener("popstate", openFromHash);
  openFromHash();

  // Hentikan animasi peta bila pengguna menyalakan "Animasi dijeda"
  document.addEventListener("a11y:change", () => map && map.invalidateSize());
});
