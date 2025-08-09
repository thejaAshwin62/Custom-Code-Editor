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

-- Create the gemini_usage table for tracking API usage
CREATE TABLE IF NOT EXISTS gemini_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  endpoint VARCHAR(100) NOT NULL, -- 'explain', 'autocomplete', 'inline-completion', 'chat-modification'
  status VARCHAR(20) NOT NULL DEFAULT 'success', -- 'success', 'error', 'failed'
  request_tokens INTEGER DEFAULT 0,
  response_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  execution_time INTEGER DEFAULT 0, -- in milliseconds
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE DEFAULT CURRENT_DATE
);

-- Create indexes for gemini_usage table
CREATE INDEX IF NOT EXISTS idx_gemini_usage_user_id ON gemini_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_date ON gemini_usage(date DESC);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_endpoint ON gemini_usage(endpoint);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_status ON gemini_usage(status);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_created_at ON gemini_usage(created_at DESC);

-- Enable RLS for gemini_usage
ALTER TABLE gemini_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for gemini_usage
CREATE POLICY "Users can view own usage" ON gemini_usage
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own usage" ON gemini_usage
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create a function to get daily usage stats
CREATE OR REPLACE FUNCTION get_daily_usage_stats(user_uuid TEXT, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total_requests BIGINT,
  successful_requests BIGINT,
  failed_requests BIGINT,
  total_tokens BIGINT,
  avg_execution_time NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gu.date,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE gu.status = 'success') as successful_requests,
    COUNT(*) FILTER (WHERE gu.status != 'success') as failed_requests,
    COALESCE(SUM(gu.total_tokens), 0) as total_tokens,
    ROUND(AVG(gu.execution_time), 2) as avg_execution_time
  FROM gemini_usage gu
  WHERE gu.user_id = user_uuid
    AND gu.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY gu.date
  ORDER BY gu.date DESC;
END;
$$;

-- Create a function to get endpoint usage stats
CREATE OR REPLACE FUNCTION get_endpoint_usage_stats(user_uuid TEXT, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  endpoint VARCHAR(100),
  total_requests BIGINT,
  successful_requests BIGINT,
  failed_requests BIGINT,
  success_rate NUMERIC,
  total_tokens BIGINT,
  avg_execution_time NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gu.endpoint,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE gu.status = 'success') as successful_requests,
    COUNT(*) FILTER (WHERE gu.status != 'success') as failed_requests,
    ROUND(
      (COUNT(*) FILTER (WHERE gu.status = 'success')::NUMERIC / COUNT(*)) * 100, 
      2
    ) as success_rate,
    COALESCE(SUM(gu.total_tokens), 0) as total_tokens,
    ROUND(AVG(gu.execution_time), 2) as avg_execution_time
  FROM gemini_usage gu
  WHERE gu.user_id = user_uuid
    AND gu.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY gu.endpoint
  ORDER BY total_requests DESC;
END;
$$;

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