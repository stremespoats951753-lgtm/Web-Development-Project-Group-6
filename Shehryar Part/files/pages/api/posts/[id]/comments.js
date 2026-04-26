// pages/api/posts/[id]/comments.js
// GET  /api/posts/:id/comments
// POST /api/posts/:id/comments   body: { authorId, text }

const repo = require('../../../../lib/repository');

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const comments = await repo.getCommentsByPost(id);
    const data = comments.map(c => ({
      id:        c.id,
      text:      c.text,
      createdAt: c.createdAt,
      author:    c.author,
      likes:     c._count.likes,
    }));
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { authorId, text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text required.' });
    if (!authorId)      return res.status(400).json({ error: 'authorId required.' });

    const comment = await repo.createComment({ postId: id, authorId, text });
    return res.status(201).json({
      id:        comment.id,
      text:      comment.text,
      createdAt: comment.createdAt,
      author:    comment.author,
      likes:     comment._count.likes,
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end();
}
