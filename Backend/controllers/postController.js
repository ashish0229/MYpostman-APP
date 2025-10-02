const pool = require('../db');
const { analyzeContent } = require('../services/moderationService');
const { fetchImage } = require('../services/imageService');

// Helper to get the socket.io instance from the request object
const getIo = (req) => req.app.get('socketio');

/**
 * Creates a new post, moderates it, and saves it to the database.
 */
exports.createPost = async (req, res, next) => {
    const { topic, tone, platform } = req.body;
    if (!topic || !tone || !platform) {
        return res.status(400).json({ error: 'Missing required fields: topic, tone, or platform.' });
    }

    const client = await pool.connect();
    try {
        const prompt = `Generate a social media post for ${platform}. The topic is "${topic}". The tone of voice should be ${tone}. Include relevant hashtags.`;
        const moderationResult = await analyzeContent(prompt);

        let imageUrl = null;
        if (moderationResult.classification === 'approved') {
            imageUrl = await fetchImage(topic);
        }
        
        await client.query('BEGIN');

        const postInsertQuery = `
            INSERT INTO posts (topic, tone, platform, content, image_url, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const postValues = [topic, tone, platform, moderationResult.generatedText, imageUrl, moderationResult.classification];
        const postResult = await client.query(postInsertQuery, postValues);
        const newPost = postResult.rows[0];

        const logInsertQuery = `
            INSERT INTO moderation_logs (post_id, action, reason)
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const logResult = await client.query(logInsertQuery, [newPost.id, moderationResult.classification, moderationResult.reason]);
        
        await client.query('COMMIT');

        // Emit WebSocket events to update all clients in real-time
        const io = getIo(req);
        io.emit('new_log', logResult.rows[0]);
        io.emit('stats_update'); 

        res.status(201).json(newPost);
    } catch (error) {
        await client.query('ROLLBACK');
        next(error); // Pass error to the global handler
    } finally {
        client.release();
    }
};

/**
 * Fetches the entire history of all posts.
 */
exports.getPostHistory = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Publishes a post that has already been approved.
 */
exports.publishPost = async (req, res, next) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const statusCheck = await client.query('SELECT status FROM posts WHERE id = $1', [id]);
        if (statusCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found.' });
        }
        if (statusCheck.rows[0].status !== 'approved') {
            return res.status(400).json({ error: `Cannot publish post with status '${statusCheck.rows[0].status}'.` });
        }
        
        await client.query('BEGIN');
        const updateResult = await client.query("UPDATE posts SET status = 'published' WHERE id = $1 RETURNING *", [id]);
        const logResult = await client.query( `INSERT INTO moderation_logs (post_id, action, reason) VALUES ($1, $2, $3) RETURNING *;`, [id, 'published', 'Post published by user.']);
        await client.query('COMMIT');

        const io = getIo(req);
        io.emit('new_log', logResult.rows[0]);
        io.emit('stats_update');

        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

/**
 * Manually updates a post's status (e.g., to 'rejected' or 'approved').
 * This is the function required for the manual moderation feature.
 */
exports.updatePostStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    const validStatuses = ['approved', 'rejected', 'quarantined'];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'A valid status (approved, rejected, quarantined) is required.' });
    }
    if (!reason) {
        return res.status(400).json({ error: 'A reason for the status change is required.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateResult = await client.query("UPDATE posts SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
        if (updateResult.rows.length === 0) {
             await client.query('ROLLBACK');
             return res.status(404).json({ error: 'Post not found.' });
        }

        const logResult = await client.query(`INSERT INTO moderation_logs (post_id, action, reason) VALUES ($1, $2, $3) RETURNING *;`, [id, status, `Manual review by ${req.user.role}: ${reason}`]);

        await client.query('COMMIT');

        const io = getIo(req);
        io.emit('new_log', logResult.rows[0]);
        io.emit('stats_update');
        
        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

