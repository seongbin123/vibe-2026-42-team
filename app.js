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

const FRIEND_COSTS = {
  cafe:  { min: 5000,  max: 10000,  label: '카페' },
  meal:  { min: 10000, max: 18000,  label: '밥' },
  drink: { min: 15000, max: 35000,  label: '술' },
  movie: { min: 14000, max: 18000,  label: '영화' },
  pc:    { min: 4000,  max: 10000,  label: 'PC방' }
};

const SURVIVAL_DIETS = [
  { name: '수원대 학식 3끼', cost: 18000, tip: '가장 저렴한 생존법' },
  { name: '학식 2끼 + 편의점 1끼', cost: 16500, tip: '균형 잡힌 생존' },
  { name: '편의점 도시락 3끼', cost: 13500, tip: '학식보다 저렴할 수도' },
  { name: '학식 2끼 + 집밥 1끼', cost: 14000, tip: '자취생 최강 전략' },
];

let selectedCat = '식비';
let selectedFriendType = 'cafe';
let friendPeople = 2;

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

  // 카페 주간 경고
  const weekCafe = getWeeklyByCategory(d.expenses, '카페');
  if (weekCafe >= 25000) {
    warnings.push({ type: 'red', msg: `☕ 이번 주 카페 지출이 ${fmt(weekCafe)}이에요! 커피 좀 줄여봐요 ☠️` });
  } else if (weekCafe >= 15000) {
    warnings.push({ type: 'yellow', msg: `☕ 이번 주 카페 지출 ${fmt(weekCafe)}. 슬슬 조심할 때에요` });
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
function renderAnalysis() {
  const d = getData();
  const weekCafe = getWeeklyByCategory(d.expenses, '카페');
  const cafeLimit = 20000;
  const cafePct = Math.min(100, (weekCafe / cafeLimit) * 100);

  document.getElementById('coffee-weekly').textContent = fmt(weekCafe);
  document.getElementById('coffee-bar').style.width = cafePct + '%';
  const coffeeComment = weekCafe === 0 ? '이번 주 카페 지출 없음 👏' :
    weekCafe < 10000 ? '절약 중이에요! 훌륭해요 ✨' :
    weekCafe < 20000 ? '적당한 편이에요' :
    weekCafe < 30000 ? '⚠️ 카페비가 많아요. 텀블러 챙겨봐요!' :
    '🚨 카페비가 너무 많아요! 학교 정수기를 애용하세요';
  document.getElementById('coffee-comment').textContent = coffeeComment;

  renderSubscriptions();
  renderCategoryChart(d.expenses);

  // 월 페이스
  const today = new Date();
  const dayOfMonth = today.getDate();
  const totalSpent = d.expenses.reduce((s, e) => s + e.amount, 0);
  const dailyAvg = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
  const projectedTotal = Math.round(dailyAvg * daysInMonth);
  document.getElementById('monthly-pace').textContent = `예상 월 지출: ${fmt(projectedTotal)}`;
  const diff = projectedTotal - d.budget;
  document.getElementById('pace-comment').textContent = diff > 0
    ? `⚠️ 이 페이스면 ${fmt(diff)} 초과해요`
    : `✅ 이 페이스면 ${fmt(Math.abs(diff))} 남아요`;
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

  updateFriendCalc();
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

// ─── 친구 약속 ───
function selectFriend(btn) {
  document.querySelectorAll('.friend-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedFriendType = btn.dataset.type;
  updateFriendCalc();
}
function changePeople(delta) {
  friendPeople = Math.max(1, Math.min(10, friendPeople + delta));
  document.getElementById('people-count').textContent = friendPeople;
  updateFriendCalc();
}
function updateFriendCalc() {
  const c = FRIEND_COSTS[selectedFriendType];
  const minTotal = c.min * friendPeople;
  const maxTotal = c.max * friendPeople;
  document.getElementById('friend-cost').textContent = `${fmt(minTotal)} ~ ${fmt(maxTotal)}`;
  const d = getData();
  const totalSpent = d.expenses.reduce((s,e)=>s+e.amount,0);
  const remaining = d.budget - totalSpent;
  const comment = remaining < minTotal
    ? `⚠️ 현재 잔액(${fmt(remaining)})으로 부족할 수 있어요`
    : `✅ 잔액 ${fmt(remaining)} — 충분해요!`;
  document.getElementById('friend-comment').textContent = comment;
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
