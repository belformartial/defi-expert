// ============================================================
// DÉFI EXPERT
// Créé par Belfort
// ============================================================
//
// IMPORTANT :
// Mets ici ton URL Supabase et ta clé publishable/anon.
//
// Exemple :
// const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
// const SUPABASE_KEY = "sb_publishable_xxxxx";
//
// NE METS JAMAIS une clé sb_secret_... ou service_role ici.
// ============================================================

const SUPABASE_URL = "https://snmmtigmbrrqdcesdzwg.supabase.co";
const SUPABASE_KEY = "sb_publishable_Hlb0Qbn-307abqSvRmyB8w_FbcsT3ze";


// ============================================================
// CONFIGURATION DU JEU
// ============================================================

const SYMBOLS = [
  "◆",
  "●",
  "▲",
  "★",
  "✚",
  "✦",
  "⬟",
  "♥",
  "☀"
];

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


// ============================================================
// OUTILS
// ============================================================

const $ = (id) => document.getElementById(id);

const screens = [
  "home",
  "how",
  "leaderboard",
  "about",
  "game",
  "gameover"
];

function show(id) {

  screens.forEach((screen) => {

    const element = $(screen);

    if (element) {
      element.classList.toggle(
        "active",
        screen === id
      );
    }

  });

  if (id === "leaderboard") {
    loadLeaderboard();
  }
}


function shuffle(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [
      array[i],
      array[j]
    ] = [
      array[j],
      array[i]
    ];
  }

  return array;
}


function getSavedName() {

  return (
    localStorage.getItem(
      "defiExpertPlayer"
    ) || ""
  );

}


function saveName(name) {

  state.player = name;

  localStorage.setItem(
    "defiExpertPlayer",
    name
  );

}


// ============================================================
// INITIALISATION DU PROFIL
// ============================================================

function loadProfile() {

  const name = getSavedName();

  $("playerName").value = name;

  state.player = name;

}

loadProfile();


$("clearName").addEventListener(
  "click",
  () => {

    $("playerName").value = "";

    localStorage.removeItem(
      "defiExpertPlayer"
    );

    $("playerName").focus();

  }
);


$("playerName").addEventListener(
  "input",
  () => {

    $("nameError").classList.add(
      "hidden"
    );

  }
);


// ============================================================
// DIFFICULTÉ
// ============================================================

function difficulty() {

  return {

    tiles: Math.min(
      9,
      5 + Math.floor(
        (state.level - 1) / 2
      )
    ),

    time: Math.max(
      700,
      2300 -
      (state.level - 1) * 115
    )

  };

}


// ============================================================
// DÉMARRER LE JEU
// ============================================================

function startGame() {

  const raw =
    $("playerName").value.trim();

  if (!raw) {

    $("nameError").classList.remove(
      "hidden"
    );

    $("playerName").focus();

    return;

  }

  const name =
    raw
      .replace(/\s+/g, " ")
      .slice(0, 18);

  $("playerName").value = name;

  saveName(name);

  state.best =
    Number(
      localStorage.getItem(
        "defiExpertBest_" +
        name.toLowerCase()
      ) || 0
    );

  state.score = 0;
  state.lives = 3;
  state.combo = 0;
  state.maxCombo = 0;
  state.level = 1;
  state.round = 0;
  state.running = true;

  $("gamePlayer").textContent =
    name;

  $("survivalBanner")
    .classList.add("hidden");

  show("game");

  updateHUD();

  nextRound();

}


// ============================================================
// CRÉER LES CASES
// ============================================================

function makeTiles() {

  const board = $("board");

  board.innerHTML = "";

  const d = difficulty();

  const choices =
    shuffle([...SYMBOLS])
      .slice(0, d.tiles);

  state.target =
    choices[
      Math.floor(
        Math.random() *
        choices.length
      )
    ];

  $("targetSymbol").textContent =
    state.target;

  let symbols = [...choices];

  while (symbols.length < 9) {

    symbols.push(
      SYMBOLS[
        Math.floor(
          Math.random() *
          SYMBOLS.length
        )
      ]
    );

  }

  symbols[
    Math.floor(
      Math.random() * 9
    )
  ] = state.target;

  shuffle(symbols).forEach(
    (symbol) => {

      const tile =
        document.createElement(
          "button"
        );

      tile.className =
        "tile";

      tile.textContent =
        symbol;

      tile.setAttribute(
        "aria-label",
        "Symbole " + symbol
      );

      tile.addEventListener(
        "click",
        () => tapTile(
          tile,
          symbol
        ),
        { once: true }
      );

      board.appendChild(tile);

    }
  );

}


// ============================================================
// TOUR SUIVANT
// ============================================================

function nextRound() {

  if (!state.running) {
    return;
  }

  state.round++;

  state.level =
    Math.min(
      99,
      1 + Math.floor(
        state.round / 6
      )
    );

  updateHUD();

  makeTiles();

  startTimer(
    difficulty().time
  );

}


// ============================================================
// CHRONOMÈTRE
// ============================================================

function startTimer(ms) {

  clearTimeout(state.timer);

  const start =
    performance.now();

  state.deadline =
    start + ms;

  const bar =
    $("timerBar");

  bar.style.transition =
    "none";

  bar.style.width =
    "100%";

  requestAnimationFrame(
    () => {

      bar.style.transition =
        `width ${ms}ms linear`;

      bar.style.width =
        "0%";

    }
  );

  state.timer =
    setTimeout(
      () => miss(
        "Temps écoulé !"
      ),
      ms
    );

}


// ============================================================
// CLIQUE SUR UNE CASE
// ============================================================

function tapTile(
  tile,
  symbol
) {

  if (!state.running) {
    return;
  }

  clearTimeout(
    state.timer
  );

  if (
    symbol === state.target
  ) {

    tile.classList.add(
      "correct"
    );

    state.combo++;

    state.maxCombo =
      Math.max(
        state.maxCombo,
        state.combo
      );

    const speedBonus =
      Math.max(
        0,
        Math.round(
          (
            state.deadline -
            performance.now()
          ) / 50
        )
      );

    state.score +=
      10 +
      speedBonus +
      Math.min(
        10,
        state.combo - 1
      ) * 2;

    $("statusText")
      .textContent =
      state.combo >= 5
        ? "🔥 COMBO EN FEU !"
        : "✓ BONNE RÉPONSE";

    updateHUD();

    setTimeout(
      nextRound,
      110
    );

  } else {

    tile.classList.add(
      "wrong"
    );

    miss(
      "Mauvais symbole !"
    );

  }

}


// ============================================================
// ERREUR / TEMPS DÉPASSÉ
// ============================================================

function miss(message) {

  if (!state.running) {
    return;
  }

  clearTimeout(
    state.timer
  );

  state.lives--;

  state.combo = 0;

  $("statusText")
    .textContent =
    message;

  $("flash")
    .classList.add("show");

  setTimeout(
    () => {
      $("flash")
        .classList.remove("show");
    },
    220
  );

  updateHUD();

  if (state.lives <= 0) {

    endGame();

    return;

  }

  if (state.lives === 1) {

    $("survivalBanner")
      .classList.remove(
        "hidden"
      );

    setTimeout(
      () => {

        $("survivalBanner")
          .classList.add(
            "hidden"
          );

      },
      900
    );

  }

  setTimeout(
    nextRound,
    350
  );

}


// ============================================================
// HUD
// ============================================================

function updateHUD() {

  $("score").textContent =
    state.score.toLocaleString(
      "fr-FR"
    );

  $("level").textContent =
    state.level;

  $("combo").textContent =
    state.combo;

  $("hearts").textContent =
    "❤️".repeat(
      state.lives
    ) +
    "🖤".repeat(
      3 - state.lives
    );

}


// ============================================================
// CONFIGURATION SUPABASE
// ============================================================

function supabaseConfigured() {

  return (
    SUPABASE_URL.trim() !== "" &&
    SUPABASE_KEY.trim() !== "" &&
    SUPABASE_URL.includes(
      "supabase.co"
    )
  );

}


function supabaseHeaders() {

  return {

    "apikey":
      SUPABASE_KEY,

    "Authorization":
      "Bearer " +
      SUPABASE_KEY,

    "Content-Type":
      "application/json",

    "Prefer":
      "return=representation"

  };

}


// ============================================================
// SAUVEGARDER LE SCORE DANS SUPABASE
// ============================================================

async function saveScoreToSupabase() {

  if (!supabaseConfigured()) {

    console.warn(
      "Supabase n'est pas configuré. Score conservé localement."
    );

    return;

  }

  try {

    const url =
      SUPABASE_URL +
      "/rest/v1/scores" +
      "?on_conflict=player_name";

    const response =
      await fetch(
        url,
        {

          method: "POST",

          headers:
            supabaseHeaders(),

          body:
            JSON.stringify({

              player_name:
                state.player,

              score:
                state.score,

              max_combo:
                state.maxCombo,

              level:
                state.level

            })

        }
      );

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "Erreur Supabase :",
        errorText
      );

      return;

    }

    console.log(
      "Score enregistré dans Supabase."
    );

  } catch (error) {

    console.error(
      "Erreur réseau Supabase :",
      error
    );

  }

}


// ============================================================
// CHARGER LE CLASSEMENT
// ============================================================

async function loadLeaderboard() {

  const container =
    $("leaderboardList");

  const myRank =
    $("myRank");

  container.innerHTML =
    `<div class="leaderboard-loading">
      Chargement du classement...
    </div>`;

  myRank.classList.add(
    "hidden"
  );

  // ----------------------------------------------------------
  // SUPABASE
  // ----------------------------------------------------------

  if (supabaseConfigured()) {

    try {

      const url =
        SUPABASE_URL +
        "/rest/v1/scores" +
        "?select=player_name,score,max_combo,level,updated_at" +
        "&order=score.desc" +
        "&limit=50";

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

        throw new Error(
          await response.text()
        );

      }

      const rows =
        await response.json();

      renderLeaderboard(
        rows
      );

      return;

    } catch (error) {

      console.error(
        "Impossible de charger Supabase :",
        error
      );

      container.innerHTML =
        `<div class="leaderboard-error">
          Impossible de charger le classement partagé.
          <br><br>
          Vérifie la configuration Supabase.
        </div>`;

      return;

    }

  }


  // ----------------------------------------------------------
  // MODE LOCAL SI SUPABASE N'EST PAS CONFIGURÉ
  // ----------------------------------------------------------

  const localRanking =
    getLocalRanking();

  renderLeaderboard(
    localRanking
  );

}


// ============================================================
// CLASSEMENT LOCAL
// ============================================================

function getLocalRanking() {

  try {

    return (
      JSON.parse(
        localStorage.getItem(
          "defiExpertRanking"
        )
      ) || []
    );

  } catch {

    return [];

  }

}


function saveLocalRanking() {

  let ranking =
    getLocalRanking();

  const existing =
    ranking.find(
      (item) =>
        item.player_name
          .toLowerCase() ===
        state.player
          .toLowerCase()
    );

  if (
    existing &&
    Number(existing.score) >=
    state.score
  ) {

    return;

  }

  ranking =
    ranking.filter(
      (item) =>
        item.player_name
          .toLowerCase() !==
        state.player
          .toLowerCase()
    );

  ranking.push({

    player_name:
      state.player,

    score:
      state.score,

    max_combo:
      state.maxCombo,

    level:
      state.level,

    updated_at:
      new Date().toISOString()

  });

  ranking.sort(
    (a, b) =>
      Number(b.score) -
      Number(a.score)
  );

  ranking =
    ranking.slice(0, 50);

  localStorage.setItem(
    "defiExpertRanking",
    JSON.stringify(
      ranking
    )
  );

}


// ============================================================
// AFFICHAGE DU CLASSEMENT
// ============================================================

function renderLeaderboard(
  rows
) {

  const container =
    $("leaderboardList");

  const myRank =
    $("myRank");

  if (
    !rows ||
    rows.length === 0
  ) {

    container.innerHTML =
      `<div class="leaderboard-empty">
        🏆<br><br>
        Aucun score enregistré pour le moment.
        <br>
        Sois le premier à entrer dans le classement !
      </div>`;

    return;

  }

  container.innerHTML = "";

  rows.forEach(
    (row, index) => {

      const rank =
        index + 1;

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "leaderboard-row";

      let medal =
        rank + "e";

      if (rank === 1) {
        medal = "🥇";
      } else if (rank === 2) {
        medal = "🥈";
      } else if (rank === 3) {
        medal = "🥉";
      }

      const name =
        escapeHTML(
          row.player_name ||
          "Joueur"
        );

      const score =
        Number(
          row.score || 0
        ).toLocaleString(
          "fr-FR"
        );

      const date =
        formatDate(
          row.updated_at
        );

      item.innerHTML = `

        <div class="leaderboard-rank">
          ${medal}
        </div>

        <div>
          <div class="leaderboard-name">
            ${name}
          </div>

          <span class="leaderboard-date">
            Niveau ${Number(row.level || 1)}
            · Combo ${Number(row.max_combo || 0)}
            ${date ? " · " + date : ""}
          </span>
        </div>

        <div class="leaderboard-score">
          ${score}
        </div>

      `;

      container.appendChild(
        item
      );

    }
  );


  // ----------------------------------------------------------
  // POSITION DU JOUEUR
  // ----------------------------------------------------------

  if (state.player) {

    const index =
      rows.findIndex(
        (row) =>
          String(
            row.player_name || ""
          ).toLowerCase() ===
          state.player.toLowerCase()
      );

    if (index >= 0) {

      myRank.innerHTML =
        `👤 <strong>${escapeHTML(state.player)}</strong>
         — position <strong>#${index + 1}</strong>
         avec <strong>${Number(rows[index].score || 0).toLocaleString("fr-FR")}</strong> points`;

      myRank.classList.remove(
        "hidden"
      );

    }

  }

}


// ============================================================
// PROTECTION AFFICHAGE HTML
// ============================================================

function escapeHTML(value) {

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


function formatDate(value) {

  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }

  return date.toLocaleDateString(
    "fr-FR"
  );

}


// ============================================================
// FIN DE PARTIE
// ============================================================

function endGame() {

  state.running =
    false;

  clearTimeout(
    state.timer
  );

  const key =
    "defiExpertBest_" +
    state.player.toLowerCase();

  state.best =
    Number(
      localStorage.getItem(
        key
      ) || 0
    );

  const isNew =
    state.score >
    state.best;

  if (isNew) {

    state.best =
      state.score;

    localStorage.setItem(
      key,
      state.best
    );

  }

  // Sauvegarde locale immédiate
  saveLocalRanking();

  // Sauvegarde partagée Supabase
  saveScoreToSupabase();

  $("finalPlayer")
    .textContent =
    state.player;

  $("finalScore")
    .textContent =
    state.score.toLocaleString(
      "fr-FR"
    );

  $("finalBest")
    .textContent =
    state.best.toLocaleString(
      "fr-FR"
    );

  $("finalCombo")
    .textContent =
    state.maxCombo;

  $("finalLevel")
    .textContent =
    state.level;

  $("newRecord")
    .classList.toggle(
      "hidden",
      !isNew
    );

  show("gameover");

}


// ============================================================
// BOUTONS
// ============================================================

$("startBtn")
  .addEventListener(
    "click",
    startGame
  );


$("againBtn")
  .addEventListener(
    "click",
    startGame
  );


$("changePlayerBtn")
  .addEventListener(
    "click",
    () => {

      show("home");

      $("playerName").focus();

      $("playerName").select();

    }
  );


$("homeBtn")
  .addEventListener(
    "click",
    () => {

      state.running =
        false;

      clearTimeout(
        state.timer
      );

      show("home");

    }
  );


$("howBtn")
  .addEventListener(
  "click",
  () => show("how")
);


$("leaderboardBtn")
  .addEventListener(
    "click",
    () => show("leaderboard")
  );


$("aboutBtn")
  .addEventListener(
    "click",
    () => show("about")
  );


$("refreshLeaderboard")
  .addEventListener(
    "click",
    () => loadLeaderboard()
  );


document
  .querySelectorAll(
    "[data-back]"
  )
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => show("home")
      );

    }
  );


$("quitBtn")
  .addEventListener(
    "click",
    () => {

      state.running =
        false;

      clearTimeout(
        state.timer
      );

      show("home");

    }
  );


$("playerName")
  .addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter"
      ) {

        startGame();

      }

    }
  );


// ============================================================
// MESSAGE DE DÉMARRAGE
// ============================================================

console.log(
  "DÉFI EXPERT — Créé par Belfort"
);

if (!supabaseConfigured()) {

  console.warn(
    "Classement partagé désactivé : configure SUPABASE_URL et SUPABASE_KEY dans game.js."
  );

}
