// 모든 페이지에 똑같이 들어가는 머리말(메뉴 · 검색) · 꼬리말 · 휴대폰 아래 탭 바
(function () {
  const page = document.body.dataset.page || 'home';
  const LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect class="lift" x="14.5" y="14.5" width="9" height="9" rx="1"/></svg>';
  const TABS = [
    { key: 'home', href: 'index.html', label: '홈', icon: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>' },
    { key: 'materials', href: 'materials.html', label: '자재', icon: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>' },
    { key: 'rooms', href: 'rooms.html', label: '룸', icon: '<path d="M4 9l8-5 8 5v10l-8 3-8-3z"/><path d="M12 22V12M4 9l8 3 8-3"/>' },
    { key: 'studio', href: 'studio.html', label: '스튜디오', icon: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>' },
  ];

  const header = document.querySelector('header.nav');
  if (header) {
    header.innerHTML = `
      <a href="index.html" class="logo" aria-label="Tessera 홈">${LOGO}<span>Tessera</span></a>
      <nav class="nav-links" aria-label="주요 메뉴">
        ${TABS.slice(1).map((t) => `<a href="${t.href}"${t.key === page ? ' aria-current="page"' : ''}>${t.label}</a>`).join('')}
      </nav>
      <form class="nav-search" action="materials.html" role="search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
        <input type="search" name="q" placeholder="화이트 타일, 욕실 바닥…" aria-label="자재 검색" />
      </form>
      <span class="nav-credit">A concept by <b>Nyeongho Sim</b></span>`;
    if (page !== 'home') header.classList.add('is-light', 'is-solid');
  }

  const bar = document.createElement('nav');
  bar.className = 'tabbar';
  bar.setAttribute('aria-label', '아래 탭');
  bar.innerHTML = TABS.map((t) => `<a href="${t.href}"${t.key === page ? ' aria-current="page"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg><span>${t.label}</span></a>`).join('');
  document.body.appendChild(bar);

  const footer = document.querySelector('footer.footer');
  if (footer) {
    footer.innerHTML = `
    <div class="wrap">
      <div class="foot-top">
        <p class="foot-kicker">A concept project, designed &amp; built by</p>
        <p class="foot-name">Nyeongho Sim<span>심녕호</span></p>
      </div>
      <div class="foot-cols">
        <div><h4>About</h4><p>Tessera는 심녕호가 기획 · 디자인 · 개발까지 혼자 맡아 만든 가상의 자재 플랫폼입니다. 실제로 영업하는 회사가 아닙니다.</p></div>
        <div><h4>Prices &amp; Links</h4><p>가격은 2026년 11월 기준 시연용 참고가입니다. 판매처 링크는 각 회사 홈페이지와 쇼핑 검색 결과로 연결되며, 실제 가격과 재고는 판매처에서 확인해야 합니다.</p></div>
        <div><h4>Credits</h4><p>마루 · 벽 · 벽돌 · 미장 텍스처와 가구 모델 Poly Haven (CC0)<br />타일 · 대리석 · 패널 · 패턴 벽지 18종 텍스처 직접 제작<br />Three.js · GSAP · Lenis</p></div>
        <div><h4>Nyeongho Sim</h4><p><a href="https://flawlessjimmy.github.io/hutechc-portfolio/" target="_blank" rel="noopener">Portfolio ↗</a><br /><a href="https://github.com/FlawlessJimmy" target="_blank" rel="noopener">GitHub ↗</a></p></div>
      </div>
      <div class="foot-mark" aria-hidden="true">Tessera</div>
      <div class="foot-bottom">
        <span>© 2026 Nyeongho Sim. All rights reserved.</span>
        <span>Planned, designed &amp; developed by Nyeongho Sim · 심녕호 작업물</span>
      </div>
    </div>`;
  }
})();
