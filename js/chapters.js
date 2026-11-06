// 카테고리별 가로 스크롤 화면
// 아래로 내리면 한 카테고리의 자재가 가로로 지나가고, 다음 카테고리로 넘어갑니다.
// 각 카테고리 첫 칸에는 그 자재다운 움직임(깔기 · 뒤집기 · 펼치기 · 바르기 · 자르기 · 세우기 · 쌓기)이 있습니다.
import { MATERIALS, CATS, texPath, won } from './data.js';

const T = (id) => texPath(id, 'thumb');
const D = (id) => texPath(id, 'diff');
const rand = (a, b) => a + Math.random() * (b - a);

// ---------- 카테고리마다 다른 첫 화면 그림 ----------
const VISUALS = {
  floor: () => `<div class="mv mv-floor">${Array.from({ length: 7 }, (_, i) =>
    `<i style="background-image:url(${D(['laminate_floor_02', 'herringbone_parquet', 'oak_wood_planks', 'wood_floor'][i % 4])});background-position:${rand(0, 100)}% ${i * 14}%"></i>`).join('')}</div>`,
  tile: () => {
    const ids = ['zellige_green', 'glaze_mustard', 'navy_long', 'pink_stack', 'white_wave', 'sage_pattern', 'terrazzo_white', 'ribbed_red', 'marble_beige'];
    return `<div class="mv mv-tile">${Array.from({ length: 16 }, (_, i) =>
      `<i><b style="background-image:url(${T(ids[(i * 5) % ids.length])})"></b></i>`).join('')}</div>`;
  },
  wallpaper: () => `<div class="mv mv-paper"><div class="paper" style="background-image:url(${D('arch_terracotta')})"></div><div class="roll"></div></div>`,
  paint: () => `<div class="mv mv-paint">
    <div class="base" style="background-image:url(${D('concrete_wall_008')})"></div>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><mask id="trowel">
      ${[18, 38, 58, 78, 96].map((y, i) => `<path d="M-10 ${y} C 20 ${y - 14}, 45 ${y + 12}, 70 ${y - 6} S 105 ${y + 6}, 112 ${y - 4}" stroke="#fff" stroke-width="21" fill="none" stroke-linecap="round" pathLength="1" style="--i:${i}"/>`).join('')}
    </mask></defs><image href="${D('clay_plaster')}" width="100" height="100" preserveAspectRatio="xMidYMid slice" mask="url(#trowel)"/></svg>
    <div class="trowel"></div></div>`,
  stone: () => `<div class="mv mv-stone"><div class="slab"><div class="half a" style="background-image:url(${D('calacatta')})"></div><div class="half b" style="background-image:url(${D('calacatta')})"></div></div></div>`,
  panel: () => `<div class="mv mv-panel">${Array.from({ length: 12 }, (_, i) =>
    `<i style="background-image:url(${D(i % 2 ? 'oak_tambour' : 'walnut_louver')});background-position:${i * 9}% 0"></i>`).join('')}</div>`,
  brick: () => {
    let html = '';
    for (let r = 0; r < 9; r++) {
      const n = r % 2 ? 4 : 5;
      for (let c = 0; c < n; c++) html += `<i style="--r:${r};left:${c * 25 - (r % 2 ? 0 : 12.5)}%;bottom:${r * 11.1}%;background-position:${rand(0, 100)}% ${rand(0, 100)}%;background-image:url(${D(['red_brick', 'whitewashed_brick', 'brick_wall_001'][(r + c) % 3 === 0 ? 1 : 0])})"></i>`;
    }
    return `<div class="mv mv-brick">${html}</div>`;
  },
};

// 첫 화면 그림이 스크롤에 맞춰 움직이는 방법
const MOTIONS = {
  floor: (v, tl) => tl.from(v.querySelectorAll('i'), { xPercent: 120, stagger: 0.08, ease: 'power3.out' }),
  tile: (v, tl) => tl.from(v.querySelectorAll('b'), { rotateY: -180, stagger: { each: 0.04, from: 'start', grid: [4, 4] }, ease: 'power2.inOut' }),
  wallpaper: (v, tl) => tl.fromTo(v.querySelector('.paper'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none' })
    .fromTo(v.querySelector('.roll'), { top: '0%' }, { top: '100%', ease: 'none' }, 0),
  paint: (v, tl) => {
    v.querySelectorAll('path').forEach((p, i) => { p.style.strokeDasharray = 1; tl.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none' }, i * 0.18); });
    tl.fromTo(v.querySelector('.trowel'), { left: '-20%', top: '10%' }, { left: '105%', top: '90%', ease: 'none', duration: tl.duration() }, 0);
  },
  stone: (v, tl) => tl.from(v.querySelector('.slab'), { yPercent: 40, rotateX: 55, opacity: 0, ease: 'power3.out' })
    .to(v.querySelector('.half.a'), { xPercent: -7, rotate: -2, ease: 'power2.inOut' }, '+=0.1')
    .to(v.querySelector('.half.b'), { xPercent: 7, rotate: 2, ease: 'power2.inOut' }, '<'),
  panel: (v, tl) => tl.from(v.querySelectorAll('i'), { yPercent: 105, stagger: 0.06, ease: 'power3.out' }),
  brick: (v, tl) => tl.from(v.querySelectorAll('i'), { y: -80, opacity: 0, stagger: 0.025, ease: 'bounce.out' }),
};

export function buildChapters(root, onPick) {
  const cats = Object.keys(CATS);
  root.innerHTML = cats.map((key) => {
    const c = CATS[key];
    const list = MATERIALS.filter((m) => m.cat === key);
    return `
    <section class="chapter" data-cat="${key}" id="ch-${key}">
      <div class="ch-pin">
        <div class="ch-track">
          <div class="ch-intro">
            <div class="ch-text">
              <span class="ch-no">${c.no} / ${String(cats.length).padStart(2, '0')}</span>
              <h2 class="ch-en">${c.en.replace(/ & /, ' <em>&amp;</em> ')}</h2>
              <p class="ch-ko"><b>${c.ko}</b>${c.line}</p>
              <span class="ch-count">${list.length} materials <i>→</i></span>
            </div>
            <div class="ch-visual">${VISUALS[key]()}</div>
          </div>
          ${list.map((m, i) => `
          <article class="m-card">
            <button data-id="${m.id}" aria-label="${m.ko} 자세히 보기">
              <span class="m-swatch"><i style="background-image:url(${T(m.id)})"></i><span class="m-open">자세히 보기 ↗</span></span>
              <span class="m-info">
                <span class="m-idx">${c.no}.${String(i + 1).padStart(2, '0')}</span>
                <b>${m.ko}</b>
                <em>${m.en}</em>
                <span class="m-spec">${m.spec}</span>
                <span class="m-price">㎡당 <strong>${won(m.price / m.unitArea)}</strong>원</span>
              </span>
            </button>
          </article>`).join('')}
          <div class="ch-end" aria-hidden="true"><span>${c.no}</span></div>
        </div>
      </div>
    </section>`;
  }).join('');

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-id]');
    if (b) onPick(b.dataset.id);
  });

  // ---------- 스크롤 연결 ----------
  const mm = gsap.matchMedia();
  root.querySelectorAll('.chapter').forEach((sec) => {
    const track = sec.querySelector('.ch-track');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);

    // 1) 카테고리가 화면에 들어오는 동안 첫 그림이 움직입니다
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top top', scrub: 0.6 } });
    MOTIONS[sec.dataset.cat](sec.querySelector('.mv'), tl);
    tl.from(sec.querySelectorAll('.ch-text > *'), { y: 40, opacity: 0, stagger: 0.08, ease: 'power3.out' }, 0);

    // 2) 화면에 고정된 채 가로로 지나갑니다
    const move = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });

    // 3) 카드 사진이 살짝 다른 속도로 흘러 깊이감을 만듭니다
    sec.querySelectorAll('.m-swatch i').forEach((i) => {
      gsap.fromTo(i, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: i.parentElement, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
    });
  });
  return mm;
}
