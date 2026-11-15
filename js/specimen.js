// 자재 한 점을 크게 띄워 천천히 돌리는 3D 뷰어
// 벽돌은 사진에서 벽돌 한 장을 잘라 낸 실물 크기 비율, 벽지는 풀려 나온 롤, 나머지는 쇼룸 샘플판입니다.
// 드래그하면 좌우 360°, 위아래는 살짝 돌아가고, 손을 떼면 잠시 뒤 다시 천천히 돕니다.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { texPath } from './data.js';

// 벽돌은 4k 원본 사진에서 벽돌 한 장만 잘라 둔 one-diff / one-nor / one-rough 를 씁니다.
// 샘플판 크기 (mm): 가로 · 세로 · 두께
const BOARD = {
  tile: [300, 300, 10],
  floor: [600, 280, 15],
  paint: [300, 300, 12],
  stone: [300, 300, 20],
  panel: [280, 380, 18],
};
const GLOSS = { zellige_green: 0.35, glaze_mustard: 0.4, navy_long: 0.35, pink_stack: 0.4, white_wave: 0.35, ribbed_red: 0.45, marble_beige: 0.45, calacatta: 0.4, nero_marquina: 0.35, quartz_grey: 0.55 };

const loader = new THREE.TextureLoader();
function tex(id, map, srgb, setup) {
  return new Promise((res) => {
    loader.load(map.startsWith('one-') ? `assets/tex/${id}/${map}.jpg?v=1` : texPath(id, map), (t) => {
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setup(t);
      res(t);
    }, undefined, () => res(null));
  });
}
async function maps(id, setup, pre = '') {
  const [map, normalMap, roughnessMap] = await Promise.all([tex(id, pre + 'diff', true, setup), tex(id, pre + 'nor', false, setup), tex(id, pre + 'rough', false, setup)]);
  return { map, normalMap, roughnessMap };
}
const repeat = (rx, ry) => (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); };

function surfaceMat(m, mp, extra = {}) {
  const g = GLOSS[m.id];
  return new THREE.MeshStandardMaterial({
    ...mp,
    roughness: g ? g / 0.5 : 1,
    metalness: 0,
    envMapIntensity: g ? 1.1 : 0.6,
    normalScale: new THREE.Vector2(m.cat === 'wallpaper' || m.cat === 'paint' ? 0.8 : 1, m.cat === 'wallpaper' || m.cat === 'paint' ? 0.8 : 1),
    ...extra,
  });
}

// ---------- 모양 만들기 ----------
async function makeBrick(m) {
  const mp = await maps(m.id, (t) => { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; }, 'one-');
  const mat = surfaceMat(m, mp);
  // 190 × 57 × 90mm 비율
  const geo = new RoundedBoxGeometry(2.6, 0.78, 1.23, 4, 0.06);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  const g = new THREE.Group();
  g.add(mesh);
  g.userData.dispose = [geo, mat, ...Object.values(mp)];
  return g;
}

async function makeBoard(m) {
  const [w, h, d] = BOARD[m.cat] || BOARD.tile;
  const k = (m.cat === 'floor' ? 3.1 : 2.25) / Math.max(w, h); // 화면 단위
  const W = w * k, H = h * k, D = Math.max(d * k, 0.06);
  const mp = await maps(m.id, repeat(w / m.dim, h / m.dim));
  const face = surfaceMat(m, mp);
  // 석재는 통돌이라 옆면도 같은 결, 나머지는 바탕색
  let sideMp = null;
  if (m.cat === 'stone') sideMp = await maps(m.id, repeat(w / m.dim, (d * 3) / m.dim));
  const side = sideMp ? surfaceMat(m, sideMp) : new THREE.MeshStandardMaterial({ color: m.side || '#8a8580', roughness: 0.8, envMapIntensity: 0.5 });
  const geo = new RoundedBoxGeometry(W, H, D, 3, Math.min(0.025, D * 0.3));
  // 면 순서: +x, -x, +y, -y, +z(앞), -z(뒤)
  const mesh = new THREE.Mesh(geo, [side, side, side, side, face, face]);
  mesh.castShadow = true;
  const g = new THREE.Group();
  g.add(mesh);
  g.userData.dispose = [geo, face, side, ...Object.values(mp), ...(sideMp ? Object.values(sideMp) : [])];
  return g;
}

async function makeRoll(m) {
  // 폭 1,060mm 롤 → 높이 2.4
  const k = 2.4 / 1060, R = 0.42, Hh = 2.4, L = 1.45;
  const mp = await maps(m.id, (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });
  const mk = (rx, ry) => {
    const o = {};
    for (const [key, t] of Object.entries(mp)) { if (!t) continue; const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); o[key] = c; }
    return o;
  };
  const rollMp = mk((2 * Math.PI * R) / k / m.dim, Hh / k / m.dim);
  const sheetMp = mk(L / k / m.dim, Hh / k / m.dim);
  const rollMat = surfaceMat(m, rollMp);
  const sheetMat = surfaceMat(m, sheetMp, { side: THREE.FrontSide });
  const paper = new THREE.MeshStandardMaterial({ color: '#f1eee8', roughness: 0.9, side: THREE.BackSide });
  const cap = new THREE.MeshStandardMaterial({ color: '#efeae2', roughness: 0.85 });
  const core = new THREE.MeshStandardMaterial({ color: '#b39b78', roughness: 0.9 });

  const g = new THREE.Group();
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Hh, 64, 1, true), rollMat);
  roll.castShadow = true;
  g.add(roll);
  for (const s of [1, -1]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.08, R, 48), cap);
    ring.rotation.x = -s * Math.PI / 2; ring.position.y = s * Hh / 2;
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.08, 24), core);
    hole.rotation.x = -s * Math.PI / 2; hole.position.y = s * (Hh / 2 - 0.02);
    g.add(ring, hole);
  }
  // 롤 앞쪽에서 풀려 나와 살짝 휘어진 한 폭
  const seg = 48;
  const sg = new THREE.PlaneGeometry(L, Hh, seg, 1);
  const pos = sg.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + L / 2; // 0 → L
    const t = x / L;
    pos.setX(i, x);
    pos.setZ(i, R - 0.02 + Math.sin(t * Math.PI) * 0.16 - t * 0.1);
  }
  sg.computeVertexNormals();
  const sheet = new THREE.Mesh(sg, sheetMat);
  const back = new THREE.Mesh(sg, paper);
  sheet.castShadow = true;
  const sheetG = new THREE.Group();
  sheetG.add(sheet, back);
  sheetG.position.x = 0.02;
  g.add(sheetG);
  g.position.x = -L / 2 + R / 2;
  const wrap = new THREE.Group();
  wrap.add(g);
  wrap.userData.dispose = [roll.geometry, sg, rollMat, sheetMat, paper, cap, core, ...Object.values(rollMp), ...Object.values(sheetMp), ...Object.values(mp)];
  return wrap;
}

const BUILD = { brick: makeBrick, wallpaper: makeRoll };

// ---------- 뷰어 ----------
export function mountSpecimen(box, { onGrab } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'sp3d';
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.55, 7.4);
  camera.lookAt(0, 0, 0);

  const key = new THREE.DirectionalLight('#fff4e6', 2.6);
  key.position.set(-1.6, 7, 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -3;
  key.shadow.camera.right = key.shadow.camera.top = 3;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  const rim = new THREE.DirectionalLight('#cfe0ff', 1.3);
  rim.position.set(4, 2, -4);
  const fill = new THREE.HemisphereLight('#ffffff', '#2a2622', 0.45);
  scene.add(key, rim, fill);

  // 바닥 그림자: 물체 아래에 부드럽게 퍼지는 원형 그림자 (돌아도 자연스럽게)
  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const sx = sc.getContext('2d');
  const grd = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,0.62)');
  grd.addColorStop(0.45, 'rgba(0,0,0,0.3)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  sx.fillStyle = grd;
  sx.fillRect(0, 0, 128, 128);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2;
  ground.scale.set(3, 1.4, 1);
  scene.add(ground);

  // 돌아가는 받침: pivot(드래그 회전) > holder(바꿀 때 들고 나는 동작) > 자재
  const pivot = new THREE.Group();
  const holder = new THREE.Group();
  pivot.add(holder);
  scene.add(pivot);

  let current = null, token = 0, zoom = 1, zoomTo = 1;
  let rotY = -0.5, rotX = 0.08, vel = 0, lastUser = -1e9, dragging = false, visible = false, raf = 0;
  const AUTO = 0.32; // 초당 회전 (라디안)

  function size() {
    const w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(box);
  size();

  async function show(m) {
    const my = ++token;
    const obj = await (BUILD[m.cat] || makeBoard)(m);
    if (my !== token) { obj.userData.dispose?.forEach((x) => x?.dispose?.()); return; }
    // 바닥에 그림자가 닿게 높이를 맞춥니다.
    const bb = new THREE.Box3().setFromObject(obj);
    const old = current;
    current = obj;
    const swapIn = () => {
      if (old) { holder.remove(old); old.userData.dispose?.forEach((x) => x?.dispose?.()); }
      holder.add(obj);
      const hh = (bb.max.y - bb.min.y) / 2, ww = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
      ground.position.y = -0.1 - hh - 0.42; // 살짝 떠 있는 높이
      ground.scale.set(ww * 1.25, ww * 0.6, 1);
      holder.position.y = -0.1;
      obj.position.y = -(bb.min.y + bb.max.y) / 2;
      if (!window.gsap) return;
      gsap.fromTo(holder.scale, { x: 0.6, y: 0.6, z: 0.6 }, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'expo.out' });
      gsap.fromTo(holder.rotation, { y: -1.2 }, { y: 0, duration: 1.3, ease: 'expo.out' });
      gsap.fromTo(holder.position, { y: 0.5 }, { y: -0.1, duration: 0.9, ease: 'expo.out' });
    };
    if (old && window.gsap) {
      gsap.to(holder.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.32, ease: 'power2.in', onComplete: () => { if (my === token) swapIn(); } });
    } else swapIn();
    kick();
  }

  // ---------- 드래그 ----------
  const el = renderer.domElement;
  let px = 0, py = 0, lastX = 0, lastT = 0;
  el.addEventListener('pointerdown', (e) => {
    dragging = true; px = lastX = e.clientX; py = e.clientY; lastT = performance.now(); vel = 0;
    el.setPointerCapture(e.pointerId);
    box.classList.add('is-grab');
    onGrab?.();
    kick();
  });
  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    rotY += dx * 0.011;
    rotX = Math.max(-0.45, Math.min(0.6, rotX + dy * 0.006));
    const now = performance.now();
    vel = ((e.clientX - lastX) * 0.011) / Math.max(1, now - lastT) * 1000;
    lastX = e.clientX; lastT = now;
    lastUser = now;
  });
  const up = () => { if (!dragging) return; dragging = false; lastUser = performance.now(); box.classList.remove('is-grab'); };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('dblclick', () => setZoom(zoomTo > 1 ? 1 : 1.7));

  function setZoom(z) { zoomTo = z; box.classList.toggle('is-zoom', z > 1); kick(); }

  // ---------- 그리기 ----------
  let prev = performance.now();
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    if (!dragging) {
      if (Math.abs(vel) > 0.02) { rotY += vel * dt; vel *= Math.pow(0.04, dt); } // 놓은 뒤 미끄러짐
      else if (now - lastUser > 2200) rotY += AUTO * dt; // 잠시 뒤 다시 천천히
      rotX += (0.08 - rotX) * Math.min(1, dt * (now - lastUser > 2200 ? 1.2 : 0));
    }
    pivot.rotation.y = rotY;
    pivot.rotation.x = rotX;
    zoom += (zoomTo - zoom) * Math.min(1, dt * 6);
    camera.position.set(0, 0.55 / zoom, 7.4 / zoom);
    camera.lookAt(0, -0.1, 0);
    renderer.render(scene, camera);
    if (visible) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(frame); } }

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  }).observe(box);

  return { show, setZoom, get zoomed() { return zoomTo > 1; } };
}
