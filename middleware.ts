import NextAuth from "next-auth"
import authConfig from "./authConfig"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Only require authentication for admin routes
  if (pathname.startsWith('/admin')) {
    const isLoggedIn = !!request.auth?.user
    if (!isLoggedIn) {
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('callbackUrl', request.url)
      return Response.redirect(url)
    }
  }
  
  // For all other routes (including dashboard), just continue
  return NextResponse.next()
})

export const config = {
  // Match admin routes (require auth) and dashboard routes (no auth needed)
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/dashboard/:path*'
  ],
}