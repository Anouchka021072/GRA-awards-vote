// Helpers shared by the voting page and the jury page.
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
const initials = (n) => n.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(-2).toUpperCase();
const norm = (n) => String(n).trim().replace(/\s+/g, " ").toLowerCase();

const EMBLEM = {
  compass: `<svg class="emblem" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="none" stroke="var(--hue)" stroke-width="3"/><circle cx="42" cy="42" r="30" fill="none" stroke="var(--hue)" stroke-width="1" stroke-dasharray="2 5"/><path d="M42 12 L49 42 L42 72 L35 42Z" fill="var(--hue)" opacity=".25"/><path d="M42 12 L49 42 L35 42Z" fill="var(--hue)"/><circle cx="42" cy="42" r="4" fill="var(--gold)"/></svg>`,
  quiet: `<svg class="emblem" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="none" stroke="var(--hue)" stroke-width="3"/><path d="M14 46 Q24 36 34 46 T54 46 T74 46" fill="none" stroke="var(--hue)" stroke-width="3" stroke-linecap="round"/><path d="M18 56 Q28 48 38 56 T58 56 T70 56" fill="none" stroke="var(--hue)" stroke-width="2" opacity=".5" stroke-linecap="round"/><path d="M30 32 L42 22 L54 32" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  fair: `<svg class="emblem" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="none" stroke="var(--hue)" stroke-width="3"/><path d="M42 18 V62 M30 64 H54 M22 30 H62" stroke="var(--hue)" stroke-width="3" stroke-linecap="round"/><path d="M22 30 L14 48 H30Z M62 30 L54 48 H70Z" fill="var(--hue)" opacity=".3" stroke="var(--hue)" stroke-width="2" stroke-linejoin="round"/><circle cx="42" cy="18" r="4" fill="var(--gold)"/></svg>`
};

// To use GRA's logo, put the file in /public as logo.png; the placeholder is replaced automatically.
function topbar(cfg) {
  return `<div class="topbar"><div class="logo"><img src="/logo.png" alt="${esc(cfg.org)} logo" style="height:38px;width:auto" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="logo-mark" hidden>LOGO</div>${esc(cfg.org)} Staff Awards</div>
  <div class="values">${cfg.values.map((v) => `<span class="chip">${esc(v)}</span>`).join("")}</div></div>`;
}

let toastT;
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 3200); }

async function api(path, opts = {}) {
  const res = await fetch(path, { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}

function burst() {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const c = $("#fx"), x = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
  const cs = getComputedStyle(document.documentElement);
  const cols = ["--gold", "--brand", "--compass", "--quiet", "--fair"].map((v) => cs.getPropertyValue(v).trim());
  const ps = Array.from({ length: 140 }, () => ({ x: c.width / 2, y: c.height * 0.35, vx: (Math.random() - 0.5) * 14, vy: Math.random() * -12 - 3, r: Math.random() * 6 + 3, c: cols[(Math.random() * cols.length) | 0], a: Math.random() * 6 }));
  let f = 0;
  (function tick() {
    x.clearRect(0, 0, c.width, c.height);
    ps.forEach((p) => { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += 0.2; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); });
    if (++f < 110) requestAnimationFrame(tick); else x.clearRect(0, 0, c.width, c.height);
  })();
}
