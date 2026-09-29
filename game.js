const SUPABASE_URL = "https://snmmtigmbrrqdcesdzwg.supabase.co";
const SUPABASE_KEY = "sb_publishable_Hlb0Qbn-307abqSvRmyB8w_FbcsT3ze";
const TABLE = "scores";
const LEADERBOARD_LIMIT = 1000;

const $ = id => document.getElementById(id);
const screens = ["home","how","leaderboard","about","game","gameover"];

const SYMBOLS = ["★","◆","●","▲","■","✚","♥","⚡","☀"];
const state = {
  playerName: "",
  playerKey: "",
  score: 0,
  best: 0,
  combo: 0,
  maxCombo: 0,
  level: 1,
  lives: 3,
  target: "",
  roundSymbols: [],
  roundActive: false,
  roundStarted: 0,
  roundDuration: 3000,
  timerId: null,
  ended: false,
  saved: false
};

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").slice(0, 24);
}

function getPlayerKeyForName(playerName) {
  const storageKey = "defi_expert_player_keys";
  const mapKey = normalizeName(playerName).toLowerCase();
  let players = {};
  try { players = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch {}
  if (players[mapKey]) return players[mapKey];

  const key = (crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : "player-" + Date.now() + "-" + Math.random().toString(36).slice(2);

  players[mapKey] = key;
  try { localStorage.setItem(storageKey, JSON.stringify(players)); } catch {}
  return key;
}

function showScreen(id) {
  screens.forEach(s => $(s).classList.toggle("active", s === id));
  window.scrollTo(0, 0);
  if (id === "leaderboard") loadLeaderboard();
}

function setError(msg = "") { $("nameError").textContent = msg; }

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showFlash(type) {
  const f = $("flash");
  f.className = "flash " + type;
  setTimeout(() => f.className = "flash", 260);
}

function updateHUD() {
  $("score").textContent = state.score;
  $("level").textContent = state.level;
  $("combo").textContent = state.combo;
  $("hearts").textContent = "❤️".repeat(state.lives) + "🖤".repeat(3 - state.lives);
}

function roundDuration() {
  return Math.max(950, 3000 - (state.level - 1) * 170);
}

function createRound() {
  if (state.ended) return;

  state.roundActive = true;
  state.target = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const decoys = shuffle(SYMBOLS.filter(s => s !== state.target)).slice(0, 8);
  state.roundSymbols = shuffle([state.target, ...decoys.slice(0, 5)]);

  $("targetSymbol").textContent = state.target;
  $("statusText").textContent = "Choisis le symbole correspondant.";
  const board = $("board");
  board.innerHTML = "";

  state.roundSymbols.forEach(symbol => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = symbol;
    btn.setAttribute("aria-label", "Choisir " + symbol);
    btn.addEventListener("click", () => answer(symbol));
    board.appendChild(btn);
  });

  state.roundStarted = performance.now();
  state.roundDuration = roundDuration();
  clearInterval(state.timerId);
  state.timerId = setInterval(updateTimer, 40);
  updateTimer();
}

function updateTimer() {
  if (!state.roundActive || state.ended) return;
  const elapsed = performance.now() - state.roundStarted;
  const left = Math.max(0, state.roundDuration - elapsed);
  $("timerBar").style.width = (left / state.roundDuration * 100) + "%";
  if (left <= 0) {
    clearInterval(state.timerId);
    timeoutRound();
  }
}

function disableChoices() {
  document.querySelectorAll(".choice").forEach(b => b.disabled = true);
}

function answer(symbol) {
  if (!state.roundActive || state.ended) return;
  state.roundActive = false;
  clearInterval(state.timerId);
  disableChoices();

  if (symbol === state.target) {
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    const bonus = Math.min(250, state.combo * 10);
    state.score += 100 + bonus + state.level * 10;
    state.level = Math.floor(state.score / 1000) + 1;
    $("statusText").textContent = "✓ Bonne réponse !";
    showFlash("good");
  } else {
    loseLife();
    $("statusText").textContent = "✕ Mauvaise réponse.";
    showFlash("bad");
  }

  updateHUD();
  setTimeout(() => {
    if (!state.ended) createRound();
  }, 240);
}

function timeoutRound() {
  if (!state.roundActive || state.ended) return;
  state.roundActive = false;
  disableChoices();
  state.combo = 0;
  loseLife();
  $("statusText").textContent = "⌛ Temps écoulé.";
  showFlash("bad");
  updateHUD();
  setTimeout(() => {
    if (!state.ended) createRound();
  }, 300);
}

function loseLife() {
  state.lives--;
  state.combo = 0;
  updateHUD();
  if (state.lives <= 0) endGame();
}

function startGame() {
  const name = normalizeName($("playerName").value);
  if (!name) {
    setError("Entre ton prénom ou ton pseudo.");
    $("playerName").focus();
    return;
  }

  setError("");
  state.playerName = name;
  state.playerKey = getPlayerKeyForName(name);
  state.score = 0;
  state.best = Number(localStorage.getItem("defi_expert_best_" + name.toLowerCase()) || 0);
  state.combo = 0;
  state.maxCombo = 0;
  state.level = 1;
  state.lives = 3;
  state.ended = false;
  state.saved = false;

  $("gamePlayer").textContent = state.playerName;
  $("survivalBanner").textContent = "MODE SURVIE";
  updateHUD();
  showScreen("game");
  createRound();
}

async function endGame() {
  if (state.ended) return;
  state.ended = true;
  state.roundActive = false;
  clearInterval(state.timerId);
  disableChoices();

  const previousBest = state.best;
  const isRecord = state.score > previousBest;
  state.best = Math.max(previousBest, state.score);

  try {
    localStorage.setItem("defi_expert_best_" + state.playerName.toLowerCase(), String(state.best));
  } catch {}

  $("finalPlayer").textContent = state.playerName;
  $("finalScore").textContent = state.score;
  $("finalBest").textContent = state.best;
  $("finalCombo").textContent = state.maxCombo;
  $("finalLevel").textContent = state.level;
  $("newRecord").classList.toggle("show", isRecord);
  $("saveStatus").textContent = "Enregistrement du score…";
  showScreen("gameover");

  const result = await saveScore();
  $("saveStatus").textContent = result.ok
    ? "✓ Score enregistré dans le classement."
    : "⚠️ Score local conservé. Vérifie la connexion.";
}

function authHeaders() {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
  };
}

async function saveScore() {
  try {
    const searchUrl =
      `${SUPABASE_URL}/rest/v1/${TABLE}` +
      `?select=id,player_name,player_key,score,max_combo,level` +
      `&player_key=eq.${encodeURIComponent(state.playerKey)}&limit=1`;

    const searchRes = await fetch(searchUrl, {
      headers: authHeaders(),
      cache: "no-store"
    });

    if (!searchRes.ok) {
      console.error("ERREUR RECHERCHE JOUEUR", searchRes.status, await searchRes.text());
      return { ok: false };
    }

    const rows = await searchRes.json();

    if (rows.length) {
      const row = rows[0];

      if (Number(state.score) > Number(row.score || 0)) {
        const updateUrl = `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(row.id)}`;
        const updateRes = await fetch(updateUrl, {
          method: "PATCH",
          headers: { ...authHeaders(), "Prefer": "return=minimal" },
          body: JSON.stringify({
            player_name: state.playerName,
            score: state.score,
            max_combo: state.maxCombo,
            level: state.level,
            updated_at: new Date().toISOString()
          })
        });

        if (!updateRes.ok) {
          console.error("ERREUR MISE À JOUR SCORE", updateRes.status, await updateRes.text());
          return { ok: false };
        }
      }
      return { ok: true };
    }

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: { ...authHeaders(), "Prefer": "return=minimal" },
      body: JSON.stringify({
        player_name: state.playerName,
        player_key: state.playerKey,
        score: state.score,
        max_combo: state.maxCombo,
        level: state.level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    if (!insertRes.ok) {
      console.error("ERREUR INSERTION SCORE", insertRes.status, await insertRes.text());
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    console.error("ERREUR SUPABASE", error);
    return { ok: false };
  }
}

function localFallback() {
  try {
    return JSON.parse(localStorage.getItem("defi_expert_leaderboard") || "[]");
  } catch {
    return [];
  }
}

function saveLocalFallback() {
  const list = localFallback();
  const existing = list.findIndex(x => x.player_key === state.playerKey);
  const entry = {
    player_name: state.playerName,
    player_key: state.playerKey,
    score: state.score,
    max_combo: state.maxCombo,
    level: state.level
  };

  if (existing >= 0) {
    if (state.score > Number(list[existing].score || 0)) list[existing] = entry;
  } else {
    list.push(entry);
  }

  list.sort((a,b) => Number(b.score || 0) - Number(a.score || 0));
  try { localStorage.setItem("defi_expert_leaderboard", JSON.stringify(list.slice(0, 1000))); } catch {}
}

async function loadLeaderboard() {
  const box = $("leaderboardList");
  box.innerHTML = '<div class="loading">Chargement du classement…</div>';

  try {
    const url =
      `${SUPABASE_URL}/rest/v1/${TABLE}` +
      `?select=id,player_name,player_key,score,max_combo,level,created_at` +
      `&order=score.desc&limit=${LEADERBOARD_LIMIT}`;

    const res = await fetch(url, {
      headers: authHeaders(),
      cache: "no-store"
    });

    if (!res.ok) {
      console.error("ERREUR CLASSEMENT", res.status, await res.text());
      throw new Error("Classement indisponible");
    }

    const rows = await res.json();
    renderLeaderboard(rows);
  } catch (error) {
    console.error(error);
    const rows = localFallback();
    if (rows.length) {
      renderLeaderboard(rows);
      $("myRank").textContent = "Mode local temporaire.";
    } else {
      box.innerHTML = '<div class="empty">Impossible de charger le classement.</div>';
    }
  }
}

function renderLeaderboard(rows) {
  const box = $("leaderboardList");
  if (!rows.length) {
    box.innerHTML = '<div class="empty">Aucun joueur pour le moment. Sois le premier !</div>';
    $("myRank").textContent = "";
    return;
  }

  box.innerHTML = rows.map((row, index) => {
    const mine = state.playerKey && row.player_key === state.playerKey;
    const rank = index + 1;
    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
    return `
      <div class="rank-row ${mine ? "mine" : ""}">
        <div class="rank ${rank <= 3 ? "top" : ""}">${medal}</div>
        <div class="player">
          <strong>${escapeHtml(row.player_name || "Joueur")}</strong>
          <small>Niveau ${Number(row.level || 1)} · Combo ${Number(row.max_combo || 0)}</small>
        </div>
        <div class="points">${Number(row.score || 0)}</div>
      </div>`;
  }).join("");

  const mineIndex = rows.findIndex(row => state.playerKey && row.player_key === state.playerKey);
  $("myRank").textContent = mineIndex >= 0
    ? `Ta position : #${mineIndex + 1}`
    : "Joue une partie pour apparaître dans le classement.";
}

$("startBtn").addEventListener("click", startGame);
$("playerName").addEventListener("keydown", e => {
  if (e.key === "Enter") startGame();
});
$("clearName").addEventListener("click", () => {
  $("playerName").value = "";
  setError("");
  $("playerName").focus();
});
$("leaderboardBtn").addEventListener("click", () => showScreen("leaderboard"));
$("howBtn").addEventListener("click", () => showScreen("how"));
$("aboutBtn").addEventListener("click", () => showScreen("about"));
$("refreshLeaderboard").addEventListener("click", loadLeaderboard);
document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.back));
});
$("againBtn").addEventListener("click", startGame);
$("changePlayerBtn").addEventListener("click", () => {
  showScreen("home");
  $("playerName").focus();
});
$("homeBtn").addEventListener("click", () => showScreen("home"));
$("quitBtn").addEventListener("click", () => {
  clearInterval(state.timerId);
  state.ended = true;
  showScreen("home");
});

$("playerName").value = "";
