// GET /api/books - 목록 조회
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM books ORDER BY created_at DESC'
    ).all();
    return Response.json(results);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/books - 책 등록
export async function onRequestPost({ request, env }) {
  try {
    const { title, author, subject, department, price, condition, description, contact } = await request.json();

    if (!title || !price || !condition || !contact) {
      return Response.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO books (id, title, author, subject, department, price, condition, description, contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, title, author || null, subject || null, department || null, price, condition, description || null, contact).run();

    return Response.json({ success: true, id }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
