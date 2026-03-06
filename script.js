import { initApp } from "./source/index.js";

function $(sel, root = document) { return root.querySelector(sel); }

const MOON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="opacity-80">
  <path d="M21 13.2A8.4 8.4 0 0 1 10.8 3a7.3 7.3 0 1 0 10.2 10.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
</svg>`;
const SUN_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="opacity-80">
  <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/>
  <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
    stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("theme", theme);
  const icon = $("#themeIcon");
  if (icon) icon.innerHTML = isDark ? MOON_SVG : SUN_SVG;
}

function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  setTheme(saved);
  $("#themeToggle")?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  });
}

initTheme();
initApp();
