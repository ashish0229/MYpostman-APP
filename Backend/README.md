# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Community Content Management Backend
This project is a Node.js and Express backend designed to manage and moderate user-submitted content for a community platform. It uses PostgreSQL for data storage and integrates with Google's Gemini AI for automated content analysis and classification.

Features
Post Management: API endpoint to create user posts.

Automated Moderation Pipeline: New posts are automatically sent to an AI service for analysis.

Content Classification: Posts are classified as approved, rejected, or quarantined based on AI analysis.

Logging: Every moderation action (automated or manual) is recorded in a dedicated log table.

Scalable Foundation: Built with a service-oriented structure to easily add more features like user management, manual moderation, etc.

Prerequisites
Node.js (v18 or later recommended)

PostgreSQL

A Google AI API Key from Google AI Studio.

Setup Instructions
1. Clone the Repository
git clone <your-repo-url>
cd community-content-backend

2. Install Dependencies
npm install

3. Set Up the Database
Make sure your PostgreSQL server is running.

Create a new database for the project. You can use psql or a GUI tool like pgAdmin.

CREATE DATABASE community_db;

Connect to your new database and run the schema script to create the necessary tables.

psql -d community_db -f database.sql

Note: You may need to provide user credentials (-U your_user) depending on your PostgreSQL setup.

4. Configure Environment Variables
Create a .env file in the root of the project by copying the example file.

cp .env.example .env

Open the .env file and fill in your specific configuration:

DB_USER: Your PostgreSQL username.

DB_HOST: The database host (usually localhost).

DB_DATABASE: The name of the database you created (community_db).

DB_PASSWORD: Your PostgreSQL password.

DB_PORT: The port your PostgreSQL server is running on (usually 5432).

PORT: The port for the Node.js server (e.g., 3001).

VITE_GOOGLE_API_KEY: Your API key from Google AI Studio.

5. Run the Application
For development (with auto-restarting on file changes):

npm run dev

For production:

npm start

The server will start, and you should see the message Server is running on http://localhost:3001 in your console.

API Usage
Create a New Post
Send a POST request to /api/posts with a JSON body. The backend will process the content through the moderation pipeline and respond with the result.

Endpoint: POST /api/posts

Body:

{
  "userId": 1, // The ID of the user creating the post
  "content": "This is a test post about sustainable coffee! #coffee"
}

Success Response (201 Created):

{
    "message": "Post created and processed with status: approved",
    "postId": 1,
    "status": "approved",
    "analysis": {
        "classification": "approved",
        "reason": "The content is safe and discusses a neutral topic."
    }
}
