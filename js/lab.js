// 로딩 시안 5종을 한 페이지에서 번갈아 보는 시험장
// 진행률은 실제 다운로드 대신 4.5초 동안 0→100%로 흉내 냅니다.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BY_ID } from './data.js';
import { getMaterial } from './materials.js';

const M = (id) => getMaterial(BY_ID[id]).mat;
const SIDE = (id) => getMaterial(BY_ID[id]).side;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const back = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const bounce = (t) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; };
const rnd = (a, b) => a + Math.random() * (b - a);

// 상자 면 UV를 m 단위(+위치 보정)로: 자재가 실제 크기 비율로 이어지게 합니다.
function box(w, h, d, o = [0, 0, 0]) {
  const g = new THREE.BoxGeometry(w, h, d);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + o[0], y = p.getY(i) + o[1], z = p.getZ(i) + o[2];
    if (Math.abs(n.getX(i)) > 0.5) uv.setXY(i, z * Math.sign(n.getX(i)), y);
    else if (Math.abs(n.getY(i)) > 0.5) uv.setXY(i, x, -z * Math.sign(n.getY(i)));
    else uv.setXY(i, x * Math.sign(n.getZ(i)), y);
  }
  return g;
}
const cap = new THREE.MeshStandardMaterial({ color: '#f1ede6', roughness: 0.85 });
const core = new THREE.MeshStandardMaterial({ color: '#cfc6b8', roughness: 0.8 });
const fabric = new THREE.MeshStandardMaterial({ color: '#d8cfc1', roughness: 0.95 });
const wood = new THREE.MeshStandardMaterial({ color: '#a77f5c', roughness: 0.6 });
const leaf = new THREE.MeshStandardMaterial({ color: '#7b8c68', roughness: 0.9 });
const rust = new THREE.MeshStandardMaterial({ color: '#b4573a', roughness: 0.8 });
const dark = new THREE.MeshStandardMaterial({ color: '#2e2a26', roughness: 0.5 });
const glow = new THREE.MeshStandardMaterial({ color: '#fff3dc', emissive: '#ffd9a0', emissiveIntensity: 2 });

// ---------- 공통 무대 ----------
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const ENV = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const BG = new THREE.Color('#12100d');

function stage(fov = 32) {
  const scene = new THREE.Scene();
  scene.background = BG;
  scene.environment = ENV;
  scene.environmentIntensity = 0.5;
  const cam = new THREE.PerspectiveCamera(fov, 1, 0.05, 100);
  cam.userData.fov = fov;
  return { scene, cam };
}
function keyLight(scene, pos, int = 2.6, size = 4) {
  const l = new THREE.DirectionalLight('#fff2e2', int);
  l.position.set(...pos);
  l.castShadow = true;
  l.shadow.mapSize.set(2048, 2048);
  Object.assign(l.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 0.5, far: 40 });
  l.shadow.bias = -0.0004; l.shadow.normalBias = 0.02; l.shadow.radius = 5;
  scene.add(l, l.target);
  return l;
}
function shadowFloor(scene, y = 0, op = 0.35) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: op }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m);
  return m;
}
const rb = (w, h, d, mat, r = 0.04) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), mat); m.castShadow = m.receiveShadow = true; return m; };

// =====================================================================
// 01 타일 시공: 빈 바닥에 타일이 한 장씩 떨어져 깔리고, 다 깔리면 바닥이 일어나 벽이 됩니다.
// =====================================================================
function sceneTiles() {
  const { scene, cam } = stage(30);
  keyLight(scene, [3, 7, 4], 2.4, 4);
  scene.add(new THREE.HemisphereLight('#f4efe6', '#2a241d', 0.35));
  const g = new THREE.Group(); scene.add(g);
  const N = 7, S = 0.6, half = (N * S) / 2;
  const base = new THREE.Mesh(box(N * S + 0.12, 0.06, N * S + 0.12), M('concrete_wall_008'));
  base.position.y = -0.03; base.receiveShadow = true; g.add(base);
  const tiles = [];
  const list = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) list.push([r, c]);
  // 깔리는 순서: 시공하듯 안쪽 모서리부터 대각선으로
  list.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[1] - b[1]);
  list.forEach(([r, c], k) => {
    const x = -half + S / 2 + c * S, z = -half + S / 2 + r * S;
    const m = new THREE.Mesh(box(S * 0.975, 0.025, S * 0.975, [x, 0, z]), [SIDE('terrazzo_white'), SIDE('terrazzo_white'), M('terrazzo_white'), SIDE('terrazzo_white'), SIDE('terrazzo_white'), SIDE('terrazzo_white')]);
    m.castShadow = m.receiveShadow = true;
    m.userData = { x, z, start: (k / list.length) * 0.9, spin: rnd(-0.9, 0.9), tilt: rnd(-0.5, 0.5) };
    g.add(m); tiles.push(m);
  });
  return {
    scene, cam, label: 'Laying tiles', title: 'Tile by tile',
    desc: '빈 바닥에 테라조 타일이 한 장씩 깔리고, 다 깔리면 바닥이 일어나 랜딩의 타일 벽이 됩니다.',
    update(p, e, t) {
      tiles.forEach((m) => {
        const q = seg(p, m.userData.start, m.userData.start + 0.09);
        m.visible = q > 0;
        const d = 1 - eout(q);
        m.position.set(m.userData.x, 0.0125 + d * 1.6, m.userData.z);
        m.rotation.set(d * m.userData.tilt, d * m.userData.spin, 0);
      });
      const k = eio(e);
      g.rotation.x = k * Math.PI / 2;
      g.rotation.y = (1 - k) * -0.25;
      g.scale.setScalar(1 + k * 0.9);
      cam.position.set(Math.sin(t * 0.2) * 0.3 * (1 - k), THREE.MathUtils.lerp(6.4, 0, k), THREE.MathUtils.lerp(7.2, 7.4, k));
      cam.lookAt(0, 0, 0);
    },
  };
}

// =====================================================================
// 02 조립되는 집 모형: 바닥 → 벽지 → 타일 벽 → 조명 → 가구 순서로 방이 완성됩니다.
// =====================================================================
function sceneRoom() {
  const { scene, cam } = stage(28);
  keyLight(scene, [5, 8, 6], 2.4, 4);
  scene.add(new THREE.HemisphereLight('#f6f2ea', '#3a3128', 0.6));
  shadowFloor(scene, -0.6, 0.25);
  const root = new THREE.Group(); scene.add(root);
  const S = 3, H = 2.2, T = 0.12;
  const floor = new THREE.Mesh(box(S, 0.16, S), [cap, cap, M('herringbone_parquet'), cap, cap, cap]);
  floor.castShadow = floor.receiveShadow = true;
  const left = new THREE.Mesh(box(T, H, S), [M('arch_terracotta'), cap, cap, cap, cap, cap]);
  left.castShadow = left.receiveShadow = true;
  const pivot = new THREE.Group(); pivot.position.set(0, 0, -S / 2 - T / 2);
  const backW = new THREE.Mesh(box(S + T, H, T), [cap, cap, cap, cap, M('zellige_green'), cap]);
  backW.position.set(-T / 2, H / 2, 0); backW.castShadow = backW.receiveShadow = true; pivot.add(backW);
  root.add(floor, left, pivot);
  // 걸레받이 · 조명
  const trims = new THREE.Group();
  const bb1 = rb(S, 0.08, 0.02, cap, 0.005); bb1.position.set(0, 0.04, -S / 2 + 0.01);
  const bb2 = rb(0.02, 0.08, S, cap, 0.005); bb2.position.set(-S / 2 + 0.01, 0.04, 0);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.7, 6), dark); cord.position.set(0.2, H - 0.35, -0.2);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.2, 32, 1, true), dark); shade.position.set(0.2, H - 0.75, -0.2);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), glow); bulb.position.set(0.2, H - 0.8, -0.2);
  const lamp = new THREE.PointLight('#ffd9a0', 0, 4, 1.6); lamp.position.set(0.2, H - 0.9, -0.2);
  trims.add(bb1, bb2, cord, shade, bulb, lamp);
  root.add(trims);
  // 가구
  const furn = [];
  const add = (m, x, y, z) => { m.position.set(x, y, z); m.userData.home = m.position.clone(); root.add(m); furn.push(m); };
  add(rb(1.9, 0.02, 1.3, new THREE.MeshStandardMaterial({ color: '#cfc5b4', roughness: 1 }), 0.005), 0.25, 0.09, 0.25);
  const sofa = new THREE.Group();
  [[0.8, 0.36, 1.9, 0, 0.18, 0], [0.22, 0.42, 1.9, -0.29, 0.52, 0], [0.8, 0.48, 0.2, 0, 0.24, 0.95], [0.8, 0.48, 0.2, 0, 0.24, -0.95]].forEach(([w, h, d, x, y, z]) => { const m = rb(w, h, d, fabric); m.position.set(x, y, z); sofa.add(m); });
  add(sofa, -S / 2 + 0.5, 0.08, 0.2);
  const table = new THREE.Group(); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 40), wood); top.position.y = 0.34; top.castShadow = true;
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.32, 16), dark); leg.position.y = 0.16; leg.castShadow = true; table.add(top, leg);
  add(table, 0.45, 0.08, 0.3);
  const plant = new THREE.Group(); const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.32, 24), rust); pot.position.y = 0.16;
  const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), leaf); b1.position.y = 0.55; const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), leaf); b2.position.set(0.1, 0.82, 0.05);
  [pot, b1, b2].forEach((m) => { m.castShadow = true; plant.add(m); });
  add(plant, 1.1, 0.08, -1.05);
  return {
    scene, cam, label: 'Building your room', title: 'Room, assembled',
    desc: '바닥재가 깔리고 벽지와 타일 벽이 붙은 뒤, 조명과 가구가 들어와 방 하나가 완성됩니다.',
    update(p, e, t) {
      const a = eout(seg(p, 0.0, 0.2)), b = bounce(seg(p, 0.2, 0.4)), c = eio(seg(p, 0.4, 0.6)), d = seg(p, 0.6, 0.72);
      floor.position.y = -0.08 - (1 - a) * 3; floor.rotation.y = (1 - a) * 0.6;
      left.position.set(-S / 2 - T / 2, H / 2 + (1 - b) * 4, 0); left.visible = p > 0.2;
      pivot.rotation.x = (1 - c) * -Math.PI / 2; pivot.visible = p > 0.4;
      trims.scale.set(1, Math.max(0.001, eout(d)), 1); trims.visible = p > 0.6;
      lamp.intensity = eout(d) * 2.5;
      furn.forEach((m, i) => {
        const q = seg(p, 0.72 + i * 0.05, 0.84 + i * 0.05);
        m.visible = q > 0;
        m.scale.setScalar(Math.max(0.001, back(q)));
        m.position.y = m.userData.home.y + (1 - eout(q)) * 0.8;
      });
      const k = eio(e);
      root.rotation.y = THREE.MathUtils.lerp(-0.25 + Math.sin(t * 0.35) * 0.35, 0, k);
      cam.position.lerpVectors(new THREE.Vector3(7.5, 6, 7.5), new THREE.Vector3(1.4, 1.25, 1.9), k);
      cam.lookAt(THREE.MathUtils.lerp(0, -0.3, k), THREE.MathUtils.lerp(0.7, 1.05, k), THREE.MathUtils.lerp(0, -1.4, k));
    },
  };
}

// =====================================================================
// 03 쌓이는 샘플 칩: 쇼룸 샘플이 하나씩 떨어져 탑처럼 쌓이고, 마지막 한 장 위로 내려가 화면을 채웁니다.
// =====================================================================
function sceneStack() {
  const { scene, cam } = stage(30);
  const key = keyLight(scene, [3, 8, 4], 2.6, 3);
  scene.add(new THREE.HemisphereLight('#f4efe6', '#2a241d', 0.4));
  shadowFloor(scene, 0, 0.4);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshStandardMaterial({ color: '#1b1814', roughness: 0.9 }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = -0.001; disc.receiveShadow = true; scene.add(disc);
  const spec = [
    ['oak_wood_planks', 0.95, 0.045, 0.24], ['red_brick', 0.5, 0.06, 0.24], ['nero_marquina', 0.7, 0.04, 0.45], ['zellige_green', 0.5, 0.03, 0.5],
    ['herringbone_parquet', 0.6, 0.05, 0.6], ['clay_plaster', 0.55, 0.025, 0.42], ['navy_long', 0.52, 0.03, 0.52], ['walnut_louver', 0.9, 0.05, 0.2],
    ['calacatta', 0.72, 0.04, 0.48], ['glaze_mustard', 0.45, 0.03, 0.45], ['sage_pattern', 0.5, 0.03, 0.5], ['stone_grey', 0.66, 0.035, 0.44],
    ['pink_stack', 0.42, 0.03, 0.42], ['terrazzo_white', 0.6, 0.04, 0.6],
  ];
  let y = 0;
  const chips = spec.map(([id, w, h, d], i) => {
    const m = new THREE.Mesh(box(w, h, d), [SIDE(id), SIDE(id), M(id), SIDE(id), SIDE(id), SIDE(id)]);
    m.castShadow = m.receiveShadow = true;
    m.userData = { home: new THREE.Vector3(rnd(-0.07, 0.07), y + h / 2, rnd(-0.07, 0.07)), ry: rnd(-0.6, 0.6), start: (i / spec.length) * 0.93 };
    y += h;
    scene.add(m);
    return m;
  });
  const topY = y;
  const last = chips[chips.length - 1];
  return {
    scene, cam, label: 'Stacking samples', title: 'Sample stack',
    desc: '쇼룸에서 손에 쥐는 샘플 칩이 하나씩 쌓이고, 맨 위 테라조 한 장 위로 카메라가 내려가 화면을 채웁니다.',
    update(p, e, t) {
      let h = 0;
      chips.forEach((m) => {
        const q = seg(p, m.userData.start, m.userData.start + 0.08);
        m.visible = q > 0;
        const k = bounce(q);
        m.position.copy(m.userData.home); m.position.y += (1 - k) * 2.2;
        m.rotation.set((1 - q) * 0.4, m.userData.ry + (1 - q) * 1.2, 0);
        if (q > 0) h = m.userData.home.y;
      });
      const k = eio(e);
      last.rotation.y = THREE.MathUtils.lerp(last.userData.ry, 0, k);
      const fy = h * 0.7 + 0.5;
      cam.position.set(
        THREE.MathUtils.lerp(Math.cos(t * 0.25) * 3.4, 0, k),
        THREE.MathUtils.lerp(fy + 1.4, topY + 0.95, k),
        THREE.MathUtils.lerp(Math.sin(t * 0.25) * 3.4, 0.001, k));
      cam.lookAt(0, THREE.MathUtils.lerp(fy - 0.3, topY, k), 0);
      key.position.set(3, topY + 8, 4); key.target.position.set(0, topY / 2, 0);
    },
  };
}

// =====================================================================
// 04 맞춰지는 큐브: 흩어진 작은 블록이 제자리를 찾아 면마다 다른 자재의 큐브가 됩니다.
// =====================================================================
function sceneCube() {
  const { scene, cam } = stage(30);
  keyLight(scene, [4, 6, 6], 2.4, 3);
  const rim = new THREE.DirectionalLight('#dfe6ff', 0.8); rim.position.set(-5, -2, -3); scene.add(rim);
  scene.add(new THREE.HemisphereLight('#f4efe6', '#2a241d', 0.4));
  const g = new THREE.Group(); scene.add(g);
  const C = 0.5, GAP = 0.025, step = C + GAP;
  const faceMat = ['herringbone_parquet', 'red_brick', 'terrazzo_white', 'nero_marquina', 'zellige_green', 'oak_tambour'];
  const cubies = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const home = new THREE.Vector3(x * step, y * step, z * step);
    const outer = [x === 1, x === -1, y === 1, y === -1, z === 1, z === -1];
    const mats = outer.map((o, i) => (o ? M(faceMat[i]) : core));
    const m = new THREE.Mesh(box(C, C, C, [home.x, home.y, home.z]), mats);
    m.castShadow = m.receiveShadow = true;
    const dir = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize();
    m.userData = { home, from: dir.multiplyScalar(rnd(2.6, 4.2)), q0: new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd(-3, 3), rnd(-3, 3), rnd(-3, 3))), start: Math.random() * 0.75 };
    g.add(m); cubies.push(m);
  }
  const I = new THREE.Quaternion();
  let yAtExit = null;
  return {
    scene, cam, label: 'Fitting surfaces', title: 'Material cube',
    desc: '흩어진 블록이 제자리를 찾아 면마다 마루 · 벽돌 · 테라조 · 대리석 · 젤리주 · 템바가 붙은 큐브가 되고, 앞면이 화면을 채웁니다.',
    update(p, e, t) {
      cubies.forEach((m) => {
        const q = eio(seg(p, m.userData.start, m.userData.start + 0.25));
        m.position.lerpVectors(m.userData.from, m.userData.home, q);
        m.quaternion.slerpQuaternions(m.userData.q0, I, q);
      });
      if (e <= 0) { yAtExit = null; g.rotation.set(0.5, t * 0.45, 0); }
      else {
        if (yAtExit === null) yAtExit = g.rotation.y;
        const k = eio(e);
        const target = Math.ceil(yAtExit / (Math.PI / 2)) * (Math.PI / 2);
        g.rotation.set(THREE.MathUtils.lerp(0.5, 0, k), THREE.MathUtils.lerp(yAtExit, target, k), 0);
        g.scale.setScalar(1 + k * 2.4);
      }
      cam.position.set(0, 0, 6.2); cam.lookAt(0, 0, 0);
    },
  };
}

// =====================================================================
// 05 해가 드는 빈 방: 창으로 든 햇빛이 지나간 자리만 마루가 드러나고, 끝나면 방이 환해집니다.
// =====================================================================
function sceneLight() {
  const { scene, cam } = stage(42);
  scene.environmentIntensity = 0.04;
  const hemi = new THREE.HemisphereLight('#c9d2e0', '#2a2018', 0.06); scene.add(hemi);
  const W = 6, D = 5, H = 2.6;
  const base = new THREE.Mesh(box(W, 0.02, D), M('concrete_wall_008')); base.position.y = -0.011; base.receiveShadow = true; scene.add(base);
  // 빛이 지나간 자리만 보이는 마루
  const reveal = { value: -4 };
  const floorMat = M('herringbone_parquet').clone();
  floorMat.onBeforeCompile = (sh) => {
    sh.uniforms.uReveal = reveal;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nuniform float uReveal;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nfloat edge = uReveal + sin(vWPos.z * 3.1) * 0.18 + sin(vWPos.z * 7.7 + 1.3) * 0.07;\nif (vWPos.x > edge) discard;');
  };
  floorMat.customProgramCacheKey = () => 'reveal';
  const floor = new THREE.Mesh(box(W, 0.02, D), [cap, cap, floorMat, cap, cap, cap]); floor.receiveShadow = true; scene.add(floor);
  const wallMat = M('plastered_wall');
  const backW = new THREE.Mesh(box(W, H, 0.12), [cap, cap, cap, cap, wallMat, cap]); backW.position.set(0, H / 2, -D / 2 - 0.06); backW.receiveShadow = true; backW.castShadow = true; scene.add(backW);
  // 창이 뚫린 왼쪽 벽 (네 조각으로)
  const lw = (z0, z1, y0, y1) => { const m = new THREE.Mesh(box(0.12, y1 - y0, z1 - z0), [wallMat, cap, cap, cap, cap, cap]); m.position.set(-W / 2 - 0.06, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; scene.add(m); };
  lw(-D / 2, D / 2, 0, 0.55); lw(-D / 2, D / 2, 2.15, H); lw(-D / 2, -1.6, 0.55, 2.15); lw(1.0, D / 2, 0.55, 2.15);
  const ceil = new THREE.Mesh(box(W + 0.4, 0.12, D + 0.4), cap); ceil.position.set(0, H + 0.06, 0); ceil.castShadow = true; scene.add(ceil);
  const mull = new THREE.Mesh(box(0.14, 1.6, 0.05), cap); mull.position.set(-W / 2 - 0.06, 1.35, -0.3); mull.castShadow = true; scene.add(mull);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshBasicMaterial({ color: '#ffe9c8' })); sky.rotation.y = Math.PI / 2; sky.position.set(-W / 2 - 1.5, 1.4, -0.3); scene.add(sky);
  const sun = new THREE.DirectionalLight('#ffe2b8', 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 40 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
  sun.target.position.set(0, 0, -0.3);
  scene.add(sun, sun.target);
  return {
    scene, cam, label: 'Letting the light in', title: 'First light',
    desc: '어두운 빈 방에 창으로 햇빛이 들고, 빛이 쓸고 지나간 자리만 헤링본 마루가 드러납니다. 끝나면 방 전체가 환해집니다.',
    update(p, e, t) {
      sun.intensity = 5 * eout(seg(p, 0, 0.12));
      const a = eio(p);
      // 해가 낮아질수록 빛 자국이 창에서 멀어집니다
      sun.position.set(-10, THREE.MathUtils.lerp(14, 3.2, a), -0.3 + Math.sin(t * 0.3) * 0.2);
      reveal.value = THREE.MathUtils.lerp(-3.4, 3.4, a) + eout(e) * 3;
      const k = eout(e);
      hemi.intensity = 0.06 + k * 1.1;
      scene.environmentIntensity = 0.04 + k * 0.5;
      renderer.toneMappingExposure = 1 + k * 0.15;
      cam.position.set(THREE.MathUtils.lerp(2.6, 2.2, k), 1.55, THREE.MathUtils.lerp(3.9, 3.2, k));
      cam.lookAt(-0.6, 0.6, -0.8);
    },
  };
}

// ---------- 재생 ----------
const makers = [sceneTiles, sceneRoom, sceneStack, sceneCube, sceneLight];
const built = [];
let cur = null, t0 = 0;
const LOAD = 4.6, EXIT = 1.6;
const $ = (id) => document.getElementById(id);
function play(i) {
  built[i] ||= makers[i]();
  cur = built[i];
  renderer.toneMappingExposure = 1;
  t0 = performance.now();
  $('label').textContent = cur.label; $('title').textContent = cur.title; $('desc').textContent = cur.desc;
  [...$('tabs').children].forEach((b, k) => b.classList.toggle('on', k === i));
  $('done').style.opacity = 0; $('bottom').style.opacity = 1; $('flash').style.opacity = 0;
  resize();
}
$('tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) play(+b.dataset.i); });
$('replay').addEventListener('click', () => play(built.indexOf(cur)));
addEventListener('keydown', (e) => { const n = +e.key; if (n >= 1 && n <= 5) play(n - 1); if (e.key === 'r') play(built.indexOf(cur)); });

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  if (cur) { const c = cur.cam; c.aspect = w / h; c.fov = c.aspect < 0.9 ? c.userData.fov * 1.6 : c.userData.fov; c.updateProjectionMatrix(); }
}
addEventListener('resize', resize);

(function frame() {
  requestAnimationFrame(frame);
  if (!cur) return;
  const t = window.__freeze ?? (performance.now() - t0) / 1000;
  // 실제 로딩처럼 중간에 잠깐씩 멈칫하는 진행률
  const raw = clamp(t / LOAD);
  const p = clamp(raw + Math.sin(raw * Math.PI * 3) * 0.025 * (1 - raw));
  const e = clamp((t - LOAD - 0.35) / EXIT);
  cur.update(p, e, t);
  $('num').textContent = Math.round(p * 100);
  $('bar').style.transform = `scaleX(${p})`;
  $('bottom').style.opacity = 1 - e;
  if (e >= 1) $('done').style.opacity = 1;
  renderer.render(cur.scene, cur.cam);
})();

play(0);
window.__lab = { play };
