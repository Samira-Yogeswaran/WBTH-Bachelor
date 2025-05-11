import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAuth } from '@/lib/supabase/client'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Module } from '@/types/general'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// Helper function to format timestamps
export function formatTimestamp(timestamp: string): string {
	const date = new Date(timestamp)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime() + now.getTimezoneOffset() * 60000 // Adjust for timezone offset
	const diffMinutes = Math.floor(diffMs / (1000 * 60))
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffMinutes < 1) return 'Gerade eben'
	if (diffMinutes < 60) return `${diffMinutes} Minuten zuvor`
	if (diffHours < 24) return `${diffHours} Stunden zuvor`
	if (diffDays === 1) return '1 Tag zuvor'
	return `${diffDays} Tage zuvor`
}

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				// Validate credentials
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				// Attempt to sign in with Supabase
				const { data, error } = await supabaseAuth.auth.signInWithPassword({
					email: credentials.email,
					password: credentials.password,
				})

				if (error || !data?.session) {
					console.error('Authentication error:', error)
					return null
				}

				const user = data.user
				if (!user) return null

				// Return the user with the session token
				return {
					id: user.id,
					email: user.email || '',
					name: user.user_metadata?.first_name || '',
					firstName: user.user_metadata?.first_name || '',
					lastName: user.user_metadata?.last_name || '',
					accessToken: data.session.access_token,
				}
			},
		}),
	],
	callbacks: {
		async session({ session, token }) {
			// Add user ID and access token to the session
			if (token) {
				session.user.id = token.sub
				session.user.firstName = token.firstName as string
				session.user.lastName = token.lastName as string
				session.accessToken = token.accessToken as string
			}
			return session
		},
		async jwt({ token, user }) {
			// Add user ID and access token to the token if user is available
			if (user) {
				token.sub = user.id
				token.email = user.email
				token.firstName = user.firstName
				token.lastName = user.lastName
				token.accessToken = user.accessToken
			}
			return token
		},
	},
	pages: {
		signIn: '/login',
		signOut: '/login',
		error: '/login',
	},
	session: {
		strategy: 'jwt',
	},
} satisfies AuthOptions

export function groupModulesByType(modules: Module[]): Record<string, Module[]> {
	return modules.reduce((acc, module) => {
		if (!acc[module.type]) {
			acc[module.type] = []
		}
		acc[module.type].push(module)
		return acc
	}, {} as Record<string, Module[]>)
}
