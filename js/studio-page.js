// 스튜디오 페이지: 자재 줄에서 골라 바로 깔아 보기
import { mountStudio } from './studio-ui.js?v=1';

const params = new URLSearchParams(location.search);
const go = document.getElementById('toDetail');
mountStudio(document.getElementById('studio'), {
  id: params.get('id') || 'herringbone_parquet',
  mode: params.get('mode') || 'room',
  rail: true,
  onSelect: (m) => {
    go.href = `material.html?id=${m.id}`;
    go.firstChild.textContent = `${m.ko} 자세히 보기 `;
    const p = new URLSearchParams(location.search);
    p.set('id', m.id);
    history.replaceState(null, '', `?${p}`);
  },
});
