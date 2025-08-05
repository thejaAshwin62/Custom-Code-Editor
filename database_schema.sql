-- Create the user_codes table
CREATE TABLE IF NOT EXISTS user_codes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language VARCHAR(50) DEFAULT 'javascript',
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_codes_user_id ON user_codes(user_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_user_codes_updated_at ON user_codes(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own codes
CREATE POLICY "Users can view own codes" ON user_codes
  FOR SELECT USING (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own codes
CREATE POLICY "Users can insert own codes" ON user_codes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create policy to allow users to update their own codes
CREATE POLICY "Users can update own codes" ON user_codes
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create policy to allow users to delete their own codes
CREATE POLICY "Users can delete own codes" ON user_codes
  FOR DELETE USING (auth.uid()::text = user_id); 