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

/// Functie voor het wijzigen van de afbeeldingstype zonder de game te resetten
function changeImageSource(newSource) {
    imageSource = newSource;
    // We wijzigen de bron, maar de game wordt niet direct gereset
}

// Functie om de afbeelding van een Pokémon op te halen
async function fetchImage(pokemonName) {
    if (imageSource === 'pokemon') {
        try {
            // Haal de afbeelding van de Pokémon API
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            if (!response.ok) {
                throw new Error("Pokémon niet gevonden");
            }
            const data = await response.json();
            return data.sprites.front_default; // Pokémon afbeelding
        } catch (error) {
            console.error("Fout bij het ophalen van Pokémon-afbeelding:", error);
            return 'https://via.placeholder.com/200?text=Pokemon+Not+Found'; // Fallback afbeelding
        }
    } else {
        // Haal afbeelding op van andere bronnen
        return fetchImageFromOtherSources();
    }
}

// Functie om afbeeldingen op te halen van andere bronnen
function fetchImageFromOtherSources() {
    if (imageSource === 'lorem') {
        return fetch('https://picsum.photos/200')
            .then(response => response.url)
            .catch(error => {
                console.error('Fout bij het ophalen van afbeelding van LoremPicsum:', error);
                return 'https://via.placeholder.com/200?text=LoremPicsum+Error'; // Fallback afbeelding
            });
    } else if (imageSource === 'dog') {
        return fetch('https://dog.ceo/api/breeds/image/random')
            .then(response => response.json())
            .then(data => data.message)
            .catch(error => {
                console.error('Fout bij het ophalen van afbeelding van DogAPI:', error);
                return 'https://via.placeholder.com/200?text=DogAPI+Error'; // Fallback afbeelding
            });
    } else if (imageSource === 'cat') {
        return fetch('https://cataas.com/cat')
            .then(response => response.url)
            .catch(error => {
                console.error('Fout bij het ophalen van afbeelding van TheCataas:', error);
                return 'https://via.placeholder.com/200?text=Cataas+Error'; // Fallback afbeelding
            });
    }
}

// Functie om willekeurige afbeeldingen te genereren
async function generateRandomImages(count) {
    const imageUrls = [];
    const promises = [];
    const pokemonNames = [
        "pikachu", "bulbasaur", "charmander", "squirtle", "eevee", "jigglypuff",
        "meowth", "psyduck", "snorlax", "mew", "charizard", "pidgey", "spheal",
        "walrein", "dialga", "palkia", "sunkern", "blastoise"
    ];

    // Shuffle de lijst van Pokémon zodat we willekeurig een Pokémon kiezen zonder herhaling
    const shuffledPokemonNames = pokemonNames.sort(() => Math.random() - 0.5);

    // Kies willekeurige afbeeldingen op basis van de geselecteerde bron
    for (let i = 0; i < count; i++) {
        if (imageSource === 'pokemon') {
            // Kies een unieke Pokémon van de geschudde lijst
            const pokemonName = shuffledPokemonNames[i % shuffledPokemonNames.length];
            promises.push(fetchImage(pokemonName)); // Haal de afbeelding op
        } else {
            // Kies een afbeelding van andere bronnen
            promises.push(fetchImageFromOtherSources()); // Haal de afbeelding op
        }
    }

    const images = await Promise.all(promises);
    images.forEach(image => imageUrls.push(image));

    return imageUrls;
}

// Functie om het spel te initialiseren
async function initializeGame() {
    resetGame();  // Reset de game alleen wanneer dit expliciet wordt aangeroepen
    const totalCards = 36;
    const uniqueImages = await generateRandomImages(totalCards / 2);
    const allImages = [...uniqueImages, ...uniqueImages].sort(() => Math.random() - 0.5);

    // Maak de kaarten aan en voeg de afbeeldingen toe
    allImages.forEach((imageUrl) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.image = imageUrl;

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = "Image";
        img.classList.add("card-image");
        img.style.display = "none"; // Verberg de afbeelding initieel
        card.appendChild(img);

        card.addEventListener("click", handleCardClick);
        gameBoard.appendChild(card);
        cards.push(card);
    });
}

// Functie om te reageren op klikken op een kaart
function handleCardClick(event) {
    const clickedCard = event.target.closest('.card');

    // Negeer klikken op reeds geopende of gematchte kaarten
    if (isProcessing || clickedCard.classList.contains("open") || clickedCard.classList.contains("matched")) {
        return;
    }

    // Toon de afbeelding van de kaart
    clickedCard.classList.add("open");
    const img = clickedCard.querySelector("img");
    img.style.display = "block"; // Toon de afbeelding

    if (!firstCard) {
        // Zet de eerste kaart
        firstCard = clickedCard;
    } else {
        // Zet de tweede kaart
        secondCard = clickedCard;
        isProcessing = true; // Blokkeer het spel tijdens het vergelijken

        // Vergelijk de twee kaarten onmiddellijk
        if (firstCard.dataset.image === secondCard.dataset.image) {
            // Als ze overeenkomen, voeg de 'matched' class toe
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            firstCard = null;
            secondCard = null;
            matchesFound++;

            // Controleer of het spel gewonnen is
            if (matchesFound === cards.length / 2) {
                endGame();
            }

            // Ontgrendel het spel na een korte vertraging
            setTimeout(() => {
                isProcessing = false;
            }, 300); // Korte vertraging voor visuele feedback

        } else {
            // Als ze niet overeenkomen, sluit de kaarten
            setTimeout(() => {
                firstCard.classList.remove("open");
                secondCard.classList.remove("open");
                firstCard.querySelector("img").style.display = "none";
                secondCard.querySelector("img").style.display = "none";
                firstCard = null;
                secondCard = null;

                // Ontgrendel het spel na het sluiten van de kaarten
                isProcessing = false;
            }, 500); // Korte vertraging voor mismatch
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

// Functie om het spel te beëindigen
function endGame() {
    clearInterval(timerInterval);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    alert(`Gefeliciteerd! Je hebt alle paren gevonden in ${totalTime} seconden.`);
}

// Event listener voor de Start Game knop
startButton.addEventListener("click", () => {
    initializeGame();
    startTimer();
});

// Event listener voor het selecteren van de afbeeldingbron
imageSelect.addEventListener("change", (event) => {
    imageSource = event.target.value;
});
