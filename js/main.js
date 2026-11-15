// 부드러운 스크롤 · 등장 모션 · 공통 동작
gsap.registerPlugin(ScrollTrigger);
const isHome = document.body.dataset.page === 'home';

// 휠을 한 칸 굴릴 때마다 끊어 움직이지 않고, 관성처럼 이어서 흐르게 합니다 (lerp 방식)
const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
window.lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

document.documentElement.classList.remove('is-loading');
if ('scrollRestoration' in history && isHome) { history.scrollRestoration = 'manual'; scrollTo(0, 0); }

// 홈: 짙은 바탕 구간에 들어가면 머리말도 어둡게
if (isHome && document.querySelector('.dark-flow')) {
  ScrollTrigger.create({
    trigger: '.dark-flow', start: 'top 64px', end: 'max', refreshPriority: -1,
    onToggle: (s) => document.querySelector('.nav').classList.toggle('is-dark', s.isActive),
  });
}

// ---------- 등장 모션 (가볍게) ----------
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
});

// 큰 푸터 글자: 스크롤에 따라 올라오기
if (document.querySelector('.foot-mark')) {
  gsap.from('.foot-mark', { yPercent: 45, ease: 'none', scrollTrigger: { refreshPriority: -1, trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
}

// ---------- 같은 페이지 안 링크 ----------
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) { e.preventDefault(); lenis.scrollTo(0); return; }
  const el = document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  lenis.scrollTo(el, { offset: -80, duration: 1.4 });
});

