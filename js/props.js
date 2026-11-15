// 방 모형 가구: 룸 페이지와 홈 랜딩(회전문 케이크)이 같이 씁니다.
// 좌표는 4m × 4m 방 기준: 왼쪽 벽 안쪽 x = -2, 정면 벽 안쪽 z = -2, 바닥 y = 0
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const S = 4, H = 2.7;

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

export const C = {
  cap: new THREE.MeshStandardMaterial({ color: '#f2f2f0', roughness: 0.9 }),
  fabric: new THREE.MeshStandardMaterial({ color: '#d9d1c4', roughness: 0.95 }),
  fabric2: new THREE.MeshStandardMaterial({ color: '#b9ae9c', roughness: 0.95 }),
  wood: new THREE.MeshStandardMaterial({ color: '#a77f5c', roughness: 0.6 }),
  dark: new THREE.MeshStandardMaterial({ color: '#34302c', roughness: 0.5 }),
  white: new THREE.MeshStandardMaterial({ color: '#f4f1ec', roughness: 0.4 }),
  leaf: new THREE.MeshStandardMaterial({ color: '#7b8c68', roughness: 0.9 }),
  rust: new THREE.MeshStandardMaterial({ color: '#b4573a', roughness: 0.8 }),
  leather: new THREE.MeshStandardMaterial({ color: '#6b4a34', roughness: 0.55 }),
  water: new THREE.MeshStandardMaterial({ color: '#bcd0d2', roughness: 0.05, metalness: 0.1 }),
  mirror: new THREE.MeshStandardMaterial({ color: '#dfe6ea', roughness: 0.02, metalness: 0.9 }),
  glow: new THREE.MeshStandardMaterial({ color: '#fff3dc', emissive: '#ffe2b0', emissiveIntensity: 1.4 }),
};

const rb = (w, h, d, mat, x, y, z, r = 0.04) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
};
const cyl = (r, h, mat, x, y, z, seg = 32) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
};
const ball = (r, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat); m.position.set(x, y, z); m.castShadow = true; return m; };
const plant = (x, z, s = 1) => { const g = new THREE.Group(); g.add(cyl(0.18 * s, 0.36 * s, C.rust, 0, 0.18 * s, 0)); g.add(ball(0.32 * s, C.leaf, 0, 0.62 * s, 0)); g.add(ball(0.22 * s, C.leaf, 0.12 * s, 0.9 * s, 0.05)); g.position.set(x, 0, z); return g; };
const pendant = (x, z, y = 1.85) => { const g = new THREE.Group(); g.add(cyl(0.006, H - y, C.dark, 0, (H + y) / 2, 0, 6)); const shade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.2, 32, 1, true), C.dark); shade.position.y = y; g.add(shade); g.add(ball(0.07, C.glow, 0, y - 0.05, 0)); g.position.set(x, 0, z); return g; };
const L = -S / 2, B = -S / 2; // 왼쪽 벽 · 정면 벽 안쪽 좌표

function counterRun(g, mat, x, z, w, d, along = 'x') {
  const [cw, cd] = along === 'x' ? [w, d] : [d, w];
  g.add(rb(cw, 0.84, cd, C.white, x, 0.42, z, 0.02));
  const top = new THREE.Mesh(meterBox(cw + 0.04, 0.04, cd + 0.04), [C.cap, C.cap, mat, C.cap, C.cap, C.cap]);
  top.position.set(x, 0.86, z); top.castShadow = top.receiveShadow = true; top.userData.counter = true;
  g.add(top);
  return top;
}

const PROPS = {
  living(g) {
    g.add(rb(2.3, 0.02, 1.7, C.fabric2, 0.3, 0.01, 0.3, 0.005));
    g.add(rb(0.95, 0.42, 2.3, C.fabric, L + 0.6, 0.21, 0.2), rb(0.25, 0.5, 2.3, C.fabric, L + 0.25, 0.62, 0.2),
      rb(0.95, 0.56, 0.22, C.fabric, L + 0.6, 0.28, 1.4), rb(0.95, 0.56, 0.22, C.fabric, L + 0.6, 0.28, -1.0));
    g.add(cyl(0.48, 0.05, C.wood, 0.55, 0.38, 0.3), cyl(0.06, 0.36, C.dark, 0.55, 0.18, 0.3));
    g.add(cyl(0.012, 1.5, C.dark, L + 0.35, 0.75, B + 0.35, 8), ball(0.16, C.glow, L + 0.35, 1.55, B + 0.35));
    g.add(plant(1.4, B + 0.45, 1.1), rb(1.6, 0.5, 0.42, C.wood, 0.4, 0.25, B + 0.23));
  },
  bed(g) {
    g.add(rb(1.9, 0.28, 2.2, C.wood, -0.3, 0.14, B + 1.12), rb(1.8, 0.24, 2.05, C.white, -0.3, 0.4, B + 1.1),
      rb(1.84, 0.07, 1.35, C.fabric2, -0.3, 0.54, B + 1.5), rb(0.62, 0.14, 0.36, C.white, -0.72, 0.6, B + 0.32), rb(0.62, 0.14, 0.36, C.white, 0.12, 0.6, B + 0.32));
    g.add(rb(0.46, 0.5, 0.42, C.wood, 0.95, 0.25, B + 0.28), cyl(0.09, 0.3, C.white, 0.95, 0.65, B + 0.28), pendant(-1.45, B + 0.4, 1.4));
    g.add(rb(1.4, 0.02, 0.9, C.fabric, -0.3, 0.01, 1.0, 0.005), plant(1.45, 1.3, 0.9));
  },
  kitchen(g, mat) {
    counterRun(g, mat, -0.25, B + 0.31, 3.0, 0.6);
    counterRun(g, mat, 0.2, 0.55, 1.7, 0.85);
    for (const x of [-0.4, 0.2, 0.8]) g.add(cyl(0.17, 0.05, C.wood, x, 0.66, 1.25), cyl(0.02, 0.64, C.dark, x, 0.32, 1.25, 8));
    g.add(pendant(-0.25, 0.55), pendant(0.65, 0.55), plant(L + 0.4, 1.4, 0.8));
    g.add(rb(0.5, 0.3, 0.05, C.wood, -1.0, 1.5, B + 0.06), rb(0.8, 0.3, 0.05, C.wood, 0.4, 1.5, B + 0.06));
  },
  bath(g, mat) {
    const tub = rb(1.75, 0.55, 0.85, C.white, 0.6, 0.275, B + 0.45, 0.1); g.add(tub);
    g.add(rb(1.55, 0.02, 0.65, C.water, 0.6, 0.5, B + 0.45, 0.01));
    counterRun(g, mat, L + 0.28, 0.3, 1.0, 0.52, 'z').position.y = 0.82;
    const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 48), C.mirror);
    mirror.rotation.z = Math.PI / 2; mirror.position.set(L + 0.03, 1.55, 0.3); g.add(mirror);
    g.add(rb(0.05, 0.6, 0.35, C.fabric2, 1.9, 1.1, -0.3), plant(1.6, 1.4, 0.7));
  },
  desk(g) {
    g.add(rb(1.6, 0.04, 0.7, C.wood, -0.2, 0.74, B + 0.4), rb(0.04, 0.72, 0.62, C.dark, -0.95, 0.36, B + 0.4), rb(0.04, 0.72, 0.62, C.dark, 0.55, 0.36, B + 0.4));
    g.add(rb(0.5, 0.06, 0.5, C.leather, -0.2, 0.46, B + 1.05), rb(0.5, 0.5, 0.06, C.leather, -0.2, 0.72, B + 1.3), cyl(0.025, 0.44, C.dark, -0.2, 0.22, B + 1.05, 8));
    g.add(rb(0.35, 1.8, 1.4, C.wood, L + 0.2, 0.9, 0.8, 0.02), cyl(0.05, 0.3, C.dark, 0.2, 0.9, B + 0.35), ball(0.08, C.glow, 0.2, 1.08, B + 0.35));
    g.add(rb(2.0, 0.02, 1.4, C.fabric2, 0.5, 0.01, 0.9, 0.005), rb(0.9, 0.4, 0.9, C.fabric, 1.0, 0.2, 1.0), plant(1.5, B + 0.4, 1.2));
  },
  loft(g, mat) {
    g.add(rb(2.4, 0.42, 0.95, C.leather, 0.1, 0.21, B + 0.6), rb(2.4, 0.42, 0.25, C.leather, 0.1, 0.6, B + 0.25));
    const t = counterRun(g, mat, L + 0.9, 0.9, 1.3, 0.8, 'z');
    t.position.y = 0.74;
    g.children.filter((c) => c.geometry?.type === 'RoundedBoxGeometry' && c.material === C.white && Math.abs(c.position.x - (L + 0.9)) < 0.01).forEach((c) => { c.material = C.dark; c.scale.set(0.15, 0.86, 0.9); c.position.y = 0.36; });
    for (const [x, z] of [[L + 0.35, 0.6], [L + 0.35, 1.2], [L + 1.45, 0.6], [L + 1.45, 1.2]]) g.add(rb(0.38, 0.05, 0.38, C.wood, x, 0.46, z), cyl(0.02, 0.44, C.dark, x, 0.22, z, 8));
    g.add(pendant(L + 0.9, 0.9, 1.5), plant(1.6, 1.3, 1.2), rb(1.2, 0.35, 0.6, C.wood, 1.0, 0.18, 0.9));
  },
  vanity(g, mat) {
    g.add(rb(1.2, 0.55, 0.5, C.wood, 0.0, 0.55, B + 0.27, 0.02));
    counterRun(g, mat, 0.0, B + 0.27, 1.3, 0.55).position.y = 0.84;
    g.children.filter((c) => c.material === C.white && c.position.z === B + 0.27).forEach((c) => g.remove(c));
    const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 48, 1, false, 0, Math.PI), C.mirror);
    mirror.rotation.x = Math.PI / 2; mirror.rotation.z = Math.PI; mirror.position.set(0, 1.35, B + 0.03);
    g.add(mirror, rb(0.8, 0.5, 0.03, C.mirror, 0, 1.12, B + 0.03, 0.01));
    g.add(cyl(0.22, 0.45, C.fabric, 1.0, 0.22, 0.6), plant(L + 0.4, 1.4, 0.9), rb(1.3, 0.02, 0.9, C.fabric2, 0.3, 0.01, 0.9, 0.005));
  },
};


// 가구 묶음 하나를 만들어 돌려줍니다.
export function buildProps(kind, counterMat) {
  const g = new THREE.Group();
  PROPS[kind](g, counterMat || C.white);
  return g;
}
