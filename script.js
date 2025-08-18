let words = [];
let currentCardIndex = 0;
let showingKorean = true;

// Preload some words (HTSK lessons 1-3 as example)
const preloadWords = [
    {korean: '안녕하세요', english: 'Hello', lesson: '1', selected: true},
    {korean: '감사합니다', english: 'Thank you', lesson: '1', selected: true},
    {korean: '사랑', english: 'Love', lesson: '2', selected: true},
    {korean: '학교', english: 'School', lesson: '2', selected: true},
    {korean: '음식', english: 'Food', lesson: '3', selected: true},
];

words.push(...preloadWords);

// DOM Elements
const koreanInput = document.getElementById('korean-word');
const englishInput = document.getElementById('english-word');
const lessonInput = document.getElementById('lesson');
const addBtn = document.getElementById('add-word');
const lessonsContainer = document.getElementById('lessons-container');
const flashcardText = document.getElementById('flashcard-text');
const flipBtn = document.getElementById('flip-card');
const prevBtn = document.getElementById('prev-card');
const nextBtn = document.getElementById('next-card');
const playSelectedBtn = document.getElementById('play-selected');
const startQuizBtn = document.getElementById('start-quiz');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');

// Add word
addBtn.addEventListener('click', () => {
    const k = koreanInput.value.trim();
    const e = englishInput.value.trim();
    const l = lessonInput.value.trim();
    if (!k || !e || !l) return alert('Fill all fields');
    words.push({korean: k, english: e, lesson: l, selected: true});
    koreanInput.value = '';
    englishInput.value = '';
    lessonInput.value = '';
    renderLessons();
});

// Render lessons
function renderLessons() {
    const lessons = {};
    words.forEach(w => {
        if (!lessons[w.lesson]) lessons[w.lesson] = [];
        lessons[w.lesson].push(w);
    });

    lessonsContainer.innerHTML = '';
    for (let lesson in lessons) {
        const lessonDiv = document.createElement('div');
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = `Lesson ${lesson}`;
        let open = true;
        toggleBtn.addEventListener('click', () => {
            open = !open;
            listDiv.style.display = open ? 'block' : 'none';
        });
        lessonDiv.appendChild(toggleBtn);

        const listDiv = document.createElement('div');
        lessons[lesson].forEach((w, i) => {
            const wordDiv = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = w.selected;
            checkbox.addEventListener('change', () => { w.selected = checkbox.checked; });
            wordDiv.appendChild(checkbox);

            const text = document.createElement('span');
            text.textContent = `${w.korean} - ${w.english}`;
            wordDiv.appendChild(text);

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', () => {
                words.splice(words.indexOf(w), 1);
                renderLessons();
            });
            wordDiv.appendChild(delBtn);

            listDiv.appendChild(wordDiv);
        });
        lessonDiv.appendChild(listDiv);
        lessonsContainer.appendChild(lessonDiv);
    }
}

// Flashcards
function showCard() {
    if (!words.length) return flashcardText.textContent = 'No words';
    const w = words[currentCardIndex];
    flashcardText.textContent = showingKorean ? w.korean : w.english;
}
flipBtn.addEventListener('click', () => {
    showingKorean = !showingKorean;
    showCard();
});
prevBtn.addEventListener('click', () => {
    currentCardIndex = (currentCardIndex - 1 + words.length) % words.length;
    showingKorean = true;
    showCard();
});
nextBtn.addEventListener('click', () => {
    currentCardIndex = (currentCardIndex + 1) % words.length;
    showingKorean = true;
    showCard();
});

// Listening
async function speak(text, lang='ko-KR') {
    return new Promise(resolve => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        utter.onend = resolve;
        speechSynthesis.speak(utter);
    });
}
playSelectedBtn.addEventListener('click', async () => {
    for (let w of words.filter(w => w.selected)) {
        await speak(w.korean, 'ko-KR');
        await speak(w.english, 'en-US');
    }
});

// Quiz
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}
startQuizBtn.addEventListener('click', () => {
    const quizWords = words.filter(w => w.selected);
    if (!quizWords.length) return alert('No words selected');
    const current = quizWords[Math.floor(Math.random() * quizWords.length)];
    quizQuestion.textContent = `What is the English for "${current.korean}"?`;
    const options = shuffleArray([current, ...shuffleArray(quizWords).slice(0, 4)]).slice(0,5);
    quizOptions.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.english;
        btn.addEventListener('click', () => {
            alert(opt.english === current.english ? 'Correct!' : `Wrong! Correct: ${current.english}`);
        });
        quizOptions.appendChild(btn);
    });
});

renderLessons();
showCard();