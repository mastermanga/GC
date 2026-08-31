/* =========================================================
   FC CLASSE — PROF.JS
   Logique de l'espace professeur
   ========================================================= */

(() => {
  const config = window.FC_CONFIG;
  const api = window.FC_API;

  if (!config || !api) {
    console.error(
      "FC Classe : config.js ou api.js n'est pas chargé."
    );

    return;
  }


  /* =======================================================
     CONSTANTES
     ======================================================= */

  const SESSION_STORAGE_KEY =
    "fcClasse_teacherSession_v1";


  /* =======================================================
     ÉLÉMENTS DOM — CONNEXION
     ======================================================= */

  const loginSection =
    document.getElementById(
      "teacher-login-section"
    );

  const loginForm =
    document.getElementById(
      "teacher-login-form"
    );

  const passwordInput =
    document.getElementById(
      "teacher-password"
    );

  const passwordToggle =
    document.getElementById(
      "toggle-teacher-password"
    );

  const loginButton =
    document.getElementById(
      "teacher-login-button"
    );

  const loginError =
    document.getElementById(
      "teacher-login-error"
    );


  /* =======================================================
     ÉLÉMENTS DOM — DASHBOARD
     ======================================================= */

  const dashboard =
    document.getElementById(
      "teacher-dashboard"
    );

  const refreshButton =
    document.getElementById(
      "teacher-refresh"
    );

  const logoutButton =
    document.getElementById(
      "teacher-logout"
    );


  /* =======================================================
     STATS
     ======================================================= */

  const statStudents =
    document.getElementById(
      "teacher-stat-students"
    );

  const statAssigned =
    document.getElementById(
      "teacher-stat-assigned"
    );

  const statAvailable =
    document.getElementById(
      "teacher-stat-available"
    );

  const statOpenings =
    document.getElementById(
      "teacher-stat-openings"
    );


  /* =======================================================
     SEUIL
     ======================================================= */

  const thresholdForm =
    document.getElementById(
      "threshold-form"
    );

  const thresholdInput =
    document.getElementById(
      "teacher-threshold"
    );


  /* =======================================================
     ÉLÈVES
     ======================================================= */

  const studentSearch =
    document.getElementById(
      "teacher-student-search"
    );

  const studentsList =
    document.getElementById(
      "teacher-students-list"
    );

  const studentsLoading =
    document.getElementById(
      "teacher-students-loading"
    );

  const studentsEmpty =
    document.getElementById(
      "teacher-students-empty"
    );


  /* =======================================================
     MODALE AJOUT ÉLÈVE
     ======================================================= */

  const addStudentButton =
    document.getElementById(
      "open-add-student"
    );

  const addStudentModal =
    document.getElementById(
      "add-student-modal"
    );

  const addStudentBackdrop =
    document.getElementById(
      "add-student-backdrop"
    );

  const addStudentClose =
    document.getElementById(
      "close-add-student"
    );

  const addStudentForm =
    document.getElementById(
      "add-student-form"
    );

  const newStudentName =
    document.getElementById(
      "new-student-name"
    );

  const addStudentError =
    document.getElementById(
      "add-student-error"
    );


  /* =======================================================
     MODALE OPENING
     ======================================================= */

  const openingModal =
    document.getElementById(
      "opening-confirm-modal"
    );

  const openingBackdrop =
    document.getElementById(
      "opening-confirm-backdrop"
    );

  const openingClose =
    document.getElementById(
      "opening-confirm-close"
    );

  const openingCancel =
    document.getElementById(
      "opening-confirm-cancel"
    );

  const openingStart =
    document.getElementById(
      "opening-confirm-start"
    );

  const openingText =
    document.getElementById(
      "opening-confirm-text"
    );


  /* =======================================================
     TOAST
     ======================================================= */

  const toast =
    document.getElementById(
      "teacher-toast"
    );


  /* =======================================================
     ÉTAT
     ======================================================= */

  let teacherToken = null;

  let teacherData = null;

  let dashboardData = null;

  let students = [];

  let openingStudentId = null;

  let openingPackType =
    config.defaultPackType ||
    "standard";

  let toastTimer = null;


  /* =======================================================
     OUTILS
     ======================================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function safeNumber(
    value,
    fallback = 0
  ) {
    const number =
      Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }


  function getInitials(name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  }


  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim();
  }


  function plural(
    value,
    singular,
    pluralForm
  ) {
    return Number(value) > 1
      ? pluralForm
      : singular;
  }


  function setButtonLoading(
    button,
    loading,
    loadingText = "Chargement..."
  ) {
    if (!button) {
      return;
    }

    if (loading) {
      if (
        !button.dataset.originalText
      ) {
        button.dataset.originalText =
          button.textContent;
      }

      button.disabled = true;
      button.textContent =
        loadingText;

    } else {
      button.disabled = false;

      if (
        button.dataset.originalText
      ) {
        button.textContent =
          button.dataset.originalText;

        delete button.dataset.originalText;
      }
    }
  }


  function showToast(message) {
    if (!toast) {
      return;
    }

    window.clearTimeout(
      toastTimer
    );

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );

    toastTimer =
      window.setTimeout(
        () => {
          toast.classList.remove(
            "show"
          );
        },
        2300
      );
  }


  /* =======================================================
     SESSION PROF
     ======================================================= */

  function saveSession(
    token,
    teacher
  ) {
    teacherToken =
      token;

    teacherData =
      teacher || null;

    const session = {
      token,
      teacher:
        teacher || null
    };

    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(session)
    );
  }


  function loadSession() {
    try {
      const raw =
        sessionStorage.getItem(
          SESSION_STORAGE_KEY
        );

      if (!raw) {
        return null;
      }

      const session =
        JSON.parse(raw);

      if (!session?.token) {
        return null;
      }

      teacherToken =
        session.token;

      teacherData =
        session.teacher || null;

      return session;

    } catch (error) {
      console.warn(
        "Session professeur invalide.",
        error
      );

      clearSession();

      return null;
    }
  }


  function clearSession() {
    teacherToken = null;
    teacherData = null;

    sessionStorage.removeItem(
      SESSION_STORAGE_KEY
    );
  }


  /* =======================================================
     AFFICHAGE LOGIN / DASHBOARD
     ======================================================= */

  function showLogin() {
    if (loginSection) {
      loginSection.hidden = false;
    }

    if (dashboard) {
      dashboard.hidden = true;
    }

    passwordInput?.focus();
  }


  function showDashboard() {
    if (loginSection) {
      loginSection.hidden = true;
    }

    if (dashboard) {
      dashboard.hidden = false;
    }
  }


  /* =======================================================
     LOGIN
     ======================================================= */

  async function handleLogin(event) {
    event.preventDefault();

    if (!passwordInput) {
      return;
    }

    const password =
      passwordInput.value;

    if (!password) {
      loginError.textContent =
        "Entre le mot de passe.";

      return;
    }

    if (loginError) {
      loginError.textContent = "";
    }

    setButtonLoading(
      loginButton,
      true,
      "Connexion..."
    );

    try {
      const result =
        await api.teacherLogin(
          password
        );

      saveSession(
        result.token,
        result.teacher
      );

      passwordInput.value = "";

      showDashboard();

      await loadDashboard();

    } catch (error) {
      console.error(
        "Erreur connexion professeur :",
        error
      );

      if (loginError) {
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


  loginForm?.addEventListener(
    "submit",
    handleLogin
  );


  /* =======================================================
     AFFICHER / MASQUER MOT DE PASSE
     ======================================================= */

  passwordToggle?.addEventListener(
    "click",
    () => {
      if (!passwordInput) {
        return;
      }

      const currentlyHidden =
        passwordInput.type ===
        "password";

      passwordInput.type =
        currentlyHidden
          ? "text"
          : "password";

      passwordToggle.setAttribute(
        "aria-label",
        currentlyHidden
          ? "Masquer le mot de passe"
          : "Afficher le mot de passe"
      );
    }
  );


  /* =======================================================
     DÉCONNEXION
     ======================================================= */

  function logout() {
    clearSession();

    dashboardData = null;
    students = [];

    if (studentsList) {
      studentsList.innerHTML = "";
    }

    showLogin();

    showToast(
      "Déconnexion effectuée"
    );
  }


  logoutButton?.addEventListener(
    "click",
    logout
  );


  /* =======================================================
     DASHBOARD
     ======================================================= */

  async function loadDashboard() {
    if (!teacherToken) {
      showLogin();

      return;
    }

    if (studentsLoading) {
      studentsLoading.hidden =
        false;
    }

    try {
      const data =
        await api.getTeacherDashboard(
          teacherToken
        );

      dashboardData =
        data;

      students =
        Array.isArray(
          data.students
        )
          ? data.students
          : [];

      renderDashboardStats(
        data
      );

      renderThreshold(
        data
      );

      renderStudents();

    } catch (error) {
      console.error(
        "Erreur dashboard professeur :",
        error
      );

      /*
       * Si la session n'est plus valable,
       * on revient automatiquement à la connexion.
       */

      clearSession();

      showLogin();

      if (loginError) {
        loginError.textContent =
          "La session professeur a expiré. Reconnecte-toi.";
      }

    } finally {
      if (studentsLoading) {
        studentsLoading.hidden =
          true;
      }
    }
  }


  /* =======================================================
     STATS
     ======================================================= */

  function renderDashboardStats(data) {
    const stats =
      data?.stats || {};

    if (statStudents) {
      statStudents.textContent =
        safeNumber(
          stats.students
        );
    }

    if (statAssigned) {
      statAssigned.textContent =
        safeNumber(
          stats.assignedPlayers
        );
    }

    if (statAvailable) {
      statAvailable.textContent =
        safeNumber(
          stats.availablePlayers
        );
    }

    if (statOpenings) {
      statOpenings.textContent =
        safeNumber(
          stats.openings
        );
    }
  }


  /* =======================================================
     SEUIL OPENING
     ======================================================= */

  function renderThreshold(data) {
    if (!thresholdInput) {
      return;
    }

    thresholdInput.value =
      safeNumber(
        data?.config
          ?.meritsPerOpening,
        10
      );
  }


  thresholdForm?.addEventListener(
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
            thresholdInput.value
          )
        );

      if (value < 1) {
        showToast(
          "Le seuil doit être supérieur à 0."
        );

        return;
      }

      const submitButton =
        thresholdForm.querySelector(
          'button[type="submit"]'
        );

      setButtonLoading(
        submitButton,
        true,
        "Enregistrement..."
      );

      try {
        await api.updateMeritsPerOpening(
          teacherToken,
          value
        );

        showToast(
          `Palier modifié : ${value} mérites par opening`
        );

        await loadDashboard();

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
          submitButton,
          false
        );
      }
    }
  );


  /* =======================================================
     CRÉATION D'UNE LIGNE ÉLÈVE
     ======================================================= */

  function createStudentRow(student) {
    const openings =
      student.openings || {};

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
        openings.completed
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

    const openingStatusClass =
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
            ${plural(
              collectionCount,
              "joueur",
              "joueurs"
            )}
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


      <div class="teacher-opening-status ${openingStatusClass}">

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
              config.routes?.student ||
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

    /*
     * Entrée dans le champ mérite =
     * sauvegarde immédiate.
     */

    const meritsInput =
      row.querySelector(
        ".teacher-merits-input"
      );

    meritsInput?.addEventListener(
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


  /* =======================================================
     AFFICHAGE DES ÉLÈVES
     ======================================================= */

  function renderStudents() {
    if (!studentsList) {
      return;
    }

    const query =
      normalizeText(
        studentSearch?.value
      );

    const filtered =
      students.filter(
        student => {
          if (!query) {
            return true;
          }

          return normalizeText(
            student.name
          ).includes(
            query
          );
        }
      );

    studentsList.innerHTML = "";

    if (!filtered.length) {
      if (studentsEmpty) {
        studentsEmpty.hidden =
          false;
      }

      return;
    }

    if (studentsEmpty) {
      studentsEmpty.hidden =
        true;
    }

    const fragment =
      document.createDocumentFragment();

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


  studentSearch?.addEventListener(
    "input",
    renderStudents
  );


  /* =======================================================
     SAUVEGARDE MÉRITES
     ======================================================= */

  async function saveStudentMerits(
    studentId,
    row
  ) {
    if (!teacherToken) {
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

    if (!input) {
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

    setButtonLoading(
      button,
      true,
      "…"
    );

    try {
      const updated =
        await api.updateStudentMerits(
          teacherToken,
          studentId,
          merits
        );

      /*
       * Mise à jour locale immédiate.
       */

      const index =
        students.findIndex(
          student =>
            student.id ===
            studentId
        );

      if (index !== -1) {
        students[index] =
          updated;
      }

      showToast(
        `${updated.name} : ${merits} mérites`
      );

      /*
       * On recharge pour actualiser aussi
       * les openings disponibles.
       */

      await loadDashboard();

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


  /* =======================================================
     CLICS DANS LA LISTE
     ======================================================= */

  studentsList?.addEventListener(
    "click",
    event => {
      const actionButton =
        event.target.closest(
          "[data-action]"
        );

      if (!actionButton) {
        return;
      }

      const row =
        actionButton.closest(
          ".teacher-student-row"
        );

      const studentId =
        row?.dataset.studentId;

      if (!studentId) {
        return;
      }

      const action =
        actionButton.dataset.action;

      if (
        action ===
        "save-merits"
      ) {
        saveStudentMerits(
          studentId,
          row
        );

        return;
      }

      if (
        action ===
        "opening"
      ) {
        prepareOpening(
          studentId
        );

        return;
      }

      if (
        action ===
        "archive"
      ) {
        archiveStudent(
          studentId
        );
      }
    }
  );


  /* =======================================================
     AJOUT ÉLÈVE
     ======================================================= */

  function openAddStudentModal() {
    if (!addStudentModal) {
      return;
    }

    if (addStudentError) {
      addStudentError.textContent =
        "";
    }

    if (newStudentName) {
      newStudentName.value =
        "";
    }

    addStudentModal.hidden =
      false;

    document.body.style.overflow =
      "hidden";

    window.setTimeout(
      () => {
        newStudentName?.focus();
      },
      30
    );
  }


  function closeAddStudentModal() {
    if (!addStudentModal) {
      return;
    }

    addStudentModal.hidden =
      true;

    document.body.style.overflow =
      "";
  }


  addStudentButton?.addEventListener(
    "click",
    openAddStudentModal
  );


  addStudentBackdrop?.addEventListener(
    "click",
    closeAddStudentModal
  );


  addStudentClose?.addEventListener(
    "click",
    closeAddStudentModal
  );


  addStudentForm?.addEventListener(
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
        newStudentName.value
          .trim();

      if (!name) {
        if (addStudentError) {
          addStudentError.textContent =
            "Entre le nom de l'élève.";
        }

        return;
      }

      const submitButton =
        addStudentForm.querySelector(
          'button[type="submit"]'
        );

      setButtonLoading(
        submitButton,
        true,
        "Ajout..."
      );

      try {
        const student =
          await api.createStudent(
            teacherToken,
            name
          );

        closeAddStudentModal();

        showToast(
          `${student.name} ajouté à la classe`
        );

        await loadDashboard();

      } catch (error) {
        console.error(
          "Erreur ajout élève :",
          error
        );

        if (addStudentError) {
          addStudentError.textContent =
            error?.message ||
            "Impossible d'ajouter cet élève.";
        }

      } finally {
        setButtonLoading(
          submitButton,
          false
        );
      }
    }
  );


  /* =======================================================
     ARCHIVER ÉLÈVE
     ======================================================= */

  async function archiveStudent(
    studentId
  ) {
    const student =
      students.find(
        item =>
          item.id === studentId
      );

    if (!student) {
      return;
    }

    const confirmed =
      window.confirm(
        `Archiver ${student.name} ?\n\nSa vitrine ne sera plus visible dans la recherche, mais son historique sera conservé.`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.archiveStudent(
        teacherToken,
        studentId
      );

      showToast(
        `${student.name} a été archivé`
      );

      await loadDashboard();

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


  /* =======================================================
     PRÉPARATION OPENING
     ======================================================= */

  async function prepareOpening(
    studentId
  ) {
    if (!teacherToken) {
      return;
    }

    const student =
      students.find(
        item =>
          item.id === studentId
      );

    if (!student) {
      return;
    }

    try {
      const context =
        await api.getOpeningContext(
          teacherToken,
          studentId,
          openingPackType
        );

      if (
        safeNumber(
          context.openings?.available
        ) < 1
      ) {
        showToast(
          "Cet élève n'a plus d'opening disponible."
        );

        await loadDashboard();

        return;
      }

      openingStudentId =
        studentId;

      openingPackType =
        context.pack?.id ||
        config.defaultPackType ||
        "standard";

      if (openingText) {
        const available =
          safeNumber(
            context.openings?.available
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


  /* =======================================================
     MODALE OPENING
     ======================================================= */

  function openOpeningModal() {
    if (!openingModal) {
      return;
    }

    openingModal.hidden =
      false;

    document.body.style.overflow =
      "hidden";

    window.setTimeout(
      () => {
        openingStart?.focus();
      },
      30
    );
  }


  function closeOpeningModal() {
    if (!openingModal) {
      return;
    }

    openingModal.hidden =
      true;

    document.body.style.overflow =
      "";

    openingStudentId =
      null;
  }


  openingBackdrop?.addEventListener(
    "click",
    closeOpeningModal
  );


  openingClose?.addEventListener(
    "click",
    closeOpeningModal
  );


  openingCancel?.addEventListener(
    "click",
    closeOpeningModal
  );


  /* =======================================================
     DÉPART VERS LA PAGE OPENING
     ======================================================= */

  openingStart?.addEventListener(
    "click",
    () => {
      if (
        !openingStudentId ||
        !teacherToken
      ) {
        return;
      }

      /*
       * IMPORTANT :
       *
       * On NE fait PAS encore le tirage ici.
       *
       * On ouvre seulement opening.html.
       *
       * Le vrai tirage sera déclenché par opening.js
       * lorsque le professeur cliquera sur le pack.
       */

      const route =
        config.routes?.opening ||
        "opening.html";

      const url =
        new URL(
          route,
          window.location.href
        );

      url.searchParams.set(
        "studentId",
        openingStudentId
      );

      url.searchParams.set(
        "pack",
        openingPackType
      );

      window.location.href =
        url.toString();
    }
  );


  /* =======================================================
     ACTUALISER
     ======================================================= */

  refreshButton?.addEventListener(
    "click",
    async () => {
      setButtonLoading(
        refreshButton,
        true,
        "Actualisation..."
      );

      try {
        await loadDashboard();

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


  /* =======================================================
     ÉCHAP
     ======================================================= */

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
        !addStudentModal.hidden
      ) {
        closeAddStudentModal();

        return;
      }

      if (
        openingModal &&
        !openingModal.hidden
      ) {
        closeOpeningModal();
      }
    }
  );


  /* =======================================================
     INITIALISATION
     ======================================================= */

  async function init() {
    const session =
      loadSession();

    if (!session) {
      showLogin();

      return;
    }

    showDashboard();

    await loadDashboard();
  }


  init();
})();
