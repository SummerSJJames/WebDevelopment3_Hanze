const API_BASE_URL = "http://localhost:8000";

(function () {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        const url = args[0];

        const token = localStorage.getItem("authToken");
        const headers = args[1]?.headers || {};

        if (token && url.startsWith(API_BASE_URL)) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log("Authorization header toegevoegd aan:", url);
        }

        args[1] = {
            ...args[1],
            headers: headers,
        };

        const response = await originalFetch(...args);

        if (response.status === 401 && url.startsWith(API_BASE_URL)) {
            alert("Je sessie is verlopen. Log opnieuw in.");
            localStorage.removeItem("authToken");
            window.location.href = "auth.html";
        }

        return response;
    };
})();

async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const responseText = await response.text();

        if (responseText) {
            return JSON.parse(responseText);
        } else {
            return null;
        }
    } catch (error) {
        console.error("API request error:", error);
        throw error;
    }
}