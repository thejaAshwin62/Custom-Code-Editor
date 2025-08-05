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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_codes_user_id ON user_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_codes_updated_at ON user_codes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_codes_created_at ON user_codes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_codes_title ON user_codes(title);
CREATE INDEX IF NOT EXISTS idx_user_codes_language ON user_codes(language);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_codes_updated_at 
    BEFORE UPDATE ON user_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own codes
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

-- Create a function to search codes (for full-text search)
CREATE OR REPLACE FUNCTION search_user_codes(search_term TEXT, user_uuid TEXT)
RETURNS TABLE (
  id BIGINT,
  title VARCHAR(255),
  description TEXT,
  code TEXT,
  language VARCHAR(50),
  user_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT uc.*
  FROM user_codes uc
  WHERE uc.user_id = user_uuid
    AND (
      uc.title ILIKE '%' || search_term || '%'
      OR uc.description ILIKE '%' || search_term || '%'
      OR uc.code ILIKE '%' || search_term || '%'
    );
END;
$$ LANGUAGE plpgsql; 