let allBooks = [];
let currentBookId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
});

// 책 목록 불러오기
async function loadBooks() {
  const grid = document.getElementById('bookGrid');
  grid.innerHTML = '<div class="loading">책 목록을 불러오는 중...</div>';

  try {
    const res = await fetch('/api/books');
    allBooks = await res.json();
    renderBooks(allBooks);
  } catch (e) {
    grid.innerHTML = '<div class="loading">불러오기 실패 😢</div>';
    console.error(e);
  }
}

// 책 카드 렌더링
function renderBooks(books) {
  const grid = document.getElementById('bookGrid');
  const emptyMsg = document.getElementById('emptyMsg');
  const countEl = document.getElementById('bookCount');

  const available = books.filter(b => !b.is_sold);
  countEl.textContent = `총 ${books.length}권 (판매중 ${available.length}권)`;

  if (books.length === 0) {
    grid.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';
  grid.innerHTML = books.map(book => `
    <div class="book-card ${book.is_sold ? 'sold' : ''}" onclick="openDetail('${book.id}')">
      ${book.is_sold ? '<span class="sold-badge">판매완료</span>' : ''}
      <div class="card-title">${escapeHtml(book.title)}</div>
      <div class="card-author">${escapeHtml(book.author || '저자 미상')}</div>
      <div class="card-tags">
        ${book.department ? `<span class="tag tag-dept">${escapeHtml(book.department)}</span>` : ''}
        ${book.subject ? `<span class="tag tag-subject">${escapeHtml(book.subject)}</span>` : ''}
      </div>
      <div class="card-bottom">
        <span class="card-price">${Number(book.price).toLocaleString()}원</span>
        <span class="badge-condition condition-${book.condition}">${book.condition}</span>
      </div>
    </div>
  `).join('');
}

// 검색 + 필터
function filterBooks() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const dept = document.getElementById('filterDept').value;
  const condition = document.getElementById('filterCondition').value;
  const priceRange = document.getElementById('filterPrice').value;

  let filtered = allBooks.filter(book => {
    const matchQuery = !query ||
      book.title.toLowerCase().includes(query) ||
      (book.subject && book.subject.toLowerCase().includes(query)) ||
      (book.author && book.author.toLowerCase().includes(query));

    const matchDept = !dept || book.department === dept;
    const matchCondition = !condition || book.condition === condition;

    let matchPrice = true;
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      matchPrice = book.price >= min && book.price <= max;
    }

    return matchQuery && matchDept && matchCondition && matchPrice;
  });

  renderBooks(filtered);
}

// 등록 모달
function openRegisterModal() {
  document.getElementById('registerModal').style.display = 'flex';
  document.getElementById('registerForm').reset();
}

function closeRegisterModal() {
  document.getElementById('registerModal').style.display = 'none';
}

// 책 등록 제출
async function submitBook(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.textContent = '등록 중...';
  btn.disabled = true;

  const book = {
    title: document.getElementById('f-title').value.trim(),
    author: document.getElementById('f-author').value.trim() || null,
    subject: document.getElementById('f-subject').value.trim() || null,
    department: document.getElementById('f-dept').value || null,
    price: parseInt(document.getElementById('f-price').value),
    condition: document.getElementById('f-condition').value,
    description: document.getElementById('f-desc').value.trim() || null,
    contact: document.getElementById('f-contact').value.trim(),
  };

  try {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });

    if (!res.ok) throw new Error('등록 실패');
    closeRegisterModal();
    await loadBooks();
    alert('책이 등록되었습니다! 📚');
  } catch (e) {
    alert('등록에 실패했습니다. 다시 시도해주세요.');
    console.error(e);
  }

  btn.textContent = '등록하기';
  btn.disabled = false;
}

// 상세 모달
function openDetail(id) {
  const book = allBooks.find(b => b.id === id);
  if (!book) return;

  currentBookId = id;
  document.getElementById('d-title').textContent = book.title;
  document.getElementById('d-condition').textContent = book.condition;
  document.getElementById('d-condition').className = `badge-condition condition-${book.condition}`;
  document.getElementById('d-price').textContent = `${Number(book.price).toLocaleString()}원`;
  document.getElementById('d-author').textContent = book.author || '-';
  document.getElementById('d-subject').textContent = book.subject || '-';
  document.getElementById('d-dept').textContent = book.department || '-';
  document.getElementById('d-desc').textContent = book.description || '설명 없음';
  document.getElementById('d-contact').textContent = book.contact;

  const soldBtn = document.getElementById('d-soldBtn');
  soldBtn.style.display = book.is_sold ? 'none' : 'inline-block';

  document.getElementById('detailModal').style.display = 'flex';
}

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
  currentBookId = null;
}

// 판매완료 처리
async function markSold() {
  if (!currentBookId) return;
  if (!confirm('판매완료로 처리하시겠습니까?')) return;

  try {
    const res = await fetch(`/api/books/${currentBookId}`, { method: 'PATCH' });
    if (!res.ok) throw new Error('처리 실패');
    closeDetailModal();
    await loadBooks();
  } catch (e) {
    alert('처리에 실패했습니다.');
    console.error(e);
  }
}

// 모달 외부 클릭 시 닫기
document.getElementById('registerModal').addEventListener('click', function(e) {
  if (e.target === this) closeRegisterModal();
});
document.getElementById('detailModal').addEventListener('click', function(e) {
  if (e.target === this) closeDetailModal();
});

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
