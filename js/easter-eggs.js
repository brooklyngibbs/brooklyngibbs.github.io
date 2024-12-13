// Add this script to js/easter-eggs.js

document.addEventListener('DOMContentLoaded', () => {
    // Add easter egg styles
    const styles = `
        .hidden-emoji {
            position: fixed;
            font-size: 24px;
            opacity: 0;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            user-select: none;
        }

        .hidden-emoji.revealed {
            opacity: 0.6;
        }

        .hidden-emoji:hover {
            opacity: 1;
            transform: scale(1.2);
        }

        .easter-egg-message {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--card-bg);
            padding: 15px 25px;
            border-radius: 30px;
            box-shadow: 0 4px 12px rgba(255, 140, 105, 0.15);
            border: 1px solid var(--primary);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1001;
        }

        .easter-egg-message.show {
            opacity: 1;
            animation: bounce 0.5s ease;
        }

        .matrix-mode {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        }

        .matrix-character {
            position: absolute;
            color: #0f0;
            font-family: monospace;
            font-size: 20px;
            animation: matrix-fall linear infinite;
        }

        @keyframes matrix-fall {
            to { transform: translateY(100vh); }
        }

        @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-10px); }
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }

        .rainbow-text {
            background: linear-gradient(45deg, 
                #ff0000, #ff7f00, #ffff00, #00ff00, 
                #0000ff, #4b0082, #8b00ff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: rainbow 3s linear infinite;
        }

        .gravity-effect {
            animation: fall 1s forwards;
        }

        @keyframes fall {
            to { transform: translateY(100vh) rotate(90deg); }
        }

        .confetti {
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            animation: confetti-fall linear forwards;
        }

        @keyframes confetti-fall {
            to { transform: translateY(100vh) rotate(720deg); }
        }
    `;

    // Add styles to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Easter egg configurations
    const easterEggs = [
        {
            emoji: '🎵',
            x: '85%',
            y: '15%',
            message: 'Music is life!',
            action: () => startMusicalNotes()
        },
        {
            emoji: '🎮',
            x: '10%',
            y: '75%',
            message: 'Game on!',
            action: () => startMatrixEffect()
        },
        {
            emoji: '✨',
            x: '95%',
            y: '90%',
            message: 'Magic time!',
            action: () => makeElementsSparkle()
        },
        {
            emoji: '🌈',
            x: '5%',
            y: '25%',
            message: 'Rainbow mode activated!',
            action: () => rainbowEffect()
        }
    ];

    // Create hidden emojis
    easterEggs.forEach(egg => {
        const emoji = document.createElement('div');
        emoji.className = 'hidden-emoji';
        emoji.textContent = egg.emoji;
        emoji.style.left = egg.x;
        emoji.style.top = egg.y;
        document.body.appendChild(emoji);

        emoji.addEventListener('click', () => {
            showMessage(egg.message);
            emoji.classList.add('revealed');
            egg.action();
        });
    });

    function startMusicalNotes() {
        const notes = ['♪', '♫', '♬', '♩', '♭', '♮'];
        for (let i = 0; i < 20; i++) {
            const note = document.createElement('div');
            note.style.position = 'fixed';
            note.style.left = Math.random() * 100 + 'vw';
            note.style.top = '-50px';
            note.style.fontSize = '24px';
            note.style.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
            note.textContent = notes[Math.floor(Math.random() * notes.length)];
            note.style.zIndex = '9999';
            note.style.pointerEvents = 'none';
            document.body.appendChild(note);

            const duration = 2 + Math.random() * 3;
            note.style.animation = `fall ${duration}s linear forwards`;

            setTimeout(() => note.remove(), duration * 1000);
        }
    }

    function startMatrixEffect() {
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-mode';
        document.body.appendChild(matrixContainer);

        for (let i = 0; i < 50; i++) {
            const char = document.createElement('div');
            char.className = 'matrix-character';
            char.style.left = Math.random() * 100 + 'vw';
            char.style.animationDuration = (2 + Math.random() * 3) + 's';
            char.textContent = String.fromCharCode(0x30A0 + Math.random() * 96);
            matrixContainer.appendChild(char);
        }

        setTimeout(() => matrixContainer.remove(), 5000);
    }

    function makeElementsSparkle() {
        const cards = document.querySelectorAll('.project-card, .tech-card, .interest-card');
        cards.forEach(card => {
            card.style.transition = 'all 0.3s ease';
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';

            setTimeout(() => {
                card.style.transform = '';
                card.style.boxShadow = '';
            }, 1000);
        });
    }

    function rainbowEffect() {
        const headings = document.querySelectorAll('h1, h2, h3');
        headings.forEach(heading => {
            heading.classList.add('rainbow-text');
            setTimeout(() => heading.classList.remove('rainbow-text'), 3000);
        });
    }

    // Enhanced Konami code effect
    let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateKonamiCode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateKonamiCode() {
        showMessage('Konami Code Activated! 🎮');
        createConfetti();
        document.querySelectorAll('.hidden-emoji').forEach(emoji => {
            emoji.classList.add('revealed');
        });
    }

    function createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-20px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 3) + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }
    }

    // Double-click logo for gravity effect
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('dblclick', () => {
            const elements = document.querySelectorAll('.project-card, .tech-card, .interest-card');
            elements.forEach(element => {
                element.style.transition = 'all 1s ease';
                element.classList.add('gravity-effect');
                setTimeout(() => {
                    element.style.transition = '';
                    element.classList.remove('gravity-effect');
                }, 1000);
            });
        });
    }

    // Secret typing easter egg with spinning fix
    let secretWord = '';
    document.addEventListener('keypress', (e) => {
        secretWord += e.key.toLowerCase();
        secretWord = secretWord.slice(-5);

        if (secretWord === 'music') {
            showMessage('🎵 Music Mode Activated! 🎵');
            document.querySelectorAll('.project-card, .tech-card, .interest-card').forEach(card => {
                // Create a wrapper for the rotation
                const wrapper = document.createElement('div');
                wrapper.style.animation = 'spin 1s ease';
                card.parentNode.insertBefore(wrapper, card);
                wrapper.appendChild(card);

                // Remove wrapper after animation
                setTimeout(() => {
                    wrapper.parentNode.insertBefore(card, wrapper);
                    wrapper.remove();
                }, 1000);
            });
            startMusicalNotes();
        }
    });

    // Message display function
    function showMessage(text) {
        const message = document.createElement('div');
        message.className = 'easter-egg-message';
        message.textContent = text;
        document.body.appendChild(message);

        setTimeout(() => message.classList.add('show'), 100);
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }
});