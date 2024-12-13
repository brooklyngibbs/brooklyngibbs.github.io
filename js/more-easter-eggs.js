document.addEventListener('DOMContentLoaded', () => {
    // Add all easter egg styles
    const styles = `
        .easter-egg-message {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--card-bg, #ffffff);
            padding: 15px 25px;
            border-radius: 30px;
            box-shadow: 0 4px 12px rgba(255, 140, 105, 0.15);
            border: 1px solid var(--primary, #ff8c69);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 10000;
        }

        .easter-egg-message.show {
            opacity: 1;
            animation: bounce 0.5s ease;
        }

        @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-10px); }
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

        .cat-paw {
            position: fixed;
            width: 50px;
            height: 50px;
            background: #f0a68c;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transform: translate(-50%, -50%);
            box-shadow: 
                -15px -15px 0 #f0a68c,
                15px -15px 0 #f0a68c,
                -15px 15px 0 #f0a68c,
                15px 15px 0 #f0a68c;
        }

        .cat-paw::after {
            content: '🐾';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
        }

        .cat-paw.walking {
            animation: walkingPaw 0.5s linear;
        }

        .soup-bowl {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 40px;
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.3s ease;
            cursor: pointer;
            z-index: 9997;
        }

        .soup-bowl.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .sparkle {
            position: fixed;
            pointer-events: none;
            animation: sparkleFloat 1.5s linear forwards;
            z-index: 9996;
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

        .rainbow-trail {
            position: fixed;
            pointer-events: none;
            border-radius: 50%;
            mix-blend-mode: screen;
            animation: fadeOut 1s forwards;
            z-index: 9995;
        }

        .synthwave-grid {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, #2b0634 0%, #170027 100%);
            perspective: 1000px;
            transform-style: preserve-3d;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.5s ease;
            pointer-events: none;
        }

        .grid {
            position: absolute;
            width: 200%;
            height: 200%;
            bottom: -50%;
            left: -50%;
            background-image: 
                linear-gradient(90deg, rgba(255,0,255,0.5) 1px, transparent 1px),
                linear-gradient(rgba(255,0,255,0.5) 1px, transparent 1px);
            background-size: 80px 80px;
            transform: rotateX(60deg);
            animation: gridMove 15s linear infinite;
        }

        .sun {
            position: absolute;
            width: 200px;
            height: 200px;
            background: linear-gradient(45deg, #ff6b6b, #ffd93d);
            border-radius: 50%;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            box-shadow: 0 0 50px #ff6b6b, 0 0 100px #ff6b6b, 0 0 150px #ff6b6b;
            animation: sunPulse 4s ease infinite;
        }

        .mountains {
            position: absolute;
            bottom: 25%;
            width: 100%;
            height: 30%;
        }

        .mountain {
            position: absolute;
            bottom: 0;
            border-left: 150px solid transparent;
            border-right: 150px solid transparent;
            border-bottom: 200px solid #2b1055;
            filter: drop-shadow(0 0 20px rgba(255,0,255,0.5));
        }

        .mountain:nth-child(1) { left: 10%; }
        .mountain:nth-child(2) { left: 30%; bottom: 10%; }
        .mountain:nth-child(3) { left: 50%; }
        .mountain:nth-child(4) { left: 70%; bottom: 5%; }
        .mountain:nth-child(5) { left: 90%; }

        .stars {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        .star {
            position: absolute;
            background: white;
            border-radius: 50%;
            animation: twinkle 1s ease infinite;
        }

        .audio-bars {
            position: absolute;
            bottom: 10%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 5px;
            height: 100px;
        }

        .bar {
            width: 10px;
            background: linear-gradient(to top, #ff00ff, #00ffff);
            animation: barJump 0.5s ease infinite;
            box-shadow: 0 0 10px rgba(255,0,255,0.5);
        }

        .synthwave-text {
            position: absolute;
            width: 100%;
            text-align: center;
            font-family: 'Inter', sans-serif;
            font-size: 5rem;
            font-weight: bold;
            color: #fff;
            text-shadow: 
                0 0 10px #ff00ff,
                0 0 20px #ff00ff,
                0 0 30px #ff00ff,
                0 0 40px #ff00ff;
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.5s ease;
        }

        .synthwave-text.visible {
            opacity: 1;
            transform: translateY(0);
        }

        @keyframes matrix-fall {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(1000%); }
        }

        @keyframes walkingPaw {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(0.8); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes sparkleFloat {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) rotate(360deg); opacity: 0; }
        }

        @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
        }

        @keyframes fadeOut {
            to { transform: scale(2); opacity: 0; }
        }

        @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }

        @keyframes gridMove {
            0% { transform: rotateX(60deg) translateY(0); }
            100% { transform: rotateX(60deg) translateY(80px); }
        }

        @keyframes sunPulse {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.1); }
        }

        @keyframes twinkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        @keyframes barJump {
            0%, 100% { height: 20px; }
            50% { height: var(--random-height); }
        }
    `;

    // Rest of your JavaScript code remains the same, starting from:
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Initialize elements
    const staff = document.createElement('div');
    staff.className = 'musical-staff';
    for (let i = 0; i < 5; i++) {
        const line = document.createElement('div');
        line.className = 'staff-line';
        line.style.top = `${i * 20 + 20}px`;
        staff.appendChild(line);
    }
    document.body.appendChild(staff);

    const pixelOverlay = document.createElement('div');
    pixelOverlay.className = 'pixel-overlay';
    document.body.appendChild(pixelOverlay);

    const catPaw = document.createElement('div');
    catPaw.className = 'cat-paw';
    document.body.appendChild(catPaw);

    // Secret word combinations
    const secretCombos = {
        'nintendo': () => startRetroMode(),
        'bach': () => startClassicalMode(),
        'taylor': () => startSwiftMode(),
        'debug': () => startMatrixMode(),
        'soup': () => startSoupMode(),
        'rainbow': () => startRainbowMode(),
        'meow': () => startCatMode(),
        'synthwave': () => startSynthwaveMode()
    };

    let typedKeys = '';
    const comboTimeout = 1500;
    let comboTimer;
    let isRainbowMode = false;

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

    // Mouse trail for rainbow mode
    document.addEventListener('mousemove', (e) => {
        if (isRainbowMode) {
            createRainbowTrail(e.clientX, e.clientY);
        }
    });

    function createRainbowTrail(x, y) {
        const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'];
        const trail = document.createElement('div');
        trail.className = 'rainbow-trail';
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        trail.style.width = '10px';
        trail.style.height = '10px';
        trail.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 1000);
    }

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

        const eraColors = [
            '#b9d2b5', // debut
            '#f4cb8d', // fearless
            '#d1b2d2', // speak now
            '#823549', // red
            '#b5e9f6', // 1989
            '#000003', // reputation
            '#eab4cc', // lover
            '#d1cec7', // folklore
            '#cc9d83', // evermore
            '#464d60', // midnights
            '#dad1c3', // ttpd
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

    function startSoupMode() {
        showMessage('🍜 Soup the Cat has appeared! 🐱');
        const soupBowl = document.createElement('div');
        soupBowl.className = 'soup-bowl';
        soupBowl.textContent = '🍜';
        document.body.appendChild(soupBowl);

        setTimeout(() => soupBowl.classList.add('visible'), 100);

        soupBowl.addEventListener('click', () => {
            showMessage('Meow! 🐱');
            createSparkles(soupBowl);
        });

        setTimeout(() => {
            soupBowl.classList.remove('visible');
            setTimeout(() => soupBowl.remove(), 300);
        }, 10000);
    }

    function startRainbowMode() {
        showMessage('🌈 Rainbow Mode Activated! 🌈');
        isRainbowMode = true;
        setTimeout(() => {
            isRainbowMode = false;
        }, 10000);
    }

    function startCatMode() {
        showMessage('😺 Cat Mode: Soup is walking across your screen! 😺');
        let steps = 0;
        const maxSteps = 10;
        const interval = setInterval(() => {
            if (steps >= maxSteps) {
                clearInterval(interval);
                catPaw.style.opacity = '0';
                return;
            }

            catPaw.style.opacity = '1';
            catPaw.style.left = `${(steps + 1) * (window.innerWidth / maxSteps)}px`;
            catPaw.style.top = `${Math.sin(steps) * 50 + window.innerHeight / 2}px`;
            catPaw.classList.add('walking');

            setTimeout(() => catPaw.classList.remove('walking'), 400);
            steps++;
        }, 500);
    }

    function createSparkles(element) {
        const rect = element.getBoundingClientRect();
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = '✨';
            sparkle.style.left = `${rect.left + rect.width / 2}px`;
            sparkle.style.top = `${rect.top + rect.height / 2}px`;
            sparkle.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
            sparkle.style.setProperty('--ty', `${(Math.random() - 0.5) * 200}px`);
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1500);
        }
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

    function startSynthwaveMode() {
    showMessage('🌆 Welcome to the Synthwave Dimension 🌆');

    const container = document.createElement('div');
    container.className = 'synthwave-grid';

    // Create grid
    const grid = document.createElement('div');
    grid.className = 'grid';

    // Create sun
    const sun = document.createElement('div');
    sun.className = 'sun';

    // Create mountains
    const mountains = document.createElement('div');
    mountains.className = 'mountains';
    for (let i = 0; i < 5; i++) {
        const mountain = document.createElement('div');
        mountain.className = 'mountain';
        mountains.appendChild(mountain);
    }

    // Create stars
    const stars = document.createElement('div');
    stars.className = 'stars';
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.animationDelay = `${Math.random() * 1}s`;
        stars.appendChild(star);
    }

    // Create audio visualization bars
    const audioBars = document.createElement('div');
    audioBars.className = 'audio-bars';
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.setProperty('--random-height', `${Math.random() * 80 + 20}px`);
        bar.style.animationDelay = `${Math.random() * 0.5}s`;
        audioBars.appendChild(bar);
    }

    // Create text
    const text = document.createElement('div');
    text.className = 'synthwave-text';
    text.textContent = '// SYNTHWAVE //';
    text.style.top = '40%';

    // Assemble everything
    container.appendChild(grid);
    container.appendChild(stars);
    container.appendChild(sun);
    container.appendChild(mountains);
    container.appendChild(audioBars);
    container.appendChild(text);
    document.body.appendChild(container);

    // Animate in
    requestAnimationFrame(() => {
        container.style.opacity = '1';
        setTimeout(() => text.classList.add('visible'), 500);
    });

    // Add mouse movement effect
    let isActive = true;
    container.addEventListener('mousemove', (e) => {
        if (!isActive) return;
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        container.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    // Remove after duration
    setTimeout(() => {
        container.style.opacity = '0';
        setTimeout(() => {
            container.remove();
            isActive = false;
        }, 500);
    }, 15000);
}
});