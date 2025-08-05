import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yicbvsuqdmrvmakclpoj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpY2J2c3VxZG1ydm1ha2NscG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjQ3MTgsImV4cCI6MjA2OTkwMDcxOH0.s3pbkQItzUOzpbnW3qEIUcXrHD_NxNzZDw9Nr_Joj9w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table name
export const TABLES = {
  USER_CODES: 'user_codes'
}

// Helper function to get current user ID
export const getCurrentUserId = () => {
  const user = supabase.auth.getUser()
  return user?.id
} 