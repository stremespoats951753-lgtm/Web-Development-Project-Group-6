// pages/api/users/me.js
// GET /api/users/me  – returns the "logged in" user (always DrMucahid for this demo)

const repo = require('../../../lib/repository');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }
  const user = await repo.getCurrentUser();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  return res.status(200).json(user);
}
