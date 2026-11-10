// 랜딩: 스크롤할 때마다 벽 전체 타일이 물결처럼 뒤집히며 자재가 바뀌고,
// 마지막에 가운데 타일 한 장이 벽에서 떨어져 나와 돌면서 질감을 보여 줍니다.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BY_ID, HERO_SEQUENCE } from './data.js';
import { getMaterial, manager } from './materials.js';

const section = document.getElementById('hero');
const canvas = document.getElementById('hero-gl');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#14120f');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.7;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

// ---------- 조명 ----------
const key = new THREE.DirectionalLight('#fff4e6', 2.6);
key.position.set(-2.4, 2.6, 4.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = key.shadow.camera.bottom = -2.2;
key.shadow.camera.right = key.shadow.camera.top = 2.2;
key.shadow.camera.near = 0.5; key.shadow.camera.far = 12;
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.015;
key.shadow.radius = 6;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight('#dfe8ff', 0.7);
rim.position.set(3, -1.5, 3);
scene.add(rim);
scene.add(new THREE.HemisphereLight('#f4efe6', '#2a241d', 0.35));

// ---------- 벽(타일 격자) ----------
const S = 0.6, T = 0.018, COLS = 23, ROWS = 17;
// 랜딩에서는 작은 타일을 크게 키워 보여 줍니다. (텍스처 이미지는 스튜디오와 같이 씁니다)
const HERO_ZOOM = { zellige_green: 2, navy_long: 2, sage_pattern: 1.5 };
const clones = [];
const mats = HERO_SEQUENCE.map((id) => {
  const base = getMaterial(BY_ID[id]);
  const z = HERO_ZOOM[id];
  const mat = base.mat.clone(); // 랜딩 전용 복제 (스튜디오 색에 영향 없게)
  if (!z) return { mat, side: base.side };
  ['map', 'normalMap', 'roughnessMap'].forEach((k) => {
    const t = base.mat[k].clone();
    t.repeat.divideScalar(z);
    clones.push(t);
    mat[k] = t;
  });
  return { mat, side: base.side };
});

// 뒤에 붙는 시멘트 바탕. 타일이 떨어지면 이 면이 드러납니다.
const backing = new THREE.Mesh(
  new THREE.PlaneGeometry(COLS * S + 2, ROWS * S + 2),
  new THREE.MeshStandardMaterial({ color: '#8d877d', roughness: 0.95 })
);
backing.position.z = -T / 2 - 0.004;
backing.receiveShadow = true;
scene.add(backing);

const tiles = [];
const maxDist = Math.hypot((COLS - 1) / 2, (ROWS - 1) / 2);
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const cx = (c - (COLS - 1) / 2) * S, cy = (r - (ROWS - 1) / 2) * S;
    const g = new THREE.BoxGeometry(S, S, T);
    const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const nz = nor.getZ(i);
      // 앞면·뒷면 UV를 벽 전체 좌표(m)로 잡아 이어진 한 장처럼 보이게 합니다.
      if (nz > 0.5) uv.setXY(i, cx + pos.getX(i), cy + pos.getY(i));
      else if (nz < -0.5) uv.setXY(i, cx - pos.getX(i), cy + pos.getY(i));
    }
    const mesh = new THREE.Mesh(g, [mats[0].side, mats[0].side, mats[0].side, mats[0].side, mats[0].mat, mats[1].mat]);
    mesh.position.set(cx, cy, 0);
    mesh.receiveShadow = true;
    const dc = c - (COLS - 1) / 2, dr = r - (ROWS - 1) / 2;
    const dist = Math.hypot(dc, dr) / maxDist;
    const j = () => Math.random() * 0.12;
    // 전환마다 물결 방향을 다르게: 대각선 → 가운데서 바깥 → 왼쪽에서 오른쪽 → 바깥에서 가운데
    mesh.userData = {
      cx, cy, center: c === (COLS - 1) / 2 && r === (ROWS - 1) / 2,
      delays: [
        ((c / (COLS - 1)) * 0.6 + ((ROWS - 1 - r) / (ROWS - 1)) * 0.4) * 0.5 + j(),
        dist * 0.5 + j(),
        (c / (COLS - 1)) * 0.5 + j(),
        (1 - dist) * 0.5 + j(),
      ],
    };
    scene.add(mesh);
    tiles.push(mesh);
  }
}
const target = tiles.find((t) => t.userData.center);
const targetMat = mats[mats.length - 1].mat.clone(); // 떨어져 나오는 타일만 밝게 유지
target.castShadow = true;

// ---------- 스크롤 구간 ----------
// 0~1 진행도를 구간으로 나눕니다.
const FLIPS = [[0.07, 0.2], [0.235, 0.365], [0.4, 0.53], [0.565, 0.695]];
const GAP = [0.7, 0.77], ZOOM = [0.7, 0.84], LIFT = [0.78, 0.97];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (p, [a, b]) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

let pTarget = 0, p = 0;
let mx = 0, my = 0, smx = 0, smy = 0;
addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

// 화면 비율에 따라 시작 거리와 마지막 거리를 정합니다.
let D0 = 10, D1 = 4, portrait = false;
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  portrait = camera.aspect < 0.9;
  const k = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const h0 = portrait ? 3.2 / camera.aspect : 4.0;
  const h1 = portrait ? 1.25 / camera.aspect : 1.95;
  D0 = h0 / k; D1 = h1 / k;
  camera.updateProjectionMatrix();
}
resize();
new ResizeObserver(resize).observe(canvas);

// ---------- 화면 글자 ----------
const intro = document.querySelector('.hero-intro');
const cap = document.querySelector('.hero-cap');
const fin = document.querySelector('.hero-final');
const dots = [...document.querySelectorAll('.hero-dots i')];
const capIdx = cap.querySelector('[data-cap="idx"]');
const capKo = cap.querySelector('[data-cap="ko"]');
const capEn = cap.querySelector('[data-cap="en"]');
const capSpec = cap.querySelector('[data-cap="spec"]');
let shown = -1;
function setCaption(i) {
  if (i === shown) return;
  shown = i;
  const m = BY_ID[HERO_SEQUENCE[i]];
  dots.forEach((d, k) => d.classList.toggle('on', k === i));
  const apply = () => {
    capIdx.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(HERO_SEQUENCE.length).padStart(2, '0');
    capKo.textContent = m.ko; capEn.textContent = m.en; capSpec.textContent = m.spec;
  };
  if (window.gsap) {
    gsap.timeline()
      .to(cap.querySelectorAll('.cap-swap'), { yPercent: -100, opacity: 0, duration: 0.25, ease: 'power2.in', stagger: 0.03 })
      .add(apply)
      .fromTo(cap.querySelectorAll('.cap-swap'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.04 });
  } else apply();
}
setCaption(0);

// ---------- 매 프레임 ----------
const clock = new THREE.Clock();
let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(section);

function frame() {
  requestAnimationFrame(frame);
  if (!visible) return;
  const t = clock.getElapsedTime();
  p += (pTarget - p) * (reduce ? 1 : 0.4);
  smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;

  const gap = ease(range(p, GAP));
  const lift = range(p, LIFT);

  for (const tile of tiles) {
    const { delays } = tile.userData;
    let F = 0;
    for (let j = 0; j < FLIPS.length; j++) {
      const lp = range(p, FLIPS[j]);
      F += ease(clamp((lp - delays[j]) / 0.38));
    }
    const k = Math.min(Math.floor(F), mats.length - 1);
    const f = F - k;
    const a = mats[k % 2 === 0 ? k : Math.min(k + 1, mats.length - 1)];
    const b = mats[k % 2 === 0 ? Math.min(k + 1, mats.length - 1) : k];
    const m = tile.material;
    m[4] = a.mat; m[5] = b.mat;
    const sideMat = mats[f < 0.5 ? k : Math.min(k + 1, mats.length - 1)].side;
    m[0] = m[1] = m[2] = m[3] = sideMat;

    const bump = Math.sin(f * Math.PI);
    const sc = (1 - bump * 0.07) * (1 - gap * 0.016);
    tile.scale.set(sc, sc, 1);
    tile.rotation.set(0, Math.PI * F, 0);
    tile.position.z = bump * 0.28;
    tile.castShadow = bump > 0.02 || tile === target;
  }

  // 가운데 타일이 벽에서 떨어져 나와 돌기
  const wallMat = mats[mats.length - 1].mat; // 나머지 벽은 살짝 어둡게
  wallMat.color.setScalar(1 - 0.62 * easeOut(lift));
  wallMat.envMapIntensity = targetMat.envMapIntensity * (1 - 0.7 * easeOut(lift));
  if (lift > 0) {
    const L = easeOut(lift);
    target.material[4] = target.material[5] = targetMat;
    target.position.z = L * 0.95;
    const idle = lift >= 1 && !reduce ? Math.sin(t * 0.7) * 0.18 : 0;
    target.rotation.y = Math.PI * 4 + ease(lift) * (Math.PI * 2 - 0.55) + idle;
    target.rotation.x = Math.sin(lift * Math.PI) * 0.35 + L * 0.28 + (lift >= 1 && !reduce ? Math.sin(t * 0.5) * 0.06 : 0);
    target.rotation.z = L * -0.06;
    const s = (1 - gap * 0.016) + L * 0.04;
    target.scale.set(s, s, 1);
  }

  // 카메라: 멀리서 벽 전체 → 타일 한 장 가까이
  const z = ease(range(p, ZOOM));
  const dist = THREE.MathUtils.lerp(D0, D1, z);
  const offX = portrait ? 0 : -0.42 * z; // 마지막 장면에서는 타일이 오른쪽, 글은 왼쪽
  const offY = portrait ? -0.3 * z : 0;
  camera.position.set(offX + smx * 0.35 * (1 - z * 0.5), offY - smy * 0.25, dist);
  camera.lookAt(offX + smx * 0.1, offY, 0);

  // 빛이 천천히 움직이며 유광 타일에 반사가 흐르게 합니다.
  key.position.x = -2.4 + (reduce ? 0 : Math.sin(t * 0.35) * 1.2);
  key.position.y = 2.6 + (reduce ? 0 : Math.cos(t * 0.27) * 0.6);

  // 글자
  intro.style.opacity = 1 - range(p, [0.02, 0.07]);
  intro.style.transform = `translateY(${-range(p, [0.02, 0.07]) * 40}px)`;
  const capOn = range(p, [0.05, 0.09]) * (1 - range(p, [0.7, 0.75]));
  cap.style.opacity = capOn;
  fin.style.opacity = range(p, [0.86, 0.93]);
  fin.style.transform = `translateY(${(1 - range(p, [0.86, 0.93])) * 30}px)`;
  fin.style.pointerEvents = p > 0.9 ? 'auto' : 'none';
  let idx = 0;
  FLIPS.forEach(([a, b], j) => { if (p > (a + b) / 2) idx = j + 1; });
  setCaption(idx);

  renderer.render(scene, camera);
}

// 스크롤 연결 (GSAP는 일반 스크립트로 먼저 로드됩니다)
function bindScroll() {
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => '+=' + innerHeight * 6,
    pin: true,
    scrub: true,
    refreshPriority: 1,
    onUpdate: (self) => { pTarget = self.progress; },
  });
}

manager.onProgress = (_, loaded, total) => {
  window.dispatchEvent(new CustomEvent('tessera:progress', { detail: loaded / total }));
};
manager.onLoad = () => {
  clones.forEach((t) => { t.needsUpdate = true; }); // 복제한 텍스처도 이미지가 들어왔다고 알려 줍니다
  // 텍스처를 미리 GPU에 올려 첫 전환 때 끊기지 않게 합니다.
  mats.forEach(({ mat }) => ['map', 'normalMap', 'roughnessMap'].forEach((k) => renderer.initTexture(mat[k])));
  renderer.compile(scene, camera);
  window.dispatchEvent(new Event('tessera:ready'));
};

bindScroll();
frame();
