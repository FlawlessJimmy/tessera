// Room Look 카드: 실제 자재로 칠한 작은 방 모서리 그림 + 이름 + 자재비
import { texPath, won, roomTotal } from './data.js';

const bg = (id) => `background-image:url(${texPath(id, 'thumb')})`;
export function lookHTML(r) {
  return `
  <a class="look" href="rooms.html#${r.id}">
    <span class="look-viz" aria-hidden="true">
      <i class="lv-back" style="${bg(r.back)}"></i>
      <i class="lv-left" style="${bg(r.left)}"></i>
      <i class="lv-floor" style="${bg(r.floor)}"></i>
      ${r.counter ? `<i class="lv-counter" style="${bg(r.counter)}"></i>` : ''}
    </span>
    <span class="look-body">
      <b>${r.ko}</b><em>${r.en}</em>
      <span class="look-price">4m × 4m 자재비 약 <strong>${won(Math.round(roomTotal(r) / 10000))}만원</strong></span>
    </span>
  </a>`;
}
