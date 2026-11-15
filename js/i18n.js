/* 한국어 · 영어 전환 (KOR · EN)  — 일반 <script>로, 사전 파일(i18n-en.js) 바로 다음 · 다른 스크립트보다 먼저 불러옵니다.
   - 언어: 주소의 ?lang=en | ?lang=ko → 없으면 이전에 고른 언어(localStorage 'lang') → 없으면 한국어
   - 영어일 때 화면의 한국어를 사전(window.I18N_EN)으로 바꿉니다.
       1) 묶음 바꾸기: 요소 전체 글(textContent)이 사전에 있으면 그 요소의 안쪽을 통째로 바꿉니다(영어 값에 <span class="hl"> 같은 태그 가능).
          안쪽에 id가 있는 요소가 있으면(스크립트가 붙잡고 있는 요소) 묶음으로 바꾸지 않고 글 조각마다 바꿉니다.
       2) 글 조각 바꾸기: 남은 한국어 글 조각을 하나씩 사전 · 패턴으로 바꿉니다.
       3) 속성: placeholder · aria-label · title · alt · data-cursor
       4) 나중에 스크립트가 넣는 글도 MutationObserver로 자동으로 바꿉니다.
   - 같은 사이트 안 링크(같은 origin)는 영어일 때 ?lang=en 을 붙여 언어가 이어지게 합니다.
   - 번역이 없는 한국어는 window.i18n.missing 에 모입니다(개발 확인용).
*/
(function () {
  const EN = window.I18N_EN || {};
  const PATTERNS = window.I18N_EN_PATTERNS || []; // [[RegExp(전체 일치), (m, ...g) => 'English']]
  const q = new URLSearchParams(location.search).get('lang');
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  const lang = q === 'en' || q === 'ko' ? q : saved === 'en' ? 'en' : 'ko';
  try { if (q === 'en' || q === 'ko') localStorage.setItem('lang', q); } catch (e) {}
  const isEn = lang === 'en';
  document.documentElement.lang = isEn ? 'en' : 'ko';
  document.documentElement.dataset.lang = lang;

  const HANGUL = /[ㄱ-ㆎ가-힣]/;
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const missing = new Set();

  function t(s) {
    if (!isEn || s == null) return s;
    const k = norm(String(s));
    if (!k || !HANGUL.test(k)) return s;
    if (Object.prototype.hasOwnProperty.call(EN, k)) return EN[k];
    for (const [re, f] of PATTERNS) {
      const m = k.match(re);
      if (m) return typeof f === 'function' ? f(...m) : k.replace(re, f);
    }
    missing.add(k);
    return s;
  }

  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'svg', 'SVG']);
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'data-cursor'];
  const BLOCKY = /^(P|H1|H2|H3|H4|H5|H6|LI|DT|DD|SPAN|B|STRONG|EM|SMALL|A|BUTTON|LABEL|FIGCAPTION|TD|TH|DIV|I|OPTION|LEGEND|SUMMARY|CAPTION|BLOCKQUOTE)$/;

  function trAttrs(el) {
    for (const a of ATTRS) {
      const v = el.getAttribute && el.getAttribute(a);
      if (v && HANGUL.test(v)) { const r = t(v); if (r !== v) el.setAttribute(a, r); }
    }
    if (el.tagName === 'A' && isEn) {
      const h = el.getAttribute('href');
      if (h && !h.startsWith('#') && !/^(mailto|tel|javascript):/i.test(h)) {
        try {
          const u = new URL(h, location.href);
          if (u.origin === location.origin && u.searchParams.get('lang') !== 'en') {
            u.searchParams.set('lang', 'en');
            el.setAttribute('href', u.pathname + u.search + u.hash);
          }
        } catch (e) {}
      }
    }
  }
  function trTextNode(n) {
    const v = n.nodeValue;
    if (!v || !HANGUL.test(v)) return;
    const k = norm(v), r = t(k);
    if (r !== k) n.nodeValue = v.replace(k.length ? v.trim() : v, r);
  }
  function walk(root) {
    if (!isEn || !root) return;
    if (root.nodeType === 3) { trTextNode(root); return; }
    if (root.nodeType !== 1 || SKIP.has(root.tagName)) return;
    // 1) 묶음 바꾸기
    //    (그림 · 아이콘 · 입력칸 · 나중에 글이 채워질 빈 칸이 안에 있으면 통째로 바꾸면 사라지므로 글 조각마다 바꿉니다)
    if (BLOCKY.test(root.tagName) && root.children.length && HANGUL.test(root.textContent) && !root.querySelector('[id], svg, img, i, input, select, textarea, canvas, video, picture')
      && ![...root.querySelectorAll('*')].some((e) => e.tagName !== 'BR' && !e.textContent.trim())) {
      const k = norm(root.textContent);
      // 글이 안쪽 한 조각(<b>이름</b> 등)에만 있고 영어에 태그가 없으면, 안쪽 태그를 살리도록 글 조각 바꾸기로 넘깁니다
      const oneText = root.childNodes.length === 1 && !/</.test(EN[k] || '');
      if (Object.prototype.hasOwnProperty.call(EN, k) && !oneText) { root.innerHTML = EN[k]; trAttrs(root); return; }
    }
    trAttrs(root);
    for (let c = root.firstChild; c; c = c.nextSibling) walk(c);
  }

  function apply(root) {
    if (!isEn) return;
    walk(root || document.body);
    if (HANGUL.test(document.title)) document.title = t(document.title);
  }

  let obs = null;
  function watch() {
    if (!isEn || obs) return;
    obs = new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === 'characterData') trTextNode(m.target);
        else if (m.type === 'attributes') trAttrs(m.target);
        else m.addedNodes.forEach((n) => walk(n));
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(['href']) });
  }

  function setLang(l) {
    try { localStorage.setItem('lang', l); } catch (e) {}
    const u = new URL(location.href);
    u.searchParams.set('lang', l);
    location.href = u.toString();
  }

  // KOR · EN 버튼: 사이트가 원하는 자리에 넣습니다. mountToggle(부모요소, { className })
  function mountToggle(parent, opts) {
    if (!parent) return null;
    const box = document.createElement('div');
    box.className = 'lang-toggle' + (opts && opts.className ? ' ' + opts.className : '');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', isEn ? 'Language' : '언어');
    box.innerHTML = '<button type="button" data-l="ko" lang="ko">KOR</button><button type="button" data-l="en" lang="en">EN</button>';
    box.querySelectorAll('button').forEach((b) => {
      const on = b.dataset.l === lang;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
      b.addEventListener('click', () => { if (b.dataset.l !== lang) setLang(b.dataset.l); });
    });
    if (opts && opts.prepend) parent.prepend(box); else parent.appendChild(box);
    return box;
  }

  window.i18n = { lang, isEn, t, apply, missing, mountToggle, setLang };
  if (isEn) {
    if (document.body) { apply(document.body); watch(); }
    else document.addEventListener('DOMContentLoaded', () => { apply(document.body); watch(); });
  }
})();
