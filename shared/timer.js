/* ClassSpark — Countdown Timer + Stopwatch (all logic runs in the visitor's browser) */
const $ = (s) => document.querySelector(s);

let prefs = { sound: true };
let AC = null;
function beep(freq, dur, type, gain, when) {
  if (!prefs.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC && AC.state === 'suspended') AC.resume();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    g.gain.value = gain || 0.06;
    const t = AC.currentTime + (when || 0);
    o.connect(g); g.connect(AC.destination);
    o.start(t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.stop(t + dur + 0.02);
  } catch (e) { /* audio blocked — silent */ }
}
function alarm() {
  beep(880, 0.22, 'square', 0.08, 0);
  beep(880, 0.22, 'square', 0.08, 0.35);
  beep(1760, 0.45, 'square', 0.08, 0.7);
}

/* ============ COUNTDOWN ============ */
let total = 600, left = 600, running = false, endAt = 0, loop = null;
const cdEl = $('#cd'), cdMsg = $('#cdMsg');
const fmt = (s) => {
  s = Math.max(0, Math.ceil(s));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};
function persist() {
  localStorage.setItem('cs_timer', JSON.stringify({ total, left: running ? (endAt - Date.now()) / 1000 : left, running }));
}
function renderCd() {
  cdEl.textContent = fmt(left);
  cdEl.classList.toggle('done', running === false && left === 0 && total > 0);
  document.title = running ? `${fmt(left)} ⏳ ClassSpark Timer` : 'ClassSpark Timer — countdown & stopwatch';
}
function stopLoop() { if (loop) { clearInterval(loop); loop = null; } }
function step() {
  if (running) {
    left = (endAt - Date.now()) / 1000;
    if (left <= 0) {
      left = 0;
      running = false;
      stopLoop();
      alarm();
      cdMsg.textContent = '⏰ Time\u2019s up!';
      renderCd();
      persist();
      $("#cdStart").textContent = 'Start';
      return;
    }
    renderCd();
    persist();
  }
}
function startCountdown() {
  if (left <= 0.05) return;
  if (AC && AC.state === 'suspended') AC.resume();
  running = true;
  endAt = Date.now() + left * 1000;
  cdMsg.textContent = '';
  $("#cdStart").textContent = 'Pause';
  renderCd();
  persist();
  if (!loop) loop = setInterval(step, 200);
}
function pauseCountdown() {
  running = false;
  left = Math.max(0, (endAt - Date.now()) / 1000);
  $("#cdStart").textContent = 'Start';
  renderCd();
  persist();
  stopLoop();
}
function resetCountdown() {
  running = false;
  left = total;
  cdMsg.textContent = '';
  $("#cdStart").textContent = 'Start';
  renderCd();
  persist();
  stopLoop();
}
function setTotalseconds(s) {
  s = Math.max(1, Math.min(359940, Math.round(s)));
  total = s;
  resetCountdown();
}
function wireCountdown() {
  const presets = [
    [1, '1 min'], [3, '3 min'], [5, '5 min'], [10, '10 min'],
    [15, '15 min'], [20, '20 min'], [25, '25 min'], [30, '30 min'],
  ];
  $('#presets').innerHTML = presets.map(([m, label]) => `<button class="btn ghost tiny" data-min="${m}">${label}</button>`).join('');
  $('#presets').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-min]');
    if (b) { setTotalseconds(Number(b.dataset.min) * 60); $('#mins').value = ''; }
  });
  $('#setMin').addEventListener('click', () => {
    const v = parseFloat($('#mins').value);
    if (!isNaN(v) && v > 0) setTotalseconds(v * 60);
  });
  $('#mins').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#setMin').click(); });
  $("#cdStart").addEventListener('click', () => (running ? pauseCountdown() : startCountdown()));
  $('#cdReset').addEventListener('click', resetCountdown);
  // restore previous state
  try {
    const st = JSON.parse(localStorage.getItem('cs_timer') || 'null');
    if (st) {
      total = st.total || 600;
      left = st.left || total;
      if (st.running && left > 0) { endAt = Date.now() + left * 1000; running = true; $("#cdStart").textContent = 'Pause'; }
    }
  } catch (e) {}
  left = Math.min(left, total);
  renderCd();
  if (running) loop = setInterval(step, 200);
}

/* ============ STOPWATCH ============ */
let sw = { running: false, startAt: 0, acc: 0, laps: [] };
const swEl = $('#sw');
const swFmt = (ms) => {
  const cs = Math.floor((ms % 1000) / 10);
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
};
const swTotal = () => sw.acc + (sw.running ? Date.now() - sw.startAt : 0);
function renderSw() {
  swEl.textContent = swTotal() >= 3600000
    ? `${Math.floor(swTotal() / 3600000)}:${swFmt(swTotal() % 3600000)}`
    : swFmt(swTotal());
}
function swRaf() {
  renderSw();
  if (sw.running) requestAnimationFrame(swRaf);
}
function wireStopwatch() {
  $('#swStart').addEventListener('click', () => {
    if (AC && AC.state === 'suspended') AC.resume();
    if (sw.running) {
      sw.acc += Date.now() - sw.startAt;
      sw.running = false;
      $('#swStart').textContent = 'Start';
      $('#swLap').disabled = true;
    } else {
      sw.startAt = Date.now();
      sw.running = true;
      $('#swStart').textContent = 'Stop';
      $('#swLap').disabled = false;
      requestAnimationFrame(swRaf);
    }
  });
  $('#swReset').addEventListener('click', () => {
    sw = { running: false, startAt: 0, acc: 0, laps: [] };
    $('#swStart').textContent = 'Start';
    $('#swLap').disabled = true;
    $('#swLaps').innerHTML = '';
    renderSw();
  });
  $('#swLap').addEventListener('click', () => {
    const now = swTotal();
    const prev = sw.laps.length ? sw.laps[0].total : 0;
    sw.laps.unshift({ total: now, delta: now - prev });
    $('#swLaps').innerHTML = sw.laps
      .map((l, i) => `<li><b>Lap ${sw.laps.length - i}</b><span>${swFmt(l.delta)}</span><span style="width:18px"></span><span>${swFmt(l.total)}</span></li>`)
      .join('');
  });
  renderSw();
}

/* ============ tabs + shared ============ */
function wireTabs() {
  const tabs = document.querySelectorAll('.tabs button');
  tabs.forEach((b) => b.addEventListener('click', () => {
    tabs.forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    const m = b.dataset.mode;
    $('#painCount').hidden = m !== 'count';
    $('#painStop').hidden = m !== 'stop';
  }));
}
function wireFullscreen() {
  $('#fsBtn').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
}
function wireSound() {
  $('#sound').checked = prefs.sound;
  $('#sound').addEventListener('change', () => {
    prefs.sound = $('#sound').checked;
    localStorage.setItem('cs_timer_prefs', JSON.stringify(prefs));
  });
}

/* init */
try { prefs = Object.assign(prefs, JSON.parse(localStorage.getItem('cs_timer_prefs') || '{}')); } catch (e) {}
wireTabs();
wireCountdown();
wireStopwatch();
wireFullscreen();
wireSound();
