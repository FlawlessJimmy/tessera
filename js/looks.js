// Room Look 카드: 3D로 찍은 방 사진 + 이름 + 자재비
import { won, roomTotal } from './data.js';

export function lookHTML(r) {
  return `
  <a class="look" href="rooms.html#${r.id}">
    <span class="look-viz" aria-hidden="true"><img src="assets/rooms/${r.id}.jpg" alt="" loading="lazy" decoding="async" /></span>
    <span class="look-body">
      <b>${r.ko}</b><em>${r.en}</em>
      <span class="look-price">4m × 4m 자재비 약 <strong>${won(Math.round(roomTotal(r) / 10000))}만원</strong></span>
    </span>
  </a>`;
}
