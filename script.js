// ======== Initialize Vocabulary (HTSK Lessons 1-10 simplified sample) ========
let words = JSON.parse(localStorage.getItem('words') || 'null');
if(!words){
  words = [
    {lesson:"Lesson 1", kr:"안녕하세요", en:"Hello", categories:["greeting"]},
    {lesson:"Lesson 1", kr:"감사합니다", en:"Thank you", categories:["greeting"]},
    {lesson:"Lesson 2", kr:"이름", en:"Name", categories:["noun"]},
    {lesson:"Lesson 2", kr:"사람", en:"Person", categories:["noun"]},
    {lesson:"Lesson 3", kr:"학교", en:"School", categories:["noun"]},
    {lesson:"Lesson 3", kr:"학생", en:"Student", categories:["noun"]},
    {lesson:"Lesson 4", kr:"먹다", en:"To eat", categories:["verb"]},
    {lesson:"Lesson 4", kr:"마시다", en:"To drink", categories:["verb"]},
    {lesson:"Lesson 5", kr:"좋다", en:"Good", categories:["adjective"]},
    {lesson:"Lesson 5", kr:"나쁘다", en:"Bad", categories:["adjective"]},
    {lesson:"Lesson 6", kr:"책", en:"Book", categories:["noun"]},
    {lesson:"Lesson 6", kr:"물", en:"Water", categories:["noun"]},
    {lesson:"Lesson 7", kr:"가다", en:"To go", categories:["verb"]},
    {lesson:"Lesson 7", kr:"오다", en:"To come", categories:["verb"]},
    {lesson:"Lesson 8", kr:"예쁘다", en:"Pretty", categories:["adjective"]},
    {lesson:"Lesson 8", kr:"멋있다", en:"Cool", categories:["adjective"]},
    {lesson:"Lesson 9", kr:"의자", en:"Chair", categories:["noun"]},
    {lesson:"Lesson 9", kr:"테이블", en:"Table", categories:["noun"]},
    {lesson:"Lesson 10", kr:"사랑", en:"Love", categories:["noun"]},
    {lesson:"Lesson 10", kr:"행복", en:"Happiness", categories:["noun"]}
  ];
  localStorage.setItem('words', JSON.stringify(words));
}

// ======== Render Lessons ========
function renderLessons(){
  const container = document.getElementById('lessonContainer');
  container.innerHTML="";
  let lessons = [...new Set(words.map(w=>w.lesson))];
  lessons.forEach(lesson=>{
    const div = document.createElement('div');
    div.className="lesson";
    const header = document.createElement('div');
    header.className="lessonHeader";
    header.textContent = lesson + " ▼";
    let visible = true;
    header.onclick=()=>{ visible=!visible; wordList.style.display=visible?'block':'none'; };
    div.appendChild(header);

    const wordList = document.createElement('div');
    words.filter(w=>w.lesson===lesson).forEach(w=>{
      const wdiv = document.createElement('div');
      wdiv.className="word";
      wdiv.textContent=`${w.kr} - ${w.en} [${w.categories.join(", ")}]`;
      wordList.appendChild(wdiv);
    });
    div.appendChild(wordList);
    container.appendChild(div);
  });

  // Populate lesson selectors
  const lessonSelects = [document.getElementById('lessonSelect'), document.getElementById('quizLessonSelect')];
  lessonSelects.forEach(sel=>{
    sel.innerHTML='<option value="All">All Lessons</option>';
    lessons.forEach(l=>{ sel.innerHTML+=`<option value="${l}">${l}</option>` });
  });

  // Listening word selection
  const listeningDiv = document.getElementById('listeningWords');
  listeningDiv.innerHTML="";
  words.forEach((w,i)=>{
    const cb = document.createElement('input');
    cb.type="checkbox"; cb.checked=true; cb.id="lw"+i;
    const lbl = document.createElement('label'); lbl.htmlFor="lw"+i; lbl.textContent=`${w.kr} - ${w.en}`;
    listeningDiv.appendChild(cb); listeningDiv.appendChild(lbl); listeningDiv.appendChild(document.createElement('br'));
  });
}
renderLessons();

// ======== Add Word ========
document.getElementById('addWordBtn').onclick=()=>{
  const kr=document.getElementById('krInput').value.trim();
  const en=document.getElementById('enInput').value.trim();
  const cats=document.getElementById('categoryInput').value.split(",").map(c=>c.trim()).filter(c=>c);
  if(!kr||!en){ alert("Enter Korean and English"); return; }
  let lesson="Lesson 1";
  words.push({lesson, kr, en, categories:cats});
  localStorage.setItem('words', JSON.stringify(words));
  renderLessons();
  document.getElementById('krInput').value="";
  document.getElementById('enInput').value="";
  document.getElementById('categoryInput').value="";
};

// ======== Flashcards ========
document.getElementById('startFlashBtn').onclick=()=>{
  const fa=document.getElementById('flashArea');
  const sel=document.getElementById('lessonSelect').value;
  let flashWords = sel==="All"?words:words.filter(w=>w.lesson===sel);
  if(!flashWords.length){fa.textContent="No words in this lesson."; return;}
  let i=0;
  function showCard(){
    if(i>=flashWords.length){fa.textContent="Done!"; return;}
    const w=flashWords[i];
    fa.innerHTML=`
      <div class="flashcard">
        <div id="flashFront">${w.kr}</div>
        <button onclick="document.getElementById('flashFront').textContent='${w.en}'">Flip</button>
        <button id="nextCardBtn">Next</button>
      </div>`;
    document.getElementById('nextCardBtn').onclick=()=>{ i++; showCard(); };
  }
  showCard();
};

// ======== Listening Mode ========
document.getElementById('playAllBtn').onclick=()=>{
  let delay=parseInt(document.getElementById('listenDelay').value)||1000;
  let index=0;
  let selected = [];
  words.forEach((w,i)=>{ if(document.getElementById('lw'+i).checked) selected.push(w); });
  function playNext(){
    if(index>=selected.length) return;
    let w=selected[index