document.getElementById('startButton').addEventListener('click', startGameWithCooldown);
document.getElementById('backToMenuButton').addEventListener('click', showMenu);
document.getElementById('settingsButton').addEventListener('click', showSettings);
document.getElementById('closeSettingsButton').addEventListener('click', closeSettings);
document.getElementById('lightModeButton').addEventListener('click', () => setTheme('light'));
document.getElementById('darkModeButton').addEventListener('click', () => setTheme('dark'));
document.getElementById('pingCounterButton').addEventListener('click', togglePingCounter);
document.getElementById('easyModeButton').addEventListener('click', () => setMode('easy'));
document.getElementById('hardModeButton').addEventListener('click', () => setMode('hard'));
document.getElementById('extrasModeButton').addEventListener('click', () => setMode('extras'));

let foodTypes = ['Burger', 'Pizza', 'Pasta', 'Cake'];
let cookingPhrases = [
    'Flip the Pan', 'Add Oil', 'Add Water', 'Stir', 'Test Eat',
    'Season', 'Preheat Oven', 'Chop Vegetables', 'Grate Cheese', 'Mix Ingredients'
];
let cookingImages = [
    'images/burger.png', 'images/pizza.png', 'images/pasta.png', 'images/cake.png'
];
let currentFood;
let currentLetter;
let currentPhrase;
let timeLeft;
let letterTimeLimit;
let timerInterval;
let letterTimer;
let score = 0;
let completedLetters = 0;
let progressBarWidth;
let targetScore;
let winCount = parseInt(localStorage.getItem('winCount')) || 0;
let settings = JSON.parse(localStorage.getItem('settings')) || { mode: 'easy', theme: 'light', pingCounter: false };
let gameCooldown = false;
let cooldownDuration = 10; // Cooldown duration in seconds

document.getElementById('winCount').textContent = `Wins: ${winCount}`;
document.getElementById('cooldownTimer').textContent = `Cooldown: 0s`; // Initialize cooldown text
updateModeButtons();
setTheme(settings.theme);

function startGameWithCooldown() {
    if (gameCooldown) return; // Prevent starting if cooldown is active
    gameCooldown = true;

    // Update cooldown text
    let remainingTime = cooldownDuration;
    document.getElementById('cooldownTimer').textContent = `Cooldown: ${remainingTime}s`;

    const cooldownInterval = setInterval(() => {
        remainingTime--;
        document.getElementById('cooldownTimer').textContent = `Cooldown: ${remainingTime}s`;
        if (remainingTime <= 0) {
            clearInterval(cooldownInterval);
            document.getElementById('cooldownTimer').textContent = `Cooldown: 0s`;
        }
    }, 1000);

    setTimeout(() => {
        gameCooldown = false; // Reset cooldown after 10 seconds
    }, cooldownDuration * 1000);

    startCountdown();
}

function startCountdown() {
    hideAllSections();
    document.getElementById('countdown').style.display = 'flex';
    let countdownValue = 3;
    document.getElementById('countdownTimer').textContent = countdownValue;
    let countdownInterval = setInterval(() => {
        countdownValue--;
        document.getElementById('countdownTimer').textContent = countdownValue;
        if (countdownValue <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').style.display = 'none';
            startGame();
        }
    }, 1000);
}

function startGame() {
    hideAllSections();
    document.getElementById('game').style.display = 'block';
    timeLeft = settings.mode === 'easy' ? 0.75 : settings.mode === 'extras' ? 0.75 : 0.5;
    score = 0;
    completedLetters = 0;
    progressBarWidth = 0;
    document.getElementById('progressBar').style.width = progressBarWidth + '%';
    targetScore = Math.floor(Math.random() * 11) + 10; // Random number between 10 and 20
    document.getElementById('timeLeft').textContent = timeLeft;
    generateFood();
    startTimer();
    document.addEventListener('keydown', handleKeyPress);
}

function showMenu() {
    clearInterval(timerInterval);
    clearInterval(letterTimer);
    hideAllSections();
    document.getElementById('menu').style.display = 'flex';
    document.removeEventListener('keydown', handleKeyPress);
}

function showSettings() {
    hideAllSections();
    document.getElementById('settings').style.display = 'flex';
}

function closeSettings() {
    hideAllSections();
    document.getElementById('menu').style.display = 'flex';
}

function hideAllSections() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('countdown').style.display = 'none';
    document.getElementById('settings').style.display = 'none';
}

function setTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    settings.theme = theme;
    localStorage.setItem('settings', JSON.stringify(settings));
}

function togglePingCounter() {
    settings.pingCounter = !settings.pingCounter;
    document.getElementById('pingCounterButton').textContent = `Ping Counter: ${settings.pingCounter ? 'On' : 'Off'}`;
    localStorage.setItem('settings', JSON.stringify(settings));
}

function setMode(mode) {
    settings.mode = mode;
    localStorage.setItem('settings', JSON.stringify(settings));
    updateModeButtons();
    if (document.getElementById('game').style.display === 'block') {
        clearInterval(timerInterval);
        clearInterval(letterTimer);
        startGame();
    }
}

function updateModeButtons() {
    document.getElementById('easyModeButton').classList.toggle('active', settings.mode === 'easy');
    document.getElementById('hardModeButton').classList.toggle('active', settings.mode === 'hard');
    document.getElementById('extrasModeButton').classList.toggle('active', settings.mode === 'extras');
}

function generateFood() {
    currentFood = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    document.getElementById('foodName').textContent = `Cook: ${currentFood}`;
    generateLetter();
}

function generateLetter() {
    let letters;
    if (settings.mode === 'extras') {
        letters = '12345678910 '; // Includes numbers 1-10 and space
    } else {
        letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Only letters for easy and hard modes
    }

    currentLetter = letters.charAt(Math.floor(Math.random() * letters.length));
    currentPhrase = cookingPhrases[Math.floor(Math.random() * cookingPhrases.length)];
    document.getElementById('currentLetter').textContent = currentLetter;
    document.getElementById('cookingPhrase').textContent = currentPhrase;
    letterTimeLimit = settings.mode === 'easy' || settings.mode === 'extras' ? 0.75 : 0.5;
    resetLetterTimer();
}

function resetLetterTimer() {
    timeLeft = letterTimeLimit;
    document.getElementById('timeLeft').textContent = timeLeft.toFixed(1);
    clearInterval(letterTimer);
    letterTimer = setInterval(() => {
        timeLeft -= 0.1;
        document.getElementById('timeLeft').textContent = timeLeft.toFixed(1);
        if (timeLeft <= 0) {
            clearInterval(letterTimer);
            endGame();
        }
    }, 100);
}

function startTimer() {
    timerInterval = setInterval(() => {
        // This interval can be used for other time-based mechanics if needed
    }, 1000);
}

function handleKeyPress(e) {
    if (e.key.toUpperCase() === currentLetter || (settings.mode === 'extras' && e.key === currentLetter)) {
        completedLetters++;
        score++;
        updateProgressBar();
        if (completedLetters >= targetScore) {
            winGame();
        } else {
            generateFood();
        }
    }
}

function updateProgressBar() {
    progressBarWidth = (completedLetters / targetScore) * 100;
    document.getElementById('progressBar').style.width = progressBarWidth + '%';
}

function winGame() {
    clearInterval(letterTimer);
    updateWinCount();
    hideAllSections();
    document.getElementById('gameOver').style.display = 'flex';
    document.getElementById('endMessage').textContent = 'Congratulations! You won!';
    document.getElementById('finalScore').textContent = `You completed ${targetScore} letters. Score: ${score}`;
}

function endGame() {
    hideAllSections();
    document.getElementById('gameOver').style.display = 'flex';
    document.getElementById('endMessage').textContent = 'Game Over! You lost.';
    document.getElementById('finalScore').textContent = `Score: ${score}`;
    setTimeout(showMenu, 3000);
}

function updateWinCount() {
    winCount++;
    localStorage.setItem('winCount', winCount);
    document.getElementById('winCount').textContent = `Wins: ${winCount}`;
}
