(() => {
  "use strict";

  const config = window.FC_CONFIG;

  if (!config) {
    throw new Error("FC_CONFIG introuvable.");
  }

  // =====================================================
  // CONFIG CACHE
  // =====================================================

  const PUBLIC_CACHE_KEY = "bafc_public_cache_v1";
  const TEACHER_CACHE_KEY = "bafc_teacher_cache_v1";

  const REFRESH_DELAY = 15000; // 15 sec
  const PROFILE_REFRESH_DELAY = 30000; // 30 sec

  const inflight = {
    students: null,
    config: null,
    dashboard: null,
    profiles: {},
    searches: {}
  };


  // =====================================================
  // OUTILS
  // =====================================================

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function now() {
    return Date.now();
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function loadPublicCache() {
    try {
      return JSON.parse(
        localStorage.getItem(PUBLIC_CACHE_KEY)
      ) || {
        students: null,
        studentsAt: 0,

        config: null,
        configAt: 0,

        profiles: {},
        searches: {}
      };
    } catch (error) {
      return {
        students: null,
        studentsAt: 0,
        config: null,
        configAt: 0,
        profiles: {},
        searches: {}
      };
    }
  }

  function savePublicCache() {
    try {
      localStorage.setItem(
        PUBLIC_CACHE_KEY,
        JSON.stringify(publicCache)
      );
    } catch (error) {
      console.warn(
        "Impossible de sauvegarder le cache public.",
        error
      );
    }
  }

  function loadTeacherCache() {
    try {
      return JSON.parse(
        sessionStorage.getItem(TEACHER_CACHE_KEY)
      ) || {
        token: null,
        dashboard: null,
        dashboardAt: 0
      };
    } catch (error) {
      return {
        token: null,
        dashboard: null,
        dashboardAt: 0
      };
    }
  }

  function saveTeacherCache() {
    try {
      sessionStorage.setItem(
        TEACHER_CACHE_KEY,
        JSON.stringify(teacherCache)
      );
    } catch (error) {
      console.warn(
        "Impossible de sauvegarder le cache prof.",
        error
      );
    }
  }

  function syncError(error) {
    console.error(
      "Erreur de synchronisation Bel Air FC :",
      error
    );

    window.dispatchEvent(
      new CustomEvent("bafc-sync-error", {
        detail: error
      })
    );
  }


  let publicCache = loadPublicCache();
  let teacherCache = loadTeacherCache();


  // =====================================================
  // APPEL APPS SCRIPT
  // =====================================================

  async function remoteRequest(
    action,
    payload = {},
    method = "GET"
  ) {
    if (!config.apiBaseUrl) {
      throw new Error(
        "URL Apps Script non configurée."
      );
    }

    const params = new URLSearchParams();

    params.set("action", action);

    Object.entries(payload).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null
        ) {
          params.set(key, String(value));
        }
      }
    );

    let response;

    if (method === "POST") {
      response = await fetch(
        config.apiBaseUrl,
        {
          method: "POST",
          body: params
        }
      );
    } else {
      response = await fetch(
        config.apiBaseUrl +
        "?" +
        params.toString(),
        {
          method: "GET"
        }
      );
    }

    if (!response.ok) {
      throw new Error(
        "Erreur réseau : " +
        response.status
      );
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(
        result.error ||
        "Erreur serveur."
      );
    }

    return result.data;
  }


  // =====================================================
  // CONFIG PUBLIQUE
  // =====================================================

  async function refreshConfig() {
    if (inflight.config) {
      return inflight.config;
    }

    inflight.config =
      remoteRequest(
        "getPublicConfig"
      )
        .then(data => {
          publicCache.config = data;
          publicCache.configAt = now();

          savePublicCache();

          return data;
        })
        .finally(() => {
          inflight.config = null;
        });

    return inflight.config;
  }

  async function getPublicConfig() {
    if (publicCache.config) {
      if (
        now() -
        publicCache.configAt >
        REFRESH_DELAY
      ) {
        refreshConfig()
          .catch(syncError);
      }

      return clone(
        publicCache.config
      );
    }

    return clone(
      await refreshConfig()
    );
  }


  // =====================================================
  // ÉLÈVES
  // =====================================================

  async function refreshStudents() {
    if (inflight.students) {
      return inflight.students;
    }

    inflight.students =
      remoteRequest("getStudents")
        .then(students => {
          publicCache.students =
            students || [];

          publicCache.studentsAt =
            now();

          savePublicCache();

          // Préchargement des collections
          // en arrière-plan.
          prefetchProfiles(
            publicCache.students
          );

          return students;
        })
        .finally(() => {
          inflight.students = null;
        });

    return inflight.students;
  }

  async function getStudents() {
    if (publicCache.students) {
      if (
        now() -
        publicCache.studentsAt >
        REFRESH_DELAY
      ) {
        refreshStudents()
          .catch(syncError);
      }

      prefetchProfiles(
        publicCache.students
      );

      return clone(
        publicCache.students
      );
    }

    const students =
      await refreshStudents();

    return clone(students);
  }


  // =====================================================
  // RECHERCHE
  // =====================================================

  async function searchStudents(query) {
    const q = normalize(query);

    if (
      q.length <
      (config.minimumSearchLength || 2)
    ) {
      return [];
    }

    // 1. Recherche instantanée
    // dans les noms publics déjà chargés.
    if (publicCache.students) {
      const localResults =
        publicCache.students.filter(
          student =>
            normalize(
              student.name
            ).includes(q)
        );

      if (localResults.length) {
        // Le serveur confirme en arrière-plan,
        // sans bloquer l'utilisateur.
        refreshSearch(
          query,
          q
        ).catch(syncError);

        return clone(localResults);
      }
    }

    // 2. Recherche déjà faite auparavant.
    if (
      publicCache.searches &&
      publicCache.searches[q]
    ) {
      const cached =
        publicCache.searches[q];

      refreshSearch(
        query,
        q
      ).catch(syncError);

      return clone(
        cached.data || []
      );
    }

    // 3. Seulement si on n'a vraiment
    // rien localement, on attend Google.
    return clone(
      await refreshSearch(
        query,
        q
      )
    );
  }

  async function refreshSearch(
    query,
    normalizedQuery
  ) {
    if (
      inflight.searches[
        normalizedQuery
      ]
    ) {
      return inflight.searches[
        normalizedQuery
      ];
    }

    inflight.searches[
      normalizedQuery
    ] =
      remoteRequest(
        "searchStudents",
        {
          query: query
        }
      )
        .then(results => {
          if (!publicCache.searches) {
            publicCache.searches = {};
          }

          publicCache.searches[
            normalizedQuery
          ] = {
            data: results || [],
            at: now()
          };

          savePublicCache();

          return results || [];
        })
        .finally(() => {
          delete inflight.searches[
            normalizedQuery
          ];
        });

    return inflight.searches[
      normalizedQuery
    ];
  }


  // =====================================================
  // PROFILS / COLLECTIONS
  // =====================================================

  async function refreshProfile(
    studentId
  ) {
    if (
      inflight.profiles[
        studentId
      ]
    ) {
      return inflight.profiles[
        studentId
      ];
    }

    inflight.profiles[
      studentId
    ] =
      remoteRequest(
        "getStudent",
        {
          studentId: studentId
        }
      )
        .then(profile => {
          if (!publicCache.profiles) {
            publicCache.profiles = {};
          }

          publicCache.profiles[
            studentId
          ] = {
            data: profile,
            at: now()
          };

          savePublicCache();

          return profile;
        })
        .finally(() => {
          delete inflight.profiles[
            studentId
          ];
        });

    return inflight.profiles[
      studentId
    ];
  }

  async function getStudent(
    studentId
  ) {
    const cached =
      publicCache.profiles &&
      publicCache.profiles[
        studentId
      ];

    if (cached && cached.data) {
      if (
        now() -
        cached.at >
        PROFILE_REFRESH_DELAY
      ) {
        refreshProfile(
          studentId
        ).catch(syncError);
      }

      return clone(
        cached.data
      );
    }

    return clone(
      await refreshProfile(
        studentId
      )
    );
  }


  // =====================================================
  // PRÉCHARGEMENT DES PROFILS
  // =====================================================

  async function prefetchProfiles(
    students
  ) {
    if (!Array.isArray(students)) {
      return;
    }

    const missing =
      students.filter(student => {
        const cached =
          publicCache.profiles &&
          publicCache.profiles[
            student.id
          ];

        if (!cached) {
          return true;
        }

        return (
          now() -
          cached.at >
          PROFILE_REFRESH_DELAY
        );
      });

    // On évite de lancer 25 requêtes
    // exactement en même temps.
    const concurrency = 4;
    let cursor = 0;

    async function worker() {
      while (
        cursor <
        missing.length
      ) {
        const student =
          missing[cursor++];

        try {
          await refreshProfile(
            student.id
          );
        } catch (error) {
          console.warn(
            "Préchargement impossible pour",
            student.id
          );
        }
      }
    }

    const workers = [];

    for (
      let i = 0;
      i < Math.min(
        concurrency,
        missing.length
      );
      i++
    ) {
      workers.push(worker());
    }

    Promise.all(workers)
      .catch(() => {});
  }


  // =====================================================
  // LOGIN PROF
  // =====================================================

  async function teacherLogin(
    password
  ) {
    const result =
      await remoteRequest(
        "teacherLogin",
        {
          password: password
        },
        "POST"
      );

    teacherCache = {
      token: result.token,
      dashboard: null,
      dashboardAt: 0
    };

    saveTeacherCache();

    return result;
  }


  // =====================================================
  // DASHBOARD PROF
  // =====================================================

  async function refreshDashboard(
    token
  ) {
    if (inflight.dashboard) {
      return inflight.dashboard;
    }

    inflight.dashboard =
      remoteRequest(
        "getTeacherDashboard",
        {
          token: token
        }
      )
        .then(data => {
          teacherCache.token =
            token;

          teacherCache.dashboard =
            data;

          teacherCache.dashboardAt =
            now();

          saveTeacherCache();

          // Met également à jour
          // les infos publiques.
          if (
            data &&
            Array.isArray(
              data.students
            )
          ) {
            publicCache.students =
              data.students
                .filter(
                  student =>
                    student.active
                )
                .map(student => ({
                  id: student.id,
                  name:
                    student.publicName ||
                    student.name,
                  merits:
                    student.merits,
                  active:
                    student.active,
                  openings:
                    student.openings
                }));

            publicCache.studentsAt =
              now();

            savePublicCache();
          }

          return data;
        })
        .finally(() => {
          inflight.dashboard = null;
        });

    return inflight.dashboard;
  }

  async function getTeacherDashboard(
    token
  ) {
    if (
      teacherCache.token ===
        token &&
      teacherCache.dashboard
    ) {
      if (
        now() -
        teacherCache.dashboardAt >
        REFRESH_DELAY
      ) {
        refreshDashboard(
          token
        ).catch(syncError);
      }

      return clone(
        teacherCache.dashboard
      );
    }

    return clone(
      await refreshDashboard(
        token
      )
    );
  }


  // =====================================================
  // MÉRITES - OPTIMISTIC UI
  // =====================================================

  async function updateStudentMerits(
    token,
    studentId,
    merits
  ) {
    const value =
      Math.max(
        0,
        Math.floor(
          Number(merits) || 0
        )
      );

    let previousValue = null;

    // Mise à jour immédiate
    // du dashboard local.
    if (
      teacherCache.dashboard &&
      Array.isArray(
        teacherCache.dashboard.students
      )
    ) {
      const student =
        teacherCache.dashboard.students.find(
          s =>
            String(s.id) ===
            String(studentId)
        );

      if (student) {
        previousValue =
          student.merits;

        student.merits =
          value;

        const threshold =
          Number(
            teacherCache.dashboard
              .config
              ?.meritsPerOpening
          ) || 10;

        const completed =
          Number(
            student.openingsCompleted
          ) || 0;

        const earned =
          Math.floor(
            value / threshold
          );

        student.openings = {
          earned: earned,
          completed: completed,
          available:
            Math.max(
              0,
              earned -
              completed
            ),
          threshold:
            threshold
        };

        teacherCache.dashboardAt =
          now();

        saveTeacherCache();
      }
    }

    // Mise à jour cache public.
    updateCachedPublicStudent(
      studentId,
      {
        merits: value
      }
    );

    // Le frontend reçoit la réponse
    // immédiatement.
    const immediate = {
      studentId:
        studentId,
      merits:
        value
    };

    // Sauvegarde Google derrière.
    remoteRequest(
      "updateStudentMerits",
      {
        token: token,
        studentId: studentId,
        merits: value
      },
      "POST"
    )
      .then(() => {
        refreshDashboard(
          token
        ).catch(() => {});
      })
      .catch(error => {
        // Rollback si Google échoue.
        if (
          previousValue !== null
        ) {
          updateStudentMeritsLocalOnly(
            studentId,
            previousValue
          );
        }

        syncError(error);

        setTimeout(() => {
          alert(
            "La modification n'a pas pu être sauvegardée dans Google Sheets."
          );
        }, 0);
      });

    return immediate;
  }

  function updateStudentMeritsLocalOnly(
    studentId,
    merits
  ) {
    if (
      teacherCache.dashboard &&
      Array.isArray(
        teacherCache.dashboard.students
      )
    ) {
      const student =
        teacherCache.dashboard.students.find(
          s =>
            String(s.id) ===
            String(studentId)
        );

      if (student) {
        student.merits =
          merits;

        saveTeacherCache();
      }
    }

    updateCachedPublicStudent(
      studentId,
      {
        merits: merits
      }
    );
  }


  // =====================================================
  // SEUIL MÉRITES - OPTIMISTIC UI
  // =====================================================

  async function updateMeritsPerOpening(
    token,
    value
  ) {
    const threshold =
      Math.max(
        1,
        Math.floor(
          Number(value) || 10
        )
      );

    if (
      teacherCache.dashboard
    ) {
      if (
        !teacherCache.dashboard.config
      ) {
        teacherCache.dashboard.config =
          {};
      }

      teacherCache.dashboard
        .config
        .meritsPerOpening =
        threshold;

      recalculateDashboardOpenings(
        threshold
      );

      saveTeacherCache();
    }

    if (publicCache.config) {
      publicCache.config
        .meritsPerOpening =
        threshold;

      publicCache.configAt =
        now();

      savePublicCache();
    }

    const immediate = {
      meritsPerOpening:
        threshold
    };

    remoteRequest(
      "updateMeritsPerOpening",
      {
        token: token,
        value: threshold
      },
      "POST"
    )
      .then(() => {
        refreshDashboard(
          token
        ).catch(() => {});

        refreshConfig()
          .catch(() => {});
      })
      .catch(error => {
        syncError(error);

        setTimeout(() => {
          alert(
            "Le nouveau seuil n'a pas pu être sauvegardé."
          );
        }, 0);
      });

    return immediate;
  }

  function recalculateDashboardOpenings(
    threshold
  ) {
    if (
      !teacherCache.dashboard ||
      !Array.isArray(
        teacherCache.dashboard.students
      )
    ) {
      return;
    }

    teacherCache.dashboard.students
      .forEach(student => {
        const merits =
          Number(
            student.merits
          ) || 0;

        const completed =
          Number(
            student.openingsCompleted
          ) || 0;

        const earned =
          Math.floor(
            merits /
            threshold
          );

        student.openings = {
          earned: earned,
          completed: completed,
          available:
            Math.max(
              0,
              earned -
              completed
            ),
          threshold:
            threshold
        };
      });
  }


  // =====================================================
  // AJOUT ÉLÈVE
  // =====================================================

  async function createStudent(
    token,
    name,
    publicName = ""
  ) {
    // Action rare :
    // on attend le serveur pour recevoir
    // le vrai ID E00X.
    const result =
      await remoteRequest(
        "createStudent",
        {
          token: token,
          name: name,
          publicName:
            publicName
        },
        "POST"
      );

    await refreshDashboard(
      token
    );

    refreshStudents()
      .catch(syncError);

    return result;
  }


  // =====================================================
  // ARCHIVER ÉLÈVE
  // =====================================================

  async function archiveStudent(
    token,
    studentId
  ) {
    // Disparition immédiate du dashboard.
    if (
      teacherCache.dashboard &&
      Array.isArray(
        teacherCache.dashboard.students
      )
    ) {
      const student =
        teacherCache.dashboard.students.find(
          s =>
            String(s.id) ===
            String(studentId)
        );

      if (student) {
        student.active =
          false;
      }

      saveTeacherCache();
    }

    if (
      Array.isArray(
        publicCache.students
      )
    ) {
      publicCache.students =
        publicCache.students.filter(
          student =>
            String(student.id) !==
            String(studentId)
        );

      savePublicCache();
    }

    const result = {
      studentId:
        studentId,
      active:
        false
    };

    remoteRequest(
      "archiveStudent",
      {
        token: token,
        studentId: studentId
      },
      "POST"
    )
      .then(() => {
        refreshDashboard(
          token
        ).catch(() => {});
      })
      .catch(error => {
        syncError(error);

        setTimeout(() => {
          alert(
            "L'élève n'a pas pu être archivé dans Google Sheets."
          );
        }, 0);
      });

    return result;
  }


  // =====================================================
  // CONTEXTE OPENING
  // =====================================================

  async function getOpeningContext(
    token,
    studentId,
    packType = "standard"
  ) {
    // Si le dashboard est déjà chargé,
    // aucune attente Google.
    if (
      teacherCache.token ===
        token &&
      teacherCache.dashboard &&
      Array.isArray(
        teacherCache.dashboard.students
      )
    ) {
      const student =
        teacherCache.dashboard.students.find(
          s =>
            String(s.id) ===
            String(studentId)
        );

      if (student) {
        const stats =
          student.openings || {
            earned: 0,
            completed: 0,
            available: 0,
            threshold: 10
          };

        return {
          student: {
            id:
              student.id,

            name:
              student.publicName ||
              student.name,

            merits:
              student.merits,

            openings:
              stats
          },

          openings:
            stats,

          stats:
            stats,

          packType:
            packType,

          availablePlayers:
            teacherCache.dashboard
              .players
              ?.available ?? 0
        };
      }
    }

    return remoteRequest(
      "getOpeningContext",
      {
        token: token,
        studentId:
          studentId,
        packType:
          packType
      }
    );
  }


  // =====================================================
  // OPENING
  // =====================================================

  async function performOpening(
    token,
    studentId,
    packType = "standard"
  ) {
    // Ici on DOIT attendre le serveur.
    // C'est ce qui garantit qu'un même
    // joueur ne peut jamais être donné
    // à deux élèves.
    const result =
      await remoteRequest(
        "performOpening",
        {
          token: token,
          studentId:
            studentId,
          packType:
            packType
        },
        "POST"
      );

    // Mise à jour immédiate du cache prof.
    if (
      teacherCache.dashboard &&
      Array.isArray(
        teacherCache.dashboard.students
      )
    ) {
      const student =
        teacherCache.dashboard.students.find(
          s =>
            String(s.id) ===
            String(studentId)
        );

      if (student) {
        if (result.student) {
          student.merits =
            result.student.merits;
        }

        if (result.openings) {
          student.openings =
            result.openings;

          student.openingsCompleted =
            result.openings.completed;
        }
      }

      if (
        teacherCache.dashboard.players
      ) {
        teacherCache.dashboard
          .players
          .owned =
          (
            teacherCache.dashboard
              .players
              .owned || 0
          ) + 1;

        teacherCache.dashboard
          .players
          .available =
          Math.max(
            0,
            (
              teacherCache.dashboard
                .players
                .available || 0
            ) - 1
          );
      }

      saveTeacherCache();
    }

    // Mise à jour collection locale.
    const cached =
      publicCache.profiles &&
      publicCache.profiles[
        studentId
      ];

    if (
      cached &&
      cached.data
    ) {
      if (
        !Array.isArray(
          cached.data.collection
        )
      ) {
        cached.data.collection =
          [];
      }

      if (result.player) {
        cached.data.collection.push(
          result.player
        );

        cached.data.collection.sort(
          (a, b) =>
            b.rating - a.rating
        );
      }

      if (result.student) {
        cached.data.student =
          result.student;
      }

      if (result.openings) {
        cached.data.openings =
          result.openings;
      }

      cached.at =
        now();

      savePublicCache();
    }

    updateCachedPublicStudent(
      studentId,
      result.student || {}
    );

    return result;
  }


  // =====================================================
  // CACHE ÉLÈVE PUBLIC
  // =====================================================

  function updateCachedPublicStudent(
    studentId,
    changes
  ) {
    if (
      Array.isArray(
        publicCache.students
      )
    ) {
      const student =
        publicCache.students.find(
          s =>
            String(s.id) ===
            String(studentId)
        );

      if (student) {
        Object.assign(
          student,
          changes
        );
      }
    }

    const profile =
      publicCache.profiles &&
      publicCache.profiles[
        studentId
      ];

    if (
      profile &&
      profile.data &&
      profile.data.student
    ) {
      Object.assign(
        profile.data.student,
        changes
      );

      profile.at =
        now();
    }

    savePublicCache();
  }


  // =====================================================
  // RESET / OUTILS
  // =====================================================

  function clearCache() {
    publicCache = {
      students: null,
      studentsAt: 0,

      config: null,
      configAt: 0,

      profiles: {},
      searches: {}
    };

    teacherCache = {
      token: null,
      dashboard: null,
      dashboardAt: 0
    };

    localStorage.removeItem(
      PUBLIC_CACHE_KEY
    );

    sessionStorage.removeItem(
      TEACHER_CACHE_KEY
    );
  }

  async function resetDemo() {
    clearCache();
    return true;
  }


  // =====================================================
  // API PUBLIQUE JS
  // =====================================================

  window.FC_API = {
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

    resetDemo,
    clearCache
  };


  // =====================================================
  // PRÉCHAUFFAGE AUTOMATIQUE
  // =====================================================

  if (
    !config.useMockData &&
    config.apiBaseUrl
  ) {
    setTimeout(() => {
      getPublicConfig()
        .catch(() => {});

      getStudents()
        .catch(() => {});
    }, 0);
  }

})();
