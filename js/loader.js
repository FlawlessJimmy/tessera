// 로딩: 흩어진 자재 블록 26개가 실제 다운로드 진행률에 맞춰 하나씩 제자리를 찾아 큐브가 됩니다.
// 다 맞춰지면 큐브가 헤링본 면을 정면으로 돌려 세우고, 그 면으로 다가가며 랜딩의 헤링본 벽으로 이어집니다.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

window.__loaderAlive = true;
const root = document.querySelector('.loader');
const canvas = root.querySelector('.ld-gl');
const num = root.querySelector('.ld-num');
const bar = root.querySelector('.ld-bar i');
const nameBox = root.querySelector('.ld-name');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- 시간 곡선 ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const outQuart = (t) => 1 - Math.pow(1 - t, 4);
const outCubic = (t) => 1 - Math.pow(1 - t, 3);
const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const inOutQuint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2);
const inCubic = (t) => t * t * t;
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)); // 프레임 속도와 무관한 부드러운 따라가기

// ---------- 무대 ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
const cam = new THREE.PerspectiveCamera(28, 1, 0.05, 60);

const key = new THREE.DirectionalLight('#fff1df', 2.6);
key.position.set(-3.5, 4.5, 5);
const rim = new THREE.DirectionalLight('#cfdcff', 1.4);
rim.position.set(4, -1.5, -4);
const top = new THREE.DirectionalLight('#ffffff', 0.6);
top.position.set(0, 6, 0);
scene.add(key, rim, top, new THREE.HemisphereLight('#f3ece2', '#1a1612', 0.35));

// 큐브 아래 은은한 그림자 (맞춰질수록 짙어짐)
const shadowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(0,0,0,0.75)'); r.addColorStop(0.45, 'rgba(0,0,0,0.3)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
})();
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.55;
scene.add(shadow);

// ---------- 면마다 다른 자재 ----------
// 0:+x 1:-x 2:+y 3:-y 4:+z(정면 · 마지막에 화면을 채우는 면) 5:-z
const FACES = [
  { id: 'zellige_green', name: 'Zellige Green', rough: 0.22, coat: 1, nor: true },
  { id: 'sage_pattern', name: 'Sage Arch', rough: 0.62, coat: 0.15 },
  { id: 'terrazzo_white', name: 'Terrazzo Bianco', rough: 0.42, coat: 0.35, nor: true },
  { id: 'calacatta', name: 'Calacatta White', rough: 0.18, coat: 0.9 },
  { id: 'herringbone_parquet', name: 'Herringbone Oak', rough: 0.55, coat: 0.18, nor: true },
  { id: 'navy_long', name: 'Navy Long Subway', rough: 0.2, coat: 1, nor: true },
];
const tl = new THREE.TextureLoader();
let frontTex = null, frontNor = null;
let texLoaded = 0;
const bisque = new THREE.MeshPhysicalMaterial({ color: '#d8cfc1', roughness: 0.78, metalness: 0 }); // 타일 속살(소지) 색
const faceMats = FACES.map((f) => {
  const m = new THREE.MeshPhysicalMaterial({ color: '#d8cfc1', roughness: f.rough, clearcoat: f.coat, clearcoatRoughness: 0.25, metalness: 0 });
  tl.load(`assets/tex/${f.id}/diff.jpg?v=2`, (t) => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (f.id === 'herringbone_parquet') { t.wrapS = t.wrapT = THREE.RepeatWrapping; frontTex = t; frontSheet.material.map = t; frontSheet.material.needsUpdate = true; fitFront(); }
    m.map = t; m.color.set('#ffffff'); m.needsUpdate = true; texLoaded++;
  }, undefined, () => { texLoaded++; });
  if (f.nor) tl.load(`assets/tex/${f.id}/nor.jpg?v=2`, (t) => {
    if (f.id === 'herringbone_parquet') { t.wrapS = t.wrapT = THREE.RepeatWrapping; frontNor = t; frontSheet.material.normalMap = t; frontSheet.material.needsUpdate = true; fitFront(); }
    m.normalMap = t; m.normalScale.set(0.6, 0.6); m.needsUpdate = true;
  });
  return m;
});

// ---------- 블록 26개 ----------
const C = 0.5, GAP = 0.028, STEP = C + GAP, FULL = STEP * 3; // 블록 하나 50cm · 사이 2.8cm
const cube = new THREE.Group();
scene.add(cube);
const AX = [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]]; // 그룹 번호 → [축, 방향]

// 둥근 모서리 블록의 바깥 면 UV를 큐브 한 면 전체에 한 장으로 이어지게 잡습니다.
function cubieGeometry(home) {
  const g = new RoundedBoxGeometry(C, C, C, 4, 0.028);
  const pos = g.attributes.position, uv = g.attributes.uv, idx = g.index;
  g.groups.forEach((gr, gi) => {
    const [axis, sign] = AX[gi];
    for (let k = gr.start; k < gr.start + gr.count; k++) {
      const i = idx ? idx.getX(k) : k;
      const x = pos.getX(i) + home.x, y = pos.getY(i) + home.y, z = pos.getZ(i) + home.z;
      let u, v;
      if (axis === 0) { u = -sign * z; v = y; }
      else if (axis === 1) { u = x; v = -sign * z; }
      else { u = sign * x; v = y; }
      uv.setXY(i, u / FULL + 0.5, v / FULL + 0.5);
    }
  });
  return g;
}

// 마지막에 정면 9칸 위로 겹쳐지는 한 장짜리 헤링본 면 (이음매 없이 랜딩 벽으로 이어지게)
const frontSheet = new THREE.Mesh(new THREE.PlaneGeometry(FULL, FULL), new THREE.MeshStandardMaterial({ roughness: 0.55, transparent: true, opacity: 0, depthWrite: false }));
frontSheet.position.z = STEP + C / 2 + 0.004;
frontSheet.material.normalScale.set(0.6, 0.6);
cube.add(frontSheet);

const cubies = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
  if (!x && !y && !z) continue;
  const home = new THREE.Vector3(x * STEP, y * STEP, z * STEP);
  const outer = [x === 1, x === -1, y === 1, y === -1, z === 1, z === -1];
  const mesh = new THREE.Mesh(cubieGeometry(home), outer.map((o, i) => (o ? faceMats[i] : bisque)));
  // 흩어진 자리: 큐브 주변 넓은 껍질 위, 화면 가로로 더 넓게
  const dir = new THREE.Vector3().randomDirection();
  dir.x *= 1.6; dir.y *= 0.9;
  const from = dir.normalize().multiplyScalar(THREE.MathUtils.randFloat(3.2, 5.4));
  const outward = home.clone().normalize();
  const faces = outer.map((o, i) => (o ? i : -1)).filter((i) => i >= 0);
  mesh.userData = {
    home, from, outward,
    q0: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6.3, Math.random() * 6.3, Math.random() * 6.3)),
    spin: new THREE.Vector3().randomDirection().multiplyScalar(THREE.MathUtils.randFloat(0.25, 0.6)),
    phase: Math.random() * 6.3,
    face: faces[Math.floor(Math.random() * faces.length)],
    start: -1, // 출발 시각 (아직 출발 전)
    dist: Math.abs(x) + Math.abs(y) + Math.abs(z),
  };
  mesh.scale.setScalar(0.001);
  cube.add(mesh);
  cubies.push(mesh);
}
// 도착 순서: 면 가운데 → 모서리 → 꼭짓점, 같은 단계 안에서는 섞어서
const order = [...cubies].sort((a, b) => a.userData.dist - b.userData.dist || Math.random() - 0.5);
const FLIGHT = 1.15;

// ---------- 진행률 ----------
let real = 0, shown = 0, landed = 0, lastLand = 0;
addEventListener('tessera:progress', (e) => { real = Math.max(real, e.detail * 0.97); });
addEventListener('tessera:ready', () => { real = 1; });
setTimeout(() => { real = 1; }, 8000); // 네트워크가 느려도 8초 뒤에는 마무리

let lastName = 0;
function setName(t, force) {
  const now = performance.now();
  if (!force && now - lastName < 260) return;
  lastName = now;
  while (nameBox.children.length > 1) nameBox.firstElementChild.remove();
  const old = nameBox.firstElementChild;
  const b = document.createElement('b'); b.textContent = t; nameBox.appendChild(b);
  b.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
  if (old) old.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' }).onfinish = () => old.remove();
}

// ---------- 크기 ----------
let dist0 = 8;
// 헤링본 면의 무늬 크기를 랜딩 벽과 똑같이 맞춰, 마지막에 겹쳐 사라질 때 이음매가 보이지 않게 합니다.
function fitFront() {
  if (!frontTex) return;
  const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  const faceZ = STEP + C / 2;
  const dd = Math.min(FULL / 2 / tan, FULL / 2 / (tan * cam.aspect)) * 0.82;
  const visW = 2 * dd * tan * cam.aspect;
  const heroW = cam.aspect < 0.9 ? 3.2 : 4.0 * cam.aspect; // 랜딩 첫 화면에 보이는 벽 폭(m)
  const r = (heroW / 3.4) * (FULL / visW);
  frontTex.repeat.set(r, r);
  frontTex.offset.set(-0.5 * r, -0.5 * r);
  if (frontNor) { frontNor.repeat.copy(frontTex.repeat); frontNor.offset.copy(frontTex.offset); }
}
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  cam.aspect = w / h;
  const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  // 큐브(대각선 약 2.8)가 화면 높이의 절반 남짓, 세로 화면에서는 폭의 70%를 차지하도록
  dist0 = Math.max(2.9 / tan / 2 / 0.55, 2.9 / (tan * cam.aspect) / 2 / 0.72);
  cam.updateProjectionMatrix();
  fitFront();
}
resize();
addEventListener('resize', resize);

// ---------- 매 프레임 ----------
let t = 0, started = false, t0 = 0, exitT = -1, finished = false, revealed = false;
let mx = 0, my = 0, smx = 0, smy = 0;
addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
const idleQ = new THREE.Quaternion(), exitQ0 = new THREE.Quaternion(), I = new THREE.Quaternion(), tmpE = new THREE.Euler();
const v1 = new THREE.Vector3(), ctrl = new THREE.Vector3();
let yaw = -0.6, yawVel = 0.32;
const clock = new THREE.Clock();

function frame() {
  if (finished) return;
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 1 / 30);
  t += dt;

  // 면 텍스처가 준비되면 시작 (보통 1초 안)
  if (!started && (texLoaded >= FACES.length || t > 2.5)) { started = true; t0 = t; }
  const life = started ? t - t0 : 0;

  // 표시 진행률: 실제 진행률을 넘지 않고, 너무 빨라도 최소 2.6초는 보여 줍니다
  const target = Math.min(real, life / 2.6);
  shown = damp(shown, target, 3.2, dt);
  if (real === 1 && life > 2.6 && shown > 0.996) shown = 1;
  num.textContent = Math.round(shown * 100);
  bar.style.transform = `scaleX(${shown})`;

  // 진행률이 문턱을 넘은 블록부터 출발
  order.forEach((m, i) => {
    if (m.userData.start === -1 && started && shown >= (i / order.length) * 0.96) m.userData.start = t;
  });

  smx = damp(smx, mx, 2.5, dt); smy = damp(smy, my, 2.5, dt);

  // 큐브 전체가 천천히 돌며 숨 쉬듯 기울어집니다
  yaw += yawVel * dt;
  tmpE.set(0.42 + Math.sin(t * 0.5) * 0.06 + smy * 0.25, yaw + smx * 0.5, Math.sin(t * 0.37) * 0.03, 'YXZ');
  idleQ.setFromEuler(tmpE);

  let e = 0;
  if (exitT >= 0) e = clamp((t - exitT) / 2.3);
  if (exitT < 0) cube.quaternion.copy(idleQ);
  else {
    // 헤링본 면(+z)이 정면을 보도록 돌려 세웁니다
    cube.quaternion.slerpQuaternions(exitQ0, I, inOutQuint(clamp(e / 0.62)));
  }

  let all = 0;
  cubies.forEach((m) => {
    const u = m.userData;
    if (u.start === -1) {
      // 출발 전: 제자리 근처에서 둥둥 떠다님
      const s = clamp(life / 0.9);
      m.scale.setScalar(Math.max(0.001, outCubic(s) * 0.92));
      m.position.copy(u.from).addScaledVector(u.outward, Math.sin(t * 0.8 + u.phase) * 0.12);
      m.position.y += Math.sin(t * 0.6 + u.phase * 1.7) * 0.14;
      m.quaternion.copy(u.q0);
      m.rotateOnAxis(v1.copy(u.spin).normalize(), t * u.spin.length());
      return;
    }
    const k = clamp((t - u.start) / FLIGHT);
    if (k >= 1) all++;
    if (k >= 1 && !u.landed) { u.landed = true; landed++; lastLand = t; setName(FACES[u.face].name, landed === cubies.length); }
    // 곡선으로 날아와(바깥쪽으로 크게 휘어) 제자리에 착
    const p = outQuart(k);
    if (!u.p0) { u.p0 = m.position.clone(); u.r0 = m.quaternion.clone(); }
    ctrl.copy(u.p0).add(u.home).multiplyScalar(0.5).addScaledVector(u.outward, 1.6);
    const a = 1 - p;
    m.position.set(
      a * a * u.p0.x + 2 * a * p * ctrl.x + p * p * u.home.x,
      a * a * u.p0.y + 2 * a * p * ctrl.y + p * p * u.home.y,
      a * a * u.p0.z + 2 * a * p * ctrl.z + p * p * u.home.z);
    // 끼워지는 순간 살짝 눌렸다 자리 잡는 느낌
    const seat = Math.sin(clamp((k - 0.78) / 0.22) * Math.PI) * 0.035;
    m.position.addScaledVector(u.outward, -seat);
    m.quaternion.slerpQuaternions(u.r0, I, outCubic(clamp(k / 0.85)));
    m.scale.setScalar(THREE.MathUtils.lerp(0.92, 1, outCubic(k)));
    // 마지막에 정면 블록끼리 틈을 닫아 한 장의 바닥처럼 만듭니다
    if (e > 0 && u.home.z > 0.1) {
      const c = inOutCubic(clamp((e - 0.3) / 0.35));
      const sc = THREE.MathUtils.lerp(1, STEP / C + 0.004, c);
      m.scale.set(sc, sc, 1);
    }
  });

  frontSheet.material.opacity = inOutCubic(clamp((e - 0.56) / 0.2));
  shadow.material.opacity = damp(shadow.material.opacity, 0.55 * (all / cubies.length) * (1 - e), 4, dt);

  // 다 맞춰지면 잠깐 숨 고르고 마무리 시작
  if (exitT < 0 && all === cubies.length && shown >= 1 && t - lastLand > 0.45) {
    exitT = t; exitQ0.copy(cube.quaternion);
    root.classList.add('is-done');
    yawVel = 0;
  }

  // 카메라: 평소엔 살짝 위에서, 마무리 때는 헤링본 면으로 다가갑니다
  const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  const faceZ = STEP + C / 2;
  const fill = faceZ + Math.min(FULL / 2 / tan, FULL / 2 / (tan * cam.aspect)) * 0.82; // 면이 화면을 꽉 채우는 거리
  const push = inOutCubic(clamp((e - 0.3) / 0.5));
  const z = THREE.MathUtils.lerp(dist0, fill, push);
  cam.position.set(smx * 0.4 * (1 - push), THREE.MathUtils.lerp(0.55, 0, clamp(e / 0.6)) - smy * 0.25 * (1 - push), z);
  cam.lookAt(0, THREE.MathUtils.lerp(-0.05, 0, clamp(e / 0.6)), 0);

  // 빛이 천천히 돌며 유광 면에 반사가 흐릅니다
  key.position.set(-3.5 + Math.sin(t * 0.45) * 1.8, 4.5 + Math.cos(t * 0.3) * 0.8, 5);

  // 글자는 먼저 비켜 주고, 마지막에 화면 전체가 걷히며 랜딩이 드러납니다
  if (e > 0) {
    root.style.setProperty('--ui', String(1 - clamp(e / 0.25)));
    root.style.opacity = String(1 - inCubic(clamp((e - 0.82) / 0.18)));
    if (!revealed && e > 0.78) { revealed = true; window.tesseraReveal?.(); }
    if (e >= 1) { finish(); return; }
  }
  renderer.render(scene, cam);
}

function finish() {
  finished = true;
  root.remove();
  renderer.dispose();
  pmrem.dispose();
}

if (reduce) {
  // 움직임 줄이기 설정이면 큐브를 완성된 상태로 짧게 보여 주고 넘어갑니다
  cubies.forEach((m) => { m.userData.start = -10; });
}
frame();
