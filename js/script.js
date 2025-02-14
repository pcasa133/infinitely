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
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.querySelector('.loading-progress');
const loadingText = document.querySelector('.loading-text');

// Configurações do jogo
const GAME_DURATION = 50; // segundos
const COIN_SPAWN_INTERVAL = 1000; // milissegundos
const SPECIAL_COIN_CHANCE = 0.1; // 10% de chance
const PHASE_CHANGE_COIN_CHANCE = 0.1; // 10% de chance
const BOMB_CHANCE = 0.3; // 30% de chance de bomba
const DISCO_MODE_DURATION = 10; // segundos
const COIN_ROTATION_FRAMES = 80; // número de frames para animação da moeda
const COIN_LIFETIME = 2500; // tempo de vida da moeda em milissegundos
const COIN_ANIMATION_DURATION = 2500; // duração da animação em milissegundos
const FRAME_DURATION = 30; // duração de cada frame em milissegundos
const MAX_SIMULTANEOUS_SPAWNS = 3; // número máximo de instâncias simultâneas

// Pré-carregar imagens
const coinImages = {
    'phase0': {
        'normal': [],
        'special': []
    },
    'phase1': {
        'normal': [],
        'special': []
    }
};
const bombImages = {
    'phase0': [],
    'phase1': []
};
const preloadPromises = [];

// Sistema de Loading
let totalAssets = 0;
let loadedAssets = 0;

function updateLoadingProgress() {
    const progress = (loadedAssets / totalAssets) * 100;
    loadingProgress.style.width = `${progress}%`;
    loadingText.textContent = `Carregando assets... ${Math.round(progress)}%`;
    
    if (loadedAssets === totalAssets) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
        }, 500);
    }
}

function assetLoaded() {
    loadedAssets++;
    updateLoadingProgress();
}

// Função para carregar moedas de uma fase específica
async function loadCoinsForPhase(phase, type) {
    const config = {
        'phase0': {
            'normal': { path: '/assets/novos/brlc_1_azul/', prefix: 'brlc_1_AZUL' },
            'special': { path: '/assets/novos/brlc_2_azul/', prefix: 'brlc_2_AZUL' }
        },
        'phase1': {
            'normal': { path: '/assets/novos/brlc_1_laranja/', prefix: 'brlc_1_LARANJA' },
            'special': { path: '/assets/novos/brlc_2_laranja/', prefix: 'brlc_2_LARANJA' }
        }
    };

    console.log(`🔄 Carregando moedas ${type} para fase ${phase}...`);
    const phaseConfig = config[phase][type];
    
    for (let i = 1; i <= COIN_ROTATION_FRAMES; i++) {
        totalAssets++; // Incrementa o total de assets
        const img = new Image();
        const frameNumber = i.toString().padStart(4, '0');
        const imagePath = `${phaseConfig.path}${phaseConfig.prefix}${frameNumber}.png`;
        
        const promise = new Promise((resolve, reject) => {
            img.onload = () => {
                console.log(`✅ Moeda ${type} ${i}/${COIN_ROTATION_FRAMES} carregada: ${imagePath}`);
                coinImages[phase][type].push(img);
                assetLoaded(); // Marca um asset como carregado
                resolve(img);
            };
            img.onerror = () => {
                console.error(`❌ Erro ao carregar moeda ${type}: ${imagePath}`);
                assetLoaded(); // Mesmo com erro, conta como tentativa
                reject(new Error(`Falha ao carregar ${imagePath}`));
            };
        });
        
        img.src = imagePath;
        preloadPromises.push(promise);
    }
}

// Carregar todas as moedas
Promise.all([
    loadCoinsForPhase('phase0', 'normal'),
    loadCoinsForPhase('phase0', 'special'),
    loadCoinsForPhase('phase1', 'normal'),
    loadCoinsForPhase('phase1', 'special')
]).then(() => {
    console.log('✅ Todas as moedas foram carregadas!');
}).catch(error => {
    console.error('❌ Erro ao carregar moedas:', error);
});

// Carregar imagens das bombas
console.log('🔄 Iniciando carregamento das bombas...');
let bombLoadingErrors = 0;
let bombLoadingSuccess = 0;

// Inicializar arrays para cada fase
bombImages['phase0'] = [];
bombImages['phase1'] = [];

// Função para carregar bombas de uma fase específica
async function loadBombsForPhase(phase) {
    const phaseConfig = {
        'phase0': { path: '/assets/novos/bomba_azul/', prefix: 'BOMB_AZUL', frames: 47 },
        'phase1': { path: '/assets/novos/bomba_laranja/', prefix: '', frames: 47 }
    };
    
    console.log(`🔄 Carregando bombas para fase ${phase}...`);
    const config = phaseConfig[phase];
    
    const loadPromises = [];
    
    for (let i = 1; i <= config.frames; i++) {
        totalAssets++; // Incrementa o total de assets
        const img = new Image();
        const frameNumber = i.toString().padStart(4, '0');
        const imagePath = `${config.path}${config.prefix}${frameNumber}.png`;
        
        const promise = new Promise((resolve, reject) => {
            img.onload = () => {
                console.log(`✅ Bomba ${i}/${config.frames} carregada com sucesso: ${imagePath}`);
                bombImages[phase].push(img);
                bombLoadingSuccess++;
                assetLoaded(); // Marca um asset como carregado
                resolve(img);
            };
            img.onerror = () => {
                bombLoadingErrors++;
                console.error(`❌ ERRO ao carregar bomba ${i}/${config.frames}: ${imagePath}`);
                assetLoaded(); // Mesmo com erro, conta como tentativa
                reject(new Error(`Falha ao carregar ${imagePath}`));
            };
        });
        
        img.src = imagePath;
        loadPromises.push(promise);
    }
    
    try {
        await Promise.all(loadPromises);
        console.log(`✅ Todas as bombas da fase ${phase} foram carregadas com sucesso!`);
        console.log(`📊 Bombas carregadas para fase ${phase}: ${bombImages[phase].length}`);
    } catch (error) {
        console.error(`❌ Erro ao carregar bombas da fase ${phase}:`, error);
    }
}

// Carregar bombas para ambas as fases
Promise.all([
    loadBombsForPhase('phase0'),
    loadBombsForPhase('phase1')
]).then(() => {
    console.log('✅ Carregamento de todas as bombas concluído!');
    console.log(`📊 Estatísticas finais de carregamento:
    - Total de bombas carregadas: ${bombLoadingSuccess}
    - Total de erros: ${bombLoadingErrors}
    - Bombas fase 0: ${bombImages['phase0'].length}
    - Bombas fase 1: ${bombImages['phase1'].length}
    `);
    
    // Verificar se as imagens têm src válido
    console.log('🔍 Verificando URLs das bombas:');
    for (const phase in bombImages) {
        console.log(`\nFase ${phase}:`);
        bombImages[phase].forEach((img, index) => {
            console.log(`Bomba ${index + 1}: ${img.src}`);
        });
    }
}).catch(error => {
    console.error('❌ Erro no carregamento das bombas:', error);
});

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

    // Número aleatório de instâncias para spawnar (1 a 3)
    const numSpawns = Math.floor(Math.random() * MAX_SIMULTANEOUS_SPAWNS) + 1;
    
    for (let i = 0; i < numSpawns; i++) {
        setTimeout(() => {
            createCoinInstance();
        }, i * 100); // Pequeno delay entre spawns múltiplos
    }
}

// Nova função que contém a lógica original de spawn
function createCoinInstance() {
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
    
    // Determinar tipo de moeda/bomba
    const isBomb = Math.random() < BOMB_CHANCE;
    const currentPhase = `phase${gameState.currentPhase}`;
    
    console.log(`Sorteio de tipo: ${isBomb ? 'BOMBA' : 'MOEDA'} (chance: ${BOMB_CHANCE})`);
    
    const isPhaseChange = !isBomb && gameState.currentPhase === 0 && Math.random() < PHASE_CHANGE_COIN_CHANCE;
    const isSpecial = !isBomb && !isPhaseChange && Math.random() < SPECIAL_COIN_CHANCE;
    
    let frame = 0;
    
    if (isBomb) {
        console.log('💣 Criando uma bomba...');
        coin.classList.add('bomb');
        
        const phaseBombs = bombImages[currentPhase];
        
        console.log(`🔍 Debug bomba:
        - Fase atual: ${currentPhase}
        - Bombas disponíveis: ${phaseBombs ? phaseBombs.length : 0}
        - Array de bombas existe: ${!!phaseBombs}
        - gameState.currentPhase: ${gameState.currentPhase}
        `);
        
        if (!phaseBombs || phaseBombs.length === 0) {
            console.error(`❌ ERRO: Nenhuma bomba carregada para a fase ${gameState.currentPhase}!`);
            return;
        }
        
        frame = Math.floor(Math.random() * phaseBombs.length);
        const bombImg = phaseBombs[frame];
        
        if (bombImg && bombImg.src) {
            console.log(`✅ Definindo imagem da bomba: ${bombImg.src}`);
            coin.style.backgroundImage = `url(${bombImg.src})`;
            coin.style.backgroundSize = 'contain';
            coin.style.backgroundRepeat = 'no-repeat';
            coin.style.backgroundPosition = 'center';
            coin.style.width = '124px';
            coin.style.height = '124px';
            coin.style.zIndex = '100';
            
            // Verificar se a imagem está realmente carregada
            const testImg = new Image();
            testImg.onload = () => console.log('✅ Imagem da bomba carregada com sucesso');
            testImg.onerror = () => console.error('❌ Erro ao carregar imagem da bomba');
            testImg.src = bombImg.src;
        } else {
            console.error('❌ ERRO: Imagem da bomba não encontrada!', {
                phase: currentPhase,
                frame,
                hasBombImages: phaseBombs.length > 0,
                numImages: phaseBombs.length,
                frameExists: !!bombImg,
                imgSrc: bombImg ? bombImg.src : null
            });
        }
    } else {
        const coinType = isSpecial ? 'special' : 'normal';
        const phaseCoins = coinImages[currentPhase][coinType];
        
        if (!phaseCoins || phaseCoins.length === 0) {
            console.error(`❌ ERRO: Nenhuma moeda ${coinType} carregada para a fase ${gameState.currentPhase}!`);
            return;
        }
        
        frame = Math.floor(Math.random() * phaseCoins.length);
        const coinImg = phaseCoins[frame];
        
        if (coinImg && coinImg.src) {
            coin.style.backgroundImage = `url(${coinImg.src})`;
        }
        
        if (isPhaseChange) {
            coin.classList.add('phase-change-coin');
        } else if (isSpecial) {
            coin.classList.add('special-coin');
        }
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
            detail: { coin, isSpecial, isPhaseChange, isBomb } 
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

    const rotationSpeed = 0.8 + Math.random() * 0.4;
    const frameDuration = FRAME_DURATION * rotationSpeed;
    
    // Manter o frame inicial separado do frame atual
    let currentFrame = frame;
    
    const updateFrame = () => {
        if (!gameState.isRunning || !coin.parentNode) return;
        
        if (isBomb) {
            const currentPhase = `phase${gameState.currentPhase}`;
            const phaseBombs = bombImages[currentPhase];
            
            if (!phaseBombs || phaseBombs.length === 0) {
                console.error('❌ ERRO: Nenhuma bomba disponível para animação na fase', gameState.currentPhase);
                return;
            }
            
            currentFrame = (currentFrame + 1) % phaseBombs.length;
            const bombImg = phaseBombs[currentFrame];
            
            if (bombImg && bombImg.src) {
                coin.style.backgroundImage = `url(${bombImg.src})`;
            }
            
            // Ajustar o intervalo para bombas (mais suave)
            if (coin.parentNode) {
                setTimeout(() => requestAnimationFrame(updateFrame), frameDuration * 1.5);
            }
        } else {
            const coinType = isSpecial ? 'special' : 'normal';
            const phaseCoins = coinImages[`phase${gameState.currentPhase}`][coinType];
            
            if (!phaseCoins || phaseCoins.length === 0) {
                console.error(`❌ ERRO: Nenhuma moeda ${coinType} disponível para animação na fase ${gameState.currentPhase}`);
                return;
            }
            
            currentFrame = (currentFrame + 1) % phaseCoins.length;
            const coinImg = phaseCoins[currentFrame];
            
            if (coinImg && coinImg.src) {
                coin.style.backgroundImage = `url(${coinImg.src})`;
            }
            
            // Atualização normal para moedas
            if (coin.parentNode) {
                setTimeout(() => requestAnimationFrame(updateFrame), frameDuration);
            }
        }
    };
    
    // Inicia a animação com um pequeno delay aleatório
    setTimeout(updateFrame, Math.random() * 100);
    
    // Adiciona ao game area
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
    }, isBomb ? 5000 : COIN_LIFETIME); // Bombas têm 5 segundos de vida, moedas continuam com 2.5 segundos
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
    }, 400);
}

function createMoneyEffect(x, y, isSpecial = false, isPhaseChange = false, isBomb = false) {
    const effect = document.createElement('div');
    effect.className = 'money-effect';
    
    let text, color;
    const isPhase1 = gameState.currentPhase === 1;
    
    if (isBomb) {
        text = '-3';
        color = '#FFD700'; // Amarelo para bomba
    } else if (isPhaseChange) {
        text = '+1';
        color = '#FF00FF'; // Rosa para mudança de fase
    } else if (isSpecial) {
        text = '+2';
        color = isPhase1 ? '#ff3333' : '#00B4D8'; // Vermelho na fase 1, azul na fase 0
    } else {
        text = isPhase1 ? '+2' : '+1'; // +2 na fase 1, +1 na fase 0
        color = isPhase1 ? '#ff3333' : '#00B4D8'; // Vermelho na fase 1, azul na fase 0
    }
    
    effect.textContent = text;
    effect.style.color = color;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    
    gameArea.appendChild(effect);
    
    setTimeout(() => {
        if (effect.parentNode === gameArea) {
            gameArea.removeChild(effect);
        }
    }, 1000);
}

// Modificar a função collectCoin para tratar as bombas
function collectCoin(event) {
    const { coin, isSpecial, isPhaseChange, isBomb } = event.detail;
    const isPhase1 = gameState.currentPhase === 1;
    
    const rect = coin.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (isBomb) {
        // Reduz 3 pontos e cria efeito visual
        gameState.score = Math.max(0, gameState.score - 3);
        createExplosion(x, y);
        createMoneyEffect(x, y, false, false, true);
        applyCameraShake();
    } else if (isPhaseChange) {
        gameState.score += 1;
        createSplash(x, y);
        createMoneyEffect(x, y, false, true);
        applyCameraShake();
        changePhase();
    } else if (isSpecial) {
        gameState.score += 2;
        createSplash(x, y);
        createMoneyEffect(x, y, true);
        applyCameraShake();
        activateDiscoMode();
    } else {
        // Pontos normais baseados na fase
        gameState.score += isPhase1 ? 2 : 1;
        createSplash(x, y);
        createMoneyEffect(x, y);
        applyCameraShake();
    }
    
    updateScore();
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
    
    // Altura aleatória para o voo (ajustada para voar mais alto)
    const flyHeight = Math.random() * 200 + 50; // entre 50px e 250px do topo
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