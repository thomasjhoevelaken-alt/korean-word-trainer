// ====== Korean Word Trainer App ======

// LocalStorage keys
const WORDS_KEY = "koreanTrainer_words";
const STATS_KEY = "koreanTrainer_stats";

// Global state
let words = JSON.parse(localStorage.getItem(WORDS_KEY) || "[]");
let stats = JSON.parse(localStorage.getItem(STATS_KEY) || "{}");

let flashIndex = 0;
let flashOrder = [];
let listeningTimer = null;

// Save words to storage
function saveWords() {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

// Save stats to storage
function saveStats() {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// Utility: generate unique ID
function uid() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// ========== WORD MANAGEMENT ==========

// Render the word list
function renderWords() {
  const container = document.getElementById("wordList");
  container.innerHTML = "";

  words.forEach((w, i) => {
    const div = document.createElement("div");
    div.className = "wordItem";

    div.innerHTML = `
      <b>${w.kr}</b> – ${w.en} 
      <i>[${w.categories.join(", ")}]</i>
      <button onclick="editWord('${w.id}')">Edit</button>
      <button onclick="deleteWord('${w.id}')">Delete</button>
      <button onclick="recordAudio('${w.id}','kr')">🎤KR</button>
      <button onclick="recordAudio('${w.id}','en')">🎤EN</button>
    `;

    container.appendChild(div);
  });

  refreshCategories();
  saveWords();
}

// Add/edit word
document.getElementById("wordForm").addEventListener("submit", e => {
  e.preventDefault();
  const kr = document.getElementById("krInput").value.trim();
  const en = document.getElementById("enInput").value.trim();
  const cats = document.getElementById("catInput").value.trim().split(",").map(c => c.trim()).filter(c => c);

  if (!kr || !en) return;

  // Check if editing
  let editing = words.find(w => w.id === window.editingId);
  if (editing) {
    editing.kr = kr;
    editing.en = en;
    editing.categories = cats;
    window.editingId = null;
  } else {
    words.push({ id: uid(), kr, en, categories: cats, audio: {} });
  }

  document.getElementById("krInput").value = "";
  document.getElementById("enInput").value = "";
  document.getElementById("catInput").value = "";

  renderWords();
});

// Edit a word
function editWord(id) {
  const w = words.find(w => w.id === id);
  if (!w) return;
  document.getElementById("krInput").value = w.kr;
  document.getElementById("enInput").value = w.en;
  document.getElementById("catInput").value = w.categories.join(", ");
  window.editingId = id;
}

// Delete word
function deleteWord(id) {
  words = words.filter(w => w.id !== id);
  renderWords();
}

// Refresh category dropdowns
function refreshCategories() {
  const cats = [...new Set(words.flatMap(w => w.categories))];

  const selects = ["flashCategory","listenCategory","quizCategory"];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = "<option value='all'>All</option>";
    cats.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  });
}

// ========== FLASHCARDS ==========

function startFlashcards() {
  const cat = document.getElementById("flashCategory").value;
  let pool = cat === "all" ? words : words.filter(w => w.categories.includes(cat));

  flashOrder = [...pool];
  if (document.getElementById("orderMode").value === "shuffle") {
    flashOrder.sort(() => Math.random() - 0.5);
  }
  flashIndex = 0;
  showFlashcard();
}

function showFlashcard() {
  if (flashOrder.length === 0) {
    document.getElementById("flashcard").textContent = "No words.";
    return;
  }
  const card = flashOrder[flashIndex];
  const frontLang = document.getElementById("frontLang").value;
  const text = frontLang === "kr" ? card.kr : card.en;
  document.getElementById("flashcard").textContent = text;
  document.getElementById("flashcard").dataset.flipped = "false";
}

function flipFlashcard() {
  if (flashOrder.length === 0) return;
  const card = flashOrder[flashIndex];
  const frontLang = document.getElementById("frontLang").value;
  const flipped = document.getElementById("flashcard").dataset.flipped === "true";
  const text = (!flipped ? (frontLang==="kr"?card.en:card.kr) : (frontLang==="kr"?card.kr:card.en));
  document.getElementById("flashcard").textContent = text;
  document.getElementById("flashcard").dataset.flipped = flipped ? "false" : "true";
}

function prevCard() {
  if (flashOrder.length === 0) return;
  flashIndex = (flashIndex - 1 + flashOrder.length) % flashOrder.length;
  showFlashcard();
}

function nextCard() {
  if (flashOrder.length === 0) return;
  flashIndex = (flashIndex + 1) % flashOrder.length;
  showFlashcard();
}
// ========== AUDIO RECORDING ==========

let mediaRecorder;
let recordedChunks = [];
let currentRecording = null;

async function recordAudio(id, lang) {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];
    currentRecording = { id, lang };

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);

      const word = words.find(w => w.id === currentRecording.id);
      if (word) {
        word.audio[currentRecording.lang] = url;
        saveWords();
        renderWords();
      }
      currentRecording = null;
    };

    mediaRecorder.start();
    alert("Recording... click again to stop.");
  } catch (err) {
    alert("Microphone error: " + err);
  }
}

// Play audio for a word
function playAudio(word, lang) {
  if (word.audio && word.audio[lang]) {
    new Audio(word.audio[lang]).play();
  }
}

// ========== LISTENING MODE ==========

function startListening() {
  const cat = document.getElementById("listenCategory").value;
  let pool = cat === "all" ? words : words.filter(w => w.categories.includes(cat));

  if (document.getElementById("listenOrder").value === "shuffle") {
    pool.sort(() => Math.random() - 0.5);
  }

  let i = 0;
  const delay = parseInt(document.getElementById("listenDelay").value) || 2000;

  clearInterval(listeningTimer);
  listeningTimer = setInterval(() => {
    const w = pool[i];
    if (!w) return;

    // Play KR then EN if available
    playAudio(w, "kr");
    setTimeout(() => playAudio(w, "en"), delay);

    i = (i + 1) % pool.length;
  }, delay * 2);
}

function stopListening() {
  clearInterval(listeningTimer);
}

// ========== QUIZ MODE ==========

let quizPool = [];
let quizIndex = 0;

function startQuiz() {
  const cat = document.getElementById("quizCategory").value;
  quizPool = cat === "all" ? [...words] : words.filter(w => w.categories.includes(cat));

  if (quizPool.length === 0) {
    document.getElementById("quizArea").textContent = "No words to quiz.";
    return;
  }

  quizIndex = 0;
  showQuiz();
}

function showQuiz() {
  const q = quizPool[quizIndex];
  if (!q) return;

  document.getElementById("quizArea").innerHTML = `
    <div><b>${q.kr}</b></div>
    <input id="quizAnswer" placeholder="Enter English">
    <button onclick="checkQuiz('${q.id}')">Submit</button>
  `;
}

function checkQuiz(id) {
  const q = quizPool.find(w => w.id === id);
  const ans = document.getElementById("quizAnswer").value.trim().toLowerCase();

  if (!stats[id]) stats[id] = { correct: 0, total: 0 };
  stats[id].total++;

  if (ans === q.en.toLowerCase()) {
    stats[id].correct++;
    alert("✅ Correct!");
  } else {
    alert("❌ Wrong! Answer: " + q.en);
  }

  saveStats();
  quizIndex++;
  if (quizIndex < quizPool.length) {
    showQuiz();
  } else {
    document.getElementById("quizArea").textContent = "Quiz finished!";
  }
}

// ========== STATS ==========

function showStats() {
  const div = document.getElementById("statsArea");
  div.innerHTML = "";

  words.forEach(w => {
    const s = stats[w.id] || { correct: 0, total: 0 };
    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    div.innerHTML += `<div>${w.kr} – ${w.en}: ${s.correct}/${s.total} (${pct}%)</div>`;
  });
}

// ========== INIT ==========

renderWords();
refreshCategories();