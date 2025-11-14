const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        const userExists = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertQuery = `
            INSERT INTO users (username, password, role, display_name) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, username, role, display_name;
        `;
        const newUserResult = await client.query(insertQuery, [username, hashedPassword, role, display_name]);
        const newUser = newUserResult.rows[0];

        // --- ✅ EMIT WEBSOCKET EVENT FOR USER UPDATE ---
        const io = req.app.get('socketio');
        io.emit('user_update');
        io.emit('stats_update');
        console.log("🚀 [authController] Emitted 'user_update' and 'stats_update' via WebSocket.");
        
        // Create token that lasts for 1 hour
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role, display_name: newUser.display_name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            token,
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
// matching with existing user
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Create token that lasts for 1 hour
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, display_name: user.display_name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
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


module.exports = {
    register,
    login,
};

