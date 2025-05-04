// types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			email: string
			firstName: string
			lastName: string
		}
		accessToken: string
	}

	interface User {
		id: string
		email: string
		name: string
		firstName: string
		lastName: string
		accessToken: string
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		sub: string
		email: string
		firstName: string
		lastName: string
		accessToken: string
	}
}
