/* =========================================================
   DÉFI EXPERT
   Jeu de réflexes & rapidité
   Créé par Belfort
   ========================================================= */

"use strict";

/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://snmmtigmbrrqdcesdzwg.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Hlb0Qbn-307abqSvRmyB8w_FbcsT3ze";

let supabaseClient = null;


/* =========================================================
   CHARGEMENT SUPABASE
   ========================================================= */

function loadSupabase() {

    return new Promise((resolve, reject) => {

        if (window.supabase) {

            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );

            resolve();

            return;
        }


        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = () => {

            if (!window.supabase) {

                reject(
                    new Error(
                        "Supabase JS n'a pas pu être chargé."
                    )
                );

                return;
            }


            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );


            resolve();

        };


        script.onerror = () => {

            reject(
                new Error(
                    "Impossible de charger Supabase."
                )
            );

        };


        document.head.appendChild(script);

    });

}


/* =========================================================
   CONFIGURATION
   ========================================================= */

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


const CONFIG = {

    maxLives: 3,

    maxPlayerName: 18,

    leaderboardPageSize: 1000,

    creator: "Créé par Belfort"

};


/* =========================================================
   ÉTAT DU JEU
   ========================================================= */

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

    player: "",

    scoreSaved: false

};


/* =========================================================
   DOM
   ========================================================= */

const $ = id =>
    document.getElementById(id);


const screens = [
    "home",
    "how",
    "game",
    "gameover"
];


function show(id) {

    screens.forEach(screen => {

        const element = $(screen);

        if (element) {

            element.classList.toggle(
                "active",
                screen === id
            );

        }

    });

}


/* =========================================================
   UTILITAIRES
   ========================================================= */

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


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


function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =========================================================
   PROFIL LOCAL
   ========================================================= */

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


function loadProfile() {

    const name =
        getSavedName();


    const input =
        $("playerName");


    if (input) {

        input.value =
            name;

    }


    state.player =
        name;

}


/* =========================================================
   DIFFICULTÉ
   ========================================================= */

function difficulty() {

    return {

        tiles:
            Math.min(
                9,
                5 +
                Math.floor(
                    (state.level - 1) / 2
                )
            ),

        time:
            Math.max(
                700,
                2300 -
                (state.level - 1) * 115
            )

    };

}


/* =========================================================
   DÉMARRER
   ========================================================= */

async function startGame() {

    const input =
        $("playerName");


    const raw =
        input
            ? input.value.trim()
            : "";


    if (!raw) {

        const error =
            $("nameError");


        if (error) {

            error.classList.remove(
                "hidden"
            );

        }


        input?.focus();

        return;

    }


    const name =
        raw
            .replace(/\s+/g, " ")
            .slice(
                0,
                CONFIG.maxPlayerName
            );


    if (input) {

        input.value =
            name;

    }


    saveName(name);


    state.best =
        Number(
            localStorage.getItem(
                "defiExpertBest_" +
                name.toLowerCase()
            ) || 0
        );


    state.score = 0;

    state.lives =
        CONFIG.maxLives;

    state.combo = 0;

    state.maxCombo = 0;

    state.level = 1;

    state.round = 0;

    state.running = true;

    state.scoreSaved = false;


    $("gamePlayer").textContent =
        name;


    $("survivalBanner")
        ?.classList.add("hidden");


    show("game");

    updateHUD();

    nextRound();

}


/* =========================================================
   CRÉER LES CASES
   ========================================================= */

function makeTiles() {

    const board =
        $("board");


    if (!board) {
        return;
    }


    board.innerHTML = "";


    const d =
        difficulty();


    const choices =
        shuffle(
            [...SYMBOLS]
        ).slice(
            0,
            d.tiles
        );


    state.target =
        choices[
            Math.floor(
                Math.random() *
                choices.length
            )
        ];


    $("targetSymbol").textContent =
        state.target;


    let symbols =
        [...choices];


    while (
        symbols.length < 9
    ) {

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


    shuffle(symbols)
        .forEach(symbol => {

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
                () =>
                    tapTile(
                        tile,
                        symbol
                    ),
                {
                    once: true
                }
            );


            board.appendChild(
                tile
            );

        });

}


/* =========================================================
   TOUR SUIVANT
   ========================================================= */

function nextRound() {

    if (!state.running) {
        return;
    }


    state.round++;


    state.level =
        Math.min(
            99,
            1 +
            Math.floor(
                state.round / 6
            )
        );


    updateHUD();


    makeTiles();


    startTimer(
        difficulty().time
    );

}


/* =========================================================
   CHRONOMÈTRE
   ========================================================= */

function startTimer(ms) {

    clearTimeout(
        state.timer
    );


    const start =
        performance.now();


    state.deadline =
        start + ms;


    const bar =
        $("timerBar");


    if (bar) {

        bar.style.transition =
            "none";

        bar.style.width =
            "100%";


        requestAnimationFrame(() => {

            bar.style.transition =
                `width ${ms}ms linear`;

            bar.style.width =
                "0%";

        });

    }


    state.timer =
        setTimeout(
            () =>
                miss(
                    "Temps écoulé !"
                ),
            ms
        );

}


/* =========================================================
   CLIC SUR UNE CASE
   ========================================================= */

function tapTile(
    tile,
    symbol
) {

    if (
        !state.running
    ) {

        return;

    }


    clearTimeout(
        state.timer
    );


    if (
        symbol ===
        state.target
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


        $("statusText").textContent =
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


/* =========================================================
   ERREUR
   ========================================================= */

function miss(message) {

    if (!state.running) {
        return;
    }


    clearTimeout(
        state.timer
    );


    state.lives--;

    state.combo = 0;


    $("statusText").textContent =
        message;


    $("flash")
        ?.classList.add("show");


    setTimeout(
        () =>
            $("flash")
                ?.classList
                .remove("show"),
        220
    );


    updateHUD();


    if (
        state.lives <= 0
    ) {

        endGame();

        return;

    }


    if (
        state.lives === 1
    ) {

        $("survivalBanner")
            ?.classList
            .remove("hidden");


        setTimeout(
            () =>
                $("survivalBanner")
                    ?.classList
                    .add("hidden"),
            900
        );

    }


    setTimeout(
        nextRound,
        350
    );

}


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

    if ($("score")) {

        $("score").textContent =
            state.score.toLocaleString(
                "fr-FR"
            );

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
                state.lives
            ) +
            "🖤".repeat(
                CONFIG.maxLives -
                state.lives
            );

    }

}


/* =========================================================
   FIN DE PARTIE
   ========================================================= */

async function endGame() {

    if (!state.running) {
        return;
    }


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


    $("finalPlayer").textContent =
        state.player;


    $("finalScore").textContent =
        state.score.toLocaleString(
            "fr-FR"
        );


    $("finalBest").textContent =
        state.best.toLocaleString(
            "fr-FR"
        );


    $("finalCombo").textContent =
        state.maxCombo;


    $("finalLevel").textContent =
        state.level;


    $("newRecord")
        ?.classList
        .toggle(
            "hidden",
            !isNew
        );


    show("gameover");


    /* ENREGISTREMENT GLOBAL */
    await saveGlobalScore();


    /* ACTUALISATION DU CLASSEMENT */
    await loadLeaderboard();

}


/* =========================================================
   ENREGISTRER LE SCORE DANS SUPABASE
   ========================================================= */

async function saveGlobalScore() {

    if (
        state.scoreSaved ||
        !supabaseClient ||
        !state.player
    ) {

        return;

    }


    state.scoreSaved =
        true;


    const payload = {

        player_name:
            state.player,

        score:
            Math.max(
                0,
                Math.floor(
                    state.score
                )
            ),

        max_combo:
            Math.max(
                0,
                Math.floor(
                    state.maxCombo
                )
            ),

        level:
            Math.max(
                1,
                Math.floor(
                    state.level
                )
            )

    };


    const {
        error
    } =
        await supabaseClient
            .from(
                "defi_expert_scores"
            )
            .insert(
                payload
            );


    if (error) {

        console.error(
            "Erreur classement Supabase :",
            error
        );


        state.scoreSaved =
            false;

    }

}


/* =========================================================
   CRÉER L'INTERFACE CLASSEMENT
   ========================================================= */

function createLeaderboardUI() {

    if (
        $("leaderboardOverlay")
    ) {

        return;

    }


    const howButton =
        $("howBtn");


    if (!howButton) {
        return;
    }


    const leaderboardButton =
        document.createElement(
            "button"
        );


    leaderboardButton.id =
        "leaderboardBtn";


    leaderboardButton.className =
        "text-btn";


    leaderboardButton.textContent =
        "🏆 Classement mondial";


    leaderboardButton.addEventListener(
        "click",
        openLeaderboard
    );


    howButton.insertAdjacentElement(
        "afterend",
        leaderboardButton
    );


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "leaderboardOverlay";


    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:9999;
        display:none;
        background:rgba(5,8,18,.94);
        padding:20px;
        overflow:auto;
    `;


    overlay.innerHTML = `

        <div style="
            max-width:700px;
            margin:20px auto;
            background:#101522;
            border:1px solid rgba(255,255,255,.12);
            border-radius:22px;
            padding:22px;
            color:white;
            box-shadow:0 20px 60px rgba(0,0,0,.4);
        ">

            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:12px;
                margin-bottom:18px;
            ">

                <div>
                    <div style="
                        font-size:12px;
                        opacity:.65;
                        letter-spacing:1px;
                    ">
                        DÉFI EXPERT
                    </div>

                    <h2 style="
                        margin:4px 0 0;
                        font-size:28px;
                    ">
                        🏆 Classement mondial
                    </h2>
                </div>

                <button
                    id="closeLeaderboard"
                    style="
                        width:42px;
                        height:42px;
                        border:0;
                        border-radius:50%;
                        font-size:24px;
                        cursor:pointer;
                    "
                >
                    ×
                </button>

            </div>


            <div
                id="leaderboardStatus"
                style="
                    text-align:center;
                    padding:20px;
                    opacity:.7;
                "
            >
                Chargement du classement...
            </div>


            <div
                id="leaderboardList"
                style="
                    display:flex;
                    flex-direction:column;
                    gap:8px;
                "
            ></div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    $("closeLeaderboard")
        .addEventListener(
            "click",
            closeLeaderboard
        );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                closeLeaderboard();

            }

        }
    );

}


/* =========================================================
   OUVRIR CLASSEMENT
   ========================================================= */

async function openLeaderboard() {

    const overlay =
        $("leaderboardOverlay");


    if (!overlay) {
        return;
    }


    overlay.style.display =
        "block";


    await loadLeaderboard();

}


/* =========================================================
   FERMER CLASSEMENT
   ========================================================= */

function closeLeaderboard() {

    const overlay =
        $("leaderboardOverlay");


    if (overlay) {

        overlay.style.display =
            "none";

    }

}


/* =========================================================
   CHARGER TOUS LES SCORES
   ========================================================= */

async function loadLeaderboard() {

    const list =
        $("leaderboardList");


    const status =
        $("leaderboardStatus");


    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (status) {

        status.textContent =
            "Chargement du classement...";

    }


    if (!supabaseClient) {

        if (status) {

            status.textContent =
                "Connexion au classement indisponible.";

        }

        return;

    }


    try {

        let allScores = [];

        let from = 0;

        const pageSize =
            CONFIG.leaderboardPageSize;


        while (true) {

            const to =
                from +
                pageSize -
                1;


            const {
                data,
                error
            } =
                await supabaseClient

                    .from(
                        "defi_expert_scores"
                    )

                    .select(
                        "id,player_name,score,max_combo,level,created_at"
                    )

                    .order(
                        "score",
                        {
                            ascending:
                                false
                        }
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                true
                        }
                    )

                    .range(
                        from,
                        to
                    );


            if (error) {
                throw error;
            }


            if (
                !data ||
                data.length === 0
            ) {

                break;

            }


            allScores =
                allScores.concat(
                    data
                );


            if (
                data.length <
                pageSize
            ) {

                break;

            }


            from +=
                pageSize;

        }


        renderLeaderboard(
            allScores
        );


    } catch (error) {

        console.error(
            "Erreur chargement classement :",
            error
        );


        if (status) {

            status.textContent =
                "Impossible de charger le classement.";

        }

    }

}


/* =========================================================
   AFFICHER LE CLASSEMENT
   ========================================================= */

function renderLeaderboard(
    scores
) {

    const list =
        $("leaderboardList");


    const status =
        $("leaderboardStatus");


    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (
        !scores ||
        scores.length === 0
    ) {

        if (status) {

            status.textContent =
                "Aucun joueur n'a encore enregistré de score.";

        }

        return;

    }


    if (status) {

        status.textContent =
            `${scores.length} score${scores.length > 1 ? "s" : ""} enregistré${scores.length > 1 ? "s" : ""}`;

    }


    scores.forEach(
        (entry, index) => {

            const row =
                document.createElement(
                    "div"
                );


            const position =
                index + 1;


            const medal =
                position === 1
                    ? "🥇"
                    : position === 2
                        ? "🥈"
                        : position === 3
                            ? "🥉"
                            : `#${position}`;


            row.style.cssText = `
                display:grid;
                grid-template-columns:55px 1fr auto;
                align-items:center;
                gap:10px;
                padding:13px 14px;
                border-radius:14px;
                background:rgba(255,255,255,.06);
            `;


            row.innerHTML = `

                <strong style="
                    font-size:16px;
                    text-align:center;
                ">
                    ${medal}
                </strong>

                <div>

                    <strong style="
                        display:block;
                        font-size:16px;
                    ">
                        ${escapeHTML(
                            entry.player_name
                        )}
                    </strong>

                    <small style="
                        opacity:.55;
                    ">
                        Niveau ${entry.level}
                        · Combo ${entry.max_combo}
                    </small>

                </div>

                <strong style="
                    font-size:17px;
                ">
                    ${Number(
                        entry.score
                    ).toLocaleString(
                        "fr-FR"
                    )} pts
                </strong>

            `;


            list.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   ÉVÉNEMENTS
   ========================================================= */

function setupEvents() {

    $("clearName")
        ?.addEventListener(
            "click",
            () => {

                $("playerName").value =
                    "";

                localStorage.removeItem(
                    "defiExpertPlayer"
                );

                $("playerName").focus();

            }
        );


    $("playerName")
        ?.addEventListener(
            "input",
            () => {

                $("nameError")
                    ?.classList
                    .add("hidden");

            }
        );


    $("playerName")
        ?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    startGame();

                }

            }
        );


    $("startBtn")
        ?.addEventListener(
            "click",
            startGame
        );


    $("againBtn")
        ?.addEventListener(
            "click",
            startGame
        );


    $("changePlayerBtn")
        ?.addEventListener(
            "click",
            () => {

                show("home");

                $("playerName")
                    ?.focus();

                $("playerName")
                    ?.select();

            }
        );


    $("homeBtn")
        ?.addEventListener(
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
        ?.addEventListener(
            "click",
            () =>
                show("how")
        );


    document
        .querySelectorAll(
            "[data-back]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    show("home")
            );

        });


    $("quitBtn")
        ?.addEventListener(
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

}


/* =========================================================
   INITIALISATION
   ========================================================= */

async function initialize() {

    loadProfile();

    setupEvents();

    createLeaderboardUI();


    try {

        await loadSupabase();

        console.log(
            "DÉFI EXPERT : Supabase connecté."
        );


    } catch (error) {

        console.error(
            "DÉFI EXPERT : Supabase indisponible.",
            error
        );

    }

}


/* =========================================================
   LANCEMENT
   ========================================================= */

initialize();


/* =========================================================
   API PUBLIQUE
   ========================================================= */

window.DefiExpert = {

    startGame,

    openLeaderboard,

    closeLeaderboard,

    loadLeaderboard,

    getState:
        () => ({
            ...state
        })

};
