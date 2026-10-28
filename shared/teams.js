/* ClassSpark — Random Team Generator (all logic runs in the visitor's browser) */
const $ = (s) => document.querySelector(s);

const ta = $('#roster');

function readRoster() {
  const arr = [...new Set(ta.value.split('\n').map((s) => s.trim()).filter(Boolean))];
  return arr;
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 1600);
}

/* ----- teams ----- */
let currentTeams = null;

function teamCount() {
  const modeCount = $('#modeCount').checked;
  if (modeCount) return Math.max(2, Math.min(12, Number($('#teamN').value) || 2));
  const size = Math.max(2, Math.min(20, Number($('#sizeN').value) || 2));
  return Math.max(2, Math.min(12, Math.ceil(readRoster().length / size)));
}

function makeTeams() {
  const people = readRoster();
  $('#stats').textContent = people.length >= 2
    ? `${people.length} students` : '';
  if (people.length < 2) {
    $('#out').innerHTML = '<p class="hint" style="text-align:center">Add at least 2 students in the list above 👆</p>';
    currentTeams = null;
    return;
  }
  // shuffle (Fisher–Yates)
  const arr = people.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const T = teamCount();
  const teams = Array.from({ length: T }, () => []);
  arr.forEach((p, i) => teams[i % T].push(p)); // round-robin = balanced sizes
  currentTeams = teams;
  render(teams);
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function render(teams) {
  $('#out').innerHTML = teams
    .map((t, i) => `
      <div class="team t${(i % 12) + 1}">
        <h3>Team ${i + 1} <span>${t.length}</span></h3>
        ${t.map((p) => `<div class="m">${esc(p)}</div>`).join('')}
      </div>`)
    .join('');
  $('#outWrap').hidden = false;
  $('#copyBtn').disabled = false;
  $('#printBtn').disabled = false;
}

/* ----- copy + print ----- */
function copyOutput() {
  if (!currentTeams) return;
  const text = currentTeams.map((t, i) => `Team ${i + 1}: ${t.join(', ')}`).join('\n');
  const done = () => toast('Copied ✓');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallback());
  } else fallback();
  function fallback() {
    const t = document.createElement('textarea');
    t.value = text;
    document.body.appendChild(t);
    t.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    t.remove();
  }
}

/* ----- storage ----- */
function saveText() { localStorage.setItem('cs_roster_text', ta.value); }
function getLists() { try { return JSON.parse(localStorage.getItem('cs_roster_lists') || '{}'); } catch (e) { return {}; } }
function refreshListSelect() {
  const lists = getLists();
  $('#savedLists').innerHTML = '<option value="">— load saved class —</option>' +
    Object.keys(lists).sort().map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
}
function saveList() {
  const name = $('#listName').value.trim();
  const value = ta.value.trim();
  if (!name || !value) return;
  const lists = getLists();
  lists[name] = value;
  localStorage.setItem('cs_roster_lists', JSON.stringify(lists));
  $('#listName').value = '';
  refreshListSelect();
  $('#savedLists').value = name;
  toast(`Class "${name}" saved ✓`);
}
function deleteList() {
  const name = $('#savedLists').value;
  if (!name) return;
  if (!confirm(`Delete saved class "${name}"?`)) return;
  const lists = getLists();
  delete lists[name];
  localStorage.setItem('cs_roster_lists', JSON.stringify(lists));
  refreshListSelect();
}

/* ----- wiring ----- */
$('#makeBtn').addEventListener('click', makeTeams);
$('#copyBtn').addEventListener('click', copyOutput);
$('#printBtn').addEventListener('click', () => window.print());
$('#modeCount').addEventListener('change', () => { $('#fieldCount').hidden = false; $('#fieldSize').hidden = true; });
$('#modeSize').addEventListener('change', () => { $('#fieldCount').hidden = true; $('#fieldSize').hidden = false; });
$('#saveList').addEventListener('click', saveList);
$('#deleteList').addEventListener('click', deleteList);
$('#savedLists').addEventListener('change', (e) => {
  const lists = getLists();
  if (e.target.value && lists[e.target.value]) {
    ta.value = lists[e.target.value];
    saveText();
    makeTeams();
  }
});
ta.addEventListener('input', saveText);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !/^(TEXTAREA|INPUT|SELECT)$/.test(document.activeElement.tagName)) {
    e.preventDefault();
    makeTeams();
  }
});

/* init */
ta.value = localStorage.getItem('cs_roster_text') ||
  ['Ava', 'Ben', 'Carla', 'Devon', 'Elena', 'Frank', 'Grace', 'Hugo', 'Imani', 'Jonas', 'Kaya', 'Liam'].join('\n');
refreshListSelect();
$('#fieldSize').hidden = true;
makeTeams();
