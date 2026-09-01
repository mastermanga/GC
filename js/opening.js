/* =========================================================
   BEL AIR FC — OPENING.JS

   VERSION TEST SANS ANIMATION

   PACK
   → écran NATIONALITÉ + CLUB immédiatement
   → attente serveur directement sur cet écran
   → SUIVANT
   → NOTE + POSTE
   → RÉVÉLER
   → CARTE FINALE
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     CONFIG
     ======================================================= */

  const config = window.FC_CONFIG;
  const api = window.FC_API;

  if (!config || !api) {
    console.error(
      "Bel Air FC : config.js ou api.js n'est pas chargé."
    );
    return;
  }

  const SESSION_STORAGE_KEY =
    "fcClasse_teacherSession_v1";

  const FINAL_FLASH_DURATION = 300;


  /* =======================================================
     DOM — ÉCRANS
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
     FLASH
     ======================================================= */

  const openingFlash =
    document.getElementById(
      "opening-flash"
    );


  /* =======================================================
     ÉTAPES
     ======================================================= */

  const stepIntro =
    document.getElementById(
      "opening-step-intro"
    );

  const stepIdentity =
    document.getElementById(
      "opening-step-identity"
    );

  const stepRating =
    document.getElementById(
      "opening-step-rating"
    );


  /* =======================================================
     NATIONALITÉ + CLUB
     ======================================================= */

  const animationFlag =
    document.getElementById(
      "animation-flag"
    );

  const animationNationality =
    document.getElementById(
      "animation-nationality"
    );

  const animationClub =
    document.getElementById(
      "animation-club"
    );

  const nextIdentityButton =
    document.getElementById(
      "opening-next-identity"
    );


  /* =======================================================
     NOTE + POSTE
     ======================================================= */

  const animationRating =
    document.getElementById(
      "animation-rating"
    );

  const animationPosition =
    document.getElementById(
      "animation-position"
    );

  const revealPlayerButton =
    document.getElementById(
      "opening-reveal-player"
    );


  /* =======================================================
     CARTE FINALE
     ======================================================= */

  const revealedRarity =
    document.getElementById(
      "revealed-rarity"
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
     ACTIONS FINALES
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
  let transitionLocked = false;


  /* =======================================================
     OUTILS
     ======================================================= */

  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }


  function safeNumber(
    value,
    fallback = 0
  ) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }


  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim();
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


  /* =======================================================
     DRAPEAUX
     ======================================================= */

  const COUNTRY_CODES = {
    france: "FR",

    argentine: "AR",
    argentina: "AR",

    bresil: "BR",
    brazil: "BR",

    espagne: "ES",
    spain: "ES",

    angleterre: "GB",
    england: "GB",

    royaumeuni: "GB",

    allemagne: "DE",
    germany: "DE",

    italie: "IT",
    italy: "IT",

    portugal: "PT",

    belgique: "BE",
    belgium: "BE",

    paysbas: "NL",
    netherlands: "NL",

    croatie: "HR",
    croatia: "HR",

    norvege: "NO",
    norway: "NO",

    suede: "SE",
    sweden: "SE",

    danemark: "DK",
    denmark: "DK",

    suisse: "CH",
    switzerland: "CH",

    autriche: "AT",
    austria: "AT",

    pologne: "PL",
    poland: "PL",

    serbie: "RS",
    serbia: "RS",

    ukraine: "UA",

    grece: "GR",
    greece: "GR",

    turquie: "TR",
    turkey: "TR",

    ecosse: "GB",
    scotland: "GB",

    galles: "GB",
    wales: "GB",

    irlande: "IE",
    ireland: "IE",

    maroc: "MA",
    morocco: "MA",

    algerie: "DZ",
    algeria: "DZ",

    tunisie: "TN",
    tunisia: "TN",

    egypte: "EG",
    egypt: "EG",

    senegal: "SN",

    cameroun: "CM",
    cameroon: "CM",

    nigeria: "NG",

    ghana: "GH",

    coteivoire: "CI",

    mali: "ML",

    guinee: "GN",
    guinea: "GN",

    congo: "CG",

    rdc: "CD",

    afriquedusud: "ZA",

    mexique: "MX",
    mexico: "MX",

    canada: "CA",

    etatsunis: "US",
    usa: "US",

    uruguay: "UY",

    colombie: "CO",
    colombia: "CO",

    chili: "CL",
    chile: "CL",

    equateur: "EC",
    ecuador: "EC",

    paraguay: "PY",

    perou: "PE",
    peru: "PE",

    japon: "JP",
    japan: "JP",

    coreedusud: "KR",

    australie: "AU",
    australia: "AU",

    nouvellezelande: "NZ",

    georgie: "GE",
    georgia: "GE",

    hongrie: "HU",
    hungary: "HU",

    roumanie: "RO",
    romania: "RO",

    slovaquie: "SK",
    slovakia: "SK",

    slovenie: "SI",
    slovenia: "SI",

    tchequie: "CZ",
    republiquetcheque: "CZ",

    israel: "IL",

    iran: "IR",

    arabiesaoudite: "SA"
  };


  function getCountryCode(
    nationality
  ) {
    const raw =
      normalize(nationality);

    const compact =
      raw.replace(
        /[^a-z]/g,
        ""
      );

    return (
      COUNTRY_CODES[raw] ||
      COUNTRY_CODES[compact] ||
      null
    );
  }


  function getFlagEmoji(
    nationality
  ) {
    const code =
      getCountryCode(
        nationality
      );

    if (!code) {
      return "🌍";
    }

    return code
      .toUpperCase()
      .replace(
        /./g,
        character =>
          String.fromCodePoint(
            127397 +
            character.charCodeAt()
          )
      );
  }


  /* =======================================================
     RARETÉ
     ======================================================= */

  function normalizeRarity(
    value
  ) {
    const rarity =
      normalize(value);

    if (
      rarity === "legendary" ||
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


  function rarityLabel(
    value
  ) {
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
  }


  function applyRarityTheme(
    rarity
  ) {
    clearRarityTheme();

    document.body.classList.add(
      `rarity-${normalizeRarity(
        rarity
      )}`
    );
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
      return false;
    }
  }


  /* =======================================================
     ÉCRANS
     ======================================================= */

  function hideAllStates() {
    [
      loadingSection,
      errorSection,
      readySection,
      animationSection,
      revealSection
    ].forEach(section => {
      if (section) {
        section.hidden = true;
      }
    });
  }


  function showLoading() {
    hideAllStates();

    if (loadingSection) {
      loadingSection.hidden =
        false;
    }
  }


  function showReady() {
    hideAllStates();

    document.body.classList.remove(
      "is-opening"
    );

    if (readySection) {
      readySection.hidden =
        false;
    }
  }


  function showAnimationScreen() {
    hideAllStates();

    document.body.classList.remove(
      "is-opening"
    );

    if (animationSection) {
      animationSection.hidden =
        false;
    }
  }


  function showReveal() {
    hideAllStates();

    document.body.classList.remove(
      "is-opening"
    );

    if (revealSection) {
      revealSection.hidden =
        false;
    }
  }


  function showError(message) {
    hideAllStates();

    document.body.classList.remove(
      "is-opening"
    );

    if (errorSection) {
      errorSection.hidden =
        false;
    }

    if (errorMessage) {
      errorMessage.textContent =
        message ||
        "Une erreur est survenue.";
    }
  }


  /* =======================================================
     ÉTAPES
     ======================================================= */

  function hideAllSteps() {
    [
      stepIntro,
      stepIdentity,
      stepRating
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

    if (!step) {
      return;
    }

    void step.offsetWidth;

    step.classList.add(
      "is-active"
    );
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
  }


  /* =======================================================
     RESET
     ======================================================= */

  function resetOpeningVisuals() {
    clearRarityTheme();

    hideAllSteps();

    if (animationFlag) {
      animationFlag.textContent =
        "🌍";
    }

    if (animationNationality) {
      animationNationality.textContent =
        "…";
    }

    if (animationClub) {
      animationClub.textContent =
        "…";
    }

    if (animationRating) {
      animationRating.textContent =
        "?";
    }

    if (animationPosition) {
      animationPosition.textContent =
        "???";
    }

    if (nextIdentityButton) {
      nextIdentityButton.disabled =
        true;
    }

    if (revealPlayerButton) {
      revealPlayerButton.disabled =
        true;
    }

    if (revealedRarity) {
      revealedRarity.textContent =
        "JOUEUR";
    }

    if (revealedImage) {
      revealedImage.src = "";
      revealedImage.hidden = true;
    }

    if (revealedFallback) {
      revealedFallback.hidden = true;
    }

    transitionLocked = false;
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

    if (headerStudentName) {
      headerStudentName.textContent =
        student.name ||
        "Élève";
    }

    if (readyDescription) {
      readyDescription.textContent =
        `${student.name || "L'élève"} va ouvrir son pack.`;
    }

    if (availableCount) {
      availableCount.textContent =
        safeNumber(
          openings.available
        );
    }

    if (playersLeft) {
      playersLeft.textContent =
        safeNumber(
          context?.availablePlayers
        );
    }

    if (packTypeLabel) {
      packTypeLabel.textContent =
        "PACK STANDARD";
    }

    document.title =
      `${student.name || "Élève"} — Opening — Bel Air FC`;
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
        "Aucun élève sélectionné."
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

      const openings =
        context?.openings ||
        context?.stats ||
        {};

      if (
        safeNumber(
          openings.available
        ) < 1
      ) {
        showError(
          "Cet élève n'a aucun opening disponible."
        );
        return;
      }

      if (
        safeNumber(
          context?.availablePlayers
        ) < 1
      ) {
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
      showError(
        error?.message ||
        "Impossible de préparer l'opening."
      );
    }
  }


  /* =======================================================
     PRÉCHARGER PHOTO
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
     PREMIER INDICE
     ======================================================= */

  function prepareIdentityScreen(
    player
  ) {
    const nationality =
      player?.nationality ||
      "Inconnue";

    if (animationFlag) {
      animationFlag.textContent =
        getFlagEmoji(
          nationality
        );
    }

    if (animationNationality) {
      animationNationality.textContent =
        nationality;
    }

    if (animationClub) {
      animationClub.textContent =
        player?.club ||
        "Club inconnu";
    }

    if (nextIdentityButton) {
      nextIdentityButton.disabled =
        false;
    }
  }


  /* =======================================================
     SECOND INDICE
     ======================================================= */

  function prepareRatingScreen(
    player
  ) {
    if (animationRating) {
      animationRating.textContent =
        safeNumber(
          player?.rating,
          "?"
        );
    }

    if (animationPosition) {
      animationPosition.textContent =
        player?.position ||
        "?";
    }

    if (revealPlayerButton) {
      revealPlayerButton.disabled =
        false;
    }
  }


  /* =======================================================
     CARTE FINALE
     ======================================================= */

  function renderFinalCard(
    result
  ) {
    const player =
      result?.player || {};

    const student =
      result?.student || {};

    applyRarityTheme(
      player.rarity
    );

    if (revealedRarity) {
      revealedRarity.textContent =
        rarityLabel(
          player.rarity
        );
    }

    if (revealedRating) {
      revealedRating.textContent =
        safeNumber(
          player.rating
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
        "Club";
    }

    if (revealedNationality) {
      const nationality =
        player.nationality ||
        "Nationalité";

      revealedNationality.textContent =
        `${getFlagEmoji(
          nationality
        )} ${nationality}`;
    }

    if (revealStudentName) {
      revealStudentName.textContent =
        student.name ||
        openingContext
          ?.student
          ?.name ||
        "Élève";
    }


    /* PHOTO */

    if (
      revealedImage &&
      player.image
    ) {
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
      if (revealedImage) {
        revealedImage.hidden =
          true;
      }

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

      if (remaining === 1) {
        openAnotherButton.textContent =
          "Ouvrir le suivant";
      }

      if (remaining > 1) {
        openAnotherButton.textContent =
          `Ouvrir le suivant · ${remaining} restants`;
      }
    }

    if (backTeacherButton) {
      backTeacherButton.hidden =
        false;
    }
  }


  /* =======================================================
     CONTEXTE LOCAL
     ======================================================= */

  function updateLocalContext(
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
     OPENING

     AUCUNE ANIMATION.
     ======================================================= */

  async function performOpening() {
    if (
      isOpening ||
      transitionLocked ||
      !teacherToken ||
      !studentId
    ) {
      return;
    }

    isOpening = true;
    openingResult = null;

    resetOpeningVisuals();


    if (packButton) {
      packButton.disabled =
        true;
    }


    /*
     * ===============================================
     * AU CLIC :
     * PREMIER ÉCRAN IMMÉDIATEMENT
     * ===============================================
     */

    showAnimationScreen();

    showStep(
      stepIdentity
    );


    /*
     * On laisse uniquement des ...
     * le temps que Google réponde.
     */

    if (animationFlag) {
      animationFlag.textContent =
        "🌍";
    }

    if (animationNationality) {
      animationNationality.textContent =
        "…";
    }

    if (animationClub) {
      animationClub.textContent =
        "…";
    }

    if (nextIdentityButton) {
      nextIdentityButton.disabled =
        true;
    }


    /*
     * ===============================================
     * TIRAGE SERVEUR
     * ===============================================
     */

    try {
      const result =
        await api.performOpening(
          teacherToken,
          studentId,
          packType
        );


      openingResult =
        result;


      updateLocalContext(
        result
      );


      /*
       * Photo chargée en arrière-plan.
       */

      preloadPlayerImage(
        result?.player
      );


      /*
       * Dès que Google répond :
       * on remplit le premier indice.
       */

      prepareIdentityScreen(
        result.player
      );


      /*
       * On prépare déjà le deuxième
       * indice en mémoire.
       */

      prepareRatingScreen(
        result.player
      );


      /*
       * Mais le bouton révéler ne doit
       * servir que quand l'écran 2 apparaît.
       */

      if (revealPlayerButton) {
        revealPlayerButton.disabled =
          false;
      }


      isOpening =
        false;


    } catch (error) {
      isOpening =
        false;

      console.error(
        "Erreur opening :",
        error
      );

      showError(
        error?.message ||
        "Impossible d'effectuer cet opening."
      );

    } finally {
      if (packButton) {
        packButton.disabled =
          false;
      }
    }
  }


  /* =======================================================
     SUIVANT
     ======================================================= */

  async function goToRatingStep() {
    if (
      transitionLocked ||
      isOpening ||
      !openingResult
    ) {
      return;
    }

    transitionLocked =
      true;

    if (nextIdentityButton) {
      nextIdentityButton.disabled =
        true;
    }

    showStep(
      stepRating
    );

    await sleep(100);

    if (nextIdentityButton) {
      nextIdentityButton.disabled =
        false;
    }

    transitionLocked =
      false;
  }


  /* =======================================================
     RÉVÉLER
     ======================================================= */

  async function revealPlayer() {
    if (
      transitionLocked ||
      isOpening ||
      !openingResult
    ) {
      return;
    }

    transitionLocked =
      true;

    if (revealPlayerButton) {
      revealPlayerButton.disabled =
        true;
    }

    renderFinalCard(
      openingResult
    );

    hideAllSteps();

    triggerFlash();

    await sleep(
      FINAL_FLASH_DURATION
    );

    showReveal();

    transitionLocked =
      false;

    if (revealPlayerButton) {
      revealPlayerButton.disabled =
        false;
    }
  }


  /* =======================================================
     OPENING SUIVANT
     ======================================================= */

  function prepareAnotherOpening() {
    if (
      isOpening ||
      transitionLocked ||
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

    openingResult = null;

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

  nextIdentityButton?.addEventListener(
    "click",
    goToRatingStep
  );

  revealPlayerButton?.addEventListener(
    "click",
    revealPlayer
  );

  openAnotherButton?.addEventListener(
    "click",
    prepareAnotherOpening
  );


  /* =======================================================
     PROTECTION PENDANT TIRAGE
     ======================================================= */

  window.addEventListener(
    "beforeunload",
    event => {
      if (!isOpening) {
        return;
      }

      event.preventDefault();

      event.returnValue = "";
    }
  );


  /* =======================================================
     INIT
     ======================================================= */

  async function init() {
    readUrlParameters();

    if (!loadTeacherSession()) {
      showError(
        "Tu dois être connecté dans l'espace professeur."
      );

      return;
    }

    resetOpeningVisuals();

    await loadOpeningContext();
  }


  init();

})();
