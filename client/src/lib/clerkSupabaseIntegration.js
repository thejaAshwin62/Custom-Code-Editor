import { supabase } from './supabase'

// Function to sync Clerk user with Supabase
export const syncClerkWithSupabase = async (clerkUser) => {
  if (!clerkUser) return null

  try {
    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', clerkUser.primaryEmailAddress?.emailAddress)
      .single()

    if (existingUser) {
      return existingUser.id
    }

    // If user doesn't exist, create them in Supabase
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: clerkUser.primaryEmailAddress?.emailAddress,
      password: 'temp-password-' + Date.now(), // Temporary password
      options: {
        data: {
          clerk_id: clerkUser.id,
          first_name: clerkUser.firstName,
          last_name: clerkUser.lastName,
          email: clerkUser.primaryEmailAddress?.emailAddress
        }
      }
    })

    if (signUpError) {
      console.error('Error creating Supabase user:', signUpError)
      return null
    }

    return user?.id
  } catch (error) {
    console.error('Error syncing Clerk with Supabase:', error)
    return null
  }
}

// Function to get or create Supabase user ID for Clerk user
export const getSupabaseUserId = async (clerkUser) => {
  if (!clerkUser) return null

  try {
    // Try to get existing session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      return session.user.id
    }

    // If no session, try to sign in with email
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: clerkUser.primaryEmailAddress?.emailAddress,
      password: 'temp-password-' + Date.now() // This won't work, but we'll handle it
    })

    if (error && error.message.includes('Invalid login credentials')) {
      // User doesn't exist, create them
      return await syncClerkWithSupabase(clerkUser)
    }

    return user?.id
  } catch (error) {
    console.error('Error getting Supabase user ID:', error)
    return null
  }
}

// Alternative approach: Use a custom user mapping table
export const createUserMapping = async (clerkUser) => {
  if (!clerkUser) return null

  try {
    // Create a mapping in a custom table
    const { data, error } = await supabase
      .from('user_mappings')
      .upsert({
        clerk_id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_id'
      })
      .select()
      .single()

    if (error) throw error

    return data.id
  } catch (error) {
    console.error('Error creating user mapping:', error)
    return null
  }
} 