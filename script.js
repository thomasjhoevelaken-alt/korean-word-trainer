// ====== Preloaded HTSK Lessons 1–10 Vocabulary ======
const vocabulary = [
  // Lesson 1
  {korean: '안녕하세요', english: 'Hello', lesson: 1, selected: true},
  {korean: '감사합니다', english: 'Thank you', lesson: 1, selected: true},
  {korean: '네', english: 'Yes', lesson: 1, selected: true},
  {korean: '아니요', english: 'No', lesson: 1, selected: true},
  {korean: '이름', english: 'Name', lesson: 1, selected: true},
  {korean: '저', english: 'I / Me', lesson: 1, selected: true},
  {korean: '학생', english: 'Student', lesson: 1, selected: true},
  {korean: '선생님', english: 'Teacher', lesson: 1, selected: true},
  // Lesson 2
  {korean: '집', english: 'House / Home', lesson: 2, selected: true},
  {korean: '학교', english: 'School', lesson: 2, selected: true},
  {korean: '회사', english: 'Company', lesson: 2, selected: true},
  {korean: '공원', english: 'Park', lesson: 2, selected: true},
  {korean: '가다', english: 'To go', lesson: 2, selected: true},
  {korean: '오다', english: 'To come', lesson: 2, selected: true},
  {korean: '먹다', english: 'To eat', lesson: 2, selected: true},
  {korean: '보다', english: 'To see / watch', lesson: 2, selected: true},
  // ... Add all lessons up to Lesson 10 in same format
];

// ====== Settings ======
let flashcardLanguage = 'korean'; // 'korean' or 'english'
let audioDelay = 1000; // 1 second between TTS words
let quizOptionsCount = 5; // 5 or 10

// ====== DOM Elements ======
const flashcardsContainer = document.getElementById('flashcards-container');
const playAllBtn = document.getElementById('play-all');
const quizContainer = document.getElementById('quiz-container');
const startQuizBtn = document.getElementById('start-quiz');
const languageToggle = document.getElementById('language-toggle');
const optionsSelect = document.getElementById('quiz-options');

// ====== Functions ======

// Display flashcards grouped by lesson
function renderFlashcards() {
  flashcardsContainer.innerHTML = '';
  const lessons = [...new Set(vocabulary.map(w => w.lesson))];

  lessons.forEach(lesson => {
    const lessonDiv = document.createElement('div');
    lessonDiv.className = 'lesson-group';

    const header = document.createElement('h3');
    header.textContent = `Lesson ${lesson}`;
    header.style.cursor = 'pointer';
    header.onclick = () => {
      const list = lessonDiv.querySelector('.lesson-list');
      list.style.display = list.style.display === 'none' ? 'block' : 'none';
    };
    lessonDiv.appendChild(header);

    const list = document.createElement('div');
    list.className = 'lesson-list';
    vocabulary.filter(w => w.lesson === lesson).forEach(word => {
      const card = document.createElement('div');
      card.className = 'flashcard';
      card.style.fontSize = '1.5em';
      card.style.padding = '20px';
      card.style.margin = '10px';
      card.style.border = '2px solid #333';
      card.style.borderRadius = '8px';
      card.style.cursor = 'pointer';
      card.style.backgroundColor = '#f9f9f9';
      card.textContent = flashcardLanguage === 'korean' ? word.korean : word.english;

      card.onclick = () => {
        const text = card.textContent;
        card.textContent = text === word.korean ? word.english : word.korean;
        speakText(card.textContent, card.textContent === word.korean ? 'ko-KR' : 'en-US');
      };

      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.checked = word.selected;
      toggle.onchange = () => {
        word.selected = toggle.checked;
      };
      const label = document.createElement('label');
      label.textContent = 'Include';
      label.style.marginLeft = '5px';
      card.appendChild(document.createElement('br'));
      card.appendChild(toggle);
      card.appendChild(label);

      list.appendChild(card);
    });
    lessonDiv.appendChild(list);
    flashcardsContainer.appendChild(lessonDiv);
  });
}

// TTS for single word
function speakText(text, lang) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
}

// Play all selected words sequentially
async function playAllSelected() {
  const selectedWords = vocabulary.filter(w => w.selected);
  for (const word of selectedWords) {
    speakText(word.korean, 'ko-KR');
    await new Promise(resolve => setTimeout(resolve, audioDelay));
    speakText(word.english, 'en-US');
    await new Promise(resolve => setTimeout(resolve, audioDelay));
  }
}

// Quiz mode
function startQuiz() {
  quizContainer.innerHTML = '';
  const selectedWords = vocabulary.filter(w => w.selected);
  const word = selectedWords[Math.floor(Math.random() * selectedWords.length)];

  const question = document.createElement('div');
  question.textContent = flashcardLanguage === 'korean' ? word.korean : word.english;
  question.style.fontSize = '1.5em';
  question.style.marginBottom = '15px';
  quizContainer.appendChild(question);

  const options = [];
  options.push(word);
  while (options.length < quizOptionsCount) {
    const randomWord = selectedWords[Math.floor(Math.random() * selectedWords.length)];
    if (!options.includes(randomWord)) options.push(randomWord);
  }

  shuffleArray(options);

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = flashcardLanguage === 'korean' ? opt.english : opt.korean;
    btn.style.display = 'block';
    btn.style.margin = '5px 0';
    btn.onclick = () => {
      btn.style.backgroundColor = opt === word ? 'green' : 'red';
    };
    quizContainer.appendChild(btn);
  });
}

// Utility shuffle
function shuffleArray(array) {
  for (let i = array.length -1; i >0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ====== Event Listeners ======
playAllBtn.onclick = playAllSelected;
startQuizBtn.onclick = startQuiz;
languageToggle.onclick = () => {
  flashcardLanguage = flashcardLanguage === 'korean' ? 'english' : 'korean';
  renderFlashcards();
};
optionsSelect.onchange = () => {
  quizOptionsCount = parseInt(optionsSelect.value);
};

// ====== Initialize ======
renderFlashcards();