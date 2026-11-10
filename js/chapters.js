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

// 카테고리마다 스크롤하는 방식 자체를 다르게 둡니다.
//  마루: 가로로 지나가는 레일 · 타일: 속도가 다른 세로 기둥 · 벽지: 한 장씩 덮이는 전체 화면
//  도장: 왼쪽 견본이 바뀌는 좌우 분할 · 석재: 3D 회전 진열대 · 패널: 펼쳐지는 아코디언 · 벽돌: 거대한 글자 띠
const LAYOUT = { floor: 'rail', tile: 'columns', wallpaper: 'stack', paint: 'split', stone: 'carousel', panel: 'accordion', brick: 'marquee' };

export function buildChapters(root, onPick) {
  const cats = Object.keys(CATS);
  const total = String(cats.length).padStart(2, '0');
  const head = (c, list, extra = '') => `
    <div class="ch-text ${extra}">
      <span class="ch-no">${c.no} / ${total}</span>
      <h2 class="ch-en">${c.en.replace(/ & /, ' <em>&amp;</em> ')}</h2>
      <p class="ch-ko"><b>${c.ko}</b>${c.line}</p>
      <span class="ch-count">${list.length} materials</span>
    </div>`;
  const price = (m) => `㎡당 <strong>${won(m.price / m.unitArea)}</strong>원`;
  const card = (m, c, i) => `
    <article class="m-card">
      <button data-id="${m.id}" aria-label="${m.ko} 자세히 보기">
        <span class="m-swatch"><i style="background-image:url(${T(m.id)})"></i><span class="m-open">자세히 보기 ↗</span></span>
        <span class="m-info">
          <span class="m-idx">${c.no}.${String(i + 1).padStart(2, '0')}</span>
          <b>${m.ko}</b><em>${m.en}</em>
          <span class="m-spec">${m.spec}</span>
          <span class="m-price">${price(m)}</span>
        </span>
      </button>
    </article>`;

  const BUILD = {
    // 01 마루: 가로 레일 (첫 칸에 판재가 깔리는 그림)
    rail: (c, list, key) => `
      <div class="ch-pin"><div class="ch-track">
        <div class="ch-intro">${head(c, list)}<div class="ch-visual">${VISUALS[key]()}</div></div>
        ${list.map((m, i) => card(m, c, i)).join('')}
        <div class="ch-end" aria-hidden="true"><span>${c.no}</span></div>
      </div></div>`,
    // 02 타일: 제목은 왼쪽에 붙어 있고, 오른쪽 세 기둥이 서로 다른 속도로 흐름
    columns: (c, list, key) => {
      const cols = [[], [], []];
      list.forEach((m, i) => cols[i % 3].push(card(m, c, i)));
      return `<div class="cl-wrap">
        <div class="cl-side">${head(c, list)}<div class="ch-visual sm">${VISUALS[key]()}</div></div>
        <div class="cl-cols">${cols.map((col, k) => `<div class="cl-col" data-k="${k}">${col.join('')}</div>`).join('')}</div>
      </div>`;
    },
    // 03 벽지: 한 장이 화면 전체를 덮고, 다음 장이 아래에서 롤처럼 올라와 덮음
    stack: (c, list) => `
      <div class="st-pin">
        ${list.map((m, i) => `
        <div class="st-layer" style="--bg:url(${D(m.id)}); --sz:${Math.round(m.dim / 4)}px">
          <div class="st-roll"></div>
          ${i === 0 ? head(c, list, 'st-head') : ''}
          <button class="st-tag" data-id="${m.id}">
            <span class="m-idx">${c.no}.${String(i + 1).padStart(2, '0')}</span>
            <b>${m.ko}</b><em>${m.en}</em>
            <span class="m-spec">${m.spec} · ${price(m)}</span>
            <span class="st-open">자세히 보기 ↗</span>
          </button>
        </div>`).join('')}
      </div>`,
    // 04 도장 · 미장: 왼쪽 큰 견본이 고정, 오른쪽 설명을 내릴 때마다 흙손 자국처럼 바뀜
    split: (c, list) => `
      <div class="sp-wrap">
        <div class="sp-left"><div class="sp-frame">
          ${list.map((m, i) => `<i class="sp-img" data-i="${i}" style="background-image:url(${D(m.id)})"></i>`).join('')}
          <span class="sp-caption"></span>
        </div></div>
        <div class="sp-right">
          ${head(c, list, 'sp-head')}
          ${list.map((m, i) => `
          <button class="sp-item" data-id="${m.id}" data-i="${i}">
            <span class="m-idx">${c.no}.${String(i + 1).padStart(2, '0')}</span>
            <b>${m.ko}</b><em>${m.en}</em>
            <span class="sp-note">${m.note}</span>
            <span class="m-spec">${m.spec} · ${price(m)}</span>
            <span class="st-open">자세히 보기 ↗</span>
          </button>`).join('')}
        </div>
      </div>`,
    // 05 석재: 돌판 네 장이 원형 진열대에 서서 스크롤에 따라 돎
    carousel: (c, list) => `
      <div class="ca-pin">
        ${head(c, list, 'ca-head')}
        <div class="ca-stage"><div class="ca-ring">
          ${list.map((m, i) => `
          <button class="ca-slab" data-id="${m.id}" style="--i:${i}; --n:${list.length}; background-image:url(${D(m.id)})" aria-label="${m.ko}"><span class="ca-edge" style="background:${m.side}"></span></button>`).join('')}
        </div></div>
        <div class="ca-info">${list.map((m, i) => `
          <div class="ca-name" data-i="${i}"><span class="m-idx">${c.no}.${String(i + 1).padStart(2, '0')}</span><b>${m.ko}</b><em>${m.en}</em><span class="m-spec">${m.spec} · ${price(m)}</span></div>`).join('')}
        </div>
      </div>`,
    // 06 우드 패널: 세 장이 나란히 서 있다가 차례로 넓게 펼쳐짐
    accordion: (c, list) => `
      <div class="ac-pin">
        ${head(c, list, 'ac-head')}
        <div class="ac-row">
          ${list.map((m, i) => `
          <button class="ac-panel" data-id="${m.id}" style="background-image:url(${D(m.id)})">
            <span class="ac-label"><span class="m-idx">${c.no}.${String(i + 1).padStart(2, '0')}</span><b>${m.ko}</b><em>${m.en}</em><span class="m-spec">${m.spec} · ${price(m)}</span><span class="st-open">자세히 보기 ↗</span></span>
            <span class="ac-vert">${m.en}</span>
          </button>`).join('')}
        </div>
      </div>`,
    // 07 벽돌: 벽돌로 채운 거대한 글자가 스크롤 방향으로 흐르고, 카드가 한 장씩 쌓이듯 올라옴
    marquee: (c, list) => `
      <div class="mq-wrap">
        ${head(c, list, 'mq-head')}
        <div class="mq-band" aria-hidden="true">
          <div class="mq-line" style="--bg:url(${D('red_brick')})">${'BRICK · 벽돌 · '.repeat(6)}</div>
          <div class="mq-line rev" style="--bg:url(${D('whitewashed_brick')})">${'MASONRY · 쌓기 · '.repeat(6)}</div>
        </div>
        <div class="mq-cards">${list.map((m, i) => card(m, c, i)).join('')}</div>
      </div>`,
  };

  root.innerHTML = cats.map((key) => {
    const c = CATS[key];
    const list = MATERIALS.filter((m) => m.cat === key);
    return `<section class="chapter ly-${LAYOUT[key]}" data-cat="${key}" id="ch-${key}">${BUILD[LAYOUT[key]](c, list, key)}</section>`;
  }).join('');

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-id]');
    if (b) onPick(b.dataset.id);
  });

  // ---------- 스크롤 연결 ----------
  const intro = (sec) => gsap.from(sec.querySelectorAll('.ch-text > *'), {
    y: 40, opacity: 0, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: sec, start: 'top 80%', end: 'top 25%', scrub: true },
  });

  const RUN = {
    rail(sec) {
      const track = sec.querySelector('.ch-track');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top top', scrub: true } });
      MOTIONS[sec.dataset.cat](sec.querySelector('.mv'), tl);
      intro(sec);
      const move = gsap.to(track, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1 } });
      sec.querySelectorAll('.m-swatch i').forEach((i) => {
        gsap.fromTo(i, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: i.parentElement, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
      });
    },
    columns(sec) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 10%', scrub: true } });
      MOTIONS[sec.dataset.cat](sec.querySelector('.mv'), tl);
      intro(sec);
      // 가운데 기둥은 거꾸로, 양쪽은 서로 다른 속도로
      const speed = [-90, 140, -190];
      sec.querySelectorAll('.cl-col').forEach((col, k) => {
        gsap.fromTo(col, { y: -speed[k] / 2 }, { y: speed[k], ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    },
    stack(sec) {
      const layers = [...sec.querySelectorAll('.st-layer')];
      intro(sec);
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + innerHeight * (layers.length - 0.4), pin: true, scrub: true, anticipatePin: 1 } });
      layers.forEach((l, i) => {
        if (i === 0) return;
        tl.fromTo(l, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none', duration: 1 }, i - 1)
          .fromTo(l.querySelector('.st-roll'), { top: '100%' }, { top: '0%', ease: 'none', duration: 1 }, i - 1)
          .fromTo(l.querySelector('.st-tag'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, i - 0.35)
          .fromTo(layers[i - 1], { scale: 1, filter: 'brightness(1)' }, { scale: 0.94, filter: 'brightness(0.72)', duration: 1, ease: 'none', immediateRender: false }, i - 1);
      });
      tl.to({}, { duration: 0.4 });
    },
    split(sec) {
      intro(sec);
      const imgs = [...sec.querySelectorAll('.sp-img')];
      const cap = sec.querySelector('.sp-caption');
      const items = [...sec.querySelectorAll('.sp-item')];
      let cur = -1;
      const show = (i) => {
        if (i === cur) return;
        const prev = cur; cur = i;
        imgs.forEach((im, k) => { im.style.zIndex = k === i ? 2 : k === prev ? 1 : 0; });
        // 흙손이 지나가듯 대각선으로 쓸며 바뀜
        gsap.fromTo(imgs[i], { clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)' }, { clipPath: 'polygon(0 0, 140% 0, 0 140%, 0 0)', duration: 0.9, ease: 'power3.inOut',
          onComplete: () => gsap.set(imgs[i], { clipPath: 'none' }) });
        gsap.fromTo(imgs[i], { scale: 1.12 }, { scale: 1, duration: 1.4, ease: 'power3.out' });
        cap.textContent = items[i].querySelector('em').textContent;
        items.forEach((it, k) => it.classList.toggle('is-on', k === i));
      };
      show(0);
      items.forEach((it, i) => ScrollTrigger.create({ trigger: it, start: 'top 60%', end: 'bottom 60%', onToggle: (s) => s.isActive && show(i) }));
    },
    carousel(sec) {
      const ring = sec.querySelector('.ca-ring');
      const names = [...sec.querySelectorAll('.ca-name')];
      const n = names.length;
      intro(sec);
      const STEP = 32; // 돌판 사이 각도
      const st = { r: 0 };
      gsap.to(st, {
        r: (n - 1) * STEP, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + innerHeight * n * 0.75, pin: true, scrub: true, anticipatePin: 1 },
        onUpdate: () => {
          ring.style.transform = `translateZ(calc(var(--R) * -1)) rotateY(${-st.r}deg)`;
          const i = Math.min(n - 1, Math.round(st.r / STEP));
          names.forEach((el, k) => el.classList.toggle('is-on', k === i));
        },
      });
      names[0].classList.add('is-on');
      ring.style.transform = 'translateZ(calc(var(--R) * -1)) rotateY(0deg)';
    },
    accordion(sec) {
      const panels = [...sec.querySelectorAll('.ac-panel')];
      intro(sec);
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + innerHeight * panels.length * 0.7, pin: true, scrub: true, anticipatePin: 1 } });
      gsap.set(panels, { flexGrow: 1 });
      panels.forEach((p, i) => {
        tl.to(panels, { flexGrow: (k) => (k === i ? 5 : 1), duration: 1, ease: 'power2.inOut' }, i)
          .to(p.querySelector('.ac-label'), { opacity: 1, y: 0, duration: 0.4 }, i + 0.5)
          .to(p.querySelector('.ac-vert'), { opacity: 0, duration: 0.3 }, i + 0.2);
        if (i > 0) tl.to(panels[i - 1].querySelector('.ac-label'), { opacity: 0, y: 20, duration: 0.3 }, i)
          .to(panels[i - 1].querySelector('.ac-vert'), { opacity: 1, duration: 0.3 }, i + 0.4);
      });
      tl.to({}, { duration: 0.6 });
    },
    marquee(sec) {
      intro(sec);
      const lines = sec.querySelectorAll('.mq-line');
      gsap.fromTo(lines[0], { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo(lines[1], { xPercent: -30 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
      // 카드가 위에서 떨어져 한 장씩 쌓이듯
      gsap.from(sec.querySelectorAll('.mq-cards .m-card'), {
        y: -160, rotate: (i) => [-6, 4, -3][i % 3], opacity: 0, stagger: 0.15, ease: 'bounce.out',
        scrollTrigger: { trigger: sec.querySelector('.mq-cards'), start: 'top 90%', end: 'top 35%', scrub: true },
      });
    },
  };
  root.querySelectorAll('.chapter').forEach((sec) => RUN[LAYOUT[sec.dataset.cat]](sec));
}
