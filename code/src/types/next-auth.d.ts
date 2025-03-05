// types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
	interface User {
		id: string
		email?: string | null
		name?: string | null
		firstName?: string
		lastName?: string
	}

	interface Session {
		user: User & {
			id: string
			email?: string | null
			name?: string | null
			firstName?: string
			lastName?: string
		}
	}
}

// Extend the JWT type if needed
declare module 'next-auth/jwt' {
	interface JWT {
		sub?: string
		email?: string
	}
}
