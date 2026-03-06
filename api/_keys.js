export const KEYS = {
  pakasir: {
    project: "hanzzybuyotomatis",
    apiKey: "Fm95Dro1xFOlVr4s16y2necJPGQZbrXN",
    baseUrl: "https://app.pakasir.com/api",
  },

  pterodactyl: {
    domain: "https://panelu.xyz",
    apiKey: "ptla",
    clientKey: "ptlc",
    egg: 15,
    nestId: 5,
    locationId: 1,
  },

  digitalocean: {
    apiKey: "",
    region: "sgp1",
    image: "ubuntu-24-04-x64",
  },

  // MongoDB Atlas (backend only)
  mongodb: {
    uri: "mongodb+srv://hanzzy:hanzzynewera@cluster0.nrznw26.mongodb.net/?appName=Cluster0", // contoh: mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/?appName=Cluster0
    dbName: "shop",
    ordersCollection: "orders",
  },

  // Telegram (backend only)
  telegram: {
    botToken: "8487402096:AAEhYE5W19BZz5lmFdrGZqOFzZRBDKexqo8",      // contoh: 123456:ABC-DEF...
    ownerChatId: "7116335600",   // contoh: 123456789
    channelChatId: "@HanzzyInfo", // contoh: -1001234567890 atau @usernamechannel
    websiteUrl: "https://hanzzydigital.vercel.app/api/pakasir-webhook", // untuk ditampilkan di struk
  },
};
