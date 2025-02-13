const applyStoredPreferences = (imageSource) => {
    const preferences = localStorage.getItem("preferences");

    if (preferences) {
        const data = JSON.parse(preferences);
        document.documentElement.style.setProperty('--card-found-color', data.color_found || '#00FF00');
        document.documentElement.style.setProperty('--card-closed-color', data.color_closed || '#FFFFFF');

        if (imageSource){
            imageSource.value = data.preferred_api;
        }
    } else {
        console.warn("Voorkeuren niet gevonden in localStorage.");
    }
};