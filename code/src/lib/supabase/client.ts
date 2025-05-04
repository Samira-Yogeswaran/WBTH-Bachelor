import { auth } from '@/actions/auth'
import { createClient } from '@supabase/supabase-js'
import { getSession } from 'next-auth/react'

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

export const supabaseWithAuth = async () => {
	let access_token = null

	const isServer = typeof window === 'undefined'
	if (isServer) {
		const session = await auth()
		access_token = session?.accessToken
	} else {
		const session = await getSession()
		access_token = session?.accessToken
	}

	if (!access_token) {
		throw new Error('No session found, please login again.')
	}

	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			global: { headers: { Authorization: `Bearer ${access_token}` } },
		}
	)
}
