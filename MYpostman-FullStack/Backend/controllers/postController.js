const pool = require('../db');
const { analyzeContent } = require('../services/moderationService');
const { fetchImage } = require('../services/imageService');

/**
 * Creates a new post, moderates it, and saves it to the database.
 * Emits WebSocket events to notify clients of the new post and log.
 */
exports.createPost = async (req, res, next) => {
    console.log("✅ [postController] createPost function initiated.");
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
            console.log("📸 Fetching image from Unsplash...");
            imageUrl = await fetchImage(topic);
        }

        console.log("💾 Saving post and log to the database...");
        await client.query('BEGIN');

        const postInsertQuery = `
            INSERT INTO posts (topic, tone, platform, content, image_url, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, topic, tone, platform, content, image_url, status, created_at;
        `;
        const postValues = [topic, tone, platform, moderationResult.generatedText, imageUrl, moderationResult.classification];
        const postResult = await client.query(postInsertQuery, postValues);
        const newPost = postResult.rows[0];

        const logInsertQuery = `
            INSERT INTO moderation_logs (post_id, action, reason)
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const logResult = await client.query(logInsertQuery, [newPost.id, moderationResult.classification, moderationResult.reason]);
        const newLog = logResult.rows[0];
        
        await client.query('COMMIT');

        // --- ✅ EMIT WEBSOCKET EVENTS ---
        const io = req.app.get('socketio');
        io.emit('stats_update');           // dashboard stats refresh
        io.emit('new_log', newLog);        // log updates
        io.emit('new_post', newPost);      // 👈 NEW: push new post in real-time
        console.log("🚀 [postController] Emitted 'stats_update', 'new_log', and 'new_post' via WebSocket.");

        res.status(201).json(newPost);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("❌❌❌ An error occurred in createPost: ❌❌❌", error);
        next(error); // Pass to global error handler
    } finally {
        client.release();
    }
};

/**
 * Publishes an approved post.
 * Emits WebSocket events to notify clients of the status change and new log.
 */
exports.publishPost = async (req, res, next) => {
    const { id } = req.params;
    console.log(`✅ [postController] publishPost initiated for post ID: ${id}.`);
    const client = await pool.connect();

    try {
        const statusCheck = await client.query('SELECT status FROM posts WHERE id = $1', [id]);
        if (statusCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found.' });
        }
        if (statusCheck.rows[0].status !== 'approved') {
            return res.status(400).json({ error: `Cannot publish post. Status is '${statusCheck.rows[0].status}'.` });
        }

        await client.query('BEGIN');

        const updateResult = await client.query(
            "UPDATE posts SET status = 'published' WHERE id = $1 RETURNING *",
            [id]
        );
        const updatedPost = updateResult.rows[0];

        const logInsertQuery = `
            INSERT INTO moderation_logs (post_id, action, reason)
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const logResult = await client.query(logInsertQuery, [id, 'published', 'Post published to social media.']);
        const newLog = logResult.rows[0];
        
        await client.query('COMMIT');

        // --- ✅ EMIT WEBSOCKET EVENTS ---
        const io = req.app.get('socketio');
        io.emit('stats_update');              // refresh stats
        io.emit('new_log', newLog);           // log updates
        io.emit('post_updated', updatedPost); // 👈 NEW: push post update in real-time
        console.log("🚀 [postController] Emitted 'stats_update', 'new_log', and 'post_updated' via WebSocket.");

        res.status(200).json(updatedPost);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌❌❌ An error occurred while publishing post ID: ${id} ❌❌❌`, error);
        next(error);
    } finally {
        client.release();
    }
};

/**
 * Fetches the entire history of posts.
 */
exports.getPostHistory = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching post history:", error);
        next(error);
    }
};
