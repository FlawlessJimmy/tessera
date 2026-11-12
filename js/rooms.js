// Room Looks: 앞이 트인 정사각 방 모형을 비스듬히 위에서 내려다보는 각도로 가로로 늘어놓습니다.
// 하나를 누르면 그 방에 쓴 바닥 · 벽 · 상판 자재와 대략의 자재비가 나옵니다.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BY_ID, CATS, texPath, won, ROOMS } from './data.js';
import { getMaterial } from './materials.js';

export { ROOMS };

const S = 4, H = 2.7, WT = 0.14, FT = 0.2, GAP = 7.2;
const ROLE = { floor: '바닥', left: '왼쪽 벽', back: '정면 벽', counter: '상판' };
const AXIS = new THREE.Vector3(1, 0, -1).normalize(); // 화면에서 가로로 보이는 방향

// 상자의 각 면 UV를 m 단위로 바꿔 자재가 실제 크기 비율로 깔리게 합니다.
function meterBox(w, h, d) {
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

const C = {
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

export function createRooms({ section, canvas, labelsEl, panel, onPick }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  const DIR = new THREE.Vector3(1, 0.86, 1).normalize();
  const sun = new THREE.DirectionalLight('#fff3e2', 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 60 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 5;
  scene.add(sun, sun.target, new THREE.HemisphereLight('#f6f2ea', '#b5a58f', 0.9));

  // 모형 아래 받침 그림자
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.12 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -FT; ground.receiveShadow = true;
  scene.add(ground);

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

  // ---------- 방 만들기 ----------
  const rooms = ROOMS.map((r, i) => {
    const g = new THREE.Group();
    g.position.copy(AXIS.clone().multiplyScalar(i * GAP));
    const floor = new THREE.Mesh(meterBox(S, FT, S), [C.cap, C.cap, C.cap, C.cap, C.cap, C.cap]);
    floor.position.y = -FT / 2; floor.receiveShadow = true; floor.castShadow = true;
    const left = new THREE.Mesh(meterBox(WT, H, S), [C.cap, C.cap, C.cap, C.cap, C.cap, C.cap]);
    left.position.set(L - WT / 2, H / 2, 0); left.castShadow = left.receiveShadow = true;
    const back = new THREE.Mesh(meterBox(S + WT, H, WT), [C.cap, C.cap, C.cap, C.cap, C.cap, C.cap]);
    back.position.set(-WT / 2, H / 2, B - WT / 2); back.castShadow = back.receiveShadow = true;
    g.add(floor, left, back);
    const props = new THREE.Group();
    g.add(props);
    // 클릭 판정용 투명 상자
    const hit = new THREE.Mesh(new THREE.BoxGeometry(S + 0.4, H + 0.4, S + 0.4), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = H / 2; hit.userData.idx = i; g.add(hit);
    scene.add(g);
    return { data: r, g, floor, left, back, props, hit, lift: 0, loaded: false };
  });

  function dress(room) {
    if (room.loaded) return;
    room.loaded = true;
    const r = room.data;
    room.floor.material[2] = getMaterial(BY_ID[r.floor]).mat;
    room.left.material[0] = getMaterial(BY_ID[r.left]).mat;
    room.back.material[4] = getMaterial(BY_ID[r.back]).mat;
    PROPS[r.props](room.props, r.counter ? getMaterial(BY_ID[r.counter]).mat : C.white);
  }
  // 화면 가까이 오면 자재를 불러옵니다.
  new IntersectionObserver(([e]) => { if (e.isIntersecting) rooms.forEach(dress); }, { rootMargin: '150% 0px' }).observe(section);

  // ---------- 이름표 ----------
  labelsEl.innerHTML = rooms.map((r, i) => `<button class="room-label" data-idx="${i}"><span>${String(i + 1).padStart(2, '0')}</span><b>${r.data.ko}</b><em>${r.data.en}</em></button>`).join('');
  const labels = [...labelsEl.children];
  labelsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-idx]'); if (b) select(+b.dataset.idx); });

  // ---------- 크기 · 카메라 ----------
  let W = 1, Hh = 1, viewH = 9;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; Hh = r.height;
    renderer.setSize(W, Hh, false);
    const aspect = W / Hh;
    viewH = aspect < 0.9 ? 7.6 / aspect : 12.5; // 휴대폰에서는 방 하나가 화면 폭에 맞게
    cam.left = -viewH * aspect / 2; cam.right = viewH * aspect / 2; cam.top = viewH / 2; cam.bottom = -viewH / 2;
    cam.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);

  // ---------- 스크롤 · 선택 ----------
  let scrollP = 0, sel = -1, hover = -1;
  const target = new THREE.Vector3(), want = new THREE.Vector3();
  let zoom = 1;
  ScrollTrigger.create({
    trigger: section, start: 'top top', end: () => '+=' + innerHeight * 0.55 * (ROOMS.length - 1),
    pin: true, scrub: true, onUpdate: (s) => { scrollP = s.progress; },
  });

  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, cam);
    const hit = ray.intersectObjects(rooms.map((x) => x.hit))[0];
    return hit ? hit.object.userData.idx : -1;
  }
  canvas.addEventListener('pointermove', (e) => { hover = pick(e); canvas.style.cursor = hover >= 0 ? 'pointer' : ''; });
  canvas.addEventListener('pointerleave', () => { hover = -1; });
  canvas.addEventListener('click', (e) => { const i = pick(e); if (i >= 0) select(i); });

  // ---------- 오른쪽 설명 ----------
  const closeBtn = panel.querySelector('.rp-close');
  closeBtn.addEventListener('click', () => select(-1));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && sel >= 0) select(-1); });

  function itemCost(m, role) {
    const area = role === 'floor' ? S * S : role === 'counter' ? 3.0 : S * H;
    const qty = Math.ceil((area * (1 + m.loss)) / m.unitArea);
    return { area, qty, total: qty * m.price };
  }
  function fillPanel(r) {
    const items = ['floor', 'left', 'back', 'counter'].filter((k) => r[k]).map((k) => ({ role: k, m: BY_ID[r[k]] }));
    let sum = 0;
    panel.querySelector('.rp-body').innerHTML = `
      <p class="rp-eyebrow">Room Look · ${String(ROOMS.indexOf(r) + 1).padStart(2, '0')}</p>
      <h3>${r.ko}</h3><p class="rp-en">${r.en}</p>
      <p class="rp-line">${r.line}</p>
      <ul class="rp-list">${items.map(({ role, m }) => {
        const c = itemCost(m, role); sum += c.total;
        return `<li><button data-id="${m.id}">
          <i style="background-image:url(${texPath(m.id, 'thumb')})"></i>
          <span><small>${ROLE[role]} · ${CATS[m.cat].ko}</small><b>${m.ko}</b><em>${c.area.toFixed(1)}㎡ · ${c.qty}${m.unit.replace(/^1/, '').replace(/\(.*\)/, '')}</em></span>
          <strong>${won(c.total)}원</strong></button></li>`;
      }).join('')}</ul>
      <div class="rp-total"><span>이 방 자재비 (4m × 4m 기준)</span><strong>${won(sum)}원</strong></div>
      <p class="rp-note">자재를 누르면 자세히 보기로 넘어가 돌려 보고, 내 방에 깔아 보고, 판매처까지 비교할 수 있습니다. 시공비는 별도입니다.</p>`;
  }
  panel.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) onPick(b.dataset.id); });

  function select(i) {
    sel = i;
    section.classList.toggle('has-sel', i >= 0);
    labels.forEach((l, k) => l.classList.toggle('is-on', k === i));
    if (i >= 0) fillPanel(ROOMS[i]);
  }

  // ---------- 매 프레임 ----------
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section);
  const tmp = new THREE.Vector3();
  const desk = matchMedia('(min-width: 861px)');
  (function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const span = (ROOMS.length - 1) * GAP;
    if (sel >= 0) {
      want.copy(rooms[sel].g.position);
      // 패널이 오른쪽을 가리니 방을 왼쪽으로 조금 비켜 둡니다
      if (desk.matches) want.addScaledVector(AXIS, viewH * (W / Hh) * 0.15 / 1.6);
    } else want.copy(AXIS).multiplyScalar(scrollP * span);
    want.y = 0.9;
    target.lerp(want, sel >= 0 || Math.abs(zoom - 1) > 0.01 ? 0.08 : 0.35);
    zoom += ((sel >= 0 ? 1.6 : 1) - zoom) * 0.08;
    cam.zoom = zoom; cam.updateProjectionMatrix();
    cam.position.copy(target).addScaledVector(DIR, 40);
    cam.lookAt(target);
    sun.position.copy(target).add(tmp.set(7, 13, 10));
    sun.target.position.copy(target);

    rooms.forEach((r, i) => {
      r.lift += ((i === hover || i === sel ? 0.18 : 0) - r.lift) * 0.12;
      r.g.position.y = r.lift;
      // 이름표 위치: 방 앞 모서리 아래
      tmp.set(S / 2 + 0.2, -FT, S / 2 + 0.2).add(r.g.position).project(cam);
      const l = labels[i];
      l.style.transform = `translate(${(tmp.x + 1) / 2 * W}px, ${(1 - tmp.y) / 2 * Hh + 14}px) translateX(-50%)`;
      l.style.opacity = tmp.x < -1.2 || tmp.x > 1.2 ? 0 : sel >= 0 && sel !== i ? 0.25 : 1;
    });
    renderer.render(scene, cam);
  })();
  return { select, count: ROOMS.length };
}
