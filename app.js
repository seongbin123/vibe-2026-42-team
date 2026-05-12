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
  btn.textContent = `📅 ${calMonth + 1}월 ${day}일`;
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
const EMOJIS = { 식비:'🍚', 카페:'☕', 교통:'🚌', 술자리:'🍺', 구독:'📱', 쇼핑:'🛍️', 병원:'🏥', 기타:'💸' };
const CAT_COLORS = { 식비:'#7C6CF4', 카페:'#FFB347', 교통:'#4ADE80', 술자리:'#FF5A5A', 구독:'#00D4FF', 쇼핑:'#FF69B4', 병원:'#FF6EB4', 기타:'#9090A8' };


const SURVIVAL_DIETS = [
  { name: '수원대 학식 3끼', cost: 18000, tip: '가장 저렴한 생존법' },
  { name: '학식 2끼 + 편의점 1끼', cost: 16500, tip: '균형 잡힌 생존' },
  { name: '편의점 도시락 3끼', cost: 13500, tip: '학식보다 저렴할 수도' },
  { name: '학식 2끼 + 집밥 1끼', cost: 14000, tip: '자취생 최강 전략' },
];

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

const REC_MEAL_CATS = new Set(['카페·디저트','베이커리·편의점']);

let selectedCat = '식비';

function load() { return JSON.parse(localStorage.getItem('suwon_planner') || '{}'); }
function save(d) { localStorage.setItem('suwon_planner', JSON.stringify(d)); }

function getData() {
  const d = load();
  return {
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
  initDragInputs();
  const d = getData();
  if (!d.budget) {
    document.getElementById('setup-overlay').style.display = 'flex';
  } else {
    document.getElementById('setup-overlay').style.display = 'none';
    renderAll();
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
}

// ─── 홈 ───
function renderHome() {
  const d = getData();
  const today = new Date();
  const totalSpent = d.expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = d.budget - totalSpent;
  const daysLeft = getDaysLeft(today, d.payday);
  const dailyAllowance = daysLeft > 0 ? Math.floor(remaining / daysLeft) : 0;
  const pct = Math.min(100, Math.round((totalSpent / d.budget) * 100));

  document.getElementById('greeting').textContent = `안녕하세요, ${d.name}님 👋`;
  document.getElementById('remaining-amount').textContent = fmt(remaining);
  document.getElementById('remaining-sub').textContent = '남은 생활비';
  document.getElementById('daily-amount').textContent = fmt(Math.max(0, dailyAllowance));
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('spent-pct').textContent = pct + '% 사용';
  document.getElementById('days-left').textContent = `D-${daysLeft}`;

  const card = document.getElementById('survival-card');
  const label = document.getElementById('survival-label');
  card.className = 'survival-card';
  if (pct >= 90 || remaining < 30000) {
    card.classList.add('danger-mode');
    label.textContent = '🔴 위험 — 월말 생존 모드';
  } else if (pct >= 70 || remaining < 80000) {
    card.classList.add('warning-mode');
    label.textContent = '🟡 주의 — 절약 필요';
  } else {
    card.classList.add('safe-mode');
    label.textContent = '🟢 안전 — 여유 있음';
  }

  // 오늘 카테고리 합계 (전체)
  const todayStr = toDateStr(today);
  const todayExp = d.expenses.filter(e => e.date === todayStr);
  const cats = Object.keys(EMOJIS);
  const todayCats = document.getElementById('today-cats');
  todayCats.innerHTML = cats.map(cat => {
    const sum = todayExp.filter(e => e.cat === cat).reduce((s,e)=>s+e.amount,0);
    return `<div class="cat-stat"><span>${EMOJIS[cat]} ${cat}</span><span>${fmt(sum)}</span></div>`;
  }).join('');

  renderWarnings(d, remaining, daysLeft);
}

function renderWarnings(d, remaining, daysLeft) {
  const zone = document.getElementById('warning-zone');
  zone.innerHTML = '';
  const warnings = [];

  // 이번 주 최다 지출 카테고리 경고
  const now2 = new Date();
  const weekAgo2 = new Date(now2); weekAgo2.setDate(now2.getDate() - 7);
  const wTotals = {};
  d.expenses.filter(e => new Date(e.date) >= weekAgo2).forEach(e => { wTotals[e.cat] = (wTotals[e.cat]||0) + e.amount; });
  const topW = Object.keys(wTotals).sort((a,b) => wTotals[b]-wTotals[a])[0];
  if (topW) {
    const limit2 = CAT_LIMITS[topW] || 30000;
    const amt = wTotals[topW];
    if (amt >= limit2) warnings.push({ type: 'red', msg: `${EMOJIS[topW]||'💸'} 이번 주 ${topW} 지출이 ${fmt(amt)}이에요! 너무 많아요 ☠️` });
    else if (amt >= limit2 * 0.7) warnings.push({ type: 'yellow', msg: `${EMOJIS[topW]||'💸'} 이번 주 ${topW} 지출 ${fmt(amt)}. 슬슬 조심할 때에요` });
  }

  // 구독료 경고
  const totalSub = d.subscriptions.reduce((s, sub) => s + sub.amount, 0);
  if (totalSub > 0) {
    warnings.push({ type: 'yellow', msg: `📱 이번 달 구독료 합계: ${fmt(totalSub)}. 필요 없는 거 정리해봐요!` });
  }

  // 잔액 경고
  if (remaining < 50000 && daysLeft > 3) {
    warnings.push({ type: 'red', msg: `🆘 ${daysLeft}일 남았는데 ${fmt(remaining)}밖에 없어요. 생존 탭을 확인하세요!` });
  }

  warnings.forEach(w => {
    const el = document.createElement('div');
    el.className = 'warning-card' + (w.type === 'yellow' ? ' yellow' : '');
    el.textContent = w.msg;
    zone.appendChild(el);
  });
}


function expenseItemHTML(e) {
  return `<div class="expense-item">
    <div class="expense-emoji">${EMOJIS[e.cat]||'💸'}</div>
    <div class="expense-info">
      <div class="expense-cat">${e.cat}</div>
      ${e.note ? `<div class="expense-note">${e.note}</div>` : ''}
    </div>
    <div class="expense-right">
      <div class="expense-amount">-${fmt(e.amount)}</div>
      <div class="expense-date">${e.date}</div>
    </div>
    <div class="expense-menu-wrap">
      <button class="expense-menu-btn"
        ontouchend="event.preventDefault();toggleExpenseMenu(event,'${e.id}')"
        onclick="toggleExpenseMenu(event,'${e.id}')">⋮</button>
      <div class="expense-menu-popup hidden" id="menu-${e.id}">
        <button onclick="editExpense('${e.id}')">✏️ 수정하기</button>
        <button onclick="deleteExpense('${e.id}')">🗑️ 삭제하기</button>
      </div>
    </div>
  </div>`;
}

// ─── 지출 내역 탭 ───
let currentFilter = 'all';
function renderExpenseList() {
  const d = getData();
  const list = document.getElementById('full-expense-list');
  let expenses = [...d.expenses].reverse();
  if (currentFilter !== 'all') expenses = expenses.filter(e => e.cat === currentFilter);
  if (!expenses.length) {
    list.innerHTML = '<div class="empty-state"><div class="emoji">📋</div>내역이 없어요</div>';
    return;
  }
  list.innerHTML = expenses.map(e => expenseItemHTML(e)).join('');
}

function filterExpenses(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderExpenseList();
}

// ─── 분석 탭 ───
const CAT_LIMITS = { 식비:60000, 카페:20000, 교통:20000, 술자리:30000, 구독:30000, 쇼핑:50000, 병원:30000, 기타:20000 };
const CAT_COMMENTS = {
  식비:  [['절약 식단 중! 훌륭해요 ✨','식비 적당해요 👍','⚠️ 식비가 꽤 많아요. 학식 활용해봐요!','🚨 식비가 너무 많아요! 학식 or 편의점 도시락으로!']],
  카페:  [['카페 지출 없음 👏','절약 중이에요! 훌륭해요 ✨','적당한 편이에요','⚠️ 카페비가 많아요. 텀블러 챙겨봐요!','🚨 카페비가 너무 많아요! 학교 정수기를 애용하세요']],
  교통:  [['교통비 지출 없음 👏','교통비 절약 중이에요 ✨','적당한 편이에요','⚠️ 교통비가 많아요. 자전거나 도보 고려해봐요!','🚨 교통비가 많아요! 정기권 활용해보세요']],
  술자리:[['술자리 지출 없음 👏','절제하고 있어요 ✨','적당한 편이에요','⚠️ 술자리 지출이 많아요. 조금 줄여봐요!','🚨 술자리 지출이 너무 많아요!']],
  구독:  [['구독료 지출 없음 👏','구독 관리 잘 하고 있어요 ✨','적당한 편이에요','⚠️ 구독료가 많아요. 안 쓰는 거 정리해봐요!','🚨 구독료가 너무 많아요! 꼭 필요한 것만 남겨요']],
  쇼핑:  [['쇼핑 지출 없음 👏','절약 중이에요 ✨','적당한 편이에요','⚠️ 쇼핑 지출이 많아요. 장바구니 다시 확인해봐요!','🚨 쇼핑을 너무 많이 했어요!']],
  병원:  [['병원 지출 없음 👏','건강 챙기고 있어요 ✨','적당한 편이에요','병원비가 꽤 있어요. 건강 잘 챙겨요!','병원비가 많아요. 건강이 먼저에요 💊']],
  기타:  [['기타 지출 없음 👏','기타 지출 절약 중이에요 ✨','적당한 편이에요','⚠️ 기타 지출이 많아요.','🚨 기타 지출이 너무 많아요!']],
};
function renderAnalysis() {
  const d = getData();

  // 이번 주 카테고리별 합산
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const weekTotals = {};
  d.expenses.filter(e => new Date(e.date) >= weekAgo).forEach(e => {
    weekTotals[e.cat] = (weekTotals[e.cat] || 0) + e.amount;
  });

  // 최다 지출 카테고리 찾기
  const topCat = Object.keys(weekTotals).sort((a, b) => weekTotals[b] - weekTotals[a])[0];
  const topAmount = topCat ? weekTotals[topCat] : 0;
  const limit = topCat ? (CAT_LIMITS[topCat] || 30000) : 30000;
  const pct = Math.min(100, (topAmount / limit) * 100);
  const comments = topCat ? CAT_COMMENTS[topCat][0] : null;
  const comment = !topCat ? '이번 주 지출 내역이 없어요' :
    topAmount < limit * 0.25 ? comments[1] :
    topAmount < limit * 0.5  ? comments[2] :
    topAmount < limit * 0.75 ? comments[3] :
    topAmount < limit        ? comments[3] : comments[4];

  document.getElementById('top-cat-icon').textContent = topCat ? (EMOJIS[topCat] || '📊') : '📊';
  document.getElementById('top-cat-title').textContent = topCat ? `이번 주 ${topCat} 지출` : '이번 주 최다 지출';
  document.getElementById('coffee-weekly').textContent = fmt(topAmount);
  document.getElementById('coffee-bar').style.width = pct + '%';
  document.getElementById('coffee-comment').textContent = comment || '아직 괜찮아요';

  renderSubscriptions();
  renderCategoryChart(d.expenses);

  // 예상 월 지출 (구독 결제일 반영)
  const today = new Date();
  const todayDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
  const remainingDays = daysInMonth - todayDay;

  // 이번 달 실제 지출
  const thisMonthStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
  const thisMonthSpent = d.expenses
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
  rows += `<div class="pace-row"><span>남은 일수 예상 (${remainingDays}일 × 일평균)</span><span>+${fmt(projectedDaily)}</span></div>`;
  if (upcomingSubTotal > 0) {
    rows += `<div class="pace-row"><span>결제 예정 구독 (${upcomingSubs.length}개)</span><span>+${fmt(upcomingSubTotal)}</span></div>`;
  }
  if (paidSubTotal > 0) {
    rows += `<div class="pace-row" style="color:var(--success)"><span>이미 결제된 구독 (${paidSubs.length}개)</span><span>✓ ${fmt(paidSubTotal)}</span></div>`;
  }
  breakdown.innerHTML = rows;

  const diff = projectedTotal - d.budget;
  document.getElementById('pace-comment').textContent = diff > 0
    ? `⚠️ 이 페이스면 ${fmt(diff)} 초과 예상이에요`
    : `✅ 이 페이스면 ${fmt(Math.abs(diff))} 남을 것 같아요`;
}

function renderSubscriptions() {
  const d = getData();
  const list = document.getElementById('subscription-list');
  if (!d.subscriptions.length) {
    list.innerHTML = '<div style="color:var(--text2);font-size:13px;padding:8px 0">등록된 구독이 없어요</div>';
    return;
  }
  list.innerHTML = d.subscriptions.map(sub => `
    <div class="sub-item">
      <div class="sub-info">
        <span style="font-size:20px">${sub.emoji||'📱'}</span>
        <div>
          <div class="sub-name">${sub.name}</div>
          ${sub.billingDate ? `<div class="sub-billing">${sub.billingDate.month}월 ${sub.billingDate.day}일 결제</div>` : ''}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="sub-amount">-${fmt(sub.amount)}/월</span>
        <button class="sub-delete" onclick="deleteSub('${sub.id}')">×</button>
      </div>
    </div>`).join('');
}

function renderCategoryChart(expenses) {
  const totals = {};
  expenses.forEach(e => { totals[e.cat] = (totals[e.cat]||0) + e.amount; });
  const max = Math.max(...Object.values(totals), 1);
  const chart = document.getElementById('category-chart');
  chart.innerHTML = Object.entries(totals)
    .sort((a,b) => b[1]-a[1])
    .map(([cat, amt]) => `
    <div class="chart-row">
      <div class="chart-label">${EMOJIS[cat]||''} ${cat}</div>
      <div class="chart-bar-wrap">
        <div class="chart-bar-fill" style="width:${(amt/max*100).toFixed(1)}%;background:${CAT_COLORS[cat]||'#7C6CF4'}"></div>
      </div>
      <div class="chart-amount">${fmt(amt)}</div>
    </div>`).join('') || '<div style="color:var(--text2);font-size:13px;padding:8px 0">지출 데이터가 없어요</div>';
}

// ─── 학식 메뉴 ───
let hakshikData = null;
let selectedMenuDay = null;
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
  const menu = hakshikData.student?.menu?.[day] || [];
  const isToday = day === todayDay;
  if (!menu.length) {
    content.innerHTML = '<div class="menu-weekend">이날은 학식 운영이 없어요 🏠</div>';
    return;
  }
  content.innerHTML = `
    <div class="menu-card${isToday ? ' today-menu' : ''}">
      ${isToday ? '<div class="menu-today-badge">오늘의 학식</div>' : ''}
      <div class="menu-corner">${hakshikData.student?.corner || 'Little Kitchen'} · ${(hakshikData.student?.price || 6000).toLocaleString()}원</div>
      <div class="menu-items">
        ${menu.map((item, i) => `<div class="menu-item${i === 0 ? ' main-item' : ''}">${i === 0 ? '🍱 ' : '· '}${item}</div>`).join('')}
      </div>
    </div>`;
}

// ─── 생존 탭 ───
function renderSurvival() {
  const d = getData();
  const totalSpent = d.expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = d.budget - totalSpent;
  const daysLeft = getDaysLeft(new Date(), d.payday);
  const dailyAllowance = daysLeft > 0 ? Math.floor(remaining / daysLeft) : 0;

  // 학식 vs 외식
  const hakshikCard = document.getElementById('meal-hakshik');
  const outsideCard = document.getElementById('meal-outside');
  const tip = document.getElementById('meal-tip');

  if (dailyAllowance < 8000) {
    hakshikCard.classList.add('recommended');
    outsideCard.classList.remove('recommended');
    document.getElementById('hakshik-tag').className = 'meal-tag';
    document.getElementById('hakshik-tag').textContent = '✅ 추천';
    document.getElementById('outside-tag').className = 'meal-tag danger';
    document.getElementById('outside-tag').textContent = '❌ 위험';
    tip.textContent = `⚡ 하루 예산 ${fmt(dailyAllowance)} — 학식만 먹어야 살아남아요!`;
  } else if (dailyAllowance < 15000) {
    hakshikCard.classList.add('recommended');
    outsideCard.classList.remove('recommended');
    document.getElementById('hakshik-tag').textContent = '✅ 추천';
    document.getElementById('outside-tag').className = 'meal-tag warning';
    document.getElementById('outside-tag').textContent = '⚠️ 가끔만';
    tip.textContent = `💡 하루 예산 ${fmt(dailyAllowance)} — 학식 위주로, 외식은 가끔만!`;
  } else {
    hakshikCard.classList.remove('recommended');
    outsideCard.classList.remove('recommended');
    document.getElementById('hakshik-tag').textContent = '추천';
    document.getElementById('outside-tag').className = 'meal-tag';
    document.getElementById('outside-tag').textContent = '가능';
    tip.textContent = `😊 하루 예산 ${fmt(dailyAllowance)} — 여유 있어요. 가끔 외식도 OK!`;
  }

  // 생존 식단
  const diet = document.getElementById('survival-diet');
  diet.innerHTML = SURVIVAL_DIETS.map(item => `
    <div class="diet-item">
      <div>
        <div style="font-weight:600">${item.name}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:3px">${item.tip}</div>
      </div>
      <div class="diet-cost">하루 ${fmt(item.cost)}</div>
    </div>`).join('');

  loadHakshikMenu();
}

// ─── 지출 모달 ───
function openExpenseModal() {
  document.getElementById('expense-overlay').classList.remove('hidden');
  document.getElementById('expense-amount').value = '';
  document.getElementById('expense-note').value = '';
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
  if (showRecent) renderRecentAmounts(selectedCat);
}
function addExpense() {
  const amount = parseInt(document.getElementById('expense-amount').value);
  if (!amount || amount <= 0) { alert('금액을 입력해주세요'); return; }
  const note = document.getElementById('expense-note').value.trim();
  const d = getData();
  if (editingExpenseId) {
    const idx = d.expenses.findIndex(e => e.id === editingExpenseId);
    if (idx !== -1) {
      d.expenses[idx] = { ...d.expenses[idx], cat: selectedCat, amount, note };
    }
    editingExpenseId = null;
  } else {
    d.expenses.push({ id: Date.now().toString(), cat: selectedCat, amount, note, date: toDateStr(new Date()) });
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
  const popup = document.getElementById('menu-' + id);
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
  document.getElementById('expense-note').value = e.note || '';
  selectedCat = e.cat;
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === e.cat);
  });
  document.getElementById('modal-title').textContent = '지출 수정';
  editingExpenseId = id;
}
let editingExpenseId = null;
function deleteExpense(id) {
  const d = getData();
  d.expenses = d.expenses.filter(e => e.id !== id);
  save(d);
  renderAll();
}

// ─── 구독 모달 ───
function openSubModal() {
  const btn = document.getElementById('sub-date-btn');
  btn.textContent = '📅 결제일 선택';
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

let subEmoji = '📱';

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
  save(d);
  closeAddBudgetModal();
  renderAll();
}

// ─── 설정 ───
function openSettings() {
  const d = getData();
  document.getElementById('settings-name').value = d.name;
  document.getElementById('settings-budget').value = d.budget;
  const btn = document.getElementById('settings-payday-btn');
  if (d.payday) {
    btn.textContent = `📅 ${d.payday}일`;
    btn.dataset.payday = d.payday;
    btn.classList.add('selected');
  }
  document.getElementById('settings-overlay').classList.remove('hidden');
}
function closeSettings() {
  document.getElementById('settings-overlay').classList.add('hidden');
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
function resetAll() {
  if (confirm('정말 모든 데이터를 초기화할까요?')) {
    localStorage.removeItem('suwon_planner');
    location.reload();
  }
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
