// Elementos do DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const timerElement = document.getElementById('timer');
const gameArea = document.getElementById('game-area');

// Configurações do jogo
const GAME_DURATION = 50; // segundos
const COIN_SPAWN_INTERVAL = 1000; // milissegundos
const SPECIAL_COIN_CHANCE = 0.1; // 10% de chance
const PHASE_CHANGE_COIN_CHANCE = 0.1; // 10% de chance
const DISCO_MODE_DURATION = 10; // segundos
const COIN_ROTATION_FRAMES = 80; // número de frames para animação da moeda
const COIN_LIFETIME = 2500; // tempo de vida da moeda em milissegundos
const COIN_ANIMATION_DURATION = 2500; // duração da animação em milissegundos
const FRAME_DURATION = 30; // duração de cada frame em milissegundos

// Pré-carregar imagens
const coinImages = [];
const preloadPromises = [];

for (let i = 0; i <= COIN_ROTATION_FRAMES; i++) {
    const img = new Image();
    const frameNumber = i.toString().padStart(3, '0');
    const imagePath = `assets/coins/brlc_girando_020${frameNumber}.png`;
    
    const promise = new Promise((resolve, reject) => {
        img.onload = () => {
            console.log(`Imagem carregada com sucesso: ${imagePath}`);
            resolve(img);
        };
        img.onerror = () => {
            console.error(`Erro ao carregar imagem: ${imagePath}`);
            reject(new Error(`Falha ao carregar ${imagePath}`));
        };
    });
    
    img.src = imagePath;
    coinImages.push(img);
    preloadPromises.push(promise);
}

// Estado do jogo
let gameState = {
    score: 0,
    timeRemaining: GAME_DURATION,
    isRunning: false,
    isDiscoMode: false,
    spawnInterval: null,
    timerInterval: null,
    discoTimeout: null,
    activeCoins: new Set(),
    currentPhase: 0,
    dragonInterval: null // Novo: para controlar o intervalo do dragão
};

// Inicialização
function init() {
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    document.addEventListener('coinClick', collectCoin);
}

function createClouds() {
    // Remover nuvens antigas
    const oldClouds = document.querySelectorAll('.cloud');
    oldClouds.forEach(cloud => cloud.remove());

    // Criar novas nuvens
    const cloudConfigs = [
        { top: '117px', width: '260px', height: '155px', delay: '0s', duration: '30s' },
        { top: '32px', width: '240px', height: '140px', delay: '-15s', duration: '35s' },
        { top: '473px', width: '270px', height: '160px', delay: '-22s', duration: '32s' },
        { top: '530px', width: '245px', height: '145px', delay: '-5s', duration: '38s' },
        { top: '465px', width: '255px', height: '150px', delay: '-28s', duration: '34s' }
    ];

    const cloudContainer = document.createElement('div');
    cloudContainer.id = 'cloud-container';
    cloudContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
    `;
    gameScreen.insertBefore(cloudContainer, gameArea);

    cloudConfigs.forEach((config, index) => {
        const cloud = document.createElement('div');
        cloud.className = `cloud cloud-0${index + 1}`;
        cloud.style.cssText = `
            position: absolute;
            left: -250px;
            top: ${config.top};
            width: ${config.width};
            height: ${config.height};
            animation: moveCloud ${config.duration} linear infinite;
            animation-delay: ${config.delay};
            background-size: contain;
            background-repeat: no-repeat;
            pointer-events: none;
        `;
        cloudContainer.appendChild(cloud);
    });
}

// Iniciar jogo
function startGame() {
    // Reset do estado
    gameState = {
        score: 0,
        timeRemaining: GAME_DURATION,
        isRunning: true,
        isDiscoMode: false,
        spawnInterval: null,
        timerInterval: null,
        discoTimeout: null,
        activeCoins: new Set(),
        currentPhase: 0,
        dragonInterval: null // Novo: para controlar o intervalo do dragão
    };

    // Esconder/mostrar telas
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    // Remover classes de fase anteriores e adicionar fase inicial
    document.body.classList.remove('phase-0', 'phase-1', 'phase-2');
    document.body.classList.add('phase-0');

    // Criar nuvens
    createClouds();

    // Garantir que o HUD esteja visível
    const hud = document.querySelector('.hud');
    if (hud) {
        hud.style.display = 'flex';
    }
    
    // Atualizar UI
    updateScore();
    updateTimer();
    
    // Iniciar loops do jogo
    gameState.spawnInterval = setInterval(spawnCoin, COIN_SPAWN_INTERVAL);
    gameState.timerInterval = setInterval(updateGameTimer, 1000);
}

// Spawn de moedas
function spawnCoin() {
    if (!gameState.isRunning) return;

    const coin = document.createElement('div');
    coin.className = 'coin';
    
    // Variação aleatória de tamanho (15%)
    const sizeVariation = 1 + (Math.random() * 0.3 - 0.15);
    const baseSize = 124;
    const finalSize = Math.round(baseSize * sizeVariation);
    
    coin.style.width = `${finalSize}px`;
    coin.style.height = `${finalSize}px`;
    
    // Posição horizontal aleatória
    const maxX = gameArea.clientWidth - finalSize;
    const startX = Math.random() * maxX;
    coin.style.left = `${startX}px`;
    
    // Determinar tipo de moeda primeiro
    // Só gera moeda de mudança de fase se estiver na fase 0
    const isPhaseChange = gameState.currentPhase === 0 && Math.random() < PHASE_CHANGE_COIN_CHANCE;
    const isSpecial = !isPhaseChange && Math.random() < SPECIAL_COIN_CHANCE;
    
    // Adicionar classes específicas do tipo de moeda
    if (isPhaseChange) {
        coin.classList.add('phase-change-coin');
    } else if (isSpecial) {
        coin.classList.add('special-coin');
    }

    // Configurar animação de movimento (igual para todas as moedas)
    const throwDirection = Math.random() < 0.5 ? 'left' : 'right';
    const throwSpeed = Math.random() < 0.5 ? 'fast' : 'very-fast';
    const randomStart = Math.random() * 50;
    
    // Aplicar todas as propriedades de animação de uma vez
    coin.style.animationDelay = `-${randomStart}%`;
    coin.style.animationDuration = `${COIN_ANIMATION_DURATION}ms`;
    coin.classList.add(`coin-throw-${throwDirection}-${throwSpeed}`);
    
    // Garantir que a moeda comece invisível e apareça suavemente
    coin.style.opacity = '0';
    requestAnimationFrame(() => {
        coin.style.opacity = '1';
    });

    // Adicionar evento de clique com cleanup
    const clickHandler = () => {
        if (!gameState.isRunning || !coin.parentNode) return;
        
        // Immediately start fade out
        coin.style.transition = 'opacity 0.15s ease-out';
        coin.style.opacity = '0';
        
        const event = new CustomEvent('coinClick', { 
            detail: { coin, isSpecial, isPhaseChange } 
        });
        document.dispatchEvent(event);
        
        coin.removeEventListener('click', clickHandler);
        gameState.activeCoins.delete(coin);
        
        // Remove the coin more quickly
        setTimeout(() => {
            if (coin.parentNode === gameArea) {
                gameArea.removeChild(coin);
            }
        }, 150);
    };
    
    coin.addEventListener('click', clickHandler);
    gameState.activeCoins.add(coin);

    // Animação de rotação com frame inicial aleatório e velocidade variável
    let frame;
    // 40% de chance de começar próximo ao frame 26
    if (Math.random() < 0.4) {
        // Gera um número aleatório entre 20 e 32 (26 ± 6)
        frame = Math.floor(20 + Math.random() * 12);
    } else {
        // Para as demais moedas, mantém o comportamento aleatório original
        frame = Math.floor(Math.random() * COIN_ROTATION_FRAMES);
    }

    const rotationSpeed = 0.8 + Math.random() * 0.4; // Velocidade entre 0.8x e 1.2x
    const frameDuration = FRAME_DURATION * rotationSpeed;
    
    // Determinar direção da rotação e comportamento
    const rotateReverse = Math.random() < 0.3; // 30% de chance de girar ao contrário
    const oscillate = Math.random() < 0.2; // 20% de chance de oscilar
    let direction = rotateReverse ? -1 : 1;
    let oscillationCount = 0;
    
    const updateFrame = () => {
        if (!gameState.isRunning || !coin.parentNode) return;
        
        // Lógica de oscilação
        if (oscillate) {
            oscillationCount++;
            if (oscillationCount >= 20) { // Muda direção a cada 20 frames
                direction *= -1;
                oscillationCount = 0;
            }
        }
        
        // Incrementa o frame com base na direção
        frame = (frame + direction + COIN_ROTATION_FRAMES) % COIN_ROTATION_FRAMES;
        
        // Aplica a imagem atual
        if (coinImages[frame] && coinImages[frame].src) {
            coin.style.backgroundImage = `url(${coinImages[frame].src})`;
        }
        
        // Adiciona rotação 3D aleatória
        const rotationX = Math.sin(Date.now() * 0.001 * rotationSpeed) * 15;
        const rotationY = Math.cos(Date.now() * 0.001 * rotationSpeed) * 15;
        coin.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        
        // Continua a animação se a moeda ainda existir
        if (coin.parentNode) {
            requestAnimationFrame(() => {
                setTimeout(updateFrame, frameDuration);
            });
        }
    };
    
    // Inicia com o frame aleatório
    if (coinImages[frame] && coinImages[frame].src) {
        coin.style.backgroundImage = `url(${coinImages[frame].src})`;
    }
    
    // Adiciona perspectiva 3D ao elemento
    coin.style.perspective = '1000px';
    coin.style.transformStyle = 'preserve-3d';
    
    // Inicia a animação com um pequeno delay aleatório
    setTimeout(updateFrame, Math.random() * 100);

    gameArea.appendChild(coin);

    // Remover moeda após a animação
    setTimeout(() => {
        if (coin.parentNode === gameArea) {
            coin.style.opacity = '0';
            setTimeout(() => {
                if (coin.parentNode === gameArea) {
                    gameArea.removeChild(coin);
                    gameState.activeCoins.delete(coin);
                }
            }, 300);
        }
    }, COIN_LIFETIME);
}

// Funções de efeitos visuais
function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x - 50}px`;
    explosion.style.top = `${y - 50}px`;
    explosion.style.willChange = 'transform, opacity';
    gameArea.appendChild(explosion);
    
    // Reduced animation time from 0.5s to 0.3s for snappier feedback
    explosion.style.animation = 'explode 0.3s ease-out forwards';
    
    setTimeout(() => {
        if (explosion.parentNode === gameArea) {
            gameArea.removeChild(explosion);
        }
    }, 300); // Reduced from 500ms to 300ms
}

function createSplash(x, y) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.style.left = `${x - 40}px`;
    splash.style.top = `${y - 40}px`;
    
    // Criar 12 partículas
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'splash-particle';
        
        // Calcular direção aleatória
        const angle = (i * 30 + Math.random() * 20) * Math.PI / 180;
        const distance = 30 + Math.random() * 20;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.animation = 'splashParticle 0.3s ease-out forwards';
        
        splash.appendChild(particle);
    }
    
    gameArea.appendChild(splash);
    
    setTimeout(() => {
        if (splash.parentNode === gameArea) {
            gameArea.removeChild(splash);
        }
    }, 300);
}

function applyCameraShake() {
    document.body.classList.add('camera-shake');
    setTimeout(() => {
        document.body.classList.remove('camera-shake');
    }, 400); // Increased to match the new animation duration
}

function createMoneyEffect(x, y, isSpecial = false, isPhaseChange = false) {
    const money = document.createElement('div');
    money.className = 'money-effect';
    money.style.left = `${x}px`;
    money.style.top = `${y}px`;
    money.style.willChange = 'transform, opacity';
    
    // Determinar o texto baseado no tipo de moeda e fase
    let pointValue;
    if (isPhaseChange) {
        pointValue = '+10';
    } else if (isSpecial) {
        pointValue = '+5';
    } else {
        pointValue = gameState.currentPhase === 0 ? '+1' : '+2';
    }
    money.textContent = pointValue;
    
    gameArea.appendChild(money);

    // Use the new animation
    requestAnimationFrame(() => {
        money.style.animation = 'moneyScorePopup 0.8s ease-out forwards';
    });

    setTimeout(() => {
        if (money.parentNode === gameArea) {
            gameArea.removeChild(money);
        }
    }, 800);
}

// Modificar a função collectCoin para melhorar a sequência de efeitos
function collectCoin(event) {
    const { coin, isSpecial, isPhaseChange } = event.detail;
    const rect = coin.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Criar efeitos visuais
    createExplosion(centerX, centerY);
    createSplash(centerX, centerY);
    applyCameraShake();
    createMoneyEffect(centerX, centerY, isSpecial, isPhaseChange);

    // Atualizar pontuação
    if (isPhaseChange) {
        changePhase();
        gameState.score += 10; // Bônus por mudar de fase
    } else if (isSpecial) {
        activateDiscoMode();
        gameState.score += 5; // Bônus por moeda especial
        gameState.timeRemaining += 15;
    } else {
        // Pontuação normal baseada na fase
        gameState.score += gameState.currentPhase === 0 ? 1 : 2;
    }

    updateScore();
    updateTimer();
}

// Ativar modo discoteca
function activateDiscoMode() {
    gameState.isDiscoMode = true;
    document.body.classList.add('disco-mode');
    
    // Desativar modo discoteca após duração
    if (gameState.discoTimeout) {
        clearTimeout(gameState.discoTimeout);
    }
    
    gameState.discoTimeout = setTimeout(() => {
        gameState.isDiscoMode = false;
        document.body.classList.remove('disco-mode');
    }, DISCO_MODE_DURATION * 1000);
}

// Atualizar timer
function updateGameTimer() {
    if (!gameState.isRunning) return;

    gameState.timeRemaining--;
    updateTimer();

    if (gameState.timeRemaining <= 0) {
        endGame();
    }
}

// Fim de jogo
function endGame() {
    gameState.isRunning = false;
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.timerInterval);
    
    cleanupGame();

    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    finalScoreElement.textContent = gameState.score;
}

// Funções de atualização da UI
function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = gameState.score;
    } else {
        console.error('Elemento de pontuação não encontrado');
    }
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = Math.max(0, gameState.timeRemaining);
    } else {
        console.error('Elemento de tempo não encontrado');
    }
}

// Limpar recursos ao fim do jogo
function cleanupGame() {
    gameState.activeCoins.forEach(coin => {
        if (coin.parentNode === gameArea) {
            gameArea.removeChild(coin);
        }
    });
    gameState.activeCoins.clear();
    
    // Remover dragões e limpar intervalo
    const dragons = document.querySelectorAll('.dragon');
    dragons.forEach(dragon => dragon.remove());
    
    if (gameState.dragonInterval) {
        clearInterval(gameState.dragonInterval);
        gameState.dragonInterval = null;
    }
}

// Mudar de fase
function changePhase() {
    console.log('Changing phase...');
    
    // Limpar intervalo existente do dragão
    if (gameState.dragonInterval) {
        clearInterval(gameState.dragonInterval);
        gameState.dragonInterval = null;
    }
    
    // Remover classes de fase anteriores
    document.body.classList.remove('phase-0', 'phase-1');
    
    // Incrementar a fase atual (máximo fase 1)
    gameState.currentPhase = Math.min(1, gameState.currentPhase + 1);
    console.log('New phase:', gameState.currentPhase);
    
    // Adicionar a classe da nova fase
    document.body.classList.add(`phase-${gameState.currentPhase}`);

    // Recriar nuvens
    createClouds();
    
    // Criar dragão se estiver na fase 1
    if (gameState.currentPhase === 1) {
        // Primeiro dragão após um pequeno delay
        setTimeout(createDragon, 2000);
        
        // Configurar intervalo para novos dragões
        gameState.dragonInterval = setInterval(() => {
            if (gameState.isRunning && gameState.currentPhase === 1) {
                createDragon();
            }
        }, 25000); // Novo dragão a cada 25 segundos
    }
    
    // Flash effect
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'white';
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 0.3s ease-in-out';
    flash.style.zIndex = '9999';
    document.body.appendChild(flash);
    
    // Flash animation
    setTimeout(() => {
        flash.style.opacity = '0.8';
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 300);
        }, 100);
    }, 0);
}

function createDragon() {
    // Se já existir um dragão voando, não criar outro
    const existingDragon = document.querySelector('.dragon');
    if (existingDragon) {
        return;
    }

    const dragon = document.createElement('div');
    dragon.className = 'dragon';
    
    // Altura aleatória para o voo (ajustada para o novo tamanho)
    const flyHeight = Math.random() * 400 + 50; // entre 50px e 450px do topo
    dragon.style.setProperty('--fly-height', `${flyHeight}px`);
    
    // Duração do voo mais consistente
    const flyDuration = Math.random() * 5 + 20; // entre 20 e 25 segundos
    
    // Configurar animações - bater de asas mais lento (2 segundos)
    dragon.style.animation = `
        flyDragon ${flyDuration}s linear,
        flapWings 2s steps(1) infinite
    `;
    
    // Remover o dragão quando a animação terminar
    dragon.addEventListener('animationend', (event) => {
        if (event.animationName === 'flyDragon') {
            dragon.remove();
        }
    });
    
    // Adicionar ao game screen antes do game area
    gameScreen.insertBefore(dragon, gameArea);
}

// Iniciar o jogo
init(); 