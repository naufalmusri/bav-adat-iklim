/* =========================================================
   FUNGSI BERSAMA (dipakai beranda & atlas)
   ========================================================= */

/* ---------- Ilustrasi SVG pengganti foto, warna BAV ---------- */
const SCENES = {
  air: { sky: ["#bfe0f3", "#eef7fc"], hills: ["#6cc4a4", "#009e73", "#00664a"], extra: "terrace" },
  laut: { sky: ["#9fd3f1", "#e8f5fc"], hills: ["#56b4e9", "#0072b2", "#00405f"], extra: "waves" },
  hutan: { sky: ["#d3efe4", "#f4fbf8"], hills: ["#3fb68e", "#009e73", "#004d38"], extra: "trees" },
  malam: { sky: ["#00283d", "#0072b2"], hills: ["#00405f", "#003049", "#001b29"], extra: "stars" },
  arsitektur: { sky: ["#fdf6c9", "#fffbe6"], hills: ["#8fd6bd", "#3fb68e", "#00805d"], extra: "cones" },
};

function sceneSVG(key) {
  const s = SCENES[key] || SCENES.air;
  const [h1, h2, h3] = s.hills;
  let extra = "";
  if (s.extra === "terrace") {
    for (let i = 0; i < 5; i++) extra += `<path d="M0 ${150 + i * 14} Q200 ${135 + i * 14} 400 ${150 + i * 14}" stroke="#00664a" stroke-opacity=".35" fill="none" stroke-width="2"/>`;
  } else if (s.extra === "waves") {
    for (let i = 0; i < 4; i++) extra += `<path d="M0 ${160 + i * 12} q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#fff" stroke-opacity=".55" fill="none" stroke-width="2"/>`;
  } else if (s.extra === "trees") {
    for (let i = 0; i < 9; i++) { const x = 20 + i * 45, y = 150 - (i % 3) * 10; extra += `<path d="M${x} ${y} l14 -38 l14 38 Z" fill="#004d38" opacity=".85"/>`; }
  } else if (s.extra === "stars") {
    for (let i = 0; i < 40; i++) extra += `<circle cx="${(i * 97) % 400}" cy="${(i * 53) % 110}" r="${i % 4 === 0 ? 1.8 : 1}" fill="${i % 5 === 0 ? "#f0e442" : "#fff"}" opacity=".9"/>`;
    extra += `<path d="M150 210 L230 120 L310 210 Z" fill="#001b29"/>`;
  } else if (s.extra === "cones") {
    extra += `<circle cx="330" cy="55" r="22" fill="#e69f00" opacity=".85"/>`;
    [[80, 1], [170, 1.25], [270, 1.05]].forEach(([x, k]) => {
      extra += `<path d="M${x} 175 l${30 * k} -${70 * k} l${30 * k} ${70 * k} Z" fill="#4a3b2a"/><path d="M${x + 6 * k} 175 l${24 * k} -${52 * k} l${24 * k} ${52 * k}" fill="#6b5640"/>`;
    });
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient></defs>
    <rect width="400" height="225" fill="url(#g)"/>
    <path d="M0 120 Q90 60 180 110 T400 95 V225 H0Z" fill="${h1}"/>
    <path d="M0 150 Q120 105 240 145 T400 135 V225 H0Z" fill="${h2}"/>
    ${extra}
    <path d="M0 195 Q140 170 260 192 T400 188 V225 H0Z" fill="${h3}"/>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function paintScenes(root = document) {
  root.querySelectorAll("[data-scene]").forEach((el) => (el.style.backgroundImage = sceneSVG(el.dataset.scene)));
}

/* Ilustrasi menurut fungsi iklim utama sebuah praktik */
function sceneFor(item) {
  const k = (item.kategori && item.kategori[0]) || "";
  const tests = [
    ["arsitektur", /\b(rumah|rumoh|arsitektur|sa.o ngaza|kampung pitu)\b/],
    ["laut", /\b(laut|laot|pesisir|nelayan|sasi|lilifuk|tasi|tappareng|perairan|danau)\b/],
    ["malam", /\b(bintang|kalender|mangsa|nyale)\b/],
    ["air", /\b(sawah|irigasi|mata air|subak|sendang|bondar|blang|lubuk|surjan)\b/],
    ["hutan", /\b(hutan|rimbo|uteun|leuweung|damar|tembawang|kaleka|himba|olen|marga)\b/],
  ];
  for (const teks of [item.nama.toLowerCase(), item.deskripsi.toLowerCase()]) {
    for (const [scene, re] of tests) if (re.test(teks)) return scene;
  }
  return k === "Pengamatan" ? "malam" : k === "Adaptasi" ? "arsitektur" : "hutan";
}

/* ---------- Ikon ---------- */
const ICON = {
  pin: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  arrow: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
  ext: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
  spark: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
  shield: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  send: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 3 3 10l7 3 3 7 8-17Z"/><path d="m10 13 4-4"/></svg>',
  doc: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 3H6v18h12V7l-4-4Z"/><path d="M14 3v4h4M9 13h6M9 17h4"/></svg>',
  users: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.4 0 4 1.6 4.5 4.5"/></svg>',
  access: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="4.5" r="2"/><path d="M5 8.5l7 1.5 7-1.5M12 10v5M9 21l3-6 3 6"/></svg>',
  cap: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/></svg>',
  gov: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 10h18L12 4 3 10Z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>',
  mic: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  warn: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/></svg>',
};

/* ---------- Utilitas ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shortId = (id) => id.split("/")[0];
const katOf = (item) => (item.kategori && item.kategori.length ? item.kategori : ["Lainnya"]);
const badgeHTML = (k) => `<span class="badge k-${esc(k)}">${esc(k)}</span>`;

function applySite() {
  document.querySelectorAll('[data-site="tagline"]').forEach((el) => (el.textContent = SITE.tagline));
  document.querySelectorAll('[data-site="email"]').forEach((el) => {
    el.textContent = SITE.email;
    el.href = `mailto:${SITE.email}`;
  });
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* ---------- Navbar: menu mobile & dropdown yang ramah keyboard ---------- */
function initNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("menu-utama");
  const closeDropdowns = (except) =>
    menu.querySelectorAll(".dropdown__btn").forEach((b) => {
      if (b === except) return;
      b.setAttribute("aria-expanded", "false");
      document.getElementById(b.getAttribute("aria-controls")).classList.remove("is-open");
    });

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  menu.querySelectorAll(".dropdown__btn").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      closeDropdowns(btn);
      btn.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openBtn = menu.querySelector('.dropdown__btn[aria-expanded="true"]');
    if (openBtn) { closeDropdowns(); openBtn.focus(); }
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".dropdown")) closeDropdowns(); });

  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      closeDropdowns();
    })
  );

  window.addEventListener("scroll", () => nav.classList.toggle("is-scrolled", window.scrollY > 10), { passive: true });
}

/* ---------- Animasi muncul saat di-scroll (mati jika pengguna minta) ---------- */
const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.a11yAnim === "1";

let _io = null;
function observeReveal(root = document) {
  const els = root.querySelectorAll(".reveal:not(.is-in)");
  if (reduceMotion() || !("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("is-in"));
  _io = _io || new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add("is-in"), _io.unobserve(en.target))), { threshold: 0.1 });
  els.forEach((el) => _io.observe(el));
}

/* ---------- Toast + pengumuman pembaca layar ---------- */
function toast(text) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.classList.add("is-show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("is-show"), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  applySite();
  initNav();
});
