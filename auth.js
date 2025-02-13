// auth.js
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

// Registreren via de backend
registerBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;

    if (!username) {
        alert("Gebruikersnaam is verplicht!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Wachtwoorden komen niet overeen!");
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/register", { // Gebruik fetch
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Registratie mislukt");
        }

        alert("Registratie succesvol!");
        showLoginLink.click(); // Navigeer naar het login formulier
    } catch (error) {
        console.error("Registratiefout:", error.message);
        alert("Registratie mislukt: " + error.message);
    }
});

// auth.js

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("http://localhost:8000/api/login_check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Inloggen mislukt");
        }

        const data = await response.json();
        localStorage.setItem("authToken", data.token);

        // Decode de JWT token
        const decodedToken = decodeJwt(data.token);

        if (decodedToken && decodedToken.sub) { // De user ID zit in de 'sub' claim
            localStorage.setItem("userId", decodedToken.sub); // Sla de user ID op
        } else {
            console.error("User ID niet gevonden in JWT token.");
            alert("User ID niet gevonden in JWT token.  De applicatie kan niet correct functioneren.");
        }

        alert("Succesvol ingelogd!");
        
        await fetchAndStorePreferences(); // Haal de voorkeuren op en sla ze op
        window.location.href = "index.html";
    } catch (error) {
        console.error("Inlogfout:", error.message);
        alert("Inloggen mislukt: " + error.message);
    }
});

async function fetchAndStorePreferences() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        console.warn("User ID niet gevonden. Kan voorkeuren niet ophalen.");
        return;
    }

    try {
        const data = await apiRequest(`/api/player/${userId}/preferences`);
        localStorage.setItem("preferences", JSON.stringify(data)); // Sla de voorkeuren op als JSON string
    } catch (error) {
        console.error("Fout bij ophalen voorkeuren:", error);
    }
}

// Tussen login en register wisselen
showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
});

showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

// auth.js (vervolg)

async function fetchUserIdAndRedirect() {
    try {
        // Gebruik de username om de user ID op te halen
        const username = document.getElementById("login-email").value; // Haal de gebruikersnaam uit het login formulier
        const response = await fetch(`http://localhost:8000/api/player?username=${username}`, { // Gebruik de correcte route om een speler op te halen
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}` // Voeg de token toe
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Ophalen user ID mislukt");
        }

        const data = await response.json();

        localStorage.setItem("userId", data.id); // Sla de user ID op

        window.location.href = "index.html"; // Terug naar de gamepagina
    } catch (error) {
        console.error("Fout bij ophalen user ID:", error.message);
        alert("Fout bij ophalen user ID: " + error.message);
        // Optioneel: Log de gebruiker uit als het ophalen van de user ID mislukt
    }
}