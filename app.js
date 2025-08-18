let words = JSON.parse(localStorage.getItem('words')||'[]');
let listening=false; let listenTimer=null;

function save(){
  localStorage.setItem('words',JSON.stringify(words));
  renderLessons();
}
function renderLessons(){
  const container=document.getElementById('lessonsContainer'); container.innerHTML='';
  const lessons={};
  for(let i=0;i<words.length;i++){
    const w=words[i];
    if(!lessons[w.lesson])lessons[w.lesson]=[];
    lessons[w.lesson].push({...w,index:i});
  }
  for(const lesson in lessons){
    const details=document.createElement('details');
    const summary=document.createElement('summary'); summary.textContent=lesson; 
    details.appendChild(summary);
    lessons[lesson].forEach(w=>{
      const div=document.createElement('div');
      const cb=document.createElement('input');cb.type='checkbox';
      cb.checked=w.selected||false;
      cb.onchange=()=>{words[w.index].selected=cb.checked;save();};
      div.appendChild(cb);
      div.appendChild(document.createTextNode(` ${w.kr} - ${w.en}`));
      details.appendChild(div);
    });
    container.appendChild(details);
  }
}

document.getElementById('wordForm').onsubmit=e=>{
  e.preventDefault();
  const lesson=document.getElementById('lessonInput').value.trim();
  const kr=document.getElementById('krInput').value.trim();
  const en=document.getElementById('enInput').value.trim();
  words.push({lesson,kr,en});
  save(); e.target.reset();
};

function speak(txt,lang){
  const u=new SpeechSynthesisUtterance(txt);
  u.lang=lang;
  speechSynthesis.speak(u);
}

document.getElementById('listenStartBtn').onclick=()=>{
  if(listening)return;
  listening=true;
  let selected=words.filter(w=>w.selected);
  if(!selected.length)selected=words;
  const order=document.getElementById('listenOrder').value;
  if(order==='shuffle')selected=selected.sort(()=>Math.random()-0.5);
  let i=0;
  function step(){
    if(!listening)return;
    const delay=parseInt(document.getElementById('listenDelay').value)||1000;
    const front=document.getElementById('listenFront').value;
    const w=selected[i];
    if(front==='kr'){speak(w.kr,'ko-KR');setTimeout(()=>speak(w.en,'en-US'),delay);}
    else{speak(w.en,'en-US');setTimeout(()=>speak(w.kr,'ko-KR'),delay);}
    i++;
    if(i<selected.length)listenTimer=setTimeout(step,delay*2);
    else listening=false;
  }
  step();
};
document.getElementById('listenStopBtn').onclick=()=>{listening=false;if(listenTimer)clearTimeout(listenTimer);};

document.getElementById('startQuizBtn').onclick=()=>{
  const mode=document.getElementById('quizMode').value;
  const qa=document.getElementById('quizArea'); qa.innerHTML='';
  if(!words.length){qa.textContent='No words.';return;}
  const q=words[Math.floor(Math.random()*words.length)];
  if(mode==='typed'){
    qa.innerHTML=`<div>${q.kr} → <input id='ans'/> <button onclick='checkAns("${q.en}")'>Check</button></div>`;
  }else{
    const opts=[q.en];
    while(opts.length<(mode==='mc5'?5:10)){
      const r=words[Math.floor(Math.random()*words.length)].en;
      if(!opts.includes(r))opts.push(r);
    }
    opts.sort(()=>Math.random()-0.5);
    qa.innerHTML=`<div>${q.kr}</div>`+
      opts.map(o=>`<button onclick='alert(o==="${q.en}"?"Correct":"Wrong, answer: ${q.en}")'>${o}</button>`).join('');
  }
};
function checkAns(ans){
  const val=document.getElementById('ans').value.trim();
  alert(val.toLowerCase()==ans.toLowerCase()?'Correct':'Wrong. Answer: '+ans);
}
renderLessons();