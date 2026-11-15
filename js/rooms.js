// Room Looks: 앞이 트인 정사각 방 모형을 비스듬히 위에서 내려다보는 각도로 가로로 늘어놓습니다.
// 하나를 누르면 그 방에 쓴 바닥 · 벽 · 상판 자재와 대략의 자재비가 나옵니다.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BY_ID, CATS, texPath, won, ROOMS } from './data.js';
import { getMaterial } from './materials.js';
import { C, meterBox, buildProps, S, H } from './props.js';

export { ROOMS };

const WT = 0.14, FT = 0.2, GAP = 7.2;
const ROLE = { floor: '바닥', left: '왼쪽 벽', back: '정면 벽', counter: '상판' };
const AXIS = new THREE.Vector3(1, 0, -1).normalize(); // 화면에서 가로로 보이는 방향

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

  const L = -S / 2, B = -S / 2; // 왼쪽 벽 · 정면 벽 안쪽 좌표

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
    room.props.add(buildProps(r.props, r.counter ? getMaterial(BY_ID[r.counter]).mat : C.white));
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
