// Room Looks 페이지: 방 모형 7개 · 주소의 #방이름으로 바로 열기
import { ROOMS } from './data.js';
import { createRooms } from './rooms.js?v=3';

const $ = (s) => document.querySelector(s);
const rooms = createRooms({
  section: $('#rooms'), canvas: $('#rooms-gl'), labelsEl: $('#roomLabels'), panel: $('#roomPanel'),
  onPick: (id) => { location.href = `material.html?id=${id}`; },
});
const open = () => {
  const i = ROOMS.findIndex((r) => r.id === location.hash.slice(1));
  if (i >= 0) rooms.select(i);
};
addEventListener('hashchange', open);
setTimeout(open, 600);
