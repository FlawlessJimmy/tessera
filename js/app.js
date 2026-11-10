// 카테고리 화면 · 방 모형 · 스튜디오(자재를 누르면 열리는 시트) · 견적 계산
import { MATERIALS, BY_ID, CATS, CALC, calcType, texPath, won, shopLinks, estimate, WALL_RATIO } from './data.js';
import { createStudio } from './viewer.js';
import { buildChapters } from './chapters.js?v=2';
import { createRooms } from './rooms.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const panel = $('#panel');
const F = (k) => $(`[data-f="${k}"]`, panel);
const sheet = $('#sheet');

const studio = createStudio({ canvas: $('#studio-gl'), stage: $('#stage'), photo: $('#photo') });
let current = BY_ID.terrazzo_white;

// ---------- 시트 열고 닫기 ----------
let lastFocus = null;
function openSheet(id) {
  if (id) select(BY_ID[id]);
  if (sheet.classList.contains('is-open')) return;
  lastFocus = document.activeElement;
  sheet.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('sheet-open');
  window.lenis?.stop();
  $('.sheet-inner', sheet).scrollTop = 0;
  setTimeout(() => $('.sheet-close', sheet).focus({ preventScroll: true }), 400);
}
function closeSheet() {
  sheet.classList.remove('is-open');
  sheet.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('sheet-open');
  window.lenis?.start();
  lastFocus?.focus?.({ preventScroll: true });
}
$$('[data-open-sheet]').forEach((b) => b.addEventListener('click', () => openSheet()));
$$('[data-close-sheet]').forEach((b) => b.addEventListener('click', closeSheet));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet(); });

// ---------- 카테고리 가로 스크롤 · 방 모형 ----------
buildChapters($('#materials'), openSheet);
createRooms({ section: $('#rooms'), canvas: $('#rooms-gl'), labelsEl: $('#roomLabels'), panel: $('#roomPanel'), onPick: openSheet });

// ---------- 스튜디오 아래 자재 줄 ----------
const rail = $('#rail');
rail.innerHTML = Object.keys(CATS).map((c) => `<span class="rail-cat">${CATS[c].ko}</span>` + MATERIALS.filter((m) => m.cat === c).map((m) => `
  <button data-id="${m.id}" title="${m.ko}" aria-label="${m.ko}"><i style="background-image:url(${texPath(m.id, 'thumb')})"></i></button>`).join('')).join('');
rail.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) select(BY_ID[b.dataset.id]); });

// ---------- 모드 · 면 ----------
$$('.mode-tabs button').forEach((b) => b.addEventListener('click', () => {
  $$('.mode-tabs button').forEach((x) => x.classList.toggle('is-on', x === b));
  studio.setMode(b.dataset.mode);
}));
$$('.surface-tabs button').forEach((b) => b.addEventListener('click', () => {
  setSurfaceTab(b.dataset.surface);
  studio.setSurface(b.dataset.surface);
}));
function setSurfaceTab(s) { $$('.surface-tabs button').forEach((x) => x.classList.toggle('is-on', x.dataset.surface === s)); }

$('#photoFile').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) studio.loadPhoto(f); });
$('#photoReset').addEventListener('click', () => studio.resetPhoto());
$('#photoScale').addEventListener('input', (e) => studio.setScale(+e.target.value));

// ---------- 견적 ----------
// 입력 방식(바닥 평수 · 방 평수 · 벽 ㎡ · 상판 m)마다 값을 따로 기억합니다.
const vals = Object.fromEntries(Object.entries(CALC).map(([k, c]) => [k, c.def]));
const input = $('#pyeong'), range = $('#pyeongRange');
function cfg() { return CALC[calcType(current)]; }
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
$$('.stepper [data-step]').forEach((b) => b.addEventListener('click', () => setVal(+input.value + +b.dataset.step * cfg().step * (cfg().step < 1 ? 5 : 1))));

const totalEl = F('total');
let shownTotal = 0;
function calc() {
  const m = current, t = calcType(m), v = vals[t];
  const r = estimate(m, v);
  F('area').textContent = `${r.area.toFixed(1)}㎡`;
  F('qty').textContent = `${r.qty}${m.unit.replace(/^1/, '').replace(/\(.*\)/, '') || '개'} · 로스 ${Math.round(m.loss * 100)}% 포함`;
  const o = { v: shownTotal };
  gsap.to(o, { v: r.total, duration: 0.6, ease: 'power3.out', onUpdate: () => { totalEl.textContent = won(o.v) + '원'; }, onComplete: () => { shownTotal = r.total; } });
  F('calcNote').textContent = {
    room: `벽 면적은 바닥 ${v}평의 약 ${WALL_RATIO}배로 어림했습니다 (천장 높이 2.3m 기준). 시공비 · 부자재 · 배송비는 별도입니다.`,
    floor: '시공비 · 접착제 · 걸레받이 · 배송비는 별도입니다. 실제 견적은 실측 후 달라질 수 있습니다.',
    wall: '포인트 벽 한 면은 보통 6~10㎡입니다. 시공비 · 접착제 · 배송비는 별도입니다.',
    counter: '깊이 60cm 상판 기준입니다. 상판은 장 단위로 재단하므로 남는 양이 많습니다. 가공 · 설치비는 별도입니다.',
  }[t];
}

// ---------- 선택 ----------
function select(m) {
  current = m;
  $$('[data-id]', rail).forEach((b) => b.classList.toggle('is-on', b.dataset.id === m.id));
  const surface = studio.setMaterial(m);
  setSurfaceTab(surface);
  const per = m.price / m.unitArea;
  const c = cfg();
  const set = () => {
    F('cat').textContent = `${CATS[m.cat].ko} · ${CATS[m.cat].en}`;
    F('ko').textContent = m.ko;
    F('en').textContent = m.en;
    F('note').textContent = m.note;
    F('spec').textContent = m.spec;
    F('unit').textContent = `${m.unit} = ${m.unitArea}㎡`;
    F('price').innerHTML = `${won(m.price)}원 <small>/ ${m.unit.replace(/\(.*\)/, '')} · ㎡당 ${won(per)}원</small>`;
    F('pp').textContent = `약 ${won(per * 3.3058)}원`;
    F('calcLabel').textContent = c.label;
    F('calcUnit').textContent = c.unit;
    range.min = c.min; range.max = c.max; range.step = c.step;
    input.min = c.min; input.step = c.step;
    input.value = vals[calcType(m)]; range.value = Math.min(c.max, vals[calcType(m)]);
    F('shops').innerHTML = shopLinks(m).map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener"><b>${s.name}</b><span>${s.kind}</span><i>↗</i></a></li>`).join('');
    calc();
  };
  if (panel.dataset.ready && sheet.classList.contains('is-open')) {
    gsap.timeline()
      .to(panel.children, { opacity: 0, y: -8, duration: 0.18, stagger: 0.015 })
      .add(set)
      .to(panel.children, { opacity: 1, y: 0, duration: 0.45, stagger: 0.03, ease: 'power3.out' });
  } else { gsap.set(panel.children, { opacity: 1, y: 0 }); set(); panel.dataset.ready = 1; }
  const on = rail.querySelector('.is-on');
  if (on) rail.scrollTo({ left: on.offsetLeft - rail.clientWidth / 2 + on.clientWidth / 2, behavior: 'smooth' });
}
select(current);

// 모든 가로 스크롤 길이가 정해진 뒤 위치를 다시 계산합니다.
addEventListener('load', () => ScrollTrigger.refresh());
