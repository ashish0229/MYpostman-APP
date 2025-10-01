const pool = require('../db');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const getAllUsers = async (req, res, next) => {
    try {
        // Query the database to get all users, excluding the password hash for security.
        const result = await pool.query(
            'SELECT id, display_name, username, role, created_at FROM users ORDER BY created_at DESC'
        );
        // Send the list of users as a JSON response.
        res.json(result.rows);
    } catch (error) {
        // If there's a database error, pass it to the global error handler.
        console.error("Error fetching users:", error);
        next(error);
    }
};

module.exports = {
    getAllUsers,
};

