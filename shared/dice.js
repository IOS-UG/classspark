/* ClassSpark — Dice Roller (all logic runs in the visitor's browser) */
const $ = (s) => document.querySelector(s);

const PIPS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

let prefs = { count: 2, sides: 6, sound: true };
let rolling = false;
let history = [];
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
  } catch (e) { /* silent */ }
}
const clack = () => beep(1400 + Math.random() * 600, 0.03, 'square', 0.03);
const fanfare = () => {
  beep(660, 0.1, 'triangle', 0.06);
  setTimeout(() => beep(990, 0.18, 'triangle', 0.06), 110);
};

/* ---------- rendering ---------- */
function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function faceHTML(val) {
  if (prefs.sides === 6) {
    const dots = (PIPS[val] || PIPS[1])
      .map(([x, y]) => `<span class="dot" style="left:${x}%;top:${y}%"></span>`)
      .join('');
    return `<div class="pips">${dots}</div>`;
  }
  return `<div class="num">${val}</div>`;
}
function renderDice(vals) {
  $('#diceRow').innerHTML = vals
    .map((v) => `<div class="die">${faceHTML(v)}</div>`)
    .join('');
}
function renderHistory() {
  $('#history').innerHTML = history.map((h) => `<span class="chip">${esc(h)}</span>`).join('');
  $('#clearHist').style.display = history.length ? 'inline-flex' : 'none';
}

/* ---------- roll ---------- */
function roll() {
  if (rolling) return;
  rolling = true;
  $('#rollBtn').disabled = true;
  const n = prefs.count;
  let iTime = 0;
  const iv = setInterval(() => {
    renderDice(Array.from({ length: n }, () => 1 + Math.floor(Math.random() * prefs.sides)));
    $('#diceRow').classList.add('rolling');
    clack();
    if (++iTime > 7) {
      clearInterval(iv);
      const vals = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * prefs.sides));
      renderDice(vals);
      $('#diceRow').classList.remove('rolling');
      const sum = vals.reduce((a, b) => a + b, 0);
      $('#total').textContent = String(sum);
      $('#totalLabel').textContent = `${n}d${prefs.sides} → total`;
      history.unshift(`${n}d${prefs.sides}: ${vals.join(' + ')} = ${sum}`);
      history = history.slice(0, 12);
      localStorage.setItem('cs_dice_hist', JSON.stringify(history));
      renderHistory();
      fanfare();
      rolling = false;
      $('#rollBtn').disabled = false;
    }
  }, 70);
}

/* ---------- wiring ---------- */
$('#rollBtn').addEventListener('click', roll);
$('#countIn').addEventListener('change', () => {
  prefs.count = Math.max(1, Math.min(6, Number($('#countIn').value) || 2));
  $('#countIn').value = prefs.count;
  savePrefs();
  renderDice(freshFaces());
  $('#total').textContent = '—';
});
$('#sidesSel').addEventListener('change', () => {
  prefs.sides = Number($('#sidesSel').value) || 6;
  savePrefs();
  renderDice(freshFaces());
  $('#total').textContent = '—';
});
$('#sound').checked = prefs.sound;
$('#sound').addEventListener('change', () => {
  prefs.sound = $('#sound').checked;
  savePrefs();
});
$('#clearHist').addEventListener('click', () => {
  history = [];
  localStorage.removeItem('cs_dice_hist');
  renderHistory();
});
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !/^(SELECT|INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
    e.preventDefault();
    roll();
  }
});
function savePrefs() { localStorage.setItem('cs_dice_prefs', JSON.stringify(prefs)); }
function freshFaces() {
  return Array.from({ length: prefs.count }, () => Math.floor(prefs.sides / 2) + 1);
}

/* ---------- init ---------- */
try { prefs = Object.assign(prefs, JSON.parse(localStorage.getItem('cs_dice_prefs') || '{}')); } catch (e) {}
$('#countIn').value = prefs.count;
$('#sidesSel').value = String(prefs.sides);
$('#sound').checked = prefs.sound;
history = JSON.parse(localStorage.getItem('cs_dice_hist') || '[]');
renderHistory();
renderDice(freshFaces());
