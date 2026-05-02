const pool    = require('../db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');  // ✅ NEW — for refresh token generation

// ─────────────────────────────────────────────
// ✅ NEW — Helper: generate + store refresh token
// ─────────────────────────────────────────────
const generateRefreshToken = async (userId, client) => {
  const token     = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await client.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
  return token;
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    const { username, password, role, display_name } = req.body;

    if (!username || !password || !role || !display_name) {
        return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const client = await pool.connect();
    try {
        const userExists = await client.query(
          'SELECT * FROM users WHERE username = $1', [username]
        );
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists.' });
        }

        const salt           = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertQuery = `
            INSERT INTO users (username, password, role, display_name) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, username, role, display_name;
        `;
        const newUserResult = await client.query(insertQuery, [username, hashedPassword, role, display_name]);
        const newUser = newUserResult.rows[0];

        // WebSocket events (your existing code)
        const io = req.app.get('socketio');
        if (io) {
        io.emit('new_registration', { userId: newUser.id });
        } else {
        console.warn('[Socket.IO] io instance not found on app — skipping emit');
        }

        // Short-lived access token — 15 min (was 1h)
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role, display_name: newUser.display_name },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }  // ✅ CHANGED from '1h' to '15m'
        );

        // ✅ NEW — generate and return refresh token
        const refreshToken = await generateRefreshToken(newUser.id, client);

        res.status(201).json({
            token,
            refreshToken,  // ✅ NEW
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                display_name: newUser.display_name
            }
        });

    } catch (error) {
        console.error("Error during registration:", error);
        next(error);
    } finally {
        client.release();
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Please provide username and password.' });
    }

    const client = await pool.connect();
    try {
        const result = await client.query(
          'SELECT * FROM users WHERE username = $1', [username]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user    = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Short-lived access token — 15 min (was 1h)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, display_name: user.display_name },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }  // ✅ CHANGED from '1h' to '15m'
        );

        // ✅ NEW — generate and return refresh token
        const refreshToken = await generateRefreshToken(user.id, client);

        res.json({
            token,
            refreshToken,  // ✅ NEW
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                display_name: user.display_name
            }
        });

    } catch (error) {
        console.error("Error during login:", error);
        next(error);
    } finally {
        client.release();
    }
};

// ─────────────────────────────────────────────
// ✅ NEW — Rotate refresh token endpoint
// ─────────────────────────────────────────────
const rotateRefreshToken = async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return res.status(401).json({ error: 'Refresh token required.' });

    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM refresh_tokens
             WHERE token = $1 AND expires_at > NOW() AND revoked = false`,
            [refreshToken]
        );
        if (result.rows.length === 0)
            return res.status(403).json({ error: 'Invalid or expired refresh token.' });

        const { user_id } = result.rows[0];

        // Revoke old token immediately
        await client.query(
            'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
            [refreshToken]
        );

        // Fetch user details for new token payload
        const userResult = await client.query(
            'SELECT id, username, role, display_name FROM users WHERE id = $1',
            [user_id]
        );
        const user = userResult.rows[0];

        // Issue new access token
        const newToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role, display_name: user.display_name },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Issue new refresh token
        const newRefreshToken = await generateRefreshToken(user_id, client);

        res.json({ token: newToken, refreshToken: newRefreshToken });

    } catch (error) {
        console.error("Error during token rotation:", error);
        next(error);
    } finally {
        client.release();
    }
};

// ─────────────────────────────────────────────
// ✅ NEW — Logout: revoke refresh token
// ─────────────────────────────────────────────
const logout = async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return res.status(400).json({ error: 'Refresh token required.' });

    const client = await pool.connect();
    try {
        await client.query(
            'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
            [refreshToken]
        );
        res.json({ message: 'Logged out successfully.' });
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    register,
    login,
    logout,              // ✅ NEW
    rotateRefreshToken,  // ✅ NEW
};