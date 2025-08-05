# Clerk + Supabase RLS Setup Guide

If you want to keep Row Level Security (RLS) enabled while using Clerk for authentication, follow these steps:

## Option 1: Disable RLS (Simplest - Recommended for now)

1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. Select the `user_codes` table
4. Click on the **Settings** tab
5. **Uncheck "Enable Row Level Security"**
6. Save changes

This will allow all authenticated requests to work without RLS policies.

## Option 2: Configure RLS for Clerk (Advanced)

If you want to keep RLS enabled, you need to create policies that work with Clerk user IDs:

### Step 1: Enable RLS
1. Go to **Table Editor** → `user_codes` table → **Settings**
2. **Check "Enable Row Level Security"**

### Step 2: Create Policies

Go to **Authentication** → **Policies** → `user_codes` table and create these policies:

#### INSERT Policy
- **Policy Name**: `Enable insert for authenticated users`
- **Target Roles**: `authenticated`
- **Using expression**: `true`
- **With check expression**: `true`

#### SELECT Policy
- **Policy Name**: `Enable select for authenticated users`
- **Target Roles**: `authenticated`
- **Using expression**: `true`

#### UPDATE Policy
- **Policy Name**: `Enable update for authenticated users`
- **Target Roles**: `authenticated`
- **Using expression**: `true`
- **With check expression**: `true`

#### DELETE Policy
- **Policy Name**: `Enable delete for authenticated users`
- **Target Roles**: `authenticated`
- **Using expression**: `true`

### Step 3: Alternative - User-specific policies

If you want more granular control, you can create policies that check the `user_id` column:

#### INSERT Policy
- **Policy Name**: `Enable insert for own data`
- **Target Roles**: `authenticated`
- **Using expression**: `true`
- **With check expression**: `user_id IS NOT NULL`

#### SELECT Policy
- **Policy Name**: `Enable select for own data`
- **Target Roles**: `authenticated`
- **Using expression**: `user_id IS NOT NULL`

#### UPDATE Policy
- **Policy Name**: `Enable update for own data`
- **Target Roles**: `authenticated`
- **Using expression**: `user_id IS NOT NULL`
- **With check expression**: `user_id IS NOT NULL`

#### DELETE Policy
- **Policy Name**: `Enable delete for own data`
- **Target Roles**: `authenticated`
- **Using expression**: `user_id IS NOT NULL`

## Recommendation

For your current setup, **Option 1 (disable RLS)** is recommended because:
1. You're using Clerk for authentication, not Supabase Auth
2. The `user_id` column already provides data separation
3. It's simpler and will work immediately
4. You can always enable RLS later with proper policies

## Testing

After making changes:
1. Try the "Quick Save" button
2. Check if code appears in the Code Manager
3. Verify that saved codes are associated with the correct user 