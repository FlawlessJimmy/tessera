// 홈 아래쪽: 바뀌는 한 단어 · 고르는 순간 깔리는 자재 · 공간 모자이크 · 자재로 완성한 방
import { MATERIALS, ROOMS, texPath } from './data.js';
import { mountPick } from './pick.js?v=2';

const $ = (s) => document.querySelector(s);
const thumb = (id) => `background-image:url(${texPath(id, 'thumb')})`;

// ---------- 한 단어만 바뀌는 큰 제목 + 오른쪽 샘플 칩 묶음 ----------
// 샘플 타일이 한 줄로 서 있고, 지금 단어에 해당하는 한 장이 위로 쑥 올라옵니다.
const WORDS = [['마루', 'herringbone_parquet'], ['타일', 'zellige_green'], ['벽지', 'arch_terracotta'], ['미장', 'clay_plaster'], ['대리석', 'nero_marquina'], ['템바보드', 'oak_tambour'], ['벽돌', 'red_brick']];
const SAMPLES = WORDS.map(([, id]) => MATERIALS.find((m) => m.id === id));
const loop = $('#kwLoop');
const rack = $('#kwIcon');
loop.innerHTML = WORDS.map(([w]) => `<span class="kw-word">${w}</span>`).join('');
rack.innerHTML = `
  <div class="kr-stage">${SAMPLES.map((m, i) => `
    <a class="kr-card" href="material.html?id=${m.id}" style="--i:${i};--side:${m.side}" aria-label="${m.ko}">
      <span class="kr-lift"><span class="kr-back"></span><span class="kr-face" style="background-image:url(${texPath(m.id, 'diff')});background-size:${Math.round(Math.min(300, Math.max(110, (m.dim / 500) * 100)))}%"></span></span>
    </a>`).join('')}
  </div>
  <a class="kr-cap" href="material.html?id=${SAMPLES[0].id}"><b>${SAMPLES[0].ko}</b><span>${SAMPLES[0].en}</span></a>`;
const words = [...loop.children];
const lifts = [...rack.querySelectorAll('.kr-lift')];
const cap = rack.querySelector('.kr-cap');
let wi = 0;
const UP = () => -rack.querySelector('.kr-card').offsetHeight * 0.62;
gsap.set(words.slice(1), { yPercent: 100, opacity: 0 });
gsap.set(loop, { width: words[0].offsetWidth });
gsap.set(lifts[0], { y: UP(), rotation: -3 });
lifts[0].classList.add('is-up');
function setCap(m) {
  gsap.timeline()
    .to(cap.children, { yPercent: -100, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.04 })
    .add(() => { cap.href = `material.html?id=${m.id}`; cap.children[0].textContent = m.ko; cap.children[1].textContent = m.en; })
    .fromTo(cap.children, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05 });
}
function nextWord() {
  const a = wi, b = (wi + 1) % WORDS.length;
  wi = b;
  lifts[a].classList.remove('is-up');
  gsap.timeline()
    .to(words[a], { yPercent: -100, opacity: 0, duration: 0.5, ease: 'power3.in' })
    .to(loop, { width: words[b].offsetWidth, duration: 0.55, ease: 'power3.inOut' }, 0.2)
    .fromTo(words[b], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.45)
    // 내려가는 칩: 살짝 흔들리며 제자리로
    .to(lifts[a], { y: 0, rotation: 0, duration: 0.7, ease: 'power3.inOut' }, 0)
    // 올라오는 칩: 쑥 뽑혀 나오듯
    .to(lifts[b], { y: UP() * 1.08, rotation: -4, duration: 0.55, ease: 'power3.out' }, 0.3)
    .to(lifts[b], { y: UP(), rotation: -3, duration: 0.5, ease: 'power2.inOut', onStart: () => lifts[b].classList.add('is-up') }, 0.85);
  setCap(SAMPLES[b]);
}
let kwTimer = null;
ScrollTrigger.create({
  trigger: '#kw', start: 'top bottom', end: 'bottom top',
  onToggle: (s) => { clearInterval(kwTimer); if (s.isActive) kwTimer = setInterval(nextWord, 2600); },
});
addEventListener('resize', () => { gsap.set(loop, { width: words[wi].offsetWidth }); gsap.set(lifts[wi], { y: UP() }); });

// ---------- 고르는 순간 깔리는 자재 ----------
mountPick({ stage: $('#pickStage'), list: $('#pickList') });

// ---------- 공간으로 찾기: 그 공간 방 모형을 그림처럼 ----------
const SPACE_ROOM = { 거실: 'nordic', 침실: 'japandi', 주방: 'kitchen', 욕실: 'bath', 현관: 'loft' };
$('#spaceMosaic').innerHTML = Object.entries(SPACE_ROOM).map(([s, rid], i) => {
  const r = ROOMS.find((x) => x.id === rid);
  const n = MATERIALS.filter((m) => m.spaces.includes(s)).length;
  return `<a class="space-tile${i === 0 ? ' is-big' : ''}" href="materials.html?space=${encodeURIComponent(s)}">
    <span class="look-viz" aria-hidden="true">
      <i class="lv-back" style="${thumb(r.back)}"></i>
      <i class="lv-left" style="${thumb(r.left)}"></i>
      <i class="lv-floor" style="${thumb(r.floor)}"></i>
      ${r.counter ? `<i class="lv-counter" style="${thumb(r.counter)}"></i>` : ''}
    </span>
    <span class="space-label"><b>${s}</b><span>자재 ${n}가지</span></span>
  </a>`;
}).join('');

gsap.from('.space-tile', { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '#spaceMosaic', start: 'top 80%' } });
