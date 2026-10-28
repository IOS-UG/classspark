/* ClassSpark — Wheel Spinner (all logic runs in the visitor's browser) */
const $ = (s) => document.querySelector(s);

const PALETTE = ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e','#10b981','#14b8a6','#3b82f6','#6366f1','#8b5cf6','#ec4899','#0891b2'];
const cvs = $('#wheel');
const ctx = cvs.getContext('2d');
const R = 250, C = 270; // logical canvas coords (540px box, drawn at 2x for sharpness)
const A0 = -90;         // start angle: top
let names = [];
let rotation = 0;
let spinning = false;
let prefs = { autoRemove: true, sound: true };

const ta = $('#names');
const NORM = (a) => ((a % 360) + 360) % 360;

/* ---------- audio (WebAudio, no files) ---------- */
let AC = null;
function beep(freq, dur, type, gain) {
  if (!prefs.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    g.gain.value = gain || 0.05;
    o.connect(g); g.connect(AC.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
    o.stop(AC.currentTime + dur);
  } catch (e) { /* audio blocked — silent mode */ }
}
const tickSound = () => beep(1900, 0.025, 'square', 0.028);
const fanfare = () => {
  beep(660, 0.12, 'triangle', 0.07);
  setTimeout(() => beep(880, 0.16, 'triangle', 0.07), 130);
  setTimeout(() => beep(1320, 0.28, 'triangle', 0.06), 290);
};

/* ---------- wheel drawing ---------- */
function readNames() {
  const arr = ta.value.split('\n').map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : ['Player 1', 'Player 2'];
}
function draw() {
  const n = names.length;
  const seg = (Math.PI * 2) / n;
  const segDeg = 360 / n;
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, 540, 540);
  for (let i = 0; i < n; i++) {
    const a0 = (A0 * Math.PI / 180) + i * seg;
    const a1 = a0 + seg;
    ctx.beginPath();
    ctx.moveTo(C, C);
    ctx.arc(C, C, R, a0, a1);
    ctx.closePath();
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    // label
    let label = names[i];
    if (label.length > 18) label = label.slice(0, 17) + '…';
    let fs = Math.min(32, segDeg * 1.15, 1500 / Math.max(label.length, 3));
    fs = Math.max(11, fs);
    ctx.save();
    ctx.translate(C, C);
    ctx.rotate(a0 + seg / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${fs}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(label, R - 14, 0);
    ctx.restore();
  }
  cvs.style.transform = `rotate(${rotation}deg)`;
}

/* ---------- spin ---------- */
function spin() {
  if (spinning) return;
  names = readNames();
  if (names.length < 2) return;
  spinning = true;
  ta.disabled = true;
  $("#spinBtn").disabled = true;
  const n = names.length;
  const segDeg = 360 / n;
  const chosen = Math.floor(Math.random() * n);
  const segCenter = A0 + (chosen + 0.5) * segDeg;
  const delta = NORM(270 - segCenter - rotation);
  const jitter = (Math.random() - 0.5) * Math.min(20, segDeg * 0.6);
  const target = rotation + 5 * 360 + delta + jitter;
  const start = rotation;
  const t0 = performance.now();
  const dur = 4200 + Math.random() * 900;
  const ease = (t) => 1 - Math.pow(1 - t, 4);
  let prevK = Math.floor(NORM(270 - rotation) / segDeg);
  (function frame(now) {
    const t = Math.min(1, (now - t0) / dur);
    rotation = start + (target - start) * ease(t);
    draw();
    const k = Math.floor(NORM(270 - rotation) / segDeg);
    if (k !== prevK) { tickSound(); prevK = k; }
    if (t < 1) requestAnimationFrame(frame);
    else finish(chosen);
  })(t0);
}

function finish(chosen) {
  spinning = false;
  ta.disabled = false;
  $("#spinBtn").disabled = false;
  const winner = names[chosen];
  fanfare();
  pushHistory(winner);
  if (prefs.autoRemove) {
    removeWinnerFromList(winner);
  }
  showResult(winner);
}

function removeWinnerFromList(name) {
  const lines = ta.value.split('\n').map((s) => s.trim()).filter(Boolean);
  const idx = lines.indexOf(name);
  if (idx > -1) lines.splice(idx, 1);
  if (lines.length === 1) lines.push('Player 1'); // keep the wheel usable
  ta.value = lines.join('\n');
  names = readNames();
  saveText();
  draw();
}

/* ---------- result modal ---------- */
function showResult(winner) {
  $('#winnerName').textContent = winner;
  $('#modalRemove').style.display = prefs.autoRemove ? 'none' : 'inline-flex';
  $('#modal').hidden = false;
}
function closeModal(respin) {
  $('#modal').hidden = true;
  if (respin) spin();
}

/* ---------- history ---------- */
let history = [];
function pushHistory(name) {
  history.unshift(name);
  history = history.slice(0, 15);
  localStorage.setItem('cs_wheel_hist', JSON.stringify(history));
  renderHistory();
}
function renderHistory() {
  $('#history').innerHTML = history.map((h) => `<span class="chip">${esc(h)}</span>`).join('');
  $('#clearHist').style.display = history.length ? 'inline-flex' : 'none';
}
function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- storage ---------- */
function saveText() { localStorage.setItem('cs_wheel_text', ta.value); }
function loadPrefs() {
  try { prefs = Object.assign(prefs, JSON.parse(localStorage.getItem('cs_wheel_prefs') || '{}')); } catch (e) {}
  $('#autoRemove').checked = prefs.autoRemove;
  $('#sound').checked = prefs.sound;
}
function savePrefs() {
  prefs.autoRemove = $('#autoRemove').checked;
  prefs.sound = $('#sound').checked;
  localStorage.setItem('cs_wheel_prefs', JSON.stringify(prefs));
}

/* ----- named list slots ----- */
function getLists() { try { return JSON.parse(localStorage.getItem('cs_wheel_lists') || '{}'); } catch (e) { return {}; } }
function refreshListSelect() {
  const lists = getLists();
  const sel = $('#savedLists');
  sel.innerHTML = '<option value="">— load saved list —</option>' +
    Object.keys(lists).sort().map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
}
function saveList() {
  const name = $('#listName').value.trim();
  if (!name || !ta.value.trim()) return;
  const lists = getLists();
  lists[name] = ta.value;
  localStorage.setItem('cs_wheel_lists', JSON.stringify(lists));
  $('#listName').value = '';
  refreshListSelect();
  const sel = $('#savedLists');
  sel.value = name;
  alert(`List "${name}" saved in this browser.`);
}
function loadList(name) {
  if (!name) return;
  const lists = getLists();
  if (lists[name]) {
    ta.value = lists[name];
    names = readNames();
    saveText();
    draw();
  }
}
function deleteList() {
  const sel = $('#savedLists');
  const name = sel.value;
  if (!name) return;
  if (!confirm(`Delete saved list "${name}"?`)) return;
  const lists = getLists();
  delete lists[name];
  localStorage.setItem('cs_wheel_lists', JSON.stringify(lists));
  refreshListSelect();
}

/* ---------- wiring ---------- */
$("#spinBtn").addEventListener('click', spin);
$("#capSpin").addEventListener('click', spin);
$('#modalResp').addEventListener('click', () => closeModal(true));
$('#modalClose').addEventListener('click', () => closeModal(false));
$('#modalRemove').addEventListener('click', () => {
  const winner = $('#winnerName').textContent;
  removeWinnerFromList(winner);
  $('#modal').hidden = true;
});
$('#shuffleBtn').addEventListener('click', () => {
  if (spinning) return;
  const lines = ta.value.split('\n').map((s) => s.trim()).filter(Boolean);
  for (let i = lines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lines[i], lines[j]] = [lines[j], lines[i]];
  }
  ta.value = lines.join('\n');
  names = readNames();
  saveText();
  draw();
});
$('#autoRemove').addEventListener('change', savePrefs);
$('#sound').addEventListener('change', savePrefs);
$('#saveList').addEventListener('click', saveList);
$('#deleteList').addEventListener('click', deleteList);
$('#savedLists').addEventListener('change', (e) => loadList(e.target.value));
$('#clearHist').addEventListener('click', () => { history = []; localStorage.removeItem('cs_wheel_hist'); renderHistory(); });
ta.addEventListener('input', () => {
  if (spinning) return;
  names = readNames();
  saveText();
  draw();
});
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !/^(TEXTAREA|INPUT|SELECT)$/.test(document.activeElement.tagName) && $('#modal').hidden) {
    e.preventDefault();
    spin();
  }
  if (e.key === 'Enter' && !$('#modal').hidden) closeModal(true);
});

/* ---------- init ---------- */
loadPrefs();
ta.value = localStorage.getItem('cs_wheel_text') ||
  ['Ava', 'Ben', 'Carla', 'Devon', 'Elena', 'Frank', 'Grace', 'Hugo', 'Imani', 'Jonas', 'Kaya', 'Liam'].join('\n');
history = JSON.parse(localStorage.getItem('cs_wheel_hist') || '[]');
renderHistory();
refreshListSelect();
names = readNames();
draw();
