// Web Hanzzy  -  Client Config (AMAN untuk browser)
// [!] Jangan taruh API KEY di sini. Secrets harus di Vercel Environment Variables.

export const BRAND = {
  name: "Web Hanzzy",
  tagline: "Powerful hosting - Panel Pterodactyl - VPS Singapore",
};

export const CURRENCY = "IDR";

export const LINKS = {
  resellerGroupFallback: "",
};

export const PRODUCTS = [
  {
    key: "panel",
    title: "Panel Pterodactyl",
    subtitle: "Pilih RAM sesuai kebutuhan. Unlimited = request-based.",
    icon: "panel",
    requires: { name: false, hostname: false },
    available: true,
    unavailableMessage: "Produk ini belum tersedia.",
    plans: [
      { key: "panel-1gb",       label: "1GB",      ramGb: 1, cores: null, price: 500,  badge: "Starter" },
      { key: "panel-2gb",       label: "2GB",      ramGb: 2, cores: null, price: 2000, badge: "Basic"   },
      { key: "panel-3gb",       label: "3GB",      ramGb: 3, cores: null, price: 3000, badge: "Plus"    },
      { key: "panel-4gb",       label: "4GB",      ramGb: 4, cores: null, price: 4000, badge: "Popular" },
      { key: "panel-unlimited", label: "UNLIMITED", ramGb: 0, cores: null, price: 5000, badge: "Request" },
    ],
    notes: [
      "Unlimited = request-based, bukan RAM tak terbatas secara fisik.",
      "Resource menyesuaikan kapasitas server & kebijakan fair use.",
    ],
  },

  {
    key: "vps",
    title: "VPS DigitalOcean",
    subtitle: "Region Singapore - Ubuntu 24.04 LTS",
    icon: "vps",
    requires: { name: false, hostname: true },
    available: true,
    unavailableMessage: "Produk ini belum tersedia.",
    plans: [
      { key: "vps-1c-2g",  label: "1 Core / 2GB",  ramGb: 2,  cores: 1, price: 500,   badge: "SG" },
      { key: "vps-2c-2g",  label: "2 Core / 2GB",  ramGb: 2,  cores: 2, price: 12000, badge: "SG" },
      { key: "vps-2c-4g",  label: "2 Core / 4GB",  ramGb: 4,  cores: 2, price: 14000, badge: "SG" },
      { key: "vps-4c-8g",  label: "4 Core / 8GB",  ramGb: 8,  cores: 4, price: 17000, badge: "SG" },
      { key: "vps-4c-16g", label: "4 Core / 16GB", ramGb: 16, cores: 4, price: 20000, badge: "SG" },
      { key: "vps-8c-16g", label: "8 Core / 16GB", ramGb: 16, cores: 8, price: 25000, badge: "SG" },
    ],
    notes: [
      "Hostname wajib diisi (contoh: hanzzy-vps01).",
      "VPS dibuat setelah pembayaran terkonfirmasi.",
    ],
  },

  {
    key: "admin",
    title: "Admin Panel Pterodactyl",
    subtitle: "Akses admin untuk panel (high privilege).",
    icon: "admin",
    requires: { name: false, hostname: false },
    available: true,
    unavailableMessage: "Produk ini belum tersedia.",
    plans: [
      { key: "admin-access", label: "Admin Access", ramGb: null, cores: null, price: 8000, badge: "Admin" },
    ],
    notes: [
      "Masukkan username/nama target admin dengan benar.",
      "Produk ini high privilege — pastikan data benar.",
    ],
  },

  {
    key: "reseller",
    title: "Reseller Panel Pterodactyl",
    subtitle: "Akses reseller + link khusus setelah pembayaran.",
    icon: "reseller",
    requires: { name: false, hostname: false },
    available: true,
    unavailableMessage: "Produk ini belum tersedia.",
    plans: [
      { key: "reseller-access", label: "Reseller Access", ramGb: null, cores: null, price: 5000, badge: "Reseller" },
    ],
    notes: ["Setelah pembayaran sukses, kamu akan mendapat link khusus reseller."],
  },

  // ← PRODUK SCRIPT MASUK DI SINI, MASIH DI DALAM ARRAY []
  {
    key: "script",
    title: "Script Bot",
    subtitle: "Script siap pakai, link dikirim otomatis ke email setelah pembayaran.",
    icon: "script",
    requires: { name: false, hostname: false },
    available: true,
    unavailableMessage: "Produk Script belum tersedia. Silakan cek kembali nanti.",
    plans: [
      {
        key: "Pushkon X Jpm",
        label: "WA",
        price: 15000,
        badge: "Basic",
        desc: "Auto save, menu sederhana, multi command",
      },
      {
        key: "ubot tele",
        label: "TELE",
        price: 10000,
        badge: "Premium",
        desc: "Semua fitur Basic + downloader, game, anti-spam",
      },
      {
        key: "BuyOtomatis-WA",
        label: "WA",
        price: 20000,
        badge: "Ultra",
        desc: "Semua fitur Premium + AI reply, panel web, update otomatis",
      },
    ],
    notes: [
      "Link download dikirim ke email setelah pembayaran terkonfirmasi.",
      "Script berbasis Node.js, siap deploy di VPS atau Termux.",
      "Tidak memerlukan domain atau API key tambahan.",
    ],
  },

]; // ← TANDA TUTUP ARRAY PRODUCTS ADA DI SINI

export const UX = {
  autoPollMs: 8000,
};
