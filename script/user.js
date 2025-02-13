document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User ID niet gevonden. Log opnieuw in.");
        window.location.href = "auth.html";
        return;
    }

    const preferencesForm = document.getElementById("preferences-form");
    const changeEmailForm = document.getElementById("change-email-form");

    console.log("preferencesForm:", preferencesForm);
    console.log("changeEmailForm:", changeEmailForm);

    if (!preferencesForm || !changeEmailForm) {
        console.error("Een van de formulier elementen kon niet worden gevonden. Controleer de ID's in user.html.");
        return;
    }

    loadUserInfo();

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
        } catch (error) {
            console.error("Fout bij opslaan voorkeuren:", error);
            alert("Fout bij opslaan voorkeuren.");
        }

        loadPreferences();
        alert("Voorkeuren opgeslagen!");
    });

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
        loadUserInfo();
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
        const data = await apiRequest(`/api/player/${userId}`);
        document.getElementById('username').textContent = data.username;
        document.getElementById('email').textContent = data.email;

    } catch (error) {
        console.error("Fout bij ophalen gebruikersinfo:", error);
        alert("Fout bij ophalen gebruikersinfo.");
    }
    loadPreferences();
}

async function loadPreferences() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User ID niet gevonden. Log opnieuw in.");
        window.location.href = "auth.html";
        return;
    }

    try {
        const response = await apiRequest(`/api/player/${userId}/preferences`); // Gebruik /api/player/{id}
        data = response
        localStorage.setItem("preferences", JSON.stringify(data));
    } catch (error) {
        console.error('Fout bij ophalen voorkeuren:', error);
        return;
    }

    document.getElementById('image-api').value = data.preferred_api || 'dog';
    document.getElementById('card-found-color').value = data.color_found || '#00FF00';
    document.getElementById('card-closed-color').value = data.color_closed || '#FFFFFF';

    document.documentElement.style.setProperty('--card-found-color', data.color_found || '#00FF00');
    document.documentElement.style.setProperty('--card-closed-color', data.color_closed || '#FFFFFF');
}