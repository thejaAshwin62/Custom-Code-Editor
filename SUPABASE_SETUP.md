# Supabase Integration Setup Guide

## 1. Supabase Project Setup

### Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `ai-code-editor`
   - Database Password: Choose a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

### Get Your Supabase Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://yicbvsuqdmrvmakclpoj.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

## 2. Database Schema Setup

### Run SQL Commands
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase_schema.sql`
3. Click "Run" to execute all the SQL commands

This will create:
- `user_codes` table with proper structure
- Indexes for better performance
- Row Level Security (RLS) policies
- Automatic timestamp updates
- Search function

## 3. Environment Variables Setup

### Frontend (.env in client directory)
Create or update `client/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29tcG9zZWQtdGVycmFwaW4tNzEuY2xlcmsuYWNjb3VudHMuZGV2JA
VITE_SUPABASE_URL=https://yicbvsuqdmrvmakclpoj.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend (.env in root directory)
Create or update `.env` in the root directory:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Install Dependencies

### Frontend
```bash
cd client
npm install @supabase/supabase-js
```

### Backend
```bash
npm install @supabase/supabase-js
```

## 5. Features Implemented

### ✅ Code Manager Features
- **Save Code**: Save code snippets with title, description, and language
- **Load Code**: Browse and load saved code snippets
- **Edit Code**: Update title and description of saved codes
- **Delete Code**: Remove unwanted code snippets
- **Search**: Search through codes by title, description, or content
- **Sort**: Sort by last modified, created date, title, or language
- **Refresh**: Manually refresh the code list
- **Code Preview**: See a preview of the code content
- **Character Count**: Display code length
- **Real-time Updates**: Automatic updates when data changes

### ✅ Database Features
- **Row Level Security**: Users can only access their own codes
- **Automatic Timestamps**: Created and updated timestamps
- **Indexes**: Fast queries and searches
- **Full-text Search**: Search across title, description, and code
- **Data Validation**: Proper constraints and validation

### ✅ UI Features
- **Responsive Design**: Works on all screen sizes
- **Dark/Light Theme**: Consistent with app theme
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **Confirmation Dialogs**: Safe delete operations
- **Smooth Animations**: Professional user experience

## 6. Usage

### For Users
1. **Sign in** with your Google account via Clerk
2. **Write code** in the editor
3. **Click "Save Code"** to save your snippet
4. **Search and browse** your saved codes
5. **Load codes** back into the editor
6. **Edit or delete** codes as needed

### For Developers
The CodeManager component automatically:
- Connects to Supabase using environment variables
- Handles authentication with Clerk user IDs
- Manages CRUD operations with proper error handling
- Updates the UI in real-time
- Provides search and sort functionality

## 7. Troubleshooting

### Common Issues

**"Missing publishableKey" error**
- Check that `VITE_SUPABASE_ANON_KEY` is set correctly
- Restart the development server after adding environment variables

**"Permission denied" error**
- Ensure RLS policies are properly set up in Supabase
- Check that the user is authenticated with Clerk

**"Table doesn't exist" error**
- Run the SQL schema commands in Supabase SQL Editor
- Check that the table name matches `user_codes`

**Search not working**
- Ensure the search function is created in the database
- Check that the search query is properly formatted

### Testing the Setup
1. Start the development server: `npm run dev`
2. Sign in with Google via Clerk
3. Write some code in the editor
4. Try saving, searching, and loading codes
5. Check the Supabase dashboard to see the data

## 8. Security Notes

- All database operations are protected by Row Level Security
- Users can only access their own codes
- Authentication is handled by Clerk
- No sensitive data is stored in the frontend
- All API calls are properly authenticated

## 9. Performance Optimization

- Database indexes for fast queries
- Debounced search to reduce API calls
- Efficient pagination for large datasets
- Optimized UI updates
- Cached user data

The CodeManager is now fully integrated with Supabase and provides a complete CRUD experience for managing code snippets! 