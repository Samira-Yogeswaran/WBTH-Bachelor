import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
	const token = await getToken({ req: request })
	const path = request.nextUrl.pathname

	const isPublicPath = path === '/login' || path === '/register'
	const authPaths = ['/login', '/register']

	if (isPublicPath && token) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	if (!token && !authPaths.includes(path)) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/', '/login', '/register', '/posts/:path', '/me'],
}
