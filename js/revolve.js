// 홈 랜딩: 회전문처럼 네 칸으로 나뉜 케이크.
// 한 칸이 방 하나(왼쪽 벽 · 오른쪽 벽 · 바닥 + 가구)이고, 스크롤로 넘기면 케이크가 돌며 다음 방이 넘어옵니다.
// 넘어가는 동안 카메라가 뒤로 빠져 케이크 전체를 보여 주고, 배경색이 다음 방 색으로 바뀝니다.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ROOMS, BY_ID, CATS, texPath, won, roomTotal } from './data.js';
import { getMaterial, manager } from './materials.js';
import { C, meterBox, buildProps, H } from './props.js';

const N = ROOMS.length;
const R = 5.6, FT = 0.34, WT = 0.07;
// 방마다 배경색과 글자색(밝은 글자 / 어두운 글자)
const THEME = {
  nordic: ['#e9e3d8', 'dark'], japandi: ['#d6c9b4', 'dark'], kitchen: ['#2b5545', 'light'], bath: ['#1b2c4b', 'light'],
  atelier: ['#b45c39', 'light'], loft: ['#232323', 'light'], powder: ['#efc3c6', 'dark'],
};
// 방마다 조명이 다릅니다: 이름 · 큰 조명 색과 세기 · 전구 색
const MOOD = {
  nordic: { label: '창으로 드는 자연광 5600K', key: '#f3f6ff', ki: 1, glow: '#ffd9a6', gi: 2.4 },
  japandi: { label: '은은한 전구색 2700K', key: '#ffcb8e', ki: 0.42, glow: '#ffb35a', gi: 2.2 },
  kitchen: { label: '형광등 주광색 5000K', key: '#eef4ff', ki: 0.62, glow: '#f4f8ff', gi: 2.6 },
  bath: { label: '거울 백라이트 6000K', key: '#dde8ff', ki: 0.7, glow: '#e2edff', gi: 3 },
  atelier: { label: '핀 조명 3000K', key: '#ffd9a8', ki: 0.8, glow: '#ffcf8f', gi: 3 },
  loft: { label: '에디슨 전구 2200K', key: '#ffb46a', ki: 0.4, glow: '#ff9a3a', gi: 4 },
  powder: { label: '화장대 전구 2700K', key: '#ffd0c2', ki: 0.6, glow: '#ffc49a', gi: 2.6 },
};
const ROLE = [['floor', '바닥'], ['left', '왼쪽 벽'], ['back', '오른쪽 벽'], ['counter', '상판']];

const section = document.getElementById('rv');
const canvas = document.getElementById('rvGl');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mod = (a, n) => ((a % n) + n) % n;
const DEBUG = new URLSearchParams(location.search).get('rv'); // ?rv=1.5 처럼 넣으면 그 위치에 멈춰 확인용

// ---------- 렌더러 ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(THEME[ROOMS[0].id][0]);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

// 앞에 온 방만 비추는 큰 조명 (세상에 고정 → 케이크가 돌면 다음 방이 빛 속으로 들어옴)
RectAreaLightUniformsLib.init();
const key = new THREE.SpotLight('#ffffff', 60, 0, 0.62, 0.75, 1);
key.position.set(-2.6, 8.6, 7.4);
key.target.position.set(0.2, 0, 2.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
key.shadow.camera.near = 2; key.shadow.camera.far = 25;
scene.add(key, key.target);
const hemi = new THREE.HemisphereLight('#f4efe8', '#5a5048', 0.22);
scene.add(hemi);
scene.environmentIntensity = 0.16;
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.22 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -FT - 0.002; ground.receiveShadow = true;
scene.add(ground);

// ---------- 케이크 ----------
const cake = new THREE.Group();
scene.add(cake);
const slabSide = new THREE.MeshStandardMaterial({ color: '#f4f1eb', roughness: 0.85 });

function floorGeo() {
  // 90° 부채꼴 판. 윗면 UV는 m 단위(바닥재가 실제 크기로 깔리게)
  const g = new THREE.CylinderGeometry(R, R, FT, 48, 1, false, 0, Math.PI / 2);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) if (n.getY(i) > 0.5) uv.setXY(i, p.getX(i), p.getZ(i));
  return g;
}
const comps = [0, 1, 2, 3].map((c) => {
  const g = new THREE.Group();
  g.rotation.y = (c * Math.PI) / 2;
  const floor = new THREE.Mesh(floorGeo(), [slabSide, C.cap, C.cap]);
  floor.position.y = -FT / 2;
  floor.receiveShadow = floor.castShadow = true;
  const back = new THREE.Mesh(meterBox(R, H, WT), Array(6).fill(C.cap));
  back.position.set(R / 2, H / 2, WT / 2);
  const left = new THREE.Mesh(meterBox(WT, H, R), Array(6).fill(C.cap));
  left.position.set(WT / 2, H / 2, R / 2);
  [back, left].forEach((w) => { w.castShadow = w.receiveShadow = true; });
  const props = new THREE.Group();
  props.position.set(2 + WT, 0, 2 + WT); // 가구 좌표(4m 방, 벽 안쪽 -2)를 칸 모서리에 맞춤
  // 방마다 켜는 전구 두 개 + 형광등 같은 면 조명 하나 (방이 바뀌면 위치 · 색만 바꿈)
  const pts = [0, 1].map(() => { const l = new THREE.PointLight('#fff', 0, 4, 2); g.add(l); return l; });
  const rect = new THREE.RectAreaLight('#fff', 0, 1, 1);
  g.add(floor, back, left, props, rect);
  cake.add(g);
  return { g, floor, back, left, props, pts, rect, room: -1, info: null };
});

const propCache = {};
// 랜딩에서는 반사를 눌러 줍니다. (유광 타일 · 대리석이 조명 각도에 따라 번쩍이지 않게)
function soft(mat) {
  if (mat.userData.soft) return mat;
  mat.userData.soft = true;
  mat.userData.roughMul = 1.45;
  if (mat.roughnessMap) mat.roughness *= 1.45;
  mat.envMapIntensity *= 0.55;
  return mat;
}
function dress(c, i) {
  const comp = comps[c];
  if (comp.room === i) return;
  comp.room = i;
  const r = ROOMS[i];
  comp.floor.material[1] = soft(getMaterial(BY_ID[r.floor]).mat);
  comp.back.material[4] = soft(getMaterial(BY_ID[r.back]).mat);
  comp.left.material[0] = soft(getMaterial(BY_ID[r.left]).mat);
  comp.props.clear();
  const mood = MOOD[r.id];
  propCache[i] ||= buildProps(r.props, r.counter ? soft(getMaterial(BY_ID[r.counter]).mat) : C.white, { wallLen: R, glowColor: mood.glow, glowIntensity: mood.gi });
  comp.props.add(propCache[i]);
  // 이 방 조명 자리 잡기 (가구 좌표 → 칸 좌표)
  const info = propCache[i].userData, o = comp.props.position;
  comp.info = info;
  comp.pts.forEach((l, k) => {
    const d = info.lights[k];
    l.userData.base = d ? d.i : 0;
    if (d) { l.position.set(d.p[0] + o.x, d.p[1], d.p[2] + o.z); l.color.set(d.c); l.distance = d.d; }
  });
  const rc = info.rect;
  comp.rect.userData.base = rc ? rc.i : 0;
  if (rc) {
    comp.rect.position.set(rc.p[0] + o.x, rc.p[1], rc.p[2] + o.z);
    comp.rect.width = rc.w; comp.rect.height = rc.h; comp.rect.color.set(rc.c);
    comp.rect.rotation.set(0, 0, 0);
    if (rc.face === 'down') comp.rect.rotation.x = -Math.PI / 2;
    else comp.rect.rotation.y = -Math.PI / 2; // 왼쪽 벽 창 → 방 안쪽(+x)을 향함
  }
}
// 지금 위치 앞뒤로 네 방을 네 칸에 나눠 담습니다. (뒤쪽 칸은 안 보일 때 바꿔 끼움)
function assign(pos) {
  const base = Math.floor(pos + 1e-4);
  for (let k = -1; k <= 2; k++) dress(mod(base + k, 4), mod(base + k, N));
}
assign(0);

// ---------- 글자 ----------
const $ = (s) => section.querySelector(s);
const lightEl = $('#rvLight');
const idxEl = $('#rvIdx'), nameEl = $('#rvName'), lineEl = $('#rvLine'), listEl = $('#rvList'), totalEl = $('#rvTotal'), goEl = $('#rvGo');
const dots = $('#rvDots');
dots.innerHTML = ROOMS.map((r, i) => `<button type="button" aria-label="${r.ko}"><i></i></button>`).join('');
function fill(i) {
  const r = ROOMS[i];
  idxEl.textContent = String(i + 1).padStart(2, '0');
  nameEl.textContent = r.ko;
  lineEl.textContent = r.line;
  lightEl.innerHTML = `<i style="background:${MOOD[r.id].glow};color:${MOOD[r.id].glow}"></i>조명 · ${MOOD[r.id].label}`;
  listEl.innerHTML = ROLE.filter(([k]) => r[k]).map(([k, label]) => {
    const m = BY_ID[r[k]];
    return `<li><a href="material.html?id=${m.id}"><i style="background-image:url(${texPath(m.id, 'thumb')})"></i><span><small>${label} · ${CATS[m.cat].ko}</small><b>${m.ko}</b></span></a></li>`;
  }).join('');
  totalEl.textContent = `${won(Math.round(roomTotal(r) / 10000))}만원`;
  goEl.href = `rooms.html#${r.id}`;
  [...dots.children].forEach((d, k) => d.classList.toggle('is-on', k === i));
  section.dataset.ink = THEME[r.id][1];
  const nav = document.querySelector('.nav');
  if (nav) nav.dataset.ink = THEME[r.id][1];
}
let shown = -1;
function setRoom(i) {
  if (i === shown) return;
  const first = shown < 0;
  const dir = i > shown ? 1 : -1;
  shown = i;
  if (first || reduce) { fill(i); return; }
  const rows = section.querySelectorAll('.rv-swap');
  gsap.timeline()
    .to(rows, { yPercent: -110 * dir, opacity: 0, duration: 0.4, ease: 'power2.in', stagger: 0.025, overwrite: true })
    .add(() => fill(shown))
    .fromTo(section.querySelectorAll('.rv-swap'), { yPercent: 110 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.06 })
    .fromTo(listEl.children, { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05 }, '<0.1');
}
setRoom(0);

// ---------- 후처리: 전구만 은은하게 번지게 ----------
let composer = null;
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.45, 1.25);
composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 860 ? 1.25 : 1.6));
composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- 화면 크기 ----------
let portrait = false, aspect = 1;
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  composer?.setSize(w, h);
  aspect = w / h;
  camera.aspect = aspect;
  portrait = aspect < 0.95;
  camera.updateProjectionMatrix();
}
resize();
new ResizeObserver(resize).observe(canvas);

// ---------- 스크롤 → 위치 ----------
let target = 0, pos = 0;
const st = ScrollTrigger.create({
  trigger: section, start: 'top top', end: () => '+=' + innerHeight * 1.35 * (N - 1),
  pin: true, refreshPriority: 1,
  onUpdate: (s) => { target = s.progress * (N - 1); },
});
const yOf = (i) => st.start + (i / (N - 1)) * (st.end - st.start);
// 넘기다 멈추면 가까운 방으로 착 붙습니다.
let snapT = null;
window.lenis?.on('scroll', () => {
  clearTimeout(snapT);
  const y = window.lenis.scroll;
  if (y <= st.start + 2 || y >= st.end - 2) return;
  snapT = setTimeout(() => {
    const i = Math.round(target);
    if (Math.abs(target - i) > 0.01) window.lenis.scrollTo(yOf(i), { duration: 1.6, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
  }, 220);
});
const go = (i) => window.lenis?.scrollTo(yOf(clamp(i, 0, N - 1)), { duration: 2.1, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) go([...dots.children].indexOf(b)); });
// 가운데 아래 버튼: 랜딩을 건너뛰고 바로 아래 내용으로
$('#rvSkip').addEventListener('click', () => window.lenis?.scrollTo(document.querySelector('.dark-flow') || st.end + innerHeight, { immediate: true, force: true }));
$('#rvPrev').addEventListener('click', () => go(Math.round(target) - 1));
$('#rvNext').addEventListener('click', () => (Math.round(target) >= N - 1 ? window.lenis?.scrollTo(st.end + 2, { duration: 1 }) : go(Math.round(target) + 1)));

// ---------- 처음 등장 ----------
// 텍스처가 들어오면 케이크가 멀리서 한 바퀴 돌며 첫 방 앞으로 다가옵니다.
const intro = { k: 1 };
let started = false;
function start() {
  if (started) return;
  started = true;
  section.classList.add('is-ready');
  gsap.to(intro, { k: 0, duration: reduce ? 0.01 : 2.6, ease: 'expo.out' });
  gsap.from(section.querySelectorAll('.rv-copy > *'), { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.07, delay: 0.5 });
}
manager.onLoad = start;
setTimeout(start, 9000); // 느린 연결이면 늦게라도 엽니다

// ---------- 매 프레임 ----------
const colA = new THREE.Color(), colB = new THREE.Color();
const look = new THREE.Vector3();
let mx = 0, my = 0, smx = 0, smy = 0;
addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '80px' }).observe(section);
const clock = new THREE.Clock();

const NORV = new URLSearchParams(location.search).has('norv'); // 확인용: 랜딩 3D 그리기 끄기
function frame() {
  requestAnimationFrame(frame);
  if (!visible || NORV) return;
  const t = clock.getElapsedTime();
  if (DEBUG !== null) { target = +DEBUG; intro.k = 0; }
  pos += (target - pos) * (reduce || DEBUG !== null ? 1 : 0.042); // 낮을수록 천천히 따라감
  if (Math.abs(target - pos) < 1e-4) pos = target;
  smx += (mx - smx) * 0.04; smy += (my - smy) * 0.04;

  const base = Math.floor(pos + 1e-4);
  const f = pos - base;
  assign(pos);
  setRoom(clamp(Math.round(pos), 0, N - 1));

  // 넘기는 정도(가운데서 가장 큼) + 처음 등장
  const bump = Math.sin(Math.PI * f);
  const e = clamp(Math.max(bump * 0.9, intro.k));
  const ee = ease(e);

  // 케이크 회전: 방 하나 = 90°. 넘기는 중엔 살짝 기울여 속도감을 줍니다.
  cake.rotation.y = -Math.PI / 4 - pos * (Math.PI / 2) - intro.k * Math.PI * 1.25 + (reduce ? 0 : Math.sin(t * 0.4) * 0.025 * (1 - ee));
  cake.rotation.z = bump * 0.07;
  cake.rotation.x = bump * -0.04;
  cake.position.y = ee * -0.2;

  // 카메라: 쉬는 동안은 방 안을 가깝게, 넘기는 동안은 뒤로 빠져 케이크 전체를
  const D0 = portrait ? 25 / Math.max(aspect, 0.42) * 0.62 : 21, D1 = D0 * 1.6;
  const Y0 = portrait ? D0 * 0.5 : 10.5, Y1 = portrait ? D0 * 0.9 : 21;
  const offX = portrait ? 0 : -3.6 * (1 - ee * 0.5);
  const lookY = portrait ? -D0 * 0.11 : 0.2;
  camera.position.set(offX + smx * 0.8 * (1 - ee), THREE.MathUtils.lerp(Y0, Y1, ee) - smy * 0.5, THREE.MathUtils.lerp(D0, D1, ee));
  look.set(offX, THREE.MathUtils.lerp(lookY, lookY - 0.8, ee), THREE.MathUtils.lerp(1.6, 0, ee));
  camera.lookAt(look);

  // 조명: 정면에 온 칸일수록 불이 켜지고, 옆 · 뒤 칸은 꺼집니다.
  comps.forEach((comp, c) => {
    let off = (c * Math.PI) / 2 + cake.rotation.y + Math.PI / 4;
    off = Math.atan2(Math.sin(off), Math.cos(off));
    const a = Math.pow(clamp(1 - Math.abs(off) / (Math.PI / 2)), 1.6);
    comp.pts.forEach((l) => { l.intensity = l.userData.base * a; });
    comp.rect.intensity = comp.rect.userData.base * a;
    comp.info?.glows.forEach((m) => { m.emissiveIntensity = m.userData.base * (0.03 + 0.97 * a); });
  });
  const mA = MOOD[ROOMS[clamp(base, 0, N - 1)].id], mB = MOOD[ROOMS[clamp(base + 1, 0, N - 1)].id];
  const fe = ease(f);
  key.color.set(mA.key).lerp(colB.set(mB.key), fe);
  key.intensity = 34 * THREE.MathUtils.lerp(mA.ki, mB.ki, fe) * (1 - 0.35 * bump);

  // 배경색: 지금 방 → 다음 방
  colA.set(THEME[ROOMS[clamp(base, 0, N - 1)].id][0]);
  colB.set(THEME[ROOMS[clamp(base + 1, 0, N - 1)].id][0]);
  scene.background.copy(colA).lerpHSL(colB, ease(f));

  composer.render();
}
frame();
