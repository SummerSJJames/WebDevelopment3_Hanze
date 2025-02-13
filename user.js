// user.js

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User ID niet gevonden. Log opnieuw in.");
        window.location.href = "auth.html";
        return;
    }

    // Selecteer de formulier elementen
    const preferencesForm = document.getElementById("preferences-form");
    const changeEmailForm = document.getElementById("change-email-form");

    console.log("preferencesForm:", preferencesForm);
    console.log("changeEmailForm:", changeEmailForm);

    if (!preferencesForm || !changeEmailForm) {
        console.error("Een van de formulier elementen kon niet worden gevonden. Controleer de ID's in user.html.");
        return; // Stop de verdere uitvoering als de elementen niet zijn gevonden
    }

    loadUserInfo();
    loadPreferences();

    preferencesForm.addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("User ID niet gevonden. Log opnieuw in.");
            window.location.href = "auth.html";
            return;
        }
    
        const imageApi = document.getElementById("image-api").value;
        const cardFoundColor = document.getElementById("card-found-color").value;
        const cardClosedColor = document.getElementById("card-closed-color").value;
    
        try {
            await apiRequest(`/api/player/${userId}/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api: imageApi,
                    color_found: cardFoundColor,
                    color_closed: cardClosedColor
                }),
            });
    
            // Haal de nieuwe voorkeuren op en sla ze op in localStorage
            await fetchAndStorePreferences();
            alert("Voorkeuren opgeslagen!");
        } catch (error) {
            console.error("Fout bij opslaan voorkeuren:", error);
            alert("Fout bij opslaan voorkeuren.");
        }
    });

    // E-mail wijzigen
    changeEmailForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newEmail = document.getElementById("new-email").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        try {
            await apiRequest(`/api/player/${userId}/email`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: newEmail
                }),
            });

            alert("E-mailadres gewijzigd!");
        } catch (error) {
            console.error("Fout bij wijzigen e-mail:", error);
            alert("Fout bij wijzigen e-mail.");
        }
    });
});

async function loadUserInfo() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User ID niet gevonden. Log opnieuw in.");
        window.location.href = "auth.html";
        return;
    }

    try {
        const data = await apiRequest(`/api/player/${userId}`); // Gebruik /api/player/{id}

        document.getElementById('user-id').textContent = data.id;
        document.getElementById('username').textContent = data.username;
        document.getElementById('email').textContent = data.email;

    } catch (error) {
        console.error("Fout bij ophalen gebruikersinfo:", error);
        alert("Fout bij ophalen gebruikersinfo.");
    }
}

async function loadPreferences() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User ID niet gevonden. Log opnieuw in.");
        window.location.href = "auth.html";
        return;
    }

    const preferences = localStorage.getItem("preferences");
    let data;

    if (preferences) {
        data = JSON.parse(preferences);
    } else {
        console.warn("Voorkeuren niet gevonden in localStorage. Ophalen van backend.");
        try {
            const response = await apiRequest(`/api/player/${userId}/preferences`); // Gebruik /api/player/{id}
            data = response
            localStorage.setItem("preferences", JSON.stringify(data));
        } catch (error) {
            console.error('Fout bij ophalen voorkeuren:', error);
            return;
        }
    }

    // Vul de formulier velden met de geladen voorkeuren
    document.getElementById('image-api').value = data.preferred_api || 'dog';
    document.getElementById('card-found-color').value = data.color_found || '#00FF00';
    document.getElementById('card-closed-color').value = data.color_closed || '#FFFFFF';

    // Toepassen van voorkeuren op de game
    document.documentElement.style.setProperty('--card-found-color', data.color_found || '#00FF00');
    document.documentElement.style.setProperty('--card-closed-color', data.color_closed || '#FFFFFF');
}