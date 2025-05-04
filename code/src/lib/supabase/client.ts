import { createClient } from '@supabase/supabase-js'

// Auth project client
export const supabaseAuth = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY!
)

// Main project client
export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
