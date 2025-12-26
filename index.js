const themes = {
    medieval: ["👑", "🛖", "⚔️", "🧙", "🏰", "🗝️", "📜", "🧝️", "🧌", "🧛‍♂️"],
    space: ["🚀", "👽", "🪐", "🌌", "☄️", "🛰️", "🔭", "🌟", "🛸", "👩🏻‍🚀"],
    animals: ["🐶", "🐱", "🐭", "🐼", "🐍", "🦄", "🦉", "🦓", "🐳", "🦔"],
    gadgets: ["📱", "💻", "🎮️", "⌚", "🎧", "📷", "📺", "🕹️", "💽", "📡"]
};

let cards = [];
let flippedCards = [];
let matchedCards = [];
let attempts = 0;
let timerInterval;
let secondsElapsed = 0;
let currentTheme = 'medieval';
async function fetchUselessQuote() {
    try {
        const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
        const data = await response.json();
        showQuotePopup(data.text);
    } catch (error) {
        console.error('Failed to fetch a useless quote:', error);
    }
}

function showQuotePopup(quote) {
    const quotePopup = document.createElement('div');
    quotePopup.classList.add('quote-popup');
    quotePopup.textContent = `💬 ${quote}`;
    document.body.appendChild(quotePopup);

    setTimeout(() => {
        quotePopup.remove();
    }, 4000); // Display the quote for 4 seconds
}
document.getElementById('player-form').onsubmit = function(event) {
    event.preventDefault();

    const nameInput = document.getElementById('player-name');
    if (!nameInput) {
        console.error('Player name input not found');
        return;
    }

    const playerName = nameInput.value;
    currentTheme = document.getElementById('theme-select').value;

    document.getElementById('greeting').textContent = `Welcome, ${playerName}!`;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'block';

    startGame();
};

function startGame() {
    createBoard();
    startTimer();
}

function createBoard() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedCards = [];
    attempts = 0;
    document.getElementById('attempt-count').textContent = attempts;

    const emojis = [...themes[currentTheme], ...themes[currentTheme]];
    emojis.sort(() => Math.random() - 0.5);

    emojis.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.onclick = () => flipCard(card);
        container.appendChild(card);
        cards.push(card);
    });
}

function flipCard(card) {
    if (flippedCards.length < 2 && !flippedCards.includes(card) && !card.classList.contains('matched')) {
        card.textContent = card.dataset.emoji;
        card.classList.add('flipped');
        flippedCards.push(card);
    }

    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 600);
    }
}

function showModal(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('game-over-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('game-over-modal').style.display = 'none';
    location.reload(); // Reset game after closing modal
}

function checkMatch() {
    if (flippedCards.length < 2) {
        console.error("Not enough cards to check for match");
        return;
    }

    const [card1, card2] = flippedCards;

    // Safety check to avoid undefined errors
    if (!card1 || !card2) {
        console.error("One or both cards are missing!");
        flippedCards = [];
        return;
    }

    if (card1.dataset.emoji === card2.dataset.emoji) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedCards.push(card1, card2);
        fetchUselessQuote();
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped', );
            card2.classList.remove('flipped', );
            card1.textContent = '';
            card2.textContent = '';
        }, 300);
    }

    flippedCards = [];
    attempts++;

    document.getElementById('attempt-count').textContent = attempts;

    if (matchedCards.length === cards.length) {
        clearInterval(timerInterval);
        showModal(`🎉 Quest Complete! Total time: ${formatTime(secondsElapsed)}. Attempts: ${attempts}`);
        return;
    }

    // Check if max attempts reached
    if (attempts >= 25) {
        clearInterval(timerInterval);
        showModal(`💀 Game Over! You exceeded 25 attempts. Better luck next time.`);
        disableAllCards(); // Optional - prevents further gameplay.
    }
}

function disableAllCards() {
    cards.forEach(card => card.removeEventListener('click', flipCard));
}


function startTimer() {
    secondsElapsed = 0;
    document.getElementById('timer').textContent = "0:00";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timer').textContent = formatTime(secondsElapsed);
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
document.getElementById('reset-button').addEventListener('click', resetGame);

function resetGame() {
    clearInterval(timerInterval);

    // Reset UI
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('game-board').style.display = 'none';

    // Clear input fields and counters
    document.getElementById('player-name').value = '';
    document.getElementById('attempt-count').textContent = '0';
    document.getElementById('timer').textContent = '0:00';

    // Clear game data
    cards = [];
    flippedCards = [];
    matchedCards = [];
    attempts = 0;
    secondsElapsed = 0;

    // Clear card visuals
    const container = document.getElementById('cards-container');
    container.innerHTML = '';
}
let player;
// YouTube Video IDs mapped to themes
const themeMusic = {
    medieval: 'bw1-rvFuRx87Q0vl', // Example ID
    space: 'uPK_YbAbpHPmLpii', // Example ID
    animals: 'twgS6NWiwiH1b-5j', // Example ID
    gadgets: 'YVKZVmBxNpmG-tHy'
};

// Load YouTube IFrame API
function onYouTubeIframeAPIReady() {
    const selectedTheme = document.getElementById('theme-select').value;

    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: themeMusic[selectedTheme], // Default to Medieval
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'loop': 1,
            'mute': 0
        },
        events: {
            'onReady': (event) => event.target.playVideo(),
            'onError': (event) => console.error('YouTube API Error:', event)
        }
    });
}

document.getElementById('theme-select').addEventListener('change', () => {
    if (player) player.destroy(); // Destroy existing player to avoid conflicts
    onYouTubeIframeAPIReady(); // Load new track
});