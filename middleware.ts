import NextAuth from "next-auth"
import authConfig from "./authConfig"
import { NextResponse } from "next/server"
// Activity logging removed from middleware for performance

const { auth } = NextAuth(authConfig)

export default auth(async function middleware() {
  // Activity logging removed from middleware for performance reasons
  // Page views will be tracked in individual page components instead
  return NextResponse.next()
})

export const config = {
  // Match all routes except static files and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}