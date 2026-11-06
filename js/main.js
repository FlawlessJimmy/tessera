// 부드러운 스크롤 · 로딩 화면 · 등장 모션
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
window.lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();
scrollTo(0, 0);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// ---------- 로딩: 실제 자재 타일이 진행률만큼 한 장씩 깔립니다 ----------
const LD = [
  ['herringbone_parquet', 'Herringbone Oak'], ['zellige_green', 'Zellige Green'], ['calacatta', 'Calacatta White'],
  ['navy_long', 'Navy Long Subway'], ['oak_tambour', 'Oak Tambour'], ['terrazzo_white', 'Terrazzo Bianco'],
  ['glaze_mustard', 'Mustard Glaze'], ['clay_plaster', 'Clay Plaster'], ['sage_pattern', 'Sage Arch'],
  ['red_brick', 'Classic Red'], ['nero_marquina', 'Nero Marquina'], ['pink_stack', 'Rose Stack'],
  ['laminate_floor_02', 'Natural Oak'], ['arch_terracotta', 'Terracotta Arch'], ['travertine', 'Travertine'],
  ['white_wave', 'White Wave'], ['walnut_louver', 'Walnut Louver'], ['ribbed_red', 'Terracotta Ribbed'],
];
const ldGrid = document.querySelector('.ld-grid');
// 깔리는 순서는 대각선 물결
const order = LD.map((_, i) => i).sort((a, b) => ((a % 6) + Math.floor(a / 6)) - ((b % 6) + Math.floor(b / 6)) || a - b);
ldGrid.innerHTML = LD.map(([id]) => `<i style="background-image:url(assets/tex/${id}/thumb.jpg?v=2)"></i>`).join('');
const tilesEl = [...ldGrid.children];
const num = document.querySelector('.ld-num');
const nameBox = document.querySelector('.ld-name');
const bar = document.querySelector('.ld-bar i');
let shown = 0, target = 0, done = false, laid = 0;
addEventListener('tessera:progress', (e) => { target = Math.max(target, e.detail * 0.96); });
addEventListener('tessera:ready', () => { target = 1; });
function setName(t) {
  const b = document.createElement('b'); b.textContent = t;
  nameBox.appendChild(b);
  gsap.fromTo(b, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
  const old = nameBox.firstElementChild;
  if (old !== b) gsap.to(old, { yPercent: -100, duration: 0.5, ease: 'power3.out', onComplete: () => old.remove() });
}
(function count() {
  shown += (target - shown) * 0.08;
  if (target === 1 && shown > 0.996) shown = 1;
  num.textContent = Math.round(shown * 100);
  bar.style.transform = `scaleX(${shown})`;
  const n = Math.floor(shown * LD.length);
  while (laid < n) {
    const idx = order[laid];
    tilesEl[idx].classList.add('on');
    setName(LD[idx][1]);
    laid++;
  }
  if (shown >= 1 && !done) { done = true; setTimeout(finish, 350); return; }
  requestAnimationFrame(count);
})();
// 네트워크가 느려도 8초 뒤에는 열어 줍니다.
setTimeout(() => { target = 1; }, 8000);

function finish() {
  const tl = gsap.timeline({ onComplete: () => { document.documentElement.classList.remove('is-loading'); lenis.start(); ScrollTrigger.refresh(); } });
  tl.to(tilesEl, { rotateX: 90, opacity: 0, duration: 0.55, ease: 'power3.in', stagger: { each: 0.025, from: 'center', grid: [3, 6] } })
    .to('.ld-num, .ld-pct', { yPercent: -110, duration: 0.6, ease: 'power3.in' }, 0.1)
    .to('.ld-top, .ld-now, .ld-bar', { opacity: 0, duration: 0.4 }, 0.1)
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut' }, '-=0.15')
    .from('.hero-title', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'power4.out' }, '-=0.5')
    .from('.hero-intro .eyebrow, .hero-sub, .hero-scroll', { y: 16, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, '-=0.8')
    .from('.nav', { y: -20, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.9');
}

// ---------- 등장 모션 ----------
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
});

// 큰 푸터 글자: 스크롤에 따라 올라오기
gsap.from('.foot-mark', { yPercent: 45, ease: 'none', scrollTrigger: { refreshPriority: -1, trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

// ---------- 내부 링크 ----------
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) { e.preventDefault(); lenis.scrollTo(0); return; }
  const el = document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  lenis.scrollTo(el, { offset: -20, duration: 1.6 });
});

// 히어로를 지나면 내비게이션을 밝은 배경용으로 바꿉니다.
ScrollTrigger.create({
  trigger: '#materials', start: 'top 72px', endTrigger: '.footer', end: 'top 60px', refreshPriority: -1,
  onToggle: (s) => document.querySelector('.nav').classList.toggle('is-light', s.isActive),
});
