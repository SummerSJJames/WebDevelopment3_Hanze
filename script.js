const gameBoard = document.getElementById("game-board");
const startButton = document.getElementById("start-game");
const timeDisplay = document.getElementById("elapsed-time");
const imageSelect = document.getElementById("image-type");
let cards = [];
let firstCard = null;
let secondCard = null;
let matchesFound = 0;
let startTime;
let timerInterval;
let imageSource = 'dog'; // Default image source
let isProcessing = false; // Lock to prevent clicks during processing

const loginSection = document.getElementById('login-section');
const gameSections = document.querySelectorAll('.hidden');
const topFiveList = document.getElementById("top-five-list");
const averagePlaytime = document.getElementById("average-playtime");

// API keys
const theDogApiKey = 'YOUR_DOG_API_KEY'; // Vervang met je echte API key!

// Functie voor het wijzigen van de afbeeldingstype zonder de game te resetten
function changeImageSource(newSource) {
    imageSource = newSource;
}

// Functie om afbeeldingen op te halen van andere bronnen
async function fetchImageFromOtherSources() {
    let imageUrl;

    if (imageSource === 'lorem') {
        imageUrl = 'https://picsum.photos/200';
    } else if (imageSource === 'dog') {
        imageUrl = 'https://dog.ceo/api/breeds/image/random';
    } else if (imageSource === 'cat') {
        imageUrl = 'https://cataas.com/cat';
    }  else if (imageSource === 'pokemon') {
        imageUrl = 'https://pokeapi.co/api/v2/pokemon/pikachu';
    } else {
        console.error('Ongeldige image source:', imageSource);
        return 'https://via.placeholder.com/200?text=Invalid+API';
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Afbeelding ophalen mislukt van: ${imageUrl}`);
        }

        if (imageSource === 'dog') {
            const data = await response.json();
            return data.message; // Dog API heeft een "message" veld
        } else if (imageSource === 'pokemon') {
            const data = await response.json();
            return data.sprites.front_default;
        }

        return response.url; // CatAPI en Lorem Picsum geven direct een URL terug
    } catch (error) {
        console.error('Fout bij het ophalen van afbeelding:', error);
        return 'https://via.placeholder.com/200?text=API+Error';
    }
}

async function applyStoredPreferences() {
    const preferences = localStorage.getItem("preferences");

    if (preferences) {
        const data = JSON.parse(preferences);
        document.documentElement.style.setProperty('--card-found-color', data.color_found || '#00FF00');
        document.documentElement.style.setProperty('--card-closed-color', data.color_closed || '#FFFFFF');
    } else {
        console.warn("Voorkeuren niet gevonden in localStorage.");
    }
}

// Functie om willekeurige afbeeldingen te genereren
async function generateRandomImages(count) {
    const imageUrls = [];
    const usedImageUrls = new Set();

    while (imageUrls.length < count) {
        let imageUrl = await fetchImageFromOtherSources();
        if (!usedImageUrls.has(imageUrl)) {
            imageUrls.push(imageUrl);
            usedImageUrls.add(imageUrl);
        }
    }
    return imageUrls;
}

// Functie om het spel te initialiseren
async function initializeGame() {
    resetGame();
    applyStoredPreferences();
    const totalCards = 36;
    const uniqueImages = await generateRandomImages(totalCards / 2);
    const allImages = [...uniqueImages, ...uniqueImages].sort(() => Math.random() - 0.5);

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
}

// Functie om te reageren op klikken op een kaart
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

            if (matchesFound === cards.length / 2) {
                endGame();
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

// Functie om het spel te resetten
function resetGame() {
    gameBoard.innerHTML = "";
    cards = [];
    firstCard = null;
    secondCard = null;
    matchesFound = 0;
    clearInterval(timerInterval);
    timeDisplay.textContent = "0";
}

// Functie om de timer te starten
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        timeDisplay.textContent = elapsedTime;
    }, 1000);
}

async function endGame() {
    clearInterval(timerInterval);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    alert(`Gefeliciteerd! Je hebt alle paren gevonden in ${totalTime} seconden.`);

    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User ID niet gevonden. Log opnieuw in.");
        window.location.href = "auth.html";
        return;
    }

    try {
        await apiRequest('/game/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userId,
                score: totalTime,
                api: imageSource
            }),
        });
    } catch (error) {
        console.error('Fout bij opslaan van score:', error);
        alert('Fout bij opslaan van score.');
    }

    fetchTopFive();
}

// Controleer of de gebruiker ingelogd is
const isLoggedIn = localStorage.getItem('authToken') !== null;

if (isLoggedIn) {
    loginSection.style.display = 'none';
    gameSections.forEach(section => section.classList.remove('hidden'));

    fetchTopFive();

} else {
    window.location.href = 'auth.html';
}

// Event listeners
startButton.addEventListener("click", () => {
    initializeGame();
    startTimer();
});

imageSelect.addEventListener("change", (event) => {
    imageSource = event.target.value;
});

async function fetchTopFive() {
    try {
        const data = await apiRequest('/scores');

        const sortedScores = data.sort((a, b) => a.score - b.score);
        const topFiveScores = sortedScores.slice(0, 5);

        topFiveList.innerHTML = topFiveScores.map(score => `<li>${score.username}: ${score.score}s</li>`).join('');
    } catch (error) {
        console.error('Fout bij ophalen top 5 scores:', error);
        topFiveList.innerHTML = '<li>Fout bij ophalen scores</li>';
    }
}