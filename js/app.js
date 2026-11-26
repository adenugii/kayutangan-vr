// Logika UI: landing, HUD, menu, info/audio, kuis, mode tampilan.
let selectedMode = 'normal';
let tourActive = false;
let quizIdx = 0;
let correctCount = 0;
let audio = null;
let toastTimer = null;

const $ = (id) => document.getElementById(id);
const sceneEl = () => $('vr-scene');
const tm = () => sceneEl().components['tour-manager'];
const total = () => TOUR.locations.length;

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}

/* ---------- Mode & mulai/keluar ---------- */
function selectMode(mode) {
  selectedMode = mode;
  document.body.classList.toggle('mode-normal', mode === 'normal');
  $('btn-mode-normal').classList.toggle('active', mode === 'normal');
  $('btn-mode-vr').classList.toggle('active', mode === 'vr');
}

function setGaze(on) {
  const cursor = $('gaze-cursor');
  cursor.setAttribute('visible', on);
  cursor.setAttribute('raycaster', 'enabled', on);
}

function refreshHudVisibility() {
  // Overlay DOM tidak tampil di layar split Cardboard, jadi HUD hanya untuk mode biasa
  const inVr = sceneEl().is('vr-mode');
  $('hud').classList.toggle('hidden', !tourActive || inVr);
}

function startTour() {
  $('landing-screen').classList.add('hidden');
  tourActive = true;
  const scene = sceneEl();
  if (selectedMode === 'vr') {
    scene.setAttribute('vr-mode-ui', 'enabled: true');
    setGaze(true);
    if (scene.enterVR) scene.enterVR();
  } else {
    scene.setAttribute('vr-mode-ui', 'enabled: false');
    setGaze(false);
  }
  tm().go(0, 0);
  refreshHudVisibility();
}

function restartTour() {
  $('quiz-modal').classList.add('hidden');
  tourActive = true;
  tm().go(0, 0);
  refreshHudVisibility();
}

function exitTour() {
  stopAudio();
  tourActive = false;
  ['info-modal', 'quiz-modal', 'menu-modal', 'hud', 'loader'].forEach((id) => $(id).classList.add('hidden'));
  tm().hideVrInfo();
  $('landing-screen').classList.remove('hidden');
  const scene = sceneEl();
  if (scene.is('vr-mode') && scene.exitVR) scene.exitVR();
}

/* ---------- HUD ---------- */
function updateHud(locIdx, viewIdx) {
  const loc = TOUR.locations[locIdx];
  $('location-badge').textContent = `${loc.id}/${total()}: ${loc.name}`;
  const multi = loc.views.length > 1;
  $('view-badge').classList.toggle('hidden', !multi);
  $('btn-angle').classList.toggle('hidden', !multi);
  if (multi) $('view-badge').textContent = `Sudut ${viewIdx + 1}/${loc.views.length}`;
  $('btn-prev').disabled = locIdx === 0;
  $('btn-prev').style.opacity = locIdx === 0 ? 0.4 : 1;
  $('btn-next').innerHTML = locIdx === total() - 1 ? 'Selesai &amp; Kuis' : 'Berikutnya &rarr;';
  stopAudio();
}

/* ---------- Menu titik ---------- */
function openMenu() {
  const list = $('menu-list');
  list.innerHTML = '';
  TOUR.locations.forEach((loc, i) => {
    const b = document.createElement('button');
    b.className = 'menu-item' + (i === tm().locIdx ? ' current' : '');
    b.innerHTML = `${loc.id}. ${loc.name}` + (loc.views.length > 1 ? `<small>${loc.views.length} sudut pandang</small>` : '');
    b.onclick = () => { closeMenu(); tm().go(i, 0); };
    list.appendChild(b);
  });
  $('menu-modal').classList.remove('hidden');
}
function closeMenu() { $('menu-modal').classList.add('hidden'); }

/* ---------- Info & audio ---------- */
function openInfo() {
  const loc = tm().getLocation();
  if (sceneEl().is('vr-mode')) {
    tm().showVrInfo(loc);
    playAudio();
    return;
  }
  $('info-title').textContent = `${loc.id}. ${loc.name}`;
  $('info-desc').textContent = loc.desc;
  $('info-modal').classList.remove('hidden');
  updateAudioButton();
}
function closeInfo() { $('info-modal').classList.add('hidden'); stopAudio(); }

function updateAudioButton() {
  const playing = audio && !audio.paused;
  $('btn-audio').textContent = playing ? 'Hentikan Narasi' : 'Putar Narasi';
}
function playAudio() {
  const loc = tm().getLocation();
  if (!loc.audio) { toast('Audio narasi untuk titik ini belum tersedia.'); updateAudioButton(); return; }
  stopAudio();
  audio = new Audio(loc.audio);
  audio.onended = updateAudioButton;
  audio.play().catch(() => toast('Browser memblokir audio. Ketuk tombol Putar Narasi.'));
  updateAudioButton();
}
function toggleAudio() {
  if (audio && !audio.paused) stopAudio(); else playAudio();
  updateAudioButton();
}
function stopAudio() {
  if (audio) { audio.pause(); audio = null; }
  if ($('btn-audio')) updateAudioButton();
}

/* ---------- Kuis & skor (VR-09) ---------- */
function openQuiz() {
  stopAudio();
  const scene = sceneEl();
  if (scene.is('vr-mode') && scene.exitVR) scene.exitVR(); // kuis memakai overlay layar biasa
  tourActive = true;
  quizIdx = 0; correctCount = 0;
  $('quiz-container').classList.remove('hidden');
  $('score-container').classList.add('hidden');
  $('quiz-modal').classList.remove('hidden');
  $('hud').classList.add('hidden');
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const item = TOUR.quiz[quizIdx];
  $('quiz-progress').textContent = `Kuis Evaluasi (Soal ${quizIdx + 1}/${TOUR.quiz.length})`;
  $('quiz-question').textContent = item.q;
  const box = $('quiz-options');
  box.innerHTML = '';
  item.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.onclick = () => {
      if (box.dataset.locked) return;
      box.dataset.locked = '1';
      if (i === item.ans) correctCount++;
      // Umpan balik langsung benar/salah
      [...box.children].forEach((c, j) => {
        if (j === item.ans) c.classList.add('correct');
        else if (j === i) c.classList.add('wrong');
      });
      setTimeout(() => {
        delete box.dataset.locked;
        quizIdx++;
        if (quizIdx < TOUR.quiz.length) renderQuizQuestion(); else showFinalScore();
      }, 900);
    };
    box.appendChild(btn);
  });
}

function showFinalScore() {
  const pct = Math.round((correctCount / TOUR.quiz.length) * 100);
  const title = TOUR.titles.find((t) => pct >= t.min).label;
  $('quiz-container').classList.add('hidden');
  $('score-container').classList.remove('hidden');
  $('score-text').textContent = `Skor Anda: ${pct} / 100 (${correctCount}/${TOUR.quiz.length} benar)`;
  $('score-title').textContent = `Gelar: ${title}`;
}

/* ---------- Event dari A-Frame ---------- */
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('mode-normal'); // mode awal = layar biasa
  const scene = sceneEl();
  scene.addEventListener('tour-changed', (e) => updateHud(e.detail.locIdx, e.detail.viewIdx));
  scene.addEventListener('hotspot-open', openInfo);
  scene.addEventListener('tour-finish', openQuiz);
  scene.addEventListener('tour-exit', exitTour);
  scene.addEventListener('enter-vr', refreshHudVisibility);
  scene.addEventListener('exit-vr', refreshHudVisibility);
  // Tatap/ketuk panel info 3D untuk menutup
  $('vr-info-panel').addEventListener('click', () => { tm().hideVrInfo(); stopAudio(); });

  // Mode kalibrasi hotspot: buka index.html?debug=1 lalu klik pada panorama
  if (new URLSearchParams(location.search).has('debug')) {
    $('sky-bg').classList.add('clickable');
    $('sky-bg').addEventListener('click', (e) => {
      const p = e.detail && e.detail.intersection && e.detail.intersection.point;
      if (!p) return;
      const eye = new THREE.Vector3();
      sceneEl().camera.getWorldPosition(eye);
      const rel = new THREE.Vector3(p.x, p.y, p.z).sub(eye);
      const yaw = THREE.MathUtils.radToDeg(Math.atan2(rel.x, -rel.z)).toFixed(0);
      const pitch = THREE.MathUtils.radToDeg(Math.asin(rel.y / rel.length())).toFixed(0);
      console.log(`infoYaw: ${yaw}, infoPitch: ${pitch}`);
      toast(`infoYaw: ${yaw}, infoPitch: ${pitch}`);
    });
  }
});
