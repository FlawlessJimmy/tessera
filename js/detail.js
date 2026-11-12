// 자재 상세: 스튜디오 + 판매처 비교 + 같이 쓰면 좋은 자재 + 이 자재를 쓴 방 + 같은 종류
import { MATERIALS, BY_ID, CATS, ROOMS, texPath, won, shopLinks, roomsUsing, roomTotal } from './data.js';
import { mountStudio } from './studio-ui.js?v=1';
import { cardHTML } from './cards.js?v=1';
import { lookHTML } from './looks.js?v=1';

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const m = BY_ID[params.get('id')] || BY_ID.terrazzo_white;

document.title = `${m.ko} · Tessera`;
$('#crumb').insertAdjacentHTML('beforeend', `<span>/</span><a href="materials.html?cat=${m.cat}">${CATS[m.cat].ko}</a><span>/</span>${m.ko}`);

mountStudio($('#studio'), { id: m.id, mode: params.get('mode') || 'sample' });

// ---------- 판매처 비교 ----------
const links = shopLinks(m);
$('#shopTable').innerHTML = `
  <div class="st-row st-headrow"><span>판매처</span><span>구분</span><span>참고가</span><span></span></div>
  ${links.map((s) => {
    const brand = s.kind !== '검색 결과';
    return `<a class="st-row" href="${s.url}" target="_blank" rel="noopener">
      <span class="st-name"><b>${s.name}</b></span>
      <span class="st-kind">${brand ? '제조 · 유통사' : '쇼핑 검색'}</span>
      <span class="st-price">${brand ? `<strong>${won(m.perSqm)}원</strong> / ㎡` : '실시간 가격 확인'}</span>
      <span class="st-go">바로가기 ↗</span>
    </a>`;
  }).join('')}`;

// ---------- 같이 쓰면 좋은 자재 ----------
// 같은 방 조합에 쓰인 자재 → 같은 공간에서 바닥/벽이 반대인 인기 자재 순
const fromRooms = roomsUsing(m.id).flatMap((r) => ['floor', 'left', 'back', 'counter'].map((k) => r[k]).filter(Boolean));
const pairIds = [...new Set(fromRooms)].filter((id) => id !== m.id);
MATERIALS.filter((x) => x.id !== m.id && x.cat !== m.cat && x.surface !== m.surface && x.spaces.some((s) => m.spaces.includes(s)))
  .sort((a, b) => a.rank - b.rank)
  .forEach((x) => { if (!pairIds.includes(x.id)) pairIds.push(x.id); });
$('#pairGrid').innerHTML = pairIds.slice(0, 4).map((id) => cardHTML(BY_ID[id])).join('');

// ---------- 이 자재를 쓴 방 ----------
const used = roomsUsing(m.id);
if (used.length) {
  $('#looks').hidden = false;
  $('#lookGrid').innerHTML = used.map((r) => lookHTML(r)).join('');
}

// ---------- 같은 종류 ----------
$('#sameTitle').textContent = `다른 ${CATS[m.cat].ko}.`;
$('#sameGrid').innerHTML = MATERIALS.filter((x) => x.cat === m.cat && x.id !== m.id).sort((a, b) => a.rank - b.rank).slice(0, 4).map(cardHTML).join('');
