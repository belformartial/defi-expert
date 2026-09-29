/* =========================================================
   DÉFI EXPERT
   Créé par Belfort
   ========================================================= */

/* =========================================================
   CONFIGURATION SUPABASE
   ========================================================= */

const SUPABASE_URL =
  "https://snmmtigmbrrqdcesdzwg.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_Hlb0Qbn-307abqSvRmyB8w_FbcsT3ze";


/* =========================================================
   CONFIGURATION DU JEU
   ========================================================= */

const GAME_CONFIG = {
  maxLives: 3,

  baseTime: 5000,

  minTime: 1800,

  timeDecreasePerLevel: 180,

  pointsPerCorrect: 100,

  comboBonus: 25,

  levelEvery: 5,

  maxAnswers: 6,

  leaderboardPageSize: 1000
};


/* =========================================================
   SYMBOLES
   ========================================================= */

const SYMBOLS = [
  "★",
  "◆",
  "●",
  "▲",
  "■",
  "✚",
  "✦",
  "♥"
];


/* =========================================================
   ÉTAT DU JEU
   ========================================================= */

const state = {

  playerName: "",

  playerKey: "",

  score: 0,

  bestScore: 0,

  combo: 0,

  maxCombo: 0,

  level: 1,

  lives: GAME_CONFIG.maxLives,

  target: "",

  answers: [],

  correctAnswer: "",

  timer: null,

  timerStartedAt: 0,

  timerDuration: GAME_CONFIG.baseTime,

  gameRunning: false,

  answerLocked: false

};


/* =========================================================
   OUTILS DOM
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   NORMALISATION DU PSEUDO
   ========================================================= */

function normalizePlayerName(name) {

  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .substring(0, 20);

}


/* =========================================================
   GÉNÉRATION DE PLAYER KEY
   ========================================================= */

function getPlayerKeyForName(playerName) {

  const normalizedName =
    normalizePlayerName(playerName);

  const storageKey =
    "defi_expert_player_keys";

  let players = {};

  try {

    players = JSON.parse(
      localStorage.getItem(storageKey) || "{}"
    );

  } catch (error) {

    players = {};

  }


  const mapKey =
    normalizedName.toLowerCase();


  if (players[mapKey]) {

    return players[mapKey];

  }


  let newKey = "";


  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {

    newKey = crypto.randomUUID();

  } else {

    newKey =
      "player-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 14);

  }


  players[mapKey] = newKey;


  try {

    localStorage.setItem(
      storageKey,
      JSON.stringify(players)
    );

  } catch (error) {
    // Le jeu continue même si localStorage est indisponible.
  }


  return newKey;
}


/* =========================================================
   NAVIGATION ENTRE LES ÉCRANS
   ========================================================= */

function showScreen(screenId) {

  const screens =
    document.querySelectorAll(".screen");

  screens.forEach(screen => {

    screen.classList.remove("active");

  });


  const target =
    $(screenId);

  if (!target) {
    return;
  }


  target.classList.add("active");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   MESSAGE D'ERREUR DU PSEUDO
   ========================================================= */

function showNameError(message) {

  const error =
    $("nameError");

  if (!error) {
    return;
  }


  error.textContent =
    message || "";

  error.style.display =
    message ? "block" : "none";

}


/* =========================================================
   NETTOYER LE PSEUDO
   ========================================================= */

function clearPlayerName() {

  const input =
    $("playerName");

  if (!input) {
    return;
  }


  input.value = "";

  showNameError("");

  input.focus();

}


/* =========================================================
   DÉMARRER UNE PARTIE
   ========================================================= */

function startGame() {

  const input =
    $("playerName");

  if (!input) {
    return;
  }


  const playerName =
    normalizePlayerName(input.value);


  /* IMPORTANT :
     Le joueur doit obligatoirement entrer
     son prénom ou son pseudo. */

  if (!playerName) {

    showNameError(
      "Entre ton prénom ou ton pseudo pour commencer."
    );

    input.focus();

    return;

  }


  if (playerName.length < 2) {

    showNameError(
      "Ton prénom ou ton pseudo doit contenir au moins 2 caractères."
    );

    input.focus();

    return;

  }


  /* Tout est valide */

  showNameError("");


  state.playerName =
    playerName;

  state.playerKey =
    getPlayerKeyForName(playerName);


  state.score = 0;

  state.bestScore = 0;

  state.combo = 0;

  state.maxCombo = 0;

  state.level = 1;

  state.lives =
    GAME_CONFIG.maxLives;

  state.target = "";

  state.answers = [];

  state.correctAnswer = "";

  state.gameRunning = true;

  state.answerLocked = false;


  $("gamePlayer").textContent =
    state.playerName;


  updateGameUI();


  showScreen("game");


  nextQuestion();

}


/* =========================================================
   CALCUL DU TEMPS
   ========================================================= */

function getTimeForLevel() {

  const duration =
    GAME_CONFIG.baseTime -
    (
      (state.level - 1) *
      GAME_CONFIG.timeDecreasePerLevel
    );


  return Math.max(
    GAME_CONFIG.minTime,
    duration
  );

}


/* =========================================================
   NOMBRE DE RÉPONSES
   ========================================================= */

function getAnswerCount() {

  return Math.min(
    3 + Math.floor(
      (state.level - 1) / 3
    ),
    GAME_CONFIG.maxAnswers
  );

}


/* =========================================================
   MÉLANGE
   ========================================================= */

function shuffle(array) {

  const result =
    [...array];


  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      result[i],
      result[j]
    ] =
    [
      result[j],
      result[i]
    ];

  }


  return result;

}


/* =========================================================
   CRÉER UNE QUESTION
   ========================================================= */

function createQuestion() {

  const target =
    SYMBOLS[
      Math.floor(
        Math.random() * SYMBOLS.length
      )
    ];


  const answerCount =
    getAnswerCount();


  const wrongSymbols =
    shuffle(
      SYMBOLS.filter(
        symbol =>
          symbol !== target
      )
    );


  const answers =
    shuffle([
      target,
      ...wrongSymbols.slice(
        0,
        answerCount - 1
      )
    ]);


  state.target =
    target;

  state.correctAnswer =
    target;

  state.answers =
    answers;

}


/* =========================================================
   AFFICHER UNE QUESTION
   ========================================================= */

function nextQuestion() {

  if (!state.gameRunning) {
    return;
  }


  state.answerLocked =
    false;


  createQuestion();


  const target =
    $("targetSymbol");

  if (target) {

    target.textContent =
      state.target;

  }


  const status =
    $("statusText");

  if (status) {

    status.textContent =
      "Choisis le symbole correspondant.";

  }


  renderAnswers();


  startTimer();

  updateGameUI();

}


/* =========================================================
   AFFICHER LES RÉPONSES
   ========================================================= */

function renderAnswers() {

  const board =
    $("board");

  if (!board) {
    return;
  }


  board.innerHTML = "";


  state.answers.forEach(
    (symbol, index) => {

      const button =
        document.createElement("button");


      button.type =
        "button";

      button.className =
        "answer-btn";

      button.textContent =
        symbol;

      button.setAttribute(
        "aria-label",
        "Réponse " + (index + 1)
      );


      button.addEventListener(
        "click",
        () => {

          handleAnswer(
            symbol,
            button
          );

        }
      );


      board.appendChild(button);

    }
  );

}


/* =========================================================
   CHRONOMÈTRE
   ========================================================= */

function startTimer() {

  stopTimer();


  state.timerDuration =
    getTimeForLevel();

  state.timerStartedAt =
    Date.now();


  const timerBar =
    $("timerBar");


  if (timerBar) {

    timerBar.style.width =
      "100%";

  }


  state.timer =
    setInterval(
      updateTimer,
      30
    );

}


/* =========================================================
   METTRE À JOUR LE CHRONOMÈTRE
   ========================================================= */

function updateTimer() {

  if (!state.gameRunning) {
    return;
  }


  const elapsed =
    Date.now() -
    state.timerStartedAt;


  const remaining =
    Math.max(
      0,
      state.timerDuration - elapsed
    );


  const percent =
    (
      remaining /
      state.timerDuration
    ) * 100;


  const timerBar =
    $("timerBar");


  if (timerBar) {

    timerBar.style.width =
      percent + "%";

  }


  if (remaining <= 0) {

    stopTimer();

    handleTimeout();

  }

}


/* =========================================================
   ARRÊTER LE CHRONOMÈTRE
   ========================================================= */

function stopTimer() {

  if (state.timer) {

    clearInterval(
      state.timer
    );

    state.timer =
      null;

  }

}


/* =========================================================
   RÉPONSE DU JOUEUR
   ========================================================= */

function handleAnswer(
  selectedSymbol,
  clickedButton
) {

  if (
    !state.gameRunning ||
    state.answerLocked
  ) {
    return;
  }


  state.answerLocked =
    true;


  stopTimer();


  const buttons =
    document.querySelectorAll(
      ".answer-btn"
    );


  buttons.forEach(button => {

    button.disabled =
      true;

  });


  if (
    selectedSymbol ===
    state.correctAnswer
  ) {

    handleCorrect(
      clickedButton
    );

  } else {

    handleWrong(
      clickedButton
    );

  }

}


/* =========================================================
   BONNE RÉPONSE
   ========================================================= */

function handleCorrect(button) {

  state.combo += 1;


  state.maxCombo =
    Math.max(
      state.maxCombo,
      state.combo
    );


  const basePoints =
    GAME_CONFIG.pointsPerCorrect *
    state.level;


  const comboBonus =
    Math.max(
      0,
      state.combo - 1
    ) *
    GAME_CONFIG.comboBonus;


  const gained =
    basePoints +
    comboBonus;


  state.score +=
    gained;


  if (button) {

    button.classList.add(
      "correct"
    );

  }


  const status =
    $("statusText");

  if (status) {

    status.textContent =
      "+" + gained + " points";

  }


  flashScreen(
    "correct"
  );


  updateGameUI();


  setTimeout(
    () => {

      if (!state.gameRunning) {
        return;
      }


      updateLevel();


      nextQuestion();

    },
    280
  );

}


/* =========================================================
   MAUVAISE RÉPONSE
   ========================================================= */

function handleWrong(button) {

  state.lives -= 1;

  state.combo = 0;


  if (button) {

    button.classList.add(
      "wrong"
    );

  }


  const status =
    $("statusText");

  if (status) {

    status.textContent =
      "Mauvaise réponse";

  }


  flashScreen(
    "wrong"
  );


  updateGameUI();


  if (state.lives <= 0) {

    setTimeout(
      endGame,
      350
    );

    return;

  }


  setTimeout(
    () => {

      if (!state.gameRunning) {
        return;
      }

      nextQuestion();

    },
    400
  );

}


/* =========================================================
   TEMPS ÉCOULÉ
   ========================================================= */

function handleTimeout() {

  if (
    !state.gameRunning ||
    state.answerLocked
  ) {
    return;
  }


  state.answerLocked =
    true;


  state.lives -= 1;

  state.combo = 0;


  const status =
    $("statusText");


  if (status) {

    status.textContent =
      "Temps écoulé !";

  }


  flashScreen(
    "wrong"
  );


  updateGameUI();


  if (state.lives <= 0) {

    setTimeout(
      endGame,
      350
    );

    return;

  }


  setTimeout(
    () => {

      if (!state.gameRunning) {
        return;
      }

      nextQuestion();

    },
    450
  );

}


/* =========================================================
   NIVEAU
   ========================================================= */

function updateLevel() {

  const newLevel =
    Math.floor(
      state.score /
      (
        GAME_CONFIG.pointsPerCorrect *
        GAME_CONFIG.levelEvery
      )
    ) + 1;


  if (newLevel > state.level) {

    state.level =
      newLevel;


    const banner =
      $("survivalBanner");


    if (banner) {

      banner.textContent =
        "NIVEAU " +
        state.level;

      banner.classList.add(
        "level-up"
      );


      setTimeout(
        () => {

          banner.classList.remove(
            "level-up"
          );

          banner.textContent =
            "MODE SURVIE";

        },
        900
      );

    }

  }

}


/* =========================================================
   INTERFACE DU JEU
   ========================================================= */

function updateGameUI() {

  const score =
    $("score");

  const level =
    $("level");

  const combo =
    $("combo");

  const hearts =
    $("hearts");


  if (score) {

    score.textContent =
      state.score;

  }


  if (level) {

    level.textContent =
      state.level;

  }


  if (combo) {

    combo.textContent =
      state.combo;

  }


  if (hearts) {

    const full =
      "❤️".repeat(
        Math.max(
          0,
          state.lives
        )
      );

    const empty =
      "🖤".repeat(
        Math.max(
          0,
          GAME_CONFIG.maxLives -
          state.lives
        )
      );


    hearts.textContent =
      full + empty;

  }

}


/* =========================================================
   EFFET VISUEL
   ========================================================= */

function flashScreen(type) {

  const flash =
    $("flash");

  if (!flash) {
    return;
  }


  flash.className =
    "flash " + type;


  requestAnimationFrame(
    () => {

      flash.classList.add(
        "show"
      );

    }
  );


  setTimeout(
    () => {

      flash.classList.remove(
        "show"
      );

    },
    180
  );

}


/* =========================================================
   TERMINER LA PARTIE
   ========================================================= */

async function endGame() {

  if (!state.gameRunning) {
    return;
  }


  state.gameRunning =
    false;

  state.answerLocked =
    true;


  stopTimer();


  const previousBest =
    await getPlayerBestScore();


  state.bestScore =
    Math.max(
      previousBest,
      state.score
    );


  const isNewRecord =
    state.score >
    previousBest;


  $("finalPlayer").textContent =
    state.playerName;


  $("finalScore").textContent =
    state.score;


  $("finalBest").textContent =
    state.bestScore;


  $("finalCombo").textContent =
    state.maxCombo;


  $("finalLevel").textContent =
    state.level;


  const newRecord =
    $("newRecord");


  if (newRecord) {

    newRecord.style.display =
      isNewRecord
        ? "block"
        : "none";

  }


  showScreen(
    "gameover"
  );


  /*
    On attend la sauvegarde afin de garantir
    que le score est envoyé à Supabase avant
    de recharger le classement.
  */

  await saveScore();


}


/* =========================================================
   OBTENIR LE MEILLEUR SCORE DU JOUEUR
   ========================================================= */

async function getPlayerBestScore() {

  if (!state.playerKey) {
    return 0;
  }


  try {

    const url =
      SUPABASE_URL +
      "/rest/v1/scores" +
      "?select=score" +
      "&player_key=eq." +
      encodeURIComponent(
        state.playerKey
      ) +
      "&limit=1";


    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {
            "apikey": SUPABASE_KEY,

            "Authorization":
              "Bearer " +
              SUPABASE_KEY
          }
        }
      );


    if (!response.ok) {

      return 0;

    }


    const rows =
      await response.json();


    if (
      Array.isArray(rows) &&
      rows.length > 0
    ) {

      return Number(
        rows[0].score
      ) || 0;

    }

  } catch (error) {

    console.error(
      "ERREUR RECHERCHE MEILLEUR SCORE :",
      error
    );

  }


  return 0;

}


/* =========================================================
   SAUVEGARDER LE SCORE
   ========================================================= */

async function saveScore() {

  if (
    !state.playerName ||
    !state.playerKey
  ) {

    return false;

  }


  try {

    /*
      On cherche d'abord le joueur.
    */

    const searchUrl =
      SUPABASE_URL +
      "/rest/v1/scores" +
      "?select=id,player_name,player_key,score,max_combo,level" +
      "&player_key=eq." +
      encodeURIComponent(
        state.playerKey
      ) +
      "&limit=1";


    const searchResponse =
      await fetch(
        searchUrl,
        {
          method: "GET",

          headers: {

            "apikey":
              SUPABASE_KEY,

            "Authorization":
              "Bearer " +
              SUPABASE_KEY,

            "Accept":
              "application/json"

          }
        }
      );


    if (!searchResponse.ok) {

      const errorText =
        await searchResponse.text();

      console.error(
        "ERREUR RECHERCHE JOUEUR :",
        searchResponse.status,
        errorText
      );

      return false;

    }


    const rows =
      await searchResponse.json();


    /*
      Le joueur existe déjà.
    */

    if (
      Array.isArray(rows) &&
      rows.length > 0
    ) {

      const existing =
        rows[0];


      const oldScore =
        Number(
          existing.score
        ) || 0;


      /*
        On ne remplace le score que si
        le nouveau score est supérieur.
      */

      if (
        state.score <=
        oldScore
      ) {

        state.bestScore =
          oldScore;

        return true;

      }


      const updateUrl =
        SUPABASE_URL +
        "/rest/v1/scores" +
        "?id=eq." +
        encodeURIComponent(
          existing.id
        );


      const updateResponse =
        await fetch(
          updateUrl,
          {
            method: "PATCH",

            headers: {

              "apikey":
                SUPABASE_KEY,

              "Authorization":
                "Bearer " +
                SUPABASE_KEY,

              "Content-Type":
                "application/json",

              "Prefer":
                "return=minimal"

            },

            body:
              JSON.stringify({

                player_name:
                  state.playerName,

                player_key:
                  state.playerKey,

                score:
                  state.score,

                max_combo:
                  state.maxCombo,

                level:
                  state.level,

                updated_at:
                  new Date().toISOString()

              })

          }
        );


      if (!updateResponse.ok) {

        const errorText =
          await updateResponse.text();

        console.error(
          "ERREUR MISE À JOUR SCORE :",
          updateResponse.status,
          errorText
        );

        return false;

      }


      state.bestScore =
        state.score;


      return true;

    }


    /*
      Nouveau joueur :
      on crée une nouvelle ligne.
    */

    const insertUrl =
      SUPABASE_URL +
      "/rest/v1/scores";


    const insertResponse =
      await fetch(
        insertUrl,
        {
          method: "POST",

          headers: {

            "apikey":
              SUPABASE_KEY,

            "Authorization":
              "Bearer " +
              SUPABASE_KEY,

            "Content-Type":
              "application/json",

            "Prefer":
              "return=minimal"

          },

          body:
            JSON.stringify({

              player_name:
                state.playerName,

              player_key:
                state.playerKey,

              score:
                state.score,

              max_combo:
                state.maxCombo,

              level:
                state.level,

              created_at:
                new Date().toISOString(),

              updated_at:
                new Date().toISOString()

            })

        }
      );


    if (!insertResponse.ok) {

      const errorText =
        await insertResponse.text();

      console.error(
        "ERREUR INSERTION SCORE :",
        insertResponse.status,
        errorText
      );

      return false;

    }


    state.bestScore =
      state.score;


    return true;

  } catch (error) {

    console.error(
      "ERREUR SUPABASE :",
      error
    );

    return false;

  }

}


/* =========================================================
   CHARGER TOUS LES SCORES
   ========================================================= */

async function loadLeaderboard() {

  const list =
    $("leaderboardList");

  const myRank =
    $("myRank");


  if (list) {

    list.innerHTML =
      `
        <div class="loading">
          Chargement du classement...
        </div>
      `;

  }


  if (myRank) {

    myRank.textContent =
      "";

  }


  try {

    let allRows = [];

    let offset = 0;

    const pageSize =
      GAME_CONFIG.leaderboardPageSize;


    /*
      On récupère les scores par blocs
      pour ne pas limiter le classement
      aux 50 premiers joueurs.
    */

    while (true) {

      const url =
        SUPABASE_URL +
        "/rest/v1/scores" +
        "?select=id,player_name,player_key,score,max_combo,level,created_at,updated_at" +
        "&order=score.desc" +
        "&offset=" +
        offset +
        "&limit=" +
        pageSize;


      const response =
        await fetch(
          url,
          {
            method: "GET",

            headers: {

              "apikey":
                SUPABASE_KEY,

              "Authorization":
                "Bearer " +
                SUPABASE_KEY,

              "Accept":
                "application/json"

            }
          }
        );


      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          "Supabase " +
          response.status +
          " : " +
          errorText
        );

      }


      const rows =
        await response.json();


      if (
        !Array.isArray(rows) ||
        rows.length === 0
      ) {

        break;

      }


      allRows =
        allRows.concat(rows);


      if (
        rows.length <
        pageSize
      ) {

        break;

      }


      offset +=
        pageSize;


      /*
        Sécurité contre une boucle infinie.
      */

      if (offset > 100000) {

        break;

      }

    }


    renderLeaderboard(
      allRows
    );


  } catch (error) {

    console.error(
      "ERREUR CLASSEMENT :",
      error
    );


    if (list) {

      list.innerHTML =
        `
          <div class="loading">
            Impossible de charger le classement.
            <br>
            Vérifie ta connexion puis actualise.
          </div>
        `;

    }

  }

}


/* =========================================================
   AFFICHER LE CLASSEMENT
   ========================================================= */

function renderLeaderboard(rows) {

  const list =
    $("leaderboardList");

  const myRank =
    $("myRank");


  if (!list) {
    return;
  }


  list.innerHTML =
    "";


  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {

    list.innerHTML =
      `
        <div class="loading">
          Aucun score pour le moment.
        </div>
      `;

    return;

  }


  /*
    Sécurité :
    classement toujours trié du plus grand
    score au plus petit.
  */

  const sorted =
    [...rows].sort(
      (a, b) =>
        (Number(b.score) || 0) -
        (Number(a.score) || 0)
    );


  let playerPosition =
    null;


  sorted.forEach(
    (row, index) => {

      const rank =
        index + 1;


      const item =
        document.createElement("div");


      item.className =
        "leaderboard-row";


      if (
        state.playerKey &&
        row.player_key ===
        state.playerKey
      ) {

        item.classList.add(
          "current-player"
        );

        playerPosition =
          rank;

      }


      let medal = "";

      if (rank === 1) {
        medal = "🥇";
      } else if (rank === 2) {
        medal = "🥈";
      } else if (rank === 3) {
        medal = "🥉";
      }


      item.innerHTML =
        `
          <span class="rank">
            ${medal || rank}
          </span>

          <span class="leader-name">
            ${escapeHtml(
              row.player_name ||
              "Joueur"
            )}
          </span>

          <strong class="leader-score">
            ${Number(
              row.score
            ) || 0}
          </strong>
        `;


      list.appendChild(
        item
      );

    }
  );


  if (
    myRank &&
    playerPosition
  ) {

    myRank.textContent =
      "Ta position : #" +
      playerPosition;

  }

}


/* =========================================================
   PROTECTION DU HTML
   ========================================================= */

function escapeHtml(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   QUITTER LA PARTIE
   ========================================================= */

function quitGame() {

  const confirmed =
    window.confirm(
      "Quitter cette partie ?"
    );


  if (!confirmed) {
    return;
  }


  state.gameRunning =
    false;

  state.answerLocked =
    true;


  stopTimer();


  showScreen(
    "home"
  );

}


/* =========================================================
   REJOUER
   ========================================================= */

function replayGame() {

  if (!state.playerName) {

    showScreen(
      "home"
    );

    return;

  }


  startGameWithExistingPlayer();

}


/* =========================================================
   REJOUER AVEC LE MÊME JOUEUR
   ========================================================= */

function startGameWithExistingPlayer() {

  const playerName =
    state.playerName;


  state.playerKey =
    getPlayerKeyForName(
      playerName
    );


  state.score = 0;

  state.combo = 0;

  state.maxCombo = 0;

  state.level = 1;

  state.lives =
    GAME_CONFIG.maxLives;

  state.target = "";

  state.answers = [];

  state.correctAnswer = "";

  state.gameRunning =
    true;

  state.answerLocked =
    false;


  $("gamePlayer").textContent =
    playerName;


  updateGameUI();


  showScreen(
    "game"
  );


  nextQuestion();

}


/* =========================================================
   CHANGER DE JOUEUR
   ========================================================= */

function changePlayer() {

  state.gameRunning =
    false;

  state.answerLocked =
    true;


  stopTimer();


  showScreen(
    "home"
  );


  const input =
    $("playerName");


  if (input) {

    input.value =
      "";

    input.focus();

  }


  showNameError("");

}


/* =========================================================
   ÉVÉNEMENT DOM
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* -------------------------
       COMMENCER
    ------------------------- */

    const startBtn =
      $("startBtn");


    if (startBtn) {

      startBtn.addEventListener(
        "click",
        startGame
      );

    }


    /* -------------------------
       ENTRÉE PSEUDO
    ------------------------- */

    const playerName =
      $("playerName");


    if (playerName) {

      playerName.addEventListener(
        "input",
        () => {

          showNameError("");

        }
      );


      playerName.addEventListener(
        "keydown",
        event => {

          if (
            event.key ===
            "Enter"
          ) {

            event.preventDefault();

            startGame();

          }

        }
      );

    }


    /* -------------------------
       EFFACER PSEUDO
    ------------------------- */

    const clearName =
      $("clearName");


    if (clearName) {

      clearName.addEventListener(
        "click",
        clearPlayerName
      );

    }


    /* -------------------------
       COMMENT JOUER
    ------------------------- */

    const howBtn =
      $("howBtn");


    if (howBtn) {

      howBtn.addEventListener(
        "click",
        () => {

          showScreen(
            "how"
          );

        }
      );

    }


    /* -------------------------
       CLASSEMENT
    ------------------------- */

    const leaderboardBtn =
      $("leaderboardBtn");


    if (leaderboardBtn) {

      leaderboardBtn.addEventListener(
        "click",
        async () => {

          showScreen(
            "leaderboard"
          );

          await loadLeaderboard();

        }
      );

    }


    /* -------------------------
       À PROPOS
    ------------------------- */

    const aboutBtn =
      $("aboutBtn");


    if (aboutBtn) {

      aboutBtn.addEventListener(
        "click",
        () => {

          showScreen(
            "about"
          );

        }
      );

    }


    /* -------------------------
       ACTUALISER CLASSEMENT
    ------------------------- */

    const refresh =
      $("refreshLeaderboard");


    if (refresh) {

      refresh.addEventListener(
        "click",
        loadLeaderboard
      );

    }


    /* -------------------------
       RETOUR
    ------------------------- */

    document
      .querySelectorAll(
        "[data-back]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const destination =
                button.dataset.back;

              showScreen(
                destination
              );

            }
          );

        }
      );


    /* -------------------------
       QUITTER
    ------------------------- */

    const quitBtn =
      $("quitBtn");


    if (quitBtn) {

      quitBtn.addEventListener(
        "click",
        quitGame
      );

    }


    /* -------------------------
       REJOUER
    ------------------------- */

    const againBtn =
      $("againBtn");


    if (againBtn) {

      againBtn.addEventListener(
        "click",
        replayGame
      );

    }


    /* -------------------------
       CHANGER DE JOUEUR
    ------------------------- */

    const changePlayerBtn =
      $("changePlayerBtn");


    if (changePlayerBtn) {

      changePlayerBtn.addEventListener(
        "click",
        changePlayer
      );

    }


    /* -------------------------
       ACCUEIL
    ------------------------- */

    const homeBtn =
      $("homeBtn");


    if (homeBtn) {

      homeBtn.addEventListener(
        "click",
        () => {

          state.gameRunning =
            false;

          state.answerLocked =
            true;

          stopTimer();

          showScreen(
            "home"
          );

        }
      );

    }


    /* -------------------------
       ÉTAT INITIAL
    ------------------------- */

    showScreen(
      "home"
    );


    /*
      Si un ancien pseudo existe déjà
      dans le navigateur, on peut le
      proposer dans le champ, mais
      JAMAIS démarrer automatiquement
      la partie.
    */

    try {

      const savedName =
        localStorage.getItem(
          "defi_expert_last_name"
        );


      if (
        savedName &&
        playerName
      ) {

        playerName.value =
          savedName;

      }

    } catch (error) {
      // Rien à faire.
    }

  }
);


/* =========================================================
   SAUVEGARDER LE DERNIER PSEUDO
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if (!state.playerName) {
      return;
    }


    try {

      localStorage.setItem(
        "defi_expert_last_name",
        state.playerName
      );

    } catch (error) {
      // Rien à faire.
    }

  }
);
