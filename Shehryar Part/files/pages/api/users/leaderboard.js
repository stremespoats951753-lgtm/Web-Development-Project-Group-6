// pages/api/users/leaderboard.js
// GET /api/users/leaderboard?limit=10

const repo = require('../../../lib/repository');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }
  const limit = parseInt(req.query.limit || '10', 10);
  const users = await repo.getLeaderboard(limit);
  return res.status(200).json(users);
}
