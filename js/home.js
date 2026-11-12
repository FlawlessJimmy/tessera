// 홈 아래쪽 입구: 공간으로 · 종류로 · 추천 방
import { MATERIALS, CATS, ROOMS, texPath } from './data.js';
import { lookHTML } from './looks.js?v=1';

const $ = (s) => document.querySelector(s);
const thumb = (id) => `background-image:url(${texPath(id, 'thumb')})`;

// 공간 카드: 그 공간에 많이 쓰는 자재 4장을 모자이크로
const SPACE_EN = { 거실: 'Living', 침실: 'Bedroom', 주방: 'Kitchen', 욕실: 'Bath', 현관: 'Entry' };
$('#spaceGrid').innerHTML = Object.keys(SPACE_EN).map((s) => {
  const list = MATERIALS.filter((m) => m.spaces.includes(s)).sort((a, b) => a.rank - b.rank);
  return `<a class="space-card" href="materials.html?space=${encodeURIComponent(s)}">
    <span class="space-mosaic">${list.slice(0, 4).map((m) => `<i style="${thumb(m.id)}"></i>`).join('')}</span>
    <span class="space-label"><b>${s}</b><em>${SPACE_EN[s]}</em><span>${list.length}개 자재 →</span></span>
  </a>`;
}).join('');

// 종류 카드: 가장 인기 있는 자재 한 장
$('#catGrid').innerHTML = Object.entries(CATS).map(([k, c]) => {
  const list = MATERIALS.filter((m) => m.cat === k).sort((a, b) => a.rank - b.rank);
  return `<a class="cat-card" href="materials.html?cat=${k}">
    <span class="cat-img" style="${thumb(list[0].id)}"></span>
    <span class="cat-label"><b>${c.ko}</b><em>${c.en}</em><span>${list.length}</span></span>
  </a>`;
}).join('');

// 추천 방 4개
$('#lookGrid').innerHTML = ['kitchen', 'nordic', 'bath', 'atelier'].map((id) => lookHTML(ROOMS.find((r) => r.id === id))).join('');
