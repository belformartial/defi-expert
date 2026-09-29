<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  >

  <meta
    name="description"
    content="DÉFI EXPERT — teste tes réflexes, ton attention et ta rapidité."
  >

  <meta name="theme-color" content="#08111f">

  <title>DÉFI EXPERT — Créé par Belfort</title>

  <!-- CSS -->
  <link
    rel="stylesheet"
    href="style.css?v=final-20260930"
  >
</head>

<body>

  <main class="app">

    <!-- =========================================================
         ACCUEIL
    ========================================================== -->

    <section id="home" class="screen active">

      <header class="topbar">

        <div class="brand">
          <div class="brand-title">
            DÉFI <span>EXPERT</span>
          </div>

          <div class="brand-subtitle">
            MODE RÉFLEXE
          </div>
        </div>

        <div class="creator">
          Créé par Belfort
        </div>

      </header>


      <div class="home-content">

        <div class="hero-badge">
          ⚡ MODE RÉFLEXE
        </div>

        <h1>
          Teste tes réflexes.
        </h1>

        <p class="hero-text">
          Observe. Réfléchis. Réagis.<br>
          Jusqu'où peux-tu aller ?
        </p>


        <!-- CARTE JOUEUR -->

        <div class="player-card">

          <label for="playerName">
            TON PRÉNOM OU PSEUDO
          </label>

          <div class="name-input-wrap">

            <input
              id="playerName"
              type="text"
              maxlength="18"
              autocomplete="nickname"
              placeholder="Ex. Belfort"
              spellcheck="false"
            >

            <button
              id="clearName"
              class="clear-name"
              type="button"
              aria-label="Effacer le nom"
              title="Effacer"
            >
              ×
            </button>

          </div>


          <div
            id="nameError"
            class="name-error hidden"
            role="alert"
            aria-live="polite"
          >
            Entre ton prénom ou ton pseudo pour commencer.
          </div>


          <button
            id="startBtn"
            class="primary-btn"
            type="button"
          >
            COMMENCER
          </button>

        </div>


        <!-- MENU -->

        <div class="menu-grid">

          <button
            id="howBtn"
            class="menu-card"
            type="button"
          >
            <span class="menu-icon">
              🎯
            </span>

            <span>
              <strong>
                Comment jouer
              </strong>

              <small>
                Découvrir les règles
              </small>
            </span>
          </button>


          <button
            class="menu-card"
            type="button"
            onclick="show('about')"
          >
            <span class="menu-icon">
              ℹ️
            </span>

            <span>
              <strong>
                À propos
              </strong>

              <small>
                À propos de DÉFI EXPERT
              </small>
            </span>
          </button>

        </div>

      </div>


      <footer class="footer">
        © DÉFI EXPERT · Créé par Belfort
      </footer>

    </section>


    <!-- =========================================================
         COMMENT JOUER
    ========================================================== -->

    <section id="how" class="screen">

      <div class="page-header">

        <button
          class="back-btn"
          data-back="home"
          type="button"
          aria-label="Retour"
        >
          ←
        </button>

        <div>

          <h2>
            Comment jouer
          </h2>

          <p>
            Les règles du défi
          </p>

        </div>

      </div>


      <div class="info-card">

        <div class="info-item">

          <div class="info-number">
            01
          </div>

          <div>

            <h3>
              Entre ton pseudo
            </h3>

            <p>
              Choisis ton prénom ou ton pseudo avant de commencer.
            </p>

          </div>

        </div>


        <div class="info-item">

          <div class="info-number">
            02
          </div>

          <div>

            <h3>
              Observe la cible
            </h3>

            <p>
              Un symbole apparaît au centre de l'écran.
            </p>

          </div>

        </div>


        <div class="info-item">

          <div class="info-number">
            03
          </div>

          <div>

            <h3>
              Choisis le bon symbole
            </h3>

            <p>
              Repère rapidement le symbole cible parmi les figures proposées.
            </p>

          </div>

        </div>


        <div class="info-item">

          <div class="info-number">
            04
          </div>

          <div>

            <h3>
              Sois rapide
            </h3>

            <p>
              Le chronomètre diminue pendant chaque manche.
            </p>

          </div>

        </div>


        <div class="info-item">

          <div class="info-number">
            05
          </div>

          <div>

            <h3>
              Attention aux erreurs
            </h3>

            <p>
              Tu disposes de trois vies. Une erreur ou un temps écoulé te fait perdre une vie.
            </p>

          </div>

        </div>

      </div>


      <button
        class="secondary-btn"
        data-back="home"
        type="button"
      >
        RETOUR
      </button>

    </section>


    <!-- =========================================================
         À PROPOS
    ========================================================== -->

    <section id="about" class="screen">

      <div class="page-header">

        <button
          class="back-btn"
          data-back="home"
          type="button"
          aria-label="Retour"
        >
          ←
        </button>

        <div>

          <h2>
            À propos
          </h2>

          <p>
            DÉFI EXPERT
          </p>

        </div>

      </div>


      <div class="about-card">

        <div class="about-logo">
          DE
        </div>

        <h2>
          DÉFI EXPERT
        </h2>

        <p>
          Un jeu de réflexion et de rapidité conçu pour tester
          tes réflexes, ton attention et ta capacité à réagir
          sous pression.
        </p>


        <div class="creator-box">

          <span>
            CRÉATEUR
          </span>

          <strong>
            Créé par Belfort
          </strong>

        </div>


        <div class="version">
          Version 1.0
        </div>

      </div>


      <button
        class="secondary-btn"
        data-back="home"
        type="button"
      >
        RETOUR
      </button>

    </section>


    <!-- =========================================================
         JEU
    ========================================================== -->

    <section id="game" class="screen">

      <!-- BARRE SUPÉRIEURE -->

      <div class="game-topbar">

        <div class="game-player-block">

          <span>
            JOUEUR
          </span>

          <strong id="gamePlayer">
            ---
          </strong>

        </div>


        <button
          id="quitBtn"
          class="quit-btn"
          type="button"
        >
          QUITTER
        </button>

      </div>


      <!-- STATISTIQUES -->

      <div class="stats">

        <div class="stat-box">

          <span>
            SCORE
          </span>

          <strong id="score">
            0
          </strong>

        </div>


        <div class="stat-box">

          <span>
            NIVEAU
          </span>

          <strong id="level">
            1
          </strong>

        </div>


        <div class="stat-box">

          <span>
            COMBO
          </span>

          <strong id="combo">
            0
          </strong>

        </div>

      </div>


      <!-- VIES -->

      <div class="lives-row">

        <span>
          VIES
        </span>

        <strong id="hearts">
          ❤️❤️❤️
        </strong>

      </div>


      <!-- MODE SURVIE -->

      <div
        id="survivalBanner"
        class="survival-banner hidden"
      >
        MODE SURVIE
      </div>


      <!-- CHRONOMÈTRE -->

      <div class="timer-container">

        <div
          id="timerBar"
          class="timer-bar"
        ></div>

      </div>


      <!-- CIBLE -->

      <div class="target-section">

        <div class="target-label">
          SYMBOLE CIBLE
        </div>


        <div
          id="targetSymbol"
          class="target-symbol"
        >
          ★
        </div>


        <div
          id="statusText"
          class="status-text"
        >
          Choisis le symbole correspondant.
        </div>

      </div>


      <!-- GRILLE DES FIGURES -->

      <div
        id="board"
        class="answer-board"
      ></div>


      <!-- FLASH D'ERREUR -->

      <div
        id="flash"
        class="flash"
        aria-hidden="true"
      ></div>

    </section>


    <!-- =========================================================
         FIN DE PARTIE
    ========================================================== -->

    <section id="gameover" class="screen">

      <div class="gameover-card">

        <div class="gameover-icon">
          🏆
        </div>


        <div class="gameover-label">
          PARTIE TERMINÉE
        </div>


        <h2>
          Bien joué,
          <span id="finalPlayer">
            ---
          </span>
        </h2>


        <!-- SCORE FINAL -->

        <div class="final-score-box">

          <span>
            SCORE
          </span>

          <strong id="finalScore">
            0
          </strong>

        </div>


        <!-- STATISTIQUES FINALES -->

        <div class="final-stats">

          <div>

            <span>
              MEILLEUR SCORE
            </span>

            <strong id="finalBest">
              0
            </strong>

          </div>


          <div>

            <span>
              COMBO
            </span>

            <strong id="finalCombo">
              0
            </strong>

          </div>


          <div>

            <span>
              NIVEAU
            </span>

            <strong id="finalLevel">
              1
            </strong>

          </div>

        </div>


        <!-- NOUVEAU RECORD -->

        <div
          id="newRecord"
          class="new-record hidden"
        >
          ★ NOUVEAU RECORD ★
        </div>


        <!-- ACTIONS -->

        <div class="gameover-actions">

          <button
            id="againBtn"
            class="primary-btn"
            type="button"
          >
            REJOUER
          </button>


          <button
            id="changePlayerBtn"
            class="secondary-btn"
            type="button"
          >
            CHANGER DE JOUEUR
          </button>


          <button
            id="homeBtn"
            class="text-btn"
            type="button"
          >
            RETOUR À L'ACCUEIL
          </button>

        </div>

      </div>

    </section>

  </main>


  <!-- =========================================================
       JAVASCRIPT
  ========================================================== -->

  <script src="game.js?v=final-20260930"></script>

</body>
</html>
