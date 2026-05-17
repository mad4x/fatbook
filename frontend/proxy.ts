//export { auth as proxy } from "@/auth"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/sign-in",
  "/api",
  "/_next",
  "/FatBook_logo.svg",
  "/favicon.ico",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};