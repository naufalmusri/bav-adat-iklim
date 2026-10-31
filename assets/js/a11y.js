/* =========================================================
   MENU AKSESIBILITAS (buatan sendiri, tanpa layanan pihak ketiga)
   Buka/tutup: tombol di pojok kanan bawah atau Ctrl+U.
   Pengaturan disimpan di browser pengunjung (localStorage).
   ========================================================= */
(() => {
  const KEY = "bav-a11y-v1";
  const html = document.documentElement;

  /* ---------- Daftar fitur ---------- */
  const IC = {
    read: '<path d="M3 12h2l2-6 3 12 3-9 2 5 2-2h4"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18Z" fill="currentColor"/>',
    smart: '<circle cx="11" cy="12" r="8"/><path d="M11 4v16a8 8 0 0 0 0-16Z" fill="currentColor"/><circle cx="19" cy="18" r="3" fill="#fff"/><path d="M19 14.5v1M19 20.5v1M15.5 18h1M21.5 18h1"/>',
    links: '<path d="M9 17H7a5 5 0 0 1 0-10h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/>',
    bigText: '<path d="M3 7V5h8v2M7 5v14M5 19h4M13 10V9h8v1M17 9v10M15.5 19h3"/>',
    spacing: '<path d="M7 8l-4 4 4 4M17 8l4 4-4 4M9 12h1M12 12h1M15 12h-1"/>',
    anim: '<circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/><path d="M10 9v6M14 9v6"/>',
    hideImg: '<rect x="3" y="5" width="16" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 4 4"/><path d="M17 3l4 4M21 3l-4 4"/>',
    dyslexia: '<path d="M4 19V5h4a7 7 0 0 1 0 14H4ZM15 19V5h6M15 12h4"/>',
    cursor: '<path d="M5 3l14 7-6 2-2 6L5 3Z"/>',
    tooltip: '<path d="M4 4h16v12H9l-5 4V4Z"/><path d="M12 8v.01M12 11v3"/>',
    structure: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    lineHeight: '<path d="M5 4v16M3 6l2-2 2 2M3 18l2 2 2-2M10 6h11M10 10h11M10 14h11M10 18h11"/>',
    align: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
    saturation: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/><path d="M12 9v11" />',
  };

  const FITUR = [
    { k: "read", label: "Baca Halaman", levels: ["Aktif"] },
    { k: "contrast", label: "Kontras +", levels: ["Kontras gelap", "Kontras terang", "Warna terbalik"] },
    { k: "smart", label: "Kontras Cerdas", levels: ["Aktif"] },
    { k: "links", label: "Sorot Tautan", levels: ["Aktif"] },
    { k: "bigText", label: "Teks Lebih Besar", levels: ["Tingkat 1", "Tingkat 2", "Tingkat 3", "Tingkat 4"] },
    { k: "spacing", label: "Spasi Teks", levels: ["Renggang", "Lebih renggang", "Paling renggang"] },
    { k: "anim", label: "Animasi Dijeda", levels: ["Aktif"] },
    { k: "hideImg", label: "Sembunyikan Gambar", levels: ["Aktif"] },
    { k: "dyslexia", label: "Ramah Disleksia", levels: ["Huruf OpenDyslexic"] },
    { k: "cursor", label: "Kursor", levels: ["Besar hitam", "Besar putih", "Pemandu baca"] },
    { k: "tooltip", label: "Keterangan Alat", levels: ["Aktif"] },
    { k: "structure", label: "Struktur Halaman", action: true },
    { k: "lineHeight", label: "Tinggi Garis", levels: ["1,9×", "2,2×", "2,5×"] },
    { k: "align", label: "Perataan Teks", levels: ["Rata kiri", "Rata kiri-kanan", "Rata tengah", "Rata kanan"] },
    { k: "saturation", label: "Kejenuhan", levels: ["Rendah", "Tinggi", "Hitam putih"] },
  ];

  const PROFIL = [
    { id: "lowvision", label: "Gangguan penglihatan", ket: "Teks besar, kontras cerdas, tautan disorot, kursor besar", set: { bigText: 2, smart: 1, links: 1, cursor: 1 } },
    { id: "dyslexia", label: "Disleksia", ket: "Huruf OpenDyslexic, spasi dan tinggi garis lebih lega, rata kiri", set: { dyslexia: 1, spacing: 1, lineHeight: 1, align: 1 } },
    { id: "seizure", label: "Sensitif kejang", ket: "Animasi dijeda, warna diredam", set: { anim: 1, saturation: 1 } },
    { id: "adhd", label: "ADHD dan sulit fokus", ket: "Animasi dijeda, pemandu baca, warna diredam", set: { anim: 1, cursor: 3, saturation: 1 } },
    { id: "motor", label: "Disabilitas motorik", ket: "Tautan disorot, kursor besar, teks sedikit lebih besar", set: { links: 1, cursor: 1, bigText: 1 } },
    { id: "elderly", label: "Lansia", ket: "Teks besar, garis lega, kontras cerdas, kursor besar", set: { bigText: 2, lineHeight: 1, smart: 1, cursor: 1 } },
  ];

  /* ---------- Keadaan ---------- */
  let st = { f: {}, xl: false, profil: null };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };

  /* ---------- Bangun UI ---------- */
  const root = document.createElement("div");
  root.id = "a11y-root";
  root.innerHTML = `
    <button class="a11y-trigger" id="a11yTrigger" aria-expanded="false" aria-controls="a11yPanel" aria-label="Menu aksesibilitas (Ctrl+U)">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#fff" stroke="none"/><circle cx="12" cy="6.3" r="1.7" fill="currentColor" stroke="none"/><path d="M6.5 9.3 12 10.5l5.5-1.2M12 10.5v4.2M9.5 19l2.5-4.3 2.5 4.3" stroke="currentColor" stroke-width="1.9" fill="none"/></svg>
      <span class="a11y-trigger__dot" hidden></span>
    </button>
    <div class="a11y-panel" id="a11yPanel" role="dialog" aria-modal="true" aria-labelledby="a11yTitle" hidden>
      <div class="a11y-head">
        <h2 id="a11yTitle">Menu Aksesibilitas <span>(Ctrl+U)</span></h2>
        <button class="a11y-close" id="a11yClose" aria-label="Tutup menu aksesibilitas">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </div>
      <div class="a11y-body">
        <div class="a11y-row">
          <button class="a11y-rowbtn" id="a11yProfilBtn" aria-expanded="false" aria-controls="a11yProfil">
            <span class="a11y-ico a11y-ico--dark"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2"/><path d="M5 9l7 1.5L19 9M12 10.5V15M9 21l3-6 3 6"/></svg></span>
            <span>Profil Aksesibilitas <small id="a11yProfilNow"></small></span>
            <svg class="a11y-caret" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
          </button>
          <ul class="a11y-profil" id="a11yProfil" hidden>
            ${PROFIL.map((p) => `<li><button class="a11y-pbtn" data-p="${p.id}" aria-pressed="false"><strong>${p.label}</strong><small>${p.ket}</small></button></li>`).join("")}
          </ul>
        </div>
        <div class="a11y-row a11y-row--switch">
          <span class="a11y-xl" aria-hidden="true">XL</span>
          <span id="a11yXlLabel">Widget besar</span>
          <button class="a11y-switch" id="a11yXl" role="switch" aria-checked="false" aria-labelledby="a11yXlLabel"><span></span></button>
        </div>
        <div class="a11y-grid" id="a11yGrid">
          ${FITUR.map((f) => `
            <button class="a11y-tile" data-k="${f.k}" ${f.action ? 'aria-haspopup="dialog"' : 'aria-pressed="false"'}>
              <svg viewBox="0 0 24 24" aria-hidden="true">${IC[f.k]}</svg>
              <span class="a11y-tile__label">${f.label}</span>
              <span class="a11y-tile__state" aria-hidden="true"></span>
              ${f.levels && f.levels.length > 1 ? `<span class="a11y-steps" aria-hidden="true">${f.levels.map(() => "<i></i>").join("")}</span>` : ""}
              <span class="a11y-check" aria-hidden="true">✓</span>
            </button>`).join("")}
        </div>
        <button class="a11y-reset" id="a11yReset">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/></svg>
          Atur Ulang Semua Pengaturan
        </button>
      </div>
      <div class="a11y-foot">
        <a href="#kontak" id="a11yStatement">Pernyataan aksesibilitas</a>
        <span>Bentang Alam Advisory</span>
      </div>
      <p class="visually-hidden" id="a11yLive" aria-live="polite"></p>
    </div>

    <div class="a11y-modal" id="a11yStruct" role="dialog" aria-modal="true" aria-labelledby="a11yStructTitle" hidden>
      <div class="a11y-modal__box">
        <div class="a11y-head">
          <h2 id="a11yStructTitle">Struktur Halaman</h2>
          <button class="a11y-close" id="a11yStructClose" aria-label="Tutup struktur halaman"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        </div>
        <div class="a11y-tabs" role="tablist" aria-label="Jenis struktur">
          <button role="tab" id="tab-h" aria-selected="true" aria-controls="pane-s" data-t="h">Judul</button>
          <button role="tab" id="tab-l" aria-selected="false" aria-controls="pane-s" data-t="l" tabindex="-1">Landmark</button>
          <button role="tab" id="tab-a" aria-selected="false" aria-controls="pane-s" data-t="a" tabindex="-1">Tautan</button>
        </div>
        <div id="pane-s" role="tabpanel" aria-labelledby="tab-h" class="a11y-struct"></div>
      </div>
    </div>

    <div class="a11y-readbar" id="a11yReadbar" role="region" aria-label="Kontrol pembaca halaman" hidden>
      <span>🔊 Mode baca aktif. Klik teks untuk dibacakan.</span>
      <button id="a11yReadAll">Baca seluruh halaman</button>
      <button id="a11yReadStop">Berhenti</button>
    </div>
    <div class="a11y-guide" id="a11yGuide" aria-hidden="true" hidden></div>
    <div class="a11y-tip" id="a11yTip" role="tooltip" hidden></div>`;
  document.body.appendChild(root);

  const $ = (id) => document.getElementById(id);
  const panel = $("a11yPanel"), trigger = $("a11yTrigger");
  const announce = (t) => { $("a11yLive").textContent = ""; setTimeout(() => ($("a11yLive").textContent = t), 30); };

  /* ---------- Terapkan pengaturan ---------- */
  const SCALE = [1, 1.15, 1.3, 1.5, 1.75];

  function apply() {
    const f = st.f;
    const attr = (name, v) => (v ? html.setAttribute(`data-a11y-${name}`, String(v)) : html.removeAttribute(`data-a11y-${name}`));
    ["contrast", "smart", "links", "spacing", "anim", "hideImg", "dyslexia", "cursor", "tooltip", "lineHeight", "align", "saturation", "read"].forEach((k) =>
      attr(k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()), f[k] || 0)
    );
    html.style.fontSize = f.bigText ? `${SCALE[f.bigText] * 100}%` : "";
    html.classList.toggle("a11y-compact-nav", (f.bigText || 0) >= 2);

    const filters = [];
    if (f.contrast === 3) filters.push("invert(1) hue-rotate(180deg)");
    if (f.saturation === 1) filters.push("saturate(0.45)");
    if (f.saturation === 2) filters.push("saturate(1.7)");
    if (f.saturation === 3) filters.push("grayscale(1)");
    if (filters.length) html.style.setProperty("--a11y-filter", filters.join(" "));
    else html.style.removeProperty("--a11y-filter");
    html.toggleAttribute("data-a11y-filter", filters.length > 0);

    root.classList.toggle("is-xl", !!st.xl);
    $("a11yXl").setAttribute("aria-checked", String(!!st.xl));

    $("a11yGuide").hidden = f.cursor !== 3;
    $("a11yReadbar").hidden = !f.read;
    if (!f.read) stopReading();
    if (!f.tooltip) $("a11yTip").hidden = true;

    // perbarui tile
    FITUR.forEach((def) => {
      if (def.action) return;
      const tile = root.querySelector(`.a11y-tile[data-k="${def.k}"]`);
      const lv = f[def.k] || 0;
      tile.setAttribute("aria-pressed", String(lv > 0));
      tile.classList.toggle("is-on", lv > 0);
      tile.querySelector(".a11y-tile__state").textContent = lv ? def.levels[lv - 1] : "";
      tile.setAttribute("aria-label", `${def.label}: ${lv ? def.levels[lv - 1] : "mati"}${def.levels.length > 1 ? `. Tekan untuk ${lv < def.levels.length ? "tingkat berikutnya" : "mematikan"}` : ""}`);
      tile.querySelectorAll(".a11y-steps i").forEach((i, n) => i.classList.toggle("on", n < lv));
    });
    root.querySelectorAll(".a11y-pbtn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === st.profil)));
    const p = PROFIL.find((x) => x.id === st.profil);
    $("a11yProfilNow").textContent = p ? `· ${p.label}` : "";

    const anyOn = Object.values(f).some(Boolean) || st.xl;
    root.querySelector(".a11y-trigger__dot").hidden = !anyOn;

    document.dispatchEvent(new CustomEvent("a11y:change", { detail: st }));
    save();
  }

  /* ---------- Buka / tutup panel (dengan jebakan fokus) ---------- */
  let returnFocus = null;
  function openPanel() {
    returnFocus = document.activeElement;
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    $("a11yClose").focus();
  }
  function closePanel() {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    (returnFocus && document.contains(returnFocus) ? returnFocus : trigger).focus();
  }
  const togglePanel = () => (panel.hidden ? openPanel() : closePanel());

  function trapFocus(container, e) {
    const items = [...container.querySelectorAll('button:not([hidden]), a[href], [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  trigger.addEventListener("click", togglePanel);
  $("a11yClose").addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "u") { e.preventDefault(); togglePanel(); return; }
    if (!$("a11yStruct").hidden) {
      if (e.key === "Escape") closeStruct();
      if (e.key === "Tab") trapFocus($("a11yStruct"), e);
      return;
    }
    if (!panel.hidden) {
      if (e.key === "Escape") closePanel();
      if (e.key === "Tab") trapFocus(panel, e);
    }
  });
  $("a11yStatement").addEventListener("click", () => closePanel());

  /* ---------- Tile ---------- */
  $("a11yGrid").addEventListener("click", (e) => {
    const tile = e.target.closest(".a11y-tile");
    if (!tile) return;
    const def = FITUR.find((x) => x.k === tile.dataset.k);
    if (def.action) return openStruct();
    const cur = st.f[def.k] || 0;
    const next = cur >= def.levels.length ? 0 : cur + 1;
    st.f[def.k] = next;
    st.profil = null;
    if (def.k === "read" && next && !("speechSynthesis" in window)) {
      st.f.read = 0;
      announce("Browser ini belum mendukung fitur baca halaman.");
    }
    apply();
    announce(`${def.label}: ${next ? def.levels[next - 1] : "mati"}`);
  });

  /* ---------- Profil ---------- */
  $("a11yProfilBtn").addEventListener("click", () => {
    const open = $("a11yProfil").hidden;
    $("a11yProfil").hidden = !open;
    $("a11yProfilBtn").setAttribute("aria-expanded", String(open));
  });
  $("a11yProfil").addEventListener("click", (e) => {
    const b = e.target.closest(".a11y-pbtn");
    if (!b) return;
    const p = PROFIL.find((x) => x.id === b.dataset.p);
    if (st.profil === p.id) { st.f = {}; st.profil = null; announce(`Profil ${p.label} dimatikan`); }
    else { st.f = { ...p.set }; st.profil = p.id; announce(`Profil ${p.label} aktif: ${p.ket}`); }
    apply();
  });

  $("a11yXl").addEventListener("click", () => { st.xl = !st.xl; apply(); announce(st.xl ? "Widget besar aktif" : "Widget besar mati"); });
  $("a11yReset").addEventListener("click", () => { st = { f: {}, xl: false, profil: null }; apply(); announce("Semua pengaturan aksesibilitas dikembalikan ke awal"); });

  /* ---------- Baca halaman (Web Speech API) ---------- */
  const TEXT_SEL = "h1,h2,h3,h4,p,li,a,button,label,summary,td,th,figcaption,dt,dd";
  let reading = null;
  function pickVoice() {
    const v = speechSynthesis.getVoices();
    return v.find((x) => x.lang === "id-ID") || v.find((x) => x.lang.startsWith("id")) || null;
  }
  function textOf(el) {
    return (el.getAttribute("aria-label") || el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  }
  function speak(el, onend) {
    const text = textOf(el);
    if (!text) return onend && onend();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID";
    const v = pickVoice();
    if (v) u.voice = v;
    document.querySelectorAll(".a11y-reading").forEach((x) => x.classList.remove("a11y-reading"));
    el.classList.add("a11y-reading");
    u.onend = () => { el.classList.remove("a11y-reading"); onend && onend(); };
    speechSynthesis.speak(u);
  }
  function stopReading() {
    reading = null;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    document.querySelectorAll(".a11y-reading").forEach((x) => x.classList.remove("a11y-reading"));
  }
  document.addEventListener("click", (e) => {
    if (!st.f.read || e.target.closest("#a11y-root")) return;
    const el = e.target.closest(TEXT_SEL);
    if (!el || !el.closest(".nav, main, footer")) return;
    stopReading();
    speak(el);
  }, true);
  $("a11yReadAll").addEventListener("click", () => {
    stopReading();
    const blocks = [...document.querySelectorAll("main h1, main h2, main h3, main p, main li:not(:has(li))")].filter((el) => el.offsetParent !== null && textOf(el));
    reading = { i: 0 };
    const token = reading;
    const next = () => { if (reading !== token || token.i >= blocks.length) return; const el = blocks[token.i++]; el.scrollIntoView({ block: "center", behavior: "auto" }); speak(el, next); };
    next();
  });
  $("a11yReadStop").addEventListener("click", stopReading);

  /* ---------- Pemandu baca ---------- */
  document.addEventListener("mousemove", (e) => { if (st.f.cursor === 3) $("a11yGuide").style.top = `${e.clientY - 18}px`; }, { passive: true });

  /* ---------- Keterangan alat ---------- */
  const TIP_SEL = "[aria-label], [title], img[alt], abbr";
  function showTip(el) {
    const text = el.getAttribute("aria-label") || el.getAttribute("title") || el.getAttribute("alt");
    if (!text || el.closest("#a11y-root")) return;
    const tip = $("a11yTip");
    tip.textContent = text;
    tip.hidden = false;
    const r = el.getBoundingClientRect();
    const top = r.bottom + 8 + tip.offsetHeight > innerHeight ? r.top - tip.offsetHeight - 8 : r.bottom + 8;
    tip.style.top = `${Math.max(8, top)}px`;
    tip.style.left = `${Math.min(innerWidth - tip.offsetWidth - 8, Math.max(8, r.left))}px`;
  }
  ["mouseover", "focusin"].forEach((ev) =>
    document.addEventListener(ev, (e) => { if (!st.f.tooltip) return; const el = e.target.closest && e.target.closest(TIP_SEL); el ? showTip(el) : ($("a11yTip").hidden = true); })
  );

  /* ---------- Struktur halaman ---------- */
  let structReturn = null;
  function openStruct() {
    structReturn = document.activeElement;
    $("a11yStruct").hidden = false;
    renderStruct("h");
    $("tab-h").focus();
  }
  function closeStruct() {
    $("a11yStruct").hidden = true;
    (structReturn || trigger).focus();
  }
  $("a11yStructClose").addEventListener("click", closeStruct);
  $("a11yStruct").addEventListener("click", (e) => { if (e.target.id === "a11yStruct") closeStruct(); });

  const tabs = [...root.querySelectorAll(".a11y-tabs [role=tab]")];
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => renderStruct(t.dataset.t));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); renderStruct(n.dataset.t);
      }
    });
  });

  function visible(el) { return el.offsetParent !== null || el.getClientRects().length > 0; }
  function renderStruct(type) {
    tabs.forEach((t) => { const on = t.dataset.t === type; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    $("pane-s").setAttribute("aria-labelledby", `tab-${type}`);
    let items = [];
    if (type === "h") {
      items = [...document.querySelectorAll(".nav h1, main h1, main h2, main h3, main h4, footer h2")].filter(visible)
        .map((el) => ({ el, text: textOf(el), meta: el.tagName, indent: +el.tagName[1] - 1 }));
    } else if (type === "l") {
      const nm = { HEADER: "Kepala halaman", NAV: "Navigasi", MAIN: "Konten utama", FOOTER: "Kaki halaman", SECTION: "Bagian", ASIDE: "Samping" };
      items = [...document.querySelectorAll("header, nav, main, footer, section[aria-label], section[aria-labelledby], aside")].filter((el) => visible(el) && !el.closest("#a11y-root"))
        .map((el) => {
          const lb = el.getAttribute("aria-label") || (el.getAttribute("aria-labelledby") && document.getElementById(el.getAttribute("aria-labelledby"))?.textContent) || "";
          return { el, text: lb.trim() || nm[el.tagName], meta: nm[el.tagName], indent: 0 };
        });
    } else {
      items = [...document.querySelectorAll("main a[href], footer a[href], .nav a[href]")].filter((el) => visible(el))
        .map((el) => ({ el, text: textOf(el) || el.getAttribute("href"), meta: el.target === "_blank" ? "tab baru" : "", indent: 0 }));
    }
    $("pane-s").innerHTML = items.length
      ? `<ul>${items.map((it, i) => `<li style="--in:${it.indent}"><button data-i="${i}"><span class="a11y-tag">${it.meta}</span>${it.text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))}</button></li>`).join("")}</ul>`
      : "<p>Tidak ada elemen.</p>";
    $("pane-s").onclick = (e) => {
      const b = e.target.closest("button[data-i]");
      if (!b) return;
      const el = items[+b.dataset.i].el;
      $("a11yStruct").hidden = true;
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (!el.matches("a, button, input, select, textarea, [tabindex]")) el.setAttribute("tabindex", "-1");
      el.scrollIntoView({ block: "center" });
      el.focus({ preventScroll: true });
    };
  }

  apply();
})();
