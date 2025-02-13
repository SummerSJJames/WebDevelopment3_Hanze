const gameBoard = document.getElementById("game-board");
const startButton = document.getElementById("start-game");
const timeDisplay = document.getElementById("elapsed-time");
const imageSelect = document.getElementById("image-type");
const boardSizeSelect = document.getElementById("board-size");
const loginSection = document.getElementById('login-section');
const gameSections = document.querySelectorAll('.hidden');
const topFiveList = document.getElementById("top-five-list");
const foundPairs = document.getElementById("found-pairs");

let boardSize = DEFAULT_BOARD_SIZE;
let cards = [];
let firstCard = null;
let secondCard = null;
let matchesFound = 0;
let startTime;
let timerInterval;
let imageSource = 'dog';
let isProcessing = false;

const initializeGame = async () => {
    resetGame();
    applyStoredPreferences();

    const totalCards = boardSize * boardSize;
    const uniqueImages = await generateRandomImages(totalCards / 2, imageSource); // Geef imageSource mee
    const allImages = [...uniqueImages, ...uniqueImages].sort(() => Math.random() - 0.5);

    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;

    allImages.forEach((imageUrl) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.image = imageUrl;

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = "Image";
        img.classList.add("card-image");
        img.style.display = "none";
        card.appendChild(img);

        card.addEventListener("click", handleCardClick);
        gameBoard.appendChild(card);
        cards.push(card);
    });
    startTimer();
};

function handleCardClick(event) {
    const clickedCard = event.target.closest('.card');

    if (isProcessing || clickedCard.classList.contains("open") || clickedCard.classList.contains("matched")) {
        return;
    }

    clickedCard.classList.add("open");
    const img = clickedCard.querySelector("img");
    img.style.display = "block";

    if (!firstCard) {
        firstCard = clickedCard;
    } else {
        secondCard = clickedCard;
        isProcessing = true;

        if (firstCard.dataset.image === secondCard.dataset.image) {
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            firstCard = null;
            secondCard = null;
            matchesFound++;
            foundPairs.textContent = matchesFound;

            if (matchesFound === cards.length / 2) {
                setTimeout(() => {
                    endGame();
                }, 500);
            }

            setTimeout(() => {
                isProcessing = false;
            }, 300);

        } else {
            setTimeout(() => {
                firstCard.classList.remove("open");
                secondCard.classList.remove("open");
                firstCard.querySelector("img").style.display = "none";
                secondCard.querySelector("img").style.display = "none";
                firstCard = null;
                secondCard = null;

                isProcessing = false;
            }, 500);
        }
    }
}

const resetGame = () => {
    gameBoard.innerHTML = "";
    cards = [];
    firstCard = null;
    secondCard = null;
    matchesFound = 0;
    clearInterval(timerInterval);
    timeDisplay.textContent = "0";
    foundPairs.textContent = "0";
};

const startTimer = () => {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        timeDisplay.textContent = elapsedTime;
    }, 1000);
};

const endGame = async () => {
    clearInterval(timerInterval);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    alert(`Gefeliciteerd! Je hebt alle paren gevonden in ${totalTime} seconden.`);

    const userId = localStorage.getItem("userId");

    await saveGameScore(userId, totalTime, imageSource, apiRequest);
    fetchTopFive(apiRequest);
};

startButton.addEventListener("click", () => {
    initializeGame();
});

imageSelect.addEventListener("change", (event) => {
    imageSource = event.target.value;
});

boardSizeSelect.addEventListener("change", (event) => {
    boardSize = parseInt(event.target.value);
});

const isLoggedIn = localStorage.getItem('authToken') !== null;

if (isLoggedIn) {
    loginSection.style.display = 'none';
    gameSections.forEach(section => section.classList.remove('hidden'));
    fetchTopFive(apiRequest);
    applyStoredPreferences();

} else {
    window.location.href = 'auth.html';
}