#MYpostmate - Community Content Management Platform
MYpostmate is a full-stack web application designed for comprehensive community content management. It leverages AI for content generation and features a real-time dashboard for live monitoring and moderation. The system is built with a secure, role-based authentication system for administrators, moderators, and users.

#Core Technologies
Frontend: React with Vite
Backend: Node.js with Express
Database: PostgreSQL
Real-Time: Socket.IO for WebSockets
AI: Google Gemini and Unsplash for content analysis and text/Image generation

##Features
AI-Powered Content Generation: Create social media posts based on a topic, tone, and platform.
Automated Content Moderation: Each generated post is automatically analyzed by an AI agent based on community-specific rules.
User Authentication: Secure registration and login system with JWT for session management.
Role-Based Access Control (RBAC): Distinct roles for Admin, Moderator, and User, with protected routes and features.
Live Dashboard: Real-time statistics on posts created, new users, and policy violations.
Live Moderation Log: A real-time stream of all moderation actions (approved, quarantined, published, etc.).
User Management: Admins can view a list of all registered users.

Project Structure
The project is organized into two main directories: frontend and backend.

#System Prerequisites
Before you begin, ensure you have the following installed on your system:
Node.js (v18 or later recommended)
PostgreSQL
Backend Setup

#Navigate to the Backend Directory:
cd backend
##Install Dependencies:
npm install

#Set Up the Database:

Open your PostgreSQL terminal (psql) or a GUI client.

Create a new database for the project.

CREATE DATABASE community_db;

Create a user and grant it privileges (replace 'your_password' with a secure password).

CREATE USER AdminAsh2911 WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE community_db TO AdminAsh2911;
GRANT ALL ON SCHEMA public TO AdminAsh2911;

#Configure Environment Variables:

Create a new file named .env in the backend directory.

Copy the content from .env.example and fill in your specific credentials. It should look like this:

# API Keys
GOOGLE_API_KEY=AIzaYourGoogleApiKey...
UNSPLASH_API_KEY=YourUnsplashApiKey...

# PostgreSQL Database Connection
DB_USER="AdminAsh2911"
DB_HOST="localhost"
DB_DATABASE="community_db"
DB_PASSWORD="your_password"
DB_PORT=5432

# Application Port
PORT=3001

# Security - JWT Secret
JWT_SECRET="generate_a_long_random_secret_string"

##Run the Database Schema:
From the backend directory, run the following command to create all necessary tables. You will be prompted for your user's password.
psql -U AdminAsh2911 -d community_db -f database.sql

##Start the Backend Server:
npm run dev
The server should now be running on http://localhost:3001.

Frontend Setup
Open a New Terminal.

#Navigate to the Frontend Directory:
cd frontend
Install Dependencies:
npm install

##Start the Frontend Server:
npm run dev
The application will now be running on http://localhost:5173.

#How to Use
Open your browser and navigate to http://localhost:5173.
You will be prompted to create an account. Register a new user with the "Admin" role to have access to all features.
After logging in, you can navigate between the different sections using the sidebar.
Go to the "Generator" to create new posts and watch the "Dashboard" and "Moderation Log" update in real-time.

This README was last updated on October 1, 2025.