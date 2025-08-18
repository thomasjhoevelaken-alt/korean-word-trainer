// ==== DATA ====
let words = [
    { korean: '안녕하세요', english: 'Hello', categories: ['Lesson 1'], selected: true },
    { korean: '감사합니다', english: 'Thank you', categories: ['Lesson 1'], selected: true },
    { korean: '사랑', english: 'Love', categories: ['Lesson 2'], selected: true }
];
let currentCardIndex = 0;
let showingKorean = true;

// ==== DOM ELEMENTS ====
const flashcardText = document.getElementById('flashcard');
const nextBtn = document.getElementById('nextCard');
const prevBtn = document.getElementById('prevCard');
const addBtn = document.getElementById('addWordBtn');
const koreanInput = document.getElementById('koreanInput');
const englishInput = document.getElementById('englishInput');
const playSelectedBtn = document.getElementById('playSelected');
const wordListContainer = document.getElementById('wordList');
const quizBtn = document.getElementById('quizBtn');
const quizContainer = document.getElementById('quizContainer');

// ==== FUNCTIONS ====
function renderFlashcard() {
    if (!words.length) {
        flashcardText.textContent = 'No words added';
        return;
    }
    const w = words[currentCardIndex];
    flashcardText.textContent = showingKorean ? w.korean : w.english;
}

function speak(text, lang = 'ko-KR') {
    return new Promise(res => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        utter.onend = res;
        speechSynthesis.speak(utter);
    });
}

function updateWordList() {
    wordListContainer.innerHTML = '';
    words.forEach((w, index) => {
        const div = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = w.selected;
        checkbox.addEventListener('change', () => w.selected = checkbox.checked);
        const text = document.createElement('span');
        text.textContent = `${w.korean} - ${w.english}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            words.splice(index, 1);
            if (currentCardIndex >= words.length) currentCardIndex = words.length - 1;
            renderFlashcard();
            updateWordList();
        });
        div.appendChild(checkbox);
        div.appendChild(text);
        div.appendChild(deleteBtn);
        wordListContainer.appendChild(div);
    });
}

function addWord() {
    const k = koreanInput.value.trim();
    const e = englishInput.value.trim();
    if (!k || !e) return alert('Fill both fields');
    words.push({ korean: k, english: e, categories: [], selected: true });
    koreanInput.value = '';
    englishInput.value = '';
    renderFlashcard();
    updateWordList();
}

async function playSelectedWords() {
    const selectedWords = words.filter(w => w.selected);
    if (!selectedWords.length) return alert('No words selected');
    for (let w of selectedWords) {
        await speak(w.korean, 'ko-KR');
        await new Promise(r => setTimeout(r, 500));
        await speak(w.english, 'en-US');
        await new Promise(r => setTimeout(r, 500));
    }
}

function flipCard() {
    showingKorean = !showingKorean;
    renderFlashcard();
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % words.length;
    showingKorean = true;
    renderFlashcard();
}

function prevCard() {
    currentCardIndex = (currentCardIndex - 1 + words.length) % words.length;
    showingKorean = true;
    renderFlashcard();
}

// ==== QUIZ MODE ====
function startQuiz() {
    if (!words.length) return alert('No words to quiz');
    quizContainer.innerHTML = '';
    const w = words[Math.floor(Math.random() * words.length)];
    const options = [w.english];
    while (options.length < 4) {
        const rand = words[Math.floor(Math.random() * words.length)].english;
        if (!options.includes(rand)) options.push(rand);
    }
    shuffleArray(options);
    const qDiv = document.createElement('div');
    const qText = document.createElement('h3');
    qText.textContent = `What is the English for "${w.korean}"?`;
    qDiv.appendChild(qText);
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            if (opt === w.english) alert('Correct!');
            else alert(`Wrong! Correct: ${w.english}`);
            startQuiz();
        });
        qDiv.appendChild(btn);
    });
    quizContainer.appendChild(qDiv);
}

function shuffleArray(array) {
    for (let i = array.length -1; i >0; i--){
        const j = Math.floor(Math.random()*(i+1));
        [array[i], array[j]]=[array[j], array[i]];
    }
}

// ==== EVENT LISTENERS ====
flashcardText.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
prevBtn.addEventListener('click', prevCard);
addBtn.addEventListener('click', addWord);
playSelectedBtn.addEventListener('click', playSelectedWords);
quizBtn.addEventListener('click', startQuiz);

// ==== INITIAL RENDER ====
renderFlashcard();
updateWordList();