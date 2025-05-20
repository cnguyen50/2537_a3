//Initial state
let firstCard = null;
let secondCard = null;
let clicks = 0;
let matchCount = 0;
let timer = null;
let lockBoard = false;
// default to easy
let totalPairs = 3;
let currentTime = 30;


const gameGrid = document.getElementById("game_grid");
const clicksText = document.getElementById("clicks");
const matchesText = document.getElementById("matches");
const totalPairText = document.getElementById("totalPair");
const pairsLeftText = document.getElementById("pairsLeft");
const timerText = document.getElementById("timer");

function updateStats() {
  clicksText.textContent = `Number of Clicks: ${clicks}`;
  matchesText.textContent = `Number of Matches: ${matchCount}`;
  totalPairText.textContent = `Total Number of Pairs: ${totalPairs}`;
  pairsLeftText.textContent = `Number of Pairs Left: ${totalPairs - matchCount}`;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function fetchPokemon() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1500");
  const data = await res.json();
  return data.results;
}

async function getPokemonImg(allPokemon, count) {
  const selected = [];
  const used = [];

  while (selected.length < count) {
    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    // const { name, url } = allPokemon[randomIndex];

    if (!used.includes(randomIndex)) {
      used.push(randomIndex);
      const name = allPokemon[randomIndex].name;
      const id = randomIndex + 1;
      const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

      selected.push({ name, image });
    }
  }

  return selected;
}

function createPairs(pokemonList) {
  const paired = [];
  for (let i = 0; i < pokemonList.length; i++) {
    paired.push(pokemonList[i]);
    paired.push(pokemonList[i]);
  }
  return shuffle(paired);
}

function createCard(pokemon, index) {
  const card = document.createElement("div");
  card.className = "card";

  const inner = document.createElement("div");
  inner.className = "card-inner";

  const front = document.createElement("img");
  front.className = "front_face";
  front.src = pokemon.image;

  const back = document.createElement("img");
  back.className = "back_face";
  back.src = "back.webp";

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  card.addEventListener("click", () => handleCardClick(card));

  return card;
}

async function renderBoard(pairCount) {
  const allPokemon = await fetchPokemon();
  const pokemonList = await getPokemonImg(allPokemon, pairCount);
  const deck = createPairs(pokemonList);

  // Clear previous board
  gameGrid.innerHTML = "";

  // Reset state
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchCount = 0;
  clicks = 0;
  totalPairs = pairCount;

  // Render cards
  deck.forEach((pokemon, index) => {
    const card = createCard(pokemon, index);
    gameGrid.appendChild(card);
  });

  updateStats();
}


function handleCardClick(card) {
  const inner = card.querySelector(".card-inner");
  
  if (lockBoard || inner.classList.contains("flip")) return;
  
  inner.classList.add("flip");
  
  if (!firstCard) {
    firstCard = card;
    return;
  }
  
  secondCard = card;
  clicks++;
  updateStats();
  
  const firstImg = firstCard.querySelector(".front_face").src;
  const secondImg = secondCard.querySelector(".front_face").src;
  
  if (firstImg === secondImg && firstCard !== secondCard) {
    firstCard.removeEventListener("click", handleCardClick);
    secondCard.removeEventListener("click", handleCardClick);
    matchCount++;
    updateStats();
    resetFlip();
    
    if (matchCount === totalPairs) {
      endGame(true);
    }
  } else {
    lockBoard = true;
    
    setTimeout(() => {
      firstCard.querySelector(".card-inner").classList.remove("flip");
      secondCard.querySelector(".card-inner").classList.remove("flip");
      resetFlip();
      lockBoard = false;
    }, 1000);
  }
}

//Edge case 2
function resetFlip() {
  firstCard = null;
  secondCard = null;
}

function endGame(won) {
  clearInterval(timer);
  won ? alert("You Win!") : alert("Game Over!");

  document.querySelectorAll(".card").forEach(card => {
    card.removeEventListener("click", handleCardClick);
  });
}

function powerUp() {
  alert("Power-Up Activated!");

  document.querySelectorAll(".card-inner").forEach(card => {
    card.classList.add("flip");
  });

  setTimeout(() => {
    document.querySelectorAll(".card-inner").forEach(card => {
      card.classList.remove("flip");
    });
    resetFlip();
  }, 2000);
}

function startTimer(seconds) {
  clearInterval(timer); // stop timer
  let timeLeft = seconds;
  let powerUpUsed = false;
  timerText.textContent = `Timer: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerText.textContent = `Timer: ${timeLeft}s`;

    // power-Up logic only for hard mode
    if (totalPairs === 12 && timeLeft === 70 && !powerUpUsed) {
      powerUpUsed = true;
      powerUp();
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame(false);
    }
  }, 1000);
}

document.getElementById("start").addEventListener("click", () => {
  clicks = 0;
  matchCount = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  updateStats();
  renderBoard(totalPairs);
  startTimer(currentTime); 
});

document.getElementById("reset").addEventListener("click", () => {
  clearInterval(timer);

  //Resets state
  firstCard = null;
  secondCard = null;
  clicks = 0;
  matchCount = 0;
  lockBoard = false;

  // Clears out message, board, and statss 
  gameGrid.innerHTML = "";
  timerText.textContent = "Timer:";
  pairsLeftText.textContent = "";
  totalPairText.textContent = "";
  updateStats();
});

function selectDiff(mode, pairs, time) {
  totalPairs = pairs;
  currentTime = time;

  document.body.classList.remove("easy", "medium", "hard");
  document.body.classList.add(mode);

  document.querySelectorAll("#difficulty button").forEach(btn =>
    btn.classList.remove("selected")
  );

  // Highlight the selected difficulty
  document.getElementById(mode).classList.add("selected");
}

document.getElementById("easy").addEventListener("click", () =>
  selectDiff("easy", 3, 30)
);

document.getElementById("medium").addEventListener("click", () =>
  selectDiff("medium", 6, 60)
);

document.getElementById("hard").addEventListener("click", () =>
  selectDiff("hard", 12, 90)
);

function setTheme(theme) {
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);

  document.querySelectorAll("#theme button").forEach(btn =>
    btn.classList.remove("selected-theme")
  );
  document.getElementById(theme).classList.add("selected-theme");
}

setTheme("light");

document.getElementById("dark").addEventListener("click", () => setTheme("dark"));
document.getElementById("light").addEventListener("click", () => setTheme("light"));
