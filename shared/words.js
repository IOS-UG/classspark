/* ClassSpark — Word Counter (all logic runs in the visitor's browser) */
const $ = (s) => document.querySelector(s);
const ta = $('#text');

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'was', 'were', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'that', 'this', 'be', 'been', 'as', 'at', 'by', 'not', 'but', 'so', 'if', 'from', 'have', 'has', 'had', 'do', 'does', 'did', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function analyze() {
  const text = ta.value;
  const words = text.split(/\s+/).filter(Boolean);
  const chars = text.length;
  const charsNS = text.replace(/\s/g, '').length;
  const sentences = text.split(/[.!?…]+(?:\s|$)/).map((s) => s.trim()).filter(Boolean).length;
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).length;
  const mins = (wpm) => {
    const m = words.length / wpm;
    if (!words.length) return '0 s';
    if (m < 1) return `${Math.max(1, Math.round(m * 60))} s`;
    return `${Math.ceil(m)} min`;
  };
  $('#w').textContent = words.length;
  $('#c').textContent = chars;
  $('#cnsp').textContent = charsNS;
  $('#sent').textContent = sentences;
  $('#para').textContent = paragraphs;
  $('#rd').textContent = mins(200);
  $('#sp').textContent = mins(130);

  const freq = new Map();
  words.map((w) => w.toLowerCase().replace(/[^a-z0-9'-]/g, ''))
    .filter((w) => w.length > 2 && !STOP.has(w))
    .forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  $('#topWords').innerHTML = top.length
    ? top.map(([w, n]) => `<span class="chip">${esc(w)} ×${n}</span>`).join('')
    : '<small class="hint">—</small>';
  localStorage.setItem('cs_words_text', ta.value);
}

$('#copyBtn').addEventListener('click', () => {
  const stats = `Words: ${$('#w').textContent} · Characters: ${$('#c').textContent} (no spaces: ${$('#cnsp').textContent}) · Sentences: ${$('#sent').textContent} · Paragraphs: ${$('#para').textContent} · Reading time: ${$('#rd').textContent} · Speaking time: ${$('#sp').textContent}`;
  const done = () => toast('Stats copied ✓');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(stats).then(done, done);
  } else { toast('Copy unavailable — select text instead'); }
});
$('#clearBtn').addEventListener('click', () => { ta.value = ''; analyze(); });

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 1600);
}

ta.addEventListener('input', analyze);
ta.value = localStorage.getItem('cs_words_text') || '';
analyze();
