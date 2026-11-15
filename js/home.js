// 홈 아래쪽: 바뀌는 한 단어 · 고르는 순간 깔리는 자재 · 공간 모자이크 · 자재로 완성한 방
import { MATERIALS, ROOMS, texPath } from './data.js';
import { mountPick } from './pick.js?v=4';

const $ = (s) => document.querySelector(s);
const thumb = (id) => `background-image:url(${texPath(id, 'thumb')})`;

// ---------- 한 단어만 바뀌는 큰 제목 + 오른쪽 샘플 칩 묶음 ----------
// 샘플 타일이 한 줄로 서 있고, 지금 단어에 해당하는 한 장이 위로 쑥 올라옵니다.
const WORDS = [['마루', 'herringbone_parquet'], ['타일', 'zellige_green'], ['벽지', 'arch_terracotta'], ['미장', 'clay_plaster'], ['대리석', 'nero_marquina'], ['템바보드', 'oak_tambour'], ['벽돌', 'red_brick']];
const SAMPLES = WORDS.map(([, id]) => MATERIALS.find((m) => m.id === id));
const loop = $('#kwLoop');
const rack = $('#kwIcon');
const T = (s) => (window.i18n ? window.i18n.t(s) : s); // 영어 화면이면 영어로
loop.innerHTML = WORDS.map(([w]) => `<span class="kw-word">${T(w)}</span>`).join('');
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

// ---------- 공간으로 찾기: 방 사진이 드럼처럼 말려 올라갑니다 ----------
// 가운데 사진은 정면, 위로 지나간 사진은 위쪽으로, 올라오는 사진은 아래쪽에서 휘어져 보입니다.
const SPACES_SHOW = [
  { s: '거실', room: 'nordic', line: '가장 오래 머무는 곳이라 바닥은 따뜻하게, 벽은 차분하게 고릅니다.' },
  { s: '침실', room: 'japandi', line: '빛을 낮추고 결을 살린 자재로 편히 쉬는 방을 만듭니다.' },
  { s: '주방', room: 'kitchen', line: '물과 열에 강한 타일과 상판으로 매일 쓰는 곳을 단단하게 채웁니다.' },
  { s: '욕실', room: 'bath', line: '젖어도 미끄럽지 않은 바닥과 유광 타일 벽으로 밝게 정리합니다.' },
  { s: '현관', room: 'loft', line: '집의 첫인상입니다. 벽돌과 미장으로 들어서는 순간의 분위기를 정합니다.' },
];
const drum = $('#spDrum');
drum.innerHTML = SPACES_SHOW.map((x) => `<a class="sp-card" href="materials.html?space=${encodeURIComponent(x.s)}" aria-label="${x.s} 자재 보기"><img src="assets/rooms/${x.room}.jpg" alt="" loading="lazy" decoding="async" /></a>`).join('');
const cards = [...drum.children];
const NS = SPACES_SHOW.length;
const spCount = (s) => MATERIALS.filter((m) => m.spaces.includes(s)).length;
// 글자는 스크롤 위치에 그대로 묶여, 지금 글자가 위로 올라가는 만큼 다음 글자가 아래에서 올라옵니다.
// (사라졌다 나타나는 빈 순간이 없도록 두 줄을 같은 칸에 겹쳐 둡니다.)
const spRows = ['spName', 'spRoom', 'spLine', 'spGoText'].map((id) => {
  const row = $('#' + id).parentElement;
  row.innerHTML = '<span class="sp-swap"></span><span class="sp-swap"></span>';
  return [...row.children];
});
const spText = (i) => {
  const x = SPACES_SHOW[i], r = ROOMS.find((y) => y.id === x.room);
  return [x.s, r.ko, x.line, `${x.s} 자재 ${spCount(x.s)}가지 보기`];
};
let spLo = -1, spNear = -1;
function spRender(pos) {
  const lo = Math.min(NS - 2, Math.max(0, Math.floor(pos)));
  const f = Math.min(1, Math.max(0, pos - lo));
  if (lo !== spLo) {
    spLo = lo;
    const A = spText(lo), B = spText(lo + 1);
    spRows.forEach(([a, b], k) => { a.textContent = A[k]; b.textContent = B[k]; });
  }
  spRows.forEach(([a, b], k) => {
    // 줄마다 조금씩 늦게 따라와 계단처럼 넘어갑니다.
    let t = Math.min(1, Math.max(0, (f - k * 0.06) / 0.82));
    t = t * t * (3 - 2 * t);
    a.style.transform = `translateY(${-t * 105}%)`;
    a.style.opacity = 1 - t * 0.6;
    b.style.transform = `translateY(${(1 - t) * 105}%)`;
    b.style.opacity = 0.4 + t * 0.6;
  });
  const near = Math.round(pos);
  if (near !== spNear) {
    spNear = near;
    $('#spIdx').textContent = String(near + 1).padStart(2, '0');
    $('#spGo').href = `materials.html?space=${encodeURIComponent(SPACES_SHOW[near].s)}`;
  }
}
spRender(0);

const spMobile = matchMedia('(max-width: 860px)');
let spTarget = 0, spPos = 0;
const spST = ScrollTrigger.create({
  trigger: '#spaces', start: 'top top', end: () => '+=' + innerHeight * 0.8 * (NS - 1), pin: true,
  onUpdate: (s) => { spTarget = s.progress * (NS - 1); },
});
// 멈추면 가까운 사진에 착 붙기
let spSnap = null;
window.lenis?.on('scroll', () => {
  clearTimeout(spSnap);
  const y = window.lenis.scroll;
  if (y <= spST.start + 2 || y >= spST.end - 2) return;
  spSnap = setTimeout(() => {
    const i = Math.round(spTarget);
    if (Math.abs(spTarget - i) > 0.01) window.lenis.scrollTo(spST.start + (i / (NS - 1)) * (spST.end - spST.start), { duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) });
  }, 200);
});
gsap.ticker.add(() => {
  spPos += (spTarget - spPos) * 0.08;
  if (Math.abs(spTarget - spPos) < 1e-4) spPos = spTarget;
  // 휴대폰에서는 글 아래에서 사진이 옆으로 넘어갑니다 (세로로 돌면 글을 가립니다)
  const side = spMobile.matches;
  const h = (side ? cards[0].offsetWidth : cards[0].offsetHeight) || 400;
  const R = h * 1.35;                  // 드럼 반지름
  const step = (h * (side ? 1.1 : 1.06)) / R; // 사진 한 장이 차지하는 각도
  cards.forEach((c, i) => {
    const th = (i - spPos) * step;
    const a = Math.abs(th);
    const vis = a > 1.75 ? 0 : 1 - Math.max(0, (a - 1.25) / 0.5);
    // 안쪽으로 오목한 드럼: 양 끝 사진이 화면 쪽으로 휘어져 다가옵니다
    const deg = (th * 180) / Math.PI, d = R * (1 - Math.cos(th)) * 0.5, m = R * Math.sin(th);
    // 위 · 아래로 갈수록 사진을 옆으로 넓혀, 휘어지며 좁아 보이지 않고 시원하게 펼쳐지도록
    const wide = 1 + Math.min(a, 1.2) * 0.32;
    c.style.transform = side ? `translate3d(${m}px, 0, ${d}px) rotateY(${-deg}deg) scaleY(${1 + Math.min(a, 1.2) * 0.12})` : `translate3d(0, ${m}px, ${d}px) rotateX(${deg}deg) scaleX(${wide})`;
    c.style.opacity = vis;
    c.style.zIndex = 100 - Math.round(a * 20);
    c.style.filter = `brightness(${1 - Math.min(a, 1.4) * 0.32})`;
    c.style.visibility = vis <= 0 ? 'hidden' : 'visible';
  });
  spRender(Math.max(0, Math.min(NS - 1, spPos)));
});

// 확인용: ?sp=1.5 → 공간 드럼 그 위치로, ?pick=stone → 자재 고르기 그 종류로
const dbg = new URLSearchParams(location.search);
if (dbg.has('sp')) setTimeout(() => {
  window.lenis?.scrollTo(spST.start + (+dbg.get('sp') / (NS - 1)) * (spST.end - spST.start), { immediate: true });
  setTimeout(() => { const r = document.getElementById('spaces').getBoundingClientRect(); document.title = JSON.stringify({ y: scrollY, st: [spST.start, spST.end], top: r.top, h: r.height, pos: spPos.toFixed(2), bg: getComputedStyle(document.body).backgroundColor }); }, 1200);
}, 600);
if (dbg.has('pick')) setTimeout(() => { window.lenis?.scrollTo('#pickStage', { immediate: true, offset: -90 }); document.querySelector(`.pk-item[data-cat="${dbg.get('pick')}"] .pk-cat`)?.click(); }, 600);
