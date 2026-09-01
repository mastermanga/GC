/* =========================================================
   BEL AIR FC — OPENING.JS
   Opening rapide / local-first
   ========================================================= */

(() => {
  "use strict";

  const config = window.FC_CONFIG;
  const api = window.FC_API;

  if (!config || !api) {
    console.error(
      "Bel Air FC : config.js ou api.js n'est pas chargé."
    );
    return;
  }


  /* =======================================================
     CONSTANTES
     ======================================================= */

  const SESSION_STORAGE_KEY =
    "fcClasse_teacherSession_v1";


  /* =======================================================
     DOM
     ======================================================= */

  const loadingSection =
    document.getElementById("opening-loading");

  const errorSection =
    document.getElementById("opening-error");

  const errorMessage =
    document.getElementById(
      "opening-error-message"
    );

  const readySection =
    document.getElementById("opening-ready");

  const animationSection =
    document.getElementById(
      "opening-animation"
    );

  const revealSection =
    document.getElementById(
      "opening-reveal"
    );


  const headerStudentName =
    document.getElementById(
      "opening-student-name"
    );


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


  function setDocumentTitle(
    studentName
  ) {
    document.title =
      `${studentName} — Opening — Bel Air FC`;
  }


  function setAnimationText(text) {
    if (animationText) {
      animationText.textContent =
        text;
    }
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
      params.get("studentId");

    packType =
      params.get("pack") ||
      config.defaultPackType ||
      "standard";
  }


  /* =======================================================
     SESSION PROF
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
     ÉTATS VISUELS
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

    if (animationSection) {
      animationSection.classList.remove(
        "is-running"
      );
    }

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
     CONTEXTE
     ======================================================= */

  function renderOpeningContext(
    context
  ) {
    const student =
      context?.student || {};

    const openings =
      context?.openings ||
      context?.stats ||
      {};

    const pack =
      context?.pack || {};

    const available =
      safeNumber(
        openings.available
      );

    const remainingPlayers =
      safeNumber(
        context?.availablePlayers
      );

    if (headerStudentName) {
      headerStudentName.textContent =
        student.name ||
        "Élève";
    }

    if (packTypeLabel) {
      let packName =
        pack.name ||
        pack.id ||
        context?.packType ||
        packType;

      if (
        String(packName)
          .toLowerCase() ===
        "standard"
      ) {
        packName =
          "Pack Standard";
      }

      packTypeLabel.textContent =
        String(packName)
          .toUpperCase();
    }

    if (readyDescription) {
      readyDescription.textContent =
        `${student.name || "L'élève"} va découvrir un nouveau joueur pour sa collection.`;
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
      /*
       * Grâce au nouveau api.js,
       * cette réponse vient généralement
       * directement du cache local.
       */
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
          context?.openings
            ?.available ??
          context?.stats
            ?.available
        );

      const availablePlayers =
        safeNumber(
          context?.availablePlayers
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
      650
    );
  }


  /* =======================================================
     RESET ANIMATION
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
        "BEL AIR FC";
    }

    setAnimationText(
      "Le pack s'ouvre..."
    );
  }


  /* =======================================================
     PRÉCHARGEMENT IMAGE
     ======================================================= */

  function preloadPlayerImage(
    player
  ) {
    if (!player?.image) {
      return;
    }

    const image =
      new Image();

    image.src =
      player.image;
  }


  /* =======================================================
     ATTENDRE GOOGLE SANS BLOQUER L'ANIMATION
     ======================================================= */

  async function waitForOpeningResult(
    serverPromise
  ) {
    /*
     * Pendant que Google Apps Script
     * fait le vrai tirage sécurisé,
     * l'élève voit déjà l'animation.
     */

    const trackedPromise =
      serverPromise.then(
        result => ({
          ok: true,
          result: result
        }),
        error => ({
          ok: false,
          error: error
        })
      );

    const messages = [
      "Le pack s'ouvre...",
      "Un joueur arrive...",
      "Préparation de la carte...",
      "Le stade s'illumine...",
      "Encore un instant..."
    ];

    let messageIndex = 0;

    while (true) {
      const outcome =
        await Promise.race([
          trackedPromise,

          sleep(420).then(
            () => null
          )
        ]);

      if (outcome) {
        if (!outcome.ok) {
          throw outcome.error;
        }

        preloadPlayerImage(
          outcome.result?.player
        );

        return outcome.result;
      }

      setAnimationText(
        messages[
          messageIndex %
          messages.length
        ]
      );

      messageIndex++;
    }
  }


  /* =======================================================
     RÉVÉLATION RAPIDE
     ======================================================= */

  async function runOpeningAnimation(
    player
  ) {
    const reducedMotion =
      prefersReducedMotion();

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
          "BEL AIR FC";
      }

      await sleep(250);

      return;
    }


    /* NOTE */

    setAnimationText(
      "La note..."
    );

    if (animationRating) {
      animationRating.textContent =
        player.rating || "?";
    }

    triggerFlash();

    await sleep(450);


    /* POSTE */

    setAnimationText(
      "Le poste..."
    );

    if (animationPosition) {
      animationPosition.textContent =
        player.position || "?";
    }

    await sleep(450);


    /* NATIONALITÉ */

    setAnimationText(
      "Dernier indice..."
    );

    if (animationNationality) {
      animationNationality.textContent =
        player.nationality ||
        "BEL AIR FC";
    }

    await sleep(500);


    /* FINAL */

    setAnimationText(
      "C'est parti !"
    );

    triggerFlash();

    await sleep(250);
  }


  /* =======================================================
     RÉVÉLATION CARTE
     ======================================================= */

  function renderRevealedPlayer(
    result
  ) {
    const player =
      result?.player || {};

    const student =
      result?.student || {};

    if (revealedRating) {
      revealedRating.textContent =
        safeNumber(
          player.rating,
          0
        );
    }

    if (revealedPosition) {
      revealedPosition.textContent =
        player.position || "-";
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


    /* IMAGE */

    if (revealedImage) {
      revealedImage.src =
        player.image || "";

      revealedImage.alt =
        player.name ||
        "Joueur";

      revealedImage.hidden =
        !player.image;

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
              "BA";
          }
        };

      if (player.image) {
        if (revealedFallback) {
          revealedFallback.hidden =
            true;
        }
      } else {
        if (revealedFallback) {
          revealedFallback.hidden =
            false;

          revealedFallback.textContent =
            getInitials(
              player.name
            ) ||
            "BA";
        }
      }
    }


    /* COLLECTION */

    if (viewCollectionButton) {
      const route =
        config.routes?.student ||
        "eleve.html";

      viewCollectionButton.href =
        `${route}?id=${encodeURIComponent(
          studentId
        )}`;
    }


    /* AUTRE OPENING */

    const remaining =
      safeNumber(
        result?.openings?.available ??
        result?.stats?.available
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

    if (backTeacherButton) {
      backTeacherButton.hidden =
        false;
    }
  }


  /* =======================================================
     MISE À JOUR LOCALE APRÈS OPENING
     ======================================================= */

  function updateContextAfterOpening(
    result
  ) {
    if (!openingContext) {
      openingContext = {};
    }

    if (result?.student) {
      openingContext.student =
        result.student;
    }

    if (result?.openings) {
      openingContext.openings =
        result.openings;

      openingContext.stats =
        result.openings;
    }

    /*
     * Pas besoin de demander à Google
     * combien de joueurs restent.
     * Un opening = un joueur en moins.
     */

    if (
      openingContext.availablePlayers !==
      undefined
    ) {
      openingContext.availablePlayers =
        Math.max(
          0,
          safeNumber(
            openingContext.availablePlayers
          ) - 1
        );
    }
  }


  /* =======================================================
     TIRAGE
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

    openingResult =
      null;

    if (packButton) {
      packButton.disabled =
        true;

      packButton.classList.add(
        "is-opening"
      );
    }


    /*
     * IMPORTANT :
     *
     * On lance la requête Google ET
     * l'animation exactement au même moment.
     *
     * L'utilisateur ne regarde donc plus
     * un bouton figé pendant que Google charge.
     */

    const serverPromise =
      api.performOpening(
        teacherToken,
        studentId,
        packType
      );


    resetAnimationValues();

    showAnimation();

    triggerFlash();


    try {
      /*
       * Google travaille pendant
       * l'introduction visuelle.
       */

      const result =
        await waitForOpeningResult(
          serverPromise
        );

      openingResult =
        result;

      updateContextAfterOpening(
        result
      );


      /*
       * Maintenant que le joueur est connu,
       * on révèle rapidement ses informations.
       */

      await runOpeningAnimation(
        result.player || {}
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


  /* =======================================================
     PACK SUIVANT
     ======================================================= */

  function prepareAnotherOpening() {
    if (
      isOpening ||
      !openingResult
    ) {
      return;
    }

    const remaining =
      safeNumber(
        openingResult?.openings
          ?.available ??
        openingResult?.stats
          ?.available
      );

    if (remaining < 1) {
      return;
    }

    /*
     * Ancienne version :
     * redemandait getOpeningContext()
     * à Google.
     *
     * Nouvelle version :
     * tout est déjà connu localement.
     */

    openingResult =
      null;

    resetAnimationValues();

    renderOpeningContext(
      openingContext
    );

    showReady();
  }


  /* =======================================================
     EVENTS
     ======================================================= */

  packButton?.addEventListener(
    "click",
    performOpening
  );


  openAnotherButton?.addEventListener(
    "click",
    prepareAnotherOpening
  );


  /* =======================================================
     PROTECTION FERMETURE
     ======================================================= */

  window.addEventListener(
    "beforeunload",
    event => {
      if (!isOpening) {
        return;
      }

      event.preventDefault();

      event.returnValue =
        "";
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
