// Game State Management
class DiceGame {
    constructor() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.player1Wins = 0;
        this.player2Wins = 0;
        this.totalRolls = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.gameStartTime = Date.now();
        this.history = [];
        this.isRolling = false;
        this.currentRound = 1;
        
        this.initializeElements();
        this.bindEvents();
        this.loadGameState();
        this.startGameTimer();
    }

    initializeElements() {
        // Dice elements
        this.dice1 = document.querySelector('.player1-dice .dice-img');
        this.dice2 = document.querySelector('.player2-dice .dice-img');
        this.dice1Value = document.querySelector('.player1-dice .dice-value');
        this.dice2Value = document.querySelector('.player2-dice .dice-value');
        
        // UI elements
        this.resultText = document.querySelector('.result-text');
        this.resultIcon = document.querySelector('.result-icon');
        this.roundNumber = document.querySelector('.round-number');
        
        // Score elements
        this.player1ScoreEl = document.querySelector('.player1-score .score');
        this.player2ScoreEl = document.querySelector('.player2-score .score');
        this.player1WinsEl = document.querySelector('.player1-score .wins');
        this.player2WinsEl = document.querySelector('.player2-score .wins');
        
        // Stats elements
        this.totalRollsEl = document.getElementById('totalRolls');
        this.gameTimeEl = document.getElementById('gameTime');
        this.bestStreakEl = document.getElementById('bestStreak');
        
        // Controls
        this.rollBtn = document.getElementById('rollBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.themeToggle = document.getElementById('themeToggle');
        
        // History
        this.historyList = document.getElementById('historyList');
    }

    bindEvents() {
        this.rollBtn.addEventListener('click', () => this.rollDice());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRolling) {
                e.preventDefault();
                this.rollDice();
            }
            if (e.code === 'KeyR' && e.ctrlKey) {
                e.preventDefault();
                this.resetGame();
            }
        });

        // Mobile touch events
        this.rollBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.rollBtn.style.transform = 'scale(0.95)';
        });

        this.rollBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.rollBtn.style.transform = '';
            this.rollDice();
        });

        this.resetBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.resetBtn.style.transform = 'scale(0.95)';
        });

        this.resetBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.resetBtn.style.transform = '';
            this.resetGame();
        });

        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    rollDice() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        this.rollBtn.disabled = true;
        
        // Add rolling animation
        this.dice1.classList.add('rolling');
        this.dice2.classList.add('rolling');
        
        // Generate random numbers
        const random1 = Math.floor(Math.random() * 6) + 1;
        const random2 = Math.floor(Math.random() * 6) + 1;
        
        // Update dice images and values
        setTimeout(() => {
            this.updateDice(1, random1);
            this.updateDice(2, random2);
            
            // Remove rolling animation
            this.dice1.classList.remove('rolling');
            this.dice2.classList.remove('rolling');
            
            // Determine winner and update game state
            this.determineWinner(random1, random2);
            
            this.isRolling = false;
            this.rollBtn.disabled = false;
        }, 600);
    }

    updateDice(player, value) {
        const diceImg = player === 1 ? this.dice1 : this.dice2;
        const diceValue = player === 1 ? this.dice1Value : this.dice2Value;
        
        diceImg.src = `images/dice${value}.png`;
        diceValue.textContent = value;
    }

    determineWinner(value1, value2) {
        this.totalRolls++;
        this.currentRound++;
        
        let result, winner, icon;
        
        if (value1 > value2) {
            result = "Player 1 Wins! 🏆";
            winner = "Player 1";
            icon = "🎉";
            this.player1Score += value1;
            this.player1Wins++;
            this.currentStreak = this.player1Wins;
        } else if (value2 > value1) {
            result = "Player 2 Wins! 🏆";
            winner = "Player 2";
            icon = "🎉";
            this.player2Score += value2;
            this.player2Wins++;
            this.currentStreak = this.player2Wins;
        } else {
            result = "It's a Draw! 🤝";
            winner = "Draw";
            icon = "🤝";
            this.currentStreak = 0;
        }
        
        // Update best streak
        if (this.currentStreak > this.bestStreak) {
            this.bestStreak = this.currentStreak;
        }
        
        // Update UI
        this.updateUI(result, icon);
        this.addToHistory(value1, value2, winner);
        this.saveGameState();
        
        // Add winner animation
        setTimeout(() => {
            if (winner !== "Draw") {
                const winnerDice = winner === "Player 1" ? 
                    document.querySelector('.player1-dice') : 
                    document.querySelector('.player2-dice');
                winnerDice.classList.add('winner');
                setTimeout(() => winnerDice.classList.remove('winner'), 500);
            }
        }, 100);
    }

    updateUI(result, icon) {
        this.resultText.textContent = result;
        this.resultIcon.textContent = icon;
        this.roundNumber.textContent = `Round ${this.currentRound}`;
        
        // Update scores
        this.player1ScoreEl.textContent = this.player1Score;
        this.player2ScoreEl.textContent = this.player2Score;
        this.player1WinsEl.textContent = `Wins: ${this.player1Wins}`;
        this.player2WinsEl.textContent = `Wins: ${this.player2Wins}`;
        
        // Update stats
        this.totalRollsEl.textContent = this.totalRolls;
        this.bestStreakEl.textContent = this.bestStreak;
    }

    addToHistory(value1, value2, winner) {
        const historyItem = {
            timestamp: new Date().toISOString(), // Store as ISO string
            player1Value: value1,
            player2Value: value2,
            winner: winner
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 10 items
        if (this.history.length > 10) {
            this.history.pop();
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        
        this.history.forEach(item => {
            const historyEl = document.createElement('div');
            historyEl.className = `history-item ${item.winner.toLowerCase().replace(' ', '')}`;
            
            // Fix timestamp handling
            let time;
            try {
                if (typeof item.timestamp === 'string') {
                    time = new Date(item.timestamp).toLocaleTimeString();
                } else if (item.timestamp instanceof Date) {
                    time = item.timestamp.toLocaleTimeString();
                } else {
                    time = new Date().toLocaleTimeString();
                }
            } catch (error) {
                time = new Date().toLocaleTimeString();
            }
            
            const result = item.winner === 'Draw' ? 
                `${item.player1Value} - ${item.player2Value}` :
                `${item.player1Value} vs ${item.player2Value}`;
            
            historyEl.innerHTML = `
                <span>${time} - ${result}</span>
                <span>${item.winner}</span>
            `;
            
            this.historyList.appendChild(historyEl);
        });
    }

    resetGame() {
        if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
            this.player1Score = 0;
            this.player2Score = 0;
            this.player1Wins = 0;
            this.player2Wins = 0;
            this.totalRolls = 0;
            this.currentStreak = 0;
            this.bestStreak = 0;
            this.currentRound = 1;
            this.history = [];
            this.gameStartTime = Date.now();
            
            // Reset UI
            this.updateDice(1, 6);
            this.updateDice(2, 6);
            this.resultText.textContent = 'Ready to Roll!';
            this.resultIcon.textContent = '🎲';
            this.roundNumber.textContent = 'Round 1';
            this.updateUI('Ready to Roll!', '🎲');
            this.updateHistoryDisplay();
            
            this.saveGameState();
        }
    }

    toggleTheme() {
        const body = document.body;
        const icon = this.themeToggle.querySelector('i');
        
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        }
    }

    startGameTimer() {
        setInterval(() => {
            const elapsed = Date.now() - this.gameStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.gameTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    saveGameState() {
        const gameState = {
            player1Score: this.player1Score,
            player2Score: this.player2Score,
            player1Wins: this.player1Wins,
            player2Wins: this.player2Wins,
            totalRolls: this.totalRolls,
            bestStreak: this.bestStreak,
            currentRound: this.currentRound,
            history: this.history
        };
        
        try {
            localStorage.setItem('diceGameState', JSON.stringify(gameState));
        } catch (error) {
            console.warn('Could not save game state:', error);
        }
    }

    loadGameState() {
        try {
            const savedState = localStorage.getItem('diceGameState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.player1Score = state.player1Score || 0;
                this.player2Score = state.player2Score || 0;
                this.player1Wins = state.player1Wins || 0;
                this.player2Wins = state.player2Wins || 0;
                this.totalRolls = state.totalRolls || 0;
                this.bestStreak = state.bestStreak || 0;
                this.currentRound = state.currentRound || 1;
                this.history = state.history || [];
                
                this.updateUI('Ready to Roll!', '🎲');
                this.updateHistoryDisplay();
            }
        } catch (error) {
            console.warn('Could not load game state:', error);
            // Reset to default state if loading fails
            this.resetToDefaultState();
        }
        
        // Load theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        const body = document.body;
        const icon = this.themeToggle.querySelector('i');
        
        if (savedTheme === 'dark') {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            icon.className = 'fas fa-sun';
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            icon.className = 'fas fa-moon';
        }
    }

    resetToDefaultState() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.player1Wins = 0;
        this.player2Wins = 0;
        this.totalRolls = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.currentRound = 1;
        this.history = [];
        this.gameStartTime = Date.now();
        
        this.updateUI('Ready to Roll!', '🎲');
        this.updateHistoryDisplay();
    }
}

// Sound effects (optional enhancement)
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.audioContext = null;
    }

    initAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (error) {
                console.warn('Audio context not supported:', error);
                this.enabled = false;
            }
        }
    }

    playRollSound() {
        if (!this.enabled) return;
        
        this.initAudioContext();
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Could not play roll sound:', error);
        }
    }

    playWinSound() {
        if (!this.enabled) return;
        
        this.initAudioContext();
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Could not play win sound:', error);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new DiceGame();
    const soundManager = new SoundManager();
    
    // Add sound to roll button
    game.rollBtn.addEventListener('click', () => {
        soundManager.playRollSound();
    });
    
    // Add win sound to determineWinner method
    const originalDetermineWinner = game.determineWinner.bind(game);
    game.determineWinner = function(value1, value2) {
        originalDetermineWinner(value1, value2);
        if (value1 !== value2) {
            setTimeout(() => soundManager.playWinSound(), 600);
        }
    };
    
    // Add helpful tooltips
    game.rollBtn.title = 'Press SPACE to roll dice';
    game.resetBtn.title = 'Press CTRL+R to reset game';
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Mobile-specific optimizations
    if ('ontouchstart' in window) {
        // Disable hover effects on mobile
        document.body.classList.add('mobile-device');
        
        // Add mobile-specific event listeners
        document.addEventListener('touchstart', () => {
            // Initialize audio context on first touch (required by some browsers)
            soundManager.initAudioContext();
        }, { once: true });
    }
});

// Add some fun easter eggs
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyK' && e.ctrlKey && e.shiftKey) {
        // Konami code easter egg
        alert('🎲 You found the secret! This is a professional dice game with many features! 🎲');
    }
});
