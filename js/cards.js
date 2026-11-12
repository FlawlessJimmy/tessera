// 자재 카드 한 장 (자재 목록 · 상세 페이지 추천 칸에서 같이 씁니다)
import { CATS, texPath, won } from './data.js';

export function cardHTML(m) {
  return `
  <li class="mcard">
    <a class="mcard-link" href="material.html?id=${m.id}">
      <span class="mcard-img">
        <i style="background-image:url(${texPath(m.id, 'thumb')})"></i>
        <span class="mcard-badges">${m.isNew ? '<b>NEW</b>' : ''}${m.finish === '유광' ? '<b class="soft">유광</b>' : ''}</span>
      </span>
      <span class="mcard-body">
        <span class="mcard-cat">${CATS[m.cat].ko} · ${m.spaces.slice(0, 2).join(' · ')}</span>
        <b class="mcard-name">${m.ko}</b>
        <span class="mcard-en">${m.en}</span>
        <span class="mcard-price"><strong>${won(m.perSqm)}원</strong> / ㎡</span>
      </span>
    </a>
    <a class="mcard-try" href="material.html?id=${m.id}&mode=room" aria-label="${m.ko} 방에 깔아 보기">방에 깔아 보기</a>
  </li>`;
}
