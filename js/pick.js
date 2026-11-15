// 돌려 보며 고르는 자재: 왼쪽 무대에서 자재 한 점이 3D로 천천히 돌고 · 오른쪽 목록에서 종류와 자재를 고릅니다.
// 무대를 드래그하면 360° 돌려 보고, 두 번 누르거나 돋보기 버튼으로 가까이 봅니다.
import { MATERIALS, CATS, texPath, won } from './data.js';
import { mountSpecimen } from './specimen.js?v=4';

const ORDER = ['brick', 'wallpaper', 'tile', 'floor', 'paint', 'stone', 'panel'];
const byCat = (k) => MATERIALS.filter((m) => m.cat === k).sort((a, b) => a.rank - b.rank);
// 종류를 고르면 먼저 보여 줄 자재 (장면에서 결이 잘 보이는 것)
const SHOW = { brick: 'red_brick', wallpaper: 'arch_terracotta', tile: 'zellige_green', floor: 'herringbone_parquet', paint: 'clay_plaster', stone: 'calacatta', panel: 'walnut_louver' };
const showOf = (k) => MATERIALS.find((m) => m.id === SHOW[k]) || byCat(k)[0];

// ---------- 화면 ----------
export function mountPick({ stage, list }) {
  stage.innerHTML = `
    <div class="ps-box">
      <span class="ps-hint"><svg viewBox="0 0 24 24"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"/></svg>드래그해서 360° 돌려 보기</span>
      <button type="button" class="ps-zoom" aria-label="가까이 보기"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></svg></button>
    </div>
    <a class="ps-cap" href="#"><span class="ps-cap-name"></span><span class="ps-cap-meta"></span><span class="ps-cap-go">자세히 보기 →</span></a>`;
  const box = stage.querySelector('.ps-box');
  const cap = stage.querySelector('.ps-cap');
  const zoomBtn = stage.querySelector('.ps-zoom');
  let cur = null, auto = true, visible = false, holdCall = null;

  const viewer = mountSpecimen(box, {
    // 직접 돌려 보기 시작하면 자동 넘김을 멈추고 안내를 숨깁니다.
    onGrab: () => { auto = false; holdCall?.kill(); box.classList.add('is-touched'); },
  });
  zoomBtn.addEventListener('click', () => {
    auto = false; holdCall?.kill();
    viewer.setZoom(viewer.zoomed ? 1 : 1.7);
    zoomBtn.setAttribute('aria-label', viewer.zoomed ? '멀리 보기' : '가까이 보기');
  });

  list.innerHTML = ORDER.map((k) => {
    const items = byCat(k);
    return `
    <li class="pk-item" data-cat="${k}">
      <button type="button" class="pk-cat" aria-expanded="false"><span>${CATS[k].ko}</span><sup>${items.length}</sup></button>
      <div class="pk-body"><div class="pk-inner">
        <div class="pk-swatches">${items.map((m) => `
          <button type="button" class="pk-sw" data-id="${m.id}" title="${m.ko}">
            <i style="background-image:url(${texPath(m.id, 'thumb')})"></i><span>${m.ko}</span>
          </button>`).join('')}
        </div>
        <a class="pk-more" href="materials.html?cat=${k}">${CATS[k].ko} ${items.length}가지 모두 보기 →</a>
      </div></div>
    </li>`;
  }).join('');

  function play(m) {
    cur = m;
    holdCall?.kill();
    list.querySelectorAll('.pk-item').forEach((li) => {
      const on = li.dataset.cat === m.cat;
      li.classList.toggle('is-on', on);
      li.querySelector('.pk-cat').setAttribute('aria-expanded', on);
    });
    list.querySelectorAll('.pk-sw').forEach((b) => b.classList.toggle('is-on', b.dataset.id === m.id));
    stage.dataset.cat = m.cat;
    cap.href = `material.html?id=${m.id}`;
    cap.querySelector('.ps-cap-name').textContent = m.ko;
    cap.querySelector('.ps-cap-meta').textContent = `${CATS[m.cat].ko} · ㎡당 ${won(m.perSqm)}원`;
    viewer.show(m);
    queueNext();
  }

  // 아무것도 누르지 않았으면 한 바퀴쯤 돈 뒤 다음 종류로 넘어갑니다.
  function queueNext() {
    holdCall?.kill();
    if (!auto) return;
    holdCall = gsap.delayedCall(7, () => {
      if (!auto) return;
      if (!visible) { queueNext(); return; }
      const next = ORDER[(ORDER.indexOf(cur.cat) + 1) % ORDER.length];
      play(showOf(next));
    });
  }

  list.addEventListener('click', (e) => {
    const sw = e.target.closest('.pk-sw');
    const cat = e.target.closest('.pk-cat');
    if (sw) { auto = false; play(MATERIALS.find((m) => m.id === sw.dataset.id)); }
    else if (cat) {
      auto = false;
      const k = cat.closest('.pk-item').dataset.cat;
      if (k !== cur?.cat) play(showOf(k));
    }
  });

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.35 }).observe(stage);

  const q = new URLSearchParams(location.search).get('pick');
  play(showOf(ORDER.includes(q) ? q : ORDER[0]));
}
