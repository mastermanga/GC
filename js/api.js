/* =========================================================
   FC CLASSE — API.JS

   Couche de communication entre l'interface et les données.

   MODE ACTUEL :
   → mock-data.js + localStorage

   MODE FINAL :
   → Google Apps Script + Google Sheets

   Les autres fichiers ne doivent PAS accéder directement
   à FC_MOCK_DATA.
   Ils doivent passer uniquement par FC_API.
   ========================================================= */

window.FC_API = (() => {
  const config = window.FC_CONFIG || {};

  const MOCK_STORAGE_KEY = "fcClasse_mockDatabase_v1";

  /*
   * Mot de passe UNIQUEMENT pour le mode démonstration.
   *
   * Il sera supprimé du fonctionnement réel lorsque
   * Google Apps Script sera connecté.
   */
  const MOCK_TEACHER_PASSWORD = "prof";


  /* =======================================================
     OUTILS
     ======================================================= */

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }


  function uid(prefix = "id") {
    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8)
    );
  }


  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }


  function safeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }


  function nowISO() {
    return new Date().toISOString();
  }


  /* =======================================================
     BASE MOCK
     ======================================================= */

  function createFreshMockDatabase() {
    if (!window.FC_MOCK_DATA) {
      throw new Error(
        "FC_MOCK_DATA est introuvable. Vérifie que mock-data.js est chargé avant api.js."
      );
    }

    return clone(window.FC_MOCK_DATA);
  }


  function normalizeMockDatabase(database) {
    const db = database || {};

    db.config = db.config || {};

    db.config.meritsPerOpening = Math.max(
      1,
      safeNumber(db.config.meritsPerOpening, 10)
    );

    db.packTypes = Array.isArray(db.packTypes)
      ? db.packTypes
      : [];

    db.students = Array.isArray(db.students)
      ? db.students
      : [];

    db.players = Array.isArray(db.players)
      ? db.players
      : [];

    db.collections = Array.isArray(db.collections)
      ? db.collections
      : [];

    db.openings = Array.isArray(db.openings)
      ? db.openings
      : [];

    return db;
  }


  function loadMockDatabase() {
    try {
      const saved = localStorage.getItem(MOCK_STORAGE_KEY);

      if (!saved) {
        const fresh = normalizeMockDatabase(
          createFreshMockDatabase()
        );

        saveMockDatabase(fresh);

        return fresh;
      }

      return normalizeMockDatabase(
        JSON.parse(saved)
      );

    } catch (error) {
      console.warn(
        "Impossible de charger les données de démonstration.",
        error
      );

      const fresh = normalizeMockDatabase(
        createFreshMockDatabase()
      );

      saveMockDatabase(fresh);

      return fresh;
    }
  }


  function saveMockDatabase(database) {
    localStorage.setItem(
      MOCK_STORAGE_KEY,
      JSON.stringify(database)
    );
  }


  function resetMockDatabase() {
    localStorage.removeItem(MOCK_STORAGE_KEY);

    return loadMockDatabase();
  }


  /* =======================================================
     CALCUL DES OPENINGS
     ======================================================= */

  function getOpeningStats(database, studentId) {
    const student = database.students.find(
      item => item.id === studentId
    );

    if (!student) {
      return {
        earned: 0,
        completed: 0,
        available: 0,
        threshold: database.config.meritsPerOpening
      };
    }

    const threshold = Math.max(
      1,
      safeNumber(
        database.config.meritsPerOpening,
        10
      )
    );

    /*
     * Les mérites ne sont jamais dépensés.
     *
     * Exemple :
     *
     * 27 mérites
     * seuil = 10
     *
     * floor(27 / 10) = 2 openings gagnés.
     */

    const earned = Math.floor(
      safeNumber(student.merits) / threshold
    );

    const completed = database.openings.filter(
      opening => opening.studentId === studentId
    ).length;

    const available = Math.max(
      0,
      earned - completed
    );

    return {
      earned,
      completed,
      available,
      threshold
    };
  }


  /* =======================================================
     COLLECTIONS
     ======================================================= */

  function getStudentCollection(database, studentId) {
    const collectionRows = database.collections.filter(
      item => item.studentId === studentId
    );

    return collectionRows
      .map(row => {
        const player = database.players.find(
          item => Number(item.eaId) === Number(row.eaId)
        );

        if (!player) {
          return null;
        }

        return {
          ...clone(player),

          collectionId: row.id,

          openingId: row.openingId || null,

          obtainedAt: row.obtainedAt || null
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        return (
          safeNumber(b.rating) -
            safeNumber(a.rating) ||
          String(a.name).localeCompare(
            String(b.name),
            "fr"
          )
        );
      });
  }


  function getCollectionOwner(database, eaId) {
    const row = database.collections.find(
      item => Number(item.eaId) === Number(eaId)
    );

    if (!row) {
      return null;
    }

    return database.students.find(
      student => student.id === row.studentId
    ) || null;
  }


  function isPlayerAvailable(database, eaId) {
    return !database.collections.some(
      item => Number(item.eaId) === Number(eaId)
    );
  }


  /* =======================================================
     FORMAT PUBLIC D'UN ÉLÈVE
     ======================================================= */

  function buildStudentSummary(database, student) {
    const collection = getStudentCollection(
      database,
      student.id
    );

    const openings = getOpeningStats(
      database,
      student.id
    );

    return {
      id: student.id,

      name: student.name,

      merits: safeNumber(student.merits),

      collectionCount: collection.length,

      openings
    };
  }


  function buildStudentDetails(database, student) {
    return {
      ...buildStudentSummary(
        database,
        student
      ),

      collection: getStudentCollection(
        database,
        student.id
      )
    };
  }


  /* =======================================================
     RECHERCHE ÉLÈVE — MOCK
     ======================================================= */

  function mockSearchStudents(query) {
    const database = loadMockDatabase();

    const search = normalizeText(query);

    if (
      search.length <
      (config.minimumSearchLength || 2)
    ) {
      return [];
    }

    return database.students

      .filter(student => {
        if (student.active === false) {
          return false;
        }

        return normalizeText(
          student.name
        ).includes(search);
      })

      .sort((a, b) => {
        const aName = normalizeText(a.name);
        const bName = normalizeText(b.name);

        /*
         * Les noms commençant exactement par
         * la recherche apparaissent en premier.
         */

        const aStart = aName.startsWith(search)
          ? 0
          : 1;

        const bStart = bName.startsWith(search)
          ? 0
          : 1;

        return (
          aStart -
            bStart ||
          aName.localeCompare(
            bName,
            "fr"
          )
        );
      })

      .slice(0, 10)

      .map(student =>
        buildStudentSummary(
          database,
          student
        )
      );
  }


  function mockGetStudents() {
    const database = loadMockDatabase();

    return database.students
      .filter(
        student => student.active !== false
      )
      .map(student =>
        buildStudentSummary(
          database,
          student
        )
      )
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
          "fr"
        )
      );
  }


  function mockGetStudent(studentId) {
    const database = loadMockDatabase();

    const student = database.students.find(
      item =>
        item.id === studentId &&
        item.active !== false
    );

    if (!student) {
      throw new Error(
        "Élève introuvable."
      );
    }

    return buildStudentDetails(
      database,
      student
    );
  }


  function mockGetPublicConfig() {
    const database = loadMockDatabase();

    return {
      meritsPerOpening:
        database.config.meritsPerOpening,

      packTypes:
        database.packTypes
          .filter(pack => pack.enabled)
          .map(pack => ({
            id: pack.id,
            name: pack.name
          }))
    };
  }


  /* =======================================================
     AUTHENTIFICATION PROF — MOCK
     ======================================================= */

  function createMockTeacherSession() {
    return (
      "mock_teacher_" +
      Date.now().toString(36) +
      "_" +
      Math.random()
        .toString(36)
        .slice(2)
    );
  }


  function assertMockTeacher(token) {
    if (
      !String(token || "")
        .startsWith("mock_teacher_")
    ) {
      throw new Error(
        "Session professeur invalide."
      );
    }
  }


  function mockTeacherLogin(password) {
    if (
      String(password) !==
      MOCK_TEACHER_PASSWORD
    ) {
      throw new Error(
        "Mot de passe incorrect."
      );
    }

    return {
      token: createMockTeacherSession(),

      teacher: {
        name: "Professeur"
      }
    };
  }


  /* =======================================================
     TABLEAU DE BORD PROF — MOCK
     ======================================================= */

  function mockGetTeacherDashboard(token) {
    assertMockTeacher(token);

    const database = loadMockDatabase();

    const students = database.students
      .filter(
        student => student.active !== false
      )
      .map(student =>
        buildStudentSummary(
          database,
          student
        )
      )
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
          "fr"
        )
      );

    const assignedPlayerIds = new Set(
      database.collections.map(
        item => Number(item.eaId)
      )
    );

    return {
      config: {
        meritsPerOpening:
          database.config.meritsPerOpening
      },

      students,

      stats: {
        students:
          students.length,

        players:
          database.players.length,

        assignedPlayers:
          assignedPlayerIds.size,

        availablePlayers:
          Math.max(
            0,
            database.players.length -
              assignedPlayerIds.size
          ),

        openings:
          database.openings.length
      },

      packTypes:
        clone(database.packTypes)
    };
  }


  /* =======================================================
     MODIFICATION MÉRITES — MOCK
     ======================================================= */

  function mockUpdateStudentMerits(
    token,
    studentId,
    merits
  ) {
    assertMockTeacher(token);

    const database = loadMockDatabase();

    const student = database.students.find(
      item => item.id === studentId
    );

    if (!student) {
      throw new Error(
        "Élève introuvable."
      );
    }

    const value = Math.max(
      0,
      Math.floor(
        safeNumber(merits)
      )
    );

    /*
     * On écrit directement le nombre de mérites.
     *
     * Ce n'est PAS un système +1 / -1 obligatoire.
     * Le professeur saisira par exemple directement :
     *
     * 27
     */

    student.merits = value;

    saveMockDatabase(database);

    return buildStudentSummary(
      database,
      student
    );
  }


  /* =======================================================
     MODIFICATION DU SEUIL — MOCK
     ======================================================= */

  function mockUpdateMeritsPerOpening(
    token,
    value
  ) {
    assertMockTeacher(token);

    const database = loadMockDatabase();

    const threshold = Math.max(
      1,
      Math.floor(
        safeNumber(value, 10)
      )
    );

    database.config.meritsPerOpening =
      threshold;

    saveMockDatabase(database);

    return {
      meritsPerOpening:
        threshold
    };
  }


  /* =======================================================
     AJOUT D'UN ÉLÈVE — MOCK
     ======================================================= */

  function mockCreateStudent(
    token,
    name
  ) {
    assertMockTeacher(token);

    const database = loadMockDatabase();

    const cleanName = String(name || "")
      .trim();

    if (!cleanName) {
      throw new Error(
        "Le nom de l'élève est obligatoire."
      );
    }

    const duplicate =
      database.students.some(
        student =>
          normalizeText(student.name) ===
          normalizeText(cleanName)
      );

    if (duplicate) {
      throw new Error(
        "Cet élève existe déjà."
      );
    }

    const student = {
      id: uid("eleve"),
      name: cleanName,
      merits: 0,
      active: true
    };

    database.students.push(student);

    saveMockDatabase(database);

    return buildStudentSummary(
      database,
      student
    );
  }


  /* =======================================================
     SUPPRESSION / ARCHIVAGE ÉLÈVE — MOCK
     ======================================================= */

  function mockArchiveStudent(
    token,
    studentId
  ) {
    assertMockTeacher(token);

    const database = loadMockDatabase();

    const student = database.students.find(
      item => item.id === studentId
    );

    if (!student) {
      throw new Error(
        "Élève introuvable."
      );
    }

    /*
     * On ne supprime pas réellement l'élève,
     * afin de conserver l'historique de ses openings.
     */

    student.active = false;

    saveMockDatabase(database);

    return {
      success: true
    };
  }


  /* =======================================================
     TIRAGE D'UN JOUEUR — MOCK
     ======================================================= */

  function getPlayerWeight(player) {
    /*
     * Probabilités provisoires pour le mode démo.
     *
     * Les très grosses notes sont plus difficiles
     * à obtenir.
     *
     * Plus tard, ces règles seront gérées
     * par les types de packs côté serveur.
     */

    const rating =
      safeNumber(player.rating);

    if (rating >= 90) {
      return 1;
    }

    if (rating >= 88) {
      return 2;
    }

    if (rating >= 86) {
      return 4;
    }

    if (rating >= 84) {
      return 6;
    }

    if (rating >= 80) {
      return 8;
    }

    return 10;
  }


  function randomWeightedPlayer(players) {
    if (!players.length) {
      return null;
    }

    const weighted = players.map(
      player => ({
        player,
        weight: getPlayerWeight(player)
      })
    );

    const total = weighted.reduce(
      (sum, item) =>
        sum + item.weight,
      0
    );

    let random = Math.random() * total;

    for (const item of weighted) {
      random -= item.weight;

      if (random <= 0) {
        return item.player;
      }
    }

    return weighted[
      weighted.length - 1
    ].player;
  }


  function mockGetOpeningContext(
    token,
    studentId,
    packType
  ) {
    assertMockTeacher(token);

    const database = loadMockDatabase();

    const student = database.students.find(
      item =>
        item.id === studentId &&
        item.active !== false
    );

    if (!student) {
      throw new Error(
        "Élève introuvable."
      );
    }

    const selectedPack =
      database.packTypes.find(
        pack =>
          pack.id === packType &&
          pack.enabled
      );

    if (!selectedPack) {
      throw new Error(
        "Ce pack n'est pas disponible."
      );
    }

    const openings = getOpeningStats(
      database,
      studentId
    );

    const availablePlayers =
      database.players.filter(
        player =>
          isPlayerAvailable(
            database,
            player.eaId
          )
      );

    return {
      student:
        buildStudentSummary(
          database,
          student
        ),

      pack: clone(selectedPack),

      openings,

      availablePlayers:
        availablePlayers.length
    };
  }


  function mockPerformOpening(
    token,
    studentId,
    packType
  ) {
    assertMockTeacher(token);

    const database = loadMockDatabase();

    const student = database.students.find(
      item =>
        item.id === studentId &&
        item.active !== false
    );

    if (!student) {
      throw new Error(
        "Élève introuvable."
      );
    }

    const selectedPack =
      database.packTypes.find(
        pack =>
          pack.id === packType &&
          pack.enabled
      );

    if (!selectedPack) {
      throw new Error(
        "Ce pack n'est pas disponible."
      );
    }

    const stats = getOpeningStats(
      database,
      studentId
    );

    if (stats.available < 1) {
      throw new Error(
        "Cet élève n'a aucun opening disponible."
      );
    }

    /*
     * JOUEURS UNIQUES DANS TOUTE LA CLASSE.
     */

    const availablePlayers =
      database.players.filter(
        player =>
          isPlayerAvailable(
            database,
            player.eaId
          )
      );

    if (!availablePlayers.length) {
      throw new Error(
        "Il n'y a plus aucun joueur disponible."
      );
    }

    const player =
      randomWeightedPlayer(
        availablePlayers
      );

    if (!player) {
      throw new Error(
        "Impossible d'effectuer le tirage."
      );
    }

    const openingId =
      uid("opening");

    const date =
      nowISO();

    /*
     * On crée d'abord l'historique d'opening.
     */

    database.openings.push({
      id: openingId,

      studentId,

      packType:
        selectedPack.id,

      eaId:
        player.eaId,

      createdAt:
        date
    });

    /*
     * Puis on attribue définitivement
     * le joueur à cet élève.
     */

    database.collections.push({
      id:
        uid("collection"),

      studentId,

      eaId:
        player.eaId,

      openingId,

      obtainedAt:
        date
    });

    /*
     * IMPORTANT :
     *
     * student.merits NE CHANGE PAS.
     *
     * Seul le nombre d'openings effectués
     * augmente grâce à l'historique ci-dessus.
     */

    saveMockDatabase(database);

    return {
      openingId,

      pack:
        clone(selectedPack),

      player:
        clone(player),

      student:
        buildStudentDetails(
          database,
          student
        ),

      openings:
        getOpeningStats(
          database,
          studentId
        )
    };
  }


  /* =======================================================
     API GOOGLE APPS SCRIPT
     ======================================================= */

  async function remoteRequest(
    action,
    payload = {},
    method = "GET"
  ) {
    const baseUrl =
      String(
        config.apiBaseUrl || ""
      ).trim();

    if (!baseUrl) {
      throw new Error(
        "L'URL Google Apps Script n'est pas configurée."
      );
    }

    let response;

    if (method === "GET") {
      const url =
        new URL(baseUrl);

      url.searchParams.set(
        "action",
        action
      );

      Object.entries(payload).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null
          ) {
            url.searchParams.set(
              key,
              String(value)
            );
          }
        }
      );

      response = await fetch(
        url.toString(),
        {
          method: "GET",
          cache: "no-store"
        }
      );

    } else {
      /*
       * Form URL encoded plutôt que JSON.
       *
       * Ça facilitera la communication avec
       * Google Apps Script depuis GitHub Pages.
       */

      const body =
        new URLSearchParams();

      body.set(
        "action",
        action
      );

      Object.entries(payload).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null
          ) {
            body.set(
              key,
              typeof value === "object"
                ? JSON.stringify(value)
                : String(value)
            );
          }
        }
      );

      response = await fetch(
        baseUrl,
        {
          method: "POST",
          body,
          cache: "no-store"
        }
      );
    }

    if (!response.ok) {
      throw new Error(
        "Erreur de communication avec le serveur."
      );
    }

    const result =
      await response.json();

    if (
      !result ||
      result.ok !== true
    ) {
      throw new Error(
        result?.error ||
        "Une erreur inconnue est survenue."
      );
    }

    return result.data;
  }


  /* =======================================================
     API PUBLIQUE

     Tout le reste du site utilisera uniquement
     ces fonctions.
     ======================================================= */

  async function searchStudents(query) {
    if (config.useMockData) {
      return mockSearchStudents(query);
    }

    return remoteRequest(
      "searchStudents",
      { query }
    );
  }


  async function getStudents() {
    if (config.useMockData) {
      return mockGetStudents();
    }

    return remoteRequest(
      "getStudents"
    );
  }


  async function getStudent(studentId) {
    if (config.useMockData) {
      return mockGetStudent(
        studentId
      );
    }

    return remoteRequest(
      "getStudent",
      { studentId }
    );
  }


  async function getPublicConfig() {
    if (config.useMockData) {
      return mockGetPublicConfig();
    }

    return remoteRequest(
      "getPublicConfig"
    );
  }


  async function teacherLogin(password) {
    if (config.useMockData) {
      return mockTeacherLogin(
        password
      );
    }

    return remoteRequest(
      "teacherLogin",
      { password },
      "POST"
    );
  }


  async function getTeacherDashboard(token) {
    if (config.useMockData) {
      return mockGetTeacherDashboard(
        token
      );
    }

    return remoteRequest(
      "getTeacherDashboard",
      { token }
    );
  }


  async function updateStudentMerits(
    token,
    studentId,
    merits
  ) {
    if (config.useMockData) {
      return mockUpdateStudentMerits(
        token,
        studentId,
        merits
      );
    }

    return remoteRequest(
      "updateStudentMerits",
      {
        token,
        studentId,
        merits
      },
      "POST"
    );
  }


  async function updateMeritsPerOpening(
    token,
    value
  ) {
    if (config.useMockData) {
      return mockUpdateMeritsPerOpening(
        token,
        value
      );
    }

    return remoteRequest(
      "updateMeritsPerOpening",
      {
        token,
        value
      },
      "POST"
    );
  }


  async function createStudent(
    token,
    name
  ) {
    if (config.useMockData) {
      return mockCreateStudent(
        token,
        name
      );
    }

    return remoteRequest(
      "createStudent",
      {
        token,
        name
      },
      "POST"
    );
  }


  async function archiveStudent(
    token,
    studentId
  ) {
    if (config.useMockData) {
      return mockArchiveStudent(
        token,
        studentId
      );
    }

    return remoteRequest(
      "archiveStudent",
      {
        token,
        studentId
      },
      "POST"
    );
  }


  async function getOpeningContext(
    token,
    studentId,
    packType =
      config.defaultPackType
  ) {
    if (config.useMockData) {
      return mockGetOpeningContext(
        token,
        studentId,
        packType
      );
    }

    return remoteRequest(
      "getOpeningContext",
      {
        token,
        studentId,
        packType
      }
    );
  }


  async function performOpening(
    token,
    studentId,
    packType =
      config.defaultPackType
  ) {
    if (config.useMockData) {
      return mockPerformOpening(
        token,
        studentId,
        packType
      );
    }

    return remoteRequest(
      "performOpening",
      {
        token,
        studentId,
        packType
      },
      "POST"
    );
  }


  /* =======================================================
     OUTILS DÉVELOPPEMENT
     ======================================================= */

  async function resetDemo() {
    if (!config.useMockData) {
      throw new Error(
        "resetDemo est disponible uniquement en mode démonstration."
      );
    }

    return resetMockDatabase();
  }


  /* =======================================================
     EXPORT
     ======================================================= */

  return {
    searchStudents,

    getStudents,

    getStudent,

    getPublicConfig,

    teacherLogin,

    getTeacherDashboard,

    updateStudentMerits,

    updateMeritsPerOpening,

    createStudent,

    archiveStudent,

    getOpeningContext,

    performOpening,

    resetDemo
  };
})();
