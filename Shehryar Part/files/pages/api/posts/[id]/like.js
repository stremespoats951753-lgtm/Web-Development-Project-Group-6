// pages/api/posts/[id]/like.js
// POST /api/posts/:id/like   body: { userId }

const repo = require('../../../../lib/repository');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { id } = req.query;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId required.' });

  const result = await repo.togglePostLike(id, userId);
  return res.status(200).json(result);
}
