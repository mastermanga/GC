/* =========================================================
   FC CLASSE — PITCH.JS
   Placement automatique des joueurs sur le terrain
   ========================================================= */

window.FC_PITCH = (() => {
  const config = window.FC_CONFIG || {};

  /* =======================================================
     OUTILS
     ======================================================= */

  function safeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }


  function normalizeRole(player) {
    const explicitRole =
      String(player?.role || "")
        .trim()
        .toUpperCase();

    if (
      ["ATT", "MIL", "DEF", "GB"].includes(
        explicitRole
      )
    ) {
      return explicitRole;
    }

    const position =
      String(player?.position || "")
        .trim()
        .toUpperCase();

    if (
      [
        "BU",
        "AT",
        "AG",
        "AD",
        "AVG",
        "AVD"
      ].includes(position)
    ) {
      return "ATT";
    }

    if (
      [
        "MOC",
        "MC",
        "MDC",
        "MG",
        "MD"
      ].includes(position)
    ) {
      return "MIL";
    }

    if (
      [
        "DC",
        "DG",
        "DD",
        "DLD",
        "DLG"
      ].includes(position)
    ) {
      return "DEF";
    }

    if (
      [
        "GB",
        "GK"
      ].includes(position)
    ) {
      return "GB";
    }

    return "MIL";
  }


  function sortByRating(players) {
    return [...players].sort((a, b) => {
      return (
        safeNumber(b.rating) -
          safeNumber(a.rating) ||
        String(a.name || "").localeCompare(
          String(b.name || ""),
          "fr"
        )
      );
    });
  }


  function uniquePlayers(players) {
    const seen = new Set();

    return players.filter(player => {
      const key =
        String(
          player?.eaId ??
          player?.id ??
          player?.name
        );

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  }


  /* =======================================================
     SÉLECTION DES JOUEURS À AFFICHER
     ======================================================= */

  function selectPitchPlayers(
    collection,
    limit =
      config.pitchPlayerLimit || 5
  ) {
    const players =
      Array.isArray(collection)
        ? uniquePlayers(collection)
        : [];

    if (!players.length) {
      return [];
    }

    const normalizedLimit =
      Math.max(
        1,
        Math.floor(
          safeNumber(limit, 5)
        )
      );

    /*
     * On ne cherche PAS à créer une vraie équipe à 11.
     *
     * L'idée est plutôt une vitrine "five" :
     *
     * - priorité à quelques attaquants
     * - puis des milieux
     * - puis défense / gardien si la collection le permet
     *
     * Si l'élève n'a que 2 ou 3 joueurs,
     * on affiche simplement ses meilleurs joueurs.
     */

    const sorted =
      sortByRating(players);

    if (
      sorted.length <=
      normalizedLimit
    ) {
      return sorted;
    }

    const groups = {
      ATT: [],
      MIL: [],
      DEF: [],
      GB: []
    };

    sorted.forEach(player => {
      const role =
        normalizeRole(player);

      groups[role].push(player);
    });

    const selected = [];

    /*
     * Répartition cible pour 5 joueurs :
     *
     * 2 ATT
     * 2 MIL
     * 1 DEF ou GB
     *
     * Ce n'est qu'une priorité.
     * Les meilleurs joueurs restants complètent ensuite.
     */

    const preferredSlots =
      normalizedLimit >= 5
        ? [
            "ATT",
            "ATT",
            "MIL",
            "MIL",
            "DEF"
          ]
        : normalizedLimit === 4
          ? [
              "ATT",
              "ATT",
              "MIL",
              "DEF"
            ]
          : normalizedLimit === 3
            ? [
                "ATT",
                "MIL",
                "DEF"
              ]
            : normalizedLimit === 2
              ? [
                  "ATT",
                  "MIL"
                ]
              : [
                  "ATT"
                ];

    preferredSlots.forEach(role => {
      const candidate =
        groups[role].find(
          player =>
            !selected.includes(player)
        );

      if (candidate) {
        selected.push(candidate);
      }
    });

    /*
     * Si un gardien est excellent et qu'on a
     * encore de la place, il peut apparaître.
     */

    if (
      selected.length <
        normalizedLimit &&
      groups.GB.length
    ) {
      const keeper =
        groups.GB.find(
          player =>
            !selected.includes(player)
        );

      if (keeper) {
        selected.push(keeper);
      }
    }

    /*
     * On complète avec les meilleurs joueurs disponibles,
     * peu importe leur rôle.
     */

    for (const player of sorted) {
      if (
        selected.length >=
        normalizedLimit
      ) {
        break;
      }

      if (
        !selected.includes(player)
      ) {
        selected.push(player);
      }
    }

    /*
     * On trie ensuite par rôle pour rendre
     * le placement plus naturel.
     */

    return selected.sort((a, b) => {
      const roleOrder = {
        ATT: 1,
        MIL: 2,
        DEF: 3,
        GB: 4
      };

      const aRole =
        normalizeRole(a);

      const bRole =
        normalizeRole(b);

      return (
        roleOrder[aRole] -
          roleOrder[bRole] ||
        safeNumber(b.rating) -
          safeNumber(a.rating)
      );
    });
  }


  /* =======================================================
     POSITIONS DU TERRAIN
     ======================================================= */

  const layouts = {
    1: [
      {
        x: 50,
        y: 46
      }
    ],

    2: [
      {
        x: 34,
        y: 38
      },

      {
        x: 66,
        y: 62
      }
    ],

    3: [
      {
        x: 50,
        y: 24
      },

      {
        x: 31,
        y: 58
      },

      {
        x: 69,
        y: 58
      }
    ],

    4: [
      {
        x: 34,
        y: 23
      },

      {
        x: 66,
        y: 23
      },

      {
        x: 34,
        y: 63
      },

      {
        x: 66,
        y: 63
      }
    ],

    5: [
      {
        x: 25,
        y: 21
      },

      {
        x: 50,
        y: 17
      },

      {
        x: 75,
        y: 21
      },

      {
        x: 36,
        y: 60
      },

      {
        x: 64,
        y: 60
      }
    ]
  };


  /* =======================================================
     POSITION PAR RÔLE
     ======================================================= */

  function getRoleZone(role) {
    switch (role) {
      case "ATT":
        return {
          minY: 15,
          maxY: 33
        };

      case "MIL":
        return {
          minY: 43,
          maxY: 61
        };

      case "DEF":
        return {
          minY: 65,
          maxY: 78
        };

      case "GB":
        return {
          minY: 78,
          maxY: 84
        };

      default:
        return {
          minY: 43,
          maxY: 61
        };
    }
  }


  function distributeHorizontally(
    count,
    minX = 18,
    maxX = 82
  ) {
    if (count <= 1) {
      return [50];
    }

    const space =
      (maxX - minX) /
      (count - 1);

    return Array.from(
      { length: count },
      (_, index) =>
        minX +
        space * index
    );
  }


  function buildRoleBasedLayout(players) {
    const groups = {
      ATT: [],
      MIL: [],
      DEF: [],
      GB: []
    };

    players.forEach(player => {
      groups[
        normalizeRole(player)
      ].push(player);
    });

    const positions = [];

    Object.entries(groups).forEach(
      ([role, group]) => {
        if (!group.length) {
          return;
        }

        const zone =
          getRoleZone(role);

        const xs =
          distributeHorizontally(
            group.length,
            group.length >= 3
              ? 20
              : 28,
            group.length >= 3
              ? 80
              : 72
          );

        const y =
          (zone.minY +
            zone.maxY) /
          2;

        group.forEach(
          (player, index) => {
            positions.push({
              player,
              role,
              x: xs[index],
              y
            });
          }
        );
      }
    );

    return positions;
  }


  function buildVisualLayout(players) {
    if (!players.length) {
      return [];
    }

    /*
     * Pour 5 joueurs, on privilégie réellement
     * les rôles afin que les attaquants soient
     * en haut et les milieux plus bas.
     */

    if (
      players.length >= 3
    ) {
      return buildRoleBasedLayout(
        players
      );
    }

    const layout =
      layouts[
        players.length
      ] || layouts[1];

    return players.map(
      (player, index) => ({
        player,

        role:
          normalizeRole(player),

        x:
          layout[index]?.x ??
          50,

        y:
          layout[index]?.y ??
          50
      })
    );
  }


  /* =======================================================
     POSITION D'UN JOUEUR
     ======================================================= */

  function getPitchPositionStyle(
    position
  ) {
    return {
      left:
        `${position.x}%`,

      top:
        `${position.y}%`
    };
  }


  /* =======================================================
     DESCRIPTION DE LA FORMATION
     ======================================================= */

  function getLayoutDescription(
    players
  ) {
    if (!players.length) {
      return "Aucun joueur sur le terrain.";
    }

    const counts = {
      ATT: 0,
      MIL: 0,
      DEF: 0,
      GB: 0
    };

    players.forEach(player => {
      counts[
        normalizeRole(player)
      ]++;
    });

    const parts = [];

    if (counts.ATT) {
      parts.push(
        `${counts.ATT} attaquant${
          counts.ATT > 1
            ? "s"
            : ""
        }`
      );
    }

    if (counts.MIL) {
      parts.push(
        `${counts.MIL} milieu${
          counts.MIL > 1
            ? "x"
            : ""
        }`
      );
    }

    if (counts.DEF) {
      parts.push(
        `${counts.DEF} défenseur${
          counts.DEF > 1
            ? "s"
            : ""
        }`
      );
    }

    if (counts.GB) {
      parts.push(
        `${counts.GB} gardien${
          counts.GB > 1
            ? "s"
            : ""
        }`
      );
    }

    if (!parts.length) {
      return "Placement automatique.";
    }

    return (
      "Sélection automatique · " +
      parts.join(" · ")
    );
  }


  /* =======================================================
     API PUBLIQUE
     ======================================================= */

  function preparePitch(
    collection,
    limit =
      config.pitchPlayerLimit || 5
  ) {
    const players =
      selectPitchPlayers(
        collection,
        limit
      );

    const layout =
      buildVisualLayout(
        players
      );

    return {
      players,

      layout,

      description:
        getLayoutDescription(
          players
        )
    };
  }


  return {
    normalizeRole,

    selectPitchPlayers,

    buildVisualLayout,

    getPitchPositionStyle,

    getLayoutDescription,

    preparePitch
  };
})();
