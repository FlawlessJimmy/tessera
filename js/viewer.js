// 스튜디오: ① 샘플 돌려 보기 ② 샘플 방에 깔아 보기 ③ 내 사진에 깔아 보기
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getMaterial } from './materials.js';
import { texPath, BY_ID, isWallish, ROOM_FINISH } from './data.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
// 벽 마감 · 작은 유광 타일 · 패널 · 벽돌은 벽에, 나머지는 바닥에 깝니다.
export const defaultSurface = (m) => (isWallish(m) ? 'wall' : 'floor');

// UV를 m 단위로 바꿉니다. (PlaneGeometry 기본 UV는 0~1)
function meterUV(g, w, h) {
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
  return g;
}

export function createStudio({ canvas, stage, photo }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const env = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  // ================= ① 샘플 =================
  const sScene = new THREE.Scene();
  sScene.environment = env;
  sScene.environmentIntensity = 0.75;
  const sCam = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  sCam.position.set(0, 0, 2.05);
  const sKey = new THREE.DirectionalLight('#fff6ea', 2.4);
  sScene.add(sKey, new THREE.HemisphereLight('#ffffff', '#cbbfae', 0.5));
  const board = new THREE.Group();
  sScene.add(board);
  let sampleMesh = null;

  function buildSample(m) {
    if (sampleMesh) { board.remove(sampleMesh); sampleMesh.geometry.dispose(); }
    const thick = Math.max(0.012, (m.thick / 1000) * 1.4);
    const g = new THREE.BoxGeometry(0.6, 0.6, thick);
    const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) if (Math.abs(nor.getZ(i)) > 0.5) uv.setXY(i, pos.getX(i) + 0.3, pos.getY(i) + 0.3);
    const { mat, side } = getMaterial(m);
    sampleMesh = new THREE.Mesh(g, [side, side, side, side, mat, side]);
    board.add(sampleMesh);
  }

  // 끌어서 돌리기 (손을 떼면 관성으로 천천히 멈춤)
  let rotY = 0, rotX = 0, vY = 0, vX = 0, dragging = false, lx = 0, ly = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); stage.classList.add('is-drag'); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    vY = dx * 0.008; vX = dy * 0.006;
    rotY += vY; rotX += vX;
  });
  const end = () => { dragging = false; stage.classList.remove('is-drag'); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  // ================= ② 방 =================
  const rScene = new THREE.Scene();
  rScene.environment = env;
  rScene.environmentIntensity = 0.32;
  rScene.background = new THREE.Color('#ececec');
  const rCam = new THREE.PerspectiveCamera(46, 1, 0.05, 40);
  const W = 6, Dp = 5, H = 2.5;
  const paint = new THREE.MeshStandardMaterial({ color: '#efefed', roughness: 0.93 });
  const plain = new THREE.MeshStandardMaterial({ color: '#d8d3cb', roughness: 0.8 });

  const floor = new THREE.Mesh(meterUV(new THREE.PlaneGeometry(W, Dp), W, Dp), plain);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  const back = new THREE.Mesh(meterUV(new THREE.PlaneGeometry(W, H), W, H), paint);
  back.position.set(0, H / 2, -Dp / 2); back.receiveShadow = true; back.castShadow = true;
  const right = new THREE.Mesh(meterUV(new THREE.PlaneGeometry(Dp, H), Dp, H), paint);
  right.rotation.y = -Math.PI / 2; right.position.set(W / 2, H / 2, 0); right.receiveShadow = true;
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, Dp), new THREE.MeshStandardMaterial({ color: '#f3f0ea', roughness: 1 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H;
  // 왼쪽 벽: 창문 구멍이 뚫린 면 (ShapeGeometry의 UV는 이미 m 단위)
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.lineTo(Dp, 0); shape.lineTo(Dp, H); shape.lineTo(0, H); shape.lineTo(0, 0);
  const win = { x0: 1.5, x1: 3.5, y0: 0.7, y1: 2.15 };
  const hole = new THREE.Path();
  hole.moveTo(win.x0, win.y0); hole.lineTo(win.x0, win.y1); hole.lineTo(win.x1, win.y1); hole.lineTo(win.x1, win.y0); hole.lineTo(win.x0, win.y0);
  shape.holes.push(hole);
  const left = new THREE.Mesh(new THREE.ShapeGeometry(shape), paint);
  left.rotation.y = Math.PI / 2; left.position.set(-W / 2, 0, Dp / 2);
  left.castShadow = true; left.receiveShadow = true;
  // 창틀과 바깥 하늘
  const frameMat = new THREE.MeshStandardMaterial({ color: '#f6f4ef', roughness: 0.6 });
  const fw = 0.05, depth = 0.16;
  const zc = Dp / 2 - (win.x0 + win.x1) / 2, yc = (win.y0 + win.y1) / 2, ww = win.x1 - win.x0, wh = win.y1 - win.y0;
  const frames = new THREE.Group();
  [[ww + fw * 2, fw, 0, wh / 2 + fw / 2], [ww + fw * 2, fw, 0, -wh / 2 - fw / 2], [fw, wh, ww / 2 + fw / 2, 0], [fw, wh, -ww / 2 - fw / 2, 0], [fw * 0.6, wh, 0, 0]].forEach(([a, b, dz, dy]) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(depth, b, a), frameMat);
    f.position.set(-W / 2 - depth / 2 + 0.02, yc + dy, zc - dz);
    f.castShadow = true; frames.add(f);
  });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(ww + 1, wh + 1), new THREE.MeshBasicMaterial({ color: '#fbf6ec' }));
  sky.rotation.y = Math.PI / 2; sky.position.set(-W / 2 - 1.2, yc, zc);
  // 걸레받이
  const baseMat = new THREE.MeshStandardMaterial({ color: '#f2efe9', roughness: 0.55 });
  const bb1 = new THREE.Mesh(new THREE.BoxGeometry(W, 0.08, 0.014), baseMat); bb1.position.set(0, 0.04, -Dp / 2 + 0.007);
  const bb2 = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.08, Dp), baseMat); bb2.position.set(-W / 2 + 0.007, 0.04, 0);
  const bb3 = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.08, Dp), baseMat); bb3.position.set(W / 2 - 0.007, 0.04, 0);
  rScene.add(floor, back, right, left, ceil, frames, sky, bb1, bb2, bb3);

  // 창으로 들어오는 햇빛 + 은은한 실내광
  const sun = new THREE.DirectionalLight('#fff0d9', 3.4);
  sun.position.set(-8, 4.6, 1.2); sun.target.position.set(0, 0, -0.4);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 });
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  rScene.add(sun, sun.target);
  rScene.add(new THREE.HemisphereLight('#f1f2f4', '#b8a58e', 0.75));
  const fill = new THREE.DirectionalLight('#ffffff', 0.35); fill.position.set(3, 2, 4); rScene.add(fill);

  // 가구 (Poly Haven CC0 모델)
  const furniture = new THREE.Group();
  rScene.add(furniture);
  const gl = new GLTFLoader();
  const place = (id, fn) => gl.load(`assets/models/${id}/${id}.gltf`, (g) => {
    const o = g.scene;
    o.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    fn(o); furniture.add(o); dirty = true;
  });
  place('modern_wooden_cabinet', (o) => {
    const b = new THREE.Box3().setFromObject(o);
    o.position.set(0.55, -b.min.y, -Dp / 2 - b.min.z + 0.02);
  });
  place('modern_arm_chair_01', (o) => { o.rotation.y = 0.75; o.position.set(-1.55, 0, -0.55); });
  place('side_table_01', (o) => { o.position.set(-0.75, 0, -1.25); });

  let surface = 'floor';
  let current = null;
  let roomFloor = getMaterial(BY_ID.laminate_floor_02).mat; // 벽을 볼 때 깔려 있을 바닥
  let roomWall = paint; // 바닥을 볼 때 칠해져 있을 벽
  function applyRoom() {
    if (!current) return;
    const { mat } = getMaterial(current);
    floor.material = surface === 'floor' ? mat : roomFloor;
    if (surface === 'wall' && ROOM_FINISH.has(current.cat)) back.material = left.material = right.material = mat;
    else if (surface === 'wall') { back.material = mat; left.material = right.material = roomWall; }
    else back.material = left.material = right.material = roomWall;
    dirty = true;
  }

  // ================= ③ 내 사진 =================
  const P = photo;
  const img = P.querySelector('.photo-img');
  const warp = P.querySelector('.photo-warp');
  const outline = P.querySelector('.photo-outline polygon');
  const handles = [...P.querySelectorAll('.photo-handle')];
  let pts = [[0.2, 0.55], [0.8, 0.55], [0.98, 0.98], [0.02, 0.98]]; // 0~1 비율 좌표
  let realW = 4, realH = 4; // 사각형이 덮는 실제 크기(m)
  let scale = 1;

  function adj(m) { return [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]]; }
  function mm(a, b) { const c = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j]; c[3 * i + j] = s; } return c; }
  function mv(m, v) { return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]; }
  function basis(p) { const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1]; const v = mv(adj(m), [p[3][0], p[3][1], 1]); return mm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]); }
  function homography(src, dst) { return mm(basis(dst), adj(basis(src))); }

  function layoutPhoto() {
    const r = P.querySelector('.photo-stage').getBoundingClientRect();
    const S = 1000;
    const dst = pts.map(([x, y]) => [x * r.width, y * r.height]);
    const t = homography([[0, 0], [S, 0], [S, S], [0, S]], dst).map((v, _, a) => v / a[8]);
    warp.style.width = warp.style.height = S + 'px';
    warp.style.transform = `matrix3d(${t[0]},${t[3]},0,${t[6]},${t[1]},${t[4]},0,${t[7]},0,0,1,0,${t[2]},${t[5]},0,${t[8]})`;
    if (current) {
      const tw = (current.dim / 1000 / realW) * S * scale, th = (current.dim / 1000 / realH) * S * scale;
      warp.style.backgroundSize = `${tw}px ${th}px`;
    }
    outline.setAttribute('points', dst.map((p) => p.join(',')).join(' '));
    P.querySelector('.photo-outline').setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    handles.forEach((h, i) => { h.style.left = dst[i][0] + 'px'; h.style.top = dst[i][1] + 'px'; });
  }
  handles.forEach((h, i) => {
    h.addEventListener('pointerdown', (e) => {
      e.preventDefault(); h.setPointerCapture(e.pointerId); h.classList.add('is-drag');
      const st = P.querySelector('.photo-stage').getBoundingClientRect();
      const move = (ev) => {
        pts[i] = [Math.min(1.05, Math.max(-0.05, (ev.clientX - st.left) / st.width)), Math.min(1.05, Math.max(-0.05, (ev.clientY - st.top) / st.height))];
        layoutPhoto();
      };
      const up = () => { h.classList.remove('is-drag'); h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); };
      h.addEventListener('pointermove', move); h.addEventListener('pointerup', up);
    });
  });
  addEventListener('resize', () => mode === 'photo' && layoutPhoto());

  function setPhoto(src, quad, real) {
    img.onload = () => { P.classList.add('has-photo'); P.querySelector('.photo-stage').style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`; requestAnimationFrame(layoutPhoto); };
    img.src = src;
    pts = quad; [realW, realH] = real;
  }

  // 예시 사진: 가구를 뺀 빈 방을 정면에서 찍어 사진처럼 씁니다.
  function sampleShot() {
    const w = 1400, h = 933;
    const cam = new THREE.PerspectiveCamera(56, w / h, 0.05, 40);
    cam.position.set(0, 2.25, 6.6); cam.lookAt(0, 0.55, -1.0);
    const keep = { f: floor.material, b: back.material, l: left.material, r: right.material };
    floor.material = plain; back.material = left.material = right.material = paint; furniture.visible = false;
    const prevSize = new THREE.Vector2(); renderer.getSize(prevSize); const pr = renderer.getPixelRatio();
    renderer.setPixelRatio(1); renderer.setSize(w, h, false);
    renderer.render(rScene, cam);
    const url = canvas.toDataURL('image/jpeg', 0.9);
    renderer.setPixelRatio(pr); renderer.setSize(prevSize.x, prevSize.y, false);
    floor.material = keep.f; back.material = keep.b; left.material = keep.l; right.material = keep.r; furniture.visible = true;
    const zf = 2.45;
    const quad = [[-W / 2, -Dp / 2], [W / 2, -Dp / 2], [W / 2, zf], [-W / 2, zf]].map(([x, z]) => {
      const v = new THREE.Vector3(x, 0, z).project(cam);
      return [(v.x + 1) / 2, (1 - v.y) / 2];
    });
    dirty = true;
    return { url, quad, real: [W, zf + Dp / 2] };
  }

  // ================= 공통 =================
  let mode = 'sample';
  let dirty = true;
  function resize() {
    const r = stage.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    sCam.aspect = rCam.aspect = r.width / r.height;
    // 세로 화면에서는 샘플을 조금 멀리
    sCam.position.z = sCam.aspect < 1 ? 2.05 / sCam.aspect * 0.95 : 2.05;
    sCam.updateProjectionMatrix(); rCam.updateProjectionMatrix();
    dirty = true;
  }
  new ResizeObserver(resize).observe(stage);

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '80px' }).observe(stage);

  let orbit = 0, orbitT = 0, rmx = 0;
  stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); rmx = (e.clientX - r.left) / r.width - 0.5; });
  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || mode === 'photo') return;
    const t = clock.getElapsedTime();
    if (mode === 'sample') {
      if (!dragging) { vY *= 0.94; vX *= 0.9; rotY += vY + (reduce ? 0 : 0.0035); rotX += vX; rotX *= 0.97; }
      board.rotation.y = rotY + Math.sin(t * 0.4) * 0.12;
      board.rotation.x = -0.32 + rotX + Math.sin(t * 0.33) * 0.08;
      sKey.position.set(Math.cos(t * 0.5) * 2.2, 1.6 + Math.sin(t * 0.7) * 0.4, 2.2);
      renderer.render(sScene, sCam);
    } else {
      orbitT += (rmx - orbitT) * 0.04;
      const yaw = -0.18 + orbitT * 0.22;
      const tx = -0.6, tz = -1.2, R = 5.0;
      rCam.position.set(tx + Math.sin(0.62 + yaw) * R, 1.42, tz + Math.cos(0.62 + yaw) * R);
      rCam.lookAt(tx, 0.85, tz);
      renderer.render(rScene, rCam);
    }
  }
  frame();

  return {
    setMaterial(m) {
      current = m;
      buildSample(m);
      surface = defaultSurface(m);
      if (m.cat === 'floor') roomFloor = getMaterial(m).mat;
      if (ROOM_FINISH.has(m.cat)) roomWall = getMaterial(m).mat;
      applyRoom();
      warp.style.backgroundImage = `url(${texPath(m.id, 'diff')})`;
      if (mode === 'photo') layoutPhoto();
      return surface;
    },
    setSurface(s) { surface = s; applyRoom(); },
    setMode(m) {
      mode = m;
      stage.dataset.mode = m;
      if (m === 'photo') {
        if (!P.classList.contains('has-photo')) { const s = sampleShot(); setPhoto(s.url, s.quad, s.real); }
        else requestAnimationFrame(layoutPhoto);
      }
    },
    loadPhoto(file) {
      const url = URL.createObjectURL(file);
      setPhoto(url, [[0.12, 0.58], [0.88, 0.58], [1.0, 0.98], [0.0, 0.98]], [4, 3]);
    },
    resetPhoto() { const s = sampleShot(); setPhoto(s.url, s.quad, s.real); },
    setScale(v) { scale = v; layoutPhoto(); },
  };
}
