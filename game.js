/* =========================================================
   DÉFI EXPERT
   GAME.JS — VERSION FINALE
   Créé par Belfort
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

const MAX_LEADERBOARD = 1000;

const STARTING_LIVES = 3;

const BASE_TIME = 4500;

const MIN_TIME = 1500;

const SCORE_PER_CORRECT = 100;

const COMBO_BONUS = 25;


/* =========================================================
   QUESTIONS / SYMBOLES
   ========================================================= */

const SYMBOLS = [
  "★",
  "◆",
  "●",
  "▲",
  "■",
  "♥",
  "✦",
  "✚",
  "☀",
  "☘",
  "♠",
  "♦"
];


/* =========================================================
   ÉTAT DU JEU
   ========================================================= */

const state = {

  playerName: "",

  playerKey: "",

  score: 0,

  level: 1,

  combo: 0,

  maxCombo: 0,

  lives: STARTING_LIVES,

  target: "",

  choices: [],

  timer: null,

  timerStartedAt: 0,

  timerDuration: BASE_TIME,

  gameRunning: false,

  acceptingAnswer: false,

  bestScore: 0,

  lastSavedScore: 0

};


/* =========================================================
   RÉCUPÉRATION DES ÉLÉMENTS HTML
   ========================================================= */

const $ = (id) => document.getElementById(id);

const homeScreen = $("home");
const howScreen = $("how");
const leaderboardScreen = $("leaderboard");
const aboutScreen = $("about");
const gameScreen = $("game");
const gameoverScreen = $("gameover");

const playerNameInput = $("playerName");
const clearNameBtn = $("clearName");
const nameError = $("nameError");

const startBtn = $("startBtn");
const howBtn = $("howBtn");
const leaderboardBtn = $("leaderboardBtn");
const aboutBtn = $("aboutBtn");

const refreshLeaderboardBtn =
  $("refreshLeaderboard");

const leaderboardList =
  $("leaderboardList");

const myRank =
  $("myRank");

const gamePlayer =
  $("gamePlayer");

const survivalBanner =
  $("survivalBanner");

const scoreElement =
  $("score");

const levelElement =
  $("level");

const comboElement =
  $("combo");

const heartsElement =
  $("hearts");

const timerBar =
  $("timerBar");

const targetSymbol =
  $("targetSymbol");

const statusText =
  $("statusText");

const board =
  $("board");

const flash =
  $("flash");

const finalPlayer =
  $("finalPlayer");

const finalScore =
  $("finalScore");

const finalBest =
  $("finalBest");

const finalCombo =
  $("finalCombo");

const finalLevel =
  $("finalLevel");

const newRecord =
  $("newRecord");

const againBtn =
  $("againBtn");

const changePlayerBtn =
  $("changePlayerBtn");

const homeBtn =
  $("homeBtn");

const quitBtn =
  $("quitBtn");

const saveStatus =
  $("saveStatus");


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupEvents();

    loadSavedPlayer();

    updateStats();

    showScreen("home");

  }
);


/* =========================================================
   ÉVÉNEMENTS
   ========================================================= */

function setupEvents() {

  if (startBtn) {
    startBtn.addEventListener(
      "click",
      startGame
    );
  }


  if (clearNameBtn) {
    clearNameBtn.addEventListener(
      "click",
      () => {

        playerNameInput.value = "";

        playerNameInput.focus();

        clearNameError();

      }
    );
  }


  if (playerNameInput) {

    playerNameInput.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Enter") {
          startGame();
        }

      }
    );


    playerNameInput.addEventListener(
      "input",
      clearNameError
    );

  }


  if (howBtn) {
    howBtn.addEventListener(
      "click",
      () => showScreen("how")
    );
  }


  if (leaderboardBtn) {
    leaderboardBtn.addEventListener(
      "click",
      () => {

        showScreen("leaderboard");

        loadLeaderboard();

      }
    );
  }


  if (aboutBtn) {
    aboutBtn.addEventListener(
      "click",
      () => showScreen("about")
    );
  }


  if (refreshLeaderboardBtn) {
    refreshLeaderboardBtn.addEventListener(
      "click",
      loadLeaderboard
    );
  }


  document
    .querySelectorAll("[data-back]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const target =
            button.getAttribute(
              "data-back"
            );

          showScreen(target);

        }
      );

    });


  if (againBtn) {
    againBtn.addEventListener(
      "click",
      () => {

        startGame(true);

      }
    );
  }


  if (changePlayerBtn) {

    changePlayerBtn.addEventListener(
      "click",
      () => {

        stopGame();

        showScreen("home");

        playerNameInput.value =
          state.playerName;

        playerNameInput.focus();

      }
    );

  }


  if (homeBtn) {

    homeBtn.addEventListener(
      "click",
      () => {

        stopGame();

        showScreen("home");

      }
    );

  }


  if (quitBtn) {

    quitBtn.addEventListener(
      "click",
      () => {

        stopGame();

        showScreen("home");

      }
    );

  }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showScreen(screenName) {

  const screens = [
    homeScreen,
    howScreen,
    leaderboardScreen,
    aboutScreen,
    gameScreen,
    gameoverScreen
  ];

  screens.forEach((screen) => {

    if (!screen) return;

    screen.classList.remove("active");

  });


  const screenMap = {

    home: homeScreen,

    how: howScreen,

    leaderboard:
      leaderboardScreen,

    about:
      aboutScreen,

    game:
      gameScreen,

    gameover:
      gameoverScreen

  };


  const selected =
    screenMap[screenName];


  if (selected) {
    selected.classList.add("active");
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   JOUEUR
   ========================================================= */

function normalizePlayerName(name) {

  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .substring(0, 24);

}


function validatePlayerName(name) {

  if (!name) {

    showNameError(
      "Entre ton prénom ou ton pseudo."
    );

    return false;

  }


  if (name.length < 2) {

    showNameError(
      "Ton pseudo doit contenir au moins 2 caractères."
    );

    return false;

  }


  return true;

}


function showNameError(message) {

  if (nameError) {
    nameError.textContent = message;
  }

}


function clearNameError() {

  if (nameError) {
    nameError.textContent = "";
  }

}


/* =========================================================
   CLÉ UNIQUE DU JOUEUR
   ========================================================= */

function getPlayerKeyForName(playerName) {

  const normalized =
    normalizePlayerName(playerName);

  const storageKey =
    "defi_expert_player_keys";

  let players = {};

  try {

    players = JSON.parse(
      localStorage.getItem(
        storageKey
      ) || "{}"
    );

  } catch {

    players = {};

  }


  const mapKey =
    normalized.toLowerCase();


  if (players[mapKey]) {

    return players[mapKey];

  }


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

  } catch {}

  return newKey;

}


/* =========================================================
   DÉMARRER UNE PARTIE
   ========================================================= */

function startGame(replay = false) {

  let playerName =
    normalizePlayerName(
      playerNameInput
        ? playerNameInput.value
        : state.playerName
    );


  if (!replay) {

    if (!validatePlayerName(playerName)) {
      return;
    }

    state.playerName =
      playerName;

    state.playerKey =
      getPlayerKeyForName(
        playerName
      );

    saveCurrentPlayer();

  } else {

    playerName =
      state.playerName;

  }


  stopTimer();


  state.score = 0;

  state.level = 1;

  state.combo = 0;

  state.maxCombo = 0;

  state.lives =
    STARTING_LIVES;

  state.gameRunning = true;

  state.acceptingAnswer = false;

  state.bestScore =
    getLocalBestScore(
      state.playerKey
    );


  if (gamePlayer) {
    gamePlayer.textContent =
      state.playerName;
  }


  updateStats();

  showScreen("game");

  nextRound();

}


/* =========================================================
   TOUR SUIVANT
   ========================================================= */

function nextRound() {

  if (!state.gameRunning) {
    return;
  }


  state.acceptingAnswer =
    false;


  const numberOfChoices =
    getChoiceCount();


  const shuffled =
    [...SYMBOLS]
      .sort(
        () => Math.random() - 0.5
      );


  state.target =
    shuffled[0];


  state.choices =
    shuffled.slice(
      0,
      numberOfChoices
    );


  /* Garantir que la cible est présente */

  if (
    !state.choices.includes(
      state.target
    )
  ) {

    state.choices[0] =
      state.target;

  }


  /* Mélange final */

  state.choices.sort(
    () => Math.random() - 0.5
  );


  if (targetSymbol) {

    targetSymbol.textContent =
      state.target;

  }


  if (statusText) {

    statusText.textContent =
      "Choisis le symbole correspondant.";

  }


  renderChoices();


  startRoundTimer();

  state.acceptingAnswer =
    true;

}


/* =========================================================
   NOMBRE DE CHOIX
   ========================================================= */

function getChoiceCount() {

  if (state.level <= 2) {
    return 6;
  }

  if (state.level <= 5) {
    return 8;
  }

  return 9;

}


/* =========================================================
   AFFICHER LES CHOIX
   ========================================================= */

function renderChoices() {

  if (!board) return;

  board.innerHTML = "";


  state.choices.forEach(
    (symbol) => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";

      button.className =
        "choice";

      button.textContent =
        symbol;

      button.setAttribute(
        "aria-label",
        "Choisir " + symbol
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


      board.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   RÉPONSE
   ========================================================= */

function handleAnswer(
  selected,
  button
) {

  if (
    !state.gameRunning ||
    !state.acceptingAnswer
  ) {

    return;

  }


  state.acceptingAnswer =
    false;

  stopTimer();


  const correct =
    selected === state.target;


  if (correct) {

    handleCorrectAnswer(
      button
    );

  } else {

    handleWrongAnswer(
      button
    );

  }

}


/* =========================================================
   BONNE RÉPONSE
   ========================================================= */

function handleCorrectAnswer(
  button
) {

  state.combo++;

  state.maxCombo =
    Math.max(
      state.maxCombo,
      state.combo
    );


  const comboBonus =
    Math.max(
      0,
      state.combo - 1
    ) * COMBO_BONUS;


  const levelBonus =
    Math.max(
      0,
      state.level - 1
    ) * 10;


  const gained =
    SCORE_PER_CORRECT +
    comboBonus +
    levelBonus;


  state.score +=
    gained;


  /* Niveau */

  const newLevel =
    Math.floor(
      state.score / 500
    ) + 1;


  if (
    newLevel >
    state.level
  ) {

    state.level =
      newLevel;

    showStatus(
      "Niveau " +
      state.level +
      " !"
    );

  } else {

    showStatus(
      "+" +
      gained +
      " points"
    );

  }


  flashScreen("good");


  if (button) {

    button.style.borderColor =
      "#5fe3a1";

    button.style.background =
      "#142f2a";

  }


  updateStats();


  setTimeout(
    () => {

      if (state.gameRunning) {
        nextRound();
      }

    },
    220
  );

}


/* =========================================================
   MAUVAISE RÉPONSE
   ========================================================= */

function handleWrongAnswer(
  button
) {

  state.combo = 0;

  state.lives--;


  if (button) {

    button.style.borderColor =
      "#ff7886";

    button.style.background =
      "#321820";

  }


  flashScreen("bad");


  showStatus(
    "Mauvaise réponse"
  );


  updateStats();


  if (
    state.lives <= 0
  ) {

    setTimeout(
      endGame,
      350
    );

    return;

  }


  setTimeout(
    () => {

      if (state.gameRunning) {
        nextRound();
      }

    },
    400
  );

}


/* =========================================================
   TEMPS ÉCOULÉ
   ========================================================= */

function timeExpired() {

  if (
    !state.gameRunning ||
    !state.acceptingAnswer
  ) {

    return;

  }


  state.acceptingAnswer =
    false;

  stopTimer();


  state.combo = 0;

  state.lives--;


  flashScreen("bad");


  showStatus(
    "Temps écoulé !"
  );


  updateStats();


  if (
    state.lives <= 0
  ) {

    setTimeout(
      endGame,
      350
    );

    return;

  }


  setTimeout(
    () => {

      if (state.gameRunning) {
        nextRound();
      }

    },
    400
  );

}


/* =========================================================
   CHRONOMÈTRE
   ========================================================= */

function getRoundDuration() {

  const reduction =
    (state.level - 1) * 180;


  return Math.max(
    MIN_TIME,
    BASE_TIME - reduction
  );

}


function startRoundTimer() {

  stopTimer();


  state.timerDuration =
    getRoundDuration();


  state.timerStartedAt =
    Date.now();


  updateTimerBar(
    1
  );


  state.timer =
    setInterval(
      () => {

        const elapsed =
          Date.now() -
          state.timerStartedAt;


        const remaining =
          Math.max(
            0,
            state.timerDuration -
            elapsed
          );


        const ratio =
          remaining /
          state.timerDuration;


        updateTimerBar(
          ratio
        );


        if (remaining <= 0) {

          timeExpired();

        }

      },
      50
    );

}


function stopTimer() {

  if (state.timer) {

    clearInterval(
      state.timer
    );

    state.timer =
      null;

  }

}


function updateTimerBar(ratio) {

  if (!timerBar) return;


  const safeRatio =
    Math.max(
      0,
      Math.min(
        1,
        ratio
      )
    );


  timerBar.style.width =
    (safeRatio * 100) +
    "%";

}


/* =========================================================
   STATISTIQUES
   ========================================================= */

function updateStats() {

  if (scoreElement) {

    scoreElement.textContent =
      state.score.toLocaleString(
        "fr-FR"
      );

  }


  if (levelElement) {

    levelElement.textContent =
      state.level;

  }


  if (comboElement) {

    comboElement.textContent =
      state.combo;

  }


  if (heartsElement) {

    heartsElement.textContent =
      getHeartsDisplay();

  }

}


function getHeartsDisplay() {

  let result = "";

  for (
    let i = 0;
    i < STARTING_LIVES;
    i++
  ) {

    result +=
      i < state.lives
        ? "❤️"
        : "🖤";

  }

  return result;

}


/* =========================================================
   MESSAGES
   ========================================================= */

function showStatus(message) {

  if (statusText) {
    statusText.textContent =
      message;
  }

}


/* =========================================================
   FLASH
   ========================================================= */

function flashScreen(type) {

  if (!flash) return;


  flash.classList.remove(
    "good",
    "bad"
  );


  void flash.offsetWidth;


  flash.classList.add(
    type
  );

}


/* =========================================================
   FIN DE PARTIE
   ========================================================= */

async function endGame() {

  if (!state.gameRunning) {
    return;
  }


  state.gameRunning =
    false;

  state.acceptingAnswer =
    false;


  stopTimer();


  const score =
    state.score;


  const previousBest =
    state.bestScore;


  const isNewRecord =
    score > previousBest;


  if (finalPlayer) {

    finalPlayer.textContent =
      state.playerName;

  }


  if (finalScore) {

    finalScore.textContent =
      score.toLocaleString(
        "fr-FR"
      );

  }


  if (finalBest) {

    finalBest.textContent =
      Math.max(
        score,
        previousBest
      ).toLocaleString(
        "fr-FR"
      );

  }


  if (finalCombo) {

    finalCombo.textContent =
      state.maxCombo;

  }


  if (finalLevel) {

    finalLevel.textContent =
      state.level;

  }


  if (newRecord) {

    newRecord.classList.toggle(
      "show",
      isNewRecord
    );

  }


  if (saveStatus) {

    saveStatus.textContent =
      "Enregistrement du score…";

  }


  showScreen("gameover");


  /*
    On attend la sauvegarde Supabase.
    Cela évite que le joueur quitte trop
    rapidement l'écran avant l'enregistrement.
  */

  const result =
    await saveScoreToSupabase();


  if (saveStatus) {

    if (result.success) {

      saveStatus.textContent =
        "✓ Score enregistré dans le classement.";

    } else {

      saveStatus.textContent =
        "Score conservé sur cet appareil. Synchronisation indisponible.";

    }

  }


  saveLocalBestScore(
    state.playerKey,
    Math.max(
      score,
      previousBest
    )
  );

}


/* =========================================================
   ARRÊTER LE JEU
   ========================================================= */

function stopGame() {

  state.gameRunning =
    false;

  state.acceptingAnswer =
    false;

  stopTimer();

}


/* =========================================================
   SUPABASE — EN-TÊTES
   ========================================================= */

function supabaseHeaders() {

  return {

    "apikey":
      SUPABASE_KEY,

    "Authorization":
      "Bearer " +
      SUPABASE_KEY,

    "Content-Type":
      "application/json",

    "Accept":
      "application/json"

  };

}


/* =========================================================
   SUPABASE — SAUVEGARDE DU SCORE
   ========================================================= */

async function saveScoreToSupabase() {

  if (
    !state.playerName ||
    !state.playerKey
  ) {

    return {
      success: false
    };

  }


  try {

    /*
      Chercher le joueur avec sa clé.
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
          headers:
            supabaseHeaders()
        }
      );


    if (!searchResponse.ok) {

      const errorText =
        await searchResponse.text();

      console.error(
        "ERREUR RECHERCHE JOUEUR:",
        searchResponse.status,
        errorText
      );


      return {
        success: false
      };

    }


    const existing =
      await searchResponse.json();


    /*
      Joueur déjà présent.
    */

    if (
      Array.isArray(existing) &&
      existing.length > 0
    ) {

      const row =
        existing[0];


      /*
        On ne remplace que si
        le nouveau score est meilleur.
      */

      if (
        state.score >
        Number(row.score || 0)
      ) {

        const updateUrl =
          SUPABASE_URL +
          "/rest/v1/scores" +
          "?id=eq." +
          encodeURIComponent(
            row.id
          );


        const updateResponse =
          await fetch(
            updateUrl,
            {
              method: "PATCH",

              headers:
                supabaseHeaders(),

              body:
                JSON.stringify({

                  player_name:
                    state.playerName,

                  score:
                    state.score,

                  max_combo:
                    state.maxCombo,

                  level:
                    state.level,

                  updated_at:
                    new Date()
                      .toISOString()

                })

            }
          );


        if (!updateResponse.ok) {

          const errorText =
            await updateResponse.text();

          console.error(
            "ERREUR MISE À JOUR SCORE:",
            updateResponse.status,
            errorText
          );


          return {
            success: false
          };

        }

      }


      state.lastSavedScore =
        Math.max(
          Number(row.score || 0),
          state.score
        );


      return {
        success: true
      };

    }


    /*
      Nouveau joueur.
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
            ...supabaseHeaders(),

            "Prefer":
              "return=representation"
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
                new Date()
                  .toISOString(),

              updated_at:
                new Date()
                  .toISOString()

            })

        }
      );


    if (!insertResponse.ok) {

      const errorText =
        await insertResponse.text();

      console.error(
        "ERREUR INSERTION SCORE:",
        insertResponse.status,
        errorText
      );


      return {
        success: false
      };

    }


    const inserted =
      await insertResponse.json();


    if (
      Array.isArray(inserted) &&
      inserted.length
    ) {

      state.lastSavedScore =
        Number(
          inserted[0].score || 0
        );

    }


    return {
      success: true
    };


  } catch (error) {

    console.error(
      "ERREUR SUPABASE:",
      error
    );


    return {
      success: false
    };

  }

}


/* =========================================================
   CLASSEMENT
   ========================================================= */

async function loadLeaderboard() {

  if (!leaderboardList) {
    return;
  }


  leaderboardList.innerHTML = `
    <div class="loading">
      Chargement du classement…
    </div>
  `;


  if (refreshLeaderboardBtn) {

    refreshLeaderboardBtn.disabled =
      true;

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
          headers:
            supabaseHeaders()
        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "ERREUR CHARGEMENT CLASSEMENT:",
        response.status,
        errorText
      );


      throw new Error(
        "Impossible de charger le classement."
      );

    }


    const rows =
      await response.json();


    renderLeaderboard(
      Array.isArray(rows)
        ? rows
        : []
    );


  } catch (error) {

    console.error(
      "ERREUR CLASSEMENT:",
      error
    );


    /*
      Si Supabase est momentanément
      indisponible, on affiche le
      classement local.
    */

    const local =
      getLocalLeaderboard();


    if (local.length > 0) {

      renderLeaderboard(
        local
      );

    } else {

      leaderboardList.innerHTML = `
        <div class="empty">
          Impossible de charger le classement pour le moment.
        </div>
      `;

    }

  } finally {

    if (refreshLeaderboardBtn) {

      refreshLeaderboardBtn.disabled =
        false;

    }

  }

}


/* =========================================================
   AFFICHAGE CLASSEMENT
   ========================================================= */

function renderLeaderboard(rows) {

  if (!leaderboardList) {
    return;
  }


  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {

    leaderboardList.innerHTML = `
      <div class="empty">
        Aucun joueur enregistré pour le moment.
      </div>
    `;


    if (myRank) {
      myRank.textContent = "";
    }

    return;

  }


  leaderboardList.innerHTML = "";


  let currentPlayerRank =
    null;


  rows.forEach(
    (row, index) => {

      const rank =
        index + 1;


      const rowElement =
        document.createElement(
          "div"
        );


      rowElement.className =
        "rank-row";


      const isMine =
        state.playerKey &&
        row.player_key ===
          state.playerKey;


      if (isMine) {

        rowElement.classList.add(
          "mine"
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


      if (rank <= 3) {

        rankElement.classList.add(
          "top"
        );

      }


      rankElement.textContent =
        getRankLabel(rank);


      const playerElement =
        document.createElement(
          "div"
        );


      playerElement.className =
        "player";


      const playerStrong =
        document.createElement(
          "strong"
        );


      playerStrong.textContent =
        row.player_name ||
        "Joueur";


      const playerSmall =
        document.createElement(
          "small"
        );


      const level =
        Number(
          row.level || 1
        );


      const combo =
        Number(
          row.max_combo || 0
        );


      playerSmall.textContent =
        "Niveau " +
        level +
        " · Combo " +
        combo;


      playerElement.appendChild(
        playerStrong
      );

      playerElement.appendChild(
        playerSmall
      );


      const pointsElement =
        document.createElement(
          "div"
        );


      pointsElement.className =
        "points";


      pointsElement.textContent =
        Number(
          row.score || 0
        ).toLocaleString(
          "fr-FR"
        );


      rowElement.appendChild(
        rankElement
      );

      rowElement.appendChild(
        playerElement
      );

      rowElement.appendChild(
        pointsElement
      );


      leaderboardList.appendChild(
        rowElement
      );

    }
  );


  /*
    Si le joueur actuel est
    dans le classement.
  */

  if (
    myRank &&
    currentPlayerRank
  ) {

    myRank.textContent =
      "Ta position : #" +
      currentPlayerRank;

  } else if (myRank) {

    myRank.textContent = "";

  }

}


/* =========================================================
   MÉDAILLES / RANG
   ========================================================= */

function getRankLabel(rank) {

  if (rank === 1) {
    return "🥇";
  }

  if (rank === 2) {
    return "🥈";
  }

  if (rank === 3) {
    return "🥉";
  }

  return "#" + rank;

}


/* =========================================================
   JOUEUR SAUVEGARDÉ
   ========================================================= */

function saveCurrentPlayer() {

  try {

    localStorage.setItem(
      "defi_expert_last_player",
      state.playerName
    );

  } catch {}

}


function loadSavedPlayer() {

  try {

    const saved =
      localStorage.getItem(
        "defi_expert_last_player"
      );


    if (
      saved &&
      playerNameInput
    ) {

      playerNameInput.value =
        saved;

    }

  } catch {}

}


/* =========================================================
   MEILLEUR SCORE LOCAL
   ========================================================= */

function getLocalBestScore(
  playerKey
) {

  if (!playerKey) {
    return 0;
  }


  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          "defi_expert_best_scores"
        ) || "{}"
      );


    return Number(
      data[playerKey] || 0
    );

  } catch {

    return 0;

  }

}


function saveLocalBestScore(
  playerKey,
  score
) {

  if (!playerKey) {
    return;
  }


  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          "defi_expert_best_scores"
        ) || "{}"
      );


    data[playerKey] =
      Number(score);


    localStorage.setItem(
      "defi_expert_best_scores",
      JSON.stringify(data)
    );

  } catch {}

}


/* =========================================================
   CLASSEMENT LOCAL — SECOURS
   ========================================================= */

function getLocalLeaderboard() {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          "defi_expert_local_leaderboard"
        ) || "[]"
      );


    if (
      !Array.isArray(data)
    ) {

      return [];

    }


    return data
      .sort(
        (a, b) =>
          Number(b.score || 0) -
          Number(a.score || 0)
      )
      .slice(
        0,
        MAX_LEADERBOARD
      );

  } catch {

    return [];

  }

}


/* =========================================================
   SAUVEGARDE LOCALE DU CLASSEMENT
   ========================================================= */

function saveLocalLeaderboardEntry() {

  try {

    const key =
      "defi_expert_local_leaderboard";


    let data =
      JSON.parse(
        localStorage.getItem(
          key
        ) || "[]"
      );


    if (!Array.isArray(data)) {
      data = [];
    }


    const existingIndex =
      data.findIndex(
        (player) =>
          player.player_key ===
          state.playerKey
      );


    const entry = {

      player_name:
        state.playerName,

      player_key:
        state.playerKey,

      score:
        state.score,

      max_combo:
        state.maxCombo,

      level:
        state.level

    };


    if (
      existingIndex >= 0
    ) {

      if (
        state.score >
        Number(
          data[existingIndex].score || 0
        )
      ) {

        data[existingIndex] =
          entry;

      }

    } else {

      data.push(entry);

    }


    data.sort(
      (a, b) =>
        Number(b.score || 0) -
        Number(a.score || 0)
    );


    data =
      data.slice(
        0,
        MAX_LEADERBOARD
      );


    localStorage.setItem(
      key,
      JSON.stringify(data)
    );

  } catch {}

}


/* =========================================================
   SAUVEGARDE LOCALE APRÈS UNE PARTIE
   ========================================================= */

const originalEndGame =
  endGame;


/*
  On ajoute également une sauvegarde
  locale sans modifier le fonctionnement
  Supabase.
*/

async function finalEndGameWrapper() {

  await originalEndGame();

  saveLocalLeaderboardEntry();

}


/* =========================================================
   SÉCURITÉ
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    stopTimer();

  }
);


/* =========================================================
   FIN
   ========================================================= */
