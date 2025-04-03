-- Add user_id column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id); 