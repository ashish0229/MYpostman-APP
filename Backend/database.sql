-- Drop existing tables in the correct order to avoid dependency errors
DROP TABLE IF EXISTS moderation_logs;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS post_status;

-- Create ENUM types for defined roles and statuses
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
-- UPDATED: Added 'quarantined' to the list of possible post statuses
CREATE TYPE post_status AS ENUM ('pending', 'approved', 'rejected', 'quarantined', 'published');

-- Create the 'users' table with the new 'display_name' column
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL, -- For login
    display_name VARCHAR(255) NOT NULL,    -- For display purposes
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'posts' table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL,
    tone VARCHAR(50),
    platform VARCHAR(50),
    content TEXT NOT NULL,
    image_url TEXT,
    status post_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'moderation_logs' table
CREATE TABLE moderation_logs (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for faster lookups on post_id
CREATE INDEX idx_moderation_logs_post_id ON moderation_logs(post_id);

-- --- FIX: Insert a default admin user with a REAL hashed password for "password" ---
INSERT INTO users (username, display_name, password, role) 
VALUES ('admin', 'Admin User', '$2a$10$E9p.IZ3..4A4XbCoaHz65.6.89.s25x0MQzJ9.5aM9b9aZO5.9zse', 'admin')
ON CONFLICT (username) DO NOTHING;

