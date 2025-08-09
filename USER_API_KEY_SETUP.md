# User API Key Management Setup Guide

This feature allows users to input and save their own Google Gemini API keys securely. The system will use their individual key for API requests, falling back to a shared global key if no personal key is provided.

## Features

- ✅ **Secure Storage**: User API keys are encrypted before storage in Supabase
- ✅ **Individual Usage**: Each user's requests use their own API key when provided
- ✅ **Fallback System**: Uses shared API key when user hasn't provided their own
- ✅ **Privacy**: Users can delete their API keys at any time
- ✅ **Usage Tracking**: Gemini usage is still tracked per user

## Required Environment Variables

Add these to your `.env` file:

```env
# Google Gemini AI API (REQUIRED - this is the shared/fallback key)
GOOGLE_API_KEY=your_google_api_key_here

# API Key Encryption (REQUIRED for security)
API_KEY_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Existing Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Important Notes:

1. **API_KEY_ENCRYPTION_KEY**: Generate a secure 32-character string for encrypting user API keys
2. **GOOGLE_API_KEY**: This becomes the shared/fallback key when users don't provide their own

## Database Setup

Run the updated SQL schema in your Supabase dashboard to add the new `user_api_keys` table:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the contents of `supabase_schema.sql` (contains the new table)

The new table structure:
```sql
CREATE TABLE user_api_keys (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  encrypted_api_key TEXT NOT NULL,
  iv VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Save User API Key
```http
POST /api/user-api-key/save
Content-Type: application/json

{
  "userId": "user_123",
  "apiKey": "AIzaSyC..."
}
```

### Check if User Has API Key
```http
GET /api/user-api-key/check/{userId}
```

### Get API Key Status (Masked)
```http
GET /api/user-api-key/status/{userId}
```

### Delete User API Key
```http
DELETE /api/user-api-key/delete/{userId}
```

## How It Works

1. **User Registration**: Users can optionally provide their Google Gemini API key
2. **Secure Storage**: API keys are encrypted using AES-256-CBC before storage
3. **Request Processing**: 
   - When a user makes an AI request, the system first checks for their personal API key
   - If found, uses the user's key
   - If not found, falls back to the shared `GOOGLE_API_KEY`
4. **Usage Tracking**: All usage is still tracked per user regardless of which key is used

## Security Features

- **Encryption**: User API keys are encrypted with a strong encryption algorithm
- **Row Level Security**: Supabase RLS ensures users can only access their own keys
- **Key Validation**: Basic validation ensures submitted keys are in the correct format
- **Masked Display**: When showing key status, only show first 6 and last 4 characters

## Frontend Integration

To integrate this with your frontend, you'll need to:

1. **Add API Key Settings Page**: Allow users to input/manage their API key
2. **Status Display**: Show whether user is using personal or shared API key
3. **Usage Stats**: Display individual usage statistics
4. **Security Notice**: Inform users about encryption and security measures

Example frontend flow:
```javascript
// Check if user has API key
const response = await fetch(`/api/user-api-key/status/${userId}`);
const status = await response.json();

if (status.hasApiKey) {
  console.log(`Using personal key: ${status.maskedKey}`);
} else {
  console.log('Using shared API key');
}

// Save new API key
await fetch('/api/user-api-key/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: userId,
    apiKey: userProvidedKey
  })
});
```

## Migration from Existing System

If you have existing users, no migration is needed:
- Existing functionality continues to work unchanged
- Users without personal API keys automatically use the shared key
- New users can optionally provide their own keys during registration

## Testing

Test the system by:
1. Making AI requests without a personal API key (should use shared key)
2. Adding a personal API key for a user
3. Making AI requests with the personal key
4. Verifying usage tracking works for both scenarios
5. Testing key deletion (should revert to shared key)

## Troubleshooting

**"No API key available" errors:**
- Ensure `GOOGLE_API_KEY` is set in environment variables
- Check that user's encrypted key can be decrypted
- Verify `API_KEY_ENCRYPTION_KEY` is consistent

**Encryption errors:**
- Ensure `API_KEY_ENCRYPTION_KEY` is exactly 32 characters
- Don't change the encryption key after users have saved API keys

**Database errors:**
- Verify the `user_api_keys` table was created
- Check Supabase RLS policies are active
- Ensure `SUPABASE_SERVICE_ROLE_KEY` has correct permissions