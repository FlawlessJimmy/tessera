// 모든 페이지에 똑같이 들어가는 머리말(메뉴) · 꼬리말 · 휴대폰 아래 탭 바
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
        <a href="materials.html?focus=search" class="nav-search" aria-label="자재 검색"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg></a>
      </nav>`;
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
      <nav class="foot-links" aria-label="꼬리말 메뉴">
        <a href="materials.html">자재 찾기</a><a href="rooms.html">룸</a><a href="studio.html">스튜디오</a>
        <a href="https://flawlessjimmy.github.io/hutechc-portfolio/" target="_blank" rel="noopener">포트폴리오 ↗</a>
        <a href="https://github.com/FlawlessJimmy" target="_blank" rel="noopener">GitHub ↗</a>
      </nav>
      <p class="foot-info">Tessera는 심녕호(Nyeongho Sim)가 기획 · 디자인 · 개발까지 혼자 맡아 만든 가상의 자재 플랫폼입니다. 실제로 영업하는 회사가 아닙니다.<br />
      가격은 2026년 11월 기준 시연용 참고가이며, 실제 가격과 재고는 판매처에서 확인해야 합니다.<br />
      텍스처: Poly Haven (CC0) · 타일 · 대리석 · 패널 · 패턴 벽지 18종 직접 제작 | Three.js · GSAP · Lenis</p>
      <div class="foot-bottom">
        <span>© 2026 Nyeongho Sim</span>
        <span class="foot-sign">Planned, designed &amp; developed by <b>Nyeongho Sim</b> · 심녕호 작업물</span>
      </div>
    </div>`;
  }
})();
