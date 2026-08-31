/* =========================================================
   FC CLASSE — CONFIG.JS
   Réglages globaux du front
   ========================================================= */

window.FC_CONFIG = {
  appName: "FC Classe",

  // Tant que Google Apps Script n'est pas branché,
  // le site utilise les données de démonstration.
  useMockData: true,

  // À remplacer plus tard par l'URL du Web App Google Apps Script.
  apiBaseUrl: "",

  // Nombre de joueurs affichés directement sur le terrain élève.
  pitchPlayerLimit: 5,

  // Délai avant lancement d'une recherche,
  // pour éviter une requête à chaque touche.
  searchDebounceMs: 180,

  // Nombre minimum de caractères avant de lancer
  // une recherche d'élève.
  minimumSearchLength: 2,

  // Type de pack utilisé dans la V1.
  // On prévoit déjà d'autres types plus tard.
  defaultPackType: "standard",

  routes: {
    home: "index.html",
    student: "eleve.html",
    teacher: "prof.html",
    opening: "opening.html"
  }
};
