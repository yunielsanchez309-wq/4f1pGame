// ============================================
// 4 FOTOS 1 PALABRA - VERSIÓN PARA APP INVENTOR (con TinyDB)
// ============================================

// Panel de depuración visual (opcional, puedes quitarlo si no lo necesitas)
const debugDiv = document.createElement('div');
debugDiv.id = 'debug';
debugDiv.style.cssText = 'position:fixed; top:0; left:0; background:yellow; color:black; z-index:9999; font-size:12px; height:0px; overflow:auto; width:100%; display:none;';
document.body.appendChild(debugDiv);

function debugLog(msg) {
    console.log(msg);
    if (debugDiv) {
        debugDiv.style.display = 'block';
        debugDiv.innerHTML += msg + '<br>';
    }
}

debugLog('Script iniciado');

// ==================== INTERFAZ CON APP INVENTOR (TinyDB) ====================
// Si no existe AppInventor (por ejemplo, en pruebas locales), creamos un dummy
if (typeof window.AppInventor === 'undefined') {
    window.AppInventor = {
        getWebViewString: function() { return ''; },
        setWebViewString: function(str) { console.log('WebViewString (simulado):', str); }
    };
    debugLog('AppInventor no detectado, usando simulación');
}

// ==================== NIVELES ====================
// He simplificado las rutas de imágenes: todas deben estar en la raíz de "Assets"
// (sin subcarpetas). Cambié los nombres raros por nombres simples.
// Asegúrate de subir las imágenes con estos nombres a App Inventor.
const gameLevels = [
    {
        word: "PLAYA",
        images: ["Playa1.jpg", "Playa2.jpg", "Playa3.jpg", "Playa4.jpg"],
        letters: ["P","L","A","Y","A","S","O","L","M","A","R","T"]
    },
    {
        word: "DEPORTE",
        images: ["deporte1.jpg", "deporte2.jpg", "deporte3.jpg", "deporte4.jpg"],
        letters: ["D","E","P","O","R","T","E","F","U","T","B","O","L"]
    },
    {
        word: "MUSICA",
        images: ["musica1.jpg", "musica2.jpg", "musica3.jpg", "musica4.jpg"],
        letters: ["M","U","S","I","C","A","N","O","T","A","S","O","N"]
    },
    {
        word: "COMIDA",
        images: ["comida1.jpg", "comida2.jpg", "comida3.jpg", "comida4.jpg"],
        letters: ["C","O","M","I","D","A","P","E","S","C","A","R","T"]
    },
    {
        word: "VIAJE",
        images: ["viaje1.jpg", "viaje2.jpg", "viaje3.jpg", "viaje4.jpg"],
        letters: ["V","I","A","J","E","A","V","I","O","N","M","A","L"]
    },
    {
        word: "ANIMAL",
        images: ["animal1.jpg", "animal2.jpg", "animal3.jpg", "animal4.jpg"],
        letters: ["A","N","I","M","A","L","P","E","R","R","O","G","A"]
    },
    {
        word: "FLORES",
        images: ["flores1.jpg", "flores2.jpg", "flores3.jpg", "flores4.jpg"],
        letters: ["F","L","O","R","E","S","R","O","S","A","J","A","R"]
    },
    {
        word: "LIBRO",
        images: ["libro1.jpg", "libro2.jpg", "libro3.jpg", "libro4.jpg"],
        letters: ["L","I","B","R","O","P","A","G","I","N","A","L","E"]
    },
    {
        word: "CIUDAD",
        images: ["ciudad1.jpg", "ciudad2.jpg", "ciudad3.jpg", "ciudad4.jpg"],
        letters: ["C","I","U","D","A","D","E","D","I","F","I","C","I"]
    },
    {
        word: "ESCUELA",
        images: ["escuela1.jpg", "escuela2.jpg", "escuela3.jpg", "escuela4.jpg"],
        letters: ["E","S","C","U","E","L","A","P","R","O","F","E","S","O","R"]
    }
];

// ==================== ESTADO DEL JUEGO ====================
let currentLevel = 0;
let score = 0;
let hints = 3;
let currentAnswer = [];
let availableLetters = [];
let gameActive = true;

// ==================== ELEMENTOS DEL DOM ====================
const levelElement = document.getElementById('level');
const hintsElement = document.getElementById('hints');
const scoreElement = document.getElementById('score');
const answerDisplay = document.getElementById('answer-display');
const lettersContainer = document.getElementById('letters-container');
const hintBtn = document.getElementById('hint-btn');
const shopBtn = document.getElementById('shop-btn');
const resetBtn = document.getElementById('reset-btn');
const messageElement = document.getElementById('message');
const levelCompleteModal = document.getElementById('level-complete-modal');
const correctWordElement = document.getElementById('correct-word');
const pointsEarnedElement = document.getElementById('points-earned');
const nextBtn = document.getElementById('next-btn');
const gameCompletedModal = document.getElementById('game-completed-modal');
const finalScoreElement = document.getElementById('final-score');
const shopModal = document.getElementById('shop-modal');
const closeShopBtn = document.getElementById('close-shop');
const shopScoreElement = document.getElementById('shop-score');
const buyHintsBtn = document.getElementById('buy-hints-btn');
const buyBigHintsBtn = document.getElementById('buy-big-hints-btn');
const buyRevealBtn = document.getElementById('buy-reveal-btn');
const imageModal = document.getElementById('image-modal');
const fullImageElement = document.getElementById('full-image');
const closeImageBtn = document.getElementById('close-image');
const loadingElement = document.getElementById('loading');

const photo1 = document.getElementById('photo1');
const photo2 = document.getElementById('photo2');
const photo3 = document.getElementById('photo3');
const photo4 = document.getElementById('photo4');
const photo1Container = document.getElementById('photo1-container');
const photo2Container = document.getElementById('photo2-container');
const photo3Container = document.getElementById('photo3-container');
const photo4Container = document.getElementById('photo4-container');

// ==================== SISTEMA DE GUARDADO CON TINYDB (via WebViewString) ====================
const SAVE_KEY = '4fotos1palabra_save';

function loadGameState() {
    try {
        const savedState = window.AppInventor.getWebViewString();
        if (savedState) {
            const state = JSON.parse(savedState);
            currentLevel = state.currentLevel || 0;
            score = state.score || 0;
            hints = state.hints || 3;
            debugLog('Estado cargado desde WebViewString');
        } else {
            // Primera vez
            hints = 3;
            debugLog('Primera vez, pistas = 3');
        }
    } catch (e) {
        debugLog('Error cargando estado: ' + e.message);
        // Si falla, valores por defecto
        currentLevel = 0;
        score = 0;
        hints = 3;
    }
}

function saveGameState() {
    try {
        const state = {
            currentLevel: currentLevel,
            score: score,
            hints: hints
        };
        const stateString = JSON.stringify(state);
        window.AppInventor.setWebViewString(stateString);
        debugLog('Estado guardado en WebViewString');
    } catch (e) {
        debugLog('Error guardando estado: ' + e.message);
    }
}

function resetGameState() {
    currentLevel = 0;
    score = 0;
    hints = 3;
    saveGameState();
    initGame();
}

// ==================== FUNCIONES DEL JUEGO ====================
function showLoading() {
    if (loadingElement) loadingElement.style.display = 'flex';
}
function hideLoading() {
    if (loadingElement) loadingElement.style.display = 'none';
}

function showGameCompletedModal() {
    if (finalScoreElement) finalScoreElement.textContent = score;
    if (gameCompletedModal) gameCompletedModal.style.display = 'flex';
}

function calculateLetterSize(wordLength) {
    const containerWidth = answerDisplay.offsetWidth || 300;
    const maxLetterWidth = Math.min(35, containerWidth / wordLength - 8);
    return {
        width: maxLetterWidth,
        height: maxLetterWidth * 1.2,
        fontSize: maxLetterWidth * 0.5
    };
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateAnswerDisplay() {
    answerDisplay.innerHTML = '';
    const word = gameLevels[currentLevel].word;
    const letterSize = calculateLetterSize(word.length);
    
    currentAnswer.forEach((letter, index) => {
        const letterBox = document.createElement('div');
        letterBox.className = `letter-box ${letter ? 'filled' : ''}`;
        letterBox.textContent = letter;
        letterBox.dataset.index = index;
        
        letterBox.style.minWidth = `${letterSize.width}px`;
        letterBox.style.height = `${letterSize.height}px`;
        letterBox.style.fontSize = `${letterSize.fontSize}px`;
        
        if (letter) {
            letterBox.addEventListener('click', () => removeLetterFromAnswer(index));
        }
        
        answerDisplay.appendChild(letterBox);
    });
}

function updateLettersDisplay() {
    lettersContainer.innerHTML = '';
    const totalCells = 15;
    const currentLetters = availableLetters.filter(letter => letter !== '');
    
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        
        if (i < currentLetters.length) {
            const letter = currentLetters[i];
            const letterElement = document.createElement('div');
            letterElement.className = 'letter';
            letterElement.textContent = letter;
            
            const realIndex = availableLetters.indexOf(letter, i);
            letterElement.dataset.index = realIndex !== -1 ? realIndex : i;
            
            letterElement.addEventListener('click', () => {
                const idx = parseInt(letterElement.dataset.index);
                if (!isNaN(idx)) selectLetter(idx);
            });
            
            cell.appendChild(letterElement);
        } else {
            cell.style.width = '36px';
            cell.style.height = '40px';
            cell.style.visibility = 'hidden';
        }
        
        lettersContainer.appendChild(cell);
    }
}

function updateGameInfo() {
    if (levelElement) levelElement.textContent = currentLevel + 1;
    if (hintsElement) hintsElement.textContent = hints;
    if (scoreElement) scoreElement.textContent = score;
    if (shopScoreElement) shopScoreElement.textContent = score;
    
    if (buyHintsBtn) buyHintsBtn.disabled = score < 100;
    if (buyBigHintsBtn) buyBigHintsBtn.disabled = score < 300;
    if (buyRevealBtn) buyRevealBtn.disabled = score < 50;
}

function updateHintButton() {
    if (hintBtn) {
        hintBtn.textContent = `Pista (${hints})`;
        hintBtn.disabled = hints === 0;
    }
}

function selectLetter(letterIndex) {
    if (!gameActive) return;
    
    if (letterIndex >= availableLetters.length || availableLetters[letterIndex] === '') {
        for (let i = 0; i < availableLetters.length; i++) {
            if (availableLetters[i] !== '') {
                letterIndex = i;
                break;
            }
        }
    }
    
    const emptyIndex = currentAnswer.findIndex(letter => letter === '');
    if (emptyIndex === -1) return;
    
    currentAnswer[emptyIndex] = availableLetters[letterIndex];
    availableLetters[letterIndex] = '';
    
    updateAnswerDisplay();
    updateLettersDisplay();
    
    if (currentAnswer.every(letter => letter !== '')) {
        checkAnswer();
    }
}

function removeLetterFromAnswer(answerIndex) {
    if (!gameActive) return;
    
    const letterToRemove = currentAnswer[answerIndex];
    if (!letterToRemove) return;
    
    const emptyIndex = availableLetters.findIndex(letter => letter === '');
    if (emptyIndex !== -1) {
        availableLetters[emptyIndex] = letterToRemove;
        currentAnswer[answerIndex] = '';
        updateAnswerDisplay();
        updateLettersDisplay();
    }
}

function checkAnswer() {
    const userAnswer = currentAnswer.join('');
    const correctAnswer = gameLevels[currentLevel].word;
    
    if (userAnswer === correctAnswer) {
        gameActive = false;
        score += 50;
        updateGameInfo();
        
        messageElement.textContent = '¡Correcto!';
        messageElement.className = 'message success';
        
        const isLastLevel = currentLevel === gameLevels.length - 1;
        
        setTimeout(() => {
            if (isLastLevel) {
                showGameCompletedModal();
            } else {
                correctWordElement.textContent = correctAnswer;
                pointsEarnedElement.textContent = '50';
                levelCompleteModal.style.display = 'flex';
            }
        }, 800);
        
        saveGameState(); // Guardar después de sumar puntos
    } else {
        messageElement.textContent = 'La palabra no es correcta';
        messageElement.className = 'message error';
        
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 2000);
    }
}

function useHint() {
    if (hints <= 0 || !gameActive) return;
    
    const correctAnswer = gameLevels[currentLevel].word;
    let hintIndex = -1;
    
    for (let i = 0; i < correctAnswer.length; i++) {
        if (currentAnswer[i] !== correctAnswer[i]) {
            hintIndex = i;
            break;
        }
    }
    
    if (hintIndex !== -1) {
        const neededLetter = correctAnswer[hintIndex];
        const availableIndex = availableLetters.findIndex(letter => letter === neededLetter);
        
        if (availableIndex !== -1) {
            currentAnswer[hintIndex] = neededLetter;
            availableLetters[availableIndex] = '';
            
            updateAnswerDisplay();
            updateLettersDisplay();
            
            hints--;
            updateGameInfo();
            updateHintButton();
            
            messageElement.textContent = `Pista usada: Letra "${neededLetter}" agregada`;
            messageElement.className = 'message success';
            
            if (currentAnswer.every(letter => letter !== '')) {
                setTimeout(checkAnswer, 500);
            }
            
            saveGameState(); // Guardar después de usar pista
        }
    } else {
        messageElement.textContent = '¡Ya casi has completado la palabra!';
        messageElement.className = 'message';
    }
}

function buyHints(amount, cost) {
    if (score < cost) {
        messageElement.textContent = 'No tienes suficientes puntos';
        messageElement.className = 'message error';
        return;
    }
    score -= cost;
    hints += amount;
    updateGameInfo();
    updateHintButton();
    messageElement.textContent = `¡Compra exitosa! Obtuviste ${amount} pista(s)`;
    messageElement.className = 'message success';
    closeShop();
    saveGameState(); // Guardar después de comprar
}

function buyRevealLetter(cost) {
    if (score < cost) {
        messageElement.textContent = 'No tienes suficientes puntos';
        messageElement.className = 'message error';
        return;
    }
    
    const correctAnswer = gameLevels[currentLevel].word;
    let revealIndex = -1;
    
    for (let i = 0; i < correctAnswer.length; i++) {
        if (currentAnswer[i] !== correctAnswer[i]) {
            revealIndex = i;
            break;
        }
    }
    
    if (revealIndex !== -1) {
        const neededLetter = correctAnswer[revealIndex];
        const availableIndex = availableLetters.findIndex(letter => letter === neededLetter);
        
        if (availableIndex !== -1) {
            currentAnswer[revealIndex] = neededLetter;
            availableLetters[availableIndex] = '';
            updateAnswerDisplay();
            updateLettersDisplay();
            score -= cost;
            updateGameInfo();
            messageElement.textContent = `Letra "${neededLetter}" revelada`;
            messageElement.className = 'message success';
            
            if (currentAnswer.every(letter => letter !== '')) {
                setTimeout(checkAnswer, 500);
            }
            
            closeShop();
            saveGameState(); // Guardar después de revelar
        }
    } else {
        messageElement.textContent = '¡Ya has completado la palabra!';
        messageElement.className = 'message';
    }
}

function nextLevel() {
    if (currentLevel >= gameLevels.length - 1) {
        showGameCompletedModal();
        return;
    }
    currentLevel++;
    initGame();
    levelCompleteModal.style.display = 'none';
    saveGameState(); // Guardar después de avanzar nivel
}

function openShop() {
    if (shopScoreElement) shopScoreElement.textContent = score;
    if (shopModal) shopModal.style.display = 'flex';
}

function closeShop() {
    if (shopModal) shopModal.style.display = 'none';
}

function showFullImage(imageSrc) {
    if (fullImageElement) fullImageElement.src = imageSrc;
    if (imageModal) imageModal.style.display = 'flex';
}

function closeFullImage() {
    if (imageModal) imageModal.style.display = 'none';
}

// ==================== INICIALIZACIÓN DEL JUEGO ====================
function initGame() {
    showLoading();
    gameActive = true;
    
    // Verificar que exista el nivel actual
    if (currentLevel >= gameLevels.length) currentLevel = gameLevels.length - 1;
    const currentLevelData = gameLevels[currentLevel];
    
    // Asignar imágenes (con manejo de errores)
    const setImage = (imgElement, src) => {
        if (imgElement) {
            imgElement.src = src;
            imgElement.onerror = () => {
                imgElement.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23333' width='400' height='300'/%3E%3Ctext fill='%23fff' font-family='sans-serif' font-size='30' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImagen%3C/text%3E%3C/svg%3E";
            };
        }
    };
    
    setImage(photo1, currentLevelData.images[0]);
    setImage(photo2, currentLevelData.images[1]);
    setImage(photo3, currentLevelData.images[2]);
    setImage(photo4, currentLevelData.images[3]);
    
    currentAnswer = Array(currentLevelData.word.length).fill('');
    availableLetters = [...currentLevelData.letters];
    shuffleArray(availableLetters);
    
    updateAnswerDisplay();
    updateLettersDisplay();
    updateGameInfo();
    
    if (messageElement) {
        messageElement.textContent = '';
        messageElement.className = 'message';
    }
    if (levelCompleteModal) levelCompleteModal.style.display = 'none';
    if (gameCompletedModal) gameCompletedModal.style.display = 'none';
    
    updateHintButton();
    
    setTimeout(hideLoading, 500);
}

// ==================== EVENT LISTENERS ====================
if (hintBtn) hintBtn.addEventListener('click', useHint);
if (shopBtn) shopBtn.addEventListener('click', openShop);
if (resetBtn) resetBtn.addEventListener('click', resetGameState);
if (nextBtn) nextBtn.addEventListener('click', nextLevel);
if (closeShopBtn) closeShopBtn.addEventListener('click', closeShop);
if (closeImageBtn) closeImageBtn.addEventListener('click', closeFullImage);
if (buyHintsBtn) buyHintsBtn.addEventListener('click', () => buyHints(3, 100));
if (buyBigHintsBtn) buyBigHintsBtn.addEventListener('click', () => buyHints(10, 300));
if (buyRevealBtn) buyRevealBtn.addEventListener('click', () => buyRevealLetter(50));

if (photo1Container) photo1Container.addEventListener('click', () => showFullImage(photo1.src));
if (photo2Container) photo2Container.addEventListener('click', () => showFullImage(photo2.src));
if (photo3Container) photo3Container.addEventListener('click', () => showFullImage(photo3.src));
if (photo4Container) photo4Container.addEventListener('click', () => showFullImage(photo4.src));

if (gameCompletedModal) {
    gameCompletedModal.addEventListener('click', (e) => {
        if (e.target === gameCompletedModal) {
            // No cerrar
        }
    });
}
if (shopModal) {
    shopModal.addEventListener('click', (e) => {
        if (e.target === shopModal) closeShop();
    });
}
if (imageModal) {
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) closeFullImage();
    });
}

// ==================== INICIO AUTOMÁTICO ====================
debugLog('Iniciando juego...');
loadGameState();
initGame();