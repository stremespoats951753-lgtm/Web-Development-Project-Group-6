// pages/api/posts/[id].js
// GET    /api/posts/:id
// DELETE /api/posts/:id

const repo = require('../../../lib/repository');

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const post = await repo.getPostById(id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    // Shape comments
    const shaped = {
      id:              post.id,
      type:            post.type,
      title:           post.title,
      content:         post.content,
      game:            post.game,
      hasAchievement:  post.hasAchievement,
      achievementName: post.achievementName,
      createdAt:       post.createdAt,
      author:          post.author,
      likes:           post._count.likes,
      comments: post.comments.map(c => ({
        id:        c.id,
        text:      c.text,
        createdAt: c.createdAt,
        author:    c.author,
        likes:     c._count.likes,
      })),
    };
    return res.status(200).json(shaped);
  }

  if (req.method === 'DELETE') {
    await repo.deletePost(id);
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).end();
}
