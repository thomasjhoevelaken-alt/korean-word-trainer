// Full app logic skeleton

let db;
let currentEditId = null;

// Open IndexedDB
let request = indexedDB.open("KoreanWordTrainerDB", 1);
request.onupgradeneeded = function(e){
    db = e.target.result;
    let store = db.createObjectStore("words", {keyPath:"id", autoIncrement:true});
};
request.onsuccess = function(e){ db = e.target.result; loadWords(); };

function addOrEditWord(){
    let k = document.getElementById('koreanWord').value.trim();
    let e = document.getElementById('englishWord').value.trim();
    let cats = document.getElementById('categoriesInput').value.split(',').map(s=>s.trim()).filter(s=>s);
    if(!k||!e){alert('Enter both words'); return;}
    let tx = db.transaction("words","readwrite");
    let store = tx.objectStore("words");
    if(currentEditId){
        store.put({id:currentEditId,korean:k,english:e,categories:cats,audioK:null,audioE:null,enabled:true,correct:0,total:0});
        currentEditId=null;
    } else {
        store.add({korean:k,english:e,categories:cats,audioK:null,audioE:null,enabled:true,correct:0,total:0});
    }
    tx.oncomplete=()=>{renderList(); document.getElementById('koreanWord').value=''; document.getElementById('englishWord').value=''; document.getElementById('categoriesInput').value='';};
}

function loadWords(){ renderList(); }

function renderList(){
    let container=document.getElementById('wordList');
    container.innerHTML='';
    let search=document.getElementById('searchInput').value.toLowerCase();
    let tx=db.transaction("words","readonly").objectStore("words");
    tx.openCursor().onsuccess=function(e){
        let cursor=e.target.result;
        if(cursor){
            let w=cursor.value;
            if(w.korean.toLowerCase().includes(search) || w.english.toLowerCase().includes(search)){
                let div=document.createElement('div');
                div.className='word-item';
                div.innerHTML=`<input type="checkbox" ${w.enabled?'checked':''} onchange="toggleWord(${w.id})"> ${w.korean} - ${w.english} [${w.categories.join(',')}] 
                <button onclick="editWord(${w.id})">Edit</button> <button onclick="deleteWord(${w.id})">Delete</button>
                <button onclick="recordAudio(${w.id},'kr')">🎤K</button> <button onclick="recordAudio(${w.id},'en')">🎤E</button>`;
                container.appendChild(div);
            }
            cursor.continue();
        }
    };
}

function toggleWord(id){
    let tx=db.transaction("words","readwrite");
    let store=tx.objectStore("words");
    store.get(id).onsuccess=function(e){
        let w=e.target.result;
        w.enabled=!w.enabled;
        store.put(w);
    };
}

function editWord(id){
    let tx=db.transaction("words","readonly");
    let store=tx.objectStore("words");
    store.get(id).onsuccess=function(e){
        let w=e.target.result;
        document.getElementById('koreanWord').value=w.korean;
        document.getElementById('englishWord').value=w.english;
        document.getElementById('categoriesInput').value=w.categories.join(', ');
        currentEditId=w.id;
    };
}

function deleteWord(id){
    let tx=db.transaction("words","readwrite");
    tx.objectStore("words").delete(id).oncomplete=()=>{renderList();};
}

// Placeholder audio recording function
function recordAudio(id,lang){alert('Record '+lang+' audio for word id '+id);}

// Placeholder play functions
function playAll(){alert('Play all words placeholder');}
function playRandom(){alert('Play random word placeholder');}

// Placeholder quiz functions
function startQuiz(mode){alert('Start '+mode+' quiz placeholder');}
