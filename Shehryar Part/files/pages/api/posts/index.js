const repo = require('../../../lib/repository');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { type, userId } = req.query;
      const posts = await repo.getPosts({ type });
      const postIds = posts.map(p => p.id);
      const likedSet = userId ? await repo.getUserPostLikes(userId, postIds) : new Set();

      const data = posts.map(p => ({
        id:              p.id,
        type:            p.type,
        title:           p.title,
        content:         p.content,
        game:            p.game,
        hasAchievement:  p.hasAchievement,
        achievementName: p.achievementName,
        createdAt:       p.createdAt,
        author:          p.author,
        likes:           p._count.likes,
        commentCount:    p._count.comments,
        liked:           likedSet.has(p.id),
      }));

      return res.status(200).json(data);
    } catch (err) {
      console.error('GET /api/posts error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { authorId, type, title, content, game, hasAchievement, achievementName } = req.body;
      if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }
      const post = await repo.createPost({ authorId, type, title, content, game, hasAchievement, achievementName });
      return res.status(201).json(post);
    } catch (err) {
      console.error('POST /api/posts error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end();
}