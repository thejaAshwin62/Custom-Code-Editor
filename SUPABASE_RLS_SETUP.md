# Supabase RLS Setup Guide

## Problem
You're getting this error when trying to save code:
```
new row violates row-level security policy for table "user_codes"
```

This happens because Row Level Security (RLS) is enabled on the `user_codes` table but the policies aren't properly configured.

## Solution

### Step 1: Go to Supabase Dashboard
1. Open your browser and go to: https://supabase.com/dashboard/project/yicbvsuqdmrvmakclpoj
2. Navigate to **Database** → **Policies** in the left sidebar

### Step 2: Find the user_codes Table
1. Look for the `user_codes` table in the list
2. Click on it to see the current policies

### Step 3: Add RLS Policies

You need to add these 4 policies to the `user_codes` table:

#### Policy 1: Enable INSERT for authenticated users
- **Policy Name**: `Enable users to insert their own codes`
- **Target Roles**: `authenticated`
- **Policy Definition**: 
  ```sql
  (auth.uid()::text = user_id)
  ```
- **Operation**: INSERT

#### Policy 2: Enable SELECT for authenticated users
- **Policy Name**: `Enable users to view their own codes`
- **Target Roles**: `authenticated`
- **Policy Definition**: 
  ```sql
  (auth.uid()::text = user_id)
  ```
- **Operation**: SELECT

#### Policy 3: Enable UPDATE for authenticated users
- **Policy Name**: `Enable users to update their own codes`
- **Target Roles**: `authenticated`
- **Policy Definition**: 
  ```sql
  (auth.uid()::text = user_id)
  ```
- **Operation**: UPDATE

#### Policy 4: Enable DELETE for authenticated users
- **Policy Name**: `Enable users to delete their own codes`
- **Target Roles**: `authenticated`
- **Policy Definition**: 
  ```sql
  (auth.uid()::text = user_id)
  ```
- **Operation**: DELETE

### Step 4: Alternative Approach (Recommended)

Since you're using Clerk for authentication, you might want to disable RLS temporarily or use a different approach:

#### Option A: Disable RLS (Quick Fix)
1. Go to **Database** → **Tables**
2. Click on `user_codes` table
3. Go to **Settings** tab
4. Toggle off **"Enable Row Level Security"**

#### Option B: Use Clerk User ID in Policies
If you want to keep RLS enabled, modify the policies to use Clerk user IDs:

```sql
-- For INSERT
(user_id = current_setting('request.jwt.claims', true)::json->>'sub')

-- For SELECT
(user_id = current_setting('request.jwt.claims', true)::json->>'sub')

-- For UPDATE
(user_id = current_setting('request.jwt.claims', true)::json->>'sub')

-- For DELETE
(user_id = current_setting('request.jwt.claims', true)::json->>'sub')
```

### Step 5: Test the Fix

After setting up the policies:

1. **Quick Save**: Try the "Quick Save" button in the editor
2. **Code Manager**: Try saving from the Code Manager page
3. **View Saved Codes**: Check if saved codes appear in the Code Manager

## Troubleshooting

### If you still get errors:

1. **Check the user_id column type**: Make sure it's `varchar` or `text` to match Clerk user IDs
2. **Verify RLS is enabled**: Go to table settings and ensure RLS is turned on
3. **Check policy syntax**: Make sure the policy expressions are correct
4. **Test with simple policy**: Try a simple policy like `(true)` for all operations to test

### Quick Test Query

You can test if the policies work by running this in the Supabase SQL editor:

```sql
-- Test INSERT
INSERT INTO user_codes (title, description, code, language, user_id)
VALUES ('Test', 'Test description', 'console.log("test")', 'javascript', 'your_clerk_user_id');

-- Test SELECT
SELECT * FROM user_codes WHERE user_id = 'your_clerk_user_id';
```

## Final Notes

- The `user_id` column should store the Clerk user ID (which is a string)
- Make sure the column type matches the data you're inserting
- If you continue having issues, consider using the simpler approach of disabling RLS for now 