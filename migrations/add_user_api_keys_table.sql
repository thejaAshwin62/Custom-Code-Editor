-- Migration: Add user_api_keys table for storing encrypted user API keys
-- Run this script in your Supabase SQL Editor if you already have an existing database

-- Create the user_api_keys table for storing encrypted user API keys
CREATE TABLE IF NOT EXISTS user_api_keys (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  encrypted_api_key TEXT NOT NULL,
  iv VARCHAR(255) NOT NULL, -- Initialization vector for encryption
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_api_keys table
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_created_at ON user_api_keys(created_at DESC);

-- Create trigger to automatically update updated_at for user_api_keys
-- (This assumes the update_updated_at_column function already exists from the main schema)
CREATE TRIGGER update_user_api_keys_updated_at 
    BEFORE UPDATE ON user_api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for user_api_keys
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for user_api_keys
CREATE POLICY "Users can view own API keys" ON user_api_keys
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own API keys" ON user_api_keys
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own API keys" ON user_api_keys
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own API keys" ON user_api_keys
  FOR DELETE USING (auth.uid()::text = user_id);

-- Verify the table was created successfully
SELECT 'user_api_keys table created successfully!' as status;