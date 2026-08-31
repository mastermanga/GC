/* =========================================================
   FC CLASSE — HOME.JS
   Logique de la page d'accueil publique
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
     ÉLÉMENTS DOM
     ======================================================= */

  const searchInput =
    document.getElementById(
      "student-search-input"
    );

  const searchClear =
    document.getElementById(
      "student-search-clear"
    );

  const searchResults =
    document.getElementById(
      "student-search-results"
    );

  const searchStatus =
    document.getElementById(
      "student-search-status"
    );

  const showAllButton =
    document.getElementById(
      "show-all-students"
    );

  const hideAllButton =
    document.getElementById(
      "hide-all-students"
    );

  const classShowcase =
    document.getElementById(
      "class-showcase"
    );

  const studentGrid =
    document.getElementById(
      "student-grid"
    );


  /* =======================================================
     ÉTAT
     ======================================================= */

  let searchTimer = null;

  let currentResults = [];

  let activeResultIndex = -1;

  let allStudentsLoaded = false;


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


  function plural(
    value,
    singular,
    pluralForm
  ) {
    return Number(value) > 1
      ? pluralForm
      : singular;
  }


  function getStudentUrl(studentId) {
    const route =
      config.routes?.student ||
      "eleve.html";

    return (
      route +
      "?id=" +
      encodeURIComponent(studentId)
    );
  }


  function openStudent(studentId) {
    window.location.href =
      getStudentUrl(studentId);
  }


  function setSearchStatus(message = "") {
    if (!searchStatus) {
      return;
    }

    searchStatus.textContent =
      message;
  }


  function setSearchExpanded(value) {
    searchInput?.setAttribute(
      "aria-expanded",
      value ? "true" : "false"
    );
  }


  function closeSearchResults() {
    currentResults = [];

    activeResultIndex = -1;

    if (searchResults) {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
    }

    setSearchExpanded(false);
  }


  function updateClearButton() {
    if (!searchClear || !searchInput) {
      return;
    }

    searchClear.hidden =
      searchInput.value.length === 0;
  }


  /* =======================================================
     STATS ÉLÈVE
     ======================================================= */

  function buildStudentStats(student) {
    const merits =
      Number(student.merits) || 0;

    const collectionCount =
      Number(student.collectionCount) || 0;

    const openings =
      student.openings || {};

    const available =
      Number(openings.available) || 0;

    return {
      merits,
      collectionCount,
      available
    };
  }


  /* =======================================================
     RÉSULTATS DE RECHERCHE
     ======================================================= */

  function renderSearchResults(students) {
    if (!searchResults) {
      return;
    }

    currentResults =
      Array.isArray(students)
        ? students
        : [];

    activeResultIndex = -1;

    if (!currentResults.length) {
      searchResults.innerHTML = `
        <div class="empty-state">
          Aucun élève trouvé.
        </div>
      `;

      searchResults.hidden = false;

      setSearchExpanded(true);

      return;
    }

    searchResults.innerHTML =
      currentResults
        .map((student, index) => {
          const stats =
            buildStudentStats(student);

          const openingsText =
            stats.available > 0
              ? `${stats.available} opening${stats.available > 1 ? "s" : ""} dispo`
              : "Aucun opening dispo";

          return `
            <button
              class="search-result-item"
              type="button"
              role="option"
              data-result-index="${index}"
              data-student-id="${escapeHtml(student.id)}"
              aria-selected="false"
            >
              <span class="search-result-avatar">
                ${escapeHtml(
                  getInitials(student.name)
                )}
              </span>

              <span class="search-result-main">
                <span class="search-result-name">
                  ${escapeHtml(student.name)}
                </span>

                <span class="search-result-meta">
                  ${stats.collectionCount}
                  ${plural(
                    stats.collectionCount,
                    "joueur",
                    "joueurs"
                  )}
                  ·
                  ${stats.merits}
                  ${plural(
                    stats.merits,
                    "mérite",
                    "mérites"
                  )}
                  ·
                  ${escapeHtml(openingsText)}
                </span>
              </span>

              <span
                class="search-result-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </button>
          `;
        })
        .join("");

    searchResults.hidden = false;

    setSearchExpanded(true);
  }


  function updateActiveResult() {
    if (!searchResults) {
      return;
    }

    const items =
      searchResults.querySelectorAll(
        ".search-result-item"
      );

    items.forEach(
      (item, index) => {
        const active =
          index === activeResultIndex;

        item.classList.toggle(
          "is-active",
          active
        );

        item.setAttribute(
          "aria-selected",
          active
            ? "true"
            : "false"
        );

        if (active) {
          item.scrollIntoView({
            block: "nearest"
          });
        }
      }
    );
  }


  async function performSearch(query) {
    const cleanQuery =
      String(query || "").trim();

    const minimumLength =
      config.minimumSearchLength || 2;

    if (
      cleanQuery.length <
      minimumLength
    ) {
      closeSearchResults();

      if (cleanQuery.length > 0) {
        setSearchStatus(
          `Tape au moins ${minimumLength} caractères.`
        );
      } else {
        setSearchStatus("");
      }

      return;
    }

    setSearchStatus(
      "Recherche..."
    );

    try {
      const students =
        await api.searchStudents(
          cleanQuery
        );

      /*
       * Si l'utilisateur a modifié sa recherche
       * pendant la requête, on ignore l'ancien résultat.
       */

      if (
        searchInput &&
        searchInput.value.trim() !==
          cleanQuery
      ) {
        return;
      }

      renderSearchResults(
        students
      );

      if (!students.length) {
        setSearchStatus(
          "Aucun élève trouvé avec ce nom."
        );

        return;
      }

      setSearchStatus(
        `${students.length} résultat${
          students.length > 1 ? "s" : ""
        }`
      );

    } catch (error) {
      console.error(
        "Erreur recherche élèves :",
        error
      );

      closeSearchResults();

      setSearchStatus(
        error?.message ||
        "Impossible d'effectuer la recherche."
      );
    }
  }


  function scheduleSearch() {
    if (!searchInput) {
      return;
    }

    updateClearButton();

    clearTimeout(
      searchTimer
    );

    const query =
      searchInput.value;

    searchTimer =
      window.setTimeout(
        () => {
          performSearch(query);
        },
        config.searchDebounceMs || 180
      );
  }


  /* =======================================================
     TOUTES LES ÉQUIPES
     ======================================================= */

  function createStudentCard(student) {
    const stats =
      buildStudentStats(student);

    const card =
      document.createElement("a");

    card.className =
      "student-card";

    card.href =
      getStudentUrl(student.id);

    const openingBadge =
      stats.available > 0
        ? `
          <span class="student-stat">
            🎁 ${stats.available}
            opening${stats.available > 1 ? "s" : ""}
          </span>
        `
        : "";

    card.innerHTML = `
      <div class="student-card-top">
        <div class="student-card-avatar">
          ${escapeHtml(
            getInitials(student.name)
          )}
        </div>

        <div class="student-card-count">
          ${stats.collectionCount}
          ${plural(
            stats.collectionCount,
            "carte",
            "cartes"
          )}
        </div>
      </div>

      <div class="student-card-name">
        ${escapeHtml(student.name)}
      </div>

      <div class="student-card-stats">
        <span class="student-stat">
          ⭐ ${stats.merits}
          ${plural(
            stats.merits,
            "mérite",
            "mérites"
          )}
        </span>

        <span class="student-stat">
          ⚽ ${stats.collectionCount}
          ${plural(
            stats.collectionCount,
            "joueur",
            "joueurs"
          )}
        </span>

        ${openingBadge}
      </div>
    `;

    return card;
  }


  async function loadAllStudents() {
    if (
      allStudentsLoaded &&
      studentGrid?.children.length
    ) {
      return;
    }

    if (!studentGrid) {
      return;
    }

    studentGrid.innerHTML = `
      <div class="loading">
        Chargement des équipes
      </div>
    `;

    try {
      const students =
        await api.getStudents();

      studentGrid.innerHTML = "";

      if (!students.length) {
        studentGrid.innerHTML = `
          <div
            class="empty-state"
            style="grid-column: 1 / -1;"
          >
            Aucune équipe disponible pour le moment.
          </div>
        `;

        allStudentsLoaded = true;

        return;
      }

      const fragment =
        document.createDocumentFragment();

      students.forEach(student => {
        fragment.appendChild(
          createStudentCard(student)
        );
      });

      studentGrid.appendChild(
        fragment
      );

      allStudentsLoaded = true;

    } catch (error) {
      console.error(
        "Erreur chargement équipes :",
        error
      );

      studentGrid.innerHTML = `
        <div
          class="empty-state"
          style="grid-column: 1 / -1;"
        >
          Impossible de charger les équipes.
        </div>
      `;
    }
  }


  async function showAllStudents() {
    if (!classShowcase) {
      return;
    }

    classShowcase.hidden = false;

    await loadAllStudents();

    classShowcase.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }


  function hideAllStudents() {
    if (!classShowcase) {
      return;
    }

    classShowcase.hidden = true;
  }


  /* =======================================================
     ÉVÉNEMENTS RECHERCHE
     ======================================================= */

  searchInput?.addEventListener(
    "input",
    scheduleSearch
  );


  searchInput?.addEventListener(
    "focus",
    () => {
      const query =
        searchInput.value.trim();

      if (
        query.length >=
        (config.minimumSearchLength || 2)
      ) {
        scheduleSearch();
      }
    }
  );


  searchInput?.addEventListener(
    "keydown",
    event => {
      if (
        searchResults?.hidden ||
        !currentResults.length
      ) {
        return;
      }

      if (
        event.key ===
        "ArrowDown"
      ) {
        event.preventDefault();

        activeResultIndex =
          activeResultIndex <
          currentResults.length - 1
            ? activeResultIndex + 1
            : 0;

        updateActiveResult();

        return;
      }

      if (
        event.key ===
        "ArrowUp"
      ) {
        event.preventDefault();

        activeResultIndex =
          activeResultIndex > 0
            ? activeResultIndex - 1
            : currentResults.length - 1;

        updateActiveResult();

        return;
      }

      if (
        event.key ===
        "Enter"
      ) {
        if (
          activeResultIndex >= 0 &&
          currentResults[
            activeResultIndex
          ]
        ) {
          event.preventDefault();

          openStudent(
            currentResults[
              activeResultIndex
            ].id
          );

          return;
        }

        /*
         * Si un seul résultat est visible,
         * Entrée ouvre directement cet élève.
         */

        if (
          currentResults.length === 1
        ) {
          event.preventDefault();

          openStudent(
            currentResults[0].id
          );
        }

        return;
      }

      if (
        event.key ===
        "Escape"
      ) {
        closeSearchResults();

        searchInput.blur();
      }
    }
  );


  searchClear?.addEventListener(
    "click",
    () => {
      if (!searchInput) {
        return;
      }

      searchInput.value = "";

      updateClearButton();

      closeSearchResults();

      setSearchStatus("");

      searchInput.focus();
    }
  );


  searchResults?.addEventListener(
    "click",
    event => {
      const button =
        event.target.closest(
          ".search-result-item"
        );

      if (!button) {
        return;
      }

      const studentId =
        button.dataset.studentId;

      if (!studentId) {
        return;
      }

      openStudent(
        studentId
      );
    }
  );


  /* =======================================================
     ÉVÉNEMENTS VITRINES
     ======================================================= */

  showAllButton?.addEventListener(
    "click",
    showAllStudents
  );


  hideAllButton?.addEventListener(
    "click",
    hideAllStudents
  );


  /* =======================================================
     FERMETURE RÉSULTATS AU CLIC EXTÉRIEUR
     ======================================================= */

  document.addEventListener(
    "click",
    event => {
      const searchContainer =
        document.getElementById(
          "student-search"
        );

      if (
        searchContainer &&
        !searchContainer.contains(
          event.target
        )
      ) {
        closeSearchResults();
      }
    }
  );


  /* =======================================================
     INITIALISATION
     ======================================================= */

  updateClearButton();
})();
