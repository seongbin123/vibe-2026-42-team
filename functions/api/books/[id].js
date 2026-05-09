// PATCH /api/books/:id - 판매완료 처리
export async function onRequestPatch({ params, env }) {
  try {
    const { meta } = await env.DB.prepare(
      'UPDATE books SET is_sold = 1 WHERE id = ?'
    ).bind(params.id).run();

    if (meta.changes === 0) {
      return Response.json({ error: '책을 찾을 수 없습니다.' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
