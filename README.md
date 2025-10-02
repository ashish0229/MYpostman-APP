# MYpostmate – AI-Powered Community Content Management Platform  

[![Frontend](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)  
[![Backend](https://img.shields.io/badge/Backend-Node.js-green)](https://nodejs.org/)  
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)](https://www.postgresql.org/)  
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-red)](https://deepmind.google/)  
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)  

**MYpostmate** is a **full-stack, real-time, AI-powered community management and content generation platform**.  
It leverages **AI for content creation**, includes a **rule-based moderation system**, and provides **real-time dashboards**. The entire system is **fully containerized with Docker**, allowing a one-command setup and deployment.  

---

## 📌 Table of Contents  

- [Core Features](#-core-features)  
- [Tech Stack](#-tech-stack)  
- [Project Structure](#-project-structure)  
- [Setup & Installation (Docker)](#-setup--installation-docker)  
- [Setup & Installation (Manual)](#-setup--installation-manual)  
- [Usage](#-usage)  
- [License](#-license)  

---

## ✨ Core Features  

- **AI Content Generation**: Generate social media posts with topic, tone, and platform using **Google Gemini API**.  
- **Rule-Based AI Moderation**: AI moderation engine validates all content against rules defined in `moderation_rules.json`.  
- **Full User Authentication**: Secure registration/login with **role-based access control (Admin, Moderator, User)**.  
- **JWT Session Management**: Secure user sessions with JWT (1-hour expiry).  
- **Real-Time Dashboards & Logs**: Live updates for posts, user management, and moderation logs using **Socket.IO**.  
- **Manual Moderation Tools**: Admins/Moderators can override AI decisions (approve/reject).  
- **Persistent PostgreSQL Database**: Stores all users, posts, and moderation history.  
- **Fully Containerized**: Defined in `docker-compose.yml` for simple deployment.  

---

## 🛠 Tech Stack  

| **Category**   | **Technology** |
|----------------|----------------|
| **Frontend**   | React, Vite, Tailwind CSS, Socket.IO Client |
| **Backend**    | Node.js, Express.js, Socket.IO |
| **Database**   | PostgreSQL |
| **Security**   | JWT, bcrypt.js |
| **AI / APIs**  | Google Gemini, Unsplash |
| **DevOps**     | Docker, Docker Compose |

---

## 🗂 Project Structure  

MYpostmate/
├── frontend/ # React client (Vite + Tailwind + Socket.IO client)
├── backend/ # Node.js/Express API + Socket.IO server
├── moderation_rules.json # Rule-based AI moderation rules
├── docker-compose.yml # Container orchestration
└── .env.example # Example environment configuration

Project Structure
The project is organized into two main directories: frontend and backend.


---

## ⚙️ Setup & Installation (Docker)  

✅ **Recommended Method** for easiest setup.  

### Prerequisites  
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)  

### Instructions  

1. **Clone the Repository**  
```bash
git clone <your-repository-url>
cd MYpostmate

2. **Create the Environment File**
In the project root, create a .env file.
Copy contents from .env.example and replace placeholders with actual values:
```.env
GOOGLE_API_KEY=YourGoogleGeminiAPIKey
UNSPLASH_API_KEY=YourUnsplashApiKey
DB_USER=your_db_username
DB_PASSWORD=your_password
DB_HOST=db_host_name
DB_PORT=5432
DB_DATABASE=db_name
JWT_SECRET=generate_a_long_random_secret_string

2. **Build & Run the Application**
```bash
docker-compose up --build
	
	The stack will start:

	Backend API → http://localhost:3001

	Frontend → http://localhost:5173

	PostgreSQL Database → localhost:5432

## ⚙️ Setup & Installation (Manual)

If you prefer not to use Docker:

1. **Install Requirements**

	Node.js v18+

	PostgreSQL

2. **Backend Setup**
	```bash
	cd backend
	npm install

Create the database:

CREATE DATABASE db_name;
CREATE USER your_db_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE db_name TO your_db_username;

Run schema:

```bash
psql -U AdminAsh2911 -d community_db -f database.sql

Start backend:

```bash
npm run dev

3. **Frontend Setup**
	```bash
	cd frontend
	npm install
	npm run dev

---

##📝 Usage

Visit http://localhost:5173 in your browser.

	1. *Register a new account (choose Admin role for full access).*

	2. *Use the sidebar navigation:

	3. *Generator → Create AI posts

	4. *Dashboard → Monitor community activity

	5. *Moderation Log → Track approvals/rejections in real-time

##📄 License

This project is licensed under the MIT License.
See the LICENSE
 file for more details.


---

#How to Use
Open your browser and navigate to http://localhost:5173.
You will be prompted to create an account. Register a new user with the "Admin" role to have access to all features.
After logging in, you can navigate between the different sections using the sidebar.
Go to the "Generator" to create new posts and watch the "Dashboard" and "Moderation Log" update in real-time.

This README was last updated on October 1, 2025.