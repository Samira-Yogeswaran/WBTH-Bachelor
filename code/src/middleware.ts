// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
	const token = await getToken({ req: request })
	const path = request.nextUrl.pathname

	// Define paths
	const isPublicPath = path === '/login' || path === '/register'
	const authPaths = ['/login', '/register']

	// If already logged in and trying to access login/register, redirect to home
	if (isPublicPath && token) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	// If not logged in and trying to access protected routes, redirect to login
	if (!token && !authPaths.includes(path)) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	// Continue with the request if no redirect is needed
	return NextResponse.next()
}

// Specify which routes this middleware should run on
export const config = {
	matcher: ['/', '/login', '/register'],
}
