/* =========================================================
   DÉFI EXPERT
   Créé par Belfort
   Version complète avec classement partagé Supabase
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
  "https://snmmtigmbrrqdcesdzwg.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_Hlb0Qbn-307abqSvRmyB8w_FbcsT3ze";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const MAX_LEADERBOARD = 50;
const GAME_TIME = 30;

const SYMBOLS = [
  "◆",
  "●",
  "▲",
  "■",
  "★",
  "✚",
  "⬟",
  "⬢"
];


/* =========================================================
   QUESTIONS
   ========================================================= */

const QUESTIONS = [
  {
    question: "Combien font 7 × 8 ?",
    answer: "56"
  },
  {
    question: "Quelle est la capitale de la France ?",
    answer: "PARIS"
  },
  {
    question: "Combien y a-t-il de continents ?",
    answer: "7"
  },
  {
    question: "Quelle planète est appelée la planète rouge ?",
    answer: "MARS"
  },
  {
    question: "Combien font 12 × 12 ?",
    answer: "144"
  },
  {
    question: "Quel est le symbole chimique de l'eau ?",
    answer: "H2O"
  },
  {
    question: "Combien de côtés possède un triangle ?",
    answer: "3"
  },
  {
    question: "Quelle est la plus grande planète du système solaire ?",
    answer: "JUPITER"
  },
  {
    question: "Combien font 100 ÷ 4 ?",
    answer: "25"
  },
  {
    question: "Quel organe pompe le sang dans le corps humain ?",
    answer: "COEUR"
  },
  {
    question: "Quelle est la capitale de la République centrafricaine ?",
    answer: "BANGUI"
  },
  {
    question: "Combien font 15 + 27 ?",
    answer: "42"
  }
];


/* =========================================================
   ÉTAT DU JEU
   ========================================================= */

const state = {
  player: "",
  playerKey: "",
  score: 0,
  level: 1,
  combo: 0,
  maxCombo: 0,
  lives: 3,
  timeLeft: GAME_TIME,
  currentQuestion: null,
  currentAnswer: null,
  timer: null,
  gameRunning: false
};


/* =========================================================
   OUTIL DOM
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   SUPABASE
   ========================================================= */

function supabaseConfigured() {
  return (
    SUPABASE_URL &&
    SUPABASE_KEY &&
    SUPABASE_URL.includes("supabase.co") &&
    SUPABASE_KEY.startsWith("sb_")
  );
}


function supabaseHeaders(extra = {}) {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json",
    ...extra
  };
}


/* =========================================================
   NORMALISATION DU PSEUDO
   ========================================================= */

function normalizePlayerName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 30);
}


/* =========================================================
   IDENTIFIANT UNIQUE DU JOUEUR
   =========================================================

   IMPORTANT :

   On ne garde PAS une seule clé pour tout le téléphone.

   Chaque pseudo utilisé sur un appareil possède sa propre clé.

   Exemple :

   Téléphone A :
   Belfort -> clé A
   Kevin   -> clé B

   Téléphone B :
   Sarah   -> clé C
   Kevin   -> clé D

   Ainsi chaque participation peut avoir sa propre ligne
   dans le classement Supabase.
   ========================================================= */

function getPlayerKeyForName(playerName) {

  const normalizedName =
    normalizePlayerName(playerName);

  const storageKey =
    "defi_expert_player_keys";

  let players = {};

  try {

    players =
      JSON.parse(
        localStorage.getItem(storageKey) || "{}"
      );

  } catch (error) {

    players = {};

  }


  const mapKey =
    normalizedName.toLowerCase();


  /*
    Le pseudo possède déjà une clé
    sur cet appareil.
  */

  if (players[mapKey]) {

    return players[mapKey];

  }


  /*
    Créer une nouvelle clé unique.
  */

  let newKey = "";


  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {

    newKey =
      crypto.randomUUID();

  } else {

    newKey =
      "player-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 14);

  }


  players[mapKey] =
    newKey;


  try {

    localStorage.setItem(
      storageKey,
      JSON.stringify(players)
    );

  } catch (error) {

    console.warn(
      "Impossible de sauvegarder player_key localement."
    );

  }


  return newKey;
}


/* =========================================================
   ENREGISTREMENT DU SCORE
   ========================================================= */

async function saveScoreToSupabase() {

  if (!supabaseConfigured()) {

    console.error(
      "Supabase n'est pas configuré."
    );

    return false;
  }


  const playerName =
    normalizePlayerName(
      state.player
    );


  if (!playerName) {

    console.error(
      "Pseudo vide."
    );

    return false;
  }


  /*
    Une clé propre à ce pseudo
    sur cet appareil.
  */

  state.playerKey =
    getPlayerKeyForName(
      playerName
    );


  try {

    /* =====================================================
       1. CHERCHER SI CE JOUEUR EXISTE DÉJÀ
       ===================================================== */

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
          headers: supabaseHeaders()
        }
      );


    if (!searchResponse.ok) {

      const errorText =
        await searchResponse.text();

      console.error(
        "ERREUR RECHERCHE JOUEUR :",
        errorText
      );

      return false;
    }


    const existingRows =
      await searchResponse.json();


    /* =====================================================
       2. LE JOUEUR EXISTE
       ===================================================== */

    if (existingRows.length > 0) {

      const existing =
        existingRows[0];


      const oldScore =
        Number(
          existing.score || 0
        );


      const newScore =
        Number(
          state.score || 0
        );


      /*
        On conserve toujours
        le meilleur score.
      */

      if (
        newScore <= oldScore
      ) {

        console.log(
          "Ancien record conservé :",
          oldScore
        );

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

            headers:
              supabaseHeaders({
                "Prefer":
                  "return=representation"
              }),

            body:
              JSON.stringify({

                player_name:
                  playerName,

                player_key:
                  state.playerKey,

                score:
                  newScore,

                max_combo:
                  Number(
                    state.maxCombo || 0
                  ),

                level:
                  Number(
                    state.level || 1
                  ),

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
          errorText
        );

        return false;
      }


      console.log(
        "✓ Nouveau record enregistré :",
        playerName,
        newScore
      );


      return true;
    }


    /* =====================================================
       3. NOUVEAU JOUEUR
       ===================================================== */

    const insertUrl =
      SUPABASE_URL +
      "/rest/v1/scores";


    const insertData = {

      player_name:
        playerName,

      player_key:
        state.playerKey,

      score:
        Number(
          state.score || 0
        ),

      max_combo:
        Number(
          state.maxCombo || 0
        ),

      level:
        Number(
          state.level || 1
        ),

      updated_at:
        new Date().toISOString()

    };


    console.log(
      "Envoi du score à Supabase :",
      insertData
    );


    const insertResponse =
      await fetch(
        insertUrl,
        {
          method: "POST",

          headers:
            supabaseHeaders({
              "Prefer":
                "return=representation"
            }),

          body:
            JSON.stringify(
              insertData
            )
        }
      );


    if (!insertResponse.ok) {

      const errorText =
        await insertResponse.text();

      console.error(
        "ERREUR INSERTION SCORE :",
        errorText
      );

      return false;
    }


    const insertedData =
      await insertResponse.json();


    console.log(
      "================================="
    );

    console.log(
      "✓ NOUVEAU JOUEUR ENREGISTRÉ"
    );

    console.log(
      insertedData
    );

    console.log(
      "================================="
    );


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
   CHARGER LE CLASSEMENT MONDIAL
   ========================================================= */

async function loadLeaderboard() {

  if (!supabaseConfigured()) {

    console.error(
      "Supabase n'est pas configuré."
    );

    return [];
  }


  try {

    const url =
      SUPABASE_URL +
      "/rest/v1/scores" +
      "?select=id,player_name,player_key,score,max_combo,level,created_at,updated_at" +
      "&order=score.desc" +
      "&limit=" +
      MAX_LEADERBOARD;


    const response =
      await fetch(
        url,
        {
          method: "GET",
          headers: supabaseHeaders()
        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "ERREUR CHARGEMENT CLASSEMENT :",
        errorText
      );

      return [];
    }


    const data =
      await response.json();


    /*
      Sécurité :
      tri supplémentaire côté navigateur.
    */

    data.sort(
      (a, b) =>
        Number(
          b.score || 0
        ) -
        Number(
          a.score || 0
        )
    );


    return data;

  } catch (error) {

    console.error(
      "ERREUR RÉSEAU CLASSEMENT :",
      error
    );

    return [];
  }
}


/* =========================================================
   AFFICHER LE CLASSEMENT
   ========================================================= */

async function renderLeaderboard() {

  const list =
    $("leaderboardList");


  if (!list) {
    return;
  }


  list.innerHTML =
    '<div class="loading">Chargement du classement...</div>';


  const data =
    await loadLeaderboard();


  if (!data.length) {

    list.innerHTML =
      '<div class="empty">Aucun joueur enregistré.</div>';


    if ($("myRank")) {

      $("myRank").textContent =
        "";

    }


    return;
  }


  list.innerHTML = "";


  let currentPlayerRank =
    null;


  data.forEach(
    (player, index) => {

      const rank =
        index + 1;


      const row =
        document.createElement(
          "div"
        );


      row.className =
        "leaderboard-row";


      /*
        Reconnaître le joueur
        avec player_key.
      */

      if (
        state.playerKey &&
        player.player_key ===
        state.playerKey
      ) {

        row.classList.add(
          "current-player"
        );

        currentPlayerRank =
          rank;

      }


      const rankElement =
        document.createElement(
          "div"
        );


      rankElement.className =
        "rank";


      rankElement.textContent =
        "#" + rank;


      const nameElement =
        document.createElement(
          "div"
        );


      nameElement.className =
        "player-name";


      nameElement.textContent =
        player.player_name;


      const scoreElement =
        document.createElement(
          "div"
        );


      scoreElement.className =
        "player-score";


      scoreElement.textContent =
        Number(
          player.score || 0
        );


      row.appendChild(
        rankElement
      );


      row.appendChild(
        nameElement
      );


      row.appendChild(
        scoreElement
      );


      list.appendChild(
        row
      );

    }
  );


  if ($("myRank")) {

    if (
      currentPlayerRank
    ) {

      $("myRank").textContent =
        "Votre classement : #" +
        currentPlayerRank;

    } else {

      $("myRank").textContent =
        "";

    }

  }
}


/* =========================================================
   CLASSEMENT LOCAL DE SECOURS
   ========================================================= */

function saveLocalRanking() {

  try {

    const key =
      "defi_expert_local_ranking";


    const ranking =
      JSON.parse(
        localStorage.getItem(
          key
        ) || "[]"
      );


    const playerName =
      normalizePlayerName(
        state.player
      );


    if (!playerName) {
      return;
    }


    const existing =
      ranking.find(
        player =>
          player.player_key ===
          state.playerKey
      );


    if (existing) {

      if (
        Number(state.score) >
        Number(existing.score)
      ) {

        existing.score =
          Number(
            state.score
          );


        existing.max_combo =
          Number(
            state.maxCombo
          );


        existing.level =
          Number(
            state.level
          );

      }

    } else {

      ranking.push({

        player_name:
          playerName,

        player_key:
          state.playerKey,

        score:
          Number(
            state.score
          ),

        max_combo:
          Number(
            state.maxCombo
          ),

        level:
          Number(
            state.level
          ),

        updated_at:
          new Date().toISOString()

      });

    }


    ranking.sort(
      (a, b) =>
        Number(b.score) -
        Number(a.score)
    );


    localStorage.setItem(
      key,
      JSON.stringify(
        ranking.slice(
          0,
          MAX_LEADERBOARD
        )
      )
    );

  } catch (error) {

    console.error(
      "Erreur classement local :",
      error
    );
  }
}


/* =========================================================
   AFFICHER UN ÉCRAN
   ========================================================= */

function showScreen(id) {

  const screens = [
    "home",
    "how",
    "leaderboard",
    "about",
    "game",
    "gameover"
  ];


  screens.forEach(
    screenId => {

      const element =
        $(screenId);


      if (!element) {
        return;
      }


      element.style.display =
        screenId === id
          ? ""
          : "none";

    }
  );


  if (
    id === "leaderboard"
  ) {

    renderLeaderboard();

  }
}


/* =========================================================
   NOM DU JOUEUR
   ========================================================= */

function updatePlayerName() {

  const input =
    $("playerName");


  if (!input) {
    return;
  }


  const value =
    normalizePlayerName(
      input.value
    );


  if ($("startBtn")) {

    $("startBtn").disabled =
      value.length < 2;

  }


  if ($("nameError")) {

    $("nameError").textContent =
      "";

  }
}


/* =========================================================
   EFFACER LE NOM
   ========================================================= */

function clearPlayerName() {

  const input =
    $("playerName");


  if (input) {

    input.value = "";

    input.focus();

  }


  updatePlayerName();
}


/* =========================================================
   DÉMARRER LE JEU
   ========================================================= */

function startGame() {

  const input =
    $("playerName");


  const playerName =
    normalizePlayerName(
      input
        ? input.value
        : ""
    );


  if (
    playerName.length < 2
  ) {

    if ($("nameError")) {

      $("nameError").textContent =
        "Entre un pseudo d'au moins 2 caractères.";

    }

    return;
  }


  /*
    IMPORTANT :
    Chaque pseudo possède sa propre clé.
  */

  state.player =
    playerName;


  state.playerKey =
    getPlayerKeyForName(
      playerName
    );


  state.score = 0;

  state.level = 1;

  state.combo = 0;

  state.maxCombo = 0;

  state.lives = 3;

  state.timeLeft =
    GAME_TIME;

  state.gameRunning =
    true;


  if ($("gamePlayer")) {

    $("gamePlayer").textContent =
      playerName;

  }


  showScreen(
    "game"
  );


  updateGameDisplay();

  nextQuestion();

  startTimer();
}


/* =========================================================
   TIMER
   ========================================================= */

function startTimer() {

  stopTimer();


  state.timer =
    setInterval(
      () => {

        if (
          !state.gameRunning
        ) {

          return;

        }


        state.timeLeft--;


        updateTimer();


        if (
          state.timeLeft <= 0
        ) {

          endGame();

        }

      },
      1000
    );
}


/* =========================================================
   STOP TIMER
   ========================================================= */

function stopTimer() {

  if (state.timer) {

    clearInterval(
      state.timer
    );

    state.timer = null;

  }
}


/* =========================================================
   TIMER
   ========================================================= */

function updateTimer() {

  if ($("timerBar")) {

    const percentage =
      Math.max(
        0,
        (
          state.timeLeft /
          GAME_TIME
        ) * 100
      );


    $("timerBar").style.width =
      percentage + "%";

  }


  if ($("statusText")) {

    $("statusText").textContent =
      state.timeLeft +
      " s";

  }
}


/* =========================================================
   QUESTION SUIVANTE
   ========================================================= */

function nextQuestion() {

  if (
    !state.gameRunning
  ) {

    return;

  }


  const randomIndex =
    Math.floor(
      Math.random() *
      QUESTIONS.length
    );


  state.currentQuestion =
    QUESTIONS[
      randomIndex
    ];


  state.currentAnswer =
    state.currentQuestion.answer;


  if ($("targetSymbol")) {

    $("targetSymbol").textContent =
      SYMBOLS[
        Math.floor(
          Math.random() *
          SYMBOLS.length
        )
      ];

  }


  renderBoard();
}


/* =========================================================
   PLATEAU
   ========================================================= */

function renderBoard() {

  const board =
    $("board");


  if (!board) {
    return;
  }


  board.innerHTML = "";


  const answer =
    String(
      state.currentAnswer
    );


  const choices = [
    answer
  ];


  while (
    choices.length < 4
  ) {

    let fake;


    if (
      !isNaN(
        Number(answer)
      )
    ) {

      fake =
        String(
          Math.max(
            0,
            Number(answer) +
            Math.floor(
              Math.random() *
              21
            ) -
            10
          )
        );

    } else {

      fake =
        answer +
        Math.floor(
          Math.random() *
          9
        );

    }


    if (
      !choices.includes(fake)
    ) {

      choices.push(fake);

    }

  }


  choices.sort(
    () =>
      Math.random() -
      0.5
  );


  choices.forEach(
    choice => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "answer-btn";


      button.textContent =
        choice;


      button.addEventListener(
        "click",
        () =>
          answerQuestion(
            choice
          )
      );


      board.appendChild(
        button
      );

    }
  );


  if ($("questionText")) {

    $("questionText").textContent =
      state.currentQuestion.question;

  }
}


/* =========================================================
   RÉPONSE
   ========================================================= */

function answerQuestion(answer) {

  if (
    !state.gameRunning
  ) {

    return;

  }


  const buttons =
    document.querySelectorAll(
      ".answer-btn"
    );


  buttons.forEach(
    button => {

      button.disabled =
        true;

    }
  );


  const correct =
    String(answer)
      .toUpperCase() ===
    String(
      state.currentAnswer
    )
      .toUpperCase();


  if (correct) {

    state.combo++;


    state.maxCombo =
      Math.max(
        state.maxCombo,
        state.combo
      );


    const points =
      100 +
      state.level * 20 +
      state.combo * 10;


    state.score +=
      points;


    if (
      state.combo % 5 === 0
    ) {

      state.level++;

    }


    if ($("statusText")) {

      $("statusText").textContent =
        "+" +
        points +
        " points";

    }

  } else {

    state.combo = 0;

    state.lives--;


    if ($("statusText")) {

      $("statusText").textContent =
        "Mauvaise réponse";

    }


    if (
      state.lives <= 0
    ) {

      setTimeout(
        () => endGame(),
        400
      );

      return;

    }

  }


  updateGameDisplay();


  setTimeout(
    () => nextQuestion(),
    450
  );
}


/* =========================================================
   AFFICHAGE DU JEU
   ========================================================= */

function updateGameDisplay() {

  if ($("score")) {

    $("score").textContent =
      state.score;

  }


  if ($("level")) {

    $("level").textContent =
      state.level;

  }


  if ($("combo")) {

    $("combo").textContent =
      state.combo;

  }


  if ($("hearts")) {

    $("hearts").textContent =
      "❤️".repeat(
        Math.max(
          0,
          state.lives
        )
      );

  }


  updateTimer();
}


/* =========================================================
   FIN DE PARTIE
   ========================================================= */

async function endGame() {

  if (
    !state.gameRunning
  ) {

    return;

  }


  state.gameRunning =
    false;


  stopTimer();


  /*
    Sauvegarde locale de secours.
  */

  saveLocalRanking();


  /*
    Résultats.
  */

  if ($("finalPlayer")) {

    $("finalPlayer").textContent =
      state.player;

  }


  if ($("finalScore")) {

    $("finalScore").textContent =
      state.score;

  }


  if ($("finalBest")) {

    $("finalBest").textContent =
      state.score;

  }


  if ($("finalCombo")) {

    $("finalCombo").textContent =
      state.maxCombo;

  }


  if ($("finalLevel")) {

    $("finalLevel").textContent =
      state.level;

  }


  showScreen(
    "gameover"
  );


  /*
    IMPORTANT :
    Attendre réellement Supabase.
  */

  const saved =
    await saveScoreToSupabase();


  if (saved) {

    console.log(
      "✓ SCORE ENREGISTRÉ DANS LE CLASSEMENT MONDIAL"
    );

  } else {

    console.error(
      "✗ SCORE NON ENREGISTRÉ DANS SUPABASE"
    );

  }


  /*
    Actualiser le classement
    après l'enregistrement.
  */

  await renderLeaderboard();
}


/* =========================================================
   REJOUER
   ========================================================= */

function playAgain() {

  startGame();
}


/* =========================================================
   CHANGER DE JOUEUR
   ========================================================= */

function changePlayer() {

  state.gameRunning =
    false;


  stopTimer();


  showScreen(
    "home"
  );
}


/* =========================================================
   QUITTER
   ========================================================= */

function quitGame() {

  state.gameRunning =
    false;


  stopTimer();


  showScreen(
    "home"
  );
}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* -----------------------------------------------------
       PSEUDO
       ----------------------------------------------------- */

    if ($("playerName")) {

      $("playerName").addEventListener(
        "input",
        updatePlayerName
      );


      $("playerName").addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter"
          ) {

            startGame();

          }

        }
      );

    }


    /* -----------------------------------------------------
       COMMENCER
       ----------------------------------------------------- */

    if ($("startBtn")) {

      $("startBtn").addEventListener(
        "click",
        startGame
      );

    }


    /* -----------------------------------------------------
       EFFACER
       ----------------------------------------------------- */

    if ($("clearName")) {

      $("clearName").addEventListener(
        "click",
        clearPlayerName
      );

    }


    /* -----------------------------------------------------
       COMMENT JOUER
       ----------------------------------------------------- */

    if ($("howBtn")) {

      $("howBtn").addEventListener(
        "click",
        () =>
          showScreen("how")
      );

    }


    /* -----------------------------------------------------
       CLASSEMENT
       ----------------------------------------------------- */

    if ($("leaderboardBtn")) {

      $("leaderboardBtn").addEventListener(
        "click",
        () =>
          showScreen(
            "leaderboard"
          )
      );

    }


    /* -----------------------------------------------------
       À PROPOS
       ----------------------------------------------------- */

    if ($("aboutBtn")) {

      $("aboutBtn").addEventListener(
        "click",
        () =>
          showScreen("about")
      );

    }


    /* -----------------------------------------------------
       ACTUALISER CLASSEMENT
       ----------------------------------------------------- */

    if ($("refreshLeaderboard")) {

      $("refreshLeaderboard").addEventListener(
        "click",
        renderLeaderboard
      );

    }


    /* -----------------------------------------------------
       REJOUER
       ----------------------------------------------------- */

    if ($("againBtn")) {

      $("againBtn").addEventListener(
        "click",
        playAgain
      );

    }


    /* -----------------------------------------------------
       CHANGER DE JOUEUR
       ----------------------------------------------------- */

    if ($("changePlayerBtn")) {

      $("changePlayerBtn").addEventListener(
        "click",
        changePlayer
      );

    }


    /* -----------------------------------------------------
       ACCUEIL
       ----------------------------------------------------- */

    if ($("homeBtn")) {

      $("homeBtn").addEventListener(
        "click",
        () =>
          showScreen("home")
      );

    }


    /* -----------------------------------------------------
       QUITTER
       ----------------------------------------------------- */

    if ($("quitBtn")) {

      $("quitBtn").addEventListener(
        "click",
        quitGame
      );

    }


    /* -----------------------------------------------------
       INITIALISATION
       ----------------------------------------------------- */

    updatePlayerName();

    showScreen("home");


    console.log(
      "========================================"
    );

    console.log(
      "DÉFI EXPERT — Créé par Belfort"
    );

    console.log(
      "Classement partagé Supabase :",
      supabaseConfigured()
        ? "ACTIVÉ"
        : "DÉSACTIVÉ"
    );

    console.log(
      "========================================"
    );

  }
);
