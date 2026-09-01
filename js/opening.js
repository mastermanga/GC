/* =========================================================
   BEL AIR FC — OPENING.JS
   Opening rapide :
   attente animée → pays/club → note/poste → joueur
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
     CONFIG
     ======================================================= */

  const SESSION_STORAGE_KEY =
    "fcClasse_teacherSession_v1";

  const TIMINGS = {
    minimumWait: 300,
    identity: 1050,
    rating: 1050,
    finalFlash: 350,
    reveal: 100
  };


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


  /* ÉTAPES */

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


  /* ANIMATION */

  const animationText =
    document.getElementById(
      "opening-animation-text"
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


  /* CARTE FINALE */

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


  /* BOUTONS */

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
      .replace(/[\u0300-\u036f]/g, "")
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

    allemagne: "DE",
    germany: "DE",

    angleterre: "GB",
    england: "GB",

    royaumeuni: "GB",
    "royaume-uni": "GB",

    portugal: "PT",

    italie: "IT",
    italy: "IT",

    belgique: "BE",
    belgium: "BE",

    paysbas: "NL",
    "pays-bas": "NL",
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
    "cote d'ivoire": "CI",
    "côte d'ivoire": "CI",

    mali: "ML",

    guinee: "GN",
    guinea: "GN",

    congo: "CG",

    rdc: "CD",

    afriquedusud: "ZA",
    "afrique du sud": "ZA",

    mexique: "MX",
    mexico: "MX",

    canada: "CA",

    etatsunis: "US",
    "etats-unis": "US",
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
    "coree du sud": "KR",

    australie: "AU",
    australia: "AU",

    nouvellezelande: "NZ",
    "nouvelle-zelande": "NZ",

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

    republiquetcheque: "CZ",
    tchequie: "CZ",

    israel: "IL",

    iran: "IR",

    arabiesaoudite: "SA",
    "arabie saoudite": "SA"
  };


  function countryCode(
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


  function flagEmoji(
    nationality
  ) {
    const code =
      countryCode(nationality);

    if (!code) {
      return "🌍";
    }

    return code
      .toUpperCase()
      .replace(
        /./g,
        char =>
          String.fromCodePoint(
            127397 +
            char.charCodeAt()
          )
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
    ].forEach(element => {
      if (element) {
        element.hidden = true;
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


  function showAnimation() {
    hideAllStates();

    document.body.classList.add(
      "is-opening"
    );

    if (animationSection) {
      animationSection.hidden =
        false;

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
     RARETÉ
     ======================================================= */

  function normalizeRarity(value) {
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


  function applyRarityTheme(
    rarity
  ) {
    document.body.classList.remove(
      "rarity-legendary",
      "rarity-gold",
      "rarity-silver",
      "rarity-bronze"
    );

    const normalized =
      normalizeRarity(rarity);

    document.body.classList.add(
      `rarity-${normalized}`
    );

    return normalized;
  }


  /* =======================================================
     RESET VISUEL
     ======================================================= */

  function resetOpeningVisuals() {
    hideAllSteps();

    document.body.classList.remove(
      "rarity-legendary",
      "rarity-gold",
      "rarity-silver",
      "rarity-bronze"
    );

    if (animationText) {
      animationText.textContent = "";
    }

    if (animationNationality) {
      animationNationality.textContent =
        "";
    }

    if (animationClub) {
      animationClub.textContent =
        "";
    }

    if (animationRating) {
      animationRating.textContent =
        "?";
    }

    if (animationPosition) {
      animationPosition.textContent =
        "???";
    }

    if (revealedImage) {
      revealedImage.hidden =
        true;

      revealedImage.src =
        "";
    }

    if (revealedFallback) {
      revealedFallback.hidden =
        true;
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
          "Il n'y a plus de joueur disponible."
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
     IMAGE
     ======================================================= */

  function preloadImage(player) {
    if (!player?.image) {
      return;
    }

    const image =
      new Image();

    image.src =
      player.image;
  }


  /* =======================================================
     ÉTAPE 1
     PETITE ANIMATION D'ATTENTE
     ======================================================= */

  function startWaitingAnimation() {
    resetOpeningVisuals();

    showAnimation();

    /*
     * On utilise uniquement l'animation
     * visuelle du tunnel + ballon.
     * Aucun texte.
     */

    if (animationText) {
      animationText.textContent =
        "";
    }

    showStep(
      stepIntro
    );

    triggerFlash();
  }


  /* =======================================================
     ÉTAPE 2
     DRAPEAU + CLUB
     ======================================================= */

  async function showIdentity(
    player
  ) {
    const nationality =
      player?.nationality ||
      "Inconnue";

    const flag =
      flagEmoji(
        nationality
      );

    if (animationNationality) {
      animationNationality.textContent =
        `${flag} ${nationality}`;
    }

    if (animationClub) {
      animationClub.textContent =
        player?.club ||
        "Club inconnu";
    }

    showStep(
      stepIdentity
    );

    triggerFlash();

    await sleep(
      TIMINGS.identity
    );
  }


  /* =======================================================
     ÉTAPE 3
     NOTE + POSTE
     ======================================================= */

  async function showRatingAndRole(
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

    showStep(
      stepRating
    );

    triggerFlash();

    await sleep(
      TIMINGS.rating
    );
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
        `${flagEmoji(
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

    } else if (
      revealedFallback
    ) {
      revealedFallback.hidden =
        false;

      revealedFallback.textContent =
        getInitials(
          player.name
        ) ||
        "BA";
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


    /* OPENING SUIVANT */

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
     MAJ LOCALE
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


    if (packButton) {
      packButton.disabled =
        true;
    }


    /*
     * ===============================================
     * CLIC = ANIMATION IMMÉDIATE
     * ===============================================
     */

    startWaitingAnimation();


    /*
     * Google commence le tirage au même moment.
     */

    const serverPromise =
      api.performOpening(
        teacherToken,
        studentId,
        packType
      );


    /*
     * Petit minimum de 300 ms pour éviter
     * un changement brutal si Google répond
     * immédiatement.
     */

    const minimumPromise =
      sleep(
        TIMINGS.minimumWait
      );


    try {
      const [
        result
      ] =
        await Promise.all([
          serverPromise,
          minimumPromise
        ]);


      openingResult =
        result;


      updateLocalContext(
        result
      );


      /*
       * Dès qu'on connaît le joueur,
       * sa photo commence à charger.
       */

      preloadImage(
        result.player
      );


      /*
       * ===========================================
       * DRAPEAU + CLUB
       * ===========================================
       */

      await showIdentity(
        result.player
      );


      /*
       * ===========================================
       * NOTE + POSTE
       * ===========================================
       */

      await showRatingAndRole(
        result.player
      );


      /*
       * ===========================================
       * FLASH FINAL
       * ===========================================
       */

      hideAllSteps();

      triggerFlash();

      await sleep(
        TIMINGS.finalFlash
      );


      /*
       * ===========================================
       * CARTE DU JOUEUR
       * ===========================================
       */

      renderFinalCard(
        result
      );

      await sleep(
        TIMINGS.reveal
      );

      showReveal();


    } catch (error) {
      console.error(
        "Erreur opening :",
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
      }
    }
  }


  /* =======================================================
     OPENING SUIVANT
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
     INIT
     ======================================================= */

  async function init() {
    readUrlParameters();

    if (
      !loadTeacherSession()
    ) {
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
