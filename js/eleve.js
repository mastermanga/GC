/* =========================================================
   FC CLASSE — ELEVE.JS
   Affichage de la vitrine publique d'un élève
   ========================================================= */

(() => {
  const config = window.FC_CONFIG;
  const api = window.FC_API;
  const pitch = window.FC_PITCH;

  if (!config || !api || !pitch) {
    console.error(
      "FC Classe : config.js, api.js ou pitch.js n'est pas chargé."
    );

    return;
  }


  /* =======================================================
     ÉLÉMENTS DOM
     ======================================================= */

  const loadingSection =
    document.getElementById(
      "student-loading"
    );

  const errorSection =
    document.getElementById(
      "student-error"
    );

  const errorMessage =
    document.getElementById(
      "student-error-message"
    );

  const studentPage =
    document.getElementById(
      "student-page"
    );

  const studentAvatar =
    document.getElementById(
      "student-avatar"
    );

  const studentName =
    document.getElementById(
      "student-name"
    );

  const studentMerits =
    document.getElementById(
      "student-merits"
    );

  const studentPlayerCount =
    document.getElementById(
      "student-player-count"
    );

  const studentOpeningsAvailable =
    document.getElementById(
      "student-openings-available"
    );

  const studentOpeningProgress =
    document.getElementById(
      "student-opening-progress"
    );

  const studentOpeningsEarned =
    document.getElementById(
      "student-openings-earned"
    );

  const studentOpeningsCompleted =
    document.getElementById(
      "student-openings-completed"
    );

  const studentOpeningsAvailableBottom =
    document.getElementById(
      "student-openings-available-bottom"
    );

  const openingRule =
    document.getElementById(
      "opening-rule"
    );

  const pitchPlayers =
    document.getElementById(
      "pitch-players"
    );

  const pitchEmpty =
    document.getElementById(
      "pitch-empty"
    );

  const pitchDescription =
    document.getElementById(
      "pitch-description"
    );

  const collectionGrid =
    document.getElementById(
      "collection-grid"
    );

  const collectionEmpty =
    document.getElementById(
      "collection-empty"
    );

  const collectionCount =
    document.getElementById(
      "collection-count"
    );


  /* =======================================================
     MODALE JOUEUR
     ======================================================= */

  const playerModal =
    document.getElementById(
      "player-modal"
    );

  const playerModalBackdrop =
    document.getElementById(
      "player-modal-backdrop"
    );

  const playerModalClose =
    document.getElementById(
      "player-modal-close"
    );

  const modalPlayerImage =
    document.getElementById(
      "modal-player-image"
    );

  const modalPlayerRating =
    document.getElementById(
      "modal-player-rating"
    );

  const modalPlayerPosition =
    document.getElementById(
      "modal-player-position"
    );

  const modalPlayerName =
    document.getElementById(
      "modal-player-name"
    );

  const modalPlayerClub =
    document.getElementById(
      "modal-player-club"
    );

  const modalPlayerNationality =
    document.getElementById(
      "modal-player-nationality"
    );

  const modalPlayerDate =
    document.getElementById(
      "modal-player-date"
    );


  /* =======================================================
     ÉTAT
     ======================================================= */

  let currentStudent = null;

  let currentCollection = [];

  let currentModalPlayer = null;


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


  function safeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
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


  function getStudentIdFromUrl() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return params.get("id");
  }


  function formatDate(value) {
    if (!value) {
      return "Non renseigné";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Non renseigné";
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    ).format(date);
  }


  function setPageTitle(name) {
    document.title =
      `${name} — FC Classe`;
  }


  function showLoading() {
    if (loadingSection) {
      loadingSection.hidden = false;
    }

    if (errorSection) {
      errorSection.hidden = true;
    }

    if (studentPage) {
      studentPage.hidden = true;
    }
  }


  function showError(message) {
    if (loadingSection) {
      loadingSection.hidden = true;
    }

    if (studentPage) {
      studentPage.hidden = true;
    }

    if (errorSection) {
      errorSection.hidden = false;
    }

    if (errorMessage) {
      errorMessage.textContent =
        message ||
        "Impossible de charger cette équipe.";
    }
  }


  function showStudentPage() {
    if (loadingSection) {
      loadingSection.hidden = true;
    }

    if (errorSection) {
      errorSection.hidden = true;
    }

    if (studentPage) {
      studentPage.hidden = false;
    }
  }


  /* =======================================================
     FALLBACK IMAGE
     ======================================================= */

  function createPlayerFallback(player) {
    const wrapper =
      document.createElement("div");

    wrapper.className =
      "player-image-fallback";

    wrapper.textContent =
      getInitials(
        player?.name || "FC"
      );

    return wrapper;
  }


  function handleImageError(
    image,
    player
  ) {
    if (!image) {
      return;
    }

    const parent =
      image.parentElement;

    if (!parent) {
      return;
    }

    image.remove();

    parent.appendChild(
      createPlayerFallback(player)
    );
  }


  /* =======================================================
     HEADER / STATS
     ======================================================= */

  function renderStudentHeader(student) {
    const merits =
      safeNumber(student.merits);

    const count =
      safeNumber(student.collectionCount);

    const openings =
      student.openings || {};

    const earned =
      safeNumber(openings.earned);

    const completed =
      safeNumber(openings.completed);

    const available =
      safeNumber(openings.available);

    const threshold =
      safeNumber(
        openings.threshold,
        10
      );

    if (studentAvatar) {
      studentAvatar.textContent =
        getInitials(student.name) ||
        "FC";
    }

    if (studentName) {
      studentName.textContent =
        student.name;
    }

    if (studentMerits) {
      studentMerits.textContent =
        merits;
    }

    if (studentPlayerCount) {
      studentPlayerCount.textContent =
        count;
    }

    if (studentOpeningsAvailable) {
      studentOpeningsAvailable.textContent =
        available;
    }

    if (studentOpeningProgress) {
      studentOpeningProgress.textContent =
        `${completed} ${
          plural(
            completed,
            "effectué",
            "effectués"
          )
        }`;
    }

    if (studentOpeningsEarned) {
      studentOpeningsEarned.textContent =
        earned;
    }

    if (studentOpeningsCompleted) {
      studentOpeningsCompleted.textContent =
        completed;
    }

    if (studentOpeningsAvailableBottom) {
      studentOpeningsAvailableBottom.textContent =
        available;
    }

    if (openingRule) {
      openingRule.textContent =
        `Un opening est débloqué tous les ${threshold} mérites. Les mérites restent cumulés.`;
    }

    setPageTitle(
      student.name
    );
  }


  /* =======================================================
     TERRAIN — CRÉATION CARTE
     ======================================================= */

  function createPitchPlayerElement(
    item
  ) {
    const player =
      item.player;

    const element =
      document.createElement(
        "button"
      );

    element.type =
      "button";

    element.className =
      "pitch-player";

    element.dataset.eaId =
      String(
        player.eaId
      );

    element.setAttribute(
      "aria-label",
      `Voir ${player.name}`
    );

    const style =
      pitch.getPitchPositionStyle(
        item
      );

    element.style.left =
      style.left;

    element.style.top =
      style.top;

    element.innerHTML = `
      <div class="pitch-player-card">

        <span class="pitch-player-rating">
          ${escapeHtml(player.rating)}
        </span>

        <span class="pitch-player-position">
          ${escapeHtml(
            player.position || item.role
          )}
        </span>

        ${
          player.image
            ? `
              <img
                class="pitch-player-image"
                src="${escapeHtml(player.image)}"
                alt=""
                loading="lazy"
              >
            `
            : `
              <div class="pitch-player-image"></div>
            `
        }

        <span class="pitch-player-name">
          ${escapeHtml(player.name)}
        </span>

        <span class="pitch-player-club">
          ${escapeHtml(
            player.club ||
            "Club non renseigné"
          )}
        </span>

      </div>
    `;

    const image =
      element.querySelector(
        ".pitch-player-image"
      );

    if (
      image &&
      image.tagName === "IMG"
    ) {
      image.addEventListener(
        "error",
        () => {
          image.style.opacity = "0";
        }
      );
    }

    element.addEventListener(
      "click",
      () => {
        openPlayerModal(
          player
        );
      }
    );

    return element;
  }


  /* =======================================================
     TERRAIN
     ======================================================= */

  function renderPitch(collection) {
    if (!pitchPlayers) {
      return;
    }

    pitchPlayers.innerHTML = "";

    const prepared =
      pitch.preparePitch(
        collection,
        config.pitchPlayerLimit || 5
      );

    if (pitchDescription) {
      pitchDescription.textContent =
        prepared.description;
    }

    if (!prepared.players.length) {
      if (pitchEmpty) {
        pitchEmpty.hidden = false;
      }

      return;
    }

    if (pitchEmpty) {
      pitchEmpty.hidden = true;
    }

    const fragment =
      document.createDocumentFragment();

    prepared.layout.forEach(
      item => {
        fragment.appendChild(
          createPitchPlayerElement(
            item
          )
        );
      }
    );

    pitchPlayers.appendChild(
      fragment
    );
  }


  /* =======================================================
     COLLECTION — CARTE JOUEUR
     ======================================================= */

  function createCollectionCard(player) {
    const card =
      document.createElement(
        "button"
      );

    card.type =
      "button";

    card.className =
      "collection-player-card";

    card.dataset.eaId =
      String(player.eaId);

    card.setAttribute(
      "aria-label",
      `Voir la fiche de ${player.name}`
    );

    card.innerHTML = `
      <div class="collection-player-top">

        <strong class="collection-player-rating">
          ${escapeHtml(player.rating)}
        </strong>

        <span class="badge badge-dark collection-player-position">
          ${escapeHtml(
            player.position ||
            pitch.normalizeRole(player)
          )}
        </span>

      </div>

      <div class="collection-player-image-wrap">

        ${
          player.image
            ? `
              <img
                class="collection-player-image"
                src="${escapeHtml(player.image)}"
                alt="${escapeHtml(player.name)}"
                loading="lazy"
              >
            `
            : ""
        }

      </div>

      <h3 class="collection-player-name">
        ${escapeHtml(player.name)}
      </h3>

      <p class="collection-player-club">
        ${escapeHtml(
          player.club ||
          "Club non renseigné"
        )}
      </p>

      <span class="collection-player-date">
        Obtenu le ${escapeHtml(
          formatDate(
            player.obtainedAt
          )
        )}
      </span>
    `;

    const image =
      card.querySelector(
        ".collection-player-image"
      );

    if (image) {
      image.addEventListener(
        "error",
        () => {
          handleImageError(
            image,
            player
          );
        }
      );
    } else {
      const imageWrap =
        card.querySelector(
          ".collection-player-image-wrap"
        );

      imageWrap?.appendChild(
        createPlayerFallback(player)
      );
    }

    card.addEventListener(
      "click",
      () => {
        openPlayerModal(
          player
        );
      }
    );

    return card;
  }


  /* =======================================================
     COLLECTION
     ======================================================= */

  function renderCollection(collection) {
    if (!collectionGrid) {
      return;
    }

    const players =
      Array.isArray(collection)
        ? collection
        : [];

    collectionGrid.innerHTML = "";

    if (collectionCount) {
      collectionCount.textContent =
        `${players.length} ${
          plural(
            players.length,
            "joueur",
            "joueurs"
          )
        }`;
    }

    if (!players.length) {
      if (collectionEmpty) {
        collectionEmpty.hidden = false;
      }

      return;
    }

    if (collectionEmpty) {
      collectionEmpty.hidden = true;
    }

    const fragment =
      document.createDocumentFragment();

    players.forEach(player => {
      fragment.appendChild(
        createCollectionCard(
          player
        )
      );
    });

    collectionGrid.appendChild(
      fragment
    );
  }


  /* =======================================================
     MODALE
     ======================================================= */

  function openPlayerModal(player) {
    if (!playerModal) {
      return;
    }

    currentModalPlayer =
      player;

    if (modalPlayerRating) {
      modalPlayerRating.textContent =
        safeNumber(player.rating);
    }

    if (modalPlayerPosition) {
      modalPlayerPosition.textContent =
        player.position ||
        pitch.normalizeRole(player);
    }

    if (modalPlayerName) {
      modalPlayerName.textContent =
        player.name ||
        "Joueur";
    }

    if (modalPlayerClub) {
      modalPlayerClub.textContent =
        player.club ||
        "Club non renseigné";
    }

    if (modalPlayerNationality) {
      modalPlayerNationality.textContent =
        player.nationality ||
        "Non renseignée";
    }

    if (modalPlayerDate) {
      modalPlayerDate.textContent =
        formatDate(
          player.obtainedAt
        );
    }

    if (modalPlayerImage) {
      modalPlayerImage.src =
        player.image || "";

      modalPlayerImage.alt =
        player.name || "Joueur";

      modalPlayerImage.hidden =
        !player.image;

      modalPlayerImage.onerror =
        () => {
          modalPlayerImage.hidden =
            true;
        };
    }

    playerModal.hidden = false;

    document.body.style.overflow =
      "hidden";

    window.setTimeout(
      () => {
        playerModalClose?.focus();
      },
      30
    );
  }


  function closePlayerModal() {
    if (!playerModal) {
      return;
    }

    playerModal.hidden = true;

    document.body.style.overflow = "";

    currentModalPlayer = null;
  }


  playerModalClose?.addEventListener(
    "click",
    closePlayerModal
  );


  playerModalBackdrop?.addEventListener(
    "click",
    closePlayerModal
  );


  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        playerModal &&
        !playerModal.hidden
      ) {
        closePlayerModal();
      }
    }
  );


  /* =======================================================
     CHARGEMENT ÉLÈVE
     ======================================================= */

  async function loadStudent() {
    const studentId =
      getStudentIdFromUrl();

    if (!studentId) {
      showError(
        "Aucun élève n'a été sélectionné."
      );

      return;
    }

    showLoading();

    try {
      const student =
        await api.getStudent(
          studentId
        );

      currentStudent =
        student;

      currentCollection =
        Array.isArray(
          student.collection
        )
          ? student.collection
          : [];

      renderStudentHeader(
        student
      );

      renderPitch(
        currentCollection
      );

      renderCollection(
        currentCollection
      );

      showStudentPage();

    } catch (error) {
      console.error(
        "Erreur chargement élève :",
        error
      );

      showError(
        error?.message ||
        "Impossible de charger cette équipe."
      );
    }
  }


  /* =======================================================
     INITIALISATION
     ======================================================= */

  loadStudent();
})();
