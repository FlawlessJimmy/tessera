// 방 모형 가구와 소품: 룸 페이지와 홈 랜딩(회전문 케이크)이 같이 씁니다.
// 좌표는 4m × 4m 방 기준: 왼쪽 벽 안쪽 x = -2, 정면(오른쪽) 벽 안쪽 z = -2, 바닥 y = 0
// 방마다 가구 구성 · 천 색 · 그림 · 조명이 모두 다릅니다. (화분은 파우더룸 선인장 하나뿐)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { texPath } from './data.js';

export const S = 4, H = 2.7;
const L = -S / 2, B = -S / 2;

// 상자의 각 면 UV를 m 단위로 바꿔 자재가 실제 크기 비율로 깔리게 합니다.
export function meterBox(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    if (ax > 0.5) uv.setXY(i, p.getZ(i), p.getY(i));
    else if (ay > 0.5) uv.setXY(i, p.getX(i), p.getZ(i));
    else uv.setXY(i, p.getX(i), p.getY(i));
  }
  return g;
}

// ---------- 질감 (천 · 나무 · 그림 · 러그는 캔버스로 직접 그립니다) ----------
const tl = new THREE.TextureLoader();
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
let rnd = Math.random;
function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
// 천 결: 잔잔한 노이즈 + 직조 무늬를 요철(bump)로
const weave = canvasTex(128, 128, (g, w, h) => {
  const d = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = 128 + (Math.random() - 0.5) * 70 + ((x + y) % 4 < 2 ? 18 : -18);
    const i = (y * w + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
}, false);
weave.repeat.set(3, 3);
const fabric = (color, rough = 0.95) => new THREE.MeshStandardMaterial({ color, roughness: rough, bumpMap: weave, bumpScale: 1.2 });
const velvet = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.75, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(color).offsetHSL(0, -0.1, 0.25), bumpMap: weave, bumpScale: 0.5 });
const leather = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.5, bumpMap: weave, bumpScale: 0.25 });
// 나무: 실제 원목 사진을 결 방향으로 깔고 색만 바꿉니다
const woodTex = tl.load(texPath('oak_wood_planks', 'diff'));
woodTex.colorSpace = THREE.SRGBColorSpace; woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(0.6, 0.6); woodTex.anisotropy = 8;
const wood = (tint, rough = 0.55) => new THREE.MeshStandardMaterial({ color: tint, map: woodTex, roughness: rough });
const M = (color, rough = 0.6, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
const glass = (tint = '#ffffff', op = 0.25) => new THREE.MeshPhysicalMaterial({ color: tint, roughness: 0.05, transmission: 0.9, thickness: 0.02, transparent: true, opacity: op });

// 추상화 한 장
function art(palette, style, seed) {
  rnd = seeded(seed);
  return canvasTex(320, 400, (g, w, h) => {
    g.fillStyle = palette[0]; g.fillRect(0, 0, w, h);
    if (style === 'arches') {
      for (let i = 0; i < 3; i++) { g.fillStyle = palette[1 + (i % (palette.length - 1))]; g.beginPath(); const x = 60 + i * 100, r = 46; g.arc(x, 210, r, Math.PI, 0); g.lineTo(x + r, 330); g.lineTo(x - r, 330); g.fill(); }
    } else if (style === 'sun') {
      g.fillStyle = palette[1]; g.beginPath(); g.arc(w / 2, 170, 90, 0, Math.PI * 2); g.fill();
      g.fillStyle = palette[2]; g.fillRect(0, 250, w, h - 250);
      g.fillStyle = palette[3] || palette[1]; g.fillRect(0, 290, w, 14);
    } else if (style === 'lines') {
      g.strokeStyle = palette[1]; g.lineWidth = 7;
      for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(30, 60 + i * 34); g.bezierCurveTo(120, 20 + i * 34 + rnd() * 60, 200, 90 + i * 30, 290, 50 + i * 36); g.stroke(); }
    } else if (style === 'blobs') {
      for (let i = 0; i < 6; i++) { g.fillStyle = palette[1 + (i % (palette.length - 1))]; g.beginPath(); g.ellipse(40 + rnd() * 240, 50 + rnd() * 300, 30 + rnd() * 60, 20 + rnd() * 50, rnd() * 3, 0, Math.PI * 2); g.fill(); }
    } else if (style === 'grid') {
      for (let y = 0; y < 5; y++) for (let x = 0; x < 4; x++) { g.fillStyle = palette[1 + Math.floor(rnd() * (palette.length - 1))]; g.fillRect(24 + x * 70, 28 + y * 70, 58, 58); }
    }
    // 종이 결
    g.globalAlpha = 0.06; for (let i = 0; i < 2500; i++) { g.fillStyle = rnd() > 0.5 ? '#000' : '#fff'; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); } g.globalAlpha = 1;
  });
}
// 러그
function rugTex(style, palette, seed) {
  rnd = seeded(seed);
  return canvasTex(512, 384, (g, w, h) => {
    g.fillStyle = palette[0]; g.fillRect(0, 0, w, h);
    if (style === 'border') { g.strokeStyle = palette[1]; g.lineWidth = 14; g.strokeRect(26, 26, w - 52, h - 52); g.lineWidth = 4; g.strokeRect(52, 52, w - 104, h - 104); }
    if (style === 'kilim') {
      for (let y = 0; y < 6; y++) for (let x = 0; x < 8; x++) { g.fillStyle = palette[1 + ((x + y) % (palette.length - 1))]; g.beginPath(); const cx = 32 + x * 64, cy = 32 + y * 64; g.moveTo(cx, cy - 24); g.lineTo(cx + 24, cy); g.lineTo(cx, cy + 24); g.lineTo(cx - 24, cy); g.fill(); }
      g.strokeStyle = palette[1]; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16);
    }
    if (style === 'stripes') for (let x = 0; x < w; x += 40) { g.fillStyle = palette[1 + ((x / 40) % (palette.length - 1))]; g.fillRect(x, 0, 14, h); }
    if (style === 'jute') { for (let r = 8; r < w / 2; r += 7) { g.strokeStyle = r % 14 ? palette[1] : palette[0]; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h / 2, r, 0, Math.PI * 2); g.stroke(); } }
    // 실 결
    g.globalAlpha = 0.12; for (let i = 0; i < 9000; i++) { g.fillStyle = rnd() > 0.5 ? '#000' : '#fff'; g.fillRect(rnd() * w, rnd() * h, 2, 1); } g.globalAlpha = 1;
  });
}

export const C = {
  cap: M('#f2f2f0', 0.9),
  white: M('#f4f1ec', 0.45),
  black: M('#1c1b1a', 0.45, 0.3),
  steel: M('#c9ccce', 0.28, 0.85),
  brass: M('#c79a52', 0.3, 0.9),
  ceramic: M('#f6f4ef', 0.18),
  mirror: M('#e4eaee', 0.02, 1),
  water: new THREE.MeshPhysicalMaterial({ color: '#cfe3e6', roughness: 0.02, transmission: 0.6, transparent: true, opacity: 0.8 }),
  paper: M('#fbfaf6', 0.9),
  leaf: M('#4f6b45', 0.7),
};

// ---------- 기본 도형 ----------
const shadowy = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const rb = (w, h, d, mat, x, y, z, r = 0.04) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), mat);
  m.position.set(x, y, z); return shadowy(m);
};
const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return shadowy(m); };
const cyl = (r, h, mat, x, y, z, seg = 32, r2 = r) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r2, h, seg), mat); m.position.set(x, y, z); return shadowy(m); };
const ball = (r, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), mat); m.position.set(x, y, z); return shadowy(m); };
const tube = (pts, r, mat) => shadowy(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 40, r, 10), mat));
const grp = (x, z, ry = 0, ...kids) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.add(...kids); return g; };
const plane = (w, h, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.receiveShadow = true; return m; };

// 벽에 거는 액자 (벽 'back' = z 쪽, 'left' = x 쪽)
function frame(wall, u, y, w, h, tex, frameMat = C.black) {
  const g = new THREE.Group();
  g.add(box(w + 0.06, h + 0.06, 0.035, frameMat, 0, 0, 0));
  const pic = plane(w - 0.04, h - 0.04, M('#ffffff', 0.85, 0, { map: tex }));
  pic.position.z = 0.019; g.add(pic);
  if (wall === 'back') g.position.set(u, y, B + 0.02);
  else { g.position.set(L + 0.02, y, u); g.rotation.y = Math.PI / 2; }
  return g;
}
// 러그
function rug(w, d, tex, x, z, round = false) {
  const geo = round ? new THREE.CylinderGeometry(w / 2, w / 2, 0.012, 64) : new THREE.BoxGeometry(w, 0.012, d);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 1, bumpMap: weave, bumpScale: 2 }));
  m.position.set(x, 0.006, z); m.receiveShadow = true; return m;
}
// 책 한 줄
function books(n, x, y, z, along = 'x', palette = ['#8b3a2b', '#2f4858', '#d9b26f', '#e9e4d8', '#5b6b4f', '#1f1f1f'], seed = 3) {
  rnd = seeded(seed);
  const g = new THREE.Group();
  let off = 0;
  for (let i = 0; i < n; i++) {
    const t = 0.03 + rnd() * 0.03, h = 0.18 + rnd() * 0.1, d = 0.15 + rnd() * 0.05;
    const mat = M(palette[Math.floor(rnd() * palette.length)], 0.8);
    const b = along === 'x' ? box(t, h, d, mat, x + off, y + h / 2, z) : box(d, h, t, mat, x, y + h / 2, z + off);
    if (rnd() < 0.12) b.rotation[along === 'x' ? 'z' : 'x'] = 0.25;
    g.add(b); off += t + 0.004;
  }
  return g;
}
// 화병 + 마른 가지
function branchVase(x, y, z, s = 1, vaseMat = M('#d8d0c2', 0.5)) {
  const g = new THREE.Group();
  g.add(cyl(0.09 * s, 0.32 * s, vaseMat, 0, 0.16 * s, 0, 24, 0.12 * s));
  const twig = M('#5a4636', 0.9);
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7, h = (0.6 + i * 0.12) * s;
    g.add(tube([[0, 0.25 * s, 0], [Math.cos(a) * 0.08 * s, h * 0.6, Math.sin(a) * 0.08 * s], [Math.cos(a) * 0.22 * s, h, Math.sin(a) * 0.2 * s]], 0.006 * s, twig));
  }
  g.position.set(x, y, z); return g;
}
// 소파 (모양 · 천을 바꿔 여러 방에서 다르게)
function sofa({ w = 2.3, d = 0.95, mat, legs = C.black, arms = 'box', cushions = 3 }) {
  const g = new THREE.Group();
  const lh = 0.1;
  g.add(rb(w, 0.24, d, mat, 0, lh + 0.12, 0, 0.06));
  const cw = (w - 0.36) / cushions;
  for (let i = 0; i < cushions; i++) g.add(rb(cw - 0.02, 0.16, d - 0.24, mat, -w / 2 + 0.18 + cw / 2 + i * cw, lh + 0.32, 0.08, 0.07));
  for (let i = 0; i < cushions; i++) g.add(rb(cw - 0.02, 0.42, 0.2, mat, -w / 2 + 0.18 + cw / 2 + i * cw, lh + 0.52, -d / 2 + 0.14, 0.08));
  if (arms === 'box') { g.add(rb(0.18, 0.5, d, mat, -w / 2 + 0.09, lh + 0.25, 0, 0.06), rb(0.18, 0.5, d, mat, w / 2 - 0.09, lh + 0.25, 0, 0.06)); }
  if (arms === 'roll') for (const s of [-1, 1]) { const a = cyl(0.15, d, mat, s * (w / 2 - 0.12), lh + 0.42, 0, 24); a.rotation.x = Math.PI / 2; g.add(a, rb(0.24, 0.3, d, mat, s * (w / 2 - 0.12), lh + 0.17, 0, 0.04)); }
  for (const [x, z] of [[-w / 2 + 0.1, -d / 2 + 0.1], [w / 2 - 0.1, -d / 2 + 0.1], [-w / 2 + 0.1, d / 2 - 0.1], [w / 2 - 0.1, d / 2 - 0.1]]) g.add(cyl(0.022, lh, legs, x, lh / 2, z, 10));
  return g;
}
const pillow = (mat, x, y, z, rz = 0, s = 0.42) => { const p = rb(s, s, 0.13, mat, x, y, z, 0.06); p.rotation.set(-0.25, 0, rz); return p; };
// 펜던트 · 전구 (빛나는 재질을 따로 받아 밝기를 조절할 수 있게)
function cord(x, z, y0, y1) { return cyl(0.004, y1 - y0, C.black, x, (y0 + y1) / 2, z, 6); }

// ---------- 방 ----------
// 각 방 함수는 그룹에 가구를 넣고, 조명 정보(lights · rect)와 빛나는 재질(glows)을 돌려줍니다.
const PROPS = {
  // 노르딕 거실 · 자연광: 창으로 낮빛이 들어오고 아크 램프 하나
  living(g, ctr, glow) {
    const boucle = fabric('#dedad2');
    g.add(rug(2.9, 2.1, rugTex('border', ['#d9cfbd', '#9f8c6e'], 11), 0.45, 0.1));
    g.add(grp(0.35, B + 0.55, 0, sofa({ w: 2.4, mat: boucle, arms: 'box' })));
    g.add(pillow(fabric('#c99a3b'), -0.6, 0.72, B + 0.35, 0.12), pillow(fabric('#8a9a7b'), 1.25, 0.72, B + 0.35, -0.1), pillow(fabric('#f1ece2'), -0.25, 0.7, B + 0.38, -0.05, 0.36));
    // 원형 커피 테이블 + 대리석 사이드 테이블
    const oak = wood('#d6b48c');
    g.add(cyl(0.5, 0.045, oak, 0.45, 0.38, 0.25, 48), cyl(0.18, 0.34, oak, 0.45, 0.18, 0.25, 32, 0.24));
    g.add(books(3, 0.25, 0.4, 0.15, 'x', ['#e9e4d8', '#2f4858', '#b9563a'], 5), branchVase(0.68, 0.4, 0.35, 0.55, M('#3d3a36', 0.35)));
    g.add(cyl(0.22, 0.03, M('#efece6', 0.15), 1.75, 0.52, 0.3, 40), cyl(0.03, 0.5, C.brass, 1.75, 0.26, 0.3, 10), cyl(0.15, 0.02, C.brass, 1.75, 0.01, 0.3, 30));
    // 라운지 체어
    const chair = new THREE.Group();
    const ash = wood('#c9a77d');
    chair.add(rb(0.7, 0.06, 0.72, ash, 0, 0.32, 0), rb(0.06, 0.55, 0.06, ash, -0.32, 0.28, 0.3), rb(0.06, 0.55, 0.06, ash, 0.32, 0.28, 0.3), rb(0.06, 0.75, 0.06, ash, -0.32, 0.36, -0.33), rb(0.06, 0.75, 0.06, ash, 0.32, 0.36, -0.33));
    const cush = fabric('#b8694a');
    chair.add(rb(0.62, 0.12, 0.64, cush, 0, 0.42, 0.02, 0.05));
    const back = rb(0.62, 0.55, 0.12, cush, 0, 0.72, -0.3, 0.05); back.rotation.x = -0.25; chair.add(back);
    g.add(grp(L + 0.85, 1.05, Math.PI / 2 + 0.55, chair));
    // 아크 램프
    g.add(cyl(0.17, 0.04, M('#e9e6e0', 0.2), 1.62, 0.02, B + 0.35, 40));
    g.add(tube([[1.62, 0.04, B + 0.35], [1.62, 1.4, B + 0.35], [1.4, 2.05, B + 0.6], [0.85, 1.95, 0.0]], 0.014, C.black));
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M('#1e1e1e', 0.4, 0.3, { side: THREE.DoubleSide }));
    shade.position.set(0.82, 1.92, 0.04); shadowy(shade); g.add(shade, ball(0.06, glow, 0.82, 1.84, 0.04));
    // 왼쪽 벽 창 + 얇은 커튼
    const win = new THREE.Group();
    const sky = M('#ffffff', 1, 0, { emissive: '#eaf2ff', emissiveIntensity: 1.05 });
    win.add(box(0.02, 1.5, 1.3, sky, 0, 0, 0));
    for (const z of [-0.66, 0, 0.66]) win.add(box(0.06, 1.56, 0.05, C.white, 0.02, 0, z));
    for (const y of [-0.76, 0.1, 0.76]) win.add(box(0.06, 0.05, 1.36, C.white, 0.02, y, 0));
    win.position.set(L + 0.01, 1.45, -0.25); g.add(win);
    const sheer = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.4, 20, 1), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    const sp = sheer.geometry.attributes.position; for (let i = 0; i < sp.count; i++) sp.setZ(i, Math.sin(sp.getX(i) * 22) * 0.04);
    sheer.geometry.computeVertexNormals(); sheer.rotation.y = Math.PI / 2; sheer.position.set(L + 0.12, 1.22, 0.62); g.add(sheer);
    g.add(frame('back', 0.35, 1.62, 1.0, 0.72, art(['#efe8dc', '#d6a35b', '#7d8f78', '#2f4858'], 'sun', 7), wood('#c9a77d')));
    g.add(branchVase(L + 0.35, 0, B + 0.35, 1.3, M('#cfc3ae', 0.6)));
    return { lights: [{ p: [0.82, 1.75, 0.04], c: '#ffd9a6', i: 2.25, d: 4 }], rect: { p: [L + 0.15, 1.45, -0.25], w: 1.3, h: 1.5, c: '#e6efff', i: 2.2, face: 'x' }, glows: [sky] };
  },

  // 재팬디 침실 · 은은한 노란 등: 종이 조명과 낮은 원목 침대
  bed(g, ctr, glow) {
    const walnut = wood('#7a5638', 0.6);
    g.add(rug(2.6, 2.6, rugTex('jute', ['#cdb592', '#b39a74'], 3), 0.4, 0.8, true));
    g.add(box(1.9, 0.08, 2.2, M('#3a2a1e', 0.7), 0.15, 0.04, B + 1.15), rb(2.1, 0.16, 2.35, walnut, 0.15, 0.16, B + 1.2, 0.02));
    const linen = fabric('#f1ece3'), linen2 = fabric('#cdbfa8');
    g.add(rb(1.85, 0.22, 2.1, linen, 0.15, 0.35, B + 1.15, 0.08));
    const duvet = rb(1.95, 0.1, 1.45, linen2, 0.15, 0.49, B + 1.5, 0.05); g.add(duvet);
    g.add(pillow(linen, -0.28, 0.6, B + 0.32, 0, 0.6), pillow(linen, 0.58, 0.6, B + 0.32, 0, 0.6));
    g.add(rb(0.5, 0.25, 0.12, fabric('#a5532f'), 0.15, 0.6, B + 0.52, 0.05));
    g.add(rb(1.2, 0.05, 0.42, fabric('#6f7a5c'), 0.15, 0.56, B + 2.05, 0.02));
    // 침대 옆 낮은 협탁 + 종이 조명 두 개
    for (const x of [-1.3, 1.6]) {
      g.add(rb(0.48, 0.36, 0.42, walnut, x, 0.18, B + 0.3, 0.02));
      g.add(cyl(0.12, 0.34, glow, x, 0.36 + 0.17, B + 0.3, 32), cyl(0.125, 0.012, C.black, x, 0.36 + 0.34, B + 0.3, 32));
    }
    g.add(branchVase(1.72, 0.36, B + 0.42, 0.45, M('#2c2a28', 0.3)));
    // 둥근 종이 펜던트
    g.add(cord(-1.25, 0.9, 1.95, H), ball(0.32, glow, -1.25, 1.75, 0.9));
    // 원목 벤치 + 방석
    g.add(grp(0.15, 1.35, 0, rb(1.3, 0.05, 0.38, walnut, 0, 0.42, 0, 0.01), rb(0.05, 0.4, 0.34, walnut, -0.58, 0.2, 0, 0.01), rb(0.05, 0.4, 0.34, walnut, 0.58, 0.2, 0, 0.01)));
    g.add(rb(0.62, 0.09, 0.62, fabric('#3b4a63'), 1.45, 0.05, 1.45, 0.04), rb(0.62, 0.09, 0.62, fabric('#3b4a63'), 1.5, 0.14, 1.42, 0.04));
    g.add(frame('left', 0.2, 1.55, 0.6, 0.85, art(['#ece4d6', '#2b2b2b'], 'lines', 21), wood('#2b2118')));
    return { lights: [{ p: [-1.25, 1.75, 0.9], c: '#ffbf76', i: 1.8, d: 4.5 }, { p: [1.6, 0.6, B + 0.45], c: '#ffb767', i: 0.72, d: 2.2 }], glows: [] };
  },

  // 테라조 키친 · 형광등: 긴 LED 바 아래 아일랜드, 열린 선반과 냉장고
  kitchen(g, ctr, glow) {
    const front = M('#eeece6', 0.5);
    const oak = wood('#d2ae84');
    // 냉장고
    g.add(rb(0.78, 2.05, 0.7, C.steel, L + 0.42, 1.025, B + 0.37, 0.03));
    g.add(box(0.012, 0.9, 0.02, C.black, L + 0.78, 1.45, B + 0.73), box(0.012, 0.5, 0.02, C.black, L + 0.78, 0.55, B + 0.73));
    // 하부장 + 상판
    const x0 = L + 0.85, w = 3.15, cx = x0 + w / 2;
    g.add(box(w, 0.08, 0.56, M('#222', 0.8), cx, 0.04, B + 0.3));
    g.add(box(w, 0.78, 0.6, front, cx, 0.47, B + 0.3));
    for (let i = 1; i < 5; i++) g.add(box(0.006, 0.74, 0.01, M('#bdb9b0', 0.6), x0 + (w / 5) * i, 0.47, B + 0.605));
    for (let i = 0; i < 5; i++) g.add(box(0.14, 0.012, 0.02, C.brass, x0 + (w / 5) * (i + 0.5), 0.8, B + 0.62));
    const top = new THREE.Mesh(meterBox(w + 0.04, 0.04, 0.64), [C.cap, C.cap, ctr, C.cap, ctr, C.cap]);
    top.position.set(cx, 0.88, B + 0.32); shadowy(top); g.add(top);
    // 싱크 · 수전 · 쿡탑 · 주전자
    g.add(box(0.6, 0.012, 0.4, M('#3b3e40', 0.25, 0.6), cx - 0.5, 0.902, B + 0.32));
    g.add(tube([[cx - 0.5, 0.9, B + 0.1], [cx - 0.5, 1.22, B + 0.1], [cx - 0.5, 1.26, B + 0.28], [cx - 0.5, 1.12, B + 0.34]], 0.012, C.brass));
    g.add(box(0.62, 0.01, 0.48, M('#0f0f10', 0.1), cx + 0.75, 0.905, B + 0.32));
    g.add(cyl(0.11, 0.16, C.steel, cx + 0.65, 0.99, B + 0.24, 32, 0.12), cyl(0.012, 0.06, C.black, cx + 0.65, 1.09, B + 0.24));
    // 열린 선반: 그릇 · 유리병
    g.add(box(1.7, 0.04, 0.26, oak, cx - 0.1, 1.62, B + 0.14));
    for (let i = 0; i < 4; i++) g.add(cyl(0.12, 0.012, C.ceramic, cx - 0.75, 1.648 + i * 0.016, B + 0.15, 32));
    for (let i = 0; i < 3; i++) g.add(cyl(0.055, 0.2 + i * 0.03, glass('#e7efe9', 0.35), cx - 0.3 + i * 0.16, 1.64 + (0.2 + i * 0.03) / 2, B + 0.14, 24));
    g.add(cyl(0.09, 0.07, M('#2c5a48', 0.3), cx + 0.25, 1.675, B + 0.14, 32, 0.06), cyl(0.09, 0.07, M('#d8cfc0', 0.3), cx + 0.5, 1.675, B + 0.14, 32, 0.06));
    // 아일랜드 + 의자 + 과일
    g.add(box(1.9, 0.84, 0.82, M('#2f3a34', 0.55), 0.35, 0.42, 0.75));
    const itop = new THREE.Mesh(meterBox(2.05, 0.04, 0.95), [ctr, ctr, ctr, C.cap, ctr, ctr]);
    itop.position.set(0.35, 0.86, 0.75); shadowy(itop); g.add(itop);
    for (const x of [-0.35, 0.35, 1.05]) g.add(cyl(0.17, 0.05, oak, x, 0.66, 1.45, 32), cyl(0.012, 0.64, C.black, x - 0.09, 0.32, 1.45, 8), cyl(0.012, 0.64, C.black, x + 0.09, 0.32, 1.45, 8), cyl(0.12, 0.012, C.black, x, 0.25, 1.45, 24));
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#e9e1d3', 0.35, 0, { side: THREE.DoubleSide }));
    bowl.position.set(0.1, 1.05, 0.7); shadowy(bowl); g.add(bowl);
    for (const [dx, dz] of [[0, 0], [0.08, 0.05], [-0.07, 0.05], [0.02, -0.08]]) g.add(ball(0.055, M('#e8862e', 0.5), 0.1 + dx, 0.94, 0.7 + dz));
    g.add(rb(0.45, 0.025, 0.3, oak, 0.75, 0.892, 0.8, 0.01));
    // LED 바 펜던트 (형광등 느낌)
    g.add(cord(-0.35, 0.75, 1.95, H), cord(1.05, 0.75, 1.95, H), box(1.7, 0.05, 0.08, C.black, 0.35, 1.95, 0.75), box(1.64, 0.012, 0.05, glow, 0.35, 1.922, 0.75));
    return { lights: [{ p: [0.35, 1.7, 0.75], c: '#eef5ff', i: 1.8, d: 4 }], rect: { p: [0.35, 1.9, 0.75], w: 1.6, h: 0.3, c: '#f0f6ff', i: 2.2, face: 'down' }, glows: [] };
  },

  // 네이비 욕실 · 백라이트: 원형 거울 뒤 LED, 독립 욕조, 촛불
  bath(g, ctr, glow) {
    const tub = rb(1.75, 0.6, 0.82, M('#fbfbf9', 0.12), 0.55, 0.3, B + 0.6, 0.28);
    g.add(tub, rb(1.55, 0.02, 0.62, C.water, 0.55, 0.52, B + 0.6, 0.2));
    g.add(tube([[1.65, 0, B + 0.6], [1.65, 0.95, B + 0.6], [1.62, 1.02, B + 0.6], [1.5, 0.96, B + 0.6]], 0.016, C.black));
    // 떠 있는 세면대 + 원형 거울 + 뒤 LED 링
    const walnut = wood('#6e4c33', 0.5);
    g.add(rb(0.52, 0.32, 1.15, walnut, L + 0.28, 0.72, 0.35, 0.02));
    const vt = new THREE.Mesh(meterBox(0.56, 0.035, 1.2), [ctr, ctr, ctr, C.cap, ctr, ctr]); vt.position.set(L + 0.29, 0.9, 0.35); shadowy(vt); g.add(vt);
    const sink = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#ffffff', 0.12, 0, { side: THREE.DoubleSide }));
    sink.position.set(L + 0.3, 1.08, 0.35); shadowy(sink); g.add(sink);
    g.add(tube([[L + 0.02, 1.25, 0.35], [L + 0.18, 1.25, 0.35], [L + 0.2, 1.2, 0.35]], 0.01, C.black));
    const mir = cyl(0.42, 0.025, C.mirror, L + 0.035, 1.68, 0.35, 64); mir.rotation.z = Math.PI / 2; g.add(mir);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.012, 8, 80), glow); ring.rotation.y = Math.PI / 2; ring.position.set(L + 0.02, 1.68, 0.35); g.add(ring);
    // 수건 사다리 + 수건
    const ladder = new THREE.Group();
    for (const s of [-0.2, 0.2]) { const r = cyl(0.015, 1.7, walnut, s, 0.85, 0, 10); ladder.add(r); }
    for (let i = 0; i < 5; i++) { const r = cyl(0.012, 0.42, walnut, 0, 0.25 + i * 0.32, 0, 8); r.rotation.z = Math.PI / 2; ladder.add(r); }
    ladder.add(rb(0.36, 0.5, 0.03, fabric('#b5643f'), 0, 1.0, 0.03, 0.01), rb(0.36, 0.38, 0.03, fabric('#f0ece4'), 0, 0.55, 0.035, 0.01));
    ladder.rotation.x = -0.18; ladder.position.set(1.75, 0, B + 0.2); g.add(ladder);
    // 원목 스툴 + 초
    g.add(cyl(0.18, 0.04, walnut, -0.55, 0.45, B + 0.75, 32), cyl(0.03, 0.43, walnut, -0.55, 0.215, B + 0.75));
    const flame = M('#fff', 1, 0, { emissive: '#ffb45a', emissiveIntensity: 3 });
    for (const [dx, h] of [[-0.06, 0.12], [0.06, 0.08]]) g.add(cyl(0.035, h, M('#f4efe6', 0.6), -0.55 + dx, 0.47 + h / 2, B + 0.75), ball(0.012, flame, -0.55 + dx, 0.47 + h + 0.02, B + 0.75));
    g.add(rug(1.1, 0.6, rugTex('stripes', ['#efeae1', '#2c3e5c'], 4), -0.2, 0.9));
    return { lights: [{ p: [L + 0.45, 1.68, 0.35], c: '#e9f1ff', i: 1.35, d: 2.6 }, { p: [-0.55, 0.65, B + 0.75], c: '#ffae55', i: 0.32, d: 1.4 }], rect: { p: [0.4, 2.62, 0.1], w: 1.4, h: 0.7, c: '#e6eeff', i: 1.8, face: 'down' }, glows: [flame] };
  },

  // 웜 아틀리에 · 핀 조명: 트랙 스포트라이트 아래 작업대, 이젤, 책장
  desk(g, ctr, glow) {
    const oak = wood('#c99f72');
    g.add(rug(2.4, 1.7, rugTex('stripes', ['#e3d6c1', '#b45c39', '#2f3e46'], 8), 0.4, 0.9));
    // 작업대 (철제 다리)
    g.add(box(2.0, 0.05, 0.85, oak, 0.15, 0.76, B + 0.55));
    for (const x of [-0.75, 1.05]) g.add(box(0.04, 0.73, 0.04, C.black, x, 0.365, B + 0.2), box(0.04, 0.73, 0.04, C.black, x, 0.365, B + 0.9), box(0.04, 0.04, 0.74, C.black, x, 0.1, B + 0.55));
    // 노트북 · 스케치북 · 펜꽂이 · 스탠드
    g.add(box(0.36, 0.012, 0.25, M('#bfc3c6', 0.3, 0.7), -0.3, 0.792, B + 0.6));
    const scr = box(0.36, 0.24, 0.01, M('#111', 0.3, 0, { emissive: '#9db7d6', emissiveIntensity: 0.35 }), -0.3, 0.91, B + 0.47); scr.rotation.x = -0.2; g.add(scr);
    for (const s of [-1, 1]) { const p = box(0.2, 0.004, 0.28, C.paper, 0.32 + s * 0.1, 0.792, B + 0.62); p.rotation.z = -s * 0.06; g.add(p); }
    g.add(cyl(0.04, 0.1, M('#2c2c2c', 0.4), 0.7, 0.835, B + 0.35));
    for (let i = 0; i < 4; i++) { const p = cyl(0.004, 0.16, M(['#e3b23c', '#b45c39', '#2f3e46', '#eee'][i], 0.5), 0.7 + (i - 1.5) * 0.012, 0.9, B + 0.35, 6); p.rotation.z = (i - 1.5) * 0.1; g.add(p); }
    g.add(cyl(0.08, 0.02, C.black, 0.95, 0.795, B + 0.35), tube([[0.95, 0.8, B + 0.35], [0.9, 1.15, B + 0.4], [0.7, 1.25, B + 0.5]], 0.008, C.black));
    const head = cyl(0.03, 0.12, C.black, 0.68, 1.22, B + 0.51, 20, 0.07); head.rotation.z = 0.6; g.add(head, ball(0.025, glow, 0.66, 1.18, B + 0.52));
    // 의자
    g.add(grp(0.15, B + 1.25, Math.PI, rb(0.46, 0.04, 0.44, oak, 0, 0.46, 0), rb(0.44, 0.3, 0.03, oak, 0, 0.75, 0.2), ...[[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].map(([x, z]) => box(0.03, 0.45, 0.03, C.black, x, 0.225, z))));
    // 왼쪽 벽 책장
    const shelf = new THREE.Group();
    shelf.add(box(0.34, 2.1, 0.03, oak, 0, 1.05, -0.7), box(0.34, 2.1, 0.03, oak, 0, 1.05, 0.7));
    for (let i = 0; i < 5; i++) shelf.add(box(0.34, 0.03, 1.4, oak, 0, 0.1 + i * 0.48, 0));
    for (let i = 0; i < 4; i++) shelf.add(books(10 + (i % 2) * 4, 0, 0.115 + i * 0.48, -0.62 + (i % 2) * 0.3, 'z', undefined, 30 + i));
    shelf.add(ball(0.07, M('#b45c39', 0.4), 0, 2.12, 0.4), cyl(0.06, 0.18, M('#2f3e46', 0.3), 0, 1.68, 0.5));
    shelf.position.set(L + 0.19, 0, 0.5); g.add(shelf);
    // 이젤 + 그림
    const easel = new THREE.Group();
    for (const s of [-1, 1]) { const leg = box(0.04, 1.8, 0.04, oak, s * 0.3, 0.9, 0); leg.rotation.z = -s * 0.12; easel.add(leg); }
    const back = box(0.04, 1.6, 0.04, oak, 0, 0.8, -0.35); back.rotation.x = 0.25; easel.add(back);
    easel.add(box(0.7, 0.03, 0.08, oak, 0, 0.62, 0.03));
    const canvas = box(0.78, 0.98, 0.03, M('#ffffff', 0.9, 0, { map: art(['#f0e6d6', '#b45c39', '#e3b23c', '#2f3e46', '#7d8f78'], 'blobs', 42) }), 0, 1.13, 0.05);
    canvas.rotation.x = -0.12; easel.add(canvas);
    easel.position.set(1.5, 0, 0.45); easel.rotation.y = -0.7; g.add(easel);
    // 핀보드 + 색 견본
    g.add(box(1.2, 0.7, 0.02, M('#b88f65', 1), 0.15, 1.55, B + 0.012));
    const sw = ['#b45c39', '#e3b23c', '#2f3e46', '#7d8f78', '#e9e1d2', '#2b2b2b', '#c7a27c', '#5d7083'];
    sw.forEach((c, i) => g.add(box(0.16, 0.2, 0.004, M(c, 0.8), -0.3 + (i % 4) * 0.3, 1.7 - Math.floor(i / 4) * 0.3, B + 0.026)));
    // 트랙 조명
    g.add(box(2.4, 0.035, 0.04, C.black, 0.2, 2.55, 0.35));
    for (const x of [-0.6, 0.2, 1.0]) { const can = cyl(0.05, 0.16, C.black, x, 2.44, 0.35, 20, 0.06); can.rotation.x = 0.5; g.add(can, cyl(0.008, 0.08, C.black, x, 2.52, 0.35, 6), ball(0.03, glow, x, 2.37, 0.3)); }
    return { lights: [{ p: [0.2, 2.1, 0.0], c: '#ffd09a', i: 2.25, d: 4.5 }, { p: [0.66, 1.05, B + 0.55], c: '#ffcf8f', i: 0.63, d: 1.8 }], glows: [scr.material] };
  },

  // 브릭 로프트 · 에디슨 전구: 코냑 가죽 소파, 대리석 식탁, 자전거
  loft(g, ctr, glow) {
    g.add(rug(2.6, 1.8, rugTex('kilim', ['#8f3b26', '#d9a066', '#2a3a4a', '#e8dcc6'], 9), 0.55, 0.15));
    g.add(grp(0.55, B + 0.55, 0, sofa({ w: 2.3, mat: leather('#8a4a26'), arms: 'roll', cushions: 2, legs: wood('#3a2a1e') })));
    g.add(pillow(velvet('#2f4a3c'), -0.15, 0.72, B + 0.36, 0.15), pillow(fabric('#d9a066'), 1.2, 0.7, B + 0.38, -0.1, 0.38));
    // 철제 커피 테이블
    const reclaimed = wood('#7a5a40', 0.7);
    g.add(box(1.1, 0.05, 0.6, reclaimed, 0.6, 0.4, 0.4));
    for (const [x, z] of [[0.1, 0.15], [1.1, 0.15], [0.1, 0.65], [1.1, 0.65]]) g.add(box(0.03, 0.38, 0.03, C.black, x, 0.19, z));
    g.add(box(1.0, 0.02, 0.5, C.black, 0.6, 0.12, 0.4), books(2, 0.45, 0.425, 0.35, 'x', ['#1c1c1c', '#b33b2a'], 2));
    // 대리석 식탁 + 의자 + 에디슨 전구
    const t = new THREE.Mesh(meterBox(0.8, 0.04, 1.3), [ctr, ctr, ctr, C.cap, ctr, ctr]); t.position.set(L + 0.85, 0.75, 1.0); shadowy(t); g.add(t);
    g.add(box(0.06, 0.72, 0.06, C.black, L + 0.85, 0.36, 0.6), box(0.06, 0.72, 0.06, C.black, L + 0.85, 0.36, 1.4), box(0.5, 0.03, 0.06, C.black, L + 0.85, 0.02, 0.6), box(0.5, 0.03, 0.06, C.black, L + 0.85, 0.02, 1.4));
    for (const z of [0.7, 1.3]) {
      const ch = new THREE.Group();
      ch.add(cyl(0.2, 0.03, C.black, 0, 0.45, 0, 28), tube([[-0.16, 0.45, -0.12], [-0.2, 0.75, 0], [0, 0.82, 0.04], [0.2, 0.75, 0], [0.16, 0.45, -0.12]].map(([x, y, zz]) => [zz, y, x]), 0.012, C.black));
      for (const [x, zz] of [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]]) ch.add(cyl(0.012, 0.45, C.black, x, 0.225, zz, 6));
      ch.position.set(L + 1.45, 0, z); ch.rotation.y = Math.PI; g.add(ch);
    }
    const bulbGlass = glass('#fff4e0', 0.35);
    for (const [dz, y] of [[-0.3, 1.55], [0, 1.4], [0.3, 1.62]]) g.add(cord(L + 0.85, 1.0 + dz, y + 0.08, H), cyl(0.012, 0.04, C.brass, L + 0.85, y + 0.07, 1.0 + dz, 12), ball(0.065, bulbGlass, L + 0.85, y, 1.0 + dz), ball(0.02, glow, L + 0.85, y, 1.0 + dz));
    // 자전거 (왼쪽 벽에 기대어)
    const bike = new THREE.Group();
    const tire = M('#151515', 0.8);
    for (const z of [-0.5, 0.5]) { const wh = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.022, 10, 48), tire); wh.position.set(0, 0.34, z); wh.rotation.y = Math.PI / 2; shadowy(wh); bike.add(wh); }
    const fr = M('#2f5b4a', 0.35, 0.5);
    bike.add(tube([[0, 0.34, -0.5], [0, 0.4, -0.05], [0, 0.78, 0.05], [0, 0.82, 0.38], [0, 0.34, 0.5]], 0.015, fr), tube([[0, 0.4, -0.05], [0, 0.82, 0.38]], 0.015, fr), tube([[0, 0.78, 0.05], [0, 0.34, -0.5]], 0.012, fr));
    bike.add(rb(0.08, 0.04, 0.2, leather('#3a2a1e'), 0, 0.86, 0.02, 0.02), tube([[-0.2, 0.98, 0.45], [0, 0.94, 0.42], [0.2, 0.98, 0.45]], 0.011, C.black), cyl(0.01, 0.16, C.black, 0, 0.9, 0.42));
    bike.position.set(L + 0.18, 0, -0.55); bike.rotation.z = 0.06; g.add(bike);
    g.add(frame('back', 1.75, 1.55, 0.5, 0.7, art(['#1d1d1d', '#e8dcc6', '#b33b2a'], 'grid', 77), C.black));
    return { lights: [{ p: [L + 0.85, 1.45, 1.0], c: '#ffa64d', i: 2.02, d: 4 }], glows: [] };
  },

  // 아치 파우더룸 · 화장대 전구: 아치 거울을 둘러싼 전구, 벨벳 푸프, 선인장
  vanity(g, ctr, glow) {
    const oak = wood('#b48a62');
    g.add(rug(1.5, 1.5, rugTex('jute', ['#e6b3b0', '#d79a96'], 5), 0.35, 0.75, true));
    g.add(rb(1.25, 0.5, 0.5, oak, 0.2, 0.58, B + 0.27, 0.02));
    for (const x of [-0.3, 0.7]) g.add(box(0.04, 0.33, 0.04, C.brass, x, 0.165, B + 0.4));
    const top = new THREE.Mesh(meterBox(1.32, 0.04, 0.56), [ctr, ctr, ctr, C.cap, ctr, ctr]); top.position.set(0.2, 0.85, B + 0.28); shadowy(top); g.add(top);
    const sink = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#ffffff', 0.12, 0, { side: THREE.DoubleSide }));
    sink.position.set(0.2, 1.04, B + 0.3); shadowy(sink); g.add(sink);
    g.add(tube([[0.2, 1.3, B + 0.02], [0.2, 1.3, B + 0.15], [0.2, 1.24, B + 0.2]], 0.01, C.brass));
    // 아치 거울 + 전구
    const sh = new THREE.Shape(); const aw = 0.36, ah = 0.55;
    sh.moveTo(-aw, 0); sh.lineTo(-aw, ah); sh.absarc(0, ah, aw, Math.PI, 0, true); sh.lineTo(aw, 0); sh.lineTo(-aw, 0);
    const mg = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false });
    const mirror = new THREE.Mesh(mg, C.mirror); mirror.position.set(0.2, 1.25, B + 0.01); g.add(mirror);
    const fg = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }), C.brass); fg.scale.set(1.08, 1.06, 1); fg.position.set(0.2, 1.23, B + 0.004); g.add(fg);
    const bulbPts = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI - (i / 10) * Math.PI; bulbPts.push([Math.cos(a) * (aw + 0.1), ah + Math.sin(a) * (aw + 0.1)]); }
    for (const y of [0.1, 0.32]) bulbPts.push([-(aw + 0.1), y], [aw + 0.1, y]);
    bulbPts.forEach(([x, y]) => g.add(ball(0.028, glow, 0.2 + x, 1.25 + y, B + 0.05)));
    // 향수 선반
    g.add(box(0.7, 0.025, 0.14, oak, 1.4, 1.35, B + 0.07));
    [['#e7c7a8', 0.13], ['#bfd6cf', 0.09], ['#f0b7b3', 0.11]].forEach(([c, h], i) => g.add(cyl(0.03, h, glass(c, 0.55), 1.2 + i * 0.16, 1.362 + h / 2, B + 0.08, 20), cyl(0.012, 0.025, C.brass, 1.2 + i * 0.16, 1.375 + h, B + 0.08, 10)));
    // 수건 링
    const tr = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.008, 8, 40), C.brass); tr.position.set(L + 0.03, 1.15, 0.3); tr.rotation.y = Math.PI / 2; g.add(tr, rb(0.03, 0.4, 0.2, fabric('#f3ece3'), L + 0.05, 0.98, 0.3, 0.01));
    // 벨벳 푸프 + 선인장
    g.add(cyl(0.24, 0.38, velvet('#6b7a3c'), 0.25, 0.19, B + 0.95, 40));
    const pot = cyl(0.17, 0.3, M('#b5603e', 0.85), 1.45, 0.15, 0.5, 32, 0.13);
    const cact = M('#4f7a4b', 0.65);
    g.add(pot, cyl(0.075, 0.75, cact, 1.45, 0.65, 0.5, 20), ball(0.075, cact, 1.45, 1.02, 0.5), cyl(0.045, 0.25, cact, 1.55, 0.72, 0.5, 16), ball(0.045, cact, 1.55, 0.85, 0.5), tube([[1.45, 0.55, 0.5], [1.55, 0.58, 0.5], [1.55, 0.62, 0.5]], 0.045, cact));
    g.add(frame('left', -0.6, 1.55, 0.45, 0.6, art(['#f5e6dc', '#b5603e', '#6b7a3c'], 'arches', 15), C.brass));
    return { lights: [{ p: [0.2, 1.55, B + 0.45], c: '#ffc7a8', i: 1.8, d: 3.2 }], glows: [] };
  },
};

// 벽 아래 걸레받이 (벽 길이를 받아 랜딩의 긴 벽에도 맞춤)
function skirting(g, len) {
  const m = M('#f3f1ec', 0.5);
  g.add(box(len, 0.08, 0.016, m, L + len / 2, 0.04, B + 0.008), box(0.016, 0.08, len, m, L + 0.008, 0.04, B + len / 2));
}

// 가구 묶음 하나를 만들어 돌려줍니다.
// glowColor: 이 방 조명 색. 반환한 그룹의 userData에 조명 정보(lights · rect)와 빛나는 재질(glows)을 담습니다.
export function buildProps(kind, counterMat, { wallLen = S, glowColor = '#ffe2b0', glowIntensity = 2.2 } = {}) {
  const g = new THREE.Group();
  const glow = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: glowColor, emissiveIntensity: glowIntensity, roughness: 0.6 });
  const info = PROPS[kind](g, counterMat || C.white, glow) || {};
  skirting(g, wallLen);
  g.userData.lights = info.lights || [];
  g.userData.rect = info.rect || null;
  g.userData.glows = [glow, ...(info.glows || [])].map((m) => { m.userData.base = m.emissiveIntensity; return m; });
  return g;
}
