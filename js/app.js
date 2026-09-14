// ---- Config ----
const JSON_FILE_PATH = 'data/questions.json';
const ADDED_KEY = 'qa_added_questions';   // legacy — no longer written to, kept for backward compatibility
const DELETED_KEY = 'qa_deleted_ids';     // ids (from questions.json) the user removed via the frontend

// ---- State ----
let baseQuestions = [];    // loaded from questions.json (read-only from the frontend)
let addedQuestions = [];   // loaded from localStorage (legacy, will be empty on fresh browsers)
let deletedIds = [];       // ids from questions.json that the user hid
let questions = [];        // combined, rendered list
let activeQuestion = null;

// ---- Load ----
async function loadData(){
  try{
    const res = await fetch(JSON_FILE_PATH);
    baseQuestions = await res.json();
  }catch(e){
    console.error('Could not load data/questions.json — make sure you are running this via a local server, not double-clicking the file.', e);
    baseQuestions = [];
  }

  addedQuestions = JSON.parse(localStorage.getItem(ADDED_KEY) || '[]');
  deletedIds = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');

  rebuildCombined();
  render();
}

function rebuildCombined(){
  questions = baseQuestions
    .filter(q => !deletedIds.includes(q.id))
    .concat(addedQuestions);
}

function persistAdded(){
  localStorage.setItem(ADDED_KEY, JSON.stringify(addedQuestions));
}

function persistDeleted(){
  localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
}

// ---- Render ----
function render(filterText){
  const container = document.getElementById('tabsContainer');
  const emptyState = document.getElementById('emptyState');
  container.innerHTML = '';

  const filter = (filterText || '').trim().toLowerCase();
  let visibleCount = 0;

  questions.forEach((q) => {
    const matches = !filter ||
      (q.question || '').toLowerCase().includes(filter) ||
      (q.answer || '').toLowerCase().includes(filter) ||
      (q.company || '').toLowerCase().includes(filter) ||
      (q.role || '').toLowerCase().includes(filter);

    if(matches) visibleCount++;

    const metaParts = [q.company, q.role].filter(Boolean);
    const metaHtml = metaParts.map(escapeHtml).join('<span class="dot-sep">·</span>');

    const tab = document.createElement('button');
    tab.className = 'tab' + (matches ? '' : ' hidden');
    tab.innerHTML = `<span class="tab-question">${escapeHtml(q.question)}</span>` +
      (metaHtml ? `<span class="tab-meta">${metaHtml}</span>` : '');
    tab.addEventListener('click', () => openAnswer(q));
    container.appendChild(tab);
  });

  emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
  document.getElementById('countLabel').textContent = `${questions.length} question${questions.length === 1 ? '' : 's'}`;
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ---- Answer modal ----
function openAnswer(q){
  activeQuestion = q;
  const tag = [q.company, q.role].filter(Boolean).join(' · ') || 'General';
  document.getElementById('answerCompany').textContent = tag;
  document.getElementById('answerQuestion').textContent = q.question;
  document.getElementById('answerText').textContent = q.answer;
  document.getElementById('answerOverlay').classList.add('open');
}

function closeAnswer(){
  document.getElementById('answerOverlay').classList.remove('open');
  activeQuestion = null;
}

document.getElementById('closeAnswerModal').addEventListener('click', closeAnswer);
document.getElementById('answerOverlay').addEventListener('click', (e) => {
  if(e.target.id === 'answerOverlay') closeAnswer();
});

// ---- Delete ----
document.getElementById('deleteBtn').addEventListener('click', () => {
  if(!activeQuestion) return;

  const wasAdded = addedQuestions.some(q => q.id === activeQuestion.id);
  if(wasAdded){
    addedQuestions = addedQuestions.filter(q => q.id !== activeQuestion.id);
    persistAdded();
  }else{
    deletedIds.push(activeQuestion.id);
    persistDeleted();
  }

  rebuildCombined();
  closeAnswer();
  render(document.getElementById('searchInput').value);
});

// ---- Search ----
document.getElementById('searchInput').addEventListener('input', (e) => {
  render(e.target.value);
});

// ---- Contribute modal (static instructions, no form) ----
document.getElementById('openAddBtn').addEventListener('click', () => {
  document.getElementById('addOverlay').classList.add('open');
});
document.getElementById('closeAddModal').addEventListener('click', () => {
  document.getElementById('addOverlay').classList.remove('open');
});
document.getElementById('addOverlay').addEventListener('click', (e) => {
  if(e.target.id === 'addOverlay') document.getElementById('addOverlay').classList.remove('open');
});

// ---- Escape key closes any open modal ----
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    closeAnswer();
    document.getElementById('addOverlay').classList.remove('open');
  }
});

loadData();
