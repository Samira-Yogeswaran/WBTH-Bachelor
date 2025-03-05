import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/lib/supabase'

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
				const { data, error } = await supabase.auth.signInWithPassword({
					email: credentials.email,
					password: credentials.password,
				})

				if (error) {
					console.error('Authentication error:', error)
					return null
				}

				if (data.user) {
					// Transform Supabase user to NextAuth user
					return {
						id: data.user.id,
						email: data.user.email,
						name: data.user.user_metadata?.first_name || '',
					}
				}

				return null
			},
		}),
	],
	callbacks: {
		async session({ session, token }) {
			// Add user ID to the session
			session.user.id = token.sub!

			// Optionally fetch additional user metadata
			if (token.sub) {
				const { data } = await supabase
					.from('users')
					.select('first_name, last_name')
					.eq('id', token.sub)
					.single()

				if (data) {
					session.user.firstName = data.first_name
					session.user.lastName = data.last_name
				}
			}

			return session
		},
		async jwt({ token, user }) {
			// Add user ID to the token if user is available
			if (user) {
				token.sub = user.id
				token.email = user.email!
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
