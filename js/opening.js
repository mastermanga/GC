/* =========================================================
   BEL AIR FC — OPENING.JS
   Opening rapide façon EA FC / FIFA
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     CONFIG / API
     ======================================================= */

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

  /*
   * Durées volontairement assez courtes.
   *
   * L'opening reste spectaculaire,
   * mais ne fait pas perdre 20 secondes
   * à chaque élève.
   */
  const TIMINGS = {
    minimumIntro: 650,

    rarity: 650,

    identity: 800,

    rating: 850,

    final: 500,

    revealDelay: 180
  };


  /* =======================================================
     DOM — ÉTATS PRINCIPAUX
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
     READY / PACK
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
     FLASH
     ======================================================= */

  const openingFlash =
    document.getElementById(
      "opening-flash"
    );


  /* =======================================================
     ÉTAPES ANIMATION
     ======================================================= */

  const stepIntro =
    document.getElementById(
      "opening-step-intro"
    );

  const stepRarity =
    document.getElementById(
      "opening-step-rarity"
    );

  const stepIdentity =
    document.getElementById(
      "opening-step-identity"
    );

  const stepRating =
    document.getElementById(
      "opening-step-rating"
    );

  const stepFinal =
    document.getElementById(
      "opening-step-final"
    );


  /* =======================================================
     CONTENU ANIMATION
     ======================================================= */

  const animationText =
    document.getElementById(
      "opening-animation-text"
    );

  const animationRarity =
    document.getElementById(
      "animation-rarity"
    );

  const animationNationality =
    document.getElementById(
      "animation-nationality"
    );

  const animationClub =
    document.getElementById(
      "animation-club"
    );

  const animationRating =
    document.getElementById(
      "animation-rating"
    );

  const animationPosition =
    document.getElementById(
      "animation-position"
    );


  /* =======================================================
     RÉVÉLATION
     ======================================================= */

  const revealedRarity =
    document.getElementById(
      "revealed-rarity"
    );

  const revealedPlayerCard =
    document.getElementById(
      "revealed-player-card"
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


  /* =======================================================
     BOUTONS FIN
     ======================================================= */

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
     ÉTAT JS
     ======================================================= */

  let teacherToken = null;

  let studentId = null;

  let packType =
    config.defaultPackType ||
    "standard";

  let openingContext = null;

  let openingResult = null;

  let isOpening = false;

  let introInterval = null;


  /* =======================================================
     OUTILS
     ======================================================= */

  function sleep(ms) {
    return new Promise(resolve => {
      window.setTimeout(
        resolve,
        ms
      );
    });
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
        "Session professeur illisible.",
        error
      );

      return false;
    }
  }


  /* =======================================================
     ÉTATS D'ÉCRAN
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
    stopIntroMessages();

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
     GESTION DES ÉTAPES
     ======================================================= */

  function hideAllSteps() {
    [
      stepIntro,
      stepRarity,
      stepIdentity,
      stepRating,
      stepFinal
    ].forEach(step => {
      if (step) {
        step.classList.remove(
          "is-active"
        );
      }
    });
  }


  function showStep(step) {
    hideAllSteps();

    if (step) {
      /*
       * Petit reflow volontaire :
       * permet à la transition CSS
       * de repartir correctement.
       */
      void step.offsetWidth;

      step.classList.add(
        "is-active"
      );
    }
  }


  /* =======================================================
     RARETÉ
     ======================================================= */

  function normalizeRarity(value) {
    const rarity =
      String(value || "")
        .toLowerCase()
        .trim();

    if (
      rarity === "legendary" ||
      rarity === "légende" ||
      rarity === "legende"
    ) {
      return "legendary";
    }

    if (
      rarity === "gold" ||
      rarity === "or"
    ) {
      return "gold";
    }

    if (
      rarity === "silver" ||
      rarity === "argent"
    ) {
      return "silver";
    }

    return "bronze";
  }


  function rarityLabel(value) {
    const rarity =
      normalizeRarity(value);

    if (rarity === "legendary") {
      return "LÉGENDE";
    }

    if (rarity === "gold") {
      return "OR";
    }

    if (rarity === "silver") {
      return "ARGENT";
    }

    return "BRONZE";
  }


  function clearRarityTheme() {
    document.body.classList.remove(
      "rarity-legendary",
      "rarity-gold",
      "rarity-silver",
      "rarity-bronze"
    );

    if (animationSection) {
      delete animationSection.dataset.rarity;
    }
  }


  function applyRarityTheme(
    rarityValue
  ) {
    clearRarityTheme();

    const rarity =
      normalizeRarity(
        rarityValue
      );

    document.body.classList.add(
      `rarity-${rarity}`
    );

    if (animationSection) {
      animationSection.dataset.rarity =
        rarity;
    }

    return rarity;
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
     RESET
     ======================================================= */

  function resetOpeningVisuals() {
    clearRarityTheme();

    hideAllSteps();

    if (animationText) {
      animationText.textContent =
        "Le pack s'ouvre…";
    }

    if (animationRarity) {
      animationRarity.textContent =
        "?";
    }

    if (animationNationality) {
      animationNationality.textContent =
        "???";
    }

    if (animationClub) {
      animationClub.textContent =
        "???";
    }

    if (animationRating) {
      animationRating.textContent =
        "?";
    }

    if (animationPosition) {
      animationPosition.textContent =
        "???";
    }

    if (revealedRarity) {
      revealedRarity.textContent =
        "JOUEUR";
    }

    if (revealedImage) {
      revealedImage.hidden = true;
      revealedImage.src = "";
    }

    if (revealedFallback) {
      revealedFallback.hidden = true;
    }
  }


  /* =======================================================
     CONTEXTE OPENING
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

    if (packTypeLabel) {
      packTypeLabel.textContent =
        packType === "standard"
          ? "PACK STANDARD"
          : String(packType)
              .toUpperCase();
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
       * Avec le nouveau api.js,
       * cette fonction utilise normalement
       * le dashboard déjà en cache.
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

      const remainingPlayers =
        safeNumber(
          context?.availablePlayers
        );

      if (available < 1) {
        showError(
          "Cet élève n'a aucun opening disponible."
        );

        return;
      }

      if (remainingPlayers < 1) {
        showError(
          "Il n'y a plus aucun joueur disponible."
        );

        return;
      }

      renderOpeningContext(
        context
      );

      showReady();

    } catch (error) {
      console.error(
        "Erreur préparation opening :",
        error
      );

      showError(
        error?.message ||
        "Impossible de préparer l'opening."
      );
    }
  }


  /* =======================================================
     INTRO PENDANT QUE GOOGLE TRAVAILLE
     ======================================================= */

  function startIntroMessages() {
    stopIntroMessages();

    const messages = [
      "Le pack s'ouvre…",
      "Entrée dans le stade…",
      "Les lumières s'allument…",
      "Un joueur arrive…"
    ];

    let index = 0;

    if (animationText) {
      animationText.textContent =
        messages[0];
    }

    introInterval =
      window.setInterval(
        () => {
          index =
            (index + 1) %
            messages.length;

          if (animationText) {
            animationText.textContent =
              messages[index];
          }
        },
        450
      );
  }


  function stopIntroMessages() {
    if (introInterval) {
      window.clearInterval(
        introInterval
      );

      introInterval =
        null;
    }
  }


  /* =======================================================
     PRÉCHARGER IMAGE
     ======================================================= */

  function preloadPlayerImage(
    player
  ) {
    if (!player?.image) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      const image =
        new Image();

      let finished =
        false;

      function finish() {
        if (finished) {
          return;
        }

        finished = true;

        resolve();
      }

      image.onload =
        finish;

      image.onerror =
        finish;

      image.src =
        player.image;

      /*
       * On ne bloque jamais l'opening
       * plus de 1,5 seconde pour une image.
       */
      window.setTimeout(
        finish,
        1500
      );
    });
  }


  /* =======================================================
     ÉTAPE RARETÉ
     ======================================================= */

  async function revealRarity(
    player
  ) {
    const rarity =
      applyRarityTheme(
        player.rarity
      );

    if (animationRarity) {
      animationRarity.textContent =
        rarityLabel(
          rarity
        );
    }

    if (revealedRarity) {
      revealedRarity.textContent =
        rarityLabel(
          rarity
        );
    }

    showStep(
      stepRarity
    );

    triggerFlash();

    if (
      rarity === "legendary"
    ) {
      await sleep(
        TIMINGS.rarity + 180
      );
    } else {
      await sleep(
        TIMINGS.rarity
      );
    }
  }


  /* =======================================================
     CLUB + NATIONALITÉ
     ======================================================= */

  async function revealIdentity(
    player
  ) {
    if (animationNationality) {
      animationNationality.textContent =
        player.nationality ||
        "INCONNUE";
    }

    if (animationClub) {
      animationClub.textContent =
        player.club ||
        "CLUB INCONNU";
    }

    showStep(
      stepIdentity
    );

    await sleep(
      TIMINGS.identity
    );
  }


  /* =======================================================
     NOTE + POSTE
     ======================================================= */

  async function revealRating(
    player
  ) {
    if (animationRating) {
      animationRating.textContent =
        safeNumber(
          player.rating,
          "?"
        );
    }

    if (animationPosition) {
      animationPosition.textContent =
        player.position ||
        "?";
    }

    showStep(
      stepRating
    );

    triggerFlash();

    await sleep(
      TIMINGS.rating
    );
  }


  /* =======================================================
     FINAL
     ======================================================= */

  async function revealFinalStage() {
    showStep(
      stepFinal
    );

    triggerFlash();

    await sleep(
      TIMINGS.final
    );
  }


  /* =======================================================
     RENDU JOUEUR
     ======================================================= */

  function renderRevealedPlayer(
    result
  ) {
    const player =
      result?.player || {};

    const student =
      result?.student || {};

    const rarity =
      applyRarityTheme(
        player.rarity
      );

    if (revealedRarity) {
      revealedRarity.textContent =
        rarityLabel(
          rarity
        );
    }

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
        openingContext
          ?.student
          ?.name ||
        "Élève";
    }


    /* IMAGE */

    if (revealedImage) {
      if (player.image) {
        revealedImage.src =
          player.image;

        revealedImage.alt =
          player.name ||
          "Joueur";

        revealedImage.hidden =
          false;

        if (revealedFallback) {
          revealedFallback.hidden =
            true;
        }

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

      } else {
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


    /* OPENINGS RESTANTS */

    const remaining =
      safeNumber(
        result?.openings
          ?.available ??
        result?.stats
          ?.available
      );

    if (openAnotherButton) {
      openAnotherButton.hidden =
        remaining < 1;

      if (remaining > 1) {
        openAnotherButton.textContent =
          `Ouvrir le suivant · ${remaining} restants`;

      } else if (remaining === 1) {
        openAnotherButton.textContent =
          "Ouvrir le suivant";
      }
    }

    if (backTeacherButton) {
      backTeacherButton.hidden =
        false;
    }
  }


  /* =======================================================
     CONTEXTE LOCAL APRÈS TIRAGE
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
     * Chaque opening attribue exactement
     * un joueur.
     *
     * Donc pas besoin de redemander
     * à Google combien il en reste.
     */
    openingContext.availablePlayers =
      Math.max(
        0,
        safeNumber(
          openingContext
            ?.availablePlayers
        ) - 1
      );
  }


  /* =======================================================
     OPENING PRINCIPAL
     ======================================================= */

  async function performOpening() {
    if (
      isOpening ||
      !teacherToken ||
      !studentId
    ) {
      return;
    }

    isOpening =
      true;

    openingResult =
      null;

    resetOpeningVisuals();


    /* -------------------------------------------------------
       BOUTON
       ------------------------------------------------------- */

    if (packButton) {
      packButton.disabled =
        true;

      packButton.classList.add(
        "is-opening"
      );
    }


    /*
     * =====================================================
     * MOMENT IMPORTANT
     * =====================================================
     *
     * On affiche le tunnel AVANT d'attendre Google.
     *
     * Donc le clic semble instantané.
     */

    showAnimation();

    showStep(
      stepIntro
    );

    startIntroMessages();

    triggerFlash();


    /*
     * L'appel Google démarre immédiatement
     * en parallèle de l'animation.
     */
    const serverPromise =
      api.performOpening(
        teacherToken,
        studentId,
        packType
      );


    /*
     * Minimum 650 ms de tunnel.
     *
     * Si Google répond en 300 ms :
     * on garde quand même une petite intro.
     *
     * Si Google répond en 1,5 s :
     * le tunnel continue pendant ce temps.
     */
    const introMinimumPromise =
      sleep(
        prefersReducedMotion()
          ? 100
          : TIMINGS.minimumIntro
      );


    try {
      const [
        result
      ] =
        await Promise.all([
          serverPromise,
          introMinimumPromise
        ]);


      stopIntroMessages();


      openingResult =
        result;


      updateContextAfterOpening(
        result
      );


      /*
       * On commence immédiatement à charger
       * la photo pendant que les indices
       * sont révélés.
       */
      const imagePromise =
        preloadPlayerImage(
          result.player
        );


      /*
       * ===================================================
       * MODE ACCESSIBILITÉ
       * ===================================================
       */

      if (
        prefersReducedMotion()
      ) {
        renderRevealedPlayer(
          result
        );

        await imagePromise;

        showReveal();

        return;
      }


      /*
       * ===================================================
       * RARETÉ
       * ===================================================
       */

      await revealRarity(
        result.player
      );


      /*
       * ===================================================
       * NATIONALITÉ + CLUB
       * ===================================================
       */

      await revealIdentity(
        result.player
      );


      /*
       * ===================================================
       * NOTE + POSTE
       * ===================================================
       */

      await revealRating(
        result.player
      );


      /*
       * ===================================================
       * FINAL
       * ===================================================
       */

      await revealFinalStage();


      /*
       * La photo a eu environ 2 secondes
       * pour se charger pendant l'animation.
       */
      await imagePromise;


      /*
       * ===================================================
       * JOUEUR
       * ===================================================
       */

      renderRevealedPlayer(
        result
      );

      await sleep(
        TIMINGS.revealDelay
      );

      showReveal();


    } catch (error) {
      stopIntroMessages();

      console.error(
        "Erreur pendant l'opening :",
        error
      );

      showError(
        error?.message ||
        "Impossible d'effectuer cet opening."
      );


    } finally {
      isOpening =
        false;

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
        openingResult
          ?.openings
          ?.available ??
        openingResult
          ?.stats
          ?.available
      );

    if (remaining < 1) {
      return;
    }


    /*
     * Pas de requête Google ici.
     *
     * On possède déjà les nouvelles
     * informations localement.
     */

    openingResult =
      null;

    resetOpeningVisuals();

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
     PROTECTION SI ON QUITTE PENDANT LE TIRAGE
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
     INIT
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

    resetOpeningVisuals();

    await loadOpeningContext();
  }


  init();

})();
