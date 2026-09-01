window.FC_CONFIG = {
  appName: "Bel Air FC",

  // false = utilise le vrai Google Sheet / Apps Script
  useMockData: false,

  // URL de l'API Apps Script
  apiBaseUrl:
    "https://script.google.com/macros/s/AKfycbxarKaK0F3i9dpV5yjPdfK-C0Lc_cT9ItSU0DG_KlffCI_xrYjfk3ad8f50hwt2pSHV/exec",

  // Nombre de joueurs affichés sur le terrain
  pitchPlayerLimit: 5,

  // Recherche élève
  searchDebounceMs: 180,
  minimumSearchLength: 2,

  // Pack utilisé pour la V1
  defaultPackType: "standard",

  // Pages du site
  routes: {
    home: "index.html",
    student: "eleve.html",
    teacher: "prof.html",
    opening: "opening.html"
  }
};
