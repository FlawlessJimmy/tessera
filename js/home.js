// 홈 아래쪽: 바뀌는 한 단어 · 고르는 순간 깔리는 자재 · 공간 모자이크 · 자재로 완성한 방
import { MATERIALS, ROOMS, BY_ID, texPath, won, roomTotal } from './data.js';
import { mountPick } from './pick.js?v=1';

const $ = (s) => document.querySelector(s);
const thumb = (id) => `background-image:url(${texPath(id, 'thumb')})`;
const top = (k) => MATERIALS.filter((m) => m.cat === k).sort((a, b) => a.rank - b.rank)[0];

// ---------- 한 단어만 바뀌는 큰 제목 ----------
const WORDS = [['마루', 'floor'], ['타일', 'tile'], ['벽지', 'wallpaper'], ['미장', 'paint'], ['대리석', 'stone'], ['템바보드', 'panel'], ['벽돌', 'brick']];
const loop = $('#kwLoop');
const icon = $('#kwIcon');
loop.innerHTML = WORDS.map(([w]) => `<span class="kw-word">${w}</span>`).join('');
icon.innerHTML = WORDS.map(([, k]) => `<i style="${thumb(top(k).id)}"></i>`).join('');
const words = [...loop.children], faces = [...icon.children];
let wi = 0;
gsap.set(words.slice(1), { yPercent: 100, opacity: 0 });
gsap.set(faces.slice(1), { rotationY: -90, opacity: 0 });
gsap.set(loop, { width: words[0].offsetWidth });
function nextWord() {
  const a = wi, b = (wi + 1) % WORDS.length;
  wi = b;
  gsap.timeline()
    .to(words[a], { yPercent: -100, opacity: 0, duration: 0.5, ease: 'power3.in' })
    .to(loop, { width: words[b].offsetWidth, duration: 0.55, ease: 'power3.inOut' }, 0.2)
    .fromTo(words[b], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.45)
    .to(faces[a], { rotationY: 90, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0)
    .fromTo(faces[b], { rotationY: -90, opacity: 0 }, { rotationY: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.45);
}
let kwTimer = null;
ScrollTrigger.create({
  trigger: '#kw', start: 'top bottom', end: 'bottom top',
  onToggle: (s) => { clearInterval(kwTimer); if (s.isActive) kwTimer = setInterval(nextWord, 2200); },
});
addEventListener('resize', () => gsap.set(loop, { width: words[wi].offsetWidth }));

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

// ---------- 자재로 완성한 방: 지그재그 카드 ----------
$('#lookList').innerHTML = ['kitchen', 'nordic', 'bath', 'atelier', 'powder'].map((id) => {
  const r = ROOMS.find((x) => x.id === id);
  const used = ['floor', 'back', 'left', 'counter'].filter((k) => r[k]).map((k) => BY_ID[r[k]]);
  return `<li><a class="q-card" href="rooms.html#${r.id}">
    <p class="q-line">${r.line}</p>
    <span class="q-meta">${r.ko} · 4m × 4m 자재비 약 ${won(Math.round(roomTotal(r) / 10000))}만원</span>
    <span class="q-sw">${used.map((m) => `<i style="${thumb(m.id)}" title="${m.ko}"></i>`).join('')}</span>
  </a></li>`;
}).join('');

// 카드가 차례로 떠오르기
gsap.utils.toArray('.q-card').forEach((el) => {
  gsap.from(el, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
});
gsap.from('.space-tile', { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '#spaceMosaic', start: 'top 80%' } });
