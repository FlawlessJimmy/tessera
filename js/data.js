// Tessera 자재 데이터
// 가격은 시연용 참고가입니다. 실제 가격은 판매처에서 확인해야 합니다.
// dim = 텍스처 한 장이 실제로 덮는 크기(mm). 화면에서 실제 크기 비율로 보이게 하는 기준입니다.

export const BRANDS = {
  lxzin:   { name: 'LX Z:IN',     url: 'https://www.lxzin.com' },
  dongwha: { name: '동화자연마루', url: 'https://dongwhafloor.com' },
  kujung:  { name: '구정마루',     url: 'https://www.kujungmaru.com' },
  hansol:  { name: '한솔홈데코',   url: 'https://www.hansolhomedeco.co.kr' },
  younhyun:{ name: '윤현상재',     url: 'https://www.younhyun.com' },
  daelim:  { name: '대림바스',     url: 'https://www.daelimbath.com' },
  shinhan: { name: '신한벽지',     url: 'https://www.shinhanwall.co.kr' },
  samhwa:  { name: '삼화페인트',   url: 'https://spsamhwa.com' },
};

// 스크롤하면서 보여 줄 카테고리 순서 · calc = 견적 방식
export const CATS = {
  floor:     { no: '01', ko: '마루',       en: 'Wood Floor',      line: '발끝에 닿는 결.',          calc: 'floor' },
  tile:      { no: '02', ko: '타일',       en: 'Ceramic & Tile',  line: '빛을 머금는 유약.',        calc: 'floor' },
  wallpaper: { no: '03', ko: '벽지',       en: 'Wallcovering',    line: '방의 첫인상을 정하는 면.', calc: 'room' },
  paint:     { no: '04', ko: '도장 · 미장', en: 'Paint & Plaster', line: '흙손이 남긴 손자국.',      calc: 'room' },
  stone:     { no: '05', ko: '석재 상판',   en: 'Stone Surface',   line: '한 장으로 이어지는 돌결.', calc: 'counter' },
  panel:     { no: '06', ko: '우드 패널',   en: 'Wood Panel',      line: '그림자로 만드는 리듬.',    calc: 'wall' },
  brick:     { no: '07', ko: '벽돌',       en: 'Brick',           line: '한 장씩 쌓아 올린 벽.',    calc: 'wall' },
};

// unitArea: 판매 단위 1개가 덮는 면적(㎡) · price: 판매 단위 1개 참고가(원) · loss: 자르고 남는 양(로스율)
export const MATERIALS = [
  // ---------- 마루 ----------
  { id: 'herringbone_parquet', cat: 'floor', ko: '헤링본 오크 원목마루', en: 'Herringbone Oak',
    spec: '90 × 600 × 15mm · 원목층 3mm', unit: '1박스', unitArea: 1.08, price: 82000, loss: 0.08,
    dim: 3400, thick: 15, side: '#93704d', rough: 1, brands: ['dongwha', 'kujung'], q: '헤링본 원목마루',
    note: '지그재그로 짜 맞춰 거실을 넓고 깊어 보이게 합니다.' },
  { id: 'laminate_floor_02', cat: 'floor', ko: '내추럴 오크 강마루', en: 'Natural Oak',
    spec: '95 × 800 × 7.5mm · 강마루', unit: '1박스', unitArea: 1.14, price: 32000, loss: 0.05,
    dim: 1700, thick: 8, side: '#9b8063', rough: 1, brands: ['lxzin', 'dongwha'], q: '오크 강마루',
    note: '밝은 오크 결로 아파트 바닥에 가장 많이 쓰는 기본형입니다.' },
  { id: 'oak_wood_planks', cat: 'floor', ko: '와이드 플랭크 원목마루', en: 'Wide Plank Oak',
    spec: '190 × 1900 × 14mm · 원목층 4mm', unit: '1박스', unitArea: 1.44, price: 128000, loss: 0.06,
    dim: 1200, thick: 14, side: '#a27554', rough: 1, brands: ['kujung', 'dongwha'], q: '광폭 원목마루',
    note: '폭이 넓은 판재라 이음매가 적고 나뭇결이 크게 드러납니다.' },
  { id: 'wood_floor', cat: 'floor', ko: '월넛 브라운 강마루', en: 'Walnut Brown',
    spec: '95 × 800 × 7.5mm · 강마루', unit: '1박스', unitArea: 1.14, price: 34000, loss: 0.05,
    dim: 1700, thick: 8, side: '#806042', rough: 1, brands: ['lxzin', 'hansol'], q: '월넛 강마루',
    note: '짙은 월넛 톤으로 차분하고 무게감 있는 공간을 만듭니다.' },

  // ---------- 타일 ----------
  { id: 'terrazzo_white', cat: 'tile', ko: '테라조 비앙코 600각', en: 'Terrazzo Bianco',
    spec: '600 × 600 × 12mm · 무광', unit: '1박스(4장)', unitArea: 1.44, price: 64000, loss: 0.10,
    dim: 1800, thick: 12, side: '#e6e0d5', rough: 1, brands: ['younhyun', 'daelim'], q: '테라조 타일 600',
    note: '흰 바탕에 색 돌 조각이 박힌 타일입니다. 바닥과 욕실 벽 모두 어울립니다.' },
  { id: 'zellige_green', cat: 'tile', ko: '젤리주 그린 100각', en: 'Zellige Green',
    spec: '100 × 100 × 9mm · 수제 유광', unit: '1박스(50장)', unitArea: 0.5, price: 59000, loss: 0.12,
    dim: 600, thick: 9, side: '#d9d2c4', rough: 1, brands: ['younhyun'], q: '젤리주 타일 그린',
    note: '손으로 빚어 장마다 색과 물결이 다릅니다. 빛을 받으면 표면이 반짝입니다.' },
  { id: 'glaze_mustard', cat: 'tile', ko: '머스타드 글레이즈 150각', en: 'Mustard Glaze',
    spec: '150 × 150 × 8mm · 유광', unit: '1박스(44장)', unitArea: 0.99, price: 42000, loss: 0.10,
    dim: 600, thick: 8, side: '#e8e0cf', rough: 1, brands: ['younhyun', 'daelim'], q: '옐로우 유광 타일',
    note: '진한 겨자색 유약 타일입니다. 주방 벽 한 면에 포인트로 씁니다.' },
  { id: 'navy_long', cat: 'tile', ko: '네이비 롱 서브웨이', en: 'Navy Long Subway',
    spec: '65 × 260 × 9mm · 유광', unit: '1박스(30장)', unitArea: 0.51, price: 36000, loss: 0.12,
    dim: 520, thick: 9, side: '#d6d0c6', rough: 1, brands: ['younhyun', 'daelim'], q: '네이비 서브웨이 타일',
    note: '세로로 길게 쌓는 깊은 남색 타일입니다. 가장자리에 유약이 얇아 빛이 맺힙니다.' },
  { id: 'pink_stack', cat: 'tile', ko: '로즈 핑크 스택', en: 'Rose Stack',
    spec: '70 × 280 × 8mm · 유광', unit: '1박스(26장)', unitArea: 0.51, price: 33000, loss: 0.12,
    dim: 560, thick: 8, side: '#efe7df', rough: 1, brands: ['younhyun'], q: '핑크 스틱 타일',
    note: '부드러운 핑크 톤 세로 타일입니다. 파우더룸과 욕실에 잘 맞습니다.' },
  { id: 'white_wave', cat: 'tile', ko: '화이트 웨이브 130각', en: 'White Wave',
    spec: '130 × 130 × 9mm · 유광 웨이브', unit: '1박스(30장)', unitArea: 0.51, price: 38000, loss: 0.10,
    dim: 520, thick: 9, side: '#efebe3', rough: 1, brands: ['younhyun', 'daelim'], q: '웨이브 타일 화이트',
    note: '표면이 물결처럼 굴곡져 흰색이어도 밋밋하지 않습니다.' },
  { id: 'sage_pattern', cat: 'tile', ko: '세이지 아치 패턴 200각', en: 'Sage Arch',
    spec: '200 × 200 × 10mm · 무광 패턴', unit: '1박스(25장)', unitArea: 1.0, price: 54000, loss: 0.10,
    dim: 800, thick: 10, side: '#e8e4da', rough: 1, brands: ['younhyun'], q: '패턴 타일 세이지',
    note: '반원 무늬를 돌려 깔아 장마다 다른 그림을 만듭니다.' },
  { id: 'stone_grey', cat: 'tile', ko: '시에라 그레이 600×1200', en: 'Sierra Grey',
    spec: '600 × 1200 × 9mm · 무광 포세린', unit: '1박스(2장)', unitArea: 1.44, price: 52000, loss: 0.08,
    dim: 1200, thick: 9, side: '#8f8f8a', rough: 1, brands: ['daelim', 'younhyun'], q: '그레이 포세린 600x1200',
    note: '돌 질감을 담은 큰 판 타일입니다. 줄눈이 적어 공간이 넓어 보입니다.' },
  { id: 'marble_beige', cat: 'tile', ko: '크레마 마블 600×1200', en: 'Crema Marble',
    spec: '600 × 1200 × 9mm · 폴리싱 포세린', unit: '1박스(2장)', unitArea: 1.44, price: 61000, loss: 0.08,
    dim: 1200, thick: 9, side: '#d8cfc2', rough: 1, brands: ['daelim', 'younhyun'], q: '베이지 대리석 포세린',
    note: '대리석 무늬에 광을 낸 포세린입니다. 거실 바닥에 고급스러운 반사가 생깁니다.' },
  { id: 'ribbed_red', cat: 'tile', ko: '테라코타 리브드', en: 'Terracotta Ribbed',
    spec: '100 × 300 × 10mm · 유광 입체', unit: '1박스(18장)', unitArea: 0.54, price: 47000, loss: 0.12,
    dim: 600, thick: 10, side: '#d8cdc2', rough: 1, brands: ['younhyun'], q: '입체 타일 레드',
    note: '세로 골이 파인 입체 타일입니다. 조명을 받으면 골마다 그림자가 생깁니다.' },
  { id: 'granite_tile', cat: 'tile', ko: '차콜 슬레이트 300×600', en: 'Charcoal Slate',
    spec: '300 × 600 × 10mm · 석재 질감', unit: '1박스(6장)', unitArea: 1.08, price: 39000, loss: 0.08,
    dim: 2300, thick: 10, side: '#4e4f4f', rough: 1, brands: ['daelim'], q: '슬레이트 타일 차콜',
    note: '결이 살아 있는 짙은 회색 석재 타일입니다. 현관과 욕실 바닥에 씁니다.' },

  // ---------- 벽지 · 도장 · 패널 (기존) ----------
  { id: 'white_stucco', cat: 'wallpaper', ko: '스노우 화이트 실크벽지', en: 'Snow Silk',
    spec: '폭 106cm × 15.6m · 실크(PVC)', unit: '1롤', unitArea: 16.5, price: 36000, loss: 0.15,
    dim: 2000, thick: 3, side: '#e9e6e2', rough: 1, brands: ['shinhan', 'lxzin'], q: '화이트 실크벽지',
    note: '은은한 질감의 흰 벽지입니다. 어느 바닥과도 무난하게 어울립니다.' },
  { id: 'beige_wall_001', cat: 'wallpaper', ko: '샌드 베이지 실크벽지', en: 'Sand Silk',
    spec: '폭 106cm × 15.6m · 실크(PVC)', unit: '1롤', unitArea: 16.5, price: 36000, loss: 0.15,
    dim: 3000, thick: 3, side: '#d2c4b0', rough: 1, brands: ['shinhan', 'lxzin'], q: '베이지 실크벽지',
    note: '따뜻한 모래색 벽지입니다. 원목마루와 함께 쓰면 공간이 부드러워집니다.' },
  { id: 'rough_linen', cat: 'wallpaper', ko: '내추럴 린넨 패브릭 벽지', en: 'Natural Linen',
    spec: '폭 93cm × 10m · 패브릭', unit: '1롤', unitArea: 9.3, price: 58000, loss: 0.15,
    dim: 270, thick: 3, side: '#c0b7a6', rough: 1, brands: ['shinhan'], q: '린넨 패브릭 벽지',
    note: '실제 천의 짜임이 보이는 벽지입니다. 침실과 서재에 차분한 결을 더합니다.' },
  { id: 'white_planks_clean', cat: 'panel', ko: '그레이지 템바보드', en: 'Greige Tambour',
    spec: '1200 × 2400 × 9mm · 홈 간격 30mm', unit: '1장', unitArea: 2.88, price: 68000, loss: 0.10,
    dim: 1800, thick: 9, side: '#b5a69d', rough: 1, brands: ['hansol', 'lxzin'], q: '템바보드',
    note: '세로 홈이 반복되는 벽 패널입니다. 거실 아트월이나 수납장 문에 씁니다.' },
  { id: 'plastered_wall', cat: 'paint', ko: '석회 미장 도장', en: 'Lime Plaster',
    spec: '석회 도료 · 흙손 2회 마감', unit: '1통(5kg)', unitArea: 8, price: 72000, loss: 0.10,
    dim: 2000, thick: 3, side: '#b0a89d', rough: 1, brands: ['samhwa'], q: '석회 페인트 미장',
    note: '흙손 자국이 남는 석회 마감입니다. 빛이 비치는 각도에 따라 얼룩이 달라 보입니다.' },
  // ---------- 벽지 (추가) ----------
  { id: 'stripe_sage', cat: 'wallpaper', ko: '세이지 핀스트라이프 벽지', en: 'Sage Pinstripe',
    spec: '폭 53cm × 10m · 종이(합지)', unit: '1롤', unitArea: 5.3, price: 28000, loss: 0.15,
    dim: 600, thick: 3, side: '#e6e3d6', rough: 1, brands: ['shinhan', 'lxzin'], q: '스트라이프 벽지',
    note: '가는 세이지색 줄이 두 겹으로 지나갑니다. 천장이 높아 보이는 효과가 있습니다.' },
  { id: 'arch_terracotta', cat: 'wallpaper', ko: '테라코타 아치 패턴 벽지', en: 'Terracotta Arch',
    spec: '폭 53cm × 10m · 종이(합지)', unit: '1롤', unitArea: 5.3, price: 32000, loss: 0.18,
    dim: 480, thick: 3, side: '#ebe0d2', rough: 1, brands: ['shinhan'], q: '아치 패턴 벽지',
    note: '테라코타색 아치가 엇갈려 반복됩니다. 아이 방이나 파우더룸 한 면에 씁니다.' },

  // ---------- 도장 · 미장 (추가) ----------
  { id: 'grey_plaster', cat: 'paint', ko: '마이크로시멘트 그레이', en: 'Microcement Grey',
    spec: '시멘트계 미장재 · 2~3mm 시공', unit: '1세트(10kg)', unitArea: 5, price: 98000, loss: 0.10,
    dim: 1000, thick: 3, side: '#bcb8b1', rough: 1, brands: ['samhwa'], q: '마이크로시멘트',
    note: '이음매 없이 벽과 바닥을 한 면으로 덮는 얇은 시멘트 마감입니다.' },
  { id: 'clay_plaster', cat: 'paint', ko: '황토 미장', en: 'Clay Plaster',
    spec: '황토 미장재 · 흙손 2회 마감', unit: '1포(20kg)', unitArea: 6, price: 42000, loss: 0.10,
    dim: 2000, thick: 3, side: '#a98563', rough: 1, brands: ['samhwa'], q: '황토 미장',
    note: '따뜻한 흙빛 미장입니다. 습도를 머금었다 내보내 실내가 쾌적해집니다.' },
  { id: 'concrete_wall_008', cat: 'paint', ko: '노출 콘크리트 질감 도장', en: 'Raw Concrete',
    spec: '콘크리트 질감 도료 · 3회 도장', unit: '1통(18kg)', unitArea: 12, price: 85000, loss: 0.10,
    dim: 2710, thick: 3, side: '#8d8570', rough: 1, brands: ['samhwa'], q: '노출콘크리트 도장',
    note: '거푸집 자국까지 살린 콘크리트 질감 도장입니다. 카페 같은 분위기를 만듭니다.' },

  // ---------- 석재 상판 ----------
  { id: 'calacatta', cat: 'stone', ko: '칼라카타 화이트 세라믹 상판', en: 'Calacatta White',
    spec: '3200 × 1600 × 12mm · 폴리싱', unit: '1장', unitArea: 5.12, price: 980000, loss: 0.20,
    dim: 1600, thick: 12, side: '#efebe5', rough: 1, brands: ['lxzin', 'younhyun'], q: '세라믹 상판 칼라카타',
    note: '흰 바탕에 회색 결이 길게 흐릅니다. 주방 아일랜드 상판으로 가장 많이 찾습니다.' },
  { id: 'nero_marquina', cat: 'stone', ko: '네로 마르퀴나 대리석', en: 'Nero Marquina',
    spec: '3000 × 1500 × 20mm · 천연 대리석', unit: '1장', unitArea: 4.5, price: 1450000, loss: 0.20,
    dim: 1600, thick: 20, side: '#2c2c2d', rough: 1, brands: ['younhyun'], q: '네로마르퀴나 상판',
    note: '검은 돌에 흰 결이 번개처럼 지나갑니다. 세면대나 바 테이블에 씁니다.' },
  { id: 'quartz_grey', cat: 'stone', ko: '클라우드 그레이 쿼츠', en: 'Cloud Quartz',
    spec: '3000 × 1400 × 20mm · 엔지니어드 스톤', unit: '1장', unitArea: 4.2, price: 890000, loss: 0.20,
    dim: 1200, thick: 20, side: '#c6c3be', rough: 1, brands: ['lxzin'], q: '쿼츠 상판 그레이',
    note: '고운 점무늬의 인조석입니다. 얼룩과 긁힘에 강해 주방 작업대에 알맞습니다.' },
  { id: 'travertine', cat: 'stone', ko: '트래버틴 베이지', en: 'Travertine',
    spec: '2800 × 1500 × 20mm · 천연석 혼드', unit: '1장', unitArea: 4.2, price: 1180000, loss: 0.20,
    dim: 1600, thick: 20, side: '#d6c7ad', rough: 1, brands: ['younhyun'], q: '트래버틴 상판',
    note: '가로로 흐르는 결과 작은 구멍이 있는 따뜻한 베이지 돌입니다.' },

  // ---------- 우드 패널 (추가) ----------
  { id: 'oak_tambour', cat: 'panel', ko: '오크 템바보드', en: 'Oak Tambour',
    spec: '1200 × 2400 × 12mm · 홈 간격 30mm', unit: '1장', unitArea: 2.88, price: 89000, loss: 0.10,
    dim: 600, thick: 12, side: '#a07452', rough: 1, brands: ['hansol', 'lxzin'], q: '오크 템바보드',
    note: '둥근 골이 촘촘히 반복되는 오크 패널입니다. 빛이 옆에서 들면 골마다 그림자가 집니다.' },
  { id: 'walnut_louver', cat: 'panel', ko: '월넛 우드 루버', en: 'Walnut Louver',
    spec: '40 × 2400mm 슬랫 · 간격 20mm', unit: '1세트(10개)', unitArea: 1.44, price: 126000, loss: 0.08,
    dim: 600, thick: 20, side: '#443324', rough: 1, brands: ['hansol'], q: '월넛 루버',
    note: '짙은 월넛 막대를 일정한 간격으로 세운 벽입니다. TV 뒤나 침대 헤드월에 씁니다.' },

  // ---------- 벽돌 ----------
  { id: 'red_brick', cat: 'brick', ko: '클래식 레드 파벽돌', en: 'Classic Red',
    spec: '210 × 60 × 15mm · 점토 파벽돌', unit: '1박스', unitArea: 1.0, price: 39000, loss: 0.10,
    dim: 1400, thick: 15, side: '#8e6750', rough: 1, brands: ['younhyun'], q: '레드 파벽돌',
    note: '붉은 점토 벽돌을 얇게 잘라 붙이는 마감입니다. 오래된 공장 같은 분위기가 납니다.' },
  { id: 'whitewashed_brick', cat: 'brick', ko: '화이트워시 파벽돌', en: 'Whitewashed',
    spec: '210 × 60 × 15mm · 석회 워싱', unit: '1박스', unitArea: 1.0, price: 42000, loss: 0.10,
    dim: 2000, thick: 15, side: '#c4b5a5', rough: 1, brands: ['younhyun'], q: '화이트 파벽돌',
    note: '벽돌 위에 석회를 바르고 닦아 낸 흰 벽돌입니다. 밝은 방에서도 무겁지 않습니다.' },
  { id: 'brick_wall_001', cat: 'brick', ko: '빈티지 고벽돌', en: 'Reclaimed Brick',
    spec: '230 × 65 × 20mm · 재생 고벽돌', unit: '1박스', unitArea: 1.0, price: 48000, loss: 0.12,
    dim: 3000, thick: 20, side: '#644a3c', rough: 1, brands: ['younhyun'], q: '고벽돌 파벽돌',
    note: '철거한 건물에서 나온 벽돌을 다시 쓴 것입니다. 장마다 색과 모서리가 다릅니다.' },
];

export const BY_ID = Object.fromEntries(MATERIALS.map((m) => [m.id, m]));
export const HERO_SEQUENCE = ['herringbone_parquet', 'zellige_green', 'navy_long', 'sage_pattern', 'terrazzo_white'];

export const PYEONG = 3.3058; // 1평 = 3.3058㎡
export const WALL_RATIO = 2.5; // 벽 면적 ≈ 바닥 면적 × 2.5 (천장고 2.3m 기준 어림)

export const texPath = (id, map) => `assets/tex/${id}/${map}.jpg?v=2`;
export const won = (n) => Math.round(n).toLocaleString('ko-KR');
export const shopLinks = (m) => [
  ...m.brands.map((b) => ({ name: BRANDS[b].name, url: BRANDS[b].url, kind: '제조 · 유통' })),
  { name: '오늘의집', url: `https://ohou.se/search/index?query=${encodeURIComponent(m.q)}`, kind: '검색 결과' },
  { name: '네이버쇼핑', url: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(m.q)}`, kind: '검색 결과' },
];

// 견적 계산 · 입력 방식은 카테고리마다 다릅니다
// floor: 바닥 평수 · room: 방 평수(벽 면적 자동) · wall: 벽 면적 ㎡ · counter: 상판 길이 m (깊이 0.6m)
export const CALC = {
  floor:   { label: '깔 바닥 면적', unit: '평', def: 24, min: 1, max: 60, step: 1 },
  room:    { label: '방 바닥 면적 (벽 면적 자동 계산)', unit: '평', def: 24, min: 1, max: 60, step: 1 },
  wall:    { label: '깔 벽 면적', unit: '㎡', def: 8, min: 1, max: 60, step: 0.5 },
  counter: { label: '상판 길이 (깊이 60cm 기준)', unit: 'm', def: 3, min: 0.5, max: 10, step: 0.1 },
};
export const WALL_TILES = ['zellige_green', 'glaze_mustard', 'navy_long', 'pink_stack', 'white_wave', 'ribbed_red'];
export const calcType = (m) => (m.cat === 'tile' && WALL_TILES.includes(m.id) ? 'wall' : CATS[m.cat].calc);
export const ROOM_FINISH = new Set(['wallpaper', 'paint']); // 방 전체 벽에 바르는 마감
export const isWallish = (m) => ROOM_FINISH.has(m.cat) || m.cat === 'panel' || m.cat === 'brick' || WALL_TILES.includes(m.id);
export function estimate(m, v) {
  const t = calcType(m);
  const area = t === 'floor' ? v * PYEONG : t === 'room' ? v * PYEONG * WALL_RATIO : t === 'counter' ? v * 0.6 : v;
  const need = area * (1 + m.loss);
  const qty = Math.ceil(need / m.unitArea);
  const total = qty * m.price;
  return { area, need, qty, total, perSqm: m.price / m.unitArea, perPyeong: (m.price / m.unitArea) * PYEONG };
}
