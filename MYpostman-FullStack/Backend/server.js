// --- backend/server.js ---
console.log("--- Loading backend/server.js ---");
require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db');

// --- Import API Routes ---
console.log("--- server.js: Importing routes... ---");
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const moderationLogRoutes = require('./routes/moderationLogs');
// const userRoutes = require('./routes/users'); // Temporarily disabled for debugging
const dashboardRoutes = require('./routes/dashboard');
console.log("--- server.js: All routes imported successfully. ---");


const app = express();
const server = http.createServer(app);

// --- WebSocket (Socket.IO) Setup ---
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST", "PUT"]
    }
});

// --- Middleware ---
app.use(cors()); 
app.use(express.json());
app.set('socketio', io);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/moderation-logs', moderationLogRoutes);
// app.use('/api/users', userRoutes); // Temporarily disabled for debugging
app.use('/api/dashboard', dashboardRoutes);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error("❌❌❌ GLOBAL ERROR HANDLER ❌❌❌", err.stack);
    res.status(500).send('Something broke!');
});


// --- Server Initialization ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log("✅ Database connection pool established successfully!");
    } catch (err) {
        console.error("❌ Failed to establish database connection:", err);
    }
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

