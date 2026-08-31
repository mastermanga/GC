/* =========================================================
   FC CLASSE — OPENING.JS
   Logique de l'ouverture d'un pack
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
     ÉLÉMENTS DOM
     ======================================================= */

  const loadingSection =
    document.getElementById(
      "opening-loading"
    );

  const errorSection =
    document.getElementById(
      "opening-error"
    );

  const errorMessage =
    document.getElementById(
      "opening-error-message"
    );

  const readySection =
    document.getElementById(
      "opening-ready"
    );

  const animationSection =
    document.getElementById(
      "opening-animation"
    );

  const revealSection =
    document.getElementById(
      "opening-reveal"
    );


  /* =======================================================
     HEADER
     ======================================================= */

  const headerStudentName =
    document.getElementById(
      "opening-student-name"
    );


  /* =======================================================
     PACK
     ======================================================= */

  const packButton =
    document.getElementById(
      "pack-button"
    );

  const packTypeLabel =
    document.getElementById(
      "pack-type-label"
    );

  const readyDescription =
    document.getElementById(
      "opening-ready-description"
    );

  const availableCount =
    document.getElementById(
      "opening-available-count"
    );

  const playersLeft =
    document.getElementById(
      "opening-players-left"
    );


  /* =======================================================
     ANIMATION
     ======================================================= */

  const openingFlash =
    document.getElementById(
      "opening-flash"
    );

  const animationRating =
    document.getElementById(
      "animation-rating"
    );

  const animationPosition =
    document.getElementById(
      "animation-position"
    );

  const animationNationality =
    document.getElementById(
      "animation-nationality"
    );

  const animationText =
    document.getElementById(
      "opening-animation-text"
    );


  /* =======================================================
     RÉVÉLATION
     ======================================================= */

  const revealedRating =
    document.getElementById(
      "revealed-player-rating"
    );

  const revealedPosition =
    document.getElementById(
      "revealed-player-position"
    );

  const revealedImage =
    document.getElementById(
      "revealed-player-image"
    );

  const revealedFallback =
    document.getElementById(
      "revealed-player-fallback"
    );

  const revealedName =
    document.getElementById(
      "revealed-player-name"
    );

  const revealedClub =
    document.getElementById(
      "revealed-player-club"
    );

  const revealedNationality =
    document.getElementById(
      "revealed-player-nationality"
    );

  const revealStudentName =
    document.getElementById(
      "reveal-student-name"
    );

  const viewCollectionButton =
    document.getElementById(
      "view-student-collection"
    );

  const openAnotherButton =
    document.getElementById(
      "open-another-pack"
    );

  const backTeacherButton =
    document.getElementById(
      "back-to-teacher"
    );


  /* =======================================================
     ÉTAT
     ======================================================= */

  let teacherToken = null;

  let studentId = null;

  let packType =
    config.defaultPackType ||
    "standard";

  let openingContext = null;

  let openingResult = null;

  let isOpening = false;


  /* =======================================================
     OUTILS
     ======================================================= */

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


  function sleep(milliseconds) {
    return new Promise(resolve => {
      window.setTimeout(
        resolve,
        milliseconds
      );
    });
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


  function prefersReducedMotion() {
    return window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }


  function setDocumentTitle(studentName) {
    document.title =
      `${studentName} — Opening — FC Classe`;
  }


  /* =======================================================
     URL
     ======================================================= */

  function readUrlParameters() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    studentId =
      params.get(
        "studentId"
      );

    packType =
      params.get(
        "pack"
      ) ||
      config.defaultPackType ||
      "standard";
  }


  /* =======================================================
     SESSION PROFESSEUR
     ======================================================= */

  function loadTeacherSession() {
    try {
      const raw =
        sessionStorage.getItem(
          SESSION_STORAGE_KEY
        );

      if (!raw) {
        return false;
      }

      const session =
        JSON.parse(raw);

      if (!session?.token) {
        return false;
      }

      teacherToken =
        session.token;

      return true;

    } catch (error) {
      console.warn(
        "Impossible de lire la session professeur.",
        error
      );

      return false;
    }
  }


  /* =======================================================
     AFFICHAGE DES ÉTATS
     ======================================================= */

  function hideAllStates() {
    if (loadingSection) {
      loadingSection.hidden = true;
    }

    if (errorSection) {
      errorSection.hidden = true;
    }

    if (readySection) {
      readySection.hidden = true;
    }

    if (animationSection) {
      animationSection.hidden = true;
    }

    if (revealSection) {
      revealSection.hidden = true;
    }
  }


  function showLoading() {
    hideAllStates();

    if (loadingSection) {
      loadingSection.hidden = false;
    }
  }


  function showReady() {
    hideAllStates();

    document.body.classList.remove(
      "is-opening"
    );

    if (readySection) {
      readySection.hidden = false;
    }
  }


  function showAnimation() {
    hideAllStates();

    document.body.classList.add(
      "is-opening"
    );

    if (animationSection) {
      animationSection.hidden = false;

      animationSection.classList.add(
        "is-running"
      );
    }
  }


  function showReveal() {
    hideAllStates();

    document.body.classList.remove(
      "is-opening"
    );

    if (animationSection) {
      animationSection.classList.remove(
        "is-running"
      );
    }

    if (revealSection) {
      revealSection.hidden = false;
    }
  }


  function showError(message) {
    hideAllStates();

    document.body.classList.remove(
      "is-opening"
    );

    if (errorSection) {
      errorSection.hidden = false;
    }

    if (errorMessage) {
      errorMessage.textContent =
        message ||
        "Une erreur est survenue.";
    }
  }


  /* =======================================================
     CONTEXTE DE L'OPENING
     ======================================================= */

  function renderOpeningContext(context) {
    const student =
      context.student || {};

    const openings =
      context.openings || {};

    const pack =
      context.pack || {};

    const available =
      safeNumber(
        openings.available
      );

    const remainingPlayers =
      safeNumber(
        context.availablePlayers
      );

    if (headerStudentName) {
      headerStudentName.textContent =
        student.name ||
        "Élève";
    }

    if (packTypeLabel) {
      packTypeLabel.textContent =
        String(
          pack.name ||
          pack.id ||
          packType
        ).toUpperCase();
    }

    if (readyDescription) {
      readyDescription.textContent =
        `${student.name} va découvrir un nouveau joueur unique pour sa collection.`;
    }

    if (availableCount) {
      availableCount.textContent =
        available;
    }

    if (playersLeft) {
      playersLeft.textContent =
        remainingPlayers;
    }

    setDocumentTitle(
      student.name ||
      "Élève"
    );
  }


  async function loadOpeningContext() {
    if (!teacherToken) {
      showError(
        "Connexion professeur requise."
      );

      return;
    }

    if (!studentId) {
      showError(
        "Aucun élève n'a été sélectionné."
      );

      return;
    }

    showLoading();

    try {
      const context =
        await api.getOpeningContext(
          teacherToken,
          studentId,
          packType
        );

      openingContext =
        context;

      const available =
        safeNumber(
          context.openings?.available
        );

      const availablePlayers =
        safeNumber(
          context.availablePlayers
        );

      if (available < 1) {
        showError(
          "Cet élève n'a aucun opening disponible."
        );

        return;
      }

      if (availablePlayers < 1) {
        showError(
          "Il n'y a plus aucun joueur disponible dans la classe."
        );

        return;
      }

      renderOpeningContext(
        context
      );

      showReady();

    } catch (error) {
      console.error(
        "Erreur chargement opening :",
        error
      );

      showError(
        error?.message ||
        "Impossible de préparer l'opening."
      );
    }
  }


  /* =======================================================
     FLASH
     ======================================================= */

  function triggerFlash() {
    if (!openingFlash) {
      return;
    }

    openingFlash.classList.remove(
      "is-active"
    );

    /*
     * Force le navigateur à recommencer
     * l'animation si plusieurs packs sont ouverts.
     */

    void openingFlash.offsetWidth;

    openingFlash.classList.add(
      "is-active"
    );

    window.setTimeout(
      () => {
        openingFlash.classList.remove(
          "is-active"
        );
      },
      850
    );
  }


  /* =======================================================
     PRÉPARATION ANIMATION
     ======================================================= */

  function resetAnimationValues() {
    if (animationRating) {
      animationRating.textContent =
        "?";
    }

    if (animationPosition) {
      animationPosition.textContent =
        "???";
    }

    if (animationNationality) {
      animationNationality.textContent =
        "FC CLASSE";
    }

    if (animationText) {
      animationText.textContent =
        "Le joueur arrive...";
    }
  }


  /* =======================================================
     ANIMATION DE RÉVÉLATION
     ======================================================= */

  async function runOpeningAnimation(player) {
    const reducedMotion =
      prefersReducedMotion();

    resetAnimationValues();

    showAnimation();

    triggerFlash();

    if (reducedMotion) {
      if (animationRating) {
        animationRating.textContent =
          player.rating || "?";
      }

      if (animationPosition) {
        animationPosition.textContent =
          player.position || "?";
      }

      if (animationNationality) {
        animationNationality.textContent =
          player.nationality ||
          "FC CLASSE";
      }

      await sleep(500);

      return;
    }


    /* -----------------------------------------------------
       Phase 1 : entrée
       ----------------------------------------------------- */

    if (animationText) {
      animationText.textContent =
        "Le joueur arrive...";
    }

    await sleep(800);


    /* -----------------------------------------------------
       Phase 2 : note
       ----------------------------------------------------- */

    if (animationRating) {
      animationRating.textContent =
        player.rating || "?";
    }

    if (animationText) {
      animationText.textContent =
        "La note...";
    }

    await sleep(850);


    /* -----------------------------------------------------
       Phase 3 : poste
       ----------------------------------------------------- */

    if (animationPosition) {
      animationPosition.textContent =
        player.position || "?";
    }

    if (animationText) {
      animationText.textContent =
        "Le poste...";
    }

    await sleep(850);


    /* -----------------------------------------------------
       Phase 4 : nationalité
       ----------------------------------------------------- */

    if (animationNationality) {
      animationNationality.textContent =
        player.nationality ||
        "FC CLASSE";
    }

    if (animationText) {
      animationText.textContent =
        "Dernier indice...";
    }

    await sleep(950);


    /* -----------------------------------------------------
       Phase finale
       ----------------------------------------------------- */

    triggerFlash();

    await sleep(450);
  }


  /* =======================================================
     CARTE RÉVÉLÉE
     ======================================================= */

  function renderRevealedPlayer(result) {
    const player =
      result.player || {};

    const student =
      result.student || {};

    if (revealedRating) {
      revealedRating.textContent =
        safeNumber(
          player.rating,
          0
        );
    }

    if (revealedPosition) {
      revealedPosition.textContent =
        player.position ||
        "-";
    }

    if (revealedName) {
      revealedName.textContent =
        player.name ||
        "Joueur";
    }

    if (revealedClub) {
      revealedClub.textContent =
        player.club ||
        "Club non renseigné";
    }

    if (revealedNationality) {
      revealedNationality.textContent =
        player.nationality ||
        "Nationalité non renseignée";
    }

    if (revealStudentName) {
      revealStudentName.textContent =
        student.name ||
        openingContext?.student?.name ||
        "Élève";
    }


    /* -----------------------------------------------------
       IMAGE
       ----------------------------------------------------- */

    if (revealedImage) {
      revealedImage.hidden =
        !player.image;

      revealedImage.src =
        player.image || "";

      revealedImage.alt =
        player.name ||
        "Joueur";

      revealedImage.onerror =
        () => {
          revealedImage.hidden =
            true;

          if (revealedFallback) {
            revealedFallback.hidden =
              false;

            revealedFallback.textContent =
              getInitials(
                player.name
              ) ||
              "FC";
          }
        };

      if (player.image) {
        if (revealedFallback) {
          revealedFallback.hidden =
            true;
        }
      }
    }


    /* -----------------------------------------------------
       LIEN COLLECTION
       ----------------------------------------------------- */

    if (viewCollectionButton) {
      const route =
        config.routes?.student ||
        "eleve.html";

      viewCollectionButton.href =
        `${route}?id=${encodeURIComponent(
          studentId
        )}`;
    }


    /* -----------------------------------------------------
       OPENING SUIVANT
       ----------------------------------------------------- */

    const remaining =
      safeNumber(
        result.openings?.available
      );

    if (openAnotherButton) {
      openAnotherButton.hidden =
        remaining < 1;

      if (remaining > 0) {
        openAnotherButton.textContent =
          remaining > 1
            ? `Ouvrir le suivant · ${remaining} restants`
            : "Ouvrir le suivant";
      }
    }

    /*
     * Si un autre opening est disponible,
     * le bouton principal devient
     * "Ouvrir le suivant".
     *
     * Le retour prof reste disponible.
     */

    if (backTeacherButton) {
      backTeacherButton.hidden =
        false;
    }
  }


  /* =======================================================
     TIRAGE RÉEL
     ======================================================= */

  async function performOpening() {
    if (
      isOpening ||
      !teacherToken ||
      !studentId
    ) {
      return;
    }

    isOpening = true;

    if (packButton) {
      packButton.disabled =
        true;

      packButton.classList.add(
        "is-opening"
      );
    }

    document.body.classList.add(
      "is-opening"
    );

    try {
      /*
       * LE TIRAGE A LIEU ICI.
       *
       * En version finale, cette fonction
       * appellera Google Apps Script.
       *
       * C'est le serveur qui devra :
       *
       * 1. vérifier la session prof,
       * 2. vérifier l'opening disponible,
       * 3. verrouiller le tirage,
       * 4. choisir un joueur encore libre,
       * 5. attribuer ce joueur,
       * 6. enregistrer l'opening.
       */

      const result =
        await api.performOpening(
          teacherToken,
          studentId,
          packType
        );

      openingResult =
        result;

      /*
       * On laisse le pack commencer
       * son animation avant de passer
       * au tunnel.
       */

      if (
        !prefersReducedMotion()
      ) {
        await sleep(600);
      }

      await runOpeningAnimation(
        result.player
      );

      renderRevealedPlayer(
        result
      );

      showReveal();

    } catch (error) {
      console.error(
        "Erreur pendant l'opening :",
        error
      );

      showError(
        error?.message ||
        "Impossible d'effectuer cet opening."
      );

    } finally {
      isOpening = false;

      if (packButton) {
        packButton.disabled =
          false;

        packButton.classList.remove(
          "is-opening"
        );
      }
    }
  }


  packButton?.addEventListener(
    "click",
    performOpening
  );


  /* =======================================================
     OUVRIR LE PACK SUIVANT
     ======================================================= */

  async function prepareAnotherOpening() {
    if (
      isOpening ||
      !openingResult
    ) {
      return;
    }

    const remaining =
      safeNumber(
        openingResult.openings
          ?.available
      );

    if (remaining < 1) {
      return;
    }

    openingResult =
      null;

    resetAnimationValues();

    /*
     * On redemande le contexte à l'API.
     *
     * Cela permet de recalculer :
     * - openings disponibles
     * - joueurs encore disponibles
     *
     * et évite de travailler avec
     * des données dépassées.
     */

    await loadOpeningContext();
  }


  openAnotherButton?.addEventListener(
    "click",
    prepareAnotherOpening
  );


  /* =======================================================
     PROTECTION CONTRE DOUBLE CLIC
     ======================================================= */

  window.addEventListener(
    "beforeunload",
    event => {
      /*
       * En mode démo, on ne bloque pas vraiment
       * la fermeture.
       *
       * Le tirage est déjà sauvegardé dès que
       * performOpening() a répondu.
       */

      if (!isOpening) {
        return;
      }

      event.preventDefault();

      event.returnValue = "";
    }
  );


  /* =======================================================
     INITIALISATION
     ======================================================= */

  async function init() {
    readUrlParameters();

    const hasSession =
      loadTeacherSession();

    if (!hasSession) {
      showError(
        "Tu dois être connecté dans l'espace professeur pour lancer un opening."
      );

      return;
    }

    await loadOpeningContext();
  }


  init();
})();
