// 부드러운 스크롤 · (홈) 로딩 → 랜딩 · 등장 모션 · 공통 동작
gsap.registerPlugin(ScrollTrigger);
const isHome = !!document.getElementById('hero');

// 휠을 한 칸 굴릴 때마다 끊어 움직이지 않고, 관성처럼 이어서 흐르게 합니다 (lerp 방식)
const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
window.lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

if (isHome) {
  lenis.stop();
  scrollTo(0, 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // ---------- 로딩 → 랜딩 ----------
  // 큐브 로딩(js/loader.js)이 끝나면 window.tesseraReveal()을 불러 랜딩 글자를 올립니다.
  let revealed = false;
  window.__heroIntro = { v: 1 };
  window.tesseraReveal = function () {
    if (revealed) return;
    revealed = true;
    // 로딩이 화면 가득 채운 마루 면 그대로에서 시작해, 둥근 화면으로 줄어들며 제목이 올라옵니다.
    gsap.timeline({ onComplete: () => { document.documentElement.classList.remove('is-loading'); lenis.start(); ScrollTrigger.refresh(); } })
      .to(window.__heroIntro, { v: 0, duration: 1.6, ease: 'expo.inOut' }, 0.05)
      .from('.hero-title', { yPercent: 35, opacity: 0, duration: 1.2, ease: 'power4.out' }, 0.75)
      .from('.nav', { y: -20, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.8);
  };

  // 큐브 로딩은 처음 방문했을 때만. 같은 창에서 다시 오면 바로 엽니다.
  let seen = false;
  try { seen = sessionStorage.getItem('tessera-seen') === '1'; sessionStorage.setItem('tessera-seen', '1'); } catch (e) { /* 저장 불가 환경 */ }
  if (seen) {
    window.__skipLoader = true;
    document.querySelector('.loader')?.classList.add('is-skipped');
    requestAnimationFrame(() => window.tesseraReveal());
  }

  // 3D를 못 쓰는 환경이면 로딩을 걷고 바로 엽니다.
  const fallback = () => {
    const ld = document.querySelector('.loader');
    if (ld) gsap.to(ld, { opacity: 0, duration: 0.6, onComplete: () => ld.remove() });
    window.tesseraReveal();
  };
  setTimeout(() => { if (!window.__loaderAlive) fallback(); }, 5000);
  setTimeout(() => { if (!revealed) fallback(); }, 20000);

} else {
  document.documentElement.classList.remove('is-loading');
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

