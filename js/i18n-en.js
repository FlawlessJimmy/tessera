// Tessera 영어 사전 (i18n.js 바로 앞에 일반 <script>로 불러옵니다)
// 키 = 화면의 한국어(띄어쓰기 한 칸으로 정리) · 값 = 영어. 숫자가 들어간 글은 아래 패턴으로 바꿉니다.
(function () {
  const EN = {
    // ---------- 머리말 · 탭 바 · 꼬리말 ----------
    '홈': 'Home',
    '자재': 'Materials',
    '룸': 'Rooms',
    '스튜디오': 'Studio',
    'Tessera 홈': 'Tessera home',
    '주요 메뉴': 'Main menu',
    '자재 검색': 'Search materials',
    '아래 탭': 'Tab bar',
    '꼬리말 메뉴': 'Footer menu',
    '자재 찾기': 'Find materials',
    '포트폴리오 ↗': 'Portfolio ↗',
    'Tessera는 심녕호(Nyeongho Sim)가 기획 · 디자인 · 개발까지 혼자 맡아 만든 가상의 자재 플랫폼입니다. 실제로 영업하는 회사가 아닙니다.':
      'Tessera is a fictional materials platform that Nyeongho Sim planned, designed and built on his own. It is not a real, operating company.',
    '가격은 2026년 11월 기준 시연용 참고가이며, 실제 가격과 재고는 판매처에서 확인해야 합니다.':
      'Prices are demo reference prices as of November 2026. Please check actual prices and stock with each seller.',
    '텍스처: Poly Haven (CC0) · 타일 · 대리석 · 패널 · 패턴 벽지 18종 직접 제작 | Three.js · GSAP · Lenis':
      'Textures: Poly Haven (CC0) · 18 tile, marble, panel and patterned wallpaper textures made in-house | Three.js · GSAP · Lenis',
    'Planned, designed & developed by Nyeongho Sim · 심녕호 작업물': 'Planned, designed &amp; developed by <b>Nyeongho Sim</b>',

    // ---------- 페이지 제목 ----------
    'Tessera · 깔기 전에 먼저 보는 자재': 'Tessera · See materials before you lay them',
    '자재 · Tessera': 'Materials · Tessera',
    '자재 상세 · Tessera': 'Material details · Tessera',
    '스튜디오 · Tessera': 'Studio · Tessera',

    // ---------- 홈: 랜딩(회전하는 방) ----------
    '/ 07 · 자재로 완성한 방': '/ 07 · Rooms finished in our materials',
    '4m × 4m 자재비 약': 'Materials for 4m × 4m: approx.',
    '이 방 자세히 보기 →': 'See this room <span>→</span>',
    '이전 방': 'Previous room',
    '다음 방': 'Next room',
    '스크롤해서 다음 방으로 넘기기': 'Scroll to move to the next room',
    '방 둘러보기 건너뛰기': 'Skip the room tour',
    '조명': 'Lighting',
    '창으로 드는 자연광 5600K': 'Window daylight 5600K',
    '은은한 전구색 2700K': 'Soft warm bulbs 2700K',
    '형광등 주광색 5000K': 'Fluorescent daylight 5000K',
    '거울 백라이트 6000K': 'Mirror backlight 6000K',
    '핀 조명 3000K': 'Pin spotlights 3000K',
    '에디슨 전구 2200K': 'Edison bulbs 2200K',
    '화장대 전구 2700K': 'Vanity bulbs 2700K',
    '바닥': 'Floor',
    '벽': 'Wall',
    '왼쪽 벽': 'Left wall',
    '오른쪽 벽': 'Right wall',
    '정면 벽': 'Back wall',
    '상판': 'Countertop',

    // ---------- 홈: 한 단어 제목 · 검색 ----------
    '하나로': 'alone',
    '달라지는 집.': 'can change a home.',
    '벽 한 면, 바닥 한 칸만 바꿔도 같은 방이 전혀 다른 공간이 됩니다.': 'Change a single wall or a patch of floor and the same room becomes a whole new space. ',
    '마루부터 벽돌까지 34가지 자재를 공간 · 색 · 가격으로 찾아봅니다.': 'Browse 34 materials, from wood floors to brick, by space, color and price.',
    '자재 이름, 색, 공간으로 검색 · 예: 화이트 타일, 욕실 바닥': 'Search by name, color or space · e.g. white tile, bathroom floor',
    '검색': 'Search',
    '미장': 'Plaster',
    '대리석': 'Marble',
    '템바보드': 'Tambour',

    // ---------- 홈: 돌려 보며 고르는 자재 ----------
    '돌려 보며': 'Spin it,',
    '고르는 자재.': 'then pick it.',
    '벽돌 한 장, 타일 한 장을 실제 질감 그대로 360° 돌려 봅니다. 오른쪽에서 자재를 고르고, 왼쪽에서 직접 돌려 보세요.':
      'Turn a single brick or tile a full 360°, real texture and all. Pick a material from the list, then spin it yourself.',
    '드래그해서 360° 돌려 보기': 'Drag to spin 360°',
    '가까이 보기': 'Zoom in',
    '멀리 보기': 'Zoom out',
    '자세히 보기 →': 'View details →',

    // ---------- 홈: 공간으로 찾기 ----------
    '공간으로 찾기 ·': 'Shop by space ·',
    '가장 오래 머무는 곳이라 바닥은 따뜻하게, 벽은 차분하게 고릅니다.': 'It’s where you spend the most time, so go warm on the floor and calm on the walls.',
    '빛을 낮추고 결을 살린 자재로 편히 쉬는 방을 만듭니다.': 'Soft light and textured materials make a room made for rest.',
    '물과 열에 강한 타일과 상판으로 매일 쓰는 곳을 단단하게 채웁니다.': 'Tiles and countertops that stand up to water and heat, for the room you use every day.',
    '젖어도 미끄럽지 않은 바닥과 유광 타일 벽으로 밝게 정리합니다.': 'Slip-resistant floors and glossy tiled walls keep it bright and clean.',
    '집의 첫인상입니다. 벽돌과 미장으로 들어서는 순간의 분위기를 정합니다.': 'It’s your home’s first impression. Brick and plaster set the mood the moment you walk in.',

    // ---------- 홈: 스튜디오로 ----------
    '내 방 사진에 바로 깔아 보기.': 'Try it on a photo of your room.',
    '사진을 올리고 네 모서리만 맞추면 원하는 자재가 그 자리에 깔립니다. 올린 사진은 어디에도 저장되지 않으니 마음 편히 써 보세요.':
      'Upload a photo, line up the four corners, and your material appears right in place. Your photo is never saved anywhere, so feel free to try.',
    '사진 올려 보기 →': 'Upload a photo <span>→</span>',

    // ---------- 종류 ----------
    '마루': 'Wood Flooring',
    '타일': 'Tiles',
    '벽지': 'Wallpaper',
    '도장 · 미장': 'Paint & Plaster',
    '석재 상판': 'Stone Countertops',
    '우드 패널': 'Wood Panels',
    '벽돌': 'Brick',

    // ---------- 공간 · 색 · 마감 ----------
    '거실': 'Living room',
    '침실': 'Bedroom',
    '주방': 'Kitchen',
    '욕실': 'Bathroom',
    '현관': 'Entryway',
    '발코니': 'Balcony',
    '화이트': 'White',
    '베이지': 'Beige',
    '그레이': 'Grey',
    '블랙': 'Black',
    '우드': 'Wood',
    '브라운': 'Brown',
    '그린': 'Green',
    '블루': 'Blue',
    '핑크': 'Pink',
    '레드': 'Red',
    '옐로': 'Yellow',
    '유광': 'Glossy',
    '무광': 'Matte',
    '질감': 'Textured',

    // ---------- 가격대 · 판매처 ----------
    '㎡당 3만원 미만': 'Under ₩30k per ㎡',
    '3만 ~ 6만원': '₩30k–60k',
    '6만 ~ 10만원': '₩60k–100k',
    '10만원 이상': '₩100k and up',
    '동화자연마루': 'Dongwha Natural Maru',
    '구정마루': 'Kujung Maru',
    '한솔홈데코': 'Hansol Homedeco',
    '윤현상재': 'Younhyun Sangjae',
    '대림바스': 'Daelim Bath',
    '신한벽지': 'Shinhan Wallcovering',
    '삼화페인트': 'Samhwa Paint',
    '오늘의집': 'Ohouse',
    '네이버쇼핑': 'Naver Shopping',

    // ---------- 자재 이름 ----------
    '헤링본 오크 원목마루': 'Herringbone Oak Parquet',
    '내추럴 오크 강마루': 'Natural Oak Laminate',
    '와이드 플랭크 원목마루': 'Wide Plank Oak Floor',
    '월넛 브라운 강마루': 'Walnut Brown Laminate',
    '테라조 비앙코 600각': 'Terrazzo Bianco 600',
    '젤리주 그린 100각': 'Zellige Green 100',
    '머스타드 글레이즈 150각': 'Mustard Glaze 150',
    '네이비 롱 서브웨이': 'Navy Long Subway',
    '로즈 핑크 스택': 'Rose Pink Stack',
    '화이트 웨이브 130각': 'White Wave 130',
    '세이지 아치 패턴 200각': 'Sage Arch Pattern 200',
    '시에라 그레이 600×1200': 'Sierra Grey 600×1200',
    '크레마 마블 600×1200': 'Crema Marble 600×1200',
    '테라코타 리브드': 'Terracotta Ribbed',
    '차콜 슬레이트 300×600': 'Charcoal Slate 300×600',
    '스노우 화이트 실크벽지': 'Snow White Silk Wallpaper',
    '샌드 베이지 실크벽지': 'Sand Beige Silk Wallpaper',
    '내추럴 린넨 패브릭 벽지': 'Natural Linen Fabric Wallpaper',
    '그레이지 템바보드': 'Greige Tambour Board',
    '석회 미장 도장': 'Lime Plaster Finish',
    '세이지 핀스트라이프 벽지': 'Sage Pinstripe Wallpaper',
    '테라코타 아치 패턴 벽지': 'Terracotta Arch Wallpaper',
    '마이크로시멘트 그레이': 'Microcement Grey',
    '황토 미장': 'Clay Plaster',
    '노출 콘크리트 질감 도장': 'Raw Concrete Effect Paint',
    '칼라카타 화이트 세라믹 상판': 'Calacatta White Ceramic Slab',
    '네로 마르퀴나 대리석': 'Nero Marquina Marble',
    '클라우드 그레이 쿼츠': 'Cloud Grey Quartz',
    '트래버틴 베이지': 'Travertine Beige',
    '오크 템바보드': 'Oak Tambour Board',
    '월넛 우드 루버': 'Walnut Wood Louver',
    '클래식 레드 파벽돌': 'Classic Red Thin Brick',
    '화이트워시 파벽돌': 'Whitewashed Thin Brick',
    '빈티지 고벽돌': 'Vintage Reclaimed Brick',

    // ---------- 자재 설명 ----------
    '지그재그로 짜 맞춰 거실을 넓고 깊어 보이게 합니다.': 'Laid in a zigzag, it makes a living room look wider and deeper.',
    '밝은 오크 결로 아파트 바닥에 가장 많이 쓰는 기본형입니다.': 'A light oak grain and the go-to basic for apartment floors.',
    '폭이 넓은 판재라 이음매가 적고 나뭇결이 크게 드러납니다.': 'Wide boards mean fewer seams and a bold, open wood grain.',
    '짙은 월넛 톤으로 차분하고 무게감 있는 공간을 만듭니다.': 'A deep walnut tone for a calm, grounded space.',
    '흰 바탕에 색 돌 조각이 박힌 타일입니다. 바닥과 욕실 벽 모두 어울립니다.': 'A white tile set with flecks of colored stone. Works on floors and bathroom walls alike.',
    '손으로 빚어 장마다 색과 물결이 다릅니다. 빛을 받으면 표면이 반짝입니다.': 'Handmade, so every tile has its own color and ripple. The surface shimmers in the light.',
    '진한 겨자색 유약 타일입니다. 주방 벽 한 면에 포인트로 씁니다.': 'A rich mustard glazed tile. Use it as an accent on one kitchen wall.',
    '세로로 길게 쌓는 깊은 남색 타일입니다. 가장자리에 유약이 얇아 빛이 맺힙니다.': 'A deep navy tile stacked vertically. The glaze thins at the edges, where it catches the light.',
    '부드러운 핑크 톤 세로 타일입니다. 파우더룸과 욕실에 잘 맞습니다.': 'A soft pink vertical tile. A great fit for powder rooms and bathrooms.',
    '표면이 물결처럼 굴곡져 흰색이어도 밋밋하지 않습니다.': 'Its rippled surface keeps this white tile from ever looking flat.',
    '반원 무늬를 돌려 깔아 장마다 다른 그림을 만듭니다.': 'Rotate the half-circle motif as you lay it to create a new pattern with every tile.',
    '돌 질감을 담은 큰 판 타일입니다. 줄눈이 적어 공간이 넓어 보입니다.': 'A large-format tile with a stone texture. Fewer grout lines make the room feel bigger.',
    '대리석 무늬에 광을 낸 포세린입니다. 거실 바닥에 고급스러운 반사가 생깁니다.': 'Polished porcelain with a marble pattern. It gives living room floors an elegant sheen.',
    '세로 골이 파인 입체 타일입니다. 조명을 받으면 골마다 그림자가 생깁니다.': 'A 3D tile with vertical ribs. Under light, every rib casts its own shadow.',
    '결이 살아 있는 짙은 회색 석재 타일입니다. 현관과 욕실 바닥에 씁니다.': 'A dark grey stone tile with natural texture. Made for entryway and bathroom floors.',
    '은은한 질감의 흰 벽지입니다. 어느 바닥과도 무난하게 어울립니다.': 'A white wallpaper with a subtle texture. It pairs easily with any floor.',
    '따뜻한 모래색 벽지입니다. 원목마루와 함께 쓰면 공간이 부드러워집니다.': 'A warm, sand-colored wallpaper. Paired with wood floors, it softens the whole room.',
    '실제 천의 짜임이 보이는 벽지입니다. 침실과 서재에 차분한 결을 더합니다.': 'A wallpaper that shows a real fabric weave. It adds calm texture to bedrooms and studies.',
    '세로 홈이 반복되는 벽 패널입니다. 거실 아트월이나 수납장 문에 씁니다.': 'A wall panel with repeating vertical grooves. Use it for a living room feature wall or cabinet doors.',
    '흙손 자국이 남는 석회 마감입니다. 빛이 비치는 각도에 따라 얼룩이 달라 보입니다.': 'A lime finish that keeps its trowel marks. The mottling shifts with the angle of the light.',
    '가는 세이지색 줄이 두 겹으로 지나갑니다. 천장이 높아 보이는 효과가 있습니다.': 'Fine sage stripes run in pairs, making the ceiling look higher.',
    '테라코타색 아치가 엇갈려 반복됩니다. 아이 방이나 파우더룸 한 면에 씁니다.': 'Staggered terracotta arches repeat across the wall. Use it on one wall of a kid’s room or powder room.',
    '이음매 없이 벽과 바닥을 한 면으로 덮는 얇은 시멘트 마감입니다.': 'A thin cement finish that covers walls and floors in one seamless surface.',
    '따뜻한 흙빛 미장입니다. 습도를 머금었다 내보내 실내가 쾌적해집니다.': 'A warm, earthy plaster. It absorbs and releases moisture to keep the air comfortable.',
    '거푸집 자국까지 살린 콘크리트 질감 도장입니다. 카페 같은 분위기를 만듭니다.': 'A concrete-effect paint, right down to the formwork marks. It brings a café feel.',
    '흰 바탕에 회색 결이 길게 흐릅니다. 주방 아일랜드 상판으로 가장 많이 찾습니다.': 'Long grey veins flow across a white base. The most popular pick for kitchen island tops.',
    '검은 돌에 흰 결이 번개처럼 지나갑니다. 세면대나 바 테이블에 씁니다.': 'White veins strike through black stone like lightning. Use it for vanities or bar tables.',
    '고운 점무늬의 인조석입니다. 얼룩과 긁힘에 강해 주방 작업대에 알맞습니다.': 'An engineered stone with a fine speckle. Stain- and scratch-resistant, so it suits kitchen worktops.',
    '가로로 흐르는 결과 작은 구멍이 있는 따뜻한 베이지 돌입니다.': 'A warm beige stone with horizontal veining and small natural pores.',
    '둥근 골이 촘촘히 반복되는 오크 패널입니다. 빛이 옆에서 들면 골마다 그림자가 집니다.': 'An oak panel with tightly repeating rounded ribs. Side light casts a shadow in every groove.',
    '짙은 월넛 막대를 일정한 간격으로 세운 벽입니다. TV 뒤나 침대 헤드월에 씁니다.': 'Dark walnut slats set at even intervals. Use it behind a TV or as a headboard wall.',
    '붉은 점토 벽돌을 얇게 잘라 붙이는 마감입니다. 오래된 공장 같은 분위기가 납니다.': 'Red clay brick sliced thin and applied to the wall. It gives an old-factory feel.',
    '벽돌 위에 석회를 바르고 닦아 낸 흰 벽돌입니다. 밝은 방에서도 무겁지 않습니다.': 'Brick brushed with lime and wiped back to white. It never feels heavy, even in a bright room.',
    '철거한 건물에서 나온 벽돌을 다시 쓴 것입니다. 장마다 색과 모서리가 다릅니다.': 'Brick salvaged from demolished buildings. Every piece has its own color and edges.',

    // ---------- 규격 조각 ----------
    '강마루': 'Laminate',
    '수제 유광': 'Handmade, glossy',
    '유광 웨이브': 'Glossy wave',
    '무광 패턴': 'Matte, patterned',
    '무광 포세린': 'Matte porcelain',
    '폴리싱 포세린': 'Polished porcelain',
    '유광 입체': 'Glossy, 3D relief',
    '석재 질감': 'Stone texture',
    '실크(PVC)': 'Silk (PVC)',
    '패브릭': 'Fabric',
    '종이(합지)': 'Paper (duplex)',
    '석회 도료': 'Lime paint',
    '흙손 2회 마감': 'Two trowel coats',
    '시멘트계 미장재': 'Cement-based plaster',
    '2~3mm 시공': 'Applied 2–3mm thick',
    '황토 미장재': 'Clay plaster',
    '콘크리트 질감 도료': 'Concrete-effect paint',
    '3회 도장': 'Three coats',
    '폴리싱': 'Polished',
    '천연 대리석': 'Natural marble',
    '엔지니어드 스톤': 'Engineered stone',
    '천연석 혼드': 'Honed natural stone',
    '점토 파벽돌': 'Clay thin brick',
    '석회 워싱': 'Limewashed',
    '재생 고벽돌': 'Reclaimed brick',

    // ---------- 방 (Room Looks) ----------
    '노르딕 거실': 'Nordic Living',
    '재팬디 침실': 'Japandi Bedroom',
    '테라조 키친': 'Terrazzo Kitchen',
    '네이비 욕실': 'Navy Bath',
    '웜 아틀리에': 'Warm Atelier',
    '브릭 로프트': 'Brick Loft',
    '아치 파우더룸': 'Arch Powder Room',
    '밝은 오크 바닥에 흰 벽, 템바보드 한 면으로 결을 더했습니다.': 'Light oak floors and white walls, with one tambour wall for texture.',
    '넓은 원목 바닥과 석회 미장, 월넛 루버 헤드월로 차분하게 맞췄습니다.': 'Wide oak planks, lime plaster and a walnut louver headboard wall keep things calm.',
    '테라조 바닥과 젤리주 그린 벽, 칼라카타 상판으로 밝고 선명하게 만들었습니다.': 'Terrazzo floors, a zellige green wall and a Calacatta countertop keep it bright and crisp.',
    '네이비 롱타일 벽에 화이트 웨이브를 더하고, 바닥은 큰 판 그레이로 넓혔습니다.': 'Long navy tiles meet White Wave, and large grey floor tiles open up the space.',
    '헤링본 바닥과 황토 미장, 오크 템바보드로 따뜻한 작업실을 만들었습니다.': 'Herringbone floors, clay plaster and oak tambour make a warm workspace.',
    '화이트워시 벽돌과 마이크로시멘트, 검은 대리석 테이블로 대비를 줬습니다.': 'Whitewashed brick, microcement and a black marble table bring bold contrast.',
    '아치 벽지와 로즈 핑크 타일, 트래버틴 세면대로 작은 방에 포인트를 모았습니다.': 'Arch wallpaper, rose pink tiles and a travertine vanity pack character into a small room.',

    // ---------- 룸 페이지 ----------
    '자재로 완성한 방 7개.': '<em>7</em> rooms, finished in real materials.',
    '스크롤해서 방을 둘러보고, 마음에 드는 방을 눌러 어떤 자재로 꾸몄는지 확인해 보세요': 'Scroll to explore the rooms, then tap one to see which materials it uses.',
    '닫기': 'Close',
    '이 방 자재비 (4m × 4m 기준)': 'Room total (4m × 4m)',
    '자재를 누르면 자세히 보기로 넘어가 돌려 보고, 내 방에 깔아 보고, 판매처까지 비교할 수 있습니다. 시공비는 별도입니다.':
      'Tap a material to open its details: spin it, try it in your room and compare sellers. Installation is not included.',

    // ---------- 자재 목록 ----------
    '원하는 자재를 찾아보세요.': 'Find your material.',
    '이름, 색, 공간': 'Name, color, space',
    '필터': 'Filters',
    '필터 초기화': 'Reset filters',
    '필터 닫기': 'Close filters',
    '결과 보기': 'Show results',
    '가지 자재가 있습니다': ' materials',
    '정렬': 'Sort',
    '인기순': 'Most popular',
    '신상순': 'Newest',
    '㎡당 가격 낮은순': 'Price per ㎡: low to high',
    '㎡당 가격 높은순': 'Price per ㎡: high to low',
    '조건에 맞는 자재가 없습니다.': 'No materials match these filters.',
    '필터를 줄이거나 다른 말로 찾아보세요.': 'Try removing a filter or searching with different words.',
    '종류': 'Type',
    '전체': 'All',
    '공간': 'Space',
    '색상': 'Color',
    '마감': 'Finish',
    '㎡당 가격': 'Price per ㎡',
    '판매처': 'Seller',
    '방에 깔아 보기': 'Try in a room',

    // ---------- 자재 상세 ----------
    '판매처 비교.': 'Compare sellers.',
    '제조 · 유통사 홈페이지와 쇼핑 검색 결과로 바로 연결합니다. 가격은 2026년 11월 기준 참고가입니다.':
      'Links go straight to maker and distributor sites and to shopping search results. Prices are demo reference prices as of November 2026.',
    '같이 쓰면 좋은 자재.': 'Pairs well with.',
    '같은 공간에 잘 어울리는 바닥 · 벽 · 상판 조합입니다.': 'Floor, wall and countertop picks that suit the same space.',
    '이 자재를 쓴 방.': 'Rooms with this material.',
    'Room Looks에서 실제로 깔아 본 조합입니다.': 'Combinations we actually laid out in Room Looks.',
    '같은 종류 다른 자재.': 'More of the same type.',
    '구분': 'Type',
    '참고가': 'Ref. price (demo)',
    '제조 · 유통사': 'Maker / distributor',
    '쇼핑 검색': 'Shopping search',
    '실시간 가격 확인': 'Check live prices',
    '바로가기 ↗': 'Visit ↗',

    // ---------- 스튜디오 ----------
    '직접 깔아 보기': 'Try it yourself',
    '아래 자재 줄에서 고르면 바로 바뀝니다. 마음에 들면 자세히 보기에서 판매처까지 이어집니다.':
      'Pick from the material strip below and it changes instantly. Like one? Open its details to see where to buy it.',
    '이 자재 자세히 보기 →': 'See this material <span>→</span>',
    '보기 방식': 'View mode',
    '돌려 보기': 'Spin',
    '내 사진에 깔아 보기': 'Try on my photo',
    '자재를 깔아 볼 공간 사진': 'Photo of the space to try materials on',
    '왼쪽 위 모서리': 'Top-left corner',
    '오른쪽 위 모서리': 'Top-right corner',
    '오른쪽 아래 모서리': 'Bottom-right corner',
    '왼쪽 아래 모서리': 'Bottom-left corner',
    '끌어서 돌려 보세요': 'Drag to spin it',
    '마우스를 좌우로 움직이면 방이 돌아갑니다': 'Move your mouse left and right to turn the room',
    '바닥에': 'On floor',
    '벽에': 'On wall',
    '내 사진 올리기': 'Upload photo',
    '예시 사진': 'Sample photo',
    '무늬 크기': 'Pattern size',
    '네 모서리 점을 끌어 깔 곳에 맞춰 주세요 · 올린 사진은 어디에도 저장되지 않으니 안심하세요':
      'Drag the four corner points to fit the area · Your photo is never saved anywhere, so feel free to try',
    '자재 바꾸기': 'Change material',
    '규격': 'Size',
    '판매 단위': 'Sold by',
    '평당 자재비': 'Cost per pyeong',
    '바닥 면적': 'Floor area',
    '줄이기': 'Decrease',
    '늘리기': 'Increase',
    '면적': 'Area',
    '시공 면적': 'Area to cover',
    '필요 수량': 'Quantity needed',
    '예상 자재비': 'Estimated material cost',
    '판매처 비교 보기 ↓': 'Compare sellers <span>↓</span>',
    '깔 바닥 면적': 'Floor area to cover',
    '방 바닥 면적 (벽 면적 자동 계산)': 'Room floor area (wall area auto-calculated)',
    '깔 벽 면적': 'Wall area to cover',
    '상판 길이 (깊이 60cm 기준)': 'Countertop length (60cm deep)',
    '평': 'pyeong',
    '시공비 · 접착제 · 걸레받이 · 배송비는 별도입니다. 실제 견적은 실측 후 달라질 수 있습니다.':
      '1 pyeong = 3.3㎡. Installation, adhesive, baseboards and delivery are extra. Your actual quote may change after on-site measuring.',
    '포인트 벽 한 면은 보통 6~10㎡입니다. 시공비 · 접착제 · 배송비는 별도입니다.':
      'A single accent wall is usually 6–10㎡. Installation, adhesive and delivery are extra.',
    '깊이 60cm 상판 기준입니다. 상판은 장 단위로 재단하므로 남는 양이 많습니다. 가공 · 설치비는 별도입니다.':
      'Based on a 60cm-deep countertop. Slabs are cut from whole sheets, so there is more offcut waste. Fabrication and installation are extra.',
  };

  // ---------- 숫자 · 단위 ----------
  const UNIT = { 박스: ['box', 'boxes'], 롤: ['roll', 'rolls'], 장: ['sheet', 'sheets'], 통: ['pail', 'pails'], 세트: ['set', 'sets'], 포: ['bag', 'bags'], 개: ['piece', 'pieces'] };
  const INNER = { 장: ['tile', 'tiles'], 개: ['slat', 'slats'] }; // 1박스(4장) · 1세트(10개)
  const U = '(박스|롤|장|통|세트|포|개)';
  const plural = (n, pair) => (+n === 1 ? pair[0] : pair[1]);
  const t = (s) => (window.i18n ? window.i18n.t(s) : s);
  // 281만원 → ₩2.81M · 86만원 → ₩860K
  const man = (n) => {
    const v = +String(n).replace(/,/g, '');
    if (v < 100) return '₩' + (v * 10).toLocaleString('en-US') + 'K';
    return '₩' + (Math.round(v) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'M';
  };
  const unitEn = (u, n, iu) => `1 ${UNIT[u][0]}` + (n ? ` (${n}${iu === 'kg' ? 'kg' : ' ' + plural(n, INNER[iu] || UNIT[iu])})` : '');

  // 여러 조각이 ' · '로 이어진 글: 조각마다 바꿉니다 ('도장 · 미장'처럼 사전에 통째로 있는 묶음은 먼저 합칩니다)
  function joined(s) {
    const parts = s.split(' · ');
    const out = [];
    for (let i = 0; i < parts.length; i++) {
      const two = i + 1 < parts.length ? parts[i] + ' · ' + parts[i + 1] : null;
      if (two && Object.prototype.hasOwnProperty.call(EN, two)) { out.push(EN[two]); i++; }
      else out.push(t(parts[i]));
    }
    return out.join(' · ');
  }

  const P = [
    [/^([\d,]+)원$/, (m, n) => `₩${n}`],
    [/^약 ([\d,]+)원$/, (m, n) => `About ₩${n}`],
    [/^㎡당 ([\d,]+)원$/, (m, n) => `₩${n} per ㎡`],
    [/^([\d,.]+)만원$/, (m, n) => man(n)],
    [new RegExp(`^(\\d+)${U}$`), (m, n, u) => `${n} ${plural(n, UNIT[u])}`],
    [/^로스 (\d+)% 포함$/, (m, n) => `incl. ${n}% waste`],
    [new RegExp(`^1${U}(?:\\((\\d+)(장|개|kg)\\))?$`), (m, u, n, iu) => unitEn(u, n, iu)],
    [new RegExp(`^1${U}(?:\\((\\d+)(장|개|kg)\\))? = ([\\d.]+)㎡$`), (m, u, n, iu, a) => `${unitEn(u, n, iu)} = ${a}㎡`],
    [new RegExp(`^/ 1${U}$`), (m, u) => `/ ${UNIT[u][0]}`],
    // 규격
    [/^원목층 (\S+)$/, (m, a) => `${a} hardwood top layer`],
    [/^폭 (\S+) × (\S+)$/, (m, a, b) => `${a} wide × ${b}`],
    [/^홈 간격 (\S+)$/, (m, a) => `${a} groove spacing`],
    [/^(.+) 슬랫$/, (m, a) => `${a} slats`],
    [/^간격 (\S+)$/, (m, a) => `${a} gaps`],
    // 견적 안내 (방 평수)
    [/^벽 면적은 바닥 ([\d.]+)평의 약 ([\d.]+)배로 어림했습니다 \(천장 높이 2\.3m 기준\)\. 시공비 · 부자재 · 배송비는 별도입니다\.$/,
      (m, v, k) => `1 pyeong = 3.3㎡. Wall area is estimated at about ${k}× the ${v}-pyeong floor (2.3m ceiling). Installation, supplies and delivery are extra.`],
    // 이름이 들어간 글
    [/^(.+) 자세히 보기$/, (m, a) => `View ${t(a)} details`],
    [/^(.+) 방에 깔아 보기$/, (m, a) => `Try ${t(a)} in a room`],
    [/^(.+) 자재 (\d+)가지 보기$/, (m, a, n) => `See ${n} ${t(a).toLowerCase()} materials`],
    [/^(.+) 자재 보기$/, (m, a) => `See ${t(a).toLowerCase()} materials`],
    [/^(.+) (\d+)가지 모두 보기 →$/, (m, a, n) => `Browse all ${t(a)} (${n}) →`],
    [/^다른 (.+)\.$/, (m, a) => `More ${t(a)}.`],
    [/^(.+) · Tessera$/, (m, a) => `${t(a)} · Tessera`],
    // 마지막: ' · '로 이어진 글
    [/^.+ · .+$/, (m) => joined(m)],
  ];

  window.I18N_EN = EN;
  window.I18N_EN_PATTERNS = P;
})();
