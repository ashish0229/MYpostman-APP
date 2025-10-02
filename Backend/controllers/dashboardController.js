// controllers/dashboardController.js
const pool = require('../db');

const getDashboardStats = async (req, res, next) => {
    try {
        const client = await pool.connect();

        const postsTodayQuery = "SELECT COUNT(*) FROM posts WHERE created_at >= NOW() - interval '24 hours'";
        const newUsersQuery = "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - interval '24 hours'";
        const violationsQuery = "SELECT COUNT(*) FROM moderation_logs WHERE action IN ('rejected', 'quarantined') AND created_at >= NOW() - interval '24 hours'";
        
        const postsTodayResult = await client.query(postsTodayQuery);
        const newUsersResult = await client.query(newUsersQuery);
        const violationsResult = await client.query(violationsQuery);
        
        client.release();

        const stats = {
            postsToday: parseInt(postsTodayResult.rows[0].count, 10),
            newUsers: parseInt(newUsersResult.rows[0].count, 10),
            policyViolations: parseInt(violationsResult.rows[0].count, 10),
        };

        res.json(stats);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
};
