// 고르는 순간 깔리는 자재: 왼쪽 무대에서 시공 장면 · 오른쪽 목록에서 종류와 자재 고르기
// 벽돌은 쌓이고, 벽지는 위에서 펼쳐진 뒤 솔로 쓱싹 밀리고, 타일은 한 장씩 붙고, 마루는 한 줄씩 깔립니다.
import { MATERIALS, CATS, texPath, won } from './data.js';

const ORDER = ['brick', 'wallpaper', 'tile', 'floor', 'paint', 'stone', 'panel'];
const byCat = (k) => MATERIALS.filter((m) => m.cat === k).sort((a, b) => a.rank - b.rank);
// 종류를 고르면 먼저 보여 줄 자재 (장면에서 결이 잘 보이는 것)
const SHOW = { brick: 'red_brick', wallpaper: 'arch_terracotta', tile: 'zellige_green', floor: 'herringbone_parquet', paint: 'clay_plaster', stone: 'calacatta', panel: 'walnut_louver' };
const showOf = (k) => MATERIALS.find((m) => m.id === SHOW[k]) || byCat(k)[0];
const img = (id) => `url(${texPath(id, 'diff')})`;
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- 텍스처에서 벽돌 색 뽑기 (벽돌은 한 장씩 따로 그려야 해서) ----------
const palettes = {};
function brickPalette(id) {
  if (palettes[id]) return palettes[id];
  return (palettes[id] = new Promise((res) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 96;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(im, 0, 0, 96, 96);
      const d = g.getImageData(0, 0, 96, 96).data;
      const pts = [];
      for (let y = 0; y < 96; y += 3) for (let x = 0; x < 96; x += 3) {
        const i = (y * 96 + x) * 4;
        pts.push([d[i], d[i + 1], d[i + 2]]);
      }
      // 색 두 묶음으로 나누기: 많은 쪽이 벽돌, 적은 쪽이 줄눈
      const lum = (p) => p[0] * 0.3 + p[1] * 0.59 + p[2] * 0.11;
      pts.sort((a, b) => lum(a) - lum(b));
      let A = pts[Math.floor(pts.length * 0.15)], B = pts[Math.floor(pts.length * 0.85)];
      let ga = [], gb = [];
      for (let it = 0; it < 6; it++) {
        ga = []; gb = [];
        pts.forEach((p) => {
          const da = (p[0] - A[0]) ** 2 + (p[1] - A[1]) ** 2 + (p[2] - A[2]) ** 2;
          const db = (p[0] - B[0]) ** 2 + (p[1] - B[1]) ** 2 + (p[2] - B[2]) ** 2;
          (da < db ? ga : gb).push(p);
        });
        const avg = (arr) => [0, 1, 2].map((k) => arr.reduce((s, p) => s + p[k], 0) / Math.max(1, arr.length));
        A = avg(ga); B = avg(gb);
      }
      // 채도가 높은 쪽이 벽돌, 둘 다 낮으면(흰 벽돌) 많은 쪽이 벽돌
      const sat = (p) => (Math.max(...p) - Math.min(...p)) / (Math.max(...p) + 1);
      const aIsBrick = sat(A) < 0.2 && sat(B) < 0.2 ? ga.length > gb.length : sat(A) > sat(B);
      const brick = aIsBrick ? ga : gb, mean = aIsBrick ? A : B;
      const mortar = aIsBrick ? B : A;
      // 한 장 한 장 색은 조금씩 다르되, 너무 튀지 않게 평균 쪽으로 당기고 채도를 살짝 올립니다.
      const pick = () => {
        const s = brick[Math.floor(Math.random() * brick.length)];
        const q = s.map((v, k) => v * 0.55 + mean[k] * 0.45);
        const g = lum(q);
        return q.map((v) => Math.max(0, Math.min(255, g + (v - g) * 1.2)));
      };
      const css = (p) => `rgb(${p.map((v) => Math.round(v)).join(',')})`;
      res({ bricks: Array.from({ length: 24 }, () => css(pick())), mortar: css(mortar) });
    };
    im.onerror = () => res({ bricks: ['#a5543a', '#9a4b33', '#b0614a'], mortar: '#8f8a83' });
    im.src = texPath(id, 'thumb');
  }));
}

// 이미지 먼저 받아 두기 (장면이 시작될 때 빈 칸이 보이지 않게)
const loaded = {};
const preload = (id) => (loaded[id] ||= new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = texPath(id, 'diff'); }));

// 흙손을 쥔 주황 장갑 (200 × 150, 흙손 끝은 왼쪽 아래 (12, 132))
const HAND_SVG = `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" overflow="visible" aria-hidden="true">
  <defs>
    <linearGradient id="trw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset="0.55" stop-color="#b8c0c7"/><stop offset="1" stop-color="#7d868e"/></linearGradient>
    <linearGradient id="hdl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a86b3c"/><stop offset="1" stop-color="#6e4223"/></linearGradient>
    <linearGradient id="glv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a4a"/><stop offset="1" stop-color="#ec5d00"/></linearGradient>
  </defs>
  <path d="M12 132 L104 96 Q114 104 113 126 Z" fill="url(#trw)" stroke="#5f676e" stroke-width="2" stroke-linejoin="round"/>
  <path d="M16 129 L102 98" stroke="#ffffff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
  <path d="M109 111 Q122 104 128 86" fill="none" stroke="#5f676e" stroke-width="6" stroke-linecap="round"/>
  <g transform="translate(150 70) rotate(-36)">
    <rect x="-36" y="-8" width="68" height="16" rx="8" fill="url(#hdl)"/>
    <path d="M4 -14 L24 -4 L62 -56 L38 -70 Z" fill="#2b2b2b"/>
    <path d="M2 -12 L25 -1 L33 -13 L10 -25 Z" fill="#f2ede6"/>
    <rect x="-21" y="-20" width="42" height="36" rx="15" fill="url(#glv)"/>
    <g fill="#ff8a33" stroke="#d65400" stroke-width="1.5">
      <circle cx="-14" cy="13" r="6.8"/><circle cx="-4.5" cy="15" r="6.8"/><circle cx="5" cy="15" r="6.8"/><circle cx="14" cy="12.5" r="6.3"/>
    </g>
    <path d="M-20 -5 C-24 -17 -8 -23 7 -15 C13 -11 11 -4 4 -4 C-4 -4 -11 -1 -20 -5 Z" fill="#ff9442" stroke="#d65400" stroke-width="1.5"/>
    <path d="M-13 -15 C-5 -19 5 -19 12 -15" fill="none" stroke="#ffffff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>`;

// 상판 위 소품: 황동 수전 · 화병과 가지 · 레몬 그릇 (각각 따로 움직이도록 svg 세 장)
const STONE_PROPS = `
  <svg class="sp-faucet" viewBox="0 0 60 90"><defs><linearGradient id="br" x1="0" x2="1"><stop offset="0" stop-color="#e7c27a"/><stop offset=".5" stop-color="#b8873a"/><stop offset="1" stop-color="#8a6326"/></linearGradient></defs>
    <rect x="18" y="80" width="24" height="8" rx="3" fill="url(#br)"/><path d="M30 82 V26 Q30 8 46 8 Q56 8 56 20 V30" fill="none" stroke="url(#br)" stroke-width="7" stroke-linecap="round"/><rect x="8" y="60" width="16" height="5" rx="2.5" fill="url(#br)"/></svg>
  <svg class="sp-vase" viewBox="0 0 80 140"><path d="M30 138 C14 136 12 110 22 96 C28 88 28 80 28 74 L52 74 C52 80 52 88 58 96 C68 110 66 136 50 138 Z" fill="#e9e3d8"/><path d="M30 138 C20 134 18 112 26 98" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>
    <g stroke="#5a4636" stroke-width="2" fill="none" stroke-linecap="round"><path d="M40 76 C38 50 30 30 14 8"/><path d="M42 76 C46 52 56 34 70 20"/><path d="M34 46 C26 40 20 40 12 42"/><path d="M50 44 C58 40 64 44 70 48"/></g>
    <g fill="#c9d3b0"><ellipse cx="14" cy="9" rx="5" ry="3"/><ellipse cx="70" cy="20" rx="5" ry="3"/><ellipse cx="12" cy="42" rx="4" ry="2.5"/><ellipse cx="70" cy="48" rx="4" ry="2.5"/><ellipse cx="22" cy="24" rx="4" ry="2.5"/><ellipse cx="60" cy="32" rx="4" ry="2.5"/></g></svg>
  <svg class="sp-bowl" viewBox="0 0 110 60"><circle cx="40" cy="26" r="13" fill="#f2c94c"/><circle cx="62" cy="24" r="13" fill="#f4d35e"/><circle cx="52" cy="14" r="12" fill="#efc341"/><path d="M6 30 H104 C100 50 82 58 55 58 C28 58 10 50 6 30 Z" fill="#2f3a34"/><path d="M6 30 H104" stroke="#55665d" stroke-width="3"/></svg>`;

// ---------- 장면 ----------
// 모든 장면은 (무대, 자재, 타임라인)을 받아 DOM을 만들고 움직임을 타임라인에 넣습니다.
// 조각들은 같은 텍스처를 제자리 좌표로 잘라 쓰기 때문에, 다 깔리고 나면 이음새 없이 한 장이 됩니다.
function surface(scene, cls, box) {
  const el = document.createElement('div');
  el.className = `ps-surface ${cls}`;
  Object.assign(el.style, box);
  scene.appendChild(el);
  return el;
}
function piece(parent, m, x, y, w, h, S, W, H) {
  const i = document.createElement('i');
  i.style.cssText = `left:${(x / W) * 100}%;top:${(y / H) * 100}%;width:${(w / W) * 100}%;height:${(h / H) * 100}%;` +
    `background-image:${img(m.id)};background-size:${S}px ${S}px;background-position:${-x}px ${-y}px`;
  parent.appendChild(i);
  return i;
}

export const SCENES = {
  // 벽돌: 주황 장갑 손이 흙손으로 시멘트를 한 줄 펴 바르면, 그 위에 벽돌이 한 장씩 톡톡 얹힙니다.
  async brick(scene, m, tl) {
    const pal = await brickPalette(m.id);
    const W = scene.clientWidth, Hs = scene.clientHeight;
    const gH = Hs * 0.13;
    // 바닥 기초 + 시멘트 통
    const ground = document.createElement('div'); ground.className = 'br-ground'; scene.appendChild(ground);
    const tub = document.createElement('div'); tub.className = 'br-tub'; tub.innerHTML = '<i></i>';
    Object.assign(tub.style, { right: `${W * 0.05}px`, bottom: `${gH - 2}px`, width: `${W * 0.15}px`, height: `${W * 0.085}px` });
    tub.firstChild.style.background = pal.mortar;
    scene.appendChild(tub);

    const ROWS = 8, COLS = 4;
    const wallW = W * 0.64, bw = wallW / COLS, ch = bw / 2.35, j = Math.max(4, bw * 0.075);
    const x0 = (W - wallW) / 2 - W * 0.05;
    // 손(흙손을 쥔 주황 장갑). 흙손 끝이 (12, 132) 자리에 오도록 맞춥니다.
    const hand = document.createElement('div'); hand.className = 'br-hand'; hand.innerHTML = HAND_SVG;
    const hs = (bw * 2.5) / 200;
    Object.assign(hand.style, { width: `${200 * hs}px`, height: `${150 * hs}px` });
    scene.appendChild(hand);
    const at = (x, y) => ({ x: x - 12 * hs, y: y - 132 * hs });
    gsap.set(hand, { ...at(x0 - bw * 0.6, Hs - gH - ch * 2.5), rotation: -6, opacity: 0, transformOrigin: `${12 * hs}px ${132 * hs}px` });
    tl.to(hand, { opacity: 1, duration: 0.3 });

    for (let r = 0; r < ROWS; r++) {
      const odd = r % 2 === 1;
      const xs = x0 + (odd ? -bw / 2 : 0);
      const top = Hs - gH - (r + 1) * ch;
      // 이 줄 시멘트 (흙손이 지나간 만큼 드러남)
      const bed = document.createElement('div'); bed.className = 'br-bed';
      Object.assign(bed.style, { left: `${xs - 1}px`, top: `${top}px`, width: `${COLS * bw + 2}px`, height: `${ch}px`, backgroundColor: pal.mortar });
      scene.insertBefore(bed, hand);
      gsap.set(bed, { clipPath: 'inset(0% 100% 0% 0%)' });
      const bricks = Array.from({ length: COLS }, (_, k) => {
        const b = document.createElement('i'); b.className = 'br-brick';
        Object.assign(b.style, { left: `${xs + k * bw + j / 2}px`, top: `${top}px`, width: `${bw - j}px`, height: `${ch - j}px`, backgroundColor: pal.bricks[Math.floor(Math.random() * pal.bricks.length)] });
        scene.insertBefore(b, hand);
        return b;
      });
      const y = top + ch - j * 0.8;
      // 줄 시작으로 이동 (앞 줄 벽돌이 놓이는 동안 겹쳐서)
      tl.to(hand, { ...at(xs - bw * 0.15, y), rotation: -6, duration: r ? 0.42 : 0.55, ease: 'power2.inOut' }, r ? `b${r - 1}+=0.08` : '>');
      // 쓱— 시멘트 펴 바르기 (흙손을 살짝 까딱이며)
      tl.addLabel(`s${r}`)
        .to(bed, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.48, ease: 'none' }, `s${r}`)
        .to(hand, { x: at(xs + COLS * bw, y).x, duration: 0.48, ease: 'none' }, `s${r}`)
        .to(hand, { keyframes: [{ rotation: -13, y: at(0, y - 3).y, duration: 0.14 }, { rotation: -4, y: at(0, y).y, duration: 0.14 }, { rotation: -13, y: at(0, y - 3).y, duration: 0.13 }, { rotation: -6, y: at(0, y).y, duration: 0.14 }] }, `s${r}`)
        .addLabel(`b${r}`)
        // 톡톡: 벽돌이 위에서 내려와 자리 잡기
        .from(bricks, { y: -bw * 0.55, opacity: 0, rotation: () => rnd(-6, 6), duration: 0.36, ease: 'back.out(2.2)', stagger: 0.075 }, `b${r}`);
    }
    // 다 쌓으면 손이 위로 빠짐
    tl.to(hand, { y: `-=${Hs * 0.35}`, x: `+=${W * 0.12}`, rotation: 10, opacity: 0, duration: 0.6, ease: 'power2.in' }, `b${ROWS - 1}+=0.25`);
  },

  // 벽지: 한 폭씩 위에서 펼쳐지고, 솔이 쓱싹 밀어 붙임
  wallpaper(scene, m, tl) {
    const wall = surface(scene, 'sf-plain', { left: '8%', right: '8%', top: '6%', bottom: '6%' });
    const W = wall.clientWidth, H = wall.clientHeight, N = 4, S = W / 1.6, sw = W / N;
    const strips = Array.from({ length: N }, (_, k) => {
      const s = piece(wall, m, k * sw, 0, sw, H, S, W, H);
      s.className = 'wp-strip';
      return s;
    });
    const roll = document.createElement('b'); roll.className = 'wp-roll'; wall.appendChild(roll);
    const brush = document.createElement('b'); brush.className = 'wp-brush'; wall.appendChild(brush);
    gsap.set(strips, { clipPath: 'inset(0% 0% 100% 0%)' });
    gsap.set([roll, brush], { opacity: 0 });
    strips.forEach((s, k) => {
      const x = k * sw;
      tl.set(roll, { left: x - 4, width: sw + 8, top: 0, opacity: 1 })
        .to(s, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power2.inOut' })
        .to(roll, { top: H, duration: 0.7, ease: 'power2.inOut' }, '<')
        .to(roll, { opacity: 0, duration: 0.15 })
        // 쓱싹: 솔이 좌우로 비스듬히 오가며 내려감
        .set(brush, { left: x + sw * 0.08, width: sw * 0.84, top: H * 0.05, rotation: -8, opacity: 1 })
        .to(brush, { keyframes: [
          { top: H * 0.3, rotation: 8, x: sw * 0.06, duration: 0.16 },
          { top: H * 0.55, rotation: -8, x: -sw * 0.06, duration: 0.16 },
          { top: H * 0.8, rotation: 8, x: sw * 0.06, duration: 0.16 },
          { top: H * 0.95, rotation: 0, x: 0, duration: 0.14 },
        ], ease: 'none' })
        .to(s, { '--sheen': 1, duration: 0.6, ease: 'none' }, '<')
        .to(brush, { opacity: 0, duration: 0.15 });
    });
  },

  // 타일: 접착제 위에 한 장씩 눌러 붙임
  tile(scene, m, tl) {
    const wall = surface(scene, 'sf-adhesive', { left: '10%', right: '10%', top: '10%', bottom: '10%' });
    const W = wall.clientWidth, H = wall.clientHeight, N = 5, S = W / 1.5;
    const tiles = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) tiles.push(piece(wall, m, (c * W) / N, (r * H) / N, W / N, H / N, S, W, H));
    tl.from(tiles, {
      scale: 1.35, opacity: 0, y: -14, rotation: () => rnd(-5, 5),
      boxShadow: '0 22px 30px rgba(0,0,0,0.45)', duration: 0.55, ease: 'power3.out',
      stagger: { grid: [N, N], from: 'start', amount: 1.9 },
    }).to(tiles, { boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.01 });
  },

  // 마루: 앞에서 원근으로 본 바닥에 판재가 한 줄씩 밀려 들어옴
  floor(scene, m, tl) {
    surface(scene, 'sf-roomwall', { left: 0, right: 0, top: 0, height: '38%' });
    const wrap = surface(scene, 'sf-floorwrap', { left: 0, right: 0, top: '38%', bottom: 0 });
    const plane = document.createElement('div');
    plane.className = 'sf-floor';
    wrap.appendChild(plane);
    const W = plane.clientWidth, H = plane.clientHeight, ROWS = 10, S = W / 4;
    const planks = [];
    for (let r = 0; r < ROWS; r++) {
      const cuts = [0, rnd(0.2, 0.4), rnd(0.55, 0.75), 1];
      for (let k = 0; k < 3; k++) {
        const x0 = cuts[k] * W, x1 = cuts[k + 1] * W;
        planks.push(piece(plane, m, x0, (r * H) / ROWS, x1 - x0, H / ROWS, S, W, H));
      }
    }
    // 안쪽(벽 쪽)부터 앞쪽으로 한 장씩 밀어 넣습니다.
    tl.from(planks, { x: () => rnd(-120, -70), opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.07 });
  },

  // 도장 · 미장: 롤러가 오르내리며 한 줄씩 칠함
  paint(scene, m, tl) {
    const wall = surface(scene, 'sf-primer', { left: '8%', right: '8%', top: '6%', bottom: '6%' });
    const W = wall.clientWidth, H = wall.clientHeight, N = 5, S = W / 1.1, bw = W / N;
    const bands = Array.from({ length: N }, (_, k) => piece(wall, m, k * bw, 0, bw, H, S, W, H));
    const roller = document.createElement('b'); roller.className = 'pt-roller'; roller.innerHTML = '<span></span>'; wall.appendChild(roller);
    gsap.set(bands, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(roller, { opacity: 0, width: bw * 1.08 });
    bands.forEach((b, k) => {
      tl.set(roller, { left: k * bw - bw * 0.04, top: H * 0.98, opacity: 1 })
        .to(b, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power1.inOut' })
        .to(roller, { top: 0, duration: 0.55, ease: 'power1.inOut' }, '<')
        .to(roller, { top: H * 0.7, duration: 0.35, ease: 'power1.inOut' });
    });
    tl.to(roller, { opacity: 0, y: 30, duration: 0.3 });
  },

  // 석재 상판: 큰 판이 내려와 하부장 위에 놓이고, 표면에 빛이 한 번 흐름
  stone(scene, m, tl) {
    // 주방 한 켠: 미장 벽 · 원목 바닥 · 오크 하부장. 상판이 내려와 놓이면 펜던트가 켜지고 소품이 올라옵니다.
    const el = (cls, css = {}, html = '') => { const d = document.createElement('div'); d.className = cls; Object.assign(d.style, css); d.innerHTML = html; scene.appendChild(d); return d; };
    el('st-wall');
    const glow = el('st-glow');
    el('st-floor', { backgroundImage: `url(${texPath('oak_wood_planks', 'diff')})` });
    el('st-base');
    const cab = el('st-cab', {}, `<span class="st-doors">${'<i><b></b></i>'.repeat(3)}</span><span class="st-kick"></span>`);
    cab.querySelectorAll('.st-doors i').forEach((d) => { d.style.backgroundImage = `url(${texPath('oak_wood_planks', 'diff')})`; });
    const shade = el('st-shadow');
    const slab = el('st-slab', {}, `<b class="slab-top" style="background-image:${img(m.id)}"></b><b class="slab-edge" style="background-image:${img(m.id)}"></b><b class="slab-sheen"></b>`);
    const lamp = el('st-lamp', {}, '<i class="cord"></i><i class="dome"></i><i class="bulb"></i>');
    const props = el('st-props', {}, STONE_PROPS);
    gsap.set([glow, props.children], { opacity: 0 });
    gsap.set(shade, { opacity: 0 });
    gsap.set(lamp.querySelector('.bulb'), { opacity: 0.25 });
    tl.from(lamp, { y: -60, duration: 0.7, ease: 'power3.out' })
      .from(slab, { y: -280, opacity: 0, duration: 0.85, ease: 'power2.in' }, 0.15)
      .to(shade, { opacity: 1, duration: 0.3 }, '>-0.1')
      .to(slab, { y: -5, duration: 0.12, ease: 'power1.out' }, '<')
      .to(slab, { y: 0, duration: 0.2, ease: 'power1.in' })
      // 불이 켜지고 상판 위로 빛이 한 번 스침
      .to(lamp.querySelector('.bulb'), { opacity: 1, duration: 0.25 }, '+=0.05')
      .to(glow, { opacity: 1, duration: 0.6, ease: 'power2.out' }, '<')
      .fromTo(slab.querySelector('.slab-sheen'), { xPercent: -120 }, { xPercent: 260, duration: 1.1, ease: 'power2.inOut' }, '<')
      // 소품이 차례로 놓임
      .fromTo(props.children, { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.12 }, '-=0.6');
  },

  // 우드 패널: 왼쪽부터 한 줄씩 아래에서 세워짐
  panel(scene, m, tl) {
    const wall = surface(scene, 'sf-dark', { left: '8%', right: '8%', top: '6%', bottom: '6%' });
    const W = wall.clientWidth, H = wall.clientHeight, N = 9, S = W / 1.2, bw = W / N;
    const slats = Array.from({ length: N }, (_, k) => piece(wall, m, k * bw, 0, bw, H, S, W, H));
    tl.from(slats, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7, ease: 'power3.out', stagger: 0.11 })
      .from(slats, { filter: 'brightness(1.6)', duration: 0.6, ease: 'power2.out', stagger: 0.11 }, 0);
  },
};

// ---------- 화면 ----------
export function mountPick({ stage, list }) {
  stage.innerHTML = `
    <div class="ps-box"><div class="ps-scene"></div></div>
    <a class="ps-cap" href="#"><span class="ps-cap-name"></span><span class="ps-cap-meta"></span><span class="ps-cap-go">자세히 보기 →</span></a>`;
  const sceneEl = stage.querySelector('.ps-scene');
  const cap = stage.querySelector('.ps-cap');

  list.innerHTML = ORDER.map((k) => {
    const items = byCat(k);
    return `
    <li class="pk-item" data-cat="${k}">
      <button type="button" class="pk-cat" aria-expanded="false"><span>${CATS[k].ko}</span><sup>${items.length}</sup></button>
      <div class="pk-body"><div class="pk-inner">
        <div class="pk-swatches">${items.map((m) => `
          <button type="button" class="pk-sw" data-id="${m.id}" title="${m.ko}">
            <i style="background-image:url(${texPath(m.id, 'thumb')})"></i><span>${m.ko}</span>
          </button>`).join('')}
        </div>
        <a class="pk-more" href="materials.html?cat=${k}">${CATS[k].ko} ${items.length}가지 모두 보기 →</a>
      </div></div>
    </li>`;
  }).join('');

  let cur = null, tl = null, token = 0, auto = true, visible = false, holdCall = null;

  async function play(m) {
    const my = ++token;
    cur = m;
    holdCall?.kill();
    tl?.kill();
    // 오른쪽 목록 표시
    list.querySelectorAll('.pk-item').forEach((li) => {
      const on = li.dataset.cat === m.cat;
      li.classList.toggle('is-on', on);
      li.querySelector('.pk-cat').setAttribute('aria-expanded', on);
    });
    list.querySelectorAll('.pk-sw').forEach((b) => b.classList.toggle('is-on', b.dataset.id === m.id));
    // 무대 글자
    stage.dataset.cat = m.cat;
    stage.classList.remove('is-done');
    cap.href = `material.html?id=${m.id}`;
    cap.querySelector('.ps-cap-name').textContent = m.ko;
    cap.querySelector('.ps-cap-meta').textContent = `${CATS[m.cat].ko} · ㎡당 ${won(m.perSqm)}원`;

    await preload(m.id);
    if (my !== token) return;
    gsap.to(sceneEl, { opacity: 0, duration: 0.25, onComplete: async () => {
      if (my !== token) return;
      sceneEl.innerHTML = '';
      sceneEl.style.opacity = 1;
      const t = gsap.timeline({ paused: true, onComplete: () => done(my) });
      await SCENES[m.cat](sceneEl, m, t);
      if (my !== token) return;
      tl = t;
      if (visible) tl.play(); // 안 보이면 멈춘 채로 있다가 화면에 들어오면 시작
    } });
  }

  function done(my) {
    if (my !== token) return;
    stage.classList.add('is-done');
    if (!auto) return;
    // 아무것도 누르지 않았으면 다음 종류로 넘어갑니다.
    holdCall = gsap.delayedCall(2.8, () => {
      if (!auto || !visible) return;
      const next = ORDER[(ORDER.indexOf(cur.cat) + 1) % ORDER.length];
      play(showOf(next));
    });
  }

  list.addEventListener('click', (e) => {
    const sw = e.target.closest('.pk-sw');
    const cat = e.target.closest('.pk-cat');
    if (sw) { auto = false; play(MATERIALS.find((m) => m.id === sw.dataset.id)); }
    else if (cat) {
      auto = false;
      const k = cat.closest('.pk-item').dataset.cat;
      if (k !== cur?.cat) play(showOf(k));
    }
  });

  // 화면에 보일 때만 움직입니다.
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!tl) return;
    if (visible && tl.progress() < 1) tl.play();
    else if (visible && tl.progress() === 1 && auto && !holdCall?.isActive()) done(token);
    else if (!visible) tl.pause();
  }, { threshold: 0.35 }).observe(stage);

  // 크기가 바뀌면 지금 자재로 다시 그립니다.
  let rw = stage.clientWidth;
  new ResizeObserver(() => {
    if (Math.abs(stage.clientWidth - rw) < 24) return;
    rw = stage.clientWidth;
    if (cur) play(cur);
  }).observe(stage);

  ORDER.forEach((k) => preload(showOf(k).id));
  play(showOf(ORDER[0]));
}
