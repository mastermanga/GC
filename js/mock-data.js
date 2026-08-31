/* =========================================================
   FC CLASSE — MOCK-DATA.JS
   Données temporaires utilisées avant Google Apps Script.

   IMPORTANT :
   - Ce fichier disparaîtra du fonctionnement réel plus tard.
   - Google Sheets deviendra la source de vérité.
   - Les joueurs sont uniques dans toute la classe.
   ========================================================= */

window.FC_MOCK_DATA = {
  /* =======================================================
     CONFIGURATION GÉNÉRALE
     ======================================================= */

  config: {
    meritsPerOpening: 10
  },

  /* =======================================================
     TYPES DE PACKS

     Pour la V1, seul "standard" sera utilisé.
     On prépare déjà la structure pour de futurs packs.
     ======================================================= */

  packTypes: [
    {
      id: "standard",
      name: "Pack Standard",
      enabled: true
    },

    {
      id: "premium",
      name: "Pack Premium",
      enabled: false
    },

    {
      id: "elite",
      name: "Pack Élite",
      enabled: false
    }
  ],

  /* =======================================================
     ÉLÈVES

     Les mérites sont CUMULATIFS :
     ils ne diminuent jamais lorsqu'un opening est effectué.

     openings disponibles =
       floor(merites / meritsPerOpening)
       - nombre d'openings déjà effectués
     ======================================================= */

  students: [
    {
      id: "eleve_001",
      name: "Lucas Martin",
      merits: 27,
      active: true
    },

    {
      id: "eleve_002",
      name: "Emma Dupont",
      merits: 18,
      active: true
    },

    {
      id: "eleve_003",
      name: "Hugo Bernard",
      merits: 34,
      active: true
    },

    {
      id: "eleve_004",
      name: "Lina Moreau",
      merits: 12,
      active: true
    },

    {
      id: "eleve_005",
      name: "Noah Robert",
      merits: 42,
      active: true
    },

    {
      id: "eleve_006",
      name: "Inès Petit",
      merits: 8,
      active: true
    },

    {
      id: "eleve_007",
      name: "Adam Leroy",
      merits: 21,
      active: true
    },

    {
      id: "eleve_008",
      name: "Chloé Garcia",
      merits: 15,
      active: true
    }
  ],

  /* =======================================================
     JOUEURS

     Aucun propriétaire n'est enregistré directement ici.

     L'appartenance d'un joueur à un élève est enregistrée
     dans "collections".

     Ça correspondra plus tard à l'onglet Joueurs
     du Google Sheet.
     ======================================================= */

  players: [
    {
      eaId: 231747,
      name: "Kylian Mbappé",
      rating: 91,
      position: "BU",
      role: "ATT",
      club: "Real Madrid",
      nationality: "France",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/231747.png"
    },

    {
      eaId: 239085,
      name: "Erling Haaland",
      rating: 91,
      position: "BU",
      role: "ATT",
      club: "Manchester City",
      nationality: "Norvège",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/239085.png"
    },

    {
      eaId: 231443,
      name: "Ousmane Dembélé",
      rating: 90,
      position: "BU",
      role: "ATT",
      club: "Paris Saint-Germain",
      nationality: "France",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/231443.png"
    },

    {
      eaId: 252371,
      name: "Jude Bellingham",
      rating: 90,
      position: "MOC",
      role: "MIL",
      club: "Real Madrid",
      nationality: "Angleterre",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/252371.png"
    },

    {
      eaId: 277643,
      name: "Lamine Yamal",
      rating: 90,
      position: "AD",
      role: "ATT",
      club: "FC Barcelona",
      nationality: "Espagne",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/277643.png"
    },

    {
      eaId: 255253,
      name: "Vitinha",
      rating: 90,
      position: "MC",
      role: "MIL",
      club: "Paris Saint-Germain",
      nationality: "Portugal",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/255253.png"
    },

    {
      eaId: 251854,
      name: "Pedri",
      rating: 90,
      position: "MC",
      role: "MIL",
      club: "FC Barcelona",
      nationality: "Espagne",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/251854.png"
    },

    {
      eaId: 202126,
      name: "Harry Kane",
      rating: 90,
      position: "BU",
      role: "ATT",
      club: "FC Bayern München",
      nationality: "Angleterre",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/202126.png"
    },

    {
      eaId: 192119,
      name: "Thibaut Courtois",
      rating: 90,
      position: "GB",
      role: "GB",
      club: "Real Madrid",
      nationality: "Belgique",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/192119.png"
    },

    {
      eaId: 238794,
      name: "Vini Jr.",
      rating: 89,
      position: "AG",
      role: "ATT",
      club: "Real Madrid",
      nationality: "Brésil",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/238794.png"
    },

    {
      eaId: 235212,
      name: "Achraf Hakimi",
      rating: 88,
      position: "DD",
      role: "DEF",
      club: "Paris Saint-Germain",
      nationality: "Maroc",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/235212.png"
    },

    {
      eaId: 243715,
      name: "William Saliba",
      rating: 88,
      position: "DC",
      role: "DEF",
      club: "Arsenal",
      nationality: "France",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/243715.png"
    },

    {
      eaId: 209331,
      name: "Mohamed Salah",
      rating: 87,
      position: "AD",
      role: "ATT",
      club: "Liverpool",
      nationality: "Égypte",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/209331.png"
    },

    {
      eaId: 239053,
      name: "Federico Valverde",
      rating: 87,
      position: "MC",
      role: "MIL",
      club: "Real Madrid",
      nationality: "Uruguay",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/239053.png"
    },

    {
      eaId: 256790,
      name: "Jamal Musiala",
      rating: 87,
      position: "MOC",
      role: "MIL",
      club: "FC Bayern München",
      nationality: "Allemagne",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/256790.png"
    },

    {
      eaId: 246669,
      name: "Bukayo Saka",
      rating: 87,
      position: "AD",
      role: "ATT",
      club: "Arsenal",
      nationality: "Angleterre",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/246669.png"
    },

    {
      eaId: 207865,
      name: "Marquinhos",
      rating: 87,
      position: "DC",
      role: "DEF",
      club: "Paris Saint-Germain",
      nationality: "Brésil",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/207865.png"
    },

    {
      eaId: 215698,
      name: "Mike Maignan",
      rating: 87,
      position: "GB",
      role: "GB",
      club: "AC Milan",
      nationality: "France",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/215698.png"
    },

    {
      eaId: 256630,
      name: "Florian Wirtz",
      rating: 86,
      position: "MOC",
      role: "MIL",
      club: "Liverpool",
      nationality: "Allemagne",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/256630.png"
    },

    {
      eaId: 228702,
      name: "Frenkie de Jong",
      rating: 86,
      position: "MC",
      role: "MIL",
      club: "FC Barcelona",
      nationality: "Pays-Bas",
      rarity: "gold",
      image: "https://www.fcratings.com/assets/images/post/228702.png"
    }
  ],

  /* =======================================================
     COLLECTIONS

     Un joueur ne peut apparaître qu'UNE SEULE FOIS ici.

     C'est cette règle qui garantit qu'un joueur est unique
     dans toute la classe.

     Plus tard :
     Collections sera un onglet séparé du Google Sheet.
     ======================================================= */

  collections: [
    {
      id: "collection_001",
      studentId: "eleve_001",
      eaId: 231747,
      openingId: "opening_001",
      obtainedAt: "2026-09-05T10:15:00"
    },

    {
      id: "collection_002",
      studentId: "eleve_003",
      eaId: 252371,
      openingId: "opening_002",
      obtainedAt: "2026-09-06T11:30:00"
    },

    {
      id: "collection_003",
      studentId: "eleve_005",
      eaId: 239085,
      openingId: "opening_003",
      obtainedAt: "2026-09-08T09:40:00"
    },

    {
      id: "collection_004",
      studentId: "eleve_005",
      eaId: 255253,
      openingId: "opening_004",
      obtainedAt: "2026-09-12T14:10:00"
    },

    {
      id: "collection_005",
      studentId: "eleve_007",
      eaId: 277643,
      openingId: "opening_005",
      obtainedAt: "2026-09-15T13:45:00"
    },

    {
      id: "collection_006",
      studentId: "eleve_003",
      eaId: 243715,
      openingId: "opening_006",
      obtainedAt: "2026-09-18T10:05:00"
    },

    {
      id: "collection_007",
      studentId: "eleve_005",
      eaId: 209331,
      openingId: "opening_007",
      obtainedAt: "2026-09-20T15:20:00"
    },

    {
      id: "collection_008",
      studentId: "eleve_003",
      eaId: 192119,
      openingId: "opening_008",
      obtainedAt: "2026-09-23T08:50:00"
    }
  ],

  /* =======================================================
     HISTORIQUE DES OPENINGS

     Chaque ligne représente UN opening réellement effectué.

     C'est cet historique qui permet de savoir combien
     d'openings un élève a déjà utilisés.

     Exemple :
       Lucas = 27 mérites
       seuil = 10
       floor(27 / 10) = 2 openings gagnés
       openings effectués = 1
       openings disponibles = 1
     ======================================================= */

  openings: [
    {
      id: "opening_001",
      studentId: "eleve_001",
      packType: "standard",
      eaId: 231747,
      createdAt: "2026-09-05T10:15:00"
    },

    {
      id: "opening_002",
      studentId: "eleve_003",
      packType: "standard",
      eaId: 252371,
      createdAt: "2026-09-06T11:30:00"
    },

    {
      id: "opening_003",
      studentId: "eleve_005",
      packType: "standard",
      eaId: 239085,
      createdAt: "2026-09-08T09:40:00"
    },

    {
      id: "opening_004",
      studentId: "eleve_005",
      packType: "standard",
      eaId: 255253,
      createdAt: "2026-09-12T14:10:00"
    },

    {
      id: "opening_005",
      studentId: "eleve_007",
      packType: "standard",
      eaId: 277643,
      createdAt: "2026-09-15T13:45:00"
    },

    {
      id: "opening_006",
      studentId: "eleve_003",
      packType: "standard",
      eaId: 243715,
      createdAt: "2026-09-18T10:05:00"
    },

    {
      id: "opening_007",
      studentId: "eleve_005",
      packType: "standard",
      eaId: 209331,
      createdAt: "2026-09-20T15:20:00"
    },

    {
      id: "opening_008",
      studentId: "eleve_003",
      packType: "standard",
      eaId: 192119,
      createdAt: "2026-09-23T08:50:00"
    }
  ]
};
