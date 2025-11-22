// --- backend/server.js ---
console.log("--- Loading backend/server.js ---");
require('dotenv').config({ path: './.env' });



const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db');
const axios = require("axios");

// --- Import API Routes ---
console.log("--- server.js: Importing routes... ---");
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const moderationLogRoutes = require('./routes/moderationLogs');
//const userRoutes = require('./routes/users'); // Temporarily disabled for debugging
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


io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("user_message", async (data) => {
    console.log("📩 User message:", data);

    try {
        const userText = data.message || data.text || data.content;

        if (!userText) {
            console.log("⚠️ No message text received. Skipping.");
            return;
        }

        const response = await axios.post("http://localhost:3002/api/chat", {
            message: userText,
        });

        const botReply = response.data.reply;
        console.log("🤖 Bot Reply:", botReply);

        io.emit("support_reply", {
            userId: data.userId,
            message: botReply,
        });

    } catch (err) {
        console.error("❌ Error contacting Python model:", err.message);
    }
    socket.on("support_reply", (data) => {
        console.log("📨 Support Agent Reply:", data);
        io.emit("support_reply", data);
    });

    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
    });
});
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

