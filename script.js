// ========== Data Structures ==========
let lessons = {}; // { lessonName: [ {kr, en, categories, selected} ] }
let flashcards = [];
let currentFlashIndex = 0;

// Sample preload for first 10 HTSK lessons (shortened example)
const preloadWords = {
    "Lesson 1": [
        { kr: "안녕하세요", en: "Hello", categories: ["greeting"], selected: true },
        { kr: "감사합니다", en: "Thank you", categories: ["greeting"], selected: true }
    ],
    "Lesson 2": [
        { kr: "네", en: "Yes", categories: ["response"], selected: true },
        { kr: "아니요", en: "No", categories: ["response"], selected: true }
    ]
    // Add more lessons/words as needed
};

// Load preloaded words
lessons = { ...preloadWords };

// ========== Helper Functions ==========
function renderLessons() {
    const container = document.getElementById('lessonContainer');
    container.innerHTML = '';
    for (let lesson in lessons) {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${lesson}</strong> <button onclick="toggleLesson('${lesson}')">Show/Hide</button>`;
        const wordList = document.createElement('div');
        wordList.id = lesson + "_words";
        wordList.style.display = 'none';
        lessons[lesson].forEach((word, idx) => {
            const wDiv = document.createElement('div');
            wDiv.className = 'wordItem';
            wDiv.innerHTML = `
                <input type="checkbox" ${word.selected ? 'checked' : ''} onchange="toggleWord('${lesson}',${idx},this)">
                ${word.kr} - ${word.en} [${word.categories.join(', ')}]
                <button onclick="deleteWord('${lesson}',${idx})">Delete</button>
            `;
            wordList.appendChild(wDiv);
        });
        div.appendChild(wordList);
        container.appendChild(div);
    }
    updateLessonSelects();
}

function toggleLesson(lesson) {
    const wordList = document.getElementById(lesson + "_words");
    wordList.style.display = wordList.style.display === 'none' ? 'block' : 'none';
}

function toggleWord(lesson, idx, checkbox) {
    lessons[lesson][idx].selected = checkbox.checked;
}

function deleteWord(lesson, idx) {
    lessons[lesson].splice(idx,1);
    renderLessons();
}

function addWord() {
    const kr = document.getElementById('krInput').value.trim();
    const en = document.getElementById('enInput').value.trim();
    const categories = document.getElementById('categoryInput').value.split(',').map(c=>c.trim());
    if(!kr || !en) return alert("Enter both Korean and English.");
    const lesson = "Custom";
    if(!lessons[lesson]) lessons[lesson] = [];
    lessons[lesson].push({kr,en,categories,selected:true});
    renderLessons();
    document.getElementById('krInput').value = '';
    document.getElementById('enInput').value = '';
    document.getElementById('categoryInput').value = '';
}

// ========== Flashcards ==========
function updateLessonSelects() {
    const flashSelect = document.getElementById('lessonSelect');
    const quizSelect = document.getElementById('quizLessonSelect');
    [flashSelect, quizSelect].forEach(sel=>{
        sel.innerHTML = '';
        for (let lesson in lessons) {
            sel.innerHTML += `<option value="${lesson}">${lesson}</option>`;
        }
    });
}

function startFlashcards() {
    const selectedLesson = document.getElementById('lessonSelect').value;
    flashcards = lessons[selectedLesson].filter(w=>w.selected);
    currentFlashIndex = 0;
    showFlashcard();
}

function showFlashcard() {
    const area = document.getElementById('flashArea');
    if(flashcards.length === 0) { area.innerHTML = "No words selected."; return; }
    const word = flashcards[currentFlashIndex];
    area.innerHTML = `
        <div class="flashCard" onclick="flipFlashcard()">
            <span id="flashText">${word.kr}</span>
        </div>
        <button onclick="prevFlashcard()">Previous</button>
        <button onclick="nextFlashcard()">Next</button>
    `;
}

function flipFlashcard() {
    const text = document.getElementById('flashText');
    const word = flashcards[currentFlashIndex];
    text.innerText = text.innerText === word.kr ? word.en : word.kr;
}

function nextFlashcard() {
    currentFlashIndex = (currentFlashIndex + 1) % flashcards.length;
    showFlashcard();
}

function prevFlashcard() {
    currentFlashIndex = (currentFlashIndex - 1 + flashcards.length) % flashcards.length;
    showFlashcard();
}

// ========== Listening Mode ==========
function playAllSelected() {
    const delay = parseInt(document.getElementById('listenDelay').value);
    let selectedWords = [];
    for(let lesson in lessons) {
        lessons[lesson].forEach(w=>{
            if(w.selected) selectedWords.push(w);
        });
    }
    let i = 0;
    function playNext() {
        if(i >= selectedWords.length) return;
        const word = selectedWords[i];
        const utter = new SpeechSynthesisUtterance(word.kr);
        utter.lang = 'ko-KR';
        speechSynthesis.speak(utter);
        i++;
        setTimeout(playNext, delay);
    }
    playNext();
}

// ========== Quiz Mode ==========
function startQuiz() {
    const selectedLesson = document.getElementById('quizLessonSelect').value;
    const optionCount = parseInt(document.getElementById('quizOptions').value);
    const quizArea = document.getElementById('quizArea');
    const quizWords = lessons[selectedLesson].filter(w=>w.selected);
    if(quizWords.length === 0) { quizArea.innerHTML = "No words selected."; return; }

    const word = quizWords[Math.floor(Math.random()*quizWords.length)];
    let options = [word.en];
    while(options.length<optionCount) {
        const random = quizWords[Math.floor(Math.random()*quizWords.length)].en;
        if(!options.includes(random)) options.push(random);
    }
    options = options.sort(()=>Math.random()-0.5);

    quizArea.innerHTML = `<div><strong>${word.kr}</strong></div>`;
    options.forEach(opt=>{
        const btn = document.createElement('button');
        btn.className = 'quizOption';
        btn.innerText = opt;
        btn.onclick = ()=> {
            if(opt===word.en) alert("Correct!");
            else alert(`Wrong! Correct answer: ${word.en}`);
            startQuiz();
        }
        quizArea.appendChild(btn);
    });
}

// ========== Event Listeners ==========
document.getElementById('addWordBtn').addEventListener('click', addWord);
document.getElementById('startFlashBtn').addEventListener('click', startFlashcards);
document.getElementById('playAllBtn').addEventListener('click', playAllSelected);
document.getElementById('startQuizBtn').addEventListener('click', startQuiz);

// Initial render
renderLessons();