// 개발용: 방 하나를 조명까지 넣어 한 장 그립니다. (headless Chrome으로 찍어 이미지로 저장)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ROOMS, BY_ID } from './data.js';
import { getMaterial, manager } from './materials.js';
import { C, meterBox, buildProps, S, H } from './props.js';

const q = new URLSearchParams(location.search);
const r = ROOMS.find((x) => x.id === (q.get('room') || 'nordic'));
const BG = { nordic: '#d9d2c6', japandi: '#cbbda6', kitchen: '#2b5545', bath: '#1b2c4b', atelier: '#a95533', loft: '#232323', powder: '#e3b5b8' };
const MOOD = {
  nordic: ['#f3f6ff', 1, '#ffd9a6', 2.4], japandi: ['#ffcb8e', 0.5, '#ffb35a', 2.2], kitchen: ['#eef4ff', 0.7, '#f4f8ff', 2.6], bath: ['#dde8ff', 0.75, '#e2edff', 3],
  atelier: ['#ffd9a8', 0.85, '#ffcf8f', 3], loft: ['#ffb46a', 0.5, '#ff9a3a', 4], powder: ['#ffd0c2', 0.7, '#ffc49a', 2.6],
};
const [keyC, keyI, glowC, glowI] = MOOD[r.id];

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
RectAreaLightUniformsLib.init();
const scene = new THREE.Scene();
scene.background = new THREE.Color(BG[r.id]);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.28;
scene.add(new THREE.HemisphereLight('#f4efe8', '#5a5048', 0.35));
const key = new THREE.SpotLight(keyC, 34 * keyI, 0, 0.7, 0.8, 1);
key.position.set(4.5, 7.5, 6.5); key.target.position.set(-0.3, 0, -0.3);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
scene.add(key, key.target);

const soft = (m) => { m.userData.roughMul = 1.45; m.envMapIntensity *= 0.55; return m; };
const WT = 0.14, FT = 0.2;
const floor = new THREE.Mesh(meterBox(S, FT, S), [C.cap, C.cap, soft(getMaterial(BY_ID[r.floor]).mat), C.cap, C.cap, C.cap]);
floor.position.y = -FT / 2; floor.receiveShadow = true;
const left = new THREE.Mesh(meterBox(WT, H, S), [soft(getMaterial(BY_ID[r.left]).mat), C.cap, C.cap, C.cap, C.cap, C.cap]);
left.position.set(-S / 2 - WT / 2, H / 2, 0); left.receiveShadow = left.castShadow = true;
const back = new THREE.Mesh(meterBox(S + WT, H, WT), [C.cap, C.cap, C.cap, C.cap, soft(getMaterial(BY_ID[r.back]).mat), C.cap]);
back.position.set(-WT / 2, H / 2, -S / 2 - WT / 2); back.receiveShadow = back.castShadow = true;
scene.add(floor, left, back);
const props = buildProps(r.props, r.counter ? soft(getMaterial(BY_ID[r.counter]).mat) : C.white, { wallLen: S, glowColor: glowC, glowIntensity: glowI });
scene.add(props);
props.userData.lights.forEach((d) => { const l = new THREE.PointLight(d.c, d.i, d.d, 2); l.position.set(...d.p); scene.add(l); });
const rc = props.userData.rect;
if (rc) {
  const l = new THREE.RectAreaLight(rc.c, rc.i, rc.w, rc.h);
  l.position.set(...rc.p);
  if (rc.face === 'down') l.rotation.x = -Math.PI / 2; else l.rotation.y = -Math.PI / 2;
  scene.add(l);
}

const camera = new THREE.PerspectiveCamera(+(q.get('fov') || 32), innerWidth / innerHeight, 0.1, 100);
const D = +(q.get('d') || 9.6);
camera.position.set(D * 0.62, D * 0.5, D * 0.62);
camera.lookAt(-0.15, 0.95, -0.15);

let done = false;
function shot() {
  if (done) return;
  done = true;
  setTimeout(() => { renderer.render(scene, camera); document.title = 'ready'; }, 1500);
}
manager.onLoad = shot;
setTimeout(shot, 12000);
(function loop() { if (!done) { renderer.render(scene, camera); requestAnimationFrame(loop); } })();
