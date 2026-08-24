import { NextRequest, NextResponse } from "next/server"

import { COOKIE_KEYS } from "@/utils/cookies/constants"

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/signup",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
]

const AUTH_ONLY_PATHS = ["/login", "/register", "/signup"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

function isAuthOnlyPath(pathname: string) {
  return AUTH_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value
  const refreshToken = request.cookies.get(COOKIE_KEYS.REFRESH_TOKEN)?.value
  const isAuthenticated = Boolean(accessToken || refreshToken)
  const isPublic = isPublicPath(pathname)

  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && isAuthOnlyPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
