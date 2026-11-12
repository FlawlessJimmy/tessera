// 스튜디오 화면 (돌려 보기 · 방에 깔아 보기 · 내 사진에 깔아 보기 + 정보 · 견적)
// 자재 상세 페이지와 스튜디오 페이지가 함께 씁니다.
import { MATERIALS, BY_ID, CATS, CALC, COLORS, calcType, texPath, won, estimate, WALL_RATIO } from './data.js';
import { createStudio } from './viewer.js?v=3';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const MARKUP = (withRail) => `
  <div class="studio-bar">
    <div class="mode-tabs" role="tablist" aria-label="보기 방식">
      <button class="is-on" data-mode="sample" role="tab">돌려 보기</button>
      <button data-mode="room" role="tab">방에 깔아 보기</button>
      <button data-mode="photo" role="tab">내 사진에 깔아 보기</button>
    </div>
  </div>
  <div class="studio-grid">
    <div class="studio-view">
      <div class="stage" data-mode="sample">
        <canvas class="studio-gl"></canvas>
        <div class="photo">
          <div class="photo-stage">
            <img class="photo-img" alt="자재를 깔아 볼 공간 사진" />
            <div class="photo-warp"></div>
            <svg class="photo-outline" preserveAspectRatio="none"><polygon /></svg>
            <button class="photo-handle" aria-label="왼쪽 위 모서리"></button>
            <button class="photo-handle" aria-label="오른쪽 위 모서리"></button>
            <button class="photo-handle" aria-label="오른쪽 아래 모서리"></button>
            <button class="photo-handle" aria-label="왼쪽 아래 모서리"></button>
          </div>
        </div>
        <div class="stage-hint" data-for="sample">끌어서 돌려 보세요</div>
        <div class="stage-hint" data-for="room">마우스를 좌우로 움직이면 방이 돌아갑니다</div>
        <div class="surface-tabs" data-for="room"><button data-surface="floor" class="is-on">바닥에</button><button data-surface="wall">벽에</button></div>
        <div class="photo-tools" data-for="photo">
          <label class="btn btn-small"><input type="file" accept="image/*" class="photo-file" hidden />내 사진 올리기</label>
          <button class="btn btn-small btn-ghost photo-reset">예시 사진</button>
          <label class="photo-scale">무늬 크기 <input type="range" class="photo-range" min="0.4" max="2.5" step="0.05" value="1" /></label>
        </div>
        <div class="stage-hint photo-hint" data-for="photo">네 모서리 점을 끌어 깔 곳에 맞춰 주세요 · 사진은 이 브라우저 밖으로 나가지 않습니다</div>
      </div>
      ${withRail ? '<div class="rail" aria-label="자재 바꾸기"></div>' : ''}
    </div>
    <aside class="panel">
      <p class="panel-cat" data-f="cat"></p>
      <h1 class="panel-name" data-f="ko"></h1>
      <p class="panel-en" data-f="en"></p>
      <p class="panel-tags" data-f="tags"></p>
      <p class="panel-note" data-f="note"></p>
      <dl class="spec">
        <div><dt>규격</dt><dd data-f="spec"></dd></div>
        <div><dt>판매 단위</dt><dd data-f="unit"></dd></div>
        <div><dt>참고가</dt><dd data-f="price"></dd></div>
        <div><dt>평당 자재비</dt><dd data-f="pp"></dd></div>
      </dl>
      <div class="calc">
        <div class="calc-head">
          <label data-f="calcLabel">바닥 면적</label>
          <div class="stepper">
            <button type="button" data-step="-1" aria-label="줄이기">−</button>
            <input class="calc-input" type="number" inputmode="decimal" min="1" max="200" value="24" />
            <span data-f="calcUnit">평</span>
            <button type="button" data-step="1" aria-label="늘리기">+</button>
          </div>
        </div>
        <input type="range" class="calc-range" min="1" max="60" step="1" value="24" aria-label="면적" />
        <ul class="calc-out">
          <li><span>시공 면적</span><b data-f="area"></b></li>
          <li><span>필요 수량</span><b data-f="qty"></b></li>
        </ul>
        <div class="calc-total"><span>예상 자재비</span><strong data-f="total"></strong></div>
        <p class="calc-note" data-f="calcNote"></p>
      </div>
      <a class="btn panel-buy" data-f="buy" href="#shops">판매처 비교 보기 <span>↓</span></a>
    </aside>
  </div>`;

export function mountStudio(root, { id = 'terrazzo_white', mode = 'sample', rail = false, onSelect } = {}) {
  root.innerHTML = MARKUP(rail);
  const panel = $('.panel', root);
  const F = (k) => $(`[data-f="${k}"]`, panel);
  const studio = createStudio({ canvas: $('.studio-gl', root), stage: $('.stage', root), photo: $('.photo', root) });
  let current = BY_ID[id] || BY_ID.terrazzo_white;

  // 모드 · 면
  const modeBtns = $$('.mode-tabs button', root);
  function setMode(m) { modeBtns.forEach((x) => x.classList.toggle('is-on', x.dataset.mode === m)); studio.setMode(m); }
  modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  const surfBtns = $$('.surface-tabs button', root);
  const setSurfaceTab = (s) => surfBtns.forEach((x) => x.classList.toggle('is-on', x.dataset.surface === s));
  surfBtns.forEach((b) => b.addEventListener('click', () => { setSurfaceTab(b.dataset.surface); studio.setSurface(b.dataset.surface); }));
  $('.photo-file', root).addEventListener('change', (e) => { const f = e.target.files[0]; if (f) studio.loadPhoto(f); });
  $('.photo-reset', root).addEventListener('click', () => studio.resetPhoto());
  $('.photo-range', root).addEventListener('input', (e) => studio.setScale(+e.target.value));

  // 자재 줄 (스튜디오 페이지)
  const railEl = $('.rail', root);
  if (railEl) {
    railEl.innerHTML = Object.keys(CATS).map((c) => `<span class="rail-cat">${CATS[c].ko}</span>` + MATERIALS.filter((m) => m.cat === c).map((m) => `
      <button data-id="${m.id}" title="${m.ko}" aria-label="${m.ko}"><i style="background-image:url(${texPath(m.id, 'thumb')})"></i></button>`).join('')).join('');
    railEl.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) select(BY_ID[b.dataset.id]); });
  }

  // 견적: 입력 방식(바닥 평수 · 방 평수 · 벽 ㎡ · 상판 m)마다 값을 따로 기억
  const vals = Object.fromEntries(Object.entries(CALC).map(([k, c]) => [k, c.def]));
  const input = $('.calc-input', root), range = $('.calc-range', root);
  const cfg = () => CALC[calcType(current)];
  function setVal(v, from) {
    const c = cfg();
    v = Math.min(c.max * 4, Math.max(c.min, Math.round((+v || c.min) / c.step) * c.step));
    v = +v.toFixed(2);
    vals[calcType(current)] = v;
    if (from !== 'input') input.value = v;
    range.value = Math.min(c.max, v);
    calc();
  }
  input.addEventListener('input', () => setVal(+input.value, 'input'));
  input.addEventListener('blur', () => setVal(+input.value));
  range.addEventListener('input', () => setVal(+range.value));
  $$('.stepper [data-step]', root).forEach((b) => b.addEventListener('click', () => setVal(+input.value + +b.dataset.step * cfg().step * (cfg().step < 1 ? 5 : 1))));

  let shownTotal = 0;
  function calc() {
    const m = current, t = calcType(m), v = vals[t];
    const r = estimate(m, v);
    F('area').textContent = `${r.area.toFixed(1)}㎡`;
    F('qty').textContent = `${r.qty}${m.unit.replace(/^1/, '').replace(/\(.*\)/, '') || '개'} · 로스 ${Math.round(m.loss * 100)}% 포함`;
    const o = { v: shownTotal };
    gsap.to(o, { v: r.total, duration: 0.5, ease: 'power3.out', onUpdate: () => { F('total').textContent = won(o.v) + '원'; }, onComplete: () => { shownTotal = r.total; } });
    F('calcNote').textContent = {
      room: `벽 면적은 바닥 ${v}평의 약 ${WALL_RATIO}배로 어림했습니다 (천장 높이 2.3m 기준). 시공비 · 부자재 · 배송비는 별도입니다.`,
      floor: '시공비 · 접착제 · 걸레받이 · 배송비는 별도입니다. 실제 견적은 실측 후 달라질 수 있습니다.',
      wall: '포인트 벽 한 면은 보통 6~10㎡입니다. 시공비 · 접착제 · 배송비는 별도입니다.',
      counter: '깊이 60cm 상판 기준입니다. 상판은 장 단위로 재단하므로 남는 양이 많습니다. 가공 · 설치비는 별도입니다.',
    }[t];
  }

  function select(m) {
    current = m;
    railEl && $$('[data-id]', railEl).forEach((b) => b.classList.toggle('is-on', b.dataset.id === m.id));
    setSurfaceTab(studio.setMaterial(m));
    const c = cfg();
    F('cat').textContent = `${CATS[m.cat].ko} · ${CATS[m.cat].en}`;
    F('ko').textContent = m.ko;
    F('en').textContent = m.en;
    F('tags').innerHTML = [...m.spaces.map((s) => `<span>${s}</span>`), `<span>${m.finish}</span>`, `<span><i style="background:${COLORS[m.color]}"></i>${m.color}</span>`].join('');
    F('note').textContent = m.note;
    F('spec').textContent = m.spec;
    F('unit').textContent = `${m.unit} = ${m.unitArea}㎡`;
    F('price').innerHTML = `${won(m.price)}원 <small>/ ${m.unit.replace(/\(.*\)/, '')} · ㎡당 ${won(m.perSqm)}원</small>`;
    F('pp').textContent = `약 ${won(m.perSqm * 3.3058)}원`;
    F('calcLabel').textContent = c.label;
    F('calcUnit').textContent = c.unit;
    range.min = c.min; range.max = c.max; range.step = c.step;
    input.min = c.min; input.step = c.step;
    input.value = vals[calcType(m)]; range.value = Math.min(c.max, vals[calcType(m)]);
    calc();
    const on = railEl && $('.is-on', railEl);
    if (on) railEl.scrollTo({ left: on.offsetLeft - railEl.clientWidth / 2 + on.clientWidth / 2, behavior: 'smooth' });
    // 스튜디오 페이지에서는 상세 페이지의 판매처 비교로 보냅니다
    F('buy').href = railEl ? `material.html?id=${m.id}#shops` : '#shops';
    onSelect?.(m);
  }
  select(current);
  if (mode !== 'sample') setMode(mode);
  return { select: (id2) => select(BY_ID[id2]), setMode, get current() { return current; } };
}
