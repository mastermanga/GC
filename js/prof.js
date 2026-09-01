/* =========================================================
   BEL AIR FC — PROF.JS
   ========================================================= */

(() => {
  "use strict";

  const config = window.FC_CONFIG;
  const api = window.FC_API;

  if (!config || !api) {
    console.error("Bel Air FC : config.js ou api.js n'est pas chargé.");
    return;
  }

  const SESSION_STORAGE_KEY = "fcClasse_teacherSession_v1";

  const $ = id => document.getElementById(id);

  const loginSection = $("teacher-login-section");
  const loginForm = $("teacher-login-form");
  const passwordInput = $("teacher-password");
  const passwordToggle = $("toggle-teacher-password");
  const loginButton = $("teacher-login-button");
  const loginError = $("teacher-login-error");

  const dashboard = $("teacher-dashboard");
  const refreshButton = $("teacher-refresh");
  const logoutButton = $("teacher-logout");

  const statStudents = $("teacher-stat-students");
  const statAssigned = $("teacher-stat-assigned");
  const statAvailable = $("teacher-stat-available");
  const statOpenings = $("teacher-stat-openings");

  const thresholdForm = $("threshold-form");
  const thresholdInput = $("teacher-threshold");

  const studentSearch = $("teacher-student-search");
  const studentsList = $("teacher-students-list");
  const studentsLoading = $("teacher-students-loading");
  const studentsEmpty = $("teacher-students-empty");

  const addStudentButton = $("open-add-student");
  const addStudentModal = $("add-student-modal");
  const addStudentBackdrop = $("add-student-backdrop");
  const addStudentClose = $("close-add-student");
  const addStudentForm = $("add-student-form");
  const newStudentName = $("new-student-name");
  const addStudentError = $("add-student-error");

  const openingModal = $("opening-confirm-modal");
  const openingBackdrop = $("opening-confirm-backdrop");
  const openingClose = $("opening-confirm-close");
  const openingCancel = $("opening-confirm-cancel");
  const openingStart = $("opening-confirm-start");
  const openingText = $("opening-confirm-text");

  const toast = $("teacher-toast");

  let teacherToken = null;
  let teacherData = null;
  let dashboardData = null;
  let students = [];

  let openingStudentId = null;

  let openingPackType =
    config.defaultPackType ||
    "standard";

  let toastTimer = null;

  let globalActionRunning =
    false;


  /* =========================================================
     OUTILS
     ========================================================= */

  function safeNumber(
    value,
    fallback = 0
  ) {
    const n =
      Number(value);

    return Number.isFinite(n)
      ? n
      : fallback;
  }


  function firstNumber(
    ...values
  ) {
    for (
      const value
      of values
    ) {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        continue;
      }

      const n =
        Number(value);

      if (
        Number.isFinite(n)
      ) {
        return n;
      }
    }

    return 0;
  }


  function escapeHtml(
    value
  ) {
    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }


  function normalizeText(
    value
  ) {
    return String(
      value || ""
    )
      .normalize(
        "NFD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim();
  }


  function getInitials(
    name
  ) {
    return String(
      name || ""
    )
      .trim()
      .split(
        /\s+/
      )
      .filter(
        Boolean
      )
      .slice(
        0,
        2
      )
      .map(
        part =>
          part[0]
            ?.toUpperCase() ||
          ""
      )
      .join("");
  }


  function setButtonLoading(
    button,
    loading,
    text = "Chargement..."
  ) {
    if (!button) {
      return;
    }

    if (loading) {
      if (
        !button.dataset
          .originalText
      ) {
        button.dataset
          .originalText =
          button.textContent;
      }

      button.disabled =
        true;

      button.textContent =
        text;

      return;
    }

    button.disabled =
      false;

    if (
      button.dataset
        .originalText
    ) {
      button.textContent =
        button.dataset
          .originalText;

      delete button.dataset
        .originalText;
    }
  }


  function showToast(
    message
  ) {
    if (!toast) {
      return;
    }

    clearTimeout(
      toastTimer
    );

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );

    toastTimer =
      setTimeout(
        () => {
          toast.classList.remove(
            "show"
          );
        },
        2300
      );
  }


  /* =========================================================
     APPEL DIRECT AU BACKEND
     ========================================================= */

  async function backendRequest(
    action,
    payload = {},
    method = "GET"
  ) {
    if (
      !config.apiBaseUrl
    ) {
      throw new Error(
        "URL Apps Script non configurée."
      );
    }

    const params =
      new URLSearchParams({
        action:
          action,

        _ts:
          String(
            Date.now()
          )
      });


    Object.entries(
      payload
    ).forEach(
      (
        [
          key,
          value
        ]
      ) => {
        if (
          value !==
            undefined &&
          value !==
            null
        ) {
          params.set(
            key,
            String(
              value
            )
          );
        }
      }
    );


    const response =
      method === "POST"

        ? await fetch(
            config.apiBaseUrl,
            {
              method:
                "POST",

              body:
                params
            }
          )

        : await fetch(
            `${config.apiBaseUrl}?${params}`,
            {
              method:
                "GET",

              cache:
                "no-store"
            }
          );


    if (
      !response.ok
    ) {
      throw new Error(
        `Erreur réseau : ${response.status}`
      );
    }


    const result =
      await response.json();


    if (
      !result?.ok
    ) {
      throw new Error(
        result?.error ||
        "Erreur serveur."
      );
    }


    return result.data;
  }


  function clearApiCache() {
    try {
      api.clearCache?.();

    } catch (error) {
      console.warn(
        "Impossible de vider le cache API.",
        error
      );
    }
  }


  /* =========================================================
     SESSION
     ========================================================= */

  function saveSession(
    token,
    teacher
  ) {
    teacherToken =
      token;

    teacherData =
      teacher ||
      null;


    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        token:
          token,

        teacher:
          teacher ||
          null
      })
    );
  }


  function loadSession() {
    try {
      const raw =
        sessionStorage
          .getItem(
            SESSION_STORAGE_KEY
          );


      if (!raw) {
        return null;
      }


      const session =
        JSON.parse(
          raw
        );


      if (
        !session?.token
      ) {
        return null;
      }


      teacherToken =
        session.token;


      teacherData =
        session.teacher ||
        null;


      return session;

    } catch (error) {
      clearSession();

      return null;
    }
  }


  function clearSession() {
    teacherToken =
      null;

    teacherData =
      null;


    sessionStorage.removeItem(
      SESSION_STORAGE_KEY
    );
  }


  /* =========================================================
     LOGIN / DASHBOARD
     ========================================================= */

  function showLogin() {
    if (
      loginSection
    ) {
      loginSection.hidden =
        false;
    }


    if (
      dashboard
    ) {
      dashboard.hidden =
        true;
    }


    passwordInput?.focus();
  }


  function showDashboard() {
    if (
      loginSection
    ) {
      loginSection.hidden =
        true;
    }


    if (
      dashboard
    ) {
      dashboard.hidden =
        false;
    }
  }


  /* =========================================================
     CHARGEMENT DASHBOARD
     ========================================================= */

  async function loadDashboard(
    forceFresh = false
  ) {
    if (
      !teacherToken
    ) {
      showLogin();

      return;
    }


    if (
      studentsLoading
    ) {
      studentsLoading.hidden =
        false;
    }


    try {
      const data =
        forceFresh &&
        config.apiBaseUrl &&
        !config.useMockData

          ? await backendRequest(
              "getTeacherDashboard",
              {
                token:
                  teacherToken
              }
            )

          : await api
              .getTeacherDashboard(
                teacherToken
              );


      dashboardData =
        data ||
        {};


      students =
        Array.isArray(
          data?.students
        )

          ? data.students
              .filter(
                student =>
                  student
                    ?.active !==
                  false
              )

          : [];


      renderDashboardStats(
        data ||
        {}
      );


      renderThreshold(
        data ||
        {}
      );


      renderStudents();

    } catch (error) {
      console.error(
        "Erreur dashboard professeur :",
        error
      );


      clearSession();

      showLogin();


      if (
        loginError
      ) {
        loginError.textContent =
          "La session professeur a expiré. Reconnecte-toi.";
      }

    } finally {
      if (
        studentsLoading
      ) {
        studentsLoading.hidden =
          true;
      }
    }
  }


  /* =========================================================
     COMPTEURS
     ========================================================= */

  function renderDashboardStats(
    data
  ) {
    const stats =
      data?.stats ||
      {};


    const players =
      data?.players ||
      data?.playerStats ||
      {};


    const activeStudents =
      Array.isArray(
        data?.students
      )

        ? data.students
            .filter(
              student =>
                student
                  ?.active !==
                false
            )

        : [];


    const openingsFromStudents =
      activeStudents
        .reduce(
          (
            sum,
            student
          ) => {
            return (
              sum +
              firstNumber(
                student
                  ?.openingsCompleted,

                student
                  ?.openings
                  ?.completed
              )
            );
          },
          0
        );


    const studentCount =
      firstNumber(
        stats.students,
        stats.studentCount,
        stats.studentsCount,
        stats.totalStudents,

        data?.studentCount,
        data?.totalStudents,

        activeStudents.length
      );


    const assignedPlayers =
      firstNumber(
        stats.playersAssigned,
        stats.assignedPlayers,
        stats.playersOwned,
        stats.totalPlayersAssigned,

        data?.playersAssigned,
        data?.assignedPlayers,

        players?.owned
      );


    const availablePlayers =
      firstNumber(
        stats.playersAvailable,
        stats.availablePlayers,
        stats.totalPlayersAvailable,

        data?.playersAvailable,
        data?.availablePlayers,

        players?.available
      );


    const completedOpenings =
      firstNumber(
        stats.openingsCompleted,
        stats.openingsDone,
        stats.openingsPerformed,
        stats.totalOpeningsCompleted,
        stats.openings,

        data?.openingsCompleted,

        openingsFromStudents
      );


    if (
      statStudents
    ) {
      statStudents.textContent =
        String(
          studentCount
        );
    }


    if (
      statAssigned
    ) {
      statAssigned.textContent =
        String(
          assignedPlayers
        );
    }


    if (
      statAvailable
    ) {
      statAvailable.textContent =
        String(
          availablePlayers
        );
    }


    if (
      statOpenings
    ) {
      statOpenings.textContent =
        String(
          completedOpenings
        );
    }
  }


  /* =========================================================
     SEUIL
     ========================================================= */

  function renderThreshold(
    data
  ) {
    if (
      thresholdInput
    ) {
      thresholdInput.value =
        safeNumber(
          data
            ?.config
            ?.meritsPerOpening,
          10
        );
    }
  }


  /* =========================================================
     ZONE RÉGLAGES GLOBAUX
     ========================================================= */

  function installGlobalSettings() {
    if (
      !thresholdForm ||
      $(
        "teacher-global-settings"
      )
    ) {
      return;
    }


    if (
      !$(
        "teacher-global-settings-style"
      )
    ) {
      const style =
        document.createElement(
          "style"
        );


      style.id =
        "teacher-global-settings-style";


      style.textContent = `
        #teacher-global-settings {
          margin-top: 18px;
          padding: 24px 26px;
          border: 1px solid rgba(148,163,184,.28);
          border-radius: 22px;
          background: rgba(255,255,255,.82);
          box-shadow: 0 14px 40px rgba(15,40,30,.06);
        }

        #teacher-global-settings .kicker {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #256d50;
        }

        #teacher-global-settings h3 {
          margin: 0;
          font-size: clamp(24px,3vw,34px);
          line-height: 1.05;
          color: #10291f;
        }

        #teacher-global-settings .intro {
          margin: 10px 0 0;
          max-width: 760px;
          font-size: 13px;
          line-height: 1.6;
          color: #627068;
        }

        #teacher-global-settings .grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 14px;
          margin-top: 20px;
        }

        #teacher-global-settings .danger-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-height: 170px;
          padding: 20px;
          border: 1px solid #f0d0d0;
          border-radius: 18px;
          background: #fffafa;
        }

        #teacher-global-settings .danger-card strong {
          font-size: 17px;
          color: #351717;
        }

        #teacher-global-settings .danger-card p {
          flex: 1;
          margin: 8px 0 18px;
          font-size: 12px;
          line-height: 1.55;
          color: #796262;
        }

        #teacher-global-settings .danger-button {
          min-height: 44px;
          padding: 0 16px;
          border: 1px solid #efb4b4;
          border-radius: 12px;
          background: #fff;
          color: #a51f1f;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        #teacher-global-settings .danger-button:hover:not(:disabled) {
          background: #fff2f2;
        }

        #teacher-global-settings .danger-button:disabled {
          opacity: .55;
          cursor: wait;
        }

        @media(max-width:720px) {
          #teacher-global-settings .grid {
            grid-template-columns: 1fr;
          }
        }
      `;


      document.head
        .appendChild(
          style
        );
    }


    const panel =
      document.createElement(
        "section"
      );


    panel.id =
      "teacher-global-settings";


    panel.innerHTML = `
      <p class="kicker">
        Actions globales
      </p>

      <h3>
        Réinitialisations
      </h3>

      <p class="intro">
        Ces actions modifient toute la classe.
        Une confirmation est demandée avant chaque opération.
      </p>

      <div class="grid">

        <article class="danger-card">

          <strong>
            Remettre les mérites à 0
          </strong>

          <p>
            Tous les élèves repassent à 0 mérite.
            Les openings déjà effectués restent enregistrés.
          </p>

          <button
            id="teacher-reset-all-merits"
            class="danger-button"
            type="button"
          >
            Remettre tous les mérites à 0
          </button>

        </article>


        <article class="danger-card">

          <strong>
            Libérer tous les joueurs
          </strong>

          <p>
            Toutes les cartes redeviennent disponibles.
            Les mérites et les openings effectués ne sont pas modifiés.
          </p>

          <button
            id="teacher-release-all-players"
            class="danger-button"
            type="button"
          >
            Libérer tous les joueurs
          </button>

        </article>

      </div>
    `;


    (
      thresholdForm.parentElement ||
      thresholdForm
    )
      .insertAdjacentElement(
        "afterend",
        panel
      );


    $(
      "teacher-reset-all-merits"
    )
      ?.addEventListener(
        "click",
        event =>
          resetAllMerits(
            event.currentTarget
          )
      );


    $(
      "teacher-release-all-players"
    )
      ?.addEventListener(
        "click",
        event =>
          releaseAllPlayers(
            event.currentTarget
          )
      );
  }


  /* =========================================================
     RESET MÉRITES
     ========================================================= */

  async function resetAllMerits(
    button
  ) {
    if (
      !teacherToken ||
      globalActionRunning
    ) {
      return;
    }


    const confirmed =
      confirm(
        "Remettre TOUS les mérites à 0 ?\n\n" +
        "Les openings déjà effectués ne seront pas modifiés.\n" +
        "Cette action s'applique à toute la classe."
      );


    if (
      !confirmed
    ) {
      return;
    }


    globalActionRunning =
      true;


    setButtonLoading(
      button,
      true,
      "Remise à 0..."
    );


    try {
      const result =
        await backendRequest(
          "resetAllMerits",
          {
            token:
              teacherToken
          },
          "POST"
        );


      clearApiCache();


      await loadDashboard(
        true
      );


      const count =
        safeNumber(
          result
            ?.updatedStudents
        );


      showToast(
        count

          ? `${count} élève${
              count > 1
                ? "s"
                : ""
            } remis à 0 mérite`

          : "Tous les mérites sont à 0"
      );

    } catch (error) {
      console.error(
        "Erreur remise à zéro des mérites :",
        error
      );


      showToast(
        error?.message ||
        "Impossible de remettre les mérites à 0."
      );

    } finally {
      globalActionRunning =
        false;


      setButtonLoading(
        button,
        false
      );
    }
  }


  /* =========================================================
     LIBÉRER TOUS LES JOUEURS
     ========================================================= */

  async function releaseAllPlayers(
    button
  ) {
    if (
      !teacherToken ||
      globalActionRunning
    ) {
      return;
    }


    const confirmed =
      confirm(
        "Libérer TOUS les joueurs ?\n\n" +
        "Toutes les collections seront vidées et les joueurs redeviendront disponibles.\n" +
        "Les mérites et les openings effectués ne seront pas modifiés."
      );


    if (
      !confirmed
    ) {
      return;
    }


    globalActionRunning =
      true;


    setButtonLoading(
      button,
      true,
      "Libération..."
    );


    try {
      const result =
        await backendRequest(
          "releaseAllPlayers",
          {
            token:
              teacherToken
          },
          "POST"
        );


      clearApiCache();


      await loadDashboard(
        true
      );


      const count =
        safeNumber(
          result
            ?.releasedPlayers
        );


      showToast(
        count

          ? `${count} joueur${
              count > 1
                ? "s"
                : ""
            } libéré${
              count > 1
                ? "s"
                : ""
            }`

          : "Tous les joueurs étaient déjà libres"
      );

    } catch (error) {
      console.error(
        "Erreur libération des joueurs :",
        error
      );


      showToast(
        error?.message ||
        "Impossible de libérer les joueurs."
      );

    } finally {
      globalActionRunning =
        false;


      setButtonLoading(
        button,
        false
      );
    }
  }


  /* =========================================================
     LIGNE ÉLÈVE
     ========================================================= */

  function createStudentRow(
    student
  ) {
    const openings =
      student.openings ||
      {};


    const available =
      safeNumber(
        openings.available
      );


    const earned =
      safeNumber(
        openings.earned
      );


    const completed =
      safeNumber(
        openings.completed ??
        student.openingsCompleted
      );


    const merits =
      safeNumber(
        student.merits
      );


    const collectionCount =
      safeNumber(
        student.collectionCount
      );


    const row =
      document.createElement(
        "article"
      );


    row.className =
      "teacher-student-row";


    row.dataset.studentId =
      student.id;


    const statusClass =
      available > 0

        ? "has-opening"

        : "";


    const openingButtonClass =
      available > 0

        ? "button-primary"

        : "button-secondary";


    row.innerHTML = `
      <div class="teacher-student-main">

        <div class="teacher-student-avatar">
          ${escapeHtml(
            getInitials(
              student.name
            )
          )}
        </div>

        <div class="teacher-student-name">

          <strong>
            ${escapeHtml(
              student.name
            )}
          </strong>

          <span>
            ${collectionCount}
            joueur${
              collectionCount > 1
                ? "s"
                : ""
            }
            dans la collection
          </span>

        </div>

      </div>


      <div class="teacher-merits-field">

        <input
          class="teacher-merits-input"
          type="number"
          min="0"
          step="1"
          value="${merits}"
          aria-label="Mérites de ${escapeHtml(student.name)}"
        >

        <button
          class="button button-secondary teacher-save-merits"
          type="button"
          data-action="save-merits"
          title="Enregistrer les mérites"
        >
          ✓
        </button>

      </div>


      <div class="teacher-opening-status ${statusClass}">

        <strong>
          ${
            available > 0

              ? `${available} opening${
                  available > 1
                    ? "s"
                    : ""
                } disponible${
                  available > 1
                    ? "s"
                    : ""
                }`

              : "Aucun opening disponible"
          }
        </strong>

        <span>
          ${completed} effectué${
            completed > 1
              ? "s"
              : ""
          }
          ·
          ${earned} gagné${
            earned > 1
              ? "s"
              : ""
          }
        </span>

      </div>


      <div class="teacher-student-actions">

        <button
          class="button ${openingButtonClass} teacher-open-button"
          type="button"
          data-action="opening"
          ${
            available < 1
              ? "disabled"
              : ""
          }
        >
          🎁 Ouvrir
        </button>


        <a
          class="button button-secondary teacher-view-button"
          href="${escapeHtml(
            (
              config.routes
                ?.student ||
              "eleve.html"
            ) +
            "?id=" +
            encodeURIComponent(
              student.id
            )
          )}"
          target="_blank"
          rel="noopener"
          title="Voir la vitrine"
          aria-label="Voir la vitrine de ${escapeHtml(student.name)}"
        >
          👁
        </a>


        <button
          class="button button-secondary teacher-archive-button"
          type="button"
          data-action="archive"
          title="Archiver l'élève"
          aria-label="Archiver ${escapeHtml(student.name)}"
        >
          ×
        </button>

      </div>
    `;


    row
      .querySelector(
        ".teacher-merits-input"
      )
      ?.addEventListener(
        "keydown",
        event => {
          if (
            event.key ===
            "Enter"
          ) {
            event.preventDefault();


            saveStudentMerits(
              student.id,
              row
            );
          }
        }
      );


    return row;
  }


  /* =========================================================
     AFFICHAGE ÉLÈVES
     ========================================================= */

  function renderStudents() {
    if (
      !studentsList
    ) {
      return;
    }


    const query =
      normalizeText(
        studentSearch
          ?.value
      );


    const filtered =
      students.filter(
        student =>
          !query ||
          normalizeText(
            student.name
          )
            .includes(
              query
            )
      );


    studentsList.innerHTML =
      "";


    if (
      !filtered.length
    ) {
      if (
        studentsEmpty
      ) {
        studentsEmpty.hidden =
          false;
      }

      return;
    }


    if (
      studentsEmpty
    ) {
      studentsEmpty.hidden =
        true;
    }


    const fragment =
      document
        .createDocumentFragment();


    filtered.forEach(
      student => {
        fragment.appendChild(
          createStudentRow(
            student
          )
        );
      }
    );


    studentsList.appendChild(
      fragment
    );
  }


  /* =========================================================
     MÉRITES D'UN ÉLÈVE
     ========================================================= */

  async function saveStudentMerits(
    studentId,
    row
  ) {
    if (
      !teacherToken
    ) {
      return;
    }


    const input =
      row.querySelector(
        ".teacher-merits-input"
      );


    const button =
      row.querySelector(
        '[data-action="save-merits"]'
      );


    if (
      !input
    ) {
      return;
    }


    const merits =
      Math.max(
        0,
        Math.floor(
          safeNumber(
            input.value
          )
        )
      );


    input.value =
      merits;


    const currentStudent =
      students.find(
        student =>
          student.id ===
          studentId
      );


    setButtonLoading(
      button,
      true,
      "…"
    );


    try {
      await api
        .updateStudentMerits(
          teacherToken,
          studentId,
          merits
        );


      if (
        currentStudent
      ) {
        currentStudent.merits =
          merits;
      }


      showToast(
        `${
          currentStudent
            ?.name ||
          "Élève"
        } : ${merits} mérites`
      );


      clearApiCache();


      await loadDashboard(
        true
      );

    } catch (error) {
      console.error(
        "Erreur mise à jour mérites :",
        error
      );


      showToast(
        error?.message ||
        "Impossible d'enregistrer les mérites."
      );

    } finally {
      setButtonLoading(
        button,
        false
      );
    }
  }


  /* =========================================================
     AJOUT ÉLÈVE
     ========================================================= */

  function openAddStudentModal() {
    if (
      !addStudentModal
    ) {
      return;
    }


    if (
      addStudentError
    ) {
      addStudentError.textContent =
        "";
    }


    if (
      newStudentName
    ) {
      newStudentName.value =
        "";
    }


    addStudentModal.hidden =
      false;


    document.body
      .style
      .overflow =
      "hidden";


    setTimeout(
      () =>
        newStudentName
          ?.focus(),
      30
    );
  }


  function closeAddStudentModal() {
    if (
      !addStudentModal
    ) {
      return;
    }


    addStudentModal.hidden =
      true;


    document.body
      .style
      .overflow =
      "";
  }


  /* =========================================================
     ARCHIVER ÉLÈVE
     ========================================================= */

  async function archiveStudent(
    studentId
  ) {
    const student =
      students.find(
        item =>
          item.id ===
          studentId
      );


    if (
      !student
    ) {
      return;
    }


    if (
      !confirm(
        `Archiver ${student.name} ?\n\nSa vitrine ne sera plus visible dans la recherche, mais son historique sera conservé.`
      )
    ) {
      return;
    }


    try {
      await api
        .archiveStudent(
          teacherToken,
          studentId
        );


      students =
        students.filter(
          item =>
            item.id !==
            studentId
        );


      renderStudents();


      showToast(
        `${student.name} a été archivé`
      );

    } catch (error) {
      console.error(
        "Erreur archivage élève :",
        error
      );


      showToast(
        error?.message ||
        "Impossible d'archiver cet élève."
      );
    }
  }


  /* =========================================================
     OPENING
     ========================================================= */

  async function prepareOpening(
    studentId
  ) {
    if (
      !teacherToken
    ) {
      return;
    }


    const student =
      students.find(
        item =>
          item.id ===
          studentId
      );


    if (
      !student
    ) {
      return;
    }


    try {
      const context =
        await api
          .getOpeningContext(
            teacherToken,
            studentId,
            openingPackType
          );


      if (
        safeNumber(
          context
            .openings
            ?.available
        ) < 1
      ) {
        showToast(
          "Cet élève n'a plus d'opening disponible."
        );


        clearApiCache();


        await loadDashboard(
          true
        );


        return;
      }


      openingStudentId =
        studentId;


      openingPackType =
        context.packType ||
        context.pack?.id ||
        config.defaultPackType ||
        "standard";


      if (
        openingText
      ) {
        const available =
          safeNumber(
            context
              .openings
              ?.available
          );


        openingText.textContent =
          `${student.name} possède ${available} opening${
            available > 1
              ? "s"
              : ""
          } disponible${
            available > 1
              ? "s"
              : ""
          }. Le joueur tiré sera ajouté définitivement à sa collection.`;
      }


      openOpeningModal();

    } catch (error) {
      console.error(
        "Erreur préparation opening :",
        error
      );


      showToast(
        error?.message ||
        "Impossible de préparer l'opening."
      );
    }
  }


  function openOpeningModal() {
    if (
      !openingModal
    ) {
      return;
    }


    openingModal.hidden =
      false;


    document.body
      .style
      .overflow =
      "hidden";


    setTimeout(
      () =>
        openingStart
          ?.focus(),
      30
    );
  }


  function closeOpeningModal() {
    if (
      !openingModal
    ) {
      return;
    }


    openingModal.hidden =
      true;


    document.body
      .style
      .overflow =
      "";


    openingStudentId =
      null;
  }


  /* =========================================================
     EVENTS — LOGIN
     ========================================================= */

  loginForm
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();


        if (
          !passwordInput
        ) {
          return;
        }


        const password =
          passwordInput.value;


        if (
          !password
        ) {
          if (
            loginError
          ) {
            loginError.textContent =
              "Entre le mot de passe.";
          }

          return;
        }


        if (
          loginError
        ) {
          loginError.textContent =
            "";
        }


        setButtonLoading(
          loginButton,
          true,
          "Connexion..."
        );


        try {
          const result =
            await api
              .teacherLogin(
                password
              );


          saveSession(
            result.token,
            result.teacher
          );


          passwordInput.value =
            "";


          showDashboard();


          await loadDashboard(
            true
          );

        } catch (error) {
          console.error(
            "Erreur connexion professeur :",
            error
          );


          if (
            loginError
          ) {
            loginError.textContent =
              error?.message ||
              "Connexion impossible.";
          }

        } finally {
          setButtonLoading(
            loginButton,
            false
          );
        }
      }
    );


  passwordToggle
    ?.addEventListener(
      "click",
      () => {
        if (
          !passwordInput
        ) {
          return;
        }


        const hidden =
          passwordInput.type ===
          "password";


        passwordInput.type =
          hidden
            ? "text"
            : "password";


        passwordToggle
          .setAttribute(
            "aria-label",
            hidden
              ? "Masquer le mot de passe"
              : "Afficher le mot de passe"
          );
      }
    );


  logoutButton
    ?.addEventListener(
      "click",
      () => {
        clearSession();


        dashboardData =
          null;


        students =
          [];


        if (
          studentsList
        ) {
          studentsList.innerHTML =
            "";
        }


        showLogin();


        showToast(
          "Déconnexion effectuée"
        );
      }
    );


  /* =========================================================
     EVENT — SEUIL
     ========================================================= */

  thresholdForm
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();


        if (
          !teacherToken ||
          !thresholdInput
        ) {
          return;
        }


        const value =
          Math.floor(
            safeNumber(
              thresholdInput
                .value
            )
          );


        if (
          value < 1
        ) {
          showToast(
            "Le seuil doit être supérieur à 0."
          );

          return;
        }


        const button =
          thresholdForm
            .querySelector(
              'button[type="submit"]'
            );


        setButtonLoading(
          button,
          true,
          "Enregistrement..."
        );


        try {
          await api
            .updateMeritsPerOpening(
              teacherToken,
              value
            );


          showToast(
            `Palier modifié : ${value} mérites par opening`
          );


          clearApiCache();


          await loadDashboard(
            true
          );

        } catch (error) {
          console.error(
            "Erreur modification palier :",
            error
          );


          showToast(
            error?.message ||
            "Impossible de modifier le palier."
          );

        } finally {
          setButtonLoading(
            button,
            false
          );
        }
      }
    );


  /* =========================================================
     EVENTS — ÉLÈVES
     ========================================================= */

  studentSearch
    ?.addEventListener(
      "input",
      renderStudents
    );


  studentsList
    ?.addEventListener(
      "click",
      event => {
        const button =
          event.target
            .closest(
              "[data-action]"
            );


        if (
          !button
        ) {
          return;
        }


        const row =
          button.closest(
            ".teacher-student-row"
          );


        const studentId =
          row
            ?.dataset
            .studentId;


        if (
          !studentId
        ) {
          return;
        }


        if (
          button
            .dataset
            .action ===
          "save-merits"
        ) {
          saveStudentMerits(
            studentId,
            row
          );
        }


        if (
          button
            .dataset
            .action ===
          "opening"
        ) {
          prepareOpening(
            studentId
          );
        }


        if (
          button
            .dataset
            .action ===
          "archive"
        ) {
          archiveStudent(
            studentId
          );
        }
      }
    );


  /* =========================================================
     EVENTS — AJOUT ÉLÈVE
     ========================================================= */

  addStudentButton
    ?.addEventListener(
      "click",
      openAddStudentModal
    );


  addStudentBackdrop
    ?.addEventListener(
      "click",
      closeAddStudentModal
    );


  addStudentClose
    ?.addEventListener(
      "click",
      closeAddStudentModal
    );


  addStudentForm
    ?.addEventListener(
      "submit",
      async event => {
        event.preventDefault();


        if (
          !teacherToken ||
          !newStudentName
        ) {
          return;
        }


        const name =
          newStudentName
            .value
            .trim();


        if (
          !name
        ) {
          if (
            addStudentError
          ) {
            addStudentError.textContent =
              "Entre le nom de l'élève.";
          }

          return;
        }


        const button =
          addStudentForm
            .querySelector(
              'button[type="submit"]'
            );


        setButtonLoading(
          button,
          true,
          "Ajout..."
        );


        try {
          const student =
            await api
              .createStudent(
                teacherToken,
                name
              );


          closeAddStudentModal();


          showToast(
            `${student.name} ajouté à la classe`
          );


          clearApiCache();


          await loadDashboard(
            true
          );

        } catch (error) {
          console.error(
            "Erreur ajout élève :",
            error
          );


          if (
            addStudentError
          ) {
            addStudentError.textContent =
              error?.message ||
              "Impossible d'ajouter cet élève.";
          }

        } finally {
          setButtonLoading(
            button,
            false
          );
        }
      }
    );


  /* =========================================================
     EVENTS — OPENING
     ========================================================= */

  openingBackdrop
    ?.addEventListener(
      "click",
      closeOpeningModal
    );


  openingClose
    ?.addEventListener(
      "click",
      closeOpeningModal
    );


  openingCancel
    ?.addEventListener(
      "click",
      closeOpeningModal
    );


  openingStart
    ?.addEventListener(
      "click",
      () => {
        if (
          !openingStudentId ||
          !teacherToken
        ) {
          return;
        }


        const url =
          new URL(
            config.routes
              ?.opening ||
            "opening.html",

            window.location.href
          );


        url.searchParams
          .set(
            "studentId",
            openingStudentId
          );


        url.searchParams
          .set(
            "pack",
            openingPackType
          );


        window.location.href =
          url.toString();
      }
    );


  /* =========================================================
     EVENT — ACTUALISER
     ========================================================= */

  refreshButton
    ?.addEventListener(
      "click",
      async () => {
        setButtonLoading(
          refreshButton,
          true,
          "Actualisation..."
        );


        try {
          clearApiCache();


          await loadDashboard(
            true
          );


          showToast(
            "Données actualisées"
          );

        } finally {
          setButtonLoading(
            refreshButton,
            false
          );
        }
      }
    );


  /* =========================================================
     ÉCHAP
     ========================================================= */

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key !==
        "Escape"
      ) {
        return;
      }


      if (
        addStudentModal &&
        !addStudentModal
          .hidden
      ) {
        closeAddStudentModal();

        return;
      }


      if (
        openingModal &&
        !openingModal
          .hidden
      ) {
        closeOpeningModal();
      }
    }
  );


  /* =========================================================
     INIT
     ========================================================= */

  async function init() {
    installGlobalSettings();


    if (
      !loadSession()
    ) {
      showLogin();

      return;
    }


    showDashboard();


    await loadDashboard(
      true
    );
  }


  init();

})();
