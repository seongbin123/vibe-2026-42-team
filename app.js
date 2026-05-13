// ─── 달력 ───
let calContext = 'setup';
let calYear, calMonth, calSelectedDay;

function openCalendar(context) {
  calContext = context;
  const d = getData();
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  calSelectedDay = d.payday || null;
  document.getElementById('calendar-overlay').classList.remove('hidden');
  renderCalendar();
}

function closeCalendar() {
  document.getElementById('calendar-overlay').classList.add('hidden');
}

function closeCalendarOutside(e) {
  if (e.target === document.getElementById('calendar-overlay')) closeCalendar();
}

function moveMonth(delta) {
  calMonth += delta;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
}

function renderCalendar() {
  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  document.getElementById('cal-title').textContent = `${calYear}년 ${MONTHS[calMonth]}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const btn = document.createElement('button');
    btn.className = 'cal-day';
    btn.textContent = day;
    if (new Date(calYear, calMonth, day).getDay() === 0) btn.classList.add('sunday');
    if (isCurrentMonth && day === today.getDate()) btn.classList.add('today');
    if (day === calSelectedDay) btn.classList.add('selected');
    btn.onclick = () => selectCalDay(day);
    grid.appendChild(btn);
  }
}

function selectCalDay(day) {
  calSelectedDay = day;
  const btnId = calContext === 'setup' ? 'setup-payday-btn'
    : calContext === 'settings' ? 'settings-payday-btn'
    : 'sub-date-btn';
  const btn = document.getElementById(btnId);
  btn.textContent = `${calMonth + 1}월 ${day}일`;
  btn.classList.add('selected');
  btn.dataset.payday = day;
  btn.dataset.month = calMonth + 1;
  closeCalendar();
}

// ─── 드래그 입력 ───
function initDragInputs() {
  document.querySelectorAll('input[type="number"]').forEach(input => {
    let startY = 0, startVal = 0, dragging = false;

    const step = () => {
      const max = parseInt(input.max) || Infinity;
      if (max <= 31) return 1;       // 날짜 같은 작은 값
      return 1000;                    // 금액은 1,000원 단위
    };

    const onStart = (y) => {
      startY = y;
      startVal = parseInt(input.value) || 0;
      dragging = true;
    };
    const onMove = (y) => {
      if (!dragging) return;
      const delta = Math.round((startY - y) / 4) * step();
      const min = parseInt(input.min) || 0;
      const max = parseInt(input.max) || Infinity;
      input.value = Math.max(min, Math.min(max, startVal + delta));
    };
    const onEnd = () => { dragging = false; };

    input.addEventListener('mousedown',  e => onStart(e.clientY));
    document.addEventListener('mousemove', e => { if (dragging) onMove(e.clientY); });
    document.addEventListener('mouseup',   onEnd);

    input.addEventListener('touchstart', e => onStart(e.touches[0].clientY), { passive: true });
    input.addEventListener('touchmove',  e => { onMove(e.touches[0].clientY); }, { passive: true });
    input.addEventListener('touchend',   onEnd);
  });
}

// ─── 데이터 ───
const onlyExpenses = exps => exps.filter(e => e.type !== 'income');
const SPARKLE_ICON = `<svg style="display:inline;vertical-align:middle;margin-right:1px;flex-shrink:0" width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 L11.2 8.8 L18 10 L11.2 11.2 L10 18 L8.8 11.2 L2 10 L8.8 8.8 Z"/></svg><svg style="display:inline;vertical-align:middle;margin-right:4px;flex-shrink:0" width="8" height="8" viewBox="0 0 20 20" fill="none" stroke="#FFB347" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 L11.2 8.8 L18 10 L11.2 11.2 L10 18 L8.8 11.2 L2 10 L8.8 8.8 Z"/></svg>`;
const EMOJIS = { 식비:'', 카페:'', 교통:'', 술자리:'', 구독:'', 쇼핑:'', 병원:'', 기타:'' };
const CAT_COLORS = { 식비:'#7C6CF4', 카페:'#FFB347', 교통:'#4ADE80', 술자리:'#FF5A5A', 구독:'#00D4FF', 쇼핑:'#FF69B4', 병원:'#FF6EB4', 기타:'#9090A8' };

const CAT_ICON_STYLE = {
  '식비':   'background:var(--cat-food);color:var(--cat-food-ink)',
  '카페':   'background:var(--cat-cafe);color:var(--cat-cafe-ink)',
  '교통':   'background:var(--cat-trans);color:var(--cat-trans-ink)',
  '술자리': 'background:var(--cat-drink);color:var(--cat-drink-ink)',
  '구독':   'background:var(--cat-sub);color:var(--cat-sub-ink)',
  '쇼핑':   'background:var(--cat-shop);color:var(--cat-shop-ink)',
  '병원':   'background:var(--cat-hosp);color:var(--cat-hosp-ink)',
  '기타':   'background:var(--cat-etc);color:var(--cat-etc-ink)',
  '용돈':   'background:var(--success-soft);color:var(--success)',
};

const CAT_ICONS_SVG = {
  '식비':   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v4a2 2 0 004 0V2"/><line x1="9" y1="8" x2="9" y2="18"/><line x1="14" y1="2" x2="14" y2="18"/></svg>`,
  '카페':   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h9l-1.2 8H5.2L4 7z"/><path d="M13 9h2a2 2 0 010 4h-2"/><line x1="5" y1="17" x2="11" y2="17"/></svg>`,
  '교통':   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="14" height="10" rx="2"/><line x1="3" y1="9" x2="17" y2="9"/><line x1="7" y1="14" x2="7" y2="17"/><line x1="13" y1="14" x2="13" y2="17"/><circle cx="7" cy="17" r="1"/><circle cx="13" cy="17" r="1"/></svg>`,
  '술자리': `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l-1.5 10H7.5L6 3z"/><line x1="6.5" y1="8" x2="13.5" y2="8"/><line x1="10" y1="13" x2="10" y2="17"/><line x1="7" y1="17" x2="13" y2="17"/></svg>`,
  '구독':   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="10" height="16" rx="2"/><circle cx="10" cy="15.5" r="0.8" fill="currentColor" stroke="none"/></svg>`,
  '쇼핑':   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h12l-1.5 10H5.5L4 7z"/><path d="M7 7V5a3 3 0 016 0v2"/></svg>`,
  '병원':   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"/><line x1="10" y1="7" x2="10" y2="13"/><line x1="7" y1="10" x2="13" y2="10"/></svg>`,
  '기타':   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><circle cx="7" cy="10" r="0.8" fill="currentColor" stroke="none"/><circle cx="10" cy="10" r="0.8" fill="currentColor" stroke="none"/><circle cx="13" cy="10" r="0.8" fill="currentColor" stroke="none"/></svg>`,
  '용돈':   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="3" x2="10" y2="17"/><polyline points="5,8 10,3 15,8"/></svg>`,
};

function catIconBox(cat, cls) {
  const style = CAT_ICON_STYLE[cat] || CAT_ICON_STYLE['기타'];
  const svg = CAT_ICONS_SVG[cat] || CAT_ICONS_SVG['기타'];
  return `<div class="${cls}" style="${style}">${svg}</div>`;
}

function catIconMini(cat) {
  const style = CAT_ICON_STYLE[cat] || CAT_ICON_STYLE['기타'];
  const svg = (CAT_ICONS_SVG[cat] || CAT_ICONS_SVG['기타'])
    .replace('width="20" height="20"', 'width="17" height="17"');
  return `<div style="width:32px;height:32px;border-radius:9px;display:grid;place-items:center;flex-shrink:0;${style}">${svg}</div>`;
}



// ─── 수원대 주변 식당 데이터 ───
const RESTAURANTS = [
  { id:1,  name:'봉담재',                  category:'한식·한정식·국수',   mainMenu:'한정식 코스',         price:'~15,000원', priceMin:15000, isLocal:true,  note:'부모님 모시기 좋음',   mealType:['lunch','dinner'] },
  { id:2,  name:'한식본좌',                category:'한식·한정식·국수',   mainMenu:'오징어볶음',          price:'12,000원',  priceMin:12000, isLocal:true,  note:'1인 주문 가능',        mealType:['lunch','dinner'] },
  { id:3,  name:'최고당수원대',            category:'한식·한정식·국수',   mainMenu:'백반 정식',           price:'~9,000원',  priceMin:9000,  isLocal:true,  note:'수원대 도보권',        mealType:['lunch'] },
  { id:4,  name:'미화식당',               category:'한식·한정식·국수',   mainMenu:'불백',                price:'~10,000원', priceMin:10000, isLocal:true,  note:'현지인 추천',          mealType:['lunch'] },
  { id:5,  name:'안녕불백',               category:'한식·한정식·국수',   mainMenu:'불백 정식',           price:'~10,000원', priceMin:10000, isLocal:true,  note:null,                   mealType:['lunch'] },
  { id:6,  name:'금옥정 더덕순대국',      category:'한식·한정식·국수',   mainMenu:'더덕순대국',          price:'~10,000원', priceMin:10000, isLocal:true,  note:'보양식 전문',          mealType:['lunch','dinner'] },
  { id:7,  name:'신의주찹쌀순대 수원대점',category:'한식·한정식·국수',   mainMenu:'순대국',              price:'10,000원',  priceMin:10000, isLocal:true,  note:'수원대생 소울 맛집',   mealType:['lunch','dinner'] },
  { id:8,  name:'이두형 홍두깨 칼국수',   category:'한식·한정식·국수',   mainMenu:'홍두깨 칼국수',       price:'~9,000원',  priceMin:9000,  isLocal:true,  note:null,                   mealType:['lunch'] },
  { id:9,  name:'개수리막국수',           category:'한식·한정식·국수',   mainMenu:'막국수',              price:'~10,000원', priceMin:10000, isLocal:true,  note:'다이닝코드 ★4.6',     mealType:['lunch'] },
  { id:10, name:'장비빔국수와 굴국밥',    category:'한식·한정식·국수',   mainMenu:'채소 비빔국수',       price:'9,000원',   priceMin:9000,  isLocal:true,  note:'전용주차·셀프바',      mealType:['lunch'] },
  { id:11, name:'들깨방앗간',             category:'한식·한정식·국수',   mainMenu:'들깨칼국수',          price:'9,000원',   priceMin:9000,  isLocal:true,  note:'다이닝코드 ★4.7',     mealType:['lunch'] },
  { id:12, name:'봉담옥',                 category:'한식·한정식·국수',   mainMenu:'한식 정식',           price:'~10,000원', priceMin:10000, isLocal:true,  note:null,                   mealType:['lunch','dinner'] },
  { id:13, name:'해장촌',                 category:'해장·탕·찌개',       mainMenu:'뼈해장국',            price:'~10,000원', priceMin:10000, isLocal:true,  note:'현지인 추천',          mealType:['lunch','dinner'] },
  { id:14, name:'뼈대장',                 category:'해장·탕·찌개',       mainMenu:'뼈해장국',            price:'~10,000원', priceMin:10000, isLocal:true,  note:null,                   mealType:['lunch','dinner'] },
  { id:15, name:'본가왕뼈감자탕',         category:'해장·탕·찌개',       mainMenu:'감자탕',              price:'~24,000원(2인)', priceMin:12000, isLocal:true,  note:'아이동반 OK',      mealType:['lunch','dinner'] },
  { id:16, name:'안동찜닭 봉담점',        category:'해장·탕·찌개',       mainMenu:'찜닭(중)',            price:'22,000원',  priceMin:22000, isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:17, name:'본죽 봉담점',            category:'해장·탕·찌개',       mainMenu:'전복죽',              price:'~9,000원',  priceMin:9000,  isLocal:false, note:null,                   mealType:['lunch'] },
  { id:18, name:'동산참숯갈비 봉담점',    category:'구이·고기·샤브샤브', mainMenu:'돼지갈비',            price:'13,000원/인', priceMin:13000, isLocal:true, note:'학생증 20%↓',         mealType:['dinner'] },
  { id:19, name:'신미돈 화성봉담점',      category:'구이·고기·샤브샤브', mainMenu:'모둠한판',            price:'~50,000원(3~4인)', priceMin:13000, isLocal:true, note:'도보 5분',          mealType:['dinner'] },
  { id:20, name:'돈필살 봉담점',          category:'구이·고기·샤브샤브', mainMenu:'모둠한판',            price:'~46,000원', priceMin:12000, isLocal:true,  note:'직원 구워줌',          mealType:['dinner'] },
  { id:21, name:'60판왕뚜껑삼겹살',       category:'구이·고기·샤브샤브', mainMenu:'삼겹살 200g',         price:'16,000원',  priceMin:16000, isLocal:true,  note:null,                   mealType:['dinner'] },
  { id:22, name:'양심소 봉담점',          category:'구이·고기·샤브샤브', mainMenu:'숙성 소고기',         price:'~18,000원/인', priceMin:18000, isLocal:true, note:'넓은 주차장',         mealType:['dinner'] },
  { id:23, name:'등불회관 화성봉담점',    category:'구이·고기·샤브샤브', mainMenu:'연탄불 삼겹살',       price:'~14,000원', priceMin:14000, isLocal:true,  note:'16:00~02:00',          mealType:['dinner'] },
  { id:24, name:'훈장골',                 category:'구이·고기·샤브샤브', mainMenu:'돼지갈비',            price:'~13,000원', priceMin:13000, isLocal:true,  note:'다이닝코드 ★4.2',     mealType:['dinner'] },
  { id:25, name:'낭만뒷고기',             category:'구이·고기·샤브샤브', mainMenu:'뒷고기 구이',         price:'~15,000원', priceMin:15000, isLocal:true,  note:'다이닝코드 ★4.8',     mealType:['dinner'] },
  { id:26, name:'샤브공감 봉담점',        category:'구이·고기·샤브샤브', mainMenu:'무한리필 샤브샤브',   price:'25,900원',  priceMin:25900, isLocal:true,  note:'100분 제한',           mealType:['lunch','dinner'] },
  { id:27, name:'우리갈비',               category:'구이·고기·샤브샤브', mainMenu:'소갈비살',            price:'~20,000원', priceMin:20000, isLocal:true,  note:'다이닝코드 ★5.0',     mealType:['dinner'] },
  { id:28, name:'신동랩 화성봉담점',      category:'일식·초밥·덮밥',     mainMenu:'스키야키 반상',       price:'14,900원',  priceMin:14900, isLocal:true,  note:null,                   mealType:['lunch','dinner'] },
  { id:29, name:'육회바른연어 봉담2호점', category:'일식·초밥·덮밥',     mainMenu:'육연덮밥',            price:'~14,000원', priceMin:14000, isLocal:true,  note:'수요일 휴무',          mealType:['lunch','dinner'] },
  { id:30, name:'여너여너',               category:'일식·초밥·덮밥',     mainMenu:'연어초밥',            price:'~15,000원', priceMin:15000, isLocal:true,  note:'예약 권장',            mealType:['lunch','dinner'] },
  { id:31, name:'스시명장',               category:'일식·초밥·덮밥',     mainMenu:'스시 런치 세트',      price:'~15,000원', priceMin:15000, isLocal:true,  note:'다이닝코드 ★4.7',     mealType:['lunch'] },
  { id:32, name:'오대짬뽕',               category:'중식·양꼬치',        mainMenu:'오대짬뽕',            price:'10,000원',  priceMin:10000, isLocal:true,  note:null,                   mealType:['lunch','dinner'] },
  { id:33, name:'함지박 중화요리',        category:'중식·양꼬치',        mainMenu:'해물짬뽕',            price:'11,000원',  priceMin:11000, isLocal:true,  note:'룸 가능',              mealType:['lunch','dinner'] },
  { id:34, name:'봉담2지구 중화요리',     category:'중식·양꼬치',        mainMenu:'짜장면',              price:'8,000원',   priceMin:8000,  isLocal:true,  note:'월요일 휴무',          mealType:['lunch','dinner'] },
  { id:35, name:'하오츠',                 category:'중식·양꼬치',        mainMenu:'짬뽕',                price:'~10,000원', priceMin:10000, isLocal:true,  note:'다이닝코드 ★4.1',     mealType:['lunch','dinner'] },
  { id:36, name:'원시다자',               category:'중식·양꼬치',        mainMenu:'양꼬치 10개',         price:'~15,000원', priceMin:15000, isLocal:true,  note:'다이닝코드 ★4.0',     mealType:['dinner'] },
  { id:37, name:'홍콩반점 봉담점',        category:'중식·양꼬치',        mainMenu:'짬뽕·볶음밥',        price:'~9,000원',  priceMin:9000,  isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:38, name:'조가네 갑오징어 융건릉점',category:'분식·해산물·볶음',  mainMenu:'갑오징어볶음',        price:'~15,000원(2인)', priceMin:8000, isLocal:true, note:'매콤 해산물 명소',      mealType:['lunch','dinner'] },
  { id:39, name:'정원쭈꾸미',             category:'분식·해산물·볶음',   mainMenu:'불쭈꾸미',            price:'~11,000원', priceMin:11000, isLocal:true,  note:'화~토 11:00~15:00',    mealType:['lunch'] },
  { id:40, name:'짬뽕깡패 꼬짬',          category:'분식·해산물·볶음',   mainMenu:'꼬짬 짬뽕',          price:'~10,000원', priceMin:10000, isLocal:true,  note:'다이닝코드 ★4.1',     mealType:['lunch','dinner'] },
  { id:41, name:'매코미',                 category:'분식·해산물·볶음',   mainMenu:'닭날개 직화구이',     price:'~12,000원', priceMin:12000, isLocal:true,  note:null,                   mealType:['dinner'] },
  { id:42, name:'할매이가네쭈꾸미 봉담점',category:'분식·해산물·볶음',   mainMenu:'쭈꾸미볶음',         price:'~11,000원', priceMin:11000, isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:43, name:'대왕꽃문어족발',         category:'족발·야식·포차',      mainMenu:'꽃문어족발 대',      price:'63,800원(4~5인)', priceMin:13000, isLocal:true, note:'일요일 휴무',         mealType:['dinner'] },
  { id:44, name:'가장맛있는족발 수원대점',category:'족발·야식·포차',      mainMenu:'반반족발',           price:'~28,000원', priceMin:14000, isLocal:true,  note:'화요일 휴무',          mealType:['dinner'] },
  { id:45, name:'김찌로 수원대점',        category:'족발·야식·포차',      mainMenu:'쌈닭갈비',           price:'12,000원/인', priceMin:12000, isLocal:true, note:'17:00~01:00',          mealType:['dinner'] },
  { id:46, name:'봉구비어 봉담점',        category:'족발·야식·포차',      mainMenu:'치킨+생맥주 세트',  price:'~20,000원', priceMin:10000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:47, name:'역전할머니맥주 봉담점',  category:'족발·야식·포차',      mainMenu:'치킨+생맥주',       price:'~18,000원', priceMin:9000,  isLocal:false, note:null,                   mealType:['dinner'] },
  { id:48, name:'리옹봉담',               category:'양식·피자',           mainMenu:'마르게리타 피자',    price:'~16,000원', priceMin:16000, isLocal:true,  note:'스테이크 가능',        mealType:['lunch','dinner'] },
  { id:49, name:'피자먹다 봉담2호점',     category:'양식·피자',           mainMenu:'1인 피자',           price:'~11,000원', priceMin:11000, isLocal:true,  note:null,                   mealType:['lunch','dinner'] },
  { id:50, name:'도미노피자 봉담점',      category:'양식·피자',           mainMenu:'포테이토 피자(M)',   price:'22,900원',  priceMin:22900, isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:51, name:'피자헛 봉담점',          category:'양식·피자',           mainMenu:'슈퍼슈프림(M)',      price:'25,900원',  priceMin:25900, isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:52, name:'피자마루 봉담점',        category:'양식·피자',           mainMenu:'고구마 피자(L)',     price:'13,900원',  priceMin:13900, isLocal:false, note:'가성비',               mealType:['lunch','dinner'] },
  { id:53, name:'미스터피자 봉담점',      category:'양식·피자',           mainMenu:'씨푸드 피자(M)',     price:'23,900원',  priceMin:23900, isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:54, name:'BBQ 봉담점',             category:'치킨',                mainMenu:'황금올리브 치킨',    price:'21,000원',  priceMin:21000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:55, name:'BHC 봉담점',             category:'치킨',                mainMenu:'뿌링클',             price:'21,000원',  priceMin:21000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:56, name:'교촌치킨 봉담점',        category:'치킨',                mainMenu:'허니콤보',           price:'22,000원',  priceMin:22000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:57, name:'굽네치킨 봉담점',        category:'치킨',                mainMenu:'고추바사삭',         price:'20,000원',  priceMin:20000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:58, name:'네네치킨 봉담점',        category:'치킨',                mainMenu:'파닭',               price:'20,000원',  priceMin:20000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:59, name:'60계치킨 봉담점',        category:'치킨',                mainMenu:'오리지널',           price:'17,000원',  priceMin:17000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:60, name:'처갓집 양념치킨 봉담점', category:'치킨',                mainMenu:'양념치킨',           price:'19,000원',  priceMin:19000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:61, name:'푸라닭 봉담점',          category:'치킨',                mainMenu:'블랙알리오',         price:'21,000원',  priceMin:21000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:62, name:'노랑통닭 봉담점',        category:'치킨',                mainMenu:'통닭',               price:'16,000원',  priceMin:16000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:63, name:'지코바치킨 봉담점',      category:'치킨',                mainMenu:'간장 치킨',          price:'18,000원',  priceMin:18000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:64, name:'굽는남자 봉담점',        category:'치킨',                mainMenu:'오리지널',           price:'18,000원',  priceMin:18000, isLocal:false, note:null,                   mealType:['dinner'] },
  { id:65, name:'맥도날드 봉담점',        category:'햄버거·패스트푸드',   mainMenu:'빅맥 세트',          price:'8,500원',   priceMin:8500,  isLocal:false, note:'24시간',               mealType:['lunch','dinner'] },
  { id:66, name:'롯데리아 봉담점',        category:'햄버거·패스트푸드',   mainMenu:'불고기버거 세트',    price:'7,500원',   priceMin:7500,  isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:67, name:'버거킹 봉담점',          category:'햄버거·패스트푸드',   mainMenu:'와퍼 세트',          price:'9,500원',   priceMin:9500,  isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:68, name:'맘스터치 봉담점',        category:'햄버거·패스트푸드',   mainMenu:'싸이버거 세트',      price:'7,900원',   priceMin:7900,  isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:69, name:'서브웨이 봉담점',        category:'햄버거·패스트푸드',   mainMenu:'이탈리안BMT',        price:'7,800원',   priceMin:7800,  isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:70, name:'이삭토스트 봉담점',      category:'햄버거·패스트푸드',   mainMenu:'햄치즈에그 토스트',  price:'4,500원',   priceMin:4500,  isLocal:false, note:null,                   mealType:['lunch'] },
  { id:71, name:'노브랜드버거 봉담점',    category:'햄버거·패스트푸드',   mainMenu:'시그니처버거 세트',  price:'7,500원',   priceMin:7500,  isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:72, name:'KFC 봉담점',             category:'햄버거·패스트푸드',   mainMenu:'징거버거 세트',      price:'9,000원',   priceMin:9000,  isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:73, name:'파파이스 봉담점',        category:'햄버거·패스트푸드',   mainMenu:'스파이시 치킨버거 세트', price:'10,000원', priceMin:10000, isLocal:false, note:null,               mealType:['lunch','dinner'] },
  { id:74, name:'신전떡볶이 봉담점',      category:'분식_프랜차이즈',      mainMenu:'신전 오리지널 떡볶이', price:'5,000원', priceMin:5000,  isLocal:false, note:null,                   mealType:['lunch'] },
  { id:75, name:'엽기떡볶이 봉담점',      category:'분식_프랜차이즈',      mainMenu:'엽기 떡볶이(소)',    price:'14,000원',  priceMin:14000, isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:76, name:'죠스떡볶이 봉담점',      category:'분식_프랜차이즈',      mainMenu:'죠스 떡볶이(1인)',   price:'5,500원',   priceMin:5500,  isLocal:false, note:null,                   mealType:['lunch'] },
  { id:77, name:'국대떡볶이 봉담점',      category:'분식_프랜차이즈',      mainMenu:'국대 떡볶이(1인)',   price:'5,500원',   priceMin:5500,  isLocal:false, note:null,                   mealType:['lunch'] },
  { id:78, name:'고봉민김밥인 봉담점',    category:'분식_프랜차이즈',      mainMenu:'고봉민 크림김밥',    price:'4,500원',   priceMin:4500,  isLocal:false, note:null,                   mealType:['lunch'] },
  { id:79, name:'김밥천국 봉담점',        category:'분식_프랜차이즈',      mainMenu:'참치김밥',           price:'4,500원',   priceMin:4500,  isLocal:false, note:null,                   mealType:['lunch'] },
  { id:80, name:'스타벅스 봉담점',        category:'카페·디저트',         mainMenu:'아이스 아메리카노',   price:'5,100원',   priceMin:5100,  isLocal:false, note:null,                   mealType:['both'] },
  { id:81, name:'메가커피 봉담점',        category:'카페·디저트',         mainMenu:'아이스 아메리카노',   price:'2,000원',   priceMin:2000,  isLocal:false, note:'가성비 최강',          mealType:['both'] },
  { id:82, name:'컴포즈커피 봉담점',      category:'카페·디저트',         mainMenu:'아이스 아메리카노',   price:'1,500원',   priceMin:1500,  isLocal:false, note:'최저가',               mealType:['both'] },
  { id:83, name:'빽다방 봉담점',          category:'카페·디저트',         mainMenu:'아이스 아메리카노',   price:'2,000원',   priceMin:2000,  isLocal:false, note:null,                   mealType:['both'] },
  { id:84, name:'투썸플레이스 봉담점',    category:'카페·디저트',         mainMenu:'아이스 아메리카노',   price:'4,500원',   priceMin:4500,  isLocal:false, note:null,                   mealType:['both'] },
  { id:85, name:'이디야커피 봉담점',      category:'카페·디저트',         mainMenu:'아이스 아메리카노',   price:'3,500원',   priceMin:3500,  isLocal:false, note:null,                   mealType:['both'] },
  { id:86, name:'할리스 봉담점',          category:'카페·디저트',         mainMenu:'아이스 아메리카노',   price:'4,300원',   priceMin:4300,  isLocal:false, note:null,                   mealType:['both'] },
  { id:87, name:'브런치빈 봉담점',        category:'카페·디저트',         mainMenu:'브런치 세트',         price:'~15,000원', priceMin:15000, isLocal:true,  note:'09:00~21:00 | 6층',   mealType:['lunch'] },
  { id:88, name:'오브느',                 category:'카페·디저트',         mainMenu:'크루아상·크림빵',     price:'~3,500원',  priceMin:3500,  isLocal:true,  note:'다이닝코드 ★4.9',     mealType:['both'] },
  { id:89, name:'빵쌤',                   category:'카페·디저트',         mainMenu:'시그니처 크림빵',     price:'~3,500원',  priceMin:3500,  isLocal:true,  note:'다이닝코드 ★4.4',     mealType:['both'] },
  { id:90, name:'한솥도시락 봉담점',      category:'기타·도시락',         mainMenu:'한솥 도시락',         price:'~5,000원',  priceMin:5000,  isLocal:false, note:null,                   mealType:['lunch'] },
  { id:91, name:'공차 봉담점',            category:'기타·도시락',         mainMenu:'타피오카 밀크티',     price:'5,300원',   priceMin:5300,  isLocal:false, note:null,                   mealType:['both'] },
  { id:92, name:'포메인 봉담점',          category:'기타·도시락',         mainMenu:'쌀국수',              price:'9,000원',   priceMin:9000,  isLocal:false, note:null,                   mealType:['lunch','dinner'] },
  { id:93, name:'파리바게뜨 봉담점',      category:'베이커리·편의점',     mainMenu:'소보루빵',            price:'2,000원',   priceMin:2000,  isLocal:false, note:null,                   mealType:['both'] },
  { id:94, name:'뚜레쥬르 봉담점',        category:'베이커리·편의점',     mainMenu:'크림빵',              price:'2,500원',   priceMin:2500,  isLocal:false, note:null,                   mealType:['both'] },
  { id:95, name:'배스킨라빈스 봉담점',    category:'베이커리·편의점',     mainMenu:'싱글 레귤러',         price:'3,900원',   priceMin:3900,  isLocal:false, note:null,                   mealType:['both'] },
  { id:96, name:'GS25 봉담점',            category:'베이커리·편의점',     mainMenu:'삼각김밥',            price:'1,400원',   priceMin:1400,  isLocal:false, note:'24시간',               mealType:['both'] },
  { id:97, name:'CU 봉담점',              category:'베이커리·편의점',     mainMenu:'컵라면(신라면)',      price:'1,600원',   priceMin:1600,  isLocal:false, note:'24시간',               mealType:['both'] },
  { id:98, name:'세븐일레븐 봉담점',      category:'베이커리·편의점',     mainMenu:'도시락(불고기)',      price:'4,800원',   priceMin:4800,  isLocal:false, note:'24시간',               mealType:['both'] },
  { id:99, name:'이마트24 봉담점',        category:'베이커리·편의점',     mainMenu:'핫도그',              price:'1,500원',   priceMin:1500,  isLocal:false, note:'24시간',               mealType:['both'] },
  { id:100,name:'미니스톱 봉담점',        category:'베이커리·편의점',     mainMenu:'소프트 아이스크림',   price:'800원',     priceMin:800,   isLocal:false, note:'24시간',               mealType:['both'] },
];

const RESTAURANT_CATEGORIES = [
  { key: 'all',     ko: '전체' },
  { key: 'kor',     ko: '한식·국수' },
  { key: 'soup',    ko: '해장·탕' },
  { key: 'meat',    ko: '구이·고기' },
  { key: 'jp',      ko: '일식·초밥' },
  { key: 'cn',      ko: '중식' },
  { key: 'sea',     ko: '분식·해산물' },
  { key: 'night',   ko: '족발·야식' },
  { key: 'west',    ko: '양식·피자' },
  { key: 'chicken', ko: '치킨' },
  { key: 'burger',  ko: '햄버거' },
  { key: 'tteok',   ko: '떡볶이·김밥' },
  { key: 'cafe',    ko: '카페·디저트' },
  { key: 'cvs',     ko: '편의점·도시락' },
];

const CAT_KEY_MAP = {
  '한식·한정식·국수':   'kor',
  '해장·탕·찌개':       'soup',
  '구이·고기·샤브샤브': 'meat',
  '일식·초밥·덮밥':     'jp',
  '중식·양꼬치':        'cn',
  '분식·해산물·볶음':   'sea',
  '족발·야식·포차':     'night',
  '양식·피자':          'west',
  '치킨':               'chicken',
  '햄버거·패스트푸드':  'burger',
  '분식_프랜차이즈':    'tteok',
  '카페·디저트':        'cafe',
  '베이커리·편의점':    'cvs',
  '기타·도시락':        'cvs',
};

const REC_MEAL_CATS = new Set(['카페·디저트','베이커리·편의점']);

let selectedCat = '식비';

function load() { return JSON.parse(localStorage.getItem('suwon_planner') || '{}'); }
function save(d) { localStorage.setItem('suwon_planner', JSON.stringify(d)); }

function getData() {
  const d = load();
  return {
    ...d,
    name: d.name || '',
    budget: d.budget || 0,
    payday: d.payday || 1,
    expenses: d.expenses || [],
    subscriptions: d.subscriptions || []
  };
}

// ─── 페이지 드래그 스크롤 ───
(function() {
  let startY, startScroll, moved = false;
  document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.expense-menu-wrap, .modal, .overlay, .nav, button, input')) return;
    startY = e.pageY;
    startScroll = window.scrollY;
    moved = false;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if (startY === undefined) return;
    const dy = e.pageY - startY;
    if (Math.abs(dy) > 5) moved = true;
    if (moved) window.scrollTo(0, startScroll - dy);
  });
  document.addEventListener('mouseup', () => {
    startY = undefined;
    document.body.style.userSelect = '';
  });
})();

// ─── 초기화 ───
window.onload = () => {
  applyStoredTheme();
  initDragInputs();
  registerSW();
  const d = getData();
  if (!d.budget) {
    document.getElementById('setup-overlay').style.display = 'flex';
  } else {
    document.getElementById('setup-overlay').style.display = 'none';
    renderAll();
    setTimeout(checkAndSendNotifications, 1500);
  }
};

function saveSetup() {
  const name = document.getElementById('setup-name').value.trim() || '수원대생';
  const budget = parseInt(document.getElementById('setup-budget').value) || 0;
  const payday = parseInt(document.getElementById('setup-payday-btn').dataset.payday) || 1;
  if (!budget) { alert('생활비를 입력해주세요'); return; }
  const d = getData();
  d.name = name; d.budget = budget; d.payday = payday;
  save(d);
  document.getElementById('setup-overlay').style.display = 'none';
  renderAll();
}

// ─── 렌더 전체 ───
function renderAll() {
  renderHome();
  renderExpenseList();
  renderAnalysis();
  renderSurvival();
  renderNotifBadge();
}

// ─── 홈 ───
function renderHome() {
  const d = getData();
  const today = new Date();
  const totalSpent = onlyExpenses(d.expenses).reduce((s, e) => s + e.amount, 0);
  const remaining = d.budget - totalSpent;
  const daysLeft = getDaysLeft(today, d.payday);
  const dailyAllowance = daysLeft > 0 ? Math.floor(remaining / daysLeft) : 0;
  const pct = Math.min(100, Math.round((totalSpent / d.budget) * 100));

  document.getElementById('header-name').textContent = `${d.name}님 👋`;
  document.getElementById('remaining-amount').textContent = fmt(remaining);
  document.getElementById('remaining-sub').textContent = '남은 생활비';
  document.getElementById('daily-amount').textContent = fmt(Math.max(0, dailyAllowance));
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('spent-pct').textContent = `${pct}% 사용 · 잔액 ${fmt(remaining)}`;
  document.getElementById('total-budget-label').textContent = fmt(d.budget);
  document.getElementById('days-left').textContent = `D-${daysLeft}`;

  const card = document.getElementById('survival-card');
  const label = document.getElementById('survival-label');
  card.className = 'survival-card';
  label.className = 'survival-label';
  if (pct >= 90 || remaining < 30000) {
    card.classList.add('danger-mode');
    label.classList.add('danger');
    label.innerHTML = '<span class="survival-label-dot"></span> 위험';
  } else if (pct >= 70 || remaining < 80000) {
    card.classList.add('warning-mode');
    label.classList.add('caution');
    label.innerHTML = '<span class="survival-label-dot"></span> 주의';
  } else {
    card.classList.add('safe-mode');
    label.classList.add('safe');
    label.innerHTML = '<span class="survival-label-dot"></span> 안전';
  }

  // 오늘 카테고리 합계 (전체)
  const todayStr = toDateStr(today);
  const todayExp = d.expenses.filter(e => e.date === todayStr).reverse();
  const todayTotal = onlyExpenses(todayExp).reduce((s, e) => s + e.amount, 0);
  const todayTotalLabel = document.getElementById('today-total-label');
  if (todayTotalLabel) todayTotalLabel.textContent = todayTotal > 0 ? `· ${fmt(todayTotal)}` : '';
  const todayCats = document.getElementById('today-cats');
  if (todayExp.length === 0) {
    todayCats.innerHTML = `<div class="today-empty">오늘 지출이 없어요</div>`;
  } else {
    todayCats.innerHTML = todayExp.map(e => expenseItemHTML(e)).join('');
  }

  renderWarnings(d, remaining, daysLeft);
}

function renderWarnings(d, remaining, daysLeft) {
  const zone = document.getElementById('warning-zone');
  zone.innerHTML = '';
  const warnings = [];


  // 구독료 경고
  const totalSub = d.subscriptions.reduce((s, sub) => s + sub.amount, 0);
  if (totalSub > 0) {
    warnings.push({ type: 'yellow', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="10" height="16" rx="2"/><circle cx="10" cy="15.5" r="0.8" fill="currentColor" stroke="none"/></svg>', title: `구독료 ${fmt(totalSub)}/월`, sub: `필요 없는 구독은 정리해봐요!` });
  }

  // 잔액 경고
  if (remaining < 0) {
    warnings.push({ type: 'red', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="16" height="11" rx="2"/><line x1="2" y1="9" x2="18" y2="9"/></svg>', title: `예산 초과 ${fmt(Math.abs(remaining))}`, sub: `이번 달 예산을 넘어섰어요. 지출을 멈춰야 할 때예요.` });
  } else if (remaining < 50000 && daysLeft > 3) {
    warnings.push({ type: 'red', icon: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="16" height="11" rx="2"/><line x1="2" y1="9" x2="18" y2="9"/></svg>', title: `잔액 ${fmt(remaining)}`, sub: `${daysLeft}일 남았어요. 한끼 탭에서 알뜰 식사를 확인해보세요!` });
  }

  warnings.forEach(w => {
    const el = document.createElement('div');
    el.className = 'warning-card' + (w.type === 'yellow' ? ' yellow' : '');
    el.innerHTML = `
      <div class="warning-icon" style="display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:rgba(0,0,0,0.06);flex-shrink:0">${w.icon}</div>
      <div>
        <div class="warning-card-title">${w.title}</div>
        <div class="warning-card-sub">${w.sub}</div>
      </div>`;
    zone.appendChild(el);
  });
}


function expenseItemHTML(e) {
  const isIncome = e.type === 'income';
  const amountStr = isIncome
    ? `<div class="expense-amount" style="color:var(--success)">+${fmt(e.amount)}</div>`
    : `<div class="expense-amount">-${fmt(e.amount)}</div>`;
  const iconHTML = catIconBox(isIncome ? '용돈' : e.cat, 'expense-emoji');
  return `<div class="expense-item">
    ${iconHTML}
    <div class="expense-info">
      <div class="expense-cat">${e.note || e.cat}</div>
      <div class="expense-note">${isIncome ? '용돈' : e.cat}${e.time ? ` · ${e.time}` : ''}</div>
    </div>
    <div class="expense-right">
      ${amountStr}
    </div>
    <div class="expense-menu-wrap">
      <button class="expense-menu-btn"
        ontouchend="event.preventDefault();toggleExpenseMenu(event,'${e.id}')"
        onclick="toggleExpenseMenu(event,'${e.id}')">⋮</button>
      <div class="expense-menu-popup hidden" id="menu-${e.id}">
        <button onclick="editExpense('${e.id}')"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3l3 3-9 9H5v-3L14 3z"/></svg> 수정하기</button>
        <button onclick="deleteExpense('${e.id}')"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="5,7 15,7"/><path d="M8 7V5h4v2"/><rect x="6" y="7" width="8" height="10" rx="1"/></svg> 삭제하기</button>
      </div>
    </div>
  </div>`;
}

// ─── 지출 내역 탭 ───
let currentFilter = 'all';
// ─── 지출 달력 ───
let _expCalYear = new Date().getFullYear();
let _expCalMonth = new Date().getMonth();
let _expCalSelected = null;

function moveExpCal(delta) {
  _expCalMonth += delta;
  if (_expCalMonth > 11) { _expCalMonth = 0; _expCalYear++; }
  if (_expCalMonth < 0)  { _expCalMonth = 11; _expCalYear--; }
  _expCalSelected = null;
  renderExpCal();
  renderExpCalDetail();
}

function selectExpCalDay(dateStr) {
  _expCalSelected = _expCalSelected === dateStr ? null : dateStr;
  renderExpCal();
  renderExpCalDetail();
}

function fmtShort(n) {
  if (n >= 10000) return (n / 10000).toFixed(n % 10000 === 0 ? 0 : 1) + '만';
  if (n >= 1000)  return Math.floor(n / 1000) + '천';
  return n + '';
}

function renderExpCal() {
  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const titleEl = document.getElementById('exp-cal-title');
  if (!titleEl) return;
  titleEl.textContent = `${_expCalYear}년 ${MONTHS[_expCalMonth]}`;

  const d = getData();
  const today = new Date();
  const todayStr = toDateStr(today);

  // 날짜별 지출 합계 (용돈 제외)
  const dailyTotals = {};
  onlyExpenses(d.expenses).forEach(e => {
    const ed = new Date(e.date);
    if (ed.getFullYear() === _expCalYear && ed.getMonth() === _expCalMonth) {
      dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount;
    }
  });

  // 날짜별 용돈 기록
  const incomeDays = new Set();
  d.expenses.filter(e => e.type === 'income').forEach(e => {
    const ed = new Date(e.date);
    if (ed.getFullYear() === _expCalYear && ed.getMonth() === _expCalMonth) {
      incomeDays.add(e.date);
    }
  });

  // 구독 결제일 (해당 월)
  const subDays = new Set();
  d.subscriptions.forEach(sub => {
    if (sub.billingDate && sub.billingDate.day) subDays.add(sub.billingDate.day);
  });

  const firstDay = new Date(_expCalYear, _expCalMonth, 1).getDay();
  const daysInMonth = new Date(_expCalYear, _expCalMonth + 1, 0).getDate();
  const grid = document.getElementById('exp-cal-grid');
  if (!grid) return;

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="exp-cal-day empty"></div>';

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${_expCalYear}-${String(_expCalMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dow = new Date(_expCalYear, _expCalMonth, day).getDay();
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === _expCalSelected;
    const total = dailyTotals[dateStr] || 0;
    const hasSub = subDays.has(day);
    const hasIncome = incomeDays.has(dateStr);

    let cls = 'exp-cal-day';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' selected';

    let numCls = 'exp-cal-num';
    if (dow === 0) numCls += ' sunday';
    else if (dow === 6) numCls += ' saturday';

    let inner = `<span class="${numCls}">${day}</span>`;
    if (total > 0 || hasSub || hasIncome) {
      inner += '<div class="exp-cal-dots">';
      if (total > 0)   inner += `<span class="exp-cal-exp-dot"></span>`;
      if (hasSub)      inner += `<span class="exp-cal-sub-dot"></span>`;
      if (hasIncome)   inner += `<span class="exp-cal-inc-dot"></span>`;
      inner += '</div>';
      if (total > 0) inner += `<span class="exp-cal-amount">${fmtShort(total)}</span>`;
    }

    html += `<div class="${cls}" onclick="selectExpCalDay('${dateStr}')">${inner}</div>`;
  }

  grid.innerHTML = html;
}

function renderExpCalDetail() {
  const el = document.getElementById('exp-cal-detail');
  if (!el) return;
  if (!_expCalSelected) { el.innerHTML = ''; return; }

  const d = getData();
  const dateObj = new Date(_expCalSelected + 'T00:00:00');
  const dayOfMonth = dateObj.getDate();
  const WDAY = ['일','월','화','수','목','금','토'];
  const dow = WDAY[dateObj.getDay()];
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  const dayExps = onlyExpenses(d.expenses).filter(e => e.date === _expCalSelected);
  const dayIncomes = d.expenses.filter(e => e.type === 'income' && e.date === _expCalSelected);
  const dayTotal = dayExps.reduce((s,e)=>s+e.amount,0);
  const daySubs = d.subscriptions.filter(s => s.billingDate && s.billingDate.day === dayOfMonth);

  if (!dayExps.length && !dayIncomes.length && !daySubs.length) {
    el.innerHTML = `<div class="exp-cal-detail"><div class="exp-cal-detail-empty">${month}월 ${day}일(${dow}) · 지출 없음</div></div>`;
    return;
  }

  let html = `<div class="exp-cal-detail">
    <div class="exp-cal-detail-header">
      <span>${month}월 ${day}일(${dow})</span>
      ${dayTotal ? `<span style="font-size:13px;color:var(--accent)">${fmt(dayTotal)}</span>` : ''}
    </div>`;

  daySubs.forEach(sub => {
    html += `<div class="exp-cal-detail-sub-row">
      <div class="exp-cal-detail-sub-icon"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="10" height="16" rx="2"/><circle cx="10" cy="15.5" r="0.8" fill="currentColor" stroke="none"/></svg></div>
      <span class="exp-cal-detail-sub-name">${sub.name} 결제일</span>
      <span class="exp-cal-detail-sub-amt">${fmt(sub.amount)}</span>
    </div>`;
  });

  dayIncomes.slice().reverse().forEach(e => {
    html += expenseItemHTML(e);
  });

  dayExps.slice().reverse().forEach(e => {
    html += expenseItemHTML(e);
  });

  html += '</div>';
  el.innerHTML = html;
}

function renderExpenseList() {
  renderExpCal();
  renderExpCalDetail();
  const d = getData();

  // 이번 달 합계 요약
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthExps = onlyExpenses(d.expenses).filter(e => e.date && e.date.startsWith(thisMonth));
  const monthTotal = monthExps.reduce((s, e) => s + e.amount, 0);
  const summaryEl = document.getElementById('expense-month-summary');
  if (summaryEl) summaryEl.textContent = monthExps.length > 0
    ? `이번 달 총 ${fmt(monthTotal)} · ${monthExps.length}건`
    : '이번 달 지출이 없어요';

  const list = document.getElementById('full-expense-list');
  let expenses = [...d.expenses].reverse();
  if (currentFilter !== 'all') expenses = expenses.filter(e => e.cat === currentFilter);
  if (!expenses.length) {
    list.innerHTML = '<div class="empty-state"><div class="emoji"><svg width="32" height="32" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="12" height="16" rx="2"/><line x1="7" y1="7" x2="13" y2="7"/><line x1="7" y1="10.5" x2="13" y2="10.5"/><line x1="7" y1="14" x2="10.5" y2="14"/></svg></div>내역이 없어요</div>';
    return;
  }

  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  const DAY_KO = ['일','월','화','수','목','금','토'];

  // 날짜별 그룹핑
  const groups = [];
  const seenDates = {};
  expenses.forEach(e => {
    if (!seenDates[e.date]) { seenDates[e.date] = []; groups.push({ date: e.date, items: seenDates[e.date] }); }
    seenDates[e.date].push(e);
  });

  list.innerHTML = groups.map(({ date, items }) => {
    let label;
    if (date === today) label = '오늘';
    else if (date === yesterday) label = '어제';
    else {
      const dt = new Date(date + 'T00:00:00');
      label = `${dt.getMonth()+1}월 ${dt.getDate()}일 (${DAY_KO[dt.getDay()]})`;
    }
    const dayTotal = onlyExpenses(items).reduce((s, e) => s + e.amount, 0);
    return `
      <div class="expense-date-divider">
        <span class="expense-date-label">${label}</span>
        <span class="expense-date-total">${fmt(dayTotal)}</span>
      </div>
      <div class="expense-day-card">
        ${items.map((e, i) => `
          ${expenseItemHTML(e)}
          ${i < items.length - 1 ? '<div class="expense-divider"></div>' : ''}
        `).join('')}
      </div>`;
  }).join('');
}

function filterExpenses(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderExpenseList();
}

// ─── 분석 탭 ───
function renderWeeklyChart() {
  const card = document.getElementById('weekly-chart-card');
  if (!card) return;
  const d = getData();
  const today = new Date();

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = toDateStr(date);
    const total = onlyExpenses(d.expenses).filter(e => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
    const m = date.getMonth() + 1, dy = date.getDate();
    days.push({ dateStr, total, isToday: i === 0, label: i === 0 ? '오늘' : `${m}/${dy}` });
  }

  const total7 = days.reduce((s, x) => s + x.total, 0);
  const avg7 = Math.round(total7 / 7);
  const maxVal = Math.max(...days.map(x => x.total), 1);
  const BAR_MAX_H = 72;

  const bars = days.map(x => {
    const h = x.total > 0 ? Math.max(6, Math.round((x.total / maxVal) * BAR_MAX_H)) : 3;
    const barCls = 'weekly-bar' + (x.isToday ? ' today' : x.total > 0 ? ' has' : '');
    const lblCls = 'weekly-bar-label' + (x.isToday ? ' today' : '');
    return `<div class="weekly-bar-col">
      <div class="${barCls}" style="height:${h}px"></div>
      <span class="${lblCls}">${x.label}</span>
    </div>`;
  }).join('');

  card.innerHTML = `
    <div class="weekly-chart-top">
      <div class="weekly-chart-meta">
        <div class="weekly-chart-sublabel">최근 7일 지출</div>
        <div class="weekly-chart-total">${fmt(total7)}</div>
      </div>
      <div class="weekly-chart-avg-badge"><svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,14 7,8 12,11 18,4"/><polyline points="13,4 18,4 18,9"/></svg> 일평균 ${fmt(avg7)}</div>
    </div>
    <div class="weekly-chart-bars">${bars}</div>`;
}

const CAT_LIMITS = { 식비:60000, 카페:20000, 교통:20000, 술자리:30000, 구독:30000, 쇼핑:50000, 병원:30000, 기타:20000 };
const CAT_COMMENTS = {
  식비:  [['절약 식단 중! 훌륭해요','식비 적당해요','식비가 꽤 많아요. 학식 활용해봐요!','식비가 너무 많아요! 학식 or 편의점 도시락으로!']],
  카페:  [['카페 지출 없음','절약 중이에요! 훌륭해요','적당한 편이에요','카페비가 많아요. 텀블러 챙겨봐요!','카페비가 너무 많아요! 학교 정수기를 애용하세요']],
  교통:  [['교통비 지출 없음','교통비 절약 중이에요','적당한 편이에요','교통비가 많아요. 자전거나 도보 고려해봐요!','교통비가 많아요! 정기권 활용해보세요']],
  술자리:[['술자리 지출 없음','절제하고 있어요','적당한 편이에요','술자리 지출이 많아요. 조금 줄여봐요!','술자리 지출이 너무 많아요!']],
  구독:  [['구독료 지출 없음','구독 관리 잘 하고 있어요','적당한 편이에요','구독료가 많아요. 안 쓰는 거 정리해봐요!','구독료가 너무 많아요! 꼭 필요한 것만 남겨요']],
  쇼핑:  [['쇼핑 지출 없음','절약 중이에요','적당한 편이에요','쇼핑 지출이 많아요. 장바구니 다시 확인해봐요!','쇼핑을 너무 많이 했어요!']],
  병원:  [['병원 지출 없음','건강 챙기고 있어요','적당한 편이에요','병원비가 꽤 있어요. 건강 잘 챙겨요!','병원비가 많아요. 건강이 먼저에요']],
  기타:  [['기타 지출 없음','기타 지출 절약 중이에요','적당한 편이에요','기타 지출이 많아요.','기타 지출이 너무 많아요!']],
};
function renderAnalysis() {
  renderWeeklyChart();
  const d = getData();

  // 부제: "이번 달, 5월 1일부터 오늘까지"
  const _now = new Date();
  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const periodEl = document.getElementById('analysis-period');
  if (periodEl) {
    periodEl.textContent = `이번 달, ${MONTHS[_now.getMonth()]} 1일부터 오늘까지`;
  }

  // 이번 주 카테고리별 합산
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const weekTotals = {};
  onlyExpenses(d.expenses).filter(e => new Date(e.date) >= weekAgo).forEach(e => {
    weekTotals[e.cat] = (weekTotals[e.cat] || 0) + e.amount;
  });

  // 최다 지출 카테고리 찾기
  const totalWeek = Object.values(weekTotals).reduce((s, v) => s + v, 0);
  const topCat = Object.keys(weekTotals).sort((a, b) => weekTotals[b] - weekTotals[a])[0];
  const topAmount = topCat ? weekTotals[topCat] : 0;
  const barPct = totalWeek > 0 ? Math.round((topAmount / totalWeek) * 100) : 0;
  const sharePct = totalWeek > 0 ? Math.round((topAmount / totalWeek) * 100) : 0;

  const iconEl = document.getElementById('top-cat-icon');
  iconEl.innerHTML = topCat ? catIconBox(topCat, 'analysis-cat-icon') : '<svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="3.5" height="6" rx="1"/><rect x="8.25" y="7" width="3.5" height="10" rx="1"/><rect x="13.5" y="4" width="3.5" height="13" rx="1"/></svg>';
  document.getElementById('coffee-weekly').textContent = topCat || '-';
  document.getElementById('top-cat-amount').textContent = topCat ? fmt(topAmount) : '';
  document.getElementById('coffee-bar').style.width = barPct + '%';
  document.getElementById('coffee-comment').textContent = totalWeek === 0
    ? '이번 주 지출 내역이 없어요'
    : `전체 지출의 ${sharePct}%`;


  renderSubscriptions();
  renderCategoryChart(onlyExpenses(d.expenses));

  // 예상 월 지출 (구독 결제일 반영)
  const today = new Date();
  const todayDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
  const remainingDays = daysInMonth - todayDay;

  // 이번 달 실제 지출
  const thisMonthStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
  const thisMonthSpent = onlyExpenses(d.expenses)
    .filter(e => e.date.startsWith(thisMonthStr))
    .reduce((s, e) => s + e.amount, 0);

  // 일평균 (비구독 페이스)
  const dailyAvg = todayDay > 0 ? thisMonthSpent / todayDay : 0;
  const projectedDaily = Math.round(dailyAvg * remainingDays);

  // 구독 결제 예정 (아직 결제일 안 지난 것 + 날짜 없는 것)
  const upcomingSubs = d.subscriptions.filter(sub => {
    if (!sub.billingDate) return true; // 날짜 없으면 예정에 포함
    return sub.billingDate.day > todayDay;  // 아직 결제일 안 지남
  });
  const upcomingSubTotal = upcomingSubs.reduce((s, sub) => s + sub.amount, 0);

  // 이미 결제된 구독 (결제일이 오늘 이전)
  const paidSubs = d.subscriptions.filter(sub => sub.billingDate && sub.billingDate.day <= todayDay);
  const paidSubTotal = paidSubs.reduce((s, sub) => s + sub.amount, 0);

  const projectedTotal = thisMonthSpent + projectedDaily + upcomingSubTotal;

  document.getElementById('monthly-pace').textContent = fmt(projectedTotal);

  // 세부 내역
  const breakdown = document.getElementById('pace-breakdown');
  let rows = `<div class="pace-row"><span>이번 달 지출</span><span>${fmt(thisMonthSpent)}</span></div>`;
  rows += `<div class="pace-row"><span>예산대비</span><span>+${fmt(projectedDaily)}</span></div>`;
  if (upcomingSubTotal > 0) {
    rows += `<div class="pace-row"><span>결제 예정 구독 (${upcomingSubs.length}개)</span><span>+${fmt(upcomingSubTotal)}</span></div>`;
  }
  if (paidSubTotal > 0) {
    rows += `<div class="pace-row" style="color:var(--success)"><span>이미 결제된 구독 (${paidSubs.length}개)</span><span>✓ ${fmt(paidSubTotal)}</span></div>`;
  }
  breakdown.innerHTML = rows;

  const diff = projectedTotal - d.budget;
  document.getElementById('pace-comment').textContent = diff > 0
    ? `이 페이스면 ${fmt(diff)} 초과 예상이에요`
    : `이 페이스면 ${fmt(Math.abs(diff))} 남을 것 같아요`;
}

function renderSubscriptions() {
  const d = getData();
  const totalSub = d.subscriptions.reduce((s, sub) => s + sub.amount, 0);
  const titleEl = document.getElementById('sub-section-title');
  if (titleEl) titleEl.textContent = totalSub > 0 ? `구독 서비스 · 월 ${fmt(totalSub)}` : '구독 서비스';
  const list = document.getElementById('subscription-list');
  if (!d.subscriptions.length) {
    list.innerHTML = '<div style="color:var(--text2);font-size:13px;padding:8px 0">등록된 구독이 없어요</div>';
    return;
  }
  list.innerHTML = d.subscriptions.map(sub => `
    <div class="sub-item">
      <div class="sub-info">
        <div style="width:38px;height:38px;border-radius:12px;background:var(--cat-sub);color:var(--cat-sub-ink);display:grid;place-items:center;flex-shrink:0;font-size:18px">${sub.emoji||'<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="10" height="16" rx="2"/><circle cx="10" cy="15.5" r="0.8" fill="currentColor" stroke="none"/></svg>'}</div>
        <div>
          <div class="sub-name">${sub.name}</div>
          ${sub.billingDate ? `<div class="sub-billing">매월 ${sub.billingDate.day}일 결제</div>` : ''}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sub-amount">${fmt(sub.amount)}/월</span>
        <button class="sub-delete" onclick="deleteSub('${sub.id}')">×</button>
      </div>
    </div>`).join('');
}

function renderCategoryChart(expenses) {
  const totals = {};
  expenses.forEach(e => { totals[e.cat] = (totals[e.cat]||0) + e.amount; });
  const max = Math.max(...Object.values(totals), 1);
  const chart = document.getElementById('category-chart');
  const total = Object.values(totals).reduce((s, v) => s + v, 0);
  chart.innerHTML = Object.entries(totals)
    .sort((a,b) => b[1]-a[1])
    .map(([cat, amt]) => {
      const barPct = (amt / max * 100).toFixed(1);
      const sharePct = total > 0 ? Math.round(amt / total * 100) : 0;
      return `<div class="chart-row">
        <div class="chart-row-inner">
          ${catIconMini(cat)}
          <div class="chart-bar-col">
            <span class="chart-label">${cat}</span>
            <div class="chart-bar-row">
              <div class="chart-bar-wrap">
                <div class="chart-bar-fill" style="width:${barPct}%;background:${CAT_COLORS[cat]||'#7C6CF4'}"></div>
              </div>
              <div class="chart-right">
                <span class="chart-amount">${fmt(amt)}</span>
                <span class="chart-pct">${sharePct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }).join('') || '<div style="color:var(--ink-4);font-size:13px;padding:8px 0">지출 데이터가 없어요</div>';
}

// ─── 학식 메뉴 ───
let hakshikData = null;
let selectedMenuDay = null;
let selectedBuilding = 'jonggang';
let menuLoaded = false;

async function loadHakshikMenu() {
  if (menuLoaded) return;
  menuLoaded = true;
  try {
    const res = await fetch('menu.json?t=' + Date.now());
    if (!res.ok) throw new Error();
    hakshikData = await res.json();

    const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
    const todayDay = DAY_NAMES[new Date().getDay()];
    const weekdays = ['월', '화', '수', '목', '금'];
    selectedMenuDay = weekdays.includes(todayDay) ? todayDay : '월';

    const tabs = document.getElementById('menu-day-tabs');
    tabs.innerHTML = weekdays.map(day => `
      <button class="menu-day-btn${day === selectedMenuDay ? ' active' : ''}${day === todayDay ? ' today' : ''}"
        onclick="switchMenuDay('${day}',this)">${day}</button>
    `).join('');

    renderMenuContent(selectedMenuDay, todayDay);

    document.getElementById('hakshik-menu-loading').classList.add('hidden');
    document.getElementById('hakshik-menu-content').classList.remove('hidden');

    if (hakshikData.weekRange) {
      document.getElementById('menu-updated').textContent = hakshikData.weekRange;
    }
  } catch (e) {
    document.getElementById('hakshik-menu-loading').classList.add('hidden');
    document.getElementById('hakshik-menu-error').classList.remove('hidden');
  }
}

function switchBuilding(building, btn) {
  selectedBuilding = building;
  document.querySelectorAll('.building-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  renderMenuContent(selectedMenuDay, DAY_NAMES[new Date().getDay()]);
}

function switchMenuDay(day, btn) {
  selectedMenuDay = day;
  document.querySelectorAll('.menu-day-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  renderMenuContent(day, DAY_NAMES[new Date().getDay()]);
}

function renderMenuContent(day, todayDay) {
  const content = document.getElementById('menu-day-content');
  if (!hakshikData) return;
  const isToday = day === todayDay;

  const renderCol = (label, items) => {
    const isEmpty = !items.length || (items.length === 1 && items[0] === 'x');
    return `<div class="menu-col">
      <div class="menu-meal-label">${label}</div>
      ${isEmpty
        ? `<div class="menu-meal-empty">운영 없음</div>`
        : `<div class="menu-items">${items.map((item, i) => `<div class="menu-item${i === 0 ? ' main-item' : ''}">${i === 0 ? '' : '· '}${item}</div>`).join('')}</div>`
      }
    </div>`;
  };

  if (selectedBuilding === 'jonggang') {
    const bld = hakshikData.jonggang || hakshikData.student;
    const menu = bld?.menu?.[day] || [];
    const faculty = hakshikData.faculty?.menu?.[day] || [];
    const isEmpty = !menu.length || (menu.length === 1 && menu[0] === 'x');
    if (isEmpty && !faculty.length) {
      content.innerHTML = '<div class="menu-weekend">이날은 학식 운영이 없어요</div>';
      return;
    }
    content.innerHTML = `
      <div class="menu-card${isToday ? ' today-menu' : ''}">
        <div class="menu-today-badge${isToday ? '' : ' invisible'}">오늘의 학식</div>
        <div class="menu-corner">${bld.corner} · ${(bld.price || 6000).toLocaleString()}원</div>
        <div class="menu-two-col">
          ${renderCol('학생 식단', menu)}
          <div class="menu-col-divider"></div>
          ${renderCol('교직원 식단', faculty)}
        </div>
      </div>`;
  } else {
    const bld = hakshikData.amaranth;
    const meals = bld?.menu?.[day] || {};
    const lunch = meals['중식'] || ['x'];
    const dinner = meals['석식'] || ['x'];
    content.innerHTML = `
      <div class="menu-card${isToday ? ' today-menu' : ''}">
        <div class="menu-today-badge${isToday ? '' : ' invisible'}">오늘의 학식</div>
        <div class="menu-corner">${bld.corner} · ${(bld.price || 6500).toLocaleString()}원</div>
        <div class="menu-two-col">
          ${renderCol('중식', lunch)}
          <div class="menu-col-divider"></div>
          ${renderCol('석식', dinner)}
        </div>
      </div>`;
  }
}

// ─── 맛집 추천 알고리즘 ───
function getDateSeed(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededRandom(seed, index) {
  let s = ((seed + index * 2654435761) >>> 0);
  s ^= s << 13; s ^= s >> 17; s ^= s << 5;
  return (s >>> 0) / 0xFFFFFFFF;
}

function getRecHistory() {
  try { return JSON.parse(localStorage.getItem('rec_history') || '[]'); } catch { return []; }
}

function saveRecHistory(history) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = toDateStr(cutoff);
  localStorage.setItem('rec_history', JSON.stringify(history.filter(h => h.date >= cutoffStr)));
}

function getSkipIds() {
  return getRecHistory().flatMap(h => [h.lunchId, h.dinnerId].filter(Boolean));
}

function getRecentCategories() {
  const history = getRecHistory();
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 3);
  const cutoffStr = toDateStr(cutoff);
  return history
    .filter(h => h.date >= cutoffStr)
    .flatMap(h => [h.lunchId, h.dinnerId].filter(Boolean))
    .map(id => RESTAURANTS.find(r => r.id === id)?.category)
    .filter(Boolean);
}

function pickRec(pool, seed, offset) {
  if (!pool.length) return null;
  const recentCats = getRecentCategories();
  const preferred = pool.filter(r => !recentCats.includes(r.category));
  const candidates = preferred.length ? preferred : pool;
  return candidates[Math.floor(seededRandom(seed, offset) * candidates.length)];
}

function getRecommendations(dateStr, skipIds) {
  const seed = getDateSeed(dateStr);
  const skip = skipIds ?? getSkipIds();
  const lunchPool = RESTAURANTS.filter(r => r.mealType.includes('lunch') && !REC_MEAL_CATS.has(r.category) && !skip.includes(r.id) && r.priceMin <= 15000);
  const dinnerPool = RESTAURANTS.filter(r => r.mealType.includes('dinner') && !REC_MEAL_CATS.has(r.category) && !skip.includes(r.id));
  return { lunch: pickRec(lunchPool, seed, 0), dinner: pickRec(dinnerPool, seed, 1) };
}

function getAlternative(dateStr, mealType, excludeIds, clickCount) {
  const seed = (getDateSeed(dateStr) ^ (clickCount * 99991)) >>> 0;
  const basePool = RESTAURANTS.filter(r =>
    r.mealType.includes(mealType) &&
    !REC_MEAL_CATS.has(r.category) &&
    (mealType === 'lunch' ? r.priceMin <= 15000 : true)
  );
  // 이미 보여준 식당 제외, 풀이 너무 작으면 제외 완화
  const pool = basePool.filter(r => !excludeIds.includes(r.id));
  const candidates = pool.length >= 3 ? pool : basePool.filter(r => r.id !== excludeIds[0]);
  if (!candidates.length) return basePool[0] || RESTAURANTS[0];
  return candidates[Math.floor(seededRandom(seed, 1) * candidates.length)];
}

let _recState = { lunch: null, dinner: null };
let _shownIds = { lunch: [], dinner: [] };

function renderDailyRecommendation() {
  const dateStr = toDateStr(new Date());
  const history = getRecHistory();
  const todayRec = history.find(h => h.date === dateStr);

  if (todayRec) {
    _recState.lunch  = RESTAURANTS.find(r => r.id === todayRec.lunchId)  || null;
    _recState.dinner = RESTAURANTS.find(r => r.id === todayRec.dinnerId) || null;
  } else {
    const rec = getRecommendations(dateStr);
    _recState.lunch  = rec.lunch;
    _recState.dinner = rec.dinner;
    history.push({ date: dateStr, lunchId: rec.lunch?.id, dinnerId: rec.dinner?.id });
    saveRecHistory(history);
  }

  // 세션 내 표시 이력 초기화 (이미 없는 경우에만 추가)
  if (_recState.lunch?.id  && !_shownIds.lunch.includes(_recState.lunch.id))   _shownIds.lunch.push(_recState.lunch.id);
  if (_recState.dinner?.id && !_shownIds.dinner.includes(_recState.dinner.id)) _shownIds.dinner.push(_recState.dinner.id);

  renderRecCard('lunch');
  renderRecCard('dinner');
}

function renderRecCard(mealType) {
  const r = _recState[mealType];
  const el = document.getElementById('rec-' + mealType);
  if (!el) return;
  if (!r) { el.innerHTML = '<div style="color:var(--text2);font-size:13px;padding:8px 0">추천할 식당이 없어요</div>'; return; }

  const localBadge = r.isLocal
    ? '<span class="rec-local-badge local">★ 로컬</span>'
    : '<span class="rec-local-badge franchise">☆ 프랜차이즈</span>';
  const noteTxt = r.note ? `<div class="rec-note">${r.note}</div>` : '';
  const label = mealType === 'lunch' ? '점심 추천' : '저녁 추천';

  el.innerHTML = `
    <div class="rec-meal-label">${label}</div>
    <div class="rec-main">
      <div class="rec-info">
        <div class="rec-name">${r.name}</div>
        <div class="rec-badges">
          <span class="rec-cat-badge">${r.category}</span>
          ${localBadge}
        </div>
        <div class="rec-menu">${r.mainMenu}</div>
        ${noteTxt}
      </div>
      <div class="rec-price">${r.price}</div>
    </div>
    <button class="rec-refresh-btn" onclick="refreshRecommendation('${mealType}')">다른 거 추천해줘</button>
  `;
}

function refreshRecommendation(mealType) {
  const dateStr = toDateStr(new Date());
  const currentId = _recState[mealType]?.id;
  const otherId   = _recState[mealType === 'lunch' ? 'dinner' : 'lunch']?.id;

  // 현재 식당을 세션 이력에 추가
  if (currentId && !_shownIds[mealType].includes(currentId)) _shownIds[mealType].push(currentId);

  // 전체 풀 계산
  const basePool = RESTAURANTS.filter(r =>
    r.mealType.includes(mealType) &&
    !REC_MEAL_CATS.has(r.category) &&
    (mealType === 'lunch' ? r.priceMin <= 15000 : true)
  );
  const remaining = basePool.filter(r => !_shownIds[mealType].includes(r.id) && r.id !== otherId);

  // 풀 소진 시 순환 재시작 (현재 식당만 제외)
  if (remaining.length === 0) _shownIds[mealType] = currentId ? [currentId] : [];

  const excludeIds = [..._shownIds[mealType], otherId].filter(Boolean);
  const alt = getAlternative(dateStr, mealType, excludeIds, _shownIds[mealType].length);
  _recState[mealType] = alt;

  const history = getRecHistory();
  const key = mealType === 'lunch' ? 'lunchId' : 'dinnerId';
  const idx  = history.findIndex(h => h.date === dateStr);
  if (idx !== -1) history[idx][key] = alt.id;
  else history.push({ date: dateStr, [key]: alt.id });
  saveRecHistory(history);

  renderRecCard(mealType);
}

// ─── 봉담 맛집 100 ───
let _restCat = 'all';
let _restBudgetOnly = false;

function getCatKey(r) { return CAT_KEY_MAP[r.category] || 'cvs'; }

function toggleRestBudget() {
  _restBudgetOnly = !_restBudgetOnly;
  renderRestaurantBrowser();
}

function setRestCat(key) {
  _restCat = key;
  renderRestaurantBrowser();
}

function renderRestaurantBrowser() {
  const d = getData();
  const totalSpent = onlyExpenses(d.expenses).reduce((s, e) => s + e.amount, 0);
  const remaining = d.budget - totalSpent;
  const daysLeft = getDaysLeft(new Date(), d.payday);
  const dailyAllowance = daysLeft > 0 ? Math.floor(remaining / daysLeft) : 0;

  const localCount = RESTAURANTS.filter(r => r.isLocal).length;
  const statEl = document.getElementById('rest-header-stat');
  if (statEl) statEl.textContent = `★ 로컬 ${localCount} · ☆ 프차 ${RESTAURANTS.length - localCount}`;

  const counts = { all: RESTAURANTS.length };
  RESTAURANTS.forEach(r => {
    const k = getCatKey(r);
    counts[k] = (counts[k] || 0) + 1;
  });

  const chipsEl = document.getElementById('rest-chips');
  if (chipsEl) {
    chipsEl.innerHTML = RESTAURANT_CATEGORIES.map(c => {
      const n = counts[c.key] || 0;
      const active = c.key === _restCat;
      return `<button class="chip-btn${active ? ' active' : ''}" onclick="setRestCat('${c.key}')">
        ${c.ko} <span class="chip-count">${n}</span>
      </button>`;
    }).join('');
  }

  const possibleCount = RESTAURANTS.filter(r => r.priceMin <= dailyAllowance).length;
  const budgetBtn = document.getElementById('rest-budget-btn');
  if (budgetBtn) {
    budgetBtn.className = 'rest-budget-btn' + (_restBudgetOnly ? ' active' : '');
    budgetBtn.innerHTML = `<span>${SPARKLE_ICON}오늘 예산(${fmt(dailyAllowance)}) 안에 가능</span>
      <span class="rest-budget-badge">${_restBudgetOnly ? 'ON' : 'off'}</span>`;
  }

  let items = RESTAURANTS;
  if (_restCat !== 'all') items = items.filter(r => getCatKey(r) === _restCat);
  if (_restBudgetOnly) items = items.filter(r => r.priceMin <= dailyAllowance);

  const listEl = document.getElementById('rest-list');
  if (listEl) {
    if (items.length === 0) {
      listEl.innerHTML = '<div class="rest-empty">조건에 맞는 식당이 없어요</div>';
    } else {
      listEl.innerHTML = items.map(r => {
        const inBudget = r.priceMin <= dailyAllowance;
        return `<div class="rest-row">
          <span class="rest-local-badge ${r.isLocal ? 'local' : 'franchise'}">${r.isLocal ? '★' : '☆'}</span>
          <div class="rest-info">
            <div class="rest-name">${r.name}</div>
            <div class="rest-dish">${r.mainMenu}${r.note ? ' · ' + r.note : ''}</div>
          </div>
          <div class="rest-price-wrap">
            <div class="rest-price ${inBudget ? 'ok' : 'over'}">${r.price}</div>
            ${inBudget ? '<div class="rest-ok-label">오늘 가능</div>' : ''}
          </div>
        </div>`;
      }).join('');
    }
  }
}

function renderSurvival() {
  const d = getData();
  const totalSpent = onlyExpenses(d.expenses).reduce((s, e) => s + e.amount, 0);
  const remaining = d.budget - totalSpent;
  const daysLeft = getDaysLeft(new Date(), d.payday);
  const dailyAllowance = daysLeft > 0 ? Math.floor(remaining / daysLeft) : 0;

  const subEl = document.getElementById('hankki-daily-sub');
  if (subEl) subEl.textContent = dailyAllowance <= 0 ? `이번 달 예산이 초과됐어요` : `오늘 ${fmt(dailyAllowance)}로 버텨야 해요`;

  // 학식 vs 외식
  const hakshikCard = document.getElementById('meal-hakshik');
  const outsideCard = document.getElementById('meal-outside');
  const tip = document.getElementById('meal-tip');


  const hakshikPrice = 6500;
  const outsideAvg = 10000;
  const priceDiff = outsideAvg - hakshikPrice;

  outsideCard.classList.remove('possible');
  if (dailyAllowance <= 0) {
    hakshikCard.classList.add('recommended');
    outsideCard.classList.remove('recommended');
    document.getElementById('hakshik-tag').className = 'meal-tag danger';
    document.getElementById('hakshik-tag').textContent = '위기';
    document.getElementById('outside-tag').className = 'meal-tag danger';
    document.getElementById('outside-tag').textContent = '불가';
    tip.innerHTML = `<span>${SPARKLE_ICON}예산이 초과됐어요. 지출을 멈추고 버텨야 해요!</span>`;
  } else if (dailyAllowance < 10000) {
    hakshikCard.classList.add('recommended');
    outsideCard.classList.remove('recommended');
    document.getElementById('hakshik-tag').className = 'meal-tag success';
    document.getElementById('hakshik-tag').textContent = '추천';
    document.getElementById('outside-tag').className = 'meal-tag price-diff';
    document.getElementById('outside-tag').textContent = `+${fmt(priceDiff)}`;
    tip.innerHTML = `<span>${SPARKLE_ICON}하루 예산 <strong>${fmt(dailyAllowance)}</strong> — 학식만 먹어야 살아남아요!</span>`;
  } else if (dailyAllowance < 15000) {
    hakshikCard.classList.add('recommended');
    outsideCard.classList.remove('recommended');
    document.getElementById('hakshik-tag').className = 'meal-tag success';
    document.getElementById('hakshik-tag').textContent = '추천';
    document.getElementById('outside-tag').className = 'meal-tag warning';
    document.getElementById('outside-tag').textContent = '가끔만';
    tip.innerHTML = `<span>${SPARKLE_ICON}하루 예산 <strong>${fmt(dailyAllowance)}</strong> — 학식 위주로, 외식은 가끔만!</span>`;
  } else {
    hakshikCard.classList.remove('recommended');
    outsideCard.classList.add('possible');
    document.getElementById('hakshik-tag').className = 'meal-tag success';
    document.getElementById('hakshik-tag').textContent = '추천';
    document.getElementById('outside-tag').className = 'meal-tag neutral';
    document.getElementById('outside-tag').textContent = '가능';
    tip.innerHTML = `<span>${SPARKLE_ICON}하루 예산 <strong>${fmt(dailyAllowance)}</strong> — 여유 있어요. 가끔 외식도 OK!</span>`;
  }

  renderRestaurantBrowser();
  renderDailyRecommendation();
  loadHakshikMenu();
}

// ─── 지출 모달 ───
function openExpenseModal() {
  document.getElementById('expense-overlay').classList.remove('hidden');
  document.getElementById('expense-amount').value = '';
  document.getElementById('expense-note').value = '';
  document.getElementById('etc-name').value = '';
  document.getElementById('etc-name').placeholder = '지출 이름 (예: 아아+베이글, 편의점)';
  document.getElementById('recent-amounts').innerHTML = '';
  selectedCat = '식비';
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
}

function renderRecentAmounts(cat) {
  const d = getData();
  const seen = new Set();
  const recent = [];
  for (let i = d.expenses.length - 1; i >= 0 && recent.length < 4; i--) {
    const e = d.expenses[i];
    if (e.cat !== cat) continue;
    const key = String(e.amount);
    if (!seen.has(key)) { seen.add(key); recent.push(e); }
  }
  const el = document.getElementById('recent-amounts');
  if (!recent.length) { el.innerHTML = ''; return; }
  el.innerHTML = recent.map(e =>
    `<button class="recent-chip" onclick="applyRecentAmount(${e.amount},'${(e.note||'').replace(/'/g,"\\'")}')">
      ${e.amount.toLocaleString()}원
    </button>`
  ).join('');
}

function applyRecentAmount(amount, note) {
  document.getElementById('expense-amount').value = amount;
  document.getElementById('expense-note').value = note;
}
function closeExpenseModal() {
  document.getElementById('expense-overlay').classList.add('hidden');
  document.getElementById('modal-title').textContent = '지출 추가';
  editingExpenseId = null;
}
function selectCat(btn, showRecent = true) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedCat = btn.dataset.cat;
  const etcInput = document.getElementById('etc-name');
  if (selectedCat === '교통') {
    etcInput.placeholder = '수단 입력 (예: 버스, 택시, 지하철)';
  } else if (selectedCat === '기타') {
    etcInput.placeholder = '지출 이름 입력 (예: 문구류, 택배)';
  } else {
    etcInput.placeholder = '지출 이름 (예: 아아+베이글, 편의점)';
  }
  if (showRecent) renderRecentAmounts(selectedCat);
}
function addExpense() {
  const amount = parseInt(document.getElementById('expense-amount').value);
  if (!amount || amount <= 0) { alert('금액을 입력해주세요'); return; }
  const etcName = document.getElementById('etc-name').value.trim();
  const note = etcName || document.getElementById('expense-note').value.trim();
  const d = getData();
  if (editingExpenseId) {
    const idx = d.expenses.findIndex(e => e.id === editingExpenseId);
    if (idx !== -1) {
      d.expenses[idx] = { ...d.expenses[idx], cat: selectedCat, amount, note };
    }
    editingExpenseId = null;
  } else {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    d.expenses.push({ id: Date.now().toString(), cat: selectedCat, amount, note, date: toDateStr(now), time });
  }
  save(d);
  closeExpenseModal();
  renderAll();
}
let menuAllowedAfter = 0;
function toggleExpenseMenu(event, id) {
  event.stopPropagation();
  // touch 기기에서는 ontouchend로만 처리, ghost click(click 이벤트) 차단
  if (event.type === 'click' && navigator.maxTouchPoints > 0) return;
  if (Date.now() < menuAllowedAfter) return;
  const wrap = event.currentTarget.closest('.expense-menu-wrap');
  const popup = wrap.querySelector('.expense-menu-popup');
  const isHidden = popup.classList.contains('hidden');
  document.querySelectorAll('.expense-menu-popup').forEach(p => p.classList.add('hidden'));
  if (isHidden) popup.classList.remove('hidden');
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.expense-menu-wrap')) {
    document.querySelectorAll('.expense-menu-popup').forEach(p => p.classList.add('hidden'));
  }
});
function editExpense(id) {
  const d = getData();
  const e = d.expenses.find(x => x.id === id);
  if (!e) return;
  document.querySelectorAll('.expense-menu-popup').forEach(p => p.classList.add('hidden'));
  openExpenseModal();
  document.getElementById('expense-amount').value = e.amount;
  selectedCat = e.cat;
  document.getElementById('etc-name').value = e.note || '';
  document.getElementById('expense-note').value = '';
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === e.cat);
  });
  document.getElementById('modal-title').textContent = '지출 수정';
  editingExpenseId = id;
}
let editingExpenseId = null;
function deleteExpense(id) {
  const d = getData();
  const target = d.expenses.find(e => e.id === id);
  if (target && target.type === 'income') {
    d.budget -= target.amount;
  }
  d.expenses = d.expenses.filter(e => e.id !== id);
  save(d);
  renderAll();
}

// ─── 구독 모달 ───
function openSubModal() {
  const btn = document.getElementById('sub-date-btn');
  btn.textContent = '결제일 선택';
  btn.classList.remove('selected');
  btn.dataset.payday = '';
  btn.dataset.month = '';
  document.getElementById('sub-name').value = '';
  document.getElementById('sub-amount').value = '';
  document.getElementById('sub-overlay').classList.remove('hidden');
}
function closeSubModal() {
  document.getElementById('sub-overlay').classList.add('hidden');
}
function getSubDate() {
  const btn = document.getElementById('sub-date-btn');
  const day = parseInt(btn.dataset.payday) || null;
  const month = parseInt(btn.dataset.month) || null;
  return day ? { month, day } : null;
}

let subEmoji = '';

function fillSubPreset(name, emoji, amount, btn) {
  document.querySelectorAll('.sub-presets button').forEach(b => b.style.borderColor = '');
  btn.style.borderColor = 'var(--primary)';
  document.getElementById('sub-name').value = name;
  document.getElementById('sub-amount').value = amount;
  subEmoji = emoji;
}

function addCustomSub() {
  const name = document.getElementById('sub-name').value.trim();
  const amount = parseInt(document.getElementById('sub-amount').value);
  if (!name || !amount) { alert('이름과 금액을 입력해주세요'); return; }
  const d = getData();
  d.subscriptions.push({ id: Date.now().toString(), name, emoji: subEmoji, amount, billingDate: getSubDate() });
  save(d);
  closeSubModal();
  renderAll();
}
function deleteSub(id) {
  const d = getData();
  d.subscriptions = d.subscriptions.filter(s => s.id !== id);
  save(d);
  renderAll();
}

// ─── 용돈 추가 ───
function openAddBudgetModal() {
  document.getElementById('add-budget-amount').value = '';
  document.getElementById('add-budget-overlay').classList.remove('hidden');
  initDragInputs();
}
function closeAddBudgetModal() {
  document.getElementById('add-budget-overlay').classList.add('hidden');
}
function applyAddBudget() {
  const amount = parseInt(document.getElementById('add-budget-amount').value);
  if (!amount || amount <= 0) { alert('금액을 입력해주세요'); return; }
  const d = getData();
  d.budget += amount;
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  d.expenses.push({
    id: Date.now().toString(),
    date: toDateStr(now),
    cat: '용돈',
    amount,
    note: '용돈 추가',
    time,
    type: 'income',
  });
  save(d);
  closeAddBudgetModal();
  renderAll();
}

// ─── 알림 ───
let _swReg = null;

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').then(reg => { _swReg = reg; });
}

function updateNotifEnableBtn() {
  const btn = document.getElementById('notif-enable-btn');
  if (!btn) return;
  const d = getData();
  const on = d.notif !== false;
  btn.textContent = on ? 'ON' : 'OFF';
  btn.classList.toggle('off', !on);
}

function toggleNotifFromPanel() {
  const d = getData();
  d.notif = !(d.notif !== false);
  save(d);
  updateNotifEnableBtn();
  const settingsTog = document.getElementById('notif-toggle');
  if (settingsTog) {
    settingsTog.textContent = d.notif ? 'ON' : 'OFF';
    settingsTog.classList.toggle('off', !d.notif);
  }
}

function requestNotifPermissionOnly() {
  if (!('Notification' in window)) { alert('이 브라우저는 알림을 지원하지 않아요'); return; }
  if (Notification.permission === 'granted') { alert('이미 알림이 허용되어 있어요 ✓'); return; }
  Notification.requestPermission().then(perm => {
    if (perm === 'granted') { registerSW(); updateNotifPermUI(); }
    else updateNotifPermUI();
  });
}

function updateNotifPermUI() {
  const row = document.getElementById('notif-perm-row');
  if (!row) return;
  const perm = Notification?.permission ?? 'default';
  if (perm === 'granted') {
    row.style.display = 'none';
  } else if (perm === 'denied') {
    row.innerHTML = '<div class="notif-perm-hint">브라우저에서 알림이 차단됐어요. 브라우저 설정에서 허용해주세요.</div>';
  } else {
    row.style.display = '';
  }
}

function renderNotifBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  const d = getData();
  const todayDay = new Date().getDate();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDate();
  const hasAlert = d.subscriptions.some(s =>
    s.billingDate && (s.billingDate.day === todayDay || s.billingDate.day === tomorrowDay)
  );
  if (!hasAlert) { badge.classList.add('hidden'); return; }
  // 결제일/전날 구독 있음 → 패널 열어서 확인했으면 숨김
  const todayStr = new Date().toISOString().slice(0, 10);
  const seen = localStorage.getItem('notif_badge_seen');
  badge.classList.toggle('hidden', seen === todayStr);
}

function renderNotifPanel() {
  const d = getData();
  const today = new Date();
  const list = document.getElementById('notif-panel-list');
  if (!list) return;

  const upcoming = d.subscriptions
    .filter(s => s.billingDate)
    .map(s => {
      const billDay = s.billingDate.day;
      const todayDay = today.getDate();
      let daysUntil = billDay - todayDay;
      if (daysUntil < 0) daysUntil += new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      return { ...s, daysUntil };
    })
    .filter(s => s.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  if (!upcoming.length) {
    list.innerHTML = '<div class="notif-empty">7일 내 결제 예정 구독이 없어요 🎉</div>';
    return;
  }

  list.innerHTML = upcoming.map((s, i) => {
    const label = s.daysUntil === 0 ? '오늘 결제!' : s.daysUntil === 1 ? '내일 결제 D-1 🔔' : `${s.daysUntil}일 후 결제`;
    const isTomorrow = s.daysUntil <= 1;
    const divider = i < upcoming.length - 1 ? '<div class="settings-divider"></div>' : '';
    return `
      <div class="settings-row">
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
          <div class="notif-item-icon">${s.emoji || '💳'}</div>
          <div>
            <div class="settings-label" style="margin:0;color:var(--ink)">${s.name}</div>
            <div style="font-size:12.5px;font-weight:600;color:${isTomorrow ? 'var(--danger)' : 'var(--ink-3)'};margin-top:2px">${label}</div>
          </div>
        </div>
        <div style="font-size:14px;font-weight:800;color:var(--ink);white-space:nowrap">${fmt(s.amount)}</div>
      </div>${divider}`;
  }).join('');
}

let _notifPanelOpen = false;
function toggleNotifPanel() {
  _notifPanelOpen ? closeNotifPanel() : openNotifPanel();
}

function openNotifPanel() {
  renderNotifPanel();
  updateNotifEnableBtn();
  updateNotifPermUI();
  // 오늘 확인했으니 빨간 배지 숨김
  localStorage.setItem('notif_badge_seen', new Date().toISOString().slice(0, 10));
  renderNotifBadge();
  document.getElementById('notif-overlay').classList.remove('hidden');
  _notifPanelOpen = true;
}

function closeNotifPanel() {
  document.getElementById('notif-overlay').classList.add('hidden');
  _notifPanelOpen = false;
}

function closeNotifOutside(event) {
  if (event.target === document.getElementById('notif-overlay')) closeNotifPanel();
}

async function requestNotifPermission() {
  if (!('Notification' in window)) { alert('이 브라우저는 알림을 지원하지 않아요'); return; }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    registerSW();
    checkAndSendNotifications();
  }
  updateNotifEnableBtn();
}

function checkAndSendNotifications() {
  const d = getData();
  if (d.notif === false) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const notifiedKey = `notified_${todayStr}`;
  const alreadyNotified = new Set(JSON.parse(localStorage.getItem(notifiedKey) || '[]'));

  const dueTomorrow = d.subscriptions.filter(s => s.billingDate && s.billingDate.day === tomorrowDay);

  dueTomorrow.forEach(sub => {
    if (alreadyNotified.has(sub.id)) return;
    alreadyNotified.add(sub.id);
    const amt = sub.amount.toLocaleString('ko-KR');
    const messages = [
      `내일 "${sub.name}" ${amt}원이 빠져나가요 💳 잔액 미리 확인해두세요!`,
      `📅 ${sub.name} 결제 D-1! ${amt}원 준비됐나요?`,
      `💸 내일 ${sub.name} ${amt}원 자동결제 예정이에요. 생활비 잔액 체크!`,
    ];
    const body = messages[Math.floor(Math.random() * messages.length)];

    if (_swReg) {
      _swReg.showNotification('구독 결제 하루 전 알림 🔔', {
        body, tag: `sub-${sub.id}-${tomorrowDay}`, renotify: false,
      });
    } else {
      new Notification('구독 결제 하루 전 알림 🔔', { body });
    }
  });

  if (dueTomorrow.length > 0) {
    localStorage.setItem(notifiedKey, JSON.stringify([...alreadyNotified]));
    // 알림 보냈으니 seen 초기화 → 배지 다시 표시
    localStorage.removeItem('notif_badge_seen');
    renderNotifBadge();
  }
}

// ─── 소셜 로그인 ───
const SOCIAL_INFO = {
  kakao: { label: '카카오', chip: 'kakao', color: '#FEE500', ink: '#191919' },
  google: { label: 'Google', chip: 'google', color: '#fff', ink: '#191919' },
  naver:  { label: '네이버', chip: 'naver',  color: '#03C75A', ink: '#fff' },
  email:  { label: '이메일', chip: 'email',  color: '#F0F0F0', ink: '#333' },
};

function openSocialLogin() {
  const status = document.getElementById('social-status');
  status.classList.add('hidden');
  document.getElementById('social-overlay').classList.remove('hidden');
}
function closeSocialLogin() {
  document.getElementById('social-overlay').classList.add('hidden');
}
function closeSocialOutside(e) {
  if (e.target === document.getElementById('social-overlay')) closeSocialLogin();
}

function connectSocial(provider) {
  const info = SOCIAL_INFO[provider];
  const status = document.getElementById('social-status');
  const icon   = document.getElementById('social-status-icon');
  const text   = document.getElementById('social-status-text');

  // 로딩 상태
  status.classList.remove('hidden');
  icon.innerHTML = '<div class="social-spinner"></div>';
  text.textContent = `${info.label} 계정에 연결하는 중...`;
  status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // 실제 배포 시 OAuth 연동 예정 — 지금은 1.5초 후 완료 상태 연출
  setTimeout(() => {
    icon.innerHTML = '✅';
    text.textContent = `${info.label} 계정 연동이 준비됐어요!\n실제 로그인은 앱 배포 후 사용 가능해요.`;
    text.style.whiteSpace = 'pre-line';

    // 연동됨 칩 추가
    const d = getData();
    if (!d.linkedAccounts) d.linkedAccounts = [];
    if (!d.linkedAccounts.includes(provider)) d.linkedAccounts.push(provider);
    save(d);
    renderLinkedChips();

    setTimeout(closeSocialLogin, 1800);
  }, 1500);
}

function renderLinkedChips() {
  const wrap = document.getElementById('linked-chips');
  if (!wrap) return;
  const d = getData();
  const linked = d.linkedAccounts || [];
  if (!linked.length) {
    wrap.innerHTML = '<span class="settings-account-chip add-chip">+ 연동하기</span>';
    return;
  }
  const labels = { kakao:'카카오', google:'Google', naver:'네이버', email:'이메일' };
  wrap.innerHTML = linked.map(p =>
    `<span class="settings-account-chip ${p === 'google' ? 'google' : p === 'naver' ? '' : p} linked" style="${p === 'naver' ? 'background:#03C75A;color:#fff' : ''}">${labels[p]}</span>`
  ).join('');
}

// ─── 설정 ───
function openSettings() {
  const d = getData();
  document.getElementById('settings-name').value = d.name;
  document.getElementById('settings-budget').value = d.budget;
  const btn = document.getElementById('settings-payday-btn');
  if (d.payday) {
    btn.textContent = `${d.payday}일`;
    btn.dataset.payday = d.payday;
    btn.classList.add('selected');
  }
  // restore accent active dot
  const savedColor = d.accentColor || '#FF6B35';
  document.querySelectorAll('.settings-color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.color === savedColor);
  });
  // restore mode buttons
  const isDark = d.darkMode || false;
  document.getElementById('mode-light').classList.toggle('active', !isDark);
  document.getElementById('mode-dark').classList.toggle('active', isDark);
  renderLinkedChips();
  document.getElementById('settings-overlay').classList.remove('hidden');
}
function closeSettings() {
  document.getElementById('settings-overlay').classList.add('hidden');
}
function closeSettingsOutside(event) {
  if (event.target === document.getElementById('settings-overlay')) closeSettings();
}
function saveSettings() {
  const d = getData();
  d.name = document.getElementById('settings-name').value.trim() || d.name;
  d.budget = parseInt(document.getElementById('settings-budget').value) || d.budget;
  d.payday = parseInt(document.getElementById('settings-payday-btn').dataset.payday) || d.payday;
  save(d);
  closeSettings();
  renderAll();
}
function setAccentColor(accent, _light, soft, ink) {
  const root = document.documentElement;
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-soft', soft);
  root.style.setProperty('--accent-ink', ink);
  document.querySelectorAll('.settings-color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.color === accent);
  });
  const d = getData();
  d.accentColor = accent;
  d.accentSoft = soft;
  d.accentInk = ink;
  save(d);
}
function setDarkMode(isDark) {
  document.body.classList.toggle('dark', isDark);
  document.getElementById('mode-light').classList.toggle('active', !isDark);
  document.getElementById('mode-dark').classList.toggle('active', isDark);
  const d = getData();
  d.darkMode = isDark;
  save(d);
}
function toggleNotif() {
  const d = getData();
  d.notif = !(d.notif !== false);
  save(d);
  updateNotifEnableBtn();
}
function deleteAccount() {
  if (confirm('회원 탈퇴 시 모든 데이터가 삭제됩니다.\n정말 탈퇴하시겠어요?')) {
    localStorage.removeItem('suwon_planner');
    location.reload();
  }
}
function resetAll() {
  if (confirm('정말 모든 데이터를 초기화할까요?')) {
    localStorage.removeItem('suwon_planner');
    location.reload();
  }
}
function applyStoredTheme() {
  const d = getData();
  if (d.accentColor) {
    const root = document.documentElement;
    root.style.setProperty('--accent', d.accentColor);
    if (d.accentSoft) root.style.setProperty('--accent-soft', d.accentSoft);
    if (d.accentInk) root.style.setProperty('--accent-ink', d.accentInk);
  }
  if (d.darkMode) document.body.classList.add('dark');
}


// ─── 탭 전환 ───
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
  menuAllowedAfter = Date.now() + 400;
  renderAll();
  window.scrollTo(0, 0);
}

// ─── 유틸 ───
function fmt(n) { return (n||0).toLocaleString('ko-KR') + '원'; }
function toDateStr(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function getDaysLeft(today, payday) {
  const y = today.getFullYear(), m = today.getMonth();
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const nextPayday = today.getDate() < payday
    ? new Date(y, m, payday)
    : new Date(y, m+1, payday);
  const diff = Math.ceil((nextPayday - today) / (1000*60*60*24));
  return Math.max(1, diff);
}

function getWeeklyByCategory(expenses, cat) {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  return expenses
    .filter(e => e.cat === cat && new Date(e.date) >= weekAgo)
    .reduce((s, e) => s + e.amount, 0);
}
