/* =========================================================
   DÉFI EXPERT — V1
   Connexion Supabase
   ========================================================= */

const SUPABASE_URL = "https://snmmtigmbrrqdcesdzwg.supabase.co";
const SUPABASE_KEY = "sb_publishable_Hlb0Qbn-307abqSvRmyB8w_FbcsT3ze";

let supabaseClient = null;

/* ---------------------------------------------------------
   Chargement automatique de Supabase
   Aucun changement nécessaire dans index.html
   --------------------------------------------------------- */

function loadSupabase() {
  return new Promise((resolve) => {
    if (window.supabase) {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = () => {
      try {
        supabaseClient = window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );
        resolve(true);
      } catch (error) {
        console.error("Erreur initialisation Supabase :", error);
        resolve(false);
      }
    };

    script.onerror = () => {
      console.error("Impossible de charger Supabase.");
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

/* ---------------------------------------------------------
   Sauvegarde du score dans Supabase
   La fonction SQL submit_score() garde uniquement
   le meilleur score du joueur.
   --------------------------------------------------------- */

async function saveScoreToSupabase() {
  if (!supabaseClient || !state.player) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient.rpc(
      "submit_score",
      {
        p_player_name: state.player,
        p_score: state.score,
        p_max_combo: state.maxCombo,
        p_level: state.level
      }
    );

    if (error) {
      console.error("Erreur sauvegarde score :", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erreur Supabase :", error);
    return null;
  }
}

/* ---------------------------------------------------------
   INITIALISATION SUPABASE
   --------------------------------------------------------- */

loadSupabase();


/* =========================================================
   JEU
   ========================================================= */

const SYMBOLS = ["◆","●","▲","★","✚","✦","⬟","♥","☀"];

const state = {
  score: 0,
  lives: 3,
  combo: 0,
  maxCombo: 0,
  level: 1,
  target: null,
  timer: null,
  deadline: 0,
  best: 0,
  running: false,
  round: 0,
  player: ""
};

const $ = id => document.getElementById(id);

const screens = ["home", "how", "game", "gameover"];

function show(id) {
  screens.forEach(s =>
    $(s).classList.toggle("active", s === id)
  );
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}


/* =========================================================
   PROFIL JOUEUR
   ========================================================= */

function getSavedName() {
  return localStorage.getItem("defiExpertPlayer") || "";
}

function saveName(name) {
  state.player = name;
  localStorage.setItem("defiExpertPlayer", name);
}

function loadProfile() {
  const name = getSavedName();

  $("playerName").value = name;
  state.player = name;
}

loadProfile();

$("clearName").addEventListener("click", () => {
  $("playerName").value = "";

  localStorage.removeItem("defiExpertPlayer");

  $("playerName").focus();
});

$("playerName").addEventListener("input", () => {
  $("nameError").classList.add("hidden");
});


/* =========================================================
   DIFFICULTÉ
   ========================================================= */

function difficulty() {
  return {
    tiles: Math.min(
      9,
      5 + Math.floor((state.level - 1) / 2)
    ),

    time: Math.max(
      700,
      2300 - (state.level - 1) * 115
    )
  };
}


/* =========================================================
   DÉMARRAGE
   ========================================================= */

function startGame() {
  const raw = $("playerName").value.trim();

  if (!raw) {
    $("nameError").classList.remove("hidden");
    $("playerName").focus();
    return;
  }

  const name = raw
    .replace(/\s+/g, " ")
    .slice(0, 18);

  $("playerName").value = name;

  saveName(name);

  state.best = Number(
    localStorage.getItem(
      "defiExpertBest_" + name.toLowerCase()
    ) || 0
  );

  state.score = 0;
  state.lives = 3;
  state.combo = 0;
  state.maxCombo = 0;
  state.level = 1;
  state.round = 0;
  state.running = true;

  $("gamePlayer").textContent = name;

  $("survivalBanner").classList.add("hidden");

  show("game");

  updateHUD();
  nextRound();
}


/* =========================================================
   CRÉATION DES CASES
   ========================================================= */

function makeTiles() {
  const board = $("board");

  board.innerHTML = "";

  const d = difficulty();

  const choices = shuffle([...SYMBOLS]).slice(
    0,
    d.tiles
  );

  state.target =
    choices[
      Math.floor(Math.random() * choices.length)
    ];

  $("targetSymbol").textContent = state.target;

  let symbols = [...choices];

  while (symbols.length < 9) {
    symbols.push(
      SYMBOLS[
        Math.floor(Math.random() * SYMBOLS.length)
      ]
    );
  }

  symbols[
    Math.floor(Math.random() * 9)
  ] = state.target;

  shuffle(symbols).forEach(symbol => {
    const tile = document.createElement("button");

    tile.className = "tile";
    tile.textContent = symbol;

    tile.setAttribute(
      "aria-label",
      "Symbole " + symbol
    );

    tile.addEventListener(
      "click",
      () => tapTile(tile, symbol),
      { once: true }
    );

    board.appendChild(tile);
  });
}


/* =========================================================
   TOUR SUIVANT
   ========================================================= */

function nextRound() {
  if (!state.running) return;

  state.round++;

  state.level = Math.min(
    99,
    1 + Math.floor(state.round / 6)
  );

  updateHUD();

  makeTiles();

  startTimer(difficulty().time);
}


/* =========================================================
   CHRONOMÈTRE
   ========================================================= */

function startTimer(ms) {
  clearTimeout(state.timer);

  const start = performance.now();

  state.deadline = start + ms;

  const bar = $("timerBar");

  bar.style.transition = "none";
  bar.style.width = "100%";

  requestAnimationFrame(() => {
    bar.style.transition =
      `width ${ms}ms linear`;

    bar.style.width = "0%";
  });

  state.timer = setTimeout(() => {
    miss("Temps écoulé !");
  }, ms);
}


/* =========================================================
   RÉPONSE DU JOUEUR
   ========================================================= */

function tapTile(tile, symbol) {
  if (!state.running) return;

  clearTimeout(state.timer);

  if (symbol === state.target) {

    tile.classList.add("correct");

    state.combo++;

    state.maxCombo = Math.max(
      state.maxCombo,
      state.combo
    );

    const speedBonus = Math.max(
      0,
      Math.round(
        (state.deadline - performance.now()) / 50
      )
    );

    state.score +=
      10 +
      speedBonus +
      Math.min(10, state.combo - 1) * 2;

    $("statusText").textContent =
      state.combo >= 5
        ? "🔥 COMBO EN FEU !"
        : "✓ BONNE RÉPONSE";

    updateHUD();

    setTimeout(nextRound, 110);

  } else {

    tile.classList.add("wrong");

    miss("Mauvais symbole !");
  }
}


/* =========================================================
   ERREUR / PERTE DE VIE
   ========================================================= */

function miss(message) {
  if (!state.running) return;

  clearTimeout(state.timer);

  state.lives--;
  state.combo = 0;

  $("statusText").textContent = message;

  $("flash").classList.add("show");

  setTimeout(() => {
    $("flash").classList.remove("show");
  }, 220);

  updateHUD();

  if (state.lives <= 0) {
    endGame();
    return;
  }

  if (state.lives === 1) {
    $("survivalBanner").classList.remove("hidden");

    setTimeout(() => {
      $("survivalBanner").classList.add("hidden");
    }, 900);
  }

  setTimeout(nextRound, 350);
}


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {
  $("score").textContent =
    state.score.toLocaleString("fr-FR");

  $("level").textContent =
    state.level;

  $("combo").textContent =
    state.combo;

  $("hearts").textContent =
    "❤️".repeat(state.lives) +
    "🖤".repeat(3 - state.lives);
}


/* =========================================================
   FIN DE PARTIE
   ========================================================= */

async function endGame() {

  state.running = false;

  clearTimeout(state.timer);

  const key =
    "defiExpertBest_" +
    state.player.toLowerCase();

  state.best = Number(
    localStorage.getItem(key) || 0
  );

  const isNew =
    state.score > state.best;

  if (isNew) {
    state.best = state.score;

    localStorage.setItem(
      key,
      state.best
    );
  }

  $("finalPlayer").textContent =
    state.player;

  $("finalScore").textContent =
    state.score.toLocaleString("fr-FR");

  $("finalBest").textContent =
    state.best.toLocaleString("fr-FR");

  $("finalCombo").textContent =
    state.maxCombo;

  $("finalLevel").textContent =
    state.level;

  $("newRecord").classList.toggle(
    "hidden",
    !isNew
  );

  show("gameover");

  /* -------------------------------------------------------
     ENVOI DU SCORE À SUPABASE
     ------------------------------------------------------- */

  const result = await saveScoreToSupabase();

  if (result) {

    const savedScore = Array.isArray(result)
      ? result[0]
      : result;

    if (
      savedScore &&
      typeof savedScore.score === "number"
    ) {

      state.best = Math.max(
        state.best,
        savedScore.score
      );

      $("finalBest").textContent =
        state.best.toLocaleString("fr-FR");

      localStorage.setItem(
        key,
        state.best
      );

      $("newRecord").classList.toggle(
        "hidden",
        state.score < state.best
      );
    }
  }
}


/* =========================================================
   BOUTONS
   ========================================================= */

$("startBtn").addEventListener(
  "click",
  startGame
);

$("againBtn").addEventListener(
  "click",
  startGame
);

$("changePlayerBtn").addEventListener(
  "click",
  () => {
    show("home");

    $("playerName").focus();
    $("playerName").select();
  }
);

$("homeBtn").addEventListener(
  "click",
  () => {
    state.running = false;

    clearTimeout(state.timer);

    show("home");
  }
);

$("howBtn").addEventListener(
  "click",
  () => show("how")
);

document
  .querySelectorAll("[data-back]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => show("home")
    );

  });

$("quitBtn").addEventListener(
  "click",
  () => {

    state.running = false;

    clearTimeout(state.timer);

    show("home");

  }
);

$("playerName").addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      startGame();
    }

  }
);
