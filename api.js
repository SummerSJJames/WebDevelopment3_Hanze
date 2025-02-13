// api.js

const API_BASE_URL = "http://localhost:8000"; // Of je productie URL

(function() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        const url = args[0]; // Haal de URL op van de request

        const token = localStorage.getItem("authToken");
        const headers = args[1]?.headers || {};

        // Voeg de Authorization header alleen toe aan requests naar de backend API
        if (token && url.startsWith(API_BASE_URL)) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log("Authorization header toegevoegd aan:", url);
        }

        args[1] = {
            ...args[1],
            headers: headers,
        };

        const response = await originalFetch(...args);

        if (response.status === 401 && url.startsWith(API_BASE_URL)) { // Controleer de URL
            alert("Je sessie is verlopen. Log opnieuw in.");
            localStorage.removeItem("authToken");
            window.location.href = "auth.html"; // Redirect naar login
        }

        return response;
    };
})();

// Functie om een API request te doen
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Haal de response body als tekst op
        const responseText = await response.text();

        // Controleer of de response body leeg is
        if (responseText) {
            // Als de response body niet leeg is, parseer het als JSON
            return JSON.parse(responseText);
        } else {
            // Als de response body leeg is, retourneer null
            return null;
        }
    } catch (error) {
        console.error("API request error:", error);
        throw error;
    }
}