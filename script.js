/**
 * script.js
 * Theme toggle + initApp + scroll reveal + ripple + nav scroll
 */

import { initApp } from "./source/index.js";

function $(s) { return document.querySelector(s); }

const MOON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
  <path d="M21 13.2A8.4 8.4 0 0 1 10.8 3a7.3 7.3 0 1 0 10.2 10.2Z"
    stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
</svg>`;

const SUN = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/>
  <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
    stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

/* ── Theme toggle ──────────────────────────────────── */
function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
  const icon = $("#themeIcon");
  if (icon) {
    icon.style.transition = "transform .3s cubic-bezier(.16,1,.3,1), opacity .15s";
    icon.style.transform  = "rotate(180deg) scale(0.5)";
    icon.style.opacity    = "0";
    setTimeout(() => {
      icon.innerHTML       = isDark ? MOON : SUN;
      icon.style.transform = "rotate(0deg) scale(1)";
      icon.style.opacity   = "1";
    }, 160);
  }
}

function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  setTheme(saved);
  $("#themeToggle")?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  });
}

/* ── Scroll reveal ─────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 60);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  // Observe elemen statis
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // Observe elemen produk yang di-render dinamis oleh JS
  const root = $("#productsRoot");
  if (root) {
    new MutationObserver(() => {
      root.querySelectorAll("section").forEach(el => {
        if (!el.classList.contains("reveal")) {
          el.classList.add("reveal");
          observer.observe(el);
        }
      });
    }).observe(root, { childList: true });
  }
}

/* ── Navbar shadow saat scroll ─────────────────────── */
function initNavScroll() {
  const nav = document.querySelector("header");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("nav-scrolled", window.scrollY > 16);
  }, { passive: true });
}

/* ── Ripple effect klik tombol ─────────────────────── */
function initRipple() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".gate-btn, .btn-primary, .buyBtn");
    if (!btn || btn.disabled) return;
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 1.4;
    const ripple = document.createElement("span");
    Object.assign(ripple.style, {
      position:     "absolute",
      width:        size + "px",
      height:       size + "px",
      left:         (e.clientX - rect.left - size / 2) + "px",
      top:          (e.clientY - rect.top  - size / 2) + "px",
      borderRadius: "50%",
      background:   "rgba(255,255,255,0.25)",
      transform:    "scale(0)",
      animation:    "rippleAnim .5s linear",
      pointerEvents:"none",
    });
    btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });

  if (!document.getElementById("rippleStyle")) {
    const s = document.createElement("style");
    s.id = "rippleStyle";
    s.textContent = `@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }`;
    document.head.appendChild(s);
  }
}

/* ── Modal confirm style ───────────────────────────── */
const s = document.createElement("style");
s.textContent = `
  .modal-confirm-box {
    background: var(--modal-card-bg);
    border: 1px solid var(--modal-bd);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: slideUpBox .22s cubic-bezier(0.16,1,0.3,1);
  }
`;
document.head.appendChild(s);

/* ── Init ──────────────────────────────────────────── */
initTheme();
initApp();
setTimeout(() => {
  initScrollReveal();
  initNavScroll();
  initRipple();
}, 120);
