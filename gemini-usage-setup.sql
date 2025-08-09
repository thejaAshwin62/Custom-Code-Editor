-- ===============================================
-- GEMINI USAGE TRACKING - CORRECTED DATABASE SETUP
-- ===============================================
-- Copy and paste this entire script into your Supabase SQL Editor

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

-- Insert a test record to verify table creation
INSERT INTO gemini_usage (user_id, endpoint, status, request_tokens, response_tokens, total_tokens, execution_time)
VALUES ('test_user', 'test_endpoint', 'success', 100, 200, 300, 1500);

-- Query to verify the table was created successfully
SELECT 'gemini_usage table created successfully!' as result, COUNT(*) as test_records FROM gemini_usage WHERE user_id = 'test_user';
