// 자재 텍스처와 재질을 한 번만 불러와 여러 화면(랜딩 · 스튜디오)에서 같이 씁니다.
import * as THREE from 'three';
import { texPath } from './data.js';

export const manager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(manager);
const cache = new Map();

// 유광 타일은 반사를 더 살리고, 무광은 거칠게 둡니다.
const GLOSS = { zellige_green: 1.25, glaze_mustard: 1.2, navy_long: 1.3, pink_stack: 1.2, white_wave: 1.3, ribbed_red: 1.25, marble_beige: 1.2, calacatta: 1.25, nero_marquina: 1.3, quartz_grey: 1.1 };

export function getMaterial(m) {
  if (cache.has(m.id)) return cache.get(m.id);
  const rep = 1000 / m.dim; // UV를 m 단위로 만들었기 때문에 1/실제 크기만큼 반복합니다.
  // 사진(색 · 요철 · 거칠기)은 받아진 뒤에 붙입니다.
  // 받기 전에 붙여 두면 빈 거칠기 값 때문에 거울처럼 번쩍이고, 빈 색 값 때문에 까맣게 보입니다.
  // 그동안은 자재 바탕색 · 무광으로 보여 줍니다.
  const gloss = GLOSS[m.id] || 1;
  const baseRough = m.id === 'terrazzo_white' ? 2.1 : 1; // 테라조는 무광(혼드) 마감
  const mat = new THREE.MeshStandardMaterial({ color: m.side || '#8a8580', roughness: 0.9, metalness: 0, envMapIntensity: gloss > 1 ? 1.15 : 0.7 });
  const load = (map, key, srgb) => {
    const t = loader.load(texPath(m.id, map), () => {
      mat[key] = t;
      if (key === 'map') mat.color.set('#ffffff');
      if (key === 'roughnessMap') mat.roughness = baseRough * (mat.userData.roughMul || 1);
      mat.needsUpdate = true;
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep, rep);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  load('diff', 'map', true);
  load('nor', 'normalMap');
  load('rough', 'roughnessMap');
  const ns = m.id === 'terrazzo_white' ? 0.3 : m.cat === 'wallpaper' || m.cat === 'paint' ? 0.8 : 1;
  mat.normalScale.set(ns, ns);
  const side = new THREE.MeshStandardMaterial({ color: m.side, roughness: 0.75, metalness: 0 });
  const entry = { mat, side };
  cache.set(m.id, entry);
  return entry;
}
