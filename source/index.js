import { BRAND, PRODUCTS, CURRENCY, UX, LINKS } from "./config.js";
import { createOrder, createQris, qrisDetail, qrisCancel, fulfillOrder, doDetail } from "./pakasir.js";

// ---- Helpers --------------------------------------------------------------------------------------------------------------------------------------
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function formatIDR(amount) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  } catch { return `Rp ${amount}`; }
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function looksPaid(s = "") {
  const u = String(s).toLowerCase();
  return ["paid","success","completed","settlement","done","berhasil","lunas"].some(k => u.includes(k));
}
function looksPending(s = "") {
  const u = String(s).toLowerCase();
  return ["pending","process","waiting","unpaid"].some(k => u.includes(k));
}

// ---- Sound (Web Audio API  -  tanpa emoji, tanpa library) ------------------------------------------------
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[523.25, 0], [659.25, 0.13], [783.99, 0.26], [1046.5, 0.39]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = freq;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.start(t); osc.stop(t + 0.4);
    });
  } catch(e) { /* silent */ }
}

// ---- Toast (simbol saja, tanpa emoji) ----------------------------------------------------------------------------------
function toast(message, kind = "info") {
  const root = $("#toastRoot");
  const color =
    kind === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200" :
    kind === "error"   ? "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200" :
                         "border-indigo-500/30 bg-indigo-500/10 text-indigo-800 dark:text-indigo-200";
  const symbol =
    kind === "success" ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>` :
    kind === "error"   ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="flex-shrink-0"><path stroke-linecap="round" d="M18 6 6 18M6 6l12 12"/></svg>` :
                         `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="flex-shrink-0"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4M12 16h.01"/></svg>`;
  const el = document.createElement("div");
  el.className = `toast-enter pointer-events-auto glass rounded-2xl px-4 py-3 border ${color} flex items-center gap-2.5 shadow-lg`;
  el.innerHTML = `${symbol}<div class="text-sm font-medium">${escapeHtml(message)}</div>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(16px)";
    el.style.transition = "opacity .2s ease, transform .2s ease";
    setTimeout(() => el.remove(), 220);
  }, 2700);
}

// ---- Category tab ----------------------------------------------------------------------------------------------------------------------------
function setCatActive(cat) {
  $all(".catBtn").forEach(a => {
    a.classList.toggle("active", a.dataset.cat === cat);
  });
}

// ---- Icon SVG (tanpa emoji) --------------------------------------------------------------------------------------------------------
function iconSvg(kind) {
  const c = 'class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7"';
  switch(kind) {
    case "panel":    return `<svg ${c} viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/><path stroke-linecap="round" d="M7 4v16"/></svg>`;
    case "vps":      return `<svg ${c} viewBox="0 0 24 24"><path stroke-linejoin="round" d="M4 7h16v10H4V7Z"/><path stroke-linecap="round" d="M7 10h4M7 14h10"/></svg>`;
    case "admin":    return `<svg ${c} viewBox="0 0 24 24"><path stroke-linejoin="round" d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4Z"/><path stroke-linecap="round" d="M9.5 12.5l1.7 1.7 3.8-4.2"/></svg>`;
    case "reseller": return `<svg ${c} viewBox="0 0 24 24"><path stroke-linejoin="round" d="M16 11a4 4 0 1 0-8 0"/><path stroke-linecap="round" d="M4 20c1.5-4 14.5-4 16 0"/><path stroke-linecap="round" d="M18 8h3M19.5 6.5v3"/></svg>`;
    default:         return `<svg ${c} viewBox="0 0 24 24"><path d="M4 12h16"/></svg>`;
  }
}

// ---- Build section (original layout, tanpa emoji) ------------------------------------------------------------
function buildSection(product) {
  const reqName = product.requires?.name;
  const reqHost = product.requires?.hostname;

  const inputBlock = `
    ${reqName ? `
      <div class="mt-5">
        <div class="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-300/80">Masukkan username / nama Anda</div>
        <input data-input="${product.key}:name" type="text" placeholder="contoh: hanzzy"
          class="mt-2 w-full rounded-2xl px-4 py-3 bg-white/70 dark:bg-zinc-950/30 border border-black/10 dark:border-white/10 focus:border-indigo-400 dark:focus:border-indigo-400" />
      </div>` : ""}
    ${reqHost ? `
      <div class="mt-5">
        <div class="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-300/80">Masukkan hostname VPS</div>
        <input data-input="${product.key}:hostname" type="text" placeholder="contoh: hanzzy-vps01"
          class="mt-2 w-full rounded-2xl px-4 py-3 bg-white/70 dark:bg-zinc-950/30 border border-black/10 dark:border-white/10 focus:border-indigo-400 dark:focus:border-indigo-400" />
      </div>` : ""}`;

  const cards = product.plans.map(p => {
    const isUnlimited = product.key === "panel" && p.ramGb === 0;
    const subline =
      product.key === "vps"      ? `${p.cores} Core \u00b7 ${p.ramGb}GB RAM \u00b7 Singapore \u00b7 Ubuntu 24.04` :
      product.key === "panel"    ? (isUnlimited ? "Request-based \u00b7 Fair Use" : `${p.ramGb}GB RAM`) :
      product.key === "admin"    ? "Akses admin untuk panel" :
                                   "Akses reseller untuk panel";
    const badge = p.badge
      ? `<span class="rounded-full px-2 py-0.5 text-[11px] border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">${escapeHtml(p.badge)}</span>`
      : "";
    return `
      <button type="button" data-plan="${product.key}:${p.key}"
        class="planCard text-left rounded-2xl p-4 border border-black/10 bg-black/5 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-semibold">${escapeHtml(p.label)}</div>
            <div class="mt-1 text-sm text-zinc-700 dark:text-zinc-300/90">${escapeHtml(subline)}</div>
          </div>
          ${badge}
        </div>
        <div class="mt-4 text-2xl font-extrabold tracking-tight">${escapeHtml(formatIDR(p.price))}</div>
      </button>`;
  }).join("");

  const notes = (product.notes || []).map(n => `<li>${escapeHtml(n)}</li>`).join("");

  return `
    <section id="${escapeHtml(product.key)}" class="scroll-mt-28">
      <div class="glass rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/10">
        <div class="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div class="flex items-start gap-4">
            <div class="h-12 w-12 rounded-2xl bg-black/5 border border-black/10 dark:bg-white/5 dark:border-white/10 flex items-center justify-center">
              ${iconSvg(product.icon)}
            </div>
            <div>
              <h3 class="font-display font-semibold text-2xl">${escapeHtml(product.title)}</h3>
              <p class="mt-1 text-zinc-700 dark:text-zinc-300/90">${escapeHtml(product.subtitle)}</p>
            </div>
          </div>
          <div class="text-sm text-zinc-600 dark:text-zinc-300/80">
            <div class="uppercase tracking-widest text-xs">Pilih paket</div>
            <div class="mt-1">Klik kartu di bawah</div>
          </div>
        </div>

        ${inputBlock}

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>

        <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div class="lg:col-span-2">
            <div class="rounded-2xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 p-4">
              <div class="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-300/80">Catatan</div>
              <ul class="mt-2 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300/90 space-y-1">${notes}</ul>
            </div>
          </div>
          <div>
            <button data-buy="${product.key}"
              class="buyBtn w-full rounded-2xl px-5 py-3 font-semibold bg-black/10 text-zinc-500 border border-black/10 dark:bg-white/5 dark:text-zinc-300/60 dark:border-white/10 cursor-not-allowed" disabled>
              Beli
            </button>
            <div class="mt-2 text-xs text-zinc-600 dark:text-zinc-300/80">Tombol aktif setelah input &amp; paket valid.</div>
          </div>
        </div>
      </div>
    </section>`;
}

// ---- Timer ------------------------------------------------------------------------------------------------------------------------------------------
const EXPIRE_SECS = 30 * 60;
let _timer = null;

function startTimer(onExpire) {
  clearInterval(_timer);
  // Timer berjalan di background  -  tidak ditampilkan ke user
  let rem = EXPIRE_SECS;
  function tick() {
    if (rem <= 0) {
      clearInterval(_timer);
      onExpire && onExpire();
      return;
    }
    rem--;
  }
  tick(); _timer = setInterval(tick, 1000);
}
function stopTimer() {
  clearInterval(_timer); _timer = null;
  // timerBar sudah selalu hidden dari HTML
}

// ---- Modal helpers --------------------------------------------------------------------------------------------------------------------------
function openModal() {
  const m = $("#payModal");
  m.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  const m = $("#payModal");
  m.classList.remove("open");
  document.body.style.overflow = "";
  // Hapus konfirmasi cancel jika ada
  $("#cancelConfirmBox")?.remove();
}

function showCancelConfirm() {
  if ($("#cancelConfirmBox")) return; // sudah ada
  const box = document.createElement("div");
  box.id = "cancelConfirmBox";
  box.className = "absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-rose-500/25 bg-zinc-900/95 p-4 shadow-xl backdrop-blur";
  box.innerHTML = `
    <div class="text-sm font-semibold mb-1">Keluar dari pembayaran?</div>
    <div class="text-xs text-zinc-400 mb-3">Kamu perlu membatalkan transaksi terlebih dahulu.</div>
    <div class="grid grid-cols-2 gap-2">
      <button id="confirmKeep" class="rounded-xl py-2.5 text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/8 transition-colors">Kembali</button>
      <button id="confirmCancel" class="rounded-xl py-2.5 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white transition-colors">Batalkan Order</button>
    </div>`;
  const card = $("#payModalCard");
  card.style.position = "relative";
  card.appendChild(box);
  // Event
  setTimeout(() => {
    $("#confirmKeep")?.addEventListener("click", () => box.remove());
    $("#confirmCancel")?.addEventListener("click", () => { box.remove(); cancelOrder(); });
  }, 0);
}
function setPayStatus({ kind, text }) {
  // Status elemen hidden dari tampilan  -  hanya catat di console untuk debug
  console.debug("[status]", kind, text);
}

function showSkeleton() {
  $("#qrSkeleton")?.classList.remove("hidden");
  $("#qrLoaded")?.classList.add("hidden");
}
function showQr() {
  $("#qrSkeleton")?.classList.add("hidden");
  $("#qrLoaded")?.classList.remove("hidden");
  $("#successState")?.classList.add("hidden");
}
function showSuccess(orderId) {
  $("#successState")?.classList.remove("success-pop");
  void $("#successState")?.offsetWidth; // reflow
  $("#successState")?.classList.remove("hidden");
  $("#successState")?.classList.add("success-pop");
  const el = $("#successOrderId");
  if (el) el.textContent = `Order ID: ${orderId}`;
  // hide QR pulse, cancel btn
  document.querySelector(".qr-pulse-wrap")?.classList.remove("qr-pulse-wrap");
  $("#cancelPayment")?.classList.add("hidden");
  // reset timer text color
  const tt = $("#timerText"); if (tt) tt.style.color = "";
}

// ---- Main --------------------------------------------------------------------------------------------------------------------------------------------
export function initApp() {
  $("#year").textContent = new Date().getFullYear();

  // Render products
  const root = $("#productsRoot");
  root.innerHTML = PRODUCTS.map(buildSection).join("");

  // State
  const state = {
    selected: Object.fromEntries(PRODUCTS.map(p => [p.key, null])),
    inputs: {},
    order: null,
    pollTimer: null,
  };

  function getProduct(key) { return PRODUCTS.find(p => p.key === key); }
  function getPlan(pk, plk) { return getProduct(pk)?.plans?.find(p => p.key === plk) || null; }
  function isValid(pk) {
    const prod = getProduct(pk);
    if (!prod || !state.selected[pk]) return false;
    if (prod.requires?.name && !(state.inputs[`${pk}:name`] || "").trim()) return false;
    if (prod.requires?.hostname && !(state.inputs[`${pk}:hostname`] || "").trim()) return false;
    return true;
  }
  function updateBuyBtn(pk) {
    const btn = $(`[data-buy="${pk}"]`);
    if (!btn) return;
    const ok = isValid(pk);
    btn.disabled = !ok;
    if (ok) {
      btn.className = btn.className
        .replace(/bg-black\/\S+/g,'').replace(/dark:bg-white\/\S+/g,'')
        .replace(/text-zinc-\S+/g,'').replace(/cursor-not-allowed/g,'').replace(/border-black\/\S+/g,'').trim();
      btn.classList.add("bg-indigo-500","hover:bg-indigo-400","text-white","border-transparent");
    } else {
      btn.className = btn.className
        .replace(/bg-indigo-\S+/g,'').replace(/hover:bg-indigo-\S+/g,'')
        .replace(/border-transparent/g,'').trim();
      btn.classList.add("bg-black/8","dark:bg-white/5","text-zinc-400","dark:text-zinc-500","cursor-not-allowed","border-black/10","dark:border-white/10");
    }
  }
  PRODUCTS.forEach(p => updateBuyBtn(p.key));

  // Username gate
  const overlay = $("#usernameOverlay");
  const uInput = $("#usernameInput");

  function getSavedUsername() { return String(localStorage.getItem("username") || "").trim(); }
  function setSavedUsername(v) { if ((v || "").trim()) localStorage.setItem("username", v.trim()); }
  function applyUsernameToInputs(name) {
    if (!name) return;
    $all('input[data-input$=":name"]').forEach(inp => {
      if (!inp.value) inp.value = name;
      state.inputs[inp.dataset.input] = inp.value;
      const [pk] = inp.dataset.input.split(":");
      updateBuyBtn(pk);
    });
  }

  const saved = getSavedUsername();
  if (uInput && saved) uInput.value = saved;
  if (saved) applyUsernameToInputs(saved);
  overlay.classList.toggle("hidden", !!saved);

  $("#usernameSave")?.addEventListener("click", () => {
    const v = (uInput?.value || "").trim();
    if (!v) return toast("Username belum diisi.", "error");
    setSavedUsername(v);
    applyUsernameToInputs(v);
    overlay.classList.add("hidden");
    toast(`Halo, ${v}!`, "success");
  });
  $("#usernameSkip")?.addEventListener("click", () => toast("Username wajib diisi.", "error"));
  uInput?.addEventListener("keydown", e => { if (e.key === "Enter") $("#usernameSave")?.click(); });

  // Plan cards
  $all(".planCard").forEach(btn => {
    btn.addEventListener("click", () => {
      const [pk, plk] = (btn.dataset.plan || "").split(":");
      if (!pk || !plk) return;
      $all(".planCard", $(`#${pk}`)).forEach(c => c.classList.remove("ring-2","ring-indigo-500","shadow-lg","shadow-indigo-500/10"));
      btn.classList.add("ring-2","ring-indigo-500","shadow-lg","shadow-indigo-500/10");
      state.selected[pk] = plk;
      updateBuyBtn(pk);
      const plan = getPlan(pk, plk);
      toast(`Paket dipilih: ${plan?.label || plk}`, "info");
    });
  });

  // Inputs
  $all("input[data-input]").forEach(inp => {
    inp.addEventListener("input", () => {
      state.inputs[inp.dataset.input] = inp.value;
      const [pk] = inp.dataset.input.split(":");
      updateBuyBtn(pk);
    });
  });

  // Category tabs
  $all(".catBtn").forEach(a => a.addEventListener("click", () => setCatActive(a.dataset.cat)));
  setCatActive("panel");

  // Poll
  function stopPoll() { if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; } }
  function startPoll() {
    stopPoll();
    state.pollTimer = setInterval(() => { if (!document.hidden) refreshStatus().catch(() => {}); }, UX.autoPollMs);
  }

  // Refresh status
  async function refreshStatus() {
    if (!state.order) return;
    try {
      setPayStatus({ kind: "loading", text: "Mengecek status..." });
      const data = await qrisDetail({ orderId: state.order.orderId, amount: state.order.amount });
      const tx = data?.transaction || data?.data || data;
      const status = tx?.status || tx?.transaction_status || tx?.state || "UNKNOWN";

      if (looksPaid(status)) {
        setPayStatus({ kind: "success", text: "Pembayaran berhasil!" });
        stopPoll(); stopTimer();
        state.order.paid = true;
        playSuccessSound();
        showQr();
        showSuccess(state.order.orderId);

        // Fulfill
        const key = `fulfilled:${state.order.orderId}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          try {
            const fr = await fulfillOrder({
              orderId: state.order.orderId,
              amount: state.order.amount,
              productKey: state.order.productKey,
              planKey: state.order.planKey,
              inputs: state.order.inputs || {},
            });
            const f = fr?.fulfillment || {};
            const det = $("#statusDetails");
            if (det) det.innerHTML = buildFulfillHtml(f);
          } catch(e) { /* silent */ }
        }
        return;
      }
      if (looksPending(status)) { setPayStatus({ kind: "pending", text: "Menunggu pembayaran..." }); return; }
      setPayStatus({ kind: "pending", text: `Status: ${status}` });
    } catch(err) {
      setPayStatus({ kind: "error", text: "Gagal cek status" });
      toast(err.message || "Gagal cek status", "error");
    }
  }

  function buildFulfillHtml(f) {
    if (!f || !f.type) return "";
    const box = (color, title, rows) =>
      `<div class="mt-4 rounded-2xl border p-4 text-sm space-y-1.5" style="background:${color.bg};border-color:${color.border}">
        <div class="font-semibold mb-2" style="color:${color.text}">${title}</div>
        ${rows}
      </div>`;
    if (f.type === "vps") return box(
      { bg:"rgba(56,189,248,0.06)", border:"rgba(56,189,248,0.2)", text:"#38bdf8" },
      "VPS Dibuat",
      `<div>Droplet ID: <span class="font-mono text-xs">${escapeHtml(String(f.dropletId||"-"))}</span></div>
       <div>Status: <span class="font-semibold">${escapeHtml(String(f.status||""))}</span></div>`);
    if (f.type === "panel") return box(
      { bg:"rgba(16,185,129,0.06)", border:"rgba(16,185,129,0.2)", text:"#34d399" },
      "Server Panel Dibuat",
      `<div>Server ID: <span class="font-mono text-xs">${escapeHtml(String(f.serverId||"-"))}</span></div>
       ${f.identifier ? `<div>Identifier: <span class="font-mono text-xs">${escapeHtml(String(f.identifier))}</span></div>` : ""}
       ${f.userCreated ? `<div>Email: <span class="font-mono text-xs">${escapeHtml(String(f.userEmail||""))}</span></div>
         <div>Password: <span class="font-mono text-xs font-bold text-amber-400">${escapeHtml(String(f.userPassword||""))}</span></div>
         <div class="text-xs opacity-50 mt-1">Simpan password sekarang &mdash; tidak akan ditampilkan ulang.</div>` : ""}`);
    if (f.type === "admin") return box(
      { bg:"rgba(245,158,11,0.06)", border:"rgba(245,158,11,0.2)", text:"#fbbf24" },
      "Admin Aktif",
      `<div>Username: <span class="font-mono text-xs">${escapeHtml(String(f.username||""))}</span></div>
       <div>Email: <span class="font-mono text-xs">${escapeHtml(String(f.email||""))}</span></div>
       ${f.created && f.userPassword ? `<div>Password: <span class="font-mono text-xs font-bold text-amber-400">${escapeHtml(String(f.userPassword))}</span></div>` : ""}`);
    if (f.message) return `<div class="mt-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 text-sm">${escapeHtml(String(f.message))}</div>`;
    return "";
  }

  // Cancel
  async function cancelOrder() {
    if (!state.order) return;
    try {
      setPayStatus({ kind: "loading", text: "Membatalkan..." });
      await qrisCancel({ orderId: state.order.orderId, amount: state.order.amount });
      stopPoll(); stopTimer();
      state.order = null;
      closeModal();
      toast("Transaksi dibatalkan.", "info");
    } catch(err) {
      setPayStatus({ kind: "error", text: "Gagal cancel" });
      toast(err.message || "Gagal cancel", "error");
    }
  }

  // Modal button listeners
  $("#refreshStatus")?.addEventListener("click", () => refreshStatus());
  $("#cancelPayment")?.addEventListener("click", () => cancelOrder());
  $("#copyPayment")?.addEventListener("click", async () => {
    const text = $("#paymentString")?.textContent || "";
    if (!text) return toast("Belum ada payment string.", "error");
    try { await navigator.clipboard.writeText(text); toast("Payment string tersalin.", "success"); }
    catch { toast("Gagal copy (izin browser).", "error"); }
  });
  function tryCloseModal() {
    if (state.order && !state.order.paid) {
      // Tampilkan konfirmasi di dalam modal  -  bukan toast
      showCancelConfirm();
      return;
    }
    closeModal(); stopTimer();
  }
  $("#modalClose")?.addEventListener("click", tryCloseModal);
  $("#payModalBackdrop")?.addEventListener("click", e => {
    if (e.target !== e.currentTarget) return;
    tryCloseModal();
  });

  // Buy button
  $all(".buyBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const pk = btn.dataset.buy;
      const product = getProduct(pk);
      if (!product || !isValid(pk)) return toast("Lengkapi input & pilih paket dulu.", "error");

      const username = getSavedUsername();
      if (!username) {
        overlay.classList.remove("hidden");
        toast("Isi username dulu.", "error");
        return;
      }

      const planKey = state.selected[pk];
      const plan = getPlan(pk, planKey);
      const amount = plan.price;
      const meta = {
        product: pk, plan: planKey, label: plan.label,
        name:     product.requires?.name     ? (state.inputs[`${pk}:name`]     || "").trim() : undefined,
        hostname: product.requires?.hostname  ? (state.inputs[`${pk}:hostname`] || "").trim() : undefined,
      };
      const inputs = {
        name:     (state.inputs[`${pk}:name`]     || username || "").trim(),
        hostname: (state.inputs[`${pk}:hostname`]  || "").trim(),
      };

      // Open modal, skeleton
      openModal();
      showSkeleton();
      stopTimer();

      // Summary strip
      const sumEl = $("#modalSummary");
      if (sumEl) sumEl.innerHTML = `
        <span class="font-semibold">${escapeHtml(product.title)} &mdash; ${escapeHtml(plan.label)}</span>
        <span class="font-bold text-indigo-600 dark:text-indigo-300">${escapeHtml(formatIDR(amount))}</span>`;

      const sub = $("#modalSubtitle");
      if (sub) sub.textContent = "Membuat kode pembayaran...";

      try {
        // 1) Create order
        const created = await createOrder({ username, productKey: pk, productTitle: product.title, planKey, planLabel: plan.label, amount, meta });
        const orderId = created?.orderId || "";

        // 2) Create QRIS
        const data = await createQris({ orderId, amount, meta });
        const qr = data?.qr || {};
        const paymentNumber = qr?.paymentNumber || qr?.payment_number || data?.payment?.payment_number || "";
        const dataUrl = qr?.dataUrl || qr?.data_url || "";

        state.order = { orderId, amount, productKey: pk, planKey, meta, paymentNumber, inputs };

        if (dataUrl) $("#qrImage").src = dataUrl;
        $("#paymentString").textContent = paymentNumber || "(Tidak ada payment string)";
        if (sub) sub.textContent = `Order: ${orderId}`;

        showQr();
        setPayStatus({ kind: "pending", text: "Menunggu pembayaran..." });

        startTimer(() => {
          toast("Waktu QRIS habis. Buat order baru.", "error");
          setPayStatus({ kind: "error", text: "QRIS kadaluarsa" });
          stopPoll();
        });
        startPoll();

        toast("QRIS siap. Silakan bayar.", "success");
        $("#payment")?.scrollIntoView({ behavior: "smooth", block: "start" });

      } catch(err) {
        showQr();
        setPayStatus({ kind: "error", text: "Gagal membuat QRIS" });
        const det = $("#statusDetails");
        if (det) det.innerHTML = `<div class="rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4 text-sm text-rose-700 dark:text-rose-300">
          Gagal: ${escapeHtml(err.message || "Unknown error")}</div>`;
        toast(err.message || "Gagal membuat QRIS", "error");
      }
    });
  });
}
