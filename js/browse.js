// 자재 찾기: 종류 탭 · 검색 · 필터(공간 · 색 · 마감 · 가격 · 판매처) · 정렬 · 카드 목록
import { MATERIALS, CATS, SPACES, COLORS, FINISHES, PRICE_BANDS, BRANDS, texPath, won, searchText } from './data.js';
import { VISUALS, MOTIONS } from './chapters.js?v=6';
import { cardHTML } from './cards.js?v=1';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- 상태 (주소창과 같이 움직여서 공유 · 뒤로 가기가 됩니다) ----------
const params = new URLSearchParams(location.search);
const multi = (k) => (params.get(k) ? params.get(k).split(',') : []);
const state = {
  cat: params.get('cat') || 'all',
  q: params.get('q') || '',
  sort: params.get('sort') || 'popular',
  space: multi('space'), color: multi('color'), finish: multi('finish'), price: multi('price'), brand: multi('brand'),
};
const GROUPS = [
  { key: 'space', title: '공간', options: SPACES.map((s) => ({ v: s, label: s })), test: (m, v) => m.spaces.includes(v) },
  { key: 'color', title: '색상', options: Object.keys(COLORS).map((c) => ({ v: c, label: c, dot: COLORS[c] })), test: (m, v) => m.color === v },
  { key: 'finish', title: '마감', options: FINISHES.map((f) => ({ v: f, label: f })), test: (m, v) => m.finish === v },
  { key: 'price', title: '㎡당 가격', options: PRICE_BANDS.map((p) => ({ v: p.key, label: p.label })), test: (m, v) => { const b = PRICE_BANDS.find((p) => p.key === v); return m.perSqm >= b.min && m.perSqm < b.max; } },
  { key: 'brand', title: '판매처', options: Object.entries(BRANDS).map(([k, b]) => ({ v: k, label: b.name })), test: (m, v) => m.brands.includes(v) },
];
const label = (g, v) => GROUPS.find((x) => x.key === g).options.find((o) => o.v === v)?.label || v;

function matches(m, skip) {
  if (state.cat !== 'all' && m.cat !== state.cat) return false;
  if (state.q) {
    const t = searchText(m);
    if (!state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => t.includes(w))) return false;
  }
  return GROUPS.every((g) => g.key === skip || !state[g.key].length || state[g.key].some((v) => g.test(m, v)));
}
const SORTS = {
  popular: (a, b) => a.rank - b.rank,
  new: (a, b) => (b.isNew - a.isNew) || a.rank - b.rank,
  low: (a, b) => a.perSqm - b.perSqm,
  high: (a, b) => b.perSqm - a.perSqm,
};

function syncURL() {
  const p = new URLSearchParams();
  if (state.cat !== 'all') p.set('cat', state.cat);
  if (state.q) p.set('q', state.q);
  if (state.sort !== 'popular') p.set('sort', state.sort);
  GROUPS.forEach((g) => state[g.key].length && p.set(g.key, state[g.key].join(',')));
  history.replaceState(null, '', p.toString() ? `?${p}` : location.pathname);
}

// ---------- 종류 탭 ----------
const tabs = $('#catTabs');
function renderTabs() {
  const all = [{ k: 'all', ko: '전체', n: MATERIALS.length }, ...Object.entries(CATS).map(([k, c]) => ({ k, ko: c.ko, n: MATERIALS.filter((m) => m.cat === k).length }))];
  tabs.innerHTML = all.map((t) => `<button type="button" data-cat="${t.k}" class="${state.cat === t.k ? 'is-on' : ''}" aria-pressed="${state.cat === t.k}">${t.ko}<span>${t.n}</span></button>`).join('');
}
tabs.addEventListener('click', (e) => {
  const b = e.target.closest('[data-cat]');
  if (!b || b.dataset.cat === state.cat) return;
  state.cat = b.dataset.cat;
  renderTabs(); renderIntro(); update();
});

// ---------- 종류 소개 (짧은 띠 + 그 자재다운 움직임 한 번) ----------
const intro = $('#catIntro');
function renderIntro() {
  if (state.cat === 'all') { intro.hidden = true; intro.innerHTML = ''; return; }
  const c = CATS[state.cat];
  intro.hidden = false;
  intro.innerHTML = `
    <div class="ci-text">
      <span class="ch-no">${c.no} / 07</span>
      <h2>${c.en.replace(/ & /, ' <em>&amp;</em> ')}</h2>
      <p><b>${c.ko}</b>${c.line}</p>
    </div>
    <div class="ci-visual">${VISUALS[state.cat]()}</div>`;
  const tl = gsap.timeline({ paused: true });
  MOTIONS[state.cat](intro.querySelector('.mv'), tl);
  tl.duration(1.4).play(0);
  gsap.from(intro.querySelectorAll('.ci-text > *'), { y: 18, opacity: 0, stagger: 0.06, duration: 0.6, ease: 'power3.out' });
}

// ---------- 필터 ----------
const fBody = $('#filters .filters-body');
function renderFilters() {
  fBody.innerHTML = GROUPS.map((g) => `
    <fieldset class="fgroup">
      <legend>${g.title}</legend>
      <div class="fopts ${g.key === 'color' ? 'colors' : ''}">
        ${g.options.map((o) => {
          const n = MATERIALS.filter((m) => matches(m, g.key) && g.test(m, o.v)).length;
          const on = state[g.key].includes(o.v);
          return `<button type="button" class="fopt${on ? ' is-on' : ''}" data-g="${g.key}" data-v="${o.v}" aria-pressed="${on}" ${n === 0 && !on ? 'disabled' : ''}>
            ${o.dot ? `<i style="background:${o.dot}"></i>` : ''}${o.label}<span>${n}</span></button>`;
        }).join('')}
      </div>
    </fieldset>`).join('');
}
fBody.addEventListener('click', (e) => {
  const b = e.target.closest('.fopt');
  if (!b) return;
  const arr = state[b.dataset.g], v = b.dataset.v;
  const i = arr.indexOf(v);
  i >= 0 ? arr.splice(i, 1) : arr.push(v);
  update();
});
function resetAll() { GROUPS.forEach((g) => { state[g.key] = []; }); state.q = ''; $('#q').value = ''; update(); }
$('#resetFilters').addEventListener('click', resetAll);
$('#emptyReset').addEventListener('click', () => { state.cat = 'all'; renderTabs(); renderIntro(); resetAll(); });

// 휴대폰: 필터를 아래에서 올라오는 창으로
const filtersEl = $('#filters');
const openF = () => { filtersEl.classList.add('is-open'); document.documentElement.classList.add('no-scroll'); window.lenis?.stop(); };
const closeF = () => { filtersEl.classList.remove('is-open'); document.documentElement.classList.remove('no-scroll'); window.lenis?.start(); };
$('#openFilters').addEventListener('click', openF);
$('#closeFilters').addEventListener('click', closeF);
$('#applyFilters').addEventListener('click', closeF);

// ---------- 선택된 필터 칩 ----------
const chips = $('#activeChips');
function renderChips() {
  const list = [];
  if (state.q) list.push({ g: 'q', v: state.q, l: `“${state.q}”` });
  GROUPS.forEach((g) => state[g.key].forEach((v) => list.push({ g: g.key, v, l: label(g.key, v) })));
  chips.innerHTML = list.map((c) => `<button type="button" class="chip" data-g="${c.g}" data-v="${c.v}">${c.l}<span aria-hidden="true">×</span></button>`).join('');
  $('#openFilters').dataset.n = list.filter((c) => c.g !== 'q').length || '';
}
chips.addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  if (b.dataset.g === 'q') { state.q = ''; $('#q').value = ''; } else state[b.dataset.g] = state[b.dataset.g].filter((v) => v !== b.dataset.v);
  update();
});

// ---------- 검색 · 정렬 ----------
const qInput = $('#q');
qInput.value = state.q;
let qt;
qInput.addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(() => { state.q = qInput.value.trim(); update(); }, 180); });
$('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); state.q = qInput.value.trim(); update(); });
const sortSel = $('#sort');
sortSel.value = state.sort;
sortSel.addEventListener('change', () => { state.sort = sortSel.value; update(); });

// ---------- 목록 ----------
const grid = $('#grid');
function update() {
  const list = MATERIALS.filter((m) => matches(m)).sort(SORTS[state.sort]);
  grid.innerHTML = list.map((m) => cardHTML(m)).join('');
  $('#empty').hidden = list.length > 0;
  $('#total').textContent = `${list.length}`;
  renderFilters(); renderChips(); syncURL();
  gsap.fromTo(grid.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.025, ease: 'power3.out', overwrite: true });
  ScrollTrigger.refresh();
}

renderTabs();
renderIntro();
update();
