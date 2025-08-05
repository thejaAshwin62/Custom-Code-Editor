# Supabase Integration Setup

## 1. Supabase Database Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to the SQL Editor
4. Run the SQL commands from `database_schema.sql` to create the `user_codes` table

## 2. Environment Variables

### Frontend (.env in client directory)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29tcG9zZWQtdGVycmFwaW4tNzEuY2xlcmsuYWNjb3VudHMuZGV2JA
VITE_SUPABASE_URL=https://yicbvsuqdmrvmakclpoj.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend (.env in root directory)
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. Get Supabase Keys

1. In your Supabase dashboard, go to Settings > API
2. Copy the following:
   - Project URL (for VITE_SUPABASE_URL)
   - anon/public key (for VITE_SUPABASE_ANON_KEY)
   - service_role key (for SUPABASE_SERVICE_ROLE_KEY)

## 4. Update Supabase Client Configuration

Update `client/src/lib/supabase.js` with your actual keys:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 5. Features

- **Code Editor**: Works without login
- **Save Code**: Requires login (Clerk authentication)
- **CRUD Operations**: 
  - Create: Save new code snippets
  - Read: View all saved codes for the user
  - Update: Edit code titles and descriptions
  - Delete: Remove saved codes
- **User Isolation**: Each user can only see and manage their own codes

## 6. Usage

1. Users can write code in the editor without logging in
2. To save code, users must sign in with Google via Clerk
3. Saved codes appear in the Code Manager section
4. Users can load, edit, or delete their saved codes

## 7. API Endpoints

- `GET /api/codes/user/:user_id` - Get all codes for a user
- `POST /api/codes` - Save a new code
- `PUT /api/codes/:id` - Update a code
- `DELETE /api/codes/:id` - Delete a code
- `GET /api/codes/:id` - Get a specific code 