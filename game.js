function startGame() {
  const playerName = document.getElementById("playerName");
  const nameError = document.getElementById("nameError");

  const name = playerName.value.trim();

  // Bloquer le démarrage si aucun pseudo n'est entré
  if (!name) {
    nameError.textContent =
      "Entre ton prénom ou ton pseudo pour commencer.";
    nameError.style.display = "block";

    playerName.focus();
    return;
  }

  // Effacer l'erreur
  nameError.textContent = "";
  nameError.style.display = "none";

  // Enregistrer le joueur
  state.playerName = name;
  state.playerKey = getPlayerKeyForName(name);

  // Continuer normalement le démarrage
  state.score = 0;
  state.level = 1;
  state.combo = 0;
  state.lives = 3;

  showScreen("game");
  updateGameUI();
  nextQuestion();
}
