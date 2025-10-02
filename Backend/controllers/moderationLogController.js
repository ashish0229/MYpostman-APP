const pool = require('../db');

/**
 * @desc    Get all moderation log entries
 * @route   GET /api/moderation-logs
 * @access  Private/Moderator
 */
const getModerationLogs = async (req, res, next) => {
    try {
        // FIX: Changed "timestamp" to the correct column name "created_at".
        const result = await pool.query('SELECT * FROM moderation_logs ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching moderation logs:", error);
        next(error); // Pass error to the global error handler
    }
};


/**
 * @desc    Insert a new moderation log (Not used directly by a route yet)
 * @note    This function is intended to be called internally or by future admin actions.
 */
const addLog = async (req, res, next) => {
    try {
        // This functionality is currently handled within the postController.
        // This function is here for future expansion (e.g., manual moderation actions).
        res.status(501).json({ message: "Manual log addition not implemented yet." });

    } catch (err) {
        console.error("Error inserting moderation log:", err.message);
        next(err);
    }
};


module.exports = {
    // FIX: Exporting the function with the name the route expects.
    getModerationLogs,
    addLog,
};

