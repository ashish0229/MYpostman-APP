const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');

// Called by authController on login
const generateRefreshToken = async (userId) => {
  const token     = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
  return token;
};

// Called by route POST /refresh-token
const rotateRefreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ error: 'Refresh token required' });

  try {
    const result = await pool.query(
      `SELECT * FROM refresh_tokens
       WHERE token = $1 AND expires_at > NOW() AND revoked = false`,
      [refreshToken]
    );
    if (result.rows.length === 0)
      return res.status(403).json({ error: 'Invalid or expired refresh token' });

    const { user_id } = result.rows[0];

    // Revoke old token immediately
    await pool.query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
      [refreshToken]
    );

    // Issue new access token
    const accessToken = jwt.sign(
      { userId: user_id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Issue new refresh token
    const newRefreshToken = await generateRefreshToken(user_id);

    res.json({ accessToken, refreshToken: newRefreshToken });

  } catch (err) {
    res.status(500).json({ error: 'Token rotation failed' });
  }
};

module.exports = { generateRefreshToken, rotateRefreshToken };