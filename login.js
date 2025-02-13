// Script to manage login and access
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const gameSections = document.querySelectorAll('.hidden');

// Fake credentials for demo purposes
const validUsername = "user";
const validPassword = "password";

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === validUsername && password === validPassword) {
        // Successful login
        loginModal.style.display = 'none';
        gameSections.forEach(section => section.classList.remove('hidden'));
    } else {
        // Display error message
        loginError.textContent = "Onjuiste gebruikersnaam of wachtwoord.";
    }
});