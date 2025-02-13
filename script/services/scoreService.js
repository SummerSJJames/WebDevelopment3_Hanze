const fetchTopFive = async (apiRequest) => {
    try {
        const data = await apiRequest('/scores');
        const sortedScores = data.sort((a, b) => a.score - b.score);
        const topFiveScores = sortedScores.slice(0, 5);

        topFiveList.innerHTML = topFiveScores.map(score => `<li>${score.username}: ${score.score}s</li>`).join('');
    } catch (error) {
        console.error('Fout bij ophalen top 5 scores:', error);
        topFiveList.innerHTML = '<li>Fout bij ophalen scores</li>';
    }
};

const saveGameScore = async (userId, totalTime, imageSource, apiRequest) => {
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
};