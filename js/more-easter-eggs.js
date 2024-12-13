document.addEventListener('DOMContentLoaded', () => {
    // Add enhanced easter egg styles
    const styles = `
        .vinyl-record {
            position: fixed;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle at center,
                #000000 10%,
                #333333 20%,
                #000000 21%,
                #333333 30%,
                #000000 31%,
                #333333 40%,
                #000000 41%,
                #333333 50%,
                #000000 51%,
                #333333 60%
            );
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
            z-index: 9999;
            transform: translate(-50%, -50%) rotate(0deg);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s ease;
        }

        .vinyl-record.spinning {
            animation: spinRecord 2s linear infinite;
        }

        @keyframes spinRecord {
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .pixel-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            opacity: 0;
            transition: opacity 0.3s ease;
            background-image: repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.1) 0px,
                rgba(0, 0, 0, 0.1) 1px,
                transparent 1px,
                transparent 2px
            );
        }

        .retro-text {
            text-shadow: 2px 2px #ff00ff, -2px -2px #00ffff;
            animation: glitch 0.5s infinite;
        }

        @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }

        .musical-staff {
            position: fixed;
            width: 100%;
            height: 100px;
            pointer-events: none;
            z-index: 9997;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .staff-line {
            position: absolute;
            width: 100%;
            height: 1px;
            background: rgba(0, 0, 0, 0.2);
        }

        .note-particle {
            position: fixed;
            font-size: 24px;
            pointer-events: none;
            z-index: 9996;
            animation: float 2s ease-out forwards;
        }

        @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create musical staff
    const staff = document.createElement('div');
    staff.className = 'musical-staff';
    for (let i = 0; i < 5; i++) {
        const line = document.createElement('div');
        line.className = 'staff-line';
        line.style.top = `${i * 20 + 20}px`;
        staff.appendChild(line);
    }
    document.body.appendChild(staff);

    // Initialize pixel overlay
    const pixelOverlay = document.createElement('div');
    pixelOverlay.className = 'pixel-overlay';
    document.body.appendChild(pixelOverlay);

    // Secret word combinations
    const secretCombos = {
        'nintendo': () => startRetroMode(),
        'bach': () => startClassicalMode(),
        'taylor': () => startSwiftMode(),
        'debug': () => startMatrixMode()
    };

    let typedKeys = '';
    const comboTimeout = 1500;
    let comboTimer;

    document.addEventListener('keypress', (e) => {
        typedKeys += e.key.toLowerCase();
        clearTimeout(comboTimer);
        comboTimer = setTimeout(() => typedKeys = '', comboTimeout);

        Object.entries(secretCombos).forEach(([combo, action]) => {
            if (typedKeys.includes(combo)) {
                action();
                typedKeys = '';
            }
        });
    });


    function startRetroMode() {
        showMessage('🎮 Retro Gaming Mode! 🎮');
        pixelOverlay.style.opacity = '1';
        document.querySelectorAll('h1, h2, h3').forEach(heading => {
            heading.classList.add('retro-text');
        });

        setTimeout(() => {
            pixelOverlay.style.opacity = '0';
            document.querySelectorAll('h1, h2, h3').forEach(heading => {
                heading.classList.remove('retro-text');
            });
        }, 8000);
    }

    function startClassicalMode() {
        showMessage('🎼 Classical Mode Engaged! 🎼');
        staff.style.opacity = '1';

        // Create floating music notes
        const notes = ['♪', '♫', '♬', '♩', '♭', '♮'];
        const createNote = () => {
            const note = document.createElement('div');
            note.className = 'note-particle';
            note.textContent = notes[Math.floor(Math.random() * notes.length)];
            note.style.left = `${Math.random() * 100}vw`;
            note.style.top = '100vh';
            document.body.appendChild(note);
            setTimeout(() => note.remove(), 2000);
        };

        const noteInterval = setInterval(createNote, 200);
        setTimeout(() => {
            clearInterval(noteInterval);
            staff.style.opacity = '0';
        }, 8000);
    }

    function startSwiftMode() {
        showMessage('✨ Taylor Swift Mode! Are you ready for it? ✨');
        document.body.style.transition = 'all 0.5s ease';

        // Cycle through era colors
        const eraColors = [
            '#b9d2b5', // debut
            '#f4cb8d', // fearless
            '#d1b2d2', // speak now
            '#823549', // red
            '#b5e9f6', // 1989
            '#000003', // Evermore
            '#eab4cc',  // lover
            '#d1cec7',  // folklore
            '#cc9d83',  // evermore
            '#464d60',  // midnights
            '#dad1c3',  // ttpd
        ];

        let colorIndex = 0;
        const colorInterval = setInterval(() => {
            document.body.style.backgroundColor = eraColors[colorIndex];
            colorIndex = (colorIndex + 1) % eraColors.length;
        }, 1000);

        setTimeout(() => {
            clearInterval(colorInterval);
            document.body.style.backgroundColor = '';
        }, 10000);
    }

    function startMatrixMode() {
        showMessage('🖥️ Debug Mode: Matrix Initialized 🖥️');
        const matrixContainer = document.createElement('div');
        matrixContainer.style.position = 'fixed';
        matrixContainer.style.top = '0';
        matrixContainer.style.left = '0';
        matrixContainer.style.width = '100%';
        matrixContainer.style.height = '100%';
        matrixContainer.style.zIndex = '9995';
        document.body.appendChild(matrixContainer);

        const code = '010101 DEBUG MODE ACTIVATED 101010';
        for (let i = 0; i < 50; i++) {
            const line = document.createElement('div');
            line.style.position = 'absolute';
            line.style.left = `${Math.random() * 100}vw`;
            line.style.color = '#00ff00';
            line.style.fontFamily = 'monospace';
            line.style.fontSize = '12px';
            line.style.whiteSpace = 'nowrap';
            line.textContent = code;
            line.style.animation = `matrix-fall ${2 + Math.random() * 3}s linear forwards`;
            matrixContainer.appendChild(line);
        }

        setTimeout(() => matrixContainer.remove(), 5000);
    }

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