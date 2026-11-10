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

// ---------- 로딩 → 랜딩 ----------
// 큐브 로딩(js/loader.js)이 끝나면 window.tesseraReveal()을 불러 랜딩 글자를 올립니다.
let revealed = false;
window.tesseraReveal = function () {
  if (revealed) return;
  revealed = true;
  gsap.timeline({ onComplete: () => { document.documentElement.classList.remove('is-loading'); lenis.start(); ScrollTrigger.refresh(); } })
    .from('.hero-title', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'power4.out' }, 0.1)
    .from('.hero-intro .eyebrow, .hero-sub, .hero-scroll', { y: 16, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.35)
    .from('.nav, .hero-dots', { y: -20, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.3);
};
// 3D를 못 쓰는 환경이면 로딩을 걷고 바로 엽니다.
function fallback() {
  const ld = document.querySelector('.loader');
  if (ld) gsap.to(ld, { opacity: 0, duration: 0.6, onComplete: () => ld.remove() });
  window.tesseraReveal();
}
setTimeout(() => { if (!window.__loaderAlive) fallback(); }, 5000);
setTimeout(() => { if (!revealed) fallback(); }, 20000);

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
