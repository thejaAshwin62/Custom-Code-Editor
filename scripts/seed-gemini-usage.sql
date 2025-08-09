-- ===============================================
-- Seed fake data for gemini_usage (Supabase/Postgres)
-- ===============================================
-- Usage: Paste this script in Supabase SQL Editor and run.
-- It will insert realistic fake usage for the specified user
-- across the last N days and all endpoints.

-- >>> Optional: Clear existing rows for this user first
-- DELETE FROM gemini_usage WHERE user_id = 'user_30sTLw3JrUMGovBHUa71Mwq632Z';

WITH config AS (
  SELECT
    'user_30sTLw3JrUMGovBHUa71Mwq632Z'::text AS uid,
    30::int AS days_back -- number of days to seed (including today)
),
-- Build a day range 0..days_back-1 (0 = today)
days AS (
  SELECT generate_series(0, (SELECT days_back - 1 FROM config)) AS day_offset
),
-- All endpoints we track
endpoints AS (
  SELECT unnest(ARRAY['explain','autocomplete','inline-completion','chat-modification']) AS endpoint
),
-- Build rows: for each day and endpoint, create 1..5 requests with random stats
rows AS (
  SELECT
    (SELECT uid FROM config) AS user_id,
    e.endpoint,
    CASE WHEN random() < 0.9 THEN 'success' ELSE 'error' END AS status,
    (50 + floor(random() * 200))::int AS request_tokens,
    (100 + floor(random() * 600))::int AS response_tokens,
    (500 + floor(random() * 4500))::int AS execution_time, -- ms
    (CURRENT_DATE - d.day_offset) AS date_base,
    -- Randomize created_at time within the day, cast to timestamptz
    ((CURRENT_DATE - d.day_offset)::timestamptz + (random() * INTERVAL '1 day')) AS created_at
  FROM days d
  JOIN endpoints e ON true
  JOIN LATERAL generate_series(1, (1 + floor(random() * 5))::int) g(n) ON true
)
INSERT INTO gemini_usage (
  user_id,
  endpoint,
  status,
  request_tokens,
  response_tokens,
  total_tokens,
  execution_time,
  error_message,
  created_at,
  date
)
SELECT
  user_id,
  endpoint,
  status,
  request_tokens,
  response_tokens,
  (request_tokens + response_tokens) AS total_tokens,
  execution_time,
  CASE WHEN status = 'success' THEN NULL ELSE 'Simulated failure' END AS error_message,
  created_at,
  date_base::date
FROM rows;

-- Quick sanity checks (optional)
-- SELECT COUNT(*) AS total_rows, MIN(date) AS oldest_day, MAX(date) AS newest_day
-- FROM gemini_usage WHERE user_id = 'user_30sTLw3JrUMGovBHUa71Mwq632Z';
-- SELECT endpoint, COUNT(*) AS requests
-- FROM gemini_usage WHERE user_id = 'user_30sTLw3JrUMGovBHUa71Mwq632Z'
-- GROUP BY endpoint ORDER BY requests DESC;
