/* ClassSpark — Seating Chart Maker (all logic runs in the visitor's browser) */
const $ = (s) => document.querySelector(s);

const ta = $('#roster'), gridEl = $('#grid'), poolEl = $('#pool');

let rows = Number(localStorage.getItem('cs_seats_rows')) || 4;
let cols = Number(localStorage.getItem('cs_seats_cols')) || 6;
let seats = [];
try { seats = JSON.parse(localStorage.getItem('cs_seats_seats') || '[]') || []; } catch (e) { seats = []; }

function readRoster() {
  return [...new Set(ta.value.split('\n').map((s) => s.trim()).filter(Boolean))];
}
function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function sync() {
  seats = seats.slice(0, rows * cols);
  while (seats.length < rows * cols) seats.push(null);
}
/* The unassigned pool is always DERIVED = roster minus seated names.
   That makes every drag operation a pure seat mutation. */
function poolNames() {
  const seated = new Set(seats.filter(Boolean));
  return readRoster().filter((p) => !seated.has(p));
}

function saveAll() {
  localStorage.setItem('cs_seats_seats', JSON.stringify(seats));
  localStorage.setItem('cs_seats_rows', String(rows));
  localStorage.setItem('cs_seats_cols', String(cols));
}

/* ---------- rendering ---------- */
function render() {
  gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridEl.innerHTML = seats
    .map((v, i) => `<div class="seat ${v ? 'filled' : ''}" data-i="${i}" draggable="${v ? 'true' : 'false'}">${v ? esc(v) : ''}</div>`)
    .join('');
  const pool = poolNames();
  poolEl.innerHTML = pool.length
    ? pool.map((p, i) => `<div class="chip" draggable="true" data-pi="${i}">${esc(p)}</div>`).join('')
    : '<small class="hint">Everyone is seated ✓ — drag a name out of a seat to move them</small>';
  $('#stats').textContent = `${readRoster().length} students · ${rows}×${cols} grid · ${seats.filter(Boolean).length} seated`;
}

/* ---------- drag & drop ---------- */
function dndData(e) {
  try { return JSON.parse(e.dataTransfer.getData('text/plain')); } catch (err) { return null; }
}
document.addEventListener('dragstart', (e) => {
  const seat = e.target.closest('.seat.filled');
  const chip = e.target.closest('#pool .chip');
  let data = null;
  if (seat) data = { kind: 'cell', i: Number(seat.dataset.i), name: seats[Number(seat.dataset.i)] };
  if (chip) data = { kind: 'pool', name: chip.textContent };
  if (!data) return;
  e.dataTransfer.setData('text/plain', JSON.stringify(data));
  e.dataTransfer.effectAllowed = 'move';
});
$('#gridWrap').addEventListener('dragover', (e) => { e.preventDefault(); });
$('#pool').addEventListener('dragover', (e) => { e.preventDefault(); });

gridEl.addEventListener('drop', (e) => {
  e.preventDefault();
  const cell = e.target.closest('.seat');
  if (!cell) return;
  const b = Number(cell.dataset.i);
  const p = dndData(e);
  if (!p) return;
  if (p.kind === 'cell' && p.i !== b) {
    [seats[p.i], seats[b]] = [seats[b], seats[p.i]]; // swap the two students
  } else if (p.kind === 'pool') {
    seats[b] = p.name; // occupant (if any) falls back into the derived pool automatically
  }
  saveAll();
  render();
});
$('#pool').addEventListener('drop', (e) => {
  e.preventDefault();
  const p = dndData(e);
  if (!p || p.kind !== 'cell') return;
  seats[p.i] = null; // removing a student returns them to the pool
  saveAll();
  render();
});

/* ---------- actions ---------- */
function autoAssign() {
  const people = readRoster();
  if (people.length < 2) { toast('Add at least 2 students first'); return; }
  const arr = people.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  seats = Array(rows * cols).fill(null);
  for (let i = 0; i < Math.min(arr.length, seats.length); i++) seats[i] = arr[i];
  saveAll();
  render();
}
function clearSeats() {
  seats = seats.map(() => null);
  saveAll();
  render();
}
function resize() {
  rows = Math.max(2, Math.min(10, Number($('#rowsIn').value) || rows));
  cols = Math.max(2, Math.min(10, Number($('#colsIn').value) || cols));
  $('#rowsIn').value = rows;
  $('#colsIn').value = cols;
  sync();
  saveAll();
  render();
}
function copyLayout() {
  const lines = [];
  for (let r = 0; r < rows; r++) {
    lines.push(seats.slice(r * cols, (r + 1) * cols).map((x) => x || '—').join('  |  '));
  }
  const text = 'FRONT OF CLASS\n' + lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast('Layout copied ✓'), () => toast('Copy blocked — use Print instead'));
  } else toast('Copy unavailable — use Print instead');
}
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 1600);
}

/* ---------- wiring ---------- */
$('#autoBtn').addEventListener('click', autoAssign);
$('#clearBtn').addEventListener('click', clearSeats);
$('#copyBtn').addEventListener('click', copyLayout);
$('#printBtn').addEventListener('click', () => window.print());
$('#rowsIn').addEventListener('change', resize);
$('#colsIn').addEventListener('change', resize);
ta.addEventListener('input', () => { localStorage.setItem('cs_seats_roster', ta.value); render(); });

/* ---------- saved classes ---------- */
function getLists() { try { return JSON.parse(localStorage.getItem('cs_seats_lists') || '{}'); } catch (e) { return {}; } }
function refreshListSelect() {
  const lists = getLists();
  $('#savedLists').innerHTML = '<option value="">— load saved class —</option>' +
    Object.keys(lists).sort().map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
}
$('#saveList').addEventListener('click', () => {
  const name = $('#listName').value.trim();
  if (!name || !ta.value.trim()) return;
  const lists = getLists();
  lists[name] = ta.value;
  localStorage.setItem('cs_seats_lists', JSON.stringify(lists));
  $('#listName').value = '';
  refreshListSelect();
  $('#savedLists').value = name;
  toast(`Class "${name}" saved ✓`);
});
$('#deleteList').addEventListener('click', () => {
  const name = $('#savedLists').value;
  if (!name) return;
  if (!confirm(`Delete saved class "${name}"?`)) return;
  const lists = getLists();
  delete lists[name];
  localStorage.setItem('cs_seats_lists', JSON.stringify(lists));
  refreshListSelect();
});
$('#savedLists').addEventListener('change', (e) => {
  const lists = getLists();
  if (e.target.value && lists[e.target.value]) {
    ta.value = lists[e.target.value];
    localStorage.setItem('cs_seats_roster', ta.value);
    sync();
    render();
  }
});

/* ---------- init ---------- */
ta.value = localStorage.getItem('cs_seats_roster') ||
  ['Ava', 'Ben', 'Carla', 'Devon', 'Elena', 'Frank', 'Grace', 'Hugo', 'Imani', 'Jonas', 'Kaya', 'Liam'].join('\n');
$('#rowsIn').value = rows;
$('#colsIn').value = cols;
sync();
refreshListSelect();
render();
